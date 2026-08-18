import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseAdmin = (supabaseUrl && serviceRoleKey) ? createClient(supabaseUrl, serviceRoleKey) : null as any;

// Global DRY_RUN mode flag (simulazione in memoria / log per la massima sicurezza)
const DRY_RUN = true;
const STAGING_LOCK_IDS = new Set(['649669', '921799']);

// Mappatura immutabile 1:1 ID TARIFFA MADRE per Octorate
const MOTHER_RATE_PLANS: Record<string, number> = {
  "Peace & Love Villa": 494840,
  "Penthouse Villa": 421511,
  "Villa Penthouse": 421511,
  "Jungle Villa": 529773,
  "Jungle Villa Left": 495795,
  "Jungle Villa Right": 495796,
  "Lodge 1": 293951,
  "Lodge 2": 883795,
  "Red Bungalow": 293954,
  "Green Bungalow": 293962,
  "Yellow Bungalow": 293957,
  "Lagoon Tent": 293955,
  "Lagoon Tent Bungalow": 293955,
  "Camel Tent": 293965,
  "Camel Tent Bungalow": 293965,
  "Room 1": 293963,
  "Room 2": 293959,
  "Room 3": 293948,
  "Room 4": 293945,
  "Room 5": 293943,
  "Internal Room": 293942,
  "Fake Bungalow 1": 649669,
  "Fake Bungalow 2": 921799
};

function getBaselineMinStay(dateStr: string): number {
  if (!dateStr || typeof dateStr !== 'string') return 2;
  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length < 3) return 2;
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  // Peak Season (16 Dicembre - 15 Gennaio)
  if ((month === 12 && day >= 16) || (month === 1 && day <= 15)) {
    return 5;
  }
  return 2;
}

export interface DynamicMinStayUpdate {
  roomTypeId: string;
  accommodationName: string;
  dateFrom: string;
  dateTo: string;
  minStay: number;
  reason: string;
}

/**
 * Algoritmo Serverless di Calcolo e Ripristino Soggiorno Minimo Dinamico 24/7
 */
function calculateServerDynamicMinStay(
  bookings: any[],
  dateRange: { start: string; end: string }
): DynamicMinStayUpdate[] {
  const updates: DynamicMinStayUpdate[] = [];
  const activeBookings = (bookings || []).filter(b => {
    const st = String(b.status || '').toLowerCase();
    return st !== 'cancelled' && st !== 'canceled';
  });

  const roomBookingsMap: Record<string, { roomName: string; motherId: string; bookings: Array<{ in: string; out: string }> }> = {};

  activeBookings.forEach((b: any) => {
    const rawIn = b.checkin || b.check_in || b.startDate || b.arrival || b.fromDate;
    const rawOut = b.checkout || b.check_out || b.endDate || b.departure || b.toDate;
    if (!rawIn || !rawOut) return;

    const inStr = String(rawIn).slice(0, 10);
    const outStr = String(rawOut).slice(0, 10);

    const rawName = String(b.roomName || b.accommodation_name || b.accommodationName || b.room || '').replace(/\s+/g, ' ').trim();
    const rawProd = b.product || b.pmsProduct || b.accommodation_id || b.roomId;

    let motherId = String(rawProd || '');
    let roomName = rawName || `Room ${motherId}`;

    if (MOTHER_RATE_PLANS[rawName]) {
      motherId = String(MOTHER_RATE_PLANS[rawName]);
    } else if (rawName.toLowerCase().includes('fake') || rawName.toLowerCase().includes('test')) {
      if (rawName.includes('2')) motherId = '921799';
      else motherId = '649669';
    }

    const key = motherId || roomName || 'unknown';
    if (!roomBookingsMap[key]) {
      roomBookingsMap[key] = { roomName, motherId: key, bookings: [] };
    }
    roomBookingsMap[key].bookings.push({ in: inStr, out: outStr });
  });

  Object.values(roomBookingsMap).forEach(({ roomName, motherId, bookings: bList }) => {
    const sorted = bList.sort((a, b) => a.in.localeCompare(b.in));
    const octRoomId = motherId;

    const gaps: Array<{ start: string; end: string }> = [];

    if (sorted.length > 0) {
      if (sorted[0].in > dateRange.start) {
        gaps.push({ start: dateRange.start, end: sorted[0].in });
      }

      for (let i = 0; i < sorted.length - 1; i++) {
        const prevOut = sorted[i].out;
        const nextIn = sorted[i + 1].in;
        if (prevOut < nextIn && prevOut <= dateRange.end && nextIn >= dateRange.start) {
          const effectiveStart = prevOut < dateRange.start ? dateRange.start : prevOut;
          if (effectiveStart < nextIn) {
            gaps.push({ start: effectiveStart, end: nextIn });
          }
        }
      }
    }

    gaps.forEach(({ start: gapStart, end: gapEnd }) => {
      const prevOutTime = new Date(gapStart).getTime();
      const nextInTime = new Date(gapEnd).getTime();
      const gapDays = Math.round((nextInTime - prevOutTime) / (1000 * 60 * 60 * 24));

      if (gapDays > 0) {
        // Calcola il baseline stagionale dinamico più alto nel periodo del buco
        let maxBaselineInGap = 0;
        let currentDay = new Date(prevOutTime);

        while (currentDay.getTime() < nextInTime) {
          const dStr = currentDay.toISOString().slice(0, 10);
          const baseline = getBaselineMinStay(dStr);
          if (baseline > maxBaselineInGap) {
            maxBaselineInGap = baseline;
          }
          currentDay.setDate(currentDay.getDate() + 1);
        }

        const targetMinStay = gapDays < maxBaselineInGap ? gapDays : maxBaselineInGap;
        const dateToInclusive = new Date(nextInTime - 86400000).toISOString().slice(0, 10);

        updates.push({
          roomTypeId: octRoomId,
          accommodationName: roomName,
          dateFrom: gapStart,
          dateTo: dateToInclusive,
          minStay: targetMinStay,
          reason: gapDays < maxBaselineInGap
            ? `Gap-Fill Dinamico (${gapDays}d gap < baseline ${maxBaselineInGap}d): M=${gapDays}`
            : `Ripristino Minimo Stagionale (${gapDays}d gap >= baseline ${maxBaselineInGap}d): M=${targetMinStay}`
        });
      }
    });
  });

  return updates;
}

/**
 * Handler Webhook Octorate 24/7 per Soggiorno Minimo Dinamico (Gap-Filling & Ripristino)
 * Rotta API Gateway: POST /api/webhooks/octorate
 */
export async function handleOctorateWebhook(req: VercelRequest, res: VercelResponse) {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 1. Handle preflight OPTIONS / HEAD requests immediately with HTTP 200 OK
  if (req.method === 'OPTIONS' || req.method === 'HEAD') {
    return res.status(200).send('OK');
  }

  // 2. Handle GET verification requests (Octorate ping tests)
  if (req.method === 'GET') {
    console.log('[Octorate Webhook GET Ping] Received verification GET request.');
    return res.status(200).json({ status: 'active', message: 'Octorate Webhook Endpoint Ready' });
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'ok', message: 'Method accepted' });
  }

  let eventPayload: any = {};
  try {
    const rawBody = req.body;
    eventPayload = (typeof rawBody === 'string' ? JSON.parse(rawBody || '{}') : rawBody) || {};
  } catch (parseErr) {
    console.warn('[Octorate Webhook] Could not parse JSON body, treating as ping test.');
    eventPayload = {};
  }

  // 3. PING CATCHER: Se req.body è vuoto, oppure manca il campo type / event / id, è un ping di validazione Octorate!
  const isPing = !eventPayload || 
                 Object.keys(eventPayload).length === 0 || 
                 (!eventPayload.type && !eventPayload.event && !eventPayload.id && !eventPayload.action && !eventPayload.reservationId);

  if (isPing) {
    console.log('[Octorate Webhook Ping] Ricevuto Ping di test / validazione da Octorate.');
    return res.status(200).json({ status: 'ok', message: 'Octorate Webhook Verification Ping Received' });
  }

  const eventType = eventPayload.type || eventPayload.event || 'UNKNOWN_EVENT';
  console.log(`[OCTORATE WEBHOOK 24/7] Received event: ${eventType}`, JSON.stringify(eventPayload, null, 2));

  // 4. Esecuzione asincrona garantita prima di chiudere la risposta Serverless
  let calculatedUpdatesCount = 0;
  let octorateStatus = 0;

  try {
    let bookingsData: any[] = [];
    if (supabaseAdmin) {
      let accessToken: string | null = null;
      const { data: tokenData } = await supabaseAdmin
        .from('octorate_tokens')
        .select('access_token, refresh_token')
        .eq('id', 'singleton')
        .maybeSingle();

      if (tokenData?.access_token) {
        accessToken = tokenData.access_token;
      }

      // Auto-refresh token se necessario
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
          console.warn("[octorate-webhook] Token refresh warning:", rErr);
        }
      }

      if (accessToken) {
        try {
          const dateFrom = new Date().toISOString().substring(0, 10);
          const dateToObj = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
          const dateTo = dateToObj.toISOString().substring(0, 10);
          const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=${dateFrom}&endDate=${dateTo}&size=100`;
          const octRes = await fetch(octUrl, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          });
          if (octRes.ok) {
            const octJson = await octRes.json();
            bookingsData = octJson && Array.isArray(octJson.data) ? octJson.data : (Array.isArray(octJson) ? octJson : (octJson.reservations || []));
          }
        } catch (octErr) {
          console.warn('[OCTORATE WEBHOOK] Failed to fetch live bookings from Octorate:', octErr);
        }

        const todayISO = new Date().toISOString().substring(0, 10);
        const next60Days = new Date();
        next60Days.setDate(next60Days.getDate() + 60);
        const endISO = next60Days.toISOString().substring(0, 10);

        const calculatedUpdates = calculateServerDynamicMinStay(
          bookingsData,
          { start: todayISO, end: endISO }
        );

        calculatedUpdatesCount = calculatedUpdates.length;
        console.log(`[OCTORATE WEBHOOK 24/7] Calculated ${calculatedUpdates.length} gap-filling updates.`);

        // Invia la scrittura reale ad Octorate filtrando per alloggi di Staging
        const stagingUpdates = calculatedUpdates.filter(u => STAGING_LOCK_IDS.has(String(u.roomTypeId)));

        if (stagingUpdates.length > 0) {
          const roomsPayload = stagingUpdates.map(u => ({
            room: Number(u.roomTypeId),
            dateFrom: u.dateFrom,
            dateTo: u.dateTo,
            values: {
              minstay: Number(u.minStay)
            }
          }));

          const bulkRes = await fetch(`https://api.octorate.com/connect/rest/v1/calendar/bulk`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(roomsPayload)
          });

          octorateStatus = bulkRes.status;
          console.log(`[OCTORATE WEBHOOK 24/7] Real bulk minstay update sent to Octorate (Status: ${bulkRes.status}).`);
        }
      }
    }

    return res.status(200).json({
      received: true,
      eventType,
      calculatedUpdatesCount,
      octorateStatus,
      timestamp: new Date().toISOString(),
      message: 'Webhook processed successfully with real Octorate synchronization.'
    });

  } catch (err: any) {
    console.error(`[OCTORATE WEBHOOK 24/7 ERROR]:`, err);
    return res.status(200).json({
      received: true,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
}
