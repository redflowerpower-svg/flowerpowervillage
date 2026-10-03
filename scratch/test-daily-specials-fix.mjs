import fs from 'fs';

const content = fs.readFileSync('src/pizza/data/menuData.ts', 'utf8');

const jsonStart = content.indexOf('export const menuCategories');
const dataStr = content.slice(content.indexOf('=', jsonStart) + 1, content.lastIndexOf(';'));
const categories = eval(`(${dataStr})`);

const dailyCategory = categories.find(c => c.id === 'daily-specials');

const DAILY_SPECIALS_SECTIONS = [
  { id: 'pasta', name: 'Primi Piatti, Frutti di Mare & Paste Ripiene' },
  { id: 'traditional-italian-pizza', name: 'Pizze Gourmet Speciali' },
  { id: 'daily-specials', name: 'Secondi Piatti Tradizionali' },
  { id: 'pizza-sandwich', name: 'Focacce Artigianali' },
  { id: 'french-fries', name: 'Snack & Torte Salate' }
];

let totalAssigned = 0;
DAILY_SPECIALS_SECTIONS.forEach(sec => {
  const items = dailyCategory.items.filter((item) => {
    const id = item.id || '';
    if (sec.id === 'pasta') {
      return id === 'spaghetti-allo-scoglio' || 
             id === 'penne-al-salmone' || 
             id === 'ravioli-alla-crema-di-gamberi' || 
             id === 'ravioli-al-sugo-di-noci' || 
             id === 'tagliatelle-al-nero-di-seppia-e-calamari' || 
             id === 'spaghetti-alla-polpa-di-granchio';
    }
    if (sec.id === 'traditional-italian-pizza') {
      return id === 'pizza-con-polpa-di-granchio' || 
             id === 'pizza-rustica-con-salsiccia-e-stilacci' ||
             (id.startsWith('pizza-') && !id.includes('sandwich') && !id.includes('focaccia'));
    }
    if (sec.id === 'daily-specials') {
      return id === 'cotoletta-alla-milanese-con-patatine-fritte' || 
             id === 'cotechino-artigianale-con-pure-di-patate' ||
             id.includes('milanese') || 
             id.includes('cotechino');
    }
    if (sec.id === 'pizza-sandwich') {
      return id.startsWith('focaccia-') || id.includes('sandwich');
    }
    if (sec.id === 'french-fries') {
      return id === 'torta-pasqualina-agli-spinaci-e-uova' || id.includes('torta');
    }
    return false;
  });
  totalAssigned += items.length;
  console.log(`\nSection [${sec.name}] (${items.length} items):`);
  items.forEach(it => console.log(`  - ${it.id} -> ${it.nameIt || it.name}`));
});

console.log(`\nTotal items in category: ${dailyCategory.items.length}, Total assigned: ${totalAssigned}`);
