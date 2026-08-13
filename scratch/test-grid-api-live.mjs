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

async function testGridApi() {
  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  const accessToken = tokenData?.access_token;
  const clientId = envVars.VITE_OCTORATE_CLIENT_ID || envVars.OCTORATE_CLIENT_ID || '';
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(clientId ? { 'Octorate-Api-Key': clientId } : {})
  };

  const structureId = envVars.VITE_OCTORATE_STRUCTURE_ID || '366879';
  const url = `https://api.octorate.com/connect/rest/v1/calendar?structureId=${structureId}&dateFrom=2026-10-01&dateTo=2027-01-31`;

  console.log('Fetching Octorate calendar from:', url);
  const res = await fetch(url, { headers });
  console.log('HTTP Status:', res.status);
  const text = await res.text();
  console.log('Response length:', text.length);
  let json = null;
  try { json = JSON.parse(text); } catch (e) {}

  if (Array.isArray(json)) {
    console.log(`JSON is array with ${json.length} items.`);
    json.forEach((item, idx) => {
      console.log(`Item [${idx}]: room/id=${item.id || item.room?.id || item.roomId}, name=${item.name || item.room?.name}, daysCount=${Array.isArray(item.days) ? item.days.length : 'none'}`);
      if (Array.isArray(item.days)) {
        const restrictedDays = item.days.filter((d) => d.stopSell || d.stopSells || d.closed || d.closedArrival || d.closedDeparture || d.minStay > 1);
        console.log(`   -> Restricted days: ${restrictedDays.length}`);
        if (restrictedDays.length > 0) {
          console.log(`   Sample restricted day:`, JSON.stringify(restrictedDays[0]));
        }
      }
    });
  } else {
    console.log('Response body preview:', text.slice(0, 500));
  }
}

testGridApi().catch(err => console.error(err));
