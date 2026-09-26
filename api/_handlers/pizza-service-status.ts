import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, serviceRoleKey);
}

export interface PizzeriaServiceStatus {
  isOpen: boolean;
  pausedUntil: string | null;
  pauseReason: string;
  openingHours: {
    openTime: string; // "11:00"
    closeTime: string; // "21:30"
    closedDays: number[]; // e.g. []
  };
  lastUpdated: string;
}

const DEFAULT_STATUS: PizzeriaServiceStatus = {
  isOpen: true,
  pausedUntil: null,
  pauseReason: 'busy',
  openingHours: {
    openTime: '11:00',
    closeTime: '21:30',
    closedDays: []
  },
  lastUpdated: new Date().toISOString()
};

const PUBLIC_JSON_URL = 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/site-images/pizzeria_service_status.json';

// In-memory runtime cache for 0ms serverless responsiveness
let memoryStatus: PizzeriaServiceStatus | null = null;

async function fetchFromStorageFresh(): Promise<PizzeriaServiceStatus | null> {
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
      if (data && typeof data === 'object' && data.openingHours) {
        return data as PizzeriaServiceStatus;
      }
    }
  } catch (err: any) {
    console.warn('[pizza-service-status] Fetch fresh error:', err?.message);
  }
  return null;
}

export async function handlePizzaServiceStatus(req: VercelRequest, res: VercelResponse) {
  const supabase = getSupabaseAdmin();

  // Enable CORS & Disable Caching
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const fresh = await fetchFromStorageFresh();
      if (fresh) {
        memoryStatus = fresh;
        return res.status(200).json({ success: true, status: fresh });
      }

      if (memoryStatus) {
        return res.status(200).json({ success: true, status: memoryStatus });
      }

      return res.status(200).json({ success: true, status: DEFAULT_STATUS });
    } catch (err: any) {
      console.warn('[pizza-service-status GET] Falling back:', err.message);
      return res.status(200).json({ success: true, status: memoryStatus || DEFAULT_STATUS });
    }
  }

  if (req.method === 'POST') {
    try {
      let newStatus: Partial<PizzeriaServiceStatus> = {};
      if (typeof req.body === 'string') {
        try {
          newStatus = JSON.parse(req.body);
        } catch (e) {
          newStatus = {};
        }
      } else if (req.body && typeof req.body === 'object') {
        newStatus = req.body;
      }

      // Fetch current status directly from public storage (fresh bypass) or memory
      const fresh = await fetchFromStorageFresh();
      const existingStatus: PizzeriaServiceStatus = fresh || memoryStatus || { ...DEFAULT_STATUS };

      const mergedStatus: PizzeriaServiceStatus = {
        ...existingStatus,
        ...newStatus,
        openingHours: {
          ...existingStatus.openingHours,
          ...(newStatus.openingHours || {})
        },
        lastUpdated: new Date().toISOString()
      };

      const buffer = Buffer.from(JSON.stringify(mergedStatus, null, 2), 'utf-8');

      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload('pizzeria_service_status.json', buffer, {
          contentType: 'application/json',
          upsert: true,
          cacheControl: '0'
        });

      if (uploadError) {
        throw uploadError;
      }

      // Update in-memory status immediately
      memoryStatus = mergedStatus;

      return res.status(200).json({ success: true, status: mergedStatus });
    } catch (err: any) {
      console.error('[pizza-service-status POST Error]:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
