/**
 * Village Knowledge Base - Flower Power Village (Koh Phayam, Ranong, Thailand)
 * 
 * Fonte di verità centralizzata con tutte le informazioni operative, alloggi, servizi,
 * ristorazione, trasporti e policy del resort per l'AI Concierge e il CRM Telegram.
 */

export interface AccommodationDetail {
  slug: string;
  name: string;
  type: 'villa' | 'bungalow' | 'tent' | 'room';
  maxGuests: number;
  beds: string;
  acOrFan: 'AC + Fan' | 'High-power ceiling fan';
  bathroom: string;
  mosquitoNet: boolean;
  description: string;
}

export const VILLAGE_ACCOMMODATIONS: AccommodationDetail[] = [
  {
    slug: 'penthouse-villa',
    name: 'Penthouse Villa',
    type: 'villa',
    maxGuests: 4,
    beds: '1 King Bed + 1 Queen Bed (or comfortable sofa bed for kids)',
    acOrFan: 'AC + Fan',
    bathroom: 'Spacious private en-suite bathroom with hot water',
    mosquitoNet: true,
    description: 'Spacious luxury 2-story villa with panoramic jungle view, large private lounge terrace, full air conditioning, ceiling fans, high-speed WiFi. Perfect for families or couples seeking superior comfort.'
  },
  {
    slug: 'peace-and-love-villa',
    name: 'Peace & Love Villa',
    type: 'villa',
    maxGuests: 3,
    beds: '1 King Bed (+ 1 extra single bed on request)',
    acOrFan: 'AC + Fan',
    bathroom: 'Private bathroom with hot shower and tropical aesthetics',
    mosquitoNet: true,
    description: 'Cozy, romantic villa nestled in the tropical garden, equipped with silent air conditioning, veranda with hammock, private bathroom. Ideal for couples or small families.'
  },
  {
    slug: 'jungle-villa',
    name: 'Jungle Villa (Left & Right)',
    type: 'villa',
    maxGuests: 4,
    beds: '1 Double Bed + 2 Twin Beds',
    acOrFan: 'AC + Fan',
    bathroom: 'Private bathroom with natural stone shower',
    mosquitoNet: true,
    description: 'Two adjacent wooden villas immersed in deep lush greenery. Large veranda with hammocks, air conditioning, open jungle feel while fully enclosed and protected.'
  },
  {
    slug: 'red-bungalow',
    name: 'Red Bungalow',
    type: 'bungalow',
    maxGuests: 2,
    beds: '1 Comfortable Double Bed',
    acOrFan: 'High-power ceiling fan',
    bathroom: 'Private open-air tropical bathroom under the sky with hot shower',
    mosquitoNet: true,
    description: 'Traditional tropical wooden bungalow built with natural local timber. Features a charming open-air bathroom with tropical plants, private porch with hammock, ceiling fan, and full mosquito netting.'
  },
  {
    slug: 'yellow-bungalow',
    name: 'Yellow Bungalow',
    type: 'bungalow',
    maxGuests: 2,
    beds: '1 Comfortable Double Bed',
    acOrFan: 'High-power ceiling fan',
    bathroom: 'Private open-air tropical bathroom under the sky with hot shower',
    mosquitoNet: true,
    description: 'Charming wooden bungalow side-by-side with Red Bungalow (ideal for pairs of friends or two families booking adjacent units), open-air bathroom, private porch and hammock.'
  },
  {
    slug: 'green-bungalow',
    name: 'Green Bungalow',
    type: 'bungalow',
    maxGuests: 2,
    beds: '1 Comfortable Double Bed',
    acOrFan: 'High-power ceiling fan',
    bathroom: 'Private open-air tropical bathroom with hot shower',
    mosquitoNet: true,
    description: 'Authentic wooden eco-bungalow surrounded by palms and tropical flowers, private porch with hammock, open-air bathroom, high-power ceiling fan and mosquito net.'
  },
  {
    slug: 'camel-tent',
    name: 'Camel Glamping Tent',
    type: 'tent',
    maxGuests: 2,
    beds: '1 Luxury Double Bed',
    acOrFan: 'High-power ceiling fan',
    bathroom: 'Private dedicated bathroom right next to the tent platform',
    mosquitoNet: true,
    description: 'Spacious canvas bell tent mounted on a raised wooden deck with shaded canopy, real mattress, luxury bedding, mosquito net, ceiling fan, electric sockets, and private outdoor seating.'
  },
  {
    slug: 'lagoon-tent',
    name: 'Lagoon Glamping Tent',
    type: 'tent',
    maxGuests: 2,
    beds: '1 Luxury Double Bed',
    acOrFan: 'High-power ceiling fan',
    bathroom: 'Private dedicated bathroom with hot shower',
    mosquitoNet: true,
    description: 'Glamping experience in peaceful garden setting, raised wooden deck, comfortable bed, full mosquito netting, fan, private porch overlooking tropical greenery.'
  },
  {
    slug: 'internal-room',
    name: 'Internal Room',
    type: 'room',
    maxGuests: 2,
    beds: '1 Double Bed',
    acOrFan: 'High-power ceiling fan',
    bathroom: 'Private en-suite bathroom',
    mosquitoNet: true,
    description: 'Budget-friendly, solid brick construction inside the central building, private bathroom with hot water, ceiling fan, clean, quiet, and secure.'
  }
];

export const VILLAGE_KNOWLEDGE_SUMMARY = `
=== FLOWER POWER VILLAGE KNOWLEDGE BASE (KOH PHAYAM) ===

1. LOCATION & BEACH ACCESS:
- Located on Koh Phayam island, Ranong province, Southern Thailand.
- Walking distance to Buffalo Bay (Aow Kao Kwai): only ~150 meters, approx. 1 to 2 minutes walk on a peaceful village lane.
- Buffalo Bay has calm, gentle waters perfect for swimming, gorgeous sunsets, relaxing beach bars and kayak rentals.
- Koh Phayam is an authentic, preserved, eco-friendly island with NO CARS (only scooters, bicycles, and scenic walking trails).

2. AMENITIES & INFRASTRUCTURE:
- ELECTRICITY: 24/7 continuous electricity. Guests have power day and night.
- INTERNET: High-speed Wi-Fi available across the entire property.
- MOSQUITO PROTECTION: EVERY bed in EVERY accommodation (villas, bungalows, tents, rooms) is equipped with a clean, fully enclosed mosquito net.
- AC vs. FAN:
  * Villas (Penthouse, Peace & Love, Jungle) are equipped with both Air Conditioning and ceiling fans.
  * Wooden Bungalows and Glamping Tents are equipped with high-powered ceiling fans and tropical natural ventilation, designed for nature lovers seeking an authentic eco-lodge experience.
- HOUSEKEEPING: Regular cleaning, fresh towels and linens provided.

3. RESTAURANT & BAKERY (FLOWER POWER RESTAURANT):
- Legendary authentic Italian kitchen on Koh Phayam!
- Handcrafted fresh pasta, artisanal sourdough bread baked fresh daily, authentic stone-baked Italian pizza, Mediterranean seafood, meat and vegetarian specialties.
- Fresh tropical fruit juices and smoothies.
- Authentic Thai dishes prepared with fresh local seafood and herbs.
- BREAKFAST: Italian espresso, cappuccino, and freshly baked Italian croissants/pastries available daily at the bakery à la carte (typical breakfast ~150-250 THB, not included in base room rate unless specified).

4. CHILDREN, EXTRA BEDS & MULTI-FAMILY GROUPS:
- Children and families are warmly welcomed! The property is safe, peaceful, and child-friendly.
- Baby cot / crib: Available upon request (200 THB per night).
- Extra bed: Available on request in larger units (Penthouse Villa or Jungle Villa) for 300-500 THB/night.
- Multi-family or friends traveling together: We can arrange side-by-side or nearby units (e.g. Red + Yellow Bungalow, or Penthouse + Peace & Love) so groups can stay together while having private spaces.

5. HOW TO GET TO KOH PHAYAM (RANONG PIER):
- Ranong Mainland Pier (Tai Kak Pier) ➔ Koh Phayam Pier: Fast speedboats run hourly during high season (8:00 to 16:30, approx. 35-40 minutes, ticket ~350 THB per person).
- Reaching Ranong: Daily direct domestic flights from Bangkok (Don Mueang DMK) to Ranong Airport (UNN) via AirAsia or Nok Air. From Ranong airport, airport taxi/shared van takes guests to the pier in ~25 minutes (~200 THB).
- Arrival on the island: At Koh Phayam pier, motorbike taxis meet every arriving boat and bring guests directly to Flower Power Village (~100-150 THB). Scooter/motorbike rentals are also available at the pier or directly via the village (~200-250 THB/day).

6. RATES, DEPOSITS, PAYMENTS & CANCELLATIONS:
- Live Availability & Rates: Always available in real-time on the official interactive calendar: https://flowerpowervillage.com/calendar
- Payments Accepted: Major Credit/Debit cards (Visa, Mastercard via Stripe/Ksher), PromptPay QR for Thai bank accounts, International bank transfer.
- Booking Deposit: 30% confirmation deposit or full payment online.
- Cancellation Policy: Flexible! Free cancellation and full refund up to 14 days before scheduled check-in.
- Long Stay Discounts: For stays of 14 nights or longer, guests are entitled to a 10% direct discount; for stays of 28+ nights, 15% discount.
`;

