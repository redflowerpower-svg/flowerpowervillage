import { VercelRequest, VercelResponse } from "@vercel/node";
import { stripe } from "../_helpers/stripe.js";
import { generateConfirmationPDF } from "../_helpers/booking-confirmation.js";
import { getPendingBooking } from "../_helpers/pending-bookings.js";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null as any;

const OCTORATE_STRUCTURE_ID = process.env.VITE_OCTORATE_STRUCTURE_ID || "366879";

export async function handleDownloadConfirmation(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { session_id, octorate_id } = req.query;
  if (!session_id || typeof session_id !== "string") {
    return res.status(400).json({ error: "Missing or invalid session_id parameter" });
  }

  const rawOrigin = req.headers?.origin || req.headers?.referer || "https://flowerpower-phayam.com";
  const websiteUrl = Array.isArray(rawOrigin) ? rawOrigin[0] : String(rawOrigin).split("?")[0].replace(/\/$/, "");

  try {
    const isKsher = session_id.startsWith("FPBK") || !session_id.startsWith("cs_");

    if (isKsher) {
      let octorateReservationId = (typeof octorate_id === "string" && octorate_id.trim()) ? octorate_id.trim() : null;
      let metadata: Record<string, any> = {};

      // 1. Try to fetch reservation data directly from Octorate
      try {
        const { data: tokenData } = await supabase
          .from("octorate_tokens")
          .select("access_token")
          .eq("id", "singleton")
          .maybeSingle();

        const accessToken = tokenData?.access_token;
        if (accessToken) {
          let octResData: any = null;

          if (octorateReservationId) {
            const singleRes = await fetch(
              `https://api.octorate.com/connect/rest/v1/reservation/${OCTORATE_STRUCTURE_ID}/${octorateReservationId}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  Accept: "application/json"
                }
              }
            );
            if (singleRes.ok) {
              octResData = await singleRes.json();
            }
          }

          if (!octResData) {
            // Search recent reservations for this session_id
            const listRes = await fetch(
              `https://api.octorate.com/connect/rest/v1/reservation?size=25&page=0`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  Accept: "application/json"
                }
              }
            );
            if (listRes.ok) {
              const listJson = await listRes.json();
              const items = Array.isArray(listJson) ? listJson : (listJson.data || []);
              octResData = items.find((item: any) =>
                (item.refer && item.refer.includes(session_id)) ||
                (item.channelRefer && item.channelRefer.includes(session_id)) ||
                (item.privateNotes && item.privateNotes.includes(session_id)) ||
                (octorateReservationId && String(item.id) === String(octorateReservationId))
              );
            }
          }

          if (octResData) {
            octorateReservationId = String(octResData.id || octorateReservationId || "");
            const guestObj = (octResData.guests && octResData.guests[0]) || {};
            const guestName = octResData.guestsList ||
                              guestObj.customerName ||
                              `${guestObj.givenName || octResData.firstName || ""} ${guestObj.familyName || octResData.lastName || ""}`.trim() ||
                              "Guest";
            const guestEmail = octResData.guestMailAddress || guestObj.email || "";
            const guestPhone = guestObj.phone || "";
            const checkIn = (octResData.checkin || "").slice(0, 10);
            const checkOut = (octResData.checkout || "").slice(0, 10);
            const nights = (checkIn && checkOut)
              ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
              : 1;
            const grandTotal = Number(octResData.totalGross || 0);
            const depositAmount = Number(octResData.totalPaid || Math.round(grandTotal * 0.3));
            const balanceDue = Number(grandTotal - depositAmount);

            metadata = {
              guestName,
              guestEmail,
              guestPhone,
              accommodationName: octResData.roomName || "Flower Power Village",
              roomName: octResData.roomName || "Flower Power Village",
              checkIn,
              checkOut,
              nights: String(nights),
              guests: String(octResData.totalGuest || 1),
              grandTotal: String(grandTotal),
              totalPrice: String(grandTotal),
              depositAmount: String(depositAmount),
              depositPaid: String(depositAmount),
              balanceDue: String(balanceDue),
              gateway: "ksher",
              stripeSessionId: session_id
            };
          }
        }
      } catch (octErr) {
        console.warn("[Download API] Octorate live fetch fallback notice:", octErr);
      }

      // 2. Fallback to in-memory pending booking if Octorate data was missing
      if (!metadata.guestName || !metadata.checkIn) {
        const cached = getPendingBooking(session_id);
        if (cached) {
          metadata = {
            guestName: cached.guestName,
            guestEmail: cached.guestEmail,
            guestPhone: cached.guestPhone,
            accommodationName: cached.accommodationName,
            roomName: cached.accommodationName,
            checkIn: cached.checkIn,
            checkOut: cached.checkOut,
            nights: String(cached.nights || 1),
            guests: String(cached.guests || 1),
            grandTotal: String(cached.grandTotal || 0),
            totalPrice: String(cached.grandTotal || 0),
            depositAmount: String(cached.depositAmount || 0),
            depositPaid: String(cached.depositAmount || 0),
            balanceDue: String(cached.balanceDue || 0),
            gateway: "ksher",
            stripeSessionId: session_id
          };
        }
      }

      // 3. Failsafe minimum metadata
      if (!metadata.guestName) {
        metadata = {
          guestName: "Guest",
          guestEmail: "",
          guestPhone: "",
          accommodationName: "Flower Power Village",
          roomName: "Flower Power Village",
          checkIn: new Date().toISOString().slice(0, 10),
          checkOut: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
          nights: "1",
          guests: "1",
          grandTotal: "0",
          totalPrice: "0",
          depositAmount: "0",
          depositPaid: "0",
          balanceDue: "0",
          gateway: "ksher",
          stripeSessionId: session_id
        };
      }

      // 4. Generate PDF confirmation buffer
      const pdfBuffer = await generateConfirmationPDF(metadata, octorateReservationId, websiteUrl);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Flower_Power_Booking_${octorateReservationId || session_id.substring(0, 10)}.pdf"`
      );
      return res.status(200).send(pdfBuffer);
    }

    // 2. STRIPE CHECKOUT SESSION RETRIEVAL
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

    const stripeWebsiteUrl = session.success_url ? new URL(session.success_url).origin : websiteUrl;
    const octorateReservationId = metadata.octorateReservationId || null;

    const pdfBuffer = await generateConfirmationPDF(metadata, octorateReservationId, stripeWebsiteUrl);

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
