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

async function callDeepSeekWithRetry(targetLang, fullLang) {
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
              content: `You are a native translator for a restaurant/pizzeria web app.
Translate "Ordina" (short 1-2 word CTA action button to place/confirm item order) into ${fullLang}.
Return JSON object: {"translated": "..."}`
            },
            {
              role: 'user',
              content: '{"text": "Ordina"}'
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        })
      });
      const data = await res.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.warn(`Attempt ${attempt} for ${targetLang} failed:`, e.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function run() {
  const de = await callDeepSeekWithRetry('DE', 'German');
  console.log('DE:', de);
  const mm = await callDeepSeekWithRetry('MM', 'Burmese (Myanmar Unicode)');
  console.log('MM:', mm);
}

run();
