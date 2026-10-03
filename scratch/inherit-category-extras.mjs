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

// Map category standard extras and allowed_extras_group from reference dishes in each category
const categoryDefaults = {};

for (const cat of categories) {
  // Find a reference dish with extras
  const refDish = cat.items.find(i => i.extras && i.extras.length > 0);
  if (refDish) {
    categoryDefaults[cat.id] = {
      allowed_extras_group: refDish.allowed_extras_group,
      extras: JSON.parse(JSON.stringify(refDish.extras))
    };
    console.log(`Categoria ${cat.id}: trovati ${refDish.extras.length} extra standard da '${refDish.name}' (${refDish.allowed_extras_group})`);
  }
}

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

// Apply inheritance
for (const cat of categories) {
  const catDefault = categoryDefaults[cat.id];
  for (const item of cat.items) {
    if (NEW_DISH_IDS.includes(item.id)) {
      if (catDefault && (!item.extras || item.extras.length === 0)) {
        item.allowed_extras_group = catDefault.allowed_extras_group;
        item.extras = JSON.parse(JSON.stringify(catDefault.extras));
        console.log(`Assegnati ${item.extras.length} extra a ${item.id} in ${cat.id}`);
      }
    }
  }
}

const updatedJson = JSON.stringify(categories, null, 2);
const updatedFileContent = fileContent.replace(
  /export const menuData: MenuCategory\[\] = \[[\s\S]*\];/,
  `export const menuData: MenuCategory[] = ${updatedJson};`
);

fs.writeFileSync(menuDataPath, updatedFileContent, 'utf8');
console.log('✅ menuData.ts aggiornato: tutte le nuove schede hanno ereditato le personalizzazioni della categoria!');
