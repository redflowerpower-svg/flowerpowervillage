import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

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
  const periods: any[] = [];
  const n = days.length;
  let i = 0;
  let idCounter = 1;

  while (i < n) {
    // 1. Salta i blocchi di chiusura totale (stopsell)
    while (i < n && isStopSell(days[i])) {
      i++;
    }
    if (i >= n) break;

    // Trovato l'inizio di una finestra di vendita attiva
    const dateFrom = String(days[i]?.date || days[i]?.dateStr || days[i]?.day || '').substring(0, 10);
    let lastOpenDate = dateFrom;

    // 2. Consuma i giorni consecutivi di vendita aperta
    while (i < n && !isStopSell(days[i]) && !isCloseToArrival(days[i])) {
      lastOpenDate = String(days[i]?.date || days[i]?.dateStr || days[i]?.day || '').substring(0, 10);
      i++;
    }

    // 3. Conta la coda di Only Check-out consecutiva subito dopo
    let onlyCheckoutDays = 0;
    while (i < n && !isStopSell(days[i]) && isCloseToArrival(days[i])) {
      onlyCheckoutDays++;
      i++;
    }

    // Crea un singolo periodo coerente con il modello pianificato
    periods.push({
      id: `${ratePlanKey}_live_p${idCounter++}`,
      name: `Periodo ${periods.length + 1}`,
      dateFrom: dateFrom,
      dateTo: lastOpenDate,
      stopSell: false,
      closedToArrival: onlyCheckoutDays > 0,
      closedToDeparture: false,
      onlyCheckoutDays: onlyCheckoutDays,
      onlyCheckOutDays: onlyCheckoutDays > 0 ? onlyCheckoutDays : 10,
      strategy: onlyCheckoutDays > 0 ? 'failsafe_checkout' : 'open',
      failsafeCheckout: true
    });

    // 4. Salta lo stopsell successivo
    while (i < n && isStopSell(days[i])) {
      i++;
    }
  }

  return periods;
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

    // Mappatura ad altissima precisione sugli ID esatti di Octorate per la camera sentinella Jungle Villa (529773)
    const itemMapById = new Map<number, any>();
    for (const item of allItems) {
      if (item.id) {
        itemMapById.set(Number(item.id), item);
      }
    }

    const SENTINEL_RATE_ID_MAP: Record<string, number[]> = {
      be: [529784],
      '7d': [529778],
      main_bnb_7d: [529788],
      main_bnb_14d: [529792],
      ac_7d: [529780],
      ac_14d: [529781],
      ac_bnb_7d: [916817, 916816],
      ac_bnb_14d: [529801],
      agd_ac_7d: [921868],
      agd_ac_14d: [921869],
      airbnb: [529783],
      airbnb_ac: [529813]
    };

    const gridMap: Record<string, any[]> = {
      be: [],
      '7d': [],
      main_bnb_7d: [],
      main_bnb_14d: [],
      ac_7d: [],
      ac_14d: [],
      ac_bnb_7d: [],
      ac_bnb_14d: [],
      agd_ac_7d: [],
      agd_ac_14d: [],
      airbnb: [],
      airbnb_ac: []
    };

    for (const [planKey, ids] of Object.entries(SENTINEL_RATE_ID_MAP)) {
      let matchedItem: any = null;
      for (const id of ids) {
        if (itemMapById.has(id)) {
          matchedItem = itemMapById.get(id);
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

    return res.status(200).json({
      success: true,
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
