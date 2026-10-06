import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, serviceRoleKey);
}

export interface PizzaMenuOverrides {
  availability: Record<string, boolean>; // id -> is_available (false = sold out)
  dailySpecials: Record<string, boolean>; // id -> is_daily_special
  prices: Record<string, number>; // id -> price override
  lastUpdated: string;
}

const DEFAULT_OVERRIDES: PizzaMenuOverrides = {
  availability: {},
  dailySpecials: {},
  prices: {},
  lastUpdated: new Date().toISOString()
};

export async function handlePizzaMenuSync(req: VercelRequest, res: VercelResponse) {
  const supabase = getSupabaseAdmin();

  // Enable CORS & Disable Cache
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      // 1. Leggi da storage site-images/pizza_menu_overrides.json
      const { data: storageData, error: storageErr } = await supabase.storage
        .from('site-images')
        .download('pizza_menu_overrides.json');

      let cloudOverrides: PizzaMenuOverrides = { ...DEFAULT_OVERRIDES };

      if (!storageErr && storageData) {
        try {
          const text = await storageData.text();
          cloudOverrides = JSON.parse(text);
        } catch (_) {}
      }

      // 2. Leggi anche tabella pizza_menu_items per massima ridondanza
      const { data: dbItems } = await supabase
        .from('pizza_menu_items')
        .select('id, is_available, is_daily_special, price');

      if (dbItems && Array.isArray(dbItems)) {
        dbItems.forEach((item: any) => {
          if (item.is_available !== undefined && item.is_available !== null) {
            cloudOverrides.availability[item.id] = item.is_available;
          }
          if (item.is_daily_special !== undefined && item.is_daily_special !== null) {
            cloudOverrides.dailySpecials[item.id] = item.is_daily_special;
          }
          if (item.price !== undefined && item.price !== null && typeof item.price === 'number') {
            cloudOverrides.prices[item.id] = item.price;
          }
        });
      }

      return res.status(200).json({
        success: true,
        overrides: cloudOverrides
      });
    } catch (err: any) {
      console.error('[API pizza-menu-sync GET] Error:', err);
      return res.status(200).json({ success: true, overrides: DEFAULT_OVERRIDES });
    }
  }

  if (req.method === 'POST') {
    try {
      let body: any = {};
      if (typeof req.body === 'string') {
        try { body = JSON.parse(req.body); } catch (_) {}
      } else if (req.body && typeof req.body === 'object') {
        body = req.body;
      }

      const { availability, dailySpecials, prices, updatedItem } = body;

      // Leggi overrides correnti
      let currentOverrides: PizzaMenuOverrides = { ...DEFAULT_OVERRIDES };
      try {
        const { data: storageData } = await supabase.storage
          .from('site-images')
          .download('pizza_menu_overrides.json');
        if (storageData) {
          const text = await storageData.text();
          currentOverrides = JSON.parse(text);
        }
      } catch (_) {}

      if (availability && typeof availability === 'object') {
        currentOverrides.availability = { ...currentOverrides.availability, ...availability };
      }
      if (dailySpecials && typeof dailySpecials === 'object') {
        currentOverrides.dailySpecials = { ...currentOverrides.dailySpecials, ...dailySpecials };
      }
      if (prices && typeof prices === 'object') {
        currentOverrides.prices = { ...currentOverrides.prices, ...prices };
      }
      currentOverrides.lastUpdated = new Date().toISOString();

      // Salva JSON in storage site-images con service_role (bypassa RLS)
      const jsonBuffer = Buffer.from(JSON.stringify(currentOverrides, null, 2), 'utf-8');
      await supabase.storage
        .from('site-images')
        .upload('pizza_menu_overrides.json', jsonBuffer, {
          contentType: 'application/json',
          cacheControl: '0',
          upsert: true
        });

      // Se fornito updatedItem o availability singola, salva anche su tabella pizza_menu_items
      if (updatedItem && updatedItem.id) {
        try {
          await supabase
            .from('pizza_menu_items')
            .upsert({
              id: updatedItem.id,
              name: updatedItem.name || 'Prodotto',
              category: updatedItem.category || 'menu',
              price: updatedItem.price ?? 0,
              is_available: updatedItem.is_available !== false,
              is_daily_special: !!updatedItem.is_daily_special,
              image: updatedItem.image || null,
              description: updatedItem.description || null
            }, { onConflict: 'id' });
        } catch (dbErr: any) {
          console.warn('[API pizza-menu-sync] Table upsert notice:', dbErr.message);
        }
      }

      return res.status(200).json({
        success: true,
        overrides: currentOverrides
      });
    } catch (err: any) {
      console.error('[API pizza-menu-sync POST] Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
