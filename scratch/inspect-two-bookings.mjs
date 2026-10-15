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
  
  const ids = ['126783306', '126783324'];
  for (const id of ids) {
    const res = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/366879/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    const d = await res.json();
    console.log(`=== PRENOTAZIONE ${id} ===`);
    console.log(`Ospite: ${d.firstName} ${d.lastName}`);
    console.log(`Canale: ${d.channelName}`);
    console.log(`Stato: ${d.status}`);
    console.log(`Check-in: ${d.checkin}`);
    console.log(`Check-out: ${d.checkout}`);
    console.log(`Data/Ora Creazione UTC: ${d.createTime}`);
    console.log(`Data/Ora Modifica UTC: ${d.updateTime || d.modifyTime || 'N/A'}`);
    console.log(`Reference OTA: ${d.reference || d.channelNotes || 'N/A'}`);
    console.log(`External Mapping Reference: ${d.externalMappingReference}`);
    console.log(`Room Name: ${d.roomName} (Prod ID: ${d.product})`);
    console.log(`Totale: ${d.totalPaid || d.totalGross} ${d.currency}`);
    console.log(`Channel Notes: ${d.channelNotes}\n`);
  }
}

run().catch(console.error);
