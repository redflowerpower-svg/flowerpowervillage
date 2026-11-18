import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  RANONG_DELIVERY_POLYGON,
  isPointInPolygon,
  isPointInRanongDeliveryZone,
} from "../../src/pizza/utils/geofence.js";

describe("Reparto /pizze — Geofence Consegna Ranong", () => {
  it("mantiene integro il poligono a 10 vertici della zona urbana di Ranong", () => {
    assert.equal(RANONG_DELIVERY_POLYGON.length, 10);
    for (const vertex of RANONG_DELIVERY_POLYGON) {
      assert.equal(Number.isFinite(vertex.lat), true);
      assert.equal(Number.isFinite(vertex.lng), true);
    }
  });

  it("accetta coordinate urbane dentro il poligono di consegna (Khao Niwet, Raksawarin, Bang Rin)", () => {
    assert.equal(isPointInRanongDeliveryZone(9.9658, 98.6348), true); // Centro Ranong / Khao Niwet
    assert.equal(isPointInRanongDeliveryZone(9.962, 98.652), true);  // Zona Raksawarin
    assert.equal(isPointInRanongDeliveryZone(9.945, 98.635), true);  // Bang Rin
    assert.equal(isPointInPolygon({ lat: 9.9658, lng: 98.6348 }, RANONG_DELIVERY_POLYGON), true);
  });

  it("rifiuta coordinate fuori zona consegna (Pak Nam, Koh Phayam, Aeroporto di Ranong)", () => {
    assert.equal(isPointInRanongDeliveryZone(9.95, 98.59), false);    // Pak Nam / Saphan Pla
    assert.equal(isPointInRanongDeliveryZone(9.735, 98.405), false);  // Koh Phayam
    assert.equal(isPointInRanongDeliveryZone(9.7776, 98.5855), false); // Aeroporto Ranong
  });

  it("gestisce coordinate invalide (NaN / valori non numerici) senza lanciare eccezioni", () => {
    assert.equal(isPointInRanongDeliveryZone(Number.NaN, 98.6348), false);
    assert.equal(isPointInRanongDeliveryZone(9.9658, Number.NaN), false);
    assert.equal(isPointInRanongDeliveryZone(Number.NaN, Number.NaN), false);
    assert.equal(isPointInRanongDeliveryZone(undefined as unknown as number, 98.6348), false);
  });
});
