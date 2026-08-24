import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Globe, ChevronDown, Wine, Sparkles, Filter, RotateCcw, Check } from 'lucide-react';
import { menuData, type MenuItem } from '../data/menuData';
import CategoryTabs from '../components/CategoryTabs';
import MenuGrid from '../components/MenuGrid';
import CartDrawer from '../components/CartDrawer';
import CheckoutFlow from '../components/CheckoutFlow';
import { useCartStore } from '../store/cartStore';
import PizzaSlideshow from '../../components/PizzaSlideshow';
import { INITIAL_WINE_COLLECTION, WINE_COUNTRY_OPTIONS, resolveWineCategoryType, sortWinesByCountryOrder, getCountryRank } from '../data/wineData';


const translations = {
  IT: {
    title: 'Flower Power Pizza',
    subtitle: 'Ranong, Thailandia',
    tagline1: 'PIZZA & CUCINA ITALIANA',
    tagline2: 'Cuoca Italiana • Ingredienti Importati',
    info1: 'Aperto tutti i giorni',
    info2: '11:00 – 21:30',
    info3: 'Consegna & Ritiro',
    cartItems: 'prodotti nel carrello',
    cartItem: 'prodotto nel carrello',
    promoTitle: 'Promozioni & Consegna a Domicilio',
    deliveryLimit: 'Le consegne si effettuano esclusivamente per la città di Ranong.',
    promoFreeDelivery: 'Consegna GRATIS per ordini sopra i 200฿',
    promoFirstOrder: '10% di sconto sul tuo primo ordine',
  },
  EN: {
    title: 'Flower Power Pizza',
    subtitle: 'Ranong, Thailand',
    tagline1: 'PIZZA & ITALIAN CUISINE',
    tagline2: 'Italian Chef • Imported Ingredients',
    info1: 'Open Daily',
    info2: '11:00 – 21:30',
    info3: 'Delivery & Pickup',
    cartItems: 'items in cart',
    cartItem: 'item in cart',
    promoTitle: 'Promotions & Delivery Info',
    deliveryLimit: 'Deliveries are made exclusively within the city of Ranong.',
    promoFreeDelivery: 'FREE delivery for orders over 200฿',
    promoFirstOrder: '10% discount on your first order',
  },
  TH: {
    title: 'ฟลาวเวอร์ พาวเวอร์ พิซซ่า',
    subtitle: 'ระนอง, ประเทศไทย',
    tagline1: 'พิซซ่าและอาหารอิตาเลียน',
    tagline2: 'เชฟหญิงชาวอิตาลี • วัตถุดิบนำเข้า',
    info1: 'เปิดบริการทุกวัน',
    info2: '11:00 – 21:30',
    info3: 'บริการจัดส่งและรับที่ร้าน',
    cartItems: 'รายการในรถเข็น',
    cartItem: 'รายการในรถเข็น',
    promoTitle: 'โปรโมชั่นและข้อมูลการจัดส่ง',
    deliveryLimit: 'บริการจัดส่งเฉพาะในเขตตัวเมืองระนองเท่านั้น',
    promoFreeDelivery: 'จัดส่งฟรี เมื่อสั่งซื้อครบ 200฿ ขึ้นไป',
    promoFirstOrder: 'ส่วนลด 10% สำหรับการสั่งซื้อครั้งแรก',
  },
  DE: {
    title: 'Flower Power Pizza',
    subtitle: 'Ranong, Thailand',
    tagline1: 'PIZZA & ITALIENISCHE KÜCHE',
    tagline2: 'Italienische Köchin • Importierte Zutaten',
    info1: 'Täglich geöffnet',
    info2: '11:00 – 21:30',
    info3: 'Lieferung & Abholung',
    cartItems: 'Artikel im Warenkorb',
    cartItem: 'Artikel im Warenkorb',
    promoTitle: 'Aktionen & Lieferbedingungen',
    deliveryLimit: 'Lieferungen erfolgen ausschließlich innerhalb der Stadt Ranong.',
    promoFreeDelivery: 'KOSTENLOSE Lieferung ab 200฿ Bestellwert',
    promoFirstOrder: '10% Rabatt auf Ihre erste Bestellung',
  },
};

const categoryDetails: Record<string, Record<string, { name: string; desc: string }>> = {
  'traditional-italian-pizza': {
    IT: { name: 'Pizze Classiche', desc: 'Impasto a fermentazione naturale' },
    EN: { name: 'Classic Pizzas', desc: 'Slow-fermented Italian dough' },
    TH: { name: 'พิซซ่าคลาสสิค', desc: 'แป้งหมักธรรมชาติสูตรดั้งเดิม' },
    DE: { name: 'Klassische Pizzas', desc: 'Natursauerteig-Pizzaboden' },
  },
  'pasta': {
    IT: { name: 'Pasta', desc: 'Primi piatti della tradizione' },
    EN: { name: 'Pasta Dishes', desc: 'Traditional Italian pasta' },
    TH: { name: 'พาสต้า', desc: 'เมนูพาสต้าอิตาเลียนดั้งเดิม' },
    DE: { name: 'Pasta', desc: 'Traditionelle italienische Pasta' },
  },
  'italian-salads': {
    IT: { name: 'Insalate Italiane', desc: 'Verdure fresche e ingredienti sani' },
    EN: { name: 'Italian Salads', desc: 'Fresh salads with olive oil' },
    TH: { name: 'สลัดอิตาเลียน', desc: 'ผักสดและน้ำมันมะกอกเอ็กซ์ตร้าเวอร์จิน' },
    DE: { name: 'Italienische Salate', desc: 'Frische Salate mit Olivenöl' },
  },
  'pizza-sandwich': {
    IT: { name: 'Pizza Sandwich', desc: 'Pane appena sfornato farcito' },
    EN: { name: 'Pizza Sandwich', desc: 'Freshly baked sandwich' },
    TH: { name: 'พิตซ่าแซนด์วิช', desc: 'อบใหม่ร้อนๆ ไส้แน่น' },
    DE: { name: 'Pizza Sandwich', desc: 'Frisch gebackenes Sandwich' },
  },
  'pizza-burgers': {
    IT: { name: 'Pizza Burger', desc: 'Hamburger in stile italiano' },
    EN: { name: 'Pizza Burgers', desc: 'Italian-style burgers' },
    TH: { name: 'พิซซ่าเบอร์เกอร์', desc: 'เบอร์เกอร์โฮมเมดสไตล์อิตาเลียน' },
    DE: { name: 'Pizza Burger', desc: 'Burger nach italienischer Art' },
  },
  'french-fries': {
    IT: { name: 'Patatine Fritte', desc: 'Dorate e croccanti' },
    EN: { name: 'French Fries', desc: 'Crispy and golden' },
    TH: { name: 'มันฝรั่งทอด', desc: 'เฟรนช์ฟรายส์ทอดสดใหม่' },
    DE: { name: 'Pommes Frites', desc: 'Knusprig und goldbraun' },
  },
  'desserts': {
    IT: { name: 'Dolci', desc: 'Tiramisù e dessert artigianali' },
    EN: { name: 'Desserts', desc: 'Tiramisù and homemade desserts' },
    TH: { name: 'ของหวาน', desc: 'ทิรามิสุและขนมหวานโฮมเมด' },
    DE: { name: 'Desserts', desc: 'Tiramisù und hausgemachte Desserts' },
  },
  'breakfast-and-snacks': {
    IT: { name: 'Colazione & Snack', desc: 'Per iniziare la giornata' },
    EN: { name: 'Breakfast & Snacks', desc: 'To start your day' },
    TH: { name: 'อาหารเช้าและของว่าง', desc: 'เริ่มต้นวันใหม่ด้วยพลังงาน' },
    DE: { name: 'Frühstück & Snacks', desc: 'Für einen guten Start in den Tag' },
  },
  'coffee-shop': {
    IT: { name: 'Caffetteria', desc: 'Caffè espresso italiano' },
    EN: { name: 'Coffee Shop', desc: 'Italian espresso coffee' },
    TH: { name: 'ร้านกาแฟ', desc: 'เอสเพรสโซ่อิตาเลียนแท้' },
    DE: { name: 'Kaffeeshop', desc: 'Italienischer Espresso' },
  },
  'fruit-drinks': {
    IT: { name: 'Bevande alla Frutta', desc: 'Frullati e shake freschi' },
    EN: { name: 'Fruit Drinks', desc: 'Fresh fruit shakes' },
    TH: { name: 'เครื่องดื่มผลไม้', desc: 'ผลไม้สดปั่นสดใหม่' },
    DE: { name: 'Fruchtgetränke', desc: 'Frische Frucht-Shakes' },
  },
  'soft-drinks': {
    IT: { name: 'Bibite & Birre', desc: 'Bibite analcoliche, acqua minerale naturale e birre fresche in bottiglia servite fredde.' },
    EN: { name: 'Soft Drinks & Beers', desc: 'Refreshing soft drinks, natural mineral water, and chilled bottled beers.' },
    TH: { name: 'เครื่องดื่มและเบียร์', desc: 'น้ำอัดลม น้ำดื่มสดชื่น และเบียร์ขวดเย็นๆ' },
    DE: { name: 'Erfrischungsgetränke & Biere', desc: 'Erfrischende alkoholfreie Getränke, Mineralwasser und gekühlte Flaschenbiere.' },
  },
  'beers-and-wines': {
    IT: { name: 'Birre & Vini', desc: 'Birre fresche e selezione di vini italiani' },
    EN: { name: 'Beers & Wines', desc: 'Chilled beers and Italian wine selection' },
    TH: { name: 'เบียร์และไวน์', desc: 'เบียร์เย็นๆ และไวน์อิตาเลียนคัดสรร' },
    DE: { name: 'Biere & Weine', desc: 'Gekühlte Biere und ausgewählte italienische Weine' },
  },
  'wines': {
    IT: { name: 'Vini', desc: 'Selezione accurata di vini italiani ed internazionali, scelti per esaltare i sapori di ogni piatto del nostro menù.' },
    EN: { name: 'Wines', desc: 'Carefully curated selection of fine Italian and international wines, chosen to enhance the flavors of every dish on our menu.' },
    TH: { name: 'ไวน์', desc: 'คัดสรรไวน์อิตาเลียนและไวน์นานาชาติชั้นเลิศอย่างพิถีพิถัน เพื่อเสริมรสชาติของทุกเมนูให้โดดเด่นและสมดุลยิ่งขึ้น' },
    DE: { name: 'Weine', desc: 'Sorgfältig zusammengestellte Auswahl an italienischen und internationalen Weinen, die darauf abgestimmt sind, die Aromen jedes Gerichts auf unserer Speisekarte hervorzuheben.' },
  },
};

const PASTA_SAUCES = [
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
      EN: 'A creamy blend of four carefully selected Italian cheeses, perfectly melted together to create a rich, bold, and indulgent flavor in every bite',
      TH: 'ซอสชีส 4 ชนิดเข้มข้นสไตล์อิตาเลียน ละมุนลิ้นด้วยชีสระดับพรีเมียม',
      DE: 'Eine cremige Mischung aus vier sorgfältig ausgewählten italienischen Käsesorten, die perfekt miteinander verschmelzen, um bei jedem Bissen einen reichen und kräftigen Geschmack zu kreieren.'
    },
    pattern: 'Four Cheeses' 
  },
  { 
    id: 'flower-power', 
    name: { 
      IT: 'Flower Power', 
      EN: 'Flower Power', 
      TH: 'พาสต้าฟลาวเวอร์เพาเวอร์', 
      DE: 'Flower Power' 
    }, 
    desc: {
      IT: 'Salsa per pasta artigianale preparata in casa con gorgonzola, salsiccia italiana e carciofi. Cremosa, ricca e dal sapore unico, perfetta per gli amanti dei gusti decisi.',
      EN: 'House-made pasta sauce with gorgonzola, Italian sausage, and artichokes. Creamy, rich, and full of unique flavor, perfect for lovers of bold tastes',
      TH: 'พาสต้าสูตรพิเศษของร้าน ปรุงรสด้วยวัตถุดิบสดใหม่รสชาติกลมกล่อม',
      DE: 'Hausgemachte Nudelsauce mit Gorgonzola, italienischer Wurst und Artischocken. Cremig, reichhaltig und voller einzigartigem Geschmack, perfekt für Liebhaber kräftiger Aromen.'
    },
    pattern: 'Flower Power' 
  },
  { 
    id: 'lasagne', 
    name: { 
      IT: 'Lasagne', 
      EN: 'Baked Lasagna', 
      TH: 'ลาซานญ่า', 
      DE: 'Lasagne' 
    }, 
    desc: {
      IT: 'Le lasagne fatte in casa sono un classico della cucina italiana, preparate con besciamella, ragù e parmigiano. Si prega di ordinare con un giorno di anticipo (minimo due porzioni) o chiedere allo staff. Tempo di cottura circa 30 minuti.',
      EN: 'Homemade Lasagne Are A Classic Of Italian Cuisine, Made With Béchamel, Sauces, And Parmesan. Pre-Order One Day In Advance, Minimum Two Portions, Or Ask The Staff. Cooking Time About 30 Minutes.',
      TH: 'ลาซานญ่าอบร้อนๆ สลับชั้นด้วยพาสต้า ซอสเนื้อรสเข้มข้น และชีสเยิ้มๆ',
      DE: 'Hausgemachte Lasagne ist ein Klassiker der italienischen Küche, zubereitet mit Béchamelsauce, Fleischsauce und Parmesan. Bitte einen Tag im Voraus bestellen (mindestens zwei Portionen) oder das Personal fragen. Garzeit ca. 30 Minuten.'
    },
    pattern: 'Lasagne' 
  }
];

const SOFT_DRINKS_SECTIONS = [
  { 
    id: 'drinks', 
    name: { IT: 'Bibite & Acqua', EN: 'Soft Drinks & Water', TH: 'น้ำอัดลมและน้ำดื่ม', DE: 'Erfrischungsgetränke & Wasser' },
    desc: {
      IT: 'Bibite analcoliche in lattina, acqua minerale naturale e bevande rinfrescanti servite fredde.',
      EN: 'Canned soft drinks, natural mineral water, and chilled refreshing beverages.',
      TH: 'น้ำอัดลมกระป๋อง น้ำดื่มธรรมชาติ และเครื่องดื่มเพิ่มความสดชื่นเสิร์ฟเย็น',
      DE: 'Erfrischungsgetränke in der Dose, natürliches Mineralwasser und gekühlte Getränke.'
    }
  },
  { 
    id: 'beers', 
    name: { IT: 'Birre', EN: 'Beers', TH: 'เบียร์', DE: 'Biere' },
    desc: {
      IT: 'Le migliori marche di birra tailandese servite in bottiglie grandi e piccole, poiché le bottiglie in vetro preservano ed esaltano il sapore per un\'esperienza completa.',
      EN: 'The Best Thai Beer Brands Served In Large And Small Bottles, Because Glass Bottles Enhance The Flavor, Bringing Out The Full Beer Experience',
      TH: 'เบียร์ไทยคุณภาพเยี่ยม เสิร์ฟในขวดแก้วทั้งขนาดเล็กและใหญ่เพื่อรสชาติที่ดีที่สุด',
      DE: 'Die besten thailändischen Biermarken, serviert in großen und kleinen Flaschen, da Glasflaschen den Geschmack verbessern und das volle Biererlebnis entfalten.'
    }
  }
];

const PASTA_FILTER_LABELS = {
  IT: { all: 'Tutti i Primi' },
  EN: { all: 'All Pasta' },
  TH: { all: 'พาสต้าทั้งหมด' },
  DE: { all: 'Alle Nudelgerichte' },
};

const DRINK_FILTER_LABELS = {
  IT: { all: 'Tutte le Bevande', drinks: 'Bibite & Acqua', beers: 'Birre' },
  EN: { all: 'All Beverages', drinks: 'Soft Drinks & Water', beers: 'Beers' },
  TH: { all: 'เครื่องดื่มทั้งหมด', drinks: 'น้ำอัดลมและน้ำดื่ม', beers: 'เบียร์' },
  DE: { all: 'Alle Getränke', drinks: 'Erfrischungsgetränke & Wasser', beers: 'Biere' },
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
  }
};

const WINE_TYPE_SECTIONS = [
  {
    id: 'red',
    name: { IT: 'Vini Rossi', EN: 'Red Wines', TH: 'ไวน์แดง', DE: 'Rotweine' },
    desc: {
      IT: 'Selezione di vini rossi strutturati, avvolgenti e armoniosi, ideali per accompagnare piatti saporiti, carni e formaggi.',
      EN: 'Curated selection of structured, full-bodied red wines, tailored for savory dishes, meats, and cheeses.',
      TH: 'คัดสรรไวน์แดงรสชาตินุ่มละมุนและเข้มข้น เหมาะสำหรับทานคู่กับอาหารจานหลักและเนื้อสัตว์',
      DE: 'Kuratierte Auswahl an strukturierten, vollmundigen Rotweinen, ideal zu herzhaften Gerichten, Fleisch und Käse.'
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
  const [activeCategoryId, setActiveCategoryId] = useState(menuData[0].id);
  const [showCheckout, setShowCheckout] = useState(false);
  const { getCount, getTotal, openCart } = useCartStore();
  const count = getCount();
  const total = getTotal();

  const [lang, setLang] = useState<'IT' | 'EN' | 'TH' | 'DE'>('IT');
  const [isLangOpen, setIsLangOpen] = useState(false);

  useEffect(() => {
    const browserLang = navigator.language.slice(0, 2).toUpperCase();
    if (['IT', 'EN', 'TH', 'DE'].includes(browserLang)) {
      setLang(browserLang as any);
    } else {
      setLang('EN');
    }
  }, []);

  // Sync lang → <html data-lang="..."> so CSS applies IBM Plex Sans Thai for TH
  useEffect(() => {
    document.documentElement.setAttribute('data-lang', lang);
  }, [lang]);

  const unavailableIds = new Set<string>();
  const priceOverrides: Record<string, number> = {};

  // Sub-filtering states
  const [selectedWineType, setSelectedWineType] = useState<'all' | 'red' | 'white' | 'rose' | 'sparkling'>('all');
  const [selectedWineCountry, setSelectedWineCountry] = useState<string>('all');
  const [selectedDrinkType, setSelectedDrinkType] = useState<'all' | 'drinks' | 'beers'>('all');
  const [selectedPastaSauce, setSelectedPastaSauce] = useState<string>('all');

  const t = translations[lang];
  const activeCategory = menuData.find((c) => c.id === activeCategoryId) ?? menuData[0];
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
      const saved = localStorage.getItem('fp_wine_collection');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          rawWines = parsed;
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
  }, [lang, activeCategoryId]);

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

  const filteredCategoryItems = activeCategoryId === 'wines'
    ? filterWineItems(selectedWineType)
    : activeCategory.items
        .filter((item: any) => !unavailableIds.has(item.id))
        .map((item: any) => priceOverrides[item.id] !== undefined ? { ...item, price: priceOverrides[item.id] } : item);

  const pastaSauceCounts = useMemo(() => {
    const counts: Record<string, number> = { all: filteredCategoryItems.length };
    PASTA_SAUCES.forEach(sauce => {
      const c = filteredCategoryItems.filter((item: any) => {
        const path = item.image_file || "";
        const name = item.id || "";
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
      if (path.includes(sauce.pattern)) return true;
      if (sauce.id === 'lasagne' && name.includes('lasagna')) return true;
      return false;
    });
    return { ...sauce, items };
  }).filter(group => {
    if (selectedPastaSauce !== 'all' && group.id !== selectedPastaSauce) return false;
    return group.items.length > 0;
  }) : [];

  const drinkCounts = useMemo(() => {
    const drinks = filteredCategoryItems.filter((item: any) => !item.id.toLowerCase().includes('beer') && !item.name.toLowerCase().includes('beer')).length;
    const beers = filteredCategoryItems.filter((item: any) => item.id.toLowerCase().includes('beer') || item.name.toLowerCase().includes('beer')).length;
    return {
      all: drinks + beers,
      drinks,
      beers
    };
  }, [filteredCategoryItems]);

  const groupedSoftDrinksAndBeers = (activeCategoryId === 'soft-drinks' || activeCategoryId === 'beers-and-wines') ? SOFT_DRINKS_SECTIONS.map(sec => {
    if (sec.id === 'drinks') {
      const items = filteredCategoryItems.filter((item: any) => !item.id.toLowerCase().includes('beer') && !item.name.toLowerCase().includes('beer'));
      return { ...sec, name: sec.name[lang], items };
    }
    const items = filteredCategoryItems.filter((item: any) => item.id.toLowerCase().includes('beer') || item.name.toLowerCase().includes('beer'));
    return { ...sec, name: sec.name[lang], items };
  }).filter(group => {
    if (selectedDrinkType !== 'all' && group.id !== selectedDrinkType) return false;
    return group.items.length > 0;
  }) : [];

  return (
    <div className="min-h-screen bg-[#e7e5e4] pb-12 antialiased" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
      <div className="max-w-6xl mx-auto px-4 mt-20 md:mt-24">
        
        {/* Italian Chef Header Card */}
        <header className="relative text-stone-100 py-4 lg:py-8 px-4 md:px-8 overflow-hidden rounded-2xl shadow-lg mb-6" style={{ backgroundColor: '#3b3530' }}>
          <div className="absolute inset-0 opacity-40 overflow-hidden pointer-events-none">
            <PizzaSlideshow />
          </div>
          <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-[0.5px]" />


          {/* Symmetrical Language Dropdown Selector */}
          <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
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
                <div className="absolute right-0 mt-1.5 w-24 bg-[#3b3530]/95 backdrop-blur-md rounded-xl border border-white/10 shadow-lg z-50 overflow-hidden flex flex-col">
                  {(['IT', 'EN', 'TH', 'DE'] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => {
                        setLang(l);
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-[10px] font-bold transition-all hover:bg-white/10 cursor-pointer ${
                        lang === l ? "text-[#fca5a5] bg-white/5" : "text-stone-300"
                      }`}
                    >
                      {l === 'IT' && '🇮🇹 IT'}
                      {l === 'EN' && '🇬🇧 EN'}
                      {l === 'TH' && '🇹🇭 TH'}
                      {l === 'DE' && '🇩🇪 DE'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative z-10 my-auto py-2">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8 min-h-[160px] lg:min-h-[180px]">
              {/* Left Side: Logo & Brand Name (Equally spaced vertically) */}
              <div className="flex flex-col lg:flex-row items-center gap-3.5 lg:gap-6 text-center lg:text-left w-full lg:w-auto my-auto">
                <img
                  src="/Flower_Power_Pizza_-_HotSpring.png"
                  alt="Flower Power Pizza Logo"
                  width={200}
                  height={200}
                  className="h-16 lg:h-44 w-auto drop-shadow-md mx-auto lg:mx-0 flex-shrink-0 object-contain my-auto"
                />
                <div className="flex flex-col justify-between items-center lg:items-start lg:pl-4 my-auto space-y-2">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-sans font-black tracking-tight text-white leading-none text-center lg:text-left">
                    FLOWER POWER <br />
                    <span className="font-light italic text-[#f87171]">Pizza</span>
                  </h1>
                  <span className="text-[#fca5a5] font-bold tracking-widest text-[9px] md:text-xs uppercase text-center lg:text-left block pt-1">
                    RANONG, THAILANDIA
                  </span>
                </div>
              </div>

              {/* Right Side: Information Details (Equally spaced vertically) */}
              <div className="flex flex-col justify-between items-center lg:items-end gap-2 text-center lg:text-right max-w-md w-full lg:w-auto my-auto space-y-1">
                <span className="text-xs sm:text-sm md:text-xl lg:text-2xl font-extrabold text-stone-100 tracking-tight block uppercase bg-white/10 lg:bg-transparent px-3 py-0.5 rounded-full lg:p-0">
                  {t.tagline1}
                </span>
                <span className="text-[9px] md:text-xs lg:text-sm font-bold text-[#fca5a5] tracking-widest block uppercase">
                  {t.tagline2}
                </span>
                <div className="flex flex-row flex-wrap justify-center lg:justify-end gap-x-2 gap-y-0.5 text-[9px] md:text-xs font-light text-stone-200">
                  <span>{t.info1}</span>
                  <span className="text-stone-400">•</span>
                  <span>{t.info2}</span>
                  <span className="text-stone-400">•</span>
                  <span>{t.info3}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Red Promotions & Delivery Banner (Solid Red background) */}
        <div className="p-5 md:p-6 bg-[#8B1E1E] text-stone-100 rounded-3xl max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-6 shadow-md mb-8 mt-2 border border-[#721818]">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 rounded-full text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </div>
          <div className="flex-1 text-center md:text-left space-y-1">
            <h4 className="text-white font-extrabold text-sm md:text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {t.promoTitle}
            </h4>
            <p className="text-stone-200 text-xs leading-relaxed">
              📍 <span className="font-semibold">{t.deliveryLimit}</span>
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-x-6 gap-y-1 pt-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs text-white font-bold">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                {t.promoFreeDelivery}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-white font-bold">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                {t.promoFirstOrder}
              </span>
            </div>
          </div>
        </div>

        {/* Category Tabs directly on background */}
        <div className="mb-6">
          <CategoryTabs categories={menuData} activeId={activeCategoryId} onChange={setActiveCategoryId} lang={lang} />
        </div>

        {/* Section Title */}
        <div className="mt-8 mb-6 px-2">
          <h2 className="font-sans text-xl md:text-2xl font-black tracking-tight text-stone-900" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
            {activeCategoryName}
          </h2>
          {categoryDetails[activeCategory.id]?.[lang]?.desc && (
            <p className="text-stone-500 text-xs mt-1 font-light italic">
              {categoryDetails[activeCategory.id][lang].desc}
            </p>
          )}
          <div className="w-8 h-0.5 bg-[#8B1E1E] mt-2.5 mb-4" />
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

        {/* Submenu for Soft Drinks & Beers (Stylish Dropdown Menu) */}
        {(activeCategoryId === 'soft-drinks' || activeCategoryId === 'beers-and-wines') && (
          <div className="relative z-30 mb-6 px-1 flex items-end gap-3 flex-wrap animate-fadeIn">
            <CustomFilterDropdown
              label={DROPDOWN_LABELS[lang].drinkFilter}
              selectedId={selectedDrinkType}
              options={[
                { id: 'all', label: DRINK_FILTER_LABELS[lang].all, count: drinkCounts.all },
                ...SOFT_DRINKS_SECTIONS.map(s => ({
                  id: s.id,
                  label: s.name[lang],
                  count: s.id === 'drinks' ? drinkCounts.drinks : drinkCounts.beers
                }))
              ]}
              onSelect={(id) => setSelectedDrinkType(id as any)}
            />
            {selectedDrinkType !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedDrinkType('all')}
                className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                <span>Reset</span>
              </button>
            )}
          </div>
        )}

        {/* Submenu for Wines (Stylish Dual Dropdown Menu: Type & Origin) */}
        {activeCategoryId === 'wines' && (
          <div className="relative z-30 mb-6 px-1 flex items-end gap-3 flex-wrap animate-fadeIn">
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
        )}

        {/* Products Grid */}
        <div className="px-1 relative z-10">
          {activeCategoryId === 'pasta' ? (
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
                  <MenuGrid items={group.items} lang={lang} />
                </div>
              ))}
            </div>
          ) : (activeCategoryId === 'soft-drinks' || activeCategoryId === 'beers-and-wines') ? (
            <div className="space-y-12">
              {groupedSoftDrinksAndBeers.map(group => (
                <div key={group.id} id={`sec-${group.id}`} className="scroll-mt-24">
                  <div className="px-2 mb-6">
                    <div className="flex items-center gap-3">
                      <h3 className="font-sans text-lg md:text-xl font-extrabold text-stone-800 tracking-tight" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                        {group.name}
                      </h3>
                      <div className="flex-1 h-px bg-stone-300/60" />
                    </div>
                    {group.desc && (
                      <p className="text-stone-600 text-sm mt-1.5 font-light italic leading-relaxed max-w-2xl" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                        {group.desc[lang]}
                      </p>
                    )}
                  </div>
                  <MenuGrid items={group.items} lang={lang} />
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
                      <MenuGrid items={group.items} lang={lang} />
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
                    <MenuGrid items={currentWinesForSelectedType} lang={lang} />
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
            <MenuGrid items={filteredCategoryItems} lang={lang} />
          )}
        </div>
      </div>

      {/* Floating Bottom Cart Button */}
      {count > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-30 px-4">
          <button
            onClick={openCart}
            className="flex items-center gap-4 px-6 py-4 bg-[#8B1E1E] hover:bg-[#721818] text-white shadow-2xl rounded-full transition-all duration-300 transform active:scale-[0.98] cursor-pointer font-bold border border-red-900/10"
            style={{ minWidth: '280px', maxWidth: '420px', width: '100%' }}
          >
            <div className="flex items-center gap-2 flex-1">
              <ShoppingCart size={18} />
              <span className="text-xs tracking-widest uppercase" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
                {count} {count === 1 ? t.cartItem : t.cartItems}
              </span>
            </div>
            <span className="font-light inline-flex items-baseline gap-1" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
              <span>{total}</span>
              <span className="font-black select-none text-white" style={{ fontFamily: 'Prompt, Kanit, IBM Plex Sans Thai, system-ui, sans-serif' }}>฿</span>
            </span>
          </button>
        </div>
      )}

      <CartDrawer onCheckout={() => setShowCheckout(true)} lang={lang} />

      {showCheckout && (
        <CheckoutFlow onClose={() => setShowCheckout(false)} onSuccess={() => setShowCheckout(false)} lang={lang} />
      )}

      {count > 0 && <div className="h-24" />}
    </div>
  );
}
