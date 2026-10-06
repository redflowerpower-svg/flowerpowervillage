import fs from 'fs';
import path from 'path';

// 1. Load DeepSeek API Key from .env.local
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

console.log('✅ DeepSeek API Key loaded successfully. Starting batch translation pipeline...');

const auditLog = {
  startedAt: new Date().toISOString(),
  model: 'deepseek-chat',
  totalCalls: 0,
  totalPromptTokens: 0,
  totalCompletionTokens: 0,
  totalTokens: 0,
  calls: []
};

// Helper to call DeepSeek Chat API
async function callDeepSeek(systemPrompt, userPayload, label = '') {
  auditLog.totalCalls++;
  const startTime = Date.now();

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
          { role: 'user', content: JSON.stringify(userPayload) }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const duration = Date.now() - startTime;
    const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    auditLog.totalPromptTokens += usage.prompt_tokens || 0;
    auditLog.totalCompletionTokens += usage.completion_tokens || 0;
    auditLog.totalTokens += usage.total_tokens || 0;

    const parsedContent = JSON.parse(data.choices[0].message.content);

    auditLog.calls.push({
      label,
      durationMs: duration,
      usage,
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      response: parsedContent
    });

    console.log(`  [DeepSeek API 200 OK] ${label} (${duration}ms) - Tokens: ${usage.total_tokens}`);
    return parsedContent;
  } catch (err) {
    console.error(`  ❌ Error in callDeepSeek (${label}):`, err.message);
    throw err;
  }
}

// -----------------------------------------------------------------------------
// STEP 1: Translate i18n.ts
// -----------------------------------------------------------------------------
async function translateI18n() {
  console.log('\n--- Step 1: DeepSeek Translation of i18n.ts ---');
  const i18nPath = 'src/pizza/data/i18n.ts';
  let content = fs.readFileSync(i18nPath, 'utf8');

  // Find all objects with IT, EN, TH, DE, MM
  const blockRegex = /\{\s*IT:\s*(['"`])(.*?)\1,\s*EN:\s*(['"`])(.*?)\3,\s*TH:\s*(['"`])(.*?)\5,\s*DE:\s*(['"`])(.*?)\7(?:,\s*MM:\s*(['"`])(.*?)\9)?\s*\}/gs;

  const matches = [];
  let m;
  while ((m = blockRegex.exec(content)) !== null) {
    matches.push({
      fullMatch: m[0],
      it: m[2],
      en: m[4],
      th: m[6],
      de: m[8],
      currentMm: m[10] || ''
    });
  }

  console.log(`Found ${matches.length} multilingual strings in i18n.ts`);

  // Batch into chunks of 15
  const chunkSize = 15;
  const translationMap = new Map();

  for (let i = 0; i < matches.length; i += chunkSize) {
    const chunk = matches.slice(i, i + chunkSize);
    const batchPayload = chunk.map((item, idx) => ({
      index: i + idx,
      it: item.it,
      en: item.en
    }));

    const result = await callDeepSeek(
      'You are an expert translator for high-end Italian restaurant websites. Translate the following UI texts, button labels, and descriptions into authentic, natural Burmese (Myanmar script မြန်မာစာ). Output JSON with array "translations": [ { "index": number, "mm": "translated Burmese text" } ].',
      { items: batchPayload },
      `i18n chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(matches.length / chunkSize)}`
    );

    if (result && Array.isArray(result.translations)) {
      result.translations.forEach(t => {
        translationMap.set(t.index, t.mm);
      });
    }
  }

  // Replace in content
  let updatedContent = content;
  matches.forEach((item, idx) => {
    const newMm = translationMap.get(idx);
    if (newMm) {
      const escapedNewMm = newMm.replace(/'/g, "\\'");
      const newBlock = `{\n      IT: '${item.it.replace(/'/g, "\\'")}',\n      EN: '${item.en.replace(/'/g, "\\'")}',\n      TH: '${item.th.replace(/'/g, "\\'")}',\n      DE: '${item.de.replace(/'/g, "\\'")}',\n      MM: '${escapedNewMm}',\n    }`;
      updatedContent = updatedContent.replace(item.fullMatch, newBlock);
    }
  });

  fs.writeFileSync(i18nPath, updatedContent, 'utf8');
  console.log('✅ i18n.ts updated with DeepSeek translations.');
}

// -----------------------------------------------------------------------------
// STEP 2: Translate menuData.ts
// -----------------------------------------------------------------------------
async function translateMenuData() {
  console.log('\n--- Step 2: DeepSeek Translation of menuData.ts (Categories, Dishes, Extras) ---');
  const menuPath = 'src/pizza/data/menuData.ts';
  const rawFile = fs.readFileSync(menuPath, 'utf8');

  const idx = rawFile.indexOf('export const menuData: MenuCategory[] =');
  const prefix = rawFile.substring(0, idx);
  const jsonStr = rawFile.substring(idx + 'export const menuData: MenuCategory[] ='.length).trim().replace(/;$/, '');

  const categories = JSON.parse(jsonStr);

  // 1. Translate Categories
  console.log(`Translating ${categories.length} categories...`);
  const catPayload = categories.map(c => ({
    id: c.id,
    nameIt: c.nameIt || c.name,
    nameEn: c.name,
    descIt: c.descriptionIt || c.description,
    descEn: c.description
  }));

  const catResult = await callDeepSeek(
    'You are an expert Italian culinary translator. Translate Italian restaurant menu category titles and descriptions into authentic, natural Burmese (Myanmar script မြန်မာစာ). Output JSON object: { "categories": [ { "id": "...", "nameMm": "...", "descriptionMm": "..." } ] }',
    { categories: catPayload },
    'Categories Translation'
  );

  if (catResult && Array.isArray(catResult.categories)) {
    catResult.categories.forEach(tc => {
      const cat = categories.find(c => c.id === tc.id);
      if (cat) {
        cat.nameMm = tc.nameMm;
        cat.name_mm = tc.nameMm;
        cat.descriptionMm = tc.descriptionMm;
        cat.description_mm = tc.descriptionMm;
      }
    });
  }

  // 2. Flatten all dishes
  const allDishes = [];
  categories.forEach(cat => {
    if (Array.isArray(cat.items)) {
      cat.items.forEach(item => {
        allDishes.push({
          catId: cat.id,
          item
        });
      });
    }
  });

  console.log(`Found ${allDishes.length} total dishes to translate with DeepSeek AI.`);

  // Batch translate dishes in chunks of 8
  const dishChunkSize = 8;
  for (let i = 0; i < allDishes.length; i += dishChunkSize) {
    const chunk = allDishes.slice(i, i + dishChunkSize);
    const dishPayload = chunk.map(({ item }) => ({
      id: item.id,
      nameIt: item.nameIt || item.name,
      nameEn: item.name,
      descriptionIt: item.descriptionIt || item.description,
      descriptionEn: item.description,
      variants: item.variants ? item.variants.map(v => ({ id: v.id, name: v.name, nameIt: v.nameIt })) : undefined,
      extras: item.extras ? item.extras.map(e => ({ id: e.id, name: e.name, nameIt: e.nameIt })) : undefined
    }));

    const result = await callDeepSeek(
      `You are an authentic Italian culinary master translator and sommelier for a prestigious Italian pizzeria & restaurant in Thailand.
Translate Italian dish names, culinary descriptions, variants (e.g. sizes: Standard, Baby, Calzone), and extras/ingredients into fluent, appetizing, professional Burmese (Myanmar script မြန်မာစာ).
Ensure Italian culinary terms (like Tagliatelle, Nero di Seppia, Mozzarella di Bufala, Gorgonzola, Burrata, Tartufo) are phonetically rendered in Burmese alongside clear descriptive Burmese culinary phrasing.
Output JSON: { "dishes": [ { "id": "...", "nameMm": "...", "descriptionMm": "...", "variants": [ { "id": "...", "nameMm": "..." } ], "extras": [ { "id": "...", "nameMm": "..." } ] } ] }`,
      { dishes: dishPayload },
      `Dishes batch ${Math.floor(i / dishChunkSize) + 1}/${Math.ceil(allDishes.length / dishChunkSize)}`
    );

    if (result && Array.isArray(result.dishes)) {
      result.dishes.forEach(td => {
        const target = allDishes.find(d => d.item.id === td.id);
        if (target) {
          target.item.nameMm = td.nameMm;
          target.item.name_mm = td.nameMm;
          target.item.descriptionMm = td.descriptionMm;
          target.item.description_mm = td.descriptionMm;

          if (Array.isArray(td.variants) && Array.isArray(target.item.variants)) {
            td.variants.forEach(tv => {
              const v = target.item.variants.find(x => x.id === tv.id);
              if (v) {
                v.nameMm = tv.nameMm;
                v.name_mm = tv.nameMm;
              }
            });
          }

          if (Array.isArray(td.extras) && Array.isArray(target.item.extras)) {
            td.extras.forEach(te => {
              const ex = target.item.extras.find(x => x.id === te.id);
              if (ex) {
                ex.nameMm = te.nameMm;
                ex.name_mm = te.nameMm;
              }
            });
          }
        }
      });
    }
  }

  // Save back to menuData.ts
  const newContent = `${prefix}export const menuData: MenuCategory[] = ${JSON.stringify(categories, null, 2)};\n`;
  fs.writeFileSync(menuPath, newContent, 'utf8');
  console.log('✅ menuData.ts updated with DeepSeek translations for all categories, dishes, variants & extras.');
}

// -----------------------------------------------------------------------------
// STEP 3: Translate wineData.tsx
// -----------------------------------------------------------------------------
async function translateWineData() {
  console.log('\n--- Step 3: DeepSeek Translation of wineData.tsx (Sommelier Cards) ---');
  const winePath = 'src/pizza/data/wineData.tsx';
  let wineContent = fs.readFileSync(winePath, 'utf8');

  // Extract INITIAL_WINE_COLLECTION
  const collStart = wineContent.indexOf('export const INITIAL_WINE_COLLECTION: WineCardData[] = [');
  const collEnd = wineContent.indexOf('];', collStart);

  if (collStart === -1 || collEnd === -1) {
    console.error('Could not locate INITIAL_WINE_COLLECTION in wineData.tsx');
    return;
  }

  const arrayCode = wineContent.substring(collStart + 'export const INITIAL_WINE_COLLECTION: WineCardData[] = '.length, collEnd + 1);
  const wineArray = eval(`(${arrayCode})`);

  console.log(`Found ${wineArray.length} sommelier wine cards to translate with DeepSeek AI.`);

  const wineChunkSize = 6;
  for (let i = 0; i < wineArray.length; i += wineChunkSize) {
    const chunk = wineArray.slice(i, i + wineChunkSize);
    const winePayload = chunk.map(w => ({
      id: w.id,
      title: w.title,
      categorySubtitle: w.categorySubtitle,
      description: w.description,
      descriptionIt: w.descriptionIt,
      descriptionEn: w.descriptionEn
    }));

    const result = await callDeepSeek(
      `You are a professional Italian Sommelier and translator.
Translate wine titles, classifications, sommelier tasting notes, and food pairing descriptions into elegant, professional Burmese (Myanmar script မြန်မာစာ).
Output JSON: { "wines": [ { "id": "...", "titleMm": "...", "subtitleMm": "...", "descriptionMm": "..." } ] }`,
      { wines: winePayload },
      `Wines batch ${Math.floor(i / wineChunkSize) + 1}/${Math.ceil(wineArray.length / wineChunkSize)}`
    );

    if (result && Array.isArray(result.wines)) {
      result.wines.forEach(tw => {
        const w = wineArray.find(item => item.id === tw.id);
        if (w) {
          w.titleMm = tw.titleMm;
          w.subtitleMm = tw.subtitleMm;
          w.descriptionMm = tw.descriptionMm;
        }
      });
    }
  }

  // Replace INITIAL_WINE_COLLECTION in wineData.tsx
  const newWineCode = `export const INITIAL_WINE_COLLECTION: WineCardData[] = ${JSON.stringify(wineArray, null, 2)};`;
  wineContent = wineContent.substring(0, collStart) + newWineCode + wineContent.substring(collEnd + 2);
  fs.writeFileSync(winePath, wineContent, 'utf8');
  console.log('✅ wineData.tsx updated with DeepSeek translations for all sommelier cards.');
}

// -----------------------------------------------------------------------------
// STEP 4: Generate Audit Report HTML & JSON
// -----------------------------------------------------------------------------
function generateAuditReport() {
  auditLog.completedAt = new Date().toISOString();
  fs.writeFileSync('scratch/audit_traduzione_deepseek.json', JSON.stringify(auditLog, null, 2), 'utf8');

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>DeepSeek AI Translation Audit Report - Burmese (မြန်မာစာ)</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; }
    h1, h2 { color: #38bdf8; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 20px 0; }
    .stat-card { background: #1e293b; padding: 16px; border-radius: 8px; border: 1px solid #334155; }
    .stat-val { font-size: 24px; font-weight: bold; color: #22c55e; }
    .stat-label { font-size: 13px; color: #94a3b8; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; background: #1e293b; border-radius: 8px; overflow: hidden; }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #334155; font-size: 13px; }
    th { background: #0f172a; color: #94a3b8; }
    pre { margin: 0; background: #0b0f19; padding: 8px; border-radius: 4px; overflow-x: auto; max-height: 200px; font-size: 12px; color: #cbd5e1; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background: #15803d; color: white; }
  </style>
</head>
<body>
  <h1>🔍 DeepSeek AI Translation Audit Report</h1>
  <p>Lingua di destinazione: <strong>Burmese / မြန်မာစာ (MM)</strong> | Modello: <strong>${auditLog.model}</strong></p>
  
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Chiamate API Totali</div>
      <div class="stat-val">${auditLog.totalCalls}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Token Prompt</div>
      <div class="stat-val">${auditLog.totalPromptTokens.toLocaleString()}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Token Risposta</div>
      <div class="stat-val">${auditLog.totalCompletionTokens.toLocaleString()}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Token Totali Consumati</div>
      <div class="stat-val">${auditLog.totalTokens.toLocaleString()}</div>
    </div>
  </div>

  <h2>Dettaglio Chiamate Batch</h2>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Batch / Sezione</th>
        <th>Stato</th>
        <th>Tempo</th>
        <th>Token (Prompt / Compl / Tot)</th>
        <th>Risposta Generata</th>
      </tr>
    </thead>
    <tbody>
      ${auditLog.calls.map((c, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${c.label}</strong></td>
          <td><span class="badge">200 OK</span></td>
          <td>${c.durationMs} ms</td>
          <td>${c.promptTokens} / ${c.completionTokens} / <strong>${c.totalTokens}</strong></td>
          <td><pre>${escapeHtml(JSON.stringify(c.response, null, 2))}</pre></td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;

  fs.writeFileSync('scratch/audit_traduzione_deepseek.html', html, 'utf8');
  console.log('✅ Audit report written to scratch/audit_traduzione_deepseek.json and scratch/audit_traduzione_deepseek.html');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// -----------------------------------------------------------------------------
// MAIN EXECUTION
// -----------------------------------------------------------------------------
async function run() {
  console.log('===========================================================');
  console.log('🚀 DEEPSEEK AI BATCH TRANSLATION PIPELINE: BURMESE (မြန်မာစာ)');
  console.log('===========================================================');

  await translateI18n();
  await translateMenuData();
  await translateWineData();
  generateAuditReport();

  console.log('\n🎉 TRANSLATION PIPELINE COMPLETE!');
  console.log(`Total DeepSeek API Calls: ${auditLog.totalCalls}`);
  console.log(`Total Tokens Consumed: ${auditLog.totalTokens}`);
}

run().catch(err => {
  console.error('Fatal error in translation pipeline:', err);
  process.exit(1);
});
