import assert from 'assert';

console.log('================================================================');
console.log('🧪 TEST DEFINITIVO: SIMULAZIONE AVANZAMENTO MEZZANOTTE LAST MINUTE');
console.log('================================================================\n');

// Mock dello storage locale
const mockLocalStorage = new Map();

const localStorage = {
  getItem: (k) => mockLocalStorage.get(k) || null,
  setItem: (k, v) => mockLocalStorage.set(k, String(v)),
  removeItem: (k) => mockLocalStorage.delete(k)
};

// Funzioni del modulo
function toThailandDateStr(raw) {
  if (!raw) return '';
  const d = new Date(raw);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseThailandDateParts(formatted) {
  if (!formatted || !/^\d{4}-\d{2}-\d{2}$/.test(formatted)) return null;
  const parts = formatted.split('-');
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10),
    day: parseInt(parts[2], 10)
  };
}

function calculateCascadeDiscountUpdates(options, simulatedTodayDate) {
  const updates = [];
  const s1Days = Math.max(1, options?.stage1Days ?? 3);
  const s1Discount = Math.max(0, Math.min(80, options?.stage1Discount ?? 10));
  const s2Days = Math.max(1, options?.stage2Days ?? 2);
  const s2Discount = Math.max(0, Math.min(80, options?.stage2Discount ?? 5));
  const s3Days = Math.max(1, options?.stage3Days ?? 2);
  const s3Discount = Math.max(0, Math.min(80, options?.stage3Discount ?? 2.5));

  const totalDays = s1Days + s2Days + s3Days;
  const targetAccommodations = [
    { motherId: 529773, name: 'Jungle Villa', basePrice: 2290 },
    { motherId: 649669, name: 'Fake Bungalow 1', basePrice: 1000 }
  ];

  const todayStr = toThailandDateStr(simulatedTodayDate);
  const todayParts = parseThailandDateParts(todayStr);
  if (!todayParts) return updates;

  const todayTime = Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day);

  targetAccommodations.forEach((room) => {
    for (let offset = 0; offset < totalDays; offset++) {
      const targetTime = todayTime + offset * 24 * 60 * 60 * 1000;
      const targetDate = new Date(targetTime);
      const dateStr = toThailandDateStr(targetDate);

      let stage = 1;
      let discountPct = s1Discount;

      if (offset < s1Days) {
        stage = 1;
        discountPct = s1Discount;
      } else if (offset < s1Days + s2Days) {
        stage = 2;
        discountPct = s2Discount;
      } else {
        stage = 3;
        discountPct = s3Discount;
      }

      const dynamicCellBasePrice = room.basePrice;
      const discountAmount = (dynamicCellBasePrice * discountPct) / 100;
      const rawDiscounted = Math.round(dynamicCellBasePrice - discountAmount);
      const finalPrice = rawDiscounted;

      updates.push({
        motherRateId: room.motherId,
        accommodationName: room.name,
        dateStr,
        offsetDays: offset,
        stage,
        basePrice: dynamicCellBasePrice,
        discountPercentage: discountPct,
        discountedPrice: rawDiscounted,
        finalPrice,
        reason: `Stadio ${stage} (-${discountPct}%): offset ${offset}d da oggi ${todayStr}`
      });
    }
  });

  return updates;
}

// Simuliamo la macchina a stati dello Store Zustand
class MockResortAdminStore {
  constructor(simulatedCurrentDate) {
    this.currentDate = simulatedCurrentDate;
    this.isLastMinuteActive = localStorage.getItem('fp_last_minute_active') === 'true';
    this.isSimulationActive = this.isLastMinuteActive;
    this.simulatedOctorateGridItems = [];
    this.lastMinuteStage1Days = Number(localStorage.getItem('fp_lm_stage1_days')) || 3;
    this.lastMinuteDiscountStage1 = Number(localStorage.getItem('fp_lm_stage1_discount')) || 10;
    this.lastMinuteStage2Days = Number(localStorage.getItem('fp_lm_stage2_days')) || 2;
    this.lastMinuteDiscountStage2 = Number(localStorage.getItem('fp_lm_stage2_discount')) || 5;
    this.lastMinuteStage3Days = Number(localStorage.getItem('fp_lm_stage3_days')) || 2;
    this.lastMinuteDiscountStage3 = Number(localStorage.getItem('fp_lm_stage3_discount')) || 2.5;
    this.executionMode = localStorage.getItem('fp_last_minute_execution_mode') || 'simulation';
    this.octorateSyncLog = [];
  }

  recalculateLastMinuteItems() {
    if (this.isLastMinuteActive || this.isSimulationActive) {
      const updates = calculateCascadeDiscountUpdates({
        stage1Days: this.lastMinuteStage1Days,
        stage1Discount: this.lastMinuteDiscountStage1,
        stage2Days: this.lastMinuteStage2Days,
        stage2Discount: this.lastMinuteDiscountStage2,
        stage3Days: this.lastMinuteStage3Days,
        stage3Discount: this.lastMinuteDiscountStage3,
        executionMode: this.executionMode
      }, this.currentDate);

      this.simulatedOctorateGridItems = updates.map((u) => ({
        id: String(u.motherRateId),
        ratePlanId: String(u.motherRateId),
        motherRateId: String(u.motherRateId),
        accommodationName: u.accommodationName,
        dateStr: u.dateStr,
        basePrice: u.basePrice,
        price: u.finalPrice,
        finalPrice: u.finalPrice,
        discountPercentage: u.discountPercentage,
        stage: u.stage,
        isSimulatedDiscount: true
      }));

      this.isSimulationActive = true;
    }
  }

  async autoAdvanceDailyLastMinute() {
    this.recalculateLastMinuteItems();

    if (!this.isLastMinuteActive) return;

    const todayStr = toThailandDateStr(this.currentDate);
    const lastSyncDate = localStorage.getItem('fp_last_minute_sync_date');

    if (todayStr && todayStr !== lastSyncDate) {
      this.octorateSyncLog.push({
        action: 'OCTORATE_CASCADE_SYNC',
        syncedDate: todayStr,
        itemsCount: this.simulatedOctorateGridItems.length
      });
      localStorage.setItem('fp_last_minute_sync_date', todayStr);
    }
  }
}

// -------------------------------------------------------------
// STEP 1: GIORNO 1 (2026-08-28) - Attivazione Iniziale
// -------------------------------------------------------------
console.log('📌 [FASE 1] Giorno 28 Agosto 2026: Utente attiva Last-Minute');
localStorage.setItem('fp_last_minute_active', 'true');
localStorage.setItem('fp_last_minute_sync_date', '2026-08-28');
localStorage.setItem('fp_last_minute_execution_mode', 'production');

const storeDay1 = new MockResortAdminStore(new Date('2026-08-28T14:30:00Z'));
storeDay1.recalculateLastMinuteItems();

console.log(`- Stato Last-Minute Attivo: ${storeDay1.isLastMinuteActive}`);
console.log(`- Stato Simulazione/Anteprima Attivo: ${storeDay1.isSimulationActive}`);
console.log(`- Elementi Anteprima Calcolati: ${storeDay1.simulatedOctorateGridItems.length}`);

const day1PreviewDates = [...new Set(storeDay1.simulatedOctorateGridItems.map(i => i.dateStr))];
console.log(`- Date con sconto visibile a schermo: ${day1PreviewDates.join(', ')}`);
assert.strictEqual(day1PreviewDates[0], '2026-08-28');
assert.strictEqual(day1PreviewDates[day1PreviewDates.length - 1], '2026-09-03');

// -------------------------------------------------------------
// STEP 2: GIORNO 2 (2026-08-29 00:05:00) - Scatta la Mezzanotte!
// -------------------------------------------------------------
console.log('\n📌 [FASE 2] Giorno 29 Agosto 2026 (00:05 AM): Browser ricaricato o timer mezzanotte');
const storeDay2 = new MockResortAdminStore(new Date('2026-08-29T00:05:00Z'));

// Simuliamo l'effetto di mount di Dashboard e VisualCalendar
await storeDay2.autoAdvanceDailyLastMinute();

console.log(`- Stato Last-Minute Attivo: ${storeDay2.isLastMinuteActive}`);
console.log(`- Stato Simulazione/Anteprima Attivo: ${storeDay2.isSimulationActive}`);
console.log(`- Elementi Anteprima Calcolati: ${storeDay2.simulatedOctorateGridItems.length}`);

const day2PreviewDates = [...new Set(storeDay2.simulatedOctorateGridItems.map(i => i.dateStr))];
console.log(`- NUOVE Date con sconto visibile a schermo: ${day2PreviewDates.join(', ')}`);

assert.strictEqual(day2PreviewDates[0], '2026-08-29', 'La prima data scontata DEVE essere oggi (29 Agosto)!');
assert.strictEqual(day2PreviewDates[day2PreviewDates.length - 1], '2026-09-04', 'L\'ultima data scontata DEVE essere il 4 Settembre (+7gg)!');
assert.strictEqual(storeDay2.octorateSyncLog.length, 1, 'L\'auto-advance DEVE aver sincronizzato Octorate!');
assert.strictEqual(localStorage.getItem('fp_last_minute_sync_date'), '2026-08-29', 'Il flag di sync DEVE essere aggiornato al 29 Agosto!');

console.log('\n================================================================');
console.log('🏆 RISULTATO: TEST INTEGRATO SUPERATO CON SUCCESSO AL 100%!');
console.log('================================================================');
