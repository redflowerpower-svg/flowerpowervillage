import { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { generateConfirmationPDF } from "./helpers/booking-confirmation";

// Initialize Stripe with secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16" as any,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
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
        error: "Reservation is not confirmed (session unpaid)",
        status: session.payment_status
      });
    }

    const metadata = session.metadata || {};
    if (!metadata.accommodationId || !metadata.checkIn || !metadata.checkOut || !metadata.guestName) {
      return res.status(422).json({
        error: "Session paid but booking metadata is incomplete or missing in Stripe session",
        metadata: session.metadata
      });
    }

    // Determine website domain from Stripe success url
    const websiteUrl = session.success_url ? new URL(session.success_url).origin : "https://flowerpower-phayam.com";
    
    // Retrieve octorate ID from metadata if stored
    const octorateReservationId = metadata.octorateReservationId || null;

    // 2. Generate PDF confirmation buffer
    const pdfBuffer = await generateConfirmationPDF(metadata, octorateReservationId, websiteUrl);

    // 3. Set headers and send file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Flower_Power_Booking_${octorateReservationId || session_id.substring(0, 10)}.pdf"`
    );
    return res.status(200).send(pdfBuffer);
  } catch (error: any) {
    console.error("[Download API] PDF generation failed:", error);
    return res.status(500).json({ error: error.message || "Failed to download booking confirmation" });
  }
}
