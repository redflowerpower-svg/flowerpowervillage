/**
 * Visual Motion & Carousel Engine for TikTok, Instagram Reels & Stories
 * Reparto Stagno: Social Media Studio (/social)
 * Respects typographic rules and multi-language presets (Thai, Italian, English).
 */

export interface VisualCatalogItem {
  id: string;
  brand: 'pizza' | 'village';
  titleIt: string;
  titleEn: string;
  titleTh: string;
  category: string;
  imageUrl: string;
  badgeIt: string;
  badgeEn: string;
  badgeTh: string;
  price?: number;
  descriptionIt: string;
  descriptionEn: string;
  descriptionTh: string;
  source?: 'website' | 'telegram_cloud';
}

export interface CarouselSlide {
  id: string;
  slideType: 'hook' | 'feature' | 'cta';
  title: string;
  subtitle: string;
  badge?: string;
  imageUrl: string;
  overlayGradient: 'dark-bottom' | 'dark-top-bottom' | 'vibrant-warm' | 'tropical-emerald';
  ctaText?: string;
}

export interface MotionReelConfig {
  aspectRatio: '9:16' | '1:1' | '4:5';
  durationSeconds: number; // 5 to 15s
  animationType: 'ken-burns-zoom-in' | 'ken-burns-pan-left' | 'ken-burns-pan-right' | 'subtle-pulse';
  title: string;
  subtitle: string;
  badge?: string;
  priceTag?: string;
  brand: 'pizza' | 'village';
  theme: 'standard' | 'rainy_day' | 'loy_krathong' | 'songkran' | 'chinese_new_year' | 'sunset_paradise' | 'christmas';
}

// Preset Piatti Iconici Pizzeria (Ranong) & Alloggi di Prestigio Villaggio (Koh Phayam)
export const CATALOG_PRESET_ITEMS: VisualCatalogItem[] = [
  // 🍕 PIZZERIA RANONG
  {
    id: 'pizza-margherita-tradizionale',
    brand: 'pizza',
    titleIt: 'Pizza Margherita Tradizionale Italiana',
    titleEn: 'Authentic Traditional Italian Margherita',
    titleTh: 'พิซซ่ามาเกริต้าต้นตำรับอิตาเลียนแท้',
    category: 'Pizza Classica',
    imageUrl: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/02-pizza-margherita.webp',
    badgeIt: 'Lievitazione 48 Ore',
    badgeEn: '48h Slow Fermentation',
    badgeTh: 'แป้งหมักช้า 48 ชม.',
    price: 240,
    descriptionIt: 'Pomodoro San Marzano DOP, mozzarella fior di latte filante, basilico fresco e olio extravergine.',
    descriptionEn: 'San Marzano DOP tomatoes, melted fior di latte mozzarella, fresh basil and extra virgin olive oil.',
    descriptionTh: 'ซอสมะเขือเทศซานมาร์ซาโน ชีสมอสซาเรลล่าสด ใบโหระพาอิตาเลียนแท้ แป้งหมักช้า 48 ชม.'
  },
  {
    id: 'pizza-rustica-salsiccia',
    brand: 'pizza',
    titleIt: 'Pizza Rustica con Salsiccia Italiana & Funghi',
    titleEn: 'Rustic Pizza with Italian Sausage & Mushrooms',
    titleTh: 'พิซซ่าไส้กรอกอิตาเลียนและเห็ดหอมกรุ่น',
    category: 'Pizza Gourmet',
    imageUrl: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/pizza-rustica-con-salsiccia-e-stilacci.webp',
    badgeIt: 'Salsiccia Artigianale',
    badgeEn: 'Artisan Sausage',
    badgeTh: 'ไส้กรอกอิตาเลียนโฮมเมด',
    price: 350,
    descriptionIt: 'Salsiccia italiana fresca aromatizzata alle erbe, funghi trifolati, mozzarella e pecorino.',
    descriptionEn: 'Fresh herb Italian sausage, sautéed mushrooms, creamy mozzarella and aged pecorino.',
    descriptionTh: 'ไส้กรอกอิตาเลียนปรุงสมุนไพรสด เห็ดผัดน้ำมันมะกอก และมอสซาเรลล่าเยิ้มๆ'
  },
  {
    id: 'spaghetti-scoglio-ranong',
    brand: 'pizza',
    titleIt: 'Spaghetti allo Scoglio con Pesce Fresco',
    titleEn: 'Seafood Spaghetti allo Scoglio',
    titleTh: 'สปาเก็ตตี้ซีฟู้ดทะเลสดสไตล์อิตาเลียนแท้',
    category: 'Pasta Tradizionale',
    imageUrl: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/spaghetti-allo-scoglio.webp',
    badgeIt: 'Pesce Fresco di Giornata',
    badgeEn: 'Fresh Andaman Catch',
    badgeTh: 'อาหารทะเลสดทุกวัน',
    price: 290,
    descriptionIt: 'Spaghetti trafilati al bronzo con gamberi reali dell\'Andamane, vongole, vino bianco e prezzemolo.',
    descriptionEn: 'Bronze-die spaghetti with fresh Andaman prawns, clams, garlic, white wine and parsley.',
    descriptionTh: 'เส้นพาสต้าบรอนซ์เหนียวนุ่ม กุ้งสดอันดามัน หอยตลับ ไวน์ขาว และน้ำมันมะกอกแท้'
  },
  {
    id: 'tagliatelle-nero-seppia',
    brand: 'pizza',
    titleIt: 'Tagliatelle al Nero di Seppia con Calamari',
    titleEn: 'Squid Ink Tagliatelle with Fresh Calamari',
    titleTh: 'พาสต้าเส้นดำหมึกสดผัดไวน์ขาวสไตล์เวนิส',
    category: 'Pasta Speciale',
    imageUrl: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/tagliatelle-al-nero-di-seppia-e-calamari.webp',
    badgeIt: 'Pasta Fatta in Casa',
    badgeEn: 'Handmade Black Pasta',
    badgeTh: 'เส้นสดทำมือโฮมเมด',
    price: 260,
    descriptionIt: 'Tagliatelle fresche al nero di seppia fatte a mano, calamari teneri spadellati, pomodorini e basilico.',
    descriptionEn: 'Handmade fresh black squid ink tagliatelle, tender sautéed calamari, cherry tomatoes and garlic.',
    descriptionTh: 'พาสต้าเส้นดำโฮมเมดเหนียวนุ่ม ปลาหมึกสดผัดกระเทียม มะเขือเทศหวาน และไวน์ขาว'
  },
  {
    id: 'chicken-pizza-burger',
    brand: 'pizza',
    titleIt: 'Chicken Pizza Burger con Patatine',
    titleEn: 'Chicken Pizza Burger with French Fries',
    titleTh: 'ชิกเก้น พิซซ่าเบอร์เกอร์ พร้อมเฟรนช์ฟรายส์กรอบ',
    category: 'Pizza Burgers',
    imageUrl: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/06-Pizza-Burgers/01-chicken-pizza-burger-with-french-fries.webp',
    badgeIt: 'Pane Pizza Croccante',
    badgeEn: 'Crispy Pizza Bun',
    badgeTh: 'แป้งพิซซ่าอบสด',
    price: 240,
    descriptionIt: 'Pollo dorato e succoso racchiuso nel nostro impasto pizza fragrante, servito con patatine croccanti.',
    descriptionEn: 'Juicy golden chicken nestled inside freshly baked crispy pizza dough bun with fries.',
    descriptionTh: 'ไก่ทอดสีทองชุ่มฉ่ำ ในแป้งพิซซ่าอบสดใหม่กรอบนอกนุ่มใน เสิร์ฟพร้อมเฟรนช์ฟรายส์'
  },
  {
    id: 'pizza-sandwich-parma',
    brand: 'pizza',
    titleIt: 'Pizza Sandwich con Prosciutto di Parma DOP',
    titleEn: 'Pizza Sandwich with Parma Ham DOP',
    titleTh: 'พิซซ่าแซนด์วิช พาร์ม่าแฮมอิตาเลียนแท้',
    category: 'Focacce & Sandwiches',
    imageUrl: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/05-Pizza-Sandwiches/01-pizza-sandwich-parma-ham.webp',
    badgeIt: 'Prosciutto di Parma',
    badgeEn: 'Original Parma Ham',
    badgeTh: 'พาร์ม่าแฮมนำเข้า',
    price: 280,
    descriptionIt: 'Focaccia croccante ripiena di fior di latte fresco, prosciutto di Parma DOP stagionato e rucola.',
    descriptionEn: 'Crispy stone-baked focaccia sandwich filled with fresh fior di latte mozzarella, aged Parma ham and wild rocket.',
    descriptionTh: 'แป้งพิซซ่าแซนด์วิชกรอบฟู มอสซาเรลล่าสด พาร์ม่าแฮมอิตาเลียนพรีเมียม และร็อกเก็ตสด'
  },
  {
    id: 'affogato-caffe-dessert',
    brand: 'pizza',
    titleIt: 'Affogato al Caffè con Gelato Artigianale',
    titleEn: 'Affogato al Caffè with Italian Gelato',
    titleTh: 'อัฟโฟกาโต้ ไอศกรีมวานิลลาราดช็อตเอสเปรสโซ่เข้มข้น',
    category: 'Desserts',
    imageUrl: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/08-Desserts/01-affogato-al-caffe.webp',
    badgeIt: 'Espresso Italiano 100%',
    badgeEn: '100% Italian Espresso',
    badgeTh: 'กาแฟสดแท้',
    price: 140,
    descriptionIt: 'Pallina di cremoso gelato alla vaniglia affogata in un espresso bollente italiano.',
    descriptionEn: 'Scoop of velvety vanilla gelato drowned in a piping-hot authentic Italian espresso shot.',
    descriptionTh: 'ไอศกรีมวานิลลาเนื้อเนียน ราดด้วยกาแฟเอสเปรสโซ่ร้อนหอมกรุ่น สัมผัสร้อนเย็นสุดฟิน'
  },

  // 🛖 RESORT KOH PHAYAM
  {
    id: 'villa-penthouse-panoramic',
    brand: 'village',
    titleIt: 'Villa Penthouse Panoramica Vista Tramonto',
    titleEn: 'Panoramic Penthouse Villa Sunset Deck',
    titleTh: 'เพนต์เฮาส์วิลล่า ดาดฟ้าชมวิวพระอาทิตย์ตกเกาะพยาม',
    category: 'Suite Panoramiche',
    imageUrl: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/accommodations/11_penthouse_villa/01-Main.jpg',
    badgeIt: 'Vista Panoramica',
    badgeEn: 'Panoramic Sunset View',
    badgeTh: 'วิวพระอาทิตย์ตกสวยที่สุด',
    price: 3200,
    descriptionIt: 'Altezza privilegiata, grande terrazza panoramica in legno e cielo stellato sull\'isola senza auto.',
    descriptionEn: 'High vantage point, expansive wooden sunset terrace and magical starry nights on Koh Phayam.',
    descriptionTh: 'ดาดฟ้ากว้างชมวิวท้องฟ้ายามเย็นและหมู่ดาวยามค่ำคืน เอกสิทธิ์การพักผ่อนที่คุณจะหลงรัก'
  },
  {
    id: 'red-bungalow-tropical',
    brand: 'village',
    titleIt: 'Red Bungalow nel Giardino Tropicale',
    titleEn: 'Red Bungalow in Tropical Oasis',
    titleTh: 'เรด บังกะโล สไตล์อีโค่ท่ามกลางสวนธรรมชาติเกาะพยาม',
    category: 'Bungalow Eco-Chic',
    imageUrl: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/accommodations/01_red_bungalow/01-Main.jpg',
    badgeIt: 'Oasi di Relax',
    badgeEn: 'Tropical Island Living',
    badgeTh: 'ใกล้ชิดธรรมชาติ',
    price: 1800,
    descriptionIt: 'Bungalow accogliente in legno naturale, patio ombreggiato, amaca e brezza marina costante.',
    descriptionEn: 'Cozy natural wood bungalow, shaded patio, hammock and constant gentle sea breeze.',
    descriptionTh: 'บังกะโลไม้ธรรมชาติดีไซน์อบอุ่น ระเบียงนั่งเล่นส่วนตัว สัมผัสความสงบและร่มรื่นของเกาะพยาม'
  },
  {
    id: 'yellow-bungalow-oasis',
    brand: 'village',
    titleIt: 'Yellow Bungalow con Patio & Amaca Privata',
    titleEn: 'Yellow Bungalow with Private Hammock Patio',
    titleTh: 'เยลโล่ว์ บังกะโล ระเบียงเปลญวนส่วนตัวท่ามกลางแมกไม้',
    category: 'Bungalow Eco-Chic',
    imageUrl: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/accommodations/03_yellow_bungalow/01-Main.jpg',
    badgeIt: 'Pura Tranquillità',
    badgeEn: 'Peaceful Island Haven',
    badgeTh: 'พักผ่อนสบายสไตล์ชิลล์',
    price: 1800,
    descriptionIt: 'Immerso tra palme da cocco e fiori tropicali, a pochi minuti dalla spiaggia di Aow Khao.',
    descriptionEn: 'Surrounded by coconut palms and tropical flowers, just minutes walk to Aow Khao beach.',
    descriptionTh: 'โอบล้อมด้วยต้นมะพร้าวและสวนดอกไม้ เดินเพียงไม่กี่นาทีถึงหาดอ่าวเขา เงียบสงบเป็นส่วนตัว'
  }
];

// 📚 Collezioni Tematiche per Reel Dinamici Multi-Scena e Caroselli di Categoria
export interface VisualCollectionPreset {
  id: string;
  brand: 'pizza' | 'village';
  nameIt: string;
  nameEn: string;
  nameTh: string;
  badge: string;
  themeCategory: 'street_food_sandwiches' | 'seafood_special' | 'pizza_masters' | 'island_stay_tour';
  itemIds: string[];
  reelStyle: 'fast_cut_montage' | 'ken_burns_sequence' | 'smooth_crossfade';
}

export const VISUAL_COLLECTION_PRESETS: VisualCollectionPreset[] = [
  {
    id: 'col-street-food',
    brand: 'pizza',
    nameIt: '🍔 I Re dello Street Food: Burger & Focacce',
    nameEn: '🍔 Street Food Kings: Pizza Burgers & Sandwiches',
    nameTh: '🍔 รวมดาวสตรีทฟู้ด พิซซ่าเบอร์เกอร์ & แซนด์วิช',
    badge: 'Street Food Showdown',
    themeCategory: 'street_food_sandwiches',
    itemIds: ['chicken-pizza-burger', 'pizza-sandwich-parma', 'pizza-rustica-salsiccia'],
    reelStyle: 'fast_cut_montage'
  },
  {
    id: 'col-andaman-seafood',
    brand: 'pizza',
    nameIt: '🦐 Gran Pescato dell\'Andamane: Paste di Mare',
    nameEn: '🦐 Andaman Seafood Glory: Fresh Pasta Dishes',
    nameTh: '🦐 ซีฟู้ดทะเลอันดามันสดๆ พาสต้าอิตาเลียนแท้',
    badge: 'Fresh Seafood Night',
    themeCategory: 'seafood_special',
    itemIds: ['spaghetti-scoglio-ranong', 'tagliatelle-nero-seppia'],
    reelStyle: 'fast_cut_montage'
  },
  {
    id: 'col-pizza-tradition',
    brand: 'pizza',
    nameIt: '🍕 Maestri della Pizza: 100% Ingredienti Italiani',
    nameEn: '🍕 Italian Pizza Masters: 48h Fermentation',
    nameTh: '🍕 พิซซ่าอิตาเลียนแท้ แป้งหมักช้า 48 ชม.',
    badge: 'Italian Pizza Masters',
    themeCategory: 'pizza_masters',
    itemIds: ['pizza-margherita-tradizionale', 'pizza-rustica-salsiccia'],
    reelStyle: 'ken_burns_sequence'
  },
  {
    id: 'col-resort-tour',
    brand: 'village',
    nameIt: '🌴 Il Tour del Villaggio: Bungalow & Suite Tramonto',
    nameEn: '🌴 Village Tour: Eco Bungalows & Sunset Penthouse',
    nameTh: '🌴 ทัวร์ที่พักเกาะพยาม บังกะโลสวน & เพนต์เฮาส์พระอาทิตย์ตก',
    badge: 'Koh Phayam Escape',
    themeCategory: 'island_stay_tour',
    itemIds: ['villa-penthouse-panoramic', 'red-bungalow-tropical', 'yellow-bungalow-oasis'],
    reelStyle: 'smooth_crossfade'
  }
];

// 🌐 Piattaforme Omnichannel e Adattamento Nativo Separato
export type OmnichannelPlatform = 'tiktok' | 'instagram' | 'facebook' | 'google';

export interface PlatformAdaptation {
  platform: OmnichannelPlatform;
  platformLabel: string;
  formatType: 'carousel' | 'motion_reel' | 'feed_post' | 'google_local';
  formatLabel: string;
  badgeLabel: string;
  titleHook: string;
  subtitleOrBody: string;
  ctaText: string;
  hashtags: string[];
  clickableLink?: string;
  iconName: string;
}

/**
 * Crea le 4 declinazioni native automatiche per TikTok, Instagram, Facebook e Google Maps
 */
export function buildOmnichannelAdaptations(
  item: VisualCatalogItem,
  customTitle?: string,
  customSubtitle?: string
): Record<OmnichannelPlatform, PlatformAdaptation> {
  const isPizza = item.brand === 'pizza';

  return {
    tiktok: {
      platform: 'tiktok',
      platformLabel: 'TikTok',
      formatType: 'carousel',
      formatLabel: 'Photo Mode (Carosello Swipe 9:16)',
      badgeLabel: '🔥 TikTok Viral',
      titleHook: customTitle || (isPizza ? `🍕 ${item.titleTh} อร่อยแสงออกปาก ฟินมากกก!` : `🌴 ${item.titleTh} ฟีลดีมากกก เกาะพยาม`),
      subtitleOrBody: customSubtitle || (isPizza ? `${item.titleEn} • แป้งหมักช้า 48 ชม. วัตถุดิบอิตาเลียนแท้ 100% ปักหมุดระนอง` : `${item.titleEn} • หนีความวุ่นวายมาพักผ่อนฮีลใจ นอนฟังเสียงธรรมชาติ`),
      ctaText: isPizza ? 'โหวตเมนูนี้ในคอมเมนต์! 💬' : 'แท็กคนที่อยากพามาด้วย! 🌴',
      hashtags: isPizza 
        ? ['#TikTokพากิน', '#รีวิวระนอง', '#อร่อยบอกต่อ', '#RanongFood', '#PizzaRanong', '#FlowerPowerRanong']
        : ['#เที่ยวเกาะพยาม', '#เกาะพยาม', '#ที่พักเกาะพยาม', '#KohPhayam', '#ThailandTravel'],
      iconName: 'Smartphone'
    },
    instagram: {
      platform: 'instagram',
      platformLabel: 'Instagram',
      formatType: 'motion_reel',
      formatLabel: 'Reel 9:16 (Motion Video Dinamico)',
      badgeLabel: '✨ Reels Showcase',
      titleHook: customTitle || item.titleTh,
      subtitleOrBody: customSubtitle || (isPizza 
        ? `${item.titleEn} — 48h slow fermentation dough & 100% imported Italian ingredients in Ranong.`
        : `${item.titleEn} — Pure tropical tranquility at Flower Power Village, Koh Phayam.`),
      ctaText: 'Save this Reel for tonight! 📌',
      hashtags: isPizza
        ? ['#Ranong', '#RanongThailand', '#ItalianFoodRanong', '#FoodPornRanong', '#ItalianChef', '#PizzaLovers']
        : ['#KohPhayam', '#EcoResortThailand', '#IslandLife', '#RanongTravel', '#HiddenThailand'],
      iconName: 'Video'
    },
    facebook: {
      platform: 'facebook',
      platformLabel: 'Facebook',
      formatType: 'feed_post',
      formatLabel: 'Post Feed con Video & Link Diretto',
      badgeLabel: '👥 Community & Consegna',
      titleHook: isPizza 
        ? `🍕 ${item.titleTh} (${item.titleEn}) ส่งตรงถึงบ้านในระนอง!`
        : `🌴 ${item.titleTh} (${item.titleEn}) เกาะพยาม`,
      subtitleOrBody: isPizza
        ? `พิซซ่าสูตรอิตาเลียนแท้ แป้งหมักช้า 48 ชม. รังสรรค์โดยเชฟอิตาเลียน วัตถุดิบนำเข้าจากอิตาลี 100% อบร้อนๆ กล่องเก็บความร้อนส่งด่วนถึงบ้านคุณในตัวเมืองระนอง หรือแวะมานั่งชิลล์ในสวนใกล้บ่อน้ำแร่รักษะวาริน\n\n${item.titleEn}: Authentic Italian pizza with 48h slow dough fermentation and 100% certified Italian ingredients.\n\n👉 สั่งออนไลน์ รับส่วนลดทันที 10% สำหรับออเดอร์แรก: https://flowerpowerpizza.com`
        : `บังกะโลไม้ธรรมชาติท่ามกลางสวนทรอปิคอล พักผ่อนเติมพลังบนเกาะพยาม ใกล้อ่าวเขา\n\n${item.titleEn}: Eco-chic wooden bungalows immersed in lush tropical gardens.\n\n👉 จองตรงกับเรา การันตีราคาดีที่สุด: https://flowerpowervillage.com`,
      clickableLink: isPizza ? 'https://flowerpowerpizza.com' : 'https://flowerpowervillage.com',
      ctaText: isPizza ? 'สั่งออนไลน์ (ลด 10%) ➔' : 'จองที่พักออนไลน์ ➔',
      hashtags: isPizza ? ['#RanongFood', '#PizzaRanong', '#RanongDelivery', '#รีวิวระนอง'] : ['#KohPhayamIsland', '#RanongResort', '#TravelThailand'],
      iconName: 'Layers'
    },
    google: {
      platform: 'google',
      platformLabel: 'Google Maps (Business Profile)',
      formatType: 'google_local',
      formatLabel: 'Post Locale (Foto HD Statica + Tasto Azione)',
      badgeLabel: '📍 Google Maps Verified',
      titleHook: `${item.titleTh} • ${item.titleEn}`,
      subtitleOrBody: isPizza
        ? `${item.titleTh} (${item.titleEn}). พิซซ่าและอาหารอิตาเลียนแท้โดยเชฟอิตาเลียน แป้งหมัก 48 ชม. วัตถุดิบนำเข้า 100% ในเมืองระนอง พร้อมบริการนั่งทานในร้าน สั่งกลับบ้าน และเดลิเวอรี่ส่งด่วน. ราคา: ${item.price ? `${item.price} THB` : 'Menu Ufficiale'}.`
        : `${item.titleTh} (${item.titleEn}). บังกะโลไม้และวิลล่าบนเกาะพยาม เงียบสงบใกล้ชิดธรรมชาติ การันตีราคาดีที่สุดบนเว็บไซต์อย่างเป็นทางการ.`,
      clickableLink: isPizza ? 'https://flowerpowerpizza.com' : 'https://flowerpowervillage.com',
      ctaText: isPizza ? 'ORDINA ONLINE' : 'PRENOTA DIRETTO',
      hashtags: [],
      iconName: 'MapPin'
    }
  };
}


// Temi speciali per Marketing Contestuale & Festività
export const THEMATIC_MARKETING_PRESETS = [
  {
    id: 'rainy_day_ranong',
    brand: 'pizza' as const,
    nameIt: '🌧️ Pioggia a Ranong (Comfort Food)',
    nameEn: '🌧️ Rainy Day Ranong Comfort Food',
    nameTh: '🌧️ วันฝนพรำระนอง พิซซ่าร้อนๆ ส่งถึงบ้าน',
    hookTitle: 'วันฝนตกที่ระนอง สั่งพิซซ่าอิตาเลียนแท้ส่งด่วนถึงบ้าน! 🍕🛵',
    hookSubtitle: 'Giornata di pioggia? Pizza fumante caldissima a domicilio!',
    badge: 'Consegna Rapida Ranong',
    cta: 'กดสั่งเดลิเวอรี่ผ่านเว็บ ลดทันที 10% ✨'
  },
  {
    id: 'loy_krathong',
    brand: 'both' as const,
    nameIt: '🪷 Festa di Loy Krathong (Novembre)',
    nameEn: '🪷 Loy Krathong Lantern Festival',
    nameTh: '🪷 เทศกาลลอยกระทง สวนดอกไม้ระนองและเกาะพยาม',
    hookTitle: 'ร่วมฉลองเทศกาลลอยกระทง บรรยากาศสุดโรแมนติก 🪷✨',
    hookSubtitle: 'Vivi la magia di Loy Krathong a Koh Phayam & Ranong!',
    badge: 'Special Event Night',
    cta: 'จองโต๊ะหรือที่พักล่วงหน้า รับสิทธิพิเศษทันที 🕯️'
  },
  {
    id: 'sunset_paradise',
    brand: 'village' as const,
    nameIt: '🌅 Tramonto ad Aow Khao (Koh Phayam)',
    nameEn: '🌅 Golden Hour Sunset Paradise Koh Phayam',
    nameTh: '🌅 ชมพระอาทิตย์ตกดินสุดสายตา เกาะพยาม',
    hookTitle: 'ช่วงเวลาทองยามเย็นที่เกาะพยาม ชิลล์ริมทะเลกับไวน์อิตาเลียน 🍷🏝️',
    hookSubtitle: 'The Golden Hour on Koh Phayam with Italian Wine & Sunset',
    badge: 'Island Sunset Secret',
    cta: 'Book Direct & Save 10% on Google Maps 🌿'
  },
  {
    id: 'songkran_summer',
    brand: 'both' as const,
    nameIt: '💦 Songkran & Estate Thailandese (Aprile)',
    nameEn: '💦 Songkran Water Festival & Island Summer',
    nameTh: '💦 สาดความสุขสงกรานต์ ชิลล์รับลมร้อนที่เกาะพยามและระนอง',
    hookTitle: 'สงกรานต์ปีนี้ หลีกหนีความวุ่นวายมาพักผ่อนเกาะพยาม 💦🌴',
    hookSubtitle: 'Fuga di Songkran al mare e pizza fresca a Ranong!',
    badge: 'Songkran Special',
    cta: 'วางแผนวันหยุดยาวล่วงหน้า การันตีราคาดีที่สุด 🌊'
  }
];

/**
 * Genera automaticamente un Carosello a 3 slide per TikTok Photo Mode o Instagram Carousel
 */
export function buildCarouselSlides(
  item: VisualCatalogItem,
  lang: 'TH_FIRST' | 'EN_FIRST' | 'IT_FIRST' = 'TH_FIRST'
): CarouselSlide[] {
  const isPizza = item.brand === 'pizza';

  let s1Title = item.titleTh;
  let s1Sub = item.titleEn;
  let s2Title = isPizza ? 'พิซซ่าอิตาเลียนแท้ แป้งหมัก 48 ชม.' : 'คัดสรรธรรมชาติและวัตถุดิบแท้ 100%';
  let s2Sub = item.descriptionEn;
  let s3Title = isPizza ? '🛵 ส่งด่วนร้อนๆ ถึงบ้านคุณในเมืองระนอง' : '🏝️ จองตรงกับเรา รับประกันราคาดีที่สุด';
  let s3Sub = isPizza ? 'Order fast delivery on flowerpowerpizza.com' : 'Book direct on flowerpowervillage.com';

  if (lang === 'EN_FIRST') {
    s1Title = item.titleEn;
    s1Sub = item.titleTh;
    s2Title = isPizza ? 'Artisan Italian Craft & 48h Fermentation' : 'Eco-Luxury Island Living';
    s2Sub = item.descriptionEn;
    s3Title = isPizza ? 'Order Fast Delivery in Ranong' : 'Book Direct with 10% Welcome Discount';
  } else if (lang === 'IT_FIRST') {
    s1Title = item.titleIt;
    s1Sub = item.titleEn;
    s2Title = isPizza ? '100% Farina Italiana & Lenta Lievitazione 48h' : 'Il Tuo Risveglio nel Verde a Phayam';
    s2Sub = item.descriptionEn;
    s3Title = isPizza ? 'Ordina a Domicilio con Sconto 10%' : 'Prenota la Tua Villa Esclusiva';
  }

  return [
    {
      id: `${item.id}-slide-1`,
      slideType: 'hook',
      title: s1Title,
      subtitle: s1Sub,
      badge: item.badgeTh || item.badgeIt,
      imageUrl: item.imageUrl,
      overlayGradient: isPizza ? 'vibrant-warm' : 'tropical-emerald',
      ctaText: 'Swipe ➔'
    },
    {
      id: `${item.id}-slide-2`,
      slideType: 'feature',
      title: s2Title,
      subtitle: s2Sub,
      badge: item.price ? `${item.price} THB` : undefined,
      imageUrl: item.imageUrl,
      overlayGradient: 'dark-bottom',
      ctaText: 'Swipe ➔'
    },
    {
      id: `${item.id}-slide-3`,
      slideType: 'cta',
      title: s3Title,
      subtitle: s3Sub,
      badge: isPizza ? 'Sconto 10% Primo Ordine' : 'Best Rate Guarantee',
      imageUrl: item.imageUrl,
      overlayGradient: 'dark-top-bottom',
      ctaText: isPizza ? 'Ordina Subito 🍕' : 'Prenota Ora 🌴'
    }
  ];
}

export interface VisualAIResponse {
  success: boolean;
  visualAnalysis: {
    subject: string;
    dominantColors?: string[];
    visualElements?: string[];
    negativeSpaceBestPosition?: 'bottom' | 'top' | 'center';
    lighting?: string;
    usedGemini?: boolean;
  };
  reelOverlay: {
    title: string;
    subtitle: string;
    badge: string;
    priceTag: string;
  };
  slides: CarouselSlide[];
  socialCaption: {
    thai: string;
    english: string;
    hashtags: string[];
  };
}

/**
 * Chiama l'endpoint serverless AI (Gemini Vision + DeepSeek) per analizzare la foto
 * e generare i testi dinamici bilingue per caroselli e video reel.
 */
export async function analyzeVisualWithAI(params: {
  imageUrl: string;
  brand: 'pizza' | 'village';
  itemTitle: string;
  itemTitleTh?: string;
  category?: string;
  price?: number;
  currentTheme?: string;
  geminiApiKey?: string;
}): Promise<VisualAIResponse> {
  const res = await fetch('/api/social-publisher?action=analyze_visual_ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || errData.error || `Visual AI failed with status ${res.status}`);
  }
  return res.json();
}

