import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://gjqevgkbjkharczhikcl.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

export async function handleUpdateAccommodationFeatures(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { id, details } = body || {};

    if (!id || !details) {
      return res.status(400).json({ error: "Parametri mancanti: 'id' e 'details' sono obbligatori." });
    }

    if (!supabaseAdmin) {
      console.error('[API update-accommodation-features] Missing SUPABASE_SERVICE_ROLE_KEY');
      return res.status(500).json({ error: "Credenziali server Supabase Service Role non configurate." });
    }

    const { data, error } = await supabaseAdmin
      .from('accommodations')
      .update({ details })
      .eq('id', id)
      .select();

    if (error) {
      console.error('[API update-accommodation-features] DB Error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      console.error('[API update-accommodation-features] No row matched ID:', id);
      return res.status(404).json({ error: `Nessun alloggio trovato con ID '${id}' nel DB.` });
    }

    return res.status(200).json({ success: true, count: data.length, data: data[0] });
  } catch (err: any) {
    console.error('[API update-accommodation-features] Exception:', err);
    return res.status(500).json({ error: err?.message || "Errore del server durante l'aggiornamento." });
  }
}
