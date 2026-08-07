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

async function main() {
  const templatePath = path.resolve(process.cwd(), 'scratch/accommodations-features-template.json');
  if (!fs.existsSync(templatePath)) {
    console.error(`❌ Errore: Il file di template ${templatePath} non esiste.`);
    process.exit(1);
  }

  const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
  console.log(`\n🚀 Avvio importazione ed allineamento caratteristiche su Supabase (18 alloggi)...\n`);

  const { data: dbAccommodations, error: fetchErr } = await supabase
    .from('accommodations')
    .select('*');

  if (fetchErr) {
    console.error('❌ Errore nel recupero degli alloggi da Supabase:', fetchErr.message);
    process.exit(1);
  }

  let successCount = 0;

  for (const dbItem of dbAccommodations) {
    const cleanDbSlug = (dbItem.slug || '').toLowerCase().replace(/^\d+_/, '').trim();
    const cleanDbName = (dbItem.name || '').toLowerCase().trim();

    // Match template item by name or slug
    const templateMatch = templateData.find((t) => {
      const cleanTName = (t.name || '').toLowerCase().trim();
      const cleanTSlug = cleanTName.replace(/\s+/g, '-');

      if (cleanDbName === cleanTName) return true;
      if (cleanDbSlug === cleanTSlug) return true;
      if (cleanDbSlug.includes('jungle') && cleanDbSlug.includes('left') && cleanTName.includes('left')) return true;
      if (cleanDbSlug.includes('jungle') && cleanDbSlug.includes('right') && cleanTName.includes('right')) return true;
      if (cleanDbSlug.includes('jungle') && !cleanDbSlug.includes('left') && !cleanDbSlug.includes('right') && cleanTName === 'jungle villa') return true;
      if (cleanDbSlug.includes('peace') && cleanTName.includes('peace')) return true;
      if (cleanDbSlug.includes('penthouse') && cleanTName.includes('penthouse')) return true;
      if (cleanDbSlug.includes('red') && cleanTName.includes('red')) return true;
      if (cleanDbSlug.includes('green') && cleanTName.includes('green')) return true;
      if (cleanDbSlug.includes('yellow') && cleanTName.includes('yellow')) return true;
      if (cleanDbSlug.includes('camel') && cleanTName.includes('camel')) return true;
      if (cleanDbSlug.includes('lagoon') && cleanTName.includes('lagoon')) return true;
      if (cleanDbSlug.includes('internal') && cleanTName.includes('internal')) return true;
      if (cleanDbSlug === '31_room_1' || (cleanDbSlug.includes('room') && cleanDbSlug.includes('1') && cleanTName === 'room 1')) return true;
      if (cleanDbSlug === '32_room_2' || (cleanDbSlug.includes('room') && cleanDbSlug.includes('2') && cleanTName === 'room 2')) return true;
      if (cleanDbSlug === '33_room_3' || (cleanDbSlug.includes('room') && cleanDbSlug.includes('3') && cleanTName === 'room 3')) return true;
      if (cleanDbSlug === '34_room_4' || (cleanDbSlug.includes('room') && cleanDbSlug.includes('4') && cleanTName === 'room 4')) return true;
      if (cleanDbSlug === '35_room_5' || (cleanDbSlug.includes('room') && cleanDbSlug.includes('5') && cleanTName === 'room 5')) return true;
      if (cleanDbSlug.includes('lodge') && cleanDbSlug.includes('1') && cleanTName === 'lodge 1') return true;
      if (cleanDbSlug.includes('lodge') && cleanDbSlug.includes('2') && cleanTName === 'lodge 2') return true;

      return false;
    });

    if (!templateMatch) {
      console.warn(`⚠️ Nessun template trovato per alloggio DB: "${dbItem.name}" (slug: ${dbItem.slug})`);
      continue;
    }

    const currentDetails = typeof dbItem.details === 'object' && dbItem.details !== null ? dbItem.details : {};
    
    const updatedFeatures = {
      room_size: templateMatch.room_size || 0,
      wifi: Boolean(templateMatch.features?.wifi),
      hubit_coworking: Boolean(templateMatch.features?.hubit_coworking),
      air_conditioning: Boolean(templateMatch.features?.air_conditioning),
      ceiling_fan: Boolean(templateMatch.features?.ceiling_fan),
      safe: Boolean(templateMatch.features?.safe),
      desk: Boolean(templateMatch.features?.desk),
      sofa_bed: Boolean(templateMatch.features?.sofa_bed),
      hot_water: Boolean(templateMatch.features?.hot_water),
      kitchen: Boolean(templateMatch.features?.kitchen),
      refrigerator: Boolean(templateMatch.features?.refrigerator),
      outdoor_lounge: Boolean(templateMatch.features?.outdoor_lounge),
      terrace_balcony: Boolean(templateMatch.features?.terrace_balcony),
      private_garden: Boolean(templateMatch.features?.private_garden),
      swimming_pool: Boolean(templateMatch.features?.swimming_pool),
      gym: Boolean(templateMatch.features?.gym),
      yoga_temple: Boolean(templateMatch.features?.yoga_temple)
    };

    const updatedDetails = {
      ...currentDetails,
      squareMeters: templateMatch.room_size || 0,
      features: updatedFeatures
    };

    const { error: updateErr } = await supabase
      .from('accommodations')
      .update({
        details: updatedDetails
      })
      .eq('id', dbItem.id);

    if (updateErr) {
      console.error(`❌ Errore aggiornamento "${dbItem.name}":`, updateErr.message);
      continue;
    }

    console.log(`\x1b[32m${dbItem.name} (${dbItem.slug}) aggiornato con successo... (${templateMatch.room_size}mq)\x1b[0m`);
    successCount++;
  }

  console.log(`\n=============================================================`);
  console.log(`🎉 OPERAZIONE COMPLETATA: ${successCount} su ${dbAccommodations.length} ALLOGGI SINCRONIZZATI SU SUPABASE`);
  console.log(`=============================================================\n`);
}

main().catch(err => {
  console.error('❌ Errore imprevisto:', err);
  process.exit(1);
});
