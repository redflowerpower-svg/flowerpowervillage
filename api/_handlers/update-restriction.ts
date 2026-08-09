import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseAdmin = (supabaseUrl && serviceRoleKey) ? createClient(supabaseUrl, serviceRoleKey) : (null as any);

/**
 * Endpoint Serverless per aggiornare direttamente la restrizione Stop Sell di una tariffa su Octorate API.
 */
export async function handleUpdateRestriction(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rateId = req.query.rateId || req.query.rate_id || req.body?.rateId;
  const stopSellParam = req.body?.stopSell !== undefined ? req.body.stopSell : req.query.stopSell;
  const stopSell = Boolean(stopSellParam === true || stopSellParam === 'true' || stopSellParam === 1 || stopSellParam === '1');

  const todayStr = new Date().toISOString().slice(0, 10);
  const dateFrom = req.body?.dateFrom || req.query.dateFrom || todayStr;
  const dateTo = req.body?.dateTo || req.query.dateTo || dateFrom;

  if (!rateId) {
    return res.status(400).json({ error: 'il parametro rateId è obbligatorio' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Configurazione Supabase mancante' });
  }

  try {
    // 1. Recupero token OAuth da Supabase
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('octorate_tokens')
      .select('access_token')
      .eq('id', 'singleton')
      .maybeSingle();

    if (tokenError || !tokenData?.access_token) {
      return res.status(400).json({ error: 'Nessun token Octorate disponibile nel database.' });
    }

    const accessToken = tokenData.access_token;
    const clientId = process.env.VITE_OCTORATE_CLIENT_ID || process.env.OCTORATE_CLIENT_ID || '';

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (clientId) {
      headers['Octorate-Api-Key'] = clientId;
    }

    // 2. Invia richiesta POST /calendar/bulk a Octorate API
    const bulkUrl = 'https://api.octorate.com/connect/rest/v1/calendar/bulk';
    const bulkPayload = [
      {
        room: Number(rateId),
        dateFrom,
        dateTo,
        values: {
          stopSells: stopSell
        }
      }
    ];

    const bulkRes = await fetch(bulkUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(bulkPayload)
    });

    const bulkText = await bulkRes.text();

    if (!bulkRes.ok) {
      return res.status(bulkRes.status).json({
        error: `Octorate API call failed: ${bulkText.slice(0, 150)}`
      });
    }

    let bulkJson = null;
    try {
      bulkJson = JSON.parse(bulkText);
    } catch (e) {
      // Ok if empty response
    }

    if (bulkJson && (bulkJson.error || bulkJson.success === false)) {
      return res.status(400).json({
        error: bulkJson.error || bulkJson.message || 'Aggiornamento Stop Sell rifiutato da Octorate'
      });
    }

    return res.status(200).json({
      success: true,
      rateId: String(rateId),
      stopSell,
      dateFrom,
      dateTo,
      message: `Stop Sell impostato a ${stopSell ? 'ATTIVO (Chiuso)' : 'DISATTIVATO (Aperto)'}`
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Errore interno server' });
  }
}
