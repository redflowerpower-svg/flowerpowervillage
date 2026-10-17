import fs from 'fs';

const rawData = JSON.parse(fs.readFileSync('scratch/confirmed-future-reservations.json', 'utf8'));

const targetBookings = rawData.filter(r => {
  const checkin = (r.checkin || r.check_in || '').slice(0, 10);
  const checkout = (r.checkout || r.check_out || '').slice(0, 10);
  if (!checkin || !checkout) return false;
  return checkin <= '2027-03-31' && checkout >= '2026-12-16';
});

const bookingComBookings = targetBookings.filter(r => {
  const channel = (r.channelName || r.source_channel || r.ota || '').toLowerCase();
  return channel.includes('booking');
});

console.log('--- DETTAGLIO COMPLETO DEI PRODOTTI / TARIFFE SU BOOKING.COM ---');
const breakdown = {};

bookingComBookings.forEach(r => {
  const name = r.roomName || r.product || '';
  breakdown[name] = (breakdown[name] || 0) + 1;
});

console.log(JSON.stringify(breakdown, null, 2));

// Check specifically which ones have hasBreakfast: true vs false
// In useRestrictionsStore:
// - main_bnb_7d, main_bnb_14d, ac_bnb_7d, ac_bnb_14d: hasBreakfast = TRUE
// - 7d, ac_7d, ac_14d, be, airbnb: hasBreakfast = FALSE

const noBreakfastPlans = [];
const withBreakfastPlans = [];

bookingComBookings.forEach(r => {
  const name = r.roomName || r.product || '';
  const isBnb = /bnb/i.test(name);
  if (!isBnb) {
    noBreakfastPlans.push({
      id: r.id,
      guest: `${r.firstName || ''} ${r.lastName || ''}`.trim(),
      roomName: name,
      product: r.product,
      dates: `${(r.checkin || '').slice(0, 10)} -> ${(r.checkout || '').slice(0, 10)}`,
      createTime: r.createTime
    });
  } else {
    withBreakfastPlans.push({
      id: r.id,
      guest: `${r.firstName || ''} ${r.lastName || ''}`.trim(),
      roomName: name,
      product: r.product,
      dates: `${(r.checkin || '').slice(0, 10)} -> ${(r.checkout || '').slice(0, 10)}`,
      createTime: r.createTime
    });
  }
});

console.log(`\nTOTALE CON COLAZIONE (con 'bnb'): ${withBreakfastPlans.length}`);
console.log(`TOTALE SENZA COLAZIONE (senza 'bnb'): ${noBreakfastPlans.length}`);
console.log('\nDETTAGLIO SENZA COLAZIONE:');
console.table(noBreakfastPlans);
