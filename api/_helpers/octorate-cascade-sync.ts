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
  computeStandbyKeepAlivePrice,
  getActiveJungleSource,
  getCompanionRateId,
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
const CASCADE_SYNC_LOCK_ROW_ID = 'cascade_sync_lock_v1';
const SYNC_COOLDOWN_MS = 30 * 60 * 1000; // 30 minuti anti-burst in memoria serverless
const DISTRIBUTED_COOLDOWN_MS = 30 * 60 * 1000; // 30 minuti cooldown condiviso su Supabase tra istanze serverless

export interface CascadeLedgerEntry {
  basePrice: number;
  discountPct: number;
  discountedPrice: number;
  previousDiscountedPrice?: number;
  manualOverride?: boolean;
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
  if (offset < 0 || offset >= 9) return 0;
  if (offset < 3) return 10;
  if (offset < 6) return 5;
  return 2.5;
}

export function computeDiscountedPrice(basePrice: number, discountPct: number): number {
  if (discountPct <= 0) return Math.round(basePrice);
  return Math.round(basePrice * (1 - discountPct / 100));
}

export type CascadeLedgerLoadResult =
  | { ok: true; ledger: CascadeLedger; rowExists: boolean }
  | { ok: false; error: string };

export async function loadCascadeLedgerStrict(supabaseAdmin: any): Promise<CascadeLedgerLoadResult> {
  if (!supabaseAdmin) {
    return { ok: false, error: 'supabaseAdmin_missing' };
  }
  try {
    const { data, error } = await supabaseAdmin
      .from('telegram_config')
      .select('bot_token')
      .eq('id', CASCADE_LEDGER_ROW_ID)
      .maybeSingle();

    if (error) {
      return { ok: false, error: error.message || 'supabase_select_error' };
    }
    if (!data?.bot_token) {
      return { ok: true, ledger: {}, rowExists: false };
    }
    const parsed = JSON.parse(data.bot_token);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, error: 'invalid_ledger_shape' };
    }
    return { ok: true, ledger: parsed as CascadeLedger, rowExists: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'ledger_load_exception' };
  }
}

export async function loadCascadeLedger(supabaseAdmin: any): Promise<CascadeLedger> {
  const res = await loadCascadeLedgerStrict(supabaseAdmin);
  if (!res.ok) {
    console.warn('[Cascade Ledger Load Warning]:', res.error);
    return {};
  }
  return res.ledger;
}

export async function saveCascadeLedger(
  supabaseAdmin: any,
  ledger: CascadeLedger,
  todayStr: string = getThailandTodayStr(),
  options?: { allowEmpty?: boolean }
): Promise<boolean> {
  if (!supabaseAdmin) return false;
  try {
    // Pulizia automatica chiavi passate per mantenere compatto il record JSON
    const pruned: CascadeLedger = {};
    let hadExpiredEntries = false;
    for (const [key, entry] of Object.entries(ledger)) {
      const sepIdx = key.lastIndexOf('_');
      const datePart = sepIdx >= 0 ? key.slice(sepIdx + 1) : '';
      if (datePart >= todayStr && entry && typeof entry.basePrice === 'number') {
        pruned[key] = entry;
      } else if (datePart && datePart < todayStr) {
        hadExpiredEntries = true;
      }
    }

    // Scudo anti-cancellazione accidentale: non sovrascrivere un ledger popolato con {}
    if (Object.keys(pruned).length === 0 && !hadExpiredEntries && !options?.allowEmpty) {
      const { data: existingRow } = await supabaseAdmin
        .from('telegram_config')
        .select('bot_token')
        .eq('id', CASCADE_LEDGER_ROW_ID)
        .maybeSingle();
      if (existingRow?.bot_token) {
        try {
          const parsedExisting = JSON.parse(existingRow.bot_token);
          if (parsedExisting && typeof parsedExisting === 'object' && Object.keys(parsedExisting).length > 0) {
            console.warn('[Cascade Ledger Save Guard] Rifiutata sovrascrittura di un ledger esistente non vuoto con {}.');
            return false;
          }
        } catch {
          // ignore parse error
        }
      }
    }

    const { error: upsertErr } = await supabaseAdmin.from('telegram_config').upsert({
      id: CASCADE_LEDGER_ROW_ID,
      bot_token: JSON.stringify(pruned),
      chat_id: 'cascade_ledger',
      updated_at: new Date().toISOString()
    });
    if (upsertErr) {
      console.warn('[Cascade Ledger Save Error]:', upsertErr);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Cascade Ledger Save Warning]:', err);
    return false;
  }
}

async function tryAcquireDistributedCascadeLock(
  supabaseAdmin: any,
  force: boolean
): Promise<boolean> {
  if (!supabaseAdmin) return false;
  const nowMs = Date.now();
  try {
    if (!force) {
      const { data, error } = await supabaseAdmin
        .from('telegram_config')
        .select('bot_token, updated_at')
        .eq('id', CASCADE_SYNC_LOCK_ROW_ID)
        .maybeSingle();

      if (error) {
        console.warn('[Cascade Lock Select Error - Fail Closed]:', error);
        return false;
      }

      if (data) {
        let lockedUntilMs = 0;
        if (data.bot_token) {
          try {
            const parsed = JSON.parse(data.bot_token);
            if (typeof parsed?.lockedUntilMs === 'number') {
              lockedUntilMs = parsed.lockedUntilMs;
            }
          } catch {
            // ignore parse error
          }
        }
        if (!lockedUntilMs && data.updated_at) {
          const updatedMs = Date.parse(data.updated_at);
          if (!Number.isNaN(updatedMs)) {
            lockedUntilMs = updatedMs + DISTRIBUTED_COOLDOWN_MS;
          }
        }
        if (nowMs < lockedUntilMs) {
          return false;
        }
      }
    }

    const { error: lockUpsertErr } = await supabaseAdmin.from('telegram_config').upsert({
      id: CASCADE_SYNC_LOCK_ROW_ID,
      bot_token: JSON.stringify({ lockedUntilMs: nowMs + DISTRIBUTED_COOLDOWN_MS }),
      chat_id: 'cascade_lock',
      updated_at: new Date(nowMs).toISOString()
    });
    if (lockUpsertErr) {
      console.warn('[Cascade Lock Upsert Error - Fail Closed]:', lockUpsertErr);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Cascade Lock Warning - Fail Closed]:', err);
    return false;
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
    const loaded = await loadCascadeLedgerStrict(supabaseAdmin);
    if (!loaded.ok) {
      console.warn('[Cascade Ledger Invalidate Aborted - Fail Closed]:', loaded.error);
      return;
    }
    const ledger = loaded.ledger;
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
      await saveCascadeLedger(supabaseAdmin, ledger, todayStr, { allowEmpty: true });
    }
  } catch (err) {
    console.warn('[Cascade Ledger Invalidate Warning]:', err);
  }
}

/**
 * Registra nel ledger delle modifiche manuali mirate dentro la finestra di 9 giorni
 * (es. da Dashboard) con `manualOverride: true`, così che il prezzo impostato
 * rimanga esattamente quello scelto senza subire un ulteriore sconto percentuale.
 */
export async function applyManualCascadeOverrides(
  supabaseAdmin: any,
  updates: Array<{ roomMotherId: number; dateFrom: string; dateTo: string; price: number }>
): Promise<void> {
  if (!supabaseAdmin || !Array.isArray(updates) || updates.length === 0) return;
  try {
    const todayStr = getThailandTodayStr();
    const windowEndStr = addDaysToDate(todayStr, 8);
    const loaded = await loadCascadeLedgerStrict(supabaseAdmin);
    if (!loaded.ok) {
      console.warn('[Cascade Manual Override Aborted - Fail Closed]:', loaded.error);
      return;
    }
    const ledger = loaded.ledger;
    const nowIso = new Date().toISOString();
    let changed = false;

    for (const u of updates) {
      const rId = Number(u.roomMotherId);
      const price = Math.round(Number(u.price));
      if (!rId || !u.dateFrom || !u.dateTo || !(price > 0)) continue;

      const roomCfg = CASCADE_MOTHER_ROOMS.find((r) => r.motherId === rId);
      let cur = u.dateFrom < todayStr ? todayStr : u.dateFrom;
      const end = u.dateTo > windowEndStr ? windowEndStr : u.dateTo;

      while (cur <= end) {
        const key = `${rId}_${cur}`;
        const existing = ledger[key];
        const seasonalCanonical = getSeasonalCanonicalBasePrice(rId, cur);
        const basePrice = existing?.basePrice || seasonalCanonical || roomCfg?.basePrice || price;
        ledger[key] = {
          basePrice,
          discountPct: existing?.discountPct ?? 0,
          discountedPrice: price,
          previousDiscountedPrice: existing?.discountedPrice,
          manualOverride: true,
          updatedAt: nowIso
        };
        changed = true;
        cur = addDaysToDate(cur, 1);
      }
    }

    if (changed) {
      await saveCascadeLedger(supabaseAdmin, ledger, todayStr);
    }
  } catch (err) {
    console.warn('[Cascade Manual Override Warning]:', err);
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

const KNOWN_CASCADE_STAGE_PCTS = [0, 2.5, 5, 10];
const NON_ZERO_STAGE_PCTS = [2.5, 5, 10];

const FPV_TO_CANONICAL_MOTHER_ID: Record<number, number> = {
  960389: 529773,
  960385: 495795,
  960387: 495796,
  960383: 494840
};

const SEASONAL_CANONICAL_PERIODS: Array<{
  dateFrom: string;
  dateTo: string;
  prices: Record<number, number>;
}> = [
  {
    dateFrom: '2026-11-01',
    dateTo: '2026-11-14',
    prices: {
      649669: 1190, 921799: 1190,
      529773: 3290, 495795: 1790, 495796: 1790, 494840: 1790, 421511: 1790,
      293957: 1190, 293954: 990, 293962: 990, 293955: 590, 293965: 590,
      293942: 590, 293963: 590, 293959: 890, 293948: 890, 293945: 890,
      293943: 490, 293951: 990, 883795: 990
    }
  },
  {
    dateFrom: '2026-11-15',
    dateTo: '2026-11-24',
    prices: {
      649669: 1490, 921799: 1490,
      529773: 3590, 495795: 1990, 495796: 1990, 494840: 1990, 421511: 1990,
      293957: 1490, 293954: 1290, 293962: 1290, 293955: 790, 293965: 790,
      293942: 790, 293963: 790, 293959: 990, 293948: 990, 293945: 990,
      293943: 690, 293951: 1090, 883795: 1090
    }
  },
  {
    dateFrom: '2026-11-25',
    dateTo: '2026-11-30',
    prices: {
      649669: 1490, 921799: 1490,
      529773: 2990, 495795: 1490, 495796: 1490, 494840: 1490, 421511: 1490,
      293957: 1490, 293954: 1290, 293962: 1290, 293955: 790, 293965: 790,
      293942: 790, 293963: 790, 293959: 990, 293948: 990, 293945: 990,
      293943: 690, 293951: 1090, 883795: 1090
    }
  },
  {
    dateFrom: '2026-12-01',
    dateTo: '2026-12-10',
    prices: {
      649669: 1990, 921799: 1990,
      529773: 4290, 495795: 2390, 495796: 2390, 494840: 2390, 421511: 2390,
      293957: 1990, 293954: 1590, 293962: 1590, 293955: 820, 293965: 820,
      293942: 820, 293963: 890, 293959: 1190, 293948: 1190, 293945: 1190,
      293943: 690, 293951: 1590, 883795: 1590
    }
  },
  {
    dateFrom: '2026-12-11',
    dateTo: '2026-12-20',
    prices: {
      649669: 2390, 921799: 2390,
      529773: 4990, 495795: 2790, 495796: 2790, 494840: 2790, 421511: 2790,
      293957: 2390, 293954: 1990, 293962: 1990, 293955: 890, 293965: 890,
      293942: 890, 293963: 990, 293959: 1490, 293948: 1490, 293945: 1490,
      293943: 790, 293951: 1990, 883795: 1990
    }
  },
  {
    dateFrom: '2026-12-21',
    dateTo: '2027-01-15',
    prices: {
      649669: 2990, 921799: 2990,
      529773: 5790, 495795: 3190, 495796: 3190, 494840: 3190, 421511: 3190,
      293957: 2990, 293954: 2490, 293962: 2490, 293955: 990, 293965: 990,
      293942: 990, 293963: 1190, 293959: 1990, 293948: 1990, 293945: 1990,
      293943: 890, 293951: 2490, 883795: 2490
    }
  },
  {
    dateFrom: '2027-01-16',
    dateTo: '2027-03-31',
    prices: {
      649669: 2490, 921799: 2490,
      529773: 5190, 495795: 2890, 495796: 2890, 494840: 2890, 421511: 2890,
      293957: 2490, 293954: 1990, 293962: 1990, 293955: 890, 293965: 890,
      293942: 890, 293963: 990, 293959: 1690, 293948: 1690, 293945: 1690,
      293943: 790, 293951: 1990, 883795: 1990
    }
  },
  {
    dateFrom: '2027-04-01',
    dateTo: '2027-04-30',
    prices: {
      649669: 2090, 921799: 2090,
      529773: 3990, 495795: 2290, 495796: 2290, 494840: 2290, 421511: 2290,
      293957: 2090, 293954: 1590, 293962: 1590, 293955: 790, 293965: 790,
      293942: 790, 293963: 890, 293959: 1590, 293948: 1590, 293945: 1590,
      293943: 690, 293951: 1590, 883795: 1590
    }
  },
  {
    dateFrom: '2027-05-01',
    dateTo: '2027-05-31',
    prices: {
      649669: 1290, 921799: 1290,
      529773: 3190, 495795: 1790, 495796: 1790, 494840: 1790, 421511: 1790,
      293957: 1290, 293954: 1090, 293962: 1090, 293955: 620, 293965: 620,
      293942: 620, 293963: 790, 293959: 990, 293948: 990, 293945: 990,
      293943: 590, 293951: 1190, 883795: 1190
    }
  },
  {
    dateFrom: '2027-06-01',
    dateTo: '2027-10-31',
    prices: {
      649669: 990, 921799: 990,
      529773: 2290, 495795: 1290, 495796: 1290, 494840: 1290, 421511: 1290,
      293957: 990, 293954: 790, 293962: 790, 293955: 490, 293965: 490,
      293942: 490, 293963: 690, 293959: 890, 293948: 890, 293945: 890,
      293943: 590, 293951: 990, 883795: 990
    }
  }
];

export function getSeasonalCanonicalBasePrice(motherId: number, dateStr: string): number | null {
  const canonicalId = FPV_TO_CANONICAL_MOTHER_ID[motherId] ?? motherId;
  for (const period of SEASONAL_CANONICAL_PERIODS) {
    if (dateStr >= period.dateFrom && dateStr <= period.dateTo) {
      const price = period.prices[canonicalId];
      return typeof price === 'number' && price > 0 ? price : null;
    }
  }
  return null;
}

function matchesDiscountOfBase(candidateBase: number, livePrice: number): boolean {
  for (const pct of NON_ZERO_STAGE_PCTS) {
    const step1 = computeDiscountedPrice(candidateBase, pct);
    if (step1 === livePrice) return true;
    for (const pct2 of NON_ZERO_STAGE_PCTS) {
      if (computeDiscountedPrice(step1, pct2) === livePrice) return true;
    }
  }
  return false;
}

function isKnownCascadeOrBasePrice(existing: CascadeLedgerEntry, livePrice: number): boolean {
  if (livePrice === existing.basePrice) return true;
  if (existing.previousDiscountedPrice !== undefined && livePrice === existing.previousDiscountedPrice) {
    return true;
  }
  if (matchesDiscountOfBase(existing.basePrice, livePrice)) {
    return true;
  }
  // 2-step compounded discount on top of existing.discountedPrice
  for (const pct2 of NON_ZERO_STAGE_PCTS) {
    if (computeDiscountedPrice(existing.discountedPrice, pct2) === livePrice) {
      return true;
    }
  }
  return false;
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
    const isStandbyTwin = Boolean(
      twinPair &&
      (activeJungleSource === '366879' ? twinPair.jungleId === room.motherId : twinPair.fpvId === room.motherId)
    );
    if (isStandbyTwin) {
      // Le 4 madri gemelle in Standby seguono sempre il prezzo effettivo della rispettiva madre attiva
      continue;
    }

    for (let offset = 0; offset <= 9; offset++) {
      const targetDateStr = addDaysToDate(todayStr, offset);

      const key = `${room.motherId}_${targetDateStr}`;
      const livePrice = livePriceMap.get(key);

      if (livePrice === undefined || livePrice <= 0) {
        continue;
      }

      const targetDiscountPct = getStageDiscountPctForOffset(offset);
      const existing = nextLedger[key];
      let effectiveActivePrice = livePrice;

      if (existing?.manualOverride) {
        // Prezzo bloccato manualmente dall'utente dentro la finestra di 9 giorni (es. 1190 THB)
        const updatedMs = existing.updatedAt ? Date.parse(existing.updatedAt) : NaN;
        const nowMs = Date.parse(nowIso);
        const isRecentManualSave =
          Number.isFinite(updatedMs) &&
          Number.isFinite(nowMs) &&
          nowMs - updatedMs >= 0 &&
          nowMs - updatedMs < 5 * 60 * 1000;

        if (targetDiscountPct === 0) {
          effectiveActivePrice = existing.basePrice;
          if (livePrice !== existing.basePrice) {
            bulkPayload.push({
              room: room.motherId,
              dateFrom: targetDateStr,
              dateTo: targetDateStr,
              values: { price: existing.basePrice }
            });
          }
          delete nextLedger[key];
          ledgerChanged = true;
        } else if (livePrice === existing.discountedPrice) {
          effectiveActivePrice = livePrice;
          if (existing.discountPct !== targetDiscountPct) {
            nextLedger[key] = {
              ...existing,
              discountPct: targetDiscountPct,
              updatedAt: nowIso
            };
            ledgerChanged = true;
          }
        } else if (isRecentManualSave) {
          // Latenza di propagazione Octorate subito dopo un salvataggio manuale (< 5 min):
          // preserva il prezzo congelato nel ledger senza sbloccarlo né sovrascriverlo col vecchio livePrice.
          effectiveActivePrice = existing.discountedPrice;
          bulkPayload.push({
            room: room.motherId,
            dateFrom: targetDateStr,
            dateTo: targetDateStr,
            values: { price: existing.discountedPrice }
          });
        } else if (livePrice === existing.basePrice) {
          // L'utente ha ripristinato manualmente il prezzo di listino originale: riattiva cascata standard
          const newDiscounted = computeDiscountedPrice(existing.basePrice, targetDiscountPct);
          effectiveActivePrice = newDiscounted;
          if (newDiscounted !== livePrice) {
            bulkPayload.push({
              room: room.motherId,
              dateFrom: targetDateStr,
              dateTo: targetDateStr,
              values: { price: newDiscounted }
            });
          }
          nextLedger[key] = {
            basePrice: existing.basePrice,
            discountPct: targetDiscountPct,
            discountedPrice: newDiscounted,
            previousDiscountedPrice: existing.discountedPrice,
            updatedAt: nowIso
          };
          ledgerChanged = true;
        } else {
          // L'utente ha impostato un nuovo prezzo manuale personalizzato su Octorate
          effectiveActivePrice = livePrice;
          nextLedger[key] = {
            ...existing,
            discountPct: targetDiscountPct,
            discountedPrice: livePrice,
            previousDiscountedPrice: existing.discountedPrice,
            manualOverride: true,
            updatedAt: nowIso
          };
          ledgerChanged = true;
        }
      } else if (existing && existing.discountedPrice === livePrice) {
        // Nessuna modifica manuale rilevata: il prezzo su Octorate corrisponde a quello da noi scritto.
        const basePrice = existing.basePrice;
        if (existing.discountPct !== targetDiscountPct) {
          const newDiscounted = computeDiscountedPrice(basePrice, targetDiscountPct);
          effectiveActivePrice = newDiscounted;
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
              previousDiscountedPrice: existing.discountedPrice,
              updatedAt: nowIso
            };
          }
          ledgerChanged = true;
        }
      } else if (existing && isKnownCascadeOrBasePrice(existing, livePrice)) {
        // Ritardo di propagazione Octorate o doppio sconto accidentale (1-step / 2-step):
        // NON sovrascrivere basePrice con livePrice e guarisci al prezzo corretto dello stadio.
        const basePrice = existing.basePrice;
        const newDiscounted = computeDiscountedPrice(basePrice, targetDiscountPct);

        if (targetDiscountPct === 0) {
          effectiveActivePrice = basePrice;
          if (livePrice !== basePrice) {
            bulkPayload.push({
              room: room.motherId,
              dateFrom: targetDateStr,
              dateTo: targetDateStr,
              values: { price: basePrice }
            });
          }
          delete nextLedger[key];
          ledgerChanged = true;
        } else {
          effectiveActivePrice = newDiscounted;
          if (newDiscounted !== livePrice) {
            bulkPayload.push({
              room: room.motherId,
              dateFrom: targetDateStr,
              dateTo: targetDateStr,
              values: { price: newDiscounted }
            });
          }

          if (existing.discountPct !== targetDiscountPct || existing.discountedPrice !== newDiscounted) {
            nextLedger[key] = {
              basePrice,
              discountPct: targetDiscountPct,
              discountedPrice: newDiscounted,
              previousDiscountedPrice: existing.discountedPrice,
              updatedAt: nowIso
            };
            ledgerChanged = true;
          }
        }
      } else if (existing && targetDiscountPct > 0) {
        // Modifica manuale reale dentro la finestra di 9 giorni (es. 1791 -> 1190 su Octorate):
        // Congela il prezzo scelto dall'utente con manualOverride: true senza ulteriori sconti.
        effectiveActivePrice = livePrice;
        nextLedger[key] = {
          basePrice: existing.basePrice,
          discountPct: targetDiscountPct,
          discountedPrice: livePrice,
          previousDiscountedPrice: existing.discountedPrice,
          manualOverride: true,
          updatedAt: nowIso
        };
        ledgerChanged = true;
      } else {
        // Nuova data fuori ledger o offset >= 9:
        // Scudo anti-accumulo: verifica se il prezzo live coincide già con un listino canonico/ancora d+9
        // oppure se è uno sconto (1-step o 2-step) di un prezzo di listino noto (ancora d+9, matrice stagionale, fallback).
        let basePrice = livePrice;
        if (targetDiscountPct > 0) {
          const seasonalCanonical = getSeasonalCanonicalBasePrice(room.motherId, targetDateStr);
          const d9AnchorPrice = livePriceMap.get(`${room.motherId}_${addDaysToDate(todayStr, 9)}`);
          const isExactCanonicalBase =
            (seasonalCanonical !== null && livePrice === seasonalCanonical) ||
            (d9AnchorPrice !== undefined && d9AnchorPrice > 0 && livePrice === d9AnchorPrice);

          if (!isExactCanonicalBase) {
            const candidateSet = new Set<number>();
            if (d9AnchorPrice !== undefined && d9AnchorPrice > 0) candidateSet.add(d9AnchorPrice);
            if (seasonalCanonical !== null && seasonalCanonical > 0) candidateSet.add(seasonalCanonical);
            if (room.basePrice > 0) candidateSet.add(room.basePrice);

            for (const candBase of candidateSet) {
              if (candBase !== livePrice && matchesDiscountOfBase(candBase, livePrice)) {
                basePrice = candBase;
                break;
              }
            }
          }
        }

        const newDiscounted = computeDiscountedPrice(basePrice, targetDiscountPct);

        if (targetDiscountPct === 0) {
          effectiveActivePrice = livePrice;
          if (existing) {
            delete nextLedger[key];
            ledgerChanged = true;
          }
        } else {
          effectiveActivePrice = newDiscounted;
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
            previousDiscountedPrice: existing?.discountedPrice,
            updatedAt: nowIso
          };
          ledgerChanged = true;
        }
      }

      if (twinPair) {
        const standbyMotherId =
          getCompanionRateId(room.motherId) ||
          (activeJungleSource === '366879' ? twinPair.jungleId : twinPair.fpvId);
        if (standbyMotherId) {
          const expectedStandbyPrice =
            activeJungleSource === '366879' && isLowSeasonKeepAliveDate(targetDateStr)
              ? computeStandbyKeepAlivePrice(effectiveActivePrice, twinPair.key)
              : effectiveActivePrice;
          const standbyKey = `${standbyMotherId}_${targetDateStr}`;
          const liveStandbyPrice = livePriceMap.get(standbyKey);

          if (liveStandbyPrice !== expectedStandbyPrice) {
            bulkPayload.push({
              room: standbyMotherId,
              dateFrom: targetDateStr,
              dateTo: targetDateStr,
              values: { price: expectedStandbyPrice }
            });
          }

          if (targetDiscountPct === 0) {
            if (nextLedger[standbyKey]) {
              delete nextLedger[standbyKey];
              ledgerChanged = true;
            }
          } else if (nextLedger[key]) {
            const activeEntry = nextLedger[key];
            const prevStandby = nextLedger[standbyKey];
            if (
              !prevStandby ||
              prevStandby.basePrice !== activeEntry.basePrice ||
              prevStandby.discountPct !== activeEntry.discountPct ||
              prevStandby.discountedPrice !== activeEntry.discountedPrice ||
              prevStandby.manualOverride !== activeEntry.manualOverride
            ) {
              nextLedger[standbyKey] = { ...activeEntry };
              ledgerChanged = true;
            }
          }
        }
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
  force: boolean = false,
  source: string = 'unknown'
): Promise<{ synced: boolean; message: string; updatesCount?: number }> {
  if (!accessToken) {
    return { synced: false, message: 'Access token mancante per sync sconti a cascata.' };
  }
  if (!supabaseAdmin) {
    return { synced: false, message: 'Configurazione Supabase mancante per sync sconti a cascata (fail-closed).' };
  }

  const nowMs = Date.now();
  if (!force && nowMs - lastSyncTimestampMs < SYNC_COOLDOWN_MS) {
    return { synced: false, message: 'Sync sconti a cascata in cooldown (30 min).' };
  }

  const lockAcquired = await tryAcquireDistributedCascadeLock(supabaseAdmin, force);
  if (!lockAcquired) {
    return { synced: false, message: 'Sync sconti a cascata in cooldown distribuito (30 min).' };
  }

  const ledgerLoad = await loadCascadeLedgerStrict(supabaseAdmin);
  if (!ledgerLoad.ok) {
    console.error(`❌ [CASCADE LAST-MINUTE] Abort fail-closed: impossibile leggere ledger (${ledgerLoad.error}).`);
    return { synced: false, message: `Abort sync sconti a cascata: errore lettura ledger (${ledgerLoad.error}).` };
  }

  const todayStr = getThailandTodayStr();
  const windowEndStr = addDaysToDate(todayStr, 9);

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

  const activeJungleSource = await getActiveJungleSource(supabaseAdmin);
  const { bulkPayload, nextLedger, ledgerChanged } = buildDynamicCascadeSyncPlan({
    rooms: CASCADE_MOTHER_ROOMS,
    todayStr,
    livePriceMap,
    ledger: ledgerLoad.ledger,
    activeJungleSource
  });

  const ledgerEntryCount = Object.keys(ledgerLoad.ledger).length;
  if (bulkPayload.length > 0 || ledgerEntryCount === 0) {
    console.log(
      `[CASCADE LAST-MINUTE] source=${source} | today=${todayStr} | ledgerEntries=${ledgerEntryCount} | rowExists=${ledgerLoad.rowExists} | updates=${bulkPayload.length}`
    );
  }

  if (bulkPayload.length === 0) {
    if (ledgerChanged) {
      await saveCascadeLedger(supabaseAdmin, nextLedger, todayStr);
    }
    lastSyncTimestampMs = Date.now();
    return { synced: false, message: `Octorate live già allineato con gli sconti a cascata (${todayStr}).` };
  }

  // Write-Ahead Ledger (WAL): persiste il registro su Supabase PRIMA di inviare modifiche a Octorate
  if (ledgerChanged || !ledgerLoad.rowExists) {
    const walSaved = await saveCascadeLedger(supabaseAdmin, nextLedger, todayStr);
    if (!walSaved) {
      console.error('❌ [CASCADE LAST-MINUTE] Abort: salvataggio Write-Ahead Ledger fallito prima della scrittura Octorate.');
      return {
        synced: false,
        message: 'Abort sync sconti a cascata: impossibile persistere il ledger su Supabase prima della scrittura Octorate.'
      };
    }
  }

  console.log(`⚡ [CASCADE LAST-MINUTE 24/7] Avvio sincronizzazione dinamica (${bulkPayload.length} celle) per ${todayStr}...`);

  const BATCH_SIZE = 100;
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
    console.log(`✅ [CASCADE LAST-MINUTE 24/7] Sincronizzazione completata: ${totalSuccessful} tariffe scritte su Octorate PMS.`);

    if (supabaseAdmin) {
      const endWindowStr = addDaysToDate(todayStr, 8);
      const alertMsg = `⚡ <b>[Cascade Last-Minute Auto-Roll]</b>\n` +
        `📅 Finestra Sconti Aggiornata: <code>${formatDateDMY(todayStr)}</code> ➔ <code>${formatDateDMY(endWindowStr)}</code>\n` +
        `🏨 Sincronizzate <b>${totalSuccessful} tariffe</b> dai prezzi reali di Octorate (Livello 0):\n` +
        `• Gg 0-2 (3 gg): <b>-10.0%</b>\n` +
        `• Gg 3-5 (3 gg): <b>-5.0%</b>\n` +
        `• Gg 6-8 (3 gg): <b>-2.5%</b>\n` +
        `• Gg 9+: <b>Ripristino Prezzo Base Reale</b>\n` +
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
