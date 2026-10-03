import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const env = {};
  const files = ['.env', '.env.local'];
  for (const file of files) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          env[key] = val;
        }
      }
    }
  }
  return env;
}

const env = loadEnv();
const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function sync() {
  const settings = {
    id: "singleton",
    active_primary_gateway: "omise",
    active_promptpay_provider: "omise",
    paypal_enabled: true,
    omise_config: {
      publicKey: env.OMISE_PUBLIC_KEY || env.VITE_OMISE_PUBLIC_KEY,
      secretKey: env.OMISE_SECRET_KEY,
      mode: "live"
    },
    updated_at: new Date().toISOString()
  };

  console.log('Uploading payment_settings.json to site-images storage bucket...');
  const { data, error } = await supabase.storage.from('site-images').upload(
    'payment_settings.json',
    Buffer.from(JSON.stringify(settings, null, 2)),
    { upsert: true, contentType: 'application/json', cacheControl: '0' }
  );

  if (error) {
    console.error('Storage upload error:', error);
  } else {
    console.log('✅ payment_settings.json uploaded successfully to storage!');
  }
}

sync().catch(console.error);
