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

export type JungleSourceStructureId = '807324' | '366879';

export interface JungleTwinRoom {
  key: 'jv' | 'jvl' | 'jvr' | 'pl';
  name: string;
  jungleName: string;
  jungleStructureId: '807324';
  jungleMotherId: number;
  fpvName: string;
  fpvStructureId: '366879';
  fpvMotherId: number;
}

export const JUNGLE_TWIN_ROOMS: JungleTwinRoom[] = [
  {
    key: 'jv',
    name: 'Jungle Villa',
    jungleName: 'Jungle Villa 2',
    jungleStructureId: '807324',
    jungleMotherId: 529773,
    fpvName: 'Jungle Villa',
    fpvStructureId: '366879',
    fpvMotherId: 960389
  },
  {
    key: 'jvl',
    name: 'Jungle Villa Left',
    jungleName: 'Jungle Villa Left 2',
    jungleStructureId: '807324',
    jungleMotherId: 495795,
    fpvName: 'Jungle Villa Left',
    fpvStructureId: '366879',
    fpvMotherId: 960385
  },
  {
    key: 'jvr',
    name: 'Jungle Villa Right',
    jungleName: 'Jungle Villa Right 2',
    jungleStructureId: '807324',
    jungleMotherId: 495796,
    fpvName: 'Jungle Villa Right',
    fpvStructureId: '366879',
    fpvMotherId: 960387
  },
  {
    key: 'pl',
    name: 'Peace & Love Villa',
    jungleName: 'Peace & Love Villa 2',
    jungleStructureId: '807324',
    jungleMotherId: 494840,
    fpvName: 'Peace & Love Villa',
    fpvStructureId: '366879',
    fpvMotherId: 960383
  }
];

export interface JungleRatePair {
  key: JungleTwinRoom['key'];
  label: string;
  jungleId: number;
  fpvId: number;
  isMother: boolean;
  isClosedAc: boolean;
  isBe?: boolean;
  isStandard7d?: boolean;
}

/**
 * Mappa esatta verificata Live su Octorate: tutte le 52 coppie (4 Madri + 48 Derivate Sacro Graal).
 */
export const JUNGLE_RATE_PAIRS: JungleRatePair[] = [
  // ── 1. Peace & Love Villa (pl) ──────────────────────────────────────────────
  { key: 'pl', label: 'P&L Mother', jungleId: 494840, fpvId: 960383, isMother: true, isClosedAc: false },
  { key: 'pl', label: 'P&L BE', jungleId: 495566, fpvId: 960391, isMother: false, isClosedAc: false, isBe: true },
  { key: 'pl', label: 'P&L 7d', jungleId: 495549, fpvId: 960392, isMother: false, isClosedAc: false, isStandard7d: true },
  { key: 'pl', label: 'P&L Main bnb-7d', jungleId: 495575, fpvId: 960393, isMother: false, isClosedAc: false },
  { key: 'pl', label: 'P&L Main bnb-14d', jungleId: 495580, fpvId: 960394, isMother: false, isClosedAc: false },
  { key: 'pl', label: 'P&L AGD AC-7d', jungleId: 921874, fpvId: 960395, isMother: false, isClosedAc: true },
  { key: 'pl', label: 'P&L AGD AC-14d', jungleId: 921875, fpvId: 960396, isMother: false, isClosedAc: true },
  { key: 'pl', label: 'P&L AirBnB', jungleId: 495569, fpvId: 960397, isMother: false, isClosedAc: false },
  { key: 'pl', label: 'P&L AirBnB AC', jungleId: 495609, fpvId: 960398, isMother: false, isClosedAc: true },
  { key: 'pl', label: 'P&L AC7d', jungleId: 495552, fpvId: 960399, isMother: false, isClosedAc: true },
  { key: 'pl', label: 'P&L AC14d', jungleId: 495565, fpvId: 960400, isMother: false, isClosedAc: true },
  { key: 'pl', label: 'P&L AC bnb-7d', jungleId: 495587, fpvId: 960401, isMother: false, isClosedAc: true },
  { key: 'pl', label: 'P&L AC bnb-14d', jungleId: 495593, fpvId: 960402, isMother: false, isClosedAc: true },

  // ── 2. Jungle Villa (jv) ────────────────────────────────────────────────────
  { key: 'jv', label: 'JV Mother', jungleId: 529773, fpvId: 960389, isMother: true, isClosedAc: false },
  { key: 'jv', label: 'JV BE', jungleId: 529784, fpvId: 960403, isMother: false, isClosedAc: false, isBe: true },
  { key: 'jv', label: 'JV 7d', jungleId: 529778, fpvId: 960404, isMother: false, isClosedAc: false, isStandard7d: true },
  { key: 'jv', label: 'JV Main bnb-7d', jungleId: 529788, fpvId: 960405, isMother: false, isClosedAc: false },
  { key: 'jv', label: 'JV Main bnb-14d', jungleId: 529792, fpvId: 960406, isMother: false, isClosedAc: false },
  { key: 'jv', label: 'JV AGD AC-7d', jungleId: 921868, fpvId: 960407, isMother: false, isClosedAc: true },
  { key: 'jv', label: 'JV AGD AC-14d', jungleId: 921869, fpvId: 960408, isMother: false, isClosedAc: true },
  { key: 'jv', label: 'JV AirBnB', jungleId: 529783, fpvId: 960409, isMother: false, isClosedAc: false },
  { key: 'jv', label: 'JV AirBnB AC', jungleId: 529813, fpvId: 960410, isMother: false, isClosedAc: true },
  { key: 'jv', label: 'JV AC7d', jungleId: 529780, fpvId: 960411, isMother: false, isClosedAc: true },
  { key: 'jv', label: 'JV AC14d', jungleId: 529781, fpvId: 960412, isMother: false, isClosedAc: true },
  { key: 'jv', label: 'JV AC bnb-7d', jungleId: 916816, fpvId: 960413, isMother: false, isClosedAc: true },
  { key: 'jv', label: 'JV AC bnb-14d', jungleId: 529801, fpvId: 960414, isMother: false, isClosedAc: true },

  // ── 3. Jungle Villa Left (jvl) ──────────────────────────────────────────────
  { key: 'jvl', label: 'JVL Mother', jungleId: 495795, fpvId: 960385, isMother: true, isClosedAc: false },
  { key: 'jvl', label: 'JVL BE', jungleId: 495807, fpvId: 960415, isMother: false, isClosedAc: false, isBe: true },
  { key: 'jvl', label: 'JVL 7d', jungleId: 495803, fpvId: 960416, isMother: false, isClosedAc: false, isStandard7d: true },
  { key: 'jvl', label: 'JVL Main bnb-7d', jungleId: 496001, fpvId: 960417, isMother: false, isClosedAc: false },
  { key: 'jvl', label: 'JVL Main bnb-14d', jungleId: 496009, fpvId: 960418, isMother: false, isClosedAc: false },
  { key: 'jvl', label: 'JVL AGD AC-7d', jungleId: 921870, fpvId: 960419, isMother: false, isClosedAc: true },
  { key: 'jvl', label: 'JVL AGD AC-14d', jungleId: 921871, fpvId: 960420, isMother: false, isClosedAc: true },
  { key: 'jvl', label: 'JVL AirBnB', jungleId: 495810, fpvId: 960421, isMother: false, isClosedAc: false },
  { key: 'jvl', label: 'JVL AirBnB AC', jungleId: 496057, fpvId: 960422, isMother: false, isClosedAc: true },
  { key: 'jvl', label: 'JVL AC7d', jungleId: 495805, fpvId: 960423, isMother: false, isClosedAc: true },
  { key: 'jvl', label: 'JVL AC14d', jungleId: 495806, fpvId: 960424, isMother: false, isClosedAc: true },
  { key: 'jvl', label: 'JVL AC bnb-7d', jungleId: 496022, fpvId: 960425, isMother: false, isClosedAc: true },
  { key: 'jvl', label: 'JVL AC bnb-14d', jungleId: 496031, fpvId: 960426, isMother: false, isClosedAc: true },

  // ── 4. Jungle Villa Right (jvr) ─────────────────────────────────────────────
  { key: 'jvr', label: 'JVR Mother', jungleId: 495796, fpvId: 960387, isMother: true, isClosedAc: false },
  { key: 'jvr', label: 'JVR BE', jungleId: 495980, fpvId: 960427, isMother: false, isClosedAc: false, isBe: true },
  { key: 'jvr', label: 'JVR 7d', jungleId: 495976, fpvId: 960428, isMother: false, isClosedAc: false, isStandard7d: true },
  { key: 'jvr', label: 'JVR Main bnb-7d', jungleId: 496002, fpvId: 960429, isMother: false, isClosedAc: false },
  { key: 'jvr', label: 'JVR Main bnb-14d', jungleId: 496010, fpvId: 960430, isMother: false, isClosedAc: false },
  { key: 'jvr', label: 'JVR AGD AC-7d', jungleId: 921872, fpvId: 960431, isMother: false, isClosedAc: true },
  { key: 'jvr', label: 'JVR AGD AC-14d', jungleId: 921873, fpvId: 960432, isMother: false, isClosedAc: true },
  { key: 'jvr', label: 'JVR AirBnB', jungleId: 495982, fpvId: 960433, isMother: false, isClosedAc: false },
  { key: 'jvr', label: 'JVR AirBnB AC', jungleId: 496056, fpvId: 960434, isMother: false, isClosedAc: true },
  { key: 'jvr', label: 'JVR AC7d', jungleId: 495978, fpvId: 960435, isMother: false, isClosedAc: true },
  { key: 'jvr', label: 'JVR AC14d', jungleId: 495979, fpvId: 960436, isMother: false, isClosedAc: true },
  { key: 'jvr', label: 'JVR AC bnb-7d', jungleId: 496021, fpvId: 960437, isMother: false, isClosedAc: true },
  { key: 'jvr', label: 'JVR AC bnb-14d', jungleId: 496030, fpvId: 960438, isMother: false, isClosedAc: true }
];

const RATE_PAIR_BY_ID = new Map<number, JungleRatePair>();
for (const p of JUNGLE_RATE_PAIRS) {
  RATE_PAIR_BY_ID.set(p.jungleId, p);
  RATE_PAIR_BY_ID.set(p.fpvId, p);
}

export function getJungleTwinPairByRateId(id: number | string | null | undefined): JungleRatePair | null {
  const num = Number(id);
  if (!num) return null;
  return RATE_PAIR_BY_ID.get(num) || null;
}

export function getCompanionRateId(id: number | string | null | undefined): number | null {
  const num = Number(id);
  if (!num) return null;
  const pair = RATE_PAIR_BY_ID.get(num);
  if (!pair) return null;
  return pair.jungleId === num ? pair.fpvId : pair.jungleId;
}

export function getJungleTwinRateIds(structureId: JungleSourceStructureId): number[] {
  return JUNGLE_RATE_PAIRS.map(p => (structureId === '366879' ? p.fpvId : p.jungleId));
}

export function getJungleTwinDerivedIds(structureId: JungleSourceStructureId): number[] {
  return JUNGLE_RATE_PAIRS.filter(p => !p.isMother).map(p => (structureId === '366879' ? p.fpvId : p.jungleId));
}

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

export const MIRROR_TAG = '[MIRROR_SYNC]';
const ACTIVE_SOURCE_CONFIG_ID = 'active_jungle_source_v1';

export function isMirrorReservation(booking: any): boolean {
  if (!booking) return false;
  const hay = [
    booking.privateNotes,
    booking.notes,
    booking.refer,
    booking.channelName,
    booking.guestName
  ]
    .filter(Boolean)
    .join(' ');
  return hay.includes(MIRROR_TAG) || String(booking.refer || '').startsWith('MIRROR-');
}

export function resolveTwinByProductOrName(
  productId?: number | string | null,
  roomName?: string | null
): JungleTwinRoom | null {
  const pair = getJungleTwinPairByRateId(productId);
  if (pair) {
    return JUNGLE_TWIN_ROOMS.find(r => r.key === pair.key) || null;
  }
  const s = String(roomName || '').toLowerCase();
  if (!s) return null;
  if (s.includes('peace') || s.includes('love') || s.includes('p&l')) {
    return JUNGLE_TWIN_ROOMS.find(r => r.key === 'pl') || null;
  }
  if (s.includes('left') || s.includes('jvl')) {
    return JUNGLE_TWIN_ROOMS.find(r => r.key === 'jvl') || null;
  }
  if (s.includes('right') || s.includes('jvr')) {
    return JUNGLE_TWIN_ROOMS.find(r => r.key === 'jvr') || null;
  }
  if (s.includes('jungle') || s.includes('jv')) {
    return JUNGLE_TWIN_ROOMS.find(r => r.key === 'jv') || null;
  }
  return null;
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
}

/**
 * Specchia una prenotazione (creazione o cancellazione) in modo BIDIREZIONALE tra
 * Jungle Villas (807324) e Flower Power Village (366879), coprendo sia prenotazioni sulla
 * struttura attiva sia eventuali prenotazioni Keep-Alive 2x su Jungle Villas in standby,
 * con doppia protezione anti-loop tramite MIRROR_TAG e registro inverso Supabase.
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

  const delRes = await fetch(
    `https://api.octorate.com/connect/rest/v1/reservation/${targetStructureId}/${existingMirrorId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
    }
  );
  if (!delRes.ok) {
    await fetch(
      `https://api.octorate.com/connect/rest/v1/reservation/${targetStructureId}/${existingMirrorId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          status: 'CANCELLED',
          privateNotes: `${MIRROR_TAG} ${reasonNote} (${srcStruct} #${sourceReservationId})`
        })
      }
    );
  }

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
    color
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

  let existingMirrorId: string | null = null;
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('telegram_config')
      .select('chat_id')
      .eq('id', mapKey)
      .maybeSingle();
    if (data?.chat_id) existingMirrorId = String(data.chat_id);
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
    if (!existingMirrorId) {
      return { mirrored: false, action: 'skipped', reason: 'No existing mirror reservation to cancel' };
    }
    await cancelExistingMirrorReservation({
      supabaseAdmin,
      accessToken,
      srcStruct,
      sourceReservationId,
      targetStructureId,
      existingMirrorId,
      reasonNote: 'Cancelled from'
    });
    return {
      mirrored: true,
      action: 'cancelled',
      targetStructureId,
      targetReservationId: existingMirrorId
    };
  }

  const checkInDate = String(checkIn).slice(0, 10);
  const checkOutDate = String(checkOut).slice(0, 10);
  const numChannelId = Number(channelId || 233);

  if (existingMirrorId) {
    // Verifica se la copia esistente ha ancora stesse date, stessa villa e canale OTA allineato
    const checkRes = await fetch(
      `https://api.octorate.com/connect/rest/v1/reservation/${targetStructureId}/${existingMirrorId}`,
      { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } }
    ).catch(() => null);

    if (checkRes && checkRes.ok) {
      const existingData: any = await checkRes.json().catch(() => ({}));
      const exStatus = String(existingData?.status || '').toUpperCase();
      const exIn = String(existingData?.checkin || '').slice(0, 10);
      const exOut = String(existingData?.checkout || '').slice(0, 10);
      const exProd = Number(existingData?.product || 0);
      const exCh = Number(existingData?.channelId || 233);

      const isUpToDate =
        exStatus !== 'CANCELLED' &&
        exStatus !== 'CANCELED' &&
        exIn === checkInDate &&
        exOut === checkOutDate &&
        exProd === targetMotherId &&
        (exCh === numChannelId || numChannelId === 233);

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

    // Se date, villa o canale sono cambiati, rimuove la vecchia copia prima di ricrearla aggiornata
    await cancelExistingMirrorReservation({
      supabaseAdmin,
      accessToken,
      srcStruct,
      sourceReservationId: String(sourceReservationId),
      targetStructureId,
      existingMirrorId,
      reasonNote: 'Updated dates/room/channel from'
    });
  }

  const nameParts = String(guestName || 'Guest').trim().split(/\s+/);
  const firstName = nameParts[0] || 'Guest';
  const lastName = nameParts.slice(1).join(' ') || 'Guest';
  const nowIso = new Date().toISOString();
  const directColor =
    (numChannelId === 288 || numChannelId === 233) &&
    color &&
    /^#[0-9a-fA-F]{6}$/.test(String(color).trim())
      ? String(color).trim()
      : undefined;

  const basePayload = {
    status: 'CONFIRMED',
    channelId: numChannelId,
    ...(directColor ? { color: directColor } : {}),
    product: targetMotherId,
    checkin: `${checkInDate}T14:00:00Z`,
    checkout: `${checkOutDate}T12:00:00Z`,
    createTime: nowIso,
    updateTime: nowIso,
    privateNotes: `${MIRROR_TAG} Agency: ${channelName || 'Direct'} | Ref: ${channelRefer || sourceReservationId} | Orig: ${srcStruct} #${sourceReservationId} (${twin.name})`,
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

  if (supabaseAdmin) {
    const now = new Date().toISOString();
    await supabaseAdmin.from('telegram_config').upsert([
      {
        id: mapKey,
        bot_token: String(targetStructureId),
        chat_id: String(newId),
        updated_at: now
      },
      {
        id: `mirror_target_${targetStructureId}_${newId}`,
        bot_token: String(srcStruct),
        chat_id: String(sourceReservationId),
        updated_at: now
      }
    ]);
  }

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
 * Filtra solo le righe giornaliere effettivamente diverse dallo snapshot attuale su Octorate.
 * Confronta solo i 4 campi reali restituiti da GET /calendar (`availability`, `price`, `stopSells`, `minstay`),
 * mantiene le derivate non-AC effettivamente cambiate e genera un unico blocco continuo `isClosedAc`
 * sull'intero span aperto della rispettiva Madre per la chiusura finale in Wave 4.
 */
function filterChangedDailyEntries(
  entries: DailyBulkEntry[],
  existingSnapshot: Map<number, Map<string, SnapshotDay>>
): DailyBulkEntry[] {
  const openSpanByKey = new Map<string, { minDate: string; maxDate: string }>();

  const hasDiff = (e: DailyBulkEntry): boolean => {
    const cur = existingSnapshot.get(e.room)?.get(e.date);
    if (!cur) return true;
    const v = e.values;
    if (v.availability !== undefined && Number(cur.availability) !== Number(v.availability)) return true;
    if (v.price !== undefined && Math.abs(Number(cur.price ?? -1) - Number(v.price)) > 0.01) return true;
    if (v.stopSells !== undefined && cur.stopSells !== Boolean(v.stopSells)) return true;
    if (v.minstay !== undefined && Number(cur.minstay ?? 0) !== Number(v.minstay)) return true;
    return false;
  };

  for (const e of entries) {
    const pair = RATE_PAIR_BY_ID.get(e.room);
    if (pair && !pair.isClosedAc && e.values.stopSells === false && hasDiff(e)) {
      const prevSpan = openSpanByKey.get(pair.key);
      if (!prevSpan) {
        openSpanByKey.set(pair.key, { minDate: e.date, maxDate: e.date });
      } else {
        if (e.date < prevSpan.minDate) prevSpan.minDate = e.date;
        if (e.date > prevSpan.maxDate) prevSpan.maxDate = e.date;
      }
    }
  }

  return entries.filter(e => {
    const pair = RATE_PAIR_BY_ID.get(e.room);
    if (pair?.isClosedAc) {
      if (hasDiff(e)) return true;
      const span = openSpanByKey.get(pair.key);
      return Boolean(span && e.date >= span.minDate && e.date <= span.maxDate);
    }
    return hasDiff(e);
  });
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

    const srcMotherId = fromStructureId === '366879' ? motherPair.fpvId : motherPair.jungleId;
    const motherDays = snapshot.get(srcMotherId);
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
            entries.push({
              room: dstRateId,
              date: dateStr,
              values: {
                ...availField,
                ...(mDay.price ? { price: mDay.price } : {}),
                stopSells: mDay.stopSells,
                closed: mDay.closed,
                closedArrival: mDay.closedArrival,
                closedDeparture: mDay.closedDeparture,
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
  options?: { daysAhead?: number; dateFrom?: string; dateTo?: string }
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
  try {
    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() + 365);
    await verifyAndRepairTwinReservationsBeforeSwitch(
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
  const result = await syncCalendarBetweenStructures(accessToken, active, standby, {
    keepTargetClosed: true,
    ...options
  });
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
  channelRefer?: string;
  channelName?: string;
  color?: string;
  isMirror: boolean;
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

      const checkIn = String(r.checkin || r.checkIn || '').slice(0, 10);
      const checkOut = String(r.checkout || r.checkOut || '').slice(0, 10);
      if (!checkIn || !checkOut) continue;

      results.push({
        id: String(r.id ?? ''),
        twinKey: twin.key,
        checkIn,
        checkOut,
        guestName: String(r.referent || `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'Guest'),
        productId,
        roomName,
        channelId: r.channelId,
        channelRefer: r.channelRefer || r.refer,
        channelName: r.channelName,
        color: r.color,
        isMirror: isMirrorReservation(r)
      });
    }

    const totalPages = Number(json?.totalPages ?? 0);
    if (rows.length < 50 || (totalPages > 0 && page + 1 >= totalPages)) break;
    page++;
  }

  return results;
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
): Promise<{ checked: number; repairedCreated: number; repairedCancelled: number }> {
  const [outRes, inRes] = await Promise.all([
    fetchTwinActiveReservations(accessToken, outgoing, dateFrom, dateTo),
    fetchTwinActiveReservations(accessToken, targetStructureId, dateFrom, dateTo)
  ]);

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
          color: r.color
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
          sourceReservationId: m.id,
          targetStructureId: mirrorStruct,
          existingMirrorId: m.id,
          reasonNote
        });
        repairedCancelled++;
      }
    }
  };

  // 1. Direzione Outgoing -> Target (es. Attiva -> Standby) e 2. Direzione inversa Target -> Outgoing
  await syncDirection(outgoing, targetStructureId, outReal, inBySig, 'Upgrading mirror to native OTA agency channel');
  await syncDirection(targetStructureId, outgoing, inReal, outBySig, 'Upgrading reverse mirror to native OTA agency channel');

  // 3. Pulizia specchi orfani su entrambi i lati (solo se non esiste più la reale corrispondente sull'altro lato)
  await cleanupOrphans(inRes, outSigs, outgoing, targetStructureId, 'Pre-flight orphan cleanup');
  await cleanupOrphans(outRes, inRealSigs, targetStructureId, outgoing, 'Pre-flight reverse orphan cleanup');

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

  return { checked: outReal.length + inReal.length, repairedCreated, repairedCancelled };
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
  reservationSync?: { checked: number; repairedCreated: number; repairedCancelled: number };
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
