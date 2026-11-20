import fs from "fs";
import path from "path";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { sendDepartmentTelegramMessage } from "../_helpers/telegram.js";
import { ALL_OCTORATE_STRUCTURE_IDS, OCTORATE_STRUCTURES, getOctorateStructureByRoomId } from "../_helpers/octorate-structures.js";
import { executeOctorateMove } from "../_helpers/octorate-move.js";
import { postOctorateCalendarBulkWithRetry } from "../_helpers/octorate-client.js";
import {
  computeStandbyKeepAlivePrice,
  expandMinStayEntryWithStandbyKeepAlive,
  getActiveJungleSource,
  getCompanionRateId,
  getJungleTwinPairByRateId,
  isLowSeasonKeepAliveDate,
  switchActiveJungleStructure,
  syncActiveToStandbyCalendar,
  JungleSourceStructureId
} from "../_helpers/octorate-jungle-mirror.js";
import {
  ClosedRoomLock,
  LOCKABLE_ROOMS,
  loadClosedRoomLocks,
  resolveLockableRoom,
  saveClosedRoomLocks,
  sealLockedRoomRangeOnOctorate
} from "../_helpers/octorate-closed-room-lock.js";

function getSupabaseAdmin() {
  let url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://gjqevgkbjkharczhikcl.supabase.co";
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!key) {
    try {
      for (const fileName of ['.env.local', '.env']) {
        const envPath = path.resolve(process.cwd(), fileName);
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, 'utf8');
          for (const line of content.split('\n')) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
              if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
                key = trimmed.replace('SUPABASE_SERVICE_ROLE_KEY=', '').trim().replace(/^["']|["']$/g, '');
              } else if (trimmed.startsWith('SUPABASE_URL=')) {
                if (!url) url = trimmed.replace('SUPABASE_URL=', '').trim().replace(/^["']|["']$/g, '');
              }
            }
          }
        }
        if (key) break;
      }
    } catch { }
  }

  return (url && key) ? createClient(url, key) : null;
}

const OFFICIAL_BE_RATE_IDS = new Set([
  529784, 495807, 495980, 495566, 960403, 960415, 960427, 960391,
  449348, 449385, 449422, 449668, 449675, 449674, 449678, 449684,
  449699, 449724, 449730, 449736, 923905, 449742, 932243, 932256
]);

// 1. handleOctorateExchange
export async function handleOctorateExchange(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseAdmin = getSupabaseAdmin();
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

  const supabaseAdmin = getSupabaseAdmin();
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

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase configuration missing' });
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

// 4. handleOctorateClientGet - SECURITY HARDENED
// Non espone MAI access_token o refresh_token a client non autorizzati.
// Restituisce solo lo stato di connessione booleano e data di aggiornamento.
export async function handleOctorateClientGet(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const internalSecret = req.headers['x-internal-secret'];
  const isAuthorized = process.env.INTERNAL_API_SECRET && internalSecret === process.env.INTERNAL_API_SECRET;

  const supabaseAdmin = getSupabaseAdmin();
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

    // Solo se fornito il segreto interno di sistema (es. script CLI o microservizio server)
    if (isAuthorized) {
      return res.status(200).json({ data });
    }

    // Risposta pubblica sicura: zero credenziali esposte
    const isConnected = Boolean(data?.access_token);
    return res.status(200).json({
      connected: isConnected,
      updated_at: data?.updated_at || null,
      data: {
        connected: isConnected,
        updated_at: data?.updated_at || null,
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

// 5. handleOctorateClientClear - SECURITY HARDENED
// Richiede tassativamente x-internal-secret per evitare cancellazioni non autorizzate.
export async function handleOctorateClientClear(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const internalSecret = req.headers['x-internal-secret'];
  if (!process.env.INTERNAL_API_SECRET || internalSecret !== process.env.INTERNAL_API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized: internal secret required to clear tokens' });
  }

  const supabaseAdmin = getSupabaseAdmin();
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

    return res.status(200).json({ success: true, message: 'Tokens cleared successfully' });
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

  const supabaseAdmin = getSupabaseAdmin();
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
        const pageSize = 50;
        const maxPages = 30;
        const rawById = new Map<string, { item: any; fetchedStructureId: string }>();

        await Promise.all(
          ALL_OCTORATE_STRUCTURE_IDS.map(async (structId) => {
            let page = 0;
            let hasMore = true;
            while (hasMore && page < maxPages) {
              const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/${structId}?type=STAY&startDate=${dateFrom}&endDate=${dateTo}&size=${pageSize}&page=${page}`;
              let octRes = await fetch(octUrl, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${tokenData.access_token}`,
                  'Accept': 'application/json'
                }
              });

              if (!octRes.ok) {
                const fallbackUrl = `https://api.octorate.com/connect/rest/v1/reservation?structure=${structId}&type=STAY&startDate=${dateFrom}&endDate=${dateTo}&size=${pageSize}&page=${page}`;
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
                  for (const item of pageItems) {
                    const idStr = String(item.id || item.reservationId || '');
                    if (!idStr) continue;
                    const prodId = item.product || item.roomTypeId || item.roomId || '';
                    const inferredStruct = item.accommodation?.id
                      ? String(item.accommodation.id)
                      : getOctorateStructureByRoomId(prodId).id;
                    const existing = rawById.get(idStr);
                    // Prefer the structure that actually owns the reservation/room
                    if (!existing || structId === inferredStruct) {
                      rawById.set(idStr, { item, fetchedStructureId: inferredStruct || structId });
                    }
                  }
                  if (pageItems.length < pageSize) {
                    hasMore = false;
                  } else {
                    page++;
                  }
                } else {
                  hasMore = false;
                }
              } else {
                console.warn(`[api/resort/octorate-bookings] Octorate API status ${octRes.status} for structure ${structId} on page ${page}`);
                hasMore = false;
              }
            }
          })
        );

        octorateReservations = Array.from(rawById.values()).map(({ item: r, fetchedStructureId }) => {
          const inStr = toThailandDateStr(r.checkin || r.check_in || r.checkIn || r.startDate);
          const outStr = toThailandDateStr(r.checkout || r.check_out || r.checkOut || r.endDate);
          const prodId = String(r.product || r.roomTypeId || r.roomId || r.accommodation_id || '');
          const structCfg = OCTORATE_STRUCTURES.find(s => s.id === fetchedStructureId) || getOctorateStructureByRoomId(prodId);
          return {
            id: String(r.id || r.reservationId || Math.random()),
            refer: r.refer ? String(r.refer) : undefined,
            guest_name: r.guestName || r.guest_name || `${r.firstName || r.first_name || 'Ospite'} ${r.lastName || r.last_name || ''}`.trim(),
            guest_email: r.guestMailAddress || r.email || r.guestEmail || r.customerEmail || (r.guests && r.guests[0]?.email) || (r.guests && r.guests[0]?.mailAddress) || '',
            guest_phone: r.phone || (r.guests && r.guests[0]?.phone) || '',
            accommodation_id: prodId,
            accommodation_name: r.roomName || r.accommodation_name || '',
            product: prodId,
            pmsProduct: r.pmsProduct ? String(r.pmsProduct) : undefined,
            roomName: r.roomName || r.accommodation_name || '',
            structure_id: structCfg.id,
            structureId: structCfg.id,
            structure_name: structCfg.name,
            check_in: inStr,
            check_out: outStr,
            checkin: inStr,
            checkout: outStr,
            guests: Number(r.totalGuest || r.pax || r.guestsCount || 2),
            total_price: Number(r.roomGross || r.totalGross || r.totalAmount || 0),
            deposit_paid: Number(r.deposit || r.totalPaid || 0),
            status: (['CANCELLED', 'CANCELED', 'DELETED', 'VOID', 'REJECTED'].includes(String(r.status || '').toUpperCase().trim()) || Boolean(r.cancelled || r.isCancelled)) ? 'cancelled' : 'confirmed',
            channelId: r.channelId !== undefined ? Number(r.channelId) : undefined,
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

// In-memory grid cache with 5-minute TTL for maximum speed and 100% uptime resilience
const gridCache = new Map<string, { timestamp: number; payload: any }>();
const CACHE_TTL_MS = 5 * 60 * 1000;
let lastGridStandbyAlignMs = 0;
const GRID_STANDBY_ALIGN_COOLDOWN_MS = 15 * 60 * 1000;

export function clearOctorateGridCache(): void {
  gridCache.clear();
}

// 7. handleOctorateGrid
export async function handleOctorateGrid(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const dateFrom = (req.query.dateFrom as string) || new Date().toISOString().substring(0, 10);
  const dateTo = req.query.dateTo as string;
  const structureId = process.env.VITE_OCTORATE_STRUCTURE_ID || "366879";
  const skipCache = req.query.nocache === '1' || req.query.nocache === 'true';

  if (!dateTo) {
    return res.status(400).json({ error: 'Missing dateTo query parameter' });
  }

  const cacheKey = `${structureId}_${dateFrom}_${dateTo}`;
  const cached = !skipCache ? gridCache.get(cacheKey) : undefined;
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return res.status(200).json(cached.payload);
  }

  try {
    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    if (supabaseAdmin) {
      const { data: tokenData } = await supabaseAdmin
        .from('octorate_tokens')
        .select('access_token, refresh_token')
        .eq('id', 'singleton')
        .maybeSingle();

      if (tokenData?.access_token) {
        accessToken = tokenData.access_token;
        refreshToken = tokenData.refresh_token;
      }
    }

    // Static fallback tokens if database is unreachable
    if (!accessToken) {
      accessToken = process.env.OCTORATE_ACCESS_TOKEN || "2c38b014603d469f99d0a414fb2573c3RKNXVBKIFV";
      refreshToken = process.env.OCTORATE_REFRESH_TOKEN || "4717539bfc7644ff820bfa1e0d5a36a1";
    }

    const fetchCalendarPageForStructure = async (token: string, structId: string, pageNum: number) => {
      const url = `https://api.octorate.com/connect/rest/v1/calendar/${structId}?dateFrom=${dateFrom}&dateTo=${dateTo}&size=20&page=${pageNum}`;
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
      const clientSecret = process.env.OCTORATE_SECRET_KEY || process.env.VITE_OCTORATE_SECRET_KEY;

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
          if (supabaseAdmin) {
            await supabaseAdmin.from('octorate_tokens').upsert({
              id: 'singleton',
              access_token: newTokens.access_token,
              refresh_token: newTokens.refresh_token || refreshToken,
              expires_in: newTokens.expires_in,
              updated_at: new Date().toISOString()
            });
          }
          return newTokens.access_token;
        }
      } catch (err) {
        console.warn("[api/resort/octorate-grid] Token refresh failed:", err);
      }
      return null;
    };

    const MOTHER_RATE_IDS = new Set([
      529773, 495795, 495796, 494840, 960383, 960385, 960387, 960389,
      421511, 293957, 293954, 293962,
      293965, 293955, 293963, 293959, 293948, 293945, 293943, 293951,
      883795, 293942, 649669, 921799
    ]);

    const targetIds = new Set([...OFFICIAL_BE_RATE_IDS, ...MOTHER_RATE_IDS]);

    // 🌟 MULTI-STRUTTURA: Se l'utente specifica un singolo structureId (es. query), interroghiamo solo quello, altrimenti tutti e 3 in parallelo
    const requestedStructure = (req.query.structureId as string) || (req.query.resortId as string);
    const targetStructures = requestedStructure ? [requestedStructure] : ALL_OCTORATE_STRUCTURE_IDS;

    const allFetchedItems: any[] = [];
    const PAGE_SIZE = 20;
    const MAX_PAGES = 15; // per singola struttura

    // Chiamata parallela per le strutture target
    await Promise.all(targetStructures.map(async (structId) => {
      let page = 0;
      while (page < MAX_PAGES) {
        let response = await fetchCalendarPageForStructure(accessToken, structId, page);

        if ((response.status === 401 || response.status === 403) && page === 0) {
          const newTok = await tryRefreshToken();
          if (newTok) {
            accessToken = newTok;
            response = await fetchCalendarPageForStructure(accessToken, structId, page);
          }
        }

        if (!response.ok) {
          console.warn(`[api/resort/octorate-grid] Struct ${structId} Page ${page} returned status ${response.status}`);
          break;
        }

        const payload = await response.json();
        const pageItems = payload && Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []);

        if (pageItems.length === 0) {
          break;
        }

        for (const item of pageItems) {
          item._structureId = structId;
        }
        allFetchedItems.push(...pageItems);

        if (pageItems.length < PAGE_SIZE) {
          break;
        }

        page++;
      }
    }));

    // Nascondi le 4 ville della struttura in standby per evitare duplicati nel calendario 30/365 giorni,
    // ma estrai le 4 Madri gemelle in standby per l'ispezione opzionale "Mostra Gemelle Standby (4)" in dashboard
    const activeJungleSource = await getActiveJungleSource(supabaseAdmin);

    // 🔄 Auto-allineamento prezzi 4 Madri Standby -> Madre Attiva (copre modifiche manuali sul portale Octorate anche oltre i 7gg)
    if (!requestedStructure && accessToken) {
      if (Date.now() - lastGridStandbyAlignMs >= GRID_STANDBY_ALIGN_COOLDOWN_MS) {
        lastGridStandbyAlignMs = Date.now();
        try {
          const itemByRateId = new Map<number, any>();
          for (const it of allFetchedItems) {
            const idNum = Number(it?.id);
            if (idNum) itemByRateId.set(idNum, it);
          }

          const addOneDay = (iso: string) => {
            const [y, m, d] = iso.split('-').map(Number);
            const dt = new Date(Date.UTC(y, (m || 1) - 1, (d || 1) + 1));
            return dt.toISOString().slice(0, 10);
          };

          const priceDiffBlocks: Array<{ room: number; dateFrom: string; dateTo: string; values: { price: number } }> = [];
          for (const it of allFetchedItems) {
            const standbyId = Number(it?.id);
            const pair = getJungleTwinPairByRateId(standbyId);
            if (!pair || !pair.isMother) continue;
            const isStandby = activeJungleSource === '807324'
              ? pair.fpvId === standbyId
              : pair.jungleId === standbyId;
            if (!isStandby) continue;

            const activeId = getCompanionRateId(standbyId);
            const activeItem = activeId ? itemByRateId.get(activeId) : null;
            if (!activeItem || !Array.isArray(activeItem.days)) continue;

            const standbyDayMap = new Map<string, any>();
            for (const sDay of (Array.isArray(it.days) ? it.days : [])) {
              const dStr = String(sDay?.date || '').slice(0, 10);
              if (dStr) standbyDayMap.set(dStr, sDay);
            }

            const diffDays: Array<{ date: string; price: number }> = [];
            for (const aDay of activeItem.days) {
              const dStr = String(aDay?.date || '').slice(0, 10);
              const activePrice = Number(aDay?.price ?? 0);
              if (!dStr || activePrice <= 0) continue;

              const expectedStandbyPrice =
                activeJungleSource === '366879' && isLowSeasonKeepAliveDate(dStr)
                  ? computeStandbyKeepAlivePrice(activePrice, pair.key)
                  : activePrice;

              const sDay = standbyDayMap.get(dStr);
              const standbyPrice = Number(sDay?.price ?? 0);
              if (Math.abs(standbyPrice - expectedStandbyPrice) > 0.01) {
                if (sDay) sDay.price = expectedStandbyPrice;
                diffDays.push({ date: dStr, price: expectedStandbyPrice });
              }
            }

            diffDays.sort((a, b) => a.date.localeCompare(b.date));
            let blockFrom = '';
            let blockTo = '';
            let blockPrice = -1;
            for (const dd of diffDays) {
              if (!blockFrom) {
                blockFrom = dd.date;
                blockTo = dd.date;
                blockPrice = dd.price;
              } else if (dd.date === blockTo && dd.price === blockPrice) {
                continue;
              } else if (dd.date === addOneDay(blockTo) && dd.price === blockPrice) {
                blockTo = dd.date;
              } else {
                priceDiffBlocks.push({ room: standbyId, dateFrom: blockFrom, dateTo: blockTo, values: { price: blockPrice } });
                blockFrom = dd.date;
                blockTo = dd.date;
                blockPrice = dd.price;
              }
            }
            if (blockFrom) {
              priceDiffBlocks.push({ room: standbyId, dateFrom: blockFrom, dateTo: blockTo, values: { price: blockPrice } });
            }
          }

          if (priceDiffBlocks.length > 0) {
            console.log(`[OCTORATE GRID] Rilevate ${priceDiffBlocks.length} discrepanze prezzi sulle 4 Madri Standby -> riallineamento automatico Octorate...`);
            for (let i = 0; i < priceDiffBlocks.length; i += 150) {
              const chunk = priceDiffBlocks.slice(i, i + 150);
              const bulkRes = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                  Accept: 'application/json'
                },
                body: JSON.stringify(chunk)
              });
              if (!bulkRes.ok) {
                const errTxt = await bulkRes.text().catch(() => '');
                console.warn(`[OCTORATE GRID] Standby auto-align chunk ${i / 150 + 1} HTTP ${bulkRes.status}: ${errTxt.slice(0, 150)}`);
              }
            }
          }
        } catch (alignErr) {
          console.warn('[OCTORATE GRID] Standby twin price auto-align warning:', alignErr);
        }
      }
    }
    const visibleItems = allFetchedItems.filter((item: any) => {
      const idNum = Number(item.id);
      if (activeJungleSource === '807324') {
        return !(item._structureId === '366879' && idNum >= 960378 && idNum <= 960438);
      }
      // activeJungleSource === '366879': nascondi tutta 807324 (che contiene solo le 4 ville)
      return item._structureId !== '807324';
    });

    const standbyTwins = allFetchedItems
      .filter((item: any) => {
        const idNum = Number(item.id);
        const pair = getJungleTwinPairByRateId(idNum);
        if (!pair || !pair.isMother) return false;
        return activeJungleSource === '807324'
          ? pair.fpvId === idNum
          : pair.jungleId === idNum;
      })
      .map((item: any) => {
        const idNum = Number(item.id);
        const pair = getJungleTwinPairByRateId(idNum)!;
        return {
          id: idNum,
          companionActiveId: getCompanionRateId(idNum),
          key: pair.key,
          name: item.name || pair.label,
          structureId: item._structureId || (activeJungleSource === '807324' ? '366879' : '807324'),
          days: Array.isArray(item.days) ? item.days : []
        };
      });

    const filteredBEItems = visibleItems.filter((item: any) => {
      const idNum = Number(item.id);
      const nameStr = String(item.name || '').toLowerCase();
      return OFFICIAL_BE_RATE_IDS.has(idNum) || MOTHER_RATE_IDS.has(idNum) || nameStr.endsWith('be') || nameStr.includes('booking engine');
    });

    console.log(`[OCTORATE GRID] Scaricati ${allFetchedItems.length} rate plans, visibili ${visibleItems.length} (activeJungle=${activeJungleSource}). Filtrati ${filteredBEItems.length} BE/Mother dal ${dateFrom} al ${dateTo}.`);

    const responsePayload = {
      success: true,
      activeJungleSource,
      data: visibleItems,
      grid: visibleItems,
      beGrid: filteredBEItems,
      standbyTwins,
      totalFetched: visibleItems.length,
      structuresQueried: targetStructures.length
    };

    gridCache.set(cacheKey, { timestamp: Date.now(), payload: responsePayload });

    return res.status(200).json(responsePayload);
  } catch (error: any) {
    console.error("[OCTORATE GRID ERROR CRITICO]:", error);
    const staleCached = gridCache.get(cacheKey);
    if (staleCached) {
      console.log(`[Octorate Grid] Serving stale cached response for ${cacheKey}`);
      return res.status(200).json(staleCached.payload);
    }
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

  const { updates, resetToBaseline, dryRun, executionMode, isTestEnvironment } = req.body || {};
  const updateItems = Array.isArray(updates) ? updates : [];
  const isSimulation = dryRun !== undefined ? Boolean(dryRun) : (executionMode === 'simulation' || DRY_RUN);

  // STAGING LOCK CHECK: Se siamo in AMBIENTE DI TEST (test_bungalows / isTestEnvironment), consentiamo la scrittura solo per gli alloggi fittizi
  if (!isSimulation && (executionMode === 'test_bungalows' || isTestEnvironment)) {
    const invalidTarget = updateItems.find((item: any) => {
      const idStr = String(item.roomTypeId || item.motherId || item.id || item.octorateId || item.room || '');
      return !STAGING_LOCK_IDS.has(idStr);
    });

    if (invalidTarget) {
      const targetId = String(invalidTarget.roomTypeId || invalidTarget.motherId || invalidTarget.id || invalidTarget.octorateId);
      console.error(`[STAGING LOCK BLOCKED] Tentativo di scrittura in test_bungalows bloccato per l'alloggio non-staging ID ${targetId}`);
      return res.status(403).json({
        error: `Staging Lock Attivo: La scrittura reale in ambiente di test è consentita esclusivamente per gli alloggi fittizi #649669 e #921799. Target bloccato: ${targetId}`,
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

  // Esecuzione Scrittura Reale Octorate (Produzione o Ambiente di Test)
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Supabase configuration missing' });
    }

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

    const activeJungleSource = await getActiveJungleSource(supabaseAdmin);
    const roomsPayloadMap = new Map<string, any>();
    for (const item of updateItems) {
      const primaryRoom = Number(item.roomTypeId || item.motherId || item.id || item.octorateId || item.room);
      const df = item.dateFrom || item.date || item.from_date || item.startDate;
      const dt = item.dateTo || item.to_date || item.endDate;
      const ms = Number(item.minStay || item.min_stay || item.minimumStay || 2);

      for (const seg of expandMinStayEntryWithStandbyKeepAlive(primaryRoom, df, dt, ms, activeJungleSource)) {
        roomsPayloadMap.set(`${seg.room}_${seg.dateFrom}_${seg.dateTo}`, seg);
      }

      const companionId = getCompanionRateId(primaryRoom);
      if (companionId) {
        for (const seg of expandMinStayEntryWithStandbyKeepAlive(companionId, df, dt, ms, activeJungleSource)) {
          roomsPayloadMap.set(`${seg.room}_${seg.dateFrom}_${seg.dateTo}`, seg);
        }
      }
    }
    const roomsPayload = Array.from(roomsPayloadMap.values());

    // Invio sincronizzazione sequenziale con backoff anti-quota per Octorate API
    const chunkSize = 250;
    const chunks: any[][] = [];
    for (let c = 0; c < roomsPayload.length; c += chunkSize) {
      chunks.push(roomsPayload.slice(c, c + chunkSize));
    }

    if (chunks.length > 0) {
      const { lastStatus, succeededItems } = await postOctorateCalendarBulkWithRetry(
        {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        chunks,
        {
          interBatchDelayMs: 900,
          quotaRetryDelayMs: 2500,
          maxQuotaRetries: 2,
          logPrefix: '[handleOctorateMinStay]'
        }
      );
      if (succeededItems === 0 && lastStatus >= 400) {
        throw new Error(`Octorate MinStay bulk failed (HTTP ${lastStatus})`);
      }
    }
    clearOctorateGridCache();

    const isTest = executionMode === 'test_bungalows' || isTestEnvironment;
    const modeLabel = isTest ? 'Ambiente di Test (Fake Bungalows)' : 'Produzione Reale Resort';

    // 📲 [TELEGRAM NOTIFICATION] Notifica manuale/dashboard Minimo Notti Dinamico
    try {
      const roomsAffected = [...new Set(updateItems.map((u: any) => u.accommodationName || u.name).filter(Boolean))];
      const tgMsg = `📏 <b>[Soggiorno Minimo Dinamico]</b>\n` +
        `🏨 <b>Sincronizzazione Octorate Completata</b>\n\n` +
        `⚙️ Modalità: <b>${isTest ? '🧪 Ambiente di Test' : '🌐 Produzione Reale Resort'}</b>\n` +
        `📊 Aggiornamenti inviati: <b>${roomsPayload.length} blocchi</b> (${chunks.length} batch)\n` +
        `🛏️ Alloggi coinvolti: <b>${roomsAffected.length}</b>\n` +
        `✅ Valori MinStay applicati su Octorate PMS.`;
      sendDepartmentTelegramMessage('village', tgMsg, { topic: 'DAILY_REPORT' }).catch(err => {
        console.warn('[handleOctorateMinStay] Telegram alert warning:', err);
      });
    } catch (tgErr) {
      console.warn('[handleOctorateMinStay] Telegram notification error:', tgErr);
    }

    return res.status(200).json({
      success: true,
      dryRun: false,
      message: `Sincronizzazione Soggiorno Minimo ${modeLabel} completata su Octorate (${roomsPayload.length} blocchi inviati su ${chunks.length} batch)`,
      updatesCount: roomsPayload.length,
      chunksCount: chunks.length
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Serverless min-stay execution error' });
  }
}

// 9. handleOctorateEnrichEmails — Recupera le email cifrate alias OTA (guestMailAddress) dai singoli dettagli prenotazione
export async function handleOctorateEnrichEmails(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase configuration missing' });
  }

  const { data: tokenData } = await supabaseAdmin
    .from('octorate_tokens')
    .select('*')
    .eq('id', 'singleton')
    .maybeSingle();

  if (!tokenData?.access_token) {
    return res.status(500).json({ error: 'Octorate access token not found' });
  }

  const token = tokenData.access_token;
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const ids: (number | string)[] = Array.isArray(body.ids) ? body.ids.filter(Boolean) : [];
  const structureMap: Record<string, string> = (body.structureMap && typeof body.structureMap === 'object') ? body.structureMap : {};

  if (ids.length === 0) {
    return res.status(400).json({ error: 'Nessun ID prenotazione fornito' });
  }

  // Limite aumentato a 400 prenotazioni per batch (concorrenza 25 per completare 300 ID in ~8s)
  const targetIds = ids.slice(0, 400);
  const contacts: Record<string, { email: string; phone: string }> = {};

  const concurrency = 25;
  for (let i = 0; i < targetIds.length; i += concurrency) {
    const chunk = targetIds.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async (id) => {
        try {
          const preferredStruct = structureMap[String(id)] || '366879';
          const structsToTry = [preferredStruct, ...ALL_OCTORATE_STRUCTURE_IDS.filter(s => s !== preferredStruct)];
          for (const structId of structsToTry) {
            const detailRes = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/${structId}/${id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            });
            if (detailRes.ok) {
              const dJson = await detailRes.json();
              const email = (dJson.guestMailAddress || dJson.email || dJson.guestEmail || (dJson.guests && dJson.guests[0]?.email) || '').trim().toLowerCase();
              const phone = (dJson.phone || (dJson.guests && dJson.guests[0]?.phone) || '').trim();
              contacts[String(id)] = { email, phone };
              break;
            }
          }
        } catch (err) {
          console.warn(`[enrichEmails] Errore recupero ID ${id}:`, err);
        }
      })
    );
  }

  return res.status(200).json({
    success: true,
    count: Object.keys(contacts).length,
    contacts
  });
}

// 10. handleOctorateMoveReservation — Sposta una prenotazione tra alloggi (stessa struttura o cross-struttura Octorate)
export async function handleOctorateMoveReservation(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase configuration missing' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  try {
    const result = await executeOctorateMove({
      reservationId: String(body.reservationId || '').trim(),
      sourceStructureId: String(body.sourceStructureId || '').trim(),
      targetStructureId: String(body.targetStructureId || '').trim(),
      targetProductId: Number(body.targetProductId || 0),
      targetRoomName: String(body.targetRoomName || '').trim(),
      otaSourceAction: body.otaSourceAction === 'move_to_fake' ? 'move_to_fake' : 'note_only',
      holdingProductId: Number(body.holdingProductId || 649669),
      dryRun: Boolean(body.dryRun)
    }, supabaseAdmin);
    return res.status(result.status).json(result.body);
  } catch (error: any) {
    console.error('[moveReservation] Error:', error);
    return res.status(500).json({ error: error.message || 'Errore interno spostamento prenotazione' });
  }
}

// 11. handleOctorateJungleMirror — Stato attivo/standby, sync calendario bilaterale e switch sicuro 807324 <-> 366879
export async function handleOctorateJungleMirror(req: VercelRequest, res: VercelResponse) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase configuration missing' });
  }

  if (req.method === 'GET') {
    const active = await getActiveJungleSource(supabaseAdmin);
    return res.status(200).json({
      success: true,
      activeJungleSource: active,
      standbyJungleSource: active === '807324' ? '366879' : '807324'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data: tokenData } = await supabaseAdmin
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  if (!tokenData?.access_token) {
    return res.status(500).json({ error: 'Octorate access token not found' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const action = String(body.action || 'sync');

  try {
    if (action === 'switch') {
      const target = String(body.targetStructureId || '') as JungleSourceStructureId;
      if (target !== '807324' && target !== '366879') {
        return res.status(400).json({ error: 'targetStructureId must be 807324 or 366879' });
      }
      const result = await switchActiveJungleStructure(supabaseAdmin, tokenData.access_token, target);
      gridCache.clear();
      return res.status(200).json(result);
    }

    const daysAhead = Number(body.daysAhead || 365);
    const result = await syncActiveToStandbyCalendar(supabaseAdmin, tokenData.access_token, { daysAhead, force: true });
    gridCache.clear();
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[octorate-jungle-mirror] Error:', error);
    return res.status(500).json({ error: error.message || 'Jungle mirror sync error' });
  }
}

// 12. handleOctorateClosedRoomLocks — Gestione Hard-Lock Stanze Chiuse (Anti-Riapertura su cancellazione/riduzione)
export async function handleOctorateClosedRoomLocks(req: VercelRequest, res: VercelResponse) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase configuration missing' });
  }

  try {
    if (req.method === 'GET') {
      const locks = await loadClosedRoomLocks(supabaseAdmin);
      return res.status(200).json({
        success: true,
        locks,
        rooms: LOCKABLE_ROOMS.map(r => ({
          roomKey: r.roomKey,
          motherId: r.motherId,
          name: r.name,
          productsCount: r.productIds.length
        }))
      });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const locks = await loadClosedRoomLocks(supabaseAdmin);

    if (req.method === 'DELETE' || body.action === 'delete') {
      const lockId = String(body.id || req.query?.id || '').trim();
      if (!lockId) {
        return res.status(400).json({ error: 'id mancante per rimuovere il lock' });
      }
      const nextLocks = locks.filter(l => l.id !== lockId);
      await saveClosedRoomLocks(supabaseAdmin, nextLocks);
      return res.status(200).json({ success: true, locks: nextLocks });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const action = String(body.action || 'upsert');

    if (action === 'toggle') {
      const lockId = String(body.id || '').trim();
      const nextLocks = locks.map(l =>
        l.id === lockId ? { ...l, enabled: body.enabled !== undefined ? Boolean(body.enabled) : !l.enabled, updatedAt: new Date().toISOString() } : l
      );
      await saveClosedRoomLocks(supabaseAdmin, nextLocks);
      return res.status(200).json({ success: true, locks: nextLocks });
    }

    const room = resolveLockableRoom(body.roomKey || body.motherId || body.roomName);
    if (!room) {
      return res.status(400).json({ error: 'Alloggio non valido per Hard-Lock' });
    }

    const dateFrom = String(body.dateFrom || '').slice(0, 10);
    const dateTo = String(body.dateTo || '').slice(0, 10);
    if (!dateFrom || !dateTo || dateFrom > dateTo) {
      return res.status(400).json({ error: 'Intervallo date non valido (dateFrom <= dateTo)' });
    }

    const lockId = `${room.roomKey}_${dateFrom}_${dateTo}`;
    const newLock: ClosedRoomLock = {
      id: lockId,
      roomKey: room.roomKey,
      motherId: room.motherId,
      roomName: room.name,
      dateFrom,
      dateTo,
      reason: body.reason ? String(body.reason).slice(0, 140) : 'Chiusura protetta (Anti-Riapertura)',
      enabled: true,
      updatedAt: new Date().toISOString()
    };

    const nextLocks = [...locks.filter(l => l.id !== lockId), newLock];
    await saveClosedRoomLocks(supabaseAdmin, nextLocks);

    let sealResult = { sealedEntries: 0, sealedDatesCount: 0, lastStatus: 200 };
    if (body.sealNow !== false) {
      const { data: tokenData } = await supabaseAdmin
        .from('octorate_tokens')
        .select('access_token')
        .eq('id', 'singleton')
        .maybeSingle();

      if (tokenData?.access_token) {
        const clientId = process.env.VITE_OCTORATE_CLIENT_ID || process.env.OCTORATE_CLIENT_ID || '';
        sealResult = await sealLockedRoomRangeOnOctorate({
          accessToken: tokenData.access_token,
          clientId,
          roomKeyOrId: room.roomKey,
          dateFrom,
          dateTo,
          logPrefix: '[ADMIN HARD-LOCK]'
        });
        gridCache.clear();
      }
    }

    return res.status(200).json({
      success: true,
      lock: newLock,
      locks: nextLocks,
      sealResult
    });
  } catch (error: any) {
    console.error('[octorate-closed-room-locks] Error:', error);
    return res.status(500).json({ error: error.message || 'Errore gestione Hard-Lock stanze chiuse' });
  }
}
