/**
 * AutoCut Post Copywriter Engine
 * Generatore automatico e biculturale di testi social per Pizzeria Ranong e Villaggio Koh Phayam.
 * Gestisce in totale autonomia contenuti multilingua, proverbi contestuali,
 * e hashtag intelligenti e virali (Thai + Inglesi) raccolti in UN UNICO BLOCCO ALLA FINE DEL POST,
 * mai tra una traduzione e l'altra (Regola 16).
 */

import { AutoCutTestRun } from './autoCutLabEngine';
import { findAccommodationIdentity } from '../../booking/resort/config/accommodations';

export interface PostCopyResult {
  brand: 'pizza' | 'village';
  mode: string;
  seasonContext: string;
  thaiContent: string;
  englishContent: string;
  italianContent: string;
  thaiHashtags: string[];
  englishHashtags: string[];
  fixedLink: string;
  crossTag: string;
  fullCaptionInstagram: string;
  fullCaptionTikTok: string;
  proverbThai: string;
  proverbEnglish: string;
  proverbItalian: string;
}

// Database Proverbi Thai & Equivalenti Internazionali per Food & Pizzeria
const PIZZA_PROVERBS = [
  {
    thai: 'สิบปากว่าไม่เท่าตาเห็น สิบตาเห็นไม่เท่าได้ลองชิม',
    en: 'Hearing it ten times is not like seeing it once, but tasting it once beats seeing it a hundred times.',
    it: 'Sentirlo dire dieci volte non vale come vederlo una volta, ma assaggiarlo una volta batte vederlo cento volte.'
  },
  {
    thai: 'น้ำขึ้นให้รีบตัก ความอร่อยมาร้อนๆ ให้รีบกิน',
    en: 'Strike while the iron is hot, and eat your pizza while the crust is fresh and crispy.',
    it: 'Quando la marea sale cogli l’occasione, e mangia la pizza finché il cornicione è caldo e croccante.'
  },
  {
    thai: 'ช้าๆ ได้พร้าเล่มงาม เหมือนแป้งพิซซ่าที่ต้องหมักอย่างใจเย็น',
    en: 'Slow and steady wins the race, just like slow-fermented Italian dough made with patience.',
    it: 'La pazienza porta al miglior risultato, proprio come il nostro impasto a lunga lievitazione.'
  },
  {
    thai: 'กินคาวไม่กินหวาน สันดานไพร่ ปิดท้ายมื้อด้วยของหวานสไตล์อิตาเลียนแท้',
    en: 'A savory meal without dessert is an unfinished journey; finish in style with real Italian sweets.',
    it: 'Mangiare il salato senza il dolce è lasciare l’opera a metà; concludi sempre con un vero dessert italiano.'
  },
  {
    thai: 'ความสุขที่แท้จริง อยู่ในทุกคำที่แบ่งปัน',
    en: 'True happiness is found in every bite you share with good friends.',
    it: 'La vera felicità si trova in ogni boccone condiviso con buoni amici.'
  },
  {
    thai: 'เข้าเมืองตาหลิ่ว ต้องหลิ่วตาตาม แต่เรื่องพิซซ่าต้องสูตรต้นตำรับอิตาลีเท่านั้น',
    en: 'When in Rome do as the Romans do, and when in Ranong eat pizza like a real Italian.',
    it: 'Paese che vai usanza che trovi, ma per la pizza segui sempre l’autentica tradizione italiana.'
  }
];

// Database Proverbi Thai & Equivalenti per Koh Phayam Resort & Relax
const VILLAGE_PROVERBS = [
  {
    thai: 'พักผ่อนเอาแรง วันนี้เหนื่อย พรุ่งนี้ค่อยลุยใหม่',
    en: 'Rest and recharge today, because tomorrow deserves your brightest energy.',
    it: 'Riposati e ricarica le energie oggi, perché il domani merita la tua luce migliore.'
  },
  {
    thai: 'นกทำรังแต่พอตัว สุขใจในบังกะโลไม้ใต้ร่มเงาสวนเอเดน',
    en: 'Birds build nests that fit their needs; find true peace in a wooden bungalow nestled in our tropical Eden.',
    it: 'L’uccello fa il nido a sua misura; trova la vera pace in un bungalow in legno immerso nel nostro Eden tropicale.'
  },
  {
    thai: 'อยู่อย่างเรียบง่าย สุขสบายอย่างแท้จริง',
    en: 'Simple living brings the deepest peace of mind.',
    it: 'Vivere con semplicità regala la serenità più autentica e profonda.'
  },
  {
    thai: 'ระยะทางพิสูจน์ม้า กาลเวลาพิสูจน์ความสงบของเกาะพยาม',
    en: 'Distance tests a horse’s strength, and island time reveals the magic of Koh Phayam.',
    it: 'La distanza mette alla prova il cavallo, e il tempo dell’isola svela la magia di Koh Phayam.'
  },
  {
    thai: 'ความสุขไม่ได้อยู่ที่จุดหมาย แต่อยู่ที่ความร่มรื่นบนเปลญวนใต้ร่มไม้',
    en: 'Happiness is not just a destination; it is pure relaxation in a hammock beneath tropical palms.',
    it: 'La felicità non è una meta, è il totale relax sull’amaca all’ombra delle palme tropicali.'
  }
];

// Riconoscimento Stagionalità & Meteo di Ranong / Koh Phayam
export function getCurrentSeasonContext(): { season: 'high' | 'green'; monthName: string; festiveNotice: string } {
  const now = new Date();
  const month = now.getMonth();
  const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

  let season: 'high' | 'green' = 'high';
  if (month >= 4 && month <= 9) {
    season = 'green';
  }

  let festiveNotice = '';
  if (month === 3) festiveNotice = '💦 Stagione del Songkran (Capodanno Thai)';
  else if (month === 10) festiveNotice = '🪔 Notte di Loi Krathong e Festival delle Lanterne';
  else if (month === 11) festiveNotice = '🎄 Atmosfera Festiva di Natale e Fine Anno';
  else if (month === 0) festiveNotice = '✨ Inizio Nuovo Anno e Clima Tropicale Perfetto';
  else if (month === 1) festiveNotice = '💖 Mese di San Valentino e Cene Romantiche';
  else if (season === 'green') festiveNotice = '🌿 Green Season: Rilassanti Terme calde a Ranong & Quiete a Phayam';
  else festiveNotice = '☀️ Alta Stagione Tropicale: Mare Cristallino & Serate Stellari';

  return {
    season,
    monthName: monthNames[month],
    festiveNotice
  };
}

/**
 * 🚩 Regola 17: ogni blocco lingua inizia con la propria bandiera (🇹🇭 Thai, 🇬🇧 Inglese),
 * prima della prima lettera. Rimuove eventuali bandiere iniziali errate/duplicate e antepone quella giusta.
 */

/**
 * 🔠 REGOLA 26: Convertitore universale Sans-Serif Bold Unicode (A-Z, a-z, 0-9).
 * Trasforma il testo alfabetico in caratteri matematici grassetto (𝗔-𝗭, 𝗮-𝘇, 𝟬-𝟵).
 * Preserva al 100% bandiere (🇹🇭, 🇬🇧), emoji, punteggiatura e caratteri thailandesi.
 */
export function toUnicodeBold(str: string): string {
  if (!str) return '';
  return str.split('').map(char => {
    const code = char.codePointAt(0) || 0;
    if (code >= 0x41 && code <= 0x5a) {
      return String.fromCodePoint(0x1d5d4 + (code - 0x41));
    }
    if (code >= 0x61 && code <= 0x7a) {
      return String.fromCodePoint(0x1d5ee + (code - 0x61));
    }
    if (code >= 0x30 && code <= 0x39) {
      return String.fromCodePoint(0x1d7ec + (code - 0x30));
    }
    return char;
  }).join('');
}

/**
 * 🎯 REGOLA 26: Applica il grassetto Unicode alla sola prima riga (Hook di testa) del post.
 * Garantisce massima visibilità come Titolo nei feed social senza innescare i bug dell'editor di Facebook.
 */
export function applyUnicodeBoldHook(text: string): string {
  if (!text) return '';
  const lines = text.split(/\r?\n/);
  if (lines.length === 0) return '';
  const firstLine = lines[0];
  const flagMatch = firstLine.match(/^(\s*(?:[\u{1F1E6}-\u{1F1FF}]{2}\s*)+)(.*)$/u);
  if (flagMatch) {
    lines[0] = flagMatch[1] + toUnicodeBold(flagMatch[2]);
  } else {
    lines[0] = toUnicodeBold(firstLine);
  }
  return lines.join('\n');
}

/**
 * ▫️ REGOLA 26: Sanitizzazione Bullet Points per Social Media.
 * Sostituisce categoricamente i pallini di sistema (•) e trattini lista (-) con l'emoji geometrica ▫️
 * azzerando al 100% qualsiasi tentativo dell'editor di Facebook di interpretare liste HTML e re-indicizzare i blocchi in coda.
 */
export function sanitizeSocialBullets(text: string): string {
  if (!text) return '';
  return text
    .replace(/^([ \t]*)•[ \t]*/gm, '$1▫️ ')
    .replace(/^([ \t]*)-[ \t]+(?=[A-Z0-9\u0E00-\u0E7F])/gm, '$1▫️ ');
}

export function ensureLangFlag(text: string, lang: 'th' | 'en'): string {
  const flag = lang === 'th' ? '🇹🇭' : '🇬🇧';
  const cleaned = (text || '').replace(/^\s*(?:[\u{1F1E6}-\u{1F1FF}]{2}\s*)+/u, '').trimStart();
  return `${flag} ${cleaned}`;
}

/**
 * 🏷️ Helper che converte qualsiasi stringa in un hashtag valido (PascalCase per latino, senza spazi per Thai)
 */
function toCleanHashtag(str: string): string {
  if (!str) return '';
  const clean = str.trim();
  // Se contiene caratteri thailandesi
  if (/[\u0E00-\u0E7F]/.test(clean)) {
    const thaiWords = clean.replace(/[^\u0E00-\u0E7F0-9]/g, '');
    return thaiWords.length > 1 ? `#${thaiWords.slice(0, 20)}` : '';
  }
  // Se è testo in lettere occidentali
  const words = clean
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3) // max 3 parole per brevità ed eleganza
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  return words.length > 0 ? `#${words.join('')}` : '';
}

/**
 * 🎯 Generatore di Hashtag Intelligenti e Virali (Nativi per Lingua)
 * Include SEMPRE il cibo o gli alloggi che stiamo effettivamente mostrando nel filmato!
 */
function getSmartViralHashtags(
  brand: 'pizza' | 'village',
  categoryName: string,
  scenes: AutoCutTestRun['scenes']
): { thai: string[]; english: string[] } {
  const cat = (categoryName || '').toLowerCase();

  // Estrai hashtag specifici del cibo / alloggio mostrato in video
  const dishTagsThai: string[] = [];
  const dishTagsEn: string[] = [];

  scenes.forEach(s => {
    // Tag cibo specifico in Thai (dalla prima riga Thai)
    if (s.titlePrimary) {
      // Isola il nome del piatto prima di eventuali parentesi
      const rawName = s.titlePrimary.split('(')[0].trim();
      const tagTh = toCleanHashtag(rawName);
      if (tagTh && !dishTagsThai.includes(tagTh) && dishTagsThai.length < 3) {
        dishTagsThai.push(tagTh);
      }
    }
    // Tag cibo specifico in Inglese (dalla seconda riga Inglese o sourceName)
    const enName = s.sourceName || s.titleSecondary || s.lodgingTitle || '';
    if (enName) {
      const rawEn = enName.split('(')[0].trim();
      const tagEn = toCleanHashtag(rawEn);
      if (tagEn && !dishTagsEn.includes(tagEn) && dishTagsEn.length < 3) {
        dishTagsEn.push(tagEn);
      }
    }
  });

  if (brand === 'pizza') {
    let specificThaiCat = '#ของกินระนอง';
    let specificEnCat = '#RanongFoodie';

    if (cat.includes('pasta')) {
      specificThaiCat = '#พาสต้าเส้นสด';
      specificEnCat = '#FreshPasta';
    } else if (cat.includes('dessert') || cat.includes('dolc')) {
      specificThaiCat = '#ของหวานอิตาเลียน';
      specificEnCat = '#ItalianDessert';
    } else if (cat.includes('salad') || cat.includes('insalat')) {
      specificThaiCat = '#สลัดเพื่อสุขภาพ';
      specificEnCat = '#FreshSalad';
    } else if (cat.includes('sandwich') || cat.includes('focaccia')) {
      specificThaiCat = '#ฟอคคาชช่า';
      specificEnCat = '#ArtisanFocaccia';
    } else {
      specificThaiCat = '#พิซซ่าระนอง';
      specificEnCat = '#AuthenticPizza';
    }

    // Unisce: Tag Piatto specifico mostrato + Categoria + Tag Virali di Ranong
    const thaiList = [
      '#FlowerPowerPizza',
      ...dishTagsThai,
      specificThaiCat,
      '#อร่อยบอกต่อ',
      '#ระนอง'
    ];

    const enList = [
      '#FlowerPowerPizza',
      ...dishTagsEn,
      specificEnCat,
      '#ThailandEats',
      '#Ranong'
    ];

    // Rimuove duplicati conservando l'ordine
    return {
      thai: Array.from(new Set(thaiList)),
      english: Array.from(new Set(enList))
    };
  }

  // Brand Village
  const thaiList = [
    '#FlowerPowerVillage',
    ...dishTagsThai,
    '#เกาะพยาม',
    '#อ่าวเขาควาย',
    '#ที่พักเกาะพยาม'
  ];

  const enList = [
    '#FlowerPowerVillage',
    ...dishTagsEn,
    '#KohPhayam',
    '#BuffaloBay',
    '#IslandLifeThailand'
  ];

  return {
    thai: Array.from(new Set(thaiList)),
    english: Array.from(new Set(enList))
  };
}

/**
 * Genera il post copy con hashtag integrati DIRETTAMENTE nel testo
 */
export function generatePostCopy(
  testRun: AutoCutTestRun,
  proverbIndexSeed: number = 0
): PostCopyResult {
  const isPizza = testRun.brand === 'pizza';
  const seasonCtx = getCurrentSeasonContext();
  // 🛡️ REGOLA IMMODIFICABILE 15: Nel testo del post, il nome del piatto o dell'alloggio NON deve MAI andare a capo.
  // Anche se nel video si va a capo per ragioni cinematiche/grafiche, nel post è una locuzione unica continua su singola riga.
  const cleanInlineTitle = (raw: string | undefined | null): string => {
    if (!raw) return '';
    return raw
      .replace(/[\r\n]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  };

  const primaryScene = testRun.scenes[0];
  const dishOrRoomName = cleanInlineTitle(primaryScene ? primaryScene.titlePrimary : (isPizza ? 'Specialità Italiana' : 'Bungalow nel Verde'));
  const secondaryName = cleanInlineTitle(primaryScene ? primaryScene.titleSecondary : '');
  const categoryName = cleanInlineTitle(primaryScene?.badgeCategory || '');

  // 1. Proverbio
  const proverbList = isPizza ? PIZZA_PROVERBS : VILLAGE_PROVERBS;
  const proverb = proverbList[Math.abs(proverbIndexSeed) % proverbList.length];

  // 2. Hashtag intelligenti e virali nativi (inclusi i piatti specifici mostrati in video)
  const smartTags = getSmartViralHashtags(testRun.brand, categoryName, testRun.scenes);

  // 3. Chiusure promozionali con link
  const pizzaClosures = [
    {
      th: 'สั่งง่ายๆ ผ่าน www.flowerpowerpizza.com รับส่วนลดพิเศษ 10% สำหรับการสั่งซื้อครั้งแรกครับ!',
      en: 'Order directly on www.flowerpowerpizza.com to unlock your 10% discount on your first order!',
      it: 'Ordina comodamente su www.flowerpowerpizza.com per ricevere il 10% di sconto sul tuo primo ordine!'
    },
    {
      th: 'รับสิทธิพิเศษลด 10% ทันทีเมื่อสั่งอาหารครั้งแรกผ่าน www.flowerpowerpizza.com ส่งตรงถึงบ้านในกล่องเก็บความร้อนครับ!',
      en: 'Enjoy 10% off your very first order at www.flowerpowerpizza.com, delivered piping hot in thermal boxes!',
      it: 'Goditi il 10% di sconto sul primo ordine da www.flowerpowerpizza.com, consegnato caldissimo a casa!'
    },
    {
      th: 'จองโต๊ะหรือสั่งเดลิเวอรี่ผ่านเว็บ www.flowerpowerpizza.com รับทันทีส่วนลด 10% ต้อนรับคุณลูกค้าครับ!',
      en: 'Book your table or order delivery at www.flowerpowerpizza.com for an instant 10% first-order discount!',
      it: 'Prenota il tuo tavolo o ordina la consegna su www.flowerpowerpizza.com con lo sconto benvenuto del 10%!'
    }
  ];

  const villageClosures = [
    {
      th: 'จองตรงกับเราวันนี้ที่ www.flowerpowervillage.com รับราคาดีที่สุดเสมอ พร้อมส่วนลดพิเศษ 10% สำหรับการจองตรงครับ!',
      en: 'Book direct at www.flowerpowervillage.com for the guaranteed best rate and 10% direct booking privilege!',
      it: 'Prenota direttamente su www.flowerpowervillage.com per la tariffa migliore garantita e il privilegio del 10%!'
    },
    {
      th: 'พักผ่อนท่ามกลางธรรมชาติอ่าวเขาควาย เกาะพยาม จองตรงผ่าน www.flowerpowervillage.com ราคาคุ้มค่าที่สุดครับ!',
      en: 'Unwind amidst the nature of Buffalo Bay, Koh Phayam. Book directly at www.flowerpowervillage.com for the best experience!',
      it: 'Rilassati nella natura di Buffalo Bay a Koh Phayam. Prenota direttamente su www.flowerpowervillage.com!'
    }
  ];

  const closure = isPizza 
    ? pizzaClosures[Math.abs(proverbIndexSeed) % pizzaClosures.length]
    : villageClosures[Math.abs(proverbIndexSeed) % villageClosures.length];

  // 4. Elaborazione Testi Multilingua con Hashtag Integrati nel Testo
  let thaiContent = '';
  let englishContent = '';
  let italianContent = '';
  let fixedLink = '';
  let crossTag = '';

  if (isPizza) {
    // 🍕 PIZZERIA RANONG
    const cleanEnProverb = proverb.en.replace(/["']/g, '');

    if (testRun.mode === 'DS') {
      // ⚡ DS DAILY SPECIAL: Enfatizza piatto fresco del giorno, preparato oggi e in pronta consegna
      thaiContent = `🇹🇭 สดใหม่จากเตา Flower Power Pizza ระนอง วันนี้! เมนูพิเศษ Daily Special มาแล้วครับ ⚡️🍕✨

เมนูเด็ดประจำวัน:
${dishOrRoomName} ${secondaryName ? `(${secondaryName})` : ''}
ปรุงสดใหม่จากครัวร้อนๆ หอมกรุ่นด้วยวัตถุดิบคุณภาพ คัดสรรมาเป็นพิเศษเฉพาะวันนี้เท่านั้น พร้อมส่งทันที ฟินสุดๆ เลยครับ 😋🔥

โบราณว่าไว้: "${proverb.thai}"
เมนูพิเศษสดใหม่แบบนี้ มีจำนวนจำกัดเฉพาะวันนี้เท่านั้น อย่ารอช้า สั่งทานกันร้อนๆ เลยนะครับ!

🛵 พร้อมส่งทันทีถึงบ้าน สั่งง่ายๆ ผ่าน www.flowerpowerpizza.com
รับส่วนลดพิเศษ 10% สำหรับการสั่งซื้อครั้งแรกทันทีครับ! 💨`;

      englishContent = `🇬🇧 Fresh out of the oven at Flower Power Pizza Ranong today! Chef's Daily Special is ready ⚡️🍕✨

Today's Special:
${secondaryName || dishOrRoomName}
Freshly prepared in our kitchen with premium ingredients, cooked to perfection and ready for immediate delivery! 😋🔥

As the wise saying goes: ${cleanEnProverb}
Fresh daily specials sell out fast! Treat yourself to today's exclusive culinary delight right now. 🤙

🛵 Ready for immediate delivery! Order on www.flowerpowerpizza.com
Enjoy your 10% first-order welcome discount! 💨`;

      italianContent = `🇮🇹 Appena sfornato dalla cucina! Il Fuori Menu Daily Special di oggi ⚡️🍕✨

Specialità Fresca del Giorno:
${dishOrRoomName}
Preparato fresco oggi con ingredienti selezionati, fragrante e pronto in pronta consegna calda a Ranong! 😋🔥

Un saggio proverbio ricorda: "${proverb.it}"
Un piatto fresco del giorno va gustato subito: porzioni limitate solo per oggi!

🛵 Pronta consegna veloce su www.flowerpowerpizza.com
Approfitta del 10% di sconto sul tuo primo ordine! 💨`;

    } else {
      // 🍕 P1, P2, P3: Testo Standard Pizzeria con Ganci Multipli Dinamici
      const pizzaThaiHooks = [
        '🇹🇭 สวัสดีครับทุกคน! ที่ Flower Power Pizza ระนอง วันนี้พาความอร่อยมารายงานตัวครับ 🍕✨',
        '🇹🇭 กลิ่นเตาอบหอมฟุ้งจาก Flower Power Pizza ระนอง วันนี้ขอเสิร์ฟเมนูสุดพิเศษ 🍕🔥',
        '🇹🇭 สายกินห้ามพลาด! เมนูอิตาเลียนแท้ๆ ทำสดใหม่ที่ Flower Power Pizza ระนอง พร้อมเสิร์ฟครับ 🇮🇹✨',
        '🇹🇭 ใครกำลังมองหาของอร่อยมื้อนี้ Flower Power Pizza ระนอง ยกความอร่อยส่งตรงถึงหน้าบ้านเลยครับ! 🛵💨'
      ];

      const pizzaEnHooks = [
        '🇬🇧 Hey food lovers! Fresh from Flower Power Pizza in Ranong today 🍕✨',
        '🇬🇧 Authentic Italian pizza 🍕 baked to perfection at Flower Power Pizza Ranong 🔥',
        '🇬🇧 Craving real Italian flavor? Flower Power Pizza Ranong prepares 48h slow-fermented dough! 🇮🇹✨',
        '🇬🇧 Straight from Flower Power Pizza kitchen to your table 🛵💨 in Ranong!'
      ];

      const pizzaItHooks = [
        '🇮🇹 Ciao a tutti! Direttamente dal nostro forno 🍕 a Ranong ✨',
        '🇮🇹 Profumo inconfondibile 🍕 di autentica pizza italiana oggi a Ranong 🔥',
        '🇮🇹 Per chi ama i sapori veri: impasto artigianale lievitato 48 ore! 🇮🇹✨',
        '🇮🇹 Dalla nostra cucina italiana direttamente a casa tua caldissimo! 🛵💨'
      ];

      const pIdx = Math.abs(proverbIndexSeed) % pizzaThaiHooks.length;

      thaiContent = `${pizzaThaiHooks[pIdx]}

เมนูเด็ดวันนี้:
${dishOrRoomName} ${secondaryName ? `(${secondaryName})` : ''}
หอมกรุ่นจากเตา แป้งกรอบนอกนุ่มในสไตล์อิตาเลียนแท้ๆ อบด้วยความใส่ใจทุกถาด ฟินสุดๆ เลยครับ 😋🔥

โบราณว่าไว้: "${proverb.thai}"
ความอร่อยไม่เคยรอใคร อย่าปล่อยให้ความหิวรอนาน มาเติมเต็มความสุขกันนะครับ!

🎁 สั่งง่ายๆ ผ่าน www.flowerpowerpizza.com
รับส่วนลดพิเศษ 10% สำหรับการสั่งซื้อครั้งแรกทันทีครับ! 🛵💨`;

      englishContent = `${pizzaEnHooks[pIdx]}

On the table:
${secondaryName || dishOrRoomName}
Crispy crust, slow-fermented dough and 100% authentic Italian ingredients made with real passion! 😋🔥

As the wise saying goes: ${cleanEnProverb}
Good food is meant to be shared with good vibes. Treat yourself and your friends today! 🤙

🎁 Order directly on www.flowerpowerpizza.com
Enjoy your 10% first-order welcome discount! 🛵💨`;

      italianContent = `${pizzaItHooks[pIdx]}

Protagonista di oggi:
${dishOrRoomName}
Cornicione croccante e fragrante, cotto a puntino con ingredienti genuini e tanta passione italiana! 😋🔥

Un saggio proverbio ricorda: "${proverb.it}"
La buona tavola non aspetta: regalatevi un momento di autentica bontà a Ranong!

🎁 Ordina comodamente su www.flowerpowerpizza.com
Approfitta subito del 10% di sconto sul tuo primo ordine! 🛵💨`;
    }

    fixedLink = `🍕 FLOWER POWER PIZZA🌸 - Ranong Hotspring\n📍 Google Maps: https://maps.app.goo.gl/qjpYt6t69y17R4DF6\n🌐 www.flowerpowerpizza.com`;
    crossTag = `@flowerpowerphayam`;

  } else if (testRun.mode === 'R1') {
    // 🍽️ R1: RESTAURANT & DELIVERY A KOH PHAYAM (BUFFALO BAY) - TOUR CORALE 5 PIATTI
    const cleanEnProverb = proverb.en.replace(/["']/g, '');

    const uniqueDishes = testRun.scenes
      .map(s => ({
        nameEn: cleanInlineTitle(s.sourceName || s.titlePrimary || ''),
        nameTh: cleanInlineTitle(s.titleSecondary || ''),
        cat: cleanInlineTitle(s.badgeCategory || '')
      }))
      .filter((d, idx, arr) => d.nameEn && arr.findIndex(x => x.nameEn === d.nameEn) === idx);

    const dishesThList = uniqueDishes.map(d => `▫️ ${d.nameTh || d.nameEn}`).join('\n');
    const dishesEnList = uniqueDishes.map(d => `▫️ ${d.nameEn}`).join('\n');

    const r1ThHooks = [
      '🇹🇭 หิวอาหารอิตาเลียนแท้ๆ บนเกาะพยามใช่ไหมครับ? ครัว Flower Power พร้อมเสิร์ฟความอร่อยครบเครื่อง 🍝🍕 สดใหม่ครับ!',
      '🇹🇭 กลิ่นอาหารอิตาเลียนหอมฟุ้ง ริมอ่าวเขาควาย 🌿 เกาะพยาม! แวะมาทานของอร่อยหลากหลายเมนูกันครับ 🔥',
      '🇹🇭 มื้อพิเศษบนเกาะพยาม! พาสต้าเส้นสด 🍝 พิซซ่าอิตาเลียนแท้ๆ 🍕 และอาหารจานเด็ด รสชาติต้นตำรับ 🇮🇹🌴',
      '🇹🇭 วันนี้ครัว Flower Power เกาะพยาม พร้อมเสิร์ฟทั้งนั่งทานในสวน 🌿 และส่งเดลิเวอรี่ถึงที่พักครับ 🛵✨'
    ];

    const r1EnHooks = [
      '🇬🇧 Craving authentic Italian food on Koh Phayam? Flower Power Restaurant & Village 🍝🍕 is cooking for you!',
      '🇬🇧 Freshly cooked Italian specialties at Flower Power Restaurant & Village, Buffalo Bay, Koh Phayam 🌴🔥',
      '🇬🇧 Handmade pasta 🍝 and artisan pizza 🍕 at Flower Power Restaurant on Koh Phayam island 🇮🇹🥥',
      '🇬🇧 Dine in lush tropical gardens at Flower Power Restaurant & Village or get delivery on Koh Phayam 🛵✨'
    ];

    const rIdx = Math.abs(proverbIndexSeed) % r1EnHooks.length;

    thaiContent = `${r1ThHooks[rIdx]}

🍽️ เมนูเด็ดในคลิปวันนี้:
${dishesThList}

ไม่ว่าจะพาสต้าเส้นสด พิซซ่าอิตาเลียนแท้ หรือเมนูจานโปรด ปรุงสดใหม่จานต่อจานโดยใช้วัตถุดิบนำเข้าและวัตถุดิบสดจากธรรมชาติ รสชาติอิตาเลียนแท้ๆ ทานแล้วฟินแน่นอนครับ! 😋🔥

โบราณว่าไว้: "${proverb.thai}"
มื้ออร่อยสร้างความสุขได้เสมอ แวะมาทานที่ร้านท่ามกลางสวนธรรมชาติ หรือสั่งเดลิเวอรี่ส่งตรงถึงที่พักบนเกาะพยามได้เลยครับ!

🛵 บริการส่งเดลิเวอรี่บนเกาะพยาม สั่งง่ายๆ ผ่าน WhatsApp:
✆ WhatsApp: +66 095 882 5573
🌐 ข้อมูลและที่พัก: www.flowerpowervillage.com`;

    englishContent = `${r1EnHooks[rIdx]}

🍽️ Featured in today's video:
${dishesEnList}

From handmade pasta to authentic 12" Italian pizzas and savory island favorites, cooked from scratch with premium ingredients and genuine Italian passion right here in Buffalo Bay! 😋🔥

As the wise proverb says: ${cleanEnProverb}
Good food shared in paradise creates unforgettable memories. Treat yourself to real Italian taste on Koh Phayam! 🤙

🛵 Island Delivery on Koh Phayam — order via WhatsApp:
✆ WhatsApp: +66 095 882 5573
🌐 Resort & Dining: www.flowerpowervillage.com`;

    italianContent = `🇮🇹 Voglia di vera cucina italiana a Koh Phayam? Il ristorante Flower Power è aperto! 🍝🍕✨

🍽️ Piatti protagonisti nel video di oggi:
${dishesEnList}

Pasta fresca fatta a mano, pizze e specialità italiane autentiche a Buffalo Bay! 😋🔥

Un saggio proverbio ricorda: "${proverb.it}"
La buona cucina italiana nel cuore dell'isola di Koh Phayam!

🛵 Consegna a domicilio sull'isola tramite WhatsApp: +66 095 882 5573
🌐 www.flowerpowervillage.com`;

    fixedLink = `🌺 FLOWER POWER RESTAURANT & RESORT 🌸 - Buffalo Bay, Koh Phayam\n📍 WhatsApp Delivery: +66 095 882 5573\n🌐 www.flowerpowervillage.com`;
    crossTag = `@flowerpowerphayam`;

  } else if (testRun.mode === 'LM1') {
    // 🔥 LM1: STORIES LAST MINUTE KOH PHAYAM (ALLOGGI LIBERI OGGI, TARIFFE ONLINE ➔ SCONTO DIRETTO -10%)
    const cleanEnProverb = proverb.en.replace(/["']/g, '');

    const simplifyLodgingName = (name: string): string => {
      return (name || '')
        .replace(/\b(Breezy Suite|Breezy|Suite|Sweet|Tropical Garden View|Tropical Garden|Garden View|Eco-Glamping Sanctuary|Eco-Glamping|Glamping Sanctuary|Glamping|Sanctuary|Panoramic Terrace|Panoramic)\b/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
    };

    const lm1ThRooms = testRun.scenes.map(s => {
      const rawName = cleanInlineTitle(s.titleSecondary || s.titlePrimary);
      const name = simplifyLodgingName(rawName);
      const basePrice = s.priceValue || 0;
      const directPrice = basePrice ? Math.round(basePrice * 0.90) : 0;
      const priceText = basePrice
        ? `: ${basePrice}฿ ➔ ${directPrice}฿ (-10%)`
        : '';
      return `▫️ ${name}${priceText}`;
    }).join('\n');

    const lm1EnRooms = testRun.scenes.map(s => {
      const rawName = cleanInlineTitle(s.titlePrimary);
      const name = simplifyLodgingName(rawName);
      const basePrice = s.priceValue || 0;
      const directPrice = basePrice ? Math.round(basePrice * 0.90) : 0;
      const priceText = basePrice
        ? `: ${basePrice}฿ ➔ ${directPrice}฿ (-10%)`
        : '';
      return `▫️ ${name}${priceText}`;
    }).join('\n');

    const lm1ThHooks = [
      '🇹🇭 ด่วนสุดๆ! ห้องว่าง Last Minute คืนนี้ที่ Flower Power Village อ่าวเขาควาย เกาะพยาม 🌴🔥✨',
      '🇹🇭 ใครอยากพักผ่อนกะทันหัน คืนนี้ที่ Flower Power Village เรายังมีห้องว่างราคาพิเศษครับ 🌴✨',
      '🇹🇭 หนีความวุ่นวายมาพักผ่อนท่ามกลางสวนทรอปิคอลที่ Flower Power Village เกาะพยาม เช็กห้องว่างราคาดีที่สุดได้เลยครับ 🥥🍃✨'
    ];

    const lm1EnHooks = [
      '🇬🇧 Last Minute Alert! Rooms available tonight at Flower Power Village, Koh Phayam 🌴🔥✨',
      '🇬🇧 Spontaneous island escape? Special rates tonight at Flower Power Village, Koh Phayam 🌴✨',
      '🇬🇧 Escape the ordinary tonight at Flower Power Village, tropical sanctuary in Koh Phayam 🥥🍃✨'
    ];

    const lmIdx = Math.abs(proverbIndexSeed) % lm1EnHooks.length;

    thaiContent = `${lm1ThHooks[lmIdx]}

🏠 ห้องว่างคืนนี้ (ราคาพิเศษ Last Minute + รับส่วนลดเพิ่ม 10% เมื่อจองตรง):
${lm1ThRooms}

สัมผัสความเงียบสงบ หลีกหนีความวุ่นวาย มาพักผ่อนท่ามกลางสวนทรอปิคอลและโอเอซิสสระว่ายน้ำกันนะครับ มีจำนวนจำกัดเฉพาะคืนนี้เท่านั้น! 🌺🍃

คนโบราณกล่าวไว้: "${proverb.thai}"
วันหยุดทั้งที ต้องให้ธรรมชาติบำบัดหัวใจและเติมพลังชีวิตนะครับ!

🎁 รับส่วนลดพิเศษเพิ่มอีก 10% ทันทีเมื่อจองผ่านเว็บไซต์ของเรา:
👉 www.flowerpowervillage.com
💬 หรือติดต่อด่วนทาง WhatsApp: +66 095 882 5573`;

    englishContent = `${lm1EnHooks[lmIdx]}

🏠 Available Tonight (Special Last Minute + Extra 10% Direct Discount):
${lm1EnRooms}

Unwind in lush tropical nature, refresh in our pool oasis, and enjoy peaceful island vibes. Limited rooms available for tonight! 🌺🍃

Remember: ${cleanEnProverb}
Pack your flip-flops and let nature recharge your soul! 🤙

🎁 DIRECT BOOKING PRIVILEGE:
Get an EXTRA -10% OFF automatically when booking on our official website:
👉 www.flowerpowervillage.com
💬 Or message us on WhatsApp: +66 095 882 5573`;

    italianContent = `🇮🇹 Offerta Last Minute per stanotte a Buffalo Bay, Koh Phayam! 🌴🔥✨

🏠 Alloggi disponibili stasera (Tariffa Online ➔ Sconto Diretto -10%):
${lm1EnRooms}

Fuga spontanea sull'isola per staccare la spina tra giardini tropicali stile Eden e totale relax! 🌺🍃

Come dice un saggio proverbio: "${proverb.it}"
Camere limitate disponibili solo per questa notte!

🎁 Approfitta del 10% di sconto extra automatico sul nostro sito:
👉 www.flowerpowervillage.com
💬 WhatsApp: +66 095 882 5573`;

    fixedLink = `🌴 FLOWER POWER VILLAGE 🌸 - Buffalo Bay, Koh Phayam\n📍 Google Maps: https://maps.app.goo.gl/mugY88Wpuzjeebf56\n🌐 www.flowerpowervillage.com`;
    crossTag = `@flowerpowerpizzaranong`;

  } else if (testRun.mode === 'V3') {
    // 🌴 V3: RESORT TOUR (5 DIVERSI ALLOGGI)
    const cleanEnProverb = proverb.en.replace(/["']/g, '');

    const uniqueLodgings = testRun.scenes.map(s => ({
      nameEn: cleanInlineTitle(s.lodgingTitle || s.titlePrimary || ''),
      nameTh: cleanInlineTitle(s.titleSecondary || '')
    })).filter((l, idx, arr) => l.nameEn && arr.findIndex(x => x.nameEn === l.nameEn) === idx);

    const lodgingsThList = uniqueLodgings.map(l => `▫️ ${l.nameTh || l.nameEn}`).join('\n');
    const lodgingsEnList = uniqueLodgings.map(l => `▫️ ${l.nameEn}`).join('\n');

    const v3ThHooks = [
      '🇹🇭 พาชมบรรยากาศ Flower Power Village อ่าวเขาควาย เกาะพยาม แบบเต็มๆ ครับ 🌴✨',
      '🇹🇭 ที่พักธรรมชาติหลากหลายสไตล์ในสวนทรอปิคอลเขียวขจี พร้อมต้อนรับทุกคนครับ 🌴🌺✨',
      '🇹🇭 เลือกพักผ่อนในแบบที่คุณชอบ ท่ามกลางสวนทรอปิคอลเขียวขจี เกาะพยาม 🥥🍃✨'
    ];

    const v3EnHooks = [
      '🇬🇧 Discover your perfect island hideaway at Flower Power Village, Koh Phayam 🌴✨',
      '🇬🇧 Explore our diverse tropical stays nestled in the peaceful nature of Buffalo Bay 🌴🌺✨',
      '🇬🇧 From panoramic suites to wooden garden bungalows — find your sanctuary on Koh Phayam 🥥🍃✨'
    ];

    const v3Idx = Math.abs(proverbIndexSeed) % v3EnHooks.length;

    thaiContent = `${v3ThHooks[v3Idx]}

🏡 สไตล์ที่พักในคลิปวันนี้:
${lodgingsThList}

ตั้งแต่ห้องพักสุดหรูวิวพาโนรามา ไปจนถึงบังกะโลไม้ในสวนร่มรื่น และเต็นท์แกลมปิ้งสำหรับสายธรรมชาติ สัมผัสชีวิตแบบ Slow Life อย่างแท้จริงครับ 🌺🍃

คนโบราณกล่าวไว้: "${proverb.thai}"
วันหยุดทั้งที ต้องให้ธรรมชาติบำบัดหัวใจและเติมพลังชีวิตนะครับ!

🎁 ดูรายละเอียดและจองตรงได้ที่ www.flowerpowervillage.com
รับส่วนลดพิเศษ 10% สำหรับการจองตรงครับ! 🥥✨`;

    englishContent = `${v3EnHooks[v3Idx]}

🏡 Stays featured in today's video:
${lodgingsEnList}

From breezy panoramic suites to cozy wooden bungalows in lush gardens and eco glamping tents, there is a space tailored for every traveler's soul. 🌺🍃

Remember: ${cleanEnProverb}
Pack your flip-flops and let nature recharge your soul! 🤙

🎁 Explore all stays and book direct on www.flowerpowervillage.com
Enjoy your guaranteed best rate and 10% direct booking privilege! 🥥✨`;

    italianContent = `🇮🇹 Scopri tutti gli alloggi di Flower Power Village a Koh Phayam 🌴✨

🏡 Alloggi mostrati nel video di oggi:
${lodgingsEnList}

Dalla suite ventilata panoramica ai bungalow in legno nei giardini tropicali e tende glamping immerse nella natura! 🌺🍃

Come dice un saggio proverbio: "${proverb.it}"
L'isola di Koh Phayam per un soggiorno slow life indimenticabile!

🎁 Prenota direttamente su www.flowerpowervillage.com
Miglior tariffa garantita e 10% di sconto prenotazione diretta! 🥥✨`;

    fixedLink = `🌴 FLOWER POWER VILLAGE 🌸 - Buffalo Bay, Koh Phayam\n📍 Google Maps: https://maps.app.goo.gl/mugY88Wpuzjeebf56\n🌐 www.flowerpowervillage.com`;
    crossTag = `@flowerpowerpizzaranong`;

  } else {
    // 🌴 V1, V2: SINGOLO ALLOGGIO VILLAGGIO KOH PHAYAM CON GANCI DINAMICI
    const cleanEnProverb = proverb.en.replace(/["']/g, '');

    const villageEnHooks = [
      '🇬🇧 Paradise calling from Flower Power Village in Buffalo Bay, Koh Phayam 🌴✨',
      '🇬🇧 Escape the noise at Flower Power Village and wake up to birds singing and tropical peace 🌴🌺✨',
      '🇬🇧 Tropical breeze, lush gardens and peaceful island vibes at Flower Power Village 🥥🍃✨',
      '🇬🇧 Your eco-sanctuary at Flower Power Village on the car-free island of Koh Phayam ☀️🌴✨'
    ];

    const villageThHooks = [
      '🇹🇭 หลีกหนีความวุ่นวาย มาสัมผัสความเงียบสงบที่ Flower Power Village อ่าวเขาควาย เกาะพยาม กันครับ 🌴✨',
      '🇹🇭 ตื่นเช้ารับความสดชื่น สัมผัสธรรมชาติที่แท้จริงที่ Flower Power Village เกาะพยาม กันครับ 🌴🌺✨',
      '🇹🇭 พักผ่อนท่ามกลางสวนทรอปิคอลเขียวขจีที่ Flower Power Village เกาะพยาม สุดชิลล์ 🥥🍃✨',
      '🇹🇭 วันหยุดนี้มาเติมพลังชีวิตในบังกะโลไม้ที่ Flower Power Village เกาะพยาม กันครับ ☀️🌴✨'
    ];

    const vIdx = Math.abs(proverbIndexSeed) % villageEnHooks.length;

    const roomIdent = findAccommodationIdentity(dishOrRoomName) || 
      (testRun.scenes[0] && (findAccommodationIdentity(testRun.scenes[0].lodgingTitle) || findAccommodationIdentity(testRun.scenes[0].sourceName)));
    const roomUrl = roomIdent ? `www.flowerpowervillage.com/${roomIdent.legacySlug}` : `www.flowerpowervillage.com`;

    // Inglese: Fresco, tropicale, a capo ariosi
    englishContent = `${villageEnHooks[vIdx]}

Featured stay:
${dishOrRoomName}
Nestled in lush tropical gardens with our refreshing pool oasis, quiet nature and pure island peace! 🌺🍃

Remember: ${cleanEnProverb}
Pack your flip-flops and let nature recharge your soul! 🤙

🎁 Book directly on ${roomUrl}
Best rate guaranteed with an exclusive 10% direct booking privilege! 🥥✨`;

    // Thai: Maschile, particelle amichevoli, toponimi esatti, a capo ariosi
    thaiContent = `${villageThHooks[vIdx]}

แนะนำวันนี้:
${dishOrRoomName}
บังกะโลไม้ใต้ร่มเงาธรรมชาติ สูดอากาศบริสุทธิ์ในสวนทรอปิคอล พักผ่อนเงียบสงบ ฟินสุดๆ เลยครับ 🌺🍃

คนโบราณกล่าวไว้: "${proverb.thai}"
วันหยุดทั้งที ต้องให้ธรรมชาติบำบัดหัวใจและเติมพลังชีวิตนะครับ!

🎁 จองตรงกับเราที่ ${roomUrl}
รับราคาดีที่สุด พร้อมส่วนลดพิเศษ 10% สำหรับการจองตรงครับ! 🥥✨`;

    // Italiano: Traduzione letterale con proverbio e a capo ariosi
    italianContent = `🇮🇹 Fuggite dal caos per ritrovare la vera tranquillità a Buffalo Bay, Koh Phayam 🌴✨

In evidenza oggi:
${dishOrRoomName}
Bungalow e alloggi in legno immersi nella natura tropicale, tra oasi piscina e totale relax! 🌺🍃

Come dice un saggio proverbio: "${proverb.it}"
Una vacanza autentica per rigenerare corpo e spirito nel cuore dell'isola!

🎁 Prenota direttamente su ${roomUrl}
Miglior tariffa garantita online e 10% di privilegio prenotazione diretta! 🥥✨`;

    fixedLink = `🌴 FLOWER POWER VILLAGE 🌸 - Buffalo Bay, Koh Phayam\n📍 Google Maps: https://maps.app.goo.gl/mugY88Wpuzjeebf56\n🌐 ${roomUrl}`;
    crossTag = `@flowerpowerpizzaranong`;
  }

  // 🛡️ REGOLA IMMODIFICABILE 18: Sanitizzazione zero forno a legna
  const scrubWoodFired = (t: string) => {
    return t
      .replace(/\b(wood-fired|wood fired|wood-oven|wood oven)\s*(oven|pizza|crust)?/gi, 'authentic Italian pizza')
      .replace(/\bforno a legna\b/gi, 'forno tradizionale per pizza')
      .replace(/\baroma di legna\b/gi, 'profumo di pizza appena sfornata')
      .replace(/เตาฟืน/g, 'เตาอบพิซซ่า');
  };

  thaiContent = scrubWoodFired(ensureLangFlag(thaiContent, 'th'));
  englishContent = scrubWoodFired(ensureLangFlag(englishContent, 'en'));

  // 🛡️ REGOLA IMMODIFICABILE 26: Sanitizzazione Bullet Points & Grassetto Unicode per Hook di Testa
  thaiContent = sanitizeSocialBullets(applyUnicodeBoldHook(thaiContent));
  englishContent = sanitizeSocialBullets(applyUnicodeBoldHook(englishContent));

  // Costruzione Caption Finale Completa per Instagram / Facebook (Thai + Inglese + Link & Tag)
  const fullCaptionInstagram = isPizza
    ? `${thaiContent}\n\n${englishContent}\n\n${fixedLink}\n\n${crossTag}\n\n${[...smartTags.thai, ...smartTags.english].join(' ')}`
    : `${englishContent}\n\n${thaiContent}\n\n${fixedLink}\n\n${crossTag}\n\n${[...smartTags.thai, ...smartTags.english].join(' ')}`;

  // Caption per TikTok (più snella: Thai + Inglese con i loro hashtag integrati + Link + Tag)
  const fullCaptionTikTok = isPizza
    ? `${thaiContent}\n\n${englishContent}\n\n${fixedLink}\n${crossTag}\n\n${[...smartTags.thai, ...smartTags.english].join(' ')}`
    : `${englishContent}\n\n${thaiContent}\n\n${fixedLink}\n${crossTag}\n\n${[...smartTags.thai, ...smartTags.english].join(' ')}`;

  return {
    brand: testRun.brand,
    mode: testRun.mode,
    seasonContext: `${seasonCtx.monthName} · ${seasonCtx.festiveNotice}`,
    thaiContent,
    englishContent,
    italianContent: '',
    thaiHashtags: smartTags.thai,
    englishHashtags: smartTags.english,
    fixedLink,
    crossTag,
    fullCaptionInstagram,
    fullCaptionTikTok,
    proverbThai: proverb.thai,
    proverbEnglish: proverb.en,
    proverbItalian: proverb.it
  };
}
