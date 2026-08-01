/**
 * Modulo Octorate per la Dashboard Amministrativa (/admin)
 * Riservato ed isolato dal Booking Engine del sito pubblico per garantire zero regressioni.
 */

// Mappatura immutabile 1:1 ID TARIFFA MADRE e Codici Derivati per Octorate (212 Prodotti)
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

export const ALL_ACCOMMODATIONS_MAP: Record<string, { motherId: number; name: string; ids: string[]; keywords: string[][] }> = {
  'jungle villa': {
    motherId: 529773,
    name: 'Jungle Villa',
    ids: ['529773', '529784', '529778', '529779', '529792', '529788', '529780', '916817', '529781', '529801', '921868', '921869', '529783', '529813'],
    keywords: [["jungle", "jv"], ["villa", "ac", "be"]]
  },
  'jungle villa left': {
    motherId: 495795,
    name: 'Jungle Villa Left',
    ids: ['495795', '495807', '495803', '495804', '496009', '496001', '495805', '496022', '495806', '496031', '921870', '921871', '495810', '496057'],
    keywords: [["jungle", "jv"], ["left", "jvl"]]
  },
  'jungle villa right': {
    motherId: 495796,
    name: 'Jungle Villa Right',
    ids: ['495796', '495980', '495976', '495977', '496010', '496002', '495978', '496021', '495979', '496030', '921872', '921873', '495982', '496056'],
    keywords: [["jungle", "jv"], ["right", "jvr"]]
  },
  'peace & love villa': {
    motherId: 494840,
    name: 'Peace & Love Villa',
    ids: ['494840', '495566', '495549', '495551', '495580', '495575', '495552', '495587', '495565', '495593', '921874', '921875', '495569', '495609'],
    keywords: [["peace", "love", "p&l"]]
  },
  'villa penthouse': {
    motherId: 421511,
    name: 'Villa Penthouse',
    ids: ['421511', '449348', '422445', '421513', '421516', '421520', '421522', '421525', '421527', '421530', '921876', '921877', '421532', '421533'],
    keywords: [["penthouse", "pent"]]
  },
  'yellow bungalow': {
    motherId: 293957,
    name: 'Yellow Bungalow',
    ids: ['293957', '449385', '422422', '293958', '332055', '332054', '331921', '332057', '331922', '332060', '921878', '921879', '297022', '340198'],
    keywords: [["yellow"]]
  },
  'red bungalow': {
    motherId: 293954,
    name: 'Red Bungalow',
    ids: ['293954', '449422', '422131', '293953', '332030', '332029', '330964', '332035', '330970', '332036', '921880', '921881', '297021', '340196'],
    keywords: [["red"]]
  },
  'green bungalow': {
    motherId: 293962,
    name: 'Green Bungalow',
    ids: ['293962', '449668', '422402', '293961', '332070', '332066', '331923', '332072', '331924', '332074', '921882', '921883', '297023', '422402', '340200'],
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
  'room 1': {
    motherId: 293963,
    name: 'Room 1',
    ids: ['293963', '449678', '422300', '293964', '332737', '332735', '331976', '916818', '331977', '916402', '921889', '921890', '297033', '421505'],
    keywords: [["room", "hub", "r1"], ["1", "one"]]
  },
  'room 2': {
    motherId: 293959,
    name: 'Room 2',
    ids: ['293959', '449684', '422296', '293960', '332741', '332739', '331966', '332119', '331967', '332134', '921891', '921900', '297032', '421506'],
    keywords: [["room", "hub", "r2"], ["2", "two"]]
  },
  'room 3': {
    motherId: 293948,
    name: 'Room 3',
    ids: ['293948', '449699', '422293', '293947', '332743', '332757', '331968', '332121', '331969', '332136', '921892', '921893', '297028', '421507'],
    keywords: [["room", "hub", "r3"], ["3", "three"]]
  },
  'room 4': {
    motherId: 293945,
    name: 'Room 4',
    ids: ['293945', '449724', '422265', '293946', '332759', '332746', '331970', '332123', '331971', '332138', '921894', '921895', '297029', '421508'],
    keywords: [["room", "hub", "r4"], ["4", "four"]]
  },
  'room 5': {
    motherId: 293943,
    name: 'Room 5',
    ids: ['293943', '449730', '422213', '293944', '332765', '332763', '331972', '332125', '331973', '332140', '921896', '921897', '297031', '421509'],
    keywords: [["room", "hub", "r5"], ["5", "five"]]
  },
  'lodge 1': {
    motherId: 293951,
    name: 'Lodge 1',
    ids: ['293951', '449736', '422149', '293952', '332769', '332767', '331974', '332129', '422157', '332142', '921884', '921885', '297030', '421510'],
    keywords: [["lodge"], ["1", "one"]]
  },
  'lodge 2': {
    motherId: 883795,
    name: 'Lodge 2',
    ids: ['883795', '923905', '916110', '916108', '916107', '916109', '916114', '916829', '916105', '916830', '921886', '921887', '916103', '916104'],
    keywords: [["lodge"], ["2", "two"]]
  },
  'internal room': {
    motherId: 293942,
    name: 'Internal Room',
    ids: ['293942', '449742', '872182', '293941', '332109', '332105', '340367', '916840', '421998', '916838', '921898', '921899', '297027', '422147'],
    keywords: [["internal", "inter"]]
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
 * Determina il Soggiorno Minimo di Baseline stagionale per una data specifica:
 * - Fino al 20 Dicembre (compreso): 2 notti
 * - Dal 21 Dicembre al 15 Gennaio (compreso - Altissima Stagione): 5 notti
 * - Dal 16 Gennaio in poi (resto dell'anno): 2 notti
 */
export function getBaselineMinStay(dateStr: string): number {
  if (!dateStr || typeof dateStr !== 'string') return 2;
  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length < 3) return 2;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  // 1. 21 Dicembre - 15 Gennaio (Altissima Stagione): 5 notti
  if ((month === 12 && day >= 21) || (month === 1 && day <= 15)) {
    return 5;
  }

  // 2. 16 Gennaio - 31 Marzo: 3 notti standard (scende a 2 notti se arrivalDate - today <= 30 giorni)
  if ((month === 1 && day >= 16) || month === 2 || month === 3) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const arrival = new Date(year, month - 1, day, 0, 0, 0, 0);
    const diffMs = arrival.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 30) {
      return 2;
    }
    return 3;
  }

  // 3. 1 Novembre - 20 Dicembre: 2 notti
  // 4. 1 Aprile - 31 Ottobre (Low Season): 2 notti
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
 * Calcola l'algoritmo di Soggiorno Minimo Dinamico (Puro Gap-Filling subordinato alla Baseline)
 * - Calcola il buco disponibile (G = checkIn_succ - checkOut_prec)
 * - SE G >= defaultMinStay: NON FARE NULLA (Mantiene Cerchio Giallo Standard)
 * - SE G < defaultMinStay: Interviene abbassando il limite esattamente a G notti (Cerchio Rosso/Verde)
 */
export function calculateDynamicMinStay(
  bookings: Array<{ accommodation_name?: string; accommodation_id?: string; check_in: string; check_out: string; status?: string; product?: string; roomName?: string }>,
  dateRange: { start: string; end: string }
): DynamicMinStayUpdate[] {
  const updates: DynamicMinStayUpdate[] = [];
  const activeBookings = (bookings || []).filter(b => b.status !== 'cancelled' && b.status !== 'canceled');

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

    const checkInStr = String(b.check_in || (b as any).checkin || '').slice(0, 10);
    const checkOutStr = String(b.check_out || (b as any).checkout || '').slice(0, 10);

    if (checkInStr && checkOutStr) {
      roomBookingsMap[key].list.push({ in: checkInStr, out: checkOutStr });
    }
  });

  // Calcolo Puro Gap-Fill per ogni alloggio
  Object.values(roomBookingsMap).forEach(({ motherId, name: roomName, list }) => {
    const sorted = list.sort((a, b) => a.in.localeCompare(b.in));
    
    for (let i = 0; i < sorted.length - 1; i++) {
      const prevOut = sorted[i].out;
      const nextIn = sorted[i + 1].in;

      if (prevOut >= dateRange.start && nextIn <= dateRange.end) {
        const prevOutTime = new Date(prevOut).getTime();
        const nextInTime = new Date(nextIn).getTime();
        const gapDays = Math.round((nextInTime - prevOutTime) / (1000 * 60 * 60 * 24));

        if (gapDays > 0) {
          const defaultMinStay = getBaselineMinStay(prevOut);
          
          // REGOLA RIGOROSA PURO GAP-FILLER:
          // SE G >= defaultMinStay: NON FARE NULLA.
          // SE G < defaultMinStay: Intervieni abbassando il limite esattamente a G notti.
          if (gapDays < defaultMinStay) {
            const octRoomId = String(motherId || getMotherRatePlanId(roomName) || roomName);

            updates.push({
              roomTypeId: octRoomId,
              accommodationName: roomName,
              dateFrom: prevOut,
              dateTo: nextIn,
              minStay: gapDays,
              reason: `Puro Gap-Fill (${gapDays}d gap < default ${defaultMinStay}d): M=${gapDays}`
            });
          }
        }
      }
    }
  });

  return updates;
}
