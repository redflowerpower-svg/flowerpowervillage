import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseAdmin = (supabaseUrl && serviceRoleKey) ? createClient(supabaseUrl, serviceRoleKey) : (null as any);

/**
 * Endpoint Serverless per la verifica empirica di scrivibilità (Writability Sync) di una tariffa su Octorate API.
 * Esegue un test di scrittura temporaneo (toggle closedArrival) su una data futura +45 giorni e ripristina subito il valore originale.
 */
export async function handleVerifyWritability(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rateId = req.query.rateId || req.query.rate_id || req.body?.rateId;
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
      return res.status(400).json({ error: 'Nessun token di accesso Octorate disponibile nel database.' });
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

    // 2. Seleziona una data futura sicura (+45 giorni)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 45);
    const targetDate = futureDate.toISOString().slice(0, 10);

    // 3. Legge lo stato attuale dal calendario per quella data
    let currentClosedArrival = false;
    try {
      const getUrl = `https://api.octorate.com/connect/rest/v1/calendar?dateFrom=${targetDate}&dateTo=${targetDate}&room=${rateId}`;
      const getRes = await fetch(getUrl, { method: 'GET', headers });
      if (getRes.ok) {
        const calData = await getRes.json();
        if (Array.isArray(calData) && calData.length > 0) {
          currentClosedArrival = Boolean(calData[0].closeToArrival || calData[0].closedArrival);
        }
      }
    } catch (e) {
      // Ignora errore GET, fallback a false
    }

    const testValue = !currentClosedArrival;

    // 4. Test di Scrittura tramite POST /calendar/bulk
    const bulkUrl = 'https://api.octorate.com/connect/rest/v1/calendar/bulk';
    const testPayload = [
      {
        room: Number(rateId),
        dateFrom: targetDate,
        dateTo: targetDate,
        values: {
          closeToArrival: testValue
        }
      }
    ];

    const bulkRes = await fetch(bulkUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(testPayload)
    });

    const bulkText = await bulkRes.text();
    let isWritable = false;
    let message = '';

    if (bulkRes.ok) {
      try {
        const bulkJson = JSON.parse(bulkText);
        if (bulkJson.error || bulkJson.success === false) {
          isWritable = false;
          message = bulkJson.error || bulkJson.message || 'Scrittura rifiutata da Octorate';
        } else {
          isWritable = true;
          message = 'Scrittura accettata da Octorate';
        }
      } catch {
        isWritable = true;
        message = 'Scrittura accettata';
      }
    } else {
      isWritable = false;
      message = `HTTP ${bulkRes.status}: ${bulkText.slice(0, 100)}`;
    }

    // 5. Ripristina subito il valore originale sul PMS se il test è riuscito
    if (isWritable) {
      const restorePayload = [
        {
          room: Number(rateId),
          dateFrom: targetDate,
          dateTo: targetDate,
          values: {
            closeToArrival: currentClosedArrival
          }
        }
      ];
      try {
        await fetch(bulkUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(restorePayload)
        });
      } catch (restoreErr) {
        console.warn('[verify-writability] Ripristino valore originale fallito:', restoreErr);
      }
    }

    return res.status(200).json({
      rateId: String(rateId),
      isWritable,
      message,
      testedDate: targetDate
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Errore interno server' });
  }
}
