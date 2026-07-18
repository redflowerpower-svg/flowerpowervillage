import { useState, useEffect } from 'react';
import { useNavigate as useRRNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Menu, X, Clock, Phone, Mail, MapPin, Instagram, Facebook, Star, ShoppingCart } from 'lucide-react';
import DeliveryMenu from '../pizza/pages/DeliveryMenu';
import { useCartStore } from '../pizza/store/cartStore';
import PizzaSlideshow from '../components/PizzaSlideshow';


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
      { name: 'Gelato Artigianale', desc: "Ask our team for today's flavours" },
    ],
  },
];

const navItems = [
  { label: 'ORDINA ONLINE', id: 'order' as PizzaPage },
  { label: 'CHI SIAMO', id: 'about' as PizzaPage },
  { label: 'CONTATTI', id: 'contact' as PizzaPage },
];

function PizzaNav({ activePage, onNavigate }: { activePage: PizzaPage; onNavigate: (p: PizzaPage) => void }) {
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#3b3530]/95 backdrop-blur-md shadow-md border-b border-stone-700/50 py-3'
            : 'bg-[#3b3530] border-b border-stone-800 py-4'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          {/* Logo / Brand Name & Back */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => rrNavigate('/')}
              className="flex items-center gap-1.5 text-stone-400 hover:text-white transition-colors duration-200 text-xs font-semibold uppercase tracking-wider cursor-pointer bg-transparent border-0"
              title="Back"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="h-4 w-px bg-stone-700/60 hidden sm:block" />
            <button
              onClick={() => handleNavClick('order')}
              className="flex items-center gap-2 text-left cursor-pointer group bg-transparent border-0"
            >
              <span className="font-sans font-black tracking-tight text-white text-base md:text-lg group-hover:text-[#f87171] transition-colors">
                Flower Power <span className="font-light italic text-[#f87171]">Pizza</span>
              </span>
            </button>
          </div>

          {/* Desktop Nav Items */}
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

            {cartCount > 0 && (
              <button
                onClick={openCart}
                className="relative flex items-center text-stone-300 hover:text-white transition-colors duration-200 cursor-pointer ml-2 bg-transparent border-0"
              >
                <ShoppingCart size={18} />
                <span
                  className="absolute -top-2 -right-2 w-4.5 h-4.5 rounded-full bg-[#8B1E1E] flex items-center justify-center text-white text-[9px] font-bold"
                >
                  {cartCount}
                </span>
              </button>
            )}
          </div>

          {/* Mobile Hamburger & Cart Buttons */}
          <div className="md:hidden flex items-center gap-4">
            {cartCount > 0 && (
              <button
                onClick={openCart}
                className="relative flex items-center text-stone-300 hover:text-white cursor-pointer bg-transparent border-0"
              >
                <ShoppingCart size={18} />
                <span
                  className="absolute -top-2 -right-2 w-4.5 h-4.5 rounded-full bg-[#8B1E1E] flex items-center justify-center text-white text-[9px] font-bold"
                >
                  {cartCount}
                </span>
              </button>
            )}
            <button
              className="text-white hover:text-[#fca5a5] transition-colors cursor-pointer bg-transparent border-0"
              onClick={() => setMenuOpen(!menuOpen)}
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
            <div className="flex items-center justify-between border-b border-stone-700/50 pb-4 mb-6">
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

            <div className="flex flex-col gap-4">
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
          Authentic Italian · Open Daily 08:00 – 21:15
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
  return (
    <section className="pt-24 pb-20 bg-[#e7e5e4] min-h-screen" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.4em] uppercase text-[#8B1E1E] mb-3 font-semibold">
            La nostra storia
          </p>
          <h2
            className="text-stone-900 mb-4 font-black tracking-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Cuore Italiano, Anima <em>Thai</em>
          </h2>
          <div className="w-12 h-0.5 bg-[#8B1E1E] mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-14">
          <img
            src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Italian cooking"
            className="w-full h-72 object-cover rounded-3xl border border-stone-300 shadow-sm"
          />
          <div className="space-y-4">
            <p className="text-stone-700 text-sm leading-relaxed font-light">
              Flower Power Pizza Ranong porta i sapori autentici dell'Italia nel cuore della provincia di Ranong. Nato dalla stessa passione che ha dato vita al Flower Power Farm Village & Spa a Koh Phayam, la nostra pizzeria celebra l'artigianalità del cibo italiano.
            </p>
            <p className="text-stone-600 text-sm leading-relaxed font-light">
              Ogni impasto viene steso a mano e lasciato lievitare lentamente per garantire leggerezza e fragranza, utilizzando solo ingredienti di prima scelta importati e sapientemente selezionati.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { label: 'Cucina', value: '100% Italiana' },
                { label: 'Orari', value: '11:00 – 21:30' },
                { label: 'Servizi', value: 'Consegna & Ritiro' },
                { label: 'Impasto', value: 'Lenta Lievitazione' },
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
            { quote: "La migliore pizza mangiata fuori dall'Italia. L'impasto è digeribile e croccante al punto giusto.", author: 'Marco V.' },
            { quote: "Ingredienti eccellenti e sapori veraci. La cuoca italiana è una garanzia di autenticità.", author: 'Sarah L.' },
            { quote: "Una carbonara eccezionale con vero guanciale, non la solita rivisitazione. Consigliatissimo!", author: 'Giovanni R.' },
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

function PizzaContactPage() {
  return (
    <section className="pt-24 pb-20 bg-[#e7e5e4] min-h-screen" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}>
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.4em] uppercase text-[#8B1E1E] mb-3 font-semibold">
            Contattaci
          </p>
          <h2
            className="text-stone-900 mb-4 font-black tracking-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Trova Flower Power Pizza
          </h2>
          <div className="w-12 h-0.5 bg-[#8B1E1E] mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="bg-white border border-stone-300 rounded-[2rem] p-8 space-y-6 shadow-sm">
            {/* Indirizzo con link Google Maps */}
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 bg-[#8B1E1E]/5 flex items-center justify-center shrink-0 rounded-lg">
                <MapPin size={15} className="text-[#8B1E1E]" />
              </div>
              <div>
                <p className="text-stone-400 text-[10px] uppercase tracking-wider font-bold mb-1">Indirizzo</p>
                <p className="text-stone-850 text-sm font-extrabold">129/6 Mo 1, Tambon Bang Rin,<br />Muang Ranong 85000</p>
                <p className="text-stone-550 text-xs mt-0.5 mb-1.5 font-light">Chiedici le indicazioni stradali esatte</p>
                <a
                  href="https://maps.app.goo.gl/6xdREhJ3bu7kzVzY6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#8B1E1E] hover:text-[#721818] font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  <span>Vedi su Google Maps</span>
                  <span className="text-[10px]">↗</span>
                </a>
              </div>
            </div>

            {/* Orari di Apertura */}
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 bg-[#8B1E1E]/5 flex items-center justify-center shrink-0 rounded-lg">
                <Clock size={15} className="text-[#8B1E1E]" />
              </div>
              <div>
                <p className="text-stone-400 text-[10px] uppercase tracking-wider font-bold mb-1">Orari di Apertura</p>
                <p className="text-stone-850 text-sm font-extrabold">Tutti i giorni · 11:00 – 21:30</p>
                <p className="text-stone-550 text-xs mt-0.5 font-light">Servizio di consegna e ritiro</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 bg-[#8B1E1E]/5 flex items-center justify-center shrink-0 rounded-lg">
                <Phone size={15} className="text-[#8B1E1E]" />
              </div>
              <div>
                <p className="text-stone-400 text-[10px] uppercase tracking-wider font-bold mb-1">Telefono (LINE / WhatsApp)</p>
                <a href="tel:+66949800200" className="text-[#8B1E1E] text-sm font-extrabold hover:text-[#721818] transition-colors">
                  +66 (0) 949 800 200
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 bg-[#8B1E1E]/5 flex items-center justify-center shrink-0 rounded-lg">
                <Mail size={15} className="text-[#8B1E1E]" />
              </div>
              <div>
                <p className="text-stone-400 text-[10px] uppercase tracking-wider font-bold mb-1">Email</p>
                <a href="mailto:flowerpowerpizzaranong.th@gmail.com" className="text-[#8B1E1E] text-sm font-extrabold hover:text-[#721818] transition-colors">
                  flowerpowerpizzaranong.th@gmail.com
                </a>
              </div>
            </div>
            <div className="pt-4 flex flex-wrap gap-2">
              <a href="https://www.tiktok.com/@flowerpowerpizzaranong" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3.5 py-2.5 border border-stone-200 text-stone-600 text-xs hover:border-[#8B1E1E] hover:text-[#8B1E1E] transition-all bg-stone-50 rounded-xl shadow-xs font-semibold">
                <TiktokIcon size={14} className="text-[#8B1E1E]" /> TikTok
              </a>
              <a href="https://www.instagram.com/flowerpowerpizzaranong" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3.5 py-2.5 border border-stone-200 text-stone-600 text-xs hover:border-[#8B1E1E] hover:text-[#8B1E1E] transition-all bg-stone-50 rounded-xl shadow-xs font-semibold">
                <Instagram size={14} className="text-[#8B1E1E]" /> Instagram
              </a>
              <a href="https://www.facebook.com/flowerpowerpizzaranong" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3.5 py-2.5 border border-stone-200 text-stone-600 text-xs hover:border-[#8B1E1E] hover:text-[#8B1E1E] transition-all bg-stone-50 rounded-xl shadow-xs font-semibold">
                <Facebook size={14} className="text-[#8B1E1E]" /> Facebook
              </a>
            </div>
          </div>
          <img
            src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Inside Flower Power Pizza"
            className="w-full object-cover rounded-[2rem] border border-stone-300 shadow-sm"
            style={{ minHeight: '340px' }}
          />
        </div>
      </div>
    </section>
  );
}

export function PizzaHomePage({ onNavigate }: { onNavigate: (p: PizzaPage) => void }) {
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
          <p className="text-red-200 text-sm mb-6">Open daily · 08:00 – 21:15 · Ranong Province, Thailand</p>
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

  useEffect(() => {
    setActivePage(getPageFromPath());
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navigate = (page: PizzaPage) => {
    const path = page === 'order' ? '/pizza' : `/pizza/${page}`;
    rrNavigate(path);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'order': return <DeliveryMenu />;
      case 'about': return <PizzaAboutPage />;
      case 'contact': return <PizzaContactPage />;
      default: return <DeliveryMenu />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#1c1917' }}>
      <PizzaNav activePage={activePage} onNavigate={navigate} />
      <main>{renderPage()}</main>

      <footer className="bg-stone-950 border-t border-stone-900 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-stone-500 text-sm italic" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Flower Power Pizza Ranong
          </div>
          <div className="flex gap-6">
            {(['order', 'about', 'contact'] as PizzaPage[]).map(p => (
              <button key={p} onClick={() => navigate(p)}
                className="text-xs text-stone-600 uppercase tracking-wide hover:text-red-400 transition-colors uppercase font-semibold">
                {p === 'order' ? 'ORDINA ONLINE' : p === 'about' ? 'CHI SIAMO' : p.toUpperCase()}
              </button>
            ))}
            <a 
              href="/admin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-stone-600 uppercase tracking-wide hover:text-red-400 transition-colors uppercase font-semibold"
            >
              PRIVATE AREA
            </a>
          </div>
          <p className="text-xs text-stone-700">© {new Date().getFullYear()} Flower Power · Ranong, Thailand</p>
        </div>
      </footer>
    </div>
  );
}
