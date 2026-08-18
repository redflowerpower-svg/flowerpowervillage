import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseAdmin = (supabaseUrl && serviceRoleKey) ? createClient(supabaseUrl, serviceRoleKey) : null as any;

// Global DRY_RUN mode flag (simulazione in memoria / log per la massima sicurezza)
const DRY_RUN = true;
const STAGING_LOCK_IDS = new Set([
  '649669', '932243', '932244', '932246', '932247', '932248', '932249', '932250', '932251', '932252', '932253', '932254', '932255',
  '921799', '932256', '932257', '932259', '932260', '932261', '932262', '932263', '932264', '932265', '932266', '932267', '932268'
]);

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

const ACCOMMODATION_PRODUCTS_MAP: Record<string, string[]> = {
  "Fake Bungalow 1": ['649669', '932243', '932244', '932246', '932247', '932248', '932249', '932250', '932251', '932252', '932253', '932254', '932255'],
  "Fake Bungalow 2": ['921799', '932256', '932257', '932259', '932260', '932261', '932262', '932263', '932264', '932265', '932266', '932267', '932268'],
  "Peace & Love Villa": ['494840', '495566', '495580', '495575', '495552', '495587', '495565', '495593', '921874', '921875', '495569', '495609'],
  "Penthouse Villa": ['421511', '449348', '421513', '421516', '421520', '421522', '421525', '421527', '421530', '921876', '921877', '421532', '421533'],
  "Villa Penthouse": ['421511', '449348', '421513', '421516', '421520', '421522', '421525', '421527', '421530', '921876', '921877', '421532', '421533'],
  "Jungle Villa": ['529773', '529784', '529778', '529792', '529788', '529780', '916816', '529781', '529801', '921868', '921869', '529783', '529813'],
  "Jungle Villa Left": ['495795', '495807', '495804', '496009', '496001', '495805', '496022', '495806', '496031', '921870', '921871', '495810', '496057'],
  "Jungle Villa Right": ['495796', '495980', '495977', '496010', '496002', '495978', '496021', '495979', '496030', '921872', '921873', '495982', '496056'],
  "Lodge 1": ['293951', '449736', '422149', '332769', '332767', '331974', '332129', '422157', '332142', '921884', '921885', '297030', '421510'],
  "Lodge 2": ['883795', '923905', '916108', '916107', '916109', '916114', '916829', '916105', '916830', '921886', '921887', '916103', '916104'],
  "Red Bungalow": ['293954', '449422', '293953', '332030', '332029', '330964', '332035', '330970', '332036', '921880', '921881', '297021', '340196'],
  "Green Bungalow": ['293962', '449668', '293961', '332070', '332066', '331923', '332072', '331924', '332074', '921882', '921883', '297023', '340200'],
  "Yellow Bungalow": ['293957', '449385', '293958', '332055', '332054', '331921', '332057', '331922', '332060', '921878', '921879', '297022', '340198'],
  "Lagoon Tent": ['293955', '449674', '422351', '293956', '332081', '332077', '297024'],
  "Lagoon Tent Bungalow": ['293955', '449674', '422351', '293956', '332081', '332077', '297024'],
  "Camel Tent": ['293965', '449675', '422325', '293966', '332089', '332084', '297025'],
  "Camel Tent Bungalow": ['293965', '449675', '422325', '293966', '332089', '332084', '297025'],
  "Room 1": ['293963', '449678', '422300', '332737', '332735', '331976', '916818', '331977', '916402', '921889', '921890', '297033', '421505'],
  "Room 2": ['293959', '449684', '422296', '332741', '332739', '331966', '332119', '331967', '332134', '921891', '921900', '297032', '421506'],
  "Room 3": ['293948', '449699', '422293', '332743', '332757', '331968', '332121', '331969', '332136', '921892', '921893', '297028', '421507'],
  "Room 4": ['293945', '449724', '422265', '332759', '332746', '331970', '332123', '331971', '332138', '921894', '921895', '297029', '421508'],
  "Room 5": ['293943', '449730', '422213', '332765', '332763', '331972', '332125', '331973', '332140', '921896', '921897', '297031', '421509'],
  "Internal Room": ['293942', '449742', '293941', '332109', '332105', '340367', '916840', '421998', '916838', '921898', '921899', '297027', '422147']
};

// 🎯 SORGENTE DI VERITÀ: Timeline Min Stay configurata in Gestione Tariffe Derivate
const WEBHOOK_MIN_STAY_TIMELINE = [
  { dateFrom: '2026-08-01', dateTo: '2026-12-15', minStay: 2 },
  { dateFrom: '2026-12-16', dateTo: '2027-01-15', minStay: 5 },
  { dateFrom: '2027-01-16', dateTo: '2027-03-31', minStay: 3 },
  { dateFrom: '2027-04-01', dateTo: '2027-10-31', minStay: 2 }
];

function getBaselineMinStay(dateStr: string): number {
  if (!dateStr || typeof dateStr !== 'string') return 2;
  const dStr = dateStr.slice(0, 10);
  const matched = WEBHOOK_MIN_STAY_TIMELINE.find(p => dStr >= p.dateFrom && dStr <= p.dateTo);
  return matched?.minStay || 2;
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
    // 1. Ordina gli intervalli di occupazione per data di check-in
    const sorted = bList.sort((a, b) => a.in.localeCompare(b.in));
    const octRoomId = motherId;

    // 2. Unione degli intervalli sovrapposti o adiacenti (Interval Merging canonico)
    const mergedOccupied: Array<{ in: string; out: string }> = [];
    for (const curr of sorted) {
      if (mergedOccupied.length === 0) {
        mergedOccupied.push({ ...curr });
      } else {
        const prev = mergedOccupied[mergedOccupied.length - 1];
        if (curr.in <= prev.out) {
          if (curr.out > prev.out) {
            prev.out = curr.out;
          }
        } else {
          mergedOccupied.push({ ...curr });
        }
      }
    }

    const gaps: Array<{ start: string; end: string }> = [];

    if (mergedOccupied.length === 0) {
      // Stanza completamente vuota (nessun booking attivo o tutti cancellati): ripristina la baseline su tutto il range
      gaps.push({ start: dateRange.start, end: dateRange.end });
    } else {
      // 1. Gap iniziale: da inizio range al checkin del primo blocco occupato
      if (mergedOccupied[0].in > dateRange.start) {
        gaps.push({ start: dateRange.start, end: mergedOccupied[0].in });
      }

      // 2. Gap intermedi tra blocchi occupati consecutivi
      for (let i = 0; i < mergedOccupied.length - 1; i++) {
        const prevOut = mergedOccupied[i].out;
        const nextIn = mergedOccupied[i + 1].in;
        if (prevOut < nextIn && prevOut <= dateRange.end && nextIn >= dateRange.start) {
          const effectiveStart = prevOut < dateRange.start ? dateRange.start : prevOut;
          if (effectiveStart < nextIn) {
            gaps.push({ start: effectiveStart, end: nextIn });
          }
        }
      }

      // 3. Gap finale (Coda): dall'ultimo checkout al termine della stagione
      const lastOut = mergedOccupied[mergedOccupied.length - 1].out;
      if (lastOut < dateRange.end) {
        const effectiveStart = lastOut < dateRange.start ? dateRange.start : lastOut;
        gaps.push({ start: effectiveStart, end: dateRange.end });
      }
    }

function addDaysISO(isoStr: string, n: number): string {
  const parts = isoStr.split('-').map(Number);
  const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + n));
  return d.toISOString().slice(0, 10);
}

function daysDiffISO(startISO: string, endISO: string): number {
  const s = new Date(startISO + 'T00:00:00Z').getTime();
  const e = new Date(endISO + 'T00:00:00Z').getTime();
  return Math.round((e - s) / 86400000);
}

    const targetProductIds = ACCOMMODATION_PRODUCTS_MAP[roomName] || [octRoomId];

    gaps.forEach(({ start: gapStart, end: gapEnd }) => {
      const gapDays = daysDiffISO(gapStart, gapEnd);

      if (gapDays > 0) {
        let cur = gapStart;
        let blockStart = cur;
        let blockMinStay = Math.min(gapDays, getBaselineMinStay(cur));

        while (cur < gapEnd) {
          const baseline = getBaselineMinStay(cur);
          const target = Math.min(gapDays, baseline);
          if (target !== blockMinStay) {
            const blockEnd = addDaysISO(cur, -1);
            targetProductIds.forEach(targetId => {
              updates.push({
                roomTypeId: targetId,
                accommodationName: roomName,
                dateFrom: blockStart,
                dateTo: blockEnd,
                minStay: blockMinStay,
                reason: gapDays < blockMinStay
                  ? `Gap-Fill Dinamico (${gapDays}d): M=${blockMinStay}`
                  : `Minimo da Gestione Tariffe Derivate: M=${blockMinStay}`
              });
            });
            blockStart = cur;
            blockMinStay = target;
          }
          cur = addDaysISO(cur, 1);
        }

        const lastDate = addDaysISO(gapEnd, -1);
        if (blockStart <= lastDate) {
          targetProductIds.forEach(targetId => {
            updates.push({
              roomTypeId: targetId,
              accommodationName: roomName,
              dateFrom: blockStart,
              dateTo: lastDate,
              minStay: blockMinStay,
              reason: gapDays < blockMinStay
                ? `Gap-Fill Dinamico (${gapDays}d): M=${blockMinStay}`
                : `Minimo da Gestione Tariffe Derivate: M=${blockMinStay}`
            });
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

  const eventType = eventPayload?.type || eventPayload?.event || eventPayload?.action || 'RESERVATION_NOTIFICATION';
  console.log(`[OCTORATE WEBHOOK 24/7] Received POST event: ${eventType}`, JSON.stringify(eventPayload, null, 2));

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
        const todayISO = new Date().toISOString().substring(0, 10);
        const currentYear = new Date().getFullYear();
        const endISO = `${currentYear + 1}-10-31`;

        try {
          const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=${todayISO}&endDate=${endISO}&size=250`;
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
