import fs from 'fs';
import path from 'path';

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
  console.log('🍷 Starting DeepSeek Sommelier Wine Catalog Translation...');
  const wineFilePath = 'src/pizza/data/wineData.tsx';
  const fileContent = fs.readFileSync(wineFilePath, 'utf8');

  const marker = 'export const INITIAL_WINE_COLLECTION: WineCardData[] =';
  const idx = fileContent.indexOf(marker);
  if (idx === -1) throw new Error('Could not find INITIAL_WINE_COLLECTION');

  const beforeWines = fileContent.substring(0, idx);
  const afterWines = fileContent.substring(idx + marker.length).trim();

  let bracketCount = 0;
  let endIdx = -1;
  for (let i = 0; i < afterWines.length; i++) {
    if (afterWines[i] === '[') bracketCount++;
    else if (afterWines[i] === ']') {
      bracketCount--;
      if (bracketCount === 0) {
        endIdx = i;
        break;
      }
    }
  }

  const winesJsStr = afterWines.substring(0, endIdx + 1);
  const trailingCode = afterWines.substring(endIdx + 1);
  const wineList = new Function('return ' + winesJsStr)();

  console.log(`Loaded ${wineList.length} wines from wineData.tsx.`);

  const TARGET_LANGUAGES = [
    { code: 'MM', name: 'Burmese', native: 'မြန်မာစာ', fieldKey: 'Mm' },
    { code: 'ZH', name: 'Chinese (Simplified)', native: '中文', fieldKey: 'Zh' },
    { code: 'RU', name: 'Russian', native: 'Русский', fieldKey: 'Ru' },
    { code: 'FR', name: 'French', native: 'Français', fieldKey: 'Fr' },
    { code: 'ES', name: 'Spanish', native: 'Español', fieldKey: 'Es' },
    { code: 'DE', name: 'German', native: 'Deutsch', fieldKey: 'De' },
    { code: 'TH', name: 'Thai', native: 'ไทย', fieldKey: 'Th' },
    { code: 'EN', name: 'English', native: 'English', fieldKey: 'En' },
    { code: 'IT', name: 'Italian', native: 'Italiano', fieldKey: 'It' }
  ];

  for (const lang of TARGET_LANGUAGES) {
    const titleKey = `title${lang.fieldKey}`;
    const subtitleKey = `subtitle${lang.fieldKey}`;
    const descKey = `description${lang.fieldKey}`;

    const needsTranslation = wineList.filter(w => !w[titleKey] || !w[subtitleKey] || !w[descKey]);
    console.log(`\n🌐 Processing [${lang.code}] (${lang.name}): ${needsTranslation.length} wines need translation out of ${wineList.length}`);

    if (needsTranslation.length === 0) {
      console.log(`  ✅ [${lang.code}] is already 100% complete.`);
      continue;
    }

    const chunkSize = 5;
    for (let c = 0; c < needsTranslation.length; c += chunkSize) {
      const chunk = needsTranslation.slice(c, c + chunkSize);
      const payload = chunk.map(w => ({
        id: w.id,
        title: w.title,
        titleIt: w.titleIt,
        subtitleIt: w.subtitleIt || w.categorySubtitle || '',
        flag: w.flag,
        categoryType: w.categoryType,
        descIt: w.descriptionIt || w.description,
        descEn: w.descriptionEn || w.description
      }));

      const sysPrompt = `You are a master Italian sommelier and professional multilingual culinary translator for Flower Power Pizza & Wine Bar in Ranong, Thailand.
Translate wine titles, subtitle classifications, and tasting notes into prestigious ${lang.name} (${lang.native}).

RULES:
1. Output format: JSON with schema: { "wines": [ { "id": "...", "title": "Line1\\nLine2\\nLine3", "subtitle": "WINETYPE\\nCOUNTRY - REGION", "description": "Tasting notes..." } ] }
2. For title:
   - Line 1: Grape / Denomination (Keep UPPERCASE)
   - Line 2: Details / Classification (DOC/IGT/Reserva or translation in target language)
   - Line 3: Producer / Brand
3. For subtitle:
   - Line 1: Wine type (e.g. RED WINE, WHITE WINE, ROSÉ WINE, SPARKLING WINE translated in ${lang.name})
   - Line 2: Country & Region (e.g. "COUNTRY - REGION" in ${lang.name})
4. For description:
   - Write elegant, evocative, professional sommelier tasting notes and pairing suggestions in fluent ${lang.name}.
`;

      console.log(`  Translating batch ${c + 1} - ${Math.min(c + chunkSize, needsTranslation.length)} of ${needsTranslation.length} for [${lang.code}]...`);
      const res = await callDeepSeek(sysPrompt, { wines: payload });

      if (res && Array.isArray(res.wines)) {
        res.wines.forEach(wRes => {
          const wine = wineList.find(w => w.id === wRes.id);
          if (wine) {
            if (wRes.title) wine[titleKey] = wRes.title;
            if (wRes.subtitle) wine[subtitleKey] = wRes.subtitle;
            if (wRes.description) wine[descKey] = wRes.description;
          }
        });
      }

      await sleep(300);
    }
  }

  // Ensure default fallback fields (title, categorySubtitle, description)
  wineList.forEach(w => {
    if (!w.titleIt) w.titleIt = w.title;
    if (!w.titleEn) w.titleEn = w.title;
    if (!w.subtitleIt) w.subtitleIt = w.categorySubtitle;
    if (!w.subtitleEn) w.subtitleEn = w.categorySubtitle;
    if (!w.descriptionIt) w.descriptionIt = w.description;
    if (!w.descriptionEn) w.descriptionEn = w.description;
  });

  const updatedFileContent = `${beforeWines}export const INITIAL_WINE_COLLECTION: WineCardData[] = ${JSON.stringify(wineList, null, 2)}${trailingCode}`;
  fs.writeFileSync(wineFilePath, updatedFileContent, 'utf8');
  console.log('\n🎉 ALL WINES IN INITIAL_WINE_COLLECTION SUCCESSFULLY TRANSLATED INTO ALL 9 LANGUAGES!');
}

main().catch(err => {
  console.error('❌ Error translating wines:', err);
  process.exit(1);
});
