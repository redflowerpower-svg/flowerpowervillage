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

  const todayISO = '2026-08-18';
  const endISO = '2027-10-31';

  const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=${todayISO}&endDate=${endISO}&size=200&page=0`;
  const octRes = await fetch(octUrl, { headers });
  const octJson = await octRes.json();
  const pageData = octJson.data || [];

  console.log(`Fetched ${pageData.length} bookings from Octorate.`);
  
  // Test calculateServerDynamicMinStay
  const { handleOctorateWebhook } = await import('../api/_handlers/octorate-webhook.ts');
  
  // Let's import calculateServerDynamicMinStay logic or test it
  console.log('Sample booking room names:');
  const roomNames = [...new Set(pageData.map((b: any) => b.roomName))];
  console.log(roomNames);
}

run().catch(console.error);
