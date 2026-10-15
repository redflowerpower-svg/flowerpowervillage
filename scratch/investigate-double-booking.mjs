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
const supabase = createClient(envVars.SUPABASE_URL || envVars.VITE_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: tokenData } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').maybeSingle();
  const token = tokenData.access_token;

  // 1. Fetch detailed reservation for Axel Vor dem Berge (126783306)
  const resAxel = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/366879/126783306`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
  });
  const dataAxel = await resAxel.json();

  // 2. Fetch detailed reservation for Malin Posner (126783324)
  const resMalin = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/366879/126783324`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
  });
  const dataMalin = await resMalin.json();

  console.log('=== DETTAGLI COMPLETI AXEL (AGODA) ===');
  console.log('Nome:', dataAxel.firstName, dataAxel.lastName);
  console.log('Email:', dataAxel.guestMailAddress, dataAxel.email);
  console.log('Telefono:', dataAxel.phoneNumber || dataAxel.phone || 'N/A');
  console.log('Guests array:', JSON.stringify(dataAxel.guests, null, 2));
  console.log('Channel notes:', dataAxel.channelNotes);
  console.log('Housekeeping notes:', dataAxel.housekeepingNotes);
  console.log('Notes:', dataAxel.notes);
  console.log('Thread ID:', dataAxel.threadId);
  console.log('Grouped:', dataAxel.grouped);

  console.log('\n=== DETTAGLI COMPLETI MALIN (BOOKING) ===');
  console.log('Nome:', dataMalin.firstName, dataMalin.lastName);
  console.log('Email:', dataMalin.guestMailAddress, dataMalin.email);
  console.log('Telefono:', dataMalin.phoneNumber || dataMalin.phone || 'N/A');
  console.log('Guests array:', JSON.stringify(dataMalin.guests, null, 2));
  console.log('Channel notes:', dataMalin.channelNotes);
  console.log('Housekeeping notes:', dataMalin.housekeepingNotes);
  console.log('Notes:', dataMalin.notes);
  console.log('Thread ID:', dataMalin.threadId);
  console.log('Grouped:', dataMalin.grouped);

  // 3. Search all reservations created around 10 October 2026 across entire hotel
  console.log('\n=== PRENOTAZIONI CREATE INTORNO AL 10 OTTOBRE 2026 ===');
  const resOct10 = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/366879?dateType=CREATION&startDate=2026-10-09&endDate=2026-10-12&size=100`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
  });
  const dataOct10 = await resOct10.json();
  const list = Array.isArray(dataOct10.data) ? dataOct10.data : (Array.isArray(dataOct10) ? dataOct10 : (dataOct10.reservations || []));
  console.log(`Totale prenotazioni create tra 9 e 12 Ottobre: ${list.length}`);
  list.forEach(r => {
    console.log(`- ID: ${r.id} | Canale: ${r.channelName} | Ospite: ${r.firstName} ${r.lastName} | Alloggio: "${r.roomName}" | Soggiorno: ${r.checkin?.slice(0, 10)} -> ${r.checkout?.slice(0, 10)} | Creata: ${r.createTime} | Status: ${r.status}`);
  });

  // 4. Also search by guest name "Axel" or "Malin" or "Vor dem Berge" or "Posner" across ALL future reservations
  console.log('\n=== RICERCA ALTRE PRENOTAZIONI CON NOME AXEL / MALIN / VOR DEM BERGE / POSNER ===');
  const resAll = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=2026-11-01&endDate=2027-05-01&size=200`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
  });
  const dataAll = await resAll.json();
  const listAll = Array.isArray(dataAll.data) ? dataAll.data : (Array.isArray(dataAll) ? dataAll : (dataAll.reservations || []));
  const matches = listAll.filter(r => {
    const s = `${r.firstName || ''} ${r.lastName || ''} ${r.guestMailAddress || ''}`.toLowerCase();
    return s.includes('axel') || s.includes('malin') || s.includes('posner') || s.includes('berge');
  });
  console.log(`Trovate altre prenotazioni con questi nomi: ${matches.length}`);
  matches.forEach(r => {
    console.log(`- ID: ${r.id} | Canale: ${r.channelName} | Ospite: ${r.firstName} ${r.lastName} | Alloggio: "${r.roomName}" | Soggiorno: ${r.checkin?.slice(0, 10)} -> ${r.checkout?.slice(0, 10)} | Creata: ${r.createTime} | Status: ${r.status}`);
  });

  // 5. Check if there are messages in the Octorate threads
  for (const tid of [dataAxel.threadId, dataMalin.threadId].filter(Boolean)) {
    console.log(`\n=== MESSAGGI NEL THREAD ${tid} ===`);
    try {
      const tRes = await fetch(`https://api.octorate.com/connect/rest/v1/thread/${tid}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (tRes.ok) {
        const tJson = await tRes.json();
        console.log(JSON.stringify(tJson, null, 2));
      } else {
        console.log(`Thread ${tid} status:`, tRes.status);
      }
    } catch (e) {
      console.log(`Error checking thread ${tid}:`, e.message);
    }
  }
}

run().catch(console.error);
