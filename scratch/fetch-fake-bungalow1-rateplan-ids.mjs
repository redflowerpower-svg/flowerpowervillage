/**
 * 🔍 FETCH TUTTI I RATE PLAN DI FAKE BUNGALOW 1
 * Interroga Octorate API per leggere tutti i rate plan della struttura Fake Bungalow 1.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Env parser
const envPath = path.resolve(process.cwd(), '.env');
const envVars = {};
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...rest] = trimmed.split('=');
    if (key) envVars[key.trim()] = rest.join('=').trim();
  }
}

const supabaseUrl = envVars.SUPABASE_URL || envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  // Token
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
  console.log('  🔍 RATE PLAN FAKE BUNGALOW 1 — Lettura da Octorate API');
  console.log('══════════════════════════════════════════════════════════\n');

  // Struttura Fake Bungalow 1 (accommodation ID da trovare)
  // Prima leggiamo i rate plan dell'accommodation cercando quelli nel range 932243-932267
  // Usiamo /connect/rest/v1/structures per trovare le strutture test
  const structuresRes = await fetch('https://api.octorate.com/connect/rest/v1/structures', { headers });
  const structuresText = await structuresRes.text();
  let structures = [];
  try { structures = JSON.parse(structuresText); } catch {}

  console.log(`📦 Strutture trovate nel tuo account Octorate: ${Array.isArray(structures) ? structures.length : 'N/A'}`);

  if (Array.isArray(structures)) {
    // Cerca strutture che contengono "Fake" o "Test" o "Bungalow" nel nome
    const fakeStructures = structures.filter(s =>
      s.name?.toLowerCase().includes('fake') ||
      s.name?.toLowerCase().includes('test') ||
      s.name?.toLowerCase().includes('bungalow')
    );

    if (fakeStructures.length > 0) {
      console.log(`\n🏠 Strutture di TEST trovate:`);
      fakeStructures.forEach(s => {
        console.log(`   ID: ${s.id} | Nome: ${s.name}`);
      });

      // Per ogni struttura test, leggi i rate plan
      for (const struct of fakeStructures) {
        console.log(`\n📋 Rate plan per struttura "${struct.name}" (ID: ${struct.id}):`);
        const rpRes = await fetch(`https://api.octorate.com/connect/rest/v1/rateplans?structureId=${struct.id}`, { headers });
        const rpText = await rpRes.text();
        let ratePlans = [];
        try { ratePlans = JSON.parse(rpText); } catch {}

        if (Array.isArray(ratePlans)) {
          ratePlans.forEach(rp => {
            console.log(`   🔖 ID: ${rp.id} | Nome: ${rp.name || rp.description || '—'} | Livello: ${rp.level ?? '?'}`);
          });
        } else {
          console.log(`   ⚠️ Risposta non array: ${rpText.slice(0, 200)}`);
        }
      }
    } else {
      console.log('\n⚠️ Nessuna struttura con "fake/test/bungalow" nel nome trovata.');
      console.log('   Elenco completo delle strutture nel tuo account:');
      structures.forEach(s => console.log(`   ID: ${s.id} | Nome: ${s.name}`));
    }
  }

  // Prova alternativa: cerca direttamente i rate plan nel range Fake Bungalow 1 (932243-932268)
  console.log('\n\n══════════════════════════════════════════════════════════');
  console.log('  🧪 TEST DIRETTO — Lettura calendario range 932243-932268');
  console.log('══════════════════════════════════════════════════════════\n');

  const testIds = [932243, 932244, 932245, 932246, 932247, 932248, 932249, 932250, 932251, 932252, 932253, 932254, 932255];
  const results = [];

  for (const id of testIds) {
    const res = await fetch(`https://api.octorate.com/connect/rest/v1/calendar?roomId=${id}&dateFrom=2026-10-01&dateTo=2026-10-03`, { headers });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}

    const found = res.ok && json && !json.error;
    const status = found ? '✅ ESISTE' : '❌ NON TROVATO';
    const productName = json?.name || json?.description || (Array.isArray(json) && json[0]?.name) || '—';
    results.push({ id, found, name: productName });
    console.log(`  ID ${id}: ${status}  | Nome: ${productName} | HTTP: ${res.status}`);
    if (json?.error) console.log(`           ⚠️ Errore: ${json.error}`);
  }

  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  📊 RIEPILOGO FINALE — ID Validi Fake Bungalow 1');
  console.log('══════════════════════════════════════════════════════════\n');
  const valid = results.filter(r => r.found);
  console.log(`  ID validi trovati: ${valid.length}/${testIds.length}`);
  valid.forEach(r => console.log(`  ✅  ${r.id}  →  ${r.name}`));
  const invalid = results.filter(r => !r.found);
  if (invalid.length > 0) {
    console.log(`\n  ID NON trovati: ${invalid.length}`);
    invalid.forEach(r => console.log(`  ❌  ${r.id}`));
  }
  console.log('');
}

main().catch(e => {
  console.error(`\x1b[41m\x1b[1m ERRORE FATALE: ${e.message} \x1b[0m`);
  process.exit(1);
});
