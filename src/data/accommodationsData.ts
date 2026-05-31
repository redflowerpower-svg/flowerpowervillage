import { supabase } from '../lib/supabase';

export interface Accommodation {
  id: string;
  slug: string;
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
}

export const typeLabels: Record<Accommodation['type'], string> = {
  villa: 'Villa',
  bungalow: 'Bungalow',
  room: 'Room',
  lodge: 'Lodge',
  tent: 'Tent Bungalow',
};

export async function fetchAccommodations(): Promise<Accommodation[]> {
  const { data, error } = await supabase
    .from('accommodations')
    .select('*')
    .eq('is_available', true)
    .order('name');

  if (error) throw error;
  return data as Accommodation[];
}

export async function fetchAccommodationBySlug(slug: string): Promise<Accommodation | null> {
  const { data, error } = await supabase
    .from('accommodations')
    .select('*')
    .eq('slug', slug)
    .eq('is_available', true)
    .maybeSingle();

  if (error) throw error;
  return data as Accommodation | null;
}
