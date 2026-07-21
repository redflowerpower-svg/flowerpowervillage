import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

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

console.log('--- TEST DI VERIFICA CREDENZIALI AMBIENTE LOCALE ---\n');

async function testSupabase() {
  const url = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL;
  const key = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.log('❌ Supabase: Variabili mancanti');
    return false;
  }
  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase.from('telegram_config').select('count').limit(1);
    if (error && error.code !== 'PGRST116') {
      // Try another table if telegram_config query had an issue
      const { error: error2 } = await supabase.from('accommodations').select('id').limit(1);
      if (error2) {
        console.log(`❌ Supabase: Errore di connessione (${error2.message})`);
        return false;
      }
    }
    console.log(`✅ Supabase: Connessione riuscita (URL: ${url})`);
    return true;
  } catch (err) {
    console.log(`❌ Supabase: Errore exception: ${err.message}`);
    return false;
  }
}

async function testStripe() {
  const secretKey = envVars.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.log('❌ Stripe: STRIPE_SECRET_KEY mancante');
    return false;
  }
  try {
    const stripe = new Stripe(secretKey);
    const balance = await stripe.balance.retrieve();
    console.log(`✅ Stripe: Autenticazione OK (Modalità Test: ${balance.livemode === false ? 'SI' : 'NO'})`);
    return true;
  } catch (err) {
    console.log(`❌ Stripe: Errore (${err.message})`);
    return false;
  }
}

async function testTelegram() {
  const botToken = envVars.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.log('❌ Telegram: TELEGRAM_BOT_TOKEN mancante');
    return false;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await res.json();
    if (data.ok) {
      console.log(`✅ Telegram Bot: Connessione OK (Bot Name: @${data.result.username})`);
      return true;
    } else {
      console.log(`❌ Telegram Bot: Risposta non OK (${data.description})`);
      return false;
    }
  } catch (err) {
    console.log(`❌ Telegram Bot: Errore di connessione (${err.message})`);
    return false;
  }
}

function testOctorate() {
  const structureId = envVars.VITE_OCTORATE_STRUCTURE_ID;
  const clientId = envVars.VITE_OCTORATE_CLIENT_ID;
  const clientSecret = envVars.OCTORATE_SECRET_KEY || envVars.VITE_OCTORATE_SECRET_KEY;
  if (structureId && clientId && clientSecret) {
    console.log(`✅ Octorate PMS: Configurazione trovata (Structure ID: ${structureId}, Client ID: ${clientId.substring(0, 10)}...)`);
    return true;
  } else {
    console.log('❌ Octorate PMS: Variabili mancanti');
    return false;
  }
}

function testSMTP() {
  const host = envVars.SMTP_HOST;
  const user = envVars.SMTP_USER;
  const pass = envVars.SMTP_PASS;
  if (host && user && pass) {
    console.log(`✅ SMTP Email: Configurazione presente (${user} via ${host})`);
    return true;
  } else {
    console.log('❌ SMTP Email: Configurazione incompleta');
    return false;
  }
}

function testGoogleMaps() {
  const apiKey = envVars.VITE_GOOGLE_MAPS_API_KEY;
  if (apiKey) {
    console.log(`✅ Google Maps: API Key configurata (${apiKey.substring(0, 8)}...)`);
    return true;
  } else {
    console.log('❌ Google Maps: VITE_GOOGLE_MAPS_API_KEY mancante');
    return false;
  }
}

async function runAll() {
  await testSupabase();
  await testStripe();
  await testTelegram();
  testOctorate();
  testSMTP();
  testGoogleMaps();
  console.log('\n--- VERIFICA COMPLETATA ---');
}

runAll();
