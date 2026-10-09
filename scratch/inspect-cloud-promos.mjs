import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envVars = {};
for (const envFile of ['.env.local', '.env']) {
  const p = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [k, ...v] = trimmed.split('=');
        if (k && v.length > 0 && !envVars[k.trim()]) {
          envVars[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    }
  }
}

const supabaseUrl = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL || '';
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function check() {
  const { data, error } = await supabase.storage.from('site-images').download('resort_promo_codes.json');
  if (error) {
    console.error('Error downloading resort_promo_codes.json:', error);
    return;
  }
  const text = await data.text();
  console.log('CURRENT CLOUD RESORT PROMOS:\n', text);
}

check();
