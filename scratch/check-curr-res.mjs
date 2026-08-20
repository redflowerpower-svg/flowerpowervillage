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

async function checkCurrentReservations() {
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: tokenData } = await supabase.from('octorate_tokens').select('*').eq('id', 'singleton').maybeSingle();
  const accessToken = tokenData?.access_token;

  let page = 0;
  let allBookings = [];
  while (page <= 25) {
    const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=2026-12-01&endDate=2027-01-31&size=100&page=${page}`;
    const octRes = await fetch(octUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    if (octRes.ok) {
      const octJson = await octRes.json();
      const pageData = octJson && Array.isArray(octJson.data) ? octJson.data : (Array.isArray(octJson) ? octJson : (octJson.reservations || []));
      if (pageData.length > 0) {
        allBookings.push(...pageData);
        const totalPages = Number(octJson.page?.totalPages || octJson.totalPages || 1);
        if (page + 1 >= totalPages || pageData.length === 0) break;
        page++;
      } else break;
    } else break;
  }

  console.log(`Total reservations fetched for Dec-Jan: ${allBookings.length}`);
  
  const targetKeywords = ['penthouse', 'pent', 'green', 'fake'];
  const matched = allBookings.filter(b => {
    const rName = String(b.roomName || '').toLowerCase();
    return targetKeywords.some(kw => rName.includes(kw));
  });

  matched.sort((a,b) => String(a.checkin).localeCompare(String(b.checkin))).forEach(b => {
    console.log(`- ID: ${b.id} | Room: "${b.roomName}" | Product: ${b.product} | ${b.checkin?.slice(0, 10)} -> ${b.checkout?.slice(0, 10)} | Status: ${b.status} | Guest: "${b.guestName || b.firstName}"`);
  });
}

checkCurrentReservations();
