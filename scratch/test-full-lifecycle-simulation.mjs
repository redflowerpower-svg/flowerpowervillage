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

async function getAccessToken() {
  const { data } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').maybeSingle();
  return data?.access_token;
}

async function getCalendarStatus(accessToken, dateFrom, dateTo) {
  const url = `https://api.octorate.com/connect/rest/v1/calendar/366879?dateFrom=${dateFrom}&dateTo=${dateTo}&size=50&page=1`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } });
  const json = await res.json();
  const items = json.data || json || [];
  const p = items.find(it => (it.name || '').includes('FB1') || (it.name || '').includes('Fake Bungalow  1') || (it.name || '').includes('Fake Bungalow 1') || it.id === 649669);
  const d19 = p?.days?.find(d => d.date === '2027-10-19');
  const d27 = p?.days?.find(d => d.date === '2027-10-27');
  return { d19: d19?.minStay, d27: d27?.minStay };
}

async function runAutonomousLifecycleTest() {
  console.log('========================================================================');
  console.log('  🧪 TEST AUTONOMO SU FAKE BUNGALOW 1 (OTTOBRE 2027)');
  console.log('  Ciclo Completo: Creazione (1 notte) -> Cancellazione -> Ripristino (2 notti)');
  console.log('========================================================================\n');

  const token = await getAccessToken();

  // STEP 0: Reset Iniziale
  console.log('📌 [FASE 0] Allineamento Iniziale...');
  await fetch('https://flowerpowervillage.vercel.app/api/webhooks/octorate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'MANUAL_SYNC_CHECK' })
  });
  await new Promise(r => setTimeout(r, 3500));
  const initial = await getCalendarStatus(token, '2027-10-18', '2027-10-28');
  console.log(`   👉 Stato Iniziale Calendario Octorate: 19 Ottobre = ${initial.d19} notti | 27 Ottobre = ${initial.d27} notti\n`);

  // STEP 1: Creazione Prenotazione Test (20 - 27 Ottobre 2027 su Fake Bungalow 1)
  console.log('📌 [FASE 1] Creazione Prenotazione Test (20 -> 27 Ottobre 2027, Room #649669)...');
  const createUrl = 'https://api.octorate.com/connect/rest/v1/reservation/366879';
  const bookingPayload = {
    channelId: 288,
    status: 'CONFIRMED',
    product: 649669,
    checkin: '2027-10-20T02:00:00Z[UTC]',
    checkout: '2027-10-27T05:00:00Z[UTC]',
    totalGuest: 2,
    guests: [
      {
        type: 'BOOKER',
        givenName: 'AutonomousRobot',
        familyName: 'TestRunner',
        language: 'EN',
        source: 'USER'
      }
    ]
  };

  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(bookingPayload)
  });

  const createdJson = await createRes.json();
  const reservationId = createdJson.id;
  console.log(`   ✅ Prenotazione creata su Octorate PMS! ID: ${reservationId}`);

  // Attesa commit DB Octorate
  await new Promise(r => setTimeout(r, 2500));

  // Esecuzione Webhook Creazione
  console.log('   📡 Trigger Webhook (RESERVATION_CREATED)...');
  const whRes1 = await fetch('https://flowerpowervillage.vercel.app/api/webhooks/octorate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'RESERVATION_CREATED', id: reservationId })
  });
  const whJson1 = await whRes1.json();
  console.log(`   ✅ Webhook elaborato (${whJson1.calculatedUpdatesCount} aggiornamenti sincronizzati).`);

  // Attesa elaborazione coda bulk Octorate (3.5s)
  await new Promise(r => setTimeout(r, 3500));

  // Verifica Octorate (deve essere 1 e 1)
  const afterCreate = await getCalendarStatus(token, '2027-10-18', '2027-10-28');
  console.log(`   👉 STATO CALENDARIO OCTORATE DOPO CREAZIONE:`);
  console.log(`      • 19 Ottobre 2027 = ${afterCreate.d19} notte (Gap prima della prenotazione)`);
  console.log(`      • 27 Ottobre 2027 = ${afterCreate.d27} notte (Gap dopo la prenotazione)\n`);

  // STEP 2: Cancellazione Prenotazione Test
  console.log(`📌 [FASE 2] Cancellazione Prenotazione Test su Octorate (ID: ${reservationId})...`);
  const deleteUrl = `https://api.octorate.com/connect/rest/v1/reservation/366879/${reservationId}`;
  const deleteRes = await fetch(deleteUrl, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
  });
  console.log(`   ✅ Cancellazione eseguita su Octorate PMS (HTTP ${deleteRes.status}).`);

  // Attesa commit DB Octorate
  await new Promise(r => setTimeout(r, 2500));

  // Esecuzione Webhook Cancellazione
  console.log('   📡 Trigger Webhook (RESERVATION_CANCELLED)...');
  const whRes2 = await fetch('https://flowerpowervillage.vercel.app/api/webhooks/octorate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'RESERVATION_CANCELLED', id: reservationId })
  });
  const whJson2 = await whRes2.json();
  console.log(`   ✅ Webhook elaborato (${whJson2.calculatedUpdatesCount} aggiornamenti sincronizzati).`);

  // Attesa elaborazione coda bulk Octorate (3.5s)
  await new Promise(r => setTimeout(r, 3500));

  // Verifica finale su Octorate (deve essere 2 e 2)
  const afterDelete = await getCalendarStatus(token, '2027-10-18', '2027-10-28');
  console.log(`   👉 STATO CALENDARIO OCTORATE DOPO CANCELLAZIONE:`);
  console.log(`      • 19 Ottobre 2027 = ${afterDelete.d19} notti (Ripristinato al baseline)`);
  console.log(`      • 27 Ottobre 2027 = ${afterDelete.d27} notti (Ripristinato al baseline)\n`);

  console.log('========================================================================');
  if (afterCreate.d19 === 1 && afterCreate.d27 === 1 && afterDelete.d19 === 2 && afterDelete.d27 === 2) {
    console.log('  🎉 RISULTATO: TEST SUPERATO AL 100% IN TEMPO REALE SUI SERVER OCTORATE!');
    console.log('  1. Creazione -> 19 e 27 Ottobre passati a 1 notte');
    console.log('  2. Cancellazione -> 19 e 27 Ottobre tornati a 2 notti');
  } else {
    console.log(`  ⚠️ RISULTATO: ANOMALIA (Create: 19=${afterCreate.d19}, 27=${afterCreate.d27} | Delete: 19=${afterDelete.d19}, 27=${afterDelete.d27})`);
  }
  console.log('========================================================================');
}

runAutonomousLifecycleTest();
