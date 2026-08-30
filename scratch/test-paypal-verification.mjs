import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env and .env.local
function loadEnv() {
  const envVars = {};
  for (const file of ['.env', '.env.local', '.env.production']) {
    const p = path.resolve(process.cwd(), file);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          }
        }
      }
    }
  }
  return envVars;
}

async function verifyPayPal() {
  console.log('🔍 Ricerca e Verifica API PayPal...\n');
  const envVars = loadEnv();

  let clientId = envVars.PAYPAL_CLIENT_ID || envVars.VITE_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID;
  let clientSecret = envVars.PAYPAL_CLIENT_SECRET || envVars.PAYPAL_SECRET_KEY || process.env.PAYPAL_CLIENT_SECRET;
  let mode = envVars.PAYPAL_MODE || envVars.VITE_PAYPAL_MODE || 'live';

  // Check Supabase payment_settings if not in env
  const supabaseUrl = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase.from('payment_settings').select('*').eq('id', 'singleton').maybeSingle();
      if (data?.paypal_config) {
        console.log('📦 Trovata configurazione PayPal in Supabase (payment_settings)');
        if (!clientId && data.paypal_config.client_id) clientId = data.paypal_config.client_id;
        if (!clientSecret && data.paypal_config.client_secret) clientSecret = data.paypal_config.client_secret;
        if (data.paypal_config.mode) mode = data.paypal_config.mode;
      }
    } catch (e) {
      console.log('Supabase check notice:', e.message);
    }
  }

  console.log(`📌 Parametri Rilevati:`);
  console.log(`- Client ID: ${clientId ? clientId.substring(0, 10) + '...' + clientId.slice(-6) : '❌ MANCANTE'}`);
  console.log(`- Client Secret: ${clientSecret ? '******' + clientSecret.slice(-4) : '❌ MANCANTE'}`);
  console.log(`- Modalità: ${mode.toUpperCase()}`);

  if (!clientId || !clientSecret) {
    console.log('\n❌ Impossibile procedere: Client ID o Client Secret non trovati nei file di ambiente o in Supabase.');
    return;
  }

  // Test OAuth token generation against PayPal endpoints
  const endpoints = [
    { name: 'PayPal LIVE', url: 'https://api-m.paypal.com/v1/oauth2/token' },
    { name: 'PayPal SANDBOX', url: 'https://api-m.sandbox.paypal.com/v1/oauth2/token' }
  ];

  for (const ep of endpoints) {
    console.log(`\n⏳ Test Autenticazione su ${ep.name}...`);
    try {
      const authHeader = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const res = await fetch(ep.url, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: 'grant_type=client_credentials'
      });

      const data = await res.json();
      if (res.ok && data.access_token) {
        console.log(`✅ AUTENTICAZIONE RIUSCITA su ${ep.name}!`);
        console.log(`- Token Type: ${data.token_type}`);
        console.log(`- Scadenza Token: ${data.expires_in} secondi`);
        console.log(`- App ID Registrata: ${data.app_id || 'N/A'}`);
        console.log(`- Scope abilitati: ${data.scope ? data.scope.split(' ').slice(0, 5).join(', ') + '...' : 'Tutti'}`);
        return;
      } else {
        console.log(`❌ Risposta ${ep.name} (${res.status}): ${data.error_description || data.error || JSON.stringify(data)}`);
      }
    } catch (err) {
      console.log(`❌ Errore di rete su ${ep.name}:`, err.message);
    }
  }
}

verifyPayPal();
