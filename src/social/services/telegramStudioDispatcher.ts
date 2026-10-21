import { TELEGRAM_STUDIO_CONFIG, StudioTopicKey } from '../config/telegramStudioConfig';

export interface TelegramDispatchPayload {
  topic: StudioTopicKey;
  title: string;
  copyText: string;
  videoUrl?: string;
  imageUrl?: string;
  format?: string;
  brand?: string;
  priceBadge?: string;
}

export interface TelegramDispatchResult {
  success: boolean;
  messageId?: number;
  error?: string;
}

/**
 * Invia un post formattato direttamente al Topic appropriato del Supergruppo Telegram
 */
export async function dispatchPostToTelegramTopic(
  payload: TelegramDispatchPayload
): Promise<TelegramDispatchResult> {
  const { supergroupId, topics } = TELEGRAM_STUDIO_CONFIG;
  const topicConfig = topics[payload.topic];

  if (!topicConfig) {
    return { success: false, error: `Topic sconosciuto: ${payload.topic}` };
  }

  // Costruzione del messaggio HTML rifinito ed elegante
  let messageText = `${topicConfig.icon} <b>${payload.title}</b>\n`;
  if (payload.format) {
    messageText += `🎬 <b>Format:</b> ${payload.format} | 🏷️ <b>Brand:</b> ${payload.brand === 'pizza' ? 'Pizzeria Ranong' : 'Villaggio Koh Phayam'}\n`;
  }
  if (payload.priceBadge) {
    messageText += `💰 <b>Prezzo Offerta:</b> ${payload.priceBadge}\n`;
  }
  messageText += `\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  messageText += `${payload.copyText}\n\n`;
  messageText += `━━━━━━━━━━━━━━━━━━━━\n`;

  // Costruzione della tastiera inline (Bottoni interattivi)
  const inlineKeyboard: any[] = [];

  // Se è destinato al gruppo Koh Phayam, inserisci il pulsante per aprirlo direttamente
  if (payload.topic === 'kohPhayamGroup') {
    messageText += `👉 <i>Tocca il pulsante qui sotto per aprire il gruppo Facebook e incollare il post:</i>`;
    inlineKeyboard.push([
      {
        text: '🌐 Apri Gruppo FB Koh Phayam',
        url: topicConfig.targetFacebookGroupUrl,
      },
    ]);
  } else if (payload.topic === 'tikTokStories') {
    messageText += `👉 <i>Pronto per essere condiviso nelle Stories / Reels di TikTok e Instagram.</i>`;
  }

  if (payload.videoUrl) {
    inlineKeyboard.push([
      {
        text: '⬇️ Scarica Video MP4 (9:16)',
        url: payload.videoUrl,
      },
    ]);
  }

  const bodyPayload: any = {
    chat_id: supergroupId,
    message_thread_id: topicConfig.threadId,
    text: messageText,
    parse_mode: 'HTML',
    disable_web_page_preview: false,
  };

  if (inlineKeyboard.length > 0) {
    bodyPayload.reply_markup = {
      inline_keyboard: inlineKeyboard,
    };
  }

  try {
    const res = await fetch('/api/social-publisher?action=telegram_dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
    });

    const data = await res.json();
    if (!data.ok) {
      return { success: false, error: data.description || data.error || 'Errore invio Telegram' };
    }

    return {
      success: true,
      messageId: data.result?.message_id,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Errore di rete Telegram',
    };
  }
}
