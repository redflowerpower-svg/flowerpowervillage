import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env
const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) envVars[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
  }
}

const supabase = createClient(
  envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY
);

const STRUCTURE_ID = envVars.VITE_OCTORATE_STRUCTURE_ID || '366879';
const CLIENT_ID = envVars.VITE_OCTORATE_CLIENT_ID || envVars.OCTORATE_CLIENT_ID;

async function getAccessToken() {
  const { data, error } = await supabase.from('octorate_tokens').select('*').eq('id', 'singleton').single();
  if (error || !data?.access_token) {
    throw new Error('No access token in database');
  }
  return data.access_token;
}

async function run() {
  console.log('========================================================================');
  console.log('      DIAGNOSI AVANZATA OCTORATE: SOTTOSCRIZIONI, EVENTI & CANCELLAZIONI');
  console.log('========================================================================\n');

  const token = await getAccessToken();
  const headers = {
    'Authorization': `Bearer ${token}`,
    ...(CLIENT_ID ? { 'Octorate-Api-Key': CLIENT_ID } : {}),
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  // 1. Check Subscriptions supported & active
  console.log('📌 [STEP 1] Verifica Sottoscrizioni Webhook attive su Octorate...');
  try {
    const listRes = await fetch('https://api.octorate.com/connect/rest/v1/subscription/list', { headers });
    console.log('   Supported Events Status:', listRes.status);
    const listJson = await listRes.json();
    console.log('   Supported Events List:', JSON.stringify(listJson, null, 2));
  } catch (e) {
    console.warn('   Could not get subscription list:', e.message);
  }

  try {
    const actRes = await fetch('https://api.octorate.com/connect/rest/v1/subscription', { headers });
    console.log('\n   Active Subscriptions Status:', actRes.status);
    const actJson = await actRes.json();
    console.log('   Active Subscriptions:', JSON.stringify(actJson, null, 2));
  } catch (e) {
    console.warn('   Could not get active subscriptions:', e.message);
  }

  // 2. Query Current Reservations in Oct 2027
  console.log('\n📌 [STEP 2] Query Prenotazioni Esistenti (Ottobre 2027)...');
  const getRes = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/${STRUCTURE_ID}?type=STAY&startDate=2027-10-01&endDate=2027-10-31&size=50&page=1`, { headers });
  console.log('   Query Status:', getRes.status);
  const getJson = await getRes.json();
  const rawList = Array.isArray(getJson) ? getJson : (getJson.data || getJson.reservations || []);
  console.log(`   Trovate ${rawList.length} prenotazioni.`);
  if (rawList.length > 0) {
    console.log('   Esempio prima prenotazione:', JSON.stringify(rawList[0], null, 2));
  }

  // 3. Create a test reservation on Fake Bungalow 1 (649669)
  console.log('\n📌 [STEP 3] Creazione Prenotazione Test su Fake Bungalow 1 (#649669)...');
  const createPayload = {
    channelId: 288,
    status: 'CONFIRMED',
    product: 649669,
    checkin: '2027-10-20T02:00:00Z[UTC]',
    checkout: '2027-10-25T05:00:00Z[UTC]',
    totalGuest: 2,
    guests: [{
      type: 'BOOKER',
      givenName: 'TestDiagnostic',
      familyName: 'Robot',
      language: 'EN',
      source: 'USER'
    }]
  };

  const createRes = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/${STRUCTURE_ID}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(createPayload)
  });
  console.log('   Create Status:', createRes.status);
  const createJson = await createRes.json();
  console.log('   Create Response:', JSON.stringify(createJson, null, 2));
  const newReservationId = createJson.id;

  if (!newReservationId) {
    console.error('❌ Prenotazione non creata. Interruzione.');
    return;
  }

  // 4. Query Single Reservation Detail
  console.log(`\n📌 [STEP 4] Dettaglio Prenotazione Creata (ID: ${newReservationId})...`);
  const detailRes = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/${STRUCTURE_ID}/${newReservationId}`, { headers });
  console.log('   Detail Status:', detailRes.status);
  const detailJson = await detailRes.json();
  console.log('   Detail Fields:', JSON.stringify(detailJson, null, 2));

  // 5. Query List with Reservation Active
  console.log('\n📌 [STEP 5] Query Lista con Prenotazione Attiva...');
  const listActiveRes = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/${STRUCTURE_ID}?type=STAY&startDate=2027-10-01&endDate=2027-10-31&size=50&page=1`, { headers });
  const listActiveJson = await listActiveRes.json();
  const activeItems = Array.isArray(listActiveJson) ? listActiveJson : (listActiveJson.data || listActiveJson.reservations || []);
  const foundActive = activeItems.find(it => it.id === newReservationId);
  console.log('   Trovata nella lista STAY?:', foundActive ? `Sì, status=${foundActive.status}` : 'No');

  // 6. Test PUT Cancel vs DELETE
  console.log(`\n📌 [STEP 6] Test Modifica Status a CANCELLED (PUT)...`);
  const putCancelRes = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/${STRUCTURE_ID}/${newReservationId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status: 'CANCELLED' })
  });
  console.log('   PUT Cancel Status:', putCancelRes.status);
  const putCancelJson = await putCancelRes.json();
  console.log('   PUT Cancel Body:', JSON.stringify(putCancelJson, null, 2));

  // 7. Check how it appears in GET list after PUT CANCELLED
  console.log('\n📌 [STEP 7] Verifica Lista DOPO PUT status=CANCELLED:');
  const stayQueryRes = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/${STRUCTURE_ID}?type=STAY&startDate=2027-10-01&endDate=2027-10-31&size=50&page=1`, { headers });
  const stayJson = await stayQueryRes.json();
  const stayItems = Array.isArray(stayJson) ? stayJson : (stayJson.data || stayJson.reservations || []);
  const inStay = stayItems.find(it => it.id === newReservationId);
  console.log('   A) Presente in type=STAY query?:', inStay ? `Sì, status=${inStay.status}` : 'No (esclusa automaticamente da Octorate)');

  const allQueryRes = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/${STRUCTURE_ID}?startDate=2027-10-01&endDate=2027-10-31&size=50&page=1`, { headers });
  const allJson = await allQueryRes.json();
  const allItems = Array.isArray(allJson) ? allJson : (allJson.data || allJson.reservations || []);
  const inAll = allItems.find(it => it.id === newReservationId);
  console.log('   B) Presente in query generica?:', inAll ? `Sì, status=${inAll.status}` : 'No');

  // 8. Test DELETE
  console.log(`\n📌 [STEP 8] Esecuzione DELETE su ID ${newReservationId}...`);
  const delRes = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/${STRUCTURE_ID}/${newReservationId}`, {
    method: 'DELETE',
    headers
  });
  console.log('   DELETE Status:', delRes.status);

  console.log('\n========================================================================');
  console.log('                          DIAGNOSI COMPLETATA                           ');
  console.log('========================================================================\n');
}

run().catch(console.error);
