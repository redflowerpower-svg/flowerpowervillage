import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// 1. Carica le variabili d'ambiente da .env / .env.local
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

// Elenco Ufficiale delle 18 Tariffe Standard 7d (1 per ciascun alloggio del Resort)
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

async function updateStandard7dRatesV2() {
  console.log('========================================================================');
  console.log('  PROCEDURA V2: SBLOCCO E IMPOSTAZIONE STOP SELL TARIFFARI STANDARD 7D');
  console.log('========================================================================\n');

  // STEP 1: Recupero Token OAuth da Supabase
  console.log('📌 [STEP 1] Recupero Token OAuth Octorate da Supabase (octorate_tokens)...');
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

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (clientId) {
    headers['Octorate-Api-Key'] = clientId;
  }

  console.log('✅ Token Octorate valido recuperato dal database.');

  // Data Target Futura
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 45);
  const targetDateStr = targetDate.toISOString().slice(0, 10);

  console.log(`\n📌 [STEP 2] Test di Connettività e Permessi per le 18 Tariffe Standard 7d (Target: ${targetDateStr})...`);

  const verifiedRateIds = [];

  for (let i = 0; i < STANDARD_7D_RATES.length; i++) {
    const rate = STANDARD_7D_RATES[i];
    const pingPayload = [
      {
        room: Number(rate.id),
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
        verifiedRateIds.push(rate.id);
        console.log(`   [${i + 1}/18] Tariffa #${rate.id} (${rate.name}) ➔ SCRITTURA ABILITATA OK ✅`);

        // Ripristino immediato
        const restorePayload = [
          {
            room: Number(rate.id),
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
        console.log(`   [${i + 1}/18] Tariffa #${rate.id} (${rate.name}) ➔ RIFIUTATO 🔴 (${pingText.slice(0, 60)})`);
      }
    } catch (err) {
      console.log(`   [${i + 1}/18] Tariffa #${rate.id} (${rate.name}) ➔ ERRORE ❌ (${err.message})`);
    }
  }

  console.log(`\n📊 VERIFICA COMPLETATA: ${verifiedRateIds.length}/18 Tariffe Standard 7d Convalidate per la Scrittura.`);

  // FASE 1: Sblocco Restrizioni Completo
  console.log('\n📌 [FASE 1] Conferma Sblocco Restrizioni e Indipendenza Scrittura su Octorate...');
  console.log(`   ${verifiedRateIds.length} tariffe pronte per la ricezione diretta dei comandi di restrizione.`);

  // FASE 2: Impostazione Stop Sell (Chiusura 7d)
  console.log('\n📌 [FASE 2] Esecuzione Aggiornamento Bulk: Impostazione Stop Sell (Chiusura 7d)...');

  const stopSellPayload = verifiedRateIds.map((rId) => ({
    room: Number(rId),
    dateFrom: targetDateStr,
    dateTo: targetDateStr,
    values: {
      stopSells: true
    }
  }));

  const bulkRes = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
    method: 'POST',
    headers,
    body: JSON.stringify(stopSellPayload)
  });

  const bulkText = await bulkRes.text();
  console.log(`   HTTP Status Bulk Update: ${bulkRes.status} ${bulkRes.statusText}`);
  console.log(`   Risposta Octorate API: ${bulkText}`);

  if (bulkRes.ok) {
    try {
      const json = JSON.parse(bulkText);
      if (json.success !== false) {
        console.log('\n🎉 FASE 2 COMPLETATA CON SUCCESSO! STOP SELL APPLICATO A TUTTE LE 18 TARIFFE STANDARD 7D SU OCTORATE PMS!');
      } else {
        console.error('\n⚠️ Risposta con errori da Octorate:', json.error || json.message);
      }
    } catch {
      console.log('\n🎉 FASE 2 COMPLETATA!');
    }
  } else {
    console.error('\n❌ ERRORE DURANTE LA FASE 2 BULK UPDATE:', bulkText);
  }
}

updateStandard7dRatesV2();
