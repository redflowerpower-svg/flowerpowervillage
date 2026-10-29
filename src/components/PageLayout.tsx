import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Language, translations } from '../booking/lib/translations';
import VillageSlideshow from './VillageSlideshow';

interface PageLayoutProps {
  children: React.ReactNode;
  lang?: Language;
  setLang?: (l: Language) => void;
}

const LANG_METAS: Record<Language, { flag: string; label: string }> = {
  IT: { flag: '🇮🇹', label: 'IT' },
  EN: { flag: '🇬🇧', label: 'EN' },
  TH: { flag: '🇹🇭', label: 'TH' },
  DE: { flag: '🇩🇪', label: 'DE' },
};

export default function PageLayout({ children, lang = 'IT', setLang }: PageLayoutProps) {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const t = (key: keyof typeof translations['IT']) => {
    const current = translations[lang] || translations['IT'];
    return current[key] || translations['IT'][key] || key;
  };

  return (
    <div className="min-h-screen text-foreground font-sans antialiased selection:bg-accent pb-1" style={{ backgroundColor: '#e7e5e4' }}>
      <div className="max-w-6xl mx-auto px-4 mt-20 md:mt-24">
        {/* Header Card (100% Identico per dimensioni e layout a booking-engine / flowerpowerpizza) */}
        <header className="relative text-stone-100 py-3 lg:py-8 px-3 sm:px-4 md:px-8 overflow-hidden rounded-2xl shadow-lg mb-4 md:mb-6" style={{ backgroundColor: '#3b3530' }}>
          <div className="absolute inset-0 opacity-45 pointer-events-none">
            <VillageSlideshow />
          </div>
          <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-[0.5px] pointer-events-none" />

          {/* MOBILE HERO BANNER (Identico nello stile compatto a flowerpowerpizza.com) */}
          <div className="block lg:hidden relative z-10 py-2 sm:py-3 px-1 sm:px-2">
            {/* Top-Right Language Selector */}
            {setLang && (
              <div className="absolute top-1 right-1 z-30">
                <button
                  type="button"
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-emerald-400/60 shadow-md text-white font-black text-xs uppercase cursor-pointer active:scale-95"
                >
                  <span className="text-sm leading-none">{LANG_METAS[lang]?.flag || '🌐'}</span>
                  <span className="tracking-wider">{lang}</span>
                  <ChevronDown className="w-3 h-3 text-emerald-400 transition-transform duration-200" style={{ transform: isLangOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                {isLangOpen && (
                  <>
                    <div className="fixed inset-0 z-40 cursor-default bg-black/50" onClick={() => setIsLangOpen(false)} />
                    <div className="absolute right-0 mt-2 w-32 bg-[#2d2824]/98 backdrop-blur-md rounded-xl border border-emerald-500/40 shadow-2xl z-50 overflow-hidden flex flex-col p-1">
                      {(['IT', 'EN', 'TH', 'DE'] as Language[]).map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => {
                            setLang(l);
                            setIsLangOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            lang === l ? "text-emerald-300 bg-white/10 font-black" : "text-stone-200 hover:bg-white/5"
                          }`}
                        >
                          <span>{LANG_METAS[l]?.flag}</span>
                          <span>{LANG_METAS[l]?.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Main Content: Logo on the Left + Brand Details on the Right */}
            <div className="flex items-center gap-3 pr-16">
              <img
                src="/FP_04_-_LOGO_OFFICIAL_HD.png"
                alt="Flower Power Village Logo"
                width={88}
                height={88}
                className="h-20 sm:h-24 w-auto drop-shadow-lg flex-shrink-0 object-contain -ml-0.5"
              />
              <div className="min-w-0 space-y-1">
                <h1 className="text-xl sm:text-2xl font-sans font-black tracking-tight text-white leading-tight">
                  FLOWER POWER <br className="sm:hidden" />
                  <span className="font-light italic text-[#a2b997]">Village</span>
                </h1>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[#a2b997] font-extrabold tracking-widest text-[10px] sm:text-[11px] uppercase">
                    KOH PHAYAM • THAILANDIA
                  </span>
                </div>
                <p className="text-stone-200 font-bold text-[11px] sm:text-xs leading-tight">
                  {t('heroLine1')} • {t('heroLine2')}
                </p>
                <div className="text-[10px] sm:text-[11px] text-stone-300 font-medium leading-tight truncate">
                  Piscina • Palestra • Yoga • Coworking
                </div>
              </div>
            </div>
          </div>

          {/* DESKTOP HERO BANNER */}
          <div className="hidden lg:block relative z-10 my-auto py-2">
            {/* Top-Right Language Dropdown Selector for Desktop */}
            {setLang && (
              <div className="absolute top-1 right-1 z-20">
                <button
                  type="button"
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1.5 bg-black/45 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 shadow-sm text-stone-200 hover:text-white transition-all cursor-pointer font-bold text-xs uppercase"
                >
                  <span>{LANG_METAS[lang]?.flag || '🌐'}</span>
                  <span>{lang}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-400 transition-transform duration-200" style={{ transform: isLangOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                {isLangOpen && (
                  <>
                    <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsLangOpen(false)} />
                    <div className="absolute right-0 mt-1.5 w-28 bg-[#3b3530]/95 backdrop-blur-md rounded-xl border border-white/10 shadow-lg z-50 overflow-hidden flex flex-col p-1">
                      {(['IT', 'EN', 'TH', 'DE'] as Language[]).map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => {
                            setLang(l);
                            setIsLangOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all hover:bg-white/10 cursor-pointer ${
                            lang === l ? "text-emerald-400 bg-white/5 font-black" : "text-stone-300"
                          }`}
                        >
                          <span>{LANG_METAS[l]?.flag}</span>
                          <span>{LANG_METAS[l]?.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex flex-row items-center justify-between gap-8 min-h-[180px]">
              {/* Left Side: Logo + Title */}
              <div className="flex flex-row items-center gap-6 text-left my-auto">
                <img
                  src="/FP_04_-_LOGO_OFFICIAL_HD.png"
                  alt="Flower Power Village Logo"
                  width={200}
                  height={200}
                  className="h-36 lg:h-44 w-auto drop-shadow-md flex-shrink-0 object-contain my-auto"
                />
                <div className="flex flex-col justify-between items-start pl-4 my-auto space-y-2">
                  <h1 className="text-4xl lg:text-5xl font-sans font-black tracking-tight text-white leading-none text-left">
                    FLOWER POWER <br />
                    <span className="font-light italic text-[#a2b997]">Village</span>
                  </h1>
                  <span className="text-[#a2b997] font-bold tracking-widest text-xs uppercase text-left block pt-1">
                    KOH PHAYAM, THAILANDIA
                  </span>
                </div>
              </div>

              {/* Right Side: Compact Tagline block */}
              <div className="flex flex-col justify-between items-end gap-2 text-right max-w-md my-auto space-y-1">
                <span className="text-xl lg:text-2xl font-extrabold text-stone-100 tracking-tight block uppercase">
                  {t('heroLine1')}
                </span>
                <span className="text-xs lg:text-sm font-bold text-[#a2b997] tracking-widest block uppercase">
                  {t('heroLine2')}
                </span>
                <div className="flex flex-row flex-wrap justify-end gap-x-2 gap-y-0.5 text-xs font-light text-stone-200">
                  <span>{t('heroLine3')}</span>
                  <span className="text-stone-400">•</span>
                  <span>{t('heroLine4')}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        {children}
      </div>
    </div>
  );
}
