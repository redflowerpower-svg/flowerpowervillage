import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  calculateServerDynamicMinStay,
  getCanonicalAccommodation,
} from "../../api/_handlers/octorate-webhook.js";
import {
  getActiveLocksForRoom,
  isDateLockedForRoom,
  resolveLockableRoom,
  type ClosedRoomLock,
} from "../../api/_helpers/octorate-closed-room-lock.js";
import { patchCalendarItemsForFreedTwinDates } from "../../api/_helpers/octorate-jungle-mirror.js";

describe("Notti Minime Dinamiche & Gap-Fill", () => {
  it("risolve gli alloggi canonici per Product ID e per keyword nome", () => {
    assert.equal(getCanonicalAccommodation({ product: "421511" })?.motherId, 421511);
    assert.equal(getCanonicalAccommodation({ product: "960385" })?.motherId, 495795);
    assert.equal(getCanonicalAccommodation({ roomName: "Jungle Villa Left" })?.motherId, 495795);
    assert.equal(getCanonicalAccommodation({ roomName: "Jungle Villa Right" })?.motherId, 495796);
    assert.equal(getCanonicalAccommodation({ roomName: "Red Bungalow - Special" })?.motherId, 293954);
  });

  it("riduce il minStay sul gap di 2 notti in alta stagione (baseline=5) e ignora i MIRROR", () => {
    const bookings = [
      {
        product: "293954", // Red Bungalow
        status: "CONFIRMED",
        checkin: "2026-12-16",
        checkout: "2026-12-20",
      },
      {
        product: "293954",
        status: "CONFIRMED",
        checkin: "2026-12-22",
        checkout: "2026-12-27",
      },
      // Prenotazione mirror su Red Bungalow fittizia nelle date del gap: deve essere ignorata
      {
        product: "293954",
        status: "CONFIRMED",
        refer: "MIRROR-999999",
        checkin: "2026-12-20",
        checkout: "2026-12-22",
      },
    ];

    const updates = calculateServerDynamicMinStay(bookings, {
      start: "2026-12-16",
      end: "2026-12-26",
    });

    const redUpdates = updates.filter((u) => u.roomTypeId === "293954");
    const gapUpdate = redUpdates.find((u) => u.dateFrom === "2026-12-20" && u.dateTo === "2026-12-21");
    assert.ok(gapUpdate, "Deve generare aggiornamento per il gap 20-21 dicembre");
    assert.equal(gapUpdate.minStay, 2);

    const occupiedUpdate = redUpdates.find((u) => u.dateFrom === "2026-12-16" && u.dateTo === "2026-12-19");
    assert.ok(occupiedUpdate, "Deve ripristinare il baseline sulle notti occupate");
    assert.equal(occupiedUpdate.minStay, 5);
  });

  it("non chiude falsamente un giorno se solo la Madre ha stopSells ma la BE è aperta", () => {
    const calendarItems = [
      {
        id: 293954, // Madre Red Bungalow
        days: [
          { date: "2026-12-20", availability: 1, stopSells: true },
        ],
      },
      {
        id: 449422, // BE Red Bungalow reale (aperta)
        days: [
          { date: "2026-12-20", availability: 1, stopSells: false, closed: false },
        ],
      },
    ];

    const updates = calculateServerDynamicMinStay(
      [],
      { start: "2026-12-18", end: "2026-12-22" },
      calendarItems
    );

    const redUpdates = updates.filter((u) => u.roomTypeId === "293954");
    assert.equal(redUpdates.length, 1);
    assert.equal(redUpdates[0].dateFrom, "2026-12-18");
    assert.equal(redUpdates[0].dateTo, "2026-12-22");
    assert.equal(redUpdates[0].minStay, 5);
  });

  it("riapre le date liberate su villa gemella attiva, rispetta JVL occupata su Suite e ricalcola minStay=2 sul 29 nov", () => {
    const freedDates = [
      "2026-11-30", "2026-12-01", "2026-12-02", "2026-12-03",
      "2026-12-04", "2026-12-05", "2026-12-06", "2026-12-07",
    ];
    const makeClosedDays = (dates: string[]) =>
      dates.map((date) => ({ date, availability: 1, stopSells: true, closed: true }));

    const calendarItems = [
      { id: 960387, days: makeClosedDays(freedDates) }, // JVR Mother (366879)
      { id: 960427, days: makeClosedDays(freedDates) }, // JVR BE
      { id: 960428, days: makeClosedDays(freedDates) }, // JVR 7d
      { id: 960429, days: makeClosedDays(freedDates) }, // JVR Main bnb-7d
      { id: 960430, days: makeClosedDays(freedDates) }, // JVR Main bnb-14d
      { id: 960433, days: makeClosedDays(freedDates) }, // JVR AirBnB
      { id: 960435, days: makeClosedDays(freedDates) }, // JVR AC7d (must stay closed)
      { id: 960389, days: makeClosedDays(freedDates) }, // JV Suite Mother (366879)
      { id: 960403, days: makeClosedDays(freedDates) }, // JV BE
    ];

    const nonMirrorBookings = [
      // JVR occupata fino al 29 nov (check-out 29) -> lascia 1 notte libera il 29 prima del 30 nov!
      { product: "495796", status: "CONFIRMED", checkin: "2026-11-25", checkout: "2026-11-29" },
      // JVL occupata 30 nov -> 05 dic -> impedisce apertura JV Suite su 30 nov..04 dic
      { product: "495803", status: "CONFIRMED", checkin: "2026-11-30", checkout: "2026-12-05" },
    ];

    // Prima della patch: il blocco 30 nov..07 dic è in stopSells=true quindi 29 nov risulta gap da 1 notte!
    const beforeUpdates = calculateServerDynamicMinStay(
      nonMirrorBookings,
      { start: "2026-11-25", end: "2026-12-10" },
      calendarItems,
      "366879"
    );
    const nov29Before = beforeUpdates.find(
      (u) => u.roomTypeId === "495796" && u.dateFrom <= "2026-11-29" && u.dateTo >= "2026-11-29"
    );
    assert.equal(nov29Before?.minStay, 1);

    const blocks = patchCalendarItemsForFreedTwinDates({
      activeJungleSource: "366879",
      twinKey: "jvr",
      checkInDate: "2026-11-30",
      checkOutDate: "2026-12-08",
      nonMirrorBookings,
      calendarItems,
      closedLocks: [],
    });

    // Verifica: JVR riaperta su 2026-11-30..2026-12-07 per le tariffe non-AC
    assert.equal(
      blocks.some((b) => b.room === 960387 && b.dateFrom === "2026-11-30" && b.dateTo === "2026-12-07" && b.values.stopSells === false),
      true
    );
    // Verifica: tariffa AC (960435) NON deve mai essere riaperta
    assert.equal(blocks.some((b) => b.room === 960435), false);
    // Verifica: JV Suite (960389) riaperta solo dal 2026-12-05 al 2026-12-07 (non 30 nov..04 dic dove JVL è occupata)
    const jvSuiteBlock = blocks.find((b) => b.room === 960389);
    assert.equal(jvSuiteBlock?.dateFrom, "2026-12-05");
    assert.equal(jvSuiteBlock?.dateTo, "2026-12-07");

    // Dopo la patch in memoria: 29 nov ha minStay=2!
    const afterUpdates = calculateServerDynamicMinStay(
      nonMirrorBookings,
      { start: "2026-11-25", end: "2026-12-10" },
      calendarItems,
      "366879"
    );
    const nov29After = afterUpdates.find(
      (u) => u.roomTypeId === "495796" && u.dateFrom <= "2026-11-29" && u.dateTo >= "2026-11-29"
    );
    assert.equal(nov29After?.minStay, 2);
  });
});

describe("Closed-Room Hard Lock", () => {
  const sampleLocks: ClosedRoomLock[] = [
    {
      id: "lock-1",
      roomKey: "r1",
      motherId: 293963,
      roomName: "Room 1",
      dateFrom: "2026-11-20",
      dateTo: "2026-11-25",
      enabled: true,
      updatedAt: "2026-11-16T00:00:00.000Z",
    },
    {
      id: "lock-disabled",
      roomKey: "r2",
      motherId: 293959,
      roomName: "Room 2",
      dateFrom: "2026-11-20",
      dateTo: "2026-11-25",
      enabled: false,
      updatedAt: "2026-11-16T00:00:00.000Z",
    },
  ];

  it("risolve stanze per chiave, alias o product ID derivato", () => {
    assert.equal(resolveLockableRoom("r1")?.motherId, 293963);
    assert.equal(resolveLockableRoom("Penthouse Villa")?.roomKey, "pent");
    assert.equal(resolveLockableRoom(449678)?.roomKey, "r1");
    assert.equal(resolveLockableRoom("unknown-room"), null);
  });

  it("verifica correttamente gli intervalli bloccati ed esclude i lock disabilitati", () => {
    assert.equal(isDateLockedForRoom(sampleLocks, "r1", "2026-11-19"), false);
    assert.equal(isDateLockedForRoom(sampleLocks, "r1", "2026-11-20"), true);
    assert.equal(isDateLockedForRoom(sampleLocks, 449678, "2026-11-25"), true);
    assert.equal(isDateLockedForRoom(sampleLocks, "r1", "2026-11-26"), false);
    assert.equal(isDateLockedForRoom(sampleLocks, "r2", "2026-11-22"), false);
    assert.equal(getActiveLocksForRoom(sampleLocks, "r1").length, 1);
    assert.equal(getActiveLocksForRoom(sampleLocks, "r2").length, 0);
  });
});
