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

async function scanAllReservationsForOverbooking() {
  console.log('📡 Recupero tutte le prenotazioni live da Octorate e Supabase...');

  const { data: tokenData } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').single();
  const token = tokenData.access_token;
  const structureId = envVars.VITE_OCTORATE_STRUCTURE_ID || '366879';

  // 1. Fetch live from Octorate (page size 100)
  const todayStr = new Date().toISOString().slice(0, 10);
  const allOctorateBookings = [];

  for (let page = 1; page <= 10; page++) {
    const url = `https://api.octorate.com/connect/rest/v1/reservations/${structureId}?checkinFrom=${todayStr}&page=${page}&size=50`;
    try {
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (!res.ok) break;
      const json = await res.json();
      const list = json.data || (Array.isArray(json) ? json : []);
      if (!list || list.length === 0) break;
      allOctorateBookings.push(...list);
    } catch (e) {
      break;
    }
  }

  // Also query Supabase active reservations
  const { data: supabaseReservations } = await supabase
    .from('reservations')
    .select('*')
    .neq('status', 'cancelled')
    .gte('check_out', todayStr);

  console.log(`✅ Recuperate ${allOctorateBookings.length} prenotazioni da Octorate e ${supabaseReservations?.length || 0} da Supabase.`);

  // Normalize all active reservations into a clean list
  const activeList = [];

  // From Octorate
  for (const b of allOctorateBookings) {
    if (b.status === 'cancelled' || b.status === 'CANCELLED' || b.cancelled === true) continue;
    
    // Each room inside booking
    if (Array.isArray(b.rooms) && b.rooms.length > 0) {
      for (const room of b.rooms) {
        activeList.push({
          source: 'Octorate',
          bookingId: String(b.id || b.referenceId || b.reservationCode),
          externalCode: b.referenceId || b.reservationCode || b.id,
          guest: `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.guestName || 'Unknown',
          channel: b.channelName || b.portalName || 'Direct',
          checkin: (room.checkin || b.checkin || '').slice(0, 10),
          checkout: (room.checkout || b.checkout || '').slice(0, 10),
          accommodation: room.roomName || room.name || b.roomName || 'Alloggio Sconosciuto',
          roomId: room.roomId || room.id,
          created: b.createTime || b.createdAt
        });
      }
    } else {
      activeList.push({
        source: 'Octorate',
        bookingId: String(b.id || b.referenceId || b.reservationCode),
        externalCode: b.referenceId || b.reservationCode || b.id,
        guest: `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.guestName || 'Unknown',
        channel: b.channelName || b.portalName || 'Direct',
        checkin: (b.checkin || '').slice(0, 10),
        checkout: (b.checkout || '').slice(0, 10),
        accommodation: b.roomName || b.accommodationName || 'Alloggio Sconosciuto',
        roomId: b.roomId,
        created: b.createTime || b.createdAt
      });
    }
  }

  // Deduplicate and group by Accommodation
  const byAcc = {};
  const seenKeys = new Set();

  for (const r of activeList) {
    if (!r.checkin || !r.checkout) continue;
    const dedupKey = `${r.bookingId}_${r.accommodation}_${r.checkin}`;
    if (seenKeys.has(dedupKey)) continue;
    seenKeys.add(dedupKey);

    // Normalize accommodation name
    let accNorm = r.accommodation.trim();
    // remove rate suffixes to get physical room name
    accNorm = accNorm
      .replace(/\s*\(.*?\)/g, '')
      .replace(/\s+(AC|Fan|Standard|bnb|7d|14d|AirBnB|BE|AGD|Agoda).*$/i, '')
      .trim();

    if (!byAcc[accNorm]) byAcc[accNorm] = [];
    byAcc[accNorm].push(r);
  }

  console.log('\n=================================================================');
  console.log('🔍 SCANSIONE OVERBOOKING / SOVRAPPOSIZIONI SU TUTTI GLI ALLOGGI');
  console.log('=================================================================');

  let overbookingCount = 0;
  const overbookingReports = [];

  for (const [acc, list] of Object.entries(byAcc)) {
    list.sort((a, b) => (a.checkin > b.checkin ? 1 : -1));

    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const r1 = list[i];
        const r2 = list[j];

        // Overlap condition: r1.checkin < r2.checkout AND r2.checkin < r1.checkout
        if (r1.checkin < r2.checkout && r2.checkin < r1.checkout) {
          overbookingCount++;
          const report = {
            accommodation: acc,
            res1: r1,
            res2: r2,
            isSameBooking: r1.bookingId === r2.bookingId
          };
          overbookingReports.push(report);
          
          console.log(`\n🚨 CONFLITTO #${overbookingCount} SU: "${acc}"`);
          console.log(`   - Prenotazione A: ID ${r1.bookingId} (${r1.channel}) | Ospite: ${r1.guest} | Date: ${r1.checkin} ➔ ${r1.checkout}`);
          console.log(`   - Prenotazione B: ID ${r2.bookingId} (${r2.channel}) | Ospite: ${r2.guest} | Date: ${r2.checkin} ➔ ${r2.checkout}`);
          if (r1.bookingId === r2.bookingId) {
            console.log(`   ⚠️ NOTA: Stessa transazione cumulativa multi-camera! (Es. ${r1.guest})`);
          } else {
            console.log(`   ⚠️ NOTA: Due prenotazioni DIVERSE in collisione!`);
          }
        }
      }
    }
  }

  console.log('\n=================================================================');
  console.log(`📊 TOTALE OVERBOOKING / CONFLITTI TROVATI: ${overbookingCount}`);
  console.log('=================================================================');

  if (overbookingCount === 0) {
    console.log('✅ ZERO OVERBOOKING: Tutti gli alloggi hanno prenotazioni perfettamente lineari e senza sovrapposizioni.');
  }
}

scanAllReservationsForOverbooking().catch(console.error);
