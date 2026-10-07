import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, serviceRoleKey);
}

export interface NetworkNode {
  id: string;
  public_ip: string;
  location: string; // 'ranong_pizzeria' | 'koh_phayam_village' | 'custom'
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

export interface NetworkSettingsPayload {
  nodes: NetworkNode[];
  persistentDevices?: PersistentDevice[];
  lastUpdated: string;
}

const PUBLIC_JSON_URL = 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/site-images/restaurant_network_nodes.json';

// In-memory runtime cache for 0ms serverless responsiveness
let memoryNodes: NetworkNode[] = [];
let memoryDevices: PersistentDevice[] = [];
let memoryLoaded = false;

export function extractClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    const first = forwarded[0].split(',')[0].trim();
    if (first) return first;
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) {
    return realIp.trim();
  }
  const socketIp = req.socket?.remoteAddress || '';
  if (socketIp.includes('::ffff:')) {
    return socketIp.replace('::ffff:', '');
  }
  return socketIp || '127.0.0.1';
}

function isLocalhostIp(ip: string): boolean {
  if (!ip) return true;
  const clean = ip.trim();
  return (
    clean === '127.0.0.1' ||
    clean === '::1' ||
    clean === 'localhost' ||
    clean.startsWith('192.168.') ||
    clean.startsWith('10.') ||
    clean.startsWith('172.16.') ||
    clean.startsWith('172.17.') ||
    clean.startsWith('172.18.') ||
    clean.startsWith('172.19.') ||
    clean.startsWith('172.20.') ||
    clean.startsWith('172.21.') ||
    clean.startsWith('172.22.') ||
    clean.startsWith('172.23.') ||
    clean.startsWith('172.24.') ||
    clean.startsWith('172.25.') ||
    clean.startsWith('172.26.') ||
    clean.startsWith('172.27.') ||
    clean.startsWith('172.28.') ||
    clean.startsWith('172.29.') ||
    clean.startsWith('172.30.') ||
    clean.startsWith('172.31.')
  );
}

async function fetchSettingsFresh(): Promise<NetworkSettingsPayload | null> {
  try {
    const res = await fetch(`${PUBLIC_JSON_URL}?_t=${Date.now()}_${Math.random()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object' && Array.isArray(data.nodes)) {
        memoryNodes = data.nodes;
        memoryDevices = data.persistentDevices || [];
        memoryLoaded = true;
        return data as NetworkSettingsPayload;
      }
    }
  } catch (err: any) {
    console.warn('[network-auth] Fetch settings error:', err?.message);
  }
  return null;
}

async function persistSettings(nodes: NetworkNode[], persistentDevices: PersistentDevice[]): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const payload: NetworkSettingsPayload = {
      nodes,
      persistentDevices,
      lastUpdated: new Date().toISOString()
    };
    const buffer = Buffer.from(JSON.stringify(payload, null, 2), 'utf-8');

    const { error } = await supabase.storage
      .from('site-images')
      .upload('restaurant_network_nodes.json', buffer, {
        contentType: 'application/json',
        upsert: true,
        cacheControl: '0'
      });

    if (error) {
      console.error('[network-auth] Failed to persist settings to storage:', error);
      return false;
    }

    memoryNodes = nodes;
    memoryDevices = persistentDevices;
    memoryLoaded = true;
    return true;
  } catch (err) {
    console.error('[network-auth] persistSettings exception:', err);
    return false;
  }
}

export async function handleNetworkAuth(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Device-Token');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const clientIp = extractClientIp(req);
  const action = String(req.query.action || (req.body && req.body.action) || 'check-client');

  // Load latest settings if not in memory
  if (!memoryLoaded) {
    await fetchSettingsFresh();
  }

  // 1. ACTION: CHECK CLIENT
  if (action === 'check-client') {
    const deviceToken = String(req.headers['x-device-token'] || req.query.deviceToken || '');

    // Check if localhost / development IP
    if (isLocalhostIp(clientIp)) {
      return res.status(200).json({
        allowed: true,
        reason: 'localhost_dev',
        clientIp,
        isLocalNetwork: true,
        matchedNode: {
          id: 'dev-local',
          public_ip: clientIp,
          location: 'development',
          label: 'Ambiente di Sviluppo Locale',
          last_heartbeat_at: new Date().toISOString(),
          is_active: true,
          created_at: new Date().toISOString()
        }
      });
    }

    // Check if Persistent Device Token matches
    if (deviceToken) {
      const isPersistent = memoryDevices.some(d => d.deviceId === deviceToken);
      if (isPersistent) {
        return res.status(200).json({
          allowed: true,
          reason: 'persistent_device_unlocked',
          clientIp,
          isLocalNetwork: false,
          matchedNode: null,
          deviceToken
        });
      }
    }

    // Check if client IP matches an active registered node
    const matched = memoryNodes.find(n => n.is_active && n.public_ip.trim() === clientIp.trim());
    if (matched) {
      return res.status(200).json({
        allowed: true,
        reason: 'restaurant_wifi_matched',
        clientIp,
        isLocalNetwork: true,
        matchedNode: matched
      });
    }

    // Not authorized yet
    return res.status(200).json({
      allowed: false,
      reason: 'external_network_detected',
      clientIp,
      isLocalNetwork: false,
      registeredNodesCount: memoryNodes.filter(n => n.is_active).length
    });
  }

  // 2. ACTION: HEARTBEAT (KDS / Cassa automatic beacon)
  if (action === 'heartbeat') {
    try {
      const location = String(req.body?.location || req.query.location || 'ranong_pizzeria');
      const label = String(req.body?.label || req.query.label || 'Router Ranong (2.4G/5G/Extender)');
      const forceIp = req.body?.ip || clientIp;

      // Always fetch fresh before mutating
      const fresh = await fetchSettingsFresh();
      const currentNodes = fresh?.nodes || memoryNodes;
      const currentDevices = fresh?.persistentDevices || memoryDevices;

      const now = new Date().toISOString();
      const existingIndex = currentNodes.findIndex(
        n => n.location === location && (n.public_ip === forceIp || n.id === 'primary-' + location)
      );

      let updatedNodes: NetworkNode[];
      if (existingIndex >= 0) {
        updatedNodes = [...currentNodes];
        updatedNodes[existingIndex] = {
          ...updatedNodes[existingIndex],
          public_ip: forceIp,
          last_heartbeat_at: now,
          is_active: true
        };
      } else {
        const newNode: NetworkNode = {
          id: 'node-' + Date.now(),
          public_ip: forceIp,
          location,
          label,
          last_heartbeat_at: now,
          is_active: true,
          created_at: now
        };
        updatedNodes = [...currentNodes, newNode];
      }

      await persistSettings(updatedNodes, currentDevices);

      return res.status(200).json({
        success: true,
        registeredIp: forceIp,
        lastHeartbeat: now,
        nodes: updatedNodes
      });
    } catch (err: any) {
      console.error('[network-auth heartbeat error]:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 3. ACTION: AUTHORIZE PERSISTENT DEVICE (Master Admin Unlock)
  if (action === 'authorize-device') {
    try {
      const deviceId = req.body?.deviceId || ('dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36));
      const deviceName = req.body?.deviceName || 'Dispositivo Remoto Sbloccato';
      const authorizedBy = req.body?.authorizedBy || 'admin';

      const fresh = await fetchSettingsFresh();
      const currentNodes = fresh?.nodes || memoryNodes;
      const currentDevices = fresh?.persistentDevices || memoryDevices;

      const newDevice: PersistentDevice = {
        deviceId,
        deviceName,
        authorizedAt: new Date().toISOString(),
        authorizedBy
      };

      const filteredDevices = currentDevices.filter(d => d.deviceId !== deviceId);
      const updatedDevices = [...filteredDevices, newDevice];

      await persistSettings(currentNodes, updatedDevices);

      return res.status(200).json({
        success: true,
        deviceToken: deviceId,
        device: newDevice
      });
    } catch (err: any) {
      console.error('[network-auth authorize-device error]:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 4. ACTION: GET WHITELIST & STATUS
  if (action === 'get-nodes' || action === 'get-whitelist') {
    const fresh = await fetchSettingsFresh();
    return res.status(200).json({
      success: true,
      clientIp,
      nodes: fresh?.nodes || memoryNodes,
      persistentDevices: fresh?.persistentDevices || memoryDevices,
      lastUpdated: fresh?.lastUpdated || null
    });
  }

  // 5. ACTION: SAVE NODES (Manual Admin Edit)
  if (action === 'save-nodes') {
    try {
      const nodes: NetworkNode[] = req.body?.nodes || [];
      const persistentDevices: PersistentDevice[] = req.body?.persistentDevices || memoryDevices;
      await persistSettings(nodes, persistentDevices);
      return res.status(200).json({
        success: true,
        nodes,
        persistentDevices
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(400).json({ error: 'Unknown action parameter: ' + action });
}
