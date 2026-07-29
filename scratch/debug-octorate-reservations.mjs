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

async function main() {
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  if (!tokenData?.access_token) {
    console.error('❌ Token non presente');
    return;
  }

  const token = tokenData.access_token;
  const structureId = '366879';

  const urlsToTest = [
    `https://api.octorate.com/connect/rest/v1/reservation/${structureId}?dateType=STAY&startDate=2026-07-01&endDate=2026-08-31`,
    `https://api.octorate.com/connect/rest/v1/reservation/${structureId}`,
    `https://api.octorate.com/connect/rest/v1/reservation?structure=${structureId}`,
    `https://api.octorate.com/connect/rest/v1/reservation`
  ];

  for (const url of urlsToTest) {
    console.log(`\n⏳ Testing URL: ${url}`);
    try {
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      console.log(`   HTTP Status: ${res.status}`);
      const text = await res.text();
      let json = null;
      try { json = JSON.parse(text); } catch {}
      if (res.ok) {
        const dataArray = json?.data || json?.reservations || (Array.isArray(json) ? json : []);
        console.log(`   ✅ Success! Found ${Array.isArray(dataArray) ? dataArray.length : 0} items.`);
        if (Array.isArray(dataArray) && dataArray.length > 0) {
          console.log('   Sample Item:', JSON.stringify(dataArray[0], null, 2));
        }
      } else {
        console.log(`   ❌ Error body: ${text.slice(0, 200)}`);
      }
    } catch (err) {
      console.error('   ❌ Fetch Exception:', err.message);
    }
  }
}

main();
