import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingCart, 
  Globe, 
  ChevronDown, 
  ChevronLeft, 
  Wine, 
  Sparkles, 
  Filter, 
  RotateCcw, 
  Check, 
  UtensilsCrossed, 
  Truck, 
  Percent, 
  ArrowRight, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  Leaf, 
  Wheat,
  Salad,
  Sandwich,
  Lock,
  LogOut,
  Gift,
  Plus,
  Minus,
  X,
  QrCode,
  Smartphone,
  Printer
} from 'lucide-react';
import { menuData, type MenuItem } from '../data/menuData';
import CategoryTabs from '../components/CategoryTabs';
import MenuGrid from '../components/MenuGrid';
import { useCartStore, calcItemTotal } from '../store/cartStore';
import { INITIAL_WINE_COLLECTION, WINE_COUNTRY_OPTIONS, resolveWineCategoryType, sortWinesByCountryOrder, getCountryRank, WineCardData } from '../data/wineData';
import { fetchCloudWineCollection } from '../data/wineCloudService';
import { fetchCloudMenuOverrides } from '../data/pizzaMenuCloudService';
import { useLanguageStore } from '../store/languageStore';
import { SUPPORTED_LANGUAGES, LANGUAGE_METAS, Language } from '../config/languages';
import { getDietaryType, type DietaryType } from '../utils/dietary';
import { DiningCheckoutModal } from '../components/DiningCheckoutModal';
import { TableSettlementModal } from '../components/TableSettlementModal';
import { DiningQrModal } from '../components/DiningQrModal';
import { DiningTableQrStudio } from '../../admin/pizza/components/DiningTableQrStudio';
import { LanguageDropdown } from '../components/LanguageDropdown';
import { I18N_DINING_QR } from '../data/diningQrI18n';
import { 
  generateDiningTableSession, 
  validateDiningTableSession, 
  revokeDiningTableSession 
} from '../services/diningSessionService';
import { connectDiningLiveCart, type DiningLiveCartController } from '../services/diningLiveCartService';
import { 
  subscribeToHallTablePresence, 
  reportTableGuestPresence, 
  type HallPresenceMap 
} from '../services/diningTablePresenceService';
import CartDrawer from '../components/CartDrawer';
import PizzaSlideshow from '../../components/PizzaSlideshow';
import { supabase } from '../../lib/supabase';
import { DiningAdminAuth } from '../components/DiningAdminAuth';
import { DINING_TABLES, formatTableStationName, getCanonicalTableKey, extractTableFromAddress } from '../utils/tableUtils';

const I18N_TABLE_PICKER: Record<Language, {
  title: string;
  subtitle: string;
  desc: string;
  tablesHeading: string;
  freeLabel: string;
  activeLabel: string;
  guestLabel: string;
  freeCard: string;
  activeCardPrefix: string;
  guestCardPrefix: string;
  customLabel: string;
  customPlaceholder: string;
  enterBtn: string;
  logoutBtn: string;
  qrStudioBtn: string;
}> = {
  IT: {
    title: 'Flower Power Pizza Dining',
    subtitle: 'Seleziona il tuo Tavolo o Cliente',
    desc: 'Tocca la tua postazione per accedere al menu completo con lo sconto del 5% al tavolo applicato a tutte le portate.',
    tablesHeading: 'Tavoli della Sala & Clienti',
    freeLabel: 'Libero',
    activeLabel: 'Comanda Cucina',
    guestLabel: 'Smartphone Live',
    freeCard: 'Nuovo Ordine',
    activeCardPrefix: 'Conto Aperto:',
    guestCardPrefix: 'In Ordinazione Live',
    customLabel: 'Oppure Inserimento Postazione Libera',
    customPlaceholder: 'es. Terrazza 3 / Giardino / Bancone',
    enterBtn: 'Entra nel Menu',
    logoutBtn: 'Logout',
    qrStudioBtn: 'QR Tavoli 1-16'
  },
  EN: {
    title: 'Flower Power Pizza Dining',
    subtitle: 'Select Table or Guest Station',
    desc: 'Touch your table or station to access the full menu with 5% table discount applied to all dishes.',
    tablesHeading: 'Dining Tables & Guest Stations',
    freeLabel: 'Available',
    activeLabel: 'Kitchen Order',
    guestLabel: 'Smartphone Live',
    freeCard: 'New Order',
    activeCardPrefix: 'Open Tab:',
    guestCardPrefix: 'Guest Ordering Live',
    customLabel: 'Or Enter Custom Table / Station',
    customPlaceholder: 'e.g. Terrace 3 / Garden / Counter',
    enterBtn: 'Access Menu',
    logoutBtn: 'Logout',
    qrStudioBtn: 'Table QRs 1-16'
  },
  TH: {
    title: 'Flower Power Pizza Dining',
    subtitle: 'เลือกโต๊ะอาหารหรือหมายเลขลูกค้าเพื่อเริ่มต้น',
    desc: 'แตะที่โต๊ะของคุณเพื่อเปิดดูเมนูอาหารพร้อมรับส่วนลด 5% ทุกรายการทันที',
    tablesHeading: 'โต๊ะอาหารและที่นั่งลูกค้า',
    freeLabel: 'ว่าง / เริ่มใหม่',
    activeLabel: 'มีออเดอร์ในครัว',
    guestLabel: 'ลูกค้ากำลังสั่งผ่านมือถือ',
    freeCard: 'ออเดอร์ใหม่',
    activeCardPrefix: 'ยอดค้างชำระ:',
    guestCardPrefix: 'กำลังสั่งอาหารไลฟ์',
    customLabel: 'หรือระบุชื่อโต๊ะ / ที่นั่งเอง',
    customPlaceholder: 'เช่น ริมระเบียง 3 / โซนสวน / เคาน์เตอร์',
    enterBtn: 'เข้าสู่เมนู',
    logoutBtn: 'ออกจากระบบ',
    qrStudioBtn: 'QR โต๊ะ 1-16'
  },
  DE: {
    title: 'Flower Power Pizza Dining',
    subtitle: 'Wählen Sie Ihren Tisch oder Kunden',
    desc: 'Tippen Sie auf Ihren Tisch, um das Menü mit 5% Tisch-Rabatt auf alle Gerichte zu öffnen.',
    tablesHeading: 'Tische & Gäste-Stationen',
    freeLabel: 'Frei',
    activeLabel: 'Küche aktiv',
    guestLabel: 'Smartphone Live',
    freeCard: 'Neue Bestellung',
    activeCardPrefix: 'Offener Tisch:',
    guestCardPrefix: 'Gast bestellt live',
    customLabel: 'Oder Freie Tischnummer Eingeben',
    customPlaceholder: 'z.B. Terrasse 3 / Garten / Bar',
    enterBtn: 'Speisekarte öffnen',
    logoutBtn: 'Abmelden',
    qrStudioBtn: 'Tisch-QRs 1-16'
  },
  MM: {
    title: 'Flower Power Pizza Dining',
    subtitle: 'သင့်စားပွဲ သို့မဟုတ် ဧည့်သည်နေရာကို ရွေးချယ်ပါ',
    desc: 'ဟင်းလျာအားလုံးအတွက် ၅% စားပွဲလျှော့စျေးဖြင့် မီနူးအပြည့်အစုံကို ကြည့်ရှုရန် သင့်နေရာကို နှိပ်ပါ။',
    tablesHeading: 'စားသောက်ခန်းမ စားပွဲများနှင့် ဧည့်သည်နေရာများ',
    freeLabel: 'အားလပ်သည်',
    activeLabel: 'မီးဖိုချောင်မှာယူမှု',
    guestLabel: 'စမတ်ဖုန်း အော်ဒါ',
    freeCard: 'အော်ဒါအသစ်',
    activeCardPrefix: 'ကျသင့်ငွေစာရင်း:',
    guestCardPrefix: 'ဧည့်သည် အော်ဒါမှာနေသည်',
    customLabel: 'သို့မဟုတ် အခြားစားပွဲ / နေရာအမည် ထည့်သွင်းပါ',
    customPlaceholder: 'ဥပမာ - လသာဆောင် ၃ / ပန်းခြံ / ကောင်တာ',
    enterBtn: 'မီနူးသို့ ဝင်မည်',
    logoutBtn: 'ထွက်မည်',
    qrStudioBtn: 'စားပွဲ QR ၁-၁၆'
  }
};

const I18N_RESET_CONFIRM: Record<Language, { prompt: string; short: string; full: string }> = {
  IT: { prompt: "Sei sicuro di voler annullare l'ordine?", short: "Confermi?", full: "Sicuro? Tocca per cancellare tutto" },
  EN: { prompt: "Are you sure you want to cancel the order?", short: "Confirm?", full: "Sure? Tap to cancel and reset" },
  TH: { prompt: "คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อ?", short: "ยืนยัน?", full: "แน่ใจไหม? แตะอีกครั้งเพื่อยกเลิก" },
  DE: { prompt: "Sind Sie sicher, dass Sie die Bestellung stornieren möchten?", short: "Bestätigen?", full: "Sicher? Tippen zum Abbrechen" },
  MM: { prompt: "သင်သည် အမှာစာကို ပယ်ဖျက်လိုသည်မှာ သေချာပါသလား။", short: "သေချာပြီလား?", full: "အတည်ပြုရန် ထပ်မံနှိပ်ပါ" }
};

const LOCATION_BY_LANG: Record<Language, string> = {
  IT: 'RANONG, THAILANDIA',
  EN: 'RANONG, THAILAND',
  TH: 'ระนอง, ประเทศไทย',
  DE: 'RANONG, THAILAND',
  MM: 'ရနောင်း၊ ထိုင်းနိုင်ငံ'
};

const categoryDetails: Record<string, Record<Language, { name: string; desc: string }>> = {
  'daily-specials': {
    IT: { name: 'Piatti del Giorno', desc: 'Creazioni esclusive e piatti speciali preparati dal nostro chef con ingredienti freschi' },
    EN: { name: 'Daily Specials', desc: 'Exclusive daily creations and seasonal specialties freshly prepared by our Italian chef' },
    TH: { name: 'จานพิเศษประจำวัน', desc: 'เมนูพิเศษประจำวันรังสรรค์โดยเชฟชาวอิตาเลียน ด้วยวัตถุดิบสดใหม่ตามฤดูกาล' },
    DE: { name: 'Tagesgerichte', desc: 'Täglich wechselnde Spezialitäten und saisonale Gerichte unseres Chefkochs' },
    MM: { name: 'နေ့စဉ် ဟင်းပွဲများ', desc: 'အီတလီစားဖိုမှူးမှ လတ်ဆတ်သော ရာသီပေါ် ကုန်ကြမ်းများဖြင့် နေ့စဉ် သီးသန့် ဖန်တီးထားသော အထူးဟင်းလျာများ' },
  },
  'traditional-italian-pizza': {
    IT: { name: 'Pizze Classiche', desc: 'Impasto a lenta lievitazione naturale 48h con farine 100% italiane' },
    EN: { name: 'Classic Pizzas', desc: '48h slow-fermented natural dough with 100% Italian flour' },
    TH: { name: 'พิซซ่าคลาสสิค', desc: 'แป้งหมักธรรมชาติสูตรดั้งเดิม 48 ชม. ด้วยแป้งนำเข้าจากอิตาลี 100%' },
    DE: { name: 'Klassische Pizzas', desc: '48 Std. natursauerteig-Pizzaboden mit 100% italienischem Mehl' },
    MM: { name: 'ရိုးရာ အီတလီ ပီဇာ', desc: '၁၀၀% အီတလီဂျုံမှုန့်ဖြင့် ၄၈ နာရီကြာ သဘာဝနည်းဖြင့် နှပ်ထားသော မုန့်သား' },
  },
  'pasta': {
    IT: { name: 'Primi Piatti & Pasta', desc: 'Pasta artigianale con ricette tradizionali e sughi freschi fatti in casa' },
    EN: { name: 'Pasta Dishes', desc: 'Handcrafted pasta with traditional Italian recipes and fresh homemade sauces' },
    TH: { name: 'พาสต้า & อาหารจานแรก', desc: 'พาสต้าสูตรต้นตำรับอิตาเลียนแท้ ปรุงสดใหม่พร้อมซอสโฮมเมดเข้มข้น' },
    DE: { name: 'Pasta & Nudelgerichte', desc: 'Handgemachte Pasta nach traditionellen italienischen Rezepten und hausgemachten Saucen' },
    MM: { name: 'ခေါက်ဆွဲ ဟင်းလျာများ', desc: 'အိမ်လုပ်ဆော့စ်နှင့် ရိုးရာနည်းဖြင့် ပြုလုပ်ထားသော လက်လုပ် အီတလီ ခေါက်ဆွဲ' },
  },
  'italian-salads': {
    IT: { name: 'Insalate & Secondi', desc: 'Insalate fresche con verdure croccanti, contorni sfiziosi e secondi piatti della tradizione' },
    EN: { name: 'Salads & Mains', desc: 'Fresh crisp salads with premium dressing and traditional Italian savory main courses' },
    TH: { name: 'สลัด & จานหลัก', desc: 'สลัดผักสดกรอบคลุกเคล้ากับน้ำสลัดเมดิเตอร์เรเนียน และอาหารจานหลักสไตล์อิตาเลียน' },
    DE: { name: 'Salate & Hauptgerichte', desc: 'Frische knackige Salate mit mediterranem Dressing und traditionelle Hauptgerichte' },
    MM: { name: 'ဆလတ် & အဓိကဟင်း', desc: 'လတ်ဆတ်သော ဟင်းသီးဟင်းရွက် စာလတ်များနှင့် ရိုးရာ အရသာရှိသော အဓိကဟင်းလျာများ' },
  },
  'pizza-sandwich': {
    IT: { name: 'Panuozzi & Pizza Sandwich', desc: 'Panuozzo napoletano cotto al forno a legna e farcito con salumi e mozzarella' },
    EN: { name: 'Panuozzo & Pizza Sandwiches', desc: 'Neapolitan style baked pizza dough sandwich filled with cold cuts and cheese' },
    TH: { name: 'ปานูออซโซ & แซนด์วิชพิซซ่า', desc: 'แซนด์วิชแป้งพิซซ่าสไตล์เนเปิลส์อบร้อนๆ สอดไส้ชีสและเนื้อสัตว์คุณภาพพรีเมียม' },
    DE: { name: 'Panuozzi & Pizza-Sandwiches', desc: 'Im Ofen gebackenes neapolitanisches Pizza-Sandwich, gefüllt mit feinstem Aufschnitt und Mozzarella' },
    MM: { name: 'ဖိုကာချာ ပီဇာ ဆန်းဒဝစ်', desc: 'မီးဖုတ် ပီဇာမုန့်သားဖြင့် အလယ်တွင် အသား၊ ချိစ်နှင့် ဟင်းသီးဟင်းရွက်များ ညှပ်ထားသော ဆန်းဒဝစ်' },
  },
  'pizza-burgers': {
    IT: { name: 'Pizza Burger & Fries', desc: 'Burger saporiti con pane pizza speciale, serviti con patatine fritte' },
    EN: { name: 'Pizza Burgers & Fries', desc: 'Savory homemade patties in fresh pizza bread, served with crispy fries' },
    TH: { name: 'พิซซ่าเบอร์เกอร์ & เฟรนช์ฟรายส์', desc: 'เบอร์เกอร์แป้งพิซซ่าโฮมเมดแสนอร่อย เสิร์ฟพร้อมเฟรนช์ฟรายส์กรอบ' },
    DE: { name: 'Pizza-Burger & Pommes', desc: 'Herzhafte hausgemachte Burger in frischem Pizzabrot, serviert mit knusprigen Pommes' },
    MM: { name: 'ပီဇာ ဘာဂါနှင့် အာလူးကြော်', desc: 'ပီဇာမုန့်သားဖြင့် ပြုလုပ်ထားသည့် အရသာရှိသော ဘာဂါနှင့် အာလူးကြော်' },
  },
  'french-fries': {
    IT: { name: 'Fritti & Sfizi', desc: 'Patatine fritte dorate, anelli di cipolla e crocchette calde' },
    EN: { name: 'French Fries & Appetizers', desc: 'Golden french fries, crispy onion rings and hot finger food appetizers' },
    TH: { name: 'เฟรนช์ฟรายส์ & ของทานเล่น', desc: 'เฟรนช์ฟรายส์สีทองกรอบ หอมทอด และของว่างทอดร้อนๆ แสนอร่อย' },
    DE: { name: 'Pommes & Fingerfood', desc: 'Goldgelbe Pommes frites, knusprige Zwiebelringe und heiße Appetithäppchen' },
    MM: { name: 'အာလူးကြော်နှင့် အမြည်းများ', desc: 'ရွှေဝါရောင် ကြွပ်ကြွပ်ရွ အာလူးကြော်နှင့် ကြက်သွန်ကွင်းကြော်များ' },
  },
  'desserts': {
    IT: { name: 'Dolci & Dessert', desc: 'Tiramisù della casa, torte del giorno, crepes e affogato al caffè' },
    EN: { name: 'Desserts & Sweets', desc: 'Homemade classic Italian tiramisù, fresh daily cakes and gelato affogato' },
    TH: { name: 'ของหวาน & เค้ก', desc: 'ทีรามิสุโฮมเมดสูตรคุณยาย เค้กประจำวัน เครป และไอศกรีมกาแฟอัฟโฟกาโต' },
    DE: { name: 'Desserts & Süßspeisen', desc: 'Hausgemachtes klassisches Tiramisù, frische Tageskuchen und Kaffee-Affogato' },
    MM: { name: 'အချိုပွဲနှင့် ဒက်ဆာ့တ်', desc: 'အိမ်လုပ် တီရာမီဆု၊ နေ့စဉ် ကိတ်များနှင့် ကော်ဖီ အက်ဖိုဂါတို' },
  },
  'breakfast-and-snacks': {
    IT: { name: 'Colazione & Toast', desc: 'Colazione italiana, toast caldi, uova e macedonia di frutta' },
    EN: { name: 'Breakfast & Toast', desc: 'Hearty Italian breakfast, warm toasts, eggs and fresh tropical fruit' },
    TH: { name: 'อาหารเช้า & โทสต์', desc: 'อาหารเช้าสไตล์อิตาเลียน โทสต์อบร้อน ไข่ดาว และผลไม้สดรวม' },
    DE: { name: 'Frühstück & Toast', desc: 'Italienisches Frühstück, warme Toasts, Eierspeisen und frischer Obstsalat' },
    MM: { name: 'နံနက်စာနှင့် သရေစာ', desc: 'နံနက်စာ၊ ပေါင်မုန့်မီးကင်၊ ကြက်ဥနှင့် လတ်ဆတ်သော သစ်သီးများ' },
  },
  'coffee-shop': {
    IT: { name: 'Caffetteria & Tè', desc: 'Vero espresso italiano, cappuccino cremoso e pregiati tè' },
    EN: { name: 'Coffee & Tea Bar', desc: 'Authentic Italian espresso, creamy cappuccino and premium selected teas' },
    TH: { name: 'กาแฟ & ชา', desc: 'เอสเพรสโซ่อิตาเลียนแท้ คาปูชิโน่ฟองนุ่มละมุน และชาชั้นดี' },
    DE: { name: 'Kaffee & Teebar', desc: 'Echter italienischer Espresso, cremiger Cappuccino und erlesene Teesorten' },
    MM: { name: 'ကော်ဖီဆိုင်', desc: 'စစ်မှန်သော အီတလီ အက်စ်ပရက်ဆို၊ ခရင်မ်ဆန်သော ကာပူချီနိုနှင့် လက်ဖက်ရည်' },
  },
  'fruit-drinks': {
    IT: { name: 'Frullati & Smoothie', desc: 'Frutta fresca tropicale frullata al momento, smoothie e frappè' },
    EN: { name: 'Fresh Smoothies & Shakes', desc: 'Fresh tropical fruits blended to order, energizing smoothies and shakes' },
    TH: { name: 'น้ำผลไม้ปั่น & สมูทตี้', desc: 'ผลไม้เมืองร้อนสดใหม่ปั่นแก้วต่อแก้ว สมูทตี้เพิ่มความสดชื่น' },
    DE: { name: 'Frische Smoothies & Shakes', desc: 'Frische tropische Früchte auf Bestellung gemixt, vitaminreiche Smoothies und Shakes' },
    MM: { name: 'သစ်သီးဖျော်ရည်များ', desc: 'လတ်ဆတ်သော သစ်သီးဖျော်ရည်များနှင့် စမုသီများ' },
  },
  'soft-drinks': {
    IT: { name: 'Bibite & Acqua', desc: 'Bibite rinfrescanti in lattina, acqua minerale naturale e soda servite fredde' },
    EN: { name: 'Soft Drinks & Chilled Water', desc: 'Canned soft drinks, natural mineral water and iced refreshments' },
    TH: { name: 'น้ำอัดลม & น้ำดื่มเย็น', desc: 'น้ำอัดลมกระป๋อง น้ำแร่ธรรมชาติ และเครื่องดื่มดับกระหายเสิร์ฟเย็น' },
    DE: { name: 'Softdrinks & Mineralwasser', desc: 'Erfrischungsgetränke in der Dose, natürliches Mineralwasser und gekühlte Getränke' },
    MM: { name: 'အအေးနှင့် သောက်ရေသန့်', desc: 'ဗူးသွပ်အအေးများ၊ သဘာဝတွင်းထွက်ရေနှင့် အေးမြလန်းဆန်းစေသော သောက်စရာများ' },
  },
  'beers': {
    IT: { name: 'Birre Fresche', desc: 'Le migliori marche di birra in bottiglia grande e piccola, servite ghiacciate' },
    EN: { name: 'Ice Cold Beers', desc: 'Premium Thai and international bottled beers served frosty cold' },
    TH: { name: 'เบียร์เย็นเจี๊ยบ', desc: 'เบียร์ไทยและต่างประเทศชั้นนำ เสิร์ฟเย็นฉ่ำทั้งขวดเล็กและขวดใหญ่' },
    DE: { name: 'Eiskalte Biere', desc: 'Ausgewählte thailändische und internationale Biere in großen und kleinen Flaschen' },
    MM: { name: 'ဘီယာများ', desc: 'အကောင်းဆုံး ထိုင်းနှင့် နိုင်ငံတကာ ဘီယာပုလင်း အေးအေးများ' },
  },
  'wines': {
    IT: { name: 'Carta dei Vini', desc: 'Selezione esclusiva di vini italiani e internazionali, perfetti per esaltare ogni piatto' },
    EN: { name: 'Wine List', desc: 'Curated selection of fine Italian and international wines to enhance your dining experience' },
    TH: { name: 'รายการไวน์', desc: 'คัดสรรไวน์อิตาเลียนและนานาชาติชั้นยอด เพื่อยกระดับมื้ออาหารสุดพิเศษของคุณ' },
    DE: { name: 'Weinkarte', desc: 'Kuratierte Auswahl an feinen italienischen und internationalen Weinen für ein perfektes Geschmackserlebnis' },
    MM: { name: 'ဝိုင်စာရင်း', desc: 'ကျွန်ုပ်တို့၏ ဟင်းလျာ အရသာတိုင်းကို ပိုမိုပြည့်စုံစေရန် ဂရုတစိုက် ရွေးချယ်ထားသော အီတလီနှင့် နိုင်ငံတကာ ဝိုင်ကောင်းများ' },
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
      MM: 'ပထမဟင်းလျာများ (ပတ်စ်တာ)'
    },
    desc: {
      IT: 'Spaghetti allo Scoglio, Polpa di Granchio, Penne al Salmone, Tagliatelle al Nero di Seppia e Ravioli artigianali con formati a scelta.',
      EN: 'Seafood Spaghetti, Fresh Crab Meat, Salmon Penne, Squid Ink Tagliatelle, and artisanal Ravioli with your choice of pasta format.',
      TH: 'สปาเก็ตตี้ซีฟู้ดสดใหม่ ปูม้า แซลมอน ตัลยาเตลเล่หมึกดำ และราวิโอลีโฮมเมด เลือกเส้นและรูปแบบได้ตามใจชอบ',
      DE: 'Meeresfrüchte-Spaghetti, Krabbenfleisch, Lachs-Penne, Tintenfisch-Tagliatelle und hausgemachte Ravioli mit wählbaren Formaten.',
      MM: 'ပင်လယ်စာ စပါဂက်တီ၊ ဂဏန်းသား၊ ဆယ်လ်မွန်ပဲန်နေး၊ ပြည်ကြီးငါးမင် တာလီယာတဲလ်နှင့် အစာသွပ် ရာဗီအိုလီ'
    }
  },
  {
    id: 'traditional-italian-pizza',
    name: {
      IT: 'Pizze Gourmet Speciali',
      EN: 'Gourmet Special Pizzas',
      TH: 'พิซซ่ากูร์เมต์สูตรพิเศษ',
      DE: 'Gourmet-Spezialpizzen',
      MM: 'အထူး ဂေါ်မေး ပီဇာများ'
    },
    desc: {
      IT: 'Pizze artigianali a lievitazione naturale con polpa di granchio fresca o salsiccia nostrana, spinaci e gorgonzola.',
      EN: 'Artisanal naturally leavened pizzas with fresh crab meat or local sausage, spinach, and gorgonzola.',
      TH: 'พิซซ่าแป้งหมักยีสต์ธรรมชาติ หน้าเนื้อปูม้าสด และไส้กรอกหมูอิตาเลียนกับผักสตีลัชชี',
      DE: 'Handwerkliche Pizzen mit natürlicher Hefe und frischem Krabbenfleisch oder einheimischer Wurst, Spinat und Gorgonzola.',
      MM: 'ဂဏန်းသား သို့မဟုတ် အီတလီဝက်အူချောင်းနှင့် ဟင်းသီးဟင်းရွက်များ တင်ထားသော အထူးပီဇာ'
    }
  },
  {
    id: 'daily-specials',
    name: {
      IT: 'Secondi Piatti Tradizionali',
      EN: 'Traditional Main Courses',
      TH: 'อาหารจานหลักแบบดั้งเดิม',
      DE: 'Traditionelle Hauptgerichte',
      MM: 'ရိုးရာ အဓိက ဟင်းလျာများ'
    },
    desc: {
      IT: 'Grandi classici e torte salate della tradizione italiana preparati al momento: Cotoletta alla Milanese, Cotechino artigianale con Purè e autentica Torta Pasqualina ligure.',
      EN: 'Italian culinary classics & savory pies made fresh: Crispy Milanese Cutlet with fries, Artisanal Cotechino with mashed potatoes, and Ligurian Torta Pasqualina.',
      TH: 'เมนูคลาสสิกและพายอบสไตล์อิตาเลียน: มิลานีสคัตเล็ตหมูทอดกรอบ ไส้กรอกโคเตคิโนโบราณพร้อมมันบด และพายตอร์ตา ปาสควาลินา',
      DE: 'Italienische Klassiker & herzhafte Torten: Knuspriges Mailänder Schnitzel, traditioneller Cotechino mit Kartoffelpüree und ligurische Torta Pasqualina.',
      MM: 'မီလန်စတိုင် အသားကပ်ကြော်၊ အာလူးထောင်းနှင့် ဝက်အူချောင်း၊ အီတလီ ရိုးရာ မုန့်ဖုတ်များ'
    }
  },
  {
    id: 'pizza-sandwich',
    name: {
      IT: 'Focacce Artigianali',
      EN: 'Artisanal Focaccias',
      TH: 'ฟอคคาเซียอบสดสไตล์อิตาเลียน',
      DE: 'Hausgemachte Focaccia',
      MM: 'လက်လုပ် ဖိုကာချာ မုန့်များ'
    },
    desc: {
      IT: 'Focacce fragranti da impasto pizza cotte al forno e farcite con i migliori salumi italiani selezionati: Finocchiona, Pancetta arrotolata, Porchetta, Prosciutto Cotto e Salame.',
      EN: 'Fragrant oven-baked pizza dough focaccias filled with premium Italian cold cuts: Finocchiona, Rolled Pancetta, Porchetta, Cooked Ham, and Salami.',
      TH: 'ฟอคคาเซียอบสดใหม่กรอบนอกนุ่มใน สอดไส้โคลด์คัทอิตาเลียนชั้นเลิศ: ฟินอคคิโอนา, ปานเชตตา, พอร์เคตตา, แฮมสุก และซาลามี',
      DE: 'Ofenfrische Focaccia gefüllt mit feinsten italienischen Wurstspezialitäten: Finocchiona, gerollte Pancetta, Porchetta, Kochschinken und Salami.',
      MM: 'အရည်အသွေးမြင့် အီတလီ အသားအပြားများ ညှပ်ထားသော မီးဖုတ် ဖိုကာချာ'
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
      MM: 'စားဖိုမှူး အထူးနှင့် အစာသွပ် ခေါက်ဆွဲ'
    }, 
    desc: {
      IT: 'Creazioni di mare e di terra della nostra cuoca: Spaghetti allo Scoglio, Polpa di Granchio, Penne al Salmone, Tagliatelle al Nero di Seppia e Ravioli artigianali ripieni.',
      EN: 'Seafood and artisan specialties: Seafood Spaghetti, Blue Crab Meat, Salmon Penne, Squid Ink Tagliatelle, and handmade stuffed Ravioli.',
      TH: 'พาสต้าซีฟู้ดสดใหม่ ปูม้า แซลมอน ตัลยาเตลเล่หมึกดำ และราวิโอลีโฮมเมดสอดไส้สูตรดั้งเดิม',
      DE: 'Meeresfrüchte- und Spezialitätenkreationen: Frutti di Mare Spaghetti, Krabbenfleisch, Lachs-Penne, Tintenfisch-Tagliatelle und hausgemachte gefüllte Ravioli.',
      MM: 'ပင်လယ်စာ စပါဂက်တီ၊ ဂဏန်းသား၊ ဆယ်လ်မွန်ပဲန်နေး၊ ပြည်ကြီးငါးမင် တာလီယာတဲလ်နှင့် အစာသွပ် ရာဗီအိုလီ'
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
      MM: 'ကြက်သွန်ဖြူ၊ သံလွင်ဆီနှင့် ငရုတ်သီး'
    }, 
    desc: {
      IT: 'Un classico italiano semplice e saporito preparato con aglio, olio extravergine d\'oliva e peperoncino, con un gusto intenso e aromatico che delizia ogni singolo morso.',
      EN: 'A simple and flavorful Italian classic made with garlic, olive oil, and chili, with an intense, aromatic taste that delights every single bite',
      TH: 'พาสต้าผัดกระเทียม น้ำมันมะกอก และพริกแห้ง รสชาติเข้มข้นจัดจ้านสไตล์อิตาเลียน',
      DE: 'Ein einfacher und geschmackvoller italienischer Klassiker aus Knoblauch, Olivenöl und Chili, mit einem intensiven, aromatischen Geschmack, der jeden Bissen begeistert.',
      MM: 'ကြက်သွန်ဖြူ၊ သံလွင်ဆီနှင့် ငရုတ်သီးတို့ဖြင့် ရိုးရှင်းပြီး မွှေးကြိုင် အရသာရှိသော အီတလီ ရိုးရာဆော့စ်'
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
      MM: 'ခရမ်းချဉ်သီးဆော့စ်'
    }, 
    desc: {
      IT: 'Salsa di pomodoro all\'italiana preparata con pomodori maturi, olio d\'oliva, aglio o cipolla, sale e basilico. È il cuore pulsante della cucina italiana.',
      EN: 'Italian tomato sauce made with ripe tomatoes, olive oil, garlic or onion, salt, and basil. It\'s the heart of Italian cuisine',
      TH: 'ซอสมะเขือเทศอิตาเลียนรสเข้มข้น เคี่ยวกับกระเทียม หอมใหญ่ และใบโหระพาอิตาเลียน',
      DE: 'Italienische Tomatensauce aus reifen Tomaten, Olivenöl, Knoblauch oder Zwiebeln, Salz und Basilikum. Sie ist das Herz der italienischen Küche.',
      MM: 'မှည့်ဝင်းသော ခရမ်းချဉ်သီး၊ သံလွင်ဆီ၊ ကြက်သွန်ဖြူနှင့် ပင်စိမ်းတို့ဖြင့် ပြုလုပ်ထားသော ရိုးရာ ခရမ်းချဉ်သီးဆော့စ်'
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
      MM: 'ပင်စိမ်း ပက်စတိုဆော့စ်'
    }, 
    desc: {
      IT: 'Salsa fresca al basilico con anacardi, parmigiano, aglio e olio d\'oliva, con un sapore ricco e aromatico che evoca i profumi di Genova.',
      EN: 'Fresh basil sauce with cashews, parmesan cheese, garlic, and olive oil, with a rich, aromatic flavor that evokes the scent of Genoa',
      TH: 'ซอสใบโหระพาอิตาเลียนปั่นสดใหม่ ใส่เม็ดมะม่วงหิมพานต์ พาเมซานชีส กระเทียม และน้ำมันมะกอก',
      DE: 'Frische Basilikumsauce mit Cashewnüssen, Parmesankäse, Knoblauch und Olivenöl, mit einem reichen, aromatischen Geschmack, der an Genua erinnert.',
      MM: 'လတ်ဆတ်သော ပင်စိမ်းရွက်၊ သီဟိုဠ်စေ့၊ ပါမီဂျန်ချိစ်၊ ကြက်သွန်ဖြူနှင့် သံလွင်ဆီတို့ဖြင့် မွှေးကြိုင်စွာ ပြုလုပ်ထားသော ပက်စတိုဆော့စ်'
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
      MM: 'အာမာထရီချာနာ ဆော့စ်'
    }, 
    desc: {
      IT: 'Salsa in stile romano con pomodoro, guanciale e pecorino, cotta lentamente per ottenere un sapore dolce e sapido bilanciato, un classico della tradizione italiana.',
      EN: 'Roman-style sauce with tomato, cured pork cheek, and pecorino, slowly cooked for a balanced sweet and savory flavor, a classic of Italian tradition',
      TH: 'ซอสมะเขือเทศเข้มข้นปรุงรสด้วยเบคอน หอมใหญ่ และใบโหระพา รสชาติกลมกล่อม',
      DE: 'Römische Sauce mit Tomaten, gereifter Schweinebacke und Pecorino, langsam gekocht für einen ausgewogenen süß-salzigen Geschmack, ein Klassiker der italienischen Tradition.',
      MM: 'ခရမ်းချဉ်သီး၊ ဝက်ပါးနီအသားခြောက်နှင့် ပီကိုရီနိုချိစ်တို့ဖြင့် ဖြည်းဖြည်းချင်း ချက်ပြုတ်ထားသော ရိုမန်စတိုင် ဆော့စ်'
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
      MM: 'ဘိုလိုနိစ် အသားဆော့စ်'
    }, 
    desc: {
      IT: 'Un ricco ragù cotto lentamente con carne macinata, pomodori, verdure e vino rosso. Un gusto pieno, avvolgente e irresistibile, simbolo della tradizione bolognese.',
      EN: 'A rich, slow-cooked sauce with minced meat, tomatoes, vegetables, and red wine. Full, enveloping, and irresistible flavor, a symbol of Bologna\'s tradition',
      TH: 'ซอสเนื้อสับเคี่ยวกับมะเขือเทศและเครื่องเทศอย่างช้าๆ รสชาติเข้มข้นสูตรดั้งเดิม',
      DE: 'Eine reichhaltige, langsam gekochte Sauce mit Hackfleisch, Tomaten, Gemüse und Rotwein. Voller, einhüllender und unwiderstehlicher Geschmack, ein Symbol der Tradition von Bologna.',
      MM: 'အမဲသားနုပ်နုပ်စင်း၊ ခရမ်းချဉ်သီး၊ အသီးအရွက်နှင့် ဝိုင်နီတို့ဖြင့် အချိန်ယူ ချက်ပြုတ်ထားသော ရိုးရာ အသားဆော့စ်'
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
      MM: 'ကာဘိုနာရာ ဆော့စ်'
    }, 
    desc: {
      IT: 'Uno dei piatti più amati d\'Italia, preparato con guanciale, uova fresche, pecorino romano e pepe nero. Cremoso e autentico, dal sapore ricco e tradizionale.',
      EN: 'One of Italy\'s most loved dishes, made with cured pork cheek, eggs, pecorino cheese, and black pepper. Creamy and authentic, with a rich, traditional flavor',
      TH: 'ซอสครีมคาร์โบนาร่าสูตรดั้งเดิม ใส่ไข่แดง พาเมซานชีส และเบคอนกรอบ',
      DE: 'Eines der beliebtesten Gerichte Italiens, zubereitet mit gereifter Schweinebacke, Eiern, Pecorino-Käse und schwarzem Pfeffer. Cremig und authentisch, mit einem reichen, traditionellen Geschmack.',
      MM: 'ဝက်ပါးနီအသားခြောက်၊ ကြက်ဥအနှစ်၊ ပီကိုရီနိုချိစ်နှင့် ငရုတ်ကောင်းနက်တို့ဖြင့် ပြုလုပ်ထားသော ခရင်မ်ဆန်ဆန် အီတလီ အရသာ'
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
      MM: 'ချိစ် ၄ မျိုး ဆော့စ်'
    }, 
    desc: {
      IT: 'Una cremosa miscela di quattro formaggi italiani accuratamente selezionati, fusi perfettamente insieme per creare un sapore ricco, deciso e avvolgente ad ogni morso.',
      EN: 'A creamy blend of four carefully selected Italian cheeses, melted together to create a rich, bold, and enveloping flavor with every bite',
      TH: 'ซอสโฟร์ชีสเข้มข้น ผสมผสานชีสอิตาเลียนพรีเมียม 4 ชนิด หอมมัน กลมกล่อมลงตัว',
      DE: 'Eine cremige Mischung aus vier sorgfältig ausgewählten italienischen Käsesorten, perfekt geschmolzen für einen reichen, kräftigen Geschmack.',
      MM: 'အီတလီ ချိစ် ၄ မျိုးကို ပေါင်းစပ် အရည်ဖျော်ထားသော ခရင်မ်ဆန်ပြီး စွဲမက်ဖွယ် ကောင်းသော ဆော့စ်'
    }, 
    pattern: 'Four Cheeses' 
  },
  { 
    id: 'flower-power', 
    name: { 
      IT: 'Flower Power (Panna e Funghi)', 
      EN: 'Flower Power (Cream & Mushrooms)', 
      TH: 'ฟลาวเวอร์พาวเวอร์ (ครีมและเห็ด)', 
      DE: 'Flower Power (Sahne & Pilze)',
      MM: 'ဖလားဝါး ပါဝါ (ခရင်မ်နှင့် မှို)'
    }, 
    desc: {
      IT: 'Una deliziosa salsa a base di panna fresca con succulenti funghi trifolati, dal sapore avvolgente e confortante per gli amanti della pasta cremosa.',
      EN: 'A delightful fresh cream sauce sautéed with juicy mushrooms, delivering a rich, comforting taste perfect for lovers of velvety pasta',
      TH: 'ซอสครีมเห็ดสูตรพิเศษของทางร้าน หอมครีมสดแท้และเห็ดผัด รสละมุนกลมกล่อม',
      DE: 'Eine köstliche frische Sahnesauce mit saftigen sautierten Pilzen, cremig und voll im Geschmack.',
      MM: 'လတ်ဆတ်သော ခရင်မ်နှင့် မှိုတို့ဖြင့် ချက်ထားသော နူးညံ့ချိုမြိန်သည့် အထူးဆော့စ်'
    }, 
    pattern: 'Flower Power' 
  },
  { 
    id: 'lasagne', 
    name: { 
      IT: 'Lasagne al Forno', 
      EN: 'Oven-Baked Lasagna', 
      TH: 'ลาซานญ่าอบเตาถ่าน', 
      DE: 'Überbackene Lasagne',
      MM: 'မီးဖုတ် လာဆန်းညား'
    }, 
    desc: {
      IT: 'Sfoglia di pasta all\'uovo stesa a mano, strati generosi di besciamella vellutata, saporito ragù o verdure fresche, gratinata con crosticina dorata e filante.',
      EN: 'Handcrafted fresh egg pasta sheets layered with velvety béchamel, savory ragù or fresh vegetables, baked to golden, bubbling perfection',
      TH: 'แผ่นแป้งลาซานญ่าทำสด เรียงชั้นด้วยซอสโบโลเนสเข้มข้น ซอสเบชาเมล และชีส อบจนหอมกรุ่น',
      DE: 'Handgemachte Eiernudelplatten geschichtet mit samtiger Béchamelsauce und herzhaftem Ragù, goldbraun und herrlich überbacken.',
      MM: 'လက်လုပ် ကြက်ဥခေါက်ဆွဲလွှာများကြားတွင် ဘီရှာမယ်ဆော့စ်၊ အသားဆော့စ် သို့မဟုတ် အသီးအရွက်တို့ဖြင့် အထပ်ထပ်စီပြီး ရွှေဝါရောင် ဖုတ်ထားသော လာဆန်းညား'
    }, 
    pattern: '03-Lasagne' 
  }
];

const WINE_FILTER_LABELS = {
  IT: {
    allTypes: 'Tutti i Vini',
    allCountries: 'Tutte le Origini',
    italianFirstBadge: 'Selezione Italiana in Evidenza',
    noWinesFound: 'Nessun vino trovato con i filtri selezionati.',
    resetFilters: 'Mostra tutti i vini',
    winesCount: 'etichette',
    wineCount: 'etichetta',
  },
  EN: {
    allTypes: 'All Wines',
    allCountries: 'All Origins',
    italianFirstBadge: 'Italian Selection Featured',
    noWinesFound: 'No wines found matching your selected filters.',
    resetFilters: 'Show all wines',
    winesCount: 'wines',
    wineCount: 'wine',
  },
  TH: {
    allTypes: 'ไวน์ทั้งหมด',
    allCountries: 'ทุกแหล่งกำเนิด',
    italianFirstBadge: 'คัดสรรพิเศษจากอิตาลี',
    noWinesFound: 'ไม่พบรายการไวน์ตามตัวกรองที่เลือก',
    resetFilters: 'แสดงไวน์ทั้งหมด',
    winesCount: 'รายการ',
    wineCount: 'รายการ',
  },
  DE: {
    allTypes: 'Alle Weine',
    allCountries: 'Alle Herkunftsländer',
    italianFirstBadge: 'Italienische Auswahl im Fokus',
    noWinesFound: 'Keine Weine für die ausgewählten Filter gefunden.',
    resetFilters: 'Alle Weine anzeigen',
    winesCount: 'Weine',
    wineCount: 'Wein',
  },
  MM: {
    allTypes: 'ဝိုင် အားလုံး',
    allCountries: 'မူရင်းနိုင်ငံ အားလုံး',
    italianFirstBadge: 'အီတလီ အထူးရွေးချယ်မှု',
    noWinesFound: 'ရွေးချယ်ထားသော စစ်ထုတ်မှုနှင့် ကိုက်ညီသော ဝိုင် မရှိပါ။',
    resetFilters: 'ဝိုင် အားလုံး ပြသရန်',
    winesCount: 'မျိုး',
    wineCount: 'မျိုး',
  },
};

const WINE_TYPE_SECTIONS = [
  {
    id: 'red',
    name: { IT: 'Vini Rossi', EN: 'Red Wines', TH: 'ไวน์แดง', DE: 'Rotweine', MM: 'ဝိုင်နီ' },
    desc: {
      IT: 'Selezione di vini rossi strutturati, avvolgenti e armoniosi, ideali per accompagnare piatti saporiti, carni e pizze gourmet.',
      EN: 'Curated selection of structured, full-bodied red wines, tailored for savory dishes, meats, and gourmet pizzas.',
      TH: 'คัดสรรไวน์แดงรสชาตินุ่มละมุนและเข้มข้น เหมาะสำหรับทานคู่กับอาหารจานหลักและพิซซ่า',
      DE: 'Kuratierte Auswahl an strukturierten, vollmundigen Rotweinen, ideal zu herzhaften Gerichten, Fleisch und Pizza.',
      MM: 'အသားဟင်းလျာများနှင့် ပီဇာတို့နှင့် တွဲဖက်သောက်သုံးရန် သင့်တော်သော ဝိုင်နီများ'
    },
    badge: { IT: 'Corposi & Strutturati', EN: 'Full-Bodied', TH: 'เข้มข้น', DE: 'Vollmundig', MM: 'ပြည့်စုံသောအရသာ' },
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
      MM: 'အမြည်းများနှင့် ပင်လယ်စာ ဟင်းလျာများအတွက် လတ်ဆတ်မွှေးကြိုင်သော ဝိုင်ဖြူများ'
    },
    badge: { IT: 'Freschi & Minerali', EN: 'Crisp & Mineral', TH: 'สดชื่น', DE: 'Frisch & Mineralisch', MM: 'လတ်ဆတ်မွှေးကြိုင်' },
    color: '#b45309'
  },
  {
    id: 'rose',
    name: { IT: 'Vini Rosati', EN: 'Rosé Wines', TH: 'ไวน์โรเซ่', DE: 'Roséweine', MM: 'ဝိုင်ရိုဆေး' },
    desc: {
      IT: 'Sfumature floreali e fruttate con un profilo fresco e versatile, perfetto per aperitivi e pietanze leggere.',
      EN: 'Delicate floral and fruity notes with a crisp, balanced profile, perfect for warm evenings and light dining.',
      TH: 'ไวน์โรเซ่สีสวย กลิ่นหอมสดชื่น ดื่มง่าย สดชื่นในทุกช่วงเวลา',
      DE: 'Florale und fruchtige Noten mit herrlicher Frische, ideal für warme Abende und leichte Küche.',
      MM: 'ပန်းရနံ့နှင့် သစ်သီးရနံ့ သင်းပျံ့သော သောက်သုံးရလွယ်ကူသည့် ရိုဆေးဝိုင်'
    },
    badge: { IT: 'Floreali & Freschi', EN: 'Floral & Refreshing', TH: 'หอมละมุน', DE: 'Floral & Frisch', MM: 'သင်းပျံ့လန်းဆန်း' },
    color: '#db2777'
  },
  {
    id: 'sparkling',
    name: { IT: 'Spumanti', EN: 'Sparkling Wines', TH: 'สปาร์กลิงไวน်', DE: 'Schaumweine', MM: 'စပါကလင် ဝိုင်' },
    desc: {
      IT: 'Spumanti e prosecchi dal perlage fine e persistente, pensati per brindisi raffinati e momenti speciali.',
      EN: 'Sparkling wines and prosecco with fine, delicate perlage, crafted for celebrations and elegant toasts.',
      TH: 'สปาร์กลิงไวน์และโพรเซกโกชั้นเลิศ ฟองละเอียดนุ่มลิ้น เพื่อทุกช่วงเวลาพิเศษ',
      DE: 'Edle Schaumweine und Prosecco mit feiner Perlage für besondere Anlässe und stilvolle Momente.',
      MM: 'အထူး အခမ်းအနားများနှင့် ဂုဏ်ပြုပွဲများအတွက် ပရိုဆက်ကိုနှင့် စပါကလင်ဝိုင်ကောင်းများ'
    },
    badge: { IT: 'Perlage & Prestigio', EN: 'Fine Perlage', TH: 'ฟองละเอียด', DE: 'Feine Perlage', MM: 'အမြှုပ်နုချောမွေ့' },
    color: '#ca8a04'
  }
];

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
        className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white border border-stone-300 hover:border-[#8B1E1E] rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer min-w-[220px] sm:min-w-[260px] text-xs font-bold uppercase tracking-wider text-stone-900 focus:outline-none select-none group"
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
        <div className="absolute left-0 top-full mt-2 w-full min-w-[260px] max-h-80 overflow-y-auto bg-white border border-stone-200/90 rounded-2xl shadow-2xl z-[99999] p-1.5 animate-fadeIn">
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

function DiningTabletSiteContent({ onLogout }: { onLogout?: () => Promise<void> }) {
  const { language: lang, setLanguage } = useLanguageStore();
  const { clearCart, setItems, items } = useCartStore();
  
  // Realtime Live Shared Cart Controller for this table
  const liveCartControllerRef = useRef<DiningLiveCartController | null>(null);
  const isApplyingRemoteSyncRef = useRef<boolean>(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Check guest URL params synchronously on initial render
  const initialGuestInfo = useMemo(() => {
    if (typeof window === 'undefined') return { isGuest: false, table: '', token: '' };
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const gTable = searchParams.get('table');
      const gToken = searchParams.get('token');
      if (gTable && gToken) {
        return {
          isGuest: true,
          table: getCanonicalTableKey(gTable),
          token: gToken
        };
      }
    } catch {}
    return { isGuest: false, table: '', token: '' };
  }, []);

  // Table Session State: Must select table before accessing menu (Guests start already locked on their table)
  const [currentTable, setCurrentTable] = useState<string>(initialGuestInfo.table);
  const [isTableSelected, setIsTableSelected] = useState<boolean>(initialGuestInfo.isGuest);
  const [customTableInput, setCustomTableInput] = useState<string>('');
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isQrStudioOpen, setIsQrStudioOpen] = useState<boolean>(false);
  const [isGuestMobile, setIsGuestMobile] = useState<boolean>(initialGuestInfo.isGuest);
  const [isGuestSettled, setIsGuestSettled] = useState<boolean>(false);
  const [_guestSessionToken, setGuestSessionToken] = useState<string>(initialGuestInfo.token);

  // Hall Presence State: Realtime tracking of guest smartphones per table
  const [hallPresence, setHallPresence] = useState<HallPresenceMap>({});

  // Tablet Monitoring: Subscribe to real-time hall presence across all 16 tables
  useEffect(() => {
    const unsub = subscribeToHallTablePresence((presenceMap) => {
      setHallPresence(presenceMap);
    });
    return unsub;
  }, []);

  // Guest Mobile: Report active presence while on table session
  useEffect(() => {
    if (isGuestMobile && currentTable) {
      const stopPresence = reportTableGuestPresence(currentTable, true, lang);
      return stopPresence;
    }
  }, [isGuestMobile, currentTable, lang]);

  // Connect bidirectional Realtime Live Cart when table is selected
  useEffect(() => {
    if (!currentTable || !isTableSelected) {
      if (liveCartControllerRef.current) {
        liveCartControllerRef.current.unsubscribe();
        liveCartControllerRef.current = null;
      }
      return;
    }

    const controller = connectDiningLiveCart({
      tableKey: currentTable,
      onRemoteCartSync: (remoteItems) => {
        isApplyingRemoteSyncRef.current = true;
        setItems(remoteItems);
        setTimeout(() => {
          isApplyingRemoteSyncRef.current = false;
        }, 120);
      },
      onRequestSyncReceived: () => {
        return itemsRef.current;
      },
      onRemoteCartClear: () => {
        isApplyingRemoteSyncRef.current = true;
        clearCart();
        setTimeout(() => {
          isApplyingRemoteSyncRef.current = false;
        }, 120);
      }
    });

    liveCartControllerRef.current = controller;

    return () => {
      controller.unsubscribe();
      liveCartControllerRef.current = null;
    };
  }, [currentTable, isTableSelected, setItems, clearCart]);

  // Broadcast cart changes on any local modifications (add, remove, qty, extras)
  useEffect(() => {
    if (!currentTable || !isTableSelected) return;
    if (isApplyingRemoteSyncRef.current) return;

    liveCartControllerRef.current?.broadcastCart(items);
  }, [items, currentTable, isTableSelected]);

  // Check guest URL session validation on mount
  useEffect(() => {
    if (initialGuestInfo.isGuest && initialGuestInfo.table && initialGuestInfo.token) {
      validateDiningTableSession(initialGuestInfo.table, initialGuestInfo.token).then(res => {
        if (res.valid) {
          setCurrentTable(initialGuestInfo.table);
          setIsTableSelected(true);
        } else if (res.status === 'settled' || res.status === 'expired') {
          setCurrentTable(initialGuestInfo.table);
          setIsGuestSettled(true);
        }
      });
    }
  }, [initialGuestInfo]);

  // Listen to dining session revocation channel
  useEffect(() => {
    let bcSess: BroadcastChannel | null = null;
    try {
      bcSess = new BroadcastChannel('fp_dining_sessions');
      bcSess.onmessage = (ev) => {
        if (ev.data?.type === 'SESSION_REVOKED') {
          const revTable = ev.data?.tableKey;
          if (revTable && currentTable && getCanonicalTableKey(currentTable) === getCanonicalTableKey(revTable)) {
            if (isGuestMobile) {
              setIsGuestSettled(true);
              clearCart();
            }
          }
        }
      };
    } catch {}
    return () => {
      if (bcSess) bcSess.close();
    };
  }, [currentTable, isGuestMobile, clearCart]);

  const currentSession = useMemo(() => {
    if (!currentTable) return null;
    return generateDiningTableSession(currentTable);
  }, [currentTable]);

  // Ensure fresh table selection on reload if not guest mobile
  useEffect(() => {
    try {
      if (!isGuestMobile) {
        localStorage.removeItem('fp_dining_active_table');
      }
    } catch {}
  }, [isGuestMobile]);

  // Active Orders per Table for Table Selection Status
  const [activeTableOrderMap, setActiveTableOrderMap] = useState<Record<string, any[]>>({});

  const fetchActiveDineInOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('pizza_orders')
        .select('*')
        .neq('status', 'completed')
        .neq('status', 'cancelled')
        .neq('status', 'rejected')
        .neq('status', 'settled')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching active dining orders:', error);
        return;
      }

      const map: Record<string, any[]> = {};
      (data || []).forEach((order: any) => {
        const rawTable = extractTableFromAddress(order.address) || order.table_number || '';
        if (rawTable) {
          const canonical = getCanonicalTableKey(rawTable);
          if (!map[canonical]) map[canonical] = [];
          map[canonical].push(order);
        }
      });
      setActiveTableOrderMap(map);
    } catch (err) {
      console.error('fetchActiveDineInOrders exception:', err);
    }
  };

  useEffect(() => {
    fetchActiveDineInOrders();

    const sub = supabase
      .channel('dining_orders_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pizza_orders' }, (payload: any) => {
        fetchActiveDineInOrders();
        if (payload?.new?.status === 'preparing') {
          setIsCheckoutModalOpen(false);
          if (!isGuestMobile) {
            setIsTableSelected(false);
            setCurrentTable('');
          }
        }
        if (payload?.new?.status === 'completed' || payload?.new?.status === 'settled') {
          const rawTable = extractTableFromAddress(payload?.new?.address) || payload?.new?.table_number || '';
          if (rawTable && currentTable && getCanonicalTableKey(rawTable) === getCanonicalTableKey(currentTable)) {
            clearCart();
            if (isGuestMobile) {
              setIsGuestSettled(true);
            } else {
              setIsTableSelected(false);
              setCurrentTable('');
            }
          }
        }
      })
      .subscribe();

    let bc1: BroadcastChannel | null = null;
    let bc2: BroadcastChannel | null = null;
    let bcTable: BroadcastChannel | null = null;

    const handleOrderEvent = (evData: any) => {
      fetchActiveDineInOrders();
      if (!evData) return;
      if (evData.type === 'ORDER_ACCEPTED' || evData.status === 'preparing') {
        setIsCheckoutModalOpen(false);
        if (!isGuestMobile) {
          setIsTableSelected(false);
          setCurrentTable('');
        }
      }
    };

    try {
      bc1 = new BroadcastChannel('pizza_orders_channel');
      bc1.onmessage = (ev) => { handleOrderEvent(ev.data); };
    } catch {}
    try {
      bc2 = new BroadcastChannel('flower_power_orders_channel');
      bc2.onmessage = (ev) => { handleOrderEvent(ev.data); };
    } catch {}
    try {
      bcTable = new BroadcastChannel('pizza_table_channel');
      bcTable.onmessage = (ev) => {
        fetchActiveDineInOrders();
        if (ev.data?.type === 'TABLE_SETTLED') {
          const settledKey = ev.data?.tableKey ? getCanonicalTableKey(ev.data.tableKey) : '';
          if (settledKey && currentTable && getCanonicalTableKey(currentTable) === settledKey) {
            clearCart();
            if (isGuestMobile) {
              setIsGuestSettled(true);
            } else {
              setIsTableSelected(false);
              setCurrentTable('');
            }
          }
        }
      };
    } catch {}

    const interval = setInterval(fetchActiveDineInOrders, 10000);

    return () => {
      supabase.removeChannel(sub);
      if (bc1) bc1.close();
      if (bc2) bc2.close();
      if (bcTable) bcTable.close();
      clearInterval(interval);
    };
  }, [currentTable, clearCart]);

  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);

  const handleSelectTable = (tableName: string) => {
    const trimmed = tableName.trim();
    if (!trimmed) return;
    const canonical = getCanonicalTableKey(trimmed);
    const openOrders = activeTableOrderMap[canonical] || [];

    if (openOrders.length > 0) {
      // 1. Rehydrate table cart ONLY from the single latest active order of this table (prevents duplication)
      const latestOrder = openOrders[0];
      const existingItems: any[] = [];
      const orderItems = Array.isArray(latestOrder.items) ? latestOrder.items : [];
      
      orderItems.forEach((it: any, idx: number) => {
        let dishImage = it.image || '';
        if (!dishImage) {
          const pid = (it.productId || it.id || '').toLowerCase();
          const name = (it.name || '').toLowerCase();
          const nameIt = (it.nameIt || '').toLowerCase();
          for (const cat of menuData) {
            const found = cat.items.find(m => 
              (pid && m.id.toLowerCase() === pid) ||
              (name && m.name.toLowerCase() === name) ||
              (nameIt && (m.nameIt?.toLowerCase() === nameIt || (m as any).name_it?.toLowerCase() === nameIt))
            );
            if (found) {
              dishImage = found.image;
              break;
            }
          }
        }

        existingItems.push({
          cartId: it.cartId || `order-${latestOrder.id}-${idx}-${Date.now()}`,
          productId: it.productId || it.id || '',
          name: it.name || '',
          nameIt: it.nameIt,
          nameTh: it.nameTh || it.name || '',
          nameDe: it.nameDe,
          image: dishImage,
          basePrice: Number(it.basePrice || it.price || 0),
          quantity: Number(it.quantity || 1),
          selectedVariant: it.variant ? { id: it.variant, name: it.variant, priceModifier: 0 } as any : (it.selectedVariant || null),
          selectedExtras: Array.isArray(it.extras)
            ? it.extras.map((ex: any) => typeof ex === 'string' ? { id: ex, name: ex, price: 0 } : ex)
            : (it.selectedExtras || []),
          lasagnaDate: it.lasagnaDate,
          isHalalChicken: it.isHalalChicken
        });
      });

      setItems(existingItems);
    } else {
      // Free table with no active orders
      clearCart();
    }

    setCurrentTable(canonical);
    setIsTableSelected(true);
  };

  const [isResetConfirming, setIsResetConfirming] = useState<boolean>(false);
  const resetConfirmTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCancelAndResetTable = () => {
    liveCartControllerRef.current?.broadcastClear();
    clearCart();
    if (!isGuestMobile) {
      setCurrentTable('');
      setIsTableSelected(false);
      setCustomTableInput('');
    }
  };

  const handleResetClick = () => {
    if (!isResetConfirming) {
      setIsResetConfirming(true);
      if (resetConfirmTimerRef.current) clearTimeout(resetConfirmTimerRef.current);
      resetConfirmTimerRef.current = setTimeout(() => {
        setIsResetConfirming(false);
      }, 5000);
    } else {
      if (resetConfirmTimerRef.current) clearTimeout(resetConfirmTimerRef.current);
      setIsResetConfirming(false);
      handleCancelAndResetTable();
    }
  };

  // Reset confirmation state when table changes or selection closes
  useEffect(() => {
    setIsResetConfirming(false);
    if (resetConfirmTimerRef.current) clearTimeout(resetConfirmTimerRef.current);
  }, [currentTable, isTableSelected]);

  // Cloud Wine Collection Sync
  const [cloudWines, setCloudWines] = useState<WineCardData[]>([]);
  useEffect(() => {
    fetchCloudWineCollection().then(w => {
      if (w && w.length > 0) {
        setCloudWines(w);
      }
    });
  }, []);

  // Category & Filters State
  const availableCategories = menuData;
  const [activeCategoryId, setActiveCategoryId] = useState(() => availableCategories[0]?.id || menuData[0].id);
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veggie' | 'vegan'>('all');
  const [selectedPastaSauce, setSelectedPastaSauce] = useState<string>('all');
  const [selectedSaladSubFilter, setSelectedSaladSubFilter] = useState<'all' | 'salads' | 'main-courses'>('all');
  const [selectedSandwichSubFilter, setSelectedSandwichSubFilter] = useState<'all' | 'focacce' | 'pizza-sandwiches'>('all');
  const [selectedWineType, setSelectedWineType] = useState<'all' | 'red' | 'white' | 'rose' | 'sparkling'>('all');
  const [selectedWineCountry, setSelectedWineCountry] = useState<string>('all');

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

  // Sync daily specials and availability overrides from admin dashboard
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

  // Reset to first category and scroll top on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if ('scrollRestoration' in window.history) {
          window.history.scrollRestoration = 'manual';
        }
      } catch {}
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }
    setActiveCategoryId(availableCategories[0]?.id || 'traditional-italian-pizza');
    setDietaryFilter('all');
    setSelectedPastaSauce('all');
    setSelectedSaladSubFilter('all');
    setSelectedSandwichSubFilter('all');
    setSelectedWineType('all');
    setSelectedWineCountry('all');
  }, []);

  // Dynamic Wine Collection Generator
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
            price: rawPrice,
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
      console.warn('Error reading dynamic wines in DiningTabletSite:', e);
      return [];
    }
  };

  const allDynamicWines = useMemo(() => {
    return getDynamicWineItems();
  }, [lang, activeCategoryId, cloudWines, unavailableIds]);

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
      list = list.filter((w: any) => w.categoryType === type);
    }
    if (selectedWineCountry !== 'all') {
      list = list.filter((w: any) => w.flag === selectedWineCountry);
    }
    return list;
  };

  const wineTypeCounts = useMemo(() => {
    return {
      all: filterWineItems('all').length,
      red: filterWineItems('red').length,
      white: filterWineItems('white').length,
      rose: filterWineItems('rose').length,
      sparkling: filterWineItems('sparkling').length,
    };
  }, [allDynamicWines, selectedWineCountry]);

  const groupedWineSections = useMemo(() => {
    return WINE_TYPE_SECTIONS.map(sec => {
      const items = filterWineItems(sec.id);
      return { ...sec, items };
    }).filter(group => group.items.length > 0);
  }, [allDynamicWines, selectedWineCountry, lang]);

  // Cart & Checkout
  const { getCount, getTotal, openCart } = useCartStore();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Floating Cart Lateral Tab state (Compact by default, expands on desktop hover or mobile tap)
  const [isCartTabExpanded, setIsCartTabExpanded] = useState(false);
  const cartTabTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCartTabClick = (e: React.MouseEvent) => {
    if (!isCartTabExpanded) {
      e.stopPropagation();
      setIsCartTabExpanded(true);
      if (cartTabTimerRef.current) clearTimeout(cartTabTimerRef.current);
      cartTabTimerRef.current = setTimeout(() => {
        setIsCartTabExpanded(false);
      }, 4000);
      return;
    }

    if (cartTabTimerRef.current) clearTimeout(cartTabTimerRef.current);
    setIsCartTabExpanded(false);
    openCart();
  };

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



  const rawSubtotal = getTotal();
  const discountAmount = Math.round(rawSubtotal * 0.05);
  const discountedTotal = Math.max(0, rawSubtotal - discountAmount);
  const cartCount = getCount();



  const activeCategory = availableCategories.find((c) => c.id === activeCategoryId) ?? availableCategories[0];
  const activeCategoryName = categoryDetails[activeCategory.id]?.[lang]?.name || activeCategory.name;

  const filteredCategoryItems = useMemo(() => {
    if (activeCategoryId === 'wines') {
      return filterWineItems(selectedWineType);
    }
    const raw = activeCategory.items.filter((i: any) => !unavailableIds.has(i.id));
    if (dietaryFilter === 'all') return raw;
    if (dietaryFilter === 'veggie') {
      return raw.filter(i => {
        const d = getDietaryType(i, activeCategoryId);
        return d === 'veggie' || d === 'vegan';
      });
    }
    if (dietaryFilter === 'vegan') {
      return raw.filter(i => getDietaryType(i, activeCategoryId) === 'vegan');
    }
    return raw;
  }, [activeCategoryId, activeCategory, dietaryFilter, selectedWineType, selectedWineCountry, allDynamicWines, unavailableIds]);

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

  if (isGuestSettled) {
    const tQr = I18N_DINING_QR[lang] || I18N_DINING_QR.IT;
    return (
      <div className="min-h-screen bg-[#111] text-stone-100 flex flex-col items-center justify-center p-4 text-center antialiased select-none" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
        <div className="max-w-md w-full bg-stone-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-950 border border-emerald-500/60 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/80">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/40">
              {currentTable ? formatTableStationName(currentTable, lang) : 'Tavolo'}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight pt-1">
              {tQr.settledNotice}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-xs mx-auto">
              {tQr.settledDesc}
            </p>
          </div>

          <div className="pt-3 border-t border-stone-800">
            <a
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-all"
            >
              <span>{tQr.backHomeBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e7e5e4] text-stone-900 pb-28 antialiased" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
      
      {/* TOP FIXED BAR FOR DINING TABLET */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-md border-b border-amber-400/20 text-white px-2.5 sm:px-5 py-2 flex items-center justify-between gap-2 shadow-xl h-14 sm:h-16">
        
        {/* Left: Clean Brand Logo Only (No text) */}
        <div className="flex items-center shrink-0">
          <img
            src="/flower-power-pizza-logo-160.png"
            alt="Flower Power Pizza"
            className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-md rounded-full transition-transform hover:scale-105"
          />
        </div>

        {/* Right Actions: Unified Luxury Concept Pills (Tavolo, QR, Lingua, Salda) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {isGuestMobile ? (
            /* Guest Smartphone Header Pill */
            <div className="h-9 px-3 sm:px-3.5 rounded-xl bg-stone-900/90 border border-stone-700/80 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center gap-1.5 whitespace-nowrap">
              <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-black text-amber-300">
                {currentTable ? formatTableStationName(currentTable, lang) : 'Tavolo'}
              </span>
            </div>
          ) : (
            /* Staff / Tablet Controls */
            <>
              {/* 1. Tavolo Pill */}
              <button
                type="button"
                onClick={() => { setIsTableSelected(false); setCustomTableInput(''); }}
                className="h-9 px-2.5 sm:px-3.5 rounded-xl bg-stone-900/90 hover:bg-stone-850 border border-stone-700/80 hover:border-amber-400/80 text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
                title={lang === 'TH' ? 'แตะเพื่อเปลี่ยนโต๊ะ' : lang === 'EN' ? 'Tap to change table' : lang === 'DE' ? 'Tippen zum Tischwechsel' : lang === 'MM' ? 'စားပွဲပြောင်းရန် နှိပ်ပါ' : 'Tocca per cambiare tavolo'}
              >
                <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-black text-amber-300">
                  {currentTable ? formatTableStationName(currentTable, lang) : (lang === 'TH' ? 'เลือกโต๊ะ' : lang === 'EN' ? 'Table' : lang === 'DE' ? 'Tisch' : lang === 'MM' ? 'စားပွဲ' : 'Tavolo')}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              </button>

              {/* 2. QR Code Pill (Unified Same Concept & Measure) */}
              {currentTable && (
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(true)}
                  className="h-9 px-2.5 sm:px-3.5 rounded-xl bg-stone-900/90 hover:bg-stone-850 border border-stone-700/80 hover:border-amber-400/80 text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
                  title={lang === 'TH' ? 'แสดง QR Code สำหรับสั่งผ่านมือถือ' : lang === 'EN' ? 'Show Smartphone QR Code' : lang === 'DE' ? 'Smartphone-QR anzeigen' : lang === 'MM' ? 'စမတ်ဖုန်း QR ပြပါ' : 'Mostra QR Code Smartphone'}
                >
                  <QrCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-extrabold text-stone-100 text-xs sm:text-sm">QR</span>
                </button>
              )}

              {/* 3. Salda Conto Pill (Se aperto) */}
              {currentTable && (activeTableOrderMap[getCanonicalTableKey(currentTable)] || []).length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsSettlementModalOpen(true)}
                  className="h-9 hidden md:flex items-center gap-1.5 px-3 rounded-xl bg-emerald-950/90 border border-emerald-500/70 hover:bg-emerald-900 text-emerald-200 font-extrabold text-xs shadow-md cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                >
                  <span>💳</span>
                  <span>{lang === 'TH' ? 'เช็คบิล' : lang === 'EN' ? 'Bill' : lang === 'DE' ? 'Zahlen' : lang === 'MM' ? 'ဘေလ်' : 'Salda'}</span>
                  <span className="font-mono bg-emerald-900 px-1.5 py-0.5 rounded text-[11px] text-emerald-300">
                    ฿{Math.round((activeTableOrderMap[getCanonicalTableKey(currentTable)] || []).reduce((s, o) => s + (Number(o.total) || 0), 0))}
                  </span>
                </button>
              )}
            </>
          )}

          {/* 4. Language Dropdown Selector (Same Concept & h-9) */}
          <LanguageDropdown 
            currentLang={lang} 
            onSelect={setLanguage} 
            variant="dining-dark" 
            align="right" 
          />

          {/* 5. Cancel & Reset Order Button (2-Step Confirmation with Localized Prompt) */}
          <button
            type="button"
            onClick={handleResetClick}
            className={
              isResetConfirming
                ? "h-9 px-2.5 sm:px-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border border-red-300 text-white font-extrabold text-xs shadow-lg shadow-red-950/80 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 shrink-0 animate-pulse"
                : "h-9 w-9 px-0 rounded-xl bg-stone-900/90 hover:bg-red-950/90 border border-stone-700/80 hover:border-red-500/80 text-stone-300 hover:text-red-300 shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center shrink-0"
            }
            title={
              isResetConfirming
                ? (I18N_RESET_CONFIRM[lang]?.full || I18N_RESET_CONFIRM.IT.full)
                : (lang === 'TH' ? 'ยกเลิกและล้างตะกร้า' : lang === 'EN' ? 'Cancel & Reset Table' : lang === 'DE' ? 'Abbrechen & Tisch zurücksetzen' : lang === 'MM' ? 'ပယ်ဖျက်ပြီး ပြန်စမည်' : 'Annulla & Resetta Tavolo')
            }
          >
            {isResetConfirming ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-tight whitespace-nowrap">
                  {I18N_RESET_CONFIRM[lang]?.short || I18N_RESET_CONFIRM.IT.short}
                </span>
                <X className="w-3.5 h-3.5 text-white/90 shrink-0" />
              </>
            ) : (
              <X className="w-4 h-4 text-stone-300 hover:text-red-300 shrink-0" />
            )}
          </button>
        </div>
      </nav>

      {/* MANDATORY TABLE SELECTION OVERLAY (Only on Master Tablet when session not yet picked) */}
      {!isGuestMobile && !isTableSelected && (
        <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-5 animate-fadeIn">
          <div className="bg-stone-900 border-2 border-amber-400/50 rounded-2xl sm:rounded-3xl w-full max-w-2xl p-3.5 sm:p-6 text-white space-y-3 sm:space-y-4 shadow-2xl max-h-[96vh] overflow-y-auto">
            
            {/* Top Bar: Icon + Title/Subtitle + Language Selector in ONE cohesive row */}
            <div className="flex items-center justify-between gap-3 pb-2.5 sm:pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-[#8B1E1E] to-[#5a1111] border border-amber-400/50 rounded-xl flex items-center justify-center shadow-md shrink-0">
                  <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-lg font-black text-white tracking-tight truncate leading-tight">
                    {I18N_TABLE_PICKER[lang]?.title || I18N_TABLE_PICKER.IT.title}
                  </h2>
                  <p className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider truncate">
                    {I18N_TABLE_PICKER[lang]?.subtitle || I18N_TABLE_PICKER.IT.subtitle}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsQrStudioOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/50 text-amber-300 hover:text-amber-200 text-[11px] sm:text-xs font-black transition-all cursor-pointer shadow-md active:scale-95 whitespace-nowrap"
                  title={I18N_TABLE_PICKER[lang]?.qrStudioBtn || 'QR Tavoli 1-16'}
                >
                  <QrCode className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">{I18N_TABLE_PICKER[lang]?.qrStudioBtn || 'QR Tavoli 1-16'}</span>
                </button>

                <LanguageDropdown 
                  currentLang={lang} 
                  onSelect={setLanguage} 
                  variant="dining-dark" 
                  align="right" 
                />

                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-500/60 hover:bg-red-900 text-red-300 hover:text-white text-[11px] sm:text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 whitespace-nowrap"
                    title={I18N_TABLE_PICKER[lang]?.logoutBtn || 'Logout'}
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span className="hidden sm:inline">{I18N_TABLE_PICKER[lang]?.logoutBtn || 'Logout'}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2.5 sm:space-y-3.5">
              <div>
                <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5 sm:mb-2">
                  <span>{I18N_TABLE_PICKER[lang]?.tablesHeading || I18N_TABLE_PICKER.IT.tablesHeading}</span>
                  <span className="text-[10px] sm:text-[11px] text-stone-400 font-normal flex items-center gap-2">
                    <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 inline-block"></span> {I18N_TABLE_PICKER[lang]?.freeLabel || I18N_TABLE_PICKER.IT.freeLabel}</span>
                    <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 inline-block animate-ping"></span> {I18N_TABLE_PICKER[lang]?.guestLabel || I18N_TABLE_PICKER.IT.guestLabel}</span>
                    <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 inline-block"></span> {I18N_TABLE_PICKER[lang]?.activeLabel || I18N_TABLE_PICKER.IT.activeLabel}</span>
                  </span>
                </div>
                
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {DINING_TABLES.map(t => {
                    const displayName = formatTableStationName(t, lang);
                    const isSelected = currentTable === t;
                    const canonical = getCanonicalTableKey(t);
                    const orders = activeTableOrderMap[canonical] || [];
                    const isOccupied = orders.length > 0;
                    const openTotal = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
                    
                    // Check active guest presence on this table
                    const guestPresence = hallPresence[canonical];
                    const isGuestOccupied = !!(guestPresence && guestPresence.guestCount > 0);
                    const guestCount = guestPresence?.guestCount || 0;

                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleSelectTable(t)}
                        className={`p-2 sm:p-2.5 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between gap-1 relative overflow-hidden ${
                          isSelected
                            ? 'bg-gradient-to-br from-amber-950/90 to-stone-900 border-amber-400 text-white shadow-lg ring-1 ring-amber-400/50'
                            : isGuestOccupied
                              ? 'bg-gradient-to-br from-red-950/70 to-stone-900 border-red-500/80 text-white shadow-lg ring-1 ring-red-500/50 hover:bg-red-900/60'
                              : isOccupied
                                ? 'bg-amber-950/30 border-amber-500/60 text-stone-200 hover:border-amber-400 hover:bg-amber-950/50'
                                : 'bg-stone-950/80 border-stone-800 text-stone-200 hover:border-amber-400/60 hover:bg-stone-850'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs sm:text-sm font-black uppercase tracking-tight text-white truncate">{displayName}</span>
                          <span className="relative flex h-2 w-2">
                            {isGuestOccupied ? (
                              <>
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                              </>
                            ) : (
                              <span className={`w-2 h-2 rounded-full shrink-0 ${
                                isOccupied
                                  ? 'bg-amber-400 animate-pulse'
                                  : isSelected
                                    ? 'bg-amber-400'
                                    : 'bg-emerald-500'
                              }`} />
                            )}
                          </span>
                        </div>
                        <div className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate ${
                          isGuestOccupied 
                            ? 'text-red-400 font-black animate-pulse'
                            : isOccupied 
                              ? 'text-amber-400 font-extrabold' 
                              : 'text-emerald-400/90'
                        }`}>
                          {isGuestOccupied
                            ? `📱 ${guestCount} ${lang === 'TH' ? 'ลูกค้าเชื่อมต่อ' : lang === 'EN' ? (guestCount > 1 ? 'Guests Live' : 'Guest Live') : lang === 'DE' ? 'Gast live' : lang === 'MM' ? 'အော်ဒါမှာနေသည်' : (guestCount > 1 ? 'Ospiti Live' : 'Ospite Live')}`
                            : isOccupied 
                              ? `${I18N_TABLE_PICKER[lang]?.activeCardPrefix || I18N_TABLE_PICKER.IT.activeCardPrefix} ฿${Math.round(openTotal)}`
                              : (I18N_TABLE_PICKER[lang]?.freeCard || I18N_TABLE_PICKER.IT.freeCard)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1 pt-2 sm:pt-2.5 border-t border-stone-800">
                <label className="text-[10px] sm:text-xs font-bold text-stone-300 uppercase tracking-wider block">
                  {I18N_TABLE_PICKER[lang]?.customLabel || I18N_TABLE_PICKER.IT.customLabel}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTableInput}
                    onChange={(e) => setCustomTableInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customTableInput.trim()) {
                        handleSelectTable(customTableInput.trim());
                      }
                    }}
                    placeholder={I18N_TABLE_PICKER[lang]?.customPlaceholder || I18N_TABLE_PICKER.IT.customPlaceholder}
                    className="flex-1 bg-stone-950 border border-stone-700 text-white rounded-xl px-3 py-1.5 sm:py-2 text-xs focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customTableInput.trim()) {
                        handleSelectTable(customTableInput.trim());
                      }
                    }}
                    className="px-4 py-1.5 sm:py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-95 shrink-0"
                  >
                    {I18N_TABLE_PICKER[lang]?.enterBtn || I18N_TABLE_PICKER.IT.enterBtn}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

          {/* MAIN CONTAINER */}
          <main className="pt-16 max-w-6xl mx-auto px-2 sm:px-4">
            
            {/* EXCLUSIVE DINING PRIVILEGE HERO BANNER (Clean, Focused & Elegant) */}
            <header className="relative text-stone-100 py-3 sm:py-3.5 px-4 sm:px-6 md:px-7 rounded-2xl sm:rounded-3xl shadow-lg my-2.5 z-30 border border-amber-400/40 overflow-hidden" style={{ backgroundColor: '#3b3530' }}>
              {/* Inner Background Slideshow with rounded corners & clipping */}
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden pointer-events-none">
                <div className="absolute inset-0 opacity-35">
                  <PizzaSlideshow />
                </div>
                <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[0.5px]" />
              </div>
              
              <div className="relative z-10 flex flex-row items-center justify-between gap-3 sm:gap-6">
                {/* Left Side: Brand Logo & Title */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0 border-r border-amber-400/25 pr-3 sm:pr-6">
                  <img
                    src="/Flower_Power_Pizza_-_HotSpring.png"
                    alt="Flower Power Pizza Logo"
                    width={120}
                    height={120}
                    className="h-14 sm:h-18 md:h-22 w-auto drop-shadow-xl flex-shrink-0 object-contain hover:scale-105 transition-transform"
                  />
                  <div>
                    <h2 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-white leading-none">
                      FLOWER POWER
                    </h2>
                    <span className="font-light italic text-[#f87171] text-xs sm:text-sm md:text-base block -mt-0.5">
                      Pizza
                    </span>
                    <span className="text-[#fca5a5] font-black tracking-widest text-[7.5px] sm:text-[8.5px] uppercase block pt-0.5">
                      {LOCATION_BY_LANG[lang] || LOCATION_BY_LANG.IT}
                    </span>
                  </div>
                </div>

                {/* Right Side: Promotional Title & Incentive Only */}
                <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5 text-left">
                  {/* Hero Title */}
                  <h1 className="font-sans text-xs sm:text-base md:text-lg font-black tracking-tight text-white leading-snug">
                    {lang === 'TH' ? (
                      <>รับส่วนลดทันที <span className="text-amber-300">5% ทุกเมนู</span> เมื่อสั่งผ่านแท็บเล็ต!</>
                    ) : lang === 'IT' ? (
                      <>Sconto Immediato del <span className="text-amber-300">5% su Tutto il Menu</span> dal Tablet!</>
                    ) : lang === 'DE' ? (
                      <>Sofort <span className="text-amber-300">5% Rabatt auf alles</span> am Tablet!</>
                    ) : lang === 'MM' ? (
                      <>တက်ဘလက်ဖြင့် <span className="text-amber-300">မီနူးတစ်ခုလုံး ၅% လျှော့စျေး</span> ချက်ချင်းရယူပါ!</>
                    ) : (
                      <>Instant <span className="text-amber-300">5% OFF Entire Menu</span> on Tablet!</>
                    )}
                  </h1>

                  {/* Subtitle & Delivery Gift Incentive */}
                  <p className="text-[9.5px] sm:text-[10.5px] md:text-[11.5px] text-stone-200 leading-relaxed font-normal">
                    {lang === 'IT' ? (
                      <>Gusta la vera cucina italiana al tavolo con il <strong>-5% sul conto</strong> e ricevi un <strong>Coupon Sconto del 10%</strong> per i tuoi ordini delivery da casa su flowerpowerpizza.com!</>
                    ) : lang === 'TH' ? (
                      <>เพลิดเพลินกับอาหารอิตาเลียนและไวน์แท้ที่โต๊ะอาหาร รับส่วนลดทันที 5% และรับคูปองพิเศษลด 10% สำหรับสั่งเดลิเวอรี่ส่งตรงถึงบ้าน!</>
                    ) : lang === 'DE' ? (
                      <>Genießen Sie echte italienische Küche am Tisch mit <strong>5% Rabatt</strong> und erhalten Sie einen <strong>10% Willkommens-Gutschein</strong> für Ihre nächste Lieferung nach Hause!</>
                    ) : lang === 'MM' ? (
                      <>သင့်စားပွဲတွင် စစ်မှန်သော အီတလီအစားအစာကို သုံးဆောင်ပါ - <strong>စုစုပေါင်းငွေတောင်းခံလွှာအပေါ် ၅% လျှော့စျေး</strong> ရယူပြီး နောက်တစ်ကြိမ် အိမ်အရောက်ပို့အတွက် <strong>၁၀% ကြိုဆိုလက်ဆောင်ကူပွန်</strong> ကို ရယူလိုက်ပါ!</>
                    ) : (
                      <>Enjoy authentic Italian cuisine at your table: get <strong>5% OFF your total bill</strong> and receive a <strong>10% Welcome Coupon</strong> for your next delivery order at home!</>
                    )}
                  </p>
                </div>
              </div>
            </header>


            {/* CATEGORY TABS */}
            <div id="dining-category-section" className="mb-4 scroll-mt-24">
              <CategoryTabs 
                categories={availableCategories} 
                activeId={activeCategoryId} 
                onChange={setActiveCategoryId} 
                lang={lang} 
              />
            </div>

            {/* WINE-SPECIFIC FILTER BAR (When in Wines category) */}
            {activeCategoryId === 'wines' && (
              <div className="mb-6 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 p-4 sm:p-5 rounded-3xl border border-amber-500/40 shadow-xl space-y-4 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-700/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
                      <Wine className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="font-sans text-base sm:text-lg font-black text-white leading-tight">
                        {lang === 'IT' ? 'Carta dei Vini • Degustazione al Tavolo' : lang === 'TH' ? 'รายการไวน์คัดพิเศษ • เสิร์ฟที่โต๊ะ' : lang === 'DE' ? 'Weinkarte • Tischverkostung' : 'Fine Wine List • Table Dining'}
                      </h3>
                      <p className="text-[11px] text-amber-300/90 font-medium">
                        {allDynamicWines.length} {WINE_FILTER_LABELS[lang].winesCount} • Sconto 5% al tavolo applicato a carrello
                      </p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold self-start sm:self-auto">
                    <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
                    <span>{WINE_FILTER_LABELS[lang].italianFirstBadge}</span>
                  </div>
                </div>

                {/* Filter Dropdowns */}
                <div className="relative z-30 flex items-end gap-3 flex-wrap">
                  <CustomFilterDropdown
                    label="Tipologia Vino"
                    selectedId={selectedWineType}
                    options={[
                      { id: 'all', label: WINE_FILTER_LABELS[lang].allTypes, count: wineTypeCounts.all },
                      ...WINE_TYPE_SECTIONS.map(s => ({
                        id: s.id,
                        label: s.name[lang],
                        count: wineTypeCounts[s.id as keyof typeof wineTypeCounts] || 0
                      }))
                    ]}
                    onSelect={(id) => setSelectedWineType(id as any)}
                  />

                  <CustomFilterDropdown
                    label="Origine / Nazione"
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
                      className="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0 border border-stone-700 shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* SECTION TITLE & DIETARY FILTER BAR (Non-Wine Categories) */}
            {activeCategoryId !== 'wines' && (
              <div className="mt-2 mb-4 px-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2">
                  <div>
                    <h2 className="font-sans text-xl md:text-2xl font-black tracking-tight text-stone-900">
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
                        {/* Option 1: ALL */}
                        <button
                          type="button"
                          onClick={() => setDietaryFilter('all')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                            dietaryFilter === 'all'
                              ? 'bg-stone-950 text-white shadow-md'
                              : 'text-stone-700 hover:text-stone-950 hover:bg-white/60'
                          }`}
                        >
                          <span>🍽️</span>
                          <span>{lang === 'TH' ? 'ทั้งหมด' : lang === 'IT' ? 'Tutti' : lang === 'DE' ? 'Alle' : lang === 'MM' ? 'အားလုံး' : 'All'}</span>
                        </button>

                        {/* Option 2: VEGGIE */}
                        <button
                          type="button"
                          onClick={() => setDietaryFilter('veggie')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                            dietaryFilter === 'veggie'
                              ? 'bg-amber-400 text-stone-950 shadow-md ring-1 ring-amber-500'
                              : 'text-stone-700 hover:text-amber-900 hover:bg-white/60'
                          }`}
                        >
                          <Wheat className={`w-3.5 h-3.5 ${dietaryFilter === 'veggie' ? 'text-stone-950 stroke-[2.5]' : 'text-amber-600'}`} />
                          <span>{lang === 'TH' ? 'มังสวิรัติ' : lang === 'IT' ? 'Veggie' : lang === 'DE' ? 'Veggie' : lang === 'MM' ? 'သတ်သတ်လွတ်' : 'Veggie'}</span>
                        </button>

                        {/* Option 3: VEGAN */}
                        <button
                          type="button"
                          onClick={() => setDietaryFilter('vegan')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                            dietaryFilter === 'vegan'
                              ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400'
                              : 'text-stone-700 hover:text-emerald-900 hover:bg-white/60'
                          }`}
                        >
                          <Leaf className={`w-3.5 h-3.5 ${dietaryFilter === 'vegan' ? 'text-emerald-100 stroke-[2.5]' : 'text-emerald-600'}`} />
                          <span>{lang === 'TH' ? 'วีแกน' : lang === 'IT' ? 'Vegan' : lang === 'DE' ? 'Vegan' : lang === 'MM' ? 'ဗီဂျန်' : 'Vegan'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-8 h-0.5 bg-[#8B1E1E] mt-1 mb-3" />
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

            {/* PRODUCTS GRID */}
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
                      <MenuGrid items={group.items} lang={lang} isDiningMode={true} />
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
                      <MenuGrid items={group.items} lang={lang} isDiningMode={true} />
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
                      <MenuGrid items={group.items} lang={lang} isDiningMode={true} />
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
                      <MenuGrid items={group.items} lang={lang} isDiningMode={true} />
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
                              <h3 className="font-sans text-xl font-black text-stone-900 tracking-tight" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
                                {group.name[lang]}
                              </h3>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white shadow-xs" style={{ backgroundColor: group.color }}>
                                {group.badge[lang]}
                              </span>
                              <div className="flex-1 h-px bg-stone-300/60" />
                            </div>
                            {group.desc && (
                              <p className="text-stone-600 text-xs sm:text-sm mt-1.5 font-light italic leading-relaxed max-w-3xl" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
                                {group.desc[lang]}
                              </p>
                            )}
                          </div>
                          <MenuGrid items={group.items} lang={lang} isDiningMode={true} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center text-stone-500 space-y-3 bg-white/60 rounded-3xl border border-stone-200 p-8">
                      <Wine className="w-12 h-12 mx-auto text-stone-400 stroke-1" />
                      <p className="text-sm font-semibold">{WINE_FILTER_LABELS[lang].noWinesFound}</p>
                      <button
                        type="button"
                        onClick={() => { setSelectedWineType('all'); setSelectedWineCountry('all'); }}
                        className="px-4 py-2 bg-[#8B1E1E] text-white text-xs font-bold rounded-xl shadow cursor-pointer hover:bg-[#701616]"
                      >
                        {WINE_FILTER_LABELS[lang].resetFilters}
                      </button>
                    </div>
                  )
                ) : (
                  filteredCategoryItems.length > 0 ? (
                    <MenuGrid items={filteredCategoryItems} lang={lang} isDiningMode={true} />
                  ) : (
                    <div className="py-16 text-center text-stone-500 space-y-3 bg-white/60 rounded-3xl border border-stone-200 p-8">
                      <Wine className="w-12 h-12 mx-auto text-stone-400 stroke-1" />
                      <p className="text-sm font-semibold">{WINE_FILTER_LABELS[lang].noWinesFound}</p>
                      <button
                        type="button"
                        onClick={() => { setSelectedWineType('all'); setSelectedWineCountry('all'); }}
                        className="px-4 py-2 bg-[#8B1E1E] text-white text-xs font-bold rounded-xl shadow cursor-pointer hover:bg-[#701616]"
                      >
                        {WINE_FILTER_LABELS[lang].resetFilters}
                      </button>
                    </div>
                  )
                )
              ) : (
                <MenuGrid items={filteredCategoryItems} lang={lang} isDiningMode={true} />
              )}
            </div>

            {/* Compliance & Staff Footer */}
            <footer className="mt-16 pt-8 pb-20 border-t border-stone-300/80 text-center">
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs font-semibold text-stone-500 mb-3">
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
                  href="/"
                  className="hover:text-stone-800 transition-colors inline-flex items-center gap-1"
                >
                  🍕 {lang === 'IT' ? 'Sito Delivery Ufficiale' : lang === 'TH' ? 'เว็บไซต์จัดส่ง' : lang === 'DE' ? 'Delivery Website' : 'Delivery Website'}
                </a>
              </div>
              <p className="text-[11px] text-stone-500">
                © {new Date().getFullYear()} Flower Power Pizza Ranong · Dining Tablet Mode (-5% Privilege).
              </p>
            </footer>
          </main>

          {/* Edge-Hugger Lateral Floating Cart Tab (Right side, identical to official delivery site) */}
          {cartCount > 0 && (
            <aside
              aria-label={lang === 'TH' ? 'รถเข็นของคุณ' : lang === 'IT' ? 'Il tuo carrello tavolo' : 'Your table cart'}
              className="fixed right-0 top-[58%] -translate-y-1/2 z-40"
              onMouseEnter={() => setIsCartTabExpanded(true)}
              onMouseLeave={() => setIsCartTabExpanded(false)}
            >
              <button
                type="button"
                onClick={handleCartTabClick}
                id="floating-edge-cart-btn"
                aria-label={`${cartCount} items in table cart, total ${discountedTotal} Baht`}
                className={`group flex items-center bg-gradient-to-l from-[#721818] via-[#8B1E1E] to-[#9e2222] text-white shadow-2xl rounded-l-full border-l border-y border-amber-300/50 hover:border-amber-300 transition-all duration-300 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                  isCartTabExpanded
                    ? 'pl-3 pr-2.5 py-2 sm:py-2.5'
                    : 'pl-2 pr-1 py-1.5 sm:py-2'
                }`}
                style={{
                  boxShadow: '-3px 4px 16px rgba(139, 30, 30, 0.45), 0 2px 6px rgba(0, 0, 0, 0.25)',
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
                    {cartCount}
                  </span>
                </div>

                {/* Expandable Details: Price & 5% Dining Privilege (Smooth sliding reveal) */}
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
                        <span>{discountedTotal}</span>
                        <span
                          className="font-black text-[10px] text-amber-300 select-none"
                          style={{ fontFamily: 'Prompt, Kanit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                        >
                          ฿
                        </span>
                      </span>
                    </div>

                    {/* 5% Dining Privilege Badge */}
                    <div className="text-[9px] font-extrabold text-emerald-300 inline-flex items-center justify-end gap-1">
                      <Sparkles size={10} className="text-amber-300" />
                      <span>
                        {lang === 'IT' ? 'Sconto -5% Tavolo Attivo' :
                         lang === 'TH' ? 'ลด 5% สั่งที่โต๊ะ' :
                         lang === 'DE' ? '5% Tisch-Rabatt Aktiv' :
                         '5% Table Discount Active'}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            </aside>
          )}

          {/* RICH CART DRAWER (Shows products, pairings/recommendations, edit quantity, and 5% table discount) */}
          <CartDrawer
            onCheckout={() => setIsCheckoutModalOpen(true)}
            isDiningMode={true}
            tableNumber={currentTable}
            lang={lang}
            onSelectCategory={(catId) => {
              setActiveCategoryId(catId);
              window.scrollTo({ top: 380, behavior: 'smooth' });
            }}
          />

      {/* DEDICATED TABLE CHECKOUT MODAL */}
      <DiningCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onSuccess={() => {
          setIsCheckoutModalOpen(false);
          if (!isGuestMobile) {
            setIsTableSelected(false);
            setCurrentTable('');
          }
          liveCartControllerRef.current?.broadcastClear();
          clearCart();
          fetchActiveDineInOrders();
        }}
        initialTable={currentTable}
        lang={lang}
        existingOrderId={currentTable ? (activeTableOrderMap[getCanonicalTableKey(currentTable)]?.[0]?.id || null) : null}
      />

      {/* TABLE SETTLEMENT & BILL CLOSING MODAL */}
      <TableSettlementModal
        isOpen={isSettlementModalOpen}
        onClose={() => setIsSettlementModalOpen(false)}
        tableKey={currentTable}
        ordersForTable={currentTable ? (activeTableOrderMap[getCanonicalTableKey(currentTable)] || []) : []}
        lang={lang}
        onSettled={() => {
          setIsSettlementModalOpen(false);
          if (isGuestMobile) {
            setIsGuestSettled(true);
          } else {
            setIsTableSelected(false);
            setCurrentTable('');
          }
          liveCartControllerRef.current?.broadcastClear();
          clearCart();
          fetchActiveDineInOrders();
        }}
      />

      {/* DYNAMIC QR CODE MODAL FOR TABLE GUESTS */}
      <DiningQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        tableKey={currentTable}
        sessionToken={currentSession?.token || ''}
        lang={lang}
      />

      {/* LUXURY 16 TABLE QR STUDIO & BULK PRINT GENERATOR */}
      <DiningTableQrStudio
        isOpen={isQrStudioOpen}
        onClose={() => setIsQrStudioOpen(false)}
      />
    </div>
  );
}

export default function DiningTabletSite() {
  return (
    <DiningAdminAuth>
      {(_session, handleLogout) => (
        <DiningTabletSiteContent onLogout={handleLogout} />
      )}
    </DiningAdminAuth>
  );
}
