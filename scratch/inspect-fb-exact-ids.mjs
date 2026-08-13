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

async function inspectFB() {
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

  console.log('\n--- FAKE BUNGALOW 1 (FB1) RATES ON OCTORATE ---');
  allItems
    .filter(item => String(item.name).startsWith('FB1') || String(item.name).includes('Fake Bungalow  1'))
    .sort((a, b) => Number(a.id) - Number(b.id))
    .forEach(item => console.log(`ID: ${String(item.id).padEnd(8)} ➔ Name: "${item.name}"`));

  console.log('\n--- FAKE BUNGALOW 2 (FB2) RATES ON OCTORATE ---');
  allItems
    .filter(item => String(item.name).startsWith('FB2') || String(item.name).includes('Fake Bungalow 2'))
    .sort((a, b) => Number(a.id) - Number(b.id))
    .forEach(item => console.log(`ID: ${String(item.id).padEnd(8)} ➔ Name: "${item.name}"`));
}

inspectFB().catch(err => console.error(err));
