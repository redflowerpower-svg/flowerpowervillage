import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  buildDynamicCascadeSyncPlan,
  computeDiscountedPrice,
  getStageDiscountPctForOffset,
  type CascadeRoomConfig,
} from "../../api/_helpers/octorate-cascade-sync.js";

describe("Sconti a Cascata Last-Minute (3 stadi)", () => {
  it("applica le percentuali esatte per offset 0..9+", () => {
    assert.equal(getStageDiscountPctForOffset(-1), 0);
    assert.equal(getStageDiscountPctForOffset(0), 10);
    assert.equal(getStageDiscountPctForOffset(2), 10);
    assert.equal(getStageDiscountPctForOffset(3), 5);
    assert.equal(getStageDiscountPctForOffset(5), 5);
    assert.equal(getStageDiscountPctForOffset(6), 2.5);
    assert.equal(getStageDiscountPctForOffset(8), 2.5);
    assert.equal(getStageDiscountPctForOffset(9), 0);
  });

  it("arrotonda correttamente i prezzi scontati di riferimento", () => {
    assert.equal(computeDiscountedPrice(790, 10), 711);
    assert.equal(computeDiscountedPrice(430, 10), 387);
    assert.equal(computeDiscountedPrice(2290, 10), 2061);
    assert.equal(computeDiscountedPrice(2290, 5), 2176);
    assert.equal(computeDiscountedPrice(2290, 2.5), 2233);
    assert.equal(computeDiscountedPrice(990, 0), 990);
  });

  it("calcola gli sconti solo sulla madre attiva, salta la gemella in standby ed è idempotente", () => {
    const rooms: CascadeRoomConfig[] = [
      { motherId: 529773, name: "Jungle Villa 2", basePrice: 2290 },
      { motherId: 960389, name: "Jungle Villa", basePrice: 2290 },
      { motherId: 293954, name: "Red Bungalow", basePrice: 790 },
    ];

    const todayStr = "2026-11-20";
    const livePriceMap = new Map<string, number>([
      ["529773_2026-11-20", 2290], // offset 0 -> -10% = 2061
      ["960389_2026-11-20", 2290], // standby su 366879 quando activeJungleSource='807324'
      ["293954_2026-11-20", 790],  // offset 0 -> -10% = 711
      ["293954_2026-11-23", 790],  // offset 3 -> -5% = 751
      ["293954_2026-11-26", 790],  // offset 6 -> -2.5% = 770
    ]);

    const firstRun = buildDynamicCascadeSyncPlan({
      rooms,
      todayStr,
      livePriceMap,
      ledger: {},
      nowIso: "2026-11-20T05:00:00.000Z",
      activeJungleSource: "807324",
    });

    // La standby 960389 viene allineata al prezzo effettivo della madre attiva (2061) senza doppio sconto
    assert.equal(firstRun.nextLedger["960389_2026-11-20"]?.discountedPrice, 2061);
    assert.equal(firstRun.nextLedger["960389_2026-11-20"]?.basePrice, 2290);
    assert.deepEqual(
      firstRun.bulkPayload.find((p) => p.room === 960389 && p.dateFrom === "2026-11-20")?.values.price,
      2061
    );
    assert.deepEqual(
      firstRun.bulkPayload.find((p) => p.room === 529773 && p.dateFrom === "2026-11-20")?.values.price,
      2061
    );
    assert.deepEqual(
      firstRun.bulkPayload.find((p) => p.room === 293954 && p.dateFrom === "2026-11-20")?.values.price,
      711
    );
    assert.deepEqual(
      firstRun.bulkPayload.find((p) => p.room === 293954 && p.dateFrom === "2026-11-23")?.values.price,
      751
    );
    assert.deepEqual(
      firstRun.bulkPayload.find((p) => p.room === 293954 && p.dateFrom === "2026-11-26")?.values.price,
      770
    );

    // Seconda esecuzione a prezzi già aggiornati -> zero chiamate bulk (idempotenza)
    const updatedLiveMap = new Map<string, number>([
      ["529773_2026-11-20", 2061],
      ["960389_2026-11-20", 2061],
      ["293954_2026-11-20", 711],
      ["293954_2026-11-23", 751],
      ["293954_2026-11-26", 770],
    ]);

    const secondRun = buildDynamicCascadeSyncPlan({
      rooms,
      todayStr,
      livePriceMap: updatedLiveMap,
      ledger: firstRun.nextLedger,
      nowIso: "2026-11-20T05:30:00.000Z",
      activeJungleSource: "807324",
    });

    assert.equal(secondRun.bulkPayload.length, 0);
  });

  it("preserva i manualOverride dentro la finestra 0..8 e ripristina basePrice a offset 9", () => {
    const rooms: CascadeRoomConfig[] = [{ motherId: 293954, name: "Red Bungalow", basePrice: 790 }];
    const ledger = {
      "293954_2026-11-22": {
        basePrice: 790,
        discountPct: 10,
        discountedPrice: 650,
        manualOverride: true,
        updatedAt: "2026-11-20T01:00:00.000Z",
      },
      "293954_2026-11-29": {
        basePrice: 790,
        discountPct: 2.5,
        discountedPrice: 650,
        manualOverride: true,
        updatedAt: "2026-11-20T01:00:00.000Z",
      },
    };

    const res = buildDynamicCascadeSyncPlan({
      rooms,
      todayStr: "2026-11-20",
      livePriceMap: new Map([
        ["293954_2026-11-22", 650], // offset 2 (manuale bloccato)
        ["293954_2026-11-29", 650], // offset 9 (fuori finestra -> ripristina 790)
      ]),
      ledger,
      nowIso: "2026-11-20T05:00:00.000Z",
      activeJungleSource: "807324",
    });

    assert.equal(res.bulkPayload.some((p) => p.dateFrom === "2026-11-22"), false);
    assert.deepEqual(res.bulkPayload, [
      { room: 293954, dateFrom: "2026-11-29", dateTo: "2026-11-29", values: { price: 790 } },
    ]);
    assert.equal(res.nextLedger["293954_2026-11-29"], undefined);
    assert.equal(res.nextLedger["293954_2026-11-22"]?.manualOverride, true);
  });
});
