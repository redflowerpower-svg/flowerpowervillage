import assert from 'assert';

// Simuliamo l'algoritmo esatto di calcolo e le funzioni di supporto
const ALL_ACCOMMODATIONS_MAP = {
  'jungle villa': { motherId: 529773, name: 'Jungle Villa' },
  'green bungalow': { motherId: 293962, name: 'Green Bungalow' },
  'room 1': { motherId: 293963, name: 'Room 1' },
  'fake bungalow 1': { motherId: 649669, name: 'Fake Bungalow 1' },
  'fake bungalow 2': { motherId: 921799, name: 'Fake Bungalow 2' }
};

const BASE_PRICES = {
  'jungle villa': 2290,
  'green bungalow': 1500,
  'room 1': 990,
  'fake bungalow 1': 1000,
  'fake bungalow 2': 1000
};

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
    { motherId: 649669, name: 'Fake Bungalow 1', basePrice: 1000 },
    { motherId: 921799, name: 'Fake Bungalow 2', basePrice: 1000 }
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

console.log('--- TEST 1: Calcolo Oggi (2026-08-28) ---');
const day1Updates = calculateCascadeDiscountUpdates({}, new Date('2026-08-28T00:00:00Z'));
console.log(`Totale aggiornamenti giorno 1: ${day1Updates.length}`);
const day1Dates = [...new Set(day1Updates.map(u => u.dateStr))];
console.log('Date coperte Giorno 1:', day1Dates);
assert.strictEqual(day1Dates[0], '2026-08-28');
assert.strictEqual(day1Dates[day1Dates.length - 1], '2026-09-03');

console.log('\n--- TEST 2: Simulazione Mezzanotte / Indomani (2026-08-29) ---');
const day2Updates = calculateCascadeDiscountUpdates({}, new Date('2026-08-29T00:00:00Z'));
console.log(`Totale aggiornamenti giorno 2: ${day2Updates.length}`);
const day2Dates = [...new Set(day2Updates.map(u => u.dateStr))];
console.log('Date coperte Giorno 2 (dopo mezzanotte):', day2Dates);
assert.strictEqual(day2Dates[0], '2026-08-29');
assert.strictEqual(day2Dates[day2Dates.length - 1], '2026-09-04');

console.log('\n--- TEST 3: Verifica Slittamento Stadi ---');
// Il 2026-08-31 era in Stadio 1 il giorno 28 (offset 3? no: 28 offset 0, 29 offset 1, 30 offset 2 -> Stadio 1. 31 era offset 3 -> Stadio 2)
const aug31_day1 = day1Updates.find(u => u.dateStr === '2026-08-31' && u.motherRateId === 649669);
console.log(`2026-08-31 visto il 28/08: Offset ${aug31_day1.offsetDays}, Stadio ${aug31_day1.stage}, Sconto ${aug31_day1.discountPercentage}%`);
assert.strictEqual(aug31_day1.stage, 2);

// Il giorno 29/08, il 2026-08-31 diventa offset 2 (29 offset 0, 30 offset 1, 31 offset 2) -> Diventa Stadio 1 (-10%)!
const aug31_day2 = day2Updates.find(u => u.dateStr === '2026-08-31' && u.motherRateId === 649669);
console.log(`2026-08-31 visto il 29/08: Offset ${aug31_day2.offsetDays}, Stadio ${aug31_day2.stage}, Sconto ${aug31_day2.discountPercentage}%`);
assert.strictEqual(aug31_day2.stage, 1);

console.log('\n✅ TUTTI I TEST LOGICI DELLO SLITTAMENTO MATEMATICO SONO PASSATI AL 100%!');
