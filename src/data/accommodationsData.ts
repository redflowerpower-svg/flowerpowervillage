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

  const items = data as any[];
  // Safeguard: Ensure images array is initialized so consumers do not crash
  for (const item of items) {
    if (!item.images) {
      item.images = [];
    }
  }
  return items as Accommodation[];
}

export async function fetchAccommodationBySlug(slug: string): Promise<Accommodation | null> {
  const { data, error } = await supabase
    .from('accommodations')
    .select('*')
    .eq('slug', slug)
    .eq('is_available', true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const item = data as any;
  let images: string[] = [];

  try {
    const folder = item.slug;
    const { data: files, error: storageError } = await supabase.storage
      .from('accommodations')
      .list(folder, { sortBy: { column: 'name', order: 'asc' } });

    if (!storageError && files) {
      images = files
        .filter(file => file.id !== null) // only files
        .map(file => {
          const { data: urlData } = supabase.storage
            .from('accommodations')
            .getPublicUrl(`${folder}/${file.name}`);

          const publicUrl = urlData.publicUrl;
          // Optimize and cache detail page images with wsrv.nl at 1200px width
          return `https://wsrv.nl/?url=${encodeURIComponent(publicUrl)}&w=1200&output=webp&q=85`;
        });
    }
  } catch (err) {
    console.error(`Error fetching storage images for slug ${slug}:`, err);
  }

  return {
    ...item,
    images
  } as Accommodation;
}
