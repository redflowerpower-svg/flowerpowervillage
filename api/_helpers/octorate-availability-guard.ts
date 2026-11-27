/**
 * 🛡️ Hard Availability Guard & Anti-Overbooking Engine (5-Layer Defense)
 *
 * Unica fonte di verità server-side eseguita prima di ogni checkout (Ksher, Stripe, PayPal, Bonifico)
 * e prima della registrazione finale su Octorate (`verify.ts`).
 *
 * Garantisce:
 *  1. Risoluzione dinamica multi-struttura (`366879`, `807324`, `619403`) + split attivo Jungle Villas.
 *  2. Controllo calendario live NOTTE-PER-NOTTE `[checkIn, checkOut)` sulla struttura ATTIVA
 *     (sia tariffa BE che Madre, con paginazione corretta 0-indexed e refresh automatico token 401).
 *  3. Controllo incrociato prenotazioni reali LIVE su Octorate — per le 4 Jungle Villas interroga
 *     ENTRAMBE le strutture (`366879` + `807324`) per intercettare prenotazioni pre-switch o Keep-Alive Luglio.
 *  4. Blocco unità fisicamente collegate (`Jungle Villa` <-> `Jungle Villa Left` / `Jungle Villa Right`).
 *  5. Soft-Hold concorrente (15 minuti) su Supabase (`pending_booking_*`) contro checkout simultanei.
 *  6. Politica FAIL-CLOSED rigorosa: se Octorate non risponde, blocca con 503 (mai pagamenti al buio).
 */

import { resolveOctorateBookingTarget, OctorateBookingTarget } from "./octorate-booking-target.js";
import {
  ALL_ACCOMMODATIONS_MAP,
  getCanonicalAccommodation
} from "./octorate-catalog.js";
import { toThailandDateStr } from "./date-formatter.js";
import { findConflictingPendingBookingsAsync } from "./pending-bookings.js";

export type AvailabilityErrorCode =
  | "INVALID_DATES"
  | "DATES_UNAVAILABLE"
  | "MIN_STAY_NOT_MET"
  | "RESERVATION_CONFLICT"
  | "SOFT_HOLD_ACTIVE"
  | "OCTORATE_UNAVAILABLE"
  | "ROOM_NOT_FOUND_IN_CALENDAR";

export interface AvailabilityGuardResult {
  ok: boolean;
  statusCode: 200 | 400 | 409 | 503;
  errorCode?: AvailabilityErrorCode;
  reason?: string;
  localizedMessage?: string;
  target?: OctorateBookingTarget;
  canonicalKey?: string | null;
  unavailableDates?: string[];
  minStayRequired?: number;
  averageNightlyPrice?: number;
  totalCalendarPrice?: number;
  nightsPrices?: Array<{ date: string; price: number }>;
  conflictingReservation?: {
    id: string;
    structureId: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    channelName: string;
  };
  conflictingSoftHold?: {
    sessionId: string;
    checkIn: string;
    checkOut: string;
  };
}

/**
 * Genera tutte le notti di pernottamento `[checkIn, checkOut)` in formato `YYYY-MM-DD`,
 * escludendo tassativamente il giorno di check-out.
 */
export function getStayNightDates(checkIn: string, checkOut: string): string[] {
  const cin = String(checkIn || "").slice(0, 10);
  const cout = String(checkOut || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cin) || !/^\d{4}-\d{2}-\d{2}$/.test(cout) || cin >= cout) {
    return [];
  }

  const [sy, sm, sd] = cin.split("-").map(Number);
  const [ey, em, ed] = cout.split("-").map(Number);
  const cur = new Date(Date.UTC(sy, (sm || 1) - 1, sd || 1));
  const end = new Date(Date.UTC(ey, (em || 1) - 1, ed || 1));

  const nights: string[] = [];
  let guard = 0;
  while (cur < end && guard < 366) {
    nights.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
    guard++;
  }
  return nights;
}

/**
 * Risolve chiave canonica e unità fisicamente collegate (`JV <-> JVL / JVR`) da `ALL_ACCOMMODATIONS_MAP`.
 */
export function resolveCanonicalAndLinkedKeys(
  productIds: Array<number | string | undefined | null>,
  roomNameHint?: string
): { canonicalKey: string | null; linkedKeys: string[]; canonicalName: string } {
  const strIds = productIds
    .filter((v) => v !== undefined && v !== null && String(v).trim() !== "")
    .map((v) => String(v).trim());

  for (const pid of strIds) {
    for (const [key, entry] of Object.entries(ALL_ACCOMMODATIONS_MAP)) {
      if (String(entry.motherId) === pid || entry.ids.includes(pid)) {
        return {
          canonicalKey: key,
          linkedKeys: entry.linkedKeys ? [...entry.linkedKeys] : [],
          canonicalName: entry.name
        };
      }
    }
  }

  if (roomNameHint) {
    const resolved = getCanonicalAccommodation({ roomName: roomNameHint });
    if (resolved && ALL_ACCOMMODATIONS_MAP[resolved.key]) {
      const entry = ALL_ACCOMMODATIONS_MAP[resolved.key];
      return {
        canonicalKey: resolved.key,
        linkedKeys: entry.linkedKeys ? [...entry.linkedKeys] : [],
        canonicalName: entry.name
      };
    }
  }

  return { canonicalKey: null, linkedKeys: [], canonicalName: roomNameHint || "" };
}

/**
 * Funzione pura e deterministica (testabile senza I/O):
 * valuta disponibilità calendario, Stop Sell, regola 10.000 THB, minStay e prezzi esatti
 * esclusivamente sulle notti `[checkIn, checkOut)` (escluso giorno di check-out).
 */
export function evaluateCalendarAvailabilityPure(params: {
  nights: string[];
  beItem: any | null;
  motherItem: any | null;
}): {
  ok: boolean;
  statusCode: 200 | 409 | 503;
  errorCode?: AvailabilityErrorCode;
  reason?: string;
  unavailableDates: string[];
  minStayRequired: number;
  averageNightlyPrice: number;
  totalCalendarPrice: number;
  nightsPrices: Array<{ date: string; price: number }>;
} {
  const { nights, beItem, motherItem } = params;

  if (!beItem && !motherItem) {
    return {
      ok: false,
      statusCode: 503,
      errorCode: "ROOM_NOT_FOUND_IN_CALENDAR",
      reason: "Accommodation rate plan not found in live Octorate calendar (fail-closed).",
      unavailableDates: [...nights],
      minStayRequired: 1,
      averageNightlyPrice: 0,
      totalCalendarPrice: 0,
      nightsPrices: []
    };
  }

  const indexDays = (item: any | null): Map<string, any> => {
    const map = new Map<string, any>();
    if (!item || !Array.isArray(item.days)) return map;
    for (const d of item.days) {
      const dStr = String(d?.date || "").slice(0, 10);
      if (dStr) map.set(dStr, d);
    }
    return map;
  };

  const beDays = indexDays(beItem);
  const motherDays = indexDays(motherItem);

  const isDayBlocked = (d: any | undefined): boolean => {
    if (!d) return true;
    const av = d.availability !== undefined ? Number(d.availability) : undefined;
    const availField = d.available !== undefined ? d.available : undefined;
    const price = Number(d.price ?? d.value ?? d.amount ?? 0);
    if (av !== undefined && !Number.isNaN(av) && av <= 0) return true;
    if (availField === false || availField === 0) return true;
    if (d.stopSells === true || d.stopSell === true || d.closed === true) return true;
    if (price >= 10000) return true;
    return false;
  };

  const unavailableDates: string[] = [];
  const nightsPrices: Array<{ date: string; price: number }> = [];
  let maxMinStayRequired = 1;
  let totalCalendarPrice = 0;

  for (const night of nights) {
    const beDay = beItem ? beDays.get(night) : undefined;
    const motherDay = motherItem ? motherDays.get(night) : undefined;

    // Se esiste la Madre, deve essere aperta/disponibile; se esiste la BE, deve essere aperta/disponibile.
    const motherBlocked = motherItem ? isDayBlocked(motherDay) : false;
    const beBlocked = beItem ? isDayBlocked(beDay) : false;

    if (motherBlocked || beBlocked) {
      unavailableDates.push(night);
    }

    const ms = Math.max(
      Number(beDay?.minStay ?? beDay?.minstay ?? 1),
      Number(motherDay?.minStay ?? motherDay?.minstay ?? 1)
    );
    if (ms > maxMinStayRequired) {
      maxMinStayRequired = ms;
    }

    const bePrice = Number(beDay?.price ?? beDay?.value ?? 0);
    const motherPrice = Number(motherDay?.price ?? motherDay?.value ?? 0);
    const nightPrice =
      bePrice > 0 && bePrice < 10000
        ? bePrice
        : motherPrice > 0 && motherPrice < 10000
          ? motherPrice
          : 0;

    if (nightPrice > 0) {
      totalCalendarPrice += nightPrice;
      nightsPrices.push({ date: night, price: nightPrice });
    }
  }

  const averageNightlyPrice =
    nightsPrices.length > 0 ? Math.round(totalCalendarPrice / nightsPrices.length) : 0;

  if (unavailableDates.length > 0) {
    return {
      ok: false,
      statusCode: 409,
      errorCode: "DATES_UNAVAILABLE",
      reason: `Unavailable dates on live Octorate calendar: ${unavailableDates.join(", ")}`,
      unavailableDates,
      minStayRequired: maxMinStayRequired,
      averageNightlyPrice,
      totalCalendarPrice,
      nightsPrices
    };
  }

  if (nights.length < maxMinStayRequired) {
    return {
      ok: false,
      statusCode: 409,
      errorCode: "MIN_STAY_NOT_MET",
      reason: `Minimum stay not met: requested ${nights.length} night(s), required ${maxMinStayRequired}.`,
      unavailableDates: [],
      minStayRequired: maxMinStayRequired,
      averageNightlyPrice,
      totalCalendarPrice,
      nightsPrices
    };
  }

  return {
    ok: true,
    statusCode: 200,
    unavailableDates: [],
    minStayRequired: maxMinStayRequired,
    averageNightlyPrice,
    totalCalendarPrice,
    nightsPrices
  };
}

/**
 * Funzione pura e deterministica (testabile senza I/O):
 * verifica se tra le prenotazioni reali Octorate (su una o più strutture) esiste un overlap
 * sullo stesso alloggio o su un'unità fisicamente collegata (`JV <-> JVL / JVR`).
 */
export function findReservationOverlapPure(params: {
  targetCanonicalKey: string | null;
  linkedKeys: string[];
  checkIn: string;
  checkOut: string;
  reservations: Array<{ raw: any; structureId: string }>;
  excludeReservationId?: string | null;
}): {
  id: string;
  structureId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  channelName: string;
} | null {
  const {
    targetCanonicalKey,
    linkedKeys,
    checkIn,
    checkOut,
    reservations,
    excludeReservationId
  } = params;

  if (!targetCanonicalKey) return null;
  const conflictKeys = new Set<string>([targetCanonicalKey, ...linkedKeys]);
  const reqIn = String(checkIn).slice(0, 10);
  const reqOut = String(checkOut).slice(0, 10);

  for (const item of reservations) {
    const r = item.raw;
    if (!r) continue;
    const resId = String(r.id || r.reservationId || "");
    if (excludeReservationId && resId && resId === String(excludeReservationId)) {
      continue;
    }

    const st = String(r.status || "").toUpperCase().trim();
    if (
      st === "CANCELLED" ||
      st === "CANCELED" ||
      st === "DELETED" ||
      st === "VOID" ||
      st === "REJECTED" ||
      Boolean(r.cancelled) ||
      Boolean(r.isCancelled)
    ) {
      continue;
    }

    const canonical = getCanonicalAccommodation(r);
    if (!canonical || !conflictKeys.has(canonical.key)) {
      continue;
    }

    const rIn = toThailandDateStr(r.checkin || r.checkIn || r.check_in);
    const rOut = toThailandDateStr(r.checkout || r.checkOut || r.check_out);
    if (!rIn || !rOut) continue;

    // Condizione canonica di sovrapposizione notti: A.in < B.out AND B.in < A.out
    if (rIn < reqOut && reqIn < rOut) {
      return {
        id: resId || "unknown",
        structureId: item.structureId,
        roomName: canonical.name || String(r.roomName || ""),
        checkIn: rIn,
        checkOut: rOut,
        channelName: String(r.channelName || r.channel || r.ota || "Octorate")
      };
    }
  }

  return null;
}

function buildLocalizedGuardMessage(
  errorCode: AvailabilityErrorCode,
  lang: string = "EN",
  extra?: { minStay?: number; roomName?: string }
): string {
  const l = String(lang || "EN").toUpperCase();
  if (errorCode === "MIN_STAY_NOT_MET") {
    const ms = extra?.minStay || 2;
    if (l === "IT") return `Soggiorno minimo non rispettato. Questo alloggio richiede almeno ${ms} notti per le date selezionate.`;
    if (l === "TH") return `ไม่เป็นไปตามจำนวนคืนขั้นต่ำ ที่พักนี้ต้องการเข้าพักอย่างน้อย ${ms} คืนสำหรับวันที่เลือก`;
    if (l === "DE") return `Mindestaufenthalt nicht erfüllt. Diese Unterkunft erfordert mindestens ${ms} Nächte.`;
    return `Minimum stay not met. This accommodation requires at least ${ms} nights for the selected dates.`;
  }
  if (errorCode === "SOFT_HOLD_ACTIVE") {
    if (l === "IT") return "Un altro ospite sta completando la prenotazione per questo alloggio nelle stesse date. Riprova tra qualche minuto o scegli altre date.";
    if (l === "TH") return "มีผู้เข้าพักท่านอื่นกำลังดำเนินการชำระเงินสำหรับที่พักและวันที่นี้อยู่ กรุณาลองใหม่อีกครั้งในอีกสักครู่";
    if (l === "DE") return "Ein anderer Gast schließt gerade eine Buchung für diese Daten ab. Bitte versuchen Sie es in wenigen Minuten erneut.";
    return "Another guest is currently completing payment for this accommodation on these dates. Please try again in a few minutes or select different dates.";
  }
  if (errorCode === "OCTORATE_UNAVAILABLE" || errorCode === "ROOM_NOT_FOUND_IN_CALENDAR") {
    if (l === "IT") return "Verifica disponibilità live temporaneamente non raggiungibile. Per garantire zero overbooking non possiamo procedere al pagamento ora: riprova tra 1 minuto o scrivici su WhatsApp.";
    if (l === "TH") return "ไม่สามารถตรวจสอบห้องว่างแบบเรียลไทม์ได้ชั่วคราว กรุณาลองใหม่อีกครั้งใน 1 นาที หรือติดต่อเราทาง WhatsApp";
    if (l === "DE") return "Die Live-Verfügbarkeitsprüfung ist vorübergehend nicht erreichbar. Bitte versuchen Sie es in 1 Minute erneut oder schreiben Sie uns auf WhatsApp.";
    return "Live availability check is temporarily unavailable. To guarantee zero overbooking we cannot start payment right now—please retry in 1 minute or contact us on WhatsApp.";
  }
  // DATES_UNAVAILABLE / RESERVATION_CONFLICT
  if (l === "IT") return "Spiacenti, questo alloggio non è più disponibile per tutte le date selezionate (una o più notti risultano già prenotate). Seleziona altre date o un altro alloggio.";
  if (l === "TH") return "ขออภัย ที่พักนี้ไม่ว่างสำหรับทุกวันที่คุณเลือกแล้ว (มีบางคืนถูกจองแล้ว) กรุณาเลือกวันอื่นหรือที่พักอื่น";
  if (l === "DE") return "Leider ist diese Unterkunft für die gewählten Daten nicht mehr vollständig verfügbar. Bitte wählen Sie andere Daten oder eine andere Unterkunft.";
  return "Sorry, this accommodation is no longer available for all selected dates (one or more nights are already booked). Please choose different dates or another accommodation.";
}

async function refreshOctorateToken(
  supabaseAdmin: any,
  refreshToken: string
): Promise<string | null> {
  const clientId = process.env.VITE_OCTORATE_CLIENT_ID || process.env.OCTORATE_CLIENT_ID || "";
  const clientSecret = process.env.OCTORATE_SECRET_KEY || process.env.VITE_OCTORATE_SECRET_KEY || "";
  if (!refreshToken || !clientId || !clientSecret) return null;

  try {
    const res = await fetch("https://api.octorate.com/connect/rest/v1/identity/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json"
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret
      }).toString()
    });
    if (!res.ok) return null;
    const newTokens: any = await res.json();
    if (!newTokens?.access_token) return null;

    if (supabaseAdmin) {
      await supabaseAdmin.from("octorate_tokens").upsert({
        id: "singleton",
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token || refreshToken,
        expires_in: newTokens.expires_in,
        updated_at: new Date().toISOString()
      });
    }
    return newTokens.access_token;
  } catch (err) {
    console.warn("[AvailabilityGuard] Token refresh error:", err);
    return null;
  }
}

/**
 * 🛡️ Verifica live completa e Fail-Closed per il checkout e per la finalizzazione.
 */
export async function verifyLiveAvailabilityForCheckout(params: {
  accommodationId: number | string;
  roomNameHint?: string;
  checkIn: string;
  checkOut: string;
  lang?: string;
  supabaseAdmin: any;
  accessTokenOverride?: string | null;
  excludeSessionId?: string | null;
  excludeReservationId?: string | null;
  skipSoftHoldCheck?: boolean;
}): Promise<AvailabilityGuardResult> {
  const {
    accommodationId,
    roomNameHint,
    checkIn,
    checkOut,
    lang = "EN",
    supabaseAdmin,
    accessTokenOverride,
    excludeSessionId,
    excludeReservationId,
    skipSoftHoldCheck = false
  } = params;

  const nights = getStayNightDates(checkIn, checkOut);
  if (nights.length === 0) {
    return {
      ok: false,
      statusCode: 400,
      errorCode: "INVALID_DATES",
      reason: "Invalid checkIn/checkOut range.",
      localizedMessage: buildLocalizedGuardMessage("DATES_UNAVAILABLE", lang)
    };
  }

  // 1. Risoluzione dinamica struttura attiva (gestisce 366879, 807324, 619403 + active_jungle_source_v1)
  const target = await resolveOctorateBookingTarget(accommodationId, supabaseAdmin, roomNameHint);
  const { canonicalKey, linkedKeys, canonicalName } = resolveCanonicalAndLinkedKeys(
    [target.productId, target.motherId, accommodationId],
    target.roomName || roomNameHint
  );

  // 2. Controllo Soft-Hold concorrente (15 minuti) in Supabase
  if (!skipSoftHoldCheck && supabaseAdmin && canonicalKey) {
    const softHold = await findConflictingPendingBookingsAsync({
      canonicalKey,
      linkedKeys,
      checkIn: String(checkIn).slice(0, 10),
      checkOut: String(checkOut).slice(0, 10),
      excludeSessionId: excludeSessionId || undefined,
      supabaseAdmin
    });

    if (softHold) {
      return {
        ok: false,
        statusCode: 409,
        errorCode: "SOFT_HOLD_ACTIVE",
        reason: `Active pending checkout (${softHold.sessionId}) holds ${canonicalName} for ${softHold.checkIn} -> ${softHold.checkOut}.`,
        localizedMessage: buildLocalizedGuardMessage("SOFT_HOLD_ACTIVE", lang),
        target,
        canonicalKey,
        conflictingSoftHold: {
          sessionId: softHold.sessionId,
          checkIn: softHold.checkIn,
          checkOut: softHold.checkOut
        }
      };
    }
  }

  // 3. Recupero token Octorate (Fail-Closed se assente)
  let accessToken: string | null = accessTokenOverride || null;
  let refreshToken: string | null = null;

  if (!accessToken && supabaseAdmin) {
    try {
      const { data: tok } = await supabaseAdmin
        .from("octorate_tokens")
        .select("access_token, refresh_token")
        .eq("id", "singleton")
        .maybeSingle();
      if (tok?.access_token) accessToken = tok.access_token;
      if (tok?.refresh_token) refreshToken = tok.refresh_token;
    } catch (tokErr) {
      console.warn("[AvailabilityGuard] Supabase token fetch error:", tokErr);
    }
  }

  if (!accessToken) {
    return {
      ok: false,
      statusCode: 503,
      errorCode: "OCTORATE_UNAVAILABLE",
      reason: "Octorate access token missing (fail-closed).",
      localizedMessage: buildLocalizedGuardMessage("OCTORATE_UNAVAILABLE", lang),
      target,
      canonicalKey
    };
  }

  const fetchWithAuthRetry = async (url: string): Promise<Response> => {
    let res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json"
      }
    });
    if ((res.status === 401 || res.status === 403) && refreshToken) {
      const refreshed = await refreshOctorateToken(supabaseAdmin, refreshToken);
      if (refreshed) {
        accessToken = refreshed;
        res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json"
          }
        });
      }
    }
    return res;
  };

  // 4. Controllo Calendario LIVE sulla struttura ATTIVA (`target.structureId`) con paginazione 0-indexed
  let beItem: any = null;
  let motherItem: any = null;
  const checkInDate = String(checkIn).slice(0, 10);
  const checkOutDate = String(checkOut).slice(0, 10);

  try {
    let page = 0;
    const maxPages = 15;
    while (page < maxPages) {
      const calUrl = `https://api.octorate.com/connect/rest/v1/calendar/${target.structureId}?dateFrom=${checkInDate}&dateTo=${checkOutDate}&size=50&page=${page}`;
      const calRes = await fetchWithAuthRetry(calUrl);
      if (!calRes.ok) {
        return {
          ok: false,
          statusCode: 503,
          errorCode: "OCTORATE_UNAVAILABLE",
          reason: `Octorate calendar API returned HTTP ${calRes.status} for structure ${target.structureId} (fail-closed).`,
          localizedMessage: buildLocalizedGuardMessage("OCTORATE_UNAVAILABLE", lang),
          target,
          canonicalKey
        };
      }

      const calJson: any = await calRes.json();
      const items: any[] = Array.isArray(calJson) ? calJson : (calJson?.data || []);
      if (items.length === 0) break;

      for (const it of items) {
        const idNum = Number(it?.id ?? it?.room ?? 0);
        if (!beItem && idNum === target.productId) beItem = it;
        if (!motherItem && idNum === target.motherId) motherItem = it;
      }

      if (beItem && motherItem) break;
      if (items.length < 50) break;
      page++;
    }
  } catch (calErr: any) {
    return {
      ok: false,
      statusCode: 503,
      errorCode: "OCTORATE_UNAVAILABLE",
      reason: `Octorate calendar exception: ${calErr?.message || calErr}`,
      localizedMessage: buildLocalizedGuardMessage("OCTORATE_UNAVAILABLE", lang),
      target,
      canonicalKey
    };
  }

  const calEval = evaluateCalendarAvailabilityPure({
    nights,
    beItem,
    motherItem
  });

  if (!calEval.ok) {
    return {
      ok: false,
      statusCode: calEval.statusCode,
      errorCode: calEval.errorCode,
      reason: calEval.reason,
      localizedMessage: buildLocalizedGuardMessage(calEval.errorCode || "DATES_UNAVAILABLE", lang, {
        minStay: calEval.minStayRequired,
        roomName: canonicalName
      }),
      target,
      canonicalKey,
      unavailableDates: calEval.unavailableDates,
      minStayRequired: calEval.minStayRequired,
      averageNightlyPrice: calEval.averageNightlyPrice,
      totalCalendarPrice: calEval.totalCalendarPrice,
      nightsPrices: calEval.nightsPrices
    };
  }

  // 5. Controllo incrociato Prenotazioni Reali LIVE su Octorate:
  //    Per le 4 Jungle Villas interroga ENTRAMBE le strutture ('366879' + '807324') per coprire
  //    prenotazioni pre-switch, ritardi mirror e Keep-Alive Luglio.
  const structuresToCheck = target.isJungle
    ? ["366879", "807324"]
    : [target.structureId];

  const fetchedReservations: Array<{ raw: any; structureId: string }> = [];

  try {
    for (const structId of structuresToCheck) {
      let page = 0;
      const maxPages = 10;
      while (page < maxPages) {
        const resUrl = `https://api.octorate.com/connect/rest/v1/reservation/${structId}?type=STAY&startDate=${checkInDate}&endDate=${checkOutDate}&size=50&page=${page}`;
        const rRes = await fetchWithAuthRetry(resUrl);
        if (!rRes.ok) {
          return {
            ok: false,
            statusCode: 503,
            errorCode: "OCTORATE_UNAVAILABLE",
            reason: `Octorate reservations API returned HTTP ${rRes.status} for structure ${structId} (fail-closed).`,
            localizedMessage: buildLocalizedGuardMessage("OCTORATE_UNAVAILABLE", lang),
            target,
            canonicalKey
          };
        }

        const rJson: any = await rRes.json();
        const rows: any[] = Array.isArray(rJson?.data)
          ? rJson.data
          : Array.isArray(rJson)
            ? rJson
            : (rJson?.reservations || []);

        if (rows.length === 0) break;
        for (const row of rows) {
          fetchedReservations.push({ raw: row, structureId: structId });
        }
        if (rows.length < 50) break;
        page++;
      }
    }
  } catch (resErr: any) {
    return {
      ok: false,
      statusCode: 503,
      errorCode: "OCTORATE_UNAVAILABLE",
      reason: `Octorate reservations exception: ${resErr?.message || resErr}`,
      localizedMessage: buildLocalizedGuardMessage("OCTORATE_UNAVAILABLE", lang),
      target,
      canonicalKey
    };
  }

  const conflict = findReservationOverlapPure({
    targetCanonicalKey: canonicalKey,
    linkedKeys,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    reservations: fetchedReservations,
    excludeReservationId
  });

  if (conflict) {
    return {
      ok: false,
      statusCode: 409,
      errorCode: "RESERVATION_CONFLICT",
      reason: `Overlapping reservation #${conflict.id} on structure ${conflict.structureId} (${conflict.roomName}, ${conflict.checkIn} -> ${conflict.checkOut}, ${conflict.channelName}).`,
      localizedMessage: buildLocalizedGuardMessage("RESERVATION_CONFLICT", lang, { roomName: canonicalName }),
      target,
      canonicalKey,
      conflictingReservation: conflict
    };
  }

  return {
    ok: true,
    statusCode: 200,
    target,
    canonicalKey,
    unavailableDates: [],
    minStayRequired: calEval.minStayRequired,
    averageNightlyPrice: calEval.averageNightlyPrice,
    totalCalendarPrice: calEval.totalCalendarPrice,
    nightsPrices: calEval.nightsPrices
  };
}
