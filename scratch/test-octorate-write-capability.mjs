import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { decryptVault } from './vault-sync.mjs';

// Parse .env file
function loadEnvironment() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    try {
      decryptVault();
    } catch (err) {
      console.warn('⚠️ Vault decrypt warning:', err.message);
    }
  }

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
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

loadEnvironment();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Supabase credentials missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testWriteCapability() {
  console.log('========================================================================');
  console.log('  TEST ISOLATO PERMESSI ACCOUNT & SCRITTURA OCTORATE CALENDAR  ');
  console.log('========================================================================\n');

  // 1. Recupero token OAuth da Supabase
  console.log('📌 [STEP 1] Recupero token OAuth da Supabase (tabelle octorate_tokens)...');
  const { data: tokenData, error: tokenError } = await supabase
    .from('octorate_tokens')
    .select('access_token, refresh_token')
    .eq('id', 'singleton')
    .maybeSingle();

  if (tokenError || !tokenData?.access_token) {
    console.error('❌ Access token non disponibile nel DB:', tokenError?.message || 'Token vuoto');
    process.exit(1);
  }

  let accessToken = tokenData.access_token;
  let refreshToken = tokenData.refresh_token;

  const clientId = process.env.VITE_OCTORATE_CLIENT_ID || process.env.OCTORATE_CLIENT_ID || '';
  const clientSecret = process.env.OCTORATE_SECRET_KEY || process.env.VITE_OCTORATE_SECRET_KEY || '';

  // Function to refresh OAuth token
  async function refreshAccessToken() {
    console.log('🔄 Tentativo di Refresh Token via POST /rest/v1/identity/refresh...');
    try {
      const refreshParams = new URLSearchParams();
      refreshParams.append('grant_type', 'refresh_token');
      refreshParams.append('client_id', clientId);
      refreshParams.append('client_secret', clientSecret);
      refreshParams.append('refresh_token', refreshToken);

      const res = await fetch('https://api.octorate.com/connect/rest/v1/identity/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: refreshParams.toString()
      });

      const text = await res.text();
      console.log(`   Refresh HTTP Status: ${res.status} ${res.statusText}`);
      if (res.ok) {
        const json = JSON.parse(text);
        if (json.access_token) {
          accessToken = json.access_token;
          if (json.refresh_token) refreshToken = json.refresh_token;

          await supabase.from('octorate_tokens').upsert({
            id: 'singleton',
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: json.expires_in,
            updated_at: new Date().toISOString()
          });

          console.log('   ✅ Access Token rinnovato con successo!');
          return true;
        }
      } else {
        console.error('   ❌ Fallimento Refresh Token:', text);
      }
    } catch (err) {
      console.error('   ❌ Eccezione durante Refresh:', err.message);
    }
    return false;
  }

  const getHeaders = (token) => {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (clientId) {
      headers['Octorate-Api-Key'] = clientId;
    }
    return headers;
  };

  // 2. GET https://api.octorate.com/connect/rest/v1/api/configuration
  console.log('\n📌 [STEP 2] Verifico permessi correnti via GET /rest/v1/api/configuration...');
  const configUrl = 'https://api.octorate.com/connect/rest/v1/api/configuration';
  let configRes = await fetch(configUrl, {
    method: 'GET',
    headers: getHeaders(accessToken)
  });

  let configText = await configRes.text();
  let configJson = null;
  try {
    configJson = JSON.parse(configText);
  } catch {}

  if ((configRes.status === 401 || (configRes.status === 403 && configJson?.type === 'ApiLoginExpired')) && refreshToken) {
    console.log(`⚠️ HTTP ${configRes.status} (${configJson?.message || 'Token Scaduto'}) durante GET configuration. Tento il Refresh Token...`);
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      configRes = await fetch(configUrl, {
        method: 'GET',
        headers: getHeaders(accessToken)
      });
      configText = await configRes.text();
      try { configJson = JSON.parse(configText); } catch {}
    }
  }

  console.log(`   HTTP Status Configuration: ${configRes.status} ${configRes.statusText}`);

  let accommodationPerm = 'DESCONOSCIUTO';
  if (configRes.ok && configJson) {
    console.log('\n   📋 RISPOSTA CONFIGURAZIONE API OCTORATE:');
    console.log(`   - ID / Member ID: ${configJson.id || 'N/A'}`);
    console.log(`   - Nome Account  : ${configJson.name || 'N/A'}`);
    
    const permissions = configJson.permissions || {};
    accommodationPerm = permissions.accommodation || 'N/A';

    console.log('\n   🔐 QUADRO PERMESSI ACCOUNT (permissions):');
    console.log(`     ► accommodation : ${accommodationPerm} ${accommodationPerm === 'READWRITE' ? '✅' : '🔴 (Richiede READWRITE per la scrittura)'}`);
    console.log(`     ► reservation   : ${permissions.reservation || 'N/A'}`);
    console.log(`     ► content       : ${permissions.content || 'N/A'}`);
    console.log(`     ► cardDetail    : ${permissions.cardDetail || 'N/A'}`);
    console.log(`     ► license       : ${permissions.license || 'N/A'}`);
  } else {
    console.log('   ❌ Impossibile leggere la configurazione:', configText);
  }

  // 3. POST https://api.octorate.com/connect/rest/v1/calendar/bulk
  const bulkPayload = [
    {
      room: 529773,
      dateFrom: '2026-12-21',
      dateTo: '2026-12-21',
      values: {
        minstay: 5,
        price: 120.00,
        availability: 1,
        stopSells: false,
        closeToArrival: false
      }
    }
  ];

  const bulkUrl = 'https://api.octorate.com/connect/rest/v1/calendar/bulk';

  console.log('\n📌 [STEP 3] Invio richiesta POST /rest/v1/calendar/bulk con payload di test...');
  console.log(`   Target URL: ${bulkUrl}`);
  console.log(`   Payload: ${JSON.stringify(bulkPayload, null, 2)}`);

  let bulkRes = await fetch(bulkUrl, {
    method: 'POST',
    headers: getHeaders(accessToken),
    body: JSON.stringify(bulkPayload)
  });

  let bulkText = await bulkRes.text();
  let bulkJson = null;
  try {
    bulkJson = JSON.parse(bulkText);
  } catch {}

  if ((bulkRes.status === 401 || (bulkRes.status === 403 && bulkJson?.type === 'ApiLoginExpired')) && refreshToken) {
    console.log(`\n⚠️ HTTP ${bulkRes.status} (${bulkJson?.message || 'Token Scaduto'}) durante POST bulk. Tento il Refresh Token...`);
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      bulkRes = await fetch(bulkUrl, {
        method: 'POST',
        headers: getHeaders(accessToken),
        body: JSON.stringify(bulkPayload)
      });
      bulkText = await bulkRes.text();
      try { bulkJson = JSON.parse(bulkText); } catch {}
    }
  }


  console.log('\n========================================================================');
  console.log('                  ESITO RISPOSTA SCRITTURA OCTORATE                    ');
  console.log('========================================================================');
  console.log(`HTTP Status Code : ${bulkRes.status} ${bulkRes.statusText}`);
  console.log('Corpo Risposta   :');
  console.log(bulkJson ? JSON.stringify(bulkJson, null, 2) : bulkText);

  // 4. Riepilogo finale incrociato
  console.log('\n========================================================================');
  console.log('                     📊 RIEPILOGO FINALE INCROCIATO                      ');
  console.log('========================================================================');
  console.log(`Permesso 'accommodation' rilevato: ${accommodationPerm}`);
  console.log(`Esito chiamata POST /calendar/bulk   : ${bulkRes.status} ${bulkRes.statusText}`);
  console.log('------------------------------------------------------------------------');

  if (bulkRes.ok) {
    console.log('🎉 SCRITTURA RIUSCITA (200 OK)! L\'applicazione dispone dei permessi di scrittura ed opera correttamente su Octorate.');
  } else if (accommodationPerm === 'READONLY' && bulkRes.status === 403) {
    console.log('🔴 CONFERMATO AL 100%:');
    console.log('   Il campo permissions.accommodation è impostato su READONLY.');
    console.log('   L\'errore 403 "Caller not in requested role" è causato dal livello di autorizzazione dell\'account.');
    console.log('   👉 AZIONE RICHIESTA: Chiedere al supporto Octorate di cambiare il permesso "accommodation" da READONLY a READWRITE per questo Client ID.');
  } else if (accommodationPerm === 'READWRITE' && !bulkRes.ok) {
    console.log('⚠️ ANOMALIA DA INVESTIGARE:');
    console.log('   Il campo permissions.accommodation risulta READWRITE, ma la scrittura fallisce comunque con errore ' + bulkRes.status + '.');
    console.log('   Il problema non riguarda i permessi generali di categoria ma la struttura del payload o lo scope del token.');
  } else {
    console.log(`⚠️ RISULTATO: Permessi = ${accommodationPerm} | Status Scrittura = ${bulkRes.status}. Controllare i dettagli sopra.`);
  }
  console.log('========================================================================\n');
}

testWriteCapability().catch(console.error);
