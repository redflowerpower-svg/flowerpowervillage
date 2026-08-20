import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) {
      const val = v.join('=').trim().replace(/^["']|["']$/g, '');
      envVars[k.trim()] = val;
      process.env[k.trim()] = val;
    }
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

  console.log('Testing bulk minstay write targeting Mother IDs:');
  const motherPayload = [
    { room: 649669, dateFrom: '2027-10-19', dateTo: '2027-10-25', values: { minstay: 1 } },
    { room: 921799, dateFrom: '2027-10-19', dateTo: '2027-10-25', values: { minstay: 1 } }
  ];

  const res = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
    method: 'POST',
    headers,
    body: JSON.stringify(motherPayload)
  });

  console.log('Mother ID write status:', res.status);
  console.log(await res.json());

  // Check calendar for both rooms
  const calRes = await fetch('https://api.octorate.com/connect/rest/v1/calendar/366879?dateFrom=2027-10-18&dateTo=2027-10-28&size=50&page=1', { headers });
  const calJson = await calRes.json();
  const list = calJson.data || calJson || [];
  const fb1 = list.find((r: any) => r.id === 649669);
  const fb2 = list.find((r: any) => r.id === 921799);
  console.log('FB1 19 Oct minStay:', fb1?.days?.find((d: any) => d.date === '2027-10-19')?.minStay);
  console.log('FB2 19 Oct minStay:', fb2?.days?.find((d: any) => d.date === '2027-10-19')?.minStay);

  // Restore baseline (minstay = 2)
  const resetPayload = [
    { room: 649669, dateFrom: '2027-10-19', dateTo: '2027-10-25', values: { minstay: 2 } },
    { room: 921799, dateFrom: '2027-10-19', dateTo: '2027-10-25', values: { minstay: 2 } }
  ];
  await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', { method: 'POST', headers, body: JSON.stringify(resetPayload) });
  console.log('Baseline 2 restored.');
}

run().catch(console.error);
