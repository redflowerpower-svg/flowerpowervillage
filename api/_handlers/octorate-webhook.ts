import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { executeAutoShieldForReservation } from "../_helpers/octorate-auto-shield.js";
import { checkAndSyncCascadeLastMinute } from "../_helpers/octorate-cascade-sync.js";
import { handleDirectReservationCancellation } from "../_helpers/cancellation-email.js";
import { checkAndNotifyOverbookings } from "../_helpers/overbooking-detector.js";
import { sendDepartmentTelegramMessage } from "../_helpers/telegram.js";
import { formatDateDMY, toThailandDateStr } from "../_helpers/date-formatter.js";
import { clearOctorateGridCache } from "./octorate.js";
import { ALL_OCTORATE_STRUCTURE_IDS, getOctorateStructureByRoomId } from "../_helpers/octorate-structures.js";
import {
  isDateLockedForRoom,
  loadClosedRoomLocks,
  resolveLockableRoom,
  sealLockedRoomRangeOnOctorate
} from "../_helpers/octorate-closed-room-lock.js";
import {
  expandMinStayEntryWithStandbyKeepAlive,
  getActiveJungleSource,
  getCompanionRateId,
  getJungleTwinPairByRateId,
  isMirrorReservation,
  JUNGLE_RATE_PAIRS,
  JungleSourceStructureId,
  mirrorReservationToStandby,
  parseOctorateTimestampMs,
  postOctorateCalendarBulkWithRetry,
  syncActiveToStandbyCalendar,
  syncManualMirrorEditToCounterpart
} from "../_helpers/octorate-jungle-mirror.js";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  return (supabaseUrl && serviceRoleKey) ? createClient(supabaseUrl, serviceRoleKey) : null;
}

// Global DRY_RUN mode flag (simulazione in memoria / log per la massima sicurezza)
const DRY_RUN = true;
const STAGING_LOCK_IDS = new Set([
  '649669', '932243', '932244', '932246', '932247', '932248', '932249', '932250', '932251', '932252', '932253', '932254', '932255',
  '921799', '932256', '932257', '932259', '932260', '932261', '932262', '932263', '932264', '932265', '932266', '932267', '932268'
]);

// Mappatura Canonica 1:1 ID Madre, Prodotti Derivati e Keyword OTA per Octorate (212 Prodotti)
export const ALL_ACCOMMODATIONS_MAP: Record<string, { motherId: number; name: string; ids: string[]; keywords: string[][]; linkedKeys?: string[] }> = {
  'jungle villa': {
    motherId: 529773,
    name: 'Jungle Villa',
    ids: ['529773', '529784', '529778', '529792', '529788', '529780', '916816', '529781', '529801', '921868', '921869', '529783', '529813', '960389', '960403', '960404', '960405', '960406', '960407', '960408', '960409', '960410', '960411', '960412', '960413', '960414'],
    keywords: [["jungle", "jv"], ["villa", "ac", "be"]],
    linkedKeys: ['jungle villa left', 'jungle villa right']
  },
  'jungle villa left': {
    motherId: 495795,
    name: 'Jungle Villa Left',
    // Rimuoviamo eventuali ID non esistenti su Octorate (es. 495804)
    ids: ['495795', '495807', '495803', '496009', '496001', '495805', '496022', '495806', '496031', '921870', '921871', '495810', '496057', '960385', '960415', '960416', '960417', '960418', '960419', '960420', '960421', '960422', '960423', '960424', '960425', '960426'],
    keywords: [["jungle", "jv"], ["left", "jvl"]],
    linkedKeys: ['jungle villa']
  },
  'jungle villa right': {
    motherId: 495796,
    name: 'Jungle Villa Right',
    ids: ['495796', '495980', '495976', '496010', '496002', '495978', '496021', '495979', '496030', '921872', '921873', '495982', '496056', '960387', '960427', '960428', '960429', '960430', '960431', '960432', '960433', '960434', '960435', '960436', '960437', '960438'],
    keywords: [["jungle", "jv"], ["right", "jvr"]],
    linkedKeys: ['jungle villa']
  },
  'peace & love villa': {
    motherId: 494840,
    name: 'Peace & Love Villa',
    ids: ['494840', '495566', '495549', '495580', '495575', '495552', '495587', '495565', '495593', '921874', '921875', '495569', '495609', '960383', '960391', '960392', '960393', '960394', '960395', '960396', '960397', '960398', '960399', '960400', '960401', '960402'],
    keywords: [["peace", "love", "p&l"]]
  },
  'villa penthouse': {
    motherId: 421511,
    name: 'Villa Penthouse',
    ids: ['421511', '449348', '422445', '421516', '421520', '421522', '421525', '421527', '421530', '921876', '921877', '421532', '421533'],
    keywords: [["penthouse", "pent"]]
  },
  'yellow bungalow': {
    motherId: 293957,
    name: 'Yellow Bungalow',
    ids: ['293957', '449385', '422422', '332055', '332054', '331921', '332057', '331922', '332060', '921878', '921879', '297022', '340198'],
    keywords: [["yellow"]]
  },
  'red bungalow': {
    motherId: 293954,
    name: 'Red Bungalow',
    ids: ['293954', '449422', '422131', '332030', '332029', '330964', '332035', '330970', '332036', '921880', '921881', '297021', '340196'],
    keywords: [["red"]]
  },
  'green bungalow': {
    motherId: 293962,
    name: 'Green Bungalow',
    ids: ['293962', '449668', '422402', '332070', '332066', '331923', '332072', '331924', '332074', '921882', '921883', '297023', '340200'],
    keywords: [["green"]]
  },
  'camel tent bungalow': {
    motherId: 293965,
    name: 'Camel Tent',
    ids: ['293965', '449675', '422325', '332089', '332084', '297025'],
    keywords: [["camel"]]
  },
  'lagoon tent bungalow': {
    motherId: 293955,
    name: 'Lagoon Tent',
    ids: ['293955', '449674', '422351', '332081', '332077', '297024'],
    keywords: [["lagoon"]]
  },
  'internal room': {
    motherId: 293942,
    name: 'Internal Room',
    ids: ['293942', '449742', '872182', '332109', '332105', '340367', '916840', '421998', '916838', '921898', '921899', '297027', '422147'],
    keywords: [["internal", "inter"]]
  },
  'room 1': {
    motherId: 293963,
    name: 'Room 1',
    ids: ['293963', '449678', '422300', '332737', '332735', '331976', '916818', '331977', '916402', '921889', '921890', '297033', '421505'],
    keywords: [["room", "hub", "r1"], ["1", "one"]]
  },
  'room 2': {
    motherId: 293959,
    name: 'Room 2',
    ids: ['293959', '449684', '422296', '332741', '332739', '331966', '332119', '331967', '332134', '921891', '921900', '297032', '421506'],
    keywords: [["room", "hub", "r2"], ["2", "two"]]
  },
  'room 3': {
    motherId: 293948,
    name: 'Room 3',
    ids: ['293948', '449699', '422293', '332743', '332757', '331968', '332121', '331969', '332136', '921892', '921893', '297028', '421507'],
    keywords: [["room", "hub", "r3"], ["3", "three"]]
  },
  'room 4': {
    motherId: 293945,
    name: 'Room 4',
    ids: ['293945', '449724', '422265', '332759', '332746', '331970', '332123', '331971', '332138', '921894', '921895', '297029', '421508'],
    keywords: [["room", "hub", "r4"], ["4", "four"]]
  },
  'room 5': {
    motherId: 293943,
    name: 'Room 5',
    ids: ['293943', '449730', '422213', '332765', '332763', '331972', '332125', '331973', '332140', '921896', '921897', '297031', '421509'],
    keywords: [["room", "hub", "r5"], ["5", "five"]]
  },
  'lodge 1': {
    motherId: 293951,
    name: 'Lodge 1',
    ids: ['293951', '449736', '422149', '332769', '332767', '331974', '332129', '422157', '332142', '921884', '921885', '297030', '421510'],
    keywords: [["lodge"], ["1", "one"]]
  },
  'lodge 2': {
    motherId: 883795,
    name: 'Lodge 2',
    ids: ['883795', '923905', '916110', '916107', '916109', '916114', '916829', '916105', '916830', '921886', '921887', '916103', '916104'],
    keywords: [["lodge"], ["2", "two"]]
  },
  'fake bungalow 1': {
    motherId: 649669,
    name: 'Fake Bungalow 1',
    ids: ['649669', '932243', '932244', '932246', '932247', '932248', '932249', '932250', '932251', '932252', '932253', '932254', '932255'],
    keywords: [["fake"], ["1", "one"]]
  },
  'fake bungalow 2': {
    motherId: 921799,
    name: 'Fake Bungalow 2',
    ids: ['921799', '932256', '932257', '932259', '932260', '932261', '932262', '932263', '932264', '932265', '932266', '932267', '932268'],
    keywords: [["fake"], ["2", "two"]]
  }
};

export function getCanonicalAccommodation(booking: any): { key: string; name: string; motherId: number } | null {
  if (!booking) return null;
  const bProduct = String(booking.product || booking.pmsProduct || booking.accommodation_id || booking.roomId || '').trim();
  const bName = String(booking.roomName || booking.accommodation_name || booking.room_name || '').toLowerCase().trim();

  // 1. Direct match by Product ID in 212 rate plans map
  if (bProduct) {
    for (const [key, entry] of Object.entries(ALL_ACCOMMODATIONS_MAP)) {
      if (entry.ids.includes(bProduct)) {
        return { key, name: entry.name, motherId: entry.motherId };
      }
    }
  }

  // 2. Fuzzy match by OTA Name / Keywords
  if (bName) {
    if (bName.includes('jvr') || bName.includes('right')) {
      return { key: 'jungle villa right', name: 'Jungle Villa Right', motherId: 495796 };
    }
    if (bName.includes('jvl') || bName.includes('left')) {
      return { key: 'jungle villa left', name: 'Jungle Villa Left', motherId: 495795 };
    }

    for (const [key, entry] of Object.entries(ALL_ACCOMMODATIONS_MAP)) {
      const matchAllGroups = entry.keywords.every(group => group.some(kw => bName.includes(kw)));
      if (matchAllGroups) {
        return { key, name: entry.name, motherId: entry.motherId };
      }
    }
  }

  return null;
}

// 🎯 SORGENTE DI VERITÀ: Timeline Min Stay configurata in Gestione Tariffe Derivate
const WEBHOOK_MIN_STAY_TIMELINE = [
  { dateFrom: '2026-08-01', dateTo: '2026-12-15', minStay: 2 },
  { dateFrom: '2026-12-16', dateTo: '2027-01-15', minStay: 5 },
  { dateFrom: '2027-01-16', dateTo: '2027-03-31', minStay: 3 },
  { dateFrom: '2027-04-01', dateTo: '2027-10-31', minStay: 2 }
];

function getBaselineMinStay(dateStr: string): number {
  if (!dateStr || typeof dateStr !== 'string') return 2;
  const dStr = dateStr.slice(0, 10);
  const matched = WEBHOOK_MIN_STAY_TIMELINE.find(p => dStr >= p.dateFrom && dStr <= p.dateTo);
  return matched?.minStay || 2;
}

export interface DynamicMinStayUpdate {
  roomTypeId: string;
  accommodationName: string;
  dateFrom: string;
  dateTo: string;
  minStay: number;
  reason: string;
}

/**
 * Algoritmo Serverless di Calcolo e Ripristino Soggiorno Minimo Dinamico 24/7
 */
export function calculateServerDynamicMinStay(
  bookings: any[],
  dateRange: { start: string; end: string },
  calendarItems?: any[],
  activeJungleSource: JungleSourceStructureId = '807324'
): DynamicMinStayUpdate[] {
  const updates: DynamicMinStayUpdate[] = [];
  const activeBookings = (bookings || []).filter(b => {
    if (isMirrorReservation(b)) return false;
    const st = String(b.status || '').toUpperCase().trim();
    return st !== 'CANCELLED' && st !== 'CANCELED' && st !== 'DELETED' && st !== 'VOID' && st !== 'REJECTED' && !b.cancelled && !b.isCancelled;
  });

  // 1. Inizializzazione obbligatoria di TUTTI gli alloggi del villaggio
  // Garantisce che le stanze senza prenotazioni (o con prenotazioni cancellate) vengano calcolate e ripristinate al baseline
  const roomBookingsMap: Record<string, { roomName: string; motherId: string; targetProductIds: string[]; bookings: Array<{ in: string; out: string }> }> = {};
  const roomUnavailableMap: Record<string, Array<{ in: string; out: string }>> = {};

  Object.entries(ALL_ACCOMMODATIONS_MAP).forEach(([key, canonical]) => {
    roomBookingsMap[key] = {
      roomName: canonical.name,
      motherId: String(canonical.motherId),
      targetProductIds: [String(canonical.motherId)],
      bookings: []
    };
    roomUnavailableMap[key] = [];
  });

  // 2. Mappatura prenotazioni attive sugli alloggi corrispondenti con motore canonico
  activeBookings.forEach((b: any) => {
    const canonical = getCanonicalAccommodation(b);
    if (!canonical) return;

    const rawIn = b.checkin || b.check_in || b.startDate || b.arrival || b.fromDate;
    const rawOut = b.checkout || b.check_out || b.endDate || b.departure || b.toDate;
    if (!rawIn || !rawOut) return;

    const inStr = toThailandDateStr(rawIn);
    const outStr = toThailandDateStr(rawOut);

    if (inStr && outStr && roomBookingsMap[canonical.key]) {
      roomBookingsMap[canonical.key].bookings.push({ in: inStr, out: outStr });
    }
  });

  function addDaysISO(isoStr: string, n: number): string {
    const parts = isoStr.split('-').map(Number);
    const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + n));
    return d.toISOString().slice(0, 10);
  }

  function daysDiffISO(startISO: string, endISO: string): number {
    const s = new Date(startISO + 'T00:00:00Z').getTime();
    const e = new Date(endISO + 'T00:00:00Z').getTime();
    return Math.round((e - s) / 86400000);
  }

  // 2b. Integrazione Giorni a Disponibilità 0 / Stop Sell dalla Griglia Octorate (Stato Inventario Reale)
  // Un giorno con availability > 0 ma stopSells sulla sola Madre resta disponibile se la corrispondente BE è aperta
  if (Array.isArray(calendarItems) && calendarItems.length > 0) {
    const pairKeyToCanonicalKey: Record<string, string> = {
      jv: 'jungle villa',
      jvl: 'jungle villa left',
      jvr: 'jungle villa right',
      pl: 'peace & love villa'
    };

    const calById = new Map<number, any>();
    calendarItems.forEach((ci: any) => {
      const idNum = Number(ci?.id);
      if (idNum && !calById.has(idNum)) {
        calById.set(idNum, ci);
      }
    });

    calendarItems.forEach((cItem: any) => {
      const cId = Number(cItem.id);
      const twinPair = getJungleTwinPairByRateId(cId);
      if (twinPair) {
        if (
          (activeJungleSource === '807324' && twinPair.fpvId === cId) ||
          (activeJungleSource === '366879' && twinPair.jungleId === cId)
        ) {
          return;
        }
      }

      // Mappa sulla tariffa madre corrispondente (supporta anche le madri gemelle 960383..960389 se FPV attiva)
      let roomKey: string | undefined;
      let beId: number | undefined;
      if (twinPair && twinPair.isMother) {
        roomKey = pairKeyToCanonicalKey[twinPair.key];
        const bePair = JUNGLE_RATE_PAIRS.find(p => p.key === twinPair.key && (p.isBe || p.label.includes('BE')));
        if (bePair) {
          beId = activeJungleSource === '366879' ? bePair.fpvId : bePair.jungleId;
        }
      } else {
        const motherMatch = Object.entries(ALL_ACCOMMODATIONS_MAP).find(([_, v]) => v.motherId === cId);
        roomKey = motherMatch?.[0];
        if (motherMatch?.[1]?.ids?.[1]) {
          beId = Number(motherMatch[1].ids[1]);
        }
      }
      if (!roomKey) return;

      const beCalItem = beId ? calById.get(beId) : undefined;
      const beDaysByDate = new Map<string, any>();
      if (Array.isArray(beCalItem?.days)) {
        beCalItem.days.forEach((bd: any) => {
          const bStr = toThailandDateStr(bd.date || bd.day);
          if (bStr) beDaysByDate.set(bStr, bd);
        });
      }

      (cItem.days || []).forEach((d: any) => {
        const dStr = toThailandDateStr(d.date || d.day);
        if (!dStr) return;

        const avail = d.availability !== undefined ? Number(d.availability) : 1;
        let isUnavailable = avail <= 0;
        if (!isUnavailable && (d.stopSells === true || d.closed === true)) {
          const beDay = beDaysByDate.get(dStr);
          if (!beDay || beDay.stopSells === true || beDay.closed === true) {
            isUnavailable = true;
          }
        }

        if (isUnavailable) {
          roomUnavailableMap[roomKey!].push({ in: dStr, out: addDaysISO(dStr, 1) });
        }
      });
    });
  }

  const rangeEndExclusive = addDaysISO(dateRange.end, 1);

  // 3. Calcolo intervalli occupati e gap per ciascun alloggio (incorporando unità collegate parent/child e giorni a disponibilità 0)
  Object.entries(roomBookingsMap).forEach(([key, { roomName, motherId, targetProductIds, bookings: bList }]) => {
    const canonical = ALL_ACCOMMODATIONS_MAP[key] || Object.values(ALL_ACCOMMODATIONS_MAP).find(a => String(a.motherId) === String(motherId));
    const linkedList = (canonical?.linkedKeys || []).flatMap(lKey => roomBookingsMap[lKey]?.bookings || []);
    const ownUnavail = roomUnavailableMap[key] || [];
    const combinedList = [...bList, ...linkedList, ...ownUnavail];

    const sorted = combinedList.sort((a, b) => a.in.localeCompare(b.in));
    const mergedOccupied: Array<{ in: string; out: string }> = [];

    for (const curr of sorted) {
      if (mergedOccupied.length === 0) {
        mergedOccupied.push({ ...curr });
      } else {
        const prev = mergedOccupied[mergedOccupied.length - 1];
        if (curr.in <= prev.out) {
          if (curr.out > prev.out) prev.out = curr.out;
        } else {
          mergedOccupied.push({ ...curr });
        }
      }
    }

    const gaps: Array<{ start: string; end: string }> = [];

    if (mergedOccupied.length === 0) {
      // Stanza completamente libera (o dopo cancellazione totale): ripristina l'intera stagione
      gaps.push({ start: dateRange.start, end: rangeEndExclusive });
    } else {
      // Gap iniziale
      if (mergedOccupied[0].in > dateRange.start) {
        const firstGapEnd = mergedOccupied[0].in > rangeEndExclusive ? rangeEndExclusive : mergedOccupied[0].in;
        if (dateRange.start < firstGapEnd) {
          gaps.push({ start: dateRange.start, end: firstGapEnd });
        }
      }

      // Gap intermedi tra prenotazioni
      for (let i = 0; i < mergedOccupied.length - 1; i++) {
        const prevOut = mergedOccupied[i].out;
        const nextIn = mergedOccupied[i + 1].in;
        if (prevOut < nextIn && prevOut <= dateRange.end && nextIn >= dateRange.start) {
          const effectiveStart = prevOut < dateRange.start ? dateRange.start : prevOut;
          const effectiveEnd = nextIn > rangeEndExclusive ? rangeEndExclusive : nextIn;
          if (effectiveStart < effectiveEnd) {
            gaps.push({ start: effectiveStart, end: effectiveEnd });
          }
        }
      }

      // Gap finale (Coda di stagione)
      const lastOut = mergedOccupied[mergedOccupied.length - 1].out;
      if (lastOut <= dateRange.end) {
        const effectiveStart = lastOut < dateRange.start ? dateRange.start : lastOut;
        if (effectiveStart < rangeEndExclusive) {
          gaps.push({ start: effectiveStart, end: rangeEndExclusive });
        }
      }
    }

    const prodIds = targetProductIds && targetProductIds.length > 0 ? targetProductIds : [String(motherId)];

    gaps.forEach(({ start: gapStart, end: gapEnd }) => {
      const gapDays = daysDiffISO(gapStart, gapEnd);

      if (gapDays > 0) {
        let cur = gapStart;
        let blockStart = cur;
        let blockMinStay = Math.min(gapDays, getBaselineMinStay(cur));

        while (cur < gapEnd) {
          const baseline = getBaselineMinStay(cur);
          const target = Math.min(gapDays, baseline);

          if (target !== blockMinStay) {
            const blockEnd = addDaysISO(cur, -1);
            prodIds.forEach(targetId => {
              updates.push({
                roomTypeId: String(targetId),
                accommodationName: roomName,
                dateFrom: blockStart,
                dateTo: blockEnd,
                minStay: blockMinStay,
                reason: gapDays < baseline
                  ? `Gap-Fill Dinamico (${gapDays}d): M=${blockMinStay}`
                  : `Minimo da Gestione Tariffe Derivate: M=${blockMinStay}`
              });
            });
            blockStart = cur;
            blockMinStay = target;
          }
          cur = addDaysISO(cur, 1);
        }

        const lastDate = addDaysISO(gapEnd, -1);
        if (blockStart <= lastDate) {
          prodIds.forEach(targetId => {
            updates.push({
              roomTypeId: String(targetId),
              accommodationName: roomName,
              dateFrom: blockStart,
              dateTo: lastDate,
              minStay: blockMinStay,
              reason: gapDays < getBaselineMinStay(blockStart)
                ? `Gap-Fill Dinamico (${gapDays}d): M=${blockMinStay}`
                : `Minimo da Gestione Tariffe Derivate: M=${blockMinStay}`
            });
          });
        }
      }
    });

    // Ripristina al baseline stagionale anche tutti i giorni occupati o non disponibili (evita minStay=1 residui)
    mergedOccupied.forEach(({ in: occStart, out: occEnd }) => {
      const clampedStart = occStart < dateRange.start ? dateRange.start : occStart;
      const clampedEnd = occEnd > rangeEndExclusive ? rangeEndExclusive : occEnd;
      if (clampedStart >= clampedEnd) return;

      let cur = clampedStart;
      let blockStart = cur;
      let blockMinStay = getBaselineMinStay(cur);

      while (cur < clampedEnd) {
        const target = getBaselineMinStay(cur);
        if (target !== blockMinStay) {
          const blockEnd = addDaysISO(cur, -1);
          prodIds.forEach(targetId => {
            updates.push({
              roomTypeId: String(targetId),
              accommodationName: roomName,
              dateFrom: blockStart,
              dateTo: blockEnd,
              minStay: blockMinStay,
              reason: `Ripristino Baseline su Giorni Non Disponibili/Occupati: M=${blockMinStay}`
            });
          });
          blockStart = cur;
          blockMinStay = target;
        }
        cur = addDaysISO(cur, 1);
      }

      const lastOccDate = addDaysISO(clampedEnd, -1);
      if (blockStart <= lastOccDate) {
        prodIds.forEach(targetId => {
          updates.push({
            roomTypeId: String(targetId),
            accommodationName: roomName,
            dateFrom: blockStart,
            dateTo: lastOccDate,
            minStay: blockMinStay,
            reason: `Ripristino Baseline su Giorni Non Disponibili/Occupati: M=${blockMinStay}`
          });
        });
      }
    });
  });

  return updates;
}

/**
 * Risolve l'alloggio canonico del resort da un oggetto prenotazione grezzo Octorate
 * analizzando Product ID, Room Type ID e keyword testuali.
 */
export function resolveAccommodationName(booking: any): string {
  if (!booking) return 'Alloggio Flower Power';

  // 1. Match diretto per Product ID o Room Type ID nella mappatura canonica
  const productId = String(
    booking.product ||
    booking.pmsProduct ||
    booking.accommodation_id ||
    booking.roomId ||
    booking.roomTypeId ||
    booking.rooms?.[0]?.product ||
    booking.rooms?.[0]?.pmsProduct ||
    booking.rooms?.[0]?.roomTypeId ||
    ''
  ).trim();

  if (productId) {
    for (const [key, entry] of Object.entries(ALL_ACCOMMODATIONS_MAP)) {
      if (String(entry.motherId) === productId || entry.ids.includes(productId)) {
        return entry.name;
      }
    }
  }

  // 2. Match testuale / fuzzy sui nomi e descrizioni delle camere
  const rawName = String(
    booking.roomName ||
    booking.accommodation_name ||
    booking.accommodation ||
    booking.rooms?.[0]?.roomName ||
    booking.rooms?.[0]?.name ||
    booking.rooms?.[0]?.description ||
    ''
  ).toLowerCase().trim();

  if (rawName) {
    if (rawName.includes('jvr') || rawName.includes('right')) return 'Jungle Villa Right';
    if (rawName.includes('jvl') || rawName.includes('left')) return 'Jungle Villa Left';
    for (const [key, entry] of Object.entries(ALL_ACCOMMODATIONS_MAP)) {
      if (entry.keywords.every(group => group.some(kw => rawName.includes(kw)))) {
        return entry.name;
      }
    }
    const clean = rawName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    if (clean) return clean;
  }

  return 'Alloggio Flower Power';
}

/**
 * Risolve il nome reale dell'ospite esplorando tutti i campi anagrafici Octorate e OTA.
 */
export function resolveGuestName(booking: any): string {
  if (!booking) return 'Ospite';
  if (typeof booking.guestName === 'string' && booking.guestName.trim()) {
    return booking.guestName.trim();
  }
  if (typeof booking.guest_name === 'string' && booking.guest_name.trim()) {
    return booking.guest_name.trim();
  }

  const b = booking.booker || booking.customer || booking.contact;
  if (b) {
    const bName = `${b.firstName || b.givenName || ''} ${b.lastName || b.familyName || ''}`.trim() || b.name;
    if (bName && typeof bName === 'string' && bName.trim()) return bName.trim();
  }

  const direct = `${booking.firstName || booking.first_name || ''} ${booking.lastName || booking.last_name || ''}`.trim();
  if (direct) return direct;

  if (Array.isArray(booking.guests) && booking.guests.length > 0) {
    const booker = booking.guests.find((g: any) => g.type === 'BOOKER') || booking.guests[0];
    const gName = `${booker.givenName || booker.firstName || ''} ${booker.familyName || booker.lastName || ''}`.trim() || booker.name;
    if (gName) return gName;
  }

  return 'Ospite';
}

/**
 * Handler Webhook Octorate 24/7 per Soggiorno Minimo Dinamico (Gap-Filling & Ripristino)
 * Rotta API Gateway: POST /api/webhooks/octorate
 */
export async function handleOctorateWebhook(req: VercelRequest, res: VercelResponse) {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 1. Handle preflight OPTIONS / HEAD requests immediately with HTTP 200 OK
  if (req.method === 'OPTIONS' || req.method === 'HEAD') {
    return res.status(200).send('OK');
  }

  // 2. Handle GET verification requests (Octorate ping tests)
  if (req.method === 'GET') {
    console.log('[Octorate Webhook GET Ping] Received verification GET request.');
    return res.status(200).json({ status: 'active', message: 'Octorate Webhook Endpoint Ready' });
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'ok', message: 'Method accepted' });
  }

  let eventPayload: any = {};
  try {
    const rawBody = req.body;
    eventPayload = (typeof rawBody === 'string' ? JSON.parse(rawBody || '{}') : rawBody) || {};
  } catch (parseErr) {
    console.warn('[Octorate Webhook] Could not parse JSON body, treating as ping test.');
    eventPayload = {};
  }

  const tryParseNestedJson = (val: any): any => {
    if (typeof val !== 'string') return val;
    const trimmed = val.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return val;
    try {
      return JSON.parse(trimmed);
    } catch {
      return val;
    }
  };
  if (eventPayload && typeof eventPayload === 'object') {
    if (typeof eventPayload.content === 'string') eventPayload.content = tryParseNestedJson(eventPayload.content);
    if (typeof eventPayload.data === 'string') eventPayload.data = tryParseNestedJson(eventPayload.data);
    if (typeof eventPayload.reservation === 'string') eventPayload.reservation = tryParseNestedJson(eventPayload.reservation);
  }

  const eventType = eventPayload?.type || eventPayload?.event || eventPayload?.action || 'RESERVATION_NOTIFICATION';
  console.log(`[OCTORATE WEBHOOK 24/7] Received POST event: ${eventType}`, JSON.stringify(eventPayload, null, 2));

  const earlyTargetResId: any =
    eventPayload?.id ||
    eventPayload?.data?.id ||
    eventPayload?.data?.reservation?.id ||
    eventPayload?.data?.reservationId ||
    eventPayload?.reservation?.id ||
    eventPayload?.content?.id ||
    eventPayload?.content?.reservation?.id ||
    eventPayload?.content?.reservationId ||
    (Array.isArray(eventPayload?.content) && (eventPayload.content[0]?.id || eventPayload.content[0]?.reservationId || eventPayload.content[0]?.reservation?.id)) ||
    eventPayload?.reservationId ||
    eventPayload?.resId ||
    eventPayload?.reservationNumber ||
    eventPayload?.bookingId ||
    (Array.isArray(eventPayload) && (eventPayload[0]?.id || eventPayload[0]?.reservationId)) ||
    req.body?.id ||
    req.body?.reservationId ||
    req.query?.id ||
    req.query?.reservationId ||
    req.query?.resId;

  const upperEventType = String(eventType || '').toUpperCase();
  const isCreateOnlyEvent =
    (upperEventType.includes('CREAT') || upperEventType.includes('NEW')) &&
    !upperEventType.includes('CHANGE') &&
    !upperEventType.includes('MODIF') &&
    !upperEventType.includes('UPDATE') &&
    !upperEventType.includes('CANCEL');
  const isEditOrCancelEvent =
    !isCreateOnlyEvent &&
    (upperEventType.includes('CANCEL') ||
      upperEventType.includes('CHANGE') ||
      upperEventType.includes('MODIF') ||
      upperEventType.includes('UPDATE') ||
      upperEventType.includes('EDIT') ||
      upperEventType.includes('DELETE') ||
      upperEventType.includes('VOID') ||
      upperEventType === 'RESERVATION_NOTIFICATION');

  // 🔄 LAYER 1 ANTI-LOOP (0 chiamate API): scarta subito payload mirror espliciti di creazione o senza ID
  const inlineMirrorCandidate =
    isMirrorReservation(eventPayload) ||
    isMirrorReservation(eventPayload?.reservation) ||
    isMirrorReservation(eventPayload?.data) ||
    isMirrorReservation(eventPayload?.data?.reservation) ||
    isMirrorReservation(eventPayload?.content) ||
    isMirrorReservation(eventPayload?.content?.reservation) ||
    (Array.isArray(eventPayload?.content) && isMirrorReservation(eventPayload.content[0])) ||
    (Array.isArray(eventPayload) && isMirrorReservation(eventPayload[0]));
  if (inlineMirrorCandidate && (!earlyTargetResId || !isEditOrCancelEvent)) {
    console.log(`[OCTORATE WEBHOOK 24/7] Early-exit Layer 1: [MIRROR_SYNC] inline payload (${eventType}) ignorato -> 0 chiamate Octorate.`);
    return res.status(200).json({
      received: true,
      skipped: 'mirror_reservation_inline',
      eventType,
      timestamp: new Date().toISOString()
    });
  }

  // 4. Esecuzione asincrona garantita prima di chiudere la risposta Serverless
  let calculatedUpdatesCount = 0;
  let octorateStatus = 0;

  try {
    let bookingsData: any[] = [];
    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      let knownMirrorRow: { id: string; updated_at?: string; bot_token?: string; chat_id?: string } | null = null;
      // 🔄 LAYER 2 ANTI-LOOP (0 chiamate Octorate): se l'ID prenotazione è stato creato/toccato dal server < 45s fa, esci subito; se modificato dopo > 45s propaga alla gemella
      if (earlyTargetResId) {
        try {
          const mirrorKeys = ALL_OCTORATE_STRUCTURE_IDS.map(s => `mirror_target_${s}_${earlyTargetResId}`);
          const { data: mirrorRowData } = await supabaseAdmin
            .from('telegram_config')
            .select('id, updated_at, bot_token, chat_id')
            .in('id', mirrorKeys)
            .limit(1)
            .maybeSingle();
          knownMirrorRow = mirrorRowData || null;
          if (knownMirrorRow) {
            const updatedMs = knownMirrorRow.updated_at ? Date.parse(knownMirrorRow.updated_at) : 0;
            const ageMs = updatedMs > 0 && !Number.isNaN(updatedMs) ? Date.now() - updatedMs : 0;
            if (ageMs < 45000 || !isEditOrCancelEvent) {
              console.log(`[OCTORATE WEBHOOK 24/7] Early-exit Layer 2: Mirror ID #${earlyTargetResId} (${knownMirrorRow.id}, age=${Math.round(ageMs / 1000)}s) -> 0 chiamate Octorate.`);
              return res.status(200).json({
                received: true,
                skipped: 'mirror_reservation_known_id',
                reservationId: String(earlyTargetResId),
                eventType,
                timestamp: new Date().toISOString()
              });
            }
            console.log(`[OCTORATE WEBHOOK 24/7] Mirror ID #${earlyTargetResId} modificato/cancellato dopo ${Math.round(ageMs / 1000)}s -> verifico sync manuale verso struttura gemella.`);
          }
        } catch (mirrorLookupErr) {
          console.warn('[OCTORATE WEBHOOK] Mirror ID early-lookup warning:', mirrorLookupErr);
        }
      }
      let accessToken: string | null = null;
      const { data: tokenData } = await supabaseAdmin
        .from('octorate_tokens')
        .select('access_token, refresh_token')
        .eq('id', 'singleton')
        .maybeSingle();

      if (tokenData?.access_token) {
        accessToken = tokenData.access_token;
      }

      // Auto-refresh token se necessario
      const clientId = process.env.VITE_OCTORATE_CLIENT_ID || process.env.OCTORATE_CLIENT_ID;
      const clientSecret = process.env.OCTORATE_SECRET_KEY || process.env.VITE_OCTORATE_SECRET_KEY;
      const refreshToken = tokenData?.refresh_token;

      if ((!accessToken || refreshToken) && refreshToken && clientId && clientSecret) {
        try {
          const refreshUrl = "https://api.octorate.com/connect/rest/v1/identity/refresh";
          const refreshRes = await fetch(refreshUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "Accept": "application/json"
            },
            body: new URLSearchParams({
              grant_type: "refresh_token",
              refresh_token: refreshToken,
              client_id: clientId,
              client_secret: clientSecret
            }).toString()
          });

          if (refreshRes.ok) {
            const newTokens = await refreshRes.json();
            accessToken = newTokens.access_token;
            await supabaseAdmin.from('octorate_tokens').upsert({
              id: 'singleton',
              access_token: newTokens.access_token,
              refresh_token: newTokens.refresh_token || refreshToken,
              expires_in: newTokens.expires_in,
              updated_at: new Date().toISOString()
            });
          }
        } catch (rErr) {
          console.warn("[octorate-webhook] Token refresh warning:", rErr);
        }
      }

      if (accessToken) {
        const isReservationEventType =
          upperEventType.includes('RESERVATION') ||
          upperEventType.includes('BOOKING') ||
          upperEventType.includes('STAY') ||
          upperEventType.includes('CREAT') ||
          upperEventType.includes('MODIF') ||
          upperEventType.includes('CHANGE') ||
          upperEventType.includes('CANCEL');

        const hasInlineBookingData = Boolean(
          earlyTargetResId ||
          isReservationEventType ||
          eventPayload?.checkin ||
          eventPayload?.reservation?.checkin ||
          eventPayload?.content?.checkin ||
          eventPayload?.content?.reservation?.checkin ||
          eventPayload?.check_in ||
          eventPayload?.startDate ||
          eventPayload?.data?.checkin ||
          eventPayload?.data?.reservation?.checkin
        );

        if (!hasInlineBookingData) {
          console.log(`[OCTORATE WEBHOOK 24/7] Evento non-prenotazione '${eventType}': eseguo solo sync leggero protetto da cooldown.`);
          try {
            await checkAndSyncCascadeLastMinute(accessToken, supabaseAdmin);
          } catch (cascadeErr) {
            console.warn('[OCTORATE WEBHOOK] Light cascade sync warning:', cascadeErr);
          }
          try {
            await syncActiveToStandbyCalendar(supabaseAdmin, accessToken, { daysAhead: 60 });
          } catch (mirrorSyncErr) {
            console.warn('[OCTORATE WEBHOOK] Light standby sync warning:', mirrorSyncErr);
          }
          return res.status(200).json({
            received: true,
            skipped: 'non_reservation_event_light_sync',
            eventType,
            timestamp: new Date().toISOString()
          });
        }

        const todayISO = toThailandDateStr(new Date());
        const currentYear = new Date().getFullYear();
        const endISO = `${currentYear + 1}-10-31`;

        try {
          // 🌟 MULTI-STRUTTURA: Fetch prenotazioni da tutte e 3 le strutture in parallelo
          await Promise.all(ALL_OCTORATE_STRUCTURE_IDS.map(async (structId) => {
            let page = 0;
            let hasMore = true;
            while (hasMore && page <= 10) {
              const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/${structId}?type=STAY&startDate=${todayISO}&endDate=${endISO}&size=100&page=${page}`;
              const octRes = await fetch(octUrl, {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  ...(clientId ? { 'Octorate-Api-Key': clientId } : {}),
                  'Accept': 'application/json'
                }
              });
              if (octRes.ok) {
                const octJson = await octRes.json();
                const pageData = octJson && Array.isArray(octJson.data) ? octJson.data : (Array.isArray(octJson) ? octJson : (octJson.reservations || []));
                if (pageData.length > 0) {
                  bookingsData.push(...pageData);
                  if (pageData.length < 100) {
                    hasMore = false;
                  } else {
                    page++;
                  }
                } else {
                  hasMore = false;
                }
              } else {
                hasMore = false;
              }
            }
          }));
        } catch (octErr) {
          console.warn('[OCTORATE WEBHOOK] Failed to fetch live bookings from Octorate:', octErr);
        }

        let isMirrorWebhookEvent = false;
        let preResolvedTargetBooking: any = earlyTargetResId
          ? bookingsData.find(b => String(b.id) === String(earlyTargetResId)) || null
          : null;

        if (!preResolvedTargetBooking && earlyTargetResId) {
          try {
            for (const sId of ALL_OCTORATE_STRUCTURE_IDS) {
              const singleRes = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/${sId}/${earlyTargetResId}`, {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  ...(clientId ? { 'Octorate-Api-Key': clientId } : {}),
                  'Accept': 'application/json'
                }
              });
              if (singleRes.ok) {
                preResolvedTargetBooking = await singleRes.json();
                break;
              }
            }
          } catch (earlyFetchErr) {
            console.warn('[OCTORATE WEBHOOK] Early single reservation lookup warning:', earlyFetchErr);
          }
        }

        // 🔄 LAYER 3 ANTI-LOOP / SYNC BIDIREZIONALE: se la prenotazione è [MIRROR_SYNC], ignora eco recenti o creazioni, ma propaga modifiche/cancellazioni manuali
        let mirrorSyncedCounterpart = false;
        if (preResolvedTargetBooking && isMirrorReservation(preResolvedTargetBooking)) {
          const mirrorRowUpdatedMs = knownMirrorRow?.updated_at ? Date.parse(knownMirrorRow.updated_at) : 0;
          const mirrorRowAgeMs = mirrorRowUpdatedMs > 0 && !Number.isNaN(mirrorRowUpdatedMs)
            ? Date.now() - mirrorRowUpdatedMs
            : Infinity;
          const mCreateMs = parseOctorateTimestampMs(preResolvedTargetBooking.createTime);
          const mUpdateMs = parseOctorateTimestampMs(preResolvedTargetBooking.updateTime);
          const pStatus = String(preResolvedTargetBooking.status || '').toUpperCase().trim();
          const isMirrorCancelled =
            pStatus === 'CANCELLED' ||
            pStatus === 'CANCELED' ||
            pStatus === 'DELETED' ||
            pStatus === 'VOID' ||
            pStatus === 'REJECTED' ||
            upperEventType.includes('CANCEL');

          const shouldPropagateMirrorEdit =
            isEditOrCancelEvent &&
            mirrorRowAgeMs >= 45000 &&
            (isMirrorCancelled || mUpdateMs === 0 || mCreateMs === 0 || mUpdateMs > mCreateMs + 5000);

          if (!shouldPropagateMirrorEdit) {
            console.log(`[OCTORATE WEBHOOK 24/7] Early-exit Layer 3: [MIRROR_SYNC] #${preResolvedTargetBooking.id || earlyTargetResId} ignorato prima di calendar/bulk.`);
            return res.status(200).json({
              received: true,
              skipped: 'mirror_reservation_resolved',
              reservationId: String(preResolvedTargetBooking.id || earlyTargetResId),
              eventType,
              timestamp: new Date().toISOString()
            });
          }

          const mRoomRaw = preResolvedTargetBooking.product || preResolvedTargetBooking.pmsProduct || preResolvedTargetBooking.accommodation_id || preResolvedTargetBooking.roomId || '';
          const mStructRaw = preResolvedTargetBooking.accommodation?.id
            ? String(preResolvedTargetBooking.accommodation.id)
            : getOctorateStructureByRoomId(mRoomRaw).id;
          const mirrorStruct: JungleSourceStructureId = mStructRaw === '366879' ? '366879' : '807324';

          try {
            const propRes = await syncManualMirrorEditToCounterpart({
              supabaseAdmin,
              accessToken,
              mirrorStruct,
              mirrorBooking: preResolvedTargetBooking,
              isCancelled: isMirrorCancelled,
              forceOnWebhook: true
            });
            console.log(`[OCTORATE WEBHOOK 24/7] 🔄 Sync bidirezionale modifica manuale Mirror #${preResolvedTargetBooking.id || earlyTargetResId}:`, propRes);

            if (propRes.synced && propRes.counterpartReservationId && propRes.counterpartStructureId) {
              mirrorSyncedCounterpart = true;
              const cIdStr = String(propRes.counterpartReservationId);
              const newInDate = String(preResolvedTargetBooking.checkin || preResolvedTargetBooking.checkIn || '').slice(0, 10);
              const newOutDate = String(preResolvedTargetBooking.checkout || preResolvedTargetBooking.checkOut || '').slice(0, 10);
              const existingIdx = bookingsData.findIndex(b => String(b.id) === cIdStr);
              if (propRes.action === 'cancelled') {
                if (existingIdx >= 0) bookingsData[existingIdx].status = 'CANCELLED';
              } else if (newInDate && newOutDate) {
                if (existingIdx >= 0) {
                  bookingsData[existingIdx].checkin = `${newInDate}T08:00:00Z`;
                  bookingsData[existingIdx].checkout = `${newOutDate}T04:00:00Z`;
                  bookingsData[existingIdx].check_in = newInDate;
                  bookingsData[existingIdx].check_out = newOutDate;
                } else {
                  const freshCRes = await fetch(
                    `https://api.octorate.com/connect/rest/v1/reservation/${propRes.counterpartStructureId}/${cIdStr}`,
                    { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } }
                  ).catch(() => null);
                  if (freshCRes && freshCRes.ok) {
                    const freshCData = await freshCRes.json().catch(() => null);
                    if (freshCData) bookingsData.push(freshCData);
                  }
                }
              }
            } else {
              return res.status(200).json({
                received: true,
                skipped: 'mirror_edit_no_counterpart_change',
                reason: propRes.reason,
                reservationId: String(preResolvedTargetBooking.id || earlyTargetResId),
                eventType,
                timestamp: new Date().toISOString()
              });
            }
          } catch (propErr) {
            console.warn('[OCTORATE WEBHOOK 24/7] Errore propagazione modifica manuale Mirror:', propErr);
          }
        }

        const calendarItems: any[] = [];
        try {
          // 🌟 Fetch contemporaneo griglia live (calendario) da tutte le strutture per catturare availability: 0 e stopSells
          await Promise.all(ALL_OCTORATE_STRUCTURE_IDS.map(async (structId) => {
            let page = 0;
            let hasMore = true;
            while (hasMore && page <= 10) {
              const calUrl = `https://api.octorate.com/connect/rest/v1/calendar/${structId}?dateFrom=${todayISO}&dateTo=${endISO}&size=50&page=${page}`;
              const calRes = await fetch(calUrl, {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  ...(clientId ? { 'Octorate-Api-Key': clientId } : {}),
                  'Accept': 'application/json'
                }
              });
              if (calRes.ok) {
                const calJson = await calRes.json();
                const pageItems = calJson && Array.isArray(calJson.data) ? calJson.data : (Array.isArray(calJson) ? calJson : []);
                if (pageItems.length > 0) {
                  calendarItems.push(...pageItems);
                  if (pageItems.length < 50) {
                    hasMore = false;
                  } else {
                    page++;
                  }
                } else {
                  hasMore = false;
                }
              } else {
                hasMore = false;
              }
            }
          }));
        } catch (calErr) {
          console.warn('[OCTORATE WEBHOOK] Failed to fetch live calendar grid from Octorate:', calErr);
        }

        const activeJungleSource = await getActiveJungleSource(supabaseAdmin);
        const nonMirrorBookings = bookingsData.filter(b => !isMirrorReservation(b));

        const calculatedUpdates = calculateServerDynamicMinStay(
          nonMirrorBookings,
          { start: todayISO, end: endISO },
          calendarItems,
          activeJungleSource
        );

        calculatedUpdatesCount = calculatedUpdates.length;
        console.log(`[OCTORATE WEBHOOK 24/7] Calculated ${calculatedUpdates.length} gap-filling updates.`);

        // 🚨 [OVERBOOKING DETECTOR] Controllo collisioni e notifica istantanea Telegram allo Staff (esclude specchi MIRROR_SYNC)
        try {
          await checkAndNotifyOverbookings(nonMirrorBookings, supabaseAdmin, ALL_ACCOMMODATIONS_MAP);
        } catch (overErr) {
          console.warn('[OCTORATE WEBHOOK] Overbooking detection non-blocking warning:', overErr);
        }

        // Invio sincronizzazione in blocchi diff-only (solo giorni realmente disallineati vs calendarItems) specchiando anche la madre gemella in standby
        if (calculatedUpdates.length > 0) {
          const liveCalIdSet = new Set(calendarItems.map((it: any) => String(it?.id || '')).filter(Boolean));
          const liveMinStayByRoomDate = new Map<string, number>();
          for (const ci of calendarItems) {
            const rId = Number(ci?.id);
            if (!rId || !Array.isArray(ci?.days)) continue;
            for (const d of ci.days) {
              const dStr = String(d?.date || d?.day || '').slice(0, 10);
              const ms = Number(d?.minStay ?? d?.minstay ?? d?.minNights ?? 0);
              if (dStr && ms > 0) {
                liveMinStayByRoomDate.set(`${rId}_${dStr}`, ms);
              }
            }
          }

          const roomsPayloadMap = new Map<string, { room: number; dateFrom: string; dateTo: string; values: { minstay: number } }>();
          const pushExpandedSegments = (roomId: number, dateFrom: string, dateTo: string, minStay: number) => {
            if (liveCalIdSet.size > 0 && !liveCalIdSet.has(String(roomId))) return;
            const segments = expandMinStayEntryWithStandbyKeepAlive(
              roomId,
              dateFrom,
              dateTo,
              minStay,
              activeJungleSource
            );
            for (const seg of segments) {
              roomsPayloadMap.set(`${seg.room}_${seg.dateFrom}_${seg.dateTo}`, seg);
            }
          };

          for (const u of calculatedUpdates) {
            const primaryId = Number(u.roomTypeId);
            const minStayNum = Number(u.minStay);
            pushExpandedSegments(primaryId, u.dateFrom, u.dateTo, minStayNum);
            const companionId = getCompanionRateId(primaryId);
            if (companionId) {
              pushExpandedSegments(companionId, u.dateFrom, u.dateTo, minStayNum);
            }
          }

          const addOneDayISO = (iso: string): string => {
            const [y, m, d] = iso.split('-').map(Number);
            const dt = new Date(Date.UTC(y, (m || 1) - 1, (d || 1) + 1));
            return dt.toISOString().slice(0, 10);
          };

          const changedMinStayByRoom = new Map<number, Map<string, number>>();
          for (const seg of roomsPayloadMap.values()) {
            let cur = seg.dateFrom;
            let guard = 0;
            while (cur <= seg.dateTo && guard++ < 800) {
              const obs = liveMinStayByRoomDate.get(`${seg.room}_${cur}`);
              if (obs !== undefined && obs > 0 && obs !== seg.values.minstay) {
                let dayMap = changedMinStayByRoom.get(seg.room);
                if (!dayMap) {
                  dayMap = new Map<string, number>();
                  changedMinStayByRoom.set(seg.room, dayMap);
                }
                dayMap.set(cur, seg.values.minstay);
              }
              cur = addOneDayISO(cur);
            }
          }

          const roomsPayload: Array<{ room: number; dateFrom: string; dateTo: string; values: { minstay: number } }> = [];
          for (const [roomId, dayMap] of changedMinStayByRoom.entries()) {
            const sortedDates = Array.from(dayMap.keys()).sort();
            if (sortedDates.length === 0) continue;
            let subFrom = sortedDates[0];
            let subTo = sortedDates[0];
            let subMs = dayMap.get(sortedDates[0])!;
            for (let i = 1; i < sortedDates.length; i++) {
              const dStr = sortedDates[i];
              const ms = dayMap.get(dStr)!;
              if (dStr === addOneDayISO(subTo) && ms === subMs) {
                subTo = dStr;
              } else {
                roomsPayload.push({ room: roomId, dateFrom: subFrom, dateTo: subTo, values: { minstay: subMs } });
                subFrom = dStr;
                subTo = dStr;
                subMs = ms;
              }
            }
            roomsPayload.push({ room: roomId, dateFrom: subFrom, dateTo: subTo, values: { minstay: subMs } });
          }

          calculatedUpdatesCount = roomsPayload.length;

          if (roomsPayload.length > 0) {
            const chunkSize = 250;
            const chunks: any[][] = [];
            for (let c = 0; c < roomsPayload.length; c += chunkSize) {
              chunks.push(roomsPayload.slice(c, c + chunkSize));
            }

            // Invio sequenziale con backoff anti-quota per evitare HTTP 403 API_QUOTA_EXCEEDED su Octorate
            const { lastStatus } = await postOctorateCalendarBulkWithRetry(
              {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              chunks,
              {
                interBatchDelayMs: 1200,
                quotaRetryDelayMs: 2500,
                maxQuotaRetries: 2,
                logPrefix: '[OCTORATE WEBHOOK 24/7]'
              }
            );
            octorateStatus = lastStatus || 200;
            clearOctorateGridCache();

            // Sincronizzazione Gap-Fill su Octorate completata silenziosamente (zero spam Telegram)
            console.log(`[OCTORATE WEBHOOK 24/7] Gap-fill diff sync completed: ${roomsPayload.length} blocks (${changedMinStayByRoom.size} rooms) sent to Octorate.`);
          } else {
            octorateStatus = 200;
            console.log(`[OCTORATE WEBHOOK 24/7] Gap-fill diff sync: 0 mismatches vs Octorate live -> 0 /calendar/bulk calls.`);
          }
        }

        // 🛡️ [AUTO-SHIELD & NOTIFICHE PRENOTAZIONI REALI CERTIFICATE]
        try {
          const targetResId: any = earlyTargetResId;

          let targetBooking: any = preResolvedTargetBooking;

          if (targetResId && !targetBooking) {
            targetBooking = bookingsData.find(b => String(b.id) === String(targetResId));
            if (!targetBooking) {
              try {
                for (const sId of ALL_OCTORATE_STRUCTURE_IDS) {
                  const singleRes = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/${sId}/${targetResId}`, {
                    headers: {
                      'Authorization': `Bearer ${accessToken}`,
                      ...(clientId ? { 'Octorate-Api-Key': clientId } : {}),
                      'Accept': 'application/json'
                    }
                  });
                  if (singleRes.ok) {
                    targetBooking = await singleRes.json();
                    break;
                  }
                }
              } catch (fetchErr) {
                console.warn('[OCTORATE WEBHOOK] Failed to fetch single reservation for Auto-Shield:', fetchErr);
              }
            }
          }

          // Se il webhook invia direttamente l'oggetto prenotazione nel payload
          if (!targetBooking && (eventPayload?.checkin || eventPayload?.reservation?.checkin || eventPayload?.content?.checkin || eventPayload?.content?.reservation?.checkin || eventPayload?.check_in || eventPayload?.startDate)) {
            targetBooking = eventPayload.reservation || eventPayload.content?.reservation || eventPayload.content || eventPayload;
          }

          // Fallback intelligente: se il webhook prenotazione non includeva un ID esplicito, cerca prenotazioni reali create/aggiornate negli ultimi 15 minuti non ancora notificate
          if (!targetBooking && !targetResId && bookingsData.length > 0) {
            const nowMs = Date.now();
            const RECENT_WINDOW_MS = 15 * 60 * 1000;
            const recentNonMirrors = bookingsData
              .filter(b => b && b.id && !isMirrorReservation(b))
              .map(b => {
                const cMs = parseOctorateTimestampMs(b.createTime);
                const uMs = parseOctorateTimestampMs(b.updateTime);
                return { booking: b, cMs, uMs, latestMs: Math.max(cMs, uMs) };
              })
              .filter(item => item.latestMs > 0 && nowMs - item.latestMs <= RECENT_WINDOW_MS)
              .sort((a, b) => b.latestMs - a.latestMs);

            for (const { booking: cand, cMs, uMs } of recentNonMirrors) {
              const candId = String(cand.id);
              const candIn = toThailandDateStr(cand.checkin || cand.checkIn || cand.check_in || cand.startDate);
              const candOut = toThailandDateStr(cand.checkout || cand.checkOut || cand.check_out || cand.endDate);
              const candStatus = String(cand.status || '').toUpperCase().trim();
              const candCancelled =
                candStatus === 'CANCELLED' ||
                candStatus === 'CANCELED' ||
                candStatus === 'DELETED' ||
                candStatus === 'VOID' ||
                candStatus === 'REJECTED' ||
                upperEventType.includes('CANCEL');
              const isCandUpdatedAfterCreate = uMs > 0 && cMs > 0 && uMs > cMs + 5000;
              const candModified =
                !candCancelled &&
                (upperEventType.includes('CHANGE') ||
                  upperEventType.includes('MODIF') ||
                  upperEventType.includes('UPDATE') ||
                  isCandUpdatedAfterCreate);
              const candKey = candCancelled
                ? `res_cancelled_${candId}`
                : (candModified ? `res_modified_${candId}_${candIn}_${candOut}` : `res_notified_${candId}`);

              const { data: existingNotifyRow } = await supabaseAdmin
                .from('telegram_config')
                .select('id')
                .eq('id', candKey)
                .maybeSingle();

              if (!existingNotifyRow) {
                targetBooking = cand;
                console.log(`[OCTORATE WEBHOOK] Fallback ID da webhook senza payload ID: selezionata prenotazione recente #${candId} (${candKey}).`);
                break;
              }
            }
          }

          // Se l'evento non specifica un targetResId né un oggetto prenotazione, è un aggiornamento calendario/tariffe/stop-sells:
          // non dobbiamo selezionare a caso prenotazioni per evitare falsi allarmi e loop a catena.
          if (!targetBooking && !targetResId) {
            console.log(`[OCTORATE WEBHOOK] Evento '${eventType}' senza ID prenotazione specifico nel payload. Nessuna azione su prenotazioni.`);
          }

          if (targetBooking) {
            const rawIn = toThailandDateStr(targetBooking.checkin || targetBooking.checkIn || targetBooking.check_in || targetBooking.startDate || targetBooking.rooms?.[0]?.checkin || targetBooking.rooms?.[0]?.startDate);
            const rawOut = toThailandDateStr(targetBooking.checkout || targetBooking.checkOut || targetBooking.check_out || targetBooking.endDate || targetBooking.rooms?.[0]?.checkout || targetBooking.rooms?.[0]?.endDate);

            // Filtro anti-falsi allarmi: invia notifiche solo se le date sono reali e valide (lunghezza 10: YYYY-MM-DD)
            if (rawIn.length === 10 && rawOut.length === 10 && !rawIn.includes('undefined') && !rawOut.includes('undefined')) {
              const st = String(targetBooking.status || '').toUpperCase().trim();
              const guestName = resolveGuestName(targetBooking);
              const roomName = resolveAccommodationName(targetBooking);
              const channelName = targetBooking.channelName || targetBooking.channel || targetBooking.ota || (targetBooking.channelId === 233 ? 'Sito Web Diretto' : `OTA (#${targetBooking.channelId || 'N/D'})`);
              const reservationId = targetBooking.id || targetResId || 'N/D';

              // Calcolo durata esatta in notti
              let stayNights = 1;
              try {
                const dIn = new Date(`${rawIn}T00:00:00Z`);
                const dOut = new Date(`${rawOut}T00:00:00Z`);
                if (!isNaN(dIn.getTime()) && !isNaN(dOut.getTime())) {
                  stayNights = Math.max(1, Math.round((dOut.getTime() - dIn.getTime()) / (1000 * 60 * 60 * 24)));
                }
              } catch { }

              // Calcolo totale formattato
              const totalGross = targetBooking.totalGross ?? targetBooking.roomGross ?? targetBooking.total ?? targetBooking.totalPrice ?? 0;
              const currency = targetBooking.currency || 'THB';
              const formattedTotal = typeof totalGross === 'number'
                ? totalGross.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
                : String(totalGross);

              const isCancelled = st === 'CANCELLED' || st === 'CANCELED' || st === 'DELETED' || st === 'VOID' || st === 'REJECTED' || eventType.toUpperCase().includes('CANCEL');
              const isModified = !isCancelled && (eventType.toUpperCase().includes('CHANGE') || eventType.toUpperCase().includes('MODIF') || eventType.toUpperCase().includes('UPDATE'));

              // 🏷️ MULTI-STRUTTURA: Riconoscimento resort di appartenenza per badge Telegram
              const roomRawId = targetBooking.product || targetBooking.pmsProduct || targetBooking.accommodation_id || targetBooking.roomId || targetBooking.roomTypeId || '';
              const resortConfig = getOctorateStructureByRoomId(roomRawId);
              const resortBadge = `${resortConfig.badgeEmoji} <b>[${resortConfig.name.toUpperCase()}]</b>`;

              // 🔄 ANTI-ECO MIRROR: Le prenotazioni specchio [MIRROR_SYNC] non devono inviare notifiche o creare loop
              if (isMirrorReservation(targetBooking)) {
                isMirrorWebhookEvent = true;
                console.log(`[OCTORATE WEBHOOK] Prenotazione specchio [MIRROR_SYNC] #${reservationId} ignorata per anti-eco e anti-loop.`);
              } else {
                // 📲 1. Notifica Telegram Immediata allo Staff del Villaggio (Strict AWAIT per evitare Context Freeze di Vercel)
                let alreadySent: any = null;
                try {
                  let tgMessage = '';
                  let targetTopicKey: 'BOOKINGS' | 'MODIFICATIONS_CANCELLATIONS' = 'BOOKINGS';

                  // Verifica se già notificata come nuova prenotazione per evitare spam
                  const notificationKey = isCancelled ? `res_cancelled_${reservationId}` : (isModified ? `res_modified_${reservationId}_${rawIn}_${rawOut}` : `res_notified_${reservationId}`);
                  const { data: alreadySentRow } = await supabaseAdmin
                    .from('telegram_config')
                    .select('id')
                    .eq('id', notificationKey)
                    .maybeSingle();
                  alreadySent = alreadySentRow;

                  if (!alreadySent) {
                    const twinPairForNotify = getJungleTwinPairByRateId(roomRawId);
                    const twinStructId = twinPairForNotify
                      ? (twinPairForNotify.jungleId === Number(roomRawId) ? '807324' : '366879')
                      : String(resortConfig.id);
                    const isTwinStandbyBooking =
                      Boolean(twinPairForNotify) &&
                      twinStructId !== String(activeJungleSource);

                    if (isCancelled) {
                      targetTopicKey = 'MODIFICATIONS_CANCELLATIONS';
                      tgMessage = `🔴 ${resortBadge} <b>CANCELLAZIONE PRENOTAZIONE</b>\n` +
                        `🏨 <b>Alloggio:</b> <b>${roomName}</b>\n` +
                        `👤 <b>Ospite:</b> <b>${guestName}</b>\n` +
                        `🌐 <b>Canale:</b> ${channelName}\n` +
                        `📅 <b>Periodo Annullato:</b> <code>${formatDateDMY(rawIn)} ➔ ${formatDateDMY(rawOut)}</code> (<b>${stayNights} notti</b>)\n` +
                        `💰 <b>Importo Rilasciato:</b> <b>${formattedTotal} ${currency}</b>\n` +
                        `🔖 <b>Codice Prenotazione:</b> <code>#${reservationId}</code>`;
                    } else if (isModified) {
                      targetTopicKey = 'MODIFICATIONS_CANCELLATIONS';
                      tgMessage = `🟡 ${resortBadge} <b>PRENOTAZIONE MODIFICATA</b>\n` +
                        `🏨 <b>Alloggio:</b> <b>${roomName}</b>\n` +
                        `👤 <b>Ospite:</b> <b>${guestName}</b>\n` +
                        `🌐 <b>Canale:</b> ${channelName}\n` +
                        `📅 <b>Nuovo Periodo:</b> <code>${formatDateDMY(rawIn)} ➔ ${formatDateDMY(rawOut)}</code> (<b>${stayNights} notti</b>)\n` +
                        `💰 <b>Totale Aggiornato:</b> <b>${formattedTotal} ${currency}</b>\n` +
                        `🔖 <b>Codice Prenotazione:</b> <code>#${reservationId}</code>`;
                    } else {
                      targetTopicKey = 'BOOKINGS';
                      tgMessage = `🟢 ${resortBadge} <b>NUOVA PRENOTAZIONE RICEVUTA</b>\n` +
                        `🏨 <b>Alloggio:</b> <b>${roomName}</b>\n` +
                        `👤 <b>Ospite:</b> <b>${guestName}</b>\n` +
                        `🌐 <b>Canale:</b> ${channelName}\n` +
                        `📅 <b>Check-in:</b> <code>${formatDateDMY(rawIn)}</code>\n` +
                        `🛫 <b>Check-out:</b> <code>${formatDateDMY(rawOut)}</code>\n` +
                        `🌙 <b>Durata:</b> <b>${stayNights} notti</b>\n` +
                        `💰 <b>Totale:</b> <b>${formattedTotal} ${currency}</b>\n` +
                        `🔖 <b>Codice Prenotazione:</b> <code>#${reservationId}</code>`;
                    }

                    if (isTwinStandbyBooking && !isCancelled) {
                      tgMessage =
                        `🚨 <b>[PRENOTAZIONE KEEP-ALIVE SU STRUTTURA IN STANDBY!]</b>\n` +
                        `🛡️ <i>Ricevuta su ${resortConfig.name} (in Standby con filtro 14+ notti / prezzo 2x). Clonata automaticamente sulla struttura principale e date chiuse su entrambe!</i>\n\n` +
                        tgMessage;
                    }

                    const tgRes = await sendDepartmentTelegramMessage('village', tgMessage, { topic: targetTopicKey });
                    console.log(`[OCTORATE WEBHOOK] Inviata notifica Telegram per prenotazione #${reservationId}:`, tgRes);

                    if (isTwinStandbyBooking && !isCancelled) {
                      await sendDepartmentTelegramMessage(
                        'village',
                        `🚨 <b>PRENOTAZIONE RICEVUTA SU STRUTTURA IN STANDBY (${resortConfig.name})</b>\n` +
                        `🏨 <b>${roomName}</b> • 👤 <b>${guestName}</b>\n` +
                        `📅 <code>${formatDateDMY(rawIn)} ➔ ${formatDateDMY(rawOut)}</code> (<b>${stayNights} notti</b>)\n` +
                        `💰 <b>${formattedTotal} ${currency}</b> (<code>#${reservationId}</code>)\n\n` +
                        `✅ <i>La prenotazione è già stata clonata in automatico sulla struttura principale. Usa il pulsante qui sotto se desideri verificare o fare lo switch tra le strutture:</i>`,
                        {
                          topic: 'BOOKING_EDITOR',
                          replyMarkup: {
                            inline_keyboard: [
                              [{ text: '🔄 Apri Pannello /switchvillas', callback_data: 'swv:menu' }]
                            ]
                          }
                        }
                      );
                    }

                    // Memorizzazione chiave notifica inviata per non duplicare
                    await supabaseAdmin.from('telegram_config').upsert({
                      id: notificationKey,
                      bot_token: 'notified',
                      chat_id: String(reservationId),
                      updated_at: new Date().toISOString()
                    });

                    if (notificationKey !== `res_notified_${reservationId}`) {
                      await supabaseAdmin.from('telegram_config').upsert({
                        id: `res_notified_${reservationId}`,
                        bot_token: 'notified',
                        chat_id: String(reservationId),
                        updated_at: new Date().toISOString()
                      });
                    }
                  } else {
                    console.log(`[OCTORATE WEBHOOK] Notifica Telegram per prenotazione #${reservationId} (${notificationKey}) già inviata in precedenza. Ignorata per evitare duplicati.`);
                  }
                } catch (notifyErr) {
                  console.warn('[OCTORATE WEBHOOK] Errore creazione/invio notifica Telegram:', notifyErr);
                }

                // 🛡️ 2. Auto-Shield o Gestione Cancellazione Diretta (Anti-Loop: eseguito solo per nuove prenotazioni non ancora processate)
                if (!isCancelled) {
                  if (!alreadySent) {
                    await executeAutoShieldForReservation({
                      accessToken,
                      checkIn: toThailandDateStr(rawIn),
                      checkOut: toThailandDateStr(rawOut),
                      roomName: targetBooking.roomName || targetBooking.accommodation_name || roomName,
                      productId: targetBooking.product || targetBooking.accommodation_id,
                      pmsProductId: targetBooking.pmsProduct,
                      reservationId: targetBooking.id || targetResId,
                      guestName,
                      channelName: targetBooking.channelName || targetBooking.channel || 'OTA Webhook',
                      supabaseAdmin
                    });
                  } else {
                    console.log(`[OCTORATE WEBHOOK] Auto-Shield per #${reservationId} già sigillato in precedenza. Ignorato per evitare loop.`);
                  }
                } else {
                  // ✉️ Gestione Cancellazione: Solo per prenotazioni dirette (Sito Web o Octorate interno)
                  try {
                    console.log(`[OCTORATE WEBHOOK] Rilevata cancellazione per prenotazione #${targetBooking.id || targetResId} (${targetBooking.channelName || targetBooking.channelId}). Avvio gestione diretta...`);
                    await handleDirectReservationCancellation(targetBooking);
                  } catch (cancelErr) {
                    console.warn('[OCTORATE WEBHOOK] Errore gestione cancellazione:', cancelErr);
                  }
                }

                // 🔄 3. Mirroring Automatico su Struttura Standby (807324 <-> 366879)
                try {
                  const mirrorOutcome = await mirrorReservationToStandby({
                    supabaseAdmin,
                    accessToken,
                    sourceStructureId: String(resortConfig.id),
                    sourceReservationId: reservationId,
                    productId: targetBooking.product || targetBooking.pmsProduct || targetBooking.accommodation_id,
                    roomName: targetBooking.roomName || targetBooking.accommodation_name || roomName,
                    checkIn: toThailandDateStr(rawIn),
                    checkOut: toThailandDateStr(rawOut),
                    guestName,
                    isCancelled,
                    channelId: targetBooking.channelId,
                    channelRefer: targetBooking.channelRefer,
                    channelName: targetBooking.channelName,
                    color: targetBooking.color,
                    totalGross: Number(targetBooking.totalGross ?? targetBooking.roomGross ?? 0) || undefined,
                    origPrivateNotes: targetBooking.privateNotes || undefined
                  });
                  if (mirrorOutcome.mirrored) {
                    console.log(`[OCTORATE WEBHOOK] 🔄 Mirroring ${mirrorOutcome.action} su ${mirrorOutcome.targetStructureId} (#${mirrorOutcome.targetReservationId})`);
                  }
                } catch (mirrorErr) {
                  console.warn('[OCTORATE WEBHOOK] Errore mirroring standby (non bloccante):', mirrorErr);
                }
              } // Fine blocco non-mirror
            } else {
              console.log(`[OCTORATE WEBHOOK] Evento '${eventType}' senza intervallo date completo (${rawIn} ➔ ${rawOut}). Notifica Telegram ignorata.`);
            }
          } else {
            console.log(`[OCTORATE WEBHOOK] Evento '${eventType}' senza prenotazione associata. Notifica Telegram ignorata.`);
          }
        } catch (shieldErr) {
          console.warn('[OCTORATE WEBHOOK] Auto-Shield / Notification error (non-blocking):', shieldErr);
        }

        if (!isMirrorWebhookEvent || mirrorSyncedCounterpart) {
          // 🔒 [ANTI-REOPEN SHIELD] Verifica e risigillatura immediata stanze chiuse (Hard-Lock)
          try {
            const closedLocks = await loadClosedRoomLocks(supabaseAdmin);
            const activeLocks = closedLocks.filter(l => l.enabled !== false);
            if (activeLocks.length > 0 && calendarItems.length > 0) {
              for (const lock of activeLocks) {
                const sealRes = await sealLockedRoomRangeOnOctorate({
                  accessToken,
                  clientId,
                  roomKeyOrId: lock.roomKey,
                  dateFrom: lock.dateFrom,
                  dateTo: lock.dateTo,
                  calendarItems,
                  logPrefix: '[OCTORATE WEBHOOK HARD-LOCK]'
                });

                if (sealRes.sealedEntries > 0) {
                  clearOctorateGridCache();
                  const lockAlertMsg =
                    `🛡️ <b>[ANTI-REOPEN SHIELD — STANZA CHIUSA RISIGILLATA]</b>\n` +
                    `🏨 <b>Alloggio:</b> <b>${lock.roomName}</b>\n` +
                    `📅 <b>Periodo Protetto:</b> <code>${formatDateDMY(lock.dateFrom)} ➔ ${formatDateDMY(lock.dateTo)}</code>\n` +
                    `🔒 Rilevate <b>${sealRes.sealedDatesCount}</b> notti riaperte da Octorate (es. dopo cancellazione/riduzione): riportate istantaneamente a <code>avail=0</code> + <code>StopSell=ON</code> su Madre e tutte le derivate.`;
                  await sendDepartmentTelegramMessage('village', lockAlertMsg, { topic: 'MODIFICATIONS_CANCELLATIONS' });
                }
              }
            }

            // ⚠️ Rete di sicurezza per stanze NON in Hard-Lock: avvisa se una cancellazione/modifica riapre notti tra giorni chiusi
            if (preResolvedTargetBooking && calendarItems.length > 0) {
              const stTarget = String(preResolvedTargetBooking.status || '').toUpperCase().trim();
              const isTargetCancelledOrMod =
                stTarget === 'CANCELLED' || stTarget === 'CANCELED' || stTarget === 'DELETED' || stTarget === 'VOID' || stTarget === 'REJECTED' ||
                eventType.toUpperCase().includes('CANCEL') ||
                eventType.toUpperCase().includes('CHANGE') ||
                eventType.toUpperCase().includes('MODIF') ||
                eventType.toUpperCase().includes('UPDATE');

              if (isTargetCancelledOrMod) {
                const tIn = toThailandDateStr(preResolvedTargetBooking.checkin || preResolvedTargetBooking.checkIn);
                const tOut = toThailandDateStr(preResolvedTargetBooking.checkout || preResolvedTargetBooking.checkOut);
                const tProd = preResolvedTargetBooking.product || preResolvedTargetBooking.pmsProduct || preResolvedTargetBooking.accommodation_id || preResolvedTargetBooking.roomId;
                const tRoom = resolveLockableRoom(tProd) || resolveLockableRoom(preResolvedTargetBooking.roomName || preResolvedTargetBooking.accommodation_name);

                if (tRoom && tIn.length === 10 && tOut.length === 10 && !isDateLockedForRoom(activeLocks, tRoom.roomKey, tIn)) {
                  const motherCalItem = calendarItems.find((it: any) => Number(it?.id || it?.productId) === tRoom.motherId);
                  const daysArr = Array.isArray(motherCalItem?.calendar) ? motherCalItem.calendar : (Array.isArray(motherCalItem?.days) ? motherCalItem.days : []);
                  const dayByDate = new Map<string, any>();
                  for (const d of daysArr) {
                    const ds = String(d?.date || d?.day || '').slice(0, 10);
                    if (ds) dayByDate.set(ds, d);
                  }

                  const prevD = new Date(`${tIn}T00:00:00Z`);
                  prevD.setUTCDate(prevD.getUTCDate() - 1);
                  const dayBeforeStr = prevD.toISOString().slice(0, 10);
                  const dayBefore = dayByDate.get(dayBeforeStr);
                  const dayAfter = dayByDate.get(tOut);
                  const firstFreed = dayByDate.get(tIn);

                  const isClosedDay = (d: any) => Boolean(d && (Number(d.availability ?? 0) <= 0 || d.stopSells === true || d.closed === true));
                  const isOpenDay = (d: any) => Boolean(d && Number(d.availability ?? 0) > 0 && d.stopSells !== true && d.closed !== true);

                  if (isOpenDay(firstFreed) && isClosedDay(dayBefore) && isClosedDay(dayAfter)) {
                    const warnKey = `reopen_warn_${preResolvedTargetBooking.id || earlyTargetResId}_${tIn}_${tOut}`;
                    const { data: alreadyWarned } = await supabaseAdmin
                      .from('telegram_config')
                      .select('id')
                      .eq('id', warnKey)
                      .maybeSingle();

                    if (!alreadyWarned) {
                      await sendDepartmentTelegramMessage(
                        'village',
                        `⚠️ <b>[AVVISO NOTTI RIAPERTE TRA GIORNI CHIUSI]</b>\n` +
                        `🏨 <b>Alloggio:</b> <b>${tRoom.name}</b>\n` +
                        `📅 <b>Periodo liberato:</b> <code>${formatDateDMY(tIn)} ➔ ${formatDateDMY(tOut)}</code>\n` +
                        `🔎 I giorni prima e dopo risultano chiusi, ma la cancellazione/modifica ha riaperto queste notti su Octorate. Se la stanza deve restare chiusa, attiva il <b>Lock Stanze Chiuse</b> dalla Dashboard.`,
                        { topic: 'MODIFICATIONS_CANCELLATIONS' }
                      );
                      await supabaseAdmin.from('telegram_config').upsert({
                        id: warnKey,
                        bot_token: 'notified',
                        chat_id: String(preResolvedTargetBooking.id || earlyTargetResId || tRoom.roomKey),
                        updated_at: new Date().toISOString()
                      });
                    }
                  }
                }
              }
            }
          } catch (lockErr) {
            console.warn('[OCTORATE WEBHOOK] Closed room hard-lock warning:', lockErr);
          }

          // ⚡ [CASCADE LAST-MINUTE 24/7] Verifica e rinnovo automatico finestra 7 giorni sconti a cascata
          try {
            await checkAndSyncCascadeLastMinute(accessToken, supabaseAdmin);
          } catch (cascadeErr) {
            console.warn('[OCTORATE WEBHOOK] Cascade sync non-fatal warning:', cascadeErr);
          }

          // 🔄 [MIRROR AUTO-SYNC 60GG] Riallinea eventuali modifiche prezzi manuali fatte dentro il portale web Octorate
          try {
            await syncActiveToStandbyCalendar(supabaseAdmin, accessToken, {
              daysAhead: 60,
              ...(mirrorSyncedCounterpart ? { force: true } : {})
            });
          } catch (mirrorSyncErr) {
            console.warn('[OCTORATE WEBHOOK] Standby calendar auto-sync warning (non-blocking):', mirrorSyncErr);
          }
        }
      }
    }

    return res.status(200).json({
      received: true,
      eventType,
      calculatedUpdatesCount,
      octorateStatus,
      timestamp: new Date().toISOString(),
      message: 'Webhook processed successfully with real Octorate synchronization.'
    });

  } catch (err: any) {
    console.error(`[OCTORATE WEBHOOK 24/7 ERROR]:`, err);
    return res.status(200).json({
      received: true,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
}
