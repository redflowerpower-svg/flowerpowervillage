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
const swCat = categories.find(c => c.id === 'pizza-sandwich');

if (swCat) {
  const updates = {
    'pizza-sandwich-parma-ham': {
      name: 'PIZZA SANDWICH\nPARMA HAM',
      nameIt: 'PIZZA SANDWICH\nPROSCIUTTO DI PARMA',
      name_it: 'PIZZA SANDWICH\nPROSCIUTTO DI PARMA',
      nameDe: 'PIZZA SANDWICH\nMIT PARMASCHINKEN',
      name_de: 'PIZZA SANDWICH\nMIT PARMASCHINKEN',
      nameTh: 'พิตซ่าแซนด์วิช\nพาร์ม่าแฮม'
    },
    'pizza-sandwich-salame': {
      name: 'PIZZA SANDWICH\nSALAME',
      nameIt: 'PIZZA SANDWICH\nCON SALAME',
      name_it: 'PIZZA SANDWICH\nCON SALAME',
      nameDe: 'PIZZA SANDWICH\nMIT SALAMI',
      name_de: 'PIZZA SANDWICH\nMIT SALAMI',
      nameTh: 'พิตซ่าแซนด์วิช\nซาลามี'
    },
    'pizza-sandwich-spicy-salame': {
      name: 'PIZZA SANDWICH\nSPICY SALAME',
      nameIt: 'PIZZA SANDWICH\nCON SALAME PICCANTE',
      name_it: 'PIZZA SANDWICH\nCON SALAME PICCANTE',
      nameDe: 'PIZZA SANDWICH\nMIT SCHARFER SALAMI',
      name_de: 'PIZZA SANDWICH\nMIT SCHARFER SALAMI',
      nameTh: 'พิตซ่าแซนด์วิช\nซาลามีรสเผ็ด'
    }
  };

  for (const item of swCat.items) {
    if (updates[item.id]) {
      Object.assign(item, updates[item.id]);
    }
  }

  // Also check if any in daily-specials need updating
  const dailyCat = categories.find(c => c.id === 'daily-specials');
  if (dailyCat) {
    for (const item of dailyCat.items) {
      if (updates[item.id]) {
        Object.assign(item, updates[item.id]);
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
console.log('✅ menuData.ts aggiornato con pizza sandwich puliti!');
