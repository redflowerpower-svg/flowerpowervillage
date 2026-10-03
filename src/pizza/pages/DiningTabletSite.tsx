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
  Lock,
  LogOut,
  Gift,
  Plus,
  Minus,
  X
} from 'lucide-react';
import { menuData, type MenuItem } from '../data/menuData';
import CategoryTabs from '../components/CategoryTabs';
import MenuGrid from '../components/MenuGrid';
import { useCartStore, calcItemTotal } from '../store/cartStore';
import { INITIAL_WINE_COLLECTION, WINE_COUNTRY_OPTIONS, resolveWineCategoryType, sortWinesByCountryOrder, getCountryRank, WineCardData } from '../data/wineData';
import { fetchCloudWineCollection } from '../data/wineCloudService';
import { useLanguageStore } from '../store/languageStore';
import { SUPPORTED_LANGUAGES, LANGUAGE_METAS, Language } from '../config/languages';
import { getDietaryType, type DietaryType } from '../utils/dietary';
import { DiningCheckoutModal } from '../components/DiningCheckoutModal';
import CartDrawer from '../components/CartDrawer';
import PizzaSlideshow from '../../components/PizzaSlideshow';
import { supabase } from '../../lib/supabase';

const DINING_TABLES = [
  'Tavolo 1',
  'Tavolo 2',
  'Tavolo 3',
  'Tavolo 4',
  'Tavolo 5',
  'Tavolo 6',
  'Tavolo 7',
  'Tavolo 8',
  'Tavolo 9',
  'Tavolo 10',
  'Tavolo 11',
  'Tavolo 12',
  'Cliente 1',
  'Cliente 2',
  'Cliente 3',
  'Cliente 4',
];

const I18N_TABLE_PICKER: Record<Language, {
  title: string;
  subtitle: string;
  desc: string;
  tablesHeading: string;
  freeLabel: string;
  activeLabel: string;
  freeCard: string;
  activeCardPrefix: string;
  customLabel: string;
  customPlaceholder: string;
  enterBtn: string;
}> = {
  IT: {
    title: 'Flower Power Pizza Dining',
    subtitle: 'Seleziona il tuo Tavolo o Cliente',
    desc: 'Tocca la tua postazione per accedere al menu completo con lo sconto del 5% al tavolo applicato a tutte le portate.',
    tablesHeading: 'Tavoli della Sala & Clienti',
    freeLabel: 'Libero',
    activeLabel: 'Ordine in corso',
    freeCard: 'Nuovo Ordine',
    activeCardPrefix: 'Conto Aperto:',
    customLabel: 'Oppure Inserimento Postazione Libera',
    customPlaceholder: 'es. Terrazza 3 / Giardino / Bancone',
    enterBtn: 'Entra nel Menu'
  },
  EN: {
    title: 'Flower Power Pizza Dining',
    subtitle: 'Select Table or Guest Station',
    desc: 'Touch your table or station to access the full menu with 5% table discount applied to all dishes.',
    tablesHeading: 'Dining Tables & Guest Stations',
    freeLabel: 'Available',
    activeLabel: 'Active Order',
    freeCard: 'New Order',
    activeCardPrefix: 'Open Tab:',
    customLabel: 'Or Enter Custom Table / Station',
    customPlaceholder: 'e.g. Terrace 3 / Garden / Counter',
    enterBtn: 'Access Menu'
  },
  TH: {
    title: 'Flower Power Pizza Dining',
    subtitle: 'เลือกโต๊ะอาหารหรือหมายเลขลูกค้าเพื่อเริ่มต้น',
    desc: 'แตะที่โต๊ะของคุณเพื่อเปิดดูเมนูอาหารพร้อมรับส่วนลด 5% ทุกรายการทันที',
    tablesHeading: 'โต๊ะอาหารและที่นั่งลูกค้า',
    freeLabel: 'ว่าง / เริ่มใหม่',
    activeLabel: 'มีออเดอร์ค้างอยู่',
    freeCard: 'ออเดอร์ใหม่',
    activeCardPrefix: 'ยอดค้างชำระ:',
    customLabel: 'หรือระบุชื่อโต๊ะ / ที่นั่งเอง',
    customPlaceholder: 'เช่น ริมระเบียง 3 / โซนสวน / เคาน์เตอร์',
    enterBtn: 'เข้าสู่เมนู'
  },
  DE: {
    title: 'Flower Power Pizza Dining',
    subtitle: 'Wählen Sie Ihren Tisch oder Kunden',
    desc: 'Tippen Sie auf Ihren Tisch, um das Menü mit 5% Tisch-Rabatt auf alle Gerichte zu öffnen.',
    tablesHeading: 'Tische & Gäste-Stationen',
    freeLabel: 'Frei',
    activeLabel: 'Aktive Bestellung',
    freeCard: 'Neue Bestellung',
    activeCardPrefix: 'Offener Tisch:',
    customLabel: 'Oder Freie Tischnummer Eingeben',
    customPlaceholder: 'z.B. Terrasse 3 / Garten / Bar',
    enterBtn: 'Speisekarte öffnen'
  }
};

const LOCATION_BY_LANG: Record<Language, string> = {
  IT: 'RANONG, THAILANDIA',
  EN: 'RANONG, THAILAND',
  TH: 'ระนอง, ประเทศไทย',
  DE: 'RANONG, THAILAND'
};

const categoryDetails: Record<string, Record<Language, { name: string; desc: string }>> = {
  'daily-specials': {
    IT: { name: 'Specialità del Giorno', desc: 'Creazioni esclusive e piatti speciali preparati dal nostro chef con ingredienti freschi' },
    EN: { name: 'Daily Specials', desc: 'Exclusive daily creations and seasonal specialties freshly prepared by our Italian chef' },
    TH: { name: 'เมนูพิเศษประจำวัน', desc: 'เมนูพิเศษประจำวันรังสรรค์โดยเชฟชาวอิตาเลียน ด้วยวัตถุดิบสดใหม่ตามฤดูกาล' },
    DE: { name: 'Tagesempfehlungen', desc: 'Täglich wechselnde Spezialitäten und saisonale Gerichte unseres Chefkochs' }
  },
  'traditional-italian-pizza': {
    IT: { name: 'Pizze Classiche', desc: 'Impasto a lenta lievitazione naturale 48h con farine 100% italiane' },
    EN: { name: 'Classic Pizzas', desc: 'Slow-fermented Italian dough (48h) with 100% Italian flour' },
    TH: { name: 'พิซซ่าอิตาเลียนคลาสสิก', desc: 'แป้งหมักธรรมชาติ 48 ชม. ใช้วัตถุดิบนำเข้าจากอิตาลี' },
    DE: { name: 'Klassische Pizzen', desc: 'Langsam fermentierter Teig (48h) aus 100% italienischem Mehl' }
  },
  'pasta': {
    IT: { name: 'Primi Piatti & Pasta', desc: 'Pasta artigianale con ricette tradizionali e sughi freschi fatti in casa' },
    EN: { name: 'Pasta Dishes', desc: 'Authentic artisan pasta made fresh with classic homemade Italian sauces' },
    TH: { name: 'พาสต้าโฮมเมด', desc: 'พาสต้าเส้นสดปรุงรสเข้มข้นสไตล์อิตาเลียนแท้' },
    DE: { name: 'Pasta-Gerichte', desc: 'Frische hausgemachte Pasta mit traditionellen italienischen Saucen' }
  },
  'italian-salads': {
    IT: { name: 'Insalate Italiane', desc: 'Insalate fresche con verdure croccanti e condimenti mediterranei' },
    EN: { name: 'Italian Salads', desc: 'Fresh crispy salads with Mediterranean dressings' },
    TH: { name: 'สลัดสไตล์อิตาเลียน', desc: 'สลัดผักสดกรอบเพื่อสุขภาพ' },
    DE: { name: 'Italienische Salate', desc: 'Frische Salate mit mediterranen Dressings' }
  },
  'pizza-sandwich': {
    IT: { name: 'Panuozzi & Pizza Sandwich', desc: 'Panuozzo napoletano cotto al forno a legna e farcito con salumi e mozzarella' },
    EN: { name: 'Pizza Sandwiches', desc: 'Wood-fired oven folded pizza sandwiches stuffed with fine Italian ingredients' },
    TH: { name: 'พิซซ่าแซนด์วิช', desc: 'แป้งพิซซ่าอบสดใหม่สอดไส้วัตถุดิบพรีเมียม' },
    DE: { name: 'Pizza-Sandwiches', desc: 'Im Holzofen gebackene gefüllte Pizza-Sandwiches' }
  },
  'pizza-burgers': {
    IT: { name: 'Pizza Burger & Fries', desc: 'Burger saporiti con pane pizza speciale, serviti con patatine fritte' },
    EN: { name: 'Pizza Burgers & Fries', desc: 'Juicy burgers wrapped in artisan pizza crust, served with french fries' },
    TH: { name: 'พิซซ่าเบอร์เกอร์และเฟรนช์ฟรายส์', desc: 'เบอร์เกอร์แป้งพิซซ่าเสิร์ฟพร้อมเฟรนช์ฟรายส์' },
    DE: { name: 'Pizza-Burger & Pommes', desc: 'Saftige Burger im Pizzateig mit knusprigen Pommes' }
  },
  'french-fries': {
    IT: { name: 'Fritti & Sfizi', desc: 'Patatine fritte dorate, anelli di cipolla e crocchette calde' },
    EN: { name: 'French Fries & Bites', desc: 'Crispy golden fries, onion rings, and delicious snacks' },
    TH: { name: 'เฟรนช์ฟรายส์และของทานเล่น', desc: 'เฟรนช์ฟรายส์ทอดกรอบและของว่าง' },
    DE: { name: 'Pommes & Snacks', desc: 'Goldene Pommes frites und knusprige Snacks' }
  },
  'desserts': {
    IT: { name: 'Dolci & Dessert', desc: 'Tiramisù della casa, torte del giorno, crepes e affogato al caffè' },
    EN: { name: 'Desserts & Sweets', desc: 'Homemade Tiramisù, cake of the day, crepes, and affogato' },
    TH: { name: 'ของหวานและเบเกอรี่', desc: 'ทีรามิสูโฮมเมดและของหวานสไตล์อิตาเลียน' },
    DE: { name: 'Desserts & Süßspeisen', desc: 'Hausgemachtes Tiramisù, Kuchen, Crêpes und Affogato' }
  },
  'breakfast-and-snacks': {
    IT: { name: 'Colazione & Toast', desc: 'Colazione italiana, toast caldi, uova e macedonia di frutta' },
    EN: { name: 'Breakfast & Snacks', desc: 'Italian breakfast, toast, eggs, and fresh fruit salad' },
    TH: { name: 'อาหารเช้าและโทสต์', desc: 'เซ็ตอาหารเช้า โทสต์ และผลไม้สด' },
    DE: { name: 'Frühstück & Toast', desc: 'Italienisches Frühstück, Toast, Eier und frischer Obstsalat' }
  },
  'coffee-shop': {
    IT: { name: 'Caffetteria & Tè', desc: 'Vero espresso italiano, cappuccino cremoso e pregiati tè' },
    EN: { name: 'Coffee Shop & Tea', desc: 'Authentic Italian espresso, creamy cappuccino, and fine teas' },
    TH: { name: 'กาแฟสดและชา', desc: 'กาแฟเอสเปรสโซอิตาเลียนและชาคัดพิเศษ' },
    DE: { name: 'Kaffee & Tee', desc: 'Echter italienischer Espresso, Cappuccino und feine Tees' }
  },
  'fruit-drinks': {
    IT: { name: 'Frullati & Smoothie', desc: 'Frutta fresca tropicale frullata al momento, smoothie e frappè' },
    EN: { name: 'Fruit Drinks & Shakes', desc: 'Fresh tropical fruit shakes, smoothies, and creamy frappés' },
    TH: { name: 'น้ำผลไม้ปั่นและสมูทตี้', desc: 'ผลไม้สดปั่น สดชื่น ดีต่อสุขภาพ' },
    DE: { name: 'Frucht-Shakes & Smoothies', desc: 'Frische tropische Frucht-Shakes und cremige Frappés' }
  },
  'soft-drinks': {
    IT: { name: 'Bibite & Acqua', desc: 'Bibite rinfrescanti in lattina, acqua minerale naturale e soda servite fredde' },
    EN: { name: 'Soft Drinks & Water', desc: 'Chilled canned soft drinks, mineral water, and soda water' },
    TH: { name: 'น้ำอัดลมและน้ำดื่ม', desc: 'น้ำอัดลมกระป๋อง น้ำดื่ม และโซดาเย็นสดชื่น' },
    DE: { name: 'Erfrischungsgetränke & Wasser', desc: 'Kühle Softdrinks in der Dose, Mineralwasser und Soda' }
  },
  'beers': {
    IT: { name: 'Birre Fresche', desc: 'Le migliori marche di birra in bottiglia grande e piccola, servite ghiacciate' },
    EN: { name: 'Chilled Beers', desc: 'Ice-cold premium bottled beers, available in large and small sizes' },
    TH: { name: 'เบียร์ขวดเย็นเจี๊ยบ', desc: 'เบียร์ขวดเย็นเจี๊ยบคุณภาพดี มีให้เลือกทั้งขวดใหญ่และขวดเล็ก' },
    DE: { name: 'Kühles Bier', desc: 'Eiskalte Flaschenbiere beliebter Marken in großen und kleinen Flaschen' }
  },
  'wines': {
    IT: { name: 'Carta dei Vini Pregiati', desc: 'Selezione esclusiva di vini italiani e internazionali, perfetti per esaltare ogni piatto' },
    EN: { name: 'Fine Wine Collection', desc: 'Exclusive selection of Italian and international fine wines, perfectly pairing each dish' },
    TH: { name: 'ไวน์คัดพิเศษ', desc: 'คัดสรรไวน์อิตาเลียนและไวน์นานาชาติชั้นเลิศเพื่อยกระดับมื้ออาหารของคุณ' },
    DE: { name: 'Weinkarte', desc: 'Exklusive Auswahl an italienischen und internationalen Weinen, perfekt abgestimmt auf jedes Gericht' }
  }
};

const DAILY_SPECIALS_SECTIONS = [
  {
    id: 'pasta',
    name: {
      IT: 'Primi Piatti, Frutti di Mare & Paste Ripiene',
      EN: 'First Courses, Seafood & Stuffed Pasta',
      TH: 'พาสต้าและราวิโอลีโฮมเมด',
      DE: 'Pastagerichte & Gefüllte Nudeln'
    },
    desc: {
      IT: 'Spaghetti allo Scoglio, Polpa di Granchio, Penne al Salmone, Tagliatelle al Nero di Seppia e Ravioli artigianali con formati a scelta.',
      EN: 'Seafood Spaghetti, Fresh Crab Meat, Salmon Penne, Squid Ink Tagliatelle, and artisanal Ravioli with your choice of pasta format.',
      TH: 'สปาเก็ตตี้ซีฟู้ดสดใหม่ ปูม้า แซลมอน ตัลยาเตลเล่หมึกดำ และราวิโอลีโฮมเมด เลือกเส้นและรูปแบบได้ตามใจชอบ',
      DE: 'Meeresfrüchte-Spaghetti, Krabbenfleisch, Lachs-Penne, Tintenfisch-Tagliatelle und hausgemachte Ravioli mit wählbaren Formaten.'
    }
  },
  {
    id: 'traditional-italian-pizza',
    name: {
      IT: 'Pizze Gourmet Speciali',
      EN: 'Gourmet Special Pizzas',
      TH: 'พิซซ่ากูร์เมต์สูตรพิเศษ',
      DE: 'Gourmet-Spezialpizzen'
    },
    desc: {
      IT: 'Pizze artigianali a lievitazione naturale con polpa di granchio fresca o salsiccia nostrana e stilacci.',
      EN: 'Artisanal sourdough pizzas topped with fresh blue crab meat or Italian sausage and sautéed stilacci greens.',
      TH: 'พิซซ่าแป้งหมักยีสต์ธรรมชาติ หน้าเนื้อปูม้าสด และไส้กรอกหมูอิตาเลียนกับผักสตีลัชชี',
      DE: 'Handgemachte Sauerteigpizzen belegt mit frischem Krabbenfleisch oder italienischer Salsiccia und Stilacci-Gemüse.'
    }
  },
  {
    id: 'daily-specials',
    name: {
      IT: 'Secondi Piatti Tradizionali',
      EN: 'Traditional Main Courses',
      TH: 'อาหารจานหลักแบบดั้งเดิม',
      DE: 'Traditionelle Hauptgerichte'
    },
    desc: {
      IT: 'Grandi classici e torte salate della tradizione italiana preparati al momento: Cotoletta alla Milanese, Cotechino artigianale con Purè e autentica Torta Pasqualina ligure.',
      EN: 'Italian culinary classics & savory pies made fresh: Crispy Milanese Cutlet with fries, Artisanal Cotechino with mashed potatoes, and Ligurian Torta Pasqualina.',
      TH: 'เมนูคลาสสิกและพายอบสไตล์อิตาเลียน: มิลานีสคัตเล็ตหมูทอดกรอบ ไส้กรอกโคเตคิโนโบราณพร้อมมันบด และพายตอร์ตา ปาสควาลินา',
      DE: 'Italienische Klassiker & herzhafte Torten: Knuspriges Mailänder Schnitzel, traditioneller Cotechino mit Kartoffelpüree und ligurische Torta Pasqualina.'
    }
  },
  {
    id: 'pizza-sandwich',
    name: {
      IT: 'Focacce Artigianali',
      EN: 'Artisanal Focaccias',
      TH: 'ฟอคคาเซียอบสดสไตล์อิตาเลียน',
      DE: 'Hausgemachte Focaccia'
    },
    desc: {
      IT: 'Focacce fragranti da impasto pizza cotte al forno e farcite con i migliori salumi italiani selezionati: Finocchiona, Pancetta arrotolata, Porchetta, Prosciutto Cotto e Salame.',
      EN: 'Fragrant oven-baked pizza dough focaccias filled with premium Italian cold cuts: Finocchiona, Rolled Pancetta, Porchetta, Cooked Ham, and Salami.',
      TH: 'ฟอคคาเซียอบสดใหม่กรอบนอกนุ่มใน สอดไส้โคลด์คัทอิตาเลียนชั้นเลิศ: ฟินอคคิโอนา, ปานเชตตา, พอร์เคตตา, แฮมสุก และซาลามี',
      DE: 'Ofenfrische Focaccia gefüllt mit feinsten italienischen Wurstspezialitäten: Finocchiona, gerollte Pancetta, Porchetta, Kochschinken und Salami.'
    }
  }
];

const FOCACCIA_SANDWICH_SECTIONS = [
  {
    id: 'focacce',
    name: {
      IT: 'Focacce Artigianali',
      EN: 'Artisanal Focaccias',
      TH: 'ฟอคคาเซียอบสดสไตล์อิตาเลียน',
      DE: 'Hausgemachte Focaccia'
    },
    desc: {
      IT: 'Focacce fragranti da impasto pizza cotte al forno e farcite con i migliori salumi italiani selezionati: Finocchiona toscana, Pancetta arrotolata, Porchetta romana, Prosciutto Cotto e Salame.',
      EN: 'Fragrant oven-baked pizza dough focaccias filled with premium Italian cold cuts: Tuscan Finocchiona, Rolled Pancetta, Roasted Porchetta, Cooked Ham, and Salami.',
      TH: 'ฟอคคาเซียแป้งพิซซ่าอบสดใหม่สไตล์โฮมเมด สอดไส้โคลด์คัทอิตาเลียนพรีเมียม: ฟินอคคิโอนา, ปานเชตตา, พอร์เคตตา, แฮมสุก และซาลามี',
      DE: 'Ofenfrische Pizza-Focaccia gefüllt mit feinsten italienischen Spezialitäten: Toskanische Finocchiona, gerollte Pancetta, Porchetta, Kochschinken und Salami.'
    }
  },
  {
    id: 'pizza-sandwiches',
    name: {
      IT: 'Pizza Sandwiches',
      EN: 'Pizza Sandwiches',
      TH: 'พิตซ่าแซนด์วิช',
      DE: 'Pizza Sandwiches'
    },
    desc: {
      IT: 'Gustosi panini racchiusi nel nostro impasto pizza dorato e croccante con formaggio filante, pomodoro fresco e verdure croccanti.',
      EN: 'Flavorful sandwiches wrapped in our golden, crispy pizza crust with melted cheese, fresh tomatoes, and crisp lettuce.',
      TH: 'แซนด์วิชแป้งพิซซ่ากรอบนอกนุ่มใน สอดไส้ชีสเยิ้มๆ มะเขือเทศสด และผักสลัดกรอบอร่อย',
      DE: 'Köstliche Sandwiches in knusprigem Pizzateig mit geschmolzenem Käse, frischen Tomaten und knackigem Salat.'
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
      DE: 'Spezialitäten & Gefüllte Pasta' 
    }, 
    desc: {
      IT: 'Creazioni di mare e di terra della nostra cuoca: Spaghetti allo Scoglio, Polpa di Granchio, Penne al Salmone, Tagliatelle al Nero di Seppia e Ravioli artigianali ripieni.',
      EN: 'Seafood and artisan specialties: Seafood Spaghetti, Blue Crab Meat, Salmon Penne, Squid Ink Tagliatelle, and handmade stuffed Ravioli.',
      TH: 'พาสต้าซีฟู้ดสดใหม่ ปูม้า แซลมอน ตัลยาเตลเล่หมึกดำ และราวิโอลีโฮมเมดสอดไส้สูตรดั้งเดิม',
      DE: 'Meeresfrüchte- und Spezialitätenkreationen: Frutti di Mare Spaghetti, Krabbenfleisch, Lachs-Penne, Tintenfisch-Tagliatelle und hausgemachte gefüllte Ravioli.'
    }, 
    pattern: 'special' 
  },
  { 
    id: 'aglio-olio', 
    name: { 
      IT: 'Aglio, Olio e Peperoncino', 
      EN: 'Garlic, Oil & Chili', 
      TH: 'อากลิโอ โอลิโอ พริกแห้ง', 
      DE: 'Knoblauch, Öl & Chili' 
    }, 
    desc: {
      IT: 'Un classico italiano semplice e saporito preparato con aglio, olio extravergine d\'oliva e peperoncino, con un gusto intenso e aromatico che delizia ogni singolo morso.',
      EN: 'A simple and flavorful Italian classic made with garlic, olive oil, and chili, with an intense, aromatic taste that delights every single bite',
      TH: 'พาสต้าผัดกระเทียม น้ำมันมะกอก และพริกแห้ง รสชาติเข้มข้นจัดจ้านสไตล์อิตาเลียน',
      DE: 'Ein einfacher und geschmackvoller italienischer Klassiker aus Knoblauch, Olivenöl und Chili, mit einem intensiven, aromatischen Geschmack, der jeden Bissen begeistert.'
    }, 
    pattern: 'Garlic, Oil' 
  },
  { 
    id: 'pomodoro', 
    name: { 
      IT: 'Salsa di Pomodoro', 
      EN: 'Tomato Sauce', 
      TH: 'ซอสมะเขือเทศ', 
      DE: 'Tomatensauce' 
    }, 
    desc: {
      IT: 'Salsa di pomodoro all\'italiana preparata con pomodori maturi, olio d\'oliva, aglio o cipolla, sale e basilico. È il cuore pulsante della cucina italiana.',
      EN: 'Italian tomato sauce made with ripe tomatoes, olive oil, garlic or onion, salt, and basil. It\'s the heart of Italian cuisine',
      TH: 'ซอสมะเขือเทศอิตาเลียนรสเข้มข้น เคี่ยวกับกระเทียม หอมใหญ่ และใบโหระพาอิตาเลียน',
      DE: 'Italienische Tomatensauce aus reifen Tomaten, Olivenöl, Knoblauch oder Zwiebeln, Salz und Basilikum. Sie ist das Herz der italienischen Küche.'
    }, 
    pattern: 'Tomato Sauce' 
  },
  { 
    id: 'pesto', 
    name: { 
      IT: 'Pesto Genovese', 
      EN: 'Pesto Genovese', 
      TH: 'ซอสเพสโต้', 
      DE: 'Pesto Genovese' 
    }, 
    desc: {
      IT: 'Salsa fresca al basilico con anacardi, parmigiano, aglio e olio d\'oliva, con un sapore ricco e aromatico che evoca i profumi di Genova.',
      EN: 'Fresh basil sauce with cashews, parmesan cheese, garlic, and olive oil, with a rich, aromatic flavor that evokes the scent of Genoa',
      TH: 'ซอสใบโหระพาอิตาเลียนปั่นสดใหม่ ใส่เม็ดมะม่วงหิมพานต์ พาเมซานชีส กระเทียม และน้ำมันมะกอก',
      DE: 'Frische Basilikumsauce mit Cashewnüssen, Parmesankäse, Knoblauch und Olivenöl, mit einem reichen, aromatischen Geschmack, der an Genua erinnert.'
    }, 
    pattern: 'Pesto Genovese' 
  },
  { 
    id: 'amatriciana', 
    name: { 
      IT: 'Salsa Amatriciana', 
      EN: 'Amatriciana', 
      TH: 'ซอสอามาริเชียนา', 
      DE: 'Amatriciana' 
    }, 
    desc: {
      IT: 'Salsa in stile romano con pomodoro, guanciale e pecorino, cotta lentamente per ottenere un sapore dolce e sapido bilanciato, un classico della tradizione italiana.',
      EN: 'Roman-style sauce with tomato, cured pork cheek, and pecorino, slowly cooked for a balanced sweet and savory flavor, a classic of Italian tradition',
      TH: 'ซอสมะเขือเทศเข้มข้นปรุงรสด้วยเบคอน หอมใหญ่ และใบโหระพา รสชาติกลมกล่อม',
      DE: 'Römische Sauce mit Tomaten, gereifter Schweinebacke und Pecorino, langsam gekocht für einen ausgewogenen süß-salzigen Geschmack, ein Klassiker der italienischen Tradition.'
    }, 
    pattern: 'Amatriciana' 
  },
  { 
    id: 'bolognese', 
    name: { 
      IT: 'Salsa Ragù Bolognese', 
      EN: 'Bolognese Ragù', 
      TH: 'ซอสเนื้อโบโลเนส', 
      DE: 'Bolognese-Ragù' 
    }, 
    desc: {
      IT: 'Un ricco ragù cotto lentamente con carne macinata, pomodori, verdure e vino rosso. Un gusto pieno, avvolgente e irresistibile, simbolo della tradizione bolognese.',
      EN: 'A rich, slow-cooked sauce with minced meat, tomatoes, vegetables, and red wine. Full, enveloping, and irresistible flavor, a symbol of Bologna\'s tradition',
      TH: 'ซอสเนื้อสับเคี่ยวกับมะเขือเทศและเครื่องเทศอย่างช้าๆ รสชาติเข้มข้นสูตรดั้งเดิม',
      DE: 'Eine reichhaltige, langsam gekochte Sauce mit Hackfleisch, Tomaten, Gemüse und Rotwein. Voller, einhüllender und unwiderstehlicher Geschmack, ein Symbol der Tradition von Bologna.'
    }, 
    pattern: 'Bolognese Ragu' 
  },
  { 
    id: 'carbonara', 
    name: { 
      IT: 'Carbonara', 
      EN: 'Carbonara', 
      TH: 'ซอสคาร์โบนาร่า', 
      DE: 'Carbonara' 
    }, 
    desc: {
      IT: 'Uno dei piatti più amati d\'Italia, preparato con guanciale, uova fresche, pecorino romano e pepe nero. Cremoso e autentico, dal sapore ricco e tradizionale.',
      EN: 'One of Italy\'s most loved dishes, made with cured pork cheek, eggs, pecorino cheese, and black pepper. Creamy and authentic, with a rich, traditional flavor',
      TH: 'ซอสครีมคาร์โบนาร่าสูตรดั้งเดิม ใส่ไข่แดง พาเมซานชีส และเบคอนกรอบ',
      DE: 'Eines der beliebtesten Gerichte Italiens, zubereitet mit gereifter Schweinebacke, Eiern, Pecorino-Käse und schwarzem Pfeffer. Cremig und authentisch, mit einem reichen, traditionellen Geschmack.'
    }, 
    pattern: 'Carbonara' 
  },
  { 
    id: 'quattro-formaggi', 
    name: { 
      IT: 'Quattro Formaggi', 
      EN: 'Four Cheeses', 
      TH: 'ซอสโฟร์ชีส', 
      DE: 'Vier Käse' 
    }, 
    desc: {
      IT: 'Una cremosa miscela di quattro formaggi italiani accuratamente selezionati, fusi perfettamente insieme per creare un sapore ricco, deciso e avvolgente ad ogni morso.',
      EN: 'A creamy blend of four carefully selected Italian cheeses, melted together to create a rich, bold, and enveloping flavor with every bite',
      TH: 'ซอสโฟร์ชีสเข้มข้น ผสมผสานชีสอิตาเลียนพรีเมียม 4 ชนิด หอมมัน กลมกล่อมลงตัว',
      DE: 'Eine cremige Mischung aus vier sorgfältig ausgewählten italienischen Käsesorten, perfekt geschmolzen für einen reichen, kräftigen Geschmack.'
    }, 
    pattern: 'Four Cheeses' 
  },
  { 
    id: 'flower-power', 
    name: { 
      IT: 'Flower Power (Panna e Funghi)', 
      EN: 'Flower Power (Cream & Mushrooms)', 
      TH: 'ฟลาวเวอร์พาวเวอร์ (ครีมและเห็ด)', 
      DE: 'Flower Power (Sahne & Pilze)' 
    }, 
    desc: {
      IT: 'Una deliziosa salsa a base di panna fresca con succulenti funghi trifolati, dal sapore avvolgente e confortante per gli amanti della pasta cremosa.',
      EN: 'A delightful fresh cream sauce sautéed with juicy mushrooms, delivering a rich, comforting taste perfect for lovers of velvety pasta',
      TH: 'ซอสครีมเห็ดสูตรพิเศษของทางร้าน หอมครีมสดแท้และเห็ดผัด รสละมุนกลมกล่อม',
      DE: 'Eine köstliche frische Sahnesauce mit saftigen sautierten Pilzen, cremig und voll im Geschmack.'
    }, 
    pattern: 'Flower Power' 
  },
  { 
    id: 'lasagne', 
    name: { 
      IT: 'Lasagne al Forno', 
      EN: 'Oven-Baked Lasagna', 
      TH: 'ลาซานญ่าอบเตาถ่าน', 
      DE: 'Überbackene Lasagne' 
    }, 
    desc: {
      IT: 'Sfoglia di pasta all\'uovo stesa a mano, strati generosi di besciamella vellutata, saporito ragù o verdure fresche, gratinata con crosticina dorata e filante.',
      EN: 'Handcrafted fresh egg pasta sheets layered with velvety béchamel, savory ragù or fresh vegetables, baked to golden, bubbling perfection',
      TH: 'แผ่นแป้งลาซานญ่าทำสด เรียงชั้นด้วยซอสโบโลเนสเข้มข้น ซอสเบชาเมล และชีส อบจนหอมกรุ่น',
      DE: 'Handgemachte Eiernudelplatten geschichtet mit samtiger Béchamelsauce und herzhaftem Ragù, goldbraun und herrlich überbacken.'
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
  }
};

const WINE_TYPE_SECTIONS = [
  {
    id: 'red',
    name: { IT: 'Vini Rossi', EN: 'Red Wines', TH: 'ไวน์แดง', DE: 'Rotweine' },
    desc: {
      IT: 'Selezione di vini rossi strutturati, avvolgenti e armoniosi, ideali per accompagnare piatti saporiti, carni e pizze gourmet.',
      EN: 'Curated selection of structured, full-bodied red wines, tailored for savory dishes, meats, and gourmet pizzas.',
      TH: 'คัดสรรไวน์แดงรสชาตินุ่มละมุนและเข้มข้น เหมาะสำหรับทานคู่กับอาหารจานหลักและพิซซ่า',
      DE: 'Kuratierte Auswahl an strukturierten, vollmundigen Rotweinen, ideal zu herzhaften Gerichten, Fleisch und Pizza.'
    },
    badge: { IT: 'Corposi & Strutturati', EN: 'Full-Bodied', TH: 'เข้มข้น', DE: 'Vollmundig' },
    color: '#8b0000'
  },
  {
    id: 'white',
    name: { IT: 'Vini Bianchi', EN: 'White Wines', TH: 'ไวน์ขาว', DE: 'Weißweine' },
    desc: {
      IT: 'Vini bianchi freschi, minerali ed eleganti, ideali per aperitivi, antipasti, primi piatti e pesce.',
      EN: 'Fresh, mineral, and fragrant white wines, crafted to pair with appetizers, pastas, and seafood dishes.',
      TH: 'ไวน์ขาวสดชื่น กลิ่นหอมผลไม้และดอกไม้ เหมาะสำหรับดื่มเรียกน้ำย่อยและอาหารทะเล',
      DE: 'Frische, mineralische und elegante Weißweine, ideal zu Vorspeisen, Pasta und Fischgerichten.'
    },
    badge: { IT: 'Freschi & Minerali', EN: 'Crisp & Mineral', TH: 'สดชื่น', DE: 'Frisch & Mineralisch' },
    color: '#b45309'
  },
  {
    id: 'rose',
    name: { IT: 'Vini Rosati', EN: 'Rosé Wines', TH: 'ไวน์โรเซ่', DE: 'Roséweine' },
    desc: {
      IT: 'Sfumature floreali e fruttate con un profilo fresco e versatile, perfetto per aperitivi e pietanze leggere.',
      EN: 'Delicate floral and fruity notes with a crisp, balanced profile, perfect for warm evenings and light dining.',
      TH: 'ไวน์โรเซ่สีสวย กลิ่นหอมสดชื่น ดื่มง่าย สดชื่นในทุกช่วงเวลา',
      DE: 'Florale und fruchtige Noten mit herrlicher Frische, ideal für warme Abende und leichte Küche.'
    },
    badge: { IT: 'Floreali & Freschi', EN: 'Floral & Refreshing', TH: 'หอมละมุน', DE: 'Floral & Frisch' },
    color: '#db2777'
  },
  {
    id: 'sparkling',
    name: { IT: 'Spumanti', EN: 'Sparkling Wines', TH: 'สปาร์กลิงไวน์', DE: 'Schaumweine' },
    desc: {
      IT: 'Spumanti e prosecchi dal perlage fine e persistente, pensati per brindisi raffinati e momenti speciali.',
      EN: 'Sparkling wines and prosecco with fine, delicate perlage, crafted for celebrations and elegant toasts.',
      TH: 'สปาร์กลิงไวน์และโพรเซกโกชั้นเลิศ ฟองละเอียดนุ่มลิ้น เพื่อทุกช่วงเวลาพิเศษ',
      DE: 'Edle Schaumweine und Prosecco mit feiner Perlage für besondere Anlässe und stilvolle Momente.'
    },
    badge: { IT: 'Perlage & Prestigio', EN: 'Fine Perlage', TH: 'ฟองละเอียด', DE: 'Feine Perlage' },
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

export default function DiningTabletSite() {
  const { language: lang, setLanguage } = useLanguageStore();
  
  // Table Session State: Must select table before accessing menu
  const [currentTable, setCurrentTable] = useState<string>('');
  const [isTableSelected, setIsTableSelected] = useState<boolean>(false);
  const [customTableInput, setCustomTableInput] = useState<string>('');
  const [activeDineInOrders, setActiveDineInOrders] = useState<any[]>([]);
  const [tableNotification, setTableNotification] = useState<string>('');

  const fetchActiveDineInOrders = async () => {
    try {
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('pizza_orders')
        .select('id, table_number, total, status, payment_status, created_at, items')
        .eq('delivery_type', 'dine_in')
        .gte('created_at', twelveHoursAgo)
        .neq('status', 'cancelled')
        .neq('payment_status', 'paid_settled')
        .order('created_at', { ascending: false });

      if (data && !error) {
        setActiveDineInOrders(data);
      }
    } catch (err) {
      console.warn('Error fetching active dine-in orders:', err);
    }
  };

  useEffect(() => {
    fetchActiveDineInOrders();
    const interval = setInterval(fetchActiveDineInOrders, 12000);

    let bc: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel('pizza_orders_channel');
      bc.onmessage = (ev) => {
        if (ev.data?.type === 'NEW_ORDER' || ev.data?.type === 'ORDER_COMPLETED' || ev.data?.type === 'ORDER_CANCELLED') {
          fetchActiveDineInOrders();
        }
      };
    }

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
    };
  }, []);

  const activeTableOrderMap = useMemo(() => {
    const map: Record<string, { count: number; total: number; latestOrderId: string; itemsCount: number }> = {};
    activeDineInOrders.forEach((ord: any) => {
      const tbl = (ord.table_number || '').trim();
      if (!tbl) return;
      if (!map[tbl]) {
        map[tbl] = { count: 0, total: 0, latestOrderId: String(ord.id), itemsCount: 0 };
      }
      map[tbl].count += 1;
      map[tbl].total += (ord.total || 0);
      map[tbl].itemsCount += Array.isArray(ord.items) ? ord.items.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0) : 0;
    });
    return map;
  }, [activeDineInOrders]);

  const handleSelectTable = (tableName: string) => {
    const trimmed = tableName.trim();
    if (!trimmed) return;
    setCurrentTable(trimmed);
    setIsTableSelected(true);
    try { localStorage.setItem('fp_dining_active_table', trimmed); } catch {}

    const existing = activeTableOrderMap[trimmed];
    if (existing) {
      setTableNotification(`Tavolo attivo: ${existing.count} ${existing.count === 1 ? 'ordine' : 'ordini'} in corso (Conto attuale: ${existing.total} ฿). I nuovi piatti selezionati verranno aggiunti a questa sessione.`);
    } else {
      useCartStore.getState().clearCart();
      setTableNotification('');
    }
  };

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
  const [selectedWineType, setSelectedWineType] = useState<'all' | 'red' | 'white' | 'rose' | 'sparkling'>('all');
  const [selectedWineCountry, setSelectedWineCountry] = useState<string>('all');

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
        .filter((w: any) => w.isAvailable !== false && !deletedSet.has(w.id))
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
  }, [lang, activeCategoryId, cloudWines]);

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
  const { getCount, getTotal, openCart, items } = useCartStore();
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

  // Sync daily specials overrides from admin dashboard
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
        const overrides = JSON.parse(localStorage.getItem('fp_pizza_daily_specials_overrides') || '{}');
        setDailySpecialsOverrides(overrides);
      } catch {}
    };
    window.addEventListener('storage', syncFromStorage);

    let bc: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel('fp_pizza_menu_sync');
      bc.onmessage = (ev) => {
        if (ev.data?.type === 'DAILY_SPECIAL_TOGGLE') {
          syncFromStorage();
        }
      };
    }

    supabase.from('pizza_menu_items').select('id, is_daily_special').then(({ data }) => {
      if (data && Array.isArray(data)) {
        setDailySpecialsOverrides(prev => {
          const next = { ...prev };
          data.forEach((item: any) => {
            if (item.is_daily_special !== undefined && item.is_daily_special !== null) {
              next[item.id] = item.is_daily_special;
            }
          });
          try { localStorage.setItem('fp_pizza_daily_specials_overrides', JSON.stringify(next)); } catch {}
          return next;
        });
      }
    });

    return () => {
      window.removeEventListener('storage', syncFromStorage);
      if (bc) bc.close();
    };
  }, []);

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
    const raw = activeCategory.items;
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
  }).filter(group => group.items.length > 0) : [];

  return (
    <div className="min-h-screen bg-[#e7e5e4] text-stone-900 pb-16 antialiased" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
      
      {/* TOP FIXED BAR FOR DINING TABLET */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-md border-b border-amber-400/30 text-white px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-xl">
        
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8B1E1E] to-[#5a1111] border border-amber-400/40 flex items-center justify-center shadow-md">
            <UtensilsCrossed className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <span className="font-black text-sm sm:text-base tracking-tight text-white block leading-none">
              Flower Power Dining
            </span>
            <span className="text-[10px] text-amber-400/90 font-bold uppercase tracking-wider block mt-0.5">
              Dining Tablet • Ranong
            </span>
          </div>
        </div>

        {/* Center: 1-Tap Table Switcher with -5% Discount */}
        <button
          type="button"
          onClick={() => { setIsTableSelected(false); setCustomTableInput(''); }}
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-amber-500/20 border border-amber-400/60 hover:border-amber-300 text-amber-300 font-extrabold text-xs sm:text-sm shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
          title="Tocca per cambiare tavolo"
        >
          <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate max-w-[130px] sm:max-w-none font-black">{currentTable || 'Seleziona Tavolo'}</span>
          <span className="text-[10px] text-amber-200/90 uppercase font-semibold hidden sm:inline">▼ Cambia</span>
          <span className="text-[9px] text-emerald-300 font-black ml-0.5 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-600/40">
            -5% AL TAVOLO
          </span>
        </button>

        {/* Right: Language Selector (All 4 Languages) */}
        <div className="flex items-center gap-1 p-1 bg-stone-900/90 rounded-xl border border-stone-800">
          {SUPPORTED_LANGUAGES.map(l => (
            <button
              key={l}
              type="button"
              onClick={() => setLanguage(l)}
              className={`py-1 px-2 rounded-lg text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                lang === l
                  ? 'bg-amber-400 text-stone-950 shadow scale-[1.03]'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <span>{LANGUAGE_METAS[l].flag}</span>
              <span className="uppercase text-[10.5px] font-mono">{l}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* MANDATORY TABLE SELECTION OVERLAY (When session not yet picked or changed) */}
      {!isTableSelected && (
        <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
          <div className="bg-stone-900 border-2 border-amber-400/50 rounded-3xl w-full max-w-2xl p-5 sm:p-7 text-white space-y-5 shadow-2xl max-h-[95vh] overflow-y-auto">
            
            {/* Top Language Bar (All 4 Languages) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">Lingua / Language / ภาษา</span>
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5 p-1 bg-stone-950 rounded-xl border border-stone-800">
                {SUPPORTED_LANGUAGES.map(l => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLanguage(l)}
                    className={`py-1.5 px-2.5 sm:px-3 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                      lang === l
                        ? 'bg-amber-400 text-stone-950 shadow-md scale-[1.03]'
                        : 'text-stone-400 hover:text-white hover:bg-stone-850'
                    }`}
                  >
                    <span className="text-sm sm:text-base">{LANGUAGE_METAS[l].flag}</span>
                    <span className="uppercase text-xs font-bold">{LANGUAGE_METAS[l].label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-[#8B1E1E] to-[#5a1111] border-2 border-amber-400/50 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                <UtensilsCrossed className="w-7 h-7 text-amber-300" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {I18N_TABLE_PICKER[lang]?.title || I18N_TABLE_PICKER.IT.title}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-widest">
                {I18N_TABLE_PICKER[lang]?.subtitle || I18N_TABLE_PICKER.IT.subtitle}
              </p>
              <p className="text-stone-400 text-xs max-w-md mx-auto leading-relaxed">
                {I18N_TABLE_PICKER[lang]?.desc || I18N_TABLE_PICKER.IT.desc}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-stone-300 uppercase tracking-wider mb-2.5">
                  <span>{I18N_TABLE_PICKER[lang]?.tablesHeading || I18N_TABLE_PICKER.IT.tablesHeading}</span>
                  <span className="text-[11px] text-stone-400 font-normal flex items-center gap-2">
                    <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> {I18N_TABLE_PICKER[lang]?.freeLabel || I18N_TABLE_PICKER.IT.freeLabel}</span>
                    <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> {I18N_TABLE_PICKER[lang]?.activeLabel || I18N_TABLE_PICKER.IT.activeLabel}</span>
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {DINING_TABLES.map(t => {
                    const activeInfo = activeTableOrderMap[t];
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleSelectTable(t)}
                        className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer border flex flex-col justify-between gap-2 relative overflow-hidden ${
                          activeInfo
                            ? 'bg-gradient-to-br from-amber-950/80 to-stone-900 border-amber-400/80 text-white shadow-lg hover:border-amber-300 hover:scale-[1.02]'
                            : 'bg-stone-950/80 border-stone-800 text-stone-200 hover:border-amber-400/50 hover:bg-stone-850 hover:scale-[1.02]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-black uppercase tracking-tight">{t}</span>
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${activeInfo ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
                        </div>
                        
                        {activeInfo ? (
                          <div className="text-[10px] text-amber-300 font-bold bg-amber-950/90 px-2 py-0.5 rounded border border-amber-500/40 truncate">
                            {(I18N_TABLE_PICKER[lang]?.activeCardPrefix || I18N_TABLE_PICKER.IT.activeCardPrefix)} {activeInfo.total} ฿
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-400/90 font-semibold truncate">
                            {I18N_TABLE_PICKER[lang]?.freeCard || I18N_TABLE_PICKER.IT.freeCard}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-stone-800">
                <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
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
                    className="flex-1 bg-stone-950 border border-stone-700 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customTableInput.trim()) {
                        handleSelectTable(customTableInput.trim());
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-95"
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
            
            {/* EXCLUSIVE DINING PRIVILEGE HERO BANNER (Compact, Sleek & Well Distributed) */}
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

                {/* Right Side: Promotion Info & Table Pills */}
                <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5 text-left">
                  {/* Top Bar: Privilege Badge + Pills */}
                  <div className="flex flex-wrap items-center justify-start gap-1.5 sm:gap-2">
                    <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-black text-[9px] sm:text-[10px] md:text-[10.5px] uppercase tracking-wider shadow-sm">
                      <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-stone-950 stroke-none" />
                      <span>{lang === 'IT' ? 'PROMOZIONE AL TAVOLO' : lang === 'TH' ? 'สิทธิพิเศษสั่งที่โต๊ะอาหาร' : lang === 'DE' ? 'TISCH-RABATT' : 'TABLE PROMO'}</span>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-lg bg-black/40 border border-white/20 text-white text-[9px] sm:text-[10px] md:text-[10.5px] font-bold backdrop-blur-sm">
                      <UtensilsCrossed className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
                      <span>Postazione: {currentTable}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-lg bg-emerald-500/30 border border-emerald-400/60 text-emerald-300 text-[9px] sm:text-[10px] md:text-[10.5px] font-black backdrop-blur-sm">
                      <Percent className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
                      <span>-5% Sconto Diretto</span>
                    </span>
                  </div>

                  {/* Hero Title */}
                  <h1 className="font-sans text-xs sm:text-base md:text-lg font-black tracking-tight text-white leading-snug">
                    {lang === 'TH' ? (
                      <>รับส่วนลดทันที <span className="text-amber-300">5% ทุกเมนู</span> เมื่อสั่งผ่านแท็บเล็ต!</>
                    ) : lang === 'IT' ? (
                      <>Sconto Immediato del <span className="text-amber-300">5% su Tutto il Menu</span> dal Tablet!</>
                    ) : lang === 'DE' ? (
                      <>Sofort <span className="text-amber-300">5% Rabatt auf alles</span> am Tablet!</>
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
                    ) : (
                      <>Enjoy authentic Italian cuisine at your table: get <strong>5% OFF your total bill</strong> and receive a <strong>10% Welcome Coupon</strong> for your next delivery order at home!</>
                    )}
                  </p>
                </div>
              </div>
            </header>

            {/* ACTIVE TAB ALERT / NOTIFICATION */}
            {tableNotification && (
              <div className="mb-3.5 p-3 rounded-2xl bg-gradient-to-r from-amber-950/90 via-stone-900 to-amber-950/90 border border-amber-400/50 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-md animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{tableNotification}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTableNotification('')}
                  className="p-1 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

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
                        {categoryDetails[activeCategory.id][lang].desc}
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
                          <span>{lang === 'TH' ? 'ทั้งหมด' : lang === 'IT' ? 'Tutti' : lang === 'DE' ? 'Alle' : 'All'}</span>
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
                          <span>{lang === 'TH' ? 'มังสวิรัติ' : lang === 'IT' ? 'Veggie' : lang === 'DE' ? 'Veggie' : 'Veggie'}</span>
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
                          <span>{lang === 'TH' ? 'วีแกน' : lang === 'IT' ? 'Vegan' : lang === 'DE' ? 'Vegan' : 'Vegan'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-8 h-0.5 bg-[#8B1E1E] mt-1 mb-3" />
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
          setIsTableSelected(false);
          setCurrentTable('');
          setTableNotification('');
        }}
        initialTable={currentTable}
        lang={lang}
      />
    </div>
  );
}
