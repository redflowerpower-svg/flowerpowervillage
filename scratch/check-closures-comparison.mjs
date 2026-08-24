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

async function checkClosuresComparison() {
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

  // Fetch Oct 1 (Template)
  const allOctItems = [];
  for (let page = 1; page <= 5; page++) {
    const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=2026-10-01&dateTo=2026-10-01&page=${page}&size=50`;
    const res = await fetch(url, { headers });
    if (!res.ok) break;
    const json = await res.json();
    const items = json.data || [];
    if (items.length === 0) break;
    allOctItems.push(...items);
  }

  // Fetch Aug 23 (Current live)
  const allAugItems = [];
  for (let page = 1; page <= 5; page++) {
    const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=2026-08-23&dateTo=2026-08-23&page=${page}&size=50`;
    const res = await fetch(url, { headers });
    if (!res.ok) break;
    const json = await res.json();
    const items = json.data || [];
    if (items.length === 0) break;
    allAugItems.push(...items);
  }

  console.log(`\n=== ANALISI CHIUSURE (STOP SELL) SUL 1° OTTOBRE (TEMPLATE) ===`);
  const octClosed = allOctItems.filter(item => item.days?.[0]?.stopSells === true);
  const octOpen = allOctItems.filter(item => item.days?.[0]?.stopSells === false);
  console.log(`Totale piani tariffari: ${allOctItems.length}`);
  console.log(`Piani CHIUSI (StopSell = true): ${octClosed.length}`);
  console.log(`Piani APERTI (StopSell = false): ${octOpen.length}`);

  console.log('\n--- Esempio Piani CHIUSI sul 1° Ottobre (da chiudere anche in Ago-Set) ---');
  octClosed.slice(0, 15).forEach(i => {
    console.log(`🔒 [CHIUSO] ID: ${i.id} | ${i.name}`);
  });

  console.log('\n--- Esempio Piani APERTI sul 1° Ottobre (da lasciare aperti in Ago-Set) ---');
  octOpen.slice(0, 15).forEach(i => {
    console.log(`🟢 [APERTO] ID: ${i.id} | ${i.name}`);
  });
}

checkClosuresComparison().catch(console.error);
