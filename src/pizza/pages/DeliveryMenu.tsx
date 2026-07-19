import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Globe, ChevronDown } from 'lucide-react';
import { menuData } from '../data/menuData';
import CategoryTabs from '../components/CategoryTabs';
import MenuGrid from '../components/MenuGrid';
import CartDrawer from '../components/CartDrawer';
import CheckoutFlow from '../components/CheckoutFlow';
import { useCartStore } from '../store/cartStore';

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
    IT: { name: 'Bibite', desc: 'Bibite rinfrescanti' },
    EN: { name: 'Soft Drinks', desc: 'Refreshing drinks' },
    TH: { name: 'น้ำอัดลม', desc: 'เครื่องดื่มไร้แอลกอฮอล์' },
    DE: { name: 'Alkoholfreie Getränke', desc: 'Erfrischungsgetränke' },
  },
  'beers-and-wines': {
    IT: { name: 'Birre & Vini', desc: 'Birre fresche e selezione di vini italiani' },
    EN: { name: 'Beers & Wines', desc: 'Chilled beers and Italian wine selection' },
    TH: { name: 'เบียร์และไวน์', desc: 'เบียร์เย็นๆ และไวน์อิตาเลียนคัดสรร' },
    DE: { name: 'Biere & Weine', desc: 'Gekühlte Biere und ausgewählte italienische Weine' },
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

const BEER_AND_WINE_SECTIONS = [
  { 
    id: 'beers', 
    name: { IT: 'Birre', EN: 'Beers', TH: 'เบียร์', DE: 'Biere' },
    desc: {
      IT: 'Le migliori marche di birra tailandese servite in bottiglie grandi e piccole, poiché le bottiglie in vetro preservano ed esaltano il sapore per un\'esperienza completa.',
      EN: 'The Best Thai Beer Brands Served In Large And Small Bottles, Because Glass Bottles Enhance The Flavor, Bringing Out The Full Beer Experience',
      TH: 'เบียร์ไทยคุณภาพเยี่ยม เสิร์ฟในขวดแก้วทั้งขนาดเล็กและใหญ่เพื่อรสชาติที่ดีที่สุด',
      DE: 'Die besten thailändischen Biermarken, serviert in großen und kleinen Flaschen, da Glasflaschen den Geschmack verbessern und das volle Biererlebnis entfalten.'
    }
  },
  { 
    id: 'wines', 
    name: { IT: 'Vini', EN: 'Wines', TH: 'ไวน์', DE: 'Weine' },
    desc: {
      IT: 'L\'Italia è rinomata in tutto il mondo per i suoi vini pregiati e la sua antica tradizione. Per questo offriamo una selezione accurata di vini rossi e bianchi italiani, scelti per esaltare i sapori di ogni piatto del nostro menù. Chiedi al nostro staff per il miglior abbinamento del giorno.',
      EN: 'Italy Is World-Renowned For Its High-Quality Wines With A Long-Standing Tradition. That\'s Why We Offer A Carefully Curated Selection Of Italian Red And White Wines, Chosen To Enhance The Flavors Of Every Dish On Our Menu. For The Best And Most Suitable Option At The Moment, Feel Free To Ask Our Staff',
      TH: 'ไวน์แดงและไวน์ขาวนำเข้าจากอิตาลี คัดสรรอย่างดีเพื่อเพิ่มอรรถรสในการทานคู่กับอาหาร',
      DE: 'Italien ist weltberühmt für seine qualitativ hochwertigen Weine mit einer langen tradition. Deshalb bieten wir eine sorgfältig zusammengestellte Auswahl an italienischen Rot- und Weißweinen, die darauf abgestimmt sind, die Aromen jedes Gerichts auf unserer Speisekarte zu unterstreichen. Fragen Sie unser Personal nach der besten Empfehlung.'
    }
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

// Short single-line labels for each sauce tab
const SAUCE_TAB_LABELS: Record<string, Record<'IT'|'EN'|'TH'|'DE', string>> = {
  'aglio-olio':       { IT: 'Aglio e Pepe',    EN: 'Garlic & Chili',   TH: 'อากลิโอ โอลิโอ',    DE: 'Knoblauch & Chili'  },
  'pomodoro':         { IT: 'Pomodoro',         EN: 'Tomato',           TH: 'มะเขือเทศ',           DE: 'Pomodoro'           },
  'pesto':            { IT: 'Pesto',            EN: 'Pesto',            TH: 'เพสโต้',              DE: 'Pesto'              },
  'amatriciana':      { IT: 'Amatriciana',      EN: 'Amatriciana',      TH: 'อามาริเชียนา',      DE: 'Amatriciana'        },
  'bolognese':        { IT: 'Ragù Bolognese',  EN: 'Bolognese',        TH: 'โบโลเนส',          DE: 'Bolognese'          },
  'carbonara':        { IT: 'Carbonara',        EN: 'Carbonara',        TH: 'คาร์โบนาร่า',        DE: 'Carbonara'          },
  'quattro-formaggi': { IT: '4 Formaggi',       EN: 'Four Cheeses',     TH: 'โฟร์ชีส',           DE: 'Vier Käse'          },
  'flower-power':     { IT: 'Flower Power',     EN: 'Flower Power',     TH: 'ฟลาวเวอร์',        DE: 'Flower Power'       },
  'lasagne':          { IT: 'Lasagne',          EN: 'Lasagna',          TH: 'ลาซานญ่า',           DE: 'Lasagne'            },
};

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

  const t = translations[lang];
  const activeCategory = menuData.find((c) => c.id === activeCategoryId) ?? menuData[0];
  const activeCategoryName = categoryDetails[activeCategory.id]?.[lang]?.name || activeCategory.name;

  const groupedPasta = activeCategoryId === 'pasta' ? PASTA_SAUCES.map(sauce => {
    const items = activeCategory.items.filter((item: any) => {
      const path = item.image_file || "";
      const name = item.id || "";
      if (path.includes(sauce.pattern)) return true;
      if (sauce.id === 'lasagne' && name.includes('lasagna')) return true;
      return false;
    });
    return { ...sauce, items };
  }).filter(group => group.items.length > 0) : [];

  const groupedBeersAndWines = activeCategoryId === 'beers-and-wines' ? BEER_AND_WINE_SECTIONS.map(sec => {
    const items = activeCategory.items.filter((item: any) => {
      const isBeer = item.id.includes('beer');
      if (sec.id === 'beers') return isBeer;
      if (sec.id === 'wines') return !isBeer;
      return false;
    });
    return { ...sec, name: sec.name[lang], items };
  }).filter(group => group.items.length > 0) : [];

  return (
    <div className="min-h-screen bg-[#e7e5e4] pb-12 antialiased" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
      <div className="max-w-6xl mx-auto px-4 mt-20 md:mt-24">
        
        {/* Italian Chef Header Card */}
        <header className="relative text-stone-100 py-4 lg:py-8 px-4 md:px-8 overflow-hidden rounded-2xl shadow-lg mb-6" style={{ backgroundColor: '#3b3530' }}>
          <div
            className="absolute inset-0 opacity-40 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1600&q=80')",
            }}
          />
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

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8">
              {/* Left Side: Logo & Brand Name */}
              <div className="flex flex-col lg:flex-row items-center gap-3.5 lg:gap-6 text-center lg:text-left w-full lg:w-auto">
                <img
                  src="/Flower_Power_Pizza_-_HotSpring.png"
                  alt="Flower Power Pizza Logo"
                  width={200}
                  height={200}
                  className="h-16 lg:h-48 w-auto drop-shadow-md mx-auto lg:mx-0 flex-shrink-0 object-contain"
                />
                <div className="flex flex-col items-center lg:items-start lg:pl-8 lg:translate-y-4">
                  <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-sans font-black tracking-tight text-stone-100 leading-tight text-center lg:text-left">
                    {t.title}
                  </h1>
                  <span className="text-[#fca5a5] font-bold tracking-widest text-[9px] md:text-xs uppercase mt-1 lg:mt-2.5 text-center lg:text-left">
                    {t.subtitle}
                  </span>
                </div>
              </div>

              {/* Right Side: Information Details */}
              <div className="flex flex-col items-center lg:items-end gap-1.5 text-center lg:text-right max-w-md w-full lg:w-auto mt-2 lg:mt-0">
                <span className="text-xs sm:text-sm md:text-xl lg:text-2xl font-extrabold text-stone-100 tracking-tight block uppercase bg-white/10 lg:bg-transparent px-3 py-0.5 rounded-full lg:p-0">
                  {t.tagline1}
                </span>
                <span className="text-[8px] md:text-xs lg:text-sm font-bold text-[#fca5a5] tracking-widest block uppercase">
                  {t.tagline2}
                </span>
                <div className="flex flex-row flex-wrap justify-center lg:justify-end gap-x-2 gap-y-0.5 text-[8px] md:text-xs font-light text-stone-200 mt-0.5">
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

        {/* Submenu for Pasta Sauces — CategoryTabs-style rectangular cards */}
        {activeCategoryId === 'pasta' && (
          <div
            className="flex gap-2 overflow-x-auto pb-4 mb-4 px-2 animate-fadeIn"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {PASTA_SAUCES.map(sauce => {
              const Icon = SAUCE_ICONS[sauce.id] ?? PastaGarlicChiliIcon;
              const rawLabel = SAUCE_TAB_LABELS[sauce.id]?.[lang] ?? sauce.name[lang];
              const labelLines = rawLabel.split('\n');
              return (
                <button
                  key={sauce.id}
                  id={`sauce-tab-${sauce.id}`}
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(`sauce-${sauce.id}`);
                    if (el) {
                      const offset = 90;
                      const bodyRect = document.body.getBoundingClientRect().top;
                      const elementRect = el.getBoundingClientRect().top;
                      const offsetPosition = elementRect - bodyRect - offset;
                      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    }
                  }}
                  className="flex-1 min-w-[72px] flex flex-col items-center justify-start gap-2 py-3 px-1 bg-stone-50 border border-stone-300 text-stone-600 rounded-2xl hover:border-[#8B1E1E] hover:text-[#8B1E1E] hover:bg-[#8B1E1E]/5 transition-all duration-300 cursor-pointer group shadow-sm"
                  style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                >
                  <div className="p-2 rounded-xl bg-stone-200/50 group-hover:bg-[#8B1E1E]/10 group-hover:text-[#8B1E1E] transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[8.5px] font-bold tracking-wide uppercase text-center whitespace-nowrap leading-none px-0.5">
                    {SAUCE_TAB_LABELS[sauce.id]?.[lang] ?? sauce.name[lang]}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Submenu for Beers & Wines */}
        {activeCategoryId === 'beers-and-wines' && (
          <div
            className="flex gap-3 overflow-x-auto pb-4 mb-4 px-2 animate-fadeIn"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {BEER_AND_WINE_SECTIONS.map(sec => {
              const secIcons: Record<string, string> = { 'beers': '🍺', 'wines': '🍷' };
              const icon = secIcons[sec.id] ?? '🥂';
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(`sec-${sec.id}`);
                    if (el) {
                      const offset = 90;
                      const bodyRect = document.body.getBoundingClientRect().top;
                      const elementRect = el.getBoundingClientRect().top;
                      const offsetPosition = elementRect - bodyRect - offset;
                      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    }
                  }}
                  className="flex flex-col items-center justify-center gap-1.5 px-6 py-3 min-w-[90px] bg-stone-50 border border-stone-300 text-stone-600 rounded-2xl hover:border-[#8B1E1E] hover:text-[#8B1E1E] hover:bg-[#8B1E1E]/5 transition-all duration-300 cursor-pointer group shadow-sm"
                  style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
                >
                  <span className="text-xl leading-none">{icon}</span>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-center leading-tight">{sec.name[lang]}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Products Grid */}
        <div className="px-1">
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
          ) : activeCategoryId === 'beers-and-wines' ? (
            <div className="space-y-12">
              {groupedBeersAndWines.map(group => (
                <div key={group.id} id={`sec-${group.id}`} className="scroll-mt-24">
                  <div className="px-2 mb-6">
                    <div className="flex items-center gap-3">
                      <h3 className="font-sans text-lg font-extrabold text-stone-800 tracking-tight" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
                        {group.name}
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
          ) : (
            <MenuGrid items={activeCategory.items} lang={lang} />
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
            <span className="font-light" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>{total} ฿</span>
          </button>
        </div>
      )}

      <CartDrawer onCheckout={() => setShowCheckout(true)} lang={lang} />

      {showCheckout && (
        <CheckoutFlow onClose={() => setShowCheckout(false)} onSuccess={() => setShowCheckout(false)} lang={lang} />
      )}

      {import.meta.env.DEV && (
        <button
          onClick={() => navigate('/admin')}
          className="fixed bottom-6 right-6 z-40 bg-stone-900/95 hover:bg-stone-850 text-[#c5a572] hover:text-white px-4 py-3 rounded-full border border-[#c5a572]/40 shadow-2xl flex items-center justify-center gap-1.5 transition-all text-xs uppercase tracking-widest font-extrabold cursor-pointer hover:scale-105 active:scale-95 animate-fadeIn"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          <span>⚙️ Dashboard Admin</span>
        </button>
      )}

      {count > 0 && <div className="h-24" />}
    </div>
  );
}
