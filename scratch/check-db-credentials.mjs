import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

function loadEnv() {
  const envPath = path.resolve('.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('.env.local file not found!');
    return {};
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      let value = parts.slice(1).join('=').trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }
      env[key] = value;
    }
  });
  return env;
}

async function run() {
  const env = loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase keys missing in .env.local!');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Querying telegram_config from Supabase...');
  const { data, error } = await supabase
    .from('telegram_config')
    .select('*')
    .eq('id', 'default')
    .maybeSingle();

  if (error) {
    console.error('Error fetching telegram_config:', error.message);
  } else if (!data) {
    console.log('No credentials found in the database table (default row is empty).');
  } else {
    console.log('\n--- CREDENTIALS FOUND IN DATABASE ---');
    console.log('Bot Token:', data.bot_token ? `${data.bot_token.substring(0, 8)}...` : 'empty');
    console.log('Chat ID:', data.chat_id);
    console.log('Updated At:', data.updated_at);
  }
}

run();
