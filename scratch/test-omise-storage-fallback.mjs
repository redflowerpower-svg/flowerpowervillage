import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Blank out env vars to simulate Vercel missing vars
const lines = fs.readFileSync('.env', 'utf8').split('\n');
const envMap = {};
for (const l of lines) {
  const idx = l.indexOf('=');
  if (idx > 0) envMap[l.slice(0, idx).trim()] = l.slice(idx+1).trim().replace(/^["']|["']$/g, '');
}

const supabaseUrl = envMap.VITE_SUPABASE_URL;
const supabaseKey = envMap.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFallback() {
  console.log('Testing storage fallback download...');
  const { data: fileData, error } = await supabase.storage.from("site-images").download("payment_settings.json");
  if (error || !fileData) {
    console.error('Download error:', error);
    return;
  }
  const text = await fileData.text();
  const parsed = JSON.parse(text);
  console.log('Successfully read from storage:', {
    hasPublicKey: !!parsed?.omise_config?.publicKey,
    hasSecretKey: !!parsed?.omise_config?.secretKey,
    mode: parsed?.omise_config?.mode
  });

  const secretKey = parsed.omise_config.secretKey;
  const authHeader = `Basic ${Buffer.from(secretKey + ":").toString("base64")}`;

  const res = await fetch("https://api.omise.co/sources", {
    method: "POST",
    headers: {
      "Authorization": authHeader,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: 19000,
      currency: "thb",
      type: "promptpay"
    })
  });
  const data = await res.json();
  console.log('Omise Source status:', res.status, 'Source ID:', data.id);
}

testFallback().catch(console.error);
