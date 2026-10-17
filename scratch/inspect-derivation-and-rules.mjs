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

  console.log('Fetching all roomrates from Octorate...');
  const res = await fetch(`https://api.octorate.com/connect/rest/v1/roomrates/${structureId}`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
  });
  const data = await res.json();
  const rates = Array.isArray(data) ? data : (data.roomRates || data.rates || []);
  console.log(`Trovate ${rates.length} roomRates.`);

  const targets = [495565, 529781, 330970, 495979, 421527];
  for (const tid of targets) {
    const r = rates.find(x => x.id === tid);
    if (r) {
      console.log(`\n========================================`);
      console.log(`ID: ${r.id} | Name: ${r.name}`);
      console.log(`accommodationId: ${r.accommodationId}`);
      console.log(`derived: ${r.derived}`);
      console.log(`derivedFrom: ${r.derivedFrom}`);
      console.log(`derivedRule:`, JSON.stringify(r.derivedRule, null, 2));
      console.log(`inheritMinStay: ${r.inheritMinStay}`);
      console.log(`inheritStopSell: ${r.inheritStopSell}`);
      console.log(`inheritClosed: ${r.inheritClosed}`);
      console.log(`inheritCloseToArrival: ${r.inheritCloseToArrival}`);
      console.log(`inheritCloseToDeparture: ${r.inheritCloseToDeparture}`);
      console.log(`all keys:`, Object.keys(r));
    } else {
      console.log(`Rate ID ${tid} non trovato!`);
    }
  }
}

run().catch(console.error);
