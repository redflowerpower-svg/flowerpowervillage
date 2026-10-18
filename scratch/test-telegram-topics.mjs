import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const envFiles = ['.env', '.env.local'];
  for (const f of envFiles) {
    const full = path.resolve(process.cwd(), f);
    if (fs.existsSync(full)) {
      const lines = fs.readFileSync(full, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testTopics() {
  const { data: config } = await supabase
    .from('telegram_config')
    .select('*')
    .eq('id', 'village')
    .maybeSingle();

  const botToken = config.bot_token;
  const chatId = config.chat_id;

  const topics = [
    { name: 'BOOKINGS', threadId: 3 },
    { name: 'MODIFICATIONS_CANCELLATIONS', threadId: 7 },
    { name: 'ALERTS_OVERBOOKING', threadId: 8 },
    { name: 'DAILY_REPORT', threadId: 9 },
    { name: 'NO_TOPIC', threadId: undefined }
  ];

  for (const t of topics) {
    const body = {
      chat_id: chatId,
      text: `🧪 [TEST SYSTEM AUDIT] Verifica canale ${t.name}`,
      ...(t.threadId ? { message_thread_id: t.threadId } : {})
    };

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const resData = await res.json();
    console.log(`Topic ${t.name} (threadId: ${t.threadId}):`, resData.ok ? 'SUCCESS' : resData);
  }
}

testTopics().catch(console.error);
