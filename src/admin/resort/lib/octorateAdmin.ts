/**
 * Modulo Octorate per la Dashboard Amministrativa (/admin)
 * Riservato ed isolato dal Booking Engine del sito pubblico per garantire zero regressioni.
 */

// Mappatura immutabile 1:1 ID TARIFFA MADRE per Octorate
export const MOCK_MOTHER_RATE_PLANS: Record<string, number> = {
  "Peace & Love Villa": 494840,
  "Penthouse Villa": 421511,
  "Villa Penthouse": 421511,
  "Jungle Villa": 529773,
  "Jungle Villa Left": 495795,
  "Jungle Villa Right": 495796,
  "Lodge 1": 293951,
  "Lodge 2": 883795,
  "Red Bungalow": 293954,
  "Green Bungalow": 293962,
  "Yellow Bungalow": 293957,
  "Lagoon Tent": 293955,
  "Lagoon Tent Bungalow": 293955,
  "Camel Tent": 293965,
  "Camel Tent Bungalow": 293965,
  "Room 1": 293963,
  "Room 2": 293959,
  "Room 3": 293948,
  "Room 4": 293945,
  "Room 5": 293943,
  "Internal Room": 293942
};

export function getMotherRatePlanId(accommodationName: string): number {
  if (!accommodationName) return 0;
  const name = accommodationName.trim();
  if (MOCK_MOTHER_RATE_PLANS[name]) return MOCK_MOTHER_RATE_PLANS[name];

  const nameLower = name.toLowerCase();
  for (const key in MOCK_MOTHER_RATE_PLANS) {
    if (key.toLowerCase() === nameLower || nameLower.includes(key.toLowerCase()) || key.toLowerCase().includes(nameLower)) {
      return MOCK_MOTHER_RATE_PLANS[key];
    }
  }
  return 0;
}

/**
 * Determina il Soggiorno Minimo di Baseline stagionale per una data specifica:
 * - Fino al 20 Dicembre (compreso): 2 notti
 * - Dal 21 Dicembre al 15 Gennaio (compreso - Altissima Stagione): 5 notti
 * - Dal 16 Gennaio in poi (resto dell'anno): 2 notti
 */
export function getBaselineMinStay(dateStr: string): number {
  if (!dateStr || typeof dateStr !== 'string') return 2;
  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length < 3) return 2;
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if ((month === 12 && day >= 21) || (month === 1 && day <= 15)) {
    return 5;
  }
  return 2;
}

export interface DynamicMinStayUpdate {
  roomTypeId: string;
  accommodationName: string;
  dateFrom: string;
  dateTo: string;
  minStay: number;
  reason: string;
}

/**
 * Calcola l'algoritmo di Soggiorno Minimo Dinamico (Gap-Filling & Density Pricing)
 * - Bucature (Gap G = checkIn_succ - checkOut_prec): Se 0 < G < 7 -> M = min(G, baseMinStay)
 * - Density Pricing: Occupazione >= 75% -> M = 5; 40-74% -> M = 3; < 40% -> M = 2/1
 */
export function calculateDynamicMinStay(
  bookings: Array<{ accommodation_name?: string; accommodation_id?: string; check_in: string; check_out: string; status?: string }>,
  dateRange: { start: string; end: string },
  occupancyRatePct: number = 50
): DynamicMinStayUpdate[] {
  const updates: DynamicMinStayUpdate[] = [];
  const activeBookings = (bookings || []).filter(b => b.status !== 'cancelled');

  // Mappatura prenotazioni per alloggio
  const roomBookingsMap: Record<string, Array<{ in: string; out: string }>> = {};

  activeBookings.forEach(b => {
    const key = (b.accommodation_name || b.accommodation_id || 'unknown').trim();
    if (!roomBookingsMap[key]) roomBookingsMap[key] = [];
    roomBookingsMap[key].push({
      in: b.check_in.slice(0, 10),
      out: b.check_out.slice(0, 10)
    });
  });

  // Calcolo Gap-Fill per ogni alloggio
  Object.keys(roomBookingsMap).forEach(roomName => {
    const sorted = roomBookingsMap[roomName].sort((a, b) => a.in.localeCompare(b.in));
    
    for (let i = 0; i < sorted.length - 1; i++) {
      const prevOut = sorted[i].out;
      const nextIn = sorted[i + 1].in;

      if (prevOut >= dateRange.start && nextIn <= dateRange.end) {
        const prevOutTime = new Date(prevOut).getTime();
        const nextInTime = new Date(nextIn).getTime();
        const gapDays = Math.round((nextInTime - prevOutTime) / (1000 * 60 * 60 * 24));

        if (gapDays > 0 && gapDays < 7) {
          const baseStay = getBaselineMinStay(prevOut);
          
          // Regola Density Pricing:
          let densityStay = baseStay;
          if (occupancyRatePct >= 75) {
            densityStay = 5;
          } else if (occupancyRatePct >= 40) {
            densityStay = 3;
          } else {
            densityStay = 2;
          }

          const gapMinStay = Math.min(gapDays, densityStay);

          const octRoomId = String(getMotherRatePlanId(roomName) || roomName);
          updates.push({
            roomTypeId: octRoomId,
            accommodationName: roomName,
            dateFrom: prevOut,
            dateTo: nextIn,
            minStay: gapMinStay,
            reason: `Gap-Fill (${gapDays}d gap, Density ${occupancyRatePct}%): M=${gapMinStay}`
          });
        }
      }
    }
  });

  return updates;
}
