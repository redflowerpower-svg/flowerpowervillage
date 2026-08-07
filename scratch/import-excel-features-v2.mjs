import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Helper for dynamic loading of standard xlsx package
let XLSX;
try {
  const xlsxModule = await import('xlsx');
  XLSX = xlsxModule.default || xlsxModule;
} catch (err) {
  console.error('\n❌ ERRORE: Il modulo "xlsx" non è installato nel tuo progetto Node.js.');
  console.error('👉 Per farlo funzionare, esegui questo comando nel tuo terminale:');
  console.error('==================================================');
  console.error('npm install xlsx');
  console.error('==================================================\n');
  process.exit(1);
}

// Helper to load .env or .env.local variables
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
      console.log(`📡 Loaded environment variables from ${envFile}`);
      break;
    }
  }
  return envConfig;
}

const env = loadEnv();
const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SERVICE_ROLE || env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Errore: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY non trovati.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const EXCEL_FILE_PATH = path.resolve(process.cwd(), 'scratch/accommodations-features-editor.xlsx');

function parseBoolean(val) {
  if (!val) return false;
  const clean = String(val).trim().toUpperCase();
  return clean === 'SI' || clean === 'YES' || clean === 'SÌ' || clean === 'TRUE' || clean === '1';
}

function normalize(str) {
  return String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function main() {
  if (!fs.existsSync(EXCEL_FILE_PATH)) {
    console.error(`❌ Errore: Non ho trovato il file Excel in: ${EXCEL_FILE_PATH}`);
    process.exit(1);
  }

  console.log(`📖 Lettura del file Excel: ${EXCEL_FILE_PATH}`);
  const workbook = XLSX.readFile(EXCEL_FILE_PATH);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  const rawData = XLSX.utils.sheet_to_json(worksheet);
  console.log(`🏠 Trovate ${rawData.length} righe nel file Excel.`);

  // Fetch current accommodations from Supabase
  const { data: dbAccommodations, error: fetchErr } = await supabase
    .from('accommodations')
    .select('*');

  if (fetchErr) {
    console.error('❌ Errore durante la lettura delle sistemazioni da Supabase:', fetchErr.message);
    process.exit(1);
  }

  console.log(`📡 Trovati ${dbAccommodations.length} alloggi esistenti su Supabase.`);
  console.log('🔄 Avvio sincronizzazione con il campo JSON "details"...');

  let successCount = 0;
  const syncedReport = [];

  for (const row of rawData) {
    const rawSlug = String(row['DATABASE SLUG (NON MODIFICARE)'] || '').trim();
    const name = String(row['Nome Alloggio'] || '').trim();
    
    if (!rawSlug && !name) {
      console.warn(`⚠️ Riga saltata: dati mancanti.`);
      continue;
    }

    // Precise matching logic
    const targetDbItem = dbAccommodations.find(item => {
      const itemSlugNorm = normalize(item.slug);
      const rawSlugNorm = normalize(rawSlug);
      const itemNameNorm = normalize(item.name);
      const nameNorm = normalize(name);

      // Exact slug match
      if (item.slug === rawSlug || itemSlugNorm === rawSlugNorm) return true;

      // Special handling for Jungle Villa variants
      if (rawSlugNorm.includes('jungle') || nameNorm.includes('jungle')) {
        if ((rawSlugNorm.includes('left') || nameNorm.includes('left')) && itemSlugNorm.includes('left')) return true;
        if ((rawSlugNorm.includes('right') || nameNorm.includes('right')) && itemSlugNorm.includes('right')) return true;
        if (!rawSlugNorm.includes('left') && !rawSlugNorm.includes('right') && !nameNorm.includes('left') && !nameNorm.includes('right') && item.slug === '44_jungle_villa') return true;
        return false;
      }

      // Exact name match
      if (itemNameNorm === nameNorm) return true;

      // Standard slug substring match
      if (itemSlugNorm.includes(rawSlugNorm) || rawSlugNorm.includes(itemSlugNorm)) return true;
      if (itemNameNorm.includes(nameNorm) || nameNorm.includes(itemNameNorm)) return true;

      return false;
    });

    if (!targetDbItem) {
      console.warn(`⚠️ Nessuna corrispondenza su Supabase per [${rawSlug}] ("${name}")`);
      continue;
    }

    const rooms = parseInt(row['Stanze']) || 1;
    const bathrooms = parseInt(row['Bagni']) || 1;
    const beds = String(row['Configurazione Letti'] || '').trim();
    const roomSize = parseInt(row['Metratura (mq)']) || 0;
    const capacity = row['Capienza (Ospiti)'] || targetDbItem.people_capacity || null;

    // Standardized features structure
    const features = {
      room_size: roomSize,
      sofa_bed: parseBoolean(row['Divano Letto']),
      ceiling_fan: parseBoolean(row['Ventilatore a Soffitto']),
      air_conditioning: parseBoolean(row['Aria Condizionata']),
      hot_water: parseBoolean(row['Acqua Calda']),
      wifi: parseBoolean(row['Wi-Fi']),
      safe: parseBoolean(row['Cassaforte']),
      desk: parseBoolean(row['Scrivania']),
      kitchen: parseBoolean(row['Cucina / Angolo Cottura']),
      refrigerator: parseBoolean(row['Frigorifero']),
      terrace_balcony: parseBoolean(row['Terrazzo / Balcone']),
      private_garden: parseBoolean(row['Giardino Privato']),
      ac_consumption_note: {
        it: "Aria Condizionata disponibile in ogni camera. Se non è inclusa o prepagata nella tua prenotazione, è utilizzabile a consumo al costo di 40 THB per kWh (pari a circa 20 THB all'ora). Si consiglia di tenere porte e finestre chiuse mentre è in funzione.",
        en: "Air Conditioning is available in every unit. If not included or prepaid in your booking, it is available on a pay-as-you-go basis at 40 THB per kWh (approximately 20 THB per hour). We kindly ask you to keep doors and windows closed while running."
      }
    };

    const detailsObj = {
      rooms,
      bathrooms,
      beds,
      squareMeters: roomSize,
      features
    };

    console.log(`🔌 Aggiornamento per l'alloggio [${targetDbItem.slug}] (${targetDbItem.name})...`);

    const updatePayload = {
      details: detailsObj
    };

    if (capacity) {
      updatePayload.people_capacity = String(capacity);
    }

    const { error } = await supabase
      .from('accommodations')
      .update(updatePayload)
      .eq('id', targetDbItem.id);

    if (error) {
      console.error(`❌ Errore durante l'aggiornamento di "${targetDbItem.name}":`, error.message);
    } else {
      console.log(`  ✅ Sincronizzato con successo! [Camere: ${rooms} | Bagni: ${bathrooms} | Letti: ${beds} | ${roomSize}m²]`);
      successCount++;
      syncedReport.push({
        id: targetDbItem.id,
        name: targetDbItem.name,
        slug: targetDbItem.slug,
        rooms,
        bathrooms,
        beds,
        roomSize
      });
    }
  }

  console.log('\n=============================================================');
  console.log(`🎉 OPERAZIONE COMPLETATA: ${successCount} su ${rawData.length} ALLOGGI AGGIORNATI`);
  console.log('=============================================================\n');
  console.table(syncedReport);
}

main().catch(err => {
  console.error('❌ Errore imprevisto:', err);
  process.exit(1);
});
