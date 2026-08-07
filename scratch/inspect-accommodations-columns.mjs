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
const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SERVICE_ROLE || env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function inspect() {
  console.log('🔍 Inspection of accommodations table...');
  const { data, error } = await supabase.from('accommodations').select('*').limit(1);
  if (error) {
    console.error('Error fetching accommodations:', error);
  } else if (data && data.length > 0) {
    console.log('Columns in accommodations table:', Object.keys(data[0]));
    console.log('Sample row:', JSON.stringify(data[0], null, 2));
  } else {
    console.log('No rows returned.');
  }
}

inspect().catch(err => console.error(err));
