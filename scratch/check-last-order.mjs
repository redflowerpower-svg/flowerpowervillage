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

  console.log('Querying last order from Supabase...');
  const { data, error } = await supabase
    .from('pizza_orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching order:', error.message);
  } else if (!data || data.length === 0) {
    console.log('No orders found in the database.');
  } else {
    console.log('\n--- LAST ORDER FOUND ---');
    console.log('ID:', data[0].id);
    console.log('Customer:', data[0].customer_name);
    console.log('Status:', data[0].status);
    console.log('Created At:', data[0].created_at);
  }
}

run();
