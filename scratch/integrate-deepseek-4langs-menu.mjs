import fs from 'fs';
import { menuData } from '../src/pizza/data/menuData.ts';

console.log('🚀 Avvio integrazione traduzioni 4 lingue (ES, FR, RU, ZH) in menuData.ts...');

const dishesRaw = fs.readFileSync('scratch/deepseek_4langs_dishes.json', 'utf8');
const dishes = JSON.parse(dishesRaw);
const dishMap = new Map();
dishes.forEach(d => {
  dishMap.set(d.id, d);
});

console.log(`Caricate ${dishMap.size} schede tradotte.`);

const newInterfaces = `export interface ExtraOption {
  id: string;
  name: string;
  nameTh: string;
  nameIt?: string;
  nameDe?: string;
  nameMm?: string;
  nameEs?: string;
  nameFr?: string;
  nameRu?: string;
  nameZh?: string;
  name_it?: string;
  name_de?: string;
  name_mm?: string;
  sku: string;
  price: number;
  description_it?: string;
  description_de?: string;
  description_mm?: string;
  descriptionEs?: string;
  descriptionFr?: string;
  descriptionRu?: string;
  descriptionZh?: string;
}

export interface Variant {
  id: string;
  name: string;
  nameTh: string;
  nameIt?: string;
  nameDe?: string;
  nameMm?: string;
  nameEs?: string;
  nameFr?: string;
  nameRu?: string;
  nameZh?: string;
  name_it?: string;
  name_de?: string;
  name_mm?: string;
  sku: string;
  price: number;
  priceModifier: number;
  description_it?: string;
  description_de?: string;
  description_mm?: string;
  descriptionEs?: string;
  descriptionFr?: string;
  descriptionRu?: string;
  descriptionZh?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  nameTh: string;
  nameIt?: string;
  nameDe?: string;
  nameMm?: string;
  nameEs?: string;
  nameFr?: string;
  nameRu?: string;
  nameZh?: string;
  name_it?: string;
  name_de?: string;
  name_mm?: string;
  description: string;
  descriptionTh: string;
  descriptionIt?: string;
  descriptionDe?: string;
  descriptionMm?: string;
  descriptionEs?: string;
  descriptionFr?: string;
  descriptionRu?: string;
  descriptionZh?: string;
  description_it?: string;
  description_de?: string;
  description_mm?: string;
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
  nameIt?: string;
  nameDe?: string;
  nameMm?: string;
  nameEs?: string;
  nameFr?: string;
  nameRu?: string;
  nameZh?: string;
  name_it?: string;
  name_de?: string;
  name_mm?: string;
  description?: string;
  descriptionTh?: string;
  descriptionIt?: string;
  descriptionDe?: string;
  descriptionMm?: string;
  descriptionEs?: string;
  descriptionFr?: string;
  descriptionRu?: string;
  descriptionZh?: string;
  description_it?: string;
  description_de?: string;
  description_mm?: string;
  icon: string;
  items: MenuItem[];
}`;

let injectedCount = 0;
menuData.forEach(cat => {
  cat.items.forEach(item => {
    const tr = dishMap.get(item.id);
    if (tr) {
      if (tr.nameEs) item.nameEs = tr.nameEs;
      if (tr.descriptionEs) item.descriptionEs = tr.descriptionEs;
      if (tr.nameFr) item.nameFr = tr.nameFr;
      if (tr.descriptionFr) item.descriptionFr = tr.descriptionFr;
      if (tr.nameRu) item.nameRu = tr.nameRu;
      if (tr.descriptionRu) item.descriptionRu = tr.descriptionRu;
      if (tr.nameZh) item.nameZh = tr.nameZh;
      if (tr.descriptionZh) item.descriptionZh = tr.descriptionZh;
      injectedCount++;
    }
  });
});

console.log(`Iniezioni completate su ${injectedCount} piatti!`);

const finalOutput = `${newInterfaces}\n\nexport const menuData: MenuCategory[] = ${JSON.stringify(menuData, null, 2)};\n`;

fs.writeFileSync('src/pizza/data/menuData.ts', finalOutput, 'utf8');
console.log('🎉 menuData.ts aggiornato con successo!');
