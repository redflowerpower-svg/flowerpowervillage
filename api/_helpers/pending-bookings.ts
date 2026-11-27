/**
 * Persistent + in-memory storage helper for pending multi-gateway booking metadata.
 * Bridges checkout creation, Ksher server-to-server webhook (`ksher-notify`),
 * and browser redirect verification across Vercel serverless instances.
 */

import { createClient } from "@supabase/supabase-js";
import { getCanonicalAccommodation } from "./octorate-catalog.js";

export interface PendingBookingRecord {
  sessionId: string;
  gateway: string;
  accommodationId: number;
  accommodationName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  extraBreakfast: boolean;
  extraAC: boolean;
  acType?: string;
  acPricePerNight?: number;
  acTotal?: number;
  grandTotal: number;
  depositAmount: number;
  balanceDue: number;
  promoCode?: string | null;
  discountType?: string | null;
  discountValue?: string | number | null;
  discountAmount?: number;
  lang?: string;
  origin?: string;
  status?: 'pending' | 'processing' | 'confirmed' | 'octorate_failed' | 'overbooking_blocked';
  octorateReservationId?: string | null;
  octorateStructureId?: string | null;
  octorateError?: string | null;
  emailSent?: boolean;
  createdAt: number;
  updatedAt?: number;
}

const PENDING_KEY_PREFIX = 'pending_booking_';

// In-memory cache shared within the active node process / lambdas
const pendingStore = new Map<string, PendingBookingRecord>();

function getDefaultSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  return url && key ? createClient(url, key) : null;
}

export function savePendingBooking(record: PendingBookingRecord): void {
  if (!record?.sessionId) return;
  pendingStore.set(record.sessionId, {
    ...record,
    createdAt: record.createdAt || Date.now(),
    updatedAt: Date.now()
  });

  // Self-cleaning: remove records older than 2 hours from RAM
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
  for (const [key, val] of pendingStore.entries()) {
    if (val.createdAt < twoHoursAgo) {
      pendingStore.delete(key);
    }
  }
}

export function getPendingBooking(sessionId: string): PendingBookingRecord | null {
  if (!sessionId) return null;
  return pendingStore.get(sessionId) || null;
}

/**
 * Saves pending booking both in RAM and persistently in Supabase (`telegram_config` KV store)
 * so cold Vercel serverless instances and Ksher webhooks always recover full booking metadata.
 */
export async function savePendingBookingAsync(
  record: PendingBookingRecord,
  supabaseAdmin?: any
): Promise<void> {
  if (!record?.sessionId) return;
  const fullRecord: PendingBookingRecord = {
    ...record,
    status: record.status || 'pending',
    createdAt: record.createdAt || Date.now(),
    updatedAt: Date.now()
  };
  savePendingBooking(fullRecord);

  const client = supabaseAdmin || getDefaultSupabaseAdmin();
  if (!client) return;

  try {
    await client.from("telegram_config").upsert({
      id: `${PENDING_KEY_PREFIX}${fullRecord.sessionId}`,
      bot_token: JSON.stringify(fullRecord),
      chat_id: fullRecord.status || 'pending',
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn(`[PendingBookings] Supabase upsert warning for ${fullRecord.sessionId}:`, err);
  }
}

/**
 * Retrieves pending booking from Supabase first (authoritative across lambdas),
 * falling back to in-memory cache.
 */
export async function getPendingBookingAsync(
  sessionId: string,
  supabaseAdmin?: any
): Promise<PendingBookingRecord | null> {
  if (!sessionId) return null;

  const client = supabaseAdmin || getDefaultSupabaseAdmin();
  if (client) {
    try {
      const { data } = await client
        .from("telegram_config")
        .select("bot_token, chat_id")
        .eq("id", `${PENDING_KEY_PREFIX}${sessionId}`)
        .maybeSingle();

      if (data?.bot_token) {
        const parsed = JSON.parse(data.bot_token) as PendingBookingRecord;
        savePendingBooking(parsed);
        return parsed;
      }
    } catch (err) {
      console.warn(`[PendingBookings] Supabase read warning for ${sessionId}:`, err);
    }
  }

  return getPendingBooking(sessionId);
}

/**
 * Updates the processing/finalized status of a booking in Supabase & RAM
 * (provides cross-lambda idempotency between Ksher webhook and user browser redirect).
 */
export async function updatePendingBookingStatusAsync(
  sessionId: string,
  patch: Partial<PendingBookingRecord>,
  supabaseAdmin?: any
): Promise<PendingBookingRecord | null> {
  if (!sessionId) return null;
  const existing = await getPendingBookingAsync(sessionId, supabaseAdmin);
  const merged: PendingBookingRecord = {
    ...(existing || {
      sessionId,
      gateway: 'ksher',
      accommodationId: 0,
      accommodationName: '',
      checkIn: '',
      checkOut: '',
      nights: 1,
      guests: 1,
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      extraBreakfast: false,
      extraAC: false,
      grandTotal: 0,
      depositAmount: 0,
      balanceDue: 0,
      createdAt: Date.now()
    }),
    ...patch,
    sessionId,
    updatedAt: Date.now()
  };

  await savePendingBookingAsync(merged, supabaseAdmin);
  return merged;
}

const SOFT_HOLD_TTL_MS = 15 * 60 * 1000; // 15 minuti di blocco soft durante il pagamento

/**
 * Verifica se esiste già un checkout attivo (status 'pending' o 'processing' creato negli ultimi 15 minuti)
 * per lo stesso alloggio o un'unità collegata (es. Jungle Villa <-> JVL/JVR) su date sovrapposte.
 */
export async function findConflictingPendingBookingsAsync(params: {
  canonicalKey: string;
  linkedKeys: string[];
  checkIn: string;
  checkOut: string;
  excludeSessionId?: string;
  supabaseAdmin?: any;
}): Promise<PendingBookingRecord | null> {
  const { canonicalKey, linkedKeys, checkIn, checkOut, excludeSessionId, supabaseAdmin } = params;
  if (!canonicalKey || !checkIn || !checkOut) return null;

  const client = supabaseAdmin || getDefaultSupabaseAdmin();
  if (!client) return null;

  const conflictKeys = new Set<string>([canonicalKey, ...linkedKeys]);
  const cutoffIso = new Date(Date.now() - SOFT_HOLD_TTL_MS).toISOString();
  const reqIn = String(checkIn).slice(0, 10);
  const reqOut = String(checkOut).slice(0, 10);

  try {
    const { data: rows } = await client
      .from("telegram_config")
      .select("id, bot_token, chat_id, updated_at")
      .like("id", `${PENDING_KEY_PREFIX}%`)
      .in("chat_id", ["pending", "processing"])
      .gte("updated_at", cutoffIso);

    if (!Array.isArray(rows) || rows.length === 0) return null;

    for (const row of rows) {
      if (!row?.bot_token) continue;
      let rec: PendingBookingRecord | null = null;
      try {
        rec = JSON.parse(row.bot_token) as PendingBookingRecord;
      } catch {
        continue;
      }
      if (!rec?.sessionId) continue;
      if (excludeSessionId && rec.sessionId === excludeSessionId) continue;
      if (rec.status && rec.status !== "pending" && rec.status !== "processing") continue;

      const ageMs = Date.now() - Number(rec.updatedAt || rec.createdAt || 0);
      if (ageMs > SOFT_HOLD_TTL_MS) continue;

      const recCanonical = getCanonicalAccommodation({
        accommodation_id: rec.accommodationId,
        roomName: rec.accommodationName
      });
      if (!recCanonical || !conflictKeys.has(recCanonical.key)) continue;

      const rIn = String(rec.checkIn || "").slice(0, 10);
      const rOut = String(rec.checkOut || "").slice(0, 10);
      if (rIn && rOut && rIn < reqOut && reqIn < rOut) {
        return rec;
      }
    }
  } catch (err) {
    console.warn("[PendingBookings] Soft-hold check warning:", err);
  }

  return null;
}
