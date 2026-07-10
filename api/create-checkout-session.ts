import { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);


// Room configurations matching accommodations.ts
const MOCK_ACCOMMODATIONS = [
  { id: 529784, name: "Jungle Villa", category: "Ville", baseGuests: 8, maxExtraGuests: 0, base_price_high: 2400, base_price_low: 600, monthly_discount: true },
  { id: 495807, name: "Jungle Villa Left", category: "Ville", baseGuests: 4, maxExtraGuests: 0, base_price_high: 2400, base_price_low: 600, monthly_discount: true },
  { id: 495980, name: "Jungle Villa Right", category: "Ville", baseGuests: 4, maxExtraGuests: 0, base_price_high: 2400, base_price_low: 600, monthly_discount: true },
  { id: 495566, name: "Peace & Love Villa", category: "Ville", baseGuests: 4, maxExtraGuests: 0, base_price_high: 2400, base_price_low: 600, monthly_discount: true },
  { id: 449348, name: "Villa Penthouse", category: "Ville", baseGuests: 4, maxExtraGuests: 0, base_price_high: 2400, base_price_low: 600, monthly_discount: true },
  { id: 449385, name: "Yellow Bungalow", category: "Bungalow", baseGuests: 2, maxExtraGuests: 1, base_price_high: 1800, base_price_low: 450, monthly_discount: true },
  { id: 449422, name: "Red Bungalow", category: "Bungalow", baseGuests: 2, maxExtraGuests: 1, base_price_high: 1800, base_price_low: 450, monthly_discount: true },
  { id: 449668, name: "Green Bungalow", category: "Bungalow", baseGuests: 2, maxExtraGuests: 1, base_price_high: 1800, base_price_low: 450, monthly_discount: true },
  { id: 449675, name: "Camel Tent Glamping", category: "Tende Glamping", baseGuests: 2, maxExtraGuests: 0, base_price_high: 1400, base_price_low: 350, monthly_discount: false },
  { id: 449674, name: "Lagoon Tent Glamping", category: "Tende Glamping", baseGuests: 2, maxExtraGuests: 0, base_price_high: 1400, base_price_low: 350, monthly_discount: false },
  { id: 449678, name: "Room 1", category: "The Hub Guesthouse", baseGuests: 2, maxExtraGuests: 1, base_price_high: 1000, base_price_low: 250, monthly_discount: true },
  { id: 449684, name: "Room 2", category: "The Hub Guesthouse", baseGuests: 2, maxExtraGuests: 2, base_price_high: 1000, base_price_low: 250, monthly_discount: true },
  { id: 449699, name: "Room 3", category: "The Hub Guesthouse", baseGuests: 2, maxExtraGuests: 2, base_price_high: 1000, base_price_low: 250, monthly_discount: true },
  { id: 449724, name: "Room 4", category: "The Hub Guesthouse", baseGuests: 2, maxExtraGuests: 2, base_price_high: 1000, base_price_low: 250, monthly_discount: true },
  { id: 449730, name: "Room 5", category: "The Hub Guesthouse", baseGuests: 2, maxExtraGuests: 0, base_price_high: 1000, base_price_low: 250, monthly_discount: true },
  { id: 449736, name: "Lodge 1", category: "The Hub Guesthouse", baseGuests: 4, maxExtraGuests: 0, base_price_high: 1600, base_price_low: 400, monthly_discount: true },
  { id: 923905, name: "Lodge 2", category: "The Hub Guesthouse", baseGuests: 4, maxExtraGuests: 0, base_price_high: 1600, base_price_low: 400, monthly_discount: true },
  { id: 449742, name: "Internal Room", category: "The Hub Guesthouse", baseGuests: 2, maxExtraGuests: 0, base_price_high: 1000, base_price_low: 250, monthly_discount: true }
];

const PRICE_CONFIG = {
  EXTRA_GUEST_PRICE: 200,  // THB per extra guest per night
  BREAKFAST_PRICE: 200,    // THB per guest per day
  AC_SURCHARGE: 500,       // THB flat per stay
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Validate Stripe key
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
  if (!stripeSecretKey || stripeSecretKey === "sk_test_placeholder") {
    console.error("[Stripe API] STRIPE_SECRET_KEY is not configured in environment variables.");
    return res.status(500).json({ error: "Stripe non è configurato. Contattare l'amministratore." });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16" as any,
  });

  try {

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
      origin
    } = req.body;

    if (!accommodationId || !checkIn || !checkOut || !guestName || !guestEmail || !guestPhone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const room = MOCK_ACCOMMODATIONS.find((a) => a.id === Number(accommodationId));
    if (!room) {
      return res.status(404).json({ error: "Accommodation not found" });
    }

    // Calculate stay nights
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    // Low season detection (May to October)
    const startMonth = start.getMonth();
    const endMonth = end.getMonth();
    const lowSeasonMonths = [4, 5, 6, 7, 8, 9];
    const isLowSeason = lowSeasonMonths.includes(startMonth) || lowSeasonMonths.includes(endMonth);

    // Stay discount calculations
    let discount = 0;
    if (nights >= 30) {
      discount = 0.20;
    } else if (nights >= 15) {
      discount = 0.15;
    } else if (nights > 0) {
      discount = 0.10;
    }

    // Check Octorate Live Rates first
    let baseRoomPricePerNight = 0;
    let solvedFromOctorate = false;

    // Load tokens from Supabase
    const { data: tokenData } = await supabase
      .from("octorate_tokens")
      .select("access_token")
      .eq("id", "singleton")
      .maybeSingle();

    if (tokenData?.access_token) {
      try {
        const structureId = process.env.VITE_OCTORATE_STRUCTURE_ID || "366879";
        const calendarUrl = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${checkIn}&dateTo=${checkOut}&size=100`;

        const octRes = await fetch(calendarUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${tokenData.access_token}`,
            "Accept": "application/json"
          }
        });

        if (octRes.ok) {
          const calendarData = await octRes.json();
          const pageItems = calendarData && Array.isArray(calendarData.data)
            ? calendarData.data
            : (Array.isArray(calendarData) ? calendarData : []);

          const roomMatch = pageItems.find((item: any) => Number(item.id) === Number(accommodationId));
          if (roomMatch && Array.isArray(roomMatch.days)) {
            let sum = 0;
            let count = 0;
            const checkInTime = start.getTime();
            const checkOutTime = end.getTime();

            roomMatch.days.forEach((day: any) => {
              const dayTime = new Date(day.date).getTime();
              if (dayTime >= checkInTime && dayTime < checkOutTime) {
                sum += day.price || 0;
                count++;
              }
            });

            if (count >= nights) {
              baseRoomPricePerNight = Math.round(sum / count);
              solvedFromOctorate = true;
            }
          }
        }
      } catch (err) {
        console.warn("[Stripe API] Failed fetching live rate from Octorate, falling back to mock:", err);
      }
    }

    // Mock price fallback
    if (!solvedFromOctorate) {
      const isMaxSavings = nights >= 30 && isLowSeason;
      baseRoomPricePerNight = (isMaxSavings || (nights >= 30 && isLowSeason))
        ? room.base_price_low
        : room.base_price_high;
    }

    // Apply safety floor if live from Octorate (fetching minimum selling price)
    if (solvedFromOctorate && tokenData?.access_token) {
      try {
        const structureId = process.env.VITE_OCTORATE_STRUCTURE_ID || "366879";
        const ratesRes = await fetch(`https://api.octorate.com/connect/rest/v1/roomrates/${structureId}`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${tokenData.access_token}`
          }
        });
        if (ratesRes.ok) {
          const ratesData = await ratesRes.json();
          if (Array.isArray(ratesData)) {
            const matchRate = ratesData.find((r: any) => r.id === room.id);
            if (matchRate && matchRate.minimumSellingPrice && baseRoomPricePerNight < matchRate.minimumSellingPrice) {
              baseRoomPricePerNight = matchRate.minimumSellingPrice;
            }
          }
        }
      } catch (err) {
        console.warn("[Stripe API] Failed checking minimum safety rate floor:", err);
      }
    }

    // Extra guest calculation
    const extraGuestsCount = Math.min(room.maxExtraGuests, Math.max(0, guests - room.baseGuests));
    const extraGuestsTotalLordo = extraGuestsCount * PRICE_CONFIG.EXTRA_GUEST_PRICE * nights;

    // Room and extra guests total (Lordo)
    const roomAndGuestsTotalLordo = (baseRoomPricePerNight * nights) + extraGuestsTotalLordo;

    // Discount on room and extra guests
    const discountAmount = Math.round(roomAndGuestsTotalLordo * discount);
    const roomAndGuestsTotalNetto = roomAndGuestsTotalLordo - discountAmount;

    // Extras (undiscounted)
    const breakfastTotal = extraBreakfast ? (PRICE_CONFIG.BREAKFAST_PRICE * guests * nights) : 0;
    const acTotal = extraAC ? PRICE_CONFIG.AC_SURCHARGE : 0;

    // Grand final total
    const finalTotal = roomAndGuestsTotalNetto + breakfastTotal + acTotal;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "thb",
            product_data: {
              name: `Soggiorno presso ${room.name}`,
              description: `${checkIn} ➔ ${checkOut} (${nights} notti, ${guests} ospiti)`
            },
            unit_amount: finalTotal * 100, // Stripe expects amount in satang/cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        accommodationId: String(accommodationId),
        checkIn,
        checkOut,
        guests: String(guests),
        guestName,
        guestEmail,
        guestPhone,
        extraBreakfast: String(extraBreakfast),
        extraAC: String(extraAC),
        totalPrice: String(finalTotal)
      },
      success_url: `${origin}/village?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/village`,
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error("[Stripe API] Checkout session creation failed:", error);
    return res.status(500).json({ error: error.message || "Failed to create checkout session" });
  }
}
