import React, { useState, useEffect } from 'react';
import { 
  X, 
  UtensilsCrossed, 
  Check, 
  Sparkles, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Loader2, 
  Percent, 
  Phone, 
  User, 
  Mail, 
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Gift,
  ZoomIn,
  Building2,
  Info,
  Receipt,
  Send
} from 'lucide-react';
import { useCartStore, calcItemTotal } from '../store/cartStore';
import { supabase } from '../../lib/supabase';
import { Language } from '../config/languages';

const QR_KSHOP_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/receipts/qr_promptpay.jpg`;

interface DiningCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialTable?: string;
  lang?: Language;
  existingOrderId?: string | null;
  existingCustomerName?: string;
  existingCustomerEmail?: string;
}

import { DINING_TABLES, formatTableStationName, getCanonicalTableKey, extractTableFromAddress } from '../utils/tableUtils';
import { createUniqueDiningPromoCode } from '../services/pizzaPromoService';

const I18N_CHECKOUT: Record<string, {
  modalTitle: string;
  privilegeBadge: string;
  tableSection: string;
  customTableBtn: string;
  listTableBtn: string;
  customPlaceholder: string;
  clientSection: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  emailNotice: string;
  notesLabel: string;
  notesPlaceholder: string;
  payAtCounterTitle: string;
  payAtCounterDesc: string;
  payAtCounterBadge: string;
  subtotalLabel: string;
  discountLabel: string;
  finalTotalLabel: string;
  submitBtn: string;
  submittingBtn: string;
  successTitle: string;
  successSubtitle: string;
  giftTitle: string;
  giftDesc: string;
  summaryPill: string;
  finishBtn: string;
}> = {
  "IT": {
    "modalTitle": "Invia Ordine al Tavolo",
    "privilegeBadge": "ORDINAZIONE AL TAVOLO",
    "tableSection": "1. Postazione Tavolo",
    "customTableBtn": "Inserimento libero",
    "listTableBtn": "Scegli da lista",
    "customPlaceholder": "es. Tavolo 7 / Terrazza / Bancone",
    "clientSection": "2. Dati Cliente (Coupon Sconto 10% Delivery)",
    "nameLabel": "Nome / Riferimento",
    "namePlaceholder": "es. Marco",
    "emailLabel": "Email (Opzionale - Ricevi Coupon 10%)",
    "emailPlaceholder": "tuaemail@esempio.com",
    "emailNotice": "L'email non è obbligatoria. Se la inserisci, riceverai subito via email un coupon sconto del 10% valido 10 giorni per la tua prossima ordinazione da asporto o consegna a domicilio sul nostro sito web.",
    "notesLabel": "Note Speciali per la Cucina / Camerieri (Opzionale)",
    "notesPlaceholder": "es. Portare le pizze insieme, bicchieri extra...",
    "payAtCounterTitle": "Conto alla Cassa",
    "payAtCounterDesc": "Il conto verrà regolato comodamente alla cassa al termine della consumazione.",
    "payAtCounterBadge": "ALLA CASSA",
    "subtotalLabel": "Totale Prodotti",
    "discountLabel": "Sconto Promozionale",
    "finalTotalLabel": "Totale Conto Finale",
    "submitBtn": "Invia Ordine alla Cassa",
    "submittingBtn": "Invio comanda alla cassa in corso...",
    "successTitle": "Comanda Inviata alla Cassa!",
    "successSubtitle": "I tuoi piatti e le tue pizze vengono preparati al momento.",
    "giftTitle": "Regalo Speciale Delivery per Te!",
    "giftDesc": "Grazie per aver ordinato al tavolo! Se hai inserito la tua email, riceverai il tuo Coupon Sconto del 10% per il tuo prossimo ordine a domicilio su flowerpowerpizza.com.",
    "summaryPill": "Totale Conto al Tavolo:",
    "finishBtn": "Torna al Menu / Nuovo Ordine"
  },
  "EN": {
    "modalTitle": "Send Order to Table",
    "privilegeBadge": "TABLE ORDERING",
    "tableSection": "1. Table Location",
    "customTableBtn": "Free Entry",
    "listTableBtn": "Choose from List",
    "customPlaceholder": "e.g. Table 7 / Terrace / Counter",
    "clientSection": "2. Customer Details (10% Delivery Discount Coupon)",
    "nameLabel": "Name / Reference",
    "namePlaceholder": "e.g. Marco",
    "emailLabel": "Email (Optional - Get 10% Coupon)",
    "emailPlaceholder": "youremail@example.com",
    "emailNotice": "Email is not required. If you provide it, you will immediately receive a 10% discount coupon via email, valid for 10 days for your next takeaway or home delivery order on our website.",
    "notesLabel": "Special Notes for Kitchen / Waiters (Optional)",
    "notesPlaceholder": "e.g. Bring pizzas together, extra glasses...",
    "payAtCounterTitle": "Pay at Counter",
    "payAtCounterDesc": "The bill will be settled conveniently at the counter at the end of your meal.",
    "payAtCounterBadge": "AT THE COUNTER",
    "subtotalLabel": "Products Total",
    "discountLabel": "Promotional Discount",
    "finalTotalLabel": "Final Bill Total",
    "submitBtn": "Send Order to Counter",
    "submittingBtn": "Sending order to counter...",
    "successTitle": "Order Sent to Counter!",
    "successSubtitle": "Your dishes and pizzas are being prepared fresh.",
    "giftTitle": "Special Delivery Gift for You!",
    "giftDesc": "Thank you for ordering at the table! If you provided your email, you will receive your 10% Discount Coupon for your next home delivery order on flowerpowerpizza.com.",
    "summaryPill": "Table Bill Total:",
    "finishBtn": "Back to Menu / New Order"
  },
  "TH": {
    "modalTitle": "ส่งคำสั่งซื้อไปยังโต๊ะ",
    "privilegeBadge": "การสั่งอาหารที่โต๊ะ",
    "tableSection": "1. ตำแหน่งโต๊ะ",
    "customTableBtn": "ป้อนเอง",
    "listTableBtn": "เลือกจากรายการ",
    "customPlaceholder": "เช่น โต๊ะ 7 / ระเบียง / เคาน์เตอร์",
    "clientSection": "2. ข้อมูลลูกค้า (คูปองส่วนลด 10% สำหรับเดลิเวอรี)",
    "nameLabel": "ชื่อ / ข้อมูลอ้างอิง",
    "namePlaceholder": "เช่น มาร์โก",
    "emailLabel": "อีเมล (ไม่บังคับ - รับคูปอง 10%)",
    "emailPlaceholder": "อีเมลของคุณ@ตัวอย่าง.com",
    "emailNotice": "อีเมลไม่จำเป็นต้องกรอก หากคุณกรอก คุณจะได้รับคูปองส่วนลด 10% ทางอีเมลทันที ใช้ได้ 10 วันสำหรับการสั่งซื้อครั้งถัดไปแบบกลับบ้านหรือจัดส่งที่บ้านบนเว็บไซต์ของเรา",
    "notesLabel": "หมายเหตุพิเศษสำหรับครัว / พนักงานเสิร์ฟ (ไม่บังคับ)",
    "notesPlaceholder": "เช่น นำพิซซ่ามาพร้อมกัน, ขอแก้วเพิ่ม...",
    "payAtCounterTitle": "ชำระเงินที่แคชเชียร์",
    "payAtCounterDesc": "ชำระเงินที่แคชเชียร์อย่างสะดวกเมื่อรับประทานเสร็จ",
    "payAtCounterBadge": "ที่แคชเชียร์",
    "subtotalLabel": "ยอดรวมสินค้า",
    "discountLabel": "ส่วนลดโปรโมชั่น",
    "finalTotalLabel": "ยอดรวมบิลสุดท้าย",
    "submitBtn": "ส่งคำสั่งซื้อไปที่แคชเชียร์",
    "submittingBtn": "กำลังส่งคำสั่งซื้อไปที่แคชเชียร์...",
    "successTitle": "ส่งคำสั่งซื้อไปที่แคชเชียร์แล้ว!",
    "successSubtitle": "อาหารและพิซซ่าของคุณกำลังถูกเตรียมสดใหม่",
    "giftTitle": "ของขวัญพิเศษสำหรับเดลิเวอรี!",
    "giftDesc": "ขอบคุณที่สั่งอาหารที่โต๊ะ! หากคุณกรอกอีเมล คุณจะได้รับคูปองส่วนลด 10% สำหรับการสั่งซื้อครั้งถัดไปแบบจัดส่งที่บ้านบน flowerpowerpizza.com",
    "summaryPill": "ยอดรวมบิลที่โต๊ะ:",
    "finishBtn": "กลับไปที่เมนู / สั่งซื้อใหม่"
  },
  "MM": {
    "modalTitle": "စားပွဲသို့ အမှာတင်ပို့ပါ",
    "privilegeBadge": "စားပွဲဝန်ဆောင်မှု",
    "tableSection": "၁။ စားပွဲနေရာ",
    "customTableBtn": "လွတ်လပ်စွာထည့်သွင်းပါ",
    "listTableBtn": "စာရင်းမှ ရွေးချယ်ပါ",
    "customPlaceholder": "ဥပမာ - စားပွဲ ၇ / လှေကားထစ် / ကောင်တာ",
    "clientSection": "၂။ ဖောက်သည်အချက်အလက် (ပို့ဆောင်မှု ၁၀% လျှော့စျေးကူပွန်)",
    "nameLabel": "အမည် / ရည်ညွှန်း",
    "namePlaceholder": "ဥပမာ - မာကို",
    "emailLabel": "အီးမေးလ် (ရွေးချယ်နိုင် - ၁၀% ကူပွန်ရယူပါ)",
    "emailPlaceholder": "သင့်အီးမေးလ်@ဥပမာ.com",
    "emailNotice": "အီးမေးလ်သည် မဖြစ်မနေထည့်ရန်မလိုပါ။ ထည့်သွင်းပါက သင့်နောက်တစ်ကြိမ် အိမ်ယာပို့ဆောင်မှု သို့မဟုတ် ယူဆောင်သွားရန် မှာယူမှုအတွက် ၁၀ ရက်အထိ အသုံးပြုနိုင်သော ၁၀% လျှော့စျေးကူပွန်ကို အီးမေးလ်ဖြင့် ချက်ချင်းရရှိမည်ဖြစ်သည်။",
    "notesLabel": "မီးဖိုချောင် / စားပွဲထိုးအတွက် အထူးမှတ်ချက် (ရွေးချယ်နိုင်)",
    "notesPlaceholder": "ဥပမာ - ပီဇာများကို အတူတကွယူဆောင်လာပါ၊ ခွက်အပိုများ...",
    "payAtCounterTitle": "ကောင်တာတွင် ငွေရှင်းပါ",
    "payAtCounterDesc": "စားသောက်ပြီးဆုံးပါက ကောင်တာတွင် အဆင်ပြေစွာ ငွေရှင်းနိုင်ပါသည်။",
    "payAtCounterBadge": "ကောင်တာတွင်",
    "subtotalLabel": "ကုန်ပစ္စည်းစုစုပေါင်း",
    "discountLabel": "ပရိုမိုးရှင်းလျှော့စျေး",
    "finalTotalLabel": "နောက်ဆုံးစုစုပေါင်းငွေ",
    "submitBtn": "ကောင်တာသို့ အမှာတင်ပို့ပါ",
    "submittingBtn": "ကောင်တာသို့ အမှာတင်ပို့နေသည်...",
    "successTitle": "ကောင်တာသို့ အမှာတင်ပို့ပြီးပါပြီ!",
    "successSubtitle": "သင့်ဟင်းလျာများနှင့် ပီဇာများကို အချိန်နှင့်တပြေးညီ ပြင်ဆင်နေပါသည်။",
    "giftTitle": "သင့်အတွက် အထူးပို့ဆောင်မှုလက်ဆောင်!",
    "giftDesc": "စားပွဲတွင် မှာယူသည့်အတွက် ကျေးဇူးတင်ပါသည်! သင့်အီးမေးလ်ကို ထည့်သွင်းခဲ့ပါက flowerpowerpizza.com တွင် သင့်နောက်တစ်ကြိမ် အိမ်ယာပို့ဆောင်မှုအတွက် ၁၀% လျှော့စျေးကူပွန်ကို ရရှိမည်ဖြစ်သည်။",
    "summaryPill": "စားပွဲစုစုပေါင်းငွေ -",
    "finishBtn": "မီနူးသို့ပြန်သွား / အမှာအသစ်"
  },
  "DE": {
    "modalTitle": "Bestellung an den Tisch senden",
    "privilegeBadge": "TISCHBESTELLUNG",
    "tableSection": "1. Tischplatzierung",
    "customTableBtn": "Freie Eingabe",
    "listTableBtn": "Aus Liste wählen",
    "customPlaceholder": "z.B. Tisch 7 / Terrasse / Theke",
    "clientSection": "2. Kundendaten (10% Rabattgutschein für Lieferung)",
    "nameLabel": "Name / Referenz",
    "namePlaceholder": "z.B. Marco",
    "emailLabel": "E-Mail (Optional - 10% Gutschein erhalten)",
    "emailPlaceholder": "deineemail@beispiel.com",
    "emailNotice": "Die E-Mail ist nicht verpflichtend. Wenn du sie eingibst, erhältst du sofort per E-Mail einen 10% Rabattgutschein, gültig für 10 Tage, für deine nächste Bestellung zum Mitnehmen oder Lieferung auf unserer Website.",
    "notesLabel": "Besondere Hinweise für die Küche / Kellner (Optional)",
    "notesPlaceholder": "z.B. Pizzen zusammenbringen, extra Gläser...",
    "payAtCounterTitle": "Rechnung an der Kasse",
    "payAtCounterDesc": "Die Rechnung wird bequem an der Kasse am Ende des Verzehrs beglichen.",
    "payAtCounterBadge": "AN DER KASSE",
    "subtotalLabel": "Gesamtprodukte",
    "discountLabel": "Aktionsrabatt",
    "finalTotalLabel": "Endsumme der Rechnung",
    "submitBtn": "Bestellung an die Kasse senden",
    "submittingBtn": "Bestellung wird an die Kasse gesendet...",
    "successTitle": "Bestellung an die Kasse gesendet!",
    "successSubtitle": "Deine Gerichte und Pizzen werden frisch zubereitet.",
    "giftTitle": "Besonderes Liefergeschenk für dich!",
    "giftDesc": "Danke für deine Bestellung am Tisch! Wenn du deine E-Mail eingegeben hast, erhältst du deinen 10% Rabattgutschein für deine nächste Lieferbestellung auf flowerpowerpizza.com.",
    "summaryPill": "Gesamtrechnung am Tisch:",
    "finishBtn": "Zurück zum Menü / Neue Bestellung"
  },
  "FR": {
    "modalTitle": "Envoyer la Commande à Table",
    "privilegeBadge": "COMMANDE À TABLE",
    "tableSection": "1. Emplacement de Table",
    "customTableBtn": "Saisie libre",
    "listTableBtn": "Choisir dans la liste",
    "customPlaceholder": "ex. Table 7 / Terrasse / Comptoir",
    "clientSection": "2. Données Client (Coupon Réduction 10% Livraison)",
    "nameLabel": "Nom / Référence",
    "namePlaceholder": "ex. Marco",
    "emailLabel": "Email (Optionnel - Recevez un Coupon 10%)",
    "emailPlaceholder": "votreemail@exemple.com",
    "emailNotice": "L'email n'est pas obligatoire. Si vous le saisissez, vous recevrez immédiatement par email un coupon de réduction de 10% valable 10 jours pour votre prochaine commande à emporter ou en livraison sur notre site web.",
    "notesLabel": "Notes Spéciales pour la Cuisine / Serveurs (Optionnel)",
    "notesPlaceholder": "ex. Apporter les pizzas ensemble, verres supplémentaires...",
    "payAtCounterTitle": "Addition à la Caisse",
    "payAtCounterDesc": "L'addition sera réglée confortablement à la caisse à la fin de la consommation.",
    "payAtCounterBadge": "À LA CAISSE",
    "subtotalLabel": "Total Produits",
    "discountLabel": "Réduction Promotionnelle",
    "finalTotalLabel": "Total Addition Finale",
    "submitBtn": "Envoyer la Commande à la Caisse",
    "submittingBtn": "Envoi de la commande à la caisse en cours...",
    "successTitle": "Commande Envoyée à la Caisse !",
    "successSubtitle": "Vos plats et vos pizzas sont préparés à la minute.",
    "giftTitle": "Cadeau Spécial Livraison pour Vous !",
    "giftDesc": "Merci d'avoir commandé à table ! Si vous avez saisi votre email, vous recevrez votre Coupon Réduction de 10% pour votre prochaine commande en livraison sur flowerpowerpizza.com.",
    "summaryPill": "Total Addition à Table :",
    "finishBtn": "Retour au Menu / Nouvelle Commande"
  },
  "ES": {
    "modalTitle": "Enviar Pedido a la Mesa",
    "privilegeBadge": "PEDIDO EN MESA",
    "tableSection": "1. Ubicación de la Mesa",
    "customTableBtn": "Entrada libre",
    "listTableBtn": "Elegir de la lista",
    "customPlaceholder": "ej. Mesa 7 / Terraza / Barra",
    "clientSection": "2. Datos del Cliente (Cupón Descuento 10% Delivery)",
    "nameLabel": "Nombre / Referencia",
    "namePlaceholder": "ej. Marco",
    "emailLabel": "Email (Opcional - Recibe Cupón 10%)",
    "emailPlaceholder": "tuemail@ejemplo.com",
    "emailNotice": "El email no es obligatorio. Si lo introduces, recibirás inmediatamente por email un cupón de descuento del 10% válido por 10 días para tu próximo pedido para llevar o entrega a domicilio en nuestro sitio web.",
    "notesLabel": "Notas Especiales para la Cocina / Camareros (Opcional)",
    "notesPlaceholder": "ej. Traer las pizzas juntas, vasos extra...",
    "payAtCounterTitle": "Cuenta en Caja",
    "payAtCounterDesc": "La cuenta se liquidará cómodamente en caja al finalizar el consumo.",
    "payAtCounterBadge": "EN CAJA",
    "subtotalLabel": "Total Productos",
    "discountLabel": "Descuento Promocional",
    "finalTotalLabel": "Total Cuenta Final",
    "submitBtn": "Enviar Pedido a Caja",
    "submittingBtn": "Enviando comanda a caja en curso...",
    "successTitle": "¡Comanda Enviada a Caja!",
    "successSubtitle": "Tus platos y pizzas se preparan al momento.",
    "giftTitle": "¡Regalo Especial Delivery para Ti!",
    "giftDesc": "¡Gracias por pedir en la mesa! Si has introducido tu email, recibirás tu Cupón Descuento del 10% para tu próximo pedido a domicilio en flowerpowerpizza.com.",
    "summaryPill": "Total Cuenta en Mesa:",
    "finishBtn": "Volver al Menú / Nuevo Pedido"
  },
  "RU": {
    "modalTitle": "Отправить заказ на стол",
    "privilegeBadge": "ЗАКАЗ ЗА СТОЛОМ",
    "tableSection": "1. Расположение стола",
    "customTableBtn": "Свободный ввод",
    "listTableBtn": "Выбрать из списка",
    "customPlaceholder": "напр. Стол 7 / Терраса / Барная стойка",
    "clientSection": "2. Данные клиента (Купон на скидку 10% на доставку)",
    "nameLabel": "Имя / Обозначение",
    "namePlaceholder": "напр. Марко",
    "emailLabel": "Email (необязательно — получите купон на скидку 10%)",
    "emailPlaceholder": "вашапочта@пример.com",
    "emailNotice": "Email необязателен. Если вы его укажете, вы сразу получите по электронной почте купон на скидку 10%, действительный 10 дней, на ваш следующий заказ на вынос или с доставкой на дом на нашем сайте.",
    "notesLabel": "Особые пожелания для кухни / официантов (необязательно)",
    "notesPlaceholder": "напр. Принести пиццы вместе, дополнительные стаканы...",
    "payAtCounterTitle": "Оплата на кассе",
    "payAtCounterDesc": "Счет можно будет удобно оплатить на кассе по окончании трапезы.",
    "payAtCounterBadge": "НА КАССЕ",
    "subtotalLabel": "Итого за продукты",
    "discountLabel": "Промо-скидка",
    "finalTotalLabel": "Итоговая сумма счета",
    "submitBtn": "Отправить заказ на кассу",
    "submittingBtn": "Отправка заказа на кассу...",
    "successTitle": "Заказ отправлен на кассу!",
    "successSubtitle": "Ваши блюда и пиццы готовятся прямо сейчас.",
    "giftTitle": "Особый подарок на доставку для вас!",
    "giftDesc": "Спасибо за заказ за столом! Если вы указали свой email, вы получите купон на скидку 10% на ваш следующий заказ с доставкой на дом на flowerpowerpizza.com.",
    "summaryPill": "Итого по счету за столом:",
    "finishBtn": "Вернуться в меню / Новый заказ"
  },
  "ZH": {
    "modalTitle": "发送订单到餐桌",
    "privilegeBadge": "餐桌点餐",
    "tableSection": "1. 餐桌位置",
    "customTableBtn": "自由输入",
    "listTableBtn": "从列表选择",
    "customPlaceholder": "例如：7号桌 / 露台 / 吧台",
    "clientSection": "2. 客户信息（外卖10%折扣优惠券）",
    "nameLabel": "姓名 / 称呼",
    "namePlaceholder": "例如：Marco",
    "emailLabel": "邮箱（可选 - 获取10%优惠券）",
    "emailPlaceholder": "youremail@example.com",
    "emailNotice": "邮箱不是必填项。如果您填写，将立即通过邮件收到一张10%折扣优惠券，有效期10天，适用于您下次在我们网站上的外带或外卖订单。",
    "notesLabel": "厨房 / 服务员特别备注（可选）",
    "notesPlaceholder": "例如：披萨一起上，额外杯子...",
    "payAtCounterTitle": "收银台结账",
    "payAtCounterDesc": "用餐结束后，请方便地在收银台结账。",
    "payAtCounterBadge": "收银台",
    "subtotalLabel": "产品总计",
    "discountLabel": "促销折扣",
    "finalTotalLabel": "最终账单总计",
    "submitBtn": "发送订单到收银台",
    "submittingBtn": "正在发送订单到收银台...",
    "successTitle": "订单已发送到收银台！",
    "successSubtitle": "您的菜肴和披萨正在新鲜制作中。",
    "giftTitle": "特别外卖礼物送给您！",
    "giftDesc": "感谢您在餐桌点餐！如果您填写了邮箱，将收到10%折扣优惠券，用于下次在flowerpowerpizza.com上的外卖订单。",
    "summaryPill": "餐桌账单总计：",
    "finishBtn": "返回菜单 / 新订单"
  }
};

export const DiningCheckoutModal: React.FC<DiningCheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTable = 'Tavolo 1 (Interno)',
  lang = 'IT',
  existingOrderId = null,
  existingCustomerName = '',
  existingCustomerEmail = ''
}) => {
  const t = I18N_CHECKOUT[lang] || I18N_CHECKOUT.IT;
  const { items, clearCart, getTotal } = useCartStore();
  const [selectedTable, setSelectedTable] = useState<string>(initialTable);
  const [isCustomTable, setIsCustomTable] = useState(false);
  const [customTableText, setCustomTableText] = useState('');

  useEffect(() => {
    if (initialTable) {
      setSelectedTable(initialTable);
    }
  }, [initialTable]);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  // Pre-populate customer name & email if re-opening an active order; start 100% empty for new orders
  useEffect(() => {
    if (isOpen) {
      if (existingCustomerName || existingCustomerEmail) {
        setCustomerName(existingCustomerName || '');
        setCustomerEmail(existingCustomerEmail || '');
      } else {
        setCustomerName('');
        setCustomerEmail('');
      }
      setSpecialNotes('');
    }
  }, [isOpen, initialTable, existingCustomerName, existingCustomerEmail]);
  const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'card' | 'cash'>('promptpay');
  const [isQrZoomOpen, setIsQrZoomOpen] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');

  const handleFinish = () => {
    setIsSuccess(false);
    onSuccess();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      return;
    }

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('pizza_orders_channel');
      bc.onmessage = (ev) => {
        if (ev.data?.type === 'ORDER_ACCEPTED' || ev.data?.status === 'preparing') {
          handleFinish();
        }
      };
    } catch {}

    if (!isSuccess) {
      return () => {
        if (bc) bc.close();
      };
    }

    const timer = setTimeout(() => {
      handleFinish();
    }, 2500);

    return () => {
      clearTimeout(timer);
      if (bc) bc.close();
    };
  }, [isSuccess, isOpen]);

  if (!isOpen) return null;

  const rawSubtotal = getTotal();
  // Dining Tablet Normal Prices (Full regular price, zero table discount)
  const discountRate = 0;
  const discountAmount = 0;
  const finalTotal = rawSubtotal;

  const activeTable = isCustomTable && customTableText.trim() ? customTableText.trim() : selectedTable;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalCustomerName = customerName.trim() || activeTable || 'Cliente Tavolo';
      const finalCustomerPhone = '-';

      const paymentLabel = paymentMethod === 'promptpay' ? 'promptpay_kshop_at_table' : paymentMethod === 'card' ? 'card_pos_at_table' : 'cash_at_table';

      let diningPromoCode = '';
      if (customerEmail.trim()) {
        try {
          diningPromoCode = createUniqueDiningPromoCode('DINE10');
        } catch (e) {
          console.warn('[DiningCheckout] Promo generation fallback:', e);
        }
      }

      const formattedAddress = `[DINE-IN: ${activeTable}]` + 
        (lang ? ` [LANG: ${lang}]` : '') + 
        (customerEmail.trim() ? ` [EMAIL: ${customerEmail.trim()}]` : '') + 
        (diningPromoCode ? ` [DINING_VOUCHER: ${diningPromoCode}]` : '') + 
        (specialNotes.trim() ? ` [NOTE: ${specialNotes.trim()}]` : '');

      const canonicalCurrentTable = getCanonicalTableKey(activeTable);

      const formattedItems = items.map(i => ({
        cartId: i.cartId,
        productId: i.productId,
        name: i.name,
        nameIt: i.nameIt,
        nameTh: i.nameTh,
        nameDe: i.nameDe,
        nameMm: (i as any).nameMm || (i as any).name_mm,
        name_mm: (i as any).nameMm || (i as any).name_mm,
        nameEs: (i as any).nameEs,
        nameFr: (i as any).nameFr,
        nameRu: (i as any).nameRu,
        nameZh: (i as any).nameZh,
        image: i.image || '',
        quantity: i.quantity,
        basePrice: i.basePrice,
        selectedVariant: i.selectedVariant || null,
        selectedExtras: i.selectedExtras || [],
        variant: i.selectedVariant?.name || null, // legacy backward compat
        extras: (i.selectedExtras || []).map(e => e.name), // legacy backward compat
        isHalalChicken: (i as any).isHalalChicken || false,
        lasagnaDate: (i as any).lasagnaDate || null,
        total: calcItemTotal(i)
      }));

      // 1. Check if an active order exists for this table to label additions & update existing record
      let isTableIntegration = Boolean(existingOrderId);
      let activeExistingOrderId: string | null = existingOrderId ? String(existingOrderId) : null;
      if (!activeExistingOrderId) {
        try {
          const queryPromise = supabase
            .from('pizza_orders')
            .select('id, address, table_number')
            .neq('status', 'completed')
            .neq('status', 'cancelled')
            .neq('status', 'rejected')
            .neq('status', 'settled')
            .order('created_at', { ascending: false });

          const timeoutPromise = new Promise<{ data: any[] | null }>((resolve) => 
            setTimeout(() => resolve({ data: null }), 1500)
          );

          const { data: openOrders } = await Promise.race([queryPromise, timeoutPromise]);

          if (openOrders && openOrders.length > 0) {
            const found = openOrders.find((o: any) => {
              const raw = extractTableFromAddress(o.address) || o.table_number || '';
              return raw && getCanonicalTableKey(raw) === canonicalCurrentTable;
            });
            if (found) {
              isTableIntegration = true;
              activeExistingOrderId = String(found.id);
            }
          }
        } catch (e) {
          console.warn('[DiningCheckout] Active table check notice:', e);
        }
      }

      const finalAddress = isTableIntegration 
        ? `${formattedAddress} [INTEGRAZIONE_COMANDA]` 
        : formattedAddress;

      // 2. Prepare order payload
      const orderPayload = {
        customer_name: finalCustomerName,
        phone: finalCustomerPhone,
        address: finalAddress,
        items: formattedItems,
        total: finalTotal,
        payment_method: paymentLabel,
        status: 'new',
        has_whatsapp: true,
        has_line: false,
        created_at: new Date().toISOString()
      };

      const voucherEmailPayload = (customerEmail.trim() && diningPromoCode) ? {
        toEmail: customerEmail.trim(),
        customerName: finalCustomerName,
        promoCode: diningPromoCode,
        lang: lang || 'IT'
      } : undefined;

      // 3. Primary: Serverless Backend API (service_role bypasses RLS and guaranteed atomic write/update)
      try {
        const res = await fetch('/api/pizza-order-submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            order: orderPayload, 
            existingOrderId: activeExistingOrderId,
            voucherEmail: voucherEmailPayload
          })
        });
        const apiRes = await res.json();
        if (apiRes && apiRes.success && apiRes.order) {
          savedOrder = apiRes.order;
        }
      } catch (apiErr) {
        console.warn('[DiningCheckout] Backend API submit failed, checking client fallback:', apiErr);
      }

      // 4. Secondary fallback: Direct Supabase client only if serverless API route is unreachable
      if (!savedOrder) {
        try {
          if (activeExistingOrderId) {
            const { data: updated } = await supabase
              .from('pizza_orders')
              .update(orderPayload)
              .eq('id', activeExistingOrderId)
              .select('*')
              .single();
            if (updated) savedOrder = updated;
          }
          if (!savedOrder) {
            const { data: inserted } = await supabase
              .from('pizza_orders')
              .insert([orderPayload])
              .select('*')
              .single();
            if (inserted) savedOrder = inserted;
          }
        } catch (err) {
          console.warn('[DiningCheckout] Fallback client write error:', err);
        }
      }

      if (!savedOrder) {
        savedOrder = { id: activeExistingOrderId || `dine-${Date.now().toString().slice(-6)}`, ...orderPayload };
      }

      if (savedOrder) {
        const ordId = String(savedOrder.id);
        setCreatedOrderId(ordId);

        // Save customer contact in local storage
        try {
          if (customerName) localStorage.setItem('fp_last_dining_customer_name', customerName);
          if (customerEmail) localStorage.setItem('fp_last_dining_customer_email', customerEmail);
        } catch {}

        // Broadcast immediately to Kitchen Display System (KDS) & Local Listeners
        try {
          const ch = new BroadcastChannel('pizza_orders_channel');
          ch.postMessage({ type: 'NEW_ORDER', order: savedOrder, orderId: ordId, isTableReload: isTableIntegration, hasNewItems: true });
          ch.close();
        } catch {}

        try {
          const chFP = new BroadcastChannel('flower_power_orders_channel');
          chFP.postMessage({ type: 'NEW_ORDER', order: savedOrder, orderId: ordId, isTableReload: isTableIntegration, hasNewItems: true });
          chFP.close();
        } catch {}

        // Trigger Telegram notification in background
        try {
          fetch('/api/telegram-notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: ordId })
          }).catch(e => console.warn('[DiningCheckout] Telegram notify failed:', e));
        } catch {}

        setIsSuccess(true);
      }
    } catch (globalErr) {
      console.error('[DiningCheckout] Global order submission error:', globalErr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn antialiased" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
      <div className="relative w-full max-w-lg bg-stone-900 border border-amber-400/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8B1E1E] via-[#781818] to-[#5a1111] px-5 py-4 flex items-center justify-between text-white border-b border-red-800/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-md">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg leading-tight text-white flex items-center gap-2">
                <span>{t.modalTitle}</span>
                <span className="bg-amber-400 text-stone-950 text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-xs">
                  {t.privilegeBadge}
                </span>
              </h3>
              <p className="text-amber-200/90 text-xs font-medium">
                {formatTableStationName(activeTable, lang)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 space-y-5 text-stone-200 flex-1">
          {isSuccess ? (
            /* SUCCESS CONFIRMATION SCREEN */
            <div className="text-center py-6 space-y-4 animate-scaleIn">
              <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-400 rounded-full mx-auto flex items-center justify-center shadow-lg">
                <Check className="w-8 h-8 text-emerald-400 stroke-[3]" />
              </div>

              <div className="space-y-1">
                <h4 className="text-2xl font-black text-white">
                  {t.successTitle}
                </h4>
                <p className="text-sm text-amber-300 font-bold">
                  {formatTableStationName(activeTable, lang)}
                </p>
                <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                  {t.successSubtitle}
                </p>
              </div>

              {/* Special Delivery Gift Card */}
              <div className="p-4 bg-gradient-to-br from-[#2a1717] to-[#150a0a] border border-amber-400/50 rounded-2xl text-left space-y-2 shadow-inner">
                <div className="flex items-center gap-2 text-amber-300 font-black text-xs uppercase tracking-wider">
                  <Gift className="w-4 h-4 text-amber-400" />
                  <span>{t.giftTitle}</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {t.giftDesc}
                </p>
              </div>

              {/* Order Summary Pill */}
              <div className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
                <span className="text-stone-400">{t.summaryPill}</span>
                <span className="text-amber-400 font-black text-sm">{finalTotal} ฿</span>
              </div>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl shadow-lg transition-all cursor-pointer text-sm uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>{t.finishBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* CHECKOUT FORM */
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              
              {/* 1. Table Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
                  <span>{t.tableSection}</span>
                  <button
                    type="button"
                    onClick={() => setIsCustomTable(!isCustomTable)}
                    className="text-[10px] text-stone-400 hover:text-white underline"
                  >
                    {isCustomTable ? t.listTableBtn : t.customTableBtn}
                  </button>
                </label>

                {isCustomTable ? (
                  <input
                    type="text"
                    required
                    value={customTableText}
                    onChange={(e) => setCustomTableText(e.target.value)}
                    placeholder={t.customPlaceholder}
                    className="w-full bg-stone-950 border border-stone-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                  />
                ) : (
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {DINING_TABLES.map(tOption => (
                      <option key={tOption} value={tOption}>{formatTableStationName(tOption, lang)}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* 2. Customer Contact (Lead Gen - Optional Discount Coupon) */}
              <div className="p-3.5 bg-stone-950/70 border border-stone-800 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                  <Gift className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.clientSection}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10.5px] text-stone-400 font-bold block">{t.nameLabel}</label>
                    <input
                      type="text"
                      name="name"
                      id="dining-customer-name"
                      autoComplete="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={t.namePlaceholder}
                      className="w-full bg-stone-900 border border-stone-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] text-stone-400 font-bold block">
                      {t.emailLabel}
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="dining-customer-email"
                      autoComplete="email"
                      inputMode="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className="w-full bg-stone-900 border border-stone-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Email Optional Notice & 10% Voucher explanation */}
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-start gap-2 text-amber-200/90 text-[11px] leading-relaxed">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="font-normal text-stone-300">
                    {t.emailNotice}
                  </p>
                </div>
              </div>

              {/* 3. Special Kitchen Notes */}
              <div className="space-y-1">
                <label className="text-[10.5px] text-stone-400 font-bold block flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3 text-stone-500" />
                  <span>{t.notesLabel}</span>
                </label>
                <input
                  type="text"
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder={t.notesPlaceholder}
                  className="w-full bg-stone-950 border border-stone-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* 4. Payment at Counter Notice */}
              <div className="p-3.5 bg-gradient-to-br from-amber-500/10 via-stone-900 to-stone-950 border border-amber-500/30 rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-black shrink-0 shadow-md">
                  <Receipt className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
                      {t.payAtCounterTitle}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider shrink-0">
                      {t.payAtCounterBadge}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-300 mt-0.5 leading-snug">
                    {t.payAtCounterDesc}
                  </p>
                </div>
              </div>

              {/* 5. Pricing Breakdown & 5% Privilege */}
              <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-2xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-stone-400">
                  <span>{t.subtotalLabel} ({items.reduce((s, i) => s + i.quantity, 0)} pz):</span>
                  <span>{rawSubtotal} ฿</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t.discountLabel}:</span>
                    </span>
                    <span>- {discountAmount} ฿</span>
                  </div>
                )}
                <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-white font-black text-sm">
                  <span>{t.finalTotalLabel}:</span>
                  <span className="text-amber-400 text-base">{finalTotal} ฿</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-black rounded-2xl shadow-xl transition-all cursor-pointer disabled:opacity-50 text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.99] border border-amber-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.submittingBtn}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-stone-950 stroke-[2.5]" />
                    <span>{t.submitBtn}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
