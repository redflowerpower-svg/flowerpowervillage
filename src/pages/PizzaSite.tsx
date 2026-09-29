import { useState, useEffect } from 'react';
import { useNavigate as useRRNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Menu, X, Clock, Phone, Mail, MapPin, Instagram, Facebook, Star, ShoppingCart, ShieldCheck, Truck, RotateCcw, Building2 } from 'lucide-react';
import DeliveryMenu from '../pizza/pages/DeliveryMenu';
import { GloriaFoodLanding } from '../pizza/pages/GloriaFoodLanding';
import { useCartStore } from '../pizza/store/cartStore';
import PizzaSlideshow from '../components/PizzaSlideshow';
import { fetchPizzeriaStatus, usePizzeriaStatus, DEFAULT_PIZZERIA_STATUS } from '../pizza/services/pizzaServiceStatus';
import PizzaPoliciesModal, { PolicyTab } from '../pizza/components/PizzaPoliciesModal';
import { PizzaStructuredData } from '../pizza/components/PizzaStructuredData';
import { TableReservationModal } from '../pizza/components/TableReservationModal';

function usePizzeriaHours() {
  const st = usePizzeriaStatus();
  return st.openingHours?.openTime && st.openingHours?.closeTime
    ? `${st.openingHours.openTime} – ${st.openingHours.closeTime}`
    : '11:00 – 21:30';
}


// Custom robust TikTok SVG icon matching Lucide style
const TiktokIcon = ({ className, size = 14 }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

type PizzaPage = 'home' | 'order' | 'about' | 'contact' | 'menu';

const subPathToPage: Record<string, PizzaPage> = {
  order: 'order',
  about: 'about',
  contact: 'contact',
};

export const pizzaMenu = [
  {
    category: 'Antipasti',
    items: [
      { name: 'Bruschetta al Pomodoro', desc: 'Toasted sourdough, ripe tomato, basil, extra virgin olive oil' },
      { name: 'Tagliere Misto', desc: 'Selection of Italian cured meats, cheese, olives, and grissini' },
      { name: 'Caprese', desc: 'Buffalo mozzarella, heritage tomato, fresh basil, olive oil' },
    ],
  },
  {
    category: 'Pizza',
    items: [
      { name: 'Margherita', desc: 'San Marzano tomato, fior di latte, fresh basil, olive oil' },
      { name: 'Marinara', desc: 'Tomato, garlic, oregano, extra virgin olive oil — the original' },
      { name: 'Diavola', desc: 'Spicy Calabrian salami, mozzarella, tomato, chilli' },
      { name: 'Quattro Formaggi', desc: 'Mozzarella, gorgonzola, taleggio, parmesan' },
      { name: 'Prosciutto e Funghi', desc: 'Prosciutto cotto, champignon mushrooms, mozzarella, tomato' },
      { name: 'Vegetariana', desc: 'Grilled courgette, roasted peppers, aubergine, mozzarella' },
      { name: 'Quattro Stagioni', desc: 'Artichoke, ham, mushrooms, black olives — four seasons' },
      { name: 'Salmone', desc: 'Smoked salmon, capers, cream cheese, red onion' },
    ],
  },
  {
    category: 'Pasta',
    items: [
      { name: 'Spaghetti Carbonara', desc: 'Guanciale, egg yolk, pecorino romano, black pepper' },
      { name: "Penne all'Arrabbiata", desc: 'Spicy tomato, garlic, parsley — classic Roman' },
      { name: 'Rigatoni al Ragù', desc: 'Slow-cooked beef and pork ragù, parmesan' },
      { name: 'Linguine allo Scoglio', desc: 'Mixed seafood, cherry tomato, white wine, garlic' },
    ],
  },
  {
    category: 'Dolci',
    items: [
      { name: 'Tiramisù', desc: 'Classic recipe — mascarpone, espresso, ladyfingers, cocoa' },
      { name: 'Panna Cotta', desc: 'Vanilla cream, seasonal berry coulis' },
    ],
  },
];


const navItems = [
  { label: 'ORDINA ONLINE', id: 'order' as PizzaPage },
  { label: 'CHI SIAMO', id: 'about' as PizzaPage },
  { label: 'CONTATTI', id: 'contact' as PizzaPage },
];

function PizzaNav({ 
  activePage, 
  onNavigate,
  pizzaMode,
  onToggleMode,
  showSwitcher = true,
  currentLang = 'IT',
  onOpenReservation
}: { 
  activePage: PizzaPage; 
  onNavigate: (p: PizzaPage) => void;
  pizzaMode: 'custom' | 'legacy';
  onToggleMode: (mode: 'custom' | 'legacy') => void;
  showSwitcher?: boolean;
  currentLang?: 'IT' | 'EN' | 'TH' | 'DE';
  onOpenReservation?: () => void;
}) {
  const rrNavigate = useRRNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = useCartStore((s) => s.getCount());
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id: PizzaPage) => {
    onNavigate(id);
    setMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 shadow-md ${
          scrolled
            ? 'bg-[#3b3530]/95 backdrop-blur-md border-b border-stone-700/50'
            : 'bg-[#3b3530] border-b border-stone-800'
        }`}
      >

        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => rrNavigate('/')}
              className="flex items-center gap-1.5 text-stone-400 hover:text-white transition-colors duration-200 text-xs font-semibold uppercase tracking-wider cursor-pointer bg-transparent border-0"
              title="Home"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">HOME</span>
            </button>
            <div className="h-4 w-px bg-stone-700/60 hidden sm:block" />
            <button
              onClick={() => handleNavClick('order')}
              className="flex items-center gap-2.5 text-left cursor-pointer group bg-transparent border-0"
            >
              <img 
                src="/flower-power-pizza-logo-160.png" 
                alt="Flower Power Pizza Ranong" 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-red-800/80 shadow-xs group-hover:scale-105 transition-transform" 
              />
              <span className="font-sans font-black tracking-tight text-white text-base md:text-lg group-hover:text-[#f87171] transition-colors">
                FLOWER POWER <span className="font-light italic text-[#f87171]">Pizza</span>
              </span>
            </button>

            {/* Switcher Sito Nuovo vs Sito Vecchio (Visibile solo in Staging / Sviluppo, Nascosto sui Domini Ufficiali) */}
            {showSwitcher && (
              <div className="hidden sm:flex items-center bg-stone-900/80 p-0.5 rounded-xl border border-stone-700/80 shadow-inner ml-2">
                <button
                  type="button"
                  onClick={() => onToggleMode('custom')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                    pizzaMode === 'custom'
                      ? 'bg-[#8B1E1E] text-white shadow-sm font-black'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
                >
                  Sito Nuovo
                </button>
                <button
                  type="button"
                  onClick={() => onToggleMode('legacy')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                    pizzaMode === 'legacy'
                      ? 'bg-amber-600 text-white shadow-sm font-black'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
                >
                  Sito Vecchio
                </button>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer pb-0.5 border-b-2 bg-transparent hover:text-white ${
                    isActive
                      ? 'text-[#fca5a5] border-[#fca5a5] font-bold'
                      : 'text-stone-300 border-transparent hover:border-stone-400/50'
                  }`}
                  style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                >
                  {item.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={onOpenReservation}
              className="text-xs font-black uppercase tracking-wider text-amber-300 hover:text-white transition-all cursor-pointer px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-1.5"
              style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
            >
              <span>🍽️</span>
              <span>PRENOTA TAVOLO</span>
            </button>

            <button
              onClick={openCart}
              className="relative flex items-center gap-2 bg-[#8B1E1E] hover:bg-[#721818] text-white px-3.5 py-1.5 rounded-xl transition-all duration-200 font-bold text-xs shadow-sm active:scale-95 cursor-pointer"
            >
              <ShoppingCart size={15} />
              <span>CARRELLO</span>
              {cartCount > 0 && (
                <span className="bg-white text-[#8B1E1E] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={openCart}
              className="relative p-2 text-white bg-[#8B1E1E] rounded-xl hover:bg-[#721818] transition-colors"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-400 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-stone-300 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-fadeIn"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-[#3b3530] border-l border-stone-700 p-6 flex flex-col shadow-2xl md:hidden animate-slideLeft">
            <div className="flex items-center justify-between border-b border-stone-700/50 pb-4 mb-4">
              <span className="font-sans font-black text-white text-md">
                Menu
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-stone-400 hover:text-white cursor-pointer bg-transparent border-0"
              >
                <X size={22} />
              </button>
            </div>

            {/* Mobile Switcher Sito Nuovo vs Sito Vecchio (Nascosto sui Domini Ufficiali) */}
            {showSwitcher && (
              <div className="mb-5 p-1 bg-stone-900/90 rounded-2xl border border-stone-700 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => { onToggleMode('custom'); setMenuOpen(false); }}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] uppercase font-extrabold tracking-wider transition-all text-center cursor-pointer ${
                    pizzaMode === 'custom'
                      ? 'bg-[#8B1E1E] text-white shadow-sm'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
                >
                  Sito Nuovo
                </button>
                <button
                  type="button"
                  onClick={() => { onToggleMode('legacy'); setMenuOpen(false); }}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] uppercase font-extrabold tracking-wider transition-all text-center cursor-pointer ${
                    pizzaMode === 'legacy'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
                >
                  Sito Vecchio
                </button>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenReservation?.();
                }}
                className="text-left text-xs font-black uppercase tracking-wider py-3 px-3.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:text-white flex items-center justify-between transition-all cursor-pointer shadow-sm"
              >
                <span>🍽️ PRENOTA TAVOLO</span>
                <span>👉</span>
              </button>

              {navItems.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`text-left text-sm font-semibold uppercase tracking-wider py-2.5 px-3 rounded-xl transition-all cursor-pointer bg-transparent border-0 ${
                      isActive
                        ? 'bg-red-950/40 text-[#fca5a5] font-bold border-l-4 border-[#fca5a5]'
                        : 'text-stone-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

          </div>
        </>
      )}
    </>
  );
}

function PizzaHero({ onNavigate }: { onNavigate: (p: PizzaPage) => void }) {
  const hours = usePizzeriaHours();
  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden">
      <PizzaSlideshow />
      <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)' }} />
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white text-center px-6">

        <p
          className="text-xs tracking-[0.45em] uppercase mb-5 animate-fade-in-up"
          style={{ fontFamily: 'Inter, sans-serif', opacity: 0.75, animationDelay: '0.1s' }}
        >
          Ranong · Thailand
        </p>
        <h1
          className="mb-4 animate-fade-in-up"
          style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontWeight: 300,
            fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
            lineHeight: 1.05,
            animationDelay: '0.2s',
          }}
        >
          Flower Power<br />
          <em>Pizza Ranong</em>
        </h1>
        <div className="w-16 h-px bg-white mx-auto mb-5 animate-fade-in-up" style={{ opacity: 0.4, animationDelay: '0.35s' }} />
        <p
          className="text-sm tracking-[0.2em] uppercase font-light mb-10 animate-fade-in-up"
          style={{ opacity: 0.7, animationDelay: '0.45s', fontFamily: 'Inter, sans-serif' }}
        >
          Authentic Italian · Open Daily {hours}
        </p>
        <div className="flex gap-4 flex-wrap justify-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <button
            onClick={() => onNavigate('order')}
            className="px-9 py-3.5 bg-red-700 text-white text-xs tracking-[0.2em] uppercase hover:bg-red-800 transition-colors duration-300"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Order Online
          </button>
          <button
            onClick={() => onNavigate('menu')}
            className="px-9 py-3.5 border border-white text-white text-xs tracking-[0.2em] uppercase hover:bg-white hover:text-stone-800 transition-all duration-300"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            View Menu
          </button>
        </div>
      </div>
    </section>
  );
}

function PizzaAboutPage() {
  const hours = usePizzeriaHours();
  return (
    <section className="pt-24 pb-20 bg-[#e7e5e4] min-h-screen" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.4em] uppercase text-[#8B1E1E] mb-3 font-semibold">
            La nostra storia & Tradizione Artigianale
          </p>
          <h2
            className="text-stone-900 mb-4 font-black tracking-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Cuore Italiano, Anima <em>Ranong</em>
          </h2>
          <div className="w-12 h-0.5 bg-[#8B1E1E] mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-14">
          <img
            src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Authentic Italian cooking"
            className="w-full h-80 object-cover rounded-3xl border border-stone-300 shadow-sm"
          />
          <div className="space-y-4">
            <p className="text-stone-700 text-sm leading-relaxed font-light">
              <strong>Flower Power Pizza Ranong</strong> porta i sapori autentici della grande tradizione gastronomica italiana nel cuore di Ranong. Immerso in una splendida oasi naturale con una <strong>cascata privata</strong>, un tranquillo laghetto, sala interna climatizzata, terrazza all'aperto e caratteristiche <strong>capanne tradizionali</strong> nel giardino.
            </p>
            <p className="text-stone-600 text-sm leading-relaxed font-light">
              Tutte le nostre pizze nascono da un impasto a <strong>lunga lievitazione naturale (48 ore)</strong> preparato esclusivamente con <strong>farina 100% italiana</strong>. Prepariamo quotidianamente a mano la nostra <strong>pasta fresca</strong>, la <strong>salsiccia artigianale</strong> secondo antica ricetta norcina, focacce fragranti, piatti speciali periodici dello Chef, una selezione di vini di qualità, autentica caffetteria italiana e succhi naturali di frutta fresca.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { label: 'Cucina & Pasta', value: '100% Artigianale' },
                { label: 'Orari Pizzeria', value: hours },
                { label: 'Servizi', value: 'Sala, Capanne & Delivery' },
                { label: 'Impasto Pizza', value: 'Lievitazione 48h' },
              ].map((f, i) => (
                <div key={i} className="bg-white border border-stone-300 rounded-2xl p-4 shadow-sm text-center">
                  <p className="text-stone-400 text-[10px] uppercase font-bold tracking-wider mb-1">{f.label}</p>
                  <p className="text-stone-850 text-xs font-extrabold">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { quote: "La pizza è spettacolare, l'impasto 48h è leggerissimo e gli ingredienti sono davvero italiani. La cascata privata nel giardino crea un'atmosfera magica!", author: 'Marco V.' },
            { quote: "La pasta fresca fatta in casa e la salsiccia artigianale sono eccezionali. Il posto con il laghetto e le capanne è unico in tutta Ranong.", author: 'Sarah L.' },
            { quote: "Vera pizza italiana cotta a regola d'arte, servizio delivery velocissimo in hotel e caffè espresso perfetto. Super consigliato!", author: 'Giovanni R.' },
          ].map((r, i) => (
            <div key={i} className="bg-white border border-stone-300 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={12} className="text-[#8B1E1E] fill-[#8B1E1E]" />
                ))}
              </div>
              <p className="text-stone-700 text-xs italic leading-relaxed mb-4 flex-1">"{r.quote}"</p>
              <p className="text-stone-400 text-[10px] uppercase tracking-wider font-bold">— {r.author}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

function PizzaContactPage({ onNavigate }: { onNavigate?: (p: PizzaPage) => void }) {
  const hours = usePizzeriaHours();
  return (
    <section className="pt-24 pb-20 bg-[#e7e5e4] min-h-screen" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Clean, Elegant Header */}
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-[11px] sm:text-xs tracking-[0.35em] uppercase text-[#8B1E1E] mb-2 font-bold">
            Contatti & Posizione
          </p>
          <h1
            className="text-stone-900 font-black tracking-tight"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
          >
            Flower Power Pizza Ranong
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm font-medium mt-1">
            Autentica Pizzeria & Ristorante Italiano • Raksawarin Hot Springs
          </p>
          <div className="w-12 h-0.5 bg-[#8B1E1E] mx-auto mt-3.5" />
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Left Column: Direct Contact, Location & Hours (7 cols) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            
            {/* Card 1: Indirizzo Pizzeria con link Maps */}
            <div className="bg-white border border-stone-200/90 rounded-[2rem] p-5 sm:p-6 shadow-xs hover:border-stone-300 transition-all">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 bg-[#8B1E1E]/10 flex items-center justify-center shrink-0 rounded-2xl">
                  <MapPin size={18} className="text-[#8B1E1E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-stone-400 text-[10px] uppercase tracking-wider font-bold mb-0.5">Indirizzo / Location</p>
                  <p className="text-stone-900 text-sm font-extrabold">FLOWER POWER PIZZA</p>
                  <p className="text-stone-700 text-xs font-medium mt-0.5">129/6 Mo 1, Tambon Bang Rin, Muang Ranong 85000</p>
                  <p className="text-stone-500 text-xs font-thai mt-0.5">129/6 หมู่1 ต.บางริ้น อ.เมือง จ.ระนอง 85000</p>
                  <div className="mt-3">
                    <a
                      href="https://maps.app.goo.gl/6xdREhJ3bu7kzVzY6"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8B1E1E]/5 hover:bg-[#8B1E1E]/10 text-[#8B1E1E] text-xs font-bold rounded-xl border border-[#8B1E1E]/20 transition-all"
                    >
                      <span>Apri su Google Maps</span>
                      <span className="text-[11px]">↗</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Orari di Apertura */}
            <div className="bg-white border border-stone-200/90 rounded-[2rem] p-5 sm:p-6 shadow-xs hover:border-stone-300 transition-all">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 bg-emerald-500/10 flex items-center justify-center shrink-0 rounded-2xl">
                  <Clock size={18} className="text-emerald-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-stone-400 text-[10px] uppercase tracking-wider font-bold mb-0.5">Orari di Servizio</p>
                  <p className="text-stone-900 text-sm font-extrabold">Tutti i giorni · {hours}</p>
                  <p className="text-stone-600 text-xs font-medium mt-0.5">
                    Servizio al tavolo, asporto e consegna a domicilio (fino a 5 km da Bang Rin)
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Telefoni & WhatsApp */}
            <div className="bg-white border border-stone-200/90 rounded-[2rem] p-5 sm:p-6 shadow-xs hover:border-stone-300 transition-all">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 bg-amber-500/10 flex items-center justify-center shrink-0 rounded-2xl">
                  <Phone size={18} className="text-amber-800" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-stone-400 text-[10px] uppercase tracking-wider font-bold">Telefoni & Assistenza</p>
                  
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-xs font-semibold text-stone-700">Direct & WhatsApp:</span>
                    <a href="tel:+66949800200" className="text-xs font-mono font-extrabold text-[#8B1E1E] hover:underline">
                      +66 (0) 949 800 200
                    </a>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-xs font-semibold text-stone-700">Thai Support (Pon):</span>
                    <a href="tel:0858844852" className="text-xs font-mono font-extrabold text-[#8B1E1E] hover:underline">
                      085 884 4852
                    </a>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-xs font-semibold text-stone-700">Ordini Rapidi (Thai):</span>
                    <a href="tel:0956502969" className="text-xs font-mono font-extrabold text-[#8B1E1E] hover:underline">
                      095 650 2969
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Email & Canali Social */}
            <div className="bg-white border border-stone-200/90 rounded-[2rem] p-5 sm:p-6 shadow-xs hover:border-stone-300 transition-all">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 bg-indigo-500/10 flex items-center justify-center shrink-0 rounded-2xl">
                  <Mail size={18} className="text-indigo-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-stone-400 text-[10px] uppercase tracking-wider font-bold mb-1">Email Ufficiale</p>
                  <a
                    href="mailto:flowerpowerpizzaranong.th@gmail.com"
                    className="text-[#8B1E1E] hover:text-[#721818] font-bold text-xs sm:text-sm break-all inline-block transition-colors"
                  >
                    flowerpowerpizzaranong.th@gmail.com
                  </a>

                  {/* Social Buttons */}
                  <div className="pt-3.5 flex flex-wrap gap-2">
                    <a
                      href="https://www.tiktok.com/@flowerpowerpizzaranong"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 text-stone-700 text-xs hover:border-[#8B1E1E] hover:text-[#8B1E1E] transition-all bg-stone-50 rounded-xl font-bold shadow-2xs"
                    >
                      <TiktokIcon size={13} className="text-[#8B1E1E]" /> TikTok
                    </a>
                    <a
                      href="https://www.instagram.com/flowerpowerpizzaranong"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 text-stone-700 text-xs hover:border-[#8B1E1E] hover:text-[#8B1E1E] transition-all bg-stone-50 rounded-xl font-bold shadow-2xs"
                    >
                      <Instagram size={13} className="text-[#8B1E1E]" /> Instagram
                    </a>
                    <a
                      href="https://www.facebook.com/flowerpowerpizzaranong"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 text-stone-700 text-xs hover:border-[#8B1E1E] hover:text-[#8B1E1E] transition-all bg-stone-50 rounded-xl font-bold shadow-2xs"
                    >
                      <Facebook size={13} className="text-[#8B1E1E]" /> Facebook
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Official Brand Card & Company Head Office (5 cols) */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-5">
            
            {/* Brand Logo Presentation Card */}
            <div className="bg-gradient-to-br from-[#2e2621] via-[#221c18] to-[#151210] border border-amber-900/30 text-white rounded-[2.5rem] p-6 sm:p-8 shadow-xl text-center flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <img
                src="/Flower_Power_Pizza_-_HotSpring.png"
                alt="Flower Power Pizza Emblem"
                className="h-28 sm:h-36 max-w-[240px] w-auto object-contain drop-shadow-md mb-4"
              />

              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider mb-2.5">
                Raksawarin Hot Springs · Ranong
              </span>

              <h3 className="text-white font-black text-base sm:text-lg tracking-tight">
                Tradizione Artigianale Italiana
              </h3>

              <p className="text-stone-300 text-xs font-normal leading-relaxed mt-2 max-w-xs">
                Farine italiane selezionate, lievitazione naturale 48 ore, pasta fresca artigianale e carni genuine in un'oasi tropicale rilassante.
              </p>

              {onNavigate && (
                <button
                  onClick={() => onNavigate('order')}
                  className="w-full mt-5 py-3 px-5 bg-[#8B1E1E] hover:bg-[#a12424] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span className="group-hover:scale-110 transition-transform">🍕</span>
                  <span>SFOGLIA IL MENU DELIVERY</span>
                </button>
              )}
            </div>

            {/* Dati Societari / Head Office */}
            <div className="bg-white border border-stone-200/90 rounded-[2rem] p-5 sm:p-6 shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 bg-[#8B1E1E]/10 flex items-center justify-center shrink-0 rounded-2xl">
                  <Building2 size={18} className="text-[#8B1E1E]" />
                </div>
                <div className="text-xs flex-1 min-w-0">
                  <p className="text-stone-400 text-[10px] uppercase tracking-wider font-bold mb-1">Sede Legale / Head Office</p>
                  <p className="text-stone-900 font-extrabold text-xs sm:text-sm">ONLY PON CO., LTD</p>
                  <p className="text-stone-600 font-thai text-[11px] font-semibold">บริษัท โอนลี่พล จำกัด (สำนักงานใหญ่)</p>
                  <p className="text-stone-500 text-[11px] mt-1 leading-relaxed">
                    14/32 M.1 Sub-district Koh Phayam, District Meaung Ranong, Province Ranong 85000<br />
                    <span className="font-thai text-[10px]">14/32 ม.1 ต. เกาะพยาม อ.เมืองระนอง จ.ระนอง 85000</span>
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-stone-500 text-[11px] font-medium">Tax ID:</span>
                    <span className="font-mono text-[#8B1E1E] font-black text-xs">0845562009083</span>
                    <span className="font-thai text-[10px] text-stone-400">(เลขประจำตัวผู้เสียภาษี)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

export function PizzaHomePage({ onNavigate }: { onNavigate: (p: PizzaPage) => void }) {
  const hours = usePizzeriaHours();
  return (
    <>
      <PizzaHero onNavigate={onNavigate} />

      <section className="py-16 bg-stone-900">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-px bg-stone-800">
          {[
            { label: '100% Italian', sub: 'Every ingredient sourced with care' },
            { label: 'Daily Fresh', sub: 'Dough made fresh every morning' },
            { label: 'Open All Year', sub: 'Breakfast through dinner daily' },
            { label: 'Order Online', sub: 'Delivery & pickup available' },
          ].map((f, i) => (
            <div key={i} className="bg-stone-900 p-7 text-center">
              <p className="text-white mb-1.5" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.2rem', fontWeight: 400 }}>
                {f.label}
              </p>
              <p className="text-stone-500 text-xs">{f.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 bg-stone-950">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.4em] uppercase text-red-500 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
              Our Specialties
            </p>
            <h2 className="text-white mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300 }}>
              From Naples to Ranong
            </h2>
            <div className="w-12 h-px bg-red-700 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Pizza Napoletana', desc: 'Hand-stretched dough, slow-fermented 48 hours, topped with the finest Italian ingredients.', img: 'https://images.pexels.com/photos/905847/pexels-photo-905847.jpeg?auto=compress&cs=tinysrgb&w=600' },
              { title: 'Pasta Artigianale', desc: 'Classic Roman and Northern Italian pasta dishes made from scratch with imported Italian pasta.', img: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=600' },
              { title: 'Italian Breakfast', desc: 'Start your day the Italian way — espresso, freshly baked cornetti, and seasonal fruit.', img: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600' },
            ].map((item, i) => (
              <div key={i} className="group overflow-hidden border border-stone-800 hover:border-red-900 transition-colors duration-300">
                <div className="h-52 overflow-hidden">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <h3 className="text-white mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.2rem', fontWeight: 400 }}>
                    {item.title}
                  </h3>
                  <p className="text-stone-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10 flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => onNavigate('order')}
              className="px-10 py-3.5 bg-red-700 text-white text-xs tracking-[0.2em] uppercase hover:bg-red-800 transition-colors duration-300"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Order Online
            </button>
            <button
              onClick={() => onNavigate('menu')}
              className="px-10 py-3.5 border border-red-800 text-red-400 text-xs tracking-[0.2em] uppercase hover:bg-red-900 hover:text-white transition-all duration-300"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Full Menu
            </button>
          </div>
        </div>
      </section>

      <section className="py-14 bg-red-900">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="text-white mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2rem', fontWeight: 300 }}>
            Come taste <em>the real Italy</em>
          </h3>
          <p className="text-red-200 text-sm mb-6">Open daily · {hours} · Ranong Province, Thailand</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="tel:+66958825573"
              className="inline-block px-8 py-3 border border-red-300 text-white text-xs tracking-[0.2em] uppercase hover:bg-white hover:text-red-800 transition-all duration-300"
              style={{ fontFamily: 'Inter, sans-serif' }}>
              Call +66 95 882 5573
            </a>
            <button onClick={() => onNavigate('order')}
              className="inline-block px-8 py-3 bg-white text-red-800 text-xs tracking-[0.2em] uppercase hover:bg-red-100 transition-all duration-300"
              style={{ fontFamily: 'Inter, sans-serif' }}>
              Order Now
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default function PizzaSite() {
  const rrNavigate = useRRNavigate();
  const location = useLocation();

  const getPageFromPath = (): PizzaPage => {
    const sub = location.pathname.replace('/pizza', '').replace(/^\//, '');
    if (sub === '') return 'order';
    return subPathToPage[sub] ?? 'order';
  };

  const [activePage, setActivePage] = useState<PizzaPage>(getPageFromPath);
  const [pizzaMode, setPizzaMode] = useState<'custom' | 'legacy'>(() => {
    const saved = localStorage.getItem('flower_power_pizza_mode');
    return (saved === 'legacy' || saved === 'custom') ? saved : 'custom';
  });
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState<PolicyTab>('delivery');
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<'IT' | 'EN' | 'TH' | 'DE'>('EN');

  useEffect(() => {
    const detect = () => {
      const attr = document.documentElement.getAttribute('data-lang');
      if (attr && ['IT', 'EN', 'TH', 'DE'].includes(attr)) {
        setCurrentLang(attr as any);
      }
    };
    detect();
    const observer = new MutationObserver(detect);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });
    return () => observer.disconnect();
  }, []);

  const openPolicy = (tab: PolicyTab) => {
    setPolicyTab(tab);
    setPolicyModalOpen(true);
  };

  const handleToggleMode = (mode: 'custom' | 'legacy') => {
    setPizzaMode(mode);
    localStorage.setItem('flower_power_pizza_mode', mode);
  };

  useEffect(() => {
    setActivePage(getPageFromPath());
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navigate = (page: PizzaPage) => {
    const path = page === 'order' ? '/pizza' : `/pizza/${page}`;
    rrNavigate(path);
  };

  const renderPage = () => {
    if (pizzaMode === 'legacy') {
      return <GloriaFoodLanding onSwitchToCustom={() => handleToggleMode('custom')} />;
    }
    switch (activePage) {
      case 'order': return <DeliveryMenu />;
      case 'about': return <PizzaAboutPage />;
      case 'contact': return <PizzaContactPage onNavigate={navigate} />;
      default: return <DeliveryMenu />;
    }
  };

  const isOfficialDomain = (() => {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname.toLowerCase();
    return host.includes('flowerpowerpizza.com') || host.includes('flowerpowervillage.com');
  })();

  const showSwitcher = (() => {
    if (typeof window === 'undefined') return false;
    if (isOfficialDomain) {
      const params = new URLSearchParams(window.location.search);
      return params.get('switcher') === 'true'; // Hidden on official production domain
    }
    return true; // Visible in staging / local dev
  })();

  return (
    <div className="min-h-screen" style={{ background: '#1c1917' }}>
      <PizzaStructuredData />
      <PizzaNav 
        activePage={activePage} 
        onNavigate={navigate}
        pizzaMode={pizzaMode}
        onToggleMode={handleToggleMode}
        showSwitcher={showSwitcher}
        currentLang={currentLang}
        onOpenReservation={() => setIsReservationOpen(true)}
      />
      <main>{renderPage()}</main>

      <footer className="bg-stone-950 border-t border-stone-850 pt-12 pb-8 text-stone-400">
        <div className="max-w-7xl mx-auto px-6">
          {/* Main 3-column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-stone-850 text-xs">
            {/* Column 1: Restaurant Branch & Contact */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-black text-sm tracking-wide">
                <MapPin className="w-4 h-4 text-[#8B1E1E]" />
                <span>FLOWER POWER PIZZA</span>
              </div>
              <p className="text-stone-300 font-semibold leading-relaxed">
                129/6 Mo 1, Tambon Bang Rin, Muang Ranong 85000<br />
                <span className="font-thai text-stone-400">129/6 หมู่1 ต.บางริ้น อ.เมือง จ.ระนอง 85000</span>
              </p>
              <div className="space-y-1.5 text-stone-300 pt-1">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-stone-500" />
                  <span>Phone Pon: <a href="tel:0858844852" className="hover:text-white underline font-mono">0858844852</a></span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-stone-500" />
                  <span>เบอร์โทร (Thai): <a href="tel:0956502969" className="hover:text-white underline font-mono">0956502969</a></span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-stone-500" />
                  <a href="mailto:flowerpowerpizzaranong.th@gmail.com" className="hover:text-white truncate underline">flowerpowerpizzaranong.th@gmail.com</a>
                </p>
              </div>
            </div>

            {/* Column 2: Legal Corporate Info (Head Office) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-black text-sm tracking-wide">
                <Building2 className="w-4 h-4 text-amber-500" />
                <span>CORPORATE / HEAD OFFICE</span>
              </div>
              <div>
                <p className="text-stone-200 font-bold">ONLY PON CO., LTD (Head office)</p>
                <p className="font-thai text-stone-400 text-[11px]">บริษัท โอนลี่พล จำกัด (สำนักงานใหญ่)</p>
              </div>
              <p className="text-stone-400 leading-relaxed text-[11px]">
                14/32 M.1 Sub-district Koh Phayam, District Meaung Ranong, Province Ranong 85000<br />
                <span className="font-thai">14/32 ม.1 ต. เกาะพยาม อ.เมืองระนอง จ.ระนอง 85000</span>
              </p>
              <div className="pt-1">
                <p className="text-stone-300">
                  <span className="text-stone-400">Taxpayer ID:</span> <span className="font-mono text-amber-400 font-bold">0845562009083</span>
                </p>
                <p className="font-thai text-stone-500 text-[10px]">เลขประจำตัวผู้เสียภาษี 0845562009083</p>
              </div>
            </div>

            {/* Column 3: Business Policies & Payment Security */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-black text-sm tracking-wide">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>POLICIES & COMPLIANCE</span>
              </div>
              <p className="text-stone-400 leading-relaxed text-[11px]">
                Transparent policies for safe ordering, fully compliant with Omise Payment Gateway & Thai PDPA.
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => openPolicy('delivery')}
                  className="flex items-center gap-2 text-stone-300 hover:text-white transition-colors cursor-pointer text-left"
                >
                  <Truck className="w-3.5 h-3.5 text-[#8B1E1E]" />
                  <span className="underline">Delivery & Shipping Policy (Free over 300฿)</span>
                </button>
                <button
                  type="button"
                  onClick={() => openPolicy('refund')}
                  className="flex items-center gap-2 text-stone-300 hover:text-white transition-colors cursor-pointer text-left"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                  <span className="underline">Cancellation & Refund Policy (100% Refund)</span>
                </button>
                <button
                  type="button"
                  onClick={() => openPolicy('privacy')}
                  className="flex items-center gap-2 text-stone-300 hover:text-white transition-colors cursor-pointer text-left"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="underline">Privacy Policy (Thai PDPA & Omise PCI-DSS)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Middle bar: Nav items + Payment methods */}
          <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-stone-850">
            <div className="flex flex-wrap gap-5">
              {(['order', 'about', 'contact'] as PizzaPage[]).map(p => (
                <button key={p} onClick={() => navigate(p)}
                  className="text-xs text-stone-400 uppercase tracking-wider hover:text-red-400 transition-colors font-bold cursor-pointer">
                  {p === 'order' ? 'ORDINA ONLINE' : p === 'about' ? 'CHI SIAMO' : p.toUpperCase()}
                </button>
              ))}
              <a 
                href="/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-stone-500 uppercase tracking-wider hover:text-red-400 transition-colors font-bold"
              >
                PRIVATE AREA
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400">
              <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Accepted Payments:</span>
              <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-300 font-mono text-[10px]">PromptPay QR</span>
              <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-300 font-mono text-[10px]">Visa / Mastercard</span>
              <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-300 font-mono text-[10px]">Cash on Delivery</span>
              <span className="text-emerald-400 text-[10px] font-semibold">● Powered by Opn Payments (Omise)</span>
            </div>
          </div>

          {/* Bottom Bar: Copyright */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-600">
            <p>© {new Date().getFullYear()} Flower Power Pizza · Ranong, Thailand · All Rights Reserved.</p>
            <p>ONLY PON CO., LTD (Head office) · Tax ID: 0845562009083</p>
          </div>
        </div>
      </footer>

      <PizzaPoliciesModal
        isOpen={policyModalOpen}
        onClose={() => setPolicyModalOpen(false)}
        initialTab={policyTab}
        lang={currentLang}
      />

      <TableReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        lang={currentLang}
      />
    </div>
  );
}

