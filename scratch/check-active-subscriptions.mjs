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

  console.log('--- SUPPORTED SUBSCRIPTION EVENTS ---');
  const resList = await fetch('https://api.octorate.com/connect/rest/v1/subscription/list', { headers });
  console.log('List status:', resList.status);
  console.log(await resList.json());

  console.log('\n--- ACTIVE SUBSCRIPTIONS IN OCTORATE ---');
  const resAct = await fetch('https://api.octorate.com/connect/rest/v1/subscription', { headers });
  console.log('Active status:', resAct.status);
  console.log(await resAct.json());
}

run().catch(console.error);
