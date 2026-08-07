import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

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
const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Errore: Credenziali Supabase mancanti nei file di ambiente.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function runDiagnostic() {
  console.log('\n🔍 ==================== DIAGNOSTICA TABELLA ACCOMMODATIONS ====================');
  console.log(`📡 URL Supabase: ${SUPABASE_URL}`);

  // Test 1: Query selecting 'id', 'name', 'slug', 'details', 'features'
  console.log('\n--- TEST 1: Verifica presenza colonna `features` ---');
  const { data: testColData, error: colError } = await supabase
    .from('accommodations')
    .select('id, name, slug, details, features')
    .limit(3);

  let hasFeaturesColumn = false;
  if (colError) {
    console.error('❌ ERRORE QUERY SELECT `features`:', colError.message);
    console.log('👉 La colonna `features` NON esiste come colonna diretta nel DB Supabase.');
  } else {
    hasFeaturesColumn = true;
    console.log('✅ La colonna `features` ESISTE come colonna diretta nel DB Supabase!');
  }

  // Test 2: Inspect all 18 accommodations
  console.log('\n--- TEST 2: Ispezione dei 18 alloggi nel DB ---');
  const { data: allAccommodations, error: allError } = await supabase
    .from('accommodations')
    .select('*');

  if (allError) {
    console.error('❌ Errore durante il recupero degli alloggi:', allError.message);
    process.exit(1);
  }

  console.log(`📊 Trovati ${allAccommodations.length} alloggi nel database.`);

  const report = allAccommodations.map((acc) => {
    let detailsObj = acc.details;
    if (typeof detailsObj === 'string') {
      try {
        detailsObj = JSON.parse(detailsObj);
      } catch (e) {
        detailsObj = {};
      }
    }
    const directFeatures = acc.features;
    const detailsFeatures = detailsObj?.features;
    const hasDirect = directFeatures && typeof directFeatures === 'object' && Object.keys(directFeatures).length > 0;
    const hasDetailsFeatures = detailsFeatures && typeof detailsFeatures === 'object' && Object.keys(detailsFeatures).length > 0;

    return {
      ID: acc.id,
      Nome: acc.name,
      Slug: acc.slug,
      'Colonna features diretta': hasDirect ? `✅ (${Object.keys(directFeatures).length} chiavi)` : '❌ NULL/Vuoto',
      'Oggetto details.features': hasDetailsFeatures ? `✅ (${Object.keys(detailsFeatures).length} chiavi)` : '❌ NULL/Vuoto',
      'SquareMeters in details': detailsObj?.squareMeters || 'N/D'
    };
  });

  console.table(report);

  // Test 3: Write test
  console.log('\n--- TEST 3: Test di Scrittura su alloggio campione ---');
  if (allAccommodations.length > 0) {
    const sample = allAccommodations[0];
    console.log(`📝 Esecuzione test di scrittura su: "${sample.name}" (ID: ${sample.id})...`);
    
    const sampleDetails = typeof sample.details === 'object' && sample.details !== null ? sample.details : {};
    const sampleFeatures = { wifi: true, room_size: 120, test_ts: new Date().toISOString() };

    const updateObj = {
      details: { ...sampleDetails, features: sampleFeatures }
    };
    if (hasFeaturesColumn) {
      updateObj.features = sampleFeatures;
    }

    const { error: writeErr } = await supabase
      .from('accommodations')
      .update(updateObj)
      .eq('id', sample.id);

    if (writeErr) {
      console.error(`❌ Errore durante il test di scrittura:`, writeErr.message);
    } else {
      console.log(`✅ Test di scrittura completato con successo su "${sample.name}"!`);
    }
  }

  console.log('\n===============================================================================\n');
}

runDiagnostic().catch((err) => {
  console.error('❌ Errore imprevisto nella diagnostica:', err);
  process.exit(1);
});
