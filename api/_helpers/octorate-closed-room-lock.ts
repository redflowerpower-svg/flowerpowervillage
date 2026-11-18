/**
 * 🔒 Scudo Anti-Riapertura Stanze Chiuse (Closed Room Hard-Lock)
 *
 * Previene il comportamento di Octorate PMS per cui la cancellazione o riduzione
 * di una prenotazione manuale su una stanza chiusa (availability = 0) incrementa
 * nuovamente la disponibilità (0 -> 1) rimettendo in vendita le notti liberate.
 *
 * Per ogni stanza/intervallo in Hard-Lock:
 * - Forza `availability: 0` sulla Madre + `stopSells: true, closed: true, closedArrival: true, closedDeparture: true`
 *   su Madre e su TUTTE le tariffe derivate.
 * - Viene eseguito in tempo reale dal Webhook Octorate e verificato periodicamente da Resort Sentinel.
 */
import { postOctorateCalendarBulkWithRetry } from "./octorate-client.js";

export const CLOSED_ROOM_LOCKS_ROW_ID = "resort_closed_room_locks_v1";

export interface ClosedRoomLock {
  id: string;
  roomKey: string;
  motherId: number;
  roomName: string;
  dateFrom: string; // YYYY-MM-DD
  dateTo: string;   // YYYY-MM-DD
  reason?: string;
  enabled: boolean;
  updatedAt: string;
}

export interface LockableRoomDefinition {
  roomKey: string;
  motherId: number;
  name: string;
  productIds: number[];
}

export const LOCKABLE_ROOMS: LockableRoomDefinition[] = [
  {
    roomKey: "r1",
    motherId: 293963,
    name: "Room 1",
    productIds: [293963, 449678, 422300, 332737, 332735, 331976, 916818, 331977, 916402, 921889, 921890, 297033, 421505]
  },
  {
    roomKey: "r2",
    motherId: 293959,
    name: "Room 2",
    productIds: [293959, 449684, 422296, 332741, 332739, 331966, 332119, 331967, 332134, 921891, 921900, 297032, 421506]
  },
  {
    roomKey: "r3",
    motherId: 293948,
    name: "Room 3",
    productIds: [293948, 449699, 422293, 332743, 332757, 331968, 332121, 331969, 332136, 921892, 921893, 297028, 421507]
  },
  {
    roomKey: "r4",
    motherId: 293945,
    name: "Room 4",
    productIds: [293945, 449724, 422265, 332759, 332746, 331970, 332123, 331971, 332138, 921894, 921895, 297029, 421508]
  },
  {
    roomKey: "r5",
    motherId: 293943,
    name: "Room 5",
    productIds: [293943, 449730, 422213, 332765, 332763, 331972, 332125, 331973, 332140, 921896, 921897, 297031, 421509]
  },
  {
    roomKey: "lodge1",
    motherId: 293951,
    name: "Lodge 1",
    productIds: [293951, 449736, 422149, 332769, 332767, 331974, 332129, 422157, 332142, 921884, 921885, 297030, 421510]
  },
  {
    roomKey: "lodge2",
    motherId: 883795,
    name: "Lodge 2",
    productIds: [883795, 923905, 916110, 916107, 916109, 916114, 916829, 916105, 916830, 921886, 921887, 916103, 916104]
  },
  {
    roomKey: "inter",
    motherId: 293942,
    name: "Internal Room",
    productIds: [293942, 449742, 872182, 332109, 332105, 340367, 916840, 421998, 916838, 921898, 921899, 297027, 422147]
  },
  {
    roomKey: "yellow",
    motherId: 293957,
    name: "Yellow Bungalow",
    productIds: [293957, 449385, 422422, 332055, 332054, 331921, 332057, 331922, 332060, 921878, 921879, 297022, 340198]
  },
  {
    roomKey: "red",
    motherId: 293954,
    name: "Red Bungalow",
    productIds: [293954, 449422, 422131, 332030, 332029, 330964, 332035, 330970, 332036, 921880, 921881, 297021, 340196]
  },
  {
    roomKey: "green",
    motherId: 293962,
    name: "Green Bungalow",
    productIds: [293962, 449668, 422402, 332070, 332066, 331923, 332072, 331924, 332074, 921882, 921883, 297023, 340200]
  },
  {
    roomKey: "camel",
    motherId: 293965,
    name: "Camel Tent",
    productIds: [293965, 449675, 422325, 332089, 332084, 297025]
  },
  {
    roomKey: "lagoon",
    motherId: 293955,
    name: "Lagoon Tent",
    productIds: [293955, 449674, 422351, 332081, 332077, 297024]
  },
  {
    roomKey: "pent",
    motherId: 421511,
    name: "Villa Penthouse",
    productIds: [421511, 449348, 422445, 421516, 421520, 421522, 421525, 421527, 421530, 921876, 921877, 421532, 421533]
  },
  {
    roomKey: "jv",
    motherId: 529773,
    name: "Jungle Villa",
    productIds: [529773, 529784, 529778, 529792, 529788, 529780, 916816, 529781, 529801, 921868, 921869, 529783, 529813, 960389, 960403, 960404, 960405, 960406, 960407, 960408, 960409, 960410, 960411, 960412, 960413, 960414]
  },
  {
    roomKey: "jvl",
    motherId: 495795,
    name: "Jungle Villa Left",
    productIds: [495795, 495807, 495803, 496009, 496001, 495805, 496022, 495806, 496031, 921870, 921871, 495810, 496057, 960385, 960415, 960416, 960417, 960418, 960419, 960420, 960421, 960422, 960423, 960424, 960425, 960426]
  },
  {
    roomKey: "jvr",
    motherId: 495796,
    name: "Jungle Villa Right",
    productIds: [495796, 495980, 495976, 496010, 496002, 495978, 496021, 495979, 496030, 921872, 921873, 495982, 496056, 960387, 960427, 960428, 960429, 960430, 960431, 960432, 960433, 960434, 960435, 960436, 960437, 960438]
  },
  {
    roomKey: "pl",
    motherId: 494840,
    name: "Peace & Love Villa",
    productIds: [494840, 495566, 495549, 495580, 495575, 495552, 495587, 495565, 495593, 921874, 921875, 495569, 495609, 960383, 960391, 960392, 960393, 960394, 960395, 960396, 960397, 960398, 960399, 960400, 960401, 960402]
  },
  {
    roomKey: "fb1",
    motherId: 649669,
    name: "Fake Bungalow 1 (Test)",
    productIds: [649669, 932243, 932244, 932246, 932247, 932248, 932249, 932250, 932251, 932252, 932253, 932254, 932255]
  },
  {
    roomKey: "fb2",
    motherId: 921799,
    name: "Fake Bungalow 2 (Test)",
    productIds: [921799, 932256, 932257, 932259, 932260, 932261, 932262, 932263, 932264, 932265, 932266, 932267, 932268]
  }
];

const ROOM_NAME_ALIASES: Record<string, string> = {
  "room 1": "r1",
  "room 2": "r2",
  "room 3": "r3",
  "room 4": "r4",
  "room 5": "r5",
  "lodge 1": "lodge1",
  "lodge 2": "lodge2",
  "internal room": "inter",
  "yellow bungalow": "yellow",
  "red bungalow": "red",
  "green bungalow": "green",
  "camel tent": "camel",
  "camel tent bungalow": "camel",
  "lagoon tent": "lagoon",
  "lagoon tent bungalow": "lagoon",
  "villa penthouse": "pent",
  "penthouse villa": "pent",
  "jungle villa": "jv",
  "jungle villa left": "jvl",
  "jungle villa right": "jvr",
  "peace & love villa": "pl",
  "fake bungalow 1": "fb1",
  "fake bungalow 2": "fb2"
};

export function resolveLockableRoom(identifier?: string | number | null): LockableRoomDefinition | null {
  if (identifier === undefined || identifier === null) return null;
  const raw = String(identifier).trim().toLowerCase();
  if (!raw) return null;

  const byKey = LOCKABLE_ROOMS.find(r => r.roomKey === raw);
  if (byKey) return byKey;

  const aliasKey = ROOM_NAME_ALIASES[raw];
  if (aliasKey) {
    return LOCKABLE_ROOMS.find(r => r.roomKey === aliasKey) || null;
  }

  const num = Number(raw);
  if (!isNaN(num) && num > 0) {
    const byProd = LOCKABLE_ROOMS.find(r => r.motherId === num || r.productIds.includes(num));
    if (byProd) return byProd;
  }

  return null;
}

export async function loadClosedRoomLocks(supabaseAdmin: any): Promise<ClosedRoomLock[]> {
  if (!supabaseAdmin) return [];
  try {
    const { data, error } = await supabaseAdmin
      .from("telegram_config")
      .select("bot_token")
      .eq("id", CLOSED_ROOM_LOCKS_ROW_ID)
      .maybeSingle();

    if (error || !data?.bot_token) return [];
    const parsed = JSON.parse(data.bot_token);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item: any) =>
        item &&
        typeof item.roomKey === "string" &&
        typeof item.dateFrom === "string" &&
        typeof item.dateTo === "string"
    );
  } catch (err) {
    console.warn("[ClosedRoomLock] Load warning:", err);
    return [];
  }
}

export async function saveClosedRoomLocks(supabaseAdmin: any, locks: ClosedRoomLock[]): Promise<void> {
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin.from("telegram_config").upsert({
    id: CLOSED_ROOM_LOCKS_ROW_ID,
    bot_token: JSON.stringify(locks),
    chat_id: "closed_room_locks",
    updated_at: new Date().toISOString()
  });
  if (error) {
    throw new Error(`Impossibile salvare i lock stanze chiuse: ${error.message}`);
  }
}

export function isDateLockedForRoom(
  locks: ClosedRoomLock[],
  roomIdentifier: string | number | null | undefined,
  dateStr: string
): boolean {
  if (!locks || locks.length === 0 || !dateStr) return false;
  const room = resolveLockableRoom(roomIdentifier);
  if (!room) return false;

  return locks.some(
    lock =>
      lock.enabled !== false &&
      lock.roomKey === room.roomKey &&
      dateStr >= lock.dateFrom &&
      dateStr <= lock.dateTo
  );
}

export function getActiveLocksForRoom(
  locks: ClosedRoomLock[],
  roomIdentifier: string | number | null | undefined
): ClosedRoomLock[] {
  const room = resolveLockableRoom(roomIdentifier);
  if (!room) return [];
  return locks.filter(l => l.enabled !== false && l.roomKey === room.roomKey);
}

/**
 * Sigilla immediatamente su Octorate (availability: 0 sulla Madre + stopSells: true su Madre e derivate)
 * l'intervallo di date di una stanza in Hard-Lock.
 * Se viene passata la griglia `calendarItems`, aggiorna in modo chirurgico solo le date/tariffe
 * che risultano effettivamente riaperte (availability > 0 oppure stopSells === false).
 */
export async function sealLockedRoomRangeOnOctorate(params: {
  accessToken: string;
  clientId?: string;
  roomKeyOrId: string | number;
  dateFrom: string;
  dateTo: string;
  calendarItems?: any[];
  logPrefix?: string;
}): Promise<{ sealedEntries: number; sealedDatesCount: number; lastStatus: number }> {
  const {
    accessToken,
    clientId,
    roomKeyOrId,
    dateFrom,
    dateTo,
    calendarItems,
    logPrefix = "[CLOSED-ROOM-LOCK]"
  } = params;

  const room = resolveLockableRoom(roomKeyOrId);
  if (!room || !accessToken || !dateFrom || !dateTo || dateFrom > dateTo) {
    return { sealedEntries: 0, sealedDatesCount: 0, lastStatus: 200 };
  }

  const motherIdsForRoom = new Set<number>([room.motherId]);
  if (room.roomKey === "jv") motherIdsForRoom.add(960389);
  if (room.roomKey === "jvl") motherIdsForRoom.add(960385);
  if (room.roomKey === "jvr") motherIdsForRoom.add(960387);
  if (room.roomKey === "pl") motherIdsForRoom.add(960383);

  const payloadItems: any[] = [];
  const touchedDates = new Set<string>();

  if (calendarItems && calendarItems.length > 0) {
    const productSet = new Set<number>(room.productIds);
    for (const item of calendarItems) {
      const prodId = Number(item?.id || item?.productId || 0);
      if (!productSet.has(prodId)) continue;

      const isMother = motherIdsForRoom.has(prodId);
      const daysList = Array.isArray(item?.calendar)
        ? item.calendar
        : Array.isArray(item?.days)
          ? item.days
          : [];

      const openDates: string[] = [];
      for (const d of daysList) {
        const dStr = String(d?.date || d?.day || "").slice(0, 10);
        if (!dStr || dStr < dateFrom || dStr > dateTo) continue;

        const avail = Number(d?.availability ?? 0);
        const isClosed = d?.stopSells === true || d?.stopSell === true || d?.closed === true;
        if ((isMother && avail > 0) || !isClosed) {
          openDates.push(dStr);
          touchedDates.add(dStr);
        }
      }

      if (openDates.length === 0) continue;
      openDates.sort();

      // Raggruppa date consecutive per ridurre il numero di entry nel payload bulk
      let segStart = openDates[0];
      let segPrev = openDates[0];
      const pushSegment = (from: string, to: string) => {
        payloadItems.push({
          room: prodId,
          dateFrom: from,
          dateTo: to,
          values: {
            ...(isMother ? { availability: 0 } : {}),
            stopSells: true,
            closed: true,
            closedArrival: true,
            closedDeparture: true
          }
        });
      };

      for (let i = 1; i < openDates.length; i++) {
        const curr = openDates[i];
        const prevDate = new Date(`${segPrev}T00:00:00Z`);
        prevDate.setUTCDate(prevDate.getUTCDate() + 1);
        const expectedNext = prevDate.toISOString().slice(0, 10);

        if (curr === expectedNext) {
          segPrev = curr;
        } else {
          pushSegment(segStart, segPrev);
          segStart = curr;
          segPrev = curr;
        }
      }
      pushSegment(segStart, segPrev);
    }
  } else {
    // Modalità forzata diretta su tutto l'intervallo (es. attivazione immediata da Dashboard)
    for (const prodId of room.productIds) {
      const isMother = motherIdsForRoom.has(prodId);
      payloadItems.push({
        room: prodId,
        dateFrom,
        dateTo,
        values: {
          ...(isMother ? { availability: 0 } : {}),
          stopSells: true,
          closed: true,
          closedArrival: true,
          closedDeparture: true
        }
      });
    }
    touchedDates.add(dateFrom);
  }

  if (payloadItems.length === 0) {
    return { sealedEntries: 0, sealedDatesCount: 0, lastStatus: 200 };
  }

  const chunks: any[][] = [];
  const chunkSize = 250;
  for (let i = 0; i < payloadItems.length; i += chunkSize) {
    chunks.push(payloadItems.slice(i, i + chunkSize));
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    Accept: "application/json"
  };
  if (clientId) headers["Octorate-Api-Key"] = clientId;

  const { lastStatus, succeededItems } = await postOctorateCalendarBulkWithRetry(headers, chunks, {
    interBatchDelayMs: 900,
    quotaRetryDelayMs: 2200,
    maxQuotaRetries: 2,
    logPrefix
  });

  console.log(
    `${logPrefix} Sigillate ${succeededItems}/${payloadItems.length} entry per ${room.name} (${dateFrom} -> ${dateTo}, HTTP ${lastStatus}).`
  );

  return {
    sealedEntries: succeededItems,
    sealedDatesCount: touchedDates.size,
    lastStatus
  };
}
