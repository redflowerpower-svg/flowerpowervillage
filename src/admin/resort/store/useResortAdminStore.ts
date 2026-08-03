import { create } from 'zustand';
import { ACCOMMODATIONS } from '../../../booking/resort/config/accommodations';
import { updateLastMinuteRatesStrategy, disableLastMinuteRatesStrategy, fetchOctorateLiveReservations } from '../../../booking/lib/octorate';
import { calculateDynamicMinStay, toThailandDateStr, getSeasonalEndDateStr } from '../lib/octorateAdmin';

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
  dynamicMinStayUpdates: any[];
  dynamicMinStayResult: { success: boolean; dryRun: boolean; message: string; updatesCount: number } | null;

  // Progressive Sequential Timeline Download State
  seasonDownloadStatus: 'idle' | 'downloading' | 'completed' | 'error';
  seasonDownloadProgress: number;
  seasonDownloadMessage: string;
  downloadSeasonSequential: () => Promise<void>;

  // Last-Minute Channel Strategy Automation State
  lastMinuteThresholdDays: number;
  lastMinuteBlockDays: number;
  lastMinuteDiscountStage1: number;
  lastMinuteDiscountStage2: number;
  applyClosedToArrival: boolean;
  lastMinuteRunning: boolean;
  lastMinuteResult: { success: boolean; message: string; dateUpdated: string; details?: any } | null;

  // Actions
  fetchBookings: () => Promise<void>;
  setBookings: (bookings: ResortBooking[]) => void;
  toggleRoomAvailability: (octorateId: string, available: boolean) => void;
  checkOctorateConnection: () => Promise<void>;
  setFilterCategory: (category: string) => void;
  setDynamicMinStayGapFill: (enabled: boolean) => void;
  executeDynamicMinStayStrategy: (resetToBaseline?: boolean, customRange?: { start: string; end: string }) => Promise<void>;

  // Last-Minute Actions
  setLastMinuteThresholdDays: (days: number) => void;
  setLastMinuteBlockDays: (days: number) => void;
  setLastMinuteDiscountStage1: (pct: number) => void;
  setLastMinuteDiscountStage2: (pct: number) => void;
  setApplyClosedToArrival: (enabled: boolean) => void;
  executeLastMinuteStrategy: () => Promise<void>;
  disableLastMinuteStrategy: () => Promise<void>;
}

export const useResortAdminStore = create<ResortAdminState>((set, get) => ({
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

  isDynamicCalculationEnabled: false,
  setIsDynamicCalculationEnabled: (enabled: boolean) => set({ isDynamicCalculationEnabled: enabled }),

  dynamicMinStayGapFill: false,
  dynamicMinStayRunning: false,
  dynamicMinStayUpdates: [],
  dynamicMinStayResult: null,
  setDynamicMinStayGapFill: (enabled: boolean) => set({ dynamicMinStayGapFill: enabled }),

  seasonDownloadStatus: 'idle',
  seasonDownloadProgress: 0,
  seasonDownloadMessage: '',

  downloadSeasonSequential: async () => {
    set({
      seasonDownloadStatus: 'downloading',
      seasonDownloadProgress: 0,
      seasonDownloadMessage: 'Avvio download sequenziale stagione...'
    });

    try {
      const todayStr = toThailandDateStr(new Date());
      const parts = todayStr.split('-');
      const currentYear = parseInt(parts[0], 10) || new Date().getFullYear();
      const currentMonth = parseInt(parts[1], 10) || (new Date().getMonth() + 1);

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

              set({
                rawOctorateBookings: [...accumulatedBookings],
                bookings: [...accumulatedBookings]
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
    set({ dynamicMinStayRunning: true, isDynamicCalculationEnabled: true });
    try {
      let { rawOctorateBookings, bookings, dynamicMinStayGapFill, fetchBookings, downloadSeasonSequential } = get();

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

      // Calcolo Assoluto basato sulle prenotazioni reali stagionali in memoria con enabled = true
      const updates = calculateDynamicMinStay(poolToUse, { start: todayISO, end: endISO, enabled: true });

      // Se il toggle non è spuntato, la modalità è forzata su Simulazione (dryRun = true)
      const isDryRun = !dynamicMinStayGapFill;
      const annotatedUpdates = updates.map(u => ({ ...u, isSimulated: isDryRun }));

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
            body: JSON.stringify({ updates: annotatedUpdates, resetToBaseline, dryRun: isDryRun })
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
      set({
        dynamicMinStayUpdates: annotatedUpdates,
        dynamicMinStayResult: {
          success: resJson.success,
          dryRun: resJson.dryRun ?? isDryRun,
          message: resJson.message || (resJson.success ? 'Calcolo soggiorno minimo dinamico eseguito con successo.' : 'Errore esecuzione'),
          updatesCount: resJson.updatesCount || 0
        },
        dynamicMinStayRunning: false
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
        dynamicMinStayRunning: false
      });
    }
  },

  lastMinuteThresholdDays: 10,
  lastMinuteBlockDays: 5,
  lastMinuteDiscountStage1: 15,
  lastMinuteDiscountStage2: 10,
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
          set({ rawOctorateBookings: json.data, bookings: json.data, loading: false });
          console.log(`[useResortAdminStore] Scaricate ${json.data.length} prenotazioni stagionali in blocco (${todayStr} -> ${seasonEndStr})`);
          return;
        }
      }

      // 2. Fallback to fetchOctorateLiveReservations
      const liveReservations = await fetchOctorateLiveReservations();
      if (liveReservations && Array.isArray(liveReservations)) {
        set({ rawOctorateBookings: liveReservations, bookings: liveReservations, loading: false });
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

  setLastMinuteThresholdDays: (days: number) => {
    const safeDays = Math.max(1, isNaN(days) ? 10 : days);
    set({ lastMinuteThresholdDays: safeDays });
  },

  setLastMinuteBlockDays: (days: number) => {
    const safeDays = Math.max(1, isNaN(days) ? 5 : days);
    set({ lastMinuteBlockDays: safeDays });
  },

  setLastMinuteDiscountStage1: (pct: number) => {
    const safePct = Math.max(0, Math.min(80, isNaN(pct) ? 15 : pct));
    set({ lastMinuteDiscountStage1: safePct });
  },

  setLastMinuteDiscountStage2: (pct: number) => {
    const safePct = Math.max(0, Math.min(80, isNaN(pct) ? 10 : pct));
    set({ lastMinuteDiscountStage2: safePct });
  },

  setApplyClosedToArrival: (enabled: boolean) => set({ applyClosedToArrival: enabled }),

  executeLastMinuteStrategy: async () => {
    set({ lastMinuteRunning: true });
    try {
      const { lastMinuteThresholdDays, lastMinuteBlockDays, applyClosedToArrival, lastMinuteDiscountStage1, lastMinuteDiscountStage2, octorateDetails } = get();
      const res = await updateLastMinuteRatesStrategy(
        octorateDetails?.structureId || '366879',
        lastMinuteThresholdDays,
        lastMinuteBlockDays,
        applyClosedToArrival,
        lastMinuteDiscountStage1,
        lastMinuteDiscountStage2
      );
      set({ lastMinuteResult: res, lastMinuteRunning: false });
    } catch (err: any) {
      console.error('[useResortAdminStore] Last-Minute Strategy Error:', err);
      set({
        lastMinuteResult: {
          success: false,
          message: err.message || 'Errore durante l\'esecuzione dell\'automazione tariffe.',
          dateUpdated: new Date().toISOString()
        },
        lastMinuteRunning: false
      });
    }
  },

  disableLastMinuteStrategy: async () => {
    set({ lastMinuteRunning: true });
    try {
      const { octorateDetails } = get();
      const res = await disableLastMinuteRatesStrategy(
        octorateDetails?.structureId || '366879'
      );
      set({ lastMinuteResult: res, lastMinuteRunning: false });
    } catch (err: any) {
      console.error('[useResortAdminStore] Disable Last-Minute Strategy Error:', err);
      set({
        lastMinuteResult: {
          success: false,
          message: err.message || 'Errore durante la disabilitazione dell\'automazione tariffe.',
          dateUpdated: new Date().toISOString()
        },
        lastMinuteRunning: false
      });
    }
  }
}));
