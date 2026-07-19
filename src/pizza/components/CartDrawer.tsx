import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCartStore, calcItemTotal } from '../store/cartStore';

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
    deliveryText: 'Consegna',
    freeText: 'Gratis',
    freeDeliveryApplied: 'Consegna gratuita applicata! (Ordine > 200฿)',
    checkoutBtn: 'Procedi al Checkout',
    footerInfo: 'Pagamento tramite PromptPay • Carica screenshot di conferma',
  },
  EN: {
    title: 'Your Order',
    emptyTitle: 'Your cart is empty',
    emptyDesc: 'Add items from our online menu',
    totalText: 'Order Total',
    subtotalText: 'Subtotal',
    deliveryText: 'Delivery',
    freeText: 'Free',
    freeDeliveryApplied: 'Free delivery applied! (Order > 200฿)',
    checkoutBtn: 'Proceed to Checkout',
    footerInfo: 'Payment via PromptPay • Upload confirmation screenshot',
  },
  TH: {
    title: 'รายการของคุณ',
    emptyTitle: 'ไม่มีสินค้าในตะกร้า',
    emptyDesc: 'เพิ่มเมนูอร่อยจากเมนูออนไลน์ของเรา',
    totalText: 'ยอดรวมทั้งหมด',
    subtotalText: 'ยอดรวมสินค้า',
    deliveryText: 'ค่าจัดส่ง',
    freeText: 'ฟรี',
    freeDeliveryApplied: 'จัดส่งฟรี! (ยอดสั่งซื้อ > 200฿)',
    checkoutBtn: 'ดำเนินการชำระเงิน',
    footerInfo: 'ชำระเงินผ่าน PromptPay • โปรดอัปโหลดภาพหน้าจอเพื่อยืนยัน',
  },
  DE: {
    title: 'Ihre Bestellung',
    emptyTitle: 'Ihr Warenkorb ist leer',
    emptyDesc: 'Fügen Sie Spezialitäten aus unserer Online-Speisekarte hinzu',
    totalText: 'Gesamtsumme',
    subtotalText: 'Zwischensumme',
    deliveryText: 'Lieferung',
    freeText: 'Gratis',
    freeDeliveryApplied: 'Kostenlose Lieferung angewendet! (Bestellung > 200฿)',
    checkoutBtn: 'Zur Kasse gehen',
    footerInfo: 'Zahlung per PromptPay • Quittungs-Screenshot hochladen',
  },
};

export default function CartDrawer({ onCheckout, lang }: Props) {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal } = useCartStore();
  const total = getTotal();
  const deliveryFee = total >= 200 ? 0 : 30;
  const finalTotal = total + deliveryFee;
  const t = labels[lang];

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
                    <img src={item.image} alt={getTranslatedName(item)} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
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
                          {item.selectedVariant.priceModifier > 0 && ` (+${item.selectedVariant.priceModifier} ฿)`}
                        </p>
                      )}

                      {item.selectedExtras.length > 0 && (
                        <div className="mt-1.5 space-y-0.5">
                          {item.selectedExtras.map((e) => (
                            <p key={e.id} className="text-stone-400 text-xs font-normal">
                              + {getTranslatedName(e)} {e.price > 0 ? `(+${e.price} ฿)` : ''}
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
                        <p className="text-[#8B1E1E] font-extrabold text-sm">{lineTotal} ฿</p>
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
            <div className="space-y-1.5 text-stone-600 text-xs" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
              <div className="flex justify-between items-center">
                <span>{t.subtotalText}</span>
                <span className="font-semibold">{total} ฿</span>
              </div>
              <div className="flex justify-between items-center">
                <span>{t.deliveryText}</span>
                <span className="font-semibold">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-extrabold">{t.freeText}</span>
                  ) : (
                    `${deliveryFee} ฿`
                  )}
                </span>
              </div>
            </div>

            {deliveryFee === 0 && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] py-2 px-3 rounded-xl font-extrabold flex items-center gap-1.5 animate-fadeIn" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>{t.freeDeliveryApplied}</span>
              </div>
            )}

            <div className="flex justify-between items-center gap-2 border-t border-stone-100 pt-3">
              <span className="text-stone-500 text-xs uppercase tracking-widest flex-shrink-0 font-bold" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                {t.totalText}
              </span>
              <span className="text-[#8B1E1E] text-xl font-black text-right" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                {finalTotal} ฿
              </span>
            </div>
            
            <button
              onClick={() => { closeCart(); onCheckout(); }}
              className="w-full py-3.5 bg-[#8B1E1E] hover:bg-[#721818] text-white text-xs tracking-widest uppercase font-bold rounded-full transition-all shadow-md hover:shadow-lg cursor-pointer duration-200 transform active:scale-[0.98]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {t.checkoutBtn}
            </button>
            <p className="text-center text-stone-400 text-[10px] leading-relaxed">
              {t.footerInfo}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
