import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Parse .env.local
const envFile = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase
    .from('pizza_orders')
    .select('id, customer_name, address, status, items, created_at, total')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Query error:', error);
    return;
  }

  console.log('--- RECENT ORDERS IN DATABASE ---');
  data.forEach(o => {
    console.log(`[ID ${o.id}] Status: ${o.status} | Total: ${o.total}฿ | Address: ${o.address} | CreatedAt: ${o.created_at}`);
    console.log(`  Customer: ${o.customer_name}`);
    const items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []);
    console.log(`  Items (${items.length}):`, items.map(i => `${i.quantity}x ${i.name || i.productId}`).join(', '));
    console.log('---');
  });
}

check();
