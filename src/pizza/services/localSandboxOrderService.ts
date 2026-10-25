/**
 * LOCAL SANDBOX ORDER SERVICE
 * 
 * Circuit Breaker per ambiente di sviluppo locale (localhost / 127.0.0.1).
 * Consente di testare l'intero flusso di ordinazione (Tablet Tavoli -> Cassa -> Kitchen Monitor KDS -> Salda Conto)
 * in circuito chiuso a 0ms senza mai toccare il database Supabase di produzione
 * e senza inviare notifiche a Telegram né email ai clienti.
 */

const STORAGE_KEY = 'fp_pizza_sandbox_orders';
const CHANNEL_NAME = 'fp_pizza_sandbox_orders';

export interface SandboxOrder {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  table_number?: string;
  items: any[];
  total: number;
  payment_method: string;
  status: 'new' | 'received' | 'preparing' | 'delivering' | 'completed' | 'cancelled' | 'rejected' | 'settled';
  is_sandbox: true;
  has_whatsapp?: boolean;
  has_line?: boolean;
  created_at: string;
  updated_at?: string;
}

/**
 * Rileva se l'applicazione sta girando su ambiente di sviluppo locale
 */
export const isLocalSandbox = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
};

/**
 * Estrae la lista corrente degli ordini presenti nella sandbox locale
 */
export const getSandboxOrders = (): SandboxOrder[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[LocalSandbox] Errore lettura storage ordini:', err);
    return [];
  }
};

/**
 * Salva l'elenco degli ordini nella sandbox e notifica tutti i listener locali
 */
const persistSandboxOrders = (orders: SandboxOrder[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    notifySandboxBroadcast(orders);
  } catch (err) {
    console.warn('[LocalSandbox] Errore persistenza ordini:', err);
  }
};

/**
 * Notifica cross-tab e cross-channel
 */
const notifySandboxBroadcast = (orders: SandboxOrder[]) => {
  try {
    const bc = new BroadcastChannel(CHANNEL_NAME);
    bc.postMessage({ type: 'SANDBOX_ORDERS_SYNC', orders });
    bc.close();
  } catch {}

  // Trigger standard storage event per schede sullo stesso dominio
  try {
    window.dispatchEvent(new Event('fp_sandbox_orders_updated'));
  } catch {}
};

/**
 * Crea o aggiorna una comanda all'interno della Sandbox Locale
 */
export const saveSandboxOrder = (
  orderPayload: any, 
  existingOrderId?: string | null
): SandboxOrder => {
  const currentOrders = getSandboxOrders();
  const now = new Date().toISOString();

  let targetId = existingOrderId ? String(existingOrderId) : null;
  let finalOrder: SandboxOrder;

  if (targetId && currentOrders.some(o => o.id === targetId)) {
    // Aggiornamento comanda esistente (Integrazione Comanda)
    currentOrders.forEach((o, idx) => {
      if (o.id === targetId) {
        currentOrders[idx] = {
          ...o,
          ...orderPayload,
          id: targetId!,
          status: 'new', // Torna in cima al KDS per i nuovi piatti
          is_sandbox: true,
          updated_at: now
        };
        finalOrder = currentOrders[idx];
      }
    });
  } else {
    // Nuova comanda
    const newId = `sb-${Date.now().toString().slice(-6)}`;
    finalOrder = {
      id: newId,
      customer_name: String(orderPayload.customer_name || 'Cliente Tavolo (Sandbox)'),
      phone: String(orderPayload.phone || '+66 Dining Table'),
      address: String(orderPayload.address || ''),
      table_number: orderPayload.table_number,
      items: Array.isArray(orderPayload.items) ? orderPayload.items : [],
      total: Number(orderPayload.total) || 0,
      payment_method: String(orderPayload.payment_method || 'cash_at_table'),
      status: 'new',
      is_sandbox: true,
      has_whatsapp: Boolean(orderPayload.has_whatsapp),
      has_line: Boolean(orderPayload.has_line),
      created_at: now,
      updated_at: now
    };
    currentOrders.unshift(finalOrder);
  }

  persistSandboxOrders(currentOrders);

  // Notifica canali KDS storici
  try {
    const chKDS = new BroadcastChannel('pizza_orders_channel');
    chKDS.postMessage({ 
      type: 'NEW_ORDER', 
      order: finalOrder!, 
      orderId: finalOrder!.id, 
      isTableReload: !!existingOrderId,
      hasNewItems: true 
    });
    chKDS.close();
  } catch {}

  try {
    const chFP = new BroadcastChannel('flower_power_orders_channel');
    chFP.postMessage({ 
      type: 'NEW_ORDER', 
      order: finalOrder!, 
      orderId: finalOrder!.id, 
      isTableReload: !!existingOrderId,
      hasNewItems: true 
    });
    chFP.close();
  } catch {}

  console.log(`%c[LOCAL SANDBOX] Comanda salvata in circuito locale protetto: ID ${finalOrder!.id} (Zero leak verso Ranong)`, 'color: #10b981; font-weight: bold;');
  return finalOrder!;
};

/**
 * Aggiorna lo stato di una comanda nella Sandbox Locale (es. da KDS: preparing, completed, settled, cancelled)
 */
export const updateSandboxOrderStatus = (
  orderId: string, 
  status: SandboxOrder['status']
): SandboxOrder | null => {
  const currentOrders = getSandboxOrders();
  let updatedOrder: SandboxOrder | null = null;

  const nextOrders = currentOrders.map(o => {
    if (o.id === orderId) {
      updatedOrder = {
        ...o,
        status,
        updated_at: new Date().toISOString()
      };
      return updatedOrder;
    }
    return o;
  });

  if (updatedOrder) {
    persistSandboxOrders(nextOrders);
    console.log(`%c[LOCAL SANDBOX] Stato comanda ${orderId} aggiornato a "${status}"`, 'color: #3b82f6;');
  }

  return updatedOrder;
};

/**
 * Elimina una comanda dalla Sandbox Locale
 */
export const deleteSandboxOrder = (orderId: string) => {
  const currentOrders = getSandboxOrders();
  const nextOrders = currentOrders.filter(o => o.id !== orderId);
  persistSandboxOrders(nextOrders);
  console.log(`%c[LOCAL SANDBOX] Comanda ${orderId} eliminata dalla Sandbox Locale`, 'color: #ef4444;');
};

/**
 * Svuota completamente tutte le comande della Sandbox Locale
 */
export const clearSandboxOrders = () => {
  persistSandboxOrders([]);
  console.log('%c[LOCAL SANDBOX] Sandbox azzerata completamente.', 'color: #f59e0b;');
};

/**
 * Sottoscrizione reattiva per componenti React (DiningTabletSite, KitchenTabletKDS, ecc.)
 */
export const subscribeToSandboxOrders = (callback: (orders: SandboxOrder[]) => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel(CHANNEL_NAME);
    bc.onmessage = (ev) => {
      if (ev.data?.type === 'SANDBOX_ORDERS_SYNC' && Array.isArray(ev.data.orders)) {
        callback(ev.data.orders);
      }
    };
  } catch {}

  const handleCustomEvent = () => {
    callback(getSandboxOrders());
  };

  const handleStorageEvent = (ev: StorageEvent) => {
    if (ev.key === STORAGE_KEY) {
      callback(getSandboxOrders());
    }
  };

  window.addEventListener('fp_sandbox_orders_updated', handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    if (bc) bc.close();
    window.removeEventListener('fp_sandbox_orders_updated', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
};
