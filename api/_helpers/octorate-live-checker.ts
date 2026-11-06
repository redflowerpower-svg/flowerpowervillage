import { createClient } from "@supabase/supabase-js";
import { ACCOMMODATIONS, ACCOMMODATION_IDENTITIES } from "../../src/booking/resort/config/accommodations.js";

export interface LiveRoomStatus {
  slug: string;
  name: string;
  capacity: number;
  isAvailable: boolean;
  minPrice: number;
  unavailableDates: string[];
}

export interface LiveAvailabilityResult {
  hasLivePmsData: boolean;
  checkIn: string;
  checkOut: string;
  totalNights: number;
  availableRooms: LiveRoomStatus[];
  occupiedRooms: LiveRoomStatus[];
  recommendedRoomsForGuests: LiveRoomStatus[];
}

function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * Recupera il token di accesso Octorate
 */
async function getOctorateAccessToken(): Promise<string | null> {
  const sb = getSupabaseAdmin();
  if (sb) {
    try {
      const { data } = await sb
        .from('octorate_tokens')
        .select('access_token')
        .eq('id', 'singleton')
        .maybeSingle();
      if (data?.access_token) return data.access_token;
    } catch {}
  }
  return process.env.OCTORATE_ACCESS_TOKEN || null;
}

/**
 * Genera l'elenco delle date 'YYYY-MM-DD' comprese nel soggiorno (notte per notte)
 */
function getStayNights(checkIn: string, checkOut: string): string[] {
  const nights: string[] = [];
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  const cur = new Date(start);
  while (cur < end) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    nights.push(`${y}-${m}-${d}`);
    cur.setDate(cur.getDate() + 1);
  }
  return nights;
}

/**
 * Controlla in tempo reale su Octorate PMS quali camere sono disponibili notte per notte
 */
export async function checkOctorateLiveAvailability(params: {
  checkIn: string;
  checkOut: string;
  numGuests?: number | null;
}): Promise<LiveAvailabilityResult> {
  const { checkIn, checkOut, numGuests = 2 } = params;
  const nights = getStayNights(checkIn, checkOut);
  const totalNights = nights.length;

  const defaultResult: LiveAvailabilityResult = {
    hasLivePmsData: false,
    checkIn,
    checkOut,
    totalNights,
    availableRooms: [],
    occupiedRooms: [],
    recommendedRoomsForGuests: []
  };

  if (nights.length === 0) return defaultResult;

  const token = await getOctorateAccessToken();
  const structureId = process.env.VITE_OCTORATE_STRUCTURE_ID || "366879";

  if (!token) {
    console.warn("[OctorateLiveChecker] Nessun token Octorate disponibile.");
    return defaultResult;
  }

  try {
    // Scarica la griglia per l'intervallo richiesto
    const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${checkIn}&dateTo=${checkOut}&size=50&page=0`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      }
    });

    if (!res.ok) {
      console.warn(`[OctorateLiveChecker] Risposta Octorate API non ok: ${res.status}`);
      return defaultResult;
    }

    const json = await res.json();
    const ratePlans: any[] = json?.data || (Array.isArray(json) ? json : []);

    // Mappa id octorate rate plan -> mappa date -> stato
    const ratePlanDayMap = new Map<number, Map<string, { available: boolean; stopSell: boolean; price: number }>>();

    for (const rp of ratePlans) {
      const rpId = rp.id;
      const dayMap = new Map<string, { available: boolean; stopSell: boolean; price: number }>();
      if (Array.isArray(rp.days)) {
        for (const day of rp.days) {
          const dStr = day.date;
          const isAvail = day.available !== false && day.available !== 0 && !day.stopSell;
          dayMap.set(dStr, {
            available: isAvail,
            stopSell: Boolean(day.stopSell),
            price: Number(day.price || 0)
          });
        }
      }
      ratePlanDayMap.set(rpId, dayMap);
    }

    const availableRooms: LiveRoomStatus[] = [];
    const occupiedRooms: LiveRoomStatus[] = [];

    // Mappa ciascun alloggio canonico del resort
    for (const ident of ACCOMMODATION_IDENTITIES) {
      const octorateId = ident.octorateId;
      const roomConf = ACCOMMODATIONS.find(a => a.name.toLowerCase() === ident.name.toLowerCase() || a.octorateId === octorateId);
      const capacity = roomConf ? (roomConf.baseGuests + roomConf.maxExtraGuests) : 2;

      let isFullyFree = true;
      const unavailableDates: string[] = [];
      let minPrice = roomConf ? roomConf.pricePerNight : 1800;

      if (octorateId && ratePlanDayMap.has(octorateId)) {
        const dMap = ratePlanDayMap.get(octorateId)!;
        for (const night of nights) {
          const dInfo = dMap.get(night);
          if (!dInfo || !dInfo.available) {
            isFullyFree = false;
            unavailableDates.push(night);
          } else if (dInfo.price > 0 && dInfo.price < 10000) {
            minPrice = dInfo.price;
          }
        }
      } else {
        // Se non mappato direttamente, consideriamo cautelativamente da verificare
        isFullyFree = true;
      }

      const statusItem: LiveRoomStatus = {
        slug: ident.canonicalSlug,
        name: ident.name,
        capacity,
        isAvailable: isFullyFree,
        minPrice,
        unavailableDates
      };

      if (isFullyFree) {
        availableRooms.push(statusItem);
      } else {
        occupiedRooms.push(statusItem);
      }
    }

    // Filtra le stanze raccomandate per la capienza richiesta (con tolleranza)
    const targetGuests = numGuests || 2;
    const recommendedRoomsForGuests = availableRooms.filter(r => r.capacity >= targetGuests);

    return {
      hasLivePmsData: true,
      checkIn,
      checkOut,
      totalNights,
      availableRooms,
      occupiedRooms,
      recommendedRoomsForGuests
    };
  } catch (err) {
    console.warn("[OctorateLiveChecker] Errore verifica disponibilità live:", err);
    return defaultResult;
  }
}

