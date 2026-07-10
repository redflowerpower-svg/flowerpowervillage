import { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

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

    // 3. Return success — Octorate reservation is handled client-side
    //    (the frontend calls createReservation() which goes through the Vite proxy)
    return res.status(200).json({
      paid: true,
      stripeSessionId: session.id,
      paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : "",
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
