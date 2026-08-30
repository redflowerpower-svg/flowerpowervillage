import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

let url = process.env.SUPABASE_URL || '';
let key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!url || !key) {
  const content = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8');
  for (const line of content.split('\n')) {
    if (line.startsWith('SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
  }
}

const supabase = createClient(url, key);

async function checkAndSeedPaymentSettings() {
  const { data, error } = await supabase.from('payment_settings').select('*').eq('id', 'singleton').maybeSingle();
  console.log('Current payment_settings in Supabase:\n', JSON.stringify(data, null, 2));

  // Update or insert with current active keys
  const payload = {
    id: 'singleton',
    active_primary_gateway: 'ksher',
    paypal_enabled: true,
    ksher_config: {
      appId: 'mch39593',
      channelList: ['card', 'promptpay'],
      signType: 'MD5_RSA'
    },
    paypal_config: {
      clientId: 'AQ2tHwFZTSq5KPuZWRxw-3s11DNXrX1x0IFcZb6JmFseCnU_gMIL9a8jCJ199LgJy0HyoCMnASsnc9Fp',
      clientSecret: 'EJrgrVKKfC7DxMs8HM5vkK9nPBHqRQLO4hkf98KtuNuICgg1eZPe5LzVU2Iztbg14ZC4R1Rq6AFqY0YL',
      mode: 'sandbox',
      receiverEmail: 'payments@flowerpowerphayam.com'
    },
    updated_at: new Date().toISOString()
  };

  const { data: upsertData, error: upsertError } = await supabase.from('payment_settings').upsert(payload).select().single();
  if (upsertError) {
    console.error('Upsert Error:', upsertError);
  } else {
    console.log('✅ Supabase payment_settings successfully synced with PayPal & Ksher credentials!');
  }
}

checkAndSeedPaymentSettings();
