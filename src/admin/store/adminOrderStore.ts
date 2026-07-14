import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import type { PizzaOrder } from '../../pizza/types';

interface AdminOrderState {
  orders: PizzaOrder[];
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (id: string, status: PizzaOrder['status'] | 'delivering' | 'completed') => Promise<void>;
  addOrder: (order: PizzaOrder) => void;
}

// Inizializza BroadcastChannel per comunicazione cross-tab
let orderChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined') {
  try {
    orderChannel = new BroadcastChannel('flower_power_orders_channel');
  } catch (e) {
    console.warn('BroadcastChannel initialization failed:', e);
  }
}

// Helper per gestire la cache locale degli ordini nel localStorage
export const getLocalOrdersCache = (): PizzaOrder[] => {
  if (typeof window === 'undefined') return [];
  try {
    const cacheStr = localStorage.getItem('pizza-new-orders-cache');
    return cacheStr ? JSON.parse(cacheStr) : [];
  } catch (e) {
    console.error('Error reading pizza-new-orders-cache:', e);
    return [];
  }
};

export const saveLocalOrdersCache = (orders: PizzaOrder[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('pizza-new-orders-cache', JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving pizza-new-orders-cache:', e);
  }
};

// Funzione di sanitizzazione radicale dei dati per prevenire crash a runtime
export const sanitizeOrder = (rawOrder: any): PizzaOrder => {
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
      receipt_url: null
    };
  }

  return {
    id: rawOrder.id ? String(rawOrder.id) : 'ord-fallback-' + Math.random().toString(36).substring(2, 9),
    created_at: rawOrder.created_at ? String(rawOrder.created_at) : new Date().toISOString(),
    customer_name: rawOrder.customer_name ? String(rawOrder.customer_name) : 'Cliente Sconosciuto',
    phone: rawOrder.phone ? String(rawOrder.phone) : 'N/A',
    address: rawOrder.address ? String(rawOrder.address) : 'Indirizzo non specificato',
    items: Array.isArray(rawOrder.items) ? rawOrder.items : [],
    total: typeof rawOrder.total === 'number' ? rawOrder.total : parseFloat(rawOrder.total) || 0,
    status: ['new', 'preparing', 'ready', 'delivering', 'completed'].includes(rawOrder.status) ? rawOrder.status : 'new',
    payment_method: ['promptpay', 'cash'].includes(rawOrder.payment_method) ? rawOrder.payment_method : 'cash',
    receipt_url: rawOrder.receipt_url ? String(rawOrder.receipt_url) : null,
    telegram_notified: !!rawOrder.telegram_notified
  };
};

// Pulizia automatica degli ordini di test/simulazione alla prima inizializzazione
// Svuota sia la cache locale che tutti gli override di stato salvati in precedenza
const clearStaleCache = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('pizza-new-orders-cache');
    // Rimuovi anche tutti gli override di stato (chiavi pizza-order-status-override-*)
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('pizza-order-status-override-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    console.log('[AdminStore] Cache LocalStorage pulita — Dashboard pronta a zero ordini.');
  } catch (e) {
    console.warn('[AdminStore] Errore durante la pulizia della cache:', e);
  }
};
clearStaleCache();

export const useAdminOrderStore = create<AdminOrderState>((set, get) => {
  // Si mette in ascolto dei messaggi del BroadcastChannel se supportato con try/catch totale
  if (orderChannel) {
    orderChannel.onmessage = (event) => {
      try {
        const { type, order } = event.data || {};
        if (type === 'NEW_ORDER' && order) {
          console.log('Received new order via BroadcastChannel:', order);
          get().addOrder(order);
        }
      } catch (err) {
        console.error('Error handling BroadcastChannel onmessage event safely:', err);
      }
    };
  }

  return {
    orders: [],
    loading: false,
    error: null,

    addOrder: (order: PizzaOrder) => {
      try {
        const sanitized = sanitizeOrder(order);
        
        // Salva l'ordine nella cache del localStorage per prevenire la sparizione durante il polling
        const cached = getLocalOrdersCache();
        if (!cached.some(o => o.id === sanitized.id)) {
          cached.push(sanitized);
          saveLocalOrdersCache(cached);
        }

        // Aggiorna lo stato in memoria se non è già presente
        const currentOrders = get().orders;
        if (!currentOrders.some(o => o.id === sanitized.id)) {
          set({ orders: [sanitized, ...currentOrders] });
        }
      } catch (e) {
        console.error('Error adding order to store:', e);
      }
    },

    fetchOrders: async () => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase
          .from('pizza_orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        
        const dbOrders = ((data || []) as any[]).map(sanitizeOrder);
        
        // Leggi la cache degli ordini non ancora allineati nel database
        const cachedOrders = getLocalOrdersCache();
        
        // Unisci database e cache per evitare la perdita di dati
        const mergedOrders = [...dbOrders];
        cachedOrders.forEach(cached => {
          if (!mergedOrders.some(o => o.id === cached.id)) {
            mergedOrders.push(cached);
          }
        });
        
        // Mappa gli ordini applicando i salvataggi dello stato salvati in LocalStorage
        const mappedOrders = mergedOrders.map(order => {
          if (order.id) {
            const localStatus = localStorage.getItem(`pizza-order-status-override-${order.id}`);
            if (localStatus) {
              return { ...order, status: localStatus as any };
            }
          }
          return order;
        });

        // Ordina per data decrescente (più recenti prima)
        mappedOrders.sort((a, b) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bTime - aTime;
        });

        set({ orders: mappedOrders, loading: false });
      } catch (err: any) {
        console.error('Error fetching admin orders:', err);
        // Fallback: in caso di offline, mostra la cache locale degli ordini
        const cachedOrders = getLocalOrdersCache().map(order => {
          if (order.id) {
            const localStatus = localStorage.getItem(`pizza-order-status-override-${order.id}`);
            if (localStatus) {
              return { ...order, status: localStatus as any };
            }
          }
          return order;
        });
        set({ orders: cachedOrders, loading: false });
      }
    },

    updateOrderStatus: async (id, status) => {
      set({ loading: true, error: null });
      try {
        const isSimulated = typeof id === 'string' && id.startsWith('ord-simulated-');
        
        if (isSimulated) {
          console.log('Simulated order status update — skipping database call');
        } else {
          // Prova ad aggiornare lo stato nel database remoto
          const { error } = await supabase
            .from('pizza_orders')
            .update({ status })
            .eq('id', id);

          if (error) {
            console.warn('Database status update failed. Storing status override locally:', error.message);
            // Persisti la modifica dello stato in locale tramite LocalStorage
            localStorage.setItem(`pizza-order-status-override-${id}`, status);
          } else {
            // Rimuovi l'override se l'aggiornamento remoto ha successo
            localStorage.removeItem(`pizza-order-status-override-${id}`);
          }
        }
        
        // Aggiorna lo stato anche all'interno della cache locale degli ordini
        const cached = getLocalOrdersCache();
        let updatedCache;
        if (status === 'completed') {
          // Rimuovi completamente dalla cache una volta completato/archiviato
          updatedCache = cached.filter(o => o.id !== id);
        } else {
          updatedCache = cached.map(o => o.id === id ? { ...o, status: status as any } : o);
        }
        saveLocalOrdersCache(updatedCache);
        
        // Aggiorna lo stato locale in modo reattivo ed immediato (flusso locale resiliente)
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status: status as any } : o)),
          loading: false
        }));
      } catch (err: any) {
        console.error('Error updating order status, falling back to LocalStorage override:', err);
        localStorage.setItem(`pizza-order-status-override-${id}`, status);
        
        const cached = getLocalOrdersCache();
        let updatedCache;
        if (status === 'completed') {
          updatedCache = cached.filter(o => o.id !== id);
        } else {
          updatedCache = cached.map(o => o.id === id ? { ...o, status: status as any } : o);
        }
        saveLocalOrdersCache(updatedCache);

        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status: status as any } : o)),
          loading: false
        }));
      }
    }
  };
});
