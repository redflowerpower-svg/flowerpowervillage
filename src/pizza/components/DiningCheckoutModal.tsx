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
}

import { DINING_TABLES, formatTableStationName, getCanonicalTableKey, extractTableFromAddress } from '../utils/tableUtils';

const I18N_CHECKOUT = {
  IT: {
    modalTitle: 'Invia Ordine al Tavolo',
    privilegeBadge: '-5% SCONTO AL TAVOLO',
    tableSection: '1. Postazione Tavolo',
    customTableBtn: 'Inserimento libero',
    listTableBtn: 'Scegli da lista',
    customPlaceholder: 'es. Tavolo 7 / Terrazza / Bancone',
    clientSection: '2. Ricevi lo Sconto a Casa (Facoltativo)',
    nameLabel: 'Nome o Riferimento (Opzionale)',
    namePlaceholder: 'es. Marco (o lascia vuoto)',
    emailLabel: 'Email per Coupon Sconto 10% Delivery (Opzionale)',
    emailPlaceholder: 'tuaemail@esempio.com (opzionale)',
    emailHelper: "💡 L'email non è obbligatoria per ordinare: serve solo se desideri ricevere il Coupon Sconto 10% per i tuoi prossimi ordini da casa.",
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
    clientSection: '2. Get Home Delivery Discount Voucher (Optional)',
    nameLabel: 'Name / Nickname (Optional)',
    namePlaceholder: 'e.g. John (or leave empty)',
    emailLabel: 'Email for 10% Home Delivery Coupon (Optional)',
    emailPlaceholder: 'youremail@example.com (optional)',
    emailHelper: '💡 Email is not mandatory to order: it is only needed if you wish to receive the 10% home delivery discount voucher.',
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
    clientSection: '2. รับคูปองส่วนลดสั่งทานที่บ้าน (ไม่บังคับ)',
    nameLabel: 'ชื่อผู้สั่ง (ไม่บังคับ)',
    namePlaceholder: 'เช่น สมชาย (หรือเว้นว่างไว้)',
    emailLabel: 'อีเมลรับคูปองส่วนลด 10% สั่งเดลิเวอรี่ (ไม่บังคับ)',
    emailPlaceholder: 'yourname@example.com (เว้นว่างได้เลย)',
    emailHelper: '💡 ไม่จำเป็นต้องกรอกอีเมลเพื่อสั่งอาหาร: ใช้เฉพาะกรณีต้องการรับคูปองส่วนลด 10% สั่งทานที่บ้านเท่านั้น',
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
    clientSection: '2. Liefer-Rabattgutschein für zu Hause (Optional)',
    nameLabel: 'Name / Notiz (Optional)',
    namePlaceholder: 'z.B. Thomas (oder leer lassen)',
    emailLabel: 'E-Mail für 10% Liefer-Rabattgutschein (Freiwillig)',
    emailPlaceholder: 'ihre.email@beispiel.de (optional)',
    emailHelper: '💡 E-Mail ist nicht erforderlich: Sie wird nur benötigt, wenn Sie den 10% Liefergutschein für zu Hause erhalten möchten.',
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
    clientSection: '၂။ အိမ်အရောက်ပို့ လျှော့စျေးကူပွန် ရယူရန် (စိတ်ကြိုက်)',
    nameLabel: 'အမည် (စိတ်ကြိုက်)',
    namePlaceholder: 'ဥပမာ - မောင်မောင် (မဖြည့်လည်းရပါသည်)',
    emailLabel: 'အိမ်အရောက်ပို့ ၁၀% လျှော့စျေးကူပွန် ရယူရန် အီးမေးလ် (စိတ်ကြိုက်)',
    emailPlaceholder: 'youremail@example.com (မထည့်လည်း ရပါသည်)',
    emailHelper: '💡 အော်ဒါမှာရန် အီးမေးလ် မဖြစ်မနေ ထည့်ရန်မလိုပါ- အိမ်အရောက်ပို့ ၁၀% လျှော့စျေးကူပွန် ရယူလိုမှသာ ထည့်ပါ။',
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
  }
};

export const DiningCheckoutModal: React.FC<DiningCheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTable = 'Tavolo 1 (Interno)',
  lang = 'IT',
  existingOrderId = null
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

  // Always reset fields to 100% clean and empty when opening modal for any table
  useEffect(() => {
    if (isOpen) {
      setCustomerName('');
      setCustomerEmail('');
      setSpecialNotes('');
    }
  }, [isOpen, initialTable]);
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

      const formattedAddress = `[DINE-IN: ${activeTable}]` + 
        (lang ? ` [LANG: ${lang}]` : '') + 
        (customerEmail.trim() ? ` [EMAIL: ${customerEmail.trim()}]` : '') + 
        (specialNotes.trim() ? ` [NOTE: ${specialNotes.trim()}]` : '');

      const canonicalCurrentTable = getCanonicalTableKey(activeTable);

      const formattedItems = items.map(i => ({
        cartId: i.cartId,
        productId: i.productId,
        name: i.name,
        nameIt: i.nameIt,
        nameTh: i.nameTh,
        nameDe: i.nameDe,
        image: i.image || '',
        quantity: i.quantity,
        basePrice: i.basePrice,
        variant: i.selectedVariant?.name || null,
        extras: (i.selectedExtras || []).map(e => e.name),
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

      // 3. Primary: Serverless Backend API (service_role bypasses RLS and guaranteed atomic write/update)
      try {
        const res = await fetch('/api/pizza-order-submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: orderPayload, existingOrderId: activeExistingOrderId })
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

                {t.emailHelper && (
                  <p className="text-[10px] sm:text-[11px] text-stone-400 leading-snug bg-stone-900/60 p-2 rounded-xl border border-stone-800/80">
                    {t.emailHelper}
                  </p>
                )}
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
