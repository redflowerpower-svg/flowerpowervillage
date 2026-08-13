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

async function verifyStoredValues() {
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

  // We test writing to Room 529784 (Jungle Villa BE - Real Room Rate) or Room 932243 (BE) or 932244 (7d)
  // Let's test sending both closeToArrival: true AND closedArrival: true AND closedToArrival: true
  const roomId = 932246; // FB1 Main bnb-7d

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('  🔬 TEST INVERSIONE E SPECIFICA CAMPI RESTRIZIONE NATIVI');
  console.log('════════════════════════════════════════════════════════════════\n');

  const testPayload = [{
    room: roomId,
    dateFrom: '2026-12-16',
    dateTo: '2026-12-25',
    values: {
      stopSells: false,
      closed: false,
      closeToArrival: true,
      closedArrival: true,
      closedToArrival: true,
      closeToDeparture: false,
      closedDeparture: false,
      closedToDeparture: false
    }
  }];

  const res = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
    method: 'POST',
    headers,
    body: JSON.stringify(testPayload)
  });

  const txt = await res.text();
  console.log(`POST /calendar/bulk response: HTTP ${res.status} -> ${txt}`);

  // Fetch GET detail for this structure / room
  const getRes = await fetch(`https://api.octorate.com/connect/rest/v1/calendar/366879?dateFrom=2026-12-16&dateTo=2026-12-25`, {
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' }
  });

  const getJson = await getRes.json();
  const items = getJson.data || [];
  console.log(`GET returns ${items.length} items in page 1.`);
  const matching = items.find(i => Number(i.id) === roomId);
  if (matching) {
    console.log(`Found item ${roomId} (${matching.name}):`);
    console.log(JSON.stringify(matching.days ? matching.days.slice(0, 3) : matching, null, 2));
  } else {
    console.log(`Item ${roomId} not in page 1. Checking all items for any CTA field...`);
    const ctaItems = items.filter(i => (i.days || []).some(d => d.closeToArrival || d.closedArrival || d.closedToArrival));
    console.log(`Found ${ctaItems.length} items with CTA set to true in page 1:`);
    ctaItems.forEach(ci => console.log(`  ID: ${ci.id} | Name: "${ci.name}"`));
  }
}

verifyStoredValues().catch(err => console.error(err));
