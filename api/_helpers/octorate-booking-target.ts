/**
 * 🎯 Risolutore Multi-Struttura Octorate per Prenotazioni Sito Web
 *
 * Determina in modo deterministico:
 *  - la struttura Octorate corretta (`366879` Flower Power Village, `807324` Jungle Villas, `619403` Hubitat)
 *  - il `productId` (BE Rate Plan) e `motherId` (fallback sicuro) validi su quella specifica struttura
 *  - lo stato dinamico `active_jungle_source_v1` per le 4 Jungle Villas (gemelle tra 366879 e 807324)
 */

import type { JungleSourceStructureId } from "./octorate-catalog.js";
import {
  JUNGLE_TWIN_ROOMS,
  JUNGLE_RATE_PAIRS,
  getJungleTwinPairByRateId,
  resolveTwinByProductOrName
} from "./octorate-catalog.js";
import { getOctorateStructureByRoomId } from "./octorate-structures.js";
import { getActiveJungleSource } from "./octorate-jungle-mirror.js";

export interface OctorateBookingTarget {
  structureId: string;
  structureName: string;
  productId: number;
  motherId: number;
  isJungle: boolean;
  activeJungleSource?: JungleSourceStructureId;
  roomName?: string;
}

const STATIC_BE_TO_MOTHER: Record<number, { motherId: number; structureId: string; structureName: string; name: string }> = {
  // 🌸 Flower Power Village (366879)
  449348: { motherId: 421511, structureId: '366879', structureName: 'Flower Power Village', name: 'Villa Penthouse' },
  421511: { motherId: 421511, structureId: '366879', structureName: 'Flower Power Village', name: 'Villa Penthouse' },
  449385: { motherId: 293957, structureId: '366879', structureName: 'Flower Power Village', name: 'Yellow Bungalow' },
  293957: { motherId: 293957, structureId: '366879', structureName: 'Flower Power Village', name: 'Yellow Bungalow' },
  449422: { motherId: 293954, structureId: '366879', structureName: 'Flower Power Village', name: 'Red Bungalow' },
  293954: { motherId: 293954, structureId: '366879', structureName: 'Flower Power Village', name: 'Red Bungalow' },
  449668: { motherId: 293962, structureId: '366879', structureName: 'Flower Power Village', name: 'Green Bungalow' },
  293962: { motherId: 293962, structureId: '366879', structureName: 'Flower Power Village', name: 'Green Bungalow' },
  449675: { motherId: 293965, structureId: '366879', structureName: 'Flower Power Village', name: 'Camel Tent Glamping' },
  293965: { motherId: 293965, structureId: '366879', structureName: 'Flower Power Village', name: 'Camel Tent Glamping' },
  449674: { motherId: 293955, structureId: '366879', structureName: 'Flower Power Village', name: 'Lagoon Tent Glamping' },
  293955: { motherId: 293955, structureId: '366879', structureName: 'Flower Power Village', name: 'Lagoon Tent Glamping' },
  449742: { motherId: 293942, structureId: '366879', structureName: 'Flower Power Village', name: 'Internal Room' },
  293942: { motherId: 293942, structureId: '366879', structureName: 'Flower Power Village', name: 'Internal Room' },

  // 🏠 Hubitat GuestHouse & Lodges (619403)
  449678: { motherId: 293963, structureId: '619403', structureName: 'Hubitat', name: 'Room 1' },
  293963: { motherId: 293963, structureId: '619403', structureName: 'Hubitat', name: 'Room 1' },
  449684: { motherId: 293959, structureId: '619403', structureName: 'Hubitat', name: 'Room 2' },
  293959: { motherId: 293959, structureId: '619403', structureName: 'Hubitat', name: 'Room 2' },
  449699: { motherId: 293948, structureId: '619403', structureName: 'Hubitat', name: 'Room 3' },
  293948: { motherId: 293948, structureId: '619403', structureName: 'Hubitat', name: 'Room 3' },
  449724: { motherId: 293945, structureId: '619403', structureName: 'Hubitat', name: 'Room 4' },
  293945: { motherId: 293945, structureId: '619403', structureName: 'Hubitat', name: 'Room 4' },
  449730: { motherId: 293943, structureId: '619403', structureName: 'Hubitat', name: 'Room 5' },
  293943: { motherId: 293943, structureId: '619403', structureName: 'Hubitat', name: 'Room 5' },
  449736: { motherId: 293951, structureId: '619403', structureName: 'Hubitat', name: 'Lodge 1' },
  293951: { motherId: 293951, structureId: '619403', structureName: 'Hubitat', name: 'Lodge 1' },
  923905: { motherId: 883795, structureId: '619403', structureName: 'Hubitat', name: 'Lodge 2' },
  883795: { motherId: 883795, structureId: '619403', structureName: 'Hubitat', name: 'Lodge 2' }
};

/**
 * Risoluzione pura e deterministica (testabile senza I/O).
 */
export function resolveOctorateBookingTargetPure(
  accommodationId: number | string,
  activeJungleSource: JungleSourceStructureId,
  roomNameHint?: string
): OctorateBookingTarget {
  const numId = Number(accommodationId);

  // 1. Check if this accommodation is one of the 4 Jungle Villas (twin between 807324 & 366879)
  const pair = getJungleTwinPairByRateId(numId);
  const twin = pair
    ? JUNGLE_TWIN_ROOMS.find((r) => r.key === pair.key) || null
    : resolveTwinByProductOrName(numId, roomNameHint);

  if (twin) {
    const bePair = JUNGLE_RATE_PAIRS.find((p) => p.key === twin.key && p.isBe);
    if (activeJungleSource === '366879') {
      const targetProductId = pair
        ? pair.fpvId
        : (bePair ? bePair.fpvId : twin.fpvMotherId);
      return {
        structureId: '366879',
        structureName: 'Flower Power Village',
        productId: targetProductId,
        motherId: twin.fpvMotherId,
        isJungle: true,
        activeJungleSource,
        roomName: twin.name
      };
    } else {
      const targetProductId = pair
        ? pair.jungleId
        : (bePair ? bePair.jungleId : twin.jungleMotherId);
      return {
        structureId: '807324',
        structureName: 'Jungle Villas',
        productId: targetProductId,
        motherId: twin.jungleMotherId,
        isJungle: true,
        activeJungleSource,
        roomName: twin.name
      };
    }
  }

  // 2. Check static mapping for FPV (366879) and Hubitat (619403)
  if (STATIC_BE_TO_MOTHER[numId]) {
    const entry = STATIC_BE_TO_MOTHER[numId];
    return {
      structureId: entry.structureId,
      structureName: entry.structureName,
      productId: numId,
      motherId: entry.motherId,
      isJungle: false,
      roomName: entry.name
    };
  }

  // 3. Generic fallback via octorate-structures.ts
  const struct = getOctorateStructureByRoomId(numId);
  return {
    structureId: struct.id,
    structureName: struct.name,
    productId: numId,
    motherId: numId,
    isJungle: false,
    roomName: roomNameHint || undefined
  };
}

/**
 * Risoluzione live che legge `active_jungle_source_v1` da Supabase.
 */
export async function resolveOctorateBookingTarget(
  accommodationId: number | string,
  supabaseAdmin?: any,
  roomNameHint?: string
): Promise<OctorateBookingTarget> {
  const activeJungleSource = await getActiveJungleSource(supabaseAdmin);
  return resolveOctorateBookingTargetPure(accommodationId, activeJungleSource, roomNameHint);
}
