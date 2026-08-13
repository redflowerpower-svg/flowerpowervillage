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

async function checkGrid() {
  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  const accessToken = tokenData?.access_token;
  const structureId = envVars.VITE_OCTORATE_STRUCTURE_ID || '366879';

  // Import handler dynamically
  const { handleOctorateRestrictionsGrid } = await import('../api/_handlers/octorate-restrictions-grid.js');

  const mockReq = {
    method: 'GET',
    query: { testOnly: 'true' }
  };

  let responseData = null;
  const mockRes = {
    setHeader: () => {},
    status: (code) => ({
      json: (data) => {
        responseData = data;
        return data;
      }
    })
  };

  await handleOctorateRestrictionsGrid(mockReq, mockRes);

  console.log('\n================================================================');
  console.log('  📊 DATI GRID RESTRIZIONI RITORNATI DAL BACKEND (TEST MODE)');
  console.log('================================================================\n');

  if (responseData && responseData.grid) {
    for (const [planKey, periods] of Object.entries(responseData.grid)) {
      console.log(`📌 Plan: ${planKey.toUpperCase()} (${periods.length} periodi):`);
      periods.forEach(p => {
        console.log(`   ➔ [${p.dateFrom} .. ${p.dateTo}] | Strategy: ${p.strategy} | StopSell: ${p.stopSell} | CTA: ${p.closedToArrival} | Name: "${p.name}"`);
      });
    }
  } else {
    console.log('Response error or missing grid:', responseData);
  }
}

checkGrid().catch(err => console.error(err));
