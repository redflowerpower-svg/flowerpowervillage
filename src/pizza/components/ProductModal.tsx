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
  const [selectedExtras, setSelectedExtras] = useState<ExtraOption[]>(() => {
    const defaults: ExtraOption[] = [];
    if (item.extras) {
      const defaultSpicy = item.extras.find(e => e.id === 'spicy-no');
      if (defaultSpicy) defaults.push(defaultSpicy);
      const defaultSugar = item.extras.find(e => e.id === 'sugar-regular');
      if (defaultSugar) defaults.push(defaultSugar);
      const defaultSauce = item.extras.find(e => e.id === 'sauce-none');
      if (defaultSauce) defaults.push(defaultSauce);
      const defaultFruit = item.extras.find(e => e.id.startsWith('fruit-'));
      if (defaultFruit) defaults.push(defaultFruit);
    }
    return defaults;
  });
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
    setSelectedExtras((prev) => {
      // 1. Spiciness group (radio-button behavior: always exactly one selected)
      if (extra.id.startsWith('spicy-')) {
        const filtered = prev.filter((e) => !e.id.startsWith('spicy-'));
        return [...filtered, extra];
      }

      // 2. Sugar group (radio-button behavior: always exactly one selected)
      if (extra.id.startsWith('sugar-')) {
        const filtered = prev.filter((e) => !e.id.startsWith('sugar-'));
        return [...filtered, extra];
      }

      // 3. Fruit group (radio-button behavior: always exactly one selected)
      if (extra.id.startsWith('fruit-')) {
        const filtered = prev.filter((e) => !e.id.startsWith('fruit-'));
        return [...filtered, extra];
      }

      // 4. Sauce group (max 2 choices)
      if (extra.id.startsWith('sauce-')) {
        const isSel = prev.some((e) => e.id === extra.id);
        if (isSel) {
          return prev.filter((e) => e.id !== extra.id);
        }

        // Selecting "No Sauces" clears all other sauces
        if (extra.id === 'sauce-none') {
          return [...prev.filter((e) => !e.id.startsWith('sauce-')), extra];
        }

        // Selecting a sauce removes "No Sauces"
        let filtered = prev.filter((e) => e.id !== 'sauce-none');

        // Check if there are already 2 sauces selected
        const currentSauces = filtered.filter((e) => e.id.startsWith('sauce-'));
        if (currentSauces.length >= 2) {
          // Remove the first selected sauce to make space
          const firstSauce = currentSauces[0];
          filtered = filtered.filter((e) => e.id !== firstSauce.id);
        }
        return [...filtered, extra];
      }

      // Default toggle logic for other extras
      return prev.find((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra];
    });
  };

  const getGroupedExtras = () => {
    const groups: { title: string; maxSelection?: number; items: ExtraOption[]; type: 'option' | 'extra'; idPrefix: string }[] = [];
    
    const spicyItems = item.extras?.filter((e) => e.id.startsWith('spicy-')) ?? [];
    const sugarItems = item.extras?.filter((e) => e.id.startsWith('sugar-')) ?? [];
    const fruitItems = item.extras?.filter((e) => e.id.startsWith('fruit-')) ?? [];
    const sauceItems = item.extras?.filter((e) => e.id.startsWith('sauce-')) ?? [];
    const regularItems = item.extras?.filter((e) => 
      !e.id.startsWith('spicy-') && 
      !e.id.startsWith('sugar-') && 
      !e.id.startsWith('fruit-') && 
      !e.id.startsWith('sauce-')
    ) ?? [];

    if (spicyItems.length > 0) {
      groups.push({
        title: lang === 'TH' ? 'ระดับความเผ็ด' : lang === 'IT' ? 'Livello di Piccantezza' : 'Spiciness Level',
        maxSelection: 1,
        items: spicyItems,
        type: 'option',
        idPrefix: 'spicy-'
      });
    }

    if (sugarItems.length > 0) {
      groups.push({
        title: lang === 'TH' ? 'ระดับความหวาน' : lang === 'IT' ? 'Livello di Zucchero' : 'Sugar Level',
        maxSelection: 1,
        items: sugarItems,
        type: 'option',
        idPrefix: 'sugar-'
      });
    }

    if (fruitItems.length > 0) {
      groups.push({
        title: lang === 'TH' ? 'เลือกผลไม้' : lang === 'IT' ? 'Scelta della Frutta' : 'Choose Fruit',
        maxSelection: 1,
        items: fruitItems,
        type: 'option',
        idPrefix: 'fruit-'
      });
    }

    if (sauceItems.length > 0) {
      groups.push({
        title: lang === 'TH' ? 'เลือกซอส (สูงสุด 2 ชนิด)' : lang === 'IT' ? 'Seleziona Salse (max 2)' : 'Select Sauces (max 2)',
        maxSelection: 2,
        items: sauceItems,
        type: 'option',
        idPrefix: 'sauce-'
      });
    }

    if (regularItems.length > 0) {
      groups.push({
        title: lang === 'TH' ? 'เครื่องปรุงเพิ่มเติม' : lang === 'IT' ? 'Ingredienti Extra' : 'Extra Ingredients',
        items: regularItems,
        type: 'extra',
        idPrefix: 'regular'
      });
    }

    return groups;
  };

  const handleAdd = () => {
    addItem({
      productId: item.id,
      name: item.name,
      nameTh: item.nameTh,
      nameIt: item.nameIt,
      nameDe: item.nameDe,
      quantity,
      basePrice: item.price,
      selectedVariant,
      selectedExtras,
      image: item.image,
    });
    onClose();
    openCart();
  };

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

  const getTranslatedDesc = (i: MenuItem) => {
    if (lang === 'TH' && i.descriptionTh) return i.descriptionTh;
    if (lang === 'IT' && i.descriptionIt) return i.descriptionIt;
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
              {formatProductName(getTranslatedName(item))}
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

          {/* Spiciness Section (Differenziata dal resto con bordo ed evidenza visiva) */}
          {item.extras && item.extras.length > 0 && getGroupedExtras().some(g => g.idPrefix === 'spicy-') && (
            <div className="pt-4 border-t border-stone-200/60 first:border-t-0 first:pt-0">
              <div className="bg-[#8B1E1E]/5 border border-[#8B1E1E]/10 rounded-2xl p-4 space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#8B1E1E] flex items-center gap-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <span>🌶️</span>
                    {lang === 'TH' ? 'ระดับความเผ็ด' : lang === 'IT' ? 'Livello di Piccantezza' : 'Spiciness Level'}
                  </h4>
                  <span className="text-[10px] text-stone-450 font-bold lowercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {lang === 'TH' ? 'เลือกได้ 1 อย่าง' : lang === 'IT' ? 'scegli 1 opzione' : 'select 1 option'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {item.extras.filter(e => e.id.startsWith('spicy-')).map((extra) => {
                    const checked = !!selectedExtras.find((e) => e.id === extra.id);
                    return (
                      <button
                        key={extra.id}
                        onClick={() => toggleExtra(extra)}
                        className={`flex items-center justify-between px-4 py-3 text-left rounded-xl border transition-all duration-150 cursor-pointer ${
                          checked
                            ? 'border-[#8B1E1E] bg-[#8B1E1E] text-white shadow-sm'
                            : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                        }`}
                      >
                        <span className="text-xs font-semibold">{getTranslatedName(extra)}</span>
                        {checked && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full flex-shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Grouped Options (Sugar, Fruit, Sauces - escludendo Spiciness) */}
          {item.extras && item.extras.length > 0 && getGroupedExtras().some(g => g.type === 'option' && g.idPrefix !== 'spicy-') && (
            <div className="space-y-6 pt-4 border-t border-stone-200/60 first:border-t-0 first:pt-0">
              <div>
                <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#8B1E1E] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {lang === 'TH' ? 'ตัวเลือกสินค้า' : lang === 'IT' ? 'Opzioni di Personalizzazione' : 'Customization Options'}
                </h4>
                <div className="space-y-5">
                  {getGroupedExtras().filter(g => g.type === 'option' && g.idPrefix !== 'spicy-').map((group, idx) => (
                    <div key={idx} className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] uppercase tracking-widest text-stone-500 font-extrabold" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {group.title}
                        </p>
                        {group.maxSelection && (
                          <span className="text-[10px] text-stone-400 font-semibold lowercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {lang === 'TH' ? `เลือกได้สูงสุด ${group.maxSelection}` : lang === 'IT' ? `scegli max ${group.maxSelection}` : `select max ${group.maxSelection}`}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {group.items.map((extra) => {
                          const checked = !!selectedExtras.find((e) => e.id === extra.id);
                          return (
                            <button
                              key={extra.id}
                              onClick={() => toggleExtra(extra)}
                              className={`flex items-center justify-between px-4 py-3.5 text-left rounded-xl border transition-all duration-150 cursor-pointer ${
                                checked
                                  ? 'border-[#8B1E1E] bg-[#8B1E1E]/5'
                                  : 'border-stone-200 bg-white hover:border-stone-300'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-4 h-4 flex items-center justify-center rounded-full transition-all flex-shrink-0 ${
                                    checked
                                      ? 'border-[#8B1E1E] bg-[#8B1E1E]'
                                      : 'border-stone-300 bg-stone-100'
                                  }`}
                                  style={{ borderWidth: '1px' }}
                                >
                                  {checked && (
                                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                  )}
                                </div>
                                <span className="text-stone-850 text-xs font-semibold">{getTranslatedName(extra)}</span>
                              </div>
                              {extra.price > 0 ? (
                                <span className="text-[#8B1E1E] text-xs font-extrabold">+{extra.price} ฿</span>
                              ) : (
                                <span className="text-stone-400 text-xs">{t.freeText}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Grouped Paid Extras (Double Cheese, Bacon, Mozzarella) */}
          {item.extras && item.extras.length > 0 && getGroupedExtras().some(g => g.type === 'extra') && (
            <div className="space-y-6 pt-4 border-t border-stone-200/60 mt-4">
              <div>
                <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#8B1E1E] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {lang === 'TH' ? 'ส่วนผสมเพิ่มเติม' : lang === 'IT' ? 'Ingredienti Extra (Aggiuntivi)' : 'Extra Ingredients'}
                </h4>
                <div className="space-y-5">
                  {getGroupedExtras().filter(g => g.type === 'extra').map((group, idx) => (
                    <div key={idx} className="space-y-2.5">
                      <p className="text-[10px] uppercase tracking-widest text-stone-500 font-extrabold" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {group.title}
                      </p>
                      <div className="space-y-2">
                        {group.items.map((extra) => {
                          const checked = !!selectedExtras.find((e) => e.id === extra.id);
                          return (
                            <button
                              key={extra.id}
                              onClick={() => toggleExtra(extra)}
                              className={`w-full flex items-center justify-between px-4 py-3.5 text-left rounded-xl border transition-all duration-150 cursor-pointer ${
                                checked
                                  ? 'border-[#8B1E1E] bg-[#8B1E1E]/5'
                                  : 'border-stone-200 bg-white hover:border-stone-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-4 h-4 flex items-center justify-center rounded transition-all flex-shrink-0 ${
                                    checked
                                      ? 'border-[#8B1E1E] bg-[#8B1E1E]'
                                      : 'border-stone-300 bg-stone-100'
                                  }`}
                                  style={{ borderWidth: '1px' }}
                                >
                                  {checked && (
                                    <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                                      <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </div>
                                <span className="text-stone-850 text-xs sm:text-sm font-semibold">{getTranslatedName(extra)}</span>
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
                  ))}
                </div>
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
