import { create } from 'zustand';
import { supabase } from '../../../lib/supabase';

export type PizzaRoutingMode = 'gloria_food' | 'custom';

export interface PizzeriaSettings {
  routingMode: PizzaRoutingMode;
  gloriaFoodDeliveryUrl: string;
  gloriaFoodTableUrl: string;
}

interface PizzaSettingsState {
  settings: PizzeriaSettings;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (updates: Partial<PizzeriaSettings>) => Promise<boolean>;
}

export const DEFAULT_FOOD_DELIVERY_URL = 'https://www.foodbooking.com/ordering/restaurant/menu?company_uid=2c39b5e7-9c31-410a-aaa0-aed68004b3a2&restaurant_uid=5c93fab4-28ed-4dc2-8525-dd00df8a975c&facebook=true';
export const DEFAULT_TABLE_RESERVATION_URL = 'https://www.foodbooking.com/ordering/restaurant/menu/reservation?company_uid=2c39b5e7-9c31-410a-aaa0-aed68004b3a2&restaurant_uid=5c93fab4-28ed-4dc2-8525-dd00df8a975c&reservation=true';

const sanitizeUrl = (url: string | null | undefined, fallback: string): string => {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  // If it's pointing to the old decommissioned website, use the real Gloria Food link
  if (trimmed.includes('flowerpowerpizzaranong') || !trimmed.startsWith('http')) {
    return fallback;
  }
  return trimmed;
};

const getInitialSettings = (): PizzeriaSettings => {
  if (typeof window === 'undefined') {
    return {
      routingMode: 'gloria_food',
      gloriaFoodDeliveryUrl: DEFAULT_FOOD_DELIVERY_URL,
      gloriaFoodTableUrl: DEFAULT_TABLE_RESERVATION_URL,
    };
  }

  const rawDelivery = localStorage.getItem('fp_pizza_delivery_url');
  const rawTable = localStorage.getItem('fp_pizza_table_url');
  const rawMode = localStorage.getItem('fp_pizza_routing_mode') as PizzaRoutingMode;

  return {
    routingMode: rawMode || 'gloria_food',
    gloriaFoodDeliveryUrl: sanitizeUrl(rawDelivery, DEFAULT_FOOD_DELIVERY_URL),
    gloriaFoodTableUrl: sanitizeUrl(rawTable, DEFAULT_TABLE_RESERVATION_URL),
  };
};

export const usePizzaSettingsStore = create<PizzaSettingsState>((set, get) => ({
  settings: getInitialSettings(),
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('pizzeria_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (error && error.code !== 'PGRST205' && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const loaded: PizzeriaSettings = {
          routingMode: (data.routing_mode as PizzaRoutingMode) || 'gloria_food',
          gloriaFoodDeliveryUrl: sanitizeUrl(data.gloria_food_delivery_url, DEFAULT_FOOD_DELIVERY_URL),
          gloriaFoodTableUrl: sanitizeUrl(data.gloria_food_table_url, DEFAULT_TABLE_RESERVATION_URL),
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('fp_pizza_routing_mode', loaded.routingMode);
          localStorage.setItem('fp_pizza_delivery_url', loaded.gloriaFoodDeliveryUrl);
          localStorage.setItem('fp_pizza_table_url', loaded.gloriaFoodTableUrl);
        }
        set({ settings: loaded, loading: false });
      } else {
        const fallback = getInitialSettings();
        set({ settings: fallback, loading: false });
      }
    } catch (err: any) {
      console.error('[usePizzaSettingsStore] Errore fetch:', err);
      set({ 
        error: err.message, 
        loading: false, 
        settings: getInitialSettings() 
      });
    }
  },

  updateSettings: async (updates) => {
    const current = get().settings || getInitialSettings();
    set({ loading: true, error: null });

    try {
      const payload: any = { id: 'default' };
      if (updates.routingMode !== undefined) payload.routing_mode = updates.routingMode;
      if (updates.gloriaFoodDeliveryUrl !== undefined) {
        const cleanDelivery = sanitizeUrl(updates.gloriaFoodDeliveryUrl, DEFAULT_FOOD_DELIVERY_URL);
        payload.gloria_food_delivery_url = cleanDelivery;
        payload.gloria_food_url = cleanDelivery;
      }
      if (updates.gloriaFoodTableUrl !== undefined) {
        payload.gloria_food_table_url = sanitizeUrl(updates.gloriaFoodTableUrl, DEFAULT_TABLE_RESERVATION_URL);
      }
      payload.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('pizzeria_settings')
        .upsert(payload);

      if (error && error.code !== 'PGRST205') {
        throw error;
      }

      const updated: PizzeriaSettings = {
        routingMode: updates.routingMode ?? current.routingMode,
        gloriaFoodDeliveryUrl: updates.gloriaFoodDeliveryUrl ? sanitizeUrl(updates.gloriaFoodDeliveryUrl, DEFAULT_FOOD_DELIVERY_URL) : current.gloriaFoodDeliveryUrl,
        gloriaFoodTableUrl: updates.gloriaFoodTableUrl ? sanitizeUrl(updates.gloriaFoodTableUrl, DEFAULT_TABLE_RESERVATION_URL) : current.gloriaFoodTableUrl,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('fp_pizza_routing_mode', updated.routingMode);
        localStorage.setItem('fp_pizza_delivery_url', updated.gloriaFoodDeliveryUrl);
        localStorage.setItem('fp_pizza_table_url', updated.gloriaFoodTableUrl);
      }

      set({ settings: updated, loading: false });
      return true;
    } catch (err: any) {
      console.error('[usePizzaSettingsStore] Errore update:', err);
      const updated: PizzeriaSettings = {
        routingMode: updates.routingMode ?? current.routingMode,
        gloriaFoodDeliveryUrl: updates.gloriaFoodDeliveryUrl ? sanitizeUrl(updates.gloriaFoodDeliveryUrl, DEFAULT_FOOD_DELIVERY_URL) : current.gloriaFoodDeliveryUrl,
        gloriaFoodTableUrl: updates.gloriaFoodTableUrl ? sanitizeUrl(updates.gloriaFoodTableUrl, DEFAULT_TABLE_RESERVATION_URL) : current.gloriaFoodTableUrl,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('fp_pizza_routing_mode', updated.routingMode);
        localStorage.setItem('fp_pizza_delivery_url', updated.gloriaFoodDeliveryUrl);
        localStorage.setItem('fp_pizza_table_url', updated.gloriaFoodTableUrl);
      }
      set({ settings: updated, loading: false, error: null });
      return true;
    }
  },
}));
