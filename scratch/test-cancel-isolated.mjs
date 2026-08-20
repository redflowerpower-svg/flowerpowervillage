import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env');
const envVars = {};
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) envVars[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
  }
}

const supabase = createClient(
  envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY
);

const STRUCTURE_ID = envVars.VITE_OCTORATE_STRUCTURE_ID || '366879';
const CLIENT_ID = envVars.VITE_OCTORATE_CLIENT_ID || envVars.OCTORATE_CLIENT_ID;

async function run() {
  const { data } = await supabase.from('octorate_tokens').select('*').eq('id', 'singleton').single();
  const token = data.access_token;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Octorate-Api-Key': CLIENT_ID,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  console.log('Testing GET single reservation 125556986...');
  const resGet = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/${STRUCTURE_ID}/125556986`, { headers });
  console.log('GET Status:', resGet.status);
  const getJson = await resGet.json();
  console.log('GET Body:', JSON.stringify(getJson, null, 2));

  console.log('\nTesting PUT Cancel on 125556986...');
  const resPut = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/${STRUCTURE_ID}/125556986`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status: 'CANCELLED' })
  });
  console.log('PUT Status:', resPut.status);
  const putJson = await resPut.json();
  console.log('PUT Body:', JSON.stringify(putJson, null, 2));

  console.log('\nTesting DELETE on 125556986...');
  const resDel = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/${STRUCTURE_ID}/125556986`, {
    method: 'DELETE',
    headers
  });
  console.log('DELETE Status:', resDel.status);
}

run().catch(console.error);
