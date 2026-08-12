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
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SERVICE_ROLE;

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

// Clean and normalize a slug to allow fuzzy matching
function normalizeSlug(slug) {
  if (!slug) return '';
  
  let cleaned = String(slug)
    .replace(/^\d+[-_]/, '') // Remove numeric prefixes (e.g., "44_jungle_villa" or "04-peace-love-villa")
    .replace(/^\d+/, '')     // Remove stray leading digits
    .replace(/"/g, '')       // Remove stray double quotes
    .toLowerCase()
    .replace(/_/g, '-')      // Replace underscores with hyphens
    .trim();

  // Known typo map to autocorrect Excel discrepancies in memory
  const typoMap = {
    'peace-love-villla': 'peace-love-villa',
    'camel-tent-bbungalow': 'camel-tent-bungalow',
    'lagoon-tentt-bungalow': 'lagoon-tent-bungalow',
    'villa-penthouse': 'villa-penthouse'
  };

  if (typoMap[cleaned]) {
    cleaned = typoMap[cleaned];
  }

  return cleaned;
}

// Clean and normalize name for robust fuzzy matching fallback
function normalizeName(name) {
  if (!name) return '';
  return String(name)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '')
    .trim();
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
  
  // Convert sheet to JSON array of objects
  const rawData = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`🏠 Trovate ${rawData.length} righe nel file Excel.`);
  
  // 1. Scarica tutti gli alloggi correnti da Supabase per il matching sicuro in memoria
  console.log('🏠 Recupero alloggi correnti da Supabase...');
  const { data: dbAccommodations, error: dbError } = await supabase
    .from('accommodations')
    .select('*');

  if (dbError || !dbAccommodations) {
    console.error('❌ Errore nel recupero degli alloggi da Supabase:', dbError?.message);
    process.exit(1);
  }

  console.log(`🟢 Recuperati ${dbAccommodations.length} alloggi dal database.`);
  console.log('🔄 Avvio sincronizzazione intelligente (V9 Resort Common Services Auto-set) con Supabase...');

  let successCount = 0;
  let skippedCount = 0;
  
  for (const row of rawData) {
    const excelSlug = row['DATABASE SLUG (NON MODIFICARE)'];
    const name = row['Nome Alloggio'];
    
    if (!excelSlug) {
      console.warn(`⚠️ Riga saltata (Slug mancante nel foglio Excel): "${name || 'Senza Nome'}"`);
      continue;
    }

    const normExcelSlug = normalizeSlug(excelSlug);

    // 1. Prova prima con il match esatto dello slug normalizzato
    let matchedAcc = dbAccommodations.find(dbAcc => {
      const normDbSlug = normalizeSlug(dbAcc.slug);
      return normDbSlug === normExcelSlug;
    });

    // 2. Se fallisce, prova con un match fuzzy sul nome dell'alloggio (Failsafe di emergenza)
    if (!matchedAcc) {
      matchedAcc = dbAccommodations.find(dbAcc => {
        const nDb = normalizeName(dbAcc.name);
        const nExcel = normalizeName(name);
        return nDb === nExcel || nDb.includes(nExcel) || nExcel.includes(nDb);
      });
    }

    if (!matchedAcc) {
      console.warn(`⚠️ Nessun alloggio trovato nel DB per Excel: "${name}" (slug: "${excelSlug}" / normalizzato: "${normExcelSlug}")`);
      skippedCount++;
      continue;
    }

    console.log(`🔌 Allineamento: [${matchedAcc.slug}] (${matchedAcc.name}) ➔ Excel: "${name}" [Match Autocorretto: OK ✅]`);

    const rooms = parseInt(row['Stanze']) || 1;
    const bathrooms = parseInt(row['Bagni']) || 1;
    const beds = String(row['Configurazione Letti'] || '').trim();
    const roomSize = parseInt(row['Metratura (mq)']) || 0;

    // Standardized features structure
    const features = {
      room_size: roomSize,
      sofa_bed: parseBoolean(row['Divano Letto']),
      ceiling_fan: parseBoolean(row['Ventilatore a Soffitto']) || true, // Sempre presente e gratuito
      air_conditioning: parseBoolean(row['Aria Condizionata']),
      hot_water: parseBoolean(row['Acqua Calda']),
      wifi: parseBoolean(row['Wi-Fi']),
      safe: parseBoolean(row['Cassaforte']),
      desk: parseBoolean(row['Scrivania']),
      kitchen: parseBoolean(row['Cucina / Angolo Cottura']),
      refrigerator: parseBoolean(row['Frigorifero']),
      terrace_balcony: parseBoolean(row['Terrazzo / Balcone']),
      private_garden: parseBoolean(row['Giardino Privato']),
      
      // --- SEZIONE 6: SERVIZI COMUNI DEL RESORT (Auto-impostati a true per tutte le camere!) ---
      swimming_pool: true,
      pool: true,
      gym: true,
      fitness: true,
      palestra: true,
      yoga: true,
      yoga_temple: true,
      tempio_yoga: true,

      ac_consumption_note: {
        it: "Aria Condizionata disponibile in ogni camera. Se non è inclusa o prepagata nella tua prenotazione, è utilizzabile a consumo al costo di 40 THB per kWh (pari a circa 20 THB all'ora). Si consiglia di tenere porte e finestre chiuse mentre è in funzione.",
        en: "Air Conditioning is available in every unit. If not included or prepaid in your booking, it is available on a pay-as-you-go basis at 40 THB per kWh (approximately 20 THB per hour). We kindly ask you to keep doors and windows closed while running."
      }
    };

    // 2. Costruisci il payload di aggiornamento in modo dinamico
    const updatePayload = {};
    
    // Controlla se 'updated_at' esiste prima di provare ad aggiornarlo (failsafe)
    if ('updated_at' in matchedAcc) {
      updatePayload.updated_at = new Date().toISOString();
    }

    // Gestione della colonna "details" (se presente nel DB, inseriamo i dati al suo interno)
    if ('details' in matchedAcc) {
      const existingDetails = typeof matchedAcc.details === 'string'
        ? JSON.parse(matchedAcc.details)
        : (matchedAcc.details || {});

      updatePayload.details = {
        ...existingDetails,
        rooms: rooms,
        bathrooms: bathrooms,
        beds: beds,
        squareMeters: roomSize,
        features: features
      };
    }

    // Gestione delle colonne top-level (se presenti fisicamente nella tabella DB, le aggiorniamo direttamente)
    if ('rooms' in matchedAcc) updatePayload.rooms = rooms;
    if ('bathrooms' in matchedAcc) updatePayload.bathrooms = bathrooms;
    if ('beds' in matchedAcc) updatePayload.beds = beds;
    if ('features' in matchedAcc) updatePayload.features = features;

    // 3. Esegui l'aggiornamento sul record specifico identificato dal suo ID univoco
    const { error: updateError } = await supabase
      .from('accommodations')
      .update(updatePayload)
      .eq('id', matchedAcc.id);

    if (updateError) {
      console.error(`❌ Errore durante l'aggiornamento di "${matchedAcc.name}":`, updateError.message);
    } else {
      console.log(`   └─ ✅ Sincronizzato con successo nel DB!`);
      successCount++;
    }
  }

  console.log(`\n================================================================================`);
  console.log(`🎉 OPERAZIONE COMPLETATA CON SUCCESSO!`);
  console.log(`📊 Riepilogo:`);
  console.log(`*  Alloggi aggiornati correttamente con Servizi Comuni: ${successCount}/${dbAccommodations.length}`);
  console.log(`*  Alloggi saltati: ${skippedCount}`);
  console.log(`================================================================================`);
}

main().catch(err => {
  console.error('❌ Errore imprevisto:', err);
  process.exit(1);
});
