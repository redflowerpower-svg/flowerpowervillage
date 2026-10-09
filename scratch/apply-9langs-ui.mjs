import fs from 'fs';

console.log('🚀 Avvio allineamento UI a 9 lingue...');

const uiRaw = fs.readFileSync('scratch/deepseek_4langs_ui.json', 'utf8');
const ui = JSON.parse(uiRaw);

// 1. Aggiorna MenuGrid.tsx labels e helpers
let menuGridCode = fs.readFileSync('src/pizza/components/MenuGrid.tsx', 'utf8');

// Aggiungiamo le definizioni per ES, FR, RU, ZH nel dictionary labels di MenuGrid
const labelsInsert = `  ES: {
    sizeOptions: '${ui.ES.sizeOptions}',
    extraIngredients: '${ui.ES.extraIngredients}',
    startingAt: '${ui.ES.startingAt}',
    totalFinito: '${ui.ES.totalFinito}',
    confirmText: '${ui.ES.confirmText}',
    closeText: '${ui.ES.closeText}',
    customizeText: '${ui.ES.customizeText}',
    chooseText: '${ui.ES.chooseText}',
    freeText: '${ui.ES.freeText}',
    lasagnaBadge: '${ui.ES.lasagnaBadge}',
    lasagnaDateLabel: '${ui.ES.lasagnaDateLabel}',
    lasagnaDatePlaceholder: '${ui.ES.lasagnaDatePlaceholder}',
    lasagnaDateRequired: '${ui.ES.lasagnaDateRequired}',
    lasagnaWhyLabel: '${ui.ES.lasagnaWhyLabel}',
    splitVariantName: '${ui.ES.splitVariantName}',
    splitChooseSecondHalf: '${ui.ES.splitChooseSecondHalf}',
    splitSearchPlaceholder: '${ui.ES.splitSearchPlaceholder}',
    splitFirstHalfLabel: '${ui.ES.splitFirstHalfLabel}',
    splitSecondHalfLabel: '${ui.ES.splitSecondHalfLabel}',
    splitSecondHalfRequired: '${ui.ES.splitSecondHalfRequired}',
    splitAverageNotice: '${ui.ES.splitAverageNotice}',
    splitSelectedBadge: '${ui.ES.splitSelectedBadge}',
    chickenOptionTitle: '${ui.ES.chickenOptionTitle}',
    chickenOptionDesc: '${ui.ES.chickenOptionDesc}',
    chickenOptionSelected: '${ui.ES.chickenOptionSelected}',
    chickenOptionSelect: '${ui.ES.chickenOptionSelect}',
  },
  FR: {
    sizeOptions: '${ui.FR.sizeOptions}',
    extraIngredients: '${ui.FR.extraIngredients}',
    startingAt: '${ui.FR.startingAt}',
    totalFinito: '${ui.FR.totalFinito}',
    confirmText: '${ui.FR.confirmText}',
    closeText: '${ui.FR.closeText}',
    customizeText: '${ui.FR.customizeText}',
    chooseText: '${ui.FR.chooseText}',
    freeText: '${ui.FR.freeText}',
    lasagnaBadge: '${ui.FR.lasagnaBadge}',
    lasagnaDateLabel: '${ui.FR.lasagnaDateLabel}',
    lasagnaDatePlaceholder: '${ui.FR.lasagnaDatePlaceholder}',
    lasagnaDateRequired: '${ui.FR.lasagnaDateRequired}',
    lasagnaWhyLabel: '${ui.FR.lasagnaWhyLabel}',
    splitVariantName: '${ui.FR.splitVariantName}',
    splitChooseSecondHalf: '${ui.FR.splitChooseSecondHalf}',
    splitSearchPlaceholder: '${ui.FR.splitSearchPlaceholder}',
    splitFirstHalfLabel: '${ui.FR.splitFirstHalfLabel}',
    splitSecondHalfLabel: '${ui.FR.splitSecondHalfLabel}',
    splitSecondHalfRequired: '${ui.FR.splitSecondHalfRequired}',
    splitAverageNotice: '${ui.FR.splitAverageNotice}',
    splitSelectedBadge: '${ui.FR.splitSelectedBadge}',
    chickenOptionTitle: '${ui.FR.chickenOptionTitle}',
    chickenOptionDesc: '${ui.FR.chickenOptionDesc}',
    chickenOptionSelected: '${ui.FR.chickenOptionSelected}',
    chickenOptionSelect: '${ui.FR.chickenOptionSelect}',
  },
  RU: {
    sizeOptions: '${ui.RU.sizeOptions}',
    extraIngredients: '${ui.RU.extraIngredients}',
    startingAt: '${ui.RU.startingAt}',
    totalFinito: '${ui.RU.totalFinito}',
    confirmText: '${ui.RU.confirmText}',
    closeText: '${ui.RU.closeText}',
    customizeText: '${ui.RU.customizeText}',
    chooseText: '${ui.RU.chooseText}',
    freeText: '${ui.RU.freeText}',
    lasagnaBadge: '${ui.RU.lasagnaBadge}',
    lasagnaDateLabel: '${ui.RU.lasagnaDateLabel}',
    lasagnaDatePlaceholder: '${ui.RU.lasagnaDatePlaceholder}',
    lasagnaDateRequired: '${ui.RU.lasagnaDateRequired}',
    lasagnaWhyLabel: '${ui.RU.lasagnaWhyLabel}',
    splitVariantName: '${ui.RU.splitVariantName}',
    splitChooseSecondHalf: '${ui.RU.splitChooseSecondHalf}',
    splitSearchPlaceholder: '${ui.RU.splitSearchPlaceholder}',
    splitFirstHalfLabel: '${ui.RU.splitFirstHalfLabel}',
    splitSecondHalfLabel: '${ui.RU.splitSecondHalfLabel}',
    splitSecondHalfRequired: '${ui.RU.splitSecondHalfRequired}',
    splitAverageNotice: '${ui.RU.splitAverageNotice}',
    splitSelectedBadge: '${ui.RU.splitSelectedBadge}',
    chickenOptionTitle: '${ui.RU.chickenOptionTitle}',
    chickenOptionDesc: '${ui.RU.chickenOptionDesc}',
    chickenOptionSelected: '${ui.RU.chickenOptionSelected}',
    chickenOptionSelect: '${ui.RU.chickenOptionSelect}',
  },
  ZH: {
    sizeOptions: '${ui.ZH.sizeOptions}',
    extraIngredients: '${ui.ZH.extraIngredients}',
    startingAt: '${ui.ZH.startingAt}',
    totalFinito: '${ui.ZH.totalFinito}',
    confirmText: '${ui.ZH.confirmText}',
    closeText: '${ui.ZH.closeText}',
    customizeText: '${ui.ZH.customizeText}',
    chooseText: '${ui.ZH.chooseText}',
    freeText: '${ui.ZH.freeText}',
    lasagnaBadge: '${ui.ZH.lasagnaBadge}',
    lasagnaDateLabel: '${ui.ZH.lasagnaDateLabel}',
    lasagnaDatePlaceholder: '${ui.ZH.lasagnaDatePlaceholder}',
    lasagnaDateRequired: '${ui.ZH.lasagnaDateRequired}',
    lasagnaWhyLabel: '${ui.ZH.lasagnaWhyLabel}',
    splitVariantName: '${ui.ZH.splitVariantName}',
    splitChooseSecondHalf: '${ui.ZH.splitChooseSecondHalf}',
    splitSearchPlaceholder: '${ui.ZH.splitSearchPlaceholder}',
    splitFirstHalfLabel: '${ui.ZH.splitFirstHalfLabel}',
    splitSecondHalfLabel: '${ui.ZH.splitSecondHalfLabel}',
    splitSecondHalfRequired: '${ui.ZH.splitSecondHalfRequired}',
    splitAverageNotice: '${ui.ZH.splitAverageNotice}',
    splitSelectedBadge: '${ui.ZH.splitSelectedBadge}',
    chickenOptionTitle: '${ui.ZH.chickenOptionTitle}',
    chickenOptionDesc: '${ui.ZH.chickenOptionDesc}',
    chickenOptionSelected: '${ui.ZH.chickenOptionSelected}',
    chickenOptionSelect: '${ui.ZH.chickenOptionSelect}',
  },
};`;

if (!menuGridCode.includes('ES: {')) {
  menuGridCode = menuGridCode.replace('  MM: {\n    sizeOptions:', `${labelsInsert}\n  MM: {\n    sizeOptions:`);
}

// Aggiorniamo helper getTranslatedName e getTranslatedDesc in MenuGrid
menuGridCode = menuGridCode.replace(
  `    if (lang === 'MM' && (item.nameMm || item.name_mm)) return item.nameMm || item.name_mm;`,
  `    if (lang === 'ZH' && (item.nameZh || (item as any).name_zh)) return item.nameZh || (item as any).name_zh;
    if (lang === 'RU' && (item.nameRu || (item as any).name_ru)) return item.nameRu || (item as any).name_ru;
    if (lang === 'FR' && (item.nameFr || (item as any).name_fr)) return item.nameFr || (item as any).name_fr;
    if (lang === 'ES' && (item.nameEs || (item as any).name_es)) return item.nameEs || (item as any).name_es;
    if (lang === 'MM' && (item.nameMm || item.name_mm)) return item.nameMm || item.name_mm;`
);

menuGridCode = menuGridCode.replace(
  `    if (lang === 'MM' && (item.descriptionMm || item.description_mm)) return item.descriptionMm || item.description_mm;`,
  `    if (lang === 'ZH' && (item.descriptionZh || (item as any).description_zh)) return item.descriptionZh || (item as any).description_zh;
    if (lang === 'RU' && (item.descriptionRu || (item as any).description_ru)) return item.descriptionRu || (item as any).description_ru;
    if (lang === 'FR' && (item.descriptionFr || (item as any).description_fr)) return item.descriptionFr || (item as any).description_fr;
    if (lang === 'ES' && (item.descriptionEs || (item as any).description_es)) return item.descriptionEs || (item as any).description_es;
    if (lang === 'MM' && (item.descriptionMm || item.description_mm)) return item.descriptionMm || item.description_mm;`
);

fs.writeFileSync('src/pizza/components/MenuGrid.tsx', menuGridCode, 'utf8');
console.log('✅ MenuGrid.tsx aggiornato con le 9 lingue!');
