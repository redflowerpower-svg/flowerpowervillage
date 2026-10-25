export interface RoomType {
  category: 'VILLE' | 'BUNGALOW' | 'TENDE GLAMPING' | 'THE HUB GUESTHOUSE' | 'TEST';
  name: string;
  baseGuests: number;
  maxExtraGuests: number;
  beds: string;
  pricePerNight: number;
  octorateId?: number;
}

export const PRICE_CONFIG = {
  EXTRA_GUEST_PRICE: 200,  // THB per extra guest per night
  BREAKFAST_PRICE: 200,    // THB per guest per day
  AC_SURCHARGE: 500,       // THB flat per stay
};

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

