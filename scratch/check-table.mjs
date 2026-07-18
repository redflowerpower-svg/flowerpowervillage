import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

function loadEnv() {
  const envPath = path.resolve('.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('.env.local file not found!');
    return {};
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      let value = parts.slice(1).join('=').trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }
      env[key] = value;
    }
  });
  return env;
}

async function run() {
  const env = loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase keys missing in .env.local!');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Checking database table structures...');
  
  // Check pizza_orders structure by fetching 1 row (or empty) and checking columns
  const { data: cols, error: colError } = await supabase
    .from('pizza_orders')
    .select('id, has_whatsapp, has_line')
    .limit(1);

  if (colError) {
    console.log('❌ Column check failed on pizza_orders:', colError.message);
  } else {
    console.log('✅ Columns has_whatsapp and has_line exist on pizza_orders.');
  }

  // Check telegram_config table
  const { data: configCheck, error: configError } = await supabase
    .from('telegram_config')
    .select('id')
    .limit(1);

  if (configError) {
    console.log('❌ Table telegram_config check failed:', configError.message);
  } else {
    console.log('✅ Table telegram_config exists in the database.');
  }
}

run();
