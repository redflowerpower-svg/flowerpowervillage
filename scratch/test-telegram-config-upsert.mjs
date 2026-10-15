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

async function run() {
  const testId = 'test_sentinel_alert';
  const { error: insErr } = await supabase.from('telegram_config').upsert({
    id: testId,
    bot_token: 'test_token',
    chat_id: 'test_chat',
    updated_at: new Date().toISOString()
  });
  console.log('Upsert test:', insErr ? insErr.message : 'SUCCESS');

  // Clean up
  const { error: delErr } = await supabase.from('telegram_config').delete().eq('id', testId);
  console.log('Delete test:', delErr ? delErr.message : 'SUCCESS');
}

run().catch(console.error);
