import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
}

const supabaseUrl = envVars.SUPABASE_URL || envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConstraints() {
  const testStatuses = ['new', 'preparing', 'delivering', 'completed', 'cancelled', 'ready'];
  for (const st of testStatuses) {
    const { data, error } = await supabase.from('pizza_orders').insert([{
      customer_name: 'Test ' + st,
      phone: '123',
      address: 'Test',
      items: [],
      total: 0,
      status: st,
      payment_method: 'cash'
    }]).select('id').single();

    if (error) {
      console.log(`Status "${st}": ❌ ${error.message}`);
    } else {
      console.log(`Status "${st}": ✅ ALLOWED! (ID: ${data.id})`);
      await supabase.from('pizza_orders').delete().eq('id', data.id);
    }
  }

  const testMethods = ['cash', 'promptpay', 'omise', 'table_reservation', 'table'];
  for (const pm of testMethods) {
    const { data, error } = await supabase.from('pizza_orders').insert([{
      customer_name: 'Test PM ' + pm,
      phone: '123',
      address: 'Test',
      items: [],
      total: 0,
      status: 'new',
      payment_method: pm
    }]).select('id').single();

    if (error) {
      console.log(`PaymentMethod "${pm}": ❌ ${error.message}`);
    } else {
      console.log(`PaymentMethod "${pm}": ✅ ALLOWED! (ID: ${data.id})`);
      await supabase.from('pizza_orders').delete().eq('id', data.id);
    }
  }
}

testConstraints();
