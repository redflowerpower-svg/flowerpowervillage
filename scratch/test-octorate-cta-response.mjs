import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env');
const envVars = {};
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...rest] = trimmed.split('=');
    if (key) envVars[key.trim()] = rest.join('=').trim();
  }
}

const supabase = createClient(
  envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY
);

async function probeOctorateCta() {
  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  const accessToken = tokenData?.access_token;
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const roomId = 932246; // FB1 Main bnb-7d

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('  🧪 TEST PROBE INVIO RESTRIZIONI CTA A OCTORATE (932246)');
  console.log('════════════════════════════════════════════════════════════════\n');

  // STEP 1: Send Open Block (01/10/2026 -> 15/12/2026)
  const openPayload = [{
    room: roomId,
    dateFrom: '2026-10-01',
    dateTo: '2026-12-15',
    values: { stopSells: false, closed: false, closedArrival: false, closedDeparture: false }
  }];
  const res1 = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
    method: 'POST', headers, body: JSON.stringify(openPayload)
  });
  console.log(`STEP 1 (Open 01/10 -> 15/12): HTTP ${res1.status} -> ${await res1.text()}`);

  // STEP 2: Send CTA Cushion (16/12/2026 -> 25/12/2026)
  const ctaPayload = [{
    room: roomId,
    dateFrom: '2026-12-16',
    dateTo: '2026-12-25',
    values: { stopSells: false, closed: false, closedArrival: true, closedDeparture: false }
  }];
  const res2 = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
    method: 'POST', headers, body: JSON.stringify(ctaPayload)
  });
  console.log(`STEP 2 (CTA 16/12 -> 25/12): HTTP ${res2.status} -> ${await res2.text()}`);

  // STEP 3: Fetch room calendar for 932246 to see what Octorate actually saved for 16/12 -> 25/12
  const getUrl = `https://api.octorate.com/connect/rest/v1/calendar/366879?dateFrom=2026-12-15&dateTo=2026-12-27`;
  const getRes = await fetch(getUrl, { headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' } });
  const getJson = await getRes.json();
  const items = getJson.data || [];
  const foundItem = items.find(i => String(i.id) === String(roomId));

  console.log('\n📌 Risultato letto da GET Octorate per ID 932246:');
  if (foundItem && foundItem.days) {
    foundItem.days.forEach(day => {
      console.log(`   📅 Date: ${day.date} | price: ${day.price} | stopSell: ${day.stopSell} | closeToArrival: ${day.closeToArrival} | closed: ${day.closed} | bookable: ${day.bookable}`);
    });
  } else {
    console.log('   ⚠️ Item 932246 non trovato nei primi 50 risultati del GET.');
  }
}

probeOctorateCta().catch(err => console.error(err));
