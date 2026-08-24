import fs from 'fs';

const rates = JSON.parse(fs.readFileSync('scratch/october1-full-rates.json', 'utf8'));

console.log(`Total rate objects: ${rates.length}`);

// Sample of rates
console.log('Sample of 15 rates on 2026-10-01:');
rates.slice(0, 15).forEach(r => {
  console.log(`ID: ${r.id} | Name: ${r.name.padEnd(35)} | Price: ${String(r.price).padStart(5)} | MinStay: ${r.minStay} | StopSells: ${r.stopSells} | CA: ${r.closeToArrival} | CD: ${r.closeToDeparture} | Avail: ${r.availability}`);
});

// Count how many are StopSells vs Open
const stopSellsCount = rates.filter(r => r.stopSells).length;
const openCount = rates.filter(r => !r.stopSells).length;
console.log(`\nSummary: ${stopSellsCount} StopSells (closed), ${openCount} Open`);
