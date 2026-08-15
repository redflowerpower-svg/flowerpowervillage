import React, { useState, useEffect } from 'react';
import { formatDisplayDate, parseDisplayDateToISO } from '../../../lib/dateUtils';
import { useRestrictionsStore, REAL_OCTORATE_PLANS, RealOctoratePlan, PlannedPeriod, INITIAL_PLAN_PERIODS } from '../store/useRestrictionsStore-v17';
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
  LogOut,
  FlaskConical,
  Download,
  Calendar,
  Activity,
  Wrench
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
    return Math.max(1, daysBetween(s, e) + 1) * PX_PER_DAY;
  } catch { return 60; }
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
  const liveViewMode = store?.liveViewMode ?? 'prod';
  const setLiveViewMode = store?.setLiveViewMode || (() => {});
  const disabledRatePlans = store?.disabledRatePlans || [];
  const toggleRatePlanActive = store?.toggleRatePlanActive || (() => {});

  const fetchLiveRestrictions = store?.fetchLiveRestrictions || (async () => {});
  const updatePlannedPeriod = store?.updatePlannedPeriod || store?.updatePeriod || (() => {});
  const addNextPlannedPeriod = store?.addNextPlannedPeriod || store?.addNextPeriod || (() => {});
  const insertPlannedPeriodRelative = store?.insertPlannedPeriodRelative || (() => {});
  const removePlannedPeriod = store?.removePlannedPeriod || store?.removePeriod || (() => {});
  const syncPlanToOctorate = store?.syncPlanToOctorate || (async () => false);
  const syncAllRatePlansToOctorate = store?.syncAllRatePlansToOctorate || store?.syncAllPlansToOctorate || (async () => false);
  const cancelBulkSync = store?.cancelBulkSync || (() => {});
  const resetDefaultStore = store?.resetDefaultStore || (() => {});
  const importConfig = store?.importConfig || (() => ({ success: true, message: '' }));
  const resetPreferences = store?.resetPreferences || {
    stopSells: true,
    closed: true,
    closedArrival: true,
    closedDeparture: true,
    minStay: true
  };
  const setResetPreference = store?.setResetPreference || (() => {});
  const tabulaRasaDateFrom = store?.tabulaRasaDateFrom || '2026-10-01';
  const tabulaRasaDateTo = store?.tabulaRasaDateTo || '2027-10-31';
  const setTabulaRasaDateRange = store?.setTabulaRasaDateRange || (() => {});
  const testMode = store?.testMode ?? true;
  const setTestMode = store?.setTestMode || (() => {});

  const [expandedAccommodations, setExpandedAccommodations] = useState<Record<string, boolean>>({});
  const [activeViewTab, setActiveViewTab] = useState<'editor' | 'comparison'>('editor');
  const [addingRelativePeriodId, setAddingRelativePeriodId] = useState<string | null>(null);
  const [deletingPeriodId, setDeletingPeriodId] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [showTestModal, setShowTestModal] = useState<boolean>(false);
  const [showProdWarningModal, setShowProdWarningModal] = useState<boolean>(false);
  const [isResetOptionsOpen, setIsResetOptionsOpen] = useState<boolean>(false);

  // Stati per la conferma a doppia pressione (3s timer)
  const [confirmingSingleSyncId, setConfirmingSingleSyncId] = useState<string | null>(null);
  const [confirmingBulkSync, setConfirmingBulkSync] = useState<boolean>(false);
  const [confirmingTestSync, setConfirmingTestSync] = useState<boolean>(false);
  const [confirmingCopyLive, setConfirmingCopyLive] = useState<boolean>(false);

  // Auto-allineamento iniziale con la configurazione speculare di Tabella 2 (Octorate Live)
  useEffect(() => {
    const p7d = rawPeriods?.['7d'];
    const p14d = rawPeriods?.['main_bnb_14d'];
    if (!p7d || p7d.length < 3 || !p14d || p14d.length < 3) {
      resetDefaultStore();
    }
  }, [rawPeriods, resetDefaultStore]);

  const singleSyncTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const bulkSyncTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const testSyncTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const copyLiveTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSingleSyncClick = (planId: string, periodId: string) => {
    if (confirmingSingleSyncId === periodId) {
      if (singleSyncTimerRef.current) clearTimeout(singleSyncTimerRef.current);
      setConfirmingSingleSyncId(null);
      syncPlanToOctorate(planId, periodId);
    } else {
      if (singleSyncTimerRef.current) clearTimeout(singleSyncTimerRef.current);
      setConfirmingSingleSyncId(periodId);
      singleSyncTimerRef.current = setTimeout(() => {
        setConfirmingSingleSyncId(null);
      }, 3000);
    }
  };

  const handleSyncDerivateTest = () => {
    if (confirmingTestSync) {
      if (testSyncTimerRef.current) clearTimeout(testSyncTimerRef.current);
      setConfirmingTestSync(false);
      setTestMode(true);
      syncAllRatePlansToOctorate({ testOnly: true });
    } else {
      if (testSyncTimerRef.current) clearTimeout(testSyncTimerRef.current);
      setConfirmingTestSync(true);
      testSyncTimerRef.current = setTimeout(() => {
        setConfirmingTestSync(false);
      }, 3000);
    }
  };

  const handleSyncDerivateProd = () => {
    setShowProdWarningModal(true);
  };

  const handleCopyLiveClick = () => {
    if (confirmingCopyLive) {
      if (copyLiveTimerRef.current) clearTimeout(copyLiveTimerRef.current);
      setConfirmingCopyLive(false);
      handleCopyLiveToPlanned();
    } else {
      if (copyLiveTimerRef.current) clearTimeout(copyLiveTimerRef.current);
      setConfirmingCopyLive(true);
      copyLiveTimerRef.current = setTimeout(() => {
        setConfirmingCopyLive(false);
      }, 3500);
    }
  };

  const handleCopyLiveToPlanned = () => {
    const live = liveOctorateRestrictions;
    if (!live || Object.keys(live).length === 0) {
      importConfig(INITIAL_PLAN_PERIODS);
      return;
    }
    const cloned: Record<string, PlannedPeriod[]> = {};
    for (const [planId, periods] of Object.entries(live)) {
      if (Array.isArray(periods) && periods.length > 0) {
        cloned[planId] = periods.map((p, idx) => ({
          id: `${planId}_p${idx + 1}`,
          name: p.name || (p.stopSell ? 'Stop Sell (Chiuso)' : `Periodo ${idx + 1}`),
          dateFrom: p.dateFrom,
          dateTo: p.dateTo,
          stopSell: Boolean(p.stopSell || p.strategy === 'stopsell'),
          closedToArrival: Boolean(p.closedToArrival),
          closedToDeparture: Boolean(p.closedToDeparture),
          onlyCheckOutDays: p.onlyCheckOutDays ?? (p.onlyCheckoutDays ?? 0),
          failsafeCheckout: Boolean((p.onlyCheckOutDays ?? 0) > 0)
        }));
      }
    }
    importConfig({ ...INITIAL_PLAN_PERIODS, ...cloned });
  };

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
  }, []); // eseguito solo al mount

  // ─────────────────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────
  // CARD TABELLA 1 — Layout fluido (Altezza compattata)
  // ─────────────────────────────────────────────────────────────────────────────
  const renderPlannedPeriodCard = (plan: RealOctoratePlan, period: PlannedPeriod, periodsList: PlannedPeriod[]) => {
    const isSyncing = syncingPeriodId === period.id;
    const leftPx = getGanttOffset(period.dateFrom);
    const widthPx = getGanttWidth(period.dateFrom, period.dateTo);
    const isSmall = widthPx < 145;
    const isTiny = widthPx < 95;

    let isMismatched = false;
    if (isComparing) {
      const liveForPlan = liveOctorateRestrictions[plan.id] || [];
      const liveMatch = liveForPlan.find((lp: PlannedPeriod) => lp.dateFrom === period.dateFrom && lp.dateTo === period.dateTo)
        || liveForPlan.find((lp: PlannedPeriod) => lp.dateFrom <= period.dateTo && lp.dateTo >= period.dateFrom);

      if (liveMatch) {
        const planOutDays = period.onlyCheckoutDays ?? period.onlyCheckOutDays ?? 0;
        const liveOutDays = liveMatch.onlyCheckoutDays ?? liveMatch.onlyCheckOutDays ?? 0;
        const planStop = Boolean(period.stopSell || period.strategy === 'stopsell');
        const liveStop = Boolean(liveMatch.stopSell || liveMatch.strategy === 'stopsell');
        isMismatched = liveStop !== planStop
          || liveOutDays !== planOutDays
          || liveMatch.dateFrom !== period.dateFrom
          || liveMatch.dateTo !== period.dateTo;
      } else if (liveForPlan.length > 0) {
        isMismatched = true;
      }
    }

    const isFailsafe = Boolean(period.failsafeCheckout || period.closedToArrival || period.strategy === 'failsafe_checkout' || period.name?.toLowerCase().includes('only check-out'));
    const hasWeldedCta = Boolean((period.onlyCheckoutDays ?? period.onlyCheckOutDays ?? 0) > 0);
    const roundedClass = hasWeldedCta ? 'rounded-l-2xl rounded-r-none border-r-0' : 'rounded-2xl';

    const theme = RATE_PLAN_COLORS[plan.id] || {
      badgeBg: 'bg-stone-800', badgeText: 'text-stone-300', badgeBorder: 'border-stone-700',
      cardBg: 'bg-stone-950/80', cardBorder: 'border-stone-800', cardText: 'text-stone-200', dateText: 'text-red-300'
    };

    let cardBg = `${theme.cardBg} ${theme.cardBorder} hover:border-stone-600 shadow-md ${theme.cardText}`;
    if (period.stopSell) {
      cardBg = `${theme.cardBg} ${theme.cardBorder} shadow-md ${theme.cardText}`;
    }

    if (isMismatched) {
      cardBg = 'bg-yellow-950/90 border-yellow-400 ring-2 ring-yellow-400/90 shadow-[0_0_15px_rgba(250,204,21,0.8)] text-yellow-200';
    }

    return (
      <div
        key={period.id}
        style={{ position: 'absolute', left: `${leftPx}px`, width: `${widthPx}px`, top: '2px', bottom: '2px' }}
        className={`${roundedClass} border backdrop-blur-md transition-all overflow-hidden flex items-start p-1 select-none ${cardBg}`}
      >
        <div style={{ width: '100%', maxWidth: '148px' }} className="flex flex-col gap-0.5 min-w-0">

          {/* Riga 1: Titolo + pulsanti */}
          <div className="flex items-center justify-between gap-0.5 h-3.5 min-w-0">
            <input
              type="text"
              value={period.name}
              title="Nome del periodo programmato (modificabile)"
              onChange={e => updatePlannedPeriod(plan.id, period.id, { name: e.target.value })}
              className={`bg-transparent font-extrabold text-white ${isSmall ? 'text-[7.5px]' : 'text-[8.5px]'} focus:outline-none truncate flex-1 min-w-0`}
            />
            <div className="relative flex items-center gap-0.5 shrink-0">
              {/* Tasto "+" per inserire prima o dopo */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAddingRelativePeriodId(addingRelativePeriodId === period.id ? null : period.id);
                }}
                className={`w-3.5 h-3.5 flex items-center justify-center p-0 border rounded cursor-pointer transition-all ${
                  addingRelativePeriodId === period.id
                    ? 'bg-amber-500 text-stone-950 border-amber-300 font-black ring-1 ring-amber-300'
                    : 'bg-stone-900 hover:bg-emerald-950 text-emerald-400 border-stone-800 hover:border-emerald-600'
                }`}
                title="➕ Inserisci nuovo modulo prima o dopo questo periodo (spostando gli altri)"
              >
                <Plus className="w-2 h-2" />
              </button>

              {/* Tasto Refresh / Singola Sincronizzazione */}
              <button
                type="button"
                onClick={() => handleSingleSyncClick(plan.id, period.id)}
                disabled={isSyncing}
                className={`w-3.5 h-3.5 flex items-center justify-center p-0 border rounded cursor-pointer transition-all ${
                  confirmingSingleSyncId === period.id
                    ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 border-amber-300 font-bold animate-pulse ring-1 ring-amber-300'
                    : 'bg-red-950 hover:bg-red-900 text-red-300 border-red-700/50'
                }`}
                title={confirmingSingleSyncId === period.id ? 'Clicca di nuovo per confermare la sincronizzazione' : '🔄 Sincronizza questo singolo periodo su Octorate'}
              >
                {confirmingSingleSyncId === period.id ? (
                  <span className="text-[5px] font-black uppercase text-stone-950">OK</span>
                ) : (
                  <RefreshCw className={`w-2 h-2 ${isSyncing ? 'animate-spin text-white' : ''}`} />
                )}
              </button>

              {/* Tasto Elimina */}
              {!isTiny && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAddingRelativePeriodId(null);
                    setDeletingPeriodId(deletingPeriodId === period.id ? null : period.id);
                  }}
                  className={`w-3.5 h-3.5 flex items-center justify-center p-0 border rounded cursor-pointer transition-all ${
                    deletingPeriodId === period.id
                      ? 'bg-red-600 text-white border-red-400 font-bold ring-1 ring-red-400'
                      : 'bg-stone-900 hover:bg-red-950 text-stone-400 hover:text-red-300 border-stone-800 hover:border-red-700'
                  }`}
                  title="🗑️ Elimina questo periodo dalla pianificazione"
                >
                  <Trash2 className="w-2 h-2" />
                </button>
              )}

              {/* Popover di Scelta Inserimento Prima / Dopo */}
              {addingRelativePeriodId === period.id && (
                <div
                  className="absolute right-0 top-5 bg-stone-900/98 backdrop-blur-md border border-amber-500/60 rounded-xl p-1.5 shadow-2xl z-50 flex flex-col gap-1 min-w-[125px] animate-in fade-in zoom-in duration-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-[7px] font-black text-amber-300 uppercase tracking-wider px-0.5 flex items-center justify-between">
                    <span>➕ Inserisci Modulo:</span>
                    <button 
                      type="button" 
                      onClick={() => setAddingRelativePeriodId(null)}
                      className="text-stone-400 hover:text-white text-[9px] leading-none px-0.5 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        insertPlannedPeriodRelative(plan.id, period.id, 'before');
                        setAddingRelativePeriodId(null);
                      }}
                      className="flex-1 px-1.5 py-1 rounded bg-sky-950 hover:bg-sky-800 text-sky-200 border border-sky-600 hover:border-sky-400 text-[8px] font-extrabold transition-all text-center cursor-pointer shadow"
                      title="Inserisci 30gg prima di questo modulo (spostando tutti i successivi in avanti)"
                    >
                      ◀ Prima
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        insertPlannedPeriodRelative(plan.id, period.id, 'after');
                        setAddingRelativePeriodId(null);
                      }}
                      className="flex-1 px-1.5 py-1 rounded bg-emerald-950 hover:bg-emerald-800 text-emerald-200 border border-emerald-600 hover:border-emerald-400 text-[8px] font-extrabold transition-all text-center cursor-pointer shadow"
                      title="Inserisci 30gg dopo questo modulo (spostando tutti i successivi in avanti)"
                    >
                      Dopo ▶
                    </button>
                  </div>
                </div>
              )}

              {/* Popover di Scelta Eliminazione con Trascinamento */}
              {deletingPeriodId === period.id && (
                <div
                  className="absolute right-0 top-5 bg-stone-900/98 backdrop-blur-md border border-red-500/60 rounded-xl p-1.5 shadow-2xl z-50 flex flex-col gap-1 min-w-[155px] animate-in fade-in zoom-in duration-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-[7px] font-black text-red-300 uppercase tracking-wider px-0.5 flex items-center justify-between">
                    <span>🗑️ Elimina periodo:</span>
                    <button 
                      type="button" 
                      onClick={() => setDeletingPeriodId(null)}
                      className="text-stone-400 hover:text-white text-[9px] leading-none px-0.5 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex flex-col gap-1 mt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        removePlannedPeriod(plan.id, period.id, { shiftSubsequent: true });
                        setDeletingPeriodId(null);
                      }}
                      className="w-full px-1.5 py-1 rounded bg-red-950/90 hover:bg-red-800 text-red-200 border border-red-600/80 hover:border-red-400 text-[7.5px] font-extrabold transition-all text-left flex items-center gap-1.5 cursor-pointer shadow"
                      title="Elimina questo periodo e trascina indietro tutti i successivi per riempire lo spazio vuoto"
                    >
                      <span>🧲</span>
                      <span className="truncate">Trascina a seguire</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        removePlannedPeriod(plan.id, period.id, { shiftSubsequent: false });
                        setDeletingPeriodId(null);
                      }}
                      className="w-full px-1.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 hover:border-stone-500 text-[7.5px] font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer shadow"
                      title="Elimina solo questo modulo lasciando le date degli altri invariate"
                    >
                      <span>❌</span>
                      <span className="truncate">Solo questo modulo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Riga 2: Inizio (etichetta integrata nel box data) */}
          <div
            className="relative cursor-pointer min-w-0"
            title="📅 Data di Inizio Periodo (Click per aprire il calendario)"
            onClick={e => {
              const inputEl = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement;
              if (inputEl) try { inputEl.showPicker?.(); } catch {}
            }}
          >
            <div className="flex items-center justify-between bg-stone-950/80 border border-stone-800 rounded px-1 py-0.5 text-[8px] min-w-0">
              <span className="text-[5px] font-black uppercase text-stone-500 shrink-0 mr-0.5">
                {isSmall ? 'IN' : 'INIZIO'}
              </span>
              <span className={`font-mono font-bold ${theme.dateText} truncate text-center flex-1 ${isSmall ? 'text-[7.5px]' : 'text-[8.5px]'}`}>
                {formatDisplayDate(period.dateFrom)}
              </span>
            </div>
            <input
              type="date"
              value={period.dateFrom || ''}
              onChange={e => { if (e.target.value) updatePlannedPeriod(plan.id, period.id, { dateFrom: e.target.value }); }}
              onClick={e => (e.currentTarget as any).showPicker?.()}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>

          {/* Riga 3: Fine (etichetta integrata nel box data) */}
          <div
            className="relative cursor-pointer min-w-0"
            title="📅 Data di Fine Periodo (Click per aprire il calendario)"
            onClick={e => {
              const inputEl = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement;
              if (inputEl) try { inputEl.showPicker?.(); } catch {}
            }}
          >
            <div className="flex items-center justify-between bg-stone-950/80 border border-stone-800 rounded px-1 py-0.5 text-[8px] min-w-0">
              <span className="text-[5px] font-black uppercase text-stone-500 shrink-0 mr-0.5">
                {isSmall ? 'OUT' : 'FINE'}
              </span>
              <span className={`font-mono font-bold ${theme.dateText} truncate text-center flex-1 ${isSmall ? 'text-[7.5px]' : 'text-[8.5px]'}`}>
                {formatDisplayDate(period.dateTo)}
              </span>
            </div>
            <input
              type="date"
              value={period.dateTo || ''}
              onChange={e => { if (e.target.value) updatePlannedPeriod(plan.id, period.id, { dateTo: e.target.value }); }}
              onClick={e => (e.currentTarget as any).showPicker?.()}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>

          {/* Riga 4: Only CO oppure Badge Stop Sell */}
          {period.stopSell ? (
            isSmall ? (
              <div className="flex items-center justify-between gap-0.5 pt-0.5 min-w-0">
                <div
                  title="🛑 STOP SELL: Vendite bloccate per questo periodo"
                  className="flex items-center justify-center gap-1 flex-1 bg-red-950/80 border border-red-600/80 rounded px-1 py-0.5 text-red-300 font-extrabold text-[7.5px] uppercase shadow-sm tracking-wide min-w-0"
                >
                  <XCircle className="w-2 h-2 text-red-400 shrink-0" />
                  <span className="truncate">STOP SELL</span>
                </div>
                <button
                  type="button"
                  onClick={() => updatePlannedPeriod(plan.id, period.id, { stopSell: false, name: 'Apertura Standard (OK)' })}
                  title="🛑 Stop Sell Attivo: Clicca per riaprire le vendite (OPEN)"
                  className="px-1 py-0.5 rounded font-black text-[6.5px] uppercase shrink-0 transition-all cursor-pointer bg-red-950 border border-red-600 text-red-300 hover:bg-emerald-950 hover:border-emerald-600 hover:text-emerald-300"
                >
                  BLOK
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-0.5 pt-0.5 min-w-0">
                <div
                  title="🛑 STOP SELL (Chiuso): Vendite bloccate per questo periodo"
                  className="flex items-center justify-between flex-1 bg-red-950/80 border border-red-600/80 rounded px-1.5 py-0.5 text-red-300 font-extrabold text-[8.5px] uppercase shadow-sm tracking-wide min-w-0"
                >
                  <span className="flex items-center gap-1 truncate">
                    <XCircle className="w-2.5 h-2.5 text-red-400 shrink-0" /> STOP SELL
                  </span>
                  <span className="text-[7px] font-mono font-bold bg-red-900/60 px-1 py-0.2 rounded text-red-200 shrink-0">
                    CHIUSO
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => updatePlannedPeriod(plan.id, period.id, { stopSell: false, name: 'Apertura Standard (OK)' })}
                  title="🛑 Stop Sell Attivo: Clicca per riaprire le vendite (OPEN)"
                  className="px-1 py-0.5 rounded font-black text-[6.5px] uppercase shrink-0 transition-all cursor-pointer bg-red-950 border border-red-600 text-red-300 hover:bg-emerald-950 hover:border-emerald-600 hover:text-emerald-300"
                >
                  BLOK
                </button>
              </div>
            )
          ) : (
            <div className="flex items-center justify-between gap-1 pt-0.5 min-w-0 h-4">
              <div
                className="flex items-center gap-1 min-w-0 flex-1 cursor-help"
                title="🚪 Finestra Only Check-Out (CTA): Giorni cuscinetto successivi alla data di fine in cui sono consentite solo le partenze (Closed to Arrival)"
              >
                <LogOut className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                <input 
                  type="number"
                  min="0"
                  max="30"
                  value={period.onlyCheckoutDays ?? period.onlyCheckOutDays ?? 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    updatePlannedPeriod(plan.id, period.id, { 
                      onlyCheckoutDays: val, 
                      onlyCheckOutDays: val,
                      failsafeCheckout: val > 0 
                    });
                  }}
                  className="w-7 h-4 text-center text-[9px] bg-stone-900 border border-amber-500/50 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded px-0.5 py-0 text-amber-300 font-black font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shrink-0"
                />
                <span className="text-[7px] font-bold text-amber-300/90 whitespace-nowrap leading-none">
                  {isSmall ? 'gg CO' : 'gg Only Check-Out'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => updatePlannedPeriod(plan.id, period.id, { stopSell: true, name: 'Stop Sell (Chiuso)' })}
                title="🟢 Vendite Aperte: Clicca per bloccare con Stop Sell (BLOK)"
                className="px-1 py-0.5 h-4 flex items-center justify-center rounded font-black text-[6.5px] uppercase shrink-0 transition-all cursor-pointer bg-stone-900 border border-stone-800 text-stone-400 hover:bg-red-950 hover:border-red-600 hover:text-red-300"
              >
                OPEN
              </button>
            </div>
          )}

        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // CARD TABELLA 2 — Live Octorate (Grafica Identica a Tabella 1)
  // ─────────────────────────────────────────────────────────────────────────────
  const renderLivePeriodCard = (plan: RealOctoratePlan, period: PlannedPeriod, periodsList: PlannedPeriod[]) => {
    const leftPx = getGanttOffset(period.dateFrom);
    const widthPx = getGanttWidth(period.dateFrom, period.dateTo);
    const isSmall = widthPx < 145;

    const isStopSell = Boolean(period.strategy === 'stopsell' || period.stopSell);
    const outDays = period.onlyCheckoutDays ?? period.onlyCheckOutDays ?? 0;
    const hasWeldedCta = outDays > 0;
    const roundedClass = hasWeldedCta ? 'rounded-l-2xl rounded-r-none border-r-0' : 'rounded-2xl';

    let isMismatched = false;
    const planMatch = periodsList.find((p: PlannedPeriod) => p.dateFrom === period.dateFrom && p.dateTo === period.dateTo)
      || periodsList.find((p: PlannedPeriod) => p.dateFrom <= period.dateTo && p.dateTo >= period.dateFrom);

    if (planMatch) {
      const planOutDays = planMatch.onlyCheckoutDays ?? planMatch.onlyCheckOutDays ?? 0;
      const planStop = Boolean(planMatch.stopSell || planMatch.strategy === 'stopsell');
      isMismatched = planStop !== isStopSell
        || planOutDays !== outDays
        || planMatch.dateFrom !== period.dateFrom
        || planMatch.dateTo !== period.dateTo;
    } else if (periodsList.length > 0) {
      isMismatched = true;
    }
    const isMatching = !isMismatched;

    const theme = RATE_PLAN_COLORS[plan.id] || {
      badgeBg: 'bg-stone-800', badgeText: 'text-stone-300', badgeBorder: 'border-stone-700',
      cardBg: 'bg-stone-950/80', cardBorder: 'border-stone-800', cardText: 'text-stone-200', dateText: 'text-red-300'
    };

    let cardBg = `${theme.cardBg} ${theme.cardBorder} hover:border-stone-600 shadow-md ${theme.cardText}`;
    if (isStopSell) {
      cardBg = `${theme.cardBg} ${theme.cardBorder} shadow-md ${theme.cardText}`;
    }

    if (isComparing && isMismatched) {
      cardBg = 'bg-yellow-950/90 border-yellow-400 ring-2 ring-yellow-400/90 shadow-[0_0_15px_rgba(250,204,21,0.8)] text-yellow-200';
    }

    return (
      <div
        key={period.id}
        style={{ position: 'absolute', left: `${leftPx}px`, width: `${widthPx}px`, top: '2px', bottom: '2px' }}
        className={`${roundedClass} border backdrop-blur-md transition-all overflow-hidden flex items-start p-1 select-none ${cardBg}`}
      >
        <div style={{ width: '100%', maxWidth: '148px' }} className="flex flex-col gap-0.5 min-w-0">

          {/* Riga 1: Titolo + badge allineamento */}
          <div className="flex items-center justify-between gap-0.5 h-3.5 min-w-0">
            <span
              title={`Periodo Live su Octorate: ${period.name}`}
              className={`font-extrabold text-white ${isSmall ? 'text-[7.5px]' : 'text-[8.5px]'} truncate flex-1 min-w-0 cursor-default`}
            >
              {period.name || (isStopSell ? 'Stop Sell (Chiuso)' : 'Apertura Standard (OK)')}
            </span>
            <span
              title={
                isMatching
                  ? '✅ Allineato: La configurazione Live su Octorate corrisponde esattamente alla pianificazione'
                  : '⚠️ Discrepanza: La configurazione Live su Octorate differisce dalla pianificazione'
              }
              className={`text-[6px] font-black px-1 py-0.2 rounded border shrink-0 cursor-help ${
                isMatching ? 'bg-emerald-950 border-emerald-700 text-emerald-300' : 'bg-amber-950 border-amber-700 text-amber-300'
              }`}
            >
              {isMatching ? '✓' : '!'}
            </span>
          </div>

          {/* Riga 2: Inizio */}
          <div
            title="📅 Data di Inizio effettiva su Octorate"
            className="flex items-center justify-between bg-stone-950/80 border border-stone-800 rounded px-1 py-0.5 text-[8px] min-w-0 cursor-default"
          >
            <span className="text-[5px] font-black uppercase text-stone-500 shrink-0 mr-0.5">
              {isSmall ? 'IN' : 'INIZIO'}
            </span>
            <span className={`font-mono font-bold ${theme.dateText} truncate text-center flex-1 ${isSmall ? 'text-[7.5px]' : 'text-[8.5px]'}`}>
              {formatDisplayDate(period.dateFrom)}
            </span>
          </div>

          {/* Riga 3: Fine */}
          <div
            title="📅 Data di Fine effettiva su Octorate"
            className="flex items-center justify-between bg-stone-950/80 border border-stone-800 rounded px-1 py-0.5 text-[8px] min-w-0 cursor-default"
          >
            <span className="text-[5px] font-black uppercase text-stone-500 shrink-0 mr-0.5">
              {isSmall ? 'OUT' : 'FINE'}
            </span>
            <span className={`font-mono font-bold ${theme.dateText} truncate text-center flex-1 ${isSmall ? 'text-[7.5px]' : 'text-[8.5px]'}`}>
              {formatDisplayDate(period.dateTo)}
            </span>
          </div>

          {/* Riga 4: Only CO oppure Badge Stop Sell */}
          {isStopSell ? (
            isSmall ? (
              <div className="flex items-center justify-between gap-0.5 pt-0.5 min-w-0">
                <div
                  title="🛑 STOP SELL: Vendite bloccate su Octorate per questo periodo"
                  className="flex items-center justify-center gap-1 flex-1 bg-red-950/80 border border-red-600/80 rounded px-1 py-0.5 text-red-300 font-extrabold text-[7.5px] uppercase shadow-sm tracking-wide min-w-0"
                >
                  <XCircle className="w-2 h-2 text-red-400 shrink-0" />
                  <span className="truncate">STOP SELL</span>
                </div>
                <div
                  title="🛑 Stop Sell Attivo"
                  className="px-1 py-0.5 rounded font-black text-[6.5px] uppercase shrink-0 bg-red-950 border border-red-600 text-red-300"
                >
                  BLOK
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-0.5 pt-0.5 min-w-0">
                <div
                  title="🛑 STOP SELL (Chiuso): Vendite bloccate su Octorate per questo periodo"
                  className="flex items-center justify-between flex-1 bg-red-950/80 border border-red-600/80 rounded px-1.5 py-0.5 text-red-300 font-extrabold text-[8.5px] uppercase shadow-sm tracking-wide min-w-0"
                >
                  <span className="flex items-center gap-1 truncate">
                    <XCircle className="w-2.5 h-2.5 text-red-400 shrink-0" /> STOP SELL
                  </span>
                  <span className="text-[7px] font-mono font-bold bg-red-900/60 px-1 py-0.2 rounded text-red-200 shrink-0">
                    CHIUSO
                  </span>
                </div>
                <div
                  title="🛑 Stop Sell Attivo"
                  className="px-1 py-0.5 rounded font-black text-[6.5px] uppercase shrink-0 bg-red-950 border border-red-600 text-red-300"
                >
                  BLOK
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center justify-between gap-1 pt-0.5 min-w-0 h-4">
              <div
                className="flex items-center gap-1 min-w-0 flex-1 cursor-help"
                title="🚪 Finestra Only Check-Out (CTA): Giorni cuscinetto successivi alla data di fine"
              >
                <LogOut className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                <div className="w-7 h-4 flex items-center justify-center text-[9px] bg-stone-900 border border-amber-500/50 rounded px-0.5 py-0 text-amber-300 font-black font-mono shrink-0">
                  {outDays}
                </div>
                <span className="text-[7px] font-bold text-amber-300/90 whitespace-nowrap leading-none">
                  {isSmall ? 'gg CO' : 'gg Only Check-Out'}
                </span>
              </div>
              <div
                title="🟢 Vendite Aperte"
                className="px-1 py-0.5 h-4 flex items-center justify-center rounded font-black text-[6.5px] uppercase shrink-0 bg-stone-900 border border-stone-800 text-emerald-400"
              >
                OPEN
              </div>
            </div>
          )}

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
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Gestione Tariffe Derivate
                </h2>
                <p className="text-stone-400 text-xs font-medium">
                  Gantt proporzionale (6px/giorno) · finestra Only Check Out · posizionamento assoluto continuo
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap xl:flex-nowrap">
            {/* 1. Tab Toggle (Viste) */}
            <div className="bg-stone-950 p-1 rounded-2xl border border-stone-800 flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setActiveViewTab('editor')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeViewTab === 'editor' ? 'bg-red-600 text-white shadow-md' : 'text-stone-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Timeline Pianificata</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveViewTab('comparison');
                  fetchLiveRestrictions();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeViewTab === 'comparison' ? 'bg-emerald-600 text-white shadow-md' : 'text-stone-400 hover:text-white'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetchingLive ? 'animate-spin text-white' : ''}`} />
                <span>Timeline Live Octorate</span>
              </button>
            </div>

            {/* 2. Sincronizzazione o Interruzione */}
            {(isBulkSaving || syncAllRunning) ? (
              <button
                type="button"
                onClick={() => cancelBulkSync()}
                className="py-2 px-4 bg-red-800 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg flex items-center gap-1.5 cursor-pointer ring-2 ring-red-400 animate-pulse whitespace-nowrap shrink-0"
              >
                <XCircle className="w-3.5 h-3.5 text-white" />
                <span>Interrompi</span>
              </button>
            ) : (
              <>
                {/* SYNC DERIVATE TEST */}
                <button
                  type="button"
                  onClick={handleSyncDerivateTest}
                  disabled={syncingPeriodId !== null}
                  className={`py-2 px-3.5 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50 border shrink-0 ${
                    confirmingTestSync
                      ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 border-amber-300 ring-2 ring-amber-300 animate-pulse font-extrabold'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-emerald-950'
                  }`}
                  title="Sincronizza tutti i piani sui Fake Bungalows di Test"
                >
                  <Zap className={`w-3.5 h-3.5 ${confirmingTestSync ? 'text-stone-950' : 'text-yellow-300'}`} />
                  <span>
                    {confirmingTestSync ? 'CONFERMI SYNC TEST?' : 'SYNC DERIVATE TEST'}
                  </span>
                </button>

                {/* SYNC DERIVATE PRODUZIONE */}
                <button
                  type="button"
                  onClick={handleSyncDerivateProd}
                  disabled={syncingPeriodId !== null}
                  className="py-2 px-3.5 bg-red-600 hover:bg-red-500 text-white border border-red-400 shadow-red-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50 shrink-0"
                  title="⚠️ ATTENZIONE: Sincronizza tutti i piani sui Bungalow Reali in PRODUZIONE!"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-300" />
                  <span>SYNC DERIVATE PRODUZIONE</span>
                </button>
              </>
            )}

            {/* 3. Reset Defaults (PER ULTIMO) */}
            <button
              type="button"
              onClick={resetDefaultStore}
              className="py-2 px-3 bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-700 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow whitespace-nowrap shrink-0"
              title="Ripristina le restrizioni predefinite iniziali"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
              <span>Reset Defaults</span>
            </button>
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

      {/* OPZIONI DI RESET PREVENTIVO (TABULA RASA) */}
      <div className="bg-stone-900/90 border border-stone-800 backdrop-blur-xl rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 overflow-hidden">
        {/* Header Semplice e Cliccabile a Scomparsa */}
        <button
          type="button"
          onClick={() => setIsResetOptionsOpen(!isResetOptionsOpen)}
          className="w-full flex items-center justify-between text-left cursor-pointer select-none"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Wrench className="w-4 h-4 text-violet-400" />
              <span>Opzioni di Reset Preventivo (Tabula Rasa)</span>
            </span>
            <span className="text-[10px] text-stone-400 bg-stone-950 px-2.5 py-0.5 rounded-full border border-stone-800 font-mono">
              {formatDisplayDate(tabulaRasaDateFrom)} → {formatDisplayDate(tabulaRasaDateTo)}
            </span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-mono font-bold flex items-center gap-1 ${
              testMode
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
                : 'bg-red-950/80 text-red-200 border-red-600/50'
            }`}>
              {testMode ? <FlaskConical className="w-3 h-3 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 text-red-400" />}
              <span>{testMode ? 'TEST (Fake)' : 'PRODUZIONE'}</span>
            </span>
          </div>
          <span className="text-violet-400 text-xs font-mono font-bold hover:underline">
            {isResetOptionsOpen ? '▲ Chiudi Opzioni' : '▼ Mostra Opzioni'}
          </span>
        </button>

        {/* Cassetto a Scomparsa con Data Picker, Mode Toggle e Checkbox */}
        {isResetOptionsOpen && (
          <div className="pt-4 border-t border-stone-800/80 space-y-4 animate-in fade-in duration-200">
            {/* Controlli di Configurazione: Date Range e Destinazione */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border bg-stone-950/80 border-stone-800">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-sky-400" />
                  <span>Periodo Reset:</span>
                </span>
                <div className="flex items-center gap-1.5 bg-stone-900 px-2.5 py-1 rounded-xl border border-stone-700 text-xs font-mono">
                  <input
                    type="date"
                    value={tabulaRasaDateFrom}
                    onChange={(e) => setTabulaRasaDateRange(e.target.value, tabulaRasaDateTo)}
                    className="bg-transparent text-sky-300 font-bold text-xs focus:outline-none cursor-pointer"
                    title="Data Inizio Reset Preventivo (Tabula Rasa)"
                  />
                  <span className="text-stone-500 font-bold">→</span>
                  <input
                    type="date"
                    value={tabulaRasaDateTo}
                    onChange={(e) => setTabulaRasaDateRange(tabulaRasaDateFrom, e.target.value)}
                    className="bg-transparent text-sky-300 font-bold text-xs focus:outline-none cursor-pointer"
                    title="Data Fine Reset Preventivo (Tabula Rasa)"
                  />
                </div>
              </div>

              {/* Selettore Destinazione: Test vs Produzione */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-400">Destinazione:</span>
                <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-700">
                  <button
                    type="button"
                    onClick={() => setTestMode(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                      testMode
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Test Fake</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (testMode) {
                        setShowProdWarningModal(true);
                      } else {
                        setTestMode(false);
                      }
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                      !testMode
                        ? 'bg-red-600 text-white shadow-md animate-pulse'
                        : 'text-stone-400 hover:text-red-300'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Produzione Reale</span>
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-400 font-medium">
              Seleziona quali flag e restrizioni ripristinare all&apos;avvio della sincronizzazione su Octorate prima di applicare le finestre pianificate:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Checkbox 1: stopSells */}
              <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                resetPreferences.stopSells 
                  ? 'bg-violet-950/30 border-violet-500/50 text-violet-200 shadow-sm' 
                  : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:border-stone-700'
              }`}>
                <input
                  type="checkbox"
                  checked={Boolean(resetPreferences.stopSells)}
                  onChange={(e) => setResetPreference('stopSells', e.target.checked)}
                  className="w-4 h-4 rounded border-stone-600 text-violet-600 focus:ring-violet-500 bg-stone-800 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-stone-200">Sblocca Vendite</span>
                  <span className="text-[10px] text-stone-400 font-mono">stopSells: false</span>
                </div>
              </label>

              {/* Checkbox 2: closed */}
              <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                resetPreferences.closed 
                  ? 'bg-violet-950/30 border-violet-500/50 text-violet-200 shadow-sm' 
                  : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:border-stone-700'
              }`}>
                <input
                  type="checkbox"
                  checked={Boolean(resetPreferences.closed)}
                  onChange={(e) => setResetPreference('closed', e.target.checked)}
                  className="w-4 h-4 rounded border-stone-600 text-violet-600 focus:ring-violet-500 bg-stone-800 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-stone-200">Riapri Tariffe</span>
                  <span className="text-[10px] text-stone-400 font-mono">closed: false</span>
                </div>
              </label>

              {/* Checkbox 3: closedArrival */}
              <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                resetPreferences.closedArrival 
                  ? 'bg-violet-950/30 border-violet-500/50 text-violet-200 shadow-sm' 
                  : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:border-stone-700'
              }`}>
                <input
                  type="checkbox"
                  checked={Boolean(resetPreferences.closedArrival)}
                  onChange={(e) => setResetPreference('closedArrival', e.target.checked)}
                  className="w-4 h-4 rounded border-stone-600 text-violet-600 focus:ring-violet-500 bg-stone-800 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-stone-200">Consenti Arrivi</span>
                  <span className="text-[10px] text-stone-400 font-mono">closedArrival: false</span>
                </div>
              </label>

              {/* Checkbox 4: closedDeparture */}
              <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                resetPreferences.closedDeparture 
                  ? 'bg-violet-950/30 border-violet-500/50 text-violet-200 shadow-sm' 
                  : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:border-stone-700'
              }`}>
                <input
                  type="checkbox"
                  checked={Boolean(resetPreferences.closedDeparture)}
                  onChange={(e) => setResetPreference('closedDeparture', e.target.checked)}
                  className="w-4 h-4 rounded border-stone-600 text-violet-600 focus:ring-violet-500 bg-stone-800 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-stone-200">Consenti Partenze</span>
                  <span className="text-[10px] text-stone-400 font-mono">closedDeparture: false</span>
                </div>
              </label>

              {/* Checkbox 5: minStay */}
              <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                resetPreferences.minStay 
                  ? 'bg-violet-950/30 border-violet-500/50 text-violet-200 shadow-sm' 
                  : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:border-stone-700'
              }`}>
                <input
                  type="checkbox"
                  checked={Boolean(resetPreferences.minStay)}
                  onChange={(e) => setResetPreference('minStay', e.target.checked)}
                  className="w-4 h-4 rounded border-stone-600 text-violet-600 focus:ring-violet-500 bg-stone-800 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-stone-200">Ripristina MinStay a 1</span>
                  <span className="text-[10px] text-stone-400 font-mono">minStay: 1</span>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ── Matrice Timeline Gantt ─────────────────────────────────────────────── */}
      <div className="bg-stone-900/90 border border-stone-800 backdrop-blur-xl rounded-3xl p-5 shadow-2xl space-y-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className={`w-3 h-3 rounded-full shadow-md ${activeViewTab === 'editor' ? 'bg-red-400' : 'bg-emerald-400'}`} />
            <h3 className="text-xs sm:text-sm font-black text-white tracking-tight uppercase">
              {activeViewTab === 'editor'
                ? 'TABELLA 1: TIMELINE GANTT — RESTRIZIONI PIANIFICATE'
                : 'TABELLA 2: TIMELINE GANTT — RESTRIZIONI LIVE OCTORATE'}
            </h3>

            {/* Toggle Live Mode per Tabella 2 */}
            {activeViewTab === 'comparison' && (
              <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-2xl border border-stone-800 ml-1">
                <button
                  type="button"
                  onClick={() => {
                    setLiveViewMode('prod');
                    fetchLiveRestrictions();
                  }}
                  className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                    liveViewMode === 'prod'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] ring-1 ring-emerald-400'
                      : 'text-stone-400 hover:text-white border border-transparent'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Live Reale (Produzione)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLiveViewMode('test');
                    fetchLiveRestrictions();
                  }}
                  className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                    liveViewMode === 'test'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)] ring-1 ring-amber-400'
                      : 'text-stone-400 hover:text-white border border-transparent'
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Live Test (Fake Bungalow)</span>
                </button>
              </div>
            )}

            {/* Evidenzia Discrepanze */}
            <button
              type="button"
              onClick={() => setIsComparing(!isComparing)}
              className={`py-1.5 px-3 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 border shadow ${
                isComparing
                  ? 'bg-yellow-400 text-stone-950 border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-pulse'
                  : 'bg-stone-800 hover:bg-stone-750 text-amber-300 border-amber-600/40'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isComparing ? 'Discrepanze Attive' : 'Evidenzia Discrepanze'}</span>
            </button>

            {/* Copia da Tabella 2 a Timeline Pianificata */}
            <button
              type="button"
              onClick={handleCopyLiveClick}
              title={confirmingCopyLive ? 'Clicca di nuovo per confermare la sovrascrittura della Timeline Pianificata con i dati di Tabella 2' : "Copia e sincronizza l'intera configurazione Live di Octorate nella Timeline Pianificata"}
              className={`py-1.5 px-3 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer border shadow ${
                confirmingCopyLive
                  ? 'bg-amber-500 text-stone-950 border border-amber-300 ring-2 ring-amber-300 animate-pulse font-extrabold'
                  : 'bg-sky-950/80 hover:bg-sky-900 text-sky-200 border border-sky-600/60 hover:scale-105'
              }`}
            >
              <Download className={`w-3.5 h-3.5 ${confirmingCopyLive ? 'text-stone-950' : 'text-sky-400'}`} />
              <span>{confirmingCopyLive ? 'Confermi Copia a Timeline Pianificata?' : 'Copia da Tabella 2 a Timeline Pianificata'}</span>
            </button>
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
                const isPlanDisabled = disabledRatePlans.includes(plan.id);
                const accsList = getAccommodationsForPlan(plan);
                const theme = RATE_PLAN_COLORS[plan.id] || {
                  badgeBg: 'bg-stone-800', badgeText: 'text-stone-300', badgeBorder: 'border-stone-700',
                  cardBg: 'bg-stone-950/80', cardBorder: 'border-stone-800', cardText: 'text-stone-200', dateText: 'text-emerald-300'
                };

                return (
                  <div key={plan.id} className="flex items-stretch hover:bg-stone-850/40 transition-colors group">

                    {/* ── Colonna Sinistra Sticky ────────────────────────────── */}
                    <div className={`w-[280px] min-w-[280px] p-3 sticky left-0 z-20 bg-stone-950 group-hover:bg-stone-900 border-r border-stone-850 flex flex-col justify-between space-y-2 transition-all ${
                      isPlanDisabled ? 'opacity-50 grayscale-[30%]' : ''
                    }`}>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                              {plan.code}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRatePlanActive(plan.id);
                              }}
                              className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider transition-all cursor-pointer border shadow-sm ${
                                isPlanDisabled
                                  ? 'bg-stone-900 text-stone-500 border-stone-800 hover:text-stone-300 hover:border-stone-700'
                                  : 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60 hover:bg-emerald-900 hover:text-emerald-300'
                              }`}
                              title={isPlanDisabled ? 'Clicca per attivare la tariffa' : 'Clicca per disattivare la tariffa'}
                            >
                              {isPlanDisabled ? 'OFF' : 'ON'}
                            </button>
                          </div>
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
                    <div className={`flex-1 relative overflow-hidden transition-all ${isPlanDisabled ? 'opacity-50 grayscale-[30%]' : ''}`} style={{ height: `${ROW_HEIGHT}px` }}>
                      {activeViewTab === 'editor' ? (
                        <>
                          {periodsList.map(period => {
                            const outDays = period.onlyCheckoutDays ?? period.onlyCheckOutDays ?? 0;
                            return (
                              <React.Fragment key={period.id}>
                                {renderPlannedPeriodCard(plan, period, periodsList)}
                                {outDays > 0 && (
                                  <div 
                                    className="flex-shrink-0 rounded-r-2xl rounded-l-none border border-l-0 border-amber-400 bg-amber-950/90 p-1 flex flex-col justify-center items-center text-center transition-all select-none overflow-hidden z-10 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-500/50" 
                                    style={{
                                      position: 'absolute',
                                      left: `${getGanttOffset(period.dateFrom) + getGanttWidth(period.dateFrom, period.dateTo)}px`,
                                      width: `${outDays * PX_PER_DAY}px`,
                                      top: '2px',
                                      bottom: '2px'
                                    }} 
                                  >
                                    <div className="text-[9px] text-yellow-300 font-black leading-none select-none drop-shadow-sm">ONLY</div>
                                    <div className="text-[9px] text-yellow-300 font-black leading-none mt-1 select-none drop-shadow-sm">CHECK</div>
                                    <div className="text-[9px] text-yellow-300 font-black leading-none mt-1 select-none drop-shadow-sm">OUT</div>
                                    <div className="text-[10px] font-mono font-black text-amber-200 mt-2 leading-none select-none drop-shadow">{outDays} GG</div>
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          })}

                          {/* Tasto "+" dopo l'ultimo periodo */}
                          {(() => {
                            const lastPeriod = periodsList[periodsList.length - 1];
                            const lastOutDays = lastPeriod ? (lastPeriod.onlyCheckoutDays ?? lastPeriod.onlyCheckOutDays ?? 0) : 0;
                            const lastCtaWidth = lastOutDays > 0 ? (lastOutDays * PX_PER_DAY) : 0;
                            const plusLeft = lastPeriod
                              ? getGanttOffset(lastPeriod.dateFrom) + getGanttWidth(lastPeriod.dateFrom, lastPeriod.dateTo) + lastCtaWidth + 8
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
                          {/* 📡 TABELLA 2: DATI LIVE DA OCTORATE */}
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
                              return livePeriods.map(period => {
                                const outDays = period.onlyCheckoutDays ?? period.onlyCheckOutDays ?? 0;
                                return (
                                  <React.Fragment key={period.id}>
                                    {renderLivePeriodCard(plan, period, periodsList)}
                                    {outDays > 0 && (
                                      <div 
                                        className="flex-shrink-0 rounded-r-2xl rounded-l-none border border-l-0 border-amber-400 bg-amber-950/90 p-1 flex flex-col justify-center items-center text-center transition-all select-none overflow-hidden z-10 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-500/50" 
                                        style={{
                                          position: 'absolute',
                                          left: `${getGanttOffset(period.dateFrom) + getGanttWidth(period.dateFrom, period.dateTo)}px`,
                                          width: `${outDays * PX_PER_DAY}px`,
                                          top: '2px',
                                          bottom: '2px'
                                        }} 
                                      >
                                        <div className="text-[9px] text-yellow-300 font-black leading-none select-none drop-shadow-sm">ONLY</div>
                                        <div className="text-[9px] text-yellow-300 font-black leading-none mt-1 select-none drop-shadow-sm">CHECK</div>
                                        <div className="text-[9px] text-yellow-300 font-black leading-none mt-1 select-none drop-shadow-sm">OUT</div>
                                        <div className="text-[10px] font-mono font-black text-amber-200 mt-2 leading-none select-none drop-shadow">{outDays} GG</div>
                                      </div>
                                    )}
                                  </React.Fragment>
                                );
                              });
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
      {/* Modale di conferma TEST SYNC */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-950/80 border border-amber-700/50 rounded-2xl text-amber-400 shrink-0">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">🧪 Conferma Test Sincronizzazione</h3>
                <p className="text-stone-300 text-xs leading-relaxed font-medium">
                  Sei sicuro di voler avviare la sincronizzazione di prova SOLO sui <strong className="text-amber-300 font-bold">Fake Bungalows 1 e 2</strong>?
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 rounded-xl text-xs font-extrabold uppercase transition-all cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTestModal(false);
                  syncAllRatePlansToOctorate({ testOnly: true });
                }}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-black uppercase tracking-wide transition-all shadow-lg cursor-pointer"
              >
                Conferma Test
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ⚠️ MODALE DI SICUREZZA BLOCCANTE PER PASSAGGIO A PRODUZIONE */}
      {showProdWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in zoom-in duration-150">
          <div className="bg-stone-900 border-2 border-red-500 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-white">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-2xl">
                <AlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-white uppercase">
                  Attivazione Produzione Reale
                </h3>
                <span className="text-xs text-red-300 font-mono">Richiesta di conferma esplicita</span>
              </div>
            </div>

            <div className="bg-red-950/40 border border-red-600/50 rounded-2xl p-4 space-y-2 text-xs text-red-200">
              <p className="font-bold text-sm text-red-100">
                Stai per uscire dalla modalità di simulazione protetta.
              </p>
              <p>
                In <strong>PRODUZIONE REALE</strong>, qualsiasi operazione di <em>Tabula Rasa</em>, sincronizzazione periodi o Stop Sell modificherà istantaneamente i calendari dei <strong>Bungalow Reali</strong> del Flower Power Village su Octorate e su tutte le OTA (Booking.com, Agoda, Expedia, Airbnb).
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
                  syncAllRatePlansToOctorate({ testOnly: false });
                }}
                className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl hover:shadow-red-600/50 flex items-center gap-2 cursor-pointer border border-red-400 animate-pulse"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confermo, Sincronizza in Produzione Reale</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default GestioneRestrizioniCanali;
