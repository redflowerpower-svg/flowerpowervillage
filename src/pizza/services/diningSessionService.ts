import { getCanonicalTableKey } from '../utils/tableUtils';
import { supabase } from '../../lib/supabase';

export interface DiningTableSession {
  tableKey: string;
  tableName?: string;
  token: string;
  createdAt: number;
  status: 'active' | 'settled' | 'revoked';
}

const STORAGE_PREFIX = 'fp_dining_session_';
const SETTLED_PREFIX = 'fp_dining_settled_';

/**
 * Generate a dynamic cryptographic-like session token for a table
 */
export function generateDiningTableSession(tableKey: string, tableName?: string): DiningTableSession {
  const canonical = getCanonicalTableKey(tableKey);
  const now = Date.now();
  
  // Check if active un-revoked session exists for this table
  try {
    const existingRaw = localStorage.getItem(`${STORAGE_PREFIX}${canonical}`);
    if (existingRaw) {
      const parsed = JSON.parse(existingRaw) as DiningTableSession;
      if (parsed && parsed.token && parsed.status === 'active') {
        // If created within last 6 hours and not settled, reuse
        if (now - parsed.createdAt < 6 * 60 * 60 * 1000) {
          return parsed;
        }
      }
    }
  } catch {}

  // Create new session token: tb_sess_<canonical>_<hash>
  const rand = Math.random().toString(36).substring(2, 10);
  const token = `tb_${canonical.replace(/[^a-z0-9]/gi, '')}_${now.toString(36)}_${rand}`;

  const session: DiningTableSession = {
    tableKey: canonical,
    tableName: tableName || tableKey,
    token,
    createdAt: now,
    status: 'active'
  };

  try {
    localStorage.setItem(`${STORAGE_PREFIX}${canonical}`, JSON.stringify(session));
    localStorage.removeItem(`${SETTLED_PREFIX}${canonical}`);
  } catch {}

  // Broadcast new session
  try {
    const ch = new BroadcastChannel('fp_dining_sessions');
    ch.postMessage({ type: 'SESSION_CREATED', session });
    ch.close();
  } catch {}

  return session;
}

/**
 * Validate a table session token
 */
export async function validateDiningTableSession(tableKey: string, token: string): Promise<{
  valid: boolean;
  status: 'active' | 'settled' | 'expired' | 'invalid';
  session?: DiningTableSession;
}> {
  if (!tableKey || !token) {
    return { valid: false, status: 'invalid' };
  }

  const canonical = getCanonicalTableKey(tableKey);

  // 1. Check if explicitly marked as settled/revoked
  try {
    const isSettled = localStorage.getItem(`${SETTLED_PREFIX}${canonical}`) === 'true';
    if (isSettled) {
      return { valid: false, status: 'settled' };
    }
  } catch {}

  // 2. Check local stored session
  let localSession: DiningTableSession | null = null;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${canonical}`);
    if (raw) {
      localSession = JSON.parse(raw);
    }
  } catch {}

  if (localSession && localSession.token === token) {
    if (localSession.status === 'settled' || localSession.status === 'revoked') {
      return { valid: false, status: 'settled', session: localSession };
    }
    // Check if older than 12 hours
    if (Date.now() - localSession.createdAt > 12 * 60 * 60 * 1000) {
      return { valid: false, status: 'expired', session: localSession };
    }
    return { valid: true, status: 'active', session: localSession };
  }

  // 3. Fallback: Check if token has valid format matching table
  if (token.startsWith(`tb_${canonical.replace(/[^a-z0-9]/gi, '')}_`)) {
    // Check if table has settled orders recently
    try {
      const { data } = await supabase
        .from('pizza_orders')
        .select('id, status, created_at')
        .ilike('address', `%${tableKey}%`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const latest = data[0];
        if (latest.status === 'completed' || latest.status === 'settled') {
          // If the latest order is completed within last 30 minutes, table is settled
          const orderAge = Date.now() - new Date(latest.created_at).getTime();
          if (orderAge < 60 * 60 * 1000) {
            return { valid: false, status: 'settled' };
          }
        }
      }
    } catch {}

    // Allow session as valid guest session
    return { 
      valid: true, 
      status: 'active', 
      session: {
        tableKey: canonical,
        token,
        createdAt: Date.now(),
        status: 'active'
      }
    };
  }

  return { valid: false, status: 'invalid' };
}

/**
 * Revoke and close a table session (called on ORDER PAID / TABLE SETTLED)
 */
export function revokeDiningTableSession(tableKey: string): void {
  const canonical = getCanonicalTableKey(tableKey);

  try {
    localStorage.setItem(`${SETTLED_PREFIX}${canonical}`, 'true');
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${canonical}`);
    if (raw) {
      const session = JSON.parse(raw);
      session.status = 'settled';
      localStorage.setItem(`${STORAGE_PREFIX}${canonical}`, JSON.stringify(session));
    }
  } catch {}

  // Broadcast session revoked to all open tabs and devices
  try {
    const ch = new BroadcastChannel('fp_dining_sessions');
    ch.postMessage({ type: 'SESSION_REVOKED', tableKey: canonical, timestamp: Date.now() });
    ch.close();
  } catch {}
}

/**
 * Build shareable QR URL for a table
 */
export function buildDiningQrUrl(tableKey: string, token: string): string {
  if (typeof window === 'undefined') return '';
  let origin = window.location.origin;
  
  // If running in local dev on localhost, replace with local WiFi IP (192.168.1.87)
  // so that physical smartphone cameras scanning the QR code can reach the server!
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    origin = `http://192.168.1.87:${window.location.port || '3000'}`;
  }

  const canonical = getCanonicalTableKey(tableKey);
  return `${origin}/dining?table=${encodeURIComponent(canonical)}&token=${encodeURIComponent(token)}`;
}
