import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseAdmin = (supabaseUrl && serviceRoleKey) ? createClient(supabaseUrl, serviceRoleKey) : (null as any);

const isStopSell = (day: any): boolean => Boolean(
  day?.stopSell === true || day?.stopSell === 'true' ||
  day?.stopSells === true || day?.stopSells === 'true' ||
  day?.stop_sell === true || day?.closed === true || day?.closed === 'true' || day?.closed === 1
);

const isCloseToArrival = (day: any): boolean => Boolean(
  day?.closeToArrival === true || day?.closeToArrival === 'true' || day?.closeToArrival === 1 ||
  day?.closedArrival === true || day?.closedArrival === 'true' || day?.closed_to_arrival === true ||
  day?.closedArrival === 1 || day?.cta === true
);

export function groupDailyRestrictions(days: any[], ratePlanKey: string = 'rate') {
  if (!days || days.length === 0) return [];
  const rawPeriods: any[] = [];
  const n = days.length;
  let i = 0;
  let idCounter = 1;

  while (i < n) {
    const currentDay = days[i];
    const dateFrom = String(currentDay?.date || currentDay?.dateStr || currentDay?.day || '').substring(0, 10);
    const stopSellState = isStopSell(currentDay);
    const ctaState = isCloseToArrival(currentDay);

    let j = i + 1;
    let dateTo = dateFrom;

    // Raggruppa i giorni consecutivi con lo stesso identico stato di restrizione
    while (j < n) {
      const nextDay = days[j];
      const nextStopSell = isStopSell(nextDay);
      const nextCta = isCloseToArrival(nextDay);

      if (nextStopSell !== stopSellState || nextCta !== ctaState) {
        break;
      }
      dateTo = String(nextDay?.date || nextDay?.dateStr || nextDay?.day || '').substring(0, 10);
      j++;
    }

    const daySpanCount = j - i;

    rawPeriods.push({
      id: `${ratePlanKey}_live_p${idCounter++}`,
      dateFrom,
      dateTo,
      stopSell: stopSellState,
      closedToArrival: ctaState,
      closedToDeparture: stopSellState,
      onlyCheckoutDays: ctaState ? daySpanCount : 0,
      onlyCheckOutDays: ctaState ? daySpanCount : 0,
      strategy: stopSellState ? 'stopsell' : (ctaState ? 'failsafe_checkout' : 'open')
    });

    i = j;
  }

  // Riconcilia i blocchi di Apertura seguiti da Only Check-out nel modello a periodi con cuscinetto:
  // L'Apertura acquisisce onlyCheckoutDays = durata del blocco CTA adiacente
  const mergedPeriods: any[] = [];
  for (let k = 0; k < rawPeriods.length; k++) {
    const curr = rawPeriods[k];
    const next = rawPeriods[k + 1];

    if (curr.strategy === 'open' && next && next.strategy === 'failsafe_checkout') {
      mergedPeriods.push({
        ...curr,
        name: 'Apertura Standard (OK)',
        onlyCheckoutDays: next.onlyCheckoutDays,
        onlyCheckOutDays: next.onlyCheckoutDays,
        failsafeCheckout: true
      });
      k++; // salta il blocco CTA poiché è stato incorporato come cuscinetto
    } else if (curr.strategy === 'failsafe_checkout') {
      mergedPeriods.push({
        ...curr,
        name: `Only Check-out (${curr.onlyCheckoutDays}gg)`,
        isFailsafeCheckout: true
      });
    } else if (curr.strategy === 'stopsell') {
      mergedPeriods.push({
        ...curr,
        name: 'Stop Sell (Chiuso)'
      });
    } else {
      mergedPeriods.push({
        ...curr,
        name: 'Apertura Standard (OK)'
      });
    }
  }

  return mergedPeriods;
}

export function groupDailyMinStay(days: any[]) {
  if (!days || days.length === 0) return [];
  const rawPeriods: any[] = [];
  const n = days.length;
  let i = 0;
  let idCounter = 1;

  while (i < n) {
    const currentDay = days[i];
    const dateFrom = String(currentDay?.date || currentDay?.dateStr || currentDay?.day || '').substring(0, 10);
    const minStay = Number(currentDay?.minStay ?? currentDay?.minstay ?? currentDay?.minNights ?? 1);

    let j = i + 1;
    let dateTo = dateFrom;

    while (j < n) {
      const nextDay = days[j];
      const nextMinStay = Number(nextDay?.minStay ?? nextDay?.minstay ?? nextDay?.minNights ?? 1);
      if (nextMinStay !== minStay) {
        break;
      }
      dateTo = String(nextDay?.date || nextDay?.dateStr || nextDay?.day || '').substring(0, 10);
      j++;
    }

    rawPeriods.push({
      id: `live_minstay_p${idCounter++}`,
      name: `Soggiorno Minimo ${minStay} Notti`,
      dateFrom,
      dateTo,
      minStay
    });

    i = j;
  }

  return rawPeriods;
}

// Rate ID Reali per la visualizzazione Live (include tariffe e madri per estrazione MinStay)
export const REAL_PRODUCT_IDS: Record<string, number[]> = {
  be: [495980, 529784, 449684, 449678, 449422, 449699, 449724, 449348, 449730, 495807, 449736, 495566, 449742, 449385, 449668, 449675, 449674, 529773, 495795, 495796, 494840, 421511, 293957, 293954, 293962, 293965, 293955, 293942, 293963, 293959, 293948, 293945, 293943, 293951, 883795],
  '7d': [916110, 495976, 872182, 529778, 422300, 422296, 422293, 422422, 422445, 495803, 422325, 495549, 422213, 422351, 422131, 422265, 422402, 422149],
  main_bnb_7d: [916109, 529788, 496002, 496001, 495575, 421520, 332066, 332084, 332077, 332739, 332735, 332746, 332105, 332763, 332757, 332767, 332054, 332029],
  main_bnb_14d: [916107, 496010, 529792, 496009, 495580, 332055, 332070, 332081, 332089, 332737, 332741, 332743, 332109, 332759, 332769, 332765, 421516, 332030],
  ac_7d: [916114, 495978, 529780, 495552, 495805, 421522, 340367, 331921, 330964, 331923, 331970, 331972, 331966, 331968, 331974, 331976],
  ac_14d: [495979, 529781, 916105, 422157, 421527, 495806, 495565, 421998, 331922, 331924, 330970, 331969, 331971, 331967, 331977, 331973],
  ac_bnb_7d: [496022, 496021, 916818, 916816, 916840, 916829, 495587, 332057, 421525, 332072, 332121, 332123, 332119, 332129, 332125, 332035],
  ac_bnb_14d: [496031, 496030, 916402, 916838, 916830, 529801, 421530, 495593, 332060, 332074, 332138, 332140, 332134, 332136, 332142, 332036],
  agoda_ac_7d: [921874, 921872, 921870, 921868],
  agoda_ac_14d: [921873, 921871, 921869],
  agd_ac_7d: [921874, 921872, 921870, 921868],
  agd_ac_14d: [921873, 921871, 921869],
  airbnb: [529783, 495982, 916103, 421532, 495810, 495569, 297025, 297027, 297028, 297021, 297022, 297023, 297024, 297033, 297029, 297030, 297031, 297032],
  airbnb_ac: [529813, 496057, 496056, 916104, 421533, 495609, 422147, 340196, 340198, 340200, 421507, 421508, 421505, 421506, 421509, 421510]
};

// Rate ID di Test per i Fake Bungalows 1 & 2 — Mappatura Definitiva Confermata da Probe
// FB1: 932243-932255 | FB2: FB1+13 (shift = +13) | Madri: 649669, 921799
export const TEST_PRODUCT_IDS: Record<string, number[]> = {
  be:           [932243, 932256, 649669, 921799],
  '7d':         [932244, 932257],
  main_bnb_7d:  [932246, 932259],
  main_bnb_14d: [932247, 932260],
  ac_7d:        [932248, 932261],
  ac_14d:       [932249, 932262],
  agoda_ac_7d:  [932250, 932263],
  agoda_ac_14d: [932251, 932264],
  agd_ac_7d:    [932250, 932263], // alias agoda
  agd_ac_14d:   [932251, 932264], // alias agoda
  airbnb:       [932252, 932265],
  airbnb_ac:    [932253, 932266],
  ac_bnb_7d:    [932254, 932267],
  ac_bnb_14d:   [932255, 932268]
};

export async function handleOctorateRestrictionsGrid(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Configurazione Supabase mancante' });
  }

  try {
    const testOnly = req.query.testOnly === 'true' || req.body?.testOnly === true || req.body?.testOnly === 'true';

    // 1. Recupero token OAuth da Supabase con retry resiliente
    let tokenData: any = null;
    let tokenError: any = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const tRes = await supabaseAdmin
        .from('octorate_tokens')
        .select('access_token, refresh_token')
        .eq('id', 'singleton')
        .maybeSingle();
      tokenData = tRes.data;
      tokenError = tRes.error;
      if (tokenData?.access_token) break;
      if (attempt < 3) await new Promise(r => setTimeout(r, 200));
    }

    if (tokenError || !tokenData?.access_token) {
      return res.status(401).json({ error: 'Token OAuth Octorate non presente o invalido' });
    }

    let accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const structureId = process.env.VITE_OCTORATE_STRUCTURE_ID || process.env.OCTORATE_STRUCTURE_ID || '366879';

    // Intervallo stagionale completo (01/10/2026 - 31/10/2027)
    const dateFrom = (req.query?.dateFrom as string) || (req.body?.dateFrom as string) || '2026-10-01';
    const dateTo = (req.query?.dateTo as string) || (req.body?.dateTo as string) || '2027-10-31';

    const tryRefreshToken = async () => {
      const clientId = process.env.VITE_OCTORATE_CLIENT_ID;
      const clientSecret = process.env.OCTORATE_SECRET_KEY;

      if (!refreshToken || !clientId || !clientSecret) return null;

      try {
        const refreshUrl = "https://api.octorate.com/connect/rest/v1/identity/refresh";
        const refreshRes = await fetch(refreshUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret
          }).toString()
        });

        if (refreshRes.ok) {
          const newTokens = await refreshRes.json();
          await supabaseAdmin.from('octorate_tokens').upsert({
            id: 'singleton',
            access_token: newTokens.access_token,
            refresh_token: newTokens.refresh_token || refreshToken,
            expires_in: newTokens.expires_in,
            updated_at: new Date().toISOString()
          });
          return newTokens.access_token;
        }
      } catch (err) {
        console.warn("[octorate-restrictions-grid] Token refresh failed:", err);
      }
      return null;
    };

    // Costruisce la query mirata dei prodotti per evitare payload enormi e socket timeout
    const targetProductIds: number[] = [];
    const activeRateMap = testOnly ? TEST_PRODUCT_IDS : REAL_PRODUCT_IDS;
    if (testOnly) {
      targetProductIds.push(649669, 921799); // Camere madri Fake Bungalows
    }
    for (const ids of Object.values(activeRateMap)) {
      for (const id of ids) targetProductIds.push(id);
    }
    const uniqueProductIds = Array.from(new Set(targetProductIds));
    const productQuery = uniqueProductIds.map(id => `product[]=${id}`).join('&');

    const fetchCalendarPage = async (token: string, pageNum: number) => {
      const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${dateFrom}&dateTo=${dateTo}&size=50&page=${pageNum}`;
      return await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(15000)
      });
    };

    // 2. Interroga Octorate Calendar API per ottenere i prodotti con i giorni del calendario
    let allItems: any[] = [];
    for (let page = 1; page <= 3; page++) {
      let octorateRes: any = null;
      try {
        octorateRes = await fetchCalendarPage(accessToken, page);
      } catch (fErr: any) {
        console.warn(`[octorate-restrictions-grid] Fetch attempt failed on page ${page}:`, fErr?.message);
        // Retry rapido una volta
        await new Promise(r => setTimeout(r, 300));
        try {
          octorateRes = await fetchCalendarPage(accessToken, page);
        } catch (retryErr: any) {
          if (page === 1) {
            return res.status(500).json({ error: `Timeout o errore connessione Octorate: ${retryErr?.message || 'fetch failed'}` });
          }
          break;
        }
      }

      if (!octorateRes || !octorateRes.ok) {
        const errText = await octorateRes?.text?.().catch(() => '') || '';
        if (errText.includes('Expired Token') || errText.includes('ApiLoginExpired') || octorateRes?.status === 401 || octorateRes?.status === 403) {
          console.info('[octorate-restrictions-grid] Token scaduto. Tentativo di refresh automatico...');
          const newAccessToken = await tryRefreshToken();
          if (newAccessToken) {
            accessToken = newAccessToken;
            try {
              octorateRes = await fetchCalendarPage(accessToken, page);
            } catch (rErr) {}
          }
        }

        if (!octorateRes || !octorateRes.ok) {
          const finalErrText = await octorateRes?.text?.().catch(() => '') || '';
          if (page === 1) {
            return res.status(octorateRes?.status || 500).json({ error: `Errore Octorate API: ${finalErrText}` });
          }
          break;
        }
      }

      const rawData = await octorateRes.json();
      const pageItems = Array.isArray(rawData) ? rawData : (rawData.data || rawData.items || rawData.roomRates || rawData.rates || []);
      if (!Array.isArray(pageItems) || pageItems.length === 0) break;

      allItems.push(...pageItems);

      const totalPages = Number(rawData.page?.totalPages || rawData.totalPages || 1);
      if (page >= totalPages) break;
    }

    // Mappatura ad altissima precisione sugli ID esatti di Octorate
    const itemMapById = new Map<number, any>();
    for (const item of allItems) {
      if (item.id) {
        itemMapById.set(Number(item.id), item);
      }
    }

    const gridMap: Record<string, any[]> = {
      be: [],
      '7d': [],
      main_bnb_7d: [],
      main_bnb_14d: [],
      agoda_ac_7d: [],
      agoda_ac_14d: [],
      agd_ac_7d: [],
      agd_ac_14d: [],
      airbnb: [],
      airbnb_ac: [],
      ac_7d: [],
      ac_14d: [],
      ac_bnb_7d: [],
      ac_bnb_14d: []
    };

    let liveMinStayPeriods: any[] = [];

    for (const [planKey, ids] of Object.entries(activeRateMap)) {
      let matchedItem: any = null;
      for (const id of ids) {
        // Conversione esplicita in stringa per evitare mismatch di tipo string vs number
        const foundId = Array.from(itemMapById.keys()).find(k => String(k) === String(id));
        if (foundId !== undefined) {
          matchedItem = itemMapById.get(foundId);
          break;
        }
      }

      if (matchedItem) {
        const daysArr = Array.isArray(matchedItem.days) ? matchedItem.days : (Array.isArray(matchedItem.calendar) ? matchedItem.calendar : []);
        const filteredDays = daysArr.filter((d: any) => {
          const dStr = String(d.date || d.dateStr || d.day || '').substring(0, 10);
          return !dateFrom || (dStr >= dateFrom && dStr <= dateTo);
        });

        if (filteredDays.length > 0) {
          gridMap[planKey] = groupDailyRestrictions(filteredDays, planKey);
          if (planKey === 'be') {
            liveMinStayPeriods = groupDailyMinStay(filteredDays);
          }
        }
      }
    }

    if (testOnly) {
      const testCachePath = path.resolve(process.cwd(), 'scratch/octorate-test-live-cache.json');
      if (fs.existsSync(testCachePath)) {
        try {
          const testCache = JSON.parse(fs.readFileSync(testCachePath, 'utf8'));
          for (const [pk, periods] of Object.entries(testCache)) {
            if (pk === 'minStayPeriods') {
              if (Array.isArray(periods) && periods.length > 0) {
                liveMinStayPeriods = periods;
              }
            } else if (Array.isArray(periods) && periods.length > 0) {
              gridMap[pk] = periods;
            }
          }
        } catch (err) {
          console.warn('[octorate-restrictions-grid] Error reading test live cache:', err);
        }
      }
    }

    // Se un canale derivato è aperto senza restrizioni specifiche (array vuoto),
    // genera un periodo fittizio di "Apertura Standard (OK)" a copertura stagionale
    for (const planKey of Object.keys(gridMap)) {
      if (!gridMap[planKey] || gridMap[planKey].length === 0) {
        gridMap[planKey] = [
          {
            id: `${planKey}_live_default_open`,
            name: 'Apertura Standard (OK)',
            dateFrom: dateFrom || '2026-10-01',
            dateTo: dateTo || '2027-10-31',
            stopSell: false,
            closedToArrival: false,
            closedToDeparture: false,
            onlyCheckOutDays: [],
            onlyCheckoutDays: [],
            strategy: 'open'
          }
        ];
      }
    }

    return res.status(200).json({
      success: true,
      testOnly,
      structureId,
      dateFrom,
      dateTo,
      grid: gridMap,
      minStayPeriods: liveMinStayPeriods
    });
  } catch (err: any) {
    console.error('[octorate-restrictions-grid] Server error:', err);
    return res.status(500).json({ error: err.message || 'Errore interno server' });
  }
}
