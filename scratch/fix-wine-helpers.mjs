import fs from 'fs';
import path from 'path';

const wineDataPath = path.resolve('src/pizza/data/wineData.tsx');
const menuGridPath = path.resolve('src/pizza/components/MenuGrid.tsx');

let wineDataContent = fs.readFileSync(wineDataPath, 'utf8');

const updatedHelpers = `export const renderCountryFlag = (flagOrItem: any, customClass?: string) => {
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
          src={\`https://flagcdn.com/w80/\${isoCode}.png\`}
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

export const formatSubtitle = (subtitleOrItem: any, lang?: string) => {
  if (!subtitleOrItem) return "";

  let subStr = '';
  if (typeof subtitleOrItem === 'string') {
    subStr = subtitleOrItem;
  } else if (typeof subtitleOrItem === 'object') {
    const itm = subtitleOrItem;
    const curLang = lang || 'IT';
    if (curLang === 'ZH' && (itm.subtitleZh || itm.categorySubtitleZh)) subStr = itm.subtitleZh || itm.categorySubtitleZh;
    else if (curLang === 'RU' && (itm.subtitleRu || itm.categorySubtitleRu)) subStr = itm.subtitleRu || itm.categorySubtitleRu;
    else if (curLang === 'FR' && (itm.subtitleFr || itm.categorySubtitleFr)) subStr = itm.subtitleFr || itm.categorySubtitleFr;
    else if (curLang === 'ES' && (itm.subtitleEs || itm.categorySubtitleEs)) subStr = itm.subtitleEs || itm.categorySubtitleEs;
    else if (curLang === 'MM' && (itm.subtitleMm || itm.categorySubtitleMm)) subStr = itm.subtitleMm || itm.categorySubtitleMm;
    else if (curLang === 'TH' && (itm.subtitleTh || itm.categorySubtitleTh)) subStr = itm.subtitleTh || itm.categorySubtitleTh;
    else if (curLang === 'DE' && (itm.subtitleDe || itm.categorySubtitleDe)) subStr = itm.subtitleDe || itm.categorySubtitleDe;
    else if (curLang === 'IT' && (itm.subtitleIt || itm.categorySubtitleIt)) subStr = itm.subtitleIt || itm.categorySubtitleIt;
    else subStr = itm.categorySubtitle || itm.subtitle || itm.subtitleEn || '';
  }

  if (!subStr || typeof subStr !== 'string') return "";

  const clean = subStr.includes('\\n') ? subStr : subStr.replace(' - ', '\\n').replace(' — ', '\\n');
  const lines = clean.split('\\n');
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
  const numStr = rawStr.replace(/[^\\d.,]/g, '').trim();
  if (!numStr) return <span>{rawStr}</span>;
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className={\`text-base sm:text-lg font-black tracking-tight leading-none \${colorClass}\`} style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
        {numStr}
      </span>
      <span 
        className={\`text-xs sm:text-sm font-black tracking-tight select-none \${colorClass}\`}
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
  const numStr = rawStr.replace(/[^\\d.,]/g, '').trim();
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
  if (lang === 'ZH' && (wine.titleZh || wine.nameZh)) return wine.titleZh || wine.nameZh;
  if (lang === 'RU' && (wine.titleRu || wine.nameRu)) return wine.titleRu || wine.nameRu;
  if (lang === 'FR' && (wine.titleFr || wine.nameFr)) return wine.titleFr || wine.nameFr;
  if (lang === 'ES' && (wine.titleEs || wine.nameEs)) return wine.titleEs || wine.nameEs;
  if (lang === 'MM' && (wine.titleMm || wine.nameMm)) return wine.titleMm || wine.nameMm;
  if (lang === 'TH' && (wine.titleTh || wine.nameTh)) return wine.titleTh || wine.nameTh;
  if (lang === 'DE' && (wine.titleDe || wine.nameDe)) return wine.titleDe || wine.nameDe;
  if (lang === 'EN' && (wine.titleEn || wine.nameEn)) return wine.titleEn || wine.nameEn;
  if (lang === 'IT' && (wine.titleIt || wine.nameIt)) return wine.titleIt || wine.nameIt;
  return wine.title || wine.name || '';
};

export const getWineTranslatedSubtitle = (wine: WineCardData | any | null | undefined, lang: string = 'IT'): string => {
  if (!wine) return '';
  if (lang === 'ZH' && (wine.subtitleZh || wine.categorySubtitleZh)) return wine.subtitleZh || wine.categorySubtitleZh;
  if (lang === 'RU' && (wine.subtitleRu || wine.categorySubtitleRu)) return wine.subtitleRu || wine.categorySubtitleRu;
  if (lang === 'FR' && (wine.subtitleFr || wine.categorySubtitleFr)) return wine.subtitleFr || wine.categorySubtitleFr;
  if (lang === 'ES' && (wine.subtitleEs || wine.categorySubtitleEs)) return wine.subtitleEs || wine.categorySubtitleEs;
  if (lang === 'MM' && (wine.subtitleMm || wine.categorySubtitleMm)) return wine.subtitleMm || wine.categorySubtitleMm;
  if (lang === 'TH' && (wine.subtitleTh || wine.categorySubtitleTh)) return wine.subtitleTh || wine.categorySubtitleTh;
  if (lang === 'DE' && (wine.subtitleDe || wine.categorySubtitleDe)) return wine.subtitleDe || wine.categorySubtitleDe;
  if (lang === 'EN' && (wine.subtitleEn || wine.categorySubtitleEn)) return wine.subtitleEn || wine.categorySubtitleEn;
  if (lang === 'IT' && (wine.subtitleIt || wine.categorySubtitleIt)) return wine.subtitleIt || wine.categorySubtitleIt;
  return wine.categorySubtitle || '';
};

export const getWineTranslatedDesc = (wine: WineCardData | any | null | undefined, lang: string = 'IT'): string => {
  if (!wine) return '';
  if (lang === 'ZH' && (wine.descriptionZh || wine.description_zh)) return wine.descriptionZh || wine.description_zh;
  if (lang === 'RU' && (wine.descriptionRu || wine.description_ru)) return wine.descriptionRu || wine.description_ru;
  if (lang === 'FR' && (wine.descriptionFr || wine.description_fr)) return wine.descriptionFr || wine.description_fr;
  if (lang === 'ES' && (wine.descriptionEs || wine.description_es)) return wine.descriptionEs || wine.description_es;
  if (lang === 'MM' && (wine.descriptionMm || wine.description_mm)) return wine.descriptionMm || wine.description_mm;
  if (lang === 'TH' && (wine.descriptionTh || wine.description_th)) return wine.descriptionTh || wine.description_th;
  if (lang === 'DE' && (wine.descriptionDe || wine.description_de)) return wine.descriptionDe || wine.description_de;
  if (lang === 'EN' && (wine.descriptionEn || wine.description)) return wine.descriptionEn || wine.description;
  if (lang === 'IT' && (wine.descriptionIt || wine.description_it)) return wine.descriptionIt || wine.description_it;
  return wine.description || '';
};`;

// Replace from `export const renderCountryFlag =` down to `export const toTitleCase =`
const startIdx = wineDataContent.indexOf('export const renderCountryFlag =');
const endIdx = wineDataContent.indexOf('export const toTitleCase =');

if (startIdx !== -1 && endIdx !== -1) {
  wineDataContent = wineDataContent.substring(0, startIdx) + updatedHelpers + '\n\n' + wineDataContent.substring(endIdx);
  fs.writeFileSync(wineDataPath, wineDataContent, 'utf8');
  console.log('Successfully updated wineData.tsx helpers!');
} else {
  console.error('Could not find slice in wineData.tsx');
}

// In MenuGrid.tsx, pass lang to formatSubtitle: formatSubtitle(item, lang)
let menuGridContent = fs.readFileSync(menuGridPath, 'utf8');
menuGridContent = menuGridContent.replace(/formatSubtitle\(item\)/g, 'formatSubtitle(item, lang)');
fs.writeFileSync(menuGridPath, menuGridContent, 'utf8');
console.log('Successfully updated MenuGrid.tsx formatSubtitle call!');
