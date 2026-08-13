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

async function testParams() {
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

  const paramsToTest = ['roomId', 'rateId', 'roomRateId', 'id', 'product', 'productId', 'room_id'];
  for (const p of paramsToTest) {
    const url = `https://api.octorate.com/connect/rest/v1/calendar?${p}=932243&dateFrom=2026-11-01&dateTo=2026-11-02`;
    const res = await fetch(url, { headers });
    const text = await res.text();
    console.log(`Param ${p}: status=${res.status} body=${text.slice(0, 120)}`);
  }
}

testParams().catch(err => console.error(err));
