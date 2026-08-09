import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const envPaths = ['.env.local', '.env'];
  let envConfig = {};
  
  for (const envFile of envPaths) {
    const fullPath = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          let key = match[1];
          let value = match[2] || '';
          if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
            value = value.substring(1, value.length - 1);
          }
          if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
            value = value.substring(1, value.length - 1);
          }
          envConfig[key] = value.trim();
        }
      });
      break;
    }
  }
  return envConfig;
}

const env = loadEnv();
const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SERVICE_ROLE;
const OCTORATE_STRUCTURE_ID = env.VITE_OCTORATE_STRUCTURE_ID || '366879';
const OCTORATE_API_BASE = 'https://api.octorate.com/connect/rest/v1';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Errore: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY non trovati.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function getOctorateToken() {
  const { data, error } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .single();

  if (error || !data?.access_token) {
    throw new Error(`Errore token: ${error?.message}`);
  }
  return data.access_token;
}

async function getCalendarData(token, rateId, dateFrom, dateTo) {
  const url = `${OCTORATE_API_BASE}/calendar/${OCTORATE_STRUCTURE_ID}?product=${rateId}&dateFrom=${dateFrom}&dateTo=${dateTo}`;
  try {
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

async function main() {
  try {
    console.log('========================================================================');
    console.log('🔍 INIZIO DIAGNOSTICA: VERIFICA STATO TARIFFE OTA (BOOKING & AGODA)');
    console.log('========================================================================\n');

    const token = await getOctorateToken();
    console.log('🔑 [STEP 1] Recupero token Octorate... OK ✅\n');

    console.log('📡 [STEP 2] Scaricamento del catalogo tariffe da Octorate...');
    const roomsRes = await fetch(`https://api.octorate.com/connect/rest/v3/roomrates/${OCTORATE_STRUCTURE_ID}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!roomsRes.ok) throw new Error(`Errore scaricamento: HTTP ${roomsRes.status}`);
    const allProducts = await roomsRes.json();
    
    // Booking.com rates (contains "main bnb-7d" or "main bnb-14d")
    const bookingRates = allProducts.filter(prod => {
      if (!prod.name) return false;
      const nameLower = prod.name.toLowerCase();
      return nameLower.includes('main bnb-7d') || nameLower.includes('main bnb-14d');
    });

    // Agoda AC rates (strictly "agd ac-7d" or "agd ac-14d")
    const agodaRates = allProducts.filter(prod => {
      if (!prod.name) return false;
      const nameLower = prod.name.toLowerCase();
      return nameLower.includes('agd ac-7d') || nameLower.includes('agd ac-14d');
    });

    console.log(`🔵 Trovate ${bookingRates.length} Tariffe Booking (Main bnb-7d/14d) nel catalogo.`);
    console.log(`💗 Trovate ${agodaRates.length} Tariffe Agoda (AGD AC-7d/14d) nel catalogo.\n`);

    const DATE_FROM = new Date().toISOString().slice(0, 10);
    const DATE_TO = '2026-10-31'; // Check until the end of summer season

    console.log(`📅 Analisi del periodo: Dal ${DATE_FROM} Al ${DATE_TO} (compresi)`);
    console.log('------------------------------------------------------------------------');

    console.log('\n📊 ANALISI TARIFFE BOOKING.COM (B):');
    for (const rate of bookingRates) {
      process.stdout.write(`⏳ Analisi "${rate.name}" (ID: ${rate.id})... `);
      const calendar = await getCalendarData(token, rate.id, DATE_FROM, DATE_TO);
      if (!calendar || !calendar.days || calendar.days.length === 0) {
        console.log('🔴 ERRORE LETTURA DATI');
        continue;
      }

      let totalDays = calendar.days.length;
      let openDays = 0;
      calendar.days.forEach(day => {
        const closed = day.closed === true || day.closed === 'true';
        if (!closed) openDays++;
      });

      if (openDays === totalDays) {
        console.log(`🟢 ATTIVO 100% (${openDays}/${totalDays} giorni aperti)`);
      } else if (openDays === 0) {
        console.log(`🔴 COMPLETAMENTE CHIUSO (0/${totalDays} giorni aperti)`);
      } else {
        console.log(`⚠️ PARZIALE (${openDays}/${totalDays} giorni aperti)`);
      }
    }

    console.log('\n📊 ANALISI TARIFFE AGODA (A):');
    for (const rate of agodaRates) {
      process.stdout.write(`⏳ Analisi "${rate.name}" (ID: ${rate.id})... `);
      const calendar = await getCalendarData(token, rate.id, DATE_FROM, DATE_TO);
      if (!calendar || !calendar.days || calendar.days.length === 0) {
        console.log('🔴 ERRORE LETTURA DATI');
        continue;
      }

      let totalDays = calendar.days.length;
      let openDays = 0;
      calendar.days.forEach(day => {
        const closed = day.closed === true || day.closed === 'true';
        if (!closed) openDays++;
      });

      if (openDays === totalDays) {
        console.log(`🟢 ATTIVO 100% (${openDays}/${totalDays} giorni aperti)`);
      } else if (openDays === 0) {
        console.log(`🔴 COMPLETAMENTE CHIUSO (0/${totalDays} giorni aperti)`);
      } else {
        console.log(`⚠️ PARZIALE (${openDays}/${totalDays} giorni aperti)`);
      }
    }

    console.log('\n========================================================================');
    console.log('🎉 DIAGNOSTICA COMPLETATA!');
    console.log('========================================================================\n');

  } catch (error) {
    console.error('\n❌ ERRORE CRITICO DIAGNOSTICA:', error.message);
  }
}

main();
