import fs from 'fs';
import path from 'path';
import http from 'http';
import esbuild from 'esbuild';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { decryptVault } from './vault-sync.mjs';

// Global report accumulator
const reportResults = [];

function recordResult(name, route, method, statusCode, statusText, details, isOk) {
  reportResults.push({
    name,
    route,
    method,
    statusCode,
    statusText,
    details,
    isOk
  });
}

// 1. Caricamento e allineamento ambiente locale
function setupEnvironment() {
  const envPath = path.resolve(process.cwd(), '.env');
  const envLocalPath = path.resolve(process.cwd(), '.env.local');

  function parseEnvFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
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

  parseEnvFile(envPath);
  parseEnvFile(envLocalPath);

  // If critical keys are missing, attempt vault decryption
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.VITE_SUPABASE_URL) {
    console.log('⚠️ Credenziali mancanti in ambiente. Avvio decifratura Vault...');
    try {
      decryptVault();
      parseEnvFile(envPath);
      parseEnvFile(envLocalPath);
    } catch (err) {
      console.warn('⚠️ Errore decifratura Vault:', err.message);
    }
  }

  if (!process.env.STRIPE_TARGET) {
    process.env.STRIPE_TARGET = 'TEST';
  }
}

// Track temporary compiled files for cleanup
const tmpFiles = [];

// Helper to bundle TypeScript serverless endpoints into temporary ESM files
function bundleServerlessHandler(tsRelativePath, tmpFileName) {
  const tsPath = path.resolve(process.cwd(), tsRelativePath);
  const tmpPath = path.resolve(process.cwd(), `scratch/${tmpFileName}`);

  esbuild.buildSync({
    entryPoints: [tsPath],
    outfile: tmpPath,
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external'
  });

  tmpFiles.push(tmpPath);
  return tmpPath;
}

// Vercel Request/Response Adapter for local HTTP Server
function adaptVercelHandler(handler) {
  return async (req, res) => {
    let bodyData = '';
    req.on('data', chunk => { bodyData += chunk; });
    req.on('end', async () => {
      let parsedBody = {};
      if (bodyData) {
        try { parsedBody = JSON.parse(bodyData); } catch { parsedBody = bodyData; }
      }

      const urlObj = new URL(req.url, `http://${req.headers.host || '127.0.0.1:3099'}`);
      const query = Object.fromEntries(urlObj.searchParams.entries());

      const vercelReq = Object.assign(req, {
        query,
        body: parsedBody,
        method: req.method
      });

      let statusCode = 200;
      let ended = false;

      const vercelRes = {
        status: (code) => {
          statusCode = code;
          res.statusCode = code;
          return vercelRes;
        },
        setHeader: (k, v) => {
          res.setHeader(k, v);
          return vercelRes;
        },
        json: (data) => {
          if (ended) return vercelRes;
          ended = true;
          res.statusCode = statusCode;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return vercelRes;
        },
        send: (data) => {
          if (ended) return vercelRes;
          ended = true;
          res.statusCode = statusCode;
          if (typeof data === 'object') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          } else {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(String(data));
          }
          return vercelRes;
        }
      };

      try {
        await handler(vercelReq, vercelRes);
      } catch (err) {
        if (!ended) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
        }
      }
    });
  };
}

async function runDiagnostics() {
  console.log('========================================================================');
  console.log(' 🚀 SCRIPT DIAGNOSTICA AVANZATA ROTTE API & PORTE - FLOWER POWER VILLAGE ');
  console.log('========================================================================\n');

  setupEnvironment();

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ FATALE: Credenziali Supabase non trovate in .env');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Bundle serverless endpoints on the fly
  console.log('📦 Compilazione ed inizializzazione funzioni Serverless Vercel...');
  const octorateGridPath = bundleServerlessHandler('api/resort/octorate-grid.ts', '.tmp_grid_endpoint.mjs');
  const verifyCheckoutPath = bundleServerlessHandler('api/verify-checkout-session.ts', '.tmp_verify_endpoint.mjs');
  const telegramNotifyPath = bundleServerlessHandler('api/telegram-notify.ts', '.tmp_notify_endpoint.mjs');

  const modGrid = await import('file:///' + octorateGridPath.replace(/\\/g, '/'));
  const modVerify = await import('file:///' + verifyCheckoutPath.replace(/\\/g, '/'));
  const modNotify = await import('file:///' + telegramNotifyPath.replace(/\\/g, '/'));

  // Launch temporary local HTTP server for serverless routes testing
  const server = http.createServer(async (req, res) => {
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const pathname = urlObj.pathname;

    if (pathname === '/api/resort/octorate-grid') {
      return adaptVercelHandler(modGrid.default)(req, res);
    } else if (pathname === '/api/verify-checkout-session') {
      return adaptVercelHandler(modVerify.default)(req, res);
    } else if (pathname === '/api/telegram-notify') {
      return adaptVercelHandler(modNotify.default)(req, res);
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Endpoint non trovato' }));
    }
  });

  const PORT = 3099;
  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
  console.log(`🌐 Server locale di test attivo su: http://127.0.0.1:${PORT}\n`);

  // =========================================================================
  // GROUP 1: SUPABASE TABLES READ CONNECTION
  // =========================================================================
  console.log('------------------------------------------------------------------------');
  console.log('📌 [TEST 1/5] Connessione e Lettura Tabelle Supabase Database');
  console.log('------------------------------------------------------------------------');

  // 1.1 pizza_orders
  try {
    const { data, count, error } = await supabase
      .from('pizza_orders')
      .select('id, customer_name, total, payment_method, status, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.log(`❌ Supabase [pizza_orders]: ${error.message}`);
      recordResult('Supabase Table: pizza_orders', 'pizza_orders', 'SELECT', 500, 'DB Error', error.message, false);
    } else {
      const sample = data && data.length > 0 ? { id: data[0].id, customer: data[0].customer_name, total: data[0].total } : 'Nessun ordine trovato';
      const details = `Totale ordini: ${count} | Campione: ${JSON.stringify(sample)}`;
      console.log(`✅ Supabase [pizza_orders] -> 200 OK | ${details}`);
      recordResult('Supabase Table: pizza_orders', 'pizza_orders', 'SELECT', 200, 'OK', details, true);
    }
  } catch (err) {
    console.log(`❌ Supabase [pizza_orders] Eccezione: ${err.message}`);
    recordResult('Supabase Table: pizza_orders', 'pizza_orders', 'SELECT', 500, 'Exception', err.message, false);
  }

  // 1.2 accommodations
  try {
    const { data, count, error } = await supabase
      .from('accommodations')
      .select('id, name, people_capacity, slug', { count: 'exact' })
      .limit(1);

    if (error) {
      console.log(`❌ Supabase [accommodations]: ${error.message}`);
      recordResult('Supabase Table: accommodations', 'accommodations', 'SELECT', 500, 'DB Error', error.message, false);
    } else {
      const sample = data && data.length > 0 ? { id: data[0].id, name: data[0].name } : 'Nessun alloggio trovato';
      const details = `Totale alloggi: ${count} | Campione: ${JSON.stringify(sample)}`;
      console.log(`✅ Supabase [accommodations] -> 200 OK | ${details}`);
      recordResult('Supabase Table: accommodations', 'accommodations', 'SELECT', 200, 'OK', details, true);
    }
  } catch (err) {
    console.log(`❌ Supabase [accommodations] Eccezione: ${err.message}`);
    recordResult('Supabase Table: accommodations', 'accommodations', 'SELECT', 500, 'Exception', err.message, false);
  }

  // 1.3 octorate_tokens
  try {
    const { data, error } = await supabase
      .from('octorate_tokens')
      .select('id, access_token, refresh_token, updated_at')
      .eq('id', 'singleton')
      .maybeSingle();

    if (error) {
      console.log(`❌ Supabase [octorate_tokens]: ${error.message}`);
      recordResult('Supabase Table: octorate_tokens', 'octorate_tokens', 'SELECT', 500, 'DB Error', error.message, false);
    } else if (!data) {
      console.log(`⚠️ Supabase [octorate_tokens]: Record singleton non trovato`);
      recordResult('Supabase Table: octorate_tokens', 'octorate_tokens', 'SELECT', 404, 'Not Found', 'Record singleton mancante', false);
    } else {
      const tokenSnippet = data.access_token ? `${data.access_token.substring(0, 12)}...` : 'N/A';
      const details = `Access Token: ${tokenSnippet} | Aggiornato il: ${data.updated_at}`;
      console.log(`✅ Supabase [octorate_tokens] -> 200 OK | ${details}`);
      recordResult('Supabase Table: octorate_tokens', 'octorate_tokens', 'SELECT', 200, 'OK', details, true);
    }
  } catch (err) {
    console.log(`❌ Supabase [octorate_tokens] Eccezione: ${err.message}`);
    recordResult('Supabase Table: octorate_tokens', 'octorate_tokens', 'SELECT', 500, 'Exception', err.message, false);
  }

  // =========================================================================
  // GROUP 2: SERVERLESS ENDPOINT OCTORATE GRID (/api/resort/octorate-grid)
  // =========================================================================
  console.log('\n------------------------------------------------------------------------');
  console.log('📌 [TEST 2/5] Endpoint Serverless Octorate Grid (/api/resort/octorate-grid)');
  console.log('------------------------------------------------------------------------');

  const todayISO = new Date().toISOString().substring(0, 10);
  const nextWeekISO = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

  try {
    const gridUrl = `http://127.0.0.1:${PORT}/api/resort/octorate-grid?dateFrom=${todayISO}&dateTo=${nextWeekISO}`;
    const res = await fetch(gridUrl, { method: 'GET' });
    const text = await res.text();
    let json = {};
    try { json = JSON.parse(text); } catch {}

    const isOk = res.status === 200 && json.success === true;
    const sampleRate = json.data && json.data.length > 0 ? { id: json.data[0].id, name: json.data[0].name } : {};
    const details = `Rate Plans BE filtrati: ${json.data?.length || 0} / ${json.totalFetched || 0} totali | Pagine: ${json.pagesCount || 0} | Campione: ${JSON.stringify(sampleRate)}`;

    console.log(`${isOk ? '✅' : '❌'} Serverless [/api/resort/octorate-grid] -> ${res.status} ${res.statusText}`);
    console.log(`   Risposta JSON Sintetica: ${JSON.stringify({ success: json.success, ratePlansCount: json.data?.length, totalFetched: json.totalFetched, pagesCount: json.pagesCount })}`);
    recordResult('Serverless: Octorate Grid', '/api/resort/octorate-grid', 'GET', res.status, res.statusText, details, isOk);
  } catch (err) {
    console.log(`❌ Serverless [/api/resort/octorate-grid] Errore: ${err.message}`);
    recordResult('Serverless: Octorate Grid', '/api/resort/octorate-grid', 'GET', 500, 'Exception', err.message, false);
  }

  // =========================================================================
  // GROUP 3: STRIPE SESSION VERIFICATION & DIRECT STRIPE API
  // =========================================================================
  console.log('\n------------------------------------------------------------------------');
  console.log('📌 [TEST 3/5] Endpoint Verifica Sessione Stripe & Connessione Direct Stripe API');
  console.log('------------------------------------------------------------------------');

  // 3.1 Stripe SDK Direct Connection Test
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY_TEST;
    if (!stripeSecret) {
      console.log('❌ Stripe Direct: Secret Key non trovata');
      recordResult('Stripe API: Direct SDK', 'https://api.stripe.com', 'SDK', 401, 'Missing Key', 'STRIPE_SECRET_KEY mancante', false);
    } else {
      const stripeInstance = new Stripe(stripeSecret);
      const balance = await stripeInstance.balance.retrieve();
      const details = `Connesso OK | Mode: ${balance.livemode ? 'LIVE' : 'TEST'} | Valuta: ${balance.available[0]?.currency.toUpperCase() || 'THB'}`;
      console.log(`✅ Stripe API Direct SDK -> 200 OK | ${details}`);
      recordResult('Stripe API: Direct SDK', 'https://api.stripe.com', 'SDK', 200, 'OK', details, true);
    }
  } catch (err) {
    console.log(`❌ Stripe API Direct SDK Errore: ${err.message}`);
    recordResult('Stripe API: Direct SDK', 'https://api.stripe.com', 'SDK', 500, 'Exception', err.message, false);
  }

  // 3.2 Serverless Endpoint verify-checkout-session with invalid ID (testing route handling & response status)
  try {
    const testSessionId = 'cs_test_diagnostics_check_12345';
    const verifyUrl = `http://127.0.0.1:${PORT}/api/verify-checkout-session?session_id=${testSessionId}`;
    const res = await fetch(verifyUrl, { method: 'GET' });
    const text = await res.text();
    let json = {};
    try { json = JSON.parse(text); } catch {}

    // A status of 400/500 with clear Stripe session error means route is fully functional and communicating with Stripe
    const isHandledCorrectly = res.status >= 400 && json.error;
    const details = `HTTP Status: ${res.status} | Risposta API Stripe: "${json.error || text.substring(0, 100)}"`;

    console.log(`${isHandledCorrectly ? '✅' : '⚠️'} Serverless [/api/verify-checkout-session] -> ${res.status} ${res.statusText}`);
    console.log(`   Risposta JSON Sintetica: ${JSON.stringify(json)}`);
    recordResult('Serverless: Verify Checkout Session', '/api/verify-checkout-session', 'GET', res.status, res.statusText, details, isHandledCorrectly);
  } catch (err) {
    console.log(`❌ Serverless [/api/verify-checkout-session] Errore: ${err.message}`);
    recordResult('Serverless: Verify Checkout Session', '/api/verify-checkout-session', 'GET', 500, 'Exception', err.message, false);
  }

  // =========================================================================
  // GROUP 4: TELEGRAM NOTIFY ENDPOINT & TELEGRAM BOT API
  // =========================================================================
  console.log('\n------------------------------------------------------------------------');
  console.log('📌 [TEST 4/5] Endpoint Notifiche Telegram & Direct Telegram Bot API');
  console.log('------------------------------------------------------------------------');

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // 4.1 Telegram Bot Direct API Test
  if (!botToken) {
    console.log('❌ Telegram Bot API: TELEGRAM_BOT_TOKEN mancante');
    recordResult('Telegram API: getMe', 'https://api.telegram.org/bot/getMe', 'GET', 401, 'Missing Token', 'TELEGRAM_BOT_TOKEN mancante', false);
  } else {
    try {
      const getMeRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const getMeJson = await getMeRes.json();
      if (getMeJson.ok) {
        const details = `Bot Name: @${getMeJson.result.username} | ID: ${getMeJson.result.id} | Target Chat ID: ${chatId || 'Non impostato'}`;
        console.log(`✅ Telegram API [getMe] -> 200 OK | ${details}`);
        recordResult('Telegram API: getMe', 'https://api.telegram.org/bot/getMe', 'GET', 200, 'OK', details, true);
      } else {
        console.log(`❌ Telegram API [getMe]: ${getMeJson.description}`);
        recordResult('Telegram API: getMe', 'https://api.telegram.org/bot/getMe', 'GET', getMeRes.status, 'Error', getMeJson.description, false);
      }
    } catch (err) {
      console.log(`❌ Telegram API [getMe] Errore: ${err.message}`);
      recordResult('Telegram API: getMe', 'https://api.telegram.org/bot/getMe', 'GET', 500, 'Exception', err.message, false);
    }
  }

  // 4.2 Serverless Endpoint telegram-notify (test with non-existent order ID to test route handling)
  try {
    const notifyUrl = `http://127.0.0.1:${PORT}/api/telegram-notify`;
    const res = await fetch(notifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: '00000000-0000-0000-0000-000000000000' })
    });
    const text = await res.text();
    let json = {};
    try { json = JSON.parse(text); } catch {}

    const isHandledCorrectly = (res.status === 404 || res.status === 200) && (json.error || json.message || json.success);
    const details = `HTTP Status: ${res.status} | Esito DB & Bot: "${json.error || json.message || 'OK'}"`;

    console.log(`${isHandledCorrectly ? '✅' : '⚠️'} Serverless [/api/telegram-notify] -> ${res.status} ${res.statusText}`);
    console.log(`   Risposta JSON Sintetica: ${JSON.stringify(json)}`);
    recordResult('Serverless: Telegram Notify', '/api/telegram-notify', 'POST', res.status, res.statusText, details, isHandledCorrectly);
  } catch (err) {
    console.log(`❌ Serverless [/api/telegram-notify] Errore: ${err.message}`);
    recordResult('Serverless: Telegram Notify', '/api/telegram-notify', 'POST', 500, 'Exception', err.message, false);
  }

  // =========================================================================
  // GROUP 5: LIVE OCTORATE REST V1 CALENDAR ENDPOINT (GET /rest/v1/calendar/366879)
  // =========================================================================
  console.log('\n------------------------------------------------------------------------');
  console.log('📌 [TEST 5/5] Endpoint Lettura Calendario Octorate Live (GET /rest/v1/calendar/366879)');
  console.log('------------------------------------------------------------------------');

  try {
    const structureId = process.env.VITE_OCTORATE_STRUCTURE_ID || '366879';
    const clientId = process.env.VITE_OCTORATE_CLIENT_ID;
    const clientSecret = process.env.OCTORATE_SECRET_KEY || process.env.VITE_OCTORATE_SECRET_KEY;

    // Fetch stored OAuth tokens from Supabase
    const { data: tokenData } = await supabase
      .from('octorate_tokens')
      .select('access_token, refresh_token')
      .eq('id', 'singleton')
      .maybeSingle();

    let accessToken = tokenData?.access_token;
    let refreshToken = tokenData?.refresh_token;

    if (!accessToken) {
      console.log('❌ Octorate Live Calendar: Nessun access_token presente nel DB Supabase');
      recordResult('Octorate Live API: GET /calendar/' + structureId, `/connect/rest/v1/calendar/${structureId}`, 'GET', 401, 'No Token', 'Token OAuth mancante nel DB', false);
    } else {
      const calendarUrl = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${todayISO}&dateTo=${nextWeekISO}&size=5&page=0`;

      let octRes = await fetch(calendarUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      // Token Refresh logic if 401 / 403
      if ((octRes.status === 401 || octRes.status === 403) && refreshToken && clientId && clientSecret) {
        console.log('⚠️ Access Token scaduto o non valido. Tentativo di Refresh via /rest/v1/identity/refresh...');
        const refreshParams = new URLSearchParams();
        refreshParams.append('grant_type', 'refresh_token');
        refreshParams.append('client_id', clientId);
        refreshParams.append('client_secret', clientSecret);
        refreshParams.append('refresh_token', refreshToken);

        const refreshRes = await fetch('https://api.octorate.com/connect/rest/v1/identity/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: refreshParams.toString()
        });

        if (refreshRes.ok) {
          const newTokens = await refreshRes.json();
          accessToken = newTokens.access_token;
          if (newTokens.refresh_token) refreshToken = newTokens.refresh_token;

          await supabase.from('octorate_tokens').upsert({
            id: 'singleton',
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: newTokens.expires_in,
            updated_at: new Date().toISOString()
          });
          console.log('✅ Token Octorate rinnovato ed aggiornato su Supabase!');

          // Retry GET calendar request
          octRes = await fetch(calendarUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          });
        }
      }

      const octText = await octRes.text();
      let octJson = {};
      try { octJson = JSON.parse(octText); } catch {}

      const isOk = octRes.ok && (Array.isArray(octJson.data) || Array.isArray(octJson));
      const itemsList = Array.isArray(octJson.data) ? octJson.data : (Array.isArray(octJson) ? octJson : []);
      const sampleItem = itemsList.length > 0 ? { id: itemsList[0].id, name: itemsList[0].name, room: itemsList[0].room } : octText.substring(0, 100);

      const details = `Status: ${octRes.status} | Elementi calendario scaricati: ${itemsList.length} | Campione: ${JSON.stringify(sampleItem)}`;

      console.log(`${isOk ? '✅' : '❌'} Octorate Live Calendar [GET /rest/v1/calendar/${structureId}] -> ${octRes.status} ${octRes.statusText}`);
      console.log(`   Risposta JSON Sintetica: ${JSON.stringify({ httpStatus: octRes.status, itemsCount: itemsList.length, sample: sampleItem })}`);

      recordResult(`Octorate Live API: GET /calendar/${structureId}`, `/connect/rest/v1/calendar/${structureId}`, 'GET', octRes.status, octRes.statusText, details, isOk);
    }
  } catch (err) {
    console.log(`❌ Octorate Live Calendar Errore: ${err.message}`);
    recordResult('Octorate Live API: GET /calendar', '/connect/rest/v1/calendar', 'GET', 500, 'Exception', err.message, false);
  }

  // Close local HTTP server
  server.close();

  // Cleanup temp files
  for (const tmpFile of tmpFiles) {
    try {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    } catch {}
  }

  // =========================================================================
  // FINAL REPORT MATRIX
  // =========================================================================
  console.log('\n========================================================================');
  console.log('                   📊 REPORT FINALE DIAGNOSTICA API                     ');
  console.log('========================================================================\n');

  console.log('| PORTA / ENDPOINT                              | METODO | STATUS | ESITO        | DETTAGLI DI RISPOSTA');
  console.log('|-----------------------------------------------|--------|--------|--------------|--------------------------------------------------');

  let successCount = 0;
  for (const res of reportResults) {
    if (res.isOk) successCount++;
    const badge = res.isOk ? '✅ SUCCESS' : '⚠️ ATTENZIONE';
    const namePadded = res.name.padEnd(45, ' ');
    const methodPadded = res.method.padEnd(6, ' ');
    const statusPadded = String(res.statusCode).padEnd(6, ' ');
    const badgePadded = badge.padEnd(12, ' ');
    console.log(`| ${namePadded} | ${methodPadded} | ${statusPadded} | ${badgePadded} | ${res.details}`);
  }

  console.log('\n------------------------------------------------------------------------');
  console.log(`📈 RIEPILOGATORIO COMPLESSIVO: ${successCount} su ${reportResults.length} porte e rotte API rispondono con ESITO POSITIVO.`);
  if (successCount === reportResults.length) {
    console.log('🎉 TUTTE LE ROTTE E LE PORTE API SONO OPERATIVE E CORRETTAMENTE CONFIGURATE!');
  } else {
    console.log('⚠️ Alcune rotte richiedono verifica o attenzione (vedi dettagli sopra).');
  }
  console.log('========================================================================\n');
}

runDiagnostics().catch((err) => {
  console.error('❌ Errore fatale durante l\'esecuzione della diagnostica:', err);
  process.exit(1);
});
