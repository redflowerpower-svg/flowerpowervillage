import { VercelRequest, VercelResponse } from "@vercel/node";
import { stripe } from "../_helpers/stripe.js";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase (use service role key to bypass RLS and read octorate_tokens)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null as any;

// Room configurations matching accommodations.ts
const MOCK_ACCOMMODATIONS = [
  { id: 529784, name: "Jungle Villa", category: "Ville", baseGuests: 8, maxExtraGuests: 0, base_price_high: 4800, base_price_low: 1200, monthly_discount: true },
  { id: 495807, name: "Jungle Villa Left", category: "Ville", baseGuests: 4, maxExtraGuests: 0, base_price_high: 2400, base_price_low: 600, monthly_discount: true },
  { id: 495980, name: "Jungle Villa Right", category: "Ville", baseGuests: 4, maxExtraGuests: 0, base_price_high: 2400, base_price_low: 600, monthly_discount: true },
  { id: 495566, name: "Peace & Love Villa", category: "Ville", baseGuests: 4, maxExtraGuests: 0, base_price_high: 2400, base_price_low: 600, monthly_discount: true },
  { id: 449348, name: "Villa Penthouse", category: "Ville", baseGuests: 4, maxExtraGuests: 0, base_price_high: 2400, base_price_low: 600, monthly_discount: true },
  { id: 449385, name: "Yellow Bungalow", category: "Bungalow", baseGuests: 2, maxExtraGuests: 1, base_price_high: 1800, base_price_low: 750, monthly_discount: true },
  { id: 449422, name: "Red Bungalow", category: "Bungalow", baseGuests: 2, maxExtraGuests: 1, base_price_high: 1800, base_price_low: 750, monthly_discount: true },
  { id: 449668, name: "Green Bungalow", category: "Bungalow", baseGuests: 2, maxExtraGuests: 1, base_price_high: 1800, base_price_low: 790, monthly_discount: true },
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

export async function handleCreateCheckoutSession(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
      lang,
      origin,
      promoCode,
      discountType,
      discountValue
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
        const octUrl = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${checkIn}&dateTo=${checkOut}&size=20`;
        const octRes = await fetch(octUrl, {
          headers: {
            "Authorization": `Bearer ${tokenData.access_token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        });

        if (octRes.ok) {
          const octJson = await octRes.json();
          const items = Array.isArray(octJson) ? octJson : (octJson.data || []);
          const targetRoom = items.find((item: any) => item.id === Number(accommodationId) || item.room === Number(accommodationId));

          if (targetRoom && targetRoom.days && targetRoom.days.length > 0) {
            const totalPriceFromOct = targetRoom.days.reduce((acc: number, day: any) => acc + (day.price || 0), 0);
            if (totalPriceFromOct > 0) {
              baseRoomPricePerNight = Math.round(totalPriceFromOct / targetRoom.days.length);
              solvedFromOctorate = true;
            }
          }
        }
      } catch (octErr) {
        console.warn("[Stripe API] Octorate live rate fetch failed, falling back to local prices:", octErr);
      }
    }

    // Fallback if Octorate was not available
    if (!solvedFromOctorate) {
      baseRoomPricePerNight = isLowSeason ? room.base_price_low : room.base_price_high;
    }

    // Mother Rate (Tariffa Madre): Base room cost + Extra guest cost
    const roomCostMother = baseRoomPricePerNight * nights;
    const extraGuestsCount = Math.max(0, guests - room.baseGuests);
    const totalExtraGuestPrice = extraGuestsCount * PRICE_CONFIG.EXTRA_GUEST_PRICE * nights;
    const motherRateTotal = roomCostMother + totalExtraGuestPrice;

    let directDiscountAmount = 0;
    let promoDiscountAmount = 0;

    if (promoCode && discountType && discountValue) {
      // EXCLUSIVITY (V26): Standard stay discount is FORCED to 0 when coupon is present
      directDiscountAmount = 0;

      const val = Number(discountValue) || 0;
      if (discountType === 'percentage') {
        promoDiscountAmount = Math.round(motherRateTotal * (val / 100));
      } else if (discountType === 'fixed') {
        promoDiscountAmount = Math.min(motherRateTotal, val);
      }
    } else {
      // Standard stay duration discount applies
      directDiscountAmount = Math.round(roomCostMother * discount);
      promoDiscountAmount = 0;
    }

    const discountedRoomAndGuestsTotal = Math.max(0, motherRateTotal - directDiscountAmount - promoDiscountAmount);

    // Extra Breakfast
    const totalBreakfastPrice = extraBreakfast ? (guests * PRICE_CONFIG.BREAKFAST_PRICE * nights) : 0;

    // Extra AC
    const totalACPrice = extraAC ? PRICE_CONFIG.AC_SURCHARGE : 0;

    // Total accommodation price
    const grandTotal = discountedRoomAndGuestsTotal + totalBreakfastPrice + totalACPrice;

    // Deposit (30%)
    const depositAmount = Math.round(grandTotal * 0.30);
    const balanceDue = grandTotal - depositAmount;

    // Construct origin URL
    const requestOrigin = origin || req.headers.origin || req.headers.referer || "https://flowerpower-phayam.com";
    const cleanOrigin = requestOrigin.replace(/\/$/, "");

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "thb",
            product_data: {
              name: `Acconto 30% Prenotazione - ${room.name}`,
              description: `${nights} notti (${checkIn} / ${checkOut}), ${guests} ospiti. Saldo da pagare all'arrivo: ${balanceDue.toLocaleString()} THB`,
            },
            unit_amount: depositAmount * 100, // Stripe expects amounts in cents/satoshis (THB in smallest unit)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${cleanOrigin}/village?session_id={CHECKOUT_SESSION_ID}&booking=success`,
      cancel_url: `${cleanOrigin}/village?booking=cancelled`,
      customer_email: guestEmail,
      metadata: {
        accommodationId: String(accommodationId),
        accommodationName: room.name,
        checkIn,
        checkOut,
        nights: String(nights),
        guests: String(guests),
        guestName,
        guestEmail,
        guestPhone,
        extraBreakfast: String(extraBreakfast),
        extraAC: String(extraAC),
        grandTotal: String(grandTotal),
        depositAmount: String(depositAmount),
        balanceDue: String(balanceDue),
        discountPercentage: String(Math.round(discount * 100)),
        isLowSeason: String(isLowSeason),
        lang: lang || "it",
        promoCode: promoCode ? String(promoCode) : "",
        discountType: discountType ? String(discountType) : "",
        discountValue: discountValue ? String(discountValue) : "0",
        discountAmount: String(promoDiscountAmount),
        promoDiscountAmount: String(promoDiscountAmount),
        directDiscountAmount: String(directDiscountAmount)
      },
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
      depositAmount,
      balanceDue,
      grandTotal,
      nights
    });

  } catch (error: any) {
    console.error("[Stripe API] Error creating checkout session:", error);
    return res.status(500).json({
      error: error.message || "Failed to create checkout session"
    });
  }
}
