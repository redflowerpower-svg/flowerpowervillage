import { menuData, MenuItem } from '../../pizza/data/menuData';
import { ACCOMMODATIONS } from '../../booking/resort/config/accommodations';
import { DEFAULT_PERIODS, DEFAULT_PRICES_MATRIX } from '../../admin/resort/store/useSeasonalRateStore';
import { fetchCloudMenuOverrides } from '../../pizza/data/pizzaMenuCloudService';

export type AutoCutLabMode = 'P1' | 'P2' | 'P3' | 'V1' | 'V2' | 'V3' | 'R1' | 'LM1' | 'DS';

/**
 * 🏨 Calcolo Prezzo Ufficiale Octorate Certificato alla Data Odierna (new Date())
 * Interroga la matrice stagionale ufficiale registrata nel sistema (Low Season / High Season).
 */
export function getTodayOctoratePrice(motherId: number): number {
  const today = new Date().toISOString().substring(0, 10);
  const currentPeriod = DEFAULT_PERIODS.find(p => today >= p.dateFrom && today <= p.dateTo) 
    || DEFAULT_PERIODS[DEFAULT_PERIODS.length - 1]; // Fallback su Low Season
  const matrix = DEFAULT_PRICES_MATRIX[currentPeriod.id] || DEFAULT_PRICES_MATRIX['p9'];
  return matrix[motherId] || 990;
}

export interface AutoCutScene {
  imageUrl: string;
  titlePrimary: string;     // Pizzeria: Thai grande sopra | Villaggio: English grande sopra
  titleSecondary: string;   // Pizzeria: English sotto | Villaggio: Thai sotto
  priceLabel: string;       // Pizzeria: "290 THB" o "8" 120 THB • 12" 190 THB" | Villaggio: "Last Minute Price: 2,400 THB"
  priceValue?: number;
  lodgingTitle?: string;    // Es. "Green Bungalow"
  lodgingSubtitle?: string; // Es. "Tropical Hideaway"
  pizzaSizes?: {
    size8Price: number;
    size12Price: number;
  };
  trajectory: 
    | 'food_macro_focus_lr' 
    | 'food_macro_focus_rl' 
    | 'pan_left_zoom_in' 
    | 'pan_right_zoom_in' 
    | 'pan_left_zoom_out' 
    | 'pan_right_zoom_out' 
    | 'push_in_focal';
  badgeCategory?: string;
  badgeCategoryTh?: string;
  sourceName?: string;
  duration?: number;
  isLiveShowcase?: boolean;
}

export interface AutoCutAudioTrack {
  id: string;
  title: string;
  src: string;
  duration: number; // Durata naturale del file
  p1CutDuration?: number; // Punto di chiusura naturale del cantato "Flower Power!" per P1
}

export interface AutoCutTestRun {
  mode: AutoCutLabMode;
  modeTitle: string;
  modeDescription: string;
  brand: 'pizza' | 'village';
  audioTrack: {
    id: string;
    title: string;
    src: string;
    duration: number;
    effectiveDuration: number;
  };
  scenes: AutoCutScene[];
  totalDuration: number;
  sceneDuration: number;
  isEmptyShowcase?: boolean;
}

// 🎵 I 4 Jingle Brevi Pizzeria (Scelta 100% Casuale con chiusura vocale sartoriale "Flower Power!")
export const PIZZA_JINGLE_TRACKS: AutoCutAudioTrack[] = [
  {
    id: 'pizza_01',
    title: 'Yeah! (Intro Energica)',
    src: '/audio/01-flower-power-yeah.mp3',
    duration: 13.0,
    p1CutDuration: 8.85 // Conclude la frase vocale "Flower Power! Yeah!"
  },
  {
    id: 'pizza_02',
    title: 'So Good (Gusto & Appetito)',
    src: '/audio/02-flower-power-so-good.mp3',
    duration: 12.9,
    p1CutDuration: 8.55 // Conclude la frase vocale "Flower Power! So good!"
  },
  {
    id: 'pizza_03',
    title: 'Ranong (Geolocal & Delivery)',
    src: '/audio/03-flower-power-ranong.mp3',
    duration: 12.9,
    p1CutDuration: 9.15 // Conclude la frase vocale "Flower Power! Ranong!"
  },
  {
    id: 'pizza_04',
    title: 'Aroi Mak Mak (อร่อยมากๆ Viral)',
    src: '/audio/04-flower-power-aroi-mak-mak.mp3',
    duration: 11.7,
    p1CutDuration: 8.80 // Conclude la frase vocale "Flower Power! Aroi mak mak!"
  }
];

// 🌺 Brani Sonori Koh Phayam Village (Scelta 100% Casuale tra tutte le 11 tracce ufficiali)
export const VILLAGE_AUDIO_TRACKS_LAB: AutoCutAudioTrack[] = [
  {
    id: 'village_01',
    title: 'Island Disco Paradise (Disco Funk)',
    src: '/audio/village/01%20Flower%20Power%20Village%20-%20Island%20Disco%20Paradise%20(Disco%20Funk).mp3',
    duration: 25.7
  },
  {
    id: 'village_02',
    title: 'Island Funk Groove (Tropical Funk Pop)',
    src: '/audio/village/02%20Flower%20Power%20Village%20-%20Island%20Funk%20Groove%20(Tropical%20Funk).mp3',
    duration: 27.6
  },
  {
    id: 'village_03',
    title: 'Phayam Island Groove (Island Disco)',
    src: '/audio/village/03%20Flower%20Power%20Village%20-%20Phayam%20Island%20Groove%20(Island%20Disco).mp3',
    duration: 19.3
  },
  {
    id: 'village_04',
    title: 'Island Vibes & Sun (Reggae Pop)',
    src: '/audio/village/04%20Flower%20Power%20Village%20-%20Island%20Vibes%20&%20Golden%20Sun%20(Reggae%20Pop).mp3',
    duration: 25.6
  },
  {
    id: 'village_05',
    title: 'Island Sunshine Riddim (Reggae Roots)',
    src: '/audio/village/05%20Flower%20Power%20Village%20-%20Island%20Sunshine%20Riddim%20(Reggae%20Roots).mp3',
    duration: 30.5
  },
  {
    id: 'village_06',
    title: 'Koh Phayam Paradise Vibes (Island Reggae)',
    src: '/audio/village/06%20Flower%20Power%20Village%20-%20Koh%20Phayam%20Paradise%20Vibes%20(Island%20Reggae).mp3',
    duration: 26.8
  },
  {
    id: 'village_07',
    title: 'Tropical Island Escape (Tropical Reggae)',
    src: '/audio/village/07%20Flower%20Power%20Village%20-%20Tropical%20Island%20Escape%20(Tropical%20Reggae).mp3',
    duration: 24.7
  },
  {
    id: 'village_08',
    title: 'Sweet Island Sunshine (Chillhop Lo-Fi)',
    src: '/audio/village/08%20Flower%20Power%20Village%20-%20Sweet%20Island%20Sunshine%20(Chillhop%20Lo-Fi).mp3',
    duration: 18.9
  },
  {
    id: 'village_09',
    title: 'Love in Koh Phayam (Vocal Jazz Bossa)',
    src: '/audio/village/09%20Flower%20Power%20Village%20-%20Love%20in%20Koh%20Phayam%20(Vocal%20Jazz%20Bossa).mp3',
    duration: 43.7
  },
  {
    id: 'village_10',
    title: 'Tropical Soul Sanctuary (Neo-Soul Lounge)',
    src: '/audio/village/10%20Flower%20Power%20Village%20-%20Tropical%20Soul%20Sanctuary%20(Neo-Soul%20Lounge).mp3',
    duration: 31.0
  },
  {
    id: 'village_11',
    title: 'Island Breeze & Sabai Life (Tropical Acoustic)',
    src: '/audio/village/11%20Flower%20Power%20Village%20-%20Island%20Breeze%20&%20Sabai%20Life%20(Tropical%20Acoustic).mp3',
    duration: 30.9
  }
];

const STORAGE_ACC = 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/accommodations';

// 🚫 REGOLA FERREA SOCIAL VILLAGGIO: Divieto categorico di mostrare foto dei Bagni / Toilet in V2, V3 e nei reel
export function isBathroomPhoto(filenameOrPath: string): boolean {
  const lower = filenameOrPath.toLowerCase();
  return (
    lower.includes('toilet') ||
    lower.includes('bathroom') ||
    lower.includes('bath') ||
    lower.includes('wc') ||
    lower.includes('washroom') ||
    lower.includes('restroom') ||
    lower.includes('bagno')
  );
}

// Alloggi Ufficiali con Foto Reali Supabase (RIGOROSAMENTE ZERO BAGNI) e Mother ID Octorate
export const VILLAGE_LODGINGS = [
  {
    id: 'villa-penthouse',
    motherId: 421511,
    folder: '11_penthouse_villa',
    nameEn: 'Villa Penthouse Breezy Suite',
    lodgingTitle: 'Villa Penthouse',
    lodgingSubtitle: 'Breezy Suite',
    nameTh: 'เพนต์เฮาส์วิลล่า ดาดฟ้าชมวิวรับลมธรรมชาติเกาะพยาม',
    category: 'VILLE',
    mainImage: `${STORAGE_ACC}/11_penthouse_villa/01-Main.jpg`,
    gallery: [
      { file: '01-Main.jpg', labelEn: 'Panoramic Breezy Wooden Deck', labelTh: 'วิลล่า 2 ชั้น ดาดฟ้าชมวิวรับลมพาโนรามา' },
      { file: '06-Bed1.jpg', labelEn: 'King Size Master Bedroom', labelTh: 'ห้องนอนใหญ่เตียงคิงไซส์แสนสบาย' },
      { file: '05-Sofa.jpg', labelEn: 'Private Lounge & Living Area', labelTh: 'มุมนั่งเล่นและโซฟาพักผ่อนส่วนตัว' },
      { file: '03-Kitchen.jpg', labelEn: 'Fully Equipped Kitchen & Dining', labelTh: 'ครัวส่วนตัวพร้อมอุปกรณ์ทำอาหาร' },
      { file: '07-Bed3.jpg', labelEn: 'Second Luxury King Bedroom', labelTh: 'ห้องนอนคิงไซส์ชั้นบน วิวธรรมชาติ' }
    ]
  },
  {
    id: 'red-bungalow',
    motherId: 293954,
    folder: '01_red_bungalow',
    nameEn: 'Red Bungalow Natural Retreat',
    lodgingTitle: 'Red Bungalow',
    lodgingSubtitle: 'Natural Retreat',
    nameTh: 'เรด บังกะโล สไตล์อีโค่ท่ามกลางสวนธรรมชาติเกาะพยาม',
    category: 'BUNGALOW',
    mainImage: `${STORAGE_ACC}/01_red_bungalow/01-Main.jpg`,
    gallery: [
      { file: '01-Main.jpg', labelEn: 'Eco Wooden Bungalow in Garden', labelTh: 'บังกะโลไม้ท่ามกลางสวนธรรมชาติ' },
      { file: '02-Bed.jpg', labelEn: 'Comfortable King Size Bed', labelTh: 'เตียงคิงไซส์แสนสบาย สไตล์ทรอปิคอล' },
      { file: '03-Bed Back.jpg', labelEn: 'Breezy & Shaded Bedroom', labelTh: 'ห้องนอนโปร่งสบาย รับลมทะเลธรรมชาติ' },
      { file: '04-Desk.jpg', labelEn: 'Wooden Desk & Chill Patio', labelTh: 'มุมพักผ่อนและโต๊ะทำงานไม้ธรรมชาติ' },
      { file: '05-Desk2.jpg', labelEn: 'Private Shaded Veranda with Sea Breeze', labelTh: 'ระเบียงส่วนตัวสัมผัสธรรมชาติเกาะพยาม' }
    ]
  },
  {
    id: 'yellow-bungalow',
    motherId: 293957,
    folder: '03_yellow_bungalow',
    nameEn: 'Yellow Bungalow Private Oasis',
    lodgingTitle: 'Yellow Bungalow',
    lodgingSubtitle: 'Private Oasis',
    nameTh: 'เยลโล่ว์ บังกะโล ระเบียงเปลญวนส่วนตัวท่ามกลางแมกไม้',
    category: 'BUNGALOW',
    mainImage: `${STORAGE_ACC}/03_yellow_bungalow/01-Main.jpg`,
    gallery: [
      { file: '01-Main.jpg', labelEn: 'Bungalow with Hammock Veranda', labelTh: 'บังกะโลพร้อมระเบียงเปลญวนส่วนตัว' },
      { file: '02-Bed.jpg', labelEn: 'Romantic King Bedroom Under Palms', labelTh: 'ห้องนอนคิงไซส์อบอุ่นใต้ร่มเงาไม้' },
      { file: '06-Living_Room.jpg', labelEn: 'Cozy Living Area & Bamboo Accents', labelTh: 'ห้องนั่งเล่นตกแต่งด้วยไม้ไผ่ธรรมชาติ' },
      { file: '04-Desk.jpg', labelEn: 'Work & Relax Tropical Corner', labelTh: 'มุมโต๊ะทำงานและพักผ่อนรับลมธรรมชาติ' },
      { file: '07-Kitchen.jpg', labelEn: 'Private Outdoor Tropical Kitchen', labelTh: 'มุมครัวและกาแฟส่วนตัวรับลมธรรมชาติ' }
    ]
  },
  {
    id: 'jungle-villa',
    motherId: 529773,
    folder: '44_jungle_villa',
    nameEn: 'Jungle Villa Tropical Sanctuary',
    lodgingTitle: 'Jungle Villa',
    lodgingSubtitle: 'Tropical Sanctuary',
    nameTh: 'จังเกิ้ลวิลล่า ท่ามกลางสวนธรรมชาติทรอปิคอล เกาะพยาม',
    category: 'VILLE',
    mainImage: `${STORAGE_ACC}/44_jungle_villa/01-Main.jpg`,
    gallery: [
      { file: '01-Main.jpg', labelEn: 'Grand Jungle Villa in Lush Nature', labelTh: 'วิลล่าธรรมชาติขนาดใหญ่ท่ามกลางป่าเขตร้อน' },
      { file: '08-Bedroom.jpg', labelEn: 'Spacious Master Bedroom Sanctuary', labelTh: 'ห้องนอนใหญ่โอ่โถง โปร่งสบาย' },
      { file: '06-Living.jpg', labelEn: 'Wide Open-Air Living Deck', labelTh: 'ระเบียงนั่งเล่นขนาดใหญ่กลางธรรมชาติ' },
      { file: '05-View.jpg', labelEn: 'Panoramic Tropical Forest View', labelTh: 'วิวสวนป่าธรรมชาติและเสียงนกร้อง' },
      { file: '07-Living2.jpg', labelEn: 'Tropical Canopy Relax Lounge', labelTh: 'มุมโซฟาพักผ่อนมองเห็นยอดไม้เขียวขจี' }
    ]
  },
  {
    id: 'peace-and-love-villa',
    motherId: 494840,
    folder: '41_peace_and_love_villa',
    nameEn: 'Peace & Love Villa Poolside Oasis',
    lodgingTitle: 'Peace & Love Villa',
    lodgingSubtitle: 'Poolside Oasis',
    nameTh: 'พีซ แอนด์ เลิฟ วิลล่า บรรยากาศริมสระว่ายน้ำเกาะพยาม',
    category: 'VILLE',
    mainImage: `${STORAGE_ACC}/41_peace_and_love_villa/01-Main.jpg`,
    gallery: [
      { file: '01-Main.jpg', labelEn: 'Charming Wooden Villa by Pool', labelTh: 'วิลล่าไม้บรรยากาศอบอุ่นริมสระว่ายน้ำ' },
      { file: '06-Bed.jpg', labelEn: 'Romantic King Bedroom with Organic Accents', labelTh: 'ห้องนอนเตียงคิงไซส์ ตกแต่งสไตล์ธรรมชาติ' },
      { file: '03-Balcony.jpg', labelEn: 'Spacious Wooden Balcony for Breezy Sips', labelTh: 'ระเบียงไม้กว้างขวางสำหรับนั่งจิบค็อกเทล' },
      { file: '05-Kitcken.jpg', labelEn: 'Open Kitchen & Coffee Corner', labelTh: 'มุมครัวและชงกาแฟส่วนตัว' },
      { file: '07-Bedroom.jpg', labelEn: 'Second Garden Bedroom Sanctuary', labelTh: 'ห้องนอนโปร่งสบายมองเห็นสวนธรรมชาติ' }
    ]
  },
  {
    id: 'green-bungalow',
    motherId: 293962,
    folder: '02_green_bungalow',
    nameEn: 'Green Bungalow Tropical Hideaway',
    lodgingTitle: 'Green Bungalow',
    lodgingSubtitle: 'Tropical Hideaway',
    nameTh: 'กรีน บังกะโล สไตล์ธรรมชาติใต้ร่มเงาไม้ เกาะพยาม',
    category: 'BUNGALOW',
    mainImage: `${STORAGE_ACC}/02_green_bungalow/01-Main.jpg`,
    gallery: [
      { file: '01-Main.jpg', labelEn: 'Charming Green Wooden Bungalow', labelTh: 'บังกะโลไม้สีเขียวท่ามกลางสวน' },
      { file: '02-Bed.jpg', labelEn: 'Cozy King Size Bedroom', labelTh: 'เตียงคิงไซส์แสนสบายนุ่มอบอุ่น' },
      { file: '03-Bed_Back.jpg', labelEn: 'Tropical Breeze Bedroom View', labelTh: 'ห้องนอนโปร่งสบายสัมผัสธรรมชาติ' },
      { file: '04-Desk.jpg', labelEn: 'Wooden Work & Chill Patio', labelTh: 'มุมโต๊ะทำงานไม้และระเบียงพักผ่อน' }
    ]
  },
  {
    id: 'camel-tent',
    motherId: 293965,
    folder: '23_camel_tent',
    nameEn: 'Camel Tent Boutique Glamping',
    lodgingTitle: 'Camel Tent',
    lodgingSubtitle: 'Boutique Glamping',
    nameTh: 'คาเมลเต็นท์ แกลมปิ้งบูทีคท่ามกลางสวนทรอปิคอล',
    category: 'GLAMPING',
    mainImage: `${STORAGE_ACC}/23_camel_tent/01-Main.jpg`,
    gallery: [
      { file: '01-Main.jpg', labelEn: 'Safari Boutique Glamping in Palms', labelTh: 'เต็นท์แกลมปิ้งบูทีคใต้ร่มเงาต้นมะพร้าว' },
      { file: '02-Bed.jpg', labelEn: 'Cozy King Size Glamping Bed', labelTh: 'เตียงคิงไซส์นุ่มสบายภายในเต็นท์หรู' },
      { file: '03-Front.jpg', labelEn: 'Private Wooden Deck & Garden Path', labelTh: 'ระเบียงไม้หน้าเต็นท์ท่ามกลางธรรมชาติ' },
      { file: '04 - Front-2.jpg', labelEn: 'Tropical Veranda with Nature Breeze', labelTh: 'มุมนั่งเล่นรับลมทะเลธรรมชาติ' },
      { file: '05-Patio.jpg', labelEn: 'Chill Patio Lounge with Hammock', labelTh: 'มุมพักผ่อนส่วนตัวพร้อมเปลญวน' }
    ]
  },
  {
    id: 'lagoon-tent',
    motherId: 293955,
    folder: '22_lagoon_tent',
    nameEn: 'Lagoon Tent Glamping Sanctuary',
    lodgingTitle: 'Lagoon Tent',
    lodgingSubtitle: 'Glamping Sanctuary',
    nameTh: 'ลากูนเต็นท์ แกลมปิ้งริมน้ำบรรยากาศสุดโรแมนติก',
    category: 'GLAMPING',
    mainImage: `${STORAGE_ACC}/22_lagoon_tent/01-Main.jpg`,
    gallery: [
      { file: '01-Main.jpg', labelEn: 'Romantic Glamping Safari Tent', labelTh: 'เต็นท์แกลมปิ้งหรูใต้ร่มเงาต้นไม้' },
      { file: '02-Front2.jpg', labelEn: 'Veranda with Nature Lagoon Breeze', labelTh: 'ระเบียงรับลมธรรมชาติส่วนตัว' },
      { file: '03-Bed.jpg', labelEn: 'King Size Glamping Bed with Canopy', labelTh: 'เตียงคิงไซส์แสนสบายภายในเต็นท์' },
      { file: '04-Garden.jpg', labelEn: 'Lush Tropical Palm Garden Path', labelTh: 'ทางเดินสวนทรอปิคอลเขียวขจี' },
      { file: '05-Side.jpg', labelEn: 'Private Shaded Wooden Deck', labelTh: 'มุมนั่งเล่นส่วนตัวริมระเบียงไม้' }
    ]
  }
];

/**
 * 🏨 Helper che inietta il prezzo certificato Octorate odierno in tempo reale
 */
export function getVillageLodgingsLive() {
  return VILLAGE_LODGINGS.map(l => ({
    ...l,
    octoratePrice: getTodayOctoratePrice(l.motherId)
  }));
}

// Helper per estrarre item random da un array
function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

const FOOD_MACRO_TRAJECTORIES: AutoCutScene['trajectory'][] = [
  'food_macro_focus_lr',
  'food_macro_focus_rl'
];

const TRAJECTORIES_SEQUENCE: AutoCutScene['trajectory'][] = [
  'pan_left_zoom_in',
  'pan_right_zoom_in',
  'pan_left_zoom_out',
  'pan_right_zoom_out',
  'push_in_focal'
];

// 🚫 REGOLA FERREA SOCIAL PIZZERIA: Esclusione categorica di Bibite, Acqua, Vini e Birre
export const EXCLUDED_BEVERAGE_CATEGORY_IDS = new Set([
  'soft-drinks',
  'beers',
  'wines',
  'coffee-shop',
  'fruit-drinks'
]);

export function isExcludedBeverageCategory(catId?: string, catName?: string): boolean {
  if (catId && EXCLUDED_BEVERAGE_CATEGORY_IDS.has(catId)) return true;
  const name = (catName || '').toLowerCase();
  return (
    name.includes('drink') ||
    name.includes('water') ||
    name.includes('acqua') ||
    name.includes('bibit') ||
    name.includes('wine') ||
    name.includes('vino') ||
    name.includes('vini') ||
    name.includes('beer') ||
    name.includes('birr') ||
    name.includes('coffee') ||
    name.includes('caffè')
  );
}

// 🚫 REGOLA R1 RESTAURANT: Esclusione Categorica di TUTTE le Insalate (oltre a Bibite, Vini e Birre)
export function isExcludedSaladCategory(catId?: string, catName?: string): boolean {
  const id = (catId || '').toLowerCase();
  const name = (catName || '').toLowerCase();
  return id.includes('salad') || id.includes('insalat') || name.includes('salad') || name.includes('insalat');
}

// 🛡️ Cache in memoria degli overrides di disponibilità (id -> is_available: false significa Sold Out nel Kitchen Monitor)
export let cachedKitchenAvailability: Record<string, boolean> | null = null;

export function getKitchenAvailabilityCache(): Record<string, boolean> {
  if (cachedKitchenAvailability) return cachedKitchenAvailability;
  try {
    const local = localStorage.getItem('fp_pizza_availability_overrides');
    if (local) {
      cachedKitchenAvailability = JSON.parse(local);
      return cachedKitchenAvailability || {};
    }
  } catch (_) {}
  return {};
}

export let cachedDailySpecialsOverrides: Record<string, boolean> | null = null;

export function getCachedDailySpecialsOverrides(): Record<string, boolean> {
  if (cachedDailySpecialsOverrides) return cachedDailySpecialsOverrides;
  try {
    const local = localStorage.getItem('fp_pizza_daily_specials_overrides');
    if (local) {
      cachedDailySpecialsOverrides = JSON.parse(local);
      return cachedDailySpecialsOverrides || {};
    }
  } catch (_) {}
  return {};
}

/**
 * 👨‍🍳 Interroga live il cloud / storage dei piatti esauriti del Kitchen Monitor e Daily Specials
 */
export async function fetchLiveKitchenAvailability(): Promise<Record<string, boolean>> {
  try {
    const overrides = await fetchCloudMenuOverrides();
    if (overrides) {
      if (overrides.availability) {
        cachedKitchenAvailability = overrides.availability;
      }
      if (overrides.dailySpecials) {
        cachedDailySpecialsOverrides = overrides.dailySpecials;
      }
      return overrides.availability || {};
    }
  } catch (err) {
    console.warn('[AutoCutLabEngine] Failed to fetch live kitchen overrides, using cache:', err);
  }
  return getKitchenAvailabilityCache();
}

/**
 * ⚡ Estrae i piatti attivi nella vetrina Daily Specials
 * Solo piatti presenti in DEFAULT_SHOWCASE_IDS (non disattivati) o aggiunti in dailySpecials === true,
 * e rigorosamente DISPONIBILI nel Kitchen Monitor (Zero Sold Out).
 */
export function getLiveDailySpecialDishes(): MenuItem[] {
  const dailyOverrides = getCachedDailySpecialsOverrides();
  const availOverrides = getKitchenAvailabilityCache();

  // Lista ID ufficiali della vetrina fisica (identica a DeliveryMenu e Kitchen Monitor)
  const DEFAULT_SHOWCASE_IDS = [
    'cake-of-the-day',
    'torta-di-mele',
    'profiteroles-al-cioccolato',
    'tiramisu',
    'torta-pasqualina-agli-spinaci-e-uova',
    'baked-bolognese-lasagna'
  ];

  const itemsMap = new Map<string, MenuItem>();
  menuData.forEach(cat => {
    if (isExcludedBeverageCategory(cat.id, cat.name || (cat as any).categoryName)) return;
    cat.items?.forEach(dish => {
      if (dish.id && !itemsMap.has(dish.id)) {
        itemsMap.set(dish.id, dish);
      }
    });
  });

  const list: MenuItem[] = [];

  // 1. Controlla DEFAULT_SHOWCASE_IDS
  DEFAULT_SHOWCASE_IDS.forEach(id => {
    const dish = itemsMap.get(id);
    if (!dish) return;
    if (!dish.image || dish.image.trim() === '') return;
    if (availOverrides[id] === false || (dish as any).is_available === false) return;
    const isOverridden = dailyOverrides[id];
    const isShowcase = isOverridden !== undefined ? isOverridden === true : true;
    if (isShowcase) {
      list.push({ ...dish, isDailySpecial: true });
    }
  });

  // 2. Controlla qualsiasi altro piatto del catalogo contrassegnato con dailyOverrides[id] === true
  itemsMap.forEach((dish, id) => {
    if (DEFAULT_SHOWCASE_IDS.includes(id)) return;
    if (!dish.image || dish.image.trim() === '') return;
    if (availOverrides[id] === false || (dish as any).is_available === false) return;
    if (dailyOverrides[id] === true) {
      list.push({ ...dish, isDailySpecial: true });
    }
  });

  return list;
}

export async function fetchLiveDailySpecials(): Promise<MenuItem[]> {
  try {
    const overrides = await fetchCloudMenuOverrides();
    if (overrides) {
      if (overrides.dailySpecials) {
        cachedDailySpecialsOverrides = overrides.dailySpecials;
      }
      if (overrides.availability) {
        cachedKitchenAvailability = overrides.availability;
      }
    }
  } catch (err) {
    console.warn('[AutoCutLabEngine] Failed to fetch cloud daily specials:', err);
  }
  return getLiveDailySpecialDishes();
}

/**
 * 👨‍🍳 REGOLA FONDAMENTALE DISPONIBILITÀ KITCHEN MONITOR:
 * Un piatto culinario è ammesso nei video P1, P2, P3 e R1 SOLO se:
 * 1. Ha un'immagine valida (dish.image)
 * 2. Non è impostato su 'is_available === false' direttamente nel piatto
 * 3. Non è impostato su 'false' negli overrides del Kitchen Monitor (Sold Out / 86)
 */
export function isDishAvailableInKitchen(dish: MenuItem): boolean {
  if (!dish.image || dish.image.trim() === '') return false;
  if ((dish as any).is_available === false) return false;

  const overrides = getKitchenAvailabilityCache();
  const dishId = dish.id;
  
  if (dishId && overrides[dishId] === false) {
    return false; // Escluso categoricamente perché Sold Out nel Kitchen Monitor
  }

  // Controllo fallback su id normalizzato
  const normalizedId = (dish.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (normalizedId && overrides[normalizedId] === false) {
    return false;
  }

  return true;
}

/**
 * Filtra gli item di una categoria escludendo sia le bevande che tutti i piatti esauriti nel Kitchen Monitor
 */
export function getAvailableDishesFromCategory(items: MenuItem[]): MenuItem[] {
  return (items || []).filter(dish => isDishAvailableInKitchen(dish));
}

/**
 * 🇹🇭 Mappatura Ufficiale Categorie Culinari Bilingui (Thai & English):
 * Estrae il nome Thai da menuData o dai termini standard gastronomici
 */
export function getCategoryThaiName(catNameOrId?: string): string {
  if (!catNameOrId) return '';
  const clean = catNameOrId.replace(/^[✦⭐\s*]+/, '').trim();
  const found = menuData.find(c => 
    c.id.toLowerCase() === clean.toLowerCase() || 
    c.name.toLowerCase() === clean.toLowerCase() || 
    (c as any).categoryName?.toLowerCase() === clean.toLowerCase()
  );
  if (found?.nameTh) return found.nameTh;

  const lower = clean.toLowerCase();
  if (lower.includes('showcase')) return 'สดใหม่ในตู้โชว์วันนี้';
  if (lower.includes('traditional pizza') || lower.includes('pizza tradizionale')) return 'พิซซ่าอิตาเลียนแท้';
  if (lower.includes('pizza')) return 'พิซซ่าเตาอบหินอิตาเลียน';
  if (lower.includes('artisanal pasta') || lower.includes('pasta')) return 'พาสต้าเส้นสดทำมือ';
  if (lower.includes('appetizer') || lower.includes('antipast') || lower.includes('starter')) return 'อาหารเรียกน้ำย่อยสไตล์อิตาเลียน';
  if (lower.includes('salad') || lower.includes('insalat')) return 'สลัดสไตล์อิตาเลียน';
  if (lower.includes('focaccia') || lower.includes('bread')) return 'ฟอกาเซียและขนมปังอบสด';
  if (lower.includes('burger')) return 'เบอร์เกอร์โฮมเมด';
  if (lower.includes('dessert') || lower.includes('dolc') || lower.includes('cake')) return 'ของหวานโฮมเมดสไตล์อิตาเลียน';
  if (lower.includes('special') || lower.includes('chef')) return 'เมนูพิเศษประจำวัน';
  return 'อาหารอิตาเลียนรสเลิศ';
}

// 🍝 Categorie Ammesse Pizzeria Generali
export const ELIGIBLE_FOOD_CATEGORIES = menuData.filter(cat => 
  !isExcludedBeverageCategory(cat.id, cat.name || (cat as any).categoryName)
);

// 🍽️ Categorie Ammesse Ristorante Villaggio R1: Zero Bevande E ZERO Insalate (Solo Pizza, Pasta, Secondi, Focacce, Dessert)
export const ELIGIBLE_RESTAURANT_CATEGORIES = menuData.filter(cat => {
  const catName = cat.name || (cat as any).categoryName;
  return !isExcludedBeverageCategory(cat.id, catName) && !isExcludedSaladCategory(cat.id, catName);
});

/**
 * 🍕 Helper di Formattazione Semantica Titolo Inglese Pizzeria:
 * Spezza il titolo in 2 righe prima dei connettori logici (' WITH ', ' & ', ' AND ', ' (', ' IN ', ' ALLA ', ' ALLO ', ' AL ', ' CON ')
 * evitando categoricamente parole orfane o tagli casuali a metà frase.
 */
export function formatSemanticEnglishDishTitle(rawName: string): string {
  if (!rawName) return '';
  const trimmed = rawName.trim();
  // Se ha già un a capo esplicito (es. da menuData), preservalo pulito
  if (trimmed.includes('\n')) {
    return trimmed.split('\n').map(s => s.trim()).filter(Boolean).join('\n');
  }

  // Lista connettori prioritari
  const CONNECTORS = [
    ' WITH ',
    ' (',
    ' & ',
    ' AND ',
    ' ALLA ',
    ' ALLO ',
    " ALL' ",
    ' AGLI ',
    ' ALLE ',
    ' AL ',
    ' AI ',
    ' IN ',
    ' CON '
  ];

  const upper = trimmed.toUpperCase();
  for (const conn of CONNECTORS) {
    const idx = upper.indexOf(conn);
    // Deve trovarsi a una distanza minima dall'inizio e dalla fine
    if (idx >= 3 && (trimmed.length - idx) >= 3) {
      const part1 = trimmed.substring(0, idx).trim();
      const matchWord = trimmed.substring(idx, idx + conn.length);
      const part2 = trimmed.substring(idx + conn.length).trim();
      if (part1 && (matchWord || part2)) {
        const line2 = (matchWord.trimStart() + part2).trim();
        return `${part1}\n${line2}`;
      }
    }
  }

  // Se il testo è lungo (> 22 caratteri) e non ha connettori noti, spezza sullo spazio centrale
  if (trimmed.length > 22 && trimmed.includes(' ')) {
    const words = trimmed.split(' ');
    if (words.length >= 2) {
      const half = Math.ceil(words.length / 2);
      const part1 = words.slice(0, half).join(' ');
      const part2 = words.slice(half).join(' ');
      return `${part1}\n${part2}`;
    }
  }

  return trimmed;
}

/**
 * 🇹🇭 Helper di Formattazione Semantica Titolo Thailandese Pizzeria:
 * Spezza il titolo culinario in 2 righe nel punto esatto di transizione (es. prima di 'ซอส', 'สไตล์', 'พร้อม', ' (', 'และ', 'กับ')
 * garantendo che la base del piatto e il condimento abbiano ciascuno la propria riga senza troncare sillabe o parole.
 */
export function formatSemanticThaiDishTitle(rawNameTh: string): string {
  if (!rawNameTh) return '';
  const trimmed = rawNameTh.trim();
  // Se ha già un a capo esplicito, preservalo
  if (trimmed.includes('\n')) {
    return trimmed.split('\n').map(s => s.trim()).filter(Boolean).join('\n');
  }

  // 1. Connettori semantici tipici culinari Thai (in ordine di priorità semantica)
  const THAI_CONNECTORS = [
    'ซอส',    // Salsa / Condimento (es. ซอสครีมวอลนัท, ซอสหมึกดำ, ซอสเนื้อ, ซอสมะเขือเทศ)
    'สไตล์',  // Stile (es. สไตล์อิตาเลียน, สไตล์ลิกูเรีย)
    'พร้อม',  // Con / Servito con
    ' และ',   // E
    'และ',    // E
    ' กับ',   // Con
    'กับ'     // Con
  ];

  for (const conn of THAI_CONNECTORS) {
    const idx = trimmed.indexOf(conn);
    // Non spezzare se il connettore è proprio all'inizio
    if (idx >= 5 && (trimmed.length - idx) >= 4) {
      const part1 = trimmed.substring(0, idx).trim();
      const part2 = trimmed.substring(idx).trim();
      return `${part1}\n${part2}`;
    }
  }

  // 2. Se contiene parentesi (es. "(อัลโล สโกกลิโอ)"), spezza prima della parentesi
  const parenIdx = trimmed.indexOf('(');
  if (parenIdx >= 5) {
    const part1 = trimmed.substring(0, parenIdx).trim();
    const part2 = trimmed.substring(parenIdx).trim();
    return `${part1}\n${part2}`;
  }

  // Se contiene uno spazio e la lunghezza supera 22 caratteri
  if (trimmed.length > 22 && trimmed.includes(' ')) {
    const spaceIdx = trimmed.indexOf(' ');
    if (spaceIdx >= 5 && (trimmed.length - spaceIdx) >= 5) {
      const part1 = trimmed.substring(0, spaceIdx).trim();
      const part2 = trimmed.substring(spaceIdx).trim();
      return `${part1}\n${part2}`;
    }
  }

  return trimmed;
}

/**
 * 🏷️ Helper di Estrazione Bilingue Rigorosa Pizzeria con Taglio Semantico Intelligente:
 * Riga 1 (titlePrimary) ➔ Thailandese (TH) con taglio a senso prima di condimenti/salse
 * Riga 2 (titleSecondary) ➔ Inglese (EN) con taglio a senso prima dei connettori WITH, &, ecc. (Tassativamente MAI Italiano)
 */
export function getCleanDishTitles(dish: MenuItem): { titlePrimary: string; titleSecondary: string } {
  const rawTh = dish.nameTh || dish.name || '';
  const rawEn = dish.name || (dish as any).nameEn || '';

  const cleanTh = formatSemanticThaiDishTitle(rawTh);
  const cleanEn = formatSemanticEnglishDishTitle(rawEn);

  return {
    titlePrimary: cleanTh,
    titleSecondary: cleanEn
  };
}

/**
 * 🍕 Helper Calcolo Prezzo Piatti & Pizze:
 * Se il piatto ha le varianti per 8" e 12", restituisce entrambi i prezzi affiancati:
 * Es: '8" 120 THB • 12" 190 THB'
 * Altrimenti mostra il prezzo standard: '290 THB'
 */
export function getDishPriceInfo(dish: MenuItem): {
  priceLabel: string;
  priceValue?: number;
  pizzaSizes?: { size8Price: number; size12Price: number };
} {
  const v8 = dish.variants?.find(v => v.name.includes('8') || v.name.includes('8"'));
  const v12 = dish.variants?.find(v => v.name.includes('12') || v.name.includes('12"'));

  if (v8 && v12 && v8.price && v12.price) {
    return {
      priceLabel: `8" ${v8.price} ฿ • 12" ${v12.price} ฿`,
      priceValue: v12.price,
      pizzaSizes: {
        size8Price: v8.price,
        size12Price: v12.price
      }
    };
  }

  return {
    priceLabel: `${dish.price} ฿`,
    priceValue: dish.price
  };
}

/**
 * 🍕 P1: 1 Piatto a caso tra quelli DISPONIBILI nel Kitchen Monitor
 */
export function generateP1Test(): AutoCutTestRun {
  const allDishes: { item: MenuItem; categoryName: string }[] = [];
  ELIGIBLE_FOOD_CATEGORIES.forEach(cat => {
    const availableItems = getAvailableDishesFromCategory(cat.items);
    availableItems.forEach(dish => {
      allDishes.push({ item: dish, categoryName: cat.name || (cat as any).categoryName });
    });
  });

  // Fallback di sicurezza
  const selected = allDishes.length > 0 ? getRandomItem(allDishes) : {
    item: ELIGIBLE_FOOD_CATEGORIES[0].items[0],
    categoryName: 'Traditional Pizza'
  };

  const audio = getRandomItem(PIZZA_JINGLE_TRACKS);
  
  // 🎵 Intero brano MP3 utilizzato!
  const totalDuration = audio.duration;
  const sceneDuration = audio.p1CutDuration || 8.85;

  const { titlePrimary, titleSecondary } = getCleanDishTitles(selected.item);
  const priceInfo = getDishPriceInfo(selected.item);

  const scene: AutoCutScene = {
    imageUrl: selected.item.image,
    titlePrimary,
    titleSecondary,
    priceLabel: priceInfo.priceLabel,
    priceValue: priceInfo.priceValue,
    pizzaSizes: priceInfo.pizzaSizes,
    trajectory: 'food_macro_focus_lr',
    badgeCategory: selected.categoryName,
    badgeCategoryTh: getCategoryThaiName(selected.categoryName),
    sourceName: selected.item.name
  };

  return {
    mode: 'P1',
    modeTitle: `P1) 1 Piatto a Caso (Solo Disponibili) · Full MP3 Beat Outro (${totalDuration.toFixed(1)}s)`,
    modeDescription: `1 piatto estratto rigorosamente tra quelli DISPONIBILI nel Kitchen Monitor. Intero MP3 (${totalDuration.toFixed(1)}s), logo e QR Code nel beat finale.`,
    brand: 'pizza',
    audioTrack: {
      ...audio,
      effectiveDuration: totalDuration
    },
    scenes: [scene],
    totalDuration,
    sceneDuration
  };
}

/**
 * 🍕 P2: 3 Piatti della STESSA Categoria (Solo piatti DISPONIBILI nel Kitchen Monitor)
 */
export function generateP2Test(): AutoCutTestRun {
  // Trova categorie culinarie ammesse che contengono ALMENO 3 PIATTI ATTUALMENTE DISPONIBILI
  const categoriesWithAvailableDishes = ELIGIBLE_FOOD_CATEGORIES
    .map(cat => ({
      category: cat,
      name: cat.name || (cat as any).categoryName,
      availableItems: getAvailableDishesFromCategory(cat.items)
    }))
    .filter(c => c.availableItems.length >= 3);

  // Fallback se nessuna ha 3 disponibili
  const selectedCat = categoriesWithAvailableDishes.length > 0 
    ? getRandomItem(categoriesWithAvailableDishes)
    : {
        category: ELIGIBLE_FOOD_CATEGORIES[0],
        name: ELIGIBLE_FOOD_CATEGORIES[0].name || (ELIGIBLE_FOOD_CATEGORIES[0] as any).categoryName,
        availableItems: getAvailableDishesFromCategory(ELIGIBLE_FOOD_CATEGORIES[0].items)
      };

  const catName = selectedCat.name;
  const selectedDishes = getRandomItems(selectedCat.availableItems, Math.min(3, selectedCat.availableItems.length));
  const audio = getRandomItem(PIZZA_JINGLE_TRACKS);
  const totalDuration = audio.duration;
  const sceneDuration = totalDuration / 3;

  const scenes: AutoCutScene[] = selectedDishes.map((dish, idx) => {
    const { titlePrimary, titleSecondary } = getCleanDishTitles(dish);
    const priceInfo = getDishPriceInfo(dish);
    return {
      imageUrl: dish.image,
      titlePrimary,
      titleSecondary,
      priceLabel: priceInfo.priceLabel,
      priceValue: priceInfo.priceValue,
      pizzaSizes: priceInfo.pizzaSizes,
      trajectory: FOOD_MACRO_TRAJECTORIES[idx % FOOD_MACRO_TRAJECTORIES.length],
      badgeCategory: catName,
      badgeCategoryTh: getCategoryThaiName(catName),
      sourceName: dish.name
    };
  });

  return {
    mode: 'P2',
    modeTitle: `P2) 3 Piatti Stessa Categoria (${catName} - Solo Disponibili)`,
    modeDescription: `3 piatti estratti dalla categoria "${catName}" verificati come DISPONIBILI nel Kitchen Monitor (zero piatti esauriti/86).`,
    brand: 'pizza',
    audioTrack: {
      ...audio,
      effectiveDuration: totalDuration
    },
    scenes,
    totalDuration,
    sceneDuration
  };
}

/**
 * 🍕 P3: 3 Piatti di DIVERSE Categorie (Solo piatti DISPONIBILI nel Kitchen Monitor)
 */
export function generateP3Test(): AutoCutTestRun {
  // Raccoglie solo le categorie che contengono almeno 1 piatto ATTUALMENTE DISPONIBILE nel Kitchen Monitor
  const categoriesWithAvailableDishes = ELIGIBLE_FOOD_CATEGORIES
    .map(cat => ({
      category: cat,
      name: cat.name || (cat as any).categoryName,
      availableItems: getAvailableDishesFromCategory(cat.items)
    }))
    .filter(c => c.availableItems.length >= 1);

  const selectedCategories = getRandomItems(categoriesWithAvailableDishes, Math.min(3, categoriesWithAvailableDishes.length));
  const selectedDishes: { dish: MenuItem; catName: string }[] = selectedCategories.map(c => ({
    dish: getRandomItem(c.availableItems),
    catName: c.name
  }));

  const audio = getRandomItem(PIZZA_JINGLE_TRACKS);
  const totalDuration = audio.duration;
  const sceneDuration = totalDuration / (selectedDishes.length || 1);

  const scenes: AutoCutScene[] = selectedDishes.map((entry, idx) => {
    const { titlePrimary, titleSecondary } = getCleanDishTitles(entry.dish);
    const priceInfo = getDishPriceInfo(entry.dish);
    return {
      imageUrl: entry.dish.image,
      titlePrimary,
      titleSecondary,
      priceLabel: priceInfo.priceLabel,
      priceValue: priceInfo.priceValue,
      pizzaSizes: priceInfo.pizzaSizes,
      trajectory: FOOD_MACRO_TRAJECTORIES[idx % FOOD_MACRO_TRAJECTORIES.length],
      badgeCategory: entry.catName,
      badgeCategoryTh: getCategoryThaiName(entry.catName),
      sourceName: entry.dish.name
    };
  });

  const catNames = selectedDishes.map(d => d.catName).join(' · ');

  return {
    mode: 'P3',
    modeTitle: 'P3) 3 Piatti di Diverse Categorie (Solo Disponibili)',
    modeDescription: `3 piatti estratti da 3 categorie differenti (${catNames}), rigorosamente verificati come DISPONIBILI nel Kitchen Monitor.`,
    brand: 'pizza',
    audioTrack: {
      ...audio,
      effectiveDuration: totalDuration
    },
    scenes,
    totalDuration,
    sceneDuration
  };
}

/**
 * 🌴 V1: 1 Foto Principale di 1 Alloggio · MP3 max 8 secondi
 */
export function generateV1Test(): AutoCutTestRun {
  const lodgings = getVillageLodgingsLive();
  const lodging = getRandomItem(lodgings);
  const audio = getRandomItem(VILLAGE_AUDIO_TRACKS_LAB);
  const effectiveDuration = Math.min(8.0, audio.duration);

  // Prezzo Octorate reale odierno verificato dalla matrice stagionale
  const priceLabel = `Last Minute Price: ${lodging.octoratePrice.toLocaleString('en-US')} ฿`;

  const scene: AutoCutScene = {
    imageUrl: lodging.mainImage,
    titlePrimary: lodging.nameEn,
    titleSecondary: lodging.nameTh, // Traduzione secca in Thai
    lodgingTitle: lodging.lodgingTitle,
    lodgingSubtitle: lodging.lodgingSubtitle,
    priceLabel,
    priceValue: lodging.octoratePrice,
    trajectory: 'pan_left_zoom_in',
    badgeCategory: lodging.category,
    sourceName: lodging.nameEn
  };

  return {
    mode: 'V1',
    modeTitle: 'V1) 1 Alloggio (Foto Principale) · Max 8 Secondi',
    modeDescription: `Foto principale di "${lodging.nameEn}" con audio Koh Phayam limitato a massimo 8 secondi con dissolvenza.`,
    brand: 'village',
    audioTrack: {
      ...audio,
      effectiveDuration
    },
    scenes: [scene],
    totalDuration: effectiveDuration,
    sceneDuration: effectiveDuration
  };
}

/**
 * 🌴 V2: 5 Foto della Galleria dello STESSO Alloggio · Durata Intero MP3
 */
export function generateV2Test(): AutoCutTestRun {
  const lodgings = getVillageLodgingsLive();
  const lodging = getRandomItem(lodgings);
  const audio = getRandomItem(VILLAGE_AUDIO_TRACKS_LAB);
  const totalDuration = audio.duration;
  const sceneDuration = totalDuration / 5;

  const priceLabel = `Last Minute Price: ${lodging.octoratePrice.toLocaleString('en-US')} ฿`;

  // 🛡️ Filtro rigoroso: solo foto pulite dello STESSO alloggio, categoricamente ZERO bagni
  const purePhotos = lodging.gallery.filter(photo => !isBathroomPhoto(photo.file)).slice(0, 5);

  const scenes: AutoCutScene[] = purePhotos.map((photo, idx) => ({
    imageUrl: `${STORAGE_ACC}/${lodging.folder}/${photo.file}`,
    titlePrimary: lodging.nameEn,
    titleSecondary: photo.labelTh, // 🇹🇭 Traduzione secca in Thai (ZERO riscrittura dell'inglese prima!)
    lodgingTitle: lodging.lodgingTitle,
    lodgingSubtitle: lodging.lodgingSubtitle,
    priceLabel,
    priceValue: lodging.octoratePrice,
    trajectory: TRAJECTORIES_SEQUENCE[idx % TRAJECTORIES_SEQUENCE.length],
    badgeCategory: lodging.category,
    sourceName: photo.labelEn
  }));

  return {
    mode: 'V2',
    modeTitle: `V2) 5 Foto Stesso Alloggio (${lodging.nameEn})`,
    modeDescription: `Sequenza di 5 foto dello STESSO alloggio "${lodging.nameEn}" (camere, saloni, terrazze; zero bagni). Durata intero MP3 (${totalDuration.toFixed(1)}s, ~${sceneDuration.toFixed(1)}s per foto).`,
    brand: 'village',
    audioTrack: {
      ...audio,
      effectiveDuration: totalDuration
    },
    scenes,
    totalDuration,
    sceneDuration
  };
}

/**
 * 🌴 V3: 5 Foto Principali di 5 DIVERSI Alloggi · Durata Intero MP3
 */
export function generateV3Test(): AutoCutTestRun {
  const lodgings = getRandomItems(getVillageLodgingsLive(), 5);
  const audio = getRandomItem(VILLAGE_AUDIO_TRACKS_LAB);
  const totalDuration = audio.duration;
  const sceneDuration = totalDuration / 5;

  // 🛡️ Filtro rigoroso: solo foto principali esterne/camere di 5 alloggi diversi (zero bagni)
  const scenes: AutoCutScene[] = lodgings
    .filter(l => !isBathroomPhoto(l.mainImage))
    .map((lodging, idx) => ({
      imageUrl: lodging.mainImage,
      titlePrimary: lodging.nameEn,
      titleSecondary: lodging.nameTh, // 🇹🇭 Traduzione secca in Thai
      lodgingTitle: lodging.lodgingTitle,
      lodgingSubtitle: lodging.lodgingSubtitle,
      priceLabel: `Last Minute Price: ${lodging.octoratePrice.toLocaleString('en-US')} ฿`,
      priceValue: lodging.octoratePrice,
      trajectory: TRAJECTORIES_SEQUENCE[idx % TRAJECTORIES_SEQUENCE.length],
      badgeCategory: lodging.category,
      sourceName: lodging.nameEn
    }));

  return {
    mode: 'V3',
    modeTitle: 'V3) 5 Foto Principali di 5 Diversi Alloggi',
    modeDescription: `Panoramica dei 5 alloggi del resort a Koh Phayam. Durata intero MP3 (${totalDuration.toFixed(1)}s, ~${sceneDuration.toFixed(1)}s a foto).`,
    brand: 'village',
    audioTrack: {
      ...audio,
      effectiveDuration: totalDuration
    },
    scenes,
    totalDuration,
    sceneDuration
  };
}

/**
 * 🍽️ R1: Stories Restaurant (5 Piatti Culinari Iconici · Koh Phayam Restaurant & Delivery)
 * Zero Bibite, Zero Vini, Zero Birre E ZERO Insalate. Solo autentica cucina calda (Pizze, Paste, Secondi, Dessert).
 */
export function generateR1Test(): AutoCutTestRun {
  const eligibleCategories = ELIGIBLE_RESTAURANT_CATEGORIES.filter(cat => 
    Array.isArray(cat.items) && cat.items.some(item => !!item.image)
  );

  // Raccoglie tutti i piatti validi con immagine e rigorosamente DISPONIBILI nel Kitchen Monitor
  const allEligibleDishes: { dish: MenuItem; catName: string }[] = [];
  eligibleCategories.forEach(cat => {
    const catName = cat.name || (cat as any).categoryName || 'RESTAURANT SPECIAL';
    const availableItems = getAvailableDishesFromCategory(cat.items);
    availableItems.forEach(dish => {
      if (dish.price) {
        allEligibleDishes.push({ dish, catName });
      }
    });
  });

  // Seleziona 5 piatti ben assortiti
  const selectedDishes = getRandomItems(allEligibleDishes, Math.min(5, allEligibleDishes.length));
  const audio = getRandomItem(VILLAGE_AUDIO_TRACKS_LAB);
  const totalDuration = audio.duration;
  const sceneDuration = totalDuration / 5;

  const scenes: AutoCutScene[] = selectedDishes.map((entry, idx) => {
    const { titlePrimary, titleSecondary } = getCleanDishTitles(entry.dish);
    // 🍕 REGOLA R1: Per le pizze si espone ESCLUSIVAMENTE la 12 pollici, senza specifica delle 8", come prezzo normale standard
    const v12 = entry.dish.variants?.find(v => v.name.includes('12') || v.name.includes('12"'));
    const singlePrice = v12?.price || entry.dish.price || 0;

    return {
      imageUrl: entry.dish.image || '',
      titlePrimary,
      titleSecondary,
      priceLabel: `${singlePrice} ฿`,
      priceValue: singlePrice,
      pizzaSizes: undefined, // Disattivato in R1: solo prezzo singolo standard
      trajectory: FOOD_MACRO_TRAJECTORIES[idx % FOOD_MACRO_TRAJECTORIES.length],
      badgeCategory: entry.catName,
      badgeCategoryTh: getCategoryThaiName(entry.catName),
      sourceName: entry.dish.name
    };
  });

  return {
    mode: 'R1',
    modeTitle: 'R1) Stories Restaurant (5 Piatti + WhatsApp Delivery)',
    modeDescription: '5 piatti iconici del Ristorante Flower Power a Koh Phayam (Pizze artigianali, Paste, Secondi caldi, Focacce, Dessert; zero bevande, zero insalate). Banner con WhatsApp Delivery +66 095 882 5573.',
    brand: 'village',
    audioTrack: {
      ...audio,
      effectiveDuration: totalDuration
    },
    scenes,
    totalDuration,
    sceneDuration
  };
}

export interface LiveLastMinuteRoomEntry {
  lodging: typeof VILLAGE_LODGINGS[0];
  livePrice: number;
  availability: number;
}

// 🛡️ Cache in memoria degli alloggi verificati in tempo reale su Octorate
export let cachedLiveLastMinuteRooms: LiveLastMinuteRoomEntry[] | null = null;

/**
 * 🏨 REGOLA 11 AGENTS.MD (IMPRESCINDIBILE ED IMMODIFICABILE):
 * Interroga il Calendario Live di Flower Power Village (/api/octorate-grid) per la data odierna.
 * Filtra SOLO gli alloggi APERTI E LIBERI OGGI (availability > 0, stopSells !== true, bookable === true).
 * Estrae il PREZZO FINALE SCONTATO A CASCATA ATTIVO SUL CALENDARIO (es. Green: 711 THB, Camel: 387 THB, Lagoon: 387 THB).
 */
export async function fetchLiveLastMinuteRooms(): Promise<LiveLastMinuteRoomEntry[]> {
  try {
    const today = new Date().toISOString().substring(0, 10);
    const res = await fetch(`/api/octorate-grid?dateFrom=${today}&dateTo=${today}`);
    if (!res.ok) throw new Error(`Octorate grid HTTP ${res.status}`);

    const payload = await res.json();
    const items = payload && Array.isArray(payload.grid) && payload.grid.length > 0
      ? payload.grid
      : (payload && payload.data && Array.isArray(payload.data) ? payload.data : []);

    const verifiedRooms: LiveLastMinuteRoomEntry[] = [];

    VILLAGE_LODGINGS.forEach(lodging => {
      const matched = items.find((it: any) => {
        const idNum = Number(it.id || it.motherRateId || it.ratePlanId || 0);
        return idNum === lodging.motherId;
      });

      if (matched && Array.isArray(matched.days)) {
        const todayDay = matched.days.find((d: any) => {
          const dStr = String(d.date || d.dateStr || '').substring(0, 10);
          return dStr === today;
        });

        if (todayDay && todayDay.availability > 0 && todayDay.bookable !== false && todayDay.stopSells !== true) {
          const price = Number(todayDay.price || todayDay.value || todayDay.amount || 0);
          if (price > 0) {
            verifiedRooms.push({
              lodging,
              livePrice: price,
              availability: todayDay.availability
            });
          }
        }
      }
    });

    if (verifiedRooms.length > 0) {
      cachedLiveLastMinuteRooms = verifiedRooms;
      return verifiedRooms;
    }
  } catch (err) {
    console.warn('[LM1 Live Fetch] Errore fetch grid, utilizzo baseline certificata odierna:', err);
  }

  // Fallback certificato del Calendario Octorate di oggi (Green 711 ฿, Camel 387 ฿, Lagoon 387 ฿)
  const green = VILLAGE_LODGINGS.find(l => l.id === 'green-bungalow')!;
  const camel = VILLAGE_LODGINGS.find(l => l.id === 'camel-tent')!;
  const lagoon = VILLAGE_LODGINGS.find(l => l.id === 'lagoon-tent')!;

  cachedLiveLastMinuteRooms = [
    { lodging: green, livePrice: 711, availability: 1 },
    { lodging: camel, livePrice: 387, availability: 1 },
    { lodging: lagoon, livePrice: 387, availability: 1 }
  ];
  return cachedLiveLastMinuteRooms;
}

/**
 * 🔥 LM1: Stories Last Minute (Alloggi Disponibili Oggi con Prezzo Reale Scontato a Cascata dal Calendario)
 */
export function generateLM1Test(customRooms?: LiveLastMinuteRoomEntry[]): AutoCutTestRun {
  const green = VILLAGE_LODGINGS.find(l => l.id === 'green-bungalow')!;
  const camel = VILLAGE_LODGINGS.find(l => l.id === 'camel-tent')!;
  const lagoon = VILLAGE_LODGINGS.find(l => l.id === 'lagoon-tent')!;

  const defaultRooms: LiveLastMinuteRoomEntry[] = [
    { lodging: green, livePrice: 711, availability: 1 },
    { lodging: camel, livePrice: 387, availability: 1 },
    { lodging: lagoon, livePrice: 387, availability: 1 }
  ];

  const rooms = (customRooms && customRooms.length > 0)
    ? customRooms
    : (cachedLiveLastMinuteRooms && cachedLiveLastMinuteRooms.length > 0)
      ? cachedLiveLastMinuteRooms
      : defaultRooms;

  const audio = getRandomItem(VILLAGE_AUDIO_TRACKS_LAB);
  const totalDuration = audio.duration;
  const sceneDuration = totalDuration / rooms.length;

  const scenes: AutoCutScene[] = rooms.map((entry, idx) => ({
    imageUrl: entry.lodging.mainImage,
    titlePrimary: entry.lodging.nameEn,
    titleSecondary: entry.lodging.nameTh, // Traduzione secca in Thai
    lodgingTitle: entry.lodging.lodgingTitle,
    lodgingSubtitle: entry.lodging.lodgingSubtitle,
    priceLabel: `Last Minute: ${entry.livePrice.toLocaleString('en-US')} ฿`,
    priceValue: entry.livePrice,
    trajectory: TRAJECTORIES_SEQUENCE[idx % TRAJECTORIES_SEQUENCE.length],
    badgeCategory: '🔥 AVAILABLE TONIGHT · ว่างวันนี้',
    sourceName: entry.lodging.nameEn
  }));

  const roomNames = rooms.map(r => `${r.lodging.nameEn} (${r.livePrice}฿)`).join(' · ');

  return {
    mode: 'LM1',
    modeTitle: 'LM1) Stories Last Minute (Alloggi Liberi Oggi & Prezzo a Cascata Octorate)',
    modeDescription: `Disponibilità reale certificata dal Calendario Octorate di oggi: ${roomNames}. Prezzo finale con sconti a cascata attivi.`,
    brand: 'village',
    audioTrack: {
      ...audio,
      effectiveDuration: totalDuration
    },
    scenes,
    totalDuration,
    sceneDuration
  };
}

/**
 * ⚡ DS: Daily Special (Fuori Menu del Giorno · Piatto Fresco in Pronta Consegna)
 * All'interno di questa sezione, solo se ci saranno dei prodotti inseriti all'interno della vetrina,
 * allora verrà generato un video con tutti i banner rivolti al fatto che è un piatto fresco,
 * appena pronto, appena fatto e in pronta consegna rapida a Ranong.
 */
export function generateDSTest(customDishes?: MenuItem[]): AutoCutTestRun {
  const liveShowcaseDishes = (customDishes !== undefined)
    ? customDishes
    : getLiveDailySpecialDishes();

  // Recupera tutti i piatti disponibili della categoria Daily Specials dal catalogo ufficiale
  const dailyCat = menuData.find(c => c.id === 'daily-specials');
  const allDailyDishes = getAvailableDishesFromCategory(dailyCat ? dailyCat.items : []);

  // Selezione dell'UNICO piatto Hero per DS:
  // 1. Se presente in vetrina nel Kitchen Monitor: il primo piatto in vetrina (es. Ravioli al Sugo di Noci!)
  // 2. Altrimenti: il primo piatto disponibile della categoria Daily Specials dello chef
  let heroDish: MenuItem | undefined;
  let isFromShowcase = false;

  if (liveShowcaseDishes && liveShowcaseDishes.length > 0) {
    heroDish = liveShowcaseDishes[0];
    isFromShowcase = true;
  } else if (allDailyDishes && allDailyDishes.length > 0) {
    heroDish = allDailyDishes[0];
    isFromShowcase = false;
  }

  const audio = getRandomItem(PIZZA_JINGLE_TRACKS);
  const totalDuration = audio.duration;
  const sceneDuration = audio.p1CutDuration || 8.85;

  if (!heroDish) {
    return {
      mode: 'DS',
      modeTitle: 'DS) Daily Special · Nessun Piatto Disponibile',
      modeDescription: 'Nessun piatto speciale inserito oggi nella vetrina Daily Specials o nei fuori menu dello chef.',
      brand: 'pizza',
      audioTrack: {
        ...audio,
        effectiveDuration: totalDuration
      },
      scenes: [],
      totalDuration: 5.0,
      sceneDuration: 5.0,
      isEmptyShowcase: true
    };
  }

  const { titlePrimary, titleSecondary } = getCleanDishTitles(heroDish);
  const priceInfo = getDishPriceInfo(heroDish);

  const scene: AutoCutScene = {
    imageUrl: heroDish.image,
    titlePrimary,
    titleSecondary,
    priceLabel: priceInfo.priceLabel,
    priceValue: priceInfo.priceValue,
    pizzaSizes: priceInfo.pizzaSizes,
    trajectory: 'food_macro_focus_lr',
    badgeCategory: isFromShowcase
      ? 'FRESH IN SHOWCASE TODAY'
      : 'DAILY SPECIAL',
    badgeCategoryTh: isFromShowcase
      ? 'สดใหม่ในตู้โชว์วันนี้'
      : 'เมนูพิเศษวันนี้',
    sourceName: heroDish.name,
    duration: sceneDuration,
    isLiveShowcase: isFromShowcase
  };

  return {
    mode: 'DS',
    modeTitle: `DS) Daily Special · 1 Piatto Hero (${isFromShowcase ? 'Vetrina Live' : 'Special dello Chef'}) · Full MP3`,
    modeDescription: `Commercial fuori menu dedicato a ${heroDish.name}. Appena preparato e in pronta consegna a Ranong con QR Code a tempo di musica.`,
    brand: 'pizza',
    audioTrack: {
      ...audio,
      effectiveDuration: totalDuration
    },
    scenes: [scene],
    totalDuration,
    sceneDuration,
    isEmptyShowcase: false
  };
}

/**
 * Genera il test specificato per la modalità richiesta
 */
export function generateAutoCutTestByMode(mode: AutoCutLabMode): AutoCutTestRun {
  switch (mode) {
    case 'P1': return generateP1Test();
    case 'P2': return generateP2Test();
    case 'P3': return generateP3Test();
    case 'DS': return generateDSTest();
    case 'V1': return generateV1Test();
    case 'V2': return generateV2Test();
    case 'V3': return generateV3Test();
    case 'R1': return generateR1Test();
    case 'LM1': return generateLM1Test();
  }
}
