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

async function checkCalendarValues() {
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: tokenData } = await supabase.from('octorate_tokens').select('*').eq('id', 'singleton').maybeSingle();
  
  const clientId = envVars.VITE_OCTORATE_CLIENT_ID || envVars.OCTORATE_CLIENT_ID;
  const clientSecret = envVars.OCTORATE_SECRET_KEY || envVars.VITE_OCTORATE_SECRET_KEY;
  const refreshToken = tokenData?.refresh_token;

  let accessToken = tokenData?.access_token;
  if (refreshToken && clientId && clientSecret) {
    const refreshRes = await fetch("https://api.octorate.com/connect/rest/v1/identity/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret
      }).toString()
    });
    if (refreshRes.ok) {
      const newTokens = await refreshRes.json();
      accessToken = newTokens.access_token;
      await supabase.from('octorate_tokens').upsert({
        id: 'singleton',
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token || refreshToken,
        expires_in: newTokens.expires_in,
        updated_at: new Date().toISOString()
      });
      console.log('Token refreshed OK');
    }
  }
  
  const res = await fetch(`https://api.octorate.com/connect/rest/v1/calendar?room=421511&dateFrom=2026-12-28&dateTo=2027-01-06`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });
  const json = await res.json();
  console.log('Penthouse Villa 421511 Calendar:', JSON.stringify(json, null, 2));

  const res2 = await fetch(`https://api.octorate.com/connect/rest/v1/calendar?room=921799&dateFrom=2026-12-26&dateTo=2027-01-05`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });
  const json2 = await res2.json();
  console.log('Fake Bungalow 2 921799 Calendar:', JSON.stringify(json2, null, 2));
}

checkCalendarValues();
