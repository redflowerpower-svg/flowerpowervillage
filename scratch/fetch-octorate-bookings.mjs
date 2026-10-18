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

async function fetchOctorateBookings() {
  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('*')
    .eq('id', 'singleton')
    .single();

  if (!tokenData?.access_token) {
    console.error("No access token found in octorate_tokens");
    return;
  }

  const accessToken = tokenData.access_token;
  console.log("AccessToken presente. Fetching reservations from Octorate API...");

  // Proviamo diversi endpoint noti di Octorate per le prenotazioni:
  // 1. https://api.octorate.com/connect/rest/v1/reservation/366879
  // 2. o con parametri data/search
  const endpoints = [
    'https://api.octorate.com/connect/rest/v1/reservation/366879',
    'https://api.octorate.com/connect/rest/v1/reservation/366879?limit=100',
    'https://api.octorate.com/connect/rest/v1/reservations/366879'
  ];

  for (const url of endpoints) {
    console.log(`\nTrying URL: ${url}`);
    try {
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      console.log(`HTTP Status: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        console.log("Success! Type of data:", Array.isArray(data) ? `Array (${data.length} items)` : typeof data);
        if (Array.isArray(data)) {
          console.log(`Trovate ${data.length} prenotazioni. Salviamo in scratch/octorate_raw_bookings.json`);
          fs.writeFileSync('scratch/octorate_raw_bookings.json', JSON.stringify(data, null, 2));
          return data;
        } else if (data && typeof data === 'object') {
          console.log("Keys in data:", Object.keys(data));
          fs.writeFileSync('scratch/octorate_raw_bookings.json', JSON.stringify(data, null, 2));
          return data;
        }
      } else {
        const text = await res.text();
        console.log(`Error body: ${text.slice(0, 300)}`);
      }
    } catch (e) {
      console.error("Fetch error:", e.message);
    }
  }
}

fetchOctorateBookings().catch(console.error);
