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
  ShieldCheck, 
  ArrowRight,
  Eye,
  FlaskConical,
  Activity,
  Layers,
  XCircle
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

  const PERIOD_ROW_STYLES: Record<string, { bg: string; inputBg: string; border: string; badge: string; text: string }> = {
    p1: { bg: 'bg-amber-950/35', inputBg: 'bg-amber-950/70 border-amber-600/60 text-amber-200 focus:border-amber-400 font-extrabold', border: 'border-l-4 border-l-amber-500', badge: 'bg-amber-500/25 text-amber-300 border border-amber-500/50', text: 'text-amber-300' },
    p2: { bg: 'bg-rose-950/35', inputBg: 'bg-rose-950/70 border-rose-600/60 text-rose-200 focus:border-rose-400 font-extrabold', border: 'border-l-4 border-l-rose-500', badge: 'bg-rose-500/25 text-rose-300 border border-rose-500/50', text: 'text-rose-300' },
    p3: { bg: 'bg-purple-950/35', inputBg: 'bg-purple-950/70 border-purple-600/60 text-purple-200 focus:border-purple-400 font-extrabold', border: 'border-l-4 border-l-purple-500', badge: 'bg-purple-500/25 text-purple-300 border border-purple-500/50', text: 'text-purple-300' },
    p4: { bg: 'bg-orange-950/35', inputBg: 'bg-orange-950/70 border-orange-600/60 text-orange-200 focus:border-orange-400 font-extrabold', border: 'border-l-4 border-l-orange-500', badge: 'bg-orange-500/25 text-orange-300 border border-orange-500/50', text: 'text-orange-300' },
    p5: { bg: 'bg-yellow-950/35', inputBg: 'bg-yellow-950/70 border-yellow-600/60 text-yellow-200 focus:border-yellow-400 font-extrabold', border: 'border-l-4 border-l-yellow-500', badge: 'bg-yellow-500/25 text-yellow-300 border border-yellow-500/50', text: 'text-yellow-300' },
    p6: { bg: 'bg-emerald-950/35', inputBg: 'bg-emerald-950/70 border-emerald-600/60 text-emerald-200 focus:border-emerald-400 font-extrabold', border: 'border-l-4 border-l-emerald-500', badge: 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50', text: 'text-emerald-300' },
    p7: { bg: 'bg-teal-950/35', inputBg: 'bg-teal-950/70 border-teal-600/60 text-teal-200 focus:border-teal-400 font-extrabold', border: 'border-l-4 border-l-teal-500', badge: 'bg-teal-500/25 text-teal-300 border border-teal-500/50', text: 'text-teal-300' },
    p8: { bg: 'bg-cyan-950/35', inputBg: 'bg-cyan-950/70 border-cyan-600/60 text-cyan-200 focus:border-cyan-400 font-extrabold', border: 'border-l-4 border-l-cyan-500', badge: 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50', text: 'text-cyan-300' },
    p9: { bg: 'bg-fuchsia-950/35', inputBg: 'bg-fuchsia-950/70 border-fuchsia-600/60 text-fuchsia-200 focus:border-fuchsia-400 font-extrabold', border: 'border-l-4 border-l-fuchsia-500', badge: 'bg-fuchsia-500/25 text-fuchsia-300 border border-fuchsia-500/50', text: 'text-fuchsia-300' }
  };

  const getRowStyle = (periodId: string, idx: number) => {
    if (PERIOD_ROW_STYLES[periodId]) return PERIOD_ROW_STYLES[periodId];
    const keys = Object.keys(PERIOD_ROW_STYLES);
    return PERIOD_ROW_STYLES[keys[idx % keys.length]];
  };

  const getRoomHeaderLines = (mr: any) => {
    if (mr.line1 && mr.line2) return { line1: mr.line1, line2: mr.line2 };
    const name = mr.roomName || mr.shortName || '';
    if (name.includes('Fake Bungalow 1')) return { line1: 'Fake Bung.', line2: '1 (Test)' };
    if (name.includes('Fake Bungalow 2')) return { line1: 'Fake Bung.', line2: '2 (Test)' };
    if (name.includes('Jungle Villa Left')) return { line1: 'Jungle Villa', line2: 'Left' };
    if (name.includes('Jungle Villa Right')) return { line1: 'Jungle Villa', line2: 'Right' };
    if (name.includes('Jungle Villa')) return { line1: 'Jungle', line2: 'Villa' };
    if (name.includes('Peace')) return { line1: 'Peace & Love', line2: 'Villa' };
    if (name.includes('Penthouse')) return { line1: 'Penthouse', line2: 'Villa' };
    if (name.includes('Yellow')) return { line1: 'Yellow', line2: 'Bungalow' };
    if (name.includes('Red')) return { line1: 'Red', line2: 'Bungalow' };
    if (name.includes('Green')) return { line1: 'Green', line2: 'Bungalow' };
    if (name.includes('Camel')) return { line1: 'Camel Tent', line2: 'Bungalow' };
    if (name.includes('Lagoon')) return { line1: 'Lagoon Tent', line2: 'Bungalow' };
    if (name.includes('Internal')) return { line1: 'Internal', line2: 'Room' };
    if (name.includes('Room 1')) return { line1: 'Hub Room', line2: '1' };
    if (name.includes('Room 2')) return { line1: 'Hub Room', line2: '2' };
    if (name.includes('Room 3')) return { line1: 'Hub Room', line2: '3' };
    if (name.includes('Room 4')) return { line1: 'Hub Room', line2: '4' };
    if (name.includes('Room 5')) return { line1: 'Hub Room', line2: '5' };
    if (name.includes('Lodge 1')) return { line1: 'Lodge 1', line2: 'Hub' };
    if (name.includes('Lodge 2')) return { line1: 'Lodge 2', line2: 'Hub' };
    return { line1: name, line2: '' };
  };

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

  const handleSyncPricesTest = () => {
    if (!confirmingTestSync) {
      setConfirmingTestSync(true);
      setTimeout(() => setConfirmingTestSync(false), 3000);
      return;
    }
    setConfirmingTestSync(false);
    syncAllPeriodsToOctorate({ testOnly: true });
  };

  const handleSyncPricesProd = () => {
    setShowProdWarningModal(true);
  };

  const displayedMotherRates = filterTestOnly
    ? motherRates.filter((mr) => FAKE_BUNGALOW_IDS.includes(mr.motherId))
    : motherRates;

  return (
    <div className="space-y-6">
      {/* Top Banner Header: Glassmorphism */}
      <div className="bg-stone-900/90 border border-stone-800 backdrop-blur-xl rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-950 border border-sky-500/30 rounded-2xl text-sky-400 shadow-inner flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Gestione Stagionale Tariffe
                </h2>
                <p className="text-stone-400 text-xs font-medium">
                  Matrice Excel interattiva: 18 Tariffe Madre + 2 Fake Bungalow Test, periodi dinamici e scrittura bulk Octorate.
                </p>
              </div>
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

            {/* 4. SYNC PREZZI TEST */}
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
                {confirmingTestSync ? 'CONFERMI SYNC TEST?' : 'SYNC PREZZI TEST'}
              </span>
            </button>

            {/* 5. SYNC PREZZI PRODUZIONE */}
            <button
              type="button"
              onClick={handleSyncPricesProd}
              disabled={syncingPeriodId !== null || syncAllRunning}
              className="py-2 px-3.5 bg-red-600 hover:bg-red-500 text-white border border-red-400 shadow-red-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50 shrink-0"
              title="⚠️ ATTENZIONE: Sincronizza tutti i prezzi sulle tariffe madre reali in PRODUZIONE!"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-300" />
              <span>SYNC PREZZI PRODUZIONE</span>
            </button>

            {/* 6. Reset Defaults (PER ULTIMO) */}
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

      {/* Main Matrix Table Container */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-2xl overflow-hidden space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              {activeViewTab === 'editor' ? 'Matrice Prezzi Madre · Modifica Interattiva' : 'Confronto Prezzi Locali vs Octorate Live'}
            </h3>
          </div>
          <div className="text-xs text-stone-400 font-medium">
            {periods.length} Periodi Stagionali · {displayedMotherRates.length} Tariffe Visualizzate
          </div>
        </div>

        {/* Table Wrapper with horizontal scrolling */}
        <div className="overflow-x-auto rounded-2xl border border-stone-800/80 shadow-inner bg-stone-950/60">
          <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead>
              <tr className="bg-stone-900 border-b border-stone-800">
                <th className="p-3 text-xs font-black text-stone-300 uppercase tracking-wider w-[260px] min-w-[260px] sticky left-0 bg-stone-900 z-20 shadow-md">
                  Periodo & Date (Inizio ➔ Fine)
                </th>

                {displayedMotherRates.map((mr) => {
                  const headerLines = getRoomHeaderLines(mr);
                  const isFake = FAKE_BUNGALOW_IDS.includes(mr.motherId);
                  return (
                    <th 
                      key={mr.motherId} 
                      className={`p-2.5 text-center text-xs font-black uppercase tracking-tight min-w-[85px] border-l ${
                        isFake 
                          ? 'bg-amber-950/40 text-amber-300 border-amber-700/50' 
                          : 'text-stone-300 border-stone-800'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center leading-tight">
                        {isFake && (
                          <span className="text-[9px] bg-amber-500 text-stone-950 font-black px-1.5 py-0.2 rounded-md mb-0.5 tracking-wider">
                            TEST
                          </span>
                        )}
                        <span className="font-extrabold">{headerLines.line1}</span>
                        {headerLines.line2 && <span className="text-[10px] text-stone-400 font-semibold">{headerLines.line2}</span>}
                        <span className="text-[9px] font-mono text-stone-500 font-normal">#{mr.motherId}</span>
                      </div>
                    </th>
                  );
                })}

                <th className="p-3 text-center text-xs font-black text-stone-300 uppercase tracking-wider w-[120px] min-w-[120px] border-l border-stone-800">
                  Azioni
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-800/60">
              {periods.map((period, idx) => {
                const style = getRowStyle(period.id, idx);
                const periodPrices = pricesMatrix[period.id] || {};
                const isCurrentSyncing = syncingPeriodId === period.id;

                return (
                  <tr key={period.id} className={`${style.bg} hover:bg-stone-800/40 transition-colors ${style.border}`}>
                    <td className="p-3 sticky left-0 bg-stone-900/95 backdrop-blur-md z-10 shadow-md">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <input
                            type="text"
                            value={period.name}
                            onChange={(e) => updatePeriodDate(period.id, 'name', e.target.value)}
                            className="bg-transparent text-white font-black text-xs px-1 py-0.5 rounded hover:bg-stone-800/60 focus:bg-stone-800 focus:outline-none w-full"
                          />
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${style.badge}`}>
                            {period.label || 'Stagione'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs">
                          <input
                            type="text"
                            value={formatDisplayDate(period.dateFrom)}
                            onChange={(e) => updatePeriodDate(period.id, 'dateFrom', parseDisplayDateToISO(e.target.value))}
                            placeholder="GG/MM/AAAA"
                            className={`w-24 text-center px-1.5 py-1 rounded-xl text-xs font-bold bg-stone-950/80 border border-stone-700 text-white focus:outline-none focus:border-sky-500`}
                          />
                          <ArrowRight className="w-3 h-3 text-stone-500 shrink-0" />
                          <input
                            type="text"
                            value={formatDisplayDate(period.dateTo)}
                            onChange={(e) => updatePeriodDate(period.id, 'dateTo', parseDisplayDateToISO(e.target.value))}
                            placeholder="GG/MM/AAAA"
                            className={`w-24 text-center px-1.5 py-1 rounded-xl text-xs font-bold bg-stone-950/80 border border-stone-700 text-white focus:outline-none focus:border-sky-500`}
                          />
                        </div>
                      </div>
                    </td>

                    {displayedMotherRates.map((mr) => {
                      const currentPrice = periodPrices[mr.motherId] || 0;
                      const livePrice = getLiveOctoratePriceForPeriod(mr.motherId, period.dateFrom, period.dateTo);
                      const hasDiscrepancy = livePrice !== null && livePrice !== currentPrice;
                      const isFake = FAKE_BUNGALOW_IDS.includes(mr.motherId);

                      return (
                        <td 
                          key={mr.motherId} 
                          className={`p-2 text-center border-l ${
                            isFake ? 'border-amber-700/30 bg-amber-950/20' : 'border-stone-800/60'
                          } ${
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
                              className={`w-full text-center py-1.5 px-1 rounded-xl text-xs font-black transition-all bg-stone-950/80 border border-stone-700 text-white focus:outline-none focus:border-sky-400 ${
                                isFake ? 'text-amber-300 font-extrabold border-amber-600/50' : ''
                              }`}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-xs">
                              <span className="font-black text-white">{currentPrice} ฿</span>
                              {livePrice !== null ? (
                                <span className={`text-[10px] font-bold ${hasDiscrepancy ? 'text-rose-400' : 'text-emerald-400'}`}>
                                  Live: {livePrice} ฿
                                </span>
                              ) : (
                                <span className="text-[10px] text-stone-500 font-mono">-</span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    <td className="p-2 text-center border-l border-stone-800/60">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => addPeriodAt(idx)}
                          className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-all cursor-pointer"
                          title="Inserisci nuova riga periodo sotto questa"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => syncPeriodToOctorate(period.id, { testOnly: testMode })}
                          disabled={isCurrentSyncing || syncAllRunning}
                          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                            isCurrentSyncing
                              ? 'bg-sky-600 text-white animate-spin'
                              : testMode
                              ? 'bg-emerald-700 hover:bg-emerald-600 text-white shadow'
                              : 'bg-red-700 hover:bg-red-600 text-white shadow'
                          }`}
                          title={`Sincronizza solo questo periodo su Octorate (${testMode ? 'Test' : 'Produzione'})`}
                        >
                          {isCurrentSyncing ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Zap className="w-3.5 h-3.5 text-yellow-300" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => removePeriod(period.id)}
                          disabled={periods.length <= 1}
                          className="p-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-400 hover:text-rose-200 transition-all cursor-pointer disabled:opacity-40"
                          title="Elimina questo periodo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
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
