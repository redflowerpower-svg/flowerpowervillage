import fs from 'fs';

const rawBookings = JSON.parse(fs.readFileSync('scratch/all_recent_bookings.json', 'utf8'));

console.log(`Analisi di ${rawBookings.length} prenotazioni...`);

// Ordiniamo per data di creazione o aggiornamento decrescente
function parseIsoOrTimestamp(val) {
  if (!val) return null;
  // Gestisce formato es. '2026-10-17T04:03:02Z[UTC]'
  const clean = String(val).replace(/\[.*?\]/, '');
  const d = new Date(clean);
  return isNaN(d.getTime()) ? null : d;
}

const parsed = rawBookings.map(b => {
  const cTime = parseIsoOrTimestamp(b.createTime);
  const uTime = parseIsoOrTimestamp(b.updateTime);
  const inDate = parseIsoOrTimestamp(b.checkin);
  const outDate = parseIsoOrTimestamp(b.checkout);

  let nights = 0;
  if (inDate && outDate) {
    nights = Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Nome ospite
  let guestName = `${b.firstName || ''} ${b.lastName || ''}`.trim();
  if (!guestName && Array.isArray(b.guests) && b.guests.length > 0) {
    const booker = b.guests.find(g => g.type === 'BOOKER') || b.guests[0];
    guestName = `${booker.givenName || ''} ${booker.familyName || ''}`.trim();
  }
  if (!guestName) guestName = 'Ospite N/D';

  const channel = b.channelName || (b.channelId === 233 ? 'Sito Web Diretto' : `Canale #${b.channelId}`);
  const status = String(b.status || '').toUpperCase();
  const room = b.roomName || b.accommodation || 'Alloggio N/D';
  const total = b.totalGross ?? b.roomGross ?? 0;
  const currency = b.currency || 'THB';

  return {
    id: b.id,
    guestName,
    channel,
    room,
    checkIn: inDate ? inDate.toISOString().slice(0, 10) : 'N/D',
    checkOut: outDate ? outDate.toISOString().slice(0, 10) : 'N/D',
    nights,
    total,
    currency,
    status,
    createTime: cTime,
    updateTime: uTime,
    createTimeStr: cTime ? cTime.toISOString().slice(0, 19).replace('T', ' ') : 'N/D',
    updateTimeStr: uTime ? uTime.toISOString().slice(0, 19).replace('T', ' ') : 'N/D',
    raw: b
  };
});

// Ordina per updateTime decrescente, poi createTime
parsed.sort((a, b) => {
  const timeA = (a.updateTime || a.createTime || new Date(0)).getTime();
  const timeB = (b.updateTime || b.createTime || new Date(0)).getTime();
  return timeB - timeA;
});

// Filtriamo quelle dal 1° Settembre 2026 in avanti
const sinceSept = parsed.filter(b => {
  const t = b.updateTime || b.createTime;
  return t && t >= new Date('2026-09-01T00:00:00Z');
});

// E quelle dal 25 Settembre (giorno separazione bot / attivazione notifiche)
const sinceSept25 = parsed.filter(b => {
  const t = b.updateTime || b.createTime;
  return t && t >= new Date('2026-09-25T00:00:00Z');
});

console.log(`\n=== RIEPILOGO TEMPORALE ===`);
console.log(`Prenotazioni totali scaricate: ${parsed.length}`);
console.log(`Prenotazioni con eventi dal 1° Settembre 2026: ${sinceSept.length}`);
console.log(`Prenotazioni con eventi dal 25 Settembre 2026 (attivazione feature): ${sinceSept25.length}`);

console.log(`\n=== DETTAGLIO PRENOTAZIONI DAL 25 SETTEMBRE 2026 AD OGGI ===`);
sinceSept25.forEach((b, idx) => {
  console.log(`\n[${idx + 1}] #${b.id} | Stato: ${b.status} | Canale: ${b.channel}`);
  console.log(`    Ospite: ${b.guestName}`);
  console.log(`    Alloggio: ${b.room}`);
  console.log(`    Soggiorno: ${b.checkIn} -> ${b.checkOut} (${b.nights} notti)`);
  console.log(`    Importo: ${b.total} ${b.currency}`);
  console.log(`    Creata: ${b.createTimeStr} | Aggiornata: ${b.updateTimeStr}`);
});

fs.writeFileSync('scratch/analyzed_bookings_since_sept.json', JSON.stringify(sinceSept, null, 2));
