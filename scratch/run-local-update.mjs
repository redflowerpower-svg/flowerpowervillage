import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

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

// Emulate getTelegramCredentials
async function getTelegramCredentials(supabase) {
  const { data, error } = await supabase
    .from("telegram_config")
    .select("bot_token, chat_id")
    .limit(1)
    .single();

  if (error || !data) {
    console.error("Error loading credentials:", error);
    return null;
  }
  return {
    botToken: data.bot_token,
    chatId: data.chat_id,
  };
}

async function run() {
  const env = loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey);
  const orderId = 51;
  const status = 'completed';

  try {
    const creds = await getTelegramCredentials(supabase);
    if (!creds) return;
    const { botToken, chatId } = creds;
    console.log('Bot Token length:', botToken.length);
    console.log('Chat ID:', chatId);

    const { data: order, error: fetchError } = await supabase
      .from("pizza_orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      console.error('Order load failed:', fetchError);
      return;
    }

    console.log('Message ID:', order.telegram_message_id);

    const items = Array.isArray(order.items) ? order.items : [];
    const itemsText = items.map(item => `• ${item.quantity}x ${item.name}`).join('\n');
    let cleanAddress = order.address || "";
    if (cleanAddress.includes("[COORD:")) {
      cleanAddress = cleanAddress.split("[COORD:")[0].trim();
    }

    let messageText = `📦 <b>NUOVO ORDINE PIZZA</b>\n\n<b>Cliente:</b> ${order.customer_name}\n<b>Articoli:</b>\n${itemsText}\n\n✅ <b>Stato: Consegnato</b>`;

    const editUrl = `https://api.telegram.org/bot${botToken}/editMessageText`;
    console.log('Sending fetch to:', editUrl);
    
    const response = await fetch(editUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: Number(order.telegram_message_id),
        text: messageText,
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: [] },
        disable_web_page_preview: false
      })
    });

    const result = await response.json();
    console.log('Telegram Response Status:', response.status);
    console.log('Telegram Result:', result);
  } catch (err) {
    console.error('CRASH IN TEST SCRIPT:', err);
  }
}

run();
