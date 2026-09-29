import { useState } from 'react';
import { Plus, Minus, ZoomIn, X, Search, Check } from 'lucide-react';
import type { MenuItem, ExtraOption, Variant } from '../data/menuData';
import { menuData } from '../data/menuData';
import { useCartStore } from '../store/cartStore';
import { renderCountryFlag, formatSubtitle, renderWinePrice, renderFormattedPrice, formatWineProductName } from '../data/wineData';

import { withCacheBust } from '../utils/cacheBust';


interface Props {
  items: MenuItem[];
  lang: 'IT' | 'EN' | 'TH' | 'DE';
}

export const hasPorkMeat = (item: MenuItem): boolean => {
  const meatKeywords = [
    'ham', 'prosciutto', 'salsiccia', 'sausage', 'salame', 'salami', 
    'pepperoni', 'wurstel', 'frankfurter', 'bacon', 'pancetta', 'speck', 
    'mortadella', 'spianata', 'หมู', 'ไส้กรอก', 'เบคอน', 'แฮม', 'ซาลามี่'
  ];
  const text = `${item.id} ${item.name} ${item.description || ''} ${item.descriptionIt || ''} ${item.descriptionTh || ''}`.toLowerCase();
  return meatKeywords.some(k => text.includes(k));
};

export const isEligibleForSplit = (item: MenuItem): boolean => {
  const has12 = item.variants?.some(v => v.name.includes('12"') || v.name.includes('12'));
  const has8 = item.variants?.some(v => v.name.includes('8"') || v.name.includes('8'));
  const lowerId = item.id.toLowerCase();
  const lowerName = item.name.toLowerCase();
  const isExcluded = 
    lowerId.includes('nutella') || 
    lowerName.includes('nutella') || 
    lowerId.includes('calzone') || 
    lowerName.includes('calzone') || 
    lowerId.includes('stella') || 
    lowerName.includes('stella') ||
    lowerId.includes('star') ||
    lowerName.includes('star');
  return !!(has12 && has8 && !isExcluded);
};

// Cached list of all eligible pizzas for 2nd half selection across the menu
const allEligiblePizzas: MenuItem[] = menuData
  .flatMap((cat) => cat.items)
  .filter((it, index, self) => isEligibleForSplit(it) && self.findIndex(s => s.id === it.id) === index);

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
    splitVariantName: '12" Metà & Metà 🌓',
    splitChooseSecondHalf: 'Scegli la 2ª metà',
    splitSearchPlaceholder: 'Cerca pizza per la 2ª metà...',
    splitFirstHalfLabel: '1ª Metà (Base)',
    splitSecondHalfLabel: '2ª Metà',
    splitSecondHalfRequired: '⚠️ Seleziona la 2ª metà per procedere',
    splitAverageNotice: 'Prezzo 50/50: media esatta dei due gusti 12"',
    splitSelectedBadge: 'Gusto Scelto',
    chickenOptionTitle: 'Opzione 100% Pollo (Halal-friendly)',
    chickenOptionDesc: 'Sostituisce salumi/maiale con pollo',
    chickenOptionSelected: 'Pollo Selezionato',
    chickenOptionSelect: '+ Scegli Pollo',
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
    splitVariantName: '12" Half & Half 🌓',
    splitChooseSecondHalf: 'Choose 2nd half',
    splitSearchPlaceholder: 'Search pizza for 2nd half...',
    splitFirstHalfLabel: '1st Half (Base)',
    splitSecondHalfLabel: '2nd Half',
    splitSecondHalfRequired: '⚠️ Please select the 2nd half to proceed',
    splitAverageNotice: '50/50 price: exact average of both 12" flavours',
    splitSelectedBadge: 'Selected Flavor',
    chickenOptionTitle: '100% Chicken Option (Halal-friendly)',
    chickenOptionDesc: 'Replaces pork & cold cuts with chicken',
    chickenOptionSelected: 'Chicken Selected',
    chickenOptionSelect: '+ Choose Chicken',
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
    splitVariantName: '12" ฮาล์ฟ & ฮาล์ฟ 🌓',
    splitChooseSecondHalf: 'เลือกหน้าที่ 2',
    splitSearchPlaceholder: 'ค้นหาพิซซ่าหน้าที่ 2...',
    splitFirstHalfLabel: 'หน้าที่ 1 (ฐาน)',
    splitSecondHalfLabel: 'หน้าที่ 2',
    splitSecondHalfRequired: '⚠️ กรุณาเลือกหน้าที่ 2 ก่อนสั่งซื้อ',
    splitAverageNotice: 'ราคา 50/50: หารเฉลี่ยราคาพิซซ่าขนาด 12" ทั้งสองหน้า',
    splitSelectedBadge: 'หน้าที่เลือก',
    chickenOptionTitle: 'ตัวเลือกเนื้อไก่ 100% (Halal-friendly)',
    chickenOptionDesc: 'เปลี่ยนหมู/ไส้กรอกเป็นเนื้อไก่ 100%',
    chickenOptionSelected: 'เลือกไก่แล้ว',
    chickenOptionSelect: '+ เลือกไก่',
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
    splitVariantName: '12" Halb & Halb 🌓',
    splitChooseSecondHalf: '2. Hälfte wählen',
    splitSearchPlaceholder: 'Pizza für 2. Hälfte suchen...',
    splitFirstHalfLabel: '1. Hälfte (Basis)',
    splitSecondHalfLabel: '2. Hälfte',
    splitSecondHalfRequired: '⚠️ Bitte 2. Hälfte auswählen',
    splitAverageNotice: '50/50-Preis: Exakter Durchschnitt der zwei 12"-Pizzen',
    splitSelectedBadge: 'Gewählte Sorte',
    chickenOptionTitle: '100% Hähnchen (Halal-friendly)',
    chickenOptionDesc: 'Ersetzt Schwein durch Geflügel',
    chickenOptionSelected: 'Geflügel Gewählt',
    chickenOptionSelect: '+ Geflügel Wählen',
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
  const [selectedSecondHalf, setSelectedSecondHalf] = useState<MenuItem | null>(null);
  const [secondHalfSearch, setSecondHalfSearch] = useState<string>('');
  const [isHalalChicken, setIsHalalChicken] = useState<boolean>(false);
  const [quantity, setQuantity] = useState(1);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [lasagnaDate, setLasagnaDate] = useState<string>('');

  const t = labels[lang];

  const isLasagna = (item: MenuItem) => item.id.includes('lasagna');

  const handleExpand = (item: MenuItem) => {
    if (expandedId === item.id) {
      setExpandedId(null);
      setSelectedSecondHalf(null);
      setSecondHalfSearch('');
      setIsHalalChicken(false);
    } else {
      setExpandedId(item.id);
      setSelectedVariant(item.variants?.[0] ?? null);
      setSelectedSecondHalf(null);
      setSecondHalfSearch('');
      setIsHalalChicken(false);
      
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

      // Auto-scroll to the top of the card smoothly
      setTimeout(() => {
        const el = document.getElementById(`menu-item-card-${item.id}`);
        if (el) {
          const navOffset = 72;
          const rect = el.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          window.scrollTo({
            top: rect.top + scrollTop - navOffset,
            behavior: 'smooth'
          });
        }
      }, 60);
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

  const getTranslatedName = (item: { name: string; nameTh?: string; nameIt?: string; nameDe?: string }) => {
    if (lang === 'TH' && item.nameTh) return item.nameTh;
    if (lang === 'IT' && item.nameIt) return item.nameIt;
    if (lang === 'DE' && item.nameDe) return item.nameDe;
    return item.name;
  };

  const handleAdd = (item: MenuItem) => {
    if (isLasagna(item) && !lasagnaDate) return; // Block if no date selected

    const isSplit = selectedVariant?.id === 'variant-half-half';
    if (isSplit && !selectedSecondHalf) return; // Block if no 2nd half selected

    if (isSplit && selectedSecondHalf) {
      const splitPrice = Math.round((item.price + selectedSecondHalf.price) / 2);
      const splitVariantObj: Variant = {
        id: 'variant-half-half',
        name: '12"',
        nameIt: '12"',
        nameTh: '12"',
        nameDe: '12"',
        sku: `SPLIT-${item.sku || item.id}-${selectedSecondHalf.sku || selectedSecondHalf.id}`,
        price: splitPrice,
        priceModifier: 0,
      };

      const nameEn = `12" Half & Half: ${item.name} + ${selectedSecondHalf.name}`;
      const nameTh = `12" ฮาล์ฟ & ฮาล์ฟ: ${item.nameTh || item.name} + ${selectedSecondHalf.nameTh || selectedSecondHalf.name}`;
      const nameIt = `12" Metà & Metà: ${item.nameIt || item.name} + ${selectedSecondHalf.nameIt || selectedSecondHalf.name}`;
      const nameDe = `12" Halb & Halb: ${item.nameDe || item.name} + ${selectedSecondHalf.nameDe || selectedSecondHalf.name}`;

      addItem({
        productId: `${item.id}-split-${selectedSecondHalf.id}`,
        name: nameEn,
        nameTh,
        nameIt,
        nameDe,
        quantity,
        basePrice: splitPrice,
        selectedVariant: splitVariantObj,
        selectedExtras: [], // Standard extras are disabled for split
        image: item.image,
      });
    } else {
      const isChicken = hasPorkMeat(item) && isHalalChicken;
      addItem({
        productId: isChicken ? `${item.id}-chicken` : item.id,
        name: isChicken ? `${item.name} (100% Chicken 🐔)` : item.name,
        nameTh: isChicken ? `${item.nameTh || item.name} (เนื้อไก่ 100% 🐔)` : item.nameTh,
        nameIt: isChicken ? `${item.nameIt || item.name} (100% Pollo 🐔)` : item.nameIt,
        nameDe: isChicken ? `${item.nameDe || item.name} (100% Geflügel 🐔)` : item.nameDe,
        quantity,
        basePrice: item.price,
        selectedVariant,
        selectedExtras,
        image: item.image,
        lasagnaDate: isLasagna(item) ? lasagnaDate : undefined,
        isHalalChicken: isChicken,
      });
    }

    setExpandedId(null);
    setSelectedSecondHalf(null);
    setSecondHalfSearch('');
    setIsHalalChicken(false);
    openCart();
  };

  const formatProductName = (name: string) => {
    if (!name) return "";
    if (name.includes('\n')) {
      const lines = name.split('\n');
      return (
        <>
          {lines.map((line, idx) => (
            <span key={idx} className="block">
              {line}
            </span>
          ))}
        </>
      );
    }
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

  const handleAddWine = (wineItem: MenuItem) => {
    addItem({
      productId: wineItem.id,
      name: wineItem.name,
      nameTh: wineItem.nameTh,
      nameIt: wineItem.nameIt,
      nameDe: wineItem.nameDe,
      quantity: 1,
      basePrice: wineItem.price,
      image: wineItem.image,
      selectedVariant: null,
      selectedExtras: [],
    });
    openCart();
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => {
        const isExpanded = expandedId === item.id;
        const isSplit = selectedVariant?.id === 'variant-half-half';

        // Calculate dynamic total price when expanded
        let unitPriceWithCustoms = item.price;
        if (isSplit) {
          const secondHalfPrice = selectedSecondHalf ? selectedSecondHalf.price : item.price;
          unitPriceWithCustoms = Math.round((item.price + secondHalfPrice) / 2);
        } else {
          const activeVariantPrice = selectedVariant?.priceModifier ?? 0;
          const activeExtrasPrice = selectedExtras.reduce((s, e) => s + e.price, 0);
          unitPriceWithCustoms = item.price + activeVariantPrice + activeExtrasPrice;
        }
        const currentTotalPrice = unitPriceWithCustoms * quantity;

        const isWine = item.category === 'wines' || item.category === 'beers-and-wines' || (item as any).bottleScale !== undefined || !!(item as any).flag;

        if (isWine) {
          return (
            <article
              key={item.id}
              className="group bg-white border border-stone-300 rounded-[2rem] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative select-none min-h-[460px] sm:min-h-[500px]"
            >
              <div 
                onClick={() => setZoomedImage(item.image)}
                className="flex flex-row flex-grow cursor-pointer relative min-h-[460px] sm:min-h-[500px]"
              >
                {/* Left (35%): Vertical Bottle Portion */}
                <div className="w-[35%] bg-stone-50 border-r border-stone-200 p-3 flex items-center justify-center relative overflow-hidden flex-shrink-0 min-h-[460px] sm:min-h-[500px]">
                  <div 
                    className="w-full h-full flex items-center justify-center transition-transform duration-300"
                    style={{
                      transform: `scale(${((item as any).bottleScale || 100) / 100}) scaleX(${((item as any).bottleScaleX || 100) / 100}) translateX(${(((item as any).bottleOffsetX || 0) / 3.2)}%) translateY(${(((item as any).bottleOffsetY || 0) / 3.2)}%)`
                    }}
                  >
                    <img
                      src={withCacheBust(item.image)}
                      alt={getTranslatedName(item)}
                      loading="lazy"
                      decoding="async"
                      className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-stone-950/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white backdrop-blur-[0.5px]">
                    <div className="p-2 bg-stone-900/90 rounded-full border border-stone-700 shadow-md">
                      <ZoomIn size={15} className="text-white" />
                    </div>
                  </div>
                </div>

                {/* Right (65%): Details & Action Portion */}
                <div className="w-[65%] p-4 sm:p-5 flex flex-col justify-between flex-grow">
                  <div>
                    <h3
                      className="font-sans font-bold text-stone-900 leading-tight tracking-tight"
                      style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                    >
                      {formatWineProductName(getTranslatedName(item))}
                    </h3>

                    {((item as any).categorySubtitle || (item as any).flag) && (
                      <div 
                        className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-900 mt-2.5 sm:mt-3 flex items-center gap-2.5 leading-tight"
                        style={{ 
                          fontFamily: lang === 'TH' ? 'Prompt, Kanit, sans-serif' : 'Outfit, system-ui, sans-serif',
                          fontWeight: 900
                        }}
                      >
                        {(item as any).flag && <span className="shrink-0 flex items-center">{renderCountryFlag((item as any).flag)}</span>}
                        <span className={`flex-1 flex flex-col justify-center leading-snug ${lang === 'TH' ? 'font-black text-[11px] sm:text-[12px] tracking-tight' : 'font-black'}`}>
                          {formatSubtitle((item as any).categorySubtitle || '')}
                        </span>
                      </div>
                    )}

                    <p
                      className="text-stone-500 text-xs font-light leading-snug mt-3 sm:mt-3.5"
                      style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                    >
                      {getTranslatedDesc(item)}
                    </p>

                    {(item as any).alcohol && (
                      <span className="inline-block mt-1.5 text-[10px] font-bold text-stone-400">
                        {String((item as any).alcohol).replace('.', ',')} Vol.
                      </span>
                    )}
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase tracking-widest text-stone-400 font-extrabold" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                        {lang === 'TH' ? 'ราคา' : lang === 'DE' ? 'Preis' : lang === 'EN' ? 'Price' : 'Prezzo'}
                      </span>
                      {renderWinePrice(item.price)}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddWine(item);
                      }}
                      className="px-3.5 py-2 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1 bg-[#8B1E1E] hover:bg-[#721818] active:scale-95 transition-all cursor-pointer"
                      style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                    >
                      <Plus size={13} />
                      <span>{t?.confirmText || 'Aggiungi'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        }

        const isAddBlocked = isExpanded && ((isLasagna(item) && !lasagnaDate) || (isSplit && !selectedSecondHalf));

        return (
          <article
            key={item.id}
            id={`menu-item-card-${item.id}`}
            className={`group bg-white border transition-all duration-300 flex flex-col overflow-hidden will-change-transform ${
              isExpanded 
                ? 'col-span-full md:col-span-2 lg:col-span-1 rounded-[2rem] border-[#8B1E1E]/40 shadow-2xl ring-2 ring-[#8B1E1E]/20' 
                : 'rounded-[2rem] border-stone-300 shadow-sm hover:shadow-2xl hover:-translate-y-1 cursor-pointer'
            }`}
            onClick={() => !isExpanded && handleExpand(item)}
          >
            {/* IMAGE CONTAINER WITH ZOOM HOOK & CLOSE BUTTON */}
            <div 
              className={`relative bg-stone-100 overflow-hidden flex-shrink-0 rounded-t-[2rem] transition-all duration-300 ${
                isExpanded ? 'h-36 sm:h-44' : 'h-48 cursor-zoom-in'
              }`}
              onClick={(e) => {
                if (!isExpanded) {
                  e.stopPropagation();
                  setZoomedImage(item.image);
                }
              }}
            >
              <img
                src={withCacheBust(item.image)}
                alt={getTranslatedName(item)}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition-transform duration-500"
              />

              {/* Close Button when expanded */}
              {isExpanded && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(null);
                    setSelectedSecondHalf(null);
                    setSecondHalfSearch('');
                  }}
                  className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-stone-900/80 hover:bg-stone-950 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer backdrop-blur-md active:scale-95"
                  aria-label="Chiudi scheda"
                >
                  <X size={16} />
                </button>
              )}

              {/* Zoom Overlay (only active when NOT expanded) */}
              {!isExpanded && (
                <div
                  className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white backdrop-blur-[1px]"
                >
                  <div className="p-3 bg-stone-900/90 rounded-full border border-stone-700 shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
                    <ZoomIn size={20} className="text-white" />
                  </div>
                </div>
              )}
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
                                onClick={() => {
                                  setSelectedVariant(v);
                                  setSelectedSecondHalf(null);
                                }}
                                className={`px-3 py-1.5 text-[10px] font-semibold rounded-lg border transition-all duration-150 cursor-pointer ${
                                  active
                                    ? 'border-[#8B1E1E] bg-[#8B1E1E]/5 text-[#8B1E1E] font-bold shadow-sm'
                                    : 'border-stone-300 bg-white text-stone-600 hover:border-stone-400 hover:text-stone-850'
                                }`}
                                style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                              >
                                {getTranslatedName(v)}
                                {v.priceModifier > 0 && (
                                  <span className="ml-1 text-stone-400 inline-flex items-baseline gap-0.5">
                                    <span>+{v.priceModifier}</span>
                                    <span className="text-[9px] font-black select-none text-stone-400" style={{ fontFamily: 'Prompt, Kanit, IBM Plex Sans Thai, system-ui, sans-serif' }}>฿</span>
                                  </span>
                                )}
                                {v.priceModifier < 0 && (
                                  <span className="ml-1 text-stone-400 inline-flex items-baseline gap-0.5">
                                    <span>{v.priceModifier}</span>
                                    <span className="text-[9px] font-black select-none text-stone-400" style={{ fontFamily: 'Prompt, Kanit, IBM Plex Sans Thai, system-ui, sans-serif' }}>฿</span>
                                  </span>
                                )}
                              </button>
                            );
                          })}

                          {/* 12" Half & Half Option Button (if eligible) */}
                          {isEligibleForSplit(item) && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVariant({
                                  id: 'variant-half-half',
                                  name: '12" Half & Half 🌓',
                                  nameIt: '12" Metà & Metà 🌓',
                                  nameTh: '12" ฮาล์ฟ & ฮาล์ฟ 🌓',
                                  nameDe: '12" Halb & Halb 🌓',
                                  sku: 'SPLIT-12',
                                  price: item.price,
                                  priceModifier: 0,
                                });
                              }}
                              className={`px-3 py-1.5 text-[10px] font-semibold rounded-lg border transition-all duration-150 cursor-pointer flex items-center gap-1 ${
                                selectedVariant?.id === 'variant-half-half'
                                  ? 'border-[#8B1E1E] bg-[#8B1E1E] text-white font-bold shadow-md'
                                  : 'border-amber-300 bg-amber-50/60 text-amber-900 hover:border-amber-400 hover:bg-amber-100/60'
                              }`}
                              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                            >
                              <span>{t.splitVariantName}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 100% Halal Chicken Option Pill (Ultra-compact, only on meat/pork pizzas) */}
                    {hasPorkMeat(item) && selectedVariant?.id !== 'variant-half-half' && (
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50/90 border border-amber-300/80 shadow-2xs">
                        <div className="flex items-center gap-1.5 min-w-0 pr-2">
                          <span className="text-base flex-shrink-0">🐔</span>
                          <div className="min-w-0">
                            <p className="text-[10px] font-extrabold text-amber-950 leading-tight truncate" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                              {t.chickenOptionTitle}
                            </p>
                            <p className="text-[8.5px] text-amber-800/80 leading-none truncate" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                              {t.chickenOptionDesc}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsHalalChicken(!isHalalChicken)}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer flex-shrink-0 flex items-center gap-1 ${
                            isHalalChicken
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                              : 'bg-white border-stone-300 text-stone-700 hover:border-amber-400 hover:text-amber-900'
                          }`}
                          style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                        >
                          {isHalalChicken ? (
                            <>
                              <Check size={11} strokeWidth={3} />
                              <span>{t.chickenOptionSelected}</span>
                            </>
                          ) : (
                            <span>{t.chickenOptionSelect}</span>
                          )}
                        </button>
                      </div>
                    )}

                    {/* HALF & HALF 2ND HALF SELECTION PANEL */}
                    {selectedVariant?.id === 'variant-half-half' ? (
                      <div className="bg-amber-50/70 border border-amber-300/80 rounded-2xl p-3.5 space-y-3 mb-2 animate-fadeIn">
                        {/* Header & Notice */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <h4 className="text-[11px] font-extrabold uppercase tracking-wide text-amber-950 flex items-center gap-1.5" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                              <span>🌓</span>
                              <span>{t.splitChooseSecondHalf}</span>
                            </h4>
                            <span className="text-[9px] font-bold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-full">
                              50 / 50
                            </span>
                          </div>
                          <p className="text-[10px] text-amber-800/90 leading-tight" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                            {t.splitAverageNotice}
                          </p>
                        </div>

                        {/* 1st Half / 2nd Half Status Preview */}
                        <div className="grid grid-cols-2 gap-2 bg-white/95 p-2.5 rounded-xl border border-amber-200 shadow-xs">
                          <div className="border-r border-amber-100 pr-2 min-w-0">
                            <span className="text-[8.5px] uppercase tracking-wider text-stone-400 font-extrabold block">
                              {t.splitFirstHalfLabel}
                            </span>
                            <p className="text-xs font-bold text-stone-900 truncate">
                              {getTranslatedName(item)}
                            </p>
                            <span className="text-[10px] font-extrabold text-[#8B1E1E]">
                              {item.price} ฿ (12")
                            </span>
                          </div>

                          <div className="pl-1 min-w-0">
                            <span className="text-[8.5px] uppercase tracking-wider text-stone-400 font-extrabold block">
                              {t.splitSecondHalfLabel}
                            </span>
                            {selectedSecondHalf ? (
                              <div>
                                <p className="text-xs font-bold text-emerald-800 truncate flex items-center gap-1">
                                  <Check size={12} className="text-emerald-600 shrink-0" />
                                  <span>{getTranslatedName(selectedSecondHalf)}</span>
                                </p>
                                <span className="text-[10px] font-extrabold text-[#8B1E1E]">
                                  {selectedSecondHalf.price} ฿ (12")
                                </span>
                              </div>
                            ) : (
                              <p className="text-xs font-bold text-amber-700 italic">
                                {t.splitSecondHalfRequired}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Search Filter for 2nd half */}
                        <div className="relative">
                          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                          <input
                            type="text"
                            value={secondHalfSearch}
                            onChange={(e) => setSecondHalfSearch(e.target.value)}
                            placeholder={t.splitSearchPlaceholder}
                            className="w-full bg-white border border-amber-300/80 rounded-xl pl-8 pr-7 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                            style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                          />
                          {secondHalfSearch && (
                            <button
                              type="button"
                              onClick={() => setSecondHalfSearch('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>

                        {/* Scrollable Grid of 2nd Half Choices */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-transparent">
                          {allEligiblePizzas
                            .filter((pizza) => {
                              if (!secondHalfSearch.trim()) return true;
                              const q = secondHalfSearch.toLowerCase();
                              return (
                                pizza.name.toLowerCase().includes(q) ||
                                (pizza.nameIt && pizza.nameIt.toLowerCase().includes(q)) ||
                                (pizza.nameTh && pizza.nameTh.toLowerCase().includes(q)) ||
                                (pizza.nameDe && pizza.nameDe.toLowerCase().includes(q))
                              );
                            })
                            .map((pizza) => {
                              const isSelected = selectedSecondHalf?.id === pizza.id;
                              const avgSinglePrice = Math.round((item.price + pizza.price) / 2);
                              return (
                                <button
                                  key={pizza.id}
                                  type="button"
                                  onClick={() => setSelectedSecondHalf(pizza)}
                                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                                    isSelected
                                      ? 'border-[#8B1E1E] bg-[#8B1E1E] text-white shadow-sm ring-1 ring-[#8B1E1E]'
                                      : 'border-stone-200 bg-white hover:border-amber-400 hover:bg-amber-50/40 text-stone-800'
                                  }`}
                                >
                                  <img
                                    src={withCacheBust(pizza.image)}
                                    alt={getTranslatedName(pizza)}
                                    className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-stone-200"
                                  />
                                  <div className="min-w-0 flex-grow">
                                    <p className={`text-[11px] font-bold truncate ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                                      {getTranslatedName(pizza)}
                                    </p>
                                    <div className="flex items-center justify-between mt-0.5">
                                      <span className={`text-[9.5px] ${isSelected ? 'text-amber-200' : 'text-stone-400'}`}>
                                        12": {pizza.price}฿
                                      </span>
                                      <span className={`text-[10px] font-extrabold ${isSelected ? 'text-white' : 'text-[#8B1E1E]'}`}>
                                        Avg: {avgSinglePrice}฿
                                      </span>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    ) : (
                      <>
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
                                          <span className="text-[#8B1E1E] text-[11px] font-extrabold inline-flex items-baseline gap-0.5">
                                            <span>+{extra.price}</span>
                                            <span className="text-[9px] font-black select-none text-[#8B1E1E]" style={{ fontFamily: 'Prompt, Kanit, IBM Plex Sans Thai, system-ui, sans-serif' }}>฿</span>
                                          </span>
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

                        {/* Extra Ingredients Section (2 Columns compact chips) */}
                        {item.extras && item.extras.length > 0 && getGroupedExtras(item).some(g => g.type === 'extra') && (
                          <div className="space-y-1.5 mb-3">
                            {getGroupedExtras(item).filter(g => g.type === 'extra').map((group, idx) => (
                              <div key={idx} className="space-y-1.5">
                                <p className="text-[9px] uppercase tracking-widest text-stone-500 font-extrabold" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
                                  {group.title}
                                </p>
                                <div className="grid grid-cols-2 gap-1.5 max-h-40 sm:max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-transparent">
                                  {group.items.map((extra) => {
                                    const checked = !!selectedExtras.find((e) => e.id === extra.id);
                                    return (
                                      <button
                                        key={extra.id}
                                        type="button"
                                        onClick={() => toggleExtra(extra)}
                                        className={`flex items-center justify-between px-2.5 py-1.5 text-left rounded-xl border transition-all duration-150 cursor-pointer ${
                                          checked
                                            ? 'border-[#8B1E1E] bg-[#8B1E1E]/5 font-bold shadow-xs'
                                            : 'border-stone-200 bg-white hover:border-stone-300'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <div
                                            className={`w-3 h-3 flex items-center justify-center rounded transition-all flex-shrink-0 ${
                                              checked
                                                ? 'border-[#8B1E1E] bg-[#8B1E1E]'
                                                : 'border-stone-300 bg-stone-100'
                                            }`}
                                            style={{ borderWidth: '1px' }}
                                          >
                                            {checked && (
                                              <svg width="6" height="5" viewBox="0 0 10 8" fill="none">
                                                <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                              </svg>
                                            )}
                                          </div>
                                          <span className="text-stone-850 text-[11px] font-semibold truncate">{getTranslatedName(extra)}</span>
                                        </div>
                                        {extra.price > 0 ? (
                                          <span className="text-[#8B1E1E] text-[10.5px] font-extrabold inline-flex items-baseline gap-0.5 ml-1 flex-shrink-0">
                                            <span>+{extra.price}</span>
                                            <span className="text-[9px] font-black select-none text-[#8B1E1E]" style={{ fontFamily: 'Prompt, Kanit, IBM Plex Sans Thai, system-ui, sans-serif' }}>฿</span>
                                          </span>
                                        ) : (
                                          <span className="text-stone-400 text-[9.5px] ml-1 flex-shrink-0">{t.freeText}</span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
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

              {/* CARD BOTTOM INTERACT & PRICING BAR (Sticky on expanded) */}
              <div className={`mt-auto pt-3 border-t border-stone-200 transition-all duration-200 ${
                isExpanded ? 'sticky bottom-0 bg-white/95 backdrop-blur-md -mx-5 sm:-mx-6 px-5 sm:px-6 pb-2 z-10 shadow-lg rounded-b-[2rem]' : ''
              }`}>
                {!isExpanded && (item.extras?.length || item.variants?.length) ? (
                  <div className="pb-2 flex items-center gap-2 text-[9px] text-stone-400 font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B1E1E]/60 flex-shrink-0" />
                    <span>
                      {item.variants?.length ? `${t.sizeOptions} · ` : ''}
                      {item.extras?.length ? `${item.extras.length} ${t.extraIngredients}` : ''}
                    </span>
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span
                      className="block text-[10px] uppercase tracking-wider text-stone-400 font-bold"
                      style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                    >
                      {isExpanded ? t.totalFinito : t.startingAt}
                    </span>
                    {renderFormattedPrice(isExpanded ? currentTotalPrice : item.price, {
                      numClass: `text-xl font-extrabold transition-colors duration-300 ${isExpanded ? 'text-[#8B1E1E]' : 'text-stone-900'}`,
                      symbolClass: `text-sm font-black transition-colors duration-300 select-none ${isExpanded ? 'text-[#8B1E1E]' : 'text-stone-900'}`
                    })}
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
                    disabled={isAddBlocked}
                    className={`text-xs font-semibold px-5 py-2.5 rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all duration-300 hover:px-6 cursor-pointer border-0 ${
                      isAddBlocked
                        ? 'bg-stone-300 text-stone-500 cursor-not-allowed hover:shadow-md hover:px-5'
                        : 'bg-[#8B1E1E] text-white hover:bg-[#721818]'
                    }`}
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                  >
                    {isExpanded ? t.confirmText : (item.extras?.length || item.variants?.length ? t.customizeText : t.chooseText)}
                  </button>
                </div>
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
              src={withCacheBust(zoomedImage)} 
              alt="Zoomed preview" 
              className="max-w-full max-h-[80vh] object-contain rounded-[2rem]"
            />
          </div>
        </div>
      )}
    </>
  );
}
