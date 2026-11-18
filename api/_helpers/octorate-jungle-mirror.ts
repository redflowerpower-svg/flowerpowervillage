/**
 * 🔄 Motore Mirroring & Switch Interscambiabile: Jungle Villas (807324) <-> Flower Power Village (366879)
 *
 * Garantisce che una sola struttura sia attiva in campo alla volta (zero overbooking),
 * operando su tutte le 52 tariffe (4 Madri + 48 Derivate Sacro Graal per struttura) con:
 *  - Switch in 2 Tempi: Prima chiude/mette in standby la struttura uscente (52 tariffe), solo dopo apre l'entrante.
 *  - Regola Standby Asimmetrica:
 *      • Flower Power Village (366879) in standby -> Stop Sell 100% su tutte le 52 tariffe per 365 giorni.
 *      • Jungle Villas (807324) in standby -> Stop Sell 100% per 11 mesi (01 Ago - 30 Giu);
 *        Keep-Alive SOLO LUGLIO (01 Lug - 31 Lug) APERTO sui soli giorni liberi a prezzo 2x (< 10.000 THB) e minStay 14 notti,
 *        con mirroring bidirezionale se arrivasse una prenotazione a prezzo raddoppiato.
 */

import { toThailandDateStr } from './date-formatter.js';
import { postOctorateCalendarBulkWithRetry, parseOctorateTimestampMs } from './octorate-client.js';
import {
  JungleSourceStructureId,
  JungleTwinRoom,
  JUNGLE_TWIN_ROOMS,
  JungleRatePair,
  JUNGLE_RATE_PAIRS,
  getJungleTwinPairByRateId,
  getCompanionRateId,
  getJungleTwinRateIds,
  getJungleTwinDerivedIds,
  MIRROR_TAG,
  isMirrorReservation,
  resolveTwinByProductOrName
} from './octorate-catalog.js';
export {
  postOctorateCalendarBulkWithRetry,
  parseOctorateTimestampMs,
  JungleSourceStructureId,
  JungleTwinRoom,
  JUNGLE_TWIN_ROOMS,
  JungleRatePair,
  JUNGLE_RATE_PAIRS,
  getJungleTwinPairByRateId,
  getCompanionRateId,
  getJungleTwinRateIds,
  getJungleTwinDerivedIds,
  MIRROR_TAG,
  isMirrorReservation,
  resolveTwinByProductOrName
};

/**
 * Restituisce true SOLO per il mese di Luglio (01 Luglio -> 31 Luglio),
 * unica finestra di Keep-Alive in cui Jungle Villas (807324) in standby resta aperta
 * con prezzo raddoppiato (2x) e soggiorno minimo di 14 notti (gli altri 11 mesi sono Stop Sell 100%).
 */
export function isLowSeasonKeepAliveDate(dateStr: string): boolean {
  const mmdd = String(dateStr || '').slice(5, 10);
  if (mmdd.length !== 5) return false;
  return mmdd >= '07-01' && mmdd <= '07-31';
}

/**
 * Calcola il prezzo Keep-Alive raddoppiato (2x) per Jungle Villas (807324) in standby Bassa Stagione,
 * strettamente < 10.000 THB (cap 9.500 THB; minimo 4.580 THB per Jungle Villa, 2.580 THB per le altre 3).
 */
export function computeStandbyKeepAlivePrice(
  basePrice: number | null | undefined,
  key: JungleTwinRoom['key']
): number {
  const defaultBase = key === 'jv' ? 2290 : 1290;
  const raw = Number(basePrice);
  const validBase = raw > 0 ? raw : defaultBase;
  const minDoubled = key === 'jv' ? 4580 : 2580;
  return Math.min(9500, Math.max(Math.round(validBase * 2), minDoubled));
}

export const STANDBY_KEEPALIVE_MIN_STAY = 14;

function addDaysToIsoDate(isoStr: string, delta: number): string {
  const [y, m, d] = isoStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, (m || 1) - 1, (d || 1) + delta));
  return dt.toISOString().slice(0, 10);
}

/**
 * Spezza un intervallo minStay attorno a Luglio (01-07 .. 31-07) per preservare
 * STANDBY_KEEPALIVE_MIN_STAY (14 notti) su Jungle Villas (807324) quando è in standby.
 */
export function expandMinStayEntryWithStandbyKeepAlive(
  roomId: number,
  dateFrom: string,
  dateTo: string,
  minStay: number,
  activeJungleSource: JungleSourceStructureId
): Array<{ room: number; dateFrom: string; dateTo: string; values: { minstay: number } }> {
  const numRoomId = Number(roomId);
  if (!dateFrom || !dateTo || dateFrom > dateTo) return [];

  const pair = getJungleTwinPairByRateId(numRoomId);
  if (!pair || pair.jungleId !== numRoomId || activeJungleSource !== '366879') {
    return [{ room: numRoomId, dateFrom, dateTo, values: { minstay: minStay } }];
  }

  const startYear = Number(dateFrom.slice(0, 4));
  const endYear = Number(dateTo.slice(0, 4));
  if (isNaN(startYear) || isNaN(endYear)) {
    return [{ room: numRoomId, dateFrom, dateTo, values: { minstay: minStay } }];
  }

  const segments: Array<{ room: number; dateFrom: string; dateTo: string; values: { minstay: number } }> = [];
  let cursor = dateFrom;

  for (let y = startYear; y <= endYear; y++) {
    const julyStart = `${y}-07-01`;
    const julyEnd = `${y}-07-31`;
    if (julyEnd < cursor) continue;
    if (julyStart > dateTo) break;

    if (cursor < julyStart) {
      segments.push({
        room: numRoomId,
        dateFrom: cursor,
        dateTo: addDaysToIsoDate(julyStart, -1),
        values: { minstay: minStay }
      });
      cursor = julyStart;
    }

    const keepAliveEnd = julyEnd < dateTo ? julyEnd : dateTo;
    if (cursor <= keepAliveEnd) {
      segments.push({
        room: numRoomId,
        dateFrom: cursor,
        dateTo: keepAliveEnd,
        values: { minstay: Math.max(STANDBY_KEEPALIVE_MIN_STAY, minStay) }
      });
      cursor = addDaysToIsoDate(keepAliveEnd, 1);
    }
  }

  if (cursor <= dateTo) {
    segments.push({
      room: numRoomId,
      dateFrom: cursor,
      dateTo,
      values: { minstay: minStay }
    });
  }

  return segments;
}

const ACTIVE_SOURCE_CONFIG_ID = 'active_jungle_source_v1';
const STANDBY_SYNC_LOCK_ID = 'standby_calendar_sync_lock_v1';
const STANDBY_SYNC_COOLDOWN_MS = 15 * 60 * 1000;
let lastStandbySyncTimestampMs = 0;

async function markStandbySyncCompleted(supabaseAdmin: any): Promise<void> {
  const nowMs = Date.now();
  lastStandbySyncTimestampMs = nowMs;
  if (!supabaseAdmin) return;
  try {
    await supabaseAdmin.from('telegram_config').upsert({
      id: STANDBY_SYNC_LOCK_ID,
      bot_token: String(nowMs),
      chat_id: 'standby_sync_lock',
      updated_at: new Date(nowMs).toISOString()
    });
  } catch (err) {
    console.warn('[JUNGLE MIRROR] Standby sync lock upsert warning:', err);
  }
}

export async function getActiveJungleSource(supabaseAdmin: any): Promise<JungleSourceStructureId> {
  if (!supabaseAdmin) return '807324';
  try {
    const { data } = await supabaseAdmin
      .from('telegram_config')
      .select('bot_token')
      .eq('id', ACTIVE_SOURCE_CONFIG_ID)
      .maybeSingle();
    if (data?.bot_token === '366879') return '366879';
  } catch {
    // fallback sicuro su Jungle Villas attiva
  }
  return '807324';
}

export async function setActiveJungleSource(
  supabaseAdmin: any,
  target: JungleSourceStructureId
): Promise<void> {
  if (!supabaseAdmin) return;
  await supabaseAdmin.from('telegram_config').upsert({
    id: ACTIVE_SOURCE_CONFIG_ID,
    bot_token: target,
    chat_id: target === '366879' ? 'Flower Power Village' : 'Jungle Villas',
    updated_at: new Date().toISOString()
  });
}

export interface MirrorParams {
  supabaseAdmin: any;
  accessToken: string;
  sourceStructureId: string;
  sourceReservationId: string | number;
  productId?: number | string | null;
  roomName?: string | null;
  checkIn: string;
  checkOut: string;
  guestName: string;
  isCancelled: boolean;
  channelId?: number | string | null;
  channelRefer?: string | null;
  channelName?: string | null;
  color?: string | null;
  totalGross?: number | null;
  origPrivateNotes?: string | null;
}

/**
 * Specchia una prenotazione (creazione o cancellazione) in modo BIDIREZIONALE tra
 * Jungle Villas (807324) e Flower Power Village (366879), coprendo sia prenotazioni sulla
 * struttura attiva sia eventuali prenotazioni Keep-Alive 2x su Jungle Villas in standby,
 * con doppia protezione anti-loop tramite MIRROR_TAG e registro inverso Supabase.
 */
/**
 * Cancella una prenotazione su Octorate tramite DELETE con fallback PATCH status=CANCELLED.
 */
async function cancelOctorateReservationDirect(
  accessToken: string,
  structureId: string,
  reservationId: string,
  privateNotes: string
): Promise<void> {
  const delRes = await fetch(
    `https://api.octorate.com/connect/rest/v1/reservation/${structureId}/${reservationId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
    }
  );
  if (!delRes.ok) {
    await fetch(
      `https://api.octorate.com/connect/rest/v1/reservation/${structureId}/${reservationId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          status: 'CANCELLED',
          privateNotes
        })
      }
    );
  }
}

/**
 * Salva e logga eventuali errori del mapping bidirezionale mirror_res / mirror_target su Supabase.
 */
async function upsertMirrorMapping(
  supabaseAdmin: any,
  srcStruct: string,
  sourceReservationId: string,
  targetStructureId: string,
  targetReservationId: string
): Promise<void> {
  if (!supabaseAdmin) return;
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin.from('telegram_config').upsert([
    {
      id: `mirror_res_${srcStruct}_${sourceReservationId}`,
      bot_token: String(targetStructureId),
      chat_id: String(targetReservationId),
      updated_at: now
    },
    {
      id: `mirror_target_${targetStructureId}_${targetReservationId}`,
      bot_token: String(srcStruct),
      chat_id: String(sourceReservationId),
      updated_at: now
    }
  ]);
  if (error) {
    console.warn(`[JUNGLE MIRROR] Errore salvataggio mapping Supabase per #${sourceReservationId} -> #${targetReservationId}:`, error);
  }
}

function shiftIsoDays(isoDate: string, deltaDays: number): string {
  const base = new Date(`${String(isoDate).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(base.getTime())) return String(isoDate).slice(0, 10);
  base.setUTCDate(base.getUTCDate() + deltaDays);
  return base.toISOString().slice(0, 10);
}

/**
 * Cerca su Octorate (struttura target) eventuali mirror attivi già creati per sourceReservationId,
 * restituendo un solo ID canonico (preferendo refer esatto MIRROR-<id>) ed eventuali copie duplicate extra.
 */
async function findExistingMirrorsOnTarget(params: {
  accessToken: string;
  srcStruct: string;
  sourceReservationId: string;
  targetStructureId: JungleSourceStructureId;
  checkInDate: string;
  checkOutDate: string;
}): Promise<{ canonicalId: string | null; extraDuplicateIds: string[] }> {
  const { accessToken, srcStruct, sourceReservationId, targetStructureId, checkInDate, checkOutDate } = params;
  const startDate = shiftIsoDays(checkInDate, -1);
  const endDate = shiftIsoDays(checkOutDate, 1);
  const canonicalRefer = `MIRROR-${sourceReservationId}`.slice(0, 25);
  const referPrefix = `MIRROR-${sourceReservationId}-`;
  const origMarkerRegex = new RegExp(`Orig:\\s*${srcStruct}\\s*#${sourceReservationId}(?:\\D|$)`);

  const matches: Array<{ id: string; refer: string }> = [];
  for (let page = 0; page < 5; page++) {
    const url = `https://api.octorate.com/connect/rest/v1/reservation/${targetStructureId}?type=STAY&startDate=${startDate}&endDate=${endDate}&size=50&page=${page}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
    }).catch(() => null);
    if (!res || !res.ok) break;
    const json: any = await res.json().catch(() => ({}));
    const rows: any[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
    if (rows.length === 0) break;

    for (const r of rows) {
      const status = String(r.status || '').toUpperCase();
      if (status === 'CANCELLED' || status === 'CANCELED') continue;
      const refer = String(r.refer || '');
      const notes = String(r.privateNotes || '');
      const isMatch =
        refer === canonicalRefer ||
        refer.startsWith(referPrefix) ||
        origMarkerRegex.test(notes);
      if (isMatch && r.id) {
        matches.push({ id: String(r.id), refer });
      }
    }
    if (rows.length < 50) break;
  }

  if (matches.length === 0) {
    return { canonicalId: null, extraDuplicateIds: [] };
  }

  // Preferisce la copia con refer canonico esatto MIRROR-<id>, altrimenti l'ID numerico più vecchio
  matches.sort((a, b) => {
    const aCanon = a.refer === canonicalRefer ? 0 : 1;
    const bCanon = b.refer === canonicalRefer ? 0 : 1;
    if (aCanon !== bCanon) return aCanon - bCanon;
    return Number(a.id) - Number(b.id);
  });

  const [canonical, ...extras] = matches;
  const seen = new Set<string>([canonical.id]);
  const extraDuplicateIds: string[] = [];
  for (const ex of extras) {
    if (!seen.has(ex.id)) {
      seen.add(ex.id);
      extraDuplicateIds.push(ex.id);
    }
  }
  return { canonicalId: canonical.id, extraDuplicateIds };
}

/**
 * Cancella uno specchio esistente su Octorate (struttura target) e ripulisce il mapping Supabase.
 */
async function cancelExistingMirrorReservation(params: {
  supabaseAdmin: any;
  accessToken: string;
  srcStruct: string;
  sourceReservationId: string;
  targetStructureId: JungleSourceStructureId;
  existingMirrorId: string;
  reasonNote: string;
}): Promise<void> {
  const {
    supabaseAdmin,
    accessToken,
    srcStruct,
    sourceReservationId,
    targetStructureId,
    existingMirrorId,
    reasonNote
  } = params;

  await cancelOctorateReservationDirect(
    accessToken,
    targetStructureId,
    existingMirrorId,
    `${MIRROR_TAG} ${reasonNote} (${srcStruct} #${sourceReservationId})`
  );

  if (supabaseAdmin) {
    const mapKey = `mirror_res_${srcStruct}_${sourceReservationId}`;
    const reverseKey = `mirror_target_${targetStructureId}_${existingMirrorId}`;
    await supabaseAdmin.from('telegram_config').delete().in('id', [mapKey, reverseKey]);
  }
}

export async function mirrorReservationToStandby(params: MirrorParams): Promise<{
  mirrored: boolean;
  action?: 'created' | 'cancelled' | 'skipped';
  targetStructureId?: string;
  targetReservationId?: string;
  reason?: string;
}> {
  const {
    supabaseAdmin,
    accessToken,
    sourceStructureId,
    sourceReservationId,
    productId,
    roomName,
    checkIn,
    checkOut,
    guestName,
    isCancelled,
    channelId,
    channelRefer,
    channelName,
    color,
    totalGross,
    origPrivateNotes
  } = params;

  const srcStruct = String(sourceStructureId);
  if (srcStruct !== '807324' && srcStruct !== '366879') {
    return { mirrored: false, action: 'skipped', reason: `Structure ${srcStruct} does not participate in Jungle mirror` };
  }

  // Anti-loop: se questa reservation ID risulta già creata come specchio, ignora subito
  const reverseKey = `mirror_target_${srcStruct}_${sourceReservationId}`;
  if (supabaseAdmin) {
    const { data: revData } = await supabaseAdmin
      .from('telegram_config')
      .select('id')
      .eq('id', reverseKey)
      .maybeSingle();
    if (revData?.id) {
      return { mirrored: false, action: 'skipped', reason: 'Source reservation is itself a created mirror (anti-loop)' };
    }
  }

  const targetStructureId: JungleSourceStructureId = srcStruct === '807324' ? '366879' : '807324';
  const mapKey = `mirror_res_${srcStruct}_${sourceReservationId}`;
  const checkInDate = String(checkIn).slice(0, 10);
  const checkOutDate = String(checkOut).slice(0, 10);

  let existingMirrorId: string | null = null;
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('telegram_config')
      .select('chat_id')
      .eq('id', mapKey)
      .maybeSingle();
    if (data?.chat_id) existingMirrorId = String(data.chat_id);
  }

  // Fallback Idempotenza Live su Octorate:
  // - Se Supabase non ha il mapping, cerca copie già attive su targetStructureId prima di procedere.
  // - Se isCancelled === true, verifica SEMPRE live anche quando Supabase ha un vecchio mapping (evita mapping obsoleti).
  let recoveredMirrors: { canonicalId: string | null; extraDuplicateIds: string[] } = {
    canonicalId: null,
    extraDuplicateIds: []
  };
  if ((!existingMirrorId || isCancelled) && checkInDate && checkOutDate) {
    recoveredMirrors = await findExistingMirrorsOnTarget({
      accessToken,
      srcStruct,
      sourceReservationId,
      targetStructureId,
      checkInDate,
      checkOutDate
    });
    if (!isCancelled && recoveredMirrors.extraDuplicateIds.length > 0) {
      for (const dupId of recoveredMirrors.extraDuplicateIds) {
        await cancelOctorateReservationDirect(
          accessToken,
          targetStructureId,
          dupId,
          `${MIRROR_TAG} Auto-deduplicated duplicate mirror for (${srcStruct} #${sourceReservationId})`
        );
      }
    }
    if (!existingMirrorId && recoveredMirrors.canonicalId) {
      existingMirrorId = recoveredMirrors.canonicalId;
      console.log(`[JUNGLE MIRROR] Mapping recuperato live da Octorate: #${sourceReservationId} -> #${existingMirrorId}`);
    }
  }

  const twin = resolveTwinByProductOrName(productId, roomName);
  if (!twin) {
    // Se la prenotazione è stata spostata fuori dalle 4 ville (es. Fake Bungalow 1), cancella l'eventuale specchio esistente
    if (existingMirrorId) {
      await cancelExistingMirrorReservation({
        supabaseAdmin,
        accessToken,
        srcStruct,
        sourceReservationId,
        targetStructureId,
        existingMirrorId,
        reasonNote: 'Moved out of twin room'
      });
      return {
        mirrored: true,
        action: 'cancelled',
        targetStructureId,
        targetReservationId: existingMirrorId,
        reason: 'Moved out of twin room to non-twin room'
      };
    }
    return { mirrored: false, action: 'skipped', reason: 'Not a Jungle/Peace&Love twin room' };
  }

  const targetMotherId = targetStructureId === '366879' ? twin.fpvMotherId : twin.jungleMotherId;

  if (isCancelled) {
    const allMirrorIdsToCancel = Array.from(
      new Set(
        [existingMirrorId, recoveredMirrors.canonicalId, ...recoveredMirrors.extraDuplicateIds].filter(
          (v): v is string => Boolean(v)
        )
      )
    );
    if (allMirrorIdsToCancel.length === 0) {
      if (supabaseAdmin) {
        await supabaseAdmin.from('telegram_config').delete().eq('id', mapKey);
      }
      return { mirrored: false, action: 'skipped', reason: 'No existing mirror reservation to cancel' };
    }
    for (const mId of allMirrorIdsToCancel) {
      await cancelExistingMirrorReservation({
        supabaseAdmin,
        accessToken,
        srcStruct,
        sourceReservationId,
        targetStructureId,
        existingMirrorId: mId,
        reasonNote: 'Cancelled from'
      });
    }
    return {
      mirrored: true,
      action: 'cancelled',
      targetStructureId,
      targetReservationId: allMirrorIdsToCancel[0]
    };
  }

  if (existingMirrorId) {
    await upsertMirrorMapping(supabaseAdmin, srcStruct, sourceReservationId, targetStructureId, existingMirrorId);
  }

  const numChannelId = Number(channelId || 233);

  let effectiveColor = color;
  let effectiveGross = totalGross;
  let effectiveOrigNotes = origPrivateNotes;
  if (!isCancelled && (!effectiveColor || effectiveGross === undefined || effectiveGross === null || !effectiveOrigNotes)) {
    try {
      const srcRes = await fetch(
        `https://api.octorate.com/connect/rest/v1/reservation/${srcStruct}/${sourceReservationId}`,
        { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } }
      ).catch(() => null);
      if (srcRes && srcRes.ok) {
        const srcData: any = await srcRes.json().catch(() => null);
        if (srcData) {
          if (!effectiveColor && srcData.color) {
            effectiveColor = String(srcData.color);
          }
          if (effectiveGross === undefined || effectiveGross === null) {
            const parsedGross = Number(srcData.totalGross ?? srcData.roomGross ?? 0);
            if (parsedGross > 0) effectiveGross = parsedGross;
          }
          if (!effectiveOrigNotes && srcData.privateNotes) {
            effectiveOrigNotes = String(srcData.privateNotes);
          }
        }
      }
    } catch {
      // fallback ai valori già passati
    }
  }

  let cleanOrigNotes = String(effectiveOrigNotes || '').trim();
  if (cleanOrigNotes.includes(MIRROR_TAG)) {
    const notesIdx = cleanOrigNotes.indexOf('| Notes:');
    cleanOrigNotes = notesIdx >= 0 ? cleanOrigNotes.slice(notesIdx + 8).trim() : '';
  }

  const normEffectiveColor = effectiveColor ? String(effectiveColor).trim().toLowerCase() : '';
  const hasValidEffectiveColor = Boolean(normEffectiveColor && /^#[0-9a-f]{6}$/.test(normEffectiveColor));
  const numericGross = effectiveGross && Number(effectiveGross) > 0 ? Number(effectiveGross) : 0;

  if (existingMirrorId) {
    // Verifica se la copia esistente ha ancora stesse date, stessa villa, canale OTA, colore e importo allineati
    const checkRes = await fetch(
      `https://api.octorate.com/connect/rest/v1/reservation/${targetStructureId}/${existingMirrorId}`,
      { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } }
    ).catch(() => null);

    if (checkRes && checkRes.ok) {
      const existingData: any = await checkRes.json().catch(() => ({}));
      const exStatus = String(existingData?.status || '').toUpperCase();
      const exIn = toThailandDateStr(existingData?.checkin);
      const exOut = toThailandDateStr(existingData?.checkout);
      const exProd = Number(existingData?.product || 0);
      const exCh = Number(existingData?.channelId || 233);
      const exColor = String(existingData?.color || '').trim().toLowerCase();
      const exGross = Number(existingData?.totalGross ?? existingData?.roomGross ?? 0);

      const isColorAligned = !hasValidEffectiveColor || exColor === normEffectiveColor;
      const isGrossAligned = numericGross <= 0 || Math.abs(exGross - numericGross) < 0.01;

      const isUpToDate =
        exStatus !== 'CANCELLED' &&
        exStatus !== 'CANCELED' &&
        exIn === checkInDate &&
        exOut === checkOutDate &&
        exProd === targetMotherId &&
        (exCh === numChannelId || numChannelId === 233) &&
        isColorAligned &&
        isGrossAligned;

      if (isUpToDate) {
        return {
          mirrored: false,
          action: 'skipped',
          targetStructureId,
          targetReservationId: existingMirrorId,
          reason: 'Already mirrored and up-to-date'
        };
      }
    }

    // Se date, villa, canale, colore o prezzo sono cambiati, rimuove la vecchia copia prima di ricrearla aggiornata
    await cancelExistingMirrorReservation({
      supabaseAdmin,
      accessToken,
      srcStruct,
      sourceReservationId: String(sourceReservationId),
      targetStructureId,
      existingMirrorId,
      reasonNote: 'Updated dates/room/channel/style from'
    });
  }

  const nameParts = String(guestName || 'Guest').trim().split(/\s+/);
  const firstName = nameParts[0] || 'Guest';
  const lastName = nameParts.slice(1).join(' ') || 'Guest';
  const nowIso = new Date().toISOString();
  const directColor =
    effectiveColor && /^#[0-9a-fA-F]{6}$/.test(String(effectiveColor).trim())
      ? String(effectiveColor).trim()
      : undefined;

  const baseMirrorNotes = `${MIRROR_TAG} Agency: ${channelName || 'Direct'} | Ref: ${channelRefer || sourceReservationId} | Orig: ${srcStruct} #${sourceReservationId} (${twin.name})`;
  const fullMirrorNotes = cleanOrigNotes
    ? `${baseMirrorNotes} | Notes: ${cleanOrigNotes.replace(/\r?\n/g, ' / ')}`
    : baseMirrorNotes;

  const basePayload = {
    status: 'CONFIRMED',
    channelId: numChannelId,
    ...(directColor ? { color: directColor } : {}),
    ...(numericGross > 0
      ? {
        roomGross: numericGross,
        totalGross: numericGross,
        priceBreakdown: [
          { type: 'ROOM_NET', price: numericGross, included: true, manual: true, group: false },
          { type: 'VAT', price: 0, included: true, manual: true, group: false }
        ]
      }
      : {}),
    product: targetMotherId,
    checkin: `${checkInDate}T14:00:00Z`,
    checkout: `${checkOutDate}T12:00:00Z`,
    createTime: nowIso,
    updateTime: nowIso,
    privateNotes: fullMirrorNotes,
    guests: [
      {
        type: 'BOOKER',
        givenName: firstName,
        familyName: lastName,
        checkin: checkInDate,
        checkout: checkOutDate
      }
    ],
    totalGuest: 2,
    totalChildren: 0,
    totalInfants: 0
  };

  let res = await fetch(
    `https://api.octorate.com/connect/rest/v1/reservation/${targetStructureId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        ...basePayload,
        refer: `MIRROR-${sourceReservationId}`.slice(0, 25),
        ...(channelRefer ? { channelRefer: String(channelRefer) } : {})
      })
    }
  );

  if (!res.ok && res.status === 400) {
    // Prima di ritentare con un refer alternativo, verifica se la 400 è dovuta a un mirror attivo già esistente (race condition / mapping mancante)
    const conflictCheck = await findExistingMirrorsOnTarget({
      accessToken,
      srcStruct,
      sourceReservationId,
      targetStructureId,
      checkInDate,
      checkOutDate
    });
    for (const dupId of conflictCheck.extraDuplicateIds) {
      await cancelOctorateReservationDirect(
        accessToken,
        targetStructureId,
        dupId,
        `${MIRROR_TAG} Auto-deduplicated on 400 conflict (${srcStruct} #${sourceReservationId})`
      );
    }
    if (conflictCheck.canonicalId) {
      await upsertMirrorMapping(supabaseAdmin, srcStruct, sourceReservationId, targetStructureId, conflictCheck.canonicalId);
      return {
        mirrored: false,
        action: 'skipped',
        targetStructureId,
        targetReservationId: conflictCheck.canonicalId,
        reason: 'Active mirror already exists on Octorate (resolved on 400 conflict)'
      };
    }

    const suffix = Date.now().toString(36).slice(-3);
    res = await fetch(
      `https://api.octorate.com/connect/rest/v1/reservation/${targetStructureId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          ...basePayload,
          refer: `MIRROR-${sourceReservationId}-${suffix}`.slice(0, 25),
          ...(channelRefer ? { channelRefer: `${channelRefer}-M` } : {})
        })
      }
    );
  }

  const json = await res.json().catch(() => ({}));
  const newId = json?.id || json?.data?.id || json?.reservationId;
  if (!res.ok || !newId) {
    throw new Error(`Mirror POST failed (${res.status}): ${JSON.stringify(json).slice(0, 300)}`);
  }

  await upsertMirrorMapping(supabaseAdmin, srcStruct, sourceReservationId, targetStructureId, String(newId));

  return {
    mirrored: true,
    action: 'created',
    targetStructureId,
    targetReservationId: String(newId)
  };
}

// ── Tipi e Utility per compressione e invio Bulk su tutte le 52 tariffe ──────────

interface DailyBulkEntry {
  room: number;
  date: string; // YYYY-MM-DD
  values: Record<string, any>;
}

interface CompressedBulkBlock {
  room: number;
  dateFrom: string;
  dateTo: string;
  values: Record<string, any>;
}

interface SnapshotDay {
  date: string;
  availability: number;
  price?: number;
  stopSells: boolean;
  closed: boolean;
  closedArrival: boolean;
  closedDeparture: boolean;
  minstay?: number;
}

function addOneDayISO(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
  dt.setUTCDate(dt.getUTCDate() + 1);
  return dt.toISOString().slice(0, 10);
}

/**
 * Comprime righe giornaliere con valori identici e date consecutive in singoli range `{ room, dateFrom, dateTo, values }`
 * riducendo ~19.000 righe giornaliere a poche centinaia di blocchi senza alterare alcun dato.
 */
function compressDailyBulkItems(entries: DailyBulkEntry[]): CompressedBulkBlock[] {
  if (entries.length === 0) return [];

  const byRoom = new Map<number, DailyBulkEntry[]>();
  for (const e of entries) {
    const list = byRoom.get(e.room) || [];
    list.push(e);
    byRoom.set(e.room, list);
  }

  const blocks: CompressedBulkBlock[] = [];
  for (const [room, list] of byRoom.entries()) {
    list.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

    let curFrom = list[0].date;
    let curTo = list[0].date;
    let curValues = list[0].values;
    let curSig = JSON.stringify(curValues);

    for (let i = 1; i < list.length; i++) {
      const next = list[i];
      if (next.date === curTo) continue; // ignora eventuale duplicato dello stesso giorno
      const nextSig = JSON.stringify(next.values);
      if (next.date === addOneDayISO(curTo) && nextSig === curSig) {
        curTo = next.date;
      } else {
        blocks.push({ room, dateFrom: curFrom, dateTo: curTo, values: curValues });
        curFrom = next.date;
        curTo = next.date;
        curValues = next.values;
        curSig = nextSig;
      }
    }
    blocks.push({ room, dateFrom: curFrom, dateTo: curTo, values: curValues });
  }

  return blocks;
}

/**
 * Restituisce true se la tariffa della villa gemella deve restare chiusa (Stop Sell) per regola di canale o alta stagione.
 */
export function shouldTwinRateStayClosedOnDate(pair: JungleRatePair, dateStr: string): boolean {
  if (pair.isClosedAc) return true;
  if (pair.isStandard7d && dateStr >= '2026-12-26' && dateStr <= '2027-03-31') return true;
  if (pair.label.includes('Main bnb-14d') && dateStr >= '2027-01-26' && dateStr <= '2027-05-31') return true;
  return false;
}

function isBookingCancelledStatus(b: any): boolean {
  const st = String(b?.status || '').toUpperCase().trim();
  return (
    st === 'CANCELLED' ||
    st === 'CANCELED' ||
    st === 'DELETED' ||
    st === 'VOID' ||
    st === 'REJECTED' ||
    Boolean(b?.cancelled) ||
    Boolean(b?.isCancelled)
  );
}

/**
 * Raccoglie l'insieme delle notti occupate [checkIn, checkOut) per ciascuna delle 4 ville gemelle
 * partendo dalle prenotazioni attive reali (non-mirror).
 */
export function collectOccupiedDatesByTwinKey(
  nonMirrorBookings: any[]
): Record<JungleTwinRoom['key'], Set<string>> {
  const occupied: Record<JungleTwinRoom['key'], Set<string>> = {
    jv: new Set<string>(),
    jvl: new Set<string>(),
    jvr: new Set<string>(),
    pl: new Set<string>()
  };

  for (const b of nonMirrorBookings || []) {
    if (!b || isMirrorReservation(b) || isBookingCancelledStatus(b)) continue;
    const twin = resolveTwinByProductOrName(
      b.product || b.pmsProduct || b.accommodation_id || b.roomId || b.roomTypeId,
      b.roomName || b.accommodation_name || b.room_name
    );
    if (!twin) continue;

    const rawIn = String(b.checkin || b.checkIn || b.check_in || b.startDate || '').slice(0, 10);
    const rawOut = String(b.checkout || b.checkOut || b.check_out || b.endDate || '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(rawIn) || !/^\d{4}-\d{2}-\d{2}$/.test(rawOut) || rawIn >= rawOut) {
      continue;
    }

    let cur = rawIn;
    let guard = 0;
    while (cur < rawOut && guard++ < 800) {
      occupied[twin.key].add(cur);
      cur = addOneDayISO(cur);
    }
  }

  return occupied;
}

/**
 * Verifica se la villa gemella `key` è occupata nella notte `dateStr` (includendo il legame Suite JV <-> Left/Right).
 */
export function isTwinKeyOccupiedOnDate(
  occupied: Record<JungleTwinRoom['key'], Set<string>>,
  key: JungleTwinRoom['key'],
  dateStr: string
): boolean {
  if (key === 'jv') {
    return occupied.jv.has(dateStr) || occupied.jvl.has(dateStr) || occupied.jvr.has(dateStr);
  }
  if (key === 'jvl') {
    return occupied.jvl.has(dateStr) || occupied.jv.has(dateStr);
  }
  if (key === 'jvr') {
    return occupied.jvr.has(dateStr) || occupied.jv.has(dateStr);
  }
  return occupied.pl.has(dateStr);
}

function isTwinKeyLockedOnDate(
  closedLocks: Array<{ roomKey: string; dateFrom: string; dateTo: string; enabled?: boolean }> | undefined,
  key: JungleTwinRoom['key'],
  dateStr: string
): boolean {
  if (!closedLocks || closedLocks.length === 0) return false;
  const relatedKeys =
    key === 'jv'
      ? new Set(['jv', 'jvl', 'jvr'])
      : key === 'jvl' || key === 'jvr'
        ? new Set([key, 'jv'])
        : new Set([key]);

  return closedLocks.some(
    l => l && l.enabled !== false && relatedKeys.has(String(l.roomKey)) && dateStr >= l.dateFrom && dateStr <= l.dateTo
  );
}

/**
 * Funzione pura/deterministica: dopo una cancellazione su una delle 4 ville gemelle,
 * individua le notti effettivamente libere in [checkInDate, checkOutDate) (escludendo altre prenotazioni e Hard-Lock),
 * aggiorna in memoria `calendarItems` sulla struttura attiva a latenza zero e restituisce i blocchi /calendar/bulk da riaprire.
 */
export function patchCalendarItemsForFreedTwinDates(params: {
  activeJungleSource: JungleSourceStructureId;
  twinKey: JungleTwinRoom['key'];
  checkInDate: string;
  checkOutDate: string;
  nonMirrorBookings: any[];
  calendarItems: any[];
  closedLocks?: Array<{ roomKey: string; dateFrom: string; dateTo: string; enabled?: boolean }>;
}): CompressedBulkBlock[] {
  const { activeJungleSource, twinKey, checkInDate, checkOutDate, nonMirrorBookings, calendarItems, closedLocks } = params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkInDate) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOutDate) || checkInDate >= checkOutDate) {
    return [];
  }

  const affectedKeys: JungleTwinRoom['key'][] =
    twinKey === 'jv' ? ['jv', 'jvl', 'jvr'] : twinKey === 'jvl' || twinKey === 'jvr' ? [twinKey, 'jv'] : ['pl'];

  const occupied = collectOccupiedDatesByTwinKey(nonMirrorBookings);

  const calById = new Map<number, any>();
  const dayByRateDate = new Map<string, any>();
  for (const ci of calendarItems || []) {
    const idNum = Number(ci?.id);
    if (!idNum || calById.has(idNum)) continue;
    calById.set(idNum, ci);
    if (Array.isArray(ci.days)) {
      for (const d of ci.days) {
        const dStr = String(d?.date || d?.day || '').slice(0, 10);
        if (dStr) dayByRateDate.set(`${idNum}_${dStr}`, d);
      }
    }
  }

  const entries: DailyBulkEntry[] = [];

  for (const key of affectedKeys) {
    const pairs = JUNGLE_RATE_PAIRS.filter(p => p.key === key);
    let cur = checkInDate;
    let guard = 0;

    while (cur < checkOutDate && guard++ < 800) {
      if (!isTwinKeyOccupiedOnDate(occupied, key, cur) && !isTwinKeyLockedOnDate(closedLocks, key, cur)) {
        for (const pair of pairs) {
          if (shouldTwinRateStayClosedOnDate(pair, cur)) continue;
          const rateId = activeJungleSource === '366879' ? pair.fpvId : pair.jungleId;
          const dayObj = dayByRateDate.get(`${rateId}_${cur}`);

          const curAvail = dayObj ? Number(dayObj.availability ?? 0) : 0;
          const curClosed = dayObj ? (dayObj.stopSells === true || dayObj.closed === true) : true;

          if (pair.isMother) {
            const needsAvail = curAvail <= 0;
            if (dayObj) {
              dayObj.availability = Math.max(1, curAvail);
              dayObj.stopSells = false;
              dayObj.closed = false;
            }
            if (needsAvail || curClosed) {
              entries.push({
                room: rateId,
                date: cur,
                values: {
                  ...(needsAvail ? { availability: 1 } : {}),
                  stopSells: false,
                  closed: false,
                  closeToArrival: false,
                  closeToDeparture: false
                }
              });
            }
          } else {
            if (dayObj) {
              dayObj.stopSells = false;
              dayObj.closed = false;
            }
            if (curClosed) {
              entries.push({
                room: rateId,
                date: cur,
                values: {
                  stopSells: false,
                  closed: false,
                  closeToArrival: false,
                  closeToDeparture: false
                }
              });
            }
          }
        }
      }
      cur = addOneDayISO(cur);
    }
  }

  return compressDailyBulkItems(entries);
}

/**
 * Riapre su Octorate (solo sulla struttura attiva) le date effettivamente liberate da una cancellazione
 * su una delle 4 ville gemelle e aggiorna in memoria `calendarItems` a latenza zero.
 */
export async function reopenFreedTwinDatesOnActiveStructure(params: {
  accessToken: string;
  clientId?: string;
  activeJungleSource: JungleSourceStructureId;
  twinKey: JungleTwinRoom['key'];
  checkInDate: string;
  checkOutDate: string;
  nonMirrorBookings: any[];
  calendarItems: any[];
  closedLocks?: Array<{ roomKey: string; dateFrom: string; dateTo: string; enabled?: boolean }>;
}): Promise<{ blocksSent: number }> {
  const blocks = patchCalendarItemsForFreedTwinDates(params);
  if (blocks.length === 0) {
    return { blocksSent: 0 };
  }

  const chunkSize = 250;
  const chunks: CompressedBulkBlock[][] = [];
  for (let i = 0; i < blocks.length; i += chunkSize) {
    chunks.push(blocks.slice(i, i + chunkSize));
  }

  await postOctorateCalendarBulkWithRetry(
    {
      Authorization: `Bearer ${params.accessToken}`,
      ...(params.clientId ? { 'Octorate-Api-Key': params.clientId } : {}),
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    chunks,
    { logPrefix: '[JUNGLE REOPEN]' }
  );

  return { blocksSent: blocks.length };
}

const sleepMs = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

function buildOverlaySnapshot(
  baseSnapshot: Map<number, Map<string, SnapshotDay>>,
  appliedEntries: DailyBulkEntry[]
): Map<number, Map<string, SnapshotDay>> {
  const next = new Map<number, Map<string, SnapshotDay>>();
  for (const [room, daysMap] of baseSnapshot.entries()) {
    const clonedDays = new Map<string, SnapshotDay>();
    for (const [dStr, dVal] of daysMap.entries()) {
      clonedDays.set(dStr, { ...dVal });
    }
    next.set(room, clonedDays);
  }
  for (const e of appliedEntries) {
    let daysMap = next.get(e.room);
    if (!daysMap) {
      daysMap = new Map<string, SnapshotDay>();
      next.set(e.room, daysMap);
    }
    const prev = daysMap.get(e.date);
    const v = e.values;
    daysMap.set(e.date, {
      date: e.date,
      availability: v.availability !== undefined ? Number(v.availability) : (prev?.availability ?? 0),
      price: v.price !== undefined ? Number(v.price) : prev?.price,
      stopSells: v.stopSells !== undefined ? Boolean(v.stopSells) : (prev?.stopSells ?? false),
      closed: v.closed !== undefined ? Boolean(v.closed) : (prev?.closed ?? false),
      closedArrival: v.closedArrival !== undefined ? Boolean(v.closedArrival) : (prev?.closedArrival ?? false),
      closedDeparture: v.closedDeparture !== undefined ? Boolean(v.closedDeparture) : (prev?.closedDeparture ?? false),
      minstay: v.minstay !== undefined ? Number(v.minstay) : prev?.minstay
    });
  }
  return next;
}

/**
 * Filtra solo le righe giornaliere effettivamente diverse dallo snapshot attuale su Octorate,
 * confrontando i soli 4 campi reali restituiti da GET /calendar (`availability`, `price`, `stopSells`, `minstay`)
 * e costruendo un payload Delta-Only (con i soli campi variati) per massimizzare la compressione dei blocchi.
 */
function filterChangedDailyEntries(
  entries: DailyBulkEntry[],
  existingSnapshot: Map<number, Map<string, SnapshotDay>>
): DailyBulkEntry[] {
  const result: DailyBulkEntry[] = [];

  for (const e of entries) {
    const cur = existingSnapshot.get(e.room)?.get(e.date);
    if (!cur) {
      result.push(e);
      continue;
    }

    const v = e.values;
    const deltaValues: Record<string, any> = {};

    if (v.availability !== undefined && Number(cur.availability) !== Number(v.availability)) {
      deltaValues.availability = v.availability;
    }
    if (v.price !== undefined && Math.abs(Number(cur.price ?? -1) - Number(v.price)) > 0.01) {
      deltaValues.price = v.price;
    }
    if (v.minstay !== undefined && Number(cur.minstay ?? 0) !== Number(v.minstay)) {
      deltaValues.minstay = v.minstay;
    }
    if (v.stopSells !== undefined && cur.stopSells !== Boolean(v.stopSells)) {
      deltaValues.stopSells = v.stopSells;
      if (v.closed !== undefined) deltaValues.closed = v.closed;
      if (v.closedArrival !== undefined) deltaValues.closedArrival = v.closedArrival;
      if (v.closedDeparture !== undefined) deltaValues.closedDeparture = v.closedDeparture;
    }

    if (Object.keys(deltaValues).length > 0) {
      result.push({ room: e.room, date: e.date, values: deltaValues });
    }
  }

  return result;
}

async function postCalendarBulkBlocks(
  accessToken: string,
  blocks: CompressedBulkBlock[],
  options?: { onFirstChunkSuccess?: () => void }
): Promise<{ ok: boolean; status: number; sentBlocks: number; lastResponse: any }> {
  // Architettura a 4 Wave:
  // Wave 1: Madri principali (PL, JV)
  // Wave 2: Madri figlie (JVL, JVR - dopo la Suite JV)
  // Wave 3: Derivate non-AC (20 tariffe)
  // Wave 4: Derivate isClosedAc (28 tariffe, 1 blocco continuo ciascuna - inviate per ultime così nessuna cascata le lascia aperte)
  const mainMotherIds = new Set([494840, 529773, 960383, 960389]);
  const childMotherIds = new Set([495795, 495796, 960385, 960387]);
  const closedAcIds = new Set(JUNGLE_RATE_PAIRS.filter(p => p.isClosedAc).flatMap(p => [p.jungleId, p.fpvId]));

  const wave1 = blocks.filter(b => mainMotherIds.has(b.room));
  const wave2 = blocks.filter(b => childMotherIds.has(b.room));
  const wave3 = blocks.filter(b => !mainMotherIds.has(b.room) && !childMotherIds.has(b.room) && !closedAcIds.has(b.room));
  const wave4 = blocks.filter(b => closedAcIds.has(b.room));
  const waves = [wave1, wave2, wave3, wave4].filter(w => w.length > 0);

  const CHUNK_SIZE = 150;
  const MAX_RETRIES = 5;
  let lastJson: any = {};
  let firstChunkApplied = false;

  for (let wIdx = 0; wIdx < waves.length; wIdx++) {
    if (wIdx > 0) await sleepMs(1200);
    const waveBlocks = waves[wIdx];
    for (let i = 0; i < waveBlocks.length; i += CHUNK_SIZE) {
      if (i > 0) await sleepMs(500);
      const chunk = waveBlocks.slice(i, i + CHUNK_SIZE);

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const bulkRes = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify(chunk)
        });
        const json = await bulkRes.json().catch(() => ({}));
        lastJson = json;

        if (bulkRes.ok && json?.success !== false) {
          if (!firstChunkApplied) {
            firstChunkApplied = true;
            options?.onFirstChunkSuccess?.();
          }
          break;
        }

        const isRetryable = bulkRes.status === 403 || bulkRes.status === 429 || bulkRes.status >= 500;
        if (isRetryable && attempt < MAX_RETRIES) {
          console.warn(
            `[JUNGLE MIRROR] Chunk wave ${wIdx + 1}/${i / CHUNK_SIZE} HTTP ${bulkRes.status}, retry ${attempt}/${MAX_RETRIES} su nodo libero...`
          );
          await sleepMs(1000 * attempt);
          continue;
        }

        throw new Error(
          `Calendar bulk POST failed (${bulkRes.status} at wave ${wIdx + 1} chunk ${i / CHUNK_SIZE}): ${JSON.stringify(json).slice(0, 300)}`
        );
      }
    }
  }
  return { ok: true, status: 200, sentBlocks: blocks.length, lastResponse: lastJson };
}

/**
 * Legge lo snapshot completo di tutte le 52 tariffe gemelle (4 Madri + 48 Derivate)
 * da una struttura Octorate nell'intervallo [dateFrom, dateTo].
 */
async function fetchTwin52RateSnapshot(
  accessToken: string,
  structureId: JungleSourceStructureId,
  dateFrom: string,
  dateTo: string
): Promise<Map<number, Map<string, SnapshotDay>>> {
  const targetRateIds = new Set(getJungleTwinRateIds(structureId));
  const snapshot = new Map<number, Map<string, SnapshotDay>>();

  let page = 0;
  while (page < 35) {
    const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${dateFrom}&dateTo=${dateTo}&size=20&page=${page}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
    });
    if (!res.ok) {
      throw new Error(`Calendar GET failed (${structureId} page ${page}): ${res.status}`);
    }
    const json = await res.json().catch(() => ({}));
    const roomRows: any[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
    if (roomRows.length === 0) break;

    for (const roomObj of roomRows) {
      const rateId = Number(roomObj.id ?? roomObj.roomId);
      if (!targetRateIds.has(rateId)) continue;

      let dayMap = snapshot.get(rateId);
      if (!dayMap) {
        dayMap = new Map<string, SnapshotDay>();
        snapshot.set(rateId, dayMap);
      }

      const days: any[] = Array.isArray(roomObj.days) ? roomObj.days : [roomObj];
      for (const day of days) {
        if (!day?.date) continue;
        const dStr = String(day.date).slice(0, 10);
        const rawMin = Number(day.minstay ?? day.minStay ?? 0);
        dayMap.set(dStr, {
          date: dStr,
          availability: Number(day.availability ?? 0),
          price: typeof day.price === 'number' && day.price > 0 ? day.price : undefined,
          stopSells: Boolean(day.stopSells),
          closed: Boolean(day.closed),
          closedArrival: Boolean(day.closeToArrival ?? day.closedArrival),
          closedDeparture: Boolean(day.closeToDeparture ?? day.closedDeparture),
          minstay: rawMin > 0 ? rawMin : undefined
        });
      }
    }

    const totalPages = Number(json?.totalPages ?? 0);
    if (snapshot.size >= 52 && structureId === '807324') break;
    if (roomRows.length < 20 || (totalPages > 0 && page + 1 >= totalPages)) break;
    page++;
  }

  return snapshot;
}

/**
 * Costruisce le righe giornaliere per le 52 tariffe di `targetStructureId` partendo dallo snapshot di `fromStructureId`,
 * applicando automaticamente la Regola Standby Asimmetrica quando `targetMode === 'standby'`.
 */
function build52RateDailyEntries(
  fromStructureId: JungleSourceStructureId,
  toStructureId: JungleSourceStructureId,
  snapshot: Map<number, Map<string, SnapshotDay>>,
  targetMode: 'standby' | 'active'
): DailyBulkEntry[] {
  const entries: DailyBulkEntry[] = [];
  const jvlRoom = JUNGLE_TWIN_ROOMS.find(r => r.key === 'jvl')!;
  const jvrRoom = JUNGLE_TWIN_ROOMS.find(r => r.key === 'jvr')!;
  const jvlDays = snapshot.get(fromStructureId === '366879' ? jvlRoom.fpvMotherId : jvlRoom.jungleMotherId);
  const jvrDays = snapshot.get(fromStructureId === '366879' ? jvrRoom.fpvMotherId : jvrRoom.jungleMotherId);

  for (const roomTwin of JUNGLE_TWIN_ROOMS) {
    const pairsForRoom = JUNGLE_RATE_PAIRS.filter(p => p.key === roomTwin.key);
    const motherPair = pairsForRoom.find(p => p.isMother);
    if (!motherPair) continue;

    const bePair = pairsForRoom.find(p => p.isBe || p.label.includes('BE'));
    const srcMotherId = fromStructureId === '366879' ? motherPair.fpvId : motherPair.jungleId;
    const srcBeId = bePair ? (fromStructureId === '366879' ? bePair.fpvId : bePair.jungleId) : undefined;
    const motherDays = snapshot.get(srcMotherId);
    const beDays = srcBeId ? snapshot.get(srcBeId) : undefined;
    if (!motherDays || motherDays.size === 0) continue;

    for (const pair of pairsForRoom) {
      const srcRateId = fromStructureId === '366879' ? pair.fpvId : pair.jungleId;
      const dstRateId = toStructureId === '366879' ? pair.fpvId : pair.jungleId;
      const srcDays = snapshot.get(srcRateId);

      for (const [dateStr, mDay] of motherDays.entries()) {
        const dDay = srcDays?.get(dateStr) || mDay;
        const leftAvail = jvlDays?.get(dateStr)?.availability;
        const rightAvail = jvrDays?.get(dateStr)?.availability;
        // Se una sola metà è occupata sulla Suite aggregata (JV), non inviare availability=0 sulla Suite (altrimenti Octorate azzera anche la figlia libera)
        const isPartialChildBookedOnSuite =
          pair.isMother &&
          pair.key === 'jv' &&
          leftAvail !== undefined &&
          rightAvail !== undefined &&
          ((leftAvail > 0 && rightAvail === 0) || (leftAvail === 0 && rightAvail > 0));
        const availField = isPartialChildBookedOnSuite ? {} : { availability: mDay.availability };

        if (targetMode === 'standby') {
          if (toStructureId === '366879') {
            // Standby Flower Power Village (366879): Stop Sell 100% su tutte le 52 tariffe per 365 giorni
            const values: Record<string, any> = pair.isMother
              ? {
                ...availField,
                ...(mDay.price ? { price: mDay.price } : {}),
                stopSells: true,
                closed: true,
                closedArrival: true,
                closedDeparture: true,
                ...(mDay.minstay ? { minstay: mDay.minstay } : {})
              }
              : {
                stopSells: true,
                closed: true,
                closedArrival: true,
                closedDeparture: true
              };
            entries.push({ room: dstRateId, date: dateStr, values });
          } else {
            // Standby Jungle Villas (807324): Regola Asimmetrica
            const isLowKeepAlive = isLowSeasonKeepAliveDate(dateStr);
            const isMotherFree = mDay.availability > 0 && !mDay.stopSells;

            if (!isLowKeepAlive) {
              // Alta/Media Stagione (01 Nov -> 31 Mag): Stop Sell 100% su tutte le 52 tariffe
              const values: Record<string, any> = pair.isMother
                ? {
                  ...availField,
                  ...(mDay.price ? { price: mDay.price } : {}),
                  stopSells: true,
                  closed: true,
                  closedArrival: true,
                  closedDeparture: true,
                  ...(mDay.minstay ? { minstay: mDay.minstay } : {})
                }
                : {
                  stopSells: true,
                  closed: true,
                  closedArrival: true,
                  closedDeparture: true
                };
              entries.push({ room: dstRateId, date: dateStr, values });
            } else if (pair.isMother) {
              // Bassa Stagione Keep-Alive Madre (807324): aperto solo se libera, prezzo raddoppiato 2x (< 10.000 THB) e minstay 14 notti
              const keepAlivePrice = computeStandbyKeepAlivePrice(mDay.price, pair.key);
              const lockDay = !isMotherFree;
              entries.push({
                room: dstRateId,
                date: dateStr,
                values: {
                  ...availField,
                  price: keepAlivePrice,
                  stopSells: lockDay,
                  closed: lockDay,
                  closedArrival: lockDay,
                  closedDeparture: lockDay,
                  minstay: STANDBY_KEEPALIVE_MIN_STAY
                }
              });
            } else {
              // Bassa Stagione Keep-Alive Derivate (807324): AC sempre chiuse, non-AC seguono stato Madre/Derivata
              const forceLockDerived = pair.isClosedAc || !isMotherFree;
              entries.push({
                room: dstRateId,
                date: dateStr,
                values: {
                  stopSells: forceLockDerived ? true : dDay.stopSells,
                  closed: forceLockDerived ? true : dDay.closed,
                  closedArrival: forceLockDerived ? true : dDay.closedArrival,
                  closedDeparture: forceLockDerived ? true : dDay.closedDeparture
                }
              });
            }
          }
        } else {
          // Modalità ACTIVE (entrante): prezzi normali, disponibilità reale e regole Sacro Graal
          if (pair.isMother) {
            const isMotherFreeActive =
              mDay.availability > 0 &&
              (pair.key !== 'jv' ||
                ((leftAvail === undefined || leftAvail > 0) &&
                  (rightAvail === undefined || rightAvail > 0)));
            const beDay = beDays?.get(dateStr);
            const forceOpenMother = Boolean(
              isMotherFreeActive && beDay && beDay.stopSells === false && beDay.closed !== true
            );

            entries.push({
              room: dstRateId,
              date: dateStr,
              values: {
                ...availField,
                ...(mDay.price ? { price: mDay.price } : {}),
                stopSells: forceOpenMother ? false : mDay.stopSells,
                closed: forceOpenMother ? false : mDay.closed,
                closedArrival: forceOpenMother ? false : mDay.closedArrival,
                closedDeparture: forceOpenMother ? false : mDay.closedDeparture,
                ...(mDay.minstay ? { minstay: mDay.minstay } : {})
              }
            });
          } else {
            entries.push({
              room: dstRateId,
              date: dateStr,
              values: {
                stopSells: pair.isClosedAc ? true : dDay.stopSells,
                closed: pair.isClosedAc ? true : dDay.closed,
                closedArrival: pair.isClosedAc ? true : dDay.closedArrival,
                closedDeparture: pair.isClosedAc ? true : dDay.closedDeparture
              }
            });
          }
        }
      }
    }
  }

  return entries;
}

/**
 * Chiude o apre in blocco tutte le 52 tariffe (4 Madri + 48 Derivate) su una struttura Octorate per i prossimi N giorni.
 * Se lockClosed=true su Jungle Villas (807324), applica la Regola Standby Asimmetrica via snapshot live.
 */
export async function setJungleStructureAvailabilityLock(
  accessToken: string,
  structureId: JungleSourceStructureId,
  lockClosed: boolean,
  daysAhead = 365
): Promise<{ ok: boolean; status: number; response: any; lockedRatesCount: number }> {
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + daysAhead);
  const dateFrom = today.toISOString().slice(0, 10);
  const dateTo = end.toISOString().slice(0, 10);

  if (lockClosed && structureId === '807324') {
    const snap = await fetchTwin52RateSnapshot(accessToken, '807324', dateFrom, dateTo);
    const entries = build52RateDailyEntries('807324', '807324', snap, 'standby');
    const blocks = compressDailyBulkItems(entries);
    const bulkRes = await postCalendarBulkBlocks(accessToken, blocks);
    return { ok: bulkRes.ok, status: bulkRes.status, response: bulkRes.lastResponse, lockedRatesCount: 52 };
  }

  const pairs = JUNGLE_RATE_PAIRS;
  const blocks: CompressedBulkBlock[] = pairs.map(p => {
    const room = structureId === '366879' ? p.fpvId : p.jungleId;
    const forceClose = lockClosed || p.isClosedAc;
    const values: Record<string, any> = forceClose
      ? {
        stopSells: true,
        closed: true,
        closedArrival: true,
        closedDeparture: true,
        ...(p.isMother && lockClosed ? { availability: 0 } : {})
      }
      : {
        stopSells: false,
        closed: false,
        closedArrival: false,
        closedDeparture: false,
        ...(p.isMother ? { availability: 1 } : {})
      };
    return { room, dateFrom, dateTo, values };
  });

  const bulkRes = await postCalendarBulkBlocks(accessToken, blocks);
  return { ok: bulkRes.ok, status: bulkRes.status, response: bulkRes.lastResponse, lockedRatesCount: blocks.length };
}

/**
 * Sincronizza prezzi, disponibilità reale e restrizioni Sacro Graal su tutte le 52 tariffe
 * da una struttura sorgente verso la struttura gemella destinataria,
 * con verifica read-back obbligatoria post-scrittura su GET /calendar.
 */
export async function syncCalendarBetweenStructures(
  accessToken: string,
  fromStructureId: JungleSourceStructureId,
  toStructureId: JungleSourceStructureId,
  options?: { keepTargetClosed?: boolean; daysAhead?: number; dateFrom?: string; dateTo?: string }
): Promise<{
  ok: boolean;
  syncedEntries: number;
  sentBlocks: number;
  dateFrom: string;
  dateTo: string;
  verified: boolean;
  verificationAttempts: number;
  verifiedSampleDates: string[];
}> {
  const keepTargetClosed = options?.keepTargetClosed ?? true;
  const daysAhead = options?.daysAhead ?? 365;
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + daysAhead);
  const dateFrom = options?.dateFrom || today.toISOString().slice(0, 10);
  const dateTo = options?.dateTo || end.toISOString().slice(0, 10);

  const [snapshot, targetSnapshot] = await Promise.all([
    fetchTwin52RateSnapshot(accessToken, fromStructureId, dateFrom, dateTo),
    fetchTwin52RateSnapshot(accessToken, toStructureId, dateFrom, dateTo)
  ]);
  const expectedMothers = JUNGLE_TWIN_ROOMS.map(r => (fromStructureId === '366879' ? r.fpvMotherId : r.jungleMotherId));
  const missingMothers = expectedMothers.filter(id => !(snapshot.get(id)?.size));
  if (missingMothers.length > 0) {
    throw new Error(
      `Snapshot incompleto dalla struttura sorgente ${fromStructureId}: tariffe madri mancanti [${missingMothers.join(', ')}]. Sync annullato per sicurezza.`
    );
  }

  const dailyEntries = build52RateDailyEntries(
    fromStructureId,
    toStructureId,
    snapshot,
    keepTargetClosed ? 'standby' : 'active'
  );
  const filteredEntries = filterChangedDailyEntries(dailyEntries, targetSnapshot);
  const blocks = compressDailyBulkItems(filteredEntries);
  if (blocks.length > 0) {
    await postCalendarBulkBlocks(accessToken, blocks);
  }

  const sampleDates = pickVerificationSampleDates(snapshot, fromStructureId, dateFrom);
  if (sampleDates.length === 0) {
    throw new Error(`Impossibile determinare date campione per verifica post-sync su ${toStructureId}.`);
  }

  let verificationAttempts = 1;
  if (blocks.length > 0) {
    const verification = await verifyStructureCalendarState(accessToken, toStructureId, dailyEntries, sampleDates);
    verificationAttempts = verification.attempts;
    if (!verification.ok) {
      throw new Error(
        `Verifica Profonda post-sync fallita su ${toStructureId} dopo ${verification.attempts} tentativi. Anomalie (${verification.mismatches.length}): ${verification.mismatches.slice(0, 5).join(' | ')}`
      );
    }
  }

  return {
    ok: true,
    syncedEntries: filteredEntries.length,
    sentBlocks: blocks.length,
    dateFrom,
    dateTo,
    verified: true,
    verificationAttempts,
    verifiedSampleDates: sampleDates
  };
}

/**
 * Sincronizza automaticamente il calendario (52 tariffe + Regola Asimmetrica standby)
 * dalla struttura attualmente attiva verso la gemella in standby, con verifica finale live.
 */
export async function syncActiveToStandbyCalendar(
  supabaseAdmin: any,
  accessToken: string,
  options?: { daysAhead?: number; dateFrom?: string; dateTo?: string; force?: boolean }
): Promise<{
  ok: boolean;
  active: JungleSourceStructureId;
  standby: JungleSourceStructureId;
  syncedEntries: number;
  sentBlocks: number;
  verified: boolean;
  verificationAttempts: number;
  verifiedSampleDates: string[];
}> {
  const active = await getActiveJungleSource(supabaseAdmin);
  const standby: JungleSourceStructureId = active === '807324' ? '366879' : '807324';
  const { force, ...syncOptions } = options || {};

  let resSyncResult = { checked: 0, repairedCreated: 0, repairedCancelled: 0, propagatedEdits: 0 };
  try {
    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() + 365);
    resSyncResult = await verifyAndRepairTwinReservationsBeforeSwitch(
      supabaseAdmin,
      accessToken,
      active,
      standby,
      today.toISOString().slice(0, 10),
      end.toISOString().slice(0, 10)
    );
  } catch (resSyncErr) {
    console.warn('[JUNGLE MIRROR] Reservation photocopy check warning (non-blocking):', resSyncErr);
  }

  const hasReservationChanges =
    resSyncResult.repairedCreated > 0 ||
    resSyncResult.repairedCancelled > 0 ||
    resSyncResult.propagatedEdits > 0;
  const effectiveForce = Boolean(force || hasReservationChanges);

  if (!effectiveForce) {
    const nowMs = Date.now();
    if (nowMs - lastStandbySyncTimestampMs < STANDBY_SYNC_COOLDOWN_MS) {
      return {
        ok: true,
        active,
        standby,
        syncedEntries: 0,
        sentBlocks: 0,
        verified: true,
        verificationAttempts: 0,
        verifiedSampleDates: []
      };
    }

    if (supabaseAdmin) {
      try {
        const { data: lockRow } = await supabaseAdmin
          .from('telegram_config')
          .select('bot_token, updated_at')
          .eq('id', STANDBY_SYNC_LOCK_ID)
          .maybeSingle();

        const updatedMs = lockRow?.updated_at ? Date.parse(lockRow.updated_at) : NaN;
        if (!Number.isNaN(updatedMs) && nowMs - updatedMs < STANDBY_SYNC_COOLDOWN_MS) {
          lastStandbySyncTimestampMs = updatedMs;
          return {
            ok: true,
            active,
            standby,
            syncedEntries: 0,
            sentBlocks: 0,
            verified: true,
            verificationAttempts: 0,
            verifiedSampleDates: []
          };
        }
      } catch (lockReadErr) {
        console.warn('[JUNGLE MIRROR] Standby sync lock read warning:', lockReadErr);
      }
    }
  }

  const result = await syncCalendarBetweenStructures(accessToken, active, standby, {
    keepTargetClosed: true,
    ...syncOptions
  });
  await markStandbySyncCompleted(supabaseAdmin);
  return {
    ok: result.ok,
    active,
    standby,
    syncedEntries: result.syncedEntries,
    sentBlocks: result.sentBlocks,
    verified: result.verified,
    verificationAttempts: result.verificationAttempts,
    verifiedSampleDates: result.verifiedSampleDates
  };
}

export interface CalendarVerificationResult {
  ok: boolean;
  structureId: JungleSourceStructureId;
  attempts: number;
  checkedDates: string[];
  checkedEntries: number;
  mismatches: string[];
}

/**
 * Seleziona fino a 4 date campione reali presenti nello snapshot dell'uscente
 * (domani, +15 giorni, alta stagione e bassa stagione 01 Giu - 31 Ott).
 */
function pickVerificationSampleDates(
  snapshot: Map<number, Map<string, SnapshotDay>>,
  structureId: JungleSourceStructureId,
  dateFrom: string
): string[] {
  const motherIds = JUNGLE_TWIN_ROOMS.map(r => (structureId === '366879' ? r.fpvMotherId : r.jungleMotherId));
  const baseMap = snapshot.get(motherIds[0]);
  const availableDates = baseMap
    ? Array.from(baseMap.keys())
      .filter(d => motherIds.every(mId => snapshot.get(mId)?.has(d)))
      .sort()
    : [];

  if (availableDates.length === 0) return [];

  const picked: string[] = [];
  const addDate = (d?: string) => {
    if (d && !picked.includes(d)) picked.push(d);
  };

  // 1. Domani
  const tomorrow = addOneDayISO(dateFrom);
  addDate(availableDates.find(d => d >= tomorrow) || availableDates[0]);

  // 2. +15 giorni
  const plus15Date = new Date(`${dateFrom}T00:00:00Z`);
  plus15Date.setUTCDate(plus15Date.getUTCDate() + 15);
  const plus15Str = plus15Date.toISOString().slice(0, 10);
  addDate(availableDates.find(d => d >= plus15Str));

  // 3. Alta / Media stagione (preferenza 08 Gen, poi altre date fuori Bassa Stagione)
  const preferredHigh = availableDates.find(
    d => !isLowSeasonKeepAliveDate(d) && ['-01-08', '-02-01', '-12-20', '-11-25'].some(sfx => d.endsWith(sfx))
  );
  addDate(preferredHigh || availableDates.find(d => !isLowSeasonKeepAliveDate(d) && !picked.includes(d)));

  // 4. Finestra Keep-Alive SOLO Luglio (01 Lug - 31 Lug: preferenza 15 Lug / 10 Lug / 20 Lug / 25 Lug)
  const preferredLow = availableDates.find(
    d => isLowSeasonKeepAliveDate(d) && ['-07-15', '-07-10', '-07-20', '-07-25'].some(sfx => d.endsWith(sfx))
  );
  addDate(preferredLow || availableDates.find(d => isLowSeasonKeepAliveDate(d)));

  return picked;
}

/**
 * Esegue read-back polling su GET /calendar/{structureId} per verificare che Octorate
 * abbia applicato realmente tutti gli stati attesi (stopSells, prezzi 2x/normali, disponibilità Madri)
 * su tutte le 52 tariffe nelle date campione.
 */
async function verifyStructureCalendarState(
  accessToken: string,
  structureId: JungleSourceStructureId,
  expectedEntries: DailyBulkEntry[],
  sampleDates: string[],
  options?: { maxAttempts?: number; initialDelayMs?: number; retryDelayMs?: number }
): Promise<CalendarVerificationResult> {
  const sampleDateSet = new Set(sampleDates);
  const targets = expectedEntries.filter(e => sampleDateSet.has(e.date));
  if (targets.length === 0) {
    throw new Error(`Verifica calendario impossibile su ${structureId}: nessuna voce attesa per le date [${sampleDates.join(', ')}].`);
  }

  const maxAttempts = options?.maxAttempts ?? 6;
  const initialDelayMs = options?.initialDelayMs ?? 1500;
  const retryDelayMs = options?.retryDelayMs ?? 2000;

  let lastMismatches: string[] = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await sleepMs(attempt === 1 ? initialDelayMs : retryDelayMs);

    const perDateSnaps = await Promise.all(
      sampleDates.map(d => fetchTwin52RateSnapshot(accessToken, structureId, d, d))
    );

    const liveByRate = new Map<number, Map<string, SnapshotDay>>();
    for (const snap of perDateSnaps) {
      for (const [rateId, dayMap] of snap.entries()) {
        let merged = liveByRate.get(rateId);
        if (!merged) {
          merged = new Map<string, SnapshotDay>();
          liveByRate.set(rateId, merged);
        }
        for (const [dStr, dVal] of dayMap.entries()) {
          merged.set(dStr, dVal);
        }
      }
    }

    const mismatches: string[] = [];
    for (const entry of targets) {
      const pair = getJungleTwinPairByRateId(entry.room);
      const rateTag = pair ? `${pair.label} (${entry.room})` : `rate ${entry.room}`;
      const liveDay = liveByRate.get(entry.room)?.get(entry.date);

      if (!liveDay) {
        mismatches.push(`${rateTag} @ ${entry.date}: assente in GET /calendar`);
        continue;
      }

      if (entry.values.stopSells !== undefined) {
        const expStop = Boolean(entry.values.stopSells);
        const liveStop = Boolean(liveDay.stopSells);
        if (liveStop !== expStop) {
          mismatches.push(`${rateTag} @ ${entry.date}: stopSells atteso=${expStop} reale=${liveStop}`);
        }
      }

      if (entry.values.price !== undefined && Number(entry.values.price) > 0) {
        const expPrice = Number(entry.values.price);
        const livePrice = Number(liveDay.price ?? 0);
        if (Math.abs(livePrice - expPrice) > 1) {
          mismatches.push(`${rateTag} @ ${entry.date}: price atteso=${expPrice} reale=${livePrice}`);
        }
      }

      if (pair?.isMother && entry.values.minstay !== undefined && Number(entry.values.minstay) > 0) {
        const expMinStay = Number(entry.values.minstay);
        const liveMinStay = Number(liveDay.minstay ?? 0);
        if (liveMinStay !== expMinStay) {
          mismatches.push(`${rateTag} @ ${entry.date}: minstay atteso=${expMinStay} reale=${liveMinStay}`);
        }
      }

      if (pair?.isMother) {
        // Sui giorni parziali della Suite JV (una sola metà occupata), availability viene omessa in bulk POST ma deve risultare 0 da aggregazione Octorate
        const expAvail =
          entry.values.availability !== undefined
            ? Number(entry.values.availability)
            : pair.key === 'jv'
              ? 0
              : undefined;
        if (expAvail !== undefined) {
          const liveAvail = Number(liveDay.availability ?? 0);
          if (liveAvail !== expAvail) {
            mismatches.push(`${rateTag} @ ${entry.date}: availability attesa=${expAvail} reale=${liveAvail}`);
          }
        }
      }
    }

    lastMismatches = mismatches;
    if (mismatches.length === 0) {
      return {
        ok: true,
        structureId,
        attempts: attempt,
        checkedDates: sampleDates,
        checkedEntries: targets.length,
        mismatches: []
      };
    }
  }

  return {
    ok: false,
    structureId,
    attempts: maxAttempts,
    checkedDates: sampleDates,
    checkedEntries: targets.length,
    mismatches: lastMismatches
  };
}

interface TwinReservationLite {
  id: string;
  twinKey: JungleTwinRoom['key'];
  checkIn: string;
  checkOut: string;
  guestName: string;
  productId?: number | string;
  roomName?: string;
  channelId?: number | string;
  refer?: string;
  channelRefer?: string;
  channelName?: string;
  color?: string;
  isMirror: boolean;
  updateTime?: string;
  createTime?: string;
  origSourceId?: string;
  totalGross?: number;
  privateNotes?: string;
}

async function fetchTwinActiveReservations(
  accessToken: string,
  structureId: JungleSourceStructureId,
  dateFrom: string,
  dateTo: string
): Promise<TwinReservationLite[]> {
  const results: TwinReservationLite[] = [];
  let page = 0;

  while (page < 10) {
    const url = `https://api.octorate.com/connect/rest/v1/reservation/${structureId}?type=STAY&startDate=${dateFrom}&endDate=${dateTo}&size=50&page=${page}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
    });
    if (!res.ok) {
      throw new Error(`Reservation GET failed (${structureId} page ${page}): ${res.status}`);
    }
    const json = await res.json().catch(() => ({}));
    const rows: any[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
    if (rows.length === 0) break;

    for (const r of rows) {
      const status = String(r.status || '').toUpperCase();
      if (status === 'CANCELLED' || status === 'CANCELED') continue;

      const productId = r.product ?? r.productId ?? r.roomId ?? r.room?.id;
      const roomName = r.roomName ?? r.room?.name ?? '';
      const twin = resolveTwinByProductOrName(productId, roomName);
      if (!twin) continue;

      const checkIn = toThailandDateStr(r.checkin || r.checkIn);
      const checkOut = toThailandDateStr(r.checkout || r.checkOut);
      if (!checkIn || !checkOut) continue;

      const notesStr = String(r.privateNotes || '');
      let origSourceId: string | undefined;
      const origMatch = notesStr.match(/Orig:\s*\d+\s*#(\d+)/);
      if (origMatch) {
        origSourceId = origMatch[1];
      } else {
        const referMatch = String(r.refer || '').match(/^MIRROR-(\d+)/);
        if (referMatch) origSourceId = referMatch[1];
      }

      results.push({
        id: String(r.id ?? ''),
        twinKey: twin.key,
        checkIn,
        checkOut,
        guestName: String(r.referent || `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'Guest'),
        productId,
        roomName,
        channelId: r.channelId,
        refer: r.refer ? String(r.refer) : undefined,
        channelRefer: r.channelRefer || r.refer,
        channelName: r.channelName,
        color: r.color,
        isMirror: isMirrorReservation(r),
        updateTime: r.updateTime ? String(r.updateTime) : undefined,
        createTime: r.createTime ? String(r.createTime) : undefined,
        origSourceId,
        totalGross: Number(r.totalGross ?? r.roomGross ?? 0),
        privateNotes: notesStr || undefined
      });
    }

    const totalPages = Number(json?.totalPages ?? 0);
    if (rows.length < 50 || (totalPages > 0 && page + 1 >= totalPages)) break;
    page++;
  }

  return results;
}

/**
 * Propaga una modifica o cancellazione eseguita manualmente su una scheda [MIRROR_SYNC]
 * verso la prenotazione originale sull'altra struttura gemella, prevenendo sovrascritture.
 */
export async function syncManualMirrorEditToCounterpart(params: {
  supabaseAdmin: any;
  accessToken: string;
  mirrorStruct: JungleSourceStructureId;
  mirrorBooking: any;
  isCancelled?: boolean;
  forceOnWebhook?: boolean;
}): Promise<{
  synced: boolean;
  action: 'updated' | 'recreated' | 'cancelled' | 'skipped';
  counterpartStructureId?: JungleSourceStructureId;
  counterpartReservationId?: string;
  reason?: string;
}> {
  const { supabaseAdmin, accessToken, mirrorStruct, mirrorBooking, isCancelled, forceOnWebhook } = params;
  const mirrorResId = String(mirrorBooking?.id || '');
  if (!mirrorResId) {
    return { synced: false, action: 'skipped', reason: 'Missing mirror reservation ID' };
  }

  let origStruct: JungleSourceStructureId = mirrorStruct === '366879' ? '807324' : '366879';
  let origResId = '';

  if (supabaseAdmin) {
    try {
      const { data: revRow } = await supabaseAdmin
        .from('telegram_config')
        .select('bot_token, chat_id')
        .eq('id', `mirror_target_${mirrorStruct}_${mirrorResId}`)
        .maybeSingle();
      if (revRow?.chat_id) {
        origResId = String(revRow.chat_id);
        if (revRow.bot_token === '807324' || revRow.bot_token === '366879') {
          origStruct = revRow.bot_token;
        }
      }
    } catch (lookupErr) {
      console.warn('[JUNGLE MIRROR] Reverse mirror lookup warning:', lookupErr);
    }
  }

  if (!origResId) {
    const notesStr = String(mirrorBooking?.privateNotes || '');
    const origMatch = notesStr.match(/Orig:\s*(366879|807324)\s*#(\d+)/);
    if (origMatch) {
      origStruct = origMatch[1] as JungleSourceStructureId;
      origResId = origMatch[2];
    } else if (mirrorBooking?.origSourceId) {
      origResId = String(mirrorBooking.origSourceId);
    } else {
      const refMatch = String(mirrorBooking?.refer || '').match(/^MIRROR-(\d+)/);
      if (refMatch) origResId = refMatch[1];
    }
  }

  if (!origResId) {
    return { synced: false, action: 'skipped', reason: 'Unable to resolve counterpart reservation ID' };
  }

  let mirrorData = mirrorBooking;
  if (!mirrorData.updateTime || !mirrorData.createTime || !mirrorData.checkin) {
    const mRes = await fetch(
      `https://api.octorate.com/connect/rest/v1/reservation/${mirrorStruct}/${mirrorResId}`,
      { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } }
    ).catch(() => null);
    if (mRes && mRes.ok) {
      mirrorData = await mRes.json().catch(() => mirrorBooking);
    }
  }

  const origRes = await fetch(
    `https://api.octorate.com/connect/rest/v1/reservation/${origStruct}/${origResId}`,
    { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } }
  ).catch(() => null);

  if (!origRes || !origRes.ok) {
    return { synced: false, action: 'skipped', counterpartStructureId: origStruct, counterpartReservationId: origResId, reason: 'Counterpart reservation not found' };
  }

  const origData: any = await origRes.json().catch(() => ({}));
  const mirrorStatus = String(mirrorData?.status || '').toUpperCase().trim();
  const effectiveCancelled =
    Boolean(isCancelled) ||
    mirrorStatus === 'CANCELLED' ||
    mirrorStatus === 'CANCELED' ||
    mirrorStatus === 'DELETED' ||
    mirrorStatus === 'VOID' ||
    mirrorStatus === 'REJECTED';

  if (effectiveCancelled) {
    await cancelExistingMirrorReservation({
      supabaseAdmin,
      accessToken,
      srcStruct: origStruct,
      sourceReservationId: origResId,
      targetStructureId: mirrorStruct,
      existingMirrorId: mirrorResId,
      reasonNote: 'Synced cancellation from counterpart'
    });
    // Also cancel counterpart if it wasn't already cancelled
    const oStatus = String(origData?.status || '').toUpperCase().trim();
    if (oStatus !== 'CANCELLED' && oStatus !== 'CANCELED') {
      const delOrig = await fetch(
        `https://api.octorate.com/connect/rest/v1/reservation/${origStruct}/${origResId}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } }
      ).catch(() => null);
      if (!delOrig || !delOrig.ok) {
        await fetch(
          `https://api.octorate.com/connect/rest/v1/reservation/${origStruct}/${origResId}`,
          {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ status: 'CANCELLED' })
          }
        ).catch(() => null);
      }
    }
    return {
      synced: true,
      action: 'cancelled',
      counterpartStructureId: origStruct,
      counterpartReservationId: origResId
    };
  }

  const newIn = toThailandDateStr(mirrorData.checkin || mirrorData.checkIn);
  const newOut = toThailandDateStr(mirrorData.checkout || mirrorData.checkOut);
  const origIn = toThailandDateStr(origData.checkin || origData.checkIn);
  const origOut = toThailandDateStr(origData.checkout || origData.checkOut);

  if (!newIn || !newOut || (origIn === newIn && origOut === newOut)) {
    return {
      synced: false,
      action: 'skipped',
      counterpartStructureId: origStruct,
      counterpartReservationId: origResId,
      reason: 'Dates already aligned with counterpart'
    };
  }

  const mirrorUpdateMs = parseOctorateTimestampMs(mirrorData.updateTime);
  const origUpdateMs = parseOctorateTimestampMs(origData.updateTime);
  if (!forceOnWebhook && mirrorUpdateMs > 0 && origUpdateMs > 0 && mirrorUpdateMs <= origUpdateMs) {
    return {
      synced: false,
      action: 'skipped',
      counterpartStructureId: origStruct,
      counterpartReservationId: origResId,
      reason: 'Counterpart reservation has newer updateTime'
    };
  }

  const updatedGuests = Array.isArray(origData.guests) && origData.guests.length > 0
    ? origData.guests.map((g: any) => ({ ...g, checkin: newIn, checkout: newOut }))
    : undefined;

  const patchPayload = {
    checkin: `${newIn}T08:00:00Z`,
    checkout: `${newOut}T04:00:00Z`,
    ...(updatedGuests ? { guests: updatedGuests } : {})
  };

  await fetch(`https://api.octorate.com/connect/rest/v1/reservation/${origStruct}/${origResId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(patchPayload)
  }).catch(() => null);

  const verifyOrigRes = await fetch(
    `https://api.octorate.com/connect/rest/v1/reservation/${origStruct}/${origResId}`,
    { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } }
  ).catch(() => null);
  const verifyOrigData: any = verifyOrigRes && verifyOrigRes.ok ? await verifyOrigRes.json().catch(() => null) : null;
  const verifiedIn = toThailandDateStr(verifyOrigData?.checkin);
  const verifiedOut = toThailandDateStr(verifyOrigData?.checkout);

  if (verifiedIn === newIn && verifiedOut === newOut) {
    if (supabaseAdmin) {
      const now = new Date().toISOString();
      await supabaseAdmin.from('telegram_config').upsert([
        {
          id: `mirror_res_${origStruct}_${origResId}`,
          bot_token: String(mirrorStruct),
          chat_id: String(mirrorResId),
          updated_at: now
        },
        {
          id: `mirror_target_${mirrorStruct}_${mirrorResId}`,
          bot_token: String(origStruct),
          chat_id: String(origResId),
          updated_at: now
        }
      ]);
    }
    return {
      synced: true,
      action: 'updated',
      counterpartStructureId: origStruct,
      counterpartReservationId: origResId
    };
  }

  // Fallback solo per prenotazioni ricreabili in sicurezza: ricrea in modo coerente su counterpart e aggiorna la mappa
  const origChannelId = Number(origData?.channelId || 233);
  const isSafeDirectToRecreate = origChannelId === 288 || origChannelId === 233;
  const origHasPayments = Array.isArray(origData?.payments) && origData.payments.length > 0;
  if (!isSafeDirectToRecreate || origHasPayments) {
    console.warn(
      `[JUNGLE MIRROR] PATCH checkout non accettato da Octorate su ${origStruct} #${origResId} (ch=${origChannelId}, payments=${origHasPayments ? origData.payments.length : 0}). Evitata cancellazione distruttiva della prenotazione nativa.`
    );
    return {
      synced: false,
      action: 'skipped',
      counterpartStructureId: origStruct,
      counterpartReservationId: origResId,
      reason: 'PATCH did not update checkout and counterpart has native OTA/payment protection'
    };
  }

  const origTwin = resolveTwinByProductOrName(origData.product || mirrorData.product, origData.roomName || mirrorData.roomName);
  const recreatedProduct = origTwin ? (origStruct === '366879' ? origTwin.fpvMotherId : origTwin.jungleMotherId) : Number(origData.product);
  const nowIso = new Date().toISOString();
  const suffix = Date.now().toString(36).slice(-3);
  const createBody: any = {
    status: 'CONFIRMED',
    channelId: origChannelId,
    ...(origData.color ? { color: origData.color } : {}),
    product: recreatedProduct,
    checkin: `${newIn}T08:00:00Z`,
    checkout: `${newOut}T04:00:00Z`,
    createTime: nowIso,
    updateTime: nowIso,
    privateNotes: origData.privateNotes || '',
    roomGross: Number(origData.roomGross ?? origData.totalGross ?? 0),
    totalGross: Number(origData.totalGross ?? origData.roomGross ?? 0),
    guests: updatedGuests || origData.guests || [],
    totalGuest: Number(origData.totalGuest || 2),
    totalChildren: Number(origData.totalChildren || 0),
    totalInfants: Number(origData.totalInfants || 0),
    refer: `${origData.refer || origResId}-R${suffix}`.slice(0, 25),
    ...(origData.channelRefer ? { channelRefer: String(origData.channelRefer) } : {})
  };

  const createRes = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/${origStruct}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(createBody)
  });
  const createJson: any = await createRes.json().catch(() => ({}));
  const newCounterpartId = String(createJson?.id || createJson?.data?.id || createJson?.reservationId || '');
  if (!createRes.ok || !newCounterpartId) {
    return {
      synced: false,
      action: 'skipped',
      counterpartStructureId: origStruct,
      counterpartReservationId: origResId,
      reason: `Counterpart recreate failed (${createRes.status})`
    };
  }

  // Cancella la vecchia scheda ormai sostituita e aggiorna le chiavi mappa + note mirror
  await fetch(`https://api.octorate.com/connect/rest/v1/reservation/${origStruct}/${origResId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
  }).catch(() => null);

  if (supabaseAdmin) {
    const now = new Date().toISOString();
    await supabaseAdmin.from('telegram_config').delete().in('id', [
      `mirror_res_${origStruct}_${origResId}`,
      `mirror_target_${mirrorStruct}_${mirrorResId}`
    ]);
    await supabaseAdmin.from('telegram_config').upsert([
      {
        id: `mirror_res_${origStruct}_${newCounterpartId}`,
        bot_token: String(mirrorStruct),
        chat_id: String(mirrorResId),
        updated_at: now
      },
      {
        id: `mirror_target_${mirrorStruct}_${mirrorResId}`,
        bot_token: String(origStruct),
        chat_id: String(newCounterpartId),
        updated_at: now
      }
    ]);
  }

  return {
    synced: true,
    action: 'recreated',
    counterpartStructureId: origStruct,
    counterpartReservationId: newCounterpartId
  };
}

/**
 * Verifica che tutte le prenotazioni attive delle 4 ville tra struttura sorgente e destinazione
 * siano allineate al 100% con loghi e colori agenzia originali, riparando eventuali specchi mancanti,
 * con canale 233 obsoleto o orfani.
 */
export async function verifyAndRepairTwinReservationsBeforeSwitch(
  supabaseAdmin: any,
  accessToken: string,
  outgoing: JungleSourceStructureId,
  targetStructureId: JungleSourceStructureId,
  dateFrom: string,
  dateTo: string
): Promise<{ checked: number; repairedCreated: number; repairedCancelled: number; propagatedEdits: number }> {
  let [outRes, inRes] = await Promise.all([
    fetchTwinActiveReservations(accessToken, outgoing, dateFrom, dateTo),
    fetchTwinActiveReservations(accessToken, targetStructureId, dateFrom, dateTo)
  ]);

  // Sync Bidirezionale: se una scheda Mirror è stata modificata manualmente più di recente dell'originale, vince lei e aggiorna l'originale
  let propagatedEdits = 0;
  const checkMirrorUpdates = async (
    mirrorList: TwinReservationLite[],
    mirrorStruct: JungleSourceStructureId,
    origList: TwinReservationLite[]
  ) => {
    for (const m of mirrorList) {
      if (!m.isMirror || !m.origSourceId) continue;
      const orig = origList.find(o => o.id === m.origSourceId);
      if (!orig) continue;
      if (m.checkIn === orig.checkIn && m.checkOut === orig.checkOut) continue;

      const mUpdateMs = parseOctorateTimestampMs(m.updateTime);
      const mCreateMs = parseOctorateTimestampMs(m.createTime);
      const origUpdateMs = parseOctorateTimestampMs(orig.updateTime);

      if (mUpdateMs > origUpdateMs && mUpdateMs > mCreateMs + 5000) {
        const res = await syncManualMirrorEditToCounterpart({
          supabaseAdmin,
          accessToken,
          mirrorStruct,
          mirrorBooking: m
        });
        if (res.synced) {
          propagatedEdits++;
        }
      }
    }
  };

  await checkMirrorUpdates(outRes, outgoing, inRes);
  await checkMirrorUpdates(inRes, targetStructureId, outRes);

  if (propagatedEdits > 0) {
    [outRes, inRes] = await Promise.all([
      fetchTwinActiveReservations(accessToken, outgoing, dateFrom, dateTo),
      fetchTwinActiveReservations(accessToken, targetStructureId, dateFrom, dateTo)
    ]);
  }

  const outReal = outRes.filter(r => !r.isMirror);
  const inReal = inRes.filter(r => !r.isMirror);
  const sig = (r: TwinReservationLite) => `${r.twinKey}|${r.checkIn}|${r.checkOut}`;

  const inBySig = new Map<string, TwinReservationLite>();
  for (const m of inRes) inBySig.set(sig(m), m);

  const outBySig = new Map<string, TwinReservationLite>();
  for (const m of outRes) outBySig.set(sig(m), m);

  const outSigs = new Set(outReal.map(sig));
  const inRealSigs = new Set(inReal.map(sig));

  let repairedCreated = 0;
  let repairedCancelled = 0;

  const syncDirection = async (
    srcStruct: JungleSourceStructureId,
    dstStruct: JungleSourceStructureId,
    srcRealList: TwinReservationLite[],
    dstBySig: Map<string, TwinReservationLite>,
    upgradeReason: string
  ) => {
    for (const r of srcRealList) {
      const existing = dstBySig.get(sig(r));
      const needsAgencyUpgrade =
        existing &&
        existing.isMirror &&
        Number(existing.channelId || 233) === 233 &&
        Number(r.channelId || 233) !== 233;

      if (needsAgencyUpgrade && existing) {
        await cancelExistingMirrorReservation({
          supabaseAdmin,
          accessToken,
          srcStruct,
          sourceReservationId: r.id,
          targetStructureId: dstStruct,
          existingMirrorId: existing.id,
          reasonNote: upgradeReason
        });
        dstBySig.delete(sig(r));
        repairedCancelled++;
      }

      if (!dstBySig.has(sig(r))) {
        const mRes = await mirrorReservationToStandby({
          supabaseAdmin,
          accessToken,
          sourceStructureId: srcStruct,
          sourceReservationId: r.id,
          productId: r.productId,
          roomName: r.roomName,
          checkIn: r.checkIn,
          checkOut: r.checkOut,
          guestName: r.guestName,
          isCancelled: false,
          channelId: r.channelId,
          channelRefer: r.channelRefer,
          channelName: r.channelName,
          color: r.color,
          totalGross: r.totalGross && r.totalGross > 0 ? r.totalGross : undefined,
          origPrivateNotes: r.privateNotes || undefined
        });
        if (mRes.mirrored && mRes.action === 'created') {
          repairedCreated++;
        }
      }
    }
  };

  const cleanupOrphans = async (
    mirrorOwnerList: TwinReservationLite[],
    oppositeRealSigs: Set<string>,
    oppositeStruct: JungleSourceStructureId,
    mirrorStruct: JungleSourceStructureId,
    reasonNote: string
  ) => {
    for (const m of mirrorOwnerList.filter(r => r.isMirror)) {
      if (!oppositeRealSigs.has(sig(m))) {
        await cancelExistingMirrorReservation({
          supabaseAdmin,
          accessToken,
          srcStruct: oppositeStruct,
          sourceReservationId: m.origSourceId || m.id,
          targetStructureId: mirrorStruct,
          existingMirrorId: m.id,
          reasonNote
        });
        repairedCancelled++;
      }
    }
  };

  const deduplicateMirrors = async (
    mirrorOwnerList: TwinReservationLite[],
    oppositeRealSigs: Set<string>,
    oppositeStruct: JungleSourceStructureId,
    mirrorStruct: JungleSourceStructureId
  ) => {
    const groups = new Map<string, TwinReservationLite[]>();
    for (const m of mirrorOwnerList) {
      if (!m.isMirror || !oppositeRealSigs.has(sig(m))) continue;
      const key = m.origSourceId ? `orig:${m.origSourceId}` : `sig:${sig(m)}`;
      const bucket = groups.get(key) || [];
      bucket.push(m);
      groups.set(key, bucket);
    }
    for (const bucket of groups.values()) {
      if (bucket.length <= 1) continue;
      bucket.sort((a, b) => {
        const canonRefA = a.origSourceId && a.refer === `MIRROR-${a.origSourceId}`.slice(0, 25) ? 0 : 1;
        const canonRefB = b.origSourceId && b.refer === `MIRROR-${b.origSourceId}`.slice(0, 25) ? 0 : 1;
        if (canonRefA !== canonRefB) return canonRefA - canonRefB;
        return Number(a.id) - Number(b.id);
      });
      const [canonical, ...extras] = bucket;
      if (canonical.origSourceId) {
        await upsertMirrorMapping(supabaseAdmin, oppositeStruct, canonical.origSourceId, mirrorStruct, canonical.id);
      }
      for (const dup of extras) {
        await cancelOctorateReservationDirect(
          accessToken,
          mirrorStruct,
          dup.id,
          `${MIRROR_TAG} Pre-flight duplicate mirror cleanup (${oppositeStruct} #${dup.origSourceId || canonical.id})`
        );
        repairedCancelled++;
      }
    }
  };

  // 1. Direzione Outgoing -> Target (es. Attiva -> Standby) e 2. Direzione inversa Target -> Outgoing
  await syncDirection(outgoing, targetStructureId, outReal, inBySig, 'Upgrading mirror to native OTA agency channel');
  await syncDirection(targetStructureId, outgoing, inReal, outBySig, 'Upgrading reverse mirror to native OTA agency channel');

  // 3. Pulizia specchi orfani e deduplica copie multiple su entrambi i lati
  await cleanupOrphans(inRes, outSigs, outgoing, targetStructureId, 'Pre-flight orphan cleanup');
  await cleanupOrphans(outRes, inRealSigs, targetStructureId, outgoing, 'Pre-flight reverse orphan cleanup');
  await deduplicateMirrors(inRes, outSigs, outgoing, targetStructureId);
  await deduplicateMirrors(outRes, inRealSigs, targetStructureId, outgoing);

  const [outFinal, inFinal] =
    repairedCreated > 0 || repairedCancelled > 0
      ? await Promise.all([
        fetchTwinActiveReservations(accessToken, outgoing, dateFrom, dateTo),
        fetchTwinActiveReservations(accessToken, targetStructureId, dateFrom, dateTo)
      ])
      : [outRes, inRes];

  const inFinalSigs = new Set(inFinal.map(sig));
  const outFinalSigs = new Set(outFinal.map(sig));
  const missingOnTarget = outReal.filter(r => !inFinalSigs.has(sig(r)));
  const missingOnOutgoing = inReal.filter(r => !outFinalSigs.has(sig(r)));
  const allMissing = [...missingOnTarget, ...missingOnOutgoing];

  if (allMissing.length > 0) {
    throw new Error(
      `Verifica Prenotazioni Bilaterale fallita: ${allMissing.length} prenotazioni non risultano allineate tra ${outgoing} e ${targetStructureId} (${allMissing
        .slice(0, 3)
        .map(m => `${m.twinKey} ${m.checkIn}->${m.checkOut}`)
        .join(', ')}). Switch ANNULLATO in sicurezza.`
    );
  }

  return { checked: outReal.length + inReal.length, repairedCreated, repairedCancelled, propagatedEdits };
}

/**
 * Esegue lo Switch sicuro in 6 PASSI A PORTE CHIUSE con VERIFICHE REALE (`GET /calendar`) su tutte le 52 tariffe:
 *  - PASSO 0: Cattura snapshot completo (prezzi normali, disponibilità reali, Sacro Graal) dalla struttura uscente attiva.
 *  - PASSO 1 & 2: Chiude/mette in standby asimmetrico la struttura uscente su tutte le 52 tariffe e verifica da GET /calendar (se fallisce: ABORT).
 *  - PASSO 3 & 4: Mentre la nuova struttura è ANCORA CHIUSA in Stop Sell, allinea/verifica 100% delle prenotazioni (con loghi e colori agenzia) + pre-carica e verifica prezzi e disponibilità.
 *  - PASSO 5: Apre le vendite sulla nuova struttura.
 *  - PASSO 6: Doppia verifica incrociata finale (entrante aperta + uscente chiusa) prima di aggiornare active_jungle_source_v1.
 */
export async function switchActiveJungleStructure(
  supabaseAdmin: any,
  accessToken: string,
  targetStructureId: JungleSourceStructureId
): Promise<{
  ok: boolean;
  active: JungleSourceStructureId;
  outgoing: JungleSourceStructureId;
  closedOld: boolean;
  openedNew: boolean;
  verifiedPhase1: boolean;
  verifiedPhase2: boolean;
  verificationAttempts: number;
  verifiedSampleDates: string[];
  phase1Blocks: number;
  phase2Blocks: number;
  syncedEntries: number;
  reservationSync?: { checked: number; repairedCreated: number; repairedCancelled: number; propagatedEdits: number };
}> {
  const currentActive = await getActiveJungleSource(supabaseAdmin);
  const outgoing: JungleSourceStructureId = targetStructureId === '366879' ? '807324' : '366879';

  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + 365);
  const dateFrom = today.toISOString().slice(0, 10);
  const dateTo = end.toISOString().slice(0, 10);

  // Se l'utente clicca sullo stesso target già attivo, eseguiamo un riallineamento idempotente senza sovrascrivere i prezzi normali
  if (currentActive === targetStructureId) {
    const syncRes = await syncCalendarBetweenStructures(accessToken, targetStructureId, outgoing, {
      keepTargetClosed: true,
      dateFrom,
      dateTo
    });
    return {
      ok: true,
      active: targetStructureId,
      outgoing,
      closedOld: true,
      openedNew: true,
      verifiedPhase1: syncRes.verified,
      verifiedPhase2: syncRes.verified,
      verificationAttempts: syncRes.verificationAttempts,
      verifiedSampleDates: syncRes.verifiedSampleDates,
      phase1Blocks: syncRes.sentBlocks,
      phase2Blocks: 0,
      syncedEntries: syncRes.syncedEntries
    };
  }

  // PASSO 0 (Fotografia Pre-Chiusura): Cattura snapshot completo uscente (prezzi/disp) e entrante (diff-only)
  const [snapshot, targetSnapshot] = await Promise.all([
    fetchTwin52RateSnapshot(accessToken, outgoing, dateFrom, dateTo),
    fetchTwin52RateSnapshot(accessToken, targetStructureId, dateFrom, dateTo)
  ]);
  const expectedMothers = JUNGLE_TWIN_ROOMS.map(r => (outgoing === '366879' ? r.fpvMotherId : r.jungleMotherId));
  const missingMothers = expectedMothers.filter(id => !(snapshot.get(id)?.size));
  if (missingMothers.length > 0) {
    throw new Error(
      `Snapshot incompleto dalla struttura uscente ${outgoing}: tariffe madri mancanti [${missingMothers.join(', ')}]. Switch annullato per sicurezza.`
    );
  }

  const sampleDates = pickVerificationSampleDates(snapshot, outgoing, dateFrom);
  if (sampleDates.length === 0) {
    throw new Error(`Impossibile determinare le date campione per la verifica profonda da ${outgoing}. Switch annullato per sicurezza.`);
  }

  // PASSO 1 (Stop Sell Struttura Uscente): Applica solo le differenze reali verso lo standby sull'uscente
  const phase1Entries = build52RateDailyEntries(outgoing, outgoing, snapshot, 'standby');
  const phase1Filtered = filterChangedDailyEntries(phase1Entries, snapshot);
  const phase1BlocksList = compressDailyBulkItems(phase1Filtered);
  if (phase1BlocksList.length > 0) {
    await postCalendarBulkBlocks(accessToken, phase1BlocksList);
  }

  // PASSO 2 (Verifica Reale dello Stop Sell Uscente): Conferma da GET /calendar/{outgoing} che sia realmente in standby prima di procedere
  const v1 = await verifyStructureCalendarState(accessToken, outgoing, phase1Entries, sampleDates);
  if (!v1.ok) {
    throw new Error(
      `Verifica Profonda PASSO 2 fallita su ${outgoing} dopo ${v1.attempts} tentativi: passaggio a ${targetStructureId} ANNULLATO per prevenire overbooking. Anomalie (${v1.mismatches.length}): ${v1.mismatches.slice(0, 5).join(' | ')}`
    );
  }

  let phase2Posted = false;
  let phase2Filtered: DailyBulkEntry[] = [];
  let phase2Entries: DailyBulkEntry[] = [];
  let phase2BlocksList: CompressedBulkBlock[] = [];
  let reservationSync: Awaited<ReturnType<typeof verifyAndRepairTwinReservationsBeforeSwitch>>;
  let v2Incoming: Awaited<ReturnType<typeof verifyStructureCalendarState>>;
  let v2Outgoing: Awaited<ReturnType<typeof verifyStructureCalendarState>>;

  try {
    // PASSO 3 (Allineamento Totale Prenotazioni sulla Nuova Struttura ANCORA CHIUSA in Standby)
    reservationSync = await verifyAndRepairTwinReservationsBeforeSwitch(
      supabaseAdmin,
      accessToken,
      outgoing,
      targetStructureId,
      dateFrom,
      dateTo
    );

    // PASSO 4 (Scrittura Singola Diff-Only + Wave 3 AC-Lock sulla Nuova Struttura):
    // Invia in un'unica passata le sole differenze verso lo stato Active (eliminando la doppia scrittura pre-load).
    phase2Entries = build52RateDailyEntries(outgoing, targetStructureId, snapshot, 'active');
    phase2Filtered = filterChangedDailyEntries(phase2Entries, targetSnapshot);
    phase2BlocksList = compressDailyBulkItems(phase2Filtered);
    if (phase2BlocksList.length > 0) {
      await postCalendarBulkBlocks(accessToken, phase2BlocksList, {
        onFirstChunkSuccess: () => {
          phase2Posted = true;
        }
      });
    }

    // PASSO 5 (Doppia Verifica Finale Incrociata): Conferma reale che la nuova struttura sia APERTA E la vecchia CHIUSA in Standby
    [v2Incoming, v2Outgoing] = await Promise.all([
      verifyStructureCalendarState(accessToken, targetStructureId, phase2Entries, sampleDates),
      verifyStructureCalendarState(accessToken, outgoing, phase1Entries, sampleDates, {
        maxAttempts: 3,
        initialDelayMs: 800,
        retryDelayMs: 1200
      })
    ]);

    if (!v2Incoming.ok) {
      throw new Error(
        `Verifica Profonda TEMPO 2 fallita su entrante ${targetStructureId} dopo ${v2Incoming.attempts} tentativi. Anomalie (${v2Incoming.mismatches.length}): ${v2Incoming.mismatches.slice(0, 5).join(' | ')}`
      );
    }

    if (!v2Outgoing.ok) {
      throw new Error(
        `ALERT SICUREZZA TEMPO 2: ${outgoing} non risulta più in standby dopo l'apertura di ${targetStructureId} (${v2Outgoing.attempts} tentativi). Anomalie (${v2Outgoing.mismatches.length}): ${v2Outgoing.mismatches.slice(0, 5).join(' | ')}`
      );
    }
  } catch (switchErr: any) {
    // ROLLBACK AUTOMATICO DI SICUREZZA: richiude prima l'entrante se già toccata, poi ripristina l'uscente in Active
    let relockStatus = '';
    if (phase2Posted) {
      try {
        const relockEntries = build52RateDailyEntries(outgoing, targetStructureId, snapshot, 'standby');
        const postPhase2Snap = buildOverlaySnapshot(targetSnapshot, phase2Filtered);
        const relockFiltered = filterChangedDailyEntries(relockEntries, postPhase2Snap);
        const relockBlocks = compressDailyBulkItems(relockFiltered);
        if (relockBlocks.length > 0) {
          await postCalendarBulkBlocks(accessToken, relockBlocks);
        }
        relockStatus = ` Entrante ${targetStructureId} richiusa in standby.`;
      } catch (relockErr: any) {
        relockStatus = ` ATTENZIONE: richiusura entrante ${targetStructureId} fallita (${relockErr?.message || relockErr}).`;
      }
    }

    let rollbackStatus = '';
    try {
      const rollbackEntries = build52RateDailyEntries(outgoing, outgoing, snapshot, 'active');
      const postPhase1Snap = buildOverlaySnapshot(snapshot, phase1Filtered);
      const rollbackFiltered = filterChangedDailyEntries(rollbackEntries, postPhase1Snap);
      const rollbackBlocks = compressDailyBulkItems(rollbackFiltered);
      if (rollbackBlocks.length > 0) {
        await postCalendarBulkBlocks(accessToken, rollbackBlocks);
      }
      rollbackStatus = `Rollback automatico completato: ${outgoing} è stata ripristinata 100% attiva.`;
    } catch (rbErr: any) {
      rollbackStatus = `Rollback automatico su ${outgoing} fallito (${rbErr?.message || rbErr}).`;
    }

    throw new Error(`${switchErr?.message || switchErr} | ${rollbackStatus}${relockStatus}`);
  }

  await setActiveJungleSource(supabaseAdmin, targetStructureId);
  await markStandbySyncCompleted(supabaseAdmin);

  return {
    ok: true,
    active: targetStructureId,
    outgoing,
    closedOld: true,
    openedNew: true,
    verifiedPhase1: true,
    verifiedPhase2: true,
    verificationAttempts: v1.attempts + Math.max(v2Incoming.attempts, v2Outgoing.attempts),
    verifiedSampleDates: sampleDates,
    phase1Blocks: phase1BlocksList.length,
    phase2Blocks: phase2BlocksList.length,
    syncedEntries: phase2Entries.length,
    reservationSync
  };
}
