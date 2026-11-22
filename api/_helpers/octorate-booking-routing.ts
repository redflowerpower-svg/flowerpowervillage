/**
 * Pure deterministic routing engine for FPV Dashboard Telegram topics:
 * - BOOKINGS (Topic 3): strictly new reservations only
 * - MODIFICATIONS_CANCELLATIONS (Topic 7): strictly booking modifications, room moves, and cancellations
 */

export type BookingNotificationKind = 'new' | 'modified' | 'cancelled' | 'skip';
export type BookingNotificationTopic = 'BOOKINGS' | 'MODIFICATIONS_CANCELLATIONS' | null;

export interface BookingFingerprintInput {
  checkIn: string;
  checkOut: string;
  roomId?: string | number | null;
  totalGross?: string | number | null;
}

export interface ClassifyBookingTelegramInput {
  reservationId: string | number;
  eventType: string;
  booking: any;
  checkIn: string;
  checkOut: string;
  roomId?: string | number | null;
  totalGross?: string | number | null;
  createTimeMs: number;
  updateTimeMs: number;
  existingNotifiedRow?: { id?: string; bot_token?: string | null } | null;
}

export interface BookingTelegramClassification {
  kind: BookingNotificationKind;
  topic: BookingNotificationTopic;
  notificationKey: string;
  fingerprint: string;
  shouldPersistNotifiedFingerprint: boolean;
  reason: string;
}

function normalizeFingerprintAmount(val: unknown): string {
  if (val === undefined || val === null || val === '') return '0';
  if (typeof val === 'number') {
    return Number.isFinite(val) ? String(Math.round(val * 100) / 100) : '0';
  }
  const raw = String(val).trim();
  if (!raw) return '0';
  const parsed = Number(raw);
  if (Number.isFinite(parsed)) {
    return String(Math.round(parsed * 100) / 100);
  }
  return raw;
}

/**
 * Builds a compact deterministic fingerprint representing the core reservation attributes
 * (dates, room, total) to distinguish real modifications from identical webhook echoes.
 */
export function buildBookingNotificationFingerprint(input: BookingFingerprintInput): string {
  const checkIn = String(input.checkIn || '').trim().slice(0, 10);
  const checkOut = String(input.checkOut || '').trim().slice(0, 10);
  const roomIdStr = String(input.roomId ?? '').trim();
  const totalStr = normalizeFingerprintAmount(input.totalGross);
  return `fp:${checkIn}|${checkOut}|${roomIdStr}|${totalStr}`;
}

/**
 * Detects reservations created internally by cross-structure room moves (`octorate-move.ts`).
 */
export function isMovedReservationBooking(booking: any): boolean {
  if (!booking || typeof booking !== 'object') return false;
  const refer = String(booking.refer || '').trim().toUpperCase();
  const notes = String(booking.privateNotes || '');
  return refer.startsWith('MV-') || notes.includes('=== MOVED RESERVATION SUMMARY ===');
}

/**
 * Detects whether a booking payload or webhook event represents a cancellation/deletion.
 */
export function isCancelledBookingEvent(booking: any, eventType: string): boolean {
  const st = String(booking?.status || '').toUpperCase().trim();
  const upper = String(eventType || '').toUpperCase();
  return (
    st === 'CANCELLED' ||
    st === 'CANCELED' ||
    st === 'DELETED' ||
    st === 'VOID' ||
    st === 'REJECTED' ||
    Boolean(booking?.cancelled) ||
    Boolean(booking?.isCancelled) ||
    upper.includes('CANCEL') ||
    upper.includes('DELETE') ||
    upper.includes('VOID')
  );
}

/**
 * Classifies an Octorate reservation webhook event into an exclusive Telegram topic decision.
 */
export function classifyBookingTelegramEvent(
  params: ClassifyBookingTelegramInput
): BookingTelegramClassification {
  const resId = String(params.reservationId);
  const fingerprint = buildBookingNotificationFingerprint({
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    roomId: params.roomId,
    totalGross: params.totalGross,
  });

  // 1. Cancellations always route exclusively to MODIFICATIONS_CANCELLATIONS
  if (isCancelledBookingEvent(params.booking, params.eventType)) {
    return {
      kind: 'cancelled',
      topic: 'MODIFICATIONS_CANCELLATIONS',
      notificationKey: `res_cancelled_${resId}`,
      fingerprint,
      shouldPersistNotifiedFingerprint: true,
      reason: 'cancelled_status_or_event',
    };
  }

  const hasPriorNotified = Boolean(params.existingNotifiedRow?.id);
  const priorStoredToken = String(params.existingNotifiedRow?.bot_token || '');
  const priorFingerprint = priorStoredToken.startsWith('fp:') ? priorStoredToken : null;
  const isUpdatedMuchAfterCreate =
    params.updateTimeMs > 0 &&
    params.createTimeMs > 0 &&
    params.updateTimeMs > params.createTimeMs + 60_000;

  // 2. Internal cross-structure move initial creation echo is already notified by octorate-move.ts
  if (!hasPriorNotified && isMovedReservationBooking(params.booking) && !isUpdatedMuchAfterCreate) {
    return {
      kind: 'skip',
      topic: null,
      notificationKey: `res_notified_${resId}`,
      fingerprint,
      shouldPersistNotifiedFingerprint: true,
      reason: 'moved_reservation_initial_echo',
    };
  }

  // 3. Previously notified as new: either identical echo (skip) or genuine modification
  if (hasPriorNotified) {
    if (priorFingerprint) {
      if (priorFingerprint === fingerprint) {
        return {
          kind: 'skip',
          topic: null,
          notificationKey: `res_notified_${resId}`,
          fingerprint,
          shouldPersistNotifiedFingerprint: false,
          reason: 'duplicate_identical_fingerprint',
        };
      }
      return {
        kind: 'modified',
        topic: 'MODIFICATIONS_CANCELLATIONS',
        notificationKey: `res_modified_${resId}_${fingerprint}`,
        fingerprint,
        shouldPersistNotifiedFingerprint: true,
        reason: 'fingerprint_changed',
      };
    }

    // Legacy `bot_token: 'notified'` row without fingerprint
    const upper = String(params.eventType || '').toUpperCase();
    const explicitMod =
      upper.includes('CHANGE') ||
      upper.includes('MODIF') ||
      upper.includes('UPDATE') ||
      upper.includes('EDIT');
    const updatedAfterCreate =
      params.updateTimeMs > 0 &&
      params.createTimeMs > 0 &&
      params.updateTimeMs > params.createTimeMs + 5000;

    if (explicitMod || updatedAfterCreate) {
      return {
        kind: 'modified',
        topic: 'MODIFICATIONS_CANCELLATIONS',
        notificationKey: `res_modified_${resId}_${fingerprint}`,
        fingerprint,
        shouldPersistNotifiedFingerprint: true,
        reason: 'legacy_notified_updated',
      };
    }

    return {
      kind: 'skip',
      topic: null,
      notificationKey: `res_notified_${resId}`,
      fingerprint,
      shouldPersistNotifiedFingerprint: true,
      reason: 'legacy_notified_duplicate_create',
    };
  }

  // 4. Never notified before and not cancelled
  if (isUpdatedMuchAfterCreate) {
    return {
      kind: 'modified',
      topic: 'MODIFICATIONS_CANCELLATIONS',
      notificationKey: `res_modified_${resId}_${fingerprint}`,
      fingerprint,
      shouldPersistNotifiedFingerprint: true,
      reason: 'updated_long_after_create',
    };
  }

  return {
    kind: 'new',
    topic: 'BOOKINGS',
    notificationKey: `res_notified_${resId}`,
    fingerprint,
    shouldPersistNotifiedFingerprint: true,
    reason: 'new_booking',
  };
}
