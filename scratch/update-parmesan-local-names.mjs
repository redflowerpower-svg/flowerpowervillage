import fs from 'fs';

const filePath = 'src/pizza/data/menuData.ts';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Original content length:', content.length);

let replaceCount = 0;

// Replace any occurrence of the phonetic transliterations in Thai and Burmese for the extra
content = content.replace(/\{[^{}]*?"name(?:_it|It)":\s*"Parmigiano"[^{}]*?\}/g, (match) => {
  replaceCount++;
  let updated = match;
  if (updated.includes('"nameTh"')) {
    updated = updated.replace(/"nameTh":\s*"[^"]*"/, '"nameTh": "พาร์เมซาน"');
  }
  if (updated.includes('"name_th"')) {
    updated = updated.replace(/"name_th":\s*"[^"]*"/, '"name_th": "พาร์เมซาน"');
  }
  if (updated.includes('"nameMm"')) {
    updated = updated.replace(/"nameMm":\s*"[^"]*"/, '"nameMm": "ပါမေဆန်"');
  }
  if (updated.includes('"name_mm"')) {
    updated = updated.replace(/"name_mm":\s*"[^"]*"/, '"name_mm": "ပါမေဆန်"');
  }
  return updated;
});

// Also check by ID ext-double-parmesan or 10171
content = content.replace(/"id":\s*"(?:ext-double-parmesan|10171)"[\s\S]*?}/g, (match) => {
  replaceCount++;
  let updated = match;
  if (updated.includes('"nameTh"')) {
    updated = updated.replace(/"nameTh":\s*"[^"]*"/, '"nameTh": "พาร์เมซาน"');
  }
  if (updated.includes('"name_th"')) {
    updated = updated.replace(/"name_th":\s*"[^"]*"/, '"name_th": "พาร์เมซาน"');
  }
  if (updated.includes('"nameMm"')) {
    updated = updated.replace(/"nameMm":\s*"[^"]*"/, '"nameMm": "ပါမေဆန်"');
  }
  if (updated.includes('"name_mm"')) {
    updated = updated.replace(/"name_mm":\s*"[^"]*"/, '"name_mm": "ပါမေဆန်"');
  }
  return updated;
});

console.log(`Updated Parmesan blocks. Total operations: ${replaceCount}`);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Saved updated menuData.ts successfully.');
