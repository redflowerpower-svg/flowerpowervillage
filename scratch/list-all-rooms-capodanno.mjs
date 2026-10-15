import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

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
            envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
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
  const { data: tokenData } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').maybeSingle();
  const token = tokenData.access_token;

  let all = [];
  for (let page = 0; page < 3; page++) {
    const res = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=2026-12-25&endDate=2027-01-05&size=100&page=${page}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const j = await res.json();
    const list = Array.isArray(j.data) ? j.data : (Array.isArray(j) ? j : (j.reservations || []));
    all.push(...list);
    if (list.length < 100) break;
  }

  const confirmed = all.filter(r => r.status === 'CONFIRMED' && (r.checkin?.slice(0, 10) <= '2027-01-02' && r.checkout?.slice(0, 10) >= '2026-12-28'));
  console.log(`\n=== SITUAZIONE TUTTI GLI ALLOGGI (28 DIC 2026 - 2 GEN 2027) ===`);
  confirmed.sort((a,b) => (a.roomName || '').localeCompare(b.roomName || ''));
  confirmed.forEach(r => {
    console.log(`- Alloggio: "${r.roomName}" | Ospite: ${r.firstName} ${r.lastName} (${r.channelName}) | Soggiorno: ${r.checkin?.slice(0, 10)} -> ${r.checkout?.slice(0, 10)} | ID: ${r.id}`);
  });
}

run().catch(console.error);
