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
  const clientId = envVars.VITE_OCTORATE_CLIENT_ID || envVars.OCTORATE_CLIENT_ID || '';

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (clientId) headers['Octorate-Api-Key'] = clientId;

  const roomsToClose = [330970, 495979, 495806, 421527, 331922, 331924];
  console.log(`Sending explicit StopSell to ${roomsToClose.length} rooms starting from 2026-10-16...`);
  
  const payload = roomsToClose.map(id => ({
    room: id,
    dateFrom: '2026-10-16',
    dateTo: '2027-05-31',
    values: {
      stopSells: true,
      closed: true,
      closedArrival: true,
      closedDeparture: true
    }
  }));

  const res = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  console.log('Bulk response status:', res.status);
  console.log('Bulk response text:', await res.text());
}

run().catch(console.error);
