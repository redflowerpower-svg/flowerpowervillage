import fs from 'fs';

const dicts1 = JSON.parse(fs.readFileSync('scratch/delivery_menu_translated_dicts.json', 'utf8'));
const dicts2 = JSON.parse(fs.readFileSync('scratch/remaining_menu_sections_translated.json', 'utf8'));

const deliveryMenuPath = 'src/pizza/pages/DeliveryMenu.tsx';
let content = fs.readFileSync(deliveryMenuPath, 'utf8');

// Build the new code block for lines 34 to 460
const newCodeBlock = `
const translations: Record<string, any> = {
  IT: {
    title: 'Flower Power Pizza',
    subtitle: 'Ranong, Thailandia',
    tagline1: 'PIZZA & CUCINA ITALIANA',
    tagline2: 'Cuoca Italiana • Ingredienti Importati',
    info1: 'Aperto tutti i giorni',
    info2: '11:00 – 21:30',
    info3: 'Delivery & Takeaway',
    cartItems: 'prodotti nel carrello',
    cartItem: 'prodotto nel carrello',
    promoTitle: 'Promozioni & Consegna a Domicilio',
    deliveryLimit: 'Le consegne si effettuano esclusivamente per la città di Ranong.',
    promoFreeDelivery: 'Consegna GRATIS per ordini sopra i 300฿',
    promoFirstOrder: '10% di sconto sul tuo primo ordine',
    bookTableBadge: 'RISTORANTE',
    bookTableTitle: 'Prenota un Tavolo o Capanna',
    bookTableSubtitle: "Al chiuso, all'aperto o in capanna",
    bookTableBtn: 'PRENOTA ORA',
  },
  EN: {
    title: 'Flower Power Pizza',
    subtitle: 'Ranong, Thailand',
    tagline1: 'PIZZA & ITALIAN CUISINE',
    tagline2: 'Italian Chef • Imported Ingredients',
    info1: 'Open Daily',
    info2: '11:00 – 21:30',
    info3: 'Delivery & Takeaway',
    cartItems: 'items in cart',
    cartItem: 'item in cart',
    promoTitle: 'Promotions & Delivery Info',
    deliveryLimit: 'Deliveries are made exclusively within the city of Ranong.',
    promoFreeDelivery: 'FREE delivery for orders over 300฿',
    promoFirstOrder: '10% discount on your first order',
    bookTableBadge: 'DINE-IN',
    bookTableTitle: 'Book a Table or Hut',
    bookTableSubtitle: 'Indoor, outdoor tables or hut',
    bookTableBtn: 'BOOK NOW',
  },
  TH: {
    title: 'ฟลาวเวอร์ พาวเวอร์ พิซซ่า',
    subtitle: 'ระนอง, ประเทศไทย',
    tagline1: 'พิซซ่าและอาหารอิตาเลียน',
    tagline2: 'เชฟหญิงชาวอิตาลี • วัตถุดิบนำเข้า',
    info1: 'เปิดบริการทุกวัน',
    info2: '11:00 – 21:30',
    info3: 'เดลิเวอรี่ & สั่งกลับบ้าน (Takeaway)',
    cartItems: 'รายการในรถเข็น',
    cartItem: 'รายการในรถเข็น',
    promoTitle: 'โปรโมชั่นและข้อมูลการจัดส่ง',
    deliveryLimit: 'บริการจัดส่งเฉพาะในเขตตัวเมืองระนองเท่านั้น',
    promoFreeDelivery: 'จัดส่งฟรี เมื่อสั่งซื้อครบ 300฿ ขึ้นไป',
    promoFirstOrder: 'ส่วนลด 10% สำหรับการสั่งซื้อครั้งแรก',
    bookTableBadge: 'ทานที่ร้าน',
    bookTableTitle: 'จองโต๊ะหรือซุ้มกระท่อม',
    bookTableSubtitle: 'โซนในร่ม, โต๊ะกลางแจ้ง หรือ ซุ้มกระท่อม',
    bookTableBtn: 'จองเลย',
  },
  DE: {
    title: 'Flower Power Pizza',
    subtitle: 'Ranong, Thailand',
    tagline1: 'PIZZA & ITALIENISCHE KÜCHE',
    tagline2: 'Italienische Köchin • Importierte Zutaten',
    info1: 'Täglich geöffnet',
    info2: '11:00 – 21:30',
    info3: 'Lieferung & Takeaway',
    cartItems: 'Artikel im Warenkorb',
    cartItem: 'Artikel im Warenkorb',
    promoTitle: 'Aktionen & Lieferbedingungen',
    deliveryLimit: 'Lieferungen erfolgen ausschließlich innerhalb der Stadt Ranong.',
    promoFreeDelivery: 'KOSTENLOSE Lieferung ab 300฿ Bestellwert',
    promoFirstOrder: '10% Rabatt auf Ihre erste Bestellung',
    bookTableBadge: 'RESTAURANT',
    bookTableTitle: 'Tisch oder Hütte reservieren',
    bookTableSubtitle: 'Innenbereich, Außenbereich oder Gartenhütte',
    bookTableBtn: 'RESERVIEREN',
  },
  MM: {
    title: 'Flower Power Pizza',
    subtitle: 'Ranong, ထိုင်းနိုင်ငံ',
    tagline1: 'ပီဇာနှင့် အီတလီအစားအစာ',
    tagline2: 'အီတလီစားဖိုမှူး • တင်သွင်းကုန်ကြမ်းစစ်စစ်',
    info1: 'နေ့စဉ်ဖွင့်သည်',
    info2: '11:00 – 21:30',
    info3: 'ပို့ဆောင်မှုနှင့် ဆိုင်မှလာယူရန် (Takeaway)',
    cartItems: 'ခြင်းထဲရှိ ပစ္စည်းများ',
    cartItem: 'ခြင်းထဲရှိ ပစ္စည်း',
    promoTitle: 'ပရိုမိုးရှင်းများနှင့် ပို့ဆောင်မှု အချက်အလက်',
    deliveryLimit: 'ပို့ဆောင်မှုကို ရနောင်းမြို့တွင်း ဧရိယာအတွက်သာ သီးသန့် ဝန်ဆောင်မှုပေးပါသည်။',
    promoFreeDelivery: '၃၀၀ ဘတ် အထက် အခမဲ့ ပို့ဆောင်ပေးပါသည်',
    promoFirstOrder: 'ပထမဆုံး အော်ဒါအတွက် ၁၀% လျှော့စျေး',
    bookTableBadge: 'ဆိုင်တွင် သုံးဆောင်ရန်',
    bookTableTitle: 'စားပွဲ သို့မဟုတ် တဲ ကြိုတင်ဘွတ်ကင်လုပ်ရန်',
    bookTableSubtitle: 'အတွင်းခန်း၊ အပြင်ဘက် သို့မဟုတ် သဘာဝတဲ',
    bookTableBtn: 'ယခုဘွတ်ကင်လုပ်မည်',
  },
  ES: ${JSON.stringify(dicts1.header.ES, null, 2)},
  FR: ${JSON.stringify(dicts1.header.FR, null, 2)},
  RU: ${JSON.stringify(dicts1.header.RU, null, 2)},
  ZH: ${JSON.stringify(dicts1.header.ZH, null, 2)}
};

const categoryDetails: Record<string, Record<string, { name: string; desc: string }>> = {
  'daily-specials': {
    IT: { name: 'Piatti del Giorno', desc: 'Creazioni esclusive e piatti speciali del giorno preparati dal nostro chef con ingredienti freschi di stagione' },
    EN: { name: 'Daily Specials', desc: 'Exclusive daily creations and seasonal specialties freshly prepared by our Italian chef with premium ingredients' },
    TH: { name: 'จานพิเศษประจำวัน', desc: 'เมนูพิเศษประจำวันรังสรรค์โดยเชฟชาวอิตาเลียน ด้วยวัตถุดิบสดใหม่ตามฤดูกาล' },
    DE: { name: 'Tagesgerichte', desc: 'Täglich wechselnde Spezialitäten und saisonale Gerichte unseres Chefkochs aus frischen Zutaten' },
    MM: { name: 'နေ့စဉ် ဟင်းပွဲများ', desc: 'အီတလီစားဖိုမှူးမှ လတ်ဆတ်သော ရာသီပေါ် ကုန်ကြမ်းများဖြင့် နေ့စဉ် သီးသန့် ဖန်တီးထားသော အထူးဟင်းလျာများ' },
    ES: ${JSON.stringify(dicts1.categories.ES['daily-specials'])},
    FR: ${JSON.stringify(dicts1.categories.FR['daily-specials'])},
    RU: ${JSON.stringify(dicts1.categories.RU['daily-specials'])},
    ZH: ${JSON.stringify(dicts1.categories.ZH['daily-specials'])},
  },
  'traditional-italian-pizza': {
    IT: { name: 'Pizze Classiche', desc: 'Impasto a fermentazione naturale' },
    EN: { name: 'Classic Pizzas', desc: 'Slow-fermented Italian dough' },
    TH: { name: 'พิซซ่าคลาสสิค', desc: 'แป้งหมักธรรมชาติสูตรดั้งเดิม' },
    DE: { name: 'Klassische Pizzas', desc: 'Natursauerteig-Pizzaboden' },
    MM: { name: 'ရိုးရာ အီတလီ ပီဇာ', desc: 'သဘာဝနည်းဖြင့် နှပ်ထားသော မုန့်သား' },
    ES: ${JSON.stringify(dicts1.categories.ES['traditional-italian-pizza'])},
    FR: ${JSON.stringify(dicts1.categories.FR['traditional-italian-pizza'])},
    RU: ${JSON.stringify(dicts1.categories.RU['traditional-italian-pizza'])},
    ZH: ${JSON.stringify(dicts1.categories.ZH['traditional-italian-pizza'])},
  },
  'pasta': {
    IT: { name: 'Pasta & Primi', desc: 'Primi piatti della tradizione e pasta fresca' },
    EN: { name: 'Pasta & First Courses', desc: 'Traditional Italian pasta & fresh first courses' },
    TH: { name: 'พาสต้า & อาหารจานแรก', desc: 'เมนูพาสต้าอิตาเลียนดั้งเดิมและอาหารจานเส้น' },
    DE: { name: 'Pasta & Primi', desc: 'Traditionelle italienische Pasta & Nudelgerichte' },
    MM: { name: 'ခေါက်ဆွဲ & ပတ်စ်တာ', desc: 'ရိုးရာ အီတလီ ခေါက်ဆွဲ ဟင်းလျာများ' },
    ES: ${JSON.stringify(dicts1.categories.ES['pasta'])},
    FR: ${JSON.stringify(dicts1.categories.FR['pasta'])},
    RU: ${JSON.stringify(dicts1.categories.RU['pasta'])},
    ZH: ${JSON.stringify(dicts1.categories.ZH['pasta'])},
  },
  'breakfast-and-snacks': {
    IT: { name: 'Colazione & Snack', desc: 'Per iniziare la giornata' },
    EN: { name: 'Breakfast & Snacks', desc: 'To start your day' },
    TH: { name: 'อาหารเช้าและของว่าง', desc: 'เริ่มต้นวันใหม่ด้วยพลังงาน' },
    DE: { name: 'Frühstück & Snacks', desc: 'Für einen guten Start in den Tag' },
    MM: { name: 'နံနက်စာနှင့် သရေစာ', desc: 'နေ့သစ်ကို စတင်ရန်' },
    ES: ${JSON.stringify(dicts1.categories.ES['breakfast-and-snacks'])},
    FR: ${JSON.stringify(dicts1.categories.FR['breakfast-and-snacks'])},
    RU: ${JSON.stringify(dicts1.categories.RU['breakfast-and-snacks'])},
    ZH: ${JSON.stringify(dicts1.categories.ZH['breakfast-and-snacks'])},
  },
  'coffee-shop': {
    IT: { name: 'Caffetteria', desc: 'Caffè espresso italiano' },
    EN: { name: 'Coffee Shop', desc: 'Italian espresso coffee' },
    TH: { name: 'ร้านกาแฟ', desc: 'เอสเพรสโซ่อิตาเลียนแท้' },
    DE: { name: 'Kaffeeshop', desc: 'Italienischer Espresso' },
    MM: { name: 'ကော်ဖီဆိုင်', desc: 'စစ်မှန်သော အီတလီ အက်စ်ပရက်ဆို ကော်ဖီ' },
    ES: ${JSON.stringify(dicts1.categories.ES['coffee-shop'])},
    FR: ${JSON.stringify(dicts1.categories.FR['coffee-shop'])},
    RU: ${JSON.stringify(dicts1.categories.RU['coffee-shop'])},
    ZH: ${JSON.stringify(dicts1.categories.ZH['coffee-shop'])},
  },
  'fruit-drinks': {
    IT: { name: 'Bevande alla Frutta', desc: 'Frullati e shake freschi' },
    EN: { name: 'Fruit Drinks', desc: 'Fresh fruit shakes' },
    TH: { name: 'เครื่องดื่มผลไม้', desc: 'ผลไม้สดปั่นสดใหม่' },
    DE: { name: 'Fruchtgetränke', desc: 'Frische Frucht-Shakes' },
    MM: { name: 'သစ်သီးဖျော်ရည်များ', desc: 'လတ်ဆတ်သော သစ်သီးဖျော်ရည်များ' },
    ES: ${JSON.stringify(dicts1.categories.ES['fruit-drinks'])},
    FR: ${JSON.stringify(dicts1.categories.FR['fruit-drinks'])},
    RU: ${JSON.stringify(dicts1.categories.RU['fruit-drinks'])},
    ZH: ${JSON.stringify(dicts1.categories.ZH['fruit-drinks'])},
  },
  'soft-drinks': {
    IT: { name: 'Bibite & Acqua', desc: 'Bibite analcoliche in lattina, acqua minerale naturale e bevande rinfrescanti servite fredde.' },
    EN: { name: 'Soft Drinks & Water', desc: 'Canned soft drinks, natural mineral water, and chilled refreshing beverages.' },
    TH: { name: 'น้ำอัดลมและน้ำดื่ม', desc: 'น้ำอัดลมกระป๋อง น้ำดื่มธรรมชาติ และเครื่องดื่มเพิ่มความสดชื่นเสิร์ฟเย็น' },
    DE: { name: 'Erfrischungsgetränke & Wasser', desc: 'Erfrischungsgetränke in der Dose, natürliches Mineralwasser und gekühlte Getränke.' },
    MM: { name: 'အအေးနှင့် သောက်ရေသန့်', desc: 'ဗူးသွပ်အအေးများ၊ သဘာဝတွင်းထွက်ရေနှင့် အေးမြလန်းဆန်းစေသော သောက်စရာများ။' },
    ES: ${JSON.stringify(dicts1.categories.ES['soft-drinks'])},
    FR: ${JSON.stringify(dicts1.categories.FR['soft-drinks'])},
    RU: ${JSON.stringify(dicts1.categories.RU['soft-drinks'])},
    ZH: ${JSON.stringify(dicts1.categories.ZH['soft-drinks'])},
  },
  'beers': {
    IT: { name: 'Birre', desc: 'Le migliori marche di birra in bottiglia grande e piccola, servite ghiacciate.' },
    EN: { name: 'Beers', desc: 'The best Thai and international bottled beers served ice cold.' },
    TH: { name: 'เบียร์', desc: 'เบียร์ขวดเย็นเจี๊ยบคุณภาพดี มีให้เลือกทั้งขวดใหญ่และขวดเล็ก' },
    DE: { name: 'Biere', desc: 'Beste thailändische und internationale Flaschenbiere eiskalt serviert.' },
    MM: { name: 'ဘီယာများ', desc: 'အကောင်းဆုံး ထိုင်းနှင့် နိုင်ငံတကာ ဘီယာပုလင်း အေးအေးများ။' },
    ES: ${JSON.stringify(dicts1.categories.ES['beers'])},
    FR: ${JSON.stringify(dicts1.categories.FR['beers'])},
    RU: ${JSON.stringify(dicts1.categories.RU['beers'])},
    ZH: ${JSON.stringify(dicts1.categories.ZH['beers'])},
  },
  'beers-and-wines': {
    IT: { name: 'Birre & Vini', desc: 'Birre fresche e selezione di vini italiani' },
    EN: { name: 'Beers & Wines', desc: 'Chilled beers and Italian wine selection' },
    TH: { name: 'เบียร์และไวน์', desc: 'เบียร์เย็นๆ และไวน์อิตาเลียนคัดสรร' },
    DE: { name: 'Biere & Weine', desc: 'Gekühlte Biere und ausgewählte italienische Weine' },
    MM: { name: 'ဘီယာနှင့် ဝိုင်များ', desc: 'အေးမြသော ဘီယာများနှင့် ရွေးချယ်ထားသော အီတလီ ဝိုင်များ' },
    ES: ${JSON.stringify(dicts1.categories.ES['beers-and-wines'])},
    FR: ${JSON.stringify(dicts1.categories.FR['beers-and-wines'])},
    RU: ${JSON.stringify(dicts1.categories.RU['beers-and-wines'])},
    ZH: ${JSON.stringify(dicts1.categories.ZH['beers-and-wines'])},
  },
  'wines': {
    IT: { name: 'Carta dei Vini', desc: 'Selezione accurata di vini italiani ed internazionali, scelti per esaltare i sapori di ogni piatto del nostro menù.' },
    EN: { name: 'Wine List', desc: 'Carefully curated selection of fine Italian and international wines, chosen to enhance the flavors of every dish on our menu.' },
    TH: { name: 'รายการไวน์', desc: 'คัดสรรไวน์อิตาเลียนและไวน์นานาชาติชั้นเลิศอย่างพิถีพิถัน เพื่อเสริมรสชาติของทุกเมนูให้โดดเด่นและสมดุลยิ่งขึ้น' },
    DE: { name: 'Weinkarte', desc: 'Sorgfältig zusammengestellte Auswahl an italienischen und internationalen Weinen, die darauf abgestimmt sind, die Aromen jedes Gerichts auf unserer Speisekarte hervorzuheben.' },
    MM: { name: 'ဝိုင်စာရင်း', desc: 'ကျွန်ုပ်တို့၏ ဟင်းလျာ အရသာတိုင်းကို ပိုမိုပြည့်စုံစေရန် ဂရုတစိုက် ရွေးချယ်ထားသော အီတလီနှင့် နိုင်ငံတကာ ဝိုင်ကောင်းများ။' },
    ES: ${JSON.stringify(dicts1.categories.ES['wines'])},
    FR: ${JSON.stringify(dicts1.categories.FR['wines'])},
    RU: ${JSON.stringify(dicts1.categories.RU['wines'])},
    ZH: ${JSON.stringify(dicts1.categories.ZH['wines'])},
  },
};

const DAILY_SPECIALS_SECTIONS = [
  {
    id: 'pasta',
    name: {
      IT: 'Primi Piatti',
      EN: 'First Courses',
      TH: 'อาหารจานแรก (พาสต้า)',
      DE: 'Erste Gänge (Pasta)',
      MM: 'ပထမဟင်းလျာများ (ပတ်စ်တာ)',
      ES: '${dicts1.dailySpecials.ES.pasta.name}',
      FR: '${dicts1.dailySpecials.FR.pasta.name}',
      RU: '${dicts1.dailySpecials.RU.pasta.name}',
      ZH: '${dicts1.dailySpecials.ZH.pasta.name}',
    },
    desc: {
      IT: 'Spaghetti allo Scoglio, Polpa di Granchio, Penne al Salmone, Tagliatelle al Nero di Seppia e Ravioli artigianali con formati a scelta.',
      EN: 'Seafood Spaghetti, Fresh Crab Meat, Salmon Penne, Squid Ink Tagliatelle, and artisanal Ravioli with your choice of pasta format.',
      TH: 'สปาเก็ตตี้ซีฟู้ดสดใหม่ ปูม้า แซลมอน ตัลยาเตลเล่หมึกดำ และราวิโอลีโฮมเมด เลือกเส้นและรูปแบบได้ตามใจชอบ',
      DE: 'Meeresfrüchte-Spaghetti, Krabbenfleisch, Lachs-Penne, Tintenfisch-Tagliatelle und hausgemachte Ravioli mit wählbaren Formaten.',
      MM: 'လတ်ဆတ်သော ပင်လယ်စာ စပါဂက်တီ၊ ဂဏန်းသား၊ ဆယ်လ်မွန်၊ ပြည်ကြီးငါးမှင်ခေါက်ဆွဲနှင့် လက်လုပ် ရာဗီအိုလီများ။',
      ES: '${dicts1.dailySpecials.ES.pasta.desc.replace(/'/g, "\\'")}',
      FR: '${dicts1.dailySpecials.FR.pasta.desc.replace(/'/g, "\\'")}',
      RU: '${dicts1.dailySpecials.RU.pasta.desc.replace(/'/g, "\\'")}',
      ZH: '${dicts1.dailySpecials.ZH.pasta.desc.replace(/'/g, "\\'")}',
    }
  },
  {
    id: 'traditional-italian-pizza',
    name: {
      IT: 'Pizze Gourmet Speciali',
      EN: 'Gourmet Special Pizzas',
      TH: 'พิซซ่ากูร์เมต์สูตรพิเศษ',
      DE: 'Gourmet-Spezialpizzen',
      MM: 'အထူး ဂူးမေး ပီဇာများ',
      ES: '${dicts1.dailySpecials.ES['traditional-italian-pizza'].name}',
      FR: '${dicts1.dailySpecials.FR['traditional-italian-pizza'].name}',
      RU: '${dicts1.dailySpecials.RU['traditional-italian-pizza'].name}',
      ZH: '${dicts1.dailySpecials.ZH['traditional-italian-pizza'].name}',
    },
    desc: {
      IT: 'Pizze artigianali a lievitazione naturale con polpa di granchio fresca o salsiccia nostrana, spinaci e gorgonzola.',
      EN: 'Artisanal naturally leavened pizzas with fresh crab meat or local sausage, spinach, and gorgonzola.',
      TH: 'พิซซ่าแป้งหมักยีสต์ธรรมชาติ หน้าเนื้อปูม้าสด และไส้กรอกหมูอิตาเลียนกับผักสตีลัชชี',
      DE: 'Handwerkliche Pizzen mit natürlicher Hefe und frischem Krabbenfleisch oder einheimischer Wurst, Spinat und Gorgonzola.',
      MM: 'လတ်ဆတ်သော ဂဏန်းသား သို့မဟုတ် အီတလီ ဝက်အူချောင်းဖြင့် ဖုတ်ထားသော လက်လုပ် ပီဇာများ။',
      ES: '${dicts1.dailySpecials.ES['traditional-italian-pizza'].desc.replace(/'/g, "\\'")}',
      FR: '${dicts1.dailySpecials.FR['traditional-italian-pizza'].desc.replace(/'/g, "\\'")}',
      RU: '${dicts1.dailySpecials.RU['traditional-italian-pizza'].desc.replace(/'/g, "\\'")}',
      ZH: '${dicts1.dailySpecials.ZH['traditional-italian-pizza'].desc.replace(/'/g, "\\'")}',
    }
  },
  {
    id: 'daily-specials',
    name: {
      IT: 'Secondi Piatti Tradizionali',
      EN: 'Traditional Main Courses',
      TH: 'อาหารจานหลักแบบดั้งเดิม',
      DE: 'Traditionelle Hauptgerichte',
      MM: 'ရိုးရာ အဓိက အစားအစာများ',
      ES: '${dicts1.dailySpecials.ES['daily-specials'].name}',
      FR: '${dicts1.dailySpecials.FR['daily-specials'].name}',
      RU: '${dicts1.dailySpecials.RU['daily-specials'].name}',
      ZH: '${dicts1.dailySpecials.ZH['daily-specials'].name}',
    },
    desc: {
      IT: 'Grandi classici e torte salate della tradizione italiana preparati al momento: Cotoletta alla Milanese, Cotechino artigianale con Purè e autentica Torta Pasqualina ligure.',
      EN: 'Italian culinary classics & savory pies made fresh: Crispy Milanese Cutlet with fries, Artisanal Cotechino with mashed potatoes, and Ligurian Torta Pasqualina.',
      TH: 'เมนูคลาสสิกและพายอบสไตล์อิตาเลียน: มิลานีสคัตเล็ตหมูทอดกรอบ ไส้กรอกโคเตคิโนโบราณพร้อมมันบด และพายตอร์ตา ปาสควาลินา',
      DE: 'Italienische Klassiker & herzhafte Torten: Knuspriges Mailänder Schnitzel, traditioneller Cotechino mit Kartoffelpüree und ligurische Torta Pasqualina.',
      MM: 'လတ်လတ်ဆတ်ဆတ် ချက်ပြုတ်ထားသော အီတလီ ရိုးရာ ဂန္တဝင် အစားအစာများနှင့် အရသာရှိ ပီဇာမုန့်များ။',
      ES: '${dicts1.dailySpecials.ES['daily-specials'].desc.replace(/'/g, "\\'")}',
      FR: '${dicts1.dailySpecials.FR['daily-specials'].desc.replace(/'/g, "\\'")}',
      RU: '${dicts1.dailySpecials.RU['daily-specials'].desc.replace(/'/g, "\\'")}',
      ZH: '${dicts1.dailySpecials.ZH['daily-specials'].desc.replace(/'/g, "\\'")}',
    }
  },
  {
    id: 'pizza-sandwich',
    name: {
      IT: 'Focacce Artigianali',
      EN: 'Artisanal Focaccias',
      TH: 'ฟอคคาเซียอบสดสไตล์อิตาเลียน',
      DE: 'Hausgemachte Focaccia',
      MM: 'လက်လုပ် ဖိုကာချာ မုန့်များ',
      ES: 'Focaccias artesanales',
      FR: 'Focaccias artisanales',
      RU: 'Ремесленные фокаччи',
      ZH: '手工佛卡夏',
    },
    desc: {
      IT: 'Focacce fragranti da impasto pizza cotte al forno e farcite con i migliori salumi italiani selezionati: Finocchiona, Pancetta arrotolata, Porchetta, Prosciutto Cotto e Salame.',
      EN: 'Fragrant oven-baked pizza dough focaccias filled with premium Italian cold cuts: Finocchiona, Rolled Pancetta, Porchetta, Cooked Ham, and Salami.',
      TH: 'ฟอคคาเซียอบสดใหม่กรอบนอกนุ่มใน สอดไส้โคลด์คัทอิตาเลียนชั้นเลิศ: ฟินอคคิโอนา, ปานเชตตา, พอร์เคตตา, แฮมสุก และซาลามี',
      DE: 'Ofenfrische Focaccia gefüllt mit feinsten italienischen Wurstspezialitäten: Finocchiona, gerollte Pancetta, Porchetta, Kochschinken und Salami.',
      MM: 'အီတလီ အသားလွှာ အကောင်းစားများ ညှပ်ထားသော မီးဖိုဖုတ် ဖိုကာချာ မုန့်များ။',
      ES: 'Focaccias de masa de pizza recién horneadas con los mejores embutidos italianos.',
      FR: 'Focaccias au four avec les meilleures charcuteries italiennes sélectionnées.',
      RU: 'Ароматные запеченные фокаччи из теста для пиццы с лучшими итальянскими мясными деликатесами.',
      ZH: '新鲜烤制的披萨面团佛卡夏，搭配精选优质意大利冷切肉。',
    }
  }
];

const ITALIAN_SALADS_SECTIONS = [
  {
    id: 'salads',
    name: {
      IT: 'Insalate Italiane',
      EN: 'Italian Salads',
      TH: 'สลัดอิตาเลียน',
      DE: 'Italienische Salate',
      MM: 'အီတလီဆလတ်များ',
      ES: '${dicts2.ES.ITALIAN_SALADS_SECTIONS.salads.name}',
      FR: '${dicts2.FR.ITALIAN_SALADS_SECTIONS.salads.name}',
      RU: '${dicts2.RU.ITALIAN_SALADS_SECTIONS.salads.name}',
      ZH: '${dicts2.ZH.ITALIAN_SALADS_SECTIONS.salads.name}',
    },
    desc: {
      IT: 'Insalate fresche con uova, pollo, patate o tonno preparate con verdure selezionate e condite con salse artigianali.',
      EN: 'Fresh salads with eggs, chicken, potatoes or tuna prepared with selected crisp vegetables and artisan dressings.',
      TH: 'สลัดสดใหม่ใส่ไข่ ไก่ มันฝรั่ง หรือทูน่า ปรุงด้วยผักสดคัดสรรและน้ำสลัดโฮมเมด',
      DE: 'Frische Salate mit Eiern, Hähnchen, Kartoffeln oder Thunfisch, zubereitet mit ausgewähltem Gemüse und hausgemachten Dressings.',
      MM: 'ကြက်ဥ၊ ကြက်သား၊ အာလူး သို့မဟုတ် တူနာငါးတို့ဖြင့် ပြင်ဆင်ထားသော လတ်ဆတ်သည့် အသုပ်များ။',
      ES: '${dicts2.ES.ITALIAN_SALADS_SECTIONS.salads.desc.replace(/'/g, "\\'")}',
      FR: '${dicts2.FR.ITALIAN_SALADS_SECTIONS.salads.desc.replace(/'/g, "\\'")}',
      RU: '${dicts2.RU.ITALIAN_SALADS_SECTIONS.salads.desc.replace(/'/g, "\\'")}',
      ZH: '${dicts2.ZH.ITALIAN_SALADS_SECTIONS.salads.desc.replace(/'/g, "\\'")}',
    }
  },
  {
    id: 'main-courses',
    name: {
      IT: 'Secondi Piatti Tradizionali',
      EN: 'Traditional Main Courses',
      TH: 'อาหารจานหลักแบบดั้งเดิม',
      DE: 'Traditionelle Hauptgerichte',
      MM: 'ရိုးရာ အဓိက အစားအစာများ',
      ES: '${dicts2.ES.ITALIAN_SALADS_SECTIONS['main-courses'].name}',
      FR: '${dicts2.FR.ITALIAN_SALADS_SECTIONS['main-courses'].name}',
      RU: '${dicts2.RU.ITALIAN_SALADS_SECTIONS['main-courses'].name}',
      ZH: '${dicts2.ZH.ITALIAN_SALADS_SECTIONS['main-courses'].name}',
    },
    desc: {
      IT: 'Grandi classici e torte salate della tradizione italiana: Cotoletta alla Milanese con patate, Cotechino artigianale con purè e autentica Torta Pasqualina ligure.',
      EN: 'Italian culinary classics & savory pies made fresh: Crispy Milanese Cutlet with fries, Artisanal Cotechino with mashed potatoes, and Ligurian Torta Pasqualina.',
      TH: 'เมนูคลาสสิกและพายอบสไตล์อิตาเลียน: มิลานีสคัตเล็ตหมูทอดกรอบ ไส้กรอกโคเตคิโนโบราณพร้อมมันบด และพายตอร์ตา ปาสควาลินา',
      DE: 'Italienische Klassiker & herzhafte Torten: Knuspriges Mailänder Schnitzel, traditioneller Cotechino mit Kartoffelpüree und ligurische Torta Pasqualina.',
      MM: 'လတ်လတ်ဆတ်ဆတ် ချက်ပြုတ်ထားသော အီတလီ ရိုးရာ ဂန္တဝင် အစားအစာများနှင့် အရသာရှိ ပီဇာမုန့်များ။',
      ES: '${dicts2.ES.ITALIAN_SALADS_SECTIONS['main-courses'].desc.replace(/'/g, "\\'")}',
      FR: '${dicts2.FR.ITALIAN_SALADS_SECTIONS['main-courses'].desc.replace(/'/g, "\\'")}',
      RU: '${dicts2.RU.ITALIAN_SALADS_SECTIONS['main-courses'].desc.replace(/'/g, "\\'")}',
      ZH: '${dicts2.ZH.ITALIAN_SALADS_SECTIONS['main-courses'].desc.replace(/'/g, "\\'")}',
    }
  }
];

const SALAD_SUBFILTER_LABELS: Record<string, Record<string, string>> = {
  IT: { all: 'Tutti i Piatti', salads: 'Insalate Italiane', mains: 'Secondi Piatti' },
  EN: { all: 'All Dishes', salads: 'Italian Salads', mains: 'Main Courses' },
  TH: { all: 'ทุกจาน', salads: 'สลัดอิตาเลียน', mains: 'จานหลัก' },
  DE: { all: 'Alle Gerichte', salads: 'Italienische Salate', mains: 'Hauptgerichte' },
  MM: { all: 'ဟင်းလျာအားလုံး', salads: 'အီတလီဆလတ်များ', mains: 'အဓိကဟင်းလျာများ' },
  ES: ${JSON.stringify(dicts2.ES.SALAD_SUBFILTER_LABELS)},
  FR: ${JSON.stringify(dicts2.FR.SALAD_SUBFILTER_LABELS)},
  RU: ${JSON.stringify(dicts2.RU.SALAD_SUBFILTER_LABELS)},
  ZH: ${JSON.stringify(dicts2.ZH.SALAD_SUBFILTER_LABELS)}
};

const SANDWICH_SUBFILTER_LABELS: Record<string, Record<string, string>> = {
  IT: { all: 'Tutti i Piatti', focacce: 'Focacce', sandwiches: 'Pizza Sandwich' },
  EN: { all: 'All Dishes', focacce: 'Focaccia', sandwiches: 'Pizza Sandwich' },
  TH: { all: 'ทุกจาน', focacce: 'โฟกัชชา', sandwiches: 'พิซซ่าแซนด์วิช' },
  DE: { all: 'Alle Gerichte', focacce: 'Focacce', sandwiches: 'Pizza-Sandwich' },
  MM: { all: 'ဟင်းလျာအားလုံး', focacce: 'ဖိုကာချာများ', sandwiches: 'ပီဇာဆန်းဒဝစ်' },
  ES: ${JSON.stringify(dicts2.ES.SANDWICH_SUBFILTER_LABELS)},
  FR: ${JSON.stringify(dicts2.FR.SANDWICH_SUBFILTER_LABELS)},
  RU: ${JSON.stringify(dicts2.RU.SANDWICH_SUBFILTER_LABELS)},
  ZH: ${JSON.stringify(dicts2.ZH.SANDWICH_SUBFILTER_LABELS)}
};

const FOCACCIA_SANDWICH_SECTIONS = [
  {
    id: 'focacce',
    name: {
      IT: 'Focacce',
      EN: 'Focaccia',
      TH: 'โฟกัชชา',
      DE: 'Focacce',
      MM: 'ဖိုကာချာများ',
      ES: '${dicts2.ES.FOCACCIA_SANDWICH_SECTIONS.focacce.name}',
      FR: '${dicts2.FR.FOCACCIA_SANDWICH_SECTIONS.focacce.name}',
      RU: '${dicts2.RU.FOCACCIA_SANDWICH_SECTIONS.focacce.name}',
      ZH: '${dicts2.ZH.FOCACCIA_SANDWICH_SECTIONS.focacce.name}',
    },
    desc: {
      IT: 'Focacce fragranti da impasto pizza all\\\'olio extravergine d\\\'oliva cotte al forno e farcite al momento con i migliori salumi italiani selezionati: Milanese, Finocchiona, Pancetta arrotolata, Porchetta, Prosciutto Cotto e Salame.',
      EN: 'Fragrant oven-baked pizza dough focaccias filled with premium Italian cold cuts: Milanese cutlet, Tuscan Finocchiona, Rolled Pancetta, Roasted Porchetta, Cooked Ham, and Salami.',
      TH: 'ฟอคคาเซียแป้งพิซซ่าอบสดใหม่สไตล์โฮมเมด สอดไส้โคลด์คัทอิตาเลียนพรีเมียม: มิลานีส, ฟินอคคิโอนา, ปานเชตตา, พอร์เคตตา, แฮมสุก และซาลามี',
      DE: 'Ofenfrische Pizza-Focaccia gefüllt mit feinsten italienischen Spezialitäten: Mailänder Schnitzel, Toskanische Finocchiona, gerollte Pancetta, Porchetta, Kochschinken und Salami.',
      MM: 'အီတလီ အသားလွှာ အကောင်းစားများနှင့် မီးဖိုဖုတ် ဖိုကာချာ မုန့်များ။',
      ES: '${dicts2.ES.FOCACCIA_SANDWICH_SECTIONS.focacce.desc.replace(/'/g, "\\'")}',
      FR: '${dicts2.FR.FOCACCIA_SANDWICH_SECTIONS.focacce.desc.replace(/'/g, "\\'")}',
      RU: '${dicts2.RU.FOCACCIA_SANDWICH_SECTIONS.focacce.desc.replace(/'/g, "\\'")}',
      ZH: '${dicts2.ZH.FOCACCIA_SANDWICH_SECTIONS.focacce.desc.replace(/'/g, "\\'")}',
    }
  },
  {
    id: 'pizza-sandwiches',
    name: {
      IT: 'Pizza Sandwich',
      EN: 'Pizza Sandwich',
      TH: 'พิซซ่าแซนด์วิช',
      DE: 'Pizza-Sandwich',
      MM: 'ပီဇာဆန်းဒဝစ်',
      ES: '${dicts2.ES.FOCACCIA_SANDWICH_SECTIONS['pizza-sandwiches'].name}',
      FR: '${dicts2.FR.FOCACCIA_SANDWICH_SECTIONS['pizza-sandwiches'].name}',
      RU: '${dicts2.RU.FOCACCIA_SANDWICH_SECTIONS['pizza-sandwiches'].name}',
      ZH: '${dicts2.ZH.FOCACCIA_SANDWICH_SECTIONS['pizza-sandwiches'].name}',
    },
    desc: {
      IT: 'Gustosi panini racchiusi nel nostro impasto pizza dorato e croccante con formaggio filante, pomodoro fresco e salumi italiani selezionati.',
      EN: 'Flavorful sandwiches wrapped in our golden, crispy pizza crust with melted cheese, fresh tomatoes, and premium Italian cold cuts.',
      TH: 'แซนด์วิชแป้งพิซซ่ากรอบนอกนุ่มใน สอดไส้ชีสเยิ้มๆ มะเขือเทศสด และโคลด์คัทอิตาเลียนชั้นเลิศ',
      DE: 'Köstliche Sandwiches in knusprigem Pizzateig mit geschmolzenem Käse, frischen Tomaten und feinen italienischen Wurstwaren.',
      MM: 'ရွှေဝါရောင် ကြွပ်ကြွပ်ရွ ပီဇာမုန့်သား၊ အရည်ပျော်နေသော ချိစ်နှင့် အသားလွှာများ ပါဝင်သော ပီဇာဆန်းဒဝစ်။',
      ES: '${dicts2.ES.FOCACCIA_SANDWICH_SECTIONS['pizza-sandwiches'].desc.replace(/'/g, "\\'")}',
      FR: '${dicts2.FR.FOCACCIA_SANDWICH_SECTIONS['pizza-sandwiches'].desc.replace(/'/g, "\\'")}',
      RU: '${dicts2.RU.FOCACCIA_SANDWICH_SECTIONS['pizza-sandwiches'].desc.replace(/'/g, "\\'")}',
      ZH: '${dicts2.ZH.FOCACCIA_SANDWICH_SECTIONS['pizza-sandwiches'].desc.replace(/'/g, "\\'")}',
    }
  }
];

const PASTA_SAUCES = [
  { 
    id: 'special-pasta', 
    name: { 
      IT: 'Specialità & Paste Ripiene', 
      EN: "Chef's Specials & Stuffed Pasta", 
      TH: 'พาสต้าและราวิโอลีสูตรพิเศษ', 
      DE: 'Spezialitäten & Gefüllte Pasta',
      MM: 'အထူးလက်ရာနှင့် အစာသွပ် ခေါက်ဆွဲ',
      ES: '${dicts2.ES.PASTA_SAUCES['special-pasta'].name.replace(/'/g, "\\'")}',
      FR: '${dicts2.FR.PASTA_SAUCES['special-pasta'].name.replace(/'/g, "\\'")}',
      RU: '${dicts2.RU.PASTA_SAUCES['special-pasta'].name.replace(/'/g, "\\'")}',
      ZH: '${dicts2.ZH.PASTA_SAUCES['special-pasta'].name.replace(/'/g, "\\'")}',
    }, 
    desc: {
      IT: 'Creazioni di mare e di terra della nostra cuoca: Spaghetti allo Scoglio, Polpa di Granchio, Penne al Salmone, Tagliatelle al Nero di Seppia e Ravioli artigianali ripieni.',
      EN: 'Seafood and artisan specialties: Seafood Spaghetti, Blue Crab Meat, Salmon Penne, Squid Ink Tagliatelle, and handmade stuffed Ravioli.',
      TH: 'พาสต้าซีฟู้ดสดใหม่ ปูม้า แซลมอน ตัลยาเตลเล่หมึกดำ และราวิโอลีโฮมเมดสอดไส้สูตรดั้งเดิม',
      DE: 'Meeresfrüchte- und Spezialitätenkreationen: Frutti di Mare Spaghetti, Krabbenfleisch, Lachs-Penne, Tintenfisch-Tagliatelle und hausgemachte gefüllte Ravioli.',
      MM: 'ပင်လယ်စာ စပါဂက်တီ၊ ဂဏန်းသား၊ ဆယ်လ်မွန်နှင့် လက်လုပ် ရာဗီအိုလီ အထူးဟင်းလျာများ။',
      ES: '${dicts2.ES.PASTA_SAUCES['special-pasta'].desc.replace(/'/g, "\\'")}',
      FR: '${dicts2.FR.PASTA_SAUCES['special-pasta'].desc.replace(/'/g, "\\'")}',
      RU: '${dicts2.RU.PASTA_SAUCES['special-pasta'].desc.replace(/'/g, "\\'")}',
      ZH: '${dicts2.ZH.PASTA_SAUCES['special-pasta'].desc.replace(/'/g, "\\'")}',
    }, 
    pattern: 'special' 
  },
  { 
    id: 'aglio-olio', 
    name: { 
      IT: 'Aglio, Olio e Peperoncino', 
      EN: 'Garlic, Oil & Chili', 
      TH: 'อากลิโอ โอลิโอ พริกแห้ง', 
      DE: 'Knoblauch, Öl & Chili',
      MM: 'ကြက်သွန်ဖြူ၊ သံလွင်ဆီနှင့် ငရုတ်သီး',
      ES: '${dicts2.ES.PASTA_SAUCES['aglio-olio'].name.replace(/'/g, "\\'")}',
      FR: '${dicts2.FR.PASTA_SAUCES['aglio-olio'].name.replace(/'/g, "\\'")}',
      RU: '${dicts2.RU.PASTA_SAUCES['aglio-olio'].name.replace(/'/g, "\\'")}',
      ZH: '${dicts2.ZH.PASTA_SAUCES['aglio-olio'].name.replace(/'/g, "\\'")}',
    }, 
    desc: {
      IT: 'Un classico italiano semplice e saporito preparato con aglio, olio extravergine d\\'oliva e peperoncino, con un gusto intenso e aromatico che delizia ogni singolo morso.',
      EN: 'A simple and flavorful Italian classic made with garlic, olive oil, and chili, with an intense, aromatic taste that delights every single bite',
      TH: 'พาสต้าผัดกระเทียม น้ำมันมะกอก และพริกแห้ง รสชาติเข้มข้นจัดจ้านสไตล์อิตาเลียน',
      DE: 'Ein einfacher und geschmackvoller italienischer Klassiker aus Knoblauch, Olivenöl und Chili, mit einem intensiven, aromatischen Geschmack, der jeden Bissen begeistert.',
      MM: 'ကြက်သွန်ဖြူ၊ သံလွင်ဆီနှင့် ငရုတ်သီးတို့ဖြင့် မွှေးပျံ့စွာ ကြော်ထားသော ဂန္တဝင် အီတလီ ခေါက်ဆွဲ။',
      ES: '${dicts2.ES.PASTA_SAUCES['aglio-olio'].desc.replace(/'/g, "\\'")}',
      FR: '${dicts2.FR.PASTA_SAUCES['aglio-olio'].desc.replace(/'/g, "\\'")}',
      RU: '${dicts2.RU.PASTA_SAUCES['aglio-olio'].desc.replace(/'/g, "\\'")}',
      ZH: '${dicts2.ZH.PASTA_SAUCES['aglio-olio'].desc.replace(/'/g, "\\'")}',
    }, 
    pattern: 'Garlic, Oil' 
  },
  { 
    id: 'pomodoro', 
    name: { 
      IT: 'Salsa di Pomodoro', 
      EN: 'Tomato Sauce', 
      TH: 'ซอสมะเขือเทศ', 
      DE: 'Tomatensauce',
      MM: 'ခရမ်းချဉ်သီးဆော့စ်',
      ES: '${dicts2.ES.PASTA_SAUCES['pomodoro'].name.replace(/'/g, "\\'")}',
      FR: '${dicts2.FR.PASTA_SAUCES['pomodoro'].name.replace(/'/g, "\\'")}',
      RU: '${dicts2.RU.PASTA_SAUCES['pomodoro'].name.replace(/'/g, "\\'")}',
      ZH: '${dicts2.ZH.PASTA_SAUCES['pomodoro'].name.replace(/'/g, "\\'")}',
    }, 
    desc: {
      IT: 'Salsa di pomodoro all\\'italiana preparata con pomodori maturi, olio d\\'oliva, aglio o cipolla, sale e basilico. È il cuore pulsante della cucina italiana.',
      EN: 'Italian tomato sauce made with ripe tomatoes, olive oil, garlic or onion, salt, and basil. It\\\'s the heart of Italian cuisine',
      TH: 'ซอสมะเขือเทศอิตาเลียนรสเข้มข้น เคี่ยวกับกระเทียม หอมใหญ่ และใบโหระพาอิตาเลียน',
      DE: 'Italienische Tomatensauce aus reifen Tomaten, Olivenöl, Knoblauch oder Zwiebeln, Salz und Basilikum. Sie ist das Herz der italienischen Küche.',
      MM: 'မှည့်ဝင်းသော ခရမ်းချဉ်သီး၊ သံလွင်ဆီနှင့် ပင်စိမ်းရွက်တို့ဖြင့် ချက်ထားသော ရိုးရာ အီတလီဆော့စ်။',
      ES: '${dicts2.ES.PASTA_SAUCES['pomodoro'].desc.replace(/'/g, "\\'")}',
      FR: '${dicts2.FR.PASTA_SAUCES['pomodoro'].desc.replace(/'/g, "\\'")}',
      RU: '${dicts2.RU.PASTA_SAUCES['pomodoro'].desc.replace(/'/g, "\\'")}',
      ZH: '${dicts2.ZH.PASTA_SAUCES['pomodoro'].desc.replace(/'/g, "\\'")}',
    }, 
    pattern: 'Tomato Sauce' 
  },
  { 
    id: 'pesto', 
    name: { 
      IT: 'Pesto Genovese', 
      EN: 'Pesto Genovese', 
      TH: 'ซอสเพสโต้', 
      DE: 'Pesto Genovese',
      MM: 'ပက်စတို ဆော့စ်',
      ES: '${dicts2.ES.PASTA_SAUCES['pesto'].name.replace(/'/g, "\\'")}',
      FR: '${dicts2.FR.PASTA_SAUCES['pesto'].name.replace(/'/g, "\\'")}',
      RU: '${dicts2.RU.PASTA_SAUCES['pesto'].name.replace(/'/g, "\\'")}',
      ZH: '${dicts2.ZH.PASTA_SAUCES['pesto'].name.replace(/'/g, "\\'")}',
    }, 
    desc: {
      IT: 'Salsa fresca al basilico con anacardi, parmigiano, aglio e olio d\\'oliva, con un sapore ricco e aromatico che evoca i profumi di Genova.',
      EN: 'Fresh basil sauce with cashews, parmesan cheese, garlic, and olive oil, with a rich, aromatic flavor that evokes the scent of Genoa',
      TH: 'ซอสใบโหระพาอิตาเลียนปั่นสดใหม่ ใส่เม็ดมะม่วงหิมพานต์ พาเมซานชีส กระเทียม และน้ำมันมะกอก',
      DE: 'Frische Basilikumsauce mit Cashewnüssen, Parmesankäse, Knoblauch und Olivenöl, mit einem reichen, aromatischen Geschmack, der an Genua erinnert.',
      MM: 'လတ်ဆတ်သော ပင်စိမ်းရွက်၊ သီဟိုဠ်စေ့၊ ပါမီဂျန်ချိစ်နှင့် သံလွင်ဆီတို့ဖြင့် ပြုလုပ်ထားသော မွှေးပျံ့သည့် ပက်စတိုဆော့စ်။',
      ES: '${dicts2.ES.PASTA_SAUCES['pesto'].desc.replace(/'/g, "\\'")}',
      FR: '${dicts2.FR.PASTA_SAUCES['pesto'].desc.replace(/'/g, "\\'")}',
      RU: '${dicts2.RU.PASTA_SAUCES['pesto'].desc.replace(/'/g, "\\'")}',
      ZH: '${dicts2.ZH.PASTA_SAUCES['pesto'].desc.replace(/'/g, "\\'")}',
    }, 
    pattern: 'Pesto Genovese' 
  },
  { 
    id: 'amatriciana', 
    name: { 
      IT: 'Salsa Amatriciana', 
      EN: 'Amatriciana', 
      TH: 'ซอสอามาริเชียนา', 
      DE: 'Amatriciana',
      MM: 'အာမာထရီချာနာ ဆော့စ်',
      ES: '${dicts2.ES.PASTA_SAUCES['amatriciana'].name.replace(/'/g, "\\'")}',
      FR: '${dicts2.FR.PASTA_SAUCES['amatriciana'].name.replace(/'/g, "\\'")}',
      RU: '${dicts2.RU.PASTA_SAUCES['amatriciana'].name.replace(/'/g, "\\'")}',
      ZH: '${dicts2.ZH.PASTA_SAUCES['amatriciana'].name.replace(/'/g, "\\'")}',
    }, 
    desc: {
      IT: 'Salsa in stile romano con pomodoro, guanciale e pecorino, cotta lentamente per ottenere un sapore dolce e sapido bilanciato, un classico della tradizione italiana.',
      EN: 'Roman-style sauce with tomato, cured pork cheek, and pecorino, slowly cooked for a balanced sweet and savory flavor, a classic of Italian tradition',
      TH: 'ซอสสไตล์โรมันเข้มข้น เคี่ยวกับแก้มหมูรมควัน กวานชาเล มะเขือเทศ และชีสเปโกริโน',
      DE: 'Sauce nach römischer Art mit Tomaten, Guanciale und Pecorino, langsam gekocht für einen ausgewogenen süß-würzigen Geschmack, ein Klassiker der italienischen Tradition.',
      MM: 'ခရမ်းချဉ်သီး၊ ဝက်ပါးစပ်သားနှင့် ပီကိုရီနိုချိစ်တို့ဖြင့် ဖြည်းညင်းစွာ ချက်ထားသော ရိုးရာ ရောမဆော့စ်။',
      ES: '${dicts2.ES.PASTA_SAUCES['amatriciana'].desc.replace(/'/g, "\\'")}',
      FR: '${dicts2.FR.PASTA_SAUCES['amatriciana'].desc.replace(/'/g, "\\'")}',
      RU: '${dicts2.RU.PASTA_SAUCES['amatriciana'].desc.replace(/'/g, "\\'")}',
      ZH: '${dicts2.ZH.PASTA_SAUCES['amatriciana'].desc.replace(/'/g, "\\'")}',
    }, 
    pattern: 'Amatriciana' 
  },
  { 
    id: 'carbonara', 
    name: { 
      IT: 'Salsa Carbonara', 
      EN: 'Carbonara', 
      TH: 'ซอสคาโบนาร่า', 
      DE: 'Carbonara',
      MM: 'ကာဘိုနာရာ ဆော့စ်',
      ES: '${dicts2.ES.PASTA_SAUCES['carbonara'].name.replace(/'/g, "\\'")}',
      FR: '${dicts2.FR.PASTA_SAUCES['carbonara'].name.replace(/'/g, "\\'")}',
      RU: '${dicts2.RU.PASTA_SAUCES['carbonara'].name.replace(/'/g, "\\'")}',
      ZH: '${dicts2.ZH.PASTA_SAUCES['carbonara'].name.replace(/'/g, "\\'")}',
    }, 
    desc: {
      IT: 'Ricetta autentica romana con tuorlo d\\'uovo fresco, guanciale croccante e formaggio pecorino romano D.O.P., cremosa e irresistibile.',
      EN: 'Authentic Roman recipe with fresh egg yolk, crispy guanciale, and aged Pecorino Romano D.O.P. cheese, rich and velvety.',
      TH: 'สูตรต้นตำรับแท้จากกรุงโรม ผสมผสานไข่แดงสด กวานชาเลกรอบ และชีสเปโกริโน โรมาโน',
      DE: 'Authentisches römisches Rezept mit frischem Eigelb, knusprigem Guanciale und Pecorino Romano D.O.P., cremig und unwiderstehlich.',
      MM: 'လတ်ဆတ်သော ကြက်ဥအနှစ်၊ ကြွပ်ရွသော ဝက်ပါးစပ်သားနှင့် ပီကိုရီနိုချိစ်တို့ဖြင့် ဖျော်စပ်ထားသော စစ်မှန်သည့် ရောမ ကာဘိုနာရာ။',
      ES: '${dicts2.ES.PASTA_SAUCES['carbonara'].desc.replace(/'/g, "\\'")}',
      FR: '${dicts2.FR.PASTA_SAUCES['carbonara'].desc.replace(/'/g, "\\'")}',
      RU: '${dicts2.RU.PASTA_SAUCES['carbonara'].desc.replace(/'/g, "\\'")}',
      ZH: '${dicts2.ZH.PASTA_SAUCES['carbonara'].desc.replace(/'/g, "\\'")}',
    }, 
    pattern: 'Carbonara' 
  },
  { 
    id: 'bolognese', 
    name: { 
      IT: 'Ragù alla Bolognese', 
      EN: 'Bolognese Ragù', 
      TH: 'ซอสเนื้อโบโลเนส', 
      DE: 'Bolognese Ragù',
      MM: 'ဘိုလိုနိစ် အမဲသားဆော့စ်',
      ES: '${dicts2.ES.PASTA_SAUCES['bolognese'].name.replace(/'/g, "\\'")}',
      FR: '${dicts2.FR.PASTA_SAUCES['bolognese'].name.replace(/'/g, "\\'")}',
      RU: '${dicts2.RU.PASTA_SAUCES['bolognese'].name.replace(/'/g, "\\'")}',
      ZH: '${dicts2.ZH.PASTA_SAUCES['bolognese'].name.replace(/'/g, "\\'")}',
    }, 
    desc: {
      IT: 'Salsa ricca e corposa di carne macinata di maiale cotta a fuoco lento per ore con pomodoro e aromi, come vuole la tradizione emiliana.',
      EN: 'Rich and savory slow-cooked minced pork meat sauce simmered with tomatoes and herbs according to true Italian tradition.',
      TH: 'ซอสเนื้อหมูสับเคี่ยวไฟอ่อนนานหลายชั่วโมงกับมะเขือเทศและเครื่องเทศตามแบบฉบับอิตาลีแท้',
      DE: 'Herzhaftes, stundenlang sanft geköcheltes Fleischragù mit Tomaten und Kräutern nach echter italienischer Tradition.',
      MM: 'ခရမ်းချဉ်သီးနှင့် ဟင်းခတ်အမွှေးအကြိုင်များဖြင့် နာရီပေါင်းများစွာ ဖြည်းညင်းစွာ ကျိုထားသော အမဲ/ဝက်သားဆော့စ်။',
      ES: '${dicts2.ES.PASTA_SAUCES['bolognese'].desc.replace(/'/g, "\\'")}',
      FR: '${dicts2.FR.PASTA_SAUCES['bolognese'].desc.replace(/'/g, "\\'")}',
      RU: '${dicts2.RU.PASTA_SAUCES['bolognese'].desc.replace(/'/g, "\\'")}',
      ZH: '${dicts2.ZH.PASTA_SAUCES['bolognese'].desc.replace(/'/g, "\\'")}',
    }, 
    pattern: 'Bolognese' 
  },
  { 
    id: 'gorgonzola', 
    name: { 
      IT: 'Crema di Gorgonzola', 
      EN: 'Creamy Gorgonzola', 
      TH: 'ซอสครีมกอร์กอนโซล่า', 
      DE: 'Cremiges Gorgonzola',
      MM: 'ဂေါ်ဂွန်ဇိုလာ ချိစ်ဆော့စ်',
      ES: '${dicts2.ES.PASTA_SAUCES['gorgonzola'].name.replace(/'/g, "\\'")}',
      FR: '${dicts2.FR.PASTA_SAUCES['gorgonzola'].name.replace(/'/g, "\\'")}',
      RU: '${dicts2.RU.PASTA_SAUCES['gorgonzola'].name.replace(/'/g, "\\'")}',
      ZH: '${dicts2.ZH.PASTA_SAUCES['gorgonzola'].name.replace(/'/g, "\\'")}',
    }, 
    desc: {
      IT: 'Salsa vellutata e intensa a base di autentico formaggio erborinato Gorgonzola D.O.P. fuso con burro di qualità.',
      EN: 'Rich, creamy and intense sauce made with authentic melted Italian Gorgonzola D.O.P. blue cheese and butter.',
      TH: 'ซอสครีมชีสบลูชีสกอร์กอนโซล่าแท้ รสชาติเข้มข้น หอมมัน กลมกล่อม',
      DE: 'Samtig-würzige Sauce aus geschmolzenem italienischen Gorgonzola D.O.P. Blauschimmelkäse und Butter.',
      MM: 'စစ်မှန်သော အီတလီ ဂေါ်ဂွန်ဇိုလာ ဘလူးချိစ်နှင့် ထောပတ်တို့ဖြင့် ဖျော်စပ်ထားသော အရသာပြည့်ဝသည့် ဆော့စ်။',
      ES: '${dicts2.ES.PASTA_SAUCES['gorgonzola'].desc.replace(/'/g, "\\'")}',
      FR: '${dicts2.FR.PASTA_SAUCES['gorgonzola'].desc.replace(/'/g, "\\'")}',
      RU: '${dicts2.RU.PASTA_SAUCES['gorgonzola'].desc.replace(/'/g, "\\'")}',
      ZH: '${dicts2.ZH.PASTA_SAUCES['gorgonzola'].desc.replace(/'/g, "\\'")}',
    }, 
    pattern: 'Gorgonzola' 
  }
];
`;

const targetStart = 'const translations = {';
const targetEnd = 'const PASTA_SAUCES = [';

const idxStart = content.indexOf(targetStart);
// Find the end of PASTA_SAUCES array
const idxPasta = content.indexOf(targetEnd);
const idxEnd = content.indexOf('];', idxPasta) + 2;

if (idxStart === -1 || idxEnd === -1) {
  console.error('Target block not found!');
  process.exit(1);
}

content = content.slice(0, idxStart) + newCodeBlock.trim() + content.slice(idxEnd);

// Also add fallback guard for const t = translations[lang]
content = content.replace(
  'const t = translations[lang];',
  'const t = translations[lang] || translations.EN || translations.IT;'
);

content = content.replace(
  'const activeCategoryName = categoryDetails[activeCategory.id]?.[lang]?.name || activeCategory.name;',
  'const activeCategoryName = categoryDetails[activeCategory.id]?.[lang]?.name || categoryDetails[activeCategory.id]?.EN?.name || categoryDetails[activeCategory.id]?.IT?.name || activeCategory.name;'
);

fs.writeFileSync(deliveryMenuPath, content, 'utf8');
console.log('✅ Applied full translations and fallbacks to DeliveryMenu.tsx!');
