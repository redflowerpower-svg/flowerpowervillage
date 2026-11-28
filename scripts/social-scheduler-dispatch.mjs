/**
 * 🤖 SOCIAL SCHEDULER DISPATCHER — Serverless 24/7 (Reparto Stagno /social)
 *
 * Esegue i dispatch del Social Media Studio in base all'orario di Bangkok (UTC+7):
 * - 08:00 Bangkok:
 *     1. Story Pizzeria (P1/DS) -> Telegram Topic 3 (TikTok/IG Stories)
 *     2. Story Villaggio (V1)   -> Telegram Topic 3 (TikTok/IG Stories)
 *     3. Post Alloggi LM1       -> Telegram Topic 2 (Gruppo Facebook Koh Phayam)
 * - 09:30 Bangkok:
 *     4. Instagram Story Villaggio (V1)
 * - 10:30 Bangkok:
 *     5. Instagram Story Pre-Pranzo Pizzeria (P3)
 * - 11:30 Bangkok:
 *     6. Facebook Only: Pranzo Pasta Fresca Ranong (P2)
 * - 12:30 Bangkok:
 *     7. Facebook Story Pranzo Pizzeria (P1)
 * - 13:30 Bangkok:
 *     8. Instagram Reel/Post Pranzo Mix Pizzeria (P3)
 * - 15:00 Bangkok:
 *     9. Instagram Story Pomeriggio Pizzeria (P1)
 * - 16:00 Bangkok:
 *    10. Instagram Only: Relax Pomeridiano & Suite Tour (V2)
 * - 17:00 Bangkok:
 *    11. Story Pizzeria (P1) -> Telegram Topic 3
 *    12. Story Villaggio (V3) -> Telegram Topic 3
 *    13. Post Ristorante R1 -> Telegram Topic 2 (Gruppo Facebook Koh Phayam)
 * - 18:00 Bangkok:
 *    14. Instagram Story Serale Villaggio (V3)
 * - 18:30 Bangkok:
 *    15. TikTok Feed API: Post Feed 9:16 (Bozza P1)
 * - 19:30 Bangkok:
 *    16. Facebook Only: Cena Pizza Tradizionale Ranong 48h (P1)
 * - 20:00 Bangkok:
 *    17. Facebook Story Serale Dessert Pizzeria (P3)
 * - 20:30 Bangkok:
 *    18. Instagram Reel/Post Cena Categoria Pizzeria (P2)
 * - 21:00 Bangkok:
 *    19. Instagram Only: Notte Koh Phayam Tropical Escape (V3)
 *
 * Uso:
 *   node scripts/social-scheduler-dispatch.mjs [--slot=08:00] [--dry-run] [--base=http://localhost:3000]
 */
import fs from 'fs';
import path from 'path';
import { spawnSync, execFileSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import { neon } from '@neondatabase/serverless';
import {
  OFFICIAL_SLOTS,
  MAX_SLOT_ATTEMPTS,
  SLOT_METADATA,
  TOPIC_KOH_PHAYAM_GROUP,
  TOPIC_TIKTOK_STORIES,
  TOPIC_PUBLISHED,
  TOPIC_FAILED,
  resolveScheduledSlot,
  computeNextRetryHint,
  serializeRetryMeta,
  selectSlotToExecute,
  isPermanentError,
  buildDelayNoticeMessage,
  buildSubTopicNoticeMessage,
  buildResolvedNoticeMessage,
  validateRenderedModeContract
} from './social-scheduler-core.mjs';

const env = { ...process.env };
if (fs.existsSync('.env')) {
  for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/);
    if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const getArg = (k, d = '') => {
  const f = process.argv.slice(2).find(a => a.startsWith(`--${k}=`));
  return f ? f.slice(k.length + 3) : d;
};

const dryRun = process.argv.slice(2).includes('--dry-run');
const forceRun = process.argv.slice(2).includes('--force');
const isPreflight = process.argv.slice(2).includes('--preflight');
const explicitAttemptArg = Number(getArg('attempt', '0')) || 0;
const base = getArg('base', 'http://localhost:3000').replace(/\/$/, '');
const outDir = path.resolve(getArg('out', 'scratch/scheduler'));
fs.mkdirSync(outDir, { recursive: true });
const alertMarkerPath = path.join(outDir, '.handled_alert.json');

if (!isPreflight && fs.existsSync(alertMarkerPath)) {
  try { fs.unlinkSync(alertMarkerPath); } catch { }
}

function writeHandledAlertMarker(payload = {}) {
  try {
    fs.writeFileSync(alertMarkerPath, JSON.stringify({ ...payload, timestamp: new Date().toISOString() }, null, 2));
  } catch (e) {
    console.warn('[scheduler-dispatch] Avviso scrittura alert marker:', e.message);
  }
}

// Calcola orario attuale di Bangkok (UTC+7)
function getBangkokTime() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const bangkok = new Date(utc + (3600000 * 7));
  const hh = String(bangkok.getHours()).padStart(2, '0');
  const mm = String(bangkok.getMinutes()).padStart(2, '0');
  return { date: bangkok, timeStr: `${hh}:${mm}`, hour: bangkok.getHours(), min: bangkok.getMinutes() };
}

const currentBk = getBangkokTime();
const rawSlotArg = getArg('slot', '');
let targetSlot = resolveScheduledSlot(rawSlotArg, currentBk);

console.log(`[scheduler-dispatch] Orario attuale Bangkok: ${currentBk.timeStr} · Slot iniziale: ${targetSlot || 'AUTO/RECOVERY'} (Arg: "${rawSlotArg}", Dry Run: ${dryRun})`);

const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || 'https://gjqevgkbjkharczhikcl.supabase.co';
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;
const sb = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;
const neonSql = env.NEON_DATABASE_URL ? neon(env.NEON_DATABASE_URL) : null;

async function fetchWithRetry(url, initOrFactory = {}, {
  maxAttempts = 3,
  timeoutMs = 45000,
  backoffMs = [3000, 8000],
  label = 'HTTP',
  retryOnStatuses = [408, 429, 500, 502, 503, 504]
} = {}) {
  let lastErr = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const baseInit = typeof initOrFactory === 'function' ? await initOrFactory(attempt) : { ...initOrFactory };
      const signal = baseInit.signal || AbortSignal.timeout(timeoutMs);
      const res = await fetch(url, { ...baseInit, signal });
      if (retryOnStatuses.includes(res.status) && attempt < maxAttempts) {
        const wait = backoffMs[Math.min(attempt - 1, backoffMs.length - 1)] || 5000;
        console.warn(`⚠️ [${label}] HTTP ${res.status} (tentativo ${attempt}/${maxAttempts}), retry tra ${wait}ms...`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      return res;
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts) {
        const wait = backoffMs[Math.min(attempt - 1, backoffMs.length - 1)] || 5000;
        console.warn(`⚠️ [${label}] Errore rete "${err.message}" (tentativo ${attempt}/${maxAttempts}), retry tra ${wait}ms...`);
        await new Promise(r => setTimeout(r, wait));
      }
    }
  }
  throw lastErr || new Error(`${label} fallito dopo ${maxAttempts} tentativi`);
}

// 🔒 TELEMETRIA & LOCK SU NEON DATABASE
async function fetchTodaySocialRows() {
  if (!neonSql) return [];
  try {
    const rows = await neonSql`
      SELECT id, slot, status, copy_text, created_at
      FROM social_scheduled_posts
      WHERE (created_at AT TIME ZONE 'Asia/Bangkok')::date = (NOW() AT TIME ZONE 'Asia/Bangkok')::date
      ORDER BY created_at ASC;
    `;
    return rows || [];
  } catch (err) {
    console.warn('[scheduler-dispatch] Avviso lettura storico giornaliero Neon:', err.message);
    return [];
  }
}

async function writeSocialLog({ platform = 'scheduler', brand = 'flowerpower', message = '', error = null }) {
  if (dryRun || !neonSql) return;
  try {
    await neonSql`
      INSERT INTO social_logs (platform, brand, message, error, created_at)
      VALUES (
        ${String(platform || 'scheduler').slice(0, 120)},
        ${String(brand || 'flowerpower').slice(0, 60)},
        ${String(message || '').slice(0, 1000)},
        ${error ? String(error).slice(0, 2000) : null},
        NOW()
      );
    `;
  } catch (err) {
    console.warn('[scheduler-dispatch] Avviso scrittura social_logs Neon:', err.message);
  }
}

async function recordSlotStatus({ slot, status, platform = 'telegram_meta', brand = 'flowerpower', title = '', copyText = '' }) {
  if (dryRun || !slot) {
    console.log(`[scheduler-dispatch] (Dry Run) Slot ${slot} -> status="${status}" (skip scrittura Neon).`);
    return;
  }
  if (neonSql) {
    try {
      await neonSql`
        INSERT INTO social_scheduled_posts (
          platform, brand, slot, title, copy_text, status, created_at, updated_at
        ) VALUES (
          ${platform},
          ${brand},
          ${slot},
          ${title || `Slot ${slot}`},
          ${copyText || ''},
          ${status},
          NOW(),
          NOW()
        );
      `;
    } catch (err) {
      console.warn(`[scheduler-dispatch] Avviso registrazione stato "${status}" su Neon per ${slot}:`, err.message);
    }
  }
}

async function recordItemCompleted({ slot, itemKey, brand, title, details = '' }) {
  return recordSlotStatus({
    slot: `${slot}::${itemKey}`,
    status: 'completed',
    platform: 'telegram_meta',
    brand: brand || SLOT_METADATA[slot]?.brand || 'flowerpower',
    title: title || `${slot} · ${itemKey}`,
    copyText: details
  });
}

async function isSlotCompletedToday(slot) {
  if (dryRun || forceRun || !slot) return false;
  if (!neonSql) return false;
  try {
    const rows = await neonSql`
      SELECT id, status, created_at 
      FROM social_scheduled_posts 
      WHERE slot = ${slot} 
        AND status = 'completed'
        AND (created_at AT TIME ZONE 'Asia/Bangkok')::date = (NOW() AT TIME ZONE 'Asia/Bangkok')::date
      LIMIT 1;
    `;
    return rows && rows.length > 0;
  } catch (err) {
    console.warn('[scheduler-dispatch] Avviso verifica lock Neon:', err.message);
    return false;
  }
}

async function recordSlotCompleted(slot, summary = {}) {
  await recordSlotStatus({
    slot,
    status: 'completed',
    platform: summary.platform || 'telegram_meta',
    brand: summary.brand || 'flowerpower',
    title: summary.title || `Slot ${slot}`,
    copyText: summary.details || ''
  });
  if (!dryRun) {
    console.log(`[scheduler-dispatch] 🔒 Lock completato registrato su Neon per slot ${slot} (${currentBk.timeStr})`);
  }
}

// ⚡ PRE-FLIGHT GATEKEEPER PER GITHUB ACTIONS (Decisione in < 1 secondo)
if (isPreflight) {
  (async () => {
    const ghOutput = process.env.GITHUB_OUTPUT;
    const setGhOutput = (k, v) => {
      if (ghOutput && fs.existsSync(ghOutput)) {
        fs.appendFileSync(ghOutput, `${k}=${v}\n`);
      }
    };

    const todayRows = await fetchTodaySocialRows();
    const decision = selectSlotToExecute({
      rawSlot: rawSlotArg,
      bkTime: currentBk,
      todayRows,
      forceRun,
      dryRun
    });

    if (!decision.slot) {
      if (decision.reason === 'already_completed') {
        console.log(`[preflight] 🛑 Slot ${rawSlotArg} già completato oggi a Bangkok. Skip runner.`);
      } else {
        console.log(`[preflight] ℹ️ Nessuno slot attivo o in coda recovery per l'orario ${currentBk.timeStr} a Bangkok.`);
      }
      setGhOutput('should_run', 'false');
      process.exit(0);
    }

    console.log(`[preflight] 🚀 Slot ${decision.slot} selezionato (motivo: ${decision.reason}, tentativo ${decision.attempt}/${MAX_SLOT_ATTEMPTS})! Avvio pipeline completa.`);
    setGhOutput('should_run', 'true');
    setGhOutput('target_slot', decision.slot);
    setGhOutput('attempt', String(decision.attempt || 1));
    setGhOutput('is_recovery', decision.isRecovery ? 'true' : 'false');
    process.exit(0);
  })().catch(err => {
    console.error('[preflight] Errore verifica:', err.message);
    const ghOutput = process.env.GITHUB_OUTPUT;
    const fallbackSlot = resolveScheduledSlot(rawSlotArg, currentBk);
    if (ghOutput && fs.existsSync(ghOutput)) {
      fs.appendFileSync(ghOutput, `should_run=${fallbackSlot ? 'true' : 'false'}\n`);
      if (fallbackSlot) {
        fs.appendFileSync(ghOutput, `target_slot=${fallbackSlot}\nattempt=1\nis_recovery=false\n`);
      }
    }
    process.exit(0);
  });
}

// Carica configurazione Telegram
let telegramToken = env.TELEGRAM_SOCIAL_BOT_TOKEN;
const chatId = '-1004492692624'; // Supergruppo Staff

async function sendPublishedLog(payload) {
  let text = '';
  if (typeof payload === 'string') {
    text = `🟢 <b>[FP SOCIAL STUDIO · PUBBLICAZIONE RIUSCITA]</b>\n${payload}`;
  } else {
    const { brand, channel, format, title, mediaId, details, gdriveId } = payload;
    const brandName = brand === 'pizza' ? '🍕 Pizzeria Ranong' : (brand === 'village' ? '🌴 Villaggio Koh Phayam' : '🍕🌴 Flower Power');
    text = `🟢 <b>[FP SOCIAL STUDIO · PUBBLICAZIONE RIUSCITA]</b>\n\n`;
    text += `🏷️ <b>REPARTO:</b> ${brandName}\n`;
    text += `📡 <b>CANALE:</b> ${channel || 'Canale Ufficiale'}\n`;
    if (format) text += `🎬 <b>FORMATO:</b> <code>${format}</code>\n`;
    if (title) text += `📋 <b>TITOLO:</b> ${title}\n`;
    text += `⏱️ <b>SLOT:</b> ${targetSlot} Bangkok\n`;
    if (mediaId) text += `🆔 <b>MEDIA ID:</b> <code>${mediaId}</code>\n`;
    if (gdriveId) text += `📁 <b>GOOGLE DRIVE 5TB:</b> <code>${gdriveId}</code>\n`;
    if (details) text += `ℹ️ <i>${escapeHtml(details)}</i>\n`;
    text += `\n✅ <i>Il contenuto è stato pubblicato con successo!</i>`;
  }

  try {
    await sendMessageToTelegram({ topicId: TOPIC_PUBLISHED, text });
  } catch (e) {
    console.warn('[scheduler-dispatch] Avviso log published:', e.message);
  }
}

async function sendFailedAlert(errOrPayload, context = '') {
  let text = '';
  if (errOrPayload && typeof errOrPayload === 'object' && !(errOrPayload instanceof Error) && (errOrPayload.brand || errOrPayload.channel)) {
    const { brand, channel, format, title, error, details, fallbackAction, attemptTag } = errOrPayload;
    const brandName = brand === 'pizza' ? '🍕 Pizzeria Ranong' : (brand === 'village' ? '🌴 Villaggio Koh Phayam' : '🍕🌴 Flower Power');
    const errorMsg = error?.stack || error?.message || String(error || details || 'Errore imprevisto');

    text = `🚨 <b>[FP SOCIAL STUDIO · ALLARME ERRORE CANALE]</b>\n\n`;
    text += `🏷️ <b>REPARTO:</b> ${brandName}\n`;
    text += `📡 <b>CANALE:</b> ${channel || 'Canale Ufficiale'}\n`;
    if (format) text += `🎬 <b>FORMATO:</b> <code>${format}</code>\n`;
    if (title) text += `📋 <b>TITOLO:</b> ${title}\n`;
    text += `⏱️ <b>SLOT:</b> ${targetSlot} Bangkok${attemptTag ? ` (${attemptTag})` : ''}\n`;
    text += `⚠️ <b>ERRORE:</b>\n<pre>${escapeHtml(errorMsg.slice(0, 1500))}</pre>\n`;
    if (fallbackAction) {
      text += `\n👉 <b>AZIONE INTRAPRESA:</b>\n${fallbackAction}\n`;
    }
  } else {
    const errorMsg = errOrPayload?.stack || errOrPayload?.message || String(errOrPayload);
    text = `🚨 <b>[FP SOCIAL STUDIO · ALLARME FAILED]</b>\n📍 <b>Slot:</b> ${targetSlot}\n🔍 <b>Contesto:</b> ${context}\n⚠️ <b>Errore:</b>\n<pre>${escapeHtml(errorMsg.slice(0, 1500))}</pre>`;
  }

  try {
    await sendMessageToTelegram({ topicId: TOPIC_FAILED, text });
  } catch (e) {
    console.error('[scheduler-dispatch] Impossibile inviare allarme a Topic 301:', e.message);
  }
}

async function sendTelegramHtmlMessage({ topicId, text }) {
  if (dryRun) {
    console.log(`[DRY-RUN] Messaggio HTML Topic ${topicId}:\n${text}`);
    return { ok: true, dryRun: true, messageId: null };
  }
  const data = await sendMessageToTelegram({ topicId, text });
  return {
    ok: !!data?.ok,
    messageId: data?.result?.message_id ?? null,
    data
  };
}

async function editTelegramHtmlMessage({ messageId, text }) {
  if (dryRun || !messageId) return { ok: true };
  try {
    const token = await getTelegramToken();
    if (!token) return { ok: false };
    const res = await fetchWithRetry(`https://api.telegram.org/bot${token}/editMessageText`, () => ({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    }), { maxAttempts: 2, timeoutMs: 20000, label: 'Telegram editMessageText' });
    const data = await res.json();
    if (!data.ok && !String(data.description || '').includes('message is not modified')) {
      console.warn('[scheduler-dispatch] Avviso editMessageText:', data.description);
      return { ok: false, data };
    }
    return { ok: true, data };
  } catch (e) {
    console.warn('[scheduler-dispatch] Eccezione editMessageText:', e.message);
    return { ok: false };
  }
}

async function deleteTelegramMessage({ messageId }) {
  if (dryRun || !messageId) return;
  try {
    const token = await getTelegramToken();
    if (!token) return;
    await fetch(`https://api.telegram.org/bot${token}/deleteMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
      signal: AbortSignal.timeout(15000)
    });
  } catch (e) {
    console.warn('[scheduler-dispatch] Avviso deleteMessage:', e.message);
  }
}

async function sendOrUpdateDelayNotice({ slot, attempt, errorSummary, lastNotice = {}, pendingItems = [] }) {
  const slotMeta = SLOT_METADATA[slot] || {};
  const nextRetryHint = computeNextRetryHint(currentBk);
  const delayText = buildDelayNoticeMessage({
    slot,
    slotLabel: slotMeta.label,
    attempt,
    maxAttempts: MAX_SLOT_ATTEMPTS,
    reasonSummary: errorSummary,
    nextRetryHint,
    pendingItems
  });

  let topic301MsgId = lastNotice?.topic301MsgId || null;
  if (topic301MsgId) {
    const edited = await editTelegramHtmlMessage({ messageId: topic301MsgId, text: delayText });
    if (!edited.ok) {
      const sent = await sendTelegramHtmlMessage({ topicId: TOPIC_FAILED, text: delayText });
      if (sent.messageId) topic301MsgId = sent.messageId;
    }
  } else {
    const sent = await sendTelegramHtmlMessage({ topicId: TOPIC_FAILED, text: delayText });
    if (sent.messageId) topic301MsgId = sent.messageId;
  }

  const extraNotices = Array.isArray(lastNotice?.extraNotices) ? [...lastNotice.extraNotices] : [];
  const itemTopics = slotMeta.itemTopics || {};
  const targetSubTopics = new Set();

  if (Array.isArray(pendingItems) && pendingItems.length > 0) {
    for (const itemKey of pendingItems) {
      if (itemTopics[itemKey]) targetSubTopics.add(itemTopics[itemKey]);
    }
  } else {
    for (const tId of Object.values(itemTopics)) {
      if (tId) targetSubTopics.add(tId);
    }
  }

  for (const tId of targetSubTopics) {
    const alreadySent = extraNotices.some(n => Number(n?.topicId) === Number(tId));
    if (!alreadySent) {
      const subText = buildSubTopicNoticeMessage({
        slot,
        slotLabel: slotMeta.label,
        attempt,
        maxAttempts: MAX_SLOT_ATTEMPTS,
        nextRetryHint
      });
      const subRes = await sendTelegramHtmlMessage({ topicId: tId, text: subText });
      if (subRes.messageId) {
        extraNotices.push({ topicId: Number(tId), messageId: subRes.messageId });
      }
    }
  }

  writeHandledAlertMarker({ handled: true, mode: 'delay_notice', slot, attempt });
  return { topic301MsgId, extraNotices, nextRetryHint };
}

async function cleanupResolvedNotices({ slot, attempt, lastNotice = {} }) {
  if (dryRun) return;
  const slotMeta = SLOT_METADATA[slot] || {};
  if (lastNotice?.topic301MsgId) {
    const resolvedText = buildResolvedNoticeMessage({
      slot,
      slotLabel: slotMeta.label,
      attempt: Math.max(attempt, 2),
      maxAttempts: MAX_SLOT_ATTEMPTS
    });
    await editTelegramHtmlMessage({ messageId: lastNotice.topic301MsgId, text: resolvedText });
  }
  if (Array.isArray(lastNotice?.extraNotices)) {
    for (const n of lastNotice.extraNotices) {
      if (n?.messageId) {
        await deleteTelegramMessage({ messageId: n.messageId });
      }
    }
  }
}

let cachedTelegramToken = null;

async function getTelegramToken() {
  if (cachedTelegramToken) return cachedTelegramToken;
  if (neonSql) {
    try {
      const rows = await neonSql`SELECT bot_token FROM telegram_config WHERE id = 'social' LIMIT 1;`;
      if (rows?.[0]?.bot_token) {
        cachedTelegramToken = rows[0].bot_token;
        console.log('[scheduler-dispatch] 🐘 Token Telegram caricato da Neon Database (Zero Supabase)');
        return cachedTelegramToken;
      }
    } catch (neonErr) {
      console.warn('[scheduler-dispatch] Avviso lettura Neon telegram_token:', neonErr.message);
    }
  }
  if (env.TELEGRAM_SOCIAL_BOT_TOKEN) {
    cachedTelegramToken = env.TELEGRAM_SOCIAL_BOT_TOKEN;
    return cachedTelegramToken;
  }
  if (sb) {
    try {
      const { data } = await sb.from('telegram_config').select('bot_token').eq('id', 'social').maybeSingle();
      if (data?.bot_token) {
        cachedTelegramToken = data.bot_token;
        return cachedTelegramToken;
      }
    } catch (err) {
      console.warn('[scheduler-dispatch] Errore lettura telegram_config:', err.message);
    }
  }
  return cachedTelegramToken;
}

// Carica configurazione Google Drive 5TB da Neon (Zero Supabase)
async function getGoogleDriveCredentials() {
  if (neonSql) {
    try {
      const rows = await neonSql`SELECT chat_id FROM telegram_config WHERE id = 'google_drive' LIMIT 1;`;
      if (rows?.[0]?.chat_id) {
        console.log('[scheduler-dispatch] 🐘 Credenziali Google Drive 5TB caricate da Neon Database (Zero Supabase)');
        return JSON.parse(rows[0].chat_id);
      }
    } catch (neonErr) {
      console.warn('[scheduler-dispatch] Avviso lettura Neon google_drive:', neonErr.message);
    }
  }
  try {
    const { data } = await sb.from('telegram_config').select('chat_id').eq('id', 'google_drive').maybeSingle();
    if (data?.chat_id) {
      return JSON.parse(data.chat_id);
    }
  } catch (err) {
    console.warn('[scheduler-dispatch] Errore lettura credenziali Google Drive:', err.message);
  }
  return null;
}

// Cache dell'ID cartella dedicata video per questa esecuzione
let cachedSocialVideosFolderId = null;

// Risolve o crea automaticamente la cartella dedicata "Flower Power Social Videos"
async function getOrCreateSocialVideosFolder(accessToken, parentFolderId = null) {
  if (cachedSocialVideosFolderId) return cachedSocialVideosFolderId;
  const folderName = "Flower Power Social Videos";
  try {
    let q = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`;
    if (parentFolderId) q += ` and '${parentFolderId}' in parents`;

    const searchRes = await fetchWithRetry(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`, () => ({
      headers: { Authorization: `Bearer ${accessToken}` }
    }), { maxAttempts: 3, timeoutMs: 25000, label: 'GDrive SearchFolder' });
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      cachedSocialVideosFolderId = searchData.files[0].id;
      return cachedSocialVideosFolderId;
    }

    // Crea cartella dedicata se non esistente
    const createRes = await fetchWithRetry('https://www.googleapis.com/drive/v3/files?fields=id,name', () => ({
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : []
      })
    }), { maxAttempts: 3, timeoutMs: 25000, label: 'GDrive CreateFolder' });
    const createData = await createRes.json();
    if (createData?.id) {
      cachedSocialVideosFolderId = createData.id;
      console.log(`📁 [Google Drive 5TB] Creata nuova cartella dedicata: "${folderName}" (ID: ${cachedSocialVideosFolderId})`);
      return cachedSocialVideosFolderId;
    }
  } catch (err) {
    console.warn('[scheduler-dispatch] Errore risoluzione cartella Google Drive:', err.message);
  }
  return parentFolderId;
}

// 📁 Upload permanente su Google Drive 5TB (Cassaforte infinita a zero costi)
async function uploadToGoogleDrive({ name, buffer }) {
  if (dryRun) {
    console.log(`[DRY-RUN] Archiviazione Google Drive 5TB: ${name} (${(buffer.length / 1e6).toFixed(1)} MB)`);
    return { ok: true, dryRun: true, id: 'mock_gdrive_id' };
  }

  try {
    const creds = await getGoogleDriveCredentials();
    if (!creds?.client_id || !creds?.client_secret || !creds?.refresh_token) {
      console.warn('[scheduler-dispatch] Credenziali Google Drive non disponibili, upload cloud saltato.');
      return null;
    }

    const tokenRes = await fetchWithRetry("https://oauth2.googleapis.com/token", () => ({
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: creds.client_id,
        client_secret: creds.client_secret,
        refresh_token: creds.refresh_token,
        grant_type: "refresh_token"
      })
    }), { maxAttempts: 3, timeoutMs: 25000, label: 'GDrive OAuth' });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(`Google Drive token refresh failed: ${JSON.stringify(tokenData)}`);
    }

    const accessToken = tokenData.access_token;
    const targetFolderId = await getOrCreateSocialVideosFolder(accessToken, creds.folder_id || null);
    const boundary = "-------FP_DRIVE_BOUNDARY_" + Date.now();
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelim = "\r\n--" + boundary + "--";

    const metadata = {
      name: name,
      parents: targetFolderId ? [targetFolderId] : []
    };

    const metadataPart = delimiter +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(metadata) + "\r\n";

    const fileHeader = "--" + boundary + "\r\n" +
      "Content-Type: video/mp4\r\n\r\n";

    const bodyBuffer = Buffer.concat([
      Buffer.from(metadataPart, "utf8"),
      Buffer.from(fileHeader, "utf8"),
      buffer,
      Buffer.from(closeDelim, "utf8")
    ]);

    console.log(`[scheduler-dispatch] 📁 Archiviazione permanente su Google Drive 5TB (Folder: ${targetFolderId})...`);
    const uploadRes = await fetchWithRetry("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink", () => ({
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
        "Content-Length": bodyBuffer.length.toString()
      },
      body: bodyBuffer
    }), { maxAttempts: 3, timeoutMs: 90000, label: 'GDrive Upload' });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok || !uploadData.id) {
      throw new Error(`Google Drive upload failed: ${JSON.stringify(uploadData)}`);
    }

    console.log(`✅ [Google Drive 5TB] Video archiviato con successo nel Cloud permanente! (File: ${uploadData.name}, ID: ${uploadData.id})`);

    // ⚡ Condivisione pubblica diretta (Zero-Egress Supabase): permette a Meta di scaricare da Google Drive
    try {
      await fetchWithRetry(`https://www.googleapis.com/drive/v3/files/${uploadData.id}/permissions`, () => ({
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ role: "reader", type: "anyone" })
      }), { maxAttempts: 3, timeoutMs: 20000, label: 'GDrive Perms' });
      uploadData.directStreamUrl = `https://drive.usercontent.google.com/download?id=${uploadData.id}&export=download`;
      console.log(`⚡ [Google Drive 5TB] Stream URL pubblico attivo (Zero Supabase Egress, MP4 Diretto): ${uploadData.directStreamUrl}`);
    } catch (permErr) {
      console.warn('[scheduler-dispatch] Permessi pubblici Google Drive warning:', permErr.message);
    }

    return uploadData;
  } catch (gdErr) {
    console.warn('⚠️ [scheduler-dispatch] Avviso archiviazione Google Drive:', gdErr.message);
    return null;
  }
}

// ⚡ Zero-Egress Cloud Video Provider: Google Drive 5TB primario, Supabase Storage solo fallback estremo
async function ensureCloudVideoUrl(filePath) {
  const buf = fs.readFileSync(filePath);
  const fileName = `dispatch_${Date.now()}_${path.basename(filePath)}`;
  const cloudPath = `social_stories/${fileName}`;

  // 1. Archiviazione Permanente su Google Drive 5TB & Generazione Stream URL per Meta (Zero Supabase Egress)
  let videoUrl = null;
  const gdriveRes = await uploadToGoogleDrive({ name: fileName, buffer: buf });
  if (gdriveRes?.directStreamUrl) {
    videoUrl = gdriveRes.directStreamUrl;
    console.log(`[scheduler-dispatch] ⚡ URL Video Diretto Google Drive 5TB pronto per Meta: ${videoUrl}`);
  }

  // 2. 🛡️ ZERO-EGRESS SHIELD: Divieto categorico upload video su Supabase Storage
  if (!videoUrl) {
    console.log(`[scheduler-dispatch] [Zero-Egress Shield] Upload Supabase Storage BLOCCATO preventivamente. Video gestito 100% in memoria locale per upload binario Meta/Telegram.`);
  }

  return { videoUrl: videoUrl || '', buffer: buf };
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Invia post ufficiale completo a Telegram Topic (Video MP4 + Scheda con blocco <pre> + Bottoni interattivi)
// Generatore copy bilingue certificato conforme a tutte le 24 regole dello Social Media Studio

// 🔠 REGOLA 26: Convertitore universale Sans-Serif Bold Unicode (A-Z, a-z, 0-9)
function toUnicodeBold(str) {
  if (!str) return '';
  return str.split('').map(char => {
    const code = char.codePointAt(0) || 0;
    if (code >= 0x41 && code <= 0x5a) {
      return String.fromCodePoint(0x1d5d4 + (code - 0x41));
    }
    if (code >= 0x61 && code <= 0x7a) {
      return String.fromCodePoint(0x1d5ee + (code - 0x61));
    }
    if (code >= 0x30 && code <= 0x39) {
      return String.fromCodePoint(0x1d7ec + (code - 0x30));
    }
    return char;
  }).join('');
}

// 🎯 REGOLA 26: Applica il grassetto Unicode all'Hook iniziale di testa
function applyUnicodeBoldHook(text) {
  if (!text) return '';
  const lines = text.split(/\r?\n/);
  if (lines.length === 0) return '';
  const firstLine = lines[0];
  const flagMatch = firstLine.match(/^(\s*(?:[\u{1F1E6}-\u{1F1FF}]{2}\s*)+)(.*)$/u);
  if (flagMatch) {
    lines[0] = flagMatch[1] + toUnicodeBold(flagMatch[2]);
  } else {
    lines[0] = toUnicodeBold(firstLine);
  }
  return lines.join('\n');
}

// ▫️ REGOLA 26: Sostituzione bullet points con emoji geometrica ▫️ (zero liste HTML in Facebook)
function sanitizeSocialBullets(text) {
  if (!text) return '';
  return text
    .replace(/^([ \t]*)•[ \t]*/gm, '$1▫️ ')
    .replace(/^([ \t]*)-[ \t]+(?=[A-Z0-9\u0E00-\u0E7F])/gm, '$1▫️ ');
}

function getBilingualPostCopy(mode, brand, officialCopy) {
  const isPizza = (brand === 'pizza');

  // 1. Se Chromium ha esportato il copy ufficiale sincronizzato con il montaggio effettivo
  if (officialCopy && (officialCopy.thaiContent || officialCopy.englishContent)) {
    const thai = sanitizeSocialBullets(applyUnicodeBoldHook((officialCopy.thaiContent || '').trim()));
    const en = sanitizeSocialBullets(applyUnicodeBoldHook((officialCopy.englishContent || '').trim()));
    const link = (officialCopy.fixedLink || '').trim();
    const tag = (officialCopy.crossTag || '').trim();
    const tags = Array.from(new Set([...(officialCopy.englishHashtags || []), ...(officialCopy.thaiHashtags || [])])).join(' ');

    if (isPizza) {
      // Pizzeria Ranong: 1° Thai 🇹🇭, 2° Inglese 🇬🇧, Link/Tag, Hashtags in fondo
      return [thai, en, link, tag, tags].filter(Boolean).join('\n\n');
    } else {
      // Villaggio & Koh Phayam: 1° Inglese 🇬🇧, 2° Thai 🇹🇭, Link/Tag, Hashtags in fondo (ZERO ITALIANO)
      return [en, thai, link, tag, tags].filter(Boolean).join('\n\n');
    }
  }

  // 2. Fallback biculturale certificato con biculturalismo rigoroso, zero italiano, zero legna e zero tramonto
  if (mode === 'R1') {
    return sanitizeSocialBullets(applyUnicodeBoldHook(
      `🇬🇧 Craving authentic Italian food on Koh Phayam? Flower Power Restaurant 🍝🍕 is cooking for you in Buffalo Bay!\n\n` +
      `▫️ Artisanal thin-crust Italian pizza 🍕\n` +
      `▫️ Fresh handmade pasta & savory sauces 🍝\n` +
      `▫️ Island favorites cooked from scratch with genuine passion 🌿✨\n\n` +
      `Dine in our lush tropical garden or get hot delivery directly to your resort or bungalow on Koh Phayam! 🛵🌴\n\n` +
      `🛵 Island Delivery via WhatsApp: +66 (0)95.882.5573\n` +
      `🌐 Resort & Dining: flowerpowervillage.com\n` +
      `📍 Buffalo Bay (Ao Khao Kwai), Koh Phayam\n` +
      `@flowerpowerphayam\n\n` +
      `🇹🇭 หิวอาหารอิตาเลียนแท้ๆ บนเกาะพยามใช่ไหมครับ? ครัว Flower Power พร้อมเสิร์ฟความอร่อยครบเครื่อง ริมอ่าวเขาควาย 🍝🍕✨\n\n` +
      `▫️ พิซซ่าอิตาเลียนแท้ แป้งหมักธรรมชาติ 48 ชม. 🍕\n` +
      `▫️ พาสต้าเส้นสดทำเอง ซอสสูตรดั้งเดิมอิตาเลียน 🍝\n` +
      `▫️ ปรุงสดใหม่จานต่อจานด้วยวัตถุดิบคุณภาพ 🌿🔥\n\n` +
      `แวะมาทานที่ร้านท่ามกลางสวนธรรมชาติ หรือสั่งเดลิเวอรี่ส่งตรงถึงที่พักบนเกาะพยามได้เลยครับ! 🛵🌴\n\n` +
      `🛵 สั่งอาหารและเดลิเวอรี่ผ่าน WhatsApp: +66 (0)95.882.5573\n` +
      `🌐 ข้อมูลและที่พัก: flowerpowervillage.com\n` +
      `📍 อ่าวเขาควาย เกาะพยาม จ.ระนอง\n\n` +
      `#KohPhayam #KohPhayamRestaurant #KohPhayamFood #PhayamDelivery #ItalianRestaurantPhayam #BuffaloBay #เกาะพยาม #อ่าวเขาควาย`
    ));
  }

  if (mode === 'V3_SOLDOUT' || mode === 'V1_SOLDOUT') {
    return sanitizeSocialBullets(applyUnicodeBoldHook(
      `🇬🇧 Pure island serenity at Buffalo Bay, Koh Phayam! 🌴✨\n\n` +
      `We are grateful to announce that Flower Power Village is fully booked for tonight! 🌺🙏\n\n` +
      `▫️ Charming wooden bungalows nestled in a lush tropical garden 🌿\n` +
      `▫️ King size beds, private hammocks & high-speed Wi-Fi 📶\n` +
      `▫️ Authentic Italian restaurant & scooter rental on-site 🍝🛵\n\n` +
      `Enjoy this video tour of our resort accommodations! Planning your next tropical getaway? Explore our rooms and reserve your stay in advance with direct booking.\n\n` +
      `🏝️ Direct Booking & Details: flowerpowervillage.com\n` +
      `💬 WhatsApp Concierge: +66 (0)95.882.5573\n` +
      `📍 Buffalo Bay, Koh Phayam Island\n` +
      `@flowerpowerphayam\n\n` +
      `🇹🇭 สัมผัสความเงียบสงบในธรรมชาติที่อ่าวเขาควาย เกาะพยาม 🌴✨\n\n` +
      `คืนนี้ที่พัก Flower Power Village เต็มทุกห้องแล้วนะครับ ขอขอบคุณลูกค้าทุกท่านที่ให้การสนับสนุนเป็นอย่างดีครับ! 🌺🙏\n\n` +
      `▫️ บังกะโลไม้ส่วนตัวท่ามกลางสวนทรอปิคอลเขียวขจี 🌿\n` +
      `▫️ เตียงคิงไซส์ เปลญวนพักผ่อน และอินเทอร์เน็ตความเร็วสูง 📶\n` +
      `▫️ ร้านอาหารอิตาเลียนแท้ และบริการเช่ามอเตอร์ไซค์ 🍝🛵\n\n` +
      `ชมบรรยากาศบ้านพักแต่ละแบบในคลิปนี้ได้เลยครับ! วางแผนพักผ่อนรอบถัดไป จองตรงล่วงหน้ากับเราได้ตลอดเวลานะครับ\n\n` +
      `🏝️ จองตรงสะดวกและรวดเร็ว: flowerpowervillage.com\n` +
      `💬 ติดต่อสอบถามทาง WhatsApp: +66 (0)95.882.5573\n` +
      `📍 อ่าวเขาควาย เกาะพยาม จ.ระนอง\n\n` +
      `#KohPhayam #PhayamBungalow #KohPhayamResort #BuffaloBay #TropicalEscape #ThailandTravel #เกาะพยาม #ที่พักเกาะพยาม #อ่าวเขาควาย`
    ));
  }

  if (mode === 'LM1') {
    const upcomingFile = path.join(outDir, 'LM1.upcoming.json');
    let upcomingData = null;
    if (fs.existsSync(upcomingFile)) {
      try { upcomingData = JSON.parse(fs.readFileSync(upcomingFile, 'utf8')); } catch { }
    }

    if (upcomingData && upcomingData.isSoldOutTonight && Array.isArray(upcomingData.upcomingRooms) && upcomingData.upcomingRooms.length > 0) {
      const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });

      const enRooms = upcomingData.upcomingRooms.map(r => {
        const isTomorrow = r.dateStr === tomorrow;
        const prefix = isTomorrow ? `Tomorrow ${r.dateLabel}` : r.dateLabel;
        return `▫️ ${prefix}: ${r.lodgingTitle} — ${r.livePrice.toLocaleString('en-US')} ฿ 🌿`;
      }).join('\n');

      const thRooms = upcomingData.upcomingRooms.map(r => {
        const isTomorrow = r.dateStr === tomorrow;
        const prefix = isTomorrow ? `พรุ่งนี้ ${r.dateLabel}` : r.dateLabel;
        return `▫️ ${prefix}: ${r.lodgingTitle} — ${r.livePrice.toLocaleString('en-US')} ฿ 🌿`;
      }).join('\n');

      return sanitizeSocialBullets(applyUnicodeBoldHook(
        `🇬🇧 𝗙𝗨𝗟𝗟𝗬 𝗕𝗢𝗢𝗞𝗘𝗗 𝗧𝗢𝗡𝗜𝗚𝗛𝗧! 𝗛𝘂𝗿𝗿𝘆 𝘁𝗼 𝗯𝗼𝗼𝗸 𝘁𝗵𝗲 𝗻𝗲𝘅𝘁 𝗮𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲 𝗿𝗼𝗼𝗺𝘀 𝗯𝗲𝗳𝗼𝗿𝗲 𝘁𝗵𝗲𝘆 𝗮𝗿𝗲 𝗴𝗼𝗻𝗲! 🏃💨🌴\n\n` +
        `${enRooms}\n\n` +
        `Go directly to our website flowerpowervillage.com to get a 10% discount! 🏝️✨\n\n` +
        `🌐 flowerpowervillage.com\n` +
        `💬 WhatsApp: +66 (0)95.882.5573\n` +
        `📍 Buffalo Bay, Koh Phayam Island\n` +
        `@flowerpowerphayam\n\n` +
        `🇹🇭 วันนี้ห้องพักเต็ม 100%! รีบจองห้องว่างรอบถัดไปก่อนจะหมดนะครับ 🏃💨🌴\n\n` +
        `${thRooms}\n\n` +
        `จองตรงผ่านเว็บไซต์ flowerpowervillage.com รับส่วนลดทันที 10%! 🏝️✨\n\n` +
        `🌐 flowerpowervillage.com\n` +
        `💬 WhatsApp: +66 (0)95.882.5573\n` +
        `📍 อ่าวเขาควาย เกาะพยาม จ.ระนอง\n\n` +
        `#KohPhayam #PhayamBungalow #KohPhayamResort #BuffaloBay #TropicalEscape #ThailandTravel #เกาะพยาม #ที่พักเกาะพยาม #อ่าวเขาควาย`
      ));
    }

    return sanitizeSocialBullets(applyUnicodeBoldHook(
      `🇬🇧 Looking for peaceful bungalows surrounded by tropical greenery in Koh Phayam? 🌴✨\n\n` +
      `Today we have vacant rooms and private wooden bungalows at Buffalo Bay with instant direct booking discount!\n\n` +
      `▫️ Superior & Deluxe Garden Bungalows 🌿\n` +
      `▫️ King size beds, private hammocks & high-speed fiber Wi-Fi 📶\n` +
      `▫️ On-site authentic Italian restaurant & scooter rental 🛵🍕\n\n` +
      `🏝️ Check live rates & book direct: flowerpowervillage.com\n` +
      `💬 WhatsApp Staff: +66 (0)95.882.5573\n` +
      `📍 Buffalo Bay, Koh Phayam Island\n` +
      `@flowerpowerphayam\n\n` +
      `🇹🇭 พักผ่อนท่ามกลางสวนธรรมชาติอ่าวเขาควาย เกาะพยาม 🌴 ห้องพักว่างวันนี้พร้อมส่วนลดจองตรงพิเศษ!\n\n` +
      `▫️ บังกะโลไม้ส่วนตัวและห้องพักในสวนทรอปิคอล 🌿\n` +
      `▫️ เตียงคิงไซส์ เปลญวนส่วนตัว และ Wi-Fi ไฟเบอร์ความเร็วสูง 📶\n` +
      `▫️ ร้านอาหารอิตาเลียนในที่พัก และบริการเช่ามอเตอร์ไซค์ 🛵🍕\n\n` +
      `🏝️ จองตรงราคาดีที่สุด: flowerpowervillage.com\n` +
      `💬 ติดต่อสอบถามทาง WhatsApp: +66 (0)95.882.5573\n` +
      `📍 อ่าวเขาควาย เกาะพยาม จ.ระนอง\n\n` +
      `#KohPhayam #PhayamBungalow #KohPhayamResort #BuffaloBay #ThailandTravel #เกาะพยาม #ที่พักเกาะพยาม #อ่าวเขาควาย`
    ));
  }

  if (!isPizza) {
    // Villaggio: V1, V2, V3 (1° Inglese, 2° Thai, Zero Sunset/Tramonto, Zero Italiano)
    return sanitizeSocialBullets(applyUnicodeBoldHook(
      `🇬🇧 Pure island serenity at Buffalo Bay, Koh Phayam! 🌴 Lush tropical greenery, king size beds and peaceful nature. Escape the ordinary and unwind in comfort. 🌿✨\n\n` +
      `🏝️ Direct booking: flowerpowervillage.com\n` +
      `📍 Buffalo Bay, Koh Phayam Island\n` +
      `@flowerpowerphayam\n\n` +
      `🇹🇭 ความสุขที่แท้จริงคือความเงียบสงบในธรรมชาติ เกาะพยาม 🌴 พักผ่อนในสวนทรอปิคอลเขียวขจี อ่าวเขาควาย บรรยากาศร่มรื่นและความสงบสุข 🌿✨\n\n` +
      `🏝️ จองตรงราคาดีที่สุด: flowerpowervillage.com\n` +
      `📍 อ่าวเขาควาย เกาะพยาม จ.ระนอง\n\n` +
      `#KohPhayam #BuffaloBay #PhayamIsland #TropicalResort #RanongTravel #เกาะพยาม #อ่าวเขาควาย #เที่ยวระนอง`
    ));
  }

  // Pizzeria: P2 Pasta
  if (mode === 'P2') {
    return sanitizeSocialBullets(applyUnicodeBoldHook(
      `🇹🇭 เมนูกลางวันอร่อยๆ ในระนอง! พาสต้าเส้นสดทำเอง ซอสสูตรดั้งเดิมอิตาเลียนแท้ เสิร์ฟร้อนๆ ถึงบ้านหรือออฟฟิศ 🍝🛵💨\n\n` +
      `🛵 สั่งง่ายๆ ส่งไว: flowerpowerpizza.com\n` +
      `📍 Ranong Delivery & Takeaway\n` +
      `@flowerpowerpizzaranong\n\n` +
      `🇬🇧 Homemade fresh pasta ready for lunch delivery in Ranong! Rich sauces and authentic Italian flavors delivered hot. 🍝🛵💨\n\n` +
      `🛵 Order now: flowerpowerpizza.com\n` +
      `📍 Ranong Delivery & Takeaway\n` +
      `@flowerpowerpizzaranong\n\n` +
      `#พาสต้าระนอง #RanongPasta #LunchRanong #DeliveryRanong #PastaFresca`
    ));
  }

  // Pizzeria: P3 Dessert
  if (mode === 'P3') {
    return sanitizeSocialBullets(applyUnicodeBoldHook(
      `🇹🇭 ของหวานโฮมเมดสไตล์อิตาเลียนแท้ ปิดท้ายมื้อค่ำในระนอง! ทิรามิสุคลาสสิกและเค้กอบสดใหม่ หวานนุ่มละมุนลิ้น 🍰☕✨\n\n` +
      `🛵 สั่งของหวานส่งถึงบ้าน: flowerpowerpizza.com\n` +
      `📍 Ranong Delivery & Takeaway\n` +
      `@flowerpowerpizzaranong\n\n` +
      `🇬🇧 Authentic homemade Italian desserts in Ranong! Classic tiramisù and artisan sweets to end your dinner perfectly. 🍰☕✨\n\n` +
      `🛵 Order now: flowerpowerpizza.com\n` +
      `📍 Ranong Delivery & Takeaway\n` +
      `@flowerpowerpizzaranong\n\n` +
      `#RanongDessert #TiramisuRanong #ของหวานระนอง #RanongFood #DeliveryRanong`
    ));
  }

  // Pizzeria: P1 Pizza Tradizionale
  return sanitizeSocialBullets(applyUnicodeBoldHook(
    `🇹🇭 พิซซ่าอิตาเลียนแท้ แป้งหมักธรรมชาติ 48 ชม. อบร้อนหอมกรอบบนหิน พร้อมส่งตรงถึงบ้านในเมืองระนอง! 🍕🔥🛵💨\n\n` +
    `🛵 สั่งง่ายๆ ส่งไว: flowerpowerpizza.com\n` +
    `📍 Ranong Delivery & Takeaway\n` +
    `@flowerpowerpizzaranong\n\n` +
    `🇬🇧 Authentic traditional Italian pizza in Ranong! Slow 48h natural proofing baked hot on stone. Piping hot home delivery! 🍕🔥🛵💨\n\n` +
    `🛵 Order now: flowerpowerpizza.com\n` +
    `📍 Ranong Delivery & Takeaway\n` +
    `@flowerpowerpizzaranong\n\n` +
    `#พิซซ่าระนอง #RanongPizza #DinnerRanong #RanongFood #DeliveryRanong`
  ));
}

// Invia post ufficiale completo a Telegram Topic:
// - Topic 3 (Stories): SOLO VIDEO STREAMING CON PULSANTI SOTTO (Zero box testo ridondante)
// - Topic 2 (Gruppo FB): VIDEO + SCHEDA TESTO CON <pre> BILINGUE E GUIDA COPIA
async function sendOfficialTelegramPost({ topicId, title, format, brand, priceBadge, copyText = '', filePath, videoUrl }) {
  if (dryRun) {
    console.log(`[DRY-RUN] Invierei su Telegram Topic ${topicId}: ${format} (${title})\n${copyText}`);
    return { ok: true, dryRun: true };
  }

  const token = await getTelegramToken();
  if (!token) throw new Error('Token Telegram non trovato!');

  const hasLocalFile = filePath && fs.existsSync(filePath);
  const fileBuf = hasLocalFile ? fs.readFileSync(filePath) : null;
  const fileName = hasLocalFile ? `dispatch_${Date.now()}_${path.basename(filePath)}` : null;

  // 🛡️ Archiviazione permanente su Google Drive 5TB (Zero Egress Supabase, illimitato e gratuito)
  if (hasLocalFile && fileBuf) {
    uploadToGoogleDrive({ name: fileName, buffer: fileBuf }).catch(err => {
      console.warn('[scheduler-dispatch] Google Drive background archive warning:', err.message);
    });
  }

  let finalUrl = videoUrl;
  if (!finalUrl && !hasLocalFile && filePath) {
    const uploaded = await ensureCloudVideoUrl(filePath);
    finalUrl = uploaded.videoUrl;
  }

  const isTopic2 = (topicId === TOPIC_KOH_PHAYAM_GROUP);
  const isStories = (topicId === TOPIC_TIKTOK_STORIES);
  const icon = isTopic2 ? '🌴' : '📱';
  const brandName = brand === 'pizza'
    ? '🍕 Flower Power Pizza (Ranong)'
    : format === 'R1'
      ? '🍽️ Flower Power Restaurant & Village (Koh Phayam)'
      : '🌺 Flower Power Village (Koh Phayam)';

  // 1. Canale Stories (Topic 3): INVIO PULITO DIRETTO DEL SOLO VIDEO CON TASTI RAPIDI (Zero testo ridondante)
  if (isStories) {
    const storyButtons = [
      [{ text: '📱 Apri TikTok Stories', url: 'https://www.tiktok.com/' }]
    ];

    let vidJson;
    if (hasLocalFile && fileBuf) {
      console.log(`[scheduler-dispatch] Invio Video Stories MP4 (${format}) diretto via streaming multipart (Zero Egress Supabase) a Topic ${topicId}...`);
      const vidRes = await fetchWithRetry(`https://api.telegram.org/bot${token}/sendVideo`, () => {
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('message_thread_id', String(topicId));
        formData.append('video', new Blob([fileBuf], { type: 'video/mp4' }), fileName);
        formData.append('caption', `📱 <b>${title}</b>\n🎬 Format: ${format} · 🏷️ Brand: ${brandName}`);
        formData.append('parse_mode', 'HTML');
        formData.append('supports_streaming', 'true');
        formData.append('width', '1080');
        formData.append('height', '1920');
        formData.append('reply_markup', JSON.stringify({ inline_keyboard: storyButtons }));
        return { method: 'POST', body: formData };
      }, { maxAttempts: 3, timeoutMs: 120000, label: 'Telegram Stories sendVideo' });
      vidJson = await vidRes.json();
    } else {
      console.log(`[scheduler-dispatch] Invio Video Stories MP4 (${format}) con pulsanti rapidi via URL a Topic ${topicId}...`);
      const vidRes = await fetchWithRetry(`https://api.telegram.org/bot${token}/sendVideo`, () => ({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_thread_id: topicId,
          video: finalUrl,
          caption: `📱 <b>${title}</b>\n🏢 <b>Brand:</b> ${brandName}\n🎬 Format: ${format}`,
          parse_mode: 'HTML',
          supports_streaming: true,
          width: 1080,
          height: 1920,
          reply_markup: { inline_keyboard: storyButtons }
        })
      }), { maxAttempts: 3, timeoutMs: 45000, label: 'Telegram Stories sendVideo URL' });
      vidJson = await vidRes.json();
    }
    if (!vidJson?.ok) {
      throw new Error(`Telegram sendVideo failed (Topic ${topicId}): ${vidJson?.description || JSON.stringify(vidJson)}`);
    }
    console.log(`✅ [scheduler-dispatch] Video Stories recapitato con successo a Topic ${topicId} (senza scheda testo ridondante)!`);
    return { ok: true, vidJson };
  }

  // 2. Canale Gruppo Facebook (Topic 2): Invio Video Streaming
  if (hasLocalFile && fileBuf) {
    console.log(`[scheduler-dispatch] Invio file video streaming (${format}) diretto via streaming multipart (Zero Egress Supabase) a Topic ${topicId}...`);
    const vidRes = await fetchWithRetry(`https://api.telegram.org/bot${token}/sendVideo`, () => {
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('message_thread_id', String(topicId));
      formData.append('video', new Blob([fileBuf], { type: 'video/mp4' }), fileName);
      formData.append('caption', `${icon} <b>${title}</b>\n🎬 Format: ${format} · 🏷️ Brand: ${brandName}`);
      formData.append('parse_mode', 'HTML');
      formData.append('supports_streaming', 'true');
      formData.append('width', '1080');
      formData.append('height', '1920');
      return { method: 'POST', body: formData };
    }, { maxAttempts: 3, timeoutMs: 120000, label: 'Telegram Topic2 sendVideo' });
    const vidJson = await vidRes.json();
    if (!vidJson?.ok) {
      throw new Error(`Telegram sendVideo failed (Topic ${topicId}): ${vidJson?.description || JSON.stringify(vidJson)}`);
    }
  } else if (finalUrl) {
    console.log(`[scheduler-dispatch] Invio file video streaming (${format}) via URL a Topic ${topicId}...`);
    const vidRes = await fetchWithRetry(`https://api.telegram.org/bot${token}/sendVideo`, () => ({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_thread_id: topicId,
        video: finalUrl,
        caption: `${icon} <b>${title}</b>\n🏢 <b>Brand:</b> ${brandName}\n🎬 Format: ${format}`,
        parse_mode: 'HTML',
        supports_streaming: true,
        width: 1080,
        height: 1920
      })
    }), { maxAttempts: 3, timeoutMs: 45000, label: 'Telegram Topic2 sendVideo URL' });
    const vidJson = await vidRes.json();
    if (!vidJson?.ok) {
      throw new Error(`Telegram sendVideo failed (Topic ${topicId}): ${vidJson?.description || JSON.stringify(vidJson)}`);
    }
  }

  // 3. Canale Gruppo Facebook (Topic 2): Scheda Testo con <pre> e guida rapida
  let messageText = `${icon} <b>${title}</b>\n`;
  messageText += `🎬 <b>Format:</b> ${format} | 🏷️ <b>Brand:</b> ${brandName}\n`;
  if (priceBadge) {
    messageText += `💰 <b>Prezzo Offerta:</b> ${priceBadge}\n`;
  }
  messageText += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  messageText += `📋 <b>TESTO DA COPIARE PER IL POST:</b>\n`;
  messageText += `<i>👇 Clicca o tocca il riquadro qui sotto: il testo viene copiato istantaneamente negli appunti!</i>\n\n`;
  messageText += `<pre>${escapeHtml(copyText.trim())}</pre>\n`;
  messageText += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  messageText += `👉 <b>Come pubblicare in 3 secondi:</b>\n`;
  messageText += `1️⃣ Clicca sul riquadro col testo sopra per copiarlo negli appunti\n`;
  messageText += `2️⃣ Clicca sul tasto sotto <b>"🌐 Vai al Gruppo Koh Phayam"</b>\n`;
  messageText += `3️⃣ <b>Incolla nel post Facebook allegando il video:</b>\n`;
  messageText += `   • 💻 <i>Da Computer (PC/Mac):</i> premi <code>Ctrl + Shift + V</code>\n`;
  messageText += `   • 📱 <i>Da Telefono/Tablet:</i> tieni premuto e incolla! 🚀`;

  const inlineKeyboard = [];
  const cleanCopy = copyText.trim();
  if (cleanCopy.length <= 256) {
    inlineKeyboard.push([{ text: '📋 Copia Testo Post (1 Tocco)', copy_text: { text: cleanCopy } }]);
  }
  inlineKeyboard.push([{ text: '🌐 Vai al Gruppo Koh Phayam', url: 'https://www.facebook.com/share/g/1Hyh1mJ7Hu/' }]);
  // Download superfluo: file video gia' inviato nativamente nel messaggio Telegram

  console.log(`[scheduler-dispatch] Invio Scheda Testo con Pulsanti per ${format} a Topic ${topicId}...`);
  const msgRes = await fetchWithRetry(`https://api.telegram.org/bot${token}/sendMessage`, () => ({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_thread_id: topicId,
      text: messageText,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: { inline_keyboard: inlineKeyboard }
    })
  }), { maxAttempts: 3, timeoutMs: 30000, label: 'Telegram Topic2 sendMessage' });
  const msgJson = await msgRes.json();
  if (!msgJson.ok) {
    console.error(`[scheduler-dispatch] Errore invio scheda testo Telegram:`, msgJson);
    throw new Error(`Telegram sendMessage failed (Topic ${topicId}): ${msgJson?.description || JSON.stringify(msgJson)}`);
  }
  console.log(`✅ [scheduler-dispatch] Scheda con pulsanti consegnata con successo a Topic ${topicId}!`);
  return { ok: true, msgJson };
}

async function sendVideoToTelegram({ filePath, topicId, caption, videoUrl }) {
  return sendOfficialTelegramPost({
    topicId,
    title: 'Contenuto Social Media Studio',
    format: 'Video',
    brand: 'village',
    copyText: caption,
    filePath,
    videoUrl
  });
}

// 🌐 Pubblicazione automatica su Pagina Facebook (Reels o 24h Stories)
async function publishToFacebook({ videoUrl, videoBuffer, title = '', caption = '', brand = 'pizza', isStory = false }) {
  if (dryRun) {
    console.log(`[DRY-RUN] Pubblicazione Facebook (${brand}, isStory: ${isStory}) con URL: ${videoUrl}`);
    return { ok: true, dryRun: true, id: 'mock_fb_id' };
  }

  const isPizza = (brand === 'pizza');
  const pageId = isPizza ? (env.META_PIZZA_PAGE_ID || '410856732111386') : (env.META_VILLAGE_PAGE_ID || '106883044573670');
  const pageToken = isPizza ? env.META_PIZZA_PAGE_TOKEN : env.META_VILLAGE_PAGE_TOKEN;

  if (!pageToken) {
    throw new Error(`Meta Page Token mancante per ${brand}`);
  }

  if (isStory) {
    console.log(`[scheduler-dispatch] Inizio pubblicazione Facebook Story (Page ID: ${pageId})...`);
    const startRes = await fetchWithRetry(`https://graph.facebook.com/v19.0/${pageId}/video_stories?upload_phase=start&access_token=${pageToken}`, () => ({
      method: 'POST'
    }), { maxAttempts: 3, timeoutMs: 45000, label: 'FB Stories start' });
    const startData = await startRes.json();
    if (!startRes.ok || !startData.upload_url || !startData.video_id) {
      throw new Error(`FB Stories start failed: ${JSON.stringify(startData.error || startData)}`);
    }

    const vBuf = videoBuffer || Buffer.from(await (await fetchWithRetry(videoUrl, () => ({}), { maxAttempts: 3, timeoutMs: 90000, label: 'FB Stories fetch video' })).arrayBuffer());
    const upRes = await fetchWithRetry(startData.upload_url, () => ({
      method: 'POST',
      headers: {
        'Authorization': `OAuth ${pageToken}`,
        'offset': '0',
        'file_size': String(vBuf.length),
        'Content-Type': 'application/octet-stream',
        'Content-Length': String(vBuf.length)
      },
      body: vBuf
    }), { maxAttempts: 3, timeoutMs: 120000, label: 'FB Stories rupload' });
    const upData = await upRes.json().catch(() => ({}));
    if (!upRes.ok || upData.error) {
      throw new Error(`FB Stories binary upload failed: ${JSON.stringify(upData.error || upData || upRes.status)}`);
    }

    const finishRes = await fetchWithRetry(`https://graph.facebook.com/v19.0/${pageId}/video_stories`, () => {
      const fParams = new URLSearchParams();
      fParams.append('access_token', pageToken);
      fParams.append('upload_phase', 'finish');
      fParams.append('video_id', startData.video_id);
      return { method: 'POST', body: fParams };
    }, { maxAttempts: 3, timeoutMs: 45000, label: 'FB Stories finish' });
    const finishData = await finishRes.json();
    if (!finishRes.ok || finishData.error) {
      throw new Error(`FB Stories finish failed: ${JSON.stringify(finishData.error || finishData)}`);
    }
    const storyId = finishData.post_id || startData.video_id;
    console.log(`🎉 [scheduler-dispatch] Facebook Story pubblicata con successo! (ID: ${storyId})`);
    return { ok: true, id: storyId };
  } else {
    console.log(`[scheduler-dispatch] Inizio pubblicazione Facebook REEL 9:16 nativo (Page ID: ${pageId})...`);
    const postDesc = (caption || title || '').slice(0, 5000);

    // 🎬 METODO PRIMARIO: Meta Reels API (video_reels a 3 fasi) per visualizzazione Full-Width 9:16 senza miniature
    try {
      console.log(`[scheduler-dispatch] Avvio sessione Facebook video_reels (Page ID: ${pageId})...`);
      const reelStartRes = await fetchWithRetry(`https://graph.facebook.com/v19.0/${pageId}/video_reels?upload_phase=start&access_token=${pageToken}`, () => ({
        method: 'POST'
      }), { maxAttempts: 3, timeoutMs: 45000, label: 'FB Reels start' });
      const reelStartData = await reelStartRes.json();
      console.log('[scheduler-dispatch] Facebook video_reels start response:', reelStartData);

      if (reelStartRes.ok && reelStartData.upload_url && reelStartData.video_id) {
        // Step 2: Fetch video e upload binario su rupload.facebook.com
        const vBuf = videoBuffer || Buffer.from(await (await fetchWithRetry(videoUrl, () => ({}), { maxAttempts: 3, timeoutMs: 90000, label: 'FB Reels fetch video' })).arrayBuffer());
        const upRes = await fetchWithRetry(reelStartData.upload_url, () => ({
          method: 'POST',
          headers: {
            'Authorization': `OAuth ${pageToken}`,
            'offset': '0',
            'file_size': String(vBuf.length),
            'Content-Type': 'application/octet-stream',
            'Content-Length': String(vBuf.length)
          },
          body: vBuf
        }), { maxAttempts: 3, timeoutMs: 120000, label: 'FB Reels rupload' });
        const upData = await upRes.json().catch(() => ({}));
        console.log('[scheduler-dispatch] Facebook video_reels binary upload response:', upData);

        if (!upRes.ok || upData.error) {
          throw new Error(`FB Reels binary upload failed: ${JSON.stringify(upData.error || upData || upRes.status)}`);
        }

        // Step 3: Finalizzazione e pubblicazione Reel a schermo intero (video_state=PUBLISHED)
        const finishRes = await fetchWithRetry(`https://graph.facebook.com/v19.0/${pageId}/video_reels`, () => {
          const fParams = new URLSearchParams();
          fParams.append('access_token', pageToken);
          fParams.append('upload_phase', 'finish');
          fParams.append('video_id', reelStartData.video_id);
          fParams.append('video_state', 'PUBLISHED');
          if (postDesc) fParams.append('description', postDesc);
          if (title) fParams.append('title', title.slice(0, 255));
          return { method: 'POST', body: fParams };
        }, { maxAttempts: 3, timeoutMs: 45000, label: 'FB Reels finish' });
        const finishData = await finishRes.json();
        console.log('[scheduler-dispatch] Facebook video_reels finish response:', finishData);

        if (finishRes.ok && !finishData.error) {
          const reelId = reelStartData.video_id;
          console.log(`🎉 [scheduler-dispatch] Facebook REEL 9:16 nativo pubblicato con successo! (Reel ID: ${reelId})`);
          return { ok: true, id: reelId, postUrl: `https://www.facebook.com/reel/${reelId}`, isReel: true };
        } else {
          console.warn('[scheduler-dispatch] Errore finish video_reels, fallback su endpoint standard:', finishData);
        }
      } else {
        console.warn('[scheduler-dispatch] video_reels start non riuscito, fallback su endpoint standard:', reelStartData);
      }
    } catch (reelErr) {
      console.warn('[scheduler-dispatch] Eccezione video_reels, fallback su legacy videos:', reelErr.message);
    }

    // 🛡️ FALLBACK DI SICUREZZA: Endpoint legacy /videos se video_reels non è disponibile
    console.log(`[scheduler-dispatch] Esecuzione fallback legacy /videos (Page ID: ${pageId})...`);
    const fbRes = await fetchWithRetry(`https://graph.facebook.com/v19.0/${pageId}/videos`, () => {
      const params = new URLSearchParams();
      params.append('access_token', pageToken);
      params.append('file_url', videoUrl);
      if (postDesc) params.append('description', postDesc);
      if (title) params.append('title', title.slice(0, 255));
      return { method: 'POST', body: params };
    }, { maxAttempts: 3, timeoutMs: 60000, label: 'FB Legacy videos' });
    const fbData = await fbRes.json();
    if (!fbRes.ok || fbData.error) {
      throw new Error(`FB Reel publish failed: ${JSON.stringify(fbData.error || fbData)}`);
    }
    console.log(`🎉 [scheduler-dispatch] Facebook Reel pubblicato con successo (legacy)! (Video ID: ${fbData.id})`);
    return { ok: true, id: fbData.id, postUrl: `https://www.facebook.com/${fbData.id}` };
  }
}

// 📸 Pubblicazione automatica su Instagram (Reels o 24h Stories) con upload binario Zero-Egress
async function publishToInstagram({ videoUrl, videoBuffer, caption = '', brand = 'village', isStory = false }) {
  if (dryRun) {
    console.log(`[DRY-RUN] Pubblicazione Instagram (${brand}, isStory: ${isStory}) con URL: ${videoUrl || 'binary-buffer'}`);
    return { ok: true, dryRun: true, id: 'mock_ig_id' };
  }

  const isPizza = (brand === 'pizza');
  const pageId = isPizza ? (env.META_PIZZA_PAGE_ID || '410856732111386') : (env.META_VILLAGE_PAGE_ID || '106883044573670');
  const pageToken = isPizza ? env.META_PIZZA_PAGE_TOKEN : env.META_VILLAGE_PAGE_TOKEN;
  let igId = isPizza ? (env.META_PIZZA_IG_ID || '17841468753633265') : (env.META_VILLAGE_IG_ID || '17841404137072110');

  if (!pageToken) {
    throw new Error(`Meta Page Token mancante per ${brand}`);
  }

  try {
    const pageInfoRes = await fetchWithRetry(`https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${pageToken}`, () => ({}), {
      maxAttempts: 2,
      timeoutMs: 20000,
      label: 'IG Resolve Account'
    });
    if (pageInfoRes.ok) {
      const pageInfo = await pageInfoRes.json();
      if (pageInfo?.instagram_business_account?.id) {
        igId = pageInfo.instagram_business_account.id;
      }
    }
  } catch { }

  let creationId = null;

  // ⚡ METODO PRIMARIO ZERO-EGRESS: Upload binario diretto su rupload.facebook.com (zero download da Supabase)
  if (videoBuffer && videoBuffer.length > 0) {
    try {
      console.log(`[scheduler-dispatch] Tentativo upload binario diretto Instagram (Zero-Egress Supabase, ${(videoBuffer.length / 1024 / 1024).toFixed(1)} MB)...`);
      const rRes = await fetchWithRetry(`https://graph.facebook.com/v19.0/${igId}/media`, () => {
        const rParams = new URLSearchParams();
        rParams.append('access_token', pageToken);
        rParams.append('upload_type', 'resumable');
        rParams.append('media_type', isStory ? 'STORIES' : 'REELS');
        if (!isStory) {
          rParams.append('share_to_feed', 'true');
          if (caption) rParams.append('caption', caption.slice(0, 2200));
        }
        return { method: 'POST', body: rParams };
      }, { maxAttempts: 3, timeoutMs: 45000, label: 'IG Resumable Session' });
      const rData = await rRes.json();
      if (rRes.ok && rData.id) {
        const uploadUri = rData.uri || `https://rupload.facebook.com/ig-api-upload/v19.0/${rData.id}`;
        console.log(`[scheduler-dispatch] Uploading binary to Instagram rupload: ${uploadUri}...`);
        const upRes = await fetchWithRetry(uploadUri, () => ({
          method: 'POST',
          headers: {
            'Authorization': `OAuth ${pageToken}`,
            'offset': '0',
            'file_size': String(videoBuffer.length),
            'Content-Type': 'application/octet-stream',
            'Content-Length': String(videoBuffer.length)
          },
          body: videoBuffer
        }), { maxAttempts: 3, timeoutMs: 120000, label: 'IG Binary Upload' });
        const upData = await upRes.json().catch(() => ({}));
        if (upRes.ok || upData.success) {
          creationId = rData.id;
          console.log(`🎉 [scheduler-dispatch] Upload binario Instagram completato senza consumare banda Supabase! (Container ID: ${creationId})`);
        } else {
          console.warn('[scheduler-dispatch] Upload binario Instagram rupload non riuscito, fallback su URL:', upData);
        }
      } else {
        console.warn('[scheduler-dispatch] Creazione sessione resumable Instagram non riuscita, fallback su URL:', rData);
      }
    } catch (resumableErr) {
      console.warn('[scheduler-dispatch] Errore upload binario Instagram, fallback su URL:', resumableErr.message);
    }
  }

  // 🛡️ FALLBACK: Se l'upload binario non è riuscito o manca il buffer, usiamo il parametro video_url standard
  if (!creationId && videoUrl) {
    console.log(`[scheduler-dispatch] Creazione container Instagram via URL ${isStory ? 'STORIES' : 'REELS'} (IG ID: ${igId})...`);
    const cRes = await fetchWithRetry(`https://graph.facebook.com/v19.0/${igId}/media`, () => {
      const cParams = new URLSearchParams();
      cParams.append('access_token', pageToken);
      cParams.append('media_type', isStory ? 'STORIES' : 'REELS');
      cParams.append('video_url', videoUrl);
      if (!isStory) {
        cParams.append('share_to_feed', 'true');
        if (caption) cParams.append('caption', caption.slice(0, 2200));
      }
      return { method: 'POST', body: cParams };
    }, { maxAttempts: 3, timeoutMs: 45000, label: 'IG URL Container' });
    const cData = await cRes.json();
    if (!cRes.ok || !cData.id) {
      throw new Error(`IG Container creation failed: ${JSON.stringify(cData.error || cData)}`);
    }
    creationId = cData.id;
  }

  if (!creationId) {
    throw new Error('Impossibile creare container Instagram (né via binario diretto né via URL)');
  }

  console.log(`[scheduler-dispatch] Attesa elaborazione container Instagram (ID: ${creationId})...`);
  let isReady = false;
  const maxPolls = 40; // fino a 200 secondi (3.3 minuti per transcodifica Meta 60 FPS)
  for (let i = 0; i < maxPolls; i++) {
    await new Promise(r => setTimeout(r, 5000));
    try {
      const sRes = await fetchWithRetry(`https://graph.facebook.com/v19.0/${creationId}?fields=status_code,status&access_token=${pageToken}`, () => ({}), {
        maxAttempts: 2,
        timeoutMs: 20000,
        label: 'IG Status Poll'
      });
      if (sRes.ok) {
        const sData = await sRes.json();
        const st = sData.status_code || sData.status;
        console.log(`[scheduler-dispatch] Status container IG (${i + 1}/${maxPolls}): ${st}`);
        if (st === 'FINISHED') {
          isReady = true;
          break;
        }
        if (st === 'ERROR') {
          throw new Error(`IG Video processing error: ${JSON.stringify(sData)}`);
        }
      }
    } catch (pollErr) {
      if (String(pollErr.message || '').includes('IG Video processing error')) throw pollErr;
      console.warn(`[scheduler-dispatch] Avviso poll container IG (${i + 1}/${maxPolls}):`, pollErr.message);
    }
  }

  if (!isReady) {
    throw new Error(`IG Video processing timeout (superati i 200s di elaborazione Meta)`);
  }

  const pRes = await fetchWithRetry(`https://graph.facebook.com/v19.0/${igId}/media_publish`, () => {
    const pParams = new URLSearchParams();
    pParams.append('access_token', pageToken);
    pParams.append('creation_id', creationId);
    return { method: 'POST', body: pParams };
  }, { maxAttempts: 3, timeoutMs: 45000, label: 'IG Media Publish' });
  const pData = await pRes.json();
  if (!pRes.ok || !pData.id) {
    throw new Error(`IG media_publish failed: ${JSON.stringify(pData.error || pData)}`);
  }
  console.log(`🎉 [scheduler-dispatch] Instagram ${isStory ? 'Story' : 'Reel'} pubblicata con successo! (Media ID: ${pData.id})`);
  return { ok: true, id: pData.id };
}

// 🎵 Helper TikTok Token con Auto-Refresh trasparente (Pizzeria Ranong & Villaggio Koh Phayam)
async function refreshTikTokTokenDirect(refreshToken, clientKey, clientSecret) {
  try {
    const refreshParams = new URLSearchParams();
    refreshParams.append('client_key', clientKey);
    refreshParams.append('client_secret', clientSecret);
    refreshParams.append('grant_type', 'refresh_token');
    refreshParams.append('refresh_token', refreshToken);

    const rRes = await fetchWithRetry('https://open.tiktokapis.com/v2/oauth/token/', () => ({
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: refreshParams.toString(),
    }), { maxAttempts: 3, timeoutMs: 30000, label: 'TikTok OAuth Refresh' });
    const rData = await rRes.json();
    if (rRes.ok && (rData.data || !rData.error || rData.error.code === 'ok' || rData.error.code === 0)) {
      return rData.data || rData;
    }
    console.warn('[scheduler-dispatch] TikTok refresh token API call failed:', JSON.stringify(rData));
  } catch (err) {
    console.warn('[scheduler-dispatch] TikTok refresh exception:', err.message);
  }
  return null;
}

async function getTikTokToken(brand = 'pizza', forceRefresh = false) {
  try {
    let clientKey = env.TIKTOK_CLIENT_KEY;
    let clientSecret = env.TIKTOK_CLIENT_SECRET;

    if (!clientKey || !clientSecret || clientKey.startsWith('sb')) {
      if (neonSql) {
        try {
          const appRows = await neonSql`SELECT chat_id FROM telegram_config WHERE id = 'tiktok_app_config' LIMIT 1;`;
          if (appRows?.[0]?.chat_id) {
            const p = JSON.parse(appRows[0].chat_id);
            if (p.client_key) clientKey = p.client_key;
            if (p.client_secret) clientSecret = p.client_secret;
          }
        } catch { }
      }
    }

    if (neonSql) {
      const rows = await neonSql`SELECT id, chat_id, bot_token, updated_at FROM telegram_config WHERE id = ${`tiktok_${brand}`} LIMIT 1;`;
      if (rows?.[0]?.bot_token) {
        const row = rows[0];
        let parsed = {};
        try { parsed = JSON.parse(row.chat_id || '{}'); } catch { }

        const refreshToken = parsed.refresh_token;
        const updatedAtMs = row.updated_at ? new Date(row.updated_at).getTime() : 0;
        const ageSeconds = (Date.now() - updatedAtMs) / 1000;
        const expiresIn = Number(parsed.expires_in) || 86400;
        const isNearExpiry = ageSeconds > (expiresIn - 14400); // refresh se più vecchio di 20 ore

        if ((forceRefresh || isNearExpiry) && refreshToken && clientKey && clientSecret) {
          console.log(`[scheduler-dispatch] 🔄 Token TikTok ${brand} in scadenza o refresh richiesto (${Math.round(ageSeconds / 3600)}h). Auto-refresh in corso...`);
          const refreshed = await refreshTikTokTokenDirect(refreshToken, clientKey, clientSecret);
          if (refreshed?.access_token) {
            const updatedChatId = JSON.stringify({
              ...parsed,
              open_id: refreshed.open_id || parsed.open_id,
              refresh_token: refreshed.refresh_token || refreshToken,
              expires_in: refreshed.expires_in || 86400,
              brand,
              account_name: parsed.account_name || (brand === 'village' ? 'flowerpowervillage' : 'flowerpowerpizzaranong'),
              updated_at: new Date().toISOString()
            });

            try {
              await neonSql`
                UPDATE telegram_config 
                SET chat_id = ${updatedChatId}, bot_token = ${refreshed.access_token}, updated_at = NOW()
                WHERE id = ${`tiktok_${brand}`};
              `;
              console.log(`✅ [scheduler-dispatch] Nuovo Token TikTok salvato su Neon con successo per ${brand}!`);
            } catch (saveErr) {
              console.warn('[scheduler-dispatch] Avviso salvataggio token Neon:', saveErr.message);
            }

            return refreshed.access_token;
          }
        }

        return row.bot_token;
      }
    }
  } catch (err) {
    console.warn('[scheduler-dispatch] Errore getTikTokToken:', err.message);
  }

  try {
    const sb = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;
    if (sb) {
      const { data } = await sb.from('telegram_config').select('bot_token').eq('id', `tiktok_${brand}`).maybeSingle();
      if (data?.bot_token) return data.bot_token;
    }
  } catch { }
  return null;
}

// 🎵 Invia Video direttamente a TikTok come Bozza (Inbox) con Notifica Push su Smartphone
async function publishToTikTokDraft({ videoBuffer, brand = 'pizza' }) {
  if (dryRun) {
    console.log(`[DRY-RUN] Pubblicazione Bozza TikTok (${brand}) buffer: ${videoBuffer?.length || 0} bytes`);
    return { ok: true, dryRun: true, publish_id: 'mock_tiktok_draft_id' };
  }
  let token = await getTikTokToken(brand);
  if (!token) {
    throw new Error(`Token TikTok non trovato per brand ${brand}`);
  }

  let initRes = await fetchWithRetry('https://open.tiktokapis.com/v2/post/publish/inbox/video/init/', () => ({
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json; charset=UTF-8'
    },
    body: JSON.stringify({
      source_info: {
        source: 'FILE_UPLOAD',
        video_size: videoBuffer.length,
        chunk_size: videoBuffer.length,
        total_chunk_count: 1
      }
    })
  }), { maxAttempts: 3, timeoutMs: 45000, label: 'TikTok Inbox Init' });

  let initData = await initRes.json();

  // 🛡️ Retry con Force Refresh se il token risulta non valido o scaduto durante la chiamata
  if (!initRes.ok && (initData?.error?.code === 'access_token_invalid' || initData?.error?.message?.toLowerCase().includes('token'))) {
    console.warn(`[scheduler-dispatch] ⚠️ TikTok init fallito con token attuale (${initData?.error?.message}). Tentativo force-refresh immediato...`);
    const refreshedToken = await getTikTokToken(brand, true);
    if (refreshedToken && refreshedToken !== token) {
      token = refreshedToken;
      initRes = await fetchWithRetry('https://open.tiktokapis.com/v2/post/publish/inbox/video/init/', () => ({
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: videoBuffer.length,
            chunk_size: videoBuffer.length,
            total_chunk_count: 1
          }
        })
      }), { maxAttempts: 3, timeoutMs: 45000, label: 'TikTok Inbox Init Refreshed' });
      initData = await initRes.json();
    }
  }

  if (!initRes.ok || !initData?.data?.upload_url) {
    throw new Error(`TikTok inbox init fallito: ${initData?.error?.message || JSON.stringify(initData)}`);
  }

  const putRes = await fetchWithRetry(initData.data.upload_url, () => ({
    method: 'PUT',
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Range': `bytes 0-${videoBuffer.length - 1}/${videoBuffer.length}`,
      'Content-Length': String(videoBuffer.length)
    },
    body: videoBuffer
  }), { maxAttempts: 3, timeoutMs: 120000, label: 'TikTok Binary PUT' });

  if (!putRes.ok && putRes.status !== 201 && putRes.status !== 200) {
    throw new Error(`Upload buffer a TikTok fallito con HTTP ${putRes.status}`);
  }

  console.log(`🎉 [scheduler-dispatch] Video inviato con successo alle Bozze di TikTok (${brand})! (Publish ID: ${initData.data.publish_id})`);
  return { ok: true, publish_id: initData.data.publish_id, brand };
}

// Invia messaggio di testo/foto a Telegram Topic (per post gruppi)
async function sendMessageToTelegram({ topicId, text, photoUrl }) {
  const isCriticalSocialAlert =
    topicId === TOPIC_FAILED ||
    /^\s*(?:<[^>]+>\s*)*🚨/.test(String(text || ''));
  const finalText =
    isCriticalSocialAlert && !String(text || '').trimStart().startsWith('❗️❗️❗️')
      ? `❗️❗️❗️❗️❗️❗️❗️❗️❗️❗️\n${text}`
      : text;

  if (dryRun) {
    console.log(`[DRY-RUN] Messaggio su Telegram Topic ${topicId}:\n${finalText}`);
    return { ok: true, dryRun: true };
  }

  const token = await getTelegramToken();
  if (!token) throw new Error('Token Telegram non trovato!');

  if (photoUrl) {
    const res = await fetchWithRetry(`https://api.telegram.org/bot${token}/sendPhoto`, () => ({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_thread_id: topicId,
        photo: photoUrl,
        caption: finalText
      })
    }), { maxAttempts: 3, timeoutMs: 30000, label: 'Telegram sendPhoto' });
    return res.json();
  } else {
    const res = await fetchWithRetry(`https://api.telegram.org/bot${token}/sendMessage`, () => ({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_thread_id: topicId,
        text: finalText,
        parse_mode: 'HTML'
      })
    }), { maxAttempts: 3, timeoutMs: 30000, label: 'Telegram sendMessage' });
    const data = await res.json();
    if (!data.ok) {
      console.warn(`[scheduler-dispatch] Telegram API warn su Topic ${topicId}:`, data.description);
    }
    return data;
  }
}

// Esegue il rendering automatico di un video tramite render-parity-test con retry automatico di sicurezza
async function renderVideoMode(mode, maxAttempts = 3) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[scheduler-dispatch] Avvio rendering robot per formato ${mode} (tentativo ${attempt}/${maxAttempts})...`);

    // Pulizia preventivi file temporanei del giro precedente per garantire ripartenze pulite
    for (const staleName of [
      `${mode}.dispatch.mp4`,
      `${mode}.dispatch.raw.mp4`,
      `${mode}.soldout.json`,
      `${mode}.upcoming.json`,
      `${mode}.copy.json`,
      `${mode}.testrun.json`
    ]) {
      const stalePath = path.join(outDir, staleName);
      if (fs.existsSync(stalePath)) {
        try { fs.unlinkSync(stalePath); } catch { }
      }
    }

    const runArgs = [
      'scripts/render-parity-test.mjs',
      '--api=https://www.flowerpowerpizza.com',
      `--mode=${mode}`,
      `--base=${base}`,
      `--out=${outDir}`,
      `--tag=dispatch`
    ];

    const res = spawnSync('node', runArgs, { stdio: 'inherit', timeout: 300000 });
    if (res.status === 0) {
      // Verifica se il formato è andato in Sold Out (es. LM1 con 0 alloggi liberi su Octorate)
      const soldOutFile = path.join(outDir, `${mode}.soldout.json`);
      if (fs.existsSync(soldOutFile)) {
        try {
          const soData = JSON.parse(fs.readFileSync(soldOutFile, 'utf8'));
          if (soData.fullyBooked) {
            console.log(`[scheduler-dispatch] ℹ️ Formato ${mode}: Resort 100% Sold Out (0 alloggi disponibili oggi).`);
            return {
              fullyBooked: true,
              count: 0,
              filePath: null,
              copy: null
            };
          }
        } catch (soErr) {
          console.warn('[scheduler-dispatch] Errore lettura soldout JSON:', soErr.message);
        }
      }

      // Verifica presenza video
      const candidates = [
        path.join(outDir, `${mode}.dispatch.mp4`),
        path.join(outDir, `${mode}.cloud.mp4`),
        path.join(outDir, `${mode}.local.mp4`)
      ];
      const found = candidates.find(c => fs.existsSync(c));
      if (found) {
        // Carica il copy ufficiale sincronizzato generato in parità dal player
        let copy = null;
        const copyCandidates = [
          path.join(outDir, `${mode}.copy.json`),
          path.join(outDir, `${mode}.cloud.copy.json`),
          path.join(outDir, `${mode}.local.copy.json`)
        ];
        const copyFile = copyCandidates.find(c => fs.existsSync(c));
        if (copyFile) {
          try {
            copy = JSON.parse(fs.readFileSync(copyFile, 'utf8'));
            console.log(`[scheduler-dispatch] Copy ufficiale sincronizzato caricato da ${copyFile}!`);
          } catch (e) {
            console.warn('[scheduler-dispatch] Errore lettura copy JSON:', e.message);
          }
        }

        let testrun = null;
        const trFile = path.join(outDir, `${mode}.testrun.json`);
        if (fs.existsSync(trFile)) {
          try {
            testrun = JSON.parse(fs.readFileSync(trFile, 'utf8'));
          } catch (e) {
            console.warn('[scheduler-dispatch] Errore lettura testrun JSON:', e.message);
          }
        }

        if (!copy) {
          try { fs.unlinkSync(found); } catch { }
          lastError = new Error(`Copy ufficiale mancante per ${mode}: impossibile validare formato/brand prima dell'invio`);
        } else {
          const copyCheck = validateRenderedModeContract({
            requestedMode: mode,
            actualMode: copy.mode,
            actualBrand: copy.brand
          });
          const trCheck = testrun
            ? validateRenderedModeContract({
                requestedMode: mode,
                actualMode: testrun.mode,
                actualBrand: testrun.brand,
                sceneCount: Array.isArray(testrun.scenes) ? testrun.scenes.length : undefined,
                isEmptyShowcase: !!testrun.isEmptyShowcase
              })
            : null;

          if (!copyCheck.ok || (trCheck && !trCheck.ok)) {
            const reason = !copyCheck.ok ? copyCheck.reason : trCheck.reason;
            try { fs.unlinkSync(found); } catch { }
            lastError = new Error(`[FIREWALL ANTI-CONTAMINAZIONE] Render rifiutato per ${mode}: ${reason}`);
          } else {
            return {
              filePath: found,
              copy,
              toString: () => found
            };
          }
        }
      } else {
        lastError = new Error(`Video non generato per ${mode} nonostante exit code 0`);
      }
    } else if (res.error?.code === 'ETIMEDOUT' || res.signal === 'SIGTERM') {
      lastError = new Error(`Rendering scaduto per timeout (>5 min) su ${mode}`);
    } else {
      lastError = new Error(`Rendering fallito per ${mode} (exit code ${res.status})`);
    }

    if (attempt < maxAttempts) {
      const pauseMs = attempt === 1 ? 5000 : 12000;
      console.warn(`[scheduler-dispatch] Tentativo ${attempt}/${maxAttempts} fallito per ${mode}. Pausa di ${pauseMs / 1000}s prima del retry...`);
      await new Promise(r => setTimeout(r, pauseMs));
    }
  }

  throw lastError || new Error(`Rendering fallito per ${mode} dopo ${maxAttempts} tentativi`);
}

let currentAttempt = 1;
let currentLastNotice = { topic301MsgId: null, extraNotices: [] };

async function runDailyTokenHealthCheck() {
  const issues = [];
  console.log('🛡️ [watchdog] Avvio verifica mattutina salute Token (Meta, TikTok, Telegram, Google Drive)...');

  // 1. Meta Page Tokens & Instagram Business Link (Pizza + Village)
  for (const [label, tok, pageId] of [
    ['Meta Facebook/IG Pizzeria', env.META_PIZZA_PAGE_TOKEN, env.META_PIZZA_PAGE_ID || '410856732111386'],
    ['Meta Facebook/IG Villaggio', env.META_VILLAGE_PAGE_TOKEN, env.META_VILLAGE_PAGE_ID || '106883044573670']
  ]) {
    if (!tok) {
      issues.push(`${label}: token mancante nelle variabili d'ambiente`);
      continue;
    }
    try {
      const r = await fetchWithRetry(
        `https://graph.facebook.com/v19.0/${pageId}?fields=id,name,instagram_business_account&access_token=${encodeURIComponent(tok)}`,
        () => ({}),
        { maxAttempts: 2, timeoutMs: 15000, label: `Watchdog ${label}` }
      );
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.error) {
        issues.push(`${label}: ${d.error?.message || `HTTP ${r.status}`}`);
      } else if (!d?.instagram_business_account?.id) {
        issues.push(`${label}: account Instagram Business scollegato dalla Pagina Facebook (${pageId})`);
      }
    } catch (e) {
      issues.push(`${label}: errore rete (${e.message})`);
    }
  }

  // 2. Telegram Social Bot
  try {
    const tgToken = await getTelegramToken();
    if (!tgToken) {
      issues.push('Telegram Social Bot: token non trovato');
    } else {
      const r = await fetchWithRetry(
        `https://api.telegram.org/bot${tgToken}/getMe`,
        () => ({}),
        { maxAttempts: 2, timeoutMs: 15000, label: 'Watchdog Telegram' }
      );
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) {
        issues.push(`Telegram Social Bot: ${d.description || `HTTP ${r.status}`}`);
      }
    }
  } catch (e) {
    issues.push(`Telegram Social Bot: errore rete (${e.message})`);
  }

  // 3. Google Drive OAuth
  try {
    const creds = await getGoogleDriveCredentials();
    if (!creds?.client_id || !creds?.client_secret || !creds?.refresh_token) {
      issues.push('Google Drive 5TB: credenziali mancanti');
    } else {
      const r = await fetchWithRetry('https://oauth2.googleapis.com/token', () => ({
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: creds.client_id,
          client_secret: creds.client_secret,
          refresh_token: creds.refresh_token,
          grant_type: 'refresh_token'
        })
      }), { maxAttempts: 2, timeoutMs: 20000, label: 'Watchdog GDrive' });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.access_token) {
        issues.push(`Google Drive 5TB: refresh fallito (${d.error_description || d.error || `HTTP ${r.status}`})`);
      }
    }
  } catch (e) {
    issues.push(`Google Drive 5TB: errore rete (${e.message})`);
  }

  // 4. TikTok Auto-Refresh preventivo su ENTRAMBI i brand (pizza + village)
  for (const b of ['pizza', 'village']) {
    try {
      const tk = await getTikTokToken(b);
      if (!tk) {
        issues.push(`TikTok (${b}): token mancante`);
      } else if (neonSql) {
        const rows = await neonSql`SELECT updated_at FROM telegram_config WHERE id = ${`tiktok_${b}`} LIMIT 1;`;
        const updMs = rows?.[0]?.updated_at ? new Date(rows[0].updated_at).getTime() : 0;
        const ageHours = updMs ? (Date.now() - updMs) / 3600000 : 0;
        if (ageHours > 26) {
          issues.push(`TikTok (${b}): token non rinnovato da ${Math.round(ageHours)}h (possibile refresh token scaduto, ricollegare in /social)`);
        }
      }
    } catch (e) {
      issues.push(`TikTok (${b}): errore verifica (${e.message})`);
    }
  }

  if (issues.length > 0) {
    console.warn('⚠️ [watchdog] Problemi rilevati nei token:', issues);
    await writeSocialLog({
      platform: 'watchdog',
      brand: 'flowerpower',
      message: 'Check token mattutino 08:00 con avvisi',
      error: issues.join(' | ')
    });
    if (!dryRun) {
      const msg =
        `🛡️ <b>[FP SOCIAL STUDIO · CHECK MATTUTINO TOKEN]</b>\n\n` +
        `⚠️ Alcuni collegamenti richiedono attenzione prima dei post della giornata:\n` +
        issues.map(i => `▫️ ${escapeHtml(i)}`).join('\n') +
        `\n\n👉 <i>Se vedi un token scaduto, ricollegalo dalla console /social.</i>`;
      await sendTelegramHtmlMessage({ topicId: TOPIC_FAILED, text: msg }).catch(() => {});
    }
  } else {
    console.log('✅ [watchdog] Tutti i token (Meta Pizza/Village, TikTok Pizza/Village, Telegram, Google Drive) sono attivi e sani!');
    await writeSocialLog({
      platform: 'watchdog',
      brand: 'flowerpower',
      message: 'Check token mattutino 08:00 OK: tutti i canali sani'
    });
  }
}

async function runAutomatedChannelSlot({
  slot,
  brand,
  channel,
  format,
  title,
  publishFn,
  fallbackTopicId,
  fallbackTitle,
  fallbackCopyText = '',
  filePath,
  attempt,
  lastNotice,
  successDetails = '',
  fallbackActionText = 'Video master recapitato su Telegram per pubblicazione manuale con 1 tocco dello staff.'
}) {
  try {
    const res = await publishFn();
    const recoveryNote = attempt > 1
      ? `Auto-recuperato con successo al tentativo ${attempt}/${MAX_SLOT_ATTEMPTS}.`
      : '';
    const details = [recoveryNote, successDetails].filter(Boolean).join(' ') || undefined;

    await sendPublishedLog({
      brand,
      channel,
      format,
      title,
      mediaId: res.mediaId || res.postUrl || res.id || res.publish_id,
      details
    });

    return {
      brand,
      title,
      details: `${channel} ${format}${attempt > 1 ? ` (recuperato ${attempt}/${MAX_SLOT_ATTEMPTS})` : ''}`
    };
  } catch (err) {
    await writeSocialLog({
      platform: channel,
      brand,
      message: `Errore ${slot} (${format}) al tentativo ${attempt}/${MAX_SLOT_ATTEMPTS}`,
      error: err?.stack || err?.message || String(err)
    });

    const permanent = isPermanentError(err);
    if (!permanent && attempt < MAX_SLOT_ATTEMPTS) {
      // Lascia gestire al controller di retry: invierà avviso ⏳ calmo e riproverà in automatico al giro successivo
      throw err;
    }

    // Tentativo finale (3/3) o errore permanente di token/credenziali: consegna fallback 1-click e un solo allarme rosso
    console.warn(`[scheduler-dispatch] ${channel} fallito definitivamente (${permanent ? 'errore token permanente' : `tentativo ${attempt}/${MAX_SLOT_ATTEMPTS}`}), invio fallback su Topic ${fallbackTopicId}...`);
    try {
      await sendOfficialTelegramPost({
        topicId: fallbackTopicId,
        title: fallbackTitle,
        format,
        brand,
        copyText: fallbackCopyText,
        filePath
      });
    } catch (fbErr) {
      console.error('[scheduler-dispatch] Errore consegna fallback Telegram:', fbErr.message);
    }

    await sendFailedAlert({
      brand,
      channel,
      format,
      title,
      error: err,
      attemptTag: permanent ? 'Errore Token/Credenziali' : `Tentativo Finale ${attempt}/${MAX_SLOT_ATTEMPTS}`,
      fallbackAction: fallbackActionText
    });

    writeHandledAlertMarker({ handled: true, mode: 'failed_final', slot, attempt });
    await recordSlotStatus({
      slot,
      status: 'failed_final',
      platform: channel,
      brand,
      title,
      copyText: serializeRetryMeta({
        attempt,
        maxAttempts: MAX_SLOT_ATTEMPTS,
        lastError: String(err?.message || err).slice(0, 400),
        topic301MsgId: lastNotice?.topic301MsgId || null,
        extraNotices: lastNotice?.extraNotices || [],
        runId: process.env.GITHUB_RUN_ID || 'local',
        updatedAt: new Date().toISOString()
      })
    });

    const finalErr = new Error(err?.message || `Fallimento definitivo ${channel}`);
    finalErr.alreadyHandledFinal = true;
    throw finalErr;
  }
}

async function run() {
  const todayRows = await fetchTodaySocialRows();
  const decision = selectSlotToExecute({
    rawSlot: rawSlotArg,
    bkTime: currentBk,
    todayRows,
    forceRun,
    dryRun
  });

  if (!decision.slot) {
    console.log(`\n======================================================`);
    if (decision.reason === 'already_completed') {
      console.log(`🛑 [IDEMPOTENCY LOCK] Slot ${rawSlotArg} già completato con successo oggi a Bangkok (${currentBk.date.toISOString().slice(0, 10)})!`);
    } else {
      console.log(`ℹ️ [SCHEDULER A RIPOSO] Nessuno slot pianificato o in coda recovery all'orario attuale (${currentBk.timeStr} Bangkok).`);
      console.log(`Gli slot ufficiali attivi sono: ${OFFICIAL_SLOTS.join(', ')}.`);
    }
    console.log(`Uscita sicura a 0 elaborazioni e 0 egress.`);
    console.log(`======================================================\n`);
    return;
  }

  targetSlot = decision.slot;
  currentAttempt = explicitAttemptArg > 0 ? explicitAttemptArg : (decision.attempt || 1);
  currentLastNotice = decision.lastNotice || { topic301MsgId: null, extraNotices: [] };
  const completedItems = decision.completedItems || new Set();
  const slotMeta = SLOT_METADATA[targetSlot] || { label: `Slot ${targetSlot}`, brand: 'flowerpower' };

  const is0800 = targetSlot === '08:00';
  const is0930 = targetSlot === '09:30';
  const is1030 = targetSlot === '10:30';
  const is1130 = targetSlot === '11:30';
  const is1230 = targetSlot === '12:30';
  const is1330 = targetSlot === '13:30';
  const is1500 = targetSlot === '15:00';
  const is1600 = targetSlot === '16:00';
  const is1700 = targetSlot === '17:00';
  const is1800 = targetSlot === '18:00';
  const is1830 = targetSlot === '18:30';
  const is1930 = targetSlot === '19:30';
  const is2000 = targetSlot === '20:00';
  const is2030 = targetSlot === '20:30';
  const is2100 = targetSlot === '21:00';
  let executedSummary = null;

  // Registra tentativo in corso su Neon (traccia anche eventuali crash/timeout del runner)
  await recordSlotStatus({
    slot: targetSlot,
    status: 'in_progress',
    platform: 'telegram_meta',
    brand: slotMeta.brand,
    title: slotMeta.label,
    copyText: serializeRetryMeta({
      attempt: currentAttempt,
      maxAttempts: MAX_SLOT_ATTEMPTS,
      topic301MsgId: currentLastNotice.topic301MsgId || null,
      extraNotices: currentLastNotice.extraNotices || [],
      runId: process.env.GITHUB_RUN_ID || 'local',
      updatedAt: new Date().toISOString()
    })
  });

  // 🛡️ Sentinel & Token Watchdog SOLO alle 08:00 (risparmio ~4 minuti al giorno + controllo preventivo token)
  if (is0800 && currentAttempt === 1) {
    try {
      const { runSupabaseQuotaSentinel } = await import('./supabase-sentinel.mjs');
      await runSupabaseQuotaSentinel({ autoFix: !dryRun, notifyTelegram: !dryRun, isDailyReport: true });
    } catch (sentinelErr) {
      console.warn('[scheduler-dispatch] Watchdog sentinel warning:', sentinelErr.message);
    }
    try {
      await runDailyTokenHealthCheck();
    } catch (watchdogErr) {
      console.warn('[scheduler-dispatch] Watchdog token warning:', watchdogErr.message);
    }
  }

  console.log(`\n======================================================`);
  console.log(`🚀 ESECUZIONE SLOT: ${targetSlot} (Tentativo ${currentAttempt}/${MAX_SLOT_ATTEMPTS} · Motivo: ${decision.reason})`);
  console.log(`======================================================\n`);

  if (is0800) {
    console.log(`🌅 [08:00 BANGKOK] Avvio tranche mattutina: 2 Stories TikTok/IG + 1 Reel Gruppo Phayam`);
    const itemErrors = [];
    let lm1Title = 'Stories Mattutine Ranong & Phayam + Post Alloggi LM1';
    let lm1Details = 'Consegnate 2 Stories 9:16 su Topic 3 (P1 Pizza + V1 Villaggio) e 1 Post Alloggi LM1 su Topic 2 con testo bilingue 🇬🇧+🇹🇭 e tasti interattivi';
    let lm1Format = 'LM1 / P1 / V1';

    // 1. Story Pizzeria Ranong (Topic 3: solo video + tasti)
    if (completedItems.has('P1')) {
      console.log('⏭️ [08:00] Item P1 già consegnato oggi: salto per evitare duplicati.');
    } else {
      try {
        const p1Res = await renderVideoMode('P1');
        await sendOfficialTelegramPost({
          topicId: TOPIC_TIKTOK_STORIES,
          title: 'Pizza Tradizionale Ranong 48h · Stories del Mattino',
          format: 'P1',
          brand: 'pizza',
          filePath: p1Res.filePath
        });
        await recordItemCompleted({
          slot: '08:00',
          itemKey: 'P1',
          brand: 'pizza',
          title: 'Pizza Tradizionale Ranong 48h · Stories del Mattino'
        });
      } catch (err) {
        console.error('❌ [08:00] Errore item P1:', err.message);
        itemErrors.push({ itemKey: 'P1', error: err });
      }
    }

    // 2. Story Villaggio Koh Phayam (Topic 3: solo video + tasti)
    if (completedItems.has('V1')) {
      console.log('⏭️ [08:00] Item V1 già consegnato oggi: salto per evitare duplicati.');
    } else {
      try {
        const v1Res = await renderVideoMode('V1');
        await sendOfficialTelegramPost({
          topicId: TOPIC_TIKTOK_STORIES,
          title: 'Risveglio Tropicale a Koh Phayam · Stories del Mattino',
          format: 'V1',
          brand: 'village',
          filePath: v1Res.filePath
        });
        await recordItemCompleted({
          slot: '08:00',
          itemKey: 'V1',
          brand: 'village',
          title: 'Risveglio Tropicale a Koh Phayam · Stories del Mattino'
        });
      } catch (err) {
        console.error('❌ [08:00] Errore item V1:', err.message);
        itemErrors.push({ itemKey: 'V1', error: err });
      }
    }

    // 3. Reel Gruppo Facebook Koh Phayam: LM1 Alloggi Liberi Oggi (Topic 2: video + scheda bilingue 🇬🇧+🇹🇭)
    if (completedItems.has('LM1')) {
      console.log('⏭️ [08:00] Item LM1 già consegnato oggi: salto per evitare duplicati.');
    } else {
      try {
        const lm1Res = await renderVideoMode('LM1');

        if (lm1Res && lm1Res.fullyBooked) {
          console.log(`🌴 [08:00 BANGKOK] Resort 100% Sold Out per i prossimi 7 giorni su Octorate.`);
          console.log(`👉 Fallback su V3 senza prezzi.`);

          const v3Res = await renderVideoMode('V3');
          const soldOutText = getBilingualPostCopy('V3_SOLDOUT', 'village', v3Res.copy);

          await sendOfficialTelegramPost({
            topicId: TOPIC_KOH_PHAYAM_GROUP,
            title: 'Tour Alloggi nel Verde a Koh Phayam · Post Community (Sold Out)',
            format: 'V3',
            brand: 'village',
            copyText: soldOutText,
            filePath: v3Res.filePath
          });

          lm1Format = 'V3 / P1 / V1 (LM1 Full Sold Out)';
          lm1Title = 'Stories Mattutine Ranong & Phayam + Tour Alloggi V3 (Sold Out)';
          lm1Details = 'Consegnate 2 Stories 9:16 su Topic 3 (P1 Pizza + V1 Villaggio) e 1 Reel V3 senza prezzi su Topic 2 per il Gruppo Facebook';
        } else {
          const upcomingFile = path.join(outDir, 'LM1.upcoming.json');
          const isSoldOutTonight = fs.existsSync(upcomingFile);
          const lm1Text = getBilingualPostCopy('LM1', 'village', lm1Res.copy);

          await sendOfficialTelegramPost({
            topicId: TOPIC_KOH_PHAYAM_GROUP,
            title: isSoldOutTonight
              ? 'Fully Booked Today · Prossime Camere Disponibili a Koh Phayam'
              : 'Alloggi Disponibili Oggi a Koh Phayam · Reel & Post Community',
            format: 'LM1',
            brand: 'village',
            priceBadge: isSoldOutTonight ? 'Prossime Aperture Live' : 'Sconto Cascata Live',
            copyText: lm1Text,
            filePath: lm1Res.filePath
          });

          if (isSoldOutTonight) {
            lm1Title = 'Stories Mattutine + Post Prossime Camere LM1 (Sold Out Stanotte)';
            lm1Details = 'Consegnate 2 Stories 9:16 su Topic 3 e 1 Post LM1 con le prossime 5 camere e date disponibili su Topic 2 per il Gruppo Facebook';
          }
        }

        await recordItemCompleted({
          slot: '08:00',
          itemKey: 'LM1',
          brand: 'village',
          title: lm1Title
        });
      } catch (err) {
        console.error('❌ [08:00] Errore item LM1:', err.message);
        itemErrors.push({ itemKey: 'LM1', error: err });
      }
    }

    if (itemErrors.length > 0) {
      const combined = new Error(itemErrors.map(e => `${e.itemKey}: ${e.error?.message || e.error}`).join(' | '));
      combined.pendingItems = itemErrors.map(e => e.itemKey);
      throw combined;
    }

    const recoveryPrefix = currentAttempt > 1 ? `Auto-recuperato al tentativo ${currentAttempt}/${MAX_SLOT_ATTEMPTS}. ` : '';
    await sendPublishedLog({
      brand: 'village',
      channel: '👥 Gruppo Facebook Koh Phayam + 🎵 TikTok/IG Stories',
      format: lm1Format,
      title: lm1Title,
      details: `${recoveryPrefix}${lm1Details}`
    });

    executedSummary = {
      brand: 'flowerpower',
      title: lm1Title,
      details: `${recoveryPrefix}Consegnate 2 Stories su Topic 3 e 1 Post Alloggi su Topic 2`
    };
  } else if (is0930) {
    console.log(`🌿 [09:30 BANGKOK] Slot Story Mattino — PUBBLICAZIONE INSTAGRAM STORIES V1`);
    const storyRes = await renderVideoMode('V1');
    const { videoUrl, buffer } = await ensureCloudVideoUrl(storyRes.filePath);
    executedSummary = await runAutomatedChannelSlot({
      slot: '09:30',
      brand: 'village',
      channel: '📸 Instagram Stories',
      format: 'V1',
      title: 'Risveglio Tropicale a Phayam',
      publishFn: () => publishToInstagram({ videoUrl, videoBuffer: buffer, brand: 'village', isStory: true }),
      fallbackTopicId: TOPIC_TIKTOK_STORIES,
      fallbackTitle: 'V1 Storia Risveglio Tropicale a Phayam',
      filePath: storyRes.filePath,
      attempt: currentAttempt,
      lastNotice: currentLastNotice,
      fallbackActionText: 'Video master recapitato su Telegram Topic 3 per pubblicazione manuale con 1 tocco dello staff.'
    });
  } else if (is1030) {
    console.log(`🍕 [10:30 BANGKOK] Slot Story Pre-Pranzo Pizza — PUBBLICAZIONE INSTAGRAM STORIES P3`);
    const p3StoryRes = await renderVideoMode('P3');
    const { videoUrl, buffer } = await ensureCloudVideoUrl(p3StoryRes.filePath);
    executedSummary = await runAutomatedChannelSlot({
      slot: '10:30',
      brand: 'pizza',
      channel: '📸 Instagram Stories (Pizza Pre-Pranzo)',
      format: 'P3',
      title: 'Anteprima Menù Ranong · Pizzeria 48h',
      publishFn: () => publishToInstagram({ videoUrl, videoBuffer: buffer, brand: 'pizza', isStory: true }),
      fallbackTopicId: TOPIC_TIKTOK_STORIES,
      fallbackTitle: 'P3 Storia Pre-Pranzo Pizzeria Ranong',
      filePath: p3StoryRes.filePath,
      attempt: currentAttempt,
      lastNotice: currentLastNotice,
      fallbackActionText: 'Video master recapitato su Telegram Topic 3 per pubblicazione immediata con 1 tocco dello staff.'
    });
  } else if (is1130) {
    console.log(`🍝 [11:30 BANGKOK] Slot Pranzo Ranong — PUBBLICAZIONE 100% AUTOMATICA FACEBOOK REEL`);
    const p2Res = await renderVideoMode('P2');
    const { videoUrl, buffer } = await ensureCloudVideoUrl(p2Res.filePath);
    const p2Caption = getBilingualPostCopy('P2', 'pizza', p2Res.copy);
    executedSummary = await runAutomatedChannelSlot({
      slot: '11:30',
      brand: 'pizza',
      channel: '📘 Facebook Pagina (Reel Pranzo)',
      format: 'P2',
      title: 'Pranzo Pasta Fresca Ranong',
      publishFn: () => publishToFacebook({
        videoUrl,
        videoBuffer: buffer,
        title: 'Pranzo Pasta Fresca Ranong 🍝 Piatto Espresso Caldo',
        caption: p2Caption,
        brand: 'pizza',
        isStory: false
      }),
      fallbackTopicId: TOPIC_TIKTOK_STORIES,
      fallbackTitle: 'Pranzo Pasta Fresca Ranong · Reel Pagina Facebook',
      fallbackCopyText: p2Caption,
      filePath: p2Res.filePath,
      attempt: currentAttempt,
      lastNotice: currentLastNotice,
      fallbackActionText: 'Video master recapitato su Telegram Topic 3 per pubblicazione manuale con 1 tocco dello staff.'
    });
  } else if (is1230) {
    console.log(`🍕 [12:30 BANGKOK] Slot Story Pranzo — PUBBLICAZIONE 100% AUTOMATICA FACEBOOK STORIES`);
    const p1StoryRes = await renderVideoMode('P1');
    const { videoUrl, buffer } = await ensureCloudVideoUrl(p1StoryRes.filePath);
    executedSummary = await runAutomatedChannelSlot({
      slot: '12:30',
      brand: 'pizza',
      channel: '📘 Facebook Pagina (Story Pranzo)',
      format: 'P1',
      title: 'Pranzo Pizzeria Ranong 48h',
      publishFn: () => publishToFacebook({
        videoUrl,
        videoBuffer: buffer,
        brand: 'pizza',
        isStory: true
      }),
      fallbackTopicId: TOPIC_TIKTOK_STORIES,
      fallbackTitle: 'P1 Story Pranzo Pizzeria Ranong',
      filePath: p1StoryRes.filePath,
      attempt: currentAttempt,
      lastNotice: currentLastNotice,
      fallbackActionText: 'Video master recapitato su Telegram Topic 3 per pubblicazione immediata con 1 tocco dello staff.'
    });
  } else if (is1330) {
    console.log(`🍕 [13:30 BANGKOK] Slot Pranzo Mix Pizza — PUBBLICAZIONE 100% AUTOMATICA INSTAGRAM REEL P3`);
    const p3Res = await renderVideoMode('P3');
    const { videoUrl, buffer } = await ensureCloudVideoUrl(p3Res.filePath);
    const p3Caption = getBilingualPostCopy('P3', 'pizza', p3Res.copy);
    executedSummary = await runAutomatedChannelSlot({
      slot: '13:30',
      brand: 'pizza',
      channel: '📸 Instagram Reels (Pizza Pranzo Mix)',
      format: 'P3',
      title: 'Pranzo Mix 3 Specialità Ranong',
      publishFn: () => publishToInstagram({
        videoUrl,
        videoBuffer: buffer,
        caption: p3Caption,
        brand: 'pizza',
        isStory: false
      }),
      fallbackTopicId: TOPIC_TIKTOK_STORIES,
      fallbackTitle: 'P3 Reel Pranzo Mix Pizzeria Ranong · Instagram',
      fallbackCopyText: p3Caption,
      filePath: p3Res.filePath,
      attempt: currentAttempt,
      lastNotice: currentLastNotice,
      fallbackActionText: 'Video master recapitato su Telegram Topic 3 per pubblicazione manuale con 1 tocco dello staff.'
    });
  } else if (is1500) {
    console.log(`🍕 [15:00 BANGKOK] Slot Story Pomeriggio Pizza — PUBBLICAZIONE 100% AUTOMATICA INSTAGRAM STORIES P1`);
    const p1StoryRes = await renderVideoMode('P1');
    const { videoUrl, buffer } = await ensureCloudVideoUrl(p1StoryRes.filePath);
    executedSummary = await runAutomatedChannelSlot({
      slot: '15:00',
      brand: 'pizza',
      channel: '📸 Instagram Stories (Pizza Pomeriggio)',
      format: 'P1',
      title: 'Specialità del Giorno Ranong 48h',
      publishFn: () => publishToInstagram({ videoUrl, videoBuffer: buffer, brand: 'pizza', isStory: true }),
      fallbackTopicId: TOPIC_TIKTOK_STORIES,
      fallbackTitle: 'P1 Storia Pomeriggio Pizzeria Ranong',
      filePath: p1StoryRes.filePath,
      attempt: currentAttempt,
      lastNotice: currentLastNotice,
      fallbackActionText: 'Video master recapitato su Telegram Topic 3 per pubblicazione immediata con 1 tocco dello staff.'
    });
  } else if (is1600) {
    console.log(`🌿 [16:00 BANGKOK] Slot Pomeriggio Relax — PUBBLICAZIONE INSTAGRAM REEL V2`);
    const v2Res = await renderVideoMode('V2');
    const { videoUrl, buffer } = await ensureCloudVideoUrl(v2Res.filePath);
    const v2Caption = getBilingualPostCopy('V2', 'village', v2Res.copy);
    executedSummary = await runAutomatedChannelSlot({
      slot: '16:00',
      brand: 'village',
      channel: '📸 Instagram Reels',
      format: 'V2',
      title: 'Pomeriggio Relax & Suite Tour a Phayam',
      publishFn: () => publishToInstagram({
        videoUrl,
        videoBuffer: buffer,
        caption: v2Caption,
        brand: 'village',
        isStory: false
      }),
      fallbackTopicId: TOPIC_TIKTOK_STORIES,
      fallbackTitle: 'V2 Reel Relax Pomeriggio a Phayam · Instagram & TikTok',
      filePath: v2Res.filePath,
      attempt: currentAttempt,
      lastNotice: currentLastNotice,
      fallbackActionText: 'Video master Full HD archiviato su Google Drive 5TB e consegnato su Telegram Topic 3 con tasti per pubblicazione immediata con 1 tocco dello staff.'
    });
  } else if (is1700) {
    console.log(`🌅 [17:00 BANGKOK] Avvio tranche serale: 2 Stories TikTok/IG + 1 Reel R1 Ristorante Gruppo Phayam`);
    const itemErrors = [];

    // 1. Story Cena Pizzeria Ranong (Topic 3: solo video + tasti)
    if (completedItems.has('P1')) {
      console.log('⏭️ [17:00] Item P1 già consegnato oggi: salto per evitare duplicati.');
    } else {
      try {
        const p1Res = await renderVideoMode('P1');
        await sendOfficialTelegramPost({
          topicId: TOPIC_TIKTOK_STORIES,
          title: 'Cena Pizza Tradizionale Ranong 48h · Stories Serali',
          format: 'P1',
          brand: 'pizza',
          filePath: p1Res.filePath
        });
        await recordItemCompleted({
          slot: '17:00',
          itemKey: 'P1',
          brand: 'pizza',
          title: 'Cena Pizza Tradizionale Ranong 48h · Stories Serali'
        });
      } catch (err) {
        console.error('❌ [17:00] Errore item P1:', err.message);
        itemErrors.push({ itemKey: 'P1', error: err });
      }
    }

    // 2. Story Serale Villaggio Koh Phayam (Topic 3: solo video + tasti - ZERO TRAMONTO)
    if (completedItems.has('V3')) {
      console.log('⏭️ [17:00] Item V3 già consegnato oggi: salto per evitare duplicati.');
    } else {
      try {
        const v3Res = await renderVideoMode('V3');
        await sendOfficialTelegramPost({
          topicId: TOPIC_TIKTOK_STORIES,
          title: 'Atmosfera Serale a Koh Phayam · Stories Serali',
          format: 'V3',
          brand: 'village',
          filePath: v3Res.filePath
        });
        await recordItemCompleted({
          slot: '17:00',
          itemKey: 'V3',
          brand: 'village',
          title: 'Atmosfera Serale a Koh Phayam · Stories Serali'
        });
      } catch (err) {
        console.error('❌ [17:00] Errore item V3:', err.message);
        itemErrors.push({ itemKey: 'V3', error: err });
      }
    }

    // 3. Reel Gruppo Facebook Koh Phayam: R1 Ristorante (Topic 2: video + scheda bilingue 🇬🇧+🇹🇭, ZERO ITALIANO)
    if (completedItems.has('R1')) {
      console.log('⏭️ [17:00] Item R1 già consegnato oggi: salto per evitare duplicati.');
    } else {
      try {
        const r1Res = await renderVideoMode('R1');
        const r1Text = getBilingualPostCopy('R1', 'village', r1Res.copy);
        await sendOfficialTelegramPost({
          topicId: TOPIC_KOH_PHAYAM_GROUP,
          title: 'Cena & Pizza a Domicilio a Koh Phayam · Reel & Post Community',
          format: 'R1',
          brand: 'village',
          copyText: r1Text,
          filePath: r1Res.filePath
        });
        await recordItemCompleted({
          slot: '17:00',
          itemKey: 'R1',
          brand: 'village',
          title: 'Cena & Pizza a Domicilio a Koh Phayam · Reel & Post Community'
        });
      } catch (err) {
        console.error('❌ [17:00] Errore item R1:', err.message);
        itemErrors.push({ itemKey: 'R1', error: err });
      }
    }

    if (itemErrors.length > 0) {
      const combined = new Error(itemErrors.map(e => `${e.itemKey}: ${e.error?.message || e.error}`).join(' | '));
      combined.pendingItems = itemErrors.map(e => e.itemKey);
      throw combined;
    }

    const recoveryPrefix = currentAttempt > 1 ? `Auto-recuperato al tentativo ${currentAttempt}/${MAX_SLOT_ATTEMPTS}. ` : '';
    await sendPublishedLog({
      brand: 'village',
      channel: '👥 Gruppo Facebook Koh Phayam + 🎵 TikTok/IG Stories',
      format: 'R1 / P1 / V3',
      title: 'Stories Serali Ranong & Phayam + Post Ristorante R1',
      details: `${recoveryPrefix}Consegnate 2 Stories 9:16 su Topic 3 (P1 Pizza + V3 Villaggio) e 1 Reel R1 Ristorante su Topic 2 con testo bilingue 🇬🇧+🇹🇭 e tasti interattivi`
    });
    executedSummary = {
      brand: 'village',
      title: 'Stories Serali Ranong & Phayam + Post Ristorante R1',
      details: `${recoveryPrefix}Consegnate 2 Stories su Topic 3 e 1 Reel R1 su Topic 2`
    };
  } else if (is1800) {
    console.log(`🌿 [18:00 BANGKOK] Slot Story Serale — PUBBLICAZIONE INSTAGRAM STORIES V3`);
    const sunsetRes = await renderVideoMode('V3');
    const { videoUrl, buffer } = await ensureCloudVideoUrl(sunsetRes.filePath);
    executedSummary = await runAutomatedChannelSlot({
      slot: '18:00',
      brand: 'village',
      channel: '📸 Instagram Stories',
      format: 'V3',
      title: 'Atmosfera Tropicale Serale a Koh Phayam',
      publishFn: () => publishToInstagram({ videoUrl, videoBuffer: buffer, brand: 'village', isStory: true }),
      fallbackTopicId: TOPIC_TIKTOK_STORIES,
      fallbackTitle: 'V3 Storia Serale a Koh Phayam',
      filePath: sunsetRes.filePath,
      attempt: currentAttempt,
      lastNotice: currentLastNotice,
      fallbackActionText: 'Video master recapitato su Telegram Topic 3 per pubblicazione manuale con 1 tocco dello staff.'
    });
  } else if (is1830) {
    console.log(`🎵 [18:30 BANGKOK] Slot TikTok Feed (Post Feed 9:16) — Invio Automatico Bozza con Notifica Push`);
    const p1Res = await renderVideoMode('P1');
    const { buffer } = await ensureCloudVideoUrl(p1Res.filePath);
    executedSummary = await runAutomatedChannelSlot({
      slot: '18:30',
      brand: 'pizza',
      channel: '🎵 TikTok (@flowerpowerpizzaranong)',
      format: 'P1',
      title: 'Video Serale Pizza 48h inviato alle Bozze TikTok',
      publishFn: async () => {
        const ttRes = await publishToTikTokDraft({ videoBuffer: buffer, brand: 'pizza' });
        return { ...ttRes, mediaId: ttRes.publish_id };
      },
      fallbackTopicId: TOPIC_TIKTOK_STORIES,
      fallbackTitle: 'P1 Video Serale Ranong — TikTok Stories',
      filePath: p1Res.filePath,
      attempt: currentAttempt,
      lastNotice: currentLastNotice,
      successDetails: 'Video MP4 HD caricato direttamente nelle bozze TikTok di @flowerpowerpizzaranong. Notifica push inviata allo smartphone: tocca per pubblicare con 1 tocco!',
      fallbackActionText: 'Video inviato a Telegram Topic 3 per pubblicazione manuale.'
    });
  } else if (is1930) {
    console.log(`🍕 [19:30 BANGKOK] Slot Cena Ranong — PUBBLICAZIONE 100% AUTOMATICA FACEBOOK REEL`);
    const p1Res = await renderVideoMode('P1');
    const { videoUrl, buffer } = await ensureCloudVideoUrl(p1Res.filePath);
    const p1Caption = getBilingualPostCopy('P1', 'pizza', p1Res.copy);
    executedSummary = await runAutomatedChannelSlot({
      slot: '19:30',
      brand: 'pizza',
      channel: '📘 Facebook Pagina (Reel Cena 48h)',
      format: 'P1',
      title: 'Cena Pizza Tradizionale Ranong 48h',
      publishFn: () => publishToFacebook({
        videoUrl,
        videoBuffer: buffer,
        title: 'Cena Pizza Tradizionale Ranong 🍕 Impasto Naturale 48h',
        caption: p1Caption,
        brand: 'pizza',
        isStory: false
      }),
      fallbackTopicId: TOPIC_TIKTOK_STORIES,
      fallbackTitle: 'Cena Pizza Tradizionale Ranong 48h · Reel Pagina Facebook',
      fallbackCopyText: p1Caption,
      filePath: p1Res.filePath,
      attempt: currentAttempt,
      lastNotice: currentLastNotice,
      fallbackActionText: 'Video master recapitato su Telegram Topic 3 per pubblicazione manuale con 1 tocco dello staff.'
    });
  } else if (is2000) {
    console.log(`☕ [20:00 BANGKOK] Slot Story Serale — PUBBLICAZIONE 100% AUTOMATICA FACEBOOK STORIES`);
    const p3Res = await renderVideoMode('P3');
    const { videoUrl, buffer } = await ensureCloudVideoUrl(p3Res.filePath);
    executedSummary = await runAutomatedChannelSlot({
      slot: '20:00',
      brand: 'pizza',
      channel: '📘 Facebook Pagina (Story Serale)',
      format: 'P3',
      title: 'Dessert Artigianali & Serata Ranong',
      publishFn: () => publishToFacebook({
        videoUrl,
        videoBuffer: buffer,
        brand: 'pizza',
        isStory: true
      }),
      fallbackTopicId: TOPIC_TIKTOK_STORIES,
      fallbackTitle: 'P3 Story Dolce & Serata Pizzeria Ranong',
      filePath: p3Res.filePath,
      attempt: currentAttempt,
      lastNotice: currentLastNotice,
      fallbackActionText: 'Video master recapitato su Telegram Topic 3 per pubblicazione immediata con 1 tocco dello staff.'
    });
  } else if (is2030) {
    console.log(`🍝 [20:30 BANGKOK] Slot Cena Categoria Pizza — PUBBLICAZIONE 100% AUTOMATICA INSTAGRAM REEL P2`);
    const p2Res = await renderVideoMode('P2');
    const { videoUrl, buffer } = await ensureCloudVideoUrl(p2Res.filePath);
    const p2Caption = getBilingualPostCopy('P2', 'pizza', p2Res.copy);
    executedSummary = await runAutomatedChannelSlot({
      slot: '20:30',
      brand: 'pizza',
      channel: '📸 Instagram Reels (Pizza Cena Categoria)',
      format: 'P2',
      title: 'Cena Italiana Ranong · 3 Piatti Stessa Categoria',
      publishFn: () => publishToInstagram({
        videoUrl,
        videoBuffer: buffer,
        caption: p2Caption,
        brand: 'pizza',
        isStory: false
      }),
      fallbackTopicId: TOPIC_TIKTOK_STORIES,
      fallbackTitle: 'P2 Reel Cena Pizzeria Ranong · Instagram',
      fallbackCopyText: p2Caption,
      filePath: p2Res.filePath,
      attempt: currentAttempt,
      lastNotice: currentLastNotice,
      fallbackActionText: 'Video master recapitato su Telegram Topic 3 per pubblicazione manuale con 1 tocco dello staff.'
    });
  } else if (is2100) {
    console.log(`🌙 [21:00 BANGKOK] Slot Notte — PUBBLICAZIONE 100% AUTOMATICA INSTAGRAM REEL`);
    const v3Res = await renderVideoMode('V3');
    const { videoUrl, buffer } = await ensureCloudVideoUrl(v3Res.filePath);
    const v3Caption = getBilingualPostCopy('V3', 'village', v3Res.copy);
    executedSummary = await runAutomatedChannelSlot({
      slot: '21:00',
      brand: 'village',
      channel: '📸 Instagram Reels',
      format: 'V3',
      title: 'Notte Tropical Escape Phayam',
      publishFn: () => publishToInstagram({
        videoUrl,
        videoBuffer: buffer,
        caption: v3Caption,
        brand: 'village',
        isStory: false
      }),
      fallbackTopicId: TOPIC_TIKTOK_STORIES,
      fallbackTitle: 'V3 Reel Notte Tropicale a Koh Phayam · Instagram & TikTok',
      filePath: v3Res.filePath,
      attempt: currentAttempt,
      lastNotice: currentLastNotice,
      fallbackActionText: 'Video master Full HD archiviato su Google Drive 5TB e consegnato su Telegram Topic 3 con tasti per pubblicazione immediata con 1 tocco dello staff.'
    });
  } else {
    console.log(`ℹ️ Nessun evento programmato per lo slot ${targetSlot}. Scheduler a riposo.`);
  }

  if (executedSummary) {
    await cleanupResolvedNotices({ slot: targetSlot, attempt: currentAttempt, lastNotice: currentLastNotice });
    await recordSlotCompleted(targetSlot, executedSummary);
    await writeSocialLog({
      platform: 'scheduler',
      brand: executedSummary.brand || slotMeta.brand,
      message: `Slot ${targetSlot} completato con successo (tentativo ${currentAttempt}/${MAX_SLOT_ATTEMPTS})`
    });
  }

  console.log(`\n🎉 Esecuzione completata con successo!`);
}

if (!isPreflight) {
  try {
    await run();
  } catch (err) {
    if (err?.alreadyHandledFinal) {
      process.exit(1);
    }

    console.error('[scheduler-dispatch] ERRORE DURING EXECUTION:', err);
    await writeSocialLog({
      platform: 'scheduler',
      brand: SLOT_METADATA[targetSlot]?.brand || 'flowerpower',
      message: `Errore slot ${targetSlot || 'Sconosciuto'} (tentativo ${currentAttempt}/${MAX_SLOT_ATTEMPTS})`,
      error: err?.stack || err?.message || String(err)
    });

    const permanent = isPermanentError(err);
    const pendingItems = Array.isArray(err?.pendingItems) ? err.pendingItems : [];

    if (targetSlot && !permanent && currentAttempt < MAX_SLOT_ATTEMPTS) {
      let noticeIds = {
        topic301MsgId: currentLastNotice?.topic301MsgId || null,
        extraNotices: currentLastNotice?.extraNotices || [],
        nextRetryHint: computeNextRetryHint(currentBk)
      };
      try {
        noticeIds = await sendOrUpdateDelayNotice({
          slot: targetSlot,
          attempt: currentAttempt,
          errorSummary: err?.message || String(err),
          lastNotice: currentLastNotice,
          pendingItems
        });
      } catch (noticeErr) {
        console.warn('[scheduler-dispatch] Avviso invio delay notice:', noticeErr.message);
      }

      await recordSlotStatus({
        slot: targetSlot,
        status: 'retry_pending',
        platform: 'telegram_meta',
        brand: SLOT_METADATA[targetSlot]?.brand || 'flowerpower',
        title: SLOT_METADATA[targetSlot]?.label || `Slot ${targetSlot}`,
        copyText: serializeRetryMeta({
          attempt: currentAttempt,
          maxAttempts: MAX_SLOT_ATTEMPTS,
          lastError: String(err?.message || err).slice(0, 400),
          pendingItems,
          topic301MsgId: noticeIds.topic301MsgId,
          extraNotices: noticeIds.extraNotices,
          nextRetryHint: noticeIds.nextRetryHint,
          runId: process.env.GITHUB_RUN_ID || 'local',
          updatedAt: new Date().toISOString()
        })
      });

      console.log(`⏳ [scheduler-dispatch] Slot ${targetSlot} messo in coda auto-recupero (tentativo ${currentAttempt}/${MAX_SLOT_ATTEMPTS}). Prossimo giro ${noticeIds.nextRetryHint}. Uscita pulita senza falso allarme rosso.`);
      process.exit(0);
    } else {
      writeHandledAlertMarker({ handled: true, mode: 'failed_final', slot: targetSlot, attempt: currentAttempt });
      if (targetSlot) {
        await recordSlotStatus({
          slot: targetSlot,
          status: 'failed_final',
          platform: 'telegram_meta',
          brand: SLOT_METADATA[targetSlot]?.brand || 'flowerpower',
          title: SLOT_METADATA[targetSlot]?.label || `Slot ${targetSlot}`,
          copyText: serializeRetryMeta({
            attempt: currentAttempt,
            maxAttempts: MAX_SLOT_ATTEMPTS,
            lastError: String(err?.message || err).slice(0, 400),
            pendingItems,
            topic301MsgId: currentLastNotice?.topic301MsgId || null,
            extraNotices: currentLastNotice?.extraNotices || [],
            runId: process.env.GITHUB_RUN_ID || 'local',
            updatedAt: new Date().toISOString()
          })
        });
      }
      try {
        await sendFailedAlert(
          err,
          `Esecuzione Slot ${targetSlot || 'Sconosciuto'} (${permanent ? 'Errore Token/Credenziali' : `Tentativo Finale ${currentAttempt}/${MAX_SLOT_ATTEMPTS}`})`
        );
      } catch (alertErr) {
        console.error('[scheduler-dispatch] Impossibile recapitare allarme failed:', alertErr.message);
      }
      process.exit(1);
    }
  }
}
