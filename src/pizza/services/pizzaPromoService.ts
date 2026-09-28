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
 * Validates a promo code against the current subtotal (excluding delivery fees)
 */
export function validatePizzaPromoCode(
  rawCode: string,
  subtotal: number,
  codesList?: PizzaPromoCode[]
): PromoValidationResult {
  if (!rawCode || !rawCode.trim()) {
    return { valid: false, discountAmount: 0, error: 'Codice non inserito' };
  }

  const cleanCode = rawCode.trim().toUpperCase();
  const list = codesList || loadPizzaPromoCodes();
  const promo = list.find((p) => p.code.trim().toUpperCase() === cleanCode);

  if (!promo) {
    return { valid: false, discountAmount: 0, error: 'Codice coupon non valido o inesistente' };
  }

  if (!promo.active) {
    return { valid: false, discountAmount: 0, error: 'Questo codice promozionale è attualmente disattivato' };
  }

  // Date Check (Today in local date YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  if (promo.validFrom && today < promo.validFrom) {
    return { valid: false, discountAmount: 0, error: `Questo coupon sarà valido a partire dal ${promo.validFrom}` };
  }
  if (promo.validTo && today > promo.validTo) {
    return { valid: false, discountAmount: 0, error: 'Questo coupon è scaduto' };
  }

  // Usage Limit Check
  if (promo.slotsTotal > 0 && promo.slotsUsed >= promo.slotsTotal) {
    return { valid: false, discountAmount: 0, error: 'Questo coupon ha raggiunto il limite massimo di utilizzi' };
  }

  // Min Order Check (on food & drinks subtotal, before delivery)
  if (promo.minOrder > 0 && subtotal < promo.minOrder) {
    return {
      valid: false,
      discountAmount: 0,
      error: `Spesa minima richiesta per questo coupon: ${promo.minOrder} ฿ (subtotale attuale: ${subtotal} ฿)`
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
 * Persists applied promo code in sessionStorage
 */
export function setAppliedPizzaPromo(promo: PizzaPromoCode | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (promo) {
      sessionStorage.setItem(STORAGE_KEY_APPLIED_PROMO, JSON.stringify(promo));
    } else {
      sessionStorage.removeItem(STORAGE_KEY_APPLIED_PROMO);
    }
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
  } catch (e) {
    console.error('[PizzaPromoService] Failed to clear applied promo:', e);
  }
}

/**
 * Increments usage count for a promo code upon order placement
 */
export function incrementPizzaPromoUsage(codeOrId: string): void {
  if (!codeOrId) return;
  const clean = codeOrId.trim().toUpperCase();
  const list = loadPizzaPromoCodes();
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
}
