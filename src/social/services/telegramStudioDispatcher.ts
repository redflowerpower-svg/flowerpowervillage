import { TELEGRAM_STUDIO_CONFIG, StudioTopicKey } from '../config/telegramStudioConfig';

export interface TelegramDispatchPayload {
  topic: StudioTopicKey;
  title: string;
  copyText: string;
  videoUrl?: string;
  imageUrl?: string;
  mediaUrl?: string;
  mediaType?: 'video' | 'photo';
  format?: string;
  brand?: string;
  priceBadge?: string;
  thumbnailUrl?: string;
}

export interface TelegramDispatchResult {
  success: boolean;
  messageId?: number;
  mediaSent?: boolean;
  error?: string;
}

function stripHtmlTags(str: string): string {
  if (!str) return '';
  return str
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function escapeTelegramHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Invia un post formattato direttamente al Topic appropriato del Supergruppo Telegram
 * - Blocco preformattato <pre> per copia testo con 1 tocco (mantiene formattazione, spazi e hashtag)
 * - Pulsante nativo copy_text per copia istantanea negli appunti su smartphone
 * - Pulsante deep link diretto per aprire Facebook Group o TikTok/Instagram
 * - Pulsante download media HD (Foto o Video 9:16)
 * - Invio nativo foto/video in chat Telegram
 */
export async function dispatchPostToTelegramTopic(
  payload: TelegramDispatchPayload
): Promise<TelegramDispatchResult> {
  const { supergroupId, topics } = TELEGRAM_STUDIO_CONFIG;
  const topicConfig = topics[payload.topic];

  if (!topicConfig) {
    return { success: false, error: `Topic sconosciuto: ${payload.topic}` };
  }

  const rawCleanCopy = stripHtmlTags(payload.copyText);
  const activeMediaUrl = payload.videoUrl || payload.mediaUrl || payload.imageUrl;
  const isVideo =
    payload.mediaType === 'video' ||
    !!payload.videoUrl ||
    (activeMediaUrl?.toLowerCase().endsWith('.mp4') ?? false);

  const fullMediaUrl = activeMediaUrl
    ? (activeMediaUrl.startsWith('/') ? `https://flowerpowervillage.com${activeMediaUrl}` : activeMediaUrl)
    : undefined;

  // Costruzione del messaggio HTML rifinito ed elegante
  let messageText = `${topicConfig.icon} <b>${payload.title}</b>\n`;
  if (payload.format) {
    messageText += `🎬 <b>Format:</b> ${payload.format} | 🏷️ <b>Brand:</b> ${payload.brand === 'pizza' ? 'Pizzeria Ranong' : 'Villaggio Koh Phayam'}\n`;
  }
  if (payload.priceBadge) {
    messageText += `💰 <b>Prezzo Offerta:</b> ${payload.priceBadge}\n`;
  }
  messageText += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  messageText += `📋 <b>TESTO DA COPIARE PER IL POST:</b>\n`;
  messageText += `<i>👇 Tocca il riquadro qui sotto: il testo verrà copiato istantaneamente negli appunti del telefono!</i>\n\n`;
  messageText += `<pre>${escapeTelegramHtml(rawCleanCopy)}</pre>\n`;
  messageText += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Guida rapida contestuale in base al canale
  if (payload.topic === 'kohPhayamGroup') {
    messageText += `👉 <b>Come pubblicare in 3 secondi:</b>\n`;
    messageText += `1️⃣ Tocca il riquadro col testo sopra per copiarlo negli appunti\n`;
    messageText += `2️⃣ Salva l'immagine HD (con scritte e logo) nel rullino del telefono\n`;
    messageText += `3️⃣ Clicca sul tasto sotto <b>"🌐 Vai al Gruppo Koh Phayam"</b> e incolla! 🚀`;
  } else if (payload.topic === 'tikTokStories') {
    messageText += `👉 <b>Come pubblicare nelle Stories in 3 secondi:</b>\n`;
    messageText += `1️⃣ Tocca il riquadro con il testo per copiarlo\n`;
    messageText += `2️⃣ Salva il video o la foto nella galleria\n`;
    messageText += `3️⃣ Tocca <b>"📱 Apri TikTok"</b> o <b>"📸 Apri Instagram"</b>, seleziona Story e incolla il testo! 🚀`;
  }

  // Costruzione della tastiera inline (Bottoni interattivi)
  const inlineKeyboard: any[] = [];

  // 1. Tasto copia testo rapido nativo Telegram (Bot API 7.5+ supporta max 256 caratteri)
  if (rawCleanCopy && rawCleanCopy.length <= 256) {
    inlineKeyboard.push([
      {
        text: '📋 Copia Testo Post (1 Tocco)',
        copy_text: {
          text: rawCleanCopy,
        },
      },
    ]);
  }

  // 2. Tasti Apri Gruppo FB o Apri TikTok / Instagram Stories
  if (payload.topic === 'kohPhayamGroup') {
    inlineKeyboard.push([
      {
        text: '🌐 Vai al Gruppo Koh Phayam',
        url: topicConfig.targetFacebookGroupUrl,
      },
    ]);
  } else if (payload.topic === 'tikTokStories') {
    inlineKeyboard.push([
      {
        text: '📱 Apri TikTok Stories',
        url: 'https://www.tiktok.com/',
      },
      {
        text: '📸 Apri Instagram Stories',
        url: 'https://www.instagram.com/',
      },
    ]);
  }

  // 3. Tasto Download Diretto del file multimediale (solo se URL http/https valido)
  if (fullMediaUrl && (fullMediaUrl.startsWith('http://') || fullMediaUrl.startsWith('https://')) && !fullMediaUrl.startsWith('data:')) {
    inlineKeyboard.push([
      {
        text: isVideo ? '⬇️ Scarica Video MP4 (9:16)' : '⬇️ Scarica Media HD (9:16)',
        url: fullMediaUrl,
      },
    ]);
  }

  const bodyPayload: any = {
    chat_id: supergroupId,
    message_thread_id: topicConfig.threadId,
    text: messageText,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    media_url: fullMediaUrl,
    media_type: isVideo ? 'video' : 'photo',
    media_caption: `${topicConfig.icon} <b>${payload.title}</b>\n🎬 Format: ${payload.format || 'AutoCut'} · ${payload.brand === 'pizza' ? 'Pizzeria Ranong' : 'Villaggio Koh Phayam'}`,
    thumbnail_url: payload.thumbnailUrl,
    reply_markup: {
      inline_keyboard: inlineKeyboard,
    },
  };

  try {
    const res = await fetch('/api/social-publisher?action=telegram_dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch (parseErr) {
      return { success: false, error: `Il server ha risposto con codice ${res.status}. Riprova tra pochi istanti.` };
    }

    if (!data.ok) {
      return { success: false, error: data.description || data.error || 'Errore invio Telegram' };
    }

    if (payload.mediaType === 'video' && !data.media_sent) {
      return {
        success: false,
        error: data.error || 'Il file video MP4 non è stato recapitato su Telegram. Riprova.'
      };
    }

    return {
      success: true,
      messageId: data.result?.message_id,
      mediaSent: data.media_sent,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Errore di rete Telegram',
    };
  }
}
