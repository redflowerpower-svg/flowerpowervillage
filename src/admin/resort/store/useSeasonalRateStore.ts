import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SeasonalPeriod {
  id: string;
  name: string;
  dateFrom: string; // "YYYY-MM-DD" or "DD/MM/YYYY"
  dateTo: string;   // "YYYY-MM-DD" or "DD/MM/YYYY"
  label?: string;
}

export interface MotherRateInfo {
  motherId: number;
  roomName: string;
  shortName: string;
  line1: string;
  line2: string;
  category: string;
}

export const MOTHER_RATES: MotherRateInfo[] = [
  { motherId: 529773, roomName: 'Jungle Villa', shortName: 'Jungle Villa', line1: 'Jungle', line2: 'Villa', category: 'Ville' },
  { motherId: 495795, roomName: 'Jungle Villa Left', shortName: 'JV Left', line1: 'Jungle Villa', line2: 'Left', category: 'Ville' },
  { motherId: 495796, roomName: 'Jungle Villa Right', shortName: 'JV Right', line1: 'Jungle Villa', line2: 'Right', category: 'Ville' },
  { motherId: 494840, roomName: 'Peace & Love Villa', shortName: 'Peace & Love', line1: 'Peace & Love', line2: 'Villa', category: 'Ville' },
  { motherId: 421511, roomName: 'Penthouse Villa', shortName: 'Penthouse', line1: 'Penthouse', line2: 'Villa', category: 'Ville' },
  { motherId: 293957, roomName: 'Yellow Bungalow', shortName: 'Yellow Bung.', line1: 'Yellow', line2: 'Bungalow', category: 'Bungalow' },
  { motherId: 293954, roomName: 'Red Bungalow', shortName: 'Red Bung.', line1: 'Red', line2: 'Bungalow', category: 'Bungalow' },
  { motherId: 293962, roomName: 'Green Bungalow', shortName: 'Green Bung.', line1: 'Green', line2: 'Bungalow', category: 'Bungalow' },
  { motherId: 293965, roomName: 'Camel Tent Bungalow', shortName: 'Camel Tent', line1: 'Camel Tent', line2: 'Bungalow', category: 'Tende' },
  { motherId: 293955, roomName: 'Lagoon Tent Bungalow', shortName: 'Lagoon Tent', line1: 'Lagoon Tent', line2: 'Bungalow', category: 'Tende' },
  { motherId: 293942, roomName: 'Hub Internal Room', shortName: 'Internal Room', line1: 'Internal', line2: 'Room', category: 'The Hub' },
  { motherId: 293963, roomName: 'Hub Room 1', shortName: 'Room 1', line1: 'Hub Room', line2: '1', category: 'The Hub' },
  { motherId: 293959, roomName: 'Hub Room 2', shortName: 'Room 2', line1: 'Hub Room', line2: '2', category: 'The Hub' },
  { motherId: 293948, roomName: 'Hub Room 3', shortName: 'Room 3', line1: 'Hub Room', line2: '3', category: 'The Hub' },
  { motherId: 293945, roomName: 'Hub Room 4', shortName: 'Room 4', line1: 'Hub Room', line2: '4', category: 'The Hub' },
  { motherId: 293943, roomName: 'Hub Room 5', shortName: 'Room 5', line1: 'Hub Room', line2: '5', category: 'The Hub' },
  { motherId: 293951, roomName: 'Lodge 1', shortName: 'Lodge 1', line1: 'Lodge 1', line2: 'Hub', category: 'The Hub' },
  { motherId: 883795, roomName: 'Lodge 2', shortName: 'Lodge 2', line1: 'Lodge 2', line2: 'Hub', category: 'The Hub' }
];

export const DEFAULT_PERIODS: SeasonalPeriod[] = [
  { id: 'p1', name: 'P1 · Inizio Inverno', dateFrom: '2026-11-01', dateTo: '2026-12-20', label: 'Alta Stagione' },
  { id: 'p2', name: 'P2 · Peak Season (Natale & Capodanno)', dateFrom: '2026-12-21', dateTo: '2027-01-15', label: 'Peak Season' },
  { id: 'p3', name: 'P3 · Mid Winter Peak', dateFrom: '2027-01-16', dateTo: '2027-01-31', label: 'Peak Season' },
  { id: 'p4', name: 'P4 · Tardo Inverno', dateFrom: '2027-02-01', dateTo: '2027-03-31', label: 'Alta Stagione' },
  { id: 'p5', name: 'P5 · Primavera Songkran', dateFrom: '2027-04-01', dateTo: '2027-04-30', label: 'Alta Stagione' },
  { id: 'p6', name: 'P6 · Inizio Stagione Verde', dateFrom: '2027-05-01', dateTo: '2027-06-30', label: 'Bassa Stagione' },
  { id: 'p7', name: 'P7 · Mid Green Season', dateFrom: '2027-07-01', dateTo: '2027-08-31', label: 'Bassa Stagione' },
  { id: 'p8', name: 'P8 · Tarda Stagione Verde', dateFrom: '2027-09-01', dateTo: '2027-10-31', label: 'Bassa Stagione' },
  { id: 'p9', name: 'P9 · Promo Speciale', dateFrom: '2027-05-01', dateTo: '2027-10-31', label: 'Promo Off-Peak' }
];

export const DEFAULT_PRICES_MATRIX: Record<string, Record<number, number>> = {
  p1: { 529773: 4800, 495795: 2400, 495796: 2400, 494840: 3500, 421511: 4200, 293957: 1800, 293954: 1800, 293962: 1800, 293965: 1500, 293955: 1500, 293942: 1200, 293963: 1200, 293959: 1200, 293948: 1200, 293945: 1200, 293943: 1200, 293951: 1000, 883795: 1000 },
  p2: { 529773: 6200, 495795: 3100, 495796: 3100, 494840: 4500, 421511: 5400, 293957: 2400, 293954: 2400, 293962: 2400, 293965: 2000, 293955: 2000, 293942: 1600, 293963: 1600, 293959: 1600, 293948: 1600, 293945: 1600, 293943: 1600, 293951: 1300, 883795: 1300 },
  p3: { 529773: 5800, 495795: 2900, 495796: 2900, 494840: 4200, 421511: 5000, 293957: 2200, 293954: 2200, 293962: 2200, 293965: 1800, 293955: 1800, 293942: 1500, 293963: 1500, 293959: 1500, 293948: 1500, 293945: 1500, 293943: 1500, 293951: 1200, 883795: 1200 },
  p4: { 529773: 5200, 495795: 2600, 495796: 2600, 494840: 3800, 421511: 4500, 293957: 2000, 293954: 2000, 293962: 2000, 293965: 1600, 293955: 1600, 293942: 1300, 293963: 1300, 293959: 1300, 293948: 1300, 293945: 1300, 293943: 1300, 293951: 1100, 883795: 1100 },
  p5: { 529773: 4800, 495795: 2400, 495796: 2400, 494840: 3500, 421511: 4200, 293957: 1800, 293954: 1800, 293962: 1800, 293965: 1500, 293955: 1500, 293942: 1200, 293963: 1200, 293959: 1200, 293948: 1200, 293945: 1200, 293943: 1200, 293951: 1000, 883795: 1000 },
  p6: { 529773: 3200, 495795: 1600, 495796: 1600, 494840: 2200, 421511: 2800, 293957: 1200, 293954: 1200, 293962: 1200, 293965: 1000, 293955: 1000, 293942: 800, 293963: 800, 293959: 800, 293948: 800, 293945: 800, 293943: 800, 293951: 700, 883795: 700 },
  p7: { 529773: 3500, 495795: 1750, 495796: 1750, 494840: 2400, 421511: 3000, 293957: 1300, 293954: 1300, 293962: 1300, 293965: 1100, 293955: 1100, 293942: 900, 293963: 900, 293959: 900, 293948: 900, 293945: 900, 293943: 900, 293951: 750, 883795: 750 },
  p8: { 529773: 3000, 495795: 1500, 495796: 1500, 494840: 2000, 421511: 2600, 293957: 1100, 293954: 1100, 293962: 1100, 293965: 900, 293955: 900, 293942: 750, 293963: 750, 293959: 750, 293948: 750, 293945: 750, 293943: 750, 293951: 650, 883795: 650 },
  p9: { 529773: 2800, 495795: 1400, 495796: 1400, 494840: 1900, 421511: 2400, 293957: 1000, 293954: 1000, 293962: 1000, 293965: 850, 293955: 850, 293942: 700, 293963: 700, 293959: 700, 293948: 700, 293945: 700, 293943: 700, 293951: 600, 883795: 600 }
};

export interface SeasonalRateExcelStoreState {
  periods: SeasonalPeriod[];
  pricesMatrix: Record<string, Record<number, number>>; // { [periodId]: { [motherId]: price } }
  motherRates: MotherRateInfo[];
  syncingPeriodId: string | null;
  syncAllRunning: boolean;
  lastSyncMessage: string | null;
  lastSyncStatus: 'idle' | 'success' | 'error';
  
  // Actions
  addPeriodAt: (index: number) => void;
  removePeriod: (periodId: string) => void;
  updatePeriodDate: (periodId: string, field: 'dateFrom' | 'dateTo' | 'name' | 'label', value: string) => void;
  updatePrice: (periodId: string, motherId: number, newPrice: number) => void;
  resetDefaultExcelStore: () => void;
  syncPeriodToOctorate: (periodId: string) => Promise<boolean>;
  syncAllPeriodsToOctorate: () => Promise<boolean>;
}

export const useSeasonalRateStore = create<SeasonalRateExcelStoreState>()(
  persist(
    (set, get) => ({
      periods: DEFAULT_PERIODS,
      pricesMatrix: DEFAULT_PRICES_MATRIX,
      motherRates: MOTHER_RATES,
      syncingPeriodId: null,
      syncAllRunning: false,
      lastSyncMessage: null,
      lastSyncStatus: 'idle',

      addPeriodAt: (index: number) => {
        const newId = `p_${Date.now()}`;
        const newPeriod: SeasonalPeriod = {
          id: newId,
          name: `Nuovo Periodo ${index + 1}`,
          dateFrom: '2026-11-01',
          dateTo: '2026-11-15',
          label: 'Custom'
        };

        set((state) => {
          const updatedPeriods = [...state.periods];
          updatedPeriods.splice(index + 1, 0, newPeriod);

          // Copy baseline prices from preceding row if available
          const prevPeriodId = state.periods[index]?.id;
          const baselinePrices = prevPeriodId ? { ...(state.pricesMatrix[prevPeriodId] || {}) } : {};

          return {
            periods: updatedPeriods,
            pricesMatrix: {
              ...state.pricesMatrix,
              [newId]: baselinePrices
            }
          };
        });
      },

      removePeriod: (periodId: string) => {
        set((state) => {
          if (state.periods.length <= 1) return state; // keep at least 1 period row
          const updatedPeriods = state.periods.filter((p) => p.id !== periodId);
          const updatedMatrix = { ...state.pricesMatrix };
          delete updatedMatrix[periodId];
          return {
            periods: updatedPeriods,
            pricesMatrix: updatedMatrix
          };
        });
      },

      updatePeriodDate: (periodId: string, field: 'dateFrom' | 'dateTo' | 'name' | 'label', value: string) => {
        set((state) => ({
          periods: state.periods.map((p) => {
            if (p.id === periodId) {
              return { ...p, [field]: value };
            }
            return p;
          })
        }));
      },

      updatePrice: (periodId: string, motherId: number, newPrice: number) => {
        set((state) => ({
          pricesMatrix: {
            ...state.pricesMatrix,
            [periodId]: {
              ...(state.pricesMatrix[periodId] || {}),
              [motherId]: Math.max(0, Number(newPrice) || 0)
            }
          }
        }));
      },

      resetDefaultExcelStore: () => {
        set({
          periods: DEFAULT_PERIODS,
          pricesMatrix: DEFAULT_PRICES_MATRIX,
          lastSyncMessage: 'Store ripristinato ai valori predefiniti Excel!',
          lastSyncStatus: 'idle'
        });
      },

      syncPeriodToOctorate: async (periodId: string) => {
        const state = get();
        const period = state.periods.find((p) => p.id === periodId);
        if (!period) return false;

        set({ syncingPeriodId: periodId, lastSyncMessage: `Sincronizzazione ${period.name} su Octorate API in corso...`, lastSyncStatus: 'idle' });

        try {
          const periodPrices = state.pricesMatrix[periodId] || {};
          const periodUpdates = state.motherRates.map((mr) => ({
            roomMotherId: mr.motherId,
            roomName: mr.roomName,
            dateFrom: period.dateFrom,
            dateTo: period.dateTo,
            price: periodPrices[mr.motherId] || 0
          }));

          const response = await fetch('/api/update-prices-stagionale', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ periodId, periodUpdates })
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.error || 'Errore durante la chiamata di sincronizzazione');
          }

          set({
            syncingPeriodId: null,
            lastSyncStatus: 'success',
            lastSyncMessage: `✅ Stagione ${period.name} (${period.dateFrom} ➔ ${period.dateTo}) aggiornata con successo su Octorate!`
          });

          // Re-fetch automatico dei dati reali da Octorate per aggiornare Tabella 2
          try {
            const { fetchOctorateGridData } = await import('../../../booking/lib/octorate');
            fetchOctorateGridData('2026-11-01', '2027-10-31').catch((e) => console.warn('Auto re-fetch grid error:', e));
          } catch (reErr) {
            console.warn('Auto re-fetch import error:', reErr);
          }

          return true;
        } catch (err: any) {
          console.error('Error syncing period to Octorate:', err);
          set({
            syncingPeriodId: null,
            lastSyncStatus: 'error',
            lastSyncMessage: `❌ Errore sincronizzazione ${period.name}: ${err?.message || 'Impossibile connettersi ad Octorate'}`
          });
          return false;
        }
      },

      syncAllPeriodsToOctorate: async () => {
        const state = get();
        set({ syncAllRunning: true, lastSyncMessage: 'Sincronizzazione globale bulk di tutti i periodi in corso...', lastSyncStatus: 'idle' });
        try {
          const allUpdates: any[] = [];

          state.periods.forEach((period) => {
            const periodPrices = state.pricesMatrix[period.id] || {};
            state.motherRates.forEach((mr) => {
              allUpdates.push({
                roomMotherId: mr.motherId,
                roomName: mr.roomName,
                dateFrom: period.dateFrom,
                dateTo: period.dateTo,
                price: periodPrices[mr.motherId] || 0
              });
            });
          });

          const response = await fetch('/api/update-prices-stagionale', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ periodUpdates: allUpdates })
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.error || 'Errore durante la sincronizzazione globale');
          }

          set({
            syncAllRunning: false,
            lastSyncStatus: 'success',
            lastSyncMessage: `✅ Sincronizzazione Globale Bulk di tutti i ${state.periods.length} periodi completata su Octorate!`
          });

          // Re-fetch automatico dei dati reali da Octorate per aggiornare Tabella 2
          try {
            const { fetchOctorateGridData } = await import('../../../booking/lib/octorate');
            fetchOctorateGridData('2026-11-01', '2027-10-31').catch((e) => console.warn('Auto re-fetch bulk grid error:', e));
          } catch (reErr) {
            console.warn('Auto re-fetch import error:', reErr);
          }

          return true;
        } catch (err: any) {
          console.error('Error syncing all periods to Octorate:', err);
          set({
            syncAllRunning: false,
            lastSyncStatus: 'error',
            lastSyncMessage: `❌ Errore sincronizzazione globale: ${err?.message || 'Impossibile completare il bulk push'}`
          });
          return false;
        }
      }
    }),
    {
      name: 'fp_seasonal_rates_excel_v2',
      merge: (persistedState: any, currentState: SeasonalRateExcelStoreState) => {
        const p = persistedState as any;
        return {
          ...currentState,
          ...p,
          periods: (Array.isArray(p?.periods) && p.periods.length > 0) ? p.periods : DEFAULT_PERIODS,
          pricesMatrix: (p?.pricesMatrix && typeof p.pricesMatrix === 'object') ? p.pricesMatrix : DEFAULT_PRICES_MATRIX,
          motherRates: (Array.isArray(p?.motherRates) && p.motherRates.length > 0) ? p.motherRates : MOTHER_RATES
        };
      }
    }
  )
);
