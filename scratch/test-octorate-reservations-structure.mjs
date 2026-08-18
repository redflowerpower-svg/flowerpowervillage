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

async function testFetchReservations() {
  const url = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL;
  const key = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(url, key);

  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  const dateFrom = new Date().toISOString().substring(0, 10);
  const dateToObj = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  const dateTo = dateToObj.toISOString().substring(0, 10);
  const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=${dateFrom}&endDate=${dateTo}&size=100`;

  const octRes = await fetch(octUrl, {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
      'Accept': 'application/json'
    }
  });

  const octJson = await octRes.json();
  const bookingsData = octJson && Array.isArray(octJson.data) ? octJson.data : (Array.isArray(octJson) ? octJson : (octJson.reservations || []));

  console.log(`Trovate ${bookingsData.length} prenotazioni da Octorate.`);
  if (bookingsData.length > 0) {
    console.log('Esempio prima prenotazione:', JSON.stringify(bookingsData[0], null, 2));
    // Find any booking on Fake Bungalow 1 or 2
    const fakeBookings = bookingsData.filter(b => JSON.stringify(b).includes('649669') || JSON.stringify(b).includes('921799') || JSON.stringify(b).toLowerCase().includes('fake'));
    console.log(`Prenotazioni Fake Bungalow trovate (${fakeBookings.length}):`, JSON.stringify(fakeBookings, null, 2));
  }
}

testFetchReservations();
