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
  const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' };

  console.log('--- TEST SENDING MINSTAY 2 TO ROOM 649669 ---');
  const payload = [
    {
      room: 649669,
      dateFrom: '2027-10-19',
      dateTo: '2027-10-27',
      values: {
        minstay: 2
      }
    }
  ];

  console.log('Sending payload:', JSON.stringify(payload, null, 2));
  const res = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  console.log('Response status:', res.status);
  const text = await res.text();
  console.log('Response body:', text);

  // Read calendar back
  const calRes = await fetch('https://api.octorate.com/connect/rest/v1/calendar/366879?dateFrom=2027-10-18&dateTo=2027-10-28&size=50&page=1', { headers });
  const calJson = await calRes.json();
  const fb1 = (calJson.data || calJson || []).find(r => r.id === 649669);
  console.log('Calendar days after write:');
  fb1?.days?.forEach(d => console.log(`  ${d.date}: minStay = ${d.minStay}`));
}

run().catch(console.error);
