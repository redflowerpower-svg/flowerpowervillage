import { VercelRequest, VercelResponse } from "@vercel/node";

export type SupportedWineLang = 'IT' | 'EN' | 'TH' | 'MM' | 'DE' | 'ES' | 'FR' | 'RU' | 'ZH';

interface WineTranslateRequestBody {
  sourceLang: SupportedWineLang;
  vigna: string;
  dettagli: string;
  brand: string;
  wineType: string;
  origin: string;
  description: string;
}

export async function handleWineTranslate(req: VercelRequest, res: VercelResponse) {
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
      vigna = '',
      dettagli = '',
      brand = '',
      wineType = '',
      origin = '',
      description = ''
    }: WineTranslateRequestBody = req.body || {};

    const prompt = `You are a master sommelier and professional multilingual culinary translator for Flower Power Pizza & Wine Bar in Ranong, Thailand.
Translate and refine the following wine card details from the source language (${sourceLang}) into all 9 supported languages:
1. IT (Italian)
2. EN (English)
3. TH (Thai)
4. MM (Burmese)
5. DE (German)
6. ES (Spanish)
7. FR (French)
8. RU (Russian)
9. ZH (Simplified Chinese)

SOURCE INPUTS (Source Language: ${sourceLang}):
- Vigna (Line 1): "${vigna}"
- Dettagli (Line 2): "${dettagli}"
- Brand (Line 3): "${brand}"
- Tipo di Vino (Line 1 of subtitle): "${wineType}"
- Nazione & Area (Line 2 of subtitle): "${origin}"
- Note di Degustazione (Description): "${description}"

RULES:
1. For THAI (TH): Write natural, authentic, modern sommelier tasting notes without spaces between Thai words. Use appetizing, elegant, professional phrasing.
2. For BURMESE (MM): Use authentic, prestigious Burmese wine & culinary phrasing in standard Unicode (no Zawgyi).
3. For CHINESE (ZH): Use standard simplified Chinese sommelier terminology with natural wine tasting descriptions.
4. For RUSSIAN (RU): Use professional Russian wine tasting vocabulary.
5. For FRENCH (FR): Use prestigious French sommelier terms (Vins Rouges, Vins Blancs, Vins Rosés, Vins Effervescents/Pétillants).
6. For SPANISH (ES): Use authentic Spanish wine terms (Vinos Tintos, Vinos Blancos, Vinos Rosados, Vinos Espumosos).
7. For GERMAN (DE), ITALIAN (IT), ENGLISH (EN): Use respective official sommelier standards.
8. Subtitle Line 1 (Wine Type):
   - IT: VINO ROSSO | VINO BIANCO | VINO ROSATO | SPUMANTE
   - EN: RED WINE | WHITE WINE | ROSÉ WINE | SPARKLING WINE
   - TH: ไวน์แดง | ไวน์ขาว | ไวน์โรเซ่ | สปาร์กลิงไวน์
   - MM: ဝိုင်နီ | ဝိုင်ဖြူ | ရိုဇေး ဝိုင် | စပါကလင် ဝိုင်
   - DE: ROTWEIN | WEISSWEIN | ROSÉWEIN | SCHAUMWEIN
   - ES: VINO TINTO | VINO BLANCO | VINO ROSADO | VINO ESPUMOSO
   - FR: VIN ROUGE | VIN BLANC | VIN ROSÉ | VIN EFFERVESCENT
   - RU: КРАСНОЕ ВИНО | БЕЛОЕ ВИНО | РОЗОВОЕ ВИНО | ИГРИСТОЕ ВИНО
   - ZH: 红葡萄酒 | 白葡萄酒 | 桃红葡萄酒 | 气泡起泡酒
9. Subtitle Line 2 (Country & Region): Format as "COUNTRY - REGION" in each language (e.g. IT: "ITALIA - PUGLIA", EN: "ITALY - PUGLIA", TH: "อิตาลี - ปูลยา", MM: "အီတလီ - ပူလီယာ", ZH: "意大利 - 普利亚", RU: "ИТАЛИЯ - АПУЛИЯ", FR: "ITALIE - POUILLES", ES: "ITALIA - APULIA", DE: "ITALIEN - APULIEN").
10. Title:
    - Line 1 (Vigna): Keep uppercase denomination/grape name.
    - Line 2 (Dettagli): Translate DOC/IGT/Reserva terms if appropriate or keep original.
    - Line 3 (Brand): Keep winery / brand title.
11. Output MUST be ONLY valid JSON matching this schema:

{
  "title": {
    "IT": "Line1\\nLine2\\nLine3",
    "EN": "Line1\\nLine2\\nLine3",
    "TH": "Line1\\nLine2\\nLine3",
    "MM": "Line1\\nLine2\\nLine3",
    "DE": "Line1\\nLine2\\nLine3",
    "ES": "Line1\\nLine2\\nLine3",
    "FR": "Line1\\nLine2\\nLine3",
    "RU": "Line1\\nLine2\\nLine3",
    "ZH": "Line1\\nLine2\\nLine3"
  },
  "categorySubtitle": {
    "IT": "Line1\\nLine2",
    "EN": "Line1\\nLine2",
    "TH": "Line1\\nLine2",
    "MM": "Line1\\nLine2",
    "DE": "Line1\\nLine2",
    "ES": "Line1\\nLine2",
    "FR": "Line1\\nLine2",
    "RU": "Line1\\nLine2",
    "ZH": "Line1\\nLine2"
  },
  "description": {
    "IT": "...",
    "EN": "...",
    "TH": "...",
    "MM": "...",
    "DE": "...",
    "ES": "...",
    "FR": "...",
    "RU": "...",
    "ZH": "..."
  }
}`;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a specialized JSON-only sommelier wine translation assistant. You always output strictly valid JSON without markdown wrapping or explanations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("DeepSeek API error:", response.status, errText);
      return res.status(response.status).json({ error: `DeepSeek API error: ${errText}` });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '{}';
    
    // Clean any accidental markdown backticks
    const cleaned = rawContent.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    return res.status(200).json({
      success: true,
      data: parsed
    });

  } catch (error: any) {
    console.error("Translation handler error:", error);
    return res.status(500).json({ error: error.message || 'Internal translation error' });
  }
}
