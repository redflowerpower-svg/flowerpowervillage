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

async function markRed90Used() {
  const { data: pData, error } = await supabase.storage.from('site-images').download('pizza_promo_codes.json');
  if (error || !pData) {
    console.error('Error downloading:', error);
    return;
  }
  const text = await pData.text();
  const list = JSON.parse(text);
  
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
  const { error: upErr } = await supabase.storage.from('site-images').upload('pizza_promo_codes.json', payload, {
    contentType: 'application/json',
    upsert: true
  });

  if (upErr) {
    console.error('Error uploading:', upErr);
  } else {
    console.log('✅ Successfully marked RED90 as slotsUsed: 1, active: false in Supabase Cloud Storage!');
  }
}

markRed90Used();
