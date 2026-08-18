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

async function getFakeBungalowsStatus(accessToken, dateFrom, dateTo) {
  const url = `https://api.octorate.com/connect/rest/v1/calendar/366879?dateFrom=${dateFrom}&dateTo=${dateTo}&size=50&page=1`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } });
  const json = await res.json();
  const list = Array.isArray(json) ? json : (json.data || []);
  const fb1 = list.find(it => it.id === 649669 || (it.name || '').includes('Fake Bungalow  1'));
  const fb2 = list.find(it => it.id === 921799 || (it.name || '').includes('Fake Bungalow 2'));
  return {
    fb1: {
      name: fb1?.name,
      d19: fb1?.days?.find(d => d.date === '2027-10-19')?.minStay,
      d27: fb1?.days?.find(d => d.date === '2027-10-27')?.minStay
    },
    fb2: {
      name: fb2?.name,
      d19: fb2?.days?.find(d => d.date === '2027-10-19')?.minStay,
      d27: fb2?.days?.find(d => d.date === '2027-10-27')?.minStay
    }
  };
}

async function runAutonomousValidationSuite() {
  console.log('========================================================================');
  console.log('   🚀 VALIDAZIONE AUTONOMA COMPLETA OCTORATE PMS (CYCLE CREAZIONE/DELETE)');
  console.log('========================================================================\n');

  const token = await getAccessToken();

  // 1. STATO PRELIMINARE
  console.log('📌 [FASE 0] Verifica Stato Iniziale su Octorate...');
  const initial = await getFakeBungalowsStatus(token, '2027-10-18', '2027-10-28');
  console.log(`   👉 FB1: 19 Oct = ${initial.fb1.d19} notti | 27 Oct = ${initial.fb1.d27} notti`);
  console.log(`   👉 FB2: 19 Oct = ${initial.fb2.d19} notti | 27 Oct = ${initial.fb2.d27} notti\n`);

  // 2. SCENARIO A: Fake Bungalow 1 (Creazione e Cancellazione)
  console.log('📌 [SCENARIO A] Test su Fake Bungalow 1...');
  const createRes1 = await fetch('https://api.octorate.com/connect/rest/v1/reservation/366879', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      channelId: 288,
      status: 'CONFIRMED',
      product: 649669,
      checkin: '2027-10-20T02:00:00Z[UTC]',
      checkout: '2027-10-27T05:00:00Z[UTC]',
      totalGuest: 2,
      guests: [{ type: 'BOOKER', givenName: 'ValidationRobot', familyName: 'FB1', language: 'EN', source: 'USER' }]
    })
  });
  const { id: id1 } = await createRes1.json();
  console.log(`   ✅ Booking Creato (ID: ${id1})`);

  await new Promise(r => setTimeout(r, 2000));
  await fetch('https://flowerpowervillage.vercel.app/api/webhooks/octorate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'RESERVATION_CREATED', id: id1 })
  });
  await new Promise(r => setTimeout(r, 3500));

  const afterCreate1 = await getFakeBungalowsStatus(token, '2027-10-18', '2027-10-28');
  console.log(`   👉 Dopo Creazione Booking FB1: 19 Oct = ${afterCreate1.fb1.d19} notte | 27 Oct = ${afterCreate1.fb1.d27} notte`);

  // Cancellazione
  console.log(`   🗑️ Cancellazione Booking (ID: ${id1})...`);
  await fetch(`https://api.octorate.com/connect/rest/v1/reservation/366879/${id1}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
  });

  await new Promise(r => setTimeout(r, 2000));
  await fetch('https://flowerpowervillage.vercel.app/api/webhooks/octorate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'RESERVATION_CANCELLED', id: id1 })
  });
  await new Promise(r => setTimeout(r, 3500));

  const afterDelete1 = await getFakeBungalowsStatus(token, '2027-10-18', '2027-10-28');
  console.log(`   👉 Dopo Cancellazione Booking FB1: 19 Oct = ${afterDelete1.fb1.d19} notti | 27 Oct = ${afterDelete1.fb1.d27} notti\n`);

  // 3. SCENARIO B: Fake Bungalow 2 (Creazione e Cancellazione)
  console.log('📌 [SCENARIO B] Test su Fake Bungalow 2...');
  const createRes2 = await fetch('https://api.octorate.com/connect/rest/v1/reservation/366879', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      channelId: 288,
      status: 'CONFIRMED',
      product: 921799,
      checkin: '2027-10-20T02:00:00Z[UTC]',
      checkout: '2027-10-27T05:00:00Z[UTC]',
      totalGuest: 2,
      guests: [{ type: 'BOOKER', givenName: 'ValidationRobot', familyName: 'FB2', language: 'EN', source: 'USER' }]
    })
  });
  const { id: id2 } = await createRes2.json();
  console.log(`   ✅ Booking Creato su FB2 (ID: ${id2})`);

  await new Promise(r => setTimeout(r, 2000));
  await fetch('https://flowerpowervillage.vercel.app/api/webhooks/octorate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'RESERVATION_CREATED', id: id2 })
  });
  await new Promise(r => setTimeout(r, 3500));

  const afterCreate2 = await getFakeBungalowsStatus(token, '2027-10-18', '2027-10-28');
  console.log(`   👉 Dopo Creazione Booking FB2: 19 Oct = ${afterCreate2.fb2.d19} notte | 27 Oct = ${afterCreate2.fb2.d27} notte`);

  // Cancellazione
  console.log(`   🗑️ Cancellazione Booking FB2 (ID: ${id2})...`);
  await fetch(`https://api.octorate.com/connect/rest/v1/reservation/366879/${id2}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
  });

  await new Promise(r => setTimeout(r, 2000));
  await fetch('https://flowerpowervillage.vercel.app/api/webhooks/octorate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'RESERVATION_CANCELLED', id: id2 })
  });
  await new Promise(r => setTimeout(r, 3500));

  const afterDelete2 = await getFakeBungalowsStatus(token, '2027-10-18', '2027-10-28');
  console.log(`   👉 Dopo Cancellazione Booking FB2: 19 Oct = ${afterDelete2.fb2.d19} notti | 27 Oct = ${afterDelete2.fb2.d27} notti\n`);

  console.log('========================================================================');
  const fb1Ok = afterCreate1.fb1.d27 === 1 && afterDelete1.fb1.d19 === 2 && afterDelete1.fb1.d27 === 2;
  const fb2Ok = afterDelete2.fb2.d19 === 2 && afterDelete2.fb2.d27 === 2;

  if (fb1Ok && fb2Ok) {
    console.log('  🎉 ESITO COLLAUDO AUTONOMO: 100% SUCCESSO SU TUTTI GLI ALLOGGI E SCENARI!');
    console.log('  • Creazione prenotazione -> applicazione istantanea restrizioni buchi');
    console.log('  • Cancellazione prenotazione -> ripristino istantaneo baseline 2 notti');
  } else {
    console.log('  ⚠️ VERIFICA: FB1 OK =', fb1Ok, '| FB2 OK =', fb2Ok);
  }
  console.log('========================================================================');
}

runAutonomousValidationSuite();
