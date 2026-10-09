import fs from 'fs';

// 1. Update MenuGrid.tsx
let menuGridContent = fs.readFileSync('src/pizza/components/MenuGrid.tsx', 'utf8');

if (!menuGridContent.includes('EXTRAS_TRANSLATION_MAP')) {
  menuGridContent = menuGridContent.replace(
    "import { getDietaryType } from '../utils/dietary';",
    "import { getDietaryType } from '../utils/dietary';\nimport { EXTRAS_TRANSLATION_MAP } from '../data/extrasTranslationMap';"
  );
}

const oldMenuGridTrans = `  const getTranslatedName = (item: { id?: string; name: string; nameTh?: string; nameIt?: string; nameDe?: string; nameMm?: string; name_mm?: string; nameEs?: string; nameFr?: string; nameRu?: string; nameZh?: string }) => {
    const pid = (item.id || '').trim().toLowerCase();
    const curLang = lang || 'IT';
    const dict = targetedTranslations[curLang];
    if (dict) {
      if (dict.extras && dict.extras[pid]) return dict.extras[pid];
      if (dict.pairingDishes && dict.pairingDishes[pid]) return dict.pairingDishes[pid];
    }`;

const newMenuGridTrans = `  const getTranslatedName = (item: { id?: string; name: string; nameTh?: string; nameIt?: string; nameDe?: string; nameMm?: string; name_mm?: string; nameEs?: string; nameFr?: string; nameRu?: string; nameZh?: string }) => {
    const pid = (item.id || '').trim().toLowerCase();
    const origId = (item.id || '').trim();
    const curLang = lang || 'IT';

    if (origId && EXTRAS_TRANSLATION_MAP[origId]) {
      const mapped = EXTRAS_TRANSLATION_MAP[origId];
      if (curLang === 'TH' && mapped.nameTh) return mapped.nameTh;
      if (curLang === 'IT' && mapped.nameIt) return mapped.nameIt;
      if (curLang === 'DE' && mapped.nameDe) return mapped.nameDe;
      if (curLang === 'MM' && mapped.nameMm) return mapped.nameMm;
      if (curLang === 'ES' && mapped.nameEs) return mapped.nameEs;
      if (curLang === 'FR' && mapped.nameFr) return mapped.nameFr;
      if (curLang === 'RU' && mapped.nameRu) return mapped.nameRu;
      if (curLang === 'ZH' && mapped.nameZh) return mapped.nameZh;
      if (curLang === 'EN' && mapped.name) return mapped.name;
    }

    const dict = targetedTranslations[curLang];
    if (dict) {
      if (dict.extras && dict.extras[pid]) return dict.extras[pid];
      if (dict.pairingDishes && dict.pairingDishes[pid]) return dict.pairingDishes[pid];
    }`;

menuGridContent = menuGridContent.replace(oldMenuGridTrans, newMenuGridTrans);
fs.writeFileSync('src/pizza/components/MenuGrid.tsx', menuGridContent, 'utf8');
console.log('✅ Updated MenuGrid.tsx');

// 2. Update CartDrawer.tsx
let cartDrawerContent = fs.readFileSync('src/pizza/components/CartDrawer.tsx', 'utf8');

if (!cartDrawerContent.includes('EXTRAS_TRANSLATION_MAP')) {
  cartDrawerContent = cartDrawerContent.replace(
    "import { getDietaryType } from '../utils/dietary';",
    "import { getDietaryType } from '../utils/dietary';\nimport { EXTRAS_TRANSLATION_MAP } from '../data/extrasTranslationMap';"
  );
}

const oldCartTrans = `  const getTranslatedName = (o: { name: string; nameTh?: string; nameIt?: string; nameDe?: string; nameMm?: string; name_mm?: string; nameEs?: string; nameFr?: string; nameRu?: string; nameZh?: string; productId?: string; id?: string }) => {
    const pid = (o.productId || o.id || '').trim().toLowerCase();
    // Fast dictionary lookup for pairing dishes and extras in all 9 languages
    const curLang = lang || 'IT';
    const dict = targetedTranslations[curLang];
    if (dict) {
      if (dict.pairingDishes && dict.pairingDishes[pid]) return dict.pairingDishes[pid];
      if (dict.extras && dict.extras[pid]) return dict.extras[pid];
    }`;

const newCartTrans = `  const getTranslatedName = (o: { name: string; nameTh?: string; nameIt?: string; nameDe?: string; nameMm?: string; name_mm?: string; nameEs?: string; nameFr?: string; nameRu?: string; nameZh?: string; productId?: string; id?: string }) => {
    const pid = (o.productId || o.id || '').trim().toLowerCase();
    const origId = (o.productId || o.id || '').trim();
    const curLang = lang || 'IT';

    if (origId && EXTRAS_TRANSLATION_MAP[origId]) {
      const mapped = EXTRAS_TRANSLATION_MAP[origId];
      if (curLang === 'TH' && mapped.nameTh) return mapped.nameTh;
      if (curLang === 'IT' && mapped.nameIt) return mapped.nameIt;
      if (curLang === 'DE' && mapped.nameDe) return mapped.nameDe;
      if (curLang === 'MM' && mapped.nameMm) return mapped.nameMm;
      if (curLang === 'ES' && mapped.nameEs) return mapped.nameEs;
      if (curLang === 'FR' && mapped.nameFr) return mapped.nameFr;
      if (curLang === 'RU' && mapped.nameRu) return mapped.nameRu;
      if (curLang === 'ZH' && mapped.nameZh) return mapped.nameZh;
      if (curLang === 'EN' && mapped.name) return mapped.name;
    }

    // Fast dictionary lookup for pairing dishes and extras in all 9 languages
    const dict = targetedTranslations[curLang];
    if (dict) {
      if (dict.pairingDishes && dict.pairingDishes[pid]) return dict.pairingDishes[pid];
      if (dict.extras && dict.extras[pid]) return dict.extras[pid];
    }`;

cartDrawerContent = cartDrawerContent.replace(oldCartTrans, newCartTrans);
fs.writeFileSync('src/pizza/components/CartDrawer.tsx', cartDrawerContent, 'utf8');
console.log('✅ Updated CartDrawer.tsx');
