import React, { useState, useEffect } from 'react';
import { formatDisplayDate, parseDisplayDateToISO } from '../../../lib/dateUtils';
import { useRestrictionsStore, REAL_OCTORATE_PLANS, RealOctoratePlan, PlannedPeriod } from '../store/useRestrictionsStore';
import { useResortAdminStore } from '../store/useResortAdminStore';
import { MOTHER_RATES } from '../store/useSeasonalRateStore';
import { 
  Ban, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Eye, 
  RotateCcw, 
  Zap, 
  Wind, 
  Layers, 
  Check, 
  Lock, 
  ShieldCheck, 
  ArrowRight,
  Info,
  ChevronDown,
  ChevronRight,
  Building2,
  Calendar,
  XCircle,
  LogOut
} from 'lucide-react';

export const GestioneRestrizioniCanali: React.FC = () => {
  const store = useRestrictionsStore();
  const resortAdminStore = useResortAdminStore();

  const rawPeriods = store?.plannedPeriods;
  const liveMock = store?.liveOctorateRestrictionsMock;
  const syncingPeriodId = store?.syncingPeriodId ?? null;
  const syncAllRunning = store?.syncAllRunning ?? false;
  const lastSyncMessage = store?.lastSyncMessage ?? null;
  const lastSyncStatus = store?.lastSyncStatus ?? 'idle';

  const updatePlannedPeriod = store?.updatePlannedPeriod || store?.updatePeriod || (() => {});
  const addNextPlannedPeriod = store?.addNextPlannedPeriod || store?.addNextPeriod || (() => {});
  const removePlannedPeriod = store?.removePlannedPeriod || store?.removePeriod || (() => {});
  const syncPlanToOctorate = store?.syncPlanToOctorate || (async () => false);
  const syncAllPlansToOctorate = store?.syncAllPlansToOctorate || (async () => false);
  const resetDefaultStore = store?.resetDefaultStore || (() => {});

  const rawOctorateGridItems = resortAdminStore?.rawOctorateGridItems || [];

  const [expandedAccommodations, setExpandedAccommodations] = useState<Record<string, boolean>>({});
  const [activeViewTab, setActiveViewTab] = useState<'editor' | 'comparison'>('editor');
  const [isComparing, setIsComparing] = useState<boolean>(false);

  // Intestazione Mesi con scala 6px per giorno
  const MONTHS_CONFIG = [
    { code: 'OTT 2026', label: 'Ottobre 2026', days: 31 },
    { code: 'NOV 2026', label: 'Novembre 2026', days: 30 },
    { code: 'DIC 2026', label: 'Dicembre 2026', days: 31 },
    { code: 'GEN 2027', label: 'Gennaio 2027', days: 31 },
    { code: 'FEB 2027', label: 'Febbraio 2027', days: 28 },
    { code: 'MAR 2027', label: 'Marzo 2027', days: 31 },
    { code: 'APR 2027', label: 'Aprile 2027', days: 30 },
    { code: 'MAG 2027', label: 'Maggio 2027', days: 31 },
    { code: 'GIU 2027', label: 'Giugno 2027', days: 30 },
    { code: 'LUG 2027', label: 'Luglio 2027', days: 31 },
    { code: 'AGO 2027', label: 'Agosto 2027', days: 31 },
    { code: 'SET 2027', label: 'Settembre 2027', days: 30 },
    { code: 'OTT 2027', label: 'Ottobre 2027', days: 31 }
  ];

  // Helper calcolo larghezza in pixel della scheda periodo (giorni * 6px)
  const getPeriodPixelWidth = (dateFrom: string, dateTo: string) => {
    try {
      const start = new Date(dateFrom);
      const end = new Date(dateTo);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const daysCount = isNaN(diffDays) ? 30 : Math.max(diffDays, 14);
      return daysCount * 6; // 6px al giorno
    } catch {
      return 180;
    }
  };

  const toggleAccommodationExpand = (planId: string) => {
    setExpandedAccommodations(prev => ({ ...prev, [planId]: !prev[planId] }));
  };

  // Helper per distinguere alloggi compatibili vs non compatibili (barrati per AC)
  const getAccommodationsForPlan = (plan: RealOctoratePlan) => {
    return MOTHER_RATES.map(mr => {
      const name = (mr.roomName || mr.shortName || '').toLowerCase();
      const isAcRoom = !name.includes('tent') && !name.includes('fan');
      const isCompatible = !plan.isAcOnly || isAcRoom;
      return { ...mr, isCompatible };
    });
  };

  // Helper restrizioni live (con Only Check Out)
  const getLiveOctorateRestrictionsForPeriod = (planId: string, periodId: string, dateFrom: string, dateTo: string) => {
    const mockPlan = liveMock?.[planId];
    if (mockPlan && mockPlan[periodId]) {
      return mockPlan[periodId];
    }

    if (!rawOctorateGridItems || rawOctorateGridItems.length === 0) return null;

    let stopSellCount = 0;
    let totalDays = 0;

    for (const item of rawOctorateGridItems) {
      if (Array.isArray(item.days)) {
        for (const day of item.days) {
          const dStr = String(day.date || day.dateStr || '').substring(0, 10);
          if (dStr >= dateFrom && dStr <= dateTo) {
            totalDays++;
            if (day.stopSell || day.closed || day.stop_sell) stopSellCount++;
          }
        }
      }
    }

    if (totalDays === 0) return null;

    return {
      stopSell: stopSellCount > 0,
      closedToArrival: false,
      closedToDeparture: false,
      onlyCheckOutDays: 10
    };
  };

  // Auto-fetch griglia Octorate live all'avvio
  useEffect(() => {
    if (!rawOctorateGridItems || rawOctorateGridItems.length === 0) {
      import('../../../booking/lib/octorate')
        .then(({ fetchOctorateGridData }) => {
          fetchOctorateGridData('2026-10-01', '2027-10-31').catch(e => console.warn('[GestioneTariffeDerivate] Auto grid fetch error:', e));
        })
        .catch(err => console.warn('[GestioneTariffeDerivate] Import error:', err));
    }
  }, [rawOctorateGridItems?.length]);

  return (
    <div className="space-y-6">
      {/* Banner Superiore: Tropical Glassmorphism Header */}
      <div className="bg-stone-900/90 border border-stone-800 backdrop-blur-xl rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-950 border border-red-500/30 rounded-2xl text-red-400 shadow-inner flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Gestione Tariffe Derivate <span className="text-xs bg-red-950 text-red-300 border border-red-600/50 px-2.5 py-0.5 rounded-full font-mono font-extrabold">Only Check Out Window & Restrizioni</span>
                </h2>
                <p className="text-stone-400 text-xs font-medium">
                  Matrice orizzontale continua a larghezza proporzionale (6px/giorno) con finestra Only Check Out e tasto rotondo `+`.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Tab Toggle View */}
            <div className="bg-stone-950 p-1 rounded-2xl border border-stone-800 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveViewTab('editor')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                  activeViewTab === 'editor'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                📊 Timeline Pianificata
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
                🔍 Timeline Live Octorate
              </button>
            </div>

            {/* Toggle Button Evidenzia Discrepanze in Giallo Oro Neon */}
            <button
              type="button"
              onClick={() => setIsComparing(!isComparing)}
              className={`py-2.5 px-4 rounded-2xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-2 border shadow ${
                isComparing
                  ? 'bg-yellow-400 text-stone-950 border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-pulse'
                  : 'bg-stone-800 hover:bg-stone-750 text-amber-300 border-amber-600/40'
              }`}
              title="Evidenzia con cerchiatura giallo oro fluorescente tutte le celle dove le restrizioni locali differiscono da Octorate API"
            >
              <Eye className="w-4 h-4" />
              <span>{isComparing ? '🔍 Discrepanze Evidenziate' : '⚖️ Evidenzia Discrepanze'}</span>
            </button>

            <button
              type="button"
              onClick={resetDefaultStore}
              className="py-2.5 px-4 bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-700 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow"
            >
              <RotateCcw className="w-4 h-4 text-stone-400" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={() => syncAllPlansToOctorate()}
              disabled={syncAllRunning || syncingPeriodId !== null}
              className="py-2.5 px-5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-red-950/50 flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${syncAllRunning ? 'animate-bounce text-yellow-300' : 'text-yellow-300'}`} />
              <span>{syncAllRunning ? 'Sincronizzazione Bulk...' : 'Sincronizza Tutti i Piani'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Toast Banner Status */}
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
      </div>

      {/* MATRICE TIMELINE ORIZZONTALE PROPORZIONALE */}
      <div className="bg-stone-900/90 border border-stone-800 backdrop-blur-xl rounded-3xl p-5 shadow-2xl space-y-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${activeViewTab === 'editor' ? 'bg-red-400 shadow-red-950' : 'bg-emerald-400 shadow-emerald-950'} shadow-md`} />
            <h3 className="text-xs sm:text-sm font-black text-white tracking-tight uppercase">
              {activeViewTab === 'editor' ? '📊 TABELLA 1: TIMELINE PROPORZIONALE RESTRIZIONI PIANIFICATE' : '🔍 TABELLA 2: TIMELINE PROPORZIONALE RESTRIZIONI LIVE OCTORATE'}
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-sky-300 bg-sky-950/80 border border-sky-800/80 px-3 py-1 rounded-xl">
            Scala Fisso: 6px al Giorno (Ott 2026 - Ott 2027)
          </span>
        </div>

        {/* Timeline Matrix Container con Asse del Tempo Scalato */}
        <div className="overflow-x-auto custom-scrollbar border border-stone-800 rounded-2xl max-h-[750px]">
          <div className="min-w-[2500px]">
            {/* 1. TIMELINE MENSILE SUPERIORE (RIGHELLO ASSE DEL TEMPO CON LARGHEZZA MESI = GIORNI * 6PX) */}
            <div className="sticky top-0 z-30 bg-[#002b49] text-sky-200 border-b border-sky-800 shadow-md flex items-center">
              {/* Sticky Left Rate Plans Title */}
              <div className="w-[280px] min-w-[280px] p-3 font-black uppercase text-xs tracking-wider border-r border-sky-800/80 sticky left-0 z-40 bg-[#002b49] flex items-center justify-between">
                <span>Piani Tariffari / Canali</span>
                <span className="text-[9px] font-mono text-sky-300 font-normal">12 Piani Reali</span>
              </div>

              {/* Time Axis Months (Dynamic Width = days * 6px) */}
              <div className="flex items-center border-l border-sky-800/60">
                {MONTHS_CONFIG.map(m => {
                  const widthPx = m.days * 6;
                  return (
                    <div 
                      key={m.code} 
                      style={{ width: `${widthPx}px`, minWidth: `${widthPx}px` }}
                      className="py-2.5 px-1 border-r border-sky-800/60 text-center font-black text-[10px] uppercase shrink-0"
                    >
                      <div className="text-white font-extrabold truncate">{m.code}</div>
                      <div className="text-[7.5px] font-mono text-sky-300/80 font-medium truncate">{m.days}gg ({widthPx}px)</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. ROWS DI RESTRIZIONI PER CIASCUN PIANO TARIFFARIO */}
            <div className="divide-y divide-stone-850 text-stone-200">
              {REAL_OCTORATE_PLANS.map(plan => {
                const periodsList: PlannedPeriod[] = rawPeriods?.[plan.id] || [];
                const isExpanded = Boolean(expandedAccommodations[plan.id]);
                const accsList = getAccommodationsForPlan(plan);

                return (
                  <div key={plan.id} className="flex items-stretch hover:bg-stone-850/40 transition-colors group">
                    {/* COLONNA SINISTRA STICKY: Codice e Nome del Piano Tariffario */}
                    <div className="w-[280px] min-w-[280px] p-3 sticky left-0 z-20 bg-stone-950 group-hover:bg-stone-900 border-r border-stone-850 flex flex-col justify-between space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full border ${plan.badgeColor}`}>
                            {plan.code}
                          </span>
                          {plan.isAcOnly && (
                            <span className="text-[8px] font-bold text-cyan-300 bg-cyan-950 border border-cyan-700/60 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <Wind className="w-2.5 h-2.5" /> AC Only
                            </span>
                          )}
                        </div>

                        {/* Nome Cliccabile per Espandere l'Accordion Alloggi Collegati */}
                        <div 
                          onClick={() => toggleAccommodationExpand(plan.id)}
                          className="font-extrabold text-white text-xs cursor-pointer hover:text-red-300 transition-colors flex items-center justify-between pt-0.5"
                        >
                          <span className="truncate">{plan.name}</span>
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />}
                        </div>

                        <p className="text-[9.5px] text-stone-400 leading-tight line-clamp-2">
                          {plan.description}
                        </p>
                      </div>

                      {/* Accordion Alloggi Collegati con Barratura per non-AC */}
                      {isExpanded && (
                        <div className="p-2 bg-stone-900 border border-stone-800 rounded-xl space-y-1 text-[9px] animate-in slide-in-from-top-1 duration-150">
                          <span className="font-extrabold text-stone-400 uppercase tracking-wider block flex items-center gap-1">
                            <Info className="w-2.5 h-2.5 text-sky-400" /> Compatibilità Alloggi:
                          </span>
                          <div className="space-y-0.5 max-h-[140px] overflow-y-auto custom-scrollbar">
                            {accsList.map(acc => (
                              <div 
                                key={acc.motherId} 
                                className={`flex items-center justify-between py-0.5 border-b border-stone-850/50 ${
                                  acc.isCompatible ? 'text-stone-300' : 'text-stone-600 line-through opacity-50'
                                }`}
                              >
                                <span className="truncate flex items-center gap-1">
                                  {acc.isCompatible ? (
                                    <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                                  ) : (
                                    <XCircle className="w-2.5 h-2.5 text-red-500 shrink-0" />
                                  )} 
                                  {acc.roomName || acc.shortName}
                                </span>
                                <span className="font-mono text-[8px] font-bold">
                                  ID {acc.motherId}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* COLONNA DESTRA: Moduli Orizzontali Periodi Scalati a giornipx + Tasto (+) Rotondo */}
                    <div className="flex-1 p-3 flex items-center gap-2 overflow-x-auto custom-scrollbar">
                      {activeViewTab === 'editor' ? (
                        // TABELLA 1: MODULI PERIODI PIANIFICATI (CON ONLY CHECK OUT RIGUARDO ALLO SCHIZZO)
                        <>
                          {periodsList.map((period) => {
                            const isSyncing = syncingPeriodId === period.id;
                            const live = getLiveOctorateRestrictionsForPeriod(plan.id, period.id, period.dateFrom, period.dateTo);
                            const isMismatched = live !== null && (live.stopSell !== period.stopSell || live.onlyCheckOutDays !== period.onlyCheckOutDays);
                            const cardWidthPx = getPeriodPixelWidth(period.dateFrom, period.dateTo);

                            return (
                              <div
                                key={period.id}
                                style={{ width: `${cardWidthPx}px`, minWidth: `${cardWidthPx}px` }}
                                className={`p-2.5 rounded-2xl border backdrop-blur-md space-y-2 transition-all shrink-0 ${
                                  isComparing && isMismatched
                                    ? 'bg-yellow-950/90 border-2 border-yellow-400 text-yellow-200 ring-2 ring-yellow-400/90 shadow-[0_0_15px_rgba(250,204,21,0.8)]'
                                    : 'bg-stone-950/80 border-stone-800 hover:border-stone-750 shadow-md'
                                }`}
                              >
                                {/* Header Scheda Periodo */}
                                <div className="flex items-center justify-between pb-1 border-b border-stone-850">
                                  <input
                                    type="text"
                                    value={period.name}
                                    onChange={(e) => updatePlannedPeriod(plan.id, period.id, { name: e.target.value })}
                                    className="bg-transparent font-extrabold text-white text-xs focus:outline-none truncate w-[75%]"
                                  />

                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => syncPlanToOctorate(plan.id, period.id)}
                                      disabled={isSyncing}
                                      className="p-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-700/60 rounded-lg transition-all cursor-pointer"
                                      title="Sync restrizione piano su Octorate API"
                                    >
                                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-white' : ''}`} />
                                    </button>

                                    {periodsList.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removePlannedPeriod(plan.id, period.id)}
                                        className="p-1 bg-stone-900 hover:bg-red-950 text-stone-400 hover:text-red-300 border border-stone-800 hover:border-red-700 rounded-lg transition-all cursor-pointer"
                                        title="Elimina periodo"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* RIGA 1 DALL'IMMAGINE DELLO SCHIZZO: Date Inizio & Fine in GG/MM/AAAA */}
                                <div className="grid grid-cols-2 gap-1 text-[9.5px]">
                                  <div>
                                    <label className="text-[7.5px] font-extrabold uppercase text-stone-400 block mb-0.5">Inizio (GG/MM/AAAA)</label>
                                    <input
                                      type="text"
                                      value={formatDisplayDate(period.dateFrom)}
                                      onChange={(e) => updatePlannedPeriod(plan.id, period.id, { dateFrom: parseDisplayDateToISO(e.target.value) })}
                                      className="w-full bg-stone-900 border border-stone-800 rounded px-1.5 py-0.5 text-center font-mono font-bold text-red-300 focus:outline-none text-[9px]"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[7.5px] font-extrabold uppercase text-stone-400 block mb-0.5">Fine (GG/MM/AAAA)</label>
                                    <input
                                      type="text"
                                      value={formatDisplayDate(period.dateTo)}
                                      onChange={(e) => updatePlannedPeriod(plan.id, period.id, { dateTo: parseDisplayDateToISO(e.target.value) })}
                                      className="w-full bg-stone-900 border border-stone-800 rounded px-1.5 py-0.5 text-center font-mono font-bold text-red-300 focus:outline-none text-[9px]"
                                    />
                                  </div>
                                </div>

                                {/* RIGA 2 DALL'IMMAGINE DELLO SCHIZZO: Input "ONLY CHECK OUT" & Toggle Blocco */}
                                <div className="flex items-center justify-between gap-1 text-[9px] pt-1 border-t border-stone-850/60">
                                  {/* Field "Only Check Out" (Giorni di tolleranza fine periodo) */}
                                  <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 px-1.5 py-0.5 rounded-lg">
                                    <LogOut className="w-3 h-3 text-amber-400 shrink-0" />
                                    <span className="font-extrabold text-amber-300 text-[8px] uppercase">Only Check Out:</span>
                                    <input
                                      type="number"
                                      min={0}
                                      max={60}
                                      value={period.onlyCheckOutDays ?? 10}
                                      onChange={(e) => updatePlannedPeriod(plan.id, period.id, { onlyCheckOutDays: Number(e.target.value) })}
                                      className="w-8 bg-stone-950 border border-stone-750 rounded text-center font-mono font-bold text-yellow-300 py-0.5 text-[9px]"
                                    />
                                    <span className="text-[7.5px] font-mono text-stone-400">gg</span>
                                  </div>

                                  {/* Toggle Blocco (Stop Sell) */}
                                  <button
                                    type="button"
                                    onClick={() => updatePlannedPeriod(plan.id, period.id, { stopSell: !period.stopSell })}
                                    className={`px-2 py-0.5 rounded font-black text-[8px] uppercase transition-all ${
                                      period.stopSell
                                        ? 'bg-red-950 border border-red-600 text-red-300'
                                        : 'bg-stone-900 border border-stone-800 text-stone-500'
                                    }`}
                                  >
                                    {period.stopSell ? 'BLOCCO' : 'APERTO'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          {/* PULSANTE "+" ROTONDO POSIZIONATO ADIACENTE A FINE RIGA */}
                          <button
                            type="button"
                            onClick={() => addNextPlannedPeriod(plan.id)}
                            className="w-10 h-10 min-w-10 min-h-10 rounded-full border-2 border-red-500/80 bg-red-950/40 hover:bg-red-600 text-white font-black flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-lg shadow-red-950/40 hover:scale-110"
                            title="➕ Inserisci nuovo periodo consecutivo a fine riga"
                          >
                            <Plus className="w-5 h-5 text-white" />
                          </button>
                        </>
                      ) : (
                        // TABELLA 2: REALE LIVE OCTORATE (LIVE GRID MATRIX PROPORZIONALE CON ONLY CHECK OUT)
                        <>
                          {periodsList.map((period) => {
                            const live = getLiveOctorateRestrictionsForPeriod(plan.id, period.id, period.dateFrom, period.dateTo);
                            const isMatching = live !== null && live.stopSell === period.stopSell && live.onlyCheckOutDays === period.onlyCheckOutDays;
                            const isMismatched = live !== null && !isMatching;
                            const cardWidthPx = getPeriodPixelWidth(period.dateFrom, period.dateTo);

                            return (
                              <div
                                key={period.id}
                                style={{ width: `${cardWidthPx}px`, minWidth: `${cardWidthPx}px` }}
                                className={`p-2.5 rounded-2xl border backdrop-blur-md space-y-2 transition-all shrink-0 ${
                                  isComparing && isMismatched
                                    ? 'bg-yellow-950/90 border-2 border-yellow-400 text-yellow-200 ring-2 ring-yellow-400/90 shadow-[0_0_15px_rgba(250,204,21,0.8)]'
                                    : 'bg-stone-950/80 border-stone-800 shadow-md'
                                }`}
                              >
                                <div className="flex items-center justify-between pb-1 border-b border-stone-850">
                                  <span className="font-extrabold text-white text-xs truncate">{period.name}</span>
                                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${isMatching ? 'bg-emerald-950 border-emerald-700 text-emerald-300' : 'bg-amber-950 border-amber-700 text-amber-300'}`}>
                                    {isMatching ? 'ALLINEATO' : 'DISCREPANZA'}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-1 text-[9.5px]">
                                  <div>
                                    <span className="text-[7.5px] font-extrabold uppercase text-stone-400 block mb-0.5">Date From</span>
                                    <div className="bg-stone-900 border border-stone-800 rounded px-1.5 py-0.5 text-center font-mono font-bold text-emerald-300 text-[9px]">
                                      {formatDisplayDate(period.dateFrom)}
                                    </div>
                                  </div>

                                  <div>
                                    <span className="text-[7.5px] font-extrabold uppercase text-stone-400 block mb-0.5">Date To</span>
                                    <div className="bg-stone-900 border border-stone-800 rounded px-1.5 py-0.5 text-center font-mono font-bold text-emerald-300 text-[9px]">
                                      {formatDisplayDate(period.dateTo)}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between gap-1 text-[9px] pt-1 border-t border-stone-850/60">
                                  {/* Field "Only Check Out" Live */}
                                  <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 px-1.5 py-0.5 rounded-lg">
                                    <LogOut className="w-3 h-3 text-amber-400 shrink-0" />
                                    <span className="font-extrabold text-amber-300 text-[8px] uppercase">Only Check Out:</span>
                                    <div className="w-8 bg-stone-950 border border-stone-750 rounded text-center font-mono font-bold text-yellow-300 py-0.5 text-[9px]">
                                      {live !== null ? live.onlyCheckOutDays : 'N/D'}
                                    </div>
                                    <span className="text-[7.5px] font-mono text-stone-400">gg</span>
                                  </div>

                                  {/* Live StopSell (BLOCCO/APERTO) */}
                                  <div className={`px-2 py-0.5 rounded font-black text-[8px] uppercase ${live?.stopSell ? 'bg-red-950 border border-red-600 text-red-300' : 'bg-emerald-950 border border-emerald-600 text-emerald-300'}`}>
                                    {live !== null ? (live.stopSell ? 'BLOCCO' : 'APERTO') : 'N/D'}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestioneRestrizioniCanali;
