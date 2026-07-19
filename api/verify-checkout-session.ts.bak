import { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { generateConfirmationPDF, sendConfirmationEmail } from "./_helpers/booking-confirmation.js";

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null as any;


// Initialize Stripe with secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16" as any,
});

// Octorate Structure ID
const OCTORATE_STRUCTURE_ID = process.env.VITE_OCTORATE_STRUCTURE_ID || "366879";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(450).json({ error: "Method not allowed" });
  }

  const { session_id } = req.query;
  if (!session_id || typeof session_id !== "string") {
    return res.status(400).json({ error: "Missing or invalid session_id parameter" });
  }

  try {
    // 1. Retrieve Stripe checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        paid: false,
        error: "Session is not paid yet",
        status: session.payment_status
      });
    }

    // 2. Extract booking metadata saved during creation
    const {
      accommodationId,
      checkIn,
      checkOut,
      guests,
      guestName,
      guestEmail,
      guestPhone,
      extraBreakfast,
      extraAC,
      totalPrice,
      depositPaid
    } = session.metadata || {};

    if (!accommodationId || !checkIn || !checkOut || !guestName || !guestEmail || !guestPhone) {
      return res.status(422).json({
        paid: true,
        error: "Session paid but booking metadata is incomplete or missing in Stripe session",
        metadata: session.metadata
      });
    }

    // Guard: if already emailed, restore and return immediately (prevents duplicate Octorate and email calls)
    if (session.metadata?.emailSent === "true") {
      console.log(`[Verify API] Session ${session.id} already verified and emailed. Returning cached reservation.`);
      return res.status(200).json({
        paid: true,
        stripeSessionId: session.id,
        paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : "",
        octorateReservationId: session.metadata.octorateReservationId || null,
        octorateStatus: session.metadata.octorateReservationId ? "confirmed" : null,
        bookingData: {
          accommodationId: Number(accommodationId),
          checkIn,
          checkOut,
          guests: Number(guests),
          guestName,
          guestEmail,
          guestPhone,
          extraBreakfast: extraBreakfast === "true",
          extraAC: extraAC === "true",
          totalPrice: Number(totalPrice)
        }
      });
    }

    // 3. Attempt to create reservation in Octorate (server-side, has access to tokens)
    let octorateReservationId: string | null = null;
    let octorateStatus: string | null = null;
    let octorateError: string | null = null;

    try {
      // Read Octorate tokens from Supabase
      const { data: tokenData } = await supabase
        .from("octorate_tokens")
        .select("access_token, refresh_token")
        .eq("id", "singleton")
        .maybeSingle();

      if (tokenData?.access_token) {
        const OCTORATE_API_BASE = "https://api.octorate.com/connect/rest/v1";

        // IMPORTANT: 'accommodation' is a PATH parameter — the accommodationId goes in the URL
        // The body uses the official ApiReservationReqDTO schema (from openapi.yaml)
        // Required fields: channelId, checkin, checkout, createTime, guests[], product,
        //                  refer, roomGross, status, totalChildren, totalGuest, totalInfants, updateTime

        const now = new Date().toISOString();
        const [givenName, ...lastNameParts] = (guestName || "Guest Guest").split(" ");
        const familyName = lastNameParts.join(" ") || "Guest";
        const totalGuest = Number(guests || 1);

        // Octorate uses 'givenName'/'familyName' (not firstName/lastName) and full ISO timestamps
        // sex: only MALE or FEMALE accepted by Octorate enum GuestSex — "U" causes 400
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

        // refer must be globally unique (max 25 chars):
        // 8-char timestamp base36 (unique per ms) + last 17 chars of session suffix (traceability)
        // NOTE: slice(-25) was broken — session suffix is 58 chars so it always returned same 25 chars
        const sessionSuffix = session.id.replace(/^cs_test_|^cs_/, "");
        const refer = (Date.now().toString(36).substring(0, 8) + sessionSuffix.slice(-17)).substring(0, 25);

        const reservationBody = {
          status: "CONFIRMED",
          refer,
          channelId: 233, // Octorate direct booking channel (confirmed working via test)
          product: Number(accommodationId), // The Octorate product ID (= accommodationId = ratePlan)
          checkin: `${checkIn}T14:00:00Z`,
          checkout: `${checkOut}T12:00:00Z`,
          createTime: now,
          updateTime: now,
          guests: guestsList,
          roomGross: Number(totalPrice),
          totalGuest,
          totalChildren: 0,
          totalInfants: 0,
          privateNotes: `PAGATO ACCONTO 30% via Stripe. Saldo 70% all'arrivo. Stripe Session: ${session.id}`
        };

        console.log("[Verify API] Posting to Octorate:", `${OCTORATE_API_BASE}/reservation/${OCTORATE_STRUCTURE_ID}`);
        console.log("[Verify API] checkIn:", checkIn, "| checkOut:", checkOut, "| accommodationId:", accommodationId, "| totalPrice:", totalPrice);
        console.log("[Verify API] Payload (sanitized):", JSON.stringify({
          ...reservationBody,
          guests: [{ type: "BOOKER", givenName: "***", familyName: "***", email: "***", phone: "***", checkin: checkIn, checkout: checkOut, sex: "MALE" }]
        }, null, 2));
        console.log("[Verify API] channelId:", reservationBody.channelId, "| refer:", refer);

        let currentToken = tokenData.access_token;

        // Helper to build fetch options
        const buildFetchOpts = (token: string) => ({
          method: "POST" as const,
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(reservationBody)
        });

        // Reservation endpoint: POST /rest/v1/reservation/{accommodation} (where {accommodation} is Property ID)
        let octRes = await fetch(`${OCTORATE_API_BASE}/reservation/${OCTORATE_STRUCTURE_ID}`, buildFetchOpts(currentToken));

        console.log("[Verify API] Octorate initial response status:", octRes.status);

        // Only refresh on 401 (expired token) — 403 is a permission/scope issue, not expiration
        if (octRes.status === 401 && tokenData.refresh_token) {
          console.log("[Verify API] 401 - Octorate token expired, attempting refresh...");
          const refreshRes = await fetch(`${OCTORATE_API_BASE}/identity/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "refresh_token",
              refresh_token: tokenData.refresh_token,
              client_id: process.env.VITE_OCTORATE_CLIENT_ID || "",
              client_secret: process.env.VITE_OCTORATE_SECRET_KEY || "",
            })
          });

          if (refreshRes.ok) {
            const newTokens = await refreshRes.json();
            console.log("[Verify API] Refresh successful, new token starts with:", String(newTokens.access_token).substring(0, 10));
            currentToken = newTokens.access_token;
            await supabase.from("octorate_tokens").upsert({
              id: "singleton",
              access_token: newTokens.access_token,
              refresh_token: newTokens.refresh_token || tokenData.refresh_token,
              expires_in: newTokens.expires_in,
              updated_at: new Date().toISOString()
            });
            octRes = await fetch(`${OCTORATE_API_BASE}/reservation/${OCTORATE_STRUCTURE_ID}`, buildFetchOpts(currentToken));
            console.log("[Verify API] Octorate retry response status:", octRes.status);
          } else {
            const refreshErr = await refreshRes.text();
            console.error("[Verify API] Token refresh FAILED:", refreshRes.status, refreshErr);
          }
        }

        if (octRes.ok) {
          const octData = await octRes.json();
          octorateReservationId = String(octData.id || octData.reservationId || "") || null;
          octorateStatus = "confirmed";
          console.log(`[Verify API] Octorate reservation created: ${octorateReservationId}`);

          // Register Stripe deposit payment in Octorate
          if (octorateReservationId) {
            const depositAmount = depositPaid ? Number(depositPaid) : Math.round(Number(totalPrice || 0) * 0.3);
            const paymentBody = {
              paymentMode: "CREDITCARD",
              referenceTime: new Date().toISOString(),
              amount: depositAmount,
              transaction: typeof session.payment_intent === "string" ? session.payment_intent : session.id,
              description: `Caparra 30% pagata via Stripe - Session: ${session.id}`,
              status: "NORMAL"
            };

            try {
              console.log(`[Verify API] Registering deposit payment of ฿${depositAmount} in Octorate for reservation ${octorateReservationId}...`);
              const payRes = await fetch(`${OCTORATE_API_BASE}/reservation/${OCTORATE_STRUCTURE_ID}/${octorateReservationId}/payment`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Accept": "application/json",
                  "Authorization": `Bearer ${currentToken}`
                },
                body: JSON.stringify(paymentBody)
              });

              if (payRes.ok) {
                console.log(`[Verify API] Octorate deposit payment successfully registered.`);
              } else {
                const payErr = await payRes.text();
                console.warn(`[Verify API] Failed to register deposit payment in Octorate:`, payRes.status, payErr);
              }
            } catch (payErr: any) {
              console.error(`[Verify API] Error registering Octorate payment:`, payErr);
            }
          }
        } else {
          const errorText = await octRes.text();
          octorateError = `Octorate API error (${octRes.status}): ${errorText}`;
          console.error(`[Verify API] ${octorateError}`);
        }
      } else {
        console.log("[Verify API] No Octorate tokens found — skipping Octorate reservation.");
        octorateError = "Octorate non connesso. La prenotazione è registrata solo su Stripe.";
      }
    } catch (octErr: any) {
      octorateError = `Octorate error: ${octErr.message}`;
      console.error("[Verify API] Octorate reservation error:", octErr);
    }

    // 4. Generate Confirmation PDF and Send Confirmation Email
    try {
      const websiteUrl = session.success_url ? new URL(session.success_url).origin : "https://flowerpower-phayam.com";
      console.log(`[Verify API] Generating PDF and sending email for session ${session.id}...`);
      
      const pdfBuffer = await generateConfirmationPDF(session.metadata, octorateReservationId, websiteUrl);
      await sendConfirmationEmail(session.metadata, octorateReservationId, pdfBuffer, websiteUrl);
      
      // Update Stripe Checkout Session metadata to mark as emailed & save Octorate ID
      console.log(`[Verify API] Updating Stripe Checkout Session ${session.id} metadata...`);
      await stripe.checkout.sessions.update(session.id, {
        metadata: {
          emailSent: "true",
          octorateReservationId: octorateReservationId || ""
        }
      });
    } catch (emailErr: any) {
      // Don't crash the verification response, just log the error
      console.error("[Verify API] Confirmation email / Stripe metadata update failed:", emailErr);
    }

    // 5. Return success
    return res.status(200).json({
      paid: true,
      stripeSessionId: session.id,
      paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : "",
      octorateReservationId,
      octorateStatus,
      octorateError,
      bookingData: {
        accommodationId: Number(accommodationId),
        checkIn,
        checkOut,
        guests: Number(guests),
        guestName,
        guestEmail,
        guestPhone,
        extraBreakfast: extraBreakfast === "true",
        extraAC: extraAC === "true",
        totalPrice: Number(totalPrice)
      }
    });
  } catch (error: any) {
    console.error("[Stripe API] Checkout session verification failed:", error);
    return res.status(500).json({ error: error.message || "Failed to verify checkout session" });
  }
}
