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

const OCTORATE_STRUCTURE_ID = process.env.VITE_OCTORATE_STRUCTURE_ID || '366879';
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY
);

async function run() {
  const { data } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .single();

  const token = data.access_token;
  const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

  const periodItems = [];
  const todayStr = '2026-08-10';

  for (let page = 0; page < 20; page++) {
    const url = `https://api.octorate.com/connect/rest/v1/calendar/${OCTORATE_STRUCTURE_ID}?dateFrom=${todayStr}&dateTo=${todayStr}&size=20&page=${page}`;
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

  const airbnbRates = periodItems.filter(r => {
    const name = String(r.name || r.title || r.ratePlanName || '').toLowerCase();
    return name.includes('airbnb') || name.includes('air bnb');
  });

  console.log('\n=======================================');
  console.log('📡 VERIFICA LIVE AIRBNB SU OCTORATE:');
  console.log('=======================================');

  for (const r of airbnbRates) {
    const day = Array.isArray(r.days) && r.days.length > 0 ? r.days[0] : r;
    const isClosed = day ? (day.closed === true || day.stopSell === true || day.stopSells === true || day.available === false) : false;
    const nameStr = String(r.name || r.title || '').padEnd(35);
    console.log(`- [ID: ${r.id}] ${nameStr} ➔ ${isClosed ? '🔒 CHIUSO' : '🔓 APERTO'}`);
  }
}

run();
