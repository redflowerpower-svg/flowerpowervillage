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
console.log('  VERIFICA MINSTAY ATTUALE OCTORATE CALENDAR (STANZA 529773 - OGGI)   ');
console.log('========================================================================\n');

async function checkRoomMinStay() {
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
  const roomId = '529773';
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

  const calendarUrl = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${todayISO}&dateTo=${todayISO}`;

  console.log(`\n📌 [STEP 2] Eseguo GET /calendar/${structureId}...`);
  console.log(`   Target URL: ${calendarUrl}`);
  console.log(`   Filtro Target ID: ${roomId} | Data: ${todayISO}`);

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

  console.log(`\n========================================================================`);
  console.log(`HTTP Status Code : ${res.status} ${res.statusText}`);

  if (res.ok && json) {
    const items = Array.isArray(json) ? json : (json.data || json.calendar || [json]);
    
    // Cerca lato client la stanza/prodotto con id, room, o roomTypeId uguale a roomId
    const targetRoom = items.find(item => 
      item.id == roomId || 
      item.room == roomId || 
      item.roomId == roomId || 
      item.roomType == roomId || 
      item.roomTypeId == roomId
    );

    if (targetRoom) {
      console.log(`\n📋 DATI STANZA TARGET (ID: ${roomId}):`);
      console.log(`   ► Nome Camera / Piano : ${targetRoom.name || targetRoom.id}`);
      
      const days = targetRoom.days || [targetRoom];
      for (const day of days) {
        const minStayVal = day.minStay ?? day.minstay ?? targetRoom.minStay ?? targetRoom.minstay ?? 'N/D';
        console.log(`   ► Data                 : ${day.date || todayISO}`);
        console.log(`   ► minStay              : ${minStayVal}`);
        if (day.price !== undefined) console.log(`   ► Prezzo               : ${day.price} THB`);
        if (day.availability !== undefined) console.log(`   ► Disponibilità        : ${day.availability}`);
        if (day.stopSells !== undefined) console.log(`   ► Stop Sells           : ${day.stopSells}`);
      }
    } else {
      console.log(`\n⚠️ AVVISO: Nessuna stanza o piano tariffario con ID "${roomId}" è stata trovata nella risposta.`);
      console.log(`📋 LISTA DI TUTTI GLI ID E NOMI RESTITUITI DA OCTORATE (${items.length} elementi):`);
      items.forEach((item, index) => {
        const sampleDay = item.days?.[0] || {};
        console.log(`   ${index + 1}. ID: ${item.id} | Nome: "${item.name || 'N/D'}" | minStay: ${sampleDay.minStay ?? 'N/D'} | Prezzo: ${sampleDay.price ?? 'N/D'} THB`);
      });
    }
  } else {
    console.error('❌ Errore durante il recupero del calendario:', json || text);
  }

  console.log('========================================================================\n');
}

checkRoomMinStay().catch(console.error);
