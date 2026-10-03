import fs from 'fs';
import path from 'path';

const menuDataPath = path.resolve(process.cwd(), 'src/pizza/data/menuData.ts');
let fileContent = fs.readFileSync(menuDataPath, 'utf8');

const prefixMatch = fileContent.match(/export const menuData: MenuCategory\[\] = (\[[\s\S]*\]);/);
if (!prefixMatch) {
  console.error('Non riesco a trovare menuData');
  process.exit(1);
}

const categories = JSON.parse(prefixMatch[1]);

// Map of updated titles for dishes
const TITLE_UPDATES = {
  // 1. Focacce (remove pizza sandwich, use FOCACCIA\nCON ...)
  "focaccia-pizza-sandwich-con-finocchiona": {
    nameIt: "FOCACCIA\nCON FINOCCHIONA",
    name_it: "FOCACCIA\nCON FINOCCHIONA",
    nameEn: "FOCACCIA\nWITH TUSCAN FINOCCHIONA",
    name: "FOCACCIA\nWITH TUSCAN FINOCCHIONA",
    nameTh: "ฟอคคาเซีย\nพร้อมซาลามีฟินอคคิโอนา",
    nameDe: "FOCACCIA\nMIT TOSKANISCHER FINOCCHIONA",
    name_de: "FOCACCIA\nMIT TOSKANISCHER FINOCCHIONA"
  },
  "focaccia-pizza-sandwich-con-pancetta-arrotolata": {
    nameIt: "FOCACCIA\nCON PANCETTA ARROTOLATA",
    name_it: "FOCACCIA\nCON PANCETTA ARROTOLATA",
    nameEn: "FOCACCIA\nWITH ROLLED PANCETTA",
    name: "FOCACCIA\nWITH ROLLED PANCETTA",
    nameTh: "ฟอคคาเซีย\nพร้อมปานเชตตาม้วนอิตาเลียน",
    nameDe: "FOCACCIA\nMIT GEROLLTER PANCETTA",
    name_de: "FOCACCIA\nMIT GEROLLTER PANCETTA"
  },
  "focaccia-pizza-sandwich-con-porchetta": {
    nameIt: "FOCACCIA\nCON PORCHETTA",
    name_it: "FOCACCIA\nCON PORCHETTA",
    nameEn: "FOCACCIA\nWITH ROASTED PORCHETTA",
    name: "FOCACCIA\nWITH ROASTED PORCHETTA",
    nameTh: "ฟอคคาเซีย\nพร้อมหมูอบพอร์เคตตา",
    nameDe: "FOCACCIA\nMIT GEBRATENER PORCHETTA",
    name_de: "FOCACCIA\nMIT GEBRATENER PORCHETTA"
  },
  "focaccia-pizza-sandwich-con-prosciutto-cotto": {
    nameIt: "FOCACCIA\nCON PROSCIUTTO COTTO",
    name_it: "FOCACCIA\nCON PROSCIUTTO COTTO",
    nameEn: "FOCACCIA\nWITH COOKED HAM",
    name: "FOCACCIA\nWITH COOKED HAM",
    nameTh: "ฟอคคาเซีย\nพร้อมแฮมสุกโปรชุตโต คอตโต",
    nameDe: "FOCACCIA\nMIT GEKOCHTEM SCHINKEN",
    name_de: "FOCACCIA\nMIT GEKOCHTEM SCHINKEN"
  },
  "focaccia-pizza-sandwich-con-salame": {
    nameIt: "FOCACCIA\nCON SALAME",
    name_it: "FOCACCIA\nCON SALAME",
    nameEn: "FOCACCIA\nWITH ITALIAN SALAMI",
    name: "FOCACCIA\nWITH ITALIAN SALAMI",
    nameTh: "ฟอคคาเซีย\nพร้อมซาลามีอิตาเลียน",
    nameDe: "FOCACCIA\nMIT ITALIENISCHER SALAMI",
    name_de: "FOCACCIA\nMIT ITALIENISCHER SALAMI"
  },

  // 2. Torta Pasqualina
  "torta-pasqualina-agli-spinaci-e-uova": {
    nameIt: "TORTA PASQUALINA\nAGLI SPINACI E UOVA",
    name_it: "TORTA PASQUALINA\nAGLI SPINACI E UOVA",
    nameEn: "TORTA PASQUALINA\nWITH SPINACH, RICOTTA & EGGS",
    name: "TORTA PASQUALINA\nWITH SPINACH, RICOTTA & EGGS",
    nameTh: "ตอร์ตา ปาสควาลินา\nไส้ผักโขม ริคอตต้า และไข่ต้ม",
    nameDe: "TORTA PASQUALINA\nMIT SPINAT, RICOTTA & EIERN",
    name_de: "TORTA PASQUALINA\nMIT SPINAT, RICOTTA & EIERN"
  },

  // 3. Tagliatelle al nero di seppia e calamari
  "tagliatelle-al-nero-di-seppia-e-calamari": {
    nameIt: "TAGLIATELLE\nAL NERO DI SEPPIA E CALAMARI",
    name_it: "TAGLIATELLE\nAL NERO DI SEPPIA E CALAMARI",
    nameEn: "TAGLIATELLE\nWITH SQUID INK & SQUID",
    name: "TAGLIATELLE\nWITH SQUID INK & SQUID",
    nameTh: "ตัลยาเตลเล่\nซอสหมึกดำและปลาหมึก",
    nameDe: "TAGLIATELLE\nMIT TINTENFISCHTINTE & KALMAREN",
    name_de: "TAGLIATELLE\nMIT TINTENFISCHTINTE & KALMAREN"
  },

  // 4. Spaghetti alla polpa di granchio
  "spaghetti-alla-polpa-di-granchio": {
    nameIt: "SPAGHETTI\nALLA POLPA DI GRANCHIO",
    name_it: "SPAGHETTI\nALLA POLPA DI GRANCHIO",
    nameEn: "SPAGHETTI\nWITH REAL CRAB MEAT",
    name: "SPAGHETTI\nWITH REAL CRAB MEAT",
    nameTh: "สปาเก็ตตี้\nเนื้อปูม้าสดและมะเขือเทศเชอร์รี่",
    nameDe: "SPAGHETTI\nMIT FRISCHEM KRABBENFLEISCH",
    name_de: "SPAGHETTI\nMIT FRISCHEM KRABBENFLEISCH"
  }
};

for (const cat of categories) {
  for (const item of cat.items) {
    if (TITLE_UPDATES[item.id]) {
      Object.assign(item, TITLE_UPDATES[item.id]);
      console.log(`Aggiornato titolo per ${item.id} in categoria ${cat.id}`);
    }
  }
}

const updatedJson = JSON.stringify(categories, null, 2);
const updatedFileContent = fileContent.replace(
  /export const menuData: MenuCategory\[\] = \[[\s\S]*\];/,
  `export const menuData: MenuCategory[] = ${updatedJson};`
);

fs.writeFileSync(menuDataPath, updatedFileContent, 'utf8');
console.log('✅ menuData.ts aggiornato con tutti i titoli corretti su due righe!');
