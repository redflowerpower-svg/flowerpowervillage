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
    // 1. Recupero token OAuth da Supabase
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('octorate_tokens')
      .select('access_token, refresh_token')
      .eq('id', 'singleton')
      .maybeSingle();

    if (tokenError || !tokenData?.access_token) {
      return res.status(401).json({ error: 'Token OAuth Octorate non presente o invalido' });
    }

    let accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const structureId = process.env.VITE_OCTORATE_STRUCTURE_ID || process.env.OCTORATE_STRUCTURE_ID || '366879';

    // Date da Oggi al 31 Maggio 2027
    const today = '2026-10-01';
    const dateFrom = today;
    const dateTo = '2027-05-31';

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

    const fetchCalendarPage = async (token: string, pageNum: number) => {
      const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${dateFrom}&dateTo=${dateTo}&size=50&page=${pageNum}`;
      return await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
    };

    // 2. Interroga Octorate Calendar API per ottenere i prodotti con i giorni del calendario
    let allItems: any[] = [];
    for (let page = 1; page <= 5; page++) {
      let octorateRes = await fetchCalendarPage(accessToken, page);

      if (!octorateRes.ok) {
        const errText = await octorateRes.text();
        if (errText.includes('Expired Token') || errText.includes('ApiLoginExpired') || octorateRes.status === 401 || octorateRes.status === 403) {
          console.info('[octorate-restrictions-grid] Token scaduto. Tentativo di refresh automatico...');
          const newAccessToken = await tryRefreshToken();
          if (newAccessToken) {
            accessToken = newAccessToken;
            octorateRes = await fetchCalendarPage(accessToken, page);
          }
        }

        if (!octorateRes.ok) {
          const finalErrText = await octorateRes.text();
          if (page === 1) {
            return res.status(octorateRes.status).json({ error: `Errore Octorate API: ${finalErrText}` });
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

    const testOnly = req.query.testOnly === 'true' || req.body?.testOnly === true || req.body?.testOnly === 'true';

    // Mappatura ad altissima precisione sugli ID esatti di Octorate
    const itemMapById = new Map<number, any>();
    for (const item of allItems) {
      if (item.id) {
        itemMapById.set(Number(item.id), item);
      }
    }

    // Rate ID Reali per la camera sentinella Jungle Villa (529773)
    const REAL_PRODUCT_IDS: Record<string, number[]> = {
      be: [529784],
      '7d': [529778],
      main_bnb_7d: [529788],
      main_bnb_14d: [529792],
      ac_7d: [529780],
      ac_14d: [529781],
      ac_bnb_7d: [916816, 916817],
      ac_bnb_14d: [529801],
      agoda_ac_7d: [921868],
      agoda_ac_14d: [921869],
      agd_ac_7d: [921868],
      agd_ac_14d: [921869],
      airbnb: [529783],
      airbnb_ac: [529813]
    };

    // Rate ID di Test per i Fake Bungalows 1 & 2 — Mappatura Definitiva Confermata da Probe
    // FB1: 932243-932255 | FB2: FB1+13 (shift = +13) | Madri: 649669, 921799
    const TEST_PRODUCT_IDS: Record<string, number[]> = {
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

    const activeRateMap = testOnly ? TEST_PRODUCT_IDS : REAL_PRODUCT_IDS;

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
        }
      }
    }

    if (testOnly) {
      const testCachePath = path.resolve(process.cwd(), 'scratch/octorate-test-live-cache.json');
      if (fs.existsSync(testCachePath)) {
        try {
          const testCache = JSON.parse(fs.readFileSync(testCachePath, 'utf8'));
          for (const [pk, periods] of Object.entries(testCache)) {
            if (Array.isArray(periods) && periods.length > 0) {
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
      grid: gridMap
    });
  } catch (err: any) {
    console.error('[octorate-restrictions-grid] Server error:', err);
    return res.status(500).json({ error: err.message || 'Errore interno server' });
  }
}
