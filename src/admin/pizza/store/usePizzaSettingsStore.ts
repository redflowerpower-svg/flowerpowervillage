import { create } from 'zustand';
import { supabase } from '../../../lib/supabase';

export type PizzaRoutingMode = 'custom';

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

export const DEFAULT_FOOD_DELIVERY_URL = '';
export const DEFAULT_TABLE_RESERVATION_URL = '';

const getInitialSettings = (): PizzeriaSettings => {
  return {
    routingMode: 'custom',
    gloriaFoodDeliveryUrl: '',
    gloriaFoodTableUrl: '',
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
          routingMode: 'custom',
          gloriaFoodDeliveryUrl: '',
          gloriaFoodTableUrl: '',
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('fp_pizza_routing_mode', 'custom');
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
    set({ loading: true, error: null });

    try {
      const payload: any = { 
        id: 'default',
        routing_mode: 'custom',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('pizzeria_settings')
        .upsert(payload);

      if (error && error.code !== 'PGRST205') {
        throw error;
      }

      const updated: PizzeriaSettings = {
        routingMode: 'custom',
        gloriaFoodDeliveryUrl: '',
        gloriaFoodTableUrl: '',
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('fp_pizza_routing_mode', 'custom');
      }

      set({ settings: updated, loading: false });
      return true;
    } catch (err: any) {
      console.error('[usePizzaSettingsStore] Errore update:', err);
      const updated: PizzeriaSettings = {
        routingMode: 'custom',
        gloriaFoodDeliveryUrl: '',
        gloriaFoodTableUrl: '',
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('fp_pizza_routing_mode', 'custom');
      }
      set({ settings: updated, loading: false, error: null });
      return true;
    }
  }
}));
