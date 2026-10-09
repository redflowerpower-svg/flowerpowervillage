import { PromoCode } from '../store/useResortAdminStore';

const CLOUD_JSON_URL = 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/site-images/resort_promo_codes.json';
const STORAGE_KEY_PROMO_CODES = 'fpv_promo_codes';

export const DEFAULT_RESORT_PROMO_CODES: PromoCode[] = [
  {
    id: 'promo-welcome-2026',
    code: 'WELCOME2026',
    discountType: 'percentage',
    discountValue: 10,
    slotsTotal: 50,
    slotsUsed: 0,
    isSingleUse: false,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    active: true,
    createdAt: new Date().toISOString()
  }
];

/**
 * Fetches Resort / Village Promo Codes from Supabase Cloud Storage (with cache-busting).
 * Falls back transparently to localStorage or DEFAULT_RESORT_PROMO_CODES if offline.
 */
export async function fetchCloudResortPromoCodes(): Promise<PromoCode[]> {
  try {
    const res = await fetch(`${CLOUD_JSON_URL}?_ts=${Date.now()}`, {
      cache: 'no-store'
    });

    if (res.ok) {
      const cloudData = await res.json();
      if (Array.isArray(cloudData) && cloudData.length > 0) {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEY_PROMO_CODES, JSON.stringify(cloudData));
          } catch (_) {}
        }
        return cloudData;
      }
    }
  } catch (err) {
    console.warn('[ResortPromoCloudService] Cloud fetch failed, using local cache:', err);
  }

  // Fallback 1: localStorage
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROMO_CODES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (_) {}
  }

  // Fallback 2: Default promo
  return DEFAULT_RESORT_PROMO_CODES;
}

/**
 * Saves updated Resort Promo Codes to Supabase Cloud Storage via backend API
 * and keeps local storage synchronized across all browser tabs.
 */
export async function saveCloudResortPromoCodes(
  codes: PromoCode[]
): Promise<{ success: boolean; error?: string }> {
  // 1. Instant local persistence
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_PROMO_CODES, JSON.stringify(codes));
    } catch (_) {}
  }

  // 2. Cloud persistence via serverless endpoint with service_role privileges
  try {
    const response = await fetch('/api/promo-codes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'resort',
        action: 'save-resort-promos',
        promoCodes: codes
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `HTTP ${response.status}`);
    }

    return { success: true };
  } catch (err: any) {
    console.error('[ResortPromoCloudService] Cloud save error:', err);
    return {
      success: false,
      error: err.message || 'Error syncing promo codes to cloud'
    };
  }
}
