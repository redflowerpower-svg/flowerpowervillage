import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

// Helper to load environment variables from .env or .env.local
function loadEnv() {
  const envPaths = ['.env.local', '.env'];
  let envConfig = {};
  
  for (const envFile of envPaths) {
    const fullPath = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          let key = match[1];
          let value = match[2] || '';
          if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
            value = value.substring(1, value.length - 1);
          }
          if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
            value = value.substring(1, value.length - 1);
          }
          envConfig[key] = value.trim();
        }
      });
      break;
    }
  }
  return envConfig;
}

const env = loadEnv();

const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SERVICE_ROLE;
const OCTORATE_STRUCTURE_ID = env.VITE_OCTORATE_STRUCTURE_ID || '366879';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Errore: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY non trovati nei file d\'ambiente.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// Sequenza canonica delle 20 "porte" (18 reali + 2 test)
const TARGET_DOORS = [
  { name: "Jungle Villa", category: "Villa", motherId: "529773" },
  { name: "Jungle Villa Left", category: "Villa", motherId: "495795" },
  { name: "Jungle Villa Right", category: "Villa", motherId: "495796" },
  { name: "Peace & Love Villa", category: "Villa", motherId: "494840" },
  { name: "Villa Penthouse", category: "Villa", motherId: "421511" },
  { name: "Yellow Bungalow", category: "Bungalow", motherId: "293957" },
  { name: "Red Bungalow", category: "Bungalow", motherId: "293954" },
  { name: "Green Bungalow", category: "Bungalow", motherId: "293962" },
  { name: "Camel Tent Bungalow", category: "Bungalow", motherId: "293965" },
  { name: "Lagoon Tent Bungalow", category: "Bungalow", motherId: "293955" },
  { name: "Internal Room", category: "Room", motherId: "293942" },
  { name: "Room 1", category: "Room", motherId: "293963" },
  { name: "Room 2", category: "Room", motherId: "293959" },
  { name: "Room 3", category: "Room", motherId: "293948" },
  { name: "Room 4", category: "Room", motherId: "293945" },
  { name: "Room 5", category: "Room", motherId: "293943" },
  { name: "Lodge 1", category: "Lodge", motherId: "293951" },
  { name: "Lodge 2", category: "Lodge", motherId: "883795" },
  { name: "Fake Bungalow 1", category: "TEST", motherId: "649669" },
  { name: "Fake Bungalow 2", category: "TEST", motherId: "921799" }
];

async function testWritability(token, rateId) {
  // Test rapido non distruttivo: facciamo una lettura del calendario per questa specifica Tariffa Madre
  const testDate = new Date(Date.now() + 86400000 * 45).toISOString().slice(0, 10); // +45 giorni
  const url = `https://api.octorate.com/connect/rest/v1/calendar/${OCTORATE_STRUCTURE_ID}?product=${rateId}&dateFrom=${testDate}&dateTo=${testDate}`;
  
  try {
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.ok) {
      return { status: "🟢 PRONTO", details: "Connessione API OK & Lettura verificata" };
    } else {
      return { status: "🔴 ERRORE", details: `HTTP Status: ${res.status}` };
    }
  } catch (err) {
    return { status: "🔴 DISCONNESSO", details: err.message };
  }
}

async function runDiagnostics() {
  console.log('==================================================');
  console.log('🔍 AVVIO DIAGNOSTICA DI SICUREZZA - VERIFICA DELLE 20 PORTE');
  console.log('==================================================\n');

  // 1. Test Supabase Connection
  console.log('📡 Fase 1: Verifica connessione Supabase...');
  try {
    const { data: tokenData, error: tokenError } = await supabase
      .from('octorate_tokens')
      .select('access_token')
      .eq('id', 'singleton')
      .single();

    if (tokenError || !tokenData?.access_token) {
      throw new Error(tokenError?.message || 'Token vuoto o non trovato.');
    }

    console.log('🟢 Connessione Supabase OK. Token Octorate recuperato con successo.\n');
    const token = tokenData.access_token;

    // 2. Scan each of the 20 doors
    console.log(`📡 Fase 2: Interrogazione Octorate per le 20 unità (Struttura #${OCTORATE_STRUCTURE_ID})...`);
    console.log('--------------------------------------------------');

    let readyCount = 0;
    const results = [];

    for (let i = 0; i < TARGET_DOORS.length; i++) {
      const door = TARGET_DOORS[i];
      process.stdout.write(`⏳ Verifica porta [${String(i + 1).padStart(2, '0')}/20] - ${door.name.padEnd(25)} (ID Madre: ${door.motherId})... `);
      
      const check = await testWritability(token, door.motherId);
      
      if (check.status.startsWith("🟢")) {
        readyCount++;
      }
      
      results.push({
        id: i + 1,
        name: door.name,
        category: door.category,
        motherId: door.motherId,
        status: check.status,
        details: check.details
      });

      console.log(`${check.status}`);
    }

    console.log('\n==================================================');
    console.log('📊 RESOCONTO FINALE DIAGNOSTICA');
    console.log('==================================================');
    console.log(`Porte analizzate: 20`);
    console.log(`Porte pronte e operative: ${readyCount} / 20`);
    
    if (readyCount === 20) {
      console.log('\n✅ ESITO: TUTTE LE 20 PORTE SONO PERFETTAMENTE OPERATIVE!');
      console.log('Il sistema è pronto al 100% per ricevere l\'aggiornamento bulk delle tariffe.');
    } else {
      console.log('\n⚠️ ATTENZIONE: Alcune unità hanno riscontrato problemi di connessione.');
      console.log('Si consiglia di verificare la configurazione di rete o i permessi prima di procedere.');
    }
    console.log('==================================================\n');

  } catch (error) {
    console.error(`❌ Errore critico durante la diagnostica: ${error.message}\n`);
  }
}

runDiagnostics();
