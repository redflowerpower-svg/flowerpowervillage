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

function isClosed(item) {
  if (!item) return true;
  if (Array.isArray(item.days) && item.days.length > 0) {
    const day = item.days[0];
    if (day) {
      const dayStop = day.stopSells !== undefined ? day.stopSells : (day.stopSell !== undefined ? day.stopSell : day.closed);
      if (dayStop === true || dayStop === 'true' || dayStop === 1 || dayStop === '1') return true;
      if (day.available === false || day.price >= 10000) return true;
    }
  }
  const rawStop = item.stopSells !== undefined ? item.stopSells : (item.stopSell !== undefined ? item.stopSell : item.closed);
  if (rawStop === true || rawStop === 'true' || rawStop === 1 || rawStop === '1') return true;
  if (item.available === false || item.price >= 10000) return true;
  return false;
}

async function scanAirbnbRatesFullSeason() {
  console.log('========================================================================');
  console.log('  SCANSIONE LIVE TARIFFE AIRBNB E AC AIRBNB SU OCTORATE PMS');
  console.log('  Periodo: Da Oggi (10/08/2026) al 31 Ottobre 2027 (15 Mesi Completi)');
  console.log('========================================================================\n');

  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  const accessToken = tokenData.access_token;
  const structureId = process.env.VITE_OCTORATE_STRUCTURE_ID || '366879';
  const headers = { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' };

  const periodRanges = [
    { name: 'Agosto 2026', start: '2026-08-10' },
    { name: 'Settembre 2026', start: '2026-09-01' },
    { name: 'Ottobre 2026', start: '2026-10-01' },
    { name: 'Novembre 2026', start: '2026-11-01' },
    { name: 'Dicembre 2026 (Stagione Invernale)', start: '2026-12-01' },
    { name: 'Gennaio 2027 (Stagione Invernale)', start: '2027-01-01' },
    { name: 'Febbraio 2027 (Stagione Invernale)', start: '2027-02-01' },
    { name: 'Marzo 2027 (Stagione Invernale)', start: '2027-03-01' },
    { name: 'Aprile 2027 (Stagione Invernale)', start: '2027-04-30' },
    { name: 'Maggio 2027', start: '2027-05-01' },
    { name: 'Giugno 2027', start: '2027-06-01' },
    { name: 'Luglio 2027', start: '2027-07-01' },
    { name: 'Agosto 2027', start: '2027-08-01' },
    { name: 'Settembre 2027', start: '2027-09-01' },
    { name: 'Ottobre 2027 (Fine Stagione)', start: '2027-10-01' }
  ];

  const overallResults = [];

  for (const period of periodRanges) {
    let items = [];
    for (let page = 0; page < 20; page++) {
      const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${period.start}&dateTo=${period.start}&size=20&page=${page}`;
      try {
        const res = await fetch(url, { headers });
        if (!res.ok) break;
        const payload = await res.json();
        const pageItems = payload && Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []);
        if (pageItems.length === 0) break;
        items.push(...pageItems);
        if (pageItems.length < 20) break;
      } catch {
        break;
      }
    }

    let statsAirbnbFan = { open: 0, closed: 0 };
    let statsAirbnbAC = { open: 0, closed: 0 };

    items.forEach((item) => {
      const name = String(item.name || item.title || item.ratePlanName || '').toLowerCase();
      const closed = isClosed(item);

      if (name.includes('airbnb') || name.includes('airbnb')) {
        if (name.includes('ac')) {
          if (closed) statsAirbnbAC.closed++; else statsAirbnbAC.open++;
        } else {
          if (closed) statsAirbnbFan.closed++; else statsAirbnbFan.open++;
        }
      }
    });

    overallResults.push({
      Periodo: period.name,
      'Data Campione': period.start,
      'AirBnB Fan APERTI': statsAirbnbFan.open,
      'AirBnB Fan CHIUSI': statsAirbnbFan.closed,
      'AirBnB AC APERTI': statsAirbnbAC.open,
      'AirBnB AC CHIUSI': statsAirbnbAC.closed
    });
  }

  console.log('========================================================================');
  console.log('  TABELLA STATO TARIFFE AIRBNB E AC AIRBNB FINO AL 31/10/2027');
  console.log('========================================================================\n');
  console.table(overallResults);
}

scanAirbnbRatesFullSeason();
