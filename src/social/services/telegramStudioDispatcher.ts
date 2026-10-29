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
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
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
  const brandTitle = payload.brand === 'pizza'
    ? '🍕 Flower Power Pizza (Ranong)'
    : payload.format === 'R1'
    ? '🍽️ Flower Power Restaurant & Village (Koh Phayam)'
    : '🌺 Flower Power Village (Koh Phayam)';

  let messageText = `${topicConfig.icon} <b>${payload.title}</b>\n`;
  messageText += `🏢 <b>Brand:</b> <b>${brandTitle}</b>\n`;
  if (payload.format) {
    messageText += `🎬 <b>Format:</b> ${payload.format}\n`;
  }
  if (payload.priceBadge) {
    messageText += `💰 <b>Prezzo Offerta:</b> ${payload.priceBadge}\n`;
  }
  // Differenziazione radicale tra Stories (Topic 3, zero box testo) e Post Gruppo (Topic 2, scheda testo completa)
  if (payload.topic === 'kohPhayamGroup') {
    messageText += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    messageText += `📋 <b>TESTO DA COPIARE PER IL POST:</b>\n`;
    messageText += `<i>👇 Clicca o tocca il riquadro qui sotto: il testo viene copiato istantaneamente negli appunti!</i>\n\n`;
    messageText += `<pre>${escapeTelegramHtml(rawCleanCopy)}</pre>\n`;
    messageText += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    messageText += `👉 <b>Come pubblicare in 3 secondi:</b>\n`;
    messageText += `1️⃣ Clicca sul riquadro col testo sopra per copiarlo negli appunti\n`;
    messageText += `2️⃣ Clicca sul tasto sotto <b>"🌐 Vai al Gruppo Koh Phayam"</b>\n`;
    messageText += `3️⃣ <b>Incolla nel post Facebook:</b>\n`;
    messageText += `   • 💻 <i>Da Computer (PC/Mac):</i> premi <code>Ctrl + Shift + V</code>\n`;
    messageText += `   • 📱 <i>Da Telefono/Tablet:</i> tieni premuto e incolla! 🚀`;
  } else if (payload.topic === 'tikTokStories') {
    messageText += `\n👉 <i>Tocca il video sopra per salvarlo nel rullino, poi premi "Apri TikTok Stories" per pubblicarlo al volo! 🚀</i>`;
  }

  // Costruzione della tastiera inline (Bottoni interattivi)
  const inlineKeyboard: any[] = [];

  // 1. Tasto copia testo solo per i post con testo (escluso Stories dove non serve)
  if (payload.topic !== 'tikTokStories' && rawCleanCopy && rawCleanCopy.length <= 256) {
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
    ]);
  }

  // 3. Il video/foto e' gia' inviato nativo nel messaggio (salvataggio diretto da Telegram)

  const bodyPayload: any = {
    chat_id: supergroupId,
    message_thread_id: topicConfig.threadId,
    text: messageText,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    media_url: fullMediaUrl,
    media_type: isVideo ? 'video' : 'photo',
    media_caption: `${topicConfig.icon} <b>${payload.title}</b>\n🏢 <b>${brandTitle}</b> · Format: ${payload.format || 'AutoCut'}`,
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

export interface ChannelPublishResult {
  channel: 'instagram' | 'facebook' | 'tiktok' | 'google';
  status: 'success' | 'error' | 'skipped' | 'standby';
  details?: string;
  error?: string;
  id?: string;
  url?: string;
}

export interface PublishReportPayload {
  title: string;
  format?: string;
  brand: 'pizza' | 'village' | 'both';
  scheduledTime?: string;
  channelResults: ChannelPublishResult[];
  videoUrl?: string;
  thumbnailUrl?: string;
}

/**
 * 📊 Invia il resoconto ufficiale di pubblicazione al topic 'Reports' (threadId 286).
 * - Se tutti i canali attivi hanno avuto successo: invia conferma verde con dettagli e link.
 * - Se uno o più canali hanno fallito: genera un ALLARME ROSSO evidente segnalando l'errore esatto.
 */
export async function dispatchPublishReportToTelegram(
  report: PublishReportPayload
): Promise<TelegramDispatchResult> {
  const { supergroupId, topics } = TELEGRAM_STUDIO_CONFIG;

  const hasErrors = report.channelResults.some(r => r.status === 'error');
  const successCount = report.channelResults.filter(r => r.status === 'success').length;
  const errorCount = report.channelResults.filter(r => r.status === 'error').length;
  const skippedCount = report.channelResults.filter(r => r.status === 'skipped' || r.status === 'standby').length;

  const brandName = report.brand === 'pizza'
    ? '🍕 Pizzeria Ranong'
    : report.brand === 'village'
    ? '🏝️ Villaggio Koh Phayam'
    : '🍕🏝️ Flower Power (Pizza & Village)';

  const headerIcon = hasErrors ? '🚨' : '🟢';
  const headerTitle = hasErrors
    ? '<b>ALLARME: PUBBLICAZIONE FALLITA O INCOMPLETA</b> ❌'
    : '<b>PUBBLICAZIONE COMPLETATA CON SUCCESSO</b> ✨';

  let messageText = `${headerIcon} ${headerTitle}\n\n`;
  messageText += `🎬 <b>Titolo:</b> <code>${escapeTelegramHtml(report.title)}</code>\n`;
  messageText += `🏷️ <b>Brand:</b> ${brandName}\n`;
  if (report.format) {
    messageText += `📋 <b>Format:</b> <code>${report.format}</code>\n`;
  }
  if (report.scheduledTime) {
    messageText += `⏱️ <b>Orario Programmato:</b> ${report.scheduledTime}\n`;
  }
  messageText += `📅 <b>Data Esecuzione:</b> ${new Date().toLocaleString('it-IT', { timeZone: 'Asia/Bangkok' })} (Bangkok)\n`;
  messageText += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  messageText += `<b>DETTAGLIO CANALI:</b>\n\n`;

  const channelIcons: Record<string, string> = {
    instagram: '📸 Instagram',
    facebook: '📘 Facebook',
    tiktok: '🎵 TikTok',
    google: '📍 Google Maps',
  };

  for (const res of report.channelResults) {
    const chName = channelIcons[res.channel] || res.channel;
    if (res.status === 'success') {
      messageText += `✅ <b>${chName}:</b> <b>PUBBLICATO CON SUCCESSO</b>`;
      if (res.id) messageText += ` (ID: <code>${res.id}</code>)`;
      if (res.details) messageText += `\n   <i>${escapeTelegramHtml(res.details)}</i>`;
      messageText += `\n`;
    } else if (res.status === 'error') {
      messageText += `❌ <b>${chName}:</b> <b>ERRORE DI TRASMISSIONE</b> ⚠️\n`;
      messageText += `   🚨 <b>Dettaglio Errore:</b> <code>${escapeTelegramHtml(res.error || 'Errore imprevisto')}</code>\n`;
      if (res.details) messageText += `   ℹ️ <i>${escapeTelegramHtml(res.details)}</i>\n`;
    } else {
      messageText += `⏸️ <b>${chName}:</b> Disabilitato / In Pausa`;
      if (res.details) messageText += ` (<i>${escapeTelegramHtml(res.details)}</i>)`;
      messageText += `\n`;
    }
  }

  messageText += `━━━━━━━━━━━━━━━━━━━━\n`;

  if (hasErrors) {
    messageText += `\n⚠️ <b>AZIONE RICHIESTA:</b> Riscontrato errore su <b>${errorCount} canale/i</b>. Verificare le credenziali o la configurazione del canale fallito!\n`;
  } else {
    messageText += `\n✨ <b>STATUS:</b> Tutti i <b>${successCount} canali attivi</b> sono stati pubblicati regolarmente (${skippedCount} canali esclusi/in pausa).\n`;
  }

  const inlineKeyboard: any[] = [
    [
      {
        text: '🗓️ Apri Scheduler Calendario',
        url: 'https://flowerpowerpizza.com/autocut?tab=calendar',
      },
      {
        text: '🎬 Apri Social Studio',
        url: 'https://flowerpowerpizza.com/social-studio',
      },
    ],
  ];

  // Se ci sono stati successi ma anche un errore, invia sia il log pulito a 'published' per i canali riusciti, sia l'allarme a 'failed'
  // Se non ci sono errori, invia esclusivamente a 'published'
  // Se tutti i canali attivi sono falliti, invia solo a 'failed'
  const targetTopics = hasErrors
    ? [topics.failed.threadId, ...(successCount > 0 ? [topics.published.threadId] : [])]
    : [topics.published.threadId];

  let lastResult: TelegramDispatchResult = { success: true };

  for (const threadId of targetTopics) {
    const isFailTarget = threadId === topics.failed.threadId;
    const bodyPayload: any = {
      chat_id: supergroupId,
      message_thread_id: threadId,
      text: isFailTarget ? messageText : messageText.replace(/🚨.*ALLARME.*❌/g, '🟢 <b>PARZIALE: CANALI RIUSCITI</b> ✨'),
      parse_mode: 'HTML',
      disable_web_page_preview: true,
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
      const data = await res.json();
      lastResult = {
        success: !!data.ok,
        messageId: data.result?.message_id,
        error: data.description || data.error,
      };
    } catch (err: any) {
      lastResult = { success: false, error: err.message };
    }
  }

  return lastResult;
}
