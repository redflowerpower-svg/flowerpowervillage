import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnvironment() {
  const envPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.local')
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            const val = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
            if (!process.env[key.trim()]) {
              process.env[key.trim()] = val;
            }
          }
        }
      }
    }
  }
}

loadEnvironment();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Credenziali Supabase mancanti nei file di ambiente.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function getOctorateToken() {
  const { data, error } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .single();

  if (error || !data?.access_token) {
    throw new Error('Token non trovato su Supabase.');
  }
  return data.access_token;
}

async function run() {
  try {
    const accessToken = await getOctorateToken();
    const structureId = process.env.VITE_OCTORATE_STRUCTURE_ID || '366879';

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    console.log('========================================================================');
    console.log('  ALLINEAMENTO TARIFFE AIRBNB SU OCTORATE PMS (DA OGGI AL 31/10/2027)');
    console.log('  1. AirBnB (Fan): APERTA (stopSells: false) per tutti gli alloggi');
    console.log('  2. AirBnB AC: CHIUSA (stopSells: true) per tutti gli alloggi');
    console.log('========================================================================\n');

    // 1. Recupera la lista di tutti i prodotti via calendar API
    const periodItems = [];
    for (let page = 0; page < 20; page++) {
      const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=2026-08-10&dateTo=2026-08-10&size=20&page=${page}`;
      try {
        const res = await fetch(url, { headers });
        if (!res.ok) break;
        const payload = await res.json();
        const pageItems = payload && Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []);
        if (pageItems.length === 0) break;
        periodItems.push(...pageItems);
        if (pageItems.length < 20) break;
      } catch {
        break;
      }
    }

    const airbnbFanProducts = [];
    const airbnbACProducts = [];

    periodItems.forEach((p) => {
      const name = (p.name || p.title || p.ratePlanName || '').toLowerCase();
      if (name.includes('airbnb') || name.includes('airbnb')) {
        if (name.includes('ac')) {
          airbnbACProducts.push(p);
        } else {
          airbnbFanProducts.push(p);
        }
      }
    });

    console.log(`📌 Trovati ${airbnbFanProducts.length} prodotti AirBnB Fan e ${airbnbACProducts.length} prodotti AirBnB AC.\n`);

    const periodRanges = [
      { name: 'Stagione 2026 (Agosto - Novembre)', start: '2026-08-10', end: '2026-11-30' },
      { name: 'Inverno 2026/2027 (Dicembre - Aprile)', start: '2026-12-01', end: '2027-04-30' },
      { name: 'Estate 2027 (Maggio - Ottobre)', start: '2027-05-01', end: '2027-10-31' }
    ];

    // 2. Apri tutte le tariffe AirBnB Fan (stopSells: false)
    if (airbnbFanProducts.length > 0) {
      console.log('🔓 [STEP 1] Apertura Bulk AirBnB Fan (stopSells: false)...');
      for (const period of periodRanges) {
        const chunkPayload = airbnbFanProducts.map((p) => ({
          room: Number(p.id),
          dateFrom: period.start,
          dateTo: period.end,
          values: {
            stopSells: false,
            closed: false
          }
        }));

        const res = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
          method: 'POST',
          headers,
          body: JSON.stringify(chunkPayload)
        });
        const txt = await res.text();
        console.log(`   - ${period.name}: HTTP ${res.status} | Res: ${txt.slice(0, 60)}`);
      }
    }

    // 3. Chiudi tutte le tariffe AirBnB AC (stopSells: true)
    if (airbnbACProducts.length > 0) {
      console.log('\n🔒 [STEP 2] Chiusura Bulk AirBnB AC (stopSells: true)...');
      for (const period of periodRanges) {
        const chunkPayload = airbnbACProducts.map((p) => ({
          room: Number(p.id),
          dateFrom: period.start,
          dateTo: period.end,
          values: {
            stopSells: true,
            closed: true
          }
        }));

        const res = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
          method: 'POST',
          headers,
          body: JSON.stringify(chunkPayload)
        });
        const txt = await res.text();
        console.log(`   - ${period.name}: HTTP ${res.status} | Res: ${txt.slice(0, 60)}`);
      }
    }

    console.log('\n========================================================================');
    console.log('✅ ALLINEAMENTO TARIFFE AIRBNB COMPLETATO CON SUCCESSO SU OCTORATE PMS!');
    console.log('========================================================================\n');
  } catch (err) {
    console.error('Errore:', err.message);
  }
}

run();
