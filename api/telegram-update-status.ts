import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { getTelegramCredentials, buildContactLines } from "./_helpers/telegram.js";

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

    // Append status line
    const actor = "Flower Power Pizza";
    let statusText = "";
    let actorText = "";
    if (status === "preparing") {
      statusText = `\n\n👨‍🍳 <b>Stato: In Preparazione</b>`;
      actorText = `\n<i>Confermato da ${actor}</i>`;
    } else if (status === "delivering") {
      statusText = `\n\n🛵 <b>Stato: In Consegna</b>`;
      actorText = `\n<i>Consegna avviata da ${actor}</i>`;
    } else if (status === "rejected") {
      statusText = `\n\n❌ <b>Stato: Rifiutato</b>`;
      actorText = `\n<i>Rifiutato da ${actor}</i>`;
    } else if (status === "completed") {
      statusText = `\n\n✅ <b>Stato: Consegnato</b>`;
      actorText = `\n<i>Completato da ${actor}</i>`;
    }
    messageText += statusText + actorText;

    // Rebuild Inline Keyboard Buttons
    const statusRow: any[] = [];
    if (status === "new") {
      statusRow.push({ text: "🟢 Conferma Ordine", callback_data: `prepare_${order.id}` });
      statusRow.push({ text: "✖ Rifiuta Ordine", callback_data: `reject_${order.id}` });
    } else if (status === "preparing") {
      statusRow.push({ text: "🛵 Fai Partire la Delivery", callback_data: `deliver_${order.id}` });
    } else if (status === "delivering") {
      statusRow.push({ text: "🏁 Conferma Consegnato", callback_data: `complete_${order.id}` });
    }

    const trackingRow: any[] = [];
    const isOrderActive = status !== "completed" && status !== "rejected";
    const isTrackingCompleted = order.driver_latitude === -999;
    if (isOrderActive && !isTrackingCompleted) {
      trackingRow.push({ text: "🛫 PARTENZA", callback_data: `start_track_${order.id}` });
      trackingRow.push({ text: "🛬 ARRIVO", callback_data: `stop_track_${order.id}` });
    }

    const inlineKeyboard: any = { inline_keyboard: [] };
    if (statusRow.length > 0) {
      inlineKeyboard.inline_keyboard.push(statusRow);
    }
    if (trackingRow.length > 0) {
      inlineKeyboard.inline_keyboard.push(trackingRow);
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
