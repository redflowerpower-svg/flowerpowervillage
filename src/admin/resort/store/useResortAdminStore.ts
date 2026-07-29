import { create } from 'zustand';
import { ACCOMMODATIONS } from '../../../booking/resort/config/accommodations';
import { updateLastMinuteRatesStrategy, disableLastMinuteRatesStrategy, fetchOctorateLiveReservations } from '../../../booking/lib/octorate';
import { calculateDynamicMinStay } from '../lib/octorateAdmin';

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
  accommodations: AccommodationStatus[];
  loading: boolean;
  error: string | null;
  octorateStatus: 'connected' | 'checking' | 'error';
  octorateDetails: { structureId: string; channelId: string; lastSync?: string };
  filterCategory: string;

  // Dynamic Minimum Stay (Gap-Fill) State & Execution
  dynamicMinStayGapFill: boolean;
  dynamicMinStayRunning: boolean;
  dynamicMinStayResult: { success: boolean; dryRun: boolean; message: string; updatesCount: number } | null;

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
  executeDynamicMinStayStrategy: (resetToBaseline?: boolean) => Promise<void>;

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

  dynamicMinStayGapFill: true,
  dynamicMinStayRunning: false,
  dynamicMinStayResult: null,
  setDynamicMinStayGapFill: (enabled: boolean) => set({ dynamicMinStayGapFill: enabled }),

  executeDynamicMinStayStrategy: async (resetToBaseline: boolean = false) => {
    set({ dynamicMinStayRunning: true });
    try {
      const { bookings } = get();
      const todayISO = new Date().toISOString().substring(0, 10);
      const next60Days = new Date();
      next60Days.setDate(next60Days.getDate() + 60);
      const endISO = next60Days.toISOString().substring(0, 10);

      const updates = calculateDynamicMinStay(bookings, { start: todayISO, end: endISO });

      const apiRes = await fetch('/api/resort/octorate/min-stay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates, resetToBaseline })
      });

      const resJson = await apiRes.json();
      set({
        dynamicMinStayResult: {
          success: resJson.success,
          dryRun: resJson.dryRun,
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
      set({ bookings: newBookings });
    }
  },

  fetchBookings: async () => {
    set({ loading: true, error: null });
    try {
      // 1. Fetch live reservations via serverless endpoint /api/resort/octorate-bookings
      const res = await fetch('/api/resort/octorate-bookings');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          set({ bookings: json.data, loading: false });
          console.log(`[useResortAdminStore] Popolate ${json.data.length} prenotazioni dall'endpoint serverless octorate-bookings`);
          return;
        }
      }

      // 2. Fallback to fetchOctorateLiveReservations
      const liveReservations = await fetchOctorateLiveReservations();
      if (liveReservations && Array.isArray(liveReservations)) {
        set({ bookings: liveReservations, loading: false });
        return;
      }

      set({ bookings: [], loading: false });
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
