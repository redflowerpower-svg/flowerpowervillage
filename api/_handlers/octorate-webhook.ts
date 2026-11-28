import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { executeAutoShieldForReservation } from "../_helpers/octorate-auto-shield.js";
import { checkAndSyncCascadeLastMinute } from "../_helpers/octorate-cascade-sync.js";
import { handleDirectReservationCancellation } from "../_helpers/cancellation-email.js";
import { classifyBookingTelegramEvent, isCancelledBookingEvent } from "../_helpers/octorate-booking-routing.js";
import { checkAndNotifyOverbookings } from "../_helpers/overbooking-detector.js";
import { sendDepartmentTelegramMessage } from "../_helpers/telegram.js";
import { formatDateDMY, toThailandDateStr } from "../_helpers/date-formatter.js";
import { clearOctorateGridCache } from "./octorate.js";
import { ALL_OCTORATE_STRUCTURE_IDS, getOctorateStructureByRoomId } from "../_helpers/octorate-structures.js";
import {
  isDateLockedForRoom,
  loadClosedRoomLocks,
  resolveLockableRoom,
  sealLockedRoomRangeOnOctorate
} from "../_helpers/octorate-closed-room-lock.js";
import {
  parseOctorateTimestampMs,
  postOctorateCalendarBulkWithRetry
} from "../_helpers/octorate-client.js";
import {
  ALL_ACCOMMODATIONS_MAP,
  getCanonicalAccommodation,
  getCompanionRateId,
  getJungleTwinPairByRateId,
  isMirrorReservation,
  JUNGLE_RATE_PAIRS,
  JungleSourceStructureId,
  resolveAccommodationName,
  resolveGuestName,
  resolveTwinByProductOrName
} from "../_helpers/octorate-catalog.js";
import {
  DynamicMinStayUpdate,
  calculateServerDynamicMinStay
} from "../_helpers/octorate-minstay.js";
export {
  ALL_ACCOMMODATIONS_MAP,
  DynamicMinStayUpdate,
  calculateServerDynamicMinStay,
  getCanonicalAccommodation,
  resolveAccommodationName,
  resolveGuestName
};
import {
  classifyStandbyBookingAlert,
  expandMinStayEntryWithStandbyKeepAlive,
  getActiveJungleSourceWithMeta,
  mirrorReservationToStandby,
  reopenFreedTwinDatesOnActiveStructure,
  syncActiveToStandbyCalendar,
  syncManualMirrorEditToCounterpart
} from "../_helpers/octorate-jungle-mirror.js";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "";
  return (supabaseUrl && serviceRoleKey) ? createClient(supabaseUrl, serviceRoleKey) : null;
}

// Global DRY_RUN mode flag (simulazione in memoria / log per la massima sicurezza)
const DRY_RUN = true;
const STAGING_LOCK_IDS = new Set([
  '649669', '932243', '932244', '932246', '932247', '932248', '932249', '932250', '932251', '932252', '932253', '932254', '932255',
  '921799', '932256', '932257', '932259', '932260', '932261', '932262', '932263', '932264', '932265', '932266', '932267', '932268'
]);

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

  const tryParseNestedJson = (val: any): any => {
    if (typeof val !== 'string') return val;
    const trimmed = val.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return val;
    try {
      return JSON.parse(trimmed);
    } catch {
      return val;
    }
  };
  if (eventPayload && typeof eventPayload === 'object') {
    if (typeof eventPayload.content === 'string') eventPayload.content = tryParseNestedJson(eventPayload.content);
    if (typeof eventPayload.data === 'string') eventPayload.data = tryParseNestedJson(eventPayload.data);
    if (typeof eventPayload.reservation === 'string') eventPayload.reservation = tryParseNestedJson(eventPayload.reservation);
  }

  const eventType = eventPayload?.type || eventPayload?.event || eventPayload?.action || 'RESERVATION_NOTIFICATION';
  console.log(`[OCTORATE WEBHOOK 24/7] Received POST event: ${eventType}`, JSON.stringify(eventPayload, null, 2));

  const earlyTargetResId: any =
    eventPayload?.id ||
    eventPayload?.data?.id ||
    eventPayload?.data?.reservation?.id ||
    eventPayload?.data?.reservationId ||
    eventPayload?.reservation?.id ||
    eventPayload?.content?.id ||
    eventPayload?.content?.reservation?.id ||
    eventPayload?.content?.reservationId ||
    (Array.isArray(eventPayload?.content) && (eventPayload.content[0]?.id || eventPayload.content[0]?.reservationId || eventPayload.content[0]?.reservation?.id)) ||
    eventPayload?.reservationId ||
    eventPayload?.resId ||
    eventPayload?.reservationNumber ||
    eventPayload?.bookingId ||
    (Array.isArray(eventPayload) && (eventPayload[0]?.id || eventPayload[0]?.reservationId)) ||
    req.body?.id ||
    req.body?.reservationId ||
    req.query?.id ||
    req.query?.reservationId ||
    req.query?.resId;

  const upperEventType = String(eventType || '').toUpperCase();
  const isCreateOnlyEvent =
    (upperEventType.includes('CREAT') || upperEventType.includes('NEW')) &&
    !upperEventType.includes('CHANGE') &&
    !upperEventType.includes('MODIF') &&
    !upperEventType.includes('UPDATE') &&
    !upperEventType.includes('CANCEL');
  const isEditOrCancelEvent =
    !isCreateOnlyEvent &&
    (upperEventType.includes('CANCEL') ||
      upperEventType.includes('CHANGE') ||
      upperEventType.includes('MODIF') ||
      upperEventType.includes('UPDATE') ||
      upperEventType.includes('EDIT') ||
      upperEventType.includes('DELETE') ||
      upperEventType.includes('VOID') ||
      upperEventType === 'RESERVATION_NOTIFICATION');

  // 🔄 LAYER 1 ANTI-LOOP (0 chiamate API): scarta subito payload mirror espliciti di creazione o senza ID
  const inlineMirrorCandidate =
    isMirrorReservation(eventPayload) ||
    isMirrorReservation(eventPayload?.reservation) ||
    isMirrorReservation(eventPayload?.data) ||
    isMirrorReservation(eventPayload?.data?.reservation) ||
    isMirrorReservation(eventPayload?.content) ||
    isMirrorReservation(eventPayload?.content?.reservation) ||
    (Array.isArray(eventPayload?.content) && isMirrorReservation(eventPayload.content[0])) ||
    (Array.isArray(eventPayload) && isMirrorReservation(eventPayload[0]));
  if (inlineMirrorCandidate && (!earlyTargetResId || !isEditOrCancelEvent)) {
    console.log(`[OCTORATE WEBHOOK 24/7] Early-exit Layer 1: [MIRROR_SYNC] inline payload (${eventType}) ignorato -> 0 chiamate Octorate.`);
    return res.status(200).json({
      received: true,
      skipped: 'mirror_reservation_inline',
      eventType,
      timestamp: new Date().toISOString()
    });
  }

  // 4. Esecuzione asincrona garantita prima di chiudere la risposta Serverless
  let calculatedUpdatesCount = 0;
  let octorateStatus = 0;

  try {
    let bookingsData: any[] = [];
    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      let knownMirrorRow: { id: string; updated_at?: string; bot_token?: string; chat_id?: string } | null = null;
      // 🔄 LAYER 2 ANTI-LOOP (0 chiamate Octorate): se l'ID prenotazione è stato creato/toccato dal server < 45s fa, esci subito; se modificato dopo > 45s propaga alla gemella
      if (earlyTargetResId) {
        try {
          const mirrorKeys = ALL_OCTORATE_STRUCTURE_IDS.map(s => `mirror_target_${s}_${earlyTargetResId}`);
          const { data: mirrorRowData } = await supabaseAdmin
            .from('telegram_config')
            .select('id, updated_at, bot_token, chat_id')
            .in('id', mirrorKeys)
            .limit(1)
            .maybeSingle();
          knownMirrorRow = mirrorRowData || null;
          if (knownMirrorRow) {
            const updatedMs = knownMirrorRow.updated_at ? Date.parse(knownMirrorRow.updated_at) : 0;
            const ageMs = updatedMs > 0 && !Number.isNaN(updatedMs) ? Date.now() - updatedMs : 0;
            if (ageMs < 45000 || !isEditOrCancelEvent) {
              console.log(`[OCTORATE WEBHOOK 24/7] Early-exit Layer 2: Mirror ID #${earlyTargetResId} (${knownMirrorRow.id}, age=${Math.round(ageMs / 1000)}s) -> 0 chiamate Octorate.`);
              return res.status(200).json({
                received: true,
                skipped: 'mirror_reservation_known_id',
                reservationId: String(earlyTargetResId),
                eventType,
                timestamp: new Date().toISOString()
              });
            }
            console.log(`[OCTORATE WEBHOOK 24/7] Mirror ID #${earlyTargetResId} modificato/cancellato dopo ${Math.round(ageMs / 1000)}s -> verifico sync manuale verso struttura gemella.`);
          }
        } catch (mirrorLookupErr) {
          console.warn('[OCTORATE WEBHOOK] Mirror ID early-lookup warning:', mirrorLookupErr);
        }
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
        const isReservationEventType =
          upperEventType.includes('RESERVATION') ||
          upperEventType.includes('BOOKING') ||
          upperEventType.includes('STAY') ||
          upperEventType.includes('CREAT') ||
          upperEventType.includes('MODIF') ||
          upperEventType.includes('CHANGE') ||
          upperEventType.includes('CANCEL');

        const hasInlineBookingData = Boolean(
          earlyTargetResId ||
          isReservationEventType ||
          eventPayload?.checkin ||
          eventPayload?.reservation?.checkin ||
          eventPayload?.content?.checkin ||
          eventPayload?.content?.reservation?.checkin ||
          eventPayload?.check_in ||
          eventPayload?.startDate ||
          eventPayload?.data?.checkin ||
          eventPayload?.data?.reservation?.checkin
        );

        if (!hasInlineBookingData) {
          console.log(`[OCTORATE WEBHOOK 24/7] Evento non-prenotazione '${eventType}': eseguo solo sync leggero protetto da cooldown.`);
          try {
            await checkAndSyncCascadeLastMinute(accessToken, supabaseAdmin, false, 'octorate-webhook-light');
          } catch (cascadeErr) {
            console.warn('[OCTORATE WEBHOOK] Light cascade sync warning:', cascadeErr);
          }
          try {
            await syncActiveToStandbyCalendar(supabaseAdmin, accessToken, { daysAhead: 60 });
          } catch (mirrorSyncErr) {
            console.warn('[OCTORATE WEBHOOK] Light standby sync warning:', mirrorSyncErr);
          }
          return res.status(200).json({
            received: true,
            skipped: 'non_reservation_event_light_sync',
            eventType,
            timestamp: new Date().toISOString()
          });
        }

        const todayISO = toThailandDateStr(new Date());
        const currentYear = new Date().getFullYear();
        const endISO = `${currentYear + 1}-10-31`;

        try {
          // 🌟 MULTI-STRUTTURA: Fetch prenotazioni da tutte e 3 le strutture in parallelo
          await Promise.all(ALL_OCTORATE_STRUCTURE_IDS.map(async (structId) => {
            let page = 0;
            let hasMore = true;
            while (hasMore && page <= 10) {
              const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/${structId}?type=STAY&startDate=${todayISO}&endDate=${endISO}&size=100&page=${page}`;
              const octRes = await fetch(octUrl, {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  ...(clientId ? { 'Octorate-Api-Key': clientId } : {}),
                  'Accept': 'application/json'
                }
              });
              if (octRes.ok) {
                const octJson = await octRes.json();
                const pageData = octJson && Array.isArray(octJson.data) ? octJson.data : (Array.isArray(octJson) ? octJson : (octJson.reservations || []));
                if (pageData.length > 0) {
                  bookingsData.push(...pageData);
                  if (pageData.length < 100) {
                    hasMore = false;
                  } else {
                    page++;
                  }
                } else {
                  hasMore = false;
                }
              } else {
                hasMore = false;
              }
            }
          }));
        } catch (octErr) {
          console.warn('[OCTORATE WEBHOOK] Failed to fetch live bookings from Octorate:', octErr);
        }

        let isMirrorWebhookEvent = false;
        let preResolvedTargetBooking: any = earlyTargetResId
          ? bookingsData.find(b => String(b.id) === String(earlyTargetResId)) || null
          : null;

        if (!preResolvedTargetBooking && earlyTargetResId) {
          try {
            for (const sId of ALL_OCTORATE_STRUCTURE_IDS) {
              const singleRes = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/${sId}/${earlyTargetResId}`, {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  ...(clientId ? { 'Octorate-Api-Key': clientId } : {}),
                  'Accept': 'application/json'
                }
              });
              if (singleRes.ok) {
                preResolvedTargetBooking = await singleRes.json();
                break;
              }
            }
          } catch (earlyFetchErr) {
            console.warn('[OCTORATE WEBHOOK] Early single reservation lookup warning:', earlyFetchErr);
          }
        }

        // 🔄 LAYER 3 ANTI-LOOP / SYNC BIDIREZIONALE: se la prenotazione è [MIRROR_SYNC], ignora eco recenti o creazioni, ma propaga modifiche/cancellazioni manuali
        let mirrorSyncedCounterpart = false;
        if (preResolvedTargetBooking && isMirrorReservation(preResolvedTargetBooking)) {
          const mirrorRowUpdatedMs = knownMirrorRow?.updated_at ? Date.parse(knownMirrorRow.updated_at) : 0;
          const mirrorRowAgeMs = mirrorRowUpdatedMs > 0 && !Number.isNaN(mirrorRowUpdatedMs)
            ? Date.now() - mirrorRowUpdatedMs
            : Infinity;
          const mCreateMs = parseOctorateTimestampMs(preResolvedTargetBooking.createTime);
          const mUpdateMs = parseOctorateTimestampMs(preResolvedTargetBooking.updateTime);
          const pStatus = String(preResolvedTargetBooking.status || '').toUpperCase().trim();
          const isMirrorCancelled =
            pStatus === 'CANCELLED' ||
            pStatus === 'CANCELED' ||
            pStatus === 'DELETED' ||
            pStatus === 'VOID' ||
            pStatus === 'REJECTED' ||
            upperEventType.includes('CANCEL');

          const shouldPropagateMirrorEdit =
            isEditOrCancelEvent &&
            mirrorRowAgeMs >= 45000 &&
            (isMirrorCancelled || mUpdateMs === 0 || mCreateMs === 0 || mUpdateMs > mCreateMs + 5000);

          if (!shouldPropagateMirrorEdit) {
            console.log(`[OCTORATE WEBHOOK 24/7] Early-exit Layer 3: [MIRROR_SYNC] #${preResolvedTargetBooking.id || earlyTargetResId} ignorato prima di calendar/bulk.`);
            return res.status(200).json({
              received: true,
              skipped: 'mirror_reservation_resolved',
              reservationId: String(preResolvedTargetBooking.id || earlyTargetResId),
              eventType,
              timestamp: new Date().toISOString()
            });
          }

          const mRoomRaw = preResolvedTargetBooking.product || preResolvedTargetBooking.pmsProduct || preResolvedTargetBooking.accommodation_id || preResolvedTargetBooking.roomId || '';
          const mStructRaw = preResolvedTargetBooking.accommodation?.id
            ? String(preResolvedTargetBooking.accommodation.id)
            : getOctorateStructureByRoomId(mRoomRaw).id;
          const mirrorStruct: JungleSourceStructureId = mStructRaw === '366879' ? '366879' : '807324';

          try {
            const propRes = await syncManualMirrorEditToCounterpart({
              supabaseAdmin,
              accessToken,
              mirrorStruct,
              mirrorBooking: preResolvedTargetBooking,
              isCancelled: isMirrorCancelled,
              forceOnWebhook: true
            });
            console.log(`[OCTORATE WEBHOOK 24/7] 🔄 Sync bidirezionale modifica manuale Mirror #${preResolvedTargetBooking.id || earlyTargetResId}:`, propRes);

            if (propRes.synced && propRes.counterpartReservationId && propRes.counterpartStructureId) {
              mirrorSyncedCounterpart = true;
              const cIdStr = String(propRes.counterpartReservationId);
              const newInDate = String(preResolvedTargetBooking.checkin || preResolvedTargetBooking.checkIn || '').slice(0, 10);
              const newOutDate = String(preResolvedTargetBooking.checkout || preResolvedTargetBooking.checkOut || '').slice(0, 10);
              const existingIdx = bookingsData.findIndex(b => String(b.id) === cIdStr);
              if (propRes.action === 'cancelled') {
                if (existingIdx >= 0) bookingsData[existingIdx].status = 'CANCELLED';
              } else if (newInDate && newOutDate) {
                if (existingIdx >= 0) {
                  bookingsData[existingIdx].checkin = `${newInDate}T08:00:00Z`;
                  bookingsData[existingIdx].checkout = `${newOutDate}T04:00:00Z`;
                  bookingsData[existingIdx].check_in = newInDate;
                  bookingsData[existingIdx].check_out = newOutDate;
                } else {
                  const freshCRes = await fetch(
                    `https://api.octorate.com/connect/rest/v1/reservation/${propRes.counterpartStructureId}/${cIdStr}`,
                    { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } }
                  ).catch(() => null);
                  if (freshCRes && freshCRes.ok) {
                    const freshCData = await freshCRes.json().catch(() => null);
                    if (freshCData) bookingsData.push(freshCData);
                  }
                }
              }
            } else {
              return res.status(200).json({
                received: true,
                skipped: 'mirror_edit_no_counterpart_change',
                reason: propRes.reason,
                reservationId: String(preResolvedTargetBooking.id || earlyTargetResId),
                eventType,
                timestamp: new Date().toISOString()
              });
            }
          } catch (propErr) {
            console.warn('[OCTORATE WEBHOOK 24/7] Errore propagazione modifica manuale Mirror:', propErr);
          }
        }

        // 🔄 Cancella immediatamente l'eventuale specchio PRIMA del fetch calendarItems & calcolo minStay
        let earlyMirrorHandled = false;
        let earlyCancelledTwin: { twinKey: 'jv' | 'jvl' | 'jvr' | 'pl'; checkIn: string; checkOut: string } | null = null;
        if (preResolvedTargetBooking) {
          const preStatus = String(preResolvedTargetBooking.status || '').toUpperCase().trim();
          const isEarlyCancelled =
            preStatus === 'CANCELLED' ||
            preStatus === 'CANCELED' ||
            preStatus === 'DELETED' ||
            preStatus === 'VOID' ||
            preStatus === 'REJECTED' ||
            upperEventType.includes('CANCEL') ||
            Boolean(preResolvedTargetBooking.cancelled) ||
            Boolean(preResolvedTargetBooking.isCancelled);

          if (isEarlyCancelled) {
            preResolvedTargetBooking.status = 'CANCELLED';
            const preIdStr = String(preResolvedTargetBooking.id || earlyTargetResId || '');
            if (preIdStr) {
              for (const b of bookingsData) {
                if (String(b?.id || '') === preIdStr) {
                  b.status = 'CANCELLED';
                }
              }
            }

            const preProd =
              preResolvedTargetBooking.product ||
              preResolvedTargetBooking.pmsProduct ||
              preResolvedTargetBooking.accommodation_id ||
              preResolvedTargetBooking.roomId ||
              preResolvedTargetBooking.roomTypeId;
            const preRoomName =
              preResolvedTargetBooking.roomName ||
              preResolvedTargetBooking.accommodation_name ||
              preResolvedTargetBooking.room_name ||
              resolveAccommodationName(preResolvedTargetBooking);
            const preIn = toThailandDateStr(
              preResolvedTargetBooking.checkin ||
              preResolvedTargetBooking.checkIn ||
              preResolvedTargetBooking.check_in ||
              preResolvedTargetBooking.startDate ||
              preResolvedTargetBooking.rooms?.[0]?.checkin ||
              preResolvedTargetBooking.rooms?.[0]?.startDate
            );
            const preOut = toThailandDateStr(
              preResolvedTargetBooking.checkout ||
              preResolvedTargetBooking.checkOut ||
              preResolvedTargetBooking.check_out ||
              preResolvedTargetBooking.endDate ||
              preResolvedTargetBooking.rooms?.[0]?.checkout ||
              preResolvedTargetBooking.rooms?.[0]?.endDate
            );

            const earlyTwinMatch = resolveTwinByProductOrName(preProd, preRoomName);
            if (earlyTwinMatch && preIn.length === 10 && preOut.length === 10 && preIn < preOut) {
              earlyCancelledTwin = { twinKey: earlyTwinMatch.key, checkIn: preIn, checkOut: preOut };
            }

            if (!isMirrorReservation(preResolvedTargetBooking) && preIdStr && preIn.length === 10 && preOut.length === 10) {
              const preStructId = preResolvedTargetBooking.accommodation?.id
                ? String(preResolvedTargetBooking.accommodation.id)
                : String(getOctorateStructureByRoomId(preProd || '').id);
              if (preStructId === '807324' || preStructId === '366879') {
                try {
                  const earlyMirrorRes = await mirrorReservationToStandby({
                    supabaseAdmin,
                    accessToken,
                    sourceStructureId: preStructId,
                    sourceReservationId: preIdStr,
                    productId: preProd,
                    roomName: preRoomName,
                    checkIn: preIn,
                    checkOut: preOut,
                    guestName: resolveGuestName(preResolvedTargetBooking),
                    isCancelled: true,
                    channelId: preResolvedTargetBooking.channelId,
                    channelRefer: preResolvedTargetBooking.channelRefer,
                    channelName: preResolvedTargetBooking.channelName,
                    color: preResolvedTargetBooking.color,
                    totalGross: Number(preResolvedTargetBooking.totalGross ?? preResolvedTargetBooking.roomGross ?? 0) || undefined,
                    origPrivateNotes: preResolvedTargetBooking.privateNotes || undefined
                  });
                  earlyMirrorHandled = true;
                  if (earlyMirrorRes.targetReservationId) {
                    const mIdStr = String(earlyMirrorRes.targetReservationId);
                    for (const b of bookingsData) {
                      if (String(b?.id || '') === mIdStr) {
                        b.status = 'CANCELLED';
                      }
                    }
                  }
                  console.log(`[OCTORATE WEBHOOK 24/7] 🔄 Early-mirror cancellazione pre-minStay #${preIdStr}:`, earlyMirrorRes);
                } catch (earlyMirrorErr) {
                  console.warn('[OCTORATE WEBHOOK 24/7] Early-mirror cancellazione warning:', earlyMirrorErr);
                }
              }
            }
          }
        }

        const calendarItems: any[] = [];
        try {
          // 🌟 Fetch contemporaneo griglia live (calendario) da tutte le strutture per catturare availability: 0 e stopSells
          await Promise.all(ALL_OCTORATE_STRUCTURE_IDS.map(async (structId) => {
            let page = 0;
            let hasMore = true;
            while (hasMore && page <= 10) {
              const calUrl = `https://api.octorate.com/connect/rest/v1/calendar/${structId}?dateFrom=${todayISO}&dateTo=${endISO}&size=50&page=${page}`;
              const calRes = await fetch(calUrl, {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  ...(clientId ? { 'Octorate-Api-Key': clientId } : {}),
                  'Accept': 'application/json'
                }
              });
              if (calRes.ok) {
                const calJson = await calRes.json();
                const pageItems = calJson && Array.isArray(calJson.data) ? calJson.data : (Array.isArray(calJson) ? calJson : []);
                if (pageItems.length > 0) {
                  calendarItems.push(...pageItems);
                  if (pageItems.length < 50) {
                    hasMore = false;
                  } else {
                    page++;
                  }
                } else {
                  hasMore = false;
                }
              } else {
                hasMore = false;
              }
            }
          }));
        } catch (calErr) {
          console.warn('[OCTORATE WEBHOOK] Failed to fetch live calendar grid from Octorate:', calErr);
        }

        const { activeSource: activeJungleSource, switchedAtMs: activeJungleSwitchedAtMs } =
          await getActiveJungleSourceWithMeta(supabaseAdmin);
        const nonMirrorBookings = bookingsData.filter(b => !isMirrorReservation(b));

        // 🔓 Dopo cancellazione su villa gemella: riapre le date liberate sulla struttura attiva e patcha calendarItems in memoria a latenza zero
        if (earlyCancelledTwin && calendarItems.length > 0) {
          try {
            const earlyClosedLocks = await loadClosedRoomLocks(supabaseAdmin);
            const reopenRes = await reopenFreedTwinDatesOnActiveStructure({
              accessToken,
              clientId,
              activeJungleSource,
              twinKey: earlyCancelledTwin.twinKey,
              checkInDate: earlyCancelledTwin.checkIn,
              checkOutDate: earlyCancelledTwin.checkOut,
              nonMirrorBookings,
              calendarItems,
              closedLocks: earlyClosedLocks
            });
            if (reopenRes.blocksSent > 0) {
              clearOctorateGridCache();
              console.log(`[OCTORATE WEBHOOK 24/7] 🔓 Riaperti ${reopenRes.blocksSent} blocchi su ${activeJungleSource} per ${earlyCancelledTwin.twinKey} (${earlyCancelledTwin.checkIn} -> ${earlyCancelledTwin.checkOut})`);
            }
          } catch (reopenErr) {
            console.warn('[OCTORATE WEBHOOK 24/7] Reopen twin dates warning (non-blocking):', reopenErr);
          }
        }

        const calculatedUpdates = calculateServerDynamicMinStay(
          nonMirrorBookings,
          { start: todayISO, end: endISO },
          calendarItems,
          activeJungleSource
        );

        calculatedUpdatesCount = calculatedUpdates.length;
        console.log(`[OCTORATE WEBHOOK 24/7] Calculated ${calculatedUpdates.length} gap-filling updates.`);

        // 🚨 [OVERBOOKING DETECTOR] Controllo collisioni e notifica istantanea Telegram allo Staff (esclude specchi MIRROR_SYNC)
        try {
          await checkAndNotifyOverbookings(nonMirrorBookings, supabaseAdmin, ALL_ACCOMMODATIONS_MAP);
        } catch (overErr) {
          console.warn('[OCTORATE WEBHOOK] Overbooking detection non-blocking warning:', overErr);
        }

        // Invio sincronizzazione in blocchi diff-only (solo giorni realmente disallineati vs calendarItems) specchiando anche la madre gemella in standby
        if (calculatedUpdates.length > 0) {
          const liveCalIdSet = new Set(calendarItems.map((it: any) => String(it?.id || '')).filter(Boolean));
          const liveMinStayByRoomDate = new Map<string, number>();
          for (const ci of calendarItems) {
            const rId = Number(ci?.id);
            if (!rId || !Array.isArray(ci?.days)) continue;
            for (const d of ci.days) {
              const dStr = String(d?.date || d?.day || '').slice(0, 10);
              const ms = Number(d?.minStay ?? d?.minstay ?? d?.minNights ?? 0);
              if (dStr && ms > 0) {
                liveMinStayByRoomDate.set(`${rId}_${dStr}`, ms);
              }
            }
          }

          const roomsPayloadMap = new Map<string, { room: number; dateFrom: string; dateTo: string; values: { minstay: number } }>();
          const pushExpandedSegments = (roomId: number, dateFrom: string, dateTo: string, minStay: number) => {
            if (liveCalIdSet.size > 0 && !liveCalIdSet.has(String(roomId))) return;
            const segments = expandMinStayEntryWithStandbyKeepAlive(
              roomId,
              dateFrom,
              dateTo,
              minStay,
              activeJungleSource
            );
            for (const seg of segments) {
              roomsPayloadMap.set(`${seg.room}_${seg.dateFrom}_${seg.dateTo}`, seg);
            }
          };

          for (const u of calculatedUpdates) {
            const primaryId = Number(u.roomTypeId);
            const minStayNum = Number(u.minStay);
            pushExpandedSegments(primaryId, u.dateFrom, u.dateTo, minStayNum);
            const companionId = getCompanionRateId(primaryId);
            if (companionId) {
              pushExpandedSegments(companionId, u.dateFrom, u.dateTo, minStayNum);
            }
          }

          const addOneDayISO = (iso: string): string => {
            const [y, m, d] = iso.split('-').map(Number);
            const dt = new Date(Date.UTC(y, (m || 1) - 1, (d || 1) + 1));
            return dt.toISOString().slice(0, 10);
          };

          const changedMinStayByRoom = new Map<number, Map<string, number>>();
          for (const seg of roomsPayloadMap.values()) {
            let cur = seg.dateFrom;
            let guard = 0;
            while (cur <= seg.dateTo && guard++ < 800) {
              const obs = liveMinStayByRoomDate.get(`${seg.room}_${cur}`);
              if (obs !== undefined && obs > 0 && obs !== seg.values.minstay) {
                let dayMap = changedMinStayByRoom.get(seg.room);
                if (!dayMap) {
                  dayMap = new Map<string, number>();
                  changedMinStayByRoom.set(seg.room, dayMap);
                }
                dayMap.set(cur, seg.values.minstay);
              }
              cur = addOneDayISO(cur);
            }
          }

          const roomsPayload: Array<{ room: number; dateFrom: string; dateTo: string; values: { minstay: number } }> = [];
          for (const [roomId, dayMap] of changedMinStayByRoom.entries()) {
            const sortedDates = Array.from(dayMap.keys()).sort();
            if (sortedDates.length === 0) continue;
            let subFrom = sortedDates[0];
            let subTo = sortedDates[0];
            let subMs = dayMap.get(sortedDates[0])!;
            for (let i = 1; i < sortedDates.length; i++) {
              const dStr = sortedDates[i];
              const ms = dayMap.get(dStr)!;
              if (dStr === addOneDayISO(subTo) && ms === subMs) {
                subTo = dStr;
              } else {
                roomsPayload.push({ room: roomId, dateFrom: subFrom, dateTo: subTo, values: { minstay: subMs } });
                subFrom = dStr;
                subTo = dStr;
                subMs = ms;
              }
            }
            roomsPayload.push({ room: roomId, dateFrom: subFrom, dateTo: subTo, values: { minstay: subMs } });
          }

          calculatedUpdatesCount = roomsPayload.length;

          if (roomsPayload.length > 0) {
            const chunkSize = 250;
            const chunks: any[][] = [];
            for (let c = 0; c < roomsPayload.length; c += chunkSize) {
              chunks.push(roomsPayload.slice(c, c + chunkSize));
            }

            // Invio sequenziale con backoff anti-quota per evitare HTTP 403 API_QUOTA_EXCEEDED su Octorate
            const { lastStatus } = await postOctorateCalendarBulkWithRetry(
              {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              chunks,
              {
                interBatchDelayMs: 1200,
                quotaRetryDelayMs: 2500,
                maxQuotaRetries: 2,
                logPrefix: '[OCTORATE WEBHOOK 24/7]'
              }
            );
            octorateStatus = lastStatus || 200;
            clearOctorateGridCache();

            // Sincronizzazione Gap-Fill su Octorate completata silenziosamente (zero spam Telegram)
            console.log(`[OCTORATE WEBHOOK 24/7] Gap-fill diff sync completed: ${roomsPayload.length} blocks (${changedMinStayByRoom.size} rooms) sent to Octorate.`);
          } else {
            octorateStatus = 200;
            console.log(`[OCTORATE WEBHOOK 24/7] Gap-fill diff sync: 0 mismatches vs Octorate live -> 0 /calendar/bulk calls.`);
          }
        }

        // 🛡️ [AUTO-SHIELD & NOTIFICHE PRENOTAZIONI REALI CERTIFICATE]
        try {
          const targetResId: any = earlyTargetResId;

          let targetBooking: any = preResolvedTargetBooking;

          if (targetResId && !targetBooking) {
            targetBooking = bookingsData.find(b => String(b.id) === String(targetResId));
            if (!targetBooking) {
              try {
                for (const sId of ALL_OCTORATE_STRUCTURE_IDS) {
                  const singleRes = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/${sId}/${targetResId}`, {
                    headers: {
                      'Authorization': `Bearer ${accessToken}`,
                      ...(clientId ? { 'Octorate-Api-Key': clientId } : {}),
                      'Accept': 'application/json'
                    }
                  });
                  if (singleRes.ok) {
                    targetBooking = await singleRes.json();
                    break;
                  }
                }
              } catch (fetchErr) {
                console.warn('[OCTORATE WEBHOOK] Failed to fetch single reservation for Auto-Shield:', fetchErr);
              }
            }
          }

          // Se il webhook invia direttamente l'oggetto prenotazione nel payload
          if (!targetBooking && (eventPayload?.checkin || eventPayload?.reservation?.checkin || eventPayload?.content?.checkin || eventPayload?.content?.reservation?.checkin || eventPayload?.check_in || eventPayload?.startDate)) {
            targetBooking = eventPayload.reservation || eventPayload.content?.reservation || eventPayload.content || eventPayload;
          }

          // Fallback intelligente: se il webhook prenotazione non includeva un ID esplicito, cerca prenotazioni reali create/aggiornate negli ultimi 15 minuti non ancora notificate
          if (!targetBooking && !targetResId && bookingsData.length > 0) {
            const nowMs = Date.now();
            const RECENT_WINDOW_MS = 15 * 60 * 1000;
            const recentNonMirrors = bookingsData
              .filter(b => b && b.id && !isMirrorReservation(b))
              .map(b => {
                const cMs = parseOctorateTimestampMs(b.createTime);
                const uMs = parseOctorateTimestampMs(b.updateTime);
                return { booking: b, cMs, uMs, latestMs: Math.max(cMs, uMs) };
              })
              .filter(item => item.latestMs > 0 && nowMs - item.latestMs <= RECENT_WINDOW_MS)
              .sort((a, b) => b.latestMs - a.latestMs);

            for (const { booking: cand, cMs, uMs } of recentNonMirrors) {
              const candId = String(cand.id);
              const candIn = toThailandDateStr(cand.checkin || cand.checkIn || cand.check_in || cand.startDate || cand.rooms?.[0]?.checkin || cand.rooms?.[0]?.startDate);
              const candOut = toThailandDateStr(cand.checkout || cand.checkOut || cand.check_out || cand.endDate || cand.rooms?.[0]?.checkout || cand.rooms?.[0]?.endDate);
              if (candIn.length !== 10 || candOut.length !== 10) continue;

              const candRoomId = cand.product || cand.pmsProduct || cand.accommodation_id || cand.roomId || cand.roomTypeId || '';
              const candTotalGross = cand.totalGross ?? cand.roomGross ?? cand.total ?? cand.totalPrice ?? 0;

              const { data: existingNotifiedRow } = await supabaseAdmin
                .from('telegram_config')
                .select('id, bot_token')
                .eq('id', `res_notified_${candId}`)
                .maybeSingle();

              const candRouting = classifyBookingTelegramEvent({
                reservationId: candId,
                eventType,
                booking: cand,
                checkIn: candIn,
                checkOut: candOut,
                roomId: candRoomId,
                totalGross: candTotalGross,
                createTimeMs: cMs,
                updateTimeMs: uMs,
                existingNotifiedRow
              });

              if (candRouting.kind === 'skip') continue;

              let alreadyNotifiedThisKey = false;
              if (candRouting.notificationKey === `res_notified_${candId}`) {
                alreadyNotifiedThisKey = Boolean(existingNotifiedRow);
              } else {
                const { data: existingNotifyRow } = await supabaseAdmin
                  .from('telegram_config')
                  .select('id')
                  .eq('id', candRouting.notificationKey)
                  .maybeSingle();
                alreadyNotifiedThisKey = Boolean(existingNotifyRow);
              }

              if (!alreadyNotifiedThisKey) {
                targetBooking = cand;
                console.log(`[OCTORATE WEBHOOK] Fallback ID da webhook senza payload ID: selezionata prenotazione recente #${candId} (${candRouting.notificationKey}, ${candRouting.reason}).`);
                break;
              }
            }
          }

          // Se l'evento non specifica un targetResId né un oggetto prenotazione, è un aggiornamento calendario/tariffe/stop-sells:
          // non dobbiamo selezionare a caso prenotazioni per evitare falsi allarmi e loop a catena.
          if (!targetBooking && !targetResId) {
            console.log(`[OCTORATE WEBHOOK] Evento '${eventType}' senza ID prenotazione specifico nel payload. Nessuna azione su prenotazioni.`);
          }

          if (targetBooking) {
            const rawIn = toThailandDateStr(targetBooking.checkin || targetBooking.checkIn || targetBooking.check_in || targetBooking.startDate || targetBooking.rooms?.[0]?.checkin || targetBooking.rooms?.[0]?.startDate);
            const rawOut = toThailandDateStr(targetBooking.checkout || targetBooking.checkOut || targetBooking.check_out || targetBooking.endDate || targetBooking.rooms?.[0]?.checkout || targetBooking.rooms?.[0]?.endDate);

            // Filtro anti-falsi allarmi: invia notifiche solo se le date sono reali e valide (lunghezza 10: YYYY-MM-DD)
            if (rawIn.length === 10 && rawOut.length === 10 && !rawIn.includes('undefined') && !rawOut.includes('undefined')) {
              const st = String(targetBooking.status || '').toUpperCase().trim();
              const guestName = resolveGuestName(targetBooking);
              const roomName = resolveAccommodationName(targetBooking);
              const channelName = targetBooking.channelName || targetBooking.channel || targetBooking.ota || (targetBooking.channelId === 233 ? 'Sito Web Diretto' : `OTA (#${targetBooking.channelId || 'N/D'})`);
              const reservationId = targetBooking.id || targetResId || 'N/D';

              // Calcolo durata esatta in notti
              let stayNights = 1;
              try {
                const dIn = new Date(`${rawIn}T00:00:00Z`);
                const dOut = new Date(`${rawOut}T00:00:00Z`);
                if (!isNaN(dIn.getTime()) && !isNaN(dOut.getTime())) {
                  stayNights = Math.max(1, Math.round((dOut.getTime() - dIn.getTime()) / (1000 * 60 * 60 * 24)));
                }
              } catch { }

              // Calcolo totale formattato
              const totalGross = targetBooking.totalGross ?? targetBooking.roomGross ?? targetBooking.total ?? targetBooking.totalPrice ?? 0;
              const currency = targetBooking.currency || 'THB';
              const formattedTotal = typeof totalGross === 'number'
                ? totalGross.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
                : String(totalGross);

              const isCancelled = isCancelledBookingEvent(targetBooking, eventType);

              // 🏷️ MULTI-STRUTTURA: Riconoscimento resort di appartenenza per badge Telegram
              const roomRawId = targetBooking.product || targetBooking.pmsProduct || targetBooking.accommodation_id || targetBooking.roomId || targetBooking.roomTypeId || '';
              const resortConfig = getOctorateStructureByRoomId(roomRawId);
              const resortBadge = `${resortConfig.badgeEmoji} <b>[${resortConfig.name.toUpperCase()}]</b>`;

              // 🔄 ANTI-ECO MIRROR: Le prenotazioni specchio [MIRROR_SYNC] non devono inviare notifiche o creare loop
              if (isMirrorReservation(targetBooking)) {
                isMirrorWebhookEvent = true;
                console.log(`[OCTORATE WEBHOOK] Prenotazione specchio [MIRROR_SYNC] #${reservationId} ignorata per anti-eco e anti-loop.`);
              } else {
                // 📲 1. Notifica Telegram Immediata allo Staff del Villaggio (Strict AWAIT per evitare Context Freeze di Vercel)
                let alreadySent = false;
                try {
                  let tgMessage = '';

                  const cMs = parseOctorateTimestampMs(targetBooking.createTime);
                  const uMs = parseOctorateTimestampMs(targetBooking.updateTime);
                  const notifiedRowId = `res_notified_${reservationId}`;
                  const { data: existingNotifiedRow } = await supabaseAdmin
                    .from('telegram_config')
                    .select('id, bot_token')
                    .eq('id', notifiedRowId)
                    .maybeSingle();

                  const routing = classifyBookingTelegramEvent({
                    reservationId,
                    eventType,
                    booking: targetBooking,
                    checkIn: rawIn,
                    checkOut: rawOut,
                    roomId: roomRawId,
                    totalGross,
                    createTimeMs: cMs,
                    updateTimeMs: uMs,
                    existingNotifiedRow
                  });

                  if (routing.kind === 'skip') {
                    alreadySent = true;
                    if (routing.shouldPersistNotifiedFingerprint) {
                      await supabaseAdmin.from('telegram_config').upsert({
                        id: notifiedRowId,
                        bot_token: routing.fingerprint,
                        chat_id: String(reservationId),
                        updated_at: new Date().toISOString()
                      });
                    }
                    console.log(`[OCTORATE WEBHOOK] Notifica Telegram per prenotazione #${reservationId} saltata (${routing.reason}).`);
                  } else if (routing.topic) {
                    if (routing.notificationKey !== notifiedRowId) {
                      const { data: alreadySentRow } = await supabaseAdmin
                        .from('telegram_config')
                        .select('id')
                        .eq('id', routing.notificationKey)
                        .maybeSingle();
                      alreadySent = Boolean(alreadySentRow);
                    } else {
                      alreadySent = Boolean(existingNotifiedRow);
                    }

                    if (!alreadySent) {
                      const twinPairForNotify = getJungleTwinPairByRateId(roomRawId);
                      const twinStructId = twinPairForNotify
                        ? (twinPairForNotify.jungleId === Number(roomRawId) ? '807324' : '366879')
                        : String(resortConfig.id);
                      const isTwinStandbyBooking =
                        Boolean(twinPairForNotify) &&
                        twinStructId !== String(activeJungleSource);

                      if (routing.kind === 'cancelled') {
                        tgMessage = `🔴 ${resortBadge} <b>CANCELLAZIONE PRENOTAZIONE</b>\n` +
                          `🏨 <b>Alloggio:</b> <b>${roomName}</b>\n` +
                          `👤 <b>Ospite:</b> <b>${guestName}</b>\n` +
                          `🌐 <b>Canale:</b> ${channelName}\n` +
                          `📅 <b>Periodo Annullato:</b> <code>${formatDateDMY(rawIn)} ➔ ${formatDateDMY(rawOut)}</code> (<b>${stayNights} notti</b>)\n` +
                          `💰 <b>Importo Rilasciato:</b> <b>${formattedTotal} ${currency}</b>\n` +
                          `🔖 <b>Codice Prenotazione:</b> <code>#${reservationId}</code>`;
                      } else if (routing.kind === 'modified') {
                        tgMessage = `🟡 ${resortBadge} <b>PRENOTAZIONE MODIFICATA</b>\n` +
                          `🏨 <b>Alloggio:</b> <b>${roomName}</b>\n` +
                          `👤 <b>Ospite:</b> <b>${guestName}</b>\n` +
                          `🌐 <b>Canale:</b> ${channelName}\n` +
                          `📅 <b>Nuovo Periodo:</b> <code>${formatDateDMY(rawIn)} ➔ ${formatDateDMY(rawOut)}</code> (<b>${stayNights} notti</b>)\n` +
                          `💰 <b>Totale Aggiornato:</b> <b>${formattedTotal} ${currency}</b>\n` +
                          `🔖 <b>Codice Prenotazione:</b> <code>#${reservationId}</code>`;
                      } else {
                        tgMessage = `🟢 ${resortBadge} <b>NUOVA PRENOTAZIONE RICEVUTA</b>\n` +
                          `🏨 <b>Alloggio:</b> <b>${roomName}</b>\n` +
                          `👤 <b>Ospite:</b> <b>${guestName}</b>\n` +
                          `🌐 <b>Canale:</b> ${channelName}\n` +
                          `📅 <b>Check-in:</b> <code>${formatDateDMY(rawIn)}</code>\n` +
                          `🛫 <b>Check-out:</b> <code>${formatDateDMY(rawOut)}</code>\n` +
                          `🌙 <b>Durata:</b> <b>${stayNights} notti</b>\n` +
                          `💰 <b>Totale:</b> <b>${formattedTotal} ${currency}</b>\n` +
                          `🔖 <b>Codice Prenotazione:</b> <code>#${reservationId}</code>`;
                      }

                      const standbyAlertKind = classifyStandbyBookingAlert({
                        isTwinStandby: isTwinStandbyBooking,
                        routingKind: routing.kind,
                        createTimeMs: cMs,
                        switchedAtMs: activeJungleSwitchedAtMs
                      });

                      if (standbyAlertKind === 'new_standby_alert') {
                        tgMessage =
                          `🚨 <b>[PRENOTAZIONE KEEP-ALIVE SU STRUTTURA IN STANDBY!]</b>\n` +
                          `🛡️ <i>Ricevuta su ${resortConfig.name} (in Standby con filtro 14+ notti / prezzo 2x). Clonata automaticamente sulla struttura principale e date chiuse su entrambe!</i>\n\n` +
                          tgMessage;
                      } else if (standbyAlertKind === 'legacy_pre_switch_update') {
                        const activeLabel = activeJungleSource === '366879' ? 'Flower Power Village' : 'Jungle Villas';
                        tgMessage += `\nℹ️ <i>Prenotazione storica su ${resortConfig.name} (creata prima dello switch): modifica già sincronizzata in automatico su ${activeLabel}.</i>`;
                      }

                      const tgRes = await sendDepartmentTelegramMessage('village', tgMessage, { topic: routing.topic });
                      console.log(`[OCTORATE WEBHOOK] Inviata notifica Telegram (${routing.kind} -> ${routing.topic}) per prenotazione #${reservationId}:`, tgRes);

                      if (standbyAlertKind === 'new_standby_alert') {
                        await sendDepartmentTelegramMessage(
                          'village',
                          `🚨 <b>PRENOTAZIONE RICEVUTA SU STRUTTURA IN STANDBY (${resortConfig.name})</b>\n` +
                          `🏨 <b>${roomName}</b> • 👤 <b>${guestName}</b>\n` +
                          `📅 <code>${formatDateDMY(rawIn)} ➔ ${formatDateDMY(rawOut)}</code> (<b>${stayNights} notti</b>)\n` +
                          `💰 <b>${formattedTotal} ${currency}</b> (<code>#${reservationId}</code>)\n\n` +
                          `✅ <i>La prenotazione è già stata clonata in automatico sulla struttura principale. Usa il pulsante qui sotto se desideri verificare o fare lo switch tra le strutture:</i>`,
                          {
                            topic: 'BOOKING_EDITOR',
                            replyMarkup: {
                              inline_keyboard: [
                                [{ text: '🔄 Apri Pannello /switchvillas', callback_data: 'swv:menu' }]
                              ]
                            }
                          }
                        );
                      }

                      // Memorizzazione chiave notifica inviata per non duplicare
                      await supabaseAdmin.from('telegram_config').upsert({
                        id: routing.notificationKey,
                        bot_token: routing.kind === 'new' ? routing.fingerprint : 'notified',
                        chat_id: String(reservationId),
                        updated_at: new Date().toISOString()
                      });

                      if (routing.shouldPersistNotifiedFingerprint && routing.notificationKey !== notifiedRowId) {
                        await supabaseAdmin.from('telegram_config').upsert({
                          id: notifiedRowId,
                          bot_token: routing.fingerprint,
                          chat_id: String(reservationId),
                          updated_at: new Date().toISOString()
                        });
                      }
                    } else {
                      console.log(`[OCTORATE WEBHOOK] Notifica Telegram per prenotazione #${reservationId} (${routing.notificationKey}) già inviata in precedenza. Ignorata per evitare duplicati.`);
                    }
                  }
                } catch (notifyErr) {
                  console.warn('[OCTORATE WEBHOOK] Errore creazione/invio notifica Telegram:', notifyErr);
                }

                // 🛡️ 2. Auto-Shield o Gestione Cancellazione Diretta (Anti-Loop: eseguito solo per nuove prenotazioni non ancora processate)
                if (!isCancelled) {
                  if (!alreadySent) {
                    await executeAutoShieldForReservation({
                      accessToken,
                      checkIn: toThailandDateStr(rawIn),
                      checkOut: toThailandDateStr(rawOut),
                      roomName: targetBooking.roomName || targetBooking.accommodation_name || roomName,
                      productId: targetBooking.product || targetBooking.accommodation_id,
                      pmsProductId: targetBooking.pmsProduct,
                      reservationId: targetBooking.id || targetResId,
                      guestName,
                      channelName: targetBooking.channelName || targetBooking.channel || 'OTA Webhook',
                      supabaseAdmin
                    });
                  } else {
                    console.log(`[OCTORATE WEBHOOK] Auto-Shield per #${reservationId} già sigillato in precedenza. Ignorato per evitare loop.`);
                  }
                } else if (!alreadySent) {
                  // ✉️ Gestione Cancellazione: Solo per prenotazioni dirette (Sito Web o Octorate interno), senza doppia notifica Telegram
                  try {
                    console.log(`[OCTORATE WEBHOOK] Rilevata cancellazione per prenotazione #${targetBooking.id || targetResId} (${targetBooking.channelName || targetBooking.channelId}). Avvio gestione diretta...`);
                    await handleDirectReservationCancellation(targetBooking, { skipTelegram: true });
                  } catch (cancelErr) {
                    console.warn('[OCTORATE WEBHOOK] Errore gestione cancellazione:', cancelErr);
                  }
                }

                // 🔄 3. Mirroring Automatico su Struttura Standby (807324 <-> 366879)
                if (!earlyMirrorHandled) {
                  try {
                    const mirrorOutcome = await mirrorReservationToStandby({
                      supabaseAdmin,
                      accessToken,
                      sourceStructureId: String(resortConfig.id),
                      sourceReservationId: reservationId,
                      productId: targetBooking.product || targetBooking.pmsProduct || targetBooking.accommodation_id,
                      roomName: targetBooking.roomName || targetBooking.accommodation_name || roomName,
                      checkIn: toThailandDateStr(rawIn),
                      checkOut: toThailandDateStr(rawOut),
                      guestName,
                      isCancelled,
                      channelId: targetBooking.channelId,
                      channelRefer: targetBooking.channelRefer,
                      channelName: targetBooking.channelName,
                      color: targetBooking.color,
                      totalGross: Number(targetBooking.totalGross ?? targetBooking.roomGross ?? 0) || undefined,
                      origPrivateNotes: targetBooking.privateNotes || undefined
                    });
                    if (mirrorOutcome.mirrored) {
                      console.log(`[OCTORATE WEBHOOK] 🔄 Mirroring ${mirrorOutcome.action} su ${mirrorOutcome.targetStructureId} (#${mirrorOutcome.targetReservationId})`);
                    }
                  } catch (mirrorErr) {
                    console.warn('[OCTORATE WEBHOOK] Errore mirroring standby (non bloccante):', mirrorErr);
                  }
                }
              } // Fine blocco non-mirror
            } else {
              console.log(`[OCTORATE WEBHOOK] Evento '${eventType}' senza intervallo date completo (${rawIn} ➔ ${rawOut}). Notifica Telegram ignorata.`);
            }
          } else {
            console.log(`[OCTORATE WEBHOOK] Evento '${eventType}' senza prenotazione associata. Notifica Telegram ignorata.`);
          }
        } catch (shieldErr) {
          console.warn('[OCTORATE WEBHOOK] Auto-Shield / Notification error (non-blocking):', shieldErr);
        }

        if (!isMirrorWebhookEvent || mirrorSyncedCounterpart) {
          // 🔒 [ANTI-REOPEN SHIELD] Verifica e risigillatura immediata stanze chiuse (Hard-Lock)
          try {
            const closedLocks = await loadClosedRoomLocks(supabaseAdmin);
            const activeLocks = closedLocks.filter(l => l.enabled !== false);
            if (activeLocks.length > 0 && calendarItems.length > 0) {
              for (const lock of activeLocks) {
                const sealRes = await sealLockedRoomRangeOnOctorate({
                  accessToken,
                  clientId,
                  roomKeyOrId: lock.roomKey,
                  dateFrom: lock.dateFrom,
                  dateTo: lock.dateTo,
                  calendarItems,
                  logPrefix: '[OCTORATE WEBHOOK HARD-LOCK]'
                });

                if (sealRes.sealedEntries > 0) {
                  clearOctorateGridCache();
                  const lockAlertMsg =
                    `🛡️ <b>[ANTI-REOPEN SHIELD — STANZA CHIUSA RISIGILLATA]</b>\n` +
                    `🏨 <b>Alloggio:</b> <b>${lock.roomName}</b>\n` +
                    `📅 <b>Periodo Protetto:</b> <code>${formatDateDMY(lock.dateFrom)} ➔ ${formatDateDMY(lock.dateTo)}</code>\n` +
                    `🔒 Rilevate <b>${sealRes.sealedDatesCount}</b> notti riaperte da Octorate (es. dopo cancellazione/riduzione): riportate istantaneamente a <code>avail=0</code> + <code>StopSell=ON</code> su Madre e tutte le derivate.`;
                  await sendDepartmentTelegramMessage('village', lockAlertMsg, { topic: 'ALERTS_OVERBOOKING' });
                }
              }
            }

            // ⚠️ Rete di sicurezza per stanze NON in Hard-Lock: avvisa se una cancellazione/modifica riapre notti tra giorni chiusi
            if (preResolvedTargetBooking && calendarItems.length > 0) {
              const stTarget = String(preResolvedTargetBooking.status || '').toUpperCase().trim();
              const isTargetCancelledOrMod =
                stTarget === 'CANCELLED' || stTarget === 'CANCELED' || stTarget === 'DELETED' || stTarget === 'VOID' || stTarget === 'REJECTED' ||
                eventType.toUpperCase().includes('CANCEL') ||
                eventType.toUpperCase().includes('CHANGE') ||
                eventType.toUpperCase().includes('MODIF') ||
                eventType.toUpperCase().includes('UPDATE');

              if (isTargetCancelledOrMod) {
                const tIn = toThailandDateStr(preResolvedTargetBooking.checkin || preResolvedTargetBooking.checkIn);
                const tOut = toThailandDateStr(preResolvedTargetBooking.checkout || preResolvedTargetBooking.checkOut);
                const tProd = preResolvedTargetBooking.product || preResolvedTargetBooking.pmsProduct || preResolvedTargetBooking.accommodation_id || preResolvedTargetBooking.roomId;
                const tRoom = resolveLockableRoom(tProd) || resolveLockableRoom(preResolvedTargetBooking.roomName || preResolvedTargetBooking.accommodation_name);

                if (tRoom && tIn.length === 10 && tOut.length === 10 && !isDateLockedForRoom(activeLocks, tRoom.roomKey, tIn)) {
                  const motherCalItem = calendarItems.find((it: any) => Number(it?.id || it?.productId) === tRoom.motherId);
                  const daysArr = Array.isArray(motherCalItem?.calendar) ? motherCalItem.calendar : (Array.isArray(motherCalItem?.days) ? motherCalItem.days : []);
                  const dayByDate = new Map<string, any>();
                  for (const d of daysArr) {
                    const ds = String(d?.date || d?.day || '').slice(0, 10);
                    if (ds) dayByDate.set(ds, d);
                  }

                  const prevD = new Date(`${tIn}T00:00:00Z`);
                  prevD.setUTCDate(prevD.getUTCDate() - 1);
                  const dayBeforeStr = prevD.toISOString().slice(0, 10);
                  const dayBefore = dayByDate.get(dayBeforeStr);
                  const dayAfter = dayByDate.get(tOut);
                  const firstFreed = dayByDate.get(tIn);

                  const isClosedDay = (d: any) => Boolean(d && (Number(d.availability ?? 0) <= 0 || d.stopSells === true || d.closed === true));
                  const isOpenDay = (d: any) => Boolean(d && Number(d.availability ?? 0) > 0 && d.stopSells !== true && d.closed !== true);

                  if (isOpenDay(firstFreed) && isClosedDay(dayBefore) && isClosedDay(dayAfter)) {
                    const warnKey = `reopen_warn_${preResolvedTargetBooking.id || earlyTargetResId}_${tIn}_${tOut}`;
                    const { data: alreadyWarned } = await supabaseAdmin
                      .from('telegram_config')
                      .select('id')
                      .eq('id', warnKey)
                      .maybeSingle();

                    if (!alreadyWarned) {
                      await sendDepartmentTelegramMessage(
                        'village',
                        `⚠️ <b>[AVVISO NOTTI RIAPERTE TRA GIORNI CHIUSI]</b>\n` +
                        `🏨 <b>Alloggio:</b> <b>${tRoom.name}</b>\n` +
                        `📅 <b>Periodo liberato:</b> <code>${formatDateDMY(tIn)} ➔ ${formatDateDMY(tOut)}</code>\n` +
                        `🔎 I giorni prima e dopo risultano chiusi, ma la cancellazione/modifica ha riaperto queste notti su Octorate. Se la stanza deve restare chiusa, attiva il <b>Lock Stanze Chiuse</b> dalla Dashboard.`,
                        { topic: 'ALERTS_OVERBOOKING' }
                      );
                      await supabaseAdmin.from('telegram_config').upsert({
                        id: warnKey,
                        bot_token: 'notified',
                        chat_id: String(preResolvedTargetBooking.id || earlyTargetResId || tRoom.roomKey),
                        updated_at: new Date().toISOString()
                      });
                    }
                  }
                }
              }
            }
          } catch (lockErr) {
            console.warn('[OCTORATE WEBHOOK] Closed room hard-lock warning:', lockErr);
          }

          // ⚡ [CASCADE LAST-MINUTE 24/7] Verifica e rinnovo automatico finestra 7 giorni sconti a cascata
          try {
            await checkAndSyncCascadeLastMinute(accessToken, supabaseAdmin, false, 'octorate-webhook');
          } catch (cascadeErr) {
            console.warn('[OCTORATE WEBHOOK] Cascade sync non-fatal warning:', cascadeErr);
          }

          // 🔄 [MIRROR AUTO-SYNC 60GG] Riallinea eventuali modifiche prezzi manuali fatte dentro il portale web Octorate
          try {
            await syncActiveToStandbyCalendar(supabaseAdmin, accessToken, {
              daysAhead: 60,
              ...(mirrorSyncedCounterpart ? { force: true } : {})
            });
          } catch (mirrorSyncErr) {
            console.warn('[OCTORATE WEBHOOK] Standby calendar auto-sync warning (non-blocking):', mirrorSyncErr);
          }
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
