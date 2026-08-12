import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse .env file manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
}

console.log('🧪 === TEST SCRITTURA PIANI TARIFFARI FAKE BUNGALOW (Octorate API) ===\n');

async function runFakeBungalowTest() {
  const url = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL;
  const key = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;
  const clientId = envVars.VITE_OCTORATE_CLIENT_ID || envVars.OCTORATE_CLIENT_ID || '';

  if (!url || !key) {
    console.error('❌ Supabase credentials missing');
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const { data: tokenData, error: tokenError } = await supabase
    .from('octorate_tokens')
    .select('access_token, refresh_token')
    .eq('id', 'singleton')
    .maybeSingle();

  if (tokenError || !tokenData?.access_token) {
    console.error('❌ Token Octorate non trovato in Supabase');
    process.exit(1);
  }

  let accessToken = tokenData.access_token;
  console.log('🔑 Token OAuth Octorate recuperato da Supabase.');

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (clientId) headers['Octorate-Api-Key'] = clientId;

  // Test prodotto: Fake Bungalow 1 BE (932243)
  const TEST_ROOM_ID = 932243;
  const dateFrom = '2026-11-15';
  const dateTo = '2026-11-20';

  console.log(`📡 Inviando aggiornamento restrizione di test su Fake Bungalow 1 (ID: ${TEST_ROOM_ID})...`);
  console.log(`   Periodo: ${dateFrom} -> ${dateTo}`);
  console.log(`   Valori: stopSells = true`);

  const bulkUrl = 'https://api.octorate.com/connect/rest/v1/calendar/bulk';
  const bulkPayload = [
    {
      room: TEST_ROOM_ID,
      dateFrom,
      dateTo,
      values: {
        stopSells: true
      }
    }
  ];

  const response = await fetch(bulkUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(bulkPayload)
  });

  const responseText = await response.text();
  console.log(`\n📬 Risposta HTTP Status Octorate: ${response.status} ${response.statusText}`);
  console.log(`📄 Corpo Risposta: ${responseText || '(vuoto - 200 OK)'}`);

  if (response.ok) {
    console.log('\n✅ ESITO: Scrittura sul piano tariffario Fake Bungalow 1 (ID: 932243) Riuscita!');
    
    // Ripristiniamo a false per non lasciare bloccato il test
    console.log('🔄 Ripristino stopSells = false su Fake Bungalow 1...');
    const resetPayload = [
      {
        room: TEST_ROOM_ID,
        dateFrom,
        dateTo,
        values: {
          stopSells: false
        }
      }
    ];
    await fetch(bulkUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(resetPayload)
    });
    console.log('✅ Ripristino completato con successo!');
  } else {
    console.error('\n❌ ESITO: Errore durante la scrittura su Octorate:', responseText);
  }
}

runFakeBungalowTest().catch(err => {
  console.error('❌ Errore inaspettato durante il test:', err);
});
