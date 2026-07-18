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

async function run() {
  const env = loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Fetch telegram credentials to get the authorized chat ID
  const { data: creds } = await supabase
    .from("telegram_config")
    .select("chat_id")
    .limit(1)
    .single();

  const chatId = creds?.chat_id || "-940276745";

  // 2. Insert a fresh test order with status 'new'
  console.log("Creating test order...");
  const { data: order, error } = await supabase
    .from("pizza_orders")
    .insert([{
      customer_name: "Webhook Tester",
      phone: "123456",
      address: "Test street",
      items: [{ name: "Test Pizza", quantity: 1 }],
      total: 200,
      status: "new",
      payment_method: "cash",
      telegram_notified: true,
      telegram_message_id: 123456789 // Mock message ID
    }])
    .select()
    .single();

  if (error) {
    console.error("Order creation failed:", error);
    return;
  }

  console.log(`Created order ${order.id}. Sending webhook simulation to Vercel...`);

  // 3. Construct Telegram callback query payload
  const payload = {
    update_id: 999999,
    callback_query: {
      id: "mock_query_id",
      from: { id: 12345, is_bot: false, first_name: "Red" },
      message: {
        message_id: 123456789,
        chat: { id: Number(chatId), type: "group" },
        date: Math.floor(Date.now() / 1000),
        text: "Nuovo ordine..."
      },
      data: `prepare_${order.id}`
    }
  };

  try {
    const res = await fetch("https://flowerpowervillage.vercel.app/api/telegram-webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("Webhook Response HTTP:", res.status);
    console.log("Webhook Response Body:", data);

    // Check order status in DB now
    const { data: updatedOrder } = await supabase
      .from("pizza_orders")
      .select("status")
      .eq("id", order.id)
      .single();

    console.log("Database status after webhook call:", updatedOrder?.status);
  } catch (err) {
    console.error("Webhook test failed:", err);
  }
}

run();
