import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fetchOctorateRates() {
  console.log('📌 [STEP 2] Scarico prodotti reali da Octorate API per struttura 366879...');
  
  const { data: tokenData, error: tokenError } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  if (tokenError || !tokenData?.access_token) {
    console.error('❌ Token non trovato in DB:', tokenError?.message);
    return;
  }

  const accessToken = tokenData.access_token;
  const clientId = process.env.VITE_OCTORATE_CLIENT_ID || process.env.OCTORATE_CLIENT_ID || '';
  const structureId = process.env.VITE_OCTORATE_STRUCTURE_ID || '366879';

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json'
  };
  if (clientId) {
    headers['Octorate-Api-Key'] = clientId;
  }

  const urls = [
    `https://api.octorate.com/connect/rest/v3/roomrates/${structureId}`,
    `https://api.octorate.com/connect/rest/v2/roomrates/${structureId}`,
    `https://api.octorate.com/connect/rest/v1/roomrates/${structureId}`
  ];

  let rawRooms = [];
  for (const url of urls) {
    try {
      console.log(`   Chiamata GET ${url}...`);
      const res = await fetch(url, { headers });
      console.log(`   HTTP Status: ${res.status} ${res.statusText}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          rawRooms = json;
          console.log(`   ✅ Trovati ${rawRooms.length} elementi su Octorate!`);
          break;
        }
      }
    } catch (e) {
      console.warn(`   Errore chiamando ${url}:`, e.message);
    }
  }

  // Dump retrieved rate plan IDs
  const activeRateIds = new Set();
  if (Array.isArray(rawRooms)) {
    rawRooms.forEach(item => {
      const id = item.id || item.ratePlanId || item.room;
      if (id) activeRateIds.add(String(id));
      if (Array.isArray(item.ratePlans)) {
        item.ratePlans.forEach(rp => { if (rp.id) activeRateIds.add(String(rp.id)); });
      }
    });
  }

  console.log(`\n📋 TOTALE RATE IDS REALI ATTIVI IN STRUTTURA: ${activeRateIds.size}`);
  console.log('Sample IDs:', Array.from(activeRateIds).slice(0, 30));

  fs.writeFileSync(
    path.resolve(process.cwd(), 'scratch/octorate-active-rate-ids.json'),
    JSON.stringify(Array.from(activeRateIds), null, 2)
  );
}

fetchOctorateRates();
