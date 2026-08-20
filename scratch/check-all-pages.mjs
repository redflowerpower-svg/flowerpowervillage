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

async function checkAllPages() {
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').maybeSingle();
  
  let page = 0;
  let allBookings = [];
  while (page <= 25) {
    const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=2026-08-20&endDate=2027-10-31&size=100&page=${page}`;
    const octRes = await fetch(octUrl, {
      headers: { 'Authorization': `Bearer ${data.access_token}`, 'Accept': 'application/json' }
    });
    if (octRes.ok) {
      const octJson = await octRes.json();
      console.log(`Page ${page} response keys:`, Object.keys(octJson));
      console.log(`Page ${page} page object:`, octJson.page);
      const pageData = octJson && Array.isArray(octJson.data) ? octJson.data : (Array.isArray(octJson) ? octJson : (octJson.reservations || []));
      console.log(`Page ${page} items count: ${pageData.length}`);
      if (pageData.length > 0) {
        allBookings.push(...pageData);
        // Look at page object:
        // Is totalPages in octJson.page.totalPages or something else?
        page++;
      } else {
        break;
      }
    } else {
      console.log(`Page ${page} HTTP error: ${octRes.status}`);
      break;
    }
  }

  console.log(`Total reservations fetched: ${allBookings.length}`);
  const jonni = allBookings.find(b => JSON.stringify(b).toLowerCase().includes('jonni'));
  console.log(`Found Jonni?`, Boolean(jonni));
  if (jonni) console.log('Jonni found on which page?', JSON.stringify(jonni, null, 2));
}

checkAllPages();
