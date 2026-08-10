import React, { useState } from 'react';
import { formatDisplayDate, parseDisplayDateToISO } from '../../../lib/dateUtils';
import { useSeasonalRateStore, MOTHER_RATES, DEFAULT_PERIODS, DEFAULT_PRICES_MATRIX } from '../store/useSeasonalRateStore';
import { useResortAdminStore } from '../store/useResortAdminStore';
import { 
  Palmtree, 
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
  Sparkles,
  FileSpreadsheet,
  Eye
} from 'lucide-react';

export const GestioneStagionaleTariffe: React.FC = () => {
  const store = useSeasonalRateStore();
  const rawPeriods = store?.periods;
  const rawMotherRates = store?.motherRates;
  const rawPricesMatrix = store?.pricesMatrix;

  const periods = (Array.isArray(rawPeriods) && rawPeriods.length > 0) ? rawPeriods : DEFAULT_PERIODS;
  const motherRates = (Array.isArray(rawMotherRates) && rawMotherRates.length > 0) ? rawMotherRates : MOTHER_RATES;
  const pricesMatrix = (rawPricesMatrix && typeof rawPricesMatrix === 'object') ? rawPricesMatrix : DEFAULT_PRICES_MATRIX;

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

  // Mappa di stili cromatici distinti per ogni riga periodo (sfondo riga, bordi ed input)
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

  // Helper infallibile per ricavare i titoli alloggio su 2 righe
  const getRoomHeaderLines = (mr: any) => {
    if (mr.line1 && mr.line2) return { line1: mr.line1, line2: mr.line2 };
    const name = mr.roomName || mr.shortName || '';
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

  // Auto-download iniziale dei dati live se lo store amministrativo non ha ancora caricato la grid
  React.useEffect(() => {
    if (!rawOctorateGridItems || rawOctorateGridItems.length === 0) {
      import('../../../booking/lib/octorate')
        .then(({ fetchOctorateGridData }) => {
          fetchOctorateGridData('2026-11-01', '2027-10-31').catch((e) => console.warn('[GestioneStagionaleTariffe] Auto grid fetch error:', e));
        })
        .catch((err) => console.warn('[GestioneStagionaleTariffe] Import error:', err));
    }
  }, [rawOctorateGridItems?.length]);

  // Helper per estrarre il prezzo medio reale caricato da Octorate per un motherId ed una fascia date
  const getLiveOctoratePriceForPeriod = (motherId: number, dateFrom: string, dateTo: string): number | null => {
    if (!rawOctorateGridItems || rawOctorateGridItems.length === 0) return null;

    const targetMotherIdNum = Number(motherId);
    const matchedPrices: number[] = [];

    for (const item of rawOctorateGridItems) {
      const itemIdNum = Number(item.motherRateId || item.ratePlanId || item.id || item.room?.id || 0);

      // Match sull'ID della tariffa madre
      if (itemIdNum === targetMotherIdNum) {
        // Formato 1: Array di giorni in item.days
        if (Array.isArray(item.days)) {
          for (const day of item.days) {
            const dStr = String(day.date || day.dateStr || '').substring(0, 10);
            const p = Number(day.price || day.value || day.amount || 0);
            if (dStr >= dateFrom && dStr <= dateTo && p > 0 && p < 10000) {
              matchedPrices.push(p);
            }
          }
        }
        // Formato 2: Singolo oggetto giorno
        else if (item.dateStr || item.date) {
          const dStr = String(item.dateStr || item.date || '').substring(0, 10);
          const p = Number(item.price || item.finalPrice || item.motherPrice || 0);
          if (dStr >= dateFrom && dStr <= dateTo && p > 0 && p < 10000) {
            matchedPrices.push(p);
          }
        }
      }
    }

    if (matchedPrices.length === 0) return null;

    // Calcola il prezzo medio ponderato nel periodo
    const sum = matchedPrices.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / matchedPrices.length);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header: Tropical Glassmorphism */}
      <div className="bg-stone-900/90 border border-stone-800 backdrop-blur-xl rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#002b49] border border-sky-500/30 rounded-2xl text-sky-400 shadow-inner flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Gestione Stagionale Tariffe <span className="text-xs bg-sky-950 text-sky-300 border border-sky-600/50 px-2.5 py-0.5 rounded-full font-mono font-extrabold">Excel Matrix 100%</span>
                </h2>
                <p className="text-stone-400 text-xs font-medium">
                  Matrice Excel interattiva: 18 Tariffe Madre in orizzontale, periodi dinamici in verticale ed inserimento righe con 1-click.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Toggle View Tab: Editor Matrix vs Live Comparison */}
            <div className="bg-stone-950 p-1 rounded-2xl border border-stone-800 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveViewTab('editor')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                  activeViewTab === 'editor'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                📊 Listino Madre (Editor)
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab('comparison')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                  activeViewTab === 'comparison'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                🔍 Confronto Live Octorate
              </button>
            </div>

            {/* Toggle Button for Highlighting Mismatched Cells with Yellow Rings */}
            <button
              type="button"
              onClick={() => setIsComparing(!isComparing)}
              className={`py-2.5 px-4 rounded-2xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-2 border shadow ${
                isComparing
                  ? 'bg-yellow-400 text-stone-950 border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-pulse'
                  : 'bg-stone-800 hover:bg-stone-750 text-amber-300 border-amber-600/40'
              }`}
              title="Evidenzia con cerchiatura giallo fluorescente tutte le celle dove il prezzo locale differisce da Octorate API"
            >
              <Eye className="w-4 h-4" />
              <span>{isComparing ? '🔍 Discrepanze Evidenziate' : '⚖️ Evidenzia Discrepanze'}</span>
            </button>

            <button
              type="button"
              onClick={resetDefaultExcelStore}
              className="py-2.5 px-4 bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-700 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow"
            >
              <RotateCcw className="w-4 h-4 text-stone-400" />
              <span>Reset Excel Default</span>
            </button>

            <button
              type="button"
              onClick={() => syncAllPeriodsToOctorate()}
              disabled={syncAllRunning || syncingPeriodId !== null}
              className="py-2.5 px-5 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-sky-950/50 flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${syncAllRunning ? 'animate-bounce text-amber-300' : 'text-yellow-300'}`} />
              <span>{syncAllRunning ? 'Sincronizzazione Bulk in Corso...' : 'Sincronizza Tutti i Periodi su Octorate'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Status Toast Banner */}
        {lastSyncMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-3 border shadow-lg animate-in fade-in duration-200 ${
              lastSyncStatus === 'success'
                ? 'bg-emerald-950/80 border-emerald-600/60 text-emerald-200'
                : lastSyncStatus === 'error'
                ? 'bg-red-950/80 border-red-700/60 text-red-200'
                : 'bg-sky-950/80 border-sky-600/60 text-sky-200'
            }`}
          >
            {lastSyncStatus === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : lastSyncStatus === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <RefreshCw className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
            )}
            <span>{lastSyncMessage}</span>
          </div>
        )}

        <div className="bg-stone-950/60 border border-stone-850 p-3 rounded-2xl text-[11px] text-stone-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
          <span>
            <strong>Struttura Excel:</strong> I periodi sono disposti in <strong>VERTICALE (righe)</strong> mentre le 18 Tariffe Madre sono in <strong>ORIZZONTALE (colonne azzurre)</strong>. Usa il pulsante ➕ su ciascuna riga per inserire un nuovo periodo nella posizione desiderata.
          </span>
        </div>
      </div>

      {/* TABELLA 1: MATRICE EXCEL LISTINO MADRE (EDITOR) */}
      {activeViewTab === 'editor' && (
        <div className="bg-stone-900/90 border border-stone-800 backdrop-blur-xl rounded-3xl p-5 shadow-2xl space-y-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sky-400 shadow-md shadow-sky-950" />
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight uppercase">
                📊 TABELLA 1: MATRICE LISTINO MADRE (PROGRAMMATO LOCALE)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-sky-300 bg-sky-950/80 border border-sky-800/80 px-3 py-1 rounded-xl">
              {periods.length} Periodi · 18 Tariffe Madre
            </span>
          </div>

          {/* Table Container with Compact Layout fitting 100% Page */}
          <div className="overflow-x-auto custom-scrollbar border border-stone-800 rounded-2xl max-h-[680px]">
            <table className="w-full text-left border-collapse text-[9.5px] font-sans">
              {/* Table Header: Light Blue Excel Style Header for 18 Mother Rates */}
              <thead className="sticky top-0 z-20 bg-[#002b49] text-sky-200 border-b border-sky-800 shadow-md">
                <tr>
                  <th className="py-2.5 px-2 font-black uppercase tracking-wider w-[125px] min-w-[115px] max-w-[130px] sticky left-0 z-30 bg-[#002b49] border-r border-sky-800/80 text-[9.5px]">
                    Periodo / Nome
                  </th>
                  <th className="py-2.5 px-1 text-center font-black uppercase tracking-wider w-[82px] min-w-[78px] max-w-[85px] sticky left-[125px] z-30 bg-[#002b49] border-r border-sky-800/80 text-[9px]">
                    Date From
                  </th>
                  <th className="py-2.5 px-1 text-center font-black uppercase tracking-wider w-[82px] min-w-[78px] max-w-[85px] sticky left-[207px] z-30 bg-[#002b49] border-r border-sky-800/80 text-[9px]">
                    Date To
                  </th>
                  <th className="py-2.5 px-1 text-center font-black uppercase tracking-wider w-[78px] min-w-[72px] max-w-[82px] sticky left-[289px] z-30 bg-[#002b49] border-r border-sky-800/80 text-[9px]">
                    Sync / Action
                  </th>

                  {/* 18 Mother Rates Columns with Full Two-Line Titles */}
                  {motherRates.map((mr) => {
                    const header = getRoomHeaderLines(mr);
                    return (
                      <th key={mr.motherId} className="py-2 px-1 text-center font-black border-r border-sky-800/60 w-[68px] min-w-[62px] max-w-[72px]">
                        <div className="leading-tight text-white font-black text-[9.5px] uppercase tracking-tight whitespace-normal break-words" title={mr.roomName || mr.shortName}>
                          {header.line1}<br/>{header.line2}
                        </div>
                        <div className="text-[7.5px] font-mono text-sky-300 font-normal leading-none mt-1">
                          ID {mr.motherId}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-850 text-stone-200">
                {periods.map((period, idx) => {
                  const isSyncing = syncingPeriodId === period.id;
                  const rowPrices = pricesMatrix[period.id] || {};
                  const rStyle = getRowStyle(period.id, idx);

                  return (
                    <tr key={period.id} className={`${rStyle.bg} ${rStyle.border} hover:bg-stone-850/60 transition-colors group`}>
                      {/* Period Name Input (Sticky Left 0) */}
                      <td className="py-1 px-1 sticky left-0 z-10 bg-stone-950 group-hover:bg-stone-900 border-r border-stone-850 w-[125px]">
                        <div className="flex items-center gap-1">
                          <span className={`text-[8px] px-1 py-0.2 rounded font-black uppercase ${rStyle.badge}`}>
                            {period.id.toUpperCase()}
                          </span>
                          <input
                            type="text"
                            value={period.name}
                            onChange={(e) => updatePeriodDate(period.id, 'name', e.target.value)}
                            className="w-full bg-stone-900 border border-stone-800 focus:border-sky-500 rounded px-1 py-0.5 text-[9.5px] font-extrabold text-white focus:outline-none"
                          />
                        </div>
                      </td>

                      {/* Date From Input (Sticky Left 125px) */}
                      <td className="py-1 px-0.5 sticky left-[125px] z-10 bg-stone-950 group-hover:bg-stone-900 border-r border-stone-850 w-[82px]">
                        <input
                          type="text"
                          value={formatDisplayDate(period.dateFrom)}
                          onChange={(e) => updatePeriodDate(period.id, 'dateFrom', parseDisplayDateToISO(e.target.value))}
                          placeholder="GG/MM/AAAA"
                          className="w-full bg-stone-900 border border-stone-800 focus:border-sky-500 rounded px-0.5 py-0.5 text-[9px] font-mono font-bold text-sky-300 text-center focus:outline-none"
                        />
                      </td>

                      {/* Date To Input (Sticky Left 207px) */}
                      <td className="py-1 px-0.5 sticky left-[207px] z-10 bg-stone-950 group-hover:bg-stone-900 border-r border-stone-850 w-[82px]">
                        <input
                          type="text"
                          value={formatDisplayDate(period.dateTo)}
                          onChange={(e) => updatePeriodDate(period.id, 'dateTo', parseDisplayDateToISO(e.target.value))}
                          placeholder="GG/MM/AAAA"
                          className="w-full bg-stone-900 border border-stone-800 focus:border-sky-500 rounded px-0.5 py-0.5 text-[9px] font-mono font-bold text-sky-300 text-center focus:outline-none"
                        />
                      </td>

                      {/* Row Action Controls (Sticky Left 289px) */}
                      <td className="py-1 px-0.5 text-center sticky left-[289px] z-10 bg-stone-950 group-hover:bg-stone-900 border-r border-stone-850 w-[78px]">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => syncPeriodToOctorate(period.id)}
                            disabled={isSyncing || syncAllRunning}
                            className="py-0.5 px-1 bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-700/60 rounded text-[8px] font-black uppercase transition-all cursor-pointer flex items-center gap-0.5 shadow"
                            title="Sincronizza questa riga su Octorate API"
                          >
                            <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin text-sky-300' : ''}`} />
                            <span>{isSyncing ? '...' : 'Sync'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => addPeriodAt(idx)}
                            className="p-0.5 bg-stone-800 hover:bg-emerald-900/80 text-stone-300 hover:text-emerald-300 border border-stone-700 hover:border-emerald-600/50 rounded transition-all cursor-pointer"
                            title="➕ Inserisci un nuovo periodo sotto questa riga"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>

                          {periods.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePeriod(period.id)}
                              className="p-0.5 bg-stone-800 hover:bg-red-950 text-stone-400 hover:text-red-300 border border-stone-700 hover:border-red-700 rounded transition-all cursor-pointer"
                              title="Elimina questo periodo"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 18 Mother Rate Price Inputs (Con Cerchiatura Gialla se isComparing & isMismatched) */}
                      {motherRates.map((mr) => {
                        const localPrice = rowPrices[mr.motherId] ?? 0;
                        const livePrice = getLiveOctoratePriceForPeriod(mr.motherId, period.dateFrom, period.dateTo);
                        const isMismatched = livePrice !== null && Math.abs(livePrice - localPrice) > 1;

                        return (
                          <td key={mr.motherId} className="py-1 px-0.5 text-center border-r border-stone-850/60 w-[68px]">
                            <div className="relative inline-block w-full">
                              <span className="absolute left-0.5 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-[8.5px] font-bold">฿</span>
                              <input
                                type="number"
                                value={rowPrices[mr.motherId] ?? ''}
                                onChange={(e) => updatePrice(period.id, mr.motherId, Number(e.target.value))}
                                className={`w-full ${
                                  isComparing && isMismatched
                                    ? 'bg-yellow-950/90 border-2 border-yellow-400 text-yellow-200 font-black ring-2 ring-yellow-400/90 shadow-[0_0_14px_rgba(250,204,21,0.8)]'
                                    : rStyle.inputBg
                                } rounded pl-2.5 pr-0.5 py-0.5 text-[9.5px] font-mono font-bold text-right focus:outline-none transition-all`}
                                title={isMismatched && livePrice !== null ? `⚠️ Discrepanza! Live Octorate: ฿${livePrice} vs Locale: ฿${localPrice}` : ''}
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABELLA 2: CONFRONTO LIVE OCTORATE (LIVE GRID VERIFICATION) */}
      {activeViewTab === 'comparison' && (
        <div className="bg-stone-900/90 border border-stone-800 backdrop-blur-xl rounded-3xl p-5 shadow-2xl space-y-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-md shadow-emerald-950" />
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight uppercase">
                🔍 TABELLA 2: CONFRONTO LIVE PREZZI REALI OCTORATE API
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Toggle Button for Highlighting Mismatched Cells in Tabella 2 */}
              <button
                type="button"
                onClick={() => setIsComparing(!isComparing)}
                className={`py-1.5 px-3 rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 border shadow ${
                  isComparing
                    ? 'bg-yellow-400 text-stone-950 border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-pulse'
                    : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-700/60'
                }`}
                title="Evidenzia con cerchiatura giallo fluorescente tutte le celle dove il prezzo locale differisce da Octorate API"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isComparing ? '🔍 Discrepanze Evidenziate' : '⚖️ Evidenzia Discrepanze'}</span>
              </button>

              <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 px-3 py-1 rounded-xl">
                Verifica Allineamento PMS 1:1
              </span>
            </div>
          </div>

          {/* Table Container perfectly aligned with Tabella 1 */}
          <div className="overflow-x-auto custom-scrollbar border border-stone-800 rounded-2xl max-h-[680px]">
            <table className="w-full text-left border-collapse text-[9.5px] font-sans">
              <thead className="sticky top-0 z-20 bg-[#002b49] text-sky-200 border-b border-sky-800 shadow-md">
                <tr>
                  <th className="py-2.5 px-2 font-black uppercase tracking-wider w-[125px] min-w-[115px] max-w-[130px] sticky left-0 z-30 bg-[#002b49] border-r border-sky-800/80 text-[9.5px]">
                    Periodo / Nome
                  </th>
                  <th className="py-2.5 px-1 text-center font-black uppercase tracking-wider w-[82px] min-w-[78px] max-w-[85px] sticky left-[125px] z-30 bg-[#002b49] border-r border-sky-800/80 text-[9px]">
                    Date From
                  </th>
                  <th className="py-2.5 px-1 text-center font-black uppercase tracking-wider w-[82px] min-w-[78px] max-w-[85px] sticky left-[207px] z-30 bg-[#002b49] border-r border-sky-800/80 text-[9px]">
                    Date To
                  </th>
                  <th className="py-2.5 px-1 text-center font-black uppercase tracking-wider w-[78px] min-w-[72px] max-w-[82px] sticky left-[289px] z-30 bg-[#002b49] border-r border-sky-800/80 text-[9px]">
                    Stato Live
                  </th>

                  {/* 18 Mother Rates Columns matching Tabella 1 1:1 */}
                  {motherRates.map((mr) => {
                    const header = getRoomHeaderLines(mr);
                    return (
                      <th key={mr.motherId} className="py-2 px-1 text-center font-black border-r border-sky-800/60 w-[68px] min-w-[62px] max-w-[72px]">
                        <div className="leading-tight text-white font-black text-[9.5px] uppercase tracking-tight whitespace-normal break-words" title={mr.roomName || mr.shortName}>
                          {header.line1}<br/>{header.line2}
                        </div>
                        <div className="text-[7.5px] font-mono text-sky-300 font-normal leading-none mt-1">
                          ID {mr.motherId}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-850 text-stone-200">
                {periods.map((period, idx) => {
                  const storeRowPrices = pricesMatrix[period.id] || {};
                  const rStyle = getRowStyle(period.id, idx);

                  return (
                    <tr key={period.id} className={`${rStyle.bg} ${rStyle.border} hover:bg-stone-850/60 transition-colors group`}>
                      {/* Period Name (Sticky Left 0) */}
                      <td className="py-1 px-1 sticky left-0 z-10 bg-stone-950 group-hover:bg-stone-900 border-r border-stone-850 w-[125px]">
                        <div className="flex items-center gap-1">
                          <span className={`text-[8px] px-1 py-0.2 rounded font-black uppercase ${rStyle.badge}`}>
                            {period.id.toUpperCase()}
                          </span>
                          <input
                            type="text"
                            readOnly
                            value={period.name}
                            className="w-full bg-stone-900 border border-stone-800 rounded px-1 py-0.5 text-[9.5px] font-extrabold text-white focus:outline-none cursor-default"
                          />
                        </div>
                      </td>

                      {/* Date From (Sticky Left 125px) */}
                      <td className="py-1 px-0.5 sticky left-[125px] z-10 bg-stone-950 group-hover:bg-stone-900 border-r border-stone-850 w-[82px]">
                        <input
                          type="text"
                          readOnly
                          value={formatDisplayDate(period.dateFrom)}
                          className="w-full bg-stone-900 border border-stone-800 rounded px-0.5 py-0.5 text-[9px] font-mono font-bold text-emerald-300 text-center focus:outline-none cursor-default"
                        />
                      </td>

                      {/* Date To (Sticky Left 207px) */}
                      <td className="py-1 px-0.5 sticky left-[207px] z-10 bg-stone-950 group-hover:bg-stone-900 border-r border-stone-850 w-[82px]">
                        <input
                          type="text"
                          readOnly
                          value={formatDisplayDate(period.dateTo)}
                          className="w-full bg-stone-900 border border-stone-800 rounded px-0.5 py-0.5 text-[9px] font-mono font-bold text-emerald-300 text-center focus:outline-none cursor-default"
                        />
                      </td>

                      {/* Live Sync Status Indicator (Sticky Left 289px) */}
                      <td className="py-1 px-0.5 text-center sticky left-[289px] z-10 bg-stone-950 group-hover:bg-stone-900 border-r border-stone-850 w-[78px]">
                        <div className="flex items-center justify-center">
                          <span className="text-[8px] font-mono font-black text-emerald-400 bg-emerald-950 border border-emerald-700/60 px-1 py-0.5 rounded uppercase">
                            LIVE PMS
                          </span>
                        </div>
                      </td>

                      {/* 18 Mother Rate Live Price Cells 1:1 Matching Tabella 1 (Con Cerchiatura Gialla se isComparing & isMismatched) */}
                      {motherRates.map((mr) => {
                        const localPrice = storeRowPrices[mr.motherId] || 0;
                        const livePrice = getLiveOctoratePriceForPeriod(mr.motherId, period.dateFrom, period.dateTo);
                        const isMatching = livePrice !== null && Math.abs(livePrice - localPrice) <= 1;
                        const isMismatched = livePrice !== null && Math.abs(livePrice - localPrice) > 1;

                        return (
                          <td key={mr.motherId} className="py-1 px-0.5 text-center border-r border-stone-850/60 w-[68px]">
                            <div className="relative inline-block w-full">
                              <span className="absolute left-0.5 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-[8.5px] font-bold">฿</span>
                              <div
                                title={livePrice !== null ? `Live Octorate: ฿${livePrice} | Locale: ฿${localPrice}` : `Programmato Locale: ฿${localPrice}`}
                                className={`w-full ${
                                  isComparing && isMismatched
                                    ? 'bg-yellow-950/90 border-2 border-yellow-400 text-yellow-200 font-black ring-2 ring-yellow-400/90 shadow-[0_0_14px_rgba(250,204,21,0.8)]'
                                    : livePrice !== null
                                    ? isMatching
                                      ? 'bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 font-black'
                                      : 'bg-amber-950/90 border border-amber-500/60 text-amber-300 font-black'
                                    : `${rStyle.inputBg}`
                                } rounded pl-2.5 pr-0.5 py-0.5 text-[9.5px] font-mono text-right truncate cursor-default transition-all`}
                              >
                                {livePrice !== null ? livePrice : localPrice}
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestioneStagionaleTariffe;
