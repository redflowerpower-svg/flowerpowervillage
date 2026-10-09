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

async function inspectAll() {
  console.log('--- INSPECTING SUPABASE STORAGE PROMOS ---');
  const { data: pData } = await supabase.storage.from('site-images').download('pizza_promo_codes.json');
  if (pData) {
    console.log('🍕 PIZZA PROMOS:\n', await pData.text());
  } else {
    console.log('🍕 No pizza promos found');
  }

  const { data: rData } = await supabase.storage.from('site-images').download('resort_promo_codes.json');
  if (rData) {
    console.log('🏨 RESORT PROMOS:\n', await rData.text());
  } else {
    console.log('🏨 No resort promos found');
  }
}

inspectAll();
