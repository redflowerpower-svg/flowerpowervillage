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
            {/* Main Content: Logo on the Left + Brand Details on the Right */}
            <div className="flex items-center gap-3">
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
