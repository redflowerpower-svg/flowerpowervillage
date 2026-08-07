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

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function main() {
  const { data: dbAccommodations, error } = await supabase
    .from('accommodations')
    .select('id, name, slug, details')
    .order('name');

  if (error) {
    console.error('Error fetching data:', error);
    process.exit(1);
  }

  const result = dbAccommodations.map((item) => {
    let details = item.details;
    if (typeof details === 'string') {
      try { details = JSON.parse(details); } catch { details = {}; }
    }
    const feats = details?.features || {};
    const activeFeats = Object.keys(feats).filter(k => feats[k] === true);

    return {
      name: item.name,
      slug: item.slug,
      squareMeters: details?.squareMeters || feats?.room_size || 0,
      activeFeatures: activeFeats,
      rawFeatures: feats
    };
  });

  console.log(JSON.stringify(result, null, 2));
}

main();
