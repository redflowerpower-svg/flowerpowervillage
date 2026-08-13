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
  envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY
);

// Mappatura esatta FB1 e FB2
const TEST_PRODUCT_IDS = {
  be:           932243,
  '7d':         932244,
  main_bnb_7d:  932246,
  main_bnb_14d: 932247,
  ac_7d:        932248,
  ac_14d:       932249,
  agoda_ac_7d:  932250,
  agoda_ac_14d: 932251,
  agd_ac_7d:    932250,
  agd_ac_14d:   932251,
  airbnb:       932252,
  airbnb_ac:    932253,
  ac_bnb_7d:    932254,
  ac_bnb_14d:   932255
};

// Periodi pianificati in Tabella 1 (dallo screenshot dell'utente)
const PLANNED_SETUP = {
  be: [
    { dateFrom: '2026-10-01', dateTo: '2027-10-31', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckoutDays: 0 }
  ],
  '7d': [
    { dateFrom: '2026-10-01', dateTo: '2026-12-15', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckoutDays: 0 },
    { dateFrom: '2027-04-01', dateTo: '2027-10-31', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckoutDays: 0 }
  ],
  main_bnb_7d: [
    { dateFrom: '2026-10-01', dateTo: '2026-12-15', stopSell: false, closedToArrival: true, closedToDeparture: false, onlyCheckoutDays: 10 },
    { dateFrom: '2027-01-15', dateTo: '2027-10-31', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckoutDays: 0 }
  ],
  main_bnb_14d: [
    { dateFrom: '2026-12-16', dateTo: '2027-01-15', stopSell: false, closedToArrival: true, closedToDeparture: false, onlyCheckoutDays: 10 }
  ],
  agd_ac_7d: [
    { dateFrom: '2026-10-01', dateTo: '2026-12-15', stopSell: false, closedToArrival: true, closedToDeparture: false, onlyCheckoutDays: 10 },
    { dateFrom: '2027-01-16', dateTo: '2027-10-31', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckoutDays: 0 }
  ],
  agd_ac_14d: [
    { dateFrom: '2026-12-16', dateTo: '2027-01-15', stopSell: false, closedToArrival: true, closedToDeparture: false, onlyCheckoutDays: 10 }
  ],
  airbnb: [
    { dateFrom: '2026-10-01', dateTo: '2027-10-31', stopSell: false, closedToArrival: true, closedToDeparture: false, onlyCheckoutDays: 10 }
  ]
};

async function syncAllTest() {
  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  const accessToken = tokenData?.access_token;
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('  🚀 ESECUZIONE SINCRONIZZAZIONE DI PROVA TABELLA 1 ➔ FB1 & FB2');
  console.log('════════════════════════════════════════════════════════════════\n');

  for (const [planKey, periods] of Object.entries(PLANNED_SETUP)) {
    const fb1Id = TEST_PRODUCT_IDS[planKey];
    if (!fb1Id) continue;
    const roomIds = [fb1Id, fb1Id + 13];

    console.log(`\n📌 Piano ${planKey.toUpperCase()} ➔ IDs FB1: ${fb1Id}, FB2: ${fb1Id + 13}`);

    // FASE 1: Tabula Rasa Reset (01/10/2026 -> 31/10/2027)
    const resetStrategy = planKey === 'be' ? 'open' : 'stopsell';
    for (const roomId of roomIds) {
      const resetPayload = [{
        room: roomId,
        dateFrom: '2026-10-01',
        dateTo: '2027-10-31',
        values: {
          stopSells: resetStrategy === 'stopsell',
          closed: resetStrategy === 'stopsell',
          closedArrival: resetStrategy === 'stopsell',
          closedDeparture: resetStrategy === 'stopsell'
        }
      }];

      const res = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
        method: 'POST',
        headers,
        body: JSON.stringify(resetPayload)
      });
      const txt = await res.text();
      console.log(`   🧹 Reset Tabula Rasa (${resetStrategy}) room ${roomId}: HTTP ${res.status} -> ${txt.slice(0, 100)}`);
    }

    // FASE 2: Invio periodi pianificati
    for (const period of periods) {
      for (const roomId of roomIds) {
        const values = {
          stopSells: period.stopSell,
          closed: period.stopSell,
          closedArrival: period.closedToArrival || period.stopSell,
          closedDeparture: period.closedToDeparture || period.stopSell
        };

        const periodPayload = [{
          room: roomId,
          dateFrom: period.dateFrom,
          dateTo: period.dateTo,
          values
        }];

        const res = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
          method: 'POST',
          headers,
          body: JSON.stringify(periodPayload)
        });
        const txt = await res.text();
        console.log(`   📅 Periodo [${period.dateFrom} ➔ ${period.dateTo}] room ${roomId}: HTTP ${res.status} -> ${txt.slice(0, 100)}`);
      }
    }
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('  ✅ SINCRONIZZAZIONE COMPLETATA');
  console.log('════════════════════════════════════════════════════════════════\n');
}

syncAllTest().catch(err => console.error(err));
