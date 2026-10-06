export interface PizzaMenuOverrides {
  availability: Record<string, boolean>; // id -> is_available (false = sold out)
  dailySpecials: Record<string, boolean>; // id -> is_daily_special
  prices: Record<string, number>; // id -> price override
  lastUpdated?: string;
}

const CLOUD_JSON_URL = 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/site-images/pizza_menu_overrides.json';

/**
 * Carica gli overrides del menu (disponibilità, specialità del giorno, prezzi)
 * direttamente dal Cloud Supabase (con cache-buster no-store).
 */
export async function fetchCloudMenuOverrides(): Promise<PizzaMenuOverrides> {
  // 1. Prova fetch da Cloud Storage pubblico
  try {
    const res = await fetch(`${CLOUD_JSON_URL}?_ts=${Date.now()}`, {
      cache: 'no-store'
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const overrides: PizzaMenuOverrides = {
          availability: data.availability || {},
          dailySpecials: data.dailySpecials || {},
          prices: data.prices || {},
          lastUpdated: data.lastUpdated
        };

        try {
          localStorage.setItem('fp_pizza_availability_overrides', JSON.stringify(overrides.availability));
          localStorage.setItem('fp_pizza_daily_specials_overrides', JSON.stringify(overrides.dailySpecials));
        } catch (_) {}

        return overrides;
      }
    }
  } catch (err) {
    console.warn('[PizzaMenuCloudService] Fetch public storage notice, trying backend API:', err);
  }

  // 2. Prova backend API /api/pizza-menu-sync
  try {
    const apiRes = await fetch('/api/pizza-menu-sync', { cache: 'no-store' });
    if (apiRes.ok) {
      const apiData = await apiRes.json();
      if (apiData.success && apiData.overrides) {
        const overrides: PizzaMenuOverrides = apiData.overrides;
        try {
          localStorage.setItem('fp_pizza_availability_overrides', JSON.stringify(overrides.availability || {}));
          localStorage.setItem('fp_pizza_daily_specials_overrides', JSON.stringify(overrides.dailySpecials || {}));
        } catch (_) {}
        return overrides;
      }
    }
  } catch (_) {}

  // 3. Fallback locale da localStorage
  const fallbackAvailability = (() => {
    try { return JSON.parse(localStorage.getItem('fp_pizza_availability_overrides') || '{}'); } catch { return {}; }
  })();
  const fallbackDaily = (() => {
    try { return JSON.parse(localStorage.getItem('fp_pizza_daily_specials_overrides') || '{}'); } catch { return {}; }
  })();

  return {
    availability: fallbackAvailability,
    dailySpecials: fallbackDaily,
    prices: {},
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Salva un aggiornamento di disponibilità, specialità o prezzo
 * tramite backend API `/api/pizza-menu-sync` con service_role.
 */
export async function saveCloudMenuOverride(payload: {
  availability?: Record<string, boolean>;
  dailySpecials?: Record<string, boolean>;
  prices?: Record<string, number>;
  updatedItem?: any;
}): Promise<boolean> {
  // 1. Aggiorna subito in localStorage e notifica BroadcastChannel per reattività a 0ms
  try {
    if (payload.availability) {
      const stored = JSON.parse(localStorage.getItem('fp_pizza_availability_overrides') || '{}');
      const merged = { ...stored, ...payload.availability };
      localStorage.setItem('fp_pizza_availability_overrides', JSON.stringify(merged));
    }
    if (payload.dailySpecials) {
      const stored = JSON.parse(localStorage.getItem('fp_pizza_daily_specials_overrides') || '{}');
      const merged = { ...stored, ...payload.dailySpecials };
      localStorage.setItem('fp_pizza_daily_specials_overrides', JSON.stringify(merged));
    }

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      new BroadcastChannel('fp_pizza_menu_sync').postMessage({
        type: 'MENU_SYNC_UPDATE',
        availability: payload.availability,
        dailySpecials: payload.dailySpecials
      });
    }
  } catch (_) {}

  // 2. Persisti sul Cloud permanente
  try {
    const res = await fetch('/api/pizza-menu-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (e) {
    console.error('[PizzaMenuCloudService] Errore salvataggio Cloud:', e);
    return false;
  }
}
