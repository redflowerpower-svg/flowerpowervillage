import fs from 'fs';

// 1. Fix CartDrawer.tsx
let cartContent = fs.readFileSync('src/pizza/components/CartDrawer.tsx', 'utf8');
if (!cartContent.includes('import { EXTRAS_TRANSLATION_MAP }')) {
  cartContent = cartContent.replace(
    "import { MenuItem, Variant, ExtraOption, menuData } from '../data/menuData';",
    "import { MenuItem, Variant, ExtraOption, menuData } from '../data/menuData';\nimport { EXTRAS_TRANSLATION_MAP } from '../data/extrasTranslationMap';"
  );
  fs.writeFileSync('src/pizza/components/CartDrawer.tsx', cartContent, 'utf8');
  console.log('✅ Added EXTRAS_TRANSLATION_MAP import to CartDrawer.tsx');
}

// 2. Fix DeliveryMenu.tsx DROPDOWN_LABELS
let deliveryContent = fs.readFileSync('src/pizza/pages/DeliveryMenu.tsx', 'utf8');

const oldDropdownLabels = `const DROPDOWN_LABELS = {
  IT: {
    pastaFilter: 'Condimento / Tipo di Pasta',
    drinkFilter: 'Tipologia Bevanda',
    wineTypeFilter: 'Tipologia Vino',
    wineCountryFilter: 'Origine / Nazione',
  },
  EN: {
    pastaFilter: 'Sauce / Pasta Type',
    drinkFilter: 'Beverage Category',
    wineTypeFilter: 'Wine Type',
    wineCountryFilter: 'Origin / Country',
  },
  TH: {
    pastaFilter: 'ประเภทซอสพาสต้า',
    drinkFilter: 'ประเภทเครื่องดื่ม',
    wineTypeFilter: 'ประเภทไวน์',
    wineCountryFilter: 'แหล่งกำเนิด / ประเทศ',
  },
  DE: {
    pastaFilter: 'Sauce / Nudelart',
    drinkFilter: 'Getränkekategorie',
    wineTypeFilter: 'Weinsorte',
    wineCountryFilter: 'Herkunft / Land',
  },
  MM: {
    pastaFilter: 'ခေါက်ဆွဲဆော့စ် / အမျိုးအစား',
    drinkFilter: 'သောက်စရာ အမျိုးအစား',
    wineTypeFilter: 'ဝိုင် အမျိုးအစား',
    wineCountryFilter: 'မူရင်းနိုင်ငံ',
  },
};`;

const newDropdownLabels = `const DROPDOWN_LABELS: Record<string, { pastaFilter: string; drinkFilter: string; wineTypeFilter: string; wineCountryFilter: string }> = {
  IT: {
    pastaFilter: 'Condimento / Tipo di Pasta',
    drinkFilter: 'Tipologia Bevanda',
    wineTypeFilter: 'Tipologia Vino',
    wineCountryFilter: 'Origine / Nazione',
  },
  EN: {
    pastaFilter: 'Sauce / Pasta Type',
    drinkFilter: 'Beverage Category',
    wineTypeFilter: 'Wine Type',
    wineCountryFilter: 'Origin / Country',
  },
  TH: {
    pastaFilter: 'ประเภทซอสพาสต้า',
    drinkFilter: 'ประเภทเครื่องดื่ม',
    wineTypeFilter: 'ประเภทไวน์',
    wineCountryFilter: 'แหล่งกำเนิด / ประเทศ',
  },
  DE: {
    pastaFilter: 'Sauce / Nudelart',
    drinkFilter: 'Getränkekategorie',
    wineTypeFilter: 'Weinsorte',
    wineCountryFilter: 'Herkunft / Land',
  },
  MM: {
    pastaFilter: 'ခေါက်ဆွဲဆော့စ် / အမျိုးအစား',
    drinkFilter: 'သောက်စရာ အမျိုးအစား',
    wineTypeFilter: 'ဝိုင် အမျိုးအစား',
    wineCountryFilter: 'မူရင်းနိုင်ငံ',
  },
  ES: {
    pastaFilter: 'Salsa / Tipo de Pasta',
    drinkFilter: 'Categoría de Bebida',
    wineTypeFilter: 'Tipo de Vino',
    wineCountryFilter: 'Origen / País',
  },
  FR: {
    pastaFilter: 'Sauce / Type de Pâtes',
    drinkFilter: 'Catégorie de Boisson',
    wineTypeFilter: 'Type de Vin',
    wineCountryFilter: 'Origine / Pays',
  },
  RU: {
    pastaFilter: 'Соус / Вид пасты',
    drinkFilter: 'Категория напитка',
    wineTypeFilter: 'Тип вина',
    wineCountryFilter: 'Происхождение / Страна',
  },
  ZH: {
    pastaFilter: '酱汁 / 意面类型',
    drinkFilter: '饮品类别',
    wineTypeFilter: '葡萄酒类型',
    wineCountryFilter: '产地 / 国家',
  },
};`;

deliveryContent = deliveryContent.replace(oldDropdownLabels, newDropdownLabels);

// Also use defensive lookups for DROPDOWN_LABELS[lang]
deliveryContent = deliveryContent.replace(/DROPDOWN_LABELS\[lang\]\.pastaFilter/g, '(DROPDOWN_LABELS[lang] || DROPDOWN_LABELS.IT).pastaFilter');
deliveryContent = deliveryContent.replace(/DROPDOWN_LABELS\[lang\]\.wineTypeFilter/g, '(DROPDOWN_LABELS[lang] || DROPDOWN_LABELS.IT).wineTypeFilter');
deliveryContent = deliveryContent.replace(/DROPDOWN_LABELS\[lang\]\.wineCountryFilter/g, '(DROPDOWN_LABELS[lang] || DROPDOWN_LABELS.IT).wineCountryFilter');

fs.writeFileSync('src/pizza/pages/DeliveryMenu.tsx', deliveryContent, 'utf8');
console.log('✅ Updated DROPDOWN_LABELS and defensive lookups in DeliveryMenu.tsx');
