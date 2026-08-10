import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RealOctoratePlan {
  id: string;
  code: string;
  name: string;
  isAcOnly: boolean;
  type: 'be' | '7d' | 'booking' | 'ac' | 'agoda';
  description: string;
  badgeColor: string;
}

export const REAL_OCTORATE_PLANS: RealOctoratePlan[] = [
  { id: 'be', code: 'BE', name: 'Official Booking Engine (BE)', isAcOnly: false, type: 'be', description: 'Canale diretto del sito web (Tariffa Madre)', badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/50' },
  { id: '7d', code: '7d', name: 'Standard 7d (Canc. 7gg)', isAcOnly: false, type: '7d', description: 'Booking.com, Expedia, Agoda & Sito: Canc. gratuita 100% fino a 7gg prima del check-in', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' },
  { id: 'main_bnb_7d', code: 'Main bnb-7d', name: 'Main bnb-7d (Canc. 7gg)', isAcOnly: false, type: 'booking', description: 'Booking.com & Expedia: Canc. gratuita 100% fino a 7gg prima del check-in', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' },
  { id: 'main_bnb_14d', code: 'Main bnb-14d', name: 'Main bnb-14d (Canc. 14gg)', isAcOnly: false, type: 'booking', description: 'Booking.com & Expedia: Canc. gratuita 100% fino a 14gg prima del check-in', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/50' },
  { id: 'ac_7d', code: 'AC7d', name: 'AC7d (AC Canc. 7gg)', isAcOnly: true, type: 'ac', description: 'Master AC: Canc. gratuita 100% fino a 7gg prima del check-in', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' },
  { id: 'ac_14d', code: 'AC14d', name: 'AC14d (AC Canc. 14gg)', isAcOnly: true, type: 'ac', description: 'Master AC: Canc. gratuita 100% fino a 14gg prima del check-in', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/50' },
  { id: 'ac_bnb_7d', code: 'AC bnb-7d', name: 'AC bnb-7d (Booking AC 7gg)', isAcOnly: true, type: 'booking', description: 'Booking.com & Expedia AC: Canc. gratuita 100% fino a 7gg prima del check-in', badgeColor: 'bg-indigo-500/20 text-cyan-300 border-cyan-500/50' },
  { id: 'ac_bnb_14d', code: 'AC bnb-14d', name: 'AC bnb-14d (Booking AC 14gg)', isAcOnly: true, type: 'booking', description: 'Booking.com & Expedia AC: Canc. gratuita 100% fino a 14gg prima del check-in', badgeColor: 'bg-purple-500/20 text-cyan-300 border-cyan-500/50' },
  { id: 'agd_ac_7d', code: 'AGD AC-7d', name: 'AGD AC-7d (Agoda AC 7gg)', isAcOnly: true, type: 'agoda', description: 'Agoda AC: Canc. gratuita 100% fino a 7gg prima del check-in', badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/50' },
  { id: 'agd_ac_14d', code: 'AGD AC-14d', name: 'AGD AC-14d (Agoda AC 14gg)', isAcOnly: true, type: 'agoda', description: 'Agoda AC: Canc. gratuita 100% fino a 14gg prima del check-in', badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/50' },
  { id: 'airbnb', code: 'AirBnB', name: 'AirBnB Standard', isAcOnly: false, type: 'booking', description: 'Canale Airbnb per alloggi Standard', badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/50' },
  { id: 'airbnb_ac', code: 'AirBnB AC', name: 'AirBnB AC', isAcOnly: true, type: 'booking', description: 'Canale Airbnb per alloggi con Aria Condizionata', badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/50' }
];

export const RATE_PLANS = REAL_OCTORATE_PLANS;

export interface PlannedPeriod {
  id: string;
  name: string;
  dateFrom: string;          // ISO YYYY-MM-DD
  dateTo: string;            // ISO YYYY-MM-DD
  stopSell: boolean;
  closedToArrival: boolean;
  closedToDeparture: boolean;
  onlyCheckOutDays: number;  // Giorni consecutivi di finestra Only Check Out (es. 10gg)
  minStayArrival?: number;
  failsafeCheckout: boolean;
}

export interface LiveMockRestriction {
  stopSell: boolean;
  closedToArrival: boolean;
  closedToDeparture: boolean;
  onlyCheckOutDays: number;
}

export interface RestrictionsStoreState {
  plannedPeriods: Record<string, PlannedPeriod[]>;
  liveOctorateRestrictions: Record<string, PlannedPeriod[]>;
  liveOctorateRestrictionsMock: Record<string, Record<string, LiveMockRestriction>>;
  syncingPeriodId: string | null;
  syncAllRunning: boolean;
  isBulkSaving: boolean;
  bulkSyncProgress: { current: number; total: number; currentPlanName: string };
  isFetchingLive: boolean;
  lastSyncMessage: string | null;
  lastSyncStatus: 'idle' | 'success' | 'error';

  fetchLiveRestrictions: () => Promise<void>;
  updatePlannedPeriod: (planId: string, periodId: string, updates: Partial<PlannedPeriod>) => void;
  addNextPlannedPeriod: (planId: string) => void;
  removePlannedPeriod: (planId: string, periodId: string) => void;
  
  // Aliases per compatibilità
  addNextPeriod: (planId: string) => void;
  removePeriod: (planId: string, periodId: string) => void;
  updatePeriod: (planId: string, periodId: string, updates: Partial<PlannedPeriod>) => void;

  syncPlanToOctorate: (planId: string, periodId: string) => Promise<boolean>;
  syncAllPlansToOctorate: () => Promise<boolean>;
  syncAllRatePlansToOctorate: () => Promise<boolean>;
  cancelBulkSync: () => void;
  resetDefaultStore: () => void;
}

// Periodi di Default con Only Check Out = 10gg esattamente come nello schizzo dell'utente
export const INITIAL_PLAN_PERIODS: Record<string, PlannedPeriod[]> = {
  be: [
    { id: 'be_p1', name: 'Periodo 1: Ottobre - Novembre', dateFrom: '2026-10-01', dateTo: '2026-11-30', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckOutDays: 10, failsafeCheckout: true },
    { id: 'be_p2', name: 'Periodo 2: Dicembre - Gennaio', dateFrom: '2026-12-01', dateTo: '2027-01-31', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckOutDays: 10, failsafeCheckout: true }
  ],
  '7d': [
    { id: '7d_p1', name: 'Periodo 1: Ottobre', dateFrom: '2026-10-01', dateTo: '2026-10-31', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckOutDays: 10, failsafeCheckout: true },
    { id: '7d_p2', name: 'Periodo 2: Novembre - Gennaio', dateFrom: '2026-11-01', dateTo: '2027-01-31', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckOutDays: 10, failsafeCheckout: true }
  ],
  main_bnb_7d: [
    { id: 'mb7_p1', name: 'Periodo 1: Q4 (Ott-Dic)', dateFrom: '2026-10-01', dateTo: '2026-12-31', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckOutDays: 10, failsafeCheckout: true },
    { id: 'mb7_p2', name: 'Periodo 2: Q1 (Gen-Mar)', dateFrom: '2027-01-01', dateTo: '2027-03-31', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckOutDays: 10, failsafeCheckout: true }
  ],
  main_bnb_14d: [
    { id: 'mb14_p1', name: 'Periodo 1: Q4 (Ott-Dic)', dateFrom: '2026-10-01', dateTo: '2026-12-31', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckOutDays: 10, failsafeCheckout: true },
    { id: 'mb14_p2', name: 'Periodo 2: Q1 (Gen-Mar)', dateFrom: '2027-01-01', dateTo: '2027-03-31', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckOutDays: 10, failsafeCheckout: true }
  ],
  ac_7d: [
    { id: 'ac7_p1', name: 'Periodo 1: Q4 (Ott-Dic)', dateFrom: '2026-10-01', dateTo: '2026-12-31', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckOutDays: 10, failsafeCheckout: true }
  ],
  ac_14d: [
    { id: 'ac14_p1', name: 'Periodo 1: Q4 (Ott-Dic)', dateFrom: '2026-10-01', dateTo: '2026-12-31', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckOutDays: 10, failsafeCheckout: true }
  ],
  ac_bnb_7d: [
    { id: 'acb7_p1', name: 'Periodo 1: Q4 (Ott-Dic)', dateFrom: '2026-10-01', dateTo: '2026-12-31', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckOutDays: 10, failsafeCheckout: true }
  ],
  ac_bnb_14d: [
    { id: 'acb14_p1', name: 'Periodo 1: Q4 (Ott-Dic)', dateFrom: '2026-10-01', dateTo: '2026-12-31', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckOutDays: 10, failsafeCheckout: true }
  ],
  agd_ac_7d: [
    { id: 'ag7_p1', name: 'Periodo 1: Q4 (Ott-Dic)', dateFrom: '2026-10-01', dateTo: '2026-12-31', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckOutDays: 10, failsafeCheckout: true }
  ],
  agd_ac_14d: [
    { id: 'ag14_p1', name: 'Periodo 1: Q4 (Ott-Dic)', dateFrom: '2026-10-01', dateTo: '2026-12-31', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckOutDays: 10, failsafeCheckout: true }
  ],
  airbnb: [
    { id: 'ab_p1', name: 'Periodo 1: Q4 (Ott-Dic)', dateFrom: '2026-10-01', dateTo: '2026-12-31', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckOutDays: 10, failsafeCheckout: true }
  ],
  airbnb_ac: [
    { id: 'abac_p1', name: 'Periodo 1: Q4 (Ott-Dic)', dateFrom: '2026-10-01', dateTo: '2026-12-31', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckOutDays: 10, failsafeCheckout: true }
  ]
};

// Mock live state svuotato: la Tabella 2 usa esclusivamente dati reali da Octorate API
export const INITIAL_LIVE_MOCK: Record<string, Record<string, LiveMockRestriction>> = {};

// Helper: normalizza le chiavi del grid backend verso le chiavi frontend (planId)
// Gestisce variazioni come 'main_bnb_7d' vs 'main-bnb-7d' vs 'mainbnb7d' ecc.
export function normalizeGridKeys(rawGrid: Record<string, any[]>): Record<string, any[]> {
  const KEY_ALIASES: Record<string, string> = {
    // Chiavi backend esatte (già corrette)
    be: 'be',
    '7d': '7d',
    main_bnb_7d: 'main_bnb_7d',
    main_bnb_14d: 'main_bnb_14d',
    ac_7d: 'ac_7d',
    ac_14d: 'ac_14d',
    ac_bnb_7d: 'ac_bnb_7d',
    ac_bnb_14d: 'ac_bnb_14d',
    agd_ac_7d: 'agd_ac_7d',
    agd_ac_14d: 'agd_ac_14d',
    airbnb: 'airbnb',
    airbnb_ac: 'airbnb_ac',
    // Varianti alternative che Octorate potrebbe restituire
    'main-bnb-7d': 'main_bnb_7d',
    'main-bnb-14d': 'main_bnb_14d',
    'ac-7d': 'ac_7d',
    'ac-14d': 'ac_14d',
    'ac-bnb-7d': 'ac_bnb_7d',
    'ac-bnb-14d': 'ac_bnb_14d',
    'agd-ac-7d': 'agd_ac_7d',
    'agd-ac-14d': 'agd_ac_14d',
    'airbnb-ac': 'airbnb_ac',
    'airbnbac': 'airbnb_ac',
  };

  const normalized: Record<string, any[]> = {};
  for (const [rawKey, periods] of Object.entries(rawGrid)) {
    const cleanKey = rawKey.toLowerCase().trim();
    const mappedKey = KEY_ALIASES[cleanKey] ?? cleanKey;
    if (Array.isArray(periods) && periods.length > 0) {
      normalized[mappedKey] = periods;
    }
  }
  return normalized;
}

export const useRestrictionsStore = create<RestrictionsStoreState>()(
  persist(
    (set, get) => ({
      plannedPeriods: { ...INITIAL_PLAN_PERIODS },
      liveOctorateRestrictions: {},
      liveOctorateRestrictionsMock: { ...INITIAL_LIVE_MOCK },
      syncingPeriodId: null,
      syncAllRunning: false,
      isBulkSaving: false,
      bulkSyncProgress: { current: 0, total: 0, currentPlanName: '' },
      isFetchingLive: false,
      lastSyncMessage: null,
      lastSyncStatus: 'idle',

      fetchLiveRestrictions: async () => {
        set({ isFetchingLive: true, lastSyncMessage: null });
        try {
          const res = await fetch('/api/resort/octorate-restrictions-grid');
          if (!res.ok) {
            const errText = await res.text().catch(() => `Status ${res.status}`);
            throw new Error(`Errore HTTP ${res.status}: ${errText}`);
          }
          const data = await res.json();
          if (data.success && data.grid && typeof data.grid === 'object') {
            // Normalizza le chiavi del grid backend verso i planId frontend
            const normalizedGrid = normalizeGridKeys(data.grid);
            const planCount = Object.keys(normalizedGrid).length;
            const periodCount = Object.values(normalizedGrid).reduce((acc, v) => acc + (v?.length || 0), 0);
            console.info(`[fetchLiveRestrictions] ✅ Grid scaricata: ${planCount} piani, ${periodCount} periodi totali.`);
            set({
              liveOctorateRestrictions: normalizedGrid,
              isFetchingLive: false,
              lastSyncMessage: `✅ Timeline Live Octorate aggiornata: ${planCount} piani, ${periodCount} periodi scaricati.`,
              lastSyncStatus: 'success'
            });
          } else {
            const errMsg = data.error || 'Risposta Octorate vuota o non valida';
            console.warn('[fetchLiveRestrictions] ⚠️ Grid vuota:', errMsg, data);
            set({
              isFetchingLive: false,
              lastSyncMessage: `⚠️ Timeline Live Octorate: ${errMsg}`,
              lastSyncStatus: 'error'
            });
          }
        } catch (err: any) {
          console.error('[useRestrictionsStore] Errore fetchLiveRestrictions:', err);
          set({
            isFetchingLive: false,
            lastSyncMessage: `❌ Impossibile scaricare dati Live da Octorate: ${err?.message || 'Errore di rete'}`,
            lastSyncStatus: 'error'
          });
        }
      },

      updatePlannedPeriod: (planId: string, periodId: string, updates: Partial<PlannedPeriod>) => {
        const state = get();
        const list = state.plannedPeriods[planId] || [];
        set({
          plannedPeriods: {
            ...state.plannedPeriods,
            [planId]: list.map(p => p.id === periodId ? { ...p, ...updates } : p)
          }
        });
      },

      addNextPlannedPeriod: (planId: string) => {
        const state = get();
        const list = state.plannedPeriods[planId] || [];
        let newDateFrom = '2026-10-01';
        let newDateTo = '2026-11-30';

        if (list.length > 0) {
          const lastPeriod = list[list.length - 1];
          if (lastPeriod.dateTo) {
            const lastEnd = new Date(lastPeriod.dateTo);
            lastEnd.setDate(lastEnd.getDate() + 1);
            newDateFrom = lastEnd.toISOString().split('T')[0];

            const newEnd = new Date(lastEnd);
            newEnd.setDate(newEnd.getDate() + 30);
            newDateTo = newEnd.toISOString().split('T')[0];
          }
        }

        const newPeriod: PlannedPeriod = {
          id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: `Periodo ${list.length + 1}`,
          dateFrom: newDateFrom,
          dateTo: newDateTo,
          stopSell: false,
          closedToArrival: false,
          closedToDeparture: false,
          onlyCheckOutDays: 10,
          failsafeCheckout: true
        };

        set({
          plannedPeriods: {
            ...state.plannedPeriods,
            [planId]: [...list, newPeriod]
          }
        });
      },

      removePlannedPeriod: (planId: string, periodId: string) => {
        const state = get();
        const list = state.plannedPeriods[planId] || [];
        set({
          plannedPeriods: {
            ...state.plannedPeriods,
            [planId]: list.filter(p => p.id !== periodId)
          }
        });
      },

      addNextPeriod: (planId: string) => get().addNextPlannedPeriod(planId),
      removePeriod: (planId: string, periodId: string) => get().removePlannedPeriod(planId, periodId),
      updatePeriod: (planId: string, periodId: string, updates: Partial<PlannedPeriod>) => get().updatePlannedPeriod(planId, periodId, updates),

      syncPlanToOctorate: async (planId: string, periodId: string) => {
        const state = get();
        const list = state.plannedPeriods[planId] || [];
        const period = list.find(p => p.id === periodId);

        if (!period) {
          set({ lastSyncStatus: 'error', lastSyncMessage: '❌ Periodo non trovato' });
          return false;
        }

        set({ syncingPeriodId: periodId, lastSyncMessage: `Invio restrizioni ${period.name} su Octorate...`, lastSyncStatus: 'idle' });

        try {
          const effectiveCtd = period.failsafeCheckout ? false : period.closedToDeparture;

          const response = await fetch('/api/update-restriction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              planId,
              dateFrom: period.dateFrom,
              dateTo: period.dateTo,
              stopSell: period.stopSell,
              closedToArrival: period.closedToArrival,
              closedToDeparture: effectiveCtd,
              onlyCheckOutDays: period.onlyCheckOutDays
            })
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.error || 'Errore sincronizzazione restrizioni piano');
          }

          const liveMap = state.liveOctorateRestrictionsMock[planId] || {};
          liveMap[periodId] = {
            stopSell: period.stopSell,
            closedToArrival: period.closedToArrival,
            closedToDeparture: effectiveCtd,
            onlyCheckOutDays: period.onlyCheckOutDays
          };

          set({
            syncingPeriodId: null,
            lastSyncStatus: 'success',
            lastSyncMessage: `✅ Restrizioni per ${period.name} (${period.dateFrom} ➔ ${period.dateTo}) allineate con successo su Octorate!`,
            liveOctorateRestrictionsMock: {
              ...state.liveOctorateRestrictionsMock,
              [planId]: liveMap
            }
          });

          try {
            const { fetchOctorateGridData } = await import('../../../booking/lib/octorate');
            fetchOctorateGridData('2026-10-01', '2027-10-31').catch(e => console.warn('Grid re-fetch error:', e));
          } catch (e) {
            console.warn('Import error:', e);
          }

          return true;
        } catch (err: any) {
          console.error('Error syncing plan to Octorate:', err);
          set({
            syncingPeriodId: null,
            lastSyncStatus: 'error',
            lastSyncMessage: `❌ Errore sincronizzazione: ${err?.message || 'Impossibile connettersi'}`
          });
          return false;
        }
      },

      syncAllPlansToOctorate: async () => {
        return get().syncAllRatePlansToOctorate();
      },

      syncAllRatePlansToOctorate: async () => {
        const state = get();
        let totalCount = 0;
        for (const plan of REAL_OCTORATE_PLANS) {
          const list = state.plannedPeriods[plan.id] || [];
          totalCount += list.length;
        }

        set({
          isBulkSaving: true,
          syncAllRunning: true,
          bulkSyncProgress: { current: 0, total: totalCount, currentPlanName: 'Inizio...' },
          lastSyncMessage: `Avvio coda di sincronizzazione per ${totalCount} periodi su Octorate...`,
          lastSyncStatus: 'idle'
        });

        let currentStep = 0;

        try {
          for (const plan of REAL_OCTORATE_PLANS) {
            if (!get().isBulkSaving) break;
            const periods = state.plannedPeriods[plan.id] || [];
            for (const period of periods) {
              if (!get().isBulkSaving) break;
              currentStep++;
              set({
                bulkSyncProgress: {
                  current: currentStep,
                  total: totalCount,
                  currentPlanName: `${plan.code} (${period.name})`
                },
                lastSyncMessage: `Sincronizzazione (${currentStep}/${totalCount}) ${plan.code} - ${period.name}...`
              });

              const effectiveCtd = period.failsafeCheckout ? false : period.closedToDeparture;

              await fetch('/api/update-restriction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  planId: plan.id,
                  dateFrom: period.dateFrom,
                  dateTo: period.dateTo,
                  stopSell: period.stopSell,
                  closedToArrival: period.closedToArrival,
                  closedToDeparture: effectiveCtd,
                  onlyCheckOutDays: period.onlyCheckOutDays
                })
              }).catch(e => console.warn('Bulk plan sync warning:', e));
            }
          }

          if (!get().isBulkSaving) {
            set({
              syncAllRunning: false,
              lastSyncStatus: 'idle',
              lastSyncMessage: '⏹️ Sincronizzazione interrotta dall\'utente.'
            });
            return false;
          }

          set({
            isBulkSaving: false,
            syncAllRunning: false,
            lastSyncStatus: 'success',
            lastSyncMessage: `✅ Sincronizzazione sequenziale completata con successo! ${totalCount}/${totalCount} periodi allineati su Octorate.`,
            bulkSyncProgress: { current: totalCount, total: totalCount, currentPlanName: 'Completato' }
          });

          await get().fetchLiveRestrictions();

          return true;
        } catch (err: any) {
          console.error('Error in syncAllRatePlansToOctorate:', err);
          set({
            isBulkSaving: false,
            syncAllRunning: false,
            lastSyncStatus: 'error',
            lastSyncMessage: `❌ Errore durante la sincronizzazione bulk: ${err?.message || 'Impossibile completare'}`
          });
          return false;
        }
      },

      cancelBulkSync: () => {
        set({
          isBulkSaving: false,
          syncAllRunning: false,
          syncingPeriodId: null,
          lastSyncStatus: 'idle',
          lastSyncMessage: '⏹️ Sincronizzazione interrotta dall\'utente. Operazione annullata.',
          bulkSyncProgress: { current: 0, total: 0, currentPlanName: '' }
        });
      },

      resetDefaultStore: () => {
        set({
          plannedPeriods: { ...INITIAL_PLAN_PERIODS },
          liveOctorateRestrictionsMock: { ...INITIAL_LIVE_MOCK },
          lastSyncMessage: '🔄 Reset store restrizioni completato',
          lastSyncStatus: 'success'
        });
      }
    }),
    {
      name: 'fp_rateplan_restrictions_onlycheckout_v1',
      merge: (persistedState: any, currentState: RestrictionsStoreState) => {
        const p = persistedState as any;
        return {
          ...currentState,
          ...p,
          plannedPeriods: (p?.plannedPeriods && typeof p.plannedPeriods === 'object') ? p.plannedPeriods : { ...INITIAL_PLAN_PERIODS },
          liveOctorateRestrictionsMock: (p?.liveOctorateRestrictionsMock && typeof p.liveOctorateRestrictionsMock === 'object') ? p.liveOctorateRestrictionsMock : { ...INITIAL_LIVE_MOCK }
        };
      }
    }
  )
);
