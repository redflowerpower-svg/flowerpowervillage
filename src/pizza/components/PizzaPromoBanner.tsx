import React from 'react';
import { Percent, X } from 'lucide-react';
import type { PizzaPromoCode } from '../services/pizzaPromoService';
import type { Language } from '../config/languages';

interface PizzaPromoBannerProps {
  appliedPromo: PizzaPromoCode | null;
  onRemove: () => void;
  lang?: Language;
}

/**
 * Floating Bright Yellow & Neon Red Promo Banner
 * Replicates the Village banner style (fixed bottom-0 left-0 right-0 z-[60])
 * Informs customer that a promo code is actively covering their order
 */
export const PizzaPromoBanner: React.FC<PizzaPromoBannerProps> = ({
  appliedPromo,
  onRemove,
  lang = 'IT'
}) => {
  if (!appliedPromo) return null;

  const discountText =
    appliedPromo.discountType === 'percentage'
      ? `-${appliedPromo.discountValue}%`
      : `-฿${appliedPromo.discountValue}`;

  return (
    <div
      role="region"
      aria-label="Promozione Attiva"
      className="fixed bottom-0 left-0 right-0 z-[60] bg-yellow-400 border-t-4 border-red-600 shadow-[0_-4px_25px_rgba(220,38,38,0.5)] px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-300 animate-fadeIn"
      style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Discount Badge & Coverage Title */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
          <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-red-600 text-white font-black text-xs uppercase tracking-wider animate-pulse shadow-md shrink-0">
            <Percent className="w-3.5 h-3.5 text-white" />
            <span>{discountText}</span>
          </span>

          <div className="text-xs sm:text-sm font-black text-stone-950 flex items-center gap-1.5 sm:gap-2 truncate">
            <span className="text-base shrink-0">🎟️</span>
            <span className="text-red-700 font-black uppercase tracking-wider shrink-0">
              {lang === 'IT'
                ? 'COPERTURA SCONTO ATTIVA:'
                : lang === 'TH'
                ? 'ใช้ส่วนลดโปรโมชั่น:'
                : lang === 'DE'
                ? 'AKTIVER RABATT:'
                : lang === 'MM'
                ? 'အထူးလျှော့စျေး အသုံးပြုထားသည်:'
                : 'ACTIVE DISCOUNT COVERAGE:'}
            </span>
            <span className="truncate text-stone-950 font-black">
              {lang === 'IT'
                ? `Applicato il codice ${appliedPromo.code}`
                : lang === 'TH'
                ? `ใช้รหัส ${appliedPromo.code} แล้ว`
                : lang === 'DE'
                ? `Code ${appliedPromo.code} angewendet`
                : lang === 'MM'
                ? `ကုဒ် ${appliedPromo.code} ကို အသုံးပြုထားသည်`
                : `Code ${appliedPromo.code} applied`}
            </span>
            <span className="hidden md:inline text-stone-800 font-bold text-xs">
              (
              {lang === 'IT'
                ? 'sconto applicato sul totale dei piatti'
                : lang === 'TH'
                ? 'ส่วนลดคำนวณจากยอดรวมอาหาร'
                : lang === 'DE'
                ? 'Rabatt gültig auf Speisen & Getränke'
                : lang === 'MM'
                ? 'အစားအသောက် စုစုပေါင်းပေါ်တွင် လျှော့စျေး'
                : 'discount valid on food & drinks'}
              )
            </span>
          </div>
        </div>

        {/* Right: Quick Remove / Close Button */}
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-stone-900 hover:text-red-700 hover:bg-yellow-300 active:scale-95 rounded-full transition-all cursor-pointer shrink-0 font-bold"
          title={
            lang === 'IT'
              ? 'Rimuovi codice promozionale'
              : lang === 'TH'
              ? 'ลบรหัสโปรโมชั่น'
              : lang === 'DE'
              ? 'Gutscheincode entfernen'
              : lang === 'MM'
              ? 'ပရိုမိုးရှင်းကုဒ် ဖယ်ရှားရန်'
              : 'Remove promo code'
          }
          aria-label="Remove promo code"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
