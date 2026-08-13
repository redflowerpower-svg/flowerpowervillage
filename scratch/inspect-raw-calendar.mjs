import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env');
const envVars = {};
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...rest] = trimmed.split('=');
    if (key) envVars[key.trim()] = rest.join('=').trim();
  }
}

const supabase = createClient(
  envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY
);

async function inspectRawData() {
  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  const accessToken = tokenData?.access_token;
  const structureId = envVars.VITE_OCTORATE_STRUCTURE_ID || '366879';
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json'
  };

  const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=2026-11-01&dateTo=2026-11-02`;
  const res = await fetch(url, { headers });
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Raw text length:', text.length);
  
  let json = JSON.parse(text);
  if (json.data && Array.isArray(json.data)) {
    console.log(`json.data has ${json.data.length} items`);
    json.data.forEach(item => {
      console.log(`ID: ${item.id} | name: "${item.name}" | roomName: "${item.roomName}" | code: "${item.code}"`);
    });
  } else if (Array.isArray(json)) {
    json.forEach(item => {
      console.log(`ID: ${item.id} | name: "${item.name}" | roomName: "${item.roomName}" | code: "${item.code}"`);
    });
  } else {
    console.log('Keys of json response:', Object.keys(json));
    console.log('Preview:', JSON.stringify(json).slice(0, 500));
  }
}

inspectRawData().catch(err => console.error(err));
