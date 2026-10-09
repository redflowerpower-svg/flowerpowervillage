import { VercelRequest, VercelResponse } from "@vercel/node";

interface CampaignTranslateRequestBody {
  sourceLang?: string;
  targetLang?: string; // or 'ALL'
  subject: string;
  message: string;
}

export async function handleCampaignTranslate(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'DEEPSEEK_API_KEY not configured' });
  }

  try {
    const {
      sourceLang = 'IT',
      targetLang = 'EN',
      subject = '',
      message = ''
    }: CampaignTranslateRequestBody = req.body || {};

    if (!subject && !message) {
      return res.status(400).json({ error: 'Subject or message is required' });
    }

    const isAll = targetLang === 'ALL';
    const targetLangs = isAll 
      ? ['IT', 'EN', 'TH', 'MM', 'DE', 'ES', 'FR', 'RU', 'ZH']
      : [targetLang];

    const prompt = `You are a professional multilingual copywriter and marketing translator for Flower Power Pizza & Wine in Ranong, Thailand.
Translate the following marketing email newsletter Subject and Message from ${sourceLang} into the target language(s): ${targetLangs.join(', ')}.

SOURCE TEXTS (Source Language: ${sourceLang}):
Subject: "${subject}"
Message:
"""
${message}
"""

RULES:
1. Keep exact placeholders intact like {name} or URLs (https://flowerpowerpizza.com).
2. For Thai (TH): Use natural, friendly, polite Thai (ending in ครับ/ค่ะ appropriately for a restaurant business).
3. For Burmese (MM): Use fluent, natural Burmese (မြန်မာစာ).
4. For German (DE), French (FR), Spanish (ES), Russian (RU), Italian (IT), English (EN), Chinese (ZH): High quality, engaging marketing tone.
5. Return ONLY a valid JSON object matching this schema:

{
  "translations": {
    ${targetLangs.map(l => `"${l}": { "subject": "...", "message": "..." }`).join(',\n    ')}
  }
}`;

    const deepSeekRes = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        temperature: 0.3,
        messages: [
          { role: 'system', content: 'You are an expert hospitality and restaurant copywriter. Output strictly valid JSON without markdown code fences.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!deepSeekRes.ok) {
      const errText = await deepSeekRes.text();
      return res.status(502).json({ error: 'DeepSeek API error', details: errText });
    }

    const aiData = await deepSeekRes.json();
    const rawContent = aiData.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(rawContent.trim().replace(/^```json/i, '').replace(/```$/i, ''));

    return res.status(200).json({
      success: true,
      translations: parsed.translations || parsed
    });
  } catch (error: any) {
    console.error('[handleCampaignTranslate Error]:', error);
    return res.status(500).json({ error: error?.message || 'Translation failed' });
  }
}
