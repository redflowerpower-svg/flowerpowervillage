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
            envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          }
        }
      }
    }
  }
  return envVars;
}

const envVars = loadEnv();
const supabase = createClient(envVars.SUPABASE_URL || envVars.VITE_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY);

async function testTelegramVillage() {
  const { data } = await supabase.from('telegram_config').select('*').eq('id', 'village').maybeSingle();
  console.log('Village config:', data);
  if (!data?.bot_token || !data?.chat_id) {
    console.error('Village bot token or chat ID not found');
    return;
  }

  const res = await fetch(`https://api.telegram.org/bot${data.bot_token}/getMe`);
  const botInfo = await res.json();
  console.log('Bot info:', botInfo);
}

testTelegramVillage().catch(console.error);
