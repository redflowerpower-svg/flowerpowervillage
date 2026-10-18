import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('scratch/octorate_raw_bookings.json', 'utf8'));

console.log("Page info:", raw.page);
const bookings = raw.data || [];
console.log(`Numero di prenotazioni nella prima pagina: ${bookings.length}`);

if (bookings.length > 0) {
  const sample = bookings[0];
  console.log("Sample booking keys:", Object.keys(sample));
  console.log("Sample booking summary:", {
    id: sample.id,
    createdDate: sample.createdDate || sample.created_at || sample.createDate,
    modifyDate: sample.modifyDate || sample.updated_at,
    status: sample.status,
    guestName: sample.guestName || (sample.guests ? sample.guests.map(g => `${g.givenName} ${g.familyName}`).join(', ') : 'N/D'),
    checkin: sample.checkin,
    checkout: sample.checkout,
    total: sample.total,
    currency: sample.currency,
    channelName: sample.channelName || sample.channel?.name || sample.channel
  });
}
