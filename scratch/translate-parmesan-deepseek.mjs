import fs from 'fs';

let apiKey = process.env.DEEPSEEK_API_KEY || '';
if (!apiKey) {
  const envPath = fs.existsSync('.env.local') ? '.env.local' : '.env';
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2 && parts[0].trim() === 'DEEPSEEK_API_KEY') {
        apiKey = parts.slice(1).join('=').trim();
      }
    });
  }
}

const missingItems = [
  { id: '10171', name: 'Parmesan / Parmigiano Reggiano Cheese', nameIt: 'Parmigiano Reggiano', nameTh: 'พาร์เมซานชีส' },
  { id: 'ext-double-parmesan', name: 'Parmesan / Parmigiano Reggiano (Double Portion)', nameIt: 'Doppio Parmigiano Reggiano', nameTh: 'พาร์เมซานชีสเพิ่ม' },
  { id: 'sauce-ketchup', name: 'Ketchup', nameIt: 'Ketchup', nameTh: 'ซอสมะเขือเทศ' },
  { id: 'ext-bacon', name: 'Crispy Bacon', nameIt: 'Pancetta Croccante', nameTh: 'เบคอนกรอบ' },
  { id: 'fruit-pineapple', name: 'Fresh Pineapple', nameIt: 'Ananas Fresco', nameTh: 'สับปะรดสด' }
];

const prompt = `You are an expert Italian culinary translator. Translate the following extra topping items into 9 languages (IT, EN, TH, MM, DE, ES, FR, RU, ZH).
For Parmesan / Parmigiano Reggiano, ensure you capture the authentic Italian cheese culinary meaning in each language:
- IT: Parmigiano Reggiano
- EN: Parmigiano Reggiano (Parmesan)
- FR: Parmesan (Parmigiano Reggiano)
- ES: Queso Parmesano (Parmigiano Reggiano)
- DE: Parmesankäse (Parmigiano)
- RU: Сыр Пармезан (Пармиджано)
- ZH: 帕尔马干酪 (帕玛森奶酪)
- TH: พาร์เมซานชีส (พาร์มิจาโน)
- MM: ပါမာဇန် ဒိန်ခဲ

Items to translate:
${JSON.stringify(missingItems, null, 2)}

Return strictly JSON with keys corresponding to the IDs:
{
  "[id]": {
    "name": "English",
    "nameIt": "Italian",
    "nameTh": "Thai",
    "nameMm": "Burmese",
    "nameDe": "German",
    "nameEs": "Spanish",
    "nameFr": "French",
    "nameRu": "Russian",
    "nameZh": "Simplified Chinese"
  }
}`;

async function main() {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a professional Italian restaurant translator. Return strictly valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`DeepSeek error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const translations = JSON.parse(data.choices[0].message.content);
  console.log('Translations from DeepSeek:', JSON.stringify(translations, null, 2));

  // 1. Update translated_extras_dictionary.json
  const dictPath = 'scratch/translated_extras_dictionary.json';
  const dict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
  Object.assign(dict, translations);
  fs.writeFileSync(dictPath, JSON.stringify(dict, null, 2), 'utf8');

  // 2. Update extrasTranslationMap.ts
  const mapPath = 'src/pizza/data/extrasTranslationMap.ts';
  fs.writeFileSync(mapPath, `export const EXTRAS_TRANSLATION_MAP: Record<string, Record<string, string>> = ${JSON.stringify(dict, null, 2)};\n`, 'utf8');
  console.log('✅ Updated extrasTranslationMap.ts');

  // 3. Update menuData.ts
  const menuDataPath = 'src/pizza/data/menuData.ts';
  const fileContent = fs.readFileSync(menuDataPath, 'utf8');
  const prefix = 'export const menuData: MenuCategory[] = ';
  const splitIndex = fileContent.indexOf(prefix);
  const header = fileContent.substring(0, splitIndex + prefix.length);
  const jsonPart = fileContent.substring(splitIndex + prefix.length).trim().replace(/;$/, '');
  const menuData = JSON.parse(jsonPart);

  let updatedCount = 0;
  menuData.forEach(cat => {
    cat.items.forEach(item => {
      (item.extras || []).forEach(e => {
        if (dict[e.id]) {
          const t = dict[e.id];
          e.nameIt = t.nameIt;
          e.name_it = t.nameIt;
          e.nameTh = t.nameTh;
          e.nameMm = t.nameMm;
          e.name_mm = t.nameMm;
          e.nameDe = t.nameDe;
          e.name_de = t.nameDe;
          e.nameEs = t.nameEs;
          e.name_es = t.nameEs;
          e.nameFr = t.nameFr;
          e.nameRu = t.nameRu;
          e.nameZh = t.nameZh;
          updatedCount++;
        }
      });
    });
  });

  fs.writeFileSync(menuDataPath, header + JSON.stringify(menuData, null, 2) + ';\n', 'utf8');
  console.log(`✅ Updated ${updatedCount} extras in menuData.ts`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
