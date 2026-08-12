import fs from 'fs';
import path from 'path';
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
          // Remove quotes if present
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
const OCTORATE_STRUCTURE_ID = env.VITE_OCTORATE_STRUCTURE_ID || '366879';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Errore: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY non trovati nei file d\'ambiente (.env o .env.local).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// Fuzzy match for names
function matchRoom(supabaseName, octorateName) {
  const sName = supabaseName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const oName = octorateName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Escludi esplicitamente le tariffe BE o i canali di test per evitare falsi positivi
  if (octorateName.toUpperCase().includes(' BE') || octorateName.toUpperCase().includes('RATE') || octorateName.toUpperCase().includes('PLAN')) {
    return false;
  }
  
  return sName === oName || oName.includes(sName) || sName.includes(oName);
}

// Function to scan amenities names/labels and match them case-insensitively
function checkAmenity(amenitiesList, keywords) {
  if (!amenitiesList || !Array.isArray(amenitiesList)) return false;
  
  return amenitiesList.some(am => {
    // some amenities are objects, some are strings/numbers depending on Octorate response format
    const name = typeof am === 'object' ? (am.name || am.label || am.description || '') : String(am);
    return keywords.some(kw => name.toLowerCase().includes(kw.toLowerCase()));
  });
}

async function main() {
  const isWriteMode = process.argv.includes('--write');
  
  console.log('🔄 Avvio sincronizzazione caratteristiche alloggi...');
  if (!isWriteMode) {
    console.log('📝 MODALITÀ DRY-RUN: Nessuna modifica verrà scritta su Supabase. Usa il flag --write per salvare.');
  } else {
    console.log('⚠️ MODALITÀ SCRITTURA: I dati su Supabase verranno aggiornati.');
  }

  // 1. Recupera l'Octorate Token da Supabase
  console.log('🔑 Recupero token Octorate da Supabase...');
  const { data: tokenData, error: tokenError } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .single();

  if (tokenError || !tokenData?.access_token) {
    console.error('❌ Errore nel recupero del token Octorate:', tokenError?.message || 'Token vuoto.');
    process.exit(1);
  }

  const octorateToken = tokenData.access_token;

  // 2. Recupera gli alloggi fisici reali da Supabase
  console.log('🏠 Recupero alloggi da Supabase...');
  const { data: accommodations, error: accError } = await supabase
    .from('accommodations')
    .select('*');

  if (accError || !accommodations) {
    console.error('❌ Errore nel recupero degli alloggi da Supabase:', accError?.message);
    process.exit(1);
  }

  console.log(`Found ${accommodations.length} accommodations in Supabase.`);

  // 3. Interroga Octorate API per recuperare le caratteristiche
  console.log(`📡 Interrogazione Octorate API per la struttura ${OCTORATE_STRUCTURE_ID}...`);
  let octorateRooms = [];
  try {
    const response = await fetch(`https://api.octorate.com/connect/rest/v3/roomrates/${OCTORATE_STRUCTURE_ID}`, {
      headers: {
        'Authorization': `Bearer ${octorateToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    octorateRooms = await response.json();
    console.log(`🟢 Ricevuti ${octorateRooms.length} prodotti da Octorate.`);
  } catch (err) {
    console.error('❌ Errore durante la chiamata alle API di Octorate:', err.message);
    process.exit(1);
  }

  // 4. Mappa e standardizza i dati
  let updatedCount = 0;
  const previewData = [];

  for (const acc of accommodations) {
    // Trova la stanza Octorate corrispondente
    const octRoom = octorateRooms.find(r => matchRoom(acc.name, r.name || r.headline || ''));
    
    if (!octRoom) {
      console.log(`⚠️ Nessun match trovato su Octorate per l'alloggio Supabase: "${acc.name}"`);
      continue;
    }

    console.log(`🔌 Match: "${acc.name}" (Supabase) ➔ "${octRoom.name}" (Octorate)`);

    // Combina roomAmenities e amenities
    const allAmenities = [
      ...(octRoom.roomAmenities || []),
      ...(octRoom.amenities || [])
    ];

    // Estrazione e mappatura con fallback case-insensitive sui nomi
    const mappedFeatures = {
      wifi: checkAmenity(allAmenities, ['wifi', 'wi-fi', 'internet']),
      air_conditioning: checkAmenity(allAmenities, ['air conditioning', 'aria condizionata', 'condizionatore', 'ac']),
      kitchen: checkAmenity(allAmenities, ['kitchen', 'cucina', 'cooking', 'angolo cottura']),
      terrace_balcony: checkAmenity(allAmenities, ['terrace', 'balcony', 'terrazzo', 'balcone']),
      room_size: octRoom.squareMetersSize || acc.features?.room_size || 0,
      refrigerator: checkAmenity(allAmenities, ['refrigerator', 'fridge', 'frigorifero']),
      safe: checkAmenity(allAmenities, ['safe', 'cassaforte']),
      desk: checkAmenity(allAmenities, ['desk', 'scrivania', 'workspace']),
      hot_water: checkAmenity(allAmenities, ['hot water', 'acqua calda', 'shower hot']),
      sofa_bed: checkAmenity(allAmenities, ['sofa bed', 'divano letto']),
      private_garden: checkAmenity(allAmenities, ['private garden', 'giardino privato', 'garden']),
      ceiling_fan: true, // Sempre presente e gratuito
      ac_consumption_note: {
        it: "Aria Condizionata disponibile in ogni camera. Se non è inclusa o prepagata nella tua prenotazione, è utilizzabile a consumo al costo di 40 THB per kWh (pari a circa 20 THB all'ora). Si consiglia di tenere porte e finestre chiuse mentre è in funzione.",
        en: "Air Conditioning is available in every unit. If not included or prepaid in your booking, it is available on a pay-as-you-go basis at 40 THB per kWh (approximately 20 THB per hour). We kindly ask you to keep doors and windows closed while running."
      }
    };

    const newRooms = octRoom.bedroomQuantity || acc.rooms || 1;
    const newBathrooms = octRoom.bathroomQuantity || acc.bathrooms || 1;
    const newBeds = octRoom.bedQuantity ? `${octRoom.bedQuantity} Letti` : acc.beds || '';

    previewData.push({
      accommodationId: acc.id,
      name: acc.name,
      oldData: {
        rooms: acc.rooms,
        bathrooms: acc.bathrooms,
        beds: acc.beds,
        features: acc.features
      },
      newData: {
        rooms: newRooms,
        bathrooms: newBathrooms,
        beds: newBeds,
        features: mappedFeatures
      }
    });

    if (isWriteMode) {
      const { error: updateError } = await supabase
        .from('accommodations')
        .update({
          rooms: newRooms,
          bathrooms: newBathrooms,
          beds: newBeds,
          features: mappedFeatures,
          updated_at: new Date().toISOString()
        })
        .eq('id', acc.id);

      if (updateError) {
        console.error(`❌ Errore durante l'aggiornamento dell'alloggio "${acc.name}":`, updateError.message);
      } else {
        console.log(`✅ Alloggio "${acc.name}" aggiornato correttamente su Supabase!`);
        updatedCount++;
      }
    }
  }

  // Scrivi l'anteprima JSON in scratch
  const previewFile = path.resolve(process.cwd(), 'scratch/standardized_preview.json');
  fs.writeFileSync(previewFile, JSON.stringify(previewData, null, 2), 'utf-8');
  console.log(`\n💾 Salvato il report completo di anteprima in: scratch/standardized_preview.json`);

  // Stampa un riepilogo visivo in console
  console.log('\n📊 TABELLA DI CONFRONTO STRUTTURA E SERVIZI (PREVIEW):');
  console.log('========================================================================================');
  previewData.forEach(p => {
    console.log(`🏠 Alloggio: ${p.name}`);
    console.log(`   - Stanze:      ${p.oldData.rooms} ➔ ${p.newData.rooms}`);
    console.log(`   - Bagni:       ${p.oldData.bathrooms} ➔ ${p.newData.bathrooms}`);
    console.log(`   - Letti:       "${p.oldData.beds}" ➔ "${p.newData.beds}"`);
    console.log(`   - Metratura:   ${p.oldData.features?.room_size || 0} mq ➔ ${p.newData.features.room_size} mq`);
    
    const activeNewFeatures = Object.keys(p.newData.features)
      .filter(k => p.newData.features[k] === true && k !== 'ac_consumption_note')
      .join(', ');
    console.log(`   - Servizi Attivi: [${activeNewFeatures}]`);
    console.log('----------------------------------------------------------------------------------------');
  });

  if (isWriteMode) {
    console.log(`\n🎉 Sincronizzazione completata! ${updatedCount} alloggi aggiornati su Supabase.`);
  } else {
    console.log(`\n📝 Dry-run completato con successo. Per applicare queste modifiche su Supabase, esegui lo script aggiungendo --write.`);
  }
}

main().catch(err => {
  console.error('❌ Errore fatale durante l\'esecuzione:', err);
  process.exit(1);
});
