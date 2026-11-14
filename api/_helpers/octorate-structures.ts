/**
 * 🏨 Mappatura Ufficiale e Centralizzata Multi-Struttura Octorate
 * Gestione unificata delle 3 entità ricettive:
 * - 🌸 Flower Power Village (ID: 366879)
 * - 🌴 Jungle Villas (ID: 807324)
 * - 🏠 Hubitat GuestHouse & Lodges (ID: 619403)
 */

export interface OctorateStructureConfig {
  id: string;
  name: string;
  resortKey: 'flower-power-village' | 'jungle-villas' | 'hubitat';
  badgeEmoji: string;
  shortLabel: string;
}

export const OCTORATE_STRUCTURES: OctorateStructureConfig[] = [
  {
    id: '366879',
    name: 'Flower Power Village',
    resortKey: 'flower-power-village',
    badgeEmoji: '🌸',
    shortLabel: 'FP Village'
  },
  {
    id: '807324',
    name: 'Jungle Villas',
    resortKey: 'jungle-villas',
    badgeEmoji: '🌴',
    shortLabel: 'Jungle Villas'
  },
  {
    id: '619403',
    name: 'Hubitat',
    resortKey: 'hubitat',
    badgeEmoji: '🏠',
    shortLabel: 'Hubitat'
  }
];

export const ALL_OCTORATE_STRUCTURE_IDS: string[] = OCTORATE_STRUCTURES.map(s => s.id);

/**
 * Mappatura rapida: dato un ID camera (Mother ID, Rate Plan BE o ID secondario),
 * restituisce la struttura Octorate di appartenenza.
 */
export function getOctorateStructureByRoomId(roomIdOrRateId: number | string): OctorateStructureConfig {
  const idStr = String(roomIdOrRateId).trim();

  // 🌴 1. JUNGLE VILLAS (807324)
  // Alloggi: Jungle Villa, Jungle Villa Left, Jungle Villa Right, Peace & Love Villa
  const jungleIds = new Set([
    // Mother IDs
    '529773', '495795', '495796', '494840',
    // BE Rate Plan IDs
    '529784', '495807', '495980', '495566',
    // Rate Plans secondari & OTA
    '529778', '529792', '529788', '529780', '916817', '529781', '529801', '921868', '921869', '529783', '529813',
    '495804', '496009', '496001', '495805', '496022', '495806', '496031', '921870', '921871', '495810', '496057',
    '495977', '496010', '496002', '495978', '496021', '495979', '496030', '921872', '921873', '495982', '496056',
    '495580', '495575', '495552', '495587', '495565', '495593', '921874', '921875', '495569', '495609'
  ]);

  if (jungleIds.has(idStr)) {
    return OCTORATE_STRUCTURES[1]; // Jungle Villas
  }

  // 🏠 2. HUBITAT GUESTHOUSE & LODGES (619403)
  // Alloggi: Room 1, Room 2, Room 3, Room 4, Room 5, Lodge 1, Lodge 2
  const hubitatIds = new Set([
    // Mother IDs
    '293963', '293959', '293948', '293945', '293943', '293951', '883795',
    // BE Rate Plan IDs
    '449678', '449684', '449699', '449724', '449730', '449736', '923905',
    // Rate Plans secondari & OTA
    '422300', '332737', '332735', '331964', '332117', '331965', '332132', '921889', '921890', '297027', '421505',
    '422296', '332741', '332739', '331966', '332119', '331967', '332134', '921891', '921900', '297032', '421506',
    '422293', '332743', '332757', '331968', '332121', '331969', '332136', '921892', '921893', '297028', '421507',
    '422265', '332759', '332746', '331970', '332123', '331971', '332138', '921894', '921895', '297029', '421508',
    '422213', '332765', '332763', '331972', '332125', '331973', '332140', '921896', '921897', '297031', '421509',
    '422149', '332769', '332767', '331974', '332129', '422157', '332142', '921884', '921885', '297030', '421510',
    '916108', '916107', '916109', '916114', '916829', '916105', '916830', '921886', '921887', '916103', '916104'
  ]);

  if (hubitatIds.has(idStr)) {
    return OCTORATE_STRUCTURES[2]; // Hubitat
  }

  // 🌸 3. DEFAULT: FLOWER POWER VILLAGE (366879)
  // Alloggi: Red Bungalow, Green Bungalow, Yellow Bungalow, Camel Tent, Lagoon Tent, Internal Room, Villa Penthouse
  // + Copie Standby Jungle/Peace&Love: 960389 (Jungle Villa), 960385 (Jungle Left), 960387 (Jungle Right), 960383 (Peace & Love)
  return OCTORATE_STRUCTURES[0];
}

/**
 * Riconosce la struttura da stringhe di testo o nomi camera (fallback euristico)
 */
export function getOctorateStructureByName(nameOrDescription: string): OctorateStructureConfig {
  const s = String(nameOrDescription || '').toLowerCase();
  if (s.includes('jungle') || s.includes('peace') || s.includes('p&l') || s.includes('jv') || s.includes('jvl') || s.includes('jvr')) {
    return OCTORATE_STRUCTURES[1];
  }
  if (s.includes('hubitat') || s.includes('lodge') || (s.includes('room') && !s.includes('internal')) || /r[1-5]\b/.test(s)) {
    return OCTORATE_STRUCTURES[2];
  }
  return OCTORATE_STRUCTURES[0];
}
