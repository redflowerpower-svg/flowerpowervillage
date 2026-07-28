import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = (supabaseUrl && serviceRoleKey) ? createClient(supabaseUrl, serviceRoleKey) : null as any;

const OFFICIAL_BE_RATE_IDS = new Set([
  529784, 495807, 495980, 495566, 449348, 449385, 449422, 449668,
  449675, 449674, 449678, 449684, 449699, 449724, 449730, 449736,
  923905, 449742
]);

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase configuration missing (URL or Service Role Key)' });
  }

  const dateFrom = req.query.dateFrom || new Date().toISOString().substring(0, 10);
  const dateTo = req.query.dateTo;
  const structureId = process.env.VITE_OCTORATE_STRUCTURE_ID || "366879";

  if (!dateTo) {
    return res.status(400).json({ error: 'Missing dateTo query parameter' });
  }

  try {
    // 1. Fetch current access token from database (bypassing RLS with serviceRoleKey)
    const { data: tokenData, error: fetchError } = await supabaseAdmin
      .from('octorate_tokens')
      .select('access_token, refresh_token')
      .eq('id', 'singleton')
      .maybeSingle();

    if (fetchError || !tokenData?.access_token) {
      return res.status(400).json({ error: 'No Octorate access token available in database' });
    }

    let accessToken = tokenData.access_token;
    let refreshToken = tokenData.refresh_token;

    const fetchCalendarPage = async (token: string, pageNum: number) => {
      const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${dateFrom}&dateTo=${dateTo}&size=20&page=${pageNum}`;
      return await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
    };

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
        console.warn("[api/resort/octorate-grid] Token refresh failed:", err);
      }
      return null;
    };

    const allFetchedItems: any[] = [];
    let page = 0;
    const PAGE_SIZE = 20;
    const MAX_PAGES = 25;

    while (page < MAX_PAGES) {
      let response = await fetchCalendarPage(accessToken, page);

      if ((response.status === 401 || response.status === 403) && page === 0) {
        const newTok = await tryRefreshToken();
        if (newTok) {
          accessToken = newTok;
          response = await fetchCalendarPage(accessToken, page);
        }
      }

      if (!response.ok) {
        console.warn(`[api/resort/octorate-grid] Page ${page} returned status ${response.status}`);
        break;
      }

      const payload = await response.json();
      const pageItems = payload && Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []);

      if (pageItems.length === 0) {
        break;
      }

      allFetchedItems.push(...pageItems);

      // If we found all 18 BE rate plans, we can stop early
      const foundBECount = allFetchedItems.filter(item => OFFICIAL_BE_RATE_IDS.has(Number(item.id))).length;
      if (foundBECount >= OFFICIAL_BE_RATE_IDS.size) {
        break;
      }

      if (pageItems.length < PAGE_SIZE) {
        break;
      }

      page++;
    }

    // Filter maintaining EXCLUSIVELY the 18 official BE Rate Plans
    const filteredBEItems = allFetchedItems.filter((item: any) => {
      const idNum = Number(item.id);
      const nameStr = String(item.name || '').toLowerCase();
      return OFFICIAL_BE_RATE_IDS.has(idNum) || nameStr.endsWith('be') || nameStr.includes('booking engine');
    });

    console.log(`[OCTORATE GRID] Scaricati ${allFetchedItems.length} rate plans totali in ${page + 1} pagine. Filtrati ${filteredBEItems.length} rate plans BE ufficiali.`);

    return res.status(200).json({ success: true, data: filteredBEItems, totalFetched: allFetchedItems.length, pagesCount: page + 1 });
  } catch (error: any) {
    console.error("[api/resort/octorate-grid] Exception:", error);
    return res.status(500).json({ error: error.message });
  }
}
