import fs from 'fs';

const content = fs.readFileSync('src/pizza/data/menuData.ts', 'utf8');

// Parse items
const itemRegex = /\{\s*"id":\s*"([^"]+)",\s*"name":\s*"([^"]+)",\s*"nameTh":\s*"([^"]+)",[\s\S]*?"description":\s*"([^"]+)",\s*"descriptionTh":\s*"([^"]+)",\s*"price":\s*(\d+),\s*"image":\s*"([^"]+)"/g;

let match;
const items = [];
while ((match = itemRegex.exec(content)) !== null) {
  items.push({
    id: match[1],
    name: match[2],
    nameTh: match[3],
    desc: match[4],
    descTh: match[5],
    price: match[6],
    image: match[7]
  });
}

console.log(`Extracted ${items.length} items with images.`);
items.slice(0, 15).forEach(i => {
  console.log(`- ${i.name} (${i.nameTh}) | ${i.price}B | ${i.image}`);
});
