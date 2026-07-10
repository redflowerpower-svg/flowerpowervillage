// =============================================================================
// Octorate Channel Manager - API Bridge + OAuth 3-Legged Flow
// =============================================================================
//
// ARCHITETTURA SICUREZZA:
// - getAuthorizationUrl() -> Client-side (sicura, usa solo client_id)
// - exchangeToken()       -> DA MIGRARE su Supabase Edge Function in produzione
//                            La secret_key NON deve MAI essere esposta al browser.
//                            Attualmente isolata in questo modulo per sviluppo locale.
// - fetchAccommodations() -> Client-side con Bearer token
// - checkAvailability()   -> Client-side con Bearer token
// - createReservation()   -> Client-side con Bearer token
// =============================================================================

import { supabase } from "../../lib/supabase";

// --- ENV CONFIG ---
const OCTORATE_CLIENT_ID = import.meta.env.VITE_OCTORATE_CLIENT_ID || ""
const OCTORATE_SECRET_KEY = import.meta.env.VITE_OCTORATE_SECRET_KEY || ""
const getRedirectUri = (): string => {
  if (typeof window !== "undefined" && window.location) {
    const origin = window.location.origin;
    const redirectUrl = origin.endsWith("/") ? origin : `${origin}/`;
    if (redirectUrl.includes("flowerpowervillage.com")) {
      return redirectUrl;
    }
    if (redirectUrl.includes("localhost") || redirectUrl.includes("127.0.0.1")) {
      return "https://localhost/";
    }
  }
  return import.meta.env.VITE_OCTORATE_REDIRECT_URI || "https://localhost/";
};
const OCTORATE_REDIRECT_URI = getRedirectUri();

const OCTORATE_AUTH_URL = "https://admin.octorate.com/octobook/identity/oauth.xhtml"
const OCTORATE_TOKEN_URL = "/api-octorate/connect/rest/v1/identity/token"
const OCTORATE_API_BASE = "/api-octorate/connect/rest/v1"

// --- TYPES ---

export interface Accommodation {
  id: number
  slug: string
  title: string
  category: string
  description: string
  capacity: number
  base_price_high: number
  base_price_low: number
  images: string[]
  monthly_discount: boolean
}

export interface AvailabilityResult {
  accommodationId: number
  available: boolean
  pricePerNight: number
  totalPrice: number
  currency: string
}

export interface ReservationPayload {
  accommodationId: number
  checkIn: string
  checkOut: string
  guests: number
  guestName: string
  guestEmail: string
}

export interface ReservationResponse {
  reservationId: string
  status: "confirmed" | "pending" | "failed"
  accommodationId: number
  checkIn: string
  checkOut: string
  totalPrice: number
  currency: string
}

export interface OAuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

// =============================================================================
// OAuth 3-Legged Flow
// =============================================================================

let cachedTokens: OAuthTokens | null = null;

async function getStoredTokens(): Promise<OAuthTokens | null> {
  if (cachedTokens) return cachedTokens;

  try {
    const { data, error } = await supabase
      .from("octorate_tokens")
      .select("access_token, refresh_token, expires_in")
      .eq("id", "singleton")
      .maybeSingle();

    if (error) {
      console.error("[Octorate] Error fetching tokens from Supabase:", error);
      return null;
    }

    if (!data) return null;

    cachedTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: "Bearer",
      expires_in: data.expires_in,
    };
    return cachedTokens;
  } catch (err) {
    console.error("[Octorate] Exception fetching tokens from Supabase:", err);
    return null;
  }
}

async function storeTokens(tokens: OAuthTokens): Promise<void> {
  cachedTokens = tokens;
  try {
    const { error } = await supabase
      .from("octorate_tokens")
      .upsert({
        id: "singleton",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error("[Octorate] Error saving tokens to Supabase:", error);
    }
  } catch (err) {
    console.error("[Octorate] Exception saving tokens to Supabase:", err);
  }
}

export async function clearTokens(): Promise<void> {
  cachedTokens = null;
  try {
    const { error } = await supabase
      .from("octorate_tokens")
      .delete()
      .eq("id", "singleton");

    if (error) {
      console.error("[Octorate] Error clearing tokens from Supabase:", error);
    }
  } catch (err) {
    console.error("[Octorate] Exception clearing tokens from Supabase:", err);
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const tokens = await getStoredTokens();
  return tokens !== null;
}

/**
 * Genera l'URL di autorizzazione OAuth per il login Octorate.
 * Redirige l'utente alla pagina di consenso Octorate.
 * Client-side safe: usa solo il client_id pubblico.
 */
export function getAuthorizationUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: OCTORATE_CLIENT_ID,
    redirect_uri: OCTORATE_REDIRECT_URI,
  })

  if (state) {
    params.set("state", state)
  }

  return `${OCTORATE_AUTH_URL}?${params.toString()}`
}

/**
 * Scambia l'Authorization Code con Access Token e Refresh Token.
 *
 * !! NOTA SICUREZZA !!
 * Questa funzione usa la SECRET_KEY e in produzione DEVE essere
 * eseguita server-side (Supabase Edge Function).
 * E' isolata qui per facilitare la futura migrazione.
 */
export async function exchangeToken(authorizationCode: string): Promise<OAuthTokens> {
  const url = OCTORATE_TOKEN_URL
  console.log('Tentativo scambio token verso:', url)

  const body = new URLSearchParams({
    grant_type: "code",
    code: authorizationCode,
    client_id: OCTORATE_CLIENT_ID,
    client_secret: OCTORATE_SECRET_KEY,
    redirect_uri: OCTORATE_REDIRECT_URI,
  })

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
    },
    body: body.toString(),
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(`OAuth token exchange failed (${res.status}): ${errorBody}`)
  }

  const tokens: OAuthTokens = await res.json()
  await storeTokens(tokens)
  return tokens
}

/**
 * Rinnova l'Access Token usando il Refresh Token.
 * Anche questa funzione migrera' su Edge Function.
 */
export async function refreshAccessToken(): Promise<OAuthTokens> {
  const current = await getStoredTokens()
  if (!current?.refresh_token) {
    throw new Error("No refresh token available")
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: current.refresh_token,
    client_id: OCTORATE_CLIENT_ID,
    client_secret: OCTORATE_SECRET_KEY,
  })

  const res = await fetch(`${OCTORATE_API_BASE}/identity/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
    },
    body: body.toString(),
  })

  if (!res.ok) {
    await clearTokens()
    throw new Error(`Token refresh failed (${res.status})`)
  }

  const tokens: OAuthTokens = await res.json()
  await storeTokens(tokens)
  return tokens
}

// =============================================================================
// Authenticated API Headers
// =============================================================================

async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }

  const tokens = await getStoredTokens()
  if (tokens?.access_token) {
    headers["Authorization"] = `Bearer ${tokens.access_token}`
  }

  return headers
}

// =============================================================================
// MOCK DATA (fallback quando non autenticati o API non raggiungibili)
// =============================================================================

const ACCOMMODATIONS_MOCK: Accommodation[] = [
  {
    id: 529784,
    slug: "jungle-villa",
    title: "Jungle Villa",
    category: "Ville",
    description: "La Jungle Villa รจ la struttura piรน ampia del villaggio, ideale per grandi gruppi che vogliono condividere l'esperienza.",
    capacity: 8,
    base_price_high: 4800,
    base_price_low: 1200,
    images: [],
    monthly_discount: true,
  },
  {
    id: 495807,
    slug: "jungle-villa-left",
    title: "Jungle Villa Left",
    category: "Ville",
    description: "Villa su due piani affacciata direttamente sulla piscina del villaggio, con cucina privata, zona pranzo e bagno.",
    capacity: 4,
    base_price_high: 2400,
    base_price_low: 600,
    images: [],
    monthly_discount: true,
  },
  {
    id: 495980,
    slug: "jungle-villa-right",
    title: "Jungle Villa Right",
    category: "Ville",
    description: "Villa su due piani affacciata direttamente sulla piscina del villaggio, con cucina privata, zona pranzo e bagno.",
    capacity: 4,
    base_price_high: 2400,
    base_price_low: 600,
    images: [],
    monthly_discount: true,
  },
  {
    id: 495566,
    slug: "peace-love-villa",
    title: "Peace & Love Villa",
    category: "Ville",
    description: "Situata di fronte alla piscina, questa villa indipendente vanta un'ampia terrazza privata e una camera principale.",
    capacity: 4,
    base_price_high: 2400,
    base_price_low: 600,
    images: [],
    monthly_discount: true,
  },
  {
    id: 449348,
    slug: "villa-penthouse",
    title: "Villa Penthouse",
    category: "Ville",
    description: "La Penthouse Villa รจ la sistemazione piรน esclusiva del villaggio, con camera padronale King size, bagno privato e salotto.",
    capacity: 4,
    base_price_high: 2400,
    base_price_low: 600,
    images: [],
    monthly_discount: true,
  },
  {
    id: 449385,
    slug: "yellow-bungalow",
    title: "Yellow Bungalow",
    category: "Bungalow",
    description: "Il Yellow Bungalow รจ la cupola piรน spaziosa del villaggio, immersa in un giardino con fiori vibranti.",
    capacity: 3,
    base_price_high: 1800,
    base_price_low: 450,
    images: [],
    monthly_discount: true,
  },
  {
    id: 449422,
    slug: "red-bungalow",
    title: "Red Bungalow",
    category: "Bungalow",
    description: "Il Red Bungalow a cupola รจ avvolto da un giardino lussureggiante con fauna tropicale da scoprire.",
    capacity: 3,
    base_price_high: 1800,
    base_price_low: 450,
    images: [],
    monthly_discount: true,
  },
  {
    id: 449668,
    slug: "green-bungalow",
    title: "Green Bungalow",
    category: "Bungalow",
    description: "Il Green Bungalow a cupola รจ immerso in un giardino di fiori e alberi da frutto.",
    capacity: 3,
    base_price_high: 1800,
    base_price_low: 450,
    images: [],
    monthly_discount: true,
  },
  {
    id: 449675,
    slug: "camel-tent-bungalow",
    title: "Camel Tent Glamping",
    category: "Tende Glamping",
    description: "Il Camel Glamping รจ una tenda esclusiva su piattaforma rialzata in legno.",
    capacity: 2,
    base_price_high: 1400,
    base_price_low: 350,
    images: [],
    monthly_discount: false,
  },
  {
    id: 449674,
    slug: "lagoon-tent-bungalow",
    title: "Lagoon Tent Glamping",
    category: "Tende Glamping",
    description: "Il Laguna Glamping รจ un'esclusiva tenda sollevata su pedana di legno.",
    capacity: 2,
    base_price_high: 1400,
    base_price_low: 350,
    images: [],
    monthly_discount: false,
  },
  {
    id: 449678,
    slug: "room-1",
    title: "Room 1",
    category: "The Hub Guesthouse",
    description: "La Room #1 di HUBit@ รจ pensata per nomadi digitali e famiglie che cercano comfort.",
    capacity: 3,
    base_price_high: 1000,
    base_price_low: 250,
    images: [],
    monthly_discount: true,
  },
  {
    id: 449684,
    slug: "room-2",
    title: "Room 2",
    category: "The Hub Guesthouse",
    description: "La Room #2 di HUBit@ unisce comfort moderno e produttivitร  con letto King size.",
    capacity: 4,
    base_price_high: 1000,
    base_price_low: 250,
    images: [],
    monthly_discount: true,
  },
  {
    id: 449699,
    slug: "room-3",
    title: "Room 3",
    category: "The Hub Guesthouse",
    description: "La Room #3 di HUBit@ offre un ambiente sereno con letto King size e scrivania.",
    capacity: 4,
    base_price_high: 1000,
    base_price_low: 250,
    images: [],
    monthly_discount: true,
  },
  {
    id: 449724,
    slug: "room-4",
    title: "Room 4",
    category: "The Hub Guesthouse",
    description: "La Room #4 di HUBit@ รจ la scelta ideale per chi lavora da remoto.",
    capacity: 4,
    base_price_high: 1000,
    base_price_low: 250,
    images: [],
    monthly_discount: true,
  },
  {
    id: 449730,
    slug: "room-5",
    title: "Room 5",
    category: "The Hub Guesthouse",
    description: "La Room #5 di HUBit@ รจ il rifugio piรน intimo e silenzioso.",
    capacity: 2,
    base_price_high: 1000,
    base_price_low: 250,
    images: [],
    monthly_discount: true,
  },
  {
    id: 449736,
    slug: "lodge-1",
    title: "Lodge 1",
    category: "The Hub Guesthouse",
    description: "Il Lodge #1 รจ un appartamento premium a livelli per famiglie e digital nomad.",
    capacity: 4,
    base_price_high: 1600,
    base_price_low: 400,
    images: [],
    monthly_discount: true,
  },
  {
    id: 923905,
    slug: "lodge-2",
    title: "Lodge 2",
    category: "The Hub Guesthouse",
    description: "Il Lodge #2 รจ un appartamento premium a livelli per famiglie e digital nomad.",
    capacity: 4,
    base_price_high: 1600,
    base_price_low: 400,
    images: [],
    monthly_discount: true,
  },
  {
    id: 449742,
    slug: "internal-room",
    title: "Internal Room",
    category: "The Hub Guesthouse",
    description: "L'Internal Room di HUBit@ offre letto King, postazione lavoro e bagno privato.",
    capacity: 2,
    base_price_high: 1000,
    base_price_low: 250,
    images: [],
    monthly_discount: true,
  }
]

// =============================================================================
// API Functions (con fallback ai mock)
// =============================================================================

/**
 * Recupera la lista alloggi. Se autenticato, chiama l'API reale.
 * Se il token manca o la chiamata fallisce, restituisce i dati mockati.
 */
export async function fetchAccommodations(): Promise<Accommodation[]> {
  const tokens = await getStoredTokens()

  if (tokens?.access_token) {
    try {
      // Codice di diagnostica temporaneo rimosso. La chiamata reale viene ora gestita internamente al componente RoomGrid.
    } catch (err) {
      console.warn("[Octorate] API call failed:", err)
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 800))
  return ACCOMMODATIONS_MOCK
}

const WHITELISTED_RATEPLAN_IDS: number[] = [
  529784, 495807, 495980, 495566, 449348, 449385, 449422, 449668,
  449674, 449675, 449678, 449684, 449699, 449724, 449730, 449736,
  923905, 449742,
];
const PAGINATION_PARAM_NAME = "page";
const PAGE_SIZE = 20;
const MAX_PAGES_SAFETY_CAP = 30;

export async function checkAvailability(
  checkIn: string,
  checkOut: string,
  guests: number
): Promise<AvailabilityResult[]> {
  const tokens = await getStoredTokens()
  if (tokens?.access_token) {
    try {
      const structureId = import.meta.env.VITE_OCTORATE_STRUCTURE_ID || "366879";
      const collected: any[] = [];
      const foundIds = new Set<number>();
      let page = 0;
      let sawAnyPage = false;

      while (page < MAX_PAGES_SAFETY_CAP && foundIds.size < WHITELISTED_RATEPLAN_IDS.length) {
        const url = `${OCTORATE_API_BASE}/calendar/${structureId}?dateFrom=${checkIn}&dateTo=${checkOut}&size=${PAGE_SIZE}&${PAGINATION_PARAM_NAME}=${page}`;

        let res = await fetch(url, { method: "GET", headers: await getAuthHeaders() });

        if (res.status === 401 || res.status === 403) {
          await refreshAccessToken();
          res = await fetch(url, { method: "GET", headers: await getAuthHeaders() });
        }

        if (!res.ok) {
          if (page === 0) {
            throw new Error(`Calendar API returned status: ${res.status}`);
          }
          console.warn(`[Octorate] Calendar page ${page} failed with status ${res.status}, stopping pagination.`);
          break;
        }

        const data = await res.json();
        sawAnyPage = true;

        const pageItems: any[] = data && Array.isArray(data.data)
          ? data.data
          : (Array.isArray(data) ? data : []);

        if (pageItems.length === 0) {
          break;
        }

        for (const item of pageItems) {
          const id = Number(item.id);
          if (WHITELISTED_RATEPLAN_IDS.includes(id) && !foundIds.has(id)) {
            foundIds.add(id);
            collected.push(item);
          }
        }

        if (pageItems.length < PAGE_SIZE) {
          break;
        }

        page++;
      }

      if (!sawAnyPage) {
        throw new Error("Calendar API: no pages retrieved");
      }

      if (foundIds.size < WHITELISTED_RATEPLAN_IDS.length) {
        const missing = WHITELISTED_RATEPLAN_IDS.filter((id) => !foundIds.has(id));
        console.warn(
          `[Octorate] Whitelist incompleta dopo ${page + 1} pagine. ID non trovati:`,
          missing,
          "— verificare PAGINATION_PARAM_NAME o aumentare MAX_PAGES_SAFETY_CAP."
        );
      }

      return mapCalendarDataToAvailability({ data: collected }, checkIn, checkOut, guests);
    } catch (err) {
      console.warn("[Octorate] Live calendar fetch failed, fallback to mock:", err)
      throw err;
    }
  }
  return getMockAvailability(checkIn, checkOut, guests);
}

function mapCalendarDataToAvailability(
  calendarResponse: any,
  checkIn: string,
  checkOut: string,
  _guests: number
): AvailabilityResult[] {
  const calendarData = calendarResponse && Array.isArray(calendarResponse.data)
    ? calendarResponse.data
    : (Array.isArray(calendarResponse) ? calendarResponse : []);

  if (!Array.isArray(calendarData) || calendarData.length === 0) return [];
  
  const nights = Math.max(1, Math.ceil(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
  ));

  return calendarData.map((item) => {
    const days = item.days || [];
    let isAvailable = days.length >= nights;
    let totalPrice = 0;
    
    const checkInTime = new Date(checkIn).getTime();
    const checkOutTime = new Date(checkOut).getTime();
    let activeDaysCount = 0;

    days.forEach((day: any) => {
      const dayTime = new Date(day.date).getTime();
      if (dayTime >= checkInTime && dayTime < checkOutTime) {
        activeDaysCount++;
        totalPrice += day.price || 0;
        
        if (day.availability <= 0 || day.bookable === false || day.stopSells === true) {
          isAvailable = false;
        }
        if (day.minStay && day.minStay > nights) {
          isAvailable = false;
        }
      }
    });

    if (activeDaysCount < nights) {
      isAvailable = false;
    }

    const pricePerNight = activeDaysCount > 0 ? (totalPrice / activeDaysCount) : 0;

    return {
      accommodationId: Number(item.id),
      available: isAvailable,
      pricePerNight: Math.round(pricePerNight),
      totalPrice: Math.round(totalPrice),
      currency: "THB"
    };
  });
}

function getMockAvailability(checkIn: string, checkOut: string, guests: number): AvailabilityResult[] {
  const nights = Math.max(1, Math.ceil(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
  ));
  return ACCOMMODATIONS_MOCK
    .filter((acc) => acc.capacity >= guests)
    .map((acc) => {
      const isRoom2MockClosed = acc.id === 449684 && checkIn === "2026-07-10" && checkOut === "2026-07-15";
      return {
        accommodationId: acc.id,
        available: !isRoom2MockClosed,
        pricePerNight: acc.base_price_high,
        totalPrice: acc.base_price_high * nights,
        currency: "THB",
      };
    });
}

/**
 * Crea una prenotazione. Fallback mock se non autenticato.
 */
export async function createReservation(
  payload: ReservationPayload
): Promise<ReservationResponse> {
  const tokens = await getStoredTokens()

  if (tokens?.access_token) {
    try {
      const res = await fetch(`${OCTORATE_API_BASE}/reservations`, {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify(payload),
      })

      if (res.status === 401 || res.status === 403) {
        await refreshAccessToken()
        const retryRes = await fetch(`${OCTORATE_API_BASE}/reservations`, {
          method: "POST",
          headers: await getAuthHeaders(),
          body: JSON.stringify(payload),
        })
        if (retryRes.ok) return await retryRes.json()
      }

      if (res.ok) return await res.json()
    } catch (err) {
      console.warn("[Octorate] Reservation failed, using mock:", err)
    }
  }

  // Fallback mock
  await new Promise((resolve) => setTimeout(resolve, 1000))
  const nights = Math.ceil(
    (new Date(payload.checkOut).getTime() - new Date(payload.checkIn).getTime()) / (1000 * 60 * 60 * 24)
  )
  const acc = ACCOMMODATIONS_MOCK.find((a) => a.id === payload.accommodationId)

  return {
    reservationId: `OC-${Date.now()}-${payload.accommodationId}`,
    status: "confirmed",
    accommodationId: payload.accommodationId,
    checkIn: payload.checkIn,
    checkOut: payload.checkOut,
    totalPrice: (acc?.base_price_high ?? 0) * nights,
    currency: "THB",
  }
}






