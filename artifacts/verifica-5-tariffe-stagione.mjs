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
      if (day.available === false || day.bookable === false || day.price >= 10000) return true;
    }
  }
  const rawStop = item.stopSells !== undefined ? item.stopSells : (item.stopSell !== undefined ? item.stopSell : item.closed);
  if (rawStop === true || rawStop === 'true' || rawStop === 1 || rawStop === '1') return true;
  if (item.available === false || item.bookable === false || item.price >= 10000) return true;
  return false;
}

async function verify5TargetRatesFullSeason() {
  console.log('========================================================================');
  console.log('  ANALISI PROFONDA DELLE 5 TARIFFE TARGET (S, A, B) SU OCTORATE PMS');
  console.log('  1. Tariffa S: Standard 7d');
  console.log('  2. Tariffa A: AGD AC-7d + AGD AC-14d');
  console.log('  3. Tariffa B: Main BnB-7d + Main BnB-14d');
  console.log('  Periodo: Da Oggi (09/08/2026) al 31 Ottobre 2027 (15 Mesi Completi)');
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
    { name: 'Agosto 2026', start: '2026-08-09' },
    { name: 'Settembre 2026', start: '2026-09-01' },
    { name: 'Ottobre 2026', start: '2026-10-01' },
    { name: 'Novembre 2026', start: '2026-11-01' },
    { name: 'Dicembre 2026 (Chiusura Invernale)', start: '2026-12-01' },
    { name: 'Gennaio 2027 (Chiusura Invernale)', start: '2027-01-01' },
    { name: 'Febbraio 2027 (Chiusura Invernale)', start: '2027-02-01' },
    { name: 'Marzo 2027 (Chiusura Invernale)', start: '2027-03-01' },
    { name: 'Aprile 2027 (Chiusura Invernale)', start: '2027-04-30' },
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

    let statsS = { open: 0, closed: 0 };
    let statsA = { open: 0, closed: 0 };
    let statsB = { open: 0, closed: 0 };

    items.forEach((item) => {
      const name = String(item.name || item.title || item.ratePlanName || '').toLowerCase();
      const closed = isClosed(item);

      // 1. Tariffa S (Standard 7d)
      if (name.includes('7d') && !name.includes('ac') && !name.includes('agd') && !name.includes('agoda') && !name.includes('bnb')) {
        if (closed) statsS.closed++; else statsS.open++;
      }
      // 2. Tariffa A (AGD AC-7d & AGD AC-14d)
      else if (name.includes('agd ac-7d') || name.includes('agd ac-14d')) {
        if (closed) statsA.closed++; else statsA.open++;
      }
      // 3. Tariffa B (Main BnB-7d & Main BnB-14d)
      else if (name.includes('main bnb-7d') || name.includes('main bnb-14d') || name.includes('main bnb')) {
        if (closed) statsB.closed++; else statsB.open++;
      }
    });

    overallResults.push({
      Periodo: period.name,
      'Data Campione': period.start,
      'S (Standard 7d) APERTI': statsS.open,
      'S (Standard 7d) CHIUSI': statsS.closed,
      'A (Agoda AC) APERTI': statsA.open,
      'A (Agoda AC) CHIUSI': statsA.closed,
      'B (Main BnB) APERTI': statsB.open,
      'B (Main BnB) CHIUSI': statsB.closed
    });
  }

  console.log('========================================================================');
  console.log('  TABELLA STATO REALE DELLE 5 TARIFFE PER OGNI MESE FINO AL 31/10/2027');
  console.log('========================================================================\n');
  console.table(overallResults);
}

verify5TargetRatesFullSeason();
