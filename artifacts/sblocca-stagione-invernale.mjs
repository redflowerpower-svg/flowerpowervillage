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

const MOTHER_IDS = [
  529773, 495795, 495796, 494840, 421511, 293957, 293954, 293962,
  293965, 293955, 293942, 293963, 293959, 293948, 293945, 293943,
  293951, 883795, 649669, 921799
];

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
    console.log('🔓 RIAPERTURA TARIFFE MADRI (CELLE VERDI) PER IL PERIODO 1 DIC - 30 APR');
    console.log('========================================================================\n');

    const periodRanges = [
      { name: 'Dicembre 2026', start: '2026-12-01', end: '2026-12-31' },
      { name: 'Gennaio 2027', start: '2027-01-01', end: '2027-01-31' },
      { name: 'Febbraio 2027', start: '2027-02-01', end: '2027-02-28' },
      { name: 'Marzo 2027', start: '2027-03-01', end: '2027-03-31' },
      { name: 'Aprile 2027', start: '2027-04-01', end: '2027-04-30' }
    ];

    for (const period of periodRanges) {
      const chunkPayload = MOTHER_IDS.map((mId) => ({
        room: Number(mId),
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
      console.log(`  - ${period.name} (${period.start} ➔ ${period.end}): HTTP ${res.status} | Res: ${txt.slice(0, 70)}`);
    }

    console.log('\n📡 Recupero Tariffe 7D per blocco selettivo...');
    const roomsRes = await fetch(`https://api.octorate.com/connect/rest/v3/roomrates/${structureId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    const allProductsPayload = await roomsRes.json();
    const productList = Array.isArray(allProductsPayload) ? allProductsPayload : (Array.isArray(allProductsPayload.data) ? allProductsPayload.data : []);

    const standard7d = productList.filter(p => {
      const name = (p.name || p.title || p.ratePlanName || '').toLowerCase();
      return name.includes('7d') && !name.includes('ac') && !name.includes('agd') && !name.includes('agoda') && !name.includes('bnb');
    });

    if (standard7d.length > 0) {
      console.log(`\n🔒 Blocco di ${standard7d.length} Tariffe 7D (Spegne pallino S)...`);
      for (const period of periodRanges) {
        const chunkPayload = standard7d.map((rate) => ({
          room: Number(rate.id),
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
        console.log(`  - Blocco 7D per ${period.name}: HTTP ${res.status} | Res: ${txt.slice(0, 70)}`);
      }
    } else {
      console.log('📌 Utilizzo elenco 18 Tariffe 7D Standard predefinite per il blocco...');
      const STANDARD_7D_RATES = [
        529784, 495807, 495980, 495566, 449348, 449385, 449422, 449668,
        449675, 449674, 449742, 449678, 449684, 449699, 449724, 449730,
        449736, 923905, 932244, 932257
      ];

      for (const period of periodRanges) {
        const chunkPayload = STANDARD_7D_RATES.map((id) => ({
          room: Number(id),
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
        console.log(`  - Blocco 7D Standard per ${period.name}: HTTP ${res.status} | Res: ${txt.slice(0, 70)}`);
      }
    }

    console.log('\n========================================================================');
    console.log('✅ OPERAZIONE COMPLETATA CON SUCCESSO! Premi Sync Live sul calendario.');
    console.log('========================================================================\n');
  } catch (err) {
    console.error('Errore:', err.message);
  }
}

run();
