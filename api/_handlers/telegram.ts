import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import {
  getTelegramCredentials,
  updateTelegramCredentials,
  buildContactLines,
  getSupabaseClient
} from "../_helpers/telegram.js";

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null as any;

// 1. handleTelegramNotify
export async function handleTelegramNotify(req: VercelRequest, res: VercelResponse) {
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
    const { data: order, error: fetchError } = await supabase
      .from("pizza_orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      console.error("[Telegram Notification] Order not found in database:", fetchError);
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.telegram_notified) {
      console.log(`[Telegram Notification] Order ${orderId} was already notified. Skipping.`);
      return res.status(200).json({ success: true, skipped: true, message: "Already notified" });
    }

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

// 2. handleTelegramUpdateStatus
export async function handleTelegramUpdateStatus(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId, status } = req.body;

  if (!orderId || !status) {
    return res.status(400).json({ error: "orderId and status are required." });
  }

  try {
    const creds = await getTelegramCredentials();
    if (!creds) {
      console.warn("[Telegram Update] No Telegram credentials configured, skipping status update.");
      return res.status(200).json({ success: false, reason: "no_credentials" });
    }

    const { botToken, chatId } = creds;

    const { data: order, error: fetchError } = await supabase
      .from("pizza_orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      console.error("[Telegram Update] Order not found in database:", fetchError);
      return res.status(404).json({ error: "Order not found" });
    }

    if (!order.telegram_message_id) {
      console.log(`[Telegram Update] No telegram_message_id tracked for order ${orderId}, skipping.`);
      return res.status(200).json({ success: false, reason: "no_tracked_message" });
    }

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

    const actor = "Flower Power Pizza";
    let statusText = "";
    let actorText = "";
    if (status === "preparing") {
      statusText = `\n\n👨‍🍳 <b>Stato: In Preparazione</b>`;
      actorText = `\n<i>Confermato da ${actor}</i>`;
    } else if (status === "delivering") {
      statusText = `\n\n🛵 <b>Stato: In Consegna</b>`;
      actorText = `\n<i>Aggiornato da ${actor}</i>`;
    } else if (status === "completed") {
      statusText = `\n\n✅ <b>Stato: Consegnato & Completato</b>`;
      actorText = `\n<i>Completato da ${actor}</i>`;
    } else if (status === "rejected") {
      statusText = `\n\n❌ <b>Stato: Rifiutato / Annullato</b>`;
      actorText = `\n<i>Annullato da ${actor}</i>`;
    }

    messageText += statusText + actorText;

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

    const editUrl = `https://api.telegram.org/bot${botToken}/editMessageText`;
    const editResponse = await fetch(editUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: order.telegram_message_id,
        text: messageText,
        parse_mode: "HTML",
        reply_markup: inlineKeyboard,
        disable_web_page_preview: false
      })
    });

    const editResult = await editResponse.json();
    return res.status(200).json({ success: editResult.ok, result: editResult });
  } catch (err: any) {
    console.error("[Telegram Update Server Error]:", err);
    return res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
}

// 3. handleTelegramWebhook
export async function handleTelegramWebhook(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const update = req.body;

  const locMessage = update.message || update.edited_message;
  if (locMessage && locMessage.location) {
    const { latitude, longitude } = locMessage.location;
    console.log(`[Telegram Webhook] Received location update: lat=${latitude}, lng=${longitude}`);
    
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
  
  if (!update.callback_query) {
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
  const callbackData = callbackQuery.data;

  if (configuredChatId && String(messageChatId) !== String(configuredChatId)) {
    console.warn(`[Telegram Webhook] Rejecting query from unauthorized chat ID: ${messageChatId}`);
    return res.status(200).json({ status: "unauthorized" });
  }

  const match = callbackData.match(/^(prepare|deliver|reject|complete|start_track|stop_track)_(.+)$/);
  if (!match) {
    console.warn(`[Telegram Webhook] Invalid callback data: ${callbackData}`);
    return res.status(200).json({ status: "invalid_data" });
  }

  const [, action, orderId] = match;

  const actor = callbackQuery.from?.username
    ? `@${callbackQuery.from.username}`
    : callbackQuery.from?.first_name || "Sconosciuto";

  try {
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
      answerText = "Tracciamento Live PARTITO! 🛫 (Condividi la tua posizione Telegram in chat)";
    } else if (action === "stop_track") {
      isTrackingAction = true;
      answerText = "Tracciamento Live FERMATO! 🛬";
    }

    if (isTrackingAction) {
      const isStart = action === "start_track";
      await supabase
        .from("pizza_orders")
        .update({ tracking_active: isStart })
        .eq("id", orderId);
    } else if (targetStatus) {
      await supabase
        .from("pizza_orders")
        .update({ status: targetStatus })
        .eq("id", orderId);
    }

    const answerUrl = `https://api.telegram.org/bot${botToken}/answerCallbackQuery`;
    await fetch(answerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: answerText,
        show_alert: false
      })
    });

    const { data: order } = await supabase
      .from("pizza_orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (order) {
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

      let statusText = "";
      let actorText = `\n<i>Premuto da ${actor}</i>`;

      if (order.status === "preparing") {
        statusText = `\n\n👨‍🍳 <b>Stato: In Preparazione</b>`;
      } else if (order.status === "delivering") {
        statusText = `\n\n🛵 <b>Stato: In Consegna</b>`;
      } else if (order.status === "completed") {
        statusText = `\n\n✅ <b>Stato: Consegnato & Completato</b>`;
      } else if (order.status === "rejected") {
        statusText = `\n\n❌ <b>Stato: Rifiutato / Annullato</b>`;
      }

      let trackingText = "";
      if (order.tracking_active) {
        trackingText = `\n📡 <b>Tracciamento GPS: ATTIVO 🛫</b>`;
      }

      messageText += statusText + trackingText + actorText;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            { text: "🟢 Conferma Ordine", callback_data: `prepare_${order.id}` },
            { text: "✖ Rifiuta Ordine", callback_data: `reject_${order.id}` }
          ],
          [
            { text: order.tracking_active ? "🛫 TRACKING ATTIVO" : "🛫 PARTENZA", callback_data: `start_track_${order.id}` },
            { text: "🛬 ARRIVO", callback_data: `stop_track_${order.id}` }
          ]
        ]
      };

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
    }

    return res.status(200).json({ status: "processed", action, orderId });
  } catch (err: any) {
    console.error("[Telegram Webhook Server Error]:", err);
    return res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
}

// 4. handleSyncTelegramWebhook
export async function handleSyncTelegramWebhook(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized: Missing Authorization header" });
  }

  try {
    const client = getSupabaseClient(authHeader);
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized: Invalid session" });
    }
  } catch (err) {
    console.error("[Sync Webhook Auth Error]:", err);
    return res.status(401).json({ error: "Unauthorized: Authentication check failed" });
  }

  // Handle GET: retrieve current config & bot status for a department
  if (req.method === "GET") {
    const department = (req.query?.department as string) === 'village' ? 'village' : 'pizza';
    const creds = await getTelegramCredentials(department, req.headers.authorization);
    let botInfo: any = null;
    if (creds.botToken) {
      try {
        const meRes = await fetch(`https://api.telegram.org/bot${creds.botToken}/getMe`);
        const meJson = await meRes.json();
        if (meJson.ok) {
          botInfo = meJson.result;
        }
      } catch (e) {
        console.warn("[Sync Webhook GET getMe warning]:", e);
      }
    }
    return res.status(200).json({
      department,
      configured: Boolean(creds.botToken && creds.chatId),
      botToken: creds.botToken || '',
      chatId: creds.chatId || '',
      botInfo
    });
  }

  const { botToken, chatId, webhookUrl, department = 'pizza', testMessage = false } = req.body || {};

  if (!botToken) {
    return res.status(400).json({ error: "TELEGRAM_BOT_TOKEN is missing." });
  }

  // Verify Bot Token with Telegram
  let botInfo: any = null;
  try {
    const meRes = await fetch(`https://api.telegram.org/bot${botToken.trim()}/getMe`);
    const meJson = await meRes.json();
    if (!meJson.ok) {
      return res.status(400).json({ 
        error: `Token Bot non valido su Telegram: ${meJson.description || 'Errore autenticazione'}` 
      });
    }
    botInfo = meJson.result;
  } catch (err: any) {
    return res.status(500).json({ error: `Impossibile contattare le API di Telegram: ${err.message}` });
  }

  const targetDept = department === 'village' ? 'village' : 'pizza';
  const saveSuccess = await updateTelegramCredentials(
    botToken.trim(), 
    chatId?.trim() || "", 
    targetDept, 
    req.headers.authorization
  );
  if (!saveSuccess) {
    console.warn(`[Sync Webhook] Could not save bot credentials to Supabase for ${targetDept}.`);
  }

  let testMessageSent = false;
  let testMessageError: string | null = null;

  // Send a test message if requested and chatId is provided
  if (testMessage && chatId?.trim()) {
    try {
      const testMsgText = targetDept === 'village'
        ? `🌿 <b>[Flower Power Village · Koh Phayam]</b>\n` +
          `✅ <b>Bot Telegram collegato con successo!</b>\n\n` +
          `Questo gruppo riceverà tutte le notifiche del <b>Villaggio</b>:\n` +
          `• Nuove prenotazioni alloggi\n` +
          `• Protezione Auto-Shielding Overbooking\n` +
          `• Sincronizzazione tariffe Octorate PMS\n\n` +
          `🛡️ <i>Reparto Stagno 100% indipendente dalla Pizzeria di Ranong.</i>`
        : `🍕 <b>[Flower Power Pizza · Ranong]</b>\n` +
          `✅ <b>Bot Telegram collegato con successo!</b>\n` +
          `Canale dedicato alle ordinazioni della Pizzeria e gestione consegne.`;

      const testRes = await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text: testMsgText,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      });
      const testJson = await testRes.json();
      testMessageSent = testJson.ok === true;
      if (!testMessageSent) {
        testMessageError = testJson.description || 'Impossibile inviare il messaggio al gruppo.';
      }
    } catch (tErr: any) {
      testMessageError = tErr.message;
    }
  }

  // Set webhook if pizza or explicitly requested
  let targetWebhookUrl: string | null = null;
  if (targetDept === 'pizza' || webhookUrl) {
    try {
      targetWebhookUrl = webhookUrl;
      if (!targetWebhookUrl) {
        const host = req.headers.host || "";
        const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.startsWith("192.168.");
        const protocol = isLocal ? "http" : "https";
        targetWebhookUrl = `${protocol}://${host}/api/telegram-webhook`;
      }

      console.log(`[Sync Webhook] Registering webhook URL: ${targetWebhookUrl}`);
      const telegramUrl = `https://api.telegram.org/bot${botToken.trim()}/setWebhook?url=${encodeURIComponent(targetWebhookUrl)}`;
      const response = await fetch(telegramUrl);
      const result = await response.json();

      if (!response.ok || !result.ok) {
        console.error("[Sync Webhook] Telegram API error response:", result);
        return res.status(500).json({
          success: false,
          error: "Telegram API rejected the webhook configuration",
          webhookUrl: targetWebhookUrl,
          details: result
        });
      }
    } catch (whErr: any) {
      console.warn("[Sync Webhook] Webhook registration warning:", whErr);
    }
  }

  return res.status(200).json({
    success: true,
    department: targetDept,
    botInfo,
    testMessageSent,
    testMessageError,
    webhookUrl: targetWebhookUrl
  });
}
