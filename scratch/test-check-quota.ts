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

  console.log('Sending single room bulk minstay update:');
  const res = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
    method: 'POST',
    headers,
    body: JSON.stringify([{ room: 649669, dateFrom: '2027-10-19', dateTo: '2027-10-25', values: { minstay: 2 } }])
  });

  console.log('Status:', res.status);
  console.log(await res.json());
}

run().catch(console.error);
