import fs from 'fs';

/**
 * =============================================================================
 * 🌐 DEEPSEEK TRANSLATE CLI (UNIVERSAL ON-DEMAND TRANSLATOR)
 * =============================================================================
 * Usage:
 *   node scratch/deepseek-translate.mjs --text="Order Now" --to=MM
 *   node scratch/deepseek-translate.mjs --json='{"title":"Welcome","btn":"Click here"}' --to=MM
 *   node scratch/deepseek-translate.mjs --text="Promo 5%" --to=TH --context="Dining tablet UI"
 * =============================================================================
 */

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
  console.error('❌ DEEPSEEK_API_KEY non configurata! Esegui "node scratch/vault-sync.mjs decrypt"');
  process.exit(1);
}

// 2. Parse CLI Arguments
const args = process.argv.slice(2);
let textInput = '';
let jsonInput = '';
let targetLang = 'MM';
let context = 'Restaurant, Pizzeria, Dining Tablet POS, Food Delivery UI';

args.forEach(arg => {
  if (arg.startsWith('--text=')) textInput = arg.substring(7).trim();
  if (arg.startsWith('--json=')) jsonInput = arg.substring(7).trim();
  if (arg.startsWith('--to=')) targetLang = arg.substring(5).trim().toUpperCase();
  if (arg.startsWith('--context=')) context = arg.substring(10).trim();
});

const LANG_MAP = {
  MM: 'Burmese (Myanmar Unicode)',
  TH: 'Thai',
  IT: 'Italian',
  EN: 'English',
  DE: 'German',
  FR: 'French',
  RU: 'Russian',
  ZH: 'Chinese (Simplified)',
  JA: 'Japanese',
  ES: 'Spanish'
};

const fullLangName = LANG_MAP[targetLang] || targetLang;

async function translate() {
  const systemPrompt = `You are a professional native translator specialized in high-end restaurant, pizzeria, resort booking, and web UI interfaces.
Target Language: ${fullLangName}.
Context: ${context}.
Translate accurately and naturally into ${fullLangName}.
If input is a single string or multiple keys, return a clean JSON object with key "translated" or matching the exact keys provided.`;

  let payload = {};
  if (jsonInput) {
    try {
      payload = JSON.parse(jsonInput);
    } catch (e) {
      payload = { text: jsonInput };
    }
  } else if (textInput) {
    payload = { text: textInput };
  } else {
    console.error('❌ Specificare --text="..." oppure --json="..."');
    process.exit(1);
  }

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
          { role: 'user', content: JSON.stringify(payload) }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      })
    });

    const data = await res.json();
    if (data.error) {
      console.error('❌ Errore API DeepSeek:', data.error);
      process.exit(1);
    }
    const result = JSON.parse(data.choices[0].message.content);
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('❌ Errore chiamata DeepSeek:', err.message);
    process.exit(1);
  }
}

translate();
