import fs from 'fs';

const content = fs.readFileSync('src/pizza/data/menuData.ts', 'utf8');

// extract menuCategories
const lines = content.split('\n');
let dailySpecialsStart = -1;
let dailySpecialsEnd = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("id: 'daily-specials'") || lines[i].includes('id: "daily-specials"')) {
    dailySpecialsStart = i;
  }
  if (dailySpecialsStart !== -1 && i > dailySpecialsStart && lines[i].startsWith('  },')) {
    dailySpecialsEnd = i;
    break;
  }
}

console.log('Daily specials lines:', dailySpecialsStart, dailySpecialsEnd);
const dsBlock = lines.slice(dailySpecialsStart, dailySpecialsEnd).join('\n');
const ids = [...dsBlock.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
console.log('IDs found in daily-specials block:', ids);

// Check if items match multiple sections in DAILY_SPECIALS_SECTIONS
const DAILY_SPECIALS_SECTIONS = [
  { id: 'pasta' },
  { id: 'traditional-italian-pizza' },
  { id: 'daily-specials' },
  { id: 'pizza-sandwich' },
  { id: 'french-fries' }
];

ids.forEach(id => {
  const item = { id, category: 'daily-specials' }; // In daily-specials category, what is item.category?
  // If item was created with category: 'pasta' or category: 'daily-specials', let's check!
  const matches = [];
  DAILY_SPECIALS_SECTIONS.forEach(sec => {
    let matched = false;
    if (sec.id === 'pasta') {
      matched = item.category === 'pasta' || item.id.includes('scoglio') || item.id.includes('salmone') || item.id.includes('ravioli') || item.id.includes('seppia') || (item.id.includes('spaghetti') && item.id.includes('granchio'));
    }
    if (sec.id === 'traditional-italian-pizza') {
      matched = item.category === 'traditional-italian-pizza' || item.id.includes('pizza-');
    }
    if (sec.id === 'daily-specials') {
      matched = item.category === 'daily-specials' || item.id.includes('milanese') || item.id.includes('cotechino');
    }
    if (sec.id === 'pizza-sandwich') {
      matched = item.category === 'pizza-sandwich' || item.id.includes('sandwich') || item.id.includes('focaccia');
    }
    if (sec.id === 'french-fries') {
      matched = item.category === 'french-fries' || item.id.includes('torta') || item.id.includes('french-fries');
    }
    if (matched) matches.push(sec.id);
  });
  console.log(`Item "${id}" matched in sections:`, matches);
});
