import fs from 'fs';
import https from 'https';

// 1. Read API key
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
  console.error('❌ Missing DEEPSEEK_API_KEY');
  process.exit(1);
}

const prompt = `You are an expert luxury hospitality and Italian gourmet culinary localization engine.
Translate the following UI micro-copy keys for a floating promotional discount banner used on our Pizza Delivery and Island Resort Booking Engine.
The languages required are:
- IT (Italian)
- EN (English)
- TH (Thai)
- MM (Burmese Unicode)
- DE (German)
- ES (Spanish)
- FR (French)
- RU (Russian)
- ZH (Simplified Chinese)

Keys to translate:
1. coverageTitle: "ACTIVE DISCOUNT COVERAGE:" (Caps/Emphasis, UI badge label)
2. codeApplied: "Code {code} applied" (Format with {code} placeholder)
3. pizzaScopeNote: "discount valid on food & drinks" (Subtle clarification note)
4. resortScopeNote: "valid on room + extra guests" (Subtle clarification note for resort booking)
5. removeBtnTitle: "Remove promo code" (Accessibility title / tooltip)

Return ONLY a valid JSON object strictly matching this format without markdown ticks:
{
  "IT": { "coverageTitle": "...", "codeApplied": "...", "pizzaScopeNote": "...", "resortScopeNote": "...", "removeBtnTitle": "..." },
  "EN": { ... },
  "TH": { ... },
  "MM": { ... },
  "DE": { ... },
  "ES": { ... },
  "FR": { ... },
  "RU": { ... },
  "ZH": { ... }
}`;

const reqBody = JSON.stringify({
  model: 'deepseek-chat',
  messages: [
    { role: 'system', content: 'You are a professional localization engine. Return JSON only.' },
    { role: 'user', content: prompt }
  ],
  temperature: 0.2
});

const req = https.request(
  {
    hostname: 'api.deepseek.com',
    path: '/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Length': Buffer.byteLength(reqBody)
    }
  },
  (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        const reply = parsed.choices[0].message.content;
        const cleanJson = reply.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonResult = JSON.parse(cleanJson);
        console.log('--- CERTIFIED DEEPSEEK TRANSLATION RESULT ---');
        console.log(JSON.stringify(jsonResult, null, 2));
        fs.writeFileSync('scratch/promo_banner_translations.json', JSON.stringify(jsonResult, null, 2), 'utf8');
      } catch (err) {
        console.error('Error parsing response:', err, data);
      }
    });
  }
);

req.on('error', (e) => console.error('Request error:', e));
req.write(reqBody);
req.end();
