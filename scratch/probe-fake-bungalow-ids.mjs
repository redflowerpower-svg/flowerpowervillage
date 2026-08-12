/**
 * 🔍 FETCH RATE PLAN IDs FAKE BUNGALOW 1 — via API bulk calendar (write-probe)
 * Testa la scrittura su ciascun ID nel range noto e registra quali Octorate accetta.
 */

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
  envVars.SUPABASE_URL || envVars.VITE_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY
);

async function main() {
  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  const accessToken = tokenData?.access_token;
  const clientId = envVars.VITE_OCTORATE_CLIENT_ID || envVars.OCTORATE_CLIENT_ID || '';
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(clientId ? { 'Octorate-Api-Key': clientId } : {})
  };

  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  🔍 PROBE BULK CALENDAR — Range ID 932243..932270');
  console.log('══════════════════════════════════════════════════════════');
  console.log('  Metodo: POST /calendar/bulk (stopSells=false su data neutra)\n');

  const idsToTest = Array.from({ length: 28 }, (_, i) => 932243 + i);
  const valid = [];
  const invalid = [];

  for (const id of idsToTest) {
    const payload = [{
      room: id,
      dateFrom: '2027-06-01',
      dateTo: '2027-06-01',
      values: { stopSells: false }
    }];

    const res = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}

    const ok = json?.success === true;
    if (ok) {
      console.log(`  ✅ ID ${id} — ACCETTATO  | process: ${json?.process?.[0] ?? '?'}`);
      valid.push(id);
    } else {
      const errMsg = json?.error || text.slice(0, 80);
      console.log(`  ❌ ID ${id} — RIFIUTATO  | ${errMsg}`);
      invalid.push(id);
    }
  }

  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  📊 RIEPILOGO FINALE');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  ✅ ID VALIDI (${valid.length}):   ${valid.join(', ')}`);
  console.log(`  ❌ ID INVALIDI (${invalid.length}): ${invalid.join(', ')}`);
  console.log('');
}

main().catch(e => {
  console.error(`\x1b[41m\x1b[1m ERRORE FATALE: ${e.message} \x1b[0m`);
  process.exit(1);
});
