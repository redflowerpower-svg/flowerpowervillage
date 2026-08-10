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

async function inspectAirbnbDettaglio() {
  console.log('========================================================================');
  console.log('  ISPEZIONE DETTAGLIATA OGNI SINGOLA TARIFFA AIRBNB SU OCTORATE PMS');
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

  const testDates = ['2026-08-10', '2026-11-15', '2027-01-15', '2027-06-15'];

  for (const tDate of testDates) {
    console.log(`\n📌 DATI LIVE OCTORATE PER LA DATA: ${tDate}`);
    const periodItems = [];
    for (let page = 0; page < 20; page++) {
      const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${tDate}&dateTo=${tDate}&size=20&page=${page}`;
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

    const airbnbReport = [];
    periodItems.forEach((item) => {
      const name = String(item.name || item.title || item.ratePlanName || '');
      const nameLower = name.toLowerCase();
      if (nameLower.includes('airbnb') || nameLower.includes('bnb')) {
        const day = Array.isArray(item.days) && item.days.length > 0 ? item.days[0] : item;
        const isClosed = Boolean(day?.stopSells || day?.stopSell || day?.closed || day?.available === false || day?.price >= 10000);
        airbnbReport.push({
          id: item.id,
          name,
          stopSells: day?.stopSells,
          stopSell: day?.stopSell,
          closed: day?.closed,
          available: day?.available,
          price: day?.price,
          isClosed: isClosed ? '🔒 CHIUSO' : '🔓 APERTO'
        });
      }
    });

    console.table(airbnbReport);
  }
}

inspectAirbnbDettaglio();
