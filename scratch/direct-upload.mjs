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

async function testUpload() {
  const { data: pData } = await supabase.storage.from('site-images').download('pizza_promo_codes.json');
  const text = await pData.text();
  const list = JSON.parse(text);
  console.log('Original list length:', list.length);
  
  const updated = list.map(p => {
    if (p.code.toUpperCase() === 'RED90') {
      return {
        ...p,
        slotsUsed: 1,
        active: false
      };
    }
    return p;
  });

  const payload = Buffer.from(JSON.stringify(updated, null, 2), 'utf8');
  const { data: upData, error: upErr } = await supabase.storage.from('site-images').upload('pizza_promo_codes.json', payload, {
    contentType: 'application/json',
    upsert: true
  });

  console.log('Upload res:', upData, 'Error:', upErr);

  const { data: checkData } = await supabase.storage.from('site-images').download('pizza_promo_codes.json');
  console.log('Verified downloaded JSON:\n', await checkData.text());
}

testUpload();
