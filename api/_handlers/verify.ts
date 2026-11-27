import { VercelRequest, VercelResponse } from "@vercel/node";
import { stripe } from "../_helpers/stripe.js";
import { createClient } from "@supabase/supabase-js";
import { generateConfirmationPDF, sendConfirmationEmail } from "../_helpers/booking-confirmation.js";
import { executeAutoShieldForReservation } from "../_helpers/octorate-auto-shield.js";
import {
  getPendingBookingAsync,
  updatePendingBookingStatusAsync
} from "../_helpers/pending-bookings.js";
import { resolveOctorateBookingTarget } from "../_helpers/octorate-booking-target.js";
import { mirrorReservationToStandby } from "../_helpers/octorate-jungle-mirror.js";
import { sendDepartmentTelegramMessage } from "../_helpers/telegram.js";
import { verifyLiveAvailabilityForCheckout } from "../_helpers/octorate-availability-guard.js";
import { clearOctorateGridCache } from "./octorate.js";
import * as https from "https";

// Robust HTTP POST using Node built-in https — avoids global fetch() issues in vercel dev on Windows
function httpsPost(url: string, body: object, headers: Record<string, string>): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const payload = JSON.stringify(body);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        ...headers
      },
      timeout: 20000
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => resolve({ status: res.statusCode || 0, body: data }));
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(new Error("Octorate request timed out after 20s")); });
    req.write(payload);
    req.end();
  });
}

// Initialize Supabase (use service role key to bypass RLS and read octorate_tokens)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null as any;

export interface FinalizeBookingInput {
  sessionId: string;
  gateway: "ksher" | "stripe" | string;
  paymentIntentId?: string;
  metadata: Record<string, any>;
  websiteUrl?: string;
  skipEmail?: boolean;
  supabaseOverride?: any;
}

export interface FinalizeBookingResult {
  paid: boolean;
  alreadyProcessed?: boolean;
  overbookingBlocked?: boolean;
  stripeSessionId: string;
  paymentIntentId: string;
  octorateReservationId: string | null;
  octorateStructureId: string | null;
  octorateProductId: number | null;
  octorateStatus: string | null;
  octorateError: string | null;
  finalTotal: number;
  depositPaid: number;
  balanceDue: number;
  promoCode: string | null;
  discountAmount: number;
  bookingData: Record<string, any>;
}

/**
 * Core idempotent booking finalizer shared between:
 *  - Frontend redirect verification (`/api/verify-checkout-session`)
 *  - Ksher server-to-server webhook (`/api/payments-admin?action=ksher-notify`)
 *
 * Guarantees:
 *  1. Dynamic multi-structure Octorate routing (`366879`, `807324`, `619403`) + active Jungle source
 *  2. Automatic fallback from BE Rate Plan ID to Mother ID if Octorate rejects a derived product
 *  3. Immediate Jungle standby mirror + Auto-Shield closure of derived OTA rates
 *  4. Cross-lambda idempotency via Supabase (`pending_booking_<sessionId>`)
 *  5. Immediate red Telegram alert (`ALERTS_OVERBOOKING`) if Octorate creation fails for any reason
 */
export async function finalizeWebsiteBooking(input: FinalizeBookingInput): Promise<FinalizeBookingResult> {
  const sb = input.supabaseOverride || supabase;
  const { sessionId, metadata } = input;
  const isKsher = input.gateway === "ksher" || sessionId.startsWith("FPBK");
  const paymentIntentId = input.paymentIntentId || (isKsher ? `KSHER-${sessionId}` : "");

  const {
    accommodationId,
    accommodationName,
    checkIn,
    checkOut,
    guests,
    guestName,
    guestEmail,
    guestPhone,
    extraBreakfast,
    extraAC,
    totalPrice,
    depositPaid,
    balanceDue
  } = metadata;

  const finalTotalAmt     = Number(metadata?.grandTotal || metadata?.finalTotal || metadata?.totalPrice || totalPrice || 0);
  const depositPaidAmt    = Number(metadata?.depositAmount || metadata?.depositPaid || depositPaid || Math.round(finalTotalAmt * 0.3));
  const balanceDueAmt     = Number(metadata?.balanceDue || balanceDue || (finalTotalAmt - depositPaidAmt));
  const promoCodeVal      = metadata?.promoCode || null;
  const discountAmountVal = Number(metadata?.discountAmount || metadata?.promoDiscountAmount || 0);

  const buildBookingData = () => ({
    accommodationId: Number(accommodationId),
    accommodationName: accommodationName || metadata?.roomName || "",
    checkIn,
    checkOut,
    guests: Number(guests || 1),
    guestName,
    guestEmail,
    guestPhone,
    extraBreakfast: extraBreakfast === "true" || extraBreakfast === true,
    extraAC: extraAC === "true" || extraAC === true,
    totalPrice: finalTotalAmt,
    depositPaid: depositPaidAmt,
    balanceDue: balanceDueAmt,
    finalTotal: finalTotalAmt,
    promoCode: promoCodeVal,
    discountAmount: discountAmountVal
  });

  // 0. Cross-lambda idempotency check (for Ksher & Stripe)
  if (metadata?.emailSent === "true" && metadata?.octorateReservationId) {
    console.log(`[Verify API] Session ${sessionId} already verified via Stripe metadata.`);
    return {
      paid: true,
      alreadyProcessed: true,
      stripeSessionId: sessionId,
      paymentIntentId,
      octorateReservationId: metadata.octorateReservationId,
      octorateStructureId: metadata.octorateStructureId || null,
      octorateProductId: Number(accommodationId) || null,
      octorateStatus: "confirmed",
      octorateError: null,
      finalTotal: finalTotalAmt,
      depositPaid: depositPaidAmt,
      balanceDue: balanceDueAmt,
      promoCode: promoCodeVal,
      discountAmount: discountAmountVal,
      bookingData: buildBookingData()
    };
  }

  if (isKsher && sb) {
    const existingRecord = await getPendingBookingAsync(sessionId, sb);
    if (existingRecord?.status === "confirmed" && existingRecord.octorateReservationId) {
      console.log(`[Verify API] Ksher session ${sessionId} already finalized on Octorate (#${existingRecord.octorateReservationId}). Returning cached result.`);
      return {
        paid: true,
        alreadyProcessed: true,
        stripeSessionId: sessionId,
        paymentIntentId,
        octorateReservationId: existingRecord.octorateReservationId,
        octorateStructureId: existingRecord.octorateStructureId || null,
        octorateProductId: Number(accommodationId) || null,
        octorateStatus: "confirmed",
        octorateError: null,
        finalTotal: finalTotalAmt,
        depositPaid: depositPaidAmt,
        balanceDue: balanceDueAmt,
        promoCode: promoCodeVal,
        discountAmount: discountAmountVal,
        bookingData: buildBookingData()
      };
    }
  }

  // 1. Resolve exact Octorate structure & product ID dynamically (handles 366879, 807324, 619403 + active Jungle source)
  const target = await resolveOctorateBookingTarget(
    accommodationId,
    sb,
    accommodationName || metadata?.roomName || ""
  );

  // 1a. 🛡️ BARRIERA 3 (PRE-INSERT RACE CONDITION GATE):
  // Verifica live su Octorate prima di forzare POST /reservation/{structureId}.
  // Se un'OTA (Booking/Airbnb/Agoda) ha prenotato nei 2 minuti mentre il cliente pagava su Ksher/Stripe,
  // blocca l'inserimento in overbooking e invia subito un allarme rosso critico allo staff.
  const preInsertGuard = await verifyLiveAvailabilityForCheckout({
    accommodationId,
    roomNameHint: target.roomName || accommodationName || metadata?.roomName || "",
    checkIn,
    checkOut,
    lang: metadata?.lang || "EN",
    supabaseAdmin: sb,
    excludeSessionId: sessionId,
    skipSoftHoldCheck: true
  });

  if (!preInsertGuard.ok && preInsertGuard.statusCode === 409) {
    const conflictDetail = preInsertGuard.conflictingReservation
      ? `Conflitto con prenotazione #${preInsertGuard.conflictingReservation.id} (${preInsertGuard.conflictingReservation.channelName}, ${preInsertGuard.conflictingReservation.roomName}, ${preInsertGuard.conflictingReservation.checkIn} → ${preInsertGuard.conflictingReservation.checkOut} su struttura ${preInsertGuard.conflictingReservation.structureId})`
      : (preInsertGuard.reason || "Date risultate occupate su Octorate durante il pagamento");

    console.error(`[Verify API] 🚨 OVERBOOKING BLOCKED PRE-INSERT for session ${sessionId}: ${conflictDetail}`);

    try {
      const alertLines = [
        `🚨 <b>OVERBOOKING BLOCCATO AUTOMATICO — PAGAMENTO GIA' INCASSATO!</b>`,
        ``,
        `🛡️ <b>Il sistema ha impedito la creazione della doppia prenotazione su Octorate.</b>`,
        `⚠️ <b>AZIONE IMMEDIATA RICHIESTA:</b> Contattare subito l'ospite per rimborso o proposta di alloggio alternativo!`,
        ``,
        `👤 <b>Ospite:</b> ${guestName || "-"}`,
        `📧 <b>Email:</b> ${guestEmail || "-"}`,
        `📞 <b>Telefono:</b> ${guestPhone || "-"}`,
        `🏡 <b>Alloggio richiesto:</b> ${target.roomName || accommodationName || `#${accommodationId}`} (Struttura ${target.structureId})`,
        `📅 <b>Soggiorno:</b> ${checkIn} → ${checkOut}`,
        `💰 <b>Caparra Incassata:</b> ${depositPaidAmt.toLocaleString("en")} ฿ | <b>Totale:</b> ${finalTotalAmt.toLocaleString("en")} ฿`,
        `🧾 <b>Sessione Gateway:</b> <code>${sessionId}</code> (${isKsher ? "Ksher" : "Stripe"})`,
        `⚡ <b>Motivo Blocco:</b> ${conflictDetail}`
      ];
      await sendDepartmentTelegramMessage("village", alertLines.join("\n"), { topic: "ALERTS_OVERBOOKING" });
    } catch (tgErr) {
      console.error("[Verify API] Failed to send overbooking-blocked Telegram alert:", tgErr);
    }

    if (isKsher && sb) {
      await updatePendingBookingStatusAsync(
        sessionId,
        {
          status: "overbooking_blocked",
          octorateReservationId: null,
          octorateStructureId: target.structureId,
          octorateError: conflictDetail
        },
        sb
      );
    }

    return {
      paid: true,
      overbookingBlocked: true,
      stripeSessionId: sessionId,
      paymentIntentId,
      octorateReservationId: null,
      octorateStructureId: target.structureId,
      octorateProductId: target.productId,
      octorateStatus: "overbooking_blocked",
      octorateError: conflictDetail,
      finalTotal: finalTotalAmt,
      depositPaid: depositPaidAmt,
      balanceDue: balanceDueAmt,
      promoCode: promoCodeVal,
      discountAmount: discountAmountVal,
      bookingData: buildBookingData()
    };
  }

  let octorateReservationId: string | null = null;
  let octorateStatus: string | null = null;
  let octorateError: string | null = null;
  let usedProductId: number = target.productId;

  try {
    const { data: tokenData } = sb
      ? await sb.from("octorate_tokens").select("access_token, refresh_token").eq("id", "singleton").maybeSingle()
      : { data: null };

    if (tokenData?.access_token) {
      const OCTORATE_API_BASE = "https://api.octorate.com/connect/rest/v1";
      const now = new Date().toISOString();
      const [givenName, ...lastNameParts] = String(guestName || "Guest Guest").trim().split(/\s+/);
      const familyName = lastNameParts.join(" ") || "Guest";
      const totalGuest = Number(guests || 1);

      const guestsList = [{
        type: "BOOKER",
        givenName,
        familyName,
        email: guestEmail || "",
        phone: guestPhone || "",
        checkin: checkIn,
        checkout: checkOut,
        sex: "MALE"
      }];

      const sessionSuffix = sessionId.replace(/^cs_test_|^cs_/, "");
      const refer = (Date.now().toString(36).substring(0, 8) + sessionSuffix.slice(-17)).substring(0, 25);

      const computedDays = (checkIn && checkOut)
        ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
        : 1;
      const stayNights           = Number(metadata?.nights || computedDays || 1);
      const discountPct          = Number(metadata?.discountPercent || 0);
      const hasAC                = extraAC === "true" || extraAC === true;
      const hasBreakfast         = extraBreakfast === "true" || extraBreakfast === true;
      const numGuests            = Number(guests || 1);
      const breakfastCount       = hasBreakfast ? numGuests * stayNights : 0;
      const promoCode            = metadata?.promoCode || "";
      const discountType         = metadata?.discountType || "";
      const discountValue        = metadata?.discountValue || "0";
      const promoDiscountAmount  = Number(metadata?.promoDiscountAmount || metadata?.discountAmount || 0);
      const directDiscountAmount = Number(metadata?.directDiscountAmount || 0);

      let discountLine = "";
      let promoLine = "";

      if (promoCode) {
        const formattedDisc = discountType === "percentage" ? `-${discountValue}%` : `-${discountValue} ฿`;
        discountLine = `Discount Applied    : EXCLUSIVE PROMO COUPON (${promoCode})`;
        promoLine    = `Coupon Details      : ${promoCode} (${formattedDisc}, saved ${promoDiscountAmount.toLocaleString("en")} ฿)`;
      } else if (directDiscountAmount > 0 || discountPct > 0) {
        const savedStr = directDiscountAmount > 0 ? `saved ${directDiscountAmount.toLocaleString("en")} ฿` : `-${discountPct}%`;
        discountLine = `Discount Applied    : Standard Direct Stay Discount (${savedStr})`;
      } else {
        discountLine = `Discount Applied    : None`;
      }

      const formatDisplayDate = (dStr: string) => {
        if (!dStr) return "";
        const p = dStr.slice(0, 10).split(/[\/\-]/);
        return p.length === 3 && p[0].length === 4 ? `${p[2]}/${p[1]}/${p[0]}` : dStr;
      };

      const breakfastLine = hasBreakfast
        ? `Breakfast           : YES — ${breakfastCount} breakfast${breakfastCount !== 1 ? "s" : ""} (${numGuests} guest${numGuests !== 1 ? "s" : ""} × ${stayNights} night${stayNights !== 1 ? "s" : ""})`
        : `Breakfast           : No`;

      const acLine = hasAC
        ? `Air Conditioning    : YES — AC surcharge included`
        : `Air Conditioning    : No`;

      // Rule 28: 100% English, BALANCE DUE first, ฿ after figure, flush left
      const notesLines = [
        `=== FLOWER POWER VILLAGE — BOOKING SUMMARY ===`,
        `BALANCE DUE         : ${balanceDueAmt.toLocaleString("en")} ฿`,
        `Total Amount        : ${finalTotalAmt.toLocaleString("en")} ฿`,
        `Deposit Paid        : ${depositPaidAmt.toLocaleString("en")} ฿`,
        breakfastLine,
        acLine,
        `Stay                : ${stayNights} night${stayNights !== 1 ? "s" : ""} (${formatDisplayDate(checkIn)} → ${formatDisplayDate(checkOut)})`,
        discountLine
      ];
      if (promoLine) {
        notesLines.push(promoLine);
      }
      notesLines.push(
        `Gateway & Session   : ${isKsher ? "Ksher (PromptPay/Card)" : "Stripe"} - ${sessionId}`,
        `===============================================`
      );

      const privateNotes = notesLines.join("\n");

      const buildReservationBody = (productIdToUse: number) => ({
        status: "CONFIRMED",
        refer,
        channelId: 233,
        product: productIdToUse,
        checkin: `${checkIn}T14:00:00Z`,
        checkout: `${checkOut}T12:00:00Z`,
        createTime: now,
        updateTime: now,
        guests: guestsList,
        roomGross: finalTotalAmt,
        totalGuest,
        totalChildren: 0,
        totalInfants: 0,
        privateNotes
      });

      const targetEndpoint = `${OCTORATE_API_BASE}/reservation/${target.structureId}`;
      console.log(`[Verify API] Posting to Octorate: ${targetEndpoint} (structure=${target.structureName}, product=${target.productId}, mother=${target.motherId}, isJungle=${target.isJungle})`);

      let currentToken = tokenData.access_token;

      const httpsPostForm = (url: string, params: Record<string, string>, hdrs: Record<string, string> = {}): Promise<{ status: number; body: string }> =>
        new Promise((resolve, reject) => {
          const payload = new URLSearchParams(params).toString();
          const parsed = new URL(url);
          const req = https.request({
            hostname: parsed.hostname, path: parsed.pathname + parsed.search, method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(payload), ...hdrs },
            timeout: 15000
          }, (res) => { let d = ""; res.on("data", c => d += c); res.on("end", () => resolve({ status: res.statusCode || 0, body: d })); });
          req.on("error", reject);
          req.on("timeout", () => req.destroy(new Error("refresh token timeout")));
          req.write(payload); req.end();
        });

      let octRaw = await httpsPost(targetEndpoint, buildReservationBody(usedProductId), { "Authorization": `Bearer ${currentToken}` });
      console.log("[Verify API] Octorate initial response status:", octRaw.status);

      if (octRaw.status === 401 && tokenData.refresh_token) {
        console.log("[Verify API] 401 - Octorate token expired, attempting refresh...");
        const refreshRaw = await httpsPostForm(`${OCTORATE_API_BASE}/identity/refresh`, {
          grant_type: "refresh_token",
          refresh_token: tokenData.refresh_token,
          client_id: process.env.VITE_OCTORATE_CLIENT_ID || "",
          client_secret: process.env.OCTORATE_SECRET_KEY || process.env.VITE_OCTORATE_SECRET_KEY || "",
        });

        if (refreshRaw.status >= 200 && refreshRaw.status < 300) {
          const newTokens = JSON.parse(refreshRaw.body);
          currentToken = newTokens.access_token;
          if (sb) {
            await sb.from("octorate_tokens").upsert({
              id: "singleton",
              access_token: newTokens.access_token,
              refresh_token: newTokens.refresh_token || tokenData.refresh_token,
              expires_in: newTokens.expires_in,
              updated_at: new Date().toISOString()
            });
          }
          octRaw = await httpsPost(targetEndpoint, buildReservationBody(usedProductId), { "Authorization": `Bearer ${currentToken}` });
          console.log("[Verify API] Octorate retry-after-refresh response status:", octRaw.status);
        } else {
          console.error("[Verify API] Token refresh FAILED:", refreshRaw.status, refreshRaw.body);
        }
      }

      // Fallback: if Octorate rejects the BE Rate Plan ID (400/404/422), retry automatically with Mother ID on the same structure
      if ((octRaw.status === 400 || octRaw.status === 404 || octRaw.status === 422) && target.motherId && target.motherId !== usedProductId) {
        console.warn(`[Verify API] Octorate rejected product ${usedProductId} on structure ${target.structureId} (${octRaw.status}). Retrying with Mother ID ${target.motherId}...`);
        usedProductId = target.motherId;
        octRaw = await httpsPost(targetEndpoint, buildReservationBody(usedProductId), { "Authorization": `Bearer ${currentToken}` });
        console.log("[Verify API] Octorate Mother ID fallback response status:", octRaw.status);
      }

      if (octRaw.status >= 200 && octRaw.status < 300) {
        const octData = JSON.parse(octRaw.body);
        octorateReservationId = String(octData.id || octData.reservationId || "") || null;
        octorateStatus = "confirmed";
        // Invalida subito la cache in-memory della griglia Octorate così la camera sparisce immediatamente dal sito
        try { clearOctorateGridCache(); } catch {}
        console.log(`[Verify API] Octorate reservation created: #${octorateReservationId} on structure ${target.structureId} (product ${usedProductId})`);

        if (octorateReservationId) {
          // 1b. Register deposit payment on the SAME target structure
          const paymentBody = {
            paymentMode: "CREDITCARD",
            referenceTime: new Date().toISOString(),
            amount: depositPaidAmt,
            transaction: paymentIntentId || sessionId,
            description: `Deposit paid via ${isKsher ? "Ksher" : "Stripe"} - Session: ${sessionId}`,
            status: "NORMAL"
          };

          try {
            const payRaw = await httpsPost(
              `${OCTORATE_API_BASE}/reservation/${target.structureId}/${octorateReservationId}/payment`,
              paymentBody,
              { "Authorization": `Bearer ${currentToken}` }
            );
            if (payRaw.status >= 200 && payRaw.status < 300) {
              console.log(`[Verify API] Octorate deposit payment registered (฿${depositPaidAmt}).`);
            } else {
              console.warn(`[Verify API] Failed to register deposit payment in Octorate:`, payRaw.status, payRaw.body);
            }
          } catch (payErr: any) {
            console.error(`[Verify API] Error registering Octorate payment:`, payErr);
          }

          // 1c. Mirror Jungle reservation to standby structure immediately
          if (target.isJungle) {
            try {
              console.log(`[Verify API] Mirroring Jungle reservation #${octorateReservationId} from ${target.structureId} to standby structure...`);
              await mirrorReservationToStandby({
                supabaseAdmin: sb,
                accessToken: currentToken,
                sourceStructureId: target.structureId,
                sourceReservationId: octorateReservationId,
                productId: usedProductId,
                roomName: target.roomName || accommodationName || "",
                checkIn,
                checkOut,
                guestName,
                isCancelled: false,
                channelId: 233,
                channelName: isKsher ? "Website Direct (Ksher)" : "Website Direct (Stripe)",
                totalGross: finalTotalAmt,
                origPrivateNotes: privateNotes
              });
            } catch (mirrorErr) {
              console.warn("[Verify API] Jungle mirror non-fatal warning:", mirrorErr);
            }
          }

          // 1d. Post-Booking Auto-Shield: close all derived OTA rates for this accommodation & dates
          try {
            console.log(`[Verify API] Triggering Auto-Shield for reservation #${octorateReservationId} (product=${usedProductId})...`);
            await executeAutoShieldForReservation({
              accessToken: currentToken,
              checkIn,
              checkOut,
              roomName: target.roomName || accommodationName || metadata?.roomName || "",
              productId: usedProductId,
              reservationId: octorateReservationId,
              guestName,
              channelName: isKsher ? "Sito Web Diretto (Ksher)" : "Sito Web Diretto (Stripe)",
              supabaseAdmin: sb
            });
          } catch (shieldErr) {
            console.warn("[Verify API] Auto-Shield non-fatal warning:", shieldErr);
          }
        }
      } else {
        octorateError = `Octorate API error (${octRaw.status}) on structure ${target.structureId} product ${usedProductId}: ${octRaw.body}`;
        console.error(`[Verify API] ${octorateError}`);
      }
    } else {
      octorateError = `Octorate non connesso (token mancante). Prenotazione registrata solo su ${isKsher ? "Ksher" : "Stripe"}.`;
      console.error(`[Verify API] ${octorateError}`);
    }
  } catch (octErr: any) {
    octorateError = `Octorate exception on structure ${target.structureId}: ${octErr.message}`;
    console.error("[Verify API] Octorate reservation error:", octErr);
  }

  // 2. CRITICAL ALERT ON TELEGRAM IF OCTORATE FAILED (Prevents silent overbooking!)
  if (!octorateReservationId && octorateError) {
    try {
      const alertLines = [
        `🚨 <b>ALLARME CRITICO: PRENOTAZIONE SITO PAGATA MA NON REGISTRATA SU OCTORATE!</b>`,
        ``,
        `⚠️ <b>AZIONE IMMEDIATA RICHIESTA:</b> Inserire manualmente su Octorate per evitare overbooking sulle OTA!`,
        ``,
        `👤 <b>Ospite:</b> ${guestName || "-"}`,
        `📧 <b>Email:</b> ${guestEmail || "-"}`,
        `📞 <b>Telefono:</b> ${guestPhone || "-"}`,
        `🏡 <b>Alloggio:</b> ${target.roomName || accommodationName || `#${accommodationId}`} (Struttura ${target.structureId})`,
        `📅 <b>Soggiorno:</b> ${checkIn} → ${checkOut}`,
        `💰 <b>Totale:</b> ${finalTotalAmt.toLocaleString("en")} ฿ | <b>Caparra Pagata:</b> ${depositPaidAmt.toLocaleString("en")} ฿ | <b>Saldo:</b> ${balanceDueAmt.toLocaleString("en")} ฿`,
        `🧾 <b>Sessione Gateway:</b> <code>${sessionId}</code> (${isKsher ? "Ksher" : "Stripe"})`,
        `❌ <b>Errore Octorate:</b> <code>${String(octorateError).slice(0, 300)}</code>`
      ];
      await sendDepartmentTelegramMessage("village", alertLines.join("\n"), { topic: "ALERTS_OVERBOOKING" });
    } catch (tgErr) {
      console.error("[Verify API] Failed to send critical Telegram alert:", tgErr);
    }
  }

  // 3. Persist final status to Supabase BEFORE/AFTER email so webhook & redirect stay idempotent
  if (isKsher && sb) {
    await updatePendingBookingStatusAsync(
      sessionId,
      {
        status: octorateReservationId ? "confirmed" : "octorate_failed",
        octorateReservationId,
        octorateStructureId: target.structureId,
        octorateError,
        accommodationId: Number(accommodationId),
        accommodationName: target.roomName || accommodationName || "",
        checkIn,
        checkOut,
        guests: Number(guests || 1),
        guestName,
        guestEmail,
        guestPhone,
        grandTotal: finalTotalAmt,
        depositAmount: depositPaidAmt,
        balanceDue: balanceDueAmt
      },
      sb
    );
  }

  // 4. Generate Confirmation PDF and Send Confirmation Email
  if (!input.skipEmail) {
    try {
      const websiteUrl = input.websiteUrl || "https://flowerpower-phayam.com";
      console.log(`[Verify API] Generating PDF and sending email for session ${sessionId}...`);

      const fullMetadata = {
        ...metadata,
        accommodationId: Number(accommodationId),
        accommodationName: target.roomName || accommodationName || metadata?.roomName || "",
        stripeSessionId: sessionId,
        finalTotal: finalTotalAmt,
        totalPrice: finalTotalAmt,
        grandTotal: finalTotalAmt,
        depositPaid: depositPaidAmt,
        depositAmount: depositPaidAmt,
        balanceDue: balanceDueAmt,
        promoCode: promoCodeVal,
        discountAmount: discountAmountVal,
        promoDiscountAmount: discountAmountVal,
        extraBreakfast: String(extraBreakfast === true || extraBreakfast === "true"),
        extraAC: String(extraAC === true || extraAC === "true")
      };

      const pdfBuffer = await generateConfirmationPDF(fullMetadata, octorateReservationId, websiteUrl);
      await sendConfirmationEmail(fullMetadata, octorateReservationId, pdfBuffer, websiteUrl);

      if (isKsher && sb) {
        await updatePendingBookingStatusAsync(sessionId, { emailSent: true }, sb);
      } else if (!isKsher) {
        console.log(`[Verify API] Updating Stripe Checkout Session ${sessionId} metadata...`);
        await stripe.checkout.sessions.update(sessionId, {
          metadata: {
            emailSent: "true",
            octorateReservationId: octorateReservationId || "",
            octorateStructureId: target.structureId
          }
        });
      }
    } catch (emailErr: any) {
      console.error("[Verify API] Confirmation email / metadata update failed:", emailErr);
    }
  }

  return {
    paid: true,
    stripeSessionId: sessionId,
    paymentIntentId,
    octorateReservationId,
    octorateStructureId: target.structureId,
    octorateProductId: usedProductId,
    octorateStatus,
    octorateError,
    finalTotal: finalTotalAmt,
    depositPaid: depositPaidAmt,
    balanceDue: balanceDueAmt,
    promoCode: promoCodeVal,
    discountAmount: discountAmountVal,
    bookingData: buildBookingData()
  };
}

export async function handleVerifyCheckoutSession(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rawSessionId = req.method === "POST" ? (req.body?.session_id || req.query.session_id) : req.query.session_id;
  const session_id = typeof rawSessionId === "string" ? rawSessionId.trim() : "";
  if (!session_id) {
    return res.status(400).json({ error: "Missing or invalid session_id parameter" });
  }

  try {
    // 0. Handle Simulation Sessions
    if (session_id.startsWith("FPSIM") || session_id.startsWith("SIM_")) {
      return res.status(200).json({
        paid: true,
        stripeSessionId: session_id,
        octorateReservationId: `SIM-${session_id}`,
        octorateStatus: "confirmed",
        finalTotal: 21600,
        depositPaid: 6739,
        balanceDue: 15120,
        bookingData: {
          accommodationId: 529784,
          checkIn: "2026-11-10",
          checkOut: "2026-11-15",
          guests: 2,
          guestName: "Snooker0 (Simulazione Test)",
          guestEmail: "test@flowerpower-phayam.com",
          guestPhone: "+66 81 234 5678",
          extraBreakfast: false,
          extraAC: false,
          totalPrice: 21600,
          depositPaid: 6739,
          balanceDue: 15120
        }
      });
    }

    const isKsher = session_id.startsWith("FPBK") || req.body?.gateway === "ksher" || req.query.gateway === "ksher";
    let metadata: Record<string, any> = {};
    let paymentIntentId = "";
    let websiteUrl = "https://flowerpower-phayam.com";

    if (isKsher) {
      // 1. Resolve booking metadata from persistent Supabase store, RAM cache, or client payload
      const cached = await getPendingBookingAsync(session_id, supabase);
      const clientData = req.body?.bookingData || {};

      const accommodationId = clientData.accommodationId || cached?.accommodationId;
      const accommodationName = clientData.accommodationName || cached?.accommodationName || clientData.roomName || "";
      const checkIn = clientData.checkIn || cached?.checkIn;
      const checkOut = clientData.checkOut || cached?.checkOut;
      const guests = Number(clientData.guests || cached?.guests || 1);
      const guestName = clientData.guestName || cached?.guestName || "Guest";
      const guestEmail = clientData.guestEmail || cached?.guestEmail || "";
      const guestPhone = clientData.guestPhone || cached?.guestPhone || "";
      const extraBreakfast = clientData.extraBreakfast === true || clientData.extraBreakfast === "true" || cached?.extraBreakfast === true;
      const extraAC = clientData.extraAC === true || clientData.extraAC === "true" || cached?.extraAC === true;
      const grandTotal = Number(clientData.grandTotal || clientData.totalPrice || cached?.grandTotal || 0);
      const depositAmount = Number(clientData.depositAmount || clientData.depositPaid || cached?.depositAmount || Math.round(grandTotal * 0.3));
      const balanceDue = Number(clientData.balanceDue || cached?.balanceDue || (grandTotal - depositAmount));
      const computedNights = (checkIn && checkOut)
        ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
        : 1;
      const promoCode = clientData.promoCode || cached?.promoCode || "";
      const discountType = clientData.discountType || cached?.discountType || "";
      const discountValue = clientData.discountValue || cached?.discountValue || "";
      const discountAmount = Number(clientData.discountAmount || cached?.discountAmount || 0);
      const nights = Number(clientData.nights || cached?.nights || computedNights);
      const lang = clientData.lang || cached?.lang || "EN";
      if (cached?.origin) websiteUrl = cached.origin;

      metadata = {
        accommodationId: String(accommodationId || ""),
        accommodationName,
        checkIn,
        checkOut,
        guests: String(guests),
        nights: String(nights),
        guestName,
        guestEmail,
        guestPhone,
        extraBreakfast: String(extraBreakfast),
        extraAC: String(extraAC),
        grandTotal: String(grandTotal),
        totalPrice: String(grandTotal),
        depositAmount: String(depositAmount),
        depositPaid: String(depositAmount),
        balanceDue: String(balanceDue),
        promoCode,
        discountType: String(discountType || ""),
        discountValue: String(discountValue || ""),
        discountAmount: String(discountAmount),
        lang,
        gateway: "ksher"
      };
      paymentIntentId = `KSHER-${session_id}`;
    } else {
      // 1. Retrieve Stripe checkout session
      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (session.payment_status !== "paid") {
        return res.status(400).json({
          paid: false,
          error: "Session is not paid yet",
          status: session.payment_status
        });
      }

      metadata = session.metadata || {};
      paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : "";
      if (session.success_url) {
        try {
          websiteUrl = new URL(session.success_url).origin;
        } catch {}
      }
    }

    if (!metadata.accommodationId || !metadata.checkIn || !metadata.checkOut || !metadata.guestName || !metadata.guestEmail || !metadata.guestPhone) {
      return res.status(422).json({
        paid: true,
        error: "Session paid but booking metadata is incomplete or missing in session",
        metadata
      });
    }

    const result = await finalizeWebsiteBooking({
      sessionId: session_id,
      gateway: isKsher ? "ksher" : "stripe",
      paymentIntentId,
      metadata,
      websiteUrl
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("[Verify API] Checkout session verification failed:", error);
    return res.status(500).json({ error: error.message || "Failed to verify checkout session" });
  }
}
