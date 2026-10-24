/**
 * AutoCut Post Copywriter Engine
 * Generatore automatico e biculturale di testi social per Pizzeria Ranong e Villaggio Koh Phayam.
 * Gestisce in totale autonomia contenuti multilingua, proverbi contestuali,
 * e hashtag intelligenti e virali (Thai + Inglesi) raccolti in UN UNICO BLOCCO ALLA FINE DEL POST,
 * mai tra una traduzione e l'altra (Regola 16).
 */

import { AutoCutTestRun } from './autoCutLabEngine';

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
    thai: 'นกทำรังแต่พอตัว สุขใจในบังกะโลริมทะเลใต้ร่มเงาไม้',
    en: 'Birds build nests that fit their needs; find true peace in a tropical bungalow by the sea.',
    it: 'L’uccello fa il nido a sua misura; trova la vera pace in un bungalow tropicale vicino al mare.'
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
    thai: 'ความสุขไม่ได้อยู่ที่จุดหมาย แต่อยู่ที่ลมทะเลบนเปลญวน',
    en: 'Happiness is not just a destination; it is the ocean breeze from your hammock.',
    it: 'La felicità non è una meta, è la brezza dell’oceano dondolandosi sull’amaca.'
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
      thaiContent = `🇹🇭 สดใหม่จากเตาวันนี้! เมนูพิเศษ Daily Special มาแล้วครับ ⚡️🍕✨

เมนูเด็ดประจำวัน:
${dishOrRoomName} ${secondaryName ? `(${secondaryName})` : ''}
ปรุงสดใหม่จากครัวร้อนๆ หอมกรุ่นด้วยวัตถุดิบคุณภาพ คัดสรรมาเป็นพิเศษเฉพาะวันนี้เท่านั้น พร้อมส่งทันที ฟินสุดๆ เลยครับ 😋🔥

โบราณว่าไว้: "${proverb.thai}"
เมนูพิเศษสดใหม่แบบนี้ มีจำนวนจำกัดเฉพาะวันนี้เท่านั้น อย่ารอช้า สั่งทานกันร้อนๆ เลยนะครับ!

🛵 พร้อมส่งทันทีถึงบ้าน สั่งง่ายๆ ผ่าน www.flowerpowerpizza.com
รับส่วนลดพิเศษ 10% สำหรับการสั่งซื้อครั้งแรกทันทีครับ! 💨`;

      englishContent = `🇬🇧 Fresh out of the oven today! Chef's Daily Special is ready ⚡️🍕✨

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
        '🇹🇭 สวัสดีครับทุกคน! วันนี้พาความอร่อยมารายงานตัวครับ 🍕✨',
        '🇹🇭 กลิ่นเตาอบหอมฟุ้งลอยไปทั่วระนองแล้วครับ! วันนี้ขอเสิร์ฟเมนูสุดพิเศษ 🍕🔥',
        '🇹🇭 สายกินห้ามพลาด! เมนูอิตาเลียนแท้ๆ ทำสดใหม่จากเตาร้อนๆ พร้อมเสิร์ฟครับ 🇮🇹✨',
        '🇹🇭 ใครกำลังมองหาของอร่อยมื้อนี้ ยกความอร่อยส่งตรงถึงหน้าบ้านเลยครับ! 🛵💨'
      ];

      const pizzaEnHooks = [
        '🇬🇧 Hey food lovers! Fresh 🍕 out of our Ranong oven today ✨',
        '🇬🇧 Authentic Italian pizza 🍕 baked to perfection right here in Ranong 🔥',
        '🇬🇧 Craving real Italian flavor? Made fresh with 48h slow-fermented dough! 🇮🇹✨',
        '🇬🇧 Straight from our Italian kitchen to your table 🛵💨 in Ranong!'
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
    // 🍽️ R1: RESTAURANT & DELIVERY A KOH PHAYAM (BUFFALO BAY)
    const cleanEnProverb = proverb.en.replace(/["']/g, '');

    const r1ThHooks = [
      '🇹🇭 หิวอาหารอิตาเลียนแท้ๆ บนเกาะพยามใช่ไหมครับ? ครัว Flower Power พร้อมเสิร์ฟความอร่อย 🍝🍕 สดใหม่ครับ!',
      '🇹🇭 กลิ่นอาหารอิตาเลียนหอมฟุ้ง ริมอ่าวเขาควาย 🌿 เกาะพยาม! แวะมาทานของอร่อยกันครับ 🔥',
      '🇹🇭 มื้อพิเศษบนเกาะพยาม! พาสต้าเส้นสด 🍝 และพิซซ่าอิตาเลียนแท้ๆ 🍕 รสชาติต้นตำรับ 🇮🇹🌴',
      '🇹🇭 วันนี้ครัว Flower Power เกาะพยาม พร้อมเสิร์ฟทั้งนั่งทานในสวน 🌿 และส่งเดลิเวอรี่ถึงที่พักครับ 🛵✨'
    ];

    const r1EnHooks = [
      '🇬🇧 Craving authentic Italian food on Koh Phayam? Flower Power Restaurant 🍝🍕 is open!',
      '🇬🇧 Freshly cooked Italian specialties 🍝 right in the heart of Buffalo Bay, Koh Phayam 🌴🔥',
      '🇬🇧 Handmade pasta 🍝, traditional Italian pizza 🍕 and artisan taste on Koh Phayam island 🇮🇹🥥',
      '🇬🇧 Dine in our lush tropical garden 🌴 or get hot delivery directly to your resort on Koh Phayam 🛵✨'
    ];

    const rIdx = Math.abs(proverbIndexSeed) % r1EnHooks.length;

    thaiContent = `${r1ThHooks[rIdx]}

เมนูเด็ดแนะนำวันนี้:
${dishOrRoomName} ${secondaryName ? `(${secondaryName})` : ''}
ปรุงสดใหม่จานต่อจานโดยใช้วัตถุดิบนำเข้าและวัตถุดิบสดจากธรรมชาติ รสชาติอิตาเลียนแท้ๆ ทานแล้วฟินแน่นอนครับ! 😋🔥

โบราณว่าไว้: "${proverb.thai}"
มื้ออร่อยสร้างความสุขได้เสมอ แวะมาทานที่ร้านท่ามกลางสวนธรรมชาติ หรือสั่งเดลิเวอรี่ส่งตรงถึงที่พักบนเกาะพยามได้เลยครับ!

🛵 บริการส่งเดลิเวอรี่บนเกาะพยาม สั่งง่ายๆ ผ่าน WhatsApp:
✆ WhatsApp: +66 095 882 5573
🌐 ข้อมูลและที่พัก: www.flowerpowervillage.com`;

    englishContent = `${r1EnHooks[rIdx]}

Featured dish today:
${secondaryName || dishOrRoomName}
Cooked from scratch with premium ingredients and genuine Italian passion right here in Buffalo Bay! 😋🔥

As the wise proverb says: ${cleanEnProverb}
Good food shared in paradise creates unforgettable memories. Treat yourself to real Italian taste on Koh Phayam! 🤙

🛵 Island Delivery on Koh Phayam — order via WhatsApp:
✆ WhatsApp: +66 095 882 5573
🌐 Resort & Dining: www.flowerpowervillage.com`;

    italianContent = `🇮🇹 Voglia di vera cucina italiana a Koh Phayam? Il ristorante Flower Power è aperto! 🍝🍕✨

Piatto del giorno:
${dishOrRoomName}
Pasta fresca fatta a mano, pizze e specialità italiane autentiche a Buffalo Bay! 😋🔥

Un saggio proverbio ricorda: "${proverb.it}"
La buona cucina italiana nel cuore dell'isola di Koh Phayam!

🛵 Consegna a domicilio sull'isola tramite WhatsApp: +66 095 882 5573
🌐 www.flowerpowervillage.com`;

    fixedLink = `🌺 FLOWER POWER RESTAURANT & RESORT 🌸 - Buffalo Bay, Koh Phayam\n📍 WhatsApp Delivery: +66 095 882 5573\n🌐 www.flowerpowervillage.com`;
    crossTag = `@flowerpowerphayam`;

  } else {
    // 🌴 VILLAGGIO KOH PHAYAM CON GANCI DINAMICI
    const cleanEnProverb = proverb.en.replace(/["']/g, '');

    const villageEnHooks = [
      '🇬🇧 Paradise calling from Buffalo Bay, Koh Phayam 🌴🌊✨',
      '🇬🇧 Escape the noise and wake up to the sound of waves at Buffalo Bay 🌴🌺✨',
      '🇬🇧 Tropical breeze, lush green gardens and peaceful island vibes 🥥🍃✨',
      '🇬🇧 Your eco-sanctuary on the car-free island of Koh Phayam ☀️🌊✨'
    ];

    const villageThHooks = [
      '🇹🇭 หลีกหนีความวุ่นวาย มาสัมผัสความเงียบสงบที่ อ่าวเขาควาย เกาะพยาม กันครับ 🌴🌊✨',
      '🇹🇭 ตื่นเช้ารับลมทะเล สัมผัสธรรมชาติที่แท้จริงในเกาะพยามกันครับ 🌴🌺✨',
      '🇹🇭 พักผ่อนท่ามกลางสวนทรอปิคอลเขียวขจี ฟังเสียงคลื่นบนเปลญวนสุดชิลล์ 🥥🍃✨',
      '🇹🇭 วันหยุดนี้มาเติมพลังชีวิตในบังกะโลไม้ริมอ่าวเขาควาย เกาะพยาม กันครับ ☀️🌊✨'
    ];

    const vIdx = Math.abs(proverbIndexSeed) % villageEnHooks.length;

    // Inglese: Fresco, tropicale, a capo ariosi
    englishContent = `${villageEnHooks[vIdx]}

Featured stay:
${dishOrRoomName}
Nestled in lush tropical gardens with ocean breeze, birds singing and pure island peace! 🌺🍃

Remember: ${cleanEnProverb}
Pack your flip-flops and let nature recharge your soul! 🤙

🎁 Book directly on www.flowerpowervillage.com
Best rate guaranteed with an exclusive 10% direct booking privilege! 🥥✨`;

    // Thai: Maschile, particelle amichevoli, toponimi esatti, a capo ariosi
    thaiContent = `${villageThHooks[vIdx]}

แนะนำวันนี้:
${dishOrRoomName}
บังกะโลไม้ใต้ร่มเงาธรรมชาติ สูดอากาศบริสุทธิ์ริมทะเล และฟังเสียงคลื่นเบาๆ ฟินสุดๆ เลยครับ 🌺🍃

คนโบราณกล่าวไว้: "${proverb.thai}"
วันหยุดทั้งที ต้องให้ธรรมชาติบำบัดหัวใจและเติมพลังชีวิตนะครับ!

🎁 จองตรงกับเราที่ www.flowerpowervillage.com
รับราคาดีที่สุด พร้อมส่วนลดพิเศษ 10% สำหรับการจองตรงครับ! 🥥✨`;

    // Italiano: Traduzione letterale con proverbio e a capo ariosi
    italianContent = `🇮🇹 Fuggite dal caos per ritrovare la vera tranquillità a Buffalo Bay, Koh Phayam 🌴🌊✨

In evidenza oggi:
${dishOrRoomName}
Bungalow e alloggi in legno immersi nella natura tropicale, tra brezza marina e totale relax! 🌺🍃

Come dice un saggio proverbio: "${proverb.it}"
Una vacanza autentica per rigenerare corpo e spirito nel cuore dell'isola!

🎁 Prenota direttamente su www.flowerpowervillage.com
Miglior tariffa garantita online e 10% di privilegio prenotazione diretta! 🥥✨`;

    fixedLink = `🌴 FLOWER POWER VILLAGE 🌸 - Buffalo Bay, Koh Phayam\n📍 Google Maps: https://maps.app.goo.gl/mugY88Wpuzjeebf56\n🌐 www.flowerpowervillage.com`;
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
