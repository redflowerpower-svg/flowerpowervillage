import { X, Trash2, Plus, Minus, ShoppingBag, Phone, Sparkles } from 'lucide-react';
import { useCartStore, calcItemTotal } from '../store/cartStore';
import { fetchPizzeriaStatus, calculateServiceState, DEFAULT_PIZZERIA_STATUS } from '../services/pizzaServiceStatus';
import { checkFirstOrderEligibility, getOrCreateDeviceId } from '../services/firstOrderService';
import { withCacheBust } from '../utils/cacheBust';
import { useState, useEffect } from 'react';

interface Props {
  onCheckout: () => void;
  lang: 'IT' | 'EN' | 'TH' | 'DE';
}

const labels = {
  IT: {
    title: 'Il Tuo Ordine',
    emptyTitle: 'Il tuo carrello è vuoto',
    emptyDesc: 'Aggiungi le nostre specialità dal menu online',
    totalText: 'Totale Ordine',
    subtotalText: 'Subtotale',
    firstOrderDiscountText: 'Sconto 1° Ordine (10%)',
    deliveryText: 'Consegna',
    freeText: 'Gratis',
    freeDeliveryApplied: 'Consegna gratuita applicata! (Ordine > 300฿)',
    welcomeTitle: 'BENVENUTO! SCONTO 10% APPLICATO',
    welcomePromoDesc: 'Questa è la tua prima ordinazione: abbiamo applicato per te il 10% di sconto sui piatti!',
    youSaveText: (s: number) => `Risparmi ${s}฿`,
    checkoutBtn: 'Procedi al Checkout',
    ordersPausedBtn: 'Ordinazioni Momentaneamente Sospese',
    ordersClosedBtn: 'Pizzeria al momento Chiusa',
    callPizzeria: 'Chiama la Pizzeria (Ranong)',
    footerInfo: 'Pagamento tramite PromptPay / Carta • Consegna a Ranong',
  },
  EN: {
    title: 'Your Order',
    emptyTitle: 'Your cart is empty',
    emptyDesc: 'Add items from our online menu',
    totalText: 'Order Total',
    subtotalText: 'Subtotal',
    firstOrderDiscountText: '1st Order Discount (10%)',
    deliveryText: 'Delivery',
    freeText: 'Free',
    freeDeliveryApplied: 'Free delivery applied! (Order > 300฿)',
    welcomeTitle: 'WELCOME! 10% DISCOUNT UNLOCKED',
    welcomePromoDesc: 'This is your first order: 10% welcome discount has been applied to your food!',
    youSaveText: (s: number) => `You save ${s}฿`,
    checkoutBtn: 'Proceed to Checkout',
    ordersPausedBtn: 'Orders Temporarily Paused',
    ordersClosedBtn: 'Pizzeria Currently Closed',
    callPizzeria: 'Call Pizzeria (Ranong)',
    footerInfo: 'Payment via PromptPay / Card • Delivery in Ranong',
  },
  TH: {
    title: 'รายการของคุณ',
    emptyTitle: 'ไม่มีสินค้าในตะกร้า',
    emptyDesc: 'เพิ่มเมนูอร่อยจากเมนูออนไลน์ของเรา',
    totalText: 'ยอดรวมทั้งหมด',
    subtotalText: 'ยอดรวมสินค้า',
    firstOrderDiscountText: 'ส่วนลดสั่งครั้งแรก (10%)',
    deliveryText: 'ค่าจัดส่ง',
    freeText: 'ฟรี',
    freeDeliveryApplied: 'จัดส่งฟรี! (ยอดสั่งซื้อ > 300฿)',
    welcomeTitle: 'ยินดีต้อนรับ! รับส่วนลด 10% ทันที',
    welcomePromoDesc: 'นี่คือการสั่งซื้อครั้งแรกของคุณ: เรามอบส่วนลด 10% พิเศษสำหรับอาหารของคุณ!',
    youSaveText: (s: number) => `ประหยัด ${s}฿`,
    checkoutBtn: 'ดำเนินการชำระเงิน',
    ordersPausedBtn: 'ระงับการสั่งซื้อชั่วคราว',
    ordersClosedBtn: 'ร้านพิซซ่าปิดบริการในขณะนี้',
    callPizzeria: 'โทรหาร้านพิซซ่า (ระนอง)',
    footerInfo: 'ชำระเงินผ่าน พร้อมเพย์ / บัตรเครดิต • จัดส่งในตัวเมืองระนอง',
  },
  DE: {
    title: 'Ihre Bestellung',
    emptyTitle: 'Ihr Warenkorb ist leer',
    emptyDesc: 'Fügen Sie Spezialitäten aus unserer Online-Speisekarte hinzu',
    totalText: 'Gesamtsumme',
    subtotalText: 'Zwischensumme',
    firstOrderDiscountText: 'Erstbesteller-Rabatt (10%)',
    deliveryText: 'Lieferung',
    freeText: 'Gratis',
    freeDeliveryApplied: 'Kostenlose Lieferung angewendet! (Bestellung > 300฿)',
    welcomeTitle: 'WILLKOMMEN! 10% RABATT AKTIVIERT',
    welcomePromoDesc: 'Dies ist Ihre erste Bestellung: 10% Willkommensrabatt auf Ihre Speisen aktiviert!',
    youSaveText: (s: number) => `Sie sparen ${s}฿`,
    checkoutBtn: 'Zur Kasse gehen',
    ordersPausedBtn: 'Bestellungen vorübergehend pausiert',
    ordersClosedBtn: 'Pizzeria derzeit geschlossen',
    callPizzeria: 'Pizzeria anrufen (Ranong)',
    footerInfo: 'Zahlung per PromptPay / Karte • Lieferung in Ranong',
  },
};

export default function CartDrawer({ onCheckout, lang }: Props) {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal } = useCartStore();
  const subtotal = getTotal();
  const [isEligible, setIsEligible] = useState(true);
  const [isHotelGuest, setIsHotelGuest] = useState(false);

  // Check first order eligibility based on device ID and saved phone
  useEffect(() => {
    let active = true;
    const deviceId = getOrCreateDeviceId();
    let savedPhone = '';
    try { savedPhone = localStorage.getItem('fp_pizza_customer_phone') || ''; } catch {}
    let savedEmail = '';
    try { savedEmail = localStorage.getItem('fp_pizza_customer_email') || ''; } catch {}

    checkFirstOrderEligibility({ phone: savedPhone, email: savedEmail, deviceId }).then((res) => {
      if (active) {
        setIsEligible(res.eligible);
        setIsHotelGuest(res.isHotelGuest);
      }
    });

    return () => { active = false; };
  }, [isOpen]);

  const discountAmount = isEligible ? Math.round(subtotal * 0.1) : 0;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const deliveryFee = subtotal >= 300 ? 0 : 30;
  const finalTotal = subtotalAfterDiscount + deliveryFee;
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

  const getTranslatedName = (o: { name: string; nameTh?: string; nameIt?: string; nameDe?: string }) => {
    if (lang === 'TH' && o.nameTh) return o.nameTh;
    if (lang === 'IT' && o.nameIt) return o.nameIt;
    if (lang === 'DE' && o.nameDe) return o.nameDe;
    return o.name;
  };

  const formatProductName = (name: string) => {
    if (!name) return "";
    const splitKeywords = [' WITH ', ' CON ', ' พร้อม', ' MIT '];
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
        className="fixed top-0 right-0 h-full z-50 flex flex-col w-full max-w-[420px] bg-stone-50 border-l border-stone-300 shadow-2xl transition-transform duration-300 ease-out"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* DRAWER HEADER */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-stone-200 bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-[#8B1E1E]" />
            <span className="text-stone-850 text-xs sm:text-sm font-bold tracking-widest uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
              {t.title}
            </span>
            {items.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#8B1E1E] flex items-center justify-center text-white text-[10px] font-extrabold ml-1">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-705 hover:bg-stone-100 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* DRAWER CONTENT */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-24 px-4">
              <ShoppingBag size={44} className="text-stone-300 mx-auto mb-4" />
              <p className="text-stone-600 text-sm font-semibold">{t.emptyTitle}</p>
              <p className="text-stone-400 text-xs mt-1">{t.emptyDesc}</p>
            </div>
          ) : (
            items.map((item) => {
              const lineTotal = calcItemTotal(item);
              return (
                <div key={item.cartId} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex gap-3">
                    <img src={withCacheBust(item.image)} alt={getTranslatedName(item)} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-stone-850 font-bold text-sm leading-snug" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.05rem' }}>
                            {formatProductName(getTranslatedName(item))}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.cartId)}
                          className="text-stone-400 hover:text-[#8B1E1E] transition-colors flex-shrink-0 p-1 hover:bg-stone-50 rounded cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {item.selectedVariant && (
                        <p className="text-stone-500 text-xs mt-1.5 font-medium">
                          Size: {getTranslatedName(item.selectedVariant)}
                          {item.selectedVariant.priceModifier > 0 && (
                            <span className="ml-1 inline-flex items-baseline gap-0.5">
                              <span>(+{item.selectedVariant.priceModifier}</span>
                              <span className="font-black select-none text-stone-500 text-[10px]" style={{ fontFamily: 'Prompt, Kanit, IBM Plex Sans Thai, system-ui, sans-serif' }}>฿</span>
                              <span>)</span>
                            </span>
                          )}
                        </p>
                      )}

                      {item.selectedExtras.length > 0 && (
                        <div className="mt-1.5 space-y-0.5">
                          {item.selectedExtras.map((e) => (
                            <p key={e.id} className="text-stone-400 text-xs font-normal">
                              + {getTranslatedName(e)} {e.price > 0 && (
                                <span className="inline-flex items-baseline gap-0.5 ml-1">
                                  <span>(+{e.price}</span>
                                  <span className="font-black select-none text-stone-400 text-[10px]" style={{ fontFamily: 'Prompt, Kanit, IBM Plex Sans Thai, system-ui, sans-serif' }}>฿</span>
                                  <span>)</span>
                                </span>
                              )}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Lasagna pre-order date badge */}
                      {item.lasagnaDate && (
                        <div className="mt-2 inline-flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                          <span className="text-amber-700 text-[10px] font-bold">
                            📅 {item.lasagnaDate}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-stone-100">
                        {/* Quantity selector */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                            className="w-6.5 h-6.5 rounded-full border border-stone-300 bg-white flex items-center justify-center text-stone-500 hover:border-[#8B1E1E] hover:text-[#8B1E1E] hover:bg-[#8B1E1E]/5 active:scale-95 transition-all cursor-pointer"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="text-stone-850 font-bold text-xs w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                            className="w-6.5 h-6.5 rounded-full border border-stone-300 bg-white flex items-center justify-center text-stone-500 hover:border-[#8B1E1E] hover:text-[#8B1E1E] hover:bg-[#8B1E1E]/5 active:scale-95 transition-all cursor-pointer"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                        <p className="text-[#8B1E1E] font-extrabold text-sm inline-flex items-baseline gap-0.5">
                          <span>{lineTotal}</span>
                          <span className="font-black select-none text-[#8B1E1E] text-xs" style={{ fontFamily: 'Prompt, Kanit, IBM Plex Sans Thai, system-ui, sans-serif' }}>฿</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* DRAWER FOOTER */}
        {items.length > 0 && (
          <div className="border-t border-stone-200 px-5 py-5 space-y-4 bg-white">
            
            {/* Promotional Welcome First-Order Banner */}
            {isEligible && (
              <div className="bg-gradient-to-r from-emerald-50 via-amber-50 to-emerald-50 border-2 border-emerald-400/40 rounded-2xl p-3 flex items-start gap-2.5 shadow-sm animate-fadeIn">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs text-sm font-black">
                  10%
                </div>
                <div className="text-[11px] leading-snug flex-1">
                  <p className="font-black text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                    <span>{t.welcomeTitle}</span>
                  </p>
                  <p className="text-stone-700 font-medium mt-0.5">{t.welcomePromoDesc}</p>
                </div>
              </div>
            )}

            <div className="space-y-1.5 text-stone-600 text-xs" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
              <div className="flex justify-between items-center">
                <span>{t.subtotalText}</span>
                <span className="font-semibold inline-flex items-baseline gap-0.5">
                  <span>{subtotal}</span>
                  <span className="font-black select-none text-stone-700 text-xs" style={{ fontFamily: 'Prompt, Kanit, IBM Plex Sans Thai, system-ui, sans-serif' }}>฿</span>
                </span>
              </div>

              {isEligible && discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-700 font-bold animate-fadeIn">
                  <span className="flex items-center gap-1">
                    <Sparkles size={13} className="text-amber-500 animate-pulse" />
                    <span>{t.firstOrderDiscountText}</span>
                  </span>
                  <span className="font-black inline-flex items-baseline gap-0.5 text-emerald-700">
                    <span>-{discountAmount}</span>
                    <span className="font-black select-none text-xs" style={{ fontFamily: 'Prompt, Kanit, IBM Plex Sans Thai, system-ui, sans-serif' }}>฿</span>
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span>{t.deliveryText}</span>
                <span className="font-semibold">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-extrabold">{t.freeText}</span>
                  ) : (
                    <span className="inline-flex items-baseline gap-0.5">
                      <span>{deliveryFee}</span>
                      <span className="font-black select-none text-stone-700 text-xs" style={{ fontFamily: 'Prompt, Kanit, IBM Plex Sans Thai, system-ui, sans-serif' }}>฿</span>
                    </span>
                  )}
                </span>
              </div>
            </div>

            {deliveryFee === 0 && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] py-1.5 px-3 rounded-xl font-extrabold flex items-center gap-1.5 animate-fadeIn" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>{t.freeDeliveryApplied}</span>
              </div>
            )}

            <div className="flex justify-between items-center gap-2 border-t border-stone-100 pt-3">
              <div>
                <span className="text-stone-500 text-xs uppercase tracking-widest block font-bold" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                  {t.totalText}
                </span>
                {isEligible && discountAmount > 0 && (
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full inline-block mt-0.5">
                    {t.youSaveText(discountAmount)}
                  </span>
                )}
              </div>
              <div className="text-right">
                {isEligible && discountAmount > 0 && (
                  <span className="text-stone-400 line-through text-xs mr-2 font-medium">
                    {subtotal + deliveryFee}฿
                  </span>
                )}
                <span className="text-[#8B1E1E] text-xl font-black inline-flex items-baseline gap-1" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                  <span>{finalTotal}</span>
                  <span className="font-black select-none text-[#8B1E1E] text-base" style={{ fontFamily: 'Prompt, Kanit, IBM Plex Sans Thai, system-ui, sans-serif' }}>฿</span>
                </span>
              </div>
            </div>
            
            {serviceCalc.canOrder ? (
              <button
                onClick={() => { closeCart(); onCheckout(); }}
                className="w-full py-3.5 bg-[#8B1E1E] hover:bg-[#721818] text-white text-xs tracking-widest uppercase font-bold rounded-full transition-all shadow-md hover:shadow-lg cursor-pointer duration-200 transform active:scale-[0.98]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {t.checkoutBtn}
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  disabled
                  className="w-full py-3.5 bg-stone-300 text-stone-600 text-xs tracking-widest uppercase font-bold rounded-full cursor-not-allowed border border-stone-300 shadow-sm"
                  style={{ fontFamily: 'Inter, sans-serif' }}
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
    </>
  );
}
