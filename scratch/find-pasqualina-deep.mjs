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

async function findExactOrder() {
  console.log('--- RICERCA APPROFONDITA PER PASQUALINA O MEZZA PIZZA ---');

  const { data: orders, error } = await supabase
    .from('pizza_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Errore:', error);
    return;
  }

  console.log(`Totale ordini nel DB: ${orders.length}`);

  const matches = orders.filter(o => {
    const raw = JSON.stringify(o).toLowerCase();
    return raw.includes('pasqualina') || raw.includes('half') || raw.includes('mezz');
  });

  console.log(`\nOrdini trovati con pasqualina o half/mezza: ${matches.length}`);
  for (const o of matches) {
    console.log(`================================================================`);
    console.log(`ID Ordine: ${o.id}`);
    console.log(`Data e Ora Creazione: ${o.created_at}`);
    console.log(`Cliente: ${o.customer_name} | Telefono: ${o.phone}`);
    console.log(`Indirizzo / Note: ${o.address}`);
    console.log(`Metodo Pagamento: ${o.payment_method}`);
    console.log(`Stato: ${o.status}`);
    console.log(`Totale: ${o.total} THB`);
    console.log(`Articoli ordinati (${o.items?.length || 0}):`);
    for (const item of (o.items || [])) {
      console.log(`  - Nome: ${item.name || item.title || item.productId}`);
      console.log(`    Variante: ${item.variant || item.selectedVariant || 'N/A'}`);
      console.log(`    Quantità: ${item.quantity}`);
      console.log(`    Prezzo Base: ${item.basePrice} | Totale: ${item.total}`);
      console.log(`    Extras / Note:`, item.extras || item.selectedExtras);
      console.log(`    CartId: ${item.cartId}`);
      console.log(`    Raw Item:`, JSON.stringify(item));
    }
  }

  // Also print the 10 most recent orders just to see what happened today or yesterday
  console.log(`\n--- ULTIMI 10 ORDINI REGISTRATI NEL DB ---`);
  for (let i = 0; i < Math.min(10, orders.length); i++) {
    const o = orders[i];
    console.log(`ID: ${o.id} | Data: ${o.created_at} | Cliente: ${o.customer_name} | Totale: ${o.total} THB | Status: ${o.status} | Items: ${(o.items || []).map(it => it.name || it.productId).join(', ')}`);
  }
}

findExactOrder().catch(console.error);
