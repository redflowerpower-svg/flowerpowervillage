/**
 * 🔄 Motore Mirroring & Switch Interscambiabile: Jungle Villas (807324) <-> Flower Power Village (366879)
 *
 * Garantisce che una sola struttura sia attiva in campo alla volta (zero overbooking),
 * operando su tutte le 52 tariffe (4 Madri + 48 Derivate Sacro Graal per struttura) con:
 *  - Switch in 2 Tempi: Prima chiude/mette in standby la struttura uscente (52 tariffe), solo dopo apre l'entrante.
 *  - Regola Standby Asimmetrica:
 *      • Flower Power Village (366879) in standby -> Stop Sell 100% su tutte le 52 tariffe per 365 giorni.
 *      • Jungle Villas (807324) in standby -> Alta/Media (01 Nov - 31 Mag) Stop Sell 100%;
 *        Bassa Stagione Livello 2 (01 Giu - 31 Ott) Keep-Alive APERTO sui soli giorni liberi a prezzo 2x (< 10.000 THB),
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
 * Restituisce true per le date di Bassa Stagione Livello 2 (01 Giugno -> 31 Ottobre),
 * unica finestra in cui Jungle Villas (807324) in standby resta aperta a prezzo raddoppiato (Keep-Alive).
 */
export function isLowSeasonKeepAliveDate(dateStr: string): boolean {
  const mmdd = String(dateStr || '').slice(5, 10);
  if (mmdd.length !== 5) return false;
  return mmdd >= '06-01' && mmdd <= '10-31';
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
}

/**
 * Specchia una prenotazione (creazione o cancellazione) in modo BIDIREZIONALE tra
 * Jungle Villas (807324) e Flower Power Village (366879), coprendo sia prenotazioni sulla
 * struttura attiva sia eventuali prenotazioni Keep-Alive 2x su Jungle Villas in standby,
 * con doppia protezione anti-loop tramite MIRROR_TAG e registro inverso Supabase.
 */
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
    isCancelled
  } = params;

  const srcStruct = String(sourceStructureId);
  if (srcStruct !== '807324' && srcStruct !== '366879') {
    return { mirrored: false, action: 'skipped', reason: `Structure ${srcStruct} does not participate in Jungle mirror` };
  }

  const twin = resolveTwinByProductOrName(productId, roomName);
  if (!twin) {
    return { mirrored: false, action: 'skipped', reason: 'Not a Jungle/Peace&Love twin room' };
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
  const targetMotherId = targetStructureId === '366879' ? twin.fpvMotherId : twin.jungleMotherId;
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

  if (isCancelled) {
    if (!existingMirrorId) {
      return { mirrored: false, action: 'skipped', reason: 'No existing mirror reservation to cancel' };
    }
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
            privateNotes: `${MIRROR_TAG} Cancelled from ${srcStruct} #${sourceReservationId}`
          })
        }
      );
    }
    return {
      mirrored: true,
      action: 'cancelled',
      targetStructureId,
      targetReservationId: existingMirrorId
    };
  }

  if (existingMirrorId) {
    return {
      mirrored: false,
      action: 'skipped',
      targetStructureId,
      targetReservationId: existingMirrorId,
      reason: 'Already mirrored'
    };
  }

  const nameParts = String(guestName || 'Guest').trim().split(/\s+/);
  const firstName = nameParts[0] || 'Guest';
  const lastName = nameParts.slice(1).join(' ') || 'Mirror';

  const checkInDate = String(checkIn).slice(0, 10);
  const checkOutDate = String(checkOut).slice(0, 10);
  const nowIso = new Date().toISOString();

  const createPayload = {
    status: 'CONFIRMED',
    refer: `MIRROR-${sourceReservationId}`.slice(0, 25),
    channelId: 233,
    product: targetMotherId,
    checkin: `${checkInDate}T14:00:00Z`,
    checkout: `${checkOutDate}T12:00:00Z`,
    createTime: nowIso,
    updateTime: nowIso,
    privateNotes: `${MIRROR_TAG} Mirrored from ${srcStruct} #${sourceReservationId} (${twin.name})`,
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

  const res = await fetch(
    `https://api.octorate.com/connect/rest/v1/reservation/${targetStructureId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(createPayload)
    }
  );

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

async function postCalendarBulkBlocks(
  accessToken: string,
  blocks: CompressedBulkBlock[]
): Promise<{ ok: boolean; status: number; sentBlocks: number; lastResponse: any }> {
  const CHUNK_SIZE = 350;
  let lastJson: any = {};
  for (let i = 0; i < blocks.length; i += CHUNK_SIZE) {
    const chunk = blocks.slice(i, i + CHUNK_SIZE);
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
    if (!bulkRes.ok || json?.success === false) {
      throw new Error(
        `Calendar bulk POST failed (${bulkRes.status} at chunk ${i / CHUNK_SIZE}): ${JSON.stringify(json).slice(0, 300)}`
      );
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

        if (targetMode === 'standby') {
          if (toStructureId === '366879') {
            // Standby Flower Power Village (366879): Stop Sell 100% su tutte le 52 tariffe per 365 giorni
            const values: Record<string, any> = pair.isMother
              ? {
                  availability: mDay.availability,
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
                  closedDeparture: true,
                  ...(dDay.minstay ? { minstay: dDay.minstay } : {})
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
                    availability: mDay.availability,
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
                    closedDeparture: true,
                    ...(dDay.minstay ? { minstay: dDay.minstay } : {})
                  };
              entries.push({ room: dstRateId, date: dateStr, values });
            } else if (pair.isMother) {
              // Bassa Stagione Keep-Alive Madre (807324): aperto solo se libera, prezzo raddoppiato 2x (< 10.000 THB)
              const keepAlivePrice = computeStandbyKeepAlivePrice(mDay.price, pair.key);
              const lockDay = !isMotherFree;
              entries.push({
                room: dstRateId,
                date: dateStr,
                values: {
                  availability: mDay.availability,
                  price: keepAlivePrice,
                  stopSells: lockDay,
                  closed: lockDay,
                  closedArrival: lockDay,
                  closedDeparture: lockDay,
                  ...(mDay.minstay ? { minstay: mDay.minstay } : {})
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
                  closedDeparture: forceLockDerived ? true : dDay.closedDeparture,
                  ...(dDay.minstay ? { minstay: dDay.minstay } : {})
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
                availability: mDay.availability,
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
                closedDeparture: pair.isClosedAc ? true : dDay.closedDeparture,
                ...(dDay.minstay ? { minstay: dDay.minstay } : {})
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
 * da una struttura sorgente verso la struttura gemella destinataria.
 */
export async function syncCalendarBetweenStructures(
  accessToken: string,
  fromStructureId: JungleSourceStructureId,
  toStructureId: JungleSourceStructureId,
  options?: { keepTargetClosed?: boolean; daysAhead?: number; dateFrom?: string; dateTo?: string }
): Promise<{ ok: boolean; syncedEntries: number; sentBlocks: number; dateFrom: string; dateTo: string }> {
  const keepTargetClosed = options?.keepTargetClosed ?? true;
  const daysAhead = options?.daysAhead ?? 365;
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + daysAhead);
  const dateFrom = options?.dateFrom || today.toISOString().slice(0, 10);
  const dateTo = options?.dateTo || end.toISOString().slice(0, 10);

  const snapshot = await fetchTwin52RateSnapshot(accessToken, fromStructureId, dateFrom, dateTo);
  const dailyEntries = build52RateDailyEntries(
    fromStructureId,
    toStructureId,
    snapshot,
    keepTargetClosed ? 'standby' : 'active'
  );
  const blocks = compressDailyBulkItems(dailyEntries);
  await postCalendarBulkBlocks(accessToken, blocks);

  return { ok: true, syncedEntries: dailyEntries.length, sentBlocks: blocks.length, dateFrom, dateTo };
}

/**
 * Sincronizza automaticamente il calendario (52 tariffe + Regola Asimmetrica standby)
 * dalla struttura attualmente attiva verso la gemella in standby.
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
}> {
  const active = await getActiveJungleSource(supabaseAdmin);
  const standby: JungleSourceStructureId = active === '807324' ? '366879' : '807324';
  const result = await syncCalendarBetweenStructures(accessToken, active, standby, {
    keepTargetClosed: true,
    ...options
  });
  return {
    ok: result.ok,
    active,
    standby,
    syncedEntries: result.syncedEntries,
    sentBlocks: result.sentBlocks
  };
}

/**
 * Esegue lo Switch sicuro in 2 TEMPI su tutte le 52 tariffe:
 *  - Cattura snapshot completo (prezzi normali, disponibilità reali, Sacro Graal) dalla struttura uscente attiva
 *  - TEMPO 1: Chiude/mette in standby asimmetrico la struttura uscente su tutte le 52 tariffe e attende 200 OK
 *             (in caso di errore si ferma subito: ZERO overbooking).
 *  - TEMPO 2: Applica prezzi normali, disponibilità e regole Sacro Graal su tutte le 52 tariffe della struttura entrante.
 *  - Aggiorna active_jungle_source_v1 su Supabase.
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
  phase1Blocks: number;
  phase2Blocks: number;
  syncedEntries: number;
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
      phase1Blocks: syncRes.sentBlocks,
      phase2Blocks: 0,
      syncedEntries: syncRes.syncedEntries
    };
  }

  // 0. Snapshot affidabile dalla struttura uscente (che possiede prezzi normali + disponibilità reali + Sacro Graal)
  const snapshot = await fetchTwin52RateSnapshot(accessToken, outgoing, dateFrom, dateTo);
  const expectedMothers = JUNGLE_TWIN_ROOMS.map(r => (outgoing === '366879' ? r.fpvMotherId : r.jungleMotherId));
  const missingMothers = expectedMothers.filter(id => !(snapshot.get(id)?.size));
  if (missingMothers.length > 0) {
    throw new Error(
      `Snapshot incompleto dalla struttura uscente ${outgoing}: tariffe madri mancanti [${missingMothers.join(', ')}]. Switch annullato per sicurezza.`
    );
  }

  // TEMPO 1: Prima chiudi / metti in standby la struttura uscente su tutte le 52 tariffe
  const phase1Entries = build52RateDailyEntries(outgoing, outgoing, snapshot, 'standby');
  const phase1BlocksList = compressDailyBulkItems(phase1Entries);
  await postCalendarBulkBlocks(accessToken, phase1BlocksList);

  // TEMPO 2: Solo dopo conferma 200 OK del Tempo 1, apri e allinea la struttura entrante su tutte le 52 tariffe
  const phase2Entries = build52RateDailyEntries(outgoing, targetStructureId, snapshot, 'active');
  const phase2BlocksList = compressDailyBulkItems(phase2Entries);
  await postCalendarBulkBlocks(accessToken, phase2BlocksList);

  await setActiveJungleSource(supabaseAdmin, targetStructureId);

  return {
    ok: true,
    active: targetStructureId,
    outgoing,
    closedOld: true,
    openedNew: true,
    phase1Blocks: phase1BlocksList.length,
    phase2Blocks: phase2BlocksList.length,
    syncedEntries: phase2Entries.length
  };
}
