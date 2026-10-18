import { menuData, MenuItem } from '../../pizza/data/menuData';
import { ACCOMMODATIONS } from '../../booking/resort/config/accommodations';

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
}

/**
 * Curated Village Gallery Highlights for Social Content
 */
export const VILLAGE_SOCIAL_ASSETS = [
  {
    id: 'jungle-villa',
    name: 'Jungle Villa with Tropical Garden',
    nameTh: 'จังเกิ้ลวิลล่า ท่ามกลางสวนธรรมชาติทรอปิคอล',
    category: 'VILLE',
    description: 'Immersed in lush nature, tropical flora, and birdsong. Ideal for families and private retreats on Koh Phayam.',
    descriptionTh: 'พักผ่อนท่ามกลางสวนเขียวขจี ฟังเสียงนกและธรรมชาติ เหมาะสำหรับการพักผ่อนแบบส่วนตัวและครอบครัวบนเกาะพยาม',
    price: 4800,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1080&auto=format&fit=crop&q=80',
    cta_url: 'https://flowerpowervillage.com/rooms/jungle-villa'
  },
  {
    id: 'peace-love-villa',
    name: 'Peace & Love Villa & Spa Retreat',
    nameTh: 'พีซ แอนด์ เลิฟ วิลล่า & สปารีทรีท เกาะพยาม',
    category: 'VILLE',
    description: 'Spacious master bedroom, outdoor open-air shower, private patio under palm trees, pure island serenity.',
    descriptionTh: 'ห้องนอนกว้างขวาง ฝักบัวอาบน้ำกลางแจ้งรับลมธรรมชาติ ระเบียงส่วนตัวใต้ร่มเงาทิวมะพร้าว สัมผัสความสงบที่แท้จริง',
    price: 2400,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1080&auto=format&fit=crop&q=80',
    cta_url: 'https://flowerpowervillage.com/rooms/peace-love-villa'
  },
  {
    id: 'eco-bungalow',
    name: 'Tropical Garden Bungalow',
    nameTh: 'ทรอปิคอล บังกะโล สไตล์อีโค่วิลเลจ',
    category: 'BUNGALOW',
    description: 'Authentic wooden architecture, hammock on private veranda, 5 minutes walk from Aow Yai beach.',
    descriptionTh: 'บ้านไม้สไตล์ทรอปิคอลแท้ๆ มีเปลญวนนอนเล่นรับลมที่ระเบียงส่วนตัว เดินเพียง 5 นาทีถึงหาดอ่าวยาย',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1080&auto=format&fit=crop&q=80',
    cta_url: 'https://flowerpowervillage.com/rooms/eco-bungalow'
  },
  {
    id: 'glamping-tent',
    name: 'Luxury Glamping Tent under the Stars',
    nameTh: 'เต็นท์แกลมปิ้งสุดหรู นอนดูดาวริมสวนออร์แกนิก',
    category: 'TENDE GLAMPING',
    description: 'Eco-chic tent surrounded by organic gardens, comfortable king-size bed, private terrace for meditation.',
    descriptionTh: 'เต็นท์สไตล์อีโค่ชิคท่ามกลางสวนเกษตรอินทรีย์ เตียงคิงไซส์แสนสบาย พร้อมระเบียงส่วนตัวสำหรับนั่งสมาธิและพักผ่อน',
    price: 1400,
    image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=1080&auto=format&fit=crop&q=80',
    cta_url: 'https://flowerpowervillage.com/rooms/glamping-tent'
  },
  {
    id: 'sunset-phayam',
    name: 'Sunset Magic & Yoga Sala',
    nameTh: 'ชมพระอาทิตย์ตกดินสุดโรแมนติก & ศาลาโยคะอ่าวยาย',
    category: 'EXPERIENCES',
    description: 'Golden hour at Long Beach (Aow Yai), organic herbal teas, yoga sessions, and candlelit Italian dining.',
    descriptionTh: 'สัมผัสช่วงเวลาแสงสีทองยามเย็นที่หาดอ่าวยาย จิบชาสมุนไพรออร์แกนิก ฝึกโยคะ และดินเนอร์อาหารอิตาเลียนใต้แสงเทียน',
    price: 0,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80',
    cta_url: 'https://flowerpowervillage.com'
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
      engCallout: '☀️ Crystal waters & golden sunsets — Koh Phayam high season at its absolute best! 🏝️'
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
 *   Thai text features authentic viral social media particles: นะคะ, จ้า, น้าา, ฟินมากกก, อร่อยแสงออกปาก, ชีสเยิ้มๆ, เตาฟืนหอมกรุ่น.
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
  const engName = item.nameIt || item.name;
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
      '#พิซซ่าเตาฟืน'
    ];

    // TikTok (Short, punchy, hyper-viral)
    const tiktokThai = `🇹🇭 🔥 สายกินต้องจัด! ${thaiName} อร่อยแสงออกปาก ฟินมากกก 🤤✨ แป้งหมักช้าสูตรลับ 48 ชม. กรอบนอกนุ่มหนึบ ชีสนำเข้าเยิ้มๆ อบสดใหม่ในเตาฟืนหอมกรุ่น นั่งทานชิลๆ ในสวนทรอปิคอลพร้อมน้ำตกธรรมชาติ ใกล้บ่อน้ำร้อนรักษะวาริน ใครมาระนองห้ามพลาดเลยนะคะ! สั่งเดลิเวอรี่ส่งร้อนๆ ถึงบ้านก็ฟินจ้า 🛵💨`;
    const tiktokEng = `🇬🇧 Craving authentic Italian pizza in Ranong? 🍕🔥 Crafted with 48h cold-fermented dough, baked to bubbling perfection in our traditional wood-fired stone oven, and topped with premium imported Italian ingredients. Dine in our lush tropical garden by the waterfall or order fast delivery to your door! ✨`;
    const tiktokCaption = `${tiktokThai}\n\n${tiktokEng}\n\n${pizzaViralHashtags.join(' ')}`;

    // Instagram (Visual, aesthetic, spotlight of the week)
    const igThai = `🇹🇭 ✨ อร่อยแสงออกปาก! ${thaiName} เมนูไฮไลท์ห้ามพลาดประจำสัปดาห์ 🍕🤤 ชีสนำเข้าเยิ้มๆ แป้งหมักช้า 48 ชม. สไตล์อิตาเลียนแท้ กรอบนอกนุ่มหนึบ อบสดใหม่ถาดต่อถาดจากเตาฟืนหินแบบดั้งเดิม (${item.price} ฿) นั่งทานชิลๆ ในสวนน้ำตกธรรมชาติใกล้บ่อน้ำร้อนรักษะวาริน หรือจะกดสั่งเดลิเวอรี่ส่งตรงถึงบ้านบน flowerpowerpizza.com ก็สะดวกสุดๆ เลยนะคะ สั่งเลยจ้า 🛵💨`;
    const igEng = `🇬🇧 🍕 Spotlight of the Week: handcrafted ${engName} (${item.price} THB). Prepared fresh daily with 48h cold-fermented dough and genuine Italian passion in our open-air garden near Raksawarin Hot Springs. Dine with us or order online at flowerpowerpizza.com! ✨`;
    const igCaption = `${igThai}\n\n${igEng}\n\n${pizzaViralHashtags.join(' ')}`;

    // Facebook (Storytelling, authentic craftsmanship, 10% welcome privilege)
    const fbThai = `🇹🇭 🍕 สัมผัสรสชาติอิตาเลียนแท้ๆ ที่ระนองกับ ${thaiName}! 🇮🇹✨ ทุกถาดรังสรรค์ด้วยความพิถีพิถัน แป้งหมักเย็นยาวนาน 48 ชั่วโมง อบในเตาฟืนหินโบราณจนได้ขอบพองกรอบนอกนุ่มใน เสิร์ฟคู่กับไวน์อิตาเลียนนำเข้า ท่ามกลางสวนทรอปิคอลเขียวขจีและน้ำตกธรรมชาติสุดสดชื่น 🌿 จะแวะมาทานที่ร้านพร้อมรับส่วนลด 10% หรือสั่ง Takeaway / Fast Delivery ส่งร้อนถึงบ้านผ่าน www.flowerpowerpizza.com ก็ฟินสุดๆ เลยนะคะ แวะมาเช็คอินกันได้เลยจ้า! 🛵💨`;
    const fbEng = `🇬🇧 Indulge in authentic Italian craftsmanship in Ranong! Our ${engName} is crafted with 48h cold fermentation and baked in our traditional wood-fired oven. Pair it with an imported Italian wine in our lush tropical garden with a natural waterfall. Takeaway & Fast delivery available on www.flowerpowerpizza.com or book your dinner table with 10% welcome privilege! 🍕🍷`;
    const fbCaption = `${fbThai}\n\n${fbEng}\n\n${pizzaViralHashtags.join(' ')}`;

    // Google Maps Local Post (Local SEO, opening hours & quick order)
    const googleThai = `🇹🇭 🍕 ลิ้มลอง ${thaiName} พิซซ่าเตาฟืนสูตรต้นตำรับอิตาเลียนแท้ ที่ Flower Power Pizza ระนอง! แป้งหมักช้า 48 ชม. ชีสและวัตถุดิบนำเข้า บรรยากาศสวนน้ำตกธรรมชาติใกล้บ่อน้ำร้อนรักษะวาริน เปิดบริการทุกวัน ทั้งนั่งทานที่ร้านและเดลิเวอรี่ส่งด่วนในเมืองระนองนะคะ กดสั่งออนไลน์ได้ทันทีเลยจ้า! ✨`;
    const googleEng = `🇬🇧 Taste authentic ${engName} at Flower Power Pizza Ranong! Wood-fired oven, 48h slow dough fermentation, San Marzano tomatoes. Open daily for Dine-in and Fast Delivery in Ranong city. Click Order Now for online ordering. 🍕🛵`;
    const googleCaption = `${googleThai}\n\n${googleEng}\n\n${['#PizzaRanong', '#BestFoodRanong', '#ItalianRestaurantRanong', '#RanongFood', '#รีวิวระนอง', '#ของกินระนอง'].join(' ')}`;

    return {
      tiktok: {
        title: `🍕 ${thaiName} เตาฟืนแท้ Ranong`,
        caption: tiktokCaption,
        format: 'reel',
        tags: ['RanongFood', 'PizzaRanong', 'KohPhayam', 'ItalianPizza', 'WoodFiredPizza', 'อร่อยบอกต่อ', 'รีวิวระนอง']
      },
      instagram: {
        title: `🔥 ${thaiName} - Authentic Italian Pizza Ranong`,
        caption: igCaption,
        format: 'reel',
        tags: ['Ranong', 'PizzaRanong', 'ItalianFoodThailand', 'FoodieTravel', 'KohPhayam', 'อร่อยบอกต่อ']
      },
      facebook: {
        title: `🇹🇭🍕 ${thaiName} - Pizza เตาฟืนสไตล์อิตาเลียนแท้ ระนอง`,
        caption: fbCaption,
        format: 'feed',
        tags: ['RanongDining', 'ItalianCuisine', 'WoodFiredPizza', 'FlowerPowerPizza', 'รีวิวระนอง']
      },
      google: {
        title: `🍕 ${engName} - Wood-fired Pizza Ranong`,
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
    const vtiktokThai = `🇹🇭 🏝️✨ หนีความวุ่นวายมาพักผ่อนฮีลใจที่เกาะพยามกันนะคะ! สัมผัสความชิลที่ ${thaiName} ท่ามกลางสวนธรรมชาติสีเขียว ร่มรื่นสุดๆ ฟีลดีมากกก 🌿 ตื่นเช้ามาทานอาหารเช้าออร์แกนิก ฟังเสียงคลื่น แล้วฟินกับพิซซ่าเตาฟืนแท้ๆ ปักหมุดด่วนเลยจ้า ห้ามพลาดน้าา 🛖💚`;
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
    let captions: Record<SocialPlatform, { title: string; caption: string; format: SocialFormat; tags: string[] }>;

    if (brand === 'pizza') {
      const dishEntry = eligibleDishes[postIndex % eligibleDishes.length];
      postIndex++;
      chosenTitle = dishEntry.item.nameIt || dishEntry.item.name;
      chosenMedia = dishEntry.item.image;
      chosenPrice = dishEntry.item.price;
      chosenSourceId = dishEntry.item.id;
      chosenCategory = dishEntry.categoryName;

      captions = generatePlatformCaptions({
        name: dishEntry.item.name,
        nameIt: dishEntry.item.nameIt,
        nameTh: dishEntry.item.nameTh,
        description: dishEntry.item.description,
        descriptionTh: dishEntry.item.descriptionTh,
        price: dishEntry.item.price,
        categoryName: dishEntry.categoryName,
        brand: 'pizza',
        date: postDate
      });
    } else {
      const villageEntry = villageAssets[postIndex % villageAssets.length];
      postIndex++;
      chosenTitle = villageEntry.name;
      chosenMedia = villageEntry.image;
      chosenPrice = villageEntry.price;
      chosenSourceId = villageEntry.id;
      chosenCategory = villageEntry.category;

      captions = generatePlatformCaptions({
        name: villageEntry.name,
        nameTh: villageEntry.nameTh,
        description: villageEntry.description,
        descriptionTh: villageEntry.descriptionTh,
        price: villageEntry.price,
        categoryName: villageEntry.category,
        brand: 'village',
        date: postDate
      });
    }

    // Determine platform and primary format for this slot
    // Alternates formats: Reel (TikTok/IG) -> Feed (FB/IG) -> Local Post (Google)
    const primaryPlatform = platforms[i % platforms.length];
    const activeCaptionData = captions[primaryPlatform] || captions.instagram;

    posts.push({
      id: `auto_${brand}_${Date.now()}_${i + 1}`,
      brand,
      platforms: [primaryPlatform],
      format: activeCaptionData.format,
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
      cta_label: brand === 'pizza' ? 'ORDER ONLINE' : 'BOOK ROOM'
    });
  }

  return posts;
}

