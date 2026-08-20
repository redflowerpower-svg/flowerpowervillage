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

  console.log('--- TESTING FULL RESERVATION FETCH FROM PAGE 0 TO END ---');
  let page = 0;
  let allBookings = [];
  const todayISO = new Date().toISOString().substring(0, 10);
  const endISO = `2027-10-31`;

  while (page < 10) {
    const url = `https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=${todayISO}&endDate=${endISO}&size=200&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.log(`Page ${page} failed: ${res.status}`);
      break;
    }
    const json = await res.json();
    const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : (json.reservations || []));
    if (items.length === 0) break;
    allBookings.push(...items);
    console.log(`Page ${page}: fetched ${items.length} bookings. Total so far: ${allBookings.length}`);
    if (items.length < 200) break;
    page++;
  }

  console.log(`Total live bookings fetched: ${allBookings.length}`);
  const confirmed = allBookings.filter(b => String(b.status).toUpperCase() !== 'CANCELLED' && String(b.status).toUpperCase() !== 'CANCELED');
  const cancelled = allBookings.filter(b => String(b.status).toUpperCase() === 'CANCELLED' || String(b.status).toUpperCase() === 'CANCELED');
  console.log(`Confirmed: ${confirmed.length}, Cancelled: ${cancelled.length}`);
}

run().catch(console.error);
