import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
}

async function testFullSeasonWebhook() {
  const url = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL;
  const key = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(url, key);

  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  const todayISO = new Date().toISOString().substring(0, 10);
  const endISO = '2027-10-31';
  const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=${todayISO}&endDate=${endISO}&size=250`;

  const octRes = await fetch(octUrl, {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
      'Accept': 'application/json'
    }
  });

  const octJson = await octRes.json();
  const bookingsData = octJson && Array.isArray(octJson.data) ? octJson.data : (Array.isArray(octJson) ? octJson : (octJson.reservations || []));

  console.log(`Scaricati ${bookingsData.length} booking live per tutta la stagione (${todayISO} -> ${endISO}).`);

  // Verify December bookings are present
  const decBookings = bookingsData.filter(b => {
    const inStr = String(b.checkin || b.check_in || '').slice(0, 7);
    return inStr === '2026-12' || inStr === '2027-01';
  });

  console.log(`Prenotazioni trovate nel periodo di Natale/Capodanno: ${decBookings.length}`);
  decBookings.forEach(b => {
    console.log(` - ${b.roomName || b.product}: ${b.checkin?.slice(0, 10)} -> ${b.checkout?.slice(0, 10)} (${b.status})`);
  });
}

testFullSeasonWebhook();
