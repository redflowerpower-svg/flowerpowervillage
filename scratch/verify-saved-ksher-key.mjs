import { createClient } from '@supabase/supabase-js';
import { signKsherPayload, getKsherAppId } from '../api/_helpers/ksher.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Parse .env
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

const supabaseUrl = envVars.SUPABASE_URL || envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySavedKey() {
  console.log('--- VERIFICA CHIAVE KSHER SALVATA SU SUPABASE ---\n');

  // 1. Fetch from DB
  const { data, error } = await supabase
    .from('payment_settings')
    .select('ksher_config')
    .eq('id', 'singleton')
    .maybeSingle();

  if (error || !data) {
    console.error('❌ Errore lettura Supabase:', error?.message);
    return;
  }

  const ksherConfig = data.ksher_config || {};
  const secretKey = ksherConfig.secretKey || '';
  const appId = ksherConfig.appId || 'mch39593';

  console.log(`✅ Configurazione rilevata su DB:`);
  console.log(`   - App ID: ${appId}`);
  console.log(`   - Secret Key presente: ${Boolean(secretKey)} (Lunghezza: ${secretKey.length} caratteri)`);
  console.log(`   - Secret Key preview: ${secretKey ? secretKey.substring(0, 8) + '...' + secretKey.slice(-4) : 'VUOTA'}\n`);

  if (!secretKey) {
    console.log('⚠️ Nessuna Secret Key trovata su DB. Assicurati di aver cliccato "Salva Modifiche" nel pannello admin.');
    return;
  }

  // 2. Test Live Ksher Gateway Pay API with this key
  const orderNo = `FP${Date.now()}`;
  const timeStamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const nonceStr = crypto.randomBytes(8).toString('hex');

  const ksherPayload = {
    appid: appId,
    channel_list: 'card',
    fee_type: 'THB',
    mch_code: orderNo,
    mch_notify_url: 'https://flowerpowerphayam.com/api/webhooks/ksher',
    mch_order_no: orderNo,
    mch_redirect_url: 'http://localhost:3000/admin?status=success',
    mch_redirect_url_fail: 'http://localhost:3000/admin?status=failed',
    nonce_str: nonceStr,
    product_name: 'Flower Power Test Booking',
    refer_url: 'http://localhost:3000',
    time_stamp: timeStamp,
    total_fee: 10000 // 100.00 THB
  };

  const sign = signKsherPayload(ksherPayload, secretKey);
  ksherPayload.sign = sign;

  console.log('--- TEST CHIAMATA LIVE API KSHER (https://gateway.ksher.com/api/gateway_pay) ---');
  try {
    const res = await fetch('https://gateway.ksher.com/api/gateway_pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ksherPayload)
    });
    const result = await res.json();
    console.log('Risposta server Ksher:', JSON.stringify(result, null, 2));

    if (result.code === 0 && result.data?.pay_url) {
      console.log('\n🎉🎉🎉 ESITO ECCELLENTE: CHIAVE KSHER VALIDA AL 100%!');
      console.log(`Link di Pagamento Generato: ${result.data.pay_url}`);
    } else {
      console.log(`\nEsito Ksher: Code ${result.code} - ${result.msg || result.message}`);
    }
  } catch (err) {
    console.error('Errore chiamata:', err.message);
  }
}

verifySavedKey();
