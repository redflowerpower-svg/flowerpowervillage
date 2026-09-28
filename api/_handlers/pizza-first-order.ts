import { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabaseClient } from "../_helpers/telegram.js";
import { extractOrderMetadata } from "../_helpers/pizza-order-email.js";

/**
 * Normalizes phone numbers (especially Thai numbers: 08x..., +668x..., 00668x...)
 */
export function normalizeThaiPhone(raw?: string): string {
  if (!raw) return "";
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0066") && digits.length >= 12) {
    digits = "0" + digits.slice(4);
  } else if (digits.startsWith("66") && digits.length >= 10) {
    digits = "0" + digits.slice(2);
  }
  return digits;
}

/**
 * Haversine formula to calculate distance between two coordinates in meters
 */
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Handler for checking 10% first order eligibility
 */
export async function handlePizzaFirstOrderCheck(req: VercelRequest, res: VercelResponse) {
  // CORS is already handled by [...route].ts, but ensure safety
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    let payload = req.method === "POST" ? req.body : req.query;
    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch (_) {}
    }
    payload = payload || {};

    const rawPhone = String(payload.phone || payload.PHONE || "").trim();
    const rawEmail = String(payload.email || payload.EMAIL || "").trim().toLowerCase();
    const rawDeviceId = String(payload.deviceId || payload.DEVICE_ID || payload.device_id || "").trim();
    const rawLat = payload.latitude || payload.LATITUDE ? parseFloat(String(payload.latitude || payload.LATITUDE)) : null;
    const rawLng = payload.longitude || payload.LONGITUDE ? parseFloat(String(payload.longitude || payload.LONGITUDE)) : null;

    const normalizedPhone = normalizeThaiPhone(rawPhone);

    // If no phone or device ID provided, default to eligible: true as preliminary state
    if (!normalizedPhone && !rawDeviceId && !rawEmail) {
      return res.status(200).json({
        eligible: true,
        discountPercent: 10,
        isHotelGuest: false,
        message: "First order discount eligible (preliminary)."
      });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn("[First Order Check] Supabase client not initialized.");
      return res.status(200).json({
        eligible: true,
        discountPercent: 10,
        isHotelGuest: false,
        message: "Eligible (fallback mode)."
      });
    }

    // Fetch all non-rejected orders
    const { data: pastOrders, error } = await supabase
      .from("pizza_orders")
      .select("id, phone, address, latitude, longitude, status, created_at")
      .neq("status", "rejected");

    if (error) {
      console.error("[First Order Check] Error querying pizza_orders:", error);
      return res.status(200).json({
        eligible: true,
        discountPercent: 10,
        isHotelGuest: false,
        message: "Eligible (database error fallback)."
      });
    }

    let isPhoneMatch = false;
    let isEmailMatch = false;
    let isDeviceMatch = false;
    let isNearPastOrder = false;

    if (Array.isArray(pastOrders)) {
      for (const order of pastOrders) {
        // 1. Phone match check
        if (normalizedPhone) {
          const pastNormalizedPhone = normalizeThaiPhone(order.phone);
          if (pastNormalizedPhone && pastNormalizedPhone === normalizedPhone) {
            isPhoneMatch = true;
          }
        }

        // 2. Email & Device ID check (from metadata or address tags)
        const rawAddr = order.address || "";
        const meta = extractOrderMetadata(rawAddr);

        if (rawEmail && meta.customerEmail) {
          if (meta.customerEmail.toLowerCase() === rawEmail) {
            isEmailMatch = true;
          }
        }

        if (rawDeviceId) {
          const didMatch = rawAddr.match(/\[DID:\s*([^\]]+)\]/i);
          const pastDeviceId = didMatch ? didMatch[1].trim() : "";
          if (pastDeviceId && pastDeviceId === rawDeviceId) {
            isDeviceMatch = true;
          }
        }

        // 3. GPS distance check (30 - 50 meters threshold for same hotel/building)
        if (
          rawLat !== null &&
          rawLng !== null &&
          !isNaN(rawLat) &&
          !isNaN(rawLng) &&
          order.latitude !== null &&
          order.longitude !== null
        ) {
          const pastLat = parseFloat(String(order.latitude));
          const pastLng = parseFloat(String(order.longitude));
          if (!isNaN(pastLat) && !isNaN(pastLng)) {
            const distMeters = calculateDistanceMeters(rawLat, rawLng, pastLat, pastLng);
            if (distMeters <= 50) {
              isNearPastOrder = true;
            }
          }
        }
      }
    }

    // Eligibility logic:
    // If phone, email, or device ID has already placed an order -> NOT eligible
    const isAlreadyCustomer = isPhoneMatch || isEmailMatch || isDeviceMatch;
    const isEligible = !isAlreadyCustomer;

    // If eligible, but location matches a past order (<= 50m), it's a hotel/resort guest!
    const isHotelGuest = isEligible && isNearPastOrder;

    return res.status(200).json({
      eligible: isEligible,
      discountPercent: isEligible ? 10 : 0,
      isHotelGuest,
      isPhoneMatch,
      isEmailMatch,
      isDeviceMatch,
      isNearPastOrder,
      message: isEligible
        ? isHotelGuest
          ? "Welcome to Ranong! First order discount (10%) unlocked for hotel/resort guest."
          : "Welcome! 10% first order discount unlocked."
        : "First order discount is only valid for new customers."
    });
  } catch (err: any) {
    console.error("[First Order Check] Exception:", err);
    return res.status(500).json({
      error: err?.message || "Internal server error",
      details: String(err),
      eligible: false
    });
  }
}
