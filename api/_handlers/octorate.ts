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

// ─── Monthly chunk generator helper ──────────────────────────────────────────
function generateMonthlyChunks(from: string, to: string): Array<{ chunkFrom: string; chunkTo: string }> {
  const result: Array<{ chunkFrom: string; chunkTo: string }> = [];
  const start = new Date(from + 'T00:00:00Z');
  const end   = new Date(to   + 'T00:00:00Z');
  let cursor = new Date(start);
  while (cursor <= end) {
    const chunkFrom = cursor.toISOString().substring(0, 10);
    const lastDayOfMonth = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 0));
    const chunkTo = lastDayOfMonth <= end
      ? lastDayOfMonth.toISOString().substring(0, 10)
      : end.toISOString().substring(0, 10);
    result.push({ chunkFrom, chunkTo });
    cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
  }
  return result;
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
    let { data: sbData } = await supabaseAdmin
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });

    const reqDateFrom = (req.query.dateFrom as string) || (req.query.startDate as string) || new Date().toISOString().substring(0, 10);
    const dateToObj = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const reqDateTo = (req.query.dateTo as string) || (req.query.endDate as string) || dateToObj.toISOString().substring(0, 10);

    const bookingChunks = generateMonthlyChunks(reqDateFrom, reqDateTo);
    console.log(`[api/resort/octorate-bookings] Query split in ${bookingChunks.length} chunk mensili: ${bookingChunks.map(c => `${c.chunkFrom}->${c.chunkTo}`).join(', ')}`);

    const { data: tokenData } = await supabaseAdmin
      .from('octorate_tokens')
      .select('access_token')
      .eq('id', 'singleton')
      .maybeSingle();

    let octorateReservations: any[] = [];
    if (tokenData?.access_token) {
      try {
        const PAGE_SIZE = 200;
        // Map per deduplicare le prenotazioni a cavallo di più mesi (chiave: id o refer)
        const rawMap = new Map<string, any>();

        for (const chunk of bookingChunks) {
          let page = 0;
          let hasMore = true;

          while (hasMore && page < 5) {
            const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/366879?startDate=${chunk.chunkFrom}&endDate=${chunk.chunkTo}&type=STAY&size=${PAGE_SIZE}&page=${page}`;
            let octRes = await fetch(octUrl, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Accept': 'application/json'
              }
            });

            if (!octRes.ok) {
              const fallbackUrl = `https://api.octorate.com/connect/rest/v1/reservation?structure=366879&startDate=${chunk.chunkFrom}&endDate=${chunk.chunkTo}&type=STAY&size=${PAGE_SIZE}&page=${page}`;
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
              const items = octJson && Array.isArray(octJson.data) ? octJson.data : (Array.isArray(octJson) ? octJson : (octJson.reservations || []));
              if (items.length === 0) {
                hasMore = false;
                break;
              }

              for (const item of items) {
                const resKey = String(item.id || item.refer || item.reservationId || Math.random());
                if (!rawMap.has(resKey)) {
                  rawMap.set(resKey, item);
                }
              }

              console.log(`[api/resort/octorate-bookings] Chunk ${chunk.chunkFrom}->${chunk.chunkTo} Page ${page}: scaricate ${items.length} prenotazioni (totali uniche finora: ${rawMap.size}).`);
              if (items.length < PAGE_SIZE) {
                hasMore = false;
              } else {
                page++;
              }
            } else {
              console.warn(`[api/resort/octorate-bookings] Chunk ${chunk.chunkFrom}->${chunk.chunkTo} Page ${page} status ${octRes.status}`);
              hasMore = false;
            }
          }
        }

        const rawOctorateItems = Array.from(rawMap.values());
        octorateReservations = rawOctorateItems.map((r: any) => ({
          id: String(r.id || r.reservationId || r.refer || Math.random()),
          guest_name: r.guestName || r.guest_name || `${r.firstName || r.first_name || 'Ospite'} ${r.lastName || r.last_name || ''}`.trim(),
          guest_email: r.email || r.guestEmail || (r.guests && r.guests[0]?.email) || '',
          guest_phone: r.phone || (r.guests && r.guests[0]?.phone) || '',
          accommodation_id: String(r.product || r.roomTypeId || r.roomId || r.accommodation_id || ''),
          accommodation_name: r.roomName || r.accommodation_name || '',
          product: String(r.product || r.roomTypeId || ''),
          roomName: r.roomName || r.accommodation_name || '',
          check_in: String(r.checkin || r.check_in || r.checkIn || r.startDate || '').slice(0, 10),
          check_out: String(r.checkout || r.check_out || r.checkOut || r.endDate || '').slice(0, 10),
          checkin: String(r.checkin || r.check_in || r.checkIn || r.startDate || '').slice(0, 10),
          checkout: String(r.checkout || r.check_out || r.checkOut || r.endDate || '').slice(0, 10),
          guests: Number(r.totalGuest || r.pax || r.guestsCount || 2),
          total_price: Number(r.roomGross || r.totalGross || r.totalAmount || 0),
          deposit_paid: Number(r.deposit || 0),
          status: String(r.status || '').toUpperCase() === 'CANCELLED' ? 'cancelled' : 'confirmed',
          source_channel: r.channelName || r.ota || r.source_channel || r.channel || 'Booking.com',
          channelName: r.channelName || r.ota || r.source_channel || r.channel || 'Booking.com'
        }));
      } catch (octErr) {
        console.warn('[api/resort/octorate-bookings] Octorate reservations fetch notice:', octErr);
      }
    }

    const combinedBookings = [...(sbData || []), ...octorateReservations];
    console.log(`[BACKEND] Prenotazioni trovate dal ${reqDateFrom} al ${reqDateTo}:`, combinedBookings.length);

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

    // ─── Token refresh helper ────────────────────────────────────────────────
    const tryRefreshToken = async (): Promise<string | null> => {
      const clientId = process.env.VITE_OCTORATE_CLIENT_ID;
      const clientSecret = process.env.OCTORATE_SECRET_KEY;
      if (!refreshToken || !clientId || !clientSecret) return null;
      try {
        const refreshRes = await fetch('https://api.octorate.com/connect/rest/v1/identity/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
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
        console.warn('[api/resort/octorate-grid] Token refresh failed:', err);
      }
      return null;
    };

    // ─── Rate plan ID sets ───────────────────────────────────────────────────
    const MOTHER_RATE_IDS = new Set([
      529773, 495795, 495796, 494840, 421511, 293957, 293954, 293962,
      293965, 293955, 293963, 293959, 293948, 293945, 293943, 293951,
      883795, 293942
    ]);
    const targetIds = new Set([...OFFICIAL_BE_RATE_IDS, ...MOTHER_RATE_IDS]);

    // ─── Monthly chunk generator ─────────────────────────────────────────────
    // Octorate tronca le risposte al confine mensile.
    // Spezziamo la richiesta in chunk mensili e paghiniamo separatamente ognuno.
    const generateMonthlyChunks = (from: string, to: string): Array<{ chunkFrom: string; chunkTo: string }> => {
      const result: Array<{ chunkFrom: string; chunkTo: string }> = [];
      const start = new Date(from + 'T00:00:00Z');
      const end   = new Date(to   + 'T00:00:00Z');
      let cursor = new Date(start);
      while (cursor <= end) {
        const chunkFrom = cursor.toISOString().substring(0, 10);
        const lastDayOfMonth = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 0));
        const chunkTo = lastDayOfMonth <= end
          ? lastDayOfMonth.toISOString().substring(0, 10)
          : end.toISOString().substring(0, 10);
        result.push({ chunkFrom, chunkTo });
        cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
      }
      return result;
    };

    // ─── Esegui chunk per chunk con reset esplicito della paginazione (page=0) ───
    const chunks = generateMonthlyChunks(dateFrom, dateTo);
    console.log(`[OCTORATE GRID] Split in ${chunks.length} chunk/i: ${chunks.map(c => `${c.chunkFrom}->${c.chunkTo}`).join(', ')}`);

    const productQuery = [...targetIds].map(id => `product[]=${id}`).join('&');
    const PAGE_SIZE = 20;

    const mergedMap = new Map<string, { base: any; days: Map<string, any> }>();

    for (const chunk of chunks) {
      let page = 0; // DEVE ripartire da 0 per ogni mese/chunk!
      const chunkProducts: any[] = [];
      let hasMorePages = true;

      while (hasMorePages) {
        const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${chunk.chunkFrom}&dateTo=${chunk.chunkTo}&size=${PAGE_SIZE}&page=${page}&${productQuery}`;

        if (page === 0) {
          console.log(`[DEBUG OCTORATE CHUNK]: ${chunk.chunkFrom}->${chunk.chunkTo} (page 0) URL: ${url}`);
        }

        let response = await fetch(url, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' }
        });

        // Tenta refresh token al primo 401/403 (solo prima pagina del primo chunk)
        if ((response.status === 401 || response.status === 403) && page === 0 && chunk === chunks[0]) {
          const newTok = await tryRefreshToken();
          if (newTok) {
            accessToken = newTok;
            response = await fetch(url, {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${newTok}`, 'Accept': 'application/json' }
            });
          }
        }

        if (!response.ok) {
          console.warn(`[OCTORATE GRID] Chunk ${chunk.chunkFrom}->${chunk.chunkTo} page ${page} status ${response.status}`);
          hasMorePages = false;
          break;
        }

        const payload = await response.json();
        const pageItems: any[] = Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []);
        console.log(`[DEBUG OCTORATE RESPONSE]: Chunk ${chunk.chunkFrom}->${chunk.chunkTo} Page ${page} - Trovati ${pageItems.length} elementi.`);

        if (pageItems.length === 0) {
          hasMorePages = false;
          break;
        }

        // Accumula i rate plan di tutte le pagine (pagina 0 = BE, pagina 1 = Madre)
        chunkProducts.push(...pageItems);

        if (pageItems.length < PAGE_SIZE) {
          hasMorePages = false;
        } else {
          page++;
        }
      }

      // Merge di tutti i `chunkProducts` trovati per questo mese nel master map
      for (const item of chunkProducts) {
        const idStr = String(item.id);
        if (!mergedMap.has(idStr)) {
          mergedMap.set(idStr, { base: { ...item, days: undefined }, days: new Map() });
        }
        const entry = mergedMap.get(idStr)!;
        const itemDays: any[] = Array.isArray(item.days) ? item.days : [];
        for (const day of itemDays) {
          const dayKey = String(day.date || day.day || '').substring(0, 10);
          if (dayKey) entry.days.set(dayKey, day);
        }
      }
    }

    // Ricostruisce array finale con days mergiati e ordinati per data
    const mergedItems: any[] = [];
    for (const [, entry] of mergedMap) {
      const sortedDays = Array.from(entry.days.values()).sort((a, b) =>
        String(a.date || a.day || '').localeCompare(String(b.date || b.day || ''))
      );
      mergedItems.push({ ...entry.base, days: sortedDays });
    }

    const filteredBEItems = mergedItems.filter((item: any) => {
      const idNum = Number(item.id);
      const nameStr = String(item.name || '').toLowerCase();
      return OFFICIAL_BE_RATE_IDS.has(idNum) || MOTHER_RATE_IDS.has(idNum) || nameStr.endsWith('be') || nameStr.includes('booking engine');
    });

    const totalDays = filteredBEItems.reduce((acc: number, i: any) => acc + (i.days?.length || 0), 0);
    console.log(`[OCTORATE GRID] Merge completato. Rate plans: ${filteredBEItems.length}. Giorni totali: ${totalDays}. Periodo: ${dateFrom}->${dateTo}.`);

    // Log diagnostico: verifica giorni disponibili per Jungle Villa BE (ID 529784)
    const jvBEItem = filteredBEItems.find((i: any) => String(i.id) === '529784');
    console.log('[DEBUG BACKEND OCTORATE] Giorni estratti per Jungle Villa BE (529784):', jvBEItem ? (jvBEItem.days || []).map((d: any) => d.date).join(', ') : 'RATE PLAN NON TROVATO');

    return res.status(200).json({
      success: true,
      data: filteredBEItems,
      grid: filteredBEItems,
      totalFetched: mergedItems.length,
      chunksCount: chunks.length
    });
  } catch (error: any) {
    console.error('[OCTORATE GRID ERROR CRITICO]:', error);
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

  const { updates, resetToBaseline } = req.body || {};
  const updateItems = Array.isArray(updates) ? updates : [];

  // STAGING LOCK CHECK: Se DRY_RUN viene disattivato (false), rifiuta la scrittura se non per i due alloggi fittizi
  if (!DRY_RUN) {
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

  if (DRY_RUN) {
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
    const { data: tokenData } = await supabaseAdmin
      .from('octorate_tokens')
      .select('access_token')
      .eq('id', 'singleton')
      .maybeSingle();

    if (!tokenData?.access_token) {
      return res.status(400).json({ error: 'No Octorate access token available in database' });
    }

    const structureId = process.env.VITE_OCTORATE_STRUCTURE_ID || "366879";
    const octRes = await fetch(`https://api.octorate.com/connect/rest/v1/calendar/bulk`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        structure: Number(structureId),
        updates: updateItems
      })
    });

    if (!octRes.ok) {
      const errorText = await octRes.text();
      return res.status(octRes.status).json({ error: `Octorate bulk min-stay update failed: ${errorText}` });
    }

    const octResult = await octRes.json();
    return res.status(200).json({ success: true, dryRun: false, octResult });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Serverless min-stay execution error' });
  }
}
