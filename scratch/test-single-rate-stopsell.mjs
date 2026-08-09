import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnvironment() {
  const envPaths = ['.env', '.env.local'];
  for (const envPath of envPaths) {
    const fullPath = path.resolve(process.cwd(), envPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          }
        }
      }
    }
  }
}

loadEnvironment();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testSingleRateStopSell() {
  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  const accessToken = tokenData.access_token;
  const structureId = process.env.VITE_OCTORATE_STRUCTURE_ID || '366879';
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const dateFrom = '2026-12-15';

  const allItems = [];
  for (let page = 0; page < 15; page++) {
    const getUrl = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${dateFrom}&dateTo=${dateFrom}&size=20&page=${page}`;
    const getRes = await fetch(getUrl, { headers });
    const getJson = await getRes.json();
    const items = Array.isArray(getJson.data) ? getJson.data : (Array.isArray(getJson) ? getJson : []);
    if (items.length === 0) break;
    allItems.push(...items);
  }

  console.log(`Total items retrieved for ${dateFrom}: ${allItems.length}`);
  const rateData = allItems.find(item => String(item.id || item.room || item.ratePlanId) === '529784');
  console.log('Live Calendar Item #529784:', rateData);
}

testSingleRateStopSell();
