import fs from 'fs';

const sinceSept = JSON.parse(fs.readFileSync('scratch/analyzed_bookings_since_sept.json', 'utf8'));
const sinceSept25 = sinceSept.filter(b => {
  const t = new Date(b.updateTime || b.createTime);
  return t >= new Date('2026-09-25T00:00:00Z');
});

// Suddividiamo per tipologia
const newBookings = sinceSept25.filter(b => b.status === 'CONFIRMED');
const cancelledBookings = sinceSept25.filter(b => b.status === 'CANCELLED');
const otherBookings = sinceSept25.filter(b => b.status !== 'CONFIRMED' && b.status !== 'CANCELLED');

console.log(`Totale dal 25/09/2026: ${sinceSept25.length}`);
console.log(`- Confermate/Nuove: ${newBookings.length}`);
console.log(`- Cancellate: ${cancelledBookings.length}`);
console.log(`- Altre: ${otherBookings.length}`);

// Creiamo un file di riepilogo markdown
let md = `# Audit Prenotazioni, Modifiche e Cancellazioni Octorate\n\n`;
md += `Periodo: **Dal 25 Settembre 2026 ad Oggi (18 Ottobre 2026)**\n`;
md += `Totale movimenti registrati su PMS Octorate: **${sinceSept25.length}**\n\n`;

md += `## 1. Prenotazioni Cancellate (${cancelledBookings.length})\n\n`;
md += `| ID | Ospite | Canale | Alloggio | Check-in / Out | Notti | Importo (THB) | Data Cancellazione |\n`;
md += `|---|---|---|---|---|---|---|---|\n`;
for (const b of cancelledBookings) {
  md += `| #${b.id} | **${b.guestName}** | ${b.channel} | ${b.room} | \`${b.checkIn} ➔ ${b.checkOut}\` | ${b.nights}n | **${b.total.toLocaleString()} ${b.currency}** | ${b.updateTimeStr} |\n`;
}

md += `\n## 2. Nuove Prenotazioni & Conferme (${newBookings.length})\n\n`;
md += `| ID | Ospite | Canale | Alloggio | Check-in / Out | Notti | Importo (THB) | Data Ricezione / Update |\n`;
md += `|---|---|---|---|---|---|---|---|\n`;
for (const b of newBookings) {
  md += `| #${b.id} | **${b.guestName}** | ${b.channel} | ${b.room} | \`${b.checkIn} ➔ ${b.checkOut}\` | ${b.nights}n | **${b.total.toLocaleString()} ${b.currency}** | ${b.updateTimeStr || b.createTimeStr} |\n`;
}

fs.writeFileSync('scratch/audit_report_bookings.md', md);
console.log('Report markdown salvato in scratch/audit_report_bookings.md');
