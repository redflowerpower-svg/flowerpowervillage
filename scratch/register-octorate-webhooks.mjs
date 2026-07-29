import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { createClient } from '@supabase/supabase-js';

// Helper for readline user input
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans.trim());
  }));
}

// 1. Parsing manuale file .env.local e .env
function loadEnv() {
  const envVars = {};
  const files = ['.env.local', '.env'];
  for (const file of files) {
    const filePath = path.resolve(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0 && !envVars[key.trim()]) {
            envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          }
        }
      }
    }
  }
  return envVars;
}

const envVars = loadEnv();
const supabaseUrl = envVars.SUPABASE_URL || envVars.VITE_SUPABASE_URL;
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;

console.log('========================================================================');
console.log('    REGISTRAZIONE WEBHOOKS OCTORATE (RESERVATION EVENTS REST v1)       ');
console.log('========================================================================\n');

async function main() {
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Credenziali Supabase mancanti nei file .env.local / .env');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // 2. Prelievo OAuth access_token da Supabase
  console.log('📌 [STEP 1] Recupero access_token da Supabase (octorate_tokens)...');
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
  console.log('   ✅ Access token recuperato con successo!');

  // 3. Richiesta dell'URL del Webhook all'utente
  const defaultWebhookUrl = "https://flowerpowervillage.vercel.app/api/webhooks/octorate";
  console.log(`\n📌 [STEP 2] Inserisci l'URL pubblico del webhook endpoint.`);
  console.log(`   (Premi Invio per usare quello di default: ${defaultWebhookUrl})`);
  
  let targetUrl = await askQuestion('\n🌐 Webhook URL: ');
  if (!targetUrl) {
    targetUrl = defaultWebhookUrl;
  }

  console.log(`\n📌 [STEP 3] Sottoscrizione eventi Octorate con URL: ${targetUrl}\n`);

  const events = ['RESERVATION_CREATED', 'RESERVATION_CHANGE', 'RESERVATION_CANCELLED'];

  for (const event of events) {
    const subscriptionEndpoint = `https://api.octorate.com/connect/rest/v1/subscription/${event}`;
    
    const bodyParams = new URLSearchParams();
    bodyParams.append('url', targetUrl);

    try {
      console.log(`⏳ Iscrizione all'evento: ${event}...`);
      const response = await fetch(subscriptionEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: bodyParams.toString()
      });

      const responseText = await response.text();
      let responseJson = null;
      try { responseJson = JSON.parse(responseText); } catch {}

      if (response.ok) {
        console.log(`   ✅ Successo (${event}):`, responseJson || responseText);
      } else {
        console.error(`   ❌ Errore HTTP ${response.status} per (${event}):`, responseJson || responseText);
      }
    } catch (err) {
      console.error(`   ❌ Errore di connessione per (${event}):`, err.message);
    }
  }

  console.log('\n========================================================================');
  console.log('              COMPLETATO REGISTRAZIONE WEBHOOKS OCTORATE               ');
  console.log('========================================================================\n');
}

main().catch(console.error);
