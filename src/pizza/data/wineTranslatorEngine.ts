/**
 * Sommelier Multilingual Translation Engine for Wine Cards
 * Translates accurately across IT (Italian), EN (English), TH (Thai), and DE (German)
 * Any language can act as the "Mother / Source" language.
 */

export type WineLang = 'IT' | 'EN' | 'TH' | 'DE';

// ── 1. DICTIONARY OF WINE TYPES ───────────────────────────────────────────
const WINE_TYPE_MAP: Record<string, Record<WineLang, string>> = {
  'VINO ROSSO': { IT: 'VINO ROSSO', EN: 'RED WINE', TH: 'ไวน์แดง', DE: 'ROTWEIN' },
  'RED WINE': { IT: 'VINO ROSSO', EN: 'RED WINE', TH: 'ไวน์แดง', DE: 'ROTWEIN' },
  'ROTWEIN': { IT: 'VINO ROSSO', EN: 'RED WINE', TH: 'ไวน์แดง', DE: 'ROTWEIN' },
  'ไวน์แดง': { IT: 'VINO ROSSO', EN: 'RED WINE', TH: 'ไวน์แดง', DE: 'ROTWEIN' },

  'VINO BIANCO': { IT: 'VINO BIANCO', EN: 'WHITE WINE', TH: 'ไวน์ขาว', DE: 'WEISSWEIN' },
  'WHITE WINE': { IT: 'VINO BIANCO', EN: 'WHITE WINE', TH: 'ไวน์ขาว', DE: 'WEISSWEIN' },
  'WEISSWEIN': { IT: 'VINO BIANCO', EN: 'WHITE WINE', TH: 'ไวน์ขาว', DE: 'WEISSWEIN' },
  'WEIßWEIN': { IT: 'VINO BIANCO', EN: 'WHITE WINE', TH: 'ไวน์ขาว', DE: 'WEISSWEIN' },
  'ไวน์ขาว': { IT: 'VINO BIANCO', EN: 'WHITE WINE', TH: 'ไวน์ขาว', DE: 'WEISSWEIN' },

  'SPUMANTE ROSATO': { IT: 'SPUMANTE ROSATO', EN: 'SPARKLING ROSÉ', TH: 'สปาร์กลิงโรเซ่', DE: 'SCHAUMWEIN ROSÉ' },
  'SPARKLING ROSÉ': { IT: 'SPUMANTE ROSATO', EN: 'SPARKLING ROSÉ', TH: 'สปาร์กลิงโรเซ่', DE: 'SCHAUMWEIN ROSÉ' },
  'SPARKLING ROSE': { IT: 'SPUMANTE ROSATO', EN: 'SPARKLING ROSÉ', TH: 'สปาร์กลิงโรเซ่', DE: 'SCHAUMWEIN ROSÉ' },
  'SCHAUMWEIN ROSÉ': { IT: 'SPUMANTE ROSATO', EN: 'SPARKLING ROSÉ', TH: 'สปาร์กลิงโรเซ่', DE: 'SCHAUMWEIN ROSÉ' },
  'สปาร์กลิงโรเซ่': { IT: 'SPUMANTE ROSATO', EN: 'SPARKLING ROSÉ', TH: 'สปาร์กลิงโรเซ่', DE: 'SCHAUMWEIN ROSÉ' },

  'BOLLICINE': { IT: 'SPUMANTE', EN: 'SPARKLING WINE', TH: 'สปาร์กลิงไวน์', DE: 'SCHAUMWEIN' },
  'SPUMANTE': { IT: 'SPUMANTE', EN: 'SPARKLING WINE', TH: 'สปาร์กลิงไวน์', DE: 'SCHAUMWEIN' },
  'SPARKLING WINE': { IT: 'SPUMANTE', EN: 'SPARKLING WINE', TH: 'สปาร์กลิงไวน์', DE: 'SCHAUMWEIN' },
  'SCHAUMWEIN': { IT: 'SPUMANTE', EN: 'SPARKLING WINE', TH: 'สปาร์กลิงไวน์', DE: 'SCHAUMWEIN' },
  'PROSECCO': { IT: 'PROSECCO', EN: 'PROSECCO', TH: 'โพรเซกโก', DE: 'PROSECCO' },
  'สปาร์กลิงไวน์': { IT: 'SPUMANTE', EN: 'SPARKLING WINE', TH: 'สปาร์กลิงไวน์', DE: 'SCHAUMWEIN' },

  'VINO ROSATO': { IT: 'VINO ROSATO', EN: 'ROSÉ WINE', TH: 'ไวน์โรเซ่', DE: 'ROSÉWEIN' },
  'ROSÉ WINE': { IT: 'VINO ROSATO', EN: 'ROSÉ WINE', TH: 'ไวน์โรเซ่', DE: 'ROSÉWEIN' },
  'ROSÈ WINE': { IT: 'VINO ROSATO', EN: 'ROSÉ WINE', TH: 'ไวน์โรเซ่', DE: 'ROSÉWEIN' },
  'ROSE WINE': { IT: 'VINO ROSATO', EN: 'ROSÉ WINE', TH: 'ไวน์โรเซ่', DE: 'ROSÉWEIN' },
  'ROSÉWEIN': { IT: 'VINO ROSATO', EN: 'ROSÉ WINE', TH: 'ไวน์โรเซ่', DE: 'ROSÉWEIN' },
  'ไวน์โรเซ่': { IT: 'VINO ROSATO', EN: 'ROSÉ WINE', TH: 'ไวน์โรเซ่', DE: 'ROSÉWEIN' },
};

// ── 2. DICTIONARY OF COUNTRIES & REGIONS ───────────────────────────────────
const COUNTRY_MAP: Record<string, Record<WineLang, string>> = {
  'ITALIA': { IT: 'ITALIA', EN: 'ITALY', TH: 'อิตาลี', DE: 'ITALIEN' },
  'ITALY': { IT: 'ITALIA', EN: 'ITALY', TH: 'อิตาลี', DE: 'ITALIEN' },
  'ITALIEN': { IT: 'ITALIA', EN: 'ITALY', TH: 'อิตาลี', DE: 'ITALIEN' },
  'อิตาลี': { IT: 'ITALIA', EN: 'ITALY', TH: 'อิตาลี', DE: 'ITALIEN' },

  'FRANCIA': { IT: 'FRANCIA', EN: 'FRANCE', TH: 'ฝรั่งเศส', DE: 'FRANKREICH' },
  'FRANCE': { IT: 'FRANCIA', EN: 'FRANCE', TH: 'ฝรั่งเศส', DE: 'FRANKREICH' },
  'FRANKREICH': { IT: 'FRANCIA', EN: 'FRANCE', TH: 'ฝรั่งเศส', DE: 'FRANKREICH' },
  'ฝรั่งเศส': { IT: 'FRANCIA', EN: 'FRANCE', TH: 'ฝรั่งเศส', DE: 'FRANKREICH' },

  'CILE': { IT: 'CILE', EN: 'CHILE', TH: 'ชิลี', DE: 'CHILE' },
  'CHILE': { IT: 'CILE', EN: 'CHILE', TH: 'ชิลี', DE: 'CHILE' },
  'ชิลี': { IT: 'CILE', EN: 'CHILE', TH: 'ชิลี', DE: 'CHILE' },

  'AUSTRALIA': { IT: 'AUSTRALIA', EN: 'AUSTRALIA', TH: 'ออสเตรเลีย', DE: 'AUSTRALIEN' },
  'AUSTRALIEN': { IT: 'AUSTRALIA', EN: 'AUSTRALIA', TH: 'ออสเตรเลีย', DE: 'AUSTRALIEN' },
  'ออสเตรเลีย': { IT: 'AUSTRALIA', EN: 'AUSTRALIA', TH: 'ออสเตรเลีย', DE: 'AUSTRALIEN' },

  'SPAGNA': { IT: 'SPAGNA', EN: 'SPAIN', TH: 'สเปน', DE: 'SPANIEN' },
  'SPAIN': { IT: 'SPAGNA', EN: 'SPAIN', TH: 'สเปน', DE: 'SPANIEN' },
  'SPANIEN': { IT: 'SPAGNA', EN: 'SPAIN', TH: 'สเปน', DE: 'SPANIEN' },
  'สเปน': { IT: 'SPAGNA', EN: 'SPAIN', TH: 'สเปน', DE: 'SPANIEN' },

  'GERMANIA': { IT: 'GERMANIA', EN: 'GERMANY', TH: 'เยอรมนี', DE: 'DEUTSCHLAND' },
  'GERMANY': { IT: 'GERMANIA', EN: 'GERMANY', TH: 'เยอรมนี', DE: 'DEUTSCHLAND' },
  'DEUTSCHLAND': { IT: 'GERMANIA', EN: 'GERMANY', TH: 'เยอรมนี', DE: 'DEUTSCHLAND' },
  'เยอรมนี': { IT: 'GERMANIA', EN: 'GERMANY', TH: 'เยอรมนี', DE: 'DEUTSCHLAND' },

  'ARGENTINA': { IT: 'ARGENTINA', EN: 'ARGENTINA', TH: 'อาร์เจนตินา', DE: 'ARGENTINIEN' },
  'ARGENTINIEN': { IT: 'ARGENTINA', EN: 'ARGENTINA', TH: 'อาร์เจนตินา', DE: 'ARGENTINIEN' },
  'อาร์เจนตินา': { IT: 'ARGENTINA', EN: 'ARGENTINA', TH: 'อาร์เจนตินา', DE: 'ARGENTINIEN' },

  'NUOVA ZELANDA': { IT: 'NUOVA ZELANDA', EN: 'NEW ZEALAND', TH: 'นิวซีแลนด์', DE: 'NEUSEELAND' },
  'NEW ZEALAND': { IT: 'NUOVA ZELANDA', EN: 'NEW ZEALAND', TH: 'นิวซีแลนด์', DE: 'NEUSEELAND' },
  'NEUSEELAND': { IT: 'NUOVA ZELANDA', EN: 'NEW ZEALAND', TH: 'นิวซีแลนด์', DE: 'NEUSEELAND' },
  'นิวซีแลนด์': { IT: 'NUOVA ZELANDA', EN: 'NEW ZEALAND', TH: 'นิวซีแลนด์', DE: 'NEUSEELAND' },

  'SUDAFRICA': { IT: 'SUDAFRICA', EN: 'SOUTH AFRICA', TH: 'แอฟริกาใต้', DE: 'SÜDAFRIKA' },
  'SOUTH AFRICA': { IT: 'SUDAFRICA', EN: 'SOUTH AFRICA', TH: 'แอฟริกาใต้', DE: 'SÜDAFRIKA' },
  'SÜDAFRIKA': { IT: 'SUDAFRICA', EN: 'SOUTH AFRICA', TH: 'แอฟริกาใต้', DE: 'SÜDAFRIKA' },
  'แอฟริกาใต้': { IT: 'SUDAFRICA', EN: 'SOUTH AFRICA', TH: 'แอฟริกาใต้', DE: 'SÜDAFRIKA' },

  'MESSICO': { IT: 'MESSICO', EN: 'MEXICO', TH: 'เม็กซิโก', DE: 'MEXIKO' },
  'MEXICO': { IT: 'MESSICO', EN: 'MEXICO', TH: 'เม็กซิโก', DE: 'MEXIKO' },
  'MEXIKO': { IT: 'MESSICO', EN: 'MEXICO', TH: 'เม็กซิโก', DE: 'MEXIKO' },
  'เม็กซิโก': { IT: 'MESSICO', EN: 'MEXICO', TH: 'เม็กซิโก', DE: 'MEXIKO' },

  'PORTOGALLO': { IT: 'PORTOGALLO', EN: 'PORTUGAL', TH: 'โปรตุเกส', DE: 'PORTUGAL' },
  'PORTUGAL': { IT: 'PORTOGALLO', EN: 'PORTUGAL', TH: 'โปรตุเกส', DE: 'PORTUGAL' },
  'โปรตุเกส': { IT: 'PORTOGALLO', EN: 'PORTUGAL', TH: 'โปรตุเกส', DE: 'PORTUGAL' },

  'STATI UNITI': { IT: 'STATI UNITI', EN: 'UNITED STATES', TH: 'สหรัฐอเมริกา', DE: 'USA' },
  'UNITED STATES': { IT: 'STATI UNITI', EN: 'UNITED STATES', TH: 'สหรัฐอเมริกา', DE: 'USA' },
  'USA': { IT: 'STATI UNITI', EN: 'UNITED STATES', TH: 'สหรัฐอเมริกา', DE: 'USA' },

  'AUSTRIA': { IT: 'AUSTRIA', EN: 'AUSTRIA', TH: 'ออสเตรีย', DE: 'ÖSTERREICH' },
  'ÖSTERREICH': { IT: 'AUSTRIA', EN: 'AUSTRIA', TH: 'ออสเตรีย', DE: 'ÖSTERREICH' },
  'ออสเตรีย': { IT: 'AUSTRIA', EN: 'AUSTRIA', TH: 'ออสเตรีย', DE: 'ÖSTERREICH' },

  'GRECIA': { IT: 'GRECIA', EN: 'GREECE', TH: 'กรีซ', DE: 'GRIECHENLAND' },
  'GREECE': { IT: 'GRECIA', EN: 'GREECE', TH: 'กรีซ', DE: 'GRIECHENLAND' },
  'GRIECHENLAND': { IT: 'GRECIA', EN: 'GREECE', TH: 'กรีซ', DE: 'GRIECHENLAND' },

  'SVIZZERA': { IT: 'SVIZZERA', EN: 'SWITZERLAND', TH: 'สวิตเซอร์แลนด์', DE: 'SCHWEIZ' },
  'SWITZERLAND': { IT: 'SVIZZERA', EN: 'SWITZERLAND', TH: 'สวิตเซอร์แลนด์', DE: 'SCHWEIZ' },
  'SCHWEIZ': { IT: 'SVIZZERA', EN: 'SWITZERLAND', TH: 'สวิตเซอร์แลนด์', DE: 'SCHWEIZ' },

  'REGNO UNITO': { IT: 'REGNO UNITO', EN: 'UNITED KINGDOM', TH: 'สหราชอาณาจักร', DE: 'VEREINIGTES KÖNIGREICH' },
  'UNITED KINGDOM': { IT: 'REGNO UNITO', EN: 'UNITED KINGDOM', TH: 'สหราชอาณาจักร', DE: 'VEREINIGTES KÖNIGREICH' },
  'UK': { IT: 'REGNO UNITO', EN: 'UNITED KINGDOM', TH: 'สหราชอาณาจักร', DE: 'VEREINIGTES KÖNIGREICH' },

  'UNGHERIA': { IT: 'UNGHERIA', EN: 'HUNGARY', TH: 'ฮังการี', DE: 'UNGARN' },
  'HUNGARY': { IT: 'UNGHERIA', EN: 'HUNGARY', TH: 'ฮังการี', DE: 'UNGARN' },
  'UNGARN': { IT: 'UNGHERIA', EN: 'HUNGARY', TH: 'ฮังการี', DE: 'UNGARN' },

  'GEORGIA': { IT: 'GEORGIA', EN: 'GEORGIA', TH: 'จอร์เจีย', DE: 'GEORGIEN' },
  'GEORGIEN': { IT: 'GEORGIA', EN: 'GEORGIA', TH: 'จอร์เจีย', DE: 'GEORGIEN' },

  'TURCHIA': { IT: 'TURCHIA', EN: 'TURKEY', TH: 'ตุรกี', DE: 'TÜRKEI' },
  'TURKEY': { IT: 'TURCHIA', EN: 'TURKEY', TH: 'ตุรกี', DE: 'TÜRKEI' },
  'TÜRKEI': { IT: 'TURCHIA', EN: 'TURKEY', TH: 'ตุรกี', DE: 'TÜRKEI' },

  'LIBANO': { IT: 'LIBANO', EN: 'LEBANON', TH: 'เลบานอน', DE: 'LIBANON' },
  'LEBANON': { IT: 'LIBANO', EN: 'LEBANON', TH: 'เลบานอน', DE: 'LIBANON' },
  'LIBANON': { IT: 'LIBANO', EN: 'LEBANON', TH: 'เลบานอน', DE: 'LIBANON' },
};

const REGION_MAP: Record<string, Record<WineLang, string>> = {
  'PUGLIA': { IT: 'PUGLIA', EN: 'PUGLIA', TH: 'แคว้นปูลยา', DE: 'APULIEN' },
  'APULIEN': { IT: 'PUGLIA', EN: 'PUGLIA', TH: 'แคว้นปูลยา', DE: 'APULIEN' },
  'แคว้นปูลยา': { IT: 'PUGLIA', EN: 'PUGLIA', TH: 'แคว้นปูลยา', DE: 'APULIEN' },

  'SICILIA': { IT: 'SICILIA', EN: 'SICILY', TH: 'เกาะซิซิลี', DE: 'SIZILIEN' },
  'SICILY': { IT: 'SICILIA', EN: 'SICILY', TH: 'เกาะซิซิลี', DE: 'SIZILIEN' },
  'SIZILIEN': { IT: 'SICILIA', EN: 'SICILY', TH: 'เกาะซิซิลี', DE: 'SIZILIEN' },
  'เกาะซิซิลี': { IT: 'SICILIA', EN: 'SICILY', TH: 'เกาะซิซิลี', DE: 'SIZILIEN' },

  'VENETO': { IT: 'VENETO', EN: 'VENETO', TH: 'แคว้นเวเนโต', DE: 'VENETIEN' },
  'VENETIEN': { IT: 'VENETO', EN: 'VENETO', TH: 'แคว้นเวเนโต', DE: 'VENETIEN' },
  'แคว้นเวเนโต': { IT: 'VENETO', EN: 'VENETO', TH: 'แคว้นเวเนโต', DE: 'VENETIEN' },

  'TOSCANA': { IT: 'TOSCANA', EN: 'TUSCANY', TH: 'แคว้นทัสคานี', DE: 'TOSKANA' },
  'TUSCANY': { IT: 'TOSCANA', EN: 'TUSCANY', TH: 'แคว้นทัสคานี', DE: 'TOSKANA' },
  'TOSKANA': { IT: 'TOSCANA', EN: 'TUSCANY', TH: 'แคว้นทัสคานี', DE: 'TOSKANA' },

  'PIEMONTE': { IT: 'PIEMONTE', EN: 'PIEDMONT', TH: 'แคว้นพีดมอนต์', DE: 'PIEMONT' },
  'PIEDMONT': { IT: 'PIEMONTE', EN: 'PIEDMONT', TH: 'แคว้นพีดมอนต์', DE: 'PIEMONT' },
  'PIEMONT': { IT: 'PIEMONTE', EN: 'PIEDMONT', TH: 'แคว้นพีดมอนต์', DE: 'PIEMONT' },

  'PROVENZA': { IT: 'PROVENZA', EN: 'PROVENCE', TH: 'โพรวองซ์', DE: 'PROVENCE' },
  'PROVENCE': { IT: 'PROVENZA', EN: 'PROVENCE', TH: 'โพรวองซ์', DE: 'PROVENCE' },
  'โพรวองซ์': { IT: 'PROVENZA', EN: 'PROVENCE', TH: 'โพรวองซ์', DE: 'PROVENCE' },

  'VALLE CENTRALE': { IT: 'VALLE CENTRALE', EN: 'CENTRAL VALLEY', TH: 'เซ็นทรัลแวลลีย์', DE: 'CENTRAL VALLEY' },
  'CENTRAL VALLEY': { IT: 'VALLE CENTRALE', EN: 'CENTRAL VALLEY', TH: 'เซ็นทรัลแวลลีย์', DE: 'CENTRAL VALLEY' },
  'เซ็นทรัลแวลลีย์': { IT: 'VALLE CENTRALE', EN: 'CENTRAL VALLEY', TH: 'เซ็นทรัลแวลลีย์', DE: 'CENTRAL VALLEY' },

  'SOUTH EASTERN': { IT: 'SOUTH EASTERN', EN: 'SOUTH EASTERN', TH: 'เซาท์อีสเทิร์น', DE: 'SÜDOSTEN' },
  'SOUTH AUSTRALIA': { IT: 'SOUTH AUSTRALIA', EN: 'SOUTH AUSTRALIA', TH: 'เซาท์ออสเตรเลีย', DE: 'SÜDAUSTRALIEN' },
};

// ── 3. TRANSLATE WINE TYPE (Line 1 of subtitle) ───────────────────────────
export function translateWineType(raw: string, targetLang: WineLang): string {
  if (!raw) return '';
  const clean = raw.trim().toUpperCase();
  for (const [key, mapping] of Object.entries(WINE_TYPE_MAP)) {
    if (clean === key || clean.includes(key)) {
      return mapping[targetLang];
    }
  }
  return raw.toUpperCase();
}

// ── 4. TRANSLATE ORIGIN (Line 2 of subtitle) ──────────────────────────────
export function translateWineOrigin(raw: string, targetLang: WineLang): string {
  if (!raw) return '';
  let origin = raw.trim();

  // Replace connectors like "·", "-", ","
  const parts = origin.split(/[·,\-\/]/).map(p => p.trim()).filter(Boolean);

  const translatedParts = parts.map(part => {
    const upper = part.toUpperCase();
    if (COUNTRY_MAP[upper]) return COUNTRY_MAP[upper][targetLang];
    if (REGION_MAP[upper]) return REGION_MAP[upper][targetLang];
    return part;
  });

  return translatedParts.join(' · ').toUpperCase();
}

// ── 5. SOMMELIER PHRASES & AROMA VOCABULARY FOR DESCRIPTIONS ──────────────
interface SommelierPattern {
  it: string;
  en: string;
  th: string;
  de: string;
}

const SOMMELIER_PATTERNS: SommelierPattern[] = [
  {
    it: 'Vino rosso pugliese intenso e avvolgente con profumi di more mature, prugne e una leggera speziatura. Tannini morbidi e vellutati, perfetto con carni alla griglia, arrosti e formaggi stagionati.',
    en: 'Intense and rich Apulian red wine with aromas of ripe blackberries, plums, and subtle spice. Smooth, velvety texture and balanced tannins, ideal with grilled meats, roasted dishes, and aged cheeses.',
    th: 'ไวน์แดงอิตาเลียนยอดนิยมจากแคว้นปูลยา รสสัมผัสนุ่มละมุน เข้มข้น หอมกลิ่นแบล็กเบอร์รี ลูกพลัมสุก และเครื่องเทศอ่อนๆ ดื่มง่าย กลมกล่อม เข้ากันได้ดีเยี่ยมกับพิซซ่า สเต็กเนื้อ และชีสบอร์ด',
    de: 'Intensiver und vollmundiger Rotwein aus Apulien mit Noten von reifen Brombeeren, Pflaumen und feinen Gewürzen. Weiche Tannine und samtiger Abgang – ideal zu gegrilltem Fleisch und gereiftem Käse.'
  },
  {
    it: 'Rosso siciliano autentico dal colore rubino profondo, ricco di aromi di ciliegia matura, frutti di bosco e spezie mediterranee. Caldo, corposo e armonioso al palato.',
    en: 'Authentic Sicilian red wine with a deep ruby color, featuring rich aromas of ripe cherries, wild berries, and Mediterranean spices. Warm, full-bodied, and harmonious on the palate.',
    th: 'ไวน์แดงเอกลักษณ์จากเกาะซิซิลี สีแดงทับทิมเข้ม หอมกลิ่นเชอร์รีสุก เบอร์รีป่า และกลิ่นอายเครื่องเทศเมดิเตอร์เรเนียน รสชาติเข้มข้น อบอุ่น ฟูลบอดี้ ทานคู่กับพิซซ่าหน้าเนื้อหรือพาสต้าเข้มข้นได้อย่างลงตัว',
    de: 'Authentischer sizilianischer Rotwein von tiefer rubinroter Farbe mit Aromen von reifen Kirschen, Waldbeeren und mediterranen Kräutern. Warm, vollmundig und harmonisch.'
  },
  {
    it: 'Rosso rubino brillante con riflessi violacei. Bouquet invitante di frutti rossi, ciliegie e spezie delicate. Finale armonico e persistente, ottimo con pizza cotta nel forno a legna e pasta al ragù.',
    en: 'Bright ruby red with purple highlights. Pleasant bouquet of ripe red berries, cherries, and fine Italian spices. Harmonious and lingering finish, wonderful with artisanal pizza and rich pasta bolognese.',
    th: 'ไวน์แดงอิตาเลียนสีทับทิมสดใส กลิ่นหอมสดชื่นของผลไม้สีแดง เชอร์รี และเครื่องเทศอิตาเลียนเบาๆ รสชาติกลมกล่อม ดื่มคล่องคอ เข้ากับพิซซ่าแป้งสดอบร้อนๆ และพาสต้าซอสเนื้อโบโลเนสอย่างที่สุด',
    de: 'Leuchtendes Rubinrot mit violetten Reflexen. Angenehmes Bouquet von reifen roten Beeren, Kirschen und feinen italienischen Gewürzen. Harmonisch und langanhaltend, hervorragend zu Pizza und Pasta.'
  },
  {
    it: 'Spumante rosato fresco, brioso ed elegante con profumi di fragoline di bosco, ribes e delicati petali di rosa. Bollicina fine e vivace, perfetto per l\'aperitivo o per brindare al tramonto.',
    en: 'Fresh, lively and elegant rosé sparkling wine with aromas of wild strawberries, redcurrants, and delicate rose petals. Fine and vibrant bubbles, perfect for aperitifs or sunset toasts.',
    th: 'สปาร์กลิงไวน์โรเซ่สีชมพูประกายสวยสดใส ฟองพรายละเอียดนุ่มนวล หอมกลิ่นสตรอว์เบอร์รีป่าและผลไม้ตระกูลเบอร์รี รสสัมผัสสดชื่น มีชีวิตชีวา เหมาะมากสำหรับจิบเป็นเวลคัมดริงก์หรือฉลองช่วงเวลาพระอาทิตย์ตก',
    de: 'Frischer, lebendiger und eleganter Rosé-Schaumwein mit Noten von Waldbeeren, Johannisbeeren und zarten Rosenblüten. Feine Perlage – perfekt als Aperitif und zum Anstoßen.'
  },
  {
    it: 'Elegante bianco dal colore giallo paglierino con profumi floreali, mela verde croccante e sentori agrumati. Fresco, sapido e minerale, eccezionale con frutti di mare, insalate fresche e primi piatti leggeri.',
    en: 'Delicate, straw-yellow white wine with floral aromas, crisp green apple, and citrus notes. Fresh, crisp and mineral on the palate, beautifully paired with fresh seafood, salads, and light pasta dishes.',
    th: 'ไวน์ขาวยอดนิยมอันดับหนึ่งจากอิตาลี สีเหลืองฟางประกายทอง หอมกลิ่นแอปเปิ้ลเขียว ดอกไม้ขาว และซิตรัสสดชื่น ดื่มแล้วรู้สึกสดชื่น มีความมิเนอรัลลงตัว ทานคู่กับอาหารทะเล สลัด หรือพาสต้าซอสเบาๆ ได้อย่างยอดเยี่ยม',
    de: 'Eleganter Weißwein von strohgelber Farbe mit floralen Noten, knackigem grünem Apfel und Zitrusfrische. Frisch und mineralisch – ideal zu Meeresfrüchten, Salaten und leichten Pastagerichten.'
  },
  {
    it: 'Blend rosso australiano avvolgente con ricche note di prugne scure, ribes nero e un tocco di rovere tostato. Tannini morbidi e finale fruttato persistente.',
    en: 'Australian red blend featuring rich notes of dark plums, blackcurrant, and a touch of subtle oak. Smooth tannins and a lingering, generous fruity finish.',
    th: 'ไวน์แดงออสเตรเลียยอดนิยมจากการเบลนด์องุ่นคาแบร์เนต์และชีราซ ให้รสสัมผัสเข้มข้น หอมกลิ่นลูกพลัมสุก แบล็กเคอร์แรนต์ และไม้โอ๊คหอมละมุน แทนนินนุ่ม ทานง่าย ดื่มเพลินกับทุกเมนูเนื้อและพิซซ่า',
    de: 'Australische Rotwein-Cuvée mit reichen Noten von dunklen Pflaumen, schwarzer Johannisbeere und dezenter Eiche. Weiche Tannine und ein fruchtiger Abgang.'
  },
  {
    it: 'Chardonnay australiano fresco e solare con profumi di frutta tropicale, melone bianco e agrumi. Pulito, rinfrescante e piacevolmente equilibrato.',
    en: 'Crisp Australian Chardonnay featuring fresh tropical fruit aromas, melon, and citrus zest. Clean, refreshing, and beautifully balanced.',
    th: 'ไวน์ขาวชาร์ดอนเนย์จากออสเตรเลีย หอมกลิ่นผลไม้เมืองร้อน เมลอนฉ่ำๆ และกลิ่นซิตรัสสดชื่น บอดี้ปานกลาง ดื่มง่าย สดชื่น เหมาะอย่างยิ่งสำหรับดื่มคลายร้อนริมทะเลคู่กับอาหารทานเล่น',
    de: 'Frischer australischer Chardonnay mit Noten von tropischen Früchten, Melone und Zitrusfrüchten. Klar, erfrischend und harmonisch ausbalanciert.'
  },
  {
    it: 'Bianco cileno vivace e profumato con aromi di mela verde, lime e fresche note erbacee. Acidità croccante e finale dissetante, ideale con antipasti e piatti estivi.',
    en: 'Fresh and lively Chilean white wine with aromas of green apple, lime, and crisp herbal hints. Refreshing acidity and clean finish, perfect with appetizers and summer dishes.',
    th: 'ไวน์ขาวโซวีญง บลอง จากชิลี กลิ่นหอมสดชื่นจัดจ้านของมะนาว เลมอน แอปเปิ้ลเขียว และใบสมุนไพรอ่อนๆ รสชาติเปรี้ยวสดชื่น ดับกระหายได้ดีเยี่ยม เหมาะกับอาหารเรียกน้ำย่อยและสลัดสด',
    de: 'Frischer und lebendiger chilenischer Weißwein mit Aromen von grünem Apfel, Limette und Kräuternoten. Knackige Säure und erfrischender Abgang.'
  },
  {
    it: 'Rosso cileno dal colore rubino profondo con sentori di ribes nero, legno di cedro e cacao. Corpo pieno, tannini maturi e retrogusto fruttato lungo.',
    en: 'Deep ruby Chilean Cabernet with aromas of blackcurrant, cedarwood, and a hint of dark chocolate. Full-bodied with ripe tannins and a long, fruity aftertaste.',
    th: 'ไวน์แดงคาแบร์เนต์จากชิลี สีแดงเข้มลุ่มลึก อบอวลไปด้วยกลิ่นแบล็กเคอร์แรนต์ ไม้ซีดาร์ และดาร์กช็อกโกแลต บอดี้แน่นแต่นุ่ม กลมกล่อม เข้ากันได้ดีกับเนื้อย่าง เบอร์เกอร์ และพิซซ่ารสเข้ม',
    de: 'Tiefes Rubinrot mit Aromen von schwarzer Johannisbeere, Zedernholz und Bitterschokolade. Vollmundig mit reifen Tanninen und langem fruchtigem Nachhall.'
  },
  {
    it: 'Prestigioso Prosecco Superiore DOCG con perlage finissimo, note di pesca bianca, fiori di gelsomino e pera williams. Fresco, raffinato e festoso, perfetto per antipasti, pizze gourmet o brindisi speciali.',
    en: 'Prestigious Prosecco Superiore DOCG sparkling wine with fine perlage, vibrant notes of white peach, jasmine flowers, and pear. Crisp, elegant, and festive, perfect as an aperitif and with gourmet pizza.',
    th: 'โพรเซกโกชั้นสูงระดับ DOCG จากอิตาลี ฟองละเอียดนุ่มพรายยาวนาน หอมกลิ่นพีชขาว ดอกมะลิ และลูกแพร์ รสชาติหรูหรา สดชื่น มีระดับ เหมาะสำหรับการเริ่มต้นมื้ออาหารชั้นเลิศหรือเฉลิมฉลองโอกาสพิเศษ',
    de: 'Prestigeträchtiger Prosecco Superiore DOCG mit feinster Perlage, Noten von weißem Pfirsich, Jasmin und Birne. Frisch, elegant und festlich – perfekt zum Anstoßen und zu Gourmet-Pizza.'
  },
  {
    it: 'Iconico rosé provenzale dal colore rosa tenue con profumi di piccoli frutti rossi, melograno e fiori bianchi. Secco, minerale e straordinariamente rinfrescante per le serate tropicali.',
    en: 'Classic Provence rosé in a delicate pale pink hue, offering scents of red berries, pomegranate, and white flowers. Crisp, dry, mineral, and wonderfully refreshing for tropical island evenings.',
    th: 'ไวน์โรเซ่ระดับพรีเมียมสไตล์โพรวองซ์จากฝรั่งเศส สีชมพูอ่อนละมุน หอมกลิ่นราสเบอร์รี ทับทิม และดอกไม้สีขาว รสสัมผัสแห้ง สดชื่น คลาสสิก เป็นไวน์ที่เหมาะที่สุดสำหรับการนั่งจิบรับลมทะเลยามเย็น',
    de: 'Klassischer Rosé aus der Provence in zartem Rosa mit Noten von roten Beeren, Granatapfel und weißen Blüten. Trocken, mineralisch und herrlich erfrischend für tropische Abende.'
  }
];

// ── 6. DYNAMIC SOMMELIER VOCABULARY TRANSLATOR ────────────────────────────
// For custom wines created in the future (like Solstice Cuvée, etc.)
const SOMMELIER_TERMS: { it: string; en: string; th: string; de: string }[] = [
  // Flavors / Notes
  { it: 'ciliegia', en: 'cherry', th: 'เชอร์รี', de: 'Kirsche' },
  { it: 'ciliegie', en: 'cherries', th: 'เชอร์รี', de: 'Kirschen' },
  { it: 'frutti rossi', en: 'red berries', th: 'ผลไม้สีแดง', de: 'rote Beeren' },
  { it: 'frutti di bosco', en: 'wild berries', th: 'เบอร์รีป่า', de: 'Waldbeeren' },
  { it: 'more mature', en: 'ripe blackberries', th: 'แบล็กเบอร์รีสุก', de: 'reife Brombeeren' },
  { it: 'more', en: 'blackberries', th: 'แบล็กเบอร์รี', de: 'Brombeeren' },
  { it: 'prugna', en: 'plum', th: 'ลูกพลัม', de: 'Pflaume' },
  { it: 'prugne', en: 'plums', th: 'ลูกพลัม', de: 'Pflaumen' },
  { it: 'ribes nero', en: 'blackcurrant', th: 'แบล็กเคอร์แรนต์', de: 'schwarze Johannisbeere' },
  { it: 'ribes', en: 'redcurrants', th: 'เรดเคอร์แรนต์', de: 'Johannisbeeren' },
  { it: 'mela verde', en: 'green apple', th: 'แอปเปิ้ลเขียว', de: 'grüner Apfel' },
  { it: 'pesca bianca', en: 'white peach', th: 'พีชขาว', de: 'weißer Pfirsich' },
  { it: 'melograno', en: 'pomegranate', th: 'ทับทิม', de: 'Granatapfel' },
  { it: 'fiori bianchi', en: 'white flowers', th: 'ดอกไม้สีขาว', de: 'weiße Blüten' },
  { it: 'gelsomino', en: 'jasmine', th: 'ดอกมะลิ', de: 'Jasmin' },
  { it: 'spezie', en: 'spices', th: 'เครื่องเทศ', de: 'Gewürze' },
  { it: 'rovere', en: 'oak', th: 'ไม้โอ๊ค', de: 'Eiche' },
  { it: 'vaniglia', en: 'vanilla', th: 'วานิลลา', de: 'Vanille' },
  { it: 'cacao', en: 'cocoa', th: 'โกโก้', de: 'Kakao' },
  { it: 'cioccolato', en: 'chocolate', th: 'ช็อกโกแลต', de: 'Schokolade' },

  // Textures / Sensations
  { it: 'fresco', en: 'fresh', th: 'สดชื่น', de: 'frisch' },
  { it: 'fresca', en: 'fresh', th: 'สดชื่น', de: 'frisch' },
  { it: 'minerale', en: 'mineral', th: 'มิเนอรัล', de: 'mineralisch' },
  { it: 'armonioso', en: 'harmonious', th: 'กลมกล่อม', de: 'harmonisch' },
  { it: 'persistente', en: 'lingering', th: 'ยาวนาน', de: 'langanhaltend' },
  { it: 'vellutato', en: 'velvety', th: 'นุ่มละมุน', de: 'samtig' },
  { it: 'corposo', en: 'full-bodied', th: 'ฟูลบอดี้', de: 'vollmundig' },
  { it: 'secco', en: 'dry', th: 'ดราย', de: 'trocken' },
  { it: 'intenso', en: 'intense', th: 'เข้มข้น', de: 'intensiv' },
  { it: 'raffinato', en: 'refined', th: 'ประณีต', de: 'raffiniert' },
  { it: 'elegante', en: 'elegant', th: 'สง่างาม', de: 'elegant' },
  { it: 'tannini morbidi', en: 'smooth tannins', th: 'แทนนินนุ่ม', de: 'weiche Tannine' },
  { it: 'perlage finissimo', en: 'fine bubbles', th: 'ฟองละเอียดนุ่ม', de: 'feine Perlage' },

  // Pairings
  { it: 'pizza cotta nel forno a legna', en: 'wood-fired artisanal pizza', th: 'พิซซ่าเตาถ่านแป้งสด', de: 'Holzofen-Pizza' },
  { it: 'pizza', en: 'pizza', th: 'พิซซ่า', de: 'Pizza' },
  { it: 'pasta al ragù', en: 'pasta bolognese', th: 'พาสต้าซอสเนื้อ', de: 'Pasta Bolognese' },
  { it: 'carni alla griglia', en: 'grilled meats', th: 'เนื้อย่าง', de: 'gegrilltes Fleisch' },
  { it: 'formaggi stagionati', en: 'aged cheeses', th: 'ชีสบ่ม', de: 'gereifter Käse' },
  { it: 'frutti di mare', en: 'fresh seafood', th: 'อาหารทะเลสด', de: 'Meeresfrüchte' },
  { it: 'insalate', en: 'salads', th: 'สลัดสด', de: 'Salate' },
  { it: 'aperitivo', en: 'aperitif', th: 'เครื่องดื่มเรียกน้ำย่อย', de: 'Aperitif' },
  { it: 'brindisi al tramonto', en: 'sunset toasts', th: 'จิบฉลองยามพระอาทิตย์ตก', de: 'Anstoßen zum Sonnenuntergang' }
];

export function translateWineDescription(
  text: string,
  fromLang: WineLang,
  toLang: WineLang
): string {
  if (!text || fromLang === toLang) return text;

  const trimmed = text.trim();

  // 1. Check if it matches any standard sommelier pattern
  for (const pattern of SOMMELIER_PATTERNS) {
    const sourceText = fromLang === 'IT' ? pattern.it : fromLang === 'EN' ? pattern.en : fromLang === 'TH' ? pattern.th : pattern.de;
    if (trimmed.toLowerCase() === sourceText.toLowerCase()) {
      return toLang === 'IT' ? pattern.it : toLang === 'EN' ? pattern.en : toLang === 'TH' ? pattern.th : pattern.de;
    }
  }

  // 2. Dynamic term-by-term intelligent translation for custom wines
  let result = text;
  for (const term of SOMMELIER_TERMS) {
    const fromVal = fromLang === 'IT' ? term.it : fromLang === 'EN' ? term.en : fromLang === 'TH' ? term.th : term.de;
    const toVal = toLang === 'IT' ? term.it : toLang === 'EN' ? term.en : toLang === 'TH' ? term.th : term.de;
    
    if (fromVal && toVal) {
      const regex = new RegExp(fromVal, 'gi');
      result = result.replace(regex, toVal);
    }
  }

  return result;
}

// ── 7. COMPLETE WINE CARD TRANSLATION ACROSS ALL 4 LANGUAGES ─────────────
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
  titleDe: string;
  categorySubtitle: string;
  subtitleIt: string;
  subtitleEn: string;
  subtitleTh: string;
  subtitleDe: string;
  descriptionIt: string;
  descriptionEn: string;
  descriptionTh: string;
  descriptionDe: string;
} {
  const { sourceLang, vigna, dettagli, brand, wineType, origin, description } = params;

  const langs: WineLang[] = ['IT', 'EN', 'TH', 'DE'];
  const titles: Record<WineLang, string> = { IT: '', EN: '', TH: '', DE: '' };
  const subtitles: Record<WineLang, string> = { IT: '', EN: '', TH: '', DE: '' };
  const descriptions: Record<WineLang, string> = { IT: '', EN: '', TH: '', DE: '' };

  for (const l of langs) {
    if (l === sourceLang) {
      // Keep source language completely intact
      const tLines = [vigna, dettagli, brand].filter(Boolean);
      titles[l] = tLines.join('\n');

      const sLines = [wineType, origin].filter(Boolean);
      subtitles[l] = sLines.join('\n');

      descriptions[l] = description;
    } else {
      // Translate Wine Type & Origin
      const transType = translateWineType(wineType, l);
      const transOrigin = translateWineOrigin(origin, l);
      const subLines = [transType, transOrigin].filter(Boolean);
      subtitles[l] = subLines.join('\n');

      // Titles: Keep Denomination/Brand, Translate Type/Doc words if present
      const transDettagli = translateWineType(dettagli, l) !== dettagli.toUpperCase() 
        ? translateWineType(dettagli, l) 
        : dettagli;

      const titleLines = [vigna, transDettagli, brand].filter(Boolean);
      titles[l] = titleLines.join('\n');

      // Translate Description
      descriptions[l] = translateWineDescription(description, sourceLang, l);
    }
  }

  return {
    title: titles,
    titleIt: titles.IT,
    titleEn: titles.EN,
    titleTh: titles.TH,
    titleDe: titles.DE,
    categorySubtitle: subtitles.EN || subtitles[sourceLang],
    subtitleIt: subtitles.IT,
    subtitleEn: subtitles.EN,
    subtitleTh: subtitles.TH,
    subtitleDe: subtitles.DE,
    descriptionIt: descriptions.IT,
    descriptionEn: descriptions.EN,
    descriptionTh: descriptions.TH,
    descriptionDe: descriptions.DE
  };
}
