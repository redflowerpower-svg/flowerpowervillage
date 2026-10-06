import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null as any;

export async function handlePizzaOrderSubmit(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { order, existingOrderId } = req.body || {};
  if (!order || !order.items) {
    return res.status(400).json({ error: "Order payload is required" });
  }

  if (!supabase) {
    return res.status(500).json({ error: "Supabase client not initialized" });
  }

  try {
    const payload: any = {
      customer_name: String(order.customer_name || 'Cliente Tavolo'),
      phone: String(order.phone || '+66 Dining Table'),
      address: String(order.address || ''),
      items: Array.isArray(order.items) ? order.items : [],
      total: Number(order.total) || 0,
      payment_method: String(order.payment_method || 'cash_at_table'),
      status: 'new', // Always reset to new so KDS receives it in incoming column
      has_whatsapp: Boolean(order.has_whatsapp),
      has_line: Boolean(order.has_line),
      created_at: new Date().toISOString()
    };

    let resultOrder: any = null;

    if (existingOrderId) {
      // UPDATE EXISTING TABLE ORDER (Bypassing RLS with service_role)
      const { data: updated, error: updateError } = await supabase
        .from('pizza_orders')
        .update(payload)
        .eq('id', existingOrderId)
        .select('*')
        .single();

      if (updateError) {
        console.warn('[Order Submit API Update Error]:', updateError);
        // Fallback to fresh insert if update fails
        const { data: inserted, error: insertError } = await supabase
          .from('pizza_orders')
          .insert([payload])
          .select('*')
          .single();
        if (insertError) throw insertError;
        resultOrder = inserted;
      } else {
        resultOrder = updated;
      }
    } else {
      // FRESH INSERT
      const { data: inserted, error: insertError } = await supabase
        .from('pizza_orders')
        .insert([payload])
        .select('*')
        .single();

      if (insertError) {
        console.error('[Order Submit API Insert Error]:', insertError);
        return res.status(500).json({ error: insertError.message, details: insertError });
      }
      resultOrder = inserted;
    }

    return res.status(200).json({ success: true, order: resultOrder });
  } catch (err: any) {
    console.error('[Order Submit API Exception]:', err);
    return res.status(500).json({ error: "Internal server error", message: err.message });
  }
}
