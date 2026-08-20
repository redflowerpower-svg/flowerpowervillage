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

async function checkPenthouse() {
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').maybeSingle();
  if (!data?.access_token) {
    console.error('No token');
    return;
  }
  
  const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=2026-12-01&endDate=2027-01-31&size=200&page=0`;
  const res = await fetch(octUrl, {
    headers: {
      'Authorization': `Bearer ${data.access_token}`,
      'Accept': 'application/json'
    }
  });
  const json = await res.json();
  const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : (json.reservations || []));
  console.log(`Found ${items.length} reservations for Dec 2026 - Jan 2027:`);
  items.forEach(r => {
    console.log(`- ID: ${r.id} | Name: ${r.guestName || r.firstName} | Room: "${r.roomName}" | Product: "${r.product}" | ${r.checkin?.slice(0, 10)} -> ${r.checkout?.slice(0, 10)}`);
  });
}

checkPenthouse();
