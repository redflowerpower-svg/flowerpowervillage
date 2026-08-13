import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseAdmin = (supabaseUrl && serviceRoleKey) ? createClient(supabaseUrl, serviceRoleKey) : (null as any);

/**
 * Helper per verificare se un product ID Octorate appartiene ai Fake Bungalows (1 & 2)
 */
export const isTestProduct = (id: number) =>
  (id >= 932243 && id <= 932268) ||
  id === 649669 ||
  id === 921799;

export const REAL_PRODUCT_IDS: Record<string, number> = {
  be: 529784,
  '7d': 529778,
  main_bnb_7d: 529788,
  main_bnb_14d: 529792,
  ac_7d: 529780,
  ac_14d: 529781,
  ac_bnb_7d: 916816,
  ac_bnb_14d: 529801,
  agoda_ac_7d: 921868,
  agoda_ac_14d: 921869,
  agd_ac_7d: 921868,
  agd_ac_14d: 921869,
  airbnb: 529783,
  airbnb_ac: 529813
};

export const TEST_PRODUCT_IDS: Record<string, number> = {
  be: 932243,
  '7d': 932244,
  main_bnb_7d: 932246,
  main_bnb_14d: 932247,
  ac_7d: 932248,
  ac_14d: 932249,
  agoda_ac_7d: 932250,
  agoda_ac_14d: 932251,
  agd_ac_7d: 932250,   // alias
  agd_ac_14d: 932251,  // alias
  airbnb: 932252,
  airbnb_ac: 932253,
  ac_bnb_7d: 932254,
  ac_bnb_14d: 932255
};

/**
 * Endpoint Serverless per l'aggiornamento bulk delle restrizioni dei rate plan su Octorate API.
 * Quando testOnly è true, seleziona l'ID corrispondente da TEST_PRODUCT_IDS ed applica
 * lo scudo di sicurezza che consente la scrittura ESCLUSIVAMENTE se l'ID appartiene ai Fake Bungalows (932243-932268).
 */
export async function handleUpdateRateplanRestrictionsBulk(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const testOnlyParam = req.body?.testOnly !== undefined ? req.body.testOnly : req.query?.testOnly;
  const testOnly = Boolean(testOnlyParam === true || testOnlyParam === 'true' || testOnlyParam === 1 || testOnlyParam === '1');

  const planKey = req.body?.planId || req.body?.ratePlanKey || req.body?.planKey || req.query?.planId;
  const activeProductIds = testOnly ? TEST_PRODUCT_IDS : REAL_PRODUCT_IDS;

  let rateId = req.body?.rateId || req.query?.rateId || req.query?.rate_id;
  if (!rateId && planKey) {
    rateId = activeProductIds[planKey];
  } else if (testOnly && planKey && activeProductIds[planKey]) {
    // In modalità TEST, rimappa planKey a TEST_PRODUCT_IDS
    rateId = activeProductIds[planKey];
  }

  const targetRateIdNum = Number(rateId || 0);

  // 🛡️ SCUDO DI SICUREZZA TEST ONLY:
  if (testOnly && !isTestProduct(targetRateIdNum)) {
    console.info(`[update-rateplan-restrictions-bulk] [TEST MODE] Scrittura ignorata in modo sicuro per rateId ${rateId} (alloggio reale non-test)`);
    return res.status(200).json({
      success: true,
      testOnly: true,
      skipped: true,
      rateId: String(rateId),
      message: `[TEST MODE] Scrittura ignorata in modo sicuro per rateId ${rateId} (modifica limitata ai Fake Bungalows 1 & 2)`
    });
  }

    const strategy = req.body?.strategy || req.query?.strategy;
    const stopSellParam = req.body?.stopSell !== undefined ? req.body.stopSell : req.query?.stopSell;
    const stopSell = Boolean(stopSellParam === true || stopSellParam === 'true' || stopSellParam === 1 || stopSellParam === '1' || strategy === 'stopsell');

    const todayStr = new Date().toISOString().slice(0, 10);
    const dateFrom = req.body?.dateFrom || req.query?.dateFrom || todayStr;
    const dateTo = req.body?.dateTo || req.query?.dateTo || dateFrom;

    if (!rateId) {
      return res.status(400).json({ error: 'il parametro rateId o planId è obbligatorio' });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Configurazione Supabase mancante' });
    }

    try {
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

      const motherBeIdFB1 = Number(TEST_PRODUCT_IDS.be || 932243);
      const motherBeIdFB2 = motherBeIdFB1 + 13; // 932256
      const motherBeIdReal = Number(REAL_PRODUCT_IDS.be || 529784);
      const roomsToUpdate = testOnly ? [motherBeIdFB1, motherBeIdFB2] : [motherBeIdReal];
      const onlyCheckoutDaysNum = Number(req.body?.onlyCheckoutDays || req.body?.onlyCheckOutDays || 0);

      const addDaysISO = (dateStr: string, days: number): string => {
        if (!dateStr || typeof dateStr !== 'string') return dateStr || '';
        try {
          const cleanDate = dateStr.slice(0, 10);
          const d = new Date(cleanDate + 'T00:00:00Z');
          if (isNaN(d.getTime())) return cleanDate;
          d.setUTCDate(d.getUTCDate() + days);
          return d.toISOString().slice(0, 10);
        } catch (e) {
          return dateStr;
        }
      };

      const isCta = strategy === 'failsafe_checkout' || req.body?.closedToArrival === true || req.body?.closedArrival === true;
      const bulkPayload: any[] = [];

      for (const roomId of roomsToUpdate) {
        if (strategy === 'stopsell' || stopSell) {
          // 🔴 STOP SELL: singolo oggetto con chiusura totale
          bulkPayload.push({
            room: roomId,
            dateFrom,
            dateTo,
            values: {
              stopSells: true,
              closed: true,
              closedArrival: true,
              closedDeparture: true
            }
          });
        } else {
          // 🟢 APERTURA STANDARD (da dateFrom a dateTo)
          bulkPayload.push({
            room: roomId,
            dateFrom,
            dateTo,
            values: {
              stopSells: false,
              closed: false,
              closedArrival: false,
              closedDeparture: false
            }
          });

          // 🟡 CUSCINETTO ONLY CHECK-OUT / CTA (da dateTo + 1 gg a dateTo + onlyCheckoutDays)
          if (onlyCheckoutDaysNum > 0) {
            const ctaFrom = addDaysISO(dateTo, 1);
            const ctaTo = addDaysISO(dateTo, onlyCheckoutDaysNum);
            bulkPayload.push({
              room: roomId,
              dateFrom: ctaFrom,
              dateTo: ctaTo,
              values: {
                stopSells: false,
                closed: false,
                closedArrival: true,
                closedDeparture: false
              }
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
          error: bulkJson.error || bulkJson.message || 'Aggiornamento restrizioni rifiutato da Octorate'
        });
      }

    // 🧹 Eliminazione cache Octorate dopo scrittura riuscita
    const cachePath = path.resolve(process.cwd(), 'scratch/octorate-cache.json');
    if (fs.existsSync(cachePath)) {
      try {
        fs.unlinkSync(cachePath);
        console.log('🧹 Cache Octorate eliminata con successo a seguito di una riscrittura.');
      } catch (err) {
        console.error('⚠️ Impossibile eliminare la cache:', err);
      }
    }

    return res.status(200).json({
      success: true,
      testOnly,
      rateId: String(targetRateIdNum),
      stopSell,
      dateFrom,
      dateTo,
      message: `Restrizione aggiornata con successo per rateId ${targetRateIdNum}`
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Errore interno server' });
  }
}
