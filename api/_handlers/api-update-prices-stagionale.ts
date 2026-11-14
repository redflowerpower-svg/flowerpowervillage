import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import {
  computeStandbyKeepAlivePrice,
  getActiveJungleSource,
  getCompanionRateId,
  getJungleTwinPairByRateId,
  isLowSeasonKeepAliveDate
} from "../_helpers/octorate-jungle-mirror.js";

function splitRangeWithKeepAlive(
  room: number,
  dateFrom: string,
  dateTo: string,
  basePrice: number,
  key: 'jv' | 'jvl' | 'jvr' | 'pl'
): Array<{ room: number; dateFrom: string; dateTo: string; values: { price: number } }> {
  const blocks: Array<{ room: number; dateFrom: string; dateTo: string; values: { price: number } }> = [];
  const start = new Date(dateFrom + 'T00:00:00Z');
  const end = new Date(dateTo + 'T00:00:00Z');
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return [{ room, dateFrom, dateTo, values: { price: basePrice } }];
  }

  let curFrom = '';
  let curTo = '';
  let curPrice = -1;

  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    const p = isLowSeasonKeepAliveDate(iso)
      ? computeStandbyKeepAlivePrice(basePrice, key)
      : basePrice;
    if (!curFrom) {
      curFrom = iso;
      curTo = iso;
      curPrice = p;
    } else if (p === curPrice) {
      curTo = iso;
    } else {
      blocks.push({ room, dateFrom: curFrom, dateTo: curTo, values: { price: curPrice } });
      curFrom = iso;
      curTo = iso;
      curPrice = p;
    }
  }
  if (curFrom) {
    blocks.push({ room, dateFrom: curFrom, dateTo: curTo, values: { price: curPrice } });
  }
  return blocks;
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseAdmin = (supabaseUrl && serviceRoleKey) ? createClient(supabaseUrl, serviceRoleKey) : (null as any);

export const FAKE_BUNGALOW_MOTHER_IDS = [649669, 921799];

/**
 * Normalizza e formatta qualsiasi stringa data (in formato DD/MM/YYYY, DD/MM, o YYYY-MM-DD)
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
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {}
    }
    const { periodUpdates, testMode, testOnly, updates } = body || {};
    const isTest = testMode === true || testOnly === true;
    const updatesList = (Array.isArray(periodUpdates) && periodUpdates.length > 0) ? periodUpdates : (Array.isArray(updates) ? updates : []);

    if (!updatesList || !Array.isArray(updatesList) || updatesList.length === 0) {
      return res.status(400).json({ error: 'Nessun aggiornamento fornito nel payload' });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Configurazione Supabase mancante' });
    }

    // SCUDO DI PROTEZIONE: In modalità test, filtra tassativamente SOLO i Fake Bungalow (649669 e 921799)
    let filteredUpdates = updatesList;
    if (isTest) {
      filteredUpdates = updatesList.filter((item: any) => 
        FAKE_BUNGALOW_MOTHER_IDS.includes(Number(item.roomMotherId || item.room || item.motherRateId))
      );

      if (filteredUpdates.length === 0) {
        return res.status(200).json({
          success: true,
          testMode: true,
          updatedCount: 0,
          message: 'Scudo di test attivo: nessun alloggio Fake Bungalow presente negli aggiornamenti (scritture reali bloccate).'
        });
      }
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

    const activeJungleSource = await getActiveJungleSource(supabaseAdmin);

    // 2. Formattazione e Risoluzione Date per il Bulk Payload (Octorate Golden Rule: Tariffa Madre Livello 0)
    // Specchia automaticamente anche sulla Tariffa Madre gemella rispettando la Regola Standby Asimmetrica
    const bulkPayload: Array<{ room: number; dateFrom: string; dateTo: string; values: { price: number } }> = [];
    for (const item of filteredUpdates) {
      const dateFromFormatted = normalizeDateToYYYYMMDD(item.dateFrom, false);
      const dateToFormatted = normalizeDateToYYYYMMDD(item.dateTo, true, dateFromFormatted);
      const primaryRoom = Number(item.roomMotherId || item.room);
      const priceVal = Number(item.price);

      bulkPayload.push({
        room: primaryRoom,
        dateFrom: dateFromFormatted,
        dateTo: dateToFormatted,
        values: { price: priceVal }
      });

      const companionId = getCompanionRateId(primaryRoom);
      if (companionId) {
        const companionPair = getJungleTwinPairByRateId(companionId);
        if (activeJungleSource === '366879' && companionPair && companionPair.jungleId === companionId) {
          bulkPayload.push(
            ...splitRangeWithKeepAlive(companionId, dateFromFormatted, dateToFormatted, priceVal, companionPair.key)
          );
        } else {
          bulkPayload.push({
            room: companionId,
            dateFrom: dateFromFormatted,
            dateTo: dateToFormatted,
            values: { price: priceVal }
          });
        }
      }
    }

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
      testMode: isTest,
      updatedCount: bulkPayload.length,
      result: resultData
    });
  } catch (error: any) {
    console.error('Errore update-prices-stagionale handler:', error);
    return res.status(500).json({ error: error?.message || 'Errore interno durante aggiornamento prezzi stagionali' });
  }
}
