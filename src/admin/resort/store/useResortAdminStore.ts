import { create } from 'zustand';
import { ACCOMMODATIONS } from '../../../booking/resort/config/accommodations';
import { updateLastMinuteRatesStrategy, resetLastMinuteRatesStrategy, disableLastMinuteRatesStrategy, updateStandardProtectionStrategy, fetchOctorateLiveReservations } from '../../../booking/lib/octorate';
import { calculateCascadeDiscountUpdates, calculateDynamicMinStay, calculateStandardProtectionUpdates, StandardProtectionUpdate, toThailandDateStr, getSeasonalEndDateStr, DiscountExecutionMode, ALL_ACCOMMODATIONS_MAP, FALLBACK_BASELINE_PRICES } from '../lib/octorateAdmin';
import { isValidActiveBooking } from '../lib/bookingFilters';
import { useRestrictionsStore } from './useRestrictionsStore';

const ALL_ACCOMMODATIONS_MAP_LOCAL = ALL_ACCOMMODATIONS_MAP;

function addDaysISO(dateStr: string, days: number): string {
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const d = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]) + days));
  return d.toISOString().slice(0, 10);
}

export interface ResortBooking {
  id: string;
  created_at: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  accommodation_id: string;
  accommodation_name: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  deposit_paid: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  stripe_session_id?: string;
  octorate_reservation_id?: string;
  source_channel?: string;
  extra_breakfast: boolean;
  extra_ac: boolean;
}

export interface AccommodationStatus {
  id: string;
  name: string;
  category: string;
  octorateId: string;
  isAvailable: boolean;
  basePrice: number;
  maxGuests: number;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  slotsTotal: number;
  slotsUsed: number;
  isSingleUse: boolean;
  validFrom: string;
  validTo: string;
  active: boolean;
  createdAt: string;
}

const STORAGE_KEY_PROMO_CODES = 'fpv_promo_codes';

const loadPromoCodesFromStorage = (): PromoCode[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROMO_CODES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('[useResortAdminStore] Failed to read promo codes from localStorage:', e);
  }
  return [
    {
      id: 'promo-welcome-2026',
      code: 'WELCOME2026',
      discountType: 'percentage',
      discountValue: 10,
      slotsTotal: 50,
      slotsUsed: 3,
      isSingleUse: false,
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
      active: true,
      createdAt: new Date().toISOString()
    }
  ];
};

const savePromoCodesToStorage = (codes: PromoCode[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PROMO_CODES, JSON.stringify(codes));
  } catch (e) {
    console.error('[useResortAdminStore] Failed to save promo codes to localStorage:', e);
  }
};

const loadCachedImportTime = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('fpv_octorate_cache_time') || null;
  } catch (e) {
    console.error('[useResortAdminStore] Failed to read cache time from localStorage:', e);
    return null;
  }
};

interface ResortAdminState {
  bookings: ResortBooking[];
  rawOctorateBookings: any[];
  accommodations: AccommodationStatus[];
  loading: boolean;
  error: string | null;
  octorateStatus: 'connected' | 'checking' | 'error';
  octorateDetails: { structureId: string; channelId: string; lastSync?: string };
  filterCategory: string;
  rawOctorateGridItems: any[];
  setRawOctorateGridItems: (items: any[]) => void;
  setRawOctorateBookings: (bookings: any[]) => void;

  // Dynamic Minimum Stay (Gap-Fill) State & Manual Trigger Control
  isDynamicCalculationEnabled: boolean;
  setIsDynamicCalculationEnabled: (enabled: boolean) => void;
  dynamicMinStayGapFill: boolean;
  dynamicMinStayRunning: boolean;
  dynamicMinStayResetRunning: boolean;
  dynamicMinStayUpdates: any[];
  dynamicMinStayResult: { success: boolean; dryRun: boolean; message: string; updatesCount: number } | null;

  // Progressive Sequential Timeline Download State
  seasonDownloadStatus: 'idle' | 'downloading' | 'completed' | 'error';
  seasonDownloadProgress: number;
  seasonDownloadMessage: string;
  downloadSeasonSequential: () => Promise<void>;

  // Last-Minute Cascade Discount Automation State (3 Stadi Sequenziali + Test Toggle + Dry-Run Simulation)
  isLastMinuteActive: boolean;
  setIsLastMinuteActive: (active: boolean) => void;
  lastMinuteStage1Days: number;
  lastMinuteDiscountStage1: number;
  lastMinuteStage2Days: number;
  lastMinuteDiscountStage2: number;
  lastMinuteStage3Days: number;
  lastMinuteDiscountStage3: number;
  executionMode: DiscountExecutionMode;
  isTestEnvironment: boolean;
  isSimulationActive: boolean;
  simulatedOctorateGridItems: any[];
  lastMinuteRunning: boolean;
  lastMinuteExecuting: boolean;
  lastMinuteResetting: boolean;
  lastMinuteResult: { success: boolean; message: string; dateUpdated: string; details?: any } | null;

  // Actions
  fetchBookings: () => Promise<void>;
  setBookings: (bookings: ResortBooking[]) => void;
  toggleRoomAvailability: (octorateId: string, available: boolean) => void;
  updateAccommodationFeatures: (id: string, updatedFeatures: any) => void;
  checkOctorateConnection: () => Promise<void>;
  setFilterCategory: (category: string) => void;
  dynamicMinStayExecutionMode: DiscountExecutionMode;
  setDynamicMinStayGapFill: (enabled: boolean) => void;
  setDynamicMinStayExecutionMode: (mode: DiscountExecutionMode) => void;
  executeDynamicMinStayStrategy: (resetToBaseline?: boolean, customRange?: { start: string; end: string }) => Promise<void>;

  // Last-Minute Actions
  setLastMinuteStage1Days: (days: number) => void;
  setLastMinuteDiscountStage1: (pct: number) => void;
  setLastMinuteStage2Days: (days: number) => void;
  setLastMinuteDiscountStage2: (pct: number) => void;
  setLastMinuteStage3Days: (days: number) => void;
  setLastMinuteDiscountStage3: (pct: number) => void;
  setExecutionMode: (mode: DiscountExecutionMode) => void;
  setIsTestEnvironment: (enabled: boolean) => void;
  setIsSimulationActive: (active: boolean) => void;
  setSimulatedOctorateGridItems: (items: any[]) => void;
  resetSimulation: () => void;
  executeLastMinuteStrategy: () => Promise<void>;
  resetLastMinuteStrategy: () => Promise<void>;
  disableLastMinuteStrategy: () => Promise<void>;
  recalculateLastMinuteItems: () => void;
  autoAdvanceDailyLastMinute: () => Promise<void>;

  // V4 Standard Rates Protection Automation State & Actions
  standardProtectionActive: boolean;
  standardProtectionExecutionMode: DiscountExecutionMode;
  standardSeasonStartDate: string;
  standardSeasonEndDate: string;
  standardDaysTriggerLimit: number;
  standardDaysOpenDuration: number;
  standardDaysCtaDuration: number;
  standardProtectionRunning: boolean;
  standardProtectionResult: { success: boolean; message: string; dateUpdated: string; details?: any } | null;
  standardProtectionUpdates: StandardProtectionUpdate[];

  setStandardProtectionActive: (active: boolean) => void;
  setStandardProtectionExecutionMode: (mode: DiscountExecutionMode) => void;
  setStandardSeasonStartDate: (date: string) => void;
  setStandardSeasonEndDate: (date: string) => void;
  setStandardDaysTriggerLimit: (days: number) => void;
  setStandardDaysOpenDuration: (days: number) => void;
  setStandardDaysCtaDuration: (days: number) => void;
  executeStandardProtectionStrategy: (resetToOpen?: boolean) => Promise<void>;

  // V19 Promo Codes & Discount Tickets State & Actions
  promoCodes: PromoCode[];
  addPromoCode: (promo: Omit<PromoCode, 'id' | 'slotsUsed' | 'createdAt'>) => void;
  togglePromoCodeActive: (id: string) => void;
  deletePromoCode: (id: string) => void;
  incrementPromoCodeUsage: (codeOrId: string) => void;
  refreshPromoCodes: () => void;

  // Persistent Cache State & Actions
  cachedImportTime: string | null;
  saveToCache: (bookingsToSave?: any[], gridToSave?: any[]) => void;
  loadFromCache: () => boolean;

  // Writability Empirical Sync State & Actions
  verifiedWritability: Record<string, boolean>;
  isTestingWritability: boolean;
  testingProgress: { activeRateName: string; completed: number; total: number } | null;
  testingSlugs: Record<string, boolean>;
  accommodationTestingProgress: Record<string, { activeRateName: string; completed: number; total: number }>;
  verifyAllRatesWritability: (rates: { id: string; name: string }[]) => Promise<void>;
  verifyAccommodationWritability: (slug: string, rates: { id: string; name: string }[]) => Promise<void>;

  // Direct Stop Sell Toggle Action
  toggleRateStopSell: (rateId: string, stopSell: boolean, dateISO?: string) => Promise<boolean>;
}

const STORAGE_KEY_WRITABILITY = 'fpv_verified_writability';

const loadVerifiedWritabilityFromStorage = (): Record<string, boolean> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WRITABILITY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    console.error('[useResortAdminStore] Failed to read writability from localStorage:', e);
  }
  return {};
};

export const useResortAdminStore = create<ResortAdminState>((set, get) => ({
  promoCodes: loadPromoCodesFromStorage(),
  bookings: [],
  rawOctorateBookings: [],
  accommodations: ACCOMMODATIONS.map((room) => ({
    id: String(room.octorateId || room.name),
    name: room.name,
    category: room.category,
    octorateId: String(room.octorateId || ''),
    isAvailable: true,
    basePrice: room.pricePerNight || 1800,
    maxGuests: room.baseGuests || 2
  })),
  loading: false,
  error: null,
  octorateStatus: 'connected',
  octorateDetails: {
    structureId: '366879',
    channelId: '233',
    lastSync: new Date().toISOString()
  },
  filterCategory: 'All',
  rawOctorateGridItems: [],
  setRawOctorateGridItems: (items: any[]) => {
    if (Array.isArray(items)) {
      set({ rawOctorateGridItems: items });
    }
  },
  setRawOctorateBookings: (newBookings: any[]) => {
    if (Array.isArray(newBookings)) {
      set({ rawOctorateBookings: newBookings, bookings: newBookings });
    }
  },

  isDynamicCalculationEnabled: typeof window !== 'undefined' ? (localStorage.getItem('fp_dynamic_min_stay_enabled') !== 'false') : true,
  setIsDynamicCalculationEnabled: (enabled: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fp_dynamic_min_stay_enabled', String(enabled));
    }
    set({ isDynamicCalculationEnabled: enabled, dynamicMinStayGapFill: enabled });
  },

  dynamicMinStayGapFill: typeof window !== 'undefined' ? (localStorage.getItem('fp_dynamic_min_stay_enabled') !== 'false') : true,
  dynamicMinStayExecutionMode: typeof window !== 'undefined' ? ((localStorage.getItem('fp_dynamic_min_stay_mode') as DiscountExecutionMode) || 'production') : 'production',
  dynamicMinStayRunning: false,
  dynamicMinStayResetRunning: false,
  dynamicMinStayUpdates: [],
  dynamicMinStayResult: null,
  setDynamicMinStayGapFill: (enabled: boolean) => set({ dynamicMinStayGapFill: enabled }),
  setDynamicMinStayExecutionMode: (mode: DiscountExecutionMode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fp_dynamic_min_stay_mode', mode);
    }
    set({ dynamicMinStayExecutionMode: mode, dynamicMinStayGapFill: mode !== 'simulation' });
  },

  // 3 Sequential Cascade Discount Stages Defaults (Persistent from localStorage)
  isLastMinuteActive: typeof window !== 'undefined' ? (localStorage.getItem('fp_last_minute_active') === 'true') : false,
  setIsLastMinuteActive: (active: boolean) => {
    if (typeof window !== 'undefined') localStorage.setItem('fp_last_minute_active', String(active));
    set({ isLastMinuteActive: active });
    get().recalculateLastMinuteItems();
  },
  lastMinuteStage1Days: typeof window !== 'undefined' ? (Number(localStorage.getItem('fp_lm_stage1_days')) || 3) : 3,
  lastMinuteDiscountStage1: typeof window !== 'undefined' ? (Number(localStorage.getItem('fp_lm_stage1_discount')) || 10) : 10,
  lastMinuteStage2Days: typeof window !== 'undefined' ? (Number(localStorage.getItem('fp_lm_stage2_days')) || 2) : 2,
  lastMinuteDiscountStage2: typeof window !== 'undefined' ? (Number(localStorage.getItem('fp_lm_stage2_discount')) || 5) : 5,
  lastMinuteStage3Days: typeof window !== 'undefined' ? (Number(localStorage.getItem('fp_lm_stage3_days')) || 2) : 2,
  lastMinuteDiscountStage3: typeof window !== 'undefined' ? (Number(localStorage.getItem('fp_lm_stage3_discount')) || 2.5) : 2.5,
  executionMode: typeof window !== 'undefined' ? ((localStorage.getItem('fp_last_minute_execution_mode') as DiscountExecutionMode) || 'simulation') : 'simulation',
  isTestEnvironment: false,
  isSimulationActive: false,
  simulatedOctorateGridItems: [],
  lastMinuteRunning: false,
  lastMinuteExecuting: false,
  lastMinuteResetting: false,
  lastMinuteResult: null,

  setLastMinuteStage1Days: (days: number) => {
    if (typeof window !== 'undefined') localStorage.setItem('fp_lm_stage1_days', String(days));
    set({ lastMinuteStage1Days: days });
    get().recalculateLastMinuteItems();
  },
  setLastMinuteDiscountStage1: (pct: number) => {
    if (typeof window !== 'undefined') localStorage.setItem('fp_lm_stage1_discount', String(pct));
    set({ lastMinuteDiscountStage1: pct });
    get().recalculateLastMinuteItems();
  },
  setLastMinuteStage2Days: (days: number) => {
    if (typeof window !== 'undefined') localStorage.setItem('fp_lm_stage2_days', String(days));
    set({ lastMinuteStage2Days: days });
    get().recalculateLastMinuteItems();
  },
  setLastMinuteDiscountStage2: (pct: number) => {
    if (typeof window !== 'undefined') localStorage.setItem('fp_lm_stage2_discount', String(pct));
    set({ lastMinuteDiscountStage2: pct });
    get().recalculateLastMinuteItems();
  },
  setLastMinuteStage3Days: (days: number) => {
    if (typeof window !== 'undefined') localStorage.setItem('fp_lm_stage3_days', String(days));
    set({ lastMinuteStage3Days: days });
    get().recalculateLastMinuteItems();
  },
  setLastMinuteDiscountStage3: (pct: number) => {
    if (typeof window !== 'undefined') localStorage.setItem('fp_lm_stage3_discount', String(pct));
    set({ lastMinuteDiscountStage3: pct });
    get().recalculateLastMinuteItems();
  },
  setExecutionMode: (mode: DiscountExecutionMode) => {
    if (typeof window !== 'undefined') localStorage.setItem('fp_last_minute_execution_mode', mode);
    set({
      executionMode: mode,
      isTestEnvironment: mode === 'test_bungalows'
    });
    get().recalculateLastMinuteItems();
  },
  setIsTestEnvironment: (enabled: boolean) => {
    set({ isTestEnvironment: enabled, executionMode: enabled ? 'test_bungalows' : 'production' });
    get().recalculateLastMinuteItems();
  },
  setIsSimulationActive: (active: boolean) => set({ isSimulationActive: active }),
  setSimulatedOctorateGridItems: (items: any[]) => set({ simulatedOctorateGridItems: items }),
  resetSimulation: () => set({ isSimulationActive: false, simulatedOctorateGridItems: [] }),

  seasonDownloadStatus: 'idle',
  seasonDownloadProgress: 0,
  seasonDownloadMessage: '',

  // Standard Protection Default State V4
  standardProtectionActive: false,
  standardProtectionExecutionMode: 'test_bungalows',
  standardSeasonStartDate: '2026-12-15',
  standardSeasonEndDate: '2027-03-31',
  standardDaysTriggerLimit: 15,
  standardDaysOpenDuration: 10,
  standardDaysCtaDuration: 5,
  standardProtectionRunning: false,
  standardProtectionResult: null,
  standardProtectionUpdates: [],

  setStandardProtectionActive: (active: boolean) => set({ standardProtectionActive: active }),
  setStandardProtectionExecutionMode: (mode: DiscountExecutionMode) => set({ standardProtectionExecutionMode: mode }),
  setStandardSeasonStartDate: (date: string) => set({ standardSeasonStartDate: date }),
  setStandardSeasonEndDate: (date: string) => set({ standardSeasonEndDate: date }),
  setStandardDaysTriggerLimit: (days: number) => set({ standardDaysTriggerLimit: days }),
  setStandardDaysOpenDuration: (days: number) => set({ standardDaysOpenDuration: days }),
  setStandardDaysCtaDuration: (days: number) => set({ standardDaysCtaDuration: days }),

  executeStandardProtectionStrategy: async (resetToOpen: boolean = false) => {
    const {
      standardSeasonStartDate,
      standardSeasonEndDate,
      standardDaysTriggerLimit,
      standardDaysOpenDuration,
      standardDaysCtaDuration,
      standardProtectionExecutionMode,
      octorateDetails
    } = get();

    set({ standardProtectionRunning: true });

    const calculatedUpdates = calculateStandardProtectionUpdates({
      seasonStartDate: standardSeasonStartDate,
      seasonEndDate: standardSeasonEndDate,
      daysTriggerLimit: standardDaysTriggerLimit,
      daysOpenDuration: standardDaysOpenDuration,
      daysCtaDuration: standardDaysCtaDuration,
      executionMode: standardProtectionExecutionMode
    });

    const result = await updateStandardProtectionStrategy(
      octorateDetails.structureId,
      standardSeasonStartDate,
      standardSeasonEndDate,
      standardDaysTriggerLimit,
      standardDaysOpenDuration,
      standardDaysCtaDuration,
      standardProtectionExecutionMode,
      resetToOpen
    );

    set({
      standardProtectionRunning: false,
      standardProtectionResult: result,
      standardProtectionUpdates: calculatedUpdates,
      standardProtectionActive: !resetToOpen
    });
  },

  downloadSeasonSequential: async () => {
    set({
      seasonDownloadStatus: 'downloading',
      seasonDownloadProgress: 0,
      seasonDownloadMessage: 'Avvio download sequenziale stagione...'
    });

    try {
      // Data di partenza del primo blocco mensile: 1° giorno del mese corrente (es. 2026-08-01 se oggi è il 9 Agosto 2026)
      // Garantisce che gli ospiti attualmente in-house vengano inclusi nel recupero dati da Octorate
      const now = new Date();
      const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayStr = toThailandDateStr(firstDayOfCurrentMonth);
      const parts = firstDayStr.split('-');
      const currentYear = parseInt(parts[0], 10) || now.getFullYear();
      const currentMonth = parseInt(parts[1], 10) || (now.getMonth() + 1);

      // L'anno di fine stagione per qualsiasi mese dell'anno Y si estende sempre fino al 31 Ottobre dell'anno successivo (Y + 1)
      const seasonEndYear = currentYear + 1;

      const monthsToFetch: Array<{ year: number; month: number; name: string }> = [];

      let y = currentYear;
      let m = currentMonth;

      const monthNames = [
        'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
        'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio'
      ];
      
      const fullMonthNames = [
        'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
      ];

      while (y < seasonEndYear || (y === seasonEndYear && m <= 10)) {
        monthsToFetch.push({ year: y, month: m, name: `${fullMonthNames[m - 1]} ${y}` });
        m++;
        if (m > 12) {
          m = 1;
          y++;
        }
      }

      if (monthsToFetch.length === 0) {
        monthsToFetch.push({ year: currentYear, month: currentMonth, name: `${fullMonthNames[currentMonth - 1]} ${currentYear}` });
      }

      const accumulatedBookings: any[] = [];
      const existingIds = new Set<string>();

      for (let i = 0; i < monthsToFetch.length; i++) {
        const item = monthsToFetch[i];
        const progressPct = Math.round(((i + 1) / monthsToFetch.length) * 100);

        set({
          seasonDownloadStatus: 'downloading',
          seasonDownloadProgress: Math.max(5, progressPct),
          seasonDownloadMessage: `Scaricamento ${item.name} in corso (${i + 1}/${monthsToFetch.length})...`
        });

        const firstDayStr = `${item.year}-${String(item.month).padStart(2, '0')}-01`;
        const lastDayNum = new Date(item.year, item.month, 0).getDate();
        const lastDayStr = `${item.year}-${String(item.month).padStart(2, '0')}-${String(lastDayNum).padStart(2, '0')}`;

        try {
          const res = await fetch(`/api/resort/octorate-bookings?dateFrom=${firstDayStr}&dateTo=${lastDayStr}`);
          if (res.ok) {
            const json = await res.json();
            if (json.data && Array.isArray(json.data)) {
              for (const newItem of json.data) {
                const bId = String(newItem.id || newItem.octorate_reservation_id || Math.random());
                if (!existingIds.has(bId)) {
                  existingIds.add(bId);
                  accumulatedBookings.push(newItem);
                }
              }

              const filteredAccumulated = accumulatedBookings.filter(isValidActiveBooking);
              set({
                rawOctorateBookings: [...accumulatedBookings],
                bookings: filteredAccumulated
              });
            }
          }
        } catch (err) {
          console.warn(`[downloadSeasonSequential] Errore mese ${item.name}:`, err);
        }

        await new Promise(r => setTimeout(r, 120));
      }

      set({
        seasonDownloadStatus: 'completed',
        seasonDownloadProgress: 100,
        seasonDownloadMessage: `Caricamento Stagione Completato (100%) - ${accumulatedBookings.length} prenotazioni pronte`
      });

      // Salvataggio sicuro in cache al 100% del download
      get().saveToCache(accumulatedBookings);
    } catch (err: any) {
      console.error('[downloadSeasonSequential] Exception:', err);
      set({
        seasonDownloadStatus: 'error',
        seasonDownloadProgress: 0,
        seasonDownloadMessage: err.message || 'Errore durante il caricamento della stagione'
      });
    }
  },

  executeDynamicMinStayStrategy: async (resetToBaseline: boolean = false, customRange?: { start: string; end: string }) => {
    if (resetToBaseline) {
      set({ dynamicMinStayResetRunning: true, isDynamicCalculationEnabled: true });
    } else {
      set({ dynamicMinStayRunning: true, isDynamicCalculationEnabled: true });
    }
    try {
      let { rawOctorateBookings, bookings, dynamicMinStayGapFill, dynamicMinStayExecutionMode, fetchBookings, downloadSeasonSequential } = get();

      // Regola 1: Se l'array rawOctorateBookings è vuoto, recupera l'intera stagione
      if (!rawOctorateBookings || rawOctorateBookings.length === 0) {
        console.log('[useResortAdminStore] rawOctorateBookings vuoto: Eseguo downloadSeasonSequential() prima del Gap-Fill...');
        await downloadSeasonSequential();
        rawOctorateBookings = get().rawOctorateBookings;
        bookings = get().bookings;
      }

      const poolToUse = (rawOctorateBookings && rawOctorateBookings.length > 0) ? rawOctorateBookings : bookings;
      const todayISO = customRange?.start || toThailandDateStr(new Date());
      const endISO = customRange?.end || getSeasonalEndDateStr(todayISO);

      let updates: any[] = [];
      if (resetToBaseline) {
        // Ripristino puro: applica i periodi standard della Timeline Min Stay su Octorate coprendo da OGGI fino a fine stagione
        const storePeriods: any[] = useRestrictionsStore.getState?.()?.plannedMinStayPeriods || [];
        const sortedPeriods = [...storePeriods].sort((a, b) => a.dateFrom.localeCompare(b.dateFrom));

        const effectivePeriods: Array<{ dateFrom: string; dateTo: string; minStay: number }> = [];

        if (sortedPeriods.length === 0) {
          effectivePeriods.push({ dateFrom: todayISO, dateTo: endISO, minStay: 2 });
        } else {
          // Se il primo periodo pianificato inizia dopo oggi, copri la coda attuale (da oggi a inizio periodo) con baseline 2
          if (sortedPeriods[0].dateFrom > todayISO) {
            const preEnd = addDaysISO(sortedPeriods[0].dateFrom, -1);
            effectivePeriods.push({ dateFrom: todayISO, dateTo: preEnd, minStay: 2 });
          }
          sortedPeriods.forEach(p => {
            const pFrom = p.dateFrom < todayISO ? todayISO : p.dateFrom;
            const pTo = p.dateTo > endISO ? endISO : p.dateTo;
            if (pFrom <= pTo) {
              effectivePeriods.push({ dateFrom: pFrom, dateTo: pTo, minStay: p.minStay || 2 });
            }
          });
        }

        const targetRooms = dynamicMinStayExecutionMode === 'test_bungalows'
          ? [
              { motherId: 649669, name: 'Fake Bungalow 1' },
              { motherId: 921799, name: 'Fake Bungalow 2' }
            ]
          : Object.values(ALL_ACCOMMODATIONS_MAP_LOCAL).map(a => ({ motherId: a.motherId, name: a.name }));

        targetRooms.forEach(room => {
          effectivePeriods.forEach(period => {
            updates.push({
              roomTypeId: String(room.motherId),
              motherId: room.motherId,
              accommodationName: room.name,
              dateFrom: period.dateFrom,
              dateTo: period.dateTo,
              minStay: period.minStay,
              reason: `Ripristino Soggiorno Minimo Standard (${period.minStay} notti)`
            });
          });
        });
      } else {
        // Calcolo Assoluto basato sulle prenotazioni reali stagionali in memoria con enabled = true
        updates = calculateDynamicMinStay(poolToUse, { start: todayISO, end: endISO, enabled: true });
      }

      // Se la modalità è simulation o dynamicMinStayGapFill è false, dryRun = true
      const isDryRun = (dynamicMinStayExecutionMode === 'simulation') || (!resetToBaseline && !dynamicMinStayGapFill);
      const annotatedUpdates = updates.map(u => ({ ...u, isSimulated: isDryRun }));

      // In AMBIENTE DI TEST inviamo ad Octorate ESCLUSIVAMENTE i 2 Fake Bungalow fittizi (#649669 e #921799)
      // e normalizziamo roomTypeId tassativamente sull'ID Camera Madre di Livello 0
      const updatesToSend = (dynamicMinStayExecutionMode === 'test_bungalows' && !isDryRun)
        ? annotatedUpdates
            .filter(u => {
              const motherStr = String(u.motherId || '');
              const nameStr = String(u.accommodationName || '').toLowerCase();
              return motherStr === '649669' || motherStr === '921799' || nameStr.includes('fake') || nameStr.includes('test');
            })
            .map(u => {
              const nameStr = String(u.accommodationName || '').toLowerCase();
              const targetMotherId = (nameStr.includes('2') || String(u.motherId) === '921799') ? '921799' : '649669';
              return {
                ...u,
                roomTypeId: targetMotherId,
                motherId: Number(targetMotherId)
              };
            })
        : annotatedUpdates.map(u => ({
            ...u,
            roomTypeId: String(u.motherId || u.roomTypeId)
          }));

      const endpoints = [
        '/api/resort/octorate-min-stay',
        '/api/octorate-min-stay',
        '/api/resort-octorate-min-stay'
      ];

      let apiRes: Response | null = null;
      let lastErrText = '';

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              updates: updatesToSend,
              resetToBaseline,
              dryRun: isDryRun,
              executionMode: dynamicMinStayExecutionMode,
              isTestEnvironment: dynamicMinStayExecutionMode === 'test_bungalows'
            })
          });
          if (res.ok) {
            apiRes = res;
            break;
          } else {
            lastErrText = await res.text();
          }
        } catch (err: any) {
          lastErrText = err.message;
        }
      }

      if (!apiRes) {
        throw new Error(`Server returned HTTP Error: ${lastErrText.slice(0, 100)}`);
      }

      const resJson = await apiRes.json();
      if (typeof window !== 'undefined') {
        localStorage.setItem('fp_dynamic_min_stay_enabled', resetToBaseline ? 'false' : 'true');
      }
      set({
        dynamicMinStayUpdates: resetToBaseline ? [] : annotatedUpdates,
        isDynamicCalculationEnabled: resetToBaseline ? false : true,
        dynamicMinStayGapFill: resetToBaseline ? false : true,
        dynamicMinStayResult: {
          success: resJson.success,
          dryRun: resJson.dryRun ?? isDryRun,
          message: resJson.message || (resJson.success ? (resetToBaseline ? 'Ripristino valori stagionali completato.' : 'Calcolo soggiorno minimo dinamico eseguito con successo.') : 'Errore esecuzione'),
          updatesCount: resJson.updatesCount || 0
        },
        dynamicMinStayRunning: false,
        dynamicMinStayResetRunning: false
      });
    } catch (err: any) {
      console.error('[useResortAdminStore] Dynamic MinStay Strategy Error:', err);
      set({
        dynamicMinStayResult: {
          success: false,
          dryRun: true,
          message: err.message || 'Errore durante il calcolo del soggiorno minimo dinamico.',
          updatesCount: 0
        },
        dynamicMinStayRunning: false,
        dynamicMinStayResetRunning: false
      });
    }
  },

  applyClosedToArrival: true,
  lastMinuteRunning: false,
  lastMinuteResult: null,

  setBookings: (newBookings: ResortBooking[]) => {
    if (Array.isArray(newBookings) && newBookings.length > 0) {
      set({ bookings: newBookings, rawOctorateBookings: newBookings });
    }
  },

  fetchBookings: async () => {
    set({ loading: true, error: null });
    try {
      const todayStr = toThailandDateStr(new Date());
      const seasonEndStr = getSeasonalEndDateStr(todayStr);

      // 1. Download Stagionale in Blocco da oggi al 31 Ottobre nel fuso Asia/Bangkok
      const res = await fetch(`/api/resort/octorate-bookings?dateFrom=${todayStr}&dateTo=${seasonEndStr}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          const filtered = json.data.filter(isValidActiveBooking);
          set({ rawOctorateBookings: json.data, bookings: filtered, loading: false });
          console.log(`[useResortAdminStore] Scaricate ${json.data.length} prenotazioni (${filtered.length} attive valide) in blocco (${todayStr} -> ${seasonEndStr})`);
          return;
        }
      }

      // 2. Fallback to fetchOctorateLiveReservations
      const liveReservations = await fetchOctorateLiveReservations();
      if (liveReservations && Array.isArray(liveReservations)) {
        const filtered = liveReservations.filter(isValidActiveBooking);
        set({ rawOctorateBookings: liveReservations, bookings: filtered, loading: false });
        return;
      }

      set({ rawOctorateBookings: [], bookings: [], loading: false });
    } catch (err: any) {
      console.error('[useResortAdminStore] Fetch Error:', err);
      set({ error: err.message || 'Impossibile caricare le prenotazioni del resort.', loading: false });
    }
  },

  toggleRoomAvailability: (octorateId: string, available: boolean) => {
    set((state) => ({
      accommodations: state.accommodations.map((room) =>
        room.octorateId === octorateId ? { ...room, isAvailable: available } : room
      )
    }));
  },

  updateAccommodationFeatures: (id: string, updatedFeatures: any) => {
    set((state) => ({
      accommodations: state.accommodations.map((room) => {
        if (room.id === id || room.octorateId === id) {
          const currentDetails = typeof room.details === 'object' && room.details !== null ? room.details : {};
          return {
            ...room,
            squareMeters: updatedFeatures?.room_size || room.squareMeters,
            features: updatedFeatures,
            details: {
              ...currentDetails,
              squareMeters: updatedFeatures?.room_size || room.squareMeters,
              features: updatedFeatures
            }
          };
        }
        return room;
      })
    }));
  },

  checkOctorateConnection: async () => {
    set({ octorateStatus: 'checking' });
    try {
      // Verify Octorate connection details
      const structureId = import.meta.env.VITE_OCTORATE_STRUCTURE_ID || '366879';
      const channelId = import.meta.env.VITE_OCTORATE_CHANNEL_ID || '233';

      set({
        octorateStatus: 'connected',
        octorateDetails: {
          structureId,
          channelId,
          lastSync: new Date().toISOString()
        }
      });
    } catch (e) {
      set({ octorateStatus: 'error' });
    }
  },

  setFilterCategory: (filterCategory) => set({ filterCategory }),

  setLastMinuteStage1Days: (days: number) => set({ lastMinuteStage1Days: Math.max(1, isNaN(days) ? 3 : days) }),
  setLastMinuteDiscountStage1: (pct: number) => set({ lastMinuteDiscountStage1: Math.max(0, Math.min(80, isNaN(pct) ? 10 : pct)) }),
  setLastMinuteStage2Days: (days: number) => set({ lastMinuteStage2Days: Math.max(1, isNaN(days) ? 2 : days) }),
  setLastMinuteDiscountStage2: (pct: number) => set({ lastMinuteDiscountStage2: Math.max(0, Math.min(80, isNaN(pct) ? 5 : pct)) }),
  setLastMinuteStage3Days: (days: number) => set({ lastMinuteStage3Days: Math.max(1, isNaN(days) ? 2 : days) }),
  setLastMinuteDiscountStage3: (pct: number) => set({ lastMinuteDiscountStage3: Math.max(0, Math.min(80, isNaN(pct) ? 2.5 : pct)) }),
  setExecutionMode: (mode: DiscountExecutionMode) => set({ executionMode: mode, isTestEnvironment: mode === 'test_bungalows', dynamicMinStayGapFill: mode !== 'simulation' }),
  setIsTestEnvironment: (enabled: boolean) => set({ isTestEnvironment: enabled, executionMode: enabled ? 'test_bungalows' : 'production', dynamicMinStayGapFill: true }),

  setIsSimulationActive: (active: boolean) => set({ isSimulationActive: active }),
  setSimulatedOctorateGridItems: (items: any[]) => set({ simulatedOctorateGridItems: Array.isArray(items) ? items : [] }),
  resetSimulation: () => set({ isSimulationActive: false, simulatedOctorateGridItems: [] }),

  executeLastMinuteStrategy: async () => {
    set({ lastMinuteRunning: true, lastMinuteExecuting: true });
    try {
      const {
        lastMinuteStage1Days,
        lastMinuteDiscountStage1,
        lastMinuteStage2Days,
        lastMinuteDiscountStage2,
        lastMinuteStage3Days,
        lastMinuteDiscountStage3,
        executionMode,
        octorateDetails
      } = get();

      const totalDays = lastMinuteStage1Days + lastMinuteStage2Days + lastMinuteStage3Days;
      const updates = calculateCascadeDiscountUpdates({
        stage1Days: lastMinuteStage1Days,
        stage1Discount: lastMinuteDiscountStage1,
        stage2Days: lastMinuteStage2Days,
        stage2Discount: lastMinuteDiscountStage2,
        stage3Days: lastMinuteStage3Days,
        stage3Discount: lastMinuteDiscountStage3,
        executionMode: executionMode,
        rawGridItems: get().rawOctorateGridItems
      });

      const simulatedItems = updates.map((u) => ({
        id: String(u.motherRateId),
        ratePlanId: String(u.motherRateId),
        motherRateId: String(u.motherRateId),
        accommodationName: u.accommodationName,
        dateStr: u.dateStr,
        basePrice: u.basePrice,
        originalPrice: u.basePrice,
        price: u.finalPrice,
        finalPrice: u.finalPrice,
        discountPercentage: u.discountPercentage,
        stage: u.stage,
        isSimulated: executionMode === 'simulation',
        isSimulatedDiscount: true,
        reason: u.reason,
        days: [{ date: u.dateStr, price: u.finalPrice, minStay: 2 }]
      }));

      if (executionMode === 'simulation') {
        set({
          isSimulationActive: true,
          simulatedOctorateGridItems: simulatedItems,
          lastMinuteResult: {
            success: true,
            message: `🟡 SIMULAZIONE DRY-RUN ATTIVA: Calcolati ${simulatedItems.length} sconti a cascata su Tariffe Madri per i prossimi ${totalDays} giorni (Stadio 1: ${lastMinuteStage1Days}gg @ -${lastMinuteDiscountStage1}%, Stadio 2: ${lastMinuteStage2Days}gg @ -${lastMinuteDiscountStage2}%, Stadio 3: ${lastMinuteStage3Days}gg @ -${lastMinuteDiscountStage3}%). Anteprima visibile nel calendario.`,
            dateUpdated: new Date().toISOString(),
            details: { updates: simulatedItems, totalUpdates: simulatedItems.length }
          },
          lastMinuteRunning: false,
          lastMinuteExecuting: false
        });
        return;
      }

      const res = await updateLastMinuteRatesStrategy(
        octorateDetails?.structureId || '366879',
        lastMinuteStage1Days,
        lastMinuteDiscountStage1,
        lastMinuteStage2Days,
        lastMinuteDiscountStage2,
        lastMinuteStage3Days,
        lastMinuteDiscountStage3,
        executionMode,
        get().isTestEnvironment,
        get().rawOctorateGridItems
      );
      if (res.success) {
        if (typeof window !== 'undefined') localStorage.setItem('fp_last_minute_active', 'true');
        set({ 
          lastMinuteResult: res, 
          lastMinuteRunning: false, 
          lastMinuteExecuting: false, 
          isLastMinuteActive: true,
          isSimulationActive: true,
          simulatedOctorateGridItems: simulatedItems
        });
      } else {
        set({ lastMinuteResult: res, lastMinuteRunning: false, lastMinuteExecuting: false });
      }
    } catch (err: any) {
      console.error('[useResortAdminStore] Last-Minute Strategy Error:', err);
      set({
        lastMinuteResult: {
          success: false,
          message: err.message || 'Errore durante l\'esecuzione dell\'automazione tariffe.',
          dateUpdated: new Date().toISOString()
        },
        lastMinuteRunning: false,
        lastMinuteExecuting: false
      });
    }
  },

  resetLastMinuteStrategy: async () => {
    set({ lastMinuteRunning: true, lastMinuteResetting: true });
    try {
      const {
        lastMinuteStage1Days,
        lastMinuteStage2Days,
        lastMinuteStage3Days,
        executionMode,
        octorateDetails
      } = get();

      if (executionMode === 'simulation') {
        set({
          isSimulationActive: false,
          simulatedOctorateGridItems: [],
          lastMinuteResult: {
            success: true,
            message: '🟡 SIMULAZIONE RESET: Anteprima disattivata. Prezzi riportati ai valori reali di partenza.',
            dateUpdated: new Date().toISOString()
          },
          lastMinuteRunning: false,
          lastMinuteResetting: false
        });
        return;
      }

      const res = await resetLastMinuteRatesStrategy(
        octorateDetails?.structureId || '366879',
        lastMinuteStage1Days,
        lastMinuteStage2Days,
        lastMinuteStage3Days,
        executionMode,
        get().isTestEnvironment,
        get().rawOctorateGridItems
      );
      if (res.success) {
        if (typeof window !== 'undefined') localStorage.setItem('fp_last_minute_active', 'false');
        set({ 
          lastMinuteResult: res, 
          lastMinuteRunning: false, 
          lastMinuteResetting: false, 
          isLastMinuteActive: false,
          isSimulationActive: false,
          simulatedOctorateGridItems: []
        });
      } else {
        set({ lastMinuteResult: res, lastMinuteRunning: false, lastMinuteResetting: false });
      }
    } catch (err: any) {
      console.error('[useResortAdminStore] Reset Last-Minute Strategy Error:', err);
      set({
        lastMinuteResult: {
          success: false,
          message: err.message || 'Errore durante il ripristino dei prezzi originali.',
          dateUpdated: new Date().toISOString()
        },
        lastMinuteRunning: false,
        lastMinuteResetting: false
      });
    }
  },

  disableLastMinuteStrategy: async () => {
    set({ lastMinuteRunning: true, lastMinuteResetting: true });
    try {
      const {
        lastMinuteStage1Days,
        lastMinuteStage2Days,
        lastMinuteStage3Days,
        executionMode,
        octorateDetails
      } = get();

      const res = await resetLastMinuteRatesStrategy(
        octorateDetails?.structureId || '366879',
        lastMinuteStage1Days,
        lastMinuteStage2Days,
        lastMinuteStage3Days,
        executionMode,
        get().isTestEnvironment,
        get().rawOctorateGridItems
      );
      if (typeof window !== 'undefined') localStorage.setItem('fp_last_minute_active', 'false');
      set({ lastMinuteResult: res, lastMinuteRunning: false, lastMinuteResetting: false, isLastMinuteActive: false, isSimulationActive: false, simulatedOctorateGridItems: [] });
    } catch (err: any) {
      console.error('[useResortAdminStore] Disable Last-Minute Strategy Error:', err);
      set({
        lastMinuteResult: {
          success: false,
          message: err.message || 'Errore durante la disabilitazione dell\'automazione tariffe.',
          dateUpdated: new Date().toISOString()
        },
        lastMinuteRunning: false,
        lastMinuteResetting: false
      });
    }
  },

  recalculateLastMinuteItems: () => {
    const {
      lastMinuteStage1Days,
      lastMinuteDiscountStage1,
      lastMinuteStage2Days,
      lastMinuteDiscountStage2,
      lastMinuteStage3Days,
      lastMinuteDiscountStage3,
      executionMode,
      isLastMinuteActive,
      isSimulationActive,
      rawOctorateGridItems
    } = get();

    if (isLastMinuteActive || isSimulationActive) {
      const updates = calculateCascadeDiscountUpdates({
        stage1Days: lastMinuteStage1Days,
        stage1Discount: lastMinuteDiscountStage1,
        stage2Days: lastMinuteStage2Days,
        stage2Discount: lastMinuteDiscountStage2,
        stage3Days: lastMinuteStage3Days,
        stage3Discount: lastMinuteDiscountStage3,
        executionMode: executionMode,
        rawGridItems: rawOctorateGridItems
      });

      const simulatedItems = updates.map((u) => ({
        id: String(u.motherRateId),
        ratePlanId: String(u.motherRateId),
        motherRateId: String(u.motherRateId),
        accommodationName: u.accommodationName,
        dateStr: u.dateStr,
        basePrice: u.basePrice,
        originalPrice: u.basePrice,
        price: u.finalPrice,
        finalPrice: u.finalPrice,
        discountPercentage: u.discountPercentage,
        stage: u.stage,
        isSimulated: executionMode === 'simulation',
        isSimulatedDiscount: true,
        reason: u.reason,
        days: [{ date: u.dateStr, price: u.finalPrice, minStay: 2 }]
      }));

      set({
        isSimulationActive: true,
        simulatedOctorateGridItems: simulatedItems
      });
    }
  },

  autoAdvanceDailyLastMinute: async () => {
    // 1. Proietta istantaneamente gli sconti aggiornati alla data odierna sul Calendario
    get().recalculateLastMinuteItems();

    const { isLastMinuteActive, executionMode, octorateDetails, lastMinuteRunning } = get();
    if (!isLastMinuteActive || executionMode === 'simulation' || lastMinuteRunning) {
      return;
    }

    const todayStr = toThailandDateStr(new Date());
    const lastSyncDate = typeof window !== 'undefined' ? localStorage.getItem('fp_last_minute_sync_date') : '';

    if (todayStr && todayStr !== lastSyncDate) {
      console.log(`[useResortAdminStore] 🔄 Daily Auto-Advance detected: Shifting cascade window to ${todayStr} (Last sync: ${lastSyncDate})`);
      try {
        const {
          lastMinuteStage1Days,
          lastMinuteDiscountStage1,
          lastMinuteStage2Days,
          lastMinuteDiscountStage2,
          lastMinuteStage3Days,
          lastMinuteDiscountStage3,
          rawOctorateGridItems
        } = get();

        const res = await updateLastMinuteRatesStrategy(
          octorateDetails?.structureId || '366879',
          lastMinuteStage1Days,
          lastMinuteDiscountStage1,
          lastMinuteStage2Days,
          lastMinuteDiscountStage2,
          lastMinuteStage3Days,
          lastMinuteDiscountStage3,
          executionMode,
          get().isTestEnvironment,
          rawOctorateGridItems
        );

        if (res.success) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('fp_last_minute_sync_date', todayStr);
          }
          console.log(`[useResortAdminStore] ✅ Daily Auto-Advance sync to Octorate completed for ${todayStr}`);
        }
      } catch (e: any) {
        console.error('[useResortAdminStore] ❌ Daily Auto-Advance sync error:', e);
      }
    }
  },

  addPromoCode: (promoData) => {
    const newPromo: PromoCode = {
      ...promoData,
      id: `promo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      code: promoData.code.trim().toUpperCase(),
      slotsUsed: 0,
      createdAt: new Date().toISOString()
    };
    const updated = [newPromo, ...get().promoCodes];
    savePromoCodesToStorage(updated);
    set({ promoCodes: updated });
  },

  togglePromoCodeActive: (id) => {
    const updated = get().promoCodes.map((p) =>
      p.id === id ? { ...p, active: !p.active } : p
    );
    savePromoCodesToStorage(updated);
    set({ promoCodes: updated });
  },

  deletePromoCode: (id) => {
    const updated = get().promoCodes.filter((p) => p.id !== id);
    savePromoCodesToStorage(updated);
    set({ promoCodes: updated });
  },

  incrementPromoCodeUsage: (codeOrId) => {
    const target = codeOrId.trim().toUpperCase();
    const updated = get().promoCodes.map((p) => {
      if (p.id === codeOrId || p.code.toUpperCase() === target) {
        const nextUsed = p.slotsUsed + 1;
        return {
          ...p,
          slotsUsed: nextUsed,
          active: p.isSingleUse && nextUsed >= p.slotsTotal ? false : p.active
        };
      }
      return p;
    });
    savePromoCodesToStorage(updated);
    set({ promoCodes: updated });
  },

  refreshPromoCodes: () => {
    const refreshed = loadPromoCodesFromStorage();
    set({ promoCodes: refreshed });
  },

  cachedImportTime: loadCachedImportTime(),

  saveToCache: (bookingsToSave, gridToSave) => {
    if (typeof window === 'undefined') return;
    try {
      const nowIso = new Date().toISOString();
      const b = bookingsToSave || get().rawOctorateBookings || [];
      const g = gridToSave || get().rawOctorateGridItems || [];

      localStorage.setItem('fpv_octorate_cache_bookings', JSON.stringify(b));
      localStorage.setItem('fpv_octorate_cache_grid', JSON.stringify(g));
      localStorage.setItem('fpv_octorate_cache_time', nowIso);

      set({ cachedImportTime: nowIso });
      console.log('[useResortAdminStore] Salvataggio locale in cache completato:', nowIso);
    } catch (e) {
      console.error('[useResortAdminStore] Errore salvataggio cache localStorage:', e);
    }
  },

  loadFromCache: () => {
    if (typeof window === 'undefined') return false;
    try {
      const rawB = localStorage.getItem('fpv_octorate_cache_bookings');
      const rawG = localStorage.getItem('fpv_octorate_cache_grid');
      const time = localStorage.getItem('fpv_octorate_cache_time');

      if (!rawB || !time) {
        console.warn('[useResortAdminStore] Nessuna cache trovata in localStorage.');
        return false;
      }

      const parsedB = JSON.parse(rawB);
      const parsedG = rawG ? JSON.parse(rawG) : [];

      const filteredB = Array.isArray(parsedB) ? parsedB.filter(isValidActiveBooking) : [];

      set({
        rawOctorateBookings: Array.isArray(parsedB) ? parsedB : [],
        bookings: filteredB,
        rawOctorateGridItems: Array.isArray(parsedG) ? parsedG : [],
        cachedImportTime: time,
        seasonDownloadStatus: 'completed',
        seasonDownloadProgress: 100,
        seasonDownloadMessage: `Dati caricati da cache locale (${new Date(time).toLocaleString('it-IT')})`
      });

      console.log('[useResortAdminStore] Dati Octorate caricati dalla cache locale con successo!');
      return true;
    } catch (e) {
      console.error('[useResortAdminStore] Errore caricamento cache da localStorage:', e);
      return false;
    }
  },

  verifiedWritability: loadVerifiedWritabilityFromStorage(),
  isTestingWritability: false,
  testingProgress: null,

  verifyAllRatesWritability: async (rates: { id: string; name: string }[]) => {
    if (!rates || rates.length === 0) return;

    set({
      isTestingWritability: true,
      testingProgress: { activeRateName: rates[0].name, completed: 0, total: rates.length }
    });

    const currentMap = { ...get().verifiedWritability };

    for (let i = 0; i < rates.length; i++) {
      const rate = rates[i];
      set({
        testingProgress: { activeRateName: rate.name, completed: i, total: rates.length }
      });

      try {
        const response = await fetch(`/api/verify-writability?rateId=${encodeURIComponent(rate.id)}`);
        if (response.ok) {
          const data = await response.json();
          currentMap[rate.id] = Boolean(data.isWritable);
        } else {
          currentMap[rate.id] = false;
        }
      } catch (err) {
        console.warn(`[verifyAllRatesWritability] Error testing rate #${rate.id} (${rate.name}):`, err);
        currentMap[rate.id] = false;
      }

      set({ verifiedWritability: { ...currentMap } });

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_WRITABILITY, JSON.stringify(currentMap));
        } catch (e) {
          console.error('[useResortAdminStore] Failed to save writability to localStorage:', e);
        }
      }
    }

    set({
      isTestingWritability: false,
      testingProgress: null
    });
  },

  testingSlugs: {},
  accommodationTestingProgress: {},

  verifyAccommodationWritability: async (slug: string, rates: { id: string; name: string }[]) => {
    if (!slug || !rates || rates.length === 0) return;

    set((state) => ({
      testingSlugs: { ...state.testingSlugs, [slug]: true },
      accommodationTestingProgress: {
        ...state.accommodationTestingProgress,
        [slug]: { activeRateName: rates[0].name, completed: 0, total: rates.length }
      }
    }));

    const currentMap = { ...get().verifiedWritability };

    for (let i = 0; i < rates.length; i++) {
      const rate = rates[i];

      set((state) => ({
        accommodationTestingProgress: {
          ...state.accommodationTestingProgress,
          [slug]: { activeRateName: rate.name, completed: i, total: rates.length }
        }
      }));

      try {
        const response = await fetch(`/api/verify-writability?rateId=${encodeURIComponent(rate.id)}`);
        if (response.ok) {
          const data = await response.json();
          currentMap[rate.id] = Boolean(data.isWritable);
        } else {
          currentMap[rate.id] = false;
        }
      } catch (err) {
        console.warn(`[verifyAccommodationWritability] Error testing rate #${rate.id} (${rate.name}):`, err);
        currentMap[rate.id] = false;
      }

      set({ verifiedWritability: { ...currentMap } });

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_WRITABILITY, JSON.stringify(currentMap));
        } catch (e) {
          console.error('[useResortAdminStore] Failed to save writability to localStorage:', e);
        }
      }
    }

    set((state) => {
      const updatedSlugs = { ...state.testingSlugs };
      delete updatedSlugs[slug];
      const updatedProgress = { ...state.accommodationTestingProgress };
      delete updatedProgress[slug];
      return {
        testingSlugs: updatedSlugs,
        accommodationTestingProgress: updatedProgress
      };
    });
  },

  toggleRateStopSell: async (rateId: string, stopSell: boolean, dateISO?: string) => {
    if (!rateId) return false;
    try {
      const response = await fetch('/api/update-restriction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rateId, stopSell, dateFrom: dateISO, dateTo: dateISO })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[toggleRateStopSell] Error updating rate #${rateId}:`, errText);
        return false;
      }

      const data = await response.json();
      if (data.success) {
        set((state) => {
          const updatedRaw = state.rawOctorateGridItems.map((item) => {
            if (String(item.id || item.ratePlanId || item.rate_id) === String(rateId)) {
              return { ...item, stopSell, stopSells: stopSell };
            }
            return item;
          });
          const updatedSim = state.simulatedOctorateGridItems.map((item) => {
            if (String(item.id || item.ratePlanId || item.rate_id) === String(rateId)) {
              return { ...item, stopSell, stopSells: stopSell };
            }
            return item;
          });
          return { rawOctorateGridItems: updatedRaw, simulatedOctorateGridItems: updatedSim };
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error(`[toggleRateStopSell] Exception updating rate #${rateId}:`, err);
      return false;
    }
  }
}));
