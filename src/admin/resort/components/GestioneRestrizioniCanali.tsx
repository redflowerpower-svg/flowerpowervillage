import React, { useState, useEffect } from 'react';
import { formatDisplayDate, parseDisplayDateToISO } from '../../../lib/dateUtils';
import { useRestrictionsStore, REAL_OCTORATE_PLANS, RealOctoratePlan, PlannedPeriod } from '../store/useRestrictionsStore';
import { useResortAdminStore } from '../store/useResortAdminStore';
import { MOTHER_RATES } from '../store/useSeasonalRateStore';
import {
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
  Info,
  ChevronDown,
  ChevronRight,
  XCircle,
  LogOut
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────
const PX_PER_DAY = 6;
const GANTT_ORIGIN = new Date('2026-10-01');

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
  { code: 'OTT 2027', label: 'Ottobre 2027', days: 31 },
];

const TOTAL_GANTT_DAYS = MONTHS_CONFIG.reduce((s, m) => s + m.days, 0);
const TOTAL_GANTT_PX = TOTAL_GANTT_DAYS * PX_PER_DAY;
// Altezza riga ridotta al minimo limite sufficiente (92px)
const ROW_HEIGHT = 92;

interface PlanTheme {
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  cardBg: string;
  cardBorder: string;
  cardText: string;
  dateText: string;
}

const RATE_PLAN_COLORS: Record<string, PlanTheme> = {
  be: {
    badgeBg: 'bg-emerald-500/20', badgeText: 'text-emerald-300 font-extrabold', badgeBorder: 'border-emerald-500/50',
    cardBg: 'bg-emerald-950/90', cardBorder: 'border-emerald-500/80', cardText: 'text-emerald-200', dateText: 'text-emerald-300'
  },
  '7d': {
    badgeBg: 'bg-teal-400/20', badgeText: 'text-teal-300 font-extrabold', badgeBorder: 'border-teal-400/50',
    cardBg: 'bg-teal-950/85', cardBorder: 'border-teal-400/80', cardText: 'text-teal-100', dateText: 'text-teal-300'
  },
  main_bnb_7d: {
    badgeBg: 'bg-sky-500/20', badgeText: 'text-sky-300 font-extrabold', badgeBorder: 'border-sky-500/50',
    cardBg: 'bg-sky-950/90', cardBorder: 'border-sky-400/80', cardText: 'text-sky-200', dateText: 'text-sky-300'
  },
  main_bnb_14d: {
    badgeBg: 'bg-blue-950/90', badgeText: 'text-blue-300 font-extrabold', badgeBorder: 'border-blue-700/80',
    cardBg: 'bg-[#08152e]/95', cardBorder: 'border-blue-700/80', cardText: 'text-blue-200', dateText: 'text-blue-300'
  },
  agd_ac_7d: {
    badgeBg: 'bg-pink-300/20', badgeText: 'text-pink-200 font-extrabold', badgeBorder: 'border-pink-300/60',
    cardBg: 'bg-[#3b1922]/90', cardBorder: 'border-pink-300/80', cardText: 'text-pink-100', dateText: 'text-pink-200'
  },
  agd_ac_14d: {
    badgeBg: 'bg-rose-950/80', badgeText: 'text-rose-400 font-extrabold', badgeBorder: 'border-rose-700/80',
    cardBg: 'bg-[#250811]/95', cardBorder: 'border-rose-700/80', cardText: 'text-rose-200', dateText: 'text-rose-300'
  },
  ac_7d: {
    badgeBg: 'bg-cyan-500/20', badgeText: 'text-cyan-300', badgeBorder: 'border-cyan-500/50',
    cardBg: 'bg-cyan-950/85', cardBorder: 'border-cyan-600/70', cardText: 'text-cyan-200', dateText: 'text-cyan-300'
  },
  ac_14d: {
    badgeBg: 'bg-blue-500/20', badgeText: 'text-blue-300', badgeBorder: 'border-blue-500/50',
    cardBg: 'bg-blue-950/85', cardBorder: 'border-blue-600/70', cardText: 'text-blue-200', dateText: 'text-blue-300'
  },
  ac_bnb_7d: {
    badgeBg: 'bg-indigo-500/20', badgeText: 'text-indigo-300', badgeBorder: 'border-indigo-500/50',
    cardBg: 'bg-indigo-950/85', cardBorder: 'border-indigo-600/70', cardText: 'text-indigo-200', dateText: 'text-indigo-300'
  },
  ac_bnb_14d: {
    badgeBg: 'bg-purple-500/20', badgeText: 'text-purple-300', badgeBorder: 'border-purple-500/50',
    cardBg: 'bg-purple-950/85', cardBorder: 'border-purple-600/70', cardText: 'text-purple-200', dateText: 'text-purple-300'
  },
  airbnb: {
    badgeBg: 'bg-amber-500/20', badgeText: 'text-amber-300 font-extrabold', badgeBorder: 'border-amber-500/50',
    cardBg: 'bg-amber-950/85', cardBorder: 'border-amber-500/80', cardText: 'text-amber-200', dateText: 'text-amber-300'
  },
  airbnb_ac: {
    badgeBg: 'bg-orange-600/25', badgeText: 'text-orange-300 font-extrabold', badgeBorder: 'border-orange-600/60',
    cardBg: 'bg-[#331405]/95', cardBorder: 'border-orange-600/80', cardText: 'text-orange-200', dateText: 'text-orange-300'
  }
};

// ─── Gantt helpers ────────────────────────────────────────────────────────────
function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
function getGanttOffset(dateFrom: string): number {
  try {
    const d = new Date(dateFrom);
    return Math.max(0, daysBetween(GANTT_ORIGIN, d)) * PX_PER_DAY;
  } catch { return 0; }
}
function getGanttWidth(dateFrom: string, dateTo: string): number {
  try {
    const s = new Date(dateFrom);
    const e = new Date(dateTo);
    const calculatedPx = Math.max(1, daysBetween(s, e) + 1) * PX_PER_DAY;
    return Math.max(148, calculatedPx);
  } catch { return 148; }
}

// ─── Component ────────────────────────────────────────────────────────────────
export const GestioneRestrizioniCanali: React.FC = () => {
  const store = useRestrictionsStore();
  const resortAdminStore = useResortAdminStore();

  const rawPeriods = store?.plannedPeriods;
  const liveOctorateRestrictions = store?.liveOctorateRestrictions || {};
  const syncingPeriodId = store?.syncingPeriodId ?? null;
  const syncAllRunning = store?.syncAllRunning ?? false;
  const isBulkSaving = store?.isBulkSaving ?? false;
  const isFetchingLive = store?.isFetchingLive ?? false;
  const lastSyncMessage = store?.lastSyncMessage ?? null;
  const lastSyncStatus = store?.lastSyncStatus ?? 'idle';

  const fetchLiveRestrictions = store?.fetchLiveRestrictions || (async () => {});
  const updatePlannedPeriod = store?.updatePlannedPeriod || store?.updatePeriod || (() => {});
  const addNextPlannedPeriod = store?.addNextPlannedPeriod || store?.addNextPeriod || (() => {});
  const removePlannedPeriod = store?.removePlannedPeriod || store?.removePeriod || (() => {});
  const syncPlanToOctorate = store?.syncPlanToOctorate || (async () => false);
  const syncAllRatePlansToOctorate = store?.syncAllRatePlansToOctorate || store?.syncAllPlansToOctorate || (async () => false);
  const cancelBulkSync = store?.cancelBulkSync || (() => {});
  const resetDefaultStore = store?.resetDefaultStore || (() => {});

  const rawOctorateGridItems = resortAdminStore?.rawOctorateGridItems || [];

  const [expandedAccommodations, setExpandedAccommodations] = useState<Record<string, boolean>>({});
  const [activeViewTab, setActiveViewTab] = useState<'editor' | 'comparison'>('editor');
  const [isComparing, setIsComparing] = useState<boolean>(false);

  const liveDataKeys = Object.keys(liveOctorateRestrictions);
  const isLiveDataReady = liveDataKeys.length > 0 && liveDataKeys.some(k => (liveOctorateRestrictions[k]?.length ?? 0) > 0);

  const toggleAccommodationExpand = (planId: string) => {
    setExpandedAccommodations(prev => ({ ...prev, [planId]: !prev[planId] }));
  };

  const getAccommodationsForPlan = (plan: RealOctoratePlan) => {
    return MOTHER_RATES.map(mr => {
      const name = (mr.roomName || mr.shortName || '').toLowerCase();
      const isAcRoom = !name.includes('tent') && !name.includes('fan');
      const isCompatible = !plan.isAcOnly || isAcRoom;
      return { ...mr, isCompatible };
    });
  };

  // fetchLiveRestrictions stabile: non cambia ad ogni render
  const stableFetchLive = React.useCallback(() => {
    fetchLiveRestrictions().catch(e => console.warn('[GestioneTariffeDerivate] fetchLiveRestrictions error:', e));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    stableFetchLive();
    // Carica il grid Octorate solo se non già presente
    if (!rawOctorateGridItems || rawOctorateGridItems.length === 0) {
      import('../../../booking/lib/octorate')
        .then(({ fetchOctorateGridData }) => {
          fetchOctorateGridData('2026-10-01', '2027-10-31').catch(e => console.warn('[GestioneTariffeDerivate] Auto grid fetch error:', e));
        })
        .catch(err => console.warn('[GestioneTariffeDerivate] Import error:', err));
    }
  }, []); // eseguito solo al mount — rawOctorateGridItems non è una dep stabile

  // ─────────────────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────
  // CARD TABELLA 1 — Layout fluido (Altezza compattata)
  // ─────────────────────────────────────────────────────────────────────────────
  const renderPlannedPeriodCard = (plan: RealOctoratePlan, period: PlannedPeriod, periodsList: PlannedPeriod[]) => {
    const isSyncing = syncingPeriodId === period.id;
    const leftPx = getGanttOffset(period.dateFrom);
    const widthPx = getGanttWidth(period.dateFrom, period.dateTo);

    let isMismatched = false;
    const liveForPlan = liveOctorateRestrictions[plan.id] || [];
    const liveMatch = liveForPlan.find((lp: PlannedPeriod) => lp.dateFrom <= period.dateTo && lp.dateTo >= period.dateFrom);
    if (isComparing && liveMatch) {
      isMismatched = liveMatch.stopSell !== period.stopSell || liveMatch.onlyCheckOutDays !== period.onlyCheckOutDays;
    }

    const theme = RATE_PLAN_COLORS[plan.id] || {
      badgeBg: 'bg-stone-800', badgeText: 'text-stone-300', badgeBorder: 'border-stone-700',
      cardBg: 'bg-stone-950/80', cardBorder: 'border-stone-800', cardText: 'text-stone-200', dateText: 'text-red-300'
    };

    const cardBg = isMismatched
      ? 'bg-yellow-950/90 border-yellow-400 ring-2 ring-yellow-400/90 shadow-[0_0_15px_rgba(250,204,21,0.8)] text-yellow-200'
      : `${theme.cardBg} ${theme.cardBorder} hover:border-stone-600 shadow-md ${theme.cardText}`;

    return (
      <div
        key={period.id}
        style={{ position: 'absolute', left: `${leftPx}px`, width: `${widthPx}px`, top: '2px', bottom: '2px' }}
        className={`rounded-xl border backdrop-blur-md transition-all overflow-hidden flex items-start p-1 ${cardBg}`}
      >
        {/* Contenuto clamped: 148px max, 100% per card strette */}
        <div style={{ width: 'min(148px, 100%)' }} className="flex flex-col gap-0.5">

          {/* Riga 1: Titolo + pulsanti */}
          <div className="flex items-center justify-between gap-1 h-3.5">
            <input type="text" value={period.name}
              onChange={e => updatePlannedPeriod(plan.id, period.id, { name: e.target.value })}
              className="bg-transparent font-extrabold text-white text-[8.5px] focus:outline-none truncate flex-1 min-w-0" />
            <div className="flex items-center gap-0.5 shrink-0">
              <button type="button" onClick={() => syncPlanToOctorate(plan.id, period.id)} disabled={isSyncing}
                className="p-0.5 bg-red-950 hover:bg-red-900 text-red-300 border border-red-700/50 rounded cursor-pointer" title="Sync">
                <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin text-white' : ''}`} />
              </button>
              <button type="button" onClick={() => removePlannedPeriod(plan.id, period.id)}
                className="p-0.5 bg-stone-900 hover:bg-red-950 text-stone-400 hover:text-red-300 border border-stone-800 rounded cursor-pointer" title="Elimina periodo">
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          {/* Riga 2: Inizio (etichetta integrata nel box data) */}
          <div className="relative cursor-pointer" onClick={e => {
            const inputEl = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement;
            if (inputEl) try { inputEl.showPicker?.(); } catch {}
          }}>
            <div className="flex items-center justify-between bg-stone-950/80 border border-stone-800 rounded px-1 py-0.5 text-[8.5px]">
              <span className="text-[5.5px] font-black uppercase text-stone-500 shrink-0 mr-0.5">INIZIO</span>
              <span className={`font-mono font-bold ${theme.dateText} truncate text-center flex-1 text-[8.5px]`}>{formatDisplayDate(period.dateFrom)}</span>
            </div>
            <input type="date" value={period.dateFrom || ''}
              onChange={e => { if (e.target.value) updatePlannedPeriod(plan.id, period.id, { dateFrom: e.target.value }); }}
              onClick={e => (e.currentTarget as any).showPicker?.()}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
          </div>

          {/* Riga 3: Fine (etichetta integrata nel box data) */}
          <div className="relative cursor-pointer" onClick={e => {
            const inputEl = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement;
            if (inputEl) try { inputEl.showPicker?.(); } catch {}
          }}>
            <div className="flex items-center justify-between bg-stone-950/80 border border-stone-800 rounded px-1 py-0.5 text-[8.5px]">
              <span className="text-[5.5px] font-black uppercase text-stone-500 shrink-0 mr-0.5">FINE</span>
              <span className={`font-mono font-bold ${theme.dateText} truncate text-center flex-1 text-[8.5px]`}>{formatDisplayDate(period.dateTo)}</span>
            </div>
            <input type="date" value={period.dateTo || ''}
              onChange={e => { if (e.target.value) updatePlannedPeriod(plan.id, period.id, { dateTo: e.target.value }); }}
              onClick={e => (e.currentTarget as any).showPicker?.()}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
          </div>

          {/* Riga 4: Only CO + Stop Sell */}
          <div className="flex items-center justify-between gap-1 pt-0.5">
            <div className="flex items-center gap-1">
              <LogOut className="w-2.5 h-2.5 text-amber-400 shrink-0" />
              <input type="number" min={0} max={60} value={period.onlyCheckOutDays ?? 10}
                onChange={e => updatePlannedPeriod(plan.id, period.id, { onlyCheckOutDays: Number(e.target.value) })}
                className="w-9 bg-stone-950 border border-stone-700 rounded text-center font-mono font-bold text-yellow-300 py-0.5 text-[10px]" />
              <span className="text-[7.5px] text-stone-400 font-semibold">gg</span>
            </div>
            <button type="button" onClick={() => updatePlannedPeriod(plan.id, period.id, { stopSell: !period.stopSell })}
              className={`px-1.5 py-0.5 rounded font-black text-[7px] uppercase shrink-0 transition-all ${
                period.stopSell ? 'bg-red-950 border border-red-600 text-red-300' : 'bg-stone-900 border border-stone-800 text-stone-400'
              }`}>
              {period.stopSell ? 'BLOK' : 'OPEN'}
            </button>
          </div>

        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // CARD TABELLA 2 — Live Octorate (Altezza compattata)
  // ─────────────────────────────────────────────────────────────────────────────
  const renderLivePeriodCard = (plan: RealOctoratePlan, period: PlannedPeriod, periodsList: PlannedPeriod[]) => {
    const leftPx = getGanttOffset(period.dateFrom);
    const widthPx = getGanttWidth(period.dateFrom, period.dateTo);
    const effectiveLiveStopSell = period.stopSell ?? false;
    const effectiveLiveOnlyOut = period.onlyCheckOutDays ?? 10;
    const plannedEq = periodsList.find(p => p.dateFrom <= period.dateTo && p.dateTo >= period.dateFrom);
    const isMatching = plannedEq !== undefined && plannedEq.stopSell === effectiveLiveStopSell && plannedEq.onlyCheckOutDays === effectiveLiveOnlyOut;
    const isMismatched = !isMatching;

    const theme = RATE_PLAN_COLORS[plan.id] || {
      badgeBg: 'bg-stone-800', badgeText: 'text-stone-300', badgeBorder: 'border-stone-700',
      cardBg: 'bg-stone-950/80', cardBorder: 'border-stone-800', cardText: 'text-stone-200', dateText: 'text-emerald-300'
    };

    const cardBg = isComparing && isMismatched
      ? 'bg-yellow-950/90 border-yellow-400 ring-2 ring-yellow-400/90 shadow-[0_0_15px_rgba(250,204,21,0.8)] text-yellow-200'
      : `${theme.cardBg} ${theme.cardBorder} shadow-md ${theme.cardText}`;

    return (
      <div
        key={period.id}
        style={{ position: 'absolute', left: `${leftPx}px`, width: `${widthPx}px`, top: '2px', bottom: '2px' }}
        className={`rounded-xl border backdrop-blur-md transition-all overflow-hidden flex items-start p-1 ${cardBg}`}
      >
        {/* Contenuto clamped: 148px max, 100% per card strette */}
        <div style={{ width: 'min(148px, 100%)' }} className="flex flex-col gap-0.5">

          {/* Riga 1: Titolo + badge */}
          <div className="flex items-center justify-between gap-1 h-3.5">
            <span className="font-extrabold text-white text-[8.5px] truncate flex-1 min-w-0">{period.name}</span>
            <span className={`text-[6px] font-bold px-1 py-0.5 rounded border shrink-0 ${
              isMatching ? 'bg-emerald-950 border-emerald-700 text-emerald-300' : 'bg-amber-950 border-amber-700 text-amber-300'
            }`}>
              {isMatching ? '✓' : '!'}
            </span>
          </div>

          {/* Riga 2: Inizio */}
          <div className="flex items-center justify-between bg-stone-950/80 border border-stone-800 rounded px-1 py-0.5 text-[8.5px]">
            <span className="text-[5.5px] font-black uppercase text-stone-500 shrink-0 mr-0.5">INIZIO</span>
            <span className={`font-mono font-bold ${theme.dateText} truncate text-center flex-1 text-[8.5px]`}>{formatDisplayDate(period.dateFrom)}</span>
          </div>

          {/* Riga 3: Fine */}
          <div className="flex items-center justify-between bg-stone-950/80 border border-stone-800 rounded px-1 py-0.5 text-[8.5px]">
            <span className="text-[5.5px] font-black uppercase text-stone-500 shrink-0 mr-0.5">FINE</span>
            <span className={`font-mono font-bold ${theme.dateText} truncate text-center flex-1 text-[8.5px]`}>{formatDisplayDate(period.dateTo)}</span>
          </div>

          {/* Riga 4: Only CO + Stop Sell */}
          <div className="flex items-center justify-between gap-1 pt-0.5">
            <div className="flex items-center gap-1">
              <LogOut className="w-2.5 h-2.5 text-amber-400 shrink-0" />
              <div className="w-9 bg-stone-950 border border-stone-700 rounded text-center font-mono font-bold text-yellow-300 py-0.5 text-[10px]">
                {effectiveLiveOnlyOut}
              </div>
              <span className="text-[7.5px] text-stone-400 font-semibold">gg</span>
            </div>
            <div className={`px-1.5 py-0.5 rounded font-black text-[7px] uppercase shrink-0 ${
              effectiveLiveStopSell ? 'bg-red-950 border border-red-600 text-red-300' : 'bg-emerald-950 border border-emerald-600 text-emerald-300'
            }`}>
              {effectiveLiveStopSell ? 'BLOK' : 'OPEN'}
            </div>
          </div>

        </div>
      </div>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Banner Superiore ────────────────────────────────────────────────── */}
      <div className="bg-stone-900/90 border border-stone-800 backdrop-blur-xl rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-950 border border-red-500/30 rounded-2xl text-red-400 shadow-inner flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Gestione Tariffe Derivate{' '}
                  <span className="text-xs bg-red-950 text-red-300 border border-red-600/50 px-2.5 py-0.5 rounded-full font-mono font-extrabold">
                    Only Check Out Window &amp; Restrizioni
                  </span>
                </h2>
                <p className="text-stone-400 text-xs font-medium">
                  Gantt proporzionale (6px/giorno) · finestra Only Check Out · posizionamento assoluto continuo
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Tab Toggle */}
            <div className="bg-stone-950 p-1 rounded-2xl border border-stone-800 flex items-center gap-1">
              <button type="button" onClick={() => setActiveViewTab('editor')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                  activeViewTab === 'editor' ? 'bg-red-600 text-white shadow-md' : 'text-stone-400 hover:text-white'
                }`}>
                📊 Timeline Pianificata
              </button>
              <button type="button" onClick={() => {
                setActiveViewTab('comparison');
                fetchLiveRestrictions();
              }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeViewTab === 'comparison' ? 'bg-emerald-600 text-white shadow-md' : 'text-stone-400 hover:text-white'
                }`}>
                <RefreshCw className={`w-3.5 h-3.5 ${isFetchingLive ? 'animate-spin text-white' : ''}`} />
                <span>🔍 Timeline Live Octorate</span>
              </button>
            </div>

            {/* Evidenzia Discrepanze */}
            <button type="button" onClick={() => setIsComparing(!isComparing)}
              className={`py-2.5 px-4 rounded-2xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-2 border shadow ${
                isComparing
                  ? 'bg-yellow-400 text-stone-950 border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-pulse'
                  : 'bg-stone-800 hover:bg-stone-750 text-amber-300 border-amber-600/40'
              }`}>
              <Eye className="w-4 h-4" />
              <span>{isComparing ? '🔍 Discrepanze Evidenziate' : '⚖️ Evidenzia Discrepanze'}</span>
            </button>

            {/* Reset */}
            <button type="button" onClick={resetDefaultStore}
              className="py-2.5 px-4 bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-700 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow">
              <RotateCcw className="w-4 h-4 text-stone-400" />
              <span>Reset Defaults</span>
            </button>

            {/* Sync / Annulla */}
            {(isBulkSaving || syncAllRunning) ? (
              <button type="button" onClick={() => cancelBulkSync()}
                className="py-2.5 px-5 bg-red-800 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg flex items-center gap-2 cursor-pointer ring-2 ring-red-400 animate-pulse">
                <XCircle className="w-4 h-4 text-white" />
                <span>Annulla / Interrompi</span>
              </button>
            ) : (
              <button type="button" onClick={() => syncAllRatePlansToOctorate()} disabled={syncingPeriodId !== null}
                className="py-2.5 px-5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg flex items-center gap-2.5 cursor-pointer disabled:opacity-50">
                <Zap className="w-4 h-4 text-yellow-300" />
                <span>Sincronizza Tutti i Piani</span>
              </button>
            )}
          </div>
        </div>

        {/* Toast Banner Stato */}
        {lastSyncMessage && (
          <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-3 border shadow-lg ${
            lastSyncStatus === 'success'
              ? 'bg-emerald-950/80 border-emerald-600/60 text-emerald-200'
              : lastSyncStatus === 'error'
              ? 'bg-red-950/80 border-red-700/60 text-red-200'
              : 'bg-sky-950/80 border-sky-600/60 text-sky-200'
          }`}>
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

      {/* ── Matrice Timeline Gantt ─────────────────────────────────────────────── */}
      <div className="bg-stone-900/90 border border-stone-800 backdrop-blur-xl rounded-3xl p-5 shadow-2xl space-y-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full shadow-md ${activeViewTab === 'editor' ? 'bg-red-400' : 'bg-emerald-400'}`} />
            <h3 className="text-xs sm:text-sm font-black text-white tracking-tight uppercase">
              {activeViewTab === 'editor'
                ? '📊 TABELLA 1: TIMELINE GANTT — RESTRIZIONI PIANIFICATE'
                : '🔍 TABELLA 2: TIMELINE GANTT — RESTRIZIONI LIVE OCTORATE'}
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-sky-300 bg-sky-950/80 border border-sky-800/80 px-3 py-1 rounded-xl">
            Gantt: 6px/giorno · Ott 2026 → Ott 2027
          </span>
        </div>

        {/* Scroll container: libero di estendersi verticalmente (h-auto) senza scrollbar interna */}
        <div className="overflow-x-auto custom-scrollbar border border-stone-800 rounded-2xl h-auto">
          <div style={{ minWidth: `${280 + TOTAL_GANTT_PX}px` }}>

            {/* ── Righello Mesi (sticky) ────────────────────────────────────── */}
            <div className="sticky top-0 z-30 bg-[#002b49] text-sky-200 border-b border-sky-800 shadow-md flex items-center">
              <div className="w-[280px] min-w-[280px] p-3 font-black uppercase text-xs tracking-wider border-r border-sky-800/80 sticky left-0 z-40 bg-[#002b49] flex items-center justify-between">
                <span>Piani Tariffari / Canali</span>
                <span className="text-[9px] font-mono text-sky-300 font-normal">12 Piani Reali</span>
              </div>
              <div className="flex items-center border-l border-sky-800/60">
                {MONTHS_CONFIG.map(m => {
                  const w = m.days * PX_PER_DAY;
                  return (
                    <div key={m.code} style={{ width: `${w}px`, minWidth: `${w}px` }}
                      className="py-2.5 px-1 border-r border-sky-800/60 text-center font-black text-[10px] uppercase shrink-0">
                      <div className="text-white font-extrabold truncate">{m.code}</div>
                      <div className="text-[7.5px] font-mono text-sky-300/80 truncate">{m.days}gg</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Righe Piani ──────────────────────────────────────────────── */}
            <div className="divide-y divide-stone-850 text-stone-200">
              {REAL_OCTORATE_PLANS.map(plan => {
                const periodsList: PlannedPeriod[] = rawPeriods?.[plan.id] || [];
                const isExpanded = Boolean(expandedAccommodations[plan.id]);
                const accsList = getAccommodationsForPlan(plan);
                const theme = RATE_PLAN_COLORS[plan.id] || {
                  badgeBg: 'bg-stone-800', badgeText: 'text-stone-300', badgeBorder: 'border-stone-700',
                  cardBg: 'bg-stone-950/80', cardBorder: 'border-stone-800', cardText: 'text-stone-200', dateText: 'text-emerald-300'
                };

                return (
                  <div key={plan.id} className="flex items-stretch hover:bg-stone-850/40 transition-colors group">

                    {/* ── Colonna Sinistra Sticky ────────────────────────────── */}
                    <div className="w-[280px] min-w-[280px] p-3 sticky left-0 z-20 bg-stone-950 group-hover:bg-stone-900 border-r border-stone-850 flex flex-col justify-between space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                            {plan.code}
                          </span>
                          {plan.isAcOnly && (
                            <span className="text-[8px] font-bold text-cyan-300 bg-cyan-950 border border-cyan-700/60 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Wind className="w-2.5 h-2.5" /> AC Only
                            </span>
                          )}
                        </div>
                        <div onClick={() => toggleAccommodationExpand(plan.id)}
                          className="font-extrabold text-white text-xs cursor-pointer hover:text-red-300 transition-colors flex items-center justify-between pt-0.5">
                          <span className="truncate">{plan.name}</span>
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />}
                        </div>
                        <p className="text-[9.5px] text-stone-400 leading-tight line-clamp-2">{plan.description}</p>
                      </div>

                      {isExpanded && (
                        <div className="p-2 bg-stone-900 border border-stone-800 rounded-xl space-y-1 text-[9px] animate-in slide-in-from-top-1 duration-150">
                          <span className="font-extrabold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                            <Info className="w-2.5 h-2.5 text-sky-400" /> Compatibilità Alloggi:
                          </span>
                          <div className="space-y-0.5 max-h-[120px] overflow-y-auto custom-scrollbar">
                            {accsList.map(acc => (
                              <div key={acc.motherId}
                                className={`flex items-center justify-between py-0.5 border-b border-stone-850/50 ${acc.isCompatible ? 'text-stone-300' : 'text-stone-600 line-through opacity-50'}`}>
                                <span className="truncate flex items-center gap-1">
                                  {acc.isCompatible ? <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" /> : <XCircle className="w-2.5 h-2.5 text-red-500 shrink-0" />}
                                  {acc.roomName || acc.shortName}
                                </span>
                                <span className="font-mono text-[8px] font-bold">ID {acc.motherId}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── Area Gantt ──────────────────────────────────────────── */}
                    <div className="flex-1 relative overflow-hidden" style={{ height: `${ROW_HEIGHT}px` }}>
                      {activeViewTab === 'editor' ? (
                        <>
                          {periodsList.map(period => renderPlannedPeriodCard(plan, period, periodsList))}

                          {/* Tasto "+" dopo l'ultimo periodo */}
                          {(() => {
                            const lastPeriod = periodsList[periodsList.length - 1];
                            const plusLeft = lastPeriod
                              ? getGanttOffset(lastPeriod.dateFrom) + getGanttWidth(lastPeriod.dateFrom, lastPeriod.dateTo) + 8
                              : 8;
                            return (
                              <button type="button" onClick={() => addNextPlannedPeriod(plan.id)}
                                style={{ position: 'absolute', left: `${plusLeft}px`, top: '50%', transform: 'translateY(-50%)' }}
                                className="w-9 h-9 rounded-full border-2 border-red-500/80 bg-red-950/40 hover:bg-red-600 text-white font-black flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-110 z-10"
                                title="Aggiungi periodo">
                                <Plus className="w-4 h-4" />
                              </button>
                            );
                          })()}
                        </>
                      ) : (
                        <>
                          {!isLiveDataReady ? (
                            <div className="absolute inset-0 flex items-center px-4 gap-3 text-[10px] text-stone-400">
                              {isFetchingLive ? (
                                <>
                                  <RefreshCw className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
                                  <span className="font-mono text-sky-300 font-bold">Scaricamento dati live da Octorate in corso...</span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                                  <span className="font-mono text-stone-400">Nessun dato live caricato.</span>
                                  <button type="button" onClick={() => fetchLiveRestrictions()}
                                    className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 border border-emerald-500/50 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:scale-105">
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    <span>🔄 Clicca qui per scaricare / aggiornare i Dati Live Octorate</span>
                                  </button>
                                </>
                              )}
                            </div>
                          ) : (
                            (() => {
                              const livePeriods: PlannedPeriod[] = liveOctorateRestrictions[plan.id]?.length > 0
                                ? liveOctorateRestrictions[plan.id]
                                : [];
                              if (livePeriods.length === 0) {
                                return (
                                  <div className="absolute inset-0 flex items-center px-4 text-[9px] text-stone-500 font-mono">
                                    Nessun periodo live per questo piano.
                                  </div>
                                );
                              }
                              return livePeriods.map(period => renderLivePeriodCard(plan, period, periodsList));
                            })()
                          )}
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
