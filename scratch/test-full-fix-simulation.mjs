import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) envVars[k.trim()] = v.join('=').trim();
  }
}

const supabase = createClient(
  envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY
);

const STRUCTURE_ID = envVars.VITE_OCTORATE_STRUCTURE_ID || '366879';
const CLIENT_ID = envVars.VITE_OCTORATE_CLIENT_ID || envVars.OCTORATE_CLIENT_ID;

function toThailandDateStr(raw) {
  if (!raw) return '';
  const s = String(raw).trim();
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (isNaN(d.getTime())) return s.slice(0, 10);
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
  } catch (e) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}

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

const ACCOMMODATION_PRODUCTS_MAP = {
  "Fake Bungalow 1": ['649669', '932243', '932244', '932246', '932247', '932248', '932249', '932250', '932251', '932252', '932253', '932254', '932255'],
  "Fake Bungalow 2": ['921799', '932256', '932257', '932259', '932260', '932261', '932262', '932263', '932264', '932265', '932266', '932267', '932268'],
  "Peace & Love Villa": ['494840', '495566', '495580', '495575', '495552', '495587', '495565', '495593', '921874', '921875', '495569', '495609'],
  "Penthouse Villa": ['421511', '449348', '421513', '421516', '421520', '421522', '421525', '421527', '421530', '921876', '921877', '421532', '421533'],
  "Villa Penthouse": ['421511', '449348', '421513', '421516', '421520', '421522', '421525', '421527', '421530', '921876', '921877', '421532', '421533'],
  "Jungle Villa": ['529773', '529784', '529778', '529792', '529788', '529780', '916816', '529781', '529801', '921868', '921869', '529783', '529813'],
  "Jungle Villa Left": ['495795', '495807', '495804', '496009', '496001', '495805', '496022', '495806', '496031', '921870', '921871', '495810', '496057'],
  "Jungle Villa Right": ['495796', '495980', '495977', '496010', '496002', '495978', '496021', '495979', '496030', '921872', '921873', '495982', '496056'],
  "Lodge 1": ['293951', '449736', '422149', '332769', '332767', '331974', '332129', '422157', '332142', '921884', '921885', '297030', '421510'],
  "Lodge 2": ['883795', '923905', '916108', '916107', '916109', '916114', '916829', '916105', '916830', '921886', '921887', '916103', '916104'],
  "Red Bungalow": ['293954', '449422', '293953', '332030', '332029', '330964', '332035', '330970', '332036', '921880', '921881', '297021', '340196'],
  "Green Bungalow": ['293962', '449668', '293961', '332070', '332066', '331923', '332072', '331924', '332074', '921882', '921883', '297023', '340200'],
  "Yellow Bungalow": ['293957', '449385', '293958', '332055', '332054', '331921', '332057', '331922', '332060', '921878', '921879', '297022', '340198'],
  "Lagoon Tent": ['293955', '449674', '422351', '293956', '332081', '332077', '297024'],
  "Lagoon Tent Bungalow": ['293955', '449674', '422351', '293956', '332081', '332077', '297024'],
  "Camel Tent": ['293965', '449675', '422325', '293966', '332089', '332084', '297025'],
  "Camel Tent Bungalow": ['293965', '449675', '422325', '293966', '332089', '332084', '297025'],
  "Room 1": ['293963', '449678', '422300', '332737', '332735', '331976', '916818', '331977', '916402', '921889', '921890', '297033', '421505'],
  "Room 2": ['293959', '449684', '422296', '332741', '332739', '331966', '332119', '331967', '332134', '921891', '921900', '297032', '421506'],
  "Room 3": ['293948', '449699', '422293', '332743', '332757', '331968', '332121', '331969', '332136', '921892', '921893', '297028', '421507'],
  "Room 4": ['293945', '449724', '422265', '332759', '332746', '331970', '332123', '331971', '332138', '921894', '921895', '297029', '421508'],
  "Room 5": ['293943', '449730', '422213', '332765', '332763', '331972', '332125', '331973', '332140', '921896', '921897', '297031', '421509'],
  "Internal Room": ['293942', '449742', '293941', '332109', '332105', '340367', '916840', '421998', '916838', '921898', '921899', '297027', '422147']
};

const WEBHOOK_MIN_STAY_TIMELINE = [
  { dateFrom: '2026-08-01', dateTo: '2026-12-15', minStay: 2 },
  { dateFrom: '2026-12-16', dateTo: '2027-01-15', minStay: 5 },
  { dateFrom: '2027-01-16', dateTo: '2027-03-31', minStay: 3 },
  { dateFrom: '2027-04-01', dateTo: '2027-10-31', minStay: 2 }
];

function getBaselineMinStay(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return 2;
  const dStr = dateStr.slice(0, 10);
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

function calculateRobustDynamicMinStay(bookings, dateRange) {
  const updates = [];
  const activeBookings = (bookings || []).filter(b => {
    const st = String(b.status || '').toUpperCase().trim();
    return st !== 'CANCELLED' && st !== 'CANCELED' && st !== 'DELETED' && st !== 'VOID' && st !== 'REJECTED' && !b.cancelled && !b.isCancelled;
  });

  const roomBookingsMap = {};
  Object.entries(MOTHER_RATE_PLANS).forEach(([rName, mId]) => {
    const normName = rName.replace(/\s+/g, ' ').trim();
    roomBookingsMap[normName] = {
      roomName: normName,
      motherId: String(mId),
      bookings: []
    };
  });

  activeBookings.forEach((b) => {
    const rawIn = b.checkin || b.check_in || b.startDate || b.arrival || b.fromDate;
    const rawOut = b.checkout || b.check_out || b.endDate || b.departure || b.toDate;
    if (!rawIn || !rawOut) return;

    const inStr = toThailandDateStr(rawIn);
    const outStr = toThailandDateStr(rawOut);
    const rawName = String(b.roomName || b.accommodation_name || b.accommodationName || b.room || '').replace(/\s+/g, ' ').trim();
    const rawProd = String(b.product || b.pmsProduct || b.accommodation_id || b.roomId || '');

    let matchedKey = null;
    if (roomBookingsMap[rawName]) {
      matchedKey = rawName;
    } else {
      const foundEntry = Object.entries(roomBookingsMap).find(([k, v]) => {
        const productIds = ACCOMMODATION_PRODUCTS_MAP[k] || [v.motherId];
        return v.motherId === rawProd || productIds.includes(rawProd) || rawName.includes(k) || k.includes(rawName);
      });
      if (foundEntry) matchedKey = foundEntry[0];
    }

    if (matchedKey) {
      roomBookingsMap[matchedKey].bookings.push({ in: inStr, out: outStr });
    }
  });

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
      gaps.push({ start: dateRange.start, end: dateRange.end });
    } else {
      if (mergedOccupied[0].in > dateRange.start) {
        gaps.push({ start: dateRange.start, end: mergedOccupied[0].in });
      }

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

      const lastOut = mergedOccupied[mergedOccupied.length - 1].out;
      if (lastOut < dateRange.end) {
        const effectiveStart = lastOut < dateRange.start ? dateRange.start : lastOut;
        gaps.push({ start: effectiveStart, end: dateRange.end });
      }
    }

    const targetProductIds = ACCOMMODATION_PRODUCTS_MAP[roomName] || [motherId];

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
            targetProductIds.forEach(targetId => {
              updates.push({
                roomTypeId: targetId,
                accommodationName: roomName,
                dateFrom: blockStart,
                dateTo: blockEnd,
                minStay: blockMinStay,
                reason: gapDays < blockMinStay
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
          targetProductIds.forEach(targetId => {
            updates.push({
              roomTypeId: targetId,
              accommodationName: roomName,
              dateFrom: blockStart,
              dateTo: lastDate,
              minStay: blockMinStay,
              reason: gapDays < blockMinStay
                ? `Gap-Fill Dinamico (${gapDays}d): M=${blockMinStay}`
                : `Minimo da Gestione Tariffe Derivate: M=${blockMinStay}`
            });
          });
        }
      }
    });
  });

  return updates;
}

async function runTest() {
  console.log('========================================================================');
  console.log('  🧪 TEST REALE COLLAUDO CREAZIONE -> GAP -> CANCELLAZIONE -> RIPRISTINO');
  console.log('========================================================================\n');

  const { data } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').single();
  const token = data.access_token;
  const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' };

  // 1. Fetch current status of Fake Bungalow 1
  console.log('📌 [FASE 1] Lettura calendario Fake Bungalow 1 (18-28 Ottobre 2027)...');
  const calRes1 = await fetch(`https://api.octorate.com/connect/rest/v1/calendar/366879?dateFrom=2027-10-18&dateTo=2027-10-28&size=50&page=1`, { headers });
  const calJson1 = await calRes1.json();
  const fb1Initial = (calJson1.data || calJson1 || []).find(r => r.id === 649669);
  console.log('   Stato iniziale FB1:');
  fb1Initial?.days?.forEach(d => console.log(`     ${d.date}: minStay = ${d.minStay}`));

  // 2. Create booking on 2027-10-20 to 2027-10-27 (leaving Oct 19 as 1-night gap)
  console.log('\n📌 [FASE 2] Creazione prenotazione su Fake Bungalow 1 (2027-10-20 al 2027-10-27)...');
  const createRes = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/${STRUCTURE_ID}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      channelId: 288,
      status: 'CONFIRMED',
      product: 649669,
      checkin: '2027-10-20T02:00:00Z[UTC]',
      checkout: '2027-10-27T05:00:00Z[UTC]',
      totalGuest: 2,
      guests: [{ type: 'BOOKER', givenName: 'LiveTest', familyName: 'Bungalow1', language: 'EN', source: 'USER' }]
    })
  });
  const createdBooking = await createRes.json();
  console.log(`   ✅ Prenotazione creata con ID: ${createdBooking.id}`);

  // 3. Fetch all bookings (from page 0)
  console.log('\n📌 [FASE 3] Scaricamento prenotazioni (con page=0)...');
  const bookRes = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=2026-11-01&endDate=2027-10-31&size=200&page=0`, { headers });
  const bookJson = await bookRes.json();
  const allLive = Array.isArray(bookJson.data) ? bookJson.data : (Array.isArray(bookJson) ? bookJson : []);
  console.log(`   Scaricati ${allLive.length} record. Prenotazione ${createdBooking.id} presente?:`, allLive.some(b => b.id === createdBooking.id));

  // 4. Calculate updates with active booking
  const updatesWithBooking = calculateRobustDynamicMinStay(allLive, { start: '2027-10-18', end: '2027-10-28' });
  const fb1Updates1 = updatesWithBooking.filter(u => u.accommodationName === 'Fake Bungalow 1');
  console.log(`   Aggiornamenti generati per FB1 (con booking attivo):`);
  fb1Updates1.slice(0, 5).forEach(u => console.log(`     Rate ${u.roomTypeId}: [${u.dateFrom} -> ${u.dateTo}] = ${u.minStay} (${u.reason})`));

  // Send updates to Octorate
  console.log('   Invio aggiornamento minStay a Octorate (Bulk)...');
  const payload1 = fb1Updates1.map(u => ({ room: Number(u.roomTypeId), dateFrom: u.dateFrom, dateTo: u.dateTo, values: { minstay: u.minStay } }));
  const bulkRes1 = await fetch(`https://api.octorate.com/connect/rest/v1/calendar/bulk`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload1)
  });
  console.log(`   Esito invio Octorate: HTTP ${bulkRes1.status}`);

  // Check calendar on Octorate
  const calRes2 = await fetch(`https://api.octorate.com/connect/rest/v1/calendar/366879?dateFrom=2027-10-18&dateTo=2027-10-28&size=50&page=1`, { headers });
  const calJson2 = await calRes2.json();
  const fb1AfterCreate = (calJson2.data || calJson2 || []).find(r => r.id === 649669);
  console.log('   Stato calendario FB1 dopo creazione:');
  fb1AfterCreate?.days?.filter(d => ['2027-10-19', '2027-10-27'].includes(d.date)).forEach(d => console.log(`     ${d.date}: minStay = ${d.minStay}`));

  // 5. Cancel reservation on Octorate (DELETE)
  console.log(`\n📌 [FASE 4] Cancellazione prenotazione ${createdBooking.id} su Octorate...`);
  const delRes = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/${STRUCTURE_ID}/${createdBooking.id}`, {
    method: 'DELETE',
    headers
  });
  console.log(`   Cancellazione Octorate status: HTTP ${delRes.status}`);

  // 6. Fetch all bookings again (from page 0)
  console.log('\n📌 [FASE 5] Ricaricamento prenotazioni Octorate dopo cancellazione...');
  const bookResAfterCancel = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=2026-11-01&endDate=2027-10-31&size=200&page=0`, { headers });
  const bookJsonAfterCancel = await bookResAfterCancel.json();
  const allLiveAfterCancel = Array.isArray(bookJsonAfterCancel.data) ? bookJsonAfterCancel.data : (Array.isArray(bookJsonAfterCancel) ? bookJsonAfterCancel : []);
  const cancelledRecord = allLiveAfterCancel.find(b => b.id === createdBooking.id);
  console.log(`   Record ${createdBooking.id} status dopo DELETE: ${cancelledRecord?.status}`);

  // 7. Calculate updates after cancellation
  const updatesAfterCancel = calculateRobustDynamicMinStay(allLiveAfterCancel, { start: '2027-10-18', end: '2027-10-28' });
  const fb1UpdatesAfterCancel = updatesAfterCancel.filter(u => u.accommodationName === 'Fake Bungalow 1');
  console.log(`   Aggiornamenti generati per FB1 (DOPO cancellazione):`);
  fb1UpdatesAfterCancel.slice(0, 5).forEach(u => console.log(`     Rate ${u.roomTypeId}: [${u.dateFrom} -> ${u.dateTo}] = ${u.minStay} (${u.reason})`));

  // Send restoration updates to Octorate
  console.log('   Invio ripristino minStay a Octorate (Bulk)...');
  const payload2 = fb1UpdatesAfterCancel.map(u => ({ room: Number(u.roomTypeId), dateFrom: u.dateFrom, dateTo: u.dateTo, values: { minstay: u.minStay } }));
  const bulkRes2 = await fetch(`https://api.octorate.com/connect/rest/v1/calendar/bulk`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload2)
  });
  console.log(`   Esito invio Octorate: HTTP ${bulkRes2.status}`);

  // 8. Verify calendar on Octorate after cancellation restoration
  console.log('\n📌 [FASE 6] Verifica finale del calendario reale su Octorate...');
  const calRes3 = await fetch(`https://api.octorate.com/connect/rest/v1/calendar/366879?dateFrom=2027-10-18&dateTo=2027-10-28&size=50&page=1`, { headers });
  const calJson3 = await calRes3.json();
  const fb1Final = (calJson3.data || calJson3 || []).find(r => r.id === 649669);
  console.log('   Stato calendario FB1 DOPO ripristino:');
  fb1Final?.days?.filter(d => ['2027-10-19', '2027-10-27'].includes(d.date)).forEach(d => console.log(`     ${d.date}: minStay = ${d.minStay}`));

  console.log('\n========================================================================');
  console.log('                        COLLAUDO COMPLETATO                             ');
  console.log('========================================================================\n');
}

runTest().catch(console.error);
