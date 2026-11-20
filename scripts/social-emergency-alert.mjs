/**
 * 🚨 SOCIAL EMERGENCY ALERT DISPATCHER (Topic 301)
 * Gestisce crash imprevisti o timeout (cancelled) del runner GitHub Actions senza MAI duplicare gli avvisi:
 * - Se lo script principale ha già notificato/gestito l'errore (.handled_alert.json), esce in silenzio.
 * - Se siamo al tentativo 1/3 o 2/3, invia il messaggio giallo calmo ⏳ (e nei Topic 2/3 se mancanti),
 *   registra `retry_pending` su Neon per il recupero automatico al giro successivo.
 * - Solo al tentativo finale (3/3) o su slot sconosciuto invia l'allarme rosso 🚨 su Topic 301.
 */
import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import {
  MAX_SLOT_ATTEMPTS,
  SLOT_METADATA,
  TOPIC_FAILED,
  analyzeSlotHistory,
  buildDelayNoticeMessage,
  buildSubTopicNoticeMessage,
  computeNextRetryHint,
  serializeRetryMeta
} from './social-scheduler-core.mjs';

let dbUrl = process.env.NEON_DATABASE_URL;
let fallbackEnvToken = process.env.TELEGRAM_SOCIAL_BOT_TOKEN || '';
if ((!dbUrl || !fallbackEnvToken) && fs.existsSync('.env')) {
  for (const l of fs.readFileSync('.env', 'utf8').split('\n')) {
    const m = l.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    const val = m[2].replace(/^["']|["']$/g, '');
    if (m[1] === 'NEON_DATABASE_URL' && !dbUrl) dbUrl = val;
    if (m[1] === 'TELEGRAM_SOCIAL_BOT_TOKEN' && !fallbackEnvToken) fallbackEnvToken = val;
  }
}

const sql = dbUrl ? neon(dbUrl) : null;
const CHAT_ID = '-1004492692624';

function getBangkokTime() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const bangkok = new Date(utc + (3600000 * 7));
  return { date: bangkok, hour: bangkok.getHours(), min: bangkok.getMinutes() };
}

async function getSocialBotToken() {
  if (sql) {
    try {
      const rows = await sql`SELECT bot_token FROM telegram_config WHERE id = 'social' LIMIT 1;`;
      if (rows?.[0]?.bot_token) return rows[0].bot_token;
    } catch (e) {
      console.warn('[emergency-alert] Avviso lettura Neon:', e.message);
    }
  }
  return fallbackEnvToken || null;
}

async function sendTelegramMessage(token, { topicId, text }) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      message_thread_id: topicId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    }),
    signal: AbortSignal.timeout(20000)
  });
  return res.json();
}

async function editTelegramMessage(token, { messageId, text }) {
  const res = await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    }),
    signal: AbortSignal.timeout(20000)
  });
  return res.json();
}

async function writeSocialLogSafe({ platform = 'runner_watchdog', brand = 'flowerpower', message = '', error = null }) {
  if (!sql) return;
  try {
    await sql`
      INSERT INTO social_logs (platform, brand, message, error, created_at)
      VALUES (${platform}, ${brand}, ${message.slice(0, 1000)}, ${error ? String(error).slice(0, 2000) : null}, NOW());
    `;
  } catch (e) {
    console.warn('[emergency-alert] Avviso log Neon:', e.message);
  }
}

async function main() {
  const markerPath = path.resolve('scratch/scheduler/.handled_alert.json');
  if (fs.existsSync(markerPath)) {
    console.log('[emergency-alert] ℹ️ Evento già gestito e notificato dal dispatcher (.handled_alert.json presente). Nessun doppio alert inviato.');
    process.exit(0);
  }

  const token = await getSocialBotToken();
  if (!token) {
    console.error('[emergency-alert] ERRORE: Impossibile recuperare il Social Bot Token.');
    process.exit(1);
  }

  const targetSlot = (process.env.TARGET_SLOT || '').trim();
  const rawAttempt = Number(process.env.ATTEMPT || '0') || 0;
  const jobStatus = (process.env.JOB_STATUS || 'failure').trim();
  const isTimeoutOrCancelled = /cancel/i.test(jobStatus);
  const runId = process.env.GITHUB_RUN_ID || 'manual';
  const repo = process.env.GITHUB_REPOSITORY || 'redflowerpower-svg/flowerpowervillage';
  const workflow = process.env.GITHUB_WORKFLOW || 'Social Media Studio Scheduler (24/7 Serverless)';
  const runUrl = `https://github.com/${repo}/actions/runs/${runId}`;

  const bkTime = getBangkokTime();
  let slotState = null;
  if (targetSlot && sql) {
    try {
      const todayRows = await sql`
        SELECT id, slot, status, copy_text, created_at
        FROM social_scheduled_posts
        WHERE (created_at AT TIME ZONE 'Asia/Bangkok')::date = (NOW() AT TIME ZONE 'Asia/Bangkok')::date
        ORDER BY created_at ASC;
      `;
      const history = analyzeSlotHistory(todayRows || []);
      slotState = history[targetSlot] || null;
    } catch (e) {
      console.warn('[emergency-alert] Avviso analisi storico Neon:', e.message);
    }
  }

  const attempt = targetSlot
    ? Math.max(rawAttempt, (slotState?.failedAttempts || 0) + 1)
    : Math.max(rawAttempt, MAX_SLOT_ATTEMPTS);

  const slotMeta = targetSlot ? (SLOT_METADATA[targetSlot] || { label: `Slot ${targetSlot}`, brand: 'flowerpower', items: ['MAIN'], itemTopics: {} }) : null;

  // Caso A: Slot noto e tentativi < 3 => avviso calmo ⏳ + messa in coda retry_pending
  if (targetSlot && attempt < MAX_SLOT_ATTEMPTS) {
    const completedItems = slotState?.completedItems || new Set();
    const pendingItems = (slotMeta?.items || []).filter(k => k !== 'MAIN' && !completedItems.has(k));
    const nextRetryHint = computeNextRetryHint(bkTime);
    const reasonSummary = isTimeoutOrCancelled
      ? 'Il server cloud ha superato il tempo massimo o è stato interrotto (timeout/cancelled).'
      : 'Interruzione imprevista dell’ambiente cloud prima del completamento.';

    const delayText = buildDelayNoticeMessage({
      slot: targetSlot,
      slotLabel: slotMeta.label,
      attempt,
      maxAttempts: MAX_SLOT_ATTEMPTS,
      reasonSummary,
      nextRetryHint,
      pendingItems,
      isRunnerTimeout: isTimeoutOrCancelled
    });

    let topic301MsgId = slotState?.lastNotice?.topic301MsgId || null;
    if (topic301MsgId) {
      const ed = await editTelegramMessage(token, { messageId: topic301MsgId, text: delayText }).catch(() => null);
      if (!ed?.ok) {
        const sent = await sendTelegramMessage(token, { topicId: TOPIC_FAILED, text: delayText });
        if (sent?.result?.message_id) topic301MsgId = sent.result.message_id;
      }
    } else {
      const sent = await sendTelegramMessage(token, { topicId: TOPIC_FAILED, text: delayText });
      if (sent?.result?.message_id) topic301MsgId = sent.result.message_id;
    }

    const extraNotices = Array.isArray(slotState?.lastNotice?.extraNotices) ? [...slotState.lastNotice.extraNotices] : [];
    const itemTopics = slotMeta?.itemTopics || {};
    const subTopics = new Set();
    for (const itemKey of pendingItems) {
      if (itemTopics[itemKey]) subTopics.add(itemTopics[itemKey]);
    }
    for (const tId of subTopics) {
      if (!extraNotices.some(n => Number(n?.topicId) === Number(tId))) {
        const subText = buildSubTopicNoticeMessage({
          slot: targetSlot,
          slotLabel: slotMeta.label,
          attempt,
          maxAttempts: MAX_SLOT_ATTEMPTS,
          nextRetryHint
        });
        const subRes = await sendTelegramMessage(token, { topicId: tId, text: subText }).catch(() => null);
        if (subRes?.result?.message_id) {
          extraNotices.push({ topicId: Number(tId), messageId: subRes.result.message_id });
        }
      }
    }

    if (sql) {
      try {
        await sql`
          INSERT INTO social_scheduled_posts (
            platform, brand, slot, title, copy_text, status, created_at, updated_at
          ) VALUES (
            'telegram_meta',
            ${slotMeta.brand || 'flowerpower'},
            ${targetSlot},
            ${slotMeta.label || `Slot ${targetSlot}`},
            ${serializeRetryMeta({
              attempt,
              maxAttempts: MAX_SLOT_ATTEMPTS,
              lastError: reasonSummary,
              pendingItems,
              topic301MsgId,
              extraNotices,
              nextRetryHint,
              runId,
              updatedAt: new Date().toISOString()
            })},
            'retry_pending',
            NOW(),
            NOW()
          );
        `;
      } catch (e) {
        console.warn('[emergency-alert] Avviso salvataggio retry_pending:', e.message);
      }
    }

    await writeSocialLogSafe({
      brand: slotMeta.brand || 'flowerpower',
      message: `Runner ${jobStatus} su slot ${targetSlot} (tentativo ${attempt}/${MAX_SLOT_ATTEMPTS}) · auto-recupero programmato ${nextRetryHint}`,
      error: reasonSummary
    });

    console.log(`[emergency-alert] ⏳ Avviso ritardo inviato e slot ${targetSlot} accodato per recupero automatico (${attempt}/${MAX_SLOT_ATTEMPTS}).`);
    process.exit(0);
  }

  // Caso B: Tentativo finale 3/3 fallito oppure slot non identificabile => Allarme rosso definitivo su Topic 301
  if (targetSlot && sql) {
    try {
      await sql`
        INSERT INTO social_scheduled_posts (
          platform, brand, slot, title, copy_text, status, created_at, updated_at
        ) VALUES (
          'telegram_meta',
          ${slotMeta?.brand || 'flowerpower'},
          ${targetSlot},
          ${slotMeta?.label || `Slot ${targetSlot}`},
          ${serializeRetryMeta({
            attempt,
            maxAttempts: MAX_SLOT_ATTEMPTS,
            lastError: `Runner ${jobStatus} (Run ID ${runId})`,
            topic301MsgId: slotState?.lastNotice?.topic301MsgId || null,
            extraNotices: slotState?.lastNotice?.extraNotices || [],
            runId,
            updatedAt: new Date().toISOString()
          })},
          'failed_final',
          NOW(),
          NOW()
        );
      `;
    } catch (e) {
      console.warn('[emergency-alert] Avviso salvataggio failed_final:', e.message);
    }
  }

  await writeSocialLogSafe({
    brand: slotMeta?.brand || 'flowerpower',
    message: `Runner ${jobStatus} definitivo su slot ${targetSlot || 'Sconosciuto'} (tentativo ${attempt}/${MAX_SLOT_ATTEMPTS})`,
    error: `Run ID ${runId} · Status: ${jobStatus}`
  });

  const text =
    `🚨 <b>[FP SOCIAL STUDIO · ALLARME RUNNER CLOUD]</b>\n\n` +
    `❌ <b>Il Workflow GitHub Actions si è arrestato definitivamente!</b>\n` +
    (targetSlot ? `📍 <b>Slot:</b> <code>${targetSlot}</code> (${slotMeta?.label || targetSlot})\n` : '') +
    `🔁 <b>Tentativo:</b> ${attempt}/${MAX_SLOT_ATTEMPTS} · <b>Stato Job:</b> <code>${jobStatus}</code>\n` +
    `📋 <b>Workflow:</b> <code>${workflow}</code>\n` +
    `🆔 <b>Run ID:</b> <a href="${runUrl}">${runId}</a>\n\n` +
    `⚠️ <i>Tutti i tentativi automatici per questo slot sono stati eseguiti. Cliccare sul link sopra per aprire i log tecnici su GitHub.</i>`;

  console.log('[emergency-alert] Invio alert definitivo su Topic 301...');
  const data = await sendTelegramMessage(token, { topicId: TOPIC_FAILED, text });
  console.log('[emergency-alert] Risultato Telegram:', data);
  if (!data?.ok) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[emergency-alert] Errore imprevisto:', err);
  process.exit(1);
});
