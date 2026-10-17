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

async function run() {
  const { data: tokenData } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').single();
  const token = tokenData.access_token;
  const structureId = '366879';

  console.log('Cercando prodotto 495565 (P&L AC14d) tra tutte le pagine del calendario Octorate per Gennaio 2027...');
  
  let targetPlan = null;
  for (let page = 0; page < 30; page++) {
    const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?startDate=2027-01-05&endDate=2027-01-12&size=20&page=${page}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
    const json = await res.json();
    const items = Array.isArray(json) ? json : (json.data || json.calendar || []);
    if (!items.length) break;

    for (const item of items) {
      if (Number(item.id) === 495565 || String(item.name).trim() === 'P&L AC14d') {
        console.log(`TROVATO! id: ${item.id}, name: ${item.name}`);
        targetPlan = item;
        break;
      }
    }
    if (targetPlan) break;
  }

  if (targetPlan) {
    console.log('\n--- DETTAGLIO GIORNI OCTORATE PER P&L AC14d (495565) ---');
    console.log(JSON.stringify(targetPlan, null, 2));
  } else {
    console.log('Prodotto 495565 non trovato nelle prime 30 pagine.');
  }
}

run().catch(console.error);
