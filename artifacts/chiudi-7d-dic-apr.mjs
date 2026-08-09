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

// 18 Tariffe Standard 7d Ufficiali
const STANDARD_7D_RATES = [
  { id: '529784', name: 'Jungle Villa (JV 7d)' },
  { id: '495807', name: 'Jungle Villa Left (JVL 7d)' },
  { id: '495980', name: 'Jungle Villa Right (JVR 7d)' },
  { id: '495566', name: 'Peace & Love Villa (P&L 7d)' },
  { id: '449348', name: 'Villa Penthouse (Pent 7d)' },
  { id: '449385', name: 'Yellow Bungalow (Yellow 7d)' },
  { id: '449422', name: 'Red Bungalow (Red 7d)' },
  { id: '449668', name: 'Green Bungalow (Green 7d)' },
  { id: '449675', name: 'Camel Tent (Camel 7d)' },
  { id: '449674', name: 'Lagoon Tent (Lagoon 7d)' },
  { id: '449742', name: 'Internal Room (Internal 7d)' },
  { id: '449678', name: 'Room 1 (R1 7d)' },
  { id: '449684', name: 'Room 2 (R2 7d)' },
  { id: '449699', name: 'Room 3 (R3 7d)' },
  { id: '449724', name: 'Room 4 (R4 7d)' },
  { id: '449730', name: 'Room 5 (R5 7d)' },
  { id: '449736', name: 'Lodge 1 (Lodge 1 7d)' },
  { id: '923905', name: 'Lodge 2 (Lodge 2 7d)' }
];

async function applyStopSellDecAprChunked() {
  console.log('========================================================================');
  console.log('  APPLICAZIONE BULK STOP SELL MESE PER MESE (1 DICEMBRE ➔ 30 APRILE)');
  console.log('========================================================================\n');

  console.log('📌 [STEP 1] Recupero Token OAuth Octorate da Supabase...');
  const { data: tokenData, error: tokenError } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  if (tokenError || !tokenData?.access_token) {
    console.error('❌ Token non presente nel DB:', tokenError?.message);
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

  const periodRanges = [
    { name: 'Dicembre 2026', start: '2026-12-01', end: '2026-12-31' },
    { name: 'Gennaio 2027', start: '2027-01-01', end: '2027-01-31' },
    { name: 'Febbraio 2027', start: '2027-02-01', end: '2027-02-28' },
    { name: 'Marzo 2027', start: '2027-03-01', end: '2027-03-31' },
    { name: 'Aprile 2027', start: '2027-04-01', end: '2027-04-30' }
  ];

  console.log('📌 [STEP 2] Invio comandi Bulk Stop Sell Mese per Mese...\n');

  for (const period of periodRanges) {
    const chunkPayload = STANDARD_7D_RATES.map((rate) => ({
      room: Number(rate.id),
      dateFrom: period.start,
      dateTo: period.end,
      values: {
        stopSells: true,
        closed: true
      }
    }));

    try {
      const res = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
        method: 'POST',
        headers,
        body: JSON.stringify(chunkPayload)
      });
      const txt = await res.text();
      console.log(`   🗓️ ${period.name} (${period.start} ➔ ${period.end}) ➔ HTTP ${res.status} | Res: ${txt.slice(0, 70)}`);
    } catch (e) {
      console.error(`   ❌ Errore ${period.name}:`, e.message);
    }
  }

  console.log('\n📌 [STEP 3] Scansione di Verifica Live dello stato Stop Sell su Octorate...');

  const summaryReport = [];

  for (const period of periodRanges) {
    let closedCount = 0;
    let openCount = 0;

    let page = 0;
    const MAX_PAGES = 20;
    const periodItems = [];

    while (page < MAX_PAGES) {
      const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${period.start}&dateTo=${period.end}&size=20&page=${page}`;
      try {
        const res = await fetch(url, { headers });
        if (!res.ok) break;
        const payload = await res.json();
        const pageItems = payload && Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []);
        if (pageItems.length === 0) break;
        periodItems.push(...pageItems);
        if (pageItems.length < 20) break;
        page++;
      } catch {
        break;
      }
    }

    const rateIdSet = new Set(STANDARD_7D_RATES.map(r => r.id));

    periodItems.forEach((item) => {
      const itemId = String(item.id || item.ratePlanId || item.room || '');
      if (rateIdSet.has(itemId)) {
        const isClosed = Boolean(item.stopSells || item.stopSell || item.closed || item.available === false);
        if (isClosed) {
          closedCount++;
        } else {
          openCount++;
        }
      }
    });

    const statusBadge = closedCount > 0 && openCount === 0 
      ? '🔒 TOTALE STOP SELL' 
      : (openCount > 0 && closedCount === 0 
          ? '🔓 TOTALE APERTO' 
          : '⚠️ PARZIALMENTE APERTO');

    summaryReport.push({
      Periodo: period.name,
      'Da': period.start,
      'A': period.end,
      'Attivi (Aperti)': openCount,
      'Stop Sell (Chiusi)': closedCount,
      Stato: statusBadge
    });

    console.log(`   🗓️ ${period.name} ➔ ${statusBadge} (Aperti: ${openCount}, Chiusi: ${closedCount})`);
  }

  console.log('\n========================================================================');
  console.log('🎉 VERIFICA COMPLETATA! RISULTATO FINALE PERIODO 1 DICEMBRE - 30 APRILE');
  console.log('========================================================================\n');
  console.table(summaryReport);
}

applyStopSellDecAprChunked();
