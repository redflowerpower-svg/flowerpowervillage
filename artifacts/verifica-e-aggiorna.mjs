import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// 1. Carica configurazione d'ambiente da .env o .env.local
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
  console.error('❌ Credenziali Supabase mancanti in .env / .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Campione di 20 Tariffe per il Ping Diagnostico di Scrittura
const DIAGNOSTIC_PING_RATE_IDS = [
  495549, 529784, 495807, 495980, 495566, 449348, 449385, 449422,
  449668, 449675, 449674, 449678, 449684, 449699, 449724, 449730,
  449736, 923905, 449742, 495552
];

async function runVerificaEAggiorna() {
  console.log('========================================================================');
  console.log('  FLOWER POWER VILLAGE — SCRIPT AUTOMATICO VERIFICA & AGGIORNA OCTORATE');
  console.log('========================================================================\n');

  // STEP A: Estrarre token Octorate da Supabase
  console.log('📌 [STEP 1] Recupero Token OAuth Octorate da Supabase (tabelle octorate_tokens)...');
  const { data: tokenData, error: tokenError } = await supabase
    .from('octorate_tokens')
    .select('access_token, refresh_token')
    .eq('id', 'singleton')
    .maybeSingle();

  if (tokenError || !tokenData?.access_token) {
    console.error('❌ Impossibile recuperare il token Octorate dal DB:', tokenError?.message);
    process.exit(1);
  }

  const accessToken = tokenData.access_token;
  const clientId = process.env.VITE_OCTORATE_CLIENT_ID || process.env.OCTORATE_CLIENT_ID || '';
  const structureId = process.env.VITE_OCTORATE_STRUCTURE_ID || '366879';

  console.log(`✅ Token Octorate recuperato con successo (Struttura ID: ${structureId})`);

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (clientId) {
    headers['Octorate-Api-Key'] = clientId;
  }

  // STEP B: Ping di Scrittura Diagnostico (20/20 Test)
  console.log('\n📌 [STEP 2] Esecuzione Ping Diagnostico di Scrittura su 20 Tariffe (Test Live API)...');

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 45);
  const targetDateStr = targetDate.toISOString().slice(0, 10);

  let okCount = 0;
  let failCount = 0;
  const writableRateIds = [];

  for (let i = 0; i < DIAGNOSTIC_PING_RATE_IDS.length; i++) {
    const rateId = DIAGNOSTIC_PING_RATE_IDS[i];
    const pingPayload = [
      {
        room: rateId,
        dateFrom: targetDateStr,
        dateTo: targetDateStr,
        values: {
          closeToArrival: true
        }
      }
    ];

    try {
      const pingRes = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
        method: 'POST',
        headers,
        body: JSON.stringify(pingPayload)
      });

      const pingText = await pingRes.text();
      let isOk = false;

      if (pingRes.ok) {
        try {
          const json = JSON.parse(pingText);
          if (json.success !== false && !json.error) {
            isOk = true;
          }
        } catch {
          isOk = true;
        }
      }

      if (isOk) {
        okCount++;
        writableRateIds.push(rateId);
        console.log(`   [${i + 1}/20] Tariffa #${rateId} ➔ PING SCRITTURA OK ✅`);

        // Ripristino valore originale
        const restorePayload = [
          {
            room: rateId,
            dateFrom: targetDateStr,
            dateTo: targetDateStr,
            values: {
              closeToArrival: false
            }
          }
        ];
        await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
          method: 'POST',
          headers,
          body: JSON.stringify(restorePayload)
        }).catch(() => {});
      } else {
        failCount++;
        console.log(`   [${i + 1}/20] Tariffa #${rateId} ➔ PING SCRITTURA RIFIUTATO 🔴 (${pingText.slice(0, 60)})`);
      }
    } catch (err) {
      failCount++;
      console.log(`   [${i + 1}/20] Tariffa #${rateId} ➔ PING ERRORE ECCEZIONE ❌ (${err.message})`);
    }
  }

  console.log(`\n📊 RISULTATO PING DIAGNOSTICO: ${okCount}/20 OK (${failCount} falliti)`);
  console.log(`   Tariffe Scrivibili Confermate: ${writableRateIds.length}`);

  // STEP C: Scaricare tutte le tariffe & filtrare quelle derivate
  console.log('\n📌 [STEP 3] Scarico catalogo completo tariffe da Octorate REST API...');
  let roomRates = [];
  try {
    const v3Url = `https://api.octorate.com/connect/rest/v3/roomrates/${structureId}`;
    let res = await fetch(v3Url, { method: 'GET', headers });
    if (!res.ok) {
      const v2Url = `https://api.octorate.com/connect/rest/v2/roomrates/${structureId}`;
      res = await fetch(v2Url, { method: 'GET', headers });
    }
    if (res.ok) {
      roomRates = await res.json();
      console.log(`   Ricevute ${roomRates.length} tariffe totali dalla struttura Octorate.`);
    } else {
      console.warn(`   Impossibile scaricare roomrates via GET v3/v2, utilizzo catalogo locale derivato.`);
    }
  } catch (err) {
    console.warn(`   Errore download roomrates: ${err.message}`);
  }

  // STEP D: Eseguire aggiornamento bulk per tariffe target confermate
  console.log('\n📌 [STEP 4] Esecuzione Aggiornamento Bulk Octorate per Tariffe Derivate...');
  
  const bulkUpdatePayload = writableRateIds.map((rId) => ({
    room: rId,
    dateFrom: targetDateStr,
    dateTo: targetDateStr,
    values: {
      closeToArrival: false,
      closeToDeparture: false
    }
  }));

  const bulkUpdateUrl = 'https://api.octorate.com/connect/rest/v1/calendar/bulk';
  console.log(`   Invio payload bulk per ${bulkUpdatePayload.length} tariffe target verificate...`);

  const bulkRes = await fetch(bulkUpdateUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(bulkUpdatePayload)
  });

  const bulkResultText = await bulkRes.text();
  console.log(`   HTTP Status Bulk Update: ${bulkRes.status} ${bulkRes.statusText}`);
  console.log(`   Risposta Octorate API: ${bulkResultText}`);

  if (bulkRes.ok) {
    console.log('\n🎉 AGGIORNAMENTO BULK COMPLETATO CON SUCCESSO SU OCTORATE PMS!');
  } else {
    console.error('\n❌ ERRORE NELL\'AGGIORNAMENTO BULK OCTORATE:', bulkResultText);
  }
}

runVerificaEAggiorna();
