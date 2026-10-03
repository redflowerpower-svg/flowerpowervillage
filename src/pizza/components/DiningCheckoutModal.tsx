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
  Info
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
}

import { DINING_TABLES, formatTableStationName } from '../utils/tableUtils';

const I18N_CHECKOUT = {
  IT: {
    modalTitle: 'Invia Ordine al Tavolo',
    privilegeBadge: '-5% SCONTO AL TAVOLO',
    tableSection: '1. Postazione Tavolo',
    customTableBtn: 'Inserimento libero',
    listTableBtn: 'Scegli da lista',
    customPlaceholder: 'es. Tavolo 7 / Terrazza / Bancone',
    clientSection: '2. Dati Cliente (Per Sconto & Coupon)',
    nameLabel: 'Nome e Cognome *',
    namePlaceholder: 'es. Marco Rossi',
    phoneLabel: 'Telefono / WhatsApp *',
    phonePlaceholder: 'es. 0812345678 / +39...',
    emailLabel: 'Email (per coupon 10% da usare per ordini a domicilio)',
    emailPlaceholder: 'tuaemail@esempio.com',
    notesLabel: 'Note Speciali per la Cucina / Camerieri (Opzionale)',
    notesPlaceholder: 'es. Portare le pizze insieme, bicchieri extra...',
    paymentSection: '3. Scelta Modalità di Pagamento',
    payPromptPay: 'PromptPay K-Shop',
    payCard: 'Carta / POS al Tavolo',
    payCash: 'Contanti al Tavolo',
    kshopTitle: 'K-Shop Kasikorn Bank (0% Commissioni)',
    kshopDesc: 'Inquadra il QR Code ufficiale Kasikorn Bank con qualsiasi app bancaria thailandese (K PLUS, SCB, Bangkok Bank, Krungthai, ecc.).',
    kshopZoom: 'Tocca l\'immagine per ingrandire il QR Code',
    cardTitle: 'Terminale POS Portatile al Tavolo',
    cardDesc: 'Il personale porterà il POS direttamente al tavolo per pagamento con carta Contactless, Chip o Apple Pay.',
    cashTitle: 'Pagamento in Contanti',
    cashDesc: 'Puoi pagare comodamente in contanti direttamente al cameriere quando ti viene servito l\'ordine.',
    subtotalLabel: 'Totale Prodotti',
    discountLabel: 'Sconto Dining Privilege (-5%)',
    finalTotalLabel: 'Totale Conto Finale',
    submitBtn: 'Invia Ordine in Cucina (-5%)',
    submittingBtn: 'Invio ordine in corso...',
    successTitle: 'Ordine Inviato in Cucina!',
    successSubtitle: 'I tuoi piatti e le tue pizze vengono preparati al momento.',
    giftTitle: 'Regalo Speciale Delivery per Te!',
    giftDesc: 'Grazie per aver ordinato al tavolo! Riceverai via WhatsApp/Email il tuo Coupon Sconto del 10% per il tuo prossimo ordine a domicilio su flowerpowerpizza.com.',
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
    clientSection: '2. Guest Details (For Discount & Gift Voucher)',
    nameLabel: 'Full Name *',
    namePlaceholder: 'e.g. John Smith',
    phoneLabel: 'Phone / WhatsApp *',
    phonePlaceholder: 'e.g. 0812345678 / +1...',
    emailLabel: 'Email (to receive 10% delivery discount coupon)',
    emailPlaceholder: 'youremail@example.com',
    notesLabel: 'Special Kitchen / Server Notes (Optional)',
    notesPlaceholder: 'e.g. Serve pizzas together, extra glasses...',
    paymentSection: '3. Payment Method at Table',
    payPromptPay: 'PromptPay K-Shop',
    payCard: 'Card / Mobile POS',
    payCash: 'Cash at Table',
    kshopTitle: 'K-Shop Kasikorn Bank (0% Commission)',
    kshopDesc: 'Scan the official Kasikorn Bank QR Code with any Thai mobile banking app (K PLUS, SCB Easy, Bangkok Bank, Krungthai, etc.).',
    kshopZoom: 'Tap image to zoom in QR Code',
    cardTitle: 'Portable POS Terminal at Table',
    cardDesc: 'Staff will bring the mobile POS terminal to your table for contactless, chip card, or Apple Pay settlement.',
    cashTitle: 'Cash Settlement at Table',
    cashDesc: 'Pay easily with cash directly to our service staff at your table.',
    subtotalLabel: 'Products Total',
    discountLabel: 'Dining Privilege (-5%)',
    finalTotalLabel: 'Final Total Bill',
    submitBtn: 'Send Order to Kitchen (-5%)',
    submittingBtn: 'Sending order...',
    successTitle: 'Order Sent to Kitchen!',
    successSubtitle: 'Your dishes and authentic pizzas are now being freshly prepared.',
    giftTitle: 'Special Delivery Gift for You!',
    giftDesc: 'Thank you for ordering at our table! You will receive a 10% discount voucher for your next home delivery on flowerpowerpizza.com.',
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
    clientSection: '2. ข้อมูลลูกค้า (สำหรับรับสิทธิ์และคูปอง)',
    nameLabel: 'ชื่อ - นามสกุล *',
    namePlaceholder: 'เช่น สมชาย ใจดี',
    phoneLabel: 'เบอร์โทรศัพท์ / WhatsApp *',
    phonePlaceholder: 'เช่น 0812345678',
    emailLabel: 'อีเมล (เพื่อรับคูปองส่วนลด 10% สั่งเดลิเวอรี่กลับบ้าน)',
    emailPlaceholder: 'yourname@example.com',
    notesLabel: 'หมายเหตุถึงเชฟและพนักงาน (ถ้ามี)',
    notesPlaceholder: 'เช่น เสิร์ฟพร้อมกัน, แก้วน้ำเพิ่ม...',
    paymentSection: '3. เลือกวิธีชำระเงินที่โต๊ะ',
    payPromptPay: 'พร้อมเพย์ K-Shop',
    payCard: 'บัตรเครดิต / รูดบัตรที่โต๊ะ',
    payCash: 'เงินสดที่โต๊ะ',
    kshopTitle: 'K-Shop ธนาคารกสิกรไทย (ไม่มีค่าธรรมเนียม 0%)',
    kshopDesc: 'สแกนคิวอาร์โค้ด K-Shop กสิกรไทย ผ่านแอปธนาคารไทยได้ทุกธนาคาร (K PLUS, SCB, กรุงไทย, กรุงเทพ ฯลฯ)',
    kshopZoom: 'แตะที่รูปภาพเพื่อขยายดู QR Code',
    cardTitle: 'ชำระด้วยบัตรผ่านเครื่องรูดบัตรพกพาที่โต๊ะ',
    cardDesc: 'พนักงานจะนำเครื่องรูดบัตร (POS EDC) มาให้ท่านแตะหรือเสียบบัตรที่โต๊ะอย่างสะดวกสบาย',
    cashTitle: 'ชำระเงินสดที่โต๊ะ',
    cashDesc: 'ชำระเป็นเงินสดกับพนักงานเมื่อเสิร์ฟอาหารหรือเมื่อรับประทานเสร็จสิ้น',
    subtotalLabel: 'ยอดรวมอาหาร',
    discountLabel: 'ส่วนลด Dining Privilege (-5%)',
    finalTotalLabel: 'ยอดสุทธิที่ต้องชำระ',
    submitBtn: 'ยืนยันส่งออเดอร์เข้าครัว (-5%)',
    submittingBtn: 'กำลังส่งรายการ...',
    successTitle: 'ส่งออเดอร์เข้าครัวเรียบร้อยแล้ว!',
    successSubtitle: 'เชฟกำลังปรุงอาหารและอบพิซซ่าสดใหม่ให้คุณ',
    giftTitle: 'ของขวัญพิเศษสำหรับคุณ!',
    giftDesc: 'ขอบคุณที่สั่งอาหารที่โต๊ะ! คุณจะได้รับคูปองส่วนลด 10% สำหรับสั่งเดลิเวอรี่ส่งถึงบ้านผ่าน flowerpowerpizza.com',
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
    clientSection: '2. Kundendaten (für Rabatt & Gutschein)',
    nameLabel: 'Vor- und Nachname *',
    namePlaceholder: 'z.B. Thomas Müller',
    phoneLabel: 'Telefon / WhatsApp *',
    phonePlaceholder: 'z.B. 0812345678 / +49...',
    emailLabel: 'E-Mail (für 10% Rabattgutschein für Lieferungen)',
    emailPlaceholder: 'ihre.email@beispiel.de',
    notesLabel: 'Sonderwünsche an Küche / Service (Optional)',
    notesPlaceholder: 'z.B. Pizzen zusammen servieren, extra Gläser...',
    paymentSection: '3. Zahlungsmethode am Tisch',
    payPromptPay: 'PromptPay K-Shop',
    payCard: 'Karte / Mobiles POS',
    payCash: 'Bargeld am Tisch',
    kshopTitle: 'K-Shop Kasikorn Bank (0% Gebühren)',
    kshopDesc: 'Scannen Sie den Kasikorn PromptPay QR-Code mit jeder thailändischen Banking-App (K PLUS, SCB usw.).',
    kshopZoom: 'Tippen Sie zum Vergrößern auf das Bild',
    cardTitle: 'Mobiles Kartenterminal am Tisch',
    cardDesc: 'Unser Servicepersonal bringt das tragbare POS-Terminal für Kartenzahlung (Kontaktlos/Chip) an Ihren Tisch.',
    cashTitle: 'Barzahlung am Tisch',
    cashDesc: 'Zahlen Sie bequem in bar direkt bei der Bedienung an Ihrem Tisch.',
    subtotalLabel: 'Zwischensumme',
    discountLabel: 'Tisch-Rabatt (-5%)',
    finalTotalLabel: 'Gesamtsumme',
    submitBtn: 'Bestellung in die Küche senden (-5%)',
    submittingBtn: 'Wird gesendet...',
    successTitle: 'Bestellung an die Küche übermittelt!',
    successSubtitle: 'Ihre Gerichte und frischen Pizzen werden jetzt frisch zubereitet.',
    giftTitle: 'Liefer-Gutschein für Sie!',
    giftDesc: 'Vielen Dank für Ihre Tischbestellung! Sie erhalten per WhatsApp/E-Mail einen 10% Rabattgutschein für flowerpowerpizza.com.',
    summaryPill: 'Endbetrag am Tisch (-5% angewendet):',
    finishBtn: 'Zurück zur Speisekarte'
  }
};

export const DiningCheckoutModal: React.FC<DiningCheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTable = 'Tavolo 1 (Interno)',
  lang = 'IT'
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
  
  const [customerName, setCustomerName] = useState(() => {
    try { return localStorage.getItem('fp_last_dining_customer_name') || ''; } catch { return ''; }
  });
  const [customerPhone, setCustomerPhone] = useState(() => {
    try { return localStorage.getItem('fp_last_dining_customer_phone') || ''; } catch { return ''; }
  });
  const [customerEmail, setCustomerEmail] = useState(() => {
    try { return localStorage.getItem('fp_last_dining_customer_email') || ''; } catch { return ''; }
  });
  const [specialNotes, setSpecialNotes] = useState('');
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
    if (!isSuccess) return;
    const timer = setTimeout(() => {
      handleFinish();
    }, 4000);
    return () => clearTimeout(timer);
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
    if (!customerName || !customerPhone) return;

    setLoading(true);

    const paymentLabel = paymentMethod === 'promptpay' ? 'promptpay_kshop_at_table' : paymentMethod === 'card' ? 'card_pos_at_table' : 'cash_at_table';

    const formattedAddress = `[DINE-IN: ${activeTable}]` + 
      (lang ? ` [LANG: ${lang}]` : '') + 
      (customerEmail.trim() ? ` [EMAIL: ${customerEmail.trim()}]` : '') + 
      (specialNotes.trim() ? ` [NOTE: ${specialNotes.trim()}]` : '');

    const orderPayload = {
      customer_name: customerName.trim(),
      phone: customerPhone.trim(),
      address: formattedAddress,
      items: items.map(i => ({
        cartId: i.cartId,
        productId: i.productId,
        name: i.name,
        nameIt: i.nameIt,
        nameTh: i.nameTh,
        nameDe: i.nameDe,
        quantity: i.quantity,
        basePrice: i.basePrice,
        variant: i.selectedVariant?.name || null,
        extras: (i.selectedExtras || []).map(e => e.name),
        total: calcItemTotal(i)
      })),
      total: finalTotal,
      payment_method: paymentLabel,
      status: 'new',
      has_whatsapp: true,
      has_line: false,
      created_at: new Date().toISOString()
    };

    let savedOrder: any = null;

    try {
      const { data: inserted, error } = await supabase
        .from('pizza_orders')
        .insert([orderPayload])
        .select();

      if (error) {
        console.error('Supabase order insert error:', error);
        savedOrder = { id: `dine-${Date.now().toString().slice(-6)}`, ...orderPayload };
      } else if (inserted && inserted[0]) {
        savedOrder = inserted[0];
      }
    } catch (err) {
      console.error('Fallback order payload:', err);
      savedOrder = { id: `dine-${Date.now().toString().slice(-6)}`, ...orderPayload };
    }

    if (savedOrder) {
      const ordId = String(savedOrder.id);
      setCreatedOrderId(ordId);

      // Save customer contact in local storage for remarketing
      try {
        localStorage.setItem('fp_last_dining_customer_name', customerName);
        localStorage.setItem('fp_last_dining_customer_phone', customerPhone);
        if (customerEmail) localStorage.setItem('fp_last_dining_customer_email', customerEmail);
      } catch {}

      // Broadcast to Kitchen Display System (KDS)
      try {
        const ch = new BroadcastChannel('pizza_orders_channel');
        ch.postMessage({ type: 'NEW_ORDER', order: savedOrder });
        ch.close();
      } catch {}

      try {
        const chFP = new BroadcastChannel('flower_power_orders_channel');
        chFP.postMessage({ type: 'NEW_ORDER', order: savedOrder });
        chFP.close();
      } catch {}

      // Trigger Telegram notification
      try {
        fetch('/api/telegram-notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: ordId })
        }).catch(e => console.warn('Telegram notify error:', e));
      } catch {}

      clearCart();
      setIsSuccess(true);
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

              {/* 2. Customer Contact (Lead Gen) */}
              <div className="p-3.5 bg-stone-950/70 border border-stone-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                  <User className="w-3.5 h-3.5" />
                  <span>{t.clientSection}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10.5px] text-stone-400 font-bold block">{t.nameLabel}</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={t.namePlaceholder}
                      className="w-full bg-stone-900 border border-stone-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] text-stone-400 font-bold block">{t.phoneLabel}</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder={t.phonePlaceholder}
                      className="w-full bg-stone-900 border border-stone-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10.5px] text-stone-400 font-bold block">
                    {t.emailLabel}
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full bg-stone-900 border border-stone-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                  />
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

              {/* 4. Payment Preference (Kasikorn PromptPay 0%, Card POS, Cash) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                  {t.paymentSection}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('promptpay')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'promptpay'
                        ? 'bg-amber-400 text-stone-950 border-amber-300 font-bold shadow-md ring-2 ring-amber-300/60'
                        : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-wider text-center font-black">{t.payPromptPay}</span>
                    <span className={`text-[8.5px] px-1 py-0.2 rounded font-black ${paymentMethod === 'promptpay' ? 'bg-stone-900 text-emerald-300' : 'bg-emerald-950/80 text-emerald-400'}`}>
                      0% COMM.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'bg-amber-400 text-stone-950 border-amber-300 font-bold shadow-md ring-2 ring-amber-300/60'
                        : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-wider text-center font-black">{t.payCard}</span>
                    <span className={`text-[8.5px] px-1 py-0.2 rounded font-bold ${paymentMethod === 'card' ? 'bg-stone-900 text-amber-300' : 'bg-stone-900 text-stone-400'}`}>
                      POS MOBILE
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'cash'
                        ? 'bg-amber-400 text-stone-950 border-amber-300 font-bold shadow-md ring-2 ring-amber-300/60'
                        : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-wider text-center font-black">{t.payCash}</span>
                    <span className={`text-[8.5px] px-1 py-0.2 rounded font-bold ${paymentMethod === 'cash' ? 'bg-stone-900 text-amber-300' : 'bg-stone-900 text-stone-400'}`}>
                      CONTANTI
                    </span>
                  </button>
                </div>

                {/* Detailed Payment Explainer Box */}
                {paymentMethod === 'promptpay' && (
                  <div className="p-3.5 bg-gradient-to-br from-emerald-950/30 to-stone-950 border border-emerald-500/40 rounded-2xl space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-black text-emerald-300">{t.kshopTitle}</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                        Zero Commissioni
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-300 leading-relaxed">
                      {t.kshopDesc}
                    </p>

                    {/* K-Shop QR Preview Box with Tap-to-Zoom */}
                    <div className="flex items-center gap-3 p-2 bg-white rounded-xl text-stone-900 shadow-md">
                      <div 
                        onClick={() => setIsQrZoomOpen(true)}
                        className="relative w-20 h-20 shrink-0 bg-stone-100 rounded-lg overflow-hidden border border-stone-300 cursor-pointer group"
                      >
                        <img 
                          src={QR_KSHOP_URL} 
                          alt="Kasikorn Bank K-Shop PromptPay QR" 
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ZoomIn className="w-5 h-5 text-white drop-shadow" />
                        </div>
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="text-xs font-black text-stone-900 leading-tight">
                          Flower Power Pizza Ranong
                        </div>
                        <div className="text-[10.5px] text-stone-600">
                          Kasikorn Bank K-Shop Official QR
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsQrZoomOpen(true)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                        >
                          <ZoomIn className="w-3 h-3" />
                          <span>{t.kshopZoom}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="p-3.5 bg-stone-950 border border-amber-400/30 rounded-2xl space-y-1.5 animate-fadeIn">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-300">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span>{t.cardTitle}</span>
                    </div>
                    <p className="text-[11px] text-stone-300 leading-relaxed">
                      {t.cardDesc}
                    </p>
                  </div>
                )}

                {paymentMethod === 'cash' && (
                  <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-2xl space-y-1.5 animate-fadeIn">
                    <div className="flex items-center gap-2 text-xs font-black text-stone-200">
                      <Banknote className="w-4 h-4 text-amber-400" />
                      <span>{t.cashTitle}</span>
                    </div>
                    <p className="text-[11px] text-stone-300 leading-relaxed">
                      {t.cashDesc}
                    </p>
                  </div>
                )}
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
                disabled={loading || !customerName || !customerPhone}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.submittingBtn}</span>
                  </>
                ) : (
                  <>
                    <UtensilsCrossed className="w-4 h-4" />
                    <span>{t.submitBtn}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* QR ZOOM LIGHTBOX MODAL */}
      {isQrZoomOpen && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsQrZoomOpen(false)}
        >
          <div 
            className="relative bg-white rounded-3xl p-4 sm:p-6 max-w-sm w-full text-stone-900 shadow-2xl text-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsQrZoomOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white mx-auto flex items-center justify-center shadow">
              <QrCode size={20} />
            </div>

            <h4 className="font-black text-base text-stone-900 leading-tight">
              K-Shop Kasikorn Bank PromptPay
            </h4>
            <p className="text-xs text-stone-600">
              Flower Power Pizza Ranong (0% Commissioni)
            </p>

            <div className="bg-stone-50 border-2 border-dashed border-emerald-500 rounded-2xl p-3 flex justify-center">
              <img 
                src={QR_KSHOP_URL} 
                alt="Kasikorn Bank K-Shop PromptPay QR HD" 
                className="w-56 h-56 object-contain rounded-xl shadow-sm"
              />
            </div>

            <div className="text-xs font-bold text-emerald-800 bg-emerald-50 rounded-xl p-2.5">
              Totale da Inviare: <span className="text-base font-black text-emerald-950">{finalTotal} ฿</span>
            </div>

            <button
              type="button"
              onClick={() => setIsQrZoomOpen(false)}
              className="w-full py-2.5 bg-stone-900 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-stone-800"
            >
              Chiudi Anteprima QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
