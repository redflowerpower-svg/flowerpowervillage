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

    const { error: upsertErr } = await supabaseAdmin.from('telegram_config').upsert({
      id: CASCADE_LEDGER_ROW_ID,
      bot_token: JSON.stringify(pruned),
      chat_id: 'cascade_ledger',
      updated_at: new Date().toISOString()
    });
    if (upsertErr) {
      console.warn('[Cascade Ledger Save Error]:', upsertErr);
    }
  } catch (err) {
    console.warn('[Cascade Ledger Save Warning]:', err);
  }
}

async function tryAcquireDistributedCascadeLock(
  supabaseAdmin: any,
  force: boolean
): Promise<boolean> {
  if (!supabaseAdmin) return true;
  const nowMs = Date.now();
  try {
    if (!force) {
      const { data, error } = await supabaseAdmin
        .from('telegram_config')
        .select('bot_token, updated_at')
        .eq('id', CASCADE_SYNC_LOCK_ROW_ID)
        .maybeSingle();

      if (!error && data) {
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
      console.warn('[Cascade Lock Upsert Warning]:', lockUpsertErr);
    }
    return true;
  } catch (err) {
    console.warn('[Cascade Lock Warning]:', err);
    return true;
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
    const ledger = await loadCascadeLedger(supabaseAdmin);
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
        const basePrice = existing?.basePrice || roomCfg?.basePrice || price;
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

function isKnownCascadeOrBasePrice(existing: CascadeLedgerEntry, livePrice: number): boolean {
  if (livePrice === existing.basePrice) return true;
  if (existing.previousDiscountedPrice !== undefined && livePrice === existing.previousDiscountedPrice) {
    return true;
  }
  // 1-step cascade discounts from existing.basePrice
  for (const pct of KNOWN_CASCADE_STAGE_PCTS) {
    const step1 = computeDiscountedPrice(existing.basePrice, pct);
    if (step1 === livePrice) return true;
    // 2-step compounded discounts (accidental double-discount on top of step1)
    if (pct > 0) {
      for (const pct2 of NON_ZERO_STAGE_PCTS) {
        if (computeDiscountedPrice(step1, pct2) === livePrice) return true;
      }
    }
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
        // Se Octorate ha già lo sconto esatto sul basePrice canonico della stanza,
        // riconosciamo quel basePrice anche se nel ledger era presente un prezzo precedente diverso.
        let basePrice = livePrice;
        if (
          targetDiscountPct > 0 &&
          livePrice === computeDiscountedPrice(room.basePrice, targetDiscountPct)
        ) {
          basePrice = room.basePrice;
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
  force: boolean = false
): Promise<{ synced: boolean; message: string; updatesCount?: number }> {
  if (!accessToken) {
    return { synced: false, message: 'Access token mancante per sync sconti a cascata.' };
  }

  const nowMs = Date.now();
  if (!force && nowMs - lastSyncTimestampMs < SYNC_COOLDOWN_MS) {
    return { synced: false, message: 'Sync sconti a cascata in cooldown (30 min).' };
  }

  const lockAcquired = await tryAcquireDistributedCascadeLock(supabaseAdmin, force);
  if (!lockAcquired) {
    return { synced: false, message: 'Sync sconti a cascata in cooldown distribuito (30 min).' };
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
