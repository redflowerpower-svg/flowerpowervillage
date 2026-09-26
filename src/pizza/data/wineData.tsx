import React from 'react';

export interface WineCardData {
  id: string;
  title: string;
  titleIt?: string;
  titleEn?: string;
  titleTh?: string;
  titleDe?: string;
  categorySubtitle: string;
  subtitleIt?: string;
  subtitleEn?: string;
  subtitleTh?: string;
  subtitleDe?: string;
  categoryType: 'red' | 'white' | 'rose' | 'sparkling';
  flag: string;
  description: string;
  descriptionIt?: string;
  descriptionEn?: string;
  descriptionTh?: string;
  descriptionDe?: string;
  alcohol: string;
  price: string;
  bannerColor: string;
  bottleImage: string;
  showLogoBadge: boolean;
  bottleScale: number;
  bottleScaleX?: number;
  bottleOffsetX?: number;
  bottleOffsetY: number;
  isAvailable: boolean;
  updatedAt?: string;
}

export const WINE_COUNTRY_OPTIONS = [
  { flag: '🇮🇹', code: 'IT', label: 'Italia', names: { IT: 'ITALIA', EN: 'ITALY', TH: 'อิตาลี', DE: 'ITALIEN' } },
  { flag: '🇫🇷', code: 'FR', label: 'Francia', names: { IT: 'FRANCIA', EN: 'FRANCE', TH: 'ฝรั่งเศส', DE: 'FRANKREICH' } },
  { flag: '🇦🇺', code: 'AU', label: 'Australia', names: { IT: 'AUSTRALIA', EN: 'AUSTRALIA', TH: 'ออสเตรเลีย', DE: 'AUSTRALIEN' } },
  { flag: '🇨🇱', code: 'CL', label: 'Cile', names: { IT: 'CILE', EN: 'CHILE', TH: 'ชิลี', DE: 'CHILE' } },
  { flag: '🇪🇸', code: 'ES', label: 'Spagna', names: { IT: 'SPAGNA', EN: 'SPAIN', TH: 'สเปน', DE: 'SPANIEN' } },
  { flag: '🇿🇦', code: 'ZA', label: 'Sudafrica', names: { IT: 'SUDAFRICA', EN: 'SOUTH AFRICA', TH: 'แอฟริกาใต้', DE: 'SÜDAFRIKA' } },
  { flag: '🇩🇪', code: 'DE', label: 'Germania', names: { IT: 'GERMANIA', EN: 'GERMANY', TH: 'เยอรมนี', DE: 'DEUTSCHLAND' } },
  { flag: '🇦🇷', code: 'AR', label: 'Argentina', names: { IT: 'ARGENTINA', EN: 'ARGENTINA', TH: 'อาร์เจนตินา', DE: 'ARGENTINIEN' } },
  { flag: '🇺🇸', code: 'US', label: 'Stati Uniti', names: { IT: 'STATI UNITI', EN: 'UNITED STATES', TH: 'สหรัฐอเมริกา', DE: 'USA' } },
  { flag: '🇳🇿', code: 'NZ', label: 'Nuova Zelanda', names: { IT: 'NUOVA ZELANDA', EN: 'NEW ZEALAND', TH: 'นิวซีแลนด์', DE: 'NEUSEELAND' } },
  { flag: '🇵🇹', code: 'PT', label: 'Portogallo', names: { IT: 'PORTOGALLO', EN: 'PORTUGAL', TH: 'โปรตุเกส', DE: 'PORTUGAL' } },
  { flag: '🇲🇽', code: 'MX', label: 'Messico', names: { IT: 'MESSICO', EN: 'MEXICO', TH: 'เม็กซิโก', DE: 'MEXIKO' } },
  { flag: '🇬🇷', code: 'GR', label: 'Grecia', names: { IT: 'GRECIA', EN: 'GREECE', TH: 'กรีซ', DE: 'GRIECHENLAND' } },
  { flag: '🇦🇹', code: 'AT', label: 'Austria', names: { IT: 'AUSTRIA', EN: 'AUSTRIA', TH: 'ออสเตรีย', DE: 'ÖSTERREICH' } },
  { flag: '🇨🇭', code: 'CH', label: 'Svizzera', names: { IT: 'SVIZZERA', EN: 'SWITZERLAND', TH: 'สวิตเซอร์แลนด์', DE: 'SCHWEIZ' } },
  { flag: '🇬🇧', code: 'GB', label: 'Regno Unito', names: { IT: 'REGNO UNITO', EN: 'UNITED KINGDOM', TH: 'สหราชอาณาจักร', DE: 'VEREINIGTES KÖNIGREICH' } },
  { flag: '🇭🇺', code: 'HU', label: 'Ungheria', names: { IT: 'UNGHERIA', EN: 'HUNGARY', TH: 'ฮังการี', DE: 'UNGARN' } },
  { flag: '🇬🇪', code: 'GE', label: 'Georgia', names: { IT: 'GEORGIA', EN: 'GEORGIA', TH: 'จอร์เจีย', DE: 'GEORGIEN' } },
  { flag: '🇹🇷', code: 'TR', label: 'Turchia', names: { IT: 'TURCHIA', EN: 'TURKEY', TH: 'ตุรกี', DE: 'TÜRKEI' } },
  { flag: '🇱🇧', code: 'LB', label: 'Libano', names: { IT: 'LIBANO', EN: 'LEBANON', TH: 'เลบานอน', DE: 'LIBANON' } },
];

export const COUNTRY_SORT_ORDER: Record<string, number> = {
  'IT': 1, '🇮🇹': 1, 'ITALIA': 1, 'ITALY': 1,
  'FR': 2, '🇫🇷': 2, 'FRANCIA': 2, 'FRANCE': 2,
  'AU': 3, '🇦🇺': 3, 'AUSTRALIA': 3,
  'CL': 4, '🇨🇱': 4, 'CILE': 4, 'CHILE': 4,
  'ES': 5, '🇪🇸': 5, 'SPAGNA': 5, 'SPAIN': 5,
  'ZA': 6, '🇿🇦': 6, 'SUDAFRICA': 6, 'SOUTH AFRICA': 6,
  'DE': 7, '🇩🇪': 7, 'GERMANIA': 7, 'GERMANY': 7,
  'AR': 8, '🇦🇷': 8, 'ARGENTINA': 8,
  'US': 9, '🇺🇸': 9, 'STATI UNITI': 9, 'USA': 9,
  'NZ': 10, '🇳🇿': 10, 'NUOVA ZELANDA': 10, 'NEW ZEALAND': 10,
  'PT': 11, '🇵🇹': 11, 'PORTOGALLO': 11, 'PORTUGAL': 11,
  'MX': 12, '🇲🇽': 12, 'MESSICO': 12, 'MEXICO': 12,
};

export const getCountryRank = (flagOrCountry?: string): number => {
  if (!flagOrCountry) return 999;
  const key = flagOrCountry.trim().toUpperCase();
  if (COUNTRY_SORT_ORDER[key] !== undefined) return COUNTRY_SORT_ORDER[key];
  for (const [k, v] of Object.entries(COUNTRY_SORT_ORDER)) {
    if (key.includes(k)) return v;
  }
  return 99;
};

export const sortWinesByCountryOrder = <T extends { flag?: string; categorySubtitle?: string; subtitleIt?: string }>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    const rankA = getCountryRank(a.flag || a.categorySubtitle || a.subtitleIt);
    const rankB = getCountryRank(b.flag || b.categorySubtitle || b.subtitleIt);
    if (rankA !== rankB) return rankA - rankB;
    return 0;
  });
};

export const WINE_TYPE_OPTIONS = [
  { 
    id: 'red' as const, 
    label: 'Vino Rosso', 
    names: { IT: 'VINO ROSSO', EN: 'RED WINE', TH: 'ไวน์แดง', DE: 'ROTWEIN' },
    defaultColor: '#8b0000'
  },
  { 
    id: 'white' as const, 
    label: 'Vino Bianco', 
    names: { IT: 'VINO BIANCO', EN: 'WHITE WINE', TH: 'ไวน์ขาว', DE: 'WEISSWEIN' },
    defaultColor: '#d4af37'
  },
  { 
    id: 'rose' as const, 
    label: 'Vino Rosato', 
    names: { IT: 'VINO ROSATO', EN: 'ROSÉ WINE', TH: 'ไวน์โรเซ่', DE: 'ROSÉWEIN' },
    defaultColor: '#db2777'
  },
  { 
    id: 'sparkling' as const, 
    label: 'Spumante', 
    names: { IT: 'SPUMANTE', EN: 'SPARKLING WINE', TH: 'สปาร์กลิงไวน์', DE: 'SCHAUMWEIN' },
    defaultColor: '#eab308'
  }
];

export const resolveWineCategoryType = (wine: { categoryType?: string; categorySubtitle?: string; title?: string; subtitleIt?: string; titleIt?: string; name?: string }): 'red' | 'white' | 'rose' | 'sparkling' => {
  // 1. Analyze subtitle line 1 (which explicitly contains the category in the Studio)
  const sub = (wine.categorySubtitle || wine.subtitleIt || '').trim().toUpperCase();
  const [firstSubLine = ''] = sub.split('\n');

  if (firstSubLine.includes('SPUMANT') || firstSubLine.includes('SPARKLING') || firstSubLine.includes('SCHAUMWEIN') || firstSubLine.includes('PROSECCO') || firstSubLine.includes('BOLLICIN') || firstSubLine.includes('CHAMPAGNE') || firstSubLine.includes('CAVA') || firstSubLine.includes('BRUT')) {
    return 'sparkling';
  }
  if (firstSubLine.includes('ROSAT') || firstSubLine.includes('ROSÉ') || firstSubLine.includes('ROSE') || firstSubLine.includes('ROSÈ') || firstSubLine.includes('ROSÉWEIN') || firstSubLine.includes('โรเซ่')) {
    return 'rose';
  }
  if (firstSubLine.includes('BIANC') || firstSubLine.includes('WHITE') || firstSubLine.includes('WEISSWEIN') || firstSubLine.includes('ไวน์ขาว')) {
    return 'white';
  }
  if (firstSubLine.includes('ROSS') || firstSubLine.includes('RED') || firstSubLine.includes('ROTWEIN') || firstSubLine.includes('ไวน์แดง')) {
    return 'red';
  }

  // 2. Specific wine title & grape matching (case-insensitive)
  const titleText = `${wine.title || ''} ${wine.titleIt || ''} ${wine.name || ''}`.toLowerCase();

  // Sparkling checks
  if (titleText.includes('prosecco') || titleText.includes('spumant') || titleText.includes('champagne') || titleText.includes('franciacorta') || titleText.includes('trentodoc') || titleText.includes('cava') || titleText.includes('brut') || titleText.includes('millesimato') || titleText.includes('sparkling') || titleText.includes('extra dry')) {
    return 'sparkling';
  }

  // Rosé checks
  if (titleText.includes('rosé') || titleText.includes('rosato') || titleText.includes('rose de france') || titleText.includes('côtes de provence') || titleText.includes('cotes de provence') || titleText.includes('chiaretto') || titleText.includes('cerasuolo')) {
    return 'rose';
  }

  // Red grape & appellation checks (Cabernet Sauvignon MUST be red!)
  if (
    titleText.includes('cabernet') ||
    titleText.includes('primitivo') ||
    titleText.includes('nero d\'avola') ||
    titleText.includes('nero davola') ||
    titleText.includes('poggio alto') ||
    titleText.includes('chianti') ||
    titleText.includes('shiraz') ||
    titleText.includes('syrah') ||
    titleText.includes('merlot') ||
    titleText.includes('malbec') ||
    titleText.includes('sangiovese') ||
    titleText.includes('barolo') ||
    titleText.includes('nebbiolo') ||
    titleText.includes('montepulciano') ||
    titleText.includes('valpolicella') ||
    titleText.includes('amarone') ||
    titleText.includes('brunello') ||
    titleText.includes('barbera') ||
    titleText.includes('dolcetto') ||
    titleText.includes('aglianico') ||
    titleText.includes('carmenere') ||
    titleText.includes('pinot noir') ||
    titleText.includes('pinot nero') ||
    titleText.includes('zinfandel') ||
    titleText.includes('tempranillo') ||
    titleText.includes('garnacha') ||
    titleText.includes('grenache') ||
    titleText.includes('vino rosso') ||
    titleText.includes('red wine') ||
    titleText.includes('rotwein')
  ) {
    return 'red';
  }

  // White grape & appellation checks
  if (
    titleText.includes('sauvignon blanc') ||
    titleText.includes('chardonnay') ||
    titleText.includes('pinot grigio') ||
    titleText.includes('pinot gris') ||
    titleText.includes('pinot bianco') ||
    titleText.includes('vermentino') ||
    titleText.includes('trebbiano') ||
    titleText.includes('soave') ||
    titleText.includes('gavi') ||
    titleText.includes('cortese') ||
    titleText.includes('arneis') ||
    titleText.includes('fiano') ||
    titleText.includes('greco di tufo') ||
    titleText.includes('falanghina') ||
    titleText.includes('pecorino') ||
    titleText.includes('verdicchio') ||
    titleText.includes('lugana') ||
    titleText.includes('ribolla') ||
    titleText.includes('friulano') ||
    titleText.includes('riesling') ||
    titleText.includes('gewürztraminer') ||
    titleText.includes('chenin blanc') ||
    titleText.includes('viognier') ||
    titleText.includes('vino bianco') ||
    titleText.includes('white wine') ||
    titleText.includes('weisswein')
  ) {
    return 'white';
  }

  // 3. If explicit categoryType is defined and valid, respect it
  if (wine.categoryType && ['red', 'white', 'rose', 'sparkling'].includes(wine.categoryType)) {
    return wine.categoryType as 'red' | 'white' | 'rose' | 'sparkling';
  }

  return 'red';
};

export const INITIAL_WINE_COLLECTION: WineCardData[] = [
  {
    id: "wine-1787561327966",
    title: "GRENACHE/SYRAH\nROUGE DE FRANCE\nLes Solstices Cuvée",
    titleIt: "GRENACHE/SYRAH\nROUGE DE FRANCE\nLes Solstices Cuvée",
    titleEn: "GRENACHE/SYRAH\nROUGE DE FRANCE\nLes Solstices Cuvée",
    titleTh: "GRENACHE/SYRAH\nROUGE DE FRANCE\nLes Solstices Cuvée",
    titleDe: "GRENACHE/SYRAH\nROUGE DE FRANCE\nLes Solstices Cuvée",
    categorySubtitle: "RED WINE\nFRANCE",
    subtitleIt: "VINO ROSSO\nFRANCIA",
    subtitleEn: "RED WINE\nFRANCE",
    subtitleTh: "ไวน์แดง\nฝรั่งเศส",
    subtitleDe: "ROTWEIN\nFRANKREICH",
    categoryType: "red",
    flag: "🇫🇷",
    description: "This French red wine displays a charming bouquet of ripe red berries with subtle earthy nuances. On the palate, it is approachable, well-balanced, and smooth, featuring gentle tannins. It makes a versatile choice that pairs comfortably with everyday meals, grilled meats, poultry, and casual cheese selections.",
    descriptionIt: "Questo vino rosso francese offre un affascinante bouquet di frutti di bosco maturi con sottili note terrose. Al palato è accessibile, ben bilanciato e morbido, con tannini gentili. È una scelta versatile che si abbina facilmente ai pasti di tutti i giorni, carni alla griglia, pollame e selezioni di formaggi informali.",
    descriptionEn: "This French red wine displays a charming bouquet of ripe red berries with subtle earthy nuances. On the palate, it is approachable, well-balanced, and smooth, featuring gentle tannins. It makes a versatile choice that pairs comfortably with everyday meals, grilled meats, poultry, and casual cheese selections.",
    descriptionTh: "ไวน์แดงฝรั่งเศสนี้เผยกลิ่นหอมอันมีเสน่ห์ของเบอร์รี่แดงสุก ผสานกลิ่นดินอันละเอียดอ่อน บนเพดานปากให้สัมผัสนุ่มนวล กลมกล่อม สมดุลดี มีแทนนินที่ละมุน เป็นตัวเลือกที่หลากหลาย เข้ากับมื้ออาหารในชีวิตประจำวัน เนื้อย่าง เนื้อสัตว์ปีก และชีสทั่วไปได้อย่างลงตัว",
    descriptionDe: "Dieser französische Rotwein zeigt ein charmantes Bouquet von reifen roten Beeren mit subtilen erdigen Nuancen. Am Gaumen ist er zugänglich, ausgewogen und weich, mit sanften Tanninen. Er ist eine vielseitige Wahl, die sich gut mit alltäglichen Mahlzeiten, gegrilltem Fleisch, Geflügel und ungezwungenen Käseauswahlen kombinieren lässt.",
    alcohol: "12,5%",
    price: "850 ฿",
    bannerColor: "#8b0000",
    bottleImage: "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/grenache-syrah-rouge-de-france-1787561327211.webp",
    showLogoBadge: false,
    bottleScale: 352,
    bottleScaleX: 85,
    bottleOffsetX: 0,
    bottleOffsetY: 2,
    isAvailable: true,
    updatedAt: "2026-08-24",
  },
  {
    id: "wine-1787560584231",
    title: "NEGROAMARO\nIGT\nPoggio Alto",
    titleIt: "NEGROAMARO\nIGT\nPoggio Alto",
    titleEn: "NEGROAMARO\nIGT\nPoggio Alto",
    titleTh: "NEGROAMARO\nIGT\nPoggio Alto",
    titleDe: "NEGROAMARO\nIGT\nPoggio Alto",
    categorySubtitle: "RED WINE\nITALY - PUGLIA",
    subtitleIt: "VINO ROSSO\nITALIA - PUGLIA",
    subtitleEn: "RED WINE\nITALY - PUGLIA",
    subtitleTh: "ไวน์แดง\nอิตาลี - แคว้นปูลยา",
    subtitleDe: "ROTWEIN\nITALIEN - APULIEN",
    categoryType: "red",
    flag: "🇮🇹",
    description: "This ruby-red wine offers a generous bouquet of red berry and stone fruit with subtle spicy notes. On the palate it is fleshy, powerful, and balanced, with soft tannins and a persistent finish. It proves to be a perfect pairing for red meats, roasted dishes, and aged cheeses.",
    descriptionIt: "Questo vino rosso rubino offre un generoso profumo di frutti a bacca rossa e di pietra con sottili note speziate. Al palato è carnoso, potente e bilanciato, con tannini morbidi e un finale persistente. Si rivela un abbinamento perfetto per carni rosse, piatti arrostiti e formaggi stagionati.",
    descriptionEn: "This ruby-red wine offers a generous bouquet of red berry and stone fruit with subtle spicy notes. On the palate it is fleshy, powerful, and balanced, with soft tannins and a persistent finish. It proves to be a perfect pairing for red meats, roasted dishes, and aged cheeses.",
    descriptionTh: "ไวน์แดงสีทับทิมนี้ให้กลิ่นหอมของผลไม้ตระกูลเบอร์รี่สีแดงและผลไม้สโตนอย่างเต็มเปี่ยม พร้อมกลิ่นเครื่องเทศอันละเอียดอ่อน เมื่อเข้าปากให้สัมผัสแน่นเนื้อ มีพลัง และสมดุล ด้วยแทนนินที่นุ่มนวลและรสชาติที่ยาวนาน เข้ากันได้อย่างลงตัวกับเนื้อแดง อาหารย่าง และชีสแก่",
    descriptionDe: "Dieser rubinrote Wein bietet ein großzügiges Bukett von roten Beeren und Steinobst mit subtilen würzigen Noten. Am Gaumen ist er fleischig, kräftig und ausgewogen, mit weichen Tanninen und einem anhaltenden Abgang. Er erweist sich als perfekte Begleitung zu rotem Fleisch, Bratengerichten und gereiftem Käse.",
    alcohol: "12,5%",
    price: "1190 ฿",
    bannerColor: "#8b0000",
    bottleImage: "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/negroamaro-igt-poggio-alto-1787560583283.webp",
    showLogoBadge: false,
    bottleScale: 366,
    bottleScaleX: 92,
    bottleOffsetX: 0,
    bottleOffsetY: 1,
    isAvailable: true,
    updatedAt: "2026-08-24",
  },
  {
    id: "wine-1787560230368",
    title: "PINOT GRIGIO\nIGT\nPoggio Alto",
    titleIt: "PINOT GRIGIO\nIGT\nPoggio Alto",
    titleEn: "PINOT GRIGIO\nIGT\nPoggio Alto",
    titleTh: "PINOT GRIGIO\nIGT\nPoggio Alto",
    titleDe: "PINOT GRIGIO\nIGT\nPoggio Alto",
    categorySubtitle: "WHITE WINE\nITALY - SICILY",
    subtitleIt: "VINO BIANCO\nITALIA - SICILIA",
    subtitleEn: "WHITE WINE\nITALY - SICILY",
    subtitleTh: "ไวน์ขาว\nอิตาลี - ซิซิลี",
    subtitleDe: "WEISSWEIN\nITALIEN - SIZILIEN",
    categoryType: "white",
    flag: "🇮🇹",
    description: "This refreshing white wine reveals delicate aromas of white flowers, crisp green apple, and juicy pear. On the palate it is light, clean, and well-balanced, with a lively and zesty finish. It works excellently as an aperitif and pairs wonderfully with fish dishes, shellfish, and light summer salads.",
    descriptionIt: "Questo vino bianco rinfrescante rivela delicati aromi di fiori bianchi, mela verde croccante e pera succosa. Al palato è leggero, pulito e ben bilanciato, con un finale vivace e brioso. Funziona eccellentemente come aperitivo e si sposa a meraviglia con piatti di pesce, crostacei e leggere insalate estive.",
    descriptionEn: "This refreshing white wine reveals delicate aromas of white flowers, crisp green apple, and juicy pear. On the palate it is light, clean, and well-balanced, with a lively and zesty finish. It works excellently as an aperitif and pairs wonderfully with fish dishes, shellfish, and light summer salads.",
    descriptionTh: "ไวน์ขาวสดชื่นนี้เผยกลิ่นหอมละมุนของดอกไม้สีขาว แอปเปิ้ลเขียวกรอบ และลูกแพร์ฉ่ำน้ำ เมื่อเข้าปากให้ความรู้สึกเบาสบาย สะอาด และสมดุล จบด้วยความสดชื่นมีชีวิตชีวา เหมาะเป็นไวน์เรียกน้ำย่อย และเข้ากันได้อย่างยอดเยี่ยมกับเมนูปลา อาหารทะเล และสลัดเบาๆ ในฤดูร้อน",
    descriptionDe: "Dieser erfrischende Weißwein offenbart zarte Aromen von weißen Blüten, knackigem grünem Apfel und saftiger Birne. Am Gaumen ist er leicht, klar und ausgewogen mit einem lebendigen, spritzigen Abgang. Er eignet sich hervorragend als Aperitif und passt wunderbar zu Fischgerichten, Schalentieren und leichten Sommersalaten.",
    alcohol: "12%",
    price: "1190 ฿",
    bannerColor: "#8b0000",
    bottleImage: "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/pinot-grigio-igt-poggio-alto-1787560416876.webp",
    showLogoBadge: false,
    bottleScale: 656,
    bottleScaleX: 92,
    bottleOffsetX: 0,
    bottleOffsetY: 0,
    isAvailable: true,
    updatedAt: "2026-08-24",
  },
  {
    id: "wine-1787558200348",
    title: "CHARDONNAY\nCRISP WHITE\nHolla",
    titleIt: "CHARDONNAY\nCRISP WHITE\nHolla",
    titleEn: "CHARDONNAY\nCRISP WHITE\nHolla",
    titleTh: "CHARDONNAY\nCRISP WHITE\nHolla",
    titleDe: "CHARDONNAY\nCRISP WHITE\nHolla",
    categorySubtitle: "WHITE WINE\nCHILE",
    subtitleIt: "VINO BIANCO\nCILE",
    subtitleEn: "WHITE WINE\nCHILE",
    subtitleTh: "ไวน์ขาว\nชิลี",
    subtitleDe: "WEISSWEIN\nCHILE",
    categoryType: "white",
    flag: "🇨🇱",
    description: "This refreshing white wine offers a crisp, dry profile with vibrant acidity and a subtle hint of vanilla. Easy-drinking and unpretentious, it pairs beautifully with seafood, spicy dishes, light appetizers, or casual everyday meals.",
    descriptionIt: "Questo vino bianco rinfrescante offre un profilo croccante e secco con un'acidità vibrante e un sottile tocco di vaniglia. Facile da bere e senza pretese, si abbina meravigliosamente a frutti di mare, piatti piccanti, antipasti leggeri o pasti quotidiani informali.",
    descriptionEn: "This refreshing white wine offers a crisp, dry profile with vibrant acidity and a subtle hint of vanilla. Easy-drinking and unpretentious, it pairs beautifully with seafood, spicy dishes, light appetizers, or casual everyday meals.",
    descriptionTh: "ไวน์ขาวสดชื่นนี้ให้รสชาติกรอบแห้ง มีความเป็นกรดสดใส และกลิ่นวานิลลาอ่อนๆ ดื่มง่ายไม่ซับซ้อน เข้ากันได้อย่างยอดเยี่ยมกับอาหารทะเล อาหารรสจัด ของว่างเบาๆ หรือมื้ออาหารในชีวิตประจำวัน",
    descriptionDe: "Dieser erfrischende Weißwein bietet ein knackiges, trockenes Profil mit lebendiger Säure und einem dezenten Hauch von Vanille. Unkompliziert und unprätentiös zu trinken, passt er wunderbar zu Meeresfrüchten, würzigen Gerichten, leichten Vorspeisen oder ungezwungenen Alltagsmahlzeiten.",
    alcohol: "12,5%",
    price: "550 ฿",
    bannerColor: "#8b0000",
    bottleImage: "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/chardonnay-crisp-white-holla-1787558199226.webp",
    showLogoBadge: false,
    bottleScale: 271,
    bottleScaleX: 104,
    bottleOffsetX: 3,
    bottleOffsetY: 3,
    isAvailable: true,
    updatedAt: "2026-08-24",
  },
  {
    id: "wine-1787557940817",
    title: "CABERNET SAUVIGNON\nVELVET RED\nHolla",
    titleIt: "CABERNET SAUVIGNON\nVELVET RED\nHolla",
    titleEn: "CABERNET SAUVIGNON\nVELVET RED\nHolla",
    titleTh: "CABERNET SAUVIGNON\nVELVET RED\nHolla",
    titleDe: "CABERNET SAUVIGNON\nVELVET RED\nHolla",
    categorySubtitle: "RED WINE\nCHILE",
    subtitleIt: "VINO ROSSO\nCILE",
    subtitleEn: "RED WINE\nCHILE",
    subtitleTh: "ไวน์แดง\nชิลี",
    subtitleDe: "ROTWEIN\nCHILE",
    categoryType: "white",
    flag: "🇨🇱",
    description: "This easy-drinking red wine offers a light, refreshing acidity with a fully dry profile and a subtle astringency. Its simple, approachable character pairs wonderfully with casual everyday meals, simple savory snacks, and relaxed social gatherings.",
    descriptionIt: "Questo vino rosso facile da bere offre una leggera e rinfrescante acidità con un profilo completamente secco e una leggera astringenza. Il suo carattere semplice e accessibile si sposa meravigliosamente con pasti quotidiani informali, semplici snack salati e ritrovi sociali rilassati.",
    descriptionEn: "This easy-drinking red wine offers a light, refreshing acidity with a fully dry profile and a subtle astringency. Its simple, approachable character pairs wonderfully with casual everyday meals, simple savory snacks, and relaxed social gatherings.",
    descriptionTh: "ไวน์แดงที่ดื่มง่ายตัวนี้ให้ความสดชื่นด้วยความเป็นกรดเบาๆ มีรสแห้งสนิทและความฝาดเล็กน้อย บุคลิกที่เรียบง่ายและเข้าถึงง่ายเข้ากันได้อย่างยอดเยี่ยมกับมื้ออาหารในชีวิตประจำวัน ของว่างรสเค็ม และการสังสรรค์แบบสบายๆ",
    descriptionDe: "Dieser unkomplizierte Rotwein bietet eine leichte, erfrischende Säure mit einem vollständig trockenen Profil und einer dezenten Adstringenz. Sein schlichter, zugänglicher Charakter passt wunderbar zu lockeren Alltagsgerichten, einfachen herzhaften Snacks und entspannten geselligen Zusammenkünften.",
    alcohol: "12,5%",
    price: "550 ฿",
    bannerColor: "#8b0000",
    bottleImage: "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/cabernet-sauvignon-velvet-red-1787557938570.webp",
    showLogoBadge: false,
    bottleScale: 254,
    bottleScaleX: 102,
    bottleOffsetX: 3,
    bottleOffsetY: 0,
    isAvailable: true,
    updatedAt: "2026-08-24",
  },
  {
    id: "wine-1787557385611",
    title: "CHAMPAGNE\nCOSTELLORE\nBlanc De Blancs",
    titleIt: "CHAMPAGNE\nCOSTELLORE\nBlanc De Blancs",
    titleEn: "CHAMPAGNE\nCOSTELLORE\nBlanc De Blancs",
    titleTh: "CHAMPAGNE\nCOSTELLORE\nBlanc De Blancs",
    titleDe: "CHAMPAGNE\nCOSTELLORE\nBlanc De Blancs",
    categorySubtitle: "SPARKLING WINE\nITALY",
    subtitleIt: "BOLLICINE\nITALIA",
    subtitleEn: "SPARKLING WINE\nITALY",
    subtitleTh: "สปาร์กลิงไวน์\nอิตาลี",
    subtitleDe: "SCHAUMWEIN\nITALIEN",
    categoryType: "sparkling",
    flag: "🇮🇹",
    description: "A refined sparkling wine made from Chardonnay grapes, showcasing bright acidity, vibrant freshness, and delicate citrus notes, with a crisp and refreshing finish. Ideal for celebrations and special occasions.",
    descriptionIt: "Uno spumante raffinato ottenuto da uve Chardonnay, che esprime una brillante acidità, una freschezza vibrante e delicate note di agrumi, con un finale secco e rinfrescante. Ideale per celebrazioni e occasioni speciali.",
    descriptionEn: "A refined sparkling wine made from Chardonnay grapes, showcasing bright acidity, vibrant freshness, and delicate citrus notes, with a crisp and refreshing finish. Ideal for celebrations and special occasions.",
    descriptionTh: "สปาร์กลิงไวน์ชั้นเลิศจากองุ่นชาร์ดอนเนย์ เผยความสดใสของกรด ความสดชื่นมีชีวิตชีวา และกลิ่นซิตรัสอันละเอียดอ่อน จบท้ายด้วยความ crisp และสดชื่น เหมาะสำหรับการเฉลิมฉลองและโอกาสพิเศษ",
    descriptionDe: "Ein raffinierter Schaumwein aus Chardonnay-Trauben, der eine brillante Säure, lebendige Frische und delikate Zitrusnoten zeigt, mit einem knackigen und erfrischenden Abgang. Ideal für Feiern und besondere Anlässe.",
    alcohol: "12%",
    price: "1190 ฿",
    bannerColor: "#8b0000",
    bottleImage: "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/champagne-costellore-blanc-de-1787557384659.webp",
    showLogoBadge: false,
    bottleScale: 459,
    bottleScaleX: 97,
    bottleOffsetX: 0,
    bottleOffsetY: 1,
    isAvailable: true,
    updatedAt: "2026-08-24",
  },
  {
    id: "wine-1787557031415",
    title: "PROSECCO SUPERIORE\nDOCG - EXTRA DRY\nTorresella",
    titleIt: "PROSECCO SUPERIORE\nDOCG - EXTRA DRY\nTorresella",
    titleEn: "PROSECCO SUPERIORE\nDOCG - EXTRA DRY\nTorresella",
    titleTh: "PROSECCO SUPERIORE\nDOCG - EXTRA DRY\nTorresella",
    titleDe: "PROSECCO SUPERIORE\nDOCG - EXTRA DRY\nTorresella",
    categorySubtitle: "SPARKLING WINE\nITALY - VENETO",
    subtitleIt: "BOLLICINE\nITALIA - VENETO",
    subtitleEn: "SPARKLING WINE\nITALY - VENETO",
    subtitleTh: "สปาร์กลิงไวน์\nอิตาลี - เวเนโต",
    subtitleDe: "SCHAUMWEIN\nITALIEN - VENETIEN",
    categoryType: "sparkling",
    flag: "🇮🇹",
    description: "This Venetian sparkling wine displays a pale straw-yellow color and a fresh, fragrant profile with delicate aromas of green apple, pear, and spring flowers. On the palate, it is harmonious and creamy, featuring a pleasant fruitiness, making it an excellent aperitif and food companion.",
    descriptionIt: "Questo vino spumante veneto presenta un colore giallo paglierino tenue e un profilo fresco e fragrante, con delicati aromi di mela verde, pera e fiori di primavera. Al palato è armonioso e cremoso, con una piacevole fruttuosità, che lo rende un eccellente aperitivo e un ottimo compagno a tavola.",
    descriptionEn: "This Venetian sparkling wine displays a pale straw-yellow color and a fresh, fragrant profile with delicate aromas of green apple, pear, and spring flowers. On the palate, it is harmonious and creamy, featuring a pleasant fruitiness, making it an excellent aperitif and food companion.",
    descriptionTh: "สปาร์กลิงไวน์จากแคว้นเวเนโตนี้มีสีเหลืองฟางอ่อน สดชื่น หอมละมุนด้วยกลิ่นของแอปเปิ้ลเขียว ลูกแพร์ และดอกไม้ฤดูใบไม้ผลิ เมื่อเข้าปากให้ความรู้สึกกลมกล่อม นุ่มนวล มีกลิ่นผลไม้ที่ชวนเพลิดเพลิน เป็นทั้งไวน์เรียกน้ำย่อยและคู่กับอาหารได้อย่างยอดเยี่ยม",
    descriptionDe: "Dieser venezianische Schaumwein präsentiert sich in einem blassen Strohgelb und einem frischen, duftigen Profil mit zarten Aromen von grünem Apfel, Birne und Frühlingsblumen. Am Gaumen ist er harmonisch und cremig, mit einer angenehmen Fruchtigkeit, was ihn zu einem ausgezeichneten Aperitif und Speisenbegleiter macht.",
    alcohol: "11%",
    price: "1290 ฿",
    bannerColor: "#8b0000",
    bottleImage: "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/prosecco-doc-torresella-1787557030323.webp",
    showLogoBadge: false,
    bottleScale: 279,
    bottleScaleX: 94,
    bottleOffsetX: -8,
    bottleOffsetY: 2,
    isAvailable: true,
    updatedAt: "2026-08-24",
  },
  {
    id: "wine-1787556458930",
    title: "CABERNET SHIRAZ\nBIRCHGROVE\nBird’s Block Cuvee",
    titleIt: "CABERNET SHIRAZ\nBIRCHGROVE\nBird’s Block Cuvee",
    titleEn: "CABERNET SHIRAZ\nBIRCHGROVE\nBird’s Block Cuvee",
    titleTh: "CABERNET SHIRAZ\nBIRCHGROVE\nเบิร์ดส์ บล็อค คูเว่",
    titleDe: "CABERNET SHIRAZ\nBIRCHGROVE\nBird’s Block Cuvee",
    categorySubtitle: "RED WINE\nAUSTRALIA - SOUTH",
    subtitleIt: "VINO ROSSO\nAUSTRALIA - SUD",
    subtitleEn: "RED WINE\nAUSTRALIA - SOUTH",
    subtitleTh: "ไวน์แดง\nออสเตรเลีย - ใต้",
    subtitleDe: "ROTWEIN\nAUSTRALIEN - SÜDEN",
    categoryType: "red",
    flag: "🇦🇺",
    description: "This approachable Australian red wine reveals inviting aromas of ripe dark berries with a touch of spice. On the palate, it is smooth, well-rounded, and easygoing, offering a pleasant finish. It pairs wonderfully with casual everyday dinners, grilled meats, savory pasta dishes, and relaxed social gatherings.",
    descriptionIt: "Questo vino rosso australiano accessibile rivela invitanti aromi di frutti di bosco scuri maturi con un tocco di spezie. Al palato è morbido, ben bilanciato e di facile beva, con un finale piacevole. Si abbina perfettamente a cene informali di tutti i giorni, carni alla griglia, piatti di pasta saporiti e incontri conviviali rilassati.",
    descriptionEn: "This approachable Australian red wine reveals inviting aromas of ripe dark berries with a touch of spice. On the palate, it is smooth, well-rounded, and easygoing, offering a pleasant finish. It pairs wonderfully with casual everyday dinners, grilled meats, savory pasta dishes, and relaxed social gatherings.",
    descriptionTh: "ไวน์แดงออสเตรเลียที่เข้าถึงง่ายนี้เผยกลิ่นหอมชวนดื่มของเบอร์รี่สีเข้มสุกพร้อมกลิ่นเครื่องเทศอ่อนๆ บนเพดานปากให้สัมผัสนุ่มนวล กลมกล่อม และผ่อนคลาย จบด้วยความยาวที่เพลิดเพลิน เข้ากันได้อย่างยอดเยี่ยมกับมื้อเย็นสบายๆ ในชีวิตประจำวัน เนื้อย่าง จานพาสต้าเข้มข้น และสังสรรค์กับเพื่อนฝูงอย่างเป็นกันเอง",
    descriptionDe: "Dieser zugängliche australische Rotwein offenbart einladende Aromen von reifen dunklen Beeren mit einer Note von Gewürzen. Im Gaumen ist er weich, rund und unkompliziert, mit einem angenehmen Abgang. Er passt wunderbar zu ungezwungenen Alltagsessen, gegrilltem Fleisch, herzhaften Pastagerichten und entspannten geselligen Zusammenkünften.",
    alcohol: "13,5%",
    price: "790 ฿",
    bannerColor: "#8b0000",
    bottleImage: "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/chardonnay-birchgrove-bird-s-b-1787556458235.webp",
    showLogoBadge: false,
    bottleScale: 129,
    bottleScaleX: 98,
    bottleOffsetX: 0,
    bottleOffsetY: 0,
    isAvailable: true,
    updatedAt: "2026-08-24",
  },
  {
    id: "wine-1787556358661",
    title: "CHARDONNAY\nBIRCHGROVE\nBird’s Block Cuvee",
    titleIt: "CHARDONNAY\nBIRCHGROVE\nBird’s Block Cuvee",
    titleEn: "CHARDONNAY\nBIRCHGROVE\nBird’s Block Cuvee",
    titleTh: "CHARDONNAY\nBIRCHGROVE\nBird’s Block Cuvee",
    titleDe: "CHARDONNAY\nBIRCHGROVE\nBird’s Block Cuvee",
    categorySubtitle: "WHITE WINE\nAUSTRALIA - SOUTH WEST",
    subtitleIt: "VINO BIANCO\nAUSTRALIA - SUDOVEST",
    subtitleEn: "WHITE WINE\nAUSTRALIA - SOUTH WEST",
    subtitleTh: "ไวน์ขาว\nออสเตรเลีย - ตะวันตกเฉียงใต้",
    subtitleDe: "WEISSWEIN\nAUSTRALIEN - SÜDWESTEN",
    categoryType: "white",
    flag: "🇦🇺",
    description: "This refreshing Australian white wine offers delightful aromas of crisp green apple, citrus zest, and subtle tropical fruits. On the palate, it is light, clean, and vibrant, with a soft, refreshing finish. Perfect as an aperitif, it pairs wonderfully with seafood, salads, and poultry.",
    descriptionIt: "Questo rinfrescante vino bianco australiano offre deliziosi aromi di mela verde croccante, scorza di agrumi e sottili frutti tropicali. Al palato è leggero, pulito e vibrante, con un finale morbido e rinfrescante. Perfetto come aperitivo, si abbina meravigliosamente con frutti di mare, insalate e pollame.",
    descriptionEn: "This refreshing Australian white wine offers delightful aromas of crisp green apple, citrus zest, and subtle tropical fruits. On the palate, it is light, clean, and vibrant, with a soft, refreshing finish. Perfect as an aperitif, it pairs wonderfully with seafood, salads, and poultry.",
    descriptionTh: "ไวน์ขาวออสเตรเลียสดชื่นนี้ให้กลิ่นหอมของแอปเปิ้ลเขียวกรอบ เปลือกส้ม และผลไม้เมืองร้อนอย่างละมุน บนเพดานปากเบาสบาย สะอาด และมีชีวิตชีวา จบท้ายด้วยความนุ่มนวลสดชื่น เหมาะเป็นเครื่องดื่มเรียกน้ำย่อย เข้ากันได้อย่างยอดเยี่ยมกับอาหารทะเล สลัด และเนื้อสัตว์ปีก",
    descriptionDe: "Dieser erfrischende australische Weißwein bietet köstliche Aromen von knackigem grünem Apfel, Zitruszesten und subtilen tropischen Früchten. Am Gaumen ist er leicht, klar und lebendig, mit einem weichen, erfrischenden Abgang. Perfekt als Aperitif, passt er wunderbar zu Meeresfrüchten, Salaten und Geflügel.",
    alcohol: "12%",
    price: "790 ฿",
    bannerColor: "#8b0000",
    bottleImage: "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/chardonnay-birchgrove-bird-s-b-1787561708539.webp",
    showLogoBadge: false,
    bottleScale: 109,
    bottleScaleX: 98,
    bottleOffsetX: 0,
    bottleOffsetY: 0,
    isAvailable: true,
    updatedAt: "2026-08-24",
  },
  {
    id: "wine-1787556198475",
    title: "SPARKLING ROSÉ\nDEMI-SEC\nGraziosa Canoro",
    titleIt: "SPARKLING ROSÉ\nDEMI-SEC\nGraziosa Canoro",
    titleEn: "SPARKLING ROSÉ\nDEMI-SEC\nGraziosa Canoro",
    titleTh: "SPARKLING ROSÉ\nDEMI-SEC\nGraziosa Canoro",
    titleDe: "SPARKLING ROSÉ\nDEMI-SEC\nGraziosa Canoro",
    categorySubtitle: "ROSÉ WINE\nITALY",
    subtitleIt: "VINO ROSATO\nITALIA",
    subtitleEn: "ROSÉ WINE\nITALY",
    subtitleTh: "ไวน์โรเซ่\nอิตาลี",
    subtitleDe: "ROSÉWEIN\nITALIEN",
    categoryType: "sparkling",
    flag: "🇮🇹",
    description: "This charming Italian sparkling rosé reveals delightful aromas of fresh strawberries, raspberries, and delicate floral notes. On the palate, it is pleasantly off-dry, creamy, and refreshing with a lively finish. It serves as a wonderful aperitif and pairs beautifully with light desserts, fresh fruit, or appetizers.",
    descriptionIt: "Questo affascinante rosé spumante italiano rivela deliziosi aromi di fragole fresche, lamponi e delicate note floreali. Al palato è piacevolmente abboccato, cremoso e rinfrescante con un finale vivace. Si rivela un meraviglioso aperitivo e si abbina splendidamente a dessert leggeri, frutta fresca o antipasti.",
    descriptionEn: "This charming Italian sparkling rosé reveals delightful aromas of fresh strawberries, raspberries, and delicate floral notes. On the palate, it is pleasantly off-dry, creamy, and refreshing with a lively finish. It serves as a wonderful aperitif and pairs beautifully with light desserts, fresh fruit, or appetizers.",
    descriptionTh: "โรเซ่สปาร์กลิงไวน์สัญชาติอิตาเลียนสุดมีเสน่ห์นี้เผยกลิ่นหอมอันน่าหลงใหลของสตรอว์เบอร์รีสด ราสป์เบอร์รี และกลิ่นดอกไม้อ่อน ๆ เมื่อลิ้มรสให้สัมผัสที่หวานเล็กน้อย ครีมมี่ สดชื่น และจบได้อย่างมีชีวิตชีวา เหมาะเป็นเครื่องดื่มเรียกน้ำย่อยชั้นเลิศ และเข้ากันได้อย่างลงตัวกับของหวานเบา ๆ ผลไม้สด หรืออาหารเรียกน้ำย่อย",
    descriptionDe: "Dieser charmante italienische Rosé-Schaumwein offenbart verführerische Aromen von frischen Erdbeeren, Himbeeren und zarten floralen Noten. Am Gaumen ist er angenehm restsüß, cremig und erfrischend mit einem lebendigen Abgang. Er eignet sich wunderbar als Aperitif und passt hervorragend zu leichten Desserts, frischem Obst oder Vorspeisen.",
    alcohol: "11%",
    price: "990 ฿",
    bannerColor: "#8b0000",
    bottleImage: "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/rose-semi-sec-graziosa-1787556194882.webp",
    showLogoBadge: false,
    bottleScale: 135,
    bottleScaleX: 87,
    bottleOffsetX: 0,
    bottleOffsetY: 0,
    isAvailable: true,
    updatedAt: "2026-08-24",
  },
  {
    id: "wine-1787555985555",
    title: "PRIMITIVO PUGLIA\nIGT PEPA\nNatale Verga",
    titleIt: "PRIMITIVO PUGLIA\nIGT PEPA\nNatale Verga",
    titleEn: "PRIMITIVO PUGLIA\nIGT PEPA\nNatale Verga",
    titleTh: "PRIMITIVO PUGLIA\nIGT PEPA\nNatale Verga",
    titleDe: "PRIMITIVO PUGLIA\nIGT PEPA\nNatale Verga",
    categorySubtitle: "RED WINE\nITALY - PUGLIA",
    subtitleIt: "VINO ROSSO\nITALIA - PUGLIA",
    subtitleEn: "RED WINE\nITALY - PUGLIA",
    subtitleTh: "ไวน์แดง\nอิตาลี - แคว้นปูลยา",
    subtitleDe: "ROTWEIN\nITALIEN - APULIEN",
    categoryType: "red",
    flag: "🇮🇹",
    description: "This rich southern Italian red wine offers inviting aromas of ripe dark cherries, blackberries, and subtle spicy notes. On the palate, it is full-bodied, warm, and velvety with smooth tannins and a generous finish. It pairs wonderfully with roasted meats, rich pasta dishes, and mature cheeses.",
    descriptionIt: "Questo ricco vino rosso del sud Italia offre invitanti aromi di ciliegie scure mature, more e sottili note speziate. Al palato è corposo, caldo e vellutato, con tannini morbidi e un finale generoso. Si abbina meravigliosamente con carni arrosto, piatti di pasta ricchi e formaggi stagionati.",
    descriptionEn: "This rich southern Italian red wine offers inviting aromas of ripe dark cherries, blackberries, and subtle spicy notes. On the palate, it is full-bodied, warm, and velvety with smooth tannins and a generous finish. It pairs wonderfully with roasted meats, rich pasta dishes, and mature cheeses.",
    descriptionTh: "ไวน์แดงอันเข้มข้นจากอิตาลีตอนใต้ให้กลิ่นหอมชวนดื่มของเชอร์รี่ดำสุก แบล็กเบอร์รี่ และกลิ่นเครื่องเทศละมุน เมื่อดื่มแล้วให้สัมผัสเต็มรส อบอุ่น นุ่มนวลดุจกำมะหยี่ มีแทนนินเนียนละเอียดและจบอย่างยาวนาน เข้ากันได้อย่างยอดเยี่ยมกับเนื้อย่าง พาสต้าเข้มข้น และชีสแก่",
    descriptionDe: "Dieser gehaltvolle Rotwein aus Süditalien verführt mit Aromen von reifen dunklen Kirschen, Brombeeren und dezenten würzigen Noten. Am Gaumen präsentiert er sich vollmundig, warm und samtig mit weichen Tanninen und einem großzügigen Abgang. Er passt wunderbar zu Braten, kräftigen Pastagerichten und gereiftem Käse.",
    alcohol: "14%",
    price: "1290 ฿",
    bannerColor: "#8b0000",
    bottleImage: "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/primitivo-igt-natale-verga-1787555984602.webp",
    showLogoBadge: false,
    bottleScale: 363,
    bottleScaleX: 96,
    bottleOffsetX: -2,
    bottleOffsetY: 1,
    isAvailable: true,
    updatedAt: "2026-08-24",
  },
  {
    id: "wine-1787555839725",
    title: "NERO D'AVOLA\nDOC\nCanoro",
    titleIt: "NERO D'AVOLA\nDOC\nCanoro",
    titleEn: "NERO D'AVOLA\nDOC\nCanoro",
    titleTh: "NERO D'AVOLA\nDOC\nCanoro",
    titleDe: "NERO D'AVOLA\nDOC\nCanoro",
    categorySubtitle: "RED WINE\nITALY - SICILY",
    subtitleIt: "VINO ROSSO\nITALIA - SICILIA",
    subtitleEn: "RED WINE\nITALY - SICILY",
    subtitleTh: "ไวน์แดง\nอิตาลี - ซิซิลี",
    subtitleDe: "ROTWEIN\nITALIEN - SIZILIEN",
    categoryType: "red",
    flag: "🇮🇹",
    description: "This vibrant Sicilian red wine offers rich aromas of ripe black cherries, plums, and a hint of Mediterranean spices. On the palate, it is medium-bodied, smooth, and fruit-forward with soft tannins and a pleasant, balanced finish. It pairs wonderfully with roasted red meats, pasta dishes with rich tomato sauces, and semi-aged cheeses.",
    descriptionIt: "Questo vivace vino rosso siciliano offre ricchi aromi di amarene mature, prugne e un accenno di spezie mediterranee. Al palato è di corpo medio, morbido e fruttato, con tannini morbidi e un finale piacevole ed equilibrato. Si abbina meravigliosamente con carni rosse arrosto, piatti di pasta con sughi di pomodoro ricchi e formaggi semi-stagionati.",
    descriptionEn: "This vibrant Sicilian red wine offers rich aromas of ripe black cherries, plums, and a hint of Mediterranean spices. On the palate, it is medium-bodied, smooth, and fruit-forward with soft tannins and a pleasant, balanced finish. It pairs wonderfully with roasted red meats, pasta dishes with rich tomato sauces, and semi-aged cheeses.",
    descriptionTh: "ไวน์แดงซิซิลีที่มีชีวิตชีวานี้ให้กลิ่นหอมเข้มข้นของเชอร์รี่ดำสุก พลัม และเครื่องเทศเมดิเตอร์เรเนียนเล็กน้อย เมื่อดื่มแล้วมีบอดี้ปานกลาง นุ่มนวล โดดเด่นด้วยกลิ่นผลไม้ แทนนินนุ่ม และจบอย่างสมดุลที่น่าพึงพอใจ เข้ากันได้ดีกับเนื้อแดงย่าง พาสต้าซอสมะเขือเทศเข้มข้น และชีสกึ่งบ่ม",
    descriptionDe: "Dieser lebendige sizilianische Rotwein bietet reiche Aromen von reifen schwarzen Kirschen, Pflaumen und einem Hauch mediterraner Gewürze. Am Gaumen ist er mittelkräftig, weich und fruchtbetont mit weichen Tanninen und einem angenehmen, ausgewogenen Abgang. Er passt wunderbar zu gegrilltem rotem Fleisch, Pasta-Gerichten mit reichhaltigen Tomatensaucen und halbgereiftem Käse.",
    alcohol: "13,5%",
    price: "1290 ฿",
    bannerColor: "#8b0000",
    bottleImage: "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/nero-d-avola-doc-canoro-1787561786315.webp",
    showLogoBadge: false,
    bottleScale: 110,
    bottleScaleX: 107,
    bottleOffsetX: 0,
    bottleOffsetY: 0,
    isAvailable: true,
    updatedAt: "2026-08-24",
  },
  {
    id: "wine-1787497189793",
    title: "PRIMITIVO\nIGT\nPepa Nera",
    titleIt: "PRIMITIVO\nIGT\nPepa Nera",
    titleEn: "PRIMITIVO\nIGT\nPepa Nera",
    titleTh: "PRIMITIVO\nIGT\nPepa Nera",
    titleDe: "PRIMITIVO\nIGT\nPepa Nera",
    categorySubtitle: "RED WINE\nITALY - PUGLIA",
    subtitleIt: "VINO ROSSO\nITALIA - PUGLIA",
    subtitleEn: "RED WINE\nITALY - PUGLIA",
    subtitleTh: "ไวน์แดง\nอิตาลี - แคว้นปูลยา",
    subtitleDe: "ROTWEIN\nITALIEN - APULIEN",
    categoryType: "red",
    flag: "🇮🇹",
    description: "This rich southern Italian red wine offers enticing aromas of ripe blackberries, dark plums, and sweet spices. On the palate, it is full-bodied, warm, and velvety with soft, rounded tannins and a smooth, lingering finish. It pairs wonderfully with robust red meats, rich pasta dishes, and mature cheeses.",
    descriptionIt: "Questo ricco vino rosso del sud Italia offre invitanti aromi di more mature, prugne scure e spezie dolci. Al palato è corposo, caldo e vellutato, con tannini morbidi e rotondi e un finale liscio e persistente. Si abbina meravigliosamente con carni rosse robuste, piatti di pasta ricchi e formaggi stagionati.",
    descriptionEn: "This rich southern Italian red wine offers enticing aromas of ripe blackberries, dark plums, and sweet spices. On the palate, it is full-bodied, warm, and velvety with soft, rounded tannins and a smooth, lingering finish. It pairs wonderfully with robust red meats, rich pasta dishes, and mature cheeses.",
    descriptionTh: "ไวน์แดงเนื้อเข้มข้นจากอิตาลีตอนใต้ให้กลิ่นหอมเย้ายวนของแบล็กเบอร์รีสุก พลัมเข้ม และเครื่องเทศหวาน เมื่อเข้าปากให้สัมผัสเต็มรส อุ่นละมุน นุ่มนวลดั่งกำมะหยี่ แทนนินนุ่มกลมกล่อม จบท้ายยาวนุ่มนวล เข้ากันได้อย่างยอดเยี่ยมกับเนื้อแดงรสเข้มข้น พาสต้าซอสเข้มข้น และชีสแก่",
    descriptionDe: "Dieser gehaltvolle Rotwein aus Süditalien verführt mit verlockenden Aromen von reifen Brombeeren, dunklen Pflaumen und süßen Gewürzen. Am Gaumen ist er vollmundig, warm und samtig mit weichen, runden Tanninen und einem sanften, anhaltenden Abgang. Er passt wunderbar zu kräftigem rotem Fleisch, reichhaltigen Pastagerichten und gereiftem Käse.",
    alcohol: "14%",
    price: "1290 ฿",
    bannerColor: "#8b0000",
    bottleImage: "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/primitivo-igt-pepa-nera-1787556227844.webp",
    showLogoBadge: false,
    bottleScale: 108,
    bottleScaleX: 100,
    bottleOffsetX: 0,
    bottleOffsetY: 0,
    isAvailable: true,
    updatedAt: "2026-08-24",
  },
  {
    id: "wine-primitivo-pepa",
    title: "BARBERA\nDOC\nSan Silvestro",
    titleIt: "BARBERA\nDOC\nSan Silvestro",
    titleEn: "BARBERA\nDOC\nSan Silvestro",
    titleTh: "BARBERA\nDOC\nSan Silvestro",
    titleDe: "BARBERA\nDOC\nSan Silvestro",
    categorySubtitle: "RED WINE\nITALY - PIEMONTE",
    subtitleIt: "VINO ROSSO\nITALIA - PIEMONTE",
    subtitleEn: "RED WINE\nITALY - PIEMONTE",
    subtitleTh: "ไวน์แดง\nอิตาลี - ปีเยมอนเต",
    subtitleDe: "ROTWEIN\nITALIEN - PIEMONT",
    categoryType: "red",
    flag: "🇮🇹",
    description: "This vibrant Italian red wine offers inviting aromas of fresh red cherries, blackberries, and subtle hints of violet. On the palate, it is medium-bodied, lively, and well-structured with bright acidity and smooth tannins, leading to a clean, refreshing finish. It pairs wonderfully with classic Italian pasta dishes, roasted poultry, cold cuts, and medium-aged cheeses.",
    descriptionIt: "Questo vivace vino rosso italiano offre invitanti aromi di ciliegie fresche, more e sottili sentori di violetta. Al palato è di corpo medio, vivace e ben strutturato, con acidità brillante e tannini morbidi, che conducono a un finale pulito e rinfrescante. Si abbina meravigliosamente con piatti classici della pasta italiana, pollame arrosto, affettati e formaggi a media stagionatura.",
    descriptionEn: "This vibrant Italian red wine offers inviting aromas of fresh red cherries, blackberries, and subtle hints of violet. On the palate, it is medium-bodied, lively, and well-structured with bright acidity and smooth tannins, leading to a clean, refreshing finish. It pairs wonderfully with classic Italian pasta dishes, roasted poultry, cold cuts, and medium-aged cheeses.",
    descriptionTh: "ไวน์แดงอิตาเลียนที่มีชีวิตชีวานี้ให้กลิ่นหอมชวนดื่มของเชอร์รี่แดงสด แบล็กเบอร์รี่ และกลิ่นไวโอเล็ตอันละเอียดอ่อน เมื่อดื่มแล้วให้ความรู้สึกเต็มปากปานกลาง มีชีวิตชีวา และมีโครงสร้างที่ดี ด้วยความเป็นกรดที่สดใสและแทนนินที่นุ่มนวล นำไปสู่รสชาติที่สะอาดและสดชื่น เหมาะอย่างยิ่งกับอาหารพาสต้าอิตาเลียนคลาสสิก เนื้อสัตว์ปีกย่าง เนื้อเย็น และชีสที่บ่มปานกลาง",
    descriptionDe: "Dieser lebendige italienische Rotwein bietet verlockende Aromen von frischen Kirschen, Brombeeren und subtilen Veilchennoten. Am Gaumen ist er mittelkräftig, lebendig und gut strukturiert mit heller Säure und weichen Tanninen, die zu einem klaren, erfrischenden Abgang führen. Er passt wunderbar zu klassischen italienischen Pastagerichten, Bratgeflügel, Aufschnitt und mittelaltem Käse.",
    alcohol: "13,5%",
    price: "1190฿",
    bannerColor: "#8b0000",
    bottleImage: "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/barbera-piemonte-sansilvestro-1787556228432.webp",
    showLogoBadge: true,
    bottleScale: 310,
    bottleScaleX: 100,
    bottleOffsetX: 0,
    bottleOffsetY: 1,
    isAvailable: true,
    updatedAt: "2026-08-24",
  },
  {
    id: "wine-pinot-grigio",
    title: "CHARDONNAY\nDOC\nSan Silavstro",
    titleIt: "CHARDONNAY\nDOC\nSan Silavstro",
    titleEn: "CHARDONNAY\nDOC\nSan Silavstro",
    titleTh: "CHARDONNAY\nDOC\nSan Silavstro",
    titleDe: "CHARDONNAY\nDOC\nSan Silavstro",
    categorySubtitle: "WHITE WINE\nITALY - PIEMONTE",
    subtitleIt: "VINO BIANCO\nITALIA - PIEMONTE",
    subtitleEn: "WHITE WINE\nITALY - PIEMONTE",
    subtitleTh: "ไวน์ขาว\nอิตาลี - ปีเยมอนเต",
    subtitleDe: "WEISSWEIN\nITALIEN - PIEMONT",
    categoryType: "white",
    flag: "🇮🇹",
    description: "This elegant Italian white wine presents delightful aromas of green apple, ripe pear, and subtle hints of white flowers. On the palate, it is fresh, clean, and well-balanced with a smooth and refreshing finish. It serves as an excellent aperitif and pairs wonderfully with fish dishes, poultry, and light appetizers.",
    descriptionIt: "Questo elegante vino bianco italiano presenta deliziosi aromi di mela verde, pera matura e sottili sentori di fiori bianchi. Al palato è fresco, pulito e ben bilanciato, con un finale morbido e rinfrescante. Si presta come ottimo aperitivo e si abbina meravigliosamente con piatti di pesce, pollame e antipasti leggeri.",
    descriptionEn: "This elegant Italian white wine presents delightful aromas of green apple, ripe pear, and subtle hints of white flowers. On the palate, it is fresh, clean, and well-balanced with a smooth and refreshing finish. It serves as an excellent aperitif and pairs wonderfully with fish dishes, poultry, and light appetizers.",
    descriptionTh: "ไวน์ขาวอิตาเลียนอันหรูหรานี้เผยกลิ่นหอมอันน่าหลงใหลของแอปเปิ้ลเขียว แพร์สุก และกลิ่นดอกไม้ขาวอันละเอียดอ่อน เมื่อลิ้มรสให้ความรู้สึกสดชื่น สะอาด และสมดุล จบด้วยความนุ่มนวลและสดชื่น เหมาะเป็นไวน์เรียกน้ำย่อยชั้นเลิศ และเข้ากันได้อย่างยอดเยี่ยมกับเมนูปลา สัตว์ปีก และของทานเล่นเบาๆ",
    descriptionDe: "Dieser elegante italienische Weißwein präsentiert verführerische Aromen von grünem Apfel, reifer Birne und subtilen Anklängen von weißen Blüten. Am Gaumen ist er frisch, klar und ausgewogen mit einem sanften und erfrischenden Abgang. Er eignet sich hervorragend als Aperitif und passt wunderbar zu Fischgerichten, Geflügel und leichten Vorspeisen.",
    alcohol: "12,5%",
    price: "1190฿",
    bannerColor: "#b45309",
    bottleImage: "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/chardonnay-piemonte-sansilvest-1787556228923.webp",
    showLogoBadge: true,
    bottleScale: 98,
    bottleScaleX: 102,
    bottleOffsetX: 0,
    bottleOffsetY: 0,
    isAvailable: true,
    updatedAt: "2026-08-24",
  },
  {
    id: "wine-poggio-alto-rosso",
    title: "TRADITION BRUT\nDOMAINE CUVÉE\nCold River",
    titleIt: "TRADITION BRUT\nDOMAINE CUVÉE\nCold River",
    titleEn: "TRADITION BRUT\nDOMAINE CUVÉE\nCold River",
    titleTh: "TRADITION BRUT\nDOMAINE CUVÉE\nCold River",
    titleDe: "TRADITION BRUT\nDOMAINE CUVÉE\nCold River",
    categorySubtitle: "SPARKLING WINE\nITALY",
    subtitleIt: "BOLLICINE\nITALIA",
    subtitleEn: "SPARKLING WINE\nITALY",
    subtitleTh: "สปาร์กลิงไวน์\nอิตาลี",
    subtitleDe: "SCHAUMWEIN\nITALIEN",
    categoryType: "sparkling",
    flag: "🇦🇺",
    description: "This Australian sparkling wine reveals fresh aromas of green apple, citrus zest, and delicate white peach. On the palate, it is light, dry, and lively, with a fine mousse and a clean, refreshing finish. Perfect as an aperitif, it pairs wonderfully with seafood, appetizers, and light starters.",
    descriptionIt: "Questo spumante australiano rivela aromi freschi di mela verde, scorza di agrumi e delicata pesca bianca. Al palato è leggero, secco e vivace, con una fine effervescenza e un finale pulito e rinfrescante. Perfetto come aperitivo, si abbina meravigliosamente con frutti di mare, stuzzichini e antipasti leggeri.",
    descriptionEn: "This Australian sparkling wine reveals fresh aromas of green apple, citrus zest, and delicate white peach. On the palate, it is light, dry, and lively, with a fine mousse and a clean, refreshing finish. Perfect as an aperitif, it pairs wonderfully with seafood, appetizers, and light starters.",
    descriptionTh: "สปาร์กลิงไวน์จากออสเตรเลียตัวนี้เผยกลิ่นหอมสดชื่นของแอปเปิ้ลเขียว เปลือกส้ม และพีชขาวละมุน เมื่อดื่มแล้วให้ความรู้สึกเบา ดราย และมีชีวิตชีวา พร้อมฟองละเอียดและจบรสที่สะอาดสดชื่น เหมาะเป็นเครื่องดื่มเรียกน้ำย่อย เข้ากันได้อย่างยอดเยี่ยมกับอาหารทะเล ของทานเล่น และอาหารเรียกน้ำย่อยเบาๆ",
    descriptionDe: "Dieser australische Schaumwein offenbart frische Aromen von grünem Apfel, Zitruszesten und zartem weißem Pfirsich. Am Gaumen ist er leicht, trocken und lebendig, mit feiner Perlage und einem klaren, erfrischenden Abgang. Perfekt als Aperitif, passt er wunderbar zu Meeresfrüchten, Häppchen und leichten Vorspeisen.",
    alcohol: "12%",
    price: "990฿",
    bannerColor: "#991b1b",
    bottleImage: "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/cuv-e-tradition-brut-domaine-c-1787556229398.webp",
    showLogoBadge: true,
    bottleScale: 116,
    bottleScaleX: 92,
    bottleOffsetX: 0,
    bottleOffsetY: 0,
    isAvailable: true,
    updatedAt: "2026-08-24",
  },
  {
    id: "wine-prosecco-docg",
    title: "PROSECCO SUPERIORE\nDOC EXTRA DRY\nAmore Rubato",
    titleIt: "PROSECCO SUPERIORE\nDOC EXTRA DRY\nAmore Rubato",
    titleEn: "PROSECCO SUPERIORE\nDOC EXTRA DRY\nAmore Rubato",
    titleTh: "PROSECCO SUPERIORE\nDOC EXTRA DRY\nAmore Rubato",
    titleDe: "PROSECCO SUPERIORE\nDOC EXTRA DRY\nAmore Rubato",
    categorySubtitle: "SPARKLING WINE\nITALY - VENETO",
    subtitleIt: "BOLLICINE\nITALIA - VENETO",
    subtitleEn: "SPARKLING WINE\nITALY - VENETO",
    subtitleTh: "สปาร์กลิงไวน์\nอิตาลี - แคว้นเวเนโต",
    subtitleDe: "SCHAUMWEIN\nITALIEN - VENETIEN",
    categoryType: "sparkling",
    flag: "🇮🇹",
    description: "This elegant Italian sparkling wine offers delightful aromas of crisp green apple, fresh pear, and delicate white blossoms. On the palate, it is harmonious, refreshing, and pleasantly off-dry, featuring a fine perlage and a smooth, fruity finish. It serves as an exceptional aperitif and pairs wonderfully with light appetizers, seafood, and fresh fruit.",
    descriptionIt: "Questo elegante spumante italiano offre deliziosi aromi di mela verde croccante, pera fresca e delicati fiori bianchi. Al palato è armonioso, rinfrescante e piacevolmente abboccato, con un perlage fine e un finale morbido e fruttato. Si rivela un eccezionale aperitivo e si abbina meravigliosamente con antipasti leggeri, frutti di mare e frutta fresca.",
    descriptionEn: "This elegant Italian sparkling wine offers delightful aromas of crisp green apple, fresh pear, and delicate white blossoms. On the palate, it is harmonious, refreshing, and pleasantly off-dry, featuring a fine perlage and a smooth, fruity finish. It serves as an exceptional aperitif and pairs wonderfully with light appetizers, seafood, and fresh fruit.",
    descriptionTh: "สปาร์กลิงไวน์อิตาเลียนสุดหรูนี้มอบกลิ่นหอมอันน่าหลงใหลของแอปเปิ้ลเขียวกรอบ ลูกแพร์สด และดอกไม้สีขาวละมุน บนเพดานปากให้ความรู้สึกกลมกล่อม สดชื่น และมีความหวานเล็กน้อยอย่างน่าพึงพอใจ พร้อมฟองละเอียดและรสชาติที่เนียนนุ่มด้วยกลิ่นผลไม้ เหมาะเป็นเอเปอริทีฟชั้นเยี่ยมและเข้ากันได้อย่างวิเศษกับอาหารเรียกน้ำย่อยเบาๆ อาหารทะเล และผลไม้สด",
    descriptionDe: "Dieser elegante italienische Schaumwein bietet verführerische Aromen von knackigem grünem Apfel, frischer Birne und zarten weißen Blüten. Am Gaumen ist er harmonisch, erfrischend und angenehm halbtrocken, mit feiner Perlage und einem weichen, fruchtigen Abgang. Er ist ein außergewöhnlicher Aperitif und passt wunderbar zu leichten Vorspeisen, Meeresfrüchten und frischem Obst.",
    alcohol: "11%",
    price: "1290฿",
    bannerColor: "#0f766e",
    bottleImage: "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/prosecco-doc-extra-dry-amore-r-1787556229741.webp",
    showLogoBadge: true,
    bottleScale: 134,
    bottleScaleX: 90,
    bottleOffsetX: 0,
    bottleOffsetY: -3,
    isAvailable: true,
    updatedAt: "2026-08-24",
  },
  {
    id: "wine-rose-france",
    title: "ROSE’\nDE FRANCE\nLes Pins d’Aubane",
    titleIt: "ROSE’\nDE FRANCE\nLes Pins d’Aubane",
    titleEn: "ROSE’\nDE FRANCE\nLes Pins d’Aubane",
    titleTh: "ROSE’\nDE FRANCE\nLes Pins d’Aubane",
    titleDe: "ROSE’\nDE FRANCE\nLes Pins d’Aubane",
    categorySubtitle: "ROSÉ WINE\nFRANCE",
    subtitleIt: "VINO ROSATO\nFRANCIA",
    subtitleEn: "ROSÉ WINE\nFRANCE",
    subtitleTh: "ไวน์โรเซ่\nฝรั่งเศส",
    subtitleDe: "ROSÉWEIN\nFRANKREICH",
    categoryType: "rose",
    flag: "🇫🇷",
    description: "This refreshing French rosé wine presents charming aromas of fresh red summer berries, delicate citrus notes, and subtle floral nuances. On the palate, it is light, crisp, and well-balanced with a clean, lively finish. It serves as a fantastic aperitif and pairs wonderfully with light salads, seafood, grilled fish, and Mediterranean dishes.",
    descriptionIt: "Questo rinfrescante vino rosato francese presenta deliziosi aromi di frutti di bosco rossi freschi, delicate note di agrumi e sottili sfumature floreali. Al palato è leggero, fresco e ben bilanciato, con un finale pulito e vivace. È un ottimo aperitivo e si abbina meravigliosamente con insalate leggere, frutti di mare, pesce alla griglia e piatti mediterranei.",
    descriptionEn: "This refreshing French rosé wine presents charming aromas of fresh red summer berries, delicate citrus notes, and subtle floral nuances. On the palate, it is light, crisp, and well-balanced with a clean, lively finish. It serves as a fantastic aperitif and pairs wonderfully with light salads, seafood, grilled fish, and Mediterranean dishes.",
    descriptionTh: "ไวน์โรเซ่ฝรั่งเศสที่สดชื่นนี้ให้กลิ่นหอมอันน่าหลงใหลของเบอร์รี่สีแดงสดในฤดูร้อน กลิ่นซิตรัสที่ละเอียดอ่อน และกลิ่นดอกไม้อ่อนๆ เมื่อดื่มแล้วให้ความรู้สึกเบา กรุบกรอบ และสมดุล จบด้วยความสะอาดและมีชีวิตชีวา เหมาะเป็นไวน์เรียกน้ำย่อยชั้นเยี่ยม และเข้ากันได้อย่างยอดเยี่ยมกับสลัดเบาๆ อาหารทะเล ปลาย่าง และอาหารเมดิเตอร์เรเนียน",
    descriptionDe: "Dieser erfrischende französische Roséwein verführt mit charmanten Aromen von frischen roten Sommerbeeren, delikaten Zitrusnoten und subtilen floralen Nuancen. Am Gaumen ist er leicht, knackig und ausgewogen mit einem klaren, lebendigen Abgang. Er eignet sich hervorragend als Aperitif und passt wunderbar zu leichten Salaten, Meeresfrüchten, gegrilltem Fisch und mediterranen Gerichten.",
    alcohol: "12%",
    price: "990฿",
    bannerColor: "#be185d",
    bottleImage: "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/rose-de-france-les-pins-d-auba-1787556230284.webp",
    showLogoBadge: true,
    bottleScale: 359,
    bottleScaleX: 98,
    bottleOffsetX: 0,
    bottleOffsetY: -2,
    isAvailable: true,
    updatedAt: "2026-08-24",
  },
  {
    id: "wine-vina-toldos-rosso",
    title: "CABERNET SAUVIGNON\nESTATE BOTTLED\nViña Toldos",
    titleIt: "CABERNET SAUVIGNON\nIMBOTTIGLIATO IN TENUTA\nViña Toldos",
    titleEn: "CABERNET SAUVIGNON\nESTATE BOTTLED\nViña Toldos",
    titleTh: "CABERNET SAUVIGNON\nESTATE BOTTLED\nViña Toldos",
    titleDe: "CABERNET SAUVIGNON\nESTATE BOTTLED\nViña Toldos",
    categorySubtitle: "RED WINE\nCHILE - COLCHAGUA",
    subtitleIt: "VINO ROSSO\nCILE - COLCHAGUA",
    subtitleEn: "RED WINE\nCHILE - COLCHAGUA",
    subtitleTh: "ไวน์แดง\nชิลี - โคลชากัว",
    subtitleDe: "ROTWEIN\nCHILE - COLCHAGUA",
    categoryType: "white",
    flag: "🇨🇱",
    description: "This Chilean Cabernet Sauvignon offers appealing aromas of ripe blackberries, plums, and a hint of eucalyptus or pepper. On the palate, it is smooth and well-rounded with soft, balanced tannins and a pleasing, structured finish. It pairs wonderfully with grilled red meats, beef, lamb, and mature cheeses.",
    descriptionIt: "Questo Cabernet Sauvignon cileno offre aromi invitanti di more mature, prugne e un accenno di eucalipto o pepe. Al palato è morbido e ben equilibrato, con tannini delicati e armoniosi e un finale piacevole e strutturato. Si abbina meravigliosamente con carni rosse alla griglia, manzo, agnello e formaggi stagionati.",
    descriptionEn: "This Chilean Cabernet Sauvignon offers appealing aromas of ripe blackberries, plums, and a hint of eucalyptus or pepper. On the palate, it is smooth and well-rounded with soft, balanced tannins and a pleasing, structured finish. It pairs wonderfully with grilled red meats, beef, lamb, and mature cheeses.",
    descriptionTh: "ไวน์ Cabernet Sauvignon จากชิลีตัวนี้ให้กลิ่นหอมน่าดึงดูดของแบล็กเบอร์รีสุก พลัม และกลิ่นยูคาลิปตัสหรือพริกไทยเล็กน้อย เมื่อดื่มแล้วให้สัมผัสนุ่มนวลกลมกล่อม มีแทนนินที่นุ่มนวลสมดุล และจบด้วยความยาวที่ลงตัว เข้ากันได้อย่างยอดเยี่ยมกับเนื้อแดงย่าง เนื้อวัว เนื้อแกะ และชีสแก่",
    descriptionDe: "Dieser chilenische Cabernet Sauvignon bietet verlockende Aromen von reifen Brombeeren, Pflaumen und einem Hauch von Eukalyptus oder Pfeffer. Im Gaumen ist er weich und rund mit weichen, ausgewogenen Tanninen und einem angenehmen, strukturierten Abgang. Er passt wunderbar zu gegrilltem rotem Fleisch, Rind, Lamm und gereiftem Käse.",
    alcohol: "13.5%",
    price: "690฿",
    bannerColor: "#831843",
    bottleImage: "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/vi-a-toldos-red-vi-a-san-pedro-1787556230657.webp",
    showLogoBadge: true,
    bottleScale: 108,
    bottleScaleX: 97,
    bottleOffsetX: 0,
    bottleOffsetY: 0,
    isAvailable: true,
    updatedAt: "2026-08-24",
  },
  {
    id: "wine-1787555664725",
    title: "SAUVIGNON BLANC\nESTATE BOTTLED\nViña Toldos",
    titleIt: "SAUVIGNON BLANC\nIMBOTTIGLIATO IN TENUTA\nViña Toldos",
    titleEn: "SAUVIGNON BLANC\nESTATE BOTTLED\nViña Toldos",
    titleTh: "SAUVIGNON BLANC\nเอสเตท บอทเทิลด์\nViña Toldos",
    titleDe: "SAUVIGNON BLANC\nESTATE BOTTLED\nViña Toldos",
    categorySubtitle: "WHITE WINE\nCHILE - LEYDA",
    subtitleIt: "VINO BIANCO\nCILE - LEYDA",
    subtitleEn: "WHITE WINE\nCHILE - LEYDA",
    subtitleTh: "ไวน์ขาว\nชิลี - เลย์ดา",
    subtitleDe: "WEISSWEIN\nCHILE - LEYDA",
    categoryType: "white",
    flag: "🇨🇱",
    description: "This Chilean Sauvignon Blanc offers vibrant aromas of crisp green apple, zesty lime, and characteristic hints of fresh herbaceous notes. On the palate, it is light, crisp, and refreshing with lively acidity and a clean, mineral-driven finish. It pairs wonderfully with seafood, grilled fish, fresh salads, and light appetizers.",
    descriptionIt: "Questo Sauvignon Blanc cileno offre aromi vivaci di mela verde croccante, lime zesty e caratteristici sentori di erbe fresche. Al palato è leggero, fresco e rinfrescante, con un'acidità vivace e un finale pulito e minerale. Si abbina meravigliosamente con frutti di mare, pesce alla griglia, insalate fresche e antipasti leggeri.",
    descriptionEn: "This Chilean Sauvignon Blanc offers vibrant aromas of crisp green apple, zesty lime, and characteristic hints of fresh herbaceous notes. On the palate, it is light, crisp, and refreshing with lively acidity and a clean, mineral-driven finish. It pairs wonderfully with seafood, grilled fish, fresh salads, and light appetizers.",
    descriptionTh: "ซอวิญอง บล็องส์ จากชิลี นี้ มอบกลิ่นหอมสดชื่นของแอปเปิ้ลเขียวกรุบกรอบ มะนาวเปรี้ยวสดใส และกลิ่นสมุนไพรสดที่เป็นเอกลักษณ์ เมื่อดื่มแล้วให้ความรู้สึกเบาสบาย  crisp และสดชื่น ด้วยความเป็นกรดที่มีชีวิตชีวา และจบด้วยความสะอาดและแร่ธาตุ เข้ากันได้อย่างยอดเยี่ยมกับอาหารทะเล ปลาย่าง สลัดสด และของทานเล่นเบาๆ",
    descriptionDe: "Dieser chilenische Sauvignon Blanc bietet lebendige Aromen von knackigem grünem Apfel, spritzigem Limettensaft und charakteristischen frischen Kräuternoten. Am Gaumen ist er leicht, knackig und erfrischend mit lebendiger Säure und einem klaren, mineralischen Abgang. Er passt wunderbar zu Meeresfrüchten, gegrilltem Fisch, frischen Salaten und leichten Vorspeisen.",
    alcohol: "12.5%",
    price: "690฿",
    bannerColor: "#831843",
    bottleImage: "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/vi-a-toldos-white-vi-a-san-ped-1787555662147.webp",
    showLogoBadge: true,
    bottleScale: 107,
    bottleScaleX: 97,
    bottleOffsetX: 0,
    bottleOffsetY: 0,
    isAvailable: true,
    updatedAt: "2026-08-24",
  }
];

export const renderCountryFlag = (flagOrCountryCode: string, customClass?: string) => {
  if (!flagOrCountryCode) return null;

  const codeMap: Record<string, string> = {
    '🇮🇹': 'it', 'IT': 'it', 'italy': 'it', 'italia': 'it',
    '🇫🇷': 'fr', 'FR': 'fr', 'france': 'fr', 'francia': 'fr',
    '🇨🇱': 'cl', 'CL': 'cl', 'chile': 'cl', 'cile': 'cl',
    '🇦🇺': 'au', 'AU': 'au', 'australia': 'au',
    '🇩🇪': 'de', 'DE': 'de', 'germany': 'de', 'germania': 'de',
    '🇪🇸': 'es', 'ES': 'es', 'spain': 'es', 'spagna': 'es',
    '🇿🇦': 'za', 'ZA': 'za', 'south africa': 'za', 'sudafrica': 'za',
    '🇦🇷': 'ar', 'AR': 'ar', 'argentina': 'ar',
    '🇲🇽': 'mx', 'MX': 'mx', 'mexico': 'mx', 'messico': 'mx',
    '🇳🇿': 'nz', 'NZ': 'nz', 'new zealand': 'nz', 'nuova zelanda': 'nz',
    '🇵🇹': 'pt', 'PT': 'pt', 'portugal': 'pt', 'portogallo': 'pt',
    '🇺🇸': 'us', 'US': 'us', 'usa': 'us', 'stati uniti': 'us',
    '🇬🇷': 'gr', 'GR': 'gr', 'greece': 'gr', 'grecia': 'gr',
    '🇦🇹': 'at', 'AT': 'at', 'austria': 'at',
    '🇨🇭': 'ch', 'CH': 'ch', 'switzerland': 'ch', 'svizzera': 'ch',
    '🇬🇧': 'gb', 'GB': 'gb', 'uk': 'gb', 'regno unito': 'gb',
    '🇭🇺': 'hu', 'HU': 'hu', 'hungary': 'hu', 'ungheria': 'hu',
    '🇬🇪': 'ge', 'GE': 'ge', 'georgia': 'ge',
    '🇹🇷': 'tr', 'TR': 'tr', 'turkey': 'tr', 'turchia': 'tr',
    '🇱🇧': 'lb', 'LB': 'lb', 'lebanon': 'lb', 'libano': 'lb',
  };

  const isoCode = codeMap[flagOrCountryCode.trim()] || codeMap[flagOrCountryCode.trim().toLowerCase()] || (flagOrCountryCode.length === 2 ? flagOrCountryCode.toLowerCase() : null);

  if (isoCode) {
    return (
      <span className={customClass || "w-[32px] h-[22px] min-w-[32px] max-w-[32px] rounded-[3px] overflow-hidden border border-stone-300 shadow-xs shrink-0 inline-flex items-center justify-center bg-stone-100"}>
        <img
          src={`https://flagcdn.com/w80/${isoCode}.png`}
          alt={flagOrCountryCode}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </span>
    );
  }

  return (
    <span className={customClass || "w-[32px] h-[22px] min-w-[32px] max-w-[32px] rounded-[3px] overflow-hidden border border-stone-300 shadow-xs shrink-0 inline-flex items-center justify-center bg-stone-100 text-base select-none leading-none"}>
      {flagOrCountryCode}
    </span>
  );
};

export const formatSubtitle = (subtitle: string) => {
  if (!subtitle) return "";
  const clean = subtitle.includes('\n') ? subtitle : subtitle.replace(' - ', '\n').replace(' — ', '\n');
  const lines = clean.split('\n');
  return (
    <>
      {lines.map((line, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <br />}
          {line}
        </React.Fragment>
      ))}
    </>
  );
};

export const renderWinePrice = (rawPrice?: string | number, colorClass: string = "text-stone-900") => {
  if (!rawPrice) return <span className="text-stone-300">—</span>;
  const rawStr = String(rawPrice).trim();
  const numStr = rawStr.replace(/[^\d.,]/g, '').trim();
  if (!numStr) return <span>{rawStr}</span>;
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className={`text-base sm:text-lg font-black tracking-tight leading-none ${colorClass}`} style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
        {numStr}
      </span>
      <span 
        className={`text-xs sm:text-sm font-black tracking-tight select-none ${colorClass}`}
        style={{ fontFamily: 'Prompt, Kanit, IBM Plex Sans Thai, system-ui, sans-serif' }}
      >
        ฿
      </span>
    </span>
  );
};

export const renderFormattedPrice = (
  rawPrice?: string | number,
  options?: {
    numClass?: string;
    symbolClass?: string;
    containerClass?: string;
  }
) => {
  if (rawPrice === undefined || rawPrice === null || rawPrice === '') {
    return <span className="text-stone-300">—</span>;
  }
  const rawStr = String(rawPrice).trim();
  const numStr = rawStr.replace(/[^\d.,]/g, '').trim();
  if (!numStr) return <span>{rawStr}</span>;
  
  const numClass = options?.numClass || "font-black tracking-tight leading-none text-stone-900";
  const symbolClass = options?.symbolClass || "font-black tracking-tight select-none text-stone-900";
  const containerClass = options?.containerClass || "inline-flex items-baseline gap-1";

  return (
    <span className={containerClass}>
      <span className={numClass} style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
        {numStr}
      </span>
      <span 
        className={symbolClass}
        style={{ fontFamily: 'Prompt, Kanit, IBM Plex Sans Thai, system-ui, sans-serif' }}
      >
        ฿
      </span>
    </span>
  );
};

export const getWineTranslatedTitle = (wine: WineCardData | any | null | undefined, lang: string = 'IT'): string => {
  if (!wine) return '';
  if (lang === 'TH' && (wine.titleTh || wine.nameTh)) return wine.titleTh || wine.nameTh;
  if (lang === 'DE' && (wine.titleDe || wine.nameDe)) return wine.titleDe || wine.nameDe;
  if (lang === 'EN' && (wine.titleEn || wine.nameEn)) return wine.titleEn || wine.nameEn;
  if (lang === 'IT' && (wine.titleIt || wine.nameIt)) return wine.titleIt || wine.nameIt;
  return wine.title || wine.name || '';
};

export const getWineTranslatedSubtitle = (wine: WineCardData | any | null | undefined, lang: string = 'IT'): string => {
  if (!wine) return '';
  if (lang === 'TH' && (wine.subtitleTh || wine.categorySubtitleTh)) return wine.subtitleTh || wine.categorySubtitleTh;
  if (lang === 'DE' && (wine.subtitleDe || wine.categorySubtitleDe)) return wine.subtitleDe || wine.categorySubtitleDe;
  if (lang === 'EN' && (wine.subtitleEn || wine.categorySubtitleEn)) return wine.subtitleEn || wine.categorySubtitleEn;
  if (lang === 'IT' && (wine.subtitleIt || wine.categorySubtitleIt)) return wine.subtitleIt || wine.categorySubtitleIt;
  return wine.categorySubtitle || '';
};

export const getWineTranslatedDesc = (wine: WineCardData | any | null | undefined, lang: string = 'IT'): string => {
  if (!wine) return '';
  if (lang === 'TH' && (wine.descriptionTh || wine.description_th)) return wine.descriptionTh || wine.description_th;
  if (lang === 'DE' && (wine.descriptionDe || wine.description_de)) return wine.descriptionDe || wine.description_de;
  if (lang === 'EN' && (wine.descriptionEn || wine.description)) return wine.descriptionEn || wine.description;
  if (lang === 'IT' && (wine.descriptionIt || wine.description_it)) return wine.descriptionIt || wine.description_it;
  return wine.description || '';
};

export const toTitleCase = (str: string) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (!word) return '';
      const upper = word.toUpperCase();
      if (['DOC', 'DOCG', 'IGT', 'DOP', 'IGP'].includes(upper)) return upper;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

export const formatWineProductName = (name: string) => {
  if (!name) return "";
  
  if (name.includes('\n')) {
    const lines = name.split('\n');
    return (
      <span className="flex flex-col text-[14.5px] sm:text-[15.8px] tracking-tight">
        {lines.map((line, idx) => {
          if (idx === 0) {
            return (
              <span key={idx} className="block font-black leading-[1.1] uppercase text-stone-900">
                {line.toUpperCase()}
              </span>
            );
          }
          if (idx === 1) {
            return (
              <span key={idx} className="block text-[0.91em] font-bold leading-[1.1] mt-0.5 uppercase text-stone-800">
                {line.toUpperCase()}
              </span>
            );
          }
          return (
            <span key={idx} className="block text-stone-600 font-semibold text-[0.84em] leading-[1.15] mt-1">
              {toTitleCase(line)}
            </span>
          );
        })}
      </span>
    );
  }

  // Supporto connettori linguistici
  const splitKeywords = [' WITH ', ' CON ', ' พร้อม', ' MIT ', ' & '];
  const upperName = name.toUpperCase();
  for (const kw of splitKeywords) {
    if (upperName.includes(kw)) {
      const idx = upperName.indexOf(kw);
      const part1 = name.substring(0, idx);
      const matchWord = name.substring(idx, idx + kw.length);
      const part2 = name.substring(idx + kw.length);
      return (
        <span className="flex flex-col text-[14.5px] sm:text-[15.8px] tracking-tight">
          <span className="block font-black leading-[1.05] uppercase text-stone-900">{part1.toUpperCase()}</span>
          <span className="block text-[0.91em] font-bold leading-[1.05] mt-0.5 uppercase text-stone-800">
            {matchWord.trimStart().toUpperCase()}{part2.toUpperCase()}
          </span>
        </span>
      );
    }
  }

  return <span className="block font-bold text-stone-900 leading-tight tracking-tight text-[14.5px] sm:text-[15.8px]">{name}</span>;
};
