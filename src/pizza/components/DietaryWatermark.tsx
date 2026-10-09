import React from 'react';
import { Leaf, Wheat } from 'lucide-react';
import type { DietaryType } from '../utils/dietary';
import { useLanguageStore } from '../store/languageStore';
import { Language } from '../config/languages';

interface DietaryWatermarkProps {
  type?: DietaryType;
  className?: string;
  size?: 'sm' | 'md';
  lang?: Language;
}

/**
 * Minimal vertical watermark badge for dish previews.
 * Features a minimalist SVG icon on top and clean uppercase label below.
 */
export const DietaryWatermark: React.FC<DietaryWatermarkProps> = ({ 
  type, 
  className = '',
  size = 'md',
  lang: propLang
}) => {
  const storeLang = useLanguageStore((s) => s.language);
  const lang = propLang || storeLang || 'IT';

  if (!type) return null;

  const isVegan = type === 'vegan';

  const labelText = isVegan
    ? (lang === 'MM' ? 'သက်သတ်လွတ်' : lang === 'IT' ? 'VEGANO' : lang === 'TH' ? 'เจ/วีแกน' : lang === 'ES' ? 'VEGANO' : lang === 'FR' ? 'VÉGAN' : lang === 'RU' ? 'ВЕГАН' : lang === 'ZH' ? '纯素' : 'VEGAN')
    : (lang === 'MM' ? 'သက်သတ်လွတ်' : lang === 'IT' ? 'VEGETARIANO' : lang === 'TH' ? 'มังสวิรัติ' : lang === 'ES' ? 'VEGETARIANO' : lang === 'FR' ? 'VÉGÉTARIEN' : lang === 'RU' ? 'ВЕГЕТАРИАНСКОЕ' : lang === 'ZH' ? '素食' : 'VEGGIE');

  const titleText = isVegan
    ? (lang === 'MM' ? '၁၀၀% သက်သတ်လွတ် စစ်စစ်' : lang === 'IT' ? '100% Vegano (Base vegetale)' : lang === 'TH' ? 'วีแกน 100%' : lang === 'ES' ? '100% Vegano (Base vegetal)' : lang === 'FR' ? '100% Végétalien' : lang === 'RU' ? '100% Веганское' : lang === 'ZH' ? '100% 纯素' : '100% Vegan (Plant-based)')
    : (lang === 'MM' ? 'သက်သတ်လွတ် (အသား/ငါး မပါ)' : lang === 'IT' ? 'Vegetariano (Senza carne né pesce)' : lang === 'TH' ? 'มังสวิรัติ' : lang === 'ES' ? 'Vegetariano (Sin carne ni pescado)' : lang === 'FR' ? 'Végétarien (Sans viande ni poisson)' : lang === 'RU' ? 'Вегетарианское' : lang === 'ZH' ? '素食（无肉无鱼）' : 'Vegetarian (No meat or fish)');

  return (
    <div
      aria-label={titleText}
      title={titleText}
      className={`inline-flex flex-col items-center justify-center rounded-xl backdrop-blur-md shadow-md select-none pointer-events-none transition-all duration-300 ${
        size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1'
      } ${
        isVegan
          ? 'bg-stone-950/75 border border-emerald-400/50 text-emerald-300 shadow-emerald-950/30'
          : 'bg-stone-950/75 border border-amber-400/50 text-amber-300 shadow-amber-950/30'
      } ${className}`}
      style={{
        boxShadow: isVegan 
          ? '0 4px 12px rgba(6, 78, 59, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3)' 
          : '0 4px 12px rgba(120, 53, 15, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div className="flex items-center justify-center">
        {isVegan ? (
          <Leaf className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} stroke-[2.2] text-emerald-400 drop-shadow-sm`} />
        ) : (
          <Wheat className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} stroke-[2.2] text-amber-400 drop-shadow-sm`} />
        )}
      </div>
      <span
        className={`${size === 'sm' ? 'text-[7px]' : 'text-[7.5px] sm:text-[8px]'} font-black uppercase tracking-wider text-white mt-0.5 leading-none`}
        style={{ fontFamily: lang === 'MM' ? 'Noto Sans Myanmar, system-ui, sans-serif' : 'Outfit, system-ui, sans-serif', letterSpacing: '0.06em' }}
      >
        {labelText}
      </span>
    </div>
  );
};
