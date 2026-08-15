import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SeasonalPeriod {
  id: string;
  name: string;
  dateFrom: string; // "YYYY-MM-DD"
  dateTo: string;   // "YYYY-MM-DD"
  label?: string;
}

export interface MotherRateInfo {
  motherId: number;
  roomName: string;
  shortName: string;
  line1: string;
  line2: string;
  category: string;
  isTest?: boolean;
}

export const MOTHER_RATES: MotherRateInfo[] = [
  // 1. Alloggi Reali di Produzione (18 alloggi esatti dal foglio Excel)
  { motherId: 529773, roomName: 'Jungle Villa', shortName: 'Jungle Villa', line1: 'Jungle', line2: 'Villa', category: 'Ville' },
  { motherId: 495795, roomName: 'Jungle Villa Left', shortName: 'JV Left', line1: 'Jungle Villa', line2: 'Left', category: 'Ville' },
  { motherId: 495796, roomName: 'Jungle Villa Right', shortName: 'JV Right', line1: 'Jungle Villa', line2: 'Right', category: 'Ville' },
  { motherId: 494840, roomName: 'Peace & Love Villa', shortName: 'Peace & Love', line1: 'Peace & Love', line2: 'Villa', category: 'Ville' },
  { motherId: 421511, roomName: 'Penthouse Villa', shortName: 'Penthouse', line1: 'Penthouse', line2: 'Villa', category: 'Ville' },
  { motherId: 293957, roomName: 'Yellow Bungalow', shortName: 'Yellow Bung.', line1: 'Yellow', line2: 'Bungalow', category: 'Bungalow' },
  { motherId: 293954, roomName: 'Red Bungalow', shortName: 'Red Bung.', line1: 'Red', line2: 'Bungalow', category: 'Bungalow' },
  { motherId: 293962, roomName: 'Green Bungalow', shortName: 'Green Bung.', line1: 'Green', line2: 'Bungalow', category: 'Bungalow' },
  { motherId: 293955, roomName: 'Lagoon Tent Bungalow', shortName: 'Lagoon Tent', line1: 'Lagoon Tent', line2: 'Bungalow', category: 'Tende' },
  { motherId: 293965, roomName: 'Camel Tent Bungalow', shortName: 'Camel Tent', line1: 'Camel Tent', line2: 'Bungalow', category: 'Tende' },
  { motherId: 293942, roomName: 'Hub Internal Room', shortName: 'Internal Room', line1: 'Internal', line2: 'Room', category: 'The Hub' },
  { motherId: 293963, roomName: 'Hub Room 1', shortName: 'Room 1', line1: 'Hub Room', line2: '1', category: 'The Hub' },
  { motherId: 293959, roomName: 'Hub Room 2', shortName: 'Room 2', line1: 'Hub Room', line2: '2', category: 'The Hub' },
  { motherId: 293948, roomName: 'Hub Room 3', shortName: 'Room 3', line1: 'Hub Room', line2: '3', category: 'The Hub' },
  { motherId: 293945, roomName: 'Hub Room 4', shortName: 'Room 4', line1: 'Hub Room', line2: '4', category: 'The Hub' },
  { motherId: 293943, roomName: 'Hub Room 5', shortName: 'Room 5', line1: 'Hub Room', line2: '5', category: 'The Hub' },
  { motherId: 293951, roomName: 'Lodge 1', shortName: 'Lodge 1', line1: 'Lodge 1', line2: 'Hub', category: 'The Hub' },
  { motherId: 883795, roomName: 'Lodge 2', shortName: 'Lodge 2', line1: 'Lodge 2', line2: 'Hub', category: 'The Hub' },

  // 2. Fake Bungalow di Test (in fondo alla lista)
  { motherId: 649669, roomName: 'Fake Bungalow 1', shortName: 'Fake Bung. 1', line1: 'Fake Bung.', line2: '1', category: 'Bungalow', isTest: true },
  { motherId: 921799, roomName: 'Fake Bungalow 2', shortName: 'Fake Bung. 2', line1: 'Fake Bung.', line2: '2', category: 'Bungalow', isTest: true }
];

// 9 Periodi Stagionali Ufficiali da Foglio Excel
export const DEFAULT_PERIODS: SeasonalPeriod[] = [
  { id: 'p1', name: 'High Season Level 1', dateFrom: '2026-11-01', dateTo: '2026-11-14', label: 'High Season' },
  { id: 'p2', name: 'High Season Level 2', dateFrom: '2026-11-15', dateTo: '2026-11-30', label: 'High Season' },
  { id: 'p3', name: 'High Season Level 3', dateFrom: '2026-12-01', dateTo: '2026-12-10', label: 'High Season' },
  { id: 'p4', name: 'High Season Level 4', dateFrom: '2026-12-11', dateTo: '2026-12-20', label: 'High Season' },
  { id: 'p5', name: 'High Season Level 5', dateFrom: '2026-12-21', dateTo: '2027-01-15', label: 'Peak Season' },
  { id: 'p6', name: 'High Season Level 4', dateFrom: '2027-01-16', dateTo: '2027-03-31', label: 'High Season' },
  { id: 'p7', name: 'High Season Level 3', dateFrom: '2027-04-01', dateTo: '2027-04-30', label: 'High Season' },
  { id: 'p8', name: 'Low Season Level 1', dateFrom: '2027-05-01', dateTo: '2027-05-31', label: 'Low Season' },
  { id: 'p9', name: 'Low Season Level 2', dateFrom: '2027-06-01', dateTo: '2027-10-31', label: 'Low Season' }
];

// Matrice Prezzi Ufficiale da Foglio Excel (inclusi Fake Bungalow 1 e 2)
export const DEFAULT_PRICES_MATRIX: Record<string, Record<number, number>> = {
  // High Season Level 1 (01-nov -> 14-nov)
  p1: { 
    649669: 1190, 921799: 1190, // Fake Bungalow (Test)
    529773: 3290, 495795: 1790, 495796: 1790, 494840: 1790, 421511: 1790, 
    293957: 1190, 293954: 990, 293962: 990, 293955: 590, 293965: 590, 
    293942: 590, 293963: 590, 293959: 890, 293948: 890, 293945: 890, 
    293943: 490, 293951: 990, 883795: 990 
  },

  // High Season Level 2 (15-nov -> 30-nov)
  p2: { 
    649669: 1490, 921799: 1490, 
    529773: 3590, 495795: 1990, 495796: 1990, 494840: 1990, 421511: 1990, 
    293957: 1490, 293954: 1290, 293962: 1290, 293955: 790, 293965: 790, 
    293942: 790, 293963: 790, 293959: 990, 293948: 990, 293945: 990, 
    293943: 690, 293951: 1090, 883795: 1090 
  },

  // High Season Level 3 (01-dic -> 10-dic)
  p3: { 
    649669: 1990, 921799: 1990, 
    529773: 4290, 495795: 2390, 495796: 2390, 494840: 2390, 421511: 2390, 
    293957: 1990, 293954: 1590, 293962: 1590, 293955: 820, 293965: 820, 
    293942: 820, 293963: 890, 293959: 1190, 293948: 1190, 293945: 1190, 
    293943: 690, 293951: 1590, 883795: 1590 
  },

  // High Season Level 4 (11-dic -> 20-dic)
  p4: { 
    649669: 2390, 921799: 2390, 
    529773: 4990, 495795: 2790, 495796: 2790, 494840: 2790, 421511: 2790, 
    293957: 2390, 293954: 1990, 293962: 1990, 293955: 890, 293965: 890, 
    293942: 890, 293963: 990, 293959: 1490, 293948: 1490, 293945: 1490, 
    293943: 790, 293951: 1990, 883795: 1990 
  },

  // High Season Level 5 (21-dic -> 15-gen)
  p5: { 
    649669: 2990, 921799: 2990, 
    529773: 5790, 495795: 3190, 495796: 3190, 494840: 3190, 421511: 3190, 
    293957: 2990, 293954: 2490, 293962: 2490, 293955: 990, 293965: 990, 
    293942: 990, 293963: 1190, 293959: 1990, 293948: 1990, 293945: 1990, 
    293943: 890, 293951: 2490, 883795: 2490 
  },

  // High Season Level 4 (16-gen -> 31-mar)
  p6: { 
    649669: 2490, 921799: 2490, 
    529773: 5190, 495795: 2890, 495796: 2890, 494840: 2890, 421511: 2890, 
    293957: 2490, 293954: 1990, 293962: 1990, 293955: 890, 293965: 890, 
    293942: 890, 293963: 990, 293959: 1690, 293948: 1690, 293945: 1690, 
    293943: 790, 293951: 1990, 883795: 1990 
  },

  // High Season Level 3 (01-apr -> 30-apr)
  p7: { 
    649669: 2090, 921799: 2090, 
    529773: 3990, 495795: 2290, 495796: 2290, 494840: 2290, 421511: 2290, 
    293957: 2090, 293954: 1590, 293962: 1590, 293955: 790, 293965: 790, 
    293942: 790, 293963: 890, 293959: 1590, 293948: 1590, 293945: 1590, 
    293943: 690, 293951: 1590, 883795: 1590 
  },

  // Low Season Level 1 (01-mag -> 31-mag)
  p8: { 
    649669: 1290, 921799: 1290, 
    529773: 3190, 495795: 1790, 495796: 1790, 494840: 1790, 421511: 1790, 
    293957: 1290, 293954: 1090, 293962: 1090, 293955: 620, 293965: 620, 
    293942: 620, 293963: 790, 293959: 990, 293948: 990, 293945: 990, 
    293943: 590, 293951: 1190, 883795: 1190 
  },

  // Low Season Level 2 (01-giu -> 31-ott)
  p9: { 
    649669: 990, 921799: 990, 
    529773: 2290, 495795: 1290, 495796: 1290, 494840: 1290, 421511: 1290, 
    293957: 990, 293954: 790, 293962: 790, 293955: 490, 293965: 490, 
    293942: 490, 293963: 690, 293959: 890, 293948: 890, 293945: 890, 
    293943: 590, 293951: 990, 883795: 990 
  }
};

export const FAKE_BUNGALOW_IDS = [649669, 921799];

export interface SeasonalRateExcelStoreState {
  testMode: boolean;
  periods: SeasonalPeriod[];
  pricesMatrix: Record<string, Record<number, number>>; // { [periodId]: { [motherId]: price } }
  motherRates: MotherRateInfo[];
  syncingPeriodId: string | null;
  syncAllRunning: boolean;
  lastSyncMessage: string | null;
  lastSyncStatus: 'idle' | 'success' | 'error';
  
  // Actions
  setTestMode: (testMode: boolean) => void;
  addPeriodAt: (index: number) => void;
  removePeriod: (periodId: string) => void;
  updatePeriodDate: (periodId: string, field: 'dateFrom' | 'dateTo' | 'name' | 'label', value: string) => void;
  updatePrice: (periodId: string, motherId: number, newPrice: number) => void;
  resetDefaultExcelStore: () => void;
  syncPeriodToOctorate: (periodId: string, options?: { testOnly?: boolean }) => Promise<boolean>;
  syncAllPeriodsToOctorate: (options?: { testOnly?: boolean }) => Promise<boolean>;
}

export const useSeasonalRateStore = create<SeasonalRateExcelStoreState>()(
  persist(
    (set, get) => ({
      testMode: true, // Default sicuro in modalità Test
      periods: DEFAULT_PERIODS,
      pricesMatrix: DEFAULT_PRICES_MATRIX,
      motherRates: MOTHER_RATES,
      syncingPeriodId: null,
      syncAllRunning: false,
      lastSyncMessage: null,
      lastSyncStatus: 'idle',

      setTestMode: (testMode: boolean) => {
        set({ testMode });
      },

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

          // Copia i prezzi baseline dalla riga precedente se disponibile
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
          if (state.periods.length <= 1) return state; // Mantieni almeno 1 periodo
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
          lastSyncMessage: 'Store ripristinato ai valori predefiniti ufficiali Excel!',
          lastSyncStatus: 'idle'
        });
      },

      syncPeriodToOctorate: async (periodId: string, options?: { testOnly?: boolean }) => {
        const state = get();
        const period = state.periods.find((p) => p.id === periodId);
        if (!period) return false;

        const isTest = options?.testOnly !== undefined ? options.testOnly : state.testMode;
        const targetRates = isTest
          ? state.motherRates.filter((mr) => FAKE_BUNGALOW_IDS.includes(mr.motherId))
          : state.motherRates;

        set({
          syncingPeriodId: periodId,
          lastSyncMessage: `Sincronizzazione ${isTest ? '[TEST FAKE BUNGALOW]' : '[PRODUZIONE]'} ${period.name} su Octorate API in corso...`,
          lastSyncStatus: 'idle'
        });

        try {
          const pricesForPeriod = state.pricesMatrix[period.id] || {};

          // Genera i singoli update per ciascun alloggio selezionato
          const updates = targetRates.map((mr) => ({
            roomMotherId: mr.motherId,
            dateFrom: period.dateFrom,
            dateTo: period.dateTo,
            price: pricesForPeriod[mr.motherId] || 0
          }));

          const response = await fetch('/api/update-prices-stagionale', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              periodUpdates: updates,
              testMode: isTest,
              testOnly: isTest
            })
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Errore HTTP ${response.status}`);
          }

          const result = await response.json();

          set({
            syncingPeriodId: null,
            lastSyncMessage: `✅ ${isTest ? '[TEST]' : '[PRODUZIONE]'} ${period.name} sincronizzato con successo (${result.updatedCount || updates.length} tariffe inviate)!`,
            lastSyncStatus: 'success'
          });

          setTimeout(() => {
            set((s) => ({ ...s, lastSyncMessage: null }));
          }, 6000);

          return true;
        } catch (error: any) {
          console.error('Errore syncPeriodToOctorate:', error);
          set({
            syncingPeriodId: null,
            lastSyncMessage: `❌ Errore sincronizzazione: ${error?.message || 'Errore di rete'}`,
            lastSyncStatus: 'error'
          });
          return false;
        }
      },

      syncAllPeriodsToOctorate: async (options?: { testOnly?: boolean }) => {
        const state = get();
        if (!state.periods || state.periods.length === 0) return false;

        const isTest = options?.testOnly !== undefined ? options.testOnly : state.testMode;
        const targetRates = isTest
          ? state.motherRates.filter((mr) => FAKE_BUNGALOW_IDS.includes(mr.motherId))
          : state.motherRates;

        set({
          syncAllRunning: true,
          lastSyncMessage: `Sincronizzazione globale bulk ${isTest ? '[TEST FAKE BUNGALOW]' : '[PRODUZIONE REALE]'} in corso...`,
          lastSyncStatus: 'idle'
        });

        try {
          const allUpdates: Array<{ roomMotherId: number; dateFrom: string; dateTo: string; price: number }> = [];

          for (const period of state.periods) {
            const periodPrices = state.pricesMatrix[period.id] || {};
            for (const mr of targetRates) {
              allUpdates.push({
                roomMotherId: mr.motherId,
                dateFrom: period.dateFrom,
                dateTo: period.dateTo,
                price: periodPrices[mr.motherId] || 0
              });
            }
          }

          const response = await fetch('/api/update-prices-stagionale', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              periodUpdates: allUpdates,
              testMode: isTest,
              testOnly: isTest
            })
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Errore HTTP ${response.status}`);
          }

          const result = await response.json();

          set({
            syncAllRunning: false,
            lastSyncMessage: `🚀 Sincronizzazione globale ${isTest ? '[TEST]' : '[PRODUZIONE REALE]'} completata con successo (${result.updatedCount || allUpdates.length} aggiornamenti applicati ad Octorate)!`,
            lastSyncStatus: 'success'
          });

          setTimeout(() => {
            set((s) => ({ ...s, lastSyncMessage: null }));
          }, 8000);

          return true;
        } catch (error: any) {
          console.error('Errore syncAllPeriodsToOctorate:', error);
          set({
            syncAllRunning: false,
            lastSyncMessage: `❌ Errore durante sync globale: ${error?.message || 'Errore di rete'}`,
            lastSyncStatus: 'error'
          });
          return false;
        }
      }
    }),
    {
      name: 'flower-power-seasonal-rate-excel-store-v8',
      version: 8,
      migrate: () => {
        return {
          testMode: true,
          periods: DEFAULT_PERIODS,
          pricesMatrix: DEFAULT_PRICES_MATRIX,
          motherRates: MOTHER_RATES,
          syncingPeriodId: null,
          syncAllRunning: false,
          lastSyncMessage: null,
          lastSyncStatus: 'idle'
        } as any;
      }
    }
  )
);
