import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const envFiles = ['.env', '.env.local'];
  for (const f of envFiles) {
    const full = path.resolve(process.cwd(), f);
    if (fs.existsSync(full)) {
      const lines = fs.readFileSync(full, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function downloadAllRecentBookings() {
  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('*')
    .eq('id', 'singleton')
    .single();

  const accessToken = tokenData.access_token;
  const allBookings = [];
  const maxPages = 15; // 20 prenotazioni per pagina = 300 prenotazioni più recenti

  console.log(`Inizio download fino a ${maxPages} pagine di prenotazioni...`);

  for (let page = 0; page < maxPages; page++) {
    const url = `https://api.octorate.com/connect/rest/v1/reservation/366879?page=${page}`;
    try {
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      if (!res.ok) {
        console.error(`Page ${page} failed: ${res.status}`);
        break;
      }
      const json = await res.json();
      const items = json.data || [];
      if (items.length === 0) break;
      allBookings.push(...items);
      console.log(`Page ${page}: scaricate ${items.length} prenotazioni (totale finora: ${allBookings.length})`);
    } catch (e) {
      console.error(`Page ${page} error:`, e.message);
      break;
    }
  }

  fs.writeFileSync('scratch/all_recent_bookings.json', JSON.stringify(allBookings, null, 2));
  console.log(`Totale scaricate: ${allBookings.length} prenotazioni salvate in scratch/all_recent_bookings.json`);
}

downloadAllRecentBookings().catch(console.error);
