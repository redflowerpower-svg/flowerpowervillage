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

async function testPostSubscription() {
  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('*')
    .eq('id', 'singleton')
    .single();

  const accessToken = tokenData.access_token;
  const targetUrl = "https://flowerpowervillage.vercel.app/api/webhooks/octorate";
  const events = ['RESERVATION_CREATED', 'RESERVATION_CHANGE', 'RESERVATION_CANCELLED'];

  for (const ev of events) {
    const url = `https://api.octorate.com/connect/rest/v1/subscription/${ev}`;
    const bodyParams = new URLSearchParams();
    bodyParams.append('url', targetUrl);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: bodyParams.toString()
      });
      console.log(`POST ${ev} -> HTTP ${res.status}`);
      const text = await res.text();
      console.log(`Response: ${text}`);
    } catch (e) {
      console.error(`Error POST ${ev}:`, e.message);
    }
  }
}

testPostSubscription().catch(console.error);
