import React, { useState } from 'react';
import { 
  Pizza, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Flame, 
  ShieldCheck, 
  Utensils, 
  CalendarCheck, 
  ShoppingBag, 
  ArrowUpRight,
  Globe,
  ChevronDown,
  Phone,
  Coffee,
  Salad,
  Sandwich,
  Cake
} from 'lucide-react';
import { usePizzaSettingsStore, DEFAULT_FOOD_DELIVERY_URL, DEFAULT_TABLE_RESERVATION_URL } from '../store/pizzaSettingsStore';
import PizzaSlideshow from '../../components/PizzaSlideshow';

interface GloriaFoodLandingProps {
  onSwitchToCustom?: () => void;
}

// 7 Categorie Complete con 3 Specialità Reali Ciascuna (21 Articoli Totali)
const SHOWCASE_CATEGORIES = [
  {
    id: 'pizza',
    name: { IT: 'Pizze Tradizionali', EN: 'Classic Pizzas', TH: 'พิซซ่าคลาสสิค', DE: 'Klassische Pizzas' },
    icon: Pizza,
    items: [
      {
        id: 'pizza-margherita',
        nameIt: 'PIZZA MARGHERITA',
        nameEn: 'PIZZA MARGHERITA',
        nameTh: 'พิซซ่ามาร์การิต้า',
        nameDe: 'PIZZA MARGHERITA',
        descIt: 'Salsa di Pomodoro, Olio d\'Oliva, Mozzarella Fiordilatte',
        descEn: 'Tomato Sauce, Olive Oil, Mozzarella Cheese',
        descTh: 'ซอสมะเขือเทศ, น้ำมันมะกอก, มอสซาเรลล่าชีส',
        descDe: 'Tomatensauce, Olivenöl, Mozzarella-Käse',
        price: '190฿',
        image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/02-pizza-margherita.webp',
        badge: { IT: 'I Love Italy 🇮🇹', EN: 'I Love Italy 🇮🇹', TH: 'ยอดนิยม 🇮🇹', DE: 'I Love Italy 🇮🇹' }
      },
      {
        id: 'pizza-ham-cheese',
        nameIt: 'PIZZA HAM & CHEESE',
        nameEn: 'PIZZA HAM & CHEESE',
        nameTh: 'พิซซ่าแฮมและชีส',
        nameDe: 'PIZZA SCHINKEN & KÄSE',
        descIt: 'Salsa di Pomodoro, Olio d\'Oliva, Prosciutto, Uovo, Mozzarella',
        descEn: 'Tomato Sauce, Olive Oil, Ham, Egg, Mozzarella Cheese',
        descTh: 'ซอสมะเขือเทศ, น้ำมันมะกอก, แฮม, ไข่, มอสซาเรลล่าชีส',
        descDe: 'Tomatensauce, Olivenöl, Schinken, Ei, Mozzarella',
        price: '250฿',
        image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/06-pizza-ham-and-cheese.webp',
        badge: { IT: 'Bestseller ⭐', EN: 'Bestseller ⭐', TH: 'ขายดี ⭐', DE: 'Bestseller ⭐' }
      },
      {
        id: 'calzone-classico',
        nameIt: 'CALZONE CLASSICO',
        nameEn: 'CLASSIC CALZONE',
        nameTh: 'คัลโซเน่สูตรดั้งเดิม',
        nameDe: 'KLASSISCHE CALZONE',
        descIt: 'Salsa di Pomodoro, Olio d\'Oliva, Mozzarella Filante al Forno',
        descEn: 'Tomato Sauce, Olive Oil, Melted Oven-Baked Mozzarella',
        descTh: 'ซอสมะเขือเทศ, น้ำมันมะกอก, ชีสมอสซาเรลล่าอบร้อนๆ',
        descDe: 'Tomatensauce, Olivenöl, Ofengebackener Mozzarella',
        price: '210฿',
        image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/04-calzone.webp',
        badge: { IT: 'Tradizione 🍕', EN: 'Traditional 🍕', TH: 'สูตรต้นตำรับ 🍕', DE: 'Traditionell 🍕' }
      }
    ]
  },
  {
    id: 'pasta',
    name: { IT: 'Pasta & Primi Piatti', EN: 'Pasta Dishes', TH: 'พาสต้าอิตาเลียน', DE: 'Pasta-Gerichte' },
    icon: Utensils,
    items: [
      {
        id: 'spaghetti-alla-carbonara',
        nameIt: 'SPAGHETTI ALLA CARBONARA',
        nameEn: 'SPAGHETTI ALLA CARBONARA',
        nameTh: 'สปาเกตตี้ อัลลา คาร์โบนารา',
        nameDe: 'SPAGHETTI CARBONARA',
        descIt: 'Pancetta croccante, uovo fresco, parmigiano e pepe nero',
        descEn: 'Crispy bacon, fresh egg, parmesan cheese, and black pepper',
        descTh: 'สปาเกตตี้คาร์โบนาร่าสูตรอิตาเลียนแท้ เบคอนกรอบ ไข่สด และพาเมซานชีส',
        descDe: 'Knuspriger Speck, frisches Ei, Parmesankäse und schwarzer Pfeffer',
        price: '180฿',
        image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Carbonara/26-spaghetti-alla-carbonara.webp',
        badge: { IT: 'Bestseller 🍝', EN: 'Bestseller 🍝', TH: 'ขายดี 🍝', DE: 'Bestseller 🍝' }
      },
      {
        id: 'spaghetti-amatriciana',
        nameIt: 'SPAGHETTI AMATRICIANA',
        nameEn: 'SPAGHETTI AMATRICIANA',
        nameTh: 'สปาเกตตี้ อามาทริเซียน่า',
        nameDe: 'SPAGHETTI AMATRICIANA',
        descIt: 'Salsa di pomodoro San Marzano, pancetta rosolata e parmigiano',
        descEn: 'San Marzano tomato sauce, sautéed bacon, and parmesan cheese',
        descTh: 'ซอสมะเขือเทศเข้มข้น ผัดกับเบคอนกรอบและชีสสไตล์โรมัน',
        descDe: 'San Marzano Tomatensauce, gebratener Speck und Parmesan',
        price: '160฿',
        image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Amatriciana/16-spaghetti-amatriciana.webp',
        badge: { IT: 'Tradizione 🇮🇹', EN: 'Traditional 🇮🇹', TH: 'สูตรต้นตำรับ 🇮🇹', DE: 'Traditionell 🇮🇹' }
      },
      {
        id: 'spaghetti-flower-power',
        nameIt: 'SPAGHETTI FLOWER POWER',
        nameEn: 'SPAGHETTI FLOWER POWER',
        nameTh: 'สปาเกตตี้ ฟลาวเวอร์ พาวเวอร์',
        nameDe: 'SPAGHETTI FLOWER POWER',
        descIt: 'Specialità esclusiva dello Chef con salsa ricca, cuori di carciofo e aromi gourmet',
        descEn: 'Exclusive Chef Special with rich sauce, tender artichoke hearts, and gourmet herbs',
        descTh: 'สูตรพิเศษประจำร้าน ซอสเข้มข้น หัวใจอาร์ติโชกนำเข้า และเครื่องเทศพรีเมียม',
        descDe: 'Exklusive Küchenchef-Spezialität mit reichhaltiger Sauce und Artischocken',
        price: '230฿',
        image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Flower%20Power/36-spaghetti-flower-power.webp',
        badge: { IT: 'Chef Special ✨', EN: 'Chef Special ✨', TH: 'เมนูซิกเนเจอร์ ✨', DE: 'Chef-Spezial ✨' }
      }
    ]
  },
  {
    id: 'salad',
    name: { IT: 'Insalate Fresche', EN: 'Fresh Salads', TH: 'สลัดเพื่อสุขภาพ', DE: 'Frische Salate' },
    icon: Salad,
    items: [
      {
        id: 'egg-vegetable-salad',
        nameIt: 'INSALATA UOVO E VERDURE',
        nameEn: 'EGG & VEGETABLE SALAD',
        nameTh: 'สลัดไข่และผักสด',
        nameDe: 'EI & GEMÜSESALAT',
        descIt: 'Lattuga mista, uova sode, pomodori e olio extravergine',
        descEn: 'Mixed lettuce, boiled eggs, fresh tomatoes, and olive oil',
        descTh: 'ผักสลัดสดใหม่ ไข่ต้ม มะเขือเทศ และน้ำมันมะกอก',
        descDe: 'Gemischter Salat, gekochte Eier, Tomaten und Olivenöl',
        price: '130฿',
        image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/04-Italian-Salads/01-egg-and-vegetable-salad.webp',
        badge: { IT: 'Fresco 🥗', EN: 'Fresh 🥗', TH: 'สดชื่น 🥗', DE: 'Frisch 🥗' }
      },
      {
        id: 'chicken-salad',
        nameIt: 'INSALATA DI POLLO',
        nameEn: 'CHICKEN SALAD',
        nameTh: 'สลัดไก่อิตาเลียน',
        nameDe: 'HÄHNCHENSALAT',
        descIt: 'Petto di pollo grigliato, verdure croccanti e condimento italiano',
        descEn: 'Grilled chicken breast, crispy fresh greens, Italian dressing',
        descTh: 'อกไก่ย่างนุ่ม ผักสดกรอบ ราดน้ำสลัดสไตล์อิตาเลียน',
        descDe: 'Gegrillte Hähnchenbrust, knackiger Salat, italienisches Dressing',
        price: '190฿',
        image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/04-Italian-Salads/03-chicken-salad.webp',
        badge: { IT: 'Proteico 💪', EN: 'High Protein 💪', TH: 'โปรตีนสูง 💪', DE: 'Proteinreich 💪' }
      },
      {
        id: 'tuna-egg-salad',
        nameIt: 'INSALATA TONNO E UOVO',
        nameEn: 'TUNA & EGG SALAD',
        nameTh: 'สลัดทูน่าและไข่',
        nameDe: 'THUNFISCH & EISALAT',
        descIt: 'Tonno di prima scelta, uovo, lattuga, pomodori e cetrioli',
        descEn: 'Premium tuna, egg, fresh lettuce, tomatoes, and cucumbers',
        descTh: 'ทูน่าคุณภาพพรีเมียม ไข่ต้ม ผักกาดหอม และมะเขือเทศ',
        descDe: 'Thunfisch, Ei, Salat, Tomaten und Gurken',
        price: '190฿',
        image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/04-Italian-Salads/04-tuna-and-egg-salad.webp',
        badge: { IT: 'Gourmet 🐟', EN: 'Gourmet 🐟', TH: 'พรีเมียม 🐟', DE: 'Gourmet 🐟' }
      }
    ]
  },
  {
    id: 'burger-sandwich',
    name: { IT: 'Sandwich & Burger', EN: 'Sandwiches & Burgers', TH: 'แซนด์วิชและเบอร์เกอร์', DE: 'Sandwiches & Burger' },
    icon: Sandwich,
    items: [
      {
        id: 'beef-pizza-burger',
        nameIt: 'BEEF PIZZA BURGER + FRIES',
        nameEn: 'BEEF PIZZA BURGER + FRIES',
        nameTh: 'พิซซ่าเบอร์เกอร์เนื้อ + เฟรนช์ฟรายส์',
        nameDe: 'RIND PIZZA BURGER + POMMES',
        descIt: 'Hamburger di manzo succoso in pane pizza artigianale servito con patatine',
        descEn: 'Juicy beef patty wrapped in artisan pizza bun served with french fries',
        descTh: 'เบอร์เกอร์เนื้อวัวฉ่ำในแป้งพิซซ่า เสิร์ฟพร้อมมันฝรั่งทอด',
        descDe: 'Saftiger Rindfleisch-Burger im Pizzabrötchen mit Pommes',
        price: '220฿',
        image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/06-Pizza-Burgers/03-beef-pizza-burger-with-french-fries.webp',
        badge: { IT: 'Bestseller 🍔', EN: 'Bestseller 🍔', TH: 'ขายดี 🍔', DE: 'Bestseller 🍔' }
      },
      {
        id: 'cheese-pizza-burger',
        nameIt: 'CHEESE PIZZA BURGER + FRIES',
        nameEn: 'CHEESE PIZZA BURGER + FRIES',
        nameTh: 'ชีสพิซซ่าเบอร์เกอร์ + เฟรนช์ฟรายส์',
        nameDe: 'KÄSE PIZZA BURGER + POMMES',
        descIt: 'Burger saporito farcito con formaggio fuso filante e servito con patatine fritte',
        descEn: 'Savory burger packed with melted cheese served with crispy french fries',
        descTh: 'ชีสเบอร์เกอร์ ชีสเยิ้มๆ ในแป้งพิซซ่า เสิร์ฟพร้อมมันฝรั่งทอด',
        descDe: 'Käse-Burger mit geschmolzenem Käse und knusprigen Pommes',
        price: '180฿',
        image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/06-Pizza-Burgers/01-chicken-pizza-burger-with-french-fries.webp',
        badge: { IT: 'Super Cheese 🧀', EN: 'Super Cheese 🧀', TH: 'ชีสเยิ้ม 🧀', DE: 'Extra Käse 🧀' }
      },
      {
        id: 'sandwich-parma',
        nameIt: 'PIZZA SANDWICH PARMA HAM',
        nameEn: 'PIZZA SANDWICH PARMA HAM',
        nameTh: 'พิซซ่าแซนด์วิช พาร์ม่าแฮม',
        nameDe: 'PIZZA SANDWICH PARMASCHINKEN',
        descIt: 'Pane pizza appena sfornato farcito con Prosciutto di Parma e mozzarella fiordilatte',
        descEn: 'Freshly baked pizza bread stuffed with Parma Ham and fresh mozzarella',
        descTh: 'แป้งพิซซ่าอบร้อนประกบไส้พาร์ม่าแฮมและมอสซาเรลล่าชีส',
        descDe: 'Frisch gebackenes Pizzabrot mit Parmaschinken und Mozzarella',
        price: '180฿',
        image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/05-Pizza-Sandwiches/01-pizza-sandwich-parma-ham.webp',
        badge: { IT: 'Specialità 🥪', EN: 'Specialty 🥪', TH: 'แนะนำ 🥪', DE: 'Spezialität 🥪' }
      }
    ]
  },
  {
    id: 'fries',
    name: { IT: 'Patatine Fritte & Fritti', EN: 'French Fries & Sides', TH: 'มันฝรั่งทอดและของทานเล่น', DE: 'Pommes & Snacks' },
    icon: ShoppingBag,
    items: [
      {
        id: 'french-fries-classic',
        nameIt: 'PATATINE FRITTE CLASSICHE',
        nameEn: 'CRISPY FRENCH FRIES',
        nameTh: 'มันฝรั่งทอดกรอบคลาสสิค',
        nameDe: 'KNUSPRIGE POMMES FRITES',
        descIt: 'Patatine dorate e croccanti cotte al momento',
        descEn: 'Golden and crispy french fries fried fresh to order',
        descTh: 'มันฝรั่งทอดสีเหลืองทอง กรอบนอกนุ่มใน ทอดสดใหม่',
        descDe: 'Goldbraun und knusprig frittierte Pommes Frites',
        price: '90฿',
        image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/07-French-Fries/01-french-fries.webp',
        badge: { IT: 'Croccanti 🍟', EN: 'Crispy 🍟', TH: 'กรอบอร่อย 🍟', DE: 'Knusprig 🍟' }
      },
      {
        id: 'fries-sausages',
        nameIt: 'PATATINE & WÜRSTEL',
        nameEn: 'FRENCH FRIES & SAUSAGES',
        nameTh: 'มันฝรั่งทอด & ไส้กรอก',
        nameDe: 'POMMES & WÜRSTCHEN',
        descIt: 'Porzione generosa di patatine fritte con gustosi würstel a rondelle',
        descEn: 'Generous portion of golden fries paired with savory sausage slices',
        descTh: 'มันฝรั่งทอดกรอบเสิร์ฟพร้อมไส้กรอกรมควันหอมอร่อย',
        descDe: 'Große Portion Pommes mit herzhaften Würstchenscheiben',
        price: '160฿',
        image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/07-French-Fries/02-sausages-and-french-fries.webp',
        badge: { IT: 'Per Tutti 🌭', EN: 'Popular 🌭', TH: 'ยอดนิยม 🌭', DE: 'Beliebt 🌭' }
      },
      {
        id: 'fries-onion-rings',
        nameIt: 'PATATINE & ANELLI DI CIPOLLA',
        nameEn: 'FRIES & ONION RINGS',
        nameTh: 'มันฝรั่งทอด & หอมทอดกรอบ',
        nameDe: 'POMMES & ZWIEBELRINGE',
        descIt: 'Mix croccante di patatine e anelli di cipolla dorati in pastella',
        descEn: 'Crispy duo of golden fries and battered deep-fried onion rings',
        descTh: 'ชุดคอมโบมันฝรั่งทอดและหอมทอดชุบแป้งกรอบสีทอง',
        descDe: 'Knuspriges Duo aus Pommes und panierten Zwiebelringen',
        price: '190฿',
        image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/07-French-Fries/03-onion-rings-and-french-fries.webp',
        badge: { IT: 'Sfizioso 🧅', EN: 'Crunchy 🧅', TH: 'กรุบกรอบ 🧅', DE: 'Knusprig 🧅' }
      }
    ]
  },
  {
    id: 'dessert',
    name: { IT: 'Dolci Fatti in Casa', EN: 'Homemade Desserts', TH: 'ขนมหวานโฮมเมด', DE: 'Hausgemachte Desserts' },
    icon: Cake,
    items: [
      {
        id: 'tiramisu-classic',
        nameIt: 'TIRAMISÙ CLASSICO',
        nameEn: 'CLASSIC TIRAMISÙ',
        nameTh: 'ทีรามิสุอิตาเลียนแท้',
        nameDe: 'KLASSISCHES TIRAMISÙ',
        descIt: 'Savoiardi imbevuti di caffè espresso, crema al mascarpone e cacao',
        descEn: 'Ladyfingers soaked in espresso with mascarpone cream & cocoa',
        descTh: 'ทีรามิสุสูตรต้นตำรับ กาแฟเอสเพรสโซ่ ครีมมาสคาโปน และโกโก้',
        descDe: 'Löffelbiskuits in Espresso mit Mascarponecreme und Kakao',
        price: '90฿',
        image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/08-Desserts/03-tiramisu.webp',
        badge: { IT: 'Capolavoro 🍰', EN: 'Masterpiece 🍰', TH: 'สูตรลับ 🍰', DE: 'Meisterwerk 🍰' }
      },
      {
        id: 'affogato-al-caffe',
        nameIt: 'AFFOGATO AL CAFFÈ',
        nameEn: 'AFFOGATO AL CAFFÈ',
        nameTh: 'อัฟโฟกาโต้อัลคาเฟ่',
        nameDe: 'AFFOGATO AL CAFFÈ',
        descIt: 'Pallina di gelato alla vaniglia affogata in un espresso fumante',
        descEn: 'Scoop of vanilla ice cream drowned in hot freshly brewed espresso',
        descTh: 'ไอศกรีมวานิลลา ราดด้วยเอสเพรสโซ่ร้อนเข้มข้น หอมละมุน',
        descDe: 'Kugel Vanilleeis übergossen mit heißem Espresso',
        price: '130฿',
        image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/08-Desserts/01-affogato-al-caffe.webp',
        badge: { IT: 'Espresso & Gelato ☕', EN: 'Espresso & Ice ☕', TH: 'ไอศกรีมกาแฟ ☕', DE: 'Espresso & Eis ☕' }
      },
      {
        id: 'pizza-nutella',
        nameIt: 'PIZZA ALLA NUTELLA',
        nameEn: 'NUTELLA DESSERT PIZZA',
        nameTh: 'พิซซ่านูเทลล่า',
        nameDe: 'NUTELLA PIZZA',
        descIt: 'Base pizza soffice ricoperta di autentica Nutella Ferrero',
        descEn: 'Soft warm pizza crust smothered in authentic Ferrero Nutella',
        descTh: 'แป้งพิซซ่าอบนุ่ม ทาด้วยนูเทลล่าแท้จากอิตาลี',
        descDe: 'Fluffiger Pizzaboden mit echter Ferrero Nutella',
        price: '250฿',
        image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/08-pizza-nutella.webp',
        badge: { IT: 'Goloso 🍫', EN: 'Sweet Tooth 🍫', TH: 'ของหวานยอดฮิต 🍫', DE: 'Schoko-Traum 🍫' }
      }
    ]
  },
  {
    id: 'drinks',
    name: { IT: 'Caffetteria & Bevande', EN: 'Coffee & Drinks', TH: 'กาแฟและเครื่องดื่ม', DE: 'Kaffee & Getränke' },
    icon: Coffee,
    items: [
      {
        id: 'caffe-espresso',
        nameIt: 'CAFFÈ ESPRESSO ITALIANO',
        nameEn: 'ITALIAN ESPRESSO COFFEE',
        nameTh: 'กาแฟเอสเพรสโซ่อิตาเลียน',
        nameDe: 'ITALIENISCHER ESPRESSO',
        descIt: 'Autentico caffè espresso italiano corposo e con crema densa',
        descEn: 'Authentic Italian full-bodied espresso with rich crema',
        descTh: 'เอสเพรสโซ่รสเข้มข้น สกัดสดใหม่ หอมกรุ่นแบบฉบับอิตาลี',
        descDe: 'Authentischer italienischer Espresso mit dichter Crema',
        price: '40฿',
        image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/10-Coffee-Shop/01-caffe-espresso.webp',
        badge: { IT: '100% Espresso ☕', EN: '100% Espresso ☕', TH: 'เอสเพรสโซ่แท้ ☕', DE: '100% Espresso ☕' }
      },
      {
        id: 'cappuccino-italiano',
        nameIt: 'CAPPUCCINO ITALIANO',
        nameEn: 'ITALIAN CAPPUCCINO',
        nameTh: 'คาปูชิโน่อิตาเลียน',
        nameDe: 'ITALIENISCHER CAPPUCCINO',
        descIt: 'Espresso con morbida schiuma di latte montata a vapore',
        descEn: 'Rich espresso balanced with velvety steamed milk foam',
        descTh: 'กาแฟเอสเพรสโซ่ผสมผสานฟองนมนุ่มละมุนลิ้น',
        descDe: 'Espresso mit samtig aufgeschäumter Milch',
        price: '60฿',
        image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/10-Coffee-Shop/03-cappuccino.webp',
        badge: { IT: 'Crema di Latte 🥛', EN: 'Velvety Foam 🥛', TH: 'ฟองนมนุ่ม 🥛', DE: 'Milchschaum 🥛' }
      },
      {
        id: 'fruit-shakes',
        nameIt: 'FRULLATI DI FRUTTA FRESCA',
        nameEn: 'FRESH FRUIT SHAKES',
        nameTh: 'น้ำผลไม้ปั่นสดแท้ 100%',
        nameDe: 'FRISCHE FRUCHT-SHAKES',
        descIt: 'Mango, Passion Fruit, Cocco, Anguria o Banana preparati al momento',
        descEn: 'Mango, Passion Fruit, Coconut, Watermelon or Banana blended fresh',
        descTh: 'มะม่วง เสาวรส มะพร้าว แตงโม หรือกล้วย ปั่นสดใหม่ทุกแก้ว',
        descDe: 'Mango, Passionsfrucht, Kokos, Wassermelone oder Banane frisch gemixt',
        price: '70฿',
        image: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/11-Fruit-Drinks/01-fruit-shakes-choice-of-fruit.webp',
        badge: { IT: '100% Naturale 🥭', EN: '100% Natural 🥭', TH: 'ผลไม้แท้ 🥭', DE: '100% Natürlich 🥭' }
      }
    ]
  }
];

export const GloriaFoodLanding: React.FC<GloriaFoodLandingProps> = ({ onSwitchToCustom }) => {
  const { settings } = usePizzaSettingsStore();
  const [lang, setLang] = useState<'IT' | 'EN' | 'TH' | 'DE'>('IT');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const rawFoodDeliveryUrl = settings?.gloriaFoodDeliveryUrl || DEFAULT_FOOD_DELIVERY_URL;
  const foodDeliveryUrl = (rawFoodDeliveryUrl.includes('flowerpowerpizzaranong') || !rawFoodDeliveryUrl.startsWith('http'))
    ? DEFAULT_FOOD_DELIVERY_URL
    : rawFoodDeliveryUrl;

  const rawTableReservationUrl = settings?.gloriaFoodTableUrl || DEFAULT_TABLE_RESERVATION_URL;
  const tableReservationUrl = (rawTableReservationUrl.includes('flowerpowerpizzaranong') || !rawTableReservationUrl.startsWith('http'))
    ? DEFAULT_TABLE_RESERVATION_URL
    : rawTableReservationUrl;

  // Traduzioni Ufficiali Complete al 100% (Italiano, Inglese, Tailandese, Tedesco)
  const t = {
    IT: {
      title: 'Flower Power Pizza',
      subtitle: 'Ranong, Thailandia',
      tagline1: 'PIZZA & CUCINA ITALIANA',
      tagline2: 'Cuoca Italiana • Ingredienti Importati',
      info1: 'Aperto tutti i giorni',
      info2: '11:00 – 21:30',
      info3: 'Consegna & Ritiro',
      
      // Card 1: Delivery
      card1Title: 'ORDINAZIONE CIBO & PIZZA',
      card1Badge: 'Delivery a Domicilio & Asporto',
      card1Desc: 'Scegli dal nostro menu completo con oltre 50 pizze, primi piatti freschi e dolci artigianali.',
      card1Btn: 'APRI MENU & ORDINA CIBO',
      
      // Card 2: Table Reservation
      card2Title: 'PRENOTAZIONE TAVOLO',
      card2Badge: 'Cena & Relax a Ranong Hotsprings',
      card2Desc: 'Riserva in pochi istanti il tuo tavolo al ristorante per trascorrere una serata speciale da noi.',
      card2Btn: 'PRENOTA UN TAVOLO',

      ctaSubtext: 'Apertura protetta e sicura del portale ufficiale Gloria Food senza errori di sessione',
      
      // Info Grid Labels
      hoursLabel: 'Orario di Apertura',
      locationLabel: 'Sede Ristorante',
      location: 'Ranong Hot Springs, Thailandia',
      viewMaps: 'Vedi su Google Maps',
      contactLabel: 'Contatto Diretto',
      phone: '+66 (0) 949 800 200',
      
      featuresTitle: 'Perché scegliere Flower Power Pizza',
      feat1: 'Farina e Pomodoro San Marzano 100% Made in Italy',
      feat2: 'Cottura tradizionale e ingredienti freschi preparati al momento',
      feat3: 'Consegna rapida in tutta l\'area urbana di Ranong',
      popularTitle: 'La Nostra Vetrina: 3 Specialità per Ogni Reparto',
      allCategoriesTab: 'Tutti i Reparti',
      viewFullMenu: 'Vedi Tutto il Menu su Gloria Food',
      orderItemBtn: 'Ordina',
      portalBadge: 'Gloria Food Ufficiale',
      tryCustom: 'Accesso sviluppatori / tester:',
      switchBtn: 'Visualizza Sistema Custom (React)'
    },
    EN: {
      title: 'Flower Power Pizza',
      subtitle: 'Ranong, Thailand',
      tagline1: 'PIZZA & ITALIAN CUISINE',
      tagline2: 'Italian Chef • Imported Ingredients',
      info1: 'Open Daily',
      info2: '11:00 – 21:30',
      info3: 'Delivery & Pickup',
      
      // Card 1: Delivery
      card1Title: 'FOOD & PIZZA ORDERING',
      card1Badge: 'Home Delivery & Takeaway',
      card1Desc: 'Explore our rich menu with over 50 pizzas, handmade pasta, Italian appetizers, and homemade desserts.',
      card1Btn: 'OPEN MENU & ORDER FOOD',
      
      // Card 2: Table Reservation
      card2Title: 'TABLE RESERVATION',
      card2Badge: 'Dine-in at Ranong Hotsprings',
      card2Desc: 'Book your table in seconds for a delightful dining experience surrounded by nature.',
      card2Btn: 'RESERVE A TABLE',

      ctaSubtext: 'Direct official gateway with seamless mobile and desktop ordering',
      
      // Info Grid Labels
      hoursLabel: 'Opening Hours',
      locationLabel: 'Restaurant Location',
      location: 'Ranong Hot Springs, Thailand',
      viewMaps: 'Open on Google Maps',
      contactLabel: 'Direct Contact',
      phone: '+66 (0) 949 800 200',
      
      featuresTitle: 'Why Choose Flower Power Pizza',
      feat1: '100% Italian Flour & San Marzano Tomatoes',
      feat2: 'Traditional recipes and fresh ingredients made to order',
      feat3: 'Fast delivery across the entire Ranong urban area',
      popularTitle: 'Our Showcase: 3 Specialties from Each Category',
      allCategoriesTab: 'All Departments',
      viewFullMenu: 'View Full Menu on Gloria Food',
      orderItemBtn: 'Order',
      portalBadge: 'Official Gloria Food',
      tryCustom: 'Developer / tester access:',
      switchBtn: 'Preview Custom React Delivery'
    },
    TH: {
      title: 'ฟลาวเวอร์ พาวเวอร์ พิซซ่า',
      subtitle: 'ระนอง, ประเทศไทย',
      tagline1: 'พิซซ่าและอาหารอิตาเลียน',
      tagline2: 'เชฟหญิงชาวอิตาลี • วัตถุดิบนำเข้า',
      info1: 'เปิดบริการทุกวัน',
      info2: '11:00 – 21:30',
      info3: 'บริการจัดส่งและรับที่ร้าน',
      
      // Card 1: Delivery
      card1Title: 'สั่งอาหารและพิซซ่า',
      card1Badge: 'จัดส่งถึงบ้านและรับที่ร้าน',
      card1Desc: 'เลือกสั่งเมนูพิซซ่ากว่า 50 ชนิด พาสต้าเส้นสด อาหารทานเล่น และของหวานอิตาเลียนสูตรโฮมเมด',
      card1Btn: 'เปิดเมนูและสั่งอาหาร',
      
      // Card 2: Table Reservation
      card2Title: 'จองโต๊ะอาหาร',
      card2Badge: 'รับประทานอาหารที่ร้าน บ่อน้ำพุร้อนระนอง',
      card2Desc: 'จองโต๊ะล่วงหน้าอย่างสะดวกรวดเร็ว เพื่อสัมผัสบรรยากาศมื้อค่ำสุดพิเศษ',
      card2Btn: 'จองโต๊ะทันที',

      ctaSubtext: 'เชื่อมต่อระบบการสั่งซื้อและจองโต๊ะอย่างเป็นทางการ สะดวกและปลอดภัย',
      
      // Info Grid Labels
      hoursLabel: 'เวลาเปิด-ปิดทำการ',
      locationLabel: 'ที่ตั้งร้านอาหาร',
      location: 'บ่อน้ำพุร้อนระนอง, ประเทศไทย',
      viewMaps: 'ดูแผนที่บน Google Maps',
      contactLabel: 'ติดต่อเราโดยตรง',
      phone: '+66 (0) 949 800 200',
      
      featuresTitle: 'ทำไมต้องเลือก ฟลาวเวอร์ พาวเวอร์ พิซซ่า',
      feat1: 'แป้งและซอสมะเขือเทศนำเข้าจากอิตาลี 100%',
      feat2: 'สูตรต้นตำรับอิตาลี ปรุงสดใหม่จานต่อจาน',
      feat3: 'บริการจัดส่งรวดเร็วทั่วตัวเมืองระนอง',
      popularTitle: 'เมนูแนะนำ: 3 รายการเด่นจากทุกแผนกอาหาร',
      allCategoriesTab: 'ทุกแผนกอาหาร',
      viewFullMenu: 'ดูเมนูทั้งหมดบน Gloria Food',
      orderItemBtn: 'สั่งซื้อ',
      portalBadge: 'ระบบทางการ Gloria Food',
      tryCustom: 'สำหรับผู้ทดสอบระบบ:',
      switchBtn: 'เปิดระบบจัดส่งใหม่ (React)'
    },
    DE: {
      title: 'Flower Power Pizza',
      subtitle: 'Ranong, Thailand',
      tagline1: 'PIZZA & ITALIENISCHE KÜCHE',
      tagline2: 'Italienische Köchin • Importierte Zutaten',
      info1: 'Täglich geöffnet',
      info2: '11:00 – 21:30',
      info3: 'Lieferung & Abholung',
      
      // Card 1: Delivery
      card1Title: 'ESSEN & PIZZA BESTELLEN',
      card1Badge: 'Lieferung & Abholung',
      card1Desc: 'Wählen Sie aus über 50 Pizzas, frischer Pasta und hausgemachten italienischen Desserts.',
      card1Btn: 'SPEISEKARTE ÖFFNEN & BESTELLEN',
      
      // Card 2: Table Reservation
      card2Title: 'TISCHRESERVIERUNG',
      card2Badge: 'Essen & Entspannen in Ranong Hotsprings',
      card2Desc: 'Reservieren Sie Ihren Tisch für einen besonderen Abend bei uns in Ranong.',
      card2Btn: 'TISCH RESERVIEREN',

      ctaSubtext: 'Sichere Weiterleitung zum offiziellen Gloria Food Bestellsystem',
      
      // Info Grid Labels
      hoursLabel: 'Öffnungszeiten',
      locationLabel: 'Standort des Restaurants',
      location: 'Ranong Hot Springs, Thailand',
      viewMaps: 'Auf Google Maps ansehen',
      contactLabel: 'Direkter Kontakt',
      phone: '+66 (0) 949 800 200',
      
      featuresTitle: 'Warum Flower Power Pizza wählen',
      feat1: '100% italienisches Mehl & San Marzano Tomaten',
      feat2: 'Traditionelle Zubereitung mit täglich frischen Zutaten',
      feat3: 'Schnelle Lieferung im gesamten Stadtgebiet von Ranong',
      popularTitle: 'Unsere Highlights: 3 Spezialitäten aus jeder Kategorie',
      allCategoriesTab: 'Alle Abteilungen',
      viewFullMenu: 'Gesamte Speisekarte auf Gloria Food ansehen',
      orderItemBtn: 'Bestellen',
      portalBadge: 'Offizielles Gloria Food',
      tryCustom: 'Entwickler- / Testerzugang:',
      switchBtn: 'Neues React-Liefersystem anzeigen'
    }
  }[lang];

  const visibleCategories = selectedCategory === 'all'
    ? SHOWCASE_CATEGORIES
    : SHOWCASE_CATEGORIES.filter(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-[#e7e5e4] text-stone-800 pb-16 antialiased" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
      <div className="max-w-6xl mx-auto px-4 mt-20 md:mt-24">
        
        {/* ========================================================================= */}
        {/* HERO BANNER CARD IDENTICO AL 100% AL NOSTRO SITO UFFICIALE (DeliveryMenu) */}
        {/* ========================================================================= */}
        <header className="relative text-stone-100 py-4 lg:py-8 px-4 md:px-8 overflow-hidden rounded-2xl shadow-lg mb-8" style={{ backgroundColor: '#3b3530' }}>
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
              {/* Left Side: Logo & Brand Name */}
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
                    {t.subtitle.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Right Side: Information Details */}
              <div className="flex flex-col justify-between items-center lg:items-end gap-2 text-center lg:text-right max-w-md w-full lg:w-auto my-auto space-y-1">
                <span className="text-xs sm:text-sm md:text-xl lg:text-2xl font-extrabold text-stone-100 tracking-tight block uppercase bg-white/10 lg:bg-transparent px-3 py-0.5 rounded-full lg:p-0">
                  {t.tagline1}
                </span>
                <span className="text-[9px] md:text-xs lg:text-sm font-bold text-[#fca5a5] tracking-widest block uppercase">
                  {t.tagline2}
                </span>
                <div className="flex flex-row flex-wrap justify-center lg:justify-end gap-x-2 gap-y-0.5 text-[9px] md:text-xs font-light text-stone-200">
                  <span>{t.info1}</span>
                  <span>•</span>
                  <span>{t.info2}</span>
                  <span>•</span>
                  <span>{t.info3}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* QUICK INFO GRID IN CIMA: ORARIO, GOOGLE MAPS E CONTATTI RAPIDI (1-CLICK)   */}
        {/* ========================================================================= */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          
          {/* Card 1: Orario di Apertura */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 block font-medium uppercase tracking-wider">{t.hoursLabel}</span>
              <span className="text-sm font-bold text-stone-900">{t.info1} · {t.info2}</span>
            </div>
          </div>

          {/* Card 2: Sede Ristorante & Google Maps */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between gap-3 group hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] text-stone-500 block font-medium uppercase tracking-wider">{t.locationLabel}</span>
                <span className="text-sm font-bold text-stone-900 block leading-tight">{t.location}</span>
                <a
                  href="https://maps.app.goo.gl/6xdREhJ3bu7kzVzY6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-black text-red-600 hover:text-red-700 inline-flex items-center gap-1 mt-1 transition-colors cursor-pointer"
                >
                  <span>{t.viewMaps}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Card 3: Contatti Rapidi & WhatsApp / LINE */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-stone-500 block font-medium uppercase tracking-wider">{t.contactLabel}</span>
                <a href="tel:+66949800200" className="text-sm font-black text-stone-900 hover:text-emerald-600 transition-colors">
                  {t.phone}
                </a>
              </div>
            </div>

            {/* Quick WhatsApp & Line Direct Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://wa.me/66949800200"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-black text-[10px] uppercase tracking-wider py-2 px-3 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <svg viewBox="0 0 175.216 175.552" className="w-3.5 h-3.5 fill-current"><path d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13-.006 10.765 2.816 21.269 8.17 30.517l-8.65 31.59 32.258-8.465c8.896 4.856 18.939 7.408 29.128 7.412h.026c33.73 0 61.162-27.423 61.174-61.13.006-16.347-6.354-31.721-17.895-43.273-11.541-11.552-26.91-17.923-43.033-17.781z"/></svg>
                <span>WhatsApp</span>
              </a>
              <a
                href="https://line.me/ti/p/fdvhy-V1dH"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#06C755] hover:bg-[#05b04c] text-white font-black text-[10px] uppercase tracking-wider py-2 px-3 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629z"/></svg>
                <span>LINE</span>
              </a>
            </div>
          </div>

        </div>

        {/* DUAL ACTION CARDS: 1) ORDINAZIONE CIBO & 2) PRENOTAZIONE TAVOLO */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* CARD 1: ORDINAZIONE CIBO (Delivery & Asporto) */}
          <div className="relative group p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#3b3530] via-[#352f2a] to-[#2b2622] text-white border-2 border-red-500/40 hover:border-red-500 transition-all duration-300 shadow-xl shadow-stone-900/30 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-red-600/15 rounded-full blur-3xl group-hover:bg-red-600/25 transition-all pointer-events-none" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3.5 bg-red-600/20 rounded-2xl border border-red-500/40 text-red-400">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                  {t.card1Badge}
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                  {t.card1Title}
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
                  {t.card1Desc}
                </p>
              </div>
            </div>

            <div className="pt-6">
              <a
                href={foodDeliveryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-sm sm:text-base uppercase tracking-wider shadow-lg shadow-red-900/50 hover:shadow-red-600/60 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 border border-white/20 cursor-pointer"
              >
                <Pizza className="w-5 h-5" />
                <span>{t.card1Btn}</span>
                <ArrowUpRight className="w-4 h-4 text-white/80" />
              </a>
            </div>
          </div>

          {/* CARD 2: PRENOTAZIONE TAVOLO (Table Reservation) */}
          <div className="relative group p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#3b3530] via-[#352f2a] to-[#2b2622] text-white border-2 border-amber-500/40 hover:border-amber-500 transition-all duration-300 shadow-xl shadow-stone-900/30 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-600/15 rounded-full blur-3xl group-hover:bg-amber-600/25 transition-all pointer-events-none" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3.5 bg-amber-600/20 rounded-2xl border border-amber-500/40 text-amber-400">
                  <CalendarCheck className="w-7 h-7" />
                </div>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {t.card2Badge}
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                  {t.card2Title}
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
                  {t.card2Desc}
                </p>
              </div>
            </div>

            <div className="pt-6">
              <a
                href={tableReservationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-sm sm:text-base uppercase tracking-wider shadow-lg shadow-amber-950/40 hover:shadow-amber-600/50 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 border border-white/20 cursor-pointer"
              >
                <Utensils className="w-5 h-5 text-stone-950" />
                <span>{t.card2Btn}</span>
                <ArrowUpRight className="w-4 h-4 text-stone-950/80" />
              </a>
            </div>
          </div>

        </div>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-2 text-xs text-stone-500 mb-10 text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{t.ctaSubtext}</span>
        </div>

        {/* ========================================================================= */}
        {/* VETRINA COMPLETA: 3 SPECIALITÀ PER OGNI REPARTO (Pizze, Pasta, Salads...) */}
        {/* ========================================================================= */}
        <div className="w-full mb-12">
          
          {/* Header Vetrina */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-600" />
                {t.popularTitle}
              </h2>
            </div>
            <a
              href={foodDeliveryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{t.viewFullMenu}</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          {/* Filtro Rapido Categorie */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {t.allCategoriesTab}
            </button>
            {SHOWCASE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              const catName = cat.name[lang];

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{catName}</span>
                </button>
              );
            })}
          </div>

          {/* Griglia delle Sezioni Categorie (3 articoli per ciascuna) */}
          <div className="space-y-10">
            {visibleCategories.map((cat) => {
              const Icon = cat.icon;
              const catName = cat.name[lang];

              return (
                <div key={cat.id} className="space-y-4">
                  
                  {/* Titolo Reparto */}
                  <div className="flex items-center gap-2.5 pb-2 border-b border-stone-300/80">
                    <div className="p-1.5 bg-red-600/10 text-red-600 rounded-lg">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                      {catName}
                    </h3>
                  </div>

                  {/* 3 Articoli del Reparto */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {cat.items.map((dish) => {
                      const name = lang === 'IT' ? dish.nameIt : lang === 'TH' ? dish.nameTh : lang === 'DE' ? dish.nameDe : dish.nameEn;
                      const desc = lang === 'IT' ? dish.descIt : lang === 'TH' ? dish.descTh : lang === 'DE' ? dish.descDe : dish.descEn;
                      const badge = dish.badge[lang];

                      return (
                        <a
                          key={dish.id}
                          href={foodDeliveryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group rounded-3xl bg-white border border-stone-200 hover:border-red-400 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-md hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
                        >
                          <div>
                            {/* Real Dish WebP Photo */}
                            <div className="relative h-48 w-full bg-stone-100 overflow-hidden flex items-center justify-center p-3">
                              <img 
                                src={dish.image} 
                                alt={name}
                                className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300 filter drop-shadow-md"
                                loading="lazy"
                              />
                              <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-stone-900/90 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md">
                                {badge}
                              </span>
                            </div>

                            {/* Dish Info */}
                            <div className="p-5 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-black text-stone-900 text-sm group-hover:text-red-700 transition-colors uppercase tracking-tight leading-snug">
                                  {name}
                                </h4>
                                <span className="px-2.5 py-0.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-mono font-black text-xs shrink-0">
                                  {dish.price}
                                </span>
                              </div>
                              <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
                                {desc}
                              </p>
                            </div>
                          </div>

                          {/* Order Link Action */}
                          <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-stone-100 mt-auto">
                            <span className="text-[11px] font-bold text-red-600 group-hover:text-red-700 flex items-center gap-1">
                              <span>{t.orderItemBtn}</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-[10px] text-stone-400 font-medium">{t.portalBadge}</span>
                          </div>
                        </a>
                      );
                    })}
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* Features / Quality Section */}
        <div className="w-full p-6 sm:p-8 rounded-3xl bg-[#3b3530] text-white shadow-xl mb-12">
          <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-[#f87171]" />
            {t.featuresTitle}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-xs text-stone-200 leading-relaxed">{t.feat1}</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-xs text-stone-200 leading-relaxed">{t.feat2}</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-xs text-stone-200 leading-relaxed">{t.feat3}</span>
            </div>
          </div>
        </div>

        {/* Optional Tester Switcher */}
        {onSwitchToCustom && (
          <div className="pt-4 text-center border-t border-stone-300 w-full flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className="text-xs text-stone-500">{t.tryCustom}</span>
            <button
              type="button"
              onClick={onSwitchToCustom}
              className="px-4 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 border border-stone-300 text-xs font-bold transition-all cursor-pointer"
            >
              {t.switchBtn}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
