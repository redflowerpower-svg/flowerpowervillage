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

async function findJonni() {
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').maybeSingle();
  
  let bookingsData = [];
  let page = 0;
  while (page <= 25) {
    const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=2026-08-20&endDate=2027-10-31&size=100&page=${page}`;
    const octRes = await fetch(octUrl, {
      headers: { 'Authorization': `Bearer ${data.access_token}`, 'Accept': 'application/json' }
    });
    if (octRes.ok) {
      const octJson = await octRes.json();
      const pageData = octJson && Array.isArray(octJson.data) ? octJson.data : (Array.isArray(octJson) ? octJson : (octJson.reservations || []));
      if (pageData.length > 0) {
        bookingsData.push(...pageData);
        const totalPages = Number(octJson.page?.totalPages || octJson.totalPages || 1);
        if (page + 1 >= totalPages || pageData.length === 0) break;
        page++;
      } else break;
    } else break;
  }

  console.log(`Total reservations fetched: ${bookingsData.length}`);

  const jonniBookings = bookingsData.filter(b => {
    const str = JSON.stringify(b).toLowerCase();
    return str.includes('jonni') || str.includes('laaksonkammil') || str.includes('123056761');
  });

  console.log(`Found ${jonniBookings.length} bookings for Jonni:`);
  jonniBookings.forEach(b => {
    console.log(JSON.stringify(b, null, 2));
  });
}

findJonni();
