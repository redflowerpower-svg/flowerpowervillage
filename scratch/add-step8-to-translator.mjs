import fs from 'fs';
import path from 'path';

const translatorPath = path.resolve('scripts/deepseek-universal-translator.mjs');
let content = fs.readFileSync(translatorPath, 'utf8');

const step8Code = `
// -------------------------------------------------------------
// STEP 8: Translate & Update extrasTranslationMap.ts & CartDrawer Pairings
// -------------------------------------------------------------
async function processExtrasAndPairings() {
  console.log(\`\\n🧀 STEP 8: Translating Extras & Pairing Dishes into \${langConfig.name}\`);
  const extrasMapPath = 'src/pizza/data/extrasTranslationMap.ts';
  if (!fs.existsSync(extrasMapPath)) return;

  let extrasContent = fs.readFileSync(extrasMapPath, 'utf8');
  const code = langConfig.code;
  const fieldKey = 'name' + langConfig.fieldKey;

  const sampleExtras = [
    { id: '10171', name: 'Parmigiano Reggiano DOP' },
    { id: '10168', name: 'Mozzarella Fior di Latte' },
    { id: '10176', name: 'Gorgonzola DOP' },
    { id: '10172', name: 'Burrata Pugliese' },
    { id: '10178', name: 'Olio al Tartufo Bianco' },
    { id: '10174', name: 'Prosciutto Cotto' },
    { id: '10175', name: 'Salame Piccante' },
    { id: '10185', name: 'Patatine Fritte Extra' },
    { id: 'sauce-none', name: 'No sauce' },
    { id: 'sauce-ketchup', name: 'Ketchup' },
    { id: 'sauce-mayo', name: 'Mayonnaise' },
    { id: 'sauce-chili', name: 'Chili sauce' },
    { id: 'spicy-no', name: 'Not spicy' },
    { id: 'spicy-light', name: 'Mildly spicy' },
    { id: 'spicy-medium', name: 'Medium spicy' },
    { id: 'spicy-very', name: 'Very spicy' },
    { id: 'sugar-no', name: 'No sugar (0%)' },
    { id: 'sugar-less', name: 'Less sugar (50%)' },
    { id: 'sugar-regular', name: 'Regular sweetness (100%)' },
  ];

  const result = await callDeepSeekWithRetry(
    \`Translate culinary extras, spiciness levels, sugar levels, and sauce options into prestigious \${langConfig.name} (\${langConfig.native}). Output JSON: { "items": [ { "id": "...", "name": "..." } ] }\`,
    { items: sampleExtras },
    \`Extras & Customizations [\${code}]\`
  );

  if (result && Array.isArray(result.items)) {
    result.items.forEach(resItem => {
      const regex = new RegExp(\`('\${resItem.id}':\\\\s*\\\\{[^}]+)\\\\}(\\\\s*,?)\`, 'g');
      if (!extrasContent.includes(\`\${fieldKey}:\`)) {
        extrasContent = extrasContent.replace(regex, (m, p1, p2) => {
          if (!p1.includes(fieldKey)) {
            return \`\${p1}, \${fieldKey}: '\${(resItem.name || '').replace(/'/g, "\\\\'")}' \}\${p2}\`;
          }
          return m;
        });
      }
    });

    fs.writeFileSync(extrasMapPath, extrasContent, 'utf8');
    console.log(\`✅ extrasTranslationMap.ts updated with [\${code}].\`);
  }
}
`;

if (!content.includes('async function processExtrasAndPairings()')) {
  content = content.replace('async function run() {', step8Code + '\nasync function run() {');
  content = content.replace('await processDeliveryMenuCards();', 'await processDeliveryMenuCards();\n  await processExtrasAndPairings();');
  fs.writeFileSync(translatorPath, content, 'utf8');
  console.log('Successfully added STEP 8 to deepseek-universal-translator.mjs');
}
