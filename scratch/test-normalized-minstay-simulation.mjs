import { handleOctorateBookings } from '../api/_handlers/octorate.ts';

function normalizeRoomName(rawName) {
  if (!rawName) return 'unknown';
  const name = String(rawName).trim();
  const lower = name.toLowerCase();

  if (lower.includes('jvr') || lower.includes('jungle villa right')) return 'Jungle Villa Right';
  if (lower.includes('jvl') || lower.includes('jungle villa left')) return 'Jungle Villa Left';
  if (lower.includes('jv') || lower.includes('jungle villa')) return 'Jungle Villa';
  if (lower.includes('pent') || lower.includes('penthouse')) return 'Villa Penthouse';
  if (lower.includes('p&l') || lower.includes('peace')) return 'Peace & Love Villa';
  if (lower.includes('red')) return 'Red Bungalow';
  if (lower.includes('green')) return 'Green Bungalow';
  if (lower.includes('yellow')) return 'Yellow Bungalow';
  if (lower.includes('lagoon')) return 'Lagoon Tent';
  if (lower.includes('camel')) return 'Camel Tent';
  if (lower.includes('lodge 1')) return 'Lodge 1';
  if (lower.includes('lodge 2')) return 'Lodge 2';
  if (lower.includes('r1') || lower.includes('room 1')) return 'Room 1';
  if (lower.includes('r2') || lower.includes('room 2')) return 'Room 2';
  if (lower.includes('r3') || lower.includes('room 3')) return 'Room 3';
  if (lower.includes('r4') || lower.includes('room 4')) return 'Room 4';
  if (lower.includes('r5') || lower.includes('room 5')) return 'Room 5';
  if (lower.includes('inter') || lower.includes('internal')) return 'Internal Room';

  return name;
}

async function inspectBookingsDistribution() {
  const req = { method: 'GET', query: { dateFrom: '2026-08-01', dateTo: '2026-10-31' } };
  let statusCode = 200; let jsonResult = null;
  const res = { status(c) { statusCode = c; return this; }, json(d) { jsonResult = d; return this; } };

  await handleOctorateBookings(req, res);
  const bookings = jsonResult?.data || [];

  const map = {};
  bookings.forEach(b => {
    const raw = b.accommodation_name || b.roomName || b.product || 'unknown';
    const roomKey = normalizeRoomName(raw);
    if (!map[roomKey]) map[roomKey] = [];
    map[roomKey].push({
      guest: b.guest_name,
      channel: b.source_channel || b.channelName,
      in: b.check_in || b.checkin,
      out: b.check_out || b.checkout
    });
  });

  console.log("--- DISTRIBUZIONE PRENOTAZIONI PER ALLOGGIO CANONICO ---");
  for (const [room, list] of Object.entries(map)) {
    console.log(`\n🏠 ${room} (${list.length} prenotazioni):`);
    list.sort((a, b) => a.in.localeCompare(b.in)).forEach(item => {
      console.log(`   - Ospite: ${item.guest} [${item.channel}] | Check-in: ${item.in} ➔ Check-out: ${item.out}`);
    });
  }
}

inspectBookingsDistribution().catch(console.error);
