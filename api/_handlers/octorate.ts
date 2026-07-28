import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseAdmin = (supabaseUrl && serviceRoleKey) ? createClient(supabaseUrl, serviceRoleKey) : null as any;

const OFFICIAL_BE_RATE_IDS = new Set([
  529784, 495807, 495980, 495566, 449348, 449385, 449422, 449668,
  449675, 449674, 449678, 449684, 449699, 449724, 449730, 449736,
  923905, 449742
]);

// 1. handleOctorateExchange
export async function handleOctorateExchange(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase configuration missing (URL or Service Role Key)' });
  }

  const { code, redirectUri } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  const clientId = process.env.VITE_OCTORATE_CLIENT_ID;
  const clientSecret = process.env.OCTORATE_SECRET_KEY;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Server configuration missing (Client ID or Secret)' });
  }

  try {
    const octorateUrl = "https://api.octorate.com/octobook/rest/v1/identity/token";
    
    const bodyParams = new URLSearchParams({
      grant_type: "code",
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri || "https://localhost/",
    });

    const response = await fetch(octorateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: bodyParams.toString(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return res.status(response.status).json({ error: `Octorate exchange failed: ${errorBody}` });
    }

    const tokens = await response.json();

    const { error: dbError } = await supabaseAdmin
      .from('octorate_tokens')
      .upsert({
        id: 'singleton',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        updated_at: new Date().toISOString(),
      });

    if (dbError) {
      return res.status(500).json({ error: `Database storage failed: ${dbError.message}` });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// 2. handleOctorateRefresh
export async function handleOctorateRefresh(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase configuration missing (URL or Service Role Key)' });
  }

  const clientId = process.env.VITE_OCTORATE_CLIENT_ID;
  const clientSecret = process.env.OCTORATE_SECRET_KEY;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Server configuration missing (Client ID or Secret)' });
  }

  try {
    const { data: currentTokens, error: fetchError } = await supabaseAdmin
      .from('octorate_tokens')
      .select('refresh_token')
      .eq('id', 'singleton')
      .maybeSingle();

    if (fetchError || !currentTokens?.refresh_token) {
      return res.status(400).json({ error: 'No refresh token available in database' });
    }

    const octorateUrl = "https://api.octorate.com/connect/rest/v1/identity/refresh";
    
    const bodyParams = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: currentTokens.refresh_token,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const response = await fetch(octorateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: bodyParams.toString(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return res.status(response.status).json({ error: `Octorate refresh failed: ${errorBody}` });
    }

    const tokens = await response.json();

    const { error: dbError } = await supabaseAdmin
      .from('octorate_tokens')
      .upsert({
        id: 'singleton',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        updated_at: new Date().toISOString(),
      });

    if (dbError) {
      return res.status(500).json({ error: `Database storage update failed: ${dbError.message}` });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// 3. handleOctorateTokens
export async function handleOctorateTokens(req: VercelRequest, res: VercelResponse) {
  const internalSecret = req.headers['x-internal-secret'];
  if (!process.env.INTERNAL_API_SECRET || internalSecret !== process.env.INTERNAL_API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('octorate_tokens')
      .select('access_token, refresh_token, expires_in, updated_at')
      .eq('id', 'singleton')
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ data });
  }

  if (req.method === 'POST') {
    const { access_token, refresh_token, expires_in } = req.body;

    const { error } = await supabaseAdmin
      .from('octorate_tokens')
      .upsert({
        id: 'singleton',
        access_token,
        refresh_token,
        expires_in,
        updated_at: new Date().toISOString(),
      });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    const { error } = await supabaseAdmin
      .from('octorate_tokens')
      .delete()
      .eq('id', 'singleton');

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// 4. handleOctorateClientGet
export async function handleOctorateClientGet(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase configuration missing (URL or Service Role Key)' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('octorate_tokens')
      .select('access_token, refresh_token, expires_in, updated_at')
      .eq('id', 'singleton')
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// 5. handleOctorateClientClear
export async function handleOctorateClientClear(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase configuration missing (URL or Service Role Key)' });
  }

  try {
    const { error } = await supabaseAdmin
      .from('octorate_tokens')
      .delete()
      .eq('id', 'singleton');

    if (error) {
      return res.status(500).json({ error: `Database clear failed: ${error.message}` });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// 6. handleOctorateBookings
export async function handleOctorateBookings(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase configuration missing' });
  }

  try {
    let { data: sbData, error: sbError } = await supabaseAdmin
      .from('resort_bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (sbError || !sbData || sbData.length === 0) {
      const { data: resData } = await supabaseAdmin
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (resData && resData.length > 0) {
        sbData = resData;
      }
    }

    const { data: tokenData } = await supabaseAdmin
      .from('octorate_tokens')
      .select('access_token')
      .eq('id', 'singleton')
      .maybeSingle();

    let octorateReservations: any[] = [];
    if (tokenData?.access_token) {
      try {
        const dateFrom = (req.query.dateFrom as string) || new Date().toISOString().substring(0, 10);
        const octRes = await fetch(`https://api.octorate.com/connect/rest/v1/reservation?dateFrom=${dateFrom}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Accept': 'application/json'
          }
        });

        if (octRes.ok) {
          const octJson = await octRes.json();
          const items = octJson && Array.isArray(octJson.data) ? octJson.data : (Array.isArray(octJson) ? octJson : []);
          octorateReservations = items.map((r: any) => ({
            id: String(r.id || r.reservationId || Math.random()),
            guest_name: r.guestName || r.guest_name || `${r.first_name || 'Ospite'} ${r.last_name || ''}`.trim(),
            guest_email: r.email || r.guestEmail || '',
            guest_phone: r.phone || '',
            accommodation_id: String(r.roomTypeId || r.roomId || r.accommodation_id || ''),
            accommodation_name: r.roomName || r.accommodation_name || '',
            check_in: String(r.checkIn || r.check_in || '').slice(0, 10),
            check_out: String(r.checkOut || r.check_out || '').slice(0, 10),
            guests: Number(r.pax || r.guests || 2),
            total_price: Number(r.totalAmount || r.total_price || 0),
            deposit_paid: Number(r.deposit || 0),
            status: r.status === 'CANCELLED' ? 'cancelled' : 'confirmed',
            source_channel: r.ota || r.source_channel || r.channel || 'Booking.com'
          }));
        }
      } catch (octErr) {
        console.warn('[api/resort/octorate-bookings] Octorate reservations fetch notice:', octErr);
      }
    }

    const combinedBookings = [...(sbData || []), ...octorateReservations];

    return res.status(200).json({ success: true, data: combinedBookings });
  } catch (error: any) {
    console.error('[api/resort/octorate-bookings] Exception:', error);
    return res.status(500).json({ error: error.message });
  }
}

// 7. handleOctorateGrid
export async function handleOctorateGrid(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase configuration missing (URL or Service Role Key)' });
  }

  const dateFrom = (req.query.dateFrom as string) || new Date().toISOString().substring(0, 10);
  const dateTo = req.query.dateTo as string;
  const structureId = process.env.VITE_OCTORATE_STRUCTURE_ID || "366879";

  if (!dateTo) {
    return res.status(400).json({ error: 'Missing dateTo query parameter' });
  }

  try {
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

      const foundBECount = allFetchedItems.filter(item => OFFICIAL_BE_RATE_IDS.has(Number(item.id))).length;
      if (foundBECount >= OFFICIAL_BE_RATE_IDS.size) {
        break;
      }

      if (pageItems.length < PAGE_SIZE) {
        break;
      }

      page++;
    }

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
