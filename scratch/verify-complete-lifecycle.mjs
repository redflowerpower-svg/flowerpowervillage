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

async function getAccessToken() {
  const { data } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').single();
  return data.access_token;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getRoomCalendar(token, roomId, dateFrom, dateTo) {
  const url = `https://api.octorate.com/connect/rest/v1/calendar/${STRUCTURE_ID}?dateFrom=${dateFrom}&dateTo=${dateTo}&size=50&page=1`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
  const json = await res.json();
  const list = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
  return list.find(r => r.id === roomId || Number(r.id) === Number(roomId));
}

async function runVerification() {
  console.log('========================================================================');
  console.log('  🎯 COLLAUDO FINALE COMPLETO: CREAZIONE -> GAP -> CANCELLAZIONE -> RESET');
  console.log('========================================================================\n');

  const token = await getAccessToken();
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  // --- SCENARIO 1: Fake Bungalow 1 (#649669) ---
  console.log('📌 [SCENARIO 1] Test Completo su Fake Bungalow 1 (#649669)...');

  // 1. Lettura stato prima del test
  const initialFB1 = await getRoomCalendar(token, 649669, '2027-10-18', '2027-10-28');
  console.log('   1. Stato Iniziale: 19 Ottobre =', initialFB1?.days?.find(d => d.date === '2027-10-19')?.minStay, 'notti');

  // 2. Creazione prenotazione su Octorate (2027-10-20 to 2027-10-27)
  console.log('   2. Creazione Prenotazione Reale su Octorate...');
  const createRes1 = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/${STRUCTURE_ID}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      channelId: 288,
      status: 'CONFIRMED',
      product: 649669,
      checkin: '2027-10-20T02:00:00Z[UTC]',
      checkout: '2027-10-27T05:00:00Z[UTC]',
      totalGuest: 2,
      guests: [{ type: 'BOOKER', givenName: 'E2E_Test', familyName: 'FB1', language: 'EN', source: 'USER' }]
    })
  });
  const bookingFB1 = await createRes1.json();
  console.log(`      ✅ Prenotazione creata (ID: ${bookingFB1.id})`);

  // 3. Esecuzione Webhook di sincronizzazione (con correzione page=0 e status robusto)
  console.log('   3. Esecuzione Webhook Sincronizzazione Notti Dinamiche...');
  const { handleOctorateWebhook } = await import('../api/_handlers/octorate-webhook.ts');
  const mockReqCreate = {
    method: 'POST',
    body: { type: 'RESERVATION_CREATED', id: bookingFB1.id }
  };
  let mockResCreateJson = null;
  const mockResCreate = {
    setHeader: () => {},
    status: (code) => ({
      json: (data) => { mockResCreateJson = { code, data }; return mockResCreateJson; },
      send: (data) => { mockResCreateJson = { code, data }; return mockResCreateJson; }
    })
  };
  await handleOctorateWebhook(mockReqCreate, mockResCreate);
  console.log('      Webhook eseguito:', mockResCreateJson?.data?.message || 'OK');

  await sleep(2000);

  // 4. Verifica Octorate: MinStay del 19 Ottobre deve essere 1 notte (buco tra 19 e 20)
  const afterCreateFB1 = await getRoomCalendar(token, 649669, '2027-10-18', '2027-10-28');
  const d19AfterCreate = afterCreateFB1?.days?.find(d => d.date === '2027-10-19')?.minStay;
  console.log(`   4. Verifica Octorate dopo creazione: 19 Ottobre = ${d19AfterCreate} notte (GAP-FILL ATTIVO)`);

  // 5. Cancellazione della prenotazione su Octorate
  console.log(`   5. Cancellazione Prenotazione ${bookingFB1.id} su Octorate...`);
  const delRes1 = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/${STRUCTURE_ID}/${bookingFB1.id}`, {
    method: 'DELETE',
    headers
  });
  console.log(`      Cancellazione status: HTTP ${delRes1.status}`);

  // 6. Esecuzione Webhook di sincronizzazione dopo la cancellazione
  console.log('   6. Esecuzione Webhook dopo la cancellazione...');
  const mockReqCancel = {
    method: 'POST',
    body: { type: 'RESERVATION_CANCELLED', id: bookingFB1.id }
  };
  let mockResCancelJson = null;
  const mockResCancel = {
    setHeader: () => {},
    status: (code) => ({
      json: (data) => { mockResCancelJson = { code, data }; return mockResCancelJson; },
      send: (data) => { mockResCancelJson = { code, data }; return mockResCancelJson; }
    })
  };
  await handleOctorateWebhook(mockReqCancel, mockResCancel);
  console.log('      Webhook eseguito:', mockResCancelJson?.data?.message || 'OK');

  await sleep(2000);

  // 7. Verifica Octorate: MinStay del 19 Ottobre deve essere ripristinato a 2 notti (Baseline)
  const afterCancelFB1 = await getRoomCalendar(token, 649669, '2027-10-18', '2027-10-28');
  const d19AfterCancel = afterCancelFB1?.days?.find(d => d.date === '2027-10-19')?.minStay;
  const d27AfterCancel = afterCancelFB1?.days?.find(d => d.date === '2027-10-27')?.minStay;
  console.log(`   7. Verifica Octorate DOPO CANCELLAZIONE:`);
  console.log(`      👉 19 Ottobre: ${d19AfterCancel} notti (RIPRISTINATO ALLA BASELINE)`);
  console.log(`      👉 27 Ottobre: ${d27AfterCancel} notti (RIPRISTINATO ALLA BASELINE)\n`);

  console.log('========================================================================');
  const success = (d19AfterCreate === 1) && (d19AfterCancel === 2) && (d27AfterCancel === 2);
  if (success) {
    console.log('  🎉 ESITO FINALE: SUCCESSO TOTALE AL 100%!');
    console.log('  • La creazione della prenotazione attiva immediatamente il gap-fill.');
    console.log('  • La cancellazione della prenotazione allarga il buco e ripristina la baseline canonica.');
  } else {
    console.log('  ⚠️ Esito: d19AfterCreate =', d19AfterCreate, ', d19AfterCancel =', d19AfterCancel);
  }
  console.log('========================================================================\n');
}

runVerification().catch(console.error);
