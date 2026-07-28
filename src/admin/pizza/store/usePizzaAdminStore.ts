import { create } from 'zustand';
import { supabase } from '../../../lib/supabase';
import type { PizzaOrder } from '../../../pizza/types';
import { menuData } from '../../../pizza/data/menuData';

export interface PizzaMenuItem {
  id: string;
  name: string;
  nameTh?: string;
  category: string;
  price: number;
  is_available: boolean;
  image?: string;
  description?: string;
  variants?: any[];
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
  addOrder: (order: PizzaOrder) => void;
  setFilterStatus: (status: PizzaAdminState['filterStatus']) => void;
  toggleSound: () => void;
  subscribeToRealtime: () => () => void;

  // Menu Catalog Actions
  fetchMenuItems: () => Promise<void>;
  toggleItemAvailability: (id: string, currentStatus: boolean) => Promise<void>;
  updateItemPrice: (id: string, newPrice: number) => Promise<void>;
  setFilterMenuCategory: (category: string) => void;
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
    payment_method: rawOrder.payment_method === 'transfer' ? 'transfer' : 'cash',
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
    // Optimistic UI update
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o))
    }));

    try {
      const { error } = await supabase
        .from('pizza_orders')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('[usePizzaAdminStore] Update Status Error:', error);
        // Rollback via refetch
        get().fetchOrders();
      }
    } catch (err) {
      console.error('[usePizzaAdminStore] Update exception:', err);
      get().fetchOrders();
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
          description: typeof item.description === 'string' ? item.description : (item.description?.it || item.description?.description_it || '')
        }));
        set({ menuItems: sanitizedData, menuLoading: false });
      } else {
        // Build initial items catalog from menuData
        const defaultItems: PizzaMenuItem[] = [];
        menuData.forEach((cat) => {
          cat.items.forEach((item: any) => {
            defaultItems.push({
              id: item.id,
              name: typeof item.name === 'string' ? item.name : (item.name?.name || item.name?.nameIt || item.name?.sku || 'Prodotto'),
              nameTh: item.nameTh,
              category: cat.id,
              price: item.price,
              is_available: true,
              image: item.image,
              description: typeof item.description === 'string' ? item.description : (item.description_it || item.description?.it || ''),
              variants: item.variants
            });
          });
        });
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
          is_available: nextStatus,
          image: item.image,
          description: item.description
        });

      if (error) {
        console.warn('[usePizzaAdminStore] Upsert availability notice:', error.message);
      }
    } catch (e) {
      console.error('[usePizzaAdminStore] toggleItemAvailability error:', e);
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

  setFilterMenuCategory: (filterMenuCategory) => set({ filterMenuCategory }),

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

