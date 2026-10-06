import { X, Trash2, Plus, Minus, ShoppingBag, Phone, Sparkles, ArrowLeft, Wine, GlassWater, Coffee, CupSoda, ChevronRight, ChevronDown, ExternalLink, UtensilsCrossed } from 'lucide-react';
import { useCartStore, calcItemTotal, CartItem } from '../store/cartStore';
import { fetchPizzeriaStatus, calculateServiceState, DEFAULT_PIZZERIA_STATUS } from '../services/pizzaServiceStatus';
import { checkFirstOrderEligibility, getOrCreateDeviceId } from '../services/firstOrderService';
import {
  PizzaPromoCode,
  validatePizzaPromoCode,
  getAppliedPizzaPromo,
} from '../services/pizzaPromoService';
import { withCacheBust } from '../utils/cacheBust';
import { useState, useEffect } from 'react';
import { useLanguageStore } from '../store/languageStore';
import { Language } from '../config/languages';
import { MenuItem, Variant, ExtraOption, menuData } from '../data/menuData';
import { TableReservationModal } from './TableReservationModal';

interface Props {
  onCheckout: () => void;
  onSelectCategory?: (categoryId: string) => void;
  onContinueShopping?: () => void;
  lang?: Language;
  isDiningMode?: boolean;
  tableNumber?: string;
}

export interface QuickDrinkItem {
  id: string;
  name: string;
  nameTh: string;
  nameIt: string;
  nameDe: string;
  price: number;
  image: string;
  category: string;
}

const findMenuItem = (id: string): MenuItem | undefined => {
  for (const cat of menuData) {
    const it = cat.items.find((i) => i.id === id);
    if (it) return it;
  }
  return undefined;
};

const makePairingItem = (id: string, category: string, overrides?: Partial<QuickDrinkItem>): QuickDrinkItem => {
  const m = findMenuItem(id);
  if (!m) {
    return {
      id,
      name: overrides?.name || id,
      nameTh: overrides?.nameTh || id,
      nameIt: overrides?.nameIt || id,
      nameDe: overrides?.nameDe || id,
      price: overrides?.price || 0,
      image: overrides?.image || '',
      category,
      ...overrides,
    };
  }
  return {
    id: m.id,
    name: m.name,
    nameTh: m.nameTh || m.name,
    nameIt: m.nameIt || m.name,
    nameDe: m.nameDe || m.name,
    price: m.price,
    image: m.image,
    category,
    ...overrides,
  };
};

export const PAIRING_POOLS: Record<
  string,
  {
    id: string;
    categoryKey: string;
    icon: string;
    items: QuickDrinkItem[];
  }
> = {
  'soft-drinks': {
    id: 'soft-drinks',
    categoryKey: 'soft-drinks',
    icon: '🥤',
    items: [
      makePairingItem('soft-drink-cans', 'soft-drinks', {
        id: 'soft-drink-coke',
        name: 'Coca-Cola (Can)',
        nameTh: 'โค้ก (กระป๋อง)',
        nameIt: 'Coca-Cola (Lattina)',
        nameDe: 'Coca-Cola (Dose)',
        price: 30,
      }),
      makePairingItem('soft-drink-cans', 'soft-drinks', {
        id: 'soft-drink-coke-zero',
        name: 'Coke Zero (Can)',
        nameTh: 'โค้ก ซีโร่ (กระป๋อง)',
        nameIt: 'Coca-Cola Zero (Lattina)',
        nameDe: 'Cola Zero (Dose)',
        price: 30,
      }),
      makePairingItem('soft-drink-cans', 'soft-drinks', {
        id: 'soft-drink-sprite',
        name: 'Sprite (Can)',
        nameTh: 'สไปรท์ (กระป๋อง)',
        nameIt: 'Sprite (Lattina)',
        nameDe: 'Sprite (Dose)',
        price: 30,
      }),
      makePairingItem('soda-water', 'soft-drinks', {
        id: 'soda-water-singha',
        name: 'Soda Water (Bottle)',
        nameTh: 'น้ำโซดา (ขวด)',
        nameIt: 'Acqua Gassata / Soda',
        nameDe: 'Sodawasser (Flasche)',
        price: 20,
      }),
      makePairingItem('drinking-water', 'soft-drinks', {
        id: 'mineral-water-bottle',
        name: 'Mineral Water (Bottle)',
        nameTh: 'น้ำดื่มขวด',
        nameIt: 'Acqua Naturale (Bottiglia)',
        nameDe: 'Mineralwasser (Flasche)',
        price: 20,
      }),
    ],
  },
  'coffee-shop': {
    id: 'coffee-shop',
    categoryKey: 'coffee-shop',
    icon: '☕',
    items: [
      makePairingItem('caffè-espresso', 'coffee-shop'),
      makePairingItem('cappuccino', 'coffee-shop'),
      makePairingItem('americano', 'coffee-shop'),
      makePairingItem('latte-macchiato', 'coffee-shop'),
    ],
  },
  'desserts': {
    id: 'desserts',
    categoryKey: 'desserts',
    icon: '🍰',
    items: [
      makePairingItem('tiramisu', 'desserts'),
      makePairingItem('cake-of-the-day', 'desserts'),
      makePairingItem('affogato-al-caffè', 'desserts'),
      makePairingItem('crepes', 'desserts'),
    ],
  },
  'random-pizzas': {
    id: 'traditional-italian-pizza',
    categoryKey: 'traditional-italian-pizza',
    icon: '🍕',
    items: [
      makePairingItem('pizza-margherita', 'traditional-italian-pizza'),
      makePairingItem('pizza-marinara-vegan', 'traditional-italian-pizza'),
    ],
  },
  'random-pasta': {
    id: 'pasta',
    categoryKey: 'pasta',
    icon: '🍝',
    items: [
      makePairingItem('spaghetti-alla-carbonara', 'pasta'),
      makePairingItem('spaghetti-alla-bolognese', 'pasta'),
    ],
  },
  'random-snacks': {
    id: 'french-fries',
    categoryKey: 'french-fries',
    icon: '🍟',
    items: [
      makePairingItem('french-fries', 'french-fries'),
      makePairingItem('pizza-sandwich-parma-ham', 'pizza-sandwich'),
    ],
  },
};

const EXCLUDED_CATEGORIES = new Set([
  'desserts',
  'breakfast-and-snacks',
  'coffee-shop',
  'fruit-drinks',
  'soft-drinks',
  'beers',
  'wines',
  'beers-and-wines',
]);

const getProductCategory = (productId: string): string => {
  for (const cat of menuData) {
    if (cat.items.some((it) => it.id === productId)) {
      return cat.id;
    }
  }
  return '';
};

const resolveDishImage = (item: any): string => {
  if (item?.image && typeof item.image === 'string' && item.image.trim().length > 0) {
    return item.image;
  }
  const pid = (item?.productId || item?.id || '').trim().toLowerCase();
  const name = (item?.name || '').trim().toLowerCase();
  const nameIt = (item?.nameIt || '').trim().toLowerCase();

  for (const cat of menuData) {
    for (const m of cat.items) {
      if (pid && m.id.toLowerCase() === pid) return m.image;
      if (name && m.name.toLowerCase() === name) return m.image;
      if (nameIt && (m.nameIt?.toLowerCase() === nameIt || m.name_it?.toLowerCase() === nameIt)) return m.image;
    }
  }
  return '';
};

const labels = {
  IT: {
    title: 'Il Tuo Carrello',
    emptyTitle: 'Il tuo carrello è vuoto',
    emptyDesc: 'Scegli le specialità preparate con cura dalla nostra cuoca italiana',
    totalText: 'TOTALE DA PAGARE',
    subtotalText: 'Subtotale piatti',
    firstOrderDiscountText: 'Sconto 1° Ordine (10%)',
    deliveryText: 'Consegna a Ranong',
    freeText: 'GRATIS',
    freeDeliveryApplied: 'Consegna GRATUITA applicata (Ordine > 300฿)',
    welcomePrivilegeNote: 'Sconto 10% 1° Ordine applicato sui piatti!',
    checkoutBtn: 'PROCEDI AL CHECKOUT',
    continueShoppingBtn: '← Torna al Menù e scegli altri piatti',
    addMoreDishesBtn: '+ Continua a scegliere dal nostro Menù',
    ordersPausedBtn: 'Ordinazioni Momentaneamente Sospese',
    ordersClosedBtn: 'Pizzeria al momento Chiusa',
    callPizzeria: 'Chiama la Pizzeria (Ranong)',
    footerInfo: 'Cucina Italiana Artigianale • Consegna veloce a Ranong',
    pairingRitualTitle: 'Completa il tuo Ordine',
    pairingRitualSubtitle: 'I 3 abbinamenti consigliati dalla nostra cucina',
    slot1Badge: '1. Bibita',
    slot2Badge: '2. Caffè',
    slot3Badge: '3. Dolce',
    openSlot1: 'Tutte le Bibite',
    openSlot2: 'Tutta la Caffetteria',
    openSlot3: 'Tutti i Dessert',
    slotAlt1Badge: '1. Pizza',
    slotAlt2Badge: '2. Pasta',
    slotAlt3Badge: '3. Sfizio',
    openSlotAlt1: 'Tutte le Pizze',
    openSlotAlt2: 'Tutta la Pasta',
    openSlotAlt3: 'Tutti gli Sfizi',
    addDrinkBtn: '+ Aggiungi',
    freeDeliveryRemaining: (amount: number) => `Mancano solo ${amount}฿ per la Consegna GRATIS!`,
    freeDeliveryAchieved: 'Consegna GRATIS sbloccata! 🎉',
    wineDineInBadge: 'Privilegio Cantina • Sconto 10%',
    wineDineInTitle: 'Prenota al Ristorante: 10% di Sconto sulla Bottiglia di Vino',
    wineDineInDesc: 'Riserva un tavolo o capanna nel nostro giardino a Ranong e ricevi subito il 10% di sconto su qualsiasi bottiglia di vino della nostra cantina.',
    wineDineInBtn: 'Prenota Tavolo con Sconto 10% Vino',
    wineDiscountBadge: '-10% SCONTO VINO',
    deliveryIncluded: '✓ Consegna inclusa',
    tableOrderBtn: 'Invia Ordine al Tavolo',
    tableAddMoreBtn: '+ Aggiungi altri piatti / bevande',
  },
  EN: {
    title: 'Your Cart',
    emptyTitle: 'Your cart is empty',
    emptyDesc: 'Select authentic dishes handcrafted by our Italian Chef',
    totalText: 'TOTAL TO PAY',
    subtotalText: 'Dishes subtotal',
    firstOrderDiscountText: '1st Order Discount (10%)',
    deliveryText: 'Ranong Delivery',
    freeText: 'FREE',
    freeDeliveryApplied: 'FREE Delivery applied (Order > 300฿)',
    welcomePrivilegeNote: '10% Welcome Discount applied to your food!',
    checkoutBtn: 'PROCEED TO CHECKOUT',
    continueShoppingBtn: '← Back to Menu & choose more dishes',
    addMoreDishesBtn: '+ Keep choosing from our Menu',
    ordersPausedBtn: 'Orders Temporarily Paused',
    ordersClosedBtn: 'Pizzeria Currently Closed',
    callPizzeria: 'Call Kitchen (Ranong)',
    footerInfo: 'Handcrafted Italian Cuisine • Fast Delivery in Ranong',
    pairingRitualTitle: 'Complete your Meal',
    pairingRitualSubtitle: '3 recommended pairings from our kitchen',
    slot1Badge: '1. Soft Drink',
    slot2Badge: '2. Coffee',
    slot3Badge: '3. Dessert',
    openSlot1: 'All Drinks',
    openSlot2: 'All Coffee & Tea',
    openSlot3: 'All Desserts',
    slotAlt1Badge: '1. Pizza',
    slotAlt2Badge: '2. Pasta',
    slotAlt3Badge: '3. Side Dish',
    openSlotAlt1: 'All Pizzas',
    openSlotAlt2: 'All Pasta',
    openSlotAlt3: 'All Sides',
    addDrinkBtn: '+ Add',
    freeDeliveryRemaining: (amount: number) => `Only ${amount}฿ away from FREE Delivery!`,
    freeDeliveryAchieved: 'FREE Delivery unlocked! 🎉',
    wineDineInBadge: 'Wine Privilege • 10% OFF',
    wineDineInTitle: 'Book at Restaurant: 10% Off Your Wine Bottle',
    wineDineInDesc: 'Reserve a table or bamboo hut in our Ranong garden and get 10% off any Italian or international wine bottle from our cellar.',
    wineDineInBtn: 'Book Table with 10% Wine Discount',
    wineDiscountBadge: '-10% WINE DISCOUNT',
    deliveryIncluded: '✓ Delivery included',
    tableOrderBtn: 'Proceed Table Order',
    tableAddMoreBtn: '+ Add more dishes / drinks',
  },
  TH: {
    title: 'ตะกร้าสินค้าของคุณ',
    emptyTitle: 'ไม่มีสินค้าในตะกร้า',
    emptyDesc: 'เลือกเมนูอร่อยปรุงสดใหม่โดยเชฟหญิงชาวอิตาลีของเรา',
    totalText: 'ยอดชำระเงินสุทธิ',
    subtotalText: 'ยอดรวมอาหาร',
    firstOrderDiscountText: 'ส่วนลดสั่งครั้งแรก (10%)',
    deliveryText: 'ค่าจัดส่งในระนอง',
    freeText: 'ฟรี',
    freeDeliveryApplied: 'จัดส่งฟรี! (ยอดสั่งซื้อครบ 300฿)',
    welcomePrivilegeNote: 'รับส่วนลดพิเศษ 10% สำหรับการสั่งซื้อครั้งแรก!',
    checkoutBtn: 'ดำเนินการชำระเงิน',
    continueShoppingBtn: '← กลับไปเลือกอาหารจากเมนู',
    addMoreDishesBtn: '+ เลือกเมนูอร่อยเพิ่มเติม',
    ordersPausedBtn: 'ระงับการสั่งซื้อชั่วคราว',
    ordersClosedBtn: 'ร้านพิซซ่าปิดบริการในขณะนี้',
    callPizzeria: 'โทรหาร้านพิซซ่า (ระนอง)',
    footerInfo: 'อาหารอิตาเลียนแท้ • จัดส่งรวดเร็วในตัวเมืองระนอง',
    pairingRitualTitle: 'เพิ่มความอร่อยให้มื้อนี้',
    pairingRitualSubtitle: '3 เมนูแนะนำยอดนิยมสำหรับทานคู่กัน',
    slot1Badge: '1. เครื่องดื่ม',
    slot2Badge: '2. กาแฟ',
    slot3Badge: '3. ของหวาน',
    openSlot1: 'ดูเครื่องดื่มทั้งหมด',
    openSlot2: 'ดูกาแฟทั้งหมด',
    openSlot3: 'ดูของหวานทั้งหมด',
    slotAlt1Badge: '1. พิซซ่า',
    slotAlt2Badge: '2. พาสต้า',
    slotAlt3Badge: '3. ทานเล่น',
    openSlotAlt1: 'ดูพิซซ่าทั้งหมด',
    openSlotAlt2: 'ดูพาสต้าทั้งหมด',
    openSlotAlt3: 'ดูของทานเล่นทั้งหมด',
    addDrinkBtn: '+ เพิ่ม',
    freeDeliveryRemaining: (amount: number) => `อีกเพียง ${amount}฿ เพื่อรับสิทธิ์ส่งฟรี!`,
    freeDeliveryAchieved: 'รับสิทธิ์จัดส่งฟรีแล้ว! 🎉',
    wineDineInBadge: 'สิทธิพิเศษไวน์ • ลด 10%',
    wineDineInTitle: 'จองโต๊ะทานที่ร้าน: รับส่วนลด 10% สำหรับไวน์ขวด',
    wineDineInDesc: 'จองโต๊ะหรือซุ้มกระท่อมริมลำธารระนองผ่านเว็บไซต์ รับสิทธิ์ส่วนลดทันที 10% สำหรับไวน์ทุกขวดที่สั่งทานที่ร้าน',
    wineDineInBtn: 'จองโต๊ะพร้อมรับส่วนลดไวน์ 10%',
    wineDiscountBadge: '-10% ส่วนลดไวน์',
    deliveryIncluded: '✓ รวมค่าจัดส่งแล้ว',
    tableOrderBtn: 'สั่งที่โต๊ะเลย',
    tableAddMoreBtn: '+ เลือกอาหารและเครื่องดื่มเพิ่ม',
  },
  DE: {
    title: 'Ihr Warenkorb',
    emptyTitle: 'Ihr Warenkorb ist leer',
    emptyDesc: 'Wählen Sie Spezialitäten unserer italienischen Köchin',
    totalText: 'GESAMTBETRAG',
    subtotalText: 'Zwischensumme Speisen',
    firstOrderDiscountText: 'Erstbesteller-Rabatt (10%)',
    deliveryText: 'Lieferung in Ranong',
    freeText: 'GRATIS',
    freeDeliveryApplied: 'Kostenlose Lieferung angewendet (ab 300฿)',
    welcomePrivilegeNote: '10% Willkommensrabatt auf Speisen angewendet!',
    checkoutBtn: 'ZUR KASSE GEHEN',
    continueShoppingBtn: '← Zurück zur Speisekarte',
    addMoreDishesBtn: '+ Weiter aus der Speisekarte wählen',
    ordersPausedBtn: 'Bestellungen vorübergehend pausiert',
    ordersClosedBtn: 'Pizzeria derzeit geschlossen',
    callPizzeria: 'Pizzeria anrufen (Ranong)',
    footerInfo: 'Handgemachte italienische Küche • Schnelle Lieferung in Ranong',
    pairingRitualTitle: 'Bestellung vervollständigen',
    pairingRitualSubtitle: '3 empfohlene Beigaben aus unserer Küche',
    slot1Badge: '1. Getränk',
    slot2Badge: '2. Kaffee',
    slot3Badge: '3. Dessert',
    openSlot1: 'Alle Getränke',
    openSlot2: 'Alle Kaffees',
    openSlot3: 'Alle Desserts',
    slotAlt1Badge: '1. Pizza',
    slotAlt2Badge: '2. Pasta',
    slotAlt3Badge: '3. Beilage',
    openSlotAlt1: 'Alle Pizzas',
    openSlotAlt2: 'Alle Pasta',
    openSlotAlt3: 'Alle Beilagen',
    addDrinkBtn: '+ Hinzufügen',
    freeDeliveryRemaining: (amount: number) => `Noch ${amount}฿ bis zur GRATIS-Lieferung!`,
    freeDeliveryAchieved: 'GRATIS-Lieferung freigeschaltet! 🎉',
    wineDineInBadge: 'Weinkeller-Vorteil • 10% Rabatt',
    wineDineInTitle: 'Tisch reservieren: 10% Rabatt auf Ihre Weinflasche',
    wineDineInDesc: 'Reservieren Sie einen Tisch oder eine Gartenhütte in Ranong und erhalten Sie 10% Rabatt auf alle Weinflaschen aus unserem Weinkeller.',
    wineDineInBtn: 'Tisch reservieren & 10% Wein-Rabatt sichern',
    wineDiscountBadge: '-10% WEIN-RABATT',
    deliveryIncluded: '✓ Lieferung inklusive',
    tableOrderBtn: 'Bestellung absenden',
    tableAddMoreBtn: '+ Weitere Gerichte hinzufügen',
  },
  MM: {
    title: 'သင်၏ ဈေးဝယ်ခြင်းတောင်း',
    emptyTitle: 'ဈေးဝယ်ခြင်းတောင်းထဲတွင် အရာမရှိသေးပါ',
    emptyDesc: 'ကျွန်ုပ်တို့၏ အီတလီစားဖိုမှူး လက်ရာစစ်စစ် ဟင်းလျာများကို ရွေးချယ်ပါ',
    totalText: 'ကျသင့်ငွေ စုစုပေါင်း',
    subtotalText: 'အစားအသောက် စုစုပေါင်း',
    firstOrderDiscountText: 'ပထမဆုံး အော်ဒါ လျှော့စျေး (10%)',
    deliveryText: 'ရနောင်းမြို့တွင်း ပို့ဆောင်ခ',
    freeText: 'အခမဲ့',
    freeDeliveryApplied: 'အခမဲ့ ပို့ဆောင်ပေးပါသည် (300฿ အထက်)',
    welcomePrivilegeNote: 'ပထမဆုံး အော်ဒါအတွက် 10% အထူးလျှော့စျေး ရရှိပါသည်!',
    checkoutBtn: 'ငွေပေးချေရန် ဆက်သွားမည်',
    continueShoppingBtn: '← မီနူးသို့ ပြန်သွားပြီး အစားအသောက် ထပ်ရွေးမည်',
    addMoreDishesBtn: '+ မီနူးမှ အရသာရှိသော အစားအစာများ ထပ်ရွေးမည်',
    ordersPausedBtn: 'အော်ဒါလက်ခံခြင်း ခေတ္တရပ်နားထားပါသည်',
    ordersClosedBtn: 'ဆိုင်လောလောဆယ် ပိတ်ထားပါသည်',
    callPizzeria: 'ဆိုင်သို့ ဖုန်းခေါ်ဆိုရန် (ရနောင်း)',
    footerInfo: 'အီတလီ အစားအစာစစ်စစ် • ရနောင်းမြို့တွင်း အမြန်ပို့ဆောင်ပေးပါသည်',
    pairingRitualTitle: 'တွဲဖက်စားသုံးရန် အကြံပြုချက်',
    pairingRitualSubtitle: 'ကျွန်ုပ်တို့ မီးဖိုချောင်မှ အကြံပြုထားသော အကောင်းဆုံး ၃ မျိုး',
    slot1Badge: '၁။ အအေး / အချိုရည်',
    slot2Badge: '၂။ ကော်ဖီ',
    slot3Badge: '၃။ အချိုပွဲ',
    openSlot1: 'အအေး / အချိုရည် အားလုံး',
    openSlot2: 'ကော်ဖီနှင့် လက်ဖက်ရည် အားလုံး',
    openSlot3: 'အချိုပွဲ အားလုံး',
    slotAlt1Badge: '၁။ ပီဇာ',
    slotAlt2Badge: '၂။ ပါစတာ',
    slotAlt3Badge: '၃။ အဆာပြေ',
    openSlotAlt1: 'ပီဇာ အားလုံး',
    openSlotAlt2: 'ပါစတာ အားလုံး',
    openSlotAlt3: 'အဆာပြေ အားလုံး',
    addDrinkBtn: '+ ထည့်မည်',
    freeDeliveryRemaining: (amount: number) => `အခမဲ့ ပို့ဆောင်ခ ရရှိရန် ${amount}฿ သာ လိုပါတော့သည်!`,
    freeDeliveryAchieved: 'အခမဲ့ ပို့ဆောင်ခ ရရှိပါပြီ! 🎉',
    wineDineInBadge: 'ဆိုင်တွင် သုံးဆောင်ရန် • 10% လျှော့စျေး',
    wineDineInTitle: 'ဆိုင်တွင် စားပွဲကြိုတင်မှာယူပါ: ဝိုင်ပုလင်း 10% လျှော့စျေး',
    wineDineInDesc: 'ရနောင်း ရေပူစမ်းအနီး ကျွန်ုပ်တို့၏ ဥယျာဉ်စားသောက်ဆိုင်တွင် စားပွဲ သို့မဟုတ် ဝါးတဲကြိုတင်မှာယူပြီး ဝိုင်ပုလင်းတိုင်းအတွက် 10% လျှော့စျေး ရယူလိုက်ပါ။',
    wineDineInBtn: 'စားပွဲကြိုတင်မှာယူပြီး ဝိုင် 10% လျှော့စျေး ရယူမည်',
    wineDiscountBadge: '-10% ဝိုင်လျှော့စျေး',
    deliveryIncluded: '✓ ပို့ဆောင်ခ အခမဲ့ ပါဝင်ပြီး',
    tableOrderBtn: 'စားပွဲသို့ အော်ဒါပို့မည်',
    tableAddMoreBtn: '+ အစားအသောက်/အအေးများ ထပ်ရွေးမည်',
  },
};

const CAN_VARIANTS: Variant[] = [
  {
    id: "10071",
    name: "Coca-Cola",
    nameIt: "Coca-Cola",
    nameTh: "โค้ก (Coca-Cola)",
    nameDe: "Coca-Cola",
    sku: "10071",
    price: 30,
    priceModifier: 0,
  },
  {
    id: "10082",
    name: "Coca-Cola Zero",
    nameIt: "Coca-Cola Zero",
    nameTh: "โค้ก ซีโร่ (Coca-Cola Zero)",
    nameDe: "Coca-Cola Zero",
    sku: "10082",
    price: 30,
    priceModifier: 0,
  },
  {
    id: "10072",
    name: "Fanta Orange",
    nameIt: "Fanta Aranciata",
    nameTh: "แฟนต้า (Fanta)",
    nameDe: "Fanta Orange",
    sku: "10072",
    price: 30,
    priceModifier: 0,
  },
  {
    id: "10073",
    name: "Sprite",
    nameIt: "Sprite",
    nameTh: "สไปรท์ (Sprite)",
    nameDe: "Sprite",
    sku: "10073",
    price: 30,
    priceModifier: 0,
  },
];

const FRUIT_OPTIONS: ExtraOption[] = [
  { id: 'fruit-watermelon', name: 'Watermelon', nameIt: 'Anguria', nameTh: 'แตงโม', nameDe: 'Wassermelone', sku: 'fruit-watermelon', price: 0 },
  { id: 'fruit-pineapple', name: 'Pineapple', nameIt: 'Ananas', nameTh: 'สับปะรด', nameDe: 'Ananas', sku: 'fruit-pineapple', price: 0 },
  { id: 'fruit-banana', name: 'Banana', nameIt: 'Banana', nameTh: 'กล้วย', nameDe: 'Banane', sku: 'fruit-banana', price: 0 },
  { id: 'fruit-papaya', name: 'Papaya', nameIt: 'Papaya', nameTh: 'มะละกอ', nameDe: 'Papaya', sku: 'fruit-papaya', price: 0 },
  { id: 'fruit-lime', name: 'Lime', nameIt: 'Lime', nameTh: 'มะนาว', nameDe: 'Limette', sku: 'fruit-lime', price: 0 },
];

const SUGAR_OPTIONS: ExtraOption[] = [
  { id: 'sugar-none', name: 'No Sugar', nameIt: 'Senza Zucchero', nameTh: 'ไม่หวาน', nameDe: 'Ohne Zucker', sku: 'sugar-none', price: 0 },
  { id: 'sugar-low', name: 'Low Sugar', nameIt: 'Poco Zucchero', nameTh: 'หวานน้อย', nameDe: 'Wenig Zucker', sku: 'sugar-low', price: 0 },
  { id: 'sugar-regular', name: 'Regular Sugar', nameIt: 'Zucchero Classico', nameTh: 'หวานปกติ', nameDe: 'Normaler Zucker', sku: 'sugar-regular', price: 0 },
];

const getFruitEmoji = (fruitId: string) => {
  if (fruitId.includes('watermelon')) return '🍉';
  if (fruitId.includes('pineapple')) return '🍍';
  if (fruitId.includes('banana')) return '🍌';
  if (fruitId.includes('papaya')) return '🧡';
  if (fruitId.includes('lime')) return '🍋';
  return '🍹';
};

const isCannedDrinkItem = (it: CartItem): boolean => {
  return (
    it.productId === 'soft-drink-cans' ||
    it.productId === 'soft-drink-coke' ||
    it.productId === 'soft-drink-coke-zero' ||
    it.productId === 'soft-drink-sprite' ||
    it.productId.startsWith('soft-drink-') ||
    (it.nameIt && it.nameIt.toUpperCase().includes('LATTINA')) ||
    it.name.toUpperCase().includes('CAN') ||
    it.name.toUpperCase().includes('COCA-COLA') ||
    it.name.toUpperCase().includes('SPRITE') ||
    it.name.toUpperCase().includes('FANTA')
  );
};

const isFruitDrinkItem = (it: CartItem): boolean => {
  return (
    it.productId.includes('fruit') ||
    it.productId.includes('shake') ||
    it.productId.includes('smoothie') ||
    it.productId.includes('lassi') ||
    it.productId.includes('frapp') ||
    Boolean(it.selectedExtras && it.selectedExtras.some((e) => e.id.startsWith('fruit-')))
  );
};

export default function CartDrawer({ onCheckout, onSelectCategory, onContinueShopping, lang: propLang, isDiningMode: propIsDiningMode, tableNumber }: Props) {
  const storeLang = useLanguageStore((s) => s.lang);
  const lang = propLang || storeLang || 'IT';
  const { items, isOpen, closeCart, removeItem, updateQuantity, updateCartItem, getTotal, addItem } = useCartStore();

  const isDiningMode = propIsDiningMode || (typeof window !== 'undefined' && (
    window.location.pathname.includes('/dining') || 
    window.location.pathname.includes('/tavoli') || 
    window.location.pathname.includes('/table')
  ));

  const handleContinueShopping = () => {
    closeCart();
    if (onContinueShopping) {
      onContinueShopping();
    }
  };
  const subtotal = getTotal();
  const [isEligible, setIsEligible] = useState(true);
  const [showTableModal, setShowTableModal] = useState(false);
  const [isWineReservation, setIsWineReservation] = useState(false);
  const [reservationNotes, setReservationNotes] = useState('');

  const handleOpenWineReservation = () => {
    const note = lang === 'TH'
      ? 'สิทธิพิเศษส่วนลดไวน์ 10% (จองผ่านเว็บไซต์)'
      : lang === 'IT'
      ? 'Privilegio Cantina: Sconto 10% sulla Bottiglia di Vino (Prenotato dal sito)'
      : lang === 'DE'
      ? '10% Weinkeller-Rabatt auf Flasche (Online reserviert)'
      : '10% Wine Bottle Discount Privilege (Online Reservation)';
    setReservationNotes(note);
    setIsWineReservation(true);
    setShowTableModal(true);
  };

  const hasMainFoodInCart =
    items.length === 0 ||
    items.some((item) => {
      const cat = getProductCategory(item.productId);
      return cat ? !EXCLUDED_CATEGORIES.has(cat) : true;
    });

  // Promo Code State
  const [appliedPromo, setAppliedPromo] = useState<PizzaPromoCode | null>(() => getAppliedPizzaPromo());

  // Check first order eligibility (only for online delivery)
  useEffect(() => {
    if (isDiningMode) return;
    let active = true;
    const deviceId = getOrCreateDeviceId();
    let savedPhone = '';
    try { savedPhone = localStorage.getItem('fp_pizza_customer_phone') || ''; } catch {}
    let savedEmail = '';
    try { savedEmail = localStorage.getItem('fp_pizza_customer_email') || ''; } catch {}

    checkFirstOrderEligibility({ phone: savedPhone, email: savedEmail, deviceId }).then((res) => {
      if (active) {
        setIsEligible(res.eligible);
      }
    });

    return () => { active = false; };
  }, [isOpen, isDiningMode]);

  const handleQuickAddDrink = (drink: QuickDrinkItem) => {
    addItem({
      productId: drink.id,
      name: drink.name,
      nameTh: drink.nameTh,
      nameIt: drink.nameIt,
      nameDe: drink.nameDe,
      quantity: 1,
      basePrice: drink.price,
      image: drink.image,
      selectedVariant: null,
      selectedExtras: [],
    });
  };

  // NON-STACKING DISCOUNT ENGINE
  let discountAmount = 0;
  let isDiscountActive = false;

  if (isDiningMode) {
    discountAmount = Math.round(subtotal * 0.05);
    isDiscountActive = true;
  } else if (appliedPromo) {
    const res = validatePizzaPromoCode(appliedPromo.code, subtotal);
    if (res.valid) {
      discountAmount = res.discountAmount;
      isDiscountActive = true;
    }
  } else if (isEligible) {
    discountAmount = Math.round(subtotal * 0.1);
    isDiscountActive = true;
  }

  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const deliveryFee = isDiningMode ? 0 : (subtotal >= 300 ? 0 : 30);
  const finalTotal = isDiningMode ? subtotalAfterDiscount : (subtotalAfterDiscount + deliveryFee);
  const t = labels[lang];

  const [serviceCalc, setServiceCalc] = useState(() => calculateServiceState(DEFAULT_PIZZERIA_STATUS));

  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      const st = await fetchPizzeriaStatus();
      if (isMounted) setServiceCalc(calculateServiceState(st));
    };
    check();

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('flower_power_service_status');
      bc.onmessage = (ev) => {
        if (ev.data?.type === 'STATUS_UPDATED' && ev.data?.status && isMounted) {
          setServiceCalc(calculateServiceState(ev.data.status));
        }
      };
    } catch (e) {}

    return () => {
      isMounted = false;
      if (bc) bc.close();
    };
  }, []);

  const getTranslatedName = (o: { name: string; nameTh?: string; nameIt?: string; nameDe?: string; nameMm?: string; name_mm?: string; productId?: string; id?: string }) => {
    const pid = (o.productId || o.id || '').trim().toLowerCase();
    if (lang === 'MM') {
      if (o.nameMm || o.name_mm) return o.nameMm || o.name_mm;
      if (pid) {
        for (const cat of menuData) {
          const found = cat.items.find(m => m.id.toLowerCase() === pid);
          if (found && (found.nameMm || found.name_mm)) return found.nameMm || found.name_mm;
        }
      }
    }
    if (lang === 'TH') {
      if (o.nameTh) return o.nameTh;
      if (pid) {
        for (const cat of menuData) {
          const found = cat.items.find(m => m.id.toLowerCase() === pid);
          if (found && found.nameTh) return found.nameTh;
        }
      }
    }
    if (lang === 'IT') {
      if (o.nameIt) return o.nameIt;
      if (pid) {
        for (const cat of menuData) {
          const found = cat.items.find(m => m.id.toLowerCase() === pid);
          if (found && (found.nameIt || found.name_it)) return found.nameIt || found.name_it;
        }
      }
    }
    if (lang === 'DE') {
      if (o.nameDe) return o.nameDe;
      if (pid) {
        for (const cat of menuData) {
          const found = cat.items.find(m => m.id.toLowerCase() === pid);
          if (found && (found.nameDe || found.name_de)) return found.nameDe || found.name_de;
        }
      }
    }
    return o.name;
  };

  const formatProductName = (name: string) => {
    if (!name) return "";
    if (name.includes('\n')) {
      const lines = name.split('\n');
      return (
        <>
          {lines.map((line, idx) => (
            <span key={idx} className="block">
              {line}
            </span>
          ))}
        </>
      );
    }
    const splitKeywords = [' WITH ', ' CON ', ' พร้อม', ' MIT ', ' နှင့် '];
    const upperName = name.toUpperCase();
    for (const kw of splitKeywords) {
      if (upperName.includes(kw)) {
        const idx = upperName.indexOf(kw);
        const part1 = name.substring(0, idx);
        const matchWord = name.substring(idx, idx + kw.length);
        const part2 = name.substring(idx + kw.length);
        return (
          <>
            {part1}
            <br />
            {matchWord.trimStart()}{part2}
          </>
        );
      }
    }
    return name;
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={closeCart}
        />
      )}

      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col w-full sm:max-w-[480px] bg-stone-100 text-stone-900 border-l border-stone-300 shadow-2xl transition-transform duration-300 ease-out"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          fontFamily: lang === 'TH' ? 'Prompt, Kanit, Outfit, system-ui, sans-serif' : 'Outfit, system-ui, sans-serif'
        }}
      >
        {/* BRIGHT CRISP HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-white shadow-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleContinueShopping}
              className="p-1.5 -ml-1 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
              title="Torna al menu"
            >
              <ArrowLeft size={16} className="text-[#8B1E1E]" />
              <span className="hidden sm:inline">Menu</span>
            </button>
            <div className="h-4 w-px bg-stone-200 mx-0.5" />
            <ShoppingBag size={18} className="text-[#8B1E1E]" />
            <span className="text-stone-900 text-sm sm:text-base font-black tracking-tight uppercase">
              {t.title}
            </span>
            {items.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#8B1E1E] flex items-center justify-center text-white text-[11px] font-black ml-1 shadow-xs">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* DRAWER SCROLLABLE CONTENT (COMPACT & OPTIMIZED FOR FULL VISIBILITY) */}
        <div className="flex-1 overflow-y-auto px-3.5 sm:px-4 py-3 space-y-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {items.length === 0 ? (
            <div className="text-center py-20 px-4 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-stone-400 shadow-sm">
                <ShoppingBag size={26} />
              </div>
              <p className="text-stone-800 text-sm font-bold">{t.emptyTitle}</p>
              <p className="text-stone-500 text-xs max-w-xs mx-auto leading-relaxed">{t.emptyDesc}</p>
              <button
                onClick={handleContinueShopping}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#8B1E1E] hover:bg-[#721818] text-white text-xs font-black uppercase tracking-wider rounded-full shadow-md transition-all cursor-pointer active:scale-95"
              >
                <ArrowLeft size={13} />
                <span>{t.continueShoppingBtn.replace('← ', '')}</span>
              </button>
            </div>
          ) : (
            <>
              {/* CART ITEMS LIST (COMPACT CRISP CARDS & INLINE CONTROLS) */}
              <div className="space-y-2.5">
                {items.map((item) => {
                  const lineTotal = calcItemTotal(item);
                  return (
                    <div
                      key={item.cartId}
                      className="bg-white border border-stone-200/90 rounded-xl p-2.5 shadow-2xs hover:border-stone-300 transition-all"
                    >
                      <div className="flex gap-3 items-center">
                        {/* Compact 4:3 Photo with Living Breathing Zoom */}
                        <div className="w-20 sm:w-24 aspect-[4/3] rounded-lg overflow-hidden flex-shrink-0 border border-stone-200/90 bg-stone-100 shadow-2xs relative">
                          <img
                            src={withCacheBust(resolveDishImage(item) || item.image)}
                            alt={getTranslatedName(item)}
                            className="w-full h-full object-cover select-none main-dish-zoom"
                          />
                        </div>

                        {/* Details with seamlessly integrated controls */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <p
                                className="text-stone-900 font-bold text-sm leading-snug truncate"
                                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.08rem' }}
                              >
                                {formatProductName(getTranslatedName(item))}
                              </p>
                              <button
                                onClick={() => removeItem(item.cartId)}
                                className="text-stone-400 hover:text-[#8B1E1E] transition-colors p-0.5 hover:bg-stone-50 rounded-lg cursor-pointer shrink-0"
                                title="Elimina"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            {/* Interactive In-Cart Flavor / Can / Fruit / Sugar Dropdown Selectors */}
                            {isCannedDrinkItem(item) ? (
                              <div className="mt-1 pt-1 border-t border-stone-100 flex items-center justify-between gap-2">
                                <span className="text-[9.5px] font-bold text-stone-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                                  <span>🥤</span>
                                  <span>{lang === 'TH' ? 'รสชาติ:' : lang === 'DE' ? 'Dose:' : lang === 'EN' ? 'Can:' : 'Lattina:'}</span>
                                </span>
                                <div className="relative flex-1 min-w-0 max-w-[170px]">
                                  <select
                                    value={
                                      item.selectedVariant?.id ||
                                      (item.productId === 'soft-drink-coke' ? '10071' :
                                       item.productId === 'soft-drink-coke-zero' ? '10082' :
                                       item.productId === 'soft-drink-sprite' ? '10073' :
                                       CAN_VARIANTS.find(v => item.name.toLowerCase().includes(v.name.toLowerCase()))?.id || '10071')
                                    }
                                    onChange={(e) => {
                                      const v = CAN_VARIANTS.find((cand) => cand.id === e.target.value);
                                      if (v) {
                                        updateCartItem(item.cartId, {
                                          selectedVariant: v,
                                          name: 'SOFT DRINK CANS',
                                          nameIt: 'BIBITE IN LATTINA',
                                          nameTh: 'กระป๋องน้ำอัดลม',
                                          nameDe: 'ERFRISCHUNGSGETRÄNKE',
                                        });
                                      }
                                    }}
                                    className="w-full text-[10.5px] font-bold py-0.5 pl-2 pr-5 bg-stone-50 hover:bg-stone-100 border border-stone-300 rounded-md text-stone-900 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#8B1E1E] truncate"
                                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                                  >
                                    {CAN_VARIANTS.map((v) => (
                                      <option key={v.id} value={v.id}>
                                        {getTranslatedName(v)}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
                                </div>
                              </div>
                            ) : isFruitDrinkItem(item) ? (
                              <div className="mt-1 pt-1 border-t border-stone-100 flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                                {/* Fruit Dropdown */}
                                <div className="relative flex-1 min-w-[110px]">
                                  <select
                                    value={
                                      (item.selectedExtras || []).find((e) => e.id.startsWith('fruit-'))?.id || FRUIT_OPTIONS[0].id
                                    }
                                    onChange={(e) => {
                                      const fruit = FRUIT_OPTIONS.find((f) => f.id === e.target.value);
                                      if (fruit) {
                                        const otherExtras = (item.selectedExtras || []).filter((e) => !e.id.startsWith('fruit-'));
                                        updateCartItem(item.cartId, {
                                          selectedExtras: [...otherExtras, fruit],
                                        });
                                      }
                                    }}
                                    className="w-full text-[10px] font-bold py-0.5 pl-2 pr-5 bg-amber-50/90 hover:bg-amber-100/90 border border-amber-300/80 rounded-md text-amber-950 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500 truncate"
                                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                                  >
                                    {FRUIT_OPTIONS.map((fruit) => (
                                      <option key={fruit.id} value={fruit.id}>
                                        {getFruitEmoji(fruit.id)} {getTranslatedName(fruit)}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-amber-800 pointer-events-none" />
                                </div>

                                {/* Sugar Level Dropdown */}
                                <div className="relative flex-1 min-w-[95px]">
                                  <select
                                    value={
                                      (item.selectedExtras || []).find((e) => e.id.startsWith('sugar-'))?.id || SUGAR_OPTIONS[0].id
                                    }
                                    onChange={(e) => {
                                      const sugar = SUGAR_OPTIONS.find((s) => s.id === e.target.value);
                                      if (sugar) {
                                        const otherExtras = (item.selectedExtras || []).filter((e) => !e.id.startsWith('sugar-'));
                                        updateCartItem(item.cartId, {
                                          selectedExtras: [...otherExtras, sugar],
                                        });
                                      }
                                    }}
                                    className="w-full text-[10px] font-semibold py-0.5 pl-2 pr-5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-md text-stone-800 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-stone-400 truncate"
                                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                                  >
                                    {SUGAR_OPTIONS.map((sugar) => (
                                      <option key={sugar.id} value={sugar.id}>
                                        {getTranslatedName(sugar)}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
                                </div>
                              </div>
                            ) : (
                              <>
                                {item.selectedVariant && (
                                  <p className="text-stone-600 text-[11px] font-medium mt-0.5 flex flex-wrap items-center gap-1">
                                    <span className="text-stone-400 font-normal">
                                      {item.productId.includes('beer') || item.productId.includes('water')
                                        ? (lang === 'TH' ? 'ขนาด:' : lang === 'DE' ? 'Format:' : lang === 'EN' ? 'Size:' : 'Formato:')
                                        : (lang === 'TH' ? 'ขนาด:' : lang === 'DE' ? 'Größe:' : lang === 'EN' ? 'Size:' : 'Taglia:')}
                                    </span>
                                    <span className="font-semibold text-stone-700">{getTranslatedName(item.selectedVariant)}</span>
                                    {item.selectedVariant.priceModifier > 0 && (
                                      <span className="text-stone-500 font-semibold whitespace-nowrap">
                                        (+{item.selectedVariant.priceModifier}฿)
                                      </span>
                                    )}
                                  </p>
                                )}

                                {item.selectedExtras && item.selectedExtras.length > 0 && (
                                  <div className="mt-0.5 space-y-0.5">
                                    {item.selectedExtras.map((e) => (
                                      <p key={e.id} className="text-stone-500 text-[10.5px] font-normal flex items-center justify-between gap-1">
                                        <span className="truncate">+ {getTranslatedName(e)}</span>
                                        {e.price > 0 && (
                                          <span className="font-semibold text-stone-600 whitespace-nowrap shrink-0">
                                            (+{e.price}฿)
                                          </span>
                                        )}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}

                            {/* 100% Halal Chicken Badge */}
                            {item.isHalalChicken && (
                              <div className="mt-0.5 inline-flex items-center gap-1 bg-emerald-50 border border-emerald-300 rounded px-1.5 py-0.5">
                                <span className="text-[9px]">🐔</span>
                                <span className="text-emerald-800 text-[9px] font-bold">
                                  {lang === 'TH' ? 'เนื้อไก่ 100%' : lang === 'IT' ? '100% Pollo' : lang === 'DE' ? '100% Geflügel' : '100% Chicken'}
                                </span>
                              </div>
                            )}

                            {/* Lasagna pre-order date badge */}
                            {item.lasagnaDate && (
                              <div className="mt-0.5 inline-flex items-center gap-1 bg-amber-50 border border-amber-300 rounded px-1.5 py-0.5">
                                <span className="text-amber-800 text-[9px] font-bold">
                                  📅 {item.lasagnaDate}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Seamless Inline Controls: Quantity + Price on same clean line */}
                          <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-stone-100">
                            <div className="flex items-center gap-1 bg-stone-100/90 rounded-full px-1.5 py-0.5 border border-stone-200">
                              <button
                                onClick={() => updateQuantity(item.cartId, (item.quantity || 1) - 1)}
                                className="w-4.5 h-4.5 rounded-full bg-white flex items-center justify-center text-stone-700 hover:text-[#8B1E1E] shadow-2xs transition-all cursor-pointer"
                              >
                                <Minus size={9} />
                              </button>
                              <span className="text-stone-900 font-black text-xs w-3 text-center">{item.quantity || 1}</span>
                              <button
                                onClick={() => updateQuantity(item.cartId, (item.quantity || 1) + 1)}
                                className="w-4.5 h-4.5 rounded-full bg-white flex items-center justify-center text-stone-700 hover:text-[#8B1E1E] shadow-2xs transition-all cursor-pointer"
                              >
                                <Plus size={9} />
                              </button>
                            </div>
                            <p className="text-[#8B1E1E] font-black text-sm sm:text-base inline-flex items-baseline gap-0.5">
                              <span>{lineTotal}</span>
                              <span className="text-xs font-black select-none">฿</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 🍹 INNOVATIVE INTERACTIVE PAIRING TRIO (3 VERTICAL CARDS SIDE-BY-SIDE IN A GRID) */}
              <div className="bg-white border border-amber-300/80 rounded-2xl p-3 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between gap-1">
                  <div>
                    <p className="text-xs font-black text-stone-900 tracking-tight flex items-center gap-1 uppercase">
                      <Sparkles size={13} className="text-amber-500 animate-pulse" />
                      <span>{t.pairingRitualTitle}</span>
                    </p>
                    <p className="text-[10px] text-stone-500 font-medium">
                      {t.pairingRitualSubtitle}
                    </p>
                  </div>
                </div>

                {/* 3 VERTICAL CARDS IN A 3-COLUMN GRID - ALL 3 ALWAYS VISIBLE */}
                <div className="grid grid-cols-3 gap-2">
                  {(hasMainFoodInCart
                    ? [
                        {
                          key: 'soft-drinks',
                          targetCategory: 'soft-drinks',
                          badge: t.slot1Badge,
                          pool: PAIRING_POOLS['soft-drinks'],
                          openLabel: t.openSlot1,
                          accentColor: 'from-amber-50/70 via-white to-orange-50/30 border-amber-200/80',
                        },
                        {
                          key: 'coffee-shop',
                          targetCategory: 'coffee-shop',
                          badge: t.slot2Badge,
                          pool: PAIRING_POOLS['coffee-shop'],
                          openLabel: t.openSlot2,
                          accentColor: 'from-stone-50/80 via-white to-amber-50/30 border-stone-200/80',
                        },
                        {
                          key: 'desserts',
                          targetCategory: 'desserts',
                          badge: t.slot3Badge,
                          pool: PAIRING_POOLS['desserts'],
                          openLabel: t.openSlot3,
                          accentColor: 'from-emerald-50/70 via-white to-teal-50/30 border-emerald-200/80',
                        },
                      ]
                    : [
                        {
                          key: 'random-pizzas',
                          targetCategory: 'traditional-italian-pizza',
                          badge: t.slotAlt1Badge,
                          pool: PAIRING_POOLS['random-pizzas'],
                          openLabel: t.openSlotAlt1,
                          accentColor: 'from-amber-50/70 via-white to-orange-50/30 border-amber-200/80',
                        },
                        {
                          key: 'random-pasta',
                          targetCategory: 'pasta',
                          badge: t.slotAlt2Badge,
                          pool: PAIRING_POOLS['random-pasta'],
                          openLabel: t.openSlotAlt2,
                          accentColor: 'from-emerald-50/70 via-white to-teal-50/30 border-emerald-200/80',
                        },
                        {
                          key: 'random-snacks',
                          targetCategory: 'french-fries',
                          badge: t.slotAlt3Badge,
                          pool: PAIRING_POOLS['random-snacks'],
                          openLabel: t.openSlotAlt3,
                          accentColor: 'from-stone-50/80 via-white to-amber-50/30 border-stone-200/80',
                        },
                      ]
                  ).map((slot) => {
                    const currentItem = slot.pool.items[0];
                    return (
                      <div
                        key={slot.key}
                        className={`bg-gradient-to-b ${slot.accentColor} border rounded-xl p-2 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all text-center relative group`}
                      >
                        {/* Top Category Badge */}
                        <div className="mb-1 flex items-center justify-center">
                          <span className="text-[8px] sm:text-[8.5px] font-black uppercase tracking-wider text-stone-700 bg-white/95 px-1 py-0.5 rounded border border-stone-200/70 shadow-2xs truncate max-w-full">
                            {slot.badge}
                          </span>
                        </div>

                        {/* Living 4:3 Photo with Zoom */}
                        <div className="relative w-full aspect-[4/3] bg-white rounded-lg border border-stone-200/80 overflow-hidden shadow-2xs flex items-center justify-center mb-1">
                          <img
                            key={`${slot.key}-${currentItem.id}`}
                            src={withCacheBust(currentItem.image)}
                            alt={getTranslatedName(currentItem)}
                            className="w-full h-full object-cover pairing-forward-zoom"
                          />
                        </div>

                        {/* Item Title (2-line clamp) */}
                        <div className="min-h-[26px] flex items-center justify-center px-0.5 mb-1">
                          <p className="text-[9.5px] sm:text-[10.5px] font-bold text-stone-900 leading-tight line-clamp-2">
                            {getTranslatedName(currentItem)}
                          </p>
                        </div>

                        {/* Category Jump Link */}
                        <button
                          type="button"
                          onClick={() => {
                            closeCart();
                            if (onSelectCategory) onSelectCategory(slot.targetCategory);
                          }}
                          className="text-[8px] sm:text-[8.5px] font-bold text-[#8B1E1E] hover:underline inline-flex items-center justify-center gap-0.5 mb-1.5 cursor-pointer"
                        >
                          <span className="truncate">{slot.openLabel}</span>
                          <ChevronRight size={8} className="shrink-0" />
                        </button>

                        {/* Price & 1-Tap Add Action */}
                        <div className="pt-1 border-t border-stone-200/60 space-y-1">
                          <span className="text-[11px] font-black text-[#8B1E1E] block leading-none">
                            {currentItem.price}฿
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuickAddDrink(currentItem)}
                            className="w-full py-1 bg-[#8B1E1E] hover:bg-[#721818] text-white text-[9px] sm:text-[9.5px] font-black uppercase rounded-lg shadow-2xs hover:shadow transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-0.5"
                          >
                            <Plus size={9} />
                            <span>{t.addDrinkBtn.replace('+ ', '')}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 🍷 PREMIUM ITALIAN WINE & RESTAURANT EXPERIENCE CARD (Only for Home Delivery users, hidden in Dining Tablet mode) */}
              {!isDiningMode && (
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#FFFDF8] via-[#FFF9F2] to-[#FFF3E6] border-2 border-amber-300/90 shadow-xs p-3.5 sm:p-4 transition-all hover:border-amber-400">
                  {/* Subtle decorative background watermark */}
                  <div className="absolute -right-4 -bottom-6 opacity-[0.06] text-stone-900 pointer-events-none select-none">
                    <Wine size={110} />
                  </div>

                  <div className="relative z-10 space-y-2.5">
                    {/* Header Row: Badge & Discount Pill */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8B1E1E] to-[#601212] text-amber-200 flex items-center justify-center shrink-0 shadow-2xs">
                          <Wine size={16} className="text-amber-300" />
                        </div>
                        <span className="text-[9.5px] font-black uppercase tracking-wider text-amber-900 bg-amber-100/90 border border-amber-300/80 px-2 py-0.5 rounded-full shadow-2xs">
                          🍇 {t.wineDineInBadge}
                        </span>
                      </div>
                      <span className="bg-emerald-600 text-white text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md shadow-2xs tracking-wider">
                        {t.wineDiscountBadge}
                      </span>
                    </div>

                    {/* Title & Description with crystal clear contrast */}
                    <div>
                      <h4 className="text-stone-900 font-extrabold text-[13.5px] sm:text-[14.5px] leading-snug tracking-tight">
                        {t.wineDineInTitle}
                      </h4>
                      <p className="text-stone-600 text-xs leading-relaxed font-normal mt-1 text-pretty">
                        {t.wineDineInDesc}
                      </p>
                    </div>

                    {/* CTA Button with full readable label & discount indicator */}
                    <button
                      type="button"
                      onClick={handleOpenWineReservation}
                      className="w-full py-2.5 px-3.5 bg-gradient-to-r from-[#8B1E1E] via-[#7B1818] to-[#5C1111] hover:from-[#781818] hover:to-[#4D0D0D] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-xs hover:shadow transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.99]"
                    >
                      <UtensilsCrossed size={14} className="text-amber-300 shrink-0" />
                      <span>{t.wineDineInBtn}</span>
                      <ChevronRight size={14} className="text-amber-300 shrink-0" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ULTRA-PUNCHY CHECKOUT FOOTER (IMMEDIATE VISUAL TOTAL) */}
        {items.length > 0 && (
          <div className="border-t-2 border-stone-200 px-4 sm:px-5 py-4 space-y-3 bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
            
            {/* Sconto Pill Banner */}
            {isDiscountActive && (
              <div className={`${isDiningMode ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-emerald-50 border-emerald-300 text-emerald-900'} border rounded-xl px-3 py-1.5 flex items-center justify-between text-xs font-bold shadow-2xs`}>
                <span className="flex items-center gap-1.5">
                  <Sparkles size={13} className={isDiningMode ? 'text-amber-600' : 'text-emerald-600'} />
                  <span>
                    {isDiningMode 
                      ? (lang === 'TH' ? '✨ สิทธิพิเศษสั่งที่โต๊ะ (-5%):' : lang === 'IT' ? '✨ Sconto Dining Privilege al Tavolo (-5%):' : lang === 'DE' ? '✨ Tisch-Rabatt (-5%):' : lang === 'MM' ? '✨ စားပွဲမှာယူမှု အထူးလျှော့စျေး (-5%):' : '✨ Table Dining Privilege (-5%):')
                      : t.welcomePrivilegeNote
                    }
                  </span>
                </span>
                <span className={`${isDiningMode ? 'text-amber-700' : 'text-emerald-700'} font-black`}>-{discountAmount}฿</span>
              </div>
            )}

            {/* Breakdown lines */}
            <div className="space-y-1 text-stone-600 text-xs">
              <div className="flex justify-between items-center">
                <span>{t.subtotalText}</span>
                <span className="font-bold text-stone-800">{subtotal}฿</span>
              </div>
              {isDiningMode ? (
                <div className="flex justify-between items-center text-emerald-700">
                  <span>{lang === 'TH' ? 'บริการที่โต๊ะ' : lang === 'IT' ? 'Servizio al Tavolo' : lang === 'DE' ? 'Tischservice' : lang === 'MM' ? 'စားပွဲ ဝန်ဆောင်မှု' : 'Table Service'}</span>
                  <span className="font-bold">{lang === 'TH' ? 'ฟรี' : lang === 'IT' ? 'Gratuito' : lang === 'DE' ? 'Kostenlos' : lang === 'MM' ? 'အခမဲ့' : 'Free'}</span>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span>{t.deliveryText}</span>
                  <span className="font-bold">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-black">{t.freeText}</span>
                    ) : (
                      <span className="text-stone-800">{deliveryFee}฿</span>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* TOTALISSIMO GIGANTE SPUNTO IN FACCIA */}
            <div className="flex justify-between items-end border-t border-stone-200 pt-2.5">
              <div>
                <span className="text-stone-500 text-xs font-extrabold uppercase tracking-wider block">
                  {t.totalText}
                </span>
                {isDiningMode ? (
                  <span className="text-[10.5px] text-amber-700 font-black">
                    Postazione: {tableNumber || 'Al Tavolo'}
                  </span>
                ) : (
                  deliveryFee === 0 && (
                    <span className="text-[10.5px] text-emerald-700 font-black">
                      {t.deliveryIncluded}
                    </span>
                  )
                )}
              </div>
              <div className="text-right leading-none">
                <span className="text-[#8B1E1E] text-3xl font-black inline-flex items-baseline gap-1">
                  <span>{finalTotal}</span>
                  <span className="text-xl font-black select-none text-[#8B1E1E]">฿</span>
                </span>
              </div>
            </div>
            
            {isDiningMode ? (
              /* DINING TABLET BUTTONS: GREEN ADD-MORE ON TOP, RED SUBMIT BELOW */
              <div className="space-y-2.5 pt-1">
                {/* 1. TOP GREEN BUTTON: ADD MORE DISHES */}
                <button
                  type="button"
                  onClick={handleContinueShopping}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 border border-emerald-400/40 text-xs sm:text-sm font-black uppercase tracking-wider"
                >
                  <Plus size={16} className="text-emerald-200 stroke-[3]" />
                  <span>{t.tableAddMoreBtn}</span>
                </button>

                {/* 2. BOTTOM RED BUTTON: SEND ORDER TO KITCHEN (-5%) */}
                <button
                  type="button"
                  onClick={() => { closeCart(); onCheckout(); }}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#8B1E1E] via-[#781818] to-[#5a1111] hover:from-[#781818] hover:to-[#4a0d0d] text-white text-xs sm:text-sm tracking-wider uppercase font-black rounded-2xl transition-all border-2 border-amber-400/70 shadow-xl cursor-pointer active:scale-[0.98] flex items-center justify-between"
                  style={{ boxShadow: '0 6px 20px rgba(139, 30, 30, 0.4)' }}
                >
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed size={16} className="text-amber-300" />
                    <span>{t.tableOrderBtn}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-300 line-through text-[11px] font-normal">{subtotal}฿</span>
                    <span className="bg-amber-400 text-stone-950 px-2 py-0.5 rounded-lg text-xs font-black shadow-xs">
                      {finalTotal}฿
                    </span>
                    <ChevronRight size={14} className="text-white" />
                  </div>
                </button>
              </div>
            ) : serviceCalc.canOrder ? (
              <div className="space-y-2 pt-1">
                {/* 1. HERO GREEN INCENTIVE BUTTON: ADD MORE DISHES / KEEP ORDERING + DYNAMIC THRESHOLD */}
                <button
                  type="button"
                  onClick={handleContinueShopping}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-[0.98] flex flex-col items-center justify-center gap-1 border border-emerald-400/40"
                >
                  <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs md:text-[13px] uppercase tracking-wider font-black whitespace-nowrap">
                    <Plus size={15} className="text-emerald-200 stroke-[3] shrink-0" />
                    <span className="whitespace-nowrap">{t.addMoreDishesBtn.replace('+ ', '')}</span>
                  </div>

                  {/* Appetizing Free Delivery status badge inside button */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-300/40 text-[10.5px] sm:text-[11px] font-extrabold text-emerald-100 shadow-inner">
                    <span>🛵</span>
                    {subtotal < 300 ? (
                      <span>
                        {lang === 'IT' && <>Mancano solo <span className="text-amber-300 font-black">{300 - subtotal}฿</span> per la Consegna GRATIS!</>}
                        {lang === 'EN' && <>Only <span className="text-amber-300 font-black">{300 - subtotal}฿</span> to FREE Delivery!</>}
                        {lang === 'TH' && <>อีกเพียง <span className="text-amber-300 font-black">{300 - subtotal}฿</span> ส่งฟรี!</>}
                        {lang === 'DE' && <>Noch <span className="text-amber-300 font-black">{300 - subtotal}฿</span> bis GRATIS-Lieferung!</>}
                        {lang === 'MM' && <>အခမဲ့ပို့ဆောင်ရန် <span className="text-amber-300 font-black">{300 - subtotal}฿</span> သာ လိုပါတော့သည်!</>}
                      </span>
                    ) : (
                      <span className="text-amber-200 font-black">
                        {lang === 'IT' && '🎉 Consegna GRATUITA sbloccata!'}
                        {lang === 'EN' && '🎉 FREE Delivery unlocked!'}
                        {lang === 'TH' && '🎉 ได้รับสิทธิ์จัดส่งฟรีแล้ว!'}
                        {lang === 'DE' && '🎉 GRATIS-Lieferung freigeschaltet!'}
                        {lang === 'MM' && '🎉 အခမဲ့ ပို့ဆောင်ခွင့် ရရှိပါပြီ!'}
                      </span>
                    )}
                  </div>
                </button>

                {/* 2. SECONDARY CHECKOUT CTA */}
                <button
                  onClick={() => { closeCart(); onCheckout(); }}
                  className="w-full py-2.5 bg-[#8B1E1E] hover:bg-[#721818] text-white text-xs sm:text-sm tracking-wider uppercase font-extrabold rounded-xl transition-all border border-red-900/30 shadow-xs hover:shadow-md cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span>{t.checkoutBtn}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-white text-xs font-black">
                    {finalTotal}฿
                  </span>
                  <ChevronRight size={14} className="text-red-200" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  disabled
                  className="w-full py-3.5 bg-stone-300 text-stone-600 text-xs tracking-wider uppercase font-bold rounded-full cursor-not-allowed border border-stone-300"
                >
                  {serviceCalc.state === 'PAUSED' ? t.ordersPausedBtn : t.ordersClosedBtn}
                </button>
                <a
                  href="tel:0958825698"
                  className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer shadow"
                >
                  <Phone size={14} className="text-emerald-400" />
                  <span>{t.callPizzeria}</span>
                </a>
              </div>
            )}

            <p className="text-center text-stone-400 text-[10px] leading-relaxed">
              {t.footerInfo}
            </p>
          </div>
        )}
      </div>

      {/* Embedded Table Reservation Modal (Dine-in Wine Experience - Only for Delivery Website) */}
      {!isDiningMode && (
        <TableReservationModal
          isOpen={showTableModal}
          onClose={() => {
            setShowTableModal(false);
            setIsWineReservation(false);
            setReservationNotes('');
          }}
          lang={lang}
          initialNotes={reservationNotes}
          isWinePrivilege={isWineReservation}
        />
      )}
    </>
  );
}
