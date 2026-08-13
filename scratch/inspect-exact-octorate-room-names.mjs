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

async function inspectNames() {
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

  const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=2026-11-01&dateTo=2026-11-02&size=100`;
  console.log('Fetching Octorate calendar items...');
  const res = await fetch(url, { headers });
  const rawData = await res.json();
  const items = Array.isArray(rawData) ? rawData : (rawData.data || rawData.items || []);

  console.log(`Trovati ${items.length} elementi nel calendario Octorate:\n`);
  
  const idMap = new Map();
  items.forEach(item => {
    idMap.set(Number(item.id), item.name || item.description || item.code);
  });

  console.log('--- ALL OCTORATE IDs AND NAMES ---');
  Array.from(idMap.entries())
    .sort(([a], [b]) => a - b)
    .forEach(([id, name]) => {
      console.log(`ID: ${id} -> Name: "${name}"`);
    });
}

inspectNames().catch(err => console.error(err));
