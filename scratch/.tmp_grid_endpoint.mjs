// api/_handlers/octorate.ts
import { createClient } from "@supabase/supabase-js";
var supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
var serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
var supabaseAdmin = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;
var OFFICIAL_BE_RATE_IDS = /* @__PURE__ */ new Set([
  529784,
  495807,
  495980,
  495566,
  449348,
  449385,
  449422,
  449668,
  449675,
  449674,
  449678,
  449684,
  449699,
  449724,
  449730,
  449736,
  923905,
  449742
]);
async function handleOctorateGrid(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!supabaseAdmin) {
    return res.status(500).json({ error: "Supabase configuration missing (URL or Service Role Key)" });
  }
  const dateFrom = req.query.dateFrom || (/* @__PURE__ */ new Date()).toISOString().substring(0, 10);
  const dateTo = req.query.dateTo;
  const structureId = process.env.VITE_OCTORATE_STRUCTURE_ID || "366879";
  if (!dateTo) {
    return res.status(400).json({ error: "Missing dateTo query parameter" });
  }
  try {
    const { data: tokenData, error: fetchError } = await supabaseAdmin.from("octorate_tokens").select("access_token, refresh_token").eq("id", "singleton").maybeSingle();
    if (fetchError || !tokenData?.access_token) {
      return res.status(400).json({ error: "No Octorate access token available in database" });
    }
    let accessToken = tokenData.access_token;
    let refreshToken = tokenData.refresh_token;
    const fetchCalendarPage = async (token, pageNum) => {
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
          await supabaseAdmin.from("octorate_tokens").upsert({
            id: "singleton",
            access_token: newTokens.access_token,
            refresh_token: newTokens.refresh_token || refreshToken,
            expires_in: newTokens.expires_in,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          });
          return newTokens.access_token;
        }
      } catch (err) {
        console.warn("[api/resort/octorate-grid] Token refresh failed:", err);
      }
      return null;
    };
    const MOTHER_RATE_IDS = /* @__PURE__ */ new Set([
      529773,
      495795,
      495796,
      494840,
      421511,
      293957,
      293954,
      293962,
      293965,
      293955,
      293963,
      293959,
      293948,
      293945,
      293943,
      293951,
      883795,
      293942
    ]);
    const targetIds = /* @__PURE__ */ new Set([...OFFICIAL_BE_RATE_IDS, ...MOTHER_RATE_IDS]);
    const allFetchedItems = [];
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
      const pageItems = payload && Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : [];
      if (pageItems.length === 0) {
        break;
      }
      allFetchedItems.push(...pageItems);
      const foundTargetCount = allFetchedItems.filter((item) => targetIds.has(Number(item.id))).length;
      if (foundTargetCount >= targetIds.size) {
        break;
      }
      if (pageItems.length < PAGE_SIZE) {
        break;
      }
      page++;
    }
    const filteredBEItems = allFetchedItems.filter((item) => {
      const idNum = Number(item.id);
      const nameStr = String(item.name || "").toLowerCase();
      return OFFICIAL_BE_RATE_IDS.has(idNum) || MOTHER_RATE_IDS.has(idNum) || nameStr.endsWith("be") || nameStr.includes("booking engine");
    });
    console.log(`[OCTORATE GRID] Scaricati ${allFetchedItems.length} rate plans. Filtrati ${filteredBEItems.length} BE e Mother rate plans dal ${dateFrom} al ${dateTo}.`);
    return res.status(200).json({
      success: true,
      data: filteredBEItems,
      grid: filteredBEItems,
      totalFetched: allFetchedItems.length,
      pagesCount: page + 1
    });
  } catch (error) {
    console.error("[OCTORATE GRID ERROR CRITICO]:", error);
    return res.status(500).json({ error: error.message || "Error processing grid", stack: error.stack });
  }
}

// api/resort/octorate-grid.ts
async function handler(req, res) {
  try {
    return await handleOctorateGrid(req, res);
  } catch (error) {
    console.error("[OCTORATE GRID ERROR CRITICO]:", error);
    if (res && typeof res.status === "function") {
      return res.status(500).json({ error: error?.message || "Internal Server Error", stack: error?.stack });
    }
    return new Response(
      JSON.stringify({ error: error?.message || "Internal Server Error", stack: error?.stack }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
export {
  handler as default
};
