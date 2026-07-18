import { menuData } from '../src/pizza/data/menuData.ts';
import fs from 'fs';

let csvContent = '\uFEFF'; // UTF-8 BOM
const headers = [
  'Tipo',
  'ID',
  'Parent ID',
  'Nome (EN)',
  'Nome (TH)',
  'Prezzo',
  'Modificatore Prezzo',
  'SKU',
  'Descrizione (EN)',
  'Descrizione (TH)',
  'Immagine (URL)',
  'Immagine (File)',
  'Icona Categoria',
  'Gruppo Extra Abilitati'
];
csvContent += headers.join(';') + '\n';

menuData.forEach(cat => {
  // 1. Write Category row
  const catRow = [
    'Categoria',
    cat.id,
    '',
    cat.name,
    cat.nameTh,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    cat.icon || '',
    ''
  ];
  csvContent += catRow.map(val => `"${String(val).replace(/"/g, '""').replace(/;/g, ' ')}"`).join(';') + '\n';

  cat.items.forEach(item => {
    // 2. Write Item row
    const itemRow = [
      'Piatto',
      item.id,
      cat.id,
      item.name,
      item.nameTh,
      item.price || '',
      '',
      item.sku || '',
      item.description || '',
      item.descriptionTh || '',
      item.image || '',
      item.image_file || '',
      '',
      item.allowed_extras_group || ''
    ];
    csvContent += itemRow.map(val => `"${String(val).replace(/"/g, '""').replace(/;/g, ' ').replace(/\n/g, ' ')}"`).join(';') + '\n';

    // 3. Write Variants
    if (item.variants && item.variants.length > 0) {
      item.variants.forEach(variant => {
        const variantRow = [
          'Variante',
          variant.id,
          item.id,
          variant.name,
          variant.nameTh,
          variant.price || '',
          variant.priceModifier || '0',
          variant.sku || '',
          '',
          '',
          '',
          '',
          '',
          ''
        ];
        csvContent += variantRow.map(val => `"${String(val).replace(/"/g, '""').replace(/;/g, ' ')}"`).join(';') + '\n';
      });
    }

    // 4. Write Extras
    if (item.extras && item.extras.length > 0) {
      item.extras.forEach(extra => {
        const extraRow = [
          'Extra',
          extra.id,
          item.id,
          extra.name,
          extra.nameTh,
          extra.price || '',
          '',
          extra.sku || '',
          '',
          '',
          '',
          '',
          '',
          ''
        ];
        csvContent += extraRow.map(val => `"${String(val).replace(/"/g, '""').replace(/;/g, ' ')}"`).join(';') + '\n';
      });
    }
  });
});

fs.writeFileSync('scratch/menu_delivery_completo.csv', csvContent, 'utf-8');
console.log("Esportazione piatta completata! File scritto in: scratch/menu_delivery_completo.csv");
