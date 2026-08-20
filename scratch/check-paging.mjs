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

async function checkPaging() {
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').maybeSingle();
  
  const todayISO = '2026-08-20';
  const endISO = '2027-10-31';

  // Let's test calling page 0 with size=200
  const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=${todayISO}&endDate=${endISO}&size=200&page=0`;
  const octRes = await fetch(octUrl, {
    headers: {
      'Authorization': `Bearer ${data.access_token}`,
      'Accept': 'application/json'
    }
  });
  const json = await octRes.json();
  console.log('Page 0 json keys:', Object.keys(json));
  console.log('Total elements/pages info:', json.page, json.totalPages, json.totalElements);
  console.log('Items count on page 0:', (json.data || []).length);
  
  // Find Peter (124094840) and Jonni (123056761)
  const allItems = json.data || [];
  const foundPeter = allItems.find(b => String(b.id) === '124094840');
  const foundJonni = allItems.find(b => String(b.id) === '123056761');
  console.log('Found Peter in page 0?', Boolean(foundPeter));
  console.log('Found Jonni in page 0?', Boolean(foundJonni));
  
  if (foundPeter) console.log('Peter details:', JSON.stringify(foundPeter, null, 2));
  if (foundJonni) console.log('Jonni details:', JSON.stringify(foundJonni, null, 2));
}

checkPaging();
