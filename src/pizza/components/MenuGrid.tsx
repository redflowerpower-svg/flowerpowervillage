import { useState } from 'react';
import { Plus, Minus, ZoomIn, X } from 'lucide-react';
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
    lasagnaBadge: '🍝 Min. 2 persone · Prenotazione con 1 giorno di anticipo',
    lasagnaDateLabel: 'Seleziona data di ritiro / consegna',
    lasagnaDatePlaceholder: 'Scegli una data...',
    lasagnaDateRequired: '⚠️ Seleziona una data per procedere',
    lasagnaWhyLabel: 'La preparazione richiede tempo per garantire il massimo della bontà.',
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
    lasagnaBadge: '🍝 Min. 2 people · Pre-order 1 day in advance',
    lasagnaDateLabel: 'Select pickup / delivery date',
    lasagnaDatePlaceholder: 'Choose a date...',
    lasagnaDateRequired: '⚠️ Please select a date to proceed',
    lasagnaWhyLabel: 'Preparation takes time to guarantee the best quality.',
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
    lasagnaBadge: '🍝 ขั้นต่ำ 2 ที่ · สั่งล่วงหน้า 1 วัน',
    lasagnaDateLabel: 'เลือกวันที่รับ / จัดส่ง',
    lasagnaDatePlaceholder: 'เลือกวันที่...',
    lasagnaDateRequired: '⚠️ กรุณาเลือกวันที่ก่อนดำเนินการ',
    lasagnaWhyLabel: 'ใช้เวลาเตรียมนานเพื่อให้ได้รสชาติที่ดีที่สุด',
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
    lasagnaBadge: '🍝 Min. 2 Personen · 1 Tag im Voraus bestellen',
    lasagnaDateLabel: 'Abhol- / Lieferdatum wählen',
    lasagnaDatePlaceholder: 'Datum auswählen...',
    lasagnaDateRequired: '⚠️ Bitte ein Datum auswählen, um fortzufahren',
    lasagnaWhyLabel: 'Die Zubereitung braucht Zeit, um höchste Qualität zu garantieren.',
  },
};

// Returns tomorrow's date in YYYY-MM-DD (local time)
function getTomorrowDateString() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function MenuGrid({ items, lang }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<ExtraOption[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [lasagnaDate, setLasagnaDate] = useState<string>('');

  const t = labels[lang];

  const isLasagna = (item: MenuItem) => item.id.includes('lasagna');

  const handleExpand = (item: MenuItem) => {
    if (expandedId === item.id) {
      setExpandedId(null);
    } else {
      setExpandedId(item.id);
      setSelectedVariant(item.variants?.[0] ?? null);
      
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
      setSelectedExtras(defaults);
      // Lasagna: minimum 2 portions
      setQuantity(isLasagna(item) ? 2 : 1);
      // Reset lasagna date on new expansion
      setLasagnaDate('');
    }
  };

  const toggleExtra = (extra: ExtraOption) => {
    setSelectedExtras((prev) => {
      // 1. Spiciness group (radio-button behavior)
      if (extra.id.startsWith('spicy-')) {
        const filtered = prev.filter((e) => !e.id.startsWith('spicy-'));
        return [...filtered, extra];
      }

      // 2. Sugar group (radio-button behavior)
      if (extra.id.startsWith('sugar-')) {
        const filtered = prev.filter((e) => !e.id.startsWith('sugar-'));
        return [...filtered, extra];
      }

      // 3. Fruit group (radio-button behavior)
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

        if (extra.id === 'sauce-none') {
          return [...prev.filter((e) => !e.id.startsWith('sauce-')), extra];
        }

        let filtered = prev.filter((e) => e.id !== 'sauce-none');
        const currentSauces = filtered.filter((e) => e.id.startsWith('sauce-'));
        if (currentSauces.length >= 2) {
          const firstSauce = currentSauces[0];
          filtered = filtered.filter((e) => e.id !== firstSauce.id);
        }
        return [...filtered, extra];
      }

      return prev.find((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra];
    });
  };

  const getGroupedExtras = (item: MenuItem) => {
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

  const handleAdd = (item: MenuItem) => {
    if (isLasagna(item) && !lasagnaDate) return; // Block if no date selected
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
      lasagnaDate: isLasagna(item) ? lasagnaDate : undefined,
    });
    setExpandedId(null);
    openCart();
  };

  const getTranslatedName = (item: { name: string; nameTh?: string; nameIt?: string; nameDe?: string }) => {
    if (lang === 'TH' && item.nameTh) return item.nameTh;
    if (lang === 'IT' && item.nameIt) return item.nameIt;
    if (lang === 'DE' && item.nameDe) return item.nameDe;
    return item.name;
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

  const getTranslatedDesc = (item: MenuItem) => {
    if (lang === 'TH' && item.descriptionTh) return item.descriptionTh;
    if (lang === 'IT' && item.descriptionIt) return item.descriptionIt;
    if (lang === 'DE' && item.descriptionDe) return item.descriptionDe;
    return item.description;
  };

  return (
    <>
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
            {/* IMAGE CONTAINER WITH ZOOM HOOK */}
            <div 
              className="relative h-48 bg-stone-100 overflow-hidden flex-shrink-0 rounded-t-[2rem] cursor-zoom-in"
              onClick={(e) => {
                e.stopPropagation();
                setZoomedImage(item.image);
              }}
            >
              <img
                src={item.image}
                alt={getTranslatedName(item)}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div
                className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white backdrop-blur-[1px]"
              >
                <div className="p-3 bg-stone-900/90 rounded-full border border-stone-700 shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
                  <ZoomIn size={20} className="text-white" />
                </div>
              </div>
            </div>

            {/* CONTENT AREA */}
            <div className="p-6 flex-grow flex flex-col justify-between">
              <div>
                <h3
                  className="font-sans text-lg font-bold text-stone-900 leading-tight tracking-tight"
                  style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                >
                  {formatProductName(getTranslatedName(item))}
                </h3>

                {/* Lasagna pre-order badge — always visible */}
                {isLasagna(item) && (
                  <div className="mt-2 mb-1 flex flex-col gap-1">
                    <span
                      className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-800 text-[10px] font-bold px-2.5 py-1.5 rounded-xl leading-tight"
                      style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                    >
                      {t.lasagnaBadge}
                    </span>
                    <span
                      className="text-stone-400 text-[10px] italic leading-tight"
                      style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                    >
                      {t.lasagnaWhyLabel}
                    </span>
                  </div>
                )}

                <p
                  className="text-stone-500 text-xs font-light leading-relaxed mb-4 flex-grow mt-1.5"
                  style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
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
                        <p className="text-[9px] uppercase tracking-widest text-stone-500 font-extrabold mb-2" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
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
                                style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                              >
                                {getTranslatedName(v)}
                                {v.priceModifier > 0 && <span className="ml-1 text-stone-400">+{v.priceModifier} ฿</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Spiciness Section (Differenziata dal resto con bordo ed evidenza visiva) */}
                    {item.extras && item.extras.length > 0 && getGroupedExtras(item).some(g => g.idPrefix === 'spicy-') && (
                      <div className="bg-[#8B1E1E]/5 border border-[#8B1E1E]/10 rounded-2xl p-3.5 space-y-2 mb-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#8B1E1E] flex items-center gap-1" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                            <span>🌶️</span>
                            {lang === 'TH' ? 'ระดับความเผ็ด' : lang === 'IT' ? 'Livello di Piccantezza' : 'Spiciness Level'}
                          </h4>
                          <span className="text-[9px] text-stone-450 font-bold lowercase" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                            {lang === 'TH' ? 'เลือกได้ 1 อย่าง' : lang === 'IT' ? 'scegli 1 opzione' : 'select 1 option'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {item.extras.filter(e => e.id.startsWith('spicy-')).map((extra) => {
                            const checked = !!selectedExtras.find((e) => e.id === extra.id);
                            return (
                              <button
                                key={extra.id}
                                type="button"
                                onClick={() => toggleExtra(extra)}
                                className={`flex items-center justify-between px-3 py-2 text-left rounded-xl border transition-all duration-150 cursor-pointer ${
                                  checked
                                    ? 'border-[#8B1E1E] bg-[#8B1E1E] text-white shadow-sm font-bold'
                                    : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                                }`}
                              >
                                <span className="text-[11px] font-semibold">{getTranslatedName(extra)}</span>
                                {checked && (
                                  <div className="w-1.5 h-1.5 bg-white rounded-full flex-shrink-0 ml-1.5" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Customization Options (Sugar, Fruit, Sauces - escludendo Spiciness) */}
                    {item.extras && item.extras.length > 0 && getGroupedExtras(item).some(g => g.type === 'option' && g.idPrefix !== 'spicy-') && (
                      <div className="space-y-4 mb-4">
                        {getGroupedExtras(item).filter(g => g.type === 'option' && g.idPrefix !== 'spicy-').map((group, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <p className="text-[9px] uppercase tracking-widest text-stone-500 font-extrabold" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                                {group.title}
                              </p>
                              {group.maxSelection && (
                                <span className="text-[9px] text-stone-450 font-bold lowercase" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                                  {lang === 'TH' ? `เลือกได้สูงสุด ${group.maxSelection}` : lang === 'IT' ? `scegli max ${group.maxSelection}` : `select max ${group.maxSelection}`}
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {group.items.map((extra) => {
                                const checked = !!selectedExtras.find((e) => e.id === extra.id);
                                return (
                                  <button
                                    key={extra.id}
                                    type="button"
                                    onClick={() => toggleExtra(extra)}
                                    className={`flex items-center justify-between px-3 py-2 text-left rounded-xl border transition-all duration-150 cursor-pointer ${
                                      checked
                                        ? 'border-[#8B1E1E] bg-[#8B1E1E]/5 font-bold'
                                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <div
                                        className={`w-3.5 h-3.5 flex items-center justify-center rounded-full transition-all flex-shrink-0 ${
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
                                      <span className="text-stone-850 text-[11px] font-semibold">{getTranslatedName(extra)}</span>
                                    </div>
                                    {extra.price > 0 ? (
                                      <span className="text-[#8B1E1E] text-[11px] font-extrabold">+{extra.price} ฿</span>
                                    ) : (
                                      <span className="text-stone-450 text-[10px]">{t.freeText}</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Extra Ingredients Section (Double Cheese, Bacon, Mozzarella) */}
                    {item.extras && item.extras.length > 0 && getGroupedExtras(item).some(g => g.type === 'extra') && (
                      <div className="space-y-4 mb-4">
                        {getGroupedExtras(item).filter(g => g.type === 'extra').map((group, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <p className="text-[9px] uppercase tracking-widest text-stone-500 font-extrabold" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                              {group.title}
                            </p>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-transparent">
                              {group.items.map((extra) => {
                                const checked = !!selectedExtras.find((e) => e.id === extra.id);
                                return (
                                  <button
                                    key={extra.id}
                                    type="button"
                                    onClick={() => toggleExtra(extra)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 text-left rounded-xl border transition-all duration-150 cursor-pointer ${
                                      checked
                                        ? 'border-[#8B1E1E] bg-[#8B1E1E]/5 font-bold'
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
                        ))}
                      </div>
                    )}

                    {/* Lasagna Date Picker */}
                    {isLasagna(item) && (
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-2">
                        <p className="text-[9px] uppercase tracking-widest text-amber-700 font-extrabold flex items-center gap-1" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                          📅 {t.lasagnaDateLabel}
                        </p>
                        <input
                          id={`lasagna-date-${item.id}`}
                          type="date"
                          min={getTomorrowDateString()}
                          value={lasagnaDate}
                          onChange={(e) => setLasagnaDate(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-white border border-amber-300 text-stone-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                          style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                        />
                        {!lasagnaDate && (
                          <p className="text-amber-600 text-[10px] font-bold" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                            {t.lasagnaDateRequired}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Quantity Selector Box */}
                    <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-full border border-stone-200 justify-between">
                      <span className="text-stone-500 text-[9.5px] font-extrabold uppercase tracking-wider pl-2" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                        {lang === 'TH' ? 'จำนวน' : lang === 'DE' ? 'Menge' : lang === 'EN' ? 'Quantity' : 'Quantità'}:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(isLasagna(item) ? 2 : 1, quantity - 1))}
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
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                  >
                    {isExpanded ? t.totalFinito : t.startingAt}
                  </span>
                  <span
                    className={`text-xl font-extrabold transition-colors duration-300 ${isExpanded ? 'text-[#8B1E1E]' : 'text-stone-900'}`}
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
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
                  disabled={isExpanded && isLasagna(item) && !lasagnaDate}
                  className={`text-xs font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all duration-300 hover:px-7 cursor-pointer border-0 ${
                    isExpanded && isLasagna(item) && !lasagnaDate
                      ? 'bg-stone-300 text-stone-500 cursor-not-allowed hover:shadow-md hover:px-6'
                      : 'bg-[#8B1E1E] text-white hover:bg-[#721818]'
                  }`}
                  style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                >
                  {isExpanded ? t.confirmText : (item.extras?.length || item.variants?.length ? t.customizeText : t.chooseText)}
                </button>
              </div>

            </div>
          </article>
        );
      })}
    </div>

      {/* Lightbox Zoom Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-stone-950/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
          onClick={() => setZoomedImage(null)}
        >
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-6 right-6 w-12 h-12 bg-stone-900/80 border border-stone-800 rounded-full flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-800 transition-all cursor-pointer shadow-xl"
          >
            <X size={24} />
          </button>
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-[2rem] shadow-2xl border border-stone-800/50 bg-stone-900 cursor-default" onClick={(e) => e.stopPropagation()}>
            <img 
              src={zoomedImage} 
              alt="Zoomed preview" 
              className="max-w-full max-h-[80vh] object-contain rounded-[2rem]"
            />
          </div>
        </div>
      )}
    </>
  );
}
