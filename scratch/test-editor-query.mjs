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

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function findAccommodationRow(accName) {
  const cleanTargetName = String(accName || '').replace(/^\d+[\s._-]+/, '').trim().toLowerCase();
  
  const { data: allAccommodations } = await supabase
    .from('accommodations')
    .select('id, name, slug, details');

  if (!allAccommodations) return null;

  return allAccommodations.find((dbRow) => {
    const cleanDbName = String(dbRow.name || '').replace(/^\d+[\s._-]+/, '').trim().toLowerCase();
    const cleanDbSlug = String(dbRow.slug || '').replace(/^\d+[\s._-]+/, '').trim().toLowerCase();

    if (cleanTargetName.includes('left') && cleanDbSlug.includes('left')) return true;
    if (cleanTargetName.includes('right') && cleanDbSlug.includes('right')) return true;
    if (cleanTargetName === 'jungle villa' && cleanDbName === 'jungle villa' && !cleanDbSlug.includes('left') && !cleanDbSlug.includes('right')) return true;
    if (cleanDbName === cleanTargetName) return true;

    return false;
  }) || null;
}

async function main() {
  const testNames = ['Jungle Villa', 'Jungle Villa Left', 'Jungle Villa Right', 'Peace & Love Villa', 'Red Bungalow'];

  for (const name of testNames) {
    const match = await findAccommodationRow(name);
    console.log(`Input: "${name}" -> Found DB Row:`, {
      id: match?.id,
      name: match?.name,
      slug: match?.slug,
      hasDetails: Boolean(match?.details)
    });
  }
}

main();
