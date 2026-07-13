import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import type { MenuItem, ExtraOption, Variant } from '../data/menuData';
import { useCartStore } from '../store/cartStore';

interface Props {
  items: MenuItem[];
  lang: 'IT' | 'EN' | 'TH' | 'DE';
}

const labels = {
  IT: {
    sizeOptions: 'Opzioni taglia',
    extraIngredients: 'ingredienti extra',
    startingAt: 'A partire da',
    totalFinito: 'Totale finito',
    confirmText: 'Aggiungi',
    closeText: 'Chiudi',
    customizeText: 'Personalizza',
    chooseText: 'Aggiungi',
    freeText: 'Gratis',
  },
  EN: {
    sizeOptions: 'Size options',
    extraIngredients: 'extra ingredients',
    startingAt: 'Starting at',
    totalFinito: 'Total price',
    confirmText: 'Add to Cart',
    closeText: 'Close',
    customizeText: 'Customize',
    chooseText: 'Add',
    freeText: 'Free',
  },
  TH: {
    sizeOptions: 'ตัวเลือกขนาด',
    extraIngredients: 'เครื่องปรุงเพิ่มเติม',
    startingAt: 'ราคาเริ่มต้น',
    totalFinito: 'ราคารวม',
    confirmText: 'เพิ่มลงตะกร้า',
    closeText: 'ปิด',
    customizeText: 'ปรับแต่ง',
    chooseText: 'เพิ่ม',
    freeText: 'ฟรี',
  },
  DE: {
    sizeOptions: 'Größenoptionen',
    extraIngredients: 'Zusatzzutaten',
    startingAt: 'Ab-Preis',
    totalFinito: 'Gesamtpreis',
    confirmText: 'In den Warenkorb',
    closeText: 'Schließen',
    customizeText: 'Konfigurieren',
    chooseText: 'Hinzufügen',
    freeText: 'Gratis',
  },
};

export default function MenuGrid({ items, lang }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<ExtraOption[]>([]);
  const [quantity, setQuantity] = useState(1);

  const t = labels[lang];

  const handleExpand = (item: MenuItem) => {
    if (expandedId === item.id) {
      setExpandedId(null);
    } else {
      setExpandedId(item.id);
      setSelectedVariant(item.variants?.[0] ?? null);
      setSelectedExtras([]);
      setQuantity(1);
    }
  };

  const toggleExtra = (extra: ExtraOption) => {
    setSelectedExtras((prev) =>
      prev.find((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra]
    );
  };

  const handleAdd = (item: MenuItem) => {
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
    setExpandedId(null);
    openCart();
  };

  const getTranslatedName = (item: { name: string; nameTh?: string }) => {
    if (lang === 'TH' && item.nameTh) return item.nameTh;
    return item.name;
  };

  const getTranslatedDesc = (item: MenuItem) => {
    if (lang === 'TH' && item.descriptionTh) return item.descriptionTh;
    return item.description;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => {
        const isExpanded = expandedId === item.id;

        // Calculate dynamic total price when expanded
        const activeVariantPrice = selectedVariant?.priceModifier ?? 0;
        const activeExtrasPrice = selectedExtras.reduce((s, e) => s + e.price, 0);
        const unitPriceWithCustoms = item.price + activeVariantPrice + activeExtrasPrice;
        const currentTotalPrice = unitPriceWithCustoms * quantity;

        return (
          <article
            key={item.id}
            className="group bg-white border border-stone-300 rounded-[2rem] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer will-change-transform"
            onClick={() => handleExpand(item)}
          >
            {/* IMAGE CONTAINER */}
            <div className="relative h-48 bg-stone-100 overflow-hidden flex-shrink-0 rounded-t-[2rem]">
              <img
                src={item.image}
                alt={getTranslatedName(item)}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div
                className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white backdrop-blur-[1px]"
              >
                <div className="p-3.5 bg-stone-900/90 rounded-full border border-stone-700 shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
                  <Plus size={20} className="text-white" />
                </div>
              </div>
            </div>

            {/* CONTENT AREA */}
            <div className="p-6 flex-grow flex flex-col justify-between">
              <div>
                <h3
                  className="font-sans text-lg font-bold text-stone-900 leading-tight tracking-tight"
                  style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
                >
                  {getTranslatedName(item)}
                </h3>

                <p
                  className="text-stone-500 text-xs font-light leading-relaxed mb-4 flex-grow mt-1.5"
                  style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
                >
                  {getTranslatedDesc(item)}
                </p>

                {/* Extras summary (shown only when collapsed) */}
                {!isExpanded && (item.extras?.length || item.variants?.length) ? (
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2 text-[9px] text-stone-400 font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B1E1E]/60 flex-shrink-0" />
                    <span>
                      {item.variants?.length ? `${t.sizeOptions} · ` : ''}
                      {item.extras?.length ? `${item.extras.length} ${t.extraIngredients}` : ''}
                    </span>
                  </div>
                ) : null}

                {/* INLINE DYNAMIC OPTIONS DRAWER */}
                {isExpanded && (
                  <div
                    className="mt-4 pt-4 border-t border-stone-200 space-y-4 animate-fadeIn"
                    onClick={(e) => e.stopPropagation()} // Prevent card toggle click
                  >
                    {/* Size Options */}
                    {item.variants && item.variants.length > 0 && (
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-stone-500 font-extrabold mb-2" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
                          {lang === 'TH' ? 'ขนาด' : lang === 'DE' ? 'Größe' : lang === 'EN' ? 'Size' : 'Taglia'}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {item.variants.map((v) => {
                            const active = selectedVariant?.id === v.id;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => setSelectedVariant(v)}
                                className={`px-3 py-1.5 text-[10px] font-semibold rounded-lg border transition-all duration-150 cursor-pointer ${
                                  active
                                    ? 'border-[#8B1E1E] bg-[#8B1E1E]/5 text-[#8B1E1E] font-bold shadow-sm'
                                    : 'border-stone-300 bg-white text-stone-600 hover:border-stone-400 hover:text-stone-850'
                                }`}
                                style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
                              >
                                {getTranslatedName(v)}
                                {v.priceModifier > 0 && <span className="ml-1 text-stone-400">+{v.priceModifier} ฿</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Extras Checkboxes */}
                    {item.extras && item.extras.length > 0 && (
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-stone-500 font-extrabold mb-2" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
                          {lang === 'TH' ? 'เครื่องปรุงเพิ่มเติม' : lang === 'DE' ? 'Zutaten' : lang === 'EN' ? 'Extras' : 'Ingredienti Extra'}
                        </p>
                        <div className="space-y-1.5">
                          {item.extras.map((extra) => {
                            const checked = !!selectedExtras.find((e) => e.id === extra.id);
                            return (
                              <button
                                key={extra.id}
                                type="button"
                                onClick={() => toggleExtra(extra)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 text-left rounded-xl border transition-all duration-150 cursor-pointer ${
                                  checked
                                    ? 'border-[#8B1E1E] bg-[#8B1E1E]/5'
                                    : 'border-stone-200 bg-white hover:border-stone-300'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-3.5 h-3.5 flex items-center justify-center rounded transition-all flex-shrink-0 ${
                                      checked
                                        ? 'border-[#8B1E1E] bg-[#8B1E1E]'
                                        : 'border-stone-300 bg-stone-100'
                                    }`}
                                    style={{ borderWidth: '1px' }}
                                  >
                                    {checked && (
                                      <svg width="7" height="6" viewBox="0 0 10 8" fill="none">
                                        <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    )}
                                  </div>
                                  <span className="text-stone-850 text-xs font-semibold">{getTranslatedName(extra)}</span>
                                </div>
                                {extra.price > 0 ? (
                                  <span className="text-[#8B1E1E] text-xs font-extrabold">+{extra.price} ฿</span>
                                ) : (
                                  <span className="text-stone-400 text-[10px]">{t.freeText}</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Quantity Selector Box */}
                    <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-full border border-stone-200 justify-between">
                      <span className="text-stone-500 text-[9.5px] font-extrabold uppercase tracking-wider pl-2" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
                        {lang === 'TH' ? 'จำนวน' : lang === 'DE' ? 'Menge' : lang === 'EN' ? 'Quantity' : 'Quantità'}:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-7 h-7 rounded-full border border-stone-300 bg-white flex items-center justify-center text-stone-500 hover:border-[#8B1E1E] hover:text-[#8B1E1E] hover:bg-[#8B1E1E]/5 active:scale-95 transition-all cursor-pointer"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-stone-850 font-bold text-xs w-4 text-center">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-7 h-7 rounded-full border border-stone-300 bg-white flex items-center justify-center text-stone-500 hover:border-[#8B1E1E] hover:text-[#8B1E1E] hover:bg-[#8B1E1E]/5 active:scale-95 transition-all cursor-pointer"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* CARD BOTTOM INTERACT & PRICING BAR - CLONED FROM VILLAGE ROOM CARD */}
              <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-between gap-2 mt-auto">
                <div>
                  <span
                    className="block text-[10.5px] uppercase tracking-wider text-stone-400 font-bold"
                    style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
                  >
                    {isExpanded ? t.totalFinito : t.startingAt}
                  </span>
                  <span
                    className={`text-xl font-extrabold transition-colors duration-300 ${isExpanded ? 'text-[#8B1E1E]' : 'text-stone-900'}`}
                    style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
                  >
                    {isExpanded ? `${currentTotalPrice} ฿` : `${item.price} ฿`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isExpanded) {
                      handleAdd(item);
                    } else {
                      handleExpand(item);
                    }
                  }}
                  className="text-xs font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all duration-300 hover:px-7 cursor-pointer border-0 bg-[#8B1E1E] text-white hover:bg-[#721818]"
                  style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
                >
                  {isExpanded ? t.confirmText : (item.extras?.length || item.variants?.length ? t.customizeText : t.chooseText)}
                </button>
              </div>

            </div>
          </article>
        );
      })}
    </div>
  );
}
