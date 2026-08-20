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

  const res = await fetch('https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=2026-11-01&endDate=2027-10-31&size=200&page=0', { headers });
  const json = await res.json();
  const all = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
  const fb1Bookings = all.filter(b => b.product === 649669 || String(b.roomName || '').includes('Fake Bungalow  1') || String(b.roomName || '').includes('Fake Bungalow 1'));

  console.log(`Found ${fb1Bookings.length} bookings for FB1:`);
  fb1Bookings.forEach(b => {
    console.log(`ID: ${b.id} | Status: ${b.status} | Checkin: ${b.checkin} | Checkout: ${b.checkout} | Name: ${b.roomName}`);
  });
}

run().catch(console.error);
