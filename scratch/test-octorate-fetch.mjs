import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const envFiles = ['.env', '.env.local'];
  for (const f of envFiles) {
    const full = path.resolve(process.cwd(), f);
    if (fs.existsSync(full)) {
      const lines = fs.readFileSync(full, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testOctorateFetch() {
  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('*')
    .eq('id', 'singleton')
    .single();

  const accessToken = tokenData.access_token;
  const todayISO = '2026-10-18';
  const endISO = '2027-10-31';
  const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=${todayISO}&endDate=${endISO}&size=100&page=0`;

  console.log("Fetching:", octUrl);
  const res = await fetch(octUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });

  console.log("Status:", res.status);
  const json = await res.json();
  console.log("Page data length:", json.data?.length, "Total pages:", json.page?.totalPages);
}

testOctorateFetch().catch(console.error);
