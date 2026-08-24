import { VercelRequest, VercelResponse } from "@vercel/node";

interface WineTranslateRequestBody {
  sourceLang: 'IT' | 'EN' | 'TH' | 'DE';
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

    const prompt = `You are a master sommelier and professional translator for a prestigious Italian pizzeria and restaurant in Thailand.
Translate and refine the following wine card details from the source language (${sourceLang}) into all 4 languages: IT (Italian), EN (English), TH (Thai), and DE (German).

SOURCE INPUTS (Source Language: ${sourceLang}):
- Vigna (Line 1): "${vigna}"
- Dettagli (Line 2): "${dettagli}"
- Brand (Line 3): "${brand}"
- Tipo di Vino (Line 1 of subtitle): "${wineType}"
- Nazione & Area (Line 2 of subtitle): "${origin}"
- Note di Degustazione (Description): "${description}"

RULES:
1. For THAI (TH): Write natural, authentic, modern sommelier tasting notes without spaces between Thai words. Use appetizing, elegant, professional restaurant phrasing.
2. For GERMAN (DE): Use authentic German sommelier terminology.
3. For ITALIAN (IT): Use authentic Italian sommelier terminology.
4. For ENGLISH (EN): Use international sommelier terminology.
5. In Subtitle Line 1:
   - IT: VINO ROSSO | VINO BIANCO | VINO ROSATO | BOLLICINE
   - EN: RED WINE | WHITE WINE | ROSÉ WINE | SPARKLING WINE
   - TH: ไวน์แดง | ไวน์ขาว | ไวน์โรเซ่ | สปาร์กลิงไวน์
   - DE: ROTWEIN | WEISSWEIN | ROSÉWEIN | SCHAUMWEIN
6. In Subtitle Line 2: Keep the format "COUNTRY - AREA" in each respective language (e.g. IT: "ITALIA - PUGLIA", EN: "ITALY - PUGLIA", TH: "อิตาลี - แคว้นปูลยา", DE: "ITALIEN - APULIEN").
7. In Title lines:
   - Line 1 (Vigna): Keep uppercase wine/denomination name.
   - Line 2 (Dettagli): Translate terms like DOC/IGT/Extra Dry if appropriate or keep original.
   - Line 3 (Brand): Keep Title Case.
8. Output MUST be ONLY valid JSON matching this schema:

{
  "title": {
    "IT": "Line1\\nLine2\\nLine3",
    "EN": "Line1\\nLine2\\nLine3",
    "TH": "Line1\\nLine2\\nLine3",
    "DE": "Line1\\nLine2\\nLine3"
  },
  "categorySubtitle": {
    "IT": "Line1\\nLine2",
    "EN": "Line1\\nLine2",
    "TH": "Line1\\nLine2",
    "DE": "Line1\\nLine2"
  },
  "description": {
    "IT": "...",
    "EN": "...",
    "TH": "...",
    "DE": "..."
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
