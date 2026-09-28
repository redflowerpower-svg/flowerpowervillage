import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import {
  getTelegramCredentials,
  updateTelegramCredentials,
  buildContactLines,
  getSupabaseClient
} from "../_helpers/telegram.js";
import {
  sendPizzaOrderEmail,
  extractOrderMetadata
} from "../_helpers/pizza-order-email.js";
import {
  parseTableReservationFromOrder,
  AREA_LABELS,
  escapeHtml
} from "../_helpers/table-reservation-parser.js";

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
        if (item.nameTh) {
          itemStr += `\n  <i>${item.nameTh}</i>`;
        }
        if (item.selectedVariant) {
          const variantName = typeof item.selectedVariant === "object" ? item.selectedVariant.name : item.selectedVariant;
          itemStr += ` (Size / ขนาด: ${variantName})`;
        }
        if (Array.isArray(item.selectedExtras) && item.selectedExtras.length > 0) {
          const extrasNames = item.selectedExtras.map((e: any) => e.name || e).join(", ");
          itemStr += `\n  <i>+ Extra: ${extrasNames}</i>`;
        }
        return itemStr;
      })
      .join("\n");

    const meta = extractOrderMetadata(order.address);
    const cleanAddress = meta.cleanAddress;
    const customerEmail = meta.customerEmail;
    const discountAmount = meta.discountAmount;
    const promoCode = meta.promoCode;
    const isHotelGuest = meta.isHotelGuest;

    const discountLine = promoCode && discountAmount > 0
      ? `🎟️ <b>PROMO COUPON (${promoCode}):</b> -${discountAmount} THB / ใช้คูปองส่วนลด`
      : discountAmount > 0
        ? `🎁 <b>1st ORDER DISCOUNT (10%):</b> -${discountAmount} THB / ส่วนลดสั่งครั้งแรก 10%`
        : null;

    const messageText = [
      `📦 <b>NEW PIZZA ORDER / ออเดอร์พิซซ่าใหม่</b>`,
      discountLine,
      isHotelGuest ? `🏨 <b>LOCATION NOTE:</b> Guest at known hotel/resort / ลูกค้าพักที่โรงแรม/สถานที่ที่เคยส่ง` : null,
      ``,
      `<b>Customer / ลูกค้า:</b> ${order.customer_name}`,
      ...buildContactLines(order.phone, order.has_whatsapp, order.has_line),
      customerEmail ? `📧 <b>Email / อีเมล:</b> ${customerEmail}` : null,
      `<b>Address / ที่อยู่:</b> ${cleanAddress}`,
      deliveryNotes ? `📝 <b>Note / หมายเหตุ:</b> <i>${deliveryNotes}</i>` : null,
      ``,
      `<b>Items / รายการอาหาร:</b>`,
      itemsText,
      ``,
      `<b>Total / ยอดรวม:</b> ${order.total} THB` + (discountAmount > 0 ? ` <i>(Discount applied: -${discountAmount} THB)</i>` : ``),
      `<b>Payment / วิธีชำระเงิน:</b> ${order.payment_method === "promptpay" ? "PromptPay (QR) / สแกนจ่าย" : "Cash on Delivery / เก็บเงินสด"}`,
      order.receipt_url ? `📎 <a href="${order.receipt_url}">View Receipt / ดูสลิปโอนเงิน</a>` : ``,
      ``,
      order.latitude && order.longitude
        ? `📍 <a href="https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}">Open Google Maps / เปิด Google Maps</a>`
        : `📍 No GPS coordinates / ไม่มีพิกัด GPS`
    ]
      .filter((line) => line !== null)
      .join("\n");

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: "🟢 Confirm / ยืนยัน", callback_data: `prepare_${order.id}` },
          { text: "✖ Reject / ยกเลิก", callback_data: `reject_${order.id}` }
        ],
        [
          { text: "🛵 Rider Departed / ไรเดอร์ออกแล้ว", callback_data: `start_track_${order.id}` },
          { text: "🏁 Delivered / ถึงแล้ว", callback_data: `stop_track_${order.id}` }
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

    // Asynchronously send order received & payment receipt email to customer in their language
    sendPizzaOrderEmail(order, "received").catch(err => {
      console.error("[Telegram Notify] Failed sending order confirmation email to customer:", err);
    });

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
    // 1. Crucial: ALWAYS update the database status using service_role credentials
    const { data: order, error: updateError } = await supabase
      .from("pizza_orders")
      .update({ status })
      .eq("id", orderId)
      .select("*")
      .single();

    if (updateError || !order) {
      console.error("[Order Update] Failed to update order in database:", updateError);
      return res.status(500).json({ error: "Database update error", details: updateError });
    }

    console.log(`[Order Update] Order #${orderId} status successfully updated to "${status}" in database.`);

    // Send customer status update email asynchronously
    if (["preparing", "delivering", "completed"].includes(status)) {
      sendPizzaOrderEmail(order, status as any).catch(err => {
        console.error(`[Order Update] Failed sending ${status} email to customer:`, err);
      });
    }

    // 2. Sync to Telegram staff channel if configured
    const creds = await getTelegramCredentials();
    if (!creds) {
      console.warn("[Telegram Update] No Telegram credentials configured, DB updated successfully.");
      return res.status(200).json({ success: true, order, telegram: "no_credentials" });
    }

    const { botToken, chatId } = creds;

    if (!order.telegram_message_id) {
      console.log(`[Telegram Update] No telegram_message_id tracked for order ${orderId}, DB updated successfully.`);
      return res.status(200).json({ success: true, order, telegram: "no_tracked_message" });
    }

    const items = Array.isArray(order.items) ? order.items : [];
    const itemsText = items
      .map((item: any) => {
        let itemStr = `• <b>${item.quantity}x ${item.name}</b>`;
        if (item.nameTh) {
          itemStr += `\n  <i>${item.nameTh}</i>`;
        }
        if (item.selectedVariant) {
          const variantName = typeof item.selectedVariant === "object" ? item.selectedVariant.name : item.selectedVariant;
          itemStr += ` (Size / ขนาด: ${variantName})`;
        }
        if (Array.isArray(item.selectedExtras) && item.selectedExtras.length > 0) {
          const extrasNames = item.selectedExtras.map((e: any) => e.name || e).join(", ");
          itemStr += `\n  <i>+ Extra: ${extrasNames}</i>`;
        }
        return itemStr;
      })
      .join("\n");

    const meta = extractOrderMetadata(order.address);
    const cleanAddress = meta.cleanAddress;
    const customerEmail = meta.customerEmail;
    const deliveryNotes = meta.deliveryNotes;

    let messageText = [
      `📦 <b>NEW PIZZA ORDER / ออเดอร์พิซซ่าใหม่</b>`,
      ``,
      `<b>Customer / ลูกค้า:</b> ${order.customer_name}`,
      ...buildContactLines(order.phone, order.has_whatsapp, order.has_line),
      customerEmail ? `📧 <b>Email / อีเมล:</b> ${customerEmail}` : null,
      `<b>Address / ที่อยู่:</b> ${cleanAddress}`,
      deliveryNotes ? `📝 <b>Note / หมายเหตุ:</b> <i>${deliveryNotes}</i>` : null,
      ``,
      `<b>Items / รายการอาหาร:</b>`,
      itemsText,
      ``,
      `<b>Total / ยอดรวม:</b> ${order.total} THB`,
      `<b>Payment / วิธีชำระเงิน:</b> ${order.payment_method === "promptpay" ? "PromptPay (QR) / สแกนจ่าย" : "Cash on Delivery / เก็บเงินสด"}`,
      order.receipt_url ? `📎 <a href="${order.receipt_url}">View Receipt / ดูสลิปโอนเงิน</a>` : ``,
      ``,
      order.latitude && order.longitude
        ? `📍 <a href="https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}">Open Google Maps / เปิด Google Maps</a>`
        : `📍 No GPS coordinates / ไม่มีพิกัด GPS`
    ]
      .filter((line) => line !== null)
      .join("\n");

    const actor = "Flower Power Pizza Ranong";
    let statusText = "";
    let actorText = "";
    if (status === "preparing") {
      statusText = `\n\n👨‍🍳 <b>Status: In Preparation / กำลังอบ & เตรียมอาหาร</b>`;
      actorText = `\n<i>Confirmed by / ยืนยันโดย ${actor}</i>`;
    } else if (status === "delivering") {
      statusText = `\n\n🛵 <b>Status: Out for Delivery / กำลังจัดส่ง (ไรเดอร์ออกเดินทาง)</b>`;
      actorText = `\n<i>Dispatched by / จัดส่งโดย ${actor}</i>`;
    } else if (status === "completed") {
      statusText = `\n\n✅ <b>Status: Delivered & Completed / จัดส่งเรียบร้อยแล้ว</b>`;
      actorText = `\n<i>Completed by / สำเร็จโดย ${actor}</i>`;
    } else if (status === "rejected") {
      statusText = `\n\n❌ <b>Status: Cancelled / ยกเลิกออเดอร์</b>`;
      actorText = `\n<i>Cancelled by / ยกเลิกโดย ${actor}</i>`;
    }

    messageText += statusText + actorText;

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: "🟢 Confirm / ยืนยัน", callback_data: `prepare_${order.id}` },
          { text: "✖ Reject / ยกเลิก", callback_data: `reject_${order.id}` }
        ],
        [
          { text: "🛵 Rider Departed / ไรเดอร์ออกแล้ว", callback_data: `start_track_${order.id}` },
          { text: "🏁 Delivered / ถึงแล้ว", callback_data: `stop_track_${order.id}` }
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

  const match = callbackData.match(/^(prepare|deliver|reject|complete|start_track|stop_track|approve_table|reject_table)_(.+)$/);
  if (!match) {
    console.warn(`[Telegram Webhook] Invalid callback data: ${callbackData}`);
    return res.status(200).json({ status: "invalid_data" });
  }

  const [, action, orderId] = match;

  const actor = callbackQuery.from?.username
    ? `@${callbackQuery.from.username}`
    : callbackQuery.from?.first_name || "Sconosciuto";

  try {
    // ── Table Reservation Actions ──
    if (action === "approve_table" || action === "reject_table") {
      const isApproved = action === "approve_table";
      const answerText = isApproved 
        ? "Prenotazione tavolo confermata! 🟢 / ยืนยันการจองโต๊ะแล้ว" 
        : "Prenotazione tavolo annullata ✖ / ยกเลิกการจองโต๊ะแล้ว";

      const { data: existingRes } = await supabase
        .from("pizza_orders")
        .select("*")
        .eq("id", orderId)
        .single();

      let updatedAddr = existingRes?.address || '';
      if (!isApproved && !updatedAddr.includes('[CANCELLED]')) {
        updatedAddr += ' [CANCELLED:true]';
      } else if (isApproved && updatedAddr.includes('[CANCELLED')) {
        updatedAddr = updatedAddr.replace(/\s*\[CANCELLED:[^\]]+\]/gi, '').replace(/\s*\[CANCELLED\]/gi, '');
      }

      await supabase
        .from("pizza_orders")
        .update({ 
          status: 'completed',
          address: updatedAddr
        })
        .eq("id", orderId);

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

      const { data: resOrder } = await supabase
        .from("pizza_orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (resOrder && resOrder.telegram_message_id) {
        const resData = parseTableReservationFromOrder(resOrder);
        const seatingLabel = AREA_LABELS[resData.seating_area] || resData.seating_area;
        
        let text = `🍽️ <b>PRENOTAZIONE TAVOLO / CAPANNA</b>\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        text += `📌 <b>ID Prenotazione</b>: <code>#${resData.id}</code>\n`;
        text += `👤 <b>Cliente</b>: <b>${escapeHtml(resData.customer_name)}</b>\n`;
        text += `📞 <b>Contatto (LINE / Tel)</b>: <code>${escapeHtml(resData.contact)}</code>\n`;
        if (resData.email) {
          text += `✉️ <b>Email</b>: <code>${escapeHtml(resData.email)}</code>\n`;
        }
        text += `👥 <b>Ospiti</b>: <b>${resData.guests} persone</b>\n`;
        text += `📅 <b>Data</b>: <b>${resData.reservation_date}</b>\n`;
        text += `🕒 <b>Orario</b>: <b>${resData.reservation_time}</b>\n`;
        text += `🛖 <b>Ambiente</b>: <b>${seatingLabel}</b>\n`;
        if (resData.occasion) {
          text += `🎉 <b>Occasione</b>: ${escapeHtml(resData.occasion)}\n`;
        }
        if (resData.notes) {
          text += `📝 <b>Note Speciali</b>: <i>${escapeHtml(resData.notes)}</i>\n`;
        }
        text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        if (isApproved) {
          text += `✅ <b>STATO: PRENOTAZIONE CONFERMATA / ยืนยันแล้ว</b>\n`;
          text += `👤 <i>Approvato dallo staff via Telegram (${actor})</i>`;
        } else {
          text += `❌ <b>STATO: PRENOTAZIONE ANNULLATA / ยกเลิกแล้ว</b>\n`;
          text += `👤 <i>Rifiutato da ${actor}</i>`;
        }

        const inlineKeyboard = isApproved ? {
          inline_keyboard: [
            [
              { text: "✖ Annulla / ยกเลิก", callback_data: `reject_table_${orderId}` }
            ]
          ]
        } : {
          inline_keyboard: [
            [
              { text: "🟢 Ri-approva / ยืนยันอีกครั้ง", callback_data: `approve_table_${orderId}` }
            ]
          ]
        };

        const editUrl = `https://api.telegram.org/bot${botToken}/editMessageText`;
        await fetch(editUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: messageChatId,
            message_id: resOrder.telegram_message_id,
            text,
            parse_mode: "HTML",
            reply_markup: inlineKeyboard
          })
        });
      }

      return res.status(200).json({ status: "table_reservation_updated", reservationStatus: isApproved ? 'confirmed' : 'cancelled' });
    }

    // ── Delivery Pizza Order Actions ──
    let targetStatus: "preparing" | "delivering" | "rejected" | "completed" | null = null;
    let answerText = "";
    let isTrackingAction = false;

    if (action === "prepare") {
      targetStatus = "preparing";
      answerText = "Order confirmed! 🟢 / ยืนยันออเดอร์แล้ว";
    } else if (action === "deliver") {
      targetStatus = "delivering";
      answerText = "Delivery started! 🛵 / กำลังไปส่ง";
    } else if (action === "reject") {
      targetStatus = "rejected";
      answerText = "Order cancelled! ✖ / ยกเลิกออเดอร์แล้ว";
    } else if (action === "complete") {
      targetStatus = "completed";
      answerText = "Order completed! 🏁 / จัดส่งสำเร็จ";
    } else if (action === "start_track") {
      isTrackingAction = true;
      answerText = "Live GPS tracking started! 🛵 / เริ่มแชร์ตำแหน่ง GPS";
    } else if (action === "stop_track") {
      isTrackingAction = true;
      answerText = "Live GPS tracking stopped! 🛬 / หยุดแชร์ตำแหน่ง GPS";
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
      // Trigger customer email notification asynchronously for relevant status transitions
      if (targetStatus && ["preparing", "delivering", "completed"].includes(targetStatus)) {
        sendPizzaOrderEmail(order, targetStatus).catch(err => {
          console.error(`[Telegram Webhook] Failed sending ${targetStatus} email:`, err);
        });
      } else if (action === "start_track") {
        sendPizzaOrderEmail(order, "delivering").catch(err => {
          console.error("[Telegram Webhook] Failed sending delivering email on start_track:", err);
        });
      }

      const items = Array.isArray(order.items) ? order.items : [];
      const itemsText = items
        .map((item: any) => {
          let itemStr = `• <b>${item.quantity}x ${item.name}</b>`;
          if (item.nameTh) {
            itemStr += `\n  <i>${item.nameTh}</i>`;
          }
          if (item.selectedVariant) {
            const variantName = typeof item.selectedVariant === "object" ? item.selectedVariant.name : item.selectedVariant;
            itemStr += ` (Size / ขนาด: ${variantName})`;
          }
          if (Array.isArray(item.selectedExtras) && item.selectedExtras.length > 0) {
            const extrasNames = item.selectedExtras.map((e: any) => e.name || e).join(", ");
            itemStr += `\n  <i>+ Extra: ${extrasNames}</i>`;
          }
          return itemStr;
        })
        .join("\n");

      const meta = extractOrderMetadata(order.address);
      const cleanAddress = meta.cleanAddress;
      const customerEmail = meta.customerEmail;
      const deliveryNotes = meta.deliveryNotes;

      let messageText = [
        `📦 <b>NEW PIZZA ORDER / ออเดอร์พิซซ่าใหม่</b>`,
        ``,
        `<b>Customer / ลูกค้า:</b> ${order.customer_name}`,
        ...buildContactLines(order.phone, order.has_whatsapp, order.has_line),
        customerEmail ? `📧 <b>Email / อีเมล:</b> ${customerEmail}` : null,
        `<b>Address / ที่อยู่:</b> ${cleanAddress}`,
        deliveryNotes ? `📝 <b>Note / หมายเหตุ:</b> <i>${deliveryNotes}</i>` : null,
        ``,
        `<b>Items / รายการอาหาร:</b>`,
        itemsText,
        ``,
        `<b>Total / ยอดรวม:</b> ${order.total} THB`,
        `<b>Payment / วิธีชำระเงิน:</b> ${order.payment_method === "promptpay" ? "PromptPay (QR) / สแกนจ่าย" : "Cash on Delivery / เก็บเงินสด"}`,
        order.receipt_url ? `📎 <a href="${order.receipt_url}">View Receipt / ดูสลิปโอนเงิน</a>` : ``,
        ``,
        order.latitude && order.longitude
          ? `📍 <a href="https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}">Open Google Maps / เปิด Google Maps</a>`
          : `📍 No GPS coordinates / ไม่มีพิกัด GPS`
      ]
        .filter((line) => line !== null)
        .join("\n");

      let statusText = "";
      let actorText = `\n<i>Updated by / อัปเดตโดย ${actor}</i>`;

      if (order.status === "preparing") {
        statusText = `\n\n👨‍🍳 <b>Status: In Preparation / กำลังอบ & เตรียมอาหาร</b>`;
      } else if (order.status === "delivering") {
        statusText = `\n\n🛵 <b>Status: Out for Delivery / กำลังจัดส่ง (ไรเดอร์ออกเดินทาง)</b>`;
      } else if (order.status === "completed") {
        statusText = `\n\n✅ <b>Status: Delivered & Completed / จัดส่งเรียบร้อยแล้ว</b>`;
      } else if (order.status === "rejected") {
        statusText = `\n\n❌ <b>Status: Cancelled / ยกเลิกออเดอร์</b>`;
      }

      let trackingText = "";
      if (order.tracking_active) {
        trackingText = `\n📡 <b>GPS Tracking / ติดตามตำแหน่ง: ACTIVE 🛫 / กำลังเปิดแชร์</b>`;
      }

      messageText += statusText + trackingText + actorText;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            { text: "🟢 Confirm / ยืนยัน", callback_data: `prepare_${order.id}` },
            { text: "✖ Reject / ยกเลิก", callback_data: `reject_${order.id}` }
          ],
          [
            { text: order.tracking_active ? "🛵 GPS Active / กำลังแชร์" : "🛵 Rider Departed / ไรเดอร์ออกแล้ว", callback_data: `start_track_${order.id}` },
            { text: "🏁 Delivered / ถึงแล้ว", callback_data: `stop_track_${order.id}` }
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
