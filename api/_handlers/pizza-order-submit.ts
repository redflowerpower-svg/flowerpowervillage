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
    const addressStr = String(order.address || '');
    const payload: any = {
      customer_name: String(order.customer_name || 'Cliente Tavolo'),
      phone: String(order.phone || '+66 Dining Table'),
      address: addressStr,
      items: Array.isArray(order.items) ? order.items : [],
      total: Number(order.total) || 0,
      payment_method: String(order.payment_method || 'cash_at_table'),
      status: 'new', // Always reset to new so KDS receives it in incoming column
      has_whatsapp: Boolean(order.has_whatsapp),
      has_line: Boolean(order.has_line),
      created_at: new Date().toISOString()
    };

    let targetOrderId = existingOrderId ? String(existingOrderId) : null;

    // Server-side safety net: check if an active table session is already open
    if (!targetOrderId && (addressStr.includes('[DINE-IN:') || addressStr.toLowerCase().includes('tavolo'))) {
      const match = addressStr.match(/\[DINE-IN:\s*([^\]]+)\]/i);
      const rawTable = match ? match[1].trim() : '';
      if (rawTable) {
        const { data: openOrders } = await supabase
          .from('pizza_orders')
          .select('id, address')
          .neq('status', 'completed')
          .neq('status', 'cancelled')
          .neq('status', 'rejected')
          .neq('status', 'settled')
          .order('created_at', { ascending: false });

        if (openOrders && openOrders.length > 0) {
          const found = openOrders.find((o: any) => {
            const addr = String(o.address || '').toLowerCase();
            return addr.includes(`[dine-in: ${rawTable.toLowerCase()}]`) || addr.includes(rawTable.toLowerCase());
          });
          if (found) {
            targetOrderId = String(found.id);
          }
        }
      }
    }

    let resultOrder: any = null;

    if (targetOrderId) {
      // UPDATE EXISTING TABLE ORDER (Replaces items with cumulative list, updates total and timestamps)
      const { data: updated, error: updateError } = await supabase
        .from('pizza_orders')
        .update(payload)
        .eq('id', targetOrderId)
        .select('*')
        .single();

      if (updateError) {
        console.warn('[Order Submit API Update Error]:', updateError);
        // Fallback to insert only if update fails completely
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
      // FRESH INSERT FOR NEW TABLE
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
