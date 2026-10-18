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

async function checkOctorateWebhooks() {
  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('*')
    .eq('id', 'singleton')
    .single();

  const accessToken = tokenData.access_token;
  const endpoints = [
    'https://api.octorate.com/connect/rest/v1/webhook/366879',
    'https://api.octorate.com/connect/rest/v1/webhook',
    'https://api.octorate.com/connect/rest/v1/webhooks',
    'https://api.octorate.com/connect/rest/v1/hook/366879'
  ];

  for (const u of endpoints) {
    try {
      const res = await fetch(u, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      console.log(`Endpoint ${u} -> Status ${res.status}`);
      if (res.ok) {
        const d = await res.json();
        console.log("Response:", JSON.stringify(d, null, 2));
      } else {
        console.log("Error text:", (await res.text()).slice(0, 100));
      }
    } catch (e) {
      console.log(`Error ${u}:`, e.message);
    }
  }
}

checkOctorateWebhooks().catch(console.error);
