import fs from 'fs';

const filePath = 'src/pizza/data/menuData.ts';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Original content length:', content.length);

let replaceCount = 0;

// Match any JSON-like object containing "Formaggio Parmigiano"
content = content.replace(/\{[^{}]*?"name(?:_it|It)":\s*"Formaggio Parmigiano"[^{}]*?\}/g, (match) => {
  replaceCount++;
  let updated = match;
  updated = updated.replace(/"name":\s*"[^"]*"/, '"name": "Parmesan"');
  if (updated.includes('"nameTh"')) {
    updated = updated.replace(/"nameTh":\s*"[^"]*"/, '"nameTh": "พาร์มิจาโน"');
  }
  if (updated.includes('"name_th"')) {
    updated = updated.replace(/"name_th":\s*"[^"]*"/, '"name_th": "พาร์มิจาโน"');
  }
  if (updated.includes('"nameIt"')) {
    updated = updated.replace(/"nameIt":\s*"[^"]*"/, '"nameIt": "Parmigiano"');
  }
  if (updated.includes('"name_it"')) {
    updated = updated.replace(/"name_it":\s*"[^"]*"/, '"name_it": "Parmigiano"');
  }
  if (updated.includes('"nameDe"')) {
    updated = updated.replace(/"nameDe":\s*"[^"]*"/, '"nameDe": "Parmesan"');
  }
  if (updated.includes('"name_de"')) {
    updated = updated.replace(/"name_de":\s*"[^"]*"/, '"name_de": "Parmesan"');
  }
  if (updated.includes('"nameMm"')) {
    updated = updated.replace(/"nameMm":\s*"[^"]*"/, '"nameMm": "ပါမာဂျာနို"');
  }
  if (updated.includes('"name_mm"')) {
    updated = updated.replace(/"name_mm":\s*"[^"]*"/, '"name_mm": "ပါမာဂျာနို"');
  }
  return updated;
});

console.log(`Updated ${replaceCount} Formaggio Parmigiano extra blocks.`);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Saved updated menuData.ts successfully.');
