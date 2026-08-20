import fs from 'fs';
import path from 'path';

// Definizione completa di tutti i 18 alloggi reali + 2 test
const MOTHER_RATE_PLANS = {
  "Peace & Love Villa": 494840,
  "Penthouse Villa": 421511,
  "Villa Penthouse": 421511,
  "Jungle Villa": 529773,
  "Jungle Villa Left": 495795,
  "Jungle Villa Right": 495796,
  "Lodge 1": 293951,
  "Lodge 2": 883795,
  "Red Bungalow": 293954,
  "Green Bungalow": 293962,
  "Yellow Bungalow": 293957,
  "Lagoon Tent": 293955,
  "Lagoon Tent Bungalow": 293955,
  "Camel Tent": 293965,
  "Camel Tent Bungalow": 293965,
  "Room 1": 293963,
  "Room 2": 293959,
  "Room 3": 293948,
  "Room 4": 293945,
  "Room 5": 293943,
  "Internal Room": 293942,
  "Fake Bungalow 1": 649669,
  "Fake Bungalow 2": 921799
};

const WEBHOOK_MIN_STAY_TIMELINE = [
  { dateFrom: '2026-08-01', dateTo: '2026-12-15', minStay: 2 },
  { dateFrom: '2026-12-16', dateTo: '2027-01-15', minStay: 5 },
  { dateFrom: '2027-01-16', dateTo: '2027-03-31', minStay: 3 },
  { dateFrom: '2027-04-01', dateTo: '2027-10-31', minStay: 2 }
];

function getBaselineMinStay(dateStr) {
  const dStr = String(dateStr).slice(0, 10);
  const matched = WEBHOOK_MIN_STAY_TIMELINE.find(p => dStr >= p.dateFrom && dStr <= p.dateTo);
  return matched?.minStay || 2;
}

function addDaysISO(isoStr, n) {
  const parts = isoStr.split('-').map(Number);
  const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + n));
  return d.toISOString().slice(0, 10);
}

function daysDiffISO(startISO, endISO) {
  const s = new Date(startISO + 'T00:00:00Z').getTime();
  const e = new Date(endISO + 'T00:00:00Z').getTime();
  return Math.round((e - s) / 86400000);
}

// NUOVO ALGORITMO CORRETTO: Inizializza TUTTI gli alloggi noti, così anche le stanze con 0 prenotazioni attive vengono ripristinate
function calculateFixedDynamicMinStay(bookings, dateRange) {
  const updates = [];
  const activeBookings = (bookings || []).filter(b => {
    const st = String(b.status || '').toLowerCase();
    return st !== 'cancelled' && st !== 'canceled' && st !== 'deleted';
  });

  // 1. Inizializza la mappa per TUTTE le stanze conosciute
  const roomBookingsMap = {};
  Object.entries(MOTHER_RATE_PLANS).forEach(([rName, mId]) => {
    const normName = rName.replace(/\s+/g, ' ').trim();
    roomBookingsMap[normName] = {
      roomName: normName,
      motherId: String(mId),
      bookings: []
    };
  });

  // 2. Assegna le prenotazioni attive
  activeBookings.forEach((b) => {
    const rawIn = b.checkin || b.check_in || b.startDate || b.arrival || b.fromDate;
    const rawOut = b.checkout || b.check_out || b.endDate || b.departure || b.toDate;
    if (!rawIn || !rawOut) return;

    const inStr = String(rawIn).slice(0, 10);
    const outStr = String(rawOut).slice(0, 10);
    const rawName = String(b.roomName || b.accommodation_name || b.accommodationName || b.room || '').replace(/\s+/g, ' ').trim();
    const rawProd = String(b.product || b.pmsProduct || b.accommodation_id || b.roomId || '');

    // Cerca match per nome o per ID prodotto
    let matchedKey = null;
    if (roomBookingsMap[rawName]) {
      matchedKey = rawName;
    } else {
      const foundEntry = Object.entries(roomBookingsMap).find(([k, v]) => v.motherId === rawProd || rawName.includes(k) || k.includes(rawName));
      if (foundEntry) matchedKey = foundEntry[0];
    }

    if (matchedKey) {
      roomBookingsMap[matchedKey].bookings.push({ in: inStr, out: outStr });
    }
  });

  // 3. Calcolo intervalli e gap per ogni stanza
  Object.values(roomBookingsMap).forEach(({ roomName, motherId, bookings: bList }) => {
    const sorted = bList.sort((a, b) => a.in.localeCompare(b.in));
    const mergedOccupied = [];

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

    const gaps = [];
    if (mergedOccupied.length === 0) {
      // Stanza completamente vuota (nessun booking attivo o cancellati): ripristina la baseline su tutto il range
      gaps.push({ start: dateRange.start, end: dateRange.end });
    } else {
      // Gap iniziale
      if (mergedOccupied[0].in > dateRange.start) {
        gaps.push({ start: dateRange.start, end: mergedOccupied[0].in });
      }
      // Gap intermedi
      for (let i = 0; i < mergedOccupied.length - 1; i++) {
        const prevOut = mergedOccupied[i].out;
        const nextIn = mergedOccupied[i + 1].in;
        if (prevOut < nextIn && prevOut <= dateRange.end && nextIn >= dateRange.start) {
          const effectiveStart = prevOut < dateRange.start ? dateRange.start : prevOut;
          if (effectiveStart < nextIn) {
            gaps.push({ start: effectiveStart, end: nextIn });
          }
        }
      }
      // Gap finale
      const lastOut = mergedOccupied[mergedOccupied.length - 1].out;
      if (lastOut < dateRange.end) {
        const effectiveStart = lastOut < dateRange.start ? dateRange.start : lastOut;
        gaps.push({ start: effectiveStart, end: dateRange.end });
      }
    }

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
            updates.push({
              roomTypeId: motherId,
              accommodationName: roomName,
              dateFrom: blockStart,
              dateTo: blockEnd,
              minStay: blockMinStay,
              reason: gapDays < blockMinStay ? `Gap-Fill (${gapDays}d)` : `Baseline`
            });
            blockStart = cur;
            blockMinStay = target;
          }
          cur = addDaysISO(cur, 1);
        }

        const lastDate = addDaysISO(gapEnd, -1);
        if (blockStart <= lastDate) {
          updates.push({
            roomTypeId: motherId,
            accommodationName: roomName,
            dateFrom: blockStart,
            dateTo: lastDate,
            minStay: blockMinStay,
            reason: gapDays < blockMinStay ? `Gap-Fill (${gapDays}d)` : `Baseline`
          });
        }
      }
    });
  });

  return updates;
}

// TEST DI VALIDAZIONE
console.log('--- TEST 1: Cancellazione prenotazione su Lodge 1 ---');
const bookingsWithLodge1 = [
  { id: 101, roomName: 'Lodge 1', product: 293951, checkin: '2026-11-10', checkout: '2026-11-20', status: 'CONFIRMED' },
  { id: 102, roomName: 'Lodge 1', product: 293951, checkin: '2026-11-21', checkout: '2026-11-22', status: 'CONFIRMED' } // Gap di 1 notte prima
];
console.log('Stato con prenotazione attiva: gap di 1 notte prima di 102.');
const up1 = calculateFixedDynamicMinStay(bookingsWithLodge1, { start: '2026-11-01', end: '2026-11-30' });
const lodge1Updates = up1.filter(u => u.accommodationName === 'Lodge 1');
console.log('Aggiornamenti generati per Lodge 1 (con booking):', lodge1Updates);

console.log('\n--- TEST 2: Cancellazione di 102 (status: CANCELLED) ---');
const bookingsAfterCancel = [
  { id: 101, roomName: 'Lodge 1', product: 293951, checkin: '2026-11-10', checkout: '2026-11-20', status: 'CONFIRMED' },
  { id: 102, roomName: 'Lodge 1', product: 293951, checkin: '2026-11-21', checkout: '2026-11-22', status: 'CANCELLED' }
];
const up2 = calculateFixedDynamicMinStay(bookingsAfterCancel, { start: '2026-11-01', end: '2026-11-30' });
const lodge1UpdatesAfterCancel = up2.filter(u => u.accommodationName === 'Lodge 1');
console.log('Aggiornamenti generati per Lodge 1 (DOPO cancellazione):', lodge1UpdatesAfterCancel);

console.log('\n--- TEST 3: Stanza completamente vuota (es. Penthouse Villa) ---');
const penthouseUpdates = up2.filter(u => u.accommodationName === 'Penthouse Villa');
console.log('Aggiornamenti generati per Penthouse Villa (vuota):', penthouseUpdates);
