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

  // Let's test calling with start_date / end_date or startDate / endDate
  const testUrls = [
    `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?startDate=2027-01-06&endDate=2027-01-11`,
    `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?start_date=2027-01-06&end_date=2027-01-11`
  ];

  for (const url of testUrls) {
    console.log('\nTesting URL:', url);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
    const json = await res.json();
    const items = Array.isArray(json) ? json : (json.data || json.calendar || []);
    if (items[0] && items[0].days) {
      console.log(`Primi 3 giorni del primo item:`, items[0].days.slice(0, 3).map(d => ({ date: d.date, stopSells: d.stopSells })));
    }
  }
}

run().catch(console.error);
