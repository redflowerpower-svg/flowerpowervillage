import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Globe, ChevronDown, ChevronLeft, Wine, Beer, Sparkles, Filter, RotateCcw, Check, UtensilsCrossed, Truck, Percent, ArrowRight, MapPin, AlertTriangle, Clock, Leaf, Wheat, Salad, Sandwich } from 'lucide-react';
import { menuData, type MenuItem } from '../data/menuData';
import CategoryTabs from '../components/CategoryTabs';
import MenuGrid from '../components/MenuGrid';
import CartDrawer from '../components/CartDrawer';
import CheckoutFlow from '../components/CheckoutFlow';
import { useCartStore } from '../store/cartStore';
import PizzaSlideshow from '../../components/PizzaSlideshow';
import { INITIAL_WINE_COLLECTION, WINE_COUNTRY_OPTIONS, resolveWineCategoryType, sortWinesByCountryOrder, getCountryRank, WineCardData } from '../data/wineData';
import { fetchCloudWineCollection } from '../data/wineCloudService';
import { fetchCloudMenuOverrides } from '../data/pizzaMenuCloudService';
import { ServiceStatusBanner } from '../components/ServiceStatusBanner';
import { usePizzeriaStatus, PizzeriaServiceStatus, DEFAULT_PIZZERIA_STATUS } from '../services/pizzaServiceStatus';
import PizzaPoliciesModal, { PolicyTab } from '../components/PizzaPoliciesModal';
import { TableReservationModal } from '../components/TableReservationModal';
import { checkFirstOrderEligibility, getOrCreateDeviceId } from '../services/firstOrderService';
import { useLanguageStore } from '../store/languageStore';
import { i18n } from '../data/i18n';
import { SUPPORTED_LANGUAGES, LANGUAGE_METAS } from '../config/languages';
import { getDietaryType, type DietaryType } from '../utils/dietary';
import { supabase } from '../../lib/supabase';


const translations = {
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
};

const categoryDetails: Record<string, Record<string, { name: string; desc: string }>> = {
  'daily-specials': {
    IT: { name: 'Piatti del Giorno', desc: 'Creazioni esclusive e piatti speciali del giorno preparati dal nostro chef con ingredienti freschi di stagione' },
    EN: { name: 'Daily Specials', desc: 'Exclusive daily creations and seasonal specialties freshly prepared by our Italian chef with premium ingredients' },
    TH: { name: 'จานพิเศษประจำวัน', desc: 'เมนูพิเศษประจำวันรังสรรค์โดยเชฟชาวอิตาเลียน ด้วยวัตถุดิบสดใหม่ตามฤดูกาล' },
    DE: { name: 'Tagesgerichte', desc: 'Täglich wechselnde Spezialitäten und saisonale Gerichte unseres Chefkochs aus frischen Zutaten' },
    MM: { name: 'နေ့စဉ် ဟင်းပွဲများ', desc: 'အီတလီစားဖိုမှူးမှ လတ်ဆတ်သော ရာသီပေါ် ကုန်ကြမ်းများဖြင့် နေ့စဉ် သီးသန့် ဖန်တီးထားသော အထူးဟင်းလျာများ' },
  },
  'traditional-italian-pizza': {
    IT: { name: 'Pizze Classiche', desc: 'Impasto a fermentazione naturale' },
    EN: { name: 'Classic Pizzas', desc: 'Slow-fermented Italian dough' },
    TH: { name: 'พิซซ่าคลาสสิค', desc: 'แป้งหมักธรรมชาติสูตรดั้งเดิม' },
    DE: { name: 'Klassische Pizzas', desc: 'Natursauerteig-Pizzaboden' },
    MM: { name: 'ရိုးရာ အီတလီ ပီဇာ', desc: 'သဘာဝနည်းဖြင့် နှပ်ထားသော မုန့်သား' },
  },
  'pasta': {
    IT: { name: 'Pasta & Primi', desc: 'Primi piatti della tradizione e pasta fresca' },
    EN: { name: 'Pasta & First Courses', desc: 'Traditional Italian pasta & fresh first courses' },
    TH: { name: 'พาสต้า & อาหารจานแรก', desc: 'เมนูพาสต้าอิตาเลียนดั้งเดิมและอาหารจานเส้น' },
    DE: { name: 'Pasta & Primi', desc: 'Traditionelle italienische Pasta & Nudelgerichte' },
    MM: { name: 'ခေါက်ဆွဲ & ပတ်စ်တာ', desc: 'ရိုးရာ အီတလီ ခေါက်ဆွဲ ဟင်းလျာများ' },
  },
  'breakfast-and-snacks': {
    IT: { name: 'Colazione & Snack', desc: 'Per iniziare la giornata' },
    EN: { name: 'Breakfast & Snacks', desc: 'To start your day' },
    TH: { name: 'อาหารเช้าและของว่าง', desc: 'เริ่มต้นวันใหม่ด้วยพลังงาน' },
    DE: { name: 'Frühstück & Snacks', desc: 'Für einen guten Start in den Tag' },
    MM: { name: 'နံနက်စာနှင့် သရေစာ', desc: 'နေ့သစ်ကို စတင်ရန်' },
  },
  'coffee-shop': {
    IT: { name: 'Caffetteria', desc: 'Caffè espresso italiano' },
    EN: { name: 'Coffee Shop', desc: 'Italian espresso coffee' },
    TH: { name: 'ร้านกาแฟ', desc: 'เอสเพรสโซ่อิตาเลียนแท้' },
    DE: { name: 'Kaffeeshop', desc: 'Italienischer Espresso' },
    MM: { name: 'ကော်ဖီဆိုင်', desc: 'စစ်မှန်သော အီတလီ အက်စ်ပရက်ဆို ကော်ဖီ' },
  },
  'fruit-drinks': {
    IT: { name: 'Bevande alla Frutta', desc: 'Frullati e shake freschi' },
    EN: { name: 'Fruit Drinks', desc: 'Fresh fruit shakes' },
    TH: { name: 'เครื่องดื่มผลไม้', desc: 'ผลไม้สดปั่นสดใหม่' },
    DE: { name: 'Fruchtgetränke', desc: 'Frische Frucht-Shakes' },
    MM: { name: 'သစ်သီးဖျော်ရည်များ', desc: 'လတ်ဆတ်သော သစ်သီးဖျော်ရည်များ' },
  },
  'soft-drinks': {
    IT: { name: 'Bibite & Acqua', desc: 'Bibite analcoliche in lattina, acqua minerale naturale e bevande rinfrescanti servite fredde.' },
    EN: { name: 'Soft Drinks & Water', desc: 'Canned soft drinks, natural mineral water, and chilled refreshing beverages.' },
    TH: { name: 'น้ำอัดลมและน้ำดื่ม', desc: 'น้ำอัดลมกระป๋อง น้ำดื่มธรรมชาติ และเครื่องดื่มเพิ่มความสดชื่นเสิร์ฟเย็น' },
    DE: { name: 'Erfrischungsgetränke & Wasser', desc: 'Erfrischungsgetränke in der Dose, natürliches Mineralwasser und gekühlte Getränke.' },
    MM: { name: 'အအေးနှင့် သောက်ရေသန့်', desc: 'ဗူးသွပ်အအေးများ၊ သဘာဝတွင်းထွက်ရေနှင့် အေးမြလန်းဆန်းစေသော သောက်စရာများ။' },
  },
  'beers': {
    IT: { name: 'Birre', desc: 'Le migliori marche di birra in bottiglia grande e piccola, servite ghiacciate.' },
    EN: { name: 'Beers', desc: 'The best Thai and international bottled beers served ice cold.' },
    TH: { name: 'เบียร์', desc: 'เบียร์ขวดเย็นเจี๊ยบคุณภาพดี มีให้เลือกทั้งขวดใหญ่และขวดเล็ก' },
    DE: { name: 'Biere', desc: 'Beste thailändische und internationale Flaschenbiere eiskalt serviert.' },
    MM: { name: 'ဘီယာများ', desc: 'အကောင်းဆုံး ထိုင်းနှင့် နိုင်ငံတကာ ဘီယာပုလင်း အေးအေးများ။' },
  },
  'beers-and-wines': {
    IT: { name: 'Birre & Vini', desc: 'Birre fresche e selezione di vini italiani' },
    EN: { name: 'Beers & Wines', desc: 'Chilled beers and Italian wine selection' },
    TH: { name: 'เบียร์และไวน์', desc: 'เบียร์เย็นๆ และไวน์อิตาเลียนคัดสรร' },
    DE: { name: 'Biere & Weine', desc: 'Gekühlte Biere und ausgewählte italienische Weine' },
    MM: { name: 'ဘီယာနှင့် ဝိုင်များ', desc: 'အေးမြသော ဘီယာများနှင့် ရွေးချယ်ထားသော အီတလီ ဝိုင်များ' },
  },
  'wines': {
    IT: { name: 'Carta dei Vini', desc: 'Selezione accurata di vini italiani ed internazionali, scelti per esaltare i sapori di ogni piatto del nostro menù.' },
    EN: { name: 'Wine List', desc: 'Carefully curated selection of fine Italian and international wines, chosen to enhance the flavors of every dish on our menu.' },
    TH: { name: 'รายการไวน์', desc: 'คัดสรรไวน์อิตาเลียนและไวน์นานาชาติชั้นเลิศอย่างพิถีพิถัน เพื่อเสริมรสชาติของทุกเมนูให้โดดเด่นและสมดุลยิ่งขึ้น' },
    DE: { name: 'Weinkarte', desc: 'Sorgfältig zusammengestellte Auswahl an italienischen und internationalen Weinen, die darauf abgestimmt sind, die Aromen jedes Gerichts auf unserer Speisekarte hervorzuheben.' },
    MM: { name: 'ဝိုင်စာရင်း', desc: 'ကျွန်ုပ်တို့၏ ဟင်းလျာ အရသာတိုင်းကို ပိုမိုပြည့်စုံစေရန် ဂရုတစိုက် ရွေးချယ်ထားသော အီတလီနှင့် နိုင်ငံတကာ ဝိုင်ကောင်းများ။' },
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
    },
    desc: {
      IT: 'Spaghetti allo Scoglio, Polpa di Granchio, Penne al Salmone, Tagliatelle al Nero di Seppia e Ravioli artigianali con formati a scelta.',
      EN: 'Seafood Spaghetti, Fresh Crab Meat, Salmon Penne, Squid Ink Tagliatelle, and artisanal Ravioli with your choice of pasta format.',
      TH: 'สปาเก็ตตี้ซีฟู้ดสดใหม่ ปูม้า แซลมอน ตัลยาเตลเล่หมึกดำ และราวิโอลีโฮมเมด เลือกเส้นและรูปแบบได้ตามใจชอบ',
      DE: 'Meeresfrüchte-Spaghetti, Krabbenfleisch, Lachs-Penne, Tintenfisch-Tagliatelle und hausgemachte Ravioli mit wählbaren Formaten.',
      MM: 'လတ်ဆတ်သော ပင်လယ်စာ စပါဂက်တီ၊ ဂဏန်းသား၊ ဆယ်လ်မွန်၊ ပြည်ကြီးငါးမှင်ခေါက်ဆွဲနှင့် လက်လုပ် ရာဗီအိုလီများ။',
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
    },
    desc: {
      IT: 'Pizze artigianali a lievitazione naturale con polpa di granchio fresca o salsiccia nostrana, spinaci e gorgonzola.',
      EN: 'Artisanal naturally leavened pizzas with fresh crab meat or local sausage, spinach, and gorgonzola.',
      TH: 'พิซซ่าแป้งหมักยีสต์ธรรมชาติ หน้าเนื้อปูม้าสด และไส้กรอกหมูอิตาเลียนกับผักสตีลัชชี',
      DE: 'Handwerkliche Pizzen mit natürlicher Hefe und frischem Krabbenfleisch oder einheimischer Wurst, Spinat und Gorgonzola.',
      MM: 'လတ်ဆတ်သော ဂဏန်းသား သို့မဟုတ် အီတလီ ဝက်အူချောင်းဖြင့် ဖုတ်ထားသော လက်လုပ် ပီဇာများ။',
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
    },
    desc: {
      IT: 'Grandi classici e torte salate della tradizione italiana preparati al momento: Cotoletta alla Milanese, Cotechino artigianale con Purè e autentica Torta Pasqualina ligure.',
      EN: 'Italian culinary classics & savory pies made fresh: Crispy Milanese Cutlet with fries, Artisanal Cotechino with mashed potatoes, and Ligurian Torta Pasqualina.',
      TH: 'เมนูคลาสสิกและพายอบสไตล์อิตาเลียน: มิลานีสคัตเล็ตหมูทอดกรอบ ไส้กรอกโคเตคิโนโบราณพร้อมมันบด และพายตอร์ตา ปาสควาลินา',
      DE: 'Italienische Klassiker & herzhafte Torten: Knuspriges Mailänder Schnitzel, traditioneller Cotechino mit Kartoffelpüree und ligurische Torta Pasqualina.',
      MM: 'လတ်လတ်ဆတ်ဆတ် ချက်ပြုတ်ထားသော အီတလီ ရိုးရာ ဂန္တဝင် အစားအစာများနှင့် အရသာရှိ ပီဇာမုန့်များ။',
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
    },
    desc: {
      IT: 'Focacce fragranti da impasto pizza cotte al forno e farcite con i migliori salumi italiani selezionati: Finocchiona, Pancetta arrotolata, Porchetta, Prosciutto Cotto e Salame.',
      EN: 'Fragrant oven-baked pizza dough focaccias filled with premium Italian cold cuts: Finocchiona, Rolled Pancetta, Porchetta, Cooked Ham, and Salami.',
      TH: 'ฟอคคาเซียอบสดใหม่กรอบนอกนุ่มใน สอดไส้โคลด์คัทอิตาเลียนชั้นเลิศ: ฟินอคคิโอนา, ปานเชตตา, พอร์เคตตา, แฮมสุก และซาลามี',
      DE: 'Ofenfrische Focaccia gefüllt mit feinsten italienischen Wurstspezialitäten: Finocchiona, gerollte Pancetta, Porchetta, Kochschinken und Salami.',
      MM: 'အီတလီ အသားလွှာ အကောင်းစားများ ညှပ်ထားသော မီးဖိုဖုတ် ဖိုကာချာ မုန့်များ။',
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
    },
    desc: {
      IT: 'Insalate fresche con uova, pollo, patate o tonno preparate con verdure selezionate e condite con salse artigianali.',
      EN: 'Fresh salads with eggs, chicken, potatoes or tuna prepared with selected crisp vegetables and artisan dressings.',
      TH: 'สลัดสดใหม่ใส่ไข่ ไก่ มันฝรั่ง หรือทูน่า ปรุงด้วยผักสดคัดสรรและน้ำสลัดโฮมเมด',
      DE: 'Frische Salate mit Eiern, Hähnchen, Kartoffeln oder Thunfisch, zubereitet mit ausgewähltem Gemüse und hausgemachten Dressings.',
      MM: 'ကြက်ဥ၊ ကြက်သား၊ အာလူး သို့မဟုတ် တူနာငါးတို့ဖြင့် ပြင်ဆင်ထားသော လတ်ဆတ်သည့် အသုပ်များ။',
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
    },
    desc: {
      IT: 'Grandi classici e torte salate della tradizione italiana: Cotoletta alla Milanese con patate, Cotechino artigianale con purè e autentica Torta Pasqualina ligure.',
      EN: 'Italian culinary classics & savory pies made fresh: Crispy Milanese Cutlet with fries, Artisanal Cotechino with mashed potatoes, and Ligurian Torta Pasqualina.',
      TH: 'เมนูคลาสสิกและพายอบสไตล์อิตาเลียน: มิลานีสคัตเล็ตหมูทอดกรอบ ไส้กรอกโคเตคิโนโบราณพร้อมมันบด และพายตอร์ตา ปาสควาลินา',
      DE: 'Italienische Klassiker & herzhafte Torten: Knuspriges Mailänder Schnitzel, traditioneller Cotechino mit Kartoffelpüree und ligurische Torta Pasqualina.',
      MM: 'လတ်လတ်ဆတ်ဆတ် ချက်ပြုတ်ထားသော အီတလီ ရိုးရာ ဂန္တဝင် အစားအစာများနှင့် အရသာရှိ ပီဇာမုန့်များ။',
    }
  }
];

const SALAD_SUBFILTER_LABELS = {
  IT: { all: 'Tutti i Piatti', salads: 'Insalate Italiane', mains: 'Secondi Piatti' },
  EN: { all: 'All Dishes', salads: 'Italian Salads', mains: 'Main Courses' },
  TH: { all: 'ทุกจาน', salads: 'สลัดอิตาเลียน', mains: 'จานหลัก' },
  DE: { all: 'Alle Gerichte', salads: 'Italienische Salate', mains: 'Hauptgerichte' },
  MM: { all: 'ဟင်းလျာအားလုံး', salads: 'အီတလီဆလတ်များ', mains: 'အဓိကဟင်းလျာများ' },
};

const SANDWICH_SUBFILTER_LABELS = {
  IT: { all: 'Tutti i Piatti', focacce: 'Focacce', sandwiches: 'Pizza Sandwich' },
  EN: { all: 'All Dishes', focacce: 'Focaccia', sandwiches: 'Pizza Sandwich' },
  TH: { all: 'ทุกจาน', focacce: 'โฟกัชชา', sandwiches: 'พิซซ่าแซนด์วิช' },
  DE: { all: 'Alle Gerichte', focacce: 'Focacce', sandwiches: 'Pizza-Sandwich' },
  MM: { all: 'ဟင်းလျာအားလုံး', focacce: 'ဖိုကာချာများ', sandwiches: 'ပီဇာဆန်းဒဝစ်' },
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
    },
    desc: {
      IT: 'Focacce fragranti da impasto pizza all\'olio extravergine d\'oliva cotte al forno e farcite al momento con i migliori salumi italiani selezionati: Milanese, Finocchiona, Pancetta arrotolata, Porchetta, Prosciutto Cotto e Salame.',
      EN: 'Fragrant oven-baked pizza dough focaccias filled with premium Italian cold cuts: Milanese cutlet, Tuscan Finocchiona, Rolled Pancetta, Roasted Porchetta, Cooked Ham, and Salami.',
      TH: 'ฟอคคาเซียแป้งพิซซ่าอบสดใหม่สไตล์โฮมเมด สอดไส้โคลด์คัทอิตาเลียนพรีเมียม: มิลานีส, ฟินอคคิโอนา, ปานเชตตา, พอร์เคตตา, แฮมสุก และซาลามี',
      DE: 'Ofenfrische Pizza-Focaccia gefüllt mit feinsten italienischen Spezialitäten: Mailänder Schnitzel, Toskanische Finocchiona, gerollte Pancetta, Porchetta, Kochschinken und Salami.',
      MM: 'အီတလီ အသားလွှာ အကောင်းစားများနှင့် မီးဖိုဖုတ် ဖိုကာချာ မုန့်များ။',
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
    },
    desc: {
      IT: 'Gustosi panini racchiusi nel nostro impasto pizza dorato e croccante con formaggio filante, pomodoro fresco e salumi italiani selezionati.',
      EN: 'Flavorful sandwiches wrapped in our golden, crispy pizza crust with melted cheese, fresh tomatoes, and premium Italian cold cuts.',
      TH: 'แซนด์วิชแป้งพิซซ่ากรอบนอกนุ่มใน สอดไส้ชีสเยิ้มๆ มะเขือเทศสด และโคลด์คัทอิตาเลียนชั้นเลิศ',
      DE: 'Köstliche Sandwiches in knusprigem Pizzateig mit geschmolzenem Käse, frischen Tomaten und feinen italienischen Wurstwaren.',
      MM: 'ရွှေဝါရောင် ကြွပ်ကြွပ်ရွ ပီဇာမုန့်သား၊ အရည်ပျော်နေသော ချိစ်နှင့် အသားလွှာများ ပါဝင်သော ပီဇာဆန်းဒဝစ်။',
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
    }, 
    desc: {
      IT: 'Creazioni di mare e di terra della nostra cuoca: Spaghetti allo Scoglio, Polpa di Granchio, Penne al Salmone, Tagliatelle al Nero di Seppia e Ravioli artigianali ripieni.',
      EN: 'Seafood and artisan specialties: Seafood Spaghetti, Blue Crab Meat, Salmon Penne, Squid Ink Tagliatelle, and handmade stuffed Ravioli.',
      TH: 'พาสต้าซีฟู้ดสดใหม่ ปูม้า แซลมอน ตัลยาเตลเล่หมึกดำ และราวิโอลีโฮมเมดสอดไส้สูตรดั้งเดิม',
      DE: 'Meeresfrüchte- und Spezialitätenkreationen: Frutti di Mare Spaghetti, Krabbenfleisch, Lachs-Penne, Tintenfisch-Tagliatelle und hausgemachte gefüllte Ravioli.',
      MM: 'ပင်လယ်စာ စပါဂက်တီ၊ ဂဏန်းသား၊ ဆယ်လ်မွန်နှင့် လက်လုပ် ရာဗီအိုလီ အထူးဟင်းလျာများ။',
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
    }, 
    desc: {
      IT: 'Un classico italiano semplice e saporito preparato con aglio, olio extravergine d\'oliva e peperoncino, con un gusto intenso e aromatico che delizia ogni singolo morso.',
      EN: 'A simple and flavorful Italian classic made with garlic, olive oil, and chili, with an intense, aromatic taste that delights every single bite',
      TH: 'พาสต้าผัดกระเทียม น้ำมันมะกอก และพริกแห้ง รสชาติเข้มข้นจัดจ้านสไตล์อิตาเลียน',
      DE: 'Ein einfacher und geschmackvoller italienischer Klassiker aus Knoblauch, Olivenöl und Chili, mit einem intensiven, aromatischen Geschmack, der jeden Bissen begeistert.',
      MM: 'ကြက်သွန်ဖြူ၊ သံလွင်ဆီနှင့် ငရုတ်သီးတို့ဖြင့် မွှေးပျံ့စွာ ကြော်ထားသော ဂန္တဝင် အီတလီ ခေါက်ဆွဲ။',
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
    }, 
    desc: {
      IT: 'Salsa di pomodoro all\'italiana preparata con pomodori maturi, olio d\'oliva, aglio o cipolla, sale e basilico. È il cuore pulsante della cucina italiana.',
      EN: 'Italian tomato sauce made with ripe tomatoes, olive oil, garlic or onion, salt, and basil. It\'s the heart of Italian cuisine',
      TH: 'ซอสมะเขือเทศอิตาเลียนรสเข้มข้น เคี่ยวกับกระเทียม หอมใหญ่ และใบโหระพาอิตาเลียน',
      DE: 'Italienische Tomatensauce aus reifen Tomaten, Olivenöl, Knoblauch oder Zwiebeln, Salz und Basilikum. Sie ist das Herz der italienischen Küche.',
      MM: 'မှည့်ဝင်းသော ခရမ်းချဉ်သီး၊ သံလွင်ဆီနှင့် ပင်စိမ်းရွက်တို့ဖြင့် ချက်ထားသော ရိုးရာ အီတလီဆော့စ်။',
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
    }, 
    desc: {
      IT: 'Salsa fresca al basilico con anacardi, parmigiano, aglio e olio d\'oliva, con un sapore ricco e aromatico che evoca i profumi di Genova.',
      EN: 'Fresh basil sauce with cashews, parmesan cheese, garlic, and olive oil, with a rich, aromatic flavor that evokes the scent of Genoa',
      TH: 'ซอสใบโหระพาอิตาเลียนปั่นสดใหม่ ใส่เม็ดมะม่วงหิมพานต์ พาเมซานชีส กระเทียม และน้ำมันมะกอก',
      DE: 'Frische Basilikumsauce mit Cashewnüssen, Parmesankäse, Knoblauch und Olivenöl, mit einem reichen, aromatischen Geschmack, der an Genua erinnert.',
      MM: 'လတ်ဆတ်သော ပင်စိမ်းရွက်၊ သီဟိုဠ်စေ့၊ ပါမီဂျန်ချိစ်နှင့် သံလွင်ဆီတို့ဖြင့် ပြုလုပ်ထားသော မွှေးပျံ့သည့် ပက်စတိုဆော့စ်။',
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
    }, 
    desc: {
      IT: 'Salsa in stile romano con pomodoro, guanciale e pecorino, cotta lentamente per ottenere un sapore dolce e sapido bilanciato, un classico della tradizione italiana.',
      EN: 'Roman-style sauce with tomato, cured pork cheek, and pecorino, slowly cooked for a balanced sweet and savory flavor, a classic of Italian tradition',
      TH: 'ซอสมะเขือเทศเข้มข้นปรุงรสด้วยเบคอน หอมใหญ่ และใบโหระพา รสชาติกลมกล่อม',
      DE: 'Römische Sauce mit Tomaten, gereifter Schweinebacke und Pecorino, langsam gekocht für einen ausgewogenen süß-salzigen Geschmack, ein Klassiker der italienischen Tradition.',
      MM: 'ခရမ်းချဉ်သီး၊ ဝက်သားခြောက်နှင့် ချိစ်တို့ဖြင့် ဖြည်းညင်းစွာ ချက်ထားသော ရောမစတိုင် အရသာရှိ ဆော့စ်။',
    }, 
    pattern: 'Amatriciana' 
  },
  { 
    id: 'bolognese', 
    name: { 
      IT: 'Salsa Ragù Bolognese', 
      EN: 'Bolognese Ragù', 
      TH: 'ซอสเนื้อโบโลเนส', 
      DE: 'Bolognese-Ragù',
      MM: 'ဘိုလိုနိစ် အမဲသားဆော့စ်',
    }, 
    desc: {
      IT: 'Un ricco ragù cotto lentamente con carne macinata, pomodori, verdure e vino rosso. Un gusto pieno, avvolgente e irresistibile, simbolo della tradizione bolognese.',
      EN: 'A rich, slow-cooked sauce with minced meat, tomatoes, vegetables, and red wine. Full, enveloping, and irresistible flavor, a symbol of Bologna\'s tradition',
      TH: 'ซอสเนื้อสับเคี่ยวกับมะเขือเทศและเครื่องเทศอย่างช้าๆ รสชาติเข้มข้นสูตรดั้งเดิม',
      DE: 'Eine reichhaltige, langsam gekochte Sauce mit Hackfleisch, Tomaten, Gemüse und Rotwein. Voller, einhüllender und unwiderstehlicher Geschmack, ein Symbol der Tradition von Bologna.',
      MM: 'အမဲသားနုပ်နုပ်စင်း၊ ခရမ်းချဉ်သီးနှင့် အသီးအရွက်များဖြင့် အချိန်ယူချက်ထားသော ဘိုလိုနာ ရိုးရာ အသားဆော့စ်။',
    }, 
    pattern: 'Bolognese Ragu' 
  },
  { 
    id: 'carbonara', 
    name: { 
      IT: 'Carbonara', 
      EN: 'Carbonara', 
      TH: 'ซอสคาร์โบนาร่า', 
      DE: 'Carbonara',
      MM: 'ကာဘိုနာရာ ဆော့စ်',
    }, 
    desc: {
      IT: 'Uno dei piatti più amati d\'Italia, preparato con guanciale, uova fresche, pecorino romano e pepe nero. Cremoso e autentico, dal sapore ricco e tradizionale.',
      EN: 'One of Italy\'s most loved dishes, made with cured pork cheek, eggs, pecorino cheese, and black pepper. Creamy and authentic, with a rich, traditional flavor',
      TH: 'ซอสครีมคาร์โบนาร่าสูตรดั้งเดิม ใส่ไข่แดง พาเมซานชีส และเบคอนกรอบ',
      DE: 'Eines der beliebtesten Gerichte Italiens, zubereitet mit gereifter Schweinebacke, Eiern, Pecorino-Käse und schwarzem Pfeffer. Cremig und authentisch, mit einem reichen, traditionellen Geschmack.',
      MM: 'ကြက်ဥ၊ ပါမီဂျန်ချိစ်၊ ငရုတ်ကောင်းမည်းနှင့် ဘေကွန်တို့ဖြင့် ပြုလုပ်ထားသော အီတလီ၏ လူကြိုက်အများဆုံး ကာဘိုနာရာ။',
    }, 
    pattern: 'Carbonara' 
  },
  { 
    id: 'quattro-formaggi', 
    name: { 
      IT: 'Quattro Formaggi', 
      EN: 'Four Cheeses', 
      TH: 'ซอสโฟร์ชีส', 
      DE: 'Vier Käse',
      MM: 'ချိစ်လေးမျိုး ဆော့စ်',
    }, 
    desc: {
      IT: 'Una cremosa miscela di quattro formaggi italiani accuratamente selezionati, fusi perfettamente insieme per creare un sapore ricco, deciso e avvolgente ad ogni morso.',
      EN: 'A creamy blend of four carefully selected Italian cheeses, perfectly melted together to create a rich, bold, and indulgent flavor in every bite',
      TH: 'ซอสชีส 4 ชนิดเข้มข้นสไตล์อิตาเลียน ละมุนลิ้นด้วยชีสระดับพรีเมียม',
      DE: 'Eine cremige Mischung aus vier sorgfältig ausgewählten italienischen Käsesorten, die perfekt miteinander verschmelzen, um bei jedem Bissen einen reichen und kräftigen Geschmack zu kreieren.',
      MM: 'အီတလီ ချိစ် ၄ မျိုးကို ရောစပ် အရည်ဖျော်ထားသော ခရင်မ်ဆန်ဆန် ချိစ်ဆော့စ်။',
    }, 
    pattern: 'Four Cheeses' 
  },
  { 
    id: 'flower-power', 
    name: { 
      IT: 'Flower Power', 
      EN: 'Flower Power', 
      TH: 'พาสต้าฟลาวเวอร์เพาเวอร์', 
      DE: 'Flower Power',
      MM: 'Flower Power အထူးလက်ရာ',
    }, 
    desc: {
      IT: 'Salsa per pasta artigianale preparata in casa con gorgonzola, salsiccia italiana e carciofi. Cremosa, ricca e dal sapore unico, perfetta per gli amanti dei gusti decisi.',
      EN: 'House-made pasta sauce with gorgonzola, Italian sausage, and artichokes. Creamy, rich, and full of unique flavor, perfect for lovers of bold tastes',
      TH: 'พาสต้าสูตรพิเศษของร้าน ปรุงรสด้วยวัตถุดิบสดใหม่รสชาติกลมกล่อม',
      DE: 'Hausgemachte Nudelsauce mit Gorgonzola, italienischer Wurst und Artischocken. Cremig, reichhaltig und voller einzigartigem Geschmack, perfekt für Liebhaber kräftiger Aromen.',
      MM: 'ဂေါ်ဂွန်ဇိုလာချိစ်၊ အီတလီ ဝက်အူချောင်းနှင့် အာတီချုပ်တို့ဖြင့် စီမံထားသော ဆိုင်၏ ကိုယ်ပိုင် အထူးဆော့စ်။',
    }, 
    pattern: 'Flower Power' 
  },
  { 
    id: 'lasagne', 
    name: { 
      IT: 'Lasagne', 
      EN: 'Baked Lasagna', 
      TH: 'ลาซานญ่า', 
      DE: 'Lasagne',
      MM: 'လာဆန်းညာ',
    }, 
    desc: {
      IT: 'Le lasagne fatte in casa sono un classico della cucina italiana, preparate con besciamella, ragù e parmigiano. Si prega di ordinare con un giorno di anticipo (minimo due porzioni) o chiedere allo staff. Tempo di cottura circa 30 minuti.',
      EN: 'Homemade Lasagne Are A Classic Of Italian Cuisine, Made With Béchamel, Sauces, And Parmesan. Pre-Order One Day In Advance, Minimum Two Portions, Or Ask The Staff. Cooking Time About 30 Minutes.',
      TH: 'ลาซานญ่าอบร้อนๆ สลับชั้นด้วยพาสต้า ซอสเนื้อรสเข้มข้น และชีสเยิ้มๆ',
      DE: 'Hausgemachte Lasagne ist ein Klassiker der italienischen Küche, zubereitet mit Béchamelsauce, Fleischsauce und Parmesan. Bitte einen Tag im Voraus bestellen (mindestens zwei Portionen) oder das Personal fragen. Garzeit ca. 30 Minuten.',
      MM: 'အသားဆော့စ်၊ ခရင်မ်နှင့် ပါမီဂျန်ချိစ်တို့ အထပ်ထပ်စီပြီး ဖုတ်ထားသော အိမ်လုပ် အီတလီ လာဆန်းညာ။',
    }, 
    pattern: 'Lasagne' 
  }
];

const PASTA_FILTER_LABELS = {
  IT: { all: 'Tutti i Primi' },
  EN: { all: 'All Pasta' },
  TH: { all: 'พาสต้าทั้งหมด' },
  DE: { all: 'Alle Nudelgerichte' },
  MM: { all: 'ခေါက်ဆွဲ အားလုံး' },
};

// ─── Wine Filtering Definitions & Subsections ──────────────────────────────

const WINE_FILTER_LABELS = {
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
  }
};

const WINE_TYPE_SECTIONS = [
  {
    id: 'red',
    name: { IT: 'Vini Rossi', EN: 'Red Wines', TH: 'ไวน์แดง', DE: 'Rotweine', MM: 'ဝိုင်နီ' },
    desc: {
      IT: 'Selezione di vini rossi strutturati, avvolgenti e armoniosi, ideali per accompagnare piatti saporiti, carni e formaggi.',
      EN: 'Curated selection of structured, full-bodied red wines, tailored for savory dishes, meats, and cheeses.',
      TH: 'คัดสรรไวน์แดงรสชาตินุ่มละมุนและเข้มข้น เหมาะสำหรับทานคู่กับอาหารจานหลักและเนื้อสัตว์',
      DE: 'Kuratierte Auswahl an strukturierten, vollmundigen Rotweinen, ideal zu herzhaften Gerichten, Fleisch und Käse.',
      MM: 'အသားဟင်းလျာများနှင့် တွဲဖက်ရန် အထူးသင့်လျော်သော အရသာပြည့်ဝ ဝိုင်နီများ။',
    },
    badge: { IT: 'Corposi & Strutturati', EN: 'Full-Bodied', TH: 'เข้มข้น', DE: 'Vollmundig', MM: 'အရသာပြည့်ဝ' },
    color: '#8b0000'
  },
  {
    id: 'white',
    name: { IT: 'Vini Bianchi', EN: 'White Wines', TH: 'ไวน์ขาว', DE: 'Weißweine', MM: 'ဝိုင်ဖြူ' },
    desc: {
      IT: 'Vini bianchi freschi, minerali ed eleganti, ideali per aperitivi, antipasti, primi piatti e pesce.',
      EN: 'Fresh, mineral, and fragrant white wines, crafted to pair with appetizers, pastas, and seafood dishes.',
      TH: 'ไวน์ขาวสดชื่น กลิ่นหอมผลไม้และดอกไม้ เหมาะสำหรับดื่มเรียกน้ำย่อยและอาหารทะเล',
      DE: 'Frische, mineralische und elegante Weißweine, ideal zu Vorspeisen, Pasta und Fischgerichten.',
      MM: 'ပင်လယ်စာနှင့် အဆာပြေစာများနှင့် တွဲဖက်ရန် လတ်ဆတ်မွှေးပျံ့သော ဝိုင်ဖြူများ။',
    },
    badge: { IT: 'Freschi & Minerali', EN: 'Crisp & Mineral', TH: 'สดชื่น', DE: 'Frisch & Mineralisch', MM: 'လတ်ဆတ်မွှေးပျံ့' },
    color: '#b45309'
  },
  {
    id: 'rose',
    name: { IT: 'Vini Rosati', EN: 'Rosé Wines', TH: 'ไวน์โรเซ่', DE: 'Roséweine', MM: 'ရိုဇေး ဝိုင်' },
    desc: {
      IT: 'Sfumature floreali e fruttate con un profilo fresco e versatile, perfetto per aperitivi e pietanze leggere.',
      EN: 'Delicate floral and fruity notes with a crisp, balanced profile, perfect for warm evenings and light dining.',
      TH: 'ไวน์โรเซ่สีสวย กลิ่นหอมสดชื่น ดื่มง่าย สดชื่นในทุกช่วงเวลา',
      DE: 'Florale und fruchtige Noten mit herrlicher Frische, ideal für warme Abende und leichte Küche.',
      MM: 'ပန်းရနံ့နှင့် သစ်သီးရနံ့ သင်းပျံ့သော လန်းဆန်းစေသည့် ရိုဇေးဝိုင်။',
    },
    badge: { IT: 'Floreali & Freschi', EN: 'Floral & Refreshing', TH: 'หอมละมุน', DE: 'Floral & Frisch', MM: 'ပန်းရနံ့သင်း' },
    color: '#db2777'
  },
  {
    id: 'sparkling',
    name: { IT: 'Spumanti', EN: 'Sparkling Wines', TH: 'สปาร์กลิงไวน์', DE: 'Schaumweine', MM: 'စပါကလင် ဝိုင်' },
    desc: {
      IT: 'Spumanti e prosecchi dal perlage fine e persistente, pensati per brindisi raffinati e momenti speciali.',
      EN: 'Sparkling wines and prosecco with fine, delicate perlage, crafted for celebrations and elegant toasts.',
      TH: 'สปาร์กลิงไวน์และโพรเซกโกชั้นเลิศ ฟองละเอียดนุ่มลิ้น เพื่อทุกช่วงเวลาพิเศษ',
      DE: 'Edle Schaumweine und Prosecco mit feiner Perlage für besondere Anlässe und stilvolle Momente.',
      MM: 'အထူးအခမ်းအနားများနှင့် အောင်ပွဲများအတွက် အကောင်းစား စပါကလင်နှင့် ပရိုဆက်ကို ဝိုင်များ။',
    },
    badge: { IT: 'Perlage & Prestigio', EN: 'Fine Perlage', TH: 'ฟองละเอียด', DE: 'Feine Perlage', MM: 'အထူးအမြှုပ်' },
    color: '#ca8a04'
  }
];

// ─── SVG Icons for pasta sauce submenu tabs ────────────────────────────────

// Chili pepper (single, elongated, pointed)
const PastaChiliIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* body */}
    <path d="M12 20 C9 20 7 17 7 13 C7 8 9.5 5 12 4 C14.5 5 17 8 17 13 C17 17 15 20 12 20 Z" />
    {/* stem */}
    <path d="M12 4 L12 2" />
    {/* stem curl */}
    <path d="M12 2 C13.5 0.5 16 1 15.5 3" />
    {/* highlight */}
    <path d="M10 9 C10 8 11 7 12 7" />
  </svg>
);

// Tomato: round body + 3-leaf star crown + stem
const PastaTomatoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="14" r="7" />
    <path d="M12 7 L12 4" />
    {/* 3-leaf star crown */}
    <path d="M12 7 C11 5 8 5 8 7" />
    <path d="M12 7 C13 5 16 5 16 7" />
    <path d="M12 5 C12 3 14.5 2.5 14.5 4.5" />
    {/* shine */}
    <path d="M8 12 A5 5 0 0 1 13 8" />
  </svg>
);

// Basil: simple wide oval leaf with single center vein
const PastaBasilLeafIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 21 C6 21 3 16 3 12 C3 7 7 3 12 3 C17 3 21 7 21 12 C21 16 18 21 12 21 Z" />
    <path d="M12 21 L12 5" />
    <path d="M12 17 C9 16 7 14 7 12" />
    <path d="M12 13 C15 12 17 10 17 8" />
  </svg>
);

// Bacon: 3 wavy strips (unchanged, it works)
const PastaBaconIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 8c3.5-2.5 5.5 2.5 9 0s5.5-2.5 9 0" />
    <path d="M3 13c3.5-2.5 5.5 2.5 9 0s5.5-2.5 9 0" />
    <path d="M3 18c3.5-2.5 5.5 2.5 9 0s5.5-2.5 9 0" />
  </svg>
);

// Steak/meat: rounded cut with bone end — like a T-bone sirloin
const PastaBeefIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* main steak body */}
    <path d="M4 8 C4 5 7 3 11 3 C16 3 20 5 20 9 C20 14 17 19 12 19 C7 19 4 14 4 10 Z" />
    {/* bone at bottom-left */}
    <circle cx="5" cy="18" r="2" />
    <circle cx="3" cy="20" r="1.5" />
    <line x1="5" y1="17" x2="4" y2="20" />
    {/* grain / marbling lines */}
    <path d="M9 8 C11 7 14 7 16 8" />
    <path d="M8 11 C10 10 15 10 17 11" />
    <path d="M9 14 C11 13 14 13 16 14" />
  </svg>
);

// Egg (unchanged, works fine)
const PastaEggIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2C7 2 4 7 4 12s3 10 8 10 8-5 8-10S17 2 12 2z" />
    <circle cx="12" cy="13.5" r="3" />
  </svg>
);

// Cheese wedge: clear triangle + filled bubble holes
const PastaCheeseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* wedge outer path */}
    <path d="M2 20 L12 4 L22 20 Z" />
    {/* rind / base line */}
    <line x1="2" y1="20" x2="22" y2="20" />
    {/* holes — filled so they read as bubbles */}
    <circle cx="9" cy="15" r="2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="14" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

// Artichoke: oval bud with horizontal arc-petal rows + small crown
const PastaArtichokeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* bud body */}
    <path d="M12 20 C7.5 20 5 16.5 5 12.5 C5 8 8 5 12 5 C16 5 19 8 19 12.5 C19 16.5 16.5 20 12 20 Z" />
    {/* petal scale arcs — 3 rows */}
    <path d="M8 9 C9.5 7.5 14.5 7.5 16 9" />
    <path d="M7 13 C9 11 15 11 17 13" />
    <path d="M8 17 C9.5 15.5 14.5 15.5 16 17" />
    {/* crown at top */}
    <path d="M10 5 C11 3 13 3 14 5" />
    {/* stem */}
    <line x1="12" y1="20" x2="12" y2="22" />
  </svg>
);

// Lasagne: 3 stacked rounded rectangles (unchanged, clear)
const PastaLasagneIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="5.5" width="20" height="3.5" rx="1.5" />
    <rect x="2" y="10.5" width="20" height="3.5" rx="1.5" />
    <rect x="2" y="15.5" width="20" height="3.5" rx="1.5" />
  </svg>
);

const SAUCE_ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  'aglio-olio':       PastaChiliIcon,
  'pomodoro':         PastaTomatoIcon,
  'pesto':            PastaBasilLeafIcon,
  'amatriciana':      PastaBaconIcon,
  'bolognese':        PastaBeefIcon,
  'carbonara':        PastaEggIcon,
  'quattro-formaggi': PastaCheeseIcon,
  'flower-power':     PastaArtichokeIcon,
  'lasagne':          PastaLasagneIcon,
};

const DROPDOWN_LABELS = {
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
};

interface DropdownOption {
  id: string;
  label: string;
  count?: number;
  flag?: string;
}

function CustomFilterDropdown({
  label,
  selectedId,
  options,
  onSelect,
  className = '',
}: {
  label?: string;
  selectedId: string;
  options: DropdownOption[];
  onSelect: (id: string) => void;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.id === selectedId) || options[0];

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${isOpen ? 'z-50' : 'z-20'} ${className}`} style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
      {label && (
        <label className="block text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1 px-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white border border-stone-300 hover:border-[#8B1E1E] rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer min-w-[230px] sm:min-w-[270px] text-xs font-bold uppercase tracking-wider text-stone-900 focus:outline-none select-none group"
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.flag && (
            <span className="w-5 h-3.5 rounded-[2px] overflow-hidden inline-flex items-center justify-center border border-stone-200 shrink-0">
              <img 
                src={`https://flagcdn.com/w40/${selectedOption.flag.toLowerCase() === '🇮🇹' ? 'it' : selectedOption.flag.toLowerCase() === '🇫🇷' ? 'fr' : selectedOption.flag.toLowerCase() === '🇦🇺' ? 'au' : selectedOption.flag.toLowerCase() === '🇨🇱' ? 'cl' : 'un'}.png`} 
                alt="" 
                className="w-full h-full object-cover" 
              />
            </span>
          )}
          <span className="truncate">{selectedOption?.label}</span>
          {selectedOption?.count !== undefined && (
            <span className="px-2 py-0.5 rounded-full bg-[#8B1E1E]/10 text-[#8B1E1E] text-[10px] font-extrabold ml-0.5">
              {selectedOption.count}
            </span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-stone-400 group-hover:text-[#8B1E1E] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#8B1E1E]' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-full min-w-[270px] max-h-80 overflow-y-auto bg-white border border-stone-200/90 rounded-2xl shadow-2xl z-[99999] p-1.5 animate-fadeIn">
          {options.map(option => {
            const isSelected = option.id === selectedId;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onSelect(option.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer mb-1 last:mb-0 text-left ${
                  isSelected
                    ? 'bg-[#8B1E1E] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-stone-950'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  {option.flag && (
                    <span className="w-5 h-3.5 rounded-[2px] overflow-hidden inline-flex items-center justify-center border border-stone-200 shrink-0">
                      <img 
                        src={`https://flagcdn.com/w40/${option.flag.toLowerCase() === '🇮🇹' ? 'it' : option.flag.toLowerCase() === '🇫🇷' ? 'fr' : option.flag.toLowerCase() === '🇦🇺' ? 'au' : option.flag.toLowerCase() === '🇨🇱' ? 'cl' : 'un'}.png`} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    </span>
                  )}
                  <span className="truncate">{option.label}</span>
                </span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {option.count !== undefined && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                    }`}>
                      {option.count}
                    </span>
                  )}
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DeliveryMenu() {
  const navigate = useNavigate();

  // Compliance Mode Check (Active on flowerpowerpizza.com or ?compliance=true / ?compliance=1)
  const isCompliance = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname.toLowerCase();
    if (host.includes('flowerpowerpizza.com')) return true;
    const params = new URLSearchParams(window.location.search);
    if (params.get('compliance') === 'true' || params.get('compliance') === '1') return true;
    if (localStorage.getItem('fp_compliance_mode') === 'true') return true;
    return false;
  }, []);

  // Filtered Categories (Hides beers and wines in compliance mode, keeping the 11 food/cafe/fruit/soft-drink categories)
  const availableCategories = useMemo(() => {
    if (isCompliance) {
      return menuData.filter((c) => c.id !== 'beers' && c.id !== 'beers-and-wines' && c.id !== 'wines');
    }
    return menuData;
  }, [isCompliance]);

  const [activeCategoryId, setActiveCategoryId] = useState(() => availableCategories[0]?.id || menuData[0].id);

  // Policy Modal state for compliance review & customer transparency
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState<PolicyTab>('delivery');
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

  // Ensure that every time the page loads or refreshes, it always starts on the first category (Traditional Italian Pizzas) and at the top of the page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if ('scrollRestoration' in window.history) {
          window.history.scrollRestoration = 'manual';
        }
      } catch {}
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }
    const firstCat = availableCategories[0]?.id || 'traditional-italian-pizza';
    setActiveCategoryId(firstCat);
    setSelectedPastaSauce('all');
    setSelectedSaladSubFilter('all');
    setSelectedSandwichSubFilter('all');
    setSelectedWineType('all');
    setSelectedWineCountry('all');
    setDietaryFilter('all');
  }, []);

  // Ensure activeCategoryId is valid when categories change
  useEffect(() => {
    if (!availableCategories.some((c) => c.id === activeCategoryId)) {
      setActiveCategoryId(availableCategories[0]?.id || 'traditional-italian-pizza');
    }
  }, [availableCategories, activeCategoryId]);

  const [showCheckout, setShowCheckout] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.has('omise_order_id') || params.has('charge_id');
    }
    return false;
  });
  const { getCount, getTotal, openCart } = useCartStore();
  const count = getCount();
  const total = getTotal();

  // Floating Cart Lateral Tab state (Compact by default, expands on desktop hover or mobile tap)
  const [isCartTabExpanded, setIsCartTabExpanded] = useState(false);
  const cartTabTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCartTabClick = (e: React.MouseEvent) => {
    // If on mobile / compact and not expanded yet -> 1st tap expands details
    if (!isCartTabExpanded) {
      e.stopPropagation();
      setIsCartTabExpanded(true);
      // Auto-collapse back to compact after 4s of inactivity
      if (cartTabTimerRef.current) clearTimeout(cartTabTimerRef.current);
      cartTabTimerRef.current = setTimeout(() => {
        setIsCartTabExpanded(false);
      }, 4000);
      return;
    }

    // 2nd tap when already expanded -> opens the cart drawer
    if (cartTabTimerRef.current) clearTimeout(cartTabTimerRef.current);
    setIsCartTabExpanded(false);
    openCart();
  };

  // Chiudi immediatamente la linguetta espansa se l'utente scorre la pagina o clicca altrove
  useEffect(() => {
    if (!isCartTabExpanded) return;

    const handleOutsideInteraction = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('#floating-edge-cart-btn')) return;
      setIsCartTabExpanded(false);
      if (cartTabTimerRef.current) clearTimeout(cartTabTimerRef.current);
    };

    const handleScroll = () => {
      setIsCartTabExpanded(false);
      if (cartTabTimerRef.current) clearTimeout(cartTabTimerRef.current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('pointerdown', handleOutsideInteraction);
    document.addEventListener('click', handleOutsideInteraction);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('pointerdown', handleOutsideInteraction);
      document.removeEventListener('click', handleOutsideInteraction);
    };
  }, [isCartTabExpanded]);

  const { language: lang, setLanguage: setLang } = useLanguageStore();
  const [isLangOpen, setIsLangOpen] = useState(false);

  // Auto-open checkout if returning from Omise 3D Secure
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('omise_order_id') || params.has('charge_id')) {
        setShowCheckout(true);
      }
    }
  }, []);

  // Caricamento in tempo reale della collezione vini dal Cloud Supabase
  const [cloudWines, setCloudWines] = useState<WineCardData[]>([]);
  useEffect(() => {
    fetchCloudWineCollection().then(w => {
      if (w && w.length > 0) {
        setCloudWines(w);
      }
    });
  }, []);

  // Orari di apertura dinamici sincronizzati dal Kitchen Monitor KDS & BroadcastChannel
  const serviceStatus = usePizzeriaStatus();

  // Prodotti non disponibili (Sold Out) sincronizzati da Supabase Cloud, BroadcastChannel e LocalStorage
  const [unavailableIds, setUnavailableIds] = useState<Set<string>>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('fp_pizza_availability_overrides') || '{}');
      const unavail = Object.entries(stored)
        .filter(([_, isAvail]) => isAvail === false)
        .map(([id]) => id);
      return new Set<string>(unavail);
    } catch {
      return new Set<string>();
    }
  });

  const priceOverrides: Record<string, number> = {};

  // Sub-filtering states
  const [selectedPastaSauce, setSelectedPastaSauce] = useState<string>('all');
  const [selectedSaladSubFilter, setSelectedSaladSubFilter] = useState<'all' | 'salads' | 'main-courses'>('all');
  const [selectedSandwichSubFilter, setSelectedSandwichSubFilter] = useState<'all' | 'focacce' | 'pizza-sandwiches'>('all');
  const [selectedWineType, setSelectedWineType] = useState<'all' | 'red' | 'white' | 'rose' | 'sparkling'>('all');
  const [selectedWineCountry, setSelectedWineCountry] = useState<string>('all');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veggie' | 'vegan'>('all');
  // First-order discount eligibility & official domain check
  const [isFirstOrderEligible, setIsFirstOrderEligible] = useState(true);
  const isOfficialDomain = typeof window !== 'undefined' && window.location.hostname.toLowerCase().includes('flowerpowerpizza.com');

  useEffect(() => {
    const deviceId = getOrCreateDeviceId();
    let savedPhone = '';
    try { savedPhone = localStorage.getItem('fp_pizza_customer_phone') || ''; } catch {}
    let savedEmail = '';
    try { savedEmail = localStorage.getItem('fp_pizza_customer_email') || ''; } catch {}

    checkFirstOrderEligibility({ phone: savedPhone, email: savedEmail, deviceId }).then(res => {
      setIsFirstOrderEligible(res.eligible);
    });
  }, []);

  // Sync daily specials and availability overrides from admin dashboard & Cloud
  const [dailySpecialsOverrides, setDailySpecialsOverrides] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('fp_pizza_daily_specials_overrides') || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncFromStorage = () => {
      try {
        const specialOverrides = JSON.parse(localStorage.getItem('fp_pizza_daily_specials_overrides') || '{}');
        setDailySpecialsOverrides(specialOverrides);
      } catch {}

      try {
        const availOverrides = JSON.parse(localStorage.getItem('fp_pizza_availability_overrides') || '{}');
        const unavail = Object.entries(availOverrides)
          .filter(([_, isAvail]) => isAvail === false)
          .map(([id]) => id);
        setUnavailableIds(new Set<string>(unavail));
      } catch {}
    };
    window.addEventListener('storage', syncFromStorage);

    let bc: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel('fp_pizza_menu_sync');
      bc.onmessage = (ev) => {
        if (ev.data?.type === 'DAILY_SPECIAL_TOGGLE' || ev.data?.type === 'AVAILABILITY_TOGGLE' || ev.data?.type === 'MENU_SYNC_UPDATE') {
          syncFromStorage();
        }
      };
    }

    // Carica immediatamente overrides ufficiali dal Cloud Supabase
    fetchCloudMenuOverrides().then((overrides) => {
      if (overrides) {
        if (overrides.dailySpecials) {
          setDailySpecialsOverrides(overrides.dailySpecials);
        }
        if (overrides.availability) {
          const unavail = Object.entries(overrides.availability)
            .filter(([_, isAvail]) => isAvail === false)
            .map(([id]) => id);
          setUnavailableIds(new Set<string>(unavail));
        }
      }
    });

    return () => {
      window.removeEventListener('storage', syncFromStorage);
      if (bc) bc.close();
    };
  }, []);

  // Table reservation initial notes & wine privilege state
  const [reservationInitialNotes, setReservationInitialNotes] = useState('');
  const [isWineReservation, setIsWineReservation] = useState(false);

  const handleBookWineTable = (wineItem?: MenuItem) => {
    if (wineItem) {
      const wineName = wineItem.name;
      const note = lang === 'TH'
        ? `ต้องการลิ้มลองไวน์: ${wineName} (รับส่วนลด 10% สำหรับไวน์ที่โต๊ะ)`
        : lang === 'IT'
        ? `Richiesta degustazione: ${wineName} (Sconto 10% Vini al Tavolo)`
        : lang === 'DE'
        ? `Weinverkostung gewünscht: ${wineName} (10% Weinkeller-Rabatt am Tisch)`
        : `Wine tasting requested: ${wineName} (10% Wine Cellar Discount at Table)`;
      setReservationInitialNotes(note);
    } else {
      const note = lang === 'TH'
        ? `สิทธิพิเศษส่วนลดไวน์ 10% (Wine Privilege)`
        : lang === 'IT'
        ? `Sconto 10% Carta Vini al Tavolo (Privilegio Cantina)`
        : lang === 'DE'
        ? `10% Weinkeller-Rabatt am Tisch`
        : `10% Wine Cellar Discount at Table`;
      setReservationInitialNotes(note);
    }
    setIsWineReservation(true);
    setIsReservationModalOpen(true);
  };

  const t = translations[lang];
  const activeCategory = availableCategories.find((c) => c.id === activeCategoryId) ?? availableCategories[0] ?? menuData[0];
  const activeCategoryName = categoryDetails[activeCategory.id]?.[lang]?.name || activeCategory.name;

  const isItalianWine = (item: any) => {
    if (item.flag === '🇮🇹') return true;
    const sub = String(item.categorySubtitle || '').toUpperCase();
    const title = String(item.title || item.name || '').toUpperCase();
    return sub.includes('ITALY') || sub.includes('ITALIA') || sub.includes('SICILY') || sub.includes('PUGLIA') || sub.includes('VENETO') || sub.includes('TUSCANY');
  };

  const sortItalianFirst = (items: MenuItem[]) => {
    return [...items].sort((a: any, b: any) => {
      const aIsIt = isItalianWine(a);
      const bIsIt = isItalianWine(b);
      if (aIsIt && !bIsIt) return -1;
      if (!aIsIt && bIsIt) return 1;
      return 0;
    });
  };

  const getDynamicWineItems = (): MenuItem[] => {
    try {
      const deletedRaw = localStorage.getItem('fp_deleted_wine_ids');
      const deletedSet = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);

      let rawWines: any[] = [];
      if (cloudWines && cloudWines.length > 0) {
        rawWines = cloudWines;
      } else {
        const saved = localStorage.getItem('fp_wine_collection');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const masterMap = new Map(INITIAL_WINE_COLLECTION.map(w => [w.id, w]));
              rawWines = parsed.map((w: any) => {
                if (!w.bottleImage || w.bottleImage.includes('01-italian-wines.webp')) {
                  const master = masterMap.get(w.id);
                  if (master && master.bottleImage && !master.bottleImage.includes('01-italian-wines.webp')) {
                    return { ...w, bottleImage: master.bottleImage };
                  }
                }
                return w;
              });
              const currentIds = new Set(rawWines.map((w: any) => w.id));
              INITIAL_WINE_COLLECTION.forEach((masterWine) => {
                if (!currentIds.has(masterWine.id) && !deletedSet.has(masterWine.id)) {
                  rawWines.push(masterWine);
                }
              });
            }
          } catch {
            rawWines = [];
          }
        }
      }
      
      if (rawWines.length === 0) {
        rawWines = INITIAL_WINE_COLLECTION;
      }

      return rawWines
        .filter((w: any) => w.isAvailable !== false && !unavailableIds.has(w.id) && !deletedSet.has(w.id))
        .map((w: any) => {
          const rawPrice = typeof w.price === 'string' ? parseFloat(w.price.replace(/[^0-9.]/g, '')) || 1190 : (w.price || 1190);
          const finalPrice = priceOverrides[w.id] !== undefined ? priceOverrides[w.id] : rawPrice;
          const titleForLang = (
            lang === 'IT' ? (w.titleIt || w.title) :
            lang === 'TH' ? (w.titleTh || w.title) :
            lang === 'DE' ? (w.titleDe || w.title) :
            (w.titleEn || w.title)
          ) || w.title || '';
          const subForLang = (
            lang === 'IT' ? (w.subtitleIt || w.categorySubtitle) :
            lang === 'TH' ? (w.subtitleTh || w.categorySubtitle) :
            lang === 'DE' ? (w.subtitleDe || w.categorySubtitle) :
            (w.subtitleEn || w.categorySubtitle)
          ) || w.categorySubtitle || '';
          const descForLang = (
            lang === 'IT' ? (w.descriptionIt || w.description) :
            lang === 'TH' ? (w.descriptionTh || w.description) :
            lang === 'DE' ? (w.descriptionDe || w.description) :
            (w.descriptionEn || w.description)
          ) || w.description || '';

          return {
            id: w.id,
            name: titleForLang,
            nameIt: w.titleIt || w.title,
            nameTh: w.titleTh || w.title,
            nameDe: w.titleDe || w.title,
            title: titleForLang,
            titleIt: w.titleIt || w.title,
            titleTh: w.titleTh || w.title,
            titleDe: w.titleDe || w.title,
            description: descForLang,
            descriptionIt: w.descriptionIt || w.description,
            descriptionTh: w.descriptionTh || w.description,
            descriptionDe: w.descriptionDe || w.description,
            description_it: w.descriptionIt || w.description,
            description_th: w.descriptionTh || w.description,
            description_de: w.descriptionDe || w.description,
            price: finalPrice,
            image: w.bottleImage,
            image_file: w.bottleImage,
            category: 'wines',
            categoryType: resolveWineCategoryType(w),
            categorySubtitle: subForLang,
            categorySubtitleIt: w.subtitleIt || w.categorySubtitle,
            categorySubtitleTh: w.subtitleTh || w.categorySubtitle,
            categorySubtitleDe: w.subtitleDe || w.categorySubtitle,
            flag: w.flag,
            alcohol: w.alcohol,
            bottleScale: w.bottleScale || 100,
            bottleScaleX: w.bottleScaleX || 100,
            bottleOffsetX: w.bottleOffsetX || 0,
            bottleOffsetY: w.bottleOffsetY || 0,
            isAvailable: true
          } as MenuItem;
        });
    } catch (e) {
      console.warn('Error reading dynamic wines in DeliveryMenu:', e);
      return [];
    }
  };

  const allDynamicWines = useMemo(() => {
    return getDynamicWineItems();
  }, [lang, activeCategoryId, unavailableIds, priceOverrides]);

  const availableWineCountries = useMemo(() => {
    const flags = new Set<string>();
    allDynamicWines.forEach((w: any) => {
      if (w.flag) flags.add(w.flag);
    });
    return WINE_COUNTRY_OPTIONS
      .filter(c => flags.has(c.flag) || flags.has(c.code))
      .sort((a, b) => getCountryRank(a.flag) - getCountryRank(b.flag));
  }, [allDynamicWines]);

  const filterWineItems = (type?: string) => {
    let list = allDynamicWines;
    if (type && type !== 'all') {
      list = list.filter((w: any) => resolveWineCategoryType(w) === type);
    }
    if (selectedWineCountry !== 'all') {
      list = list.filter((w: any) => {
        if (selectedWineCountry === '🇮🇹') return isItalianWine(w);
        return w.flag === selectedWineCountry;
      });
    }
    return sortWinesByCountryOrder(list);
  };

  const wineTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: filterWineItems('all').length,
      red: filterWineItems('red').length,
      white: filterWineItems('white').length,
      rose: filterWineItems('rose').length,
      sparkling: filterWineItems('sparkling').length,
    };
    return counts;
  }, [allDynamicWines, selectedWineCountry]);

  const groupedWineSections = useMemo(() => {
    return WINE_TYPE_SECTIONS.map(sec => {
      const items = filterWineItems(sec.id);
      return { ...sec, items };
    }).filter(group => group.items.length > 0);
  }, [allDynamicWines, selectedWineCountry, lang]);

  const currentWinesForSelectedType = useMemo(() => {
    return filterWineItems(selectedWineType);
  }, [allDynamicWines, selectedWineType, selectedWineCountry]);

  const filteredCategoryItems = useMemo(() => {
    if (activeCategoryId === 'wines') {
      return filterWineItems(selectedWineType);
    }
    const rawItems = activeCategory.items
      .filter((item: any) => !unavailableIds.has(item.id))
      .map((item: any) => priceOverrides[item.id] !== undefined ? { ...item, price: priceOverrides[item.id] } : item);

    if (dietaryFilter === 'all') {
      return rawItems;
    }
    if (dietaryFilter === 'veggie') {
      return rawItems.filter((item: any) => {
        const diet = getDietaryType(item, activeCategoryId);
        return diet === 'veggie' || diet === 'vegan';
      });
    }
    if (dietaryFilter === 'vegan') {
      return rawItems.filter((item: any) => {
        const diet = getDietaryType(item, activeCategoryId);
        return diet === 'vegan';
      });
    }
    return rawItems;
  }, [activeCategoryId, activeCategory, dietaryFilter, selectedWineType, selectedWineCountry, allDynamicWines]);

  const isSpecialPasta = (item: any) => {
    const id = item.id || '';
    return id === 'spaghetti-allo-scoglio' || 
           id === 'penne-al-salmone' || 
           id === 'ravioli-alla-crema-di-gamberi' || 
           id === 'ravioli-al-sugo-di-noci' || 
           id === 'tagliatelle-al-nero-di-seppia-e-calamari' || 
           id === 'spaghetti-alla-polpa-di-granchio' ||
           id.startsWith('special-');
  };

  const pastaSauceCounts = useMemo(() => {
    const counts: Record<string, number> = { all: filteredCategoryItems.length };
    PASTA_SAUCES.forEach(sauce => {
      const c = filteredCategoryItems.filter((item: any) => {
        const path = item.image_file || "";
        const name = item.id || "";
        if (sauce.id === 'special-pasta') {
          return isSpecialPasta(item);
        }
        if (isSpecialPasta(item)) return false;
        if (path.includes(sauce.pattern)) return true;
        if (sauce.id === 'lasagne' && name.includes('lasagna')) return true;
        return false;
      }).length;
      counts[sauce.id] = c;
    });
    return counts;
  }, [filteredCategoryItems]);

  const groupedPasta = activeCategoryId === 'pasta' ? PASTA_SAUCES.map(sauce => {
    const items = filteredCategoryItems.filter((item: any) => {
      const path = item.image_file || "";
      const name = item.id || "";
      if (sauce.id === 'special-pasta') {
        return isSpecialPasta(item);
      }
      if (isSpecialPasta(item)) return false;
      if (path.includes(sauce.pattern)) return true;
      if (sauce.id === 'lasagne' && name.includes('lasagna')) return true;
      return false;
    });
    return { ...sauce, items };
  }).filter(group => {
    if (selectedPastaSauce !== 'all' && group.id !== selectedPastaSauce) return false;
    return group.items.length > 0;
  }) : [];

  const groupedDailySpecials = activeCategoryId === 'daily-specials' ? DAILY_SPECIALS_SECTIONS.map(sec => {
    const items = filteredCategoryItems.filter((item: any) => {
      const id = item.id || '';
      if (dailySpecialsOverrides[id] === false) return false;
      if (sec.id === 'pasta') {
        return id === 'spaghetti-allo-scoglio' || 
               id === 'penne-al-salmone' || 
               id === 'ravioli-alla-crema-di-gamberi' || 
               id === 'ravioli-al-sugo-di-noci' || 
               id === 'tagliatelle-al-nero-di-seppia-e-calamari' || 
               id === 'spaghetti-alla-polpa-di-granchio';
      }
      if (sec.id === 'traditional-italian-pizza') {
        return id === 'pizza-con-polpa-di-granchio' || 
               id === 'pizza-rustica-con-salsiccia-e-stilacci' ||
               (id.startsWith('pizza-') && !id.includes('sandwich') && !id.includes('focaccia'));
      }
      if (sec.id === 'daily-specials') {
        return (id === 'cotoletta-alla-milanese-con-patatine-fritte' || 
                id === 'cotechino-artigianale-con-pure-di-patate' ||
                id === 'torta-pasqualina-agli-spinaci-e-uova' ||
                id.includes('cotoletta') ||
                id.includes('cotechino') ||
                id.includes('pasqualina')) && !id.startsWith('focaccia-') && !id.includes('sandwich');
      }
      if (sec.id === 'pizza-sandwich') {
        return id.startsWith('focaccia-') || id.includes('sandwich');
      }
      return false;
    });
    return { ...sec, items };
  }).filter(group => group.items.length > 0) : [];

  // Sub-counts for Italian Salads & Main Courses
  const saladSubCounts = useMemo(() => {
    if (activeCategoryId !== 'italian-salads') return { all: 0, salads: 0, mains: 0 };
    let salads = 0;
    let mains = 0;
    filteredCategoryItems.forEach((item: any) => {
      const id = item.id || '';
      const isMain = id.includes('milanese') || id.includes('cotechino') || id.includes('pasqualina') || id === 'cotoletta-alla-milanese-con-patatine-fritte' || id === 'cotechino-artigianale-con-pure-di-patate' || id === 'torta-pasqualina-agli-spinaci-e-uova';
      if (isMain) mains++;
      else salads++;
    });
    return { all: filteredCategoryItems.length, salads, mains };
  }, [activeCategoryId, filteredCategoryItems]);

  // Sub-counts for Focaccia & Pizza Sandwich
  const sandwichSubCounts = useMemo(() => {
    if (activeCategoryId !== 'pizza-sandwich') return { all: 0, focacce: 0, sandwiches: 0 };
    let focacce = 0;
    let sandwiches = 0;
    filteredCategoryItems.forEach((item: any) => {
      const id = item.id || '';
      if (id.startsWith('focaccia-') || (item.nameIt && item.nameIt.includes('FOCACCIA'))) {
        focacce++;
      } else {
        sandwiches++;
      }
    });
    return { all: filteredCategoryItems.length, focacce, sandwiches };
  }, [activeCategoryId, filteredCategoryItems]);

  const groupedSalads = activeCategoryId === 'italian-salads' ? ITALIAN_SALADS_SECTIONS.map(sec => {
    const items = filteredCategoryItems.filter((item: any) => {
      const id = item.id || '';
      const isMain = id.includes('milanese') || id.includes('cotechino') || id.includes('pasqualina') || id === 'cotoletta-alla-milanese-con-patatine-fritte' || id === 'cotechino-artigianale-con-pure-di-patate' || id === 'torta-pasqualina-agli-spinaci-e-uova';
      if (sec.id === 'main-courses') return isMain;
      if (sec.id === 'salads') return !isMain;
      return false;
    });
    return { ...sec, items };
  }).filter(group => {
    if (selectedSaladSubFilter !== 'all' && group.id !== selectedSaladSubFilter) return false;
    return group.items.length > 0;
  }) : [];

  const groupedSandwiches = activeCategoryId === 'pizza-sandwich' ? FOCACCIA_SANDWICH_SECTIONS.map(sec => {
    const items = filteredCategoryItems.filter((item: any) => {
      const id = item.id || '';
      if (sec.id === 'focacce') {
        return id.startsWith('focaccia-') || (item.nameIt && item.nameIt.includes('FOCACCIA'));
      }
      if (sec.id === 'pizza-sandwiches') {
        return id.startsWith('pizza-sandwich-') || (item.name && item.name.includes('PIZZA SANDWICH'));
      }
      return false;
    });
    return { ...sec, items };
  }).filter(group => {
    if (selectedSandwichSubFilter !== 'all' && group.id !== selectedSandwichSubFilter) return false;
    return group.items.length > 0;
  }) : [];

  return (
    <div className="min-h-screen bg-[#e7e5e4] pb-12 antialiased" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
      <div className="max-w-6xl mx-auto px-4 mt-24 md:mt-28">
        
        {/* Italian Chef Header Card */}
        <header className="relative text-stone-100 py-4 lg:py-8 px-4 md:px-8 rounded-2xl shadow-lg mb-6 z-30" style={{ backgroundColor: '#3b3530' }}>
          {/* Inner Background with rounded corners & clipping */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute inset-0 opacity-40">
              <PizzaSlideshow />
            </div>
            <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-[0.5px]" />
          </div>
          <div className="absolute inset-0 opacity-40 overflow-hidden pointer-events-none">
            <PizzaSlideshow />
          </div>
          <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-[0.5px]" />

          {/* MOBILE HERO BANNER (Prominent Large Logo, Brand Title, Tagline & Hours Info) */}
          <div className="block lg:hidden relative z-10 py-3 px-2.5 sm:px-4">
            {/* Top-Right Language Selector */}
            <div className="absolute top-2.5 right-2.5 z-20">
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1 bg-black/55 backdrop-blur-md px-2 py-1 rounded-xl border border-white/15 shadow-sm text-stone-200 hover:text-white transition-all cursor-pointer font-bold text-[10px] uppercase"
              >
                <Globe className="w-3 h-3" />
                <span>{lang}</span>
                <ChevronDown className="w-2.5 h-2.5 transition-transform duration-200" style={{ transform: isLangOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {isLangOpen && (
                <>
                  <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsLangOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-28 bg-[#3b3530]/95 backdrop-blur-md rounded-xl border border-white/10 shadow-lg z-50 overflow-hidden flex flex-col">
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => {
                          setLang(l);
                          setIsLangOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-[10px] font-bold transition-all hover:bg-white/10 cursor-pointer flex items-center justify-between ${
                          lang === l ? "text-[#fca5a5] bg-white/5" : "text-stone-300"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span>{LANGUAGE_METAS[l]?.flag}</span>
                          <span>{l}</span>
                        </span>
                        {lang === l && <span className="text-[10px]">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Main Content: Large Logo on the Left + Brand Details on the Right */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 pr-14">
              {/* Brand Logo (Larger & Close to the edge) */}
              <img
                src="/Flower_Power_Pizza_-_HotSpring.png"
                alt="Flower Power Pizza Logo"
                width={88}
                height={88}
                className="h-20 sm:h-24 w-auto drop-shadow-lg flex-shrink-0 object-contain -ml-1 sm:ml-0"
              />

              {/* Brand Info, Tagline & Hours */}
              <div className="min-w-0 space-y-0.5 sm:space-y-1">
                <h1 className="text-lg sm:text-2xl font-sans font-black tracking-tight text-white leading-tight">
                  FLOWER POWER <br className="sm:hidden" />
                  <span className="font-light italic text-[#f87171]">Pizza</span>
                </h1>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[#fca5a5] font-bold tracking-widest text-[9px] sm:text-[10px] uppercase">
                    RANONG • THAILANDIA
                  </span>
                </div>

                <p className="text-stone-200 font-semibold text-[9.5px] sm:text-xs leading-tight">
                  {t.tagline2}
                </p>

                {/* Hours & Service Status */}
                <div className="flex items-center gap-1.5 pt-0.5 flex-wrap text-[8.5px] sm:text-[9.5px]">
                  <span className="inline-flex items-center gap-1 font-bold text-amber-200 bg-black/50 border border-amber-400/30 px-1.5 py-0.5 rounded-md shadow-xs">
                    <Clock className="w-2.5 h-2.5 text-amber-300 shrink-0" />
                    <span>
                      {serviceStatus.openingHours?.openTime && serviceStatus.openingHours?.closeTime
                        ? `${serviceStatus.openingHours.openTime} – ${serviceStatus.openingHours.closeTime}`
                        : t.info2}
                    </span>
                  </span>
                  <span className="text-stone-300 font-medium">
                    {t.info1}
                  </span>
                  <span className="text-stone-400 hidden sm:inline">•</span>
                  <span className="text-stone-300 font-medium hidden sm:inline">
                    {t.info3}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DESKTOP SCENIC HERO (Large Logo & Tagline) */}
          <div className="hidden lg:block relative z-10 my-auto py-2">
            {/* Symmetrical Language Dropdown Selector (Desktop) */}
            <div className="absolute top-2 right-2 z-20">
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1 bg-black/45 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 shadow-sm text-stone-300 hover:text-white transition-all cursor-pointer font-bold text-[10px] uppercase"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{lang}</span>
                <ChevronDown className="w-3 h-3 transition-transform duration-200" style={{ transform: isLangOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {isLangOpen && (
                <>
                  <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsLangOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-28 bg-[#3b3530]/95 backdrop-blur-md rounded-xl border border-white/10 shadow-lg z-50 overflow-hidden flex flex-col">
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => {
                          setLang(l);
                          setIsLangOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-[10px] font-bold transition-all hover:bg-white/10 cursor-pointer flex items-center justify-between ${
                          lang === l ? "text-[#fca5a5] bg-white/5" : "text-stone-300"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span>{LANGUAGE_METAS[l]?.flag}</span>
                          <span>{l}</span>
                        </span>
                        {lang === l && <span className="text-[10px]">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-row items-center justify-between gap-8 min-h-[180px]">
              {/* Left Side: Logo & Brand Name */}
              <div className="flex flex-row items-center gap-6 text-left my-auto">
                <img
                  src="/Flower_Power_Pizza_-_HotSpring.png"
                  alt="Flower Power Pizza Logo"
                  width={200}
                  height={200}
                  className="h-40 w-auto drop-shadow-md mx-0 flex-shrink-0 object-contain my-auto"
                />
                <div className="flex flex-col justify-between items-start pl-4 my-auto space-y-2">
                  <h1 className="text-4xl lg:text-5xl font-sans font-black tracking-tight text-white leading-none text-left">
                    FLOWER POWER <br />
                    <span className="font-light italic text-[#f87171]">Pizza</span>
                  </h1>
                  <span className="text-[#fca5a5] font-bold tracking-widest text-xs uppercase text-left block pt-1">
                    RANONG, THAILANDIA
                  </span>
                </div>
              </div>

              {/* Right Side: Information Details */}
              <div className="flex flex-col justify-between items-end gap-2 text-right max-w-md my-auto space-y-1">
                <span className="text-xl lg:text-2xl font-extrabold text-stone-100 tracking-tight block uppercase">
                  {t.tagline1}
                </span>
                <span className="text-xs lg:text-sm font-bold text-[#fca5a5] tracking-widest block uppercase">
                  {t.tagline2}
                </span>
                <div className="flex flex-row flex-wrap justify-end gap-x-2 gap-y-0.5 text-xs font-light text-stone-200">
                  <span>{t.info1}</span>
                  <span className="text-stone-400">•</span>
                  <span className="font-semibold text-amber-200">
                    {serviceStatus.openingHours?.openTime && serviceStatus.openingHours?.closeTime
                      ? `${serviceStatus.openingHours.openTime} – ${serviceStatus.openingHours.closeTime}`
                      : t.info2}
                  </span>
                  <span className="text-stone-400">•</span>
                  <span>{t.info3}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Kitchen Service Status Banner (Paused / Closed Countdown in 4 Languages) */}
        <div className="max-w-6xl mx-auto mt-2 sm:mt-4 px-2">
          <ServiceStatusBanner lang={lang} />
        </div>

        {/* Dynamic Promotions & Table Booking Cards (3 Rich Vertical Cards Side-by-Side on Mobile / Expansive on Desktop) */}
        <div className={`grid gap-2 sm:gap-3.5 max-w-6xl mx-auto px-2 mb-4 sm:mb-6 mt-2 sm:mt-4 ${
          isFirstOrderEligible ? 'grid-cols-3 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-2'
        }`}>
          {/* Card 1 (🟢 VERDE): Prenota un Tavolo o Capanna */}
          <div 
            onClick={() => setIsReservationModalOpen(true)}
            className="p-2.5 sm:p-3.5 md:p-4.5 bg-gradient-to-br from-[#064e3b] via-[#053d2e] to-[#032b20] text-white rounded-2xl sm:rounded-3xl flex flex-col justify-between gap-1.5 sm:gap-2.5 shadow-md border border-emerald-600/50 hover:border-emerald-400 hover:shadow-emerald-950/40 hover:shadow-xl transition-all cursor-pointer group text-left min-h-[130px] sm:min-h-[148px]"
          >
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-emerald-800/90 border border-emerald-500/50 text-emerald-300 group-hover:scale-105 group-hover:bg-emerald-400 group-hover:text-stone-950 transition-all flex items-center justify-center shrink-0 rounded-xl shadow-xs">
                <UtensilsCrossed className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-colors" />
              </div>
              <h4 className="text-white font-black text-[9.5px] sm:text-xs md:text-sm leading-tight group-hover:text-emerald-300 transition-colors" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {lang === 'TH' ? 'จองโต๊ะ' :
                 lang === 'IT' ? 'Prenota Tavolo' :
                 lang === 'DE' ? 'Tisch Buchen' :
                 lang === 'MM' ? 'စားပွဲ ကြိုတင်ဘွတ်ကင်' :
                 'Book a Table'}
              </h4>
            </div>

            <div className="space-y-0.5">
              <p className="text-emerald-100/90 text-[8px] sm:text-[9.5px] md:text-xs leading-snug font-normal line-clamp-3">
                {lang === 'TH' ? 'โต๊ะในร่ม กลางแจ้ง หรือซุ้มไม้ไผ่ในสวน' :
                 lang === 'IT' ? "Tavoli al chiuso, all'aperto o in capanna" :
                 lang === 'DE' ? 'Innen-, Außenbereich oder Bambushütte' :
                 lang === 'MM' ? 'အတွင်းခန်း၊ အပြင်ဘက် သို့မဟုတ် သဘာဝ ဝါးတဲ' :
                 'Indoor, outdoor tables or bamboo garden hut'}
              </p>
            </div>

            <div className="pt-0.5">
              <span className="inline-flex items-center gap-1 text-[7.5px] sm:text-[9px] md:text-xs text-stone-950 font-black bg-emerald-400 group-hover:bg-emerald-300 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl shadow-xs transition-all">
                <span>{lang === 'TH' ? 'จองเลย' : lang === 'IT' ? 'Prenota' : lang === 'DE' ? 'Reservieren' : lang === 'MM' ? 'ယခု ဘွတ်ကင်လုပ်မည်' : 'Book Now'}</span>
                <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </span>
            </div>
          </div>

          {/* Card 2 (⚪ BIANCO & ORO): 10% Welcome Discount */}
          {isFirstOrderEligible && (
            <div className="p-2.5 sm:p-3.5 md:p-4.5 bg-gradient-to-br from-white via-amber-50/60 to-amber-100/40 text-stone-900 rounded-2xl sm:rounded-3xl flex flex-col justify-between gap-1.5 sm:gap-2.5 shadow-md border-2 border-amber-300/90 ring-1 ring-amber-400/30 hover:border-amber-400 hover:shadow-xl transition-all cursor-pointer group text-left min-h-[130px] sm:min-h-[148px]">
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-amber-400 text-stone-950 group-hover:scale-105 group-hover:bg-stone-950 group-hover:text-amber-300 transition-all flex items-center justify-center shrink-0 rounded-xl shadow-xs">
                  <Percent className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 stroke-[2.5] transition-colors" />
                </div>
                <h4 className="text-stone-950 font-black text-[9.5px] sm:text-xs md:text-sm leading-tight group-hover:text-amber-600 transition-colors" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {lang === 'TH' ? 'ลด 10%' :
                   lang === 'IT' ? '10% Sconto' :
                   lang === 'DE' ? '10% Rabatt' :
                   lang === 'MM' ? '၁၀% လျှော့စျေး' :
                   '10% OFF'}
                </h4>
              </div>

              <div className="space-y-0.5">
                <p className="text-stone-700 text-[8px] sm:text-[9.5px] md:text-xs leading-snug font-medium line-clamp-3">
                  {lang === 'TH' ? 'สั่งครั้งแรก? รับส่วนลดอัตโนมัติในตะกร้าทันที' :
                   lang === 'IT' ? 'Il tuo 1° ordine? Sconto applicato nel carrello!' :
                   lang === 'DE' ? '1. Bestellung? Rabatt direkt im Warenkorb!' :
                   lang === 'MM' ? 'ပထမဆုံး အော်ဒါလား? ခြင်းတောင်းထဲတွင် အလိုအလျောက် လျှော့ပေးပါသည်!' :
                   '1st order? Discount applied automatically in cart!'}
                </p>
              </div>

              <div className="pt-0.5">
                <span className="inline-flex items-center gap-1 text-[7.5px] sm:text-[9px] md:text-xs text-emerald-900 font-bold bg-emerald-100/95 border border-emerald-300/90 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl shadow-xs">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  <span>{lang === 'TH' ? 'ในตะกร้า' : lang === 'IT' ? 'Nel Carrello' : lang === 'DE' ? 'Im Warenkorb' : lang === 'MM' ? 'ခြင်းတောင်းထဲတွင်' : 'In Cart'}</span>
                </span>
              </div>
            </div>
          )}

          {/* Card 3 (🔴 ROSSO): Delivery Area & Free Delivery >300฿ + Takeaway */}
          <div 
            onClick={() => {
              const el = document.getElementById('menu-category-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-2.5 sm:p-3.5 md:p-4.5 bg-gradient-to-br from-[#8B1E1E] via-[#781818] to-[#5a1111] text-white rounded-2xl sm:rounded-3xl flex flex-col justify-between gap-1.5 sm:gap-2.5 shadow-md border border-red-700/60 hover:border-red-400 hover:shadow-red-950/40 hover:shadow-xl transition-all cursor-pointer group text-left min-h-[130px] sm:min-h-[148px]"
          >
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-white/15 border border-white/25 group-hover:scale-105 group-hover:bg-white group-hover:text-[#8B1E1E] transition-all flex items-center justify-center shrink-0 rounded-xl text-white shadow-xs">
                <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-colors" />
              </div>
              <h4 className="text-white font-black text-[9.5px] sm:text-xs md:text-sm leading-tight group-hover:text-red-200 transition-colors" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {lang === 'TH' ? <><span>เดลิเวอรี่ &amp;</span><br className="sm:hidden"/><span> รับที่ร้าน</span></> :
                 lang === 'IT' ? <><span>Delivery &amp;</span><br className="sm:hidden"/><span> Asporto</span></> :
                 lang === 'DE' ? <><span>Lieferung &amp;</span><br className="sm:hidden"/><span> Abholung</span></> :
                 lang === 'MM' ? <><span>ပို့ဆောင်မှု &amp;</span><br className="sm:hidden"/><span> ဆိုင်မှလာယူရန်</span></> :
                 <><span>Delivery &amp;</span><br className="sm:hidden"/><span> Takeaway</span></>}
              </h4>
            </div>

            <div className="space-y-0.5">
              <p className="text-red-100/90 text-[8px] sm:text-[9.5px] md:text-xs leading-snug font-normal line-clamp-3">
                {lang === 'TH' ? 'ส่งไว (>300฿ ฟรี) และรับเองที่ร้านฟรีเสมอ' :
                 lang === 'IT' ? 'A Ranong (>300฿ gratis), asporto sempre gratis!' :
                 lang === 'DE' ? 'In Ranong (>300฿ gratis), Abholung immer gratis!' :
                 lang === 'MM' ? 'ရနောင်းမြို့တွင်း (>300฿ အခမဲ့)၊ ဆိုင်မှလာယူပါက အမြဲအခမဲ့!' :
                 'Ranong (>300฿ free), takeaway always free!'}
              </p>
            </div>

            <div className="pt-0.5">
              <span className="inline-flex items-center gap-1 text-[7.5px] sm:text-[9px] md:text-xs text-white font-black bg-white/20 group-hover:bg-white group-hover:text-[#8B1E1E] border border-white/25 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl shadow-xs transition-all">
                <span>{lang === 'TH' ? 'ดูเมนู' : lang === 'IT' ? 'Al Menu' : lang === 'DE' ? 'Zur Karte' : lang === 'MM' ? 'မီနူးသို့' : 'To Menu'}</span>
                <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </span>
            </div>
          </div>
        </div>
        
        {/* Category Tabs directly on background */}
        <div id="menu-category-section" className="mb-2 sm:mb-4 scroll-mt-4">
          <CategoryTabs categories={availableCategories} activeId={activeCategoryId} onChange={setActiveCategoryId} lang={lang} />
        </div>

        {/* Section Title & Dietary Filter Bar */}
        <div className="mt-1.5 sm:mt-3 mb-3 sm:mb-4 px-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2">
            <div>
              <h2 className="font-sans text-xl md:text-2xl font-black tracking-tight text-stone-900" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
                {activeCategoryName}
              </h2>
              {categoryDetails[activeCategory.id]?.[lang]?.desc && (
                <p className="text-stone-500 text-xs mt-0.5 font-light italic">
                  {categoryDetails[activeCategory.id]?.[lang]?.desc || categoryDetails[activeCategory.id]?.["IT"]?.desc || ""}
                </p>
              )}
            </div>

            {/* Dietary Filter Segmented Bar (Tutti / Veggie / Vegan) */}
            {!['soft-drinks', 'beers', 'wines'].includes(activeCategoryId) && (
              <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
                <div className="inline-flex items-center p-1 bg-stone-200/90 backdrop-blur-md rounded-2xl border border-stone-300/80 shadow-inner gap-1">
                  {/* Option 1: ALL / TUTTI */}
                  <button
                    type="button"
                    onClick={() => setDietaryFilter('all')}
                    className={`px-3 py-1 sm:py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      dietaryFilter === 'all'
                        ? 'bg-stone-950 text-white shadow-md'
                        : 'text-stone-700 hover:text-stone-950 hover:bg-white/60'
                    }`}
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    <span>🍽️</span>
                    <span>
                      {lang === 'TH' ? 'ทั้งหมด' :
                       lang === 'IT' ? 'Tutti' :
                       lang === 'DE' ? 'Alle' :
                       lang === 'MM' ? 'အားလုံး' :
                       'All'}
                    </span>
                  </button>

                  {/* Option 2: VEGGIE (Vegetariano + Vegano) */}
                  <button
                    type="button"
                    onClick={() => setDietaryFilter('veggie')}
                    className={`px-3 py-1 sm:py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      dietaryFilter === 'veggie'
                        ? 'bg-amber-400 text-stone-950 shadow-md ring-1 ring-amber-500'
                        : 'text-stone-700 hover:text-amber-900 hover:bg-white/60'
                    }`}
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    <Wheat className={`w-3.5 h-3.5 ${dietaryFilter === 'veggie' ? 'text-stone-950 stroke-[2.5]' : 'text-amber-600'}`} />
                    <span>
                      {lang === 'TH' ? 'มังสวิรัติ' :
                       lang === 'IT' ? 'Veggie' :
                       lang === 'DE' ? 'Veggie' :
                       lang === 'MM' ? 'သတ်သတ်လွတ်' :
                       'Veggie'}
                    </span>
                  </button>

                  {/* Option 3: VEGAN (Solo 100% Vegano) */}
                  <button
                    type="button"
                    onClick={() => setDietaryFilter('vegan')}
                    className={`px-3 py-1 sm:py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      dietaryFilter === 'vegan'
                        ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400'
                        : 'text-stone-700 hover:text-emerald-900 hover:bg-white/60'
                    }`}
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    <Leaf className={`w-3.5 h-3.5 ${dietaryFilter === 'vegan' ? 'text-emerald-100 stroke-[2.5]' : 'text-emerald-600'}`} />
                    <span>
                      {lang === 'TH' ? 'วีแกน' :
                       lang === 'IT' ? 'Vegan' :
                       lang === 'DE' ? 'Vegan' :
                       lang === 'MM' ? 'ဗီဂျန်' :
                       'Vegan'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="w-8 h-0.5 bg-[#8B1E1E] mt-1 mb-2 sm:mb-3" />
        </div>

        {/* Submenu for Pasta (Stylish Dropdown Menu) */}
        {activeCategoryId === 'pasta' && (
          <div className="relative z-30 mb-6 px-1 flex items-end gap-3 flex-wrap animate-fadeIn">
            <CustomFilterDropdown
              label={DROPDOWN_LABELS[lang].pastaFilter}
              selectedId={selectedPastaSauce}
              options={[
                { id: 'all', label: PASTA_FILTER_LABELS[lang].all, count: pastaSauceCounts.all || 0 },
                ...PASTA_SAUCES.filter(s => (pastaSauceCounts[s.id] || 0) > 0).map(s => ({
                  id: s.id,
                  label: s.name[lang],
                  count: pastaSauceCounts[s.id] || 0
                }))
              ]}
              onSelect={setSelectedPastaSauce}
            />
            {selectedPastaSauce !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedPastaSauce('all')}
                className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                <span>Reset</span>
              </button>
            )}
          </div>
        )}

        {/* Submenu for Italian Salads & Main Courses (Quick Selection Bar) */}
        {activeCategoryId === 'italian-salads' && (
          <div className="relative z-30 mb-6 px-1 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar animate-fadeIn">
            {[
              { id: 'all', label: SALAD_SUBFILTER_LABELS[lang].all, icon: Sparkles, count: saladSubCounts.all },
              { id: 'salads', label: SALAD_SUBFILTER_LABELS[lang].salads, icon: Salad, count: saladSubCounts.salads },
              { id: 'main-courses', label: SALAD_SUBFILTER_LABELS[lang].mains, icon: UtensilsCrossed, count: saladSubCounts.mains },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = selectedSaladSubFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedSaladSubFilter(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm tracking-tight transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                    isActive
                      ? 'bg-[#3b3530] text-white shadow-md scale-[1.02] border border-amber-400/40'
                      : 'bg-stone-200/90 hover:bg-stone-300/80 text-stone-700 hover:text-stone-900 border border-stone-300/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-stone-500'}`} />
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-amber-400 text-stone-950' : 'bg-stone-300 text-stone-700'}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Submenu for Focaccia & Pizza Sandwich (Quick Selection Bar) */}
        {activeCategoryId === 'pizza-sandwich' && (
          <div className="relative z-30 mb-6 px-1 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar animate-fadeIn">
            {[
              { id: 'all', label: SANDWICH_SUBFILTER_LABELS[lang].all, icon: Sparkles, count: sandwichSubCounts.all },
              { id: 'focacce', label: SANDWICH_SUBFILTER_LABELS[lang].focacce, icon: Wheat, count: sandwichSubCounts.focacce },
              { id: 'pizza-sandwiches', label: SANDWICH_SUBFILTER_LABELS[lang].sandwiches, icon: Sandwich, count: sandwichSubCounts.sandwiches },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = selectedSandwichSubFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedSandwichSubFilter(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm tracking-tight transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                    isActive
                      ? 'bg-[#3b3530] text-white shadow-md scale-[1.02] border border-amber-400/40'
                      : 'bg-stone-200/90 hover:bg-stone-300/80 text-stone-700 hover:text-stone-900 border border-stone-300/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-stone-500'}`} />
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-amber-400 text-stone-950' : 'bg-stone-300 text-stone-700'}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Submenu / Compliance Banner for Beers */}
        {activeCategoryId === 'beers' && (
          <div className="mb-6 p-3.5 sm:p-4.5 bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white rounded-2xl sm:rounded-3xl border border-stone-700/80 shadow-xl relative overflow-hidden animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider shadow-xs">
                    <Beer className="w-3 h-3 text-amber-300" />
                    <span>
                      {lang === 'TH' ? '🍺 เบียร์สดชื่น • บริการเฉพาะที่ร้าน' :
                       lang === 'IT' ? '🍺 SERVIZIO ESCLUSIVO AL RISTORANTE' :
                       lang === 'DE' ? '🍺 AUSSCHANK NUR IM RESTAURANT' :
                       '🍺 SERVED EXCLUSIVELY AT RESTAURANT'}
                    </span>
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-stone-300/80 font-medium">
                    {lang === 'TH' ? '• กฎหมายแอลกอฮอล์แห่งประเทศไทย' :
                     lang === 'IT' ? '• Normativa Alcolici Thailandia' :
                     lang === 'DE' ? '• Alkoholgesetzgebung Thailand' :
                     '• Thai Alcohol Regulation'}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-black text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {lang === 'TH' ? 'เบียร์เย็นสดชื่น • พร้อมเสิร์ฟที่โต๊ะอาหารเท่านั้น' :
                   lang === 'IT' ? 'Birre Fresche in Bottiglia • Disponibili esclusivamente per consumo al tavolo' :
                   lang === 'DE' ? 'Kühle Flaschenbiere • Ausschank ausschließlich vor Ort am Tisch' :
                   'Chilled Bottled Beers • Available exclusively for dine-in table service'}
                </h3>

                <p className="text-stone-300 text-[11px] sm:text-xs leading-relaxed font-normal">
                  {lang === 'TH'
                    ? 'ตามกฎหมายแห่งราชอาณาจักรไทย การจำหน่ายและจัดส่งเครื่องดื่มแอลกอฮอล์ออนไลน์ไม่สามารถดำเนินการได้ ขอเชิญท่านมาดื่มด่ำความสดชื่นได้โดยตรงที่ร้านอาหารของเรา'
                    : lang === 'IT'
                    ? 'In conformità con le leggi del Regno di Thailandia, la vendita e la consegna a domicilio di bevande alcoliche online non è consentita. Le nostre birre possono essere ordinate e gustate esclusivamente direttamente al tavolo del ristorante.'
                    : lang === 'DE'
                    ? 'Gemäß den gesetzlichen Bestimmungen Thailands ist die Online-Lieferung von alkoholischen Getränken untersagt. Unsere Biere sind ausschließlich zum Verzehr vor Ort im Restaurant erhältlich.'
                    : 'In compliance with Thai law, online sale and delivery of alcoholic beverages is strictly prohibited. Our beers can be ordered and enjoyed exclusively at our restaurant.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submenu for Wines (Stylish Dual Dropdown Menu: Type & Origin) */}
        {activeCategoryId === 'wines' && (
          <div className="space-y-4 mb-6">
            {/* Thai Alcohol Compliance & 10% Table Discount Callout Banner */}
            <div className="p-3.5 sm:p-4.5 bg-gradient-to-br from-[#2a1717] via-[#1f1212] to-[#150a0a] text-white rounded-2xl sm:rounded-3xl border border-amber-500/40 shadow-xl relative overflow-hidden animate-fadeIn">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider shadow-xs">
                      <Wine className="w-3 h-3 text-amber-300" />
                      <span>
                        {lang === 'TH' ? '🍷 สิทธิพิเศษไวน์ • ลด 10% ที่โต๊ะอาหาร' :
                         lang === 'IT' ? '🍷 DEGUSTAZIONE IN LOCALE • SCONTO 10%' :
                         lang === 'DE' ? '🍷 WEINVERKOSTUNG VOR ORT • 10% RABATT' :
                         '🍷 DINE-IN WINE PRIVILEGE • 10% OFF'}
                      </span>
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-stone-300/80 font-medium">
                      {lang === 'TH' ? '• กฎหมายแอลกอฮอล์แห่งประเทศไทย' :
                       lang === 'IT' ? '• Normativa Alcolici Thailandia' :
                       lang === 'DE' ? '• Alkoholgesetzgebung Thailand' :
                       '• Thai Alcohol Regulation'}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base md:text-lg font-black text-white tracking-tight leading-snug" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {lang === 'TH' ? 'ไวน์นำเข้าชั้นเลิศ • จองโต๊ะล่วงหน้ารับส่วนลดพิเศษ 10%' :
                     lang === 'IT' ? 'Selezione Vini al Ristorante • Prenota dal sito e ricevi il 10% di sconto' :
                     lang === 'DE' ? 'Erlesene Weinkarte • Online reservieren und 10% Rabatt genießen' :
                     'Fine Wine Selection • Book online to receive an exclusive 10% table discount'}
                  </h3>

                  <p className="text-stone-300 text-[11px] sm:text-xs leading-relaxed font-normal">
                    {lang === 'TH'
                      ? 'ตามกฎหมายแห่งราชอาณาจักรไทย การสั่งซื้อเครื่องดื่มแอลกอฮอล์ออนไลน์เพื่อจัดส่งถึงบ้านไม่สามารถทำได้ ขอเชิญท่านมาลิ้มลองไวน์ชั้นเลิศในบรรยากาศสบายๆ ณ ร้านของเรา: จองโต๊ะผ่านเว็บไซต์ รับส่วนลด 10% สำหรับไวน์ทุกขวดที่โต๊ะอาหารทันที!'
                      : lang === 'IT'
                      ? 'In conformità con le leggi del Regno di Thailandia, la vendita e consegna a domicilio di alcolici online non è consentita. Ti invitiamo a degustare i nostri vini direttamente al ristorante: prenotando dal nostro sito web ricevi subito il 10% di sconto su tutte le bottiglie al tavolo!'
                      : lang === 'DE'
                      ? 'Gemäß den gesetzlichen Bestimmungen Thailands ist die Online-Lieferung von Alkohol untersagt. Genießen Sie unsere Weine vor Ort im Restaurant: Bei einer Tischreservierung über unsere Website erhalten Sie 10% Rabatt auf alle Weinflaschen am Tisch!'
                      : 'In compliance with Thai law, online delivery of alcohol is not permitted. We invite you to enjoy our cellar selection at our restaurant in Ranong: reserve a table from our website to get a 10% discount on all wine bottles at your table!'}
                  </p>
                </div>

                <div className="shrink-0 flex items-center">
                  <button
                    type="button"
                    onClick={() => handleBookWineTable()}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-amber-400/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <UtensilsCrossed className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>
                      {lang === 'TH' ? 'จองโต๊ะรับส่วนลด 10%' :
                       lang === 'IT' ? 'Prenota Tavolo (-10% Vini)' :
                       lang === 'DE' ? 'Tisch Reservieren (-10%)' :
                       'Book Table (-10% Wine)'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="relative z-30 px-1 flex items-end gap-3 flex-wrap animate-fadeIn">
              <CustomFilterDropdown
                label={DROPDOWN_LABELS[lang].wineTypeFilter}
                selectedId={selectedWineType}
                options={[
                  { id: 'all', label: WINE_FILTER_LABELS[lang].allTypes, count: wineTypeCounts.all },
                  ...WINE_TYPE_SECTIONS.map(s => ({
                    id: s.id,
                    label: s.name[lang],
                    count: wineTypeCounts[s.id] || 0
                  }))
                ]}
                onSelect={(id) => setSelectedWineType(id as any)}
              />

              <CustomFilterDropdown
                label={DROPDOWN_LABELS[lang].wineCountryFilter}
                selectedId={selectedWineCountry}
                options={[
                  { id: 'all', label: WINE_FILTER_LABELS[lang].allCountries },
                  ...availableWineCountries.map(c => ({
                    id: c.flag,
                    label: c.names?.[lang] || c.label,
                    flag: c.flag
                  }))
                ]}
                onSelect={setSelectedWineCountry}
              />

              {(selectedWineType !== 'all' || selectedWineCountry !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedWineType('all');
                    setSelectedWineCountry('all');
                  }}
                  className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0 shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="px-1 relative z-10">
          {activeCategoryId === 'daily-specials' ? (
            <div className="space-y-12">
              {groupedDailySpecials.map(group => (
                <div key={group.id} id={`specials-${group.id}`} className="scroll-mt-24">
                  <div className="px-2 mb-6">
                    <div className="flex items-center gap-3">
                      <h3 className="font-sans text-lg md:text-xl font-extrabold text-stone-800 tracking-tight" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
                        {group.name[lang]}
                      </h3>
                      <span className="text-xs text-stone-400 font-medium">
                        ({group.items.length})
                      </span>
                      <div className="flex-1 h-px bg-stone-300/60" />
                    </div>
                    {group.desc && (
                      <p className="text-stone-600 text-sm mt-1.5 font-light italic leading-relaxed max-w-2xl" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
                        {group.desc[lang]}
                      </p>
                    )}
                  </div>
                  <MenuGrid items={group.items} lang={lang} onBookTable={handleBookWineTable} />
                </div>
              ))}
            </div>
          ) : activeCategoryId === 'pasta' ? (
            <div className="space-y-12">
              {groupedPasta.map(group => (
                <div key={group.id} id={`sauce-${group.id}`} className="scroll-mt-24">
                  <div className="px-2 mb-6">
                    <div className="flex items-center gap-3">
                      <h3 className="font-sans text-lg font-extrabold text-stone-800 tracking-tight" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
                        {group.name[lang]}
                      </h3>
                      <div className="flex-1 h-px bg-stone-300/60" />
                    </div>
                    {group.desc && (
                      <p className="text-stone-600 text-sm mt-1.5 font-light italic leading-relaxed max-w-2xl" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
                        {group.desc[lang]}
                      </p>
                    )}
                  </div>
                  <MenuGrid items={group.items} lang={lang} onBookTable={handleBookWineTable} />
                </div>
              ))}
            </div>
          ) : activeCategoryId === 'italian-salads' ? (
            <div className="space-y-12">
              {groupedSalads.map(group => (
                <div key={group.id} id={`salad-${group.id}`} className="scroll-mt-24">
                  <div className="px-2 mb-6">
                    <div className="flex items-center gap-3">
                      <h3 className="font-sans text-lg md:text-xl font-extrabold text-stone-800 tracking-tight" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
                        {group.name[lang]}
                      </h3>
                      <span className="text-xs text-stone-400 font-medium">
                        ({group.items.length})
                      </span>
                      <div className="flex-1 h-px bg-stone-300/60" />
                    </div>
                    {group.desc && (
                      <p className="text-stone-600 text-sm mt-1.5 font-light italic leading-relaxed max-w-2xl" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
                        {group.desc[lang]}
                      </p>
                    )}
                  </div>
                  <MenuGrid items={group.items} lang={lang} onBookTable={handleBookWineTable} />
                </div>
              ))}
            </div>
          ) : activeCategoryId === 'pizza-sandwich' ? (
            <div className="space-y-12">
              {groupedSandwiches.map(group => (
                <div key={group.id} id={`sw-${group.id}`} className="scroll-mt-24">
                  <div className="px-2 mb-6">
                    <div className="flex items-center gap-3">
                      <h3 className="font-sans text-lg md:text-xl font-extrabold text-stone-800 tracking-tight" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
                        {group.name[lang]}
                      </h3>
                      <span className="text-xs text-stone-400 font-medium">
                        ({group.items.length})
                      </span>
                      <div className="flex-1 h-px bg-stone-300/60" />
                    </div>
                    {group.desc && (
                      <p className="text-stone-600 text-sm mt-1.5 font-light italic leading-relaxed max-w-2xl" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
                        {group.desc[lang]}
                      </p>
                    )}
                  </div>
                  <MenuGrid items={group.items} lang={lang} onBookTable={handleBookWineTable} />
                </div>
              ))}
            </div>
          ) : activeCategoryId === 'wines' ? (
            selectedWineType === 'all' ? (
              groupedWineSections.length > 0 ? (
                <div className="space-y-12">
                  {groupedWineSections.map(group => (
                    <div key={group.id} id={`wine-sec-${group.id}`} className="scroll-mt-24">
                      <div className="px-2 mb-6">
                        <div className="flex items-center gap-3">
                          <h3 
                            className="font-sans text-lg md:text-xl font-extrabold text-stone-800 tracking-tight"
                            style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                          >
                            {group.name[lang]}
                          </h3>
                          <span className="text-xs text-stone-400 font-medium">
                            ({group.items.length})
                          </span>
                          <div className="flex-1 h-px bg-stone-300/60" />
                        </div>
                      </div>
                      <MenuGrid items={group.items} lang={lang} onBookTable={handleBookWineTable} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-4 bg-white rounded-2xl border border-stone-200 my-6 shadow-sm">
                  <p className="text-stone-700 font-medium text-sm">{WINE_FILTER_LABELS[lang].noWinesFound}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWineType('all');
                      setSelectedWineCountry('all');
                    }}
                    className="mt-4 px-5 py-2 bg-[#8B1E1E] text-white rounded-xl text-xs font-semibold tracking-wider uppercase shadow-sm hover:bg-[#721818] transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{WINE_FILTER_LABELS[lang].resetFilters}</span>
                  </button>
                </div>
              )
            ) : (
              <div>
                {/* Single Wine Type Header */}
                {currentWinesForSelectedType.length > 0 ? (
                  <div>
                    {(() => {
                      const activeSection = WINE_TYPE_SECTIONS.find(s => s.id === selectedWineType);
                      if (!activeSection) return null;
                      return (
                        <div className="px-2 mb-6">
                          <div className="flex items-center gap-3">
                            <h3 
                              className="font-sans text-lg md:text-xl font-extrabold text-stone-800 tracking-tight"
                              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                            >
                              {activeSection.name[lang]}
                            </h3>
                            <span className="text-xs text-stone-400 font-medium">
                              ({currentWinesForSelectedType.length})
                            </span>
                            <div className="flex-1 h-px bg-stone-300/60" />
                          </div>
                        </div>
                      );
                    })()}
                    <MenuGrid items={currentWinesForSelectedType} lang={lang} onBookTable={handleBookWineTable} />
                  </div>
                ) : (
                  <div className="text-center py-16 px-4 bg-white rounded-2xl border border-stone-200 my-6 shadow-sm">
                    <p className="text-stone-700 font-medium text-sm">{WINE_FILTER_LABELS[lang].noWinesFound}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedWineType('all');
                        setSelectedWineCountry('all');
                      }}
                      className="mt-4 px-5 py-2 bg-[#8B1E1E] text-white rounded-xl text-xs font-semibold tracking-wider uppercase shadow-sm hover:bg-[#721818] transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{WINE_FILTER_LABELS[lang].resetFilters}</span>
                    </button>
                  </div>
                )}
              </div>
            )
          ) : (
            <MenuGrid items={filteredCategoryItems} lang={lang} onBookTable={handleBookWineTable} />
          )}
        </div>
      </div>

      {/* Compliance & Legal Footer (Mandatory for Payment Gateways & Consumer Transparency) */}
      <footer className="mt-16 pt-8 pb-12 border-t border-stone-300/80 max-w-6xl mx-auto px-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-semibold text-stone-600 mb-4">
          <button
            type="button"
            onClick={() => { setPolicyTab('delivery'); setIsPolicyModalOpen(true); }}
            className="hover:text-[#8B1E1E] transition-colors underline-offset-4 hover:underline cursor-pointer"
          >
            {lang === 'IT' ? 'Spedizioni & Consegna' : lang === 'TH' ? 'การจัดส่งสินค้า' : lang === 'DE' ? 'Lieferung & Versand' : 'Shipping & Delivery'}
          </button>
          <span className="text-stone-300">•</span>
          <button
            type="button"
            onClick={() => { setPolicyTab('refund'); setIsPolicyModalOpen(true); }}
            className="hover:text-[#8B1E1E] transition-colors underline-offset-4 hover:underline cursor-pointer"
          >
            {lang === 'IT' ? 'Cancellazioni & Rimborsi' : lang === 'TH' ? 'นโยบายการคืนเงิน' : lang === 'DE' ? 'Stornierung & Erstattung' : 'Cancellation & Refunds'}
          </button>
          <span className="text-stone-300">•</span>
          <button
            type="button"
            onClick={() => { setPolicyTab('privacy'); setIsPolicyModalOpen(true); }}
            className="hover:text-[#8B1E1E] transition-colors underline-offset-4 hover:underline cursor-pointer"
          >
            {lang === 'IT' ? 'Privacy & Pagamenti Sicuri' : lang === 'TH' ? 'ความเป็นส่วนตัวและความปลอดภัย' : lang === 'DE' ? 'Datenschutz & Security' : 'Privacy & Security'}
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs font-semibold text-stone-500 mb-4">
          <a
            href="/admin"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-red-700 transition-colors inline-flex items-center gap-1"
          >
            🔒 {lang === 'IT' ? 'Area Privata Staff' : lang === 'TH' ? 'พื้นที่เจ้าหน้าที่' : lang === 'DE' ? 'Mitarbeiterbereich' : 'Staff Portal'}
          </a>
          <span className="text-stone-300">•</span>
          <a
            href="/dining"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-800 hover:text-amber-700 font-bold transition-colors inline-flex items-center gap-1 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20"
          >
            📱 {lang === 'IT' ? 'Dining Tablet (-5%)' : lang === 'TH' ? 'แท็บเล็ตสั่งที่โต๊ะ (-5%)' : lang === 'DE' ? 'Dining Tablet (-5%)' : 'Dining Tablet (-5%)'}
          </a>
        </div>
        <p className="text-[11px] text-stone-500">
          © {new Date().getFullYear()} Flower Power Pizza Ranong. All Rights Reserved. Ranong Hot Springs, Bang Rin, Mueang Ranong, Thailand.
        </p>
      </footer>

      {/* Edge-Hugger Lateral Floating Cart Tab (Ultra-Compact micro-dock by default, expands on desktop hover or mobile tap) */}
      {count > 0 && (
        <aside
          aria-label={lang === 'TH' ? 'รถเข็นของคุณ' : lang === 'IT' ? 'Il tuo carrello' : 'Your cart'}
          className="fixed right-0 top-[58%] -translate-y-1/2 z-40"
          onMouseEnter={() => setIsCartTabExpanded(true)}
          onMouseLeave={() => setIsCartTabExpanded(false)}
        >
          <button
            type="button"
            onClick={handleCartTabClick}
            id="floating-edge-cart-btn"
            aria-label={`${count} items in cart, total ${total} Baht`}
            className={`group flex items-center bg-gradient-to-l from-[#721818] via-[#8B1E1E] to-[#9e2222] text-white shadow-2xl rounded-l-full border-l border-y border-amber-300/40 hover:border-amber-300 transition-all duration-300 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              isCartTabExpanded
                ? 'pl-3 pr-2.5 py-2 sm:py-2.5'
                : 'pl-2 pr-1 py-1.5 sm:py-2'
            }`}
            style={{
              boxShadow: '-3px 4px 16px rgba(139, 30, 30, 0.4), 0 2px 6px rgba(0, 0, 0, 0.2)',
              fontFamily: lang === 'TH' ? 'Prompt, Kanit, Outfit, system-ui, sans-serif' : 'Outfit, system-ui, sans-serif',
            }}
          >
            {/* Left expand arrow indicator (only visible when expanded) */}
            {isCartTabExpanded && (
              <ChevronLeft
                size={13}
                className="text-amber-300/90 shrink-0 mr-1 animate-pulse"
              />
            )}

            {/* Bag Icon with Counter Badge (Micro-footprint) */}
            <div className="relative flex items-center justify-center shrink-0">
              <div className="w-7 h-7 rounded-full bg-black/25 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform shadow-inner">
                <ShoppingCart size={14} />
              </div>
              <span className="absolute -top-1 -left-1 bg-amber-400 text-stone-950 font-black text-[9.5px] min-w-[16px] h-[16px] px-0.5 rounded-full flex items-center justify-center shadow-md border border-stone-900/20">
                {count}
              </span>
            </div>

            {/* Expandable Details: Price & Free Delivery Threshold (Smooth sliding reveal) */}
            <div
              className={`flex items-center transition-all duration-300 ease-out overflow-hidden ${
                isCartTabExpanded
                  ? 'max-w-[240px] opacity-100 ml-2 pl-2.5 border-l border-white/20'
                  : 'max-w-0 opacity-0 ml-0 pl-0 border-l-0 pointer-events-none'
              }`}
            >
              <div className="flex flex-col text-right leading-none whitespace-nowrap space-y-0.5">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-[9px] text-amber-200/90 uppercase tracking-widest font-black">
                    {lang === 'TH' ? 'ยอดรวม' : lang === 'IT' ? 'Totale' : lang === 'DE' ? 'Summe' : 'Total'}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-white inline-flex items-baseline gap-0.5">
                    <span>{total}</span>
                    <span
                      className="font-black text-[10px] text-amber-300 select-none"
                      style={{ fontFamily: 'Prompt, Kanit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                    >
                      ฿
                    </span>
                  </span>
                </div>

                {/* Free Delivery Threshold Status */}
                <div className="text-[9px] font-extrabold text-emerald-300 inline-flex items-center justify-end gap-1">
                  {total < 300 ? (
                    <span className="text-emerald-300/95 font-bold">
                      {lang === 'IT' ? `Mancano ${300 - total}฿ per consegna GRATIS` :
                       lang === 'TH' ? `อีก ${300 - total}฿ ส่งฟรี!` :
                       lang === 'DE' ? `Noch ${300 - total}฿ bis GRATIS-Lieferung` :
                       `Only ${300 - total}฿ to FREE delivery`}
                    </span>
                  ) : (
                    <span className="text-amber-200 font-black">
                      {lang === 'IT' ? '✓ Spedizione GRATIS!' :
                       lang === 'TH' ? '✓ ส่งฟรีแล้ว!' :
                       lang === 'DE' ? '✓ GRATIS-Versand!' :
                       '✓ FREE Delivery!'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        </aside>
      )}

      <CartDrawer
        onCheckout={() => setShowCheckout(true)}
        onSelectCategory={(catId) => {
          setActiveCategoryId(catId);
          window.scrollTo({ top: 380, behavior: 'smooth' });
        }}
        onContinueShopping={() => {
          // Reset to initial category (Pizze Classiche)
          const firstCatId = availableCategories[0]?.id || 'traditional-italian-pizza';
          setActiveCategoryId(firstCatId);
          // Scroll smoothly to the top of menu / dishes
          const anchor = document.getElementById('menu-category-section');
          if (anchor) {
            anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.scrollTo({ top: 320, behavior: 'smooth' });
          }
        }}
        lang={lang}
      />

      {showCheckout && (
        <CheckoutFlow onClose={() => setShowCheckout(false)} onSuccess={() => setShowCheckout(false)} lang={lang} />
      )}

      <PizzaPoliciesModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        initialTab={policyTab}
        lang={lang}
      />

      <TableReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => {
          setIsReservationModalOpen(false);
          setIsWineReservation(false);
          setReservationInitialNotes('');
        }}
        initialNotes={reservationInitialNotes}
        isWinePrivilege={isWineReservation}
        lang={lang}
      />

      {count > 0 && <div className="h-24" />}
    </div>
  );
}
