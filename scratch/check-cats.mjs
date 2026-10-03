import fs from 'fs';
const content = fs.readFileSync('src/pizza/data/menuData.ts', 'utf8');
const match = content.match(/export const menuData: MenuCategory\[\] = (\[[\s\S]*\]);/);
if (match) {
  const cats = JSON.parse(match[1]);
  console.log(cats.map(c => ({ id: c.id, name: c.name, itemsCount: c.items.length })));
}
