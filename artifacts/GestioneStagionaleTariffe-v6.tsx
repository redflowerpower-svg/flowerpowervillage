import React, { useState } from 'react';
import { formatDisplayDate, parseDisplayDateToISO } from '../../../lib/dateUtils';
import { 
  useSeasonalRateStore, 
  MOTHER_RATES, 
  DEFAULT_PERIODS, 
  DEFAULT_PRICES_MATRIX,
  FAKE_BUNGALOW_IDS
} from '../store/useSeasonalRateStore';
import { useResortAdminStore } from '../store/useResortAdminStore';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  Zap, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Eye,
  FlaskConical,
  Layers
} from 'lucide-react';

export const GestioneStagionaleTariffe: React.FC = () => {
  const store = useSeasonalRateStore();
  const rawPeriods = store?.periods;
  const rawMotherRates = store?.motherRates;
  const rawPricesMatrix = store?.pricesMatrix;

  const periods = (Array.isArray(rawPeriods) && rawPeriods.length > 0) ? rawPeriods : DEFAULT_PERIODS;
  const motherRates = (Array.isArray(rawMotherRates) && rawMotherRates.length > 0) ? rawMotherRates : MOTHER_RATES;
  const pricesMatrix = (rawPricesMatrix && typeof rawPricesMatrix === 'object') ? rawPricesMatrix : DEFAULT_PRICES_MATRIX;

  const testMode = store?.testMode ?? true;
  const setTestMode = store?.setTestMode || (() => {});
  const syncingPeriodId = store?.syncingPeriodId ?? null;
  const syncAllRunning = store?.syncAllRunning ?? false;
  const lastSyncMessage = store?.lastSyncMessage ?? null;
  const lastSyncStatus = store?.lastSyncStatus ?? 'idle';

  const addPeriodAt = store?.addPeriodAt || (() => {});
  const removePeriod = store?.removePeriod || (() => {});
  const updatePeriodDate = store?.updatePeriodDate || (() => {});
  const updatePrice = store?.updatePrice || (() => {});
  const resetDefaultExcelStore = store?.resetDefaultExcelStore || (() => {});
  const syncPeriodToOctorate = store?.syncPeriodToOctorate || (async () => false);
  const syncAllPeriodsToOctorate = store?.syncAllPeriodsToOctorate || (async () => false);

  const resortAdminStore = useResortAdminStore();
  const rawOctorateGridItems = resortAdminStore?.rawOctorateGridItems || [];
  
  const [activeViewTab, setActiveViewTab] = useState<'editor' | 'comparison'>('editor');
  const [isComparing, setIsComparing] = useState(false);
  const [filterTestOnly, setFilterTestOnly] = useState(false);
  const [confirmingTestSync, setConfirmingTestSync] = useState(false);
  const [showProdWarningModal, setShowProdWarningModal] = useState(false);

  // Palette cromatica armonica: Gradienti di rosso per High Season (Level 5 = rosso scuro) e Blu per Low Season
  const PERIOD_COL_STYLES: Record<string, { bg: string; headerBg: string; border: string; badge: string; text: string }> = {
    // High Season Level 1 (Rosso/Albicocca tenue)
    p1: { bg: 'bg-yellow-950/20', headerBg: 'bg-yellow-950/50 border-b-2 border-b-yellow-500', border: 'border-l border-stone-800', badge: 'bg-yellow-500/25 text-yellow-300 border border-yellow-500/50', text: 'text-yellow-300' },
    // High Season Level 2 (Rosato/Ambra caldo)
    p2: { bg: 'bg-amber-950/25', headerBg: 'bg-amber-950/60 border-b-2 border-b-amber-500', border: 'border-l border-stone-800', badge: 'bg-amber-500/25 text-amber-300 border border-amber-500/50', text: 'text-amber-300' },
    // High Season Level 3 (Corallo/Rosso chiaro)
    p3: { bg: 'bg-orange-950/35', headerBg: 'bg-orange-950/70 border-b-2 border-b-orange-500', border: 'border-l border-stone-800', badge: 'bg-orange-500/25 text-orange-300 border border-orange-500/50', text: 'text-orange-300' },
    // High Season Level 4 (Rosso vivo / Vermiglio)
    p4: { bg: 'bg-rose-950/45', headerBg: 'bg-rose-950/80 border-b-2 border-b-rose-500', border: 'border-l border-stone-800', badge: 'bg-rose-500/25 text-rose-300 border border-rose-500/50', text: 'text-rose-300' },
    // High Season Level 5 (ROSSO SCURO INTENSO / RUBINO)
    p5: { bg: 'bg-red-950/70', headerBg: 'bg-red-950 border-b-2 border-b-red-600', border: 'border-l border-red-900/60', badge: 'bg-red-600/30 text-red-200 border border-red-500/60 font-extrabold', text: 'text-red-200' },
    // High Season Level 4 (Rosso vivo / Vermiglio)
    p6: { bg: 'bg-rose-950/45', headerBg: 'bg-rose-950/80 border-b-2 border-b-rose-500', border: 'border-l border-stone-800', badge: 'bg-rose-500/25 text-rose-300 border border-rose-500/50', text: 'text-rose-300' },
    // High Season Level 3 (Corallo/Rosso chiaro)
    p7: { bg: 'bg-orange-950/35', headerBg: 'bg-orange-950/70 border-b-2 border-b-orange-500', border: 'border-l border-stone-800', badge: 'bg-orange-500/25 text-orange-300 border border-orange-500/50', text: 'text-orange-300' },
    // Low Season Level 1 (Blu Oceano / Ciano tenue)
    p8: { bg: 'bg-sky-950/30', headerBg: 'bg-sky-950/60 border-b-2 border-b-sky-400', border: 'border-l border-stone-800', badge: 'bg-sky-500/25 text-sky-300 border border-sky-500/50', text: 'text-sky-300' },
    // Low Season Level 2 (Blu Notte / Deep Cobalt Blue)
    p9: { bg: 'bg-blue-950/50', headerBg: 'bg-blue-950/80 border-b-2 border-b-blue-500', border: 'border-l border-stone-800', badge: 'bg-blue-500/25 text-blue-300 border border-blue-500/50', text: 'text-blue-300' }
  };

  const getColStyle = (periodId: string, idx: number) => {
    if (PERIOD_COL_STYLES[periodId]) return PERIOD_COL_STYLES[periodId];
    const keys = Object.keys(PERIOD_COL_STYLES);
    return PERIOD_COL_STYLES[keys[idx % keys.length]];
  };

  // Helper per estrarre il prezzo medio reale caricato da Octorate
  const getLiveOctoratePriceForPeriod = (motherId: number, dateFrom: string, dateTo: string): number | null => {
    if (!rawOctorateGridItems || rawOctorateGridItems.length === 0) return null;

    const targetMotherIdNum = Number(motherId);
    const matchedPrices: number[] = [];

    for (const item of rawOctorateGridItems) {
      const itemIdNum = Number(item.motherRateId || item.ratePlanId || item.id || item.room?.id || 0);

      if (itemIdNum === targetMotherIdNum) {
        if (Array.isArray(item.days)) {
          for (const day of item.days) {
            const dStr = String(day.date || day.dateStr || '').substring(0, 10);
            const p = Number(day.price || day.value || day.amount || 0);
            if (dStr >= dateFrom && dStr <= dateTo && p > 0 && p < 10000) {
              matchedPrices.push(p);
            }
          }
        } else if (item.dateStr || item.date) {
          const dStr = String(item.dateStr || item.date || '').substring(0, 10);
          const p = Number(item.price || item.finalPrice || item.motherPrice || 0);
          if (dStr >= dateFrom && dStr <= dateTo && p > 0 && p < 10000) {
            matchedPrices.push(p);
          }
        }
      }
    }

    if (matchedPrices.length === 0) return null;
    const sum = matchedPrices.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / matchedPrices.length);
  };

  // Handler Sincronizzazione Test con doppio tocco
  const handleSyncPricesTest = () => {
    if (!confirmingTestSync) {
      setConfirmingTestSync(true);
      setTimeout(() => setConfirmingTestSync(false), 3000);
      return;
    }
    setConfirmingTestSync(false);
    syncAllPeriodsToOctorate({ testOnly: true });
  };

  // Handler Sincronizzazione Produzione con modale
  const handleSyncPricesProd = () => {
    setShowProdWarningModal(true);
  };

  // Filtraggio dinamico alloggi
  const displayedMotherRates = filterTestOnly
    ? motherRates.filter((mr) => FAKE_BUNGALOW_IDS.includes(mr.motherId))
    : motherRates;

  return (
    <div className="space-y-6">
      {/* Top Banner Header: Glassmorphism */}
      <div className="bg-stone-900/90 border border-stone-800 backdrop-blur-xl rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-2.5 bg-sky-950 border border-sky-500/30 rounded-2xl text-sky-400 shadow-inner flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight whitespace-nowrap">
                Prezzi Alloggi
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap xl:flex-nowrap">
            {/* 1. Tab Toggle: Editor vs Live */}
            <div className="bg-stone-950 p-1 rounded-2xl border border-stone-800 flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setActiveViewTab('editor')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeViewTab === 'editor' ? 'bg-sky-600 text-white shadow-md' : 'text-stone-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Listino Madre (Editor)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab('comparison')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeViewTab === 'comparison' ? 'bg-emerald-600 text-white shadow-md' : 'text-stone-400 hover:text-white'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Confronto Live Octorate</span>
              </button>
            </div>

            {/* 2. Filtro Fake Bungalow / Tutti */}
            <button
              type="button"
              onClick={() => setFilterTestOnly(!filterTestOnly)}
              className={`py-2 px-3 rounded-2xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 border shadow whitespace-nowrap shrink-0 ${
                filterTestOnly
                  ? 'bg-amber-500 text-stone-950 border-amber-300 font-extrabold shadow-amber-950/40'
                  : 'bg-stone-800 hover:bg-stone-750 text-stone-300 border-stone-700'
              }`}
              title="Filtra la vista per mostrare solo i Fake Bungalow di test o tutti gli alloggi"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>{filterTestOnly ? 'Solo Fake (Test)' : 'Tutti gli Alloggi'}</span>
            </button>

            {/* 3. Evidenzia Discrepanze */}
            <button
              type="button"
              onClick={() => setIsComparing(!isComparing)}
              className={`py-2 px-3 rounded-2xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 border shadow whitespace-nowrap shrink-0 ${
                isComparing
                  ? 'bg-yellow-400 text-stone-950 border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-pulse'
                  : 'bg-stone-800 hover:bg-stone-750 text-amber-300 border-amber-600/40'
              }`}
              title="Evidenzia con cerchiatura fluorescente le celle dove il prezzo locale differisce da Octorate"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isComparing ? 'Discrepanze Attive' : 'Evidenzia Discrepanze'}</span>
            </button>

            {/* 4. SYNC TEST */}
            <button
              type="button"
              onClick={handleSyncPricesTest}
              disabled={syncingPeriodId !== null || syncAllRunning}
              className={`py-2 px-3.5 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50 border shrink-0 ${
                confirmingTestSync
                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 border-amber-300 ring-2 ring-amber-300 animate-pulse font-extrabold'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-emerald-950'
              }`}
              title="Sincronizza tutti i prezzi sui Fake Bungalow 1 e 2 di Test"
            >
              <Zap className={`w-3.5 h-3.5 ${confirmingTestSync ? 'text-stone-950' : 'text-yellow-300'}`} />
              <span>
                {confirmingTestSync ? 'CONFERMI SYNC TEST?' : 'SYNC TEST'}
              </span>
            </button>

            {/* 5. SYNC PRODUZIONE */}
            <button
              type="button"
              onClick={handleSyncPricesProd}
              disabled={syncingPeriodId !== null || syncAllRunning}
              className="py-2 px-3.5 bg-red-600 hover:bg-red-500 text-white border border-red-400 shadow-red-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50 shrink-0"
              title="⚠️ ATTENZIONE: Sincronizza tutti i prezzi sulle tariffe madre reali in PRODUZIONE!"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-300" />
              <span>SYNC PRODUZIONE</span>
            </button>

            {/* 6. Reset Defaults */}
            <button
              type="button"
              onClick={resetDefaultExcelStore}
              className="py-2 px-3 bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-700 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow whitespace-nowrap shrink-0"
              title="Ripristina la matrice prezzi e i periodi predefiniti"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Banner Scrittura Sicuro / Scudo di Protezione */}
        <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between gap-3 border shadow-lg ${
          testMode
            ? 'bg-amber-950/70 border-amber-500/50 text-amber-200'
            : 'bg-red-950/70 border-red-500/50 text-red-200'
        }`}>
          <div className="flex items-center gap-3">
            {testMode ? (
              <FlaskConical className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <div>
              <span className="font-extrabold uppercase tracking-wide mr-2">
                {testMode ? '🧪 AMBIENTE DI TEST ATTIVO:' : '🔴 MODALITÀ PRODUZIONE ATTIVA:'}
              </span>
              <span className="font-normal">
                {testMode
                  ? 'Le sincronizzazioni colpiranno ESCLUSIVAMENTE Fake Bungalow 1 (649669) e Fake Bungalow 2 (921799). Nessun alloggio reale o tariffa OTA subirà variazioni.'
                  : 'Le sincronizzazioni scriveranno su TUTTI i Bungalow e le Ville reali su Octorate PMS e modificheranno i prezzi a cascata.'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (testMode) {
                setShowProdWarningModal(true);
              } else {
                setTestMode(true);
              }
            }}
            className={`px-3 py-1.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
              testMode
                ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-600'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
            }`}
          >
            {testMode ? 'Attiva Produzione ⚠️' : 'Torna in Test 🧪'}
          </button>
        </div>

        {/* Toast Notifica Stato */}
        {lastSyncMessage && (
          <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-3 border shadow-lg ${
            lastSyncStatus === 'success'
              ? 'bg-emerald-950/80 border-emerald-600/60 text-emerald-200'
              : lastSyncStatus === 'error'
              ? 'bg-rose-950/80 border-rose-600/60 text-rose-200'
              : 'bg-sky-950/80 border-sky-600/60 text-sky-200'
          }`}>
            {lastSyncStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {lastSyncStatus === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
            {lastSyncStatus === 'idle' && <RefreshCw className="w-4 h-4 text-sky-400 shrink-0 animate-spin" />}
            <span>{lastSyncMessage}</span>
          </div>
        )}
      </div>

      {/* Main Inverted Matrix Table: Alloggi sulle Righe, Periodi sulle Colonne */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-2xl overflow-hidden space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              {activeViewTab === 'editor' ? 'Matrice Compatta · Alloggi sulle Righe & Periodi sulle Colonne' : 'Confronto Prezzi Locali vs Octorate Live'}
            </h3>
          </div>
          <div className="text-xs text-stone-400 font-medium">
            {displayedMotherRates.length} Alloggi (Righe) · {periods.length} Periodi Stagionali (Colonne)
          </div>
        </div>

        {/* Table Wrapper - Zero Horizontal Scrollbar */}
        <div className="overflow-x-auto rounded-2xl border border-stone-800/80 shadow-inner bg-stone-950/60 no-scrollbar">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-stone-900 border-b border-stone-800">
                {/* Header Colonna Fissa: Alloggio */}
                <th className="p-2 text-xs font-black text-stone-300 uppercase tracking-wider w-[150px] min-w-[150px] max-w-[150px] sticky left-0 bg-stone-900 z-20 shadow-md">
                  Alloggio
                </th>

                {/* Headers Periodi Stagionali sulle Colonne */}
                {periods.map((period, pIdx) => {
                  const style = getColStyle(period.id, pIdx);
                  const isCurrentSyncing = syncingPeriodId === period.id;

                  return (
                    <th 
                      key={period.id} 
                      className={`p-1.5 text-center text-xs font-black uppercase tracking-tight min-w-[105px] max-w-[115px] ${style.headerBg} ${style.border}`}
                    >
                      <div className="space-y-1.5 flex flex-col items-center w-full">
                        {/* Nome Periodo Editabile */}
                        <div className="w-full">
                          <input
                            type="text"
                            value={period.name}
                            onChange={(e) => updatePeriodDate(period.id, 'name', e.target.value)}
                            className="bg-transparent text-white font-black text-[11px] px-1 py-0.5 rounded hover:bg-stone-800/60 focus:bg-stone-800 focus:outline-none w-full text-center truncate"
                            title={period.name}
                          />
                        </div>

                        {/* Date Inizio / Fine con identica larghezza al 100% */}
                        <div className="w-full space-y-1 bg-stone-950/80 p-1 rounded-xl border border-stone-800">
                          <input
                            type="date"
                            value={period.dateFrom}
                            onChange={(e) => updatePeriodDate(period.id, 'dateFrom', e.target.value)}
                            title="Data di Inizio"
                            className="bg-stone-900 border border-stone-700/80 text-sky-200 font-bold text-[10px] rounded px-1 py-0.5 focus:outline-none focus:border-sky-400 w-full text-center cursor-pointer [color-scheme:dark]"
                          />
                          <input
                            type="date"
                            value={period.dateTo}
                            onChange={(e) => updatePeriodDate(period.id, 'dateTo', e.target.value)}
                            title="Data di Fine"
                            className="bg-stone-900 border border-stone-700/80 text-sky-200 font-bold text-[10px] rounded px-1 py-0.5 focus:outline-none focus:border-sky-400 w-full text-center cursor-pointer [color-scheme:dark]"
                          />
                        </div>

                        {/* Azioni Sincronizza / Elimina Periodo Centrate */}
                        <div className="flex items-center justify-center gap-1.5 w-full pt-1 border-t border-stone-800/50">
                          {/* Sync Singolo Periodo */}
                          <button
                            type="button"
                            onClick={() => syncPeriodToOctorate(period.id, { testOnly: testMode })}
                            disabled={isCurrentSyncing || syncAllRunning}
                            className={`p-1 rounded-lg transition-all cursor-pointer ${
                              isCurrentSyncing
                                ? 'bg-sky-600 text-white animate-spin'
                                : testMode
                                ? 'bg-emerald-700 hover:bg-emerald-600 text-white shadow'
                                : 'bg-red-700 hover:bg-red-600 text-white shadow'
                            }`}
                            title={`Sincronizza ${period.name} su Octorate (${testMode ? 'Test' : 'Produzione'})`}
                          >
                            {isCurrentSyncing ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Zap className="w-3.5 h-3.5 text-yellow-300" />
                            )}
                          </button>

                          {/* Elimina Periodo */}
                          <button
                            type="button"
                            onClick={() => removePeriod(period.id)}
                            disabled={periods.length <= 1}
                            className="p-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-400 hover:text-rose-200 transition-all cursor-pointer disabled:opacity-40"
                            title="Elimina questo periodo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </th>
                  );
                })}

                {/* Colonna per aggiungere nuovo periodo (+) */}
                <th className="p-1 text-center text-xs font-black text-stone-400 uppercase w-[34px] min-w-[34px] max-w-[34px] border-l border-stone-800">
                  <button
                    type="button"
                    onClick={() => addPeriodAt(periods.length - 1)}
                    className="p-1 rounded-lg bg-stone-800 hover:bg-sky-600 text-stone-300 hover:text-white transition-all cursor-pointer shadow"
                    title="Aggiungi nuovo periodo stagionale"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-800/60">
              {displayedMotherRates.map((mr) => {
                const isFake = FAKE_BUNGALOW_IDS.includes(mr.motherId);

                return (
                  <tr 
                    key={mr.motherId} 
                    className={`hover:bg-stone-800/40 transition-colors ${
                      isFake ? 'bg-amber-950/25 border-l-4 border-l-amber-500' : ''
                    }`}
                  >
                    {/* Alloggio Sticky Left */}
                    <td className="p-2 sticky left-0 bg-stone-900/95 backdrop-blur-md z-10 shadow-md w-[150px] min-w-[150px] max-w-[150px]">
                      <div>
                        <div className="font-extrabold text-xs text-white truncate">
                          {mr.roomName}
                        </div>
                        <div className="text-[9.5px] text-stone-400 font-medium truncate">
                          {mr.category} · <span className="font-mono text-stone-500">#{mr.motherId}</span>
                        </div>
                      </div>
                    </td>

                    {/* Prezzi per ciascun Periodo */}
                    {periods.map((period, pIdx) => {
                      const periodPrices = pricesMatrix[period.id] || {};
                      const currentPrice = periodPrices[mr.motherId] || 0;
                      const livePrice = getLiveOctoratePriceForPeriod(mr.motherId, period.dateFrom, period.dateTo);
                      const hasDiscrepancy = livePrice !== null && livePrice !== currentPrice;
                      const style = getColStyle(period.id, pIdx);

                      return (
                        <td 
                          key={period.id} 
                          className={`p-1 text-center ${style.border} ${style.bg} ${
                            isComparing && hasDiscrepancy 
                              ? 'ring-2 ring-yellow-400 bg-yellow-950/50 animate-pulse' 
                              : ''
                          }`}
                        >
                          {activeViewTab === 'editor' ? (
                            <input
                              type="number"
                              value={currentPrice || ''}
                              onChange={(e) => updatePrice(period.id, mr.motherId, Number(e.target.value))}
                              className={`w-full text-center py-1 px-0.5 rounded-lg text-xs font-black transition-all bg-stone-950/80 border border-stone-700 text-white focus:outline-none focus:border-sky-400 ${
                                isFake ? 'text-amber-300 font-extrabold border-amber-600/50' : ''
                              }`}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-xs">
                              <span className="font-black text-white">{currentPrice} ฿</span>
                              {livePrice !== null ? (
                                <span className={`text-[9.5px] font-bold ${hasDiscrepancy ? 'text-rose-400' : 'text-emerald-400'}`}>
                                  Live: {livePrice} ฿
                                </span>
                              ) : (
                                <span className="text-[9.5px] text-stone-500 font-mono">-</span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {/* Cella vuota per colonna (+) */}
                    <td className="p-1 border-l border-stone-800/60 bg-stone-950/30 w-[34px] min-w-[34px] max-w-[34px]" />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal di Allerta Produzione Reale */}
      {showProdWarningModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-stone-900 border-2 border-red-600/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-2xl">
                <AlertTriangle className="w-8 h-8 text-red-400 animate-bounce" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  ATTENZIONE: PRODUZIONE REALE
                </h3>
                <p className="text-xs text-red-400 font-bold">
                  Scrittura Diretta sui Listini Ufficiali Octorate
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-stone-300 bg-stone-950/70 p-4 rounded-2xl border border-stone-800 leading-relaxed">
              <p>
                Stai per attivare la modalità o sincronizzare i prezzi sulle <strong className="text-white">Tariffe Madre di Produzione Reale</strong> (Tutti i 18 alloggi e bungalow).
              </p>
              <p>
                Octorate calcolerà ed aggiornerà istantaneamente i prezzi a cascata su tutti i canali OTA (<strong className="text-white">Booking.com, Agoda, Airbnb, Expedia</strong>) e sul Booking Engine Ufficiale.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowProdWarningModal(false)}
                className="px-4 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border border-stone-700"
              >
                Annulla (Resta in Test)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTestMode(false);
                  setShowProdWarningModal(false);
                  syncAllPeriodsToOctorate({ testOnly: false });
                }}
                className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl hover:shadow-red-600/50 flex items-center gap-2 cursor-pointer border border-red-400 animate-pulse"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confermo, Sincronizza in Produzione</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestioneStagionaleTariffe;
