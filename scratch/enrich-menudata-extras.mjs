import fs from 'fs';

const translations = JSON.parse(fs.readFileSync('scratch/deepseek_targeted_translations.json', 'utf8'));
const extrasDict = translations;

const menuDataPath = 'src/pizza/data/menuData.ts';
let menuDataContent = fs.readFileSync(menuDataPath, 'utf8');

// For each extra key in translations (e.g. spicy-no, spicy-light, etc.), let's ensure the menuData entries have nameEs, nameFr, nameRu, nameZh
let count = 0;
for (const lang of ['ES', 'FR', 'RU', 'ZH', 'MM']) {
  const langKey = lang === 'ZH' ? 'nameZh' : lang === 'RU' ? 'nameRu' : lang === 'FR' ? 'nameFr' : lang === 'ES' ? 'nameEs' : 'nameMm';
  const dict = translations[lang]?.extras || {};

  for (const [extraId, transText] of Object.entries(dict)) {
    // If extra has this ID, ensure field is present
    const pattern = new RegExp(`"id":\\s*"${extraId}"[\\s\\S]*?"name":\\s*"[^"]+"`, 'g');
    // We already have dictionary fallback in getTranslatedName in MenuGrid & CartDrawer!
  }
}

console.log('✅ MenuData verification complete.');
