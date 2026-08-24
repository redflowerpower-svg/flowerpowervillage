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
    id: 'wine-primitivo-pepa',
    title: 'PRIMITIVO PUGLIA\nIGT PEPA',
    categorySubtitle: 'RED WINE ITALY',
    categoryType: 'red',
    flag: '🇮🇹',
    description: 'Vino rosso pugliese intenso e avvolgente con profumi di more mature, prugne e una leggera speziatura. Tannini morbidi e vellutati, perfetto con carni alla griglia, arrosti e formaggi stagionati.',
    alcohol: '14%',
    price: '1290 ฿',
    bannerColor: '#8b0000',
    bottleImage: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/01-italian-wines.webp',
    showLogoBadge: true,
    bottleScale: 100,
    bottleScaleX: 100,
    bottleOffsetX: 0,
    bottleOffsetY: 0,
    isAvailable: true,
  },
  {
    id: 'wine-nero-davola',
    title: 'NERO D\'AVOLA\nTERRE SICILIANE\nCanoro',
    categorySubtitle: 'RED WINE ITALY\nSICILY',
    categoryType: 'red',
    flag: '🇮🇹',
    description: 'Rosso siciliano autentico dal colore rubino profondo, ricco di aromi di ciliegia matura, frutti di bosco e spezie mediterranee. Caldo, corposo e armonioso al palato.',
    alcohol: '13,5%',
    price: '1190 ฿',
    bannerColor: '#8b0000',
    bottleImage: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/01-italian-wines.webp',
    showLogoBadge: true,
    bottleScale: 100,
    bottleScaleX: 100,
    bottleOffsetX: 0,
    bottleOffsetY: 0,
    isAvailable: true,
  },
  {
    id: 'wine-poggio-alto-rosso',
    title: 'POGGIO ALTO\nVINO ROSSO\nD\'Italia',
    categorySubtitle: 'RED WINE ITALY',
    categoryType: 'red',
    flag: '🇮🇹',
    description: 'Rosso rubino brillante con riflessi violacei. Bouquet invitante di frutti rossi, ciliegie e spezie delicate. Finale armonico e persistente, ottimo con pizza e pasta.',
    alcohol: '13%',
    price: '1190 ฿',
    bannerColor: '#8b0000',
    bottleImage: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/01-italian-wines.webp',
    showLogoBadge: true,
    bottleScale: 100,
    bottleScaleX: 100,
    bottleOffsetX: 0,
    bottleOffsetY: 0,
    isAvailable: true,
  },
  {
    id: 'wine-graziosa-rose',
    title: 'SPUMANTE ROSÉ\nEXTRA DRY\nGraziosa Canoro',
    categorySubtitle: 'SPARKLING ROSÉ ITALY\nVENETO',
    categoryType: 'sparkling',
    flag: '🇮🇹',
    description: 'Spumante rosato fresco, brioso ed elegante con profumi di fragoline di bosco, ribes e delicati petali di rosa. Bollicina fine e vivace, perfetto per l\'aperitivo o per brindare al tramonto.',
    alcohol: '11,5%',
    price: '950 ฿',
    bannerColor: '#be185d',
    bottleImage: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/01-italian-wines.webp',
    showLogoBadge: true,
    bottleScale: 100,
    bottleScaleX: 100,
    bottleOffsetX: 0,
    bottleOffsetY: 0,
    isAvailable: true,
  },
  {
    id: 'wine-pinot-grigio',
    title: 'PINOT GRIGIO\nDELLE VENEZIE\nDoc',
    categorySubtitle: 'WHITE WINE ITALY',
    categoryType: 'white',
    flag: '🇮🇹',
    description: 'Elegante bianco dal colore giallo paglierino con profumi floreali, mela verde croccante e sentori agrumati. Fresco, sapido e minerale, eccezionale con frutti di mare e insalate.',
    alcohol: '12,5%',
    price: '1190 ฿',
    bannerColor: '#b45309',
    bottleImage: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/01-italian-wines.webp',
    showLogoBadge: true,
    bottleScale: 100,
    bottleScaleX: 100,
    bottleOffsetX: 0,
    bottleOffsetY: 0,
    isAvailable: true,
  },
  {
    id: 'wine-birchgrove-red',
    title: 'BIRCHGROVE BIRD\'S BLOCK\nCABERNET SHIRAZ\nSouth Australia',
    categorySubtitle: 'RED WINE AUSTRALIA\nSOUTH EASTERN',
    categoryType: 'red',
    flag: '🇦🇺',
    description: 'Blend rosso australiano avvolgente con ricche note di prugne scure, ribes nero e un tocco di rovere tostato. Tannini morbidi e finale fruttato persistente.',
    alcohol: '13,5%',
    price: '790 ฿',
    bannerColor: '#8b0000',
    bottleImage: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/01-italian-wines.webp',
    showLogoBadge: true,
    bottleScale: 100,
    bottleScaleX: 100,
    bottleOffsetX: 0,
    bottleOffsetY: 0,
    isAvailable: true,
  },
  {
    id: 'wine-birchgrove-white',
    title: 'BIRCHGROVE BIRD\'S BLOCK\nCHARDONNAY\nSouth Australia',
    categorySubtitle: 'WHITE WINE AUSTRALIA\nSOUTH EASTERN',
    categoryType: 'white',
    flag: '🇦🇺',
    description: 'Chardonnay australiano fresco e solare con profumi di frutta tropicale, melone bianco e agrumi. Pulito, rinfrescante e piacevolmente equilibrato.',
    alcohol: '12,5%',
    price: '690 ฿',
    bannerColor: '#b45309',
    bottleImage: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/01-italian-wines.webp',
    showLogoBadge: true,
    bottleScale: 100,
    bottleScaleX: 100,
    bottleOffsetX: 0,
    bottleOffsetY: 0,
    isAvailable: true,
  },
  {
    id: 'wine-vina-toldos-white',
    title: 'VIÑA TOLDOS\nSAUVIGNON BLANC\nCentral Valley',
    categorySubtitle: 'WHITE WINE CHILE\nCENTRAL VALLEY',
    categoryType: 'white',
    flag: '🇨🇱',
    description: 'Bianco cileno vivace e profumato con aromi di mela verde, lime e fresche note erbacee. Acidità croccante e finale dissetante, ideale con antipasti e piatti estivi.',
    alcohol: '12,5%',
    price: '790 ฿',
    bannerColor: '#b45309',
    bottleImage: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/01-italian-wines.webp',
    showLogoBadge: true,
    bottleScale: 100,
    bottleScaleX: 100,
    bottleOffsetX: 0,
    bottleOffsetY: 0,
    isAvailable: true,
  },
  {
    id: 'wine-vina-toldos-cabernet',
    title: 'VIÑA TOLDOS\nCABERNET SAUVIGNON\nCentral Valley',
    categorySubtitle: 'RED WINE CHILE\nCENTRAL VALLEY',
    categoryType: 'red',
    flag: '🇨🇱',
    description: 'Rosso cileno dal colore rubino profondo con sentori di ribes nero, legno di cedro e cacao. Corpo pieno, tannini maturi e retrogusto fruttato lungo.',
    alcohol: '13,5%',
    price: '690 ฿',
    bannerColor: '#8b0000',
    bottleImage: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/01-italian-wines.webp',
    showLogoBadge: true,
    bottleScale: 100,
    bottleScaleX: 100,
    bottleOffsetX: 0,
    bottleOffsetY: 0,
    isAvailable: true,
  },
  {
    id: 'wine-prosecco-docg',
    title: 'PROSECCO SUPERIORE\nDOCG\nMillesimato',
    categorySubtitle: 'SPARKLING WINE ITALY',
    categoryType: 'sparkling',
    flag: '🇮🇹',
    description: 'Prestigioso Prosecco Superiore DOCG con perlage finissimo, note di pesca bianca, fiori di gelsomino e pera williams. Fresco, raffinato e festoso, perfetto per antipasti o brindisi speciali.',
    alcohol: '11,5%',
    price: '1350 ฿',
    bannerColor: '#0f766e',
    bottleImage: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/01-italian-wines.webp',
    showLogoBadge: true,
    bottleScale: 100,
    bottleScaleX: 100,
    bottleOffsetX: 0,
    bottleOffsetY: 0,
    isAvailable: true,
  },
  {
    id: 'wine-rose-cotes-provence',
    title: 'ROSÉ DE FRANCE\nCÔTES DE PROVENCE\nFrance',
    categorySubtitle: 'ROSÈ WINE FRANCE',
    categoryType: 'rose',
    flag: '🇫🇷',
    description: 'Iconico rosé provenzale dal colore rosa tenue con profumi di piccoli frutti rossi, melograno e fiori bianchi. Secco, minerale e straordinariamente rinfrescante per le serate tropicali.',
    alcohol: '12,5%',
    price: '990 ฿',
    bannerColor: '#be185d',
    bottleImage: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/14-Wines/01-italian-wines.webp',
    showLogoBadge: true,
    bottleScale: 100,
    bottleScaleX: 100,
    bottleOffsetX: 0,
    bottleOffsetY: 0,
    isAvailable: true,
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
