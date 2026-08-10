import fs from 'fs';

const rates = JSON.parse(fs.readFileSync('scratch/octorate-all-rates.json', 'utf8'));

const targets = ['airbnb', 'bnb', 'ac bnb', 'ac7d', 'ac14d', 'agd'];
const foundByTarget = {};

for (const t of targets) {
  foundByTarget[t] = new Set();
}

for (const r of rates) {
  const name = r.name.toLowerCase();
  for (const t of targets) {
    if (name.includes(t)) {
      foundByTarget[t].add(r.name);
    }
  }
}

console.log('📌 ESITO ISPEZIONE PUNTUALE SU OCTORATE:\n');
for (const [key, set] of Object.entries(foundByTarget)) {
  console.log(`=== Match per "${key}" (${set.size} occorrenze) ===`);
  console.log(Array.from(set));
  console.log('');
}
