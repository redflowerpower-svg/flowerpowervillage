import fs from 'fs';

const menuDataPath = 'src/pizza/data/menuData.ts';
const content = fs.readFileSync(menuDataPath, 'utf8');

const jsonStart = content.indexOf('export const menuCategories');
const dataStr = content.slice(content.indexOf('=', jsonStart) + 1, content.lastIndexOf(';'));
const categories = eval('(' + dataStr + ')');

const daily = categories.find(c => c.id === 'daily-specials');
const frenchFriesCat = categories.find(c => c.id === 'french-fries');
const snackExtras = frenchFriesCat?.items[0]?.extras || [];

// Map of all items from other categories by ID
const itemMap = new Map();
categories.forEach(cat => {
  if (cat.id === 'daily-specials') return;
  cat.items.forEach(item => {
    itemMap.set(item.id, item);
  });
});

let updatedCount = 0;
daily.items = daily.items.map(dailyItem => {
  const nativeItem = itemMap.get(dailyItem.id);
  if (nativeItem) {
    updatedCount++;
    console.log(`Cloning native properties for [${dailyItem.id}] from ${nativeItem.category || 'native'}`);
    return {
      ...JSON.parse(JSON.stringify(nativeItem)),
      category: 'daily-specials' // keep category field as daily-specials or native
    };
  } else {
    // If native item is not in other categories (e.g. cotoletta, cotechino)
    if (dailyItem.id.includes('milanese')) {
      return {
        ...dailyItem,
        extras: JSON.parse(JSON.stringify(snackExtras))
      };
    }
    return dailyItem;
  }
});

console.log(`Updated ${updatedCount} items in daily-specials`);

// Write back to menuData.ts
const newCategoriesJson = JSON.stringify(categories, null, 2);
const newContent = content.slice(0, content.indexOf('=', jsonStart) + 1) + ' ' + newCategoriesJson + ';' + content.slice(content.lastIndexOf(';') + 1);

fs.writeFileSync(menuDataPath, newContent, 'utf8');
console.log('Saved menuData.ts successfully!');
