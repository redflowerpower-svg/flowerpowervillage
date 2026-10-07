import React, { useState, useEffect, useMemo } from 'react';
import { 
  UtensilsCrossed, 
  Search, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  RotateCcw, 
  ArrowLeft,
  Sparkles,
  Filter,
  Check,
  Flame,
  Globe
} from 'lucide-react';
import { usePizzaAdminStore, PizzaMenuItem } from '../store/usePizzaAdminStore';
import { DISH_CATEGORIES } from './DishCardStudio';

interface KitchenDishAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'it' | 'en' | 'th' | 'mm' | 'de';
}

const I18N_AVAILABILITY = {
  it: {
    modalTitle: 'Disponibilità Piatti & Menu',
    modalSubtitle: 'Imposta in tempo reale i piatti disponibili o esauriti (Sold Out / 86) per sala e delivery.',
    backToKdsBtn: '🔙 Torna al Monitor Ordini Cucina',
    searchPlaceholder: 'Cerca per nome piatto...',
    allCategories: 'Tutte le Categorie',
    onlySoldOut: 'Mostra solo Sold Out',
    allDishes: 'Tutti i Piatti',
    availableBadge: 'Disponibile',
    soldOutBadge: 'Sold Out (86)',
    soldOutCountLabel: 'piatti esauriti',
    noDishesFound: 'Nessun piatto trovato',
    noDishesDesc: 'Nessun piatto corrisponde ai criteri di ricerca.',
    loadingText: 'Caricamento catalogo menu in corso...'
  },
  en: {
    modalTitle: 'Dish & Menu Availability',
    modalSubtitle: 'Toggle available or sold out dishes (86) in real-time for dining room and delivery.',
    backToKdsBtn: '🔙 Back to Kitchen Orders Monitor',
    searchPlaceholder: 'Search by dish name...',
    allCategories: 'All Categories',
    onlySoldOut: 'Show Sold Out Only',
    allDishes: 'All Dishes',
    availableBadge: 'Available',
    soldOutBadge: 'Sold Out (86)',
    soldOutCountLabel: 'sold out items',
    noDishesFound: 'No dishes found',
    noDishesDesc: 'No dishes match your search or selected category.',
    loadingText: 'Loading menu catalog...'
  },
  th: {
    modalTitle: 'จัดการความพร้อมของเมนูอาหาร',
    modalSubtitle: 'เปิดหรือปิดการสั่งเมนูที่หมด (Sold Out / 86) แบบเรียลไทม์ทั้งสำหรับหน้าร้านและเดลิเวอรี',
    backToKdsBtn: '🔙 กลับสู่หน้าจอออเดอร์ครัว',
    searchPlaceholder: 'ค้นหาชื่อเมนูอาหาร...',
    allCategories: 'ทุกหมวดหมู่',
    onlySoldOut: 'แสดงเฉพาะเมนูที่หมด',
    allDishes: 'เมนูทั้งหมด',
    availableBadge: 'พร้อมเสิร์ฟ',
    soldOutBadge: 'สินค้าหมด (Sold Out)',
    soldOutCountLabel: 'รายการที่หมด',
    noDishesFound: 'ไม่พบรายการอาหาร',
    noDishesDesc: 'ไม่มีเมนูที่ตรงกับคำค้นหาหรือหมวดหมู่ที่เลือก',
    loadingText: 'กำลังโหลดรายการเมนู...'
  },
  mm: {
    modalTitle: 'ဟင်းလျာနှင့် မီနူး ရရှိနိုင်မှု စီမံခန့်ခွဲခြင်း',
    modalSubtitle: 'စားသောက်ခန်းမနှင့် ပို့ဆောင်ရေးအတွက် ရရှိနိုင်သော သို့မဟုတ် ကုန်သွားသော ဟင်းလျာများ (Sold Out) ကို အချိန်နှင့်တပြေးညီ သတ်မှတ်ပါ။',
    backToKdsBtn: '🔙 မီးဖိုချောင် အော်ဒါ မော်နီတာသို့ ပြန်သွားမည်',
    searchPlaceholder: 'ဟင်းလျာအမည်ဖြင့် ရှာဖွေပါ...',
    allCategories: 'ကဏ္ဍအားလုံး',
    onlySoldOut: 'ကုန်သွားသည်များကိုသာ ပြပါ',
    allDishes: 'ဟင်းလျာအားလုံး',
    availableBadge: 'ရရှိနိုင်သည်',
    soldOutBadge: 'ကုန်သွားပါပြီ (Sold Out)',
    soldOutCountLabel: 'ကုန်သွားသော ဟင်းလျာများ',
    noDishesFound: 'ဟင်းလျာ မတွေ့ပါ',
    noDishesDesc: 'ရှာဖွေမှုနှင့် ကိုက်ညီသော ဟင်းလျာ မရှိပါ။',
    loadingText: 'မီနူးစာရင်းကို ရယူနေပါသည်...'
  },
  de: {
    modalTitle: 'Gerichte- & Menü-Verfügbarkeit',
    modalSubtitle: 'Verfügbarkeit von Speisen in Echtzeit für Gastraum und Lieferservice anpassen (Sold Out / 86).',
    backToKdsBtn: '🔙 Zurück zum Küchen-Monitor',
    searchPlaceholder: 'Nach Gerichtsnamen suchen...',
    allCategories: 'Alle Kategorien',
    onlySoldOut: 'Nur Ausverkaufte anzeigen',
    allDishes: 'Alle Gerichte',
    availableBadge: 'Verfügbar',
    soldOutBadge: 'Ausverkauft (86)',
    soldOutCountLabel: 'ausverkaufte Gerichte',
    noDishesFound: 'Keine Gerichte gefunden',
    noDishesDesc: 'Keine Gerichte entsprechen den Suchkriterien.',
    loadingText: 'Menükatalog wird geladen...'
  }
};

export const KitchenDishAvailabilityModal: React.FC<KitchenDishAvailabilityModalProps> = ({
  isOpen,
  onClose,
  lang = 'th'
}) => {
  const t = I18N_AVAILABILITY[lang] || I18N_AVAILABILITY.th;

  const { 
    menuItems, 
    menuLoading, 
    fetchMenuItems, 
    toggleItemAvailability 
  } = usePizzaAdminStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showOnlySoldOut, setShowOnlySoldOut] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchMenuItems();
    }
  }, [isOpen, fetchMenuItems]);

  const soldOutItemsCount = useMemo(() => {
    return menuItems.filter(i => i.is_available === false).length;
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      // Sold out filter
      if (showOnlySoldOut && item.is_available !== false) return false;

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nIt = (item.nameIt || item.name || '').toLowerCase();
        const nEn = (item.name || '').toLowerCase();
        const nTh = (item.nameTh || '').toLowerCase();
        const nDe = (item.nameDe || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        return nIt.includes(q) || nEn.includes(q) || nTh.includes(q) || nDe.includes(q) || cat.includes(q);
      }

      return true;
    });
  }, [menuItems, selectedCategory, searchQuery, showOnlySoldOut]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100000] bg-stone-950/95 backdrop-blur-xl flex flex-col text-stone-100 antialiased animate-fadeIn overflow-hidden select-none"
      style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
    >
      {/* ─── TOP BAR WITH RETURN BUTTON ────────────────────────────── */}
      <header className="px-4 sm:px-6 py-3 bg-[#120505] border-b-2 border-red-500/40 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-950/80 border border-red-400/50 shrink-0">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-none">
                {t.modalTitle}
              </h1>
              {soldOutItemsCount > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] uppercase tracking-wider animate-pulse shadow-sm">
                  {soldOutItemsCount} {t.soldOutCountLabel}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-300 font-bold text-[10px] uppercase tracking-wider">
                  Tutti Disponibili (0 Sold Out)
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-400 font-medium hidden sm:block mt-0.5">
              {t.modalSubtitle}
            </p>
          </div>
        </div>

        {/* Big Unmistakable Return Button */}
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-red-950/80 transition-all cursor-pointer border border-red-400/50"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>{t.backToKdsBtn}</span>
        </button>
      </header>

      {/* ─── FILTERS & SEARCH BAR ──────────────────────────────────── */}
      <div className="px-4 sm:px-6 py-3 bg-stone-900/90 border-b border-stone-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-stone-950 border border-stone-700 focus:border-red-500 text-white rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm placeholder:text-stone-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Sold Out Filter Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowOnlySoldOut(false)}
            className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              !showOnlySoldOut
                ? 'bg-stone-800 text-white border border-stone-600 shadow-sm'
                : 'text-stone-400 hover:text-white hover:bg-stone-850'
            }`}
          >
            {t.allDishes} ({menuItems.length})
          </button>

          <button
            type="button"
            onClick={() => setShowOnlySoldOut(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              showOnlySoldOut
                ? 'bg-red-600 text-white border border-red-400 shadow-md'
                : 'text-red-400 hover:bg-red-950/40 border border-red-900/50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t.onlySoldOut} ({soldOutItemsCount})</span>
          </button>
        </div>
      </div>

      {/* ─── CATEGORY HORIZONTAL CHIPS ─────────────────────────────── */}
      <div className="px-4 sm:px-6 py-2 bg-stone-950/80 border-b border-stone-800/80 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-stone-400 hover:text-white hover:bg-stone-850'
          }`}
        >
          {t.allCategories}
        </button>

        {DISH_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const catLabel = cat.name[lang.toUpperCase() as keyof typeof cat.name] || cat.name.IT;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-stone-850'
              }`}
            >
              {catLabel}
            </button>
          );
        })}
      </div>

      {/* ─── DISHES GRID ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-stone-950 via-[#120808] to-stone-950">
        {menuLoading && menuItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            <p className="text-stone-400 text-xs font-bold uppercase tracking-wider">
              {t.loadingText}
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-12 text-center max-w-md mx-auto my-12 space-y-3">
            <UtensilsCrossed className="w-12 h-12 text-stone-600 mx-auto" />
            <h3 className="text-stone-200 font-black text-base">{t.noDishesFound}</h3>
            <p className="text-stone-400 text-xs">{t.noDishesDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
            {filteredItems.map((item) => {
              const isAvailable = item.is_available !== false;
              const displayName = (lang === 'th' && item.nameTh) ? item.nameTh : (item.nameIt || item.name);
              const secondaryName = (lang === 'th') ? (item.nameIt || item.name) : (item.nameTh || item.nameDe || '');

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl p-3.5 sm:p-4 border-2 transition-all flex flex-col justify-between gap-3 relative shadow-lg ${
                    isAvailable
                      ? 'bg-stone-900/90 border-stone-800 hover:border-stone-700'
                      : 'bg-red-950/40 border-red-600/80 shadow-red-950/50'
                  }`}
                >
                  {/* Dish Info */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-stone-950 text-stone-400 text-[9px] font-black uppercase tracking-wider border border-stone-800 truncate">
                        {item.category}
                      </span>
                      <span className="font-mono text-xs font-black text-amber-300 shrink-0">
                        ฿{item.price || 0}
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className={`w-12 h-12 rounded-xl object-cover border border-stone-800 shrink-0 ${
                            !isAvailable ? 'grayscale opacity-50' : ''
                          }`}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-black text-white text-xs sm:text-sm leading-tight truncate">
                          {displayName}
                        </h4>
                        {secondaryName && (
                          <p className="text-[10.5px] text-stone-400 font-medium truncate mt-0.5">
                            {secondaryName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 1-Tap Toggle Availability Button */}
                  <button
                    type="button"
                    onClick={() => toggleItemAvailability(item.id, isAvailable)}
                    className={`w-full py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 ${
                      isAvailable
                        ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white border border-emerald-400/50'
                        : 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white border border-red-400 animate-pulse'
                    }`}
                  >
                    {isAvailable ? (
                      <>
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>{t.availableBadge}</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{t.soldOutBadge}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
