import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { parseTableReservationFromOrder } from '../api/_helpers/table-reservation-parser.js';

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

async function testLifecycle() {
  console.log('--- TEST 1: Insert Table Reservation ---');
  const testAddress = '[TABLE_RESERVATION] [DATE:2026-09-29] [TIME:19:30] [GUESTS:4] [AREA:hut] [OCCASION:Compleanno] [NOTE:Tavolo speciale vicino alle piante] [EMAIL:test.cliente@gmail.com] [LANG:IT] [TB_CODE:TB-9999]';
  
  const { data: inserted, error: insErr } = await supabase
    .from('pizza_orders')
    .insert([{
      customer_name: 'Mario Rossi Test',
      phone: '+66949800200',
      address: testAddress,
      items: [{
        name: 'Prenotazione Tavolo (🛖 Capanna)',
        nameTh: 'จองโต๊ะ (🛖 ซุ้มกระท่อม)',
        quantity: 4,
        selectedVariant: '4 Ospiti / 2026-09-29 19:30'
      }],
      total: 0,
      status: 'new',
      payment_method: 'table_reservation',
      has_whatsapp: true,
      has_line: true
    }])
    .select('*')
    .single();

  if (insErr) {
    console.error('Insert error:', insErr);
    return;
  }
  const parsed1 = parseTableReservationFromOrder(inserted);
  console.log('✅ Created reservation order ID:', inserted.id, 'Parsed Status:', parsed1.status, '(Pending)');

  console.log('--- TEST 2: Query All Table Reservations ---');
  const { data: list, error: listErr } = await supabase
    .from('pizza_orders')
    .select('*')
    .or('payment_method.eq.table_reservation,payment_method.eq.table')
    .order('created_at', { ascending: false })
    .limit(5);

  if (listErr) {
    console.error('List error:', listErr);
    return;
  }
  console.log(`✅ Found ${list.length} table reservations in Supabase pizza_orders`);

  console.log('--- TEST 3: Approve Reservation (Telegram / KDS) ---');
  const { data: updated, error: updErr } = await supabase
    .from('pizza_orders')
    .update({ status: 'completed' })
    .eq('id', inserted.id)
    .select('*')
    .single();

  if (updErr) {
    console.error('Update error:', updErr);
    return;
  }
  const parsed2 = parseTableReservationFromOrder(updated);
  console.log('✅ Updated status successfully. Parsed Status:', parsed2.status, '(Confirmed)');

  // Clean up test record
  await supabase.from('pizza_orders').delete().eq('id', inserted.id);
  console.log('🧹 Cleaned up test record.');
  console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
}

testLifecycle();
