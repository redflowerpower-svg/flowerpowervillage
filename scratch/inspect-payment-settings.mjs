import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envVars = {};
  for (const file of ['.env', '.env.local']) {
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

async function checkSupabaseSettings() {
  const envVars = loadEnv();
  const url = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL;
  const key = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return;

  const supabase = createClient(url, key);
  const { data, error } = await supabase.from('payment_settings').select('*');
  console.log('payment_settings data:', JSON.stringify(data, null, 2));
  if (error) console.error('Error:', error);
}

checkSupabaseSettings();
