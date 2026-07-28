import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// 1. Parsing manuale file .env locale
const envPath = path.resolve(process.cwd(), '.env');
const envVars = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  }
}

const supabaseUrl = envVars.SUPABASE_URL || envVars.VITE_SUPABASE_URL;
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;

console.log('====================================================');
console.log('  TEST ISOLATO DIAGNOSTICA API OCTORATE (REST v1)  ');
console.log('====================================================\n');

async function runDiagnostics() {
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Supabase credentials missing in .env');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // 1. Prelievo OAuth Token da Supabase
  console.log('📌 [STEP 1] Recupero Token OAuth da Supabase database...');
  const { data: tokenData, error: tokenError } = await supabase
    .from('octorate_tokens')
    .select('access_token, refresh_token')
    .eq('id', 'singleton')
    .maybeSingle();

  if (tokenError || !tokenData?.access_token) {
    console.error('❌ Impossibile recuperare access_token da Supabase:', tokenError?.message || 'Token mancante');
    return;
  }

  let accessToken = tokenData.access_token;
  let refreshToken = tokenData.refresh_token;
  const apiKey = envVars.VITE_OCTORATE_CLIENT_ID || envVars.OCTORATE_API_KEY || envVars.OCTORATE_SECRET_KEY || '';
  const clientSecret = envVars.OCTORATE_SECRET_KEY || envVars.OCTORATE_CLIENT_SECRET || '';
  const structureId = envVars.VITE_OCTORATE_STRUCTURE_ID || '366879';
  const channelId = envVars.VITE_OCTORATE_CHANNEL_ID || '233';

  // Function to perform token refresh
  async function refreshAccessToken() {
    console.log('🔄 Tentativo di Refresh Token via POST /rest/v1/identity/refresh...');
    try {
      const refreshParams = new URLSearchParams();
      refreshParams.append('client_id', apiKey);
      refreshParams.append('client_secret', clientSecret);
      refreshParams.append('refresh_token', refreshToken);

      const res = await fetch('https://api.octorate.com/connect/rest/v1/identity/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: refreshParams.toString()
      });

      const text = await res.text();
      console.log(`   Refresh HTTP Status: ${res.status}`);
      if (res.ok) {
        const json = JSON.parse(text);
        if (json.access_token) {
          accessToken = json.access_token;
          if (json.refresh_token) refreshToken = json.refresh_token;

          // Aggiornamento Supabase
          await supabase
            .from('octorate_tokens')
            .upsert({
              id: 'singleton',
              access_token: accessToken,
              refresh_token: refreshToken,
              updated_at: new Date().toISOString()
            });

          console.log('   ✅ Token rinnovato ed aggiornato su Supabase!');
          return true;
        }
      } else {
        console.error('   ❌ Fallimento Refresh:', text);
      }
    } catch (err) {
      console.error('   ❌ Eccezione durante Refresh:', err.message);
    }
    return false;
  }

  // Proviamo prima con il token attuale
  let headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (apiKey) {
    headers['Octorate-Api-Key'] = apiKey;
  }

  const todayISO = new Date().toISOString().substring(0, 10);
  const nextWeekISO = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
  const calendarUrl = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${todayISO}&dateTo=${nextWeekISO}&size=5&page=0`;

  console.log('\n📌 [TEST 1A] Verifico validità token con GET /calendar/' + structureId + '...');
  let res = await fetch(calendarUrl, { method: 'GET', headers });

  if (res.status === 403 || res.status === 401) {
    console.log('⚠️ Token scaduto (403/401). Eseguo Refresh...');
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      res = await fetch(calendarUrl, { method: 'GET', headers });
    }
  }

  console.log(`   HTTP Status Lettura Calendario: ${res.status} ${res.statusText}`);
  const text = await res.text();
  if (res.ok) {
    console.log('   ✅ REST GET Calendar OK. Campione risposte:');
    try {
      const json = JSON.parse(text);
      console.log('   Data items count:', json?.data?.length || 0);
      if (json?.data?.length > 0) {
        console.log('   Sample Item:', JSON.stringify(json.data[0], null, 2));
      }
    } catch {
      console.log('   Raw Text:', text.substring(0, 300));
    }
  } else {
    console.log('   ❌ GET Calendar Notice:', text);
  }

  // TEST 2: Scrittura Controllata via POST /rest/v1/calendar/bulk
  console.log('\n📌 [TEST 2] Test Scrittura Controllata via POST /rest/v1/calendar/bulk (dalla Spec OpenAPI Octorate)...');

  const bulkPayload = [
    {
      room: 529773, // Jungle Villa Mother Room ID
      dateFrom: todayISO,
      dateTo: todayISO,
      values: {
        minstay: 2
      }
    }
  ];

  const writeAttempts = [
    {
      name: 'OFFICIAL API: POST /rest/v1/calendar/bulk',
      url: 'https://api.octorate.com/connect/rest/v1/calendar/bulk',
      method: 'POST',
      body: bulkPayload
    }
  ];

  for (const attempt of writeAttempts) {
    console.log(`\n   🔹 Tentativo ${attempt.name}...`);
    try {
      const octRes = await fetch(attempt.url, {
        method: attempt.method,
        headers,
        body: JSON.stringify(attempt.body)
      });
      const resText = await octRes.text();
      console.log(`      Risposta Status: ${octRes.status} ${octRes.statusText}`);
      console.log(`      Body Risposta Completo: ${resText}`);
    } catch (err) {
      console.error(`      Errore Fetch: ${err.message}`);
    }
  }

  console.log('\n====================================================');
  console.log('  TEST ISOLATO COMPLETATO SENZA ALTERARE IL CODICE  ');
  console.log('====================================================\n');
}

runDiagnostics().catch(console.error);
