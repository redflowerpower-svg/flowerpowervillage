import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { Language, translations } from '../booking/lib/translations';
import VillageSlideshow from './VillageSlideshow';

interface PageLayoutProps {
  children: React.ReactNode;
  lang?: Language;
  setLang?: (l: Language) => void;
}

export default function PageLayout({ children, lang = 'IT', setLang }: PageLayoutProps) {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const t = (key: keyof typeof translations['IT']) => {
    const current = translations[lang] || translations['IT'];
    return current[key] || translations['IT'][key] || key;
  };

  return (
    <div className="min-h-screen text-foreground font-sans antialiased selection:bg-accent pb-1" style={{ backgroundColor: '#e7e5e4' }}>
      <div className="max-w-6xl mx-auto px-4 mt-20 md:mt-24">
        {/* Header Card */}
        <header className="relative text-stone-100 py-4 lg:py-8 px-4 md:px-8 overflow-hidden rounded-2xl shadow-lg" style={{ backgroundColor: '#3b3530' }}>
          <div className="absolute inset-0 opacity-45">
            <VillageSlideshow />
          </div>
          <div className="absolute inset-0 bg-stone-950/30 backdrop-blur-[0.5px]" />

          {/* Collapsible Dropdown Language Selector (Identical to booking-engine) */}
          {setLang && (
            <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1 bg-black/45 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 shadow-sm text-stone-300 hover:text-white transition-all cursor-pointer font-bold text-[10px] uppercase"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{lang}</span>
                <ChevronDown className="w-3 h-3 transition-transform duration-200" style={{ transform: isLangOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {isLangOpen && (
                <>
                  {/* Overlay to close when clicking outside */}
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
          )}

          <div className="relative z-10 my-auto py-2">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8 min-h-[160px] lg:min-h-[180px]">
              {/* Left Side: Logo + Title */}
              <div className="flex flex-col lg:flex-row items-center gap-3.5 lg:gap-6 text-center lg:text-left w-full lg:w-auto my-auto">
                <img
                  src="/FP_04_-_LOGO_OFFICIAL_HD.png"
                  alt="Flower Power Village Logo"
                  width={200}
                  height={200}
                  className="h-16 lg:h-44 w-auto drop-shadow-md mx-auto lg:mx-0 flex-shrink-0 object-contain my-auto"
                />
                <div className="flex flex-col justify-between items-center lg:items-start lg:pl-4 my-auto space-y-2">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-sans font-black tracking-tight text-white leading-none text-center lg:text-left">
                    FLOWER POWER <br />
                    <span className="font-light italic text-[#a2b997]">Village</span>
                  </h1>
                  <span className="text-[#a2b997] font-bold tracking-widest text-[9px] md:text-xs uppercase text-center lg:text-left block pt-1">
                    KOH PHAYAM, THAILANDIA
                  </span>
                </div>
              </div>

              {/* Right Side: Compact Tagline block */}
              <div className="flex flex-col justify-between items-center lg:items-end gap-2 text-center lg:text-right max-w-md w-full lg:w-auto my-auto space-y-1">
                <span className="text-xs sm:text-sm md:text-xl lg:text-2xl font-extrabold text-stone-100 tracking-tight block uppercase bg-white/10 lg:bg-transparent px-3 py-0.5 rounded-full lg:p-0">
                  {t('heroLine1')}
                </span>
                <span className="text-[9px] md:text-xs lg:text-sm font-bold text-[#a2b997] tracking-widest block uppercase">
                  {t('heroLine2')}
                </span>
                <div className="flex flex-row flex-wrap justify-center lg:justify-end gap-x-2 gap-y-0.5 text-[9px] md:text-xs font-light text-stone-200">
                  <span>{t('heroLine3')}</span>
                  <span className="text-stone-400">•</span>
                  <span>{t('heroLine4')}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content wrapper */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg overflow-hidden border border-stone-300">
          {children}
        </div>
      </div>
    </div>
  );
}
