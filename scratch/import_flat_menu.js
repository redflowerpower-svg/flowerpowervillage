import fs from 'fs';

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ';' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

try {
  const fileContent = fs.readFileSync('scratch/menu_delivery_completo.csv', 'utf-8');
  const lines = fileContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Remove BOM if present
  if (lines[0] && lines[0].startsWith('\uFEFF')) {
    lines[0] = lines[0].substring(1);
  }
  
  const categories = [];
  let currentCategory = null;
  let currentItem = null;
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 2) continue;
    
    const type = values[0];
    const id = values[1];
    const parentId = values[2];
    const name = values[3];
    const nameTh = values[4];
    const price = values[5];
    const priceModifier = values[6];
    const sku = values[7];
    const desc = values[8];
    const descTh = values[9];
    const imgUrl = values[10];
    const imgFile = values[11];
    const icon = values[12];
    const extrasGroup = values[13];
    
    if (type === 'Categoria') {
      currentCategory = {
        id,
        name,
        nameTh,
        icon,
        items: []
      };
      categories.push(currentCategory);
      currentItem = null;
    } else if (type === 'Piatto') {
      if (!currentCategory) {
        console.error(`Errore riga ${i + 1}: Trovato piatto prima di una categoria!`);
        continue;
      }
      currentItem = {
        id,
        name,
        nameTh,
        description: desc,
        descriptionTh: descTh,
        price: price ? Number(price) : 0,
        image: imgUrl,
        image_file: imgFile,
        sku
      };
      if (extrasGroup) {
        currentItem.allowed_extras_group = extrasGroup;
      }
      currentCategory.items.push(currentItem);
    } else if (type === 'Variante') {
      if (!currentItem) {
        console.error(`Errore riga ${i + 1}: Trovata variante prima di un piatto!`);
        continue;
      }
      if (!currentItem.variants) {
        currentItem.variants = [];
      }
      currentItem.variants.push({
        id,
        name,
        nameTh,
        sku,
        price: price ? Number(price) : 0,
        priceModifier: priceModifier ? Number(priceModifier) : 0
      });
    } else if (type === 'Extra') {
      if (!currentItem) {
        console.error(`Errore riga ${i + 1}: Trovato extra prima di un piatto!`);
        continue;
      }
      if (!currentItem.extras) {
        currentItem.extras = [];
      }
      currentItem.extras.push({
        id,
        name,
        nameTh,
        sku,
        price: price ? Number(price) : 0
      });
    }
  }

  // Generate target code content for menuData.ts
  const codeHeader = `export interface ExtraOption {
  id: string;
  name: string;
  nameTh: string;
  sku: string;
  price: number;
}

export interface Variant {
  id: string;
  name: string;
  nameTh: string;
  sku: string;
  price: number;
  priceModifier: number;
}

export interface MenuItem {
  id: string;
  name: string;
  nameTh: string;
  description: string;
  descriptionTh: string;
  price: number;
  image: string;
  image_file?: string;
  sku?: string;
  variants?: Variant[];
  extras?: ExtraOption[];
  allowed_extras_group?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  nameTh: string;
  icon: string;
  items: MenuItem[];
}

export const menuData: MenuCategory[] = `;

  const formattedJson = JSON.stringify(categories, null, 2);
  const fullCode = codeHeader + formattedJson + ';\n';
  
  fs.writeFileSync('src/pizza/data/menuData.ts', fullCode, 'utf-8');
  console.log("Importazione completata con successo! menuData.ts aggiornato.");
} catch (e) {
  console.error("Errore durante l'importazione:", e);
}
