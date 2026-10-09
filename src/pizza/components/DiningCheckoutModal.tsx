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
  IT: {
    modalTitle: 'Invia Ordine al Tavolo',
    privilegeBadge: '-5% SCONTO AL TAVOLO',
    tableSection: '1. Postazione Tavolo',
    customTableBtn: 'Inserimento libero',
    listTableBtn: 'Scegli da lista',
    customPlaceholder: 'es. Tavolo 7 / Terrazza / Bancone',
    clientSection: '2. Dati Cliente (Coupon Sconto 10% Delivery)',
    nameLabel: 'Nome / Riferimento',
    namePlaceholder: 'es. Marco',
    emailLabel: 'Email (Opzionale - Ricevi Coupon 10%)',
    emailPlaceholder: 'tuaemail@esempio.com',
    emailNotice: "L'email non è obbligatoria. Se la inserisci, riceverai subito via email un coupon sconto del 10% valido 10 giorni per la tua prossima ordinazione da asporto o consegna a domicilio sul nostro sito web.",
    notesLabel: 'Note Speciali per la Cucina / Camerieri (Opzionale)',
    notesPlaceholder: 'es. Portare le pizze insieme, bicchieri extra...',
    payAtCounterTitle: 'Conto alla Cassa',
    payAtCounterDesc: 'Il conto verrà regolato comodamente alla cassa al termine della consumazione.',
    payAtCounterBadge: 'ALLA CASSA',
    subtotalLabel: 'Totale Prodotti',
    discountLabel: 'Sconto Dining Privilege (-5%)',
    finalTotalLabel: 'Totale Conto Finale',
    submitBtn: 'Invia Ordine alla Cassa (-5%)',
    submittingBtn: 'Invio comanda alla cassa in corso...',
    successTitle: 'Comanda Inviata alla Cassa!',
    successSubtitle: 'I tuoi piatti e le tue pizze vengono preparati al momento.',
    giftTitle: 'Regalo Speciale Delivery per Te!',
    giftDesc: 'Grazie per aver ordinato al tavolo! Se hai inserito la tua email, riceverai il tuo Coupon Sconto del 10% per il tuo prossimo ordine a domicilio su flowerpowerpizza.com.',
    summaryPill: 'Totale Conto al Tavolo (-5% applicato):',
    finishBtn: 'Torna al Menu / Nuovo Ordine'
  },
  EN: {
    modalTitle: 'Send Table Order',
    privilegeBadge: '-5% TABLE DISCOUNT',
    tableSection: '1. Table Location',
    customTableBtn: 'Free text input',
    listTableBtn: 'Select from list',
    customPlaceholder: 'e.g. Table 7 / Terrace / Counter',
    clientSection: '2. Guest Details (10% Delivery Voucher)',
    nameLabel: 'Name / Nickname',
    namePlaceholder: 'e.g. John',
    emailLabel: 'Email (Optional - Get 10% Voucher)',
    emailPlaceholder: 'youremail@example.com',
    emailNotice: 'Email is not required. If you enter it, you will immediately receive a 10% discount coupon by email, valid for 10 days, for your next takeout or home delivery order on our website.',
    notesLabel: 'Special Kitchen / Server Notes (Optional)',
    notesPlaceholder: 'e.g. Serve pizzas together, extra glasses...',
    payAtCounterTitle: 'Pay at Counter',
    payAtCounterDesc: 'The bill can be conveniently settled at the counter at the end of your meal.',
    payAtCounterBadge: 'AT COUNTER',
    subtotalLabel: 'Products Total',
    discountLabel: 'Dining Privilege (-5%)',
    finalTotalLabel: 'Final Total Bill',
    submitBtn: 'Send Order to Counter (-5%)',
    submittingBtn: 'Sending order to counter...',
    successTitle: 'Order Sent to Counter!',
    successSubtitle: 'Your dishes and authentic pizzas are now being freshly prepared.',
    giftTitle: 'Special Delivery Gift for You!',
    giftDesc: 'Thank you for ordering at our table! If you provided your email, you will receive a 10% discount voucher for your next home delivery on flowerpowerpizza.com.',
    summaryPill: 'Table Bill Total (-5% applied):',
    finishBtn: 'Back to Menu / New Order'
  },
  TH: {
    modalTitle: 'ส่งรายการสั่งอาหารที่โต๊ะ',
    privilegeBadge: 'รับส่วนลด 5% ที่โต๊ะ',
    tableSection: '1. โต๊ะ / จุดที่นั่ง',
    customTableBtn: 'พิมพ์ระบุเอง',
    listTableBtn: 'เลือกจากรายการ',
    customPlaceholder: 'เช่น โต๊ะ 7 / ซุ้มไม้ไผ่ / ริมระเบียง',
    clientSection: '2. ข้อมูลลูกค้า (รับคูปองส่วนลด 10% เดลิเวอรี่)',
    nameLabel: 'ชื่อผู้สั่ง',
    namePlaceholder: 'เช่น สมชาย',
    emailLabel: 'อีเมล (ไม่บังคับ - รับคูปอง 10%)',
    emailPlaceholder: 'yourname@example.com',
    emailNotice: 'อีเมลไม่ใช่ข้อมูลบังคับ หากคุณกรอกอีเมล คุณจะได้รับคูปองส่วนลด 10% ทางอีเมลทันที ใช้ได้ 10 วัน สำหรับการสั่งซื้อแบบกลับบ้านหรือจัดส่งถึงบ้านครั้งถัดไปบนเว็บไซต์ของเรา',
    notesLabel: 'หมายเหตุถึงเชฟและพนักงาน (ถ้ามี)',
    notesPlaceholder: 'เช่น เสิร์ฟพร้อมกัน, แก้วน้ำเพิ่ม...',
    payAtCounterTitle: 'ชำระที่แคชเชียร์',
    payAtCounterDesc: 'สามารถชำระบิลได้ที่แคชเชียร์เมื่อรับประทานเสร็จเรียบร้อย',
    payAtCounterBadge: 'ที่แคชเชียร์',
    subtotalLabel: 'ยอดรวมอาหาร',
    discountLabel: 'ส่วนลด Dining Privilege (-5%)',
    finalTotalLabel: 'ยอดสุทธิที่ต้องชำระ',
    submitBtn: 'ส่งออเดอร์ไปที่แคชเชียร์ (-5%)',
    submittingBtn: 'กำลังส่งออเดอร์ไปที่แคชเชียร์...',
    successTitle: 'ส่งออเดอร์ไปที่แคชเชียร์เรียบร้อยแล้ว!',
    successSubtitle: 'เชฟกำลังปรุงอาหารและอบพิซซ่าสดใหม่ให้คุณ',
    giftTitle: 'ของขวัญพิเศษสำหรับคุณ!',
    giftDesc: 'ขอบคุณที่สั่งอาหารที่โต๊ะ! หากคุณระบุอีเมล คุณจะได้รับคูปองส่วนลด 10% สำหรับสั่งเดลิเวอรี่ส่งถึงบ้านผ่าน flowerpowerpizza.com',
    summaryPill: 'ยอดรวมบิลที่โต๊ะ (ลด 5% แล้ว):',
    finishBtn: 'กลับสู่เมนู / สั่งเพิ่ม'
  },
  DE: {
    modalTitle: 'Bestellung an den Tisch senden',
    privilegeBadge: '-5% TISCH-RABATT',
    tableSection: '1. Tisch-Position',
    customTableBtn: 'Freie Eingabe',
    listTableBtn: 'Aus Liste wählen',
    customPlaceholder: 'z.B. Tisch 7 / Terrasse / Bar',
    clientSection: '2. Gästeinformation (10% Liefergutschein)',
    nameLabel: 'Name / Notiz',
    namePlaceholder: 'z.B. Thomas',
    emailLabel: 'E-Mail (Optional - 10% Gutschein erhalten)',
    emailPlaceholder: 'ihre.email@beispiel.de',
    emailNotice: 'Die E-Mail-Adresse ist nicht verpflichtend. Wenn du sie eingibst, erhältst du sofort per E-Mail einen 10% Rabattgutschein, gültig für 10 Tage, für deine nächste Bestellung zum Mitnehmen oder zur Lieferung nach Hause auf unserer Website.',
    notesLabel: 'Sonderwünsche an Küche / Service (Optional)',
    notesPlaceholder: 'z.B. Pizzen zusammen servieren, extra Gläser...',
    payAtCounterTitle: 'Rechnung an der Kasse',
    payAtCounterDesc: 'Die Rechnung wird bequem an der Kasse am Ende des Verzehrs beglichen.',
    payAtCounterBadge: 'AN DER KASSE',
    subtotalLabel: 'Zwischensumme',
    discountLabel: 'Tisch-Rabatt (-5%)',
    finalTotalLabel: 'Gesamtsumme',
    submitBtn: 'Bestellung an die Kasse senden (-5%)',
    submittingBtn: 'Bestellung wird an die Kasse gesendet...',
    successTitle: 'Bestellung an die Kasse gesendet!',
    successSubtitle: 'Ihre Gerichte und frischen Pizzen werden jetzt frisch zubereitet.',
    giftTitle: 'Liefer-Gutschein für Sie!',
    giftDesc: 'Vielen Dank für Ihre Tischbestellung! Wenn Sie Ihre E-Mail angegeben haben, erhalten Sie einen 10% Rabattgutschein für flowerpowerpizza.com.',
    summaryPill: 'Endbetrag am Tisch (-5% angewendet):',
    finishBtn: 'Zurück zur Speisekarte'
  },
  MM: {
    modalTitle: 'စားပွဲမှ အော်ဒါပေးပို့မည်',
    privilegeBadge: '-၅% စားပွဲလျှော့စျေး',
    tableSection: '၁။ စားပွဲနေရာ',
    customTableBtn: 'နေရာအမည်ရိုက်ထည့်ရန်',
    listTableBtn: 'စာရင်းမှ ရွေးချယ်ရန်',
    customPlaceholder: 'ဥပမာ - စားပွဲ ၇ / လသာဆောင် / ကောင်တာ',
    clientSection: '၂။ ဧည့်သည် အချက်အလက် (၁၀% လျှော့စျေးကူပွန်)',
    nameLabel: 'အမည်',
    namePlaceholder: 'ဥပမာ - မောင်မောင်',
    emailLabel: 'အီးမေးလ် (စိတ်ကြိုက် - ၁၀% ကူပွန်ရယူရန်)',
    emailPlaceholder: 'youremail@example.com',
    emailNotice: 'အီးမေးလ်သည် မဖြစ်မနေ ထည့်သွင်းရန် မလိုအပ်ပါ။ သင်ထည့်သွင်းပါက ကျွန်ုပ်တို့၏ ဝဘ်ဆိုက်တွင် နောက်တစ်ကြိမ် အပြင်ယူရန် သို့မဟုတ် အိမ်အရောက်ပို့ဆောင်ရန် မှာယူမှုအတွက် ၁၀ ရာခိုင်နှုန်း လျှော့စျေး ကူပွန်ကို ၁၀ ရက်အထိ အသုံးပြုနိုင်သည့် သက်တမ်းဖြင့် အီးမေးလ်မှတစ်ဆင့် ချက်ချင်း လက်ခံရရှိမည်ဖြစ်သည်။',
    notesLabel: 'မီးဖိုချောင်နှင့် စားပွဲထိုးအတွက် အထူးမှာကြားချက် (စိတ်ကြိုက်)',
    notesPlaceholder: 'ဥပမာ - ပီဇာများကို တစ်ပြိုင်နက် ချပေးပါ၊ ဖန်ခွက်အပို...',
    payAtCounterTitle: 'ငွေရှင်းကောင်တာတွင် ငွေရှင်းရန်',
    payAtCounterDesc: 'အစားအသောက် ပြီးဆုံးချိန်တွင် ငွေရှင်းကောင်တာ၌ အဆင်ပြေစွာ ငွေရှင်းနိုင်ပါသည်။',
    payAtCounterBadge: 'ကောင်တာ၌',
    subtotalLabel: 'စုစုပေါင်း ပမာဏ',
    discountLabel: 'စားပွဲ အထူးလျှော့စျေး (-၅%)',
    finalTotalLabel: 'ကျသင့်ငွေ စုစုပေါင်း',
    submitBtn: 'ငွေရှင်းကောင်တာသို့ အော်ဒါပို့ရန် (-၅%)',
    submittingBtn: 'ငွေရှင်းကောင်တာသို့ အော်ဒါပို့နေပါသည်...',
    successTitle: 'ငွေရှင်းကောင်တာသို့ အော်ဒါ အောင်မြင်စွာ ပို့ပြီးပါပြီ။',
    successSubtitle: 'စားဖိုမှူးမှ သင်၏ ဟင်းလျာနှင့် ပီဇာများကို လတ်ဆတ်စွာ ပြင်ဆင်ပေးနေပါသည်။',
    giftTitle: 'သင့်အတွက် အထူးလက်ဆောင် ကူပွန်!',
    giftDesc: 'စားပွဲ၌ မှာယူအားပေးမှုအတွက် ကျေးဇူးတင်ပါသည်! အီးမေးလ် ထည့်သွင်းထားပါက flowerpowerpizza.com တွင် အိမ်အရောက်ပို့အတွက် ၁၀% လျှော့စျေးကူပွန် ရရှိပါမည်။',
    summaryPill: 'စားပွဲကျသင့်ငွေ (၅% လျှော့စျေးပြီး):',
    finishBtn: 'မီနူးသို့ ပြန်သွားမည် / ထပ်မံမှာယူမည်'
  },
  ES: {
    modalTitle: 'Enviar Pedido de la Mesa',
    privilegeBadge: '-5% DESCUENTO EN MESA',
    tableSection: '1. Ubicación de la Mesa',
    customTableBtn: 'Entrada manual',
    listTableBtn: 'Elegir de la lista',
    customPlaceholder: 'ej. Mesa 7 / Terraza / Barra',
    clientSection: '2. Datos del Cliente (Cupón 10% Delivery)',
    nameLabel: 'Nombre / Referencia',
    namePlaceholder: 'ej. Carlos',
    emailLabel: 'Email (Opcional - Recibe Cupón 10%)',
    emailPlaceholder: 'tucorreo@ejemplo.com',
    emailNotice: 'El correo electrónico no es obligatorio. Si lo introduces, recibirás de inmediato por correo electrónico un cupón de descuento del 10% válido durante 10 días para tu próximo pedido para llevar o entrega a domicilio en nuestro sitio web.',
    notesLabel: 'Notas Especiales para Cocina / Camareros (Opcional)',
    notesPlaceholder: 'ej. Servir las pizzas juntas, vasos extra...',
    payAtCounterTitle: 'Cuenta en Caja',
    payAtCounterDesc: 'La cuenta se abonará cómodamente en caja al terminar su consumición.',
    payAtCounterBadge: 'EN CAJA',
    subtotalLabel: 'Total Productos',
    discountLabel: 'Descuento en Mesa (-5%)',
    finalTotalLabel: 'Total Cuenta Final',
    submitBtn: 'Enviar Pedido a Caja (-5%)',
    submittingBtn: 'Enviando pedido a caja...',
    successTitle: '¡Comanda Enviada a Caja!',
    successSubtitle: 'Tus platos y pizzas se están preparando al momento.',
    giftTitle: '¡Regalo Especial Delivery para Ti!',
    giftDesc: '¡Gracias por pedir en mesa! Si has indicado tu email, recibirás tu cupón de descuento del 10% para tu próximo pedido a domicilio en flowerpowerpizza.com.',
    summaryPill: 'Total Cuenta en Mesa (-5% aplicado):',
    finishBtn: 'Volver a la Carta / Nuevo Pedido'
  },
  FR: {
    modalTitle: 'Envoyer la Commande de Table',
    privilegeBadge: '-5% DE RÉDUCTION À TABLE',
    tableSection: '1. Emplacement de la Table',
    customTableBtn: 'Saisie libre',
    listTableBtn: 'Choisir dans la liste',
    customPlaceholder: 'ex. Table 7 / Terrasse / Comptoir',
    clientSection: '2. Coordonnées Client (Coupon 10% Livraison)',
    nameLabel: 'Nom / Référence',
    namePlaceholder: 'ex. Jean',
    emailLabel: 'Email (Optionnel - Recevez -10%)',
    emailPlaceholder: 'votre.email@exemple.com',
    emailNotice: "L'email n'est pas obligatoire. Si vous la saisissez, vous recevrez immédiatement par email un coupon de réduction de 10 % valable 10 jours pour votre prochaine commande à emporter ou en livraison sur notre site web.",
    notesLabel: 'Notes Spéciales pour la Cuisine (Optionnel)',
    notesPlaceholder: 'ex. Servir les pizzas ensemble, verres en plus...',
    payAtCounterTitle: 'Addition au Comptoir',
    payAtCounterDesc: "L'addition se règle facilement au comptoir à la fin de votre repas.",
    payAtCounterBadge: 'AU COMPTOIR',
    subtotalLabel: 'Total Produits',
    discountLabel: 'Privilège Restaurant (-5%)',
    finalTotalLabel: 'Total Addition Finale',
    submitBtn: 'Envoyer la Commande au Comptoir (-5%)',
    submittingBtn: 'Envoi de la commande en cours...',
    successTitle: 'Commande Envoyée au Comptoir !',
    successSubtitle: 'Vos plats et pizzas sont fraîchement préparés en cuisine.',
    giftTitle: 'Cadeau Spécial Livraison pour Vous !',
    giftDesc: 'Merci pour votre commande à table ! Si vous avez renseigné votre email, vous recevrez un bon de 10 % de réduction pour votre prochaine livraison sur flowerpowerpizza.com.',
    summaryPill: 'Total Addition à Table (-5% appliqué) :',
    finishBtn: 'Retour au Menu / Nouvelle Commande'
  },
  RU: {
    modalTitle: 'Отправить заказ со стола',
    privilegeBadge: '-5% СКИДКА НА СТОЛ',
    tableSection: '1. Номер / Расположение стола',
    customTableBtn: 'Ввести вручную',
    listTableBtn: 'Выбрать из списка',
    customPlaceholder: 'напр. Стол 7 / Терраса / Бар',
    clientSection: '2. Данные гостя (Купон 10% на доставку)',
    nameLabel: 'Имя / Контакт',
    namePlaceholder: 'напр. Александр',
    emailLabel: 'Эл. почта (Необязательно - Купон 10%)',
    emailPlaceholder: 'youremail@example.com',
    emailNotice: 'Электронная почта не обязательна. Если вы её укажете, вы сразу получите по электронной почте купон на скидку 10%, действительный в течение 10 дней, на ваш следующий заказ на вынос или доставку на дом на нашем сайте.',
    notesLabel: 'Пожелания для кухни / персонала (Опционально)',
    notesPlaceholder: 'напр. Подать пиццы одновременно, доп. стаканы...',
    payAtCounterTitle: 'Оплата на кассе',
    payAtCounterDesc: 'Счёт можно удобно оплатить на кассе по завершении вашего визита.',
    payAtCounterBadge: 'НА КАССЕ',
    subtotalLabel: 'Сумма заказа',
    discountLabel: 'Скидка на стол (-5%)',
    finalTotalLabel: 'Итого к оплате',
    submitBtn: 'Отправить заказ на кассу (-5%)',
    submittingBtn: 'Отправка заказа на кассу...',
    successTitle: 'Заказ успешно отправлен на кассу!',
    successSubtitle: 'Ваши блюда и свежая пицца уже готовятся шеф-поваром.',
    giftTitle: 'Специальный подарок для вас!',
    giftDesc: 'Спасибо за заказ за столом! Если вы указали email, вы получите купон на скидку 10% для следующего заказа на дом на flowerpowerpizza.com.',
    summaryPill: 'Итоговый чек со стола (со скидкой 5%):',
    finishBtn: 'Вернуться в меню / Дозаказать'
  },
  ZH: {
    modalTitle: '提交餐桌订单',
    privilegeBadge: '享餐桌专属 95 折 (-5%)',
    tableSection: '1. 餐桌位置',
    customTableBtn: '手动输入',
    listTableBtn: '从列表选择',
    customPlaceholder: '例如：7号桌 / 露台 / 吧台',
    clientSection: '2. 顾客信息（送外卖专属 10% 折扣券）',
    nameLabel: '姓名 / 昵称',
    namePlaceholder: '例如：李雷',
    emailLabel: '电子邮箱（选填 - 立即获赠 10% 优惠券）',
    emailPlaceholder: 'youremail@example.com',
    emailNotice: '电子邮件不是必填项。如果您填写，将立即通过电子邮件收到一张10%折扣优惠券，有效期10天，可用于您下次在我们网站上的外卖自取或配送上门订单。',
    notesLabel: '给后厨和服务的备注（选填）',
    notesPlaceholder: '例如：披萨一起上，多要水杯...',
    payAtCounterTitle: '前台收银台结账',
    payAtCounterDesc: '用餐完毕后，您可以直接前往前台收银台结账。',
    payAtCounterBadge: '前台结账',
    subtotalLabel: '菜品总额',
    discountLabel: '餐桌特惠 (-5%)',
    finalTotalLabel: '应付总金额',
    submitBtn: '提交订单至前台 (-5%)',
    submittingBtn: '正在提交订单至前台...',
    successTitle: '订单已成功发送至前台！',
    successSubtitle: '大厨正在为您新鲜烘烤披萨与精致料理。',
    giftTitle: '送给您的外卖专属礼遇！',
    giftDesc: '感谢您在店内用餐！若您留下了电子邮箱，我们将向您发送一张用于下次外卖点餐的 10% 折扣优惠券。',
    summaryPill: '餐桌账单总额（已享 95 折）：',
    finishBtn: '返回菜单 / 加点菜品'
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
  // 5% Dining Tablet Discount
  const discountRate = 0.05;
  const discountAmount = Math.round(rawSubtotal * discountRate);
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

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
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.discountLabel}:</span>
                  </span>
                  <span>- {discountAmount} ฿</span>
                </div>
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
