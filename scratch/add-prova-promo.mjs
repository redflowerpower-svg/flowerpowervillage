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

async function checkAndAddProva() {
  console.log('Inspecting pizza_promo_codes.json on Supabase Cloud...');
  const { data, error } = await supabase.storage.from('site-images').download('pizza_promo_codes.json');
  let codes = [];
  if (!error && data) {
    const text = await data.text();
    codes = JSON.parse(text);
  }
  console.log('Existing Pizza Codes in Cloud:', codes);

  // Check if PROVA exists
  const existing = codes.find(c => c.code.toUpperCase() === 'PROVA');
  if (existing) {
    console.log('PROVA already exists:', existing);
  } else {
    console.log('Adding PROVA (90% discount) to Cloud...');
    const newPromo = {
      id: 'pizza-promo-prova-' + Date.now(),
      code: 'PROVA',
      discountType: 'percentage',
      discountValue: 90,
      minOrder: 0,
      slotsTotal: 100,
      slotsUsed: 0,
      isSingleUse: false,
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
      active: true,
      createdAt: new Date().toISOString()
    };
    codes = [newPromo, ...codes];

    const jsonBuffer = Buffer.from(JSON.stringify(codes, null, 2), 'utf8');
    const { error: saveErr } = await supabase.storage.from('site-images').upload(
      'pizza_promo_codes.json',
      jsonBuffer,
      { contentType: 'application/json', cacheControl: '0', upsert: true }
    );
    if (saveErr) console.error('Save error:', saveErr);
    else console.log('Successfully saved PROVA (90%) to Supabase Cloud!');
  }
}

checkAndAddProva();
