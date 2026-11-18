/**
 * 🗓️ Motore Puro Notti Minime Dinamiche & Gap-Fill (Serverless Offline-Testable)
 *
 * Calcola i blocchi minStay ottimali per tutti gli alloggi in base alle prenotazioni attive,
 * allo stato della griglia calendario, alle unità collegate (JV <-> JVL/JVR) e alla timeline stagionale.
 * Dipende esclusivamente da date-formatter.ts e octorate-catalog.ts (zero handler HTTP, zero Supabase).
 */

import { toThailandDateStr } from './date-formatter.js';
import {
  ALL_ACCOMMODATIONS_MAP,
  getCanonicalAccommodation,
  getJungleTwinPairByRateId,
  isMirrorReservation,
  JUNGLE_RATE_PAIRS,
  JungleSourceStructureId
} from './octorate-catalog.js';

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
