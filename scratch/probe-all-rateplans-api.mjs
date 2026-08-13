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

async function probeRateplans() {
  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  const accessToken = tokenData?.access_token;
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json'
  };

  // Try querying bulk write endpoint with a GET or POST probe to get exact error message containing rate plan name
  console.log('\n--- PROBING IDs 932243 to 932270 ---');
  for (let id = 932243; id <= 932270; id++) {
    const payload = [{
      room: id,
      dateFrom: '2027-06-01',
      dateTo: '2027-06-01',
      values: { stopSells: false }
    }];

    const res = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log(`ID ${id}: status=${res.status} body=${text.slice(0, 100)}`);
  }
}

probeRateplans().catch(err => console.error(err));
