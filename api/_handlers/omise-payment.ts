import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { 
  getOmiseCredentials, 
  createOmiseSource, 
  createOmiseCharge, 
  retrieveOmiseCharge 
} from "../_helpers/omise.js";
import { getTelegramCredentials, buildContactLines } from "../_helpers/telegram.js";
import { sendPizzaOrderEmail, extractOrderMetadata } from "../_helpers/pizza-order-email.js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null as any;

/**
 * Trigger Kitchen Telegram Notification for a confirmed paid pizza order
 */
async function notifyKitchenTelegram(orderId: string | number) {
  if (!supabase) return;
  try {
    const { botToken, chatId } = await getTelegramCredentials();
    if (!botToken || !chatId) return;

    const { data: order, error } = await supabase
      .from("pizza_orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !order) return;
    if (order.telegram_notified) return;

    const items = Array.isArray(order.items) ? order.items : [];
    const itemsText = items
      .map((item: any) => {
        let itemStr = `• <b>${item.quantity}x ${item.name}</b>`;
        if (item.nameTh) itemStr += `\n  <i>${item.nameTh}</i>`;
        if (item.selectedVariant) {
          const vName = typeof item.selectedVariant === "object" ? item.selectedVariant.name : item.selectedVariant;
          itemStr += ` (Size: ${vName})`;
        }
        if (Array.isArray(item.selectedExtras) && item.selectedExtras.length > 0) {
          const exNames = item.selectedExtras.map((e: any) => e.name || e).join(", ");
          itemStr += `\n  <i>+ Extra: ${exNames}</i>`;
        }
        return itemStr;
      })
      .join("\n");

    const meta = extractOrderMetadata(order.address);
    const cleanAddress = meta.cleanAddress;
    const customerEmail = meta.customerEmail;
    const deliveryNotes = meta.deliveryNotes;

    const payLabel = order.payment_method?.includes("card") 
      ? "💳 OMISE (Credit Card 3DS) - PAID ONLINE" 
      : "📱 OMISE (PromptPay QR) - PAID ONLINE";

    const messageText = [
      `🍕 <b>NEW PIZZA ORDER [PAID ONLINE] / ออเดอร์จ่ายแล้ว</b>`,
      `💰 <b>STATUS: PAID VIA OMISE (ชำระเงินเรียบร้อย)</b>`,
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
      `<b>Payment / วิธีชำระเงิน:</b> ✅ ${payLabel}`,
      order.omise_charge_id ? `🔖 Charge ID: <code>${order.omise_charge_id}</code>` : ``,
      ``,
      order.latitude && order.longitude
        ? `📍 <a href="https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}">Open Google Maps</a>`
        : `📍 No GPS coordinates`
    ].filter(Boolean).join("\n");

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: "🟢 Confirm / ยืนยัน", callback_data: `prepare_${order.id}` },
          { text: "✖ Reject / ยกเลิก", callback_data: `reject_${order.id}` }
        ],
        [
          { text: "🛵 Dispatch Rider / ส่งไรเดอร์", callback_data: `delivering_${order.id}` },
          { text: "✓ Delivered / ส่งแล้ว", callback_data: `complete_${order.id}` }
        ]
      ]
    };

    const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: "HTML",
        reply_markup: inlineKeyboard
      })
    });

    const tgData = await telegramRes.json();
    if (tgData.ok && tgData.result?.message_id) {
      await supabase
        .from("pizza_orders")
        .update({
          telegram_notified: true,
          telegram_message_id: tgData.result.message_id
        })
        .eq("id", order.id);
    }

    // Send payment receipt and order confirmation email to the customer
    sendPizzaOrderEmail(order, "received").catch(err => {
      console.error("[Omise] Failed sending customer order confirmation email:", err);
    });
  } catch (err) {
    console.error("[Omise] Error notifying kitchen Telegram:", err);
  }
}

/**
 * 1. Handle Omise Charge Creation for Pizza Delivery
 * Supports PromptPay QR, Credit/Debit Cards with 3DS, TrueMoney
 */
export async function handleOmiseCharge(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { 
    amount, 
    orderId, 
    paymentChannel = "promptpay", 
    cardToken, 
    returnUri, 
    customerName, 
    phone 
  } = req.body || {};

  const parsedAmount = Math.max(1, Number(amount) || 0);
  if (!parsedAmount || !orderId) {
    return res.status(400).json({ error: "Missing required fields: amount, orderId" });
  }

  const satangAmount = Math.round(parsedAmount * 100);
  const origin = req.headers.origin || req.headers.referer || "http://localhost:3000";
  const cleanOrigin = (Array.isArray(origin) ? origin[0] : origin).replace(/\/$/, "");
  const defaultReturnUri = returnUri || `${cleanOrigin}/pizza?omise_order_id=${orderId}`;

  try {
    // ─── A. PROMPTPAY QR ──────────────────────────────────────────────────────────
    if (paymentChannel === "promptpay") {
      // 1. Create Source
      const source = await createOmiseSource({
        amount: satangAmount,
        currency: "thb",
        type: "promptpay"
      });

      // 2. Create Charge with Source
      const charge = await createOmiseCharge({
        amount: satangAmount,
        currency: "thb",
        source: source.id,
        return_uri: defaultReturnUri,
        description: `Flower Power Pizza Order #${orderId}`,
        metadata: {
          order_id: String(orderId),
          customer_name: customerName || "Customer",
          phone: phone || "",
          order_type: "pizza"
        }
      });

      const qrCodeUrl = charge.source?.scannable_code?.image?.download_uri || source.scannable_code?.image?.download_uri;

      // Update order in Supabase if orderId is an existing numeric database ID
      if (supabase) {
        const numericId = Number(orderId);
        if (!isNaN(numericId) && numericId > 0) {
          try {
            await supabase
              .from("pizza_orders")
              .update({
                payment_method: "omise_promptpay",
                payment_status: "pending",
                omise_charge_id: charge.id,
                receipt_url: qrCodeUrl || undefined
              })
              .eq("id", numericId);
          } catch (dbErr) {
            console.warn("[Omise] Non-critical error updating pending order:", dbErr);
          }
        }
      }

      return res.status(200).json({
        success: true,
        gateway: "omise",
        channel: "promptpay",
        chargeId: charge.id,
        qrCodeUrl,
        expiresAt: charge.expires_at || charge.source?.expires_at,
        status: charge.status, // 'pending'
        amount: parsedAmount
      });
    }

    // ─── B. CREDIT / DEBIT CARD (OMISE.JS TOKEN + 3DS) ──────────────────────────
    if (paymentChannel === "card") {
      if (!cardToken) {
        return res.status(400).json({ error: "Missing cardToken from Omise.js" });
      }

      const charge = await createOmiseCharge({
        amount: satangAmount,
        currency: "thb",
        card: cardToken,
        return_uri: defaultReturnUri,
        description: `Flower Power Pizza Card Order #${orderId}`,
        metadata: {
          order_id: String(orderId),
          customer_name: customerName || "Customer",
          phone: phone || "",
          order_type: "pizza"
        }
      });

      // If 3DS is required:
      if (charge.authorize_uri) {
        if (supabase) {
          try {
            await supabase
              .from("pizza_orders")
              .update({
                payment_method: "omise_card",
                receipt_url: charge.id,
                status: "new"
              })
              .eq("id", orderId);
          } catch (dbErr) {
            console.warn("[Omise] Error updating order pending charge:", dbErr);
          }
        }

        return res.status(200).json({
          success: true,
          gateway: "omise",
          channel: "card",
          chargeId: charge.id,
          authorizeUri: charge.authorize_uri,
          status: "pending",
          requires3DS: true
        });
      }

      // If immediate direct success (non-3DS card or test mode):
      if (charge.status === "successful") {
        if (supabase) {
          try {
            await supabase
              .from("pizza_orders")
              .update({
                payment_method: "omise_card",
                receipt_url: charge.id,
                status: "new"
              })
              .eq("id", orderId);
          } catch (dbErr) {
            console.warn("[Omise] Error updating order paid charge:", dbErr);
          }
        }

        await notifyKitchenTelegram(orderId);

        return res.status(200).json({
          success: true,
          gateway: "omise",
          channel: "card",
          chargeId: charge.id,
          status: "successful",
          paid: true
        });
      }

      // If failed
      if (charge.status === "failed") {
        if (supabase) {
          await supabase
            .from("pizza_orders")
            .update({
              payment_status: "failed",
              omise_charge_id: charge.id
            })
            .eq("id", orderId);
        }

        return res.status(400).json({
          success: false,
          gateway: "omise",
          error: charge.failure_message || "Credit card charge failed"
        });
      }

      return res.status(200).json({
        success: true,
        gateway: "omise",
        chargeId: charge.id,
        status: charge.status
      });
    }

    // ─── C. TRUEMONEY WALLET ───────────────────────────────────────────────────
    if (paymentChannel === "truemoney") {
      const source = await createOmiseSource({
        amount: satangAmount,
        currency: "thb",
        type: "truemoney",
        phone_number: phone
      });

      const charge = await createOmiseCharge({
        amount: satangAmount,
        currency: "thb",
        source: source.id,
        return_uri: defaultReturnUri,
        metadata: { order_id: String(orderId), order_type: "pizza" }
      });

      return res.status(200).json({
        success: true,
        gateway: "omise",
        channel: "truemoney",
        chargeId: charge.id,
        authorizeUri: charge.authorize_uri,
        status: charge.status
      });
    }

    return res.status(400).json({ error: `Unsupported paymentChannel: ${paymentChannel}` });
  } catch (err: any) {
    console.error("[Omise] handleOmiseCharge error:", err);
    return res.status(500).json({ error: err.message || "Failed creating Omise charge" });
  }
}

/**
 * 2. Check / Poll Omise Charge Status (for live PromptPay QR scanning or 3DS return)
 */
export async function handleOmiseCheckStatus(req: VercelRequest, res: VercelResponse) {
  const chargeId = (req.query.chargeId || req.body?.chargeId || "") as string;
  const orderId = (req.query.orderId || req.body?.orderId || "") as string;

  if (!chargeId && !orderId) {
    return res.status(400).json({ error: "Missing chargeId or orderId" });
  }

  try {
    let resolvedChargeId = chargeId;

    if (!resolvedChargeId && orderId && supabase) {
      try {
        const numericId = Number(orderId);
        if (!isNaN(numericId)) {
          const { data } = await supabase
            .from("pizza_orders")
            .select("id, receipt_url, status, payment_method")
            .eq("id", numericId)
            .maybeSingle();

          if (data?.receipt_url?.startsWith("chrg_")) {
            resolvedChargeId = data.receipt_url;
          }
        }
      } catch (err) {
        console.warn("[Omise Check Status] Error querying order for charge:", err);
      }
    }

    if (!resolvedChargeId) {
      return res.status(404).json({ error: "Charge ID not found" });
    }

    const charge = await retrieveOmiseCharge(resolvedChargeId);

    if (charge.status === "successful") {
      const matchedOrderId = charge.metadata?.order_id || orderId;
      if (matchedOrderId && supabase) {
        try {
          const numericId = Number(matchedOrderId);
          if (!isNaN(numericId) && numericId > 0) {
            const payMethod = charge.source?.type === "promptpay" ? "omise_promptpay" : "omise_card";
            await supabase
              .from("pizza_orders")
              .update({
                receipt_url: charge.id,
                payment_method: payMethod,
                payment_status: "paid",
                status: "new"
              })
              .eq("id", numericId);

            await notifyKitchenTelegram(numericId);
          }
        } catch (dbErr) {
          console.warn("[Omise Check Status] Error updating order status:", dbErr);
        }
      }

      return res.status(200).json({
        success: true,
        paid: true,
        status: "successful",
        chargeId: charge.id,
        amount: (charge.amount || 0) / 100
      });
    }

    if (charge.status === "failed") {
      return res.status(200).json({
        success: false,
        paid: false,
        status: "failed",
        failureMessage: charge.failure_message || "Payment was rejected"
      });
    }

    return res.status(200).json({
      success: true,
      paid: false,
      status: charge.status // 'pending'
    });
  } catch (err: any) {
    console.error("[Omise] handleOmiseCheckStatus error:", err);
    return res.status(500).json({ error: err.message || "Failed verifying Omise charge status" });
  }
}

/**
 * 3. Omise Webhook Handler (Async event notifications, e.g. charge.complete)
 */
export async function handleOmiseWebhook(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    return res.status(200).json({ status: "Omise Webhook Listener Active" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const event = req.body;
    if (!event || event.object !== "event") {
      return res.status(400).json({ error: "Invalid Omise event payload" });
    }

    console.log(`[Omise Webhook] Received event: ${event.key} (ID: ${event.id})`);

    if (event.key === "charge.complete") {
      const chargeData = event.data;
      const chargeId = chargeData?.id;

      if (!chargeId) {
        return res.status(400).json({ error: "Missing charge ID in webhook event" });
      }

      // Security: Query Omise API directly to verify charge status using Secret Key
      const verifiedCharge = await retrieveOmiseCharge(chargeId);

      if (verifiedCharge.status === "successful") {
        const orderId = verifiedCharge.metadata?.order_id;
        const orderType = verifiedCharge.metadata?.order_type;

        // Ensure this is strictly a Pizza order and not Village
        if (orderType === "pizza" || orderId) {
          console.log(`[Omise Webhook] Charge ${chargeId} successful for Pizza Order #${orderId}`);

          if (supabase) {
            const numericId = Number(orderId);
            let query = supabase.from("pizza_orders").select("id, status, payment_status");
            if (!isNaN(numericId) && numericId > 0) {
              query = query.or(`omise_charge_id.eq.${verifiedCharge.id},id.eq.${numericId}`);
            } else {
              query = query.eq("omise_charge_id", verifiedCharge.id);
            }
            const { data: existingOrder } = await query.maybeSingle();

            if (existingOrder) {
              if (existingOrder.status !== "new" || existingOrder.payment_status !== "paid") {
                await supabase
                  .from("pizza_orders")
                  .update({
                    payment_status: "paid",
                    omise_charge_id: verifiedCharge.id,
                    status: "new"
                  })
                  .eq("id", existingOrder.id);

                // Notify Kitchen Telegram Bot
                await notifyKitchenTelegram(existingOrder.id);
              }
            }
          }
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error("[Omise Webhook] Error processing webhook:", err);
    return res.status(500).json({ error: err.message || "Webhook processing error" });
  }
}
