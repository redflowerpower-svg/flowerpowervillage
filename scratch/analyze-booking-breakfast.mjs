import fs from 'fs';

const rawData = JSON.parse(fs.readFileSync('scratch/confirmed-future-reservations.json', 'utf8'));

console.log(`Caricate ${rawData.length} prenotazioni confermate.`);

// Date range: checkin/checkout overlapping 2026-12-16 to 2027-03-31
const targetStart = '2026-12-16';
const targetEnd = '2027-03-31';

// Overlap logic: booking.checkin < targetEnd AND booking.checkout > targetStart
const targetBookings = rawData.filter(r => {
  const checkin = (r.checkin || r.check_in || '').slice(0, 10);
  const checkout = (r.checkout || r.check_out || '').slice(0, 10);
  if (!checkin || !checkout) return false;
  return checkin <= targetEnd && checkout >= targetStart;
});

console.log(`Prenotazioni totali nel periodo 16 Dicembre 2026 - 31 Marzo 2027: ${targetBookings.length}`);

// Filter by Booking.com
const bookingComBookings = targetBookings.filter(r => {
  const channel = (r.channelName || r.source_channel || r.ota || '').toLowerCase();
  return channel.includes('booking');
});

console.log(`Prenotazioni da Booking.com nel periodo: ${bookingComBookings.length}`);

console.log('\n--- DETTAGLIO PRENOTAZIONI BOOKING.COM NEL PERIODO ---');
let withoutBreakfastCount = 0;
let withBreakfastCount = 0;
const listWithoutBreakfast = [];
const listWithBreakfast = [];

bookingComBookings.forEach((r, idx) => {
  const checkin = (r.checkin || r.check_in || '').slice(0, 10);
  const checkout = (r.checkout || r.check_out || '').slice(0, 10);
  const roomName = r.roomName || r.accommodation_name || r.product || '';
  const guest = `${r.firstName || ''} ${r.lastName || ''}`.trim() || r.guest_name || 'N/D';
  const board = r.board || r.meals || r.mealPlan || r.boardType || 'N/D';
  
  // Checking product name / code
  // The rate plans with "bnb" or "BB" (Bed and Breakfast) vs standard "7d" (Room Only)
  const isBnbProduct = /bnb|b&b|breakfast/i.test(roomName);
  const isStandard7d = /7d/i.test(roomName) && !isBnbProduct;

  // Let's inspect all fields of r related to meal / rate
  const rateInfo = {
    id: r.id,
    guest,
    roomName,
    product: r.product,
    checkin,
    checkout,
    board,
    ratePlan: r.ratePlan,
    rateId: r.rateId,
    roomRateId: r.roomRateId,
    isBnbProduct,
    isStandard7d
  };

  if (isStandard7d || (!isBnbProduct && (board === 'RO' || board === 'Room Only' || board === 'None'))) {
    withoutBreakfastCount++;
    listWithoutBreakfast.push(rateInfo);
  } else {
    withBreakfastCount++;
    listWithBreakfast.push(rateInfo);
  }
});

console.log(`\nRISULTATO:`);
console.log(`Totale Booking.com: ${bookingComBookings.length}`);
console.log(`Con Colazione (bnb): ${withBreakfastCount}`);
console.log(`Senza Colazione (Room Only / 7d standard): ${withoutBreakfastCount}`);

if (listWithoutBreakfast.length > 0) {
  console.log('\n🔴 PRENOTAZIONI SENZA COLAZIONE:');
  listWithoutBreakfast.forEach(b => {
    console.log(`- ID: ${b.id} | Ospite: ${b.guest} | Prodotto: ${b.roomName} | Date: ${b.checkin} -> ${b.checkout}`);
  });
} else {
  console.log('\n🟢 NESSUNA prenotazione senza colazione trovata su Booking.com in questo intervallo!');
}

console.log('\n🔵 ELENCO COMPLETO DELLE PRENOTAZIONI BOOKING.COM NEL PERIODO:');
bookingComBookings.forEach(b => {
  const checkin = (b.checkin || b.check_in || '').slice(0, 10);
  const checkout = (b.checkout || b.check_out || '').slice(0, 10);
  const roomName = b.roomName || b.accommodation_name || b.product || '';
  const guest = `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.guest_name;
  console.log(`* ID ${b.id} | ${guest} | ${checkin} -> ${checkout} | Prodotto: ${roomName}`);
});
