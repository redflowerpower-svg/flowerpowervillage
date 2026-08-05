// ─── V12 Booking Filtering & Blacklist Utility ─────────────────────────────

export const isCancelledBooking = (b: any): boolean => {
  if (!b) return true;
  const status = (b.status || b.reservation_status || '').toString().toLowerCase().trim();
  if (status === 'cancelled' || status === 'canceled' || status === 'rejected' || status === 'annullato') {
    return true;
  }
  // Check for OTA 0 price cancellation edge-cases (e.g. Katharina Lange with 0 price)
  const guestName = (b.guest_name || b.guestName || '').toString().toLowerCase();
  const totalPrice = Number(b.total_price ?? b.totalPrice ?? b.amount ?? 0);
  if (totalPrice === 0 && (guestName.includes('katharina') || guestName.includes('lange') || status === 'cancelled')) {
    return true;
  }
  return false;
};

export const isTestBookingToHide = (b: any): boolean => {
  if (!b) return true;
  const name = (b.guest_name || b.guestName || '').toString().toLowerCase().trim();
  const email = (b.guest_email || b.guestEmail || '').toString().toLowerCase().trim();
  if (
    name.includes('test only') ||
    name.includes('api test') ||
    name.includes('test_mode') ||
    email.includes('test@octorate')
  ) {
    return true;
  }
  return false;
};

export const getBlacklistedBookingIds = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('fpv_blacklisted_booking_ids');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const isBlacklistedBooking = (b: any): boolean => {
  if (!b) return false;
  const id = String(b.id || b.octorate_reservation_id || b.octorateId || '').trim();
  if (!id) return false;
  const list = getBlacklistedBookingIds();
  return list.includes(id);
};

export const addBookingToBlacklist = (bId: string) => {
  if (typeof window === 'undefined') return;
  try {
    const list = getBlacklistedBookingIds();
    const cleanId = String(bId).trim();
    if (cleanId && !list.includes(cleanId)) {
      list.push(cleanId);
      localStorage.setItem('fpv_blacklisted_booking_ids', JSON.stringify(list));
    }
  } catch (e) {
    console.error('Error adding booking to blacklist:', e);
  }
};

export const clearBlacklistedBookings = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('fpv_blacklisted_booking_ids');
  } catch (e) {
    console.error('Error clearing blacklisted bookings:', e);
  }
};

export const isValidActiveBooking = (b: any): boolean => {
  if (!b) return false;
  if (isCancelledBooking(b)) return false;
  if (isTestBookingToHide(b)) return false;
  if (isBlacklistedBooking(b)) return false;
  return true;
};
