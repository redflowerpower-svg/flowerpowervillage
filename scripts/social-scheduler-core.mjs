/**
 * 🛡️ SOCIAL SCHEDULER CORE — Modulo Puro Resilienza & Auto-Recupero (/social)
 *
 * Logica pura (zero dipendenze esterne) per:
 * - Finestre slot ufficiali e prevenzione dello "slot drift"
 * - Coda di auto-recupero persistente su Neon (fino a 3 tentativi reali entro 3 ore)
 * - Isolamento granulare per singolo contenuto negli slot multipli (08:00 e 17:00)
 * - Classificazione errori transitori vs permanenti (token scaduti / credenziali)
 * - Costruzione messaggi Telegram cortesi di avviso ritardo e conferma risoluzione
 * - Risoluzione sicura binario FFmpeg su disco
 */
import path from 'path';

export const OFFICIAL_SLOTS = [
  '08:00', '09:30', '10:30', '11:30', '12:30', '13:30', '15:00',
  '16:00', '17:00', '18:00', '18:30', '19:30', '20:00', '20:30', '21:00'
];

export const MAX_SLOT_ATTEMPTS = 3;
export const RECOVERY_WINDOW_MINUTES = 180;
export const STALE_IN_PROGRESS_MINUTES = 18;

export const TOPIC_KOH_PHAYAM_GROUP = 2;
export const TOPIC_TIKTOK_STORIES = 3;
export const TOPIC_PUBLISHED = 286;
export const TOPIC_FAILED = 301;

export const SLOT_METADATA = {
  '08:00': {
    label: 'Stories Mattutine + Alloggi LM1',
    brand: 'flowerpower',
    items: ['P1', 'V1', 'LM1'],
    itemTopics: {
      P1: TOPIC_TIKTOK_STORIES,
      V1: TOPIC_TIKTOK_STORIES,
      LM1: TOPIC_KOH_PHAYAM_GROUP
    }
  },
  '09:30': {
    label: 'Instagram Story Mattino (V1)',
    brand: 'village',
    items: ['MAIN'],
    itemTopics: {}
  },
  '10:30': {
    label: 'Instagram Story Pre-Pranzo Pizza (P3)',
    brand: 'pizza',
    items: ['MAIN'],
    itemTopics: {}
  },
  '11:30': {
    label: 'Facebook Reel Pranzo Pasta (P2)',
    brand: 'pizza',
    items: ['MAIN'],
    itemTopics: {}
  },
  '12:30': {
    label: 'Facebook Story Pranzo (P1)',
    brand: 'pizza',
    items: ['MAIN'],
    itemTopics: {}
  },
  '13:30': {
    label: 'Instagram Reel Pranzo Mix Pizza (P3)',
    brand: 'pizza',
    items: ['MAIN'],
    itemTopics: {}
  },
  '15:00': {
    label: 'Instagram Story Pomeriggio Pizza (P1)',
    brand: 'pizza',
    items: ['MAIN'],
    itemTopics: {}
  },
  '16:00': {
    label: 'Instagram Reel Pomeriggio (V2)',
    brand: 'village',
    items: ['MAIN'],
    itemTopics: {}
  },
  '17:00': {
    label: 'Stories Serali + Post Ristorante R1',
    brand: 'village',
    items: ['P1', 'V3', 'R1'],
    itemTopics: {
      P1: TOPIC_TIKTOK_STORIES,
      V3: TOPIC_TIKTOK_STORIES,
      R1: TOPIC_KOH_PHAYAM_GROUP
    }
  },
  '18:00': {
    label: 'Instagram Story Serale (V3)',
    brand: 'village',
    items: ['MAIN'],
    itemTopics: {}
  },
  '18:30': {
    label: 'Bozza TikTok Serale (P1)',
    brand: 'pizza',
    items: ['MAIN'],
    itemTopics: {}
  },
  '19:30': {
    label: 'Facebook Reel Cena Pizza 48h (P1)',
    brand: 'pizza',
    items: ['MAIN'],
    itemTopics: {}
  },
  '20:00': {
    label: 'Facebook Story Serale Dessert (P3)',
    brand: 'pizza',
    items: ['MAIN'],
    itemTopics: {}
  },
  '20:30': {
    label: 'Instagram Reel Cena Categoria Pizza (P2)',
    brand: 'pizza',
    items: ['MAIN'],
    itemTopics: {}
  },
  '21:00': {
    label: 'Instagram Reel Notte (V3)',
    brand: 'village',
    items: ['MAIN'],
    itemTopics: {}
  }
};

export function timeToMinutes(str) {
  if (!str || typeof str !== 'string' || !str.includes(':')) return 0;
  const [h, m] = str.split(':').map(Number);
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

export function getSlotMaxDelayMinutes(slot) {
  if (slot === '21:00' || slot === '08:00') return 50;
  if (['11:30', '13:30', '16:00', '17:00'].includes(slot)) return 35;
  if (slot === '15:00') return 30;
  if (['18:00', '19:30', '20:00', '20:30'].includes(slot)) return 20;
  return 25;
}

export function resolveScheduledSlot(rawSlot, bkTime) {
  if (rawSlot && rawSlot !== 'auto') {
    return OFFICIAL_SLOTS.includes(rawSlot) ? rawSlot : null;
  }
  const nowMins = (bkTime?.hour ?? 0) * 60 + (bkTime?.min ?? 0);
  for (const s of OFFICIAL_SLOTS) {
    const sMins = timeToMinutes(s);
    let diff = nowMins - sMins;
    if (diff < -720) diff += 1440;
    const maxDelay = getSlotMaxDelayMinutes(s);
    if (diff >= -5 && diff <= maxDelay) {
      return s;
    }
  }
  return null;
}

export function computeNextRetryHint(bkTime) {
  const totalMins = (bkTime?.hour ?? 0) * 60 + (bkTime?.min ?? 0);
  const nextTickMins = (Math.floor(totalMins / 30) + 1) * 30;
  const wrapped = ((nextTickMins % 1440) + 1440) % 1440;
  const hh = String(Math.floor(wrapped / 60)).padStart(2, '0');
  const mm = String(wrapped % 60).padStart(2, '0');
  return `~${hh}:${mm}`;
}

export function parseRetryMeta(copyText) {
  if (!copyText || typeof copyText !== 'string') return {};
  const trimmed = copyText.trim();
  if (!trimmed.startsWith('{')) return {};
  try {
    const parsed = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return {
      attempt: Number.isFinite(Number(parsed.attempt)) ? Number(parsed.attempt) : undefined,
      maxAttempts: Number.isFinite(Number(parsed.maxAttempts)) ? Number(parsed.maxAttempts) : undefined,
      lastError: typeof parsed.lastError === 'string' ? parsed.lastError : undefined,
      pendingItems: Array.isArray(parsed.pendingItems) ? parsed.pendingItems.filter(Boolean) : undefined,
      topic301MsgId: parsed.topic301MsgId ?? null,
      extraNotices: Array.isArray(parsed.extraNotices) ? parsed.extraNotices : [],
      nextRetryHint: typeof parsed.nextRetryHint === 'string' ? parsed.nextRetryHint : undefined,
      runId: parsed.runId ? String(parsed.runId) : undefined,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : undefined
    };
  } catch {
    return {};
  }
}

export function serializeRetryMeta(meta) {
  return JSON.stringify(meta || {});
}

export function analyzeSlotHistory(todayRows = [], nowMs = Date.now(), options = {}) {
  const excludeRunId = options?.excludeRunId ? String(options.excludeRunId) : '';
  const state = {};
  const masterRowsBySlot = {};

  for (const s of OFFICIAL_SLOTS) {
    state[s] = {
      completed: false,
      failedFinal: false,
      activeInProgress: false,
      failedAttempts: 0,
      completedItems: new Set(),
      lastNotice: { topic301MsgId: null, extraNotices: [] },
      lastError: null
    };
    masterRowsBySlot[s] = [];
  }

  for (const row of todayRows || []) {
    const rawSlot = String(row?.slot || '');
    if (!rawSlot) continue;
    if (rawSlot.includes('::')) {
      const [masterSlot, itemKey] = rawSlot.split('::');
      if (state[masterSlot] && itemKey && row.status === 'completed') {
        state[masterSlot].completedItems.add(itemKey);
      }
    } else if (masterRowsBySlot[rawSlot]) {
      masterRowsBySlot[rawSlot].push(row);
    }
  }

  for (const s of OFFICIAL_SLOTS) {
    const allRows = masterRowsBySlot[s].slice().sort((a, b) => {
      const ta = a?.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b?.created_at ? new Date(b.created_at).getTime() : 0;
      return ta - tb;
    });

    const rows = excludeRunId
      ? allRows.filter((row) => {
          if (String(row?.status || '') !== 'in_progress') return true;
          return parseRetryMeta(row?.copy_text).runId !== excludeRunId;
        })
      : allRows;

    const st = state[s];
    let failedAttempts = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const status = String(row?.status || '');
      const meta = parseRetryMeta(row?.copy_text);

      if (meta.lastError) {
        st.lastError = meta.lastError;
      }

      if (status === 'completed') {
        st.completed = true;
        st.activeInProgress = false;
      } else if (status === 'failed_final') {
        st.failedFinal = true;
        st.activeInProgress = false;
        failedAttempts = Math.max(failedAttempts + 1, meta.attempt || MAX_SLOT_ATTEMPTS);
      } else if (status === 'retry_pending') {
        failedAttempts = Math.max(failedAttempts + 1, meta.attempt || 1);
      } else if (status === 'in_progress') {
        const nextRow = rows[i + 1];
        if (!nextRow) {
          const createdMs = row?.created_at ? new Date(row.created_at).getTime() : nowMs;
          const ageMinutes = (nowMs - createdMs) / 60_000;
          if (ageMinutes >= STALE_IN_PROGRESS_MINUTES) {
            failedAttempts = Math.max(failedAttempts + 1, meta.attempt || 1);
          } else {
            st.activeInProgress = true;
          }
        } else if (String(nextRow.status || '') === 'in_progress') {
          // Tentativo precedente interrotto bruscamente senza stato di chiusura
          failedAttempts = Math.max(failedAttempts + 1, meta.attempt || 1);
        }
      }
    }

    st.failedAttempts = failedAttempts;

    // Estrae l'ultimo topic301MsgId e tutte le extraNotices univoche da tutti i log dello slot
    let latestTopic301MsgId = null;
    const noticeMap = new Map();
    for (let i = allRows.length - 1; i >= 0; i--) {
      const meta = parseRetryMeta(allRows[i]?.copy_text);
      if (latestTopic301MsgId == null && meta.topic301MsgId != null) {
        latestTopic301MsgId = meta.topic301MsgId;
      }
      if (Array.isArray(meta.extraNotices)) {
        for (const n of meta.extraNotices) {
          if (n && n.topicId != null && n.messageId != null) {
            const k = `${n.topicId}:${n.messageId}`;
            if (!noticeMap.has(k)) {
              noticeMap.set(k, { topicId: Number(n.topicId), messageId: n.messageId });
            }
          }
        }
      }
    }
    st.lastNotice = {
      topic301MsgId: latestTopic301MsgId,
      extraNotices: Array.from(noticeMap.values())
    };
  }

  return state;
}

export function selectSlotToExecute({
  rawSlot = '',
  bkTime,
  nowMs = Date.now(),
  todayRows = [],
  forceRun = false,
  dryRun = false
} = {}) {
  const history = analyzeSlotHistory(todayRows, nowMs);

  // 1. Slot esplicito (es. workflow_dispatch --slot=17:00)
  if (rawSlot && rawSlot !== 'auto') {
    if (!OFFICIAL_SLOTS.includes(rawSlot)) {
      return { slot: null, reason: 'invalid_slot' };
    }
    const st = history[rawSlot];
    if (!dryRun && !forceRun && st.completed) {
      return { slot: null, reason: 'already_completed', state: st };
    }
    const attempt = Math.min(st.failedAttempts + 1, MAX_SLOT_ATTEMPTS);
    return {
      slot: rawSlot,
      reason: 'explicit',
      attempt,
      isRecovery: st.failedAttempts > 0,
      completedItems: st.completedItems,
      lastNotice: st.lastNotice,
      state: st
    };
  }

  // 2. Slot corrente nella finestra oraria programmata
  const sched = resolveScheduledSlot('', bkTime);
  if (sched) {
    const st = history[sched];
    if (!st.completed && !st.failedFinal && !st.activeInProgress && st.failedAttempts < MAX_SLOT_ATTEMPTS) {
      return {
        slot: sched,
        reason: st.failedAttempts > 0 ? 'retry_in_window' : 'scheduled',
        attempt: st.failedAttempts + 1,
        isRecovery: st.failedAttempts > 0,
        completedItems: st.completedItems,
        lastNotice: st.lastNotice,
        state: st
      };
    }
  }

  // 3. Coda di auto-recupero: slot di oggi entro 180 minuti non ancora completati
  const nowMins = (bkTime?.hour ?? 0) * 60 + (bkTime?.min ?? 0);
  for (const s of OFFICIAL_SLOTS) {
    const sMins = timeToMinutes(s);
    const elapsed = nowMins - sMins;
    if (elapsed > 0 && elapsed <= RECOVERY_WINDOW_MINUTES) {
      const st = history[s];
      if (!st.completed && !st.failedFinal && !st.activeInProgress && st.failedAttempts < MAX_SLOT_ATTEMPTS) {
        return {
          slot: s,
          reason: 'recovery_queue',
          attempt: st.failedAttempts + 1,
          isRecovery: true,
          completedItems: st.completedItems,
          lastNotice: st.lastNotice,
          state: st
        };
      }
    }
  }

  // 4. Nessuno slot da eseguire
  return { slot: null, reason: 'idle' };
}

export function isPermanentError(err) {
  const msg = String(err?.message || err || '');
  if (!msg) return false;

  const permanentPatterns = [
    /"code"\s*:\s*190\b/i,
    /Error validating access token/i,
    /Session has expired/i,
    /Invalid OAuth access token/i,
    /Meta Page Token mancante/i,
    /Token Telegram non trovato/i,
    /Token TikTok non trovato/i,
    /scope_not_authorized/i,
    /token_revoked/i,
    /refresh_token_invalid/i
  ];

  return permanentPatterns.some(rx => rx.test(msg));
}

export function escapeHtmlSafe(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function buildDelayNoticeMessage({
  slot,
  slotLabel,
  attempt = 1,
  maxAttempts = MAX_SLOT_ATTEMPTS,
  reasonSummary = '',
  nextRetryHint = '',
  pendingItems = [],
  isRunnerTimeout = false
}) {
  const label = slotLabel || SLOT_METADATA[slot]?.label || `Slot ${slot}`;
  const defaultReason = isRunnerTimeout
    ? 'Il server cloud ha impiegato più tempo del previsto (timeout/interruzione runner).'
    : 'Errore tecnico temporaneo durante preparazione o invio.';
  const cleanReason = escapeHtmlSafe((reasonSummary || defaultReason).slice(0, 320));

  let text = `⏳ <b>[FP SOCIAL STUDIO · RECUPERO AUTOMATICO IN CORSO]</b>\n\n`;
  text += `📍 <b>Slot:</b> <code>${escapeHtmlSafe(slot)}</code> (${escapeHtmlSafe(label)})\n`;
  text += `🔁 <b>Stato:</b> Ritardo tecnico al tentativo <b>${attempt}/${maxAttempts}</b>\n`;
  text += `⚠️ <b>Dettaglio:</b> <i>${cleanReason}</i>\n`;
  if (Array.isArray(pendingItems) && pendingItems.length > 0) {
    text += `📦 <b>Contenuti ancora in coda:</b> <code>${escapeHtmlSafe(pendingItems.join(', '))}</code>\n`;
  }
  text += `\n🔄 <b>Nessuna azione richiesta da te:</b> il sistema si è già attivato in automatico e riproverà al prossimo giro (<b>${escapeHtmlSafe(nextRetryHint || '~30 min')}</b>). Ti avviso appena è risolto!`;
  return text;
}

export function buildSubTopicNoticeMessage({
  slot,
  slotLabel,
  attempt = 1,
  maxAttempts = MAX_SLOT_ATTEMPTS,
  nextRetryHint = ''
}) {
  const label = slotLabel || SLOT_METADATA[slot]?.label || `Slot ${slot}`;
  return (
    `⏳ <b>Ritardo tecnico sullo slot <code>${escapeHtmlSafe(slot)}</code></b> (${escapeHtmlSafe(label)})\n` +
    `🔄 Il sistema si è già attivato per il recupero automatico (tentativo ${attempt}/${maxAttempts}, prossimo giro <b>${escapeHtmlSafe(nextRetryHint || '~30 min')}</b>).\n` +
    `<i>Questo avviso sparirà automaticamente appena arriva il contenuto definitivo.</i>`
  );
}

export function buildResolvedNoticeMessage({
  slot,
  slotLabel,
  attempt = 2,
  maxAttempts = MAX_SLOT_ATTEMPTS
}) {
  const label = slotLabel || SLOT_METADATA[slot]?.label || `Slot ${slot}`;
  return (
    `✅ <b>[FP SOCIAL STUDIO · RISOLTO IN AUTOMATICO]</b>\n\n` +
    `📍 <b>Slot:</b> <code>${escapeHtmlSafe(slot)}</code> (${escapeHtmlSafe(label)})\n` +
    `🎉 Recuperato con successo al tentativo <b>${attempt}/${maxAttempts}</b>! Nessun intervento necessario.`
  );
}

export function resolveFfmpegBinary({
  envPath = '',
  homeDir = '',
  ffmpegStaticPath = '',
  ffmpegInstallerPath = '',
  existsSyncFn = () => false
} = {}) {
  const candidates = [];
  const add = (p) => {
    if (p && typeof p === 'string' && !candidates.includes(p)) {
      candidates.push(p);
    }
  };

  add(envPath);
  if (homeDir) {
    add(path.join(homeDir, '.cache', 'fp-ffmpeg', 'ffmpeg'));
  }
  add(ffmpegStaticPath);
  add(ffmpegInstallerPath);
  add('/usr/bin/ffmpeg');
  add('/usr/local/bin/ffmpeg');

  for (const c of candidates) {
    try {
      if (existsSyncFn(c)) {
        return c;
      }
    } catch { }
  }
  return null;
}

export function buildFiniteAudioMuxArgs({
  rawPath,
  bgPath,
  sfxPath,
  delayMs,
  durationSec,
  outPath
}) {
  const safeDur = Number.isFinite(Number(durationSec)) && Number(durationSec) > 0.5
    ? Number(durationSec)
    : 15;
  const exactDur = safeDur.toFixed(3);
  const padDur = (safeDur + 0.5).toFixed(2);
  const safeDelay = Math.max(0, Math.round(Number(delayMs) || 0));

  return [
    '-nostdin', '-y', '-v', 'warning',
    '-i', rawPath,
    '-i', bgPath,
    '-i', sfxPath,
    '-filter_complex',
    `[1:a]volume=1.0,apad=whole_dur=${padDur},atrim=0:${exactDur}[bg];[2:a]adelay=${safeDelay}|${safeDelay},volume=1.8,atrim=0:${exactDur}[sfx];[bg][sfx]amix=inputs=2:duration=first:dropout_transition=2,atrim=0:${exactDur}[a]`,
    '-map', '0:v', '-map', '[a]',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
    '-movflags', '+faststart',
    '-t', exactDur,
    outPath
  ];
}

export const EXPECTED_BRAND_BY_MODE = {
  P1: 'pizza',
  P2: 'pizza',
  P3: 'pizza',
  DS: 'pizza',
  V1: 'village',
  V2: 'village',
  V3: 'village',
  LM1: 'village',
  R1: 'village'
};

export const MIN_SCENES_BY_MODE = {
  P1: 1,
  P2: 2,
  P3: 2,
  DS: 1,
  V1: 1,
  V2: 4,
  V3: 4,
  LM1: 1,
  R1: 3
};

/**
 * Valida il contratto formato/brand/scene contro ogni contaminazione cross-reparto prima di esportare o pubblicare.
 */
export function validateRenderedModeContract({
  requestedMode,
  actualMode,
  actualBrand,
  sceneCount,
  isEmptyShowcase = false
} = {}) {
  const req = String(requestedMode || '').toUpperCase();
  const expectedBrand = EXPECTED_BRAND_BY_MODE[req];
  if (!expectedBrand) {
    return { ok: false, reason: `Formato richiesto sconosciuto: "${requestedMode}"` };
  }

  const actMode = String(actualMode || '').toUpperCase();
  if (actMode !== req) {
    return {
      ok: false,
      reason: `Contaminazione formato: richiesto ${req}, generato ${actMode || 'N/D'}`
    };
  }

  const actBrand = String(actualBrand || '').toLowerCase();
  if (actBrand !== expectedBrand) {
    return {
      ok: false,
      reason: `Contaminazione brand su ${req}: atteso "${expectedBrand}", generato "${actBrand || 'N/D'}"`
    };
  }

  if (sceneCount !== undefined && sceneCount !== null) {
    const minScenes = MIN_SCENES_BY_MODE[req] || 1;
    const countNum = Number(sceneCount);
    const allowEmptyDs = req === 'DS' && !!isEmptyShowcase;
    if (!allowEmptyDs && (!Number.isFinite(countNum) || countNum < minScenes)) {
      return {
        ok: false,
        reason: `Scene insufficienti per ${req}: attese >= ${minScenes}, trovate ${sceneCount}`
      };
    }
  }

  return { ok: true, expectedBrand };
}
