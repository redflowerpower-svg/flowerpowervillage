import { supabase } from '../../lib/supabase';
import { getCanonicalTableKey } from '../utils/tableUtils';
import type { CartItem } from '../store/cartStore';

// Ephemeral device ID to filter out self-broadcasted messages
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
  timestamp: number;
}

export interface DiningLiveCartController {
  broadcastCart: (items: CartItem[]) => void;
  requestSync: () => void;
  broadcastClear: () => void;
  unsubscribe: () => void;
}

/**
 * Initializes bidirectional live cart synchronization for a table session.
 * Connects both Supabase Realtime Broadcast (cross-device) and local BroadcastChannel (cross-tab).
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

  // 1. Local Same-Device BroadcastChannel
  let localBc: BroadcastChannel | null = null;
  try {
    localBc = new BroadcastChannel(`fp_dining_live_cart_${canonical}`);
    localBc.onmessage = (ev) => {
      const data = ev.data;
      if (!data || data.senderId === deviceId) return;

      if (data.type === 'CART_SYNC' && Array.isArray(data.items)) {
        if (data.timestamp >= lastProcessedTimestamp) {
          lastProcessedTimestamp = data.timestamp;
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
              timestamp: Date.now()
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

  // 2. Supabase Realtime Channel for Cross-Device WebSockets
  const channelName = `dining_live_cart_${canonical.replace(/[^a-z0-9]/gi, '_')}`;
  const rtChannel = supabase.channel(channelName, {
    config: {
      broadcast: { self: false }
    }
  });

  rtChannel
    .on('broadcast', { event: 'CART_SYNC' }, (event: any) => {
      const payload: LiveCartPayload = event.payload;
      if (!payload || payload.senderId === deviceId) return;
      if (getCanonicalTableKey(payload.tableKey) !== canonical) return;

      if (payload.timestamp >= lastProcessedTimestamp) {
        lastProcessedTimestamp = payload.timestamp;
        onRemoteCartSync(payload.items || [], payload.senderId);
      }
    })
    .on('broadcast', { event: 'REQUEST_SYNC' }, (event: any) => {
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
              timestamp: Date.now()
            }
          });
        }
      }
    })
    .on('broadcast', { event: 'CART_CLEAR' }, (event: any) => {
      const payload = event.payload;
      if (!payload || payload.senderId === deviceId) return;
      if (getCanonicalTableKey(payload.tableKey) !== canonical) return;

      onRemoteCartClear(payload.senderId);
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        // As soon as we join, ask peers if they already have items in the cart
        rtChannel.send({
          type: 'broadcast',
          event: 'REQUEST_SYNC',
          payload: {
            senderId: deviceId,
            tableKey: canonical,
            timestamp: Date.now()
          }
        });
      }
    });

  // Ask local tabs immediately as well
  try {
    localBc?.postMessage({
      type: 'REQUEST_SYNC',
      senderId: deviceId,
      tableKey: canonical,
      timestamp: Date.now()
    });
  } catch {}

  const broadcastCart = (items: CartItem[]) => {
    const timestamp = Date.now();
    lastProcessedTimestamp = timestamp;

    const payload: LiveCartPayload = {
      senderId: deviceId,
      tableKey: canonical,
      items,
      timestamp
    };

    // Send to local tabs
    try {
      localBc?.postMessage({
        type: 'CART_SYNC',
        ...payload
      });
    } catch {}

    // Send to remote devices
    try {
      rtChannel.send({
        type: 'broadcast',
        event: 'CART_SYNC',
        payload
      });
    } catch (err) {
      console.warn('[DiningLiveCart] broadcast failed:', err);
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
          timestamp
        }
      });
    } catch {}
  };

  const broadcastClear = () => {
    try {
      localBc?.postMessage({
        type: 'CART_CLEAR',
        senderId: deviceId,
        tableKey: canonical,
        timestamp: Date.now()
      });
    } catch {}
    try {
      rtChannel.send({
        type: 'broadcast',
        event: 'CART_CLEAR',
        payload: {
          senderId: deviceId,
          tableKey: canonical,
          timestamp: Date.now()
        }
      });
    } catch {}
  };

  const unsubscribe = () => {
    try {
      if (localBc) {
        localBc.close();
      }
    } catch {}
    try {
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
