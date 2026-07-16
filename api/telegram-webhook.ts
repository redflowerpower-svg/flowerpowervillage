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
  const match = callbackData.match(/^(prepare|deliver|reject|complete)_(.+)$/);
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
    // Map callback action to Supabase status field
    let targetStatus: "preparing" | "delivering" | "rejected" | "completed" | null = null;
    let answerText = "";

    if (action === "prepare") {
      targetStatus = "preparing";
      answerText = "Ordine confermato! 🟢";
    } else if (action === "deliver") {
      targetStatus = "delivering";
      answerText = "Consegna avviata! 🛵";
    } else if (action === "reject") {
      targetStatus = "rejected";
      answerText = "Ordine rifiutato! ✖";
    } else if (action === "complete") {
      targetStatus = "completed";
      answerText = "Ordine completato! 🏁";
    }

    if (!targetStatus) {
      return res.status(200).json({ status: "invalid_action" });
    }

    // 1. Update the order status in Supabase database
    const { data: updatedOrder, error: updateError } = await supabase
      .from("pizza_orders")
      .update({ status: targetStatus })
      .eq("id", orderId)
      .select()
      .single();

    if (updateError || !updatedOrder) {
      console.error("[Telegram Webhook] Error updating status in database:", updateError);
      
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

    // Append status line and build new reply keyboard
    let inlineKeyboard: any = { inline_keyboard: [] };

    if (targetStatus === "preparing") {
      messageText += `\n\n👨‍🍳 <b>Stato: In Preparazione</b>\n<i>Confermato da ${actor}</i>`;
      inlineKeyboard = {
        inline_keyboard: [
          [
            { text: "🛵 Fai Partire la Delivery", callback_data: `deliver_${updatedOrder.id}` }
          ]
        ]
      };
    } else if (targetStatus === "delivering") {
      messageText += `\n\n🛵 <b>Stato: In Consegna</b>\n<i>Consegna avviata da ${actor}</i>`;
      inlineKeyboard = {
        inline_keyboard: [
          [
            { text: "🏁 Conferma Consegnato", callback_data: `complete_${updatedOrder.id}` }
          ]
        ]
      };
    } else if (targetStatus === "rejected") {
      messageText += `\n\n❌ <b>Stato: Rifiutato</b>\n<i>Rifiutato da ${actor}</i>`;
      inlineKeyboard = { inline_keyboard: [] };
    } else if (targetStatus === "completed") {
      messageText += `\n\n✅ <b>Stato: Consegnato</b>\n<i>Completato da ${actor}</i>`;
      inlineKeyboard = { inline_keyboard: [] };
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

    return res.status(200).json({ status: "success", action, orderId });
  } catch (err: any) {
    console.error("[Telegram Webhook Server Error]:", err);
    return res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
}
