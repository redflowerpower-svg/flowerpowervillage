import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const env = {};
  for (const f of ['.env.local', '.env']) {
    const p = path.resolve(process.cwd(), f);
    if (fs.existsSync(p)) {
      const lines = fs.readFileSync(p, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const k = trimmed.slice(0, idx).trim();
          let v = trimmed.slice(idx + 1).trim();
          if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
            v = v.slice(1, -1);
          }
          if (!env[k]) env[k] = v;
        }
      }
    }
  }
  return env;
}

const env = loadEnv();
const supabase = createClient(env.SUPABASE_URL || env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log('1. Recupero access_token Octorate da Supabase singleton...');
  const { data: tokenData, error: tokenError } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .single();

  if (tokenError || !tokenData?.access_token) {
    console.error('Errore recupero token:', tokenError);
    process.exit(1);
  }

  const token = tokenData.access_token;
  const clientId = env.VITE_OCTORATE_CLIENT_ID || '366879';

  const headers = {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (clientId) {
    headers['Octorate-Api-Key'] = clientId;
  }

  const bungalowProducts = [
    { id: 921878, name: 'Yellow Bungalow - AGD AC-7d' },
    { id: 921879, name: 'Yellow Bungalow - AGD AC-14d' },
    { id: 921880, name: 'Red Bungalow - AGD AC-7d' },
    { id: 921881, name: 'Red Bungalow - AGD AC-14d' },
    { id: 921882, name: 'Green Bungalow - AGD AC-7d' },
    { id: 921883, name: 'Green Bungalow - AGD AC-14d' }
  ];

  const todayStr = new Date().toISOString().slice(0, 10);
  const bulkPayload = [];

  // Per ciascuno dei 3 Bungalow (6 prodotti Agoda AC):
  for (const p of bungalowProducts) {
    // Fase 1: Da oggi al 15 Dicembre 2026 -> STOP-SELL TOTALE (CHIUSO)
    bulkPayload.push({
      room: p.id,
      dateFrom: todayStr,
      dateTo: '2026-12-15',
      values: {
        stopSells: true,
        closed: true,
        closedArrival: true,
        closedDeparture: true
      }
    });

    // Fase 2: Dal 16 Dicembre 2026 al 31 Marzo 2027 -> APERTURA HIGH SEASON AGODA
    bulkPayload.push({
      room: p.id,
      dateFrom: '2026-12-16',
      dateTo: '2027-03-31',
      values: {
        stopSells: false,
        closed: false,
        closedArrival: false,
        closedDeparture: false
      }
    });

    // Fase 3: Dal 01 Aprile 2027 al 31 Ottobre 2027 -> STOP-SELL TOTALE (CHIUSO FINE STAGIONE)
    bulkPayload.push({
      room: p.id,
      dateFrom: '2027-04-01',
      dateTo: '2027-10-31',
      values: {
        stopSells: true,
        closed: true,
        closedArrival: true,
        closedDeparture: true
      }
    });
  }

  console.log(`2. Invio bulk payload di ${bulkPayload.length} blocchi per Red, Green e Yellow Bungalow a Octorate...`);
  const bulkUrl = 'https://api.octorate.com/connect/rest/v1/calendar/bulk';
  const bulkRes = await fetch(bulkUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(bulkPayload)
  });

  const resText = await bulkRes.text();
  console.log('Risposta Octorate Bulk:', bulkRes.status, resText);

  if (!bulkRes.ok) {
    console.error('Errore chiamata bulk Octorate!');
    process.exit(1);
  }

  // Pulizia cache locale se presente
  const cachePath = path.resolve(process.cwd(), 'scratch/octorate-cache.json');
  if (fs.existsSync(cachePath)) {
    try {
      fs.unlinkSync(cachePath);
      console.log('Cache locale cancellata.');
    } catch {}
  }

  console.log('3. Sincronizzazione Octorate completata con successo!');
}

run().catch(console.error);
