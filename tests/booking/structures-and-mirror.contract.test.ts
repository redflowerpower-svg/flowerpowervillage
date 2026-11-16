import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  ALL_OCTORATE_STRUCTURE_IDS,
  OCTORATE_STRUCTURES,
  getOctorateStructureByName,
  getOctorateStructureByRoomId,
} from "../../api/_helpers/octorate-structures.js";
import {
  JUNGLE_RATE_PAIRS,
  JUNGLE_TWIN_ROOMS,
  STANDBY_KEEPALIVE_MIN_STAY,
  computeStandbyKeepAlivePrice,
  expandMinStayEntryWithStandbyKeepAlive,
  getCompanionRateId,
  getJungleTwinPairByRateId,
  isLowSeasonKeepAliveDate,
  isMirrorReservation,
  parseOctorateTimestampMs,
  resolveTwinByProductOrName,
} from "../../api/_helpers/octorate-jungle-mirror.js";

describe("Multi-Struttura Octorate (366879 / 807324 / 619403)", () => {
  it("mantiene esattamente le 3 strutture ufficiali", () => {
    assert.deepEqual(ALL_OCTORATE_STRUCTURE_IDS, ["366879", "807324", "619403"]);
    assert.equal(OCTORATE_STRUCTURES.length, 3);
  });

  it("smista correttamente tutte le 18 Mother rooms + le 4 copie standby", () => {
    const fpvMothers = [421511, 293965, 293962, 293957, 293954, 293955, 293942];
    const fpvStandbyJungle = [960389, 960385, 960387, 960383];
    const jungleMothers = [529773, 495795, 495796, 494840];
    const hubitatMothers = [293963, 293959, 293948, 293945, 293943, 293951, 883795];

    for (const id of [...fpvMothers, ...fpvStandbyJungle]) {
      assert.equal(getOctorateStructureByRoomId(id).id, "366879", `ID ${id} atteso su 366879`);
    }
    for (const id of jungleMothers) {
      assert.equal(getOctorateStructureByRoomId(id).id, "807324", `ID ${id} atteso su 807324`);
    }
    for (const id of hubitatMothers) {
      assert.equal(getOctorateStructureByRoomId(id).id, "619403", `ID ${id} atteso su 619403`);
    }
  });

  it("non confonde 'Internal room' con le camere di Hubitat", () => {
    assert.equal(getOctorateStructureByName("Internal room").id, "366879");
    assert.equal(getOctorateStructureByName("Room 1").id, "619403");
    assert.equal(getOctorateStructureByName("Lodge 2").id, "619403");
    assert.equal(getOctorateStructureByName("Jungle Villa Left").id, "807324");
  });
});

describe("Jungle Twin Mirror & Standby Keep-Alive", () => {
  it("mappa in modo biunivoco tutte le 4 ville gemelle e le relative coppie rate", () => {
    assert.equal(JUNGLE_TWIN_ROOMS.length, 4);
    assert.ok(JUNGLE_RATE_PAIRS.length >= 4);

    for (const pair of JUNGLE_RATE_PAIRS) {
      assert.equal(getCompanionRateId(pair.jungleId), pair.fpvId);
      assert.equal(getCompanionRateId(pair.fpvId), pair.jungleId);
      assert.equal(getJungleTwinPairByRateId(pair.jungleId)?.key, pair.key);
      assert.equal(getJungleTwinPairByRateId(pair.fpvId)?.key, pair.key);
    }
  });

  it("riconosce prenotazioni mirror tramite tag o referenza MIRROR-", () => {
    assert.equal(isMirrorReservation({ refer: "MIRROR-130419544" }), true);
    assert.equal(isMirrorReservation({ privateNotes: "Creata da [MIRROR_SYNC]" }), true);
    assert.equal(isMirrorReservation({ refer: "BK-998877", guestName: "Mario Rossi" }), false);
    assert.equal(isMirrorReservation(null), false);
  });

  it("risolve correttamente il gemello per ID o nome", () => {
    assert.equal(resolveTwinByProductOrName(529773, null)?.key, "jv");
    assert.equal(resolveTwinByProductOrName(960385, null)?.key, "jvl");
    assert.equal(resolveTwinByProductOrName(null, "Jungle Villa Right 2")?.key, "jvr");
    assert.equal(resolveTwinByProductOrName(null, "Peace & Love Villa")?.key, "pl");
    assert.equal(resolveTwinByProductOrName(421511, "Penthouse Villa"), null);
  });

  it("attiva Keep-Alive solo a Luglio e calcola prezzo 2x con floor e cap 9500", () => {
    assert.equal(isLowSeasonKeepAliveDate("2027-06-30"), false);
    assert.equal(isLowSeasonKeepAliveDate("2027-07-01"), true);
    assert.equal(isLowSeasonKeepAliveDate("2027-07-31"), true);
    assert.equal(isLowSeasonKeepAliveDate("2027-08-01"), false);

    assert.equal(computeStandbyKeepAlivePrice(2290, "jv"), 4580);
    assert.equal(computeStandbyKeepAlivePrice(1290, "jvl"), 2580);
    assert.equal(computeStandbyKeepAlivePrice(6000, "jv"), 9500);
    assert.equal(computeStandbyKeepAlivePrice(0, "jv"), 4580);
  });

  it("spezza l'intervallo minStay intorno a Luglio solo su 807324 quando FPV 366879 è attiva", () => {
    const segs = expandMinStayEntryWithStandbyKeepAlive(529773, "2027-06-25", "2027-08-05", 2, "366879");
    assert.deepEqual(segs, [
      { room: 529773, dateFrom: "2027-06-25", dateTo: "2027-06-30", values: { minstay: 2 } },
      { room: 529773, dateFrom: "2027-07-01", dateTo: "2027-07-31", values: { minstay: STANDBY_KEEPALIVE_MIN_STAY } },
      { room: 529773, dateFrom: "2027-08-01", dateTo: "2027-08-05", values: { minstay: 2 } },
    ]);

    const untouched = expandMinStayEntryWithStandbyKeepAlive(529773, "2027-06-25", "2027-08-05", 2, "807324");
    assert.deepEqual(untouched, [
      { room: 529773, dateFrom: "2027-06-25", dateTo: "2027-08-05", values: { minstay: 2 } },
    ]);
  });

  it("parsa timestamp Octorate con suffisso timezone tra parentesi quadre", () => {
    const ms = parseOctorateTimestampMs("2026-11-16T08:15:00Z[UTC]");
    assert.equal(ms, Date.parse("2026-11-16T08:15:00Z"));
    assert.equal(parseOctorateTimestampMs(""), 0);
  });
});
