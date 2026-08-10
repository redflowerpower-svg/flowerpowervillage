import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseAdmin = (supabaseUrl && serviceRoleKey) ? createClient(supabaseUrl, serviceRoleKey) : (null as any);

const isClosed = (d: any) => Boolean(
  d?.stopSells === true || d?.stopSells === 'true' ||
  d?.stopSell === true || d?.stopSell === 'true' || d?.stop_sell === true ||
  d?.closed === true || d?.closed === 'true' || d?.closed === 1
);

const isCA = (d: any) => Boolean(
  d?.closeToArrival === true || d?.closeToArrival === 'true' || d?.closeToArrival === 1 ||
  d?.closedArrival === true || d?.closedArrival === 'true' || d?.closed_to_arrival === true || d?.closedArrival === 1 || d?.cta === true
);

function parsePeriods(days: any[]) {
  if (!Array.isArray(days) || days.length === 0) return [];
  
  const periods = [];
  let i = 0;
  const n = days.length;

  while (i < n) {
    const closedState = isClosed(days[i]);
    const startIdx = i;

    while (i < n && isClosed(days[i]) === closedState) {
      i++;
    }
    const endIdx = i - 1;

    let onlyCheckOutDays = 0;
    if (!closedState) {
      let k = endIdx;
      while (k >= startIdx && isCA(days[k])) {
        onlyCheckOutDays++;
        k--;
      }
    }

    const dFrom = String(days[startIdx]?.date || days[startIdx]?.dateStr || '').substring(0, 10);
    const dTo = String(days[endIdx]?.date || days[endIdx]?.dateStr || '').substring(0, 10);

    periods.push({
      id: `p_live_${startIdx}_${Math.random().toString(36).substring(2, 6)}`,
      name: closedState ? `Periodo Bloccato` : `Periodo ${periods.length + 1}`,
      dateFrom: dFrom,
      dateTo: dTo,
      stopSell: closedState,
      closedToArrival: isCA(days[endIdx]),
      closedToDeparture: false,
      onlyCheckOutDays: onlyCheckOutDays > 0 ? onlyCheckOutDays : 10,
      failsafeCheckout: true
    });
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

    const items = allItems;

    // Mappa dei 12 piani reali
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

    const PLAN_CODE_MAPPINGS: Record<string, string> = {
      be: 'be',
      '7d': '7d',
      'main bnb-7d': 'main_bnb_7d',
      'main-bnb-7d': 'main_bnb_7d',
      'main_bnb_7d': 'main_bnb_7d',
      'main bnb-14d': 'main_bnb_14d',
      'main-bnb-14d': 'main_bnb_14d',
      'main_bnb_14d': 'main_bnb_14d',
      'ac7d': 'ac_7d',
      'ac 7d': 'ac_7d',
      'ac-7d': 'ac_7d',
      'ac14d': 'ac_14d',
      'ac 14d': 'ac_14d',
      'ac-14d': 'ac_14d',
      'ac bnb-7d': 'ac_bnb_7d',
      'ac-bnb-7d': 'ac_bnb_7d',
      'ac bnb-14d': 'ac_bnb_14d',
      'ac-bnb-14d': 'ac_bnb_14d',
      'agd ac-7d': 'agd_ac_7d',
      'agd-ac-7d': 'agd_ac_7d',
      'agd ac-14d': 'agd_ac_14d',
      'agd-ac-14d': 'agd_ac_14d',
      'airbnb': 'airbnb',
      'airbnb ac': 'airbnb_ac',
      'airbnb-ac': 'airbnb_ac'
    };

    // Filtra e analizza i giorni per ciascuno dei 12 piani tariffari
    for (const item of items) {
      const itemName = String(item.name || item.title || item.roomRateName || item.rateName || '').toLowerCase();
      const daysArr = Array.isArray(item.days) ? item.days : (Array.isArray(item.calendar) ? item.calendar : (Array.isArray(item.dates) ? item.dates : []));

      for (const [codeKey, planKey] of Object.entries(PLAN_CODE_MAPPINGS)) {
        let isMatch = false;

        if (codeKey === 'be') {
          isMatch = !itemName.includes('7d') && !itemName.includes('14d') && !itemName.includes('airbnb') && !itemName.includes('agd');
        } else if (codeKey === 'airbnb') {
          isMatch = itemName.includes('airbnb') && !itemName.includes('ac');
        } else {
          isMatch = itemName.includes(codeKey);
        }

        if (isMatch && daysArr.length > 0) {
          const filteredDays = daysArr.filter((d: any) => {
            const dStr = String(d.date || d.dateStr || d.day || '').substring(0, 10);
            return !dateFrom || (dStr >= dateFrom && dStr <= dateTo);
          });

          if (filteredDays.length > 0) {
            if (!gridMap[planKey] || gridMap[planKey].length === 0) {
              gridMap[planKey] = parsePeriods(filteredDays);
            }
          }
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
