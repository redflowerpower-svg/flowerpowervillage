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

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  console.log("=== 1. VERIFICA TELEGRAM CONFIG ===");
  const { data: configs, error: configErr } = await supabase
    .from('telegram_config')
    .select('*');

  if (configErr) {
    console.error("Error reading telegram_config:", configErr);
  } else {
    console.log(`Trovate ${configs?.length || 0} righe in telegram_config:`);
    for (const c of configs || []) {
      const maskedToken = c.bot_token ? `${c.bot_token.slice(0, 6)}...${c.bot_token.slice(-4)}` : 'NULL';
      console.log({
        id: c.id,
        department: c.department,
        hasToken: !!c.bot_token,
        maskedToken,
        chatId: c.chat_id,
        topicId: c.topic_id,
        topics: c.topics,
        updated_at: c.updated_at
      });
    }
  }

  console.log("\n=== 2. VERIFICA ENV TELEGRAM ===");
  console.log({
    TELEGRAM_VILLAGE_BOT_TOKEN: process.env.TELEGRAM_VILLAGE_BOT_TOKEN ? 'DEFINED' : 'UNDEFINED',
    TELEGRAM_VILLAGE_CHAT_ID: process.env.TELEGRAM_VILLAGE_CHAT_ID ? process.env.TELEGRAM_VILLAGE_CHAT_ID : 'UNDEFINED',
    TELEGRAM_BOT_TOKEN_VILLAGE: process.env.TELEGRAM_BOT_TOKEN_VILLAGE ? 'DEFINED' : 'UNDEFINED',
    TELEGRAM_CHAT_ID_VILLAGE: process.env.TELEGRAM_CHAT_ID_VILLAGE ? process.env.TELEGRAM_CHAT_ID_VILLAGE : 'UNDEFINED',
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ? 'DEFINED' : 'UNDEFINED',
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID ? process.env.TELEGRAM_CHAT_ID : 'UNDEFINED'
  });

  console.log("\n=== 3. VERIFICA TABELLE PRENOTAZIONI / OCTORATE ===");
  const tables = ['bookings', 'octorate_bookings', 'reservations', 'village_bookings', 'octorate_webhook_logs', 'webhook_logs'];
  for (const tbl of tables) {
    const { count, error } = await supabase.from(tbl).select('*', { count: 'exact', head: true });
    if (!error) {
      console.log(`Tabella '${tbl}' ESISTE, righe: ${count}`);
    } else {
      console.log(`Tabella '${tbl}' non trovata o errore: ${error.code} - ${error.message}`);
    }
  }

  console.log("\n=== 4. VERIFICA OCTORATE TOKEN ===");
  const { data: tokenData, error: tokenErr } = await supabase
    .from('octorate_tokens')
    .select('*')
    .eq('id', 'singleton')
    .maybeSingle();

  if (tokenErr) {
    console.error("Errore lettura octorate_tokens:", tokenErr);
  } else if (tokenData) {
    console.log("Token Octorate trovato. Scadenza/Aggiornamento:", tokenData.updated_at);
  } else {
    console.log("Nessun token Octorate trovato in singleton.");
  }
}

main().catch(console.error);
