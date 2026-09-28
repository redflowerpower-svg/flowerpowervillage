/**
 * First Order Discount (10%) & Device ID service for Flower Power Pizza
 */

export interface FirstOrderCheckParams {
  phone?: string;
  email?: string;
  deviceId?: string;
  latitude?: number | null;
  longitude?: number | null;
  customerName?: string;
}

export interface FirstOrderCheckResult {
  eligible: boolean;
  discountPercent: number;
  isHotelGuest: boolean;
  isPhoneMatch?: boolean;
  isEmailMatch?: boolean;
  isDeviceMatch?: boolean;
  isNearPastOrder?: boolean;
  message?: string;
}

/**
 * Returns or generates a persistent device UUID for this browser
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server_device';
  try {
    const key = 'fp_pizza_device_id';
    let deviceId = localStorage.getItem(key);
    if (!deviceId) {
      deviceId = 'fp_did_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      localStorage.setItem(key, deviceId);
    }
    return deviceId;
  } catch {
    return 'fallback_did_' + Date.now();
  }
}

/**
 * Normalizes phone numbers (especially Thai numbers: 08x..., +668x..., 00668x...)
 */
export function normalizeThaiPhone(raw?: string): string {
  if (!raw) return '';
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0066') && digits.length >= 12) {
    digits = '0' + digits.slice(4);
  } else if (digits.startsWith('66') && digits.length >= 10) {
    digits = '0' + digits.slice(2);
  }
  return digits;
}

/**
 * Performs asynchronous backend verification for 10% first order eligibility
 * (In Local Dev & Virtual/Staging environments, ALWAYS grants eligible: true so developer/staff can preview and test)
 */
export async function checkFirstOrderEligibility(params: FirstOrderCheckParams): Promise<FirstOrderCheckResult> {
  const isOfficialProduction = typeof window !== 'undefined' && window.location.hostname.toLowerCase().includes('flowerpowerpizza.com');

  // In Localhost / Virtual / Staging environments: always active and 100% eligible
  if (!isOfficialProduction) {
    return {
      eligible: true,
      discountPercent: 10,
      isHotelGuest: false,
      message: 'Development & Virtual Staging Mode: 10% discount always granted for testing.'
    };
  }

  const deviceId = params.deviceId || getOrCreateDeviceId();
  try {
    const res = await fetch('/api/pizza-first-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: params.phone || '',
        email: params.email || '',
        deviceId,
        latitude: params.latitude || null,
        longitude: params.longitude || null,
        customerName: params.customerName || ''
      })
    });

    if (!res.ok) {
      console.warn('[FirstOrderService] API returned non-OK status:', res.status);
      return {
        eligible: true,
        discountPercent: 10,
        isHotelGuest: false,
        message: 'Eligible (default fallback)'
      };
    }

    const data: FirstOrderCheckResult = await res.json();
    return data;
  } catch (err) {
    console.warn('[FirstOrderService] Network check failed, falling back to eligible:', err);
    return {
      eligible: true,
      discountPercent: 10,
      isHotelGuest: false,
      message: 'Eligible (network fallback)'
    };
  }
}
