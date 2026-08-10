import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseAdmin = (supabaseUrl && serviceRoleKey) ? createClient(supabaseUrl, serviceRoleKey) : (null as any);

/**
 * Normalizza e formatta qualsiasi stringa data (in formato italiano DD/MM/YYYY, DD/MM, o YYYY-MM-DD)
 * risolvendo programmaticamente il cavallo d'anno (es. 21/12 -> 15/01).
 */
export function normalizeDateToYYYYMMDD(rawDateStr: string, isEndDate: boolean = false, startDateStr?: string): string {
  if (!rawDateStr || typeof rawDateStr !== 'string') {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  }

  const trimmed = rawDateStr.trim();
  const currentYear = new Date().getFullYear();

  // Caso YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Caso DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split('/').map(Number);
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  // Caso DD/MM (senza anno esplicito)
  if (/^\d{1,2}\/\d{1,2}$/.test(trimmed)) {
    const [d, m] = trimmed.split('/').map(Number);
    let targetYear = currentYear;

    if (isEndDate && startDateStr) {
      const normalizedStart = normalizeDateToYYYYMMDD(startDateStr, false);
      const [startY, startM] = normalizedStart.split('-').map(Number);
      targetYear = startY;
      // Se il mese di fine è inferiore al mese di inizio (es. inizio Dicembre -> fine Gennaio), incrementa l'anno di fine
      if (m < startM) {
        targetYear = startY + 1;
      }
    }
    return `${targetYear}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  return trimmed;
}

export async function handleUpdatePricesStagionale(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { periodUpdates } = req.body || {};

    if (!periodUpdates || !Array.isArray(periodUpdates) || periodUpdates.length === 0) {
      return res.status(400).json({ error: 'Nessun aggiornamento fornito nel payload' });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Configurazione Supabase mancante' });
    }

    // 1. Estrazione del Token Singleton Octorate da Supabase
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('octorate_tokens')
      .select('access_token')
      .eq('id', 'singleton')
      .maybeSingle();

    if (tokenError || !tokenData?.access_token) {
      return res.status(400).json({ error: 'Nessun token Octorate disponibile nel database. Effettua la riconnessione OAuth.' });
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

    // 2. Formattazione e Risoluzione Date per il Bulk Payload (Octorate Golden Rule: Tariffa Madre Livello 0)
    const bulkPayload = periodUpdates.map((item: any) => {
      const dateFromFormatted = normalizeDateToYYYYMMDD(item.dateFrom, false);
      const dateToFormatted = normalizeDateToYYYYMMDD(item.dateTo, true, dateFromFormatted);

      return {
        room: Number(item.roomMotherId),
        dateFrom: dateFromFormatted,
        dateTo: dateToFormatted,
        values: {
          price: Number(item.price)
        }
      };
    });

    const bulkUrl = 'https://api.octorate.com/connect/rest/v1/calendar/bulk';
    const bulkRes = await fetch(bulkUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(bulkPayload)
    });

    if (!bulkRes.ok) {
      const errText = await bulkRes.text();
      return res.status(bulkRes.status).json({
        error: `Errore Octorate API Bulk (${bulkRes.status}): ${errText}`
      });
    }

    const resultData = await bulkRes.json().catch(() => ({ success: true }));

    return res.status(200).json({
      success: true,
      updatedCount: bulkPayload.length,
      result: resultData
    });
  } catch (error: any) {
    console.error('Errore update-prices-stagionale handler:', error);
    return res.status(500).json({ error: error?.message || 'Errore interno durante aggiornamento prezzi stagionali' });
  }
}
