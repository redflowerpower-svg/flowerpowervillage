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

async function inspectPages() {
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

  const res1 = await fetch(`https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=2026-11-01&dateTo=2026-11-05&size=100&page=1`, { headers });
  const json1 = await res1.json();
  console.log('Page 1 response keys:', Object.keys(json1));
  console.log('Page info:', json1.page);
  console.log('Total items in data array:', json1.data ? json1.data.length : 'no data array');

  // Search for FB1 IDs in data
  const testIds = [932243, 932244, 932246, 932247, 932248, 932249, 932250, 932251, 932252, 932253, 932254, 932255];
  const foundTestIds = json1.data ? json1.data.filter(item => testIds.includes(Number(item.id))) : [];
  console.log(`Found ${foundTestIds.length} test IDs in page 1 (size=100)`);
}

inspectPages().catch(err => console.error(err));
