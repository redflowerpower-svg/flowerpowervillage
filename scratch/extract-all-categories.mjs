import fs from 'fs';

const content = fs.readFileSync('src/pizza/data/menuData.ts', 'utf8');

const marker = 'export const menuData: MenuCategory[] = ';
const jsonPart = content.substring(content.indexOf(marker) + marker.length).trim().replace(/;$/, '');

const categories = eval('(' + jsonPart + ')');

console.log('Categories count:', categories.length);
categories.forEach(cat => {
  console.log(`\n=== CATEGORY: ${cat.name} (${cat.id}) [${cat.items.length} items] ===`);
  cat.items.slice(0, 4).forEach(item => {
    console.log(`  - [${item.id}] ${item.name} | ${item.nameTh} | ${item.price}฿\n    Desc: ${item.description}\n    Img: ${item.image}`);
  });
});
