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

async function inspectAugustCurrent() {
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

  const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=2026-08-23&dateTo=2026-08-23&page=1&size=50`;
  const res = await fetch(url, { headers });
  const json = await res.json();
  const items = json.data || [];

  console.log(`Retrieved ${items.length} items for 2026-08-23`);
  items.slice(0, 10).forEach(item => {
    const day = item.days?.[0] || {};
    console.log(`ID: ${item.id} | Name: ${item.name.padEnd(30)} | Price: ${String(day.price).padStart(5)} | MinStay: ${day.minStay} | StopSells: ${day.stopSells} | Avail: ${day.availability}`);
  });
}

inspectAugustCurrent().catch(console.error);
