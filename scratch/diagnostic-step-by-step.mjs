/**
 * 🧪 DIAGNOSTIC STEP-BY-STEP — Sincronizzazione Sequenziale Lenta
 * Esegue un ciclo completo su tutti i 12 canali con logging estremo.
 * Attende 2 secondi tra un canale e l'altro per massima leggibilità dei log.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// ── Colori terminale ───────────────────────────────────────────────────────────
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

// ── Env parser ─────────────────────────────────────────────────────────────────
const envPath = path.resolve(process.cwd(), '.env');
const envVars = {};
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...rest] = trimmed.split('=');
      if (key) envVars[key.trim()] = rest.join('=').trim();
    }
  }
}

// ── Supabase ───────────────────────────────────────────────────────────────────
const supabaseUrl = envVars.SUPABASE_URL || envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ── Mappatura Alfabetica Esatta TEST_PRODUCT_IDS ───────────────────────────────
const TEST_PRODUCT_IDS = {
  '7d':         932243,
  ac_bnb_14d:   932244,
  ac_bnb_7d:    932245,
  ac_14d:       932246,
  ac_7d:        932247,
  agoda_ac_14d: 932248,
  agoda_ac_7d:  932249,
  airbnb:       932250,
  airbnb_ac:    932251,
  be:           932252,
  main_bnb_14d: 932253,
  main_bnb_7d:  932254,
};

// ── Periodi Plancia di Test (simulati dalla configurazione locale) ─────────────
const SIMULATED_PERIODS = [
  { name: 'Periodo Q4 (Ott–Dic)', dateFrom: '2026-10-01', dateTo: '2026-12-15', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckOutDays: 7 },
  { name: 'Natale & Capodanno',    dateFrom: '2026-12-20', dateTo: '2027-01-05', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckOutDays: 7 },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function logSeparator(label) {
  const line = '═'.repeat(70);
  console.log(`\n${C.cyan}${C.bold}${line}${C.reset}`);
  if (label) console.log(`${C.cyan}${C.bold}  ${label}${C.reset}`);
  console.log(`${C.cyan}${C.bold}${line}${C.reset}\n`);
}

function logSuccess(msg) { console.log(`${C.green}${C.bold}✅ ${msg}${C.reset}`); }
function logError(msg)   { console.log(`${C.bgRed}${C.bold}❌ ${msg}${C.reset}`); }
function logWarn(msg)    { console.log(`${C.yellow}${C.bold}⚠️  ${msg}${C.reset}`); }
function logInfo(label, val) { console.log(`${C.cyan}  ${label}${C.reset} ${C.white}${val}${C.reset}`); }

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  logSeparator('🧪 DIAGNOSTIC STEP-BY-STEP — CANALI FAKE BUNGALOW');

  // 1. Token Octorate da Supabase
  const { data: tokenData, error: tokenError } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  if (tokenError || !tokenData?.access_token) {
    logError(`Impossibile recuperare il token Octorate da Supabase: ${tokenError?.message || 'token assente'}`);
    process.exit(1);
  }
  logSuccess('Token OAuth Octorate recuperato da Supabase.');

  const accessToken = tokenData.access_token;
  const clientId = envVars.VITE_OCTORATE_CLIENT_ID || envVars.OCTORATE_CLIENT_ID || '';
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(clientId ? { 'Octorate-Api-Key': clientId } : {})
  };

  const channels = Object.entries(TEST_PRODUCT_IDS);
  let successCount = 0;
  let errorCount = 0;

  console.log(`\n${C.magenta}${C.bold}📋 Canali da sincronizzare: ${channels.length}${C.reset}`);
  console.log(`${C.dim}  Modalità: SEQUENZIALE LENTO (2s tra ogni canale)${C.reset}\n`);

  for (let i = 0; i < channels.length; i++) {
    const [key, roomId] = channels[i];
    logSeparator(`[${i + 1}/${channels.length}] Canale: ${key.toUpperCase()} ➔ ID Octorate: ${roomId}`);

    // FASE 1: Tabula Rasa (reset stagionale)
    const resetStrategy = key === 'be' ? 'open' : 'stopsell';
    const resetPayload = [{
      room: roomId,
      dateFrom: '2026-10-01',
      dateTo: '2027-10-31',
      values: {
        stopSells: resetStrategy === 'stopsell',
        ...(resetStrategy === 'stopsell' ? { closed: true, closedArrival: true, closedDeparture: true } : {})
      }
    }];

    console.log(`${C.yellow}${C.bold}🧹 [FASE 1 — TABULA RASA] Reset stagionale (strategy: ${resetStrategy})${C.reset}`);
    logInfo('📡 [INVIO]   Canale:', `${key} ➔ ID Octorate: ${roomId}`);
    logInfo('📦 [PAYLOAD]:', JSON.stringify(resetPayload, null, 2).split('\n').join('\n             '));

    try {
      const resetRes = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
        method: 'POST',
        headers,
        body: JSON.stringify(resetPayload)
      });
      const resetText = await resetRes.text();
      let resetJson = null;
      try { resetJson = JSON.parse(resetText); } catch {}

      logInfo('📥 [RISPOSTA OCTORATE]:', `HTTP ${resetRes.status} ${resetRes.ok ? '✅' : '❌'}`);
      logInfo('   [CORPO]:', resetText.slice(0, 200));

      if (!resetRes.ok || resetJson?.success === false) {
        logWarn(`Tabula Rasa FALLITA per ${key}: ${resetText.slice(0, 100)}`);
      } else {
        logSuccess(`Tabula Rasa OK per ${key}`);
      }
    } catch (e) {
      logError(`Errore di rete durante Tabula Rasa per ${key}: ${e.message}`);
    }

    // FASE 2: Applicazione periodi pianificati
    console.log(`\n${C.blue}${C.bold}📅 [FASE 2 — PERIODI] Applicazione ${SIMULATED_PERIODS.length} periodi...${C.reset}`);

    for (const period of SIMULATED_PERIODS) {
      const periodPayload = [{
        room: roomId,
        dateFrom: period.dateFrom,
        dateTo: period.dateTo,
        values: {
          stopSells: period.stopSell,
          ...(period.closedToArrival ? { closed: true, closedArrival: true } : {}),
          ...(period.closedToDeparture ? { closedDeparture: true } : {})
        }
      }];

      logInfo(`\n  📡 [INVIO]   Periodo "${period.name}":`, `${period.dateFrom} ➔ ${period.dateTo}`);
      logInfo('  📦 [PAYLOAD]:', JSON.stringify(periodPayload, null, 2).split('\n').join('\n               '));

      try {
        const pRes = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
          method: 'POST',
          headers,
          body: JSON.stringify(periodPayload)
        });
        const pText = await pRes.text();
        let pJson = null;
        try { pJson = JSON.parse(pText); } catch {}

        logInfo('  📥 [RISPOSTA]:', `HTTP ${pRes.status} ${pRes.ok ? '✅' : '❌'}`);
        logInfo('     [CORPO]:  ', pText.slice(0, 200));

        if (!pRes.ok || pJson?.success === false) {
          logError(`Errore Octorate per ${key} / "${period.name}": ${pText.slice(0, 150)}`);
          errorCount++;
        } else {
          logSuccess(`Periodo "${period.name}" OK per ${key} (process: ${pJson?.process?.[0] ?? 'n/a'})`);
          successCount++;
        }
      } catch (e) {
        logError(`Errore di rete durante il periodo "${period.name}" per ${key}: ${e.message}`);
        errorCount++;
      }
    }

    if (i < channels.length - 1) {
      console.log(`\n${C.dim}  ⏳ Attesa 2 secondi prima del prossimo canale...${C.reset}`);
      await sleep(2000);
    }
  }

  // ── Report finale ─────────────────────────────────────────────────────────────
  logSeparator('📊 REPORT FINALE');
  logInfo('Canali processati:  ', String(channels.length));
  logInfo('Periodi OK:         ', `${C.green}${C.bold}${successCount}${C.reset}`);
  logInfo('Errori/Warning:     ', errorCount > 0 ? `${C.red}${C.bold}${errorCount}${C.reset}` : `${C.green}0${C.reset}`);
  if (errorCount === 0) {
    logSuccess('Diagnostica completata senza errori!');
  } else {
    logWarn(`Diagnostica completata con ${errorCount} errore/i. Controlla i log sopra.`);
  }
  console.log('');
}

main().catch(e => {
  console.error(`\x1b[41m\x1b[1m ERRORE FATALE: ${e.message} \x1b[0m`);
  process.exit(1);
});
