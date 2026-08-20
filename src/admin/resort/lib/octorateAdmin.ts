/**
 * Modulo Octorate per la Dashboard Amministrativa (/admin)
 * Riservato ed isolato dal Booking Engine del sito pubblico per garantire zero regressioni.
 */

import { ACCOMMODATIONS } from '../../../booking/resort/config/accommodations';

// Mappatura immutabile 1:1 ID TARIFFA MADRE e Codici Derivati per Octorate (212 Prodotti)
export const MOCK_MOTHER_RATE_PLANS: Record<string, number> = {
  "Jungle Villa": 529773,
  "Jungle Villa Left": 495795,
  "Jungle Villa Right": 495796,
  "Peace & Love Villa": 494840,
  "Penthouse Villa": 421511,
  "Villa Penthouse": 421511,
  "Yellow Bungalow": 293957,
  "Red Bungalow": 293954,
  "Green Bungalow": 293962,
  "Camel Tent": 293965,
  "Camel Tent Bungalow": 293965,
  "Lagoon Tent": 293955,
  "Lagoon Tent Bungalow": 293955,
  "Internal Room": 293942,
  "Room 1": 293963,
  "Room 2": 293959,
  "Room 3": 293948,
  "Room 4": 293945,
  "Room 5": 293943,
  "Lodge 1": 293951,
  "Lodge 2": 883795,
  "Fake Bungalow 1": 649669,
  "Fake Bungalow 2": 921799
};

export const ALL_ACCOMMODATIONS_MAP: Record<string, { motherId: number; name: string; ids: string[]; keywords: string[][]; linkedKeys?: string[] }> = {
  'jungle villa': {
    motherId: 529773,
    name: 'Jungle Villa',
    ids: ['529773', '529784', '529778', '529792', '529788', '529780', '916817', '529781', '529801', '921868', '921869', '529783', '529813'],
    keywords: [["jungle", "jv"], ["villa", "ac", "be"]],
    linkedKeys: ['jungle villa left', 'jungle villa right']
  },
  'jungle villa left': {
    motherId: 495795,
    name: 'Jungle Villa Left',
    ids: ['495795', '495807', '495804', '496009', '496001', '495805', '496022', '495806', '496031', '921870', '921871', '495810', '496057'],
    keywords: [["jungle", "jv"], ["left", "jvl"]],
    linkedKeys: ['jungle villa']
  },
  'jungle villa right': {
    motherId: 495796,
    name: 'Jungle Villa Right',
    ids: ['495796', '495980', '495977', '496010', '496002', '495978', '496021', '495979', '496030', '921872', '921873', '495982', '496056'],
    keywords: [["jungle", "jv"], ["right", "jvr"]],
    linkedKeys: ['jungle villa']
  },
  'peace & love villa': {
    motherId: 494840,
    name: 'Peace & Love Villa',
    ids: ['494840', '495566', '495580', '495575', '495552', '495587', '495565', '495593', '921874', '921875', '495569', '495609'],
    keywords: [["peace", "love", "p&l"]]
  },
  'villa penthouse': {
    motherId: 421511,
    name: 'Villa Penthouse',
    ids: ['421511', '449348', '421513', '421516', '421520', '421522', '421525', '421527', '421530', '921876', '921877', '421532', '421533'],
    keywords: [["penthouse", "pent"]]
  },
  'yellow bungalow': {
    motherId: 293957,
    name: 'Yellow Bungalow',
    ids: ['293957', '449385', '293958', '332055', '332054', '331921', '332057', '331922', '332060', '921878', '921879', '297022', '340198'],
    keywords: [["yellow"]]
  },
  'red bungalow': {
    motherId: 293954,
    name: 'Red Bungalow',
    ids: ['293954', '449422', '293953', '332030', '332029', '330964', '332035', '330970', '332036', '921880', '921881', '297021', '340196'],
    keywords: [["red"]]
  },
  'green bungalow': {
    motherId: 293962,
    name: 'Green Bungalow',
    ids: ['293962', '449668', '293961', '332070', '332066', '331923', '332072', '331924', '332074', '921882', '921883', '297023', '340200'],
    keywords: [["green"]]
  },
  'camel tent bungalow': {
    motherId: 293965,
    name: 'Camel Tent',
    ids: ['293965', '449675', '422325', '293966', '332089', '332084', '297025'],
    keywords: [["camel"]]
  },
  'lagoon tent bungalow': {
    motherId: 293955,
    name: 'Lagoon Tent',
    ids: ['293955', '449674', '422351', '293956', '332081', '332077', '297024'],
    keywords: [["lagoon"]]
  },
  'internal room': {
    motherId: 293942,
    name: 'Internal Room',
    ids: ['293942', '449742', '293941', '332109', '332105', '340367', '916840', '421998', '916838', '921898', '921899', '297027', '422147'],
    keywords: [["internal", "inter"]]
  },
  'room 1': {
    motherId: 293963,
    name: 'Room 1',
    ids: ['293963', '449678', '422300', '332737', '332735', '331976', '916818', '331977', '916402', '921889', '921890', '297033', '421505'],
    keywords: [["room", "hub", "r1"], ["1", "one"]]
  },
  'room 2': {
    motherId: 293959,
    name: 'Room 2',
    ids: ['293959', '449684', '422296', '332741', '332739', '331966', '332119', '331967', '332134', '921891', '921900', '297032', '421506'],
    keywords: [["room", "hub", "r2"], ["2", "two"]]
  },
  'room 3': {
    motherId: 293948,
    name: 'Room 3',
    ids: ['293948', '449699', '422293', '332743', '332757', '331968', '332121', '331969', '332136', '921892', '921893', '297028', '421507'],
    keywords: [["room", "hub", "r3"], ["3", "three"]]
  },
  'room 4': {
    motherId: 293945,
    name: 'Room 4',
    ids: ['293945', '449724', '422265', '332759', '332746', '331970', '332123', '331971', '332138', '921894', '921895', '297029', '421508'],
    keywords: [["room", "hub", "r4"], ["4", "four"]]
  },
  'room 5': {
    motherId: 293943,
    name: 'Room 5',
    ids: ['293943', '449730', '422213', '332765', '332763', '331972', '332125', '331973', '332140', '921896', '921897', '297031', '421509'],
    keywords: [["room", "hub", "r5"], ["5", "five"]]
  },
  'lodge 1': {
    motherId: 293951,
    name: 'Lodge 1',
    ids: ['293951', '449736', '422149', '332769', '332767', '331974', '332129', '422157', '332142', '921884', '921885', '297030', '421510'],
    keywords: [["lodge"], ["1", "one"]]
  },
  'lodge 2': {
    motherId: 883795,
    name: 'Lodge 2',
    ids: ['883795', '923905', '916108', '916107', '916109', '916114', '916829', '916105', '916830', '921886', '921887', '916103', '916104'],
    keywords: [["lodge"], ["2", "two"]]
  },
  'fake bungalow 1': {
    motherId: 649669,
    name: 'Fake Bungalow 1',
    ids: ['649669', '932243', '932244', '932246', '932247', '932248', '932249', '932250', '932251', '932252', '932253', '932254', '932255'],
    keywords: [["fake"], ["1", "one"]]
  },
  'fake bungalow 2': {
    motherId: 921799,
    name: 'Fake Bungalow 2',
    ids: ['921799', '932256', '932257', '932259', '932260', '932261', '932262', '932263', '932264', '932265', '932266', '932267', '932268'],
    keywords: [["fake"], ["2", "two"]]
  }
};

export function getMotherRatePlanId(accommodationName: string): number {
  if (!accommodationName) return 0;
  const canonical = getCanonicalAccommodation({ accommodation_name: accommodationName });
  if (canonical) return canonical.motherId;
  return 0;
}

export function getCanonicalAccommodation(booking: any): { key: string; name: string; motherId: number } | null {
  if (!booking) return null;
  const bProduct = String(booking.product || booking.pmsProduct || booking.accommodation_id || booking.roomId || '').trim();
  const bName = String(booking.roomName || booking.accommodation_name || booking.room_name || '').toLowerCase().trim();

  // 1. Direct match by Product ID in 212 rate plans map
  if (bProduct) {
    for (const [key, entry] of Object.entries(ALL_ACCOMMODATIONS_MAP)) {
      if (entry.ids.includes(bProduct)) {
        return { key, name: entry.name, motherId: entry.motherId };
      }
    }
  }

  // 2. Fuzzy match by OTA Name / Keywords
  if (bName) {
    // Specific check for Jungle Villa Right vs Left vs Master
    if (bName.includes('jvr') || bName.includes('right')) {
      return { key: 'jungle villa right', name: 'Jungle Villa Right', motherId: 495796 };
    }
    if (bName.includes('jvl') || bName.includes('left')) {
      return { key: 'jungle villa left', name: 'Jungle Villa Left', motherId: 495795 };
    }

    for (const [key, entry] of Object.entries(ALL_ACCOMMODATIONS_MAP)) {
      const matchAllGroups = entry.keywords.every(group => group.some(kw => bName.includes(kw)));
      if (matchAllGroups) {
        return { key, name: entry.name, motherId: entry.motherId };
      }
    }
  }

  return null;
}

/**
 * Restituisce il numero di unità di Aria Condizionata fisiche presenti in un alloggio:
 * - Jungle Villa (Madre Intera) ➔ 2 AC units
 * - Villa Penthouse ➔ 2 AC units
 * - Jungle Villa Left & Right, e tutti gli altri alloggi ➔ 1 AC unit
 */
export function getAcUnitsForRoom(roomName: string): number {
  const s = String(roomName || '').toLowerCase();
  if (s.includes('left') || s.includes('right')) {
    return 1;
  }
  if (s.includes('jungle villa') || s.includes('penthouse')) {
    return 2;
  }
  return 1;
}

/**
 * Helper per normalizzare qualsiasi input data (stringa ISO, Date object, timestamp)
 * alla stringa YYYY-MM-DD nel fuso orario 'Asia/Bangkok'.
 */
export function toThailandDateStr(raw: any): string {
  if (!raw) return '';
  const s = String(raw).trim();
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  const d = new Date(raw);
  if (isNaN(d.getTime())) return s.slice(0, 10);

  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
  } catch (e) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}

/**
 * Estrae anno, mese (1-12, NON 0-indexed) e giorno (1-31)
 * con preventiva normalizzazione nel fuso Asia/Bangkok.
 */
export function parseThailandDateParts(dateInput: any): { year: number; month: number; day: number } | null {
  const formatted = toThailandDateStr(dateInput);
  if (!formatted || !/^\d{4}-\d{2}-\d{2}$/.test(formatted)) return null;

  const parts = formatted.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10); // 1 = Gennaio, 12 = Dicembre
  const day = parseInt(parts[2], 10);   // 1 - 31

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return { year, month, day };
}

import { useRestrictionsStore, INITIAL_MIN_STAY_PERIODS } from '../store/useRestrictionsStore-v17';

/**
 * Determina il Soggiorno Minimo di Baseline per una data specifica.
 * 🎯 UNICA SORGENTE DI VERITÀ INDEROGABILE:
 * Legge dinamicamente la Timeline Min Stay da useRestrictionsStore (Gestione Tariffe Derivate).
 */
export function getBaselineMinStay(dateInput: any): number {
  const dStr = typeof dateInput === 'string' ? dateInput.slice(0, 10) : toThailandDateStr(dateInput);
  if (!dStr) return 2;

  // 🎯 SORGENTE DI VERITÀ UNICA E INDEROGABILE:
  // Legge dinamicamente la Timeline Min Stay configurata in Gestione Tariffe Derivate (useRestrictionsStore)
  try {
    const storePeriods = useRestrictionsStore.getState?.()?.plannedMinStayPeriods;
    const periods = (storePeriods && storePeriods.length > 0) ? storePeriods : INITIAL_MIN_STAY_PERIODS;

    const matched = periods.find(p => dStr >= p.dateFrom && dStr <= p.dateTo);
    if (matched && matched.minStay) {
      return matched.minStay;
    }
  } catch {}

  return 2;
}

/**
 * Restituisce la data di fine stagione del villaggio (31 Ottobre dell'anno successivo).
 * La stagione del resort parte il 1 Novembre e si estende sempre fino al 31 Ottobre dell'anno successivo.
 * Esempio: Se oggi è nel 2026 (es. Agosto o Novembre 2026), la fine stagione è 2027-10-31.
 */
export function getSeasonalEndDateStr(todayInput?: any): string {
  const formatted = toThailandDateStr(todayInput || new Date());
  if (!formatted) {
    const year = new Date().getFullYear();
    return `${year + 1}-10-31`;
  }
  const parts = formatted.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);

  // La data di fine stagione assoluta per qualsiasi data nell'anno Y è sempre il 31 Ottobre (Y + 1)
  const seasonEndYear = year + 1;
  return `${seasonEndYear}-10-31`;
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
 * Calcola l'algoritmo di Soggiorno Minimo Dinamico (Puro Gap-Filling Assoluto subordinato alla Baseline)
 * - Sganciato dai limiti della griglia visiva a schermo.
 * - Scansiona l'intero array delle prenotazioni stagionali (rawOctorateBookings).
 * - Per ogni camera, calcola la distanza in giorni basandosi sul VERO prev_checkout e il VERO next_checkin della prenotazione successiva.
 * - NUOVA REGOLA D'ORO OCTORATE: Le restrizioni (MinStay) colpiscono direttamente gli ID delle tariffe derivate slegate (7d/14d OTA).
 */
export function calculateDynamicMinStay(
  bookingsInput?: Array<{ accommodation_name?: string; accommodation_id?: string; check_in: string; check_out: string; status?: string; product?: string; roomName?: string }>,
  dateRange?: { start?: string; end?: string; enabled?: boolean }
): DynamicMinStayUpdate[] {
  const updates: DynamicMinStayUpdate[] = [];

  // Se il calcolo dinamico non è abilitato esplicitamente (isDynamicCalculationEnabled = false), restituisci array vuoto (Baseline Gialla Pura)
  if (dateRange?.enabled === false) {
    return updates;
  }

  const activeBookings = (bookingsInput || []).filter(b => {
    const st = String(b.status || '').toUpperCase().trim();
    return st !== 'CANCELLED' && st !== 'CANCELED' && st !== 'DELETED' && st !== 'VOID' && st !== 'REJECTED' && !(b as any).cancelled && !(b as any).isCancelled;
  });

  // Mappatura prenotazioni per alloggio CANONICO (utilizzando l'Albero Octorate 212 Prodotti)
  const roomBookingsMap: Record<string, { motherId: number; name: string; list: Array<{ in: string; out: string }> }> = {};

  Object.entries(ALL_ACCOMMODATIONS_MAP).forEach(([key, canonical]) => {
    roomBookingsMap[key] = { motherId: canonical.motherId, name: canonical.name, list: [] };
  });

  activeBookings.forEach(b => {
    const canonical = getCanonicalAccommodation(b);
    const key = canonical ? canonical.key : String(b.accommodation_name || b.accommodation_id || 'unknown').trim();
    const motherId = canonical ? canonical.motherId : (getMotherRatePlanId(key) || 0);
    const displayName = canonical ? canonical.name : key;

    if (!roomBookingsMap[key]) {
      roomBookingsMap[key] = { motherId, name: displayName, list: [] };
    }

    const checkInStr = toThailandDateStr(b.check_in || (b as any).checkin || (b as any).checkIn || (b as any).startDate);
    const checkOutStr = toThailandDateStr(b.check_out || (b as any).checkout || (b as any).checkOut || (b as any).endDate);

    if (checkInStr && checkOutStr) {
      roomBookingsMap[key].list.push({ in: checkInStr, out: checkOutStr });
    }
  });

  const todayStr = toThailandDateStr(new Date());
  const rangeStartStr = dateRange?.start ? toThailandDateStr(dateRange.start) : todayStr;
  const rangeEndStr = dateRange?.end ? toThailandDateStr(dateRange.end) : getSeasonalEndDateStr(todayStr);

  // Calcolo Puro Gap-Fill Assoluto per ogni alloggio
  Object.entries(roomBookingsMap).forEach(([key, { motherId, name: roomName, list }]) => {
    const canonical = ALL_ACCOMMODATIONS_MAP[key] || Object.values(ALL_ACCOMMODATIONS_MAP).find(a => a.motherId === motherId);
    const linkedList = (canonical?.linkedKeys || []).flatMap(lKey => roomBookingsMap[lKey]?.list || []);
    const combinedList = [...list, ...linkedList];

    // Ordina TUTTE le prenotazioni della camera (e delle collegate) in sequenza temporale per l'intera stagione
    const sorted = combinedList.sort((a, b) => a.in.localeCompare(b.in));

    // Costruisce la sequenza di gap da analizzare:
    // 1. Dalla data di inizio range (oggi) alla prima prenotazione (se non inizia oggi)
    // 2. Tra tutte le prenotazioni consecutive
    const gaps: Array<{ start: string; end: string }> = [];

    // 2. Unione degli intervalli sovrapposti o adiacenti (Interval Merging canonico)
    const mergedOccupied: Array<{ in: string; out: string }> = [];
    for (const curr of sorted) {
      if (mergedOccupied.length === 0) {
        mergedOccupied.push({ ...curr });
      } else {
        const prev = mergedOccupied[mergedOccupied.length - 1];
        if (curr.in <= prev.out) {
          if (curr.out > prev.out) {
            prev.out = curr.out;
          }
        } else {
          mergedOccupied.push({ ...curr });
        }
      }
    }

    if (mergedOccupied.length === 0) {
      // Stanza completamente libera per tutta la stagione: ripristina la baseline su tutto il range
      gaps.push({ start: rangeStartStr, end: rangeEndStr });
    } else {
      // 1. Gap iniziale: da rangeStartStr al checkin del primo blocco occupato
      if (mergedOccupied[0].in > rangeStartStr) {
        gaps.push({ start: rangeStartStr, end: mergedOccupied[0].in });
      }

      // 2. Gap intermedi tra blocchi occupati consecutivi
      for (let i = 0; i < mergedOccupied.length - 1; i++) {
        const prevOut = mergedOccupied[i].out;
        const nextIn = mergedOccupied[i + 1].in;
        if (prevOut < nextIn && prevOut <= rangeEndStr && nextIn >= rangeStartStr) {
          const effectiveStart = prevOut < rangeStartStr ? rangeStartStr : prevOut;
          if (effectiveStart < nextIn) {
            gaps.push({ start: effectiveStart, end: nextIn });
          }
        }
      }

      // 3. Gap finale (Coda): dall'ultimo checkout fino al termine della stagione
      const lastOut = mergedOccupied[mergedOccupied.length - 1].out;
      if (lastOut < rangeEndStr) {
        const effectiveStart = lastOut < rangeStartStr ? rangeStartStr : lastOut;
        gaps.push({ start: effectiveStart, end: rangeEndStr });
      }
    }

    gaps.forEach(({ start: gapStart, end: gapEnd }) => {
      const pParts = parseThailandDateParts(gapStart);
      const nParts = parseThailandDateParts(gapEnd);

      if (pParts && nParts) {
        const prevOutTime = Date.UTC(pParts.year, pParts.month - 1, pParts.day);
        const nextInTime = Date.UTC(nParts.year, nParts.month - 1, nParts.day);
        const gapDays = Math.round((nextInTime - prevOutTime) / (1000 * 60 * 60 * 24));

        if (gapDays > 0) {
          const canonical = Object.values(ALL_ACCOMMODATIONS_MAP).find(a => a.motherId === motherId);
          const derivedIds = canonical?.ids?.filter(id => String(id) !== String(motherId)) || [];
          const targetIds = derivedIds.length > 0 ? derivedIds : [String(motherId || getMotherRatePlanId(roomName) || roomName)];

          let cur = gapStart;
          let blockStart = cur;
          let blockMinStay = Math.min(gapDays, getBaselineMinStay(cur));

          while (cur < gapEnd) {
            const baseline = getBaselineMinStay(cur);
            const target = Math.min(gapDays, baseline);

            if (target !== blockMinStay) {
              const curParts = parseThailandDateParts(cur);
              const prevDayTime = curParts ? Date.UTC(curParts.year, curParts.month - 1, curParts.day - 1) : 0;
              const blockEndInclusive = toThailandDateStr(new Date(prevDayTime));

              targetIds.forEach(targetId => {
                updates.push({
                  roomTypeId: targetId,
                  motherId: motherId,
                  accommodationName: roomName,
                  dateFrom: blockStart,
                  dateTo: blockEndInclusive,
                  minStay: blockMinStay,
                  reason: gapDays < blockMinStay
                    ? `Gap-Fill Dinamico (${gapDays}d): M=${blockMinStay}`
                    : `Minimo da Gestione Tariffe Derivate: M=${blockMinStay}`
                });
              });

              blockStart = cur;
              blockMinStay = target;
            }

            const cParts = parseThailandDateParts(cur);
            if (cParts) {
              const nextDayTime = Date.UTC(cParts.year, cParts.month - 1, cParts.day + 1);
              cur = toThailandDateStr(new Date(nextDayTime));
            } else {
              break;
            }
          }

          const lastDateInclusive = toThailandDateStr(new Date(nextInTime - 86400000));
          if (blockStart <= lastDateInclusive) {
            targetIds.forEach(targetId => {
              updates.push({
                roomTypeId: targetId,
                motherId: motherId,
                accommodationName: roomName,
                dateFrom: blockStart,
                dateTo: lastDateInclusive,
                minStay: blockMinStay,
                reason: gapDays < blockMinStay
                  ? `Gap-Fill Dinamico (${gapDays}d): M=${blockMinStay}`
                  : `Minimo da Gestione Tariffe Derivate: M=${blockMinStay}`
              });
            });
          }
        }
      }
    });
  });

  return updates;
}

export type DiscountExecutionMode = 'simulation' | 'test_bungalows' | 'production';

export interface CascadeDiscountUpdate {
  motherRateId: number;
  accommodationName: string;
  dateStr: string;
  offsetDays: number;
  stage: 1 | 2 | 3;
  basePrice: number;
  discountPercentage: number;
  discountedPrice: number;
  minimumSellingPrice: number;
  finalPrice: number;
  reason: string;
}

export interface CascadeDiscountOptions {
  stage1Days?: number;        // default 3 (offset 0, 1, 2)
  stage1Discount?: number;    // default 10%
  stage2Days?: number;        // default 5 (offset 3, 4, 5)
  stage2Discount?: number;    // default 5%
  stage3Days?: number;        // default 2 (offset 6, 7, 8, 9)
  stage3Discount?: number;    // default 2%
  executionMode?: DiscountExecutionMode; // 'simulation' | 'test_bungalows' | 'production'
  isTestEnvironment?: boolean; // legacy fallback
  rawGridItems?: any[];
}

export function getTargetAccommodationsForMode(mode: DiscountExecutionMode) {
  const targetAccommodations: Array<{ motherId: number; name: string; basePrice: number; minSellingPrice: number }> = [];

  if (mode === 'production' || mode === 'simulation') {
    // Simulazione Dry-Run oppure Produzione: TUTTE le Tariffe Madri reali (Livello 0) di tutti gli alloggi del villaggio
    Object.values(ALL_ACCOMMODATIONS_MAP).forEach((canonical) => {
      const configRoom = ACCOMMODATIONS.find(a => a.name.toLowerCase() === canonical.name.toLowerCase() || String(a.octorateId) === String(canonical.motherId));
      const realBasePrice = configRoom?.pricePerNight || 1800;

      targetAccommodations.push({
        motherId: canonical.motherId,
        name: canonical.name,
        basePrice: realBasePrice,
        minSellingPrice: 600
      });
    });
    // Includiamo anche i Fake Bungalows di Test
    targetAccommodations.push(
      { motherId: 649669, name: 'Fake Bungalow 1', basePrice: 1200, minSellingPrice: 600 },
      { motherId: 921799, name: 'Fake Bungalow 2', basePrice: 1200, minSellingPrice: 600 }
    );
  } else {
    // Modalità 'test_bungalows' (Invio API in Ambiente di Test): SOLO Fake Bungalow 1 (649669) e Fake Bungalow 2 (921799)
    targetAccommodations.push(
      { motherId: 649669, name: 'Fake Bungalow 1', basePrice: 1200, minSellingPrice: 600 },
      { motherId: 921799, name: 'Fake Bungalow 2', basePrice: 1200, minSellingPrice: 600 }
    );
  }

  return targetAccommodations;
}

/**
 * Calcola l'algoritmo di Sconto a Cascata su 3 Stadi Sequenziali per la data libera imminente.
 * - Direttiva Tassativa Octorate: Colpisce SEMPRE E SOLO l'ID della Tariffa Madre (Livello 0).
 * - Bivio a 3 Livelli (executionMode):
 *   - 'simulation': Calcolo Dry-run senza invio API.
 *   - 'test_bungalows': Invia sconti SOLO a Fake Bungalow 1 (649669) e Fake Bungalow 2 (921799).
 *   - 'production': Invia sconti a tutte le Tariffe Madri reali del resort.
 */
export function calculateCascadeDiscountUpdates(options?: CascadeDiscountOptions): CascadeDiscountUpdate[] {
  const updates: CascadeDiscountUpdate[] = [];

  const s1Days = Math.max(1, options?.stage1Days ?? 3);
  const s1Discount = Math.max(0, Math.min(80, options?.stage1Discount ?? 10));
  const s2Days = Math.max(1, options?.stage2Days ?? 3);
  const s2Discount = Math.max(0, Math.min(80, options?.stage2Discount ?? 5));
  const s3Days = Math.max(1, options?.stage3Days ?? 4);
  const s3Discount = Math.max(0, Math.min(80, options?.stage3Discount ?? 2));

  const mode: DiscountExecutionMode = options?.executionMode || (options?.isTestEnvironment === false ? 'production' : 'test_bungalows');
  const totalDays = s1Days + s2Days + s3Days;

  const targetAccommodations = getTargetAccommodationsForMode(mode);

  const todayStr = toThailandDateStr(new Date());
  const todayParts = parseThailandDateParts(todayStr);
  if (!todayParts) return updates;

  const todayTime = Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day);

  targetAccommodations.forEach((room) => {
    for (let offset = 0; offset < totalDays; offset++) {
      const targetTime = todayTime + offset * 24 * 60 * 60 * 1000;
      const targetDate = new Date(targetTime);
      const dateStr = toThailandDateStr(targetDate);

      let stage: 1 | 2 | 3 = 1;
      let discountPct = s1Discount;

      if (offset < s1Days) {
        stage = 1;
        discountPct = s1Discount;
      } else if (offset < s1Days + s2Days) {
        stage = 2;
        discountPct = s2Discount;
      } else {
        stage = 3;
        discountPct = s3Discount;
      }

      // Estraiamo il VERO prezzo base della madre direttamente dall'oggetto giornaliero Octorate della cella
      let dynamicCellBasePrice = room.basePrice;
      if (options?.rawGridItems && Array.isArray(options.rawGridItems)) {
        const gridMatch = options.rawGridItems.find((g: any) =>
          (String(g.id || g.motherRateId || g.ratePlanId || g.rate_id) === String(room.motherId) ||
           (g.accommodationName && g.accommodationName.toLowerCase() === room.name.toLowerCase()) ||
           (g.name && g.name.toLowerCase() === room.name.toLowerCase()))
        );

        if (gridMatch) {
          let cellDayPrice = 0;
          if (Array.isArray(gridMatch.days)) {
            const dayObj = gridMatch.days.find((d: any) => (d.date || d.dateStr) === dateStr);
            if (dayObj) {
              cellDayPrice = Number(dayObj.price || dayObj.value || dayObj.amount || 0);
            }
          }
          if (cellDayPrice <= 0) {
            cellDayPrice = Number(gridMatch.price || gridMatch.value || gridMatch.amount || gridMatch.basePrice || 0);
          }

          if (cellDayPrice > 0 && cellDayPrice < 10000) {
            dynamicCellBasePrice = cellDayPrice;
          }
        }
      }

      // Formula tassativa: Math.round(prezzoOriginale - (prezzoOriginale * percentualeSconto / 100))
      const discountAmount = (dynamicCellBasePrice * discountPct) / 100;
      const rawDiscounted = Math.round(dynamicCellBasePrice - discountAmount);
      const finalPrice = Math.max(rawDiscounted, room.minSellingPrice);

      updates.push({
        motherRateId: room.motherId, // DIRETTIVA OCTORATE: RIGOROSAMENTE LIVELLO 0
        accommodationName: room.name,
        dateStr,
        offsetDays: offset,
        stage,
        basePrice: dynamicCellBasePrice,
        discountPercentage: discountPct,
        discountedPrice: rawDiscounted,
        minimumSellingPrice: room.minSellingPrice,
        finalPrice,
        reason: `Stadio ${stage} (-${discountPct}%): offset ${offset}d da oggi ${todayStr} (Prezzo Reale Cella: ${dynamicCellBasePrice}฿ ➔ Scontato: ${finalPrice}฿)`
      });
    }
  });

  return updates;
}

/**
 * Calcola il Reset dei prezzi riportandoli al 100% della tariffa base originale standard (0% sconto).
 * - Direttiva Tassativa Octorate: Colpisce SEMPRE E SOLO l'ID della Tariffa Madre (Livello 0).
 */
export function calculateOriginalPriceResetUpdates(options?: CascadeDiscountOptions): CascadeDiscountUpdate[] {
  const updates: CascadeDiscountUpdate[] = [];

  const s1Days = Math.max(1, options?.stage1Days ?? 3);
  const s2Days = Math.max(1, options?.stage2Days ?? 3);
  const s3Days = Math.max(1, options?.stage3Days ?? 4);
  const totalDays = s1Days + s2Days + s3Days;

  const mode: DiscountExecutionMode = options?.executionMode || (options?.isTestEnvironment === false ? 'production' : 'test_bungalows');
  const targetAccommodations = getTargetAccommodationsForMode(mode);

  const todayStr = toThailandDateStr(new Date());
  const todayParts = parseThailandDateParts(todayStr);
  if (!todayParts) return updates;

  const todayTime = Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day);

  targetAccommodations.forEach((room) => {
    for (let offset = 0; offset < totalDays; offset++) {
      const targetTime = todayTime + offset * 24 * 60 * 60 * 1000;
      const targetDate = new Date(targetTime);
      const dateStr = toThailandDateStr(targetDate);

      updates.push({
        motherRateId: room.motherId, // DIRETTIVA OCTORATE: RIGOROSAMENTE LIVELLO 0
        accommodationName: room.name,
        dateStr,
        offsetDays: offset,
        stage: 1,
        basePrice: room.basePrice,
        discountPercentage: 0, // RESET A ZERO SCONTO (100% PREZZO BASE)
        discountedPrice: room.basePrice,
        minimumSellingPrice: room.minSellingPrice,
        finalPrice: room.basePrice,
        reason: `RESET RIPRISTINO: Prezzo base originale 100% (${room.basePrice}฿) per offset ${offset}d`
      });
    }
  });

  return updates;
}

// =============================================================================
// 🔒 PROTEZIONE TARIFFE STANDARD HIGH SEASON (7D & 14D OTA)
// =============================================================================

export interface StandardProtectionConfig {
  seasonStartDate: string;   // e.g. '2026-12-15'
  seasonEndDate: string;     // e.g. '2027-03-31'
  daysTriggerLimit: number;  // default 15 (Trigger Apertura: Lead time N sblocca la tariffa)
  daysOpenDuration: number;  // default 10 (Durata Apertura: Giorni consecutivi di apertura)
  daysCtaDuration: number;   // default 5 (Durata Check-out CTA: Giorni sotto data con solo check-out)
  executionMode: DiscountExecutionMode; // 'simulation' | 'test_bungalows' | 'production'
}

export interface StandardProtectionUpdate {
  rateId: string;
  motherId: number;
  accommodationName: string;
  dateStr: string;
  leadTimeDays: number;
  isInsideSeason: boolean;
  stopSell: boolean;
  closedToArrival: boolean;
  statusLabel: 'waiting' | 'open' | 'cta_safety' | 'outside_season';
  reason: string;
}

// Target Derived Rate Plan IDs for Fake Bungalows (Standard 7d/14d OTA plans)
export const FAKE_BUNGALOW_STANDARD_OTA_DERIVED_IDS: Record<string, string[]> = {
  '649669': ['932244', '932246', '932247', '932248', '932249', '932250', '932251', '932254', '932255'],
  '921799': ['932257', '932259', '932260', '932261', '932262', '932263', '932264', '932267', '932268']
};

/**
 * Calcola l'algoritmo V4 di Protezione Tariffe Standard (7d/14d OTA) a 3 stadi dinamici:
 * 1. Stadio d'Attesa (Chiuso): N > daysTriggerLimit (es. N > 15) -> Stop-Sell = true
 * 2. Finestra Last-Minute (Aperto): daysTriggerLimit >= N > (daysTriggerLimit - daysOpenDuration) (es. 15 >= N > 5) -> Stop-Sell = false, CTA = false
 * 3. Finestra Solo Check-out (CTA): N <= (daysTriggerLimit - daysOpenDuration) (es. 5 >= N >= 1) -> Stop-Sell = false, CTA = true
 */
export function calculateStandardProtectionUpdates(config: StandardProtectionConfig): StandardProtectionUpdate[] {
  const updates: StandardProtectionUpdate[] = [];

  const triggerLimit = Math.max(1, config.daysTriggerLimit ?? 15);
  const openDuration = Math.max(1, config.daysOpenDuration ?? 10);
  const ctaDuration = Math.max(1, config.daysCtaDuration ?? 5);
  const ctaThreshold = triggerLimit - openDuration; // Es: 15 - 10 = 5

  const startDateStr = config.seasonStartDate || '2026-12-15';
  const endDateStr = config.seasonEndDate || '2027-03-31';
  const mode = config.executionMode || 'test_bungalows';

  const todayStr = toThailandDateStr(new Date());
  const todayParts = parseThailandDateParts(todayStr);
  if (!todayParts) return updates;

  const todayTime = Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day);
  const totalHorizonDays = 365;

  const targetAccommodations = getTargetAccommodationsForMode(mode);

  targetAccommodations.forEach((room) => {
    let targetDerivedIds: string[] = [];

    if (mode === 'test_bungalows') {
      targetDerivedIds = FAKE_BUNGALOW_STANDARD_OTA_DERIVED_IDS[String(room.motherId)] || [];
    } else {
      if (FAKE_BUNGALOW_STANDARD_OTA_DERIVED_IDS[String(room.motherId)]) {
        targetDerivedIds = FAKE_BUNGALOW_STANDARD_OTA_DERIVED_IDS[String(room.motherId)];
      } else {
        const canonical = Object.values(ALL_ACCOMMODATIONS_MAP).find(a => a.motherId === room.motherId);
        if (canonical && canonical.ids) {
          targetDerivedIds = canonical.ids.filter(id => String(id) !== String(room.motherId));
        }
      }
    }

    if (targetDerivedIds.length === 0) return;

    for (let offset = 0; offset < totalHorizonDays; offset++) {
      const targetTime = todayTime + offset * 24 * 60 * 60 * 1000;
      const targetDate = new Date(targetTime);
      const dateStr = toThailandDateStr(targetDate);

      const isInsideSeason = dateStr >= startDateStr && dateStr <= endDateStr;
      const leadTimeN = offset; // Giorni di preavviso dall'arrivo

      let stopSell = false;
      let closedToArrival = false;
      let statusLabel: 'waiting' | 'open' | 'cta_safety' | 'outside_season' = 'outside_season';
      let reason = '';

      if (!isInsideSeason) {
        stopSell = false;
        closedToArrival = false;
        statusLabel = 'outside_season';
        reason = `Fuori stagione (${dateStr}): Tariffe standard 7d/14d aperte senza vincoli su OTA.`;
      } else {
        if (leadTimeN > triggerLimit) {
          stopSell = true;
          closedToArrival = false;
          statusLabel = 'waiting';
          reason = `Stadio d'Attesa (N=${leadTimeN}d > ${triggerLimit}d): Stop-Sell attivo su 7d/14d OTA per proteggere sito e Airbnb.`;
        } else if (leadTimeN > ctaThreshold) {
          stopSell = false;
          closedToArrival = false;
          statusLabel = 'open';
          reason = `Finestra Last-Minute (N=${leadTimeN}d): Tariffe standard 7d/14d aperte su tutte le OTA.`;
        } else {
          stopSell = false;
          closedToArrival = true;
          statusLabel = 'cta_safety';
          reason = `Finestra Solo Check-out (N=${leadTimeN}d <= ${ctaThreshold}d): Closed to Arrival (Solo Check-out) su 7d/14d OTA.`;
        }
      }

      targetDerivedIds.forEach(derivedId => {
        updates.push({
          rateId: derivedId,
          motherId: room.motherId,
          accommodationName: room.name,
          dateStr,
          leadTimeDays: leadTimeN,
          isInsideSeason,
          stopSell,
          closedToArrival,
          statusLabel,
          reason
        });
      });
    }
  });

  return updates;
}


