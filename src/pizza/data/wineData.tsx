import React from 'react';

export interface WineCardData {
  id: string;
  title: string;
  titleIt?: string;
  titleEn?: string;
  titleTh?: string;
  titleMm?: string;
  titleDe?: string;
  titleEs?: string;
  titleFr?: string;
  titleRu?: string;
  titleZh?: string;
  categorySubtitle: string;
  subtitleIt?: string;
  subtitleEn?: string;
  subtitleTh?: string;
  subtitleMm?: string;
  subtitleDe?: string;
  subtitleEs?: string;
  subtitleFr?: string;
  subtitleRu?: string;
  subtitleZh?: string;
  categoryType: 'red' | 'white' | 'rose' | 'sparkling';
  flag: string;
  description: string;
  descriptionIt?: string;
  descriptionEn?: string;
  descriptionTh?: string;
  descriptionMm?: string;
  descriptionDe?: string;
  descriptionEs?: string;
  descriptionFr?: string;
  descriptionRu?: string;
  descriptionZh?: string;
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
  { flag: '🇮🇹', code: 'IT', label: 'Italia', names: { IT: 'ITALIA', EN: 'ITALY', TH: 'อิตาลี', DE: 'ITALIEN', MM: 'အီတလီ', ES: 'ITALIA', FR: 'ITALIE', RU: 'ИТАЛИЯ', ZH: '意大利' } },
  { flag: '🇫🇷', code: 'FR', label: 'Francia', names: { IT: 'FRANCIA', EN: 'FRANCE', TH: 'ฝรั่งเศส', DE: 'FRANKREICH', MM: 'ပြင်သစ်', ES: 'FRANCIA', FR: 'FRANCE', RU: 'ФРАНЦИЯ', ZH: '法国' } },
  { flag: '🇦🇺', code: 'AU', label: 'Australia', names: { IT: 'AUSTRALIA', EN: 'AUSTRALIA', TH: 'ออสเตรเลีย', DE: 'AUSTRALIEN', MM: 'သြစတြေးလျ', ES: 'AUSTRALIA', FR: 'AUSTRALIE', RU: 'АВСТРАЛИЯ', ZH: '澳大利亚' } },
  { flag: '🇨🇱', code: 'CL', label: 'Cile', names: { IT: 'CILE', EN: 'CHILE', TH: 'ชิลี', DE: 'CHILE', MM: 'ချီလီ', ES: 'CHILE', FR: 'CHILI', RU: 'ЧИЛИ', ZH: '智利' } },
  { flag: '🇪🇸', code: 'ES', label: 'Spagna', names: { IT: 'SPAGNA', EN: 'SPAIN', TH: 'สเปน', DE: 'SPANIEN', MM: 'စပိန်', ES: 'ESPAÑA', FR: 'ESPAGNE', RU: 'ИСПАНИЯ', ZH: '西班牙' } },
  { flag: '🇿🇦', code: 'ZA', label: 'Sudafrica', names: { IT: 'SUDAFRICA', EN: 'SOUTH AFRICA', TH: 'แอฟริกาใต้', DE: 'SÜDAFRIKA', MM: 'တောင်အာဖရိက', ES: 'SUDÁFRICA', FR: 'AFRIQUE DU SUD', RU: 'ЮЖНАЯ АФРИКА', ZH: '南非' } },
  { flag: '🇩🇪', code: 'DE', label: 'Germania', names: { IT: 'GERMANIA', EN: 'GERMANY', TH: 'เยอรมนี', DE: 'DEUTSCHLAND', MM: 'ဂျာမနီ', ES: 'ALEMANIA', FR: 'ALLEMAGNE', RU: 'ГЕРМАНИЯ', ZH: '德国' } },
  { flag: '🇦🇷', code: 'AR', label: 'Argentina', names: { IT: 'ARGENTINA', EN: 'ARGENTINA', TH: 'อาร์เจนตินา', DE: 'ARGENTINIEN', MM: 'အာဂျင်တီးနား', ES: 'ARGENTINA', FR: 'ARGENTINE', RU: 'АРГЕНТИНА', ZH: '阿根廷' } },
  { flag: '🇺🇸', code: 'US', label: 'Stati Uniti', names: { IT: 'STATI UNITI', EN: 'UNITED STATES', TH: 'สหรัฐอเมริกา', DE: 'USA', MM: 'အမေရိကန်', ES: 'ESTADOS UNIDOS', FR: 'ÉTATS-UNIS', RU: 'США', ZH: '美国' } },
  { flag: '🇳🇿', code: 'NZ', label: 'Nuova Zelanda', names: { IT: 'NUOVA ZELANDA', EN: 'NEW ZEALAND', TH: 'นิวซีแลนด์', DE: 'NEUSEELAND', MM: 'နယူးဇီလန်', ES: 'NUEVA ZELANDA', FR: 'NOUVELLE-ZÉLANDE', RU: 'НОВАЯ ЗЕЛАНДИЯ', ZH: '新西兰' } },
  { flag: '🇵🇹', code: 'PT', label: 'Portogallo', names: { IT: 'PORTOGALLO', EN: 'PORTUGAL', TH: 'โปรตุเกส', DE: 'PORTUGAL', MM: 'ပေါ်တူဂီ', ES: 'PORTUGAL', FR: 'PORTUGAL', RU: 'ПОРТУГАЛИЯ', ZH: '葡萄牙' } },
  { flag: '🇲🇽', code: 'MX', label: 'Messico', names: { IT: 'MESSICO', EN: 'MEXICO', TH: 'เม็กซิโก', DE: 'MEXIKO', MM: 'မက္ကဆီကို', ES: 'MÉXICO', FR: 'MEXIQUE', RU: 'МЕКСИКА', ZH: '墨西哥' } },
  { flag: '🇬🇷', code: 'GR', label: 'Grecia', names: { IT: 'GRECIA', EN: 'GREECE', TH: 'กรีซ', DE: 'GRIECHENLAND', MM: 'ဂရိ', ES: 'GRECIA', FR: 'GRÈCE', RU: 'ГРЕЦИЯ', ZH: '希腊' } },
  { flag: '🇦🇹', code: 'AT', label: 'Austria', names: { IT: 'AUSTRIA', EN: 'AUSTRIA', TH: 'ออสเตรีย', DE: 'ÖSTERREICH', MM: 'သြစတြီးယား', ES: 'AUSTRIA', FR: 'AUTRICHE', RU: 'АВСТРИЯ', ZH: '奥地利' } },
  { flag: '🇨🇭', code: 'CH', label: 'Svizzera', names: { IT: 'SVIZZERA', EN: 'SWITZERLAND', TH: 'สวิตเซอร์แลนด์', DE: 'SCHWEIZ', MM: 'ဆွစ်ဇာလန်', ES: 'SUIZA', FR: 'SUISSE', RU: 'ШВЕЙЦАРИЯ', ZH: '瑞士' } },
  { flag: '🇬🇧', code: 'GB', label: 'Regno Unito', names: { IT: 'REGNO UNITO', EN: 'UNITED KINGDOM', TH: 'สหราชอาณาจักร', DE: 'VEREINIGTES KÖNIGREICH', MM: 'ယူကေ', ES: 'REINO UNIDO', FR: 'ROYAUME-UNI', RU: 'ВЕЛИКОБРИТАНИЯ', ZH: '英国' } },
  { flag: '🇭🇺', code: 'HU', label: 'Ungheria', names: { IT: 'UNGHERIA', EN: 'HUNGARY', TH: 'ฮังการี', DE: 'UNGARN', MM: 'ဟန်ဂေရီ', ES: 'HUNGRÍA', FR: 'HONGRIE', RU: 'ВЕНГРИЯ', ZH: '匈牙利' } },
  { flag: '🇬🇪', code: 'GE', label: 'Georgia', names: { IT: 'GEORGIA', EN: 'GEORGIA', TH: 'จอร์เจีย', DE: 'GEORGIEN', MM: 'ဂျော်ဂျီယာ', ES: 'GEORGIA', FR: 'GÉORGIE', RU: 'ГРУЗИЯ', ZH: '格鲁吉亚' } },
  { flag: '🇹🇷', code: 'TR', label: 'Turchia', names: { IT: 'TURCHIA', EN: 'TURKEY', TH: 'ตุรกี', DE: 'TÜRKEI', MM: 'တူရကီ', ES: 'TURQUÍA', FR: 'TURQUIE', RU: 'ТУРЦИЯ', ZH: '土耳其' } },
  { flag: '🇱🇧', code: 'LB', label: 'Libano', names: { IT: 'LIBANO', EN: 'LEBANON', TH: 'เลบานอน', DE: 'LIBANON', MM: 'လက်ဘနွန်', ES: 'LÍBANO', FR: 'LIBAN', RU: 'ЛИВАН', ZH: '黎巴嫩' } },
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
    names: { IT: 'VINO ROSSO', EN: 'RED WINE', TH: 'ไวน์แดง', DE: 'ROTWEIN', MM: 'ဝိုင်နီ', ES: 'VINO TINTO', FR: 'VIN ROUGE', RU: 'КРАСНОЕ ВИНО', ZH: '红葡萄酒' },
    defaultColor: '#8b0000'
  },
  { 
    id: 'white' as const, 
    label: 'Vino Bianco', 
    names: { IT: 'VINO BIANCO', EN: 'WHITE WINE', TH: 'ไวน์ขาว', DE: 'WEISSWEIN', MM: 'ဝိုင်ဖြူ', ES: 'VINO BLANCO', FR: 'VIN BLANC', RU: 'БЕЛОЕ ВИНО', ZH: '白葡萄酒' },
    defaultColor: '#d4af37'
  },
  { 
    id: 'rose' as const, 
    label: 'Vino Rosato', 
    names: { IT: 'VINO ROSATO', EN: 'ROSÉ WINE', TH: 'ไวน์โรเซ่', DE: 'ROSÉWEIN', MM: 'ရိုဇေး ဝိုင်', ES: 'VINO ROSADO', FR: 'VIN ROSÉ', RU: 'РОЗОВОЕ ВИНО', ZH: '桃红葡萄酒' },
    defaultColor: '#db2777'
  },
  { 
    id: 'sparkling' as const, 
    label: 'Spumante', 
    names: { IT: 'SPUMANTE', EN: 'SPARKLING WINE', TH: 'สปาร์กลิงไวน์', DE: 'SCHAUMWEIN', MM: 'စပါကလင် ဝိုင်', ES: 'VINO ESPUMOSO', FR: 'VIN EFFERVESCENT', RU: 'ИГРИСТОЕ ВИНО', ZH: '起泡酒' },
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
    "id": "wine-1787561327966",
    "title": "GRENACHE/SYRAH\nROUGE DE FRANCE\nLes Solstices Cuvée",
    "titleIt": "GRENACHE/SYRAH\nROUGE DE FRANCE\nLes Solstices Cuvée",
    "titleEn": "GRENACHE/SYRAH\nROUGE DE FRANCE\nLes Solstices Cuvée",
    "titleTh": "GRENACHE/SYRAH\nROUGE DE FRANCE\nLes Solstices Cuvée",
    "titleDe": "GRENACHE/SYRAH\nROUGE DE FRANCE\nLes Solstices Cuvée",
    "categorySubtitle": "RED WINE\nFRANCE",
    "subtitleIt": "VINO ROSSO\nFRANCIA",
    "subtitleEn": "RED WINE\nFRANCE",
    "subtitleTh": "ไวน์แดง\nฝรั่งเศส",
    "subtitleDe": "ROTWEIN\nFRANKREICH",
    "categoryType": "red",
    "flag": "🇫🇷",
    "description": "This French red wine displays a charming bouquet of ripe red berries with subtle earthy nuances. On the palate, it is approachable, well-balanced, and smooth, featuring gentle tannins. It makes a versatile choice that pairs comfortably with everyday meals, grilled meats, poultry, and casual cheese selections.",
    "descriptionIt": "Questo vino rosso francese offre un affascinante bouquet di frutti di bosco maturi con sottili note terrose. Al palato è accessibile, ben bilanciato e morbido, con tannini gentili. È una scelta versatile che si abbina facilmente ai pasti di tutti i giorni, carni alla griglia, pollame e selezioni di formaggi informali.",
    "descriptionEn": "This French red wine displays a charming bouquet of ripe red berries with subtle earthy nuances. On the palate, it is approachable, well-balanced, and smooth, featuring gentle tannins. It makes a versatile choice that pairs comfortably with everyday meals, grilled meats, poultry, and casual cheese selections.",
    "descriptionTh": "ไวน์แดงฝรั่งเศสนี้เผยกลิ่นหอมอันมีเสน่ห์ของเบอร์รี่แดงสุก ผสานกลิ่นดินอันละเอียดอ่อน บนเพดานปากให้สัมผัสนุ่มนวล กลมกล่อม สมดุลดี มีแทนนินที่ละมุน เป็นตัวเลือกที่หลากหลาย เข้ากับมื้ออาหารในชีวิตประจำวัน เนื้อย่าง เนื้อสัตว์ปีก และชีสทั่วไปได้อย่างลงตัว",
    "descriptionDe": "Dieser französische Rotwein zeigt ein charmantes Bouquet von reifen roten Beeren mit subtilen erdigen Nuancen. Am Gaumen ist er zugänglich, ausgewogen und weich, mit sanften Tanninen. Er ist eine vielseitige Wahl, die sich gut mit alltäglichen Mahlzeiten, gegrilltem Fleisch, Geflügel und ungezwungenen Käseauswahlen kombinieren lässt.",
    "alcohol": "12,5%",
    "price": "850 ฿",
    "bannerColor": "#8b0000",
    "bottleImage": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/grenache-syrah-rouge-de-france-1787561327211.webp",
    "showLogoBadge": false,
    "bottleScale": 352,
    "bottleScaleX": 85,
    "bottleOffsetX": 0,
    "bottleOffsetY": 2,
    "isAvailable": true,
    "updatedAt": "2026-08-24",
    "titleMm": "ဂရီနာ့ရှ်/ဆီရာ\nပြင်သစ်အနီ\nလက်ဆိုးစတစ်စ် ကျူဗေး",
    "subtitleMm": "အနီဝိုင်\nပြင်သစ်",
    "descriptionMm": "ဤပြင်သစ်အနီဝိုင်သည် မှည့်သော အနီရောင်ဘယ်ရီသီးများ၏ ဆွဲဆောင်မှုရှိသော ရနံ့နှင့် သိမ်မွေ့သော မြေကြီးဆန်သော အနံ့များ ပေါင်းစပ်ထားသည်။ လျှာပေါ်တွင် ချောမွေ့ပြီး ဟန်ချက်ညီကာ နူးညံ့သော တန်နင်များဖြင့် သောက်ရလွယ်ကူသည်။ နေ့စဉ်စားသောက်သည့် အစားအစာများ၊ ကင်ထားသော အသားများ၊ ကြက်ငှက်သားနှင့် ရိုးရိုးဒိန်ခဲများနှင့် လိုက်ဖက်စွာ သောက်သုံးနိုင်သော စွယ်စုံရဝိုင်တစ်မျိုးဖြစ်သည်။",
    "titleEs": "GRENACHE/SYRAH\nROUGE DE FRANCE\nLes Solstices Cuvée",
    "subtitleEs": "VINO TINTO\nFRANCIA",
    "descriptionEs": "Este vino tinto francés ofrece un fascinante bouquet de frutos rojos maduros con sutiles notas terrosas. En boca es accesible, bien equilibrado y suave, con taninos gentiles. Es una elección versátil que se combina fácilmente con comidas cotidianas, carnes a la parrilla, aves y selecciones informales de quesos.",
    "titleZh": "GRENACHE/SYRAH\n法国红葡萄酒\nLes Solstices Cuvée",
    "subtitleZh": "红葡萄酒\n法国",
    "descriptionZh": "这款法国红葡萄酒散发着成熟红色浆果的迷人香气，并带有微妙的泥土气息。口感平易近人，平衡柔顺，单宁柔和。它是一款多才多艺的选择，可轻松搭配日常餐食、烤肉、家禽和休闲奶酪。",
    "titleRu": "ГРЕНАШ/СИРА\nКРАСНОЕ ФРАНЦИИ\nLes Solstices Cuvée",
    "subtitleRu": "КРАСНОЕ ВИНО\nФРАНЦИЯ",
    "descriptionRu": "Это французское красное вино демонстрирует очаровательный букет спелых красных ягод с тонкими землистыми нюансами. Во вкусе оно доступное, хорошо сбалансированное и мягкое, с нежными танинами. Это универсальный выбор, который легко сочетается с повседневными блюдами, мясом на гриле, птицей и неформальными сырными нарезками.",
    "titleFr": "GRENACHE/SYRAH\nROUGE DE FRANCE\nLes Solstices Cuvée",
    "subtitleFr": "VIN ROUGE\nFRANCE",
    "descriptionFr": "Ce vin rouge français dévoile un bouquet charmant de baies rouges mûres, rehaussé de subtiles nuances terreuses. En bouche, il se montre accessible, bien équilibré et velouté, avec des tanins délicats. Un choix polyvalent qui accompagne avec aisance les repas quotidiens, les viandes grillées, la volaille et les plateaux de fromages décontractés."
  },
  {
    "id": "wine-1787560584231",
    "title": "NEGROAMARO\nIGT\nPoggio Alto",
    "titleIt": "NEGROAMARO\nIGT\nPoggio Alto",
    "titleEn": "NEGROAMARO\nIGT\nPoggio Alto",
    "titleTh": "NEGROAMARO\nIGT\nPoggio Alto",
    "titleDe": "NEGROAMARO\nIGT\nPoggio Alto",
    "categorySubtitle": "RED WINE\nITALY - PUGLIA",
    "subtitleIt": "VINO ROSSO\nITALIA - PUGLIA",
    "subtitleEn": "RED WINE\nITALY - PUGLIA",
    "subtitleTh": "ไวน์แดง\nอิตาลี - แคว้นปูลยา",
    "subtitleDe": "ROTWEIN\nITALIEN - APULIEN",
    "categoryType": "red",
    "flag": "🇮🇹",
    "description": "This ruby-red wine offers a generous bouquet of red berry and stone fruit with subtle spicy notes. On the palate it is fleshy, powerful, and balanced, with soft tannins and a persistent finish. It proves to be a perfect pairing for red meats, roasted dishes, and aged cheeses.",
    "descriptionIt": "Questo vino rosso rubino offre un generoso profumo di frutti a bacca rossa e di pietra con sottili note speziate. Al palato è carnoso, potente e bilanciato, con tannini morbidi e un finale persistente. Si rivela un abbinamento perfetto per carni rosse, piatti arrostiti e formaggi stagionati.",
    "descriptionEn": "This ruby-red wine offers a generous bouquet of red berry and stone fruit with subtle spicy notes. On the palate it is fleshy, powerful, and balanced, with soft tannins and a persistent finish. It proves to be a perfect pairing for red meats, roasted dishes, and aged cheeses.",
    "descriptionTh": "ไวน์แดงสีทับทิมนี้ให้กลิ่นหอมของผลไม้ตระกูลเบอร์รี่สีแดงและผลไม้สโตนอย่างเต็มเปี่ยม พร้อมกลิ่นเครื่องเทศอันละเอียดอ่อน เมื่อเข้าปากให้สัมผัสแน่นเนื้อ มีพลัง และสมดุล ด้วยแทนนินที่นุ่มนวลและรสชาติที่ยาวนาน เข้ากันได้อย่างลงตัวกับเนื้อแดง อาหารย่าง และชีสแก่",
    "descriptionDe": "Dieser rubinrote Wein bietet ein großzügiges Bukett von roten Beeren und Steinobst mit subtilen würzigen Noten. Am Gaumen ist er fleischig, kräftig und ausgewogen, mit weichen Tanninen und einem anhaltenden Abgang. Er erweist sich als perfekte Begleitung zu rotem Fleisch, Bratengerichten und gereiftem Käse.",
    "alcohol": "12,5%",
    "price": "1190 ฿",
    "bannerColor": "#8b0000",
    "bottleImage": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/negroamaro-igt-poggio-alto-1787560583283.webp",
    "showLogoBadge": false,
    "bottleScale": 366,
    "bottleScaleX": 92,
    "bottleOffsetX": 0,
    "bottleOffsetY": 1,
    "isAvailable": true,
    "updatedAt": "2026-08-24",
    "titleMm": "နီဂရိုအာမာရို\nအိုင်ဂျီတီ\nပေါ့ဂျီယို အော်လ်တို",
    "subtitleMm": "အနီဝိုင်\nအီတလီ - ပူလီယာ",
    "descriptionMm": "ဤပတ္တမြားရောင်အနီဝိုင်သည် အနီရောင်ဘယ်ရီသီးနှင့် အရိုးထဲမှ အသီးများ၏ ကြွယ်ဝသော ရနံ့နှင့် သိမ်မွေ့သော ဟင်းခတ်အနံ့များ ပေါင်းစပ်ထားသည်။ လျှာပေါ်တွင် အသားစိမ်းဆန်ပြီး အားကောင်းကာ ဟန်ချက်ညီသည်။ နူးညံ့သော တန်နင်များနှင့် ကြာရှည်ခံသော အဆုံးသတ်ရှိသည်။ အနီရောင်အသားများ၊ မီးဖုတ်ထားသော ဟင်းလျာများနှင့် အသက်ရင့်ဒိန်ခဲများအတွက် ပြည့်စုံသော တွဲဖက်မှုဖြစ်သည်။",
    "titleEs": "NEGROAMARO\nIGT\nPoggio Alto",
    "subtitleEs": "VINO TINTO\nITALIA - PUGLIA",
    "descriptionEs": "Este vino rojo rubí ofrece un generoso aroma de frutos rojos y de hueso con sutiles notas especiadas. En boca es carnoso, potente y equilibrado, con taninos suaves y un final persistente. Se revela como un maridaje perfecto para carnes rojas, platos asados y quesos curados.",
    "titleZh": "NEGROAMARO\nIGT\nPoggio Alto",
    "subtitleZh": "红葡萄酒\n意大利 - 普利亚",
    "descriptionZh": "这款红宝石色葡萄酒散发着红色浆果和核果的浓郁香气，并带有微妙的香料气息。口感丰满、强劲而平衡，单宁柔和，余味持久。它是红肉、烤肉和陈年奶酪的完美搭配。",
    "titleRu": "НЕГРОАМАРО\nIGT\nPoggio Alto",
    "subtitleRu": "КРАСНОЕ ВИНО\nИТАЛИЯ - ПУГЛИЯ",
    "descriptionRu": "Это рубиново-красное вино предлагает щедрый букет красных ягод и косточковых фруктов с тонкими пряными нотками. Во вкусе оно мясистое, мощное и сбалансированное, с мягкими танинами и стойким послевкусием. Это идеальное сочетание для красного мяса, жареных блюд и выдержанных сыров.",
    "titleFr": "NEGROAMARO\nIGT\nPoggio Alto",
    "subtitleFr": "VIN ROUGE\nITALIE - PUGLIA",
    "descriptionFr": "Ce vin rouge rubis offre un généreux bouquet de fruits rouges et de fruits à noyau, avec de subtiles notes épicées. En bouche, il est charnu, puissant et équilibré, doté de tanins souples et d'une finale persistante. Il se révèle un accord parfait pour les viandes rouges, les plats rôtis et les fromages affinés."
  },
  {
    "id": "wine-1787560230368",
    "title": "PINOT GRIGIO\nIGT\nPoggio Alto",
    "titleIt": "PINOT GRIGIO\nIGT\nPoggio Alto",
    "titleEn": "PINOT GRIGIO\nIGT\nPoggio Alto",
    "titleTh": "PINOT GRIGIO\nIGT\nPoggio Alto",
    "titleDe": "PINOT GRIGIO\nIGT\nPoggio Alto",
    "categorySubtitle": "WHITE WINE\nITALY - SICILY",
    "subtitleIt": "VINO BIANCO\nITALIA - SICILIA",
    "subtitleEn": "WHITE WINE\nITALY - SICILY",
    "subtitleTh": "ไวน์ขาว\nอิตาลี - ซิซิลี",
    "subtitleDe": "WEISSWEIN\nITALIEN - SIZILIEN",
    "categoryType": "white",
    "flag": "🇮🇹",
    "description": "This refreshing white wine reveals delicate aromas of white flowers, crisp green apple, and juicy pear. On the palate it is light, clean, and well-balanced, with a lively and zesty finish. It works excellently as an aperitif and pairs wonderfully with fish dishes, shellfish, and light summer salads.",
    "descriptionIt": "Questo vino bianco rinfrescante rivela delicati aromi di fiori bianchi, mela verde croccante e pera succosa. Al palato è leggero, pulito e ben bilanciato, con un finale vivace e brioso. Funziona eccellentemente come aperitivo e si sposa a meraviglia con piatti di pesce, crostacei e leggere insalate estive.",
    "descriptionEn": "This refreshing white wine reveals delicate aromas of white flowers, crisp green apple, and juicy pear. On the palate it is light, clean, and well-balanced, with a lively and zesty finish. It works excellently as an aperitif and pairs wonderfully with fish dishes, shellfish, and light summer salads.",
    "descriptionTh": "ไวน์ขาวสดชื่นนี้เผยกลิ่นหอมละมุนของดอกไม้สีขาว แอปเปิ้ลเขียวกรอบ และลูกแพร์ฉ่ำน้ำ เมื่อเข้าปากให้ความรู้สึกเบาสบาย สะอาด และสมดุล จบด้วยความสดชื่นมีชีวิตชีวา เหมาะเป็นไวน์เรียกน้ำย่อย และเข้ากันได้อย่างยอดเยี่ยมกับเมนูปลา อาหารทะเล และสลัดเบาๆ ในฤดูร้อน",
    "descriptionDe": "Dieser erfrischende Weißwein offenbart zarte Aromen von weißen Blüten, knackigem grünem Apfel und saftiger Birne. Am Gaumen ist er leicht, klar und ausgewogen mit einem lebendigen, spritzigen Abgang. Er eignet sich hervorragend als Aperitif und passt wunderbar zu Fischgerichten, Schalentieren und leichten Sommersalaten.",
    "alcohol": "12%",
    "price": "1190 ฿",
    "bannerColor": "#8b0000",
    "bottleImage": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/pinot-grigio-igt-poggio-alto-1787560416876.webp",
    "showLogoBadge": false,
    "bottleScale": 656,
    "bottleScaleX": 92,
    "bottleOffsetX": 0,
    "bottleOffsetY": 0,
    "isAvailable": true,
    "updatedAt": "2026-08-24",
    "titleMm": "ပီနိုဂရီဂျီယို\nအိုင်ဂျီတီ\nပေါ့ဂျီယို အော်လ်တို",
    "subtitleMm": "အဖြူဝိုင်\nအီတလီ - စစ္စလီ",
    "descriptionMm": "ဤလန်းဆန်းသော အဖြူဝိုင်သည် အဖြူရောင်ပန်းများ၊ ကြွပ်ရွသော စိမ်းစားပန်းသီးနှင့် အရည်ရွှမ်းသော သစ်တော်သီးတို့၏ နူးညံ့သော ရနံ့များကို ဖော်ပြသည်။ လျှာပေါ်တွင် ပေါ့ပါးပြီး သန့်ရှင်းကာ ဟန်ချက်ညီသည်။ ရှင်သန်ပြီး လန်းဆန်းသော အဆုံးသတ်ရှိသည်။ အစားအသောက်မစားမီ သောက်ရန်အတွက် အလွန်ကောင်းမွန်ပြီး ငါးဟင်းလျာများ၊ ပုဇွန်ထုတ်များနှင့် ပေါ့ပါးသော နွေရာသီသုပ်များနှင့် အလွန်လိုက်ဖက်သည်။",
    "titleEs": "PINOT GRIGIO\nIGT\nPoggio Alto",
    "subtitleEs": "VINO BLANCO\nITALIA - SICILIA",
    "descriptionEs": "Este refrescante vino blanco revela delicados aromas de flores blancas, manzana verde crujiente y pera jugosa. En boca es ligero, limpio y bien equilibrado, con un final vivaz y burbujeante. Funciona excelentemente como aperitivo y marida de maravilla con platos de pescado, mariscos y ligeras ensaladas veraniegas.",
    "titleZh": "PINOT GRIGIO\nIGT\nPoggio Alto",
    "subtitleZh": "白葡萄酒\n意大利 - 西西里",
    "descriptionZh": "这款清爽的白葡萄酒散发着白花、脆青苹果和多汁梨的精致香气。口感轻盈、干净且平衡，余味活泼清新。它非常适合作为开胃酒，与鱼类菜肴、贝类和清淡的夏季沙拉完美搭配。",
    "titleRu": "ПИНО ГРИДЖИО\nIGT\nPoggio Alto",
    "subtitleRu": "БЕЛОЕ ВИНО\nИТАЛИЯ - СИЦИЛИЯ",
    "descriptionRu": "Это освежающее белое вино раскрывает деликатные ароматы белых цветов, хрустящего зеленого яблока и сочной груши. Во вкусе оно легкое, чистое и хорошо сбалансированное, с живым и бодрящим послевкусием. Прекрасно подходит в качестве аперитива и великолепно сочетается с рыбными блюдами, моллюсками и легкими летними салатами.",
    "titleFr": "PINOT GRIGIO\nIGT\nPoggio Alto",
    "subtitleFr": "VIN BLANC\nITALIE - SICILE",
    "descriptionFr": "Ce vin blanc rafraîchissant révèle de délicats arômes de fleurs blanches, de pomme verte croquante et de poire juteuse. En bouche, il est léger, net et bien équilibré, avec une finale vive et pétillante. Il fait merveille en apéritif et s'accorde à la perfection avec les plats de poisson, les crustacés et les salades estivales légères."
  },
  {
    "id": "wine-1787558200348",
    "title": "CHARDONNAY\nCRISP WHITE\nHolla",
    "titleIt": "CHARDONNAY\nCRISP WHITE\nHolla",
    "titleEn": "CHARDONNAY\nCRISP WHITE\nHolla",
    "titleTh": "CHARDONNAY\nCRISP WHITE\nHolla",
    "titleDe": "CHARDONNAY\nCRISP WHITE\nHolla",
    "categorySubtitle": "WHITE WINE\nCHILE",
    "subtitleIt": "VINO BIANCO\nCILE",
    "subtitleEn": "WHITE WINE\nCHILE",
    "subtitleTh": "ไวน์ขาว\nชิลี",
    "subtitleDe": "WEISSWEIN\nCHILE",
    "categoryType": "white",
    "flag": "🇨🇱",
    "description": "This refreshing white wine offers a crisp, dry profile with vibrant acidity and a subtle hint of vanilla. Easy-drinking and unpretentious, it pairs beautifully with seafood, spicy dishes, light appetizers, or casual everyday meals.",
    "descriptionIt": "Questo vino bianco rinfrescante offre un profilo croccante e secco con un'acidità vibrante e un sottile tocco di vaniglia. Facile da bere e senza pretese, si abbina meravigliosamente a frutti di mare, piatti piccanti, antipasti leggeri o pasti quotidiani informali.",
    "descriptionEn": "This refreshing white wine offers a crisp, dry profile with vibrant acidity and a subtle hint of vanilla. Easy-drinking and unpretentious, it pairs beautifully with seafood, spicy dishes, light appetizers, or casual everyday meals.",
    "descriptionTh": "ไวน์ขาวสดชื่นนี้ให้รสชาติกรอบแห้ง มีความเป็นกรดสดใส และกลิ่นวานิลลาอ่อนๆ ดื่มง่ายไม่ซับซ้อน เข้ากันได้อย่างยอดเยี่ยมกับอาหารทะเล อาหารรสจัด ของว่างเบาๆ หรือมื้ออาหารในชีวิตประจำวัน",
    "descriptionDe": "Dieser erfrischende Weißwein bietet ein knackiges, trockenes Profil mit lebendiger Säure und einem dezenten Hauch von Vanille. Unkompliziert und unprätentiös zu trinken, passt er wunderbar zu Meeresfrüchten, würzigen Gerichten, leichten Vorspeisen oder ungezwungenen Alltagsmahlzeiten.",
    "alcohol": "12,5%",
    "price": "550 ฿",
    "bannerColor": "#8b0000",
    "bottleImage": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/chardonnay-crisp-white-holla-1787558199226.webp",
    "showLogoBadge": false,
    "bottleScale": 271,
    "bottleScaleX": 104,
    "bottleOffsetX": 3,
    "bottleOffsetY": 3,
    "isAvailable": true,
    "updatedAt": "2026-08-24",
    "titleMm": "ရှာဒိုနေး\nကြွပ်ရွအဖြူ\nဟိုလာ",
    "subtitleMm": "အဖြူဝိုင်\nချီလီ",
    "descriptionMm": "ဤလန်းဆန်းသော အဖြူဝိုင်သည် ကြွပ်ရွပြီး ခြောက်သွေ့သော ပရိုဖိုင်ကို ရှင်သန်သော အက်ဆစ်ဓာတ်နှင့် သိမ်မွေ့သော ဗာနီလာအနံ့ အနည်းငယ်ဖြင့် ပေးစွမ်းသည်။ သောက်ရလွယ်ကူပြီး ရိုးရှင်းသော ဤဝိုင်သည် ပင်လယ်စာများ၊ စပ်သောဟင်းလျာများ၊ ပေါ့ပါးသော အစားအသောက်များ သို့မဟုတ် နေ့စဉ်ရိုးရိုးစားသောက်မှုများနှင့် အလွန်လိုက်ဖက်သည်။",
    "titleEs": "CHARDONNAY\nCRISP WHITE\nHolla",
    "subtitleEs": "VINO BLANCO\nCHILE",
    "descriptionEs": "Este refrescante vino blanco ofrece un perfil crujiente y seco con una acidez vibrante y un sutil toque de vainilla. Fácil de beber y sin pretensiones, marida maravillosamente con mariscos, platos picantes, aperitivos ligeros o comidas cotidianas informales.",
    "titleZh": "CHARDONNAY\n清爽白葡萄酒\nHolla",
    "subtitleZh": "白葡萄酒\n智利",
    "descriptionZh": "这款清爽的白葡萄酒呈现出清脆干爽的风格，酸度活泼，并带有微妙的香草气息。它易于饮用且平易近人，与海鲜、辛辣菜肴、清淡开胃菜或休闲日常餐食完美搭配。",
    "titleRu": "ШАРДОНЕ\nCRISP WHITE\nHolla",
    "subtitleRu": "БЕЛОЕ ВИНО\nЧИЛИ",
    "descriptionRu": "Это освежающее белое вино обладает хрустящим, сухим профилем с яркой кислотностью и тонким оттенком ванили. Легкое и непритязательное, оно прекрасно сочетается с морепродуктами, острыми блюдами, легкими закусками или повседневными трапезами.",
    "titleFr": "CHARDONNAY\nCRISP WHITE\nHolla",
    "subtitleFr": "VIN BLANC\nCHILI",
    "descriptionFr": "Ce vin blanc rafraîchissant présente un profil vif et sec, avec une acidité vibrante et une subtile touche de vanille. Facile à boire et sans prétention, il s'accorde à merveille avec les fruits de mer, les plats épicés, les entrées légères ou les repas quotidiens décontractés."
  },
  {
    "id": "wine-1787557940817",
    "title": "CABERNET SAUVIGNON\nVELVET RED\nHolla",
    "titleIt": "CABERNET SAUVIGNON\nVELVET RED\nHolla",
    "titleEn": "CABERNET SAUVIGNON\nVELVET RED\nHolla",
    "titleTh": "CABERNET SAUVIGNON\nVELVET RED\nHolla",
    "titleDe": "CABERNET SAUVIGNON\nVELVET RED\nHolla",
    "categorySubtitle": "RED WINE\nCHILE",
    "subtitleIt": "VINO ROSSO\nCILE",
    "subtitleEn": "RED WINE\nCHILE",
    "subtitleTh": "ไวน์แดง\nชิลี",
    "subtitleDe": "ROTWEIN\nCHILE",
    "categoryType": "white",
    "flag": "🇨🇱",
    "description": "This easy-drinking red wine offers a light, refreshing acidity with a fully dry profile and a subtle astringency. Its simple, approachable character pairs wonderfully with casual everyday meals, simple savory snacks, and relaxed social gatherings.",
    "descriptionIt": "Questo vino rosso facile da bere offre una leggera e rinfrescante acidità con un profilo completamente secco e una leggera astringenza. Il suo carattere semplice e accessibile si sposa meravigliosamente con pasti quotidiani informali, semplici snack salati e ritrovi sociali rilassati.",
    "descriptionEn": "This easy-drinking red wine offers a light, refreshing acidity with a fully dry profile and a subtle astringency. Its simple, approachable character pairs wonderfully with casual everyday meals, simple savory snacks, and relaxed social gatherings.",
    "descriptionTh": "ไวน์แดงที่ดื่มง่ายตัวนี้ให้ความสดชื่นด้วยความเป็นกรดเบาๆ มีรสแห้งสนิทและความฝาดเล็กน้อย บุคลิกที่เรียบง่ายและเข้าถึงง่ายเข้ากันได้อย่างยอดเยี่ยมกับมื้ออาหารในชีวิตประจำวัน ของว่างรสเค็ม และการสังสรรค์แบบสบายๆ",
    "descriptionDe": "Dieser unkomplizierte Rotwein bietet eine leichte, erfrischende Säure mit einem vollständig trockenen Profil und einer dezenten Adstringenz. Sein schlichter, zugänglicher Charakter passt wunderbar zu lockeren Alltagsgerichten, einfachen herzhaften Snacks und entspannten geselligen Zusammenkünften.",
    "alcohol": "12,5%",
    "price": "550 ฿",
    "bannerColor": "#8b0000",
    "bottleImage": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/cabernet-sauvignon-velvet-red-1787557938570.webp",
    "showLogoBadge": false,
    "bottleScale": 254,
    "bottleScaleX": 102,
    "bottleOffsetX": 3,
    "bottleOffsetY": 0,
    "isAvailable": true,
    "updatedAt": "2026-08-24",
    "titleMm": "ကာဘာနေးဆောဗီညွန်\nနူးညံ့အနီ\nဟိုလာ",
    "subtitleMm": "အနီဝိုင်\nချီလီ",
    "descriptionMm": "ဤသောက်ရလွယ်ကူသော အနီဝိုင်သည် ပေါ့ပါးပြီး လန်းဆန်းသော အက်ဆစ်ဓာတ်၊ လုံးဝခြောက်သွေ့သော ပရိုဖိုင်နှင့် အနည်းငယ်သော ချဉ်ဖန်ဖန်အရသာတို့ကို ပေးစွမ်းသည်။ ရိုးရှင်းပြီး လက်လှမ်းမီသော သဘောသဘာဝသည် နေ့စဉ်ရိုးရိုးစားသောက်မှုများ၊ ရိုးရှင်းသော အငန်အဆာများနှင့် ပေါ့ပါးသော လူမှုရေးတွေ့ဆုံပွဲများနှင့် အလွန်လိုက်ဖက်သည်။",
    "titleEs": "CABERNET SAUVIGNON\nVELVET RED\nHolla",
    "subtitleEs": "VINO TINTO\nCHILE",
    "descriptionEs": "Este vino tinto fácil de beber ofrece una acidez ligera y refrescante con un perfil completamente seco y una ligera astringencia. Su carácter sencillo y accesible marida maravillosamente con comidas cotidianas informales, aperitivos salados sencillos y reuniones sociales relajadas.",
    "titleZh": "CABERNET SAUVIGNON\n天鹅绒红葡萄酒\nHolla",
    "subtitleZh": "红葡萄酒\n智利",
    "descriptionZh": "这款易饮的红葡萄酒酸度轻盈清爽，口感完全干爽，并带有微妙的涩感。其简单平易近人的特性，与休闲日常餐食、简单咸味小吃和轻松社交聚会完美搭配。",
    "titleRu": "КАБЕРНЕ СОВИНЬОН\nVELVET RED\nHolla",
    "subtitleRu": "КРАСНОЕ ВИНО\nЧИЛИ",
    "descriptionRu": "Это легкое красное вино обладает освежающей кислотностью, полностью сухим профилем и легкой терпкостью. Его простой, доступный характер прекрасно сочетается с повседневными блюдами, простыми солеными закусками и непринужденными дружескими посиделками.",
    "titleFr": "CABERNET SAUVIGNON\nVELVET RED\nHolla",
    "subtitleFr": "VIN ROUGE\nCHILI",
    "descriptionFr": "Ce vin rouge facile à boire offre une acidité légère et rafraîchissante, un profil entièrement sec et une subtile astringence. Son caractère simple et accessible s'accorde à merveille avec les repas quotidiens décontractés, les en-cas salés simples et les rencontres sociales détendues."
  },
  {
    "id": "wine-1787557385611",
    "title": "CHAMPAGNE\nCOSTELLORE\nBlanc De Blancs",
    "titleIt": "CHAMPAGNE\nCOSTELLORE\nBlanc De Blancs",
    "titleEn": "CHAMPAGNE\nCOSTELLORE\nBlanc De Blancs",
    "titleTh": "CHAMPAGNE\nCOSTELLORE\nBlanc De Blancs",
    "titleDe": "CHAMPAGNE\nCOSTELLORE\nBlanc De Blancs",
    "categorySubtitle": "SPARKLING WINE\nITALY",
    "subtitleIt": "BOLLICINE\nITALIA",
    "subtitleEn": "SPARKLING WINE\nITALY",
    "subtitleTh": "สปาร์กลิงไวน์\nอิตาลี",
    "subtitleDe": "SCHAUMWEIN\nITALIEN",
    "categoryType": "sparkling",
    "flag": "🇮🇹",
    "description": "A refined sparkling wine made from Chardonnay grapes, showcasing bright acidity, vibrant freshness, and delicate citrus notes, with a crisp and refreshing finish. Ideal for celebrations and special occasions.",
    "descriptionIt": "Uno spumante raffinato ottenuto da uve Chardonnay, che esprime una brillante acidità, una freschezza vibrante e delicate note di agrumi, con un finale secco e rinfrescante. Ideale per celebrazioni e occasioni speciali.",
    "descriptionEn": "A refined sparkling wine made from Chardonnay grapes, showcasing bright acidity, vibrant freshness, and delicate citrus notes, with a crisp and refreshing finish. Ideal for celebrations and special occasions.",
    "descriptionTh": "สปาร์กลิงไวน์ชั้นเลิศจากองุ่นชาร์ดอนเนย์ เผยความสดใสของกรด ความสดชื่นมีชีวิตชีวา และกลิ่นซิตรัสอันละเอียดอ่อน จบท้ายด้วยความ crisp และสดชื่น เหมาะสำหรับการเฉลิมฉลองและโอกาสพิเศษ",
    "descriptionDe": "Ein raffinierter Schaumwein aus Chardonnay-Trauben, der eine brillante Säure, lebendige Frische und delikate Zitrusnoten zeigt, mit einem knackigen und erfrischenden Abgang. Ideal für Feiern und besondere Anlässe.",
    "alcohol": "12%",
    "price": "1190 ฿",
    "bannerColor": "#8b0000",
    "bottleImage": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/champagne-costellore-blanc-de-1787557384659.webp",
    "showLogoBadge": false,
    "bottleScale": 459,
    "bottleScaleX": 97,
    "bottleOffsetX": 0,
    "bottleOffsetY": 1,
    "isAvailable": true,
    "updatedAt": "2026-08-24",
    "titleMm": "ရှမ်ပိန်\nကိုစတဲလိုရေး\nဘလန့်ဒီဘလန့်",
    "subtitleMm": "တောက်ပသောဝိုင်\nအီတလီ",
    "descriptionMm": "ရှာဒိုနေးစပျစ်သီးမှ ထုတ်လုပ်ထားသော သန့်ရှင်းပြီး ချိုမြိန်သော ဝိုင်ဖြူဖြစ်ပြီး တောက်ပသော အက်ဆစ်ဓာတ်၊ လန်းဆန်းမှုနှင့် နူးညံ့သော လိမ္မော်သီးအနံ့များ ပါဝင်ကာ ခြောက်သွေ့ပြီး လန်းဆန်းသော အဆုံးသတ်မှု ရှိသည်။ အထိမ်းအမှတ်ပွဲများနှင့် အထူးအခါသမယများအတွက် သင့်တော်သည်။",
    "titleEs": "CHAMPAGNE\nCOSTELLORE\nBlanc De Blancs",
    "subtitleEs": "VINO ESPUMOSO\nITALIA",
    "descriptionEs": "Un refinado vino espumoso elaborado con uvas Chardonnay, que expresa una brillante acidez, una frescura vibrante y delicadas notas cítricas, con un final seco y refrescante. Ideal para celebraciones y ocasiones especiales.",
    "titleZh": "CHAMPAGNE\nCOSTELLORE\nBlanc De Blancs",
    "subtitleZh": "起泡酒\n意大利",
    "descriptionZh": "这款精致的起泡酒由霞多丽葡萄酿制而成，展现出明亮的酸度、充满活力的清新感和细腻的柑橘香气，余味干爽清新。非常适合庆祝活动和特殊场合。",
    "titleRu": "ШАМПАНЬ\nCOSTELLORE\nBlanc De Blancs",
    "subtitleRu": "ИГРИСТОЕ ВИНО\nИТАЛИЯ",
    "descriptionRu": "Изысканное игристое вино из винограда Шардоне, демонстрирующее яркую кислотность, вибрирующую свежесть и деликатные цитрусовые ноты с сухим и освежающим послевкусием. Идеально для торжеств и особых случаев.",
    "titleFr": "CHAMPAGNE\nCOSTELLORE\nBlanc De Blancs",
    "subtitleFr": "VIN MOUSSEUX\nITALIE - VÉNÉTIE",
    "descriptionFr": "Un spumante raffiné élaboré à partir de raisins Chardonnay, exprimant une acidité éclatante, une fraîcheur vibrante et de délicates notes d'agrumes, avec une finale sèche et rafraîchissante. Idéal pour les célébrations et les occasions spéciales."
  },
  {
    "id": "wine-1787557031415",
    "title": "PROSECCO SUPERIORE\nDOCG - EXTRA DRY\nTorresella",
    "titleIt": "PROSECCO SUPERIORE\nDOCG - EXTRA DRY\nTorresella",
    "titleEn": "PROSECCO SUPERIORE\nDOCG - EXTRA DRY\nTorresella",
    "titleTh": "PROSECCO SUPERIORE\nDOCG - EXTRA DRY\nTorresella",
    "titleDe": "PROSECCO SUPERIORE\nDOCG - EXTRA DRY\nTorresella",
    "categorySubtitle": "SPARKLING WINE\nITALY - VENETO",
    "subtitleIt": "BOLLICINE\nITALIA - VENETO",
    "subtitleEn": "SPARKLING WINE\nITALY - VENETO",
    "subtitleTh": "สปาร์กลิงไวน์\nอิตาลี - เวเนโต",
    "subtitleDe": "SCHAUMWEIN\nITALIEN - VENETIEN",
    "categoryType": "sparkling",
    "flag": "🇮🇹",
    "description": "This Venetian sparkling wine displays a pale straw-yellow color and a fresh, fragrant profile with delicate aromas of green apple, pear, and spring flowers. On the palate, it is harmonious and creamy, featuring a pleasant fruitiness, making it an excellent aperitif and food companion.",
    "descriptionIt": "Questo vino spumante veneto presenta un colore giallo paglierino tenue e un profilo fresco e fragrante, con delicati aromi di mela verde, pera e fiori di primavera. Al palato è armonioso e cremoso, con una piacevole fruttuosità, che lo rende un eccellente aperitivo e un ottimo compagno a tavola.",
    "descriptionEn": "This Venetian sparkling wine displays a pale straw-yellow color and a fresh, fragrant profile with delicate aromas of green apple, pear, and spring flowers. On the palate, it is harmonious and creamy, featuring a pleasant fruitiness, making it an excellent aperitif and food companion.",
    "descriptionTh": "สปาร์กลิงไวน์จากแคว้นเวเนโตนี้มีสีเหลืองฟางอ่อน สดชื่น หอมละมุนด้วยกลิ่นของแอปเปิ้ลเขียว ลูกแพร์ และดอกไม้ฤดูใบไม้ผลิ เมื่อเข้าปากให้ความรู้สึกกลมกล่อม นุ่มนวล มีกลิ่นผลไม้ที่ชวนเพลิดเพลิน เป็นทั้งไวน์เรียกน้ำย่อยและคู่กับอาหารได้อย่างยอดเยี่ยม",
    "descriptionDe": "Dieser venezianische Schaumwein präsentiert sich in einem blassen Strohgelb und einem frischen, duftigen Profil mit zarten Aromen von grünem Apfel, Birne und Frühlingsblumen. Am Gaumen ist er harmonisch und cremig, mit einer angenehmen Fruchtigkeit, was ihn zu einem ausgezeichneten Aperitif und Speisenbegleiter macht.",
    "alcohol": "11%",
    "price": "1290 ฿",
    "bannerColor": "#8b0000",
    "bottleImage": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/prosecco-doc-torresella-1787557030323.webp",
    "showLogoBadge": false,
    "bottleScale": 279,
    "bottleScaleX": 94,
    "bottleOffsetX": -8,
    "bottleOffsetY": 2,
    "isAvailable": true,
    "updatedAt": "2026-08-24",
    "titleMm": "ပရိုဆက်ကို ဆူပီရီယိုရေး\nဒီအိုစီဂျီ - အက်စထရာ ဒရိုင်\nတိုရက်ဆဲလာ",
    "subtitleMm": "တောက်ပသောဝိုင်\nအီတလီ - ဗီနီတို",
    "descriptionMm": "ဤဗီနီတိုဒေသထွက် တောက်ပသောဝိုင်သည် ဖျော့တော့သော ကောက်ရိုးဝါရောင် အရောင်ရှိပြီး လန်းဆန်းသော အနံ့အသက်များဖြစ်သည့် စိမ်းသောပန်းသီး၊ သစ်တော်သီးနှင့် နွေဦးပန်းများ၏ နူးညံ့သော ရနံ့များ ပါဝင်သည်။ လျှာပေါ်တွင် ဟန်ချက်ညီပြီး ခရင်မ်ဆန်သော အရသာရှိကာ နှစ်သက်ဖွယ် သစ်သီးအရသာဖြင့် ဧည့်ခံအဖျော်ယမကာအဖြစ်လည်းကောင်း၊ စားပွဲတွင် အဖော်အဖြစ်လည်းကောင်း အလွန်ကောင်းမွန်သည်။",
    "titleEs": "PROSECCO SUPERIORE\nDOCG - EXTRA DRY\nTorresella",
    "subtitleEs": "VINO ESPUMOSO\nITALIA - VENETO",
    "descriptionEs": "Este vino espumoso véneto presenta un color amarillo pajizo pálido y un perfil fresco y fragante, con delicados aromas de manzana verde, pera y flores primaverales. En paladar es armonioso y cremoso, con una agradable frutosidad, lo que lo convierte en un excelente aperitivo y un óptimo compañero a la mesa.",
    "titleZh": "PROSECCO SUPERIORE\nDOCG - EXTRA DRY\nTorresella",
    "subtitleZh": "起泡酒\n意大利 - 威尼托",
    "descriptionZh": "这款威尼托起泡酒呈现淡稻草黄色，风格清新芬芳，带有青苹果、梨和春季花朵的精致香气。口感和谐柔滑，果味愉悦，是极佳的餐前开胃酒和佐餐伴侣。",
    "titleRu": "ПРОСЕККО СУПЕРИОРЕ\nDOCG - EXTRA DRY\nTorresella",
    "subtitleRu": "ИГРИСТОЕ ВИНО\nИТАЛИЯ - ВЕНЕТО",
    "descriptionRu": "Это венецианское игристое вино имеет бледно-соломенный цвет и свежий, ароматный профиль с деликатными оттенками зеленого яблока, груши и весенних цветов. Во вкусе гармоничное и кремовое, с приятной фруктовостью, что делает его превосходным аперитивом и отличным сопровождением к столу.",
    "titleFr": "PROSECCO SUPERIORE\nDOCG - EXTRA DRY\nTorresella",
    "subtitleFr": "VIN MOUSSEUX\nITALIE - VÉNÉTIE",
    "descriptionFr": "Ce vin mousseux vénitien présente une couleur jaune paille pâle et un profil frais et parfumé, avec de délicats arômes de pomme verte, de poire et de fleurs printanières. En bouche, il est harmonieux et crémeux, offrant une agréable fruité, ce qui en fait un excellent apéritif et un merveilleux compagnon de table."
  },
  {
    "id": "wine-1787556458930",
    "title": "CABERNET SHIRAZ\nBIRCHGROVE\nBird’s Block Cuvee",
    "titleIt": "CABERNET SHIRAZ\nBIRCHGROVE\nBird’s Block Cuvee",
    "titleEn": "CABERNET SHIRAZ\nBIRCHGROVE\nBird’s Block Cuvee",
    "titleTh": "CABERNET SHIRAZ\nBIRCHGROVE\nเบิร์ดส์ บล็อค คูเว่",
    "titleDe": "CABERNET SHIRAZ\nBIRCHGROVE\nBird’s Block Cuvee",
    "categorySubtitle": "RED WINE\nAUSTRALIA - SOUTH",
    "subtitleIt": "VINO ROSSO\nAUSTRALIA - SUD",
    "subtitleEn": "RED WINE\nAUSTRALIA - SOUTH",
    "subtitleTh": "ไวน์แดง\nออสเตรเลีย - ใต้",
    "subtitleDe": "ROTWEIN\nAUSTRALIEN - SÜDEN",
    "categoryType": "red",
    "flag": "🇦🇺",
    "description": "This approachable Australian red wine reveals inviting aromas of ripe dark berries with a touch of spice. On the palate, it is smooth, well-rounded, and easygoing, offering a pleasant finish. It pairs wonderfully with casual everyday dinners, grilled meats, savory pasta dishes, and relaxed social gatherings.",
    "descriptionIt": "Questo vino rosso australiano accessibile rivela invitanti aromi di frutti di bosco scuri maturi con un tocco di spezie. Al palato è morbido, ben bilanciato e di facile beva, con un finale piacevole. Si abbina perfettamente a cene informali di tutti i giorni, carni alla griglia, piatti di pasta saporiti e incontri conviviali rilassati.",
    "descriptionEn": "This approachable Australian red wine reveals inviting aromas of ripe dark berries with a touch of spice. On the palate, it is smooth, well-rounded, and easygoing, offering a pleasant finish. It pairs wonderfully with casual everyday dinners, grilled meats, savory pasta dishes, and relaxed social gatherings.",
    "descriptionTh": "ไวน์แดงออสเตรเลียที่เข้าถึงง่ายนี้เผยกลิ่นหอมชวนดื่มของเบอร์รี่สีเข้มสุกพร้อมกลิ่นเครื่องเทศอ่อนๆ บนเพดานปากให้สัมผัสนุ่มนวล กลมกล่อม และผ่อนคลาย จบด้วยความยาวที่เพลิดเพลิน เข้ากันได้อย่างยอดเยี่ยมกับมื้อเย็นสบายๆ ในชีวิตประจำวัน เนื้อย่าง จานพาสต้าเข้มข้น และสังสรรค์กับเพื่อนฝูงอย่างเป็นกันเอง",
    "descriptionDe": "Dieser zugängliche australische Rotwein offenbart einladende Aromen von reifen dunklen Beeren mit einer Note von Gewürzen. Im Gaumen ist er weich, rund und unkompliziert, mit einem angenehmen Abgang. Er passt wunderbar zu ungezwungenen Alltagsessen, gegrilltem Fleisch, herzhaften Pastagerichten und entspannten geselligen Zusammenkünften.",
    "alcohol": "13,5%",
    "price": "790 ฿",
    "bannerColor": "#8b0000",
    "bottleImage": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/chardonnay-birchgrove-bird-s-b-1787556458235.webp",
    "showLogoBadge": false,
    "bottleScale": 129,
    "bottleScaleX": 98,
    "bottleOffsetX": 0,
    "bottleOffsetY": 0,
    "isAvailable": true,
    "updatedAt": "2026-08-24",
    "titleMm": "ကာဗာနက်ရှီရက်ဇ်\nဘာ့ချ်ဂရို့ဗ်\nဘတ်ဒ်စ်ဘလော့ခ် ကူဗေး",
    "subtitleMm": "ဝိုင်နီ\nဩစတြေးလျ - တောင်ပိုင်း",
    "descriptionMm": "ဤချဉ်းကပ်ရလွယ်သော ဩစတြေးလျဝိုင်နီသည် မှည့်သော သစ်တောသီးနက်များ၏ ဖိတ်ခေါ်နေသော ရနံ့များနှင့် ဟင်းခတ်အမွှေးအကြိုင်အနည်းငယ် ပါဝင်သည်။ လျှာပေါ်တွင် နူးညံ့ပြီး ဟန်ချက်ညီကာ သောက်ရလွယ်ကူပြီး နှစ်သက်ဖွယ် အဆုံးသတ်မှု ရှိသည်။ နေ့စဉ် သပ်ရပ်သော ညစာများ၊ မီးကင်အသားများ၊ အရသာရှိသော ပါစတာဟင်းလျာများနှင့် ပေါ့ပါးသော လူမှုရေးတွေ့ဆုံပွဲများနှင့် အလွန်ကိုက်ညီသည်။",
    "titleEs": "CABERNET SHIRAZ\nBIRCHGROVE\nBird’s Block Cuvee",
    "subtitleEs": "VINO TINTO\nAUSTRALIA - SUR",
    "descriptionEs": "Este accesible vino tinto australiano revela invitantes aromas de frutos rojos oscuros maduros con un toque de especias. En paladar es suave, bien equilibrado y de fácil beber, con un final agradable. Marida perfectamente con cenas informales de todos los días, carnes a la parrilla, platos de pasta sabrosos y encuentros sociales relajados.",
    "titleZh": "CABERNET SHIRAZ\nBIRCHGROVE\nBird’s Block Cuvee",
    "subtitleZh": "红葡萄酒\n澳大利亚 - 南部",
    "descriptionZh": "这款平易近人的澳大利亚红葡萄酒散发出成熟深色浆果的诱人香气，并带有一丝香料气息。口感柔顺、均衡易饮，余味愉悦。与日常休闲晚餐、烤肉、风味意面和轻松社交聚会完美搭配。",
    "titleRu": "КАБЕРНЕ ШИРАЗ\nBIRCHGROVE\nBird’s Block Cuvee",
    "subtitleRu": "КРАСНОЕ ВИНО\nАВСТРАЛИЯ - ЮГ",
    "descriptionRu": "Это доступное австралийское красное вино раскрывает привлекательные ароматы спелых темных ягод с оттенком специй. Во вкусе мягкое, округлое и легкое, с приятным послевкусием. Прекрасно сочетается с повседневными ужинами, мясом на гриле, пикантными пастами и непринужденными встречами.",
    "titleFr": "CABERNET SHIRAZ\nBIRCHGROVE\nBird’s Block Cuvee",
    "subtitleFr": "VIN ROUGE\nAUSTRALIE - SUD",
    "descriptionFr": "Ce vin rouge australien accessible révèle des arômes invitants de baies noires mûres avec une touche d'épices. En bouche, il est souple, bien équilibré et facile à boire, avec une finale agréable. Il s'accorde parfaitement avec les dîners décontractés de tous les jours, les viandes grillées, les plats de pâtes savoureux et les rencontres conviviales détendues."
  },
  {
    "id": "wine-1787556358661",
    "title": "CHARDONNAY\nBIRCHGROVE\nBird’s Block Cuvee",
    "titleIt": "CHARDONNAY\nBIRCHGROVE\nBird’s Block Cuvee",
    "titleEn": "CHARDONNAY\nBIRCHGROVE\nBird’s Block Cuvee",
    "titleTh": "CHARDONNAY\nBIRCHGROVE\nBird’s Block Cuvee",
    "titleDe": "CHARDONNAY\nBIRCHGROVE\nBird’s Block Cuvee",
    "categorySubtitle": "WHITE WINE\nAUSTRALIA - SOUTH WEST",
    "subtitleIt": "VINO BIANCO\nAUSTRALIA - SUDOVEST",
    "subtitleEn": "WHITE WINE\nAUSTRALIA - SOUTH WEST",
    "subtitleTh": "ไวน์ขาว\nออสเตรเลีย - ตะวันตกเฉียงใต้",
    "subtitleDe": "WEISSWEIN\nAUSTRALIEN - SÜDWESTEN",
    "categoryType": "white",
    "flag": "🇦🇺",
    "description": "This refreshing Australian white wine offers delightful aromas of crisp green apple, citrus zest, and subtle tropical fruits. On the palate, it is light, clean, and vibrant, with a soft, refreshing finish. Perfect as an aperitif, it pairs wonderfully with seafood, salads, and poultry.",
    "descriptionIt": "Questo rinfrescante vino bianco australiano offre deliziosi aromi di mela verde croccante, scorza di agrumi e sottili frutti tropicali. Al palato è leggero, pulito e vibrante, con un finale morbido e rinfrescante. Perfetto come aperitivo, si abbina meravigliosamente con frutti di mare, insalate e pollame.",
    "descriptionEn": "This refreshing Australian white wine offers delightful aromas of crisp green apple, citrus zest, and subtle tropical fruits. On the palate, it is light, clean, and vibrant, with a soft, refreshing finish. Perfect as an aperitif, it pairs wonderfully with seafood, salads, and poultry.",
    "descriptionTh": "ไวน์ขาวออสเตรเลียสดชื่นนี้ให้กลิ่นหอมของแอปเปิ้ลเขียวกรอบ เปลือกส้ม และผลไม้เมืองร้อนอย่างละมุน บนเพดานปากเบาสบาย สะอาด และมีชีวิตชีวา จบท้ายด้วยความนุ่มนวลสดชื่น เหมาะเป็นเครื่องดื่มเรียกน้ำย่อย เข้ากันได้อย่างยอดเยี่ยมกับอาหารทะเล สลัด และเนื้อสัตว์ปีก",
    "descriptionDe": "Dieser erfrischende australische Weißwein bietet köstliche Aromen von knackigem grünem Apfel, Zitruszesten und subtilen tropischen Früchten. Am Gaumen ist er leicht, klar und lebendig, mit einem weichen, erfrischenden Abgang. Perfekt als Aperitif, passt er wunderbar zu Meeresfrüchten, Salaten und Geflügel.",
    "alcohol": "12%",
    "price": "790 ฿",
    "bannerColor": "#8b0000",
    "bottleImage": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/chardonnay-birchgrove-bird-s-b-1787561708539.webp",
    "showLogoBadge": false,
    "bottleScale": 109,
    "bottleScaleX": 98,
    "bottleOffsetX": 0,
    "bottleOffsetY": 0,
    "isAvailable": true,
    "updatedAt": "2026-08-24",
    "titleMm": "ရှာဒိုနေး\nဘာ့ချ်ဂရို့ဗ်\nဘတ်ဒ်စ်ဘလော့ခ် ကူဗေး",
    "subtitleMm": "ဝိုင်ဖြူ\nဩစတြေးလျ - အနောက်တောင်ပိုင်း",
    "descriptionMm": "ဤလန်းဆန်းသော ဩစတြေးလျဝိုင်ဖြူသည် ကြွပ်ဆတ်သော စိမ်းသောပန်းသီး၊ လိမ္မော်ခွံနှင့် နူးညံ့သော အပူပိုင်းဒေသသစ်သီးများ၏ ရနံ့များ ပေးစွမ်းသည်။ လျှာပေါ်တွင် ပေါ့ပါး၊ သန့်ရှင်းပြီး တက်ကြွသော အရသာရှိကာ နူးညံ့ပြီး လန်းဆန်းသော အဆုံးသတ်မှု ရှိသည်။ ဧည့်ခံအဖျော်ယမကာအဖြစ် အကောင်းဆုံးဖြစ်ပြီး ပင်လယ်စာ၊ အသုပ်များနှင့် ကြက်ငှက်အသားများနှင့် အလွန်ကိုက်ညီသည်။",
    "titleEs": "CHARDONNAY\nBIRCHGROVE\nBird’s Block Cuvee",
    "subtitleEs": "VINO BLANCO\nAUSTRALIA - SUROESTE",
    "descriptionEs": "Este refrescante vino blanco australiano ofrece deliciosos aromas de manzana verde crujiente, ralladura de cítricos y sutiles frutas tropicales. En paladar es ligero, limpio y vibrante, con un final suave y refrescante. Perfecto como aperitivo, marida maravillosamente con mariscos, ensaladas y aves.",
    "titleZh": "CHARDONNAY\nBIRCHGROVE\nBird’s Block Cuvee",
    "subtitleZh": "白葡萄酒\n澳大利亚 - 西南部",
    "descriptionZh": "这款清爽的澳大利亚白葡萄酒带来脆爽青苹果、柑橘皮和微妙热带水果的愉悦香气。口感轻盈、干净且充满活力，余味柔和清新。非常适合作为开胃酒，与海鲜、沙拉和家禽搭配极佳。",
    "titleRu": "ШАРДОНЕ\nBIRCHGROVE\nBird’s Block Cuvee",
    "subtitleRu": "БЕЛОЕ ВИНО\nАВСТРАЛИЯ - ЮГО-ЗАПАД",
    "descriptionRu": "Это освежающее австралийское белое вино предлагает восхитительные ароматы хрустящего зеленого яблока, цитрусовой цедры и тонких тропических фруктов. Во вкусе легкое, чистое и яркое, с мягким, освежающим послевкусием. Идеально как аперитив, прекрасно сочетается с морепродуктами, салатами и птицей.",
    "titleFr": "CHARDONNAY\nBIRCHGROVE\nBird’s Block Cuvee",
    "subtitleFr": "VIN BLANC\nAUSTRALIE - SUD-OUEST",
    "descriptionFr": "Ce vin blanc australien rafraîchissant offre de délicieux arômes de pomme verte croquante, de zeste d'agrumes et de subtils fruits tropicaux. En bouche, il est léger, net et vibrant, avec une finale douce et rafraîchissante. Parfait en apéritif, il s'accorde merveilleusement avec les fruits de mer, les salades et la volaille."
  },
  {
    "id": "wine-1787556198475",
    "title": "SPARKLING ROSÉ\nDEMI-SEC\nGraziosa Canoro",
    "titleIt": "SPARKLING ROSÉ\nDEMI-SEC\nGraziosa Canoro",
    "titleEn": "SPARKLING ROSÉ\nDEMI-SEC\nGraziosa Canoro",
    "titleTh": "SPARKLING ROSÉ\nDEMI-SEC\nGraziosa Canoro",
    "titleDe": "SPARKLING ROSÉ\nDEMI-SEC\nGraziosa Canoro",
    "categorySubtitle": "ROSÉ WINE\nITALY",
    "subtitleIt": "VINO ROSATO\nITALIA",
    "subtitleEn": "ROSÉ WINE\nITALY",
    "subtitleTh": "ไวน์โรเซ่\nอิตาลี",
    "subtitleDe": "ROSÉWEIN\nITALIEN",
    "categoryType": "sparkling",
    "flag": "🇮🇹",
    "description": "This charming Italian sparkling rosé reveals delightful aromas of fresh strawberries, raspberries, and delicate floral notes. On the palate, it is pleasantly off-dry, creamy, and refreshing with a lively finish. It serves as a wonderful aperitif and pairs beautifully with light desserts, fresh fruit, or appetizers.",
    "descriptionIt": "Questo affascinante rosé spumante italiano rivela deliziosi aromi di fragole fresche, lamponi e delicate note floreali. Al palato è piacevolmente abboccato, cremoso e rinfrescante con un finale vivace. Si rivela un meraviglioso aperitivo e si abbina splendidamente a dessert leggeri, frutta fresca o antipasti.",
    "descriptionEn": "This charming Italian sparkling rosé reveals delightful aromas of fresh strawberries, raspberries, and delicate floral notes. On the palate, it is pleasantly off-dry, creamy, and refreshing with a lively finish. It serves as a wonderful aperitif and pairs beautifully with light desserts, fresh fruit, or appetizers.",
    "descriptionTh": "โรเซ่สปาร์กลิงไวน์สัญชาติอิตาเลียนสุดมีเสน่ห์นี้เผยกลิ่นหอมอันน่าหลงใหลของสตรอว์เบอร์รีสด ราสป์เบอร์รี และกลิ่นดอกไม้อ่อน ๆ เมื่อลิ้มรสให้สัมผัสที่หวานเล็กน้อย ครีมมี่ สดชื่น และจบได้อย่างมีชีวิตชีวา เหมาะเป็นเครื่องดื่มเรียกน้ำย่อยชั้นเลิศ และเข้ากันได้อย่างลงตัวกับของหวานเบา ๆ ผลไม้สด หรืออาหารเรียกน้ำย่อย",
    "descriptionDe": "Dieser charmante italienische Rosé-Schaumwein offenbart verführerische Aromen von frischen Erdbeeren, Himbeeren und zarten floralen Noten. Am Gaumen ist er angenehm restsüß, cremig und erfrischend mit einem lebendigen Abgang. Er eignet sich wunderbar als Aperitif und passt hervorragend zu leichten Desserts, frischem Obst oder Vorspeisen.",
    "alcohol": "11%",
    "price": "990 ฿",
    "bannerColor": "#8b0000",
    "bottleImage": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/rose-semi-sec-graziosa-1787556194882.webp",
    "showLogoBadge": false,
    "bottleScale": 135,
    "bottleScaleX": 87,
    "bottleOffsetX": 0,
    "bottleOffsetY": 0,
    "isAvailable": true,
    "updatedAt": "2026-08-24",
    "titleMm": "တောက်ပသော ရိုဇေး\nဒီမီ-ဆက်\nဂရာဇီယိုဆာ ကာနိုရို",
    "subtitleMm": "ရိုဇေးဝိုင်\nအီတလီ",
    "descriptionMm": "ဤဆွဲဆောင်မှုရှိသော အီတလီ တောက်ပသော ရိုဇေးဝိုင်သည် လတ်ဆတ်သော စတော်ဘယ်ရီ၊ ရက်စ်ဘယ်ရီနှင့် နူးညံ့သော ပန်းပွင့်ရနံ့များ ပေးစွမ်းသည်။ လျှာပေါ်တွင် ချိုမြိန်ပြီး ခရင်မ်ဆန်ကာ လန်းဆန်းသော အရသာရှိပြီး တက်ကြွသော အဆုံးသတ်မှု ရှိသည်။ ဧည့်ခံအဖျော်ယမကာအဖြစ် အံ့ဖွယ်ကောင်းပြီး ပေါ့ပါးသော အချိုပွဲများ၊ လတ်ဆတ်သော သစ်သီးများ သို့မဟုတ် အစားအစာများနှင့် အလွန်ကိုက်ညီသည်။",
    "titleEs": "SPARKLING ROSÉ\nDEMI-SEC\nGraziosa Canoro",
    "subtitleEs": "VINO ROSADO\nITALIA",
    "descriptionEs": "Este encantador rosado espumoso italiano revela deliciosos aromas de fresas frescas, frambuesas y delicadas notas florales. En paladar es agradablemente semidulce, cremoso y refrescante con un final vivaz. Se revela como un maravilloso aperitivo y marida espléndidamente con postres ligeros, fruta fresca o entrantes.",
    "titleZh": "SPARKLING ROSÉ\nDEMI-SEC\nGraziosa Canoro",
    "subtitleZh": "桃红葡萄酒\n意大利",
    "descriptionZh": "这款迷人的意大利起泡桃红葡萄酒散发出新鲜草莓、覆盆子和精致花香的愉悦香气。口感微甜、柔滑且清新，余味活泼。作为开胃酒极佳，与清淡甜点、新鲜水果或开胃菜搭配美妙。",
    "titleRu": "ИГРИСТОЕ РОЗОВОЕ\nDEMI-SEC\nGraziosa Canoro",
    "subtitleRu": "РОЗОВОЕ ВИНО\nИТАЛИЯ",
    "descriptionRu": "Это очаровательное итальянское игристое розовое вино раскрывает восхитительные ароматы свежей клубники, малины и деликатные цветочные ноты. Во вкусе приятно полусладкое, кремовое и освежающее с живым послевкусием. Является чудесным аперитивом и прекрасно сочетается с легкими десертами, свежими фруктами или закусками.",
    "titleFr": "SPARKLING ROSÉ\nDEMI-SEC\nGraziosa Canoro",
    "subtitleFr": "VIN ROSÉ\nITALIE",
    "descriptionFr": "Ce charmant rosé mousseux italien révèle de délicieux arômes de fraises fraîches, de framboises et de délicates notes florales. En bouche, il est agréablement demi-sec, crémeux et rafraîchissant avec une finale vive. Il constitue un merveilleux apéritif et s'accorde à merveille avec les desserts légers, les fruits frais ou les antipasti."
  },
  {
    "id": "wine-1787555985555",
    "title": "PRIMITIVO PUGLIA\nIGT PEPA\nNatale Verga",
    "titleIt": "PRIMITIVO PUGLIA\nIGT PEPA\nNatale Verga",
    "titleEn": "PRIMITIVO PUGLIA\nIGT PEPA\nNatale Verga",
    "titleTh": "PRIMITIVO PUGLIA\nIGT PEPA\nNatale Verga",
    "titleDe": "PRIMITIVO PUGLIA\nIGT PEPA\nNatale Verga",
    "categorySubtitle": "RED WINE\nITALY - PUGLIA",
    "subtitleIt": "VINO ROSSO\nITALIA - PUGLIA",
    "subtitleEn": "RED WINE\nITALY - PUGLIA",
    "subtitleTh": "ไวน์แดง\nอิตาลี - แคว้นปูลยา",
    "subtitleDe": "ROTWEIN\nITALIEN - APULIEN",
    "categoryType": "red",
    "flag": "🇮🇹",
    "description": "This rich southern Italian red wine offers inviting aromas of ripe dark cherries, blackberries, and subtle spicy notes. On the palate, it is full-bodied, warm, and velvety with smooth tannins and a generous finish. It pairs wonderfully with roasted meats, rich pasta dishes, and mature cheeses.",
    "descriptionIt": "Questo ricco vino rosso del sud Italia offre invitanti aromi di ciliegie scure mature, more e sottili note speziate. Al palato è corposo, caldo e vellutato, con tannini morbidi e un finale generoso. Si abbina meravigliosamente con carni arrosto, piatti di pasta ricchi e formaggi stagionati.",
    "descriptionEn": "This rich southern Italian red wine offers inviting aromas of ripe dark cherries, blackberries, and subtle spicy notes. On the palate, it is full-bodied, warm, and velvety with smooth tannins and a generous finish. It pairs wonderfully with roasted meats, rich pasta dishes, and mature cheeses.",
    "descriptionTh": "ไวน์แดงอันเข้มข้นจากอิตาลีตอนใต้ให้กลิ่นหอมชวนดื่มของเชอร์รี่ดำสุก แบล็กเบอร์รี่ และกลิ่นเครื่องเทศละมุน เมื่อดื่มแล้วให้สัมผัสเต็มรส อบอุ่น นุ่มนวลดุจกำมะหยี่ มีแทนนินเนียนละเอียดและจบอย่างยาวนาน เข้ากันได้อย่างยอดเยี่ยมกับเนื้อย่าง พาสต้าเข้มข้น และชีสแก่",
    "descriptionDe": "Dieser gehaltvolle Rotwein aus Süditalien verführt mit Aromen von reifen dunklen Kirschen, Brombeeren und dezenten würzigen Noten. Am Gaumen präsentiert er sich vollmundig, warm und samtig mit weichen Tanninen und einem großzügigen Abgang. Er passt wunderbar zu Braten, kräftigen Pastagerichten und gereiftem Käse.",
    "alcohol": "14%",
    "price": "1290 ฿",
    "bannerColor": "#8b0000",
    "bottleImage": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/primitivo-igt-natale-verga-1787555984602.webp",
    "showLogoBadge": false,
    "bottleScale": 363,
    "bottleScaleX": 96,
    "bottleOffsetX": -2,
    "bottleOffsetY": 1,
    "isAvailable": true,
    "updatedAt": "2026-08-24",
    "titleMm": "ပရီမီတီဗို ပူလီယာ\nIGT ပီပါ\nနာတာလေ ဗာဂါ",
    "subtitleMm": "အနီရောင်ဝိုင်\nအီတလီ - ပူလီယာ",
    "descriptionMm": "ဤအီတလီတောင်ပိုင်းမှ ကြွယ်ဝသော အနီရောင်ဝိုင်သည် မှည့်သော ချယ်ရီသီးနက်များ၊ ဘလက်ဘယ်ရီသီးများနှင့် နူးညံ့သော ဟင်းခတ်အမွှေးအကြိုင်များ၏ ဆွဲဆောင်မှုရှိသော အနံ့များကို ပေးစွမ်းသည်။ လျှာပေါ်တွင် ကိုယ်ထည်ပြည့်ဝ၍ နွေးထွေးပြီး ကတ္တီပါကဲ့သို့ နူးညံ့ကာ ချောမွေ့သော တန်နင်များနှင့် ရက်ရောသော အဆုံးသတ်ရှိသည်။ အသားကင်များ၊ ကြွယ်ဝသော ပါစတာဟင်းလျာများနှင့် ရင့်ကျက်သော ဒိန်ခဲများနှင့် အလွန်ကောင်းမွန်စွာ တွဲဖက်စားသုံးနိုင်သည်။",
    "titleEs": "PRIMITIVO PUGLIA\nIGT PEPA\nNatale Verga",
    "subtitleEs": "VINO TINTO\nITALIA - PUGLIA",
    "descriptionEs": "Este rico vino tinto del sur de Italia ofrece atractivos aromas de cerezas oscuras maduras, moras y sutiles notas especiadas. En boca es corpulento, cálido y aterciopelado, con taninos suaves y un final generoso. Marida maravillosamente con carnes asadas, platos de pasta ricos y quesos curados.",
    "titleZh": "普里米蒂沃\n普利亚 IGT PEPA\n娜塔莉·维尔加",
    "subtitleZh": "红葡萄酒\n意大利 - 普利亚",
    "descriptionZh": "这款浓郁的意大利南部红葡萄酒散发着成熟黑樱桃、黑莓的诱人香气，并伴有微妙的香料气息。口感饱满、温暖而丝滑，单宁柔顺，余味悠长。与烤肉、浓郁的意面菜肴及陈年奶酪完美搭配。",
    "titleRu": "ПРИМИТИВО ПУЛЬЯ\nIGT ПЕПА\nNatale Verga",
    "subtitleRu": "КРАСНОЕ ВИНО\nИТАЛИЯ - ПУЛЬЯ",
    "descriptionRu": "Это насыщенное красное вино из Южной Италии пленяет соблазнительными ароматами спелой тёмной черешни, ежевики и тонкими пряными нотками. Во вкусе оно полнотелое, тёплое и бархатистое, с мягкими танинами и щедрым послевкусием. Прекрасно сочетается с жареным мясом, насыщенными пастами и выдержанными сырами.",
    "titleFr": "PRIMITIVO PUGLIA\nIGT PEPA\nNatale Verga",
    "subtitleFr": "VIN ROUGE\nITALIE - PUGLIA",
    "descriptionFr": "Ce riche vin rouge du sud de l'Italie offre des arômes invitants de cerises noires mûres, de mûres et de subtiles notes épicées. En bouche, il est corsé, chaleureux et velouté, avec des tanins souples et une finale généreuse. Il s'accorde merveilleusement avec les viandes rôties, les plats de pâtes riches et les fromages affinés."
  },
  {
    "id": "wine-1787555839725",
    "title": "NERO D'AVOLA\nDOC\nCanoro",
    "titleIt": "NERO D'AVOLA\nDOC\nCanoro",
    "titleEn": "NERO D'AVOLA\nDOC\nCanoro",
    "titleTh": "NERO D'AVOLA\nDOC\nCanoro",
    "titleDe": "NERO D'AVOLA\nDOC\nCanoro",
    "categorySubtitle": "RED WINE\nITALY - SICILY",
    "subtitleIt": "VINO ROSSO\nITALIA - SICILIA",
    "subtitleEn": "RED WINE\nITALY - SICILY",
    "subtitleTh": "ไวน์แดง\nอิตาลี - ซิซิลี",
    "subtitleDe": "ROTWEIN\nITALIEN - SIZILIEN",
    "categoryType": "red",
    "flag": "🇮🇹",
    "description": "This vibrant Sicilian red wine offers rich aromas of ripe black cherries, plums, and a hint of Mediterranean spices. On the palate, it is medium-bodied, smooth, and fruit-forward with soft tannins and a pleasant, balanced finish. It pairs wonderfully with roasted red meats, pasta dishes with rich tomato sauces, and semi-aged cheeses.",
    "descriptionIt": "Questo vivace vino rosso siciliano offre ricchi aromi di amarene mature, prugne e un accenno di spezie mediterranee. Al palato è di corpo medio, morbido e fruttato, con tannini morbidi e un finale piacevole ed equilibrato. Si abbina meravigliosamente con carni rosse arrosto, piatti di pasta con sughi di pomodoro ricchi e formaggi semi-stagionati.",
    "descriptionEn": "This vibrant Sicilian red wine offers rich aromas of ripe black cherries, plums, and a hint of Mediterranean spices. On the palate, it is medium-bodied, smooth, and fruit-forward with soft tannins and a pleasant, balanced finish. It pairs wonderfully with roasted red meats, pasta dishes with rich tomato sauces, and semi-aged cheeses.",
    "descriptionTh": "ไวน์แดงซิซิลีที่มีชีวิตชีวานี้ให้กลิ่นหอมเข้มข้นของเชอร์รี่ดำสุก พลัม และเครื่องเทศเมดิเตอร์เรเนียนเล็กน้อย เมื่อดื่มแล้วมีบอดี้ปานกลาง นุ่มนวล โดดเด่นด้วยกลิ่นผลไม้ แทนนินนุ่ม และจบอย่างสมดุลที่น่าพึงพอใจ เข้ากันได้ดีกับเนื้อแดงย่าง พาสต้าซอสมะเขือเทศเข้มข้น และชีสกึ่งบ่ม",
    "descriptionDe": "Dieser lebendige sizilianische Rotwein bietet reiche Aromen von reifen schwarzen Kirschen, Pflaumen und einem Hauch mediterraner Gewürze. Am Gaumen ist er mittelkräftig, weich und fruchtbetont mit weichen Tanninen und einem angenehmen, ausgewogenen Abgang. Er passt wunderbar zu gegrilltem rotem Fleisch, Pasta-Gerichten mit reichhaltigen Tomatensaucen und halbgereiftem Käse.",
    "alcohol": "13,5%",
    "price": "1290 ฿",
    "bannerColor": "#8b0000",
    "bottleImage": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/nero-d-avola-doc-canoro-1787561786315.webp",
    "showLogoBadge": false,
    "bottleScale": 110,
    "bottleScaleX": 107,
    "bottleOffsetX": 0,
    "bottleOffsetY": 0,
    "isAvailable": true,
    "updatedAt": "2026-08-24",
    "titleMm": "နီရိုဒါဗိုလာ\nDOC\nကာနိုရို",
    "subtitleMm": "အနီရောင်ဝိုင်\nအီတလီ - စစ္စလီ",
    "descriptionMm": "ဤတက်ကြွသော စစ္စလီအနီရောင်ဝိုင်သည် မှည့်သော ချယ်ရီသီးနက်များ၊ ပန်းသီးများနှင့် မြေထဲပင်လယ်ဟင်းခတ်အမွှေးအကြိုင်များ၏ ကြွယ်ဝသော အနံ့များကို ပေးစွမ်းသည်။ လျှာပေါ်တွင် အလယ်အလတ်ကိုယ်ထည်ရှိ၍ ချောမွေ့ပြီး သစ်သီးအရသာရှိကာ နူးညံ့သော တန်နင်များနှင့် နှစ်သက်ဖွယ် ဟန်ချက်ညီသော အဆုံးသတ်ရှိသည်။ အသားနီကင်များ၊ ခရမ်းချဉ်သီးဆော့စ်ကြွယ်ဝသော ပါစတာဟင်းလျာများနှင့် အလယ်အလတ်ရင့်သော ဒိန်ခဲများနှင့် အလွန်ကောင်းမွန်စွာ တွဲဖက်စားသုံးနိုင်သည်။",
    "titleEs": "NERO D'AVOLA\nDOC\nCanoro",
    "subtitleEs": "VINO TINTO\nITALIA - SICILIA",
    "descriptionEs": "Este vibrante vino tinto siciliano ofrece ricos aromas de cerezas negras maduras, ciruelas y un toque de especias mediterráneas. En boca es de cuerpo medio, suave y afrutado, con taninos suaves y un final agradable y equilibrado. Marida maravillosamente con carnes rojas asadas, platos de pasta con ricas salsas de tomate y quesos semicurados.",
    "titleZh": "黑达沃拉\nDOC\n卡诺罗",
    "subtitleZh": "红葡萄酒\n意大利 - 西西里",
    "descriptionZh": "这款充满活力的西西里红葡萄酒散发着成熟黑樱桃、李子及一丝地中海香料的丰富香气。口感中等酒体，柔顺且果味突出，单宁柔和，余味愉悦而平衡。与烤红肉、浓郁番茄酱意面及半陈年奶酪完美搭配。",
    "titleRu": "НЕРО Д'АВОЛА\nDOC\nCanoro",
    "subtitleRu": "КРАСНОЕ ВИНО\nИТАЛИЯ - СИЦИЛИЯ",
    "descriptionRu": "Это яркое сицилийское красное вино раскрывается богатыми ароматами спелой чёрной черешни, сливы и лёгким намёком на средиземноморские специи. Во вкусе оно среднетелое, мягкое и фруктовое, с бархатистыми танинами и приятным сбалансированным послевкусием. Идеально подходит к жареному красному мясу, пасте с насыщенными томатными соусами и полутвёрдым сырам.",
    "titleFr": "NERO D'AVOLA\nDOC\nCanoro",
    "subtitleFr": "VIN ROUGE\nITALIE - SICILE",
    "descriptionFr": "Ce vin rouge sicilien vibrant offre de riches arômes de cerises noires mûres, de prunes et une touche d'épices méditerranéennes. En bouche, il est de corps moyen, souple et fruité, avec des tanins doux et une finale agréable et équilibrée. Il s'accorde merveilleusement avec les viandes rouges rôties, les plats de pâtes aux sauces tomate riches et les fromages semi-affinés."
  },
  {
    "id": "wine-1787497189793",
    "title": "PRIMITIVO\nIGT\nPepa Nera",
    "titleIt": "PRIMITIVO\nIGT\nPepa Nera",
    "titleEn": "PRIMITIVO\nIGT\nPepa Nera",
    "titleTh": "PRIMITIVO\nIGT\nPepa Nera",
    "titleDe": "PRIMITIVO\nIGT\nPepa Nera",
    "categorySubtitle": "RED WINE\nITALY - PUGLIA",
    "subtitleIt": "VINO ROSSO\nITALIA - PUGLIA",
    "subtitleEn": "RED WINE\nITALY - PUGLIA",
    "subtitleTh": "ไวน์แดง\nอิตาลี - แคว้นปูลยา",
    "subtitleDe": "ROTWEIN\nITALIEN - APULIEN",
    "categoryType": "red",
    "flag": "🇮🇹",
    "description": "This rich southern Italian red wine offers enticing aromas of ripe blackberries, dark plums, and sweet spices. On the palate, it is full-bodied, warm, and velvety with soft, rounded tannins and a smooth, lingering finish. It pairs wonderfully with robust red meats, rich pasta dishes, and mature cheeses.",
    "descriptionIt": "Questo ricco vino rosso del sud Italia offre invitanti aromi di more mature, prugne scure e spezie dolci. Al palato è corposo, caldo e vellutato, con tannini morbidi e rotondi e un finale liscio e persistente. Si abbina meravigliosamente con carni rosse robuste, piatti di pasta ricchi e formaggi stagionati.",
    "descriptionEn": "This rich southern Italian red wine offers enticing aromas of ripe blackberries, dark plums, and sweet spices. On the palate, it is full-bodied, warm, and velvety with soft, rounded tannins and a smooth, lingering finish. It pairs wonderfully with robust red meats, rich pasta dishes, and mature cheeses.",
    "descriptionTh": "ไวน์แดงเนื้อเข้มข้นจากอิตาลีตอนใต้ให้กลิ่นหอมเย้ายวนของแบล็กเบอร์รีสุก พลัมเข้ม และเครื่องเทศหวาน เมื่อเข้าปากให้สัมผัสเต็มรส อุ่นละมุน นุ่มนวลดั่งกำมะหยี่ แทนนินนุ่มกลมกล่อม จบท้ายยาวนุ่มนวล เข้ากันได้อย่างยอดเยี่ยมกับเนื้อแดงรสเข้มข้น พาสต้าซอสเข้มข้น และชีสแก่",
    "descriptionDe": "Dieser gehaltvolle Rotwein aus Süditalien verführt mit verlockenden Aromen von reifen Brombeeren, dunklen Pflaumen und süßen Gewürzen. Am Gaumen ist er vollmundig, warm und samtig mit weichen, runden Tanninen und einem sanften, anhaltenden Abgang. Er passt wunderbar zu kräftigem rotem Fleisch, reichhaltigen Pastagerichten und gereiftem Käse.",
    "alcohol": "14%",
    "price": "1290 ฿",
    "bannerColor": "#8b0000",
    "bottleImage": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/primitivo-igt-pepa-nera-1787556227844.webp",
    "showLogoBadge": false,
    "bottleScale": 108,
    "bottleScaleX": 100,
    "bottleOffsetX": 0,
    "bottleOffsetY": 0,
    "isAvailable": true,
    "updatedAt": "2026-08-24",
    "titleMm": "ပရီမီတီဗို\nIGT\nပီပါ နီရာ",
    "subtitleMm": "အနီရောင်ဝိုင်\nအီတလီ - ပူလီယာ",
    "descriptionMm": "ဤအီတလီတောင်ပိုင်းမှ ကြွယ်ဝသော အနီရောင်ဝိုင်သည် မှည့်သော ဘလက်ဘယ်ရီသီးများ၊ ပန်းသီးနက်များနှင့် ချိုမြိန်သော ဟင်းခတ်အမွှေးအကြိုင်များ၏ ဆွဲဆောင်မှုရှိသော အနံ့များကို ပေးစွမ်းသည်။ လျှာပေါ်တွင် ကိုယ်ထည်ပြည့်ဝ၍ နွေးထွေးပြီး ကတ္တီပါကဲ့သို့ နူးညံ့ကာ ချောမွေ့သော တန်နင်များနှင့် ချောမွေ့၍ ကြာရှည်သော အဆုံးသတ်ရှိသည်။ ခိုင်မာသော အသားနီများ၊ ကြွယ်ဝသော ပါစတာဟင်းလျာများနှင့် ရင့်ကျက်သော ဒိန်ခဲများနှင့် အလွန်ကောင်းမွန်စွာ တွဲဖက်စားသုံးနိုင်သည်။",
    "titleEs": "PRIMITIVO\nIGT\nPepa Nera",
    "subtitleEs": "VINO TINTO\nITALIA - PUGLIA",
    "descriptionEs": "Este rico vino tinto del sur de Italia ofrece atractivos aromas de moras maduras, ciruelas oscuras y especias dulces. En boca es corpulento, cálido y aterciopelado, con taninos suaves y redondos y un final sedoso y persistente. Marida maravillosamente con carnes rojas robustas, platos de pasta ricos y quesos curados.",
    "titleZh": "普里米蒂沃\nIGT\n黑胡椒",
    "subtitleZh": "红葡萄酒\n意大利 - 普利亚",
    "descriptionZh": "这款浓郁的意大利南部红葡萄酒散发着成熟黑莓、深色李子及甜香料的诱人香气。口感饱满、温暖而丝滑，单宁柔顺圆润，余味顺滑持久。与浓郁的红肉、丰盛的意面菜肴及陈年奶酪完美搭配。",
    "titleRu": "ПРИМИТИВО\nIGT\nPepa Nera",
    "subtitleRu": "КРАСНОЕ ВИНО\nИТАЛИЯ - ПУЛЬЯ",
    "descriptionRu": "Это щедрое красное вино из Южной Италии манит ароматами спелой ежевики, тёмной сливы и сладких специй. Во вкусе оно полнотелое, тёплое и бархатистое, с мягкими округлыми танинами и гладким продолжительным послевкусием. Великолепно сочетается с мощными красными мясными блюдами, насыщенной пастой и выдержанными сырами.",
    "titleFr": "PRIMITIVO\nIGT\nPepa Nera",
    "subtitleFr": "VIN ROUGE\nITALIE - PUGLIA",
    "descriptionFr": "Ce riche vin rouge du sud de l'Italie offre des arômes séduisants de mûres mûres, de prunes noires et d'épices douces. En bouche, il est corsé, chaleureux et velouté, avec des tanins souples et arrondis et une finale lisse et persistante. Il s'accorde merveilleusement avec les viandes rouges robustes, les plats de pâtes riches et les fromages affinés."
  },
  {
    "id": "wine-primitivo-pepa",
    "title": "BARBERA\nDOC\nSan Silvestro",
    "titleIt": "BARBERA\nDOC\nSan Silvestro",
    "titleEn": "BARBERA\nDOC\nSan Silvestro",
    "titleTh": "BARBERA\nDOC\nSan Silvestro",
    "titleDe": "BARBERA\nDOC\nSan Silvestro",
    "categorySubtitle": "RED WINE\nITALY - PIEMONTE",
    "subtitleIt": "VINO ROSSO\nITALIA - PIEMONTE",
    "subtitleEn": "RED WINE\nITALY - PIEMONTE",
    "subtitleTh": "ไวน์แดง\nอิตาลี - ปีเยมอนเต",
    "subtitleDe": "ROTWEIN\nITALIEN - PIEMONT",
    "categoryType": "red",
    "flag": "🇮🇹",
    "description": "This vibrant Italian red wine offers inviting aromas of fresh red cherries, blackberries, and subtle hints of violet. On the palate, it is medium-bodied, lively, and well-structured with bright acidity and smooth tannins, leading to a clean, refreshing finish. It pairs wonderfully with classic Italian pasta dishes, roasted poultry, cold cuts, and medium-aged cheeses.",
    "descriptionIt": "Questo vivace vino rosso italiano offre invitanti aromi di ciliegie fresche, more e sottili sentori di violetta. Al palato è di corpo medio, vivace e ben strutturato, con acidità brillante e tannini morbidi, che conducono a un finale pulito e rinfrescante. Si abbina meravigliosamente con piatti classici della pasta italiana, pollame arrosto, affettati e formaggi a media stagionatura.",
    "descriptionEn": "This vibrant Italian red wine offers inviting aromas of fresh red cherries, blackberries, and subtle hints of violet. On the palate, it is medium-bodied, lively, and well-structured with bright acidity and smooth tannins, leading to a clean, refreshing finish. It pairs wonderfully with classic Italian pasta dishes, roasted poultry, cold cuts, and medium-aged cheeses.",
    "descriptionTh": "ไวน์แดงอิตาเลียนที่มีชีวิตชีวานี้ให้กลิ่นหอมชวนดื่มของเชอร์รี่แดงสด แบล็กเบอร์รี่ และกลิ่นไวโอเล็ตอันละเอียดอ่อน เมื่อดื่มแล้วให้ความรู้สึกเต็มปากปานกลาง มีชีวิตชีวา และมีโครงสร้างที่ดี ด้วยความเป็นกรดที่สดใสและแทนนินที่นุ่มนวล นำไปสู่รสชาติที่สะอาดและสดชื่น เหมาะอย่างยิ่งกับอาหารพาสต้าอิตาเลียนคลาสสิก เนื้อสัตว์ปีกย่าง เนื้อเย็น และชีสที่บ่มปานกลาง",
    "descriptionDe": "Dieser lebendige italienische Rotwein bietet verlockende Aromen von frischen Kirschen, Brombeeren und subtilen Veilchennoten. Am Gaumen ist er mittelkräftig, lebendig und gut strukturiert mit heller Säure und weichen Tanninen, die zu einem klaren, erfrischenden Abgang führen. Er passt wunderbar zu klassischen italienischen Pastagerichten, Bratgeflügel, Aufschnitt und mittelaltem Käse.",
    "alcohol": "13,5%",
    "price": "1190฿",
    "bannerColor": "#8b0000",
    "bottleImage": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/barbera-piemonte-sansilvestro-1787556228432.webp",
    "showLogoBadge": true,
    "bottleScale": 310,
    "bottleScaleX": 100,
    "bottleOffsetX": 0,
    "bottleOffsetY": 1,
    "isAvailable": true,
    "updatedAt": "2026-08-24",
    "titleMm": "ဘာဘီရာ\nDOC\nဆန်ဆီလဗက်စထရို",
    "subtitleMm": "အနီရောင်ဝိုင်\nအီတလီ - ပီမွန်တေ",
    "descriptionMm": "ဤတက်ကြွသော အီတလီအနီရောင်ဝိုင်သည် လတ်ဆတ်သော ချယ်ရီသီးများ၊ ဘလက်ဘယ်ရီသီးများနှင့် နူးညံ့သော ဗိုင်အိုလက်ပန်း၏ အနံ့များကို ပေးစွမ်းသည်။ လျှာပေါ်တွင် အလယ်အလတ်ကိုယ်ထည်ရှိ၍ တက်ကြွပြီး ဖွဲ့စည်းမှုကောင်းကာ တောက်ပသော အက်ဆစ်ဓာတ်နှင့် နူးညံ့သော တန်နင်များရှိပြီး သန့်ရှင်း၍ လန်းဆန်းသော အဆုံးသတ်သို့ ပို့ဆောင်သည်။ ဂန္ထဝင် အီတလီပါစတာဟင်းလျာများ၊ အသားကင်ငှက်များ၊ အသားအေးများနှင့် အလယ်အလတ်ရင့်သော ဒိန်ခဲများနှင့် အလွန်ကောင်းမွန်စွာ တွဲဖက်စားသုံးနိုင်သည်။",
    "titleEs": "BARBERA\nDOC\nSan Silvestro",
    "subtitleEs": "VINO TINTO\nITALIA - PIEMONTE",
    "descriptionEs": "Este vibrante vino tinto italiano ofrece atractivos aromas de cerezas frescas, moras y sutiles toques de violeta. En boca es de cuerpo medio, vivaz y bien estructurado, con acidez brillante y taninos suaves, que conducen a un final limpio y refrescante. Marida maravillosamente con platos clásicos de pasta italiana, aves asadas, embutidos y quesos de media curación.",
    "titleZh": "巴贝拉\nDOC\n圣西尔维斯特罗",
    "subtitleZh": "红葡萄酒\n意大利 - 皮埃蒙特",
    "descriptionZh": "这款充满活力的意大利红葡萄酒散发着新鲜红樱桃、黑莓及淡淡紫罗兰的诱人香气。口感中等酒体，活泼且结构良好，酸度明亮，单宁柔顺，余味干净清爽。与经典意大利面食、烤禽肉、冷切肉及中等陈年奶酪完美搭配。",
    "titleRu": "БАРБЕРА\nDOC\nSan Silvestro",
    "subtitleRu": "КРАСНОЕ ВИНО\nИТАЛИЯ - ПЬЕМОНТ",
    "descriptionRu": "Это живое итальянское красное вино дарит привлекательные ароматы свежей красной черешни, ежевики и тонких оттенков фиалки. Во вкусе оно среднетелое, энергичное и хорошо структурированное, с яркой кислотностью и мягкими танинами, ведущими к чистому освежающему финалу. Прекрасно подходит к классическим итальянским пастам, жареной птице, мясным нарезкам и сырам средней выдержки.",
    "titleFr": "BARBERA\nDOC\nSan Silvestro",
    "subtitleFr": "VIN ROUGE\nITALIE - PIÉMONT",
    "descriptionFr": "Ce vin rouge italien vibrant offre des arômes invitants de cerises fraîches, de mûres et de subtiles notes de violette. En bouche, il est de corps moyen, vif et bien structuré, avec une acidité éclatante et des tanins souples, conduisant à une finale nette et rafraîchissante. Il s'accorde merveilleusement avec les plats de pâtes italiens classiques, la volaille rôtie, la charcuterie et les fromages d'âge moyen."
  },
  {
    "id": "wine-pinot-grigio",
    "title": "CHARDONNAY\nDOC\nSan Silavstro",
    "titleIt": "CHARDONNAY\nDOC\nSan Silavstro",
    "titleEn": "CHARDONNAY\nDOC\nSan Silavstro",
    "titleTh": "CHARDONNAY\nDOC\nSan Silavstro",
    "titleDe": "CHARDONNAY\nDOC\nSan Silavstro",
    "categorySubtitle": "WHITE WINE\nITALY - PIEMONTE",
    "subtitleIt": "VINO BIANCO\nITALIA - PIEMONTE",
    "subtitleEn": "WHITE WINE\nITALY - PIEMONTE",
    "subtitleTh": "ไวน์ขาว\nอิตาลี - ปีเยมอนเต",
    "subtitleDe": "WEISSWEIN\nITALIEN - PIEMONT",
    "categoryType": "white",
    "flag": "🇮🇹",
    "description": "This elegant Italian white wine presents delightful aromas of green apple, ripe pear, and subtle hints of white flowers. On the palate, it is fresh, clean, and well-balanced with a smooth and refreshing finish. It serves as an excellent aperitif and pairs wonderfully with fish dishes, poultry, and light appetizers.",
    "descriptionIt": "Questo elegante vino bianco italiano presenta deliziosi aromi di mela verde, pera matura e sottili sentori di fiori bianchi. Al palato è fresco, pulito e ben bilanciato, con un finale morbido e rinfrescante. Si presta come ottimo aperitivo e si abbina meravigliosamente con piatti di pesce, pollame e antipasti leggeri.",
    "descriptionEn": "This elegant Italian white wine presents delightful aromas of green apple, ripe pear, and subtle hints of white flowers. On the palate, it is fresh, clean, and well-balanced with a smooth and refreshing finish. It serves as an excellent aperitif and pairs wonderfully with fish dishes, poultry, and light appetizers.",
    "descriptionTh": "ไวน์ขาวอิตาเลียนอันหรูหรานี้เผยกลิ่นหอมอันน่าหลงใหลของแอปเปิ้ลเขียว แพร์สุก และกลิ่นดอกไม้ขาวอันละเอียดอ่อน เมื่อลิ้มรสให้ความรู้สึกสดชื่น สะอาด และสมดุล จบด้วยความนุ่มนวลและสดชื่น เหมาะเป็นไวน์เรียกน้ำย่อยชั้นเลิศ และเข้ากันได้อย่างยอดเยี่ยมกับเมนูปลา สัตว์ปีก และของทานเล่นเบาๆ",
    "descriptionDe": "Dieser elegante italienische Weißwein präsentiert verführerische Aromen von grünem Apfel, reifer Birne und subtilen Anklängen von weißen Blüten. Am Gaumen ist er frisch, klar und ausgewogen mit einem sanften und erfrischenden Abgang. Er eignet sich hervorragend als Aperitif und passt wunderbar zu Fischgerichten, Geflügel und leichten Vorspeisen.",
    "alcohol": "12,5%",
    "price": "1190฿",
    "bannerColor": "#b45309",
    "bottleImage": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/chardonnay-piemonte-sansilvest-1787556228923.webp",
    "showLogoBadge": true,
    "bottleScale": 98,
    "bottleScaleX": 102,
    "bottleOffsetX": 0,
    "bottleOffsetY": 0,
    "isAvailable": true,
    "updatedAt": "2026-08-24",
    "titleMm": "ရှာဒိုနေး\nDOC\nဆန်ဆီလဗက်စထရို",
    "subtitleMm": "အဖြူရောင်ဝိုင်\nအီတလီ - ပီမွန်တေ",
    "descriptionMm": "ဤကြော့ရှင်းသော အီတလီအဖြူရောင်ဝိုင်သည် စိမ်းသော ပန်းသီး၊ မှည့်သော သစ်တော်သီးနှင့် နူးညံ့သော အဖြူရောင်ပန်းများ၏ အနံ့များကို ပေးစွမ်းသည်။ လျှာပေါ်တွင် လတ်ဆတ်၍ သန့်ရှင်းပြီး ဟန်ချက်ညီကာ ချောမွေ့၍ လန်းဆန်းသော အဆုံးသတ်ရှိသည်။ ထူးခြားသော အစားအသောက်မတိုင်မီ သောက်ရန် သင့်တော်ပြီး ငါးဟင်းလျာများ၊ ငှက်သားများနှင့် ပေါ့ပါးသော အစားအသောက်များနှင့် အလွန်ကောင်းမွန်စွာ တွဲဖက်စားသုံးနိုင်သည်။",
    "titleEs": "CHARDONNAY\nDOC\nSan Silavstro",
    "subtitleEs": "VINO BLANCO\nITALIA - PIEMONTE",
    "descriptionEs": "Este elegante vino blanco italiano presenta deliciosos aromas de manzana verde, pera madura y sutiles toques de flores blancas. En boca es fresco, limpio y bien equilibrado, con un final suave y refrescante. Se presta como excelente aperitivo y marida maravillosamente con platos de pescado, aves y entrantes ligeros.",
    "titleZh": "霞多丽\nDOC\n圣西尔维斯特罗",
    "subtitleZh": "白葡萄酒\n意大利 - 皮埃蒙特",
    "descriptionZh": "这款优雅的意大利白葡萄酒呈现出青苹果、熟梨及淡淡白花的怡人香气。口感清新、干净且平衡，余味柔顺清爽。非常适合作为开胃酒，与鱼类菜肴、禽肉及清淡前菜完美搭配。",
    "titleRu": "ШАРДОНЕ\nDOC\nSan Silavstro",
    "subtitleRu": "БЕЛОЕ ВИНО\nИТАЛИЯ - ПЬЕМОНТ",
    "descriptionRu": "Это элегантное итальянское белое вино пленяет восхитительными ароматами зелёного яблока, спелой груши и лёгкими нотками белых цветов. Во вкусе оно свежее, чистое и хорошо сбалансированное, с мягким освежающим послевкусием. Отлично подходит в качестве аперитива и прекрасно сочетается с рыбными блюдами, птицей и лёгкими закусками.",
    "titleFr": "CHARDONNAY\nDOC\nSan Silavstro",
    "subtitleFr": "VIN BLANC\nITALIE - PIÉMONT",
    "descriptionFr": "Cet élégant vin blanc italien présente de délicieux arômes de pomme verte, de poire mûre et de subtiles notes de fleurs blanches. En bouche, il est frais, net et bien équilibré, avec une finale douce et rafraîchissante. Il constitue un excellent apéritif et s'accorde merveilleusement avec les plats de poisson, la volaille et les entrées légères."
  },
  {
    "id": "wine-poggio-alto-rosso",
    "title": "TRADITION BRUT\nDOMAINE CUVÉE\nCold River",
    "titleIt": "TRADITION BRUT\nDOMAINE CUVÉE\nCold River",
    "titleEn": "TRADITION BRUT\nDOMAINE CUVÉE\nCold River",
    "titleTh": "TRADITION BRUT\nDOMAINE CUVÉE\nCold River",
    "titleDe": "TRADITION BRUT\nDOMAINE CUVÉE\nCold River",
    "categorySubtitle": "SPARKLING WINE\nITALY",
    "subtitleIt": "BOLLICINE\nITALIA",
    "subtitleEn": "SPARKLING WINE\nITALY",
    "subtitleTh": "สปาร์กลิงไวน์\nอิตาลี",
    "subtitleDe": "SCHAUMWEIN\nITALIEN",
    "categoryType": "sparkling",
    "flag": "🇦🇺",
    "description": "This Australian sparkling wine reveals fresh aromas of green apple, citrus zest, and delicate white peach. On the palate, it is light, dry, and lively, with a fine mousse and a clean, refreshing finish. Perfect as an aperitif, it pairs wonderfully with seafood, appetizers, and light starters.",
    "descriptionIt": "Questo spumante australiano rivela aromi freschi di mela verde, scorza di agrumi e delicata pesca bianca. Al palato è leggero, secco e vivace, con una fine effervescenza e un finale pulito e rinfrescante. Perfetto come aperitivo, si abbina meravigliosamente con frutti di mare, stuzzichini e antipasti leggeri.",
    "descriptionEn": "This Australian sparkling wine reveals fresh aromas of green apple, citrus zest, and delicate white peach. On the palate, it is light, dry, and lively, with a fine mousse and a clean, refreshing finish. Perfect as an aperitif, it pairs wonderfully with seafood, appetizers, and light starters.",
    "descriptionTh": "สปาร์กลิงไวน์จากออสเตรเลียตัวนี้เผยกลิ่นหอมสดชื่นของแอปเปิ้ลเขียว เปลือกส้ม และพีชขาวละมุน เมื่อดื่มแล้วให้ความรู้สึกเบา ดราย และมีชีวิตชีวา พร้อมฟองละเอียดและจบรสที่สะอาดสดชื่น เหมาะเป็นเครื่องดื่มเรียกน้ำย่อย เข้ากันได้อย่างยอดเยี่ยมกับอาหารทะเล ของทานเล่น และอาหารเรียกน้ำย่อยเบาๆ",
    "descriptionDe": "Dieser australische Schaumwein offenbart frische Aromen von grünem Apfel, Zitruszesten und zartem weißem Pfirsich. Am Gaumen ist er leicht, trocken und lebendig, mit feiner Perlage und einem klaren, erfrischenden Abgang. Perfekt als Aperitif, passt er wunderbar zu Meeresfrüchten, Häppchen und leichten Vorspeisen.",
    "alcohol": "12%",
    "price": "990฿",
    "bannerColor": "#991b1b",
    "bottleImage": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/cuv-e-tradition-brut-domaine-c-1787556229398.webp",
    "showLogoBadge": true,
    "bottleScale": 116,
    "bottleScaleX": 92,
    "bottleOffsetX": 0,
    "bottleOffsetY": 0,
    "isAvailable": true,
    "updatedAt": "2026-08-24",
    "titleMm": "TRADITION BRUT\nDOMAINE CUVÉE\nCold River",
    "subtitleMm": "တောက်ပသောဝိုင်\nအီတလီ",
    "descriptionMm": "ဤဩစတြေးလျတောက်ပသောဝိုင်သည် စိမ်းသောပန်းသီး၊ လိမ္မော်ခွံနှင့် နူးညံ့သောအဖြူရောင်မက်မွန်သီး၏ လတ်ဆတ်သောရနံ့များကို ဖော်ပြသည်။ လျှာပေါ်တွင် ပေါ့ပါး၊ ခြောက်သွေ့ပြီး ရှင်သန်မှုရှိကာ နူးညံ့သောအမြှုပ်များနှင့် သန့်ရှင်းလန်းဆန်းသော အဆုံးသတ်ရှိသည်။ အစားအသောက်မတိုင်မီ သောက်ရန်အတွက် ပြည့်စုံပြီး ပင်လယ်စာ၊ အဆာပြေစာနှင့် ပေါ့ပါးသော အစားအစာများနှင့် အလွန်ကောင်းမွန်စွာ တွဲဖက်နိုင်သည်။",
    "titleEs": "TRADICIÓN BRUT\nDOMAINE CUVÉE\nCold River",
    "subtitleEs": "VINO ESPUMOSO\nITALIA",
    "descriptionEs": "Este vino espumoso australiano revela aromas frescos de manzana verde, cáscara de cítricos y delicado melocotón blanco. En boca es ligero, seco y vivaz, con una fina efervescencia y un final limpio y refrescante. Perfecto como aperitivo, marida maravillosamente con mariscos, aperitivos y entrantes ligeros.",
    "titleZh": "TRADITION BRUT\nDOMAINE CUVÉE\nCold River",
    "subtitleZh": "起泡酒\n澳大利亚",
    "descriptionZh": "这款澳大利亚起泡酒散发着清新的青苹果、柑橘皮和细腻的白桃香气。口感轻盈、干爽而活泼，气泡细腻，余味干净清爽。作为开胃酒完美，与海鲜、开胃小菜和清淡前菜搭配极佳。",
    "titleRu": "ТРАДИЦИОННЫЙ БРЮТ\nДОМЕН КЮВЕ\nКолд Ривер",
    "subtitleRu": "ИГРИСТОЕ ВИНО\nАВСТРАЛИЯ",
    "descriptionRu": "Это австралийское игристое вино раскрывает свежие ароматы зеленого яблока, цитрусовой цедры и нежного белого персика. Во вкусе оно легкое, сухое и живое, с тонким муссом и чистым, освежающим послевкусием. Идеально в качестве аперитива, прекрасно сочетается с морепродуктами, закусками и легкими стартерами.",
    "titleFr": "TRADITION BRUT\nDOMAINE CUVÉE\nCold River",
    "subtitleFr": "VIN MOUSSEUX\nAUSTRALIE",
    "descriptionFr": "Ce vin mousseux australien révèle des arômes frais de pomme verte, de zeste d'agrumes et de délicate pêche blanche. En bouche, il est léger, sec et vif, avec une fine mousse et une finale nette et rafraîchissante. Parfait en apéritif, il s'accorde merveilleusement avec les fruits de mer, les amuse-bouches et les entrées légères."
  },
  {
    "id": "wine-prosecco-docg",
    "title": "PROSECCO SUPERIORE\nDOC EXTRA DRY\nAmore Rubato",
    "titleIt": "PROSECCO SUPERIORE\nDOC EXTRA DRY\nAmore Rubato",
    "titleEn": "PROSECCO SUPERIORE\nDOC EXTRA DRY\nAmore Rubato",
    "titleTh": "PROSECCO SUPERIORE\nDOC EXTRA DRY\nAmore Rubato",
    "titleDe": "PROSECCO SUPERIORE\nDOC EXTRA DRY\nAmore Rubato",
    "categorySubtitle": "SPARKLING WINE\nITALY - VENETO",
    "subtitleIt": "BOLLICINE\nITALIA - VENETO",
    "subtitleEn": "SPARKLING WINE\nITALY - VENETO",
    "subtitleTh": "สปาร์กลิงไวน์\nอิตาลี - แคว้นเวเนโต",
    "subtitleDe": "SCHAUMWEIN\nITALIEN - VENETIEN",
    "categoryType": "sparkling",
    "flag": "🇮🇹",
    "description": "This elegant Italian sparkling wine offers delightful aromas of crisp green apple, fresh pear, and delicate white blossoms. On the palate, it is harmonious, refreshing, and pleasantly off-dry, featuring a fine perlage and a smooth, fruity finish. It serves as an exceptional aperitif and pairs wonderfully with light appetizers, seafood, and fresh fruit.",
    "descriptionIt": "Questo elegante spumante italiano offre deliziosi aromi di mela verde croccante, pera fresca e delicati fiori bianchi. Al palato è armonioso, rinfrescante e piacevolmente abboccato, con un perlage fine e un finale morbido e fruttato. Si rivela un eccezionale aperitivo e si abbina meravigliosamente con antipasti leggeri, frutti di mare e frutta fresca.",
    "descriptionEn": "This elegant Italian sparkling wine offers delightful aromas of crisp green apple, fresh pear, and delicate white blossoms. On the palate, it is harmonious, refreshing, and pleasantly off-dry, featuring a fine perlage and a smooth, fruity finish. It serves as an exceptional aperitif and pairs wonderfully with light appetizers, seafood, and fresh fruit.",
    "descriptionTh": "สปาร์กลิงไวน์อิตาเลียนสุดหรูนี้มอบกลิ่นหอมอันน่าหลงใหลของแอปเปิ้ลเขียวกรอบ ลูกแพร์สด และดอกไม้สีขาวละมุน บนเพดานปากให้ความรู้สึกกลมกล่อม สดชื่น และมีความหวานเล็กน้อยอย่างน่าพึงพอใจ พร้อมฟองละเอียดและรสชาติที่เนียนนุ่มด้วยกลิ่นผลไม้ เหมาะเป็นเอเปอริทีฟชั้นเยี่ยมและเข้ากันได้อย่างวิเศษกับอาหารเรียกน้ำย่อยเบาๆ อาหารทะเล และผลไม้สด",
    "descriptionDe": "Dieser elegante italienische Schaumwein bietet verführerische Aromen von knackigem grünem Apfel, frischer Birne und zarten weißen Blüten. Am Gaumen ist er harmonisch, erfrischend und angenehm halbtrocken, mit feiner Perlage und einem weichen, fruchtigen Abgang. Er ist ein außergewöhnlicher Aperitif und passt wunderbar zu leichten Vorspeisen, Meeresfrüchten und frischem Obst.",
    "alcohol": "11%",
    "price": "1290฿",
    "bannerColor": "#0f766e",
    "bottleImage": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/prosecco-doc-extra-dry-amore-r-1787556229741.webp",
    "showLogoBadge": true,
    "bottleScale": 134,
    "bottleScaleX": 90,
    "bottleOffsetX": 0,
    "bottleOffsetY": -3,
    "isAvailable": true,
    "updatedAt": "2026-08-24",
    "titleMm": "PROSECCO SUPERIORE\nDOC EXTRA DRY\nAmore Rubato",
    "subtitleMm": "တောက်ပသောဝိုင်\nအီတလီ - ဗီနီတို",
    "descriptionMm": "ဤကြော့ရှင်းသောအီတလီတောက်ပသောဝိုင်သည် ကြွပ်ရွသောစိမ်းသောပန်းသီး၊ လတ်ဆတ်သောသစ်တော်သီးနှင့် နူးညံ့သောအဖြူရောင်ပန်းများ၏ ရနံ့များကို ပေးသည်။ လျှာပေါ်တွင် သဟဇာတဖြစ်ပြီး လန်းဆန်းကာ သောက်လို့ကောင်းသော အချိုဓာတ်အနည်းငယ်ရှိသည်။ နူးညံ့သောအမြှုပ်များနှင့် ချောမွေ့ပြီး သစ်သီးရနံ့ရှိသော အဆုံးသတ်ရှိသည်။ အစားအသောက်မတိုင်မီ သောက်ရန်အတွက် ထူးခြားကောင်းမွန်ပြီး ပေါ့ပါးသော အဆာပြေစာ၊ ပင်လယ်စာနှင့် လတ်ဆတ်သောသစ်သီးများနှင့် အလွန်ကောင်းမွန်စွာ တွဲဖက်နိုင်သည်။",
    "titleEs": "PROSECCO SUPERIORE\nDOC EXTRA DRY\nAmore Rubato",
    "subtitleEs": "VINO ESPUMOSO\nITALIA - VENETO",
    "descriptionEs": "Este elegante vino espumoso italiano ofrece deliciosos aromas de manzana verde crujiente, pera fresca y delicadas flores blancas. En boca es armonioso, refrescante y agradablemente semidulce, con una fina burbuja y un final suave y afrutado. Se revela como un excepcional aperitivo y marida maravillosamente con entrantes ligeros, mariscos y fruta fresca.",
    "titleZh": "PROSECCO SUPERIORE\nDOC EXTRA DRY\nAmore Rubato",
    "subtitleZh": "起泡酒\n意大利 - 威尼托",
    "descriptionZh": "这款优雅的意大利起泡酒带来脆爽青苹果、新鲜梨和精致白花的愉悦香气。口感和谐、清爽，略带甜味，气泡细腻，余味柔顺且富有果香。作为开胃酒表现出色，与清淡前菜、海鲜和新鲜水果搭配美妙。",
    "titleRu": "ПРОСЕККО СУПЕРИОРЕ\nDOC ЭКСТРА ДРАЙ\nАморе Рубато",
    "subtitleRu": "ИГРИСТОЕ ВИНО\nИТАЛИЯ - ВЕНЕТО",
    "descriptionRu": "Это элегантное итальянское игристое вино предлагает восхитительные ароматы хрустящего зеленого яблока, свежей груши и нежных белых цветов. Во вкусе оно гармоничное, освежающее и приятно полусухое, с тонким перляжем и мягким, фруктовым послевкусием. Это исключительный аперитив, который прекрасно сочетается с легкими закусками, морепродуктами и свежими фруктами.",
    "titleFr": "PROSECCO SUPERIORE\nDOC EXTRA DRY\nAmore Rubato",
    "subtitleFr": "VIN MOUSSEUX\nITALIE - VÉNÉTIE",
    "descriptionFr": "Cet élégant vin mousseux italien offre de délicieux arômes de pomme verte croquante, de poire fraîche et de délicates fleurs blanches. En bouche, il est harmonieux, rafraîchissant et agréablement demi-sec, avec une fine perlage et une finale douce et fruitée. Il constitue un apéritif exceptionnel et s'accorde merveilleusement avec les entrées légères, les fruits de mer et les fruits frais."
  },
  {
    "id": "wine-rose-france",
    "title": "ROSE’\nDE FRANCE\nLes Pins d’Aubane",
    "titleIt": "ROSE’\nDE FRANCE\nLes Pins d’Aubane",
    "titleEn": "ROSE’\nDE FRANCE\nLes Pins d’Aubane",
    "titleTh": "ROSE’\nDE FRANCE\nLes Pins d’Aubane",
    "titleDe": "ROSE’\nDE FRANCE\nLes Pins d’Aubane",
    "categorySubtitle": "ROSÉ WINE\nFRANCE",
    "subtitleIt": "VINO ROSATO\nFRANCIA",
    "subtitleEn": "ROSÉ WINE\nFRANCE",
    "subtitleTh": "ไวน์โรเซ่\nฝรั่งเศส",
    "subtitleDe": "ROSÉWEIN\nFRANKREICH",
    "categoryType": "rose",
    "flag": "🇫🇷",
    "description": "This refreshing French rosé wine presents charming aromas of fresh red summer berries, delicate citrus notes, and subtle floral nuances. On the palate, it is light, crisp, and well-balanced with a clean, lively finish. It serves as a fantastic aperitif and pairs wonderfully with light salads, seafood, grilled fish, and Mediterranean dishes.",
    "descriptionIt": "Questo rinfrescante vino rosato francese presenta deliziosi aromi di frutti di bosco rossi freschi, delicate note di agrumi e sottili sfumature floreali. Al palato è leggero, fresco e ben bilanciato, con un finale pulito e vivace. È un ottimo aperitivo e si abbina meravigliosamente con insalate leggere, frutti di mare, pesce alla griglia e piatti mediterranei.",
    "descriptionEn": "This refreshing French rosé wine presents charming aromas of fresh red summer berries, delicate citrus notes, and subtle floral nuances. On the palate, it is light, crisp, and well-balanced with a clean, lively finish. It serves as a fantastic aperitif and pairs wonderfully with light salads, seafood, grilled fish, and Mediterranean dishes.",
    "descriptionTh": "ไวน์โรเซ่ฝรั่งเศสที่สดชื่นนี้ให้กลิ่นหอมอันน่าหลงใหลของเบอร์รี่สีแดงสดในฤดูร้อน กลิ่นซิตรัสที่ละเอียดอ่อน และกลิ่นดอกไม้อ่อนๆ เมื่อดื่มแล้วให้ความรู้สึกเบา กรุบกรอบ และสมดุล จบด้วยความสะอาดและมีชีวิตชีวา เหมาะเป็นไวน์เรียกน้ำย่อยชั้นเยี่ยม และเข้ากันได้อย่างยอดเยี่ยมกับสลัดเบาๆ อาหารทะเล ปลาย่าง และอาหารเมดิเตอร์เรเนียน",
    "descriptionDe": "Dieser erfrischende französische Roséwein verführt mit charmanten Aromen von frischen roten Sommerbeeren, delikaten Zitrusnoten und subtilen floralen Nuancen. Am Gaumen ist er leicht, knackig und ausgewogen mit einem klaren, lebendigen Abgang. Er eignet sich hervorragend als Aperitif und passt wunderbar zu leichten Salaten, Meeresfrüchten, gegrilltem Fisch und mediterranen Gerichten.",
    "alcohol": "12%",
    "price": "990฿",
    "bannerColor": "#be185d",
    "bottleImage": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/rose-de-france-les-pins-d-auba-1787556230284.webp",
    "showLogoBadge": true,
    "bottleScale": 359,
    "bottleScaleX": 98,
    "bottleOffsetX": 0,
    "bottleOffsetY": -2,
    "isAvailable": true,
    "updatedAt": "2026-08-24",
    "titleMm": "ROSE’\nDE FRANCE\nLes Pins d’Aubane",
    "subtitleMm": "ပန်းရောင်ဝိုင်\nပြင်သစ်",
    "descriptionMm": "ဤလန်းဆန်းသောပြင်သစ်ပန်းရောင်ဝိုင်သည် လတ်ဆတ်သောအနီရောင်သစ်တောသီးများ၊ နူးညံ့သောလိမ္မော်ရနံ့များနှင့် သိမ်မွေ့သောပန်းရနံ့များ၏ ဆွဲဆောင်မှုရှိသောရနံ့များကို ပေးသည်။ လျှာပေါ်တွင် ပေါ့ပါး၊ လန်းဆန်းပြီး ကောင်းမွန်စွာဟန်ချက်ညီကာ သန့်ရှင်းရှင်သန်သော အဆုံးသတ်ရှိသည်။ အစားအသောက်မတိုင်မီ သောက်ရန်အတွက် အလွန်ကောင်းမွန်ပြီး ပေါ့ပါးသောသုပ်များ၊ ပင်လယ်စာ၊ ကင်ထားသောငါးနှင့် မြေထဲပင်လယ်အစားအစာများနှင့် အလွန်ကောင်းမွန်စွာ တွဲဖက်နိုင်သည်။",
    "titleEs": "ROSE’\nDE FRANCE\nLes Pins d’Aubane",
    "subtitleEs": "VINO ROSADO\nFRANCIA",
    "descriptionEs": "Este refrescante vino rosado francés presenta deliciosos aromas de frutos rojos frescos, delicadas notas cítricas y sutiles matices florales. En boca es ligero, fresco y bien equilibrado, con un final limpio y vivaz. Es un excelente aperitivo y marida maravillosamente con ensaladas ligeras, mariscos, pescado a la parrilla y platos mediterráneos.",
    "titleZh": "ROSE’\nDE FRANCE\nLes Pins d’Aubane",
    "subtitleZh": "桃红葡萄酒\n法国",
    "descriptionZh": "这款清爽的法国桃红葡萄酒呈现迷人的新鲜红色浆果、细腻柑橘和微妙花香。口感轻盈、爽脆且平衡，余味干净活泼。作为开胃酒极佳，与清淡沙拉、海鲜、烤鱼和地中海菜肴搭配美妙。",
    "titleRu": "РОЗОВОЕ\nДЕ ФРАНС\nLes Pins d’Aubane",
    "subtitleRu": "РОЗОВОЕ ВИНО\nФРАНЦИЯ",
    "descriptionRu": "Это освежающее французское розовое вино обладает очаровательными ароматами свежих красных летних ягод, деликатными цитрусовыми нотками и тонкими цветочными нюансами. Во вкусе оно легкое, свежее и хорошо сбалансированное, с чистым, живым послевкусием. Это фантастический аперитив, который прекрасно сочетается с легкими салатами, морепродуктами, рыбой на гриле и средиземноморскими блюдами.",
    "titleFr": "ROSÉ\nDE FRANCE\nLes Pins d'Aubane",
    "subtitleFr": "VIN ROSÉ\nFRANCE",
    "descriptionFr": "Ce vin rosé français rafraîchissant présente des arômes charmants de baies rouges fraîches, de délicates notes d'agrumes et de subtiles nuances florales. En bouche, il est léger, vif et bien équilibré, avec une finale nette et vive. Il constitue un apéritif fantastique et s'accorde merveilleusement avec les salades légères, les fruits de mer, le poisson grillé et les plats méditerranéens."
  },
  {
    "id": "wine-vina-toldos-rosso",
    "title": "CABERNET SAUVIGNON\nESTATE BOTTLED\nViña Toldos",
    "titleIt": "CABERNET SAUVIGNON\nIMBOTTIGLIATO IN TENUTA\nViña Toldos",
    "titleEn": "CABERNET SAUVIGNON\nESTATE BOTTLED\nViña Toldos",
    "titleTh": "CABERNET SAUVIGNON\nESTATE BOTTLED\nViña Toldos",
    "titleDe": "CABERNET SAUVIGNON\nESTATE BOTTLED\nViña Toldos",
    "categorySubtitle": "RED WINE\nCHILE - COLCHAGUA",
    "subtitleIt": "VINO ROSSO\nCILE - COLCHAGUA",
    "subtitleEn": "RED WINE\nCHILE - COLCHAGUA",
    "subtitleTh": "ไวน์แดง\nชิลี - โคลชากัว",
    "subtitleDe": "ROTWEIN\nCHILE - COLCHAGUA",
    "categoryType": "white",
    "flag": "🇨🇱",
    "description": "This Chilean Cabernet Sauvignon offers appealing aromas of ripe blackberries, plums, and a hint of eucalyptus or pepper. On the palate, it is smooth and well-rounded with soft, balanced tannins and a pleasing, structured finish. It pairs wonderfully with grilled red meats, beef, lamb, and mature cheeses.",
    "descriptionIt": "Questo Cabernet Sauvignon cileno offre aromi invitanti di more mature, prugne e un accenno di eucalipto o pepe. Al palato è morbido e ben equilibrato, con tannini delicati e armoniosi e un finale piacevole e strutturato. Si abbina meravigliosamente con carni rosse alla griglia, manzo, agnello e formaggi stagionati.",
    "descriptionEn": "This Chilean Cabernet Sauvignon offers appealing aromas of ripe blackberries, plums, and a hint of eucalyptus or pepper. On the palate, it is smooth and well-rounded with soft, balanced tannins and a pleasing, structured finish. It pairs wonderfully with grilled red meats, beef, lamb, and mature cheeses.",
    "descriptionTh": "ไวน์ Cabernet Sauvignon จากชิลีตัวนี้ให้กลิ่นหอมน่าดึงดูดของแบล็กเบอร์รีสุก พลัม และกลิ่นยูคาลิปตัสหรือพริกไทยเล็กน้อย เมื่อดื่มแล้วให้สัมผัสนุ่มนวลกลมกล่อม มีแทนนินที่นุ่มนวลสมดุล และจบด้วยความยาวที่ลงตัว เข้ากันได้อย่างยอดเยี่ยมกับเนื้อแดงย่าง เนื้อวัว เนื้อแกะ และชีสแก่",
    "descriptionDe": "Dieser chilenische Cabernet Sauvignon bietet verlockende Aromen von reifen Brombeeren, Pflaumen und einem Hauch von Eukalyptus oder Pfeffer. Im Gaumen ist er weich und rund mit weichen, ausgewogenen Tanninen und einem angenehmen, strukturierten Abgang. Er passt wunderbar zu gegrilltem rotem Fleisch, Rind, Lamm und gereiftem Käse.",
    "alcohol": "13.5%",
    "price": "690฿",
    "bannerColor": "#831843",
    "bottleImage": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/vi-a-toldos-red-vi-a-san-pedro-1787556230657.webp",
    "showLogoBadge": true,
    "bottleScale": 108,
    "bottleScaleX": 97,
    "bottleOffsetX": 0,
    "bottleOffsetY": 0,
    "isAvailable": true,
    "updatedAt": "2026-08-24",
    "titleMm": "CABERNET SAUVIGNON\nESTATE BOTTLED\nViña Toldos",
    "subtitleMm": "အနီရောင်ဝိုင်\nချီလီ - ကိုလ်ချာဂွာ",
    "descriptionMm": "ဤချီလီကာဘာနက်ဆိုဗီညွန်ဝိုင်သည် မှည့်သောဘလက်ဘယ်ရီသီး၊ ပန်းသီးနှင့် ယူကလစ်ပင် သို့မဟုတ် ငရုတ်ကောင်းအနံ့အနည်းငယ်တို့၏ ဆွဲဆောင်မှုရှိသောရနံ့များကို ပေးသည်။ လျှာပေါ်တွင် နူးညံ့ပြီး ကောင်းမွန်စွာဟန်ချက်ညီကာ နူးညံ့သော တန်နင်များနှင့် နှစ်သက်ဖွယ်ဖွဲ့စည်းထားသော အဆုံးသတ်ရှိသည်။ ကင်ထားသောအနီရောင်အသား၊ အမဲသား၊ သိုးသားနှင့် ရင့်သောဒိန်ခဲများနှင့် အလွန်ကောင်းမွန်စွာ တွဲဖက်နိုင်သည်။",
    "titleEs": "CABERNET SAUVIGNON\nESTATE BOTTLED\nViña Toldos",
    "subtitleEs": "VINO TINTO\nCHILE - COLCHAGUA",
    "descriptionEs": "Este Cabernet Sauvignon chileno ofrece aromas atractivos de moras maduras, ciruelas y un toque de eucalipto o pimienta. En boca es suave y bien equilibrado, con taninos delicados y armoniosos y un final agradable y estructurado. Marida maravillosamente con carnes rojas a la parrilla, ternera, cordero y quesos curados.",
    "titleZh": "CABERNET SAUVIGNON\nESTATE BOTTLED\nViña Toldos",
    "subtitleZh": "红葡萄酒\n智利 - 空加瓜",
    "descriptionZh": "这款智利赤霞珠带来成熟黑莓、李子以及一丝桉树或胡椒的诱人香气。口感柔顺圆润，单宁柔和平衡，余味愉悦且结构良好。与烤红肉、牛肉、羊肉和成熟奶酪搭配美妙。",
    "titleRu": "КАБЕРНЕ СОВИНЬОН\nВИНОГРАДНИК РАЗЛИВ\nViña Toldos",
    "subtitleRu": "КРАСНОЕ ВИНО\nЧИЛИ - КОЛЬЧАГУА",
    "descriptionRu": "Это чилийское Каберне Совиньон предлагает привлекательные ароматы спелой ежевики, сливы и оттенок эвкалипта или перца. Во вкусе оно мягкое и округлое, с мягкими, сбалансированными танинами и приятным, структурированным послевкусием. Прекрасно сочетается с красным мясом на гриле, говядиной, ягненком и выдержанными сырами.",
    "titleFr": "CABERNET SAUVIGNON\nEMBOUTEILLÉ AU DOMAINE\nViña Toldos",
    "subtitleFr": "VIN ROUGE\nCHILI - COLCHAGUA",
    "descriptionFr": "Ce Cabernet Sauvignon chilien offre des arômes séduisants de mûres mûres, de prunes et une touche d'eucalyptus ou de poivre. En bouche, il est souple et bien rond, avec des tanins doux et équilibrés et une finale agréable et structurée. Il s'accorde merveilleusement avec les viandes rouges grillées, le bœuf, l'agneau et les fromages affinés."
  },
  {
    "id": "wine-1787555664725",
    "title": "SAUVIGNON BLANC\nESTATE BOTTLED\nViña Toldos",
    "titleIt": "SAUVIGNON BLANC\nIMBOTTIGLIATO IN TENUTA\nViña Toldos",
    "titleEn": "SAUVIGNON BLANC\nESTATE BOTTLED\nViña Toldos",
    "titleTh": "SAUVIGNON BLANC\nเอสเตท บอทเทิลด์\nViña Toldos",
    "titleDe": "SAUVIGNON BLANC\nESTATE BOTTLED\nViña Toldos",
    "categorySubtitle": "WHITE WINE\nCHILE - LEYDA",
    "subtitleIt": "VINO BIANCO\nCILE - LEYDA",
    "subtitleEn": "WHITE WINE\nCHILE - LEYDA",
    "subtitleTh": "ไวน์ขาว\nชิลี - เลย์ดา",
    "subtitleDe": "WEISSWEIN\nCHILE - LEYDA",
    "categoryType": "white",
    "flag": "🇨🇱",
    "description": "This Chilean Sauvignon Blanc offers vibrant aromas of crisp green apple, zesty lime, and characteristic hints of fresh herbaceous notes. On the palate, it is light, crisp, and refreshing with lively acidity and a clean, mineral-driven finish. It pairs wonderfully with seafood, grilled fish, fresh salads, and light appetizers.",
    "descriptionIt": "Questo Sauvignon Blanc cileno offre aromi vivaci di mela verde croccante, lime zesty e caratteristici sentori di erbe fresche. Al palato è leggero, fresco e rinfrescante, con un'acidità vivace e un finale pulito e minerale. Si abbina meravigliosamente con frutti di mare, pesce alla griglia, insalate fresche e antipasti leggeri.",
    "descriptionEn": "This Chilean Sauvignon Blanc offers vibrant aromas of crisp green apple, zesty lime, and characteristic hints of fresh herbaceous notes. On the palate, it is light, crisp, and refreshing with lively acidity and a clean, mineral-driven finish. It pairs wonderfully with seafood, grilled fish, fresh salads, and light appetizers.",
    "descriptionTh": "ซอวิญอง บล็องส์ จากชิลี นี้ มอบกลิ่นหอมสดชื่นของแอปเปิ้ลเขียวกรุบกรอบ มะนาวเปรี้ยวสดใส และกลิ่นสมุนไพรสดที่เป็นเอกลักษณ์ เมื่อดื่มแล้วให้ความรู้สึกเบาสบาย  crisp และสดชื่น ด้วยความเป็นกรดที่มีชีวิตชีวา และจบด้วยความสะอาดและแร่ธาตุ เข้ากันได้อย่างยอดเยี่ยมกับอาหารทะเล ปลาย่าง สลัดสด และของทานเล่นเบาๆ",
    "descriptionDe": "Dieser chilenische Sauvignon Blanc bietet lebendige Aromen von knackigem grünem Apfel, spritzigem Limettensaft und charakteristischen frischen Kräuternoten. Am Gaumen ist er leicht, knackig und erfrischend mit lebendiger Säure und einem klaren, mineralischen Abgang. Er passt wunderbar zu Meeresfrüchten, gegrilltem Fisch, frischen Salaten und leichten Vorspeisen.",
    "alcohol": "12.5%",
    "price": "690฿",
    "bannerColor": "#831843",
    "bottleImage": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/vi-a-toldos-white-vi-a-san-ped-1787555662147.webp",
    "showLogoBadge": true,
    "bottleScale": 107,
    "bottleScaleX": 97,
    "bottleOffsetX": 0,
    "bottleOffsetY": 0,
    "isAvailable": true,
    "updatedAt": "2026-08-24",
    "titleMm": "SAUVIGNON BLANC\nESTATE BOTTLED\nViña Toldos",
    "subtitleMm": "အဖြူရောင်ဝိုင်\nချီလီ - လေယ်ဒါ",
    "descriptionMm": "ဤချီလီဆိုဗီညွန်ဘလန်ဝိုင်သည် ကြွပ်ရွသောစိမ်းသောပန်းသီး၊ လိမ္မော်သီးရည်နှင့် လတ်ဆတ်သောဟင်းသီးဟင်းရွက်ရနံ့များ၏ ထင်ရှားသောလက္ခဏာများကို ပေးသည်။ လျှာပေါ်တွင် ပေါ့ပါး၊ လန်းဆန်းပြီး ရှင်သန်သောအက်ဆစ်ဓာတ်နှင့် သန့်ရှင်းသောသတ္တုဓာတ်ရနံ့ရှိသော အဆုံးသတ်ရှိသည်။ ပင်လယ်စာ၊ ကင်ထားသောငါး၊ လတ်ဆတ်သောသုပ်များနှင့် ပေါ့ပါးသောအဆာပြေစာများနှင့် အလွန်ကောင်းမွန်စွာ တွဲဖက်နိုင်သည်။",
    "titleEs": "SAUVIGNON BLANC\nESTATE BOTTLED\nViña Toldos",
    "subtitleEs": "VINO BLANCO\nCHILE - LEYDA",
    "descriptionEs": "Este Sauvignon Blanc chileno ofrece aromas vibrantes de manzana verde crujiente, lima cítrica y característicos matices de hierbas frescas. En boca es ligero, fresco y refrescante, con una acidez vivaz y un final limpio y mineral. Marida maravillosamente con mariscos, pescado a la parrilla, ensaladas frescas y entrantes ligeros.",
    "titleZh": "SAUVIGNON BLANC\nESTATE BOTTLED\nViña Toldos",
    "subtitleZh": "白葡萄酒\n智利 - 莱达",
    "descriptionZh": "这款智利长相思带来脆爽青苹果、活泼青柠和典型的新鲜草本气息。口感轻盈、爽脆且清新，酸度活泼，余味干净且带有矿物感。与海鲜、烤鱼、新鲜沙拉和清淡前菜搭配美妙。",
    "titleRu": "СОВИНЬОН БЛАН\nВИНОГРАДНИК РАЗЛИВ\nViña Toldos",
    "subtitleRu": "БЕЛОЕ ВИНО\nЧИЛИ - ЛЕЙДА",
    "descriptionRu": "Это чилийское Совиньон Блан предлагает яркие ароматы хрустящего зеленого яблока, цедры лайма и характерные оттенки свежих травянистых нот. Во вкусе оно легкое, свежее и освежающее, с живой кислотностью и чистым, минеральным послевкусием. Прекрасно сочетается с морепродуктами, рыбой на гриле, свежими салатами и легкими закусками.",
    "titleFr": "SAUVIGNON BLANC\nEMBOUTEILLÉ AU DOMAINE\nViña Toldos",
    "subtitleFr": "VIN BLANC\nCHILI - LEYDA",
    "descriptionFr": "Ce Sauvignon Blanc chilien offre des arômes vibrants de pomme verte croquante, de citron vert zesté et de caractéristiques notes herbacées fraîches. En bouche, il est léger, vif et rafraîchissant, avec une acidité vive et une finale nette et minérale. Il s'accorde merveilleusement avec les fruits de mer, le poisson grillé, les salades fraîches et les entrées légères."
  }
];

export const renderCountryFlag = (flagOrItem: any, customClass?: string) => {
  if (!flagOrItem) return null;

  let flagStr = '';
  if (typeof flagOrItem === 'string') {
    flagStr = flagOrItem;
  } else if (typeof flagOrItem === 'object') {
    flagStr = flagOrItem.flag || flagOrItem.country || flagOrItem.countryCode || '';
  }

  if (!flagStr || typeof flagStr !== 'string') return null;

  const clean = flagStr.trim();
  if (!clean) return null;

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

  const isoCode = codeMap[clean] || codeMap[clean.toLowerCase()] || (clean.length === 2 ? clean.toLowerCase() : null);

  if (isoCode) {
    return (
      <span className={customClass || "w-[32px] h-[22px] min-w-[32px] max-w-[32px] rounded-[3px] overflow-hidden border border-stone-300 shadow-xs shrink-0 inline-flex items-center justify-center bg-stone-100"}>
        <img
          src={`https://flagcdn.com/w80/${isoCode}.png`}
          alt={clean}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </span>
    );
  }

  return (
    <span className={customClass || "w-[32px] h-[22px] min-w-[32px] max-w-[32px] rounded-[3px] overflow-hidden border border-stone-300 shadow-xs shrink-0 inline-flex items-center justify-center bg-stone-100 text-base select-none leading-none"}>
      {clean}
    </span>
  );
};

export const MASTER_WINE_MAP = new Map<string, WineCardData>(
  INITIAL_WINE_COLLECTION.map(w => [w.id, w])
);

const WINE_SUBTITLE_DICTIONARY: Record<string, Record<string, string>> = {
  // Types
  'RED WINE': { IT: 'VINO ROSSO', EN: 'RED WINE', TH: 'ไวน์แดง', DE: 'ROTWEIN', MM: 'ဝိုင်နီ', ES: 'VINO TINTO', FR: 'VIN ROUGE', RU: 'КРАСНОЕ ВИНО', ZH: '红葡萄酒' },
  'VINO ROSSO': { IT: 'VINO ROSSO', EN: 'RED WINE', TH: 'ไวน์แดง', DE: 'ROTWEIN', MM: 'ဝိုင်နီ', ES: 'VINO TINTO', FR: 'VIN ROUGE', RU: 'КРАСНОЕ ВИНО', ZH: '红葡萄酒' },
  'WHITE WINE': { IT: 'VINO BIANCO', EN: 'WHITE WINE', TH: 'ไวน์ขาว', DE: 'WEISSWEIN', MM: 'ဝိုင်ဖြူ', ES: 'VINO BLANCO', FR: 'VIN BLANC', RU: 'БЕЛОЕ ВИНО', ZH: '白葡萄酒' },
  'VINO BIANCO': { IT: 'VINO BIANCO', EN: 'WHITE WINE', TH: 'ไวน์ขาว', DE: 'WEISSWEIN', MM: 'ဝိုင်ဖြူ', ES: 'VINO BLANCO', FR: 'VIN BLANC', RU: 'БЕЛОЕ ВИНО', ZH: '白葡萄酒' },
  'ROSÉ WINE': { IT: 'VINO ROSATO', EN: 'ROSÉ WINE', TH: 'ไวน์โรเซ่', DE: 'ROSÉWEIN', MM: 'ရိုဇေး ဝိုင်', ES: 'VINO ROSADO', FR: 'VIN ROSÉ', RU: 'РОЗОВОЕ ВИНО', ZH: '桃红葡萄酒' },
  'ROSE WINE': { IT: 'VINO ROSATO', EN: 'ROSÉ WINE', TH: 'ไวน์โรเซ่', DE: 'ROSÉWEIN', MM: 'ရိုဇေး ဝိုင်', ES: 'VINO ROSADO', FR: 'VIN ROSÉ', RU: 'РОЗОВОЕ ВИНО', ZH: '桃红葡萄酒' },
  'VINO ROSATO': { IT: 'VINO ROSATO', EN: 'ROSÉ WINE', TH: 'ไวน์โรเซ่', DE: 'ROSÉWEIN', MM: 'ရိုဇေး ဝိုင်', ES: 'VINO ROSADO', FR: 'VIN ROSÉ', RU: 'РОЗОВОЕ ВИНО', ZH: '桃红葡萄酒' },
  'SPARKLING WINE': { IT: 'SPUMANTE', EN: 'SPARKLING WINE', TH: 'สปาร์กลิงไวน์', DE: 'SCHAUMWEIN', MM: 'စပါကလင် ဝိုင်', ES: 'VINO ESPUMOSO', FR: 'VIN EFFERVESCENT', RU: 'ИГРИСТОЕ ВИНО', ZH: '起泡酒' },
  'SPUMANTE': { IT: 'SPUMANTE', EN: 'SPARKLING WINE', TH: 'สปาร์กลิงไวน์', DE: 'SCHAUMWEIN', MM: 'စပါကလင် ဝိုင်', ES: 'VINO ESPUMOSO', FR: 'VIN EFFERVESCENT', RU: 'ИГРИСТОЕ ВИНО', ZH: '起泡酒' },
  'PROSECCO': { IT: 'PROSECCO SPUMANTE', EN: 'PROSECCO SPARKLING', TH: 'สปาร์กลิงไวน์ โพรเซกโก', DE: 'PROSECCO SCHAUMWEIN', MM: 'ပရိုဆက်ကို စပါကလင် ဝိုင်', ES: 'PROSECCO ESPUMOSO', FR: 'PROSECCO EFFERVESCENT', RU: 'ИГРИСТОЕ ПРОСЕККО', ZH: '普罗塞克起泡酒' },

  // Provenances
  'ITALY - PUGLIA': { IT: 'ITALIA - PUGLIA', EN: 'ITALY - PUGLIA', TH: 'อิตาลี - แคว้นปูลยา', DE: 'ITALIEN - APULIEN', MM: 'အီတလီ - ပူလီယာ', ES: 'ITALIA - PUGLIA', FR: 'ITALIE - PUGLIA', RU: 'ИТАЛИЯ - ПУГЛИЯ', ZH: '意大利 - 普利亚' },
  'ITALIA - PUGLIA': { IT: 'ITALIA - PUGLIA', EN: 'ITALY - PUGLIA', TH: 'อิตาลี - แคว้นปูลยา', DE: 'ITALIEN - APULIEN', MM: 'အီတလီ - ပူလီယာ', ES: 'ITALIA - PUGLIA', FR: 'ITALIE - PUGLIA', RU: 'ИТАЛИЯ - ПУГЛИЯ', ZH: '意大利 - 普利亚' },
  'ITALY - SICILY': { IT: 'ITALIA - SICILIA', EN: 'ITALY - SICILY', TH: 'อิตาลี - แคว้นซิซิลี', DE: 'ITALIEN - SIZILIEN', MM: 'အီတလီ - ဆီစီလီ', ES: 'ITALIA - SICILIA', FR: 'ITALIE - SICILE', RU: 'ИТАЛИЯ - СИЦИЛИЯ', ZH: '意大利 - 西西里' },
  'ITALIA - SICILIA': { IT: 'ITALIA - SICILIA', EN: 'ITALY - SICILY', TH: 'อิตาลี - แคว้นซิซิลี', DE: 'ITALIEN - SIZILIEN', MM: 'အီတလီ - ဆီစီလီ', ES: 'ITALIA - SICILIA', FR: 'ITALIE - SICILE', RU: 'ИТАЛИЯ - СИЦИЛИЯ', ZH: '意大利 - 西西里' },
  'ITALY - VENETO': { IT: 'ITALIA - VENETO', EN: 'ITALY - VENETO', TH: 'อิตาลี - แคว้นเวเนโต', DE: 'ITALIEN - VENETIEN', MM: 'အီတလီ - ဗီနီတို', ES: 'ITALIA - VÉNETO', FR: 'ITALIE - VÉNÉTIE', RU: 'ИТАЛИЯ - ВЕНЕТО', ZH: '意大利 - 威尼托' },
  'ITALIA - VENETO': { IT: 'ITALIA - VENETO', EN: 'ITALY - VENETO', TH: 'อิตาลี - แคว้นเวเนโต', DE: 'ITALIEN - VENETIEN', MM: 'အီတလီ - ဗီနီတို', ES: 'ITALIA - VÉNETO', FR: 'ITALIE - VÉNÉTIE', RU: 'ИТАЛИЯ - ВЕНЕТО', ZH: '意大利 - 威尼托' },
  'ITALY - TUSCANY': { IT: 'ITALIA - TOSCANA', EN: 'ITALY - TUSCANY', TH: 'อิตาลี - แคว้นทัสคานี', DE: 'ITALIEN - TOSKANA', MM: 'အီတလီ - တိုစကာနီ', ES: 'ITALIA - TOSCANA', FR: 'ITALIE - TOSCANE', RU: 'ИТАЛИЯ - ТОСКАНА', ZH: '意大利 - 托斯卡纳' },
  'ITALIA - TOSCANA': { IT: 'ITALIA - TOSCANA', EN: 'ITALY - TUSCANY', TH: 'อิตาลี - แคว้นทัสคานี', DE: 'ITALIEN - TOSKANA', MM: 'အီတလီ - တိုစကာနီ', ES: 'ITALIA - TOSCANA', FR: 'ITALIE - TOSCANE', RU: 'ИТАЛИЯ - ТОСКАНА', ZH: '意大利 - 托斯卡纳' },
  'ITALY - PIEDMONT': { IT: 'ITALIA - PIEMONTE', EN: 'ITALY - PIEDMONT', TH: 'อิตาลี - แคว้นปีเอมอนเต', DE: 'ITALIEN - PIEMONT', MM: 'အီတလီ - ပီးဒ်မောင့်', ES: 'ITALIA - PIAMONTE', FR: 'ITALIE - PIÉMONT', RU: 'ИТАЛИЯ - ПЬЕМОНТ', ZH: '意大利 - 皮埃蒙特' },
  'ITALIA - PIEMONTE': { IT: 'ITALIA - PIEMONTE', EN: 'ITALY - PIEDMONT', TH: 'อิตาลี - แคว้นปีเอมอนเต', DE: 'ITALIEN - PIEMONT', MM: 'အီတလီ - ပီးဒ်မောင့်', ES: 'ITALIA - PIAMONTE', FR: 'ITALIE - PIÉMONT', RU: 'ИТАЛИЯ - ПЬЕМОНТ', ZH: '意大利 - 皮埃蒙特' },
  'ITALY - ABRUZZO': { IT: 'ITALIA - ABRUZZO', EN: 'ITALY - ABRUZZO', TH: 'อิตาลี - แคว้นอาบรุซโซ', DE: 'ITALIEN - ABRUZZEN', MM: 'အီတလီ - အာဘရူဇို', ES: 'ITALIA - ABRUZZO', FR: 'ITALIE - ABBRUZZES', RU: 'ИТАЛИЯ - АБРУЦЦО', ZH: '意大利 - 阿布鲁佐' },
  'ITALIA - ABRUZZO': { IT: 'ITALIA - ABRUZZO', EN: 'ITALY - ABRUZZO', TH: 'อิตาลี - แคว้นอาบรุซโซ', DE: 'ITALIEN - ABRUZZEN', MM: 'အီတလီ - အာဘရူဇို', ES: 'ITALIA - ABRUZZO', FR: 'ITALIE - ABBRUZZES', RU: 'ИТАЛИЯ - АБРУЦЦО', ZH: '意大利 - 阿布鲁佐' },
  'ITALY - EMILIA-ROMAGNA': { IT: 'ITALIA - EMILIA-ROMAGNA', EN: 'ITALY - EMILIA-ROMAGNA', TH: 'อิตาลี - แคว้นเอมีเลีย-โรมัญญา', DE: 'ITALIEN - EMILIA-ROMAGNA', MM: 'အီတလီ - အမ်မီးလီယာ-ရိုမန်ညာ', ES: 'ITALIA - EMILIA-ROMAÑA', FR: 'ITALIE - ÉMILIE-ROMAGNE', RU: 'ИТАЛИЯ - ЭМИЛИЯ-РОМАНЬЯ', ZH: '意大利 - 艾米利亚-罗马涅' },
  'ITALIA - EMILIA-ROMAGNA': { IT: 'ITALIA - EMILIA-ROMAGNA', EN: 'ITALY - EMILIA-ROMAGNA', TH: 'อิตาลี - แคว้นเอมีเลีย-โรมัญญา', DE: 'ITALIEN - EMILIA-ROMAGNA', MM: 'အီတလီ - အမ်မီးလီယာ-ရိုမန်ညာ', ES: 'ITALIA - EMILIA-ROMAÑA', FR: 'ITALIE - ÉMILIE-ROMAGNE', RU: 'ИТАЛИЯ - ЭМИЛИЯ-РОМАНЬЯ', ZH: '意大利 - 艾米利亚-罗马涅' },
  'ITALY - TRENTINO': { IT: 'ITALIA - TRENTINO-ALTO ADIGE', EN: 'ITALY - TRENTINO-ALTO ADIGE', TH: 'อิตาลี - แคว้นเตรนตีโน-อัลโตอาดีเจ', DE: 'ITALIEN - TRENTINO-SÜDTIROL', MM: 'အီတလီ - ထရန်တီနို-အော်လ်တို အဒီဂျေး', ES: 'ITALIA - TRENTINO-ALTO ADIGIO', FR: 'ITALIE - TRENTIN-HAUT-ADIGE', RU: 'ИТАЛИЯ - ТРЕНТИНО-АЛЬТО-АДИДЖЕ', ZH: '意大利 - 特伦蒂诺-上阿迪杰' },
  'FRANCE': { IT: 'FRANCIA', EN: 'FRANCE', TH: 'ฝรั่งเศส', DE: 'FRANKREICH', MM: 'ပြင်သစ်', ES: 'FRANCIA', FR: 'FRANCE', RU: 'ФРАНЦИЯ', ZH: '法国' },
  'FRANCIA': { IT: 'FRANCIA', EN: 'FRANCE', TH: 'ฝรั่งเศส', DE: 'FRANKREICH', MM: 'ပြင်သစ်', ES: 'FRANCIA', FR: 'FRANCE', RU: 'ФРАНЦИЯ', ZH: '法国' },
  'FRANCE - BORDEAUX': { IT: 'FRANCIA - BORDEAUX', EN: 'FRANCE - BORDEAUX', TH: 'ฝรั่งเศส - บอร์โด', DE: 'FRANKREICH - BORDEAUX', MM: 'ပြင်သစ် - ဘော်ဒိုး', ES: 'FRANCIA - BURDEOS', FR: 'FRANCE - BORDEAUX', RU: 'ФРАНЦИЯ - БОРДО', ZH: '法国 - 波尔多' },
  'FRANCE - RHÔNE VALLEY': { IT: 'FRANCIA - VALLE DEL RODANO', EN: 'FRANCE - RHÔNE VALLEY', TH: 'ฝรั่งเศส - หุบเขาโรน', DE: 'FRANKREICH - RHÔNETAL', MM: 'ပြင်သစ် - ရုန်းတောင်ကြား', ES: 'FRANCIA - VALLE DEL RÓDANO', FR: 'FRANCE - VALLÉE DU RHÔNE', RU: 'ФРАНЦИЯ - ДОЛИНА РОНЫ', ZH: '法国 - 罗纳河谷' },
  'FRANCE - RHONE VALLEY': { IT: 'FRANCIA - VALLE DEL RODANO', EN: 'FRANCE - RHÔNE VALLEY', TH: 'ฝรั่งเศส - หุบเขาโรน', DE: 'FRANKREICH - RHÔNETAL', MM: 'ပြင်သစ် - ရုန်းတောင်ကြား', ES: 'FRANCIA - VALLE DEL RÓDANO', FR: 'FRANCE - VALLÉE DU RHÔNE', RU: 'ФРАНЦИЯ - ДОЛИНА РОНЫ', ZH: '法国 - 罗纳河谷' },
  'CHILE - CENTRAL VALLEY': { IT: 'CILE - CENTRAL VALLEY', EN: 'CHILE - CENTRAL VALLEY', TH: 'ชิลี - เซ็นทรัลแวลลีย์', DE: 'CHILE - CENTRAL VALLEY', MM: 'ချီလီ - အလယ်ပိုင်းတောင်ကြား', ES: 'CHILE - VALLE CENTRAL', FR: 'CHILI - VALLÉE CENTRALE', RU: 'ЧИЛИ - ЦЕНТРАЛЬНАЯ ДОЛИНА', ZH: '智利 - 中央山谷' },
  'AUSTRALIA - SOUTH AUSTRALIA': { IT: 'AUSTRALIA - AUSTRALIA MERIDIONALE', EN: 'AUSTRALIA - SOUTH AUSTRALIA', TH: 'ออสเตรเลีย - เซาท์ออสเตรเลีย', DE: 'AUSTRALIEN - SÜDAUSTRALIEN', MM: 'သြစတြေးလျ - တောင်ပိုင်းသြစတြေးလျ', ES: 'AUSTRALIA - AUSTRALIA MERIDIONAL', FR: 'AUSTRALIE - AUSTRALIE-MÉRIDIONALE', RU: 'АВСТРАЛИЯ - ЮЖНАЯ АВСТРАЛИЯ', ZH: '澳大利亚 - 南澳大利亚' },
};

export const translateWineSubtitleText = (subStr: string, lang: string = 'IT'): string => {
  if (!subStr || typeof subStr !== 'string') return '';
  const lines = subStr.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return subStr;

  const translatedLines = lines.map(line => {
    const upper = line.toUpperCase();
    if (WINE_SUBTITLE_DICTIONARY[upper] && WINE_SUBTITLE_DICTIONARY[upper][lang]) {
      return WINE_SUBTITLE_DICTIONARY[upper][lang];
    }
    // Check partial matches in dictionary
    for (const [key, dict] of Object.entries(WINE_SUBTITLE_DICTIONARY)) {
      if (upper === key && dict[lang]) {
        return dict[lang];
      }
    }
    return line;
  });

  return translatedLines.join('\n');
};

export const formatSubtitle = (subtitleOrItem: any, lang?: string) => {
  if (!subtitleOrItem) return "";

  const curLang = lang || 'IT';
  let subStr = '';

  if (typeof subtitleOrItem === 'string') {
    subStr = translateWineSubtitleText(subtitleOrItem, curLang);
  } else if (typeof subtitleOrItem === 'object') {
    const itm = subtitleOrItem;
    const master = itm.id ? MASTER_WINE_MAP.get(itm.id) : null;

    if (curLang === 'ZH') subStr = itm.subtitleZh || itm.categorySubtitleZh || master?.subtitleZh || master?.categorySubtitleZh || '';
    else if (curLang === 'RU') subStr = itm.subtitleRu || itm.categorySubtitleRu || master?.subtitleRu || master?.categorySubtitleRu || '';
    else if (curLang === 'FR') subStr = itm.subtitleFr || itm.categorySubtitleFr || master?.subtitleFr || master?.categorySubtitleFr || '';
    else if (curLang === 'ES') subStr = itm.subtitleEs || itm.categorySubtitleEs || master?.subtitleEs || master?.categorySubtitleEs || '';
    else if (curLang === 'MM') subStr = itm.subtitleMm || itm.categorySubtitleMm || master?.subtitleMm || master?.categorySubtitleMm || '';
    else if (curLang === 'TH') subStr = itm.subtitleTh || itm.categorySubtitleTh || master?.subtitleTh || master?.categorySubtitleTh || '';
    else if (curLang === 'DE') subStr = itm.subtitleDe || itm.categorySubtitleDe || master?.subtitleDe || master?.categorySubtitleDe || '';
    else if (curLang === 'IT') subStr = itm.subtitleIt || itm.categorySubtitleIt || master?.subtitleIt || master?.categorySubtitleIt || '';
    else subStr = itm.subtitleEn || itm.categorySubtitleEn || master?.subtitleEn || itm.categorySubtitle || itm.subtitle || '';

    if (!subStr) {
      const fallback = itm.categorySubtitle || itm.subtitle || master?.categorySubtitle || '';
      subStr = translateWineSubtitleText(fallback, curLang);
    }
  }

  if (!subStr || typeof subStr !== 'string') return "";

  const clean = subStr.includes('\n') ? subStr : subStr.replace(' - ', '\n').replace(' — ', '\n');
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
  const master = wine.id ? MASTER_WINE_MAP.get(wine.id) : null;
  if (lang === 'ZH') return wine.titleZh || wine.nameZh || master?.titleZh || wine.title || wine.name || '';
  if (lang === 'RU') return wine.titleRu || wine.nameRu || master?.titleRu || wine.title || wine.name || '';
  if (lang === 'FR') return wine.titleFr || wine.nameFr || master?.titleFr || wine.title || wine.name || '';
  if (lang === 'ES') return wine.titleEs || wine.nameEs || master?.titleEs || wine.title || wine.name || '';
  if (lang === 'MM') return wine.titleMm || wine.nameMm || master?.titleMm || wine.title || wine.name || '';
  if (lang === 'TH') return wine.titleTh || wine.nameTh || master?.titleTh || wine.title || wine.name || '';
  if (lang === 'DE') return wine.titleDe || wine.nameDe || master?.titleDe || wine.title || wine.name || '';
  if (lang === 'EN') return wine.titleEn || wine.nameEn || master?.titleEn || wine.title || wine.name || '';
  if (lang === 'IT') return wine.titleIt || wine.nameIt || master?.titleIt || wine.title || wine.name || '';
  return wine.title || wine.name || '';
};

export const getWineTranslatedSubtitle = (wine: WineCardData | any | null | undefined, lang: string = 'IT'): string => {
  if (!wine) return '';
  const master = wine.id ? MASTER_WINE_MAP.get(wine.id) : null;
  let res = '';
  if (lang === 'ZH') res = wine.subtitleZh || wine.categorySubtitleZh || master?.subtitleZh || master?.categorySubtitleZh || '';
  else if (lang === 'RU') res = wine.subtitleRu || wine.categorySubtitleRu || master?.subtitleRu || master?.categorySubtitleRu || '';
  else if (lang === 'FR') res = wine.subtitleFr || wine.categorySubtitleFr || master?.subtitleFr || master?.categorySubtitleFr || '';
  else if (lang === 'ES') res = wine.subtitleEs || wine.categorySubtitleEs || master?.subtitleEs || master?.categorySubtitleEs || '';
  else if (lang === 'MM') res = wine.subtitleMm || wine.categorySubtitleMm || master?.subtitleMm || master?.categorySubtitleMm || '';
  else if (lang === 'TH') res = wine.subtitleTh || wine.categorySubtitleTh || master?.subtitleTh || master?.categorySubtitleTh || '';
  else if (lang === 'DE') res = wine.subtitleDe || wine.categorySubtitleDe || master?.subtitleDe || master?.categorySubtitleDe || '';
  else if (lang === 'EN') res = wine.subtitleEn || wine.categorySubtitleEn || master?.subtitleEn || master?.categorySubtitleEn || '';
  else if (lang === 'IT') res = wine.subtitleIt || wine.categorySubtitleIt || master?.subtitleIt || master?.categorySubtitleIt || '';
  
  if (!res) {
    const rawSub = wine.categorySubtitle || wine.subtitle || master?.categorySubtitle || '';
    res = translateWineSubtitleText(rawSub, lang);
  }
  return res || wine.categorySubtitle || '';
};

export const getWineTranslatedDesc = (wine: WineCardData | any | null | undefined, lang: string = 'IT'): string => {
  if (!wine) return '';
  const master = wine.id ? MASTER_WINE_MAP.get(wine.id) : null;
  if (lang === 'ZH') return wine.descriptionZh || wine.description_zh || master?.descriptionZh || wine.description || '';
  if (lang === 'RU') return wine.descriptionRu || wine.description_ru || master?.descriptionRu || wine.description || '';
  if (lang === 'FR') return wine.descriptionFr || wine.description_fr || master?.descriptionFr || wine.description || '';
  if (lang === 'ES') return wine.descriptionEs || wine.description_es || master?.descriptionEs || wine.description || '';
  if (lang === 'MM') return wine.descriptionMm || wine.description_mm || master?.descriptionMm || wine.description || '';
  if (lang === 'TH') return wine.descriptionTh || wine.description_th || master?.descriptionTh || wine.description || '';
  if (lang === 'DE') return wine.descriptionDe || wine.description_de || master?.descriptionDe || wine.description || '';
  if (lang === 'EN') return wine.descriptionEn || master?.descriptionEn || wine.description || '';
  if (lang === 'IT') return wine.descriptionIt || wine.description_it || master?.descriptionIt || wine.description || '';
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