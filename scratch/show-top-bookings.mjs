import fs from 'fs';

const sinceSept = JSON.parse(fs.readFileSync('scratch/analyzed_bookings_since_sept.json', 'utf8'));
const sinceSept25 = sinceSept.filter(b => {
  const t = new Date(b.updateTime || b.createTime);
  return t >= new Date('2026-09-25T00:00:00Z');
});

console.log(`Totale dal 25 Settembre: ${sinceSept25.length}`);

// Visualizziamo le prime 40 (dall'indice 0 al 39)
sinceSept25.slice(0, 40).forEach((b, idx) => {
  console.log(`[${idx + 1}] #${b.id} | ${b.status} | ${b.channel} | ${b.guestName} | ${b.room} | ${b.checkIn} -> ${b.checkOut} (${b.nights}n) | ${b.total} ${b.currency} | Creata: ${b.createTimeStr} | Aggiornata: ${b.updateTimeStr}`);
});
