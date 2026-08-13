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

async function testMotherVsDerived() {
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

  const motherId = 932243; // FB1 BE (Mother Rate)
  const fb1_7d_Id = 932244; // FB1 7d (Unlinked derived rate)
  const fb1_mb7_Id = 932246; // FB1 Main bnb-7d (Inherited derived rate)

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('  🔬 VERIFICA EREDITARIETÀ RESTRIZIONI MADRE VS DERIVATE');
  console.log('════════════════════════════════════════════════════════════════\n');

  // Test 1: Write CTA to Mother Rate ID (932243)
  const p1 = [{
    room: motherId,
    dateFrom: '2026-12-20',
    dateTo: '2026-12-25',
    values: { stopSells: false, closed: false, closeToArrival: true, closedArrival: true }
  }];
  const r1 = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', { method: 'POST', headers, body: JSON.stringify(p1) });
  console.log(`Test 1 (Scrittura CTA su TARIFFA MADRE ${motherId}): HTTP ${r1.status} -> ${await r1.text()}`);

  // Test 2: Write CTA to FB1 7d (932244)
  const p2 = [{
    room: fb1_7d_Id,
    dateFrom: '2026-12-20',
    dateTo: '2026-12-25',
    values: { stopSells: false, closed: false, closeToArrival: true, closedArrival: true }
  }];
  const r2 = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', { method: 'POST', headers, body: JSON.stringify(p2) });
  console.log(`Test 2 (Scrittura CTA su FB1 7d ${fb1_7d_Id}): HTTP ${r2.status} -> ${await r2.text()}`);

  // Test 3: Write CTA to FB1 Main bnb-7d (932246)
  const p3 = [{
    room: fb1_mb7_Id,
    dateFrom: '2026-12-20',
    dateTo: '2026-12-25',
    values: { stopSells: false, closed: false, closeToArrival: true, closedArrival: true }
  }];
  const r3 = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', { method: 'POST', headers, body: JSON.stringify(p3) });
  console.log(`Test 3 (Scrittura CTA su FB1 Main bnb-7d ${fb1_mb7_Id}): HTTP ${r3.status} -> ${await r3.text()}`);
}

testMotherVsDerived().catch(err => console.error(err));
