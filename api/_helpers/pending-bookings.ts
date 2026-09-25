/**
 * In-memory storage helper for pending multi-gateway booking metadata.
 * Bridges checkout creation and payment verification across serverless requests.
 */

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
  grandTotal: number;
  depositAmount: number;
  balanceDue: number;
  promoCode?: string | null;
  discountAmount?: number;
  createdAt: number;
}

// In-memory cache shared within the active node process / lambdas
const pendingStore = new Map<string, PendingBookingRecord>();

export function savePendingBooking(record: PendingBookingRecord): void {
  if (!record?.sessionId) return;
  pendingStore.set(record.sessionId, {
    ...record,
    createdAt: Date.now()
  });

  // Self-cleaning: remove records older than 2 hours
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
