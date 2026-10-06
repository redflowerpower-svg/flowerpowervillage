import { create } from 'zustand';
import { supabase } from '../../../lib/supabase';
import type { PizzaOrder } from '../../../pizza/types';
import { menuData } from '../../../pizza/data/menuData';
import {
  PizzaPromoCode,
  loadPizzaPromoCodes,
  savePizzaPromoCodes
} from '../../../pizza/services/pizzaPromoService';
import {
  fetchCloudMenuOverrides,
  saveCloudMenuOverride
} from '../../../pizza/data/pizzaMenuCloudService';

export type { PizzaPromoCode };

export interface PizzaMenuItem {
  id: string;
  name: string;
  nameTh?: string;
  nameIt?: string;
  nameDe?: string;
  category: string;
  nativeCategory?: string;
  price: number;
  is_available: boolean;
  is_daily_special?: boolean;
  image?: string;
  description?: string;
  variants?: any[];
  extras?: any[];
}

interface PizzaAdminState {
  orders: PizzaOrder[];
  loading: boolean;
  error: string | null;
  soundEnabled: boolean;
  filterStatus: 'all' | 'new' | 'preparing' | 'delivering' | 'completed' | 'cancelled';
  
  // Menu items catalog state
  menuItems: PizzaMenuItem[];
  menuLoading: boolean;
  menuError: string | null;
  filterMenuCategory: string;

  // Order Actions
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (id: string, status: PizzaOrder['status']) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  addOrder: (order: PizzaOrder) => void;
  setFilterStatus: (status: PizzaAdminState['filterStatus']) => void;
  toggleSound: () => void;
  subscribeToRealtime: () => () => void;

  // Menu Catalog Actions
  fetchMenuItems: () => Promise<void>;
  toggleItemAvailability: (id: string, currentStatus: boolean) => Promise<void>;
  toggleDailySpecial: (id: string, currentStatus?: boolean) => Promise<void>;
  updateItemPrice: (id: string, newPrice: number) => Promise<void>;
  upsertMenuItem: (item: any) => Promise<void>;
  setFilterMenuCategory: (category: string) => void;

  // Promo Codes / Coupon Actions
  promoCodes: PizzaPromoCode[];
  addPromoCode: (promo: Omit<PizzaPromoCode, 'id' | 'slotsUsed' | 'createdAt'>) => void;
  togglePromoCodeActive: (id: string) => void;
  deletePromoCode: (id: string) => void;
  incrementPromoCodeUsage: (codeOrId: string) => void;
  refreshPromoCodes: () => void;
}

// Helper per sanitize ordini
export const sanitizePizzaOrder = (rawOrder: any): PizzaOrder => {
  if (!rawOrder || typeof rawOrder !== 'object') {
    return {
      id: 'ord-fallback-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      customer_name: 'Cliente Sconosciuto',
      phone: 'N/A',
      address: 'Indirizzo non specificato',
      items: [],
      total: 0,
      status: 'new',
      payment_method: 'cash',
      receipt_url: null,
      has_whatsapp: false,
      has_line: false
    };
  }

  let parsedItems = [];
  try {
    if (typeof rawOrder.items === 'string') {
      parsedItems = JSON.parse(rawOrder.items);
    } else if (Array.isArray(rawOrder.items)) {
      parsedItems = rawOrder.items;
    }
  } catch (e) {
    console.error('Error parsing order items:', e);
    parsedItems = [];
  }

  if (!Array.isArray(parsedItems)) parsedItems = [];

  const extractString = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      return val.name || val.nameIt || val.name_it || val.nameTh || val.sku || '';
    }
    return String(val);
  };

  const sanitizedItems = parsedItems.map((item: any, idx: number) => {
    const rawName = item?.name || item?.nameIt || item?.sku;
    const nameStr = extractString(rawName) || 'Prodotto';
    const variantStr = extractString(item?.selectedVariant);

    return {
      id: String(item?.id || `item-${idx}`),
      name: nameStr,
      nameTh: extractString(item?.nameTh || item?.name_th || ''),
      quantity: typeof item?.quantity === 'number' ? item.quantity : 1,
      price: typeof item?.price === 'number' ? item.price : (typeof item?.basePrice === 'number' ? item.basePrice : 0),
      selectedVariant: variantStr || null,
      selectedAddons: Array.isArray(item?.selectedAddons) ? item.selectedAddons : [],
      selectedExtras: Array.isArray(item?.selectedExtras) 
        ? item.selectedExtras.map((e: any) => ({
            id: String(e?.id || ''),
            name: extractString(e?.name || e),
            price: typeof e?.price === 'number' ? e.price : 0
          }))
        : [],
      notes: typeof item?.notes === 'string' ? item.notes : ''
    };
  });

  const validStatuses: PizzaOrder['status'][] = ['new', 'preparing', 'delivering', 'completed', 'cancelled'];
  const status = validStatuses.includes(rawOrder.status) ? rawOrder.status : 'new';

  return {
    id: String(rawOrder.id || `ord-${Math.random().toString(36).substring(2, 9)}`),
    created_at: rawOrder.created_at || new Date().toISOString(),
    customer_name: String(rawOrder.customer_name || 'Cliente Sconosciuto'),
    phone: String(rawOrder.phone || 'N/A'),
    address: String(rawOrder.address || 'Indirizzo non specificato'),
    notes: rawOrder.notes ? String(rawOrder.notes) : undefined,
    items: sanitizedItems,
    total: typeof rawOrder.total === 'number' ? rawOrder.total : 0,
    status: status,
    payment_method: String(rawOrder.payment_method || 'cash'),
    receipt_url: rawOrder.receipt_url ? String(rawOrder.receipt_url) : null,
    delivery_lat: typeof rawOrder.delivery_lat === 'number' ? rawOrder.delivery_lat : undefined,
    delivery_lng: typeof rawOrder.delivery_lng === 'number' ? rawOrder.delivery_lng : undefined,
    has_whatsapp: Boolean(rawOrder.has_whatsapp),
    has_line: Boolean(rawOrder.has_line)
  };
};

export const usePizzaAdminStore = create<PizzaAdminState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,
  soundEnabled: true,
  filterStatus: 'all',

  menuItems: [],
  menuLoading: false,
  menuError: null,
  filterMenuCategory: 'All',

  promoCodes: loadPizzaPromoCodes(),

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('pizza_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const sanitizedOrders = (data || []).map(sanitizePizzaOrder);
      set({ orders: sanitizedOrders, loading: false });
    } catch (err: any) {
      console.error('[usePizzaAdminStore] Fetch Error:', err);
      set({ error: err.message || 'Impossibile caricare gli ordini.', loading: false });
    }
  },

  updateOrderStatus: async (id: string, status: PizzaOrder['status']) => {
    // 1. Optimistic UI update (0ms UI latency)
    set((state) => ({
      orders: state.orders.map((o) => (String(o.id) === String(id) ? { ...o, status } : o))
    }));

    // 2. Broadcast immediately on local channels
    try {
      const ch1 = new BroadcastChannel('flower_power_orders_channel');
      ch1.postMessage({ 
        type: status === 'preparing' ? 'ORDER_ACCEPTED' : status === 'delivering' ? 'ORDER_DELIVERING' : status === 'completed' ? 'ORDER_COMPLETED' : 'ORDER_UPDATED', 
        orderId: id, 
        status 
      });
      ch1.close();
    } catch (e) {}

    try {
      const ch2 = new BroadcastChannel('pizza_orders_channel');
      ch2.postMessage({ 
        type: status === 'preparing' ? 'ORDER_ACCEPTED' : status === 'delivering' ? 'ORDER_DELIVERING' : status === 'completed' ? 'ORDER_COMPLETED' : 'ORDER_UPDATED', 
        orderId: id, 
        status 
      });
      ch2.close();
    } catch (e) {}

    // 3. Update database via serverless backend API (uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS)
    try {
      const response = await fetch('/api/pizza-order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, status })
      });

      if (!response.ok) {
        console.warn('[usePizzaAdminStore] Backend API status update returned non-OK, trying direct Supabase fallback...');
        await supabase
          .from('pizza_orders')
          .update({ status })
          .eq('id', id);
      }
    } catch (err) {
      console.warn('[usePizzaAdminStore] API status update fetch failed, trying direct Supabase fallback:', err);
      try {
        await supabase
          .from('pizza_orders')
          .update({ status })
          .eq('id', id);
      } catch (directErr) {
        console.error('[usePizzaAdminStore] Direct update also failed:', directErr);
      }
    }
  },

  deleteOrder: async (id: string) => {
    // 1. Optimistic removal from store
    set((state) => ({
      orders: state.orders.filter((o) => String(o.id) !== String(id))
    }));

    // 2. Broadcast deletion on local channels
    try {
      const ch1 = new BroadcastChannel('flower_power_orders_channel');
      ch1.postMessage({ type: 'ORDER_DELETED', orderId: id });
      ch1.close();
    } catch (e) {}

    try {
      const ch2 = new BroadcastChannel('pizza_orders_channel');
      ch2.postMessage({ type: 'ORDER_DELETED', orderId: id });
      ch2.close();
    } catch (e) {}

    // 3. Delete via backend API (service_role bypasses RLS)
    try {
      await fetch('/api/pizza-order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, status: 'cancelled', action: 'delete' })
      });
    } catch (err) {
      console.warn('[usePizzaAdminStore] API delete failed, trying direct Supabase fallback:', err);
    }

    // 4. Also call table-reservation endpoint just in case it's a reservation record
    try {
      await fetch('/api/table-reservation', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'delete' })
      });
    } catch (e) {}

    // 5. Fallback direct Supabase delete
    try {
      await supabase.from('pizza_orders').delete().eq('id', id);
    } catch (directErr) {
      console.error('[usePizzaAdminStore] Direct delete error:', directErr);
    }
  },

  addOrder: (order: PizzaOrder) => {
    const sanitized = sanitizePizzaOrder(order);
    set((state) => {
      if (state.orders.some((o) => o.id === sanitized.id)) {
        return state;
      }
      return { orders: [sanitized, ...state.orders] };
    });
  },

  setFilterStatus: (filterStatus) => set({ filterStatus }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  fetchMenuItems: async () => {
    set({ menuLoading: true, menuError: null });
    try {
      const cloudOverrides = await fetchCloudMenuOverrides();

      const { data, error } = await supabase
        .from('pizza_menu_items')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error && error.code !== '42P01') {
        console.warn('[usePizzaAdminStore] Supabase menu notice:', error.message);
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const sanitizedData = data.map((item: any) => ({
          ...item,
          name: typeof item.name === 'string' ? item.name : (item.name?.name || item.name?.nameIt || item.name?.sku || 'Prodotto'),
          nameTh: typeof item.nameTh === 'string' ? item.nameTh : (item.nameTh?.nameTh || ''),
          description: typeof item.description === 'string' ? item.description : (item.description?.it || item.description?.description_it || ''),
          is_available: cloudOverrides.availability[item.id] !== undefined
            ? cloudOverrides.availability[item.id]
            : (item.is_available !== undefined && item.is_available !== null ? item.is_available : true),
          is_daily_special: cloudOverrides.dailySpecials[item.id] !== undefined
            ? cloudOverrides.dailySpecials[item.id]
            : (item.is_daily_special !== undefined && item.is_daily_special !== null ? item.is_daily_special : false)
        }));
        set({ menuItems: sanitizedData, menuLoading: false });
      } else {
        // Build initial items catalog from menuData
        const dailyCat = menuData.find(c => c.id === 'daily-specials');
        const dailySpecialItemIds = new Set(dailyCat ? dailyCat.items.map(i => i.id) : []);

        const defaultItems: PizzaMenuItem[] = [];
        const seenIds = new Set<string>();

        // First pass: add items from native categories
        menuData.forEach((cat) => {
          if (cat.id === 'daily-specials') return;
          cat.items.forEach((item: any) => {
            if (seenIds.has(item.id)) return;
            seenIds.add(item.id);
            const isSpecial = cloudOverrides.dailySpecials[item.id] !== undefined
              ? !!cloudOverrides.dailySpecials[item.id]
              : dailySpecialItemIds.has(item.id);

            const isAvail = cloudOverrides.availability[item.id] !== undefined
              ? !!cloudOverrides.availability[item.id]
              : true;

            defaultItems.push({
              id: item.id,
              name: typeof item.name === 'string' ? item.name : (item.name?.name || item.name?.nameIt || item.name?.sku || 'Prodotto'),
              nameTh: item.nameTh,
              nameIt: item.nameIt,
              nameDe: item.nameDe,
              category: cat.id,
              nativeCategory: cat.id,
              price: cloudOverrides.prices[item.id] !== undefined ? cloudOverrides.prices[item.id] : item.price,
              is_available: isAvail,
              is_daily_special: isSpecial,
              image: item.image,
              description: typeof item.description === 'string' ? item.description : (item.description_it || item.description?.it || ''),
              variants: item.variants,
              extras: item.extras
            });
          });
        });

        // Second pass: add any items that only exist in daily-specials
        if (dailyCat) {
          dailyCat.items.forEach((item: any) => {
            if (seenIds.has(item.id)) return;
            seenIds.add(item.id);
            const isSpecial = cloudOverrides.dailySpecials[item.id] !== undefined
              ? !!cloudOverrides.dailySpecials[item.id]
              : true;

            const isAvail = cloudOverrides.availability[item.id] !== undefined
              ? !!cloudOverrides.availability[item.id]
              : true;

            defaultItems.push({
              id: item.id,
              name: typeof item.name === 'string' ? item.name : (item.name?.name || item.name?.nameIt || item.name?.sku || 'Prodotto'),
              nameTh: item.nameTh,
              nameIt: item.nameIt,
              nameDe: item.nameDe,
              category: 'daily-specials',
              nativeCategory: 'daily-specials',
              price: cloudOverrides.prices[item.id] !== undefined ? cloudOverrides.prices[item.id] : item.price,
              is_available: isAvail,
              is_daily_special: isSpecial,
              image: item.image,
              description: typeof item.description === 'string' ? item.description : (item.description_it || item.description?.it || ''),
              variants: item.variants,
              extras: item.extras
            });
          });
        }

        set({ menuItems: defaultItems, menuLoading: false });
      }
    } catch (err: any) {
      console.error('[usePizzaAdminStore] Fetch menu items error:', err);
      set({ menuError: err.message || 'Impossibile caricare il menu.', menuLoading: false });
    }
  },

  toggleItemAvailability: async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    set((state) => ({
      menuItems: state.menuItems.map((item) =>
        item.id === id ? { ...item, is_available: nextStatus } : item
      )
    }));

    const item = get().menuItems.find((i) => i.id === id);
    await saveCloudMenuOverride({
      availability: { [id]: nextStatus },
      updatedItem: item ? { ...item, is_available: nextStatus } : undefined
    });
  },

  toggleDailySpecial: async (id: string, currentStatus?: boolean) => {
    const nextStatus = !currentStatus;
    set((state) => ({
      menuItems: state.menuItems.map((item) =>
        item.id === id ? { ...item, is_daily_special: nextStatus } : item
      )
    }));

    const item = get().menuItems.find((i) => i.id === id);
    await saveCloudMenuOverride({
      dailySpecials: { [id]: nextStatus },
      updatedItem: item ? { ...item, is_daily_special: nextStatus } : undefined
    });

    try {
      const item = get().menuItems.find((i) => i.id === id);
      if (!item) return;

      const { error } = await supabase
        .from('pizza_menu_items')
        .upsert({
          id: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          is_available: item.is_available,
          is_daily_special: nextStatus,
          image: item.image,
          description: item.description
        }, { onConflict: 'id' });

      if (error && error.code !== '42P01') {
        console.warn('[usePizzaAdminStore] toggleDailySpecial notice:', error.message);
      }
    } catch (e) {
      console.error('[usePizzaAdminStore] toggleDailySpecial error:', e);
    }
  },

  updateItemPrice: async (id: string, newPrice: number) => {
    const safePrice = Math.max(0, isNaN(newPrice) ? 0 : newPrice);
    set((state) => ({
      menuItems: state.menuItems.map((item) =>
        item.id === id ? { ...item, price: safePrice } : item
      )
    }));

    try {
      const item = get().menuItems.find((i) => i.id === id);
      if (!item) return;

      const { error } = await supabase
        .from('pizza_menu_items')
        .upsert({
          id: item.id,
          name: item.name,
          category: item.category,
          price: safePrice,
          is_available: item.is_available,
          image: item.image,
          description: item.description
        });

      if (error) {
        console.warn('[usePizzaAdminStore] Upsert price notice:', error.message);
      }
    } catch (e) {
      console.error('[usePizzaAdminStore] updateItemPrice error:', e);
    }
  },

  upsertMenuItem: async (newItem: any) => {
    set((state) => {
      const exists = state.menuItems.some((i) => i.id === newItem.id);
      if (exists) {
        return {
          menuItems: state.menuItems.map((i) => (i.id === newItem.id ? { ...i, ...newItem } : i))
        };
      }
      return {
        menuItems: [newItem, ...state.menuItems]
      };
    });

    try {
      const { error } = await supabase
        .from('pizza_menu_items')
        .upsert({
          id: newItem.id,
          name: typeof newItem.name === 'string' ? newItem.name : newItem.name?.name || 'Prodotto',
          name_it: newItem.nameIt || newItem.name_it || (typeof newItem.name === 'string' ? newItem.name : ''),
          name_th: newItem.nameTh || newItem.name_th || '',
          name_de: newItem.nameDe || newItem.name_de || '',
          category: newItem.category,
          price: Number(newItem.price) || 0,
          is_available: newItem.is_available !== false,
          image: newItem.image,
          description: typeof newItem.description === 'string' ? newItem.description : '',
          description_it: newItem.descriptionIt || newItem.description_it || '',
          description_th: newItem.descriptionTh || newItem.description_th || '',
          description_de: newItem.descriptionDe || newItem.description_de || '',
          variants: newItem.variants,
          extras: newItem.extras
        }, { onConflict: 'id' });

      if (error && error.code !== '42P01') {
        console.warn('[usePizzaAdminStore] upsertMenuItem notice:', error.message);
      }
    } catch (e) {
      console.error('[usePizzaAdminStore] upsertMenuItem error:', e);
    }
  },

  setFilterMenuCategory: (filterMenuCategory) => set({ filterMenuCategory }),

  addPromoCode: (promoData) => {
    const newPromo: PizzaPromoCode = {
      ...promoData,
      id: 'pizza-promo-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now(),
      slotsUsed: 0,
      createdAt: new Date().toISOString()
    };
    const updated = [newPromo, ...get().promoCodes];
    savePizzaPromoCodes(updated);
    set({ promoCodes: updated });
  },

  togglePromoCodeActive: (id) => {
    const updated = get().promoCodes.map((p) =>
      p.id === id ? { ...p, active: !p.active } : p
    );
    savePizzaPromoCodes(updated);
    set({ promoCodes: updated });
  },

  deletePromoCode: (id) => {
    const updated = get().promoCodes.filter((p) => p.id !== id);
    savePizzaPromoCodes(updated);
    set({ promoCodes: updated });
  },

  incrementPromoCodeUsage: (codeOrId) => {
    const clean = codeOrId.trim().toUpperCase();
    const updated = get().promoCodes.map((p) => {
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
    set({ promoCodes: updated });
  },

  refreshPromoCodes: () => {
    const refreshed = loadPizzaPromoCodes();
    set({ promoCodes: refreshed });
  },

  subscribeToRealtime: () => {
    const subscription = supabase
      .channel('public:pizza_orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pizza_orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = sanitizePizzaOrder(payload.new);
            get().addOrder(newOrder);
          } else if (payload.eventType === 'UPDATE') {
            const updated = sanitizePizzaOrder(payload.new);
            set((state) => ({
              orders: state.orders.map((o) => (o.id === updated.id ? updated : o))
            }));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = String(payload.old.id);
            set((state) => ({
              orders: state.orders.filter((o) => o.id !== deletedId)
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }
}));

