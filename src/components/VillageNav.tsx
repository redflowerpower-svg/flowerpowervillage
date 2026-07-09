import { useState, useEffect } from 'react';
import { Menu, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  activePage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { label: 'Alloggi', id: 'accommodations' },
  { label: 'Ristorante & Pizzeria', id: 'restaurant' },
  { label: 'Spa', id: 'spa' },
  { label: 'Galleria', id: 'gallery' },
  { label: 'Come Raggiungerci', id: 'directions' },
  { label: 'Contatti', id: 'contact' },
];

export default function VillageNav({ activePage, onNavigate }: Props) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
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
          {/* Logo / Brand Name & Back to SplitScreen */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-stone-400 hover:text-white transition-colors duration-200 text-xs font-semibold uppercase tracking-wider cursor-pointer"
              title="Torna alla Home"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Home</span>
            </button>
            <div className="h-4 w-px bg-stone-700/60 hidden sm:block" />
            <button
              onClick={() => handleNavClick('accommodations')}
              className="flex items-center gap-2 text-left cursor-pointer group"
            >
              <span className="font-sans font-black tracking-tight text-white text-base md:text-lg group-hover:text-emerald-400 transition-colors">
                Flower Power <span className="font-light italic text-[#a2b997]">Village</span>
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
                  className={`text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer pb-0.5 border-b-2 hover:text-white ${
                    isActive
                      ? 'text-emerald-400 border-emerald-400 font-bold'
                      : 'text-stone-300 border-transparent hover:border-stone-400/50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden text-white hover:text-emerald-400 transition-colors cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-fadeIn"
            onClick={() => setMenuOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-[#3b3530] border-l border-stone-700 p-6 flex flex-col shadow-2xl md:hidden animate-slideLeft">
            <div className="flex items-center justify-between border-b border-stone-700/50 pb-4 mb-6">
              <span className="font-sans font-black text-white text-md">
                Menu
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-stone-400 hover:text-white cursor-pointer"
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
                    className={`text-left text-sm font-semibold uppercase tracking-wider py-2.5 px-3 rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-800/40 text-emerald-400 font-bold border-l-4 border-emerald-400'
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
