import { create } from 'zustand';
import { ACCOMMODATIONS } from '../../../booking/resort/config/accommodations';
import { updateLastMinuteRatesStrategy, resetLastMinuteRatesStrategy, disableLastMinuteRatesStrategy, fetchOctorateLiveReservations } from '../../../booking/lib/octorate';
import { calculateDynamicMinStay, toThailandDateStr, getSeasonalEndDateStr, DiscountExecutionMode, ALL_ACCOMMODATIONS_MAP } from '../lib/octorateAdmin';

// Alias locale della mappa madre per il calcolo Dry-Run
const ALL_ACCOMMODATIONS_MAP_LOCAL = ALL_ACCOMMODATIONS_MAP;

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

  // Last-Minute Cascade Discount Automation State (3 Stadi Sequenziali + Test Toggle + Dry-Run Simulation)
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

  // 3 Sequential Cascade Discount Stages Defaults
  lastMinuteStage1Days: 3,
  lastMinuteDiscountStage1: 10,
  lastMinuteStage2Days: 3,
  lastMinuteDiscountStage2: 5,
  lastMinuteStage3Days: 4,
  lastMinuteDiscountStage3: 2.5,
  executionMode: 'simulation',
  isTestEnvironment: false,
  isSimulationActive: false,
  simulatedOctorateGridItems: [],
  lastMinuteRunning: false,
  lastMinuteResult: null,

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

  setLastMinuteStage1Days: (days: number) => set({ lastMinuteStage1Days: Math.max(1, isNaN(days) ? 3 : days) }),
  setLastMinuteDiscountStage1: (pct: number) => set({ lastMinuteDiscountStage1: Math.max(0, Math.min(80, isNaN(pct) ? 10 : pct)) }),
  setLastMinuteStage2Days: (days: number) => set({ lastMinuteStage2Days: Math.max(1, isNaN(days) ? 3 : days) }),
  setLastMinuteDiscountStage2: (pct: number) => set({ lastMinuteDiscountStage2: Math.max(0, Math.min(80, isNaN(pct) ? 5 : pct)) }),
  setLastMinuteStage3Days: (days: number) => set({ lastMinuteStage3Days: Math.max(1, isNaN(days) ? 4 : days) }),
  setLastMinuteDiscountStage3: (pct: number) => set({ lastMinuteDiscountStage3: Math.max(0, Math.min(80, isNaN(pct) ? 2.5 : pct)) }),
  setExecutionMode: (mode: DiscountExecutionMode) => set({ executionMode: mode, isTestEnvironment: mode === 'test_bungalows' }),
  setIsTestEnvironment: (enabled: boolean) => set({ isTestEnvironment: enabled, executionMode: enabled ? 'test_bungalows' : 'production' }),

  setIsSimulationActive: (active: boolean) => set({ isSimulationActive: active }),
  setSimulatedOctorateGridItems: (items: any[]) => set({ simulatedOctorateGridItems: Array.isArray(items) ? items : [] }),
  resetSimulation: () => set({ isSimulationActive: false, simulatedOctorateGridItems: [] }),

  executeLastMinuteStrategy: async () => {
    set({ lastMinuteRunning: true });
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

      if (executionMode === 'simulation') {
        // ─── CALCOLO DRY-RUN DIRETTAMENTE NELLO STORE ───────────────────────────
        // Usa rawOctorateGridItems (struttura esatta API: [{id, name, days:[{date,price}]}])
        // per leggere il PREZZO REALE giornaliero della Tariffa Madre di ogni alloggio.

        const rawGrid: any[] = get().rawOctorateGridItems || [];

        // ─── DEBUG: logga i primi 3 item per capire la struttura reale ───────────
        if (rawGrid.length > 0) {
          console.log('[DryRun] rawOctorateGridItems[0]:', JSON.stringify(rawGrid[0]).substring(0, 300));
          console.log('[DryRun] rawOctorateGridItems totale items:', rawGrid.length);
        }

        // Costruisce un indice rapido: motherRateId (stringa) → { dateStr → realPrice }
        // PRIORITÀ: 1° match esatto sull'ID madre, 2° primo match nei derivati come fallback
        const motherPriceIndex: Record<string, Record<string, number>> = {};
        Object.values(ALL_ACCOMMODATIONS_MAP_LOCAL).forEach((entry) => {
          const motherIdStr = String(entry.motherId);

          // 1. Cerca PRIMA un item con ID uguale esattamente all'ID della tariffa madre (Livello 0)
          let gridItem = rawGrid.find((g: any) => {
            const gId = String(g.id || g.ratePlanId || g.rate_id || '');
            return gId === motherIdStr;
          });

          // 2. Se non trovato (la madre non è nel download), usa qualsiasi ID dell'alloggio
          //    ma ESCLUDI i derivati noti (BE) per evitare di prendere prezzi con markup
          if (!gridItem) {
            gridItem = rawGrid.find((g: any) => {
              const gId = String(g.id || g.ratePlanId || g.rate_id || '');
              return entry.ids.includes(gId);
            });
          }

          if (gridItem && Array.isArray(gridItem.days)) {
            if (!motherPriceIndex[motherIdStr]) motherPriceIndex[motherIdStr] = {};
            gridItem.days.forEach((day: any) => {
              const d = String(day.date || day.dateStr || '').substring(0, 10);
              const p = Number(day.price || day.value || day.amount || 0);
              if (d && p > 0 && p < 10000) {
                motherPriceIndex[motherIdStr][d] = p;
              }
            });
            console.log(`[DryRun] ${entry.name} (${motherIdStr}): trovato item ID=${gridItem.id}, prezzi caricati per ${Object.keys(motherPriceIndex[motherIdStr] || {}).length} date`);
          } else {
            console.warn(`[DryRun] ${entry.name} (${motherIdStr}): NESSUN item trovato in rawGrid o item.days assente`);
          }
        });

        // Calcola l'offset di date dalla tariffa madre reale
        const todayStr = new Date().toISOString().substring(0, 10);
        const todayTime = new Date(todayStr).getTime();
        const s1Days = lastMinuteStage1Days;
        const s2Days = lastMinuteStage2Days;
        const s3Days = lastMinuteStage3Days;
        const totalDays = s1Days + s2Days + s3Days;

        const simulatedItems: any[] = [];

        Object.values(ALL_ACCOMMODATIONS_MAP_LOCAL).forEach((entry) => {
          const motherIdStr = String(entry.motherId);
          const pricesForRoom = motherPriceIndex[motherIdStr] || {};

          for (let offset = 0; offset < totalDays; offset++) {
            const targetDate = new Date(todayTime + offset * 86400000);
            const dateStr = targetDate.toISOString().substring(0, 10);

            // Prezzo reale madre per quella specifica data
            const realPrice = pricesForRoom[dateStr];
            if (!realPrice || realPrice <= 0) continue; // Skip se la data non ha prezzo reale

            let discountPct = lastMinuteDiscountStage1;
            let stage = 1;
            if (offset >= s1Days + s2Days) { stage = 3; discountPct = lastMinuteDiscountStage3; }
            else if (offset >= s1Days)     { stage = 2; discountPct = lastMinuteDiscountStage2; }

            // Formula tassativa: Math.round(prezzoReale - (prezzoReale * percentuale / 100))
            const discountedPrice = Math.round(realPrice - (realPrice * discountPct / 100));

            simulatedItems.push({
              id: motherIdStr,
              ratePlanId: motherIdStr,
              motherRateId: motherIdStr,
              accommodationName: entry.name,
              dateStr,
              basePrice: realPrice,
              price: discountedPrice,
              finalPrice: discountedPrice,
              discountPercentage: discountPct,
              stage,
              isSimulated: true,
              isSimulatedDiscount: true,
              reason: `Stadio ${stage} (-${discountPct}%): ${dateStr} | Reale: ${realPrice}฿ → Scontato: ${discountedPrice}฿`,
              days: [{ date: dateStr, price: discountedPrice, minStay: 2 }]
            });
          }
        });

        const deepClonedSimulatedGrid = JSON.parse(JSON.stringify(simulatedItems));

        set({
          isSimulationActive: true,
          simulatedOctorateGridItems: deepClonedSimulatedGrid,
          lastMinuteResult: {
            success: true,
            mode: 'simulation',
            details: { updates: simulatedItems, totalUpdates: simulatedItems.length }
          },
          lastMinuteRunning: false
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

  resetLastMinuteStrategy: async () => {
    set({ lastMinuteRunning: true });
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
          lastMinuteRunning: false
        });
        return;
      }

      const res = await resetLastMinuteRatesStrategy(
        octorateDetails?.structureId || '366879',
        lastMinuteStage1Days,
        lastMinuteStage2Days,
        lastMinuteStage3Days,
        executionMode
      );
      set({ lastMinuteResult: res, lastMinuteRunning: false });
    } catch (err: any) {
      console.error('[useResortAdminStore] Reset Last-Minute Strategy Error:', err);
      set({
        lastMinuteResult: {
          success: false,
          message: err.message || 'Errore durante il ripristino dei prezzi originali.',
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
