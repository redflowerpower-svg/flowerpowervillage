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
  { flag: '🇪🇸', code: 'ES', label: 'Spagna', names: { IT: 'SPAGNA', EN: 'SPAIN', TH: 'สเปน', DE: 'SPANIEN' } },
  { flag: '🇿🇦', code: 'ZA', label: 'Sudafrica', names: { IT: 'SUDAFRICA', EN: 'SOUTH AFRICA', TH: 'แอฟริกาใต้', DE: 'SÜDAFRIKA' } },
  { flag: '🇨🇱', code: 'CL', label: 'Cile', names: { IT: 'CILE', EN: 'CHILE', TH: 'ชิลี', DE: 'CHILE' } },
  { flag: '🇲🇽', code: 'MX', label: 'Messico', names: { IT: 'MESSICO', EN: 'MEXICO', TH: 'เม็กซิโก', DE: 'MEXIKO' } },
  { flag: '🇩🇪', code: 'DE', label: 'Germania', names: { IT: 'GERMANIA', EN: 'GERMANY', TH: 'เยอรมนี', DE: 'DEUTSCHLAND' } },
  { flag: '🇦🇷', code: 'AR', label: 'Argentina', names: { IT: 'ARGENTINA', EN: 'ARGENTINA', TH: 'อาร์เจนตินา', DE: 'ARGENTINIEN' } },
  { flag: '🇳🇿', code: 'NZ', label: 'Nuova Zelanda', names: { IT: 'NUOVA ZELANDA', EN: 'NEW ZEALAND', TH: 'นิวซีแลนด์', DE: 'NEUSEELAND' } },
  { flag: '🇵🇹', code: 'PT', label: 'Portogallo', names: { IT: 'PORTOGALLO', EN: 'PORTUGAL', TH: 'โปรตุเกส', DE: 'PORTUGAL' } },
  { flag: '🇺🇸', code: 'US', label: 'Stati Uniti', names: { IT: 'STATI UNITI', EN: 'UNITED STATES', TH: 'สหรัฐอเมริกา', DE: 'USA' } },
  { flag: '🇬🇷', code: 'GR', label: 'Grecia', names: { IT: 'GRECIA', EN: 'GREECE', TH: 'กรีซ', DE: 'GRIECHENLAND' } },
  { flag: '🇦🇹', code: 'AT', label: 'Austria', names: { IT: 'AUSTRIA', EN: 'AUSTRIA', TH: 'ออสเตรีย', DE: 'ÖSTERREICH' } },
  { flag: '🇨🇭', code: 'CH', label: 'Svizzera', names: { IT: 'SVIZZERA', EN: 'SWITZERLAND', TH: 'สวิตเซอร์แลนด์', DE: 'SCHWEIZ' } },
  { flag: '🇬🇧', code: 'GB', label: 'Regno Unito', names: { IT: 'REGNO UNITO', EN: 'UNITED KINGDOM', TH: 'สหราชอาณาจักร', DE: 'VEREINIGTES KÖNIGREICH' } },
  { flag: '🇭🇺', code: 'HU', label: 'Ungheria', names: { IT: 'UNGHERIA', EN: 'HUNGARY', TH: 'ฮังการี', DE: 'UNGARN' } },
  { flag: '🇬🇪', code: 'GE', label: 'Georgia', names: { IT: 'GEORGIA', EN: 'GEORGIA', TH: 'จอร์เจีย', DE: 'GEORGIEN' } },
  { flag: '🇹🇷', code: 'TR', label: 'Turchia', names: { IT: 'TURCHIA', EN: 'TURKEY', TH: 'ตุรกี', DE: 'TÜRKEI' } },
  { flag: '🇱🇧', code: 'LB', label: 'Libano', names: { IT: 'LIBANO', EN: 'LEBANON', TH: 'เลบานอน', DE: 'LIBANON' } },
];

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
    label: 'Bollicine', 
    names: { IT: 'BOLLICINE', EN: 'SPARKLING WINE', TH: 'สปาร์กลิงไวน์', DE: 'SCHAUMWEIN' },
    defaultColor: '#eab308'
  }
];

export const resolveWineCategoryType = (wine: { categoryType?: string; categorySubtitle?: string; title?: string; subtitleIt?: string; titleIt?: string; name?: string }): 'red' | 'white' | 'rose' | 'sparkling' => {
  const text = `${wine.title || ''} ${wine.titleIt || ''} ${wine.name || ''} ${wine.categorySubtitle || ''} ${wine.subtitleIt || ''}`.toLowerCase();

  if (text.includes('prosecco') || text.includes('spumant') || text.includes('bollicin') || text.includes('champagne') || text.includes('sparkling') || text.includes('cava') || text.includes('brut') || text.includes('millesimato')) {
    return 'sparkling';
  }
  if (text.includes('rosé') || text.includes('rose') || text.includes('rosato') || text.includes('côtes de provence')) {
    return 'rose';
  }
  if (text.includes('bianco') || text.includes('white') || text.includes('chardonnay') || text.includes('sauvignon') || text.includes('pinot grigio') || text.includes('vermentino') || text.includes('trebbiano') || text.includes('soave') || text.includes('gavi') || text.includes('cortese')) {
    return 'white';
  }
  if (wine.categoryType && ['red', 'white', 'rose', 'sparkling'].includes(wine.categoryType)) {
    return wine.categoryType as any;
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

export const renderCountryFlag = (flagOrCountryCode: string) => {
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
      <img
        src={`https://flagcdn.com/w40/${isoCode}.png`}
        alt={flagOrCountryCode}
        className="w-5 h-3.5 object-cover rounded-[2px] shadow-xs border border-stone-200"
        loading="lazy"
      />
    );
  }

  return <span className="text-sm select-none leading-none">{flagOrCountryCode}</span>;
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

export const renderWinePrice = (rawPrice?: string | number) => {
  if (!rawPrice) return <span className="text-stone-300">—</span>;
  const rawStr = String(rawPrice).trim();
  const numStr = rawStr.replace(/[^\d.,]/g, '').trim();
  if (!numStr) return <span>{rawStr}</span>;
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="text-base sm:text-lg font-black text-stone-900 tracking-tight leading-none" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
        {numStr}
      </span>
      <span 
        className="text-xs sm:text-sm font-black text-stone-500 tracking-tight select-none"
        style={{ fontFamily: "'Prompt', 'Kanit', 'IBM Plex Sans Thai', system-ui, sans-serif" }}
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
