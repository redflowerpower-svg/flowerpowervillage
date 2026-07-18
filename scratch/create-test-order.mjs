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

  const orderData = {
    customer_name: "Test Mario",
    phone: "+393331234567",
    address: "Flower Power Village, Ranong [COORD: 9.965,98.634]",
    items: [
      { name: "Margherita", quantity: 2, itemTotal: 300 }
    ],
    total: 300,
    status: 'new',
    payment_method: 'cash',
    has_whatsapp: true,
    has_line: false
  };

  console.log('Inserting test order into pizza_orders table...');
  const { data, error } = await supabase
    .from('pizza_orders')
    .insert([orderData])
    .select();

  if (error) {
    console.error('ERRORE DI INSERIMENTO DB! ❌', error.message, error.details || '');
  } else {
    console.log('SUCCESSO! ✅ Ordine inserito:', data);
  }
}

run();
