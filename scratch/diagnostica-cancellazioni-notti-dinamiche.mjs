import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Caricamento variabili d'ambiente da .env
const envPath = path.resolve(process.cwd(), '.env');
const envVars = {};
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [k, ...v] = trimmed.split('=');
      if (k && v.length) envVars[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
}

const supabaseUrl = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const STRUCTURE_ID = envVars.VITE_OCTORATE_STRUCTURE_ID || '366879';
const CLIENT_ID = envVars.VITE_OCTORATE_CLIENT_ID || envVars.OCTORATE_CLIENT_ID || '';
const CLIENT_SECRET = envVars.OCTORATE_SECRET_KEY || envVars.VITE_OCTORATE_SECRET_KEY || '';

const TEST_ROOM_ID = 649669; // Fake Bungalow 1 (Staging)
const TEST_CHECKIN = '2027-10-20T02:00:00Z[UTC]';
const TEST_CHECKOUT = '2027-10-27T05:00:00Z[UTC]';
const DATE_START = '2027-10-18';
const DATE_END = '2027-10-28';

async function getValidToken() {
  const { data } = await supabase
    .from('octorate_tokens')
    .select('access_token, refresh_token')
    .eq('id', 'singleton')
    .maybeSingle();

  let accessToken = data?.access_token;
  let refreshToken = data?.refresh_token;

  const testHeaders = (t) => ({
    'Authorization': `Bearer ${t}`,
    'Octorate-Api-Key': CLIENT_ID,
    'Accept': 'application/json'
  });

  // Test se il token è vivo
  const testRes = await fetch(`https://api.octorate.com/connect/rest/v1/calendar/${STRUCTURE_ID}?dateFrom=2026-10-01&dateTo=2026-10-02&size=1`, {
    headers: testHeaders(accessToken)
  });

  if (testRes.status === 401 || testRes.status === 403) {
    console.log('   🔄 Token scaduto. Avvio refresh token...');
    const refreshParams = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    const refRes = await fetch('https://api.octorate.com/connect/rest/v1/identity/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: refreshParams.toString()
    });

    if (refRes.ok) {
      const refJson = await refRes.json();
      accessToken = refJson.access_token;
      refreshToken = refJson.refresh_token || refreshToken;
      await supabase.from('octorate_tokens').upsert({
        id: 'singleton',
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: refJson.expires_in,
        updated_at: new Date().toISOString()
      });
      console.log('   ✅ Token Octorate rinnovato e aggiornato su Supabase.');
    } else {
      throw new Error(`Impossibile rinnovare il token Octorate: HTTP ${refRes.status}`);
    }
  }

  return accessToken;
}

function getHeaders(token) {
  const h = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (CLIENT_ID) h['Octorate-Api-Key'] = CLIENT_ID;
  return h;
}

async function getCalendarDays(accessToken, dateFrom, dateTo) {
  let allRooms = [];
  for (let p = 1; p <= 5; p++) {
    const url = `https://api.octorate.com/connect/rest/v1/calendar/${STRUCTURE_ID}?dateFrom=${dateFrom}&dateTo=${dateTo}&size=50&page=${p}`;
    const res = await fetch(url, { headers: getHeaders(accessToken) });
    if (!res.ok) break;
    const json = await res.json();
    const items = json.data || (Array.isArray(json) ? json : []);
    if (!items.length) break;
    allRooms.push(...items);
    if (p >= (json.totalPages || 1)) break;
  }

  const fb1 = allRooms.find(r => r.id === TEST_ROOM_ID || String(r.name || '').includes('Fake Bungalow 1') || String(r.name || '').includes('FB1'));
  const daysMap = {};
  if (fb1 && Array.isArray(fb1.days)) {
    fb1.days.forEach(d => {
      daysMap[d.date] = {
        minStay: d.minStay,
        closed: d.closed,
        price: d.price
      };
    });
  }

  return {
    roomName: fb1?.name || `Fake Bungalow 1 (#${TEST_ROOM_ID})`,
    days: daysMap
  };
}

async function fetchLiveReservations(accessToken, dateStart, dateEnd) {
  const url = `https://api.octorate.com/connect/rest/v1/reservation/${STRUCTURE_ID}?type=STAY&startDate=${dateStart}&endDate=${dateEnd}&size=250`;
  const res = await fetch(url, { headers: getHeaders(accessToken) });
  if (!res.ok) throw new Error(`Reservation API HTTP ${res.status}`);
  const json = await res.json();
  const list = json.data || (Array.isArray(json) ? json : (json.reservations || []));
  return list;
}

async function runMasterDiagnostic() {
  console.log('================================================================================');
  console.log('  🔬 DIAGNOSTICA COMPLETA NOTTI DINAMICHE & CANCELLAZIONI OCTORATE');
  console.log('  Alloggio Test: Fake Bungalow 1 (ID: 649669)');
  console.log('  Periodo Test: Ottobre 2027 (Checkin: 2027-10-20, Checkout: 2027-10-27)');
  console.log('================================================================================\n');

  try {
    const accessToken = await getValidToken();
    console.log('✅ Token Octorate verificato e autenticato con successo.');

    // FASE 0: Stato Iniziale
    console.log('\n👉 [FASE 0] Lettura Stato Iniziale Calendario Octorate (18-28 Ottobre 2027)...');
    const cal0 = await getCalendarDays(accessToken, DATE_START, DATE_END);
    console.log(`   • Alloggio: ${cal0.roomName}`);
    console.log(`   • 19 Ottobre 2027: MinStay = ${cal0.days['2027-10-19']?.minStay}`);
    console.log(`   • 27 Ottobre 2027: MinStay = ${cal0.days['2027-10-27']?.minStay}`);

    // FASE 1: Creazione Prenotazione Test
    console.log('\n👉 [FASE 1] Creazione Prenotazione Test su Octorate PMS (20-27 Ottobre 2027)...');
    const createUrl = `https://api.octorate.com/connect/rest/v1/reservation/${STRUCTURE_ID}`;
    const bookingPayload = {
      channelId: 288,
      status: 'CONFIRMED',
      product: TEST_ROOM_ID,
      checkin: TEST_CHECKIN,
      checkout: TEST_CHECKOUT,
      totalGuest: 2,
      guests: [{ type: 'BOOKER', givenName: 'AutoDiagnostic', familyName: 'FullCycle', language: 'EN', source: 'USER' }]
    };

    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: getHeaders(accessToken),
      body: JSON.stringify(bookingPayload)
    });

    const createJson = await createRes.json();
    const reservationId = createJson.id;
    if (!reservationId) throw new Error(`Creazione fallita: ${JSON.stringify(createJson)}`);
    console.log(`   ✅ Prenotazione creata su Octorate PMS! ID: ${reservationId}`);

    console.log('   ⏳ Attesa sincronizzazione interna Octorate (3s)...');
    await new Promise(r => setTimeout(r, 3000));

    // Trigger Webhook Creazione
    console.log('   📡 Invio Evento Webhook: RESERVATION_CREATED...');
    const wh1Res = await fetch('https://flowerpowervillage.vercel.app/api/webhooks/octorate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'RESERVATION_CREATED', id: reservationId })
    });
    const wh1Json = await wh1Res.json();
    console.log(`   📥 Risposta Webhook Creazione: Aggiornamenti calcolati = ${wh1Json.calculatedUpdatesCount}, Stato Octorate = ${wh1Json.octorateStatus}`);

    console.log('   ⏳ Attesa elaborazione bulk Octorate (4s)...');
    await new Promise(r => setTimeout(r, 4000));

    const calAfterCreate = await getCalendarDays(accessToken, DATE_START, DATE_END);
    console.log(`   👉 STATO CALENDARIO OCTORATE DOPO CREAZIONE:`);
    console.log(`      • 19 Ottobre 2027 = ${calAfterCreate.days['2027-10-19']?.minStay} notte (Atteso: 1 notte)`);
    console.log(`      • 27 Ottobre 2027 = ${calAfterCreate.days['2027-10-27']?.minStay} notte (Atteso: 1 notte)`);

    // FASE 2: Cancellazione Prenotazione Test
    console.log(`\n👉 [FASE 2 - CRUCIALE] Cancellazione Prenotazione Test (ID: ${reservationId})...`);
    const deleteUrl = `https://api.octorate.com/connect/rest/v1/reservation/${STRUCTURE_ID}/${reservationId}`;
    const deleteRes = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: getHeaders(accessToken)
    });
    console.log(`   🗑️ Esito Cancellazione Octorate PMS: HTTP ${deleteRes.status}`);

    console.log('   ⏳ Attesa commit cancellazione Octorate (3s)...');
    await new Promise(r => setTimeout(r, 3000));

    // ISPEZIONE API DOPO CANCELLAZIONE
    console.log('   🔍 ISPEZIONE API OCTORATE DOPO CANCELLAZIONE:');
    const listAfterDelete = await fetchLiveReservations(accessToken, '2027-10-01', '2027-10-31');
    const foundInList = listAfterDelete.find(b => b.id === reservationId);
    if (foundInList) {
      console.log(`   ⚠️ NOTA: La prenotazione è ancora presente nell'endpoint STAY con status: "${foundInList.status}"`);
    } else {
      console.log(`   ℹ️ NOTA: La prenotazione è stata eliminata dall'endpoint STAY.`);
    }

    // Trigger Webhook Cancellazione
    console.log('\n   📡 Invio Evento Webhook: RESERVATION_CANCELLED...');
    const wh2Res = await fetch('https://flowerpowervillage.vercel.app/api/webhooks/octorate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'RESERVATION_CANCELLED', id: reservationId })
    });
    const wh2Json = await wh2Res.json();
    console.log(`   📥 Risposta Webhook Cancellazione: Aggiornamenti calcolati = ${wh2Json.calculatedUpdatesCount}, Stato Octorate = ${wh2Json.octorateStatus}`);

    console.log('   ⏳ Attesa elaborazione bulk ripristino Octorate (4s)...');
    await new Promise(r => setTimeout(r, 4000));

    // FASE 3: Verifica Calendario Finale
    const calAfterDelete = await getCalendarDays(accessToken, DATE_START, DATE_END);
    console.log(`\n👉 [FASE 3 - VERIFICA FINALE] Calendario Octorate DOPO Cancellazione:`);
    console.log(`      • 19 Ottobre 2027 = ${calAfterDelete.days['2027-10-19']?.minStay} notti (Atteso ripristino: 2 notti)`);
    console.log(`      • 27 Ottobre 2027 = ${calAfterDelete.days['2027-10-27']?.minStay} notti (Atteso ripristino: 2 notti)`);

    console.log('\n================================================================================');
    if (calAfterDelete.days['2027-10-19']?.minStay === 2 && calAfterDelete.days['2027-10-27']?.minStay === 2) {
      console.log('  🎉 ESITO TEST: Ripristino notti dinamiche avvenuto con successo (2 e 2)!');
    } else {
      console.log('  ❌ BUG RILEVATO: Il calendario Octorate NON ha ripristinato le notti dinamiche a 2!');
      console.log(`     Valori attuali: 19 Ott = ${calAfterDelete.days['2027-10-19']?.minStay}, 27 Ott = ${calAfterDelete.days['2027-10-27']?.minStay}`);
    }
    console.log('================================================================================\n');

  } catch (err) {
    console.error('❌ ERRORE CRITICO:', err.message);
  }
}

runMasterDiagnostic();
