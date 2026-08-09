import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Carica variabili d'ambiente da .env / .env.local
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

// Lista dei 18 piani tariffari Standard 7d Target
const TARGET_7D_RATES = [
  { id: '529784', accommodation: 'Jungle Villa', code: 'JV 7d' },
  { id: '495807', accommodation: 'Jungle Villa Left', code: 'JVL 7d' },
  { id: '495980', accommodation: 'Jungle Villa Right', code: 'JVR 7d' },
  { id: '495566', accommodation: 'Peace & Love Villa', code: 'P&L 7d' },
  { id: '449348', accommodation: 'Villa Penthouse', code: 'Pent 7d' },
  { id: '449385', accommodation: 'Yellow Bungalow', code: 'Yellow 7d' },
  { id: '449422', accommodation: 'Red Bungalow', code: 'Red 7d' },
  { id: '449668', accommodation: 'Green Bungalow', code: 'Green 7d' },
  { id: '449675', accommodation: 'Camel Tent', code: 'Camel 7d' },
  { id: '449674', accommodation: 'Lagoon Tent', code: 'Lagoon 7d' },
  { id: '449742', accommodation: 'Internal Room', code: 'Internal 7d' },
  { id: '449678', accommodation: 'Room 1', code: 'R1 7d' },
  { id: '449684', accommodation: 'Room 2', code: 'R2 7d' },
  { id: '449699', accommodation: 'Room 3', code: 'R3 7d' },
  { id: '449724', accommodation: 'Room 4', code: 'R4 7d' },
  { id: '449730', accommodation: 'Room 5', code: 'R5 7d' },
  { id: '449736', accommodation: 'Lodge 1', code: 'Lodge 1 7d' },
  { id: '923905', accommodation: 'Lodge 2', code: 'Lodge 2 7d' }
];

async function runDiagnostica7d() {
  console.log('========================================================================');
  console.log('  FLOWER POWER VILLAGE — DIAGNOSTICA COMPLETA TARIFFE STANDARD 7D');
  console.log('========================================================================\n');

  // STEP 1: Recupero Token OAuth da Supabase
  console.log('📌 [STEP 1] Recupero Token OAuth Octorate da Supabase...');
  const { data: tokenData, error: tokenError } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  if (tokenError || !tokenData?.access_token) {
    console.error('❌ Token Octorate non presente nel DB:', tokenError?.message);
    process.exit(1);
  }

  const accessToken = tokenData.access_token;
  const clientId = process.env.VITE_OCTORATE_CLIENT_ID || process.env.OCTORATE_CLIENT_ID || '';
  const structureId = process.env.VITE_OCTORATE_STRUCTURE_ID || '366879';

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (clientId) {
    headers['Octorate-Api-Key'] = clientId;
  }

  console.log('✅ Token Octorate valido recuperato dal database.');

  // Target Date: +45 Giorni
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 45);
  const targetDateStr = targetDate.toISOString().slice(0, 10);

  console.log(`\n📌 [STEP 2] Scarico griglia Octorate per struttura ${structureId} in data: ${targetDateStr}...`);

  const allItems = [];
  let page = 0;
  const MAX_PAGES = 25;

  while (page < MAX_PAGES) {
    const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${targetDateStr}&dateTo=${targetDateStr}&size=20&page=${page}`;
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) break;
      const payload = await res.json();
      const pageItems = payload && Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []);
      if (pageItems.length === 0) break;
      allItems.push(...pageItems);
      if (pageItems.length < 20) break;
      page++;
    } catch {
      break;
    }
  }

  console.log(`✅ Scaricati ${allItems.length} elementi correnti dal calendario Octorate.\n`);

  // Creazione mappa ID Octorate -> Dati Live
  const liveDataMap = new Map();
  allItems.forEach((item) => {
    const itemRateId = String(item.id || item.ratePlanId || item.room || '');
    if (itemRateId) {
      liveDataMap.set(itemRateId, item);
    }
  });

  const results = [];

  for (let i = 0; i < TARGET_7D_RATES.length; i++) {
    const rate = TARGET_7D_RATES[i];
    const liveItem = liveDataMap.get(rate.id);

    let price = 'N/A';
    let minstay = 'N/A';
    let stopSell = 'N/A';
    let closeArrival = 'N/A';
    let status = 'NOT_FOUND';

    if (liveItem) {
      status = 'OK';
      price = liveItem.price !== undefined ? `${liveItem.price}฿` : (liveItem.basePrice ? `${liveItem.basePrice}฿` : 'N/A');
      minstay = liveItem.minstay !== undefined ? `${liveItem.minstay}n` : 'N/A';
      const isClosed = Boolean(liveItem.stopSells || liveItem.stopSell || liveItem.closed);
      stopSell = isClosed ? '🔒 CHIUSO' : '🔓 APERTO';
      closeArrival = Boolean(liveItem.closeToArrival || liveItem.closedArrival) ? 'SI' : 'NO';
    }

    results.push({
      idx: i + 1,
      id: rate.id,
      accommodation: rate.accommodation,
      code: rate.code,
      price,
      minstay,
      stopSell,
      closeArrival,
      status
    });

    console.log(`   [${i + 1}/18] #${rate.id} (${rate.accommodation}) ➔ ${stopSell} | Prezzo: ${price} | MinStay: ${minstay}`);
  }

  console.log('\n========================================================================');
  console.log('  TABELLA DIAGNOSTICA COMPLETA TARIFFE STANDARD 7D');
  console.log('========================================================================\n');
  console.table(results);

  const closedCount = results.filter(r => r.stopSell.includes('CHIUSO')).length;
  const openCount = results.filter(r => r.stopSell.includes('APERTO')).length;
  const okCount = results.filter(r => r.status === 'OK').length;

  console.log(`\n📊 RIEPILOGO FINALE:`);
  console.log(`   - Tariffe 7d identificate  : ${okCount}/18`);
  console.log(`   - Tariffe in STOP SELL     : ${closedCount} 🔒`);
  console.log(`   - Tariffe VENDIBILI        : ${openCount} 🔓`);
  console.log('\n========================================================================\n');
}

runDiagnostica7d();
