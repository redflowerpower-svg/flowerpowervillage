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

const payload = {
  deliveryBeyond6kmNotice: "La consegna a domicilio è attiva fino a 6 km (la tua posizione è a {dist} km). Puoi ordinare con Ritiro al Locale (Takeaway) e venire a ritirare la tua pizza calda da noi a Ranong Hot Springs!",
  switchToTakeawayBtn: "Passa a Ritiro al Locale (Takeaway)",
  outOfRangeTakeawayNotice: "L'ordinazione online è attiva per i clienti a Ranong (fino a 6 km a domicilio, fino a 25 km per asporto). La tua posizione attuale è a oltre 25 km. Puoi comunque consultare liberamente il nostro menu!",
  outOfRangeTitle: "Sei Fuori Zona di Ordinazione"
};

async function translateLang(langCode, langName) {
  for (let attempt = 1; attempt <= 3; attempt++) {
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
            {
              role: 'system',
              content: `You are a professional native translator for a pizzeria food delivery app in Ranong, Thailand.
Target Language: ${langName} (${langCode}).
Translate the JSON object keeping placeholders like {dist} unchanged.
Return ONLY valid JSON matching the input keys.`
            },
            {
              role: 'user',
              content: JSON.stringify(payload)
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        })
      });
      const data = await res.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.warn(`Attempt ${attempt} for ${langCode} failed:`, e.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function run() {
  const en = await translateLang('EN', 'English');
  console.log('EN:', JSON.stringify(en, null, 2));
  const th = await translateLang('TH', 'Thai');
  console.log('TH:', JSON.stringify(th, null, 2));
  const de = await translateLang('DE', 'German');
  console.log('DE:', JSON.stringify(de, null, 2));
  const mm = await translateLang('MM', 'Burmese (Myanmar Unicode)');
  console.log('MM:', JSON.stringify(mm, null, 2));
}

run();
