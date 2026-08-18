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
  bookings: Array<{ accommodation_name?: string; accommodation_id?: string; check_in: string; check_out: string; status?: string }>,
  dateRange: { start: string; end: string }
): DynamicMinStayUpdate[] {
  const updates: DynamicMinStayUpdate[] = [];
  const activeBookings = (bookings || []).filter(b => b.status !== 'cancelled' && b.status !== 'canceled');

  const roomBookingsMap: Record<string, Array<{ in: string; out: string }>> = {};

  activeBookings.forEach(b => {
    const key = (b.accommodation_name || b.accommodation_id || 'unknown').trim();
    if (!roomBookingsMap[key]) roomBookingsMap[key] = [];
    roomBookingsMap[key].push({
      in: b.check_in.slice(0, 10),
      out: b.check_out.slice(0, 10)
    });
  });

  Object.keys(roomBookingsMap).forEach(roomName => {
    const sorted = roomBookingsMap[roomName].sort((a, b) => a.in.localeCompare(b.in));
    const octRoomId = String(MOTHER_RATE_PLANS[roomName] || roomName);

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

        if (gapDays < maxBaselineInGap) {
          const dateToInclusive = new Date(nextInTime - 86400000).toISOString().slice(0, 10);

          updates.push({
            roomTypeId: octRoomId,
            accommodationName: roomName,
            dateFrom: gapStart,
            dateTo: dateToInclusive,
            minStay: gapDays,
            reason: `Gap-Fill Dinamico (${gapDays}d gap < baseline ${maxBaselineInGap}d): M=${gapDays}`
          });
        }
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

  // 4. Rispondi subito con HTTP 200 OK al mittente Octorate prima di eseguire qualsiasi elaborazione asincrona
  res.status(200).json({
    received: true,
    eventType,
    timestamp: new Date().toISOString(),
    message: 'Webhook received. Processing background gap-filling & baseline restoration.'
  });

  // 5. Esecuzione background asincrona protetta da try/catch globale
  try {
    let bookingsData: any[] = [];
    if (supabaseAdmin) {
      const { data: tokenData } = await supabaseAdmin
        .from('octorate_tokens')
        .select('access_token')
        .eq('id', 'singleton')
        .maybeSingle();

      if (tokenData?.access_token) {
        try {
          const dateFrom = new Date().toISOString().substring(0, 10);
          const dateToObj = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
          const dateTo = dateToObj.toISOString().substring(0, 10);
          const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=${dateFrom}&endDate=${dateTo}&size=100`;
          const octRes = await fetch(octUrl, {
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
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
      }
    }

    const todayISO = new Date().toISOString().substring(0, 10);
    const next60Days = new Date();
    next60Days.setDate(next60Days.getDate() + 60);
    const endISO = next60Days.toISOString().substring(0, 10);

    const calculatedUpdates = calculateServerDynamicMinStay(
      bookingsData,
      { start: todayISO, end: endISO }
    );

    console.log(`[OCTORATE WEBHOOK 24/7] Calculated ${calculatedUpdates.length} gap-filling & restoration updates.`);

    // Invia la scrittura reale ad Octorate filtrando esclusivamente per gli alloggi di Staging
    const stagingUpdates = calculatedUpdates.filter(u => STAGING_LOCK_IDS.has(String(u.roomTypeId)));

    if (stagingUpdates.length > 0 && supabaseAdmin) {
      const { data: tokenData } = await supabaseAdmin
        .from('octorate_tokens')
        .select('access_token')
        .eq('id', 'singleton')
        .maybeSingle();

      if (tokenData?.access_token) {
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
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(roomsPayload)
        });

        console.log(`[OCTORATE WEBHOOK 24/7] Real bulk minstay update sent to Octorate for staging bungalows (Status: ${bulkRes.status}).`);
      }
    }

  } catch (err: any) {
    console.error(`[OCTORATE WEBHOOK 24/7 ERROR]:`, err);
  }
}
