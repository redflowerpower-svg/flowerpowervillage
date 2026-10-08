import { supabase } from '../../lib/supabase';
import { getCanonicalTableKey } from '../utils/tableUtils';

export interface TableGuestPresenceInfo {
  guestCount: number;
  lastActive: number;
  devices: string[];
}

export type HallPresenceMap = Record<string, TableGuestPresenceInfo>;

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

/**
 * Global Realtime Hall Presence Service:
 * Tracks which tables currently have active guests connected via smartphone QR codes.
 * Synchronizes instantly across Dining Tablets, staff phones, and kitchen monitors.
 */
export function subscribeToHallTablePresence(
  onPresenceChange: (occupiedMap: HallPresenceMap) => void
): () => void {
  const channelName = 'dining_hall_presence_channel';
  const localBc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('fp_dining_hall_presence') : null;
  let localMap: HallPresenceMap = {};

  const computePresenceMap = (state: Record<string, any[]>): HallPresenceMap => {
    const map: HallPresenceMap = {};
    const now = Date.now();

    for (const [_, presences] of Object.entries(state)) {
      for (const p of presences) {
        if (!p || !p.tableKey || !p.isGuest) continue;
        const canonical = getCanonicalTableKey(p.tableKey);
        if (!map[canonical]) {
          map[canonical] = {
            guestCount: 0,
            lastActive: p.joinedAt || now,
            devices: []
          };
        }
        if (!map[canonical].devices.includes(p.deviceId)) {
          map[canonical].devices.push(p.deviceId);
          map[canonical].guestCount = map[canonical].devices.length;
        }
        if (p.joinedAt && p.joinedAt > map[canonical].lastActive) {
          map[canonical].lastActive = p.joinedAt;
        }
      }
    }

    return map;
  };

  // 1. Supabase Realtime Channel
  const rtChannel = supabase.channel(channelName, {
    config: {
      presence: { key: getLocalDeviceId() }
    }
  });

  rtChannel.on('presence', { event: 'sync' }, () => {
    try {
      const state = rtChannel.presenceState();
      const updatedMap = computePresenceMap(state);
      localMap = { ...localMap, ...updatedMap };
      onPresenceChange({ ...localMap });
    } catch (err) {
      console.warn('[HallPresence] Presence sync error:', err);
    }
  });

  // Fast-path immediate broadcast handler
  rtChannel.on('broadcast', { event: 'GUEST_PRESENCE_PING' }, (ev: any) => {
    if (ev?.payload?.tableKey) {
      const canonical = getCanonicalTableKey(ev.payload.tableKey);
      const now = Date.now();
      const dev = ev.payload.deviceId || 'dev_guest';
      const existing = localMap[canonical] || { guestCount: 0, lastActive: now, devices: [] };
      const devices = existing.devices.includes(dev) ? existing.devices : [...existing.devices, dev];
      localMap[canonical] = {
        guestCount: Math.max(1, devices.length),
        lastActive: now,
        devices
      };
      onPresenceChange({ ...localMap });
    }
  });

  rtChannel.on('broadcast', { event: 'GUEST_LEFT_TABLE' }, (ev: any) => {
    if (ev?.payload?.tableKey) {
      const canonical = getCanonicalTableKey(ev.payload.tableKey);
      const dev = ev.payload.deviceId;
      if (localMap[canonical]) {
        const remainingDevices = localMap[canonical].devices.filter(d => d !== dev);
        if (remainingDevices.length === 0) {
          delete localMap[canonical];
        } else {
          localMap[canonical] = {
            ...localMap[canonical],
            guestCount: remainingDevices.length,
            devices: remainingDevices
          };
        }
        onPresenceChange({ ...localMap });
      }
    }
  });

  rtChannel.on('broadcast', { event: 'TABLE_STATUS_CHANGED' }, (ev: any) => {
    if (ev?.payload?.occupiedMap) {
      localMap = { ...localMap, ...ev.payload.occupiedMap };
      onPresenceChange({ ...localMap });
    }
  });

  rtChannel.subscribe();

  // 2. Local BroadcastChannel
  if (localBc) {
    localBc.onmessage = (ev) => {
      if (ev.data?.type === 'GUEST_JOINED_TABLE' && ev.data.tableKey) {
        const canonical = getCanonicalTableKey(ev.data.tableKey);
        const now = Date.now();
        const dev = ev.data.deviceId || 'dev_local';
        const existing = localMap[canonical] || { guestCount: 0, lastActive: now, devices: [] };
        const devices = existing.devices.includes(dev) ? existing.devices : [...existing.devices, dev];
        localMap[canonical] = {
          guestCount: Math.max(1, devices.length),
          lastActive: now,
          devices
        };
        onPresenceChange({ ...localMap });
      } else if (ev.data?.type === 'HALL_PRESENCE_UPDATE' && ev.data.occupiedMap) {
        localMap = { ...localMap, ...ev.data.occupiedMap };
        onPresenceChange({ ...localMap });
      }
    };
  }

  // Periodic pruning of dead guest sessions (older than 35s)
  const pruneTimer = setInterval(() => {
    const now = Date.now();
    let changed = false;
    for (const [key, info] of Object.entries(localMap)) {
      if (now - info.lastActive > 35000) {
        delete localMap[key];
        changed = true;
      }
    }
    if (changed) {
      onPresenceChange({ ...localMap });
    }
  }, 10000);

  return () => {
    try {
      clearInterval(pruneTimer);
      rtChannel.unsubscribe();
      if (localBc) localBc.close();
    } catch {}
  };
}

/**
 * Reports that the current device is active on a specific table as a guest smartphone
 */
export function reportTableGuestPresence(
  tableKey: string,
  isGuest: boolean = true,
  lang?: string
): () => void {
  if (!tableKey) return () => {};
  const canonical = getCanonicalTableKey(tableKey);
  const deviceId = getLocalDeviceId();
  const channelName = 'dining_hall_presence_channel';

  const rtChannel = supabase.channel(channelName, {
    config: {
      presence: { key: deviceId }
    }
  });

  const sendPing = () => {
    try {
      rtChannel.send({
        type: 'broadcast',
        event: 'GUEST_PRESENCE_PING',
        payload: {
          tableKey: canonical,
          deviceId,
          isGuest,
          lang: lang || 'EN',
          timestamp: Date.now()
        }
      });
    } catch {}
  };

  rtChannel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      sendPing();
      try {
        await rtChannel.track({
          deviceId,
          tableKey: canonical,
          isGuest,
          lang: lang || 'EN',
          joinedAt: Date.now()
        });
      } catch (err) {
        console.warn('[HallPresence] Track guest error:', err);
      }
    }
  });

  // Immediate Local BroadcastChannel notify
  try {
    const localBc = new BroadcastChannel('fp_dining_hall_presence');
    localBc.postMessage({
      type: 'GUEST_JOINED_TABLE',
      tableKey: canonical,
      deviceId,
      timestamp: Date.now()
    });
    setTimeout(() => {
      try { localBc.close(); } catch {}
    }, 1000);
  } catch {}

  // Periodic heartbeat ping every 8s
  const heartbeatTimer = setInterval(() => {
    sendPing();
  }, 8000);

  return () => {
    try {
      clearInterval(heartbeatTimer);
      try {
        rtChannel.send({
          type: 'broadcast',
          event: 'GUEST_LEFT_TABLE',
          payload: { tableKey: canonical, deviceId }
        });
      } catch {}
      rtChannel.untrack().catch(() => {});
      rtChannel.unsubscribe();
    } catch {}
  };
}
