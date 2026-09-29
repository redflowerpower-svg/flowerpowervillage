import fs from 'fs';

const txt = fs.readFileSync('src/pizza/data/menuData.ts', 'utf8');
// remove export const menuData: MenuCategory[] = 
const jsonStr = txt.replace(/^export const menuData: MenuCategory\[\] =\s*/, '').replace(/;\s*$/, '');
let menuData;
try {
  menuData = JSON.parse(jsonStr);
} catch (e) {
  // If JSON parse fails because of trailing commas or comments, evaluate via Function
  const clean = txt.replace(/export interface[\s\S]*?export const menuData: MenuCategory\[\] =/, 'return');
  menuData = new Function(clean)();
}

console.log('--- SCAN PIZZE & VARIANTI ---');
const pizzaCat = menuData.find(c => c.id === 'traditional-italian-pizza');
let total = 0;
let dirty = 0;

for (const item of pizzaCat.items) {
  total++;
  const variantNames = (item.variants || []).map(v => v.name);
  const isDirty = variantNames.some(v => v !== '12"' && v !== '8"');
  if (isDirty) {
    dirty++;
    console.log(`❌ [ANOMALIA] ${item.id} (${item.name}):`, variantNames);
  } else {
    console.log(`✅ [OK] ${item.id} (${item.name}):`, variantNames);
  }
}
console.log(`\nTotale pizze controllate: ${total}, Anomale: ${dirty}`);
