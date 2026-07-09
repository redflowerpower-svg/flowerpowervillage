import { supabase } from '../../lib/supabase';

export interface DbAccommodation {
  id: string;
  name: string;
  slug: string;
}

export interface EnrichedAccommodation {
  id: string;
  slug: string;
  name: string;
  title: string;
  category: 'VILLE' | 'BUNGALOW' | 'TENDE GLAMPING' | 'THE HUB GUESTHOUSE';
  description: string;
  capacity: number;
  baseGuests: number;
  maxExtraGuests: number;
  beds: string;
  features: string[];
  base_price_high: number;
  base_price_low: number;
  octorateId?: number;
  images: string[];
  isLive: boolean;
}

// Local metadata mapping to enrich the db records
const ROOM_METADATA: Record<string, {
  slug: string;
  category: EnrichedAccommodation['category'];
  description: string;
  capacity: number;
  baseGuests: number;
  beds: string;
  features: string[];
  price: number;
}> = {
  'Jungle Villa': {
    slug: 'jungle-villa',
    category: 'VILLE',
    description: 'La Jungle Villa è la struttura più ampia del villaggio, ideale per grandi gruppi che vogliono condividere l\'esperienza. Doppie cucine, doppi salotti outdoor e due camere con letti King e divani Queen accolgono comodamente fino a otto ospiti. Due bagni privati e una splendida vista sulla piscina rendono questo soggiorno davvero indimenticabile.',
    capacity: 8,
    baseGuests: 8,
    beds: '2 King Size + 2 Sofa Bed Queen',
    features: ['Private Kitchen', 'Pool Access', 'Hot Shower', 'WiFi', 'Double Living Room'],
    price: 4800
  },
  'Jungle Villa Left': {
    slug: 'jungle-villa-left',
    category: 'VILLE',
    description: 'Villa su due piani affacciata direttamente sulla piscina del villaggio, con cucina privata, zona pranzo e bagno al piano terra. Al secondo piano ti attendono un salotto outdoor e una spaziosa camera con letto King e divano letto Queen. Un\'unità semi-indipendente pensata per chi vuole comfort, privacy e un\'immersione autentica nella giungla.',
    capacity: 4,
    baseGuests: 4,
    beds: '1 King Size + 1 Sofa Bed Queen',
    features: ['Private Kitchen', 'Pool Access', 'Hot Shower', 'WiFi', 'Outdoor Living Room'],
    price: 2400
  },
  'Jungle Villa Right': {
    slug: 'jungle-villa-right',
    category: 'VILLE',
    description: 'Villa su due piani affacciata direttamente sulla piscina del villaggio, con cucina privata, zona pranzo e bagno al piano terra. Al secondo piano ti attendono un salotto outdoor e una spaziosa camera con letto King e divano letto Queen. Un\'unità semi-indipendente pensata per chi vuole comfort, privacy e un\'immersione autentica nella giungla.',
    capacity: 4,
    baseGuests: 4,
    beds: '1 King Size + 1 Sofa Bed Queen',
    features: ['Private Kitchen', 'Pool Access', 'Hot Shower', 'WiFi', 'Outdoor Living Room'],
    price: 2400
  },
  'Peace & Love Villa': {
    slug: 'peace-love-villa',
    category: 'VILLE',
    description: 'Situata di fronte alla piscina, questa villa indipendente vanta un\'ampia terrazza privata e una camera principale con letto King size e divano letto Queen adattabile. Cucina interna attrezzata, bagno privato con acqua calda e TV 40" Android TV completano ogni comfort. Perfetta per ospitare fino a quattro persone in un\'atmosfera rilassata e panoramica.',
    capacity: 4,
    baseGuests: 4,
    beds: '1 King Size + 1 Sofa Bed Queen',
    features: ['Equipped Kitchen', 'Pool Access', 'Hot Shower', 'WiFi', 'Android TV'],
    price: 2400
  },
  'Villa Penthouse': {
    slug: 'villa-penthouse',
    category: 'VILLE',
    description: 'La Penthouse Villa è la sistemazione più esclusiva del villaggio, con camera padronale King size, bagno privato e salotto separato con secondo bagno e divano letto King. Una cucina outdoor, TV 40" Android TV e un giardino privato completano lo spazio per la massima privacy. La scelta ideale per chi cerca il lusso assoluto immerso nella natura tropicale.',
    capacity: 4,
    baseGuests: 4,
    beds: '1 King Size + 1 Sofa Bed King',
    features: ['Outdoor Kitchen', 'Pool Access', 'Private Garden', '2 Bathrooms', 'Android TV'],
    price: 2400
  },
  'Yellow Bungalow': {
    slug: 'yellow-bungalow',
    category: 'BUNGALOW',
    description: 'Il Yellow Bungalow è la cupola più spaziosa del villaggio, immersa in un giardino con fiori vibranti, alberi da frutto, buceri e sunbirds. Cucina privata, soggiorno, sala pranzo, letto King, bagno caldo, frigo e ventilatore garantiscono il massimo del comfort. Un angolo dall\'anima sognante, perfetto per vivere la giungla con assoluta comodità.',
    capacity: 3,
    baseGuests: 2,
    beds: '1 King Size + 1 Extra Single',
    features: ['Private Kitchen', 'Hot Shower', 'Fridge', 'Fan', 'Private Dining'],
    price: 1800
  },
  'Red Bungalow': {
    slug: 'red-bungalow',
    category: 'BUNGALOW',
    description: 'Il Red Bungalow a cupola è avvolto da un giardino lussureggiante con fauna tropicale da scoprire direttamente dal tuo tavolo esterno privato. Letto King, bagno caldo, frigo/bar e ventilatore offrono tutto il necessario per un soggiorno rilassante. Un\'ambientazione fiabesca sospesa nella natura, capace di combinare intimità e totale riservatezza.',
    capacity: 3,
    baseGuests: 2,
    beds: '1 King Size + 1 Extra Single',
    features: ['Private Garden Table', 'Hot Shower', 'Fridge/Bar', 'Fan', 'Romantic Vibe'],
    price: 1800
  },
  'Green Bungalow': {
    slug: 'green-bungalow',
    category: 'BUNGALOW',
    description: 'Il Green Bungalow a cupola è immerso in un giardino di fiori e alberi da frutto, dove avvistare buceri, scoiattoli e sunbirds dal tavolo esterno è la norma. Offre letto King, bagno caldo, frigo/bar e ventilatore in un ambiente intimo e riservato. Un rifugio d\'incanto che unisce atmosfera fiabesca e massimo comfort nella natura tropicale.',
    capacity: 3,
    baseGuests: 2,
    beds: '1 King Size + 1 Extra Single',
    features: ['Garden Views', 'Hot Shower', 'Fridge/Bar', 'Fan', 'Fauna Watching'],
    price: 1800
  },
  'Camel Tent Bungalow': {
    slug: 'camel-tent-bungalow',
    category: 'TENDE GLAMPING',
    description: 'Il Camel Glamping è una tenda esclusiva su piattaforma rialzata in legno, riparata da un tetto in foglie naturali per vivere la giungla in totale comfort. Offre un comodo letto, bagno privato con acqua calda e un patio con amache per il relax. L\'ambiente ideale per ascoltare i suoni della foresta e disconnettersi dalla quotidianità.',
    capacity: 2,
    baseGuests: 2,
    beds: '1 King Size',
    features: ['Raised Wooden Platform', 'Private Bathroom', 'Hot Shower', 'Hammocks', 'Forest Sounds'],
    price: 1400
  },
  'Lagoon Tent Bungalow': {
    slug: 'lagoon-tent-bungalow',
    category: 'TENDE GLAMPING',
    description: 'Il Laguna Glamping è un\'esclusiva tenda sollevata su pedana di legno, protetta da un tetto in foglie naturali per un\'immersione autentica nella giungla. Offre un comodo letto e un bagno privato con acqua calda, avvolti dai suai della foresta in totale protezione. La scelta perfetta per chi vuole vivere la natura senza rinunciare al comfort essenziale.',
    capacity: 2,
    baseGuests: 2,
    beds: '1 King Size',
    features: ['Raised Wooden Platform', 'Private Bathroom', 'Hot Shower', 'Nature View', 'Thatch Roof'],
    price: 1400
  },
  'Room 1': {
    slug: 'room-1',
    category: 'THE HUB GUESTHOUSE',
    description: 'La Room #1 di HUBit@ è pensata per nomadi digitali e famiglie che cercano comfort e connettività a Koh Phayam. Include letto King size, scrivania dedicata, bagno privato con acqua calda e balcone, con accesso a cucina comune e WiFi a 100 Mbps. Un rifugio elegante per lavorare e rilassarsi godendo l\'autentico fascino dell\'isola.',
    capacity: 3,
    baseGuests: 2,
    beds: '1 King Size + 1 Extra Single',
    features: ['Dedicated Desk', 'Private Balcony', 'Hot Shower', '100 Mbps WiFi', 'Shared Kitchen'],
    price: 1000
  },
  'Room 2': {
    slug: 'room-2',
    category: 'THE HUB GUESTHOUSE',
    description: 'La Room #2 di HUBit@ unisce comfort moderno e produttività con letto King size, postazione di lavoro dedicata, bagno privato e balcone privato. Cucina comune attrezzata e connessione WiFi ultra-rapida a 100 Mbps garantiscono il massimo per lo smart working. Un angolo esclusivo per famiglie e remote worker, con vista sui profili tropicali di Koh Phayam.',
    capacity: 4,
    baseGuests: 2,
    beds: '1 King Size + 1 Sofa Bed King',
    features: ['Workstation', 'Private Balcony', 'Hot Shower', '100 Mbps WiFi', 'Shared Kitchen'],
    price: 1000
  },
  'Room 3': {
    slug: 'room-3',
    category: 'THE HUB GUESTHOUSE',
    description: 'La Room #3 di HUBit@ offre un ambiente sereno con letto King size, scrivania ergonomica e balcone privato per moments di relax a Koh Phayam. Accesso a cucina comune e area coworking con WiFi a 100 Mbps inclusi. Sistemazione perfetta per remote worker e famiglie in cerca di ispirazione e connettività affidabile.',
    capacity: 4,
    baseGuests: 2,
    beds: '1 King Size + 1 Sofa Bed Queen',
    features: ['Ergonomic Desk', 'Private Balcony', 'Hot Shower', '100 Mbps WiFi', 'Shared Kitchen'],
    price: 1000
  },
  'Room 4': {
    slug: 'room-4',
    category: 'THE HUB GUESTHOUSE',
    description: 'La Room #4 di HUBit@ è la scelta ideale per chi lavora da remoto e vuole vivere Koh Phayam in totale comodità. Letto King size, scrivania privata, bagno con acqua calda e balcone si uniscono all\'accesso a cucina comune e WiFi a 100 Mbps. Uno spazio funzionale e accogliente che garantisce produttività e relax in egual misura.',
    capacity: 4,
    baseGuests: 2,
    beds: '1 King Size + 1 Sofa Bed King',
    features: ['Private Desk', 'Private Balcony', 'Hot Shower', '100 Mbps WiFi', 'Shared Kitchen'],
    price: 1000
  },
  'Room 5': {
    slug: 'room-5',
    category: 'THE HUB GUESTHOUSE',
    description: 'La Room #5 di HUBit@ è il rifugio più intimo e silenzioso, ideale per coppie o nomadi solitari che cercano concentrazione totale. Dispone di letto Queen size, scrivania, bagno con acqua calda e accesso completo all\'area coworking con WiFi a 100 Mbps. Senza balcone, è uno spazio compatto ed elegante perfetto per dedicarsi interamente ai propri progetti.',
    capacity: 2,
    baseGuests: 2,
    beds: '1 Queen Size',
    features: ['Desk', 'Hot Shower', '100 Mbps WiFi', 'Coworking Access', 'Compact Design'],
    price: 1000
  },
  'Lodge 1': {
    slug: 'lodge-1',
    category: 'THE HUB GUESTHOUSE',
    description: 'Il Lodge #1 è un appartamento premium a livelli per famiglie e digital nomad, con cucina e salotto privati ed accesso agli spazi comuni di HUBit@. Il soggiorno su piattaforma rialzata con divano letto si trasforma all\'occorrenza in una seconda camera per 4 ospiti. Scendendo 5 gradini nel terrapieno posteriore si scopre la camera principale con letto King, scrivania, bagno caldo e balcone.',
    capacity: 4,
    baseGuests: 4,
    beds: '1 King Size + 1 Sofa Bed King',
    features: ['Split-Level Layout', 'Private Kitchen & Living', 'Private Balcony', 'Desk', 'Coworking Access'],
    price: 1600
  },
  'Lodge 2': {
    slug: 'lodge-2',
    category: 'THE HUB GUESTHOUSE',
    description: 'Il Lodge #2 è un appartamento premium a livelli per famiglie e digital nomad, con cucina e salotto privati ed accesso agli spazi comuni di HUBit@. Il soggiorno su piattaforma rialzata con divano letto si trasforma all\'occorrenza in una seconda camera per 4 ospiti. Scendendo 5 gradini nel terrapieno posteriore si scopre la camera principale con letto King, scrivania, bagno caldo e balcone.',
    capacity: 4,
    baseGuests: 4,
    beds: '1 King Size + 1 Sofa Bed King',
    features: ['Split-Level Layout', 'Private Kitchen & Living', 'Private Balcony', 'Desk', 'Coworking Access'],
    price: 1600
  },
  'Internal Room': {
    slug: 'internal-room',
    category: 'THE HUB GUESTHOUSE',
    description: 'L\'Internal Room di HUBit@ offre letto King, postazione lavoro, bagno privato e balcone con gli stessi standard delle camere principali. Situata in un\'area riservata sotto la struttura principale, garantisce privacy e comfort con accesso a cucina comune e WiFi a 100 Mbps. Una soluzione distinta ma con la stessa cura nei dettagli e il medesimo livello di comfort della guesthouse.',
    capacity: 2,
    baseGuests: 2,
    beds: '1 King Size',
    features: ['Desk', 'Hot Shower', '100 Mbps WiFi', 'Private Balcony', 'Quiet Area'],
    price: 1000
  }
};

const octorateIds: Record<string, number> = {
  'Jungle Villa': 529784,
  'Jungle Villa Left': 495807,
  'Jungle Villa Right': 495980,
  'Peace & Love Villa': 495566,
  'Villa Penthouse': 449348,
  'Yellow Bungalow': 449385,
  'Red Bungalow': 449422,
  'Green Bungalow': 449668,
  'Camel Tent Bungalow': 449675,
  'Lagoon Tent Bungalow': 449674,
  'Room 1': 449678,
  'Room 2': 449684,
  'Room 3': 449699,
  'Room 4': 449724,
  'Room 5': 449730,
  'Lodge 1': 449736,
  'Lodge 2': 923905,
  'Internal Room': 449742
};

const PREFERRED_ORDER = [
  'Jungle Villa',
  'Jungle Villa Left',
  'Jungle Villa Right',
  'Peace & Love Villa',
  'Villa Penthouse',
  'Yellow Bungalow',
  'Red Bungalow',
  'Green Bungalow',
  'Camel Tent Bungalow',
  'Lagoon Tent Bungalow',
  'Room 1',
  'Room 2',
  'Room 3',
  'Room 4',
  'Room 5',
  'Internal Room',
  'Lodge 1',
  'Lodge 2'
];

export async function fetchAccommodations(): Promise<EnrichedAccommodation[]> {
  // Query Supabase selecting 'id', 'name', and 'slug'
  const { data: dbItems, error: dbError } = await supabase
    .from('accommodations')
    .select('id, name, slug')
    .order('name');

  if (dbError) {
    console.error('Error fetching accommodations from Supabase:', dbError);
    throw dbError;
  }

  if (!dbItems) {
    return [];
  }

  const enrichedList: EnrichedAccommodation[] = [];

  for (const item of dbItems as DbAccommodation[]) {
    // Lookup metadata for this accommodation by its name
    const metadata = ROOM_METADATA[item.name];
    if (!metadata) {
      console.warn(`No metadata found for accommodation name: ${item.name}`);
      continue;
    }

    // Use the database-provided slug (Storage folder name) to list files in 'accommodations' bucket
    const folder = item.slug;
    let images: string[] = [];
    
    try {
      const { data: files, error: storageError } = await supabase.storage
        .from('accommodations')
        .list(folder, { sortBy: { column: 'name', order: 'asc' } });
      
      if (!storageError && files) {
        images = files
          .filter(file => file.id !== null) // only files
          .map(file => {
            const { data } = supabase.storage
              .from('accommodations')
              .getPublicUrl(`${folder}/${file.name}`);
            const timestamp = `?t=${Date.now()}`;
            return `${data.publicUrl}${timestamp}`;
          });
      }
    } catch (err) {
      console.error(`Error listing storage images for folder ${folder}:`, err);
    }

    enrichedList.push({
      id: item.id,
      slug: metadata.slug,
      name: item.name,
      title: item.name,
      category: metadata.category,
      description: metadata.description,
      capacity: metadata.capacity,
      baseGuests: metadata.baseGuests,
      maxExtraGuests: metadata.capacity - metadata.baseGuests,
      beds: metadata.beds,
      features: metadata.features,
      base_price_high: metadata.price,
      base_price_low: Math.round(metadata.price * 0.25),
      octorateId: octorateIds[item.name],
      images,
      isLive: false // Will be set in RoomGrid.tsx
    });
  }

  // Sort the enrichedList by their position in PREFERRED_ORDER
  enrichedList.sort((a, b) => {
    const indexA = PREFERRED_ORDER.indexOf(a.name);
    const indexB = PREFERRED_ORDER.indexOf(b.name);
    
    const valA = indexA !== -1 ? indexA : 999;
    const valB = indexB !== -1 ? indexB : 999;
    
    if (valA !== valB) {
      return valA - valB;
    }
    return a.name.localeCompare(b.name);
  });

  return enrichedList;
}
