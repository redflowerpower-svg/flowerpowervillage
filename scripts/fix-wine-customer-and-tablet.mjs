import fs from 'fs';

console.log('🍷 Upgrading Wine Card Translations in DeliveryMenu, DiningTabletSite, and MenuGrid...');

// -------------------------------------------------------------
// 1. DELIVERY MENU
// -------------------------------------------------------------
let deliveryCode = fs.readFileSync('src/pizza/pages/DeliveryMenu.tsx', 'utf8');

if (!deliveryCode.includes('getWineTranslatedTitle')) {
  deliveryCode = deliveryCode.replace(
    /import\s*\{\s*INITIAL_WINE_COLLECTION,([^}]+)\}\s*from\s*'\.\.\/data\/wineData';/,
    "import { INITIAL_WINE_COLLECTION, $1, getWineTranslatedTitle, getWineTranslatedSubtitle, getWineTranslatedDesc } from '../data/wineData';"
  );
}

// Update mapper in DeliveryMenu
const deliveryMapperTarget = `          const titleForLang = (
            lang === 'IT' ? (w.titleIt || w.title) :
            lang === 'TH' ? (w.titleTh || w.title) :
            lang === 'DE' ? (w.titleDe || w.title) :
            (w.titleEn || w.title)
          ) || w.title || '';`;

const deliveryReplacement = `          const titleForLang = getWineTranslatedTitle(w, lang) || w.title || '';
          const subForLang = getWineTranslatedSubtitle(w, lang) || w.categorySubtitle || '';
          const descForLang = getWineTranslatedDesc(w, lang) || w.description || '';

          return {
            id: w.id,
            name: titleForLang,
            nameIt: w.titleIt || w.title,
            nameEn: w.titleEn || w.title,
            nameTh: w.titleTh || w.title,
            nameMm: w.titleMm || w.title,
            nameDe: w.titleDe || w.title,
            nameEs: w.titleEs || w.title,
            nameFr: w.titleFr || w.title,
            nameRu: w.titleRu || w.title,
            nameZh: w.titleZh || w.title,
            title: titleForLang,
            titleIt: w.titleIt || w.title,
            titleEn: w.titleEn || w.title,
            titleTh: w.titleTh || w.title,
            titleMm: w.titleMm || w.title,
            titleDe: w.titleDe || w.title,
            titleEs: w.titleEs || w.title,
            titleFr: w.titleFr || w.title,
            titleRu: w.titleRu || w.title,
            titleZh: w.titleZh || w.title,
            description: descForLang,
            descriptionIt: w.descriptionIt || w.description,
            descriptionEn: w.descriptionEn || w.description,
            descriptionTh: w.descriptionTh || w.description,
            descriptionMm: w.descriptionMm || w.description,
            descriptionDe: w.descriptionDe || w.description,
            descriptionEs: w.descriptionEs || w.description,
            descriptionFr: w.descriptionFr || w.description,
            descriptionRu: w.descriptionRu || w.description,
            descriptionZh: w.descriptionZh || w.description,
            description_it: w.descriptionIt || w.description,
            description_en: w.descriptionEn || w.description,
            description_th: w.descriptionTh || w.description,
            description_mm: w.descriptionMm || w.description,
            description_de: w.descriptionDe || w.description,
            description_es: w.descriptionEs || w.description,
            description_fr: w.descriptionFr || w.description,
            description_ru: w.descriptionRu || w.description,
            description_zh: w.descriptionZh || w.description,
            price: finalPrice,
            image: w.bottleImage,
            image_file: w.bottleImage,
            category: 'wines',
            categoryType: resolveWineCategoryType(w),
            categorySubtitle: subForLang,
            categorySubtitleIt: w.subtitleIt || w.categorySubtitle,
            categorySubtitleEn: w.subtitleEn || w.categorySubtitle,
            categorySubtitleTh: w.subtitleTh || w.categorySubtitle,
            categorySubtitleMm: w.subtitleMm || w.categorySubtitle,
            categorySubtitleDe: w.subtitleDe || w.categorySubtitle,
            categorySubtitleEs: w.subtitleEs || w.categorySubtitle,
            categorySubtitleFr: w.subtitleFr || w.categorySubtitle,
            categorySubtitleRu: w.subtitleRu || w.categorySubtitle,
            categorySubtitleZh: w.subtitleZh || w.categorySubtitle,
            subtitleIt: w.subtitleIt || w.categorySubtitle,
            subtitleEn: w.subtitleEn || w.categorySubtitle,
            subtitleTh: w.subtitleTh || w.categorySubtitle,
            subtitleMm: w.subtitleMm || w.categorySubtitle,
            subtitleDe: w.subtitleDe || w.categorySubtitle,
            subtitleEs: w.subtitleEs || w.categorySubtitle,
            subtitleFr: w.subtitleFr || w.categorySubtitle,
            subtitleRu: w.subtitleRu || w.categorySubtitle,
            subtitleZh: w.subtitleZh || w.categorySubtitle,
            flag: w.flag,
            alcohol: w.alcohol,
            bottleScale: w.bottleScale || 100,
            bottleScaleX: w.bottleScaleX || 100,
            bottleOffsetX: w.bottleOffsetX || 0,
            bottleOffsetY: w.bottleOffsetY || 0,
            isAvailable: true
          } as MenuItem;`;

// Find and replace the whole mapper block in DeliveryMenu
const dmStartIdx = deliveryCode.indexOf("const titleForLang = (");
const dmEndIdx = deliveryCode.indexOf("} as MenuItem;", dmStartIdx);
if (dmStartIdx !== -1 && dmEndIdx !== -1) {
  deliveryCode = deliveryCode.substring(0, dmStartIdx) + deliveryReplacement + deliveryCode.substring(dmEndIdx + "} as MenuItem;".length);
  console.log('✅ Updated getDynamicWineItems in DeliveryMenu.tsx');
} else {
  console.warn('⚠️ Could not locate mapper block in DeliveryMenu.tsx');
}

// Translate Wine Privilege Banner in DeliveryMenu.tsx
const wineBannerDict = `const WINE_PRIVILEGE_BANNER = {
  badge: {
    IT: '🍷 DEGUSTAZIONE IN LOCALE • SCONTO 10%',
    EN: '🍷 DINE-IN WINE PRIVILEGE • 10% OFF',
    TH: '🍷 สิทธิพิเศษไวน์ • ลด 10% ที่โต๊ะอาหาร',
    MM: '🍷 ဆိုင်တွင်သောက်သုံးခြင်း အထူးအခွင့်အရေး • ၁၀% လျှော့',
    DE: '🍷 WEINVERKOSTUNG VOR ORT • 10% RABATT',
    ES: '🍷 PRIVILEGIO DE VINO EN MESA • 10% DTO.',
    FR: '🍷 PRIVILÈGE VINS SUR PLACE • -10% DE RÉDUCTION',
    RU: '🍷 ПРИВИЛЕГИЯ НА ВИНА В ЗАЛЕ • СКИДКА 10%',
    ZH: '🍷 堂食精选葡萄酒特权 • 享9折优惠'
  },
  regulation: {
    IT: '• Normativa Alcolici Thailandia',
    EN: '• Thai Alcohol Regulation',
    TH: '• กฎหมายแอลกอฮอล์แห่งประเทศไทย',
    MM: '• ထိုင်းနိုင်ငံ အရက်ဥပဒေစည်းမျဉ်း',
    DE: '• Alkoholgesetzgebung Thailand',
    ES: '• Normativa de alcohol de Tailandia',
    FR: '• Réglementation sur l\\'alcool en Thaïlande',
    RU: '• Закон Таиланда об алкогольной продукции',
    ZH: '• 泰国酒精法规'
  },
  title: {
    IT: 'Selezione Vini al Ristorante • Prenota dal sito e ricevi il 10% di sconto',
    EN: 'Fine Wine Selection • Book online to receive an exclusive 10% table discount',
    TH: 'ไวน์นำเข้าชั้นเลิศ • จองโต๊ะล่วงหน้ารับส่วนลดพิเศษ 10%',
    MM: 'အဆင့်မြင့် ဝိုင်ရွေးချယ်မှုများ • စားပွဲကြိုတင်ပြီး သီးသန့် ၁၀% လျှော့ဈေးရယူပါ',
    DE: 'Erlesene Weinkarte • Online reservieren und 10% Rabatt genießen',
    ES: 'Selección de Vinos Finos • Reserva online y recibe un 10% de descuento en mesa',
    FR: 'Sélection de Grands Vins • Réservez en ligne pour bénéficier de 10% de réduction à table',
    RU: 'Коллекция изысканных вин • Забронируйте столик онлайн и получите скидку 10%',
    ZH: '精选优质葡萄酒 • 在线订座立享餐桌专属9折特惠'
  },
  description: {
    IT: 'In conformità con le leggi del Regno di Thailandia, la vendita e consegna a domicilio di alcolici online non è consentita. Ti invitiamo a degustare i nostri vini direttamente al ristorante: prenotando dal nostro sito web ricevi subito il 10% di sconto su tutte le bottiglie al tavolo!',
    EN: 'In compliance with Thai law, online delivery of alcohol is not permitted. We invite you to enjoy our cellar selection at our restaurant in Ranong: reserve a table from our website to get a 10% discount on all wine bottles at your table!',
    TH: 'ตามกฎหมายแห่งราชอาณาจักรไทย การสั่งซื้อเครื่องดื่มแอลกอฮอล์ออนไลน์เพื่อจัดส่งถึงบ้านไม่สามารถทำได้ ขอเชิญท่านมาลิ้มลองไวน์ชั้นเลิศในบรรยากาศสบายๆ ณ ร้านของเรา: จองโต๊ะผ่านเว็บไซต์ รับส่วนลด 10% สำหรับไวน์ทุกขวดที่โต๊ะอาหารทันที!',
    MM: 'ထိုင်းနိုင်ငံ ဥပဒေအရ အွန်လိုင်းမှတစ်ဆင့် အရက်အိမ်တိုင်ရာရောက် ပို့ဆောင်ခြင်းကို ခွင့်မပြုပါ။ ရနောင်းရှိ ကျွန်ုပ်တို့၏ စားသောက်ဆိုင်တွင် အရည်အသွေးမြင့်ဝိုင်များကို သောက်သုံးနိုင်ရန် ဖိတ်ခေါ်ပါသည်- ဝဘ်ဆိုက်မှ စားပွဲကြိုတင်စာရင်းသွင်းပြီး စားပွဲပေါ်ရှိ ဝိုင်ပုလင်းအားလုံးအတွက် ၁၀% လျှော့ဈေး ရယူလိုက်ပါ!',
    DE: 'Gemäß den gesetzlichen Bestimmungen Thailands ist die Online-Lieferung von Alkohol untersagt. Genießen Sie unsere Weine vor Ort im Restaurant: Bei einer Tischreservierung über unsere Website erhalten Sie 10% Rabatt auf alle Weinflaschen am Tisch!',
    ES: 'En cumplimiento con la legislación tailandesa, no está permitida la entrega a domicilio de bebidas alcohólicas online. Le invitamos a disfrutar de nuestra selección de bodega directamente en nuestro restaurante en Ranong: ¡reserve mesa desde nuestra web y obtenga un 10% de descuento en todas las botellas de vino en su mesa!',
    FR: 'Conformément à la législation thaïlandaise, la livraison d\\'alcool à domicile est interdite en ligne. Nous vous invitons à déguster notre sélection de cave directement dans notre restaurant à Ranong : réservez une table depuis notre site web pour bénéficier de 10% de réduction sur toutes les bouteilles de vin à votre table !',
    RU: 'В соответствии с законодательством Таиланда онлайн-доставка алкоголя запрещена. Приглашаем вас насладиться нашей винной картой непосредственно в ресторане в Ранонге: забронируйте столик через наш сайт и получите скидку 10% на все бутылки вина за вашим столиком!',
    ZH: '根据泰国法律规定，禁止在线销售及外送酒类饮品。诚邀您亲临我们位于拉农的餐厅品尝窖藏佳酿：通过网站在线预订餐桌，即可享全场葡萄酒每瓶立减10%（9折）专属优惠！'
  },
  button: {
    IT: 'Prenota Tavolo (-10% Vini)',
    EN: 'Book Table (-10% Wine)',
    TH: 'จองโต๊ะรับส่วนลด 10%',
    MM: 'စားပွဲ ကြိုတင်စာရင်းသွင်း (-၁၀% ဝိုင်)',
    DE: 'Tisch Reservieren (-10%)',
    ES: 'Reservar Mesa (-10% Vinos)',
    FR: 'Réserver une Table (-10% Vins)',
    RU: 'Забронировать столик (-10% на вина)',
    ZH: '预订餐桌（葡萄酒享9折）'
  }
};`;

if (!deliveryCode.includes('const WINE_PRIVILEGE_BANNER =')) {
  deliveryCode = deliveryCode.replace(
    '// Submenu for Wines (Stylish Dual Dropdown Menu: Type & Origin)',
    wineBannerDict + '\n\n        // Submenu for Wines (Stylish Dual Dropdown Menu: Type & Origin)'
  );
}

// Replace Wine Privilege Banner texts in DeliveryMenu.tsx
deliveryCode = deliveryCode.replace(
  /<span>\s*\{lang === 'TH' \? '🍷 สิทธิพิเศษไวน์ • ลด 10% ที่โต๊ะอาหาร'[\s\S]*?<\/span>/,
  `<span>{(WINE_PRIVILEGE_BANNER.badge as any)[lang] || WINE_PRIVILEGE_BANNER.badge.IT}</span>`
);

deliveryCode = deliveryCode.replace(
  /\{lang === 'TH' \? '• กฎหมายแอลกอฮอล์แห่งประเทศไทย'[\s\S]*?'• Thai Alcohol Regulation'\}/,
  `{(WINE_PRIVILEGE_BANNER.regulation as any)[lang] || WINE_PRIVILEGE_BANNER.regulation.IT}`
);

deliveryCode = deliveryCode.replace(
  /\{lang === 'TH' \? 'ไวน์นำเข้าชั้นเลิศ • จองโต๊ะล่วงหน้ารับส่วนลดพิเศษ 10%'[\s\S]*?'Fine Wine Selection • Book online to receive an exclusive 10% table discount'\}/,
  `{(WINE_PRIVILEGE_BANNER.title as any)[lang] || WINE_PRIVILEGE_BANNER.title.IT}`
);

deliveryCode = deliveryCode.replace(
  /\{lang === 'TH'\s*\? 'ตามกฎหมายแห่งราชอาณาจักรไทย การสั่งซื้อเครื่องดื่มแอลกอฮอล์[\s\S]*?: 'In compliance with Thai law, online delivery of alcohol is not permitted[\s\S]*?'\}/,
  `{(WINE_PRIVILEGE_BANNER.description as any)[lang] || WINE_PRIVILEGE_BANNER.description.IT}`
);

deliveryCode = deliveryCode.replace(
  /<span>\s*\{lang === 'TH' \? 'จองโต๊ะรับส่วนลด 10%'[\s\S]*?'Book Table \(-10% Wine\)'\}\s*<\/span>/,
  `<span>{(WINE_PRIVILEGE_BANNER.button as any)[lang] || WINE_PRIVILEGE_BANNER.button.IT}</span>`
);

fs.writeFileSync('src/pizza/pages/DeliveryMenu.tsx', deliveryCode, 'utf8');
console.log('✅ DeliveryMenu.tsx successfully updated.');

// -------------------------------------------------------------
// 2. DINING TABLET SITE
// -------------------------------------------------------------
let tabletCode = fs.readFileSync('src/pizza/pages/DiningTabletSite.tsx', 'utf8');

if (!tabletCode.includes('getWineTranslatedTitle')) {
  tabletCode = tabletCode.replace(
    /import\s*\{\s*INITIAL_WINE_COLLECTION,([^}]+)\}\s*from\s*'\.\.\/data\/wineData';/,
    "import { INITIAL_WINE_COLLECTION, $1, getWineTranslatedTitle, getWineTranslatedSubtitle, getWineTranslatedDesc } from '../data/wineData';"
  );
}

// Update mapper in DiningTabletSite
const dtStartIdx = tabletCode.indexOf("const titleForLang = (");
const dtEndIdx = tabletCode.indexOf("} as MenuItem;", dtStartIdx);
if (dtStartIdx !== -1 && dtEndIdx !== -1) {
  tabletCode = tabletCode.substring(0, dtStartIdx) + deliveryReplacement + tabletCode.substring(dtEndIdx + "} as MenuItem;".length);
  console.log('✅ Updated getDynamicWineItems in DiningTabletSite.tsx');
} else {
  console.warn('⚠️ Could not locate mapper block in DiningTabletSite.tsx');
}

fs.writeFileSync('src/pizza/pages/DiningTabletSite.tsx', tabletCode, 'utf8');
console.log('✅ DiningTabletSite.tsx successfully updated.');

// -------------------------------------------------------------
// 3. MENU GRID
// -------------------------------------------------------------
let menuGridCode = fs.readFileSync('src/pizza/components/MenuGrid.tsx', 'utf8');

// Ensure import includes getWineTranslatedTitle, getWineTranslatedSubtitle, getWineTranslatedDesc
if (!menuGridCode.includes('getWineTranslatedTitle')) {
  menuGridCode = menuGridCode.replace(
    /import\s*\{\s*renderCountryFlag,([^}]+)\}\s*from\s*'\.\.\/data\/wineData';/,
    "import { renderCountryFlag, $1, getWineTranslatedTitle, getWineTranslatedSubtitle, getWineTranslatedDesc } from '../data/wineData';"
  );
}

// Update getTranslatedName in MenuGrid.tsx to support wine title keys
const nameStartIdx = menuGridCode.indexOf("const getTranslatedName = (item: {");
if (nameStartIdx !== -1) {
  const nameEndIdx = menuGridCode.indexOf("return item.name;", nameStartIdx);
  if (nameEndIdx !== -1) {
    const customNameFn = `const getTranslatedName = (item: any) => {
    const pid = (item.id || '').trim().toLowerCase();
    const origId = (item.id || '').trim();
    const curLang = lang || 'IT';

    if (origId && EXTRAS_TRANSLATION_MAP[origId]) {
      const mapped = EXTRAS_TRANSLATION_MAP[origId];
      if (curLang === 'TH' && mapped.nameTh) return mapped.nameTh;
      if (curLang === 'IT' && mapped.nameIt) return mapped.nameIt;
      if (curLang === 'DE' && mapped.nameDe) return mapped.nameDe;
      if (curLang === 'MM' && mapped.nameMm) return mapped.nameMm;
      if (curLang === 'ES' && mapped.nameEs) return mapped.nameEs;
      if (curLang === 'FR' && mapped.nameFr) return mapped.nameFr;
      if (curLang === 'RU' && mapped.nameRu) return mapped.nameRu;
      if (curLang === 'ZH' && mapped.nameZh) return mapped.nameZh;
      if (curLang === 'EN' && mapped.name) return mapped.name;
    }

    const dict = targetedTranslations[curLang];
    if (dict) {
      if (dict.extras && dict.extras[pid]) return dict.extras[pid];
      if (dict.pairingDishes && dict.pairingDishes[pid]) return dict.pairingDishes[pid];
    }

    if (item.category === 'wines' || item.flag || item.title || item.titleZh) {
      const wt = getWineTranslatedTitle(item, curLang);
      if (wt) return wt;
    }

    if (curLang === 'ZH' && (item.nameZh || item.name_zh || item.titleZh)) return item.nameZh || item.name_zh || item.titleZh;
    if (curLang === 'RU' && (item.nameRu || item.name_ru || item.titleRu)) return item.nameRu || item.name_ru || item.titleRu;
    if (curLang === 'FR' && (item.nameFr || item.name_fr || item.titleFr)) return item.nameFr || item.name_fr || item.titleFr;
    if (curLang === 'ES' && (item.nameEs || item.name_es || item.titleEs)) return item.nameEs || item.name_es || item.titleEs;
    if (curLang === 'MM' && (item.nameMm || item.name_mm || item.titleMm)) return item.nameMm || item.name_mm || item.titleMm;
    if (curLang === 'TH' && (item.nameTh || item.titleTh)) return item.nameTh || item.titleTh;
    if (curLang === 'IT' && (item.nameIt || item.titleIt)) return item.nameIt || item.titleIt;
    if (curLang === 'DE' && (item.nameDe || item.titleDe)) return item.nameDe || item.titleDe;
    if (curLang === 'EN' && (item.nameEn || item.titleEn)) return item.nameEn || item.titleEn;
    return item.name || item.title || '';
  };`;

    const nextBraceIdx = menuGridCode.indexOf("};", nameEndIdx);
    menuGridCode = menuGridCode.substring(0, nameStartIdx) + customNameFn + menuGridCode.substring(nextBraceIdx + 2);
    console.log('✅ Updated getTranslatedName in MenuGrid.tsx');
  }
}

// Update getTranslatedDesc in MenuGrid.tsx
const descStartIdx = menuGridCode.indexOf("const getTranslatedDesc = (item: MenuItem)");
if (descStartIdx !== -1) {
  const customDescFn = `const getTranslatedDesc = (item: any) => {
    const curLang = lang || 'IT';
    if (item.category === 'wines' || item.flag || item.descriptionZh) {
      const wd = getWineTranslatedDesc(item, curLang);
      if (wd) return wd;
    }
    if (curLang === 'ZH' && (item.descriptionZh || item.description_zh)) return item.descriptionZh || item.description_zh;
    if (curLang === 'RU' && (item.descriptionRu || item.description_ru)) return item.descriptionRu || item.description_ru;
    if (curLang === 'FR' && (item.descriptionFr || item.description_fr)) return item.descriptionFr || item.description_fr;
    if (curLang === 'ES' && (item.descriptionEs || item.description_es)) return item.descriptionEs || item.description_es;
    if (curLang === 'MM' && (item.descriptionMm || item.description_mm)) return item.descriptionMm || item.description_mm;
    if (curLang === 'TH' && (item.descriptionTh || item.description_th)) return item.descriptionTh || item.description_th;
    if (curLang === 'IT' && (item.descriptionIt || item.description_it)) return item.descriptionIt || item.description_it;
    if (curLang === 'DE' && (item.descriptionDe || item.description_de)) return item.descriptionDe || item.description_de;
    if (curLang === 'EN' && (item.descriptionEn || item.description_en)) return item.descriptionEn || item.description_en;
    return item.description || item.descriptionIt || item.description_it || '';
  };`;

  const descEndIdx = menuGridCode.indexOf("};", descStartIdx);
  menuGridCode = menuGridCode.substring(0, descStartIdx) + customDescFn + menuGridCode.substring(descEndIdx + 2);
  console.log('✅ Updated getTranslatedDesc in MenuGrid.tsx');
}

// Update 9-language wine card action dictionaries in MenuGrid.tsx
const wineCardLabelsDict = `
const WINE_CARD_LABELS = {
  bottlePrice: {
    IT: 'Prezzo Bottiglia',
    EN: 'Bottle Price',
    TH: 'ราคาขวด',
    MM: 'ပုလင်းဈေးနှုန်း',
    DE: 'Flaschenpreis',
    ES: 'Precio botella',
    FR: 'Prix bouteille',
    RU: 'Цена за бутылку',
    ZH: '每瓶价格'
  },
  bookTableBtn: {
    IT: 'Prenota al Tavolo (-10%)',
    EN: 'Book at Table (-10%)',
    TH: 'จองโต๊ะรับส่วนลด 10%',
    MM: 'စားပွဲ ကြိုတင်စာရင်းသွင်း (၁၀% လျှော့)',
    DE: 'Tisch mit 10% Rabatt buchen',
    ES: 'Reservar mesa (-10%)',
    FR: 'Réserver une table (-10%)',
    RU: 'Забронировать столик (-10%)',
    ZH: '预订餐桌（享9折优惠）'
  },
  tablePrice: {
    IT: 'Prezzo al Tavolo',
    EN: 'Table Price',
    TH: 'ราคาที่โต๊ะ',
    MM: 'စားပွဲ ဈေးနှုန်း',
    DE: 'Tischpreis',
    ES: 'Precio en mesa',
    FR: 'Prix à table',
    RU: 'Цена за столиком',
    ZH: '餐桌特惠价'
  },
  addBtn: {
    IT: 'Aggiungi',
    EN: 'Add',
    TH: 'เพิ่ม',
    MM: 'ထည့်ပါ',
    DE: 'Hinzufügen',
    ES: 'Añadir',
    FR: 'Ajouter',
    RU: 'Добавить',
    ZH: '添加'
  }
};
`;

if (!menuGridCode.includes('const WINE_CARD_LABELS =')) {
  menuGridCode = menuGridCode.replace(
    'export default function MenuGrid',
    wineCardLabelsDict + '\nexport default function MenuGrid'
  );
}

// Replace inline wine card labels with WINE_CARD_LABELS
menuGridCode = menuGridCode.replace(
  /\{lang === 'TH' \? 'ราคาขวด' : lang === 'DE' \? 'Flaschenpreis' : lang === 'EN' \? 'Bottle Price' : 'Prezzo Bottiglia'\}/g,
  `{(WINE_CARD_LABELS.bottlePrice as any)[lang] || WINE_CARD_LABELS.bottlePrice.IT}`
);

menuGridCode = menuGridCode.replace(
  /\{lang === 'TH' \? 'จองโต๊ะรับส่วนลด 10%' : lang === 'IT' \? 'Prenota al Tavolo \(-10%\)' : lang === 'DE' \? 'Tisch mit 10% Rabatt buchen' : 'Book at Table \(-10%\)'\}/g,
  `{(WINE_CARD_LABELS.bookTableBtn as any)[lang] || WINE_CARD_LABELS.bookTableBtn.IT}`
);

menuGridCode = menuGridCode.replace(
  /\{lang === 'TH' \? 'ราคาที่โต๊ะ' : lang === 'DE' \? 'Tischpreis' : lang === 'EN' \? 'Table Price' : 'Prezzo al Tavolo'\}/g,
  `{(WINE_CARD_LABELS.tablePrice as any)[lang] || WINE_CARD_LABELS.tablePrice.IT}`
);

menuGridCode = menuGridCode.replace(
  /\{lang === 'TH' \? 'เพิ่ม' : lang === 'IT' \? 'Aggiungi' : lang === 'DE' \? 'Hinzufügen' : 'Add'\}/g,
  `{(WINE_CARD_LABELS.addBtn as any)[lang] || WINE_CARD_LABELS.addBtn.IT}`
);

fs.writeFileSync('src/pizza/components/MenuGrid.tsx', menuGridCode, 'utf8');
console.log('✅ MenuGrid.tsx successfully updated.');
