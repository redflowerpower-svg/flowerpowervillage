import { useState, useEffect } from 'react';
import { Menu, X, ArrowLeft, Globe, ChevronDown } from 'lucide-react';
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

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'EN', label: 'English', flag: '🇬🇧' },
  { code: 'TH', label: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'DE', label: 'Deutsch', flag: '🇩🇪' },
];

export default function VillageNav({ activePage, onNavigate, lang, setLang }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
        className={`fixed top-0 left-0 right-0 z-[90] transition-all duration-300 ${
          scrolled
            ? 'bg-[#3b3530]/95 backdrop-blur-md shadow-md border-b border-stone-700/50 py-3'
            : 'bg-[#3b3530] border-b border-stone-800 py-4'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          {/* Logo / Brand Name & Back to Home */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => handleNavClick('accommodations')}
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
                FLOWER POWER <span className="font-light italic text-[#a2b997]">Village</span>
              </span>
            </button>
          </div>

          {/* Desktop Nav Items & Language Selector */}
          <div className="hidden md:flex items-center gap-5 lg:gap-6">
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

            {/* Desktop Language Selector Dropdown */}
            <div className="relative ml-2">
              <button
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 bg-black/45 hover:bg-black/65 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm text-stone-100 hover:text-white transition-all cursor-pointer font-black text-xs uppercase"
                title="Change language"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang}</span>
                <ChevronDown
                  className="w-3.5 h-3.5 transition-transform duration-200 text-stone-300"
                  style={{ transform: langOpen ? 'rotate(180deg)' : 'none' }}
                />
              </button>

              {langOpen && (
                <>
                  <div className="fixed inset-0 z-[9990] bg-black/40 backdrop-blur-[2px] cursor-default" onClick={() => setLangOpen(false)} />
                  <div
                    className="absolute right-0 mt-2.5 w-52 bg-stone-900 border-2 border-stone-600 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-[9999] overflow-hidden py-1.5 animate-fadeIn"
                    style={{ backgroundColor: '#1c1917' }}
                  >
                    {languages.map((l) => {
                      const isSelected = lang === l.code;
                      return (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => {
                            setLang(l.code);
                            setLangOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white font-black'
                              : 'text-stone-200 hover:bg-white/10 hover:text-white font-bold'
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-xl leading-none">{l.flag}</span>
                            <span className="font-extrabold tracking-wide">{l.label}</span>
                          </span>
                          {isSelected ? (
                            <span className="text-white text-xs font-black px-2 py-0.5 bg-black/30 rounded-md">
                              ✓ {l.code}
                            </span>
                          ) : (
                            <span className="text-stone-400 text-xs font-semibold">
                              {l.code}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Actions: Language pill + Hamburger Button */}
          <div className="flex items-center gap-2.5 md:hidden">
            {/* Mobile Language Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 bg-black/50 hover:bg-black/70 px-3 py-1.5 rounded-xl border border-white/20 text-stone-100 text-xs font-black uppercase shadow-sm cursor-pointer"
                title="Change language"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang}</span>
                <ChevronDown
                  className="w-3.5 h-3.5 transition-transform duration-200 text-stone-300"
                  style={{ transform: langOpen ? 'rotate(180deg)' : 'none' }}
                />
              </button>

              {langOpen && (
                <>
                  <div className="fixed inset-0 z-[9990] bg-black/40 backdrop-blur-[2px] cursor-default" onClick={() => setLangOpen(false)} />
                  <div
                    className="absolute right-0 mt-2.5 w-52 bg-stone-900 border-2 border-stone-600 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-[9999] overflow-hidden py-1.5 animate-fadeIn"
                    style={{ backgroundColor: '#1c1917' }}
                  >
                    {languages.map((l) => {
                      const isSelected = lang === l.code;
                      return (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => {
                            setLang(l.code);
                            setLangOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white font-black'
                              : 'text-stone-200 hover:bg-white/10 hover:text-white font-bold'
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-xl leading-none">{l.flag}</span>
                            <span className="font-extrabold tracking-wide">{l.label}</span>
                          </span>
                          {isSelected ? (
                            <span className="text-white text-xs font-black px-2 py-0.5 bg-black/30 rounded-md">
                              ✓ {l.code}
                            </span>
                          ) : (
                            <span className="text-stone-400 text-xs font-semibold">
                              {l.code}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <button
              className="text-white hover:text-emerald-400 transition-colors cursor-pointer p-1"
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
            className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-sm md:hidden animate-fadeIn"
            onClick={() => setMenuOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="fixed top-0 right-0 bottom-0 z-[9999] w-72 bg-[#3b3530] border-l border-stone-700 p-6 flex flex-col shadow-2xl md:hidden animate-slideLeft">
            <div>
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

              <div className="flex flex-col gap-2.5">
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
          </div>
        </>
      )}
    </>
  );
}
