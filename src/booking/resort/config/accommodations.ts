export interface RoomType {
  category: 'VILLE' | 'BUNGALOW' | 'TENDE GLAMPING' | 'THE HUB GUESTHOUSE';
  name: string;
  baseGuests: number;
  maxExtraGuests: number;
  beds: string;
  octorateId?: number;
}

export const PRICE_CONFIG = {
  EXTRA_GUEST_PRICE: 200,  // THB per extra guest per night
  BREAKFAST_PRICE: 200,    // THB per guest per day
  AC_SURCHARGE: 500,       // THB flat per stay
};

export const ACCOMMODATIONS: RoomType[] = [
  { category: 'VILLE', name: 'Jungle Villa', baseGuests: 8, maxExtraGuests: 0, beds: '2 King Size + 2 Sofa Bed Queen', octorateId: 529784 },
  { category: 'VILLE', name: 'Jungle Villa Left', baseGuests: 4, maxExtraGuests: 0, beds: '1 King Size + 1 Sofa Bed Queen', octorateId: 495807 },
  { category: 'VILLE', name: 'Jungle Villa Right', baseGuests: 4, maxExtraGuests: 0, beds: '1 King Size + 1 Sofa Bed Queen', octorateId: 495980 },
  { category: 'VILLE', name: 'Peace & Love Villa', baseGuests: 4, maxExtraGuests: 0, beds: '1 King Size + 1 Sofa Bed Queen', octorateId: 495566 },
  { category: 'VILLE', name: 'Villa Penthouse', baseGuests: 4, maxExtraGuests: 0, beds: '1 King Size + 1 Sofa Bed King', octorateId: 449348 },
  { category: 'BUNGALOW', name: 'Yellow Bungalow', baseGuests: 2, maxExtraGuests: 1, beds: '1 King Size + 1 Extra Single', octorateId: 449385 },
  { category: 'BUNGALOW', name: 'Red Bungalow', baseGuests: 2, maxExtraGuests: 1, beds: '1 King Size + 1 Extra Single', octorateId: 449422 },
  { category: 'BUNGALOW', name: 'Green Bungalow', baseGuests: 2, maxExtraGuests: 1, beds: '1 King Size + 1 Extra Single', octorateId: 449668 },
  { category: 'TENDE GLAMPING', name: 'Camel Tent Bungalow', baseGuests: 2, maxExtraGuests: 0, beds: '1 King Size', octorateId: 449675 },
  { category: 'TENDE GLAMPING', name: 'Lagoon Tent Bungalow', baseGuests: 2, maxExtraGuests: 0, beds: '1 King Size', octorateId: 449674 },
  { category: 'THE HUB GUESTHOUSE', name: 'Room 1', baseGuests: 2, maxExtraGuests: 1, beds: '1 King Size + 1 Extra Single', octorateId: 449678 },
  { category: 'THE HUB GUESTHOUSE', name: 'Room 2', baseGuests: 2, maxExtraGuests: 2, beds: '1 King Size + 1 Sofa Bed King', octorateId: 449684 },
  { category: 'THE HUB GUESTHOUSE', name: 'Room 3', baseGuests: 2, maxExtraGuests: 2, beds: '1 King Size + 1 Sofa Bed Queen', octorateId: 449699 },
  { category: 'THE HUB GUESTHOUSE', name: 'Room 4', baseGuests: 2, maxExtraGuests: 2, beds: '1 King Size + 1 Sofa Bed King', octorateId: 449724 },
  { category: 'THE HUB GUESTHOUSE', name: 'Room 5', baseGuests: 2, maxExtraGuests: 0, beds: '1 Queen Size', octorateId: 449730 },
  { category: 'THE HUB GUESTHOUSE', name: 'Lodge 1', baseGuests: 4, maxExtraGuests: 0, beds: '1 King Size + 1 Sofa Bed King', octorateId: 449736 },
  { category: 'THE HUB GUESTHOUSE', name: 'Lodge 2', baseGuests: 4, maxExtraGuests: 0, beds: '1 King Size + 1 Sofa Bed King', octorateId: 923905 },
  { category: 'THE HUB GUESTHOUSE', name: 'Internal Room', baseGuests: 2, maxExtraGuests: 0, beds: '1 King Size', octorateId: 449742 }
];
