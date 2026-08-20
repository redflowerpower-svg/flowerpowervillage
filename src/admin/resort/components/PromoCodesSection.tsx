import React, { useState } from 'react';
import { useResortAdminStore, PromoCode } from '../store/useResortAdminStore';
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
  RefreshCw
} from 'lucide-react';

interface PromoCodesSectionProps {
  isOpen?: boolean;
  onToggle?: () => void;
  borderless?: boolean;
}

export const PromoCodesSection: React.FC<PromoCodesSectionProps> = ({
  isOpen: externalIsOpen,
  onToggle: externalOnToggle,
  borderless = false
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleToggle = externalOnToggle || (() => setInternalIsOpen(!internalIsOpen));

  const { promoCodes, addPromoCode, togglePromoCodeActive, deletePromoCode, refreshPromoCodes } = useResortAdminStore();
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

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
  const [slotsTotal, setSlotsTotal] = useState<number>(10);
  const [isSingleUse, setIsSingleUse] = useState<boolean>(false);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const nextYearStr = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const [validFrom, setValidFrom] = useState<string>(todayStr);
  const [validTo, setValidTo] = useState<string>(nextYearStr);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Accordion State for List
  const [isFormOpen, setIsFormOpen] = useState<boolean>(true);
  const [isListOpen, setIsListOpen] = useState<boolean>(true);
  const [expandedCodeId, setExpandedCodeId] = useState<string | null>(null);

  // Generatore Ticket Random 🎲
  const generateRandomTicket = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomPart = '';
    for (let i = 0; i < 4; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newCode = `TICKET-${randomPart}`;
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
      code: code.trim(),
      discountType,
      discountValue: Math.max(0, discountValue),
      slotsTotal: isSingleUse ? 1 : Math.max(1, slotsTotal),
      isSingleUse,
      validFrom,
      validTo,
      active: true
    });

    // Reset Form
    setCode('');
    setDiscountValue(10);
    setSlotsTotal(10);
    setIsSingleUse(false);
  };

  const copyShareableLink = (promoCode: string, id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/village?promo=${encodeURIComponent(promoCode)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className={borderless ? "space-y-4 transition-all" : "bg-fuchsia-950/20 border-4 border-double border-fuchsia-500/40 rounded-2xl p-3.5 sm:p-4 shadow-xl shadow-fuchsia-950/30 space-y-4 ring-1 ring-fuchsia-500/10 transition-all"}>
      {/* HEADER SECTION */}
      <div 
        onClick={borderless ? undefined : handleToggle}
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 select-none ${
          borderless ? 'border-b border-fuchsia-500/30 pb-3' : `cursor-pointer group ${isOpen ? 'border-b border-fuchsia-500/30 pb-3' : ''}`
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/50 flex items-center justify-center text-fuchsia-300 flex-shrink-0 shadow">
            <Ticket className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-2 uppercase group-hover:text-fuchsia-300 transition-colors">
              CODICI PROMOZIONALI & TICKET
            </h3>
            <p className="text-stone-400 text-[11px] font-medium">
              Gestione sconti personalizzati, ticket monouso/multipli e tracciamento avanzato degli utilizzi.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/30 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
            PROMO ENGINE V19
          </span>
          {!borderless && (
            <ChevronDown className={`w-5 h-5 text-fuchsia-400 transition-transform duration-200 flex-shrink-0 ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`} />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="space-y-4 pt-1">

      {/* FORM DI CREAZIONE COUPON */}
      <div className="bg-stone-950/60 border border-fuchsia-500/30 rounded-xl p-3.5 space-y-3">
        <div 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <span className="text-xs font-black text-fuchsia-300 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-fuchsia-400" />
            CREA NUOVO COUPON O TICKET
          </span>
          {isFormOpen ? <ChevronUp className="w-4 h-4 text-fuchsia-400" /> : <ChevronDown className="w-4 h-4 text-fuchsia-400" />}
        </div>

        {isFormOpen && (
          <form onSubmit={handleCreatePromo} className="pt-2 border-t border-fuchsia-900/40">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
              
              {/* 1. Codice Coupon con tasto 🎲 posizionato assolutamente all'interno dell'input */}
              <div className="relative flex-1 min-w-[180px] h-10">
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="CODICE O TICKET..."
                  className="w-full h-full bg-stone-900 border border-stone-800 rounded-xl pl-3 pr-9 text-xs text-white font-mono uppercase tracking-wider font-extrabold focus:outline-none focus:border-fuchsia-500"
                />
                <button
                  type="button"
                  onClick={generateRandomTicket}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-fuchsia-400 hover:text-fuchsia-300 font-bold transition-colors cursor-pointer"
                  title="Genera Ticket Random 🎲"
                >
                  <Sparkles className="w-4 h-4 text-fuchsia-400 animate-pulse" />
                </button>
              </div>

              {/* 2. Tipo & Valore Sconto (% / ฿) */}
              <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-xl p-1 h-10 flex-shrink-0">
                <div className="flex bg-stone-950 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setDiscountType('percentage')}
                    className={`px-2 py-1 text-[10px] font-black rounded-md transition-all cursor-pointer ${
                      discountType === 'percentage'
                        ? 'bg-fuchsia-600 text-white shadow'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('fixed')}
                    className={`px-2 py-1 text-[10px] font-black rounded-md transition-all cursor-pointer ${
                      discountType === 'fixed'
                        ? 'bg-fuchsia-600 text-white shadow'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    ฿
                  </button>
                </div>
                <input
                  type="number"
                  min="1"
                  step={discountType === 'percentage' ? '1' : '50'}
                  required
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  className="w-14 bg-transparent text-xs text-fuchsia-400 font-mono font-black text-center focus:outline-none"
                  title="Valore dello sconto"
                />
              </div>

              {/* 3. Slots Utilizzi Totali */}
              <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 rounded-xl px-2.5 h-10 flex-shrink-0">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">Slots:</span>
                <input
                  type="number"
                  min="1"
                  disabled={isSingleUse}
                  value={slotsTotal}
                  onChange={(e) => setSlotsTotal(parseInt(e.target.value) || 1)}
                  className="w-12 bg-transparent text-xs text-white font-mono font-black text-center focus:outline-none disabled:opacity-50"
                  title="Slots utilizzi totali"
                />
              </div>

              {/* 4. Checkbox Monouso */}
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-stone-300 font-bold select-none px-2.5 h-10 bg-stone-900 border border-stone-800 rounded-xl flex-shrink-0">
                <input
                  type="checkbox"
                  checked={isSingleUse}
                  onChange={(e) => handleSingleUseChange(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-stone-950 border-stone-700 text-fuchsia-600 focus:ring-fuchsia-500 cursor-pointer"
                />
                <span className="text-[11px] font-extrabold text-fuchsia-300 whitespace-nowrap">
                  Monouso 🎟️
                </span>
              </label>

              {/* 5. Date Picker Unificato (Dal ➔ Al) */}
              <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-xl px-2.5 h-10 flex-shrink-0">
                <input
                  type="date"
                  required
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  className="bg-transparent text-[11px] text-white font-mono font-bold focus:outline-none cursor-pointer"
                  title="Data inizio validità"
                />
                <span className="text-fuchsia-400 font-black text-xs px-0.5">➔</span>
                <input
                  type="date"
                  required
                  value={validTo}
                  onChange={(e) => setValidTo(e.target.value)}
                  className="bg-transparent text-[11px] text-white font-mono font-bold focus:outline-none cursor-pointer"
                  title="Data fine validità"
                />
              </div>

              {/* 6. Pulsante Principale: + AGGIUNGI (h-10 fissa) */}
              <button
                type="submit"
                className="h-10 px-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-fuchsia-950/50 cursor-pointer transition-all flex items-center justify-center gap-1.5 whitespace-nowrap flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>AGGIUNGI</span>
              </button>

            </div>
          </form>
        )}
      </div>

      {/* LISTA TRACCIABILE DEI CODICI PROMOZIONALI */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div 
            onClick={() => setIsListOpen(!isListOpen)}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>LISTA TRACCIABILE DEI COUPON ({promoCodes.length})</span>
            </h4>
            {isListOpen ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-850 border border-stone-750 hover:border-fuchsia-500/50 text-fuchsia-400 hover:text-fuchsia-300 text-[11px] font-extrabold rounded-xl transition-all cursor-pointer shadow-md active:scale-95"
            title="Ricarica e aggiorna lo stato di utilizzo dei coupon"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-fuchsia-300' : ''}`} />
            <span>AGGIORNA STATO CONSUMO</span>
          </button>
        </div>

        {isListOpen && (
          <div className="space-y-2.5">
            {promoCodes.length === 0 ? (
              <div className="p-4 bg-stone-950/40 border border-stone-800 rounded-xl text-center text-xs text-stone-400">
                Nessun codice promozionale creato. Utilizza il form sopra per generarne uno!
              </div>
            ) : (
              promoCodes.map((p) => {
                const usagePercent = Math.min(100, Math.round((p.slotsUsed / p.slotsTotal) * 100));
                const isExhausted = p.slotsUsed >= p.slotsTotal;
                const isExpanded = expandedCodeId === p.id;

                return (
                  <div
                    key={p.id}
                    className={`bg-stone-950/70 border rounded-xl p-3 space-y-2.5 transition-all ${
                      p.active && !isExhausted
                        ? 'border-fuchsia-500/40 shadow-sm shadow-fuchsia-950/20'
                        : 'border-stone-850 opacity-70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                      {/* Left: Code badge, Value, and Validity */}
                      <div className="flex items-center gap-3">
                        <div className="px-2.5 py-1 bg-fuchsia-950/80 border border-fuchsia-500/50 rounded-lg text-fuchsia-300 font-mono font-black text-xs tracking-wider flex items-center gap-1.5 shadow-sm">
                          <Ticket className="w-3.5 h-3.5 text-fuchsia-400" />
                          <span>{p.code}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white font-mono">
                            {p.discountType === 'percentage' ? `-${p.discountValue}%` : `-฿${p.discountValue}`}
                          </span>

                          {p.isSingleUse && (
                            <span className="text-[9px] bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 px-1.5 py-0.5 rounded font-black uppercase">
                              MONOUSO
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Controls: Active Switch, Share Link, Accordion Expand & Delete */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        {/* Active Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => togglePromoCodeActive(p.id)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                            p.active && !isExhausted
                              ? 'bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-600/40'
                              : 'bg-stone-900 border border-stone-800 text-stone-500 hover:text-stone-300'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${p.active && !isExhausted ? 'bg-emerald-400 animate-pulse' : 'bg-stone-600'}`} />
                          <span>{p.active && !isExhausted ? 'ATTIVO' : 'DISATTIVO'}</span>
                        </button>

                        {/* Copy Shareable Link */}
                        <button
                          type="button"
                          onClick={() => copyShareableLink(p.code, p.id)}
                          className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-750 text-fuchsia-300 text-[10px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                          title="Copia link condivisibile per questo codice promozionale"
                        >
                          {copiedId === p.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-300 font-extrabold">Copiato!</span>
                            </>
                          ) : (
                            <>
                              <LinkIcon className="w-3 h-3 text-fuchsia-400" />
                              <span>Copia Link (?promo={p.code})</span>
                            </>
                          )}
                        </button>

                        {/* Expand / Collapse Details Button */}
                        <button
                          type="button"
                          onClick={() => setExpandedCodeId(isExpanded ? null : p.id)}
                          className="p-1 text-stone-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => deletePromoCode(p.id)}
                          className="p-1 text-stone-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Elimina codice promozionale"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar of Slots Usage */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-stone-400 font-medium">
                          Utilizzi: <strong className="text-white font-mono">{p.slotsUsed}</strong> su <strong className="text-white font-mono">{p.slotsTotal}</strong> slots
                        </span>
                        <span className={`font-mono font-bold ${isExhausted ? 'text-red-400' : 'text-fuchsia-300'}`}>
                          {isExhausted ? 'ESHAUSTO (100%)' : `${usagePercent}% completato`}
                        </span>
                      </div>
                      <div className="w-full bg-stone-900 rounded-full h-2 overflow-hidden border border-stone-800">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isExhausted
                              ? 'bg-red-500'
                              : usagePercent > 80
                              ? 'bg-amber-500'
                              : 'bg-gradient-to-r from-fuchsia-600 to-rose-500'
                          }`}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Accordion Details (Validità date e info estese) */}
                    {isExpanded && (
                      <div className="pt-2 border-t border-stone-850 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10.5px] text-stone-400 bg-stone-900/40 p-2 rounded-lg">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-stone-500" />
                          <span>Validità: </span>
                          <strong className="text-stone-200 font-mono">{p.validFrom}</strong>
                          <span> fino al </span>
                          <strong className="text-stone-200 font-mono">{p.validTo}</strong>
                        </div>
                        <div>
                          <span>Creato il: </span>
                          <span className="font-mono text-stone-300">{new Date(p.createdAt).toLocaleDateString('it-IT')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      </div>
      )}
    </div>
  );
};
