import fs from 'fs';

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
  console.error('❌ DEEPSEEK_API_KEY missing');
  process.exit(1);
}

const uniqueExtras = JSON.parse(fs.readFileSync('scratch/unique_extras_to_translate.json', 'utf8'));

console.log(`Translating ${uniqueExtras.length} unique extras with DeepSeek...`);

const prompt = `You are an expert culinary translator for Flower Power Pizza & Restaurant in Ranong, Thailand.
Translate the following list of pizza extra toppings and beverage/spiciness/sugar/sauce customization options into 9 languages:
- IT (Italian)
- EN (English)
- TH (Thai)
- MM (Burmese Unicode)
- DE (German)
- ES (Spanish)
- FR (French)
- RU (Russian)
- ZH (Simplified Chinese)

Here is the input array of extra items:
${JSON.stringify(uniqueExtras.map(e => ({ id: e.id, name: e.name, nameIt: e.nameIt, nameTh: e.nameTh, nameDe: e.nameDe })), null, 2)}

Return ONLY valid JSON format with a dictionary where the key is the extra item "id", containing:
{
  "[id]": {
    "name": "English name",
    "nameIt": "Italian name",
    "nameTh": "Thai name",
    "nameMm": "Burmese name",
    "nameDe": "German name",
    "nameEs": "Spanish name",
    "nameFr": "French name",
    "nameRu": "Russian name",
    "nameZh": "Simplified Chinese name"
  }
}
Do not include any explanation or markdown formatting other than pure JSON.`;

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
        { role: 'system', content: 'You are a professional restaurant menu translator. Respond strictly in JSON format.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const rawContent = data.choices[0].message.content.trim();
  const parsed = JSON.parse(rawContent);

  fs.writeFileSync('scratch/translated_extras_dictionary.json', JSON.stringify(parsed, null, 2), 'utf8');
  console.log('✅ Successfully saved translated extras dictionary to scratch/translated_extras_dictionary.json');
}

main().catch(err => {
  console.error('Error translating extras:', err);
  process.exit(1);
});
