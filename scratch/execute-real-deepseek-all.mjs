import fs from 'fs';
import path from 'path';

// 1. Read DeepSeek API Key from .env.local
let apiKey = '';
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2 && parts[0].trim() === 'DEEPSEEK_API_KEY') {
    apiKey = parts.slice(1).join('=').trim();
  }
});

if (!apiKey) {
  console.error('❌ DEEPSEEK_API_KEY not found in .env.local!');
  process.exit(1);
}

console.log('🔑 DeepSeek API Key successfully authenticated.');

const stats = {
  totalCalls: 0,
  totalPromptTokens: 0,
  totalCompletionTokens: 0,
  totalTokens: 0,
  startedAt: new Date().toISOString(),
  logs: []
};

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function callDeepSeekWithRetry(systemPrompt, userPayload, label = '', retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      stats.totalCalls++;
      const startTime = Date.now();
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
      const duration = Date.now() - startTime;
      const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

      stats.totalPromptTokens += usage.prompt_tokens || 0;
      stats.totalCompletionTokens += usage.completion_tokens || 0;
      stats.totalTokens += usage.total_tokens || 0;

      const rawContent = data.choices[0].message.content;
      const parsed = JSON.parse(rawContent);

      stats.logs.push({
        callIndex: stats.totalCalls,
        label,
        durationMs: duration,
        tokens: usage.total_tokens,
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens
      });

      console.log(`  ⚡ [DeepSeek API Call #${stats.totalCalls}] ${label} (${duration}ms) - Tokens: ${usage.total_tokens}`);
      return parsed;
    } catch (err) {
      console.warn(`  ⚠️ Attempt ${attempt}/${retries} failed for ${label}: ${err.message}`);
      if (attempt === retries) throw err;
      await sleep(1500 * attempt);
    }
  }
}

// -------------------------------------------------------------
// STEP 1: Translate i18n.ts (Line-by-Line Safe Parser)
// -------------------------------------------------------------
async function processI18n() {
  console.log('\n=============================================================');
  console.log('🌐 STEP 1: Translating i18n.ts with DeepSeek AI');
  console.log('=============================================================');

  const filePath = 'src/pizza/data/i18n.ts';
  const rawLines = fs.readFileSync(filePath, 'utf8').split('\n');

  const blocks = [];
  let current = null;

  for (let idx = 0; idx < rawLines.length; idx++) {
    const line = rawLines[idx];
    const trimmed = line.trim();

    if (trimmed.startsWith('IT:')) {
      const val = trimmed.replace(/^IT:\s*['"`]/, '').replace(/['"`],?\s*$/, '');
      current = { startIdx: idx, it: val };
    } else if (current && trimmed.startsWith('EN:')) {
      current.en = trimmed.replace(/^EN:\s*['"`]/, '').replace(/['"`],?\s*$/, '');
    } else if (current && trimmed.startsWith('TH:')) {
      current.th = trimmed.replace(/^TH:\s*['"`]/, '').replace(/['"`],?\s*$/, '');
    } else if (current && trimmed.startsWith('DE:')) {
      current.de = trimmed.replace(/^DE:\s*['"`]/, '').replace(/['"`],?\s*$/, '');
    } else if (current && trimmed.startsWith('MM:')) {
      current.mmIdx = idx;
    } else if (current && (trimmed.startsWith('}') || trimmed.startsWith('},'))) {
      current.endIdx = idx;
      if (current.it && current.en) {
        blocks.push(current);
      }
      current = null;
    }
  }

  console.log(`Found ${blocks.length} dictionary entries in i18n.ts`);

  const chunkSize = 20;
  const translations = new Map();

  for (let i = 0; i < blocks.length; i += chunkSize) {
    const chunk = blocks.slice(i, i + chunkSize);
    const payload = chunk.map((b, idx) => ({
      id: i + idx,
      en: b.en,
      it: b.it
    }));

    const result = await callDeepSeekWithRetry(
      'You are a professional Italian-to-Burmese culinary and UI translator. Translate each UI string into natural, authentic Burmese (Myanmar script မြန်မာစာ). Output JSON: { "items": [ { "id": number, "mm": "translated Burmese string" } ] }',
      { items: payload },
      `i18n chunk [${i + 1} - ${Math.min(i + chunkSize, blocks.length)} of ${blocks.length}]`
    );

    if (result && Array.isArray(result.items)) {
      result.items.forEach(it => {
        translations.set(it.id, it.mm);
      });
    }

    await sleep(200);
  }

  // Update lines
  const newLines = [...rawLines];
  for (let idx = blocks.length - 1; idx >= 0; idx--) {
    const b = blocks[idx];
    const trans = translations.get(idx);
    if (!trans) continue;

    const escaped = trans.replace(/'/g, "\\'");
    if (b.mmIdx !== undefined) {
      const indent = rawLines[b.mmIdx].match(/^\s*/)[0];
      newLines[b.mmIdx] = `${indent}MM: '${escaped}',`;
    } else {
      const indent = rawLines[b.startIdx].match(/^\s*/)[0];
      newLines.splice(b.endIdx, 0, `${indent}MM: '${escaped}',`);
    }
  }

  fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
  console.log('✅ i18n.ts completely translated and updated with DeepSeek API.');
}

// -------------------------------------------------------------
// STEP 2: Translate menuData.ts
// -------------------------------------------------------------
async function processMenuData() {
  console.log('\n=============================================================');
  console.log('🍕 STEP 2: Translating menuData.ts (Categories, Dishes, Extras) with DeepSeek');
  console.log('=============================================================');

  const filePath = 'src/pizza/data/menuData.ts';
  const raw = fs.readFileSync(filePath, 'utf8');

  const startMarker = 'export const menuData: MenuCategory[] =';
  const idx = raw.indexOf(startMarker);
  if (idx === -1) throw new Error('Could not find menuData declaration');

  const header = raw.substring(0, idx);
  const jsonText = raw.substring(idx + startMarker.length).trim().replace(/;$/, '');
  const menuCategories = JSON.parse(jsonText);

  // 1. Categories
  console.log(`Translating ${menuCategories.length} categories...`);
  const catPayload = menuCategories.map(c => ({
    id: c.id,
    nameIt: c.nameIt || c.name,
    nameEn: c.name,
    descIt: c.descriptionIt || c.description || '',
    descEn: c.description || ''
  }));

  const catResult = await callDeepSeekWithRetry(
    'Translate Italian restaurant menu categories to authentic Burmese (Myanmar script မြန်မာစာ). Output JSON format: { "categories": [ { "id": "...", "nameMm": "...", "descriptionMm": "..." } ] }',
    { categories: catPayload },
    `Categories (${menuCategories.length} items)`
  );

  if (catResult && Array.isArray(catResult.categories)) {
    catResult.categories.forEach(cRes => {
      const target = menuCategories.find(c => c.id === cRes.id);
      if (target) {
        target.nameMm = cRes.nameMm;
        target.name_mm = cRes.nameMm;
        if (cRes.descriptionMm) {
          target.descriptionMm = cRes.descriptionMm;
          target.description_mm = cRes.descriptionMm;
        }
      }
    });
  }

  // 2. All Dishes
  const allDishes = [];
  menuCategories.forEach(cat => {
    (cat.items || []).forEach(dish => {
      allDishes.push(dish);
    });
  });

  console.log(`Translating ${allDishes.length} dishes in batches with DeepSeek...`);
  const dishChunkSize = 8;

  for (let i = 0; i < allDishes.length; i += dishChunkSize) {
    const chunk = allDishes.slice(i, i + dishChunkSize);
    const payload = chunk.map(d => ({
      id: d.id,
      nameIt: d.nameIt || d.name,
      nameEn: d.name,
      descIt: d.descriptionIt || d.description,
      descEn: d.description
    }));

    const result = await callDeepSeekWithRetry(
      'You are an authentic Italian culinary translator. Translate the dish names and ingredients/descriptions into authentic, mouth-watering Burmese (Myanmar script မြန်မာစာ). Output JSON format: { "dishes": [ { "id": "...", "nameMm": "...", "descriptionMm": "..." } ] }',
      { dishes: payload },
      `Dishes batch [${i + 1} - ${Math.min(i + dishChunkSize, allDishes.length)} of ${allDishes.length}]`
    );

    if (result && Array.isArray(result.dishes)) {
      result.dishes.forEach(dRes => {
        const dish = allDishes.find(d => d.id === dRes.id);
        if (dish) {
          dish.nameMm = dRes.nameMm;
          dish.name_mm = dRes.nameMm;
          dish.descriptionMm = dRes.descriptionMm;
          dish.description_mm = dRes.descriptionMm;
        }
      });
    }

    await sleep(200);
  }

  // 3. Unique Variants & Extras
  const variantMap = new Map();
  const extraMap = new Map();

  allDishes.forEach(d => {
    (d.variants || []).forEach(v => {
      if (v.name && !variantMap.has(v.name)) {
        variantMap.set(v.name, { name: v.name, nameIt: v.nameIt || v.name });
      }
    });
    (d.extras || []).forEach(e => {
      if (e.name && !extraMap.has(e.name)) {
        extraMap.set(e.name, { name: e.name, nameIt: e.nameIt || e.name });
      }
    });
  });

  const uniqueVariants = Array.from(variantMap.values());
  const uniqueExtras = Array.from(extraMap.values());

  console.log(`Translating ${uniqueVariants.length} unique variants and ${uniqueExtras.length} unique extras...`);

  if (uniqueVariants.length > 0) {
    const varResult = await callDeepSeekWithRetry(
      'Translate food portion sizes and variant names to authentic Burmese (Myanmar script မြန်မာစာ). Output JSON format: { "variants": [ { "name": "...", "nameMm": "..." } ] }',
      { variants: uniqueVariants },
      `Variants (${uniqueVariants.length} items)`
    );

    if (varResult && Array.isArray(varResult.variants)) {
      const vLookup = new Map(varResult.variants.map(v => [v.name, v.nameMm]));
      allDishes.forEach(d => {
        (d.variants || []).forEach(v => {
          if (vLookup.has(v.name)) {
            v.nameMm = vLookup.get(v.name);
            v.name_mm = vLookup.get(v.name);
          }
        });
      });
    }
  }

  if (uniqueExtras.length > 0) {
    const extraChunkSize = 25;
    for (let i = 0; i < uniqueExtras.length; i += extraChunkSize) {
      const chunk = uniqueExtras.slice(i, i + extraChunkSize);
      const extResult = await callDeepSeekWithRetry(
        'Translate Italian restaurant extra toppings/ingredients to Burmese (Myanmar script မြန်မာစာ). Output JSON format: { "extras": [ { "name": "...", "nameMm": "..." } ] }',
        { extras: chunk },
        `Extras batch [${i + 1} - ${Math.min(i + extraChunkSize, uniqueExtras.length)} of ${uniqueExtras.length}]`
      );

      if (extResult && Array.isArray(extResult.extras)) {
        const eLookup = new Map(extResult.extras.map(e => [e.name, e.nameMm]));
        allDishes.forEach(d => {
          (d.extras || []).forEach(e => {
            if (eLookup.has(e.name)) {
              e.nameMm = eLookup.get(e.name);
              e.name_mm = eLookup.get(e.name);
            }
          });
        });
      }
      await sleep(200);
    }
  }

  const finalOutput = `${header}export const menuData: MenuCategory[] = ${JSON.stringify(menuCategories, null, 2)};\n`;
  fs.writeFileSync(filePath, finalOutput, 'utf8');
  console.log('✅ menuData.ts completely translated and updated with DeepSeek API.');
}

// -------------------------------------------------------------
// STEP 3: Translate wineData.tsx
// -------------------------------------------------------------
async function processWineData() {
  console.log('\n=============================================================');
  console.log('🍷 STEP 3: Translating wineData.tsx with DeepSeek AI');
  console.log('=============================================================');

  const filePath = 'src/pizza/data/wineData.tsx';
  const fileContent = fs.readFileSync(filePath, 'utf8');

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

  // Safely parse JS object array
  const wineList = new Function('return ' + winesJsStr)();
  console.log(`Translating ${wineList.length} wines in batches with DeepSeek...`);

  const wineChunkSize = 5;
  for (let i = 0; i < wineList.length; i += wineChunkSize) {
    const chunk = wineList.slice(i, i + wineChunkSize);
    const payload = chunk.map(w => ({
      id: w.id,
      title: w.title,
      subtitle: w.categorySubtitle || w.subtitleIt || '',
      descIt: w.descriptionIt || w.description,
      descEn: w.descriptionEn || w.description
    }));

    const result = await callDeepSeekWithRetry(
      'You are a professional Italian Sommelier and Burmese translator. Translate wine titles, subtitle classifications (e.g. RED WINE / ITALY - PUGLIA), and tasting notes/descriptions into prestigious Burmese (Myanmar script မြန်မာစာ). Output JSON format: { "wines": [ { "id": "...", "titleMm": "...", "subtitleMm": "...", "descriptionMm": "..." } ] }',
      { wines: payload },
      `Wines batch [${i + 1} - ${Math.min(i + wineChunkSize, wineList.length)} of ${wineList.length}]`
    );

    if (result && Array.isArray(result.wines)) {
      result.wines.forEach(wRes => {
        const wine = wineList.find(w => w.id === wRes.id);
        if (wine) {
          wine.titleMm = wRes.titleMm || wine.title;
          wine.subtitleMm = wRes.subtitleMm || wine.categorySubtitle;
          wine.descriptionMm = wRes.descriptionMm || wine.description;
        }
      });
    }

    await sleep(200);
  }

  const newWineContent = `${beforeWines}export const INITIAL_WINE_COLLECTION: WineCardData[] = ${JSON.stringify(wineList, null, 2)}${trailingCode}`;
  fs.writeFileSync(filePath, newWineContent, 'utf8');
  console.log('✅ wineData.tsx completely translated and updated with DeepSeek API.');
}

// -------------------------------------------------------------
// MAIN EXECUTION
// -------------------------------------------------------------
async function run() {
  const startTime = Date.now();
  console.log('🚀 STARTING COMPREHENSIVE DEEPSEEK TRANSLATION RUNNER');

  await processI18n();
  await processMenuData();
  await processWineData();

  stats.finishedAt = new Date().toISOString();
  stats.totalExecutionSeconds = Math.round((Date.now() - startTime) / 1000);

  // Write audit JSON & HTML report
  fs.writeFileSync('scratch/deepseek_burmese_audit.json', JSON.stringify(stats, null, 2), 'utf8');

  const htmlReport = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>DeepSeek Translation Audit Report - Burmese (MM)</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; }
    h1, h2 { color: #38bdf8; }
    .card { background: #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 20px; border: 1px solid #334155; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-box { background: #0284c7; padding: 16px; border-radius: 6px; font-size: 20px; font-weight: bold; }
    .stat-label { font-size: 13px; font-weight: normal; opacity: 0.9; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #334155; padding: 8px 12px; text-align: left; }
    th { background: #334155; }
  </style>
</head>
<body>
  <h1>📊 DeepSeek AI Real Batch Translation Audit</h1>
  <div class="stat-grid">
    <div class="stat-box">${stats.totalCalls} <div class="stat-label">Total API Calls to DeepSeek</div></div>
    <div class="stat-box">${stats.totalTokens.toLocaleString()} <div class="stat-label">Total Tokens Consumed</div></div>
    <div class="stat-box">${stats.totalPromptTokens.toLocaleString()} <div class="stat-label">Prompt Tokens</div></div>
    <div class="stat-box">${stats.totalCompletionTokens.toLocaleString()} <div class="stat-label">Completion Tokens</div></div>
    <div class="stat-box">${stats.totalExecutionSeconds}s <div class="stat-label">Total Duration</div></div>
  </div>
  <div class="card">
    <h2>Detailed API Calls Log (${stats.logs.length} requests)</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Label</th>
          <th>Duration (ms)</th>
          <th>Tokens</th>
        </tr>
      </thead>
      <tbody>
        ${stats.logs.map((l, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${l.label}</td>
            <td>${l.durationMs}ms</td>
            <td><strong>${l.tokens}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;

  fs.writeFileSync('scratch/deepseek_burmese_audit_report.html', htmlReport, 'utf8');

  console.log('\n=============================================================');
  console.log('🎉 DEEPSEEK BATCH TRANSLATION COMPLETED SUCCESSFULLY!');
  console.log(`📊 Total Real API Calls: ${stats.totalCalls}`);
  console.log(`📊 Total Tokens Used: ${stats.totalTokens.toLocaleString()}`);
  console.log(`⏱️ Duration: ${stats.totalExecutionSeconds}s`);
  console.log('📁 Reports saved to:');
  console.log('   - scratch/deepseek_burmese_audit.json');
  console.log('   - scratch/deepseek_burmese_audit_report.html');
  console.log('=============================================================');
}

run().catch(err => {
  console.error('❌ FATAL ERROR IN SCRIPT:', err);
  process.exit(1);
});
