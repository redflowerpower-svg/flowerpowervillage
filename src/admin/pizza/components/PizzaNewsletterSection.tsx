import React, { useState, useEffect, useMemo } from 'react';
import {
  Send,
  Mail,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  CheckSquare,
  Square,
  Globe,
  Tag,
  FlaskConical,
  Pizza,
  Wine,
  Sparkles,
  DollarSign,
  Phone,
  Eye,
  X,
  Gift,
  Clock,
  History,
  Languages,
  Wand2,
  Zap,
  Check,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  UtensilsCrossed,
  Trash2,
  Plus,
  RotateCcw,
  Calendar,
  Sliders,
  Timer,
  Settings,
  BellRing,
  Sparkle
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { extractOrderMetadata } from '../../../pizza/utils/orderMetadata';
import { Language } from '../../../pizza/config/languages';

export interface PizzaCustomerRecord {
  email: string;
  name: string;
  phone: string;
  lang: Language;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  lastAddress: string;
  notes: string;
  isTest?: boolean;
  diningVoucher?: string;
  voucherDate?: string;
  voucherExpiresAt?: string;
  isDiningVoucherActive?: boolean;
  tableStation?: string;
}

export interface PizzaCampaignHistoryEntry {
  id: string;
  timestamp: string;
  subject: string;
  senderAccount: string;
  count: number;
  type: 'manual_broadcast' | 'dining_automated_voucher' | 'scheduled_trigger';
  targetLang?: string;
  recipients: { name: string; email: string; lang?: string; voucherCode?: string }[];
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  triggerEvent: 'dining_order' | 'website_order' | 'vip_achieved' | 'voucher_reminder_7d' | 'inactive_customer_15d';
  delayType: 'instant' | 'hours' | 'days';
  delayValue: number;
  templateId: string;
  isEnabled: boolean;
  totalTriggered: number;
  lastTriggeredAt?: string;
}

const ALL_SUPPORTED_LANGS: { code: Language; label: string; flag: string }[] = [
  { code: 'IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'EN', label: 'English', flag: '🇬🇧' },
  { code: 'TH', label: 'ไทย', flag: '🇹🇭' },
  { code: 'MM', label: 'မြန်မာ', flag: '🇲🇲' },
  { code: 'DE', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ES', label: 'Español', flag: '🇪🇸' },
  { code: 'FR', label: 'Français', flag: '🇫🇷' },
  { code: 'RU', label: 'Русский', flag: '🇷🇺' },
  { code: 'ZH', label: '中文', flag: '🇨🇳' }
];

const TEST_PIZZA_RECIPIENTS: PizzaCustomerRecord[] = [
  {
    email: 'redflowerpower@gmail.com',
    name: 'Marco (Admin Test 1)',
    phone: '+66958825573',
    lang: 'IT',
    ordersCount: 99,
    totalSpent: 12500,
    lastOrderDate: new Date().toISOString(),
    lastAddress: 'Ranong Main Hub [TEST]',
    notes: 'Contatto di collaudo principale',
    isTest: true,
    diningVoucher: 'DINE10-ADMIN1',
    voucherDate: new Date().toISOString(),
    voucherExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    isDiningVoucherActive: true,
    tableStation: 'Tavolo 1 (Interno)'
  },
  {
    email: 'redflowerpower@hotmail.it',
    name: 'Marco (Admin Test 2)',
    phone: '+66964365296',
    lang: 'EN',
    ordersCount: 50,
    totalSpent: 8900,
    lastOrderDate: new Date().toISOString(),
    lastAddress: 'Ranong Second Hub [TEST]',
    notes: 'Contatto di collaudo secondario',
    isTest: true,
    diningVoucher: 'DINE10-ADMIN2',
    voucherDate: new Date().toISOString(),
    voucherExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    isDiningVoucherActive: true,
    tableStation: 'Tavolo 2 (Interno)'
  },
  {
    email: 'simona.gnani@gmail.com',
    name: 'Simona (Staff Test)',
    phone: '+66979345393',
    lang: 'IT',
    ordersCount: 30,
    totalSpent: 4500,
    lastOrderDate: new Date().toISOString(),
    lastAddress: 'Ranong Staff [TEST]',
    notes: 'Staff Quality Check',
    isTest: true
  },
  {
    email: 'kitsuraporn@gmail.com',
    name: 'Kit Suraporn (Staff TH)',
    phone: '+66812345678',
    lang: 'TH',
    ordersCount: 20,
    totalSpent: 3200,
    lastOrderDate: new Date().toISOString(),
    lastAddress: 'Ranong Local Team [TEST]',
    notes: 'Thai Operations Coordinator',
    isTest: true
  }
];

const DEFAULT_PRESETS_9LANGS: Record<string, {
  id: string;
  name: string;
  iconName: 'gift' | 'pizza' | 'sparkles' | 'wine' | 'globe';
  translations: Record<Language, { subject: string; message: string }>;
}> = {
  dining_voucher_welcome: {
    id: 'dining_voucher_welcome',
    name: '🏷️ Voucher Dining 10% Delivery',
    iconName: 'gift',
    translations: {
      IT: {
        subject: '🎁 Il tuo Sconto 10% Flower Power Pizza Ranong per Ordini Online!',
        message: 'Gentile {name},\n\nGrazie per essere stato nostro gradito ospite al tavolo!\n\nEcco il tuo speciale buono sconto del 10% valido per 10 giorni per il tuo prossimo ordine da asporto o consegna a domicilio sul nostro sito web:\n\n👉 Ordina subito con sconto applicato con 1 click:\nhttps://flowerpowerpizza.com\n\nOppure inserisci il tuo codice promozionale personale al checkout.\n\nA presto!\nFlower Power Pizza & Wine Ranong'
      },
      EN: {
        subject: '🎁 Your 10% Discount at Flower Power Pizza Ranong for Online Orders!',
        message: 'Dear {name},\n\nThank you for being our valued guest at the table!\n\nHere is your special 10% discount voucher, valid for 10 days, for your next takeaway or delivery order on our website:\n\n👉 Order now with the discount applied in 1 click:\nhttps://flowerpowerpizza.com\n\nOr enter your personal promo code at checkout.\n\nSee you soon!\nFlower Power Pizza & Wine Ranong'
      },
      TH: {
        subject: '🎁 รับส่วนลด 10% จาก Flower Power Pizza Ranong สำหรับสั่งออนไลน์!',
        message: 'เรียนคุณ {name},\n\nขอบคุณที่มาเป็นแขกคนสำคัญของเราที่โต๊ะอาหาร!\n\nนี่คือบัตรส่วนลดพิเศษ 10% ของคุณ ใช้ได้ 10 วัน สำหรับการสั่งกลับบ้านหรือสั่งเดลิเวอรีครั้งถัดไปบนเว็บไซต์ของเรา:\n\n👉 สั่งเลยตอนนี้ รับส่วนลดทันทีใน 1 คลิก:\nhttps://flowerpowerpizza.com\n\nหรือกรอกโค้ดโปรโมชั่นส่วนตัวของคุณตอนชำระเงิน\n\nแล้วพบกันใหม่!\nFlower Power Pizza & Wine Ranong'
      },
      MM: {
        subject: '🎁 အွန်လိုင်းမှာမှာယူရင် Flower Power Pizza Ranong မှာ 10% လျှော့စျေး ရယူလိုက်ပါ!',
        message: 'ချစ်ခင်ရသော {name} ခင်ဗျာ၊\n\nကျွန်တော်တို့ရဲ့ စားပွဲမှာ တန်ဖိုးထားတဲ့ ဧည့်သည်အဖြစ် လာရောက်ပေးတဲ့အတွက် ကျေးဇူးတင်ပါတယ်!\n\nဒါက သင့်ရဲ့ အထူး 10% လျှော့စျေး ဗောက်ချာပါ၊ 10 ရက်အထိ သက်တမ်းရှိပြီး ကျွန်တော်တို့ရဲ့ ဝဘ်ဆိုက်မှာ နောက်တစ်ကြိမ် ပါဆယ်ယူ သို့မဟုတ် အိမ်အရောက်ပို့ မှာယူမှုအတွက် အသုံးပြုနိုင်ပါတယ်:\n\n👉 အခုပဲ 1 ချက်နှိပ်ပြီး လျှော့စျေးနဲ့ မှာယူလိုက်ပါ:\nhttps://flowerpowerpizza.com\n\nဒါမှမဟုတ် ငွေရှင်းတဲ့အခါ သင့်ကိုယ်ပိုင် ပရိုမိုကုဒ်ကို ထည့်ပါ။\n\nမကြာမီ တွေ့ကြပါစို့!\nFlower Power Pizza & Wine Ranong'
      },
      DE: {
        subject: '🎁 Dein 10% Rabatt bei Flower Power Pizza Ranong für Online-Bestellungen!',
        message: 'Liebe/r {name},\n\nvielen Dank, dass du unser geschätzter Gast am Tisch warst!\n\nHier ist dein spezieller 10% Rabattgutschein, gültig für 10 Tage, für deine nächste Bestellung zum Mitnehmen oder Liefern auf unserer Website:\n\n👉 Bestelle jetzt mit Rabatt in 1 Klick:\nhttps://flowerpowerpizza.com\n\nOder gib deinen persönlichen Promo-Code an der Kasse ein.\n\nBis bald!\nFlower Power Pizza & Wine Ranong'
      },
      ES: {
        subject: '🎁 ¡Tu descuento del 10% en Flower Power Pizza Ranong para pedidos online!',
        message: 'Estimado/a {name}:\n\n¡Gracias por ser nuestro apreciado invitado en la mesa!\n\nAquí tienes tu cupón de descuento especial del 10%, válido durante 10 días, para tu próximo pedido para llevar o a domicilio en nuestra web:\n\n👉 Pide ahora con el descuento aplicado en 1 clic:\nhttps://flowerpowerpizza.com\n\nO introduce tu código promocional personal en el checkout.\n\n¡Hasta pronto!\nFlower Power Pizza & Wine Ranong'
      },
      FR: {
        subject: '🎁 Votre réduction de 10% chez Flower Power Pizza Ranong pour les commandes en ligne !',
        message: "Cher/Chère {name},\n\nMerci d'avoir été notre invité apprécié à table !\n\nVoici votre bon de réduction spécial de 10%, valable 10 jours, pour votre prochaine commande à emporter ou en livraison sur notre site web :\n\n👉 Commandez maintenant avec la réduction appliquée en 1 clic :\nhttps://flowerpowerpizza.com\n\nOu saisissez votre code promo personnel au moment du paiement.\n\nÀ bientôt !\nFlower Power Pizza & Wine Ranong"
      },
      RU: {
        subject: '🎁 Ваша скидка 10% в Flower Power Pizza Ranong на онлайн-заказы!',
        message: 'Уважаемый(ая) {name},\n\nСпасибо, что были нашим дорогим гостем за столом!\n\nВот ваш специальный купон на скидку 10%, действующий 10 дней, на следующий заказ на вынос или доставку на нашем сайте:\n\n👉 Закажите сейчас со скидкой в 1 клик:\nhttps://flowerpowerpizza.com\n\nИли введите свой персональный промокод при оформлении заказа.\n\nДо скорой встречи!\nFlower Power Pizza & Wine Ranong'
      },
      ZH: {
        subject: '🎁 您在 Flower Power Pizza Ranong 在线订餐可享 10% 折扣！',
        message: '尊敬的 {name}：\n\n感谢您光临本店用餐！\n\n这是您的专属 10% 折扣券，有效期 10 天，可用于您下次在我们网站上的外带或外卖订单：\n\n👉 立即一键下单，自动享受折扣：\nhttps://flowerpowerpizza.com\n\n或在结账时输入您的个人优惠码。\n\n期待很快再见！\nFlower Power Pizza & Wine Ranong'
      }
    }
  },
  weekend_promo: {
    id: 'weekend_promo',
    name: '🍕 Promo Weekend & Famiglia',
    iconName: 'pizza',
    translations: {
      IT: {
        subject: '🍕 Weekend Special: Sconto 10% sulle Pizze & Consegna Gratuita a Ranong!',
        message: 'Ciao {name}!\n\nQuesto fine settimana regalati il vero sapore della pizza italiana a legna a Ranong.\n\n🔥 Ordina almeno 2 pizze e ricevi subito:\n- 10% di sconto sul totale\n- Consegna a domicilio rapida con i nostri rider dedicati\n\nVisita il nostro sito https://flowerpowerpizza.com o contattaci direttamente per prenotare la tua consegna calda e fragrante.\n\nA presto!\nFlower Power Pizza Ranong Team'
      },
      EN: {
        subject: '🍕 Weekend Special: 10% Off Pizzas & Free Delivery in Ranong!',
        message: 'Hi {name}!\n\nThis weekend, treat yourself to the true taste of Italian wood-fired pizza in Ranong.\n\n🔥 Order at least 2 pizzas and get instantly:\n- 10% off your total\n- Fast home delivery with our dedicated riders\n\nVisit our website https://flowerpowerpizza.com or contact us directly to book your hot, fresh delivery.\n\nSee you soon!\nFlower Power Pizza Ranong Team'
      },
      TH: {
        subject: '🍕 โปรสุดสัปดาห์: ลด 10% พิซซ่า & ส่งฟรีในระนอง!',
        message: 'สวัสดี {name}!\n\nสุดสัปดาห์นี้ เอาใจตัวเองด้วยรสชาติที่แท้จริงของพิซซ่าเตาถ่านอิตาเลียนในระนอง\n\n🔥 สั่งพิซซ่าขั้นต่ำ 2 ถาด รับทันที:\n- ลด 10% จากยอดรวม\n- จัดส่งถึงบ้านรวดเร็วโดยไรเดอร์ของเรา\n\nเยี่ยมชมเว็บไซต์ของเรา https://flowerpowerpizza.com หรือติดต่อเราโดยตรงเพื่อจองการจัดส่งที่ร้อนและสดใหม่\n\nแล้วพบกัน!\nทีม Flower Power Pizza ระนอง'
      },
      MM: {
        subject: '🍕 အားလပ်ရက် အထူးကမ်းလှမ်းချက်- ပီဇာများ ၁၀% လျှော့စျေး & ရနောင်းတွင် အခမဲ့ ပို့ဆောင်ခြင်း!',
        message: 'မင်္ဂလာပါ {name}!\n\nဒီအားလပ်ရက်မှာ ရနောင်းမြို့မှာ အီတလီမီးဖိုပီဇာရဲ့ အရသာစစ်စစ်ကို ခံစားလိုက်ပါ။\n\n🔥 ပီဇာ အနည်းဆုံး ၂ ခု မှာယူပါ၊ ချက်ချင်းရရှိမည်-\n- စုစုပေါင်းပေါ်တွင် ၁၀% လျှော့စျေး\n- ကျွန်ုပ်တို့၏ သီးသန့် ရိုက်ဒါများဖြင့် အမြန်အိမ်အရောက်ပို့ဆောင်ခြင်း\n\nကျွန်ုပ်တို့၏ ဝဘ်ဆိုဒ် https://flowerpowerpizza.com ကို ဝင်ရောက်ကြည့်ရှုပါ သို့မဟုတ် သင့်ပူနွေးလတ်ဆတ်သော ပို့ဆောင်မှုကို ကြိုတင်မှာယူရန် ကျွန်ုပ်တို့ကို တိုက်ရိုက်ဆက်သွယ်ပါ။\n\nမကြာမီတွေ့မယ်!\nFlower Power Pizza ရနောင်း အဖွဲ့'
      },
      DE: {
        subject: '🍕 Wochenend-Special: 10% Rabatt auf Pizzen & kostenlose Lieferung in Ranong!',
        message: 'Hallo {name}!\n\nGönn dir dieses Wochenende den echten Geschmack italienischer Holzofenpizza in Ranong.\n\n🔥 Bestelle mindestens 2 Pizzen und erhalte sofort:\n- 10% Rabatt auf deine Gesamtsumme\n- Schnelle Lieferung nach Hause mit unseren engagierten Fahrern\n\nBesuche unsere Website https://flowerpowerpizza.com oder kontaktiere uns direkt, um deine heiße, frische Lieferung zu buchen.\n\nBis bald!\nFlower Power Pizza Ranong Team'
      },
      ES: {
        subject: '🍕 Especial de fin de semana: ¡10% de descuento en pizzas y entrega gratis en Ranong!',
        message: '¡Hola {name}!\n\nEste fin de semana, date el gusto de probar el auténtico sabor de la pizza italiana al horno de leña en Ranong.\n\n🔥 Pide al menos 2 pizzas y recibe al instante:\n- 10% de descuento en tu total\n- Entrega rápida a domicilio con nuestros repartidores dedicados\n\nVisita nuestro sitio web https://flowerpowerpizza.com o contáctanos directamente para reservar tu entrega caliente y fresca.\n\n¡Hasta pronto!\nEquipo de Flower Power Pizza Ranong'
      },
      FR: {
        subject: '🍕 Spécial week-end : 10 % de réduction sur les pizzas et livraison gratuite à Ranong !',
        message: "Bonjour {name} !\n\nCe week-end, offrez-vous le vrai goût de la pizza italienne au feu de bois à Ranong.\n\n🔥 Commandez au moins 2 pizzas et recevez immédiatement :\n- 10 % de réduction sur votre total\n- Livraison rapide à domicile avec nos livreurs dédiés\n\nVisitez notre site web https://flowerpowerpizza.com ou contactez-nous directement pour réserver votre livraison chaude et fraîche.\n\nÀ bientôt !\nL'équipe Flower Power Pizza Ranong"
      },
      RU: {
        subject: '🍕 Специальное предложение на выходные: скидка 10% на пиццу и бесплатная доставка в Ранонге!',
        message: 'Привет, {name}!\n\nВ эти выходные побаллуйте себя настоящим вкусом итальянской пиццы на дровах в Ранонге.\n\n🔥 Закажите минимум 2 пиццы и получите сразу:\n- скидку 10% на общую сумму\n- быструю доставку на дом нашими преданными курьерами\n\nПосетите наш сайт https://flowerpowerpizza.com или свяжитесь с нами напрямую, чтобы заказать горячую и свежую доставку.\n\nДо скорого!\nКоманда Flower Power Pizza Ranong'
      },
      ZH: {
        subject: '🍕 周末特惠：披萨 10% 折扣 & 拉廊免费配送！',
        message: '你好 {name}！\n\n这个周末，在拉廊尽情享受正宗意大利木火烤披萨的美味吧。\n\n🔥 订购至少 2 个披萨，立即享受：\n- 总价 10% 折扣\n- 由我们专属骑手快速送货上门\n\n访问我们的网站 https://flowerpowerpizza.com 或直接联系我们，预订热腾腾的新鲜配送。\n\n回头见！\nFlower Power Pizza 拉廊团队'
      }
    }
  },
  new_pizza: {
    id: 'new_pizza',
    name: '🌟 Nuova Pizza del Mese',
    iconName: 'sparkles',
    translations: {
      IT: {
        subject: '🌟 Nuova Creazione in Menu da Flower Power Pizza Ranong!',
        message: 'Gentile {name},\n\nSiamo entusiasti di presentarti la nuova pizza speciale di questa settimana, preparata con ingredienti freschissimi e lievitazione naturale di oltre 48 ore.\n\n🧀 Vieni a provarla sul nostro menu online:\n👉 https://flowerpowerpizza.com\n\nOrdina online in pochi secondi con geolocalizzazione GPS precisa e pagamento sicuro con PromptPay o Carta.\n\nBuon appetito!\nFlower Power Pizza Ranong'
      },
      EN: {
        subject: '🌟 New Menu Creation at Flower Power Pizza Ranong!',
        message: "Dear {name},\n\nWe're thrilled to introduce this week's new special pizza, made with the freshest ingredients and naturally leavened for over 48 hours.\n\n🧀 Come try it on our online menu:\n👉 https://flowerpowerpizza.com\n\nOrder online in seconds with precise GPS geolocation and secure payment via PromptPay or Card.\n\nEnjoy your meal!\nFlower Power Pizza Ranong"
      },
      TH: {
        subject: '🌟 สร้างสรรค์เมนูใหม่ที่ Flower Power Pizza Ranong!',
        message: 'เรียนคุณ {name},\n\nเราตื่นเต้นที่จะแนะนำพิซซ่าพิเศษใหม่ประจำสัปดาห์นี้ ปรุงด้วยวัตถุดิบสดใหม่ที่สุดและหมักตามธรรมชาติกว่า 48 ชั่วโมง\n\n🧀 แวะมาลิ้มลองได้ในเมนูออนไลน์ของเรา:\n👉 https://flowerpowerpizza.com\n\nสั่งออนไลน์ได้ในไม่กี่วินาทีด้วยระบบระบุตำแหน่ง GPS ที่แม่นยำ และชำระเงินปลอดภัยผ่าน PromptPay หรือบัตร\n\nทานให้อร่อยนะคะ/ครับ!\nFlower Power Pizza Ranong'
      },
      MM: {
        subject: '🌟 Flower Power Pizza Ranong တွင် မီနူးအသစ် ဖန်တီးလိုက်ပါပြီ!',
        message: 'ချစ်ခင်ရသော {name} ရေ၊\n\nဒီအပတ်ရဲ့ အထူးပီဇာအသစ်ကို မိတ်ဆက်ပေးရတာ ဝမ်းသာပါတယ်။ လတ်ဆတ်ဆုံး ပါဝင်ပစ္စည်းများနဲ့ သဘာဝအတိုင်း ၄၈ နာရီကျော် ဖောင်းပွအောင် ပြုလုပ်ထားပါတယ်။\n\n🧀 ကျွန်တော်တို့ရဲ့ အွန်လိုင်းမီနူးမှာ လာစမ်းကြည့်ပါ:\n👉 https://flowerpowerpizza.com\n\nတိကျတဲ့ GPS တည်နေရာနဲ့ စက္ကန့်ပိုင်းအတွင်း အွန်လိုင်းမှာ မှာယူနိုင်ပြီး PromptPay သို့မဟုတ် ကတ်နဲ့ လုံခြုံစွာ ငွေပေးချေနိုင်ပါတယ်။\n\nစားသုံးရတာ အရသာရှိပါစေ!\nFlower Power Pizza Ranong'
      },
      DE: {
        subject: '🌟 Neue Menükreation bei Flower Power Pizza Ranong!',
        message: 'Liebe/r {name},\n\nwir freuen uns, dir die neue Spezialpizza dieser Woche vorzustellen – zubereitet mit frischesten Zutaten und über 48 Stunden natürlicher Teigführung.\n\n🧀 Probier sie in unserem Online-Menü:\n👉 https://flowerpowerpizza.com\n\nBestelle online in Sekunden mit präziser GPS-Geolokalisierung und sicherer Zahlung per PromptPay oder Karte.\n\nGuten Appetit!\nFlower Power Pizza Ranong'
      },
      ES: {
        subject: '🌟 ¡Nueva Creación en el Menú de Flower Power Pizza Ranong!',
        message: 'Estimado/a {name}:\n\nNos complace presentarte la nueva pizza especial de esta semana, elaborada con los ingredientes más frescos y una fermentación natural de más de 48 horas.\n\n🧀 Ven a probarla en nuestro menú online:\n👉 https://flowerpowerpizza.com\n\nPide online en segundos con geolocalización GPS precisa y pago seguro con PromptPay o Tarjeta.\n\n¡Buen provecho!\nFlower Power Pizza Ranong'
      },
      FR: {
        subject: '🌟 Nouvelle création au menu chez Flower Power Pizza Ranong !',
        message: "Cher/Chère {name},\n\nNous sommes ravis de vous présenter la nouvelle pizza spéciale de cette semaine, préparée avec des ingrédients ultra-frais et une pâte à fermentation naturelle de plus de 48 heures.\n\n🧀 Venez la découvrir sur notre menu en ligne :\n👉 https://flowerpowerpizza.com\n\nCommandez en ligne en quelques secondes avec une géolocalisation GPS précise et un paiement sécurisé via PromptPay ou Carte bancaire.\n\nBon appétit !\nFlower Power Pizza Ranong"
      },
      RU: {
        subject: '🌟 Новинка в меню Flower Power Pizza Ranong!',
        message: 'Уважаемый(ая) {name},\n\nМы рады представить новую фирменную пиццу этой недели, приготовленную из самых свежих ингредиентов на натуральной закваске с выдержкой более 48 часов.\n\n🧀 Попробуйте ее в нашем онлайн-меню:\n👉 https://flowerpowerpizza.com\n\nЗаказывайте онлайн за считанные секунды с точной GPS-геолокацией и безопасной оплатой через PromptPay или картой.\n\nПриятного аппетита!\nFlower Power Pizza Ranong'
      },
      ZH: {
        subject: '🌟 Flower Power Pizza Ranong 菜单全新力作！',
        message: '尊敬的 {name}：\n\n我们很高兴为您隆重介绍本周全新特制披萨，精选最新鲜的食材，历经 48 小时以上天然发酵精心烘焙而成。\n\n🧀 欢迎在我们的在线菜单中品尝：\n👉 https://flowerpowerpizza.com\n\n精准 GPS 定位，支持 PromptPay 或银行卡安全支付，数秒内即可完成在线订餐。\n\n祝您用餐愉快！\nFlower Power Pizza Ranong'
      }
    }
  },
  wine_selection: {
    id: 'wine_selection',
    name: '🍷 Selezione Vini & Cantina',
    iconName: 'wine',
    translations: {
      IT: {
        subject: '🍷 Nuovi Arrivi dalla Cantina Italiana a Ranong!',
        message: 'Caro {name},\n\nAbbiamo appena rinnovato la nostra selezione di vini e birre artigianali per accompagnare le tue pizze preferite.\n\nScopri i nuovi arrivi italiani (Prosecco DOC, Chianti, Pinot Grigio) disponibili per la consegna a domicilio e per la degustazione al tavolo a Ranong.\n\nSfoglia la nostra Wine Card online: https://flowerpowerpizza.com\n\nSalute!\nFlower Power Pizza & Wine Studio'
      },
      EN: {
        subject: '🍷 New Arrivals from the Italian Cellar in Ranong!',
        message: "Dear {name},\n\nWe've just updated our selection of fine wines and craft beers to pair with your favorite pizzas.\n\nDiscover the new Italian arrivals (Prosecco DOC, Chianti, Pinot Grigio) available for home delivery and table tasting in Ranong.\n\nBrowse our Wine Card online: https://flowerpowerpizza.com\n\nCheers!\nFlower Power Pizza & Wine Studio"
      },
      TH: {
        subject: '🍷 ไวน์อิตาเลียนชั้นเลิศล็อตใหม่มาถึงระนองแล้ว!',
        message: 'สวัสดีคุณ {name},\n\nเราเพิ่งอัปเดตไวน์ชั้นเลิศและคราฟต์เบียร์ที่คัดสรรมาเพื่อจับคู่กับพิซซ่าจานโปรดของคุณอย่างลงตัว\n\nค้นพบไวน์อิตาเลียนนำเข้าใหม่ (Prosecco DOC, Chianti, Pinot Grigio) พร้อมเสิร์ฟถึงบ้านและจิบคู่มื้ออาหารที่โต๊ะในระนอง\n\nดูเมนูไวน์ออนไลน์ได้ที่: https://flowerpowerpizza.com\n\nไชโย!\nFlower Power Pizza & Wine Studio'
      },
      MM: {
        subject: '🍷 ရနောင်းသို့ အီတလီဝိုင်စစ်စစ်များ အသစ်ရောက်ရှိလာပါပြီ!',
        message: 'ချစ်ခင်ရသော {name} ရေ၊\n\nသင်အကြိုက်ဆုံး ပီဇာများနှင့် တွဲဖက်သုံးဆောင်ရန် ဝိုင်ကောင်းများနှင့် လက်မှုဘီယာများကို ကျွန်ုပ်တို့ အသစ်ထပ်မံ ဖြည့်တင်းထားပါသည်။\n\nအီတလီမှ အသစ်ရောက်ရှိလာသော (Prosecco DOC, Chianti, Pinot Grigio) များကို ရနောင်းတွင် အိမ်အရောက်ပို့ သို့မဟုတ် စားပွဲ၌ သုံးဆောင်ရန် ရရှိနိုင်ပါပြီ။\n\nကျွန်ုပ်တို့၏ ဝိုင်မီနူးကို အွန်လိုင်းတွင် ကြည့်ရှုပါ: https://flowerpowerpizza.com\n\nကျန်းမာချမ်းသာပါစေ!\nFlower Power Pizza & Wine Studio'
      },
      DE: {
        subject: '🍷 Neuzugänge aus dem italienischen Weinkeller in Ranong!',
        message: 'Liebe/r {name},\n\nwir haben unsere Auswahl an erlesenen Weinen und Craft-Bieren aktualisiert – die perfekte Begleitung zu deinen Lieblingspizzen.\n\nEntdecke die neuen italienischen Weine (Prosecco DOC, Chianti, Pinot Grigio), erhältlich für die Lieferung nach Hause oder zum Genießen am Tisch in Ranong.\n\nStöbere in unserer Online-Weinkarte: https://flowerpowerpizza.com\n\nZum Wohl!\nFlower Power Pizza & Wine Studio'
      },
      ES: {
        subject: '🍷 ¡Novedades de la Bodega Italiana en Ranong!',
        message: 'Estimado/a {name}:\n\nHemos renovado nuestra selección de vinos selectos y cervezas artesanales para maridar a la perfección con tus pizzas favoritas.\n\nDescubre las nuevas incorporaciones italianas (Prosecco DOC, Chianti, Pinot Grigio) disponibles para entrega a domicilio y degustación en mesa en Ranong.\n\nConsulta nuestra Carta de Vinos online: https://flowerpowerpizza.com\n\n¡Salud!\nFlower Power Pizza & Wine Studio'
      },
      FR: {
        subject: '🍷 Nouveautés de la cave italienne à Ranong !',
        message: "Cher/Chère {name},\n\nNous venons d'enrichir notre sélection de grands vins et de bières artisanales pour accompagner idéalement vos pizzas préférées.\n\nDécouvrez nos nouvelles cuvées italiennes (Prosecco DOC, Chianti, Pinot Grigio) disponibles en livraison à domicile et en dégustation à table à Ranong.\n\nConsultez notre Carte des Vins en ligne : https://flowerpowerpizza.com\n\nSanté !\nFlower Power Pizza & Wine Studio"
      },
      RU: {
        subject: '🍷 Новинки из итальянского винного погреба в Ранонге!',
        message: 'Уважаемый(ая) {name},\n\nМы обновили наш ассортимент изысканных вин и крафтового пива, которые идеально дополнят вашу любимую пиццу.\n\nОткройте для себя новые итальянские поступления (Prosecco DOC, Chianti, Pinot Grigio), доступные для доставки на дом и дегустации в зале в Ранонге.\n\nОзнакомьтесь с нашей винной картой онлайн: https://flowerpowerpizza.com\n\nВаше здоровье!\nFlower Power Pizza & Wine Studio'
      },
      ZH: {
        subject: '🍷 来自意大利酒窖的精选美酒现已抵达拉廊！',
        message: '尊敬的 {name}：\n\n我们刚刚更新了精选葡萄酒和精酿啤酒单，为您喜爱的披萨提供绝妙搭配。\n\n探索最新引进的意大利美酒（Prosecco DOC、Chianti、Pinot Grigio），支持配送上门或在拉廊店内堂食享用。\n\n在线浏览我们的酒单：https://flowerpowerpizza.com\n\n干杯！\nFlower Power Pizza & Wine Studio'
      }
    }
  },
  thai_local: {
    id: 'thai_local',
    name: '🇹🇭 โปรโมชั่นพิเศษ (Promo Thai)',
    iconName: 'globe',
    translations: {
      IT: {
        subject: '🍕 Autentica Pizza Italiana a Legna con Consegna Rapida a Ranong!',
        message: 'Ciao {name}!\n\nFlower Power Pizza Ranong offre una promozione speciale per te e la tua famiglia:\n\n✨ Autentica pizza cotta nel forno a legna, consegnata calda a casa tua a Ranong\n✨ Ordine online facilissimo con geolocalizzazione GPS precisa\n✨ Pagamento comodo con PromptPay QR o Carta di Credito\n\nOrdina subito: https://flowerpowerpizza.com\n\nBuon appetito con la vera pizza italiana!'
      },
      EN: {
        subject: '🍕 Authentic Wood-Fired Italian Pizza Delivered Hot in Ranong!',
        message: 'Hello {name}!\n\nFlower Power Pizza Ranong brings a special promotion for you and your family:\n\n✨ Authentic wood-fired pizza delivered piping hot to your doorstep in Ranong\n✨ Easy online ordering with precise GPS pin-point location\n✨ Seamless payment via PromptPay QR or Credit Card\n\nOrder now: https://flowerpowerpizza.com\n\nEnjoy authentic Italian pizza!'
      },
      TH: {
        subject: '🍕 พิซซ่าอิตาเลียนแท้ อบเตาฟืน พร้อมส่งถึงบ้านคุณในระนอง!',
        message: 'สวัสดีคุณ {name}!\n\nFlower Power Pizza Ranong ขอมอบโปรโมชั่นพิเศษสำหรับคุณและครอบครัว:\n\n✨ สั่งพิซซ่าอบเตาฟืนแท้ ส่งร้อนๆ ถึงหน้าบ้านในเขตระนอง\n✨ สั่งซื้อง่ายผ่านเว็บพร้อมระบุพิกัด GPS แม่นยำ\n✨ ชำระสะดวกผ่าน PromptPay QR หรือบัตรเครดิต\n\nสั่งเลยตอนนี้: https://flowerpowerpizza.com\n\nขอให้อร่อยกับพิซซ่าอิตาเลียนแท้ครับ/ค่ะ!'
      },
      MM: {
        subject: '🍕 ရနောင်းမြို့တွင် မီးဖိုပီဇာစစ်စစ်ကို အိမ်အရောက် အမြန်ပို့ဆောင်ပေးနေပါပြီ!',
        message: 'မင်္ဂလာပါ {name}!\n\nFlower Power Pizza Ranong မှ သင့်နှင့် သင့်မိသားစုအတွက် အထူးအစီအစဉ်များ ယူဆောင်လာပါသည်-\n\n✨ မီးဖိုဖြင့် ဖုတ်ထားသော ပီဇာစစ်စစ်ကို ရနောင်းမြို့ရှိ သင့်အိမ်ရှေ့သို့ ပူပူနွေးနွေး ပို့ဆောင်ပေးခြင်း\n✨ တိကျသော GPS တည်နေရာဖြင့် အွန်လိုင်းမှ လွယ်ကူစွာ မှာယူနိုင်ခြင်း\n✨ PromptPay QR သို့မဟုတ် ခရက်ဒစ်ကတ်ဖြင့် အဆင်ပြေစွာ ငွေပေးချေနိုင်ခြင်း\n\nယခုပဲ မှာယူလိုက်ပါ: https://flowerpowerpizza.com\n\nအီတလီ ပီဇာစစ်စစ်ကို အရသာရှိစွာ သုံးဆောင်ပါ!'
      },
      DE: {
        subject: '🍕 Authentische italienische Holzofenpizza heiß geliefert in Ranong!',
        message: 'Hallo {name}!\n\nFlower Power Pizza Ranong bietet ein besonderes Angebot für dich und deine Familie:\n\n✨ Authentische Holzofenpizza dampfend heiß direkt an deine Haustür in Ranong\n✨ Einfache Online-Bestellung mit präziser GPS-Ortung\n✨ Bequeme Zahlung per PromptPay QR oder Kreditkarte\n\nJetzt bestellen: https://flowerpowerpizza.com\n\nGuten Appetit mit echter italienischer Pizza!'
      },
      ES: {
        subject: '🍕 ¡Auténtica Pizza Italiana al Horno de Leña a Domicilio en Ranong!',
        message: '¡Hola {name}!\n\nFlower Power Pizza Ranong te trae una promoción especial para ti y tu familia:\n\n✨ Auténtica pizza al horno de leña entregada caliente en la puerta de tu casa en Ranong\n✨ Pedido online súper fácil con ubicación GPS precisa\n✨ Pago cómodo con PromptPay QR o Tarjeta de Crédito\n\nPide ahora: https://flowerpowerpizza.com\n\n¡Disfruta de la auténtica pizza italiana!'
      },
      FR: {
        subject: '🍕 Authentique pizza italienne au feu de bois livrée chaude à Ranong !',
        message: 'Bonjour {name} !\n\nFlower Power Pizza Ranong vous propose une offre spéciale pour vous et votre famille :\n\n✨ Authentique pizza au feu de bois livrée bien chaude à votre porte à Ranong\n✨ Commande en ligne ultra-simple avec géolocalisation GPS précise\n✨ Paiement facile via QR Code PromptPay ou Carte bancaire\n\nCommandez dès maintenant : https://flowerpowerpizza.com\n\nRégalez-vous avec la vraie pizza italienne !'
      },
      RU: {
        subject: '🍕 Настоящая итальянская пицца на дровах с доставкой в Ранонге!',
        message: 'Здравствуйте, {name}!\n\nFlower Power Pizza Ranong подготовила специальное предложение для вас и вашей семьи:\n\n✨ Настоящая пицца из дровяной печи с доставкой с пылу с жару прямо к вашей двери в Ранонге\n✨ Удобный онлайн-заказ с точной геолокацией по GPS\n✨ Быстрая и безопасная оплата через PromptPay QR или банковской картой\n\nЗакажите прямо сейчас: https://flowerpowerpizza.com\n\nНаслаждайтесь вкусом настоящей итальянской пиццы!'
      },
      ZH: {
        subject: '🍕 正宗意大利木火烤披萨，拉廊热腾腾直送到家！',
        message: '您好 {name}！\n\nFlower Power Pizza Ranong 为您和家人带来特别礼遇：\n\n✨ 正宗木火烘烤披萨，热气腾腾直送到您在拉廊的家门口\n✨ 借助精准 GPS 定位，在线点餐轻松便捷\n✨ 支持 PromptPay QR 码或信用卡安全便捷支付\n\n立即订购：https://flowerpowerpizza.com\n\n尽情享用纯正意大利披萨！'
      }
    }
  }
};

const DEFAULT_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'rule_dining_instant_voucher',
    name: '🎁 Voucher Benvenuto Dining Tablet (-10%)',
    description: 'Genera il codice DINE10 e invia subito l\'email di benvenuto non appena il cliente conclude l\'ordine al tavolo con la sua email.',
    triggerEvent: 'dining_order',
    delayType: 'instant',
    delayValue: 0,
    templateId: 'dining_voucher_welcome',
    isEnabled: true,
    totalTriggered: 14,
    lastTriggeredAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: 'rule_voucher_reminder_7d',
    name: '⏳ Promemoria Urgenza Scadenza Voucher (a 7 giorni)',
    description: 'Invia un promemoria amichevole 7 giorni dopo la cena al tavolo se il voucher sconto 10% non è stato ancora utilizzato.',
    triggerEvent: 'voucher_reminder_7d',
    delayType: 'days',
    delayValue: 7,
    templateId: 'dining_voucher_welcome',
    isEnabled: true,
    totalTriggered: 8,
    lastTriggeredAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  },
  {
    id: 'rule_website_followup_3h',
    name: '🛵 Follow-up & Recensione Dopo Delivery Website',
    description: 'Invia una richiesta di feedback e suggerimenti 3 ore dopo la consegna a domicilio dell\'ordine effettuato sul sito web.',
    triggerEvent: 'website_order',
    delayType: 'hours',
    delayValue: 3,
    templateId: 'new_pizza',
    isEnabled: true,
    totalTriggered: 22,
    lastTriggeredAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  },
  {
    id: 'rule_inactive_reactivation_15d',
    name: '🍕 Riconquista Clienti Inattivi (dopo 15 giorni)',
    description: 'Invia la promozione speciale del weekend e nuove creazioni ai clienti che non effettuano un ordine da oltre 15 giorni.',
    triggerEvent: 'inactive_customer_15d',
    delayType: 'days',
    delayValue: 15,
    templateId: 'weekend_promo',
    isEnabled: false,
    totalTriggered: 0
  }
];

function renderPresetIcon(name: string) {
  switch (name) {
    case 'gift': return <Gift className="w-4 h-4 text-amber-400" />;
    case 'pizza': return <Pizza className="w-4 h-4 text-amber-400" />;
    case 'sparkles': return <Sparkles className="w-4 h-4 text-amber-400" />;
    case 'wine': return <Wine className="w-4 h-4 text-amber-400" />;
    default: return <Globe className="w-4 h-4 text-amber-400" />;
  }
}

export function PizzaNewsletterSection() {
  const [activeTab, setActiveTab] = useState<'crm' | 'automation' | 'history'>('crm');
  const [customers, setCustomers] = useState<PizzaCustomerRecord[]>([]);
  const [campaignHistory, setCampaignHistory] = useState<PizzaCampaignHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [langFilter, setLangFilter] = useState<'ALL' | Language>('ALL');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'VIP' | 'NEW' | 'VOUCHER' | 'TEST'>('ALL');
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  // Presets State (with ability to delete via Trash icon or reset)
  const [presets, setPresets] = useState(() => {
    try {
      const saved = localStorage.getItem('fp_pizza_newsletter_presets');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PRESETS_9LANGS;
  });

  // Automation Rules State
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(() => {
    try {
      const saved = localStorage.getItem('fp_pizza_automation_rules');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_AUTOMATION_RULES;
  });

  // Composer Multi-Language State (Autonomous storage for each of the 9 languages)
  const [activeTemplateId, setActiveTemplateId] = useState('dining_voucher_welcome');
  const [activeComposerLang, setActiveComposerLang] = useState<Language>('IT');
  const [translations, setTranslations] = useState<Record<Language, { subject: string; message: string }>>(
    () => DEFAULT_PRESETS_9LANGS.dining_voucher_welcome.translations
  );

  // Unified Scheduling & Automation Trigger State in Composer
  const [sendScheduleMode, setSendScheduleMode] = useState<'instant' | 'dining_order' | 'website_order' | 'scheduled' | 'recurring'>(() => {
    try {
      const savedRules = localStorage.getItem('fp_pizza_automation_rules');
      const rules = savedRules ? JSON.parse(savedRules) : DEFAULT_AUTOMATION_RULES;
      const match = rules.find((r: any) => r.templateId === 'dining_voucher_welcome' && r.isEnabled);
      if (match?.triggerEvent === 'dining_order') return 'dining_order';
      if (match?.triggerEvent === 'website_order') return 'website_order';
    } catch {}
    return 'dining_order';
  });
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly_friday' | 'biweekly' | 'monthly_first'>('weekly_friday');
  const [triggerDelayType, setTriggerDelayType] = useState<'instant' | 'hours' | 'days'>('instant');
  const [triggerDelayValue, setTriggerDelayValue] = useState<number>(0);
  const [isCustomDelay, setIsCustomDelay] = useState<boolean>(false);

  // Sync trigger delay state when switching mode
  const handleSelectScheduleMode = (mode: 'instant' | 'dining_order' | 'website_order' | 'scheduled' | 'recurring') => {
    setSendScheduleMode(mode);
    setSendSuccess(null);
    setSendError(null);

    if (mode === 'dining_order' || mode === 'website_order') {
      const existing = automationRules.find(r => r.triggerEvent === mode);
      if (existing) {
        setTriggerDelayType(existing.delayType);
        setTriggerDelayValue(existing.delayValue);
        const isPresetDelay = (existing.delayType === 'instant') ||
          (existing.delayType === 'hours' && (existing.delayValue === 1 || existing.delayValue === 3)) ||
          (existing.delayType === 'days' && (existing.delayValue === 1 || existing.delayValue === 5 || existing.delayValue === 10));
        setIsCustomDelay(!isPresetDelay);
      } else {
        setTriggerDelayType(mode === 'dining_order' ? 'instant' : 'hours');
        setTriggerDelayValue(mode === 'dining_order' ? 0 : 3);
        setIsCustomDelay(false);
      }
    }
  };

  // DeepSeek Live Translation in Composer
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);
  const [translateSuccessMsg, setTranslateSuccessMsg] = useState<string | null>(null);

  // Sending State
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Save presets and rules to localStorage
  const savePresets = (updated: any) => {
    setPresets(updated);
    try {
      localStorage.setItem('fp_pizza_newsletter_presets', JSON.stringify(updated));
    } catch {}
  };

  const saveAutomationRules = (updated: AutomationRule[]) => {
    setAutomationRules(updated);
    try {
      localStorage.setItem('fp_pizza_automation_rules', JSON.stringify(updated));
    } catch {}
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Sei sicuro di voler eliminare questo modello? Potrai ripristinarlo in qualsiasi momento.')) return;
    const next = { ...presets };
    delete next[id];
    savePresets(next);
    if (activeTemplateId === id) {
      const remainingKeys = Object.keys(next);
      if (remainingKeys.length > 0) {
        handleApplyPreset(remainingKeys[0]);
      }
    }
  };

  const handleResetPresets = () => {
    if (!confirm('Vuoi ripristinare tutti i 5 modelli predefiniti in 9 lingue certificate?')) return;
    savePresets(DEFAULT_PRESETS_9LANGS);
    handleApplyPreset('dining_voucher_welcome');
  };

  const handleSaveCurrentAsNewPreset = () => {
    const name = prompt('Inserisci il nome del nuovo modello personalizzato:', '🍕 Promozione Speciale');
    if (!name) return;
    const id = `custom_${Date.now()}`;
    const newPreset = {
      id,
      name,
      iconName: 'sparkles' as const,
      translations: { ...translations }
    };
    const next = { ...presets, [id]: newPreset };
    savePresets(next);
    setActiveTemplateId(id);
    alert('Modello salvato con successo nei tuoi preset!');
  };

  const toggleAutomationRule = (id: string) => {
    const updated = automationRules.map(r => r.id === id ? { ...r, isEnabled: !r.isEnabled } : r);
    saveAutomationRules(updated);
  };

  const updateRuleDelay = (id: string, delayType: 'instant' | 'hours' | 'days', delayValue: number) => {
    const updated = automationRules.map(r => r.id === id ? { ...r, delayType, delayValue } : r);
    saveAutomationRules(updated);
  };

  // Load Campaign History from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fp_pizza_campaign_history');
      if (saved) {
        setCampaignHistory(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const saveCampaignHistoryEntry = (entry: PizzaCampaignHistoryEntry) => {
    setCampaignHistory(prev => {
      const next = [entry, ...prev].slice(0, 50);
      try {
        localStorage.setItem('fp_pizza_campaign_history', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Fetch customers from pizza_orders
  const loadCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pizza_orders')
        .select('id, customer_name, phone, address, total, created_at, items')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Could not load pizza orders for CRM:', error.message);
      }

      const map = new Map<string, PizzaCustomerRecord>();

      // Populate test recipients
      for (const t of TEST_PIZZA_RECIPIENTS) {
        map.set(t.email.toLowerCase(), { ...t });
      }

      if (data && Array.isArray(data)) {
        for (const ord of data) {
          const meta = extractOrderMetadata(ord.address);
          const email = meta.customerEmail?.trim().toLowerCase();
          if (!email || !email.includes('@')) continue;

          const existing = map.get(email);
          const orderTotal = Number(ord.total) || 0;
          const orderDate = ord.created_at || new Date().toISOString();

          // Calculate Dining Voucher expiration (10 days from creation)
          let voucherCode = meta.diningVoucher || '';
          let voucherDate = '';
          let voucherExpiresAt = '';
          let isVoucherActive = false;

          if (voucherCode) {
            voucherDate = orderDate;
            const exp = new Date(new Date(orderDate).getTime() + 10 * 24 * 60 * 60 * 1000);
            voucherExpiresAt = exp.toISOString();
            isVoucherActive = exp.getTime() > Date.now();
          }

          if (existing) {
            existing.ordersCount += 1;
            existing.totalSpent += orderTotal;
            if (!existing.phone && ord.phone) existing.phone = ord.phone;
            if (new Date(orderDate) > new Date(existing.lastOrderDate)) {
              existing.lastOrderDate = orderDate;
              existing.lastAddress = meta.cleanAddress;
              existing.lang = meta.orderLang || existing.lang;
              if (meta.tableStation) existing.tableStation = meta.tableStation;
            }
            if (meta.deliveryNotes) existing.notes = meta.deliveryNotes;
            if (voucherCode && (!existing.diningVoucher || new Date(orderDate) > new Date(existing.voucherDate || 0))) {
              existing.diningVoucher = voucherCode;
              existing.voucherDate = voucherDate;
              existing.voucherExpiresAt = voucherExpiresAt;
              existing.isDiningVoucherActive = isVoucherActive;
            }
          } else {
            map.set(email, {
              email,
              name: ord.customer_name || 'Cliente Ranong',
              phone: ord.phone || '',
              lang: meta.orderLang || 'EN',
              ordersCount: 1,
              totalSpent: orderTotal,
              lastOrderDate: orderDate,
              lastAddress: meta.cleanAddress,
              notes: meta.deliveryNotes || '',
              isTest: false,
              diningVoucher: voucherCode || undefined,
              voucherDate: voucherDate || undefined,
              voucherExpiresAt: voucherExpiresAt || undefined,
              isDiningVoucherActive: isVoucherActive,
              tableStation: meta.tableStation || undefined
            });
          }
        }
      }

      const list = Array.from(map.values());
      setCustomers(list);
      // Select all real/test emails by default
      setSelectedEmails(new Set(list.map(c => c.email)));
    } catch (e) {
      console.error('Error loading CRM pizza customers:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      if (langFilter !== 'ALL' && c.lang !== langFilter) return false;
      if (tierFilter === 'VIP' && c.ordersCount < 3) return false;
      if (tierFilter === 'NEW' && c.ordersCount !== 1) return false;
      if (tierFilter === 'VOUCHER' && !c.diningVoucher) return false;
      if (tierFilter === 'TEST' && !c.isTest) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = c.name?.toLowerCase().includes(q);
        const matchEmail = c.email?.toLowerCase().includes(q);
        const matchPhone = c.phone?.toLowerCase().includes(q);
        const matchAddress = c.lastAddress?.toLowerCase().includes(q);
        const matchVoucher = c.diningVoucher?.toLowerCase().includes(q);
        const matchTable = c.tableStation?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchAddress && !matchVoucher && !matchTable) return false;
      }
      return true;
    });
  }, [customers, langFilter, tierFilter, searchQuery]);

  const toggleSelectEmail = (email: string) => {
    setSelectedEmails(prev => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const toggleSelectAllFiltered = () => {
    const allFilteredSelected = filteredCustomers.every(c => selectedEmails.has(c.email));
    setSelectedEmails(prev => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredCustomers.forEach(c => next.delete(c.email));
      } else {
        filteredCustomers.forEach(c => next.add(c.email));
      }
      return next;
    });
  };

  const handleApplyPreset = (presetId: string) => {
    const p = presets[presetId];
    if (!p) return;
    setActiveTemplateId(presetId);
    setTranslations(p.translations);
    setSendSuccess(null);
    setSendError(null);

    // Auto-sync: Check if this template is linked to an active automation rule
    const linkedRule = automationRules.find(r => r.templateId === presetId && r.isEnabled);
    if (linkedRule) {
      if (linkedRule.triggerEvent === 'dining_order') {
        setSendScheduleMode('dining_order');
      } else if (linkedRule.triggerEvent === 'website_order') {
        setSendScheduleMode('website_order');
      } else {
        setSendScheduleMode('instant');
      }
      setTriggerDelayType(linkedRule.delayType);
      setTriggerDelayValue(linkedRule.delayValue);
      const isPresetDelay = (linkedRule.delayType === 'instant') ||
        (linkedRule.delayType === 'hours' && (linkedRule.delayValue === 1 || linkedRule.delayValue === 3)) ||
        (linkedRule.delayType === 'days' && (linkedRule.delayValue === 1 || linkedRule.delayValue === 5 || linkedRule.delayValue === 10));
      setIsCustomDelay(!isPresetDelay);
    } else {
      // Default to instant broadcast if not tied to an active trigger
      setSendScheduleMode('instant');
      setTriggerDelayType('instant');
      setTriggerDelayValue(0);
      setIsCustomDelay(false);
    }
  };

  const updateCurrentLangField = (field: 'subject' | 'message', val: string) => {
    setTranslations(prev => ({
      ...prev,
      [activeComposerLang]: {
        ...prev[activeComposerLang],
        [field]: val
      }
    }));
  };

  // Live DeepSeek AI Total Translation (Translates current text to ALL 9 languages simultaneously)
  const handleTranslateAllWithDeepSeek = async () => {
    setIsTranslatingAll(true);
    setTranslateSuccessMsg(null);
    setSendError(null);

    try {
      const current = translations[activeComposerLang] || translations.IT;
      const res = await fetch('/api/campaign-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceLang: activeComposerLang,
          targetLang: 'ALL',
          subject: current.subject,
          message: current.message
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.translations) {
        throw new Error(data.error || 'Traduzione simultanea fallita');
      }

      setTranslations(prev => {
        const next = { ...prev };
        for (const l of ALL_SUPPORTED_LANGS) {
          if (data.translations[l.code]) {
            next[l.code] = {
              subject: data.translations[l.code].subject || current.subject,
              message: data.translations[l.code].message || current.message
            };
          }
        }
        return next;
      });

      setTranslateSuccessMsg(`Tutte le 9 lingue tradotte e certificate con DeepSeek AI con successo!`);
      setTimeout(() => setTranslateSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error('Translation error:', err);
      setSendError(err.message || 'Errore durante la traduzione DeepSeek');
    } finally {
      setIsTranslatingAll(false);
    }
  };

  // Send test email
  const handleSendTest = async () => {
    setIsSending(true);
    setSendSuccess(null);
    setSendError(null);
    try {
      const current = translations[activeComposerLang] || translations.IT;
      const res = await fetch('/api/send-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: ['redflowerpower@gmail.com'],
          subject: `[TEST - ${activeComposerLang}] ${current.subject}`,
          message: current.message.replace('{name}', 'Marco (Admin Test)'),
          senderAccount: 'pizza'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invio test fallito');
      }

      setSendSuccess(`Email di test (${activeComposerLang}) inviata con successo a redflowerpower@gmail.com da flowerpowerpizzaranong.th@gmail.com!`);
    } catch (err: any) {
      setSendError(err.message || 'Errore durante l\'invio del test');
    } finally {
      setIsSending(false);
    }
  };

  // Save / Activate trigger for Dining Table or Website Delivery
  const handleSaveAutomationTrigger = (triggerEvent: 'dining_order' | 'website_order') => {
    const isDining = triggerEvent === 'dining_order';
    const eventName = isDining ? 'Dining Tablet (Tavolo)' : 'Website Delivery (Online)';
    
    const delayDesc = triggerDelayType === 'instant'
      ? 'immediatamente dopo l\'ordine'
      : triggerDelayType === 'hours'
      ? `${triggerDelayValue} ${triggerDelayValue === 1 ? 'ora' : 'ore'} dopo l'ordine`
      : `${triggerDelayValue} ${triggerDelayValue === 1 ? 'giorno' : 'giorni'} dopo l'ordine`;

    const existingIndex = automationRules.findIndex(r => r.triggerEvent === triggerEvent);
    let updatedRules = [...automationRules];
    if (existingIndex >= 0) {
      updatedRules[existingIndex] = {
        ...updatedRules[existingIndex],
        delayType: triggerDelayType,
        delayValue: triggerDelayValue,
        templateId: activeTemplateId,
        isEnabled: true
      };
    } else {
      updatedRules.push({
        id: `rule_${triggerEvent}_${Date.now()}`,
        name: isDining ? '🎁 Voucher Post-Ordine Dining Tablet' : '🛵 Follow-up Post-Ordine Website Delivery',
        description: `Invia automaticamente questo modello ${delayDesc} a ogni cliente che effettua un ordine.`,
        triggerEvent,
        delayType: triggerDelayType,
        delayValue: triggerDelayValue,
        templateId: activeTemplateId,
        isEnabled: true,
        totalTriggered: 0
      });
    }

    saveAutomationRules(updatedRules);

    // Also persist current template translations
    if (presets[activeTemplateId]) {
      const updatedPresets = {
        ...presets,
        [activeTemplateId]: {
          ...presets[activeTemplateId],
          translations: { ...translations }
        }
      };
      savePresets(updatedPresets);
    }

    setSendSuccess(`✓ Automazione "${eventName}" salvata e attivata con successo! L'email "${presets[activeTemplateId]?.name || activeTemplateId}" verrà spedita ${delayDesc}.`);
    setSendError(null);
  };

  // Send full multilingual campaign (Segments targets by their preferred language)
  const handleSendCampaign = async () => {
    const targets = Array.from(selectedEmails);
    if (targets.length === 0) {
      alert('Seleziona almeno un destinatario per la campagna!');
      return;
    }

    if (sendScheduleMode === 'scheduled' && !scheduledDateTime) {
      alert('Per favore seleziona la data e l\'ora per la programmazione dell\'invio!');
      return;
    }

    const modeText = sendScheduleMode === 'instant' 
      ? `invio immediato a ${targets.length} destinatari`
      : sendScheduleMode === 'scheduled'
      ? `invio programmato per il ${new Date(scheduledDateTime).toLocaleString('it-IT')} a ${targets.length} destinatari`
      : `invio ricorrente (${recurringFrequency === 'weekly_friday' ? 'Ogni Venerdì 18:00' : recurringFrequency === 'biweekly' ? 'Ogni 15 giorni' : 'Ogni 1° del mese'}) a ${targets.length} destinatari`;

    if (!confirm(`Confermi la pubblicazione della campagna: ${modeText}?`)) {
      return;
    }

    if (sendScheduleMode !== 'instant') {
      // Record scheduled campaign
      const scheduledEntry: PizzaCampaignHistoryEntry = {
        id: `sched-${Date.now()}`,
        timestamp: new Date().toISOString(),
        subject: `[PROGRAMMATO] ${translations[activeComposerLang]?.subject || translations.IT.subject}`,
        senderAccount: 'flowerpowerpizzaranong.th@gmail.com',
        count: targets.length,
        type: 'scheduled_trigger',
        targetLang: langFilter === 'ALL' ? 'Multilingua (9 Lingue)' : langFilter,
        recipients: targets.map(email => {
          const match = customers.find(c => c.email === email);
          return { name: match?.name || email, email, lang: match?.lang };
        })
      };
      saveCampaignHistoryEntry(scheduledEntry);
      setSendSuccess(`Campagna programmata con successo per ${targets.length} destinatari! (${modeText})`);
      return;
    }

    setIsSending(true);
    setSendSuccess(null);
    setSendError(null);

    try {
      // Group target customers by language
      const langGroups: Record<string, string[]> = {};
      for (const email of targets) {
        const c = customers.find(x => x.email === email);
        const l = (c?.lang && translations[c.lang]) ? c.lang : (langFilter !== 'ALL' ? langFilter : 'EN');
        if (!langGroups[l]) langGroups[l] = [];
        langGroups[l].push(email);
      }

      let totalSent = 0;

      // Dispatch sequentially for each language group
      for (const [lKey, emails] of Object.entries(langGroups)) {
        const l = lKey as Language;
        const trans = translations[l] || translations.EN || translations.IT;

        const res = await fetch('/api/send-newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emails,
            subject: trans.subject,
            message: trans.message.replace('{name}', 'Gentile Ospite'),
            senderAccount: 'pizza'
          })
        });

        const data = await res.json();
        if (data.success) {
          totalSent += (data.count || emails.length);
        }
      }

      // Save to local history log
      const historyEntry: PizzaCampaignHistoryEntry = {
        id: `camp-${Date.now()}`,
        timestamp: new Date().toISOString(),
        subject: translations[activeComposerLang]?.subject || translations.IT.subject,
        senderAccount: 'flowerpowerpizzaranong.th@gmail.com',
        count: totalSent,
        type: 'manual_broadcast',
        targetLang: langFilter === 'ALL' ? 'Multilingua (9 Lingue)' : langFilter,
        recipients: targets.map(email => {
          const match = customers.find(c => c.email === email);
          return { name: match?.name || email, email, lang: match?.lang };
        })
      };
      saveCampaignHistoryEntry(historyEntry);

      setSendSuccess(`Campagna multilingua inviata con successo a ${totalSent} destinatari nelle rispettive lingue da flowerpowerpizzaranong.th@gmail.com!`);
    } catch (err: any) {
      setSendError(err.message || 'Errore durante l\'invio della campagna');
    } finally {
      setIsSending(false);
    }
  };

  const voucherCustomers = customers.filter(c => Boolean(c.diningVoucher));
  const activeVoucherCount = voucherCustomers.filter(c => c.isDiningVoucherActive).length;
  const currentTranslation = translations[activeComposerLang] || translations.IT;

  // Find most recent dining voucher customer
  const latestVoucherCustomer = useMemo(() => {
    if (voucherCustomers.length === 0) return null;
    return [...voucherCustomers].sort((a, b) => new Date(b.voucherDate || b.lastOrderDate).getTime() - new Date(a.voucherDate || a.lastOrderDate).getTime())[0];
  }, [voucherCustomers]);

  return (
    <div className="space-y-6 text-stone-100 animate-fadeIn" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-red-950/80 via-stone-900 to-stone-900 border border-red-900/40 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-red-600/20 border border-red-500/30 rounded-2xl text-red-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Marketing & Mailing List Studio Pizza</span>
                <span className="bg-amber-400 text-stone-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                  9 LINGUE + DEEPSEEK AI
                </span>
              </h2>
              <p className="text-stone-400 text-xs font-medium mt-0.5">
                Mittente certificato: <span className="text-red-400 font-bold">flowerpowerpizzaranong.th@gmail.com</span> · Trigger Automatici & Campagne Broadcast
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Main 3 Navigation Tabs */}
          <div className="bg-stone-950/80 p-1 rounded-2xl border border-stone-800 flex items-center gap-1 flex-wrap">
            <button
              onClick={() => setActiveTab('crm')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'crm' 
                  ? 'bg-red-700 text-white shadow-md' 
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>CRM & Broadcast</span>
            </button>

            <button
              onClick={() => setActiveTab('automation')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'automation' 
                  ? 'bg-purple-700 text-white shadow-md' 
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>⚡ Automazioni & Trigger ({automationRules.filter(r => r.isEnabled).length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'history' 
                  ? 'bg-red-700 text-white shadow-md' 
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Storico Invii ({campaignHistory.length})</span>
            </button>
          </div>

          <button
            onClick={loadCustomers}
            disabled={loading}
            className="py-2 px-3.5 bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span>Ricarica</span>
          </button>
        </div>
      </div>

      {/* Real-time KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3.5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 text-xs font-bold">
            <span>Contatti CRM Totali</span>
            <Users className="w-4 h-4 text-stone-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {customers.length}
          </div>
          <p className="text-[10px] text-stone-500 truncate">
            {customers.filter(c => !c.isTest).length} reali + {TEST_PIZZA_RECIPIENTS.length} contatti test staff
          </p>
        </div>

        <div className="bg-stone-900/90 border border-purple-500/30 rounded-2xl p-3.5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-purple-300 text-xs font-bold">
            <span>Voucher Dining Emessi</span>
            <Gift className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-200">
            {voucherCustomers.length}
          </div>
          <p className="text-[10px] text-purple-300/70 truncate">
            Generati da ordini con email al tavolo
          </p>
        </div>

        <div className="bg-stone-900/90 border border-emerald-500/30 rounded-2xl p-3.5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-emerald-300 text-xs font-bold">
            <span>Voucher Attivi Oggi (≤10d)</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-300">
            {activeVoucherCount}
          </div>
          <p className="text-[10px] text-emerald-300/70 truncate">
            Sconto 10% utilizzabile per delivery
          </p>
        </div>

        <div className="bg-stone-900/90 border border-amber-500/30 rounded-2xl p-3.5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-amber-300 text-xs font-bold">
            <span>Regole Trigger Attive</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xs sm:text-sm font-black text-emerald-400 flex items-center gap-1.5 pt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            <span>{automationRules.filter(r => r.isEnabled).length} ATTIVE IN TEMPO REALE</span>
          </div>
          <p className="text-[10px] text-stone-400 truncate">
            {latestVoucherCustomer 
              ? `Ultimo invio: ${latestVoucherCustomer.diningVoucher} (${latestVoucherCustomer.lang})` 
              : 'In ascolto su Dining Tablet & Delivery'}
          </p>
        </div>
      </div>

      {/* ── TAB 1: CRM & COMPOSER BROADCAST ── */}
      {activeTab === 'crm' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Customer CRM & Filters (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Filters Card */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-4 sm:p-5 shadow-lg space-y-3.5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    type="text"
                    placeholder="Cerca per nome, email, telefono, tavolo, voucher..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-stone-800/80 border border-stone-700 rounded-2xl pl-10 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* 9 Languages Filter Pills */}
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    onClick={() => setLangFilter('ALL')}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black uppercase transition-all cursor-pointer ${
                      langFilter === 'ALL'
                        ? 'bg-red-700 text-white shadow-sm'
                        : 'bg-stone-800 text-stone-400 hover:text-white'
                    }`}
                  >
                    Tutti (9)
                  </button>
                  {ALL_SUPPORTED_LANGS.map(l => (
                    <button
                      key={l.code}
                      onClick={() => setLangFilter(l.code)}
                      className={`px-2 py-1.5 rounded-xl text-[11px] font-black uppercase transition-all cursor-pointer flex items-center gap-1 ${
                        langFilter === l.code
                          ? 'bg-red-700 text-white shadow-sm'
                          : 'bg-stone-800 text-stone-400 hover:text-white'
                      }`}
                      title={l.label}
                    >
                      <span>{l.flag}</span>
                      <span>{l.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-Filters: Tier + Selection counts */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-800 text-xs flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSelectAllFiltered}
                    className="flex items-center gap-1.5 text-stone-300 hover:text-white font-bold cursor-pointer"
                  >
                    {filteredCustomers.length > 0 && filteredCustomers.every(c => selectedEmails.has(c.email)) ? (
                      <CheckSquare className="w-4 h-4 text-red-500" />
                    ) : (
                      <Square className="w-4 h-4 text-stone-500" />
                    )}
                    <span>Seleziona ({selectedEmails.size}/{filteredCustomers.length})</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setTierFilter('ALL')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                      tierFilter === 'ALL' ? 'bg-stone-700 text-white' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Tutti ({customers.length})
                  </button>
                  <button
                    onClick={() => setTierFilter('VOUCHER')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                      tierFilter === 'VOUCHER' ? 'bg-purple-700 text-white' : 'text-purple-400 hover:text-purple-300'
                    }`}
                  >
                    <Gift className="w-3 h-3" />
                    <span>Voucher 10% ({voucherCustomers.length})</span>
                  </button>
                  <button
                    onClick={() => setTierFilter('VIP')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                      tierFilter === 'VIP' ? 'bg-amber-600 text-white' : 'text-amber-400/80 hover:text-amber-300'
                    }`}
                  >
                    ⭐ VIP (3+)
                  </button>
                  <button
                    onClick={() => setTierFilter('TEST')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                      tierFilter === 'TEST' ? 'bg-blue-600 text-white' : 'text-blue-400/80 hover:text-blue-300'
                    }`}
                  >
                    🧪 Test ({TEST_PIZZA_RECIPIENTS.length})
                  </button>
                </div>
              </div>
            </div>

            {/* CRM Customer List */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-2 sm:p-3 shadow-lg max-h-[580px] overflow-y-auto custom-scrollbar space-y-1.5">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-stone-500 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                  <span className="text-xs">Caricamento anagrafiche clienti...</span>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="py-12 text-center text-stone-500 text-xs">
                  Nessun cliente corrisponde ai filtri selezionati.
                </div>
              ) : (
                filteredCustomers.map((c) => {
                  const isSelected = selectedEmails.has(c.email);
                  return (
                    <div
                      key={c.email}
                      onClick={() => toggleSelectEmail(c.email)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-red-950/30 border-red-500/40 hover:bg-red-950/40'
                          : 'bg-stone-800/40 border-stone-800 hover:bg-stone-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="text-stone-400 flex-shrink-0">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-red-500" />
                          ) : (
                            <Square className="w-4 h-4 text-stone-600" />
                          )}
                        </div>
                        
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-white truncate">{c.name}</span>
                            {c.isTest && (
                              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                                TEST
                              </span>
                            )}
                            <span className="bg-stone-700 text-stone-300 text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                              {c.lang}
                            </span>
                            {c.ordersCount >= 3 && (
                              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                                ⭐ VIP ({c.ordersCount})
                              </span>
                            )}
                            {c.diningVoucher && (
                              <span className="bg-purple-900/60 text-purple-300 border border-purple-500/40 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md flex items-center gap-1">
                                <Gift className="w-2.5 h-2.5" />
                                <span>{c.diningVoucher}</span>
                                {c.isDiningVoucherActive && <span className="text-emerald-400">● 10d</span>}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-400 truncate flex items-center gap-2">
                            <span>{c.email}</span>
                            {c.phone && <span className="text-stone-500">• {c.phone}</span>}
                          </div>
                          {(c.tableStation || c.lastAddress) && (
                            <div className="text-[10px] text-stone-500 truncate">
                              📍 {c.tableStation ? `Tavolo: ${c.tableStation}` : c.lastAddress}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 space-y-0.5">
                        <div className="text-xs font-black text-red-400">
                          {c.totalSpent > 0 ? `${c.totalSpent} ฿` : 'Test'}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {c.ordersCount} {c.ordersCount === 1 ? 'ordine' : 'ordini'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Multilingual Composer & Campaign Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Preset Templates with Trash Icon & Add/Reset */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-4 sm:p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-300 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-red-400" />
                  <span>Modelli Campagna ({Object.keys(presets).length})</span>
                </h3>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetPresets}
                    className="text-[10px] text-stone-400 hover:text-amber-300 flex items-center gap-1 font-bold transition-all cursor-pointer"
                    title="Ripristina i 5 modelli predefiniti in 9 lingue"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Ripristina</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCurrentAsNewPreset}
                    className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold transition-all cursor-pointer bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30"
                    title="Salva il testo corrente come nuovo modello"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Salva Nuovo</span>
                  </button>
                </div>
              </div>

              {Object.keys(presets).length === 0 ? (
                <div className="py-4 text-center text-xs text-stone-500 space-y-2">
                  <p>Nessun modello salvato.</p>
                  <button
                    type="button"
                    onClick={handleResetPresets}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-bold"
                  >
                    Ripristina Modelli Predefiniti
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.values(presets).map((preset: any) => {
                    const isActive = activeTemplateId === preset.id;
                    const isLinkedLive = automationRules.some(r => r.templateId === preset.id && r.isEnabled);
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset.id)}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                          isActive
                            ? 'bg-red-700 border-red-500 text-white shadow-md'
                            : 'bg-stone-800/80 border-stone-700/80 text-stone-300 hover:border-stone-600 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {renderPresetIcon(preset.iconName)}
                          <span className="text-[11px] font-bold truncate">{preset.name}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isLinkedLive && (
                            <span className="text-[8.5px] font-mono font-black text-emerald-400 bg-emerald-950/90 border border-emerald-500/50 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>LIVE</span>
                            </span>
                          )}

                          {/* Trash Icon */}
                          <button
                            type="button"
                            onClick={(e) => handleDeletePreset(preset.id, e)}
                            className={`p-1 rounded-lg transition-all cursor-pointer ${
                              isActive
                                ? 'text-white/70 hover:text-white hover:bg-red-800'
                                : 'text-stone-500 hover:text-red-400 hover:bg-stone-700'
                            }`}
                            title="Elimina modello"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Email Composer */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-4 sm:p-5 shadow-lg space-y-4">
              
              {/* DeepSeek AI Batch Translator Toolbar */}
              <div className="p-3.5 bg-stone-950/80 border border-amber-500/30 rounded-2xl space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>DeepSeek AI · Motore Multilingua Simultaneo</span>
                  </div>
                  <span className="text-[9.5px] bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold px-1.5 py-0.5 rounded">
                    9 LINGUE
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleTranslateAllWithDeepSeek}
                  disabled={isTranslatingAll}
                  className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isTranslatingAll ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-950" />
                      <span>Traduzione simultanea in corso delle 9 lingue...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5 text-stone-950" />
                      <span>🪄 Traduci Tutto con DeepSeek AI (9 Lingue in 1 Clic)</span>
                    </>
                  )}
                </button>

                {translateSuccessMsg && (
                  <p className="text-[10.5px] text-emerald-400 font-bold animate-fadeIn flex items-center gap-1">
                    <span>✓</span>
                    <span>{translateSuccessMsg}</span>
                  </p>
                )}
              </div>

              {/* 9 Language Tabs for Live Composer & Editing */}
              <div className="space-y-1.5">
                <label className="text-[10.5px] font-bold text-stone-400 uppercase tracking-wider block">
                  Lingua del Contenuto Visualizzato:
                </label>
                <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar">
                  {ALL_SUPPORTED_LANGS.map(l => {
                    const isSelected = activeComposerLang === l.code;
                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => setActiveComposerLang(l.code)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                          isSelected
                            ? 'bg-red-700 text-white shadow-sm border border-red-500'
                            : 'bg-stone-850 text-stone-400 hover:text-white border border-stone-800'
                        }`}
                        title={l.label}
                      >
                        <span>{l.flag}</span>
                        <span>{l.code}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Oggetto Email</span>
                    <span className="text-amber-400 text-[10px]">[{activeComposerLang}]</span>
                  </label>
                  <span className="text-[9.5px] text-stone-500 font-medium">Modifica specifica per {activeComposerLang}</span>
                </div>
                <input
                  type="text"
                  value={currentTranslation.subject}
                  onChange={e => updateCurrentLangField('subject', e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-2xl p-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
                  placeholder="Inserisci l'oggetto dell'email..."
                />
              </div>

              {/* Message Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Messaggio</span>
                    <span className="text-amber-400 text-[10px]">[{activeComposerLang}]</span>
                  </label>
                  <span className="text-[10px] text-stone-500">Usa <b>{'{name}'}</b> per il nome</span>
                </div>
                <textarea
                  rows={8}
                  value={currentTranslation.message}
                  onChange={e => updateCurrentLangField('message', e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-2xl p-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-500 font-mono leading-relaxed"
                  placeholder="Scrivi qui il corpo del messaggio..."
                />
              </div>

              {/* Schedulazione & Frequenza di Invio (Unified 5-Mode Engine) */}
              <div className="p-4 bg-stone-950/80 border border-stone-800 rounded-3xl space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Quando inviare questa email? (Schedulazione & Trigger)</span>
                  </label>
                  {(sendScheduleMode === 'dining_order' || sendScheduleMode === 'website_order') && (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Trigger Automatico</span>
                    </span>
                  )}
                </div>

                {/* Active Rule Live Sync Summary */}
                {(() => {
                  const currentLinkedRule = automationRules.find(r => r.templateId === activeTemplateId && r.isEnabled);
                  if (!currentLinkedRule) return null;
                  const delayLabel = currentLinkedRule.delayType === 'instant' 
                    ? '⚡ Subito dopo l\'ordine' 
                    : currentLinkedRule.delayType === 'hours'
                    ? `⏱️ ${currentLinkedRule.delayValue} ${currentLinkedRule.delayValue === 1 ? 'ora' : 'ore'} dopo`
                    : `📅 ${currentLinkedRule.delayValue} ${currentLinkedRule.delayValue === 1 ? 'giorno' : 'giorni'} dopo`;
                  return (
                    <div className="p-2.5 bg-emerald-950/70 border border-emerald-500/40 rounded-2xl flex items-center justify-between text-xs text-emerald-300 animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <span className="font-bold">
                          Configurazione Live: {currentLinkedRule.triggerEvent === 'dining_order' ? '🍽️ Dining Tablet (Tavolo)' : '🛵 Website Delivery (Online)'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono bg-emerald-900/80 px-2 py-0.5 rounded-lg border border-emerald-500/40 text-emerald-200 font-bold">
                        {delayLabel}
                      </span>
                    </div>
                  );
                })()}

                {/* 5 Modes Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectScheduleMode('instant')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left flex items-center gap-2 ${
                      sendScheduleMode === 'instant'
                        ? 'bg-amber-500 text-stone-950 font-black shadow-md border border-amber-400'
                        : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
                    }`}
                  >
                    <span>⚡</span>
                    <div className="truncate">
                      <div className="font-bold text-xs">Subito</div>
                      <div className="text-[9px] opacity-75">Broadcast manuale</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectScheduleMode('dining_order')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left flex items-center gap-2 ${
                      sendScheduleMode === 'dining_order'
                        ? 'bg-purple-600 text-white font-black shadow-md border border-purple-400'
                        : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
                    }`}
                  >
                    <span>🍽️</span>
                    <div className="truncate">
                      <div className="font-bold text-xs">Post-Dining Table</div>
                      <div className="text-[9px] opacity-75">Dopo ordine tavolo</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectScheduleMode('website_order')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left flex items-center gap-2 ${
                      sendScheduleMode === 'website_order'
                        ? 'bg-emerald-600 text-white font-black shadow-md border border-emerald-400'
                        : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
                    }`}
                  >
                    <span>🛵</span>
                    <div className="truncate">
                      <div className="font-bold text-xs">Post-Online Web</div>
                      <div className="text-[9px] opacity-75">Dopo ordine delivery</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectScheduleMode('scheduled')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left flex items-center gap-2 ${
                      sendScheduleMode === 'scheduled'
                        ? 'bg-blue-600 text-white font-black shadow-md border border-blue-400'
                        : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
                    }`}
                  >
                    <span>📅</span>
                    <div className="truncate">
                      <div className="font-bold text-xs">Data Programmata</div>
                      <div className="text-[9px] opacity-75">Giorno e ora fissa</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectScheduleMode('recurring')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left flex items-center gap-2 col-span-2 sm:col-span-1 ${
                      sendScheduleMode === 'recurring'
                        ? 'bg-rose-600 text-white font-black shadow-md border border-rose-400'
                        : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
                    }`}
                  >
                    <span>🔄</span>
                    <div className="truncate">
                      <div className="font-bold text-xs">Ricorrente</div>
                      <div className="text-[9px] opacity-75">Settimanale / Mese</div>
                    </div>
                  </button>
                </div>

                {/* Sub-panel for Dining Tablet Trigger or Website Order Trigger: DELAY OPTIONS */}
                {(sendScheduleMode === 'dining_order' || sendScheduleMode === 'website_order') && (
                  <div className="p-3.5 bg-stone-900/90 border border-stone-700/60 rounded-2xl space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-stone-200 flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          Quanto tempo dopo l'ordine {sendScheduleMode === 'dining_order' ? 'al tavolo' : 'online'} inviare l'email?
                        </span>
                      </label>
                      <span className="text-[10px] font-mono text-amber-400 font-bold">
                        {triggerDelayType === 'instant' 
                          ? '⚡ Subito al checkout' 
                          : triggerDelayType === 'hours'
                          ? `⏱️ ${triggerDelayValue} ${triggerDelayValue === 1 ? 'ora' : 'ore'} dopo`
                          : `📅 ${triggerDelayValue} ${triggerDelayValue === 1 ? 'giorno' : 'giorni'} dopo`}
                      </span>
                    </div>

                    {/* Delay Presets Pills */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      <button
                        type="button"
                        onClick={() => { setTriggerDelayType('instant'); setTriggerDelayValue(0); setIsCustomDelay(false); }}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                          triggerDelayType === 'instant' && !isCustomDelay
                            ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                            : 'bg-stone-800 text-stone-400 hover:text-white'
                        }`}
                      >
                        ⚡ Subito
                      </button>
                      <button
                        type="button"
                        onClick={() => { setTriggerDelayType('hours'); setTriggerDelayValue(1); setIsCustomDelay(false); }}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                          triggerDelayType === 'hours' && triggerDelayValue === 1 && !isCustomDelay
                            ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                            : 'bg-stone-800 text-stone-400 hover:text-white'
                        }`}
                      >
                        ⏱️ 1 Ora
                      </button>
                      <button
                        type="button"
                        onClick={() => { setTriggerDelayType('hours'); setTriggerDelayValue(3); setIsCustomDelay(false); }}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                          triggerDelayType === 'hours' && triggerDelayValue === 3 && !isCustomDelay
                            ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                            : 'bg-stone-800 text-stone-400 hover:text-white'
                        }`}
                      >
                        ⏱️ 3 Ore
                      </button>
                      <button
                        type="button"
                        onClick={() => { setTriggerDelayType('days'); setTriggerDelayValue(1); setIsCustomDelay(false); }}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                          triggerDelayType === 'days' && triggerDelayValue === 1 && !isCustomDelay
                            ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                            : 'bg-stone-800 text-stone-400 hover:text-white'
                        }`}
                      >
                        📅 1 Giorno
                      </button>
                      <button
                        type="button"
                        onClick={() => { setTriggerDelayType('days'); setTriggerDelayValue(5); setIsCustomDelay(false); }}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                          triggerDelayType === 'days' && triggerDelayValue === 5 && !isCustomDelay
                            ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                            : 'bg-stone-800 text-stone-400 hover:text-white'
                        }`}
                      >
                        📅 5 Giorni
                      </button>
                      <button
                        type="button"
                        onClick={() => { setTriggerDelayType('days'); setTriggerDelayValue(10); setIsCustomDelay(false); }}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                          triggerDelayType === 'days' && triggerDelayValue === 10 && !isCustomDelay
                            ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                            : 'bg-stone-800 text-stone-400 hover:text-white'
                        }`}
                      >
                        📅 10 Giorni
                      </button>
                    </div>

                    {/* Custom Delay Option */}
                    <div className="flex items-center gap-2 pt-1 border-t border-stone-800">
                      <button
                        type="button"
                        onClick={() => setIsCustomDelay(!isCustomDelay)}
                        className={`text-[10.5px] font-bold cursor-pointer transition-colors ${
                          isCustomDelay ? 'text-amber-400 underline' : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        ⚙️ Imposta intervallo personalizzato...
                      </button>

                      {isCustomDelay && (
                        <div className="flex items-center gap-2 flex-1 animate-fadeIn">
                          <input
                            type="number"
                            min="1"
                            max="365"
                            value={triggerDelayValue || 1}
                            onChange={e => setTriggerDelayValue(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 bg-stone-950 border border-stone-700 rounded-xl px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-amber-400"
                          />
                          <select
                            value={triggerDelayType === 'instant' ? 'hours' : triggerDelayType}
                            onChange={e => setTriggerDelayType(e.target.value as 'hours' | 'days')}
                            className="bg-stone-950 border border-stone-700 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                          >
                            <option value="hours">Ore dopo</option>
                            <option value="days">Giorni dopo</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <p className="text-[10px] text-stone-400 leading-relaxed">
                      💡 {sendScheduleMode === 'dining_order'
                        ? 'Quando un cliente conclude un ordine al tavolo inserendo la sua email sul Dining Tablet, riceverà automaticamente questa email con il voucher 10%.'
                        : 'Quando un cliente conclude un ordine online sul sito web, riceverà automaticamente questa email di ringraziamento/recensione.'}
                    </p>
                  </div>
                )}

                {sendScheduleMode === 'scheduled' && (
                  <div className="p-3.5 bg-stone-900/90 border border-stone-700/60 rounded-2xl space-y-1.5 animate-fadeIn">
                    <label className="text-[10.5px] text-stone-300 font-bold block">Seleziona Data e Ora Esatta di Invio:</label>
                    <input
                      type="datetime-local"
                      value={scheduledDateTime}
                      onChange={e => setScheduledDateTime(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>
                )}

                {sendScheduleMode === 'recurring' && (
                  <div className="p-3.5 bg-stone-900/90 border border-stone-700/60 rounded-2xl space-y-1.5 animate-fadeIn">
                    <label className="text-[10.5px] text-stone-300 font-bold block">Frequenza Ciclica Automatica:</label>
                    <select
                      value={recurringFrequency}
                      onChange={e => setRecurringFrequency(e.target.value as any)}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400 cursor-pointer"
                    >
                      <option value="weekly_friday">Ogni settimana (Venerdì alle 18:00 - Weekend Pizza)</option>
                      <option value="biweekly">Ogni 15 giorni (Metà e Fine mese)</option>
                      <option value="monthly_first">Ogni 1° del Mese (Novità & Cantina)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Notification Badges */}
              {sendSuccess && (
                <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="leading-relaxed">{sendSuccess}</span>
                </div>
              )}

              {sendError && (
                <div className="p-3.5 bg-red-950/80 border border-red-500/50 rounded-2xl text-red-300 text-xs flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="leading-relaxed">{sendError}</span>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-2 border-t border-stone-800">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    className="py-2.5 px-3 bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Anteprima ({activeComposerLang})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendTest}
                    disabled={isSending}
                    className="py-2.5 px-3 bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-500/40 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FlaskConical className="w-3.5 h-3.5" />}
                    <span>Invia Test Staff ({activeComposerLang})</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (sendScheduleMode === 'dining_order' || sendScheduleMode === 'website_order') {
                      handleSaveAutomationTrigger(sendScheduleMode);
                    } else {
                      handleSendCampaign();
                    }
                  }}
                  disabled={isSending || ((sendScheduleMode === 'instant' || sendScheduleMode === 'scheduled' || sendScheduleMode === 'recurring') && selectedEmails.size === 0)}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:bg-stone-800 disabled:text-stone-500 disabled:shadow-none ${
                    sendScheduleMode === 'dining_order'
                      ? 'bg-purple-700 hover:bg-purple-600 text-white'
                      : sendScheduleMode === 'website_order'
                      ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                      : sendScheduleMode === 'scheduled'
                      ? 'bg-blue-700 hover:bg-blue-600 text-white'
                      : sendScheduleMode === 'recurring'
                      ? 'bg-rose-700 hover:bg-rose-600 text-white'
                      : 'bg-red-700 hover:bg-red-600 text-white'
                  }`}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Elaborazione in corso...</span>
                    </>
                  ) : sendScheduleMode === 'dining_order' ? (
                    <>
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>🍽️ Salva & Attiva Trigger Post-Ordine Dining Tablet</span>
                    </>
                  ) : sendScheduleMode === 'website_order' ? (
                    <>
                      <Zap className="w-4 h-4 text-emerald-300" />
                      <span>🛵 Salva & Attiva Trigger Post-Ordine Website Delivery</span>
                    </>
                  ) : sendScheduleMode === 'instant' ? (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Lancia Campagna Multilingua a {selectedEmails.size} Destinatari</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>Pianifica Campagna per {selectedEmails.size} Destinatari</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ── TAB 2: AUTOMAZIONI & TRIGGER COMPORTAMENTALI ── */}
      {activeTab === 'automation' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Header Automation Control Banner */}
          <div className="bg-gradient-to-br from-stone-900 via-[#1e1313] to-stone-950 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    <Zap className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <span>Motore di Marketing Automation & Trigger Comportamentali</span>
                  </h3>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed max-w-3xl">
                  Configura le email automatiche che il server spedisce da solo in base alle azioni dei clienti (ordini al tavolo, delivery sul sito web, promemoria scadenza e riconquista inattivi).
                </p>
              </div>

              <button
                type="button"
                onClick={handleSendTest}
                disabled={isSending}
                className="py-2 px-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow cursor-pointer shrink-0"
              >
                <FlaskConical className="w-4 h-4" />
                <span>Test Email Automatica</span>
              </button>
            </div>

            {/* List of Active Automation Rules */}
            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-300 flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-400" />
                <span>Regole di Automazione Attive ({automationRules.length})</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {automationRules.map(rule => (
                  <div 
                    key={rule.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      rule.isEnabled 
                        ? 'bg-stone-950/80 border-purple-500/40 shadow-md' 
                        : 'bg-stone-950/40 border-stone-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${rule.isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-stone-600'}`} />
                          <h5 className="font-black text-xs text-white">{rule.name}</h5>
                        </div>
                        <p className="text-[11px] text-stone-400 leading-relaxed">{rule.description}</p>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => toggleAutomationRule(rule.id)}
                        className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer shrink-0 ${
                          rule.isEnabled
                            ? 'bg-emerald-500 text-stone-950 shadow'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {rule.isEnabled ? 'ATTIVA' : 'PAUSA'}
                      </button>
                    </div>

                    {/* Delay Selector Toolbar */}
                    <div className="p-2.5 bg-stone-900/80 rounded-xl border border-stone-800/80 flex items-center justify-between gap-2 text-xs flex-wrap">
                      <div className="flex items-center gap-1.5 text-stone-400 text-[10.5px]">
                        <Timer className="w-3.5 h-3.5 text-amber-400" />
                        <span>Tempistica di Invio:</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <select
                          value={rule.delayType}
                          onChange={e => updateRuleDelay(rule.id, e.target.value as any, rule.delayValue || (e.target.value === 'instant' ? 0 : 3))}
                          className="bg-stone-800 border border-stone-700 text-white rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-amber-400 cursor-pointer"
                        >
                          <option value="instant">⚡ Subito (Istantaneo)</option>
                          <option value="hours">⏱️ Dopo N Ore</option>
                          <option value="days">📅 Dopo N Giorni</option>
                        </select>

                        {rule.delayType !== 'instant' && (
                          <input
                            type="number"
                            min={1}
                            max={60}
                            value={rule.delayValue}
                            onChange={e => updateRuleDelay(rule.id, rule.delayType, parseInt(e.target.value) || 1)}
                            className="w-14 bg-stone-800 border border-stone-700 text-white rounded-lg px-2 py-1 text-[11px] text-center focus:outline-none focus:border-amber-400"
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10.5px] text-stone-500 pt-1 border-t border-stone-850">
                      <span>Modello: <b>{presets[rule.templateId]?.name || rule.templateId}</b></span>
                      <span>Eseguiti: <b>{rule.totalTriggered}</b></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Active Voucher Log Table */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-stone-200 flex items-center gap-2">
                <Gift className="w-4 h-4 text-purple-400" />
                <span>Registro Clienti con Voucher Assegnato al Tavolo ({voucherCustomers.length})</span>
              </h3>
              <span className="text-xs text-stone-500">Tracciamento automatico dai metadati ordine</span>
            </div>

            {voucherCustomers.length === 0 ? (
              <div className="py-12 text-center text-stone-500 text-xs">
                Nessun voucher generato finora. I clienti compariranno automaticamente al completamento degli ordini dal Dining Tablet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {voucherCustomers.map(vc => (
                  <div key={vc.email} className="p-3.5 bg-stone-950/70 border border-stone-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white truncate">{vc.name}</span>
                      <span className="bg-stone-800 text-stone-300 text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {vc.lang}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-400 truncate">
                      {vc.email}
                    </div>

                    <div className="p-2 bg-purple-950/40 border border-purple-500/30 rounded-xl flex items-center justify-between text-xs font-mono">
                      <span className="text-purple-300 font-bold">{vc.diningVoucher}</span>
                      <span className={vc.isDiningVoucherActive ? 'text-emerald-400 font-bold text-[10px]' : 'text-stone-500 text-[10px]'}>
                        {vc.isDiningVoucherActive ? '✓ Valido (10d)' : 'Scaduto'}
                      </span>
                    </div>

                    {vc.tableStation && (
                      <div className="text-[10px] text-stone-500 flex items-center gap-1 truncate">
                        <UtensilsCrossed className="w-3 h-3" />
                        <span>Origine: {vc.tableStation}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ── TAB 3: SPEDIZIONI & LOG STORICO ── */}
      {activeTab === 'history' && (
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 shadow-lg space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-stone-200 flex items-center gap-2">
              <History className="w-4 h-4 text-red-400" />
              <span>Registro Spedizioni & Log Campagne Inviate</span>
            </h3>
            <span className="text-xs text-stone-500">Ultime spedizioni registrate da Gmail SMTP</span>
          </div>

          {campaignHistory.length === 0 ? (
            <div className="py-16 text-center text-stone-500 space-y-2">
              <Mail className="w-8 h-8 mx-auto text-stone-600 opacity-50" />
              <p className="text-xs font-medium">Nessuna campagna manuale inviata finora in questa sessione.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {campaignHistory.map(entry => (
                <div key={entry.id} className="p-4 bg-stone-950/60 border border-stone-800/80 rounded-2xl space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-red-900/40 text-red-300 border border-red-500/40 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                        {entry.type === 'dining_automated_voucher' ? '⚡ AUTOMATICO (Tavolo)' : entry.type === 'scheduled_trigger' ? '📅 PROGRAMMATO' : '📢 BROADCAST MANUALE'}
                      </span>
                      <span className="font-bold text-xs text-white">{entry.subject}</span>
                      {entry.targetLang && (
                        <span className="bg-stone-800 text-stone-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {entry.targetLang}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-red-400" />
                        <b>{entry.count}</b> destinatari
                      </span>
                      <span className="flex items-center gap-1 text-stone-500">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(entry.timestamp).toLocaleString('it-IT')}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-stone-400 flex flex-wrap gap-1.5 pt-1 border-t border-stone-850">
                    <span className="text-stone-500 font-medium">Destinatari:</span>
                    {entry.recipients.slice(0, 8).map(r => (
                      <span key={r.email} className="bg-stone-850 text-stone-300 px-2 py-0.5 rounded text-[10px]">
                        {r.name} ({r.email}) {r.lang ? `[${r.lang}]` : ''}
                      </span>
                    ))}
                    {entry.recipients.length > 8 && (
                      <span className="text-stone-500 text-[10px] self-center">
                        +{entry.recipients.length - 8} altri...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Live Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-red-500" />
                <span>Anteprima Email [{activeComposerLang}]</span>
              </h3>
              <button
                onClick={() => setPreviewOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 text-stone-900 shadow-inner">
              <div className="bg-[#8B1E1E] p-4 text-center">
                <h1 className="text-white text-base font-black tracking-wider m-0">
                  🍕 FLOWER POWER PIZZA RANONG
                </h1>
              </div>
              <div className="p-6 text-xs leading-relaxed space-y-3 whitespace-pre-line font-sans text-stone-850">
                <div className="font-bold text-stone-700 border-b pb-2">
                  Oggetto: {currentTranslation.subject}
                </div>
                <div>
                  {currentTranslation.message.replace('{name}', 'Mario Rossi')}
                </div>
              </div>
              <div className="bg-stone-100 p-3 text-center text-[10px] text-stone-500 border-t border-stone-200">
                <p className="m-0 font-bold">Flower Power Pizza Ranong · Ranong, Thailand</p>
                <p className="m-0 text-[9px] mt-0.5">Ricevi questa email perché hai effettuato un ordine o richiesto un voucher presso la nostra pizzeria.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="py-2 px-5 bg-stone-800 hover:bg-stone-750 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Chiudi Anteprima
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
