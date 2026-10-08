import fs from 'fs';
import path from 'path';

// 1. Read DeepSeek API Key from .env or .env.local
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
  console.error('❌ DEEPSEEK_API_KEY non trovata');
  process.exit(1);
}

async function translateBatch(itemsObj, targetLang) {
  const prompt = `You are a certified professional culinary translator for a high-end Italian Pizzeria & Restaurant ("Flower Power Pizza").
Translate the following JSON object keys/values to ${targetLang}.
Keep the output strictly valid JSON matching the input schema exactly.
Do not add markdown backticks if possible, return raw JSON string.

Input:
${JSON.stringify(itemsObj, null, 2)}`;

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are an expert culinary translator. Return ONLY valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    })
  });

  const resData = await response.json();
  const raw = resData.choices?.[0]?.message?.content || '{}';
  return JSON.parse(raw);
}

console.log('✅ DeepSeek translator ready');
