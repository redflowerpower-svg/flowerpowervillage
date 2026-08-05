import React, { useRef, useState } from 'react';
import { Bed, Zap, RefreshCw, AlertTriangle, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { useResortAdminStore } from '../store/useResortAdminStore';
import { DiscountExecutionMode } from '../lib/octorateAdmin';

export const StandardRatesProtectionSection: React.FC = () => {
  const {
    standardProtectionExecutionMode,
    standardSeasonStartDate,
    standardSeasonEndDate,
    standardDaysTriggerLimit,
    standardDaysOpenDuration,
    standardDaysCtaDuration,
    standardProtectionRunning,
    standardProtectionResult,
    setStandardProtectionExecutionMode,
    setStandardSeasonStartDate,
    setStandardSeasonEndDate,
    setStandardDaysTriggerLimit,
    setStandardDaysOpenDuration,
    setStandardDaysCtaDuration,
    executeStandardProtectionStrategy
  } = useResortAdminStore();

  const seasonStartRef = useRef<HTMLInputElement>(null);
  const seasonEndRef = useRef<HTMLInputElement>(null);
  const [showProdModal, setShowProdModal] = useState(false);

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

  const isDurationSumMismatch = (standardDaysOpenDuration + standardDaysCtaDuration) !== standardDaysTriggerLimit;
  const ctaThreshold = standardDaysTriggerLimit - standardDaysOpenDuration;

  return (
    <div className="bg-cyan-950/20 border border-cyan-500/30 shadow-xl rounded-2xl p-4 space-y-3">

      {/* 1. HEADER SECTION */}
      <div className="flex justify-between items-start mb-4 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 flex-shrink-0 shadow-sm">
            <Bed className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-black text-cyan-100 uppercase tracking-wider">
                TARIFFE STANDARD HIGH SEASON (Last Minute)
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                TARIFFE DERIVATE 7D & 14D OTA
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1 font-medium leading-tight">
              Protezione automatica ad ampiezza stagionale su Booking.com, Expedia ed Agoda (Sito Diretto & Airbnb sempre aperti).
            </p>
          </div>
        </div>
      </div>

      {/* 2. CONFIGURATION FIELDS SECTION (MIDDLE ROW - 5 COLUMNS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 my-4">
        {/* Inizio Stagione */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider">
            📅 Inizio Stagione
          </label>
          <input
            type="date"
            ref={seasonStartRef}
            defaultValue={standardSeasonStartDate}
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
            defaultValue={standardSeasonEndDate}
            onClick={(e) => e.currentTarget.showPicker()}
            onChange={(e) => setStandardSeasonEndDate(e.target.value)}
            className="bg-stone-900 border border-cyan-500/30 text-stone-200 text-xs font-mono font-bold rounded-lg p-2 focus:border-cyan-400 focus:outline-none cursor-pointer [color-scheme:dark]"
          />
        </div>

        {/* Trigger Apertura (N <= GG) */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase text-cyan-400 tracking-wider truncate" title="Quanti giorni prima sbloccare la Standard">
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
          <label className="text-[10px] font-black uppercase text-amber-400 tracking-wider truncate" title="Per quanti giorni rimanere aperta in Last-Minute">
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

        {/* Durata Check-out CTA (GG) */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase text-orange-400 tracking-wider truncate" title="Per quanti giorni sotto data imporre Solo Check-out">
            Durata Check-out (GG)
          </label>
          <div className="flex items-center bg-stone-900 border border-cyan-500/30 rounded-lg px-2">
            <input
              type="number"
              min="1"
              max="30"
              value={standardDaysCtaDuration}
              onChange={(e) => setStandardDaysCtaDuration(parseInt(e.target.value) || 5)}
              className="bg-transparent text-stone-200 text-xs font-mono font-bold p-2 w-full focus:outline-none"
            />
            <span className="text-[10px] text-stone-400 font-bold">gg</span>
          </div>
        </div>
      </div>

      {/* 3. CONTROLS & EXECUTION ROW (BOTTOM ROW - ALIGNED 1:1) */}
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

        {/* Action Buttons (Right Aligned) */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => executeStandardProtectionStrategy(false)}
            disabled={standardProtectionRunning}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 ${
              standardProtectionExecutionMode === 'production'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                : standardProtectionExecutionMode === 'test_bungalows'
                ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-950/50'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/50'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${standardProtectionRunning ? 'animate-spin' : ''}`} />
            <span>{standardProtectionRunning ? 'In corso...' : 'ESEGUI TARIFFE STANDARD'}</span>
          </button>
          <button
            type="button"
            onClick={() => executeStandardProtectionStrategy(true)}
            disabled={standardProtectionRunning}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl bg-stone-950 border border-stone-800 text-stone-300 hover:bg-stone-850 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${standardProtectionRunning ? 'animate-spin' : ''}`} />
            <span>RIPRISTINO VALORI ORIGINALI</span>
          </button>
        </div>
      </div>

      {/* Legend aligned on the bottom right */}
      <div className="mt-2 text-right">
        <span className="text-[10px] text-cyan-400/70 italic font-mono font-bold">
          Stadio Attesa: N &gt; {standardDaysTriggerLimit}d (🔒) • Last-Minute: {standardDaysTriggerLimit}d → {ctaThreshold + 1}d (↗️) • CTA: N &lt;= {ctaThreshold}d (🛬)
        </span>
      </div>

      {/* Validation Mismatch Notice (Descriptive, non-blocking) */}
      {isDurationSumMismatch && (
        <div className="mt-2 text-left bg-amber-950/30 border border-amber-500/30 p-2 rounded-lg text-[10.5px] text-amber-300/90 font-mono">
          ⚠️ <strong>Nota di Convalida:</strong> La somma di Durata Apertura ({standardDaysOpenDuration}gg) + Durata Check-out ({standardDaysCtaDuration}gg) = {standardDaysOpenDuration + standardDaysCtaDuration}gg differisce dal Trigger Apertura ({standardDaysTriggerLimit}gg). La finestra CTA scatterà per N ≤ {ctaThreshold}gg.
        </div>
      )}

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
            Aggiornato: {new Date(standardProtectionResult.dateUpdated).toLocaleString('it-IT')}
          </span>
        </div>
      )}

      {/* Production Double Confirmation Modal */}
      {showProdModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-red-600/60 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 animate-bounce" />
              <h3 className="font-black text-white text-sm uppercase tracking-wider">
                CONFERMA MODALITÀ PRODUZIONE
              </h3>
            </div>

            <p className="text-stone-300 text-xs leading-relaxed">
              ⚠️ <strong>ATTENZIONE:</strong> Stai per attivare la modalità <strong>PRODUZIONE REAL TIME</strong> per la Protezione Tariffe Standard 7d/14d.
              <br /><br />
              Le modifiche di Stop-Sell e Close-to-Arrival verranno inviate <strong>realmente a tutte le 18 camere fisiche del resort su Octorate PMS</strong>.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setShowProdModal(false)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={confirmProductionMode}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-950/50"
              >
                Sì, Attiva Produzione Reale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
