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

// Rate ID Reali per tutti i 18 alloggi (194 prodotti Octorate totali)
export const REAL_PRODUCTS_BY_PLAN: Record<string, number[]> = {
  be: [495980, 529784, 449684, 449678, 449422, 449699, 449724, 449348, 449730, 495807, 449736, 495566, 449742, 449385, 449668, 449675, 449674],
  '7d': [916110, 495976, 872182, 529778, 422300, 422296, 422293, 422422, 422445, 495803, 422325, 495549, 422213, 422351, 422131, 422265, 422402, 422149],
  main_bnb_7d: [916109, 529788, 496002, 496001, 495575, 421520, 332066, 332084, 332077, 332739, 332735, 332746, 332105, 332763, 332757, 332767, 332054, 332029],
  main_bnb_14d: [916107, 496010, 529792, 496009, 495580, 332055, 332070, 332081, 332089, 332737, 332741, 332743, 332109, 332759, 332769, 332765, 421516, 332030],
  ac_7d: [916114, 495978, 529780, 495552, 495805, 421522, 340367, 331921, 330964, 331923, 331970, 331972, 331966, 331968, 331974, 331976],
  ac_14d: [495979, 529781, 916105, 422157, 421527, 495806, 495565, 421998, 331922, 331924, 330970, 331969, 331971, 331967, 331977, 331973],
  ac_bnb_7d: [496022, 496021, 916818, 916816, 916840, 916829, 495587, 332057, 421525, 332072, 332121, 332123, 332119, 332129, 332125, 332035],
  ac_bnb_14d: [496031, 496030, 916402, 916838, 916830, 529801, 421530, 495593, 332060, 332074, 332138, 332140, 332134, 332136, 332142, 332036],
  agd_ac_7d: [921874, 921872, 921870, 921868],
  agoda_ac_7d: [921874, 921872, 921870, 921868],
  agd_ac_14d: [921873, 921871, 921869],
  agoda_ac_14d: [921873, 921871, 921869],
  airbnb: [529783, 495982, 916103, 421532, 495810, 495569, 297025, 297027, 297028, 297021, 297022, 297023, 297024, 297033, 297029, 297030, 297031, 297032],
  airbnb_ac: [529813, 496057, 496056, 916104, 421533, 495609, 422147, 340196, 340198, 340200, 421507, 421508, 421505, 421506, 421509, 421510]
};

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

export const TEST_PRODUCTS_BY_PLAN: Record<string, number[]> = {
  be: [932243, 932256],
  '7d': [932244, 932257],
  main_bnb_7d: [932246, 932259],
  main_bnb_14d: [932247, 932260],
  ac_7d: [932248, 932261],
  ac_14d: [932249, 932262],
  agoda_ac_7d: [932250, 932263],
  agoda_ac_14d: [932251, 932264],
  agd_ac_7d: [932250, 932263],
  agd_ac_14d: [932251, 932264],
  airbnb: [932252, 932265],
  airbnb_ac: [932253, 932266],
  ac_bnb_7d: [932254, 932267],
  ac_bnb_14d: [932255, 932268]
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

export const MOTHER_ACCOMMODATION_IDS = {
  test: [649669, 921799],
  real: [883795, 529773, 495796, 495795, 494840, 421511, 293965, 293945, 293948, 293942, 293943, 293954, 293955, 293951, 293962, 293963, 293957, 293959]
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

      const rateIdFB1 = Number(targetRateIdNum || (planKey ? TEST_PRODUCT_IDS[planKey] : 0));
      const rateIdFB2 = rateIdFB1 + 13;
      const rateIdReal = Number(targetRateIdNum || (planKey ? REAL_PRODUCT_IDS[planKey] : 0));
      const roomsToUpdate = testOnly
        ? (planKey && TEST_PRODUCTS_BY_PLAN[planKey] ? TEST_PRODUCTS_BY_PLAN[planKey] : [rateIdFB1, rateIdFB2])
        : (planKey && REAL_PRODUCTS_BY_PLAN[planKey] ? REAL_PRODUCTS_BY_PLAN[planKey] : (targetRateIdNum ? [targetRateIdNum] : [rateIdReal]));
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

      const resetPreferences = req.body?.resetPreferences || {
        stopSells: true,
        closed: true,
        closedArrival: true,
        closedDeparture: true
      };

      const resetValues: any = {};
      if (resetPreferences.stopSells) resetValues.stopSells = false;
      if (resetPreferences.closed) resetValues.closed = false;
      if (resetPreferences.closedArrival) resetValues.closedArrival = false;
      if (resetPreferences.closedDeparture) resetValues.closedDeparture = false;

      const hasResetKeys = Object.keys(resetValues).length > 0;

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
          // 🧹 FASE 0: Tabula Rasa di reset stagionale selettivo (01/10/2026 - 31/10/2027) solo se apertura
          if (hasResetKeys) {
            bulkPayload.push({
              room: roomId,
              dateFrom: '2026-10-01',
              dateTo: '2027-10-31',
              values: resetValues
            });
          }

          // 🟢 1. APERTURA STANDARD (da dateFrom a dateTo)
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

          // 🟡 2. CUSCINETTO ONLY CHECK-OUT / CTA (da dateTo + 1 giorno a dateTo + onlyCheckoutDays)
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

          // 🔴 3. BLOCCO STOP SELL (CHIUSO) SUCCESSIVO
          // Parte tassativamente da (dateTo + onlyCheckoutDays + 1 giorno) fino al giorno precedente all'inizio del periodo programmato successivo (o a fine stagione)
          const nextPeriodDateFrom = req.body?.nextPeriodDateFrom || req.body?.nextDateFrom || req.query?.nextPeriodDateFrom || null;
          const seasonEnd = req.body?.seasonEnd || req.query?.seasonEnd || '2027-10-31';

          const stopSellFrom = onlyCheckoutDaysNum > 0
            ? addDaysISO(dateTo, onlyCheckoutDaysNum + 1)
            : addDaysISO(dateTo, 1);

          const stopSellTo = nextPeriodDateFrom
            ? addDaysISO(String(nextPeriodDateFrom), -1)
            : String(seasonEnd);

          if (stopSellFrom <= stopSellTo) {
            bulkPayload.push({
              room: roomId,
              dateFrom: stopSellFrom,
              dateTo: stopSellTo,
              values: {
                stopSells: true,
                closed: true,
                closedArrival: true,
                closedDeparture: true
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
