import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse .env / .env.local
function loadEnvironment() {
  const envPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.local')
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            const val = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
            if (!process.env[key.trim()]) {
              process.env[key.trim()] = val;
            }
          }
        }
      }
    }
  }
}

loadEnvironment();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Credenziali Supabase mancanti in .env / .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function syncAccommodationsFeatures() {
  const isWriteMode = process.argv.includes('--write');
  console.log('========================================================================');
  console.log(`  SINCRONIZZAZIONE CARATTERISTICHE ALLOGGI (Modalità: ${isWriteMode ? 'SCRITTURA LIVE' : 'DRY RUN'})`);
  console.log('========================================================================\n');

  const templatePath = path.resolve(process.cwd(), 'scratch/accommodations-features-template.json');
  if (!fs.existsSync(templatePath)) {
    console.error(`❌ Template non trovato in: ${templatePath}`);
    process.exit(1);
  }

  const templateList = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
  const templateMap = new Map();
  templateList.forEach((item) => {
    templateMap.set(item.name.toLowerCase().trim(), item);
  });

  const { data: dbAccommodations, error: fetchErr } = await supabase
    .from('accommodations')
    .select('*');

  if (fetchErr) {
    console.error('❌ Errore durante la lettura delle accommodations dal DB:', fetchErr.message);
    process.exit(1);
  }

  console.log(`📌 Trovati ${dbAccommodations.length} alloggi registrati nel database Supabase.\n`);

  let updatedCount = 0;

  for (const acc of dbAccommodations) {
    const accNameLower = (acc.name || '').toLowerCase().trim();
    const templateItem = templateMap.get(accNameLower);

    let currentDetails = {};
    if (typeof acc.details === 'string') {
      try { currentDetails = JSON.parse(acc.details); } catch {}
    } else if (acc.details && typeof acc.details === 'object') {
      currentDetails = acc.details;
    }

    const roomSize = templateItem?.room_size || currentDetails?.squareMeters || currentDetails?.features?.room_size || 20;
    const featuresObj = templateItem?.features || currentDetails?.features || {};

    const updatedDetails = {
      ...currentDetails,
      squareMeters: roomSize,
      features: {
        ...featuresObj,
        room_size: roomSize
      }
    };

    const updatedDetailsStr = JSON.stringify(updatedDetails);

    console.log(`🏠 Alloggio #${acc.id} (${acc.name}):`);
    console.log(`   - M2 Superficie: ${roomSize} m²`);
    console.log(`   - Features attive: ${Object.keys(featuresObj).filter(k => featuresObj[k] === true).join(', ')}`);

    if (isWriteMode) {
      const updatePayload = { details: updatedDetailsStr };
      const { error: updateErr } = await supabase
        .from('accommodations')
        .update(updatePayload)
        .eq('id', acc.id);

      if (updateErr) {
        console.error(`   ❌ Errore aggiornamento DB: ${updateErr.message}`);
      } else {
        updatedCount++;
        console.log(`   ✅ DB aggiornato con successo!`);
      }
    } else {
      console.log(`   ℹ️ [DRY RUN] Nessuna modifica applicata. Usa --write per salvare nel DB.`);
    }
  }

  console.log(`\n========================================================================`);
  console.log(`🎉 SINCRONIZZAZIONE CARATTERISTICHE COMPLETATA (${updatedCount}/${dbAccommodations.length} aggiornati)`);
  console.log('========================================================================\n');
}

syncAccommodationsFeatures();
