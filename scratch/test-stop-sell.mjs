import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse .env file
const envPath = path.resolve(process.cwd(), '.env');
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

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Credenziali Supabase mancanti in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testStopSell() {
  console.log('========================================================================');
  console.log('  TEST LIVE OCTORATE: SET STOP SELL SU TARIFFA #495549 (P&L 7d)');
  console.log('========================================================================\n');

  // 1. Recupera Token OAuth
  const { data: tokenData, error: tokenError } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  if (tokenError || !tokenData?.access_token) {
    console.error('❌ Access token non disponibile nel DB:', tokenError?.message);
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

  const rateId = 495549;
  const targetDate = '2026-09-23';

  // 2. Invio POST /calendar/bulk con stopSells: true
  const bulkUrl = 'https://api.octorate.com/connect/rest/v1/calendar/bulk';
  const testPayload = [
    {
      room: rateId,
      dateFrom: targetDate,
      dateTo: targetDate,
      values: {
        stopSells: true
      }
    }
  ];

  console.log(`📌 Inviando POST /calendar/bulk ad Octorate per Rate #${rateId} in data ${targetDate}...`);
  console.log(`   Payload: ${JSON.stringify(testPayload, null, 2)}`);

  const res = await fetch(bulkUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(testPayload)
  });

  const text = await res.text();
  console.log(`\n📋 HTTP Status: ${res.status} ${res.statusText}`);
  console.log(`   Risposta Octorate API: ${text}`);

  if (res.ok) {
    console.log('\n✅ TEST SCRITTURA STOP SELL RIUSCITO CON SUCCESSO!');
    
    // Ripristino valore originale (stopSells: false)
    console.log('\n🔄 Ripristino dello stato originale (stopSells: false)...');
    const restorePayload = [
      {
        room: rateId,
        dateFrom: targetDate,
        dateTo: targetDate,
        values: {
          stopSells: false
        }
      }
    ];

    const restoreRes = await fetch(bulkUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(restorePayload)
    });
    const restoreText = await restoreRes.text();
    console.log(`   Esito ripristino: HTTP ${restoreRes.status} -> ${restoreText}`);
  } else {
    console.error('\n❌ TEST SCRITTURA FALLITO:', text);
  }
}

testStopSell();
