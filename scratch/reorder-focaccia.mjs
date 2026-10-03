import fs from 'fs';

const menuDataPath = 'src/pizza/data/menuData.ts';
const content = fs.readFileSync(menuDataPath, 'utf8');

const jsonStart = content.indexOf('export const menuCategories');
const dataStr = content.slice(content.indexOf('=', jsonStart) + 1, content.lastIndexOf(';'));
const categories = eval('(' + dataStr + ')');

// 1. Reorder in pizza-sandwich category
const swCategory = categories.find(c => c.id === 'pizza-sandwich');
if (swCategory) {
  const milaneseIdx = swCategory.items.findIndex(i => i.id === 'focaccia-pizza-sandwich-con-milanese');
  if (milaneseIdx >= 0) {
    const [milaneseItem] = swCategory.items.splice(milaneseIdx, 1);
    // Find the first focaccia item index
    const firstFocacciaIdx = swCategory.items.findIndex(i => i.id.startsWith('focaccia-'));
    if (firstFocacciaIdx >= 0) {
      swCategory.items.splice(firstFocacciaIdx, 0, milaneseItem);
    } else {
      swCategory.items.unshift(milaneseItem);
    }
  }
}

// 2. Reorder in daily-specials category
const dailyCategory = categories.find(c => c.id === 'daily-specials');
if (dailyCategory) {
  const milaneseIdx = dailyCategory.items.findIndex(i => i.id === 'focaccia-pizza-sandwich-con-milanese');
  if (milaneseIdx >= 0) {
    const [milaneseItem] = dailyCategory.items.splice(milaneseIdx, 1);
    // Find the first focaccia item index in daily-specials
    const firstFocacciaIdx = dailyCategory.items.findIndex(i => i.id.startsWith('focaccia-'));
    if (firstFocacciaIdx >= 0) {
      dailyCategory.items.splice(firstFocacciaIdx, 0, milaneseItem);
    } else {
      dailyCategory.items.unshift(milaneseItem);
    }
  }
}

const newCategoriesJson = JSON.stringify(categories, null, 2);
const newContent = content.slice(0, content.indexOf('=', jsonStart) + 1) + ' ' + newCategoriesJson + ';' + content.slice(content.lastIndexOf(';') + 1);
fs.writeFileSync(menuDataPath, newContent, 'utf8');

console.log('✅ Reordered focaccia-con-milanese as the first focaccia in both pizza-sandwich and daily-specials!');
