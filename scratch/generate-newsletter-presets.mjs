import fs from 'fs';
import path from 'path';

// Load DeepSeek key from .env or .env.local
let apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
if (!apiKey) {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const m = envContent.match(/DEEPSEEK_API_KEY=([^\r\n]+)/);
    if (m) apiKey = m[1].trim();
  } catch {}
}
if (!apiKey) {
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const m = envContent.match(/DEEPSEEK_API_KEY=([^\r\n]+)/);
    if (m) apiKey = m[1].trim();
  } catch {}
}

const PRESETS_BASE = [
  {
    id: 'dining_voucher_welcome',
    name: '🏷️ Voucher Dining 10% Delivery',
    subject: '🎁 Il tuo Sconto 10% Flower Power Pizza Ranong per Ordini Online!',
    message: `Gentile {name},\n\nGrazie per essere stato nostro gradito ospite al tavolo!\n\nEcco il tuo speciale buono sconto del 10% valido per 10 giorni per il tuo prossimo ordine da asporto o consegna a domicilio sul nostro sito web:\n\n👉 Ordina subito con sconto applicato con 1 click:\nhttps://flowerpowerpizza.com\n\nOppure inserisci il tuo codice promozionale personale al checkout.\n\nA presto!\nFlower Power Pizza & Wine Ranong`
  },
  {
    id: 'weekend_promo',
    name: '🍕 Promo Weekend & Famiglia',
    subject: '🍕 Weekend Special: Sconto 10% sulle Pizze & Consegna Gratuita a Ranong!',
    message: `Ciao {name}!\n\nQuesto fine settimana regalati il vero sapore della pizza italiana a legna a Ranong.\n\n🔥 Ordina almeno 2 pizze e ricevi subito:\n- 10% di sconto sul totale\n- Consegna a domicilio rapida con i nostri rider dedicati\n\nVisita il nostro sito https://flowerpowerpizza.com o contattaci direttamente per prenotare la tua consegna calda e fragrante.\n\nA presto!\nFlower Power Pizza Ranong Team`
  },
  {
    id: 'new_pizza',
    name: '🌟 Nuova Pizza del Mese',
    subject: '🌟 Nuova Creazione in Menu da Flower Power Pizza Ranong!',
    message: `Gentile {name},\n\nSiamo entusiasti di presentarti la nuova pizza speciale di questa settimana, preparata con ingredienti freschissimi e lievitazione naturale di oltre 48 ore.\n\n🧀 Vieni a provarla sul nostro menu online:\n👉 https://flowerpowerpizza.com\n\nOrdina online in pochi secondi con geolocalizzazione GPS precisa e pagamento sicuro con PromptPay o Carta.\n\nBuon appetito!\nFlower Power Pizza Ranong`
  },
  {
    id: 'wine_selection',
    name: '🍷 Selezione Vini & Cantina',
    subject: '🍷 Nuovi Arrivi dalla Cantina Italiana a Ranong!',
    message: `Caro {name},\n\nAbbiamo appena rinnovato la nostra selezione di vini e birre artigianali per accompagnare le tue pizze preferite.\n\nScopri i nuovi arrivi italiani (Prosecco DOC, Chianti, Pinot Grigio) disponibili per la consegna a domicilio e per la degustazione al tavolo a Ranong.\n\nSfoglia la nostra Wine Card online: https://flowerpowerpizza.com\n\nSalute!\nFlower Power Pizza & Wine Studio`
  },
  {
    id: 'thai_local',
    name: '🇹🇭 โปรโมชั่นพิเศษ (Promo Thai)',
    subject: '🍕 พิซซ่าอิตาเลียนแท้ อบเตาฟืน พร้อมส่งถึงบ้านคุณในระนอง!',
    message: `สวัสดีคุณ {name}!\n\nFlower Power Pizza Ranong ขอมอบโปรโมชั่นพิเศษสำหรับคุณและครอบครัว:\n\n✨ สั่งพิซซ่าอบเตาฟืนแท้ ส่งร้อนๆ ถึงหน้าบ้านในเขตระนอง\n✨ สั่งซื้อง่ายผ่านเว็บพร้อมระบุพิกัด GPS แม่นยำ\n✨ ชำระสะดวกผ่าน PromptPay QR หรือบัตรเครดิต\n\nสั่งเลยตอนนี้: https://flowerpowerpizza.com\n\nขอให้อร่อยกับพิซซ่าอิตาเลียนแท้ครับ/ค่ะ!`
  }
];

const TARGET_LANGS = ['IT', 'EN', 'TH', 'MM', 'DE', 'ES', 'FR', 'RU', 'ZH'];

async function translatePreset(preset) {
  const prompt = `You are an expert hospitality and culinary copywriter for Flower Power Pizza Ranong in Thailand.
Translate this marketing email template into all 9 languages: IT, EN, TH, MM, DE, ES, FR, RU, ZH.

Subject: "${preset.subject}"
Message:
"""
${preset.message}
"""

Rules:
1. Preserve {name} placeholder and URLs verbatim.
2. Produce natural, high-converting, friendly restaurant copy in all languages.
3. Return ONLY valid JSON in format:
{
  "IT": { "subject": "...", "message": "..." },
  "EN": { "subject": "...", "message": "..." },
  "TH": { "subject": "...", "message": "..." },
  "MM": { "subject": "...", "message": "..." },
  "DE": { "subject": "...", "message": "..." },
  "ES": { "subject": "...", "message": "..." },
  "FR": { "subject": "...", "message": "..." },
  "RU": { "subject": "...", "message": "..." },
  "ZH": { "subject": "...", "message": "..." }
}`;

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'You output only valid JSON without markdown fences.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    })
  });

  const data = await res.json();
  const raw = data.choices[0].message.content;
  return JSON.parse(raw.trim().replace(/^```json/i, '').replace(/```$/i, ''));
}

async function main() {
  console.log('Generating DeepSeek certified translations for all 5 presets in 9 languages...');
  const results = {};
  for (const p of PRESETS_BASE) {
    console.log(`Translating preset: ${p.id}...`);
    try {
      const trans = await translatePreset(p);
      results[p.id] = trans;
      console.log(`✓ Done ${p.id}`);
    } catch (e) {
      console.error(`Error translating ${p.id}:`, e);
    }
  }

  fs.writeFileSync('scratch/presets-9langs.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('Saved all translations to scratch/presets-9langs.json');
}

main();
