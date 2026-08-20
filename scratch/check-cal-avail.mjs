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

async function checkCalendarAvailability() {
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: tokenData } = await supabase.from('octorate_tokens').select('*').eq('id', 'singleton').maybeSingle();
  const accessToken = tokenData?.access_token;
  const structureId = '366879';

  let page = 0;
  let allItems = [];
  while (page < 15) {
    const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=2027-01-01&dateTo=2027-01-22&size=20&page=${page}`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' }
    });
    const json = await res.json();
    const list = Array.isArray(json) ? json : (json.data || []);
    if (list.length === 0) break;
    allItems.push(...list);
    if (list.length < 20) break;
    page++;
  }

  const targetRates = [529773, 495795, 495796];
  const matched = allItems.filter(r => targetRates.includes(Number(r.id)));

  matched.forEach(r => {
    console.log(`\n========================================`);
    console.log(`Rate: "${r.name}" (ID: ${r.id})`);
    if (r.days) {
      r.days.forEach(d => {
        console.log(`   ${d.date}: avail=${d.availability}, stopSells=${d.stopSells}, closed=${d.closed}, minStay=${d.minStay}`);
      });
    }
  });
}

checkCalendarAvailability();
