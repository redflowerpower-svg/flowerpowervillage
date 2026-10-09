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

if (!apiKey) {
  console.error('❌ DEEPSEEK_API_KEY not found!');
  process.exit(1);
}

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function callDeepSeekWithRetry(systemPrompt, userPayload, label = '', retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
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
            { role: 'user', content: JSON.stringify(userPayload) }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`API Error ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const duration = Date.now() - startTime;
      const usage = data.usage || {};
      console.log(`  ⚡ [DeepSeek API Call] ${label} (${duration}ms) - Tokens: ${usage.total_tokens}`);
      return JSON.parse(data.choices[0].message.content);
    } catch (err) {
      console.warn(`  ⚠️ Attempt ${attempt}/${retries} failed for ${label}: ${err.message}`);
      if (attempt === retries) throw err;
      await sleep(1500 * attempt);
    }
  }
}

async function processI18nForLang(langConfig) {
  console.log(`\n🌐 Translating i18n.ts into ${langConfig.name} [${langConfig.code}]...`);
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
      `i18n ${targetCode} [${i + 1} - ${Math.min(i + chunkSize, blocks.length)} of ${blocks.length}]`
    );

    if (result && Array.isArray(result.items)) {
      result.items.forEach(it => {
        translations.set(it.id, it.text);
      });
    }

    await sleep(150);
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

async function run() {
  const targetLangs = [
    { code: 'FR', name: 'French', native: 'Français' },
    { code: 'RU', name: 'Russian', native: 'Русский' },
    { code: 'ZH', name: 'Chinese (Simplified)', native: '中文' }
  ];

  for (const l of targetLangs) {
    await processI18nForLang(l);
  }
  console.log('🎉 All languages in i18n.ts are 100% synchronized!');
}

run().catch(console.error);
