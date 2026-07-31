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
 * Handler Webhook Octorate 24/7 per Automazione Soggiorno Minimo Dinamico (Event-Driven Gap-Filling)
 * Rotta API Gateway Catch-All: POST /api/webhooks/octorate
 */
export async function handleOctorateWebhook(req: VercelRequest, res: VercelResponse) {
  // 1. CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Preflight e verifica PING immediate con HTTP 200 OK
  if (req.method === 'OPTIONS' || req.method === 'HEAD') {
    return res.status(200).send('OK');
  }

  if (req.method === 'GET') {
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
    eventPayload = {};
  }

  // Ping catcher per Octorate
  const isPing = !eventPayload || 
                 Object.keys(eventPayload).length === 0 || 
                 (!eventPayload.type && !eventPayload.event && !eventPayload.id && !eventPayload.action && !eventPayload.reservationId);

  if (isPing) {
    return res.status(200).json({ status: 'ok', message: 'Octorate Webhook Verification Ping Received' });
  }

  const rawEventType = String(eventPayload.type || eventPayload.event || eventPayload.action || 'UNKNOWN').toUpperCase();

  // 1. Intercettazione Eventi Octorate (RESERVATION_CREATED, RESERVATION_CHANGE, RESERVATION_CANCELLED)
  const isTargetEvent = rawEventType.includes('RESERVATION') || 
                        rawEventType.includes('CREATE') || 
                        rawEventType.includes('CHANGE') || 
                        rawEventType.includes('UPDATE') || 
                        rawEventType.includes('CANCEL');

  console.log(`[OCTORATE WEBHOOK EVENT-DRIVEN] Received event: ${rawEventType} (Target: ${isTargetEvent})`);

  // Rispondi IMMEDIATAMENTE con HTTP 200 OK per prevenire timeout e retry di Octorate
  res.status(200).json({
    received: true,
    eventType: rawEventType,
    timestamp: new Date().toISOString(),
    message: 'Webhook received and processing in background.'
  });

  if (!isTargetEvent) {
    return;
  }

  // 2. Controllo Stato (Master Switch) e Ricalcolo Chirurgico in Background
  try {
    let isMasterSwitchActive = true;
    if (supabaseAdmin) {
      const { data: switchData } = await supabaseAdmin
        .from('resort_settings')
        .select('is_dynamic_min_stay_active')
        .eq('id', 'singleton')
        .maybeSingle();

      if (switchData && typeof switchData.is_dynamic_min_stay_active === 'boolean') {
        isMasterSwitchActive = switchData.is_dynamic_min_stay_active;
      } else {
        const { data: tokenSwitch } = await supabaseAdmin
          .from('octorate_tokens')
          .select('is_dynamic_min_stay_active')
          .eq('id', 'singleton')
          .maybeSingle();
        if (tokenSwitch && typeof tokenSwitch.is_dynamic_min_stay_active === 'boolean') {
          isMasterSwitchActive = tokenSwitch.is_dynamic_min_stay_active;
        }
      }
    }

    if (!isMasterSwitchActive) {
      console.log('[Octorate Webhook] Master switch is_dynamic_min_stay_active is FALSE. Skipping automatic gap-filling.');
      return;
    }

    // 3. Ricalcolo Chirurgico (Gap-Filling per Stanza Interessata)
    const resData = eventPayload.reservation || eventPayload.data || eventPayload;
    const targetProductId = String(resData.product || resData.roomId || resData.octorateRoomId || resData.room_id || resData.accommodation_id || '').trim();
    const rawCheckIn = String(resData.checkin || resData.check_in || resData.startDate || '').slice(0, 10);
    const rawCheckOut = String(resData.checkout || resData.check_out || resData.endDate || '').slice(0, 10);

    const todayISO = new Date().toISOString().substring(0, 10);
    const todayTime = new Date(`${todayISO}T00:00:00Z`).getTime();

    // Range chirurgico: 30 giorni prima e 30 giorni dopo la prenotazione creata/modificata/cancellata
    let startDateStr = todayISO;
    let endDateStr = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

    if (rawCheckIn) {
      const dtStart = new Date(`${rawCheckIn}T00:00:00Z`);
      dtStart.setUTCDate(dtStart.getUTCDate() - 30);
      const calcStart = Math.max(dtStart.getTime(), todayTime);
      startDateStr = new Date(calcStart).toISOString().substring(0, 10);

      const dtEnd = new Date(`${rawCheckOut || rawCheckIn}T00:00:00Z`);
      dtEnd.setUTCDate(dtEnd.getUTCDate() + 30);
      endDateStr = dtEnd.toISOString().substring(0, 10);
    }

    console.log(`[OCTORATE WEBHOOK SURGICAL GAP-FILL] Target Product: ${targetProductId || 'ALL'}, Range: ${startDateStr} ➔ ${endDateStr}`);

    // Estrazione Token Octorate da Supabase
    const { data: tokenData } = await supabaseAdmin
      .from('octorate_tokens')
      .select('access_token')
      .eq('id', 'singleton')
      .maybeSingle();

    if (!tokenData?.access_token) {
      console.error('[Octorate Webhook] No token in database for background gap-filling.');
      return;
    }

    // Fetch prenotazioni attive da Octorate REST API per il range chirurgico
    const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=${startDateStr}&endDate=${endDateStr}&size=100`;
    const octRes = await fetch(octUrl, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json'
      }
    });

    if (!octRes.ok) {
      console.warn(`[Octorate Webhook] Failed to fetch reservations for surgical range (${octRes.status})`);
      return;
    }

    const octJson = await octRes.json();
    const rawReservations = octJson?.data || octJson || [];
    const activeReservations = rawReservations.filter((r: any) => String(r.status || '').toUpperCase() !== 'CANCELLED');

    // Esegui la logica di calcolo dinamico gap-filling
    const calculatedUpdates = calculateServerDynamicMinStay(
      activeReservations,
      { start: startDateStr, end: endDateStr },
      50
    );

    // Filtra per inviare SOLO gli aggiornamenti chirurgici per la stanza interessata
    const targetUpdates = targetProductId
      ? calculatedUpdates.filter(u => String(u.roomTypeId) === targetProductId || String(u.accommodationName).toLowerCase().includes(targetProductId.toLowerCase()))
      : calculatedUpdates;

    const finalUpdates = targetUpdates.length > 0 ? targetUpdates : calculatedUpdates;

    if (finalUpdates.length === 0) {
      console.log('[Octorate Webhook] No surgical min-stay updates required after event calculation.');
      return;
    }

    console.log(`[OCTORATE WEBHOOK PUSH OTTIMIZZATO] Invio di ${finalUpdates.length} restrizioni chirurgiche ad Octorate bulk calendar.`);

    // 4. Push Ottimizzato ad Octorate (Array JSON Puro)
    const bulkRes = await fetch(`https://api.octorate.com/connect/rest/v1/calendar/bulk`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(finalUpdates)
    });

    if (bulkRes.ok) {
      console.log(`[OCTORATE WEBHOOK SUCCESS] Sincronizzati ${finalUpdates.length} gap-fill minstay chirurgici con Octorate!`);
    } else {
      const errTxt = await bulkRes.text();
      console.error(`[OCTORATE WEBHOOK ERROR] Bulk push failed (${bulkRes.status}): ${errTxt}`);
    }

  } catch (err: any) {
    console.error(`[OCTORATE WEBHOOK EVENT-DRIVEN ERROR CRITICO]:`, err);
  }
}
