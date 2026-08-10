import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testAllPagesLiveCalendar() {
  console.log('📌 Paginazione completa di tutte le pagine Octorate Calendar API per novembre 2026...');

  const { data: tokenData, error: tokenError } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  if (tokenError || !tokenData?.access_token) {
    console.error('❌ Token non trovato in Supabase DB:', tokenError?.message);
    return;
  }

  const token = tokenData.access_token;
  const MOTHER_RATES = [
    { id: 529773, name: 'Jungle Villa' },
    { id: 495795, name: 'Jungle Villa Left' },
    { id: 495796, name: 'Jungle Villa Right' },
    { id: 494840, name: 'Peace & Love Villa' },
    { id: 421511, name: 'Penthouse Villa' },
    { id: 293957, name: 'Yellow Bungalow' },
    { id: 293954, name: 'Red Bungalow' },
    { id: 293962, name: 'Green Bungalow' },
    { id: 293965, name: 'Camel Tent Bungalow' },
    { id: 293955, name: 'Lagoon Tent Bungalow' },
    { id: 293942, name: 'Hub Internal Room' },
    { id: 293963, name: 'Hub Room 1' },
    { id: 293959, name: 'Hub Room 2' },
    { id: 293948, name: 'Hub Room 3' },
    { id: 293945, name: 'Hub Room 4' },
    { id: 293943, name: 'Hub Room 5' },
    { id: 293951, name: 'Lodge 1' },
    { id: 883795, name: 'Lodge 2' }
  ];

  const motherIdsSet = new Set(MOTHER_RATES.map(m => m.id));
  const foundMotherItems = [];

  for (let page = 0; page < 20; page++) {
    const url = `https://api.octorate.com/connect/rest/v1/calendar/366879?dateFrom=2026-11-01&dateTo=2026-11-10&size=20&page=${page}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      console.warn(`Pagina ${page} terminata con HTTP ${res.status}`);
      break;
    }

    const json = await res.json();
    const items = json.data || json || [];
    if (items.length === 0) break;

    for (const item of items) {
      const itemId = Number(item.id || item.ratePlanId || item.motherRateId);
      if (motherIdsSet.has(itemId)) {
        foundMotherItems.push({ page, item });
      }
    }
  }

  console.log(`\n✅ PAGINAZIONE COMPLETATA! Trovate ${foundMotherItems.length} Tariffe Madre reali scaricate da Octorate:`);
  
  MOTHER_RATES.forEach(mr => {
    const found = foundMotherItems.find(f => Number(f.item.id) === mr.id);
    if (found) {
      const item = found.item;
      const sampleDay = item.days ? item.days[0] : null;
      console.log(`   - Pagina ${found.page} | ID ${mr.id} (${mr.name}): Prezzo Live Octorate = ฿${sampleDay?.price || 'N/A'} (Data: ${sampleDay?.date || 'N/A'})`);
    } else {
      console.log(`   - ID ${mr.id} (${mr.name}): NON Trovato nella paginazione.`);
    }
  });
}

testAllPagesLiveCalendar();
