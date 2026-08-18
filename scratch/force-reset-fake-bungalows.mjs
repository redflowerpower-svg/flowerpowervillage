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

async function forceResetFakeBungalows() {
  const url = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL;
  const key = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(url, key);

  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  if (!tokenData?.access_token) {
    console.error('❌ Token Octorate non trovato in Supabase');
    process.exit(1);
  }

  const payload = [
    {
      room: 649669,
      dateFrom: '2026-08-17',
      dateTo: '2026-10-31',
      values: {
        minstay: 2
      }
    },
    {
      room: 921799,
      dateFrom: '2026-08-17',
      dateTo: '2026-10-31',
      values: {
        minstay: 2
      }
    }
  ];

  console.log('📡 Inviando ripristino forzato (minstay: 2) a Octorate per Fake Bungalow 1 (#649669) e Fake Bungalow 2 (#921799)...');

  const res = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  console.log('HTTP Status:', res.status);
  const text = await res.text();
  console.log('Response:', text);
}

forceResetFakeBungalows();
