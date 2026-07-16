import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { getTelegramCredentials, buildContactLines } from "./_helpers/telegram.js";

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Temporary storage cleanup hook (Hobby plan limit bypass)
  if (req.query.action === "cleanup") {
    try {
      const { data: files, error: listError } = await supabase
        .storage
        .from("delivery_food")
        .list("01-Pizza", { limit: 200 });

      if (listError) {
        return res.status(500).json({ error: "List error", details: listError });
      }

      const pngFiles = files
        .filter((f: any) => f.name && f.name.toLowerCase().endsWith(".png"))
        .map((f: any) => `01-Pizza/${f.name}`);

      if (pngFiles.length === 0) {
        return res.status(200).json({ success: true, message: "No PNG files found to delete" });
      }

      const { data: deleted, error: deleteError } = await supabase
        .storage
        .from("delivery_food")
        .remove(pngFiles);

      if (deleteError) {
        return res.status(500).json({ error: "Delete error", details: deleteError });
      }
      return res.status(200).json({ success: true, message: "Deleted PNGs", deleted });
    } catch (err: any) {
      return res.status(500).json({ error: "Server error", message: err.message });
    }
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: "Missing orderId parameter" });
  }

  const { botToken, chatId } = await getTelegramCredentials();

  if (!botToken || !chatId) {
    console.warn("[Telegram Notification] Bot token or Chat ID is missing. Skipping notification.");
    return res.status(200).json({ message: "Telegram configuration missing, notification skipped." });
  }

  try {
    // Retrieve the pizza order details
    const { data: order, error: fetchError } = await supabase
      .from("pizza_orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      console.error("[Telegram Notification] Order not found in database:", fetchError);
      return res.status(404).json({ error: "Order not found" });
    }

    // Prevent duplicate notifications
    if (order.telegram_notified) {
      console.log(`[Telegram Notification] Order ${orderId} was already notified. Skipping.`);
      return res.status(200).json({ success: true, skipped: true, message: "Already notified" });
    }

    // Format the cart items for the Telegram message
    const items = Array.isArray(order.items) ? order.items : [];
    const itemsText = items
      .map((item: any) => {
        let itemStr = `• <b>${item.quantity}x ${item.name}</b>`;
        if (item.selectedVariant) {
          const variantName = typeof item.selectedVariant === "object" ? item.selectedVariant.name : item.selectedVariant;
          itemStr += ` (Taglia: ${variantName})`;
        }
        if (Array.isArray(item.selectedExtras) && item.selectedExtras.length > 0) {
          const extrasNames = item.selectedExtras.map((e: any) => e.name).join(", ");
          itemStr += `\n  <i>+ ${extrasNames}</i>`;
        }
        return itemStr;
      })
      .join("\n");

    // Clean address format
    let cleanAddress = order.address || "Nessun indirizzo specificato";
    if (cleanAddress.includes("[COORD:")) {
      cleanAddress = cleanAddress.split("[COORD:")[0].trim();
    }

    // Construct text message HTML
    const messageText = [
      `📦 <b>NUOVO ORDINE PIZZA</b>`,
      ``,
      `<b>Cliente:</b> ${order.customer_name}`,
      ...buildContactLines(order.phone, order.has_whatsapp, order.has_line),
      `<b>Indirizzo:</b> ${cleanAddress}`,
      ``,
      `<b>Articoli:</b>`,
      itemsText,
      ``,
      `<b>Totale:</b> ${order.total} THB`,
      `<b>Metodo di pagamento:</b> ${order.payment_method === "promptpay" ? "PromptPay (QR)" : "Contanti"}`,
      order.receipt_url ? `📎 <a href="${order.receipt_url}">Visualizza Ricevuta</a>` : ``,
      ``,
      order.latitude && order.longitude
        ? `📍 <a href="https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}">Apri Posizione su Google Maps</a>`
        : `📍 Nessuna coordinata GPS disponibile`
    ]
      .filter((line) => line !== null)
      .join("\n");

    // Create inline action buttons
    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: "🟢 Conferma Ordine", callback_data: `prepare_${order.id}` },
          { text: "✖ Rifiuta Ordine", callback_data: `reject_${order.id}` }
        ],
        [
          { text: "🛫 PARTENZA", callback_data: `start_track_${order.id}` },
          { text: "🛬 ARRIVO", callback_data: `stop_track_${order.id}` }
        ]
      ]
    };

    // Send HTTP POST request to Telegram API
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: "HTML",
        reply_markup: inlineKeyboard,
        disable_web_page_preview: false
      })
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      console.error("[Telegram API Error] Failed to send message to Telegram:", result);
      return res.status(500).json({ error: "Telegram API error", details: result });
    }

    // Flag the order as notified in Supabase
    await supabase
      .from("pizza_orders")
      .update({ 
        telegram_notified: true,
        telegram_message_id: result.result?.message_id
      })
      .eq("id", order.id);

    return res.status(200).json({ success: true, messageId: result.result?.message_id });
  } catch (err: any) {
    console.error("[Telegram Notification Server Error]:", err);
    return res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
}
