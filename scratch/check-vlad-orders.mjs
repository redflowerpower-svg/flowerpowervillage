import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const envVars = {};
  const files = ['.env.local', '.env'];
  for (const file of files) {
    const filePath = path.resolve(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0 && !envVars[key.trim()]) {
            const val = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
            envVars[key.trim()] = val;
            process.env[key.trim()] = val;
          }
        }
      }
    }
  }
  return envVars;
}

const envVars = loadEnv();
const supabase = createClient(envVars.SUPABASE_URL || envVars.VITE_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY);

async function checkCustomerOrders() {
  const { data, error } = await supabase
    .from('pizza_orders')
    .select('*')
    .or('phone.eq.0625713118,customer_name.ilike.%vlad%,address.ilike.%dreadatour%');

  console.log(`Ordini trovati per questo cliente: ${data?.length || 0}`);
  data?.forEach(o => {
    console.log(`ID: ${o.id} | Data: ${o.created_at} | Stato: ${o.status} | Totale: ${o.total} THB | Items: ${JSON.stringify(o.items?.map(i => ({ name: i.name, qty: i.quantity, total: i.total || i.basePrice })))}`);
  });
}

checkCustomerOrders().catch(console.error);
