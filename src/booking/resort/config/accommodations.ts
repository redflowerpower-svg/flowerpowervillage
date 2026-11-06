export interface RoomType {
  category: 'VILLE' | 'BUNGALOW' | 'TENDE GLAMPING' | 'THE HUB GUESTHOUSE' | 'TEST';
  name: string;
  baseGuests: number;
  maxExtraGuests: number;
  beds: string;
  pricePerNight: number;
  octorateId?: number;
}

export type AcType = 'traditional' | 'portable' | 'none';

export interface AccommodationAcConfig {
  available: boolean;
  type: AcType;
  units: number;
  pricePerNightPerUnit: number;
  pricePerNightTotal: number;
  isPortable: boolean;
  recommendPayAsYouGo: boolean;
  hourlyEstimateThb: number; // ~20 THB/h
  kwhRateThb: number;        // 40 THB/kWh
}

export const PRICE_CONFIG = {
  EXTRA_GUEST_PRICE: 200,  // THB per extra guest per night
  BREAKFAST_PRICE: 200,    // THB per guest per day
  AC_PRICE_TRADITIONAL: 500, // THB per night
  AC_PRICE_PORTABLE: 400,    // THB per unit per night
  AC_PAY_AS_YOU_GO_RATE: 40, // THB per kWh
  AC_PAY_AS_YOU_GO_HOURLY: 20, // THB approx per hour
  AC_SURCHARGE: 500,       // Legacy fallback flat
};

export function getAccommodationAcConfig(identifier?: string | number | null): AccommodationAcConfig {
  const noneConfig: AccommodationAcConfig = {
    available: false,
    type: 'none',
    units: 0,
    pricePerNightPerUnit: 0,
    pricePerNightTotal: 0,
    isPortable: false,
    recommendPayAsYouGo: false,
    hourlyEstimateThb: 20,
    kwhRateThb: 40
  };

  if (!identifier) return noneConfig;

  const raw = String(identifier).toLowerCase().trim();

  // Glamping Tents & Internal Room -> No AC
  if (
    raw.includes('tent') ||
    raw.includes('glamping') ||
    raw.includes('camel') ||
    raw.includes('lagoon') ||
    raw.includes('internal') ||
    raw === '449675' || raw === '449674' || raw === '449742' || raw === '293965' || raw === '293955' || raw === '293942'
  ) {
    return noneConfig;
  }

  // 2 Units Portable: Jungle Villa (intera) or Villa Penthouse -> 800 THB/night (400 + 400)
  const isJungleFull = (raw.includes('jungle') && !raw.includes('left') && !raw.includes('right')) || raw === '529784' || raw === '529773';
  const isPenthouse = raw.includes('penthouse') || raw === '449348' || raw === '421511';

  if (isJungleFull || isPenthouse) {
    return {
      available: true,
      type: 'portable',
      units: 2,
      pricePerNightPerUnit: 400,
      pricePerNightTotal: 800,
      isPortable: true,
      recommendPayAsYouGo: true,
      hourlyEstimateThb: 20,
      kwhRateThb: 40
    };
  }

  // 1 Unit Portable: Peace & Love, Jungle Villa Left, Jungle Villa Right -> 400 THB/night
  const isPeaceLove = raw.includes('peace') || raw.includes('love') || raw === '495566' || raw === '494840';
  const isJungleLeft = (raw.includes('jungle') && raw.includes('left')) || raw === '495807' || raw === '495795';
  const isJungleRight = (raw.includes('jungle') && raw.includes('right')) || raw === '495980' || raw === '495796';

  if (isPeaceLove || isJungleLeft || isJungleRight) {
    return {
      available: true,
      type: 'portable',
      units: 1,
      pricePerNightPerUnit: 400,
      pricePerNightTotal: 400,
      isPortable: true,
      recommendPayAsYouGo: true,
      hourlyEstimateThb: 20,
      kwhRateThb: 40
    };
  }

  // Traditional Fixed AC: 3 Bungalows (Yellow, Red, Green), 5 Rooms (Room 1-5), 2 Lodges (Lodge 1-2) -> 500 THB/night
  return {
    available: true,
    type: 'traditional',
    units: 1,
    pricePerNightPerUnit: 500,
    pricePerNightTotal: 500,
    isPortable: false,
    recommendPayAsYouGo: false,
    hourlyEstimateThb: 20,
    kwhRateThb: 40
  };
}

export const ACCOMMODATIONS: RoomType[] = [
  { category: 'VILLE', name: 'Jungle Villa', baseGuests: 8, maxExtraGuests: 0, beds: '2 King Size + 2 Sofa Bed Queen', pricePerNight: 4800, octorateId: 529784 },
  { category: 'VILLE', name: 'Jungle Villa Left', baseGuests: 4, maxExtraGuests: 0, beds: '1 King Size + 1 Sofa Bed Queen', pricePerNight: 2400, octorateId: 495807 },
  { category: 'VILLE', name: 'Jungle Villa Right', baseGuests: 4, maxExtraGuests: 0, beds: '1 King Size + 1 Sofa Bed Queen', pricePerNight: 2400, octorateId: 495980 },
  { category: 'VILLE', name: 'Peace & Love Villa', baseGuests: 4, maxExtraGuests: 0, beds: '1 King Size + 1 Sofa Bed Queen', pricePerNight: 2400, octorateId: 495566 },
  { category: 'VILLE', name: 'Villa Penthouse', baseGuests: 4, maxExtraGuests: 0, beds: '1 King Size + 1 Sofa Bed King', pricePerNight: 2400, octorateId: 449348 },
  { category: 'BUNGALOW', name: 'Yellow Bungalow', baseGuests: 2, maxExtraGuests: 1, beds: '1 King Size + 1 Extra Single', pricePerNight: 1800, octorateId: 449385 },
  { category: 'BUNGALOW', name: 'Red Bungalow', baseGuests: 2, maxExtraGuests: 1, beds: '1 King Size + 1 Extra Single', pricePerNight: 1800, octorateId: 449422 },
  { category: 'BUNGALOW', name: 'Green Bungalow', baseGuests: 2, maxExtraGuests: 1, beds: '1 King Size + 1 Extra Single', pricePerNight: 1800, octorateId: 449668 },
  { category: 'TENDE GLAMPING', name: 'Camel Tent Bungalow', baseGuests: 2, maxExtraGuests: 0, beds: '1 King Size', pricePerNight: 1400, octorateId: 449675 },
  { category: 'TENDE GLAMPING', name: 'Lagoon Tent Bungalow', baseGuests: 2, maxExtraGuests: 0, beds: '1 King Size', pricePerNight: 1400, octorateId: 449674 },
  { category: 'THE HUB GUESTHOUSE', name: 'Internal Room', baseGuests: 2, maxExtraGuests: 0, beds: '1 King Size', pricePerNight: 1000, octorateId: 449742 },
  { category: 'THE HUB GUESTHOUSE', name: 'Room 1', baseGuests: 2, maxExtraGuests: 1, beds: '1 King Size + 1 Extra Single', pricePerNight: 1200, octorateId: 449678 },
  { category: 'THE HUB GUESTHOUSE', name: 'Room 2', baseGuests: 2, maxExtraGuests: 2, beds: '1 King Size + 1 Sofa Bed King', pricePerNight: 1200, octorateId: 449684 },
  { category: 'THE HUB GUESTHOUSE', name: 'Room 3', baseGuests: 2, maxExtraGuests: 2, beds: '1 King Size + 1 Sofa Bed Queen', pricePerNight: 1200, octorateId: 449699 },
  { category: 'THE HUB GUESTHOUSE', name: 'Room 4', baseGuests: 2, maxExtraGuests: 2, beds: '1 King Size + 1 Sofa Bed King', pricePerNight: 1200, octorateId: 449724 },
  { category: 'THE HUB GUESTHOUSE', name: 'Room 5', baseGuests: 2, maxExtraGuests: 0, beds: '1 Queen Size', pricePerNight: 1000, octorateId: 449730 },
  { category: 'THE HUB GUESTHOUSE', name: 'Lodge 1', baseGuests: 4, maxExtraGuests: 0, beds: '1 King Size + 1 Sofa Bed King', pricePerNight: 2000, octorateId: 449736 },
  { category: 'THE HUB GUESTHOUSE', name: 'Lodge 2', baseGuests: 4, maxExtraGuests: 0, beds: '1 King Size + 1 Sofa Bed King', pricePerNight: 2000, octorateId: 923905 },
  { category: 'TEST', name: 'Fake Bungalow 1', baseGuests: 2, maxExtraGuests: 0, beds: '1 King Size (TEST)', pricePerNight: 1000, octorateId: 649669 },
  { category: 'TEST', name: 'Fake Bungalow 2', baseGuests: 2, maxExtraGuests: 0, beds: '1 King Size (TEST)', pricePerNight: 1000, octorateId: 921799 }
];

// 🔗 MAPPATURA UFFICIALE E IMMODIFICABILE: 18 ALLOGGI E RELATIVE 18 LEGACY URLS
export interface AccommodationIdentity {
  name: string;
  canonicalSlug: string;
  legacySlug: string;
  legacyPath: string;
  directUrl: string;
  aliases: string[];
  octorateId?: number;
  category: 'VILLE' | 'BUNGALOW' | 'TENDE GLAMPING' | 'THE HUB GUESTHOUSE';
}

export const ACCOMMODATION_IDENTITIES: AccommodationIdentity[] = [
  {
    name: 'Jungle Villa',
    canonicalSlug: 'jungle-villa',
    legacySlug: '52-jungle-villa',
    legacyPath: '/52-jungle-villa',
    directUrl: 'https://www.flowerpowervillage.com/52-jungle-villa',
    aliases: ['52-jungle-villa', 'jungle-villa', '44_jungle_villa'],
    octorateId: 529784,
    category: 'VILLE'
  },
  {
    name: 'Jungle Villa Left',
    canonicalSlug: 'jungle-villa-left',
    legacySlug: '53-jungle-villa-left',
    legacyPath: '/53-jungle-villa-left',
    directUrl: 'https://www.flowerpowervillage.com/53-jungle-villa-left',
    aliases: ['53-jungle-villa-left', 'jungle-villa-left'],
    octorateId: 495807,
    category: 'VILLE'
  },
  {
    name: 'Jungle Villa Right',
    canonicalSlug: 'jungle-villa-right',
    legacySlug: '54-jungle-villa-right',
    legacyPath: '/54-jungle-villa-right',
    directUrl: 'https://www.flowerpowervillage.com/54-jungle-villa-right',
    aliases: ['54-jungle-villa-right', 'jungle-villa-right'],
    octorateId: 495980,
    category: 'VILLE'
  },
  {
    name: 'Peace & Love Villa',
    canonicalSlug: 'peace-love-villa',
    legacySlug: '51-villa-peace-love',
    legacyPath: '/51-villa-peace-love',
    directUrl: 'https://www.flowerpowervillage.com/51-villa-peace-love',
    aliases: ['51-villa-peace-love', 'peace-love-villa', 'peace-and-love-villa', '41_peace_and_love_villa'],
    octorateId: 495566,
    category: 'VILLE'
  },
  {
    name: 'Villa Penthouse',
    canonicalSlug: 'villa-penthouse',
    legacySlug: '22-villa-penthouse',
    legacyPath: '/22-villa-penthouse',
    directUrl: 'https://www.flowerpowervillage.com/22-villa-penthouse',
    aliases: ['22-villa-penthouse', 'villa-penthouse', '11_penthouse_villa'],
    octorateId: 449348,
    category: 'VILLE'
  },
  {
    name: 'Yellow Bungalow',
    canonicalSlug: 'yellow-bungalow',
    legacySlug: '11-yellow-bungalow',
    legacyPath: '/11-yellow-bungalow',
    directUrl: 'https://www.flowerpowervillage.com/11-yellow-bungalow',
    aliases: ['11-yellow-bungalow', 'yellow-bungalow', '03_yellow_bungalow'],
    octorateId: 449385,
    category: 'BUNGALOW'
  },
  {
    name: 'Red Bungalow',
    canonicalSlug: 'red-bungalow',
    legacySlug: '12-red-bungalow',
    legacyPath: '/12-red-bungalow',
    directUrl: 'https://www.flowerpowervillage.com/12-red-bungalow',
    aliases: ['12-red-bungalow', 'red-bungalow', '01_red_bungalow'],
    octorateId: 449422,
    category: 'BUNGALOW'
  },
  {
    name: 'Green Bungalow',
    canonicalSlug: 'green-bungalow',
    legacySlug: '13-green-bungalow',
    legacyPath: '/13-green-bungalow',
    directUrl: 'https://www.flowerpowervillage.com/13-green-bungalow',
    aliases: ['13-green-bungalow', 'green-bungalow', '02_green_bungalow'],
    octorateId: 449668,
    category: 'BUNGALOW'
  },
  {
    name: 'Camel Tent Bungalow',
    canonicalSlug: 'camel-tent-bungalow',
    legacySlug: '23-camel-tent',
    legacyPath: '/23-camel-tent',
    directUrl: 'https://www.flowerpowervillage.com/23-camel-tent',
    aliases: ['23-camel-tent', 'camel-tent', 'camel-tent-bungalow', '23_camel_tent'],
    octorateId: 449675,
    category: 'TENDE GLAMPING'
  },
  {
    name: 'Lagoon Tent Bungalow',
    canonicalSlug: 'lagoon-tent-bungalow',
    legacySlug: '21-lagoon-tent',
    legacyPath: '/21-lagoon-tent',
    directUrl: 'https://www.flowerpowervillage.com/21-lagoon-tent',
    aliases: ['21-lagoon-tent', 'lagoon-tent', 'lagoon-tent-bungalow', '22_lagoon_tent'],
    octorateId: 449674,
    category: 'TENDE GLAMPING'
  },
  {
    name: 'Room 1',
    canonicalSlug: 'room-1',
    legacySlug: '31-room-1',
    legacyPath: '/31-room-1',
    directUrl: 'https://www.flowerpowervillage.com/31-room-1',
    aliases: ['31-room-1', 'room-1', 'room1', '31_room_1'],
    octorateId: 449678,
    category: 'THE HUB GUESTHOUSE'
  },
  {
    name: 'Room 2',
    canonicalSlug: 'room-2',
    legacySlug: '32-room-2',
    legacyPath: '/32-room-2',
    directUrl: 'https://www.flowerpowervillage.com/32-room-2',
    aliases: ['32-room-2', 'room-2', 'room2', '32_room_2'],
    octorateId: 449684,
    category: 'THE HUB GUESTHOUSE'
  },
  {
    name: 'Room 3',
    canonicalSlug: 'room-3',
    legacySlug: '33-room-3',
    legacyPath: '/33-room-3',
    directUrl: 'https://www.flowerpowervillage.com/33-room-3',
    aliases: ['33-room-3', 'room-3', 'room3', '33_room_3'],
    octorateId: 449699,
    category: 'THE HUB GUESTHOUSE'
  },
  {
    name: 'Room 4',
    canonicalSlug: 'room-4',
    legacySlug: '34-room-4',
    legacyPath: '/34-room-4',
    directUrl: 'https://www.flowerpowervillage.com/34-room-4',
    aliases: ['34-room-4', 'room-4', 'room4', '34_room_4'],
    octorateId: 449724,
    category: 'THE HUB GUESTHOUSE'
  },
  {
    name: 'Room 5',
    canonicalSlug: 'room-5',
    legacySlug: '35-room-5',
    legacyPath: '/35-room-5',
    directUrl: 'https://www.flowerpowervillage.com/35-room-5',
    aliases: ['35-room-5', 'room-5', 'room5', '35_room_5'],
    octorateId: 449730,
    category: 'THE HUB GUESTHOUSE'
  },
  {
    name: 'Lodge 1',
    canonicalSlug: 'lodge-1',
    legacySlug: '36-lodge-1',
    legacyPath: '/36-lodge-1',
    directUrl: 'https://www.flowerpowervillage.com/36-lodge-1',
    aliases: ['36-lodge-1', 'lodge-1', 'lodge1', '36_lodge_1'],
    octorateId: 449736,
    category: 'THE HUB GUESTHOUSE'
  },
  {
    name: 'Lodge 2',
    canonicalSlug: 'lodge-2',
    legacySlug: '36-lodge-2',
    legacyPath: '/36-lodge-2',
    directUrl: 'https://www.flowerpowervillage.com/36-lodge-2',
    aliases: ['36-lodge-2', 'lodge-2', 'lodge2', '36_lodge_2'],
    octorateId: 923905,
    category: 'THE HUB GUESTHOUSE'
  },
  {
    name: 'Internal Room',
    canonicalSlug: 'internal-room',
    legacySlug: '41-room-internal',
    legacyPath: '/41-room-internal',
    directUrl: 'https://www.flowerpowervillage.com/41-room-internal',
    aliases: ['41-room-internal', 'internal-room', 'room-internal', '41_room_internal'],
    octorateId: 449742,
    category: 'THE HUB GUESTHOUSE'
  }
];

export function findAccommodationIdentity(rawSlugOrName?: string | null): AccommodationIdentity | undefined {
  if (!rawSlugOrName) return undefined;
  const s = String(rawSlugOrName).toLowerCase().trim().replace(/^\/+/, '');
  const clean = s.replace(/^\d+[-_]/, '');

  return ACCOMMODATION_IDENTITIES.find(acc => 
    acc.legacySlug.toLowerCase() === s ||
    acc.canonicalSlug.toLowerCase() === s ||
    acc.canonicalSlug.toLowerCase() === clean ||
    acc.name.toLowerCase() === s ||
    acc.aliases.some(a => a.toLowerCase() === s || a.toLowerCase() === clean)
  );
}


export const BED_TRANSLATIONS: Record<string, Record<string, string>> = {
  '2 King Size + 2 Sofa Bed Queen': {
    IT: '2 Matrimoniali King Size + 2 Divani Letto Queen',
    EN: '2 King Size Beds + 2 Queen Sofa Beds',
    TH: '2 เตียงคิงไซส์ + 2 โซฟาเบดควีนไซส์',
    DE: '2 Kingsize-Betten + 2 Queen-Schlafsofas'
  },
  '1 King Size + 1 Sofa Bed Queen': {
    IT: '1 Matrimoniale King Size + 1 Divano Letto Queen',
    EN: '1 King Size Bed + 1 Queen Sofa Bed',
    TH: '1 เตียงคิงไซส์ + 1 โซฟาเบดควีนไซส์',
    DE: '1 Kingsize-Bett + 1 Queen-Schlafsofa'
  },
  '1 King Size + 1 Sofa Bed King': {
    IT: '1 Matrimoniale King Size + 1 Divano Letto King',
    EN: '1 King Size Bed + 1 King Sofa Bed',
    TH: '1 เตียงคิงไซส์ + 1 โซฟาเบดคิงไซส์',
    DE: '1 Kingsize-Bett + 1 King-Schlafsofa'
  },
  '1 King Size + 1 Extra Single': {
    IT: '1 Matrimoniale King Size + 1 Letto Singolo Extra',
    EN: '1 King Size Bed + 1 Extra Single Bed',
    TH: '1 เตียงคิงไซส์ + 1 เตียงเดี่ยวเสริม',
    DE: '1 Kingsize-Bett + 1 Extra-Einzelbett'
  },
  '1 King Size': {
    IT: '1 Matrimoniale King Size',
    EN: '1 King Size Bed',
    TH: '1 เตียงคิงไซส์',
    DE: '1 Kingsize-Bett'
  },
  '1 Queen Size': {
    IT: '1 Matrimoniale Queen Size',
    EN: '1 Queen Size Bed',
    TH: '1 เตียงควีนไซส์',
    DE: '1 Queensize-Bett'
  }
};

export const CATEGORY_TRANSLATIONS: Record<string, Record<string, string>> = {
  VILLE: {
    IT: 'VILLE',
    EN: 'VILLAS',
    TH: 'วิลล่า',
    DE: 'VILLEN'
  },
  BUNGALOW: {
    IT: 'BUNGALOW',
    EN: 'BUNGALOWS',
    TH: 'บังกะโล',
    DE: 'BUNGALOWS'
  },
  'TENDE GLAMPING': {
    IT: 'TENDE GLAMPING',
    EN: 'GLAMPING TENTS',
    TH: 'เต็นท์แกลมปิ้ง',
    DE: 'GLAMPING-ZELTE'
  },
  GLAMPING: {
    IT: 'GLAMPING',
    EN: 'GLAMPING',
    TH: 'แกลมปิ้ง',
    DE: 'GLAMPING'
  },
  'THE HUB GUESTHOUSE': {
    IT: 'GUESTHOUSE',
    EN: 'GUESTHOUSE',
    TH: 'เกสต์เฮาส์',
    DE: 'GUESTHOUSE'
  },
  GUESTHOUSE: {
    IT: 'GUESTHOUSE',
    EN: 'GUESTHOUSE',
    TH: 'เกสต์เฮาส์',
    DE: 'GUESTHOUSE'
  }
};

export function formatAccommodationCategory(category?: string | null, lang: string = 'IT'): string {
  if (!category) return '';
  const key = category.trim().toUpperCase();
  const normalizedLang = (lang || 'IT').toUpperCase();
  if (CATEGORY_TRANSLATIONS[key]?.[normalizedLang]) {
    return CATEGORY_TRANSLATIONS[key][normalizedLang];
  }
  if (key.includes('VILL')) return normalizedLang === 'TH' ? 'วิลล่า' : normalizedLang === 'DE' ? 'VILLEN' : normalizedLang === 'EN' ? 'VILLAS' : 'VILLE';
  if (key.includes('BUNGALOW')) return normalizedLang === 'TH' ? 'บังกะโล' : normalizedLang === 'DE' || normalizedLang === 'EN' ? 'BUNGALOWS' : 'BUNGALOW';
  if (key.includes('GLAMP') || key.includes('TEND')) return normalizedLang === 'TH' ? 'เต็นท์แกลมปิ้ง' : normalizedLang === 'DE' ? 'GLAMPING-ZELTE' : normalizedLang === 'EN' ? 'GLAMPING TENTS' : 'TENDE GLAMPING';
  if (key.includes('GUESTHOUSE') || key.includes('HUB')) return normalizedLang === 'TH' ? 'เกสต์เฮาส์' : 'GUESTHOUSE';
  return category;
}

export function formatAccommodationBeds(beds?: string | null, lang: string = 'IT'): string {
  if (!beds) return '';
  const trimmed = beds.trim();
  const normalizedLang = (lang || 'IT').toUpperCase();
  
  if (BED_TRANSLATIONS[trimmed]?.[normalizedLang]) {
    return BED_TRANSLATIONS[trimmed][normalizedLang];
  }

  // Fallback: component-based replacement
  const parts = trimmed.split('+').map(p => p.trim());
  const translatedParts = parts.map(part => {
    if (BED_TRANSLATIONS[part]?.[normalizedLang]) {
      return BED_TRANSLATIONS[part][normalizedLang];
    }
    
    const match = part.match(/^(\d+)\s+(.+)$/);
    if (!match) return part;
    const qty = parseInt(match[1], 10);
    const type = match[2].trim();

    if (/sofa bed queen/i.test(type)) {
      if (normalizedLang === 'TH') return `${qty} โซฟาเบดควีนไซส์`;
      if (normalizedLang === 'DE') return `${qty} ${qty > 1 ? 'Queen-Schlafsofas' : 'Queen-Schlafsofa'}`;
      if (normalizedLang === 'EN') return `${qty} ${qty > 1 ? 'Queen Sofa Beds' : 'Queen Sofa Bed'}`;
      return `${qty} ${qty > 1 ? 'Divani Letto Queen' : 'Divano Letto Queen'}`;
    }
    if (/sofa bed king/i.test(type)) {
      if (normalizedLang === 'TH') return `${qty} โซฟาเบดคิงไซส์`;
      if (normalizedLang === 'DE') return `${qty} ${qty > 1 ? 'King-Schlafsofas' : 'King-Schlafsofa'}`;
      if (normalizedLang === 'EN') return `${qty} ${qty > 1 ? 'King Sofa Beds' : 'King Sofa Bed'}`;
      return `${qty} ${qty > 1 ? 'Divani Letto King' : 'Divano Letto King'}`;
    }
    if (/extra single/i.test(type)) {
      if (normalizedLang === 'TH') return `${qty} เตียงเดี่ยวเสริม`;
      if (normalizedLang === 'DE') return `${qty} ${qty > 1 ? 'Extra-Einzelbetten' : 'Extra-Einzelbett'}`;
      if (normalizedLang === 'EN') return `${qty} ${qty > 1 ? 'Extra Single Beds' : 'Extra Single Bed'}`;
      return `${qty} ${qty > 1 ? 'Letti Singoli Extra' : 'Letto Singolo Extra'}`;
    }
    if (/king size/i.test(type)) {
      if (normalizedLang === 'TH') return `${qty} เตียงคิงไซส์`;
      if (normalizedLang === 'DE') return `${qty} ${qty > 1 ? 'Kingsize-Betten' : 'Kingsize-Bett'}`;
      if (normalizedLang === 'EN') return `${qty} ${qty > 1 ? 'King Size Beds' : 'King Size Bed'}`;
      return `${qty} ${qty > 1 ? 'Matrimoniali King Size' : 'Matrimoniale King Size'}`;
    }
    if (/queen size/i.test(type)) {
      if (normalizedLang === 'TH') return `${qty} เตียงควีนไซส์`;
      if (normalizedLang === 'DE') return `${qty} ${qty > 1 ? 'Queensize-Betten' : 'Queensize-Bett'}`;
      if (normalizedLang === 'EN') return `${qty} ${qty > 1 ? 'Queen Size Beds' : 'Queen Size Bed'}`;
      return `${qty} ${qty > 1 ? 'Matrimoniali Queen Size' : 'Matrimoniale Queen Size'}`;
    }

    return part;
  });

  return translatedParts.join(' + ');
}
