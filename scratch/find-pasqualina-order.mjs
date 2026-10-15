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

async function findOrder() {
  console.log('--- RICERCA ORDINI PIZZA ---');
  
  // 1. Fetch recent orders
  const { data: orders, error } = await supabase
    .from('pizza_orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching orders:', error);
    return;
  }

  console.log(`Trovati ${orders?.length || 0} ordini recenti.`);

  for (const o of orders || []) {
    const itemsStr = JSON.stringify(o.items || []).toLowerCase();
    const isMatch = itemsStr.includes('pasqualina') || itemsStr.includes('mezz') || itemsStr.includes('half') || itemsStr.includes('12');
    
    console.log(`\n---------------------------------------------------------`);
    console.log(`Ordine ID: ${o.id} | Data: ${o.created_at}`);
    console.log(`Cliente: ${o.customer_name} | Tel: ${o.phone}`);
    console.log(`Indirizzo: ${o.address}`);
    console.log(`Stato: ${o.status} | Metodo Pagamento: ${o.payment_method}`);
    console.log(`Totale: ${o.total} THB`);
    console.log(`Items:`, JSON.stringify(o.items, null, 2));
    if (o.notes) console.log(`Note: ${o.notes}`);
  }
}

findOrder().catch(console.error);
