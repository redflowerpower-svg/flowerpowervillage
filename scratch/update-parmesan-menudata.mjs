import fs from 'fs';
import path from 'path';

const menuDataPath = path.resolve('src/pizza/data/menuData.ts');
let content = fs.readFileSync(menuDataPath, 'utf8');

// Replace all occurrences of Parmigiano Reggiano / Double portion strings in ext-double-parmesan
const oldPattern = /"name":\s*"Parmesan",\s*"nameTh":\s*"[^"]*",\s*"nameIt":\s*"[^"]*",\s*"sku":\s*"ext-double-parmesan",\s*"price":\s*30,\s*"description_it":\s*"[^"]*",\s*"description_de":\s*"[^"]*",\s*"name_de":\s*"[^"]*",\s*"nameDe":\s*"[^"]*",\s*"name_it":\s*"[^"]*",\s*"nameMm":\s*"[^"]*",\s*"name_mm":\s*"[^"]*",\s*"nameEs":\s*"[^"]*",\s*"name_es":\s*"[^"]*",\s*"nameFr":\s*"[^"]*",\s*"nameRu":\s*"[^"]*",\s*"nameZh":\s*"[^"]*"/g;

const replacement = `"name": "Parmesan",
            "nameTh": "พาร์มิจาโน",
            "nameIt": "Parmigiano",
            "sku": "ext-double-parmesan",
            "price": 30,
            "description_it": "",
            "description_de": "",
            "name_de": "Parmesan",
            "nameDe": "Parmesan",
            "name_it": "Parmigiano",
            "nameMm": "ပါမာဂျာနို",
            "name_mm": "ပါမာဂျာနို",
            "nameEs": "Parmesano",
            "name_es": "Parmesano",
            "nameFr": "Parmesan",
            "nameRu": "Пармиджано",
            "nameZh": "帕尔马干酪"`;

const updatedContent = content.replace(oldPattern, replacement);
fs.writeFileSync(menuDataPath, updatedContent, 'utf8');
console.log('menuData.ts successfully updated for ext-double-parmesan!');
