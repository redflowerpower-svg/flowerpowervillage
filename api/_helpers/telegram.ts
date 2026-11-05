import { createClient } from "@supabase/supabase-js";

export interface TelegramCredentials {
  botToken: string | null;
  chatId: string | null;
}

/**
 * Helper to build Supabase client, optionally using client-side admin JWT.
 */
export function getSupabaseClient(authHeader?: string) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

  const options: any = {};
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const jwt = authHeader.substring(7);
    options.global = {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    };
  }
  return createClient(supabaseUrl, supabaseKey, options);
}

export type TelegramDepartment = 'pizza' | 'village';

/**
 * Retrieves the active Telegram Bot Token and Chat ID for a specific department (pizza or village).
 */
export async function getTelegramCredentials(
  department: TelegramDepartment = 'pizza',
  authHeader?: string
): Promise<TelegramCredentials> {
  try {
    const client = getSupabaseClient(authHeader);
    const targetId = department === 'village' ? 'village' : 'pizza';
    let { data, error } = await client
      .from("telegram_config")
      .select("bot_token, chat_id")
      .eq("id", targetId)
      .maybeSingle();

    // Fallback to legacy 'default' row if 'pizza' not populated yet
    if ((!data || !data.bot_token) && targetId === 'pizza') {
      const { data: legacyData } = await client
        .from("telegram_config")
        .select("bot_token, chat_id")
        .eq("id", "default")
        .maybeSingle();
      if (legacyData && legacyData.bot_token) {
        data = legacyData;
      }
    }

    if (!error && data && data.bot_token && data.chat_id) {
      console.log(`[Telegram Credentials] Loaded credentials for ${department} from database config (${targetId}).`);
      return {
        botToken: data.bot_token,
        chatId: data.chat_id
      };
    }
  } catch (err) {
    console.warn(`[Telegram Credentials] Failed to read database config for ${department}:`, err);
  }

  // Fallback to environment variables
  if (department === 'village') {
    return {
      botToken: process.env.TELEGRAM_VILLAGE_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN_VILLAGE || null,
      chatId: process.env.TELEGRAM_VILLAGE_CHAT_ID || process.env.TELEGRAM_CHAT_ID_VILLAGE || null
    };
  }

  // Fallback to environment variables for pizza
  console.log("[Telegram Credentials] Using environment variables fallback for pizza.");
  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN || null,
    chatId: process.env.TELEGRAM_CHAT_ID || null
  };
}

/**
 * Updates the active Telegram Bot Token and Chat ID in the database for a department.
 */
export async function updateTelegramCredentials(
  botToken: string,
  chatId: string,
  department: TelegramDepartment = 'pizza',
  authHeader?: string
): Promise<boolean> {
  try {
    const client = getSupabaseClient(authHeader);
    const targetId = department === 'village' ? 'village' : 'pizza';
    const { error } = await client
      .from("telegram_config")
      .upsert({
        id: targetId,
        bot_token: botToken,
        chat_id: chatId,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error(`[Telegram Credentials] Failed to save credentials for ${department} to database:`, error);
      return false;
    }

    console.log(`[Telegram Credentials] Successfully saved credentials for ${department} to database.`);
    return true;
  } catch (err) {
    console.error(`[Telegram Credentials] Error upserting credentials for ${department}:`, err);
    return false;
  }
}

export const PIZZA_TOPICS = {
  RESTAURANT: 3, // Topic: 'Order restaurant' (Dining Tablet & QR Tavoli)
  WEBSITE: 5     // Topic: 'order website' (Delivery & Asporto Sito Web)
} as const;

export type PizzaTopicKey = keyof typeof PIZZA_TOPICS;

export const VILLAGE_TOPICS = {
  BOOKINGS: 3,
  MODIFICATIONS_CANCELLATIONS: 7,
  ALERTS_OVERBOOKING: 8,
  DAILY_REPORT: 9,
  BOOKING_OFFERS: 12
} as const;

export { formatDateDMY, formatAllDatesToDMY } from "./date-formatter.js";
import { formatAllDatesToDMY } from "./date-formatter.js";

export type VillageTopicKey = keyof typeof VILLAGE_TOPICS;

/**
 * Sends a Telegram message to a specific department ('pizza' or 'village').
 * Garantisce tassativamente che tutte le date siano espresse in formato giorno/mese/anno (DD/MM/YYYY).
 */
export async function sendDepartmentTelegramMessage(
  department: TelegramDepartment,
  message: string,
  options?: {
    parseMode?: 'HTML' | 'MarkdownV2';
    disableWebPagePreview?: boolean;
    threadId?: number;
    topic?: VillageTopicKey;
    replyMarkup?: any;
    replyToMessageId?: number;
  }
): Promise<{ success: boolean; error?: string; result?: any }> {
  const { botToken, chatId } = await getTelegramCredentials(department);
  if (!botToken || !chatId) {
    console.log(`[Telegram ${department}] Not configured yet. Skipping message.`);
    return { success: false, error: 'Telegram not configured for this department' };
  }

  // 📅 Trasformazione universale: tutte le date inviate a Telegram diventano Giorno/Mese/Anno (DD/MM/YYYY)
  const cleanMessage = formatAllDatesToDMY(message);

  const payload: any = {
    chat_id: chatId,
    text: cleanMessage,
    parse_mode: options?.parseMode || 'HTML',
    disable_web_page_preview: options?.disableWebPagePreview ?? true
  };

  if (department === 'village') {
    const threadId = options?.threadId || (options?.topic ? VILLAGE_TOPICS[options.topic] : undefined);
    if (threadId) {
      payload.message_thread_id = threadId;
    }
  }

  if (options?.replyMarkup) {
    payload.reply_markup = options.replyMarkup;
  }
  if (options?.replyToMessageId) {
    payload.reply_to_message_id = options.replyToMessageId;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return { success: data.ok, result: data };
  } catch (err: any) {
    console.error(`[Telegram ${department} Error]:`, err);
    return { success: false, error: err.message };
  }
}


/**
 * Normalizes a Thai phone number to international format (66xxxxxxxxx).
 */
function normalizeThaiPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "66" + cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Builds Telegram HTML contact lines for phone, WhatsApp, and LINE.
 * Returns an array of lines to spread into the message array.
 */
export function buildContactLines(phone: string, _hasWhatsApp?: boolean, _hasLine?: boolean): string[] {
  return [
    `📞 <b>Phone / เบอร์โทร:</b> ${phone}`,
  ];
}

// Keep legacy exports for backward compatibility
export function getWhatsAppLink(phone: string): string {
  return `https://wa.me/${normalizeThaiPhone(phone)}`;
}
export function getLineLink(phone: string): string {
  return `https://line.me/ti/p/~${normalizeThaiPhone(phone)}`;
}

export interface PaymentDetails {
  type: 'card' | 'qr_online' | 'qr_slip' | 'cash' | 'table';
  isPaidOnline: boolean;
  statusBanner: string | null;
  paymentLine: string;
  riderNote: string | null;
  badgeLabel: string;
}

/**
 * Resolves precise payment details distinguishing Card, QR Code (Omise / Slip), and Cash on Delivery
 */
export function resolvePaymentDetails(order: {
  payment_method?: string | null;
  receipt_url?: string | null;
  total?: number | string | null;
}): PaymentDetails {
  const method = String(order.payment_method || '').toLowerCase().trim();
  const receipt = String(order.receipt_url || '').trim();

  // 1. CREDIT / DEBIT CARD (Omise 3DS)
  if (method.includes('card')) {
    return {
      type: 'card',
      isPaidOnline: true,
      statusBanner: `💰 <b>STATUS: PAID ONLINE (ชำระเงินเรียบร้อยแล้ว - ห้ามเก็บเงินสด)</b>`,
      paymentLine: `<b>Payment / วิธีชำระเงิน:</b>\n✅ 💳 <b>PAID ONLINE: Credit Card (Omise) / จ่ายด้วยบัตรเครดิตแล้ว</b>`,
      riderNote: `🛵 <b>Rider Note:</b> ⚠️ <b>Already paid online by Card • DO NOT COLLECT CASH / ห้ามเก็บเงินสด</b>`,
      badgeLabel: 'Card Online (Omise)'
    };
  }

  // 2. PROMPTPAY QR VIA OMISE (Auto-Confirmed)
  if (method === 'omise_promptpay' || (method.includes('promptpay') && receipt.startsWith('chrg_'))) {
    return {
      type: 'qr_online',
      isPaidOnline: true,
      statusBanner: `💰 <b>STATUS: PAID ONLINE (ชำระเงินเรียบร้อยแล้ว - ห้ามเก็บเงินสด)</b>`,
      paymentLine: `<b>Payment / วิธีชำระเงิน:</b>\n✅ 📱 <b>PAID ONLINE: PromptPay QR (Omise) / สแกนคิวอาร์โค้ดจ่ายแล้ว</b>`,
      riderNote: `🛵 <b>Rider Note:</b> ⚠️ <b>Already paid online by QR • DO NOT COLLECT CASH / ห้ามเก็บเงินสด</b>`,
      badgeLabel: 'PromptPay QR (Omise)'
    };
  }

  // 3. TABLE / DINE-IN
  if (method.includes('table') || method.includes('dine')) {
    const isPP = method.includes('promptpay');
    return {
      type: 'table',
      isPaidOnline: false,
      statusBanner: null,
      paymentLine: `<b>Payment / วิธีชำระเงิน:</b>\n🍽️ <b>Pay at Table / ชำระที่โต๊ะ (${isPP ? 'PromptPay QR' : 'Cash'})</b>`,
      riderNote: null,
      badgeLabel: 'Dine-in'
    };
  }

  // 4. MANUAL PROMPTPAY (Slip Uploaded)
  if (method === 'promptpay' && receipt.length > 0) {
    return {
      type: 'qr_slip',
      isPaidOnline: false,
      statusBanner: `📋 <b>STATUS: PROMPTPAY SLIP ATTACHED (แนบสลิปโอนเงิน)</b>`,
      paymentLine: `<b>Payment / วิธีชำระเงิน:</b>\n✅ 📱 <b>PromptPay (QR Transfer Slip) / โอนผ่านคิวอาร์โค้ด (มีสลิปแนบ)</b>`,
      riderNote: `🛵 <b>Rider Note:</b> <b>Verify transfer slip before delivery / ตรวจสอบสลิปก่อนส่ง</b>`,
      badgeLabel: 'PromptPay (Slip)'
    };
  }

  // 5. CASH ON DELIVERY (Default)
  const totalVal = order.total ? `${order.total} THB` : '';
  return {
    type: 'cash',
    isPaidOnline: false,
    statusBanner: `⚠️ <b>PAYMENT: CASH ON DELIVERY / เก็บเงินสดปลายทาง (${totalVal})</b>`,
    paymentLine: `<b>Payment / วิธีชำระเงิน:</b>\n❌ 💵 <b>Cash on Delivery / เก็บเงินสดปลายทาง (COD)</b>`,
    riderNote: `🛵 <b>Rider Note:</b> ⚠️ <b>COLLECT FROM CUSTOMER: ${totalVal} / ต้องเก็บเงินสด</b>`,
    badgeLabel: 'Cash on Delivery (COD)'
  };
}
