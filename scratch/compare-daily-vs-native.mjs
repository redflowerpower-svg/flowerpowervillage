import fs from 'fs';

const content = fs.readFileSync('src/pizza/data/menuData.ts', 'utf8');
const jsonStart = content.indexOf('export const menuCategories');
const dataStr = content.slice(content.indexOf('=', jsonStart) + 1, content.lastIndexOf(';'));
const categories = eval('(' + dataStr + ')');

const daily = categories.find(c => c.id === 'daily-specials');

daily.items.forEach(dItem => {
  // find in other categories
  for (const cat of categories) {
    if (cat.id === 'daily-specials') continue;
    const found = cat.items.find(i => i.id === dItem.id);
    if (found) {
      console.log(`\nMatch found for [${dItem.id}] in category [${cat.id}]:`);
      console.log('  daily extras:', dItem.extras?.length, '| native extras:', found.extras?.length);
      console.log('  daily variants:', dItem.variants?.length, '| native variants:', found.variants?.length);
      console.log('  daily allowed_extras_group:', dItem.allowed_extras_group, '| native allowed_extras_group:', found.allowed_extras_group);
      break;
    }
  }
});
