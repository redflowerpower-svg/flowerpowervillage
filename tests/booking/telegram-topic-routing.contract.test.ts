import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  buildBookingNotificationFingerprint,
  classifyBookingTelegramEvent,
  isCancelledBookingEvent,
  isMovedReservationBooking,
} from "../../api/_helpers/octorate-booking-routing.js";
import { VILLAGE_TOPICS } from "../../api/_helpers/telegram.js";

describe("Routing Esclusivo Topic Telegram FPV Dashboard", () => {
  it("mantiene gli ID ufficiali dei topic FPV Dashboard", () => {
    assert.equal(VILLAGE_TOPICS.BOOKINGS, 3);
    assert.equal(VILLAGE_TOPICS.MODIFICATIONS_CANCELLATIONS, 7);
    assert.equal(VILLAGE_TOPICS.ALERTS_OVERBOOKING, 8);
  });

  it("smista nuove prenotazioni sempre su BOOKINGS indipendentemente da eventType al primo sync", () => {
    const createMs = Date.parse("2026-12-01T10:00:00Z");
    const syncMs = Date.parse("2026-12-01T10:00:25Z");

    for (const eventType of [
      "RESERVATION_CREATED",
      "RESERVATION_NOTIFICATION",
      "RESERVATION_UPDATED",
      "RESERVATION_CHANGE",
    ]) {
      const res = classifyBookingTelegramEvent({
        reservationId: "1305001",
        eventType,
        booking: { id: "1305001", status: "CONFIRMED" },
        checkIn: "2026-12-10",
        checkOut: "2026-12-14",
        roomId: "293954",
        totalGross: 6000,
        createTimeMs: createMs,
        updateTimeMs: syncMs,
        existingNotifiedRow: null,
      });

      assert.equal(res.kind, "new", `Atteso 'new' per ${eventType}`);
      assert.equal(res.topic, "BOOKINGS", `Atteso topic BOOKINGS per ${eventType}`);
      assert.equal(res.notificationKey, "res_notified_1305001");
      assert.equal(res.fingerprint, "fp:2026-12-10|2026-12-14|293954|6000");
    }
  });

  it("ignora webhook eco/duplicati identici con stessa fingerprint", () => {
    const existingFingerprint = buildBookingNotificationFingerprint({
      checkIn: "2026-12-10",
      checkOut: "2026-12-14",
      roomId: 293954,
      totalGross: "6000.00",
    });

    for (const eventType of ["RESERVATION_NOTIFICATION", "RESERVATION_UPDATED", "RESERVATION_CREATED"]) {
      const res = classifyBookingTelegramEvent({
        reservationId: "1305001",
        eventType,
        booking: { id: "1305001", status: "CONFIRMED" },
        checkIn: "2026-12-10",
        checkOut: "2026-12-14",
        roomId: "293954",
        totalGross: 6000,
        createTimeMs: Date.parse("2026-12-01T10:00:00Z"),
        updateTimeMs: Date.parse("2026-12-01T10:05:00Z"),
        existingNotifiedRow: { id: "res_notified_1305001", bot_token: existingFingerprint },
      });

      assert.equal(res.kind, "skip");
      assert.equal(res.topic, null);
    }
  });

  it("smista modifiche di date, camera o importo sempre su MODIFICATIONS_CANCELLATIONS anche con RESERVATION_NOTIFICATION", () => {
    const existingFingerprint = buildBookingNotificationFingerprint({
      checkIn: "2026-12-10",
      checkOut: "2026-12-14",
      roomId: "293954",
      totalGross: 6000,
    });

    const cases = [
      { label: "cambio date", checkIn: "2026-12-11", checkOut: "2026-12-15", roomId: "293954", totalGross: 6000 },
      { label: "cambio camera", checkIn: "2026-12-10", checkOut: "2026-12-14", roomId: "293957", totalGross: 6000 },
      { label: "cambio importo", checkIn: "2026-12-10", checkOut: "2026-12-14", roomId: "293954", totalGross: 7500 },
    ];

    for (const tc of cases) {
      const res = classifyBookingTelegramEvent({
        reservationId: "1305001",
        eventType: "RESERVATION_NOTIFICATION",
        booking: { id: "1305001", status: "CONFIRMED" },
        checkIn: tc.checkIn,
        checkOut: tc.checkOut,
        roomId: tc.roomId,
        totalGross: tc.totalGross,
        createTimeMs: Date.parse("2026-12-01T10:00:00Z"),
        updateTimeMs: Date.parse("2026-12-02T12:00:00Z"),
        existingNotifiedRow: { id: "res_notified_1305001", bot_token: existingFingerprint },
      });

      assert.equal(res.kind, "modified", `Atteso 'modified' su ${tc.label}`);
      assert.equal(res.topic, "MODIFICATIONS_CANCELLATIONS", `Atteso MODIFICATIONS_CANCELLATIONS su ${tc.label}`);
      assert.ok(res.notificationKey.startsWith("res_modified_1305001_fp:"));
    }
  });

  it("smista modifica di prenotazione preesistente (>60s dopo creazione) non ancora in tabella su MODIFICATIONS_CANCELLATIONS", () => {
    const res = classifyBookingTelegramEvent({
      reservationId: "1304999",
      eventType: "RESERVATION_NOTIFICATION",
      booking: { id: "1304999", status: "CONFIRMED" },
      checkIn: "2026-12-18",
      checkOut: "2026-12-22",
      roomId: "421511",
      totalGross: 12000,
      createTimeMs: Date.parse("2026-11-20T08:00:00Z"),
      updateTimeMs: Date.parse("2026-11-22T09:15:00Z"),
      existingNotifiedRow: null,
    });

    assert.equal(res.kind, "modified");
    assert.equal(res.topic, "MODIFICATIONS_CANCELLATIONS");
  });

  it("gestisce correttamente le righe legacy con bot_token='notified'", () => {
    const createMs = Date.parse("2026-12-01T10:00:00Z");

    const dup = classifyBookingTelegramEvent({
      reservationId: "1304888",
      eventType: "RESERVATION_NOTIFICATION",
      booking: { id: "1304888", status: "CONFIRMED" },
      checkIn: "2026-12-10",
      checkOut: "2026-12-12",
      roomId: "293954",
      totalGross: 3000,
      createTimeMs: createMs,
      updateTimeMs: createMs + 1000,
      existingNotifiedRow: { id: "res_notified_1304888", bot_token: "notified" },
    });
    assert.equal(dup.kind, "skip");
    assert.equal(dup.topic, null);

    const mod = classifyBookingTelegramEvent({
      reservationId: "1304888",
      eventType: "RESERVATION_UPDATED",
      booking: { id: "1304888", status: "CONFIRMED" },
      checkIn: "2026-12-10",
      checkOut: "2026-12-13",
      roomId: "293954",
      totalGross: 4500,
      createTimeMs: createMs,
      updateTimeMs: createMs + 30_000,
      existingNotifiedRow: { id: "res_notified_1304888", bot_token: "notified" },
    });
    assert.equal(mod.kind, "modified");
    assert.equal(mod.topic, "MODIFICATIONS_CANCELLATIONS");
  });

  it("smista sempre tutte le cancellazioni esclusivamente su MODIFICATIONS_CANCELLATIONS", () => {
    assert.equal(isCancelledBookingEvent({ status: "CANCELLED" }, "RESERVATION_NOTIFICATION"), true);
    assert.equal(isCancelledBookingEvent({ status: "CONFIRMED" }, "RESERVATION_CANCELLED"), true);

    const res = classifyBookingTelegramEvent({
      reservationId: "1305002",
      eventType: "RESERVATION_NOTIFICATION",
      booking: { id: "1305002", status: "CANCELLED" },
      checkIn: "2026-12-10",
      checkOut: "2026-12-14",
      roomId: "293954",
      totalGross: 6000,
      createTimeMs: Date.parse("2026-12-01T10:00:00Z"),
      updateTimeMs: Date.parse("2026-12-01T10:00:10Z"),
      existingNotifiedRow: null,
    });

    assert.equal(res.kind, "cancelled");
    assert.equal(res.topic, "MODIFICATIONS_CANCELLATIONS");
    assert.equal(res.notificationKey, "res_cancelled_1305002");
  });

  it("salta la prima notifica della prenotazione generata da spostamento cross-struttura MV-... ma traccia future modifiche", () => {
    const movedBooking = {
      id: "1305999",
      status: "CONFIRMED",
      refer: "MV-1305001",
      privateNotes: "=== MOVED RESERVATION SUMMARY ===",
    };
    assert.equal(isMovedReservationBooking(movedBooking), true);

    const initialEcho = classifyBookingTelegramEvent({
      reservationId: "1305999",
      eventType: "RESERVATION_CREATED",
      booking: movedBooking,
      checkIn: "2026-12-10",
      checkOut: "2026-12-14",
      roomId: "529773",
      totalGross: 8000,
      createTimeMs: Date.parse("2026-12-01T10:00:00Z"),
      updateTimeMs: Date.parse("2026-12-01T10:00:05Z"),
      existingNotifiedRow: null,
    });
    assert.equal(initialEcho.kind, "skip");
    assert.equal(initialEcho.topic, null);
    assert.equal(initialEcho.shouldPersistNotifiedFingerprint, true);

    const laterEdit = classifyBookingTelegramEvent({
      reservationId: "1305999",
      eventType: "RESERVATION_NOTIFICATION",
      booking: movedBooking,
      checkIn: "2026-12-10",
      checkOut: "2026-12-15",
      roomId: "529773",
      totalGross: 10000,
      createTimeMs: Date.parse("2026-12-01T10:00:00Z"),
      updateTimeMs: Date.parse("2026-12-03T11:00:00Z"),
      existingNotifiedRow: { id: "res_notified_1305999", bot_token: initialEcho.fingerprint },
    });
    assert.equal(laterEdit.kind, "modified");
    assert.equal(laterEdit.topic, "MODIFICATIONS_CANCELLATIONS");
  });

  it("garantisce nei sorgenti che spostamenti e alert tecnici non sporchino prenotazioni o modifiche/cancellazioni", () => {
    const moveSrc = fs.readFileSync(path.resolve("api/_helpers/octorate-move.ts"), "utf8");
    const shieldSrc = fs.readFileSync(path.resolve("api/_helpers/octorate-auto-shield.ts"), "utf8");
    const webhookSrc = fs.readFileSync(path.resolve("api/_handlers/octorate-webhook.ts"), "utf8");

    assert.equal(
      /topic:\s*['"]BOOKINGS['"]/.test(moveSrc),
      false,
      "octorate-move.ts non deve inviare spostamenti al topic BOOKINGS"
    );
    assert.equal(
      /topic:\s*['"]MODIFICATIONS_CANCELLATIONS['"]/.test(moveSrc),
      true,
      "octorate-move.ts deve inviare spostamenti a MODIFICATIONS_CANCELLATIONS"
    );

    assert.equal(
      /topic:\s*['"]BOOKINGS['"]/.test(shieldSrc),
      false,
      "octorate-auto-shield.ts non deve inviare alert tecnici al topic BOOKINGS"
    );
    assert.equal(
      /topic:\s*['"]ALERTS_OVERBOOKING['"]/.test(shieldSrc),
      true,
      "octorate-auto-shield.ts deve inviare alert tecnici ad ALERTS_OVERBOOKING"
    );

    const antiReopenIdx = webhookSrc.indexOf("[ANTI-REOPEN SHIELD —");
    assert.ok(antiReopenIdx !== -1);
    const antiReopenEndIdx = webhookSrc.indexOf(");", antiReopenIdx);
    const antiReopenSlice = webhookSrc.slice(antiReopenIdx, antiReopenEndIdx + 2);
    assert.equal(antiReopenSlice.includes("ALERTS_OVERBOOKING"), true, "ANTI-REOPEN SHIELD deve puntare ad ALERTS_OVERBOOKING");
    assert.equal(antiReopenSlice.includes("MODIFICATIONS_CANCELLATIONS"), false, "ANTI-REOPEN SHIELD non deve puntare a MODIFICATIONS_CANCELLATIONS");

    const reopenWarnIdx = webhookSrc.indexOf("AVVISO NOTTI RIAPERTE TRA GIORNI CHIUSI");
    assert.ok(reopenWarnIdx !== -1);
    const reopenWarnEndIdx = webhookSrc.indexOf(");", reopenWarnIdx);
    const reopenWarnSlice = webhookSrc.slice(reopenWarnIdx, reopenWarnEndIdx + 2);
    assert.equal(reopenWarnSlice.includes("ALERTS_OVERBOOKING"), true, "AVVISO NOTTI RIAPERTE deve puntare ad ALERTS_OVERBOOKING");
    assert.equal(reopenWarnSlice.includes("MODIFICATIONS_CANCELLATIONS"), false, "AVVISO NOTTI RIAPERTE non deve puntare a MODIFICATIONS_CANCELLATIONS");

    assert.equal(
      webhookSrc.includes("handleDirectReservationCancellation(targetBooking, { skipTelegram: true })"),
      true,
      "octorate-webhook.ts deve invocare handleDirectReservationCancellation con skipTelegram: true"
    );
  });
});
