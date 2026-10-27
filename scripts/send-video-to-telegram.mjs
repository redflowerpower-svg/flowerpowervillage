/**
 * Invia un video di prova al Supergruppo Telegram Staff (reparto Social).
 * Uso: node scripts/send-video-to-telegram.mjs --file=scratch/parity/P1.localseeded.mp4 [--topic=3] [--caption="..."]
 * Il token del bot viene letto da env (TELEGRAM_SOCIAL_BOT_TOKEN) o dalla tabella Supabase telegram_config (id='social').
 */
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const env = { ...process.env };
if (fs.existsSync('.env')) {
  for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/);
    if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const arg = (k, d = '') => {
  const f = process.argv.slice(2).find(a => a.startsWith(`--${k}=`));
  return f ? f.slice(k.length + 3) : d;
};

const file = path.resolve(arg('file'));
const topic = arg('topic', '3'); // 2 = Gruppo Koh Phayam, 3 = TikTok & Stories
const caption = arg('caption', '🧪 Test parity: video esportato dal player (robot headless)');
const chatId = '-1004492692624';

let token = env.TELEGRAM_SOCIAL_BOT_TOKEN;
if (!token) {
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const sb = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY);
  const { data } = await sb.from('telegram_config').select('bot_token').eq('id', 'social').maybeSingle();
  token = data?.bot_token;
}
if (!token) { console.error('Token bot non trovato'); process.exit(1); }

const form = new FormData();
form.append('chat_id', chatId);
form.append('message_thread_id', topic);
form.append('caption', caption);
form.append('supports_streaming', 'true');
form.append('width', '1080');
form.append('height', '1920');
form.append('video', new Blob([fs.readFileSync(file)], { type: 'video/mp4' }), path.basename(file));

const res = await fetch(`https://api.telegram.org/bot${token}/sendVideo`, { method: 'POST', body: form });
const json = await res.json();
console.log(json.ok ? '✅ Inviato su Telegram' : `❌ Errore: ${JSON.stringify(json)}`);
process.exit(json.ok ? 0 : 1);
