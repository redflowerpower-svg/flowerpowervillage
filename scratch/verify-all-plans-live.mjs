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

async function run() {
  const { data: tokenData } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').single();
  const token = tokenData.access_token;
  const structureId = '366879';

  console.log('🔍 VERIFICA DI CERTIFICAZIONE GLOBALE TARIFFE OCTORATE...');

  const checks = [
    { name: 'Red AC7d (330964)', id: 330964, expected: 'stopSells: true' },
    { name: 'P&L AC7d (495552)', id: 495552, expected: 'stopSells: true' },
    { name: 'JV AC7d (529780)', id: 529780, expected: 'stopSells: true' },
    { name: 'Pent AC7d (421522)', id: 421522, expected: 'stopSells: true' },
    { name: 'Yellow AC7d (331921)', id: 331921, expected: 'stopSells: true' },
    { name: 'Green AC7d (331923)', id: 331923, expected: 'stopSells: true' },
    { name: 'P&L AC bnb-7d (495587)', id: 495587, expected: 'stopSells: true' },
    { name: 'P&L AC bnb-14d (495593)', id: 495593, expected: 'stopSells: true' },
    { name: 'Red AirBnB AC (340196)', id: 340196, expected: 'stopSells: true' },
    { name: 'P&L AirBnB AC (495609)', id: 495609, expected: 'stopSells: true' },
    { name: 'P&L 7d (495549) a Gennaio', id: 495549, expected: 'stopSells: true' },
    { name: 'Red 7d (422296) a Gennaio', id: 422296, expected: 'stopSells: true' },
    { name: 'P&L Main bnb-14d (495580) a Gennaio (Capodanno)', id: 495580, expected: 'stopSells: false' }
  ];

  const results = [];
  for (let page = 0; page < 20; page++) {
    const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=2027-01-08&dateTo=2027-01-09&size=20&page=${page}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
    const json = await res.json();
    const items = Array.isArray(json) ? json : (json.data || json.calendar || []);
    if (!items.length) break;

    for (const it of items) {
      const match = checks.find(c => c.id === Number(it.id));
      if (match) {
        const day = it.days && it.days[0];
        results.push({
          id: it.id,
          name: it.name,
          date: day?.date,
          stopSells: day?.stopSells,
          bookable: day?.bookable,
          testPass: match.expected.includes(String(day?.stopSells)) ? '✅ PASS' : '❌ FAIL'
        });
      }
    }
  }

  console.table(results);
}

run().catch(console.error);
