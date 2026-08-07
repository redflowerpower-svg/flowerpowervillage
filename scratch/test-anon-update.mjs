import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const envPaths = ['.env.local', '.env'];
  let envConfig = {};
  
  for (const envFile of envPaths) {
    const fullPath = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          let key = match[1];
          let value = match[2] || '';
          if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
            value = value.substring(1, value.length - 1);
          }
          if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
            value = value.substring(1, value.length - 1);
          }
          envConfig[key] = value.trim();
        }
      });
      break;
    }
  }
  return envConfig;
}

const env = loadEnv();
const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function testUpdate() {
  console.log('--- Testing SELECT with Anon Client ---');
  const { data: selData, error: selErr } = await anonClient.from('accommodations').select('id, name, details').limit(1);
  console.log('Select result:', selData ? `Found ${selData.length} row` : 'No data', selErr);

  if (selData && selData.length > 0) {
    const row = selData[0];
    console.log(`\n--- Testing UPDATE on "${row.name}" (${row.id}) with Anon Client ---`);
    let currentDetails = typeof row.details === 'object' && row.details !== null ? row.details : {};
    if (typeof currentDetails === 'string') {
      try { currentDetails = JSON.parse(currentDetails); } catch { currentDetails = {}; }
    }

    const testDetails = {
      ...currentDetails,
      test_anon_update: new Date().toISOString()
    };

    const { data: updateData, error: updateErr, status, count } = await anonClient
      .from('accommodations')
      .update({ details: testDetails })
      .eq('id', row.id)
      .select();

    console.log('Anon Update Status Code:', status);
    console.log('Anon Update Error:', updateErr?.message);
    console.log('Anon Update Returned Data:', updateData);

    // Check if RLS silently allowed 0 rows updated
    if (!updateErr && (!updateData || updateData.length === 0)) {
      console.error('\n⚠️ RLS SILENT BLOCK DETECTED! Supabase returned 0 updated rows for anon client without throwing error!');
    }

    console.log(`\n--- Testing UPDATE on "${row.name}" (${row.id}) with Service Role Client ---`);
    const { data: servData, error: servErr } = await serviceClient
      .from('accommodations')
      .update({ details: testDetails })
      .eq('id', row.id)
      .select();

    console.log('Service Role Update Error:', servErr?.message);
    console.log('Service Role Update Returned Data:', servData);
  }
}

testUpdate();
