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

// ac_14d real products from update-restriction.ts
const ac14Products = [495979, 529781, 916105, 422157, 421527, 495806, 495565, 421998, 331922, 331924, 330970, 331969, 331971, 331967, 331977, 331973];

async function run() {
  const { data: tokenData } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').single();
  const token = tokenData.access_token;
  const structureId = '366879';

  console.log('Verifica stato live su Octorate per tutti i prodotti AC14d (16 prodotti)...');
  
  // Find products across calendar
  let found = [];
  for (let page = 0; page < 20; page++) {
    const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?startDate=2027-01-07&endDate=2027-01-08&size=20&page=${page}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
    const json = await res.json();
    const items = Array.isArray(json) ? json : (json.data || json.calendar || []);
    if (!items.length) break;

    for (const it of items) {
      if (ac14Products.includes(Number(it.id))) {
        const firstDay = it.days && it.days[0];
        found.push({
          id: it.id,
          name: it.name,
          date: firstDay?.date,
          stopSells: firstDay?.stopSells,
          bookable: firstDay?.bookable,
          closed: firstDay?.closed
        });
      }
    }
  }

  console.log(`Trovati ${found.length} di ${ac14Products.length} prodotti AC14d su Octorate:`);
  console.table(found);
}

run().catch(console.error);
