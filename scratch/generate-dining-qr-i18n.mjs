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

const baseIT = {
  modalTitle: "Ordina dal tuo Smartphone",
  modalSubtitle: "Inquadra per ordinare insieme a questo tavolo",
  tableCodeLabel: "Postazione:",
  scanInstructions: "Inquadra questo QR Code con la fotocamera del tuo telefono per aprire il menu e inviare ordini con lo sconto del 5% applicato.",
  copyLink: "Copia Link Tavolo",
  linkCopied: "Link Copiato negli Appunti!",
  openInPhoneBtn: "📱 Mostra QR Code Smartphone",
  liveConnectedNotice: "Sessione Attiva e Condivisa",
  settledNotice: "Conto Saldato • Sessione Tavolo Conclusa",
  settledDesc: "Questo tavolo e il relativo conto sono stati saldati. Grazie per aver mangiato con noi!",
  backHomeBtn: "Torna alla Home / Delivery",
  guestBannerTitle: "Menu al Tavolo (Sconto -5% Attivo)",
  guestBannerSubtitle: "Stai ordinando dal tuo smartphone",
  sessionActiveBadge: "Sessione Aperta"
};

async function translate(targetLang, langName) {
  const prompt = `Translate the following JSON UI dictionary from Italian to ${langName}. Keep JSON keys strictly identical. Output valid JSON only, without any markdown or code blocks.\n\n${JSON.stringify(baseIT, null, 2)}`;
  
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a professional restaurant UI translator. Return ONLY valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1
    })
  });

  const json = await res.json();
  const raw = json.choices[0].message.content.trim();
  const clean = raw.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
  return JSON.parse(clean);
}

async function run() {
  const results = {
    IT: baseIT,
    EN: await translate('EN', 'English'),
    TH: await translate('TH', 'Thai'),
    DE: await translate('DE', 'German'),
    MM: await translate('MM', 'Burmese (Myanmar Unicode)')
  };

  fs.writeFileSync('src/pizza/data/diningQrI18n.ts', `export const I18N_DINING_QR = ${JSON.stringify(results, null, 2)} as const;\n`);
  console.log('✅ Generated src/pizza/data/diningQrI18n.ts via DeepSeek API successfully!');
}

run().catch(console.error);
