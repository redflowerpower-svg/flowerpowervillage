import fs from 'fs';

const report = JSON.parse(fs.readFileSync('scratch/audit_comparison_report.json', 'utf8'));

let totalRates = 0;
let totalMatchedInDerived = 0;
let totalMatchedInCalendar = 0;

const summaryPerRoom = [];

for (const room of report) {
  const missingInDerived = [];
  const missingInCalendar = [];
  const matched = [];

  for (const r of room.ratesCheck) {
    totalRates++;
    if (r.inDerived) totalMatchedInDerived++;
    else missingInDerived.push(`${r.rateName} (${r.id})`);

    if (r.inCalendar) totalMatchedInCalendar++;
    else missingInCalendar.push(`${r.rateName} (${r.id})`);

    if (r.inDerived && r.inCalendar) {
      matched.push(`${r.rateName} (${r.id})`);
    }
  }

  summaryPerRoom.push({
    room: room.room,
    motherId: room.motherId,
    motherInDerived: room.motherMatchDerived,
    motherInCalendar: room.motherMatchCalendar,
    totalRates: room.ratesCheck.length,
    matchedCount: matched.length,
    missingInDerived,
    missingInCalendar
  });
}

console.log('===== AUDIT SUMMARY =====');
console.log(`Total User-Provided Accommodations: ${report.length}`);
console.log(`Total User-Provided Rate Product IDs: ${totalRates}`);
console.log(`Matched in DerivedRatesTreeSection: ${totalMatchedInDerived} / ${totalRates}`);
console.log(`Matched in ResortVisualCalendar: ${totalMatchedInCalendar} / ${totalRates}\n`);

console.log('===== DETAILED PER-ROOM BREAKDOWN =====');
for (const s of summaryPerRoom) {
  console.log(`\n🏠 ${s.room} (Madre ID: ${s.motherId}) [Madre in Derived: ${s.motherInDerived ? 'YES' : 'NO'}, Calendar: ${s.motherInCalendar ? 'YES' : 'NO'}]`);
  console.log(`   Presenti in Entrambi: ${s.matchedCount} / ${s.totalRates}`);
  if (s.missingInDerived.length > 0) {
    console.log(`   ⚠️ Mettibili in DerivedRatesTree: ${s.missingInDerived.join(', ')}`);
  }
  if (s.missingInCalendar.length > 0) {
    console.log(`   ⚠️ Mettibili in VisualCalendar MAP: ${s.missingInCalendar.join(', ')}`);
  }
}
