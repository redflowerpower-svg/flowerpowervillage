import { menuData, MenuItem } from '../../pizza/data/menuData';
import { ACCOMMODATIONS } from '../../booking/resort/config/accommodations';
import { JINGLE_TRACKS, VILLAGE_AUDIO_TRACKS } from '../components/VisualMotionStudio';
import { AutoCutSlide, PIZZA_AUTOCUT_CONCEPTS, VILLAGE_AUTOCUT_CONCEPTS } from './autoCutIntelligence';

export type SocialPlatform = 'tiktok' | 'instagram' | 'facebook' | 'google';
export type SocialFormat = 'reel' | 'story' | 'feed' | 'google_post';
export type BrandType = 'pizza' | 'village';

export interface ScheduledSocialPost {
  id: string;
  brand: BrandType;
  platforms: SocialPlatform[];
  format: SocialFormat;
  scheduled_for: string; // ISO 8601
  title: string;
  caption: string;
  media_url: string;
  source_item_id: string;
  source_category?: string;
  price?: number;
  status: 'draft' | 'scheduled' | 'published';
  tags: string[];
  cta_url?: string;
  cta_label?: string;
  // 🎥 Parametri AutoCut 7.8s Video Reel & Audio MP3 Muxato
  editorial_format?: 'video_reel' | 'static_post';
  audio_track_id?: string;
  audio_track_name?: string;
  audio_track_src?: string;
  audio_duration?: string;
  camera_trajectory?: string;
  overlay_atmosphere?: string;
  title_th?: string;
  title_en?: string;
  badge?: string;
  slides?: AutoCutSlide[];
}

/**
 * Alloggi e Asset Ufficiali Villaggio Koh Phayam (Foto 100% Reali da Supabase Storage)
 * Regola Pan & Scan: 4 sole traiettorie ammesse con partenza differenziata per alloggio
 */
export const VILLAGE_SOCIAL_ASSETS = [
  {
    id: 'villa-penthouse',
    name: 'Villa Penthouse Panoramica Breezy Suite',
    nameTh: 'เพนต์เฮาส์วิลล่า ดาดฟ้าชมวิวรับลมธรรมชาติเกาะพยาม',
    category: 'VILLE',
    description: 'High vantage point, expansive wooden breezy terrace and magical starry nights on Koh Phayam.',
    descriptionTh: 'ดาดฟ้ากว้างรับลมธรรมชาติและชมหมู่ดาวยามค่ำคืน เอกสิทธิ์การพักผ่อนที่คุณจะหลงรัก',
    price: 2400,
    image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/accommodations/11_penthouse_villa/01-Main.jpg',
    cta_url: 'https://flowerpowervillage.com',
    camera_trajectory: 'pan_left_to_right' as const,
    overlay_atmosphere: 'sunbeams' as const
  },
  {
    id: 'red-bungalow',
    name: 'Red Bungalow nel Giardino Tropicale',
    nameTh: 'เรด บังกะโล สไตล์อีโค่ท่ามกลางสวนธรรมชาติเกาะพยาม',
    category: 'BUNGALOW',
    description: 'Cozy natural wood bungalow, shaded patio, hammock and constant gentle sea breeze.',
    descriptionTh: 'บังกะโลไม้ธรรมชาติดีไซน์อบอุ่น ระเบียงนั่งเล่นส่วนตัว สัมผัสความสงบและร่มรื่นของเกาะพยาม',
    price: 1800,
    image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/accommodations/01_red_bungalow/01-Main.jpg',
    cta_url: 'https://flowerpowervillage.com',
    camera_trajectory: 'pan_right_to_left' as const,
    overlay_atmosphere: 'abstract_bokeh' as const
  },
  {
    id: 'yellow-bungalow',
    name: 'Yellow Bungalow con Patio & Amaca Privata',
    nameTh: 'เยลโล่ว์ บังกะโล ระเบียงเปลญวนส่วนตัวท่ามกลางแมกไม้',
    category: 'BUNGALOW',
    description: 'Surrounded by coconut palms and tropical flowers, just minutes walk to Aow Khao beach.',
    descriptionTh: 'โอบล้อมด้วยต้นมะพร้าวและสวนดอกไม้ เดินเพียงไม่กี่นาทีถึงหาดอ่าวเขา เงียบสงบเป็นส่วนตัว',
    price: 1800,
    image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/accommodations/03_yellow_bungalow/01-Main.jpg',
    cta_url: 'https://flowerpowervillage.com',
    camera_trajectory: 'diagonal_up_right' as const,
    overlay_atmosphere: 'sunbeams' as const
  },
  {
    id: 'jungle-villa',
    name: 'Jungle Villa Immersa nella Natura Tropicale',
    nameTh: 'จังเกิ้ลวิลล่า ท่ามกลางสวนธรรมชาติทรอปิคอล เกาะพยาม',
    category: 'VILLE',
    description: 'Immersed in lush nature, tropical flora, and birdsong. Ideal for families and private retreats on Koh Phayam.',
    descriptionTh: 'พักผ่อนท่ามกลางสวนเขียวขจี ฟังเสียงนกและธรรมชาติ เหมาะสำหรับการพักผ่อนแบบส่วนตัวและครอบครัวบนเกาะพยาม',
    price: 4800,
    image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/accommodations/44_jungle_villa/01-Main.jpg',
    cta_url: 'https://flowerpowervillage.com',
    camera_trajectory: 'diagonal_up_left' as const,
    overlay_atmosphere: 'abstract_bokeh' as const
  },
  {
    id: 'peace-love-villa',
    name: 'Peace & Love Villa con Vista Piscina',
    nameTh: 'พีซ แอนด์ เลิฟ วิลล่า บรรยากาศริมสระว่ายน้ำเกาะพยาม',
    category: 'VILLE',
    description: 'Spacious master bedroom, outdoor open-air shower, private patio under palm trees, pure island serenity.',
    descriptionTh: 'ห้องนอนกว้างขวาง ฝักบัวอาบน้ำกลางแจ้งรับลมธรรมชาติ ระเบียงส่วนตัวใต้ร่มเงาทิวมะพร้าว สัมผัสความสงบที่แท้จริง',
    price: 2400,
    image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/accommodations/41_peace_and_love_villa/01-Main.jpg',
    cta_url: 'https://flowerpowervillage.com',
    camera_trajectory: 'pan_left_to_right' as const,
    overlay_atmosphere: 'sunbeams' as const
  },
  {
    id: 'green-bungalow',
    name: 'Green Bungalow Oasi di Pace & Palme',
    nameTh: 'กรีน บังกะโล พักผ่อนท่ามกลางสวนปาล์มร่มรื่น',
    category: 'BUNGALOW',
    description: 'Natural wooden bungalow enveloped in tropical greenery, quiet veranda, authentic island living.',
    descriptionTh: 'บังกะโลไม้ท่ามกลางธรรมชาติร่มรื่น ระเบียงส่วนตัวรับลมทะเล สัมผัสวิถีชีวิตบนเกาะอย่างแท้จริง',
    price: 1800,
    image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/accommodations/02_green_bungalow/01-Main.jpg',
    cta_url: 'https://flowerpowervillage.com',
    camera_trajectory: 'pan_right_to_left' as const,
    overlay_atmosphere: 'abstract_bokeh' as const
  },
  {
    id: 'camel-tent',
    name: 'Camel Tent Glamping sotto le Stelle',
    nameTh: 'เต็นท์แกลมปิ้ง คาเมล สไตล์อีโค่ชิคนอนดูดาวริมสวน',
    category: 'TENDE GLAMPING',
    description: 'Eco-chic tent surrounded by organic gardens, comfortable king-size bed, private terrace for relaxation.',
    descriptionTh: 'เต็นท์สไตล์อีโค่ชิคท่ามกลางสวนเกษตรอินทรีย์ เตียงคิงไซส์แสนสบาย พร้อมระเบียงส่วนตัวสำหรับพักผ่อน',
    price: 1400,
    image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/accommodations/23_camel_tent/01-Main.jpg',
    cta_url: 'https://flowerpowervillage.com',
    camera_trajectory: 'diagonal_up_right' as const,
    overlay_atmosphere: 'sunbeams' as const
  }
];

/**
 * Detects current Thai & International Holidays/Seasons for extra viral social hooks
 */
export function getCurrentSeasonalContext(date: Date = new Date()): {
  holidayName?: string;
  thaiCallout?: string;
  engCallout?: string;
} {
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  // Songkran (April 11-17)
  if (month === 4 && day >= 10 && day <= 18) {
    return {
      holidayName: 'Songkran Festival',
      thaiCallout: '💦 สุขสันต์วันสงกรานต์นะคะ! แวะมาฉลองความสดชื่นด้วยกันน้าา 🎉',
      engCallout: '💦 Happy Songkran Festival! Celebrate Thai New Year with fresh flavors! 🌊'
    };
  }
  // Halloween (Oct 24 - Nov 2)
  if ((month === 10 && day >= 24) || (month === 11 && day <= 2)) {
    return {
      holidayName: 'Halloween',
      thaiCallout: '🎃 ฮาโลวีนนี้ แวะมาฟินกับเมนูอร่อยจนต้องร้องว้าวกันนะคะ! 👻',
      engCallout: '🎃 Spooky season treats! Come indulge in dangerously delicious Italian comfort food! 🍕'
    };
  }
  // Loy Krathong (November)
  if (month === 11 && day >= 10 && day <= 28) {
    return {
      holidayName: 'Loy Krathong',
      thaiCallout: '🌕 สุขสันต์วันลอยกระทงจ้า! ค่ำคืนแสนอบอุ่นใต้แสงจันทร์ริมน้ำตกนะคะ ✨',
      engCallout: '🌕 Happy Loy Krathong! Celebrate this magical lantern night with us under the stars! ✨'
    };
  }
  // Christmas & New Year (Dec 20 - Jan 5)
  if ((month === 12 && day >= 18) || (month === 1 && day <= 6)) {
    return {
      holidayName: 'Holidays & New Year',
      thaiCallout: '🎄✨ สุขสันต์เทศกาลแห่งความสุขและปีใหม่นะคะ! ฉลองช่วงเวลาดีๆ กับครอบครัวน้าา 🥂',
      engCallout: '🎄✨ Festive Season & Happy New Year! Celebrate unforgettable moments with us! 🥂'
    };
  }
  // Valentine's Day (Feb 10-16)
  if (month === 2 && day >= 10 && day <= 16) {
    return {
      holidayName: "Valentine's Day",
      thaiCallout: '💖 ต้อนรับเทศกาลแห่งความรัก ดินเนอร์ใต้แสงเทียนสุดโรแมนติกนะคะ 💕',
      engCallout: "💖 Romantic Valentine's vibes! Candlelit dinner and pure romance in our tropical haven 💕"
    };
  }
  // High Season Koh Phayam (Nov - Apr) vs Green Season Waterfall (May - Oct)
  if (month >= 11 || month <= 4) {
    return {
      holidayName: 'Island High Season',
      thaiCallout: '☀️ ทะเลใส ท้องฟ้าเปิด เกาะพยามสวยที่สุดในรอบปี ห้ามพลาดเลยนะคะ! 🏖️',
      engCallout: '☀️ Crystal waters & lush tropical breezes — Koh Phayam high season at its absolute best! 🏝️'
    };
  } else {
    return {
      holidayName: 'Tropical Green Season',
      thaiCallout: '🌿 หน้าฝนระนองเขียวชอุ่ม น้ำตกสดชื่น ชิลสุดๆ เลยจ้า 🌧️',
      engCallout: '🌿 Lush tropical green season: refreshing waterfalls & serene relaxation in Ranong! 🍃'
    };
  }
}

/**
 * Flatten all dishes from menuData with valid photos and descriptions
 */
export function getAllEligibleDishes(): { categoryId: string; categoryName: string; item: MenuItem }[] {
  const result: { categoryId: string; categoryName: string; item: MenuItem }[] = [];

  for (const cat of menuData) {
    if (!cat.items || cat.items.length === 0) continue;
    // Skip internal items if any
    for (const item of cat.items) {
      if (item.image && item.name) {
        result.push({
          categoryId: cat.id,
          categoryName: cat.name,
          item
        });
      }
    }
  }

  return result;
}

/**
 * Generates tailored copy for each social platform based on dish or village asset
 * CATEGORICAL RULE:
 * - Pizza (Ranong): 🇹🇭 Thai FIRST, then 🇬🇧 English SECOND.
 *   Thai text features authentic viral social media particles: นะคะ, จ้า, น้าา, ฟินมากกก, อร่อยแสงออกปาก, ชีสเยิ้มๆ, แป้งหมัก48ชม.หอมกรุ่น.
 * - Village (Koh Phayam): 🇬🇧 English FIRST, then 🇹🇭 Thai SECOND.
 *   Thai text features authentic viral travel blogger particles: นะคะ, ชิลสุดๆ, ฟีลดีมากกก, พักผ่อนฮีลใจ, ปักหมุดที่พัก.
 * - Seasoned with viral emojis and high-performing hashtags.
 */
export function generatePlatformCaptions(item: {
  name: string;
  nameTh?: string;
  nameIt?: string;
  description: string;
  descriptionTh?: string;
  price: number;
  categoryName?: string;
  brand: BrandType;
  date?: Date;
}): Record<SocialPlatform, { title: string; caption: string; format: SocialFormat; tags: string[] }> {
  const isPizza = item.brand === 'pizza';
  const engName = item.name || item.nameIt;
  const thaiName = item.nameTh || item.name;

  if (isPizza) {
    // ----------------------------------------------------
    // PIZZERIA RANONG: 🇹🇭 THAI FIRST -> 🇬🇧 ENGLISH SECOND
    // ----------------------------------------------------
    const pizzaViralHashtags = [
      '#RanongFood',
      '#PizzaRanong',
      '#RanongHotspring',
      '#RanongEats',
      '#ItalianFoodThailand',
      '#WoodFiredPizza',
      '#KohPhayam',
      '#ThailandFoodie',
      '#อร่อยบอกต่อ',
      '#รีวิวระนอง',
      '#เที่ยวระนอง',
      '#ของกินระนอง',
      '#พิซซ่าอิตาเลียนแท้'
    ];

    // TikTok (Short, punchy, hyper-viral)
    const tiktokThai = `🇹🇭 🔥 สายกินต้องจัด! ${thaiName} อร่อยแสงออกปาก ฟินมากกก 🤤✨ แป้งหมักช้าสูตรลับ 48 ชม. กรอบนอกนุ่มหนึบ ชีสนำเข้าเยิ้มๆ วัตถุดิบอิตาเลียนแท้ 100% นั่งทานชิลๆ ในสวนทรอปิคอลพร้อมน้ำตกธรรมชาติ ใกล้บ่อน้ำร้อนรักษะวาริน ใครมาระนองห้ามพลาดเลยนะคะ! สั่งเดลิเวอรี่ส่งร้อนๆ ถึงบ้านก็ฟินจ้า 🛵💨`;
    const tiktokEng = `🇬🇧 Craving authentic Italian pizza in Ranong? 🍕🔥 Crafted with 48h cold-fermented dough, baked to bubbling perfection on high-temperature stone, and topped with 100% certified imported Italian ingredients. Dine in our lush tropical garden by the waterfall or order fast delivery to your door! ✨`;
    const tiktokCaption = `${tiktokThai}\n\n${tiktokEng}\n\n${pizzaViralHashtags.join(' ')}`;

    // Instagram (Visual, aesthetic, spotlight of the week)
    const igThai = `🇹🇭 ✨ อร่อยแสงออกปาก! ${thaiName} เมนูไฮไลท์ห้ามพลาดประจำสัปดาห์ 🍕🤤 ชีสนำเข้าเยิ้มๆ แป้งหมักช้า 48 ชม. สไตล์อิตาเลียนแท้ กรอบนอกนุ่มหนึบ อบสดใหม่ถาดต่อถาดโดยเชฟอิตาเลียน (${item.price} ฿) นั่งทานชิลๆ ในสวนน้ำตกธรรมชาติใกล้บ่อน้ำร้อนรักษะวาริน หรือจะกดสั่งเดลิเวอรี่ส่งตรงถึงบ้านบน flowerpowerpizza.com ก็สะดวกสุดๆ เลยนะคะ สั่งเลยจ้า 🛵💨`;
    const igEng = `🇬🇧 🍕 Spotlight of the Week: handcrafted ${engName} (${item.price} THB). Prepared fresh daily with 48h cold-fermented dough and genuine Italian passion in our open-air garden near Raksawarin Hot Springs. Dine with us or order online at flowerpowerpizza.com! ✨`;
    const igCaption = `${igThai}\n\n${igEng}\n\n${pizzaViralHashtags.join(' ')}`;

    // Facebook (Storytelling, authentic craftsmanship, 10% welcome privilege)
    const fbThai = `🇹🇭 🍕 สัมผัสรสชาติอิตาเลียนแท้ๆ ที่ระนองกับ ${thaiName}! 🇮🇹✨ ทุกถาดรังสรรค์ด้วยความพิถีพิถัน แป้งหมักเย็นยาวนาน 48 ชั่วโมง อบจนได้ขอบพองกรอบนอกนุ่มใน เสิร์ฟคู่กับไวน์อิตาเลียนนำเข้า ท่ามกลางสวนทรอปิคอลเขียวขจีและน้ำตกธรรมชาติสุดสดชื่น 🌿 จะแวะมาทานที่ร้านพร้อมรับส่วนลด 10% หรือสั่ง Takeaway / Fast Delivery ส่งร้อนถึงบ้านผ่าน www.flowerpowerpizza.com ก็ฟินสุดๆ เลยนะคะ แวะมาเช็คอินกันได้เลยจ้า! 🛵💨`;
    const fbEng = `🇬🇧 Indulge in authentic Italian craftsmanship in Ranong! Our ${engName} is crafted with 48h cold fermentation and 100% Italian certified ingredients. Pair it with an imported Italian wine in our lush tropical garden with a natural waterfall. Takeaway & Fast delivery available on www.flowerpowerpizza.com or book your dinner table with 10% welcome privilege! 🍕🍷`;
    const fbCaption = `${fbThai}\n\n${fbEng}\n\n${pizzaViralHashtags.join(' ')}`;

    // Google Maps Local Post (Local SEO, opening hours & quick order)
    const googleThai = `🇹🇭 🍕 ลิ้มลอง ${thaiName} สูตรต้นตำรับอิตาเลียนแท้ ที่ Flower Power Pizza ระนอง! แป้งหมักช้า 48 ชม. ชีสและวัตถุดิบนำเข้า บรรยากาศสวนน้ำตกธรรมชาติใกล้บ่อน้ำร้อนรักษะวาริน เปิดบริการทุกวัน ทั้งนั่งทานที่ร้านและเดลิเวอรี่ส่งด่วนในเมืองระนองนะคะ กดสั่งออนไลน์ได้ทันทีเลยจ้า! ✨`;
    const googleEng = `🇬🇧 Taste authentic ${engName} at Flower Power Pizza Ranong! 100% Italian ingredients, 48h slow dough fermentation, San Marzano tomatoes. Open daily for Dine-in and Fast Delivery in Ranong city. Click Order Now for online ordering. 🍕🛵`;
    const googleCaption = `${googleThai}\n\n${googleEng}\n\n${['#PizzaRanong', '#BestFoodRanong', '#ItalianRestaurantRanong', '#RanongFood', '#รีวิวระนอง', '#ของกินระนอง'].join(' ')}`;

    return {
      tiktok: {
        title: `🍕 ${thaiName} อิตาเลียนแท้ Ranong`,
        caption: tiktokCaption,
        format: 'reel',
        tags: ['RanongFood', 'PizzaRanong', 'KohPhayam', 'ItalianPizza', 'ArtisanPizza', 'อร่อยบอกต่อ', 'รีวิวระนอง']
      },
      instagram: {
        title: `🔥 ${thaiName} - Authentic Italian Pizza Ranong`,
        caption: igCaption,
        format: 'reel',
        tags: ['Ranong', 'PizzaRanong', 'ItalianFoodThailand', 'FoodieTravel', 'KohPhayam', 'อร่อยบอกต่อ']
      },
      facebook: {
        title: `🇹🇭🍕 ${thaiName} - Pizza สไตล์อิตาเลียนแท้ ระนอง`,
        caption: fbCaption,
        format: 'feed',
        tags: ['RanongDining', 'ItalianCuisine', 'ArtisanPizza', 'FlowerPowerPizza', 'รีวิวระนอง']
      },
      google: {
        title: `🍕 ${engName} - Italian Pizza Ranong`,
        caption: googleCaption,
        format: 'google_post',
        tags: ['PizzaRanong', 'BestFoodRanong', 'ItalianRestaurantRanong']
      }
    };
  } else {
    // ----------------------------------------------------
    // VILLAGE KOH PHAYAM: 🇬🇧 ENGLISH FIRST -> 🇹🇭 THAI SECOND
    // ----------------------------------------------------
    const villageViralHashtags = [
      '#KohPhayam',
      '#KohPhayamIsland',
      '#EcoResortThailand',
      '#ThailandTravel',
      '#Ranong',
      '#HiddenThailand',
      '#IslandLife',
      '#เกาะพยาม',
      '#เที่ยวเกาะพยาม',
      '#รีวิวที่พัก',
      '#ที่พักเกาะพยาม',
      '#เที่ยวระนอง',
      '#พักผ่อนฮีลใจ'
    ];

    // TikTok (Travel vibes, serene tropical escape)
    const vtiktokEng = `🇬🇧 🌿✨ Waking up to birdsong and ocean breeze on Koh Phayam Island! Discover ${engName} at Flower Power Farm Village: pure eco-luxury, organic gardens, private yoga sala & authentic Italian pizza by the jungle. Save this for your Thailand trip! 🏝️🥥🌊`;
    const vtiktokThai = `🇹🇭 🏝️✨ หนีความวุ่นวายมาพักผ่อนฮีลใจที่เกาะพยามกันนะคะ! สัมผัสความชิลที่ ${thaiName} ท่ามกลางสวนธรรมชาติสีเขียว ร่มรื่นสุดๆ ฟีลดีมากกก 🌿 ตื่นเช้ามาทานอาหารเช้าออร์แกนิก ฟังเสียงคลื่น แล้วฟินกับพิซซ่าอิตาเลียนแท้ๆ ปักหมุดด่วนเลยจ้า ห้ามพลาดน้าา 🛖💚`;
    const vtiktokCaption = `${vtiktokEng}\n\n${vtiktokThai}\n\n${villageViralHashtags.join(' ')}`;

    // Instagram (Aesthetic island oasis, boutique resort)
    const vigEng = `🇬🇧 🏝️ Escape the routine and reconnect with pure nature on Koh Phayam Island. Our ${engName} offers peaceful verandas, open-air living, and steps from untouched sandy beaches. Book direct on flowerpowervillage.com for best rates & exclusive island perks! 🌿✨`;
    const vigThai = `🇹🇭 🌿 วันหยุดนี้มาชาร์จแบตให้ตัวเองกันนะคะ! ${thaiName} บ้านพักสไตล์อีโค่ที่เกาะพยาม รายล้อมด้วยธรรมชาติร่มรื่น ฟีลดีมากกก ใกล้หาดอ่าวยายเพียงไม่กี่ก้าว พร้อมสปาสมุนไพรและอาหารอิตาเลียนสูตรต้นตำรับ ห้ามพลาดเลยน้าา จองตรงได้ที่ flowerpowervillage.com เลยจ้า 🛖🥥`;
    const vigCaption = `${vigEng}\n\n${vigThai}\n\n${villageViralHashtags.join(' ')}`;

    // Facebook (Inviting, organic hospitality, peaceful stay)
    const vfbEng = `🇬🇧 🌿 Looking for peace, untouched nature, and authentic hospitality? Discover ${engName} on Koh Phayam Island. Featuring organic garden breakfasts, herbal spa treatments, and authentic Italian dining under the island stars. Check availability and reserve your stay on www.flowerpowervillage.com. 🏝️✨`;
    const vfbThai = `🇹🇭 🏝️ ใครกำลังมองหาที่พักสงบๆ ท่ามกลางธรรมชาติบริสุทธิ์เพื่อพักผ่อนอย่างแท้จริง ต้องมาที่ ${thaiName} บนเกาะพยามเลยนะคะ! 💚 สัมผัสความอบอุ่นแบบเป็นกันเอง อาหารเช้าออร์แกนิกจากสวน สปาสมุนไพรเพื่อความผ่อนคลาย และอาหารอิตาเลียนเลิศรสริมป่าทรอปิคอล ตรวจสอบห้องว่างและจองตรงได้ที่ www.flowerpowervillage.com เลยจ้า ยินดีต้อนรับทุกคนน้าา 🌊🛖`;
    const vfbCaption = `${vfbEng}\n\n${vfbThai}\n\n${villageViralHashtags.join(' ')}`;

    // Google Maps Local Post (Direct booking, best rates)
    const vgoogleEng = `🇬🇧 🏝️ Book your peaceful stay at ${engName} - Flower Power Farm Village & Spa on Koh Phayam Island. Eco-bungalows, tropical gardens, and authentic Italian restaurant. Best rates guaranteed when booking direct on Google Maps. 🌿`;
    const vgoogleThai = `🇹🇭 🛖 จองที่พักผ่อนสบายๆ ที่ ${thaiName} - ฟลาวเวอร์พาวเวอร์ ฟาร์มวิลเลจ & สปา เกาะพยาม บังกะโลสไตล์อีโค่ สวนธรรมชาติร่มรื่น และร้านอาหารอิตาเลียนต้นตำรับ รับประกันราคาดีที่สุดเมื่อจองตรงนะคะ ยินดีต้อนรับจ้า! ✨`;
    const vgoogleCaption = `${vgoogleEng}\n\n${vgoogleThai}\n\n${['#KohPhayamHotel', '#EcoResortPhayam', '#KohPhayamAccommodation', '#KohPhayam', '#ที่พักเกาะพยาม', '#เที่ยวเกาะพยาม'].join(' ')}`;

    return {
      tiktok: {
        title: `🌿 ${engName} | Koh Phayam Island`,
        caption: vtiktokCaption,
        format: 'reel',
        tags: ['KohPhayam', 'ThailandTravel', 'EcoResort', 'IslandLife', 'HiddenGem', 'เที่ยวเกาะพยาม', 'เกาะพยาม']
      },
      instagram: {
        title: `🏝️ ${engName} - Flower Power Eco Village`,
        caption: vigCaption,
        format: 'story',
        tags: ['KohPhayamIsland', 'EcoTravel', 'BoutiqueResort', 'ThailandIslands', 'เที่ยวเกาะพยาม', 'รีวิวที่พัก']
      },
      facebook: {
        title: `🇬🇧🏝️ ${engName} - Tropical Sanctuary Koh Phayam`,
        caption: vfbCaption,
        format: 'feed',
        tags: ['KohPhayam', 'RanongIslands', 'EcoResortThailand', 'TravelThailand', 'ที่พักธรรมชาติ']
      },
      google: {
        title: `🏝️ ${engName} - Flower Power Village Koh Phayam`,
        caption: vgoogleCaption,
        format: 'google_post',
        tags: ['KohPhayamHotel', 'EcoResortPhayam', 'KohPhayamAccommodation']
      }
    };
  }
}

/**
 * Autopilot Campaign Generator:
 * Automatically schedules a multi-week campaign from dishes & village accommodations
 */
export function generateAutopilotCampaign({
  brand,
  startDate = new Date(),
  weeksCount = 4,
  postsPerWeek = 3,
  platforms = ['tiktok', 'instagram', 'facebook', 'google'] as SocialPlatform[]
}: {
  brand: BrandType;
  startDate?: Date;
  weeksCount?: number;
  postsPerWeek?: number;
  platforms?: SocialPlatform[];
}): ScheduledSocialPost[] {
  const eligibleDishes = getAllEligibleDishes();
  const villageAssets = VILLAGE_SOCIAL_ASSETS;
  const posts: ScheduledSocialPost[] = [];

  // Optimal Posting Schedule Times:
  // - Lunch slot: 11:30 AM
  // - Dinner slot: 17:45 PM
  // - Afternoon weekend: 15:00 PM
  const slotHours = [11, 17, 18];
  const slotMinutes = [30, 45, 0];

  let postIndex = 0;
  const startDayTime = new Date(startDate);
  // Start tomorrow morning at 11:30
  startDayTime.setDate(startDayTime.getDate() + 1);
  startDayTime.setHours(11, 30, 0, 0);

  const totalPostsToGenerate = weeksCount * postsPerWeek;
  const dayInterval = Math.max(1, Math.floor((weeksCount * 7) / totalPostsToGenerate));

  for (let i = 0; i < totalPostsToGenerate; i++) {
    const postDate = new Date(startDayTime);
    postDate.setDate(startDayTime.getDate() + i * dayInterval);
    const hourSlot = slotHours[i % slotHours.length];
    const minuteSlot = slotMinutes[i % slotMinutes.length];
    postDate.setHours(hourSlot, minuteSlot, 0, 0);

    let chosenTitle = '';
    let chosenMedia = '';
    let chosenPrice = 0;
    let chosenSourceId = '';
    let chosenCategory = '';
    let chosenTitleTh = '';
    let chosenTitleEn = '';
    let chosenTrajectory = 'auto_cinematic';
    let chosenAtmosphere = 'auto_context';
    let chosenAudioTrackId = '';
    let chosenAudioTrackName = '';
    let chosenAudioTrackSrc = '';
    let chosenAudioDuration = '';
    let chosenSlides: AutoCutSlide[] | undefined = undefined;
    let captions: Record<SocialPlatform, { title: string; caption: string; format: SocialFormat; tags: string[] }>;

    if (brand === 'pizza') {
      const concept = PIZZA_AUTOCUT_CONCEPTS[i % PIZZA_AUTOCUT_CONCEPTS.length];
      chosenTitle = concept.titleEn;
      chosenTitleEn = concept.titleEn;
      chosenTitleTh = concept.titleTh;
      chosenMedia = concept.slides[0].imageUrl;
      chosenPrice = concept.slides[0].price || 0;
      chosenSourceId = concept.id;
      chosenCategory = concept.category;
      chosenTrajectory = concept.slides[0].trajectory;
      chosenAtmosphere = 'warm_steam';
      chosenAudioTrackId = concept.audioTrackId;
      chosenAudioTrackName = concept.audioTrackName;
      chosenAudioTrackSrc = concept.audioTrackSrc;
      chosenAudioDuration = concept.audioDuration;
      chosenSlides = concept.slides;

      captions = generatePlatformCaptions({
        name: concept.titleEn,
        nameIt: concept.conceptName,
        nameTh: concept.titleTh,
        description: concept.descriptionEn,
        descriptionTh: concept.descriptionTh,
        price: chosenPrice,
        categoryName: concept.category,
        brand: 'pizza',
        date: postDate
      });
    } else {
      const concept = VILLAGE_AUTOCUT_CONCEPTS[i % VILLAGE_AUTOCUT_CONCEPTS.length];
      chosenTitle = concept.titleEn;
      chosenTitleEn = concept.titleEn;
      chosenTitleTh = concept.titleTh;
      chosenMedia = concept.slides[0].imageUrl;
      chosenPrice = concept.slides[0].price || 0;
      chosenSourceId = concept.id;
      chosenCategory = concept.category;
      chosenTrajectory = concept.slides[0].trajectory;
      chosenAtmosphere = 'sunbeams';
      chosenAudioTrackId = concept.audioTrackId;
      chosenAudioTrackName = concept.audioTrackName;
      chosenAudioTrackSrc = concept.audioTrackSrc;
      chosenAudioDuration = concept.audioDuration;
      chosenSlides = concept.slides;

      captions = generatePlatformCaptions({
        name: concept.titleEn,
        nameTh: concept.titleTh,
        description: concept.descriptionEn,
        descriptionTh: concept.descriptionTh,
        price: chosenPrice,
        categoryName: concept.category,
        brand: 'village',
        date: postDate
      });
    }

    // Determine platform and primary format for this slot
    const primaryPlatform = platforms[i % platforms.length];
    const activeCaptionData = captions[primaryPlatform] || captions.instagram;

    // 🎯 Tutti i post del motore AutoCut sono Video Reel 9:16 con Montaggio Multi-Scena e Suite Sonora MP3
    const editorialFormat = 'video_reel';
    const finalFormat: SocialFormat = 'reel';

    posts.push({
      id: `auto_${brand}_${Date.now()}_${i + 1}`,
      brand,
      platforms: [primaryPlatform],
      format: finalFormat,
      editorial_format: editorialFormat,
      scheduled_for: postDate.toISOString(),
      title: activeCaptionData.title,
      caption: activeCaptionData.caption,
      media_url: chosenMedia,
      source_item_id: chosenSourceId,
      source_category: chosenCategory,
      price: chosenPrice,
      status: 'scheduled',
      tags: activeCaptionData.tags,
      cta_url: brand === 'pizza' ? 'https://flowerpowerpizza.com' : 'https://flowerpowervillage.com',
      cta_label: brand === 'pizza' ? 'ORDER ONLINE' : 'BOOK ROOM',
      // Parametri AutoCut Multi-Scena
      audio_track_id: chosenAudioTrackId,
      audio_track_name: chosenAudioTrackName,
      audio_track_src: chosenAudioTrackSrc,
      audio_duration: chosenAudioDuration,
      camera_trajectory: chosenTrajectory,
      overlay_atmosphere: chosenAtmosphere,
      title_th: chosenTitleTh,
      title_en: chosenTitleEn,
      badge: chosenCategory,
      slides: chosenSlides
    });
  }

  return posts;
}

