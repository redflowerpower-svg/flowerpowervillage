import fs from 'fs';

let content = fs.readFileSync('src/pizza/components/ProductModal.tsx', 'utf8');

// 1. Add import of EXTRAS_TRANSLATION_MAP
if (!content.includes('EXTRAS_TRANSLATION_MAP')) {
  content = content.replace(
    "import { getDietaryType } from '../utils/dietary';",
    "import { getDietaryType } from '../utils/dietary';\nimport { EXTRAS_TRANSLATION_MAP } from '../data/extrasTranslationMap';"
  );
}

// 2. Replace getGroupedExtras
const oldGetGroupedExtrasRegex = /const getGroupedExtras = \(\) => \{[\s\S]*?return groups;\s*\};/;
const newGetGroupedExtras = `const getGroupedExtras = () => {
    const groups: { title: string; maxSelection?: number; items: ExtraOption[]; type: 'option' | 'extra'; idPrefix: string }[] = [];
    
    const spicyItems = item.extras?.filter((e) => e.id.startsWith('spicy-')) ?? [];
    const sugarItems = item.extras?.filter((e) => e.id.startsWith('sugar-')) ?? [];
    const fruitItems = item.extras?.filter((e) => e.id.startsWith('fruit-')) ?? [];
    const sauceItems = item.extras?.filter((e) => e.id.startsWith('sauce-')) ?? [];
    const regularItems = item.extras?.filter((e) => 
      !e.id.startsWith('spicy-') && 
      !e.id.startsWith('sugar-') && 
      !e.id.startsWith('fruit-') && 
      !e.id.startsWith('sauce-')
    ) ?? [];

    const getHeader = (key: 'spicy' | 'sugar' | 'fruit' | 'sauce' | 'regular') => {
      const titles: Record<string, Record<string, string>> = {
        spicy: {
          IT: 'Livello di Piccantezza',
          EN: 'Spiciness Level',
          TH: 'ระดับความเผ็ด',
          MM: 'အစပ်အဆင့်',
          DE: 'Schärfegrad',
          ES: 'Nivel de Picante',
          FR: 'Niveau de Piquant',
          RU: 'Уровень остроты',
          ZH: '辣度等级'
        },
        sugar: {
          IT: 'Livello di Zucchero',
          EN: 'Sugar Level',
          TH: 'ระดับความหวาน',
          MM: 'သကြားအဆင့်',
          DE: 'Zuckergehalt',
          ES: 'Nivel de Azúcar',
          FR: 'Niveau de Sucre',
          RU: 'Уровень сахара',
          ZH: '甜度等级'
        },
        fruit: {
          IT: 'Scelta della Frutta',
          EN: 'Choose Fruit',
          TH: 'เลือกผลไม้',
          MM: 'သစ်သီးရွေးချယ်ရန်',
          DE: 'Frucht auswählen',
          ES: 'Elegir Fruta',
          FR: 'Choisir le Fruit',
          RU: 'Выбор фруктов',
          ZH: '选择水果'
        },
        sauce: {
          IT: 'Seleziona Salse (max 2)',
          EN: 'Select Sauces (max 2)',
          TH: 'เลือกซอส (สูงสุด 2 ชนิด)',
          MM: 'ဆော့စ်ရွေးရန် (အများဆုံး ၂ မျိုး)',
          DE: 'Saucen wählen (max 2)',
          ES: 'Seleccionar Salsas (máx 2)',
          FR: 'Sélectionner les Sauces (max 2)',
          RU: 'Выберите соусы (макс. 2)',
          ZH: '选择酱料（最多2种）'
        },
        regular: {
          IT: 'Ingredienti Extra',
          EN: 'Extra Ingredients',
          TH: 'เครื่องปรุงเพิ่มเติม',
          MM: 'အပိုပါဝင်ပစ္စည်းများ',
          DE: 'Zusätzliche Zutaten',
          ES: 'Ingredientes Extra',
          FR: 'Ingrédients Supplémentaires',
          RU: 'Дополнительные ингредиенты',
          ZH: '额外配料'
        }
      };
      return titles[key][lang] || titles[key]['IT'];
    };

    if (spicyItems.length > 0) {
      groups.push({
        title: getHeader('spicy'),
        maxSelection: 1,
        items: spicyItems,
        type: 'option',
        idPrefix: 'spicy-'
      });
    }

    if (sugarItems.length > 0) {
      groups.push({
        title: getHeader('sugar'),
        maxSelection: 1,
        items: sugarItems,
        type: 'option',
        idPrefix: 'sugar-'
      });
    }

    if (fruitItems.length > 0) {
      groups.push({
        title: getHeader('fruit'),
        maxSelection: 1,
        items: fruitItems,
        type: 'option',
        idPrefix: 'fruit-'
      });
    }

    if (sauceItems.length > 0) {
      groups.push({
        title: getHeader('sauce'),
        maxSelection: 2,
        items: sauceItems,
        type: 'option',
        idPrefix: 'sauce-'
      });
    }

    if (regularItems.length > 0) {
      groups.push({
        title: getHeader('regular'),
        items: regularItems,
        type: 'extra',
        idPrefix: 'regular'
      });
    }

    return groups;
  };`;

content = content.replace(oldGetGroupedExtrasRegex, newGetGroupedExtras);

// 3. Replace handleAdd, getTranslatedName and getTranslatedDesc
const oldTransRegex = /const handleAdd = \(\) => \{[\s\S]*?const t = labels\[lang\] \|\| labels\["IT"\];/;
const newTrans = `const handleAdd = () => {
    const finalItemBasePrice = (selectedVariant?.price != null && Number(selectedVariant.price) > 0)
      ? Number(selectedVariant.price)
      : item.price;

    addItem({
      productId: item.id,
      name: item.name,
      nameTh: item.nameTh,
      nameIt: item.nameIt,
      nameDe: item.nameDe,
      nameMm: item.nameMm,
      nameEs: item.nameEs,
      nameFr: item.nameFr,
      nameRu: item.nameRu,
      nameZh: item.nameZh,
      quantity,
      basePrice: finalItemBasePrice,
      selectedVariant,
      selectedExtras,
      image: item.image,
    });
    onClose();
    openCart();
  };

  const getTranslatedName = (o: {
    id?: string;
    name: string;
    nameTh?: string;
    nameIt?: string;
    name_it?: string;
    nameDe?: string;
    name_de?: string;
    nameMm?: string;
    name_mm?: string;
    nameEs?: string;
    name_es?: string;
    nameFr?: string;
    nameRu?: string;
    nameZh?: string;
  }) => {
    if (o.id && EXTRAS_TRANSLATION_MAP[o.id]) {
      const mapped = EXTRAS_TRANSLATION_MAP[o.id];
      if (lang === 'TH' && mapped.nameTh) return mapped.nameTh;
      if (lang === 'IT' && mapped.nameIt) return mapped.nameIt;
      if (lang === 'DE' && mapped.nameDe) return mapped.nameDe;
      if (lang === 'MM' && mapped.nameMm) return mapped.nameMm;
      if (lang === 'ES' && mapped.nameEs) return mapped.nameEs;
      if (lang === 'FR' && mapped.nameFr) return mapped.nameFr;
      if (lang === 'RU' && mapped.nameRu) return mapped.nameRu;
      if (lang === 'ZH' && mapped.nameZh) return mapped.nameZh;
      if (lang === 'EN' && mapped.name) return mapped.name;
    }

    if (lang === 'TH' && o.nameTh) return o.nameTh;
    if (lang === 'IT' && (o.nameIt || o.name_it)) return o.nameIt || o.name_it || o.name;
    if (lang === 'DE' && (o.nameDe || o.name_de)) return o.nameDe || o.name_de || o.name;
    if (lang === 'MM' && (o.nameMm || o.name_mm)) return o.nameMm || o.name_mm || o.name;
    if (lang === 'ES' && (o.nameEs || o.name_es)) return o.nameEs || o.name_es || o.name;
    if (lang === 'FR' && o.nameFr) return o.nameFr;
    if (lang === 'RU' && o.nameRu) return o.nameRu;
    if (lang === 'ZH' && o.nameZh) return o.nameZh;
    return o.name;
  };

  const formatProductName = (name: string) => {
    if (!name) return "";
    if (name.includes('\\n')) {
      const lines = name.split('\\n');
      return (
        <>
          {lines.map((line, idx) => (
            <span key={idx} className="block">
              {line}
            </span>
          ))}
        </>
      );
    }
    const splitKeywords = [' WITH ', ' CON ', ' พร้อม', ' MIT '];
    const upperName = name.toUpperCase();
    for (const kw of splitKeywords) {
      if (upperName.includes(kw)) {
        const idx = upperName.indexOf(kw);
        const part1 = name.substring(0, idx);
        const matchWord = name.substring(idx, idx + kw.length);
        const part2 = name.substring(idx + kw.length);
        return (
          <>
            {part1}
            <br />
            {matchWord.trimStart()}{part2}
          </>
        );
      }
    }
    return name;
  };

  const getTranslatedDesc = (i: MenuItem) => {
    if (lang === 'TH' && (i.descriptionTh || i.description_th)) return i.descriptionTh || i.description_th;
    if (lang === 'IT' && (i.descriptionIt || i.description_it)) return i.descriptionIt || i.description_it;
    if (lang === 'DE' && (i.descriptionDe || i.description_de)) return i.descriptionDe || i.description_de;
    if (lang === 'MM' && (i.descriptionMm || i.description_mm)) return i.descriptionMm || i.description_mm;
    if (lang === 'ES' && (i.descriptionEs || i.description_es)) return i.descriptionEs || i.description_es;
    if (lang === 'FR' && (i.descriptionFr || i.description_fr)) return i.descriptionFr || i.description_fr;
    if (lang === 'RU' && (i.descriptionRu || i.description_ru)) return i.descriptionRu || i.description_ru;
    if (lang === 'ZH' && (i.descriptionZh || i.description_zh)) return i.descriptionZh || i.description_zh;
    return i.description || i.descriptionIt || i.description_it || '';
  };

  const t = labels[lang] || labels["IT"];`;

content = content.replace(oldTransRegex, newTrans);

// 4. Update section headers in the JSX
const customOptionsMap = {
  IT: 'Opzioni di Personalizzazione',
  EN: 'Customization Options',
  TH: 'ตัวเลือกสินค้า',
  MM: 'စိတ်ကြိုက်ရွေးချယ်စရာများ',
  DE: 'Anpassungsoptionen',
  ES: 'Opciones de Personalización',
  FR: 'Options de Personnalisation',
  RU: 'Параметры настройки',
  ZH: '定制选项'
};
content = content.replace(
  /\{lang === 'TH' \? 'ตัวเลือกสินค้า' : lang === 'IT' \? 'Opzioni di Personalizzazione' : 'Customization Options'\}/g,
  `{(${JSON.stringify(customOptionsMap)})[lang] || 'Customization Options'}`
);

const extraIngMap = {
  IT: 'Ingredienti Extra (Aggiuntivi)',
  EN: 'Extra Ingredients',
  TH: 'ส่วนผสมเพิ่มเติม',
  MM: 'အပိုပါဝင်ပစ္စည်းများ',
  DE: 'Zusätzliche Zutaten',
  ES: 'Ingredientes Extra',
  FR: 'Ingrédients Supplémentaires',
  RU: 'Дополнительные ингредиенты',
  ZH: '额外配料'
};
content = content.replace(
  /\{lang === 'TH' \? 'ส่วนผสมเพิ่มเติม' : lang === 'IT' \? 'Ingredienti Extra \(Aggiuntivi\)' : 'Extra Ingredients'\}/g,
  `{(${JSON.stringify(extraIngMap)})[lang] || 'Extra Ingredients'}`
);

const pastaFormatMap = {
  IT: 'Scegli il Formato di Pasta',
  EN: 'Choose Pasta Format',
  TH: 'เลือกรูปแบบเส้นพาสต้า',
  MM: 'ခေါက်ဆွဲပုံစံရွေးပါ',
  DE: 'Pasta-Format wählen',
  ES: 'Elige el Formato de Pasta',
  FR: 'Choisissez le Format de Pâtes',
  RU: 'Выберите формат пасты',
  ZH: '选择意面形状'
};
content = content.replace(
  /\(lang === 'TH' \? 'เลือกรูปแบบเส้นพาสต้า' : lang === 'DE' \? 'Pasta-Format wählen' : lang === 'EN' \? 'Choose Pasta Format' : 'Scegli il Formato di Pasta'\)/g,
  `(${JSON.stringify(pastaFormatMap)})[lang] || 'Choose Pasta Format'`
);

fs.writeFileSync('src/pizza/components/ProductModal.tsx', content, 'utf8');
console.log('✅ Successfully updated ProductModal.tsx');
