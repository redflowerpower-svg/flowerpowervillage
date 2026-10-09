import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, serviceRoleKey);
}

export async function handlePromoCodes(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const supabase = getSupabaseAdmin();
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (_) {}
  }

  const action = req.query.action || body?.action || "";
  const type = req.query.type || body?.type || (String(action).includes("pizza") ? "pizza" : "resort");

  const isPizza = type === "pizza" || String(action).includes("pizza");
  const fileName = isPizza ? "pizza_promo_codes.json" : "resort_promo_codes.json";

  // GET: Fetch promo codes from Supabase Storage CDN
  if (req.method === "GET") {
    try {
      const { data, error } = await supabase.storage
        .from("site-images")
        .download(fileName);

      if (error || !data) {
        return res.status(200).json({ success: true, codes: [], message: "No cloud promo codes found" });
      }

      const text = await data.text();
      const parsed = JSON.parse(text);
      return res.status(200).json({ success: true, codes: Array.isArray(parsed) ? parsed : [] });
    } catch (err: any) {
      console.warn(`[PromoCodes API] GET ${fileName} error:`, err.message);
      return res.status(200).json({ success: true, codes: [], error: err.message });
    }
  }

  // POST: Save promo codes to Supabase Storage CDN with service_role key
  if (req.method === "POST") {
    try {
      const promoCodes = body?.promoCodes || body?.codes || (Array.isArray(body) ? body : null);
      if (!Array.isArray(promoCodes)) {
        return res.status(400).json({ success: false, error: "Invalid payload: promoCodes array required" });
      }

      const jsonBuffer = Buffer.from(JSON.stringify(promoCodes, null, 2), "utf8");
      const { error: uploadError } = await supabase.storage
        .from("site-images")
        .upload(fileName, jsonBuffer, {
          contentType: "application/json",
          cacheControl: "0",
          upsert: true
        });

      if (uploadError) {
        console.error(`[PromoCodes API] Save ${fileName} error:`, uploadError);
        return res.status(500).json({ success: false, error: uploadError.message });
      }

      return res.status(200).json({
        success: true,
        fileName,
        count: promoCodes.length,
        savedAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error(`[PromoCodes API] POST ${fileName} exception:`, err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
