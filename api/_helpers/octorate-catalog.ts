/**
 * 📚 Layer Base Octorate: Catalogo Canonico Alloggi, Tariffe Sacro Graal & Twin Pairs
 *
 * Modulo 100% puro e deterministico (zero import locali, zero chiamate HTTP, zero Supabase).
 * Fonte unica di verità per i 18 alloggi ufficiali, i 2 Fake Bungalows di test,
 * le 52 coppie gemelle Jungle/FPV e le mappe di prodotto per piano tariffario.
 */

export type JungleSourceStructureId = '807324' | '366879';

export interface JungleTwinRoom {
  key: 'jv' | 'jvl' | 'jvr' | 'pl';
  name: string;
  jungleName: string;
  jungleStructureId: '807324';
  jungleMotherId: number;
  fpvName: string;
  fpvStructureId: '366879';
  fpvMotherId: number;
}

export const JUNGLE_TWIN_ROOMS: JungleTwinRoom[] = [
  {
    key: 'jv',
    name: 'Jungle Villa',
    jungleName: 'Jungle Villa 2',
    jungleStructureId: '807324',
    jungleMotherId: 529773,
    fpvName: 'Jungle Villa',
    fpvStructureId: '366879',
    fpvMotherId: 960389
  },
  {
    key: 'jvl',
    name: 'Jungle Villa Left',
    jungleName: 'Jungle Villa Left 2',
    jungleStructureId: '807324',
    jungleMotherId: 495795,
    fpvName: 'Jungle Villa Left',
    fpvStructureId: '366879',
    fpvMotherId: 960385
  },
  {
    key: 'jvr',
    name: 'Jungle Villa Right',
    jungleName: 'Jungle Villa Right 2',
    jungleStructureId: '807324',
    jungleMotherId: 495796,
    fpvName: 'Jungle Villa Right',
    fpvStructureId: '366879',
    fpvMotherId: 960387
  },
  {
    key: 'pl',
    name: 'Peace & Love Villa',
    jungleName: 'Peace & Love Villa 2',
    jungleStructureId: '807324',
    jungleMotherId: 494840,
    fpvName: 'Peace & Love Villa',
    fpvStructureId: '366879',
    fpvMotherId: 960383
  }
];

export interface JungleRatePair {
  key: JungleTwinRoom['key'];
  label: string;
  jungleId: number;
  fpvId: number;
  isMother: boolean;
  isClosedAc: boolean;
  isBe?: boolean;
  isStandard7d?: boolean;
}

/**
 * Mappa esatta verificata Live su Octorate: tutte le 52 coppie (4 Madri + 48 Derivate Sacro Graal).
 */
export const JUNGLE_RATE_PAIRS: JungleRatePair[] = [
  // ── 1. Peace & Love Villa (pl) ──────────────────────────────────────────────
  { key: 'pl', label: 'P&L Mother', jungleId: 494840, fpvId: 960383, isMother: true, isClosedAc: false },
  { key: 'pl', label: 'P&L BE', jungleId: 495566, fpvId: 960391, isMother: false, isClosedAc: false, isBe: true },
  { key: 'pl', label: 'P&L 7d', jungleId: 495549, fpvId: 960392, isMother: false, isClosedAc: false, isStandard7d: true },
  { key: 'pl', label: 'P&L Main bnb-7d', jungleId: 495575, fpvId: 960393, isMother: false, isClosedAc: false },
  { key: 'pl', label: 'P&L Main bnb-14d', jungleId: 495580, fpvId: 960394, isMother: false, isClosedAc: false },
  { key: 'pl', label: 'P&L AGD AC-7d', jungleId: 921874, fpvId: 960395, isMother: false, isClosedAc: true },
  { key: 'pl', label: 'P&L AGD AC-14d', jungleId: 921875, fpvId: 960396, isMother: false, isClosedAc: true },
  { key: 'pl', label: 'P&L AirBnB', jungleId: 495569, fpvId: 960397, isMother: false, isClosedAc: false },
  { key: 'pl', label: 'P&L AirBnB AC', jungleId: 495609, fpvId: 960398, isMother: false, isClosedAc: true },
  { key: 'pl', label: 'P&L AC7d', jungleId: 495552, fpvId: 960399, isMother: false, isClosedAc: true },
  { key: 'pl', label: 'P&L AC14d', jungleId: 495565, fpvId: 960400, isMother: false, isClosedAc: true },
  { key: 'pl', label: 'P&L AC bnb-7d', jungleId: 495587, fpvId: 960401, isMother: false, isClosedAc: true },
  { key: 'pl', label: 'P&L AC bnb-14d', jungleId: 495593, fpvId: 960402, isMother: false, isClosedAc: true },

  // ── 2. Jungle Villa (jv) ────────────────────────────────────────────────────
  { key: 'jv', label: 'JV Mother', jungleId: 529773, fpvId: 960389, isMother: true, isClosedAc: false },
  { key: 'jv', label: 'JV BE', jungleId: 529784, fpvId: 960403, isMother: false, isClosedAc: false, isBe: true },
  { key: 'jv', label: 'JV 7d', jungleId: 529778, fpvId: 960404, isMother: false, isClosedAc: false, isStandard7d: true },
  { key: 'jv', label: 'JV Main bnb-7d', jungleId: 529788, fpvId: 960405, isMother: false, isClosedAc: false },
  { key: 'jv', label: 'JV Main bnb-14d', jungleId: 529792, fpvId: 960406, isMother: false, isClosedAc: false },
  { key: 'jv', label: 'JV AGD AC-7d', jungleId: 921868, fpvId: 960407, isMother: false, isClosedAc: true },
  { key: 'jv', label: 'JV AGD AC-14d', jungleId: 921869, fpvId: 960408, isMother: false, isClosedAc: true },
  { key: 'jv', label: 'JV AirBnB', jungleId: 529783, fpvId: 960409, isMother: false, isClosedAc: false },
  { key: 'jv', label: 'JV AirBnB AC', jungleId: 529813, fpvId: 960410, isMother: false, isClosedAc: true },
  { key: 'jv', label: 'JV AC7d', jungleId: 529780, fpvId: 960411, isMother: false, isClosedAc: true },
  { key: 'jv', label: 'JV AC14d', jungleId: 529781, fpvId: 960412, isMother: false, isClosedAc: true },
  { key: 'jv', label: 'JV AC bnb-7d', jungleId: 916816, fpvId: 960413, isMother: false, isClosedAc: true },
  { key: 'jv', label: 'JV AC bnb-14d', jungleId: 529801, fpvId: 960414, isMother: false, isClosedAc: true },

  // ── 3. Jungle Villa Left (jvl) ──────────────────────────────────────────────
  { key: 'jvl', label: 'JVL Mother', jungleId: 495795, fpvId: 960385, isMother: true, isClosedAc: false },
  { key: 'jvl', label: 'JVL BE', jungleId: 495807, fpvId: 960415, isMother: false, isClosedAc: false, isBe: true },
  { key: 'jvl', label: 'JVL 7d', jungleId: 495803, fpvId: 960416, isMother: false, isClosedAc: false, isStandard7d: true },
  { key: 'jvl', label: 'JVL Main bnb-7d', jungleId: 496001, fpvId: 960417, isMother: false, isClosedAc: false },
  { key: 'jvl', label: 'JVL Main bnb-14d', jungleId: 496009, fpvId: 960418, isMother: false, isClosedAc: false },
  { key: 'jvl', label: 'JVL AGD AC-7d', jungleId: 921870, fpvId: 960419, isMother: false, isClosedAc: true },
  { key: 'jvl', label: 'JVL AGD AC-14d', jungleId: 921871, fpvId: 960420, isMother: false, isClosedAc: true },
  { key: 'jvl', label: 'JVL AirBnB', jungleId: 495810, fpvId: 960421, isMother: false, isClosedAc: false },
  { key: 'jvl', label: 'JVL AirBnB AC', jungleId: 496057, fpvId: 960422, isMother: false, isClosedAc: true },
  { key: 'jvl', label: 'JVL AC7d', jungleId: 495805, fpvId: 960423, isMother: false, isClosedAc: true },
  { key: 'jvl', label: 'JVL AC14d', jungleId: 495806, fpvId: 960424, isMother: false, isClosedAc: true },
  { key: 'jvl', label: 'JVL AC bnb-7d', jungleId: 496022, fpvId: 960425, isMother: false, isClosedAc: true },
  { key: 'jvl', label: 'JVL AC bnb-14d', jungleId: 496031, fpvId: 960426, isMother: false, isClosedAc: true },

  // ── 4. Jungle Villa Right (jvr) ─────────────────────────────────────────────
  { key: 'jvr', label: 'JVR Mother', jungleId: 495796, fpvId: 960387, isMother: true, isClosedAc: false },
  { key: 'jvr', label: 'JVR BE', jungleId: 495980, fpvId: 960427, isMother: false, isClosedAc: false, isBe: true },
  { key: 'jvr', label: 'JVR 7d', jungleId: 495976, fpvId: 960428, isMother: false, isClosedAc: false, isStandard7d: true },
  { key: 'jvr', label: 'JVR Main bnb-7d', jungleId: 496002, fpvId: 960429, isMother: false, isClosedAc: false },
  { key: 'jvr', label: 'JVR Main bnb-14d', jungleId: 496010, fpvId: 960430, isMother: false, isClosedAc: false },
  { key: 'jvr', label: 'JVR AGD AC-7d', jungleId: 921872, fpvId: 960431, isMother: false, isClosedAc: true },
  { key: 'jvr', label: 'JVR AGD AC-14d', jungleId: 921873, fpvId: 960432, isMother: false, isClosedAc: true },
  { key: 'jvr', label: 'JVR AirBnB', jungleId: 495982, fpvId: 960433, isMother: false, isClosedAc: false },
  { key: 'jvr', label: 'JVR AirBnB AC', jungleId: 496056, fpvId: 960434, isMother: false, isClosedAc: true },
  { key: 'jvr', label: 'JVR AC7d', jungleId: 495978, fpvId: 960435, isMother: false, isClosedAc: true },
  { key: 'jvr', label: 'JVR AC14d', jungleId: 495979, fpvId: 960436, isMother: false, isClosedAc: true },
  { key: 'jvr', label: 'JVR AC bnb-7d', jungleId: 496021, fpvId: 960437, isMother: false, isClosedAc: true },
  { key: 'jvr', label: 'JVR AC bnb-14d', jungleId: 496030, fpvId: 960438, isMother: false, isClosedAc: true }
];

const RATE_PAIR_BY_ID = new Map<number, JungleRatePair>();
for (const p of JUNGLE_RATE_PAIRS) {
  RATE_PAIR_BY_ID.set(p.jungleId, p);
  RATE_PAIR_BY_ID.set(p.fpvId, p);
}

export function getJungleTwinPairByRateId(id: number | string | null | undefined): JungleRatePair | null {
  const num = Number(id);
  if (!num) return null;
  return RATE_PAIR_BY_ID.get(num) || null;
}

export function getCompanionRateId(id: number | string | null | undefined): number | null {
  const num = Number(id);
  if (!num) return null;
  const pair = RATE_PAIR_BY_ID.get(num);
  if (!pair) return null;
  return pair.jungleId === num ? pair.fpvId : pair.jungleId;
}

export function getJungleTwinRateIds(structureId: JungleSourceStructureId): number[] {
  return JUNGLE_RATE_PAIRS.map(p => (structureId === '366879' ? p.fpvId : p.jungleId));
}

export function getJungleTwinDerivedIds(structureId: JungleSourceStructureId): number[] {
  return JUNGLE_RATE_PAIRS.filter(p => !p.isMother).map(p => (structureId === '366879' ? p.fpvId : p.jungleId));
}

export const MIRROR_TAG = '[MIRROR_SYNC]';

export function isMirrorReservation(booking: any): boolean {
  if (!booking) return false;
  const hay = [
    booking.privateNotes,
    booking.notes,
    booking.refer,
    booking.channelName,
    booking.guestName
  ]
    .filter(Boolean)
    .join(' ');
  return hay.includes(MIRROR_TAG) || String(booking.refer || '').startsWith('MIRROR-');
}

export function resolveTwinByProductOrName(
  productId?: number | string | null,
  roomName?: string | null
): JungleTwinRoom | null {
  const pair = getJungleTwinPairByRateId(productId);
  if (pair) {
    return JUNGLE_TWIN_ROOMS.find(r => r.key === pair.key) || null;
  }
  const s = String(roomName || '').toLowerCase();
  if (!s) return null;
  if (s.includes('peace') || s.includes('love') || s.includes('p&l')) {
    return JUNGLE_TWIN_ROOMS.find(r => r.key === 'pl') || null;
  }
  if (s.includes('left') || s.includes('jvl')) {
    return JUNGLE_TWIN_ROOMS.find(r => r.key === 'jvl') || null;
  }
  if (s.includes('right') || s.includes('jvr')) {
    return JUNGLE_TWIN_ROOMS.find(r => r.key === 'jvr') || null;
  }
  if (s.includes('jungle') || s.includes('jv')) {
    return JUNGLE_TWIN_ROOMS.find(r => r.key === 'jv') || null;
  }
  return null;
}

// Mappatura Canonica 1:1 ID Madre, Prodotti Derivati e Keyword OTA per Octorate (212 Prodotti)
export const ALL_ACCOMMODATIONS_MAP: Record<string, { motherId: number; name: string; ids: string[]; keywords: string[][]; linkedKeys?: string[] }> = {
  'jungle villa': {
    motherId: 529773,
    name: 'Jungle Villa',
    ids: ['529773', '529784', '529778', '529792', '529788', '529780', '916816', '529781', '529801', '921868', '921869', '529783', '529813', '960389', '960403', '960404', '960405', '960406', '960407', '960408', '960409', '960410', '960411', '960412', '960413', '960414'],
    keywords: [["jungle", "jv"], ["villa", "ac", "be"]],
    linkedKeys: ['jungle villa left', 'jungle villa right']
  },
  'jungle villa left': {
    motherId: 495795,
    name: 'Jungle Villa Left',
    // Rimuoviamo eventuali ID non esistenti su Octorate (es. 495804)
    ids: ['495795', '495807', '495803', '496009', '496001', '495805', '496022', '495806', '496031', '921870', '921871', '495810', '496057', '960385', '960415', '960416', '960417', '960418', '960419', '960420', '960421', '960422', '960423', '960424', '960425', '960426'],
    keywords: [["jungle", "jv"], ["left", "jvl"]],
    linkedKeys: ['jungle villa']
  },
  'jungle villa right': {
    motherId: 495796,
    name: 'Jungle Villa Right',
    ids: ['495796', '495980', '495976', '496010', '496002', '495978', '496021', '495979', '496030', '921872', '921873', '495982', '496056', '960387', '960427', '960428', '960429', '960430', '960431', '960432', '960433', '960434', '960435', '960436', '960437', '960438'],
    keywords: [["jungle", "jv"], ["right", "jvr"]],
    linkedKeys: ['jungle villa']
  },
  'peace & love villa': {
    motherId: 494840,
    name: 'Peace & Love Villa',
    ids: ['494840', '495566', '495549', '495580', '495575', '495552', '495587', '495565', '495593', '921874', '921875', '495569', '495609', '960383', '960391', '960392', '960393', '960394', '960395', '960396', '960397', '960398', '960399', '960400', '960401', '960402'],
    keywords: [["peace", "love", "p&l"]]
  },
  'villa penthouse': {
    motherId: 421511,
    name: 'Villa Penthouse',
    ids: ['421511', '449348', '422445', '421516', '421520', '421522', '421525', '421527', '421530', '921876', '921877', '421532', '421533'],
    keywords: [["penthouse", "pent"]]
  },
  'yellow bungalow': {
    motherId: 293957,
    name: 'Yellow Bungalow',
    ids: ['293957', '449385', '422422', '332055', '332054', '331921', '332057', '331922', '332060', '921878', '921879', '297022', '340198'],
    keywords: [["yellow"]]
  },
  'red bungalow': {
    motherId: 293954,
    name: 'Red Bungalow',
    ids: ['293954', '449422', '422131', '332030', '332029', '330964', '332035', '330970', '332036', '921880', '921881', '297021', '340196'],
    keywords: [["red"]]
  },
  'green bungalow': {
    motherId: 293962,
    name: 'Green Bungalow',
    ids: ['293962', '449668', '422402', '332070', '332066', '331923', '332072', '331924', '332074', '921882', '921883', '297023', '340200'],
    keywords: [["green"]]
  },
  'camel tent bungalow': {
    motherId: 293965,
    name: 'Camel Tent',
    ids: ['293965', '449675', '422325', '332089', '332084', '297025'],
    keywords: [["camel"]]
  },
  'lagoon tent bungalow': {
    motherId: 293955,
    name: 'Lagoon Tent',
    ids: ['293955', '449674', '422351', '332081', '332077', '297024'],
    keywords: [["lagoon"]]
  },
  'internal room': {
    motherId: 293942,
    name: 'Internal Room',
    ids: ['293942', '449742', '872182', '332109', '332105', '340367', '916840', '421998', '916838', '921898', '921899', '297027', '422147'],
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
    ids: ['883795', '923905', '916110', '916107', '916109', '916114', '916829', '916105', '916830', '921886', '921887', '916103', '916104'],
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
 * Risolve l'alloggio canonico del resort da un oggetto prenotazione grezzo Octorate
 * analizzando Product ID, Room Type ID e keyword testuali.
 */
export function resolveAccommodationName(booking: any): string {
  if (!booking) return 'Alloggio Flower Power';

  // 1. Match diretto per Product ID o Room Type ID nella mappatura canonica
  const productId = String(
    booking.product ||
    booking.pmsProduct ||
    booking.accommodation_id ||
    booking.roomId ||
    booking.roomTypeId ||
    booking.rooms?.[0]?.product ||
    booking.rooms?.[0]?.pmsProduct ||
    booking.rooms?.[0]?.roomTypeId ||
    ''
  ).trim();

  if (productId) {
    for (const [_key, entry] of Object.entries(ALL_ACCOMMODATIONS_MAP)) {
      if (String(entry.motherId) === productId || entry.ids.includes(productId)) {
        return entry.name;
      }
    }
  }

  // 2. Match testuale / fuzzy sui nomi e descrizioni delle camere
  const rawName = String(
    booking.roomName ||
    booking.accommodation_name ||
    booking.accommodation ||
    booking.rooms?.[0]?.roomName ||
    booking.rooms?.[0]?.name ||
    booking.rooms?.[0]?.description ||
    ''
  ).toLowerCase().trim();

  if (rawName) {
    if (rawName.includes('jvr') || rawName.includes('right')) return 'Jungle Villa Right';
    if (rawName.includes('jvl') || rawName.includes('left')) return 'Jungle Villa Left';
    for (const [_key, entry] of Object.entries(ALL_ACCOMMODATIONS_MAP)) {
      if (entry.keywords.every(group => group.some(kw => rawName.includes(kw)))) {
        return entry.name;
      }
    }
    const clean = rawName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    if (clean) return clean;
  }

  return 'Alloggio Flower Power';
}

/**
 * Risolve il nome reale dell'ospite esplorando tutti i campi anagrafici Octorate e OTA.
 */
export function resolveGuestName(booking: any): string {
  if (!booking) return 'Ospite';
  if (typeof booking.guestName === 'string' && booking.guestName.trim()) {
    return booking.guestName.trim();
  }
  if (typeof booking.guest_name === 'string' && booking.guest_name.trim()) {
    return booking.guest_name.trim();
  }

  const b = booking.booker || booking.customer || booking.contact;
  if (b) {
    const bName = `${b.firstName || b.givenName || ''} ${b.lastName || b.familyName || ''}`.trim() || b.name;
    if (bName && typeof bName === 'string' && bName.trim()) return bName.trim();
  }

  const direct = `${booking.firstName || booking.first_name || ''} ${booking.lastName || booking.last_name || ''}`.trim();
  if (direct) return direct;

  if (Array.isArray(booking.guests) && booking.guests.length > 0) {
    const booker = booking.guests.find((g: any) => g.type === 'BOOKER') || booking.guests[0];
    const gName = `${booker.givenName || booker.firstName || ''} ${booker.familyName || booker.lastName || ''}`.trim() || booker.name;
    if (gName) return gName;
  }

  return 'Ospite';
}

/**
 * Helper per verificare se un product ID Octorate appartiene ai Fake Bungalows (1 & 2)
 */
export const isTestProduct = (id: number) =>
  (id >= 932243 && id <= 932268) ||
  id === 649669 ||
  id === 921799;

// Rate ID Reali per tutti i 18 alloggi (194 prodotti Octorate totali)
export const REAL_PRODUCTS_BY_PLAN: Record<string, number[]> = {
  be: [495980, 529784, 449684, 449678, 449422, 449699, 449724, 449348, 449730, 495807, 449736, 495566, 449742, 449385, 449668, 449675, 449674],
  '7d': [916110, 495976, 872182, 529778, 422300, 422296, 422293, 422422, 422445, 495803, 422325, 495549, 422213, 422351, 422131, 422265, 422402, 422149],
  main_bnb_7d: [916109, 529788, 496002, 496001, 495575, 421520, 332066, 332084, 332077, 332739, 332735, 332746, 332105, 332763, 332757, 332767, 332054, 332029],
  main_bnb_14d: [916107, 496010, 529792, 496009, 495580, 332055, 332070, 332081, 332089, 332737, 332741, 332743, 332109, 332759, 332769, 332765, 421516, 332030],
  ac_7d: [916114, 495978, 529780, 495552, 495805, 421522, 340367, 331921, 330964, 331923, 331970, 331972, 331966, 331968, 331974, 331976],
  ac_14d: [495979, 529781, 916105, 422157, 421527, 495806, 495565, 421998, 331922, 331924, 330970, 331969, 331971, 331967, 331977, 331973],
  ac_bnb_7d: [496022, 496021, 916818, 916816, 916840, 916829, 495587, 332057, 421525, 332072, 332121, 332123, 332119, 332129, 332125, 332035],
  ac_bnb_14d: [496031, 496030, 916402, 916838, 916830, 529801, 421530, 495593, 332060, 332074, 332138, 332140, 332134, 332136, 332142, 332036],
  agd_ac_7d: [921868, 921870, 921872, 921874, 921876, 921878, 921880, 921882, 921884, 921886, 921889, 921891, 921892, 921894, 921896, 921898],
  agoda_ac_7d: [921868, 921870, 921872, 921874, 921876, 921878, 921880, 921882, 921884, 921886, 921889, 921891, 921892, 921894, 921896, 921898],
  agd_ac_14d: [921869, 921871, 921873, 921875, 921877, 921879, 921881, 921883, 921885, 921887, 921890, 921900, 921893, 921895, 921897, 921899],
  agoda_ac_14d: [921869, 921871, 921873, 921875, 921877, 921879, 921881, 921883, 921885, 921887, 921890, 921900, 921893, 921895, 921897, 921899],
  airbnb: [529783, 495982, 916103, 421532, 495810, 495569, 297025, 297027, 297028, 297021, 297022, 297023, 297024, 297033, 297029, 297030, 297031, 297032],
  airbnb_ac: [529813, 496057, 496056, 916104, 421533, 495609, 422147, 340196, 340198, 340200, 421507, 421508, 421505, 421506, 421509, 421510]
};

export const REAL_PRODUCT_IDS: Record<string, number> = {
  be: 529784,
  '7d': 529778,
  main_bnb_7d: 529788,
  main_bnb_14d: 529792,
  ac_7d: 529780,
  ac_14d: 529781,
  ac_bnb_7d: 916816,
  ac_bnb_14d: 529801,
  agoda_ac_7d: 921868,
  agoda_ac_14d: 921869,
  agd_ac_7d: 921868,
  agd_ac_14d: 921869,
  airbnb: 529783,
  airbnb_ac: 529813
};

export const TEST_PRODUCTS_BY_PLAN: Record<string, number[]> = {
  be: [932243, 932256],
  '7d': [932244, 932257],
  main_bnb_7d: [932246, 932259],
  main_bnb_14d: [932247, 932260],
  ac_7d: [932248, 932261],
  ac_14d: [932249, 932262],
  agoda_ac_7d: [932250, 932263],
  agoda_ac_14d: [932251, 932264],
  agd_ac_7d: [932250, 932263],
  agd_ac_14d: [932251, 932264],
  airbnb: [932252, 932265],
  airbnb_ac: [932253, 932266],
  ac_bnb_7d: [932254, 932267],
  ac_bnb_14d: [932255, 932268]
};

export const TEST_PRODUCT_IDS: Record<string, number> = {
  be: 932243,
  '7d': 932244,
  main_bnb_7d: 932246,
  main_bnb_14d: 932247,
  ac_7d: 932248,
  ac_14d: 932249,
  agoda_ac_7d: 932250,
  agoda_ac_14d: 932251,
  agd_ac_7d: 932250,   // alias
  agd_ac_14d: 932251,  // alias
  airbnb: 932252,
  airbnb_ac: 932253,
  ac_bnb_7d: 932254,
  ac_bnb_14d: 932255
};

export const MOTHER_ACCOMMODATION_IDS = {
  test: [649669, 921799],
  real: [883795, 529773, 495796, 495795, 494840, 960389, 960387, 960385, 960383, 421511, 293965, 293945, 293948, 293942, 293943, 293954, 293955, 293951, 293962, 293963, 293957, 293959]
};

export const MOTHER_ROOM_INFOS: Record<number, { name: string; basePrice: number }> = {
  529773: { name: 'Jungle Villa 2', basePrice: 2290 },
  495795: { name: 'Jungle Villa Left 2', basePrice: 1290 },
  495796: { name: 'Jungle Villa Right 2', basePrice: 1290 },
  494840: { name: 'Peace & Love Villa 2', basePrice: 1290 },
  960389: { name: 'Jungle Villa', basePrice: 2290 },
  960385: { name: 'Jungle Villa Left', basePrice: 1290 },
  960387: { name: 'Jungle Villa Right', basePrice: 1290 },
  960383: { name: 'Peace & Love Villa', basePrice: 1290 },
  421511: { name: 'Penthouse Villa', basePrice: 1290 },
  293957: { name: 'Yellow Bungalow', basePrice: 990 },
  293954: { name: 'Red Bungalow', basePrice: 790 },
  293962: { name: 'Green Bungalow', basePrice: 790 },
  293965: { name: 'Camel Tent', basePrice: 430 },
  293955: { name: 'Lagoon Tent', basePrice: 430 },
  293942: { name: 'Internal room', basePrice: 430 },
  293963: { name: 'Room 1', basePrice: 790 },
  293959: { name: 'Room 2', basePrice: 790 },
  293948: { name: 'Room 3', basePrice: 790 },
  293945: { name: 'Room 4', basePrice: 790 },
  293943: { name: 'Room 5', basePrice: 790 },
  293951: { name: 'Lodge 1', basePrice: 890 },
  883795: { name: 'Lodge 2', basePrice: 890 }
};

export const FAKE_BUNGALOW_MOTHER_IDS = [649669, 921799] as const;
