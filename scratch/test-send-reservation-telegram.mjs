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

async function testAlerts() {
  const { data: config } = await supabase
    .from('telegram_config')
    .select('*')
    .eq('id', 'village')
    .single();

  const botToken = config.bot_token;
  const chatId = config.chat_id;

  // 1. Test prenotazione su topic BOOKINGS (threadId 3)
  const bookingMsg = `🟢 <b>[NUOVA PRENOTAZIONE RICEVUTA]</b>\n` +
    `🏨 <b>Alloggio:</b> Lagoon Tent (Lagoon Main bnb-7d)\n` +
    `👤 <b>Ospite:</b> <b>Judith Rodgers</b>\n` +
    `🌐 <b>Canale:</b> Booking.com\n` +
    `📅 <b>Check-in:</b> <code>2026-12-12</code>\n` +
    `🛫 <b>Check-out:</b> <code>2026-12-26</code>\n` +
    `🌙 <b>Durata:</b> <b>14 notti</b>\n` +
    `💰 <b>Totale:</b> <b>15.627,23 THB</b>\n` +
    `🔖 <b>Codice Prenotazione:</b> <code>#126942325</code>`;

  const res1 = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_thread_id: 3,
      text: bookingMsg,
      parse_mode: 'HTML'
    })
  });
  console.log("Send booking alert (topic 3):", (await res1.json()).ok ? "SUCCESS" : "ERROR");

  // 2. Test cancellazione su topic MODIFICATIONS_CANCELLATIONS (threadId 7)
  const cancelMsg = `🔴 <b>[CANCELLAZIONE PRENOTAZIONE]</b>\n` +
    `🏨 <b>Alloggio:</b> Internal Room (Inter Main bnb-7d)\n` +
    `👤 <b>Ospite:</b> <b>Cesare Crepaldi</b>\n` +
    `🌐 <b>Canale:</b> Booking.com\n` +
    `📅 <b>Periodo Annullato:</b> <code>2027-02-24 ➔ 2027-03-02</code> (<b>6 notti</b>)\n` +
    `💰 <b>Importo Rilasciato:</b> <b>6.484,90 THB</b>\n` +
    `🔖 <b>Codice Prenotazione:</b> <code>#126086677</code>`;

  const res2 = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_thread_id: 7,
      text: cancelMsg,
      parse_mode: 'HTML'
    })
  });
  console.log("Send cancellation alert (topic 7):", (await res2.json()).ok ? "SUCCESS" : "ERROR");
}

testAlerts().catch(console.error);
