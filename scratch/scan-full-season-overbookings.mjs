import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envVars = {};
['.env', '.env.local'].forEach(file => {
  const filePath = path.resolve(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...rest] = trimmed.split('=');
        if (key) envVars[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  }
});

const supabase = createClient(
  envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY
);

async function checkAllLiveOctorateBookings() {
  const { data: tokenData } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').single();
  const token = tokenData.access_token;
  const structureId = envVars.VITE_OCTORATE_STRUCTURE_ID || '366879';

  const dateFrom = '2026-10-01';
  const dateTo = '2027-05-31';

  console.log(`📡 Interrogazione Octorate API per tutte le prenotazioni della stagione: ${dateFrom} ➔ ${dateTo}`);

  const rawItems = [];
  const pageSize = 50;
  let page = 0;
  let hasMore = true;

  while (hasMore && page < 20) {
    const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/${structureId}?type=STAY&startDate=${dateFrom}&endDate=${dateTo}&size=${pageSize}&page=${page}`;
    const res = await fetch(octUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      console.warn(`Fetch error page ${page}: HTTP ${res.status}`);
      break;
    }

    const json = await res.json();
    const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : (json.reservations || []));
    if (!items || items.length === 0) {
      hasMore = false;
      break;
    }

    rawItems.push(...items);
    if (items.length < pageSize) {
      hasMore = false;
    } else {
      page++;
    }
  }

  console.log(`✅ Totale prenotazioni recuperate da Octorate: ${rawItems.length}\n`);

  // Normalized list of active stays
  const activeStays = [];

  for (const b of rawItems) {
    const status = String(b.status || '').toLowerCase();
    if (status.includes('cancel') || status === 'c' || b.cancelled === true) continue;

    const guestName = `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.guestName || b.customerName || 'Ospite';
    const channel = b.channelName || b.portalName || b.otaName || 'OTA';
    const bookingCode = b.referenceId || b.reservationCode || b.id;

    // Check if multi-room
    if (Array.isArray(b.rooms) && b.rooms.length > 0) {
      for (const rm of b.rooms) {
        activeStays.push({
          bookingId: String(b.id),
          bookingCode,
          guestName,
          channel,
          roomName: rm.roomName || rm.name || b.roomName || 'Alloggio',
          roomId: rm.roomId || rm.id,
          checkin: (rm.checkin || b.checkin || '').slice(0, 10),
          checkout: (rm.checkout || b.checkout || '').slice(0, 10),
          totalPrice: rm.price || b.totalAmount || 0,
          created: b.createTime || b.createdAt
        });
      }
    } else {
      activeStays.push({
        bookingId: String(b.id),
        bookingCode,
        guestName,
        channel,
        roomName: b.roomName || b.accommodationName || 'Alloggio',
        roomId: b.roomId,
        checkin: (b.checkin || '').slice(0, 10),
        checkout: (b.checkout || '').slice(0, 10),
        totalPrice: b.totalAmount || 0,
        created: b.createTime || b.createdAt
      });
    }
  }

  console.log(`✅ Totale soggiorni attivi confermati (escluse cancellate): ${activeStays.length}`);

  // Group by Normalized Accommodation Name
  const byAccommodation = {};
  for (const stay of activeStays) {
    let acc = (stay.roomName || 'Alloggio').trim();
    // Normalize room name removing tariff details
    acc = acc
      .replace(/\s*\(.*?\)/g, '')
      .replace(/\s+(AC|Fan|Standard|bnb|7d|14d|AirBnB|BE|AGD|Agoda).*$/i, '')
      .trim();

    if (!byAccommodation[acc]) byAccommodation[acc] = [];
    byAccommodation[acc].push(stay);
  }

  console.log('\n=================================================================');
  console.log('🔍 SCANSIONE OVERBOOKING SU TUTTI I SOGGIORNI CONFERMATI');
  console.log('=================================================================');

  let overbookingCount = 0;
  const overlapsList = [];

  for (const [accName, stays] of Object.entries(byAccommodation)) {
    stays.sort((a, b) => (a.checkin > b.checkin ? 1 : -1));

    for (let i = 0; i < stays.length; i++) {
      for (let j = i + 1; j < stays.length; j++) {
        const s1 = stays[i];
        const s2 = stays[j];

        // Overlap condition
        if (s1.checkin < s2.checkout && s2.checkin < s1.checkout) {
          overbookingCount++;
          overlapsList.push({ accName, s1, s2 });
          console.log(`\n🚨 OVERBOOKING #${overbookingCount} RILEVATO SU: "${accName}"`);
          console.log(`   🔸 Prenotazione 1: ID Octorate ${s1.bookingId} [Codice OTA: ${s1.bookingCode}]`);
          console.log(`      Ospite: ${s1.guestName} | Canale: ${s1.channel}`);
          console.log(`      Date: ${s1.checkin} ➔ ${s1.checkout} (${s1.roomName})`);
          console.log(`   🔹 Prenotazione 2: ID Octorate ${s2.bookingId} [Codice OTA: ${s2.bookingCode}]`);
          console.log(`      Ospite: ${s2.guestName} | Canale: ${s2.channel}`);
          console.log(`      Date: ${s2.checkin} ➔ ${s2.checkout} (${s2.roomName})`);
          if (s1.bookingId === s2.bookingId) {
            console.log(`      ⚠️ TIPO: Stessa transazione cumulativa (Doppia camera prenotata dallo stesso ospite)`);
          } else {
            console.log(`      ⚠️ TIPO: Due prenotazioni distinte in collisione temporale`);
          }
        }
      }
    }
  }

  console.log('\n=================================================================');
  console.log(`📊 TOTALE OVERBOOKING RILEVATI SULL'INTERA STAGIONE: ${overbookingCount}`);
  console.log('=================================================================');

  if (overbookingCount === 0) {
    console.log('✅ ZERO OVERBOOKING: Tutte le altre prenotazioni della stagione sono perfettamente distribuite e prive di sovrapposizioni.');
  }
}

checkAllLiveOctorateBookings().catch(console.error);
