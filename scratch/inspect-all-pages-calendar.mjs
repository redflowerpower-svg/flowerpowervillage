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

async function inspectAllPages() {
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

  const allItems = [];
  for (let page = 1; page <= 10; page++) {
    const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=2026-11-01&dateTo=2026-11-02&page=${page}&size=50`;
    const res = await fetch(url, { headers });
    if (!res.ok) break;
    const json = await res.json();
    const items = json.data || (Array.isArray(json) ? json : []);
    if (!items || items.length === 0) break;
    allItems.push(...items);
  }

  console.log(`\n================================================================`);
  console.log(`  TRACCIAMENTO REALE OCTORATE ID <-> NOME PIANO (${allItems.length} trovati)`);
  console.log(`================================================================\n`);

  allItems
    .sort((a, b) => Number(a.id) - Number(b.id))
    .forEach(item => {
      console.log(`ID: ${String(item.id).padEnd(8)} ➔ Name: "${item.name}"`);
    });
}

inspectAllPages().catch(err => console.error(err));
