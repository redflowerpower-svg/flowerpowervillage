import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
}

async function testWebhookDirect() {
  console.log('Testing local telegram webhook handler against order 118...');
  const { handleTelegramWebhook } = await import('../api/_handlers/telegram.js');
  const { createClient } = await import('@supabase/supabase-js');

  const supabase = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

  // Set order 118 to pending (status: new)
  await supabase.from('pizza_orders').update({ status: 'new', address: '[TABLE_RESERVATION] [DATE:2026-09-28] [TIME:19:00] [GUESTS:2] [AREA:hut] [OCCASION:] [NOTE:] [EMAIL:redflowerpower@gmail.com] [LANG:IT] [TB_CODE:TB-2637I6]' }).eq('id', 118);

  const req = {
    method: 'POST',
    body: {
      callback_query: {
        id: 'test_cb_' + Date.now(),
        from: { username: 'testuser', first_name: 'Test' },
        message: {
          chat: { id: parseInt(process.env.TELEGRAM_CHAT_ID || '-1002241617258', 10) },
          message_id: 999999
        },
        data: 'approve_table_118'
      }
    }
  };

  let responseData = null;
  const res = {
    status: (code) => ({
      json: (data) => {
        responseData = { code, data };
        return responseData;
      }
    })
  };

  await handleTelegramWebhook(req, res);
  console.log('Webhook direct call result:', responseData);

  // Check order in DB
  const { data: order } = await supabase.from('pizza_orders').select('id, status, address').eq('id', 118).single();
  console.log('Order 118 in DB after webhook execution:', order);
}

testWebhookDirect();
