import { ALL_OCTORATE_STRUCTURE_IDS, OCTORATE_STRUCTURES, getOctorateStructureByRoomId } from "./octorate-structures.js";
import { executeAutoShieldForReservation } from "./octorate-auto-shield.js";
import { sendDepartmentTelegramMessage } from "./telegram.js";

export interface MoveRoomOption {
  motherId: number;
  name: string;
  shortName: string;
  structureId: string;
  structureName: string;
  emoji: string;
  isFake?: boolean;
}

export const MOVE_ROOM_CATALOG: MoveRoomOption[] = [
  // 🌸 Flower Power Village (366879)
  { motherId: 421511, name: 'Villa Penthouse', shortName: 'Penthouse', structureId: '366879', structureName: 'Flower Power Village', emoji: '🌸' },
  { motherId: 293957, name: 'Yellow Bungalow', shortName: 'Yellow Bung.', structureId: '366879', structureName: 'Flower Power Village', emoji: '🌸' },
  { motherId: 293954, name: 'Red Bungalow', shortName: 'Red Bung.', structureId: '366879', structureName: 'Flower Power Village', emoji: '🌸' },
  { motherId: 293962, name: 'Green Bungalow', shortName: 'Green Bung.', structureId: '366879', structureName: 'Flower Power Village', emoji: '🌸' },
  { motherId: 293965, name: 'Camel Tent Bungalow', shortName: 'Camel Tent', structureId: '366879', structureName: 'Flower Power Village', emoji: '🌸' },
  { motherId: 293955, name: 'Lagoon Tent Bungalow', shortName: 'Lagoon Tent', structureId: '366879', structureName: 'Flower Power Village', emoji: '🌸' },
  { motherId: 293942, name: 'Internal Room', shortName: 'Internal Room', structureId: '366879', structureName: 'Flower Power Village', emoji: '🌸' },
  { motherId: 649669, name: 'Fake Bungalow 1', shortName: 'Fake Bung. 1', structureId: '366879', structureName: 'Flower Power Village', emoji: '🧪', isFake: true },
  { motherId: 921799, name: 'Fake Bungalow 2', shortName: 'Fake Bung. 2', structureId: '366879', structureName: 'Flower Power Village', emoji: '🧪', isFake: true },
  { motherId: 960389, name: 'Jungle Villa', shortName: 'Jungle Villa', structureId: '366879', structureName: 'Flower Power Village', emoji: '🌸' },
  { motherId: 960385, name: 'Jungle Villa Left', shortName: 'Jungle Left', structureId: '366879', structureName: 'Flower Power Village', emoji: '🌸' },
  { motherId: 960387, name: 'Jungle Villa Right', shortName: 'Jungle Right', structureId: '366879', structureName: 'Flower Power Village', emoji: '🌸' },
  { motherId: 960383, name: 'Peace & Love Villa', shortName: 'Peace & Love', structureId: '366879', structureName: 'Flower Power Village', emoji: '🌸' },

  // 🌴 Jungle Villas (807324)
  { motherId: 529773, name: 'Jungle Villa 2', shortName: 'Jungle Villa 2', structureId: '807324', structureName: 'Jungle Villas', emoji: '🌴' },
  { motherId: 495795, name: 'Jungle Villa Left 2', shortName: 'Jungle Left 2', structureId: '807324', structureName: 'Jungle Villas', emoji: '🌴' },
  { motherId: 495796, name: 'Jungle Villa Right 2', shortName: 'Jungle Right 2', structureId: '807324', structureName: 'Jungle Villas', emoji: '🌴' },
  { motherId: 494840, name: 'Peace & Love Villa 2', shortName: 'Peace & Love 2', structureId: '807324', structureName: 'Jungle Villas', emoji: '🌴' },

  // 🏠 Hubitat GuestHouse & Lodges (619403)
  { motherId: 293963, name: 'Room 1', shortName: 'Room 1', structureId: '619403', structureName: 'Hubitat', emoji: '🏠' },
  { motherId: 293959, name: 'Room 2', shortName: 'Room 2', structureId: '619403', structureName: 'Hubitat', emoji: '🏠' },
  { motherId: 293948, name: 'Room 3', shortName: 'Room 3', structureId: '619403', structureName: 'Hubitat', emoji: '🏠' },
  { motherId: 293945, name: 'Room 4', shortName: 'Room 4', structureId: '619403', structureName: 'Hubitat', emoji: '🏠' },
  { motherId: 293943, name: 'Room 5', shortName: 'Room 5', structureId: '619403', structureName: 'Hubitat', emoji: '🏠' },
  { motherId: 293951, name: 'Lodge 1', shortName: 'Lodge 1', structureId: '619403', structureName: 'Hubitat', emoji: '🏠' },
  { motherId: 883795, name: 'Lodge 2', shortName: 'Lodge 2', structureId: '619403', structureName: 'Hubitat', emoji: '🏠' }
];

export const DIRECT_CHANNEL_IDS = new Set([0, 233, 288]);

export function toThailandDateStr(raw: any): string {
  if (!raw) return '';
  const s = String(raw).trim();
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (isNaN(d.getTime())) return s.slice(0, 10);
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
  } catch {
    return s.slice(0, 10);
  }
}

export function getRoomOptionByMotherId(productId: number | string): MoveRoomOption | undefined {
  const num = Number(productId);
  return MOVE_ROOM_CATALOG.find(r => r.motherId === num);
}

export async function createOctClient(supabaseAdmin: any) {
  const { data: tokenData } = await supabaseAdmin
    .from('octorate_tokens')
    .select('access_token, refresh_token')
    .eq('id', 'singleton')
    .maybeSingle();

  if (!tokenData?.access_token) {
    throw new Error('Octorate access token not found in database');
  }

  let accessToken: string = tokenData.access_token;
  const refreshToken: string | null = tokenData.refresh_token || null;

  const tryRefreshToken = async (): Promise<string | null> => {
    const clientId = process.env.VITE_OCTORATE_CLIENT_ID;
    const clientSecret = process.env.OCTORATE_SECRET_KEY || process.env.VITE_OCTORATE_SECRET_KEY;
    if (!refreshToken || !clientId || !clientSecret) return null;
    try {
      const refreshRes = await fetch("https://api.octorate.com/connect/rest/v1/identity/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret
        }).toString()
      });
      if (refreshRes.ok) {
        const newTokens = await refreshRes.json();
        await supabaseAdmin.from('octorate_tokens').upsert({
          id: 'singleton',
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token || refreshToken,
          expires_in: newTokens.expires_in,
          updated_at: new Date().toISOString()
        });
        return newTokens.access_token;
      }
    } catch (err) {
      console.warn("[octorate-move] Token refresh failed:", err);
    }
    return null;
  };

  const octFetch = async (url: string, init: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      ...(init.headers as Record<string, string> || {})
    };
    let r = await fetch(url, { ...init, headers });
    if (r.status === 401) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        accessToken = refreshed;
        headers['Authorization'] = `Bearer ${accessToken}`;
        r = await fetch(url, { ...init, headers });
      }
    }
    return r;
  };

  return { octFetch, getAccessToken: () => accessToken };
}

export interface ReservationSearchHit {
  id: string;
  structureId: string;
  structureName: string;
  structureEmoji: string;
  guestName: string;
  roomName: string;
  productId: string;
  checkIn: string;
  checkOut: string;
  channelName: string;
  channelId: number;
  isDirect: boolean;
  refer: string;
  roomGross: number;
}

export async function searchOctorateReservations(query: string, supabaseAdmin: any): Promise<ReservationSearchHit[]> {
  const q = String(query || '').trim();
  if (!q) return [];
  const qLower = q.toLowerCase();
  const { octFetch } = await createOctClient(supabaseAdmin);

  const mapRaw = (r: any, fallbackStructId: string): ReservationSearchHit => {
    const prodId = String(r.product || r.roomTypeId || r.roomId || '');
    const structId = r.accommodation?.id ? String(r.accommodation.id) : (getOctorateStructureByRoomId(prodId).id || fallbackStructId);
    const structCfg = OCTORATE_STRUCTURES.find(s => s.id === structId) || OCTORATE_STRUCTURES[0];
    const chId = Number(r.channelId || 0);
    return {
      id: String(r.id || r.reservationId || ''),
      structureId: structCfg.id,
      structureName: structCfg.name,
      structureEmoji: structCfg.badgeEmoji,
      guestName: `${r.firstName || ''} ${r.lastName || ''}`.trim() || r.guestsList || r.guestName || 'Ospite',
      roomName: r.roomName || String(prodId),
      productId: prodId,
      checkIn: toThailandDateStr(r.checkin || r.check_in),
      checkOut: toThailandDateStr(r.checkout || r.check_out),
      channelName: r.channelName || 'Direct',
      channelId: chId,
      isDirect: !chId || DIRECT_CHANNEL_IDS.has(chId),
      refer: String(r.refer || ''),
      roomGross: Number(r.roomGross || r.totalGross || 0)
    };
  };

  // Ricerca diretta per ID numerico
  if (/^\d{6,12}$/.test(q)) {
    const hits = await Promise.all(
      ALL_OCTORATE_STRUCTURE_IDS.map(async (sId) => {
        const res = await octFetch(`https://api.octorate.com/connect/rest/v1/reservation/${sId}/${q}`);
        if (res.ok) {
          const j = await res.json();
          const st = String(j.status || '').toUpperCase();
          if (!['CANCELLED', 'CANCELED', 'DELETED', 'VOID'].includes(st)) {
            return mapRaw(j, sId);
          }
        }
        return null;
      })
    );
    const found = hits.filter(Boolean) as ReservationSearchHit[];
    if (found.length > 0) {
      // Deduplica per ID
      const byId = new Map<string, ReservationSearchHit>();
      for (const h of found) byId.set(h.id, h);
      return Array.from(byId.values());
    }
  }

  // Ricerca testuale su tutte e 3 le strutture (da ieri a +365 giorni)
  const startObj = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const endObj = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  const startDate = toThailandDateStr(startObj);
  const endDate = toThailandDateStr(endObj);

  const byId = new Map<string, ReservationSearchHit>();
  await Promise.all(
    ALL_OCTORATE_STRUCTURE_IDS.map(async (sId) => {
      for (let page = 0; page < 5; page++) {
        const r = await octFetch(`https://api.octorate.com/connect/rest/v1/reservation/${sId}?type=STAY&startDate=${startDate}&endDate=${endDate}&size=100&page=${page}`);
        if (!r.ok) break;
        const j = await r.json();
        const items = Array.isArray(j?.data) ? j.data : (Array.isArray(j) ? j : []);
        for (const item of items) {
          const st = String(item.status || '').toUpperCase();
          if (['CANCELLED', 'CANCELED', 'DELETED', 'VOID', 'REJECTED'].includes(st) || item.cancelled) continue;
          const mapped = mapRaw(item, sId);
          const hay = `${mapped.id} ${mapped.guestName} ${mapped.refer} ${mapped.roomName}`.toLowerCase();
          if (hay.includes(qLower)) {
            const existing = byId.get(mapped.id);
            if (!existing || mapped.structureId === sId) {
              byId.set(mapped.id, mapped);
            }
          }
        }
        if (items.length < 100) break;
      }
    })
  );

  return Array.from(byId.values())
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .slice(0, 10);
}

export async function fetchReservationDetail(reservationId: string, preferredStructureId: string, supabaseAdmin: any): Promise<{ orig: any; sourceStructureId: string } | null> {
  const { octFetch } = await createOctClient(supabaseAdmin);
  const candidateStructs = preferredStructureId
    ? [preferredStructureId, ...ALL_OCTORATE_STRUCTURE_IDS.filter(s => s !== preferredStructureId)]
    : ALL_OCTORATE_STRUCTURE_IDS;

  for (const sId of candidateStructs) {
    const r = await octFetch(`https://api.octorate.com/connect/rest/v1/reservation/${sId}/${reservationId}`);
    if (r.ok) {
      const orig = await r.json();
      const resolved = orig?.accommodation?.id ? String(orig.accommodation.id) : sId;
      return { orig, sourceStructureId: resolved };
    }
  }
  return null;
}

export async function findAvailableTargetRooms(
  checkIn: string,
  checkOut: string,
  excludeProductId: number | string,
  supabaseAdmin: any
): Promise<MoveRoomOption[]> {
  const { octFetch } = await createOctClient(supabaseAdmin);

  const outDate = new Date(`${checkOut}T12:00:00Z`);
  outDate.setUTCDate(outDate.getUTCDate() - 1);
  const lastNightStr = outDate.toISOString().slice(0, 10) >= checkIn
    ? outDate.toISOString().slice(0, 10)
    : checkIn;

  const excludeNum = Number(excludeProductId || 0);
  const availabilityByMotherId = new Map<number, boolean>();

  await Promise.all(
    ALL_OCTORATE_STRUCTURE_IDS.map(async (sId) => {
      const roomsInStruct = MOVE_ROOM_CATALOG.filter(r => r.structureId === sId);
      const queryProducts = roomsInStruct.map(r => `product[]=${r.motherId}`).join('&');
      const url = `https://api.octorate.com/connect/rest/v1/calendar/${sId}?${queryProducts}&dateFrom=${checkIn}&dateTo=${lastNightStr}&size=50`;
      const calRes = await octFetch(url);
      if (!calRes.ok) return;
      const calJson = await calRes.json();
      const calList = Array.isArray(calJson?.data) ? calJson.data : (Array.isArray(calJson) ? calJson : []);
      for (const roomCal of calList) {
        const mId = Number(roomCal.id || roomCal.room);
        const roomMeta = roomsInStruct.find(r => r.motherId === mId);
        if (!roomMeta) continue;
        const days = Array.isArray(roomCal.days) ? roomCal.days : [];
        let ok = days.length > 0;
        for (const day of days) {
          const avail = Number(day.availability ?? 0);
          const stopped = Boolean(day.stopSells || day.closed);
          if (avail <= 0 || (!roomMeta.isFake && stopped)) {
            ok = false;
            break;
          }
        }
        availabilityByMotherId.set(mId, ok);
      }
    })
  );

  return MOVE_ROOM_CATALOG.filter(r => r.motherId !== excludeNum && availabilityByMotherId.get(r.motherId) === true);
}

export interface ExecuteMoveParams {
  reservationId: string;
  sourceStructureId?: string;
  targetStructureId?: string;
  targetProductId: number;
  targetRoomName?: string;
  otaSourceAction?: 'note_only' | 'move_to_fake';
  holdingProductId?: number;
  dryRun?: boolean;
}

export async function executeOctorateMove(params: ExecuteMoveParams, supabaseAdmin: any): Promise<{ status: number; body: any }> {
  const reservationId = String(params.reservationId || '').trim();
  const targetProductId = Number(params.targetProductId || 0);
  const inferredRoom = getRoomOptionByMotherId(targetProductId);
  const targetStructureId = String(params.targetStructureId || inferredRoom?.structureId || '').trim();
  const targetRoomName = String(params.targetRoomName || inferredRoom?.name || '').trim();
  const otaSourceAction = params.otaSourceAction || 'note_only';
  const holdingProductId = Number(params.holdingProductId || 649669);
  const dryRun = Boolean(params.dryRun);

  if (!reservationId || !targetStructureId || !targetProductId) {
    return { status: 400, body: { error: 'Parametri mancanti: reservationId, targetProductId obbligatori' } };
  }

  const { octFetch, getAccessToken } = await createOctClient(supabaseAdmin);

  const detail = await fetchReservationDetail(reservationId, String(params.sourceStructureId || ''), supabaseAdmin);
  if (!detail) {
    return { status: 404, body: { error: `Prenotazione #${reservationId} non trovata su Octorate` } };
  }

  const { orig, sourceStructureId } = detail;
  const checkIn = toThailandDateStr(orig.checkin || orig.check_in);
  const checkOut = toThailandDateStr(orig.checkout || orig.check_out);

  if (!checkIn || !checkOut) {
    return { status: 400, body: { error: 'Date check-in / check-out non valide nella prenotazione originale' } };
  }

  const outDate = new Date(`${checkOut}T12:00:00Z`);
  outDate.setUTCDate(outDate.getUTCDate() - 1);
  const lastNightStr = outDate.toISOString().slice(0, 10) >= checkIn
    ? outDate.toISOString().slice(0, 10)
    : checkIn;

  // Verifica disponibilità reale sull'alloggio di destinazione
  const calUrl = `https://api.octorate.com/connect/rest/v1/calendar/${targetStructureId}?product[]=${targetProductId}&dateFrom=${checkIn}&dateTo=${lastNightStr}`;
  const calRes = await octFetch(calUrl);
  const blockedDates: string[] = [];
  const isTargetFake = targetProductId === 649669 || targetProductId === 921799;

  if (calRes.ok) {
    const calJson = await calRes.json();
    const calList = Array.isArray(calJson?.data) ? calJson.data : (Array.isArray(calJson) ? calJson : []);
    const roomCal = calList.find((item: any) => Number(item.id || item.room) === targetProductId) || calList[0];
    if (roomCal && Array.isArray(roomCal.days)) {
      for (const day of roomCal.days) {
        const avail = Number(day.availability ?? 0);
        const stopped = Boolean(day.stopSells || day.closed);
        if (avail <= 0 || (!isTargetFake && stopped)) {
          blockedDates.push(String(day.date));
        }
      }
    }
  }

  const chId = Number(orig.channelId || 0);
  const isDirect = !chId || DIRECT_CHANNEL_IDS.has(chId);
  const isSameStructure = sourceStructureId === targetStructureId;

  if (blockedDates.length > 0) {
    return {
      status: dryRun ? 200 : 409,
      body: {
        success: false,
        dryRun,
        available: false,
        blockedDates,
        isDirect,
        isSameStructure,
        sourceStructureId,
        targetStructureId,
        error: `Alloggio occupato o chiuso nelle date: ${blockedDates.join(', ')}`
      }
    };
  }

  if (dryRun) {
    return {
      status: 200,
      body: {
        success: true,
        dryRun: true,
        available: true,
        blockedDates: [],
        isDirect,
        isSameStructure,
        sourceStructureId,
        targetStructureId,
        channelName: orig.channelName || 'Direct'
      }
    };
  }

  const sourceStructName = OCTORATE_STRUCTURES.find(s => s.id === sourceStructureId)?.name || sourceStructureId;
  const targetStructName = OCTORATE_STRUCTURES.find(s => s.id === targetStructureId)?.name || targetStructureId;
  const origRoomName = orig.roomName || String(orig.product || '');
  const guestFullName = `${orig.firstName || ''} ${orig.lastName || ''}`.trim() || orig.guestsList || 'Guest';

  const roomGross = Number(orig.roomGross || orig.totalGross || 0);
  const totalPaid = Number(orig.totalPaid || 0);
  const balanceDue = Math.max(0, roomGross - totalPaid);

  // A. Stessa struttura (PATCH)
  if (isSameStructure) {
    const existingNotes = String(orig.privateNotes || '').trim();
    const moveTrace = `Administrative Note : Room moved internally from ${origRoomName} to ${targetRoomName || targetProductId}`;
    const updatedNotes = existingNotes ? `${existingNotes}\n${moveTrace}` : moveTrace;

    const patchRes = await octFetch(`https://api.octorate.com/connect/rest/v1/reservation/${sourceStructureId}/${reservationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product: targetProductId,
        privateNotes: updatedNotes
      })
    });

    if (!patchRes.ok) {
      const errText = await patchRes.text();
      return { status: patchRes.status, body: { error: `Octorate PATCH fallito: ${errText}` } };
    }

    executeAutoShieldForReservation({
      accessToken: getAccessToken(),
      checkIn,
      checkOut,
      roomName: targetRoomName,
      productId: targetProductId,
      reservationId,
      guestName: guestFullName,
      channelName: orig.channelName || 'Direct',
      supabaseAdmin
    }).catch(() => { });

    sendDepartmentTelegramMessage('village',
      `🔄 <b>[Spostamento Alloggio Octorate]</b>\n` +
      `👤 Ospite: <b>${guestFullName}</b>\n` +
      `🏨 Struttura: <b>${sourceStructName}</b>\n` +
      `🛏️ Da: <b>${origRoomName}</b> ➔ A: <b>${targetRoomName || targetProductId}</b>\n` +
      `📅 Date: <b>${checkIn} → ${checkOut}</b>\n` +
      `🆔 Prenotazione: <code>#${reservationId}</code>`,
      { topic: 'BOOKINGS' }
    ).catch(() => { });

    return {
      status: 200,
      body: {
        success: true,
        mode: 'same_structure',
        reservationId,
        newReservationId: reservationId,
        sourceStructureId,
        targetStructureId,
        sourceAction: 'updated_in_place'
      }
    };
  }

  // B. Cross-struttura (Regola 28: 100% Inglese, BALANCE DUE primo, simbolo ฿ dopo cifra, zero |)
  const noteLines = [
    `=== MOVED RESERVATION SUMMARY ===`,
    `BALANCE DUE         : ${balanceDue.toLocaleString('en')} ฿`,
    `Total Amount        : ${roomGross.toLocaleString('en')} ฿`,
    `Deposit Paid        : ${totalPaid.toLocaleString('en')} ฿`,
    `Stay                : ${checkIn} -> ${checkOut}`,
    `Moved From          : ${sourceStructName} (${origRoomName}) #${reservationId}`,
    `Original Channel    : ${orig.channelName || 'Direct'} (${orig.refer || 'N/A'})`,
    `=================================`
  ];
  if (orig.privateNotes) {
    noteLines.push(`Original Notes:\n${String(orig.privateNotes).trim()}`);
  }
  const newPrivateNotes = noteLines.join('\n');

  const guestsPayload = Array.isArray(orig.guests) && orig.guests.length > 0
    ? orig.guests.map((g: any) => ({
      type: g.type || 'BOOKER',
      givenName: g.givenName || orig.firstName || 'Guest',
      familyName: g.familyName || orig.lastName || 'Guest',
      email: orig.guestMailAddress || g.email || '',
      phone: orig.phone || g.phone || '',
      checkin: checkIn,
      checkout: checkOut
    }))
    : [{
      type: 'BOOKER',
      givenName: orig.firstName || guestFullName.split(' ')[0] || 'Guest',
      familyName: orig.lastName || guestFullName.split(' ').slice(1).join(' ') || 'Guest',
      email: orig.guestMailAddress || '',
      phone: orig.phone || '',
      checkin: checkIn,
      checkout: checkOut
    }];

  const nowIso = new Date().toISOString();
  const createPayload = {
    status: 'CONFIRMED',
    refer: `MV-${reservationId}`.slice(0, 25),
    channelId: Number(orig.channelId || 233),
    ...(orig.channelRefer ? { channelRefer: String(orig.channelRefer) } : {}),
    product: targetProductId,
    checkin: `${checkIn}T14:00:00Z`,
    checkout: `${checkOut}T12:00:00Z`,
    createTime: nowIso,
    updateTime: nowIso,
    guests: guestsPayload,
    roomGross,
    totalGuest: Number(orig.totalGuest || 2),
    totalChildren: Number(orig.totalChildren || 0),
    totalInfants: Number(orig.totalInfants || 0),
    privateNotes: newPrivateNotes
  };

  const createRes = await octFetch(`https://api.octorate.com/connect/rest/v1/reservation/${targetStructureId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(createPayload)
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    return { status: createRes.status, body: { error: `Creazione su struttura destinazione fallita (${createRes.status}): ${errText}` } };
  }

  const createdJson = await createRes.json();
  const newReservationId = String(createdJson.id || createdJson.reservationId || '');

  if (newReservationId && totalPaid > 0) {
    await octFetch(`https://api.octorate.com/connect/rest/v1/reservation/${targetStructureId}/${newReservationId}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentMode: 'BANKTRANSFER',
        referenceTime: nowIso,
        amount: totalPaid,
        description: `Transferred deposit from #${reservationId} (${sourceStructName})`,
        status: 'NORMAL'
      })
    }).catch(() => { });
  }

  let sourceAction = 'note_updated';
  let sourceWarning: string | undefined;

  if (isDirect) {
    const delRes = await octFetch(`https://api.octorate.com/connect/rest/v1/reservation/${sourceStructureId}/${reservationId}`, {
      method: 'DELETE'
    });
    if (delRes.ok) {
      sourceAction = 'deleted_original';
    } else {
      sourceAction = 'delete_failed_kept_note';
      sourceWarning = `Nuova prenotazione #${newReservationId} creata, ma cancellazione originale #${reservationId} rifiutata da Octorate (${delRes.status}).`;
    }
  } else {
    const origTrace = `Administrative Note : Moved to ${targetStructName} (${targetRoomName || targetProductId}) -> New ID #${newReservationId}`;
    const existingOrigNotes = String(orig.privateNotes || '').trim();
    const updatedOrigNotes = existingOrigNotes ? `${existingOrigNotes}\n${origTrace}` : origTrace;

    if (otaSourceAction === 'move_to_fake' && sourceStructureId === '366879') {
      const patchOrig = await octFetch(`https://api.octorate.com/connect/rest/v1/reservation/${sourceStructureId}/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: holdingProductId,
          privateNotes: updatedOrigNotes
        })
      });
      if (patchOrig.ok) {
        sourceAction = 'moved_original_to_holding_unit';
      } else {
        sourceAction = 'note_only_fallback';
        sourceWarning = `Nuova prenotazione #${newReservationId} creata, ma Octorate non ha permesso di spostare l'OTA su Fake Bungalow (${patchOrig.status}).`;
      }
    } else {
      await octFetch(`https://api.octorate.com/connect/rest/v1/reservation/${sourceStructureId}/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privateNotes: updatedOrigNotes })
      }).catch(() => { });
      sourceAction = 'ota_kept_with_note';
    }
  }

  executeAutoShieldForReservation({
    accessToken: getAccessToken(),
    checkIn,
    checkOut,
    roomName: targetRoomName,
    productId: targetProductId,
    reservationId: newReservationId || reservationId,
    guestName: guestFullName,
    channelName: orig.channelName || 'Direct',
    supabaseAdmin
  }).catch(() => { });

  sendDepartmentTelegramMessage('village',
    `🔀 <b>[Spostamento Cross-Struttura Octorate]</b>\n` +
    `👤 Ospite: <b>${guestFullName}</b>\n` +
    `📤 Da: <b>${sourceStructName}</b> (${origRoomName}) <code>#${reservationId}</code>\n` +
    `📥 A: <b>${targetStructName}</b> (${targetRoomName || targetProductId}) <code>#${newReservationId}</code>\n` +
    `📅 Date: <b>${checkIn} → ${checkOut}</b>\n` +
    `⚙️ Origine: <b>${sourceAction}</b>`,
    { topic: 'BOOKINGS' }
  ).catch(() => { });

  return {
    status: 200,
    body: {
      success: true,
      mode: 'cross_structure',
      reservationId,
      newReservationId,
      sourceStructureId,
      targetStructureId,
      sourceAction,
      warning: sourceWarning
    }
  };
}

