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

function toThailandDateStr(raw: any): string {
  if (!raw) return '';
  const s = String(raw).trim();
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (isNaN(d.getTime())) return s.slice(0, 10);
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
  } catch (e) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
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
    const dateFrom = (req.query.dateFrom as string) || (req.query.startDate as string) || new Date().toISOString().substring(0, 10);
    const dateToObj = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const dateTo = (req.query.dateTo as string) || (req.query.endDate as string) || dateToObj.toISOString().substring(0, 10);

    const { data: tokenData } = await supabaseAdmin
      .from('octorate_tokens')
      .select('access_token')
      .eq('id', 'singleton')
      .maybeSingle();

    let octorateReservations: any[] = [];
    if (tokenData?.access_token) {
      try {
        const pageSize = 20;
        let page = 0;
        let hasMore = true;
        const maxPages = 50; // Safety guard for up to 1000 reservations
        const rawItems: any[] = [];

        while (hasMore && page < maxPages) {
          const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=${dateFrom}&endDate=${dateTo}&size=${pageSize}&page=${page}`;
          let octRes = await fetch(octUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
              'Accept': 'application/json'
            }
          });

          if (!octRes.ok) {
            const fallbackUrl = `https://api.octorate.com/connect/rest/v1/reservation?structure=366879&type=STAY&startDate=${dateFrom}&endDate=${dateTo}&size=${pageSize}&page=${page}`;
            octRes = await fetch(fallbackUrl, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Accept': 'application/json'
              }
            });
          }

          if (octRes.ok) {
            const octJson = await octRes.json();
            const pageItems = octJson && Array.isArray(octJson.data) 
              ? octJson.data 
              : (Array.isArray(octJson) ? octJson : (octJson.reservations || []));

            if (Array.isArray(pageItems) && pageItems.length > 0) {
              rawItems.push(...pageItems);
              if (pageItems.length < pageSize) {
                hasMore = false; // Reached last page
              } else {
                page++;
              }
            } else {
              hasMore = false;
            }
          } else {
            console.warn(`[api/resort/octorate-bookings] Octorate API status ${octRes.status} on page ${page}`);
            hasMore = false;
          }
        }

        octorateReservations = rawItems.map((r: any) => {
          const inStr = toThailandDateStr(r.checkin || r.check_in || r.checkIn || r.startDate);
          const outStr = toThailandDateStr(r.checkout || r.check_out || r.checkOut || r.endDate);
          return {
            id: String(r.id || r.reservationId || Math.random()),
            guest_name: r.guestName || r.guest_name || `${r.firstName || r.first_name || 'Ospite'} ${r.lastName || r.last_name || ''}`.trim(),
            guest_email: r.email || r.guestEmail || (r.guests && r.guests[0]?.email) || '',
            guest_phone: r.phone || (r.guests && r.guests[0]?.phone) || '',
            accommodation_id: String(r.product || r.roomTypeId || r.roomId || r.accommodation_id || ''),
            accommodation_name: r.roomName || r.accommodation_name || '',
            product: String(r.product || r.roomTypeId || ''),
            roomName: r.roomName || r.accommodation_name || '',
            check_in: inStr,
            check_out: outStr,
            checkin: inStr,
            checkout: outStr,
            guests: Number(r.totalGuest || r.pax || r.guestsCount || 2),
            total_price: Number(r.roomGross || r.totalGross || r.totalAmount || 0),
            deposit_paid: Number(r.deposit || 0),
            status: (['CANCELLED', 'CANCELED', 'DELETED', 'VOID', 'REJECTED'].includes(String(r.status || '').toUpperCase().trim()) || Boolean(r.cancelled || r.isCancelled)) ? 'cancelled' : 'confirmed',
            source_channel: r.channelName || r.ota || r.source_channel || r.channel || 'Booking.com',
            channelName: r.channelName || r.ota || r.source_channel || r.channel || 'Booking.com'
          };
        });
      } catch (octErr) {
        console.warn('[api/resort/octorate-bookings] Octorate reservations fetch notice:', octErr);
      }
    }

    console.log(`[BACKEND Octorate Bookings] Trovate ${octorateReservations.length} prenotazioni Octorate dal ${dateFrom} al ${dateTo}`);

    return res.status(200).json({ success: true, data: octorateReservations, count: octorateReservations.length });
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

    const MOTHER_RATE_IDS = new Set([
      529773, 495795, 495796, 494840, 421511, 293957, 293954, 293962,
      293965, 293955, 293963, 293959, 293948, 293945, 293943, 293951,
      883795, 293942
    ]);

    const targetIds = new Set([...OFFICIAL_BE_RATE_IDS, ...MOTHER_RATE_IDS]);

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

      if (pageItems.length < PAGE_SIZE) {
        break;
      }

      page++;
    }

    const filteredBEItems = allFetchedItems.filter((item: any) => {
      const idNum = Number(item.id);
      const nameStr = String(item.name || '').toLowerCase();
      return OFFICIAL_BE_RATE_IDS.has(idNum) || MOTHER_RATE_IDS.has(idNum) || nameStr.endsWith('be') || nameStr.includes('booking engine');
    });

    console.log(`[OCTORATE GRID] Scaricati tutti i ${allFetchedItems.length} rate plans. Filtrati ${filteredBEItems.length} BE e Mother rate plans dal ${dateFrom} al ${dateTo}.`);

    return res.status(200).json({
      success: true,
      data: allFetchedItems,
      grid: allFetchedItems,
      beGrid: filteredBEItems,
      totalFetched: allFetchedItems.length,
      pagesCount: page + 1
    });
  } catch (error: any) {
    console.error("[OCTORATE GRID ERROR CRITICO]:", error);
    return res.status(500).json({ error: error.message || 'Error processing grid', stack: error.stack });
  }
}

// Global DRY_RUN mode flag (simulazione in memoria / log per la massima sicurezza)
const DRY_RUN = true;
const STAGING_LOCK_IDS = new Set(['649669', '921799']);

// 8. handleOctorateMinStay - Dynamic Minimum Stay (Gap-Filling) & Rollback Handler
export async function handleOctorateMinStay(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { updates, resetToBaseline, dryRun } = req.body || {};
  const updateItems = Array.isArray(updates) ? updates : [];
  const isSimulation = dryRun !== undefined ? Boolean(dryRun) : DRY_RUN;

  // STAGING LOCK CHECK: Se DRY_RUN viene disattivato (false), rifiuta la scrittura se non per i due alloggi fittizi
  if (!isSimulation) {
    const invalidTarget = updateItems.find((item: any) => {
      const idStr = String(item.roomTypeId || item.id || item.octorateId || item.room || '');
      return !STAGING_LOCK_IDS.has(idStr);
    });

    if (invalidTarget) {
      const targetId = String(invalidTarget.roomTypeId || invalidTarget.id || invalidTarget.octorateId);
      console.error(`[STAGING LOCK BLOCKED] Tentativo di scrittura bloccato per l'alloggio non-staging ID ${targetId}`);
      return res.status(403).json({
        error: `Staging Lock Attivo: La scrittura reale è consentita esclusivamente per gli alloggi fittizi #649669 e #921799. Target bloccato: ${targetId}`,
        blockedTarget: invalidTarget
      });
    }
  }

  if (isSimulation) {
    console.log(`[MIN-STAY DRY RUN SIMULATION] Elaborati ${updateItems.length} aggiornamenti dinamici (resetToBaseline: ${Boolean(resetToBaseline)})`);
    return res.status(200).json({
      success: true,
      dryRun: true,
      message: resetToBaseline
        ? `Ripristino Notte Stagionale Base (2/5 notti) simulato con successo (${updateItems.length} stanze).`
        : `Calcolo Soggiorno Minimo Dinamico (Gap-Fill) completato in modalità SIMULAZIONE (${updateItems.length} gap trovati).`,
      updatesCount: updateItems.length,
      updates: updateItems
    });
  }

  // Esecuzione Scrittura Reale Octorate per gli Alloggi di Staging
  try {
    let accessToken: string | null = null;
    const { data: tokenData } = await supabaseAdmin
      .from('octorate_tokens')
      .select('access_token, refresh_token')
      .eq('id', 'singleton')
      .maybeSingle();

    if (tokenData?.access_token) {
      accessToken = tokenData.access_token;
    }

    // Se manca o per garantire token sempre fresco, tenta il refresh
    const clientId = process.env.VITE_OCTORATE_CLIENT_ID || process.env.OCTORATE_CLIENT_ID;
    const clientSecret = process.env.OCTORATE_SECRET_KEY || process.env.VITE_OCTORATE_SECRET_KEY;
    const refreshToken = tokenData?.refresh_token;

    if ((!accessToken || refreshToken) && refreshToken && clientId && clientSecret) {
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
          accessToken = newTokens.access_token;
          await supabaseAdmin.from('octorate_tokens').upsert({
            id: 'singleton',
            access_token: newTokens.access_token,
            refresh_token: newTokens.refresh_token || refreshToken,
            expires_in: newTokens.expires_in,
            updated_at: new Date().toISOString()
          });
        }
      } catch (rErr) {
        console.warn("[handleOctorateMinStay] Token refresh fallback warning:", rErr);
      }
    }

    if (!accessToken) {
      return res.status(400).json({ error: 'No Octorate access token available in database' });
    }

    const roomsPayload = updateItems.map((item: any) => ({
      room: Number(item.roomTypeId || item.motherId || item.id || item.octorateId || item.room),
      dateFrom: item.dateFrom || item.date || item.from_date || item.startDate,
      dateTo: item.dateTo || item.to_date || item.endDate,
      values: {
        minstay: Number(item.minStay || item.min_stay || item.minimumStay || 2)
      }
    }));

    const octRes = await fetch(`https://api.octorate.com/connect/rest/v1/calendar/bulk`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(roomsPayload)
    });

    if (!octRes.ok) {
      const errorText = await octRes.text();
      return res.status(octRes.status).json({ error: `Octorate bulk min-stay update failed: ${errorText}` });
    }

    let octResult: any = null;
    try {
      octResult = await octRes.json();
    } catch {
      octResult = { ok: true };
    }
    return res.status(200).json({ 
      success: true, 
      dryRun: false, 
      message: `Sincronizzazione Soggiorno Minimo completata su Octorate (${roomsPayload.length} blocchi inviati)`,
      updatesCount: roomsPayload.length,
      octResult 
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Serverless min-stay execution error' });
  }
}
