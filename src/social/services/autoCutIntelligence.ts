import { JINGLE_TRACKS, VILLAGE_AUDIO_TRACKS } from '../components/VisualMotionStudio';

export interface AutoCutSlide {
  imageUrl: string;
  labelTh: string;
  labelEn: string;
  badge?: string;
  price?: number;
  trajectory: 'pan_left_to_right' | 'pan_right_to_left' | 'diagonal_up_right' | 'diagonal_up_left' | 'push_in_focal';
}

export interface AutoCutConcept {
  id: string;
  brand: 'pizza' | 'village';
  titleTh: string;
  titleEn: string;
  conceptName: string;
  category: string;
  descriptionTh: string;
  descriptionEn: string;
  audioTrackId: string;
  audioTrackName: string;
  audioTrackSrc: string;
  audioDuration: string;
  slides: AutoCutSlide[];
  tags: string[];
}

const STORAGE_ACC = 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/accommodations';
const STORAGE_FOOD = 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food';

/**
 * 🌺 CONCETTI INTELLIGENTI VILLAGGIO KOH PHAYAM
 * Ciascun alloggio ha il proprio montaggio completo a 5 foto reali riprese dal sito:
 * 1. Esterno immerso nel verde
 * 2. Letto king size & camera
 * 3. Altra angolazione / salotto
 * 4. Veranda / patio con amaca
 * 5. Bagno tropicale o vista giardino
 */
export const VILLAGE_AUTOCUT_CONCEPTS: AutoCutConcept[] = [
  {
    id: 'village-red-bungalow',
    brand: 'village',
    titleTh: 'เรด บังกะโล สไตล์อีโค่ท่ามกลางสวนธรรมชาติเกาะพยาม',
    titleEn: 'Red Bungalow | Tropical Wooden Oasis Koh Phayam',
    conceptName: 'Red Bungalow Natural Retreat',
    category: 'BUNGALOW',
    descriptionTh: 'บังกะโลไม้ธรรมชาติดีไซน์อบอุ่น ระเบียงนั่งเล่นส่วนตัว สัมผัสความสงบและร่มรื่นของเกาะพยาม นอนฟังเสียงคลื่นและลมทะเลเบาๆ 🌿',
    descriptionEn: 'Cozy eco-bungalow surrounded by organic gardens, hammock veranda, and refreshing sea breeze. Wake up to pure island peace at Flower Power Village! 🏝️',
    audioTrackId: 'village_02',
    audioTrackName: 'Island Funk Groove (Tropical Funk Pop)',
    audioTrackSrc: '/audio/village/02%20Flower%20Power%20Village%20-%20Island%20Funk%20Groove%20(Tropical%20Funk%20Pop).mp3',
    audioDuration: '31.0s',
    tags: ['#KohPhayam', '#RedBungalow', '#EcoResortThailand', '#IslandLife', '#RanongTravel'],
    slides: [
      {
        imageUrl: `${STORAGE_ACC}/01_red_bungalow/01-Main.jpg`,
        labelTh: 'บังกะโลไม้ท่ามกลางสวนธรรมชาติ',
        labelEn: 'Eco-Chic Wooden Bungalow in Lush Garden',
        badge: 'TROPICAL OASIS',
        price: 1800,
        trajectory: 'pan_left_to_right'
      },
      {
        imageUrl: `${STORAGE_ACC}/01_red_bungalow/02-Bed.jpg`,
        labelTh: 'เตียงคิงไซส์แสนสบาย สไตล์ทรอปิคอล',
        labelEn: 'Comfortable King Size Bed & Natural Wood',
        badge: 'COZY INTERIOR',
        price: 1800,
        trajectory: 'diagonal_up_right'
      },
      {
        imageUrl: `${STORAGE_ACC}/01_red_bungalow/03-Bed%20Back.jpg`,
        labelTh: 'ห้องนอนโปร่งสบาย รับลมทะเลธรรมชาติ',
        labelEn: 'Breezy & Shaded Bedroom Sanctuary',
        badge: 'PURE SERENITY',
        price: 1800,
        trajectory: 'pan_right_to_left'
      },
      {
        imageUrl: `${STORAGE_ACC}/01_red_bungalow/04-Desk.jpg`,
        labelTh: 'มุมพักผ่อนและโต๊ะทำงานไม้ธรรมชาติ',
        labelEn: 'Natural Wooden Desk & Relax Corner',
        badge: 'WORK & CHILL',
        price: 1800,
        trajectory: 'diagonal_up_left'
      },
      {
        imageUrl: `${STORAGE_ACC}/01_red_bungalow/05-Desk2.jpg`,
        labelTh: 'ระเบียงส่วนตัวสัมผัสธรรมชาติเกาะพยาม',
        labelEn: 'Private Shaded Veranda with Sea Breeze',
        badge: 'HAMMOCK VIBES',
        price: 1800,
        trajectory: 'push_in_focal'
      }
    ]
  },
  {
    id: 'village-penthouse-villa',
    brand: 'village',
    titleTh: 'เพนต์เฮาส์วิลล่า ดาดฟ้าชมวิวพระอาทิตย์ตกเกาะพยาม',
    titleEn: 'Villa Penthouse | Sunset Panoramic Deck Koh Phayam',
    conceptName: 'Villa Penthouse Sunset Suite',
    category: 'VILLE',
    descriptionTh: 'ดาดฟ้ากว้างชมวิวพระอาทิตย์ตกและหมู่ดาวยามค่ำคืน วิลล่า 2 ชั้นสุดเอ็กซ์คลูซีฟ พร้อมห้องนั่งเล่นและครัวส่วนตัว 🌅✨',
    descriptionEn: 'Expansive private wooden deck with panoramic sunset views, two floors of eco-luxury, private lounge and fully equipped kitchen on Koh Phayam! 🌴',
    audioTrackId: 'village_01',
    audioTrackName: 'Island Disco Paradise (Disco Funk Anni 70)',
    audioTrackSrc: '/audio/village/01%20Flower%20Power%20Village%20-%20Island%20Disco%20Paradise%20(Disco%20Funk).mp3',
    audioDuration: '25.7s',
    tags: ['#VillaPenthouse', '#KohPhayamSunset', '#EcoLuxury', '#RanongResort', '#ThailandTravel'],
    slides: [
      {
        imageUrl: `${STORAGE_ACC}/11_penthouse_villa/01-Main.jpg`,
        labelTh: 'วิลล่า 2 ชั้น ดาดฟ้าชมวิวพาโนรามา',
        labelEn: '2-Story Villa with Panoramic Sunset Deck',
        badge: 'PANORAMIC VIEW',
        price: 2400,
        trajectory: 'pan_left_to_right'
      },
      {
        imageUrl: `${STORAGE_ACC}/11_penthouse_villa/02-Table.jpg`,
        labelTh: 'โต๊ะรับประทานอาหารดาดฟ้ารับลมทะเล',
        labelEn: 'Open-Air Dining Table under the Stars',
        badge: 'SUNSET DECK',
        price: 2400,
        trajectory: 'diagonal_up_right'
      },
      {
        imageUrl: `${STORAGE_ACC}/11_penthouse_villa/05-Sofa.jpg`,
        labelTh: 'โซฟานั่งเล่นกว้างขวาง สไตล์โมเดิร์นทรอปิคอล',
        labelEn: 'Spacious Living Lounge with Garden View',
        badge: 'LIVING ROOM',
        price: 2400,
        trajectory: 'pan_right_to_left'
      },
      {
        imageUrl: `${STORAGE_ACC}/11_penthouse_villa/06-Bed1.jpg`,
        labelTh: 'ห้องนอนใหญ่เตียงคิงไซส์สุดโรแมนติก',
        labelEn: 'Master Bedroom with Romantic Island Ambience',
        badge: 'MASTER SUITE',
        price: 2400,
        trajectory: 'diagonal_up_left'
      },
      {
        imageUrl: `${STORAGE_ACC}/11_penthouse_villa/04-Kitchen%20View.jpg`,
        labelTh: 'ครัวพร้อมอุปกรณ์ครบครัน ชมวิวธรรมชาติ',
        labelEn: 'Full Kitchen with Serene Island Canopy View',
        badge: 'ECO LUXURY',
        price: 2400,
        trajectory: 'push_in_focal'
      }
    ]
  },
  {
    id: 'village-yellow-bungalow',
    brand: 'village',
    titleTh: 'เยลโล่ว์ บังกะโล ระเบียงเปลญวนส่วนตัวท่ามกลางแมกไม้',
    titleEn: 'Yellow Bungalow | Hammock Patio & Coconut Palms',
    conceptName: 'Yellow Bungalow Garden Retreat',
    category: 'BUNGALOW',
    descriptionTh: 'โอบล้อมด้วยต้นมะพร้าวและสวนดอกไม้ เดินเพียงไม่กี่นาทีถึงหาดอ่าวเขา เงียบสงบเป็นส่วนตัวพร้อมระเบียงเปลญวน 🥥🌿',
    descriptionEn: 'Surrounded by coconut palms and tropical flowers, private hammock patio, just minutes walk to untouched beaches. Pure island serenity! 🌊',
    audioTrackId: 'village_04',
    audioTrackName: 'Chill & Relax Koh Phayam (Lo-Fi Tropical Beat)',
    audioTrackSrc: '/audio/village/04%20Flower%20Power%20Village%20-%20Chill%20&%20Relax%20Koh%20Phayam%20(Lo-Fi%20Tropical%20Beat).mp3',
    audioDuration: '29.3s',
    tags: ['#YellowBungalow', '#KohPhayamChill', '#BackpackingThailand', '#EcoLodge', '#PhayamLife'],
    slides: [
      {
        imageUrl: `${STORAGE_ACC}/03_yellow_bungalow/01-Main.jpg`,
        labelTh: 'บังกะโลสีเหลืองอบอุ่นท่ามกลางทิวมะพร้าว',
        labelEn: 'Warm Yellow Bungalow Nestled in Coconut Grove',
        badge: 'PALM GROVE',
        price: 1800,
        trajectory: 'diagonal_up_right'
      },
      {
        imageUrl: `${STORAGE_ACC}/03_yellow_bungalow/02-Bed.jpg`,
        labelTh: 'เตียงคิงไซส์และเฟอร์นิเจอร์ไม้ไผ่ธรรมชาติ',
        labelEn: 'Handcrafted Bamboo Bed & Eco Comfort',
        badge: 'KING BED',
        price: 1800,
        trajectory: 'pan_left_to_right'
      },
      {
        imageUrl: `${STORAGE_ACC}/03_yellow_bungalow/04-Desk.jpg`,
        labelTh: 'มุมนั่งอ่านหนังสือและจิบกาแฟยามเช้า',
        labelEn: 'Morning Coffee Corner with Garden Views',
        badge: 'MORNING BREEZE',
        price: 1800,
        trajectory: 'pan_right_to_left'
      },
      {
        imageUrl: `${STORAGE_ACC}/03_yellow_bungalow/06-Living_Room.jpg`,
        labelTh: 'ห้องนั่งเล่นส่วนตัวเชื่อมต่อระเบียง',
        labelEn: 'Private Indoor Lounge Opening to Veranda',
        badge: 'GARDEN LIVING',
        price: 1800,
        trajectory: 'diagonal_up_left'
      },
      {
        imageUrl: `${STORAGE_ACC}/03_yellow_bungalow/05-Desk2.jpg`,
        labelTh: 'ระเบียงเปลญวนใต้ร่มเงาไม้ สบายใจที่สุด',
        labelEn: 'Hammock Siesta Patio under Island Trees',
        badge: 'CHILL OASIS',
        price: 1800,
        trajectory: 'push_in_focal'
      }
    ]
  },
  {
    id: 'village-jungle-villa',
    brand: 'village',
    titleTh: 'จังเกิ้ลวิลล่า ท่ามกลางสวนธรรมชาติทรอปิคอล เกาะพยาม',
    titleEn: 'Jungle Villa | Eco-Luxury Tropical Forest Sanctuary',
    conceptName: 'Jungle Villa Forest Haven',
    category: 'VILLE',
    descriptionTh: 'วิลล่าหลังใหญ่กลางป่าทรอปิคอลเขียวขจี ฟังเสียงนกและธรรมชาติ เหมาะสำหรับครอบครัวหรือกลุ่มเพื่อนที่ต้องการความสงบ 🌿🌺',
    descriptionEn: 'Large secluded villa enveloped in vibrant tropical jungle. Ideal for families and private retreats seeking pure unspoiled nature! 🌴',
    audioTrackId: 'village_03',
    audioTrackName: 'Peace & Love Reggae Vibes (Roots Reggae Solare)',
    audioTrackSrc: '/audio/village/03%20Flower%20Power%20Village%20-%20Peace%20&%20Love%20Reggae%20Vibes%20(Roots%20Reggae).mp3',
    audioDuration: '28.5s',
    tags: ['#JungleVilla', '#EcoLuxuryThailand', '#KohPhayamRetreat', '#NatureEscape', '#FamilyVacation'],
    slides: [
      {
        imageUrl: `${STORAGE_ACC}/44_jungle_villa/01-Main.jpg`,
        labelTh: 'วิลล่าหรูหลังใหญ่โอบล้อมด้วยป่าธรรมชาติ',
        labelEn: 'Grand Wooden Villa in Dense Tropical Canopy',
        badge: 'JUNGLE SANCTUARY',
        price: 4800,
        trajectory: 'diagonal_up_left'
      },
      {
        imageUrl: `${STORAGE_ACC}/44_jungle_villa/04-Steps.jpg`,
        labelTh: 'บันไดไม้ธรรมชาติเชื่อมต่อสวนทรอปิคอล',
        labelEn: 'Handcrafted Wooden Steps through Tropical Flora',
        badge: 'NATURE PATH',
        price: 4800,
        trajectory: 'pan_left_to_right'
      },
      {
        imageUrl: `${STORAGE_ACC}/44_jungle_villa/06-Living.jpg`,
        labelTh: 'ห้องนั่งเล่นแบบเปิดโล่ง สัมผัสสายลมธรรมชาติ',
        labelEn: 'Open-Air Living Pavilion with Forest Breeze',
        badge: 'OPEN LIVING',
        price: 4800,
        trajectory: 'diagonal_up_right'
      },
      {
        imageUrl: `${STORAGE_ACC}/44_jungle_villa/08-Bedroom.jpg`,
        labelTh: 'ห้องนอนใหญ่พร้อมวิวต้นไม้สีเขียวสบายตา',
        labelEn: 'Expansive Master Suite Surrounded by Greenery',
        badge: 'MASTER SUITE',
        price: 4800,
        trajectory: 'pan_right_to_left'
      },
      {
        imageUrl: `${STORAGE_ACC}/44_jungle_villa/05-View.jpg`,
        labelTh: 'วิวธรรมชาติอันเงียบสงบ หาที่ไหนไม่ได้อีกแล้ว',
        labelEn: 'Breathtaking Unspoiled Island Canopy Views',
        badge: 'PURE NATURE',
        price: 4800,
        trajectory: 'push_in_focal'
      }
    ]
  },
  {
    id: 'village-peace-love-villa',
    brand: 'village',
    titleTh: 'พีซ แอนด์ เลิฟ วิลล่า บรรยากาศริมสระว่ายน้ำเกาะพยาม',
    titleEn: 'Peace & Love Villa | Poolside Palms & Open-Air Living',
    conceptName: 'Peace & Love Villa Oasis',
    category: 'VILLE',
    descriptionTh: 'วิลล่าดีไซน์อบอุ่นริมสระว่ายน้ำ ระเบียงส่วนตัวใต้ร่มเงาทิวมะพร้าว ฝักบัวอาบน้ำกลางแจ้งรับลมธรรมชาติ สัมผัสความสงบที่แท้จริง 🏊‍♂️🌴',
    descriptionEn: 'Warm tropical villa steps from the pool, private palm-shaded patio, and refreshing open-air shower under the island sky! 🌺',
    audioTrackId: 'village_05',
    audioTrackName: 'Sunset Cocktail Acoustic (Chitarra Acustica Bossa)',
    audioTrackSrc: '/audio/village/05%20Flower%20Power%20Village%20-%20Sunset%20Cocktail%20Acoustic%20(Bossa%20Nova).mp3',
    audioDuration: '27.4s',
    tags: ['#PeaceAndLoveVilla', '#PoolsideResort', '#KohPhayamVibes', '#IslandGetaway', '#EcoTravel'],
    slides: [
      {
        imageUrl: `${STORAGE_ACC}/41_peace_and_love_villa/01-Main.jpg`,
        labelTh: 'วิลล่าริมสระว่ายน้ำ ใต้ร่มเงาต้นมะพร้าว',
        labelEn: 'Tropical Villa Steps from the Sparkling Pool',
        badge: 'POOLSIDE RETREAT',
        price: 2400,
        trajectory: 'pan_left_to_right'
      },
      {
        imageUrl: `${STORAGE_ACC}/41_peace_and_love_villa/02-Front.jpg`,
        labelTh: 'ทางเข้าส่วนตัวท่ามกลางสวนดอกไม้เมืองร้อน',
        labelEn: 'Private Garden Entrance with Blooming Flora',
        badge: 'TROPICAL ENTRANCE',
        price: 2400,
        trajectory: 'diagonal_up_right'
      },
      {
        imageUrl: `${STORAGE_ACC}/41_peace_and_love_villa/03-Balcony.jpg`,
        labelTh: 'ระเบียงไม้กว้างขวางสำหรับนั่งจิบค็อกเทล',
        labelEn: 'Spacious Wooden Balcony for Sunset Sips',
        badge: 'SUNSET BALCONY',
        price: 2400,
        trajectory: 'pan_right_to_left'
      },
      {
        imageUrl: `${STORAGE_ACC}/41_peace_and_love_villa/06-Bed.jpg`,
        labelTh: 'ห้องนอนเตียงคิงไซส์ ตกแต่งสไตล์ธรรมชาติ',
        labelEn: 'Romantic King Bedroom with Organic Accents',
        badge: 'ROMANTIC BED',
        price: 2400,
        trajectory: 'diagonal_up_left'
      },
      {
        imageUrl: `${STORAGE_ACC}/41_peace_and_love_villa/08-Toilet.jpg`,
        labelTh: 'ฝักบัวอาบน้ำกลางแจ้ง ใต้แสงดาวเกาะพยาม',
        labelEn: 'Open-Air Tropical Shower Under Starry Skies',
        badge: 'OPEN-AIR SHOWER',
        price: 2400,
        trajectory: 'push_in_focal'
      }
    ]
  }
];

/**
 * 🍕 CONCETTI INTELLIGENTI PIZZERIA RANONG
 * Ciascun concept culinario monta 5 piatti tematici coerenti a tempo di musica:
 * 1. Seafood Masters (Scoglio, Nero di Seppia, Crema di Gamberi, Salmone, Granchio)
 * 2. Grandi Pizze Tradizionali Italiane 48h (Margherita, Diavola, 4 Formaggi, Granchio, Rustica)
 * 3. Primi Piatti della Tradizione Italiana (Carbonara, Amatriciana, Pomodoro, Pesto, Flower Power)
 * 4. Focacce Artigianali & Pizza Sandwiches (Milanese, Finocchiona, Pancetta, Porchetta, Caprese)
 * 5. Comfort Food & Specialità Sfiziose (Cotoletta Milanese, Cotechino Purè, Torta Pasqualina, French Fries, Burger)
 */
export const PIZZA_AUTOCUT_CONCEPTS: AutoCutConcept[] = [
  {
    id: 'pizza-seafood-masters',
    brand: 'pizza',
    titleTh: 'สุดยอดพาสต้าซีฟู้ดอิตาเลียนแท้ สดจากทะเลระนอง',
    titleEn: 'Seafood Pasta Masters | Fresh Ranong Catch & Italian Recipes',
    conceptName: 'Italian Seafood Pasta Masters',
    category: 'PASTA & SEAFOOD',
    descriptionTh: 'สัมผัสรสชาติทะเลอิตาเลียนแท้ๆ ที่ระนอง! สปาเก็ตตี้อัลโลสโกกลิโอ ตัลยาเตลเล่หมึกดำ และราวิโอลีกุ้งสด วัตถุดิบนำเข้าจากอิตาลี 100% 🦐🦑🍝',
    descriptionEn: 'Authentic Italian seafood pasta in Ranong! Fresh Andaman catch paired with artisanal Italian pasta and San Marzano tomatoes. Taste the ocean! 🌊',
    audioTrackId: 'so_good',
    audioTrackName: 'So Good (Parte 2 - Taste Hook)',
    audioTrackSrc: '/audio/02-flower-power-so-good.mp3',
    audioDuration: '13.0s',
    tags: ['#RanongFood', '#SeafoodPasta', '#RanongRestaurant', '#ItalianInThailand', '#AroiRanong'],
    slides: [
      {
        imageUrl: `${STORAGE_FOOD}/02-Pasta/spaghetti-allo-scoglio.webp`,
        labelTh: 'สปาเก็ตตี้ซีฟู้ด อัลโล สโกกลิโอ สดเต็มคำ',
        labelEn: 'Spaghetti allo Scoglio with Fresh Mussels & Clams',
        badge: 'SIGNATURE SEAFOOD',
        price: 290,
        trajectory: 'pan_left_to_right'
      },
      {
        imageUrl: `${STORAGE_FOOD}/02-Pasta/tagliatelle-al-nero-di-seppia-e-calamari.webp`,
        labelTh: 'ตัลยาเตลเล่ซอสหมึกดำและปลาหมึกสด',
        labelEn: 'Black Squid Ink Tagliatelle with Tender Calamari',
        badge: 'SQUID INK PASTA',
        price: 250,
        trajectory: 'diagonal_up_right'
      },
      {
        imageUrl: `${STORAGE_FOOD}/02-Pasta/ravioli-alla-crema-di-gamberi.webp`,
        labelTh: 'ราวิโอลีโฮมเมดซอสครีมกุ้งและบิสก์หอมละมุน',
        labelEn: 'Handmade Ravioli in Rich Prawn Bisque Cream',
        badge: 'HANDMADE RAVIOLI',
        price: 300,
        trajectory: 'pan_right_to_left'
      },
      {
        imageUrl: `${STORAGE_FOOD}/02-Pasta/penne-al-salmone.webp`,
        labelTh: 'เพนเน่ซอสครีมแซลมอนนอร์เวย์นุ่มละมุน',
        labelEn: 'Penne with Norwegian Salmon Cream Sauce',
        badge: 'SALMON DELIGHT',
        price: 290,
        trajectory: 'diagonal_up_left'
      },
      {
        imageUrl: `${STORAGE_FOOD}/02-Pasta/spaghetti-alla-polpa-di-granchio.webp`,
        labelTh: 'สปาเก็ตตี้เนื้อปูม้าสดและมะเขือเทศเชอร์รี่',
        labelEn: 'Spaghetti with Real Ranong Blue Crab Meat',
        badge: 'FRESH BLUE CRAB',
        price: 320,
        trajectory: 'push_in_focal'
      }
    ]
  },
  {
    id: 'pizza-tradizionale-masters',
    brand: 'pizza',
    titleTh: 'พิซซ่าเตาฟืน แป้งหมักช้า 48 ชม. อิตาเลียนแท้ ระนอง',
    titleEn: 'Wood-Fired Pizza Masters | 48h Fermented Dough Ranong',
    conceptName: '48h Fermented Wood-Fired Pizza Masters',
    category: 'PIZZA TRADIZIONALE',
    descriptionTh: 'พิซซ่าอิตาเลียนแท้ แป้งหมักสูตรลับ 48 ชม. อบเตาฟืนไฟแรง ขอบพองกรอบนอกนุ่มใน มอสซาเรลล่าอิตาเลียนแท้เยิ้มๆ ฟินทุกคำ! 🍕🔥🤤',
    descriptionEn: 'The real Italian pizza experience in Ranong! 48h slow cold-fermented dough, bubbling volcanic stone crust, and 100% certified Italian toppings. 🇮🇹',
    audioTrackId: 'yeah',
    audioTrackName: 'Yeah! (Parte 1 - High Energy Intro)',
    audioTrackSrc: '/audio/01-flower-power-yeah.mp3',
    audioDuration: '13.0s',
    tags: ['#PizzaRanong', '#WoodFiredPizza', '#PizzaTradizionale', '#RanongDelivery', '#RanongEats'],
    slides: [
      {
        imageUrl: `${STORAGE_FOOD}/01-Pizza/02-pizza-margherita.webp`,
        labelTh: 'พิซซ่ามาร์เกริต้า แป้งหมัก 48 ชม. ชีสเยิ้ม',
        labelEn: 'Pizza Margherita Tradizionale with San Marzano & Fior di Latte',
        badge: 'ITALIAN ICON',
        price: 220,
        trajectory: 'pan_left_to_right'
      },
      {
        imageUrl: `${STORAGE_FOOD}/01-Pizza/pizza-con-polpa-di-granchio.webp`,
        labelTh: 'พิซซ่าหน้าเนื้อปูม้าสดเน้นๆ สไตล์ระนอง',
        labelEn: 'Artisanal Pizza with Fresh Blue Crab Meat',
        badge: 'SEAFOOD SPECIAL',
        price: 350,
        trajectory: 'diagonal_up_right'
      },
      {
        imageUrl: `${STORAGE_FOOD}/01-Pizza/pizza-rustica-con-salsiccia-e-stilacci.webp`,
        labelTh: 'พิซซ่ารัสติก้า ไส้กรอกอิตาเลียนและสมุนไพร',
        labelEn: 'Pizza Rustica with Italian Salsiccia & Herbs',
        badge: 'RUSTIC GOURMET',
        price: 350,
        trajectory: 'pan_right_to_left'
      },
      {
        imageUrl: `${STORAGE_FOOD}/01-Pizza/02-pizza-margherita.webp`,
        labelTh: 'อบจากเตาฟืนหอมกรุ่น ขอบพองกรอบนุ่ม',
        labelEn: 'Baked to Bubbling Perfection on Live Stone Flame',
        badge: 'WOOD-FIRED OVEN',
        price: 240,
        trajectory: 'diagonal_up_left'
      },
      {
        imageUrl: `${STORAGE_FOOD}/01-Pizza/pizza-con-polpa-di-granchio.webp`,
        labelTh: 'สั่งเดลิเวอรี่ส่งร้อนๆ ถึงบ้านคุณในระนอง',
        labelEn: 'Fast Hot Delivery Directly to Your Door in Ranong',
        badge: 'FAST DELIVERY',
        price: 290,
        trajectory: 'push_in_focal'
      }
    ]
  },
  {
    id: 'pizza-pasta-tradizione',
    brand: 'pizza',
    titleTh: 'พาสต้าเส้นสดสูตรอิตาเลียนดั้งเดิม คาร์โบนาร่า & อัลเปสโต้',
    titleEn: 'Authentic Pasta Classics | Roman Carbonara & Ligurian Walnut',
    conceptName: 'Italian Pasta Classics Tradition',
    category: 'PASTA TRADIZIONALE',
    descriptionTh: 'พาสต้าสไตล์โรมันแท้ คาร์โบนาร่าครีมไข่เข้มข้น ราวิโอลีซอสวอลนัทสูตรแคว้นลิกูเรีย ทุกจานปรุงสดใหม่จานต่อจาน อร่อยแสงออกปาก! 🍝✨',
    descriptionEn: 'True Italian comfort dining in Ranong! Savor Roman classics like Carbonara and Amatriciana, and Ligurian walnut ravioli cooked to al dente perfection. 🇮🇹',
    audioTrackId: 'aroi_mak_mak',
    audioTrackName: 'Aroi Mak Mak (Parte 4 - Viral Thai Slang)',
    audioTrackSrc: '/audio/04-flower-power-aroi-mak-mak.mp3',
    audioDuration: '13.0s',
    tags: ['#CarbonaraRanong', '#AuthenticPasta', '#RanongItalianFood', '#RanongFoodie', '#อร่อยระนอง'],
    slides: [
      {
        imageUrl: `${STORAGE_FOOD}/02-Pasta/ravioli-al-sugo-di-noci.webp`,
        labelTh: 'ราวิโอลีโฮมเมดซอสครีมวอลนัทสไตล์ลิกูเรีย',
        labelEn: 'Homemade Ravioli in Rich Ligurian Walnut Cream',
        badge: 'CHEF RECOMMENDATION',
        price: 260,
        trajectory: 'pan_left_to_right'
      },
      {
        imageUrl: `${STORAGE_FOOD}/02-Pasta/spaghetti-allo-scoglio.webp`,
        labelTh: 'สปาเก็ตตี้เส้นเหนียวนุ่ม คลุกเคล้าซอสฉ่ำๆ',
        labelEn: 'Perfect Al Dente Spaghetti in Savory Reduction',
        badge: 'AL DENTE PERFECTION',
        price: 290,
        trajectory: 'diagonal_up_right'
      },
      {
        imageUrl: `${STORAGE_FOOD}/02-Pasta/tagliatelle-al-nero-di-seppia-e-calamari.webp`,
        labelTh: 'ตัลยาเตลเล่เส้นสด โฮมเมดแท้ 100%',
        labelEn: 'Fresh Handmade Tagliatelle with Authentic Flavors',
        badge: 'FRESH PASTA',
        price: 250,
        trajectory: 'pan_right_to_left'
      },
      {
        imageUrl: `${STORAGE_FOOD}/02-Pasta/penne-al-salmone.webp`,
        labelTh: 'เพนเน่ซอสครีม แซลมอนชิ้นโตเต็มคำ',
        labelEn: 'Hearty Penne with Generous Salmon Chunks',
        badge: 'CREAMY DELIGHT',
        price: 290,
        trajectory: 'diagonal_up_left'
      },
      {
        imageUrl: `${STORAGE_FOOD}/02-Pasta/spaghetti-alla-polpa-di-granchio.webp`,
        labelTh: 'สูตรลับส่งตรงจากอิตาลี พร้อมเสิร์ฟที่ระนอง',
        labelEn: 'Century-Old Italian Recipes Served Fresh in Ranong',
        badge: 'AUTHENTIC RECIPES',
        price: 320,
        trajectory: 'push_in_focal'
      }
    ]
  },
  {
    id: 'pizza-focaccia-sandwiches',
    brand: 'pizza',
    titleTh: 'ฟอคคาเซียแซนด์วิช แป้งกรอบนอกนุ่มใน ไส้แน่นสไตล์อิตาเลียน',
    titleEn: 'Focaccia Pizza Sandwiches | Crispy Italian Street Food Ranong',
    conceptName: 'Italian Focaccia Pizza Sandwiches',
    category: 'FOCACCE & SANDWICHES',
    descriptionTh: 'ฟอคคาเซียอบสดใหม่กรอบนอกนุ่มหนึบ สอดไส้มิลานีสคัตเล็ต พอร์เคตตา ฟินอคคิโอนา และปานเชตตาม้วน วัตถุดิบนำเข้าจากอิตาลี อิ่มฟินเต็มคำ! 🥪😋',
    descriptionEn: 'Artisanal Italian Focaccia Sandwiches in Ranong! Freshly baked daily, loaded with crispy Milanese cutlet, authentic Porchetta, Finocchiona and rolled Pancetta. 🛵',
    audioTrackId: 'ranong',
    audioTrackName: 'Ranong (Parte 3 - Geo-hook Delivery)',
    audioTrackSrc: '/audio/03-flower-power-ranong.mp3',
    audioDuration: '13.0s',
    tags: ['#FocacciaSandwich', '#RanongStreetFood', '#ItalianSandwich', '#RanongLunch', '#ของกินระนอง'],
    slides: [
      {
        imageUrl: `${STORAGE_FOOD}/05-Pizza-Sandwiches/focaccia-pizza-sandwich-con-milanese.webp`,
        labelTh: 'ฟอคคาเซียพร้อมมิลานีสคัตเล็ตกรอบนอกนุ่มใน',
        labelEn: 'Focaccia Sandwich with Crispy Milanese Cutlet',
        badge: 'CRISPY MILANESE',
        price: 210,
        trajectory: 'pan_left_to_right'
      },
      {
        imageUrl: `${STORAGE_FOOD}/05-Pizza-Sandwiches/focaccia-pizza-sandwich-con-porchetta.webp`,
        labelTh: 'ฟอคคาเซียพอร์เคตตาเนื้อนุ่ม หนังกรอบหอมกรุ่น',
        labelEn: 'Focaccia with Roasted Italian Porchetta & Herbs',
        badge: 'ROASTED PORCHETTA',
        price: 210,
        trajectory: 'diagonal_up_right'
      },
      {
        imageUrl: `${STORAGE_FOOD}/05-Pizza-Sandwiches/focaccia-pizza-sandwich-con-finocchiona.webp`,
        labelTh: 'ฟอคคาเซียฟินอคคิโอนา ซาลามีทัสคานีหอมกลิ่นยี่หร่า',
        labelEn: 'Focaccia with Tuscan Finocchiona Salame',
        badge: 'TUSCAN SALAME',
        price: 190,
        trajectory: 'pan_right_to_left'
      },
      {
        imageUrl: `${STORAGE_FOOD}/05-Pizza-Sandwiches/focaccia-pizza-sandwich-con-pancetta-arrotolata.webp`,
        labelTh: 'ฟอคคาเซียปานเชตตาม้วน เครื่องเทศอิตาเลียนแท้',
        labelEn: 'Focaccia with Rolled Italian Pancetta',
        badge: 'ROLLED PANCETTA',
        price: 190,
        trajectory: 'diagonal_up_left'
      },
      {
        imageUrl: `${STORAGE_FOOD}/05-Pizza-Sandwiches/focaccia-pizza-sandwich-con-milanese.webp`,
        labelTh: 'เหมาะสำหรับมื้อเที่ยงและเดลิเวอรี่รวดเร็วในระนอง',
        labelEn: 'Perfect for Fast Gourmet Lunch Delivery in Ranong',
        badge: 'FAST LUNCH',
        price: 210,
        trajectory: 'push_in_focal'
      }
    ]
  },
  {
    id: 'pizza-specialita-sfiziose',
    brand: 'pizza',
    titleTh: 'มิลานีสคัตเล็ตกรอบฟู & เมนูสเปเชียลประจำวันสไตล์อิตาลี',
    titleEn: 'Daily Specials & Crispy Milanese Cutlet Ranong',
    conceptName: 'Italian Daily Specials & Comfort Food',
    category: 'DAILY SPECIALS',
    descriptionTh: 'เมนูพิเศษประจำวัน! มิลานีสคัตเล็ตหมูชุบเกล็ดขนมปังทอดพร้อมเฟรนช์ฟรายส์กรอบๆ โคเตคิโนโบราณพร้อมมันบดเนียนนุ่ม และตอร์ตาปาสควาลินา อร่อยไม่ซ้ำใคร! 🍽️✨',
    descriptionEn: 'Crispy Milanese Cutlet with Golden Fries, Artisanal Italian Cotechino, and Homemade Torta Pasqualina. Discover authentic regional Italian specialties in Ranong! 🇮🇹',
    audioTrackId: 'full',
    audioTrackName: 'Full Jingle (Completa - Signature Sound)',
    audioTrackSrc: '/audio/00-flower-power-jingle-full.mp3',
    audioDuration: '27.8s',
    tags: ['#CotolettaMilanese', '#DailySpecialsRanong', '#RanongDining', '#ItalianComfortFood', '#RanongFoodie'],
    slides: [
      {
        imageUrl: `${STORAGE_FOOD}/03-Daily-Specials/cotoletta-alla-milanese-con-patatine-fritte.webp`,
        labelTh: 'มิลานีสคัตเล็ตหมูชุบเกล็ดขนมปังทอดกรอบฟู',
        labelEn: 'Crispy Milanese Cutlet with Golden French Fries',
        badge: 'CRISPY MILANESE',
        price: 220,
        trajectory: 'pan_left_to_right'
      },
      {
        imageUrl: `${STORAGE_FOOD}/03-Daily-Specials/cotechino-artigianale-con-pure-di-patate.webp`,
        labelTh: 'ไส้กรอกโคเตคิโนอิตาเลียนโบราณพร้อมมันบดเนียนนุ่ม',
        labelEn: 'Artisanal Italian Cotechino with Velvety Mash',
        badge: 'CLASSIC COTECHINO',
        price: 250,
        trajectory: 'diagonal_up_right'
      },
      {
        imageUrl: `${STORAGE_FOOD}/07-French-Fries/torta-pasqualina-agli-spinaci-e-uova.webp`,
        labelTh: 'ตอร์ตา ปาสควาลินา ไส้ผักโขม ริคอตต้า และไข่ต้ม',
        labelEn: 'Torta Pasqualina with Spinach, Ricotta & Eggs',
        badge: 'TORTA PASQUALINA',
        price: 180,
        trajectory: 'pan_right_to_left'
      },
      {
        imageUrl: `${STORAGE_FOOD}/03-Daily-Specials/cotoletta-alla-milanese-con-patatine-fritte.webp`,
        labelTh: 'เสิร์ฟร้อนๆ ในสวนทรอปิคอลพร้อมน้ำตกธรรมชาติ',
        labelEn: 'Dine by the Natural Waterfall in Tropical Gardens',
        badge: 'WATERFALL GARDEN',
        price: 220,
        trajectory: 'diagonal_up_left'
      },
      {
        imageUrl: `${STORAGE_FOOD}/03-Daily-Specials/cotechino-artigianale-con-pure-di-patate.webp`,
        labelTh: 'สั่งจองโต๊ะหรือสั่งเดลิเวอรี่ได้เลยวันนี้!',
        labelEn: 'Book a Table or Order Fast Delivery Online Today!',
        badge: 'ORDER ONLINE',
        price: 250,
        trajectory: 'push_in_focal'
      }
    ]
  }
];

/**
 * Genera l'intera campagna mensile a 4 settimane (20 Reel AutoCut completi a 5 scene)
 */
export function generateFullAutoCutCampaign(): Array<{
  id: string;
  brand: 'pizza' | 'village';
  platforms: ('tiktok' | 'instagram' | 'facebook' | 'google')[];
  format: 'reel';
  editorial_format: 'video_reel';
  scheduled_for: string;
  title: string;
  caption: string;
  media_url: string;
  source_item_id: string;
  source_category: string;
  price: number;
  status: 'scheduled';
  tags: string[];
  cta_url: string;
  cta_label: string;
  audio_track_id: string;
  audio_track_name: string;
  audio_track_src: string;
  audio_duration: string;
  camera_trajectory: string;
  title_th: string;
  title_en: string;
  badge: string;
  slides: AutoCutSlide[];
}> {
  const posts: any[] = [];
  const now = new Date();

  // Combina i concept alternandoli: Pizzeria (3 post a settimana) + Villaggio (2 post a settimana)
  const allConcepts = [
    // Settimana 1
    { concept: PIZZA_AUTOCUT_CONCEPTS[0], dayOffset: 1, hour: 11, min: 30, platform: 'tiktok' },
    { concept: VILLAGE_AUTOCUT_CONCEPTS[0], dayOffset: 2, hour: 17, min: 45, platform: 'instagram' },
    { concept: PIZZA_AUTOCUT_CONCEPTS[1], dayOffset: 3, hour: 18, min: 0, platform: 'tiktok' },
    { concept: VILLAGE_AUTOCUT_CONCEPTS[1], dayOffset: 5, hour: 15, min: 30, platform: 'facebook' },
    { concept: PIZZA_AUTOCUT_CONCEPTS[2], dayOffset: 6, hour: 12, min: 0, platform: 'instagram' },

    // Settimana 2
    { concept: PIZZA_AUTOCUT_CONCEPTS[3], dayOffset: 8, hour: 11, min: 30, platform: 'tiktok' },
    { concept: VILLAGE_AUTOCUT_CONCEPTS[2], dayOffset: 9, hour: 17, min: 45, platform: 'instagram' },
    { concept: PIZZA_AUTOCUT_CONCEPTS[4], dayOffset: 10, hour: 18, min: 0, platform: 'tiktok' },
    { concept: VILLAGE_AUTOCUT_CONCEPTS[3], dayOffset: 12, hour: 15, min: 30, platform: 'facebook' },
    { concept: PIZZA_AUTOCUT_CONCEPTS[0], dayOffset: 13, hour: 12, min: 0, platform: 'instagram' },

    // Settimana 3
    { concept: PIZZA_AUTOCUT_CONCEPTS[1], dayOffset: 15, hour: 11, min: 30, platform: 'tiktok' },
    { concept: VILLAGE_AUTOCUT_CONCEPTS[4], dayOffset: 16, hour: 17, min: 45, platform: 'instagram' },
    { concept: PIZZA_AUTOCUT_CONCEPTS[2], dayOffset: 17, hour: 18, min: 0, platform: 'tiktok' },
    { concept: VILLAGE_AUTOCUT_CONCEPTS[0], dayOffset: 19, hour: 15, min: 30, platform: 'facebook' },
    { concept: PIZZA_AUTOCUT_CONCEPTS[3], dayOffset: 20, hour: 12, min: 0, platform: 'instagram' },

    // Settimana 4
    { concept: PIZZA_AUTOCUT_CONCEPTS[4], dayOffset: 22, hour: 11, min: 30, platform: 'tiktok' },
    { concept: VILLAGE_AUTOCUT_CONCEPTS[1], dayOffset: 23, hour: 17, min: 45, platform: 'instagram' },
    { concept: PIZZA_AUTOCUT_CONCEPTS[0], dayOffset: 24, hour: 18, min: 0, platform: 'tiktok' },
    { concept: VILLAGE_AUTOCUT_CONCEPTS[2], dayOffset: 26, hour: 15, min: 30, platform: 'facebook' },
    { concept: PIZZA_AUTOCUT_CONCEPTS[1], dayOffset: 27, hour: 12, min: 0, platform: 'instagram' }
  ];

  allConcepts.forEach((item, index) => {
    const postDate = new Date(now);
    postDate.setDate(postDate.getDate() + item.dayOffset);
    postDate.setHours(item.hour, item.min, 0, 0);

    const c = item.concept;
    const isPizza = c.brand === 'pizza';

    const fullCaption = `${c.descriptionTh}\n\n${c.descriptionEn}\n\n${c.tags.join(' ')}`;

    posts.push({
      id: `autocut_${c.brand}_${Date.now()}_${index + 1}`,
      brand: c.brand,
      platforms: [item.platform as any],
      format: 'reel',
      editorial_format: 'video_reel',
      scheduled_for: postDate.toISOString(),
      title: `${c.titleTh} | ${c.titleEn}`,
      caption: fullCaption,
      media_url: c.slides[0].imageUrl,
      source_item_id: c.id,
      source_category: c.category,
      price: c.slides[0].price || 0,
      status: 'scheduled',
      tags: c.tags,
      cta_url: isPizza ? 'https://flowerpowerpizza.com' : 'https://flowerpowervillage.com',
      cta_label: isPizza ? 'ORDER DELIVERY' : 'BOOK BUNGALOW',
      audio_track_id: c.audioTrackId,
      audio_track_name: c.audioTrackName,
      audio_track_src: c.audioTrackSrc,
      audio_duration: c.audioDuration,
      camera_trajectory: c.slides[0].trajectory,
      title_th: c.slides[0].labelTh,
      title_en: c.slides[0].labelEn,
      badge: c.slides[0].badge || c.category,
      slides: c.slides
    });
  });

  return posts;
}
