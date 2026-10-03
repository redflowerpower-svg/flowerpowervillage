import fs from 'fs';
import path from 'path';

const menuDataPath = path.resolve(process.cwd(), 'src/pizza/data/menuData.ts');
const fileContent = fs.readFileSync(menuDataPath, 'utf8');
const match = fileContent.match(/export const menuData: MenuCategory\[\] = (\[[\s\S]*\]);/);
const categories = JSON.parse(match[1]);
const pastaCat = categories.find(c => c.id === 'pasta');

const PASTA_SAUCES = [
  { id: 'special-pasta', pattern: 'special' },
  { id: 'aglio-olio', pattern: 'Garlic, Oil' },
  { id: 'pomodoro', pattern: 'Tomato Sauce' },
  { id: 'pesto', pattern: 'Pesto Genovese' },
  { id: 'amatriciana', pattern: 'Amatriciana' },
  { id: 'bolognese', pattern: 'Bolognese Ragu' },
  { id: 'carbonara', pattern: 'Carbonara' },
  { id: 'quattro-formaggi', pattern: 'Four Cheeses' },
  { id: 'flower-power', pattern: 'Flower Power' },
  { id: 'lasagne', pattern: 'Lasagne' }
];

const isSpecialPasta = (item) => {
  const id = item.id || '';
  return id === 'spaghetti-allo-scoglio' || 
         id === 'penne-al-salmone' || 
         id === 'ravioli-alla-crema-di-gamberi' || 
         id === 'ravioli-al-sugo-di-noci' || 
         id === 'tagliatelle-al-nero-di-seppia-e-calamari' || 
         id === 'spaghetti-alla-polpa-di-granchio' ||
         id.startsWith('special-');
};

const groupedPasta = PASTA_SAUCES.map(sauce => {
  const items = pastaCat.items.filter(item => {
    const path = item.image_file || "";
    const name = item.id || "";
    if (sauce.id === 'special-pasta') {
      return isSpecialPasta(item);
    }
    if (isSpecialPasta(item)) return false;
    if (path.includes(sauce.pattern)) return true;
    if (sauce.id === 'lasagne' && name.includes('lasagna')) return true;
    return false;
  });
  return { id: sauce.id, count: items.length, items: items.map(i => i.nameIt || i.name) };
});

console.log('Pasta Grouping Results:');
for (const g of groupedPasta) {
  console.log(`- ${g.id}: ${g.count} piatti ->`, g.items.slice(0, 3));
}
