import fs from 'fs';

const txt = fs.readFileSync('src/pizza/data/menuData.ts', 'utf8');
const clean = txt.replace(/export interface[\s\S]*?export const menuData: MenuCategory\[\] =/, 'return');
const menuData = new Function(clean)();

console.log('--- TUTTE LE CATEGORIE NEL MENUDATA ---');
menuData.forEach((c, idx) => {
  console.log(`${idx + 1}. [${c.id}] ${c.name} (piatti: ${c.items.length})`);
});

const complianceCats = menuData.filter((c) => c.id !== 'soft-drinks' && c.id !== 'beers-and-wines' && c.id !== 'wines');
console.log('\n--- CATEGORIE VISIBILI SUL DOMINIO UFFICIALE (ALCOHOL-FREE / COMPLIANCE) ---');
complianceCats.forEach((c, idx) => {
  console.log(`${idx + 1}. [${c.id}] ${c.name}`);
});
