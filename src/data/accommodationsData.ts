import {
  fetchAccommodations as fetchEnrichedAccommodations,
  type EnrichedAccommodation,
} from '../booking/data/accommodationsService';
import { findAccommodationIdentity } from '../booking/resort/config/accommodations';

export interface Accommodation {
  id: string;
  slug: string;
  canonicalSlug?: string;
  legacySlug?: string;
  name: string;
  type: 'villa' | 'bungalow' | 'room' | 'lodge' | 'tent';
  description: string;
  capacity: number;
  rooms: number;
  bathrooms: number;
  beds: string;
  features: string[];
  price_per_night: number;
  images: string[];
  is_available: boolean;
  title_it?: string;
  title_en?: string;
  title_th?: string;
  title_de?: string;
  description_it?: string;
  description_en?: string;
  description_th?: string;
  description_de?: string;
}

export const typeLabels: Record<Accommodation['type'], string> = {
  villa: 'Villa',
  bungalow: 'Bungalow',
  room: 'Room',
  lodge: 'Lodge',
  tent: 'Tent Bungalow',
};

function mapCategoryToType(acc: EnrichedAccommodation): Accommodation['type'] {
  const lowerName = acc.name.toLowerCase();
  if (acc.category === 'VILLE') return 'villa';
  if (acc.category === 'BUNGALOW') return 'bungalow';
  if (acc.category === 'TENDE GLAMPING') return 'tent';
  if (lowerName.includes('lodge')) return 'lodge';
  return 'room';
}

const FEATURE_KEY_LABELS: Record<string, string> = {
  wifi: 'Free WiFi',
  hot_water: 'Hot Shower',
  ceiling_fan: 'Ceiling Fan',
  air_conditioning: 'Air Conditioning',
  swimming_pool: 'Pool Access',
  kitchen: 'Private Kitchen',
  refrigerator: 'Refrigerator',
  terrace_balcony: 'Terrace / Balcony',
  private_garden: 'Private Garden',
  safe: 'In-Room Safe',
  desk: 'Work Desk',
  sofa_bed: 'Sofa Bed',
  gym: 'Gym & Fitness',
  yoga_temple: 'Yoga Temple',
};

function normalizeFeatures(rawFeatures: unknown): string[] {
  if (Array.isArray(rawFeatures)) {
    return rawFeatures.filter((f): f is string => typeof f === 'string' && f.trim().length > 0);
  }
  if (rawFeatures && typeof rawFeatures === 'object') {
    const obj = rawFeatures as Record<string, unknown>;
    const list: string[] = [];
    if (typeof obj.room_size === 'number' && obj.room_size > 0) {
      list.push(`${obj.room_size} m²`);
    }
    for (const [key, label] of Object.entries(FEATURE_KEY_LABELS)) {
      if (obj[key] === true) list.push(label);
    }
    return list;
  }
  return [];
}

function toDetailAccommodation(acc: EnrichedAccommodation): Accommodation {
  const identity = findAccommodationIdentity(acc.name) || findAccommodationIdentity(acc.slug);
  const isFullJungleVilla = acc.name.toLowerCase().trim() === 'jungle villa';

  return {
    id: acc.id,
    slug: identity?.legacySlug || acc.slug,
    canonicalSlug: identity?.canonicalSlug || acc.slug,
    legacySlug: identity?.legacySlug,
    name: acc.name,
    type: mapCategoryToType(acc),
    description: acc.description,
    capacity: acc.capacity,
    rooms: isFullJungleVilla ? 2 : 1,
    bathrooms: isFullJungleVilla ? 2 : 1,
    beds: acc.beds,
    features: normalizeFeatures(acc.features),
    price_per_night: acc.base_price_high,
    images: acc.images || [],
    is_available: true,
    title_it: acc.title_it,
    title_en: acc.title_en,
    title_th: acc.title_th,
    title_de: acc.title_de,
    description_it: acc.description_it,
    description_en: acc.description_en,
    description_th: acc.description_th,
    description_de: acc.description_de,
  };
}

export async function fetchAccommodations(): Promise<Accommodation[]> {
  const enriched = await fetchEnrichedAccommodations();
  return enriched.map(toDetailAccommodation);
}

export async function fetchAccommodationBySlug(slug: string): Promise<Accommodation | null> {
  if (!slug) return null;

  const identity = findAccommodationIdentity(slug);
  const enrichedList = await fetchEnrichedAccommodations();

  const normalizedInput = slug.toLowerCase().trim().replace(/^\/+/, '');
  const cleanInput = normalizedInput.replace(/^\d+[-_]/, '');

  const match = enrichedList.find((acc) => {
    if (identity && acc.name.toLowerCase() === identity.name.toLowerCase()) return true;
    const accSlug = String(acc.slug || '').toLowerCase();
    const accName = String(acc.name || '').toLowerCase();
    return (
      accSlug === normalizedInput ||
      accSlug === cleanInput ||
      accName === normalizedInput ||
      (identity && accSlug === identity.canonicalSlug.toLowerCase())
    );
  });

  if (!match) return null;
  return toDetailAccommodation(match);
}
