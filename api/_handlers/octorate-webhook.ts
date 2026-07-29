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
  "Internal Room": 293942
};

function getBaselineMinStay(dateStr: string): number {
  if (!dateStr || typeof dateStr !== 'string') return 2;
  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length < 3) return 2;
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if ((month === 12 && day >= 21) || (month === 1 && day <= 15)) {
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
 * Algoritmo Serverless di Calcolo Soggiorno Minimo Dinamico (Gap-Filling & Density Pricing)
 */
function calculateServerDynamicMinStay(
  bookings: Array<{ accommodation_name?: string; accommodation_id?: string; check_in: string; check_out: string; status?: string }>,
  dateRange: { start: string; end: string },
  occupancyRatePct: number = 50
): DynamicMinStayUpdate[] {
  const updates: DynamicMinStayUpdate[] = [];
  const activeBookings = (bookings || []).filter(b => b.status !== 'cancelled');

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
    
    for (let i = 0; i < sorted.length - 1; i++) {
      const prevOut = sorted[i].out;
      const nextIn = sorted[i + 1].in;

      if (prevOut >= dateRange.start && nextIn <= dateRange.end) {
        const prevOutTime = new Date(prevOut).getTime();
        const nextInTime = new Date(nextIn).getTime();
        const gapDays = Math.round((nextInTime - prevOutTime) / (1000 * 60 * 60 * 24));

        if (gapDays > 0 && gapDays < 7) {
          const baseStay = getBaselineMinStay(prevOut);
          
          let densityStay = baseStay;
          if (occupancyRatePct >= 75) {
            densityStay = 5;
          } else if (occupancyRatePct >= 40) {
            densityStay = 3;
          } else {
            densityStay = 2;
          }

          const gapMinStay = Math.min(gapDays, densityStay);

          const octRoomId = String(MOTHER_RATE_PLANS[roomName] || roomName);
          updates.push({
            roomTypeId: octRoomId,
            accommodationName: roomName,
            dateFrom: prevOut,
            dateTo: nextIn,
            minStay: gapMinStay,
            reason: `Gap-Fill Webhook (${gapDays}d gap, Density ${occupancyRatePct}%): M=${gapMinStay}`
          });
        }
      }
    }
  });

  return updates;
}

/**
 * Handler Webhook Octorate 24/7 per Soggiorno Minimo Dinamico (Gap-Filling)
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
    message: 'Webhook received. Processing background gap-filling.'
  });

  // 5. Esecuzione background asincrona protetta da try/catch globale
  try {
    let bookingsData: any[] = [];
    if (supabaseAdmin) {
      const { data: sbBookings } = await supabaseAdmin
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (sbBookings && sbBookings.length > 0) {
        bookingsData = sbBookings;
      }
    }

    const todayISO = new Date().toISOString().substring(0, 10);
    const next60Days = new Date();
    next60Days.setDate(next60Days.getDate() + 60);
    const endISO = next60Days.toISOString().substring(0, 10);

    const calculatedUpdates = calculateServerDynamicMinStay(
      bookingsData,
      { start: todayISO, end: endISO },
      50 // Default occupancy rate
    );

    console.log(`[OCTORATE WEBHOOK 24/7] Calculated ${calculatedUpdates.length} gap-filling minstay updates.`);

    // STAGING LOCK CHECK se DRY_RUN === false
    if (!DRY_RUN) {
      const invalidTarget = calculatedUpdates.find(item => !STAGING_LOCK_IDS.has(item.roomTypeId));
      if (invalidTarget) {
        console.error(`[STAGING LOCK BLOCKED] Webhook attempted write to non-staging room ID ${invalidTarget.roomTypeId}`);
        return;
      }

      // Invio scrittura reale se non bloccata dallo Staging Lock
      const { data: tokenData } = await supabaseAdmin
        .from('octorate_tokens')
        .select('access_token')
        .eq('id', 'singleton')
        .maybeSingle();

      if (tokenData?.access_token && calculatedUpdates.length > 0) {
        const structureId = process.env.VITE_OCTORATE_STRUCTURE_ID || "366879";
        await fetch(`https://api.octorate.com/connect/rest/v1/calendar/bulk`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            structure: Number(structureId),
            updates: calculatedUpdates
          })
        });
        console.log(`[OCTORATE WEBHOOK 24/7] Real bulk minstay update sent to Octorate for staging bungalows.`);
      }
    } else {
      console.log(`[OCTORATE WEBHOOK 24/7 DRY_RUN = true] Simulated update of ${calculatedUpdates.length} gap-fill restrictions in memory.`);
    }

  } catch (err: any) {
    console.error(`[OCTORATE WEBHOOK 24/7 ERROR]:`, err);
  }
}
