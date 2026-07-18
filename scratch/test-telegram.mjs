import fs from 'fs';
import path from 'path';

// Helper to load env variables from .env.local manually
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
      // Remove surrounding quotes if present
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
  const token = env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

  console.log('--- DIAGNOSTICS TELEGRAM ---');
  console.log('TELEGRAM_BOT_TOKEN:', token ? `${token.substring(0, 8)}... (configured)` : 'MISSING ❌');
  console.log('TELEGRAM_CHAT_ID:', chatId ? `${chatId} (configured)` : 'MISSING ❌');

  if (!token || !chatId) {
    console.error('\nDevi configurare TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID nel file .env.local per far funzionare il bot!');
    return;
  }

  const testMessage = `🤖 <b>Test di Connessione</b>\nIl collegamento a Telegram funziona correttamente!`;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  console.log('\nInvio messaggio di test a Telegram...');
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: testMessage,
        parse_mode: 'HTML'
      })
    });

    const data = await res.json();
    if (res.ok && data.ok) {
      console.log('SUCCESSO! ✅ Messaggio inviato correttamente.');
      console.log('Message ID:', data.result.message_id);
    } else {
      console.error('ERRORE! ❌ Risposta da Telegram:', data);
    }
  } catch (err) {
    console.error('ERRORE DI RETE! ❌ Impossibile connettersi all\'API di Telegram:', err.message);
  }
}

run();
