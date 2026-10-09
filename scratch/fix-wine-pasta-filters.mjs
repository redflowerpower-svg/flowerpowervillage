import fs from 'fs';
import path from 'path';

const deliveryMenuPath = path.resolve('src/pizza/pages/DeliveryMenu.tsx');
const diningTabletPath = path.resolve('src/pizza/pages/DiningTabletSite.tsx');

const PASTA_FILTER_LABELS_CODE = `const PASTA_FILTER_LABELS: Record<string, { all: string }> = {
  IT: { all: 'Tutti i Primi' },
  EN: { all: 'All Pasta' },
  TH: { all: 'พาสต้าทั้งหมด' },
  DE: { all: 'Alle Nudelgerichte' },
  MM: { all: 'ခေါက်ဆွဲ အားလုံး' },
  ES: { all: 'Todas las Pastas' },
  FR: { all: 'Toutes les Pâtes' },
  RU: { all: 'Все виды пасты' },
  ZH: { all: '全部意面' },
};`;

const WINE_FILTER_LABELS_CODE = `const WINE_FILTER_LABELS: Record<string, {
  allTypes: string;
  allCountries: string;
  filterByCountry: string;
  italianFirstBadge: string;
  noWinesFound: string;
  resetFilters: string;
  winesCount: string;
  wineCount: string;
}> = {
  IT: {
    allTypes: 'Tutti i Vini',
    allCountries: 'Tutte le Origini',
    filterByCountry: 'Origine',
    italianFirstBadge: 'Selezione Italiana in Evidenza',
    noWinesFound: 'Nessun vino trovato con i filtri selezionati.',
    resetFilters: 'Mostra tutti i vini',
    winesCount: 'etichette',
    wineCount: 'etichetta',
  },
  EN: {
    allTypes: 'All Wines',
    allCountries: 'All Origins',
    filterByCountry: 'Origin',
    italianFirstBadge: 'Italian Selection Featured',
    noWinesFound: 'No wines found matching your selected filters.',
    resetFilters: 'Show all wines',
    winesCount: 'wines',
    wineCount: 'wine',
  },
  TH: {
    allTypes: 'ไวน์ทั้งหมด',
    allCountries: 'ทุกแหล่งกำเนิด',
    filterByCountry: 'แหล่งกำเนิด',
    italianFirstBadge: 'คัดสรรพิเศษจากอิตาลี',
    noWinesFound: 'ไม่พบรายการไวน์ตามตัวกรองที่เลือก',
    resetFilters: 'แสดงไวน์ทั้งหมด',
    winesCount: 'รายการ',
    wineCount: 'รายการ',
  },
  DE: {
    allTypes: 'Alle Weine',
    allCountries: 'Alle Herkunftsländer',
    filterByCountry: 'Herkunft',
    italianFirstBadge: 'Italienische Auswahl im Fokus',
    noWinesFound: 'Keine Weine für die ausgewählten Filter gefunden.',
    resetFilters: 'Alle Weine anzeigen',
    winesCount: 'Weine',
    wineCount: 'Wein',
  },
  MM: {
    allTypes: 'ဝိုင် အားလုံး',
    allCountries: 'မူရင်းနိုင်ငံ အားလုံး',
    filterByCountry: 'မူရင်းနိုင်ငံ',
    italianFirstBadge: 'အီတလီ အထူးရွေးချယ်မှု',
    noWinesFound: 'ရွေးချယ်ထားသော စစ်ထုတ်မှုနှင့် ကိုက်ညီသော ဝိုင် မရှိပါ။',
    resetFilters: 'ဝိုင် အားလုံး ပြသရန်',
    winesCount: 'မျိုး',
    wineCount: 'မျိုး',
  },
  ES: {
    allTypes: 'Todos los Vinos',
    allCountries: 'Todos los Orígenes',
    filterByCountry: 'Origen',
    italianFirstBadge: 'Selección Italiana Destacada',
    noWinesFound: 'No se encontraron vinos con los filtros seleccionados.',
    resetFilters: 'Mostrar todos los vinos',
    winesCount: 'vinos',
    wineCount: 'vino',
  },
  FR: {
    allTypes: 'Tous les Vins',
    allCountries: 'Toutes les Origines',
    filterByCountry: 'Origine',
    italianFirstBadge: 'Sélection Italienne à l\\'Honneur',
    noWinesFound: 'Aucun vin trouvé avec les filtres sélectionnés.',
    resetFilters: 'Afficher tous les vins',
    winesCount: 'vins',
    wineCount: 'vin',
  },
  RU: {
    allTypes: 'Все Вина',
    allCountries: 'Все Страны',
    filterByCountry: 'Происхождение',
    italianFirstBadge: 'Итальянская Коллекция',
    noWinesFound: 'Вина не найдены по выбранным фильтрам.',
    resetFilters: 'Показать все вина',
    winesCount: 'вин',
    wineCount: 'вино',
  },
  ZH: {
    allTypes: '所有葡萄酒',
    allCountries: '所有产地',
    filterByCountry: '产地',
    italianFirstBadge: '精选意大利佳酿',
    noWinesFound: '未找到符合所选条件的葡萄酒。',
    resetFilters: '显示所有葡萄酒',
    winesCount: '款',
    wineCount: '款',
  },
};`;

const WINE_TYPE_SECTIONS_CODE = `const WINE_TYPE_SECTIONS = [
  {
    id: 'red',
    name: {
      IT: 'Vini Rossi',
      EN: 'Red Wines',
      TH: 'ไวน์แดง',
      DE: 'Rotweine',
      MM: 'ဝိုင်နီ',
      ES: 'Vinos Tintos',
      FR: 'Vins Rouges',
      RU: 'Красные Вина',
      ZH: '红葡萄酒',
    },
    desc: {
      IT: 'Selezione di vini rossi strutturati, avvolgenti e armoniosi, ideali per accompagnare piatti saporiti, carni e formaggi.',
      EN: 'Curated selection of structured, full-bodied red wines, tailored for savory dishes, meats, and cheeses.',
      TH: 'คัดสรรไวน์แดงรสชาตินุ่มละมุนและเข้มข้น เหมาะสำหรับทานคู่กับอาหารจานหลักและเนื้อสัตว์',
      DE: 'Kuratierte Auswahl an strukturierten, vollmundigen Rotweinen, ideal zu herzhaften Gerichten, Fleisch und Käse.',
      MM: 'အသားဟင်းလျာများနှင့် တွဲဖက်ရန် အထူးသင့်လျော်သော အရသာပြည့်ဝ ဝိုင်နီများ။',
      ES: 'Selección de vinos tintos estructurados, envolventes y armoniosos, ideales para acompañar platos sabrosos, carnes y quesos.',
      FR: 'Sélection de vins rouges structurés, amples et harmonieux, parfaits pour accompagner plats savoureux, viandes et fromages.',
      RU: 'Коллекция полнотелых и гармоничных красных вин, идеально подходящих к мясным блюдам и сырам.',
      ZH: '精选酒体饱满、层次丰富的红葡萄酒，是搭配浓郁菜肴、肉类及奶酪的理想之选。',
    },
    badge: {
      IT: 'Corposi & Strutturati',
      EN: 'Full-Bodied',
      TH: 'เข้มข้น',
      DE: 'Vollmundig',
      MM: 'အရသာပြည့်ဝ',
      ES: 'Con Cuerpo y Estructurados',
      FR: 'Corsés & Structurés',
      RU: 'Полнотелые',
      ZH: '浓郁醇厚',
    },
    color: '#8b0000'
  },
  {
    id: 'white',
    name: {
      IT: 'Vini Bianchi',
      EN: 'White Wines',
      TH: 'ไวน์ขาว',
      DE: 'Weißweine',
      MM: 'ဝိုင်ဖြူ',
      ES: 'Vinos Blancos',
      FR: 'Vins Blancs',
      RU: 'Белые Вина',
      ZH: '白葡萄酒',
    },
    desc: {
      IT: 'Vini bianchi freschi, minerali ed eleganti, ideali per aperitivi, antipasti, primi piatti e pesce.',
      EN: 'Fresh, mineral, and fragrant white wines, crafted to pair with appetizers, pastas, and seafood dishes.',
      TH: 'ไวน์ขาวสดชื่น กลิ่นหอมผลไม้และดอกไม้ เหมาะสำหรับดื่มเรียกน้ำย่อยและอาหารทะเล',
      DE: 'Frische, mineralische und elegante Weißweine, ideal zu Vorspeisen, Pasta und Fischgerichten.',
      MM: 'ပင်လယ်စာနှင့် အဆာပြေစာများနှင့် တွဲဖက်ရန် လတ်ဆတ်မွှေးပျံ့သော ဝိုင်ဖြူများ။',
      ES: 'Vinos blancos frescos, minerales y elegantes, ideales para aperitivos, entrantes, primeros platos y pescados.',
      FR: 'Vins blancs frais, minéraux et élégants, idéals pour les apéritifs, entrées, pâtes et poissons.',
      RU: 'Свежие, минеральные и элегантные белые вина, превосходные для аперитива, пасты и рыбы.',
      ZH: '清新、优雅且富有矿物感的白葡萄酒，非常适合作为开胃酒，并搭配前菜、意面与海鲜。',
    },
    badge: {
      IT: 'Freschi & Minerali',
      EN: 'Crisp & Mineral',
      TH: 'สดชื่น',
      DE: 'Frisch & Mineralisch',
      MM: 'လတ်ဆတ်မွှေးပျံ့',
      ES: 'Frescos y Minerales',
      FR: 'Frais & Minéraux',
      RU: 'Свежие и Минеральные',
      ZH: '清新矿感',
    },
    color: '#b45309'
  },
  {
    id: 'rose',
    name: {
      IT: 'Vini Rosati',
      EN: 'Rosé Wines',
      TH: 'ไวน์โรเซ่',
      DE: 'Roséweine',
      MM: 'ရိုဇေး ဝိုင်',
      ES: 'Vinos Rosados',
      FR: 'Vins Rosés',
      RU: 'Розовые Вина',
      ZH: '桃红葡萄酒',
    },
    desc: {
      IT: 'Sfumature floreali e fruttate con un profilo fresco e versatile, perfetto per aperitivi e pietanze leggere.',
      EN: 'Delicate floral and fruity notes with a crisp, balanced profile, perfect for warm evenings and light dining.',
      TH: 'ไวน์โรเซ่สีสวย กลิ่นหอมสดชื่น ดื่มง่าย สดชื่นในทุกช่วงเวลา',
      DE: 'Florale und fruchtige Noten mit herrlicher Frische, ideal für warme Abende und leichte Küche.',
      MM: 'ပန်းရနံ့နှင့် သစ်သီးရနံ့ သင်းပျံ့သော လန်းဆန်းစေသည့် ရိုဇေးဝိုင်။',
      ES: 'Notas florales y afrutadas con un perfil fresco y versátil, perfecto para aperitivos y platos ligeros.',
      FR: 'Nuances florales et fruitées au profil frais et polyvalent, parfait pour l\\'apéritif et les plats légers.',
      RU: 'Цветочные и фруктовые ноты со свежим и универсальным вкусом, идеально для легких блюд.',
      ZH: '带有花香与果香的清新优雅风味，百搭怡人，是开胃酒和轻食的绝佳伴侣。',
    },
    badge: {
      IT: 'Floreali & Freschi',
      EN: 'Floral & Refreshing',
      TH: 'หอมละมุน',
      DE: 'Floral & Frisch',
      MM: 'ပန်းရနံ့သင်း',
      ES: 'Florales y Frescos',
      FR: 'Floraux & Frais',
      RU: 'Цветочные и Свежие',
      ZH: '花香清新',
    },
    color: '#db2777'
  },
  {
    id: 'sparkling',
    name: {
      IT: 'Spumanti',
      EN: 'Sparkling Wines',
      TH: 'สปาร์กลิงไวน์',
      DE: 'Schaumweine',
      MM: 'စပါကလင် ဝိုင်',
      ES: 'Vinos Espumosos',
      FR: 'Vins Effervescents',
      RU: 'Игристые Вина',
      ZH: '气泡起泡酒',
    },
    desc: {
      IT: 'Spumanti e prosecchi dal perlage fine e persistente, pensati per brindisi raffinati e momenti speciali.',
      EN: 'Sparkling wines and prosecco with fine, delicate perlage, crafted for celebrations and elegant toasts.',
      TH: 'สปาร์กลิงไวน์และโพรเซกโกชั้นเลิศ ฟองละเอียดนุ่มลิ้น เพื่อทุกช่วงเวลาพิเศษ',
      DE: 'Edle Schaumweine und Prosecco mit feiner Perlage für besondere Anlässe und stilvolle Momente.',
      MM: 'အထူးအခမ်းအနားများနှင့် အောင်ပွဲများအတွက် အကောင်းစား စပါကလင်နှင့် ပရိုဆက်ကို ဝိုင်များ။',
      ES: 'Espumosos y prosecco con un perlage fino y persistente, creados para brindis refinados y ocasiones especiales.',
      FR: 'Effervescents et prosecco au perlage fin et persistant, conçus pour des toasts raffinés et des moments d\\'exception.',
      RU: 'Игристые вина и просекко с тонким и стойким перляжем для праздничных тостов и особых моментов.',
      ZH: '气泡细腻持久的起泡酒与普罗塞克，专为优雅敬酒与特别时刻量身打造。',
    },
    badge: {
      IT: 'Perlage & Prestigio',
      EN: 'Fine Perlage',
      TH: 'ฟองละเอียด',
      DE: 'Feine Perlage',
      MM: 'အထူးအမြှုပ်',
      ES: 'Burbuja Fina y Prestigio',
      FR: 'Perlage Fin & Prestige',
      RU: 'Тонкий Перляж',
      ZH: '细腻气泡',
    },
    color: '#ca8a04'
  }
];`;

const DROPDOWN_LABELS_CODE = `const DROPDOWN_LABELS = {
  IT: {
    pastaFilter: 'Condimento / Tipo di Pasta',
    drinkFilter: 'Tipologia Bevanda',
    wineTypeFilter: 'Tipologia Vino',
    wineCountryFilter: 'Origine / Nazione',
  },
  EN: {
    pastaFilter: 'Sauce / Pasta Type',
    drinkFilter: 'Beverage Category',
    wineTypeFilter: 'Wine Type',
    wineCountryFilter: 'Origin / Country',
  },
  TH: {
    pastaFilter: 'ประเภทซอสพาสต้า',
    drinkFilter: 'ประเภทเครื่องดื่ม',
    wineTypeFilter: 'ประเภทไวน์',
    wineCountryFilter: 'แหล่งกำเนิด / ประเทศ',
  },
  DE: {
    pastaFilter: 'Sauce / Nudelart',
    drinkFilter: 'Getränkekategorie',
    wineTypeFilter: 'Weinsorte',
    wineCountryFilter: 'Herkunft / Land',
  },
  MM: {
    pastaFilter: 'ခေါက်ဆွဲဆော့စ် / အမျိုးအစား',
    drinkFilter: 'သောက်စရာ အမျိုးအစား',
    wineTypeFilter: 'ဝိုင် အမျိုးအစား',
    wineCountryFilter: 'မူရင်းနိုင်ငံ',
  },
  ES: {
    pastaFilter: 'Salsa / Tipo de Pasta',
    drinkFilter: 'Categoría de Bebida',
    wineTypeFilter: 'Tipo de Vino',
    wineCountryFilter: 'Origen / País',
  },
  FR: {
    pastaFilter: 'Sauce / Type de Pâtes',
    drinkFilter: 'Catégorie de Boisson',
    wineTypeFilter: 'Type de Vin',
    wineCountryFilter: 'Origine / Pays',
  },
  RU: {
    pastaFilter: 'Соус / Вид пасты',
    drinkFilter: 'Категория напитков',
    wineTypeFilter: 'Тип вина',
    wineCountryFilter: 'Страна происхождения',
  },
  ZH: {
    pastaFilter: '酱汁 / 面条种类',
    drinkFilter: '饮品分类',
    wineTypeFilter: '葡萄酒类型',
    wineCountryFilter: '产地 / 国家',
  },
};`;

// 1. Process DeliveryMenu.tsx
let deliveryContent = fs.readFileSync(deliveryMenuPath, 'utf8');

// Replace PASTA_FILTER_LABELS
deliveryContent = deliveryContent.replace(/const PASTA_FILTER_LABELS = \{[\s\S]*?\n\};/, PASTA_FILTER_LABELS_CODE);

// Replace WINE_FILTER_LABELS
deliveryContent = deliveryContent.replace(/const WINE_FILTER_LABELS = \{[\s\S]*?\n\};/, WINE_FILTER_LABELS_CODE);

// Replace WINE_TYPE_SECTIONS
deliveryContent = deliveryContent.replace(/const WINE_TYPE_SECTIONS = \[[\s\S]*?\n\];/, WINE_TYPE_SECTIONS_CODE);

// Replace DROPDOWN_LABELS
deliveryContent = deliveryContent.replace(/const DROPDOWN_LABELS = \{[\s\S]*?\n\};/, DROPDOWN_LABELS_CODE);

// Defensive lookups for WINE_FILTER_LABELS and PASTA_FILTER_LABELS in DeliveryMenu.tsx
deliveryContent = deliveryContent.replace(/WINE_FILTER_LABELS\[lang\]\.allTypes/g, '(WINE_FILTER_LABELS[lang] || WINE_FILTER_LABELS.IT).allTypes');
deliveryContent = deliveryContent.replace(/WINE_FILTER_LABELS\[lang\]\.allCountries/g, '(WINE_FILTER_LABELS[lang] || WINE_FILTER_LABELS.IT).allCountries');
deliveryContent = deliveryContent.replace(/WINE_FILTER_LABELS\[lang\]\.noWinesFound/g, '(WINE_FILTER_LABELS[lang] || WINE_FILTER_LABELS.IT).noWinesFound');
deliveryContent = deliveryContent.replace(/WINE_FILTER_LABELS\[lang\]\.resetFilters/g, '(WINE_FILTER_LABELS[lang] || WINE_FILTER_LABELS.IT).resetFilters');
deliveryContent = deliveryContent.replace(/WINE_FILTER_LABELS\[lang\]\.italianFirstBadge/g, '(WINE_FILTER_LABELS[lang] || WINE_FILTER_LABELS.IT).italianFirstBadge');
deliveryContent = deliveryContent.replace(/WINE_FILTER_LABELS\[lang\]\.winesCount/g, '(WINE_FILTER_LABELS[lang] || WINE_FILTER_LABELS.IT).winesCount');
deliveryContent = deliveryContent.replace(/PASTA_FILTER_LABELS\[lang\]\.all/g, '(PASTA_FILTER_LABELS[lang] || PASTA_FILTER_LABELS.IT).all');
deliveryContent = deliveryContent.replace(/activeSection\.name\[lang\]/g, '(activeSection.name[lang] || activeSection.name.IT || activeSection.name.EN)');

fs.writeFileSync(deliveryMenuPath, deliveryContent, 'utf8');
console.log('Successfully updated DeliveryMenu.tsx');

// 2. Process DiningTabletSite.tsx
let diningContent = fs.readFileSync(diningTabletPath, 'utf8');

// Replace WINE_FILTER_LABELS in DiningTabletSite
diningContent = diningContent.replace(/const WINE_FILTER_LABELS = \{[\s\S]*?\n\};/, WINE_FILTER_LABELS_CODE);

// Replace WINE_TYPE_SECTIONS in DiningTabletSite
diningContent = diningContent.replace(/const WINE_TYPE_SECTIONS = \[[\s\S]*?\n\];/, WINE_TYPE_SECTIONS_CODE);

// Inject DROPDOWN_LABELS if missing
if (!diningContent.includes('const DROPDOWN_LABELS =')) {
  diningContent = diningContent.replace(WINE_TYPE_SECTIONS_CODE, WINE_TYPE_SECTIONS_CODE + '\n\n' + DROPDOWN_LABELS_CODE);
}

// Defensive lookups for DiningTabletSite
diningContent = diningContent.replace(/WINE_FILTER_LABELS\[lang\]\.allTypes/g, '(WINE_FILTER_LABELS[lang] || WINE_FILTER_LABELS.IT).allTypes');
diningContent = diningContent.replace(/WINE_FILTER_LABELS\[lang\]\.allCountries/g, '(WINE_FILTER_LABELS[lang] || WINE_FILTER_LABELS.IT).allCountries');
diningContent = diningContent.replace(/WINE_FILTER_LABELS\[lang\]\.noWinesFound/g, '(WINE_FILTER_LABELS[lang] || WINE_FILTER_LABELS.IT).noWinesFound');
diningContent = diningContent.replace(/WINE_FILTER_LABELS\[lang\]\.resetFilters/g, '(WINE_FILTER_LABELS[lang] || WINE_FILTER_LABELS.IT).resetFilters');
diningContent = diningContent.replace(/WINE_FILTER_LABELS\[lang\]\.italianFirstBadge/g, '(WINE_FILTER_LABELS[lang] || WINE_FILTER_LABELS.IT).italianFirstBadge');
diningContent = diningContent.replace(/WINE_FILTER_LABELS\[lang\]\.winesCount/g, '(WINE_FILTER_LABELS[lang] || WINE_FILTER_LABELS.IT).winesCount');

// Align labels
diningContent = diningContent.replace(/label="Tipologia Vino"/g, 'label={(DROPDOWN_LABELS[lang] || DROPDOWN_LABELS.IT).wineTypeFilter}');
diningContent = diningContent.replace(/label="Origine \/ Nazione"/g, 'label={(DROPDOWN_LABELS[lang] || DROPDOWN_LABELS.IT).wineCountryFilter}');

fs.writeFileSync(diningTabletPath, diningContent, 'utf8');
console.log('Successfully updated DiningTabletSite.tsx');
