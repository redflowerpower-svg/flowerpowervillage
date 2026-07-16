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

/**
 * Retrieves the active Telegram Bot Token and Chat ID.
 */
export async function getTelegramCredentials(authHeader?: string): Promise<TelegramCredentials> {
  try {
    const client = getSupabaseClient(authHeader);
    const { data, error } = await client
      .from("telegram_config")
      .select("bot_token, chat_id")
      .eq("id", "default")
      .maybeSingle();

    if (!error && data && data.bot_token && data.chat_id) {
      console.log("[Telegram Credentials] Loaded credentials from database config.");
      return {
        botToken: data.bot_token,
        chatId: data.chat_id
      };
    }
  } catch (err) {
    console.warn("[Telegram Credentials] Failed to read database config:", err);
  }

  // Fallback to environment variables
  console.log("[Telegram Credentials] Using environment variables fallback.");
  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN || null,
    chatId: process.env.TELEGRAM_CHAT_ID || null
  };
}

/**
 * Updates the active Telegram Bot Token and Chat ID in the database.
 */
export async function updateTelegramCredentials(botToken: string, chatId: string, authHeader?: string): Promise<boolean> {
  try {
    const client = getSupabaseClient(authHeader);
    const { error } = await client
      .from("telegram_config")
      .upsert({
        id: "default",
        bot_token: botToken,
        chat_id: chatId,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error("[Telegram Credentials] Failed to save credentials to database:", error);
      return false;
    }

    console.log("[Telegram Credentials] Successfully saved credentials to database.");
    return true;
  } catch (err) {
    console.error("[Telegram Credentials] Error upserting credentials:", err);
    return false;
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
export function buildContactLines(phone: string, hasWhatsApp: boolean, hasLine: boolean): string[] {
  const normalized = normalizeThaiPhone(phone);
  const lines: string[] = [];
  lines.push(`📞 <b>Telefono:</b> ${phone}`);
  if (hasWhatsApp) {
    lines.push(`💬 <a href="https://wa.me/${normalized}">Scrivi su WhatsApp</a>`);
  }
  if (hasLine) {
    lines.push(`🟩 <a href="https://line.me/ti/p/~${normalized}">Contatta su LINE</a>`);
  }
  return lines;
}

// Keep legacy exports for backward compatibility
export function getWhatsAppLink(phone: string): string {
  return `https://wa.me/${normalizeThaiPhone(phone)}`;
}
export function getLineLink(phone: string): string {
  return `https://line.me/ti/p/~${normalizeThaiPhone(phone)}`;
}
