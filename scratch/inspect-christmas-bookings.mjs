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

async function findEricBooking() {
  const { data: tokenData } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').single();
  const token = tokenData.access_token;
  const structureId = envVars.VITE_OCTORATE_STRUCTURE_ID || '366879';

  const dateFrom = '2026-12-20';
  const dateTo = '2027-01-05';

  const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/${structureId}?type=STAY&startDate=${dateFrom}&endDate=${dateTo}&size=50&page=0`;
  const res = await fetch(octUrl, {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
  });

  const json = await res.json();
  const list = json.data || (Array.isArray(json) ? json : (json.reservations || []));

  console.log(`=== PRENOTAZIONI NEL PERIODO NATALE (20/12/2026 - 05/01/2027) ===\n`);

  for (const b of list) {
    const guest = `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.guestName;
    console.log(`- ID: ${b.id} | Codice: ${b.referenceId || b.reservationCode} | Ospite: ${guest} | Canale: ${b.channelName || b.portalName} | Check-in: ${b.checkin} -> Check-out: ${b.checkout} | Status: ${b.status}`);
    if (Array.isArray(b.rooms)) {
      b.rooms.forEach((rm, idx) => {
        console.log(`   Room ${idx+1}: ${rm.roomName || rm.name} (RoomID: ${rm.roomId || rm.id})`);
      });
    }
  }
}

findEricBooking().catch(console.error);
