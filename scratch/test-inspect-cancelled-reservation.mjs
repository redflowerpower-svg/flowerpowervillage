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

async function run() {
  const { data } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').single();
  const token = data.access_token;
  const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

  const res = await fetch('https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=2026-11-01&endDate=2027-10-31&size=20&page=0', { headers });
  const json = await res.json();
  const r = (json.data || []).find(it => it.id === 125557396 || String(it.id) === '125557396');
  console.log('Reservation 125557396 status in STAY query:');
  console.log('Found:', Boolean(r));
  if (r) {
    console.log('r.status:', r.status);
    console.log('r.checkin:', r.checkin, 'r.checkout:', r.checkout);
    console.log('r.product:', r.product, 'r.roomName:', r.roomName);
    console.log('Full object keys:', Object.keys(r));
    console.log('Full object:', JSON.stringify(r, null, 2));
  }
}

run().catch(console.error);
