import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envVars = {};
['.env', '.env.local'].forEach(file => {
  const filePath = path.resolve(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...rest] = trimmed.split('=');
        if (key) envVars[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  }
});

const supabase = createClient(
  envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY
);

async function inspectOctoberSettings() {
  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  if (!tokenData?.access_token) {
    console.error('No Octorate token found in supabase');
    return;
  }

  const structureId = envVars.VITE_OCTORATE_STRUCTURE_ID || '366879';
  const headers = {
    'Authorization': `Bearer ${tokenData.access_token}`,
    'Accept': 'application/json'
  };

  console.log(`Using structureId: ${structureId}`);

  // Fetch all calendar items for 2026-10-01 to 2026-10-02
  const allItems = [];
  for (let page = 1; page <= 10; page++) {
    const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=2026-10-01&dateTo=2026-10-02&page=${page}&size=50`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.error(`Page ${page} failed: ${res.status}`);
      break;
    }
    const json = await res.json();
    const items = json.data || (Array.isArray(json) ? json : []);
    if (!items || items.length === 0) break;
    allItems.push(...items);
  }

  console.log(`Total calendar rate items on 2026-10-01: ${allItems.length}`);
  
  // Group by roomId / ratePlanId
  const summary = allItems.map(item => ({
    id: item.id,
    roomId: item.roomId,
    roomName: item.roomName,
    ratePlanId: item.ratePlanId,
    ratePlanName: item.ratePlanName,
    date: item.date,
    price: item.price,
    minStay: item.minStay,
    closed: item.closed,
    closedArrival: item.closedArrival,
    closedDeparture: item.closedDeparture,
    variation: item.variation
  }));

  fs.writeFileSync('scratch/oct1-calendar-summary.json', JSON.stringify(summary, null, 2));
  console.log('Saved scratch/oct1-calendar-summary.json');
  console.log(summary.slice(0, 10));
}

inspectOctoberSettings().catch(console.error);
