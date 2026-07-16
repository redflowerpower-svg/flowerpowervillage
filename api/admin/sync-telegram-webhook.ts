import { VercelRequest, VercelResponse } from "@vercel/node";
import { updateTelegramCredentials } from "../_helpers/telegram.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow only POST requests for security
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { botToken, chatId, webhookUrl } = req.body;

  if (!botToken) {
    return res.status(400).json({ error: "TELEGRAM_BOT_TOKEN is missing." });
  }

  // Persist these credentials to the database for notification handlers
  const saveSuccess = await updateTelegramCredentials(botToken.trim(), chatId?.trim() || "", req.headers.authorization);
  if (!saveSuccess) {
    console.warn("[Sync Webhook] Could not save bot credentials to Supabase, continuing with registration.");
  }

  try {
    // Build dynamic webhook URL if not provided by the client
    let targetWebhookUrl = webhookUrl;
    if (!targetWebhookUrl) {
      const host = req.headers.host || "";
      const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.startsWith("192.168.");
      const protocol = isLocal ? "http" : "https";
      targetWebhookUrl = `${protocol}://${host}/api/telegram-webhook`;
    }

    console.log(`[Sync Webhook] Registering webhook URL: ${targetWebhookUrl}`);

    // Call Telegram API setWebhook
    const telegramUrl = `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(targetWebhookUrl)}`;
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

    return res.status(200).json({
      success: true,
      webhookUrl: targetWebhookUrl,
      details: result
    });
  } catch (err: any) {
    console.error("[Sync Webhook Server Error]:", err);
    return res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
}
