/**
 * ⚡ Motore Serverless Permanente: Sconti a Cascata Last-Minute (3 Stadi Sequenziali)
 * Sincronizzazione automatica 24/7 su Octorate PMS (Regola d'Oro: Sempre e solo Livello 0).
 *
 * Architettura Bidirezionale (Octorate Portal <-> Dashboard):
 * - Octorate è l'unica fonte di verità per i prezzi base.
 * - La tabella esistente `telegram_config` (record `cascade_price_ledger_v1`) memorizza
 *   solo lo stato degli sconti applicati per ciascun `(motherId, date)` nella finestra
 *   mobile di 8 giorni, evitando doppi sconti e preservando qualsiasi modifica manuale
 *   eseguita sia dal portale Octorate sia dalla Dashboard.
 */
import { formatDateDMY, formatAllDatesToDMY } from "./date-formatter.js";
import { ALL_OCTORATE_STRUCTURE_IDS } from "./octorate-structures.js";
import {
  getActiveJungleSource,
  getJungleTwinPairByRateId,
  isLowSeasonKeepAliveDate,
  JungleSourceStructureId
} from "./octorate-jungle-mirror.js";

export interface CascadeRoomConfig {
  motherId: number;
  name: string;
  /** Usato esclusivamente come fallback di migrazione iniziale o se Octorate non restituisce dati */
  basePrice: number;
}

export const CASCADE_MOTHER_ROOMS: CascadeRoomConfig[] = [
  { motherId: 529773, name: 'Jungle Villa 2', basePrice: 2290 },
  { motherId: 495795, name: 'Jungle Villa Left 2', basePrice: 1290 },
  { motherId: 495796, name: 'Jungle Villa Right 2', basePrice: 1290 },
  { motherId: 494840, name: 'Peace & Love Villa 2', basePrice: 1290 },
  { motherId: 960389, name: 'Jungle Villa', basePrice: 2290 },
  { motherId: 960385, name: 'Jungle Villa Left', basePrice: 1290 },
  { motherId: 960387, name: 'Jungle Villa Right', basePrice: 1290 },
  { motherId: 960383, name: 'Peace & Love Villa', basePrice: 1290 },
  { motherId: 421511, name: 'Villa Penthouse', basePrice: 1290 },
  { motherId: 293957, name: 'Yellow Bungalow', basePrice: 990 },
  { motherId: 293954, name: 'Red Bungalow', basePrice: 790 },
  { motherId: 293962, name: 'Green Bungalow', basePrice: 790 },
  { motherId: 293965, name: 'Camel Tent', basePrice: 430 },
  { motherId: 293955, name: 'Lagoon Tent', basePrice: 430 },
  { motherId: 293942, name: 'Internal Room', basePrice: 430 },
  { motherId: 293963, name: 'Room 1', basePrice: 10000 },
  { motherId: 293959, name: 'Room 2', basePrice: 10000 },
  { motherId: 293948, name: 'Room 3', basePrice: 10000 },
  { motherId: 293945, name: 'Room 4', basePrice: 10000 },
  { motherId: 293943, name: 'Room 5', basePrice: 10000 },
  { motherId: 293951, name: 'Lodge 1', basePrice: 10000 },
  { motherId: 883795, name: 'Lodge 2', basePrice: 10000 },
  { motherId: 649669, name: 'Fake Bungalow 1', basePrice: 1000 },
  { motherId: 921799, name: 'Fake Bungalow 2', basePrice: 1000 }
];

const CASCADE_MOTHER_ID_SET = new Set<number>(CASCADE_MOTHER_ROOMS.map(r => r.motherId));
const CASCADE_LEDGER_ROW_ID = 'cascade_price_ledger_v1';
const SYNC_COOLDOWN_MS = 60 * 1000; // 1 minuto anti-burst in memoria serverless

export interface CascadeLedgerEntry {
  basePrice: number;
  discountPct: number;
  discountedPrice: number;
  updatedAt: string;
}

export type CascadeLedger = Record<string, CascadeLedgerEntry>;

export function getThailandTodayStr(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  } catch {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }
}

export function addDaysToDate(baseDateStr: string, days: number): string {
  const [y, m, d] = baseDateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getStageDiscountPctForOffset(offset: number): number {
  if (offset < 0 || offset >= 7) return 0;
  if (offset < 3) return 10;
  if (offset < 5) return 5;
  return 2.5;
}

export function computeDiscountedPrice(basePrice: number, discountPct: number): number {
  if (discountPct <= 0) return Math.round(basePrice);
  return Math.round(basePrice * (1 - discountPct / 100));
}

export async function loadCascadeLedger(supabaseAdmin: any): Promise<CascadeLedger> {
  if (!supabaseAdmin) return {};
  try {
    const { data, error } = await supabaseAdmin
      .from('telegram_config')
      .select('bot_token')
      .eq('id', CASCADE_LEDGER_ROW_ID)
      .maybeSingle();

    if (error || !data?.bot_token) return {};
    const parsed = JSON.parse(data.bot_token);
    return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
  } catch (err) {
    console.warn('[Cascade Ledger Load Warning]:', err);
    return {};
  }
}

export async function saveCascadeLedger(
  supabaseAdmin: any,
  ledger: CascadeLedger,
  todayStr: string = getThailandTodayStr()
): Promise<void> {
  if (!supabaseAdmin) return;
  try {
    // Pulizia automatica chiavi passate per mantenere compatto il record JSON
    const pruned: CascadeLedger = {};
    for (const [key, entry] of Object.entries(ledger)) {
      const sepIdx = key.lastIndexOf('_');
      const datePart = sepIdx >= 0 ? key.slice(sepIdx + 1) : '';
      if (datePart >= todayStr && entry && typeof entry.basePrice === 'number') {
        pruned[key] = entry;
      }
    }

    await supabaseAdmin.from('telegram_config').upsert({
      id: CASCADE_LEDGER_ROW_ID,
      bot_token: JSON.stringify(pruned),
      chat_id: 'cascade_ledger',
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[Cascade Ledger Save Warning]:', err);
  }
}

/**
 * Invalida le voci del ledger per gli alloggi e gli intervalli modificati manualmente
 * dalla Dashboard, così la successiva sincronizzazione acquisisce subito i nuovi prezzi base.
 */
export async function invalidateCascadeLedgerEntries(
  supabaseAdmin: any,
  updates: Array<{ roomMotherId: number; dateFrom: string; dateTo: string }>
): Promise<void> {
  if (!supabaseAdmin || !Array.isArray(updates) || updates.length === 0) return;
  try {
    const todayStr = getThailandTodayStr();
    const ledger = await loadCascadeLedger(supabaseAdmin);
    let changed = false;

    for (const u of updates) {
      const rId = Number(u.roomMotherId);
      if (!rId || !u.dateFrom || !u.dateTo) continue;
      for (const key of Object.keys(ledger)) {
        const prefix = `${rId}_`;
        if (key.startsWith(prefix)) {
          const datePart = key.slice(prefix.length);
          if (datePart >= u.dateFrom && datePart <= u.dateTo) {
            delete ledger[key];
            changed = true;
          }
        }
      }
    }

    if (changed) {
      await saveCascadeLedger(supabaseAdmin, ledger, todayStr);
    }
  } catch (err) {
    console.warn('[Cascade Ledger Invalidate Warning]:', err);
  }
}

// Cooldown volatile per istanza serverless
let lastSyncTimestampMs = 0;

async function sendTelegramAlert(supabase: any, message: string): Promise<void> {
  if (!supabase) return;
  try {
    const { data: config } = await supabase
      .from('telegram_config')
      .select('bot_token, chat_id')
      .eq('id', 'village')
      .maybeSingle();

    const botToken = config?.bot_token || process.env.TELEGRAM_VILLAGE_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN_VILLAGE;
    const chatId = config?.chat_id || process.env.TELEGRAM_VILLAGE_CHAT_ID || process.env.TELEGRAM_CHAT_ID_VILLAGE;

    if (!botToken || !chatId) {
      console.log('[Cascade Telegram Alert] Village Telegram Bot not configured yet. Skipping alert to avoid mixing with Pizzeria.');
      return;
    }

    const cleanMessage = formatAllDatesToDMY(message);
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: cleanMessage,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
  } catch (err) {
    console.warn('[Cascade Telegram Alert Warning]:', err);
  }
}

export interface CascadeSyncPlanInput {
  rooms: CascadeRoomConfig[];
  todayStr: string;
  livePriceMap: Map<string, number>;
  ledger: CascadeLedger;
  nowIso?: string;
  activeJungleSource?: JungleSourceStructureId;
}

export interface CascadeSyncPlanOutput {
  bulkPayload: Array<{ room: number; dateFrom: string; dateTo: string; values: { price: number } }>;
  nextLedger: CascadeLedger;
  ledgerChanged: boolean;
}

/**
 * Funzione pura e deterministica che confronta i prezzi live su Octorate con il ledger
 * per calcolare solo gli aggiornamenti necessari senza mai sovrascrivere modifiche manuali.
 */
export function buildDynamicCascadeSyncPlan(input: CascadeSyncPlanInput): CascadeSyncPlanOutput {
  const { rooms, todayStr, livePriceMap, ledger } = input;
  const nowIso = input.nowIso || new Date().toISOString();
  const activeJungleSource = input.activeJungleSource || '807324';
  const nextLedger: CascadeLedger = { ...ledger };
  const bulkPayload: Array<{ room: number; dateFrom: string; dateTo: string; values: { price: number } }> = [];
  let ledgerChanged = false;

  for (const room of rooms) {
    const twinPair = getJungleTwinPairByRateId(room.motherId);
    for (let offset = 0; offset <= 7; offset++) {
      const targetDateStr = addDaysToDate(todayStr, offset);

      if (
        activeJungleSource === '366879' &&
        twinPair &&
        twinPair.jungleId === room.motherId &&
        isLowSeasonKeepAliveDate(targetDateStr)
      ) {
        // Regola Standby Asimmetrica: in Bassa Stagione (01 Giu - 31 Ott) Jungle Villas (807324) resta a 2x Keep-Alive
        continue;
      }

      const key = `${room.motherId}_${targetDateStr}`;
      const livePrice = livePriceMap.get(key);

      if (livePrice === undefined || livePrice <= 0) {
        continue;
      }

      const targetDiscountPct = getStageDiscountPctForOffset(offset);
      const existing = nextLedger[key];

      if (existing && existing.discountedPrice === livePrice) {
        // Nessuna modifica manuale rilevata: il prezzo su Octorate corrisponde a quello da noi scritto.
        const basePrice = existing.basePrice;
        if (existing.discountPct === targetDiscountPct) {
          continue;
        }

        const newDiscounted = computeDiscountedPrice(basePrice, targetDiscountPct);
        if (newDiscounted !== livePrice) {
          bulkPayload.push({
            room: room.motherId,
            dateFrom: targetDateStr,
            dateTo: targetDateStr,
            values: { price: newDiscounted }
          });
        }

        if (targetDiscountPct === 0) {
          delete nextLedger[key];
        } else {
          nextLedger[key] = {
            basePrice,
            discountPct: targetDiscountPct,
            discountedPrice: newDiscounted,
            updatedAt: nowIso
          };
        }
        ledgerChanged = true;
      } else {
        // Nuova data o modifica manuale rilevata (da Portale Octorate o da Dashboard):
        // Se non esiste ancora alcun record nel ledger ma Octorate ha già lo sconto legacy esatto
        // del vecchio sistema hardcoded, riconosciamo il basePrice legacy per evitare il doppio sconto
        // alla prima esecuzione post-migrazione.
        let basePrice = livePrice;
        if (
          !existing &&
          targetDiscountPct > 0 &&
          livePrice === computeDiscountedPrice(room.basePrice, targetDiscountPct)
        ) {
          basePrice = room.basePrice;
        }

        const newDiscounted = computeDiscountedPrice(basePrice, targetDiscountPct);

        if (targetDiscountPct === 0) {
          if (existing) {
            delete nextLedger[key];
            ledgerChanged = true;
          }
          continue;
        }

        if (newDiscounted !== livePrice) {
          bulkPayload.push({
            room: room.motherId,
            dateFrom: targetDateStr,
            dateTo: targetDateStr,
            values: { price: newDiscounted }
          });
        }

        nextLedger[key] = {
          basePrice,
          discountPct: targetDiscountPct,
          discountedPrice: newDiscounted,
          updatedAt: nowIso
        };
        ledgerChanged = true;
      }
    }
  }

  return { bulkPayload, nextLedger, ledgerChanged };
}

/**
 * Fetch parallelo della griglia live delle 3 strutture Octorate per la finestra mobile (oggi .. oggi+7).
 */
async function fetchLiveMotherPricesWindow(
  accessToken: string,
  dateFrom: string,
  dateTo: string
): Promise<Map<string, number>> {
  const livePriceMap = new Map<string, number>();

  await Promise.all(ALL_OCTORATE_STRUCTURE_IDS.map(async (structId) => {
    let page = 0;
    const MAX_PAGES = 5;
    while (page < MAX_PAGES) {
      const url = `https://api.octorate.com/connect/rest/v1/calendar/${structId}?dateFrom=${dateFrom}&dateTo=${dateTo}&size=50&page=${page}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
      });
      if (!res.ok) break;

      const json = await res.json();
      const items = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
      if (items.length === 0) break;

      for (const item of items) {
        const idNum = Number(item.id);
        if (!CASCADE_MOTHER_ID_SET.has(idNum)) continue;
        const days = Array.isArray(item.days) ? item.days : [];
        for (const day of days) {
          const dStr = String(day.date || '').slice(0, 10);
          const price = Number(day.price ?? 0);
          if (dStr && price > 0) {
            livePriceMap.set(`${idNum}_${dStr}`, price);
          }
        }
      }

      if (items.length < 50) break;
      page++;
    }
  }));

  return livePriceMap;
}

/**
 * Verifica e sincronizza automaticamente la finestra di sconti a cascata (3 stadi)
 * su Octorate PMS leggendo sempre i prezzi reali live da Octorate.
 */
export async function checkAndSyncCascadeLastMinute(
  accessToken: string,
  supabaseAdmin?: any,
  force: boolean = false
): Promise<{ synced: boolean; message: string; updatesCount?: number }> {
  if (!accessToken) {
    return { synced: false, message: 'Access token mancante per sync sconti a cascata.' };
  }

  const nowMs = Date.now();
  if (!force && nowMs - lastSyncTimestampMs < SYNC_COOLDOWN_MS) {
    return { synced: false, message: 'Sync sconti a cascata in cooldown (1 min).' };
  }

  const todayStr = getThailandTodayStr();
  const windowEndStr = addDaysToDate(todayStr, 7);

  let livePriceMap: Map<string, number>;
  try {
    livePriceMap = await fetchLiveMotherPricesWindow(accessToken, todayStr, windowEndStr);
  } catch (fetchErr) {
    console.warn('[Cascade Live Fetch Warning]:', fetchErr);
    return { synced: false, message: 'Impossibile leggere la griglia live da Octorate.' };
  }

  if (livePriceMap.size === 0) {
    return { synced: false, message: 'Nessun prezzo live restituito da Octorate per la finestra a cascata.' };
  }

  const activeJungleSource = supabaseAdmin ? await getActiveJungleSource(supabaseAdmin) : '807324';
  const ledger = await loadCascadeLedger(supabaseAdmin);
  const { bulkPayload, nextLedger, ledgerChanged } = buildDynamicCascadeSyncPlan({
    rooms: CASCADE_MOTHER_ROOMS,
    todayStr,
    livePriceMap,
    ledger,
    activeJungleSource
  });

  if (bulkPayload.length === 0) {
    if (ledgerChanged) {
      await saveCascadeLedger(supabaseAdmin, nextLedger, todayStr);
    }
    lastSyncTimestampMs = Date.now();
    return { synced: false, message: `Octorate live già allineato con gli sconti a cascata (${todayStr}).` };
  }

  console.log(`⚡ [CASCADE LAST-MINUTE 24/7] Avvio sincronizzazione dinamica (${bulkPayload.length} celle) per ${todayStr}...`);

  const BATCH_SIZE = 25;
  const chunks: Array<typeof bulkPayload> = [];
  for (let i = 0; i < bulkPayload.length; i += BATCH_SIZE) {
    chunks.push(bulkPayload.slice(i, i + BATCH_SIZE));
  }

  let totalSuccessful = 0;

  for (let idx = 0; idx < chunks.length; idx++) {
    const chunk = chunks[idx];
    try {
      const res = await fetch(`https://api.octorate.com/connect/rest/v1/calendar/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(chunk)
      });

      if (res.ok) {
        totalSuccessful += chunk.length;
        console.log(`⚡ [CASCADE LAST-MINUTE] Batch ${idx + 1}/${chunks.length} inviato con successo (${chunk.length} tariffe).`);
      } else {
        const txt = await res.text();
        console.warn(`⚠️ [CASCADE LAST-MINUTE] Batch ${idx + 1}/${chunks.length} Octorate error (${res.status}): ${txt.slice(0, 100)}`);
      }
    } catch (batchErr) {
      console.error(`❌ [CASCADE LAST-MINUTE] Exception on batch ${idx + 1}:`, batchErr);
    }
  }

  if (totalSuccessful > 0) {
    lastSyncTimestampMs = Date.now();
    await saveCascadeLedger(supabaseAdmin, nextLedger, todayStr);
    console.log(`✅ [CASCADE LAST-MINUTE 24/7] Sincronizzazione completata: ${totalSuccessful} tariffe scritte su Octorate PMS.`);

    if (supabaseAdmin) {
      const endWindowStr = addDaysToDate(todayStr, 6);
      const alertMsg = `⚡ <b>[Cascade Last-Minute Auto-Roll]</b>\n` +
        `📅 Finestra Sconti Aggiornata: <code>${formatDateDMY(todayStr)}</code> ➔ <code>${formatDateDMY(endWindowStr)}</code>\n` +
        `🏨 Sincronizzate <b>${totalSuccessful} tariffe</b> dai prezzi reali di Octorate (Livello 0):\n` +
        `• Gg 0-2 (3 gg): <b>-10.0%</b>\n` +
        `• Gg 3-4 (2 gg): <b>-5.0%</b>\n` +
        `• Gg 5-6 (2 gg): <b>-2.5%</b>\n` +
        `• Gg 7+: <b>Ripristino Prezzo Base Reale</b>\n` +
        `✅ Octorate PMS sincronizzato automaticamente.`;

      sendTelegramAlert(supabaseAdmin, alertMsg).catch(() => { });
    }

    return {
      synced: true,
      message: `Sincronizzazione completata con successo (${totalSuccessful} tariffe aggiornate per ${todayStr}).`,
      updatesCount: totalSuccessful
    };
  }

  return {
    synced: false,
    message: 'Nessun aggiornamento inviato ad Octorate a causa di errori API.'
  };
}
