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
    openTime: string; // "17:00"
    closeTime: string; // "22:30"
    closedDays: number[]; // e.g. []
  };
  lastUpdated: string;
}

const DEFAULT_STATUS: PizzeriaServiceStatus = {
  isOpen: true,
  pausedUntil: null,
  pauseReason: 'busy',
  openingHours: {
    openTime: '17:00',
    closeTime: '22:30',
    closedDays: []
  },
  lastUpdated: new Date().toISOString()
};

export async function handlePizzaServiceStatus(req: VercelRequest, res: VercelResponse) {
  const supabase = getSupabaseAdmin();

  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase.storage
        .from('site-images')
        .download('pizzeria_service_status.json');

      if (error || !data) {
        return res.status(200).json({ success: true, status: DEFAULT_STATUS });
      }

      const text = await data.text();
      const status: PizzeriaServiceStatus = JSON.parse(text);
      return res.status(200).json({ success: true, status });
    } catch (err: any) {
      console.warn('[pizza-service-status GET] Falling back to default:', err.message);
      return res.status(200).json({ success: true, status: DEFAULT_STATUS });
    }
  }

  if (req.method === 'POST') {
    try {
      const newStatus = req.body as Partial<PizzeriaServiceStatus>;
      
      // Fetch existing status to merge
      let existingStatus = { ...DEFAULT_STATUS };
      try {
        const { data } = await supabase.storage
          .from('site-images')
          .download('pizzeria_service_status.json');
        if (data) {
          existingStatus = JSON.parse(await data.text());
        }
      } catch (e) {}

      const mergedStatus: PizzeriaServiceStatus = {
        ...existingStatus,
        ...newStatus,
        lastUpdated: new Date().toISOString()
      };

      const buffer = Buffer.from(JSON.stringify(mergedStatus, null, 2), 'utf-8');

      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload('pizzeria_service_status.json', buffer, {
          contentType: 'application/json',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      return res.status(200).json({ success: true, status: mergedStatus });
    } catch (err: any) {
      console.error('[pizza-service-status POST Error]:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
