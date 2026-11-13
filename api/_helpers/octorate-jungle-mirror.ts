/**
 * 🔄 Motore Mirroring & Switch Interscambiabile: Jungle Villas (807324) <-> Flower Power Village (366879)
 *
 * Garantisce che una sola struttura sia attiva alla volta (zero overbooking),
 * mantenendo prenotazioni future, giorni occupati e prezzi specchiati sulla struttura in standby.
 */

export type JungleSourceStructureId = '807324' | '366879';

export interface JungleTwinRoom {
  key: 'jv' | 'jvl' | 'jvr' | 'pl';
  name: string;
  jungleName: string;
  jungleStructureId: '807324';
  jungleMotherId: number;
  fpvName: string;
  fpvStructureId: '366879';
  fpvMotherId: number;
}

export const JUNGLE_TWIN_ROOMS: JungleTwinRoom[] = [
  {
    key: 'jv',
    name: 'Jungle Villa',
    jungleName: 'Jungle Villa 2',
    jungleStructureId: '807324',
    jungleMotherId: 529773,
    fpvName: 'Jungle Villa',
    fpvStructureId: '366879',
    fpvMotherId: 960389
  },
  {
    key: 'jvl',
    name: 'Jungle Villa Left',
    jungleName: 'Jungle Villa Left 2',
    jungleStructureId: '807324',
    jungleMotherId: 495795,
    fpvName: 'Jungle Villa Left',
    fpvStructureId: '366879',
    fpvMotherId: 960385
  },
  {
    key: 'jvr',
    name: 'Jungle Villa Right',
    jungleName: 'Jungle Villa Right 2',
    jungleStructureId: '807324',
    jungleMotherId: 495796,
    fpvName: 'Jungle Villa Right',
    fpvStructureId: '366879',
    fpvMotherId: 960387
  },
  {
    key: 'pl',
    name: 'Peace & Love Villa',
    jungleName: 'Peace & Love Villa 2',
    jungleStructureId: '807324',
    jungleMotherId: 494840,
    fpvName: 'Peace & Love Villa',
    fpvStructureId: '366879',
    fpvMotherId: 960383
  }
];

export const MIRROR_TAG = '[MIRROR_SYNC]';
const ACTIVE_SOURCE_CONFIG_ID = 'active_jungle_source_v1';

export function isMirrorReservation(booking: any): boolean {
  if (!booking) return false;
  const hay = [
    booking.privateNotes,
    booking.notes,
    booking.refer,
    booking.channelName,
    booking.guestName
  ]
    .filter(Boolean)
    .join(' ');
  return hay.includes(MIRROR_TAG) || String(booking.refer || '').startsWith('MIRROR-');
}

export function resolveTwinByProductOrName(
  productId?: number | string | null,
  roomName?: string | null
): JungleTwinRoom | null {
  const num = Number(productId);
  if (num) {
    const byId = JUNGLE_TWIN_ROOMS.find(
      r => r.jungleMotherId === num || r.fpvMotherId === num
    );
    if (byId) return byId;
  }
  const s = String(roomName || '').toLowerCase();
  if (!s) return null;
  if (s.includes('peace') || s.includes('love') || s.includes('p&l')) {
    return JUNGLE_TWIN_ROOMS.find(r => r.key === 'pl') || null;
  }
  if (s.includes('left') || s.includes('jvl')) {
    return JUNGLE_TWIN_ROOMS.find(r => r.key === 'jvl') || null;
  }
  if (s.includes('right') || s.includes('jvr')) {
    return JUNGLE_TWIN_ROOMS.find(r => r.key === 'jvr') || null;
  }
  if (s.includes('jungle') || s.includes('jv')) {
    return JUNGLE_TWIN_ROOMS.find(r => r.key === 'jv') || null;
  }
  return null;
}

export async function getActiveJungleSource(supabaseAdmin: any): Promise<JungleSourceStructureId> {
  if (!supabaseAdmin) return '807324';
  try {
    const { data } = await supabaseAdmin
      .from('telegram_config')
      .select('bot_token')
      .eq('id', ACTIVE_SOURCE_CONFIG_ID)
      .maybeSingle();
    if (data?.bot_token === '366879') return '366879';
  } catch {
    // fallback sicuro su Jungle Villas attiva
  }
  return '807324';
}

export async function setActiveJungleSource(
  supabaseAdmin: any,
  target: JungleSourceStructureId
): Promise<void> {
  if (!supabaseAdmin) return;
  await supabaseAdmin.from('telegram_config').upsert({
    id: ACTIVE_SOURCE_CONFIG_ID,
    bot_token: target,
    chat_id: target === '366879' ? 'Flower Power Village' : 'Jungle Villas',
    updated_at: new Date().toISOString()
  });
}

export interface MirrorParams {
  supabaseAdmin: any;
  accessToken: string;
  sourceStructureId: string;
  sourceReservationId: string | number;
  productId?: number | string | null;
  roomName?: string | null;
  checkIn: string;
  checkOut: string;
  guestName: string;
  isCancelled: boolean;
}

/**
 * Specchia una prenotazione (creazione o cancellazione) dalla struttura attiva
 * alla struttura gemella in standby, evitando loop e doppi avvisi tramite MIRROR_TAG.
 */
export async function mirrorReservationToStandby(params: MirrorParams): Promise<{
  mirrored: boolean;
  action?: 'created' | 'cancelled' | 'skipped';
  targetStructureId?: string;
  targetReservationId?: string;
  reason?: string;
}> {
  const {
    supabaseAdmin,
    accessToken,
    sourceStructureId,
    sourceReservationId,
    productId,
    roomName,
    checkIn,
    checkOut,
    guestName,
    isCancelled
  } = params;

  const activeSource = await getActiveJungleSource(supabaseAdmin);
  if (String(sourceStructureId) !== activeSource) {
    return { mirrored: false, action: 'skipped', reason: `Source ${sourceStructureId} is not active (${activeSource})` };
  }

  const twin = resolveTwinByProductOrName(productId, roomName);
  if (!twin) {
    return { mirrored: false, action: 'skipped', reason: 'Not a Jungle/Peace&Love twin room' };
  }

  const targetStructureId: JungleSourceStructureId = activeSource === '807324' ? '366879' : '807324';
  const targetMotherId = targetStructureId === '366879' ? twin.fpvMotherId : twin.jungleMotherId;
  const mapKey = `mirror_res_${sourceStructureId}_${sourceReservationId}`;

  // Verifica se esiste già uno specchio salvato
  let existingMirrorId: string | null = null;
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('telegram_config')
      .select('chat_id')
      .eq('id', mapKey)
      .maybeSingle();
    if (data?.chat_id) existingMirrorId = String(data.chat_id);
  }

  if (isCancelled) {
    if (!existingMirrorId) {
      return { mirrored: false, action: 'skipped', reason: 'No existing mirror reservation to cancel' };
    }
    const delRes = await fetch(
      `https://api.octorate.com/connect/rest/v1/reservation/${targetStructureId}/${existingMirrorId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
      }
    );
    if (!delRes.ok) {
      await fetch(
        `https://api.octorate.com/connect/rest/v1/reservation/${targetStructureId}/${existingMirrorId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({ status: 'CANCELLED', privateNotes: `${MIRROR_TAG} Cancelled from ${sourceStructureId} #${sourceReservationId}` })
        }
      );
    }
    return {
      mirrored: true,
      action: 'cancelled',
      targetStructureId,
      targetReservationId: existingMirrorId
    };
  }

  if (existingMirrorId) {
    return {
      mirrored: false,
      action: 'skipped',
      targetStructureId,
      targetReservationId: existingMirrorId,
      reason: 'Already mirrored'
    };
  }

  const nameParts = String(guestName || 'Guest').trim().split(/\s+/);
  const firstName = nameParts[0] || 'Guest';
  const lastName = nameParts.slice(1).join(' ') || 'Mirror';

  const checkInDate = String(checkIn).slice(0, 10);
  const checkOutDate = String(checkOut).slice(0, 10);
  const nowIso = new Date().toISOString();

  const createPayload = {
    status: 'CONFIRMED',
    refer: `MIRROR-${sourceReservationId}`.slice(0, 25),
    channelId: 233,
    product: targetMotherId,
    checkin: `${checkInDate}T14:00:00Z`,
    checkout: `${checkOutDate}T12:00:00Z`,
    createTime: nowIso,
    updateTime: nowIso,
    privateNotes: `${MIRROR_TAG} Mirrored from ${sourceStructureId} #${sourceReservationId} (${twin.name})`,
    guests: [
      {
        type: 'BOOKER',
        givenName: firstName,
        familyName: lastName,
        checkin: checkInDate,
        checkout: checkOutDate
      }
    ],
    totalGuest: 2,
    totalChildren: 0,
    totalInfants: 0
  };

  const res = await fetch(
    `https://api.octorate.com/connect/rest/v1/reservation/${targetStructureId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(createPayload)
    }
  );

  const json = await res.json().catch(() => ({}));
  const newId = json?.id || json?.data?.id || json?.reservationId;
  if (!res.ok || !newId) {
    throw new Error(`Mirror POST failed (${res.status}): ${JSON.stringify(json).slice(0, 300)}`);
  }

  if (supabaseAdmin) {
    await supabaseAdmin.from('telegram_config').upsert({
      id: mapKey,
      bot_token: String(targetStructureId),
      chat_id: String(newId),
      updated_at: new Date().toISOString()
    });
  }

  return {
    mirrored: true,
    action: 'created',
    targetStructureId,
    targetReservationId: String(newId)
  };
}

/**
 * Chiude o apre in blocco le 4 unità Jungle/Peace&Love su una struttura Octorate per i prossimi N giorni.
 */
export async function setJungleStructureAvailabilityLock(
  accessToken: string,
  structureId: JungleSourceStructureId,
  lockClosed: boolean,
  daysAhead = 365
): Promise<{ ok: boolean; status: number; response: any }> {
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + daysAhead);
  const dateFrom = today.toISOString().slice(0, 10);
  const dateTo = end.toISOString().slice(0, 10);

  const roomIds = JUNGLE_TWIN_ROOMS.map(r =>
    structureId === '366879' ? r.fpvMotherId : r.jungleMotherId
  );

  const payload = roomIds.map(room => ({
    room,
    dateFrom,
    dateTo,
    values: lockClosed
      ? { stopSells: true, closed: true, closedArrival: true, closedDeparture: true, availability: 0 }
      : { stopSells: false, closed: false, closedArrival: false, closedDeparture: false, availability: 1 }
  }));

  const res = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const json = await res.json().catch(() => ({}));
  return { ok: res.ok && json?.success !== false, status: res.status, response: json };
}

/**
 * Sincronizza prezzi, disponibilità (libero/occupato) e regole tra una struttura sorgente
 * e la struttura gemella destinataria sulle 4 unità Jungle/Peace&Love.
 */
export async function syncCalendarBetweenStructures(
  accessToken: string,
  fromStructureId: JungleSourceStructureId,
  toStructureId: JungleSourceStructureId,
  options?: { keepTargetClosed?: boolean; daysAhead?: number; dateFrom?: string; dateTo?: string }
): Promise<{ ok: boolean; syncedEntries: number; dateFrom: string; dateTo: string }> {
  const keepTargetClosed = options?.keepTargetClosed ?? true;
  const daysAhead = options?.daysAhead ?? 365;
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + daysAhead);
  const dateFrom = options?.dateFrom || today.toISOString().slice(0, 10);
  const dateTo = options?.dateTo || end.toISOString().slice(0, 10);

  const sourceIdToTargetId = new Map<number, number>();
  for (const r of JUNGLE_TWIN_ROOMS) {
    const srcId = fromStructureId === '366879' ? r.fpvMotherId : r.jungleMotherId;
    const dstId = toStructureId === '366879' ? r.fpvMotherId : r.jungleMotherId;
    sourceIdToTargetId.set(srcId, dstId);
  }

  const bulkItems: any[] = [];
  let page = 0;
  while (page < 20) {
    const url = `https://api.octorate.com/connect/rest/v1/calendar/${fromStructureId}?dateFrom=${dateFrom}&dateTo=${dateTo}&size=20&page=${page}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
    });
    if (!res.ok) {
      throw new Error(`Calendar GET failed (${fromStructureId} page ${page}): ${res.status}`);
    }
    const json = await res.json().catch(() => ({}));
    const roomRows: any[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
    if (roomRows.length === 0) break;

    for (const roomObj of roomRows) {
      const srcRoomId = Number(roomObj.id ?? roomObj.roomId);
      const targetRoomId = sourceIdToTargetId.get(srcRoomId);
      if (!targetRoomId) continue;

      const days: any[] = Array.isArray(roomObj.days) ? roomObj.days : [roomObj];
      for (const day of days) {
        if (!day?.date) continue;
        const values: Record<string, any> = {
          availability: Number(day.availability ?? 0)
        };
        if (typeof day.price === 'number' && day.price > 0) {
          values.price = day.price;
        }
        if (keepTargetClosed) {
          values.stopSells = true;
          values.closed = true;
          values.closedArrival = true;
          values.closedDeparture = true;
        } else {
          values.stopSells = Boolean(day.stopSells);
          values.closed = Boolean(day.closed);
          values.closedArrival = Boolean(day.closeToArrival ?? day.closedArrival);
          values.closedDeparture = Boolean(day.closeToDeparture ?? day.closedDeparture);
        }

        bulkItems.push({
          room: targetRoomId,
          dateFrom: String(day.date).slice(0, 10),
          dateTo: String(day.date).slice(0, 10),
          values
        });
      }
    }

    const totalPages = Number(json?.totalPages ?? 0);
    if (roomRows.length < 20 || (totalPages > 0 && page + 1 >= totalPages)) break;
    page++;
  }

  // Invio a chunk per evitare payload troppo grandi verso Octorate
  const CHUNK_SIZE = 200;
  for (let i = 0; i < bulkItems.length; i += CHUNK_SIZE) {
    const chunk = bulkItems.slice(i, i + CHUNK_SIZE);
    const bulkRes = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(chunk)
    });
    if (!bulkRes.ok) {
      const errTxt = await bulkRes.text().catch(() => '');
      throw new Error(`Calendar bulk sync failed (${bulkRes.status}): ${errTxt.slice(0, 250)}`);
    }
  }

  return { ok: true, syncedEntries: bulkItems.length, dateFrom, dateTo };
}

/**
 * Sincronizza automaticamente il calendario (prezzi + disponibilità) dalla struttura
 * attualmente attiva (807324 o 366879) verso la gemella in standby.
 */
export async function syncActiveToStandbyCalendar(
  supabaseAdmin: any,
  accessToken: string,
  options?: { daysAhead?: number; dateFrom?: string; dateTo?: string }
): Promise<{ ok: boolean; active: JungleSourceStructureId; standby: JungleSourceStructureId; syncedEntries: number }> {
  const active = await getActiveJungleSource(supabaseAdmin);
  const standby: JungleSourceStructureId = active === '807324' ? '366879' : '807324';
  const result = await syncCalendarBetweenStructures(accessToken, active, standby, {
    keepTargetClosed: true,
    ...options
  });
  return {
    ok: result.ok,
    active,
    standby,
    syncedEntries: result.syncedEntries
  };
}

/**
 * Esegue lo Switch sicuro da una struttura all'altra:
 * 1) Copia prezzi e disponibilità reali dalla struttura uscente a quella entrante (aprendo solo i giorni liberi)
 * 2) Chiude la struttura uscente (zero overbooking)
 * 3) Aggiorna active_jungle_source_v1 su Supabase
 */
export async function switchActiveJungleStructure(
  supabaseAdmin: any,
  accessToken: string,
  targetStructureId: JungleSourceStructureId
): Promise<{ ok: boolean; active: JungleSourceStructureId; closedOld: boolean; openedNew: boolean; syncedEntries: number }> {
  const outgoing: JungleSourceStructureId = targetStructureId === '366879' ? '807324' : '366879';

  const syncRes = await syncCalendarBetweenStructures(accessToken, outgoing, targetStructureId, {
    keepTargetClosed: false,
    daysAhead: 365
  });

  const lockOld = await setJungleStructureAvailabilityLock(accessToken, outgoing, true, 365);
  if (!lockOld.ok) {
    throw new Error(`Impossibile chiudere struttura uscente ${outgoing}: ${JSON.stringify(lockOld.response)}`);
  }

  await setActiveJungleSource(supabaseAdmin, targetStructureId);

  return {
    ok: true,
    active: targetStructureId,
    closedOld: true,
    openedNew: true,
    syncedEntries: syncRes.syncedEntries
  };
}

