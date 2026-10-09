/**
 * Pizza Promo Codes & Coupon Engine (Ranong Pizzeria Delivery)
 * Replicates the Village Promo Engine with support for:
 * - Percentage (%) & Fixed (฿) discounts
 * - Minimum order thresholds (minOrder)
 * - Single-use & Total slots limits
 * - Validity date ranges (validFrom -> validTo)
 * - URL parameter auto-application (?promo=CODE)
 * - Strict non-stacking rule & delivery fee exclusion
 */

export interface PizzaPromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder: number;
  slotsTotal: number;
  slotsUsed: number;
  isSingleUse: boolean;
  validFrom: string; // YYYY-MM-DD
  validTo: string;   // YYYY-MM-DD
  active: boolean;
  createdAt: string;
}

export interface PromoValidationResult {
  valid: boolean;
  promo?: PizzaPromoCode;
  discountAmount: number;
  error?: string;
}

export const STORAGE_KEY_PIZZA_PROMOS = 'fp_pizza_promo_codes';
export const STORAGE_KEY_APPLIED_PROMO = 'fp_pizza_applied_promo';
export const CLOUD_PIZZA_PROMO_URL = 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/site-images/pizza_promo_codes.json';

const DEFAULT_PROMO_CODES: PizzaPromoCode[] = [
  {
    id: 'pizza-welcome-2026',
    code: 'PIZZA2026',
    discountType: 'percentage',
    discountValue: 15,
    minOrder: 250,
    slotsTotal: 100,
    slotsUsed: 0,
    isSingleUse: false,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'pizza-special-50thb',
    code: 'SPECIAL50',
    discountType: 'fixed',
    discountValue: 50,
    minOrder: 300,
    slotsTotal: 50,
    slotsUsed: 0,
    isSingleUse: false,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    active: true,
    createdAt: new Date().toISOString()
  }
];

export function loadPizzaPromoCodes(): PizzaPromoCode[] {
  if (typeof window === 'undefined') return DEFAULT_PROMO_CODES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PIZZA_PROMOS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('[PizzaPromoService] Failed to load promo codes:', e);
  }
  return DEFAULT_PROMO_CODES;
}

export function savePizzaPromoCodes(codes: PizzaPromoCode[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PIZZA_PROMOS, JSON.stringify(codes));
  } catch (e) {
    console.error('[PizzaPromoService] Failed to save promo codes:', e);
  }
}

/**
 * Fetches Pizza Promo Codes from Supabase Cloud Storage (with cache-busting).
 * Falls back to localStorage or DEFAULT_PROMO_CODES if offline.
 */
export async function fetchCloudPizzaPromoCodes(): Promise<PizzaPromoCode[]> {
  try {
    const res = await fetch(`${CLOUD_PIZZA_PROMO_URL}?_ts=${Date.now()}`, {
      cache: 'no-store'
    });

    if (res.ok) {
      const cloudData = await res.json();
      if (Array.isArray(cloudData) && cloudData.length > 0) {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEY_PIZZA_PROMOS, JSON.stringify(cloudData));
          } catch (_) {}
        }
        return cloudData;
      }
    }
  } catch (err) {
    console.warn('[PizzaPromoService] Cloud fetch failed, using local cache:', err);
  }

  return loadPizzaPromoCodes();
}

/**
 * Saves updated Pizza Promo Codes to Supabase Cloud Storage via backend API
 * and keeps local storage synchronized.
 */
export async function saveCloudPizzaPromoCodes(
  codes: PizzaPromoCode[]
): Promise<{ success: boolean; error?: string }> {
  // 1. Instant local persistence
  savePizzaPromoCodes(codes);

  // 2. Cloud persistence via serverless endpoint with service_role privileges
  try {
    const response = await fetch('/api/promo-codes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'pizza',
        action: 'save-pizza-promos',
        promoCodes: codes
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `HTTP ${response.status}`);
    }

    return { success: true };
  } catch (err: any) {
    console.error('[PizzaPromoService] Cloud save error:', err);
    return {
      success: false,
      error: err.message || 'Error syncing pizza promo codes to cloud'
    };
  }
}

/**
 * Validates a promo code against the current subtotal (excluding delivery fees)
 */
export function validatePizzaPromoCode(
  rawCode: string,
  subtotal: number,
  codesList?: PizzaPromoCode[],
  lang: string = 'IT'
): PromoValidationResult {
  const isIt = lang === 'IT';
  const isTh = lang === 'TH';
  const isDe = lang === 'DE';
  const isMm = lang === 'MM';

  if (!rawCode || !rawCode.trim()) {
    return { 
      valid: false, 
      discountAmount: 0, 
      error: isTh 
        ? '📱 ติดตามช่องทางโซเชียลของเราเพื่อรับโค้ดโปรโมชั่นและข้อเสนอสุดพิเศษ!' 
        : isDe 
        ? '📱 Folge unseren Social-Media-Kanälen, um Promo-Codes und exklusive Angebote zu erhalten!' 
        : isMm 
        ? '📱 သင့်အတွက် သီးသန့် ပရိုမိုးရှင်း ကုဒ်များနှင့် အထူးကမ်းလှမ်းချက်များကို ရရှိရန် ကျွန်ုပ်တို့၏ ဆိုရှယ်မီဒီယာ ချန်နယ်များကို လိုက်ကြည့်ပါ။' 
        : isIt 
        ? '📱 Segui i nostri social media per ricevere codici promozionali ed offerte esclusive!' 
        : '📱 Follow our social media channels to receive promo codes and exclusive offers!' 
    };
  }

  const cleanCode = rawCode.trim().toUpperCase();
  const list = codesList || loadPizzaPromoCodes();
  const promo = list.find((p) => p.code.trim().toUpperCase() === cleanCode);

  if (!promo) {
    return { 
      valid: false, 
      discountAmount: 0, 
      error: isTh ? `รหัสโปรโมชั่น "${cleanCode}" ไม่ถูกต้อง` : isDe ? `Ungültiger Gutscheincode "${cleanCode}"` : isMm ? `ကုဒ် "${cleanCode}" မမှန်ကန်ပါ` : isIt ? `Codice "${cleanCode}" non valido o inesistente` : `Invalid promo code "${cleanCode}"` 
    };
  }

  if (!promo.active) {
    return { 
      valid: false, 
      discountAmount: 0, 
      error: isTh ? `รหัส "${cleanCode}" ยังไม่เปิดใช้งาน` : isDe ? `Der Code "${cleanCode}" ist inaktiv` : isMm ? `ကုဒ် "${cleanCode}" ပိတ်ထားပါသည်` : isIt ? `Il codice "${cleanCode}" è attualmente disattivato` : `Promo code "${cleanCode}" is inactive` 
    };
  }

  // Date Check (Today in local date YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  if (promo.validFrom && today < promo.validFrom) {
    return { 
      valid: false, 
      discountAmount: 0, 
      error: isTh ? `คูปองนี้ใช้ได้ตั้งแต่วันที่ ${promo.validFrom}` : isDe ? `Gültig ab ${promo.validFrom}` : isMm ? `${promo.validFrom} မှ စတင်အသုံးပြုနိုင်ပါသည်` : isIt ? `Questo coupon sarà valido dal ${promo.validFrom}` : `Valid starting from ${promo.validFrom}` 
    };
  }
  if (promo.validTo && today > promo.validTo) {
    return { 
      valid: false, 
      discountAmount: 0, 
      error: isTh ? 'คูปองนี้หมดอายุแล้ว' : isDe ? 'Dieser Gutschein ist abgelaufen' : isMm ? 'ကုဒ် သက်တမ်းကုန်သွားပါပြီ' : isIt ? 'Questo coupon è scaduto' : 'This coupon has expired' 
    };
  }

  // Usage Limit Check
  if (promo.slotsTotal > 0 && promo.slotsUsed >= promo.slotsTotal) {
    return { 
      valid: false, 
      discountAmount: 0, 
      error: isTh ? 'คูปองนี้มีผู้ใช้ครบตามสิทธิ์แล้ว' : isDe ? 'Gutscheinlimit erreicht' : isMm ? 'အသုံးပြုမှု ကန့်သတ်ချက် ပြည့်သွားပါပြီ' : isIt ? 'Questo coupon ha esaurito gli utilizzi disponibili' : 'Promo code has reached its usage limit' 
    };
  }

  // Min Order Check (on food & drinks subtotal, before delivery)
  if (promo.minOrder > 0 && subtotal < promo.minOrder) {
    return {
      valid: false,
      discountAmount: 0,
      error: isTh 
        ? `ยอดสั่งซื้อขั้นต่ำสำหรับคูปองนี้: ${promo.minOrder} ฿ (ยอดปัจจุบัน: ${subtotal} ฿)` 
        : isDe 
        ? `Mindestbestellwert: ${promo.minOrder} ฿ (aktuell: ${subtotal} ฿)` 
        : isMm
        ? `အနည်းဆုံး အော်ဒါပမာဏ: ${promo.minOrder} ฿ (လက်ရှိ: ${subtotal} ฿)`
        : isIt
        ? `Spesa minima per questo coupon: ${promo.minOrder} ฿ (subtotale attuale: ${subtotal} ฿)`
        : `Minimum order for this coupon: ${promo.minOrder} ฿ (current: ${subtotal} ฿)`
    };
  }

  // Calculate discount amount (applied ONLY to food & beverage subtotal, never to delivery fees)
  let discountAmount = 0;
  if (promo.discountType === 'percentage') {
    discountAmount = Math.round((subtotal * promo.discountValue) / 100);
  } else {
    discountAmount = Math.min(subtotal, promo.discountValue);
  }

  return {
    valid: true,
    promo,
    discountAmount
  };
}

/**
 * Persists applied promo code in sessionStorage and emits local window event
 */
export function setAppliedPizzaPromo(promo: PizzaPromoCode | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (promo) {
      sessionStorage.setItem(STORAGE_KEY_APPLIED_PROMO, JSON.stringify(promo));
    } else {
      sessionStorage.removeItem(STORAGE_KEY_APPLIED_PROMO);
    }
    window.dispatchEvent(new CustomEvent('pizza_promo_updated', { detail: promo }));
  } catch (e) {
    console.error('[PizzaPromoService] Failed to set applied promo:', e);
  }
}

export function getAppliedPizzaPromo(): PizzaPromoCode | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_APPLIED_PROMO);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('[PizzaPromoService] Failed to get applied promo:', e);
  }
  return null;
}

export function clearAppliedPizzaPromo(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY_APPLIED_PROMO);
    window.dispatchEvent(new CustomEvent('pizza_promo_updated', { detail: null }));
  } catch (e) {
    console.error('[PizzaPromoService] Failed to clear applied promo:', e);
  }
}

/**
 * Increments usage count for a promo code upon order placement
 */
export async function incrementPizzaPromoUsage(codeOrId: string): Promise<void> {
  if (!codeOrId) return;
  const clean = codeOrId.trim().toUpperCase();
  const list = await fetchCloudPizzaPromoCodes().catch(() => loadPizzaPromoCodes());
  const updated = list.map((p) => {
    if (p.id === codeOrId || p.code.trim().toUpperCase() === clean) {
      const nextUsed = (p.slotsUsed || 0) + 1;
      return {
        ...p,
        slotsUsed: nextUsed,
        active: p.isSingleUse ? false : (p.slotsTotal > 0 && nextUsed >= p.slotsTotal ? false : p.active)
      };
    }
    return p;
  });
  savePizzaPromoCodes(updated);
  await saveCloudPizzaPromoCodes(updated);
}

/**
 * Creates a unique single-use 10% discount promo code for Dining Tablet guests
 * Valid for exactly 10 days from issue date.
 */
export function createUniqueDiningPromoCode(customPrefix: string = 'DINE10'): PizzaPromoCode {
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  const code = `${customPrefix}-${randomChars}`;
  
  const now = new Date();
  const validFrom = now.toISOString().split('T')[0];
  
  const expiryDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
  const validTo = expiryDate.toISOString().split('T')[0];

  const newPromo: PizzaPromoCode = {
    id: `promo-dining-${Date.now()}-${randomChars}`,
    code,
    discountType: 'percentage',
    discountValue: 10,
    minOrder: 0,
    slotsTotal: 1,
    slotsUsed: 0,
    isSingleUse: true,
    validFrom,
    validTo,
    active: true,
    createdAt: now.toISOString()
  };

  const currentCodes = loadPizzaPromoCodes();
  // Filter out any duplicate code if collision (unlikely)
  const updatedList = [...currentCodes.filter(c => c.code !== code), newPromo];
  savePizzaPromoCodes(updatedList);

  return newPromo;
}

