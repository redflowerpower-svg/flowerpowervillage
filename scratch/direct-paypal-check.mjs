import fs from 'fs';
import path from 'path';

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

async function findPayPalCredentials() {
  const env = loadEnv();
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

  console.log('--- VERIFICA CONFIGURAZIONE PAYPAL ---');
  console.log('1. Variabili File .env:');
  console.log('   PAYPAL_CLIENT_ID:', env.PAYPAL_CLIENT_ID ? env.PAYPAL_CLIENT_ID.substring(0, 10) + '...' : 'non presente');
  console.log('   PAYPAL_CLIENT_SECRET:', env.PAYPAL_CLIENT_SECRET ? 'presente (nascosto)' : 'non presente');

  if (url && key) {
    try {
      console.log('2. Ricerca in Supabase payment_settings...');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${url}/rest/v1/payment_settings?id=eq.singleton&select=*`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        },
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows.length > 0) {
          const row = rows[0];
          console.log('   Trovata riga singleton in payment_settings!');
          console.log('   paypal_config in DB:', JSON.stringify(row.paypal_config, null, 2));
          
          const clientId = row.paypal_config?.clientId || row.paypal_config?.client_id;
          const clientSecret = row.paypal_config?.clientSecret || row.paypal_config?.client_secret;
          const mode = row.paypal_config?.mode || 'sandbox';

          if (clientId && clientSecret) {
            console.log('\n3. Test Chiamata Ufficiale PayPal API...');
            const ep = mode === 'live' ? 'https://api-m.paypal.com/v1/oauth2/token' : 'https://api-m.sandbox.paypal.com/v1/oauth2/token';
            const authHeader = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
            const ppRes = await fetch(ep, {
              method: 'POST',
              headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
              },
              body: 'grant_type=client_credentials'
            });
            const ppData = await ppRes.json();
            if (ppRes.ok && ppData.access_token) {
              console.log(`   ✅ AUTENTICAZIONE PAYPAL RIUSCITA (${mode.toUpperCase()})!`);
              console.log(`   - Token Type: ${ppData.access_token ? ppData.token_type : ''}`);
              console.log(`   - Scadenza: ${ppData.expires_in}s`);
              console.log(`   - App ID: ${ppData.app_id || 'N/A'}`);
            } else {
              console.log(`   ❌ Errore PayPal API (${ppRes.status}):`, ppData);
            }
          }
        } else {
          console.log('   Nessuna riga in payment_settings.');
        }
      } else {
        console.log('   Supabase response non OK:', res.status, res.statusText);
      }
    } catch (e) {
      console.log('   Errore query Supabase:', e.message);
    }
  }
}

findPayPalCredentials();
