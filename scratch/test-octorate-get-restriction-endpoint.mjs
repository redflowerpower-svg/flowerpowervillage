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

async function testEndpoints() {
  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  const accessToken = tokenData?.access_token;
  const structureId = envVars.VITE_OCTORATE_STRUCTURE_ID || '366879';
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json'
  };

  const endpointsToTest = [
    `https://api.octorate.com/connect/rest/v1/calendar?room=932244&dateFrom=2026-11-01&dateTo=2026-11-05`,
    `https://api.octorate.com/connect/rest/v1/calendar?roomRate=932244&dateFrom=2026-11-01&dateTo=2026-11-05`,
    `https://api.octorate.com/connect/rest/v1/calendar?rate=932244&dateFrom=2026-11-01&dateTo=2026-11-05`,
    `https://api.octorate.com/connect/rest/v1/calendar/detail?room=932244&dateFrom=2026-11-01&dateTo=2026-11-05`,
    `https://api.octorate.com/connect/rest/v1/calendar/${structureId}/room/932244?dateFrom=2026-11-01&dateTo=2026-11-05`,
    `https://api.octorate.com/connect/rest/v1/calendar/${structureId}/rate/932244?dateFrom=2026-11-01&dateTo=2026-11-05`,
    `https://api.octorate.com/connect/rest/v1/rooms/932244`,
    `https://api.octorate.com/connect/rest/v1/rooms/649669`
  ];

  for (const url of endpointsToTest) {
    const res = await fetch(url, { headers });
    const txt = await res.text();
    console.log(`URL: ${url}`);
    console.log(`Status: ${res.status} | Length: ${txt.length} | Preview: ${txt.slice(0, 150)}\n`);
  }
}

testEndpoints().catch(err => console.error(err));
