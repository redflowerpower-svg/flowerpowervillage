import { supabase } from '../../lib/supabase';
import { getCanonicalTableKey } from '../utils/tableUtils';
import type { CartItem } from '../store/cartStore';

// Unique ephemeral device ID per session
const getLocalDeviceId = (): string => {
  try {
    let id = sessionStorage.getItem('fp_dining_dev_id');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      sessionStorage.setItem('fp_dining_dev_id', id);
    }
    return id;
  } catch {
    return 'dev_' + Math.random().toString(36).substring(2, 9);
  }
};

export interface LiveCartPayload {
  senderId: string;
  tableKey: string;
  items: CartItem[];
  updatedAt: number;
}

export interface DiningLiveCartController {
  broadcastCart: (items: CartItem[]) => void;
  requestSync: () => void;
  broadcastClear: () => void;
  unsubscribe: () => void;
}

/**
 * Initializes bulletproof bidirectional live cart synchronization for a table session.
 * Uses:
 * 1. Supabase Realtime Presence (server-backed state memory for late joiners & QR scans)
 * 2. Supabase Realtime Broadcast (sub-millisecond instant reactive updates)
 * 3. Local BroadcastChannel (cross-tab sync on same device)
 */
export function connectDiningLiveCart({
  tableKey,
  onRemoteCartSync,
  onRequestSyncReceived,
  onRemoteCartClear
}: {
  tableKey: string;
  onRemoteCartSync: (items: CartItem[], senderId: string) => void;
  onRequestSyncReceived?: () => CartItem[];
  onRemoteCartClear: (senderId: string) => void;
}): DiningLiveCartController {
  const canonical = getCanonicalTableKey(tableKey);
  const deviceId = getLocalDeviceId();
  let lastProcessedTimestamp = 0;
  let isSubscribed = false;

  // 1. Local Same-Device BroadcastChannel
  let localBc: BroadcastChannel | null = null;
  try {
    localBc = new BroadcastChannel(`fp_dining_live_cart_${canonical}`);
    localBc.onmessage = (ev) => {
      const data = ev.data;
      if (!data || data.senderId === deviceId) return;

      if (data.type === 'CART_SYNC' && Array.isArray(data.items)) {
        if ((data.updatedAt || data.timestamp || 0) >= lastProcessedTimestamp) {
          lastProcessedTimestamp = data.updatedAt || data.timestamp || Date.now();
          onRemoteCartSync(data.items, data.senderId);
        }
      } else if (data.type === 'REQUEST_SYNC') {
        if (onRequestSyncReceived) {
          const currentItems = onRequestSyncReceived();
          if (currentItems && currentItems.length > 0) {
            localBc?.postMessage({
              type: 'CART_SYNC',
              senderId: deviceId,
              tableKey: canonical,
              items: currentItems,
              updatedAt: Date.now()
            });
          }
        }
      } else if (data.type === 'CART_CLEAR') {
        onRemoteCartClear(data.senderId);
      }
    };
  } catch (err) {
    console.warn('[DiningLiveCart] Local BroadcastChannel unavailable:', err);
  }

  // 2. Supabase Realtime Channel with Presence + Broadcast
  const cleanKey = canonical.toLowerCase().replace(/[^a-z0-9]/gi, '_');
  const channelName = `dining_room_${cleanKey}`;

  const rtChannel = supabase.channel(channelName, {
    config: {
      broadcast: { self: false },
      presence: { key: deviceId }
    }
  });

  // Handle Presence Sync (Delivered automatically by Supabase cluster to late-joining QR phones!)
  rtChannel.on('presence', { event: 'sync' }, () => {
    try {
      const state = rtChannel.presenceState();
      const presences = Object.values(state).flat() as any[];
      if (presences.length === 0) return;

      // Find the latest cart state by timestamp
      const validPresences = presences.filter(p => p && Array.isArray(p.items) && p.updatedAt);
      if (validPresences.length === 0) return;

      validPresences.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      const latest = validPresences[0];

      if (latest && latest.senderId !== deviceId && (latest.updatedAt || 0) > lastProcessedTimestamp) {
        lastProcessedTimestamp = latest.updatedAt;
        if (latest.items.length === 0) {
          onRemoteCartClear(latest.senderId);
        } else {
          onRemoteCartSync(latest.items, latest.senderId);
        }
      }
    } catch (err) {
      console.warn('[DiningLiveCart] Presence sync error:', err);
    }
  });

  // Handle Instant Broadcast CART_SYNC
  rtChannel.on('broadcast', { event: 'CART_SYNC' }, (event: any) => {
    const payload: LiveCartPayload = event.payload;
    if (!payload || payload.senderId === deviceId) return;
    if (getCanonicalTableKey(payload.tableKey) !== canonical) return;

    const ts = payload.updatedAt || (payload as any).timestamp || 0;
    if (ts >= lastProcessedTimestamp) {
      lastProcessedTimestamp = ts;
      onRemoteCartSync(payload.items || [], payload.senderId);
    }
  });

  // Handle Instant Broadcast CART_CLEAR
  rtChannel.on('broadcast', { event: 'CART_CLEAR' }, (event: any) => {
    const payload = event.payload;
    if (!payload || payload.senderId === deviceId) return;
    if (getCanonicalTableKey(payload.tableKey) !== canonical) return;

    lastProcessedTimestamp = payload.updatedAt || Date.now();
    onRemoteCartClear(payload.senderId);
  });

  // Handle REQUEST_SYNC from peer
  rtChannel.on('broadcast', { event: 'REQUEST_SYNC' }, (event: any) => {
    const payload = event.payload;
    if (!payload || payload.senderId === deviceId) return;
    if (getCanonicalTableKey(payload.tableKey) !== canonical) return;

    if (onRequestSyncReceived) {
      const currentItems = onRequestSyncReceived();
      if (currentItems && currentItems.length > 0) {
        rtChannel.send({
          type: 'broadcast',
          event: 'CART_SYNC',
          payload: {
            senderId: deviceId,
            tableKey: canonical,
            items: currentItems,
            updatedAt: Date.now()
          }
        });
      }
    }
  });

  // Subscribe and track presence initial state
  rtChannel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      isSubscribed = true;

      // Check if we already have items to track
      if (onRequestSyncReceived) {
        const initialItems = onRequestSyncReceived();
        if (initialItems && initialItems.length > 0) {
          lastProcessedTimestamp = Date.now();
          await rtChannel.track({
            senderId: deviceId,
            tableKey: canonical,
            items: initialItems,
            updatedAt: lastProcessedTimestamp
          });
        }
      }

      // Request sync from peers
      try {
        rtChannel.send({
          type: 'broadcast',
          event: 'REQUEST_SYNC',
          payload: {
            senderId: deviceId,
            tableKey: canonical,
            updatedAt: Date.now()
          }
        });
      } catch {}
    }
  });

  // Broadcast to local same-browser tabs
  try {
    localBc?.postMessage({
      type: 'REQUEST_SYNC',
      senderId: deviceId,
      tableKey: canonical,
      timestamp: Date.now()
    });
  } catch {}

  const broadcastCart = async (items: CartItem[]) => {
    const timestamp = Date.now();
    lastProcessedTimestamp = timestamp;

    const payload: LiveCartPayload = {
      senderId: deviceId,
      tableKey: canonical,
      items,
      updatedAt: timestamp
    };

    // 1. Update local same-device BroadcastChannel
    try {
      localBc?.postMessage({
        type: 'CART_SYNC',
        ...payload
      });
    } catch {}

    // 2. Track in Supabase Presence (persists in cloud memory for late joiners!)
    if (isSubscribed) {
      try {
        await rtChannel.track(payload);
      } catch (err) {
        console.warn('[DiningLiveCart] Presence track failed:', err);
      }
    }

    // 3. Instant Realtime Broadcast to active peers
    try {
      rtChannel.send({
        type: 'broadcast',
        event: 'CART_SYNC',
        payload
      });
    } catch (err) {
      console.warn('[DiningLiveCart] Broadcast send failed:', err);
    }
  };

  const requestSync = () => {
    const timestamp = Date.now();
    try {
      localBc?.postMessage({
        type: 'REQUEST_SYNC',
        senderId: deviceId,
        tableKey: canonical,
        timestamp
      });
    } catch {}
    try {
      rtChannel.send({
        type: 'broadcast',
        event: 'REQUEST_SYNC',
        payload: {
          senderId: deviceId,
          tableKey: canonical,
          updatedAt: timestamp
        }
      });
    } catch {}
  };

  const broadcastClear = async () => {
    const timestamp = Date.now();
    lastProcessedTimestamp = timestamp;

    try {
      localBc?.postMessage({
        type: 'CART_CLEAR',
        senderId: deviceId,
        tableKey: canonical,
        timestamp
      });
    } catch {}

    if (isSubscribed) {
      try {
        await rtChannel.track({
          senderId: deviceId,
          tableKey: canonical,
          items: [],
          updatedAt: timestamp
        });
      } catch {}
    }

    try {
      rtChannel.send({
        type: 'broadcast',
        event: 'CART_CLEAR',
        payload: {
          senderId: deviceId,
          tableKey: canonical,
          updatedAt: timestamp
        }
      });
    } catch {}
  };

  const unsubscribe = () => {
    try {
      if (localBc) localBc.close();
    } catch {}
    try {
      if (isSubscribed) {
        rtChannel.untrack();
      }
      supabase.removeChannel(rtChannel);
    } catch {}
  };

  return {
    broadcastCart,
    requestSync,
    broadcastClear,
    unsubscribe
  };
}
