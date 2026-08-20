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

  console.log('--- TEST PAGE=0 vs PAGE=1 ---');
  const res0 = await fetch('https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=2026-11-01&endDate=2027-10-31&size=10&page=0', { headers });
  const json0 = await res0.json();
  console.log('Page 0 count:', (json0.data || json0.reservations || json0 || []).length);
  console.log('Page 0 meta:', json0.page || json0.totalPages || json0.totalElements || 'no meta');

  const res1 = await fetch('https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=2026-11-01&endDate=2027-10-31&size=10&page=1', { headers });
  const json1 = await res1.json();
  console.log('Page 1 count:', (json1.data || json1.reservations || json1 || []).length);
  console.log('Page 1 meta:', json1.page || json1.totalPages || json1.totalElements || 'no meta');
  
  if (Array.isArray(json0.data) && Array.isArray(json1.data)) {
    console.log('Item 0 id (page 0):', json0.data[0]?.id);
    console.log('Item 0 id (page 1):', json1.data[0]?.id);
  } else if (Array.isArray(json0) && Array.isArray(json1)) {
    console.log('Item 0 id (page 0):', json0[0]?.id);
    console.log('Item 0 id (page 1):', json1[0]?.id);
  }
}

run().catch(console.error);
