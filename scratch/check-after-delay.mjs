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
const supabase = createClient(supabaseUrl, serviceRoleKey);

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

async function checkAfterDelay() {
  console.log('📌 Attesa di 15 secondi per completamento coda asincrona Octorate...');
  await new Promise(r => setTimeout(r, 15000));

  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  const accessToken = tokenData.access_token;
  const structureId = process.env.VITE_OCTORATE_STRUCTURE_ID || '366879';

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json'
  };

  const periodRanges = [
    { name: 'Dicembre 2026', start: '2026-12-01', end: '2026-12-31' },
    { name: 'Gennaio 2027', start: '2027-01-01', end: '2027-01-31' },
    { name: 'Febbraio 2027', start: '2027-02-01', end: '2027-02-28' },
    { name: 'Marzo 2027', start: '2027-03-01', end: '2027-03-31' },
    { name: 'Aprile 2027', start: '2027-04-01', end: '2027-04-30' }
  ];

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
  console.log('  RISULTATO VERIFICA POST-ELABORAZIONE CODA ASINCRONA OCTORATE');
  console.log('========================================================================\n');
  console.table(summaryReport);
}

checkAfterDelay();
