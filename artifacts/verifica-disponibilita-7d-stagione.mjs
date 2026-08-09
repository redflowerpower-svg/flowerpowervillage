import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnvironment() {
  const envPaths = ['.env', '.env.local'];
  for (const envPath of envPaths) {
    const fullPath = path.resolve(process.cwd(), envPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
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
  }
}

loadEnvironment();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

// Elenco Completo dei 20 Alloggi (18 Standard + Fake Bungalow 1 e 2)
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
  { id: '923905', name: 'Lodge 2 (Lodge 2 7d)' },
  { id: '932244', name: 'Fake Bungalow 1 (FB1 7d)' },
  { id: '932257', name: 'Fake Bungalow 2 (FB2 7d)' }
];

function isRateItemClosed(item) {
  if (!item) return true;

  if (Array.isArray(item.days) && item.days.length > 0) {
    const day = item.days[0];
    if (day) {
      const dayStopSell = day.stopSells !== undefined ? day.stopSells : (day.stopSell !== undefined ? day.stopSell : day.closed);
      if (dayStopSell === true || dayStopSell === 'true' || dayStopSell === 1 || dayStopSell === '1') {
        return true;
      }
      if (day.available === false || day.bookable === false) {
        return true;
      }
    }
  }

  const rawStopSell = item.stopSells !== undefined ? item.stopSells : (item.stopSell !== undefined ? item.stopSell : item.closed);
  if (rawStopSell === true || rawStopSell === 'true' || rawStopSell === 1 || rawStopSell === '1') {
    return true;
  }

  return false;
}

async function check7dFullSeason20Accommodations() {
  console.log('========================================================================');
  console.log('  SCANSIONE LIVE DISPONIBILITÀ TARIFFE 7D PER TUTTI E 20 GLI ALLOGGI');
  console.log('  Periodo: Da Oggi (09/08/2026) al 31 Ottobre 2027 (15 Mesi Completi)');
  console.log('========================================================================\n');

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
    { name: 'Agosto 2026 (Stagione Corrente)', start: '2026-08-09', end: '2026-08-31' },
    { name: 'Settembre 2026', start: '2026-09-01', end: '2026-09-30' },
    { name: 'Ottobre 2026', start: '2026-10-01', end: '2026-10-31' },
    { name: 'Novembre 2026', start: '2026-11-01', end: '2026-11-30' },
    { name: 'Dicembre 2026 (Periodo Chiusura)', start: '2026-12-01', end: '2026-12-31' },
    { name: 'Gennaio 2027 (Periodo Chiusura)', start: '2027-01-01', end: '2027-01-31' },
    { name: 'Febbraio 2027 (Periodo Chiusura)', start: '2027-02-01', end: '2027-02-28' },
    { name: 'Marzo 2027 (Periodo Chiusura)', start: '2027-03-01', end: '2027-03-31' },
    { name: 'Aprile 2027 (Periodo Chiusura)', start: '2027-04-01', end: '2027-04-30' },
    { name: 'Maggio 2027 (Post-Chiusura)', start: '2027-05-01', end: '2027-05-31' },
    { name: 'Giugno 2027 (Post-Chiusura)', start: '2027-06-01', end: '2027-06-30' },
    { name: 'Luglio 2027 (Post-Chiusura)', start: '2027-07-01', end: '2027-07-31' },
    { name: 'Agosto 2027 (Post-Chiusura)', start: '2027-08-01', end: '2027-08-31' },
    { name: 'Settembre 2027 (Post-Chiusura)', start: '2027-09-01', end: '2027-09-30' },
    { name: 'Ottobre 2027 (Fine Stagione)', start: '2027-10-01', end: '2027-10-31' }
  ];

  console.log(`📌 Scansione di ${periodRanges.length} mesi per i ${STANDARD_7D_RATES.length} alloggi...\n`);

  const summaryReport = [];

  for (const period of periodRanges) {
    let closedCount = 0;
    let openCount = 0;

    let page = 0;
    const MAX_PAGES = 20;
    const periodItems = [];

    while (page < MAX_PAGES) {
      const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${period.start}&dateTo=${period.start}&size=20&page=${page}`;
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
        if (isRateItemClosed(item)) {
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
          : (closedCount > 0 && openCount > 0 
              ? `⚠️ ${closedCount} CHIUSI / ${openCount} APERTI` 
              : '❓ NESSUN DATO'));

    summaryReport.push({
      Periodo: period.name,
      'Data Campione': period.start,
      'Aperti (Vendibili)': openCount,
      'Chiusi (Stop Sell)': closedCount,
      Stato: statusBadge
    });

    console.log(`   🗓️ ${period.name} (${period.start}) ➔ ${statusBadge} (Aperti: ${openCount}, Chiusi: ${closedCount})`);
  }

  console.log('\n========================================================================');
  console.log('  TABELLA COMPLETA DISPONIBILITÀ TARIFFE 7D (20/20 ALLOGGI) fino al 31/10/2027');
  console.log('========================================================================\n');
  console.table(summaryReport);
}

check7dFullSeason20Accommodations();
