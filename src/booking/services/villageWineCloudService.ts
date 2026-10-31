export interface VillageWineConfig {
  disabledWineIds: string[];
  priceOverrides?: Record<string, number>;
  updatedAt?: string;
}

const STORAGE_KEY = 'fp_village_wine_config';
const CLOUD_JSON_URL = 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/site-images/village_wine_config.json';

const DEFAULT_CONFIG: VillageWineConfig = {
  disabledWineIds: [],
  priceOverrides: {}
};

/**
 * Carica la configurazione della carta vini per il Villaggio a Koh Phayam.
 * Prova prima il Cloud Supabase (o API endpoint) con fallback trasparente su localStorage.
 */
export async function fetchVillageWineConfig(): Promise<VillageWineConfig> {
  // Tentativo 1: API endpoint locale/Vercel
  try {
    const res = await fetch(`/api/wine-collection?scope=village&_ts=${Date.now()}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.config) {
        const config: VillageWineConfig = {
          disabledWineIds: Array.isArray(data.config.disabledWineIds) ? data.config.disabledWineIds : [],
          priceOverrides: data.config.priceOverrides || {},
          updatedAt: data.config.updatedAt
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        } catch (_) {}
        return config;
      }
    }
  } catch (_) {}

  // Tentativo 2: Fetch diretto da Supabase Storage pubblico
  try {
    const directRes = await fetch(`${CLOUD_JSON_URL}?_ts=${Date.now()}`, {
      cache: 'no-store'
    });
    if (directRes.ok) {
      const cloudData = await directRes.json();
      if (cloudData && typeof cloudData === 'object') {
        const config: VillageWineConfig = {
          disabledWineIds: Array.isArray(cloudData.disabledWineIds) ? cloudData.disabledWineIds : [],
          priceOverrides: cloudData.priceOverrides || {},
          updatedAt: cloudData.updatedAt
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        } catch (_) {}
        return config;
      }
    }
  } catch (_) {}

  // Fallback 3: localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return {
          disabledWineIds: Array.isArray(parsed.disabledWineIds) ? parsed.disabledWineIds : [],
          priceOverrides: parsed.priceOverrides || {},
          updatedAt: parsed.updatedAt
        };
      }
    }
  } catch (_) {}

  return DEFAULT_CONFIG;
}

/**
 * Salva la configurazione della carta vini per il Villaggio.
 * Persiste immediatamente in localStorage e sincronizza nel Cloud Supabase.
 */
export async function saveVillageWineConfig(config: VillageWineConfig): Promise<{ success: boolean; error?: string }> {
  const payload: VillageWineConfig = {
    disabledWineIds: Array.isArray(config.disabledWineIds) ? config.disabledWineIds : [],
    priceOverrides: config.priceOverrides || {},
    updatedAt: new Date().toISOString()
  };

  // 1. Cache immediata in localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (_) {}

  // 2. Chiamata API backend per persistenza Supabase service_role
  try {
    const response = await fetch('/api/wine-collection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        scope: 'village',
        config: payload
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `HTTP ${response.status}`);
    }

    return { success: true };
  } catch (err: any) {
    console.warn('[VillageWineCloudService] Errore sync cloud (salvato solo localmente):', err);
    return {
      success: false,
      error: err.message || 'Errore di connessione'
    };
  }
}

