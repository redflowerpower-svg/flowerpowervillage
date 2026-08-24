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

async function getAllOctoberPlans() {
  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  const structureId = envVars.VITE_OCTORATE_STRUCTURE_ID || '366879';
  const headers = {
    'Authorization': `Bearer ${tokenData.access_token}`,
    'Accept': 'application/json'
  };

  const allItems = [];
  let page = 1;
  let totalPages = 1;

  do {
    const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=2026-10-01&dateTo=2026-10-01&page=${page}&size=50`;
    const res = await fetch(url, { headers });
    if (!res.ok) break;
    const json = await res.json();
    totalPages = json.page?.totalPages || 1;
    const items = json.data || (Array.isArray(json) ? json : []);
    if (!items || items.length === 0) break;
    allItems.push(...items);
    page++;
  } while (page <= totalPages);

  console.log(`Fetched total ${allItems.length} room-rate objects for 2026-10-01`);

  const formatted = allItems.map(item => {
    const day = item.days?.[0] || {};
    return {
      id: item.id,
      name: item.name,
      price: day.price,
      minStay: day.minStay,
      maxStay: day.maxStay,
      stopSells: day.stopSells,
      closeToArrival: day.closeToArrival,
      closeToDeparture: day.closeToDeparture,
      availability: day.availability
    };
  });

  fs.writeFileSync('scratch/october1-full-rates.json', JSON.stringify(formatted, null, 2));
  console.log('Saved to scratch/october1-full-rates.json');
}

getAllOctoberPlans().catch(console.error);
