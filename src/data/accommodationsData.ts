export interface Accommodation {
  slug: string;
  name: string;
  type: 'villa' | 'bungalow' | 'room' | 'lodge' | 'tent';
  description: string;
  capacity: number;
  rooms: number;
  bathrooms: number;
  beds: string;
  features: string[];
  pricePerNight: number;
  images: string[];
}

export const accommodations: Accommodation[] = [
  {
    slug: 'jungle-villa',
    name: 'Jungle Villa',
    type: 'villa',
    description:
      'Our largest villa, perfect for families or groups. Set deep in the tropical garden with two full rooms and two private bathrooms, offering complete privacy and a true jungle retreat experience.',
    capacity: 8,
    rooms: 2,
    bathrooms: 2,
    beds: '2 King Size Beds + 2 Sofa Beds (Queen Size)',
    features: ['Private garden', '2 private bathrooms', 'Hot shower', 'Pool access', 'Free WiFi', 'Daily housekeeping', 'Outdoor terrace'],
    pricePerNight: 0,
    images: [],
  },
  {
    slug: 'jungle-villa-left',
    name: 'Jungle Villa Left',
    type: 'villa',
    description:
      'The left wing of the Jungle Villa complex, ideal for a couple or a small family. Fully independent with its own entrance, private bathroom, and direct garden access.',
    capacity: 4,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size Bed + 1 Sofa Bed (Queen Size)',
    features: ['Private entrance', 'Private bathroom', 'Hot shower', 'Pool access', 'Free WiFi', 'Garden views'],
    pricePerNight: 0,
    images: [],
  },
  {
    slug: 'jungle-villa-right',
    name: 'Jungle Villa Right',
    type: 'villa',
    description:
      'The right wing of the Jungle Villa complex, a serene and private retreat for couples or small families. Features the same high-quality amenities as the left wing with its own garden entrance.',
    capacity: 4,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size Bed + 1 Sofa Bed (Queen Size)',
    features: ['Private entrance', 'Private bathroom', 'Hot shower', 'Pool access', 'Free WiFi', 'Garden views'],
    pricePerNight: 0,
    images: [],
  },
  {
    slug: 'peace-and-love-villa',
    name: 'Peace & Love Villa',
    type: 'villa',
    description:
      'Named after the spirit of Koh Phayam itself — a peaceful, cosy villa surrounded by lush tropical greenery. The perfect choice for couples seeking intimacy and natural beauty.',
    capacity: 4,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size Bed + 1 Sofa Bed (Queen Size)',
    features: ['Private bathroom', 'Hot shower', 'Pool access', 'Free WiFi', 'Tropical garden views', 'Outdoor seating'],
    pricePerNight: 0,
    images: [],
  },
  {
    slug: 'villa-penthouse',
    name: 'Villa Penthouse',
    type: 'villa',
    description:
      'Our premium two-level villa with elevated views over the resort. Two rooms and two bathrooms with king-size beds throughout — the ultimate in comfort and privacy for discerning guests.',
    capacity: 4,
    rooms: 2,
    bathrooms: 2,
    beds: '1 King Size Bed + 1 Sofa Bed (King Size)',
    features: ['2 private bathrooms', 'Hot shower', 'Pool access', 'Panoramic views', 'Free WiFi', 'Daily housekeeping', 'Premium furnishings'],
    pricePerNight: 0,
    images: [],
  },
  {
    slug: 'yellow-bungalow',
    name: 'Yellow Bungalow',
    type: 'bungalow',
    description:
      'A bright, cheerful bungalow with a private garden terrace, perfect for a couple or a family with a young child. The warm yellow tones and lush surroundings create an uplifting tropical hideaway.',
    capacity: 3,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size Bed + Extra Single Bed',
    features: ['Private bathroom', 'Hot shower', 'Outdoor terrace', 'Garden views', 'Pool access', 'Free WiFi'],
    pricePerNight: 0,
    images: [],
  },
  {
    slug: 'red-bungalow',
    name: 'Red Bungalow',
    type: 'bungalow',
    description:
      'A cosy and intimate bungalow with rich, warm tones and a private outdoor space. Ideal for couples or a small family seeking seclusion within the tropical gardens.',
    capacity: 3,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size Bed + Extra Single Bed',
    features: ['Private bathroom', 'Hot shower', 'Outdoor terrace', 'Garden views', 'Pool access', 'Free WiFi'],
    pricePerNight: 0,
    images: [],
  },
  {
    slug: 'green-bungalow',
    name: 'Green Bungalow',
    type: 'bungalow',
    description:
      'Blending seamlessly with its natural surroundings, the Green Bungalow offers a true back-to-nature experience without sacrificing comfort. Quiet, private, and beautifully green.',
    capacity: 3,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size Bed + Extra Single Bed',
    features: ['Private bathroom', 'Hot shower', 'Outdoor terrace', 'Garden views', 'Pool access', 'Free WiFi'],
    pricePerNight: 0,
    images: [],
  },
  {
    slug: 'camel-tent-bungalow',
    name: 'Camel Tent Bungalow',
    type: 'tent',
    description:
      'A unique glamping-style tent bungalow with a warm, earthy palette. Experience the magic of sleeping close to nature in a fully equipped and comfortable private space.',
    capacity: 2,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size Bed',
    features: ['Private bathroom', 'Hot shower', 'Glamping experience', 'Garden views', 'Pool access', 'Free WiFi'],
    pricePerNight: 0,
    images: [],
  },
  {
    slug: 'lagoon-tent-bungalow',
    name: 'Lagoon Tent Bungalow',
    type: 'tent',
    description:
      'Inspired by the lagoons of Koh Phayam, this tent bungalow offers a serene and unique stay for two. A perfect choice for couples wanting something truly different.',
    capacity: 2,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size Bed',
    features: ['Private bathroom', 'Hot shower', 'Glamping experience', 'Lagoon-inspired design', 'Pool access', 'Free WiFi'],
    pricePerNight: 0,
    images: [],
  },
  {
    slug: 'room-1',
    name: 'Room 1',
    type: 'room',
    description:
      'A comfortable and well-appointed guesthouse room, ideal for a couple or a family with a young child. Practical, clean, and centrally located within the resort.',
    capacity: 3,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size Bed + Extra Single Bed',
    features: ['Private bathroom', 'Hot shower', 'Pool access', 'Free WiFi', 'Daily housekeeping'],
    pricePerNight: 0,
    images: [],
  },
  {
    slug: 'room-2',
    name: 'Room 2',
    type: 'room',
    description:
      'A spacious room for up to four guests with a king bed and a comfortable sofa bed. Great value for families or friends travelling together.',
    capacity: 4,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size Bed + 1 Sofa Bed (King Size)',
    features: ['Private bathroom', 'Hot shower', 'Pool access', 'Free WiFi', 'Daily housekeeping'],
    pricePerNight: 0,
    images: [],
  },
  {
    slug: 'room-3',
    name: 'Room 3',
    type: 'room',
    description:
      'A well-designed room with a king bed and queen sofa bed, sleeping up to four guests comfortably. Light, airy, and connected to the resort garden.',
    capacity: 4,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size Bed + 1 Sofa Bed (Queen Size)',
    features: ['Private bathroom', 'Hot shower', 'Pool access', 'Free WiFi', 'Daily housekeeping'],
    pricePerNight: 0,
    images: [],
  },
  {
    slug: 'room-4',
    name: 'Room 4',
    type: 'room',
    description:
      'Identical in layout to Room 2, this comfortable room for four features a king bed and king sofa bed. An excellent choice for families looking for space and comfort at great value.',
    capacity: 4,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size Bed + 1 Sofa Bed (King Size)',
    features: ['Private bathroom', 'Hot shower', 'Pool access', 'Free WiFi', 'Daily housekeeping'],
    pricePerNight: 0,
    images: [],
  },
  {
    slug: 'room-5',
    name: 'Room 5',
    type: 'room',
    description:
      'A cosy double room for two, featuring a queen-size bed. Ideal for couples seeking a comfortable and affordable stay with all resort amenities included.',
    capacity: 2,
    rooms: 1,
    bathrooms: 1,
    beds: '1 Queen Size Bed',
    features: ['Private bathroom', 'Hot shower', 'Pool access', 'Free WiFi', 'Daily housekeeping'],
    pricePerNight: 0,
    images: [],
  },
  {
    slug: 'lodge-1',
    name: 'Lodge 1',
    type: 'lodge',
    description:
      'A charming lodge-style room with a rustic tropical feel. Sleeping up to four, with a king bed and king sofa bed, this is a great option for families wanting a natural, relaxed atmosphere.',
    capacity: 4,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size Bed + 1 Sofa Bed (King Size)',
    features: ['Private bathroom', 'Hot shower', 'Pool access', 'Free WiFi', 'Tropical décor', 'Daily housekeeping'],
    pricePerNight: 0,
    images: [],
  },
  {
    slug: 'lodge-2',
    name: 'Lodge 2',
    type: 'lodge',
    description:
      'Twin to Lodge 1, this warm and welcoming lodge room offers the same configuration and natural aesthetic. Perfect for groups of up to four who want a lodgey, nature-connected feel.',
    capacity: 4,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size Bed + 1 Sofa Bed (King Size)',
    features: ['Private bathroom', 'Hot shower', 'Pool access', 'Free WiFi', 'Tropical décor', 'Daily housekeeping'],
    pricePerNight: 0,
    images: [],
  },
  {
    slug: 'internal-room',
    name: 'Internal Room',
    type: 'room',
    description:
      'A quiet, intimate room for two located in the heart of the resort. The Internal Room offers a private sanctuary with all essentials included — ideal for solo travellers or couples on a budget.',
    capacity: 2,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size Bed',
    features: ['Private bathroom', 'Hot shower', 'Pool access', 'Free WiFi', 'Daily housekeeping'],
    pricePerNight: 0,
    images: [],
  },
];

export function getAccommodationBySlug(slug: string): Accommodation | undefined {
  return accommodations.find((a) => a.slug === slug);
}

export const typeLabels: Record<Accommodation['type'], string> = {
  villa: 'Villa',
  bungalow: 'Bungalow',
  room: 'Room',
  lodge: 'Lodge',
  tent: 'Tent Bungalow',
};
