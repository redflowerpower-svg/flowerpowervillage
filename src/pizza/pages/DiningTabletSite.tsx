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
import { INITIAL_WINE_COLLECTION,  WINE_COUNTRY_OPTIONS, resolveWineCategoryType, sortWinesByCountryOrder, getCountryRank, WineCardData , getWineTranslatedTitle, getWineTranslatedSubtitle, getWineTranslatedDesc } from '../data/wineData';
import { fetchCloudWineCollection } from '../data/wineCloudService';
import { fetchCloudMenuOverrides } from '../data/pizzaMenuCloudService';
import { supabase } from '../../lib/supabase';
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

const DINING_LEAD_BANNER: Record<Language, { title: string; subtitle: string }> = {
  IT: {
    title: "Inserisci la tua email e ricevi il 10% di Sconto sul nostro sito web!",
    subtitle: "Durante l'ordinazione al tavolo, inserisci la tua email: riceverai subito un Coupon Sconto del 10% per ordinare comodamente da casa su flowerpowerpizza.com."
  },
  EN: {
    title: "Enter your email and get 10% off on our website!",
    subtitle: "When ordering at the table, enter your email: you'll immediately receive a 10% discount coupon to order comfortably from home at flowerpowerpizza.com."
  },
  TH: {
    title: "ป้อนอีเมลของคุณและรับส่วนลด 10% บนเว็บไซต์ของเรา!",
    subtitle: "เมื่อสั่งอาหารที่โต๊ะ ป้อนอีเมลของคุณ: คุณจะได้รับคูปองส่วนลด 10% ทันที เพื่อสั่งอาหารจากที่บ้านได้อย่างสะดวกบน flowerpowerpizza.com"
  },
  DE: {
    title: "Gib deine E-Mail ein und erhalte 10 % Rabatt auf unserer Website!",
    subtitle: "Gib bei der Bestellung am Tisch deine E-Mail ein: Du erhältst sofort einen 10 % Rabattgutschein, um bequem von zu Hause auf flowerpowerpizza.com zu bestellen."
  },
  MM: {
    title: "သင့်အီးမေးလ်ကို ထည့်သွင်းပြီး ကျွန်ုပ်တို့ဝဘ်ဆိုဒ်တွင် 10% လျှော့စျေး ရယူလိုက်ပါ။",
    subtitle: "စားပွဲတွင် မှာယူစဉ် သင့်အီးမေးလ်ကို ထည့်သွင်းပါ။ flowerpowerpizza.com တွင် အိမ်မှ အဆင်ပြေစွာ မှာယူရန်အတွက် 10% လျှော့စျေးကူပွန်ကို ချက်ချင်း ရရှိမည်ဖြစ်သည်။"
  },
  FR: {
    title: "Entrez votre e-mail et recevez 10 % de réduction sur notre site web !",
    subtitle: "Lors de la commande à table, saisissez votre e-mail : vous recevrez immédiatement un coupon de réduction de 10 % pour commander confortablement depuis chez vous sur flowerpowerpizza.com."
  },
  ES: {
    title: "¡Introduce tu correo electrónico y recibe un 10% de descuento en nuestro sitio web!",
    subtitle: "Al hacer tu pedido en la mesa, introduce tu correo electrónico: recibirás de inmediato un cupón de descuento del 10% para pedir cómodamente desde casa en flowerpowerpizza.com."
  },
  RU: {
    title: "Введите свой адрес электронной почты и получите скидку 10% на нашем сайте!",
    subtitle: "При заказе за столиком введите свой адрес электронной почты: вы сразу получите купон на скидку 10%, чтобы удобно заказать домой на flowerpowerpizza.com."
  },
  ZH: {
    title: "输入您的电子邮件，即可在我们的网站获得10%折扣！",
    subtitle: "在餐桌点餐时，输入您的电子邮件：您将立即收到一张10%折扣优惠券，方便您在flowerpowerpizza.com上在家轻松下单。"
  }
};

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
    desc: 'Tocca la tua postazione per accedere al menu completo con ordinazione diretta al tavolo.',
    tablesHeading: 'Tavoli della Sala & Clienti',
    freeLabel: 'Libero',
    activeLabel: 'Comanda Cucina',
    guestLabel: 'Smartphone Live',
    freeCard: 'Nuovo Ordine',
    activeCardPrefix: 'Aperto:',
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
    desc: 'Touch your table or station to access the full menu with direct table ordering.',
    tablesHeading: 'Dining Tables & Guest Stations',
    freeLabel: 'Available',
    activeLabel: 'Kitchen Order',
    guestLabel: 'Smartphone Live',
    freeCard: 'New Order',
    activeCardPrefix: 'Open:',
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
    desc: 'แตะที่โต๊ะของคุณเพื่อเปิดดูเมนูอาหารและสั่งได้ทันทีที่โต๊ะ',
    tablesHeading: 'โต๊ะอาหารและที่นั่งลูกค้า',
    freeLabel: 'ว่าง / เริ่มใหม่',
    activeLabel: 'มีออเดอร์ในครัว',
    guestLabel: 'ลูกค้ากำลังสั่งผ่านมือถือ',
    freeCard: 'ออเดอร์ใหม่',
    activeCardPrefix: 'ยอด:',
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
    desc: 'Tippen Sie auf Ihren Tisch, um das Menü mit direkter Tischbestellung zu öffnen.',
    tablesHeading: 'Tische & Gäste-Stationen',
    freeLabel: 'Frei',
    activeLabel: 'Küche aktiv',
    guestLabel: 'Smartphone Live',
    freeCard: 'Neue Bestellung',
    activeCardPrefix: 'Offen:',
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
    desc: 'စားပွဲတွင် တိုက်ရိုက်မှာယူနိုင်သော မီနူးအပြည့်အစုံကို ကြည့်ရှုရန် သင့်နေရာကို နှိပ်ပါ။',
    tablesHeading: 'စားသောက်ခန်းမ စားပွဲများနှင့် ဧည့်သည်နေရာများ',
    freeLabel: 'အားလပ်သည်',
    activeLabel: 'မီးဖိုချောင်မှာယူမှု',
    guestLabel: 'စမတ်ဖုန်း အော်ဒါ',
    freeCard: 'အော်ဒါအသစ်',
    activeCardPrefix: 'ကျသင့်:',
    guestCardPrefix: 'ဧည့်သည် အော်ဒါမှာနေသည်',
    customLabel: 'သို့မဟုတ် အခြားစားပွဲ / နေရာအမည် ထည့်သွင်းပါ',
    customPlaceholder: 'ဥပမာ - လသာဆောင် ၃ / ပန်းခြံ / ကောင်တာ',
    enterBtn: 'မီနူးသို့ ဝင်မည်',
    logoutBtn: 'ထွက်မည်',
    qrStudioBtn: 'စားပွဲ QR ၁-၁၆'
  },
  ES: {
    title: 'Flower Power Pizza Dining',
    subtitle: 'Seleccione Mesa o Estación de Invitados',
    desc: 'Toque su mesa o estación para acceder al menú completo con pedido directo en mesa.',
    tablesHeading: 'Mesas y Estaciones de Invitados',
    freeLabel: 'Disponible',
    activeLabel: 'Pedido en Cocina',
    guestLabel: 'Smartphone en Vivo',
    freeCard: 'Nuevo Pedido',
    activeCardPrefix: 'Abierto:',
    guestCardPrefix: 'Pedido de Invitado en Vivo',
    customLabel: 'O Ingrese Mesa / Estación Personalizada',
    customPlaceholder: 'ej. Terraza 3 / Jardín / Barra',
    enterBtn: 'Acceder al Menú',
    logoutBtn: 'Cerrar Sesión',
    qrStudioBtn: 'QR de Mesas 1-16',
  },
  FR: {
    title: 'Flower Power Pizza Dining',
    subtitle: 'Sélectionnez une table ou un poste invité',
    desc: 'Touchez votre table ou poste pour accéder au menu complet avec commande directe à table.',
    tablesHeading: 'Tables de salle et postes invités',
    freeLabel: 'Disponible',
    activeLabel: 'Commande en cuisine',
    guestLabel: 'Smartphone en direct',
    freeCard: 'Nouvelle commande',
    activeCardPrefix: 'Ouvert :',
    guestCardPrefix: 'Commande client en direct',
    customLabel: 'Ou saisissez une table / un poste personnalisé',
    customPlaceholder: 'ex. Terrasse 3 / Jardin / Comptoir',
    enterBtn: 'Accéder au menu',
    logoutBtn: 'Déconnexion',
    qrStudioBtn: 'QR tables 1-16',
  },
  RU: {
    title: 'Пиццерия Flower Power',
    subtitle: 'Выберите столик или гостевую станцию',
    desc: 'Коснитесь своего столика или станции, чтобы открыть полное меню с прямым заказом за столиком.',
    tablesHeading: 'Столики и гостевые станции',
    freeLabel: 'Свободен',
    activeLabel: 'Заказ на кухне',
    guestLabel: 'Смартфон онлайн',
    freeCard: 'Новый заказ',
    activeCardPrefix: 'Открыт:',
    guestCardPrefix: 'Гостевой заказ онлайн',
    customLabel: 'Или введите свой столик / станцию',
    customPlaceholder: 'например, Терраса 3 / Сад / Барная стойка',
    enterBtn: 'Открыть меню',
    logoutBtn: 'Выйти',
    qrStudioBtn: 'QR-коды столиков 1–16',
  },
  ZH: {
    title: '花之力量披萨餐厅',
    subtitle: '选择餐桌或客人站点',
    desc: '触摸您的餐桌或站点，即可访问完整菜单并直接在餐桌点餐。',
    tablesHeading: '餐桌与客人站点',
    freeLabel: '可用',
    activeLabel: '厨房订单',
    guestLabel: '智能手机实时',
    freeCard: '新订单',
    activeCardPrefix: '未结：',
    guestCardPrefix: '客人实时点餐',
    customLabel: '或输入自定义餐桌/站点',
    customPlaceholder: '例如 露台3 / 花园 / 吧台',
    enterBtn: '访问菜单',
    logoutBtn: '退出登录',
    qrStudioBtn: '餐桌二维码 1-16',
  }
};

const I18N_RESET_CONFIRM: Record<Language, { prompt: string; short: string; full: string; tapBanner: string }> = {
  IT: { prompt: "Sicuro di annullare?", short: "Confermi?", full: "Sicuro? Tocca per cancellare tutto", tapBanner: "Tocca ovunque su questa barra per chiudere il tavolo" },
  EN: { prompt: "Sure to cancel?", short: "Confirm?", full: "Sure? Tap to cancel and reset", tapBanner: "Tap anywhere on this bar to close table" },
  TH: { prompt: "ยืนยันยกเลิก?", short: "ยืนยัน?", full: "แน่ใจไหม? แตะอีกครั้งเพื่อยกเลิก", tapBanner: "แตะที่แถบนี้เพื่อยืนยันการปิดโต๊ะ" },
  DE: { prompt: "Wirklich abbrechen?", short: "Bestätigen?", full: "Sicher? Tippen zum Abbrechen", tapBanner: "Tippen Sie auf dieses Banner, um den Tisch zu schließen" },
  MM: { prompt: "ပယ်ဖျက်မှာသေချာလား?", short: "သေချာပြီလား?", full: "အတည်ပြုရန် ထပ်မံနှိပ်ပါ", tapBanner: "စားပွဲပိတ်ရန် ဤဘားပေါ်တွင် နေရာမရွေးနှိပ်ပါ"
  },
  ES: {
    prompt: '¿Seguro cancelar?',
    short: '¿Confirmar?',
    full: '¿Seguro? Toque para cancelar y reiniciar',
    tapBanner: 'Toque en cualquier parte de esta barra para cerrar la mesa'
  },
  FR: {
    prompt: "Sûr d'annuler ?",
    short: 'Confirmer ?',
    full: 'Sûr ? Touchez pour annuler et réinitialiser',
    tapBanner: "Touchez cette barre n'importe où pour fermer la table"
  },
  RU: {
    prompt: 'Точно отменить?',
    short: 'Подтвердить?',
    full: 'Уверены? Нажмите, чтобы отменить и сбросить',
    tapBanner: 'Нажмите на этот баннер в любом месте, чтобы закрыть столик'
  },
  ZH: {
    prompt: '确定取消？',
    short: '确认？',
    full: '确定？点击取消并重置',
    tapBanner: '点击此横幅任意位置即可关闭餐桌'
  }
};

const I18N_LOGOUT_PIN: Record<Language, { title: string; subtitle: string; error: string; cancelBtn: string }> = {
  IT: {
    title: 'PIN Sicurezza Staff',
    subtitle: 'Inserisci il PIN di 4 cifre per disconnettere il tablet',
    error: 'PIN non valido. Riprova.',
    cancelBtn: 'Annulla'
  },
  EN: {
    title: 'Staff Security PIN',
    subtitle: 'Enter 4-digit PIN to log out of dining tablet',
    error: 'Incorrect PIN. Try again.',
    cancelBtn: 'Cancel'
  },
  TH: {
    title: 'รหัส PIN สำหรับพนักงาน',
    subtitle: 'กรอกรหัส PIN 4 หลักเพื่อออกจากระบบแท็บเล็ต',
    error: 'รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่',
    cancelBtn: 'ยกเลิก'
  },
  DE: {
    title: 'Mitarbeiter-Sicherheits-PIN',
    subtitle: '4-stellige PIN eingeben, um das Tablet abzumelden',
    error: 'Falsche PIN. Erneut versuchen.',
    cancelBtn: 'Abbrechen'
  },
  MM: {
    title: 'ဝန်ထမ်း လုံခြုံရေး PIN',
    subtitle: 'တက်ဘလက်မှ ထွက်ရန် ၄ လုံးဂဏန်း PIN ရိုက်ထည့်ပါ',
    error: 'PIN ကုဒ် မှားယွင်းနေပါသည်။ ထပ်ကြိုးစားပါ။',
    cancelBtn: 'ပယ်ဖျက်မည်'
  },
  ES: {
    title: 'PIN de Seguridad de Personal',
    subtitle: 'Introduce el PIN de 4 dígitos para cerrar sesión en la tableta',
    error: 'PIN incorrecto. Inténtalo de nuevo.',
    cancelBtn: 'Cancelar'
  },
  FR: {
    title: 'PIN de Sécurité du Personnel',
    subtitle: 'Saisissez le code PIN à 4 chiffres pour déconnecter la tablette',
    error: 'PIN incorrect. Réessayez.',
    cancelBtn: 'Annuler'
  },
  RU: {
    title: 'ПИН-код Безопасности Персонала',
    subtitle: 'Введите 4-значный ПИН-код для выхода из системы планшета',
    error: 'Неверный ПИН-код. Попробуйте снова.',
    cancelBtn: 'Отмена'
  },
  ZH: {
    title: '员工安全密码',
    subtitle: '输入4位数安全密码以退出平板系统',
    error: '密码错误，请重试。',
    cancelBtn: '取消'
  }
};

const LOCATION_BY_LANG: Record<Language, string> = {
  IT: 'RANONG, THAILANDIA',
  EN: 'RANONG, THAILAND',
  TH: 'ระนอง, ประเทศไทย',
  DE: 'RANONG, THAILAND',
  MM: 'ရနောင်း၊ ထိုင်းနိုင်ငံ',
  ES: 'RANONG, TAILANDIA',
  FR: 'RANONG, THAÏLANDE',
  RU: 'РАНОНГ, ТАИЛАНД',
  ZH: '泰国拉廊'
};

// Centralized 9-language definitions for category sub-sections, summaries and filters
import {
  CATEGORY_DETAILS as categoryDetails,
  DAILY_SPECIALS_SECTIONS,
  ITALIAN_SALADS_SECTIONS,
  SALAD_SUBFILTER_LABELS,
  SANDWICH_SUBFILTER_LABELS,
  FOCACCIA_SANDWICH_SECTIONS,
  PASTA_SAUCES,
  WINE_FILTER_LABELS,
} from '../data/subSectionsI18n';

const WINE_TYPE_SECTIONS = [
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
      FR: 'Nuances florales et fruitées au profil frais et polyvalent, parfait pour l\'apéritif et les plats légers.',
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
      FR: 'Effervescents et prosecco au perlage fin et persistant, conçus pour des toasts raffinés et des moments d\'exception.',
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
];

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
      const gToken = searchParams.get('token') || 'permanent_table_qr';
      if (gTable) {
        const canonical = getCanonicalTableKey(gTable);
        return {
          isGuest: true,
          table: canonical,
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
            setIsCheckoutModalOpen(false);
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
      if (evData.type === 'ORDER_COMPLETED' || evData.status === 'completed' || evData.type === 'TABLE_SETTLED') {
        const rawTable = evData.tableKey || extractTableFromAddress(evData.order?.address) || '';
        if (rawTable && currentTable && getCanonicalTableKey(rawTable) === getCanonicalTableKey(currentTable)) {
          clearCart();
          setIsCheckoutModalOpen(false);
          if (!isGuestMobile) {
            setIsTableSelected(false);
            setCurrentTable('');
          }
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
        if (ev.data?.type === 'TABLE_SETTLED' || ev.data?.type === 'TABLE_RESET') {
          const settledKey = ev.data?.tableKey ? getCanonicalTableKey(ev.data.tableKey) : '';
          if (settledKey && currentTable && getCanonicalTableKey(currentTable) === settledKey) {
            clearCart();
            setIsCheckoutModalOpen(false);
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

  const handleCancelAndResetTable = async () => {
    const tableToReset = currentTable;
    const canonical = tableToReset ? getCanonicalTableKey(tableToReset) : '';
    const activeOrders = canonical ? (activeTableOrderMap[canonical] || []) : [];
    const orderIds = activeOrders.map((o: any) => o.id).filter(Boolean);

    // 1. Cancel in Supabase & notify API for each active order on this table
    if (orderIds.length > 0) {
      for (const id of orderIds) {
        try {
          await fetch('/api/pizza-order-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: id, status: 'rejected' })
          });
        } catch (_) {}

        try {
          await supabase
            .from('pizza_orders')
            .update({ status: 'rejected' })
            .eq('id', id);
        } catch (_) {}
      }

      // Broadcast order cancellation to Kitchen Monitor & all dining clients
      try {
        const ch1 = new BroadcastChannel('pizza_orders_channel');
        ch1.postMessage({ type: 'ORDER_CANCELLED', table: canonical, orderIds, status: 'rejected' });
        ch1.close();
      } catch (_) {}

      try {
        const ch2 = new BroadcastChannel('flower_power_orders_channel');
        ch2.postMessage({ type: 'ORDER_CANCELLED', table: canonical, orderIds, status: 'rejected' });
        ch2.close();
      } catch (_) {}

      try {
        const chTable = new BroadcastChannel('pizza_table_channel');
        chTable.postMessage({ type: 'TABLE_RESET', tableKey: canonical });
        chTable.close();
      } catch (_) {}
    }

    // 2. Revoke active dynamic session QR for this table
    if (canonical) {
      try {
        revokeDiningTableSession(canonical);
      } catch (_) {}
    }

    // 3. Clear live cart presence
    try {
      liveCartControllerRef.current?.broadcastClear();
    } catch (_) {}

    // 4. Clear local Zustand cart
    clearCart();

    // 5. Instantly clear table from local activeTableOrderMap (0ms UI latency)
    if (canonical) {
      setActiveTableOrderMap(prev => {
        const next = { ...prev };
        delete next[canonical];
        return next;
      });
    }

    // 6. Return to table selection view
    if (!isGuestMobile) {
      setCurrentTable('');
      setIsTableSelected(false);
      setCustomTableInput('');
    }

    // 7. Background refresh active orders from database
    fetchActiveDineInOrders();
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

  // Sync daily specials, prices and availability overrides from admin dashboard & Cloud
  const [dailySpecialsOverrides, setDailySpecialsOverrides] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('fp_pizza_daily_specials_overrides') || '{}');
    } catch {
      return {};
    }
  });

  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem('fp_pizza_prices_overrides') || '{}');
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
        const prOverrides = JSON.parse(localStorage.getItem('fp_pizza_prices_overrides') || '{}');
        setPriceOverrides(prOverrides);
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

    const refreshCloudOverrides = () => {
      fetchCloudMenuOverrides().then((overrides) => {
        if (overrides) {
          if (overrides.dailySpecials) {
            setDailySpecialsOverrides(overrides.dailySpecials);
          }
          if (overrides.prices) {
            setPriceOverrides(overrides.prices);
          }
          if (overrides.availability) {
            const unavail = Object.entries(overrides.availability)
              .filter(([_, isAvail]) => isAvail === false)
              .map(([id]) => id);
            setUnavailableIds(new Set<string>(unavail));
          }
        }
      });
    };

    // 1. BroadcastChannel locale per schede stesso dispositivo
    let bc: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel('fp_pizza_menu_sync');
      bc.onmessage = (ev) => {
        if (ev.data?.type === 'DAILY_SPECIAL_TOGGLE' || ev.data?.type === 'AVAILABILITY_TOGGLE' || ev.data?.type === 'PRICE_UPDATE' || ev.data?.type === 'MENU_SYNC_UPDATE') {
          syncFromStorage();
          refreshCloudOverrides();
        }
      };
    }

    // 2. Supabase Realtime Channel per sincronizzazione istantanea cross-device (KDS -> Tablet in sala)
    const realtimeChannel = supabase.channel('fp_pizza_menu_sync')
      .on('broadcast', { event: 'MENU_SYNC_UPDATE' }, (msg) => {
        const payload = msg?.payload;
        if (payload) {
          if (payload.prices) {
            setPriceOverrides(prev => ({ ...prev, ...payload.prices }));
          }
          if (payload.dailySpecials) {
            setDailySpecialsOverrides(prev => ({ ...prev, ...payload.dailySpecials }));
          }
          if (payload.availability) {
            const unavail = Object.entries(payload.availability)
              .filter(([_, isAvail]) => isAvail === false)
              .map(([id]) => id);
            setUnavailableIds(new Set<string>(unavail));
          }
        }
        refreshCloudOverrides();
      })
      .subscribe();

    // 3. Carica immediatamente overrides ufficiali dal Cloud Supabase
    refreshCloudOverrides();

    // 4. Polling di sicurezza ogni 30 secondi e al ritorno visibilità/focus dello schermo tablet
    const pollTimer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshCloudOverrides();
      }
    }, 30000);

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        refreshCloudOverrides();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      clearInterval(pollTimer);
      if (bc) bc.close();
      supabase.removeChannel(realtimeChannel);
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
      const masterMap = new Map(INITIAL_WINE_COLLECTION.map(w => [w.id, w]));

      if (cloudWines && cloudWines.length > 0) {
        rawWines = cloudWines;
      } else {
        const saved = localStorage.getItem('fp_wine_collection');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              rawWines = parsed.map((w: any) => {
                const master = masterMap.get(w.id);
                return {
                  ...(master || {}),
                  ...w,
                  bottleImage: (!w.bottleImage || w.bottleImage.includes('01-italian-wines.webp')) && master?.bottleImage ? master.bottleImage : w.bottleImage,
                };
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
          const master = masterMap.get(w.id);
          const merged: any = {
            ...(master || {}),
            ...w,
            titleZh: w.titleZh || master?.titleZh,
            titleMm: w.titleMm || master?.titleMm,
            titleRu: w.titleRu || master?.titleRu,
            titleFr: w.titleFr || master?.titleFr,
            titleEs: w.titleEs || master?.titleEs,
            titleDe: w.titleDe || master?.titleDe,
            titleTh: w.titleTh || master?.titleTh,
            titleIt: w.titleIt || master?.titleIt,
            titleEn: w.titleEn || master?.titleEn,
            subtitleZh: w.subtitleZh || master?.subtitleZh,
            subtitleMm: w.subtitleMm || master?.subtitleMm,
            subtitleRu: w.subtitleRu || master?.subtitleRu,
            subtitleFr: w.subtitleFr || master?.subtitleFr,
            subtitleEs: w.subtitleEs || master?.subtitleEs,
            subtitleDe: w.subtitleDe || master?.subtitleDe,
            subtitleTh: w.subtitleTh || master?.subtitleTh,
            subtitleIt: w.subtitleIt || master?.subtitleIt,
            subtitleEn: w.subtitleEn || master?.subtitleEn,
            descriptionZh: w.descriptionZh || master?.descriptionZh,
            descriptionMm: w.descriptionMm || master?.descriptionMm,
            descriptionRu: w.descriptionRu || master?.descriptionRu,
            descriptionFr: w.descriptionFr || master?.descriptionFr,
            descriptionEs: w.descriptionEs || master?.descriptionEs,
            descriptionDe: w.descriptionDe || master?.descriptionDe,
            descriptionTh: w.descriptionTh || master?.descriptionTh,
            descriptionIt: w.descriptionIt || master?.descriptionIt,
            descriptionEn: w.descriptionEn || master?.descriptionEn,
          };

          const rawPrice = typeof merged.price === 'string' ? parseFloat(merged.price.replace(/[^0-9.]/g, '')) || 1190 : (merged.price || 1190);
          const finalPrice = priceOverrides[merged.id] !== undefined ? priceOverrides[merged.id] : rawPrice;
          const titleForLang = getWineTranslatedTitle(merged, lang) || merged.title || '';
          const subForLang = getWineTranslatedSubtitle(merged, lang) || merged.categorySubtitle || '';
          const descForLang = getWineTranslatedDesc(merged, lang) || merged.description || '';

          return {
            id: merged.id,
            name: titleForLang,
            nameIt: merged.titleIt || merged.title,
            nameEn: merged.titleEn || merged.title,
            nameTh: merged.titleTh || merged.title,
            nameMm: merged.titleMm || merged.title,
            nameDe: merged.titleDe || merged.title,
            nameEs: merged.titleEs || merged.title,
            nameFr: merged.titleFr || merged.title,
            nameRu: merged.titleRu || merged.title,
            nameZh: merged.titleZh || merged.title,
            title: titleForLang,
            titleIt: merged.titleIt || merged.title,
            titleEn: merged.titleEn || merged.title,
            titleTh: merged.titleTh || merged.title,
            titleMm: merged.titleMm || merged.title,
            titleDe: merged.titleDe || merged.title,
            titleEs: merged.titleEs || merged.title,
            titleFr: merged.titleFr || merged.title,
            titleRu: merged.titleRu || merged.title,
            titleZh: merged.titleZh || merged.title,
            description: descForLang,
            descriptionIt: merged.descriptionIt || merged.description,
            descriptionEn: merged.descriptionEn || merged.description,
            descriptionTh: merged.descriptionTh || merged.description,
            descriptionMm: merged.descriptionMm || merged.description,
            descriptionDe: merged.descriptionDe || merged.description,
            descriptionEs: merged.descriptionEs || merged.description,
            descriptionFr: merged.descriptionFr || merged.description,
            descriptionRu: merged.descriptionRu || merged.description,
            descriptionZh: merged.descriptionZh || merged.description,
            description_it: merged.descriptionIt || merged.description,
            description_en: merged.descriptionEn || merged.description,
            description_th: merged.descriptionTh || merged.description,
            description_mm: merged.descriptionMm || merged.description,
            description_de: merged.descriptionDe || merged.description,
            description_es: merged.descriptionEs || merged.description,
            description_fr: merged.descriptionFr || merged.description,
            description_ru: merged.descriptionRu || merged.description,
            description_zh: merged.descriptionZh || merged.description,
            price: finalPrice,
            image: merged.bottleImage,
            image_file: merged.bottleImage,
            category: 'wines',
            categoryType: resolveWineCategoryType(merged),
            categorySubtitle: subForLang,
            categorySubtitleIt: merged.subtitleIt || merged.categorySubtitle,
            categorySubtitleEn: merged.subtitleEn || merged.categorySubtitle,
            categorySubtitleTh: merged.subtitleTh || merged.categorySubtitle,
            categorySubtitleMm: merged.subtitleMm || merged.categorySubtitle,
            categorySubtitleDe: merged.subtitleDe || merged.categorySubtitle,
            categorySubtitleEs: merged.subtitleEs || merged.categorySubtitle,
            categorySubtitleFr: merged.subtitleFr || merged.categorySubtitle,
            categorySubtitleRu: merged.subtitleRu || merged.categorySubtitle,
            categorySubtitleZh: merged.subtitleZh || merged.categorySubtitle,
            subtitleIt: merged.subtitleIt || merged.categorySubtitle,
            subtitleEn: merged.subtitleEn || merged.categorySubtitle,
            subtitleTh: merged.subtitleTh || merged.categorySubtitle,
            subtitleMm: merged.subtitleMm || merged.categorySubtitle,
            subtitleDe: merged.subtitleDe || merged.categorySubtitle,
            subtitleEs: merged.subtitleEs || merged.categorySubtitle,
            subtitleFr: merged.subtitleFr || merged.categorySubtitle,
            subtitleRu: merged.subtitleRu || merged.categorySubtitle,
            subtitleZh: merged.subtitleZh || merged.categorySubtitle,
            flag: merged.flag,
            alcohol: merged.alcohol,
            bottleScale: merged.bottleScale || 100,
            bottleScaleX: merged.bottleScaleX || 100,
            bottleOffsetX: merged.bottleOffsetX || 0,
            bottleOffsetY: merged.bottleOffsetY || 0,
            isAvailable: true
          } as MenuItem;
        });
    } catch (e) {
      console.warn('Error reading dynamic wines:', e);
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

  // Staff Security PIN Modal for Logout (Protection: 1296)
  const [isLogoutPinModalOpen, setIsLogoutPinModalOpen] = useState(false);
  const [logoutPinInput, setLogoutPinInput] = useState('');
  const [logoutPinError, setLogoutPinError] = useState(false);

  const handleLogoutPinDigit = (digit: string) => {
    if (logoutPinInput.length >= 4) return;
    const newPin = logoutPinInput + digit;
    setLogoutPinInput(newPin);
    setLogoutPinError(false);

    if (newPin.length === 4) {
      if (newPin === '1296') {
        setIsLogoutPinModalOpen(false);
        setLogoutPinInput('');
        if (onLogout) onLogout();
      } else {
        setLogoutPinError(true);
        setTimeout(() => {
          setLogoutPinInput('');
          setLogoutPinError(false);
        }, 700);
      }
    }
  };

  const handleLogoutPinDelete = () => {
    setLogoutPinInput(prev => prev.slice(0, -1));
    setLogoutPinError(false);
  };

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
  const discountAmount = 0;
  const discountedTotal = rawSubtotal;
  const cartCount = getCount();



  const activeCategory = availableCategories.find((c) => c.id === activeCategoryId) ?? availableCategories[0];
  const activeCategoryName = (categoryDetails[activeCategory.id]?.[lang]?.name || activeCategory.name).replace(/\n/g, ' ');

  const filteredCategoryItems = useMemo(() => {
    if (activeCategoryId === 'wines') {
      return filterWineItems(selectedWineType);
    }
    const raw = activeCategory.items
      .filter((i: any) => !unavailableIds.has(i.id))
      .map((item: any) => priceOverrides[item.id] !== undefined ? { ...item, price: priceOverrides[item.id] } : item);
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
  }, [activeCategoryId, activeCategory, dietaryFilter, selectedWineType, selectedWineCountry, allDynamicWines, unavailableIds, priceOverrides]);

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

    const allCatalogShowcaseItems = useMemo(() => {
    const DEFAULT_SHOWCASE_IDS = [
      'cake-of-the-day',
      'torta-di-mele',
      'profiteroles-al-cioccolato',
      'tiramisu',
      'torta-pasqualina-agli-spinaci-e-uova',
      'baked-bolognese-lasagna'
    ];

    const itemsMap = new Map<string, any>();
    menuData.forEach(cat => {
      if (cat.items) {
        cat.items.forEach(it => {
          if (!itemsMap.has(it.id)) {
            itemsMap.set(it.id, it);
          }
        });
      }
    });

    const list: any[] = [];
    DEFAULT_SHOWCASE_IDS.forEach(id => {
      const it = itemsMap.get(id);
      if (!it) return;
      if (unavailableIds.has(it.id)) return;
      const isOverridden = dailySpecialsOverrides[it.id];
      const isShowcase = isOverridden !== undefined ? isOverridden === true : true;
      if (isShowcase) {
        const itemPrice = priceOverrides[it.id] !== undefined ? priceOverrides[it.id] : it.price;
        list.push({ ...it, price: itemPrice, is_daily_special: true, _inShowcase: true });
      }
    });

    itemsMap.forEach((it) => {
      if (DEFAULT_SHOWCASE_IDS.includes(it.id)) return;
      if (unavailableIds.has(it.id)) return;
      if (dailySpecialsOverrides[it.id] === true) {
        const itemPrice = priceOverrides[it.id] !== undefined ? priceOverrides[it.id] : it.price;
        list.push({ ...it, price: itemPrice, is_daily_special: true, _inShowcase: true });
      }
    });

    if (dietaryFilter === 'veggie') {
      return list.filter(i => {
        const d = getDietaryType(i, i.category || 'desserts');
        return d === 'veggie' || d === 'vegan';
      });
    }
    if (dietaryFilter === 'vegan') {
      return list.filter(i => getDietaryType(i, i.category || 'desserts') === 'vegan');
    }

    return list;
  }, [dailySpecialsOverrides, unavailableIds, dietaryFilter, priceOverrides]);

  const groupedDailySpecials = activeCategoryId === 'daily-specials' ? DAILY_SPECIALS_SECTIONS.map(sec => {
    if (sec.id === 'fresh-showcase') {
      return { ...sec, items: allCatalogShowcaseItems };
    }
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
            id="cancel-reset-table-btn"
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

      {/* FULL-WIDTH EASY-TO-TAP CONFIRMATION BANNER (Smartphone & Tablet friendly) */}
      {isResetConfirming && (
        <div 
          onClick={handleResetClick}
          className="fixed top-14 sm:top-16 left-0 right-0 z-50 bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white px-3 sm:px-5 py-2.5 shadow-2xl border-b-2 border-amber-400 flex items-center justify-between gap-2.5 sm:gap-4 cursor-pointer animate-fadeIn active:opacity-90 transition-all select-none"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-amber-200" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-black tracking-tight text-white leading-snug whitespace-normal">
                {I18N_RESET_CONFIRM[lang]?.prompt || I18N_RESET_CONFIRM.IT.prompt}
              </p>
              <p className="text-[10.5px] sm:text-xs text-amber-200 font-bold tracking-wide flex items-center gap-1">
                <span>👉</span>
                <span>{I18N_RESET_CONFIRM[lang]?.tapBanner || I18N_RESET_CONFIRM.IT.tapBanner}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetClick}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-red-700 font-black text-xs uppercase shadow-md tracking-wider border border-red-200 cursor-pointer active:scale-95"
          >
            <span>{I18N_RESET_CONFIRM[lang]?.short || I18N_RESET_CONFIRM.IT.short}</span>
            <X className="w-4 h-4 text-red-700 stroke-[3]" />
          </button>
        </div>
      )}

      {/* STAFF LOGOUT PIN SECURITY MODAL (Code: 1296) */}
      {isLogoutPinModalOpen && (
        <div className="fixed inset-0 z-[100002] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-stone-900 border-2 border-amber-400/60 rounded-3xl w-full max-w-xs sm:max-w-sm p-5 sm:p-6 text-white text-center space-y-4 sm:space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => {
                setIsLogoutPinModalOpen(false);
                setLogoutPinInput('');
                setLogoutPinError(false);
              }}
              className="absolute top-3.5 right-3.5 p-2 text-stone-400 hover:text-white rounded-full bg-stone-800/80 hover:bg-stone-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Lock className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                {I18N_LOGOUT_PIN[lang]?.title || I18N_LOGOUT_PIN.IT.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-400 font-medium px-2">
                {I18N_LOGOUT_PIN[lang]?.subtitle || I18N_LOGOUT_PIN.IT.subtitle}
              </p>
            </div>

            {/* 4 PIN Dots */}
            <div className={`flex items-center justify-center gap-3.5 py-1.5 ${logoutPinError ? 'animate-bounce text-red-500' : ''}`}>
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-all duration-200 border-2 ${
                    logoutPinError
                      ? 'bg-red-500 border-red-400 shadow-lg shadow-red-500/50 scale-110'
                      : i < logoutPinInput.length
                        ? 'bg-amber-400 border-amber-300 shadow-md shadow-amber-400/40 scale-110'
                        : 'bg-stone-800 border-stone-600'
                  }`}
                />
              ))}
            </div>

            {logoutPinError && (
              <p className="text-[11px] sm:text-xs font-bold text-red-400 animate-fadeIn">
                {I18N_LOGOUT_PIN[lang]?.error || I18N_LOGOUT_PIN.IT.error}
              </p>
            )}

            {/* Numeric Keypad (Touch-Friendly) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 max-w-[240px] sm:max-w-[260px] mx-auto pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleLogoutPinDigit(d)}
                  className="h-11 sm:h-12 rounded-2xl bg-stone-800/90 hover:bg-stone-700/90 active:bg-amber-500 active:text-stone-950 text-white font-black text-lg sm:text-xl border border-stone-700/70 shadow transition-all cursor-pointer select-none"
                >
                  {d}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setIsLogoutPinModalOpen(false);
                  setLogoutPinInput('');
                  setLogoutPinError(false);
                }}
                className="h-11 sm:h-12 rounded-2xl bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-white font-bold text-[11px] sm:text-xs border border-stone-700/70 shadow transition-all cursor-pointer select-none uppercase tracking-wider"
              >
                {I18N_LOGOUT_PIN[lang]?.cancelBtn || I18N_LOGOUT_PIN.IT.cancelBtn}
              </button>
              <button
                type="button"
                onClick={() => handleLogoutPinDigit('0')}
                className="h-11 sm:h-12 rounded-2xl bg-stone-800/90 hover:bg-stone-700/90 active:bg-amber-500 active:text-stone-950 text-white font-black text-lg sm:text-xl border border-stone-700/70 shadow transition-all cursor-pointer select-none"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleLogoutPinDelete}
                className="h-11 sm:h-12 rounded-2xl bg-stone-850 hover:bg-stone-800 text-amber-400 hover:text-amber-300 font-black text-base border border-stone-700/70 shadow transition-all cursor-pointer select-none flex items-center justify-center"
              >
                ⌫
              </button>
            </div>
          </div>
        </div>
      )}

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
                    onClick={() => {
                      setLogoutPinInput('');
                      setLogoutPinError(false);
                      setIsLogoutPinModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-700/80 hover:border-amber-400/60 text-stone-300 hover:text-amber-300 text-[11px] sm:text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 whitespace-nowrap"
                    title={I18N_LOGOUT_PIN[lang]?.title || 'Staff PIN (1296)'}
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400/90" />
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
                    <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 inline-block animate-pulse"></span> {I18N_TABLE_PICKER[lang]?.guestLabel || I18N_TABLE_PICKER.IT.guestLabel}</span>
                    <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 inline-block"></span> {I18N_TABLE_PICKER[lang]?.activeLabel || I18N_TABLE_PICKER.IT.activeLabel}</span>
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
                              ? 'bg-gradient-to-br from-amber-950/80 to-stone-900 border-amber-400 text-white shadow-lg ring-1 ring-amber-400/70 hover:bg-amber-900/60'
                              : isOccupied
                                ? 'bg-amber-950/50 border-amber-500/70 text-stone-200 hover:border-amber-400 hover:bg-amber-950/70'
                                : 'bg-stone-950/80 border-stone-800 text-stone-200 hover:border-amber-400/60 hover:bg-stone-850'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs sm:text-sm font-black uppercase tracking-tight text-white truncate">{displayName}</span>
                          <span className="relative flex h-2 w-2">
                            {isGuestOccupied ? (
                              <>
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
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
                            ? 'text-amber-300 font-black animate-pulse'
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
                    <span className="text-amber-300">
                      {DINING_LEAD_BANNER[lang]?.title || DINING_LEAD_BANNER.EN.title}
                    </span>
                  </h1>

                  {/* Subtitle & Delivery Gift Incentive */}
                  <p className="text-[9.5px] sm:text-[10.5px] md:text-[11.5px] text-stone-200 leading-relaxed font-normal">
                    {DINING_LEAD_BANNER[lang]?.subtitle || DINING_LEAD_BANNER.EN.subtitle}
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
                        {allDynamicWines.length} {(WINE_FILTER_LABELS[lang] || WINE_FILTER_LABELS.IT).winesCount}
                      </p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold self-start sm:self-auto">
                    <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
                    <span>{(WINE_FILTER_LABELS[lang] || WINE_FILTER_LABELS.IT).italianFirstBadge}</span>
                  </div>
                </div>

                {/* Filter Dropdowns */}
                <div className="relative z-30 flex items-end gap-3 flex-wrap">
                  <CustomFilterDropdown
                    label={(DROPDOWN_LABELS[lang] || DROPDOWN_LABELS.IT).wineTypeFilter}
                    selectedId={selectedWineType}
                    options={[
                      { id: 'all', label: (WINE_FILTER_LABELS[lang] || WINE_FILTER_LABELS.IT).allTypes, count: wineTypeCounts.all },
                      ...WINE_TYPE_SECTIONS.map(s => ({
                        id: s.id,
                        label: (s.name[lang] || s.name.IT || s.name.EN),
                        count: wineTypeCounts[s.id as keyof typeof wineTypeCounts] || 0
                      }))
                    ]}
                    onSelect={(id) => setSelectedWineType(id as any)}
                  />

                  <CustomFilterDropdown
                    label={(DROPDOWN_LABELS[lang] || DROPDOWN_LABELS.IT).wineCountryFilter}
                    selectedId={selectedWineCountry}
                    options={[
                      { id: 'all', label: (WINE_FILTER_LABELS[lang] || WINE_FILTER_LABELS.IT).allCountries },
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
                          <span>{lang === 'TH' ? 'ทั้งหมด' : lang === 'IT' ? 'Tutti' : lang === 'DE' ? 'Alle' : lang === 'MM' ? 'အားလုံး' : lang === 'ES' ? 'Todos' : lang === 'FR' ? 'Tous' : lang === 'RU' ? 'Все' : lang === 'ZH' ? '全部' : 'All'}</span>
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
                          <span>{lang === 'TH' ? 'มังสวิรัติ' : lang === 'IT' ? 'Veggie' : lang === 'DE' ? 'Veggie' : lang === 'MM' ? 'သတ်သတ်လွတ်' : lang === 'ES' ? 'Vegetariano' : lang === 'FR' ? 'Végétarien' : lang === 'RU' ? 'Вегетарианское' : lang === 'ZH' ? '素食' : 'Veggie'}</span>
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
                          <span>{lang === 'TH' ? 'วีแกน' : lang === 'IT' ? 'Vegan' : lang === 'DE' ? 'Vegan' : lang === 'MM' ? 'ဗီဂျန်' : lang === 'ES' ? 'Vegano' : lang === 'FR' ? 'Végan' : lang === 'RU' ? 'Веганское' : lang === 'ZH' ? '纯素' : 'Vegan'}</span>
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
                  {groupedDailySpecials.map(group => {
                    const isShowcase = group.id === 'fresh-showcase';
                    return (
                      <div 
                        key={group.id} 
                        id={`specials-${group.id}`} 
                        className={`scroll-mt-24 transition-all ${
                          isShowcase
                            ? 'p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/15 border-2 border-amber-400/50 shadow-lg shadow-amber-900/5 mb-8'
                            : ''
                        }`}
                      >
                        <div className="px-2 mb-6">
                          <div className="flex items-center gap-3">
                            {isShowcase && (
                              <span className="p-1.5 sm:p-2 rounded-2xl bg-amber-400 text-stone-950 font-black shadow-md shadow-amber-400/30 flex items-center justify-center shrink-0">
                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-stone-950" />
                              </span>
                            )}
                            <h3 className={`font-sans text-lg md:text-xl font-extrabold tracking-tight ${
                              isShowcase ? 'text-amber-950' : 'text-stone-800'
                            }`} style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
                              {(group.name[lang] || group.name.IT || group.name.EN)}
                            </h3>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              isShowcase ? 'bg-amber-400 text-stone-950' : 'text-stone-400'
                            }`}>
                              ({group.items.length})
                            </span>
                            <div className={`flex-1 h-px ${isShowcase ? 'bg-amber-400/50' : 'bg-stone-300/60'}`} />
                          </div>
                          {group.desc && (
                            <p className={`text-sm mt-1.5 leading-relaxed max-w-2xl ${
                              isShowcase ? 'text-amber-900/80 font-medium' : 'text-stone-600 font-light italic'
                            }`} style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
                              {(group.desc?.[lang] || group.desc?.IT || group.desc?.EN || "")}
                            </p>
                          )}
                        </div>
                        <MenuGrid items={group.items} lang={lang} isDiningMode={true} />
                      </div>
                    );
                  })}
                </div>
              ) : activeCategoryId === 'pasta' ? (
                <div className="space-y-12">
                  {groupedPasta.map(group => (
                    <div key={group.id} id={`sauce-${group.id}`} className="scroll-mt-24">
                      <div className="px-2 mb-6">
                        <div className="flex items-center gap-3">
                          <h3 className="font-sans text-lg font-extrabold text-stone-800 tracking-tight" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
                            {(group.name[lang] || group.name.IT || group.name.EN)}
                          </h3>
                          <div className="flex-1 h-px bg-stone-300/60" />
                        </div>
                        {group.desc && (
                          <p className="text-stone-600 text-sm mt-1.5 font-light italic leading-relaxed max-w-2xl" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
                            {(group.desc?.[lang] || group.desc?.IT || group.desc?.EN || "")}
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
                            {(group.name[lang] || group.name.IT || group.name.EN)}
                          </h3>
                          <span className="text-xs text-stone-400 font-medium">
                            ({group.items.length})
                          </span>
                          <div className="flex-1 h-px bg-stone-300/60" />
                        </div>
                        {group.desc && (
                          <p className="text-stone-600 text-sm mt-1.5 font-light italic leading-relaxed max-w-2xl" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
                            {(group.desc?.[lang] || group.desc?.IT || group.desc?.EN || "")}
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
                            {(group.name[lang] || group.name.IT || group.name.EN)}
                          </h3>
                          <span className="text-xs text-stone-400 font-medium">
                            ({group.items.length})
                          </span>
                          <div className="flex-1 h-px bg-stone-300/60" />
                        </div>
                        {group.desc && (
                          <p className="text-stone-600 text-sm mt-1.5 font-light italic leading-relaxed max-w-2xl" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
                            {(group.desc?.[lang] || group.desc?.IT || group.desc?.EN || "")}
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
                                {(group.name[lang] || group.name.IT || group.name.EN)}
                              </h3>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white shadow-xs" style={{ backgroundColor: group.color }}>
                                {group.badge[lang]}
                              </span>
                              <div className="flex-1 h-px bg-stone-300/60" />
                            </div>
                            {group.desc && (
                              <p className="text-stone-600 text-xs sm:text-sm mt-1.5 font-light italic leading-relaxed max-w-3xl" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
                                {(group.desc?.[lang] || group.desc?.IT || group.desc?.EN || "")}
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
                      <p className="text-sm font-semibold">{(WINE_FILTER_LABELS[lang] || WINE_FILTER_LABELS.IT).noWinesFound}</p>
                      <button
                        type="button"
                        onClick={() => { setSelectedWineType('all'); setSelectedWineCountry('all'); }}
                        className="px-4 py-2 bg-[#8B1E1E] text-white text-xs font-bold rounded-xl shadow cursor-pointer hover:bg-[#701616]"
                      >
                        {(WINE_FILTER_LABELS[lang] || WINE_FILTER_LABELS.IT).resetFilters}
                      </button>
                    </div>
                  )
                ) : (
                  filteredCategoryItems.length > 0 ? (
                    <MenuGrid items={filteredCategoryItems} lang={lang} isDiningMode={true} />
                  ) : (
                    <div className="py-16 text-center text-stone-500 space-y-3 bg-white/60 rounded-3xl border border-stone-200 p-8">
                      <Wine className="w-12 h-12 mx-auto text-stone-400 stroke-1" />
                      <p className="text-sm font-semibold">{(WINE_FILTER_LABELS[lang] || WINE_FILTER_LABELS.IT).noWinesFound}</p>
                      <button
                        type="button"
                        onClick={() => { setSelectedWineType('all'); setSelectedWineCountry('all'); }}
                        className="px-4 py-2 bg-[#8B1E1E] text-white text-xs font-bold rounded-xl shadow cursor-pointer hover:bg-[#701616]"
                      >
                        {(WINE_FILTER_LABELS[lang] || WINE_FILTER_LABELS.IT).resetFilters}
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
                © {new Date().getFullYear()} Flower Power Pizza Ranong · Dining Tablet Mode.
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
        existingCustomerName={currentTable ? (activeTableOrderMap[getCanonicalTableKey(currentTable)]?.[0]?.customer_name || '') : ''}
        existingCustomerEmail={currentTable ? (activeTableOrderMap[getCanonicalTableKey(currentTable)]?.[0]?.customer_email || '') : ''}
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
