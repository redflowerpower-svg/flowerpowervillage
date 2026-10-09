import React, { useState, useEffect } from 'react';
import { usePizzaAdminStore, PizzaPromoCode } from '../store/usePizzaAdminStore';
import {
  Ticket,
  Plus,
  Copy,
  Check,
  Trash2,
  Calendar,
  Percent,
  Coins,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Link as LinkIcon,
  Zap,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

interface PizzaPromoCodesSectionProps {
  isOpen?: boolean;
  onToggle?: () => void;
  borderless?: boolean;
}

export const PizzaPromoCodesSection: React.FC<PizzaPromoCodesSectionProps> = ({
  isOpen: externalIsOpen,
  onToggle: externalOnToggle,
  borderless = false
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleToggle = externalOnToggle || (() => setInternalIsOpen(!internalIsOpen));

  const {
    promoCodes,
    addPromoCode,
    togglePromoCodeActive,
    deletePromoCode,
    refreshPromoCodes
  } = usePizzaAdminStore();

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    refreshPromoCodes();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshPromoCodes();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrder, setMinOrder] = useState<number>(0);
  const [slotsTotal, setSlotsTotal] = useState<number>(50);
  const [isSingleUse, setIsSingleUse] = useState<boolean>(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const nextYearStr = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [validFrom, setValidFrom] = useState<string>(todayStr);
  const [validTo, setValidTo] = useState<string>(nextYearStr);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  // Accordion State
  const [isFormOpen, setIsFormOpen] = useState<boolean>(true);
  const [isListOpen, setIsListOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Generatore Ticket Random 🎲
  const generateRandomTicket = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomPart = '';
    for (let i = 0; i < 4; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newCode = `PIZZA-${randomPart}`;
    setCode(newCode);
  };

  const handleSingleUseChange = (checked: boolean) => {
    setIsSingleUse(checked);
    if (checked) {
      setSlotsTotal(1);
    }
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    addPromoCode({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Math.max(0, discountValue),
      minOrder: Math.max(0, minOrder),
      slotsTotal: isSingleUse ? 1 : Math.max(1, slotsTotal),
      isSingleUse,
      validFrom,
      validTo,
      active: true
    });

    // Reset Form
    setCode('');
    setMinOrder(0);
    setDiscountValue(10);
    setSlotsTotal(50);
    setIsSingleUse(false);
  };

  const copyToClipboard = (text: string, id: string, isLink = false) => {
    navigator.clipboard.writeText(text);
    if (isLink) {
      setCopiedLinkId(id);
      setTimeout(() => setCopiedLinkId(null), 2000);
    } else {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const getPromoShareUrl = (promoCode: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.flowerpowerpizza.com';
    return `${origin}/?promo=${encodeURIComponent(promoCode)}`;
  };

  const filteredCodes = promoCodes.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.code.toLowerCase().includes(q);
  });

  const activeCount = promoCodes.filter((p) => p.active).length;
  const totalUses = promoCodes.reduce((sum, p) => sum + (p.slotsUsed || 0), 0);

  return (
    <div
      className={`rounded-3xl transition-all duration-300 ${
        borderless
          ? 'bg-transparent'
          : 'bg-stone-900/90 border border-stone-800 shadow-xl overflow-hidden'
      }`}
    >
      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-stone-950 via-stone-900 to-[#8B1E1E]/40 border-b border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B1E1E] to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-950/40 shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Coupon & Codici Sconto Pizzeria
              </h3>
              <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                {activeCount} Attivi
              </span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                {totalUses} Utilizzi Totali
              </span>
            </div>
            <p className="text-stone-400 text-xs mt-0.5">
              Crea ticket promozionali e link condivisibili per WhatsApp, reception hotel, Instagram e clienti speciali
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            className={`p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-all cursor-pointer border border-stone-700 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Ricarica lista coupon"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* FORM: Creazione Nuovo Coupon (V20 Single-Line Compact Style) */}
        <div className="bg-stone-950/80 border border-stone-800/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Crea Nuovo Coupon / Ticket Promozionale</span>
            </h4>
            <button
              type="button"
              onClick={generateRandomTicket}
              className="text-xs font-bold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-3 py-1.5 rounded-xl border border-stone-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <span>🎲 Genera Codice Casuale</span>
            </button>
          </div>

          <form onSubmit={handleCreatePromo} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
              {/* Codice Coupon */}
              <div className="lg:col-span-3 space-y-1.5">
                <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block">
                  Codice Coupon
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="es. ESTATE2026"
                    className="w-full bg-stone-900 border border-stone-700 focus:border-red-500 rounded-xl px-3.5 py-2 text-sm font-black tracking-wider text-white uppercase placeholder:text-stone-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Tipo Sconto (% o ฿) */}
              <div className="lg:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block">
                  Tipo Sconto
                </label>
                <div className="grid grid-cols-2 gap-1 bg-stone-900 p-1 rounded-xl border border-stone-700">
                  <button
                    type="button"
                    onClick={() => setDiscountType('percentage')}
                    className={`py-1 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      discountType === 'percentage'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Percent className="w-3 h-3" />
                    <span>%</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('fixed')}
                    className={`py-1 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      discountType === 'fixed'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Coins className="w-3 h-3" />
                    <span>฿ Fisso</span>
                  </button>
                </div>
              </div>

              {/* Valore Sconto */}
              <div className="lg:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block">
                  Valore {discountType === 'percentage' ? '(%)' : '(THB ฿)'}
                </label>
                <input
                  type="number"
                  min="1"
                  max={discountType === 'percentage' ? 100 : 5000}
                  required
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full bg-stone-900 border border-stone-700 focus:border-red-500 rounded-xl px-3.5 py-2 text-sm font-bold text-white focus:outline-none transition-all"
                />
              </div>

              {/* Spesa Minima (THB ฿) */}
              <div className="lg:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block">
                  Spesa Min. (฿)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={minOrder}
                  onChange={(e) => setMinOrder(Number(e.target.value))}
                  placeholder="0 = nessun min"
                  className="w-full bg-stone-900 border border-stone-700 focus:border-red-500 rounded-xl px-3.5 py-2 text-sm font-bold text-white focus:outline-none transition-all"
                />
              </div>

              {/* Limite Slot / Utilizzi */}
              <div className="lg:col-span-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                    Max Utilizzi
                  </label>
                  <label className="flex items-center gap-1.5 text-[10px] text-stone-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSingleUse}
                      onChange={(e) => handleSingleUseChange(e.target.checked)}
                      className="rounded bg-stone-900 border-stone-700 text-red-600 focus:ring-0 w-3 h-3"
                    />
                    <span>1x Singolo</span>
                  </label>
                </div>
                <input
                  type="number"
                  min="1"
                  disabled={isSingleUse}
                  value={slotsTotal}
                  onChange={(e) => setSlotsTotal(Number(e.target.value))}
                  className="w-full bg-stone-900 border border-stone-700 focus:border-red-500 rounded-xl px-3.5 py-2 text-sm font-bold text-white disabled:opacity-50 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Date di Validità & Pulsante Crea */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end pt-2">
              {/* Valido Dal */}
              <div className="lg:col-span-4 space-y-1.5">
                <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>Valido Dal</span>
                </label>
                <input
                  type="date"
                  required
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 focus:border-red-500 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none transition-all"
                />
              </div>

              {/* Valido Fino Al */}
              <div className="lg:col-span-4 space-y-1.5">
                <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>Scadenza (Fino Al)</span>
                </label>
                <input
                  type="date"
                  required
                  value={validTo}
                  onChange={(e) => setValidTo(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 focus:border-red-500 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none transition-all"
                />
              </div>

              {/* Pulsante Crea Coupon */}
              <div className="lg:col-span-4">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-700 to-[#8B1E1E] hover:from-red-600 hover:to-red-700 text-white font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-red-500/40"
                >
                  <Plus className="w-4 h-4" />
                  <span>Salva & Attiva Coupon</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* LISTA DEI COUPON ATTIVI & ARCHIVIO */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-300 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-red-400" />
              <span>Lista Coupon Creati ({filteredCodes.length})</span>
            </h4>
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca coupon..."
                className="w-full bg-stone-900 border border-stone-700 focus:border-red-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-stone-500 focus:outline-none"
              />
            </div>
          </div>

          {filteredCodes.length === 0 ? (
            <div className="bg-stone-950/60 border border-stone-800 rounded-2xl p-8 text-center text-stone-500">
              <Ticket className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-semibold">Nessun coupon trovato.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredCodes.map((promo) => {
                const isExpired = promo.validTo && todayStr > promo.validTo;
                const isExhausted = promo.slotsTotal > 0 && promo.slotsUsed >= promo.slotsTotal;
                const shareUrl = getPromoShareUrl(promo.code);

                return (
                  <div
                    key={promo.id}
                    className={`bg-stone-950/90 border rounded-2xl p-4 transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm ${
                      !promo.active || isExpired || isExhausted
                        ? 'border-stone-800/80 opacity-65'
                        : 'border-stone-800 hover:border-red-500/50'
                    }`}
                  >
                    {/* Left Details */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                      {/* Code Badge */}
                      <div className="shrink-0 flex flex-col items-center">
                        <div className="px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 flex items-center gap-2 shadow-xs">
                          <span className="font-mono font-black text-sm tracking-wider text-amber-300">
                            {promo.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(promo.code, promo.id)}
                            className="text-stone-400 hover:text-white transition-colors cursor-pointer"
                            title="Copia codice"
                          >
                            {copiedId === promo.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Promo Specs */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider ${
                              promo.discountType === 'percentage'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {promo.discountType === 'percentage'
                              ? `-${promo.discountValue}% Sconto`
                              : `-${promo.discountValue} ฿ Sconto`}
                          </span>

                          {promo.minOrder > 0 && (
                            <span className="bg-stone-800 text-stone-300 border border-stone-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              Min. {promo.minOrder} ฿
                            </span>
                          )}

                          {isExpired ? (
                            <span className="bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              Scaduto
                            </span>
                          ) : isExhausted ? (
                            <span className="bg-stone-800 text-stone-400 border border-stone-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              Esaurito
                            </span>
                          ) : promo.active ? (
                            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                              Attivo
                            </span>
                          ) : (
                            <span className="bg-stone-800 text-stone-400 border border-stone-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              Disattivato
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-stone-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-stone-500" />
                            {promo.validFrom} ➔ {promo.validTo}
                          </span>
                          <span>•</span>
                          <span>
                            Utilizzi: <strong className="text-white">{promo.slotsUsed || 0}</strong> /{' '}
                            {promo.isSingleUse ? '1 (Uso Singolo)' : promo.slotsTotal}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-800">
                      {/* Copy Direct Promo Link */}
                      <button
                        type="button"
                        onClick={() => copyToClipboard(shareUrl, promo.id, true)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                          copiedLinkId === promo.id
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-stone-900 text-stone-200 hover:text-white hover:bg-stone-800 border-stone-700'
                        }`}
                        title={shareUrl}
                      >
                        {copiedLinkId === promo.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>Link Copiato!</span>
                          </>
                        ) : (
                          <>
                            <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
                            <span>Copia Link Promo</span>
                          </>
                        )}
                      </button>

                      {/* Toggle Active / Sospeso */}
                      <button
                        type="button"
                        onClick={() => togglePromoCodeActive(promo.id)}
                        className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          promo.active
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60'
                            : 'bg-stone-900 text-stone-400 border-stone-700 hover:text-white'
                        }`}
                        title={promo.active ? 'Sospendi coupon' : 'Attiva coupon'}
                      >
                        <Zap className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Eliminare definitivamente il coupon ${promo.code}?`)) {
                            deletePromoCode(promo.id);
                          }
                        }}
                        className="p-2 rounded-xl text-stone-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/60 transition-all cursor-pointer"
                        title="Elimina coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
