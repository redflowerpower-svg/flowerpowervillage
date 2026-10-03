import fs from 'fs';
import path from 'path';

const menuDataPath = path.resolve(process.cwd(), 'src/pizza/data/menuData.ts');
let fileContent = fs.readFileSync(menuDataPath, 'utf8');

const prefixMatch = fileContent.match(/export const menuData: MenuCategory\[\] = (\[[\s\S]*\]);/);
if (!prefixMatch) {
  console.error('Non riesco a trovare menuData');
  process.exit(1);
}

const categories = JSON.parse(prefixMatch[1]);

// 16 new dish IDs
const NEW_DISH_IDS = [
  "spaghetti-allo-scoglio",
  "penne-al-salmone",
  "ravioli-alla-crema-di-gamberi",
  "ravioli-al-sugo-di-noci",
  "tagliatelle-al-nero-di-seppia-e-calamari",
  "spaghetti-alla-polpa-di-granchio",
  "pizza-con-polpa-di-granchio",
  "pizza-rustica-con-salsiccia-e-stilacci",
  "cotoletta-alla-milanese-con-patatine-fritte",
  "cotechino-artigianale-con-pure-di-patate",
  "torta-pasqualina-agli-spinaci-e-uova",
  "focaccia-pizza-sandwich-con-finocchiona",
  "focaccia-pizza-sandwich-con-pancetta-arrotolata",
  "focaccia-pizza-sandwich-con-porchetta",
  "focaccia-pizza-sandwich-con-prosciutto-cotto",
  "focaccia-pizza-sandwich-con-salame"
];

// Find all 16 items across all categories
const all16Items = [];
for (const id of NEW_DISH_IDS) {
  for (const cat of categories) {
    const found = cat.items.find(i => i.id === id);
    if (found) {
      all16Items.push({
        ...found,
        category: cat.id
      });
      break;
    }
  }
}

console.log(`Trovati ${all16Items.length} su 16 piatti nel catalogo.`);

// Set daily-specials category items to all 16 items
const dailySpecialsCat = categories.find(c => c.id === 'daily-specials');
if (dailySpecialsCat) {
  dailySpecialsCat.items = all16Items;
  console.log(`Aggiornata categoria daily-specials con ${dailySpecialsCat.items.length} piatti.`);
}

const updatedJson = JSON.stringify(categories, null, 2);
const updatedFileContent = fileContent.replace(
  /export const menuData: MenuCategory\[\] = \[[\s\S]*\];/,
  `export const menuData: MenuCategory[] = ${updatedJson};`
);

fs.writeFileSync(menuDataPath, updatedFileContent, 'utf8');
console.log('✅ menuData.ts aggiornato con tutti i 16 piatti nella vetrina Specialità del Giorno!');
