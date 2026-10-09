import fs from 'fs';
import { menuData } from '../src/pizza/data/menuData.ts';

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

const dishesToTranslate = [];
menuData.forEach(cat => {
  cat.items.forEach(item => {
    dishesToTranslate.push({
      id: item.id,
      name: item.name,
      description: item.description || ''
    });
  });
});

console.log(`Totale piatti estratti da tradurre: ${dishesToTranslate.length}`);

async function callDeepSeek(prompt) {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are an expert Italian gastronomic translator. Translate menu items into 4 languages:
- es: Spanish
- fr: French
- ru: Russian
- zh: Chinese (Simplified)

Preserve famous Italian names where appropriate (e.g. Pizza Margherita, Carbonara, Calzone, Tiramisù) while translating descriptive ingredients accurately.
Return JSON with key "dishes" containing an array of objects:
{
  "id": "item_id",
  "nameEs": "...",
  "descriptionEs": "...",
  "nameFr": "...",
  "descriptionFr": "...",
  "nameRu": "...",
  "descriptionRu": "...",
  "nameZh": "...",
  "descriptionZh": "..."
}`
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) {
    throw new Error(`DeepSeek API Error: ${res.status} - ${await res.text()}`);
  }

  const json = await res.json();
  return JSON.parse(json.choices[0].message.content);
}

async function run() {
  const BATCH_SIZE = 25;
  const allResults = [];

  for (let i = 0; i < dishesToTranslate.length; i += BATCH_SIZE) {
    const batch = dishesToTranslate.slice(i, i + BATCH_SIZE);
    console.log(`⏳ Traduzione batch piatti ${i + 1}-${Math.min(i + BATCH_SIZE, dishesToTranslate.length)} di ${dishesToTranslate.length}...`);
    const prompt = `Translate these menu items:\n${JSON.stringify(batch, null, 2)}`;
    const res = await callDeepSeek(prompt);
    if (res.dishes && Array.isArray(res.dishes)) {
      allResults.push(...res.dishes);
    }
    console.log(`✅ Batch completato (${allResults.length} tradotti finora)`);
  }

  fs.writeFileSync('scratch/deepseek_4langs_dishes.json', JSON.stringify(allResults, null, 2));
  console.log(`🎉 Tutte le traduzioni piatti salvate con successo in scratch/deepseek_4langs_dishes.json (${allResults.length} piatti)!`);
}

run().catch(console.error);
