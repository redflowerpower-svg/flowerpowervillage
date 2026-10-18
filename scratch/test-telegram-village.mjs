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

async function testTelegramVillage() {
  const { data: config } = await supabase
    .from('telegram_config')
    .select('*')
    .eq('id', 'village')
    .maybeSingle();

  console.log("Village telegram config:", {
    id: config?.id,
    chat_id: config?.chat_id,
    has_token: !!config?.bot_token,
    topic_id: config?.topic_id,
    topics: config?.topics
  });

  if (!config?.bot_token || !config?.chat_id) {
    console.error("Village bot_token or chat_id missing in database!");
    return;
  }

  // Proviamo a fare getMe su Telegram
  try {
    const meRes = await fetch(`https://api.telegram.org/bot${config.bot_token}/getMe`);
    const meData = await meRes.json();
    console.log("Telegram getMe result:", meData);
  } catch (err) {
    console.error("Telegram getMe error:", err);
  }

  // Proviamo a fare getChat
  try {
    const chatRes = await fetch(`https://api.telegram.org/bot${config.bot_token}/getChat?chat_id=${config.chat_id}`);
    const chatData = await chatRes.json();
    console.log("Telegram getChat result:", chatData);
  } catch (err) {
    console.error("Telegram getChat error:", err);
  }
}

testTelegramVillage().catch(console.error);
