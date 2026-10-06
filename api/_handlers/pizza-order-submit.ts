import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null as any;

export async function handlePizzaOrderSubmit(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { order } = req.body || {};
  if (!order || !order.items) {
    return res.status(400).json({ error: "Order payload is required" });
  }

  if (!supabase) {
    return res.status(500).json({ error: "Supabase client not initialized" });
  }

  try {
    const payload = {
      customer_name: String(order.customer_name || 'Cliente Tavolo'),
      phone: String(order.phone || '+66 Dining Table'),
      address: String(order.address || ''),
      items: Array.isArray(order.items) ? order.items : [],
      total: Number(order.total) || 0,
      payment_method: String(order.payment_method || 'cash_at_table'),
      status: String(order.status || 'new'),
      has_whatsapp: Boolean(order.has_whatsapp),
      has_line: Boolean(order.has_line),
      created_at: order.created_at || new Date().toISOString()
    };

    const { data: inserted, error } = await supabase
      .from('pizza_orders')
      .insert([payload])
      .select('*')
      .single();

    if (error) {
      console.error('[Order Submit API Error]:', error);
      return res.status(500).json({ error: error.message, details: error });
    }

    return res.status(200).json({ success: true, order: inserted });
  } catch (err: any) {
    console.error('[Order Submit API Exception]:', err);
    return res.status(500).json({ error: "Internal server error", message: err.message });
  }
}
