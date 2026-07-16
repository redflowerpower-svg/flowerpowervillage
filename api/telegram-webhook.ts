import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { getTelegramCredentials, buildContactLines } from "./_helpers/telegram.js";

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Telegram webhooks send POST updates
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const update = req.body;

  // Handle live location updates (both new shared location and edited location updates)
  const locMessage = update.message || update.edited_message;
  if (locMessage && locMessage.location) {
    const { latitude, longitude } = locMessage.location;
    console.log(`[Telegram Webhook] Received location update: lat=${latitude}, lng=${longitude}`);
    
    // Update all active tracking orders
    const { error: locError } = await supabase
      .from("pizza_orders")
      .update({
        driver_latitude: latitude,
        driver_longitude: longitude
      })
      .eq("tracking_active", true);

    if (locError) {
      console.error("[Telegram Webhook] Error updating driver location:", locError);
    }
    
    return res.status(200).json({ status: "location_updated", latitude, longitude });
  }
  
  // If this is a confirmation webhook query
  if (!update.callback_query) {
    // Return 200 OK for other Telegram message updates to avoid retries
    return res.status(200).json({ status: "skipped" });
  }

  const { botToken, chatId: configuredChatId } = await getTelegramCredentials();

  if (!botToken) {
    console.error("[Telegram Webhook] TELEGRAM_BOT_TOKEN is missing.");
    return res.status(500).json({ error: "Configuration missing" });
  }

  const callbackQuery = update.callback_query;
  const callbackQueryId = callbackQuery.id;
  const message = callbackQuery.message;
  const messageChatId = message.chat.id;
  const messageId = message.message_id;
  const callbackData = callbackQuery.data; // e.g., "deliver_<id>", "reject_<id>", "complete_<id>"

  // Basic security: only accept requests originating from the configured private Telegram chat
  if (configuredChatId && String(messageChatId) !== String(configuredChatId)) {
    console.warn(`[Telegram Webhook] Rejecting query from unauthorized chat ID: ${messageChatId}`);
    return res.status(200).json({ status: "unauthorized" });
  }

  // Parse action and orderId
  const match = callbackData.match(/^(prepare|deliver|reject|complete|start_track|stop_track)_(.+)$/);
  if (!match) {
    console.warn(`[Telegram Webhook] Invalid callback data: ${callbackData}`);
    return res.status(200).json({ status: "invalid_data" });
  }

  const [, action, orderId] = match;

  // Identify who pressed the button (Telegram user)
  const actor = callbackQuery.from?.username
    ? `@${callbackQuery.from.username}`
    : callbackQuery.from?.first_name || "Sconosciuto";

  try {
    // Map callback action to Supabase status field or check if it is tracking action
    let targetStatus: "preparing" | "delivering" | "rejected" | "completed" | null = null;
    let answerText = "";
    let isTrackingAction = false;

    if (action === "prepare") {
      targetStatus = "preparing";
      answerText = "Ordine confermato! 🟢";
    } else if (action === "deliver") {
      targetStatus = "delivering";
      answerText = "Consegna avviata! 🛵";
    } else if (action === "reject") {
      targetStatus = "rejected";
      answerText = "Ordine Rifiutato! ✖";
    } else if (action === "complete") {
      targetStatus = "completed";
      answerText = "Ordine completato! 🏁";
    } else if (action === "start_track") {
      isTrackingAction = true;
      answerText = "Tracciamento GPS avviato! 🛵";
    } else if (action === "stop_track") {
      isTrackingAction = true;
      answerText = "Tracciamento GPS interrotto! 🏁";
    }

    if (!targetStatus && !isTrackingAction) {
      return res.status(200).json({ status: "invalid_action" });
    }

    let updatedOrder: any = null;
    let updateError: any = null;

    // 1. Update the order in Supabase database
    if (isTrackingAction) {
      const updateData: any = {};
      if (action === "start_track") {
        updateData.tracking_active = true;
        // Reset driver coords in case they were previously set to sentinel
        updateData.driver_latitude = null;
        updateData.driver_longitude = null;
      } else {
        updateData.tracking_active = false;
        updateData.driver_latitude = -99;
        updateData.driver_longitude = -99;
      }

      const { data, error } = await supabase
        .from("pizza_orders")
        .update(updateData)
        .eq("id", orderId)
        .select()
        .single();
      
      updatedOrder = data;
      updateError = error;
    } else {
      const { data, error } = await supabase
        .from("pizza_orders")
        .update({ status: targetStatus })
        .eq("id", orderId)
        .select()
        .single();

      updatedOrder = data;
      updateError = error;
    }

    if (updateError || !updatedOrder) {
      console.error("[Telegram Webhook] Error updating database:", updateError);
      
      // Let Telegram user know it failed
      await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text: "Errore: impossibile aggiornare il database! ⚠️",
          show_alert: true
        })
      });

      return res.status(200).json({ status: "db_error" });
    }

    // 2. Answer callback query to stop the Telegram loading state indicator
    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: answerText,
        show_alert: false
      })
    });

    // 3. Rebuild the original message text based on the current DB state to keep formatting
    const items = Array.isArray(updatedOrder.items) ? updatedOrder.items : [];
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

    let cleanAddress = updatedOrder.address || "Nessun indirizzo specificato";
    if (cleanAddress.includes("[COORD:")) {
      cleanAddress = cleanAddress.split("[COORD:")[0].trim();
    }

    let messageText = [
      `📦 <b>NUOVO ORDINE PIZZA</b>`,
      ``,
      `<b>Cliente:</b> ${updatedOrder.customer_name}`,
      ...buildContactLines(updatedOrder.phone, updatedOrder.has_whatsapp, updatedOrder.has_line),
      `<b>Indirizzo:</b> ${cleanAddress}`,
      ``,
      `<b>Articoli:</b>`,
      itemsText,
      ``,
      `<b>Totale:</b> ${updatedOrder.total} THB`,
      `<b>Metodo di pagamento:</b> ${updatedOrder.payment_method === "promptpay" ? "PromptPay (QR)" : "Contanti"}`,
      updatedOrder.receipt_url ? `📎 <a href="${updatedOrder.receipt_url}">Visualizza Ricevuta</a>` : ``,
      ``,
      updatedOrder.latitude && updatedOrder.longitude
        ? `📍 <a href="https://www.google.com/maps/search/?api=1&query=${updatedOrder.latitude},${updatedOrder.longitude}">Apri Posizione su Google Maps</a>`
        : `📍 Nessuna coordinata GPS disponibile`
    ]
      .filter((line) => line !== null)
      .join("\n");

    // Reconstruct status lines text
    let statusText = "";
    if (updatedOrder.status === "preparing") {
      statusText = `\n\n👨‍🍳 <b>Stato: In Preparazione</b>`;
    } else if (updatedOrder.status === "delivering") {
      statusText = `\n\n🛵 <b>Stato: In Consegna</b>`;
    } else if (updatedOrder.status === "rejected") {
      statusText = `\n\n❌ <b>Stato: Rifiutato</b>`;
    } else if (updatedOrder.status === "completed") {
      statusText = `\n\n✅ <b>Stato: Consegnato</b>`;
    }

    let actorText = "";
    if (!isTrackingAction) {
      if (action === "prepare") actorText = `\n<i>Confermato da ${actor}</i>`;
      else if (action === "deliver") actorText = `\n<i>Consegna avviata da ${actor}</i>`;
      else if (action === "reject") actorText = `\n<i>Rifiutato da ${actor}</i>`;
      else if (action === "complete") actorText = `\n<i>Completato da ${actor}</i>`;
    }
    
    // We append the current status and actor text
    messageText += statusText + actorText;

    // Rebuild Inline Keyboard Buttons
    const statusRow: any[] = [];
    if (updatedOrder.status === "new") {
      statusRow.push({ text: "🟢 Conferma Ordine", callback_data: `prepare_${updatedOrder.id}` });
      statusRow.push({ text: "✖ Rifiuta Ordine", callback_data: `reject_${updatedOrder.id}` });
    } else if (updatedOrder.status === "preparing") {
      statusRow.push({ text: "🛵 Fai Partire la Delivery", callback_data: `deliver_${updatedOrder.id}` });
    } else if (updatedOrder.status === "delivering") {
      statusRow.push({ text: "🏁 Conferma Consegnato", callback_data: `complete_${updatedOrder.id}` });
    }

    const trackingRow: any[] = [];
    const isTrackingCompleted = updatedOrder.driver_latitude === -99;
    if (!isTrackingCompleted) {
      trackingRow.push({ text: "🛫 PARTENZA", callback_data: `start_track_${updatedOrder.id}` });
      trackingRow.push({ text: "🛬 ARRIVO", callback_data: `stop_track_${updatedOrder.id}` });
    }

    const inlineKeyboard: any = { inline_keyboard: [] };
    if (statusRow.length > 0) {
      inlineKeyboard.inline_keyboard.push(statusRow);
    }
    if (trackingRow.length > 0) {
      inlineKeyboard.inline_keyboard.push(trackingRow);
    }

    // 4. Update the Telegram message text and keyboard reply markup
    const editUrl = `https://api.telegram.org/bot${botToken}/editMessageText`;
    await fetch(editUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: messageChatId,
        message_id: messageId,
        text: messageText,
        parse_mode: "HTML",
        reply_markup: inlineKeyboard,
        disable_web_page_preview: false
      })
    });

    // If starting tracking, send the push notification reminder to the driver
    if (action === "start_track") {
      const pushUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      await fetch(pushUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: messageChatId,
          text: `🛵 <b>PARTENZA! (Ordine #${orderId})</b>\nFattorino, ricordati di attivare la <b>Live Location</b> nativa su Telegram! 📍`,
          parse_mode: "HTML"
        })
      }).catch(err => console.error("[Telegram Webhook] Failed to send push reminder to driver:", err));
    }

    return res.status(200).json({ status: "success", action, orderId });
  } catch (err: any) {
    console.error("[Telegram Webhook Server Error]:", err);
    return res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
}
