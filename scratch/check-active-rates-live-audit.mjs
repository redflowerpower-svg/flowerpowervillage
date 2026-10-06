import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envVars = {};
['.env', '.env.local'].forEach(file => {
  const filePath = path.resolve(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...rest] = trimmed.split('=');
        if (key) envVars[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  }
});

const supabase = createClient(
  envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY
);

async function checkActivePlans() {
  const { data: tokenData } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').single();
  const token = tokenData.access_token;
  const structureId = envVars.VITE_OCTORATE_STRUCTURE_ID || '366879';

  const testDates = [
    { date: '2026-10-15', label: 'Inizio Stagione (Ottobre)' },
    { date: '2026-12-20', label: 'Finestra Only Check-out / Natale (Dicembre)' },
    { date: '2026-12-28', label: 'Periodo Festività / Capodanno (Fine Dicembre)' },
    { date: '2027-02-15', label: 'Alta Stagione Invernale (Febbraio)' },
    { date: '2027-04-15', label: 'Fine Stagione (Aprile)' }
  ];

  const activePlans = [
    { code: 'BE', keyword: 'BE' },
    { code: '7d', keyword: '7d' },
    { code: 'Main bnb-7d', keyword: 'Main bnb-7d' },
    { code: 'Main bnb-14d', keyword: 'Main bnb-14d' },
    { code: 'AGD AC-7d', keyword: 'AGD AC-7d' },
    { code: 'AGD AC-14d', keyword: 'AGD AC-14d' },
    { code: 'AirBnB', keyword: 'AirBnB' }
  ];

  console.log(`=== AUDIT STATO TARIFFE ATTIVE (ON) SU OCTORATE (READ-ONLY) ===\n`);

  for (const { date, label } of testDates) {
    console.log(`\n📅 Data: ${date} (${label})`);
    let allItems = [];
    for (let page = 1; page <= 6; page++) {
      const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${date}&dateTo=${date}&page=${page}&size=50`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!res.ok) break;
      const json = await res.json();
      const items = json.data || (Array.isArray(json) ? json : []);
      if (!items || items.length === 0) break;
      allItems.push(...items);
    }

    for (const plan of activePlans) {
      // Filter items matching plan keyword (excluding AC ones for pure 7d/bnb/airbnb)
      const matching = allItems.filter(it => {
        const n = it.name || '';
        if (plan.code === '7d') return n.includes('7d') && !n.includes('AC') && !n.includes('bnb') && !n.includes('AGD');
        if (plan.code === 'AirBnB') return n.includes('AirBnB') && !n.includes('AC');
        if (plan.code === 'BE') return n.includes('BE') || n.includes('Tariffa Madre');
        return n.includes(plan.keyword);
      });

      if (matching.length === 0) continue;

      let openCount = 0;
      let closedCount = 0;
      let ctaCount = 0;
      let ctdCount = 0;

      for (const m of matching) {
        const d = m.days?.[0] || {};
        if (d.stopSells === true || d.closed === true) {
          closedCount++;
        } else {
          openCount++;
        }
        if (d.closedArrival === true) ctaCount++;
        if (d.closedDeparture === true) ctdCount++;
      }

      console.log(`  🔹 [${plan.code}] (${matching.length} alloggi) -> APERTI: ${openCount} | CHIUSI (StopSell): ${closedCount} | CTA: ${ctaCount} | CTD: ${ctdCount}`);
    }
  }
}

checkActivePlans().catch(console.error);
