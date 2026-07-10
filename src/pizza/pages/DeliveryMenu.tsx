import { useState, useEffect } from 'react';
import { ShoppingCart, Globe, ChevronDown } from 'lucide-react';
import { menuData } from '../data/menuData';
import CategoryTabs from '../components/CategoryTabs';
import MenuGrid from '../components/MenuGrid';
import CartDrawer from '../components/CartDrawer';
import CheckoutFlow from '../components/CheckoutFlow';
import { useCartStore } from '../store/cartStore';

const translations = {
  IT: {
    title: 'Flower Power Pizza',
    subtitle: 'Ranong, Thailandia',
    tagline1: 'PIZZA & CUCINA ITALIANA',
    tagline2: 'Cuoca Italiana • Ingredienti Importati',
    info1: 'Aperto tutti i giorni',
    info2: '11:00 – 21:30',
    info3: 'Consegna & Ritiro',
    cartItems: 'prodotti nel carrello',
    cartItem: 'prodotto nel carrello',
    promoTitle: 'Promozioni & Consegna a Domicilio',
    deliveryLimit: 'Le consegne si effettuano esclusivamente per la città di Ranong.',
    promoFreeDelivery: 'Consegna GRATIS per ordini sopra i 200฿',
    promoFirstOrder: '10% di sconto sul tuo primo ordine',
  },
  EN: {
    title: 'Flower Power Pizza',
    subtitle: 'Ranong, Thailand',
    tagline1: 'PIZZA & ITALIAN CUISINE',
    tagline2: 'Italian Chef • Imported Ingredients',
    info1: 'Open Daily',
    info2: '11:00 – 21:30',
    info3: 'Delivery & Pickup',
    cartItems: 'items in cart',
    cartItem: 'item in cart',
    promoTitle: 'Promotions & Delivery Info',
    deliveryLimit: 'Deliveries are made exclusively within the city of Ranong.',
    promoFreeDelivery: 'FREE delivery for orders over 200฿',
    promoFirstOrder: '10% discount on your first order',
  },
  TH: {
    title: 'ฟลาวเวอร์ พาวเวอร์ พิซซ่า',
    subtitle: 'ระนอง, ประเทศไทย',
    tagline1: 'พิซซ่าและอาหารอิตาเลียน',
    tagline2: 'เชฟหญิงชาวอิตาลี • วัตถุดิบนำเข้า',
    info1: 'เปิดบริการทุกวัน',
    info2: '11:00 – 21:30',
    info3: 'บริการจัดส่งและรับที่ร้าน',
    cartItems: 'รายการในรถเข็น',
    cartItem: 'รายการในรถเข็น',
    promoTitle: 'โปรโมชั่นและข้อมูลการจัดส่ง',
    deliveryLimit: 'บริการจัดส่งเฉพาะในเขตตัวเมืองระนองเท่านั้น',
    promoFreeDelivery: 'จัดส่งฟรี เมื่อสั่งซื้อครบ 200฿ ขึ้นไป',
    promoFirstOrder: 'ส่วนลด 10% สำหรับการสั่งซื้อครั้งแรก',
  },
  DE: {
    title: 'Flower Power Pizza',
    subtitle: 'Ranong, Thailand',
    tagline1: 'PIZZA & ITALIENISCHE KÜCHE',
    tagline2: 'Italienische Köchin • Importierte Zutaten',
    info1: 'Täglich geöffnet',
    info2: '11:00 – 21:30',
    info3: 'Lieferung & Abholung',
    cartItems: 'Artikel im Warenkorb',
    cartItem: 'Artikel im Warenkorb',
    promoTitle: 'Aktionen & Lieferbedingungen',
    deliveryLimit: 'Lieferungen erfolgen ausschließlich innerhalb der Stadt Ranong.',
    promoFreeDelivery: 'KOSTENLOSE Lieferung ab 200฿ Bestellwert',
    promoFirstOrder: '10% Rabatt auf Ihre erste Bestellung',
  },
};

const categoryDetails: Record<string, Record<string, { name: string; desc: string }>> = {
  'pizze-classiche': {
    IT: { name: 'Pizze Classiche', desc: 'Impasto a fermentazione naturale' },
    EN: { name: 'Classic Pizzas', desc: 'Slow-fermented Italian dough' },
    TH: { name: 'พิซซ่าคลาสสิค', desc: 'แป้งหมักธรรมชาติสูตรดั้งเดิม' },
    DE: { name: 'Klassische Pizzas', desc: 'Natursauerteig-Pizzaboden' },
  },
  'antipasti': {
    IT: { name: 'Antipasti', desc: 'Bruschette e taglieri misti' },
    EN: { name: 'Starters', desc: 'Bruschetta and mixed platters' },
    TH: { name: 'อาหารเรียกน้ำย่อย', desc: 'บรูสเก็ตต้าและถาดรวมชีส' },
    DE: { name: 'Vorspeisen', desc: 'Bruschetta und Aufschnittteller' },
  },
  'pasta': {
    IT: { name: 'Pasta', desc: 'Primi piatti della tradizione' },
    EN: { name: 'Pasta Dishes', desc: 'Traditional Italian pasta' },
    TH: { name: 'พาสต้า', desc: 'เมนูพาสต้าอิตาเลียนดั้งเดิม' },
    DE: { name: 'Pasta', desc: 'Traditionelle italienische Pasta' },
  },
  'dolci': {
    IT: { name: 'Dolci', desc: 'Tiramisù e dessert artigianali' },
    EN: { name: 'Desserts', desc: 'Tiramisù and homemade desserts' },
    TH: { name: 'ของหวาน', desc: 'ทิรามิสุและขนมหวานโฮมเมด' },
    DE: { name: 'Desserts', desc: 'Tiramisù und hausgemachte Desserts' },
  },
  'bevande': {
    IT: { name: 'Bevande', desc: 'Bibite e shake rinfrescanti' },
    EN: { name: 'Drinks & Beverages', desc: 'Soft drinks and fresh shakes' },
    TH: { name: 'เครื่องดื่ม', desc: 'เครื่องดื่มและมิลค์เชคผลไม้สด' },
    DE: { name: 'Getränke', desc: 'Softdrinks und frische Shakes' },
  },
};

export default function DeliveryMenu() {
  const [activeCategoryId, setActiveCategoryId] = useState(menuData[0].id);
  const [showCheckout, setShowCheckout] = useState(false);
  const { getCount, getTotal, openCart } = useCartStore();
  const count = getCount();
  const total = getTotal();

  const [lang, setLang] = useState<'IT' | 'EN' | 'TH' | 'DE'>('IT');
  const [isLangOpen, setIsLangOpen] = useState(false);

  useEffect(() => {
    const browserLang = navigator.language.slice(0, 2).toUpperCase();
    if (['IT', 'EN', 'TH', 'DE'].includes(browserLang)) {
      setLang(browserLang as any);
    } else {
      setLang('EN');
    }
  }, []);

  const t = translations[lang];
  const activeCategory = menuData.find((c) => c.id === activeCategoryId) ?? menuData[0];
  const activeCategoryName = categoryDetails[activeCategory.id]?.[lang]?.name || activeCategory.name;

  return (
    <div className="min-h-screen bg-[#e7e5e4] pb-12 antialiased" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
      <div className="max-w-6xl mx-auto px-4 mt-20 md:mt-24">
        
        {/* Italian Chef Header Card */}
        <header className="relative text-stone-100 py-4 lg:py-8 px-4 md:px-8 overflow-hidden rounded-2xl shadow-lg mb-6" style={{ backgroundColor: '#3b3530' }}>
          <div
            className="absolute inset-0 opacity-40 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1600&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-[0.5px]" />

          {/* Symmetrical Language Dropdown Selector */}
          <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
            <button
              type="button"
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1 bg-black/45 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 shadow-sm text-stone-300 hover:text-white transition-all cursor-pointer font-bold text-[10px] uppercase"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang}</span>
              <ChevronDown className="w-3 h-3 transition-transform duration-200" style={{ transform: isLangOpen ? 'rotate(180deg)' : 'none' }} />
            </button>

            {isLangOpen && (
              <>
                <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsLangOpen(false)} />
                <div className="absolute right-0 mt-1.5 w-24 bg-[#3b3530]/95 backdrop-blur-md rounded-xl border border-white/10 shadow-lg z-50 overflow-hidden flex flex-col">
                  {(['IT', 'EN', 'TH', 'DE'] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => {
                        setLang(l);
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-[10px] font-bold transition-all hover:bg-white/10 cursor-pointer ${
                        lang === l ? "text-[#fca5a5] bg-white/5" : "text-stone-300"
                      }`}
                    >
                      {l === 'IT' && '🇮🇹 IT'}
                      {l === 'EN' && '🇬🇧 EN'}
                      {l === 'TH' && '🇹🇭 TH'}
                      {l === 'DE' && '🇩🇪 DE'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8">
              {/* Left Side: Logo & Brand Name */}
              <div className="flex flex-col lg:flex-row items-center gap-3.5 lg:gap-6 text-center lg:text-left w-full lg:w-auto">
                <img
                  src="/Flower_Power_Pizza_-_HotSpring.png"
                  alt="Flower Power Pizza Logo"
                  width={200}
                  height={200}
                  className="h-16 lg:h-48 w-auto drop-shadow-md mx-auto lg:mx-0 flex-shrink-0 object-contain"
                />
                <div className="flex flex-col items-center lg:items-start lg:pl-8 lg:translate-y-4">
                  <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-sans font-black tracking-tight text-stone-100 leading-tight text-center lg:text-left">
                    {t.title}
                  </h1>
                  <span className="text-[#fca5a5] font-bold tracking-widest text-[9px] md:text-xs uppercase mt-1 lg:mt-2.5 text-center lg:text-left">
                    {t.subtitle}
                  </span>
                </div>
              </div>

              {/* Right Side: Information Details */}
              <div className="flex flex-col items-center lg:items-end gap-1.5 text-center lg:text-right max-w-md w-full lg:w-auto mt-2 lg:mt-0">
                <span className="text-xs sm:text-sm md:text-xl lg:text-2xl font-extrabold text-stone-100 tracking-tight block uppercase bg-white/10 lg:bg-transparent px-3 py-0.5 rounded-full lg:p-0">
                  {t.tagline1}
                </span>
                <span className="text-[8px] md:text-xs lg:text-sm font-bold text-[#fca5a5] tracking-widest block uppercase">
                  {t.tagline2}
                </span>
                <div className="flex flex-row flex-wrap justify-center lg:justify-end gap-x-2 gap-y-0.5 text-[8px] md:text-xs font-light text-stone-200 mt-0.5">
                  <span>{t.info1}</span>
                  <span className="text-stone-400">•</span>
                  <span>{t.info2}</span>
                  <span className="text-stone-400">•</span>
                  <span>{t.info3}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Red Promotions & Delivery Banner (Solid Red background) */}
        <div className="p-5 md:p-6 bg-[#8B1E1E] text-stone-100 rounded-3xl max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-6 shadow-md mb-8 mt-2 border border-[#721818]">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 rounded-full text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </div>
          <div className="flex-1 text-center md:text-left space-y-1">
            <h4 className="text-white font-extrabold text-sm md:text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {t.promoTitle}
            </h4>
            <p className="text-stone-200 text-xs leading-relaxed">
              📍 <span className="font-semibold">{t.deliveryLimit}</span>
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-x-6 gap-y-1 pt-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs text-white font-bold">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                {t.promoFreeDelivery}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-white font-bold">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                {t.promoFirstOrder}
              </span>
            </div>
          </div>
        </div>

        {/* Category Tabs directly on background */}
        <div className="mb-6">
          <CategoryTabs categories={menuData} activeId={activeCategoryId} onChange={setActiveCategoryId} lang={lang} />
        </div>

        {/* Section Title */}
        <div className="mt-8 mb-6 px-2 flex items-center justify-between">
          <div>
            <h2 className="font-sans text-xl md:text-2xl font-black tracking-tight text-stone-900" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
              {activeCategoryName}
            </h2>
            <div className="w-8 h-0.5 bg-[#8B1E1E] mt-2" />
          </div>
        </div>

        {/* Products Grid */}
        <div className="px-1">
          <MenuGrid items={activeCategory.items} lang={lang} />
        </div>
      </div>

      {/* Floating Bottom Cart Button */}
      {count > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-30 px-4">
          <button
            onClick={openCart}
            className="flex items-center gap-4 px-6 py-4 bg-[#8B1E1E] hover:bg-[#721818] text-white shadow-2xl rounded-full transition-all duration-300 transform active:scale-[0.98] cursor-pointer font-bold border border-red-900/10"
            style={{ minWidth: '280px', maxWidth: '420px', width: '100%' }}
          >
            <div className="flex items-center gap-2 flex-1">
              <ShoppingCart size={18} />
              <span className="text-xs tracking-widest uppercase" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
                {count} {count === 1 ? t.cartItem : t.cartItems}
              </span>
            </div>
            <span className="font-light" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>{total} ฿</span>
          </button>
        </div>
      )}

      <CartDrawer onCheckout={() => setShowCheckout(true)} lang={lang} />

      {showCheckout && (
        <CheckoutFlow onClose={() => setShowCheckout(false)} onSuccess={() => setShowCheckout(false)} lang={lang} />
      )}

      {count > 0 && <div className="h-24" />}
    </div>
  );
}
