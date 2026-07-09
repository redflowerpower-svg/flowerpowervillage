import { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import type { MenuItem, ExtraOption, Variant } from '../data/menuData';
import { useCartStore } from '../store/cartStore';

interface Props {
  item: MenuItem;
  onClose: () => void;
  lang: 'IT' | 'EN' | 'TH' | 'DE';
}

const labels = {
  IT: {
    sizeTitle: 'Taglia',
    extraTitle: 'Ingredienti Extra',
    addText: 'Aggiungi',
    freeText: 'Gratis',
  },
  EN: {
    sizeTitle: 'Size',
    extraTitle: 'Extra Ingredients',
    addText: 'Add',
    freeText: 'Free',
  },
  TH: {
    sizeTitle: 'ขนาด',
    extraTitle: 'เครื่องปรุงเพิ่มเติม',
    addText: 'เพิ่มลงตะกร้า',
    freeText: 'ฟรี',
  },
  DE: {
    sizeTitle: 'Größe',
    extraTitle: 'Zusätzliche Zutaten',
    addText: 'Hinzufügen',
    freeText: 'Gratis',
  },
};

export default function ProductModal({ item, onClose, lang }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(item.variants?.[0] ?? null);
  const [selectedExtras, setSelectedExtras] = useState<ExtraOption[]>([]);
  const [quantity, setQuantity] = useState(1);

  const variantMod = selectedVariant?.priceModifier ?? 0;
  const extrasTotal = selectedExtras.reduce((s, e) => s + e.price, 0);
  const unitPrice = item.price + variantMod + extrasTotal;
  const totalPrice = unitPrice * quantity;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const toggleExtra = (extra: ExtraOption) => {
    setSelectedExtras((prev) =>
      prev.find((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra]
    );
  };

  const handleAdd = () => {
    addItem({
      productId: item.id,
      name: item.name,
      nameTh: item.nameTh,
      quantity,
      basePrice: item.price,
      selectedVariant,
      selectedExtras,
      image: item.image,
    });
    onClose();
    openCart();
  };

  const getTranslatedName = (o: { name: string; nameTh?: string }) => {
    if (lang === 'TH' && o.nameTh) return o.nameTh;
    return o.name;
  };

  const getTranslatedDesc = (i: MenuItem) => {
    if (lang === 'TH' && i.descriptionTh) return i.descriptionTh;
    return i.description;
  };

  const t = labels[lang];

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Sliding Drawer Panel */}
      <div
        className="fixed top-0 right-0 bottom-0 h-full z-50 w-full max-w-[460px] bg-stone-50 border-l border-stone-300 flex flex-col shadow-2xl animate-slideLeft overflow-hidden"
      >
        {/* Header Section with Image Background */}
        <div className="relative h-48 sm:h-56 flex-shrink-0 overflow-hidden">
          <img src={item.image} alt={getTranslatedName(item)} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/45 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all cursor-pointer border border-white/10"
            aria-label="Close"
          >
            <X size={16} />
          </button>
          
          <div className="absolute bottom-4 left-5 right-5">
            <h2 className="text-white font-black tracking-tight text-xl sm:text-2xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              {getTranslatedName(item)}
            </h2>
          </div>
        </div>

        {/* Customizations scroll area */}
        <div className="overflow-y-auto flex-1 p-5 space-y-6">
          
          {/* Description */}
          <div className="space-y-1">
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">{getTranslatedDesc(item)}</p>
          </div>

          {/* Size / Variant Options */}
          {item.variants && item.variants.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-stone-500 font-extrabold mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                {t.sizeTitle}
              </p>
              <div className="flex gap-2.5 flex-wrap">
                {item.variants.map((v) => {
                  const active = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all duration-150 cursor-pointer ${
                        active
                          ? 'border-[#8B1E1E] bg-[#8B1E1E]/5 text-[#8B1E1E] font-extrabold shadow-sm'
                          : 'border-stone-300 bg-white text-stone-600 hover:border-stone-400 hover:text-stone-800'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {getTranslatedName(v)}
                      {v.priceModifier > 0 && <span className="ml-1.5 text-stone-400">+{v.priceModifier} ฿</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extra Options */}
          {item.extras && item.extras.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-stone-500 font-extrabold mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                {t.extraTitle}
              </p>
              <div className="space-y-2">
                {item.extras.map((extra) => {
                  const checked = !!selectedExtras.find((e) => e.id === extra.id);
                  return (
                    <button
                      key={extra.id}
                      onClick={() => toggleExtra(extra)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 text-left rounded-2xl border transition-all duration-150 cursor-pointer ${
                        checked
                          ? 'border-[#8B1E1E] bg-[#8B1E1E]/5'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4.5 h-4.5 flex items-center justify-center rounded transition-all flex-shrink-0 ${
                            checked
                              ? 'border-[#8B1E1E] bg-[#8B1E1E]'
                              : 'border-stone-300 bg-stone-100'
                          }`}
                          style={{ borderWidth: '1px' }}
                        >
                          {checked && (
                            <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <span className="text-stone-800 text-xs sm:text-sm font-semibold">{getTranslatedName(extra)}</span>
                        </div>
                      </div>
                      {extra.price > 0 ? (
                        <span className="text-[#8B1E1E] text-xs sm:text-sm font-extrabold">+{extra.price} ฿</span>
                      ) : (
                        <span className="text-stone-400 text-xs">{t.freeText}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Panel Footer */}
        <div className="flex-shrink-0 p-5 border-t border-stone-200 bg-white flex items-center gap-4">
          {/* Quantity selector */}
          <div className="flex items-center gap-3 bg-stone-100 p-1.5 rounded-full border border-stone-200">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-full border border-stone-300 bg-white flex items-center justify-center text-stone-500 hover:border-[#8B1E1E] hover:text-[#8B1E1E] hover:bg-[#8B1E1E]/5 active:scale-95 transition-all cursor-pointer"
            >
              <Minus size={12} />
            </button>
            <span className="text-stone-850 font-bold text-sm w-5 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-full border border-stone-300 bg-white flex items-center justify-center text-stone-500 hover:border-[#8B1E1E] hover:text-[#8B1E1E] hover:bg-[#8B1E1E]/5 active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Add to Cart submit */}
          <button
            onClick={handleAdd}
            className="flex-1 flex items-center justify-between px-5 py-3.5 bg-[#8B1E1E] hover:bg-[#721818] text-white text-xs tracking-widest uppercase font-bold rounded-full transition-all duration-200 transform active:scale-[0.98] shadow-md hover:shadow-lg cursor-pointer"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <span className="flex items-center gap-2">
              <ShoppingCart size={14} />
              {t.addText}
            </span>
            <span className="font-light">{totalPrice} ฿</span>
          </button>
        </div>
      </div>
    </>
  );
}
