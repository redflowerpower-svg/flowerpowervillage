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
        return 'bg-stone-900/95 hover:bg-stone-850 border border-red-500/40 text-stone-100 hover:border-red-400 shadow-lg';
      case 'glass':
        return 'bg-stone-950/80 hover:bg-stone-900 border border-white/20 text-white backdrop-blur-md shadow-md';
      case 'compact':
        return 'bg-stone-900/90 hover:bg-stone-800 border border-stone-700 text-stone-200 py-1 px-2.5 text-xs';
      case 'dining-dark':
      default:
        return 'bg-stone-900/95 hover:bg-stone-850 border border-amber-400/50 text-white hover:border-amber-300 shadow-lg';
    }
  };

  const getDropdownStyles = () => {
    switch (variant) {
      case 'kitchen-dark':
        return 'bg-stone-900 border-red-500/50 shadow-red-950/70';
      case 'dining-dark':
      default:
        return 'bg-stone-900 border-amber-400/50 shadow-black/80';
    }
  };

  const getActiveItemStyles = () => {
    switch (variant) {
      case 'kitchen-dark':
        return 'bg-red-600 text-white font-black shadow-sm';
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
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-95 ${getButtonStyles()}`}
      >
        <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-sm shrink-0 leading-none">{currentMeta.flag}</span>
        <span className="font-mono uppercase text-xs tracking-wider">{currentMeta.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-amber-300' : ''}`} />
      </button>

      {isOpen && (
        <div 
          role="listbox"
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-2 w-48 rounded-2xl border-2 p-1.5 shadow-2xl backdrop-blur-xl z-[999999] animate-fadeIn ${getDropdownStyles()}`}
        >
          <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-stone-400 border-b border-stone-800 mb-1 flex items-center justify-between">
            <span>Lingua / Language</span>
            <Globe className="w-3 h-3 text-amber-400" />
          </div>

          <div className="space-y-0.5">
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer text-left ${
                    isSelected
                      ? getActiveItemStyles()
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base leading-none shrink-0">{meta.flag}</span>
                    <div className="flex flex-col min-w-0 leading-tight">
                      <span className="font-bold truncate text-xs">{meta.label}</span>
                      <span className={`text-[10px] truncate ${isSelected ? (variant === 'kitchen-dark' ? 'text-red-100' : 'text-stone-800 font-semibold') : 'text-stone-400'}`}>
                        {meta.nativeName}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className={`w-4 h-4 shrink-0 ${variant === 'kitchen-dark' ? 'text-white' : 'text-stone-950 stroke-[3]'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
