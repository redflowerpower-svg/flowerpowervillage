import fs from 'fs';

const menuDataPath = 'src/pizza/data/menuData.ts';
const content = fs.readFileSync(menuDataPath, 'utf8');

const jsonStart = content.indexOf('export const menuCategories');
const dataStr = content.slice(content.indexOf('=', jsonStart) + 1, content.lastIndexOf(';'));
const categories = eval('(' + dataStr + ')');

const priceUpdates = {
  'focaccia-pizza-sandwich-con-milanese': 210,
  'focaccia-pizza-sandwich-con-finocchiona': 190,
  'focaccia-pizza-sandwich-con-pancetta-arrotolata': 190,
  'focaccia-pizza-sandwich-con-porchetta': 210,
  'focaccia-pizza-sandwich-con-prosciutto-cotto': 190,
  'focaccia-pizza-sandwich-con-salame': 190,
  'pizza-sandwich-parma-ham': 190,
  'pizza-sandwich-salame': 190,
  'pizza-sandwich-spicy-salame': 190
};

// Update in all categories (pizza-sandwich and daily-specials)
categories.forEach(cat => {
  cat.items.forEach(item => {
    if (priceUpdates[item.id] !== undefined) {
      console.log(`Updating ${item.id} in category ${cat.id}: ${item.price} -> ${priceUpdates[item.id]}`);
      item.price = priceUpdates[item.id];
    }
  });
});

const newCategoriesJson = JSON.stringify(categories, null, 2);
const newContent = content.slice(0, content.indexOf('=', jsonStart) + 1) + ' ' + newCategoriesJson + ';' + content.slice(content.lastIndexOf(';') + 1);
fs.writeFileSync(menuDataPath, newContent, 'utf8');

console.log('✅ Updated prices in menuData.ts successfully!');
