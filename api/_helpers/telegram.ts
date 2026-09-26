import { createClient } from "@supabase/supabase-js";

export interface TelegramCredentials {
  botToken: string | null;
  chatId: string | null;
}

/**
 * Helper to build Supabase client, optionally using client-side admin JWT.
 */
export function getSupabaseClient(authHeader?: string) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
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

/**
 * Sends a Telegram message to a specific department ('pizza' or 'village').
 */
export async function sendDepartmentTelegramMessage(
  department: TelegramDepartment,
  message: string,
  options?: { parseMode?: 'HTML' | 'MarkdownV2'; disableWebPagePreview?: boolean }
): Promise<{ success: boolean; error?: string; result?: any }> {
  const { botToken, chatId } = await getTelegramCredentials(department);
  if (!botToken || !chatId) {
    console.log(`[Telegram ${department}] Not configured yet. Skipping message.`);
    return { success: false, error: 'Telegram not configured for this department' };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: options?.parseMode || 'HTML',
        disable_web_page_preview: options?.disableWebPagePreview ?? true
      })
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
  const normalized = normalizeThaiPhone(phone);
  return [
    `📞 <b>Phone / เบอร์โทร:</b> ${phone}`,
    `🟢 <a href="https://wa.me/${normalized}">Chat on WhatsApp / แชท WhatsApp</a>`,
    `🟩 <a href="https://line.me/ti/p/~${normalized}">Contact on LINE / แชท LINE</a>`
  ];
}

// Keep legacy exports for backward compatibility
export function getWhatsAppLink(phone: string): string {
  return `https://wa.me/${normalizeThaiPhone(phone)}`;
}
export function getLineLink(phone: string): string {
  return `https://line.me/ti/p/~${normalizeThaiPhone(phone)}`;
}
