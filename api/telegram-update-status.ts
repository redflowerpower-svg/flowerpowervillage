import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { getTelegramCredentials } from "./_helpers/telegram.js";

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow only POST requests for security
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId, status } = req.body;

  if (!orderId || !status) {
    return res.status(400).json({ error: "orderId and status are required." });
  }

  try {
    // 1. Get Telegram Bot credentials from database
    const creds = await getTelegramCredentials();
    if (!creds) {
      console.warn("[Telegram Update] No Telegram credentials configured, skipping status update.");
      return res.status(200).json({ success: false, reason: "no_credentials" });
    }

    const { botToken, chatId } = creds;

    // 2. Fetch the current order details from Supabase
    const { data: order, error: fetchError } = await supabase
      .from("pizza_orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      console.error("[Telegram Update] Order not found in database:", fetchError);
      return res.status(404).json({ error: "Order not found" });
    }

    // If there is no message ID tracked for this order, we cannot edit it
    if (!order.telegram_message_id) {
      console.log(`[Telegram Update] No telegram_message_id tracked for order ${orderId}, skipping.`);
      return res.status(200).json({ success: false, reason: "no_tracked_message" });
    }

    // 3. Rebuild the message text based on the DB state
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

    let cleanAddress = order.address || "Nessun indirizzo specificato";
    if (cleanAddress.includes("[COORD:")) {
      cleanAddress = cleanAddress.split("[COORD:")[0].trim();
    }

    let messageText = [
      `📦 <b>NUOVO ORDINE PIZZA</b>`,
      ``,
      `<b>Cliente:</b> ${order.customer_name}`,
      `<b>Telefono:</b> ${order.phone} (WhatsApp: ${order.has_whatsapp ? "Sì" : "No"} | LINE: ${order.has_line ? "Sì" : "No"})`,
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

    // Append status line and build new reply keyboard
    let inlineKeyboard: any = { inline_keyboard: [] };

    if (status === "preparing") {
      messageText += `\n\n👨‍🍳 <b>Stato: In Preparazione</b>`;
      // Replace buttons with "Fai Partire la Delivery"
      inlineKeyboard = {
        inline_keyboard: [
          [
            { text: "🛵 Fai Partire la Delivery", callback_data: `deliver_${order.id}` }
          ]
        ]
      };
    } else if (status === "delivering") {
      messageText += `\n\n🛵 <b>Stato: In Consegna</b>`;
      // Replace buttons with "Conferma Consegnato"
      inlineKeyboard = {
        inline_keyboard: [
          [
            { text: "🏁 Conferma Consegnato", callback_data: `complete_${order.id}` }
          ]
        ]
      };
    } else if (status === "rejected") {
      messageText += `\n\n❌ <b>Stato: Rifiutato</b>`;
      inlineKeyboard = { inline_keyboard: [] };
    } else if (status === "completed") {
      messageText += `\n\n✅ <b>Stato: Consegnato</b>`;
      inlineKeyboard = { inline_keyboard: [] };
    }

    // 4. Update the Telegram message text and inline keyboard
    const editUrl = `https://api.telegram.org/bot${botToken}/editMessageText`;
    const response = await fetch(editUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: Number(order.telegram_message_id),
        text: messageText,
        parse_mode: "HTML",
        reply_markup: inlineKeyboard,
        disable_web_page_preview: false
      })
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      console.error("[Telegram Update API Error] Failed to edit message:", result);
      return res.status(500).json({ error: "Telegram API error", details: result });
    }

    return res.status(200).json({ success: true, messageId: Number(order.telegram_message_id) });
  } catch (err: any) {
    console.error("[Telegram Update Server Error]:", err);
    return res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
}
