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
const supabase = createClient(envVars.SUPABASE_URL || envVars.VITE_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: tokenData } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').maybeSingle();
  const token = tokenData.access_token;
  
  const res = await fetch(`https://api.octorate.com/connect/rest/v1/calendar/366879?dateFrom=2026-12-27&dateTo=2027-01-03&size=50`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  const json = await res.json();
  const list = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
  const pentItems = list.filter(item => String(item.room) === '421511' || String(item.product) === '421511');
  console.log(`Calendar records found for Penthouse: ${pentItems.length}`);
  pentItems.forEach(d => {
    console.log(`${d.date}: available=${d.available} (octorate rooms/beds) | stopSell=${d.stopSell} | closed=${d.closed}`);
  });
}

run().catch(console.error);
