import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { checkAndNotifyOverbookings } from '../api/_helpers/overbooking-detector.js';
import { ALL_ACCOMMODATIONS_MAP } from '../api/_handlers/octorate-webhook.js';

function loadEnv() {
  const envVars = {};
  const files = ['.env.local', '.env'];
  for (const file of files) {
    const filePath = path.resolve(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0 && !envVars[key.trim()]) {
            const val = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
            envVars[key.trim()] = val;
            process.env[key.trim()] = val;
          }
        }
      }
    }
  }
  return envVars;
}

const envVars = loadEnv();
const supabase = createClient(envVars.SUPABASE_URL || envVars.VITE_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log('--- TEST LIVE TRIGGER OVERBOOKING DETECTOR ---');
  const { data: tokenData } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').maybeSingle();
  const token = tokenData.access_token;

  let bookings = [];
  for (let page = 0; page < 3; page++) {
    const res = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=2026-12-20&endDate=2027-01-10&size=100&page=${page}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const j = await res.json();
    const list = Array.isArray(j.data) ? j.data : (Array.isArray(j) ? j : (j.reservations || []));
    bookings.push(...list);
    if (list.length < 100) break;
  }

  console.log(`Caricate ${bookings.length} prenotazioni per il periodo.`);

  // Eseguiamo il detector
  const result = await checkAndNotifyOverbookings(bookings, supabase, ALL_ACCOMMODATIONS_MAP);
  console.log('Risultato detector:', result);
}

run().catch(console.error);
