import { useState, useEffect } from 'react';
import { Menu, X, ArrowLeft, Globe, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Language } from '../booking/lib/translations';

interface Props {
  activePage: string;
  onNavigate: (page: string) => void;
  lang: Language;
  setLang: (l: Language) => void;
}

const navTranslations = {
  IT: {
    accommodations: 'Alloggi',
    restaurant: 'Ristorante & Pizzeria',
    spa: 'Spa & Sport',
    gallery: 'Galleria',
    directions: 'Come Raggiungerci',
    contact: 'Contatti',
    home: 'Home'
  },
  EN: {
    accommodations: 'Accommodations',
    restaurant: 'Restaurant & Pizzeria',
    spa: 'Spa & Wellness',
    gallery: 'Gallery',
    directions: 'Directions',
    contact: 'Contact Us',
    home: 'Home'
  },
  TH: {
    accommodations: 'ที่พัก',
    restaurant: 'ร้านอาหาร & พิซซ่า',
    spa: 'สปา & เวลเนส',
    gallery: 'แกลเลอรี',
    directions: 'การเดินทาง',
    contact: 'ติดต่อเรา',
    home: 'หน้าหลัก'
  },
  DE: {
    accommodations: 'Unterkünfte',
    restaurant: 'Restaurant & Pizzeria',
    spa: 'Spa & Wellness',
    gallery: 'Galerie',
    directions: 'Anreise',
    contact: 'Kontakt',
    home: 'Startseite'
  }
};

export default function VillageNav({ activePage, onNavigate, lang, setLang }: Props) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const t = navTranslations[lang] || navTranslations['IT'];

  const navItems = [
    { label: t.accommodations, id: 'accommodations' },
    { label: t.restaurant, id: 'restaurant' },
    { label: t.spa, id: 'spa' },
    { label: t.gallery, id: 'gallery' },
    { label: t.directions, id: 'directions' },
    { label: t.contact, id: 'contact' },
  ];

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
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-stone-400 hover:text-white transition-colors duration-200 text-xs font-semibold uppercase tracking-wider cursor-pointer"
              title={lang === 'IT' ? 'Torna alla Home' : 'Back to Home'}
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">{t.home}</span>
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
                  style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Desktop Language Switcher */}
            <div className="relative z-50">
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1 bg-black/45 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 shadow-sm text-stone-300 hover:text-white transition-all cursor-pointer font-bold text-[10px] uppercase"
                style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{lang}</span>
                <ChevronDown className="w-3 h-3 transition-transform duration-200" style={{ transform: isLangOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {isLangOpen && (
                <>
                  <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsLangOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-24 bg-[#3b3530]/95 backdrop-blur-md rounded-xl border border-white/10 shadow-lg z-50 overflow-hidden flex flex-col">
                    {(['IT', 'EN', 'TH', 'DE'] as Language[]).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => {
                          setLang(l);
                          setIsLangOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-[10px] font-bold transition-all hover:bg-white/10 cursor-pointer ${
                          lang === l ? "text-emerald-400 bg-white/5" : "text-stone-300"
                        }`}
                        style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
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
          </div>

          {/* Mobile Actions: Language Switcher and Hamburger Button */}
          <div className="flex items-center gap-3 md:hidden">
            {/* Mobile Language Dropdown */}
            <div className="relative z-50">
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1 bg-black/45 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 shadow-sm text-stone-300 hover:text-white transition-all cursor-pointer font-bold text-[10px] uppercase"
                style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
              >
                <span>{lang}</span>
                <ChevronDown className="w-3 h-3 transition-transform duration-200" style={{ transform: isLangOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {isLangOpen && (
                <>
                  <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsLangOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-24 bg-[#3b3530]/95 backdrop-blur-md rounded-xl border border-white/10 shadow-lg z-50 overflow-hidden flex flex-col">
                    {(['IT', 'EN', 'TH', 'DE'] as Language[]).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => {
                          setLang(l);
                          setIsLangOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-[10px] font-bold transition-all hover:bg-white/10 cursor-pointer ${
                          lang === l ? "text-emerald-400 bg-white/5" : "text-stone-300"
                        }`}
                        style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
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

            <button
              className="text-white hover:text-emerald-400 transition-colors cursor-pointer"
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
                    style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
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
