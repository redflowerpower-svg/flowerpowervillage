import { Language } from '../config/languages';

export const i18n = {
  // ── 1. GLOBAL NAVIGATION & HEADER ──────────────────────────────────────────
  nav: {
    home: {
      IT: 'HOME',
      EN: 'HOME',
      TH: 'หน้าแรก',
      DE: 'STARTSEITE',
    },
    order: {
      IT: 'ORDINA ONLINE',
      EN: 'ORDER ONLINE',
      TH: 'สั่งอาหารออนไลน์',
      DE: 'ONLINE BESTELLEN',
    },
    about: {
      IT: 'CHI SIAMO',
      EN: 'ABOUT US',
      TH: 'เกี่ยวกับเรา',
      DE: 'ÜBER UNS',
    },
    contact: {
      IT: 'CONTATTI',
      EN: 'CONTACT',
      TH: 'ติดต่อเรา',
      DE: 'KONTAKT',
    },
    bookTable: {
      IT: 'PRENOTA TAVOLO',
      EN: 'BOOK TABLE',
      TH: 'จองโต๊ะ',
      DE: 'TISCH RESERVIEREN',
    },
    openDaily: {
      IT: 'Aperto tutti i giorni',
      EN: 'Open Daily',
      TH: 'เปิดบริการทุกวัน',
      DE: 'Täglich geöffnet',
    },
    cart: {
      IT: 'CARRELLO',
      EN: 'CART',
      TH: 'รถเข็น',
      DE: 'WARENKORB',
    },
    callUs: {
      IT: 'Chiama',
      EN: 'Call us',
      TH: 'โทรหาเรา',
      DE: 'Anrufen',
    },
  },

  // ── 2. DELIVERY MENU PAGE & BANNERS ───────────────────────────────────────
  deliveryMenu: {
    heroTitle: {
      IT: 'Flower Power Pizza',
      EN: 'Flower Power Pizza',
      TH: 'ฟลาวเวอร์ พาวเวอร์ พิซซ่า',
      DE: 'Flower Power Pizza',
    },
    heroSubtitle: {
      IT: 'Ranong, Thailandia',
      EN: 'Ranong, Thailand',
      TH: 'ระนอง, ประเทศไทย',
      DE: 'Ranong, Thailand',
    },
    tagline1: {
      IT: 'PIZZA & CUCINA ITALIANA',
      EN: 'PIZZA & ITALIAN CUISINE',
      TH: 'พิซซ่าและอาหารอิตาเลียน',
      DE: 'PIZZA & ITALIENISCHE KÜCHE',
    },
    tagline2: {
      IT: 'Cuoca Italiana • Ingredienti Importati • 90% Idratazione',
      EN: 'Italian Chef • Imported Ingredients • 90% Hydration',
      TH: 'เชฟหญิงชาวอิตาลี • วัตถุดิบนำเข้า • แป้งสูตรพิเศษไฮเดรชั่น 90%',
      DE: 'Italienische Köchin • Importierte Zutaten • 90% Hydration',
    },
    infoHours: {
      IT: '11:00 – 21:30',
      EN: '11:00 – 21:30',
      TH: '11:00 – 21:30',
      DE: '11:00 – 21:30',
    },
    infoDeliveryPickup: {
      IT: 'Consegna a Domicilio & Ritiro',
      EN: 'Delivery & Takeaway',
      TH: 'บริการจัดส่งเดลิเวอรี่และรับที่ร้าน',
      DE: 'Lieferung & Abholung',
    },
    cartItemsCount: {
      IT: (n: number) => (n === 1 ? '1 prodotto nel carrello' : `${n} prodotti nel carrello`),
      EN: (n: number) => (n === 1 ? '1 item in cart' : `${n} items in cart`),
      TH: (n: number) => `${n} รายการในรถเข็น`,
      DE: (n: number) => (n === 1 ? '1 Artikel im Warenkorb' : `${n} Artikel im Warenkorb`),
    },
    promoTitle: {
      IT: 'Promozioni & Consegna a Domicilio',
      EN: 'Promotions & Delivery Info',
      TH: 'โปรโมชั่นและข้อมูลการจัดส่ง',
      DE: 'Aktionen & Lieferinformationen',
    },
    deliveryLimitNotice: {
      IT: 'Le consegne a domicilio si effettuano esclusivamente per la città di Ranong.',
      EN: 'Deliveries are made exclusively within the city of Ranong.',
      TH: 'บริการจัดส่งเดลิเวอรี่เฉพาะในเขตตัวเมืองระนองเท่านั้น',
      DE: 'Lieferungen erfolgen ausschließlich innerhalb der Stadt Ranong.',
    },
    promoFreeDelivery: {
      IT: 'Consegna GRATIS per ordini superiori a 300฿',
      EN: 'FREE delivery on orders over 300฿',
      TH: 'จัดส่งฟรี เมื่อสั่งซื้อครบ 300฿ ขึ้นไป',
      DE: 'KOSTENLOSE Lieferung ab 300฿ Bestellwert',
    },
    promoFirstOrder: {
      IT: '10% di sconto sul tuo primo ordine online',
      EN: '10% discount on your first online order',
      TH: 'ส่วนลด 10% สำหรับการสั่งซื้อออนไลน์ครั้งแรก',
      DE: '10% Rabatt auf Ihre erste Online-Bestellung',
    },
    bookTableBadge: {
      IT: 'RISTORANTE',
      EN: 'DINE-IN',
      TH: 'ทานที่ร้าน',
      DE: 'RESTAURANT',
    },
    bookTableTitle: {
      IT: 'Prenota un Tavolo o Capanna',
      EN: 'Book a Table or Bamboo Hut',
      TH: 'จองโต๊ะหรือซุ้มกระท่อมไม้ไผ่',
      DE: 'Tisch oder Bambushütte reservieren',
    },
    bookTableSubtitle: {
      IT: "Al chiuso, all'aperto o in capanna",
      EN: 'Indoor, outdoor garden tables or bamboo hut',
      TH: 'โซนในร่ม, โต๊ะกลางแจ้ง หรือ ซุ้มไม้ไผ่',
      DE: 'Innenbereich, Außenbereich oder Gartenhütte',
    },
    bookTableBtn: {
      IT: 'PRENOTA ORA',
      EN: 'BOOK NOW',
      TH: 'จองเลย',
      DE: 'JETZT RESERVIEREN',
    },
    searchPlaceholder: {
      IT: 'Cerca piatti, pizze, ingredienti...',
      EN: 'Search dishes, pizzas, ingredients...',
      TH: 'ค้นหาเมนูอาหาร, พิซซ่า, วัตถุดิบ...',
      DE: 'Gerichte, Pizzen, Zutaten suchen...',
    },
    filterAll: {
      IT: 'TUTTO',
      EN: 'ALL',
      TH: 'ทั้งหมด',
      DE: 'ALLE',
    },
    filterHalalChicken: {
      IT: 'Opzione 100% Pollo (Halal-friendly)',
      EN: '100% Chicken Option (Halal-friendly)',
      TH: 'ตัวเลือกเนื้อไก่ 100% (ฮาลาล)',
      DE: '100% Geflügel (Halal-friendly)',
    },
    sauceFilterAll: {
      IT: 'Tutte le salse',
      EN: 'All sauces',
      TH: 'ซอสทั้งหมด',
      DE: 'Alle Saucen',
    },
  },

  // ── 3. CATEGORIES & SUBTITLES ─────────────────────────────────────────────
  categories: {
    'daily-specials': {
      name: {
        IT: 'Specialità del Giorno',
        EN: 'Daily Specials',
        TH: 'เมนูพิเศษประจำวัน',
        DE: 'Tagesempfehlungen',
      },
      desc: {
        IT: 'Creazioni esclusive e piatti speciali del giorno preparati dal nostro chef con ingredienti freschi di stagione',
        EN: 'Exclusive daily creations and seasonal specialties freshly prepared by our Italian chef with premium ingredients',
        TH: 'เมนูพิเศษประจำวันรังสรรค์โดยเชฟชาวอิตาเลียน ด้วยวัตถุดิบสดใหม่ตามฤดูกาลและรสชาติอิตาเลียนแท้',
        DE: 'Täglich wechselnde Spezialitäten und saisonale Gerichte unseres Chefkochs aus frischen Zutaten',
      },
    },
    'traditional-italian-pizza': {
      name: {
        IT: 'Pizze Classiche',
        EN: 'Classic Italian Pizzas',
        TH: 'พิซซ่าอิตาเลียนคลาสสิก',
        DE: 'Klassische Italienische Pizzen',
      },
      desc: {
        IT: 'Farina 100% italiana, 90% idratazione estrema e 48 ore di lenta lievitazione naturale',
        EN: '100% Italian flour, extreme 90% hydration, and 48h slow natural fermentation',
        TH: 'แป้งสาลีอิตาลี 100% ไฮเดรชั่น 90% และหมักธรรมชาติ 48 ชั่วโมง เบาย่อยง่าย',
        DE: '100% italienisches Mehl, 90% Hydration und 48 Stunden langsame Naturfermentation',
      },
    },
    'pasta': {
      name: {
        IT: 'Pasta Fresca Fatta a Mano',
        EN: 'Fresh Handmade Pasta',
        TH: 'พาสต้าสดทำมือ',
        DE: 'Frische Handgemachte Pasta',
      },
      desc: {
        IT: 'Tagliatelle, spaghetti e gnocchi tirati a mano ogni giorno con sughi della tradizione',
        EN: 'Fresh handmade tagliatelle, spaghetti, and gnocchi paired with authentic Italian sauces',
        TH: 'ทัลยาเตลเล่ สปาเก็ตตี้ และย็อกกี ทำสดใหม่ทุกวันพร้อมซอสสูตรดั้งเดิมเข้มข้น',
        DE: 'Täglich frisch handgemachte Tagliatelle, Spaghetti und Gnocchi mit traditionellen Saucen',
      },
    },
    'italian-salads': {
      name: {
        IT: 'Insalate Italiane',
        EN: 'Italian Salads',
        TH: 'สลัดสไตล์อิตาเลียน',
        DE: 'Italienische Salate',
      },
      desc: {
        IT: 'Verdure fresche, formaggi italiani e olio extravergine d\'oliva',
        EN: 'Crisp fresh greens, Italian cheeses, and extra virgin olive oil',
        TH: 'ผักสดกรอบ ชีสนำเข้าจากอิตาลี และน้ำมันมะกอกบริสุทธิ์พิเศษ',
        DE: 'Frisches Gemüse, italienischer Käse und natives Olivenöl extra',
      },
    },
    'pizza-sandwich': {
      name: {
        IT: 'Pizza Sandwich',
        EN: 'Pizza Sandwiches',
        TH: 'พิซซ่าแซนด์วิช',
        DE: 'Pizza-Sandwiches',
      },
      desc: {
        IT: 'Pane pizza appena sfornato, caldo e farcito con ingredienti gourmet',
        EN: 'Freshly baked pizza dough bread stuffed with gourmet Italian fillings',
        TH: 'แป้งพิซซ่าอบใหม่ร้อนๆ สอดไส้วัตถุดิบกูร์เมต์สไตล์อิตาเลียน',
        DE: 'Frisch gebackenes Pizzabrot, gefüllt mit Gourmet-Zutaten',
      },
    },
    'pizza-burgers': {
      name: {
        IT: 'Pizza Burger',
        EN: 'Pizza Burgers',
        TH: 'พิซซ่าเบอร์เกอร์',
        DE: 'Pizza-Burger',
      },
      desc: {
        IT: 'Hamburger artigianali cotti e serviti nel nostro fragrante impasto pizza',
        EN: 'Artisan burgers baked inside our fragrant, crispy pizza dough bun',
        TH: 'เบอร์เกอร์โฮมเมดเนื้อฉ่ำ อบในแป้งพิซซ่าหอมกรอบนอกนุ่มใน',
        DE: 'Hausgemachte Burger, serviert in unserem knusprigen Pizzateig-Brötchen',
      },
    },
    'french-fries': {
      name: {
        IT: 'Patatine Fritte & Snack',
        EN: 'French Fries & Sides',
        TH: 'เฟรนช์ฟรายส์และของทานเล่น',
        DE: 'Pommes Frites & Snacks',
      },
      desc: {
        IT: 'Dorate, croccanti e servite caldissime',
        EN: 'Golden, crispy, and served piping hot',
        TH: 'ทอดสดใหม่ สีเหลืองทอง กรอบอร่อยเสิร์ฟร้อนๆ',
        DE: 'Goldgelb, knusprig und heiß serviert',
      },
    },
    'desserts': {
      name: {
        IT: 'Dolci & Pasticceria',
        EN: 'Desserts & Sweets',
        TH: 'ของหวานและของหวานโฮมเมด',
        DE: 'Desserts & Süßspeisen',
      },
      desc: {
        IT: 'Tiramisù tradizionale fatto in casa e specialità dolciarie',
        EN: 'Traditional homemade Italian tiramisù and artisanal desserts',
        TH: 'ทิรามิสุสูตรต้นตำรับอิตาลีแท้ และขนมหวานโฮมเมดสูตรพิเศษ',
        DE: 'Traditionelles hausgemachtes Tiramisù und handwerkliche Desserts',
      },
    },
    'breakfast-and-snacks': {
      name: {
        IT: 'Colazione & Toast',
        EN: 'Breakfast & Toast',
        TH: 'อาหารเช้าและโทสต์',
        DE: 'Frühstück & Snacks',
      },
      desc: {
        IT: 'Per iniziare la giornata con energia e gusto',
        EN: 'Start your morning with fresh taste and energy',
        TH: 'เริ่มต้นวันใหม่อย่างสดชื่นด้วยเมนูอาหารเช้าแสนอร่อย',
        DE: 'Für einen perfekten und energiereichen Start in den Tag',
      },
    },
    'coffee-shop': {
      name: {
        IT: 'Caffetteria Italiana',
        EN: 'Italian Coffee Shop',
        TH: 'กาแฟอิตาเลียน',
        DE: 'Italienische Kaffeebar',
      },
      desc: {
        IT: 'Caffè espresso, cappuccino e bevande calde preparate a regola d\'arte',
        EN: 'Authentic Italian espresso, cappuccino, and handcrafted hot drinks',
        TH: 'เอสเพรสโซ่อิตาเลียนแท้ คาปูชิโน่ฟองนุ่ม และเครื่องดื่มร้อนระดับพรีเมียม',
        DE: 'Authentischer italienischer Espresso, Cappuccino und Kaffeespezialitäten',
      },
    },
    'fruit-drinks': {
      name: {
        IT: 'Frullati & Smoothies',
        EN: 'Fruit Shakes & Smoothies',
        TH: 'สมูทตี้และน้ำผลไม้สด',
        DE: 'Frucht-Shakes & Smoothies',
      },
      desc: {
        IT: 'Frutta fresca tropicale di Ranong frullata al momento',
        EN: 'Fresh local tropical fruits from Ranong, blended to order',
        TH: 'ผลไม้เมืองร้อนสดใหม่จากระนอง ปั่นสดแก้วต่อแก้วเพื่อสุขภาพ',
        DE: 'Frische tropische Früchte aus Ranong, frisch zubereitet',
      },
    },
    'soft-drinks': {
      name: {
        IT: 'Bibite & Acqua Minerale',
        EN: 'Soft Drinks & Mineral Water',
        TH: 'น้ำอัดลมและน้ำดื่ม',
        DE: 'Erfrischungsgetränke & Wasser',
      },
      desc: {
        IT: 'Bibite analcoliche in lattina, acqua minerale naturale e bevande rinfrescanti servite fredde',
        EN: 'Canned soft drinks, natural mineral water, and chilled refreshing beverages',
        TH: 'น้ำอัดลมกระป๋อง น้ำดื่มธรรมชาติ และเครื่องดื่มเพิ่มความสดชื่นเสิร์ฟเย็น',
        DE: 'Erfrischungsgetränke in der Dose, natürliches Mineralwasser und gekühlte Getränke',
      },
    },
    'beers': {
      name: {
        IT: 'Birre',
        EN: 'Beers',
        TH: 'เบียร์',
        DE: 'Biere',
      },
      desc: {
        IT: 'Le migliori marche di birra servite in bottiglia ghiacciata per esaltare al massimo il sapore',
        EN: 'The best bottled beers served ice cold to enhance flavor and refreshment',
        TH: 'เบียร์ขวดชั้นนำเสิร์ฟเย็นเจี๊ยบ เพื่อรสชาติและความสดชื่นเต็มเปี่ยม',
        DE: 'Beste Flaschenbiere eiskalt serviert für den perfekten Genuss',
      },
    },
    'beers-and-wines': {
      name: {
        IT: 'Birre & Vini',
        EN: 'Beers & Wines',
        TH: 'เบียร์และไวน์',
        DE: 'Biere & Weine',
      },
      desc: {
        IT: 'Birre fresche e selezione di vini italiani',
        EN: 'Chilled beers and curated Italian wine selection',
        TH: 'เบียร์เย็นๆ และไวน์อิตาเลียนคัดสรร',
        DE: 'Gekühlte Biere und ausgewählte italienische Weine',
      },
    },
    'wines': {
      name: {
        IT: 'Carta dei Vini',
        EN: 'Wine List',
        TH: 'รายการไวน์คัดสรร',
        DE: 'Weinkarte',
      },
      desc: {
        IT: 'Selezione accurata di vini italiani ed internazionali',
        EN: 'Carefully curated selection of fine Italian and international wines',
        TH: 'คัดสรรไวน์อิตาเลียนและไวน์นานาชาติชั้นเลิศอย่างพิถีพิถัน',
        DE: 'Sorgfältig zusammengestellte Auswahl an italienischen und internationalen Weinen',
      },
    },
  },

  // ── 4. MENU GRID & PRODUCT CUSTOMIZATION ─────────────────────────────────
  menuGrid: {
    sizeOptions: {
      IT: 'Opzioni Taglia',
      EN: 'Size Options',
      TH: 'เลือกขนาด',
      DE: 'Größenoptionen',
    },
    extraIngredients: {
      IT: 'Ingredienti Extra',
      EN: 'Extra Ingredients',
      TH: 'เพิ่มท็อปปิ้ง / วัตถุดิบพิเศษ',
      DE: 'Zusätzliche Zutaten',
    },
    startingAt: {
      IT: 'A partire da',
      EN: 'Starting at',
      TH: 'เริ่มต้นที่',
      DE: 'Ab',
    },
    totalFinito: {
      IT: 'Totale Finito',
      EN: 'Total Price',
      TH: 'ราคารวมสุทธิ',
      DE: 'Gesamtpreis',
    },
    confirmText: {
      IT: 'Aggiungi al Carrello',
      EN: 'Add to Cart',
      TH: 'เพิ่มลงในรถเข็น',
      DE: 'In den Warenkorb',
    },
    closeText: {
      IT: 'Chiudi',
      EN: 'Close',
      TH: 'ปิด',
      DE: 'Schließen',
    },
    customizeText: {
      IT: 'Personalizza',
      EN: 'Customize',
      TH: 'ปรับแต่งเมนู',
      DE: 'Anpassen',
    },
    chooseText: {
      IT: 'Aggiungi',
      EN: 'Add',
      TH: 'เพิ่ม',
      DE: 'Hinzufügen',
    },
    freeText: {
      IT: 'Gratis',
      EN: 'Free',
      TH: 'ฟรี',
      DE: 'Kostenlos',
    },
    lasagnaBadge: {
      IT: '🍝 Min. 2 persone · Prenotazione con 1 giorno di anticipo',
      EN: '🍝 Min. 2 people · Pre-order 1 day in advance',
      TH: '🍝 ขั้นต่ำ 2 ท่าน · สั่งจองล่วงหน้า 1 วัน',
      DE: '🍝 Min. 2 Personen · 1 Tag im Voraus vorbestellen',
    },
    lasagnaDateLabel: {
      IT: 'Seleziona data di ritiro / consegna',
      EN: 'Select pickup / delivery date',
      TH: 'เลือกวันที่ต้องการรับ / จัดส่ง',
      DE: 'Abhol- / Lieferdatum wählen',
    },
    lasagnaDatePlaceholder: {
      IT: 'Scegli una data...',
      EN: 'Choose a date...',
      TH: 'เลือกวันที่...',
      DE: 'Datum auswählen...',
    },
    lasagnaDateRequired: {
      IT: '⚠️ Seleziona una data per procedere',
      EN: '⚠️ Please select a date to proceed',
      TH: '⚠️ กรุณาเลือกวันที่ก่อนดำเนินการ',
      DE: '⚠️ Bitte ein Datum auswählen',
    },
    lasagnaWhyLabel: {
      IT: 'La preparazione richiede tempo per garantire il massimo della bontà artigianale.',
      EN: 'Preparation takes time to guarantee peak artisan quality.',
      TH: 'การปรุงสดใหม่ต้องใช้เวลาเพื่อรสชาติและความอร่อยสูงสุด',
      DE: 'Die frische Zubereitung erfordert Zeit für beste Qualität.',
    },
    splitVariantName: {
      IT: '12" Metà & Metà 🌓',
      EN: '12" Half & Half 🌓',
      TH: '12" ฮาล์ฟ & ฮาล์ฟ 🌓',
      DE: '12" Halb & Halb 🌓',
    },
    splitChooseSecondHalf: {
      IT: 'Scegli la 2ª metà',
      EN: 'Choose 2nd half',
      TH: 'เลือกหน้าพิซซ่าสำหรับครึ่งที่ 2',
      DE: '2. Hälfte wählen',
    },
    splitSearchPlaceholder: {
      IT: 'Cerca pizza per la 2ª metà...',
      EN: 'Search pizza for 2nd half...',
      TH: 'ค้นหาพิซซ่าสำหรับครึ่งที่ 2...',
      DE: 'Pizza für 2. Hälfte suchen...',
    },
    splitFirstHalfLabel: {
      IT: '1ª Metà (Base)',
      EN: '1st Half (Base)',
      TH: 'ครึ่งที่ 1 (รสชาติหลัก)',
      DE: '1. Hälfte (Basis)',
    },
    splitSecondHalfLabel: {
      IT: '2ª Metà',
      EN: '2nd Half',
      TH: 'ครึ่งที่ 2',
      DE: '2. Hälfte',
    },
    splitSecondHalfRequired: {
      IT: '⚠️ Seleziona la 2ª metà per procedere',
      EN: '⚠️ Please select the 2nd half to proceed',
      TH: '⚠️ กรุณาเลือกครึ่งที่ 2 เพื่อดำเนินการต่อ',
      DE: '⚠️ Bitte 2. Hälfte auswählen',
    },
    splitAverageNotice: {
      IT: 'Prezzo 50/50: media esatta dei due gusti 12"',
      EN: '50/50 price: exact average of both 12" flavours',
      TH: 'ราคา 50/50: คำนวณจากค่าเฉลี่ยของทั้งสองหน้ารวมกัน',
      DE: '50/50-Preis: Exakter Durchschnitt beider 12"-Sorten',
    },
    splitSelectedBadge: {
      IT: 'Gusto Scelto',
      EN: 'Selected Flavor',
      TH: 'รสชาติที่เลือก',
      DE: 'Ausgewählte Sorte',
    },
    chickenOptionTitle: {
      IT: 'Opzione 100% Pollo (Halal-friendly)',
      EN: '100% Chicken Option (Halal-friendly)',
      TH: 'ตัวเลือกเนื้อไก่ 100% (ฮาลาล)',
      DE: '100% Geflügel (Halal-friendly)',
    },
    chickenOptionDesc: {
      IT: 'Sostituisce salumi/maiale con saporito pollo',
      EN: 'Replaces pork/cold cuts with seasoned chicken',
      TH: 'เปลี่ยนเนื้อหมู/ไส้กรอกหมูเป็นเนื้อไก่ปรุงรส',
      DE: 'Ersetzt Schwein/Wurstwaren durch Geflügel',
    },
    chickenOptionSelected: {
      IT: 'Pollo Selezionato',
      EN: 'Chicken Selected',
      TH: 'เลือกเนื้อไก่แล้ว',
      DE: 'Geflügel Ausgewählt',
    },
    chickenOptionSelect: {
      IT: '+ Scegli Pollo',
      EN: '+ Choose Chicken',
      TH: '+ เลือกเนื้อไก่',
      DE: '+ Geflügel Wählen',
    },
  },

  // ── 5. CART DRAWER & PROMOTIONS ───────────────────────────────────────────
  cart: {
    title: {
      IT: 'Il Tuo Ordine',
      EN: 'Your Order',
      TH: 'รายการสั่งซื้อของคุณ',
      DE: 'Ihre Bestellung',
    },
    emptyTitle: {
      IT: 'Il tuo carrello è vuoto',
      EN: 'Your cart is empty',
      TH: 'รถเข็นของคุณยังว่างอยู่',
      DE: 'Ihr Warenkorb ist leer',
    },
    emptyDesc: {
      IT: 'Aggiungi le nostre specialità autentiche dal menu online',
      EN: 'Add our authentic specialties from the online menu',
      TH: 'เลือกเพิ่มเมนูอร่อยจากเมนูออนไลน์ของเราได้เลย',
      DE: 'Fügen Sie Spezialitäten aus der Online-Speisekarte hinzu',
    },
    totalText: {
      IT: 'Totale Ordine',
      EN: 'Order Total',
      TH: 'ยอดรวมทั้งสิ้น',
      DE: 'Gesamtsumme',
    },
    subtotalText: {
      IT: 'Subtotale',
      EN: 'Subtotal',
      TH: 'ยอดรวมย่อย',
      DE: 'Zwischensumme',
    },
    firstOrderDiscountText: {
      IT: 'Sconto 1° Ordine (10%)',
      EN: '1st Order Discount (10%)',
      TH: 'ส่วนลดสั่งซื้อครั้งแรก (10%)',
      DE: 'Erstbesteller-Rabatt (10%)',
    },
    couponLabel: {
      IT: 'Codice Promo / Coupon',
      EN: 'Promo Code / Coupon',
      TH: 'โค้ดส่วนลด / คูปอง',
      DE: 'Gutscheincode / Coupon',
    },
    couponPlaceholder: {
      IT: 'Inserisci codice',
      EN: 'Enter promo code',
      TH: 'ใส่โค้ดส่วนลด',
      DE: 'Code eingeben',
    },
    applyBtn: {
      IT: 'Applica',
      EN: 'Apply',
      TH: 'ใช้โค้ด',
      DE: 'Anwenden',
    },
    removeBtn: {
      IT: 'Rimuovi',
      EN: 'Remove',
      TH: 'ลบ',
      DE: 'Entfernen',
    },
    deliveryText: {
      IT: 'Consegna a Domicilio',
      EN: 'Delivery Fee',
      TH: 'ค่าจัดส่ง',
      DE: 'Liefergebühr',
    },
    freeText: {
      IT: 'Gratis',
      EN: 'Free',
      TH: 'ฟรี',
      DE: 'Kostenlos',
    },
    freeDeliveryApplied: {
      IT: 'Consegna GRATIS applicata! (Ordine > 300฿)',
      EN: 'FREE delivery applied! (Order > 300฿)',
      TH: 'จัดส่งฟรี! (ยอดสั่งซื้อเกิน 300฿)',
      DE: 'KOSTENLOSE Lieferung angewendet! (Bestellung > 300฿)',
    },
    welcomeTitle: {
      IT: 'BENVENUTO! SCONTO 10% APPLICATO',
      EN: 'WELCOME! 10% DISCOUNT UNLOCKED',
      TH: 'ยินดีต้อนรับ! คุณได้รับส่วนลด 10%',
      DE: 'WILLKOMMEN! 10% RABATT AKTIVIERT',
    },
    welcomePromoDesc: {
      IT: 'Questa è la tua prima ordinazione: abbiamo applicato per te il 10% di sconto sul cibo!',
      EN: 'This is your first order: 10% welcome discount has been applied to your food!',
      TH: 'นี่คือการสั่งซื้อครั้งแรกของคุณ: เรามอบส่วนลด 10% สำหรับค่าอาหารให้คุณทันที!',
      DE: 'Dies ist Ihre erste Bestellung: 10% Willkommensrabatt wurden angewendet!',
    },
    youSaveText: {
      IT: (s: number) => `Risparmi ${s}฿`,
      EN: (s: number) => `You save ${s}฿`,
      TH: (s: number) => `คุณประหยัดได้ ${s}฿`,
      DE: (s: number) => `Sie sparen ${s}฿`,
    },
    checkoutBtn: {
      IT: 'Procedi al Checkout',
      EN: 'Proceed to Checkout',
      TH: 'ดำเนินการสั่งซื้อและชำระเงิน',
      DE: 'Zur Kasse gehen',
    },
    ordersPausedBtn: {
      IT: 'Ordinazioni Momentaneamente Sospese',
      EN: 'Orders Temporarily Paused',
      TH: 'งดรับออเดอร์ชั่วคราว',
      DE: 'Bestellungen vorübergehend pausiert',
    },
    ordersClosedBtn: {
      IT: 'Pizzeria al momento Chiusa',
      EN: 'Pizzeria Currently Closed',
      TH: 'ร้านปิดให้บริการในขณะนี้',
      DE: 'Pizzeria derzeit geschlossen',
    },
    callPizzeria: {
      IT: 'Chiama la Pizzeria (Ranong)',
      EN: 'Call Pizzeria (Ranong)',
      TH: 'โทรติดต่อร้าน (ระนอง)',
      DE: 'Pizzeria anrufen (Ranong)',
    },
    footerInfo: {
      IT: 'Pagamento sicuro PromptPay QR / Carta • Consegna a Ranong',
      EN: 'Secure PromptPay QR / Card payment • Delivery in Ranong',
      TH: 'ชำระเงินปลอดภัยด้วย PromptPay QR / บัตรเครดิต • จัดส่งในตัวเมืองระนอง',
      DE: 'Sichere Zahlung per PromptPay QR / Karte • Lieferung in Ranong',
    },
  },

  // ── 6. CHECKOUT FLOW & PAYMENT ───────────────────────────────────────────
  checkout: {
    steps: {
      details: {
        IT: '1. Dati & Consegna',
        EN: '1. Details & Delivery',
        TH: '1. ข้อมูลและการจัดส่ง',
        DE: '1. Daten & Lieferung',
      },
      payment: {
        IT: '2. Pagamento',
        EN: '2. Payment',
        TH: '2. การชำระเงิน',
        DE: '2. Bezahlung',
      },
      confirmation: {
        IT: '3. Conferma',
        EN: '3. Confirmation',
        TH: '3. ยืนยันคำสั่งซื้อ',
        DE: '3. Bestätigung',
      },
    },
    nameLabel: {
      IT: 'Nome e Cognome',
      EN: 'Full Name',
      TH: 'ชื่อ-นามสกุล',
      DE: 'Vollständiger Name',
    },
    phoneLabel: {
      IT: 'Numero di Telefono (Thailandese o Internazionale)',
      EN: 'Phone Number (Thai or International)',
      TH: 'เบอร์โทรศัพท์ (เบอร์ไทยหรือต่างประเทศ)',
      DE: 'Telefonnummer (Thai oder international)',
    },
    emailLabel: {
      IT: 'Indirizzo Email (per ricevere la ricevuta)',
      EN: 'Email Address (for order receipt)',
      TH: 'อีเมล (สำหรับรับใบเสร็จ)',
      DE: 'E-Mail-Adresse (für die Quittung)',
    },
    addressLabel: {
      IT: 'Indirizzo di Consegna a Ranong (Hotel, Resort o Via)',
      EN: 'Delivery Address in Ranong (Hotel, Resort, or Street)',
      TH: 'ที่อยู่จัดส่งในระนอง (โรงแรม, รีสอร์ท หรือชื่อถนน/ซอย)',
      DE: 'Lieferadresse in Ranong (Hotel, Resort oder Straße)',
    },
    notesLabel: {
      IT: 'Note speciali per la consegna / rider',
      EN: 'Special delivery / rider notes',
      TH: 'หมายเหตุเพิ่มเติมสำหรับคนขับส่งอาหาร',
      DE: 'Besondere Lieferhinweise für den Fahrer',
    },
    paymentMethods: {
      promptpay: {
        title: {
          IT: 'PromptPay QR Code (Tailandia)',
          EN: 'PromptPay QR Code (Thailand)',
          TH: 'พร้อมเพย์ คิวอาร์โค้ด (PromptPay QR)',
          DE: 'PromptPay QR-Code (Thailand)',
        },
        desc: {
          IT: 'Scansiona istantaneamente con qualsiasi app bancaria thailandese (SCB, KBank, BBL, Krungthai)',
          EN: 'Scan instantly with any Thai banking mobile app (SCB, KBank, BBL, Krungthai)',
          TH: 'สแกนจ่ายได้ทันทีด้วยแอปธนาคารไทยทุกธนาคาร (SCB, KBank, BBL, Krungthai ฯลฯ)',
          DE: 'Sofort scannen mit jeder thailändischen Bank-App',
        },
      },
      creditCard: {
        title: {
          IT: 'Carta di Credito / Debito Internazionale',
          EN: 'Credit / Debit Card (International & Thai)',
          TH: 'บัตรเครดิต / บัตรเดบิต (สากลและไทย)',
          DE: 'Kredit- / Debitkarte (International & Thai)',
        },
        desc: {
          IT: 'Pagamento protetto 3D-Secure con Visa, Mastercard, JCB tramite gateway certificato Omise',
          EN: '3D-Secure protected payment with Visa, Mastercard, JCB via Omise gateway',
          TH: 'ชำระเงินปลอดภัยด้วยระบบ 3D-Secure ผ่าน Visa, Mastercard, JCB ผ่าน Omise Gateway',
          DE: '3D-Secure-geschützte Zahlung mit Visa, Mastercard, JCB',
        },
      },
      cash: {
        title: {
          IT: 'Contanti alla Consegna (Cash on Delivery)',
          EN: 'Cash on Delivery',
          TH: 'ชำระเงินสดปลายทางเมื่อได้รับอาหาร',
          DE: 'Barzahlung bei Lieferung',
        },
        desc: {
          IT: 'Paga in contanti (Baht THB) direttamente al nostro rider all\'arrivo',
          EN: 'Pay in cash (Thai Baht THB) directly to the delivery rider',
          TH: 'ชำระเงินสด (บาท THB) กับคนขับส่งอาหารโดยตรงเมื่ออาหารไปถึง',
          DE: 'Barzahlung (THB) direkt beim Fahrer',
        },
      },
    },
    placeOrderBtn: {
      IT: 'Conferma e Invia Ordine',
      EN: 'Confirm & Place Order',
      TH: 'ยืนยันและส่งคำสั่งซื้อ',
      DE: 'Bestellung abschicken',
    },
  },

  // ── 7. ABOUT US & STORY ───────────────────────────────────────────────────
  about: {
    badge: {
      IT: 'La Nostra Storia & Filosofia',
      EN: 'Our Story & Philosophy',
      TH: 'เรื่องราวและปรัชญาของเรา',
      DE: 'Unsere Geschichte & Philosophie',
    },
    titlePart1: {
      IT: 'Cuore Italiano, Anima',
      EN: 'Italian Heart, Soul of',
      TH: 'หัวใจอิตาเลียน จิตวิญญาณแห่ง',
      DE: 'Italienisches Herz, Seele von',
    },
    titleCity: {
      IT: 'Ranong',
      EN: 'Ranong',
      TH: 'ระนอง',
      DE: 'Ranong',
    },
    subtitle: {
      IT: 'Tradizione gastronomica artigianale, incontro vivo di culture e visione sostenibile alle porte di Raksawarin',
      EN: 'Artisan culinary tradition, living encounter of cultures, and sustainable vision at the gates of Raksawarin',
      TH: 'ประเพณีการทำอาหารแบบช่างฝีมือ การผสมผสานทางวัฒนธรรม และวิสัยทัศน์ที่ยั่งยืน ณ ประตูสู่น้ำพุร้อนรักษะวาริน',
      DE: 'Handwerkliche Kochkunst, lebendige Begegnung der Kulturen und nachhaltige Vision vor den Toren von Raksawarin',
    },
    block1: {
      tag: {
        IT: "L'Inizio & La Location",
        EN: 'The Beginning & Location',
        TH: 'จุดเริ่มต้นและสถานที่',
        DE: 'Beginn & Standort',
      },
      title: {
        IT: 'Incontro di Culture alle Porte delle Terme di Raksawarin',
        EN: 'Cultural Encounter at the Gates of Raksawarin Hot Springs',
        TH: 'การพบกันของวัฒนธรรม ณ ประตูสู่น้ำพุร้อนรักษะวาริน',
        DE: 'Kulturelle Begegnung an den Raksawarin-Quellen',
      },
      p1: {
        IT: 'Situato proprio alle porte delle rinomate sorgenti termali di Raksawarin a Ranong, Flower Power Pizza nasce dal desiderio di trasferire i segreti e le antiche conoscenze della tradizione gastronomica italiana direttamente nelle mani e nel cuore del nostro staff locale.',
        EN: 'Located right at the entrance of the famous Raksawarin Hot Springs in Ranong, Flower Power Pizza was born from the passion to share authentic Italian culinary traditions directly into the hands and hearts of our local staff.',
        TH: 'ตั้งอยู่บริเวณทางเข้าน้ำพุร้อนรักษะวารินชื่อดังของจังหวัดระนอง Flower Power Pizza เกิดจากความตั้งใจที่จะถ่ายทอดเคล็ดลับและศาสตร์การทำอาหารอิตาเลียนแท้สู่ทีมงานท้องถิ่นของเรา',
        DE: 'Direkt vor den Toren der heißen Raksawarin-Quellen in Ranong entstand Flower Power Pizza aus dem Wunsch, die Geheimnisse der italienischen Küche an unser lokales Team weiterzugeben.',
      },
      p2: {
        IT: "Non siamo solo un ristorante, ma un autentico mix di culture: italiani, thailandesi e birmani lavorano fianco a fianco ogni giorno, uniti dalla passione per il cibo genuino, dall'amore per l'ospitalità e dal rispetto reciproco.",
        EN: 'We are more than a restaurant — we are a vibrant blend of cultures: Italian, Thai, and Burmese staff working side-by-side daily, united by genuine hospitality and mutual respect.',
        TH: 'เราไม่ใช่แค่ร้านอาหาร แต่เป็นการผสมผสานทางวัฒนธรรมที่แท้จริง ทั้งชาวอิตาลี ไทย และเมียนมา ร่วมมือกันทุกวันด้วยความรักในการบริการและอาหารคุณภาพ',
        DE: 'Wir sind mehr als ein Restaurant — eine echte Verbindung der Kulturen: Italiener, Thailänder und Burmesen arbeiten täglich Hand in Hand mit Leidenschaft für echte Gastfreundschaft.',
      },
    },
    block2: {
      tag: {
        IT: 'La Nostra Filosofia & Tecnica',
        EN: 'Our Philosophy & Craft',
        TH: 'ปรัชญาและเทคนิคของเรา',
        DE: 'Unsere Philosophie & Technik',
      },
      title: {
        IT: 'Non è la Moda a Fare la Pizza: È il Sapore. (Idratazione Estrema al 90%)',
        EN: 'Flavor, Not Trends, Defines Pizza: Extreme 90% Hydration',
        TH: 'รสชาติแท้จริง ไม่ใช่แค่ตามกระแส: แป้งสูตรพิเศษไฮเดรชั่น 90%',
        DE: 'Geschmack statt Modetrends: Extreme 90% Hydration',
      },
      intro: {
        IT: "Negli ultimi anni il mondo della ristorazione ha rincorso mode passeggere. Noi abbiamo scelto di rifiutare scorciatoie estetiche per tornare all'essenza autentica della pizza tradizionale italiana: un disco perfetto dove sapore e consistenza regnano dal primo all'ultimo centimetro.",
        EN: 'In recent years culinary trends came and went. We choose to reject visual shortcuts and return to the authentic core of Italian pizza: a perfect crust where flavour and digestible texture reign supreme.',
        TH: 'ในยุคที่กระแสอาหารเปลี่ยนแปลงอย่างรวดเร็ว เราเลือกที่จะไม่พึ่งพากระแสชั่วคราว แต่ขอกลับสู่แก่นแท้ของพิซซ่าอิตาเลียนดั้งเดิม: แป้งที่เบา กรอบ หอม อร่อย และย่อยง่ายในทุกคำ',
        DE: 'In den letzten Jahren jagte die Gastronomie vielen Trends hinterher. Wir haben uns entschieden, auf Äußerlichkeiten zu verzichten und zum wahren Kern traditioneller italienischer Pizza zurückzukehren.',
      },
      point1Title: {
        IT: "90% di Idratazione Estrema (900g d'Acqua per kg di Farina)",
        EN: 'Extreme 90% Hydration (900g Water per kg of Flour)',
        TH: 'ไฮเดรชั่นสูงพิเศษ 90% (น้ำ 900 กรัม ต่อแป้ง 1 กก.)',
        DE: 'Extreme 90% Hydration (900g Wasser pro kg Mehl)',
      },
      point1Desc: {
        IT: "Mentre la pizza commerciale usa il 55-60% di acqua, un impasto al 90% richiede maestria artigianale assoluta, continue pieghe a mano e solo farina di grano 100% italiano con profilo proteico nobile.",
        EN: 'While commercial pizzas use 55-60% water, 90% hydration requires master craftsmanship, meticulous hand folding, and 100% Italian high-protein flour able to lock water into a perfect gluten mesh.',
        TH: 'ในขณะที่พิซซ่าทั่วไปใช้น้ำเพียง 55-60% แต่แป้งไฮเดรชั่น 90% ต้องอาศัยทักษะงานฝีมือขั้นสูง การนวดพับมืออย่างพิถีพิถัน และแป้งสาลีอิตาลี 100% คุณภาพเยี่ยม',
        DE: 'Während Standardpizza 55-60% Wasser nutzt, erfordert 90% Hydration meisterhafte Handarbeit und 100% italienisches Premiummehl für ein perfektes Glutengerüst.',
      },
      point2Title: {
        IT: '48 Ore di Lenta Maturazione Enzimatica',
        EN: '48 Hours of Slow Enzymatic Fermentation',
        TH: 'หมักธรรมชาติช้าๆ นาน 48 ชั่วโมง',
        DE: '48 Stunden langsame enzymatische Reifung',
      },
      point2Desc: {
        IT: 'Durante 48 ore a temperatura controllata, gli enzimi naturali scindono gli amidi in zuccheri semplici e frammentano le lunghe catene del glutine. Risultato: massima leggerezza e zero sete notturna.',
        EN: 'During 48 hours under controlled cold temperature, natural enzymes break down complex starches and gluten chains: optimal digestibility and zero overnight thirst.',
        TH: 'ในระหว่าง 48 ชั่วโมงในอุณหภูมิที่ควบคุม เอนไซม์ธรรมชาติจะย่อยสลายแป้งและกลูเตน ทำให้ย่อยง่าย สบายท้อง ไม่รู้สึกแน่นหรือหิวน้ำตอนกลางคืน',
        DE: 'In 48 Stunden bei kontrollierter Temperatur bauen Enzyme Stärke und Gluten ab: perfekte Bekömmlichkeit ohne Völlegefühl.',
      },
      point3Title: {
        IT: "Micro-Alveolatura a Nido d'Ape & Morso Perfetto",
        EN: 'Honeycomb Micro-Alveolation & Perfect Crisp',
        TH: 'โครงสร้างโพรงอากาศแบบรวงผึ้ง ละมุนและกรอบนอกนุ่มใน',
        DE: 'Wabenförmige Mikro-Porung & Perfekter Biss',
      },
      point3Desc: {
        IT: "Nel forno, l'alta idratazione vaporizza creando una struttura fittissima di micro-alveoli: crosta sottile e friabile all'esterno con un cuore soffice e scioglievole al palato.",
        EN: 'In the oven, high hydration vaporizes into an ultra-dense honeycomb matrix: thin crispy crust outside, silky melt-in-the-mouth crumb inside.',
        TH: 'เมื่ออบในเตา น้ำปริมาณมากจะระเหยสร้างโพรงอากาศรวงผึ้งอันละเอียด ขอบกรอบบางเบา เนื้อในนุ่มละมุนลิ้น',
        DE: 'Im Ofen verdampft das Wasser zu einer feinen Wabenstruktur: außen hauchzart knusprig, innen saftig und weich.',
      },
      quote: {
        IT: "«Non abbiamo inventato uno slogan: abbiamo rimesso al centro la farina, l'acqua, il tempo e la passione.»",
        EN: '«We did not invent a marketing slogan: we simply brought flour, water, time, and passion back to the centre.»',
        TH: '«เราไม่ได้สร้างสโลแกนการตลาด: เราเพียงนำแป้ง น้ำ เวลา และความหลงใหล กลับมาเป็นหัวใจสำคัญ»',
        DE: '«Wir haben keinen Werbeslogan erfunden: Wir haben Mehl, Wasser, Zeit und Leidenschaft wieder in den Mittelpunkt gestellt.»',
      },
    },
    block3: {
      tag: {
        IT: 'Artigianato & Territorio',
        EN: 'Artisan Craft & Territory',
        TH: 'งานฝีมือและธรรมชาติ',
        DE: 'Handwerk & Natur',
      },
      title: {
        IT: 'Pasta Fresca Tirata a Mano & Salsiccia Artigianale Norcina',
        EN: 'Handmade Fresh Pasta & Artisan Norcina Sausage',
        TH: 'พาสต้าสดทำมือและไส้กรอกโฮมเมดสูตรนอร์ชา',
        DE: 'Frische handgemachte Pasta & Norcina-Spezialitäten',
      },
      p1: {
        IT: 'La stessa cura maniacale la dedichiamo a tutto il nostro menu. Ogni mattina tiriamo a mano la pasta fresca (tagliatelle, spaghetti, gnocchi) e insacchiamo la salsiccia artigianale secondo la ricetta norcina di famiglia, senza conservanti.',
        EN: 'We apply the same meticulous care across our menu: freshly rolled handmade pasta daily (tagliatelle, spaghetti, gnocchi) and homemade preservative-free Italian sausage based on family recipes.',
        TH: 'เราใส่ใจในทุกเมนูอย่างละเอียดลออ ทุกเช้าเราทำพาสต้าสดด้วยมือ (ทัลยาเตลเล่ สปาเก็ตตี้ ย็อกกี) และทำไส้กรอกโฮมเมดสูตรดั้งเดิมจากอิตาลีโดยไร้สารกันบูด',
        DE: 'Dieselbe Hingabe gilt der gesamten Speisekarte: Täglich handgemachte frische Pasta und hausgemachte Wurstspezialitäten nach Familienrezept ohne Konservierungsstoffe.',
      },
      p2: {
        IT: "Il tutto servito nella nostra oasi tropicale dotata di cascata naturale privata, laghetto e caratteristiche capanne in bambù per un'esperienza di relax autentico.",
        EN: 'All served in our tropical oasis featuring a private natural waterfall, pond, and intimate bamboo huts for genuine relaxation.',
        TH: 'เสิร์ฟท่ามกลางธรรมชาติอันร่มรื่น พร้อมน้ำตกธรรมชาติส่วนตัว สระน้ำ และซุ้มไม้ไผ่ส่วนตัวเพื่อการพักผ่อนอย่างแท้จริง',
        DE: 'Serviert in unserer tropischen Oase mit eigenem Wasserfall, Teich und gemütlichen Bambushütten für pure Entspannung.',
      },
    },
    block4: {
      tag: {
        IT: 'Il Futuro & Il Pianeta',
        EN: 'The Future & Planet',
        TH: 'อนาคตและความยั่งยืน',
        DE: 'Zukunft & Nachhaltigkeit',
      },
      title: {
        IT: 'Un Progetto in Continua Evoluzione: Verso il Km Zero',
        EN: 'A Living Project: Towards True Km Zero',
        TH: 'โครงการที่พัฒนาต่อเนื่อง: สู่ความยั่งยืนแบบ Km Zero',
        DE: 'Ein lebendiges Projekt: Auf dem Weg zu echtem Km Zero',
      },
      p1: {
        IT: "Crediamo che il cibo debba essere rispetto per l'ambiente. Nei nostri terreni a Ranong stiamo sviluppando coltivazioni biologiche di erbe aromatiche e ortaggi, con l'obiettivo di rendere la nostra cucina sempre più autonoma e a chilometro zero.",
        EN: 'We believe food must respect nature. In our Ranong grounds we cultivate organic herbs and vegetables, moving progressively towards zero-kilometer farm-to-table dining.',
        TH: 'เราเชื่อมั่นว่าอาหารที่ดีต้องเคารพธรรมชาติ ในพื้นที่ของเรารอบร้าน เราปลูกสมุนไพรออร์แกนิกและผักสด เพื่อนำวัตถุดิบสดใหม่จากฟาร์มสู่โต๊ะอาหารของคุณ',
        DE: 'Wir glauben an umweltbewusste Ernährung. Auf unseren Flächen in Ranong bauen wir biologische Kräuter und Gemüse für echte Frische direkt vom Feld auf den Teller an.',
      },
      p2: {
        IT: "Dalle sorgenti termali di Ranong all'isola di Koh Phayam col nostro eco-resort Flower Power Village, accogliamo ogni ospite come parte della nostra famiglia.",
        EN: 'From the hot springs of Ranong to Koh Phayam island with our Flower Power Village eco-resort, we welcome every guest as part of our extended family.',
        TH: 'จากน้ำพุร้อนรักษะวารินระนอง สู่เกาะพยามกับ Flower Power Village รีสอร์ท เราพร้อมต้อนรับแขกทุกท่านเสมือนคนในครอบครัว',
        DE: 'Von den heißen Quellen in Ranong bis nach Koh Phayam mit unserem Flower Power Village heißen wir jeden Gast herzlich willkommen.',
      },
    },
    valuesTitle: {
      IT: 'I Nostri Valori Fondamentali',
      EN: 'Our Core Values',
      TH: 'ค่านิยมหลักของเรา',
      DE: 'Unsere Grundwerte',
    },
    v1Title: {
      IT: '100% Qualità Italiana',
      EN: '100% Italian Quality',
      TH: 'คุณภาพอิตาเลียน 100%',
      DE: '100% Italienische Qualität',
    },
    v1Desc: {
      IT: 'Farine, pomodori e formaggi selezionati dai migliori produttori italiani.',
      EN: 'Flour, tomato, and cheeses selected from top Italian producers.',
      TH: 'แป้ง มะเขือเทศ และชีสคัดสรรจากผู้ผลิตชั้นนำในอิตาลี',
      DE: 'Mehl, Tomaten und Käse von führenden italienischen Erzeugern.',
    },
    v2Title: {
      IT: 'Lenta Fermentazione',
      EN: 'Slow Fermentation',
      TH: 'การหมักธรรมชาติช้าๆ',
      DE: 'Langsame Fermentation',
    },
    v2Desc: {
      IT: '48 ore di maturazione enzimatica per la massima digeribilità e leggerezza.',
      EN: '48 hours of enzymatic maturation for maximum lightness and digestibility.',
      TH: 'หมักบ่มนาน 48 ชั่วโมง เพื่อให้ย่อยง่ายและสบายท้องที่สุด',
      DE: '48 Stunden Reifung für beste Bekömmlichkeit und Leichtigkeit.',
    },
    v3Title: {
      IT: 'Inclusione & Rispetto',
      EN: 'Inclusion & Respect',
      TH: 'ความหลากหลายและเคารพซึ่งกันและกัน',
      DE: 'Inklusion & Respekt',
    },
    v3Desc: {
      IT: 'Un team multiculturale valorizzato con equità, formazione continua e passione.',
      EN: 'A multicultural team empowered with fairness, continuous training, and passion.',
      TH: 'ทีมงานหลากวัฒนธรรมที่ทำงานร่วมกันด้วยความเท่าเทียมและมิตรภาพ',
      DE: 'Ein multikulturelles Team, gefördert mit Fairness und Herzlichkeit.',
    },
    v4Title: {
      IT: 'Natura & Relax',
      EN: 'Nature & Relaxation',
      TH: 'ธรรมชาติและการพักผ่อน',
      DE: 'Natur & Erholung',
    },
    v4Desc: {
      IT: 'Immersi nel verde tropicale di Ranong con cascata naturale e capanne in bambù.',
      EN: 'Immersed in tropical Ranong nature with private waterfall and bamboo huts.',
      TH: 'ท่ามกลางธรรมชาติร่มรื่นของระนอง พร้อมน้ำตกและซุ้มไม้ไผ่ส่วนตัว',
      DE: 'Eingebettet ins tropische Grün mit Natur-Wasserfall und Bambushütten.',
    },
  },

  // ── 8. CONTACT US & LOCATION ──────────────────────────────────────────────
  contact: {
    badge: {
      IT: 'Vieni a Trovarci',
      EN: 'Visit Us',
      TH: 'แวะมาเยี่ยมชมเรา',
      DE: 'Besuchen Sie uns',
    },
    title: {
      IT: 'Contattaci & Posizione',
      EN: 'Contact & Location',
      TH: 'ติดต่อและแผนที่ร้าน',
      DE: 'Kontakt & Standort',
    },
    subtitle: {
      IT: 'Siamo a Ranong, a due passi dalle rinomate sorgenti termali di Raksawarin',
      EN: 'Located in Ranong, steps away from the famous Raksawarin Hot Springs',
      TH: 'ตั้งอยู่ที่อำเภอเมืองระนอง ใกล้กับบ่อน้ำพุร้อนรักษะวาริน',
      DE: 'In Ranong, nur wenige Schritte von den berühmten Raksawarin-Heißquellen entfernt',
    },
    phoneTitle: {
      IT: 'Telefono & WhatsApp',
      EN: 'Phone & WhatsApp',
      TH: 'โทรศัพท์ & WhatsApp',
      DE: 'Telefon & WhatsApp',
    },
    addressTitle: {
      IT: 'Indirizzo & Location',
      EN: 'Address & Location',
      TH: 'ที่อยู่และสถานที่ตั้ง',
      DE: 'Adresse & Standort',
    },
    hoursTitle: {
      IT: 'Orari di Apertura',
      EN: 'Opening Hours',
      TH: 'เวลาเปิด-ปิด',
      DE: 'Öffnungszeiten',
    },
    hoursDesc: {
      IT: 'Tutti i giorni dalle 11:00 alle 21:30 (Consegna a domicilio e Ristorante)',
      EN: 'Daily 11:00 – 21:30 (Home Delivery & Dine-In Restaurant)',
      TH: 'เปิดทุกวัน 11:00 – 21:30 น. (บริการเดลิเวอรี่และทานที่ร้าน)',
      DE: 'Täglich 11:00 – 21:30 Uhr (Lieferdienst & Restaurantbetrieb)',
    },
    tableTitle: {
      IT: 'Prenotazione Tavolo o Capanna',
      EN: 'Table or Garden Hut Reservation',
      TH: 'จองโต๊ะหรือซุ้มไม้ไผ่',
      DE: 'Tisch- oder Hüttenreservierung',
    },
    tableDesc: {
      IT: "Prenota il tuo tavolo al chiuso, all'aperto o in una caratteristica capanna in bambù",
      EN: 'Book your table indoors, outdoors or in an atmospheric bamboo hut in our garden',
      TH: 'จองโต๊ะในร่ม, โต๊ะกลางแจ้ง หรือซุ้มไม้ไผ่บรรยากาศสบายๆ ในสวนสวย',
      DE: 'Reservieren Sie Ihren Tisch im Innenbereich, Außenbereich oder in einer Bambushütte',
    },
    tableBtn: {
      IT: 'Prenota un Tavolo',
      EN: 'Book a Table',
      TH: 'จองโต๊ะเลย',
      DE: 'Tisch reservieren',
    },
    directionsBtn: {
      IT: 'Apri su Google Maps',
      EN: 'Open in Google Maps',
      TH: 'เปิดใน Google Maps',
      DE: 'In Google Maps öffnen',
    },
  },
};

/**
 * Helper hook to get translations for the active language
 */
export function getI18nText<T extends Record<Language, any>>(dict: T, lang: Language): T[Language] {
  return dict[lang] ?? dict['IT'] ?? dict['EN'];
}

