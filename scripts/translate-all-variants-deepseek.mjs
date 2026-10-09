import fs from 'fs';

let apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
if (!apiKey) {
  for (const envFile of ['.env.local', '.env']) {
    if (fs.existsSync(envFile)) {
      const lines = fs.readFileSync(envFile, 'utf8').split('\n');
      for (const line of lines) {
        const parts = line.split('=');
        if (parts.length >= 2 && parts[0].trim() === 'DEEPSEEK_API_KEY') {
          apiKey = parts.slice(1).join('=').trim();
          break;
        }
      }
    }
  }
}

if (!apiKey) {
  console.error('❌ DEEPSEEK_API_KEY not found in .env or .env.local!');
  process.exit(1);
}

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function callDeepSeek(systemPrompt, userPayload, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: typeof userPayload === 'string' ? userPayload : JSON.stringify(userPayload) }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const data = await res.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (err) {
      console.warn(`  ⚠️ Attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await sleep(1500 * attempt);
    }
  }
}

async function main() {
  console.log('🌐 Starting DeepSeek Multilingual Variants & Options Translation (Chunked)...');

  const menuFilePath = 'src/pizza/data/menuData.ts';
  const fileContent = fs.readFileSync(menuFilePath, 'utf8');

  // Extract all dishes with variants
  const marker = 'export const menuData: MenuCategory[] =';
  const idx = fileContent.indexOf(marker);
  if (idx === -1) throw new Error('Could not find menuData');

  const beforeMenu = fileContent.substring(0, idx);
  const afterMenu = fileContent.substring(idx + marker.length).trim();

  let bracketCount = 0;
  let endIdx = -1;
  for (let i = 0; i < afterMenu.length; i++) {
    if (afterMenu[i] === '[') bracketCount++;
    else if (afterMenu[i] === ']') {
      bracketCount--;
      if (bracketCount === 0) {
        endIdx = i;
        break;
      }
    }
  }

  const menuJsStr = afterMenu.substring(0, endIdx + 1);
  const trailingCode = afterMenu.substring(endIdx + 1);
  const menuCategories = new Function('return ' + menuJsStr)();

  // Collect all unique variant items across the menu
  const uniqueVariantsMap = new Map();
  menuCategories.forEach(cat => {
    cat.items.forEach(dish => {
      if (dish.variants && dish.variants.length > 0) {
        dish.variants.forEach(v => {
          if (!uniqueVariantsMap.has(v.id)) {
            uniqueVariantsMap.set(v.id, {
              id: v.id,
              name: v.name,
              nameIt: v.nameIt || v.name_it || '',
              nameEn: v.nameEn || v.name || '',
              nameTh: v.nameTh || '',
              nameMm: v.nameMm || v.name_mm || '',
              nameDe: v.nameDe || v.name_de || '',
              nameEs: v.nameEs || v.name_es || '',
              nameFr: v.nameFr || '',
              nameRu: v.nameRu || '',
              nameZh: v.nameZh || '',
              dishContext: dish.name
            });
          }
        });
      }
    });
  });

  const variantList = Array.from(uniqueVariantsMap.values());
  console.log(`Found ${variantList.length} unique variants to translate/audit.`);

  const sysPrompt = `You are a culinary translator for Flower Power Pizza & Bar in Ranong, Thailand.
Translate dish variant choices into all 9 supported languages:
IT (Italian), EN (English), TH (Thai), MM (Burmese), DE (German), ES (Spanish), FR (French), RU (Russian), ZH (Simplified Chinese).

RULES:
1. Output format JSON schema:
{
  "variants": [
    {
      "id": "...",
      "nameIt": "...",
      "nameEn": "...",
      "nameTh": "...",
      "nameMm": "...",
      "nameDe": "...",
      "nameEs": "...",
      "nameFr": "...",
      "nameRu": "...",
      "nameZh": "..."
    }
  ]
}
2. For Coca-Cola, Sprite, Fanta:
   - IT: "Coca-Cola", "Coca-Cola Zero", "Fanta Aranciata", "Sprite"
   - EN: "Coca-Cola", "Coca-Cola Zero", "Fanta Orange", "Sprite"
   - TH: "โค้ก (Coca-Cola)", "โค้ก ซีโร่ (Coca-Cola Zero)", "แฟนต้า ส้ม (Fanta Orange)", "สไปรท์ (Sprite)"
   - MM: "ကိုကာကိုလာ", "ကိုကာကိုလာ ဇီးရို", "ဖန်တာ လိမ္မော်", "စပရိုက်"
   - DE: "Coca-Cola", "Coca-Cola Zero", "Fanta Orange", "Sprite"
   - ES: "Coca-Cola", "Coca-Cola Zero", "Fanta Naranja", "Sprite"
   - FR: "Coca-Cola", "Coca-Cola Zéro", "Fanta Orange", "Sprite"
   - RU: "Кока-Кола", "Кока-Кола Зеро", "Фанта Апельсин", "Спрайт"
   - ZH: "可口可乐", "零度可口可乐", "芬达橙味", "雪碧"
3. For Big / Small (Water / Beer):
   - IT: "Grande", "Piccola"
   - EN: "Big", "Small"
   - TH: "ขวดใหญ่", "ขวดเล็ก"
   - MM: "အကြီး", "အသေး"
   - DE: "Groß", "Klein"
   - ES: "Grande", "Pequeña"
   - FR: "Grande", "Petite"
   - RU: "Большая", "Маленькая"
   - ZH: "大瓶", "小瓶"
4. For Hot / Iced:
   - IT: "Caldo", "Ghiacciato"
   - EN: "Hot", "Iced"
   - TH: "ร้อน", "เย็น"
   - MM: "အပူ", "အအေး"
   - DE: "Heiß", "Eisgekühlt"
   - ES: "Caliente", "Con Hielo"
   - FR: "Chaud", "Glacé"
   - RU: "Горячий", "Холодный со льдом"
   - ZH: "热", "冰"
5. For Normal / Banana / Yogurt:
   - IT: "Classico", "Banana", "Con Yogurt"
   - EN: "Normal", "Banana", "With Yogurt"
   - TH: "ธรรมดา", "กล้วย", "โยเกิร์ต"
   - MM: "ရိုးရိုး", "ငှက်ပျောသီး", "ဒိန်ချဉ်"
   - DE: "Normal", "Banane", "Mit Joghurt"
   - ES: "Clásico", "Plátano", "Con Yogur"
   - FR: "Nature", "Banane", "Au Yaourt"
   - RU: "Классический", "С бананом", "С йогуртом"
   - ZH: "原味", "香蕉", "酸奶"
`;

  const chunkSize = 15;
  const translatedVariantsMap = new Map();

  for (let i = 0; i < variantList.length; i += chunkSize) {
    const chunk = variantList.slice(i, i + chunkSize);
    console.log(`Translating batch ${i + 1} - ${Math.min(i + chunkSize, variantList.length)} of ${variantList.length}...`);
    const res = await callDeepSeek(sysPrompt, { variants: chunk });

    if (res && Array.isArray(res.variants)) {
      res.variants.forEach(v => translatedVariantsMap.set(v.id, v));
    }
    await sleep(200);
  }

  console.log(`Translated ${translatedVariantsMap.size} variants.`);

  // Update menuCategories
  menuCategories.forEach(cat => {
    cat.items.forEach(dish => {
      if (dish.variants && dish.variants.length > 0) {
        dish.variants = dish.variants.map(v => {
          const t = translatedVariantsMap.get(v.id);
          if (!t) return v;
          return {
            ...v,
            nameIt: t.nameIt || v.nameIt || v.name_it || v.name,
            name_it: t.nameIt || v.nameIt || v.name_it || v.name,
            nameEn: t.nameEn || v.nameEn || v.name,
            nameTh: t.nameTh || v.nameTh || v.name,
            name_th: t.nameTh || v.nameTh || v.name,
            nameMm: t.nameMm || v.nameMm || v.name_mm || v.name,
            name_mm: t.nameMm || v.nameMm || v.name_mm || v.name,
            nameDe: t.nameDe || v.nameDe || v.name_de || v.name,
            name_de: t.nameDe || v.nameDe || v.name_de || v.name,
            nameEs: t.nameEs || v.nameEs || v.name_es || v.name,
            name_es: t.nameEs || v.nameEs || v.name_es || v.name,
            nameFr: t.nameFr || v.nameFr || v.name,
            name_fr: t.nameFr || v.nameFr || v.name,
            nameRu: t.nameRu || v.nameRu || v.name,
            name_ru: t.nameRu || v.nameRu || v.name,
            nameZh: t.nameZh || v.nameZh || v.name,
            name_zh: t.nameZh || v.nameZh || v.name
          };
        });
      }
    });
  });

  const updatedMenuContent = `${beforeMenu}export const menuData: MenuCategory[] = ${JSON.stringify(menuCategories, null, 2)}${trailingCode}`;
  fs.writeFileSync(menuFilePath, updatedMenuContent, 'utf8');
  console.log('✅ Successfully updated menuData.ts with all 9-language variant translations!');

  // Also update EXTRAS_TRANSLATION_MAP
  const extrasMapPath = 'src/pizza/data/extrasTranslationMap.ts';
  let extrasMapContent = fs.readFileSync(extrasMapPath, 'utf8');

  translatedVariantsMap.forEach((t) => {
    const key = `'${t.id}'`;
    const entry = `  '${t.id}': {
    name: ${JSON.stringify(t.nameEn || t.nameIt)},
    nameIt: ${JSON.stringify(t.nameIt)},
    nameEn: ${JSON.stringify(t.nameEn)},
    nameTh: ${JSON.stringify(t.nameTh)},
    nameMm: ${JSON.stringify(t.nameMm)},
    nameDe: ${JSON.stringify(t.nameDe)},
    nameEs: ${JSON.stringify(t.nameEs)},
    nameFr: ${JSON.stringify(t.nameFr)},
    nameRu: ${JSON.stringify(t.nameRu)},
    nameZh: ${JSON.stringify(t.nameZh)}
  },`;

    if (extrasMapContent.includes(`'${t.id}':`)) {
      const reg = new RegExp(`'${t.id}':\\s*\\{[\\s\\S]*?\\},`, 'g');
      extrasMapContent = extrasMapContent.replace(reg, entry);
    } else {
      extrasMapContent = extrasMapContent.replace('export const EXTRAS_TRANSLATION_MAP: Record<string, any> = {', `export const EXTRAS_TRANSLATION_MAP: Record<string, any> = {\n${entry}`);
    }
  });

  fs.writeFileSync(extrasMapPath, extrasMapContent, 'utf8');
  console.log('✅ Successfully updated extrasTranslationMap.ts with all variant definitions!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
