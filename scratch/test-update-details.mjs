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
          if (value.length > 0 && (value.charAt(0) === '"' || value.charAt(0) === "'")) {
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
const supabase = createClient(env.SUPABASE_URL || env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SERVICE_ROLE);

async function testUpdate() {
  console.log('Testing update on details column for 01_red_bungalow...');
  const sampleDetails = {
    rooms: 1,
    bathrooms: 1,
    beds: "1 Double Bed (150x200)",
    squareMeters: 30,
    features: {
      room_size: 30,
      sofa_bed: false,
      ceiling_fan: true,
      air_conditioning: true,
      hot_water: true,
      wifi: true,
      safe: true,
      desk: true,
      kitchen: false,
      refrigerator: true,
      terrace_balcony: true,
      private_garden: false,
      ac_consumption_note: {
        it: "Aria Condizionata disponibile in ogni camera...",
        en: "Air Conditioning is available in every unit..."
      }
    }
  };

  const { data, error } = await supabase
    .from('accommodations')
    .update({ details: sampleDetails })
    .eq('slug', '01_red_bungalow')
    .select();

  if (error) {
    console.error('Update failed:', error);
  } else {
    console.log('Update successful!', data);
  }
}

testUpdate();
