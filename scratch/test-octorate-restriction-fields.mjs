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

async function testFieldNames() {
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
  console.log('  🔬 TEST SPERIMENTALE CAMPI RESTRIZIONE OCTORATE API');
  console.log('════════════════════════════════════════════════════════════════\n');

  // Test Payload Variations for CTA / Close to Arrival / Closed Departure
  const variations = [
    { name: 'Variation 1: closeToArrival / closeToDeparture', values: { stopSells: false, closed: false, closeToArrival: true, closeToDeparture: false } },
    { name: 'Variation 2: closedArrival / closedDeparture', values: { stopSells: false, closed: false, closedArrival: true, closedDeparture: false } },
    { name: 'Variation 3: cta / ctd', values: { stopSells: false, closed: false, cta: true, ctd: false } },
    { name: 'Variation 4: closedToArrival / closedToDeparture', values: { stopSells: false, closed: false, closedToArrival: true, closedToDeparture: false } },
    { name: 'Variation 5: close_to_arrival / close_to_departure', values: { stop_sell: false, closed: false, close_to_arrival: true, close_to_departure: false } }
  ];

  for (const v of variations) {
    const payload = [{
      room: roomId,
      dateFrom: '2026-12-16',
      dateTo: '2026-12-25',
      values: v.values
    }];

    const res = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    console.log(`📌 ${v.name}`);
    console.log(`   Payload: ${JSON.stringify(v.values)}`);
    console.log(`   HTTP ${res.status} -> ${await res.text()}\n`);
  }
}

testFieldNames().catch(err => console.error(err));
