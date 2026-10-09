import React, { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, LANGUAGE_METAS, type Language } from '../config/languages';

interface LanguageDropdownProps {
  currentLang: string;
  onSelect: (lang: Language) => void;
  variant?: 'dining-dark' | 'kitchen-dark' | 'glass' | 'compact';
  className?: string;
  align?: 'left' | 'right';
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  currentLang,
  onSelect,
  variant = 'dining-dark',
  className = '',
  align = 'right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize language to uppercase Language type
  const normalizedLang = (currentLang.toUpperCase() as Language);
  const activeLang: Language = SUPPORTED_LANGUAGES.includes(normalizedLang) ? normalizedLang : 'IT';
  const currentMeta = LANGUAGE_METAS[activeLang] || LANGUAGE_METAS.IT;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const getButtonStyles = () => {
    switch (variant) {
      case 'kitchen-dark':
        return 'bg-[#181d29]/90 hover:bg-[#202738] border border-stone-700/70 hover:border-stone-500 text-stone-200 shadow-xs h-9';
      case 'glass':
        return 'bg-stone-950/80 hover:bg-stone-900 border border-white/20 text-white backdrop-blur-md shadow-md';
      case 'compact':
        return 'bg-stone-900/90 hover:bg-stone-800 border border-stone-700 text-stone-200 py-1 px-2.5 text-xs';
      case 'dining-dark':
      default:
        return 'bg-stone-900/90 hover:bg-stone-850 border border-stone-700/80 hover:border-amber-400/80 text-white shadow-md h-9';
    }
  };

  const getDropdownStyles = () => {
    switch (variant) {
      case 'kitchen-dark':
        return 'bg-[#131722] border border-stone-700 shadow-2xl shadow-black/90';
      case 'dining-dark':
      default:
        return 'bg-stone-900 border-stone-700 shadow-black/80';
    }
  };

  const getActiveItemStyles = () => {
    switch (variant) {
      case 'kitchen-dark':
        return 'bg-amber-500 text-stone-950 font-black shadow-sm';
      case 'dining-dark':
      default:
        return 'bg-amber-400 text-stone-950 font-black shadow-sm';
    }
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`} style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-95 whitespace-nowrap ${getButtonStyles()}`}
      >
        <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-sm shrink-0 leading-none">{currentMeta.flag}</span>
        <span className="font-mono uppercase text-xs tracking-wider">{currentMeta.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-amber-300' : ''}`} />
      </button>

      {isOpen && (
        <div 
          role="listbox"
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-2 w-[280px] sm:w-[300px] rounded-2xl border-2 border-amber-400/80 p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-xl z-[999999] animate-fadeIn ${getDropdownStyles()}`}
        >
          <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-amber-400 border-b border-stone-800 mb-2 flex items-center justify-between">
            <span>Lingua / Language</span>
            <Globe className="w-3.5 h-3.5 text-amber-400" />
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {SUPPORTED_LANGUAGES.map((code) => {
              const meta = LANGUAGE_METAS[code];
              const isSelected = activeLang === code;

              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    onSelect(code);
                    setIsOpen(false);
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-center cursor-pointer transition-all duration-150 select-none ${
                    isSelected
                      ? 'bg-amber-400 text-stone-950 font-black shadow-md border border-amber-300 ring-2 ring-amber-400/50 scale-[1.02]'
                      : 'bg-stone-900/90 text-stone-200 hover:bg-stone-800 hover:text-white border border-stone-800 hover:border-amber-400/50'
                  }`}
                >
                  <span className="text-xl leading-none mb-1">{meta.flag}</span>
                  <span className="text-xs font-black tracking-wide uppercase leading-tight">
                    {code}
                  </span>
                  <span className={`text-[9px] truncate max-w-full leading-tight mt-0.5 ${isSelected ? 'text-stone-900 font-bold' : 'text-stone-400'}`}>
                    {meta.nativeName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
