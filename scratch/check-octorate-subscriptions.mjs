import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

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

async function inspectSubscriptions() {
  const url = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL;
  const key = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(url, key);

  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  const headers = {
    'Authorization': `Bearer ${tokenData.access_token}`,
    'Accept': 'application/json'
  };

  console.log('📡 1. Recupero Webhook già attivi (GET /connect/rest/v1/subscription)...');
  const activeRes = await fetch('https://api.octorate.com/connect/rest/v1/subscription', { headers });
  console.log('Active subscriptions status:', activeRes.status, await activeRes.text());

  console.log('\n📡 2. Recupero Lista Eventi Supportati (GET /connect/rest/v1/subscription/list)...');
  const listRes = await fetch('https://api.octorate.com/connect/rest/v1/subscription/list', { headers });
  console.log('Supported list status:', listRes.status, await listRes.text());
}

inspectSubscriptions();
