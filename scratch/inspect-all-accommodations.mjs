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

async function inspectAll() {
  const { data, error } = await supabase.from('accommodations').select('*');
  if (error) {
    console.error(error);
    return;
  }
  console.log(`Found ${data.length} accommodations in Supabase:`);
  data.forEach(item => {
    console.log(`ID: ${item.id} | Name: ${item.name} | Slug: ${item.slug} | Capacity: ${item.people_capacity}`);
    console.log('Details:', item.details);
  });
}

inspectAll();
