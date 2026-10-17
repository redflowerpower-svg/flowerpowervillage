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
  
  console.log('Querying Octorate live calendar for product 495565 (P&L AC14d) between 2027-01-01 and 2027-01-15...');
  const url = `https://api.octorate.com/connect/rest/v1/calendar/366879?startDate=2027-01-01&endDate=2027-01-15&roomRates=495565`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
  const json = await res.json();
  console.log('Calendar Response Status:', res.status);
  console.log('Raw JSON (first 2 items):', JSON.stringify(Array.isArray(json) ? json.slice(0, 2) : json, null, 2));

  // Let's also check other products of P&L: 495552 (P&L AC7d), 495587 (P&L AC bnb-7d), 495593 (P&L AC bnb-14d), 495575 (P&L Main bnb-7d), 495580 (P&L Main bnb-14d), 495549 (P&L 7d)
  console.log('\nQuerying all P&L products on Octorate for 2027-01-07...');
  const plRates = '495565,495552,495587,495593,495575,495580,495549,495566';
  const url2 = `https://api.octorate.com/connect/rest/v1/calendar/366879?startDate=2027-01-07&endDate=2027-01-08&roomRates=${plRates}`;
  const res2 = await fetch(url2, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
  const json2 = await res2.json();
  const items2 = Array.isArray(json2) ? json2 : (json2.data || json2.calendar || []);
  items2.forEach(it => {
    console.log(`Product: ${it.roomRateId || it.roomRate} | Data: ${it.date} | closed: ${it.closed} | stopSells: ${it.stopSells} | closedArrival: ${it.closedArrival} | minStay: ${it.minStay}`);
  });
}

run().catch(console.error);
