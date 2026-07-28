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
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 2;
  const month = d.getMonth() + 1; // 1-12
  const day = d.getDate();

  if ((month === 12 && day >= 21) || (month === 1 && day <= 15)) {
    return 5;
  }
  return 2;
}
