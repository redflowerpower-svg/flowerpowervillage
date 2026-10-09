import React from 'react';
import { Percent, X } from 'lucide-react';
import type { PizzaPromoCode } from '../services/pizzaPromoService';
import type { Language } from '../config/languages';

interface PizzaPromoBannerProps {
  appliedPromo: PizzaPromoCode | null;
  onRemove: () => void;
  lang?: Language;
}

const BANNER_I18N: Record<
  Language,
  {
    coverageTitle: string;
    codeApplied: (code: string) => string;
    scopeNote: string;
    removeBtnTitle: string;
  }
> = {
  IT: {
    coverageTitle: 'COPERTURA SCONTO ATTIVA:',
    codeApplied: (c) => `Codice ${c} applicato`,
    scopeNote: 'sconto valido su cibo e bevande',
    removeBtnTitle: 'Rimuovi codice promozionale',
  },
  EN: {
    coverageTitle: 'ACTIVE DISCOUNT COVERAGE:',
    codeApplied: (c) => `Code ${c} applied`,
    scopeNote: 'discount valid on food & drinks',
    removeBtnTitle: 'Remove promo code',
  },
  TH: {
    coverageTitle: 'ความคุ้มครองส่วนลดที่ใช้งานอยู่:',
    codeApplied: (c) => `ใช้โค้ด ${c} แล้ว`,
    scopeNote: 'ส่วนลดใช้ได้กับอาหารและเครื่องดื่ม',
    removeBtnTitle: 'ลบโค้ดโปรโมชั่น',
  },
  MM: {
    coverageTitle: 'အသုံးပြုနေသော လျှော့စျေး လွှမ်းခြုံမှု-',
    codeApplied: (c) => `ကုဒ် ${c} ကို အသုံးပြုပြီးပါပြီ`,
    scopeNote: 'အစားအသောက်နှင့် အဖျော်ယမကာများအတွက် လျှော့စျေး အကျုံးဝင်သည်',
    removeBtnTitle: 'ပရိုမိုကုဒ်ကို ဖယ်ရှားပါ',
  },
  DE: {
    coverageTitle: 'AKTIVE RABATTABDECKUNG:',
    codeApplied: (c) => `Code ${c} angewendet`,
    scopeNote: 'Rabatt gültig für Speisen & Getränke',
    removeBtnTitle: 'Promo-Code entfernen',
  },
  ES: {
    coverageTitle: 'COBERTURA DE DESCUENTO ACTIVA:',
    codeApplied: (c) => `Código ${c} aplicado`,
    scopeNote: 'descuento válido en comida y bebidas',
    removeBtnTitle: 'Eliminar código promocional',
  },
  FR: {
    coverageTitle: 'COUVERTURE DE RÉDUCTION ACTIVE :',
    codeApplied: (c) => `Code ${c} appliqué`,
    scopeNote: 'réduction valable sur la nourriture et les boissons',
    removeBtnTitle: 'Supprimer le code promo',
  },
  RU: {
    coverageTitle: 'АКТИВНОЕ ПОКРЫТИЕ СКИДКИ:',
    codeApplied: (c) => `Код ${c} применён`,
    scopeNote: 'скидка действует на еду и напитки',
    removeBtnTitle: 'Удалить промокод',
  },
  ZH: {
    coverageTitle: '有效折扣覆盖范围：',
    codeApplied: (c) => `代码 ${c} 已应用`,
    scopeNote: '折扣适用于食品和饮料',
    removeBtnTitle: '移除促销代码',
  },
};

/**
 * Floating Bright Yellow & Neon Red Promo Banner
 * Replicates the Village banner style (fixed bottom-0 left-0 right-0 z-30)
 * Informs customer that a promo code is actively covering their order
 */
export const PizzaPromoBanner: React.FC<PizzaPromoBannerProps> = ({
  appliedPromo,
  onRemove,
  lang = 'IT',
}) => {
  if (!appliedPromo) return null;

  const t = BANNER_I18N[lang] || BANNER_I18N.IT;

  const discountText =
    appliedPromo.discountType === 'percentage'
      ? `-${appliedPromo.discountValue}%`
      : `-฿${appliedPromo.discountValue}`;

  return (
    <div
      role="region"
      aria-label="Promozione Attiva"
      className="fixed bottom-0 left-0 right-0 z-30 bg-yellow-400 border-t-4 border-red-600 shadow-[0_-4px_25px_rgba(220,38,38,0.5)] px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-300 animate-fadeIn"
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
              {t.coverageTitle}
            </span>
            <span className="truncate text-stone-950 font-black">
              {t.codeApplied(appliedPromo.code)}
            </span>
            <span className="hidden md:inline text-stone-800 font-bold text-xs">
              ({t.scopeNote})
            </span>
          </div>
        </div>

        {/* Right: Quick Remove / Close Button */}
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-stone-900 hover:text-red-700 hover:bg-yellow-300 active:scale-95 rounded-full transition-all cursor-pointer shrink-0 font-bold"
          title={t.removeBtnTitle}
          aria-label={t.removeBtnTitle}
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
