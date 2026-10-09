/**
 * Sommelier Multilingual Translation Engine for Wine Cards
 * Translates accurately across all 9 supported languages:
 * IT (Italian), EN (English), TH (Thai), MM (Burmese), DE (German),
 * ES (Spanish), FR (French), RU (Russian), ZH (Chinese).
 * Any language can act as the "Mother / Source" language.
 */

export type WineLang = 'IT' | 'EN' | 'TH' | 'MM' | 'DE' | 'ES' | 'FR' | 'RU' | 'ZH';

// ── 1. DICTIONARY OF WINE TYPES ───────────────────────────────────────────
const WINE_TYPE_MAP: Record<string, Record<WineLang, string>> = {
  'VINO ROSSO': { IT: 'VINO ROSSO', EN: 'RED WINE', TH: 'ไวน์แดง', MM: 'ဝိုင်နီ', DE: 'ROTWEIN', ES: 'VINO TINTO', FR: 'VIN ROUGE', RU: 'КРАСНОЕ ВИНО', ZH: '红葡萄酒' },
  'RED WINE': { IT: 'VINO ROSSO', EN: 'RED WINE', TH: 'ไวน์แดง', MM: 'ဝိုင်နီ', DE: 'ROTWEIN', ES: 'VINO TINTO', FR: 'VIN ROUGE', RU: 'КРАСНОЕ ВИНО', ZH: '红葡萄酒' },
  'ROTWEIN': { IT: 'VINO ROSSO', EN: 'RED WINE', TH: 'ไวน์แดง', MM: 'ဝိုင်နီ', DE: 'ROTWEIN', ES: 'VINO TINTO', FR: 'VIN ROUGE', RU: 'КРАСНОЕ ВИНО', ZH: '红葡萄酒' },
  'ไวน์แดง': { IT: 'VINO ROSSO', EN: 'RED WINE', TH: 'ไวน์แดง', MM: 'ဝိုင်နီ', DE: 'ROTWEIN', ES: 'VINO TINTO', FR: 'VIN ROUGE', RU: 'КРАСНОЕ ВИНО', ZH: '红葡萄酒' },
  'ဝိုင်နီ': { IT: 'VINO ROSSO', EN: 'RED WINE', TH: 'ไวน์แดง', MM: 'ဝိုင်နီ', DE: 'ROTWEIN', ES: 'VINO TINTO', FR: 'VIN ROUGE', RU: 'КРАСНОЕ ВИНО', ZH: '红葡萄酒' },
  'VINO TINTO': { IT: 'VINO ROSSO', EN: 'RED WINE', TH: 'ไวน์แดง', MM: 'ဝိုင်နီ', DE: 'ROTWEIN', ES: 'VINO TINTO', FR: 'VIN ROUGE', RU: 'КРАСНОЕ ВИНО', ZH: '红葡萄酒' },
  'VIN ROUGE': { IT: 'VINO ROSSO', EN: 'RED WINE', TH: 'ไวน์แดง', MM: 'ဝိုင်နီ', DE: 'ROTWEIN', ES: 'VINO TINTO', FR: 'VIN ROUGE', RU: 'КРАСНОЕ ВИНО', ZH: '红葡萄酒' },
  'КРАСНОЕ ВИНО': { IT: 'VINO ROSSO', EN: 'RED WINE', TH: 'ไวน์แดง', MM: 'ဝိုင်နီ', DE: 'ROTWEIN', ES: 'VINO TINTO', FR: 'VIN ROUGE', RU: 'КРАСНОЕ ВИНО', ZH: '红葡萄酒' },
  '红葡萄酒': { IT: 'VINO ROSSO', EN: 'RED WINE', TH: 'ไวน์แดง', MM: 'ဝိုင်နီ', DE: 'ROTWEIN', ES: 'VINO TINTO', FR: 'VIN ROUGE', RU: 'КРАСНОЕ ВИНО', ZH: '红葡萄酒' },

  'VINO BIANCO': { IT: 'VINO BIANCO', EN: 'WHITE WINE', TH: 'ไวน์ขาว', MM: 'ဝိုင်ဖြူ', DE: 'WEISSWEIN', ES: 'VINO BLANCO', FR: 'VIN BLANC', RU: 'БЕЛОЕ ВИНО', ZH: '白葡萄酒' },
  'WHITE WINE': { IT: 'VINO BIANCO', EN: 'WHITE WINE', TH: 'ไวน์ขาว', MM: 'ဝိုင်ဖြူ', DE: 'WEISSWEIN', ES: 'VINO BLANCO', FR: 'VIN BLANC', RU: 'БЕЛОЕ ВИНО', ZH: '白葡萄酒' },
  'WEISSWEIN': { IT: 'VINO BIANCO', EN: 'WHITE WINE', TH: 'ไวน์ขาว', MM: 'ဝိုင်ဖြူ', DE: 'WEISSWEIN', ES: 'VINO BLANCO', FR: 'VIN BLANC', RU: 'БЕЛОЕ ВИНО', ZH: '白葡萄酒' },
  'WEIßWEIN': { IT: 'VINO BIANCO', EN: 'WHITE WINE', TH: 'ไวน์ขาว', MM: 'ဝိုင်ဖြူ', DE: 'WEISSWEIN', ES: 'VINO BLANCO', FR: 'VIN BLANC', RU: 'БЕЛОЕ ВИНО', ZH: '白葡萄酒' },
  'ไวน์ขาว': { IT: 'VINO BIANCO', EN: 'WHITE WINE', TH: 'ไวน์ขาว', MM: 'ဝိုင်ဖြူ', DE: 'WEISSWEIN', ES: 'VINO BLANCO', FR: 'VIN BLANC', RU: 'БЕЛОЕ ВИНО', ZH: '白葡萄酒' },
  'ဝိုင်ဖြူ': { IT: 'VINO BIANCO', EN: 'WHITE WINE', TH: 'ไวน์ขาว', MM: 'ဝိုင်ဖြူ', DE: 'WEISSWEIN', ES: 'VINO BLANCO', FR: 'VIN BLANC', RU: 'БЕЛОЕ ВИНО', ZH: '白葡萄酒' },
  'VINO BLANCO': { IT: 'VINO BIANCO', EN: 'WHITE WINE', TH: 'ไวน์ขาว', MM: 'ဝိုင်ဖြူ', DE: 'WEISSWEIN', ES: 'VINO BLANCO', FR: 'VIN BLANC', RU: 'БЕЛОЕ ВИНО', ZH: '白葡萄酒' },
  'VIN BLANC': { IT: 'VINO BIANCO', EN: 'WHITE WINE', TH: 'ไวน์ขาว', MM: 'ဝိုင်ဖြူ', DE: 'WEISSWEIN', ES: 'VINO BLANCO', FR: 'VIN BLANC', RU: 'БЕЛОЕ ВИНО', ZH: '白葡萄酒' },
  'БЕЛОЕ ВИНО': { IT: 'VINO BIANCO', EN: 'WHITE WINE', TH: 'ไวน์ขาว', MM: 'ဝိုင်ဖြူ', DE: 'WEISSWEIN', ES: 'VINO BLANCO', FR: 'VIN BLANC', RU: 'БЕЛОЕ ВИНО', ZH: '白葡萄酒' },
  '白葡萄酒': { IT: 'VINO BIANCO', EN: 'WHITE WINE', TH: 'ไวน์ขาว', MM: 'ဝိုင်ဖြူ', DE: 'WEISSWEIN', ES: 'VINO BLANCO', FR: 'VIN BLANC', RU: 'БЕЛОЕ ВИНО', ZH: '白葡萄酒' },

  'SPUMANTE ROSATO': { IT: 'SPUMANTE ROSATO', EN: 'SPARKLING ROSÉ', TH: 'สปาร์กลิงโรเซ่', MM: 'စပါကလင် ရိုဇေး', DE: 'SCHAUMWEIN ROSÉ', ES: 'ESPUMOSO ROSADO', FR: 'EFFERVESCENT ROSÉ', RU: 'РОЗОВОЕ ИГРИСТОЕ', ZH: '桃红起泡酒' },
  'SPARKLING ROSÉ': { IT: 'SPUMANTE ROSATO', EN: 'SPARKLING ROSÉ', TH: 'สปาร์กลิงโรเซ่', MM: 'စပါကလင် ရိုဇေး', DE: 'SCHAUMWEIN ROSÉ', ES: 'ESPUMOSO ROSADO', FR: 'EFFERVESCENT ROSÉ', RU: 'РОЗОВОЕ ИГРИСТОЕ', ZH: '桃红起泡酒' },
  'SPARKLING ROSE': { IT: 'SPUMANTE ROSATO', EN: 'SPARKLING ROSÉ', TH: 'สปาร์กลิงโรเซ่', MM: 'စပါကလင် ရိုဇေး', DE: 'SCHAUMWEIN ROSÉ', ES: 'ESPUMOSO ROSADO', FR: 'EFFERVESCENT ROSÉ', RU: 'РОЗОВОЕ ИГРИСТОЕ', ZH: '桃红起泡酒' },

  'BOLLICINE': { IT: 'SPUMANTE', EN: 'SPARKLING WINE', TH: 'สปาร์กลิงไวน์', MM: 'စပါကလင် ဝိုင်', DE: 'SCHAUMWEIN', ES: 'VINO ESPUMOSO', FR: 'VIN EFFERVESCENT', RU: 'ИГРИСТОЕ ВИНО', ZH: '气泡起泡酒' },
  'SPUMANTE': { IT: 'SPUMANTE', EN: 'SPARKLING WINE', TH: 'สปาร์กลิงไวน์', MM: 'စပါကလင် ဝိုင်', DE: 'SCHAUMWEIN', ES: 'VINO ESPUMOSO', FR: 'VIN EFFERVESCENT', RU: 'ИГРИСТОЕ ВИНО', ZH: '气泡起泡酒' },
  'SPARKLING WINE': { IT: 'SPUMANTE', EN: 'SPARKLING WINE', TH: 'สปาร์กลิงไวน์', MM: 'စပါကလင် ဝိုင်', DE: 'SCHAUMWEIN', ES: 'VINO ESPUMOSO', FR: 'VIN EFFERVESCENT', RU: 'ИГРИСТОЕ ВИНО', ZH: '气泡起泡酒' },
  'PROSECCO': { IT: 'PROSECCO', EN: 'PROSECCO', TH: 'โพรเซกโก', MM: 'ပရိုဆက်ကို', DE: 'PROSECCO', ES: 'PROSECCO', FR: 'PROSECCO', RU: 'ПРОСЕККО', ZH: '普罗塞克' },

  'VINO ROSATO': { IT: 'VINO ROSATO', EN: 'ROSÉ WINE', TH: 'ไวน์โรเซ่', MM: 'ရိုဇေး ဝိုင်', DE: 'ROSÉWEIN', ES: 'VINO ROSADO', FR: 'VIN ROSÉ', RU: 'РОЗОВОЕ ВИНО', ZH: '桃红葡萄酒' },
  'ROSÉ WINE': { IT: 'VINO ROSATO', EN: 'ROSÉ WINE', TH: 'ไวน์โรเซ่', MM: 'ရိုဇေး ဝိုင်', DE: 'ROSÉWEIN', ES: 'VINO ROSADO', FR: 'VIN ROSÉ', RU: 'РОЗОВОЕ ВИНО', ZH: '桃红葡萄酒' },
  'ROSÉWEIN': { IT: 'VINO ROSATO', EN: 'ROSÉ WINE', TH: 'ไวน์โรเซ่', MM: 'ရိုဇေး ဝိုင်', DE: 'ROSÉWEIN', ES: 'VINO ROSADO', FR: 'VIN ROSÉ', RU: 'РОЗОВОЕ ВИНО', ZH: '桃红葡萄酒' },
};

// ── 2. DICTIONARY OF COUNTRIES & REGIONS ───────────────────────────────────
const COUNTRY_MAP: Record<string, Record<WineLang, string>> = {
  'ITALIA': { IT: 'ITALIA', EN: 'ITALY', TH: 'อิตาลี', MM: 'အီတလီ', DE: 'ITALIEN', ES: 'ITALIA', FR: 'ITALIE', RU: 'ИТАЛИЯ', ZH: '意大利' },
  'ITALY': { IT: 'ITALIA', EN: 'ITALY', TH: 'อิตาลี', MM: 'အီတလီ', DE: 'ITALIEN', ES: 'ITALIA', FR: 'ITALIE', RU: 'ИТАЛИЯ', ZH: '意大利' },
  'FRANCIA': { IT: 'FRANCIA', EN: 'FRANCE', TH: 'ฝรั่งเศส', MM: 'ပြင်သစ်', DE: 'FRANKREICH', ES: 'FRANCIA', FR: 'FRANCE', RU: 'ФРАНЦИЯ', ZH: '法国' },
  'FRANCE': { IT: 'FRANCIA', EN: 'FRANCE', TH: 'ฝรั่งเศส', MM: 'ပြင်သစ်', DE: 'FRANKREICH', ES: 'FRANCIA', FR: 'FRANCE', RU: 'ФРАНЦИЯ', ZH: '法国' },
  'CILE': { IT: 'CILE', EN: 'CHILE', TH: 'ชิลี', MM: 'ချီလီ', DE: 'CHILE', ES: 'CHILE', FR: 'CHILI', RU: 'ЧИЛИ', ZH: '智利' },
  'CHILE': { IT: 'CILE', EN: 'CHILE', TH: 'ชิลี', MM: 'ချီလီ', DE: 'CHILE', ES: 'CHILE', FR: 'CHILI', RU: 'ЧИЛИ', ZH: '智利' },
  'AUSTRALIA': { IT: 'AUSTRALIA', EN: 'AUSTRALIA', TH: 'ออสเตรเลีย', MM: 'သြစတြေးလျ', DE: 'AUSTRALIEN', ES: 'AUSTRALIA', FR: 'AUSTRALIE', RU: 'АВСТРАЛИЯ', ZH: '澳大利亚' },
  'SPAGNA': { IT: 'SPAGNA', EN: 'SPAIN', TH: 'สเปน', MM: 'စပိန်', DE: 'SPANIEN', ES: 'ESPAÑA', FR: 'ESPAGNE', RU: 'ИСПАНИЯ', ZH: '西班牙' },
  'SPAIN': { IT: 'SPAGNA', EN: 'SPAIN', TH: 'สเปน', MM: 'စပိန်', DE: 'SPANIEN', ES: 'ESPAÑA', FR: 'ESPAGNE', RU: 'ИСПАНИЯ', ZH: '西班牙' },
  'GERMANIA': { IT: 'GERMANIA', EN: 'GERMANY', TH: 'เยอรมนี', MM: 'ဂျာမနီ', DE: 'DEUTSCHLAND', ES: 'ALEMANIA', FR: 'ALLEMAGNE', RU: 'ГЕРМАНИЯ', ZH: '德国' },
  'GERMANY': { IT: 'GERMANIA', EN: 'GERMANY', TH: 'เยอรมนี', MM: 'ဂျာမနီ', DE: 'DEUTSCHLAND', ES: 'ALEMANIA', FR: 'ALLEMAGNE', RU: 'ГЕРМАНИЯ', ZH: '德国' },
  'ARGENTINA': { IT: 'ARGENTINA', EN: 'ARGENTINA', TH: 'อาร์เจนตินา', MM: 'အာဂျင်တီးနား', DE: 'ARGENTINIEN', ES: 'ARGENTINA', FR: 'ARGENTINE', RU: 'АРГЕНТИНА', ZH: '阿根廷' },
  'NUOVA ZELANDA': { IT: 'NUOVA ZELANDA', EN: 'NEW ZEALAND', TH: 'นิวซีแลนด์', MM: 'နယူးဇီလန်', DE: 'NEUSEELAND', ES: 'NUEVA ZELANDA', FR: 'NOUVELLE-ZÉLANDE', RU: 'НОВАЯ ЗЕЛАНДИЯ', ZH: '新西兰' },
  'NEW ZEALAND': { IT: 'NUOVA ZELANDA', EN: 'NEW ZEALAND', TH: 'นิวซีแลนด์', MM: 'နယူးဇီလန်', DE: 'NEUSEELAND', ES: 'NUEVA ZELANDA', FR: 'NOUVELLE-ZÉLANDE', RU: 'НОВАЯ ЗЕЛАНДИЯ', ZH: '新西兰' },
  'SUDAFRICA': { IT: 'SUDAFRICA', EN: 'SOUTH AFRICA', TH: 'แอฟริกาใต้', MM: 'တောင်အာဖရိက', DE: 'SÜDAFRIKA', ES: 'SUDÁFRICA', FR: 'AFRIQUE DU SUD', RU: 'ЮЖНАЯ АФРИКА', ZH: '南非' },
  'SOUTH AFRICA': { IT: 'SUDAFRICA', EN: 'SOUTH AFRICA', TH: 'แอฟริกาใต้', MM: 'တောင်အာဖရိက', DE: 'SÜDAFRIKA', ES: 'SUDÁFRICA', FR: 'AFRIQUE DU SUD', RU: 'ЮЖНАЯ АФРИКА', ZH: '南非' },
  'STATI UNITI': { IT: 'STATI UNITI', EN: 'UNITED STATES', TH: 'สหรัฐอเมริกา', MM: 'အမေရိကန်', DE: 'USA', ES: 'ESTADOS UNIDOS', FR: 'ÉTATS-UNIS', RU: 'США', ZH: '美国' },
  'UNITED STATES': { IT: 'STATI UNITI', EN: 'UNITED STATES', TH: 'สหรัฐอเมริกา', MM: 'အမေရိကန်', DE: 'USA', ES: 'ESTADOS UNIDOS', FR: 'ÉTATS-UNIS', RU: 'США', ZH: '美国' },
  'PORTOGALLO': { IT: 'PORTOGALLO', EN: 'PORTUGAL', TH: 'โปรตุเกส', MM: 'ပေါ်တူဂီ', DE: 'PORTUGAL', ES: 'PORTUGAL', FR: 'PORTUGAL', RU: 'ПОРТУГАЛИЯ', ZH: '葡萄牙' },
  'PORTUGAL': { IT: 'PORTOGALLO', EN: 'PORTUGAL', TH: 'โปรตุเกส', MM: 'ပေါ်တူဂီ', DE: 'PORTUGAL', ES: 'PORTUGAL', FR: 'PORTUGAL', RU: 'ПОРТУГАЛИЯ', ZH: '葡萄牙' },
};

export const REGION_MAP: Record<string, Record<WineLang, string>> = {
  'PUGLIA': { IT: 'PUGLIA', EN: 'PUGLIA', TH: 'แคว้นปูลยา', MM: 'ပူလီယာ', DE: 'APULIEN', ES: 'APULIA', FR: 'POUILLES', RU: 'АПУЛИЯ', ZH: '普利亚' },
  'SICILIA': { IT: 'SICILIA', EN: 'SICILY', TH: 'เกาะซิซิลี', MM: 'ဆီဆီလီ', DE: 'SIZILIEN', ES: 'SICILIA', FR: 'SICILE', RU: 'СИЦИЛИЯ', ZH: '西西里' },
  'TOSCANA': { IT: 'TOSCANA', EN: 'TUSCANY', TH: 'ทัสคานี', MM: 'တိုစကန်နီ', DE: 'TOSKANA', ES: 'TOSCANA', FR: 'TOSCANE', RU: 'ТОСКАНА', ZH: '托斯卡纳' },
  'VENETO': { IT: 'VENETO', EN: 'VENETO', TH: 'เวเนโต', MM: 'ဗီနီတို', DE: 'VENETIEN', ES: 'VÉNETO', FR: 'VÉNÉTIE', RU: 'ВЕНЕТО', ZH: '威尼托' },
  'PIEMONTE': { IT: 'PIEMONTE', EN: 'PIEDMONT', TH: 'ปิเอมอนเต', MM: 'ပီမွန်တီ', DE: 'PIEMONT', ES: 'PIAMONTE', FR: 'PIÉMONT', RU: 'ПЬЕМОНТ', ZH: '皮埃蒙特' },
  'BORDEAUX': { IT: 'BORDEAUX', EN: 'BORDEAUX', TH: 'บอร์โด', MM: 'ဘော်ဒိုး', DE: 'BORDEAUX', ES: 'BURDEOS', FR: 'BORDEAUX', RU: 'БОРДО', ZH: '波尔多' },
  'PROVENCE': { IT: 'PROVENZA', EN: 'PROVENCE', TH: 'โพรวองซ์', MM: 'ပရိုဗန့်စ်', DE: 'PROVENCE', ES: 'PROVENZA', FR: 'PROVENCE', RU: 'ПРОВАНС', ZH: '普罗旺斯' },
  'RIOJA': { IT: 'RIOJA', EN: 'RIOJA', TH: 'ริโอฮา', MM: 'ရီယိုဟာ', DE: 'RIOJA', ES: 'RIOJA', FR: 'RIOJA', RU: 'РИОХА', ZH: '里奥哈' },
  'MENDOZA': { IT: 'MENDOZA', EN: 'MENDOZA', TH: 'เมนโดซา', MM: 'မန်ဒိုဇာ', DE: 'MENDOZA', ES: 'MENDOZA', FR: 'MENDOZA', RU: 'МЕНДОСА', ZH: '门多萨' },
};

export function translateWineType(raw: string, targetLang: WineLang): string {
  if (!raw) return '';
  const upper = raw.trim().toUpperCase();
  if (WINE_TYPE_MAP[upper] && WINE_TYPE_MAP[upper][targetLang]) {
    return WINE_TYPE_MAP[upper][targetLang];
  }
  for (const [key, mapping] of Object.entries(WINE_TYPE_MAP)) {
    if (upper.includes(key)) {
      return mapping[targetLang];
    }
  }
  return raw.toUpperCase();
}

export function translateWineOrigin(raw: string, targetLang: WineLang): string {
  if (!raw) return '';
  let origin = raw.trim();
  const parts = origin.split(/[·,\-\/]/).map(p => p.trim()).filter(Boolean);

  const translatedParts = parts.map(part => {
    const upper = part.toUpperCase();
    if (COUNTRY_MAP[upper]) return COUNTRY_MAP[upper][targetLang];
    if (REGION_MAP[upper]) return REGION_MAP[upper][targetLang];
    return part;
  });

  return translatedParts.join(' · ').toUpperCase();
}

export function translateWineCardAllLanguages(params: {
  sourceLang: WineLang;
  vigna: string;
  dettagli: string;
  brand: string;
  wineType: string;
  origin: string;
  description: string;
}): {
  title: Record<WineLang, string>;
  titleIt: string;
  titleEn: string;
  titleTh: string;
  titleMm: string;
  titleDe: string;
  titleEs: string;
  titleFr: string;
  titleRu: string;
  titleZh: string;
  categorySubtitle: string;
  subtitleIt: string;
  subtitleEn: string;
  subtitleTh: string;
  subtitleMm: string;
  subtitleDe: string;
  subtitleEs: string;
  subtitleFr: string;
  subtitleRu: string;
  subtitleZh: string;
  descriptionIt: string;
  descriptionEn: string;
  descriptionTh: string;
  descriptionMm: string;
  descriptionDe: string;
  descriptionEs: string;
  descriptionFr: string;
  descriptionRu: string;
  descriptionZh: string;
} {
  const { sourceLang, vigna, dettagli, brand, wineType, origin, description } = params;

  const langs: WineLang[] = ['IT', 'EN', 'TH', 'MM', 'DE', 'ES', 'FR', 'RU', 'ZH'];
  const titles: Record<WineLang, string> = { IT: '', EN: '', TH: '', MM: '', DE: '', ES: '', FR: '', RU: '', ZH: '' };
  const subtitles: Record<WineLang, string> = { IT: '', EN: '', TH: '', MM: '', DE: '', ES: '', FR: '', RU: '', ZH: '' };
  const descriptions: Record<WineLang, string> = { IT: '', EN: '', TH: '', MM: '', DE: '', ES: '', FR: '', RU: '', ZH: '' };

  for (const l of langs) {
    if (l === sourceLang) {
      const tLines = [vigna, dettagli, brand].filter(Boolean);
      titles[l] = tLines.join('\n');

      const sLines = [wineType, origin].filter(Boolean);
      subtitles[l] = sLines.join('\n');

      descriptions[l] = description;
    } else {
      const transType = translateWineType(wineType, l);
      const transOrigin = translateWineOrigin(origin, l);
      const subLines = [transType, transOrigin].filter(Boolean);
      subtitles[l] = subLines.join('\n');

      const transDettagli = translateWineType(dettagli, l) !== dettagli.toUpperCase() 
        ? translateWineType(dettagli, l) 
        : dettagli;

      const titleLines = [vigna, transDettagli, brand].filter(Boolean);
      titles[l] = titleLines.join('\n');
      descriptions[l] = description; // Fallback until AI translation is applied
    }
  }

  return {
    title: titles,
    titleIt: titles.IT,
    titleEn: titles.EN,
    titleTh: titles.TH,
    titleMm: titles.MM,
    titleDe: titles.DE,
    titleEs: titles.ES,
    titleFr: titles.FR,
    titleRu: titles.RU,
    titleZh: titles.ZH,
    categorySubtitle: subtitles.EN || subtitles[sourceLang],
    subtitleIt: subtitles.IT,
    subtitleEn: subtitles.EN,
    subtitleTh: subtitles.TH,
    subtitleMm: subtitles.MM,
    subtitleDe: subtitles.DE,
    subtitleEs: subtitles.ES,
    subtitleFr: subtitles.FR,
    subtitleRu: subtitles.RU,
    subtitleZh: subtitles.ZH,
    descriptionIt: descriptions.IT,
    descriptionEn: descriptions.EN,
    descriptionTh: descriptions.TH,
    descriptionMm: descriptions.MM,
    descriptionDe: descriptions.DE,
    descriptionEs: descriptions.ES,
    descriptionFr: descriptions.FR,
    descriptionRu: descriptions.RU,
    descriptionZh: descriptions.ZH,
  };
}
