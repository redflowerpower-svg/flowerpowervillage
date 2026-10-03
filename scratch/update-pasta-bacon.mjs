import fs from 'fs';

const menuDataPath = 'src/pizza/data/menuData.ts';
const content = fs.readFileSync(menuDataPath, 'utf8');

const jsonStart = content.indexOf('export const menuCategories');
const dataStr = content.slice(content.indexOf('=', jsonStart) + 1, content.lastIndexOf(';'));
const categories = eval('(' + dataStr + ')');

const isAglioOlio = (id) => id.includes('aglio-e-olio') || id.includes('aglio_e_olio');

// 1. Update pasta category
const pastaCategory = categories.find(c => c.id === 'pasta');
if (pastaCategory) {
  pastaCategory.items.forEach(item => {
    if (!isAglioOlio(item.id)) {
      if (item.extras) {
        item.extras = item.extras.filter(e => e.id !== 'ext-bacon' && !e.name.toLowerCase().includes('bacon') && !(e.nameIt && e.nameIt.toLowerCase().includes('pancetta')));
      }
    }
  });
}

// 2. Update daily-specials category (pasta items in daily specials)
const dailyCategory = categories.find(c => c.id === 'daily-specials');
if (dailyCategory) {
  const pastaItemIds = [
    'spaghetti-allo-scoglio',
    'penne-al-salmone',
    'ravioli-alla-crema-di-gamberi',
    'ravioli-al-sugo-di-noci',
    'tagliatelle-al-nero-di-seppia-e-calamari',
    'spaghetti-alla-polpa-di-granchio'
  ];

  dailyCategory.items.forEach(item => {
    if (pastaItemIds.includes(item.id) || (item.category === 'pasta' && !isAglioOlio(item.id))) {
      if (item.extras) {
        item.extras = item.extras.filter(e => e.id !== 'ext-bacon' && !e.name.toLowerCase().includes('bacon') && !(e.nameIt && e.nameIt.toLowerCase().includes('pancetta')));
      }
    }
  });
}

const newCategoriesJson = JSON.stringify(categories, null, 2);
const newContent = content.slice(0, content.indexOf('=', jsonStart) + 1) + ' ' + newCategoriesJson + ';' + content.slice(content.lastIndexOf(';') + 1);
fs.writeFileSync(menuDataPath, newContent, 'utf8');

console.log('✅ Updated pasta extras: Pancetta Extra (ext-bacon) is now ONLY present in Aglio, Olio e Peperoncino!');
