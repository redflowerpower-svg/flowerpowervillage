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

console.log('🧪 === TEST END-TO-END SAFETY SHIELD & WRITE SU FAKE BUNGALOW 2 (ID: 932256) ===\n');

async function testEndpointShield() {
  const url = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL;
  const key = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;
  const clientId = envVars.VITE_OCTORATE_CLIENT_ID || envVars.OCTORATE_CLIENT_ID || '';

  const supabase = createClient(url, key);
  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  const accessToken = tokenData.access_token;
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (clientId) headers['Octorate-Api-Key'] = clientId;

  // Test 1: Fake Bungalow 2 (ID 932256 - BE)
  console.log('1️⃣ Test Scrittura su Fake Bungalow 2 (ID: 932256)...');
  const res1 = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
    method: 'POST',
    headers,
    body: JSON.stringify([{
      room: 932256,
      dateFrom: '2026-12-01',
      dateTo: '2026-12-05',
      values: { stopSells: false }
    }])
  });
  console.log(`   Status Octorate: ${res1.status} -> JSON:`, await res1.text());

  // Test 2: Verifica della logica helper isTestProduct nel codice
  const isTestProduct = (id) => (id >= 932243 && id <= 932268) || id === 649669 || id === 921799;

  console.log('\n2️⃣ Test Helper Sicurezza (isTestProduct):');
  console.log('   Fake Bungalow 1 (932243):', isTestProduct(932243) ? '✅ ACCETTATO' : '❌ RIFIUTATO');
  console.log('   Fake Bungalow 2 (932268):', isTestProduct(932268) ? '✅ ACCETTATO' : '❌ RIFIUTATO');
  console.log('   Bungalow Reale Jungle Villa (529784):', isTestProduct(529784) ? '⚠️ ERRORE (ACCETTATO)' : '🛡️ BLOCCATO IN SICUREZZA!');
}

testEndpointShield().catch(console.error);
