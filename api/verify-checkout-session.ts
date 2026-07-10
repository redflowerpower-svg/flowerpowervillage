import { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase (for reading Octorate tokens)
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Stripe with secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16" as any,
});

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
      totalPrice
    } = session.metadata || {};

    if (!accommodationId || !checkIn || !checkOut || !guestName || !guestEmail || !guestPhone) {
      return res.status(422).json({
        paid: true,
        error: "Session paid but booking metadata is incomplete or missing in Stripe session",
        metadata: session.metadata
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

        // Try to create reservation
        let octRes = await fetch(`${OCTORATE_API_BASE}/reservations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${tokenData.access_token}`
          },
          body: JSON.stringify({
            accommodationId: Number(accommodationId),
            checkIn,
            checkOut,
            guests: Number(guests),
            guestName,
            guestEmail,
            phone: guestPhone,
            note: `PAGATO ACCONTO 30% via Stripe (${session.id}). Saldo del 70% dovuto all'arrivo.`,
            totalPrice: Number(totalPrice)
          })
        });

        // If 401/403, try refresh token
        if ((octRes.status === 401 || octRes.status === 403) && tokenData.refresh_token) {
          console.log("[Verify API] Octorate token expired, attempting refresh...");
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
            // Update tokens in Supabase
            await supabase
              .from("octorate_tokens")
              .upsert({
                id: "singleton",
                access_token: newTokens.access_token,
                refresh_token: newTokens.refresh_token || tokenData.refresh_token,
                expires_in: newTokens.expires_in,
                updated_at: new Date().toISOString()
              });

            // Retry reservation with new token
            octRes = await fetch(`${OCTORATE_API_BASE}/reservations`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${newTokens.access_token}`
              },
              body: JSON.stringify({
                accommodationId: Number(accommodationId),
                checkIn,
                checkOut,
                guests: Number(guests),
                guestName,
                guestEmail,
                phone: guestPhone,
                note: `PAGATO ACCONTO 30% via Stripe (${session.id}). Saldo del 70% dovuto all'arrivo.`,
                totalPrice: Number(totalPrice)
              })
            });
          }
        }

        if (octRes.ok) {
          const octData = await octRes.json();
          octorateReservationId = octData.reservationId || octData.id || null;
          octorateStatus = "confirmed";
          console.log(`[Verify API] Octorate reservation created: ${octorateReservationId}`);
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

    // 4. Return success with Octorate info
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
