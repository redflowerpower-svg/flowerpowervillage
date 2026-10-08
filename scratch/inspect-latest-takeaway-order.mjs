import { createClient } from "@supabase/supabase-js";
import fs from "fs";

function loadEnv() {
  const env = {};
  const files = ['.env', '.env.local'];
  for (const file of files) {
    if (fs.existsSync(file)) {
      const lines = fs.readFileSync(file, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          env[key] = val;
        }
      }
    }
  }
  return env;
}

const env = loadEnv();
const supabase = createClient(
  env.VITE_SUPABASE_URL || env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase
    .from("pizza_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching pizza_orders:", error);
    return;
  }

  console.log("=== LATEST 5 ORDERS IN DATABASE ===");
  data.forEach((o, i) => {
    console.log(`\n--- ORDER #${i + 1} (ID: ${o.id}) ---`);
    console.log(`Created At: ${o.created_at}`);
    console.log(`Customer: ${o.customer_name} | Phone: ${o.customer_phone}`);
    console.log(`Status: ${o.status} | Payment: ${o.payment_method} | Paid: ${o.is_paid}`);
    console.log(`Total: ${o.total_price || o.total} THB`);
    console.log(`Address / Location: ${o.delivery_address || o.address}`);
    console.log(`Notes: ${o.notes || 'None'}`);
    console.log(`Items:`, JSON.stringify(o.items, null, 2));
  });
}

check();
