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

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  console.log('--- CHECK & SEED PROMO CODES ON SUPABASE STORAGE (site-images) ---');

  const resortPromos = [
    {
      id: 'promo-welcome-2026',
      code: 'WELCOME2026',
      discountType: 'percentage',
      discountValue: 10,
      slotsTotal: 100,
      slotsUsed: 0,
      isSingleUse: false,
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
      active: true,
      createdAt: new Date().toISOString()
    }
  ];

  const pizzaPromos = [
    {
      id: 'pizza-welcome-2026',
      code: 'PIZZA2026',
      discountType: 'percentage',
      discountValue: 15,
      minOrder: 250,
      slotsTotal: 100,
      slotsUsed: 0,
      isSingleUse: false,
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'pizza-special-50thb',
      code: 'SPECIAL50',
      discountType: 'fixed',
      discountValue: 50,
      minOrder: 300,
      slotsTotal: 50,
      slotsUsed: 0,
      isSingleUse: false,
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
      active: true,
      createdAt: new Date().toISOString()
    }
  ];

  // 1. Resort promos
  const { data: existingResort } = await supabase.storage.from('site-images').download('resort_promo_codes.json');
  if (existingResort) {
    const text = await existingResort.text();
    console.log('✅ Existing Resort Cloud Promos:', text);
  } else {
    console.log('Uploading initial resort_promo_codes.json...');
    const { error } = await supabase.storage.from('site-images').upload(
      'resort_promo_codes.json',
      Buffer.from(JSON.stringify(resortPromos, null, 2), 'utf8'),
      { contentType: 'application/json', cacheControl: '0', upsert: true }
    );
    if (error) console.error('❌ Error uploading resort promos:', error);
    else console.log('✅ Successfully created resort_promo_codes.json in site-images');
  }

  // 2. Pizza promos
  const { data: existingPizza } = await supabase.storage.from('site-images').download('pizza_promo_codes.json');
  if (existingPizza) {
    const text = await existingPizza.text();
    console.log('✅ Existing Pizza Cloud Promos:', text);
  } else {
    console.log('Uploading initial pizza_promo_codes.json...');
    const { error } = await supabase.storage.from('site-images').upload(
      'pizza_promo_codes.json',
      Buffer.from(JSON.stringify(pizzaPromos, null, 2), 'utf8'),
      { contentType: 'application/json', cacheControl: '0', upsert: true }
    );
    if (error) console.error('❌ Error uploading pizza promos:', error);
    else console.log('✅ Successfully created pizza_promo_codes.json in site-images');
  }
}

run();
