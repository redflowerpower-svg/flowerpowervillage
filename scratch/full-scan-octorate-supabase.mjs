/**
 * 🔍 FULL AUDIT SCRIPT: Website <-> Supabase <-> Octorate
 * Scansiona tutti i codici alloggio, tariffe, mappature e schemi di sincronizzazione.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse .env
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
}

const supabaseUrl = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
  console.log('================================================================');
  console.log('  🔍 DEEP SCAN AUDIT: SUPABASE <-> OCTORATE <-> WEBSITE CODES  ');
  console.log('================================================================\n');

  // 1. SUPABASE ACCOMMODATIONS & RATE PLANS
  console.log('--- 1. SUPABASE ACCOMMODATIONS & SCHEMAS ---');
  const { data: accommodations, error: accError } = await supabase
    .from('accommodations')
    .select('*');

  if (accError) {
    console.error('❌ Errore lettura accommodations da Supabase:', accError.message);
  } else {
    console.log(`✅ Accommodations in Supabase (${accommodations.length} trovati):`);
    for (const acc of accommodations) {
      console.log(`   🏠 ID: ${acc.id} | Name: ${acc.name} | octorate_room_id: ${acc.octorate_room_id || 'N/A'}`);
      if (acc.rate_plans) {
        console.log(`      Rate Plans: ${JSON.stringify(acc.rate_plans)}`);
      }
    }
  }

  // 2. OCTORATE TOKEN & ROOMS/RATEPLANS
  console.log('\n--- 2. OCTORATE API SCAN ---');
  const { data: tokenData, error: tokenError } = await supabase
    .from('octorate_tokens')
    .select('*')
    .eq('id', 'singleton')
    .maybeSingle();

  if (tokenError || !tokenData?.access_token) {
    console.error('❌ Impossibile recuperare token Octorate singleton da Supabase:', tokenError?.message);
    return;
  }

  const accessToken = tokenData.access_token;
  const clientId = envVars.VITE_OCTORATE_CLIENT_ID || envVars.OCTORATE_CLIENT_ID || '';
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(clientId ? { 'Octorate-Api-Key': clientId } : {})
  };

  // Fetch rateplans from Octorate
  try {
    const rpRes = await fetch('https://api.octorate.com/connect/rest/v1/rateplans', { headers });
    const rpText = await rpRes.text();
    let rateplans = [];
    try { rateplans = JSON.parse(rpText); } catch (e) {
      console.log('⚠️ Risposta rateplans non-JSON:', rpText.slice(0, 200));
    }
    if (Array.isArray(rateplans)) {
      console.log(`✅ Rate Plans su Octorate (${rateplans.length} trovati):`);
      rateplans.forEach(rp => {
        console.log(`   🔖 ID: ${rp.id} | Code/Name: ${rp.name || rp.code || rp.description} | StructureId: ${rp.structureId || rp.structure?.id} | Level: ${rp.level}`);
      });
    } else {
      console.log('   Note Rateplans Octorate API:', rateplans);
    }
  } catch (e) {
    console.error('❌ Errore chiamata Octorate rateplans:', e.message);
  }

  // Fetch rooms from Octorate
  try {
    const roomRes = await fetch('https://api.octorate.com/connect/rest/v1/rooms', { headers });
    const roomText = await roomRes.text();
    let rooms = [];
    try { rooms = JSON.parse(roomText); } catch (e) {}
    if (Array.isArray(rooms)) {
      console.log(`\n✅ Rooms/Accommodations su Octorate (${rooms.length} trovate):`);
      rooms.forEach(r => {
        console.log(`   🛏️ ID: ${r.id} | Name: ${r.name || r.title} | Code: ${r.code}`);
      });
    } else {
      console.log('   Note Rooms Octorate API:', roomText.slice(0, 200));
    }
  } catch (e) {
    console.error('❌ Errore chiamata Octorate rooms:', e.message);
  }

  // 3. READ STATIC CONFIGS IN BACKEND API
  console.log('\n--- 3. VERIFICA MAPPATURE STATICHE NEL BACKEND ---');
  // Read REAL_PRODUCT_IDS and TEST_PRODUCT_IDS from backend handlers
  const bulkHandlerPath = path.resolve(process.cwd(), 'api/_handlers/update-rateplan-restrictions-bulk.ts');
  if (fs.existsSync(bulkHandlerPath)) {
    const content = fs.readFileSync(bulkHandlerPath, 'utf8');
    const realMatch = content.match(/export const REAL_PRODUCT_IDS.*=\{([\s\S]*?)\};/);
    const testMatch = content.match(/export const TEST_PRODUCT_IDS.*=\{([\s\S]*?)\};/);
    if (realMatch) console.log('REAL_PRODUCT_IDS (update-rateplan-restrictions-bulk.ts):\n' + realMatch[0]);
    if (testMatch) console.log('TEST_PRODUCT_IDS (update-rateplan-restrictions-bulk.ts):\n' + testMatch[0]);
  }

  console.log('\n================================================================');
  console.log('  AUDIT SCAN COMPLETATO');
  console.log('================================================================\n');
}

runAudit().catch(err => console.error('Errror fatale audit:', err));
