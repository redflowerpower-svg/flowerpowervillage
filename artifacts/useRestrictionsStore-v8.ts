import { create } from 'zustand';

export interface PlannedPeriod {
  id: string;
  dateFrom: string; // YYYY-MM-DD
  dateTo: string;   // YYYY-MM-DD
  onlyCheckoutDays: number; // Giorni di "Only CheckOut"
  strategy: 'failsafe_checkout' | 'open' | 'stopsell';
}

export interface RatePlanDef {
  key: string;
  label: string;
  fullName: string;
  agencies: string;
}

export const RATE_PLANS: RatePlanDef[] = [
  { key: 'be', label: 'BE', fullName: 'Official Booking Engine (BE)', agencies: 'Canale: Website' },
  { key: '7d', label: '7d', fullName: 'Standard 7d (Canc. 7gg)', agencies: 'Canali: Booking.com - Agoda - Expedia' },
  { key: 'main_bnb_7d', label: 'Main bnb-7d', fullName: 'Main bnb-7d (Canc. 7gg)', agencies: 'Canale Booking.com' },
  { key: 'main_bnb_14d', label: 'Main bnb-14d', fullName: 'Main bnb-14d (Canc. 14gg)', agencies: 'Canale Booking.com' },
  { key: 'ac_7d', label: 'AC7d', fullName: 'AC 7d (Aria Condizionata Inclusa)', agencies: 'Canali: Booking.com - Expedia' },
  { key: 'ac_14d', label: 'AC14d', fullName: 'AC 14d (Aria Condizionata Inclusa)', agencies: 'Canali: Booking.com - Expedia' },
  { key: 'ac_bnb_7d', label: 'AC bnb-7d', fullName: 'AC bnb-7d (AC + Colazione 7gg)', agencies: 'Canale: Booking.com' },
  { key: 'ac_bnb_14d', label: 'AC bnb-14d', fullName: 'AC bnb-14d (AC + Colazione 14gg)', agencies: 'Canale: Booking.com' },
  { key: 'agoda_ac_7d', label: 'AGD AC-7d', fullName: 'Agoda AC 7d (Aria Condizionata Inclusa)', agencies: 'Canale: Agoda' },
  { key: 'agoda_ac_14d', label: 'AGD AC-14d', fullName: 'Agoda AC 14d (Aria Condizionata Inclusa)', agencies: 'Canale: Agoda' },
  { key: 'airbnb', label: 'AirBnB', fullName: 'AirBnB (Standard)', agencies: 'Canale: Airbnb' },
  { key: 'airbnb_ac', label: 'AirBnB AC', fullName: 'AirBnB AC (Aria Condizionata Inclusa)', agencies: 'Canale: Airbnb' }
];

export const REAL_OCTORATE_PLANS = RATE_PLANS;

export const addDay = (dateStr: string, days: number = 1): string => {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const date = new Date(y, m, d);
  date.setDate(date.getDate() + days);
  
  const resY = date.getFullYear();
  const resM = String(date.getMonth() + 1).padStart(2, '0');
  const resD = String(date.getDate()).padStart(2, '0');
  return `${resY}-${resM}-${resD}`;
};

// Generatore di periodi di default ottimizzato in un blocco memoizzato esterno allo stato di reattività
let memoizedDefaultPeriods: Record<string, PlannedPeriod[]> | null = null;
const generateDefaultPeriods = (): Record<string, PlannedPeriod[]> => {
  if (memoizedDefaultPeriods) return memoizedDefaultPeriods;
  
  const initial: Record<string, PlannedPeriod[]> = {};
  
  initial['be'] = [
    { id: 'be_p1', dateFrom: '2026-10-01', dateTo: '2026-11-30', onlyCheckoutDays: 10, strategy: 'failsafe_checkout' },
    { id: 'be_p2', dateFrom: '2026-12-01', dateTo: '2027-01-31', onlyCheckoutDays: 10, strategy: 'failsafe_checkout' }
  ];

  initial['7d'] = [
    { id: '7d_p1', dateFrom: '2026-10-01', dateTo: '2026-10-31', onlyCheckoutDays: 10, strategy: 'failsafe_checkout' },
    { id: '7d_p2', dateFrom: '2026-11-01', dateTo: '2027-01-31', onlyCheckoutDays: 10, strategy: 'failsafe_checkout' }
  ];

  initial['main_bnb_7d'] = [
    { id: 'main_bnb_7d_p1', dateFrom: '2026-10-01', dateTo: '2026-12-21', onlyCheckoutDays: 10, strategy: 'failsafe_checkout' },
    { id: 'main_bnb_7d_p2', dateFrom: '2027-01-15', dateTo: '2027-03-31', onlyCheckoutDays: 10, strategy: 'failsafe_checkout' }
  ];

  initial['main_bnb_14d'] = [
    { id: 'main_bnb_14d_p1', dateFrom: '2026-12-21', dateTo: '2027-01-15', onlyCheckoutDays: 10, strategy: 'failsafe_checkout' }
  ];

  RATE_PLANS.forEach(rp => {
    if (!initial[rp.key]) {
      initial[rp.key] = [
        { id: `${rp.key}_p1`, dateFrom: '2026-10-01', dateTo: '2026-11-30', onlyCheckoutDays: 10, strategy: 'failsafe_checkout' },
        { id: `${rp.key}_p2`, dateFrom: '2026-12-01', dateTo: '2027-01-31', onlyCheckoutDays: 10, strategy: 'failsafe_checkout' }
      ];
    }
  });

  memoizedDefaultPeriods = initial;
  return initial;
};

let memoizedLiveOctorate: Record<string, PlannedPeriod[]> | null = null;
const generateDefaultLiveOctorate = (): Record<string, PlannedPeriod[]> => {
  if (memoizedLiveOctorate) return memoizedLiveOctorate;
  
  const initial: Record<string, PlannedPeriod[]> = {};
  
  initial['be'] = [
    { id: 'be_live_p1', dateFrom: '2026-10-01', dateTo: '2026-11-30', onlyCheckoutDays: 10, strategy: 'failsafe_checkout' },
    { id: 'be_live_p2', dateFrom: '2026-12-01', dateTo: '2027-01-31', onlyCheckoutDays: 10, strategy: 'failsafe_checkout' }
  ];

  initial['7d'] = [
    { id: '7d_live_p1', dateFrom: '2026-10-01', dateTo: '2026-10-31', onlyCheckoutDays: 10, strategy: 'failsafe_checkout' },
    { id: '7d_live_p2', dateFrom: '2026-11-01', dateTo: '2027-01-15', onlyCheckoutDays: 5, strategy: 'failsafe_checkout' }
  ];

  initial['main_bnb_7d'] = [
    { id: 'main_bnb_7d_live_p1', dateFrom: '2026-10-01', dateTo: '2026-12-21', onlyCheckoutDays: 10, strategy: 'failsafe_checkout' },
    { id: 'main_bnb_7d_live_p2', dateFrom: '2027-01-15', dateTo: '2027-03-31', onlyCheckoutDays: 10, strategy: 'failsafe_checkout' }
  ];

  initial['main_bnb_14d'] = [
    { id: 'main_bnb_14d_live_p1', dateFrom: '2026-12-21', dateTo: '2027-01-15', onlyCheckoutDays: 10, strategy: 'failsafe_checkout' }
  ];

  RATE_PLANS.forEach(rp => {
    if (!initial[rp.key]) {
      initial[rp.key] = [
        { id: `${rp.key}_live_p1`, dateFrom: '2026-10-01', dateTo: '2026-11-30', onlyCheckoutDays: 10, strategy: 'failsafe_checkout' },
        { id: `${rp.key}_live_p2`, dateFrom: '2026-12-01', dateTo: '2027-01-31', onlyCheckoutDays: 10, strategy: 'failsafe_checkout' }
      ];
    }
  });

  memoizedLiveOctorate = initial;
  return initial;
};

export interface RestrictionsState {
  plannedPeriods: Record<string, PlannedPeriod[]>;
  liveOctorateRestrictions: Record<string, PlannedPeriod[]>;
  isSaving: boolean;
  isBulkSaving: boolean;
  bulkSyncProgress: { current: number; total: number 
  saveDraftBackup: () => void;
  restoreDraftBackup: () => { success: boolean; message: string };
  importConfig: (periods: Record<string, PlannedPeriod[]>) => { success: boolean; message: string };
};
  isComparing: boolean;
  setIsComparing: (val: boolean) => void;
  updatePlannedPeriod: (ratePlanKey: string, index: number, updated: Partial<PlannedPeriod>) => void;
  addNextPlannedPeriod: (ratePlanKey: string) => void;
  removePlannedPeriod: (ratePlanKey: string, index: number) => void;
  syncRatePlanToOctorate: (ratePlanKey: string, index: number) => Promise<{ success: boolean; message: string }>;
  syncAllRatePlansToOctorate: () => Promise<{ success: boolean; message: string }>;
  fetchLiveRestrictions: () => Promise<void>;
}

export const useRestrictionsStore = create<RestrictionsState>((set, get) => ({
  plannedPeriods: JSON.parse(localStorage.getItem('fpv_planned_restrictions_v7') || 'null') || generateDefaultPeriods(),
  liveOctorateRestrictions: generateDefaultLiveOctorate(),
  isSaving: false,
  isBulkSaving: false,
  bulkSyncProgress: { current: 0, total: 0 },
  isComparing: false,

  setIsComparing: (val) => set({ isComparing: val }),

  updatePlannedPeriod: (ratePlanKey, index, updatedData) => {
    const current = get().plannedPeriods[ratePlanKey] || [];
    const updatedPeriods = [...current];
    if (updatedPeriods[index]) {
      updatedPeriods[index] = {
        ...updatedPeriods[index],
        ...updatedData
      };
      
      // Ottimizzato: Esegue l'aggiornamento a cascata solo se cambiano date critiche
      if (updatedData.dateTo) {
        let currentTo = updatedData.dateTo;
        for (let i = index + 1; i < updatedPeriods.length; i++) {
          const nextStart = addDay(currentTo, 1);
          const nextDuration = Math.round((new Date(updatedPeriods[i].dateTo).getTime() - new Date(updatedPeriods[i].dateFrom).getTime()) / (1000 * 60 * 60 * 24));
          const updatedTo = addDay(nextStart, nextDuration > 0 ? nextDuration : 14);
          updatedPeriods[i] = {
            ...updatedPeriods[i],
            dateFrom: nextStart,
            dateTo: updatedTo
          };
          currentTo = updatedTo;
        }
      }

      const updated = {
        ...get().plannedPeriods,
        [ratePlanKey]: updatedPeriods
      };

      set({ plannedPeriods: updated });
      localStorage.setItem('fpv_planned_restrictions_v7', JSON.stringify(updated));
    }
  },

  addNextPlannedPeriod: (ratePlanKey) => {
    const current = get().plannedPeriods[ratePlanKey] || [];
    let nextStart = '2026-10-01';
    
    if (current.length > 0) {
      const lastPeriod = current[current.length - 1];
      nextStart = addDay(lastPeriod.dateTo, 1);
    }

    const nextEnd = addDay(nextStart, 30);

    const newPeriod: PlannedPeriod = {
      id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      dateFrom: nextStart,
      dateTo: nextEnd,
      onlyCheckoutDays: 10,
      strategy: 'failsafe_checkout'
    };

    const updated = {
      ...get().plannedPeriods,
      [ratePlanKey]: [...current, newPeriod]
    };

    set({ plannedPeriods: updated });
    localStorage.setItem('fpv_planned_restrictions_v7', JSON.stringify(updated));
  },

  removePlannedPeriod: (ratePlanKey, index) => {
    const current = get().plannedPeriods[ratePlanKey] || [];
    const updatedPeriods = current.filter((_, i) => i !== index);

    if (updatedPeriods.length > 0 && index < updatedPeriods.length) {
      let prevTo = index > 0 ? updatedPeriods[index - 1].dateTo : '';
      if (prevTo) {
        for (let i = index; i < updatedPeriods.length; i++) {
          const nextStart = addDay(prevTo, 1);
          const nextDuration = Math.round((new Date(updatedPeriods[i].dateTo).getTime() - new Date(updatedPeriods[i].dateFrom).getTime()) / (1000 * 60 * 60 * 24));
          const updatedTo = addDay(nextStart, nextDuration > 0 ? nextDuration : 14);
          updatedPeriods[i] = {
            ...updatedPeriods[i],
            dateFrom: nextStart,
            dateTo: updatedTo
          };
          prevTo = updatedTo;
        }
      }
    }

    const updated = {
      ...get().plannedPeriods,
      [ratePlanKey]: updatedPeriods
    };

    set({ plannedPeriods: updated });
    localStorage.setItem('fpv_planned_restrictions_v7', JSON.stringify(updated));
  },

  syncRatePlanToOctorate: async (ratePlanKey, index) => {
    set({ isSaving: true });
    try {
      const period = (get().plannedPeriods[ratePlanKey] || [])[index];
      if (!period) throw new Error('Periodo selezionato non trovato.');

      const payload = {
        ratePlanKey,
        dateFrom: period.dateFrom,
        dateTo: period.dateTo,
        onlyCheckoutDays: period.onlyCheckoutDays,
        strategy: period.strategy
      };

      const res = await fetch('/api/resort/update-rateplan-restrictions-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      set({ isSaving: false });

      if (res.ok) {
        const updatedLive = { ...get().liveOctorateRestrictions };
        const liveList = [...(updatedLive[ratePlanKey] || [])];
        if (liveList[index]) {
          liveList[index] = { ...period, id: `${ratePlanKey}_live_${index}` };
        } else {
          liveList.push({ ...period, id: `${ratePlanKey}_live_${index}` });
        }
        updatedLive[ratePlanKey] = liveList;
        set({ liveOctorateRestrictions: updatedLive });

        return { success: true, message: 'Restrizioni caricate con successo su Octorate!' };
      } else {
        return { success: false, message: data.message || 'Errore di sincronizzazione.' };
      }
    } catch (err: any) {
      set({ isSaving: false });
      return { success: false, message: err.message || 'Errore di connessione.' };
    }
  },

  syncAllRatePlansToOctorate: async () => {
    set({ isBulkSaving: true, bulkSyncProgress: { current: 0, total: 0 } });
    try {
      const { plannedPeriods } = get();
      
      let totalTasks = 0;
      RATE_PLANS.forEach(rp => {
        totalTasks += (plannedPeriods[rp.key] || []).length;
      });

      if (totalTasks === 0) {
        set({ isBulkSaving: false });
        return { success: true, message: 'Nessun periodo pianificato da sincronizzare.' };
      }

      set({ bulkSyncProgress: { current: 0, total: totalTasks } });
      let currentTask = 0;

      for (const rp of RATE_PLANS) {
        const periods = plannedPeriods[rp.key] || [];
        for (let i = 0; i < periods.length; i++) {
          const period = periods[i];
          const payload = {
            ratePlanKey: rp.key,
            dateFrom: period.dateFrom,
            dateTo: period.dateTo,
            onlyCheckoutDays: period.onlyCheckoutDays,
            strategy: period.strategy
          };

          const res = await fetch('/api/resort/update-rateplan-restrictions-bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            const updatedLive = { ...get().liveOctorateRestrictions };
            const liveList = [...(updatedLive[rp.key] || [])];
            liveList[i] = { ...period, id: `${rp.key}_live_${i}` };
            updatedLive[rp.key] = liveList;
            set({ liveOctorateRestrictions: updatedLive });
          }

          currentTask++;
          set({ bulkSyncProgress: { current: currentTask, total: totalTasks } });
        }
      }

      await get().fetchLiveRestrictions();
      set({ isBulkSaving: false, bulkSyncProgress: { current: 0, total: 0 } });
      return { success: true, message: 'Sincronizzazione bulk completata con successo!' };
    } catch (err: any) {
      set({ isBulkSaving: false, bulkSyncProgress: { current: 0, total: 0 } });
      return { success: false, message: err.message || 'Errore durante l\\'aggiornamento bulk.' };
    }
  },

  fetchLiveRestrictions: async () => {
    try {
      const res = await fetch('/api/resort/octorate-restrictions-grid');
      if (res.ok) {
        const data = await res.json();
        if (data.grid) {
          set({ liveOctorateRestrictions: data.grid });
        }
      }
    } catch (err) {
      console.error('Errore nel recupero delle restrizioni live:', err);
    }
  },

  saveDraftBackup: () => {
    const current = get().plannedPeriods;
    localStorage.setItem('fpv_planned_restrictions_backup_v7', JSON.stringify(current));
    localStorage.setItem('fpv_planned_restrictions_backup_time_v7', new Date().toISOString());
  },

  restoreDraftBackup: () => {
    const backup = localStorage.getItem('fpv_planned_restrictions_backup_v7');
    if (!backup) {
      return { success: false, message: 'Nessun backup trovato in memoria locale.' };
    }
    try {
      const parsed = JSON.parse(backup);
      set({ plannedPeriods: parsed });
      localStorage.setItem('fpv_planned_restrictions_v7', backup);
      return { success: true, message: 'Configurazione ripristinata dal backup locale con successo!' };
    } catch (err: any) {
      return { success: false, message: 'Errore nel ripristino del backup: ' + err.message };
    }
  },

  importConfig: (periods) => {
    try {
      for (const key of Object.keys(periods)) {
        if (!Array.isArray(periods[key])) {
          throw new Error(`Il piano tariffario ${key} non ha un formato valido.`);
        }
      }
      set({ plannedPeriods: periods });
      localStorage.setItem('fpv_planned_restrictions_v7', JSON.stringify(periods));
      return { success: true, message: 'Configurazione importata con successo!' };
    } catch (err: any) {
      return { success: false, message: 'Formato non valido: ' + err.message };
    }
  }
}));
