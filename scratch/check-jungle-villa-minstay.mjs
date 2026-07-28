import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// 1. Parsing manuale file .env locale
const envPath = path.resolve(process.cwd(), '.env');
const envVars = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  }
}

const supabaseUrl = envVars.SUPABASE_URL || envVars.VITE_SUPABASE_URL;
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;

console.log('========================================================================');
console.log('  VERIFICA MINSTAY JUNGLE VILLA (529773 vs 529784) - DATA ODIERNA   ');
console.log('========================================================================\n');

async function checkJungleVillaMinStay() {
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Supabase credentials missing in .env');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // 1. Recupero OAuth Token da Supabase
  console.log('📌 [STEP 1] Recupero token OAuth da Supabase (tabelle octorate_tokens)...');
  const { data: tokenData, error: tokenError } = await supabase
    .from('octorate_tokens')
    .select('access_token, refresh_token')
    .eq('id', 'singleton')
    .maybeSingle();

  if (tokenError || !tokenData?.access_token) {
    console.error('❌ Access token non disponibile nel DB:', tokenError?.message || 'Token vuoto');
    return;
  }

  let accessToken = tokenData.access_token;
  let refreshToken = tokenData.refresh_token;
  const clientId = envVars.VITE_OCTORATE_CLIENT_ID || envVars.OCTORATE_CLIENT_ID || '';
  const clientSecret = envVars.OCTORATE_SECRET_KEY || envVars.VITE_OCTORATE_SECRET_KEY || '';
  const structureId = '366879';
  const todayISO = new Date().toISOString().substring(0, 10);

  async function refreshAccessToken() {
    console.log('🔄 Token scaduto. Tento il Refresh Token via POST /rest/v1/identity/refresh...');
    try {
      const refreshParams = new URLSearchParams();
      refreshParams.append('client_id', clientId);
      refreshParams.append('client_secret', clientSecret);
      refreshParams.append('refresh_token', refreshToken);

      const res = await fetch('https://api.octorate.com/connect/rest/v1/identity/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: refreshParams.toString()
      });

      const text = await res.text();
      if (res.ok) {
        const json = JSON.parse(text);
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
      } else {
        console.error('   ❌ Fallimento Refresh Token:', text);
      }
    } catch (err) {
      console.error('   ❌ Eccezione durante Refresh:', err.message);
    }
    return false;
  }

  const getHeaders = (token) => {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (clientId) {
      headers['Octorate-Api-Key'] = clientId;
    }
    return headers;
  };

  let allItems = [];
  let page = 0;
  let hasMore = true;

  while (hasMore && page < 10) {
    const calendarUrl = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${todayISO}&dateTo=${todayISO}&page=${page}&size=20`;
    console.log(`📌 Eseguo GET /calendar/${structureId} (Page ${page})...`);
    
    let res = await fetch(calendarUrl, {
      method: 'GET',
      headers: getHeaders(accessToken)
    });

    let text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}

    if ((res.status === 401 || (res.status === 403 && json?.type === 'ApiLoginExpired')) && refreshToken) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        res = await fetch(calendarUrl, {
          method: 'GET',
          headers: getHeaders(accessToken)
        });
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
        // Se restituisce meno di size, abbiamo terminato le pagine
        if (pageItems.length < 20) hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  console.log(`\nTotale prodotti/piani tariffari raccolti: ${allItems.length}`);
  const items = allItems;

  const targetIds = [
    { id: 529773, label: 'Jungle Villa - Tariffa Madre (Mother Rate Plan)' },
    { id: 529784, label: 'Jungle Villa - Booking Engine BE (Product ID)' }
  ];

  console.log('\n========================================================================');
  console.log('                 📊 RISULTATI CONFRONTO JUNGLE VILLA                    ');
  console.log('========================================================================');

  for (const target of targetIds) {
    console.log(`\n🔎 [RICERCA] ID: ${target.id} (${target.label})`);

    const roomMatch = items.find(item => 
      item.id == target.id || 
      item.room == target.id || 
      item.roomId == target.id || 
      item.roomType == target.id || 
      item.roomTypeId == target.id
    );

    if (roomMatch) {
      console.log(`   ✅ TROVATO: "${roomMatch.name || roomMatch.id}"`);
      const days = roomMatch.days || [roomMatch];
      for (const day of days) {
        const minStayVal = day.minStay ?? day.minstay ?? roomMatch.minStay ?? roomMatch.minstay ?? 'N/D';
        console.log(`   ► Data                 : ${day.date || todayISO}`);
        console.log(`   ► minStay              : ${minStayVal}`);
        console.log(`   ► Prezzo               : ${day.price ?? 'N/D'} THB`);
        console.log(`   ► Disponibilità        : ${day.availability ?? 'N/D'}`);
        console.log(`   ► Stop Sells           : ${day.stopSells ?? 'N/D'}`);
      }
    } else {
      console.log(`   🔴 NON TROVATO nel payload per la data odierna.`);
    }
  }

  console.log('\n========================================================================\n');
}

checkJungleVillaMinStay().catch(console.error);
