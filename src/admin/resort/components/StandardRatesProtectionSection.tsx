import React, { useRef, useState } from 'react';
import { Bed, Zap, RefreshCw, AlertTriangle, CheckCircle, AlertCircle, ShieldCheck, ChevronDown, BookmarkCheck, Undo2, RotateCcw, Loader2 } from 'lucide-react';
import { useResortAdminStore } from '../store/useResortAdminStore';
import { DiscountExecutionMode } from '../lib/octorateAdmin';

const formatLastUpdateStr = (dateVal?: string | number | Date | null): string => {
  if (!dateVal) return 'Nessuna operazione eseguita';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return 'Nessuna operazione eseguita';
  return d.toLocaleString('it-IT');
};

interface StandardRatesProtectionSectionProps {
  isOpen?: boolean;
  onToggle?: () => void;
  borderless?: boolean;
}

export const StandardRatesProtectionSection: React.FC<StandardRatesProtectionSectionProps> = ({
  isOpen: externalIsOpen,
  onToggle: externalOnToggle,
  borderless = false
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleToggle = externalOnToggle || (() => setInternalIsOpen(!internalIsOpen));

  const {
    standardProtectionActive,
    standardProtectionExecutionMode,
    standardSeasonStartDate,
    standardSeasonEndDate,
    standardDaysTriggerLimit,
    standardDaysOpenDuration,
    standardProtectionRunning,
    standardProtectionExecuting,
    standardProtectionResetting,
    standardProtectionResult,
    setStandardProtectionExecutionMode,
    setStandardSeasonStartDate,
    setStandardSeasonEndDate,
    setStandardDaysTriggerLimit,
    setStandardDaysOpenDuration,
    executeStandardProtectionStrategy,
    saveStandardRatesSnapshot,
    rollbackStandardRatesSnapshot
  } = useResortAdminStore();

  const seasonStartRef = useRef<HTMLInputElement>(null);
  const seasonEndRef = useRef<HTMLInputElement>(null);
  const [showProdModal, setShowProdModal] = useState(false);
  const [snapshotMessage, setSnapshotMessage] = useState<string | null>(null);
  const [deactivateArmed, setDeactivateArmed] = useState(false);
  const [executeArmed, setExecuteArmed] = useState(false);

  React.useEffect(() => {
    if (!deactivateArmed) return;
    const timer = setTimeout(() => setDeactivateArmed(false), 4000);
    return () => clearTimeout(timer);
  }, [deactivateArmed]);

  React.useEffect(() => {
    if (!executeArmed) return;
    const timer = setTimeout(() => setExecuteArmed(false), 4000);
    return () => clearTimeout(timer);
  }, [executeArmed]);

  const handleModeChange = (mode: DiscountExecutionMode) => {
    if (mode === 'production') {
      setShowProdModal(true);
    } else {
      setStandardProtectionExecutionMode(mode);
    }
  };

  const confirmProductionMode = () => {
    setStandardProtectionExecutionMode('production');
    setShowProdModal(false);
  };

  return (
    <div className={borderless ? "space-y-3 transition-all" : "bg-cyan-950/20 border-4 border-double border-cyan-500/40 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-xl shadow-cyan-950/30 ring-1 ring-cyan-500/10 transition-all"}>

      {/* 1. HEADER SECTION */}
      <div 
        onClick={borderless ? undefined : handleToggle}
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 select-none ${
          borderless ? 'border-b border-cyan-500/30 pb-3' : `cursor-pointer group ${isOpen ? 'border-b border-cyan-500/30 pb-2.5' : ''}`
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 flex-shrink-0 shadow">
            <Bed className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-2 uppercase group-hover:text-cyan-300 transition-colors">
              TARIFFE STANDARD OTA - HIGH SEASON
            </h3>
            <p className="text-stone-400 text-[11px] font-medium">
              Apertura tariffe standard nelle agenzie online Booking.com, Expedia e  Agoda durante High Season per offrire un prezzo last minute
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
            TARIFFA STANDARD 7D OTA
          </span>
          {!borderless && (
            <ChevronDown className={`w-5 h-5 text-cyan-400 transition-transform duration-200 flex-shrink-0 ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`} />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="space-y-3">

          {/* Master Status & Auto-Sync Banner (Identico a Last Minute e Soggiorno Minimo) */}
          <div className={`p-4 rounded-2xl border transition-all duration-300 ${
            standardProtectionActive
              ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/40'
              : 'bg-stone-900/60 border-stone-800'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {standardProtectionActive ? (
                  <span className="relative flex h-4 w-4 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 shadow-md shadow-emerald-400"></span>
                  </span>
                ) : (
                  <span className="inline-flex rounded-full h-4 w-4 bg-stone-600 border border-stone-500 flex-shrink-0"></span>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black uppercase tracking-wider ${
                      standardProtectionActive ? 'text-emerald-300' : 'text-stone-400'
                    }`}>
                      {standardProtectionActive ? '🟢 SERVIZIO ATTIVO (SINCRONIZZAZIONE GIORNALIERA AUTOMATICA)' : '⚪ SERVIZIO DISATTIVATO (IN STOP-SELL STANDARD)'}
                    </span>
                    {standardProtectionActive && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                        LIVE PMS
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5 font-medium">
                    {standardProtectionActive
                      ? `Finestra rolling attiva da Trigger ${standardDaysTriggerLimit}gg con ${standardDaysOpenDuration}gg aperti su Booking, Expedia, Agoda.`
                      : 'Le tariffe standard 7d sono protette in Stop-Sell su Booking.com, Expedia ed Agoda durante la High Season.'}
                  </p>
                </div>
              </div>

              {/* Dual-Click Toggle / Deactivation Button */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {standardProtectionActive && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!deactivateArmed) {
                        setDeactivateArmed(true);
                        return;
                      }
                      setDeactivateArmed(false);
                      executeStandardProtectionStrategy(true);
                    }}
                    disabled={standardProtectionRunning}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      deactivateArmed
                        ? 'bg-red-600 text-white animate-bounce shadow-lg shadow-red-950/60'
                        : 'bg-stone-900 hover:bg-stone-800 text-rose-300 border border-rose-500/30'
                    }`}
                    title="Disattiva e ripristina lo Stop-Sell standard"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 text-rose-400 ${standardProtectionResetting ? 'animate-spin' : ''}`} />
                    <span>{standardProtectionResetting ? 'Disattivazione...' : deactivateArmed ? 'CONFERMI DISATTIVAZIONE?' : 'DISATTIVA SERVIZIO'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 2. CONFIGURATION FIELDS SECTION (4 SNELLA COLUMNS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
            {/* Inizio Stagione */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">
                📅 Inizio Stagione
              </label>
              <input
                type="date"
                ref={seasonStartRef}
                value={standardSeasonStartDate}
                onClick={(e) => e.currentTarget.showPicker()}
                onChange={(e) => setStandardSeasonStartDate(e.target.value)}
                className="bg-stone-900 border border-cyan-500/30 text-stone-200 text-xs font-mono font-bold rounded-lg p-2 focus:border-cyan-400 focus:outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>

            {/* Fine Stagione */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">
                📅 Fine Stagione
              </label>
              <input
                type="date"
                ref={seasonEndRef}
                value={standardSeasonEndDate}
                onClick={(e) => e.currentTarget.showPicker()}
                onChange={(e) => setStandardSeasonEndDate(e.target.value)}
                className="bg-stone-900 border border-cyan-500/30 text-stone-200 text-xs font-mono font-bold rounded-lg p-2 focus:border-cyan-400 focus:outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>

            {/* Trigger Apertura (N <= GG) */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-cyan-400 tracking-wider truncate" title="Quanti giorni prima del check-in sbloccare la Tariffa 7d">
                Trigger Apertura (N ≤ GG)
              </label>
              <div className="flex items-center bg-stone-900 border border-cyan-500/30 rounded-lg px-2">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={standardDaysTriggerLimit}
                  onChange={(e) => setStandardDaysTriggerLimit(parseInt(e.target.value) || 15)}
                  className="bg-transparent text-stone-200 text-xs font-mono font-bold p-2 w-full focus:outline-none"
                />
                <span className="text-[10px] text-stone-400 font-bold">gg</span>
              </div>
            </div>

            {/* Durata Apertura (GG) */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-amber-400 tracking-wider truncate" title="Per quanti giorni consecutivi aprire la tariffa">
                Durata Apertura (GG)
              </label>
              <div className="flex items-center bg-stone-900 border border-cyan-500/30 rounded-lg px-2">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={standardDaysOpenDuration}
                  onChange={(e) => setStandardDaysOpenDuration(parseInt(e.target.value) || 10)}
                  className="bg-transparent text-stone-200 text-xs font-mono font-bold p-2 w-full focus:outline-none"
                />
                <span className="text-[10px] text-stone-400 font-bold">gg</span>
              </div>
            </div>
          </div>

          {/* Temporary Snapshot Feedback Banner */}
          {snapshotMessage && (
            <div className="p-2.5 bg-cyan-950/60 border border-cyan-500/50 rounded-xl text-cyan-300 text-xs font-bold flex items-center gap-2 animate-pulse shadow-md">
              <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>{snapshotMessage}</span>
            </div>
          )}

          {/* 3. CONTROLS & EXECUTION ROW */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mt-6 pt-4 border-t border-cyan-500/20">

            {/* Execution Mode Selector (Left Aligned) */}
            <div className="flex items-center gap-1.5 bg-stone-950 p-1.5 rounded-xl border border-stone-800 shadow-inner w-full md:w-auto overflow-x-auto">
              <span className="text-[11px] font-black text-stone-300 px-1.5 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                MODALITÀ:
              </span>

              <button
                type="button"
                onClick={() => handleModeChange('simulation')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  standardProtectionExecutionMode === 'simulation'
                    ? 'bg-red-500 text-white shadow-sm shadow-red-950/40'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                🔴 SIMULAZIONE DRY-RUN
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('test_bungalows')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  standardProtectionExecutionMode === 'test_bungalows'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm shadow-amber-950/40'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                🧪 AMBIENTE DI TEST
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('production')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  standardProtectionExecutionMode === 'production'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/40 animate-pulse'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                🌐 PRODUZIONE
              </button>
            </div>

            {/* Action Buttons (Right Aligned - Con Salva e Rollback prima di Esegui) */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  saveStandardRatesSnapshot();
                  setSnapshotMessage('💾 Configurazione di default salvata!');
                  setTimeout(() => setSnapshotMessage(null), 3500);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-black uppercase tracking-wider rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 transition-all cursor-pointer shadow-sm hover:border-cyan-400"
                title="Salva la configurazione attuale come default di riferimento"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>SALVA DEFAULT</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const res = rollbackStandardRatesSnapshot();
                  setSnapshotMessage(res.message);
                  setTimeout(() => setSnapshotMessage(null), 4000);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-black uppercase tracking-wider rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-750 text-stone-300 hover:text-white transition-all cursor-pointer shadow-sm"
                title="Reimporta la configurazione di default precedentemente salvata"
              >
                <Undo2 className="w-3.5 h-3.5 text-amber-400" />
                <span>ROLLBACK DEFAULT</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const isLiveTarget = standardProtectionExecutionMode === 'test_bungalows' || standardProtectionExecutionMode === 'production';
                  if (isLiveTarget && !executeArmed) {
                    setExecuteArmed(true);
                    return;
                  }
                  setExecuteArmed(false);
                  executeStandardProtectionStrategy(false);
                }}
                disabled={standardProtectionRunning}
                className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 ${
                  executeArmed
                    ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse ring-2 ring-rose-400'
                    : standardProtectionExecutionMode === 'production'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                    : standardProtectionExecutionMode === 'test_bungalows'
                    ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-950/50'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/50'
                }`}
              >
                {standardProtectionExecuting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>In corso...</span>
                  </>
                ) : executeArmed ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>SEI SICURO? CLICCA PER CONFERMARE</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>ESEGUI TARIFFE STANDARD</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => executeStandardProtectionStrategy(true)}
                disabled={standardProtectionRunning}
                className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl bg-stone-950 border border-stone-800 text-stone-300 hover:bg-stone-850 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${standardProtectionResetting ? 'animate-spin' : ''}`} />
                <span>{standardProtectionResetting ? 'Ripristino...' : 'RIPRISTINO VALORI ORIGINALI'}</span>
              </button>
            </div>
          </div>

          {/* Execution Feedback Message */}
          {standardProtectionResult && (
            <div className={`mt-3 p-3 rounded-xl border text-xs leading-relaxed ${
              standardProtectionResult.success
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-red-950/40 border-red-800/60 text-red-300'
            }`}>
              <div className="font-bold flex items-center gap-2">
                {standardProtectionResult.success ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                <span>{standardProtectionResult.message}</span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono block mt-1">
                Aggiornato: {formatLastUpdateStr(standardProtectionResult.dateUpdated)}
              </span>
            </div>
          )}

          {/* Production Double Confirmation Modal */}
          {showProdModal && (
            <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-stone-900 border-2 border-red-600/80 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.3)] space-y-5">
                <div className="flex items-center gap-3 text-red-400">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-400 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm sm:text-base uppercase tracking-wider">
                      CONFERMA MODALITÀ PRODUZIONE
                    </h3>
                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Tariffe Standard OTA</span>
                  </div>
                </div>

                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                  ⚠️ <strong>ATTENZIONE:</strong> Stai per attivare la modalità <strong>PRODUZIONE REAL TIME</strong> per le Tariffe Standard 7d OTA.
                  <br /><br />
                  Le modifiche di Stop-Sell per la tariffa Standard 7d verranno inviate <strong>realmente a tutte le 18 camere fisiche del resort su Octorate PMS</strong>.
                </p>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setShowProdModal(false)}
                    className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    type="button"
                    onClick={confirmProductionMode}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-950/50 cursor-pointer transition-all active:scale-95"
                  >
                    Sì, Attiva Produzione Reale
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
