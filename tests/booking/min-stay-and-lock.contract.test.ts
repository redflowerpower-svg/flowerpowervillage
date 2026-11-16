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
