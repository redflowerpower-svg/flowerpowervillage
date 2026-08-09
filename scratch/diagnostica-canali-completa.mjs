import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnvironment() {
  const envPaths = ['.env', '.env.local'];
  for (const envPath of envPaths) {
    const fullPath = path.resolve(process.cwd(), envPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
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
  }
}

loadEnvironment();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function scanAllChannelsAndRates() {
  console.log('========================================================================');
  console.log('  DIAGNOSTICA LIVE COMPLETA PRODOTTI & CANALI (B, A, S) SU OCTORATE');
  console.log('========================================================================\n');

  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  const accessToken = tokenData.access_token;
  const structureId = process.env.VITE_OCTORATE_STRUCTURE_ID || '366879';

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json'
  };

  const testDate = '2026-08-15'; // Data durante la stagione estiva (Aperta)

  const periodItems = [];
  for (let page = 0; page < 20; page++) {
    const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${testDate}&dateTo=${testDate}&size=20&page=${page}`;
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) break;
      const payload = await res.json();
      const pageItems = payload && Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []);
      if (pageItems.length === 0) break;
      periodItems.push(...pageItems);
      if (pageItems.length < 20) break;
    } catch {
      break;
    }
  }

  console.log(`📌 Trovati ${periodItems.length} prodotti in griglia Octorate per la data ${testDate}:\n`);

  const categorized = {
    bnb: [],
    agoda: [],
    standard7d: [],
    other: []
  };

  periodItems.forEach((item) => {
    const id = String(item.id || item.ratePlanId || item.room || '');
    const name = String(item.name || item.title || item.ratePlanName || '');
    const nameLower = name.toLowerCase();
    
    const day = Array.isArray(item.days) && item.days.length > 0 ? item.days[0] : item;
    const isClosed = Boolean(day?.stopSells || day?.stopSell || day?.closed || day?.available === false || day?.bookable === false);

    const info = { id, name, isClosed, price: day?.price, minStay: day?.minStay };

    if (nameLower.includes('main bnb-7d') || nameLower.includes('main bnb-14d') || nameLower.includes('main bnb') || nameLower.includes('bnb')) {
      categorized.bnb.push(info);
    } else if (nameLower.includes('agd ac-7d') || nameLower.includes('agd ac-14d') || nameLower.includes('agd') || nameLower.includes('agoda')) {
      categorized.agoda.push(info);
    } else if (nameLower.includes('7d')) {
      categorized.standard7d.push(info);
    } else {
      categorized.other.push(info);
    }
  });

  console.log('--- 🔵 TARIFFA B (BOOKING / BNB) ---');
  console.table(categorized.bnb);

  console.log('\n--- 🟣 TARIFFA A (AGODA AC) ---');
  console.table(categorized.agoda);

  console.log('\n--- ⚪ TARIFFA S (STANDARD 7D) ---');
  console.table(categorized.standard7d);
}

scanAllChannelsAndRates();
