export interface NetworkNode {
  id: string;
  public_ip: string;
  location: string;
  label: string;
  last_heartbeat_at: string;
  is_active: boolean;
  created_at: string;
}

export interface PersistentDevice {
  deviceId: string;
  deviceName: string;
  authorizedAt: string;
  authorizedBy: string;
}

export interface NetworkAccessCheckResult {
  allowed: boolean;
  reason: string;
  clientIp: string;
  isLocalNetwork: boolean;
  matchedNode?: NetworkNode | null;
  deviceToken?: string;
  registeredNodesCount?: number;
}

const API_BASE = '/api/network-auth';

export async function checkNetworkAccess(deviceToken?: string): Promise<NetworkAccessCheckResult> {
  // If in localhost / local development, bypass check immediately
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) {
      return {
        allowed: true,
        reason: 'localhost_dev_client',
        clientIp: '127.0.0.1',
        isLocalNetwork: true
      };
    }
  }

  const token = deviceToken || (typeof localStorage !== 'undefined' ? localStorage.getItem('fp_dining_device_token') || '' : '');
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['X-Device-Token'] = token;
    }

    const res = await fetch(`${API_BASE}?action=check-client&_t=${Date.now()}`, {
      headers,
      cache: 'no-store'
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('[networkAuthService] Check access error, failing gracefully:', err);
  }

  return {
    allowed: false,
    reason: 'network_check_failed',
    clientIp: '',
    isLocalNetwork: false
  };
}

export async function sendNetworkHeartbeat(location = 'ranong_pizzeria', label = 'Router Ranong (2.4G/5G/Extender)'): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}?action=heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location, label })
    });
    return res.ok;
  } catch (err) {
    console.warn('[networkAuthService] Heartbeat beacon failed:', err);
    return false;
  }
}

export async function authorizePermanentDevice(deviceId: string, deviceName: string, authorizedBy = 'admin'): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}?action=authorize-device`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, deviceName, authorizedBy })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.deviceToken && typeof localStorage !== 'undefined') {
        localStorage.setItem('fp_dining_device_token', data.deviceToken);
        localStorage.setItem('fp_dining_tablet_unlocked', 'true');
      }
      return true;
    }
  } catch (err) {
    console.error('[networkAuthService] Authorize permanent device error:', err);
  }
  return false;
}

export async function fetchNetworkWhitelist(): Promise<{
  success: boolean;
  clientIp?: string;
  nodes: NetworkNode[];
  persistentDevices: PersistentDevice[];
  lastUpdated?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}?action=get-whitelist&_t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('[networkAuthService] Fetch whitelist error:', err);
  }
  return { success: false, nodes: [], persistentDevices: [] };
}

export async function saveNetworkWhitelist(nodes: NetworkNode[], persistentDevices: PersistentDevice[]): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}?action=save-nodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes, persistentDevices })
    });
    return res.ok;
  } catch (err) {
    console.error('[networkAuthService] Save nodes error:', err);
    return false;
  }
}
