import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load variables from .env.local or .env
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

console.log('========================================================================');
console.log('  DIAGNOSTICA SOGGIORNI MINIMI (MINSTAY) OCTORATE: 21-31 DICEMBRE 2026 ');
console.log('========================================================================\n');

async function runCheck() {
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Credenziali Supabase mancanti nei file .env / .env.local');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // 1. Recupero access_token da Supabase octorate_tokens
  console.log('📌 [STEP 1] Recupero access_token da Supabase (octorate_tokens)...');
  const { data: tokenData, error: tokenError } = await supabase
    .from('octorate_tokens')
    .select('access_token, refresh_token')
    .eq('id', 'singleton')
    .maybeSingle();

  if (tokenError || !tokenData?.access_token) {
    console.error('❌ Token non disponibile nel DB:', tokenError?.message || 'Nessun token trovato');
    return;
  }

  let accessToken = tokenData.access_token;
  let refreshToken = tokenData.refresh_token;
  const clientId = envVars.VITE_OCTORATE_CLIENT_ID || envVars.OCTORATE_CLIENT_ID || '';
  const clientSecret = envVars.OCTORATE_SECRET_KEY || envVars.VITE_OCTORATE_SECRET_KEY || '';
  const structureId = process.env.VITE_OCTORATE_STRUCTURE_ID || '366879';

  async function refreshAccessToken() {
    console.log('🔄 Token scaduto. Tento il Refresh Token via Octorate API...');
    try {
      const refreshParams = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret
      });

      const res = await fetch('https://api.octorate.com/connect/rest/v1/identity/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: refreshParams.toString()
      });

      if (res.ok) {
        const json = await res.json();
        if (json.access_token) {
          accessToken = json.access_token;
          if (json.refresh_token) refreshToken = json.refresh_token;
          await supabase.from('octorate_tokens').upsert({
            id: 'singleton',
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: json.expires_in,
            updated_at: new Date().toISOString()
          });
          console.log('   ✅ Access Token rinnovato con successo!');
          return true;
        }
      }
    } catch (err) {
      console.error('   ❌ Refresh Token fallito:', err.message);
    }
    return false;
  }

  const dateFrom = '2026-12-21';
  const dateTo = '2026-12-31';

  console.log(`📌 [STEP 2] Interrogo API Live Octorate GET /calendar/${structureId}...`);
  console.log(`   Periodo: ${dateFrom} -> ${dateTo}`);

  let allItems = [];
  let page = 0;
  let hasMore = true;

  while (hasMore && page < 10) {
    const calendarUrl = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${dateFrom}&dateTo=${dateTo}&size=50&page=${page}`;

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (clientId) headers['Octorate-Api-Key'] = clientId;

    let res = await fetch(calendarUrl, { method: 'GET', headers });
    let text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}

    if ((res.status === 401 || (res.status === 403 && json?.type === 'ApiLoginExpired')) && refreshToken && page === 0) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${accessToken}`;
        res = await fetch(calendarUrl, { method: 'GET', headers });
        text = await res.text();
        try { json = JSON.parse(text); } catch {}
      }
    }

    if (res.ok && json) {
      const pageItems = Array.isArray(json) ? json : (json.data || json.calendar || []);
      if (pageItems.length === 0) {
        hasMore = false;
      } else {
        allItems.push(...pageItems);
        page++;
        if (pageItems.length < 50) hasMore = false;
      }
    } else {
      console.error(`❌ Errore risposta Octorate (HTTP ${res.status}):`, json || text);
      hasMore = false;
    }
  }

  console.log(`\n========================================================================`);
  console.log(`  ANALISI DATI REGISTRATI SU OCTORATE (${allItems.length} Piani/Prodotti)   `);
  console.log('========================================================================\n');

  const OFFICIAL_BE_RATE_IDS = new Set([
    529784, 495807, 495980, 495566, 449348, 449385, 449422, 449668,
    449675, 449674, 449678, 449684, 449699, 449724, 449730, 449736,
    923905, 449742
  ]);

  const roomSummary = {};
  for (const item of allItems) {
    const idNum = Number(item.id);
    const nameStr = String(item.name || '').toLowerCase();
    const isBE = OFFICIAL_BE_RATE_IDS.has(idNum) || nameStr.endsWith('be') || nameStr.includes('booking engine');

    if (isBE) {
      const days = item.days || [item];
      const minStays = Array.from(new Set(days.map(d => d.minStay ?? d.minstay ?? 'N/D')));
      roomSummary[item.name || item.id] = {
        ID: item.id,
        minStaySet: minStays.join(', '),
        priceSample: days[0]?.price ?? 'N/D',
        dispSample: days[0]?.availability ?? 'N/D'
      };
    }
  }

  console.log('\n========================================================================');
  console.log('  📊 RIEPILOGO STANZA PER STANZA (TUTTE LE 18 CAMERE BE) PER DICEMBRE 21-31:');
  console.log('========================================================================');
  console.table(roomSummary);
}

runCheck().catch(console.error);
