import fs from 'fs';
import path from 'path';

/**
 * =============================================================================
 * 🌐 UNIVERSAL DEEPSEEK AI FULL-SITE TRANSLATOR
 * =============================================================================
 * Usage:
 *   node scripts/deepseek-universal-translator.mjs --lang=FR
 *   node scripts/deepseek-universal-translator.mjs --lang=RUSSO
 *   node scripts/deepseek-universal-translator.mjs --lang=CHINESE
 *   node scripts/deepseek-universal-translator.mjs --code=ES --name="Spanish" --native="Español" --flag="🇪🇸"
 * =============================================================================
 */

// Supported Language Dictionary Presets
const PRESETS = {
  FR: { code: 'FR', name: 'French', native: 'Français', flag: '🇫🇷', fieldKey: 'Fr', script: 'Latin' },
  FRENCH: { code: 'FR', name: 'French', native: 'Français', flag: '🇫🇷', fieldKey: 'Fr', script: 'Latin' },
  FRANCESE: { code: 'FR', name: 'French', native: 'Français', flag: '🇫🇷', fieldKey: 'Fr', script: 'Latin' },

  RU: { code: 'RU', name: 'Russian', native: 'Русский', flag: '🇷🇺', fieldKey: 'Ru', script: 'Cyrillic' },
  RUSSIAN: { code: 'RU', name: 'Russian', native: 'Русский', flag: '🇷🇺', fieldKey: 'Ru', script: 'Cyrillic' },
  RUSSO: { code: 'RU', name: 'Russian', native: 'Русский', flag: '🇷🇺', fieldKey: 'Ru', script: 'Cyrillic' },

  ZH: { code: 'ZH', name: 'Chinese (Simplified)', native: '中文', flag: '🇨🇳', fieldKey: 'Zh', script: 'Hanzi' },
  CHINESE: { code: 'ZH', name: 'Chinese (Simplified)', native: '中文', flag: '🇨🇳', fieldKey: 'Zh', script: 'Hanzi' },
  CINESE: { code: 'ZH', name: 'Chinese (Simplified)', native: '中文', flag: '🇨🇳', fieldKey: 'Zh', script: 'Hanzi' },

  JA: { code: 'JA', name: 'Japanese', native: '日本語', flag: '🇯🇵', fieldKey: 'Ja', script: 'Japanese' },
  JAPANESE: { code: 'JA', name: 'Japanese', native: '日本語', flag: '🇯🇵', fieldKey: 'Ja', script: 'Japanese' },
  GIAPPONESE: { code: 'JA', name: 'Japanese', native: '日本語', flag: '🇯🇵', fieldKey: 'Ja', script: 'Japanese' },

  ES: { code: 'ES', name: 'Spanish', native: 'Español', flag: '🇪🇸', fieldKey: 'Es', script: 'Latin' },
  SPANISH: { code: 'ES', name: 'Spanish', native: 'Español', flag: '🇪🇸', fieldKey: 'Es', script: 'Latin' },
  SPAGNOLO: { code: 'ES', name: 'Spanish', native: 'Español', flag: '🇪🇸', fieldKey: 'Es', script: 'Latin' },

  EL: { code: 'EL', name: 'Greek', native: 'Ελληνικά', flag: '🇬🇷', fieldKey: 'El', script: 'Greek' },
  GREEK: { code: 'EL', name: 'Greek', native: 'Ελληνικά', flag: '🇬🇷', fieldKey: 'El', script: 'Greek' },
  GRECO: { code: 'EL', name: 'Greek', native: 'Ελληνικά', flag: '🇬🇷', fieldKey: 'El', script: 'Greek' },

  MM: { code: 'MM', name: 'Burmese', native: 'မြန်မာစာ', flag: '🇲🇲', fieldKey: 'Mm', script: 'Myanmar' },
  BURMESE: { code: 'MM', name: 'Burmese', native: 'မြန်မာစာ', flag: '🇲🇲', fieldKey: 'Mm', script: 'Myanmar' },
  BIRMANO: { code: 'MM', name: 'Burmese', native: 'မြန်မာစာ', flag: '🇲🇲', fieldKey: 'Mm', script: 'Myanmar' },
};

// Parse CLI Args
const args = process.argv.slice(2);
let targetLangInput = 'FR';
let customCode = '';
let customName = '';
let customNative = '';
let customFlag = '';

args.forEach(arg => {
  if (arg.startsWith('--lang=')) targetLangInput = arg.split('=')[1].trim().toUpperCase();
  if (arg.startsWith('--code=')) customCode = arg.split('=')[1].trim().toUpperCase();
  if (arg.startsWith('--name=')) customName = arg.split('=')[1].trim();
  if (arg.startsWith('--native=')) customNative = arg.split('=')[1].trim();
  if (arg.startsWith('--flag=')) customFlag = arg.split('=')[1].trim();
});

const langConfig = customCode 
  ? { code: customCode, name: customName || customCode, native: customNative || customName || customCode, flag: customFlag || '🌐', fieldKey: customCode.charAt(0) + customCode.slice(1).toLowerCase() }
  : PRESETS[targetLangInput] || PRESETS['FR'];

console.log('=================================================================');
console.log(`🚀 UNIVERSAL DEEPSEEK TRANSLATION PIPELINE`);
console.log(`🎯 Target Language: ${langConfig.name} (${langConfig.native}) [${langConfig.code}] ${langConfig.flag}`);
console.log('=================================================================');

// 1. Read DeepSeek API Key
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

const stats = {
  language: langConfig,
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
// STEP 1: Translate i18n.ts
// -------------------------------------------------------------
async function processI18n() {
  console.log(`\n🌐 STEP 1: Translating i18n.ts into ${langConfig.name}`);
  const filePath = 'src/pizza/data/i18n.ts';
  const rawLines = fs.readFileSync(filePath, 'utf8').split('\n');

  const blocks = [];
  let current = null;
  const targetCode = langConfig.code;

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
    } else if (current && trimmed.startsWith(`${targetCode}:`)) {
      current.targetIdx = idx;
    } else if (current && (trimmed.startsWith('}') || trimmed.startsWith('},'))) {
      current.endIdx = idx;
      if (current.it && current.en) {
        blocks.push(current);
      }
      current = null;
    }
  }

  console.log(`  Found ${blocks.length} dictionary entries in i18n.ts`);

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
      `You are a professional Italian restaurant translator. Translate each UI text/button into natural, prestigious ${langConfig.name} (${langConfig.native}). Output JSON: { "items": [ { "id": number, "text": "translated string" } ] }`,
      { items: payload },
      `i18n [${i + 1} - ${Math.min(i + chunkSize, blocks.length)} of ${blocks.length}]`
    );

    if (result && Array.isArray(result.items)) {
      result.items.forEach(it => {
        translations.set(it.id, it.text);
      });
    }

    await sleep(200);
  }

  const newLines = [...rawLines];
  for (let idx = blocks.length - 1; idx >= 0; idx--) {
    const b = blocks[idx];
    const trans = translations.get(idx);
    if (!trans) continue;

    const escaped = trans.replace(/'/g, "\\'");
    if (b.targetIdx !== undefined) {
      const indent = rawLines[b.targetIdx].match(/^\s*/)[0];
      newLines[b.targetIdx] = `${indent}${targetCode}: '${escaped}',`;
    } else {
      const indent = rawLines[b.startIdx].match(/^\s*/)[0];
      newLines.splice(b.endIdx, 0, `${indent}${targetCode}: '${escaped}',`);
    }
  }

  fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
  console.log(`✅ i18n.ts successfully updated for [${targetCode}].`);
}

// -------------------------------------------------------------
// STEP 2: Translate menuData.ts
// -------------------------------------------------------------
async function processMenuData() {
  console.log(`\n🍕 STEP 2: Translating menuData.ts into ${langConfig.name}`);
  const filePath = 'src/pizza/data/menuData.ts';
  const raw = fs.readFileSync(filePath, 'utf8');

  const startMarker = 'export const menuData: MenuCategory[] =';
  const idx = raw.indexOf(startMarker);
  if (idx === -1) throw new Error('Could not find menuData declaration');

  const header = raw.substring(0, idx);
  const jsonText = raw.substring(idx + startMarker.length).trim().replace(/;$/, '');
  const menuCategories = JSON.parse(jsonText);

  const nameKey = `name${langConfig.fieldKey}`;
  const nameSnakeKey = `name_${langConfig.code.toLowerCase()}`;
  const descKey = `description${langConfig.fieldKey}`;
  const descSnakeKey = `description_${langConfig.code.toLowerCase()}`;

  // Categories
  console.log(`  Translating ${menuCategories.length} categories...`);
  const catPayload = menuCategories.map(c => ({
    id: c.id,
    nameIt: c.nameIt || c.name,
    nameEn: c.name,
    descIt: c.descriptionIt || c.description || '',
    descEn: c.description || ''
  }));

  const catResult = await callDeepSeekWithRetry(
    `Translate Italian restaurant menu categories to prestigious ${langConfig.name} (${langConfig.native}). Output JSON: { "categories": [ { "id": "...", "name": "...", "description": "..." } ] }`,
    { categories: catPayload },
    `Categories (${menuCategories.length} items)`
  );

  if (catResult && Array.isArray(catResult.categories)) {
    catResult.categories.forEach(cRes => {
      const target = menuCategories.find(c => c.id === cRes.id);
      if (target) {
        target[nameKey] = cRes.name;
        target[nameSnakeKey] = cRes.name;
        if (cRes.description) {
          target[descKey] = cRes.description;
          target[descSnakeKey] = cRes.description;
        }
      }
    });
  }

  // Dishes
  const allDishes = [];
  menuCategories.forEach(cat => {
    (cat.items || []).forEach(dish => {
      allDishes.push(dish);
    });
  });

  console.log(`  Translating ${allDishes.length} dishes in batches...`);
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
      `You are an authentic Italian culinary translator. Translate dish names and ingredients/descriptions into mouth-watering, authentic ${langConfig.name} (${langConfig.native}). Output JSON: { "dishes": [ { "id": "...", "name": "...", "description": "..." } ] }`,
      { dishes: payload },
      `Dishes [${i + 1} - ${Math.min(i + dishChunkSize, allDishes.length)} of ${allDishes.length}]`
    );

    if (result && Array.isArray(result.dishes)) {
      result.dishes.forEach(dRes => {
        const dish = allDishes.find(d => d.id === dRes.id);
        if (dish) {
          dish[nameKey] = dRes.name;
          dish[nameSnakeKey] = dRes.name;
          dish[descKey] = dRes.description;
          dish[descSnakeKey] = dRes.description;
        }
      });
    }

    await sleep(200);
  }

  // Variants & Extras
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

  if (uniqueVariants.length > 0) {
    const varResult = await callDeepSeekWithRetry(
      `Translate food portion sizes and variant names to ${langConfig.name} (${langConfig.native}). Output JSON: { "variants": [ { "name": "...", "translatedName": "..." } ] }`,
      { variants: uniqueVariants },
      `Variants (${uniqueVariants.length} items)`
    );

    if (varResult && Array.isArray(varResult.variants)) {
      const vLookup = new Map(varResult.variants.map(v => [v.name, v.translatedName]));
      allDishes.forEach(d => {
        (d.variants || []).forEach(v => {
          if (vLookup.has(v.name)) {
            v[nameKey] = vLookup.get(v.name);
            v[nameSnakeKey] = vLookup.get(v.name);
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
        `Translate Italian restaurant extra toppings/ingredients to ${langConfig.name} (${langConfig.native}). Output JSON: { "extras": [ { "name": "...", "translatedName": "..." } ] }`,
        { extras: chunk },
        `Extras [${i + 1} - ${Math.min(i + extraChunkSize, uniqueExtras.length)} of ${uniqueExtras.length}]`
      );

      if (extResult && Array.isArray(extResult.extras)) {
        const eLookup = new Map(extResult.extras.map(e => [e.name, e.translatedName]));
        allDishes.forEach(d => {
          (d.extras || []).forEach(e => {
            if (eLookup.has(e.name)) {
              e[nameKey] = eLookup.get(e.name);
              e[nameSnakeKey] = eLookup.get(e.name);
            }
          });
        });
      }
      await sleep(200);
    }
  }

  const finalOutput = `${header}export const menuData: MenuCategory[] = ${JSON.stringify(menuCategories, null, 2)};\n`;
  fs.writeFileSync(filePath, finalOutput, 'utf8');
  console.log(`✅ menuData.ts successfully updated for [${langConfig.code}].`);
}

// -------------------------------------------------------------
// STEP 3: Translate wineData.tsx
// -------------------------------------------------------------
async function processWineData() {
  console.log(`\n🍷 STEP 3: Translating wineData.tsx into ${langConfig.name}`);
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

  const wineList = new Function('return ' + winesJsStr)();
  console.log(`  Translating ${wineList.length} wines in batches...`);

  const titleKey = `title${langConfig.fieldKey}`;
  const subtitleKey = `subtitle${langConfig.fieldKey}`;
  const descKey = `description${langConfig.fieldKey}`;

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
      `You are a professional Italian Sommelier and translator. Translate wine titles, subtitle classifications (e.g. RED WINE / ITALY - PUGLIA), and tasting notes into prestigious ${langConfig.name} (${langConfig.native}). Output JSON: { "wines": [ { "id": "...", "title": "...", "subtitle": "...", "description": "..." } ] }`,
      { wines: payload },
      `Wines [${i + 1} - ${Math.min(i + wineChunkSize, wineList.length)} of ${wineList.length}]`
    );

    if (result && Array.isArray(result.wines)) {
      result.wines.forEach(wRes => {
        const wine = wineList.find(w => w.id === wRes.id);
        if (wine) {
          wine[titleKey] = wRes.title || wine.title;
          wine[subtitleKey] = wRes.subtitle || wine.categorySubtitle;
          wine[descKey] = wRes.description || wine.description;
        }
      });
    }

    await sleep(200);
  }

  const newWineContent = `${beforeWines}export const INITIAL_WINE_COLLECTION: WineCardData[] = ${JSON.stringify(wineList, null, 2)}${trailingCode}`;
  fs.writeFileSync(filePath, newWineContent, 'utf8');
  console.log(`✅ wineData.tsx successfully updated for [${langConfig.code}].`);
}

// -------------------------------------------------------------
// STEP 4: Register Language in languages.ts
// -------------------------------------------------------------
async function processLanguagesConfig() {
  console.log(`\n⚙️ STEP 4: Checking and Registering Language in languages.ts`);
  const filePath = 'src/pizza/config/languages.ts';
  let content = fs.readFileSync(filePath, 'utf8');
  const code = langConfig.code;

  if (!content.includes(`'${code}'`)) {
    content = content.replace(
      /export const SUPPORTED_LANGUAGES = \[([^\]]+)\] as const;/,
      (match, p1) => {
        const list = p1.split(',').map(s => s.trim()).filter(Boolean);
        if (!list.includes(`'${code}'`)) list.push(`'${code}'`);
        return `export const SUPPORTED_LANGUAGES = [${list.join(', ')}] as const;`;
      }
    );

    const metaEntry = `  ${code}: {
    code: '${code}',
    label: '${langConfig.native}',
    nativeName: '${langConfig.native}',
    flag: '${langConfig.flag}',
  },`;

    content = content.replace(/export const LANGUAGE_METAS: Record<Language, LanguageMeta> = \{([^}]+)\};/s, (match, p1) => {
      if (!p1.includes(`${code}:`)) {
        return `export const LANGUAGE_METAS: Record<Language, LanguageMeta> = {${p1}\n${metaEntry}\n};`;
      }
      return match;
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ languages.ts registered [${code}].`);
  } else {
    console.log(`  ℹ️ Language [${code}] already registered in languages.ts.`);
  }
}

// -------------------------------------------------------------
// STEP 5: Translate CheckoutFlow.tsx
// -------------------------------------------------------------
async function processCheckoutFlow() {
  console.log(`\n🛵 STEP 5: Translating & Updating CheckoutFlow.tsx`);
  const filePath = 'src/pizza/components/CheckoutFlow.tsx';
  let content = fs.readFileSync(filePath, 'utf8');
  const code = langConfig.code;

  const sampleEn = {
    step1Title: 'Your Information & Service',
    fulfillmentDelivery: 'Home Delivery',
    fulfillmentTakeaway: 'Restaurant Pickup (Takeaway)',
    pickupLocationTitle: 'Pickup at Restaurant',
    pickupLocationAddress: 'Flower Power Pizza – Ranong Hot Springs, Bang Rin',
    pickupLocationHours: '⏰ Pickup Hours: 11:00 – 21:30 (Open)',
    pickupNotesPlaceholder: 'Pickup notes (e.g. estimated arrival, requests...)',
    namePlaceholder: 'Name',
    phonePlaceholder: 'Phone',
    emailPlaceholder: 'Email for receipt & tracking',
    notesPlaceholder: 'Delivery notes (e.g. buzzer, floor, allergies...)',
    invalidEmailHint: 'Please enter a valid email address',
    addressPlaceholder: 'Delivery Address',
    verifyLoc: 'Verify Location',
    verifyingLoc: 'Verifying...',
    simLoc: 'Simulate location (Test)',
    continueBtn: 'Continue',
    step2Title: 'Payment Method',
    optPromptPay: 'PromptPay QR (Omise)',
    optCard: 'Card (Visa/MC)',
    optCash: 'Cash on delivery',
    optCashTakeaway: 'Cash on pickup at counter',
    cardHolderLabel: 'Cardholder Name',
    cardNumberLabel: 'Card Number (16 digits)',
    cardExpLabel: 'Expires (MM/YY)',
    cardCvvLabel: 'CVV',
    cardSecurityNotice: '3D Secure protected via Omise Vault (256-bit SSL encryption)',
    generateQrBtn: 'GENERATE PROMPTPAY QR',
    payCardBtn: 'CONFIRM & PAY WITH CARD',
    scanningPrompt: 'Scan QR with any Thai mobile banking app (SCB, KBank, Bangkok Bank, Krungthai)',
    awaitingPayment: 'Awaiting bank confirmation...',
    paymentConfirmedTitle: 'PAYMENT RECEIVED!',
    manualSlipFallback: 'Or upload receipt screenshot manually',
    uploadBtn: 'Upload receipt screenshot',
    submitBtn: 'CONFIRM AND SEND ORDER',
    uploadPromptBtn: 'UPLOAD RECEIPT TO PROCEED',
    kbankStep4: 'Upload a screenshot of your payment receipt',
    backBtn: 'Go Back',
    successTitle: 'Kitchen is at work!',
    successDesc: 'Thank you! Your order has been recorded and is being prepared. You will receive a confirmation call shortly.',
    closeBtn: 'Close',
    waitText: 'Please wait...',
    confirmMapLoc: 'DELIVER HERE (CONFIRM LOCATION)',
    mapInstructions: 'Tap map or move pin to your delivery spot',
    tapHint: 'Tap map to drop pin',
    expandMap: 'Expand',
    collapseMap: 'Minimize',
    detectLocBtn: 'Find my location',
    sendingTitle: 'Sending your order...',
    sendingHint: 'Waiting for kitchen confirmation',
    timeoutTitle: 'The kitchen is very busy or the staff tablet is offline.',
    timeoutHint: 'Your order may still have arrived. Press Retry or contact us directly.',
    retryBtn: 'Retry sending the order',
    emergencyTitle: 'Prefer to contact us directly?',
    trackerPreparing: 'Stay on this page! We are preparing your pizzas. This screen will update automatically as soon as the driver gets on the scooter.',
    trackerTakeawayPreparing: 'Stay on this page! We are preparing your takeaway order. This screen will update as soon as your pizzas are freshly baked and ready for pickup!',
    trackerDelivering: 'Delivery is on the way!',
    trackerTakeawayReady: 'YOUR ORDER IS READY!',
    trackerTakeawayReadyDesc: 'Your pizzas have just been freshly baked! We are waiting for you at the Flower Power Pizza counter at Ranong Hot Springs.',
    supportNotice: 'Feel free to contact us for any inquiries or changes to your order',
    rejectedTitle: 'We are sorry!',
    rejectedDesc: 'The kitchen is at full capacity or temporarily unable to accept orders. Please contact us directly for any assistance.',
    backToFormBtn: 'Back to form',
  };

  const result = await callDeepSeekWithRetry(
    `You are a professional translator. Translate all checkout UI labels and notification messages into prestigious ${langConfig.name} (${langConfig.native}). Return JSON matching the exact keys provided.`,
    sampleEn,
    `CheckoutFlow UI Strings`
  );

  if (result && result.step1Title) {
    const mmBlock = `  ${code}: {
    step1Title: '${(result.step1Title || '').replace(/'/g, "\\'")}',
    fulfillmentDelivery: '${(result.fulfillmentDelivery || '').replace(/'/g, "\\'")}',
    fulfillmentTakeaway: '${(result.fulfillmentTakeaway || '').replace(/'/g, "\\'")}',
    pickupLocationTitle: '${(result.pickupLocationTitle || '').replace(/'/g, "\\'")}',
    pickupLocationAddress: '${(result.pickupLocationAddress || '').replace(/'/g, "\\'")}',
    pickupLocationHours: '${(result.pickupLocationHours || '').replace(/'/g, "\\'")}',
    pickupNotesPlaceholder: '${(result.pickupNotesPlaceholder || '').replace(/'/g, "\\'")}',
    namePlaceholder: '${(result.namePlaceholder || '').replace(/'/g, "\\'")}',
    phonePlaceholder: '${(result.phonePlaceholder || '').replace(/'/g, "\\'")}',
    emailPlaceholder: '${(result.emailPlaceholder || '').replace(/'/g, "\\'")}',
    notesPlaceholder: '${(result.notesPlaceholder || '').replace(/'/g, "\\'")}',
    invalidEmailHint: '${(result.invalidEmailHint || '').replace(/'/g, "\\'")}',
    addressPlaceholder: '${(result.addressPlaceholder || '').replace(/'/g, "\\'")}',
    verifyLoc: '${(result.verifyLoc || '').replace(/'/g, "\\'")}',
    verifyingLoc: '${(result.verifyingLoc || '').replace(/'/g, "\\'")}',
    outOfRange: (dist: number, max: number) => \`Distance: \${dist.toFixed(1)} km / Max: \${max} km\`,
    simLoc: '${(result.simLoc || '').replace(/'/g, "\\'")}',
    continueBtn: '${(result.continueBtn || '').replace(/'/g, "\\'")}',
    step2Title: '${(result.step2Title || '').replace(/'/g, "\\'")}',
    optPromptPay: '${(result.optPromptPay || '').replace(/'/g, "\\'")}',
    optCard: '${(result.optCard || '').replace(/'/g, "\\'")}',
    optCash: '${(result.optCash || '').replace(/'/g, "\\'")}',
    optCashTakeaway: '${(result.optCashTakeaway || '').replace(/'/g, "\\'")}',
    cardHolderLabel: '${(result.cardHolderLabel || '').replace(/'/g, "\\'")}',
    cardNumberLabel: '${(result.cardNumberLabel || '').replace(/'/g, "\\'")}',
    cardExpLabel: '${(result.cardExpLabel || '').replace(/'/g, "\\'")}',
    cardCvvLabel: '${(result.cardCvvLabel || '').replace(/'/g, "\\'")}',
    cardSecurityNotice: '${(result.cardSecurityNotice || '').replace(/'/g, "\\'")}',
    generateQrBtn: '${(result.generateQrBtn || '').replace(/'/g, "\\'")}',
    payCardBtn: '${(result.payCardBtn || '').replace(/'/g, "\\'")}',
    scanningPrompt: '${(result.scanningPrompt || '').replace(/'/g, "\\'")}',
    awaitingPayment: '${(result.awaitingPayment || '').replace(/'/g, "\\'")}',
    paymentConfirmedTitle: '${(result.paymentConfirmedTitle || '').replace(/'/g, "\\'")}',
    manualSlipFallback: '${(result.manualSlipFallback || '').replace(/'/g, "\\'")}',
    uploadBtn: '${(result.uploadBtn || '').replace(/'/g, "\\'")}',
    submitBtn: '${(result.submitBtn || '').replace(/'/g, "\\'")}',
    uploadPromptBtn: '${(result.uploadPromptBtn || '').replace(/'/g, "\\'")}',
    kbankStep4: '${(result.kbankStep4 || '').replace(/'/g, "\\'")}',
    backBtn: '${(result.backBtn || '').replace(/'/g, "\\'")}',
    successTitle: '${(result.successTitle || '').replace(/'/g, "\\'")}',
    successDesc: '${(result.successDesc || '').replace(/'/g, "\\'")}',
    closeBtn: '${(result.closeBtn || '').replace(/'/g, "\\'")}',
    waitText: '${(result.waitText || '').replace(/'/g, "\\'")}',
    confirmMapLoc: '${(result.confirmMapLoc || '').replace(/'/g, "\\'")}',
    mapInstructions: '${(result.mapInstructions || '').replace(/'/g, "\\'")}',
    tapHint: '${(result.tapHint || '').replace(/'/g, "\\'")}',
    expandMap: '${(result.expandMap || '').replace(/'/g, "\\'")}',
    collapseMap: '${(result.collapseMap || '').replace(/'/g, "\\'")}',
    locConfirmed: (dist: number) => \`\${dist.toFixed(1)} km\`,
    detectLocBtn: '${(result.detectLocBtn || '').replace(/'/g, "\\'")}',
    sendingTitle: '${(result.sendingTitle || '').replace(/'/g, "\\'")}',
    sendingHint: '${(result.sendingHint || '').replace(/'/g, "\\'")}',
    timeoutTitle: '${(result.timeoutTitle || '').replace(/'/g, "\\'")}',
    timeoutHint: '${(result.timeoutHint || '').replace(/'/g, "\\'")}',
    retryBtn: '${(result.retryBtn || '').replace(/'/g, "\\'")}',
    emergencyTitle: '${(result.emergencyTitle || '').replace(/'/g, "\\'")}',
    trackerPreparing: '${(result.trackerPreparing || '').replace(/'/g, "\\'")}',
    trackerTakeawayPreparing: '${(result.trackerTakeawayPreparing || '').replace(/'/g, "\\'")}',
    trackerEstimate: (mins: number) => \`~\${mins} min\`,
    trackerDelivering: '${(result.trackerDelivering || '').replace(/'/g, "\\'")}',
    trackerTakeawayReady: '${(result.trackerTakeawayReady || '').replace(/'/g, "\\'")}',
    trackerTakeawayReadyDesc: '${(result.trackerTakeawayReadyDesc || '').replace(/'/g, "\\'")}',
    supportNotice: '${(result.supportNotice || '').replace(/'/g, "\\'")}',
    rejectedTitle: '${(result.rejectedTitle || '').replace(/'/g, "\\'")}',
    rejectedDesc: '${(result.rejectedDesc || '').replace(/'/g, "\\'")}',
    backToFormBtn: '${(result.backToFormBtn || '').replace(/'/g, "\\'")}',
    trackerDeliveryDetails: (dist: number, mins: number) => \`\${dist.toFixed(1)} km — ~\${mins} min\`,
  },`;

    if (!content.includes(`  ${code}: {`)) {
      content = content.replace(/const translations = \{([^;]+)\};/s, (match, p1) => {
        return `const translations = {${p1}\n${mmBlock}\n};`;
      });
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ CheckoutFlow.tsx updated with [${code}].`);
    } else {
      console.log(`  ℹ️ CheckoutFlow.tsx already has [${code}].`);
    }
  }
}

// -------------------------------------------------------------
// STEP 6: Translate TableReservationModal.tsx
// -------------------------------------------------------------
async function processTableReservation() {
  console.log(`\n🍷 STEP 6: Translating & Updating TableReservationModal.tsx`);
  const filePath = 'src/pizza/components/TableReservationModal.tsx';
  let content = fs.readFileSync(filePath, 'utf8');
  const code = langConfig.code;

  const sampleEn = {
    modalTitle: 'Book a Table or Garden Hut',
    modalSubtitle: 'Flower Power Pizza Ranong',
    nameLabel: 'Full Name',
    namePlaceholder: 'e.g. John Smith',
    contactLabel: 'Phone / LINE ID',
    contactPlaceholder: 'e.g. +66 94 980 0200 or LINE ID',
    emailLabel: 'Email (for instant confirmation)',
    emailPlaceholder: 'e.g. john.smith@email.com',
    dateLabelLine1: 'Reservation',
    dateLabelLine2: 'Date',
    timeLabelLine1: 'Preferred',
    timeLabelLine2: 'Time',
    guestsLabelLine1: 'Number of',
    guestsLabelLine2: 'Guests',
    areaLabel: 'Choose Seating Area',
    areaIndoor: 'Indoor Dining Room',
    areaOutdoor: 'Outdoor Garden Terrace',
    areaHut: 'Private Garden Hut',
    notesLabel: 'Special Requests or Notes (Optional)',
    notesPlaceholder: 'e.g. Birthday celebration, anniversary, dietary needs...',
    eventsNoticeTitle: 'Birthdays, Private Parties & Catering',
    eventsNoticeText: 'Planning a special event? Contact us directly for custom menus and dedicated packages:',
    btnSubmit: 'Send Reservation Request',
    btnSubmitting: 'Sending...',
    successTitle: 'Reservation Request Sent!',
    successText: 'We have received your request for Flower Power Pizza and sent a summary email. Our team will confirm availability shortly.',
    btnClose: 'Close',
    openWhatsApp: 'Chat on WhatsApp',
    openLine: 'Chat on LINE',
  };

  const result = await callDeepSeekWithRetry(
    `Translate table reservation modal UI labels into prestigious ${langConfig.name} (${langConfig.native}). Return JSON matching the exact keys provided.`,
    sampleEn,
    `TableReservationModal UI Strings`
  );

  if (result && result.modalTitle) {
    const resBlock = `  ${code}: {
    modalTitle: '${(result.modalTitle || '').replace(/'/g, "\\'")}',
    modalSubtitle: '${(result.modalSubtitle || '').replace(/'/g, "\\'")}',
    nameLabel: '${(result.nameLabel || '').replace(/'/g, "\\'")}',
    namePlaceholder: '${(result.namePlaceholder || '').replace(/'/g, "\\'")}',
    contactLabel: '${(result.contactLabel || '').replace(/'/g, "\\'")}',
    contactPlaceholder: '${(result.contactPlaceholder || '').replace(/'/g, "\\'")}',
    emailLabel: '${(result.emailLabel || '').replace(/'/g, "\\'")}',
    emailPlaceholder: '${(result.emailPlaceholder || '').replace(/'/g, "\\'")}',
    dateLabelLine1: '${(result.dateLabelLine1 || '').replace(/'/g, "\\'")}',
    dateLabelLine2: '${(result.dateLabelLine2 || '').replace(/'/g, "\\'")}',
    timeLabelLine1: '${(result.timeLabelLine1 || '').replace(/'/g, "\\'")}',
    timeLabelLine2: '${(result.timeLabelLine2 || '').replace(/'/g, "\\'")}',
    guestsLabelLine1: '${(result.guestsLabelLine1 || '').replace(/'/g, "\\'")}',
    guestsLabelLine2: '${(result.guestsLabelLine2 || '').replace(/'/g, "\\'")}',
    areaLabel: '${(result.areaLabel || '').replace(/'/g, "\\'")}',
    areaIndoor: '${(result.areaIndoor || '').replace(/'/g, "\\'")}',
    areaOutdoor: '${(result.areaOutdoor || '').replace(/'/g, "\\'")}',
    areaHut: '${(result.areaHut || '').replace(/'/g, "\\'")}',
    notesLabel: '${(result.notesLabel || '').replace(/'/g, "\\'")}',
    notesPlaceholder: '${(result.notesPlaceholder || '').replace(/'/g, "\\'")}',
    eventsNoticeTitle: '${(result.eventsNoticeTitle || '').replace(/'/g, "\\'")}',
    eventsNoticeText: '${(result.eventsNoticeText || '').replace(/'/g, "\\'")}',
    btnSubmit: '${(result.btnSubmit || '').replace(/'/g, "\\'")}',
    btnSubmitting: '${(result.btnSubmitting || '').replace(/'/g, "\\'")}',
    successTitle: '${(result.successTitle || '').replace(/'/g, "\\'")}',
    successText: '${(result.successText || '').replace(/'/g, "\\'")}',
    btnClose: '${(result.btnClose || '').replace(/'/g, "\\'")}',
    openWhatsApp: '${(result.openWhatsApp || '').replace(/'/g, "\\'")}',
    openLine: '${(result.openLine || '').replace(/'/g, "\\'")}',
  },`;

    if (!content.includes(`  ${code}: {`)) {
      content = content.replace(/const translations = \{([^;]+)\};/s, (match, p1) => {
        return `const translations = {${p1}\n${resBlock}\n};`;
      });
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ TableReservationModal.tsx updated with [${code}].`);
    } else {
      console.log(`  ℹ️ TableReservationModal.tsx already has [${code}].`);
    }
  }
}

// -------------------------------------------------------------
// MAIN RUNNER
// -------------------------------------------------------------
async function run() {
  const startTime = Date.now();
  await processLanguagesConfig();
  await processI18n();
  await processMenuData();
  await processWineData();
  await processCheckoutFlow();
  await processTableReservation();

  stats.finishedAt = new Date().toISOString();
  stats.totalExecutionSeconds = Math.round((Date.now() - startTime) / 1000);

  const reportFileName = `scratch/deepseek_audit_${langConfig.code.toLowerCase()}.json`;
  fs.writeFileSync(reportFileName, JSON.stringify(stats, null, 2), 'utf8');

  console.log('=================================================================');
  console.log(`🎉 UNIVERSAL DEEPSEEK TRANSLATION [${langConfig.code}] COMPLETED!`);
  console.log(`📊 Total Real API Calls: ${stats.totalCalls}`);
  console.log(`📊 Total Tokens Used: ${stats.totalTokens.toLocaleString()}`);
  console.log(`⏱️ Duration: ${stats.totalExecutionSeconds}s`);
  console.log(`📁 Audit Report: ${reportFileName}`);
  console.log('=================================================================');
}

run().catch(err => {
  console.error('❌ FATAL ERROR IN UNIVERSAL TRANSLATOR:', err);
  process.exit(1);
});
