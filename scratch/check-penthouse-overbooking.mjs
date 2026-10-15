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
const supabaseUrl = envVars.SUPABASE_URL || envVars.VITE_SUPABASE_URL;
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;

async function run() {
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: tokenData } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').maybeSingle();
  
  // Let's also fetch multiple pages if needed, or query specifically
  let allReservations = [];
  for (let page = 0; page < 3; page++) {
    const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=2026-12-01&endDate=2027-01-31&size=100&page=${page}`;
    const res = await fetch(octUrl, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json'
      }
    });
    const json = await res.json();
    const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : (json.reservations || []));
    allReservations.push(...items);
    if (items.length < 100) break;
  }

  console.log(`Fetched total reservations in Dec/Jan: ${allReservations.length}`);

  // Look for Penthouse Villa bookings
  const penthouseBookings = allReservations.filter(r => {
    const text = `${r.roomName || ''} ${r.product || ''} ${r.ratePlanName || ''}`.toLowerCase();
    const isPent = text.includes('pent') || ['449348', '421511', '421532', '421516', '421520'].some(id => String(r.product).includes(id) || String(r.roomId).includes(id));
    return isPent;
  });

  console.log(`\n=== TUTTE LE PRENOTAZIONI PENTHOUSE VILLA (CONFERMATE E NON) ===`);
  penthouseBookings.sort((a,b) => (a.checkin > b.checkin ? 1 : -1));
  for (const r of penthouseBookings) {
    console.log(`ID: ${r.id} | Status: ${r.status} | Canale: ${r.channelName || r.ota} | Ospite: ${r.firstName} ${r.lastName} | Date: ${r.checkin?.slice(0, 10)} -> ${r.checkout?.slice(0, 10)} | Creata il: ${r.createTime} | Modificata: ${r.modifyTime || 'N/A'} | Room: "${r.roomName}" | Prod: "${r.product}" | Notes: ${r.notes || ''}`);
  }

  // Also check if any booking has checkin 2026-12-28 and checkout 2027-01-02 regardless of room
  console.log(`\n=== PRENOTAZIONI CHE COPRONO 28 DICEMBRE 2026 - 2 GENNAIO 2027 ===`);
  const overlapping = allReservations.filter(r => {
    const cin = (r.checkin || '').slice(0, 10);
    const cout = (r.checkout || '').slice(0, 10);
    return cin <= '2027-01-02' && cout >= '2026-12-28' && r.status !== 'CANCELLED';
  });
  overlapping.forEach(r => {
    console.log(`ID: ${r.id} | Status: ${r.status} | Room: "${r.roomName}" | Canale: ${r.channelName} | Ospite: ${r.firstName} ${r.lastName} | Date: ${r.checkin?.slice(0, 10)} -> ${r.checkout?.slice(0, 10)} | Creata il: ${r.createTime}`);
  });
}

run().catch(console.error);
