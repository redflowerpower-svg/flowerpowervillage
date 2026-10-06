import { VercelRequest, VercelResponse } from "@vercel/node";

interface DishTranslateRequestBody {
  sourceLang: 'IT' | 'EN' | 'TH' | 'DE' | 'MM';
  name: string;
  description: string;
  category: string;
  isDailySpecial?: boolean;
}

export async function handleDishTranslate(req: VercelRequest, res: VercelResponse) {
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
      name = '',
      description = '',
      category = 'traditional-italian-pizza',
      isDailySpecial = false
    }: DishTranslateRequestBody = req.body || {};

    const prompt = `You are an Italian executive chef and master food translator for a premier authentic Italian restaurant and pizzeria in Thailand.
Translate and refine the following dish name and culinary description/ingredients from the source language (${sourceLang}) into all 5 languages: IT (Italian), EN (English), TH (Thai), DE (German), and MM (Burmese - မြန်မာစာ).

SOURCE INPUTS (Source Language: ${sourceLang}, Category: ${category}, Daily Special: ${isDailySpecial}):
- Dish Name: "${name}"
- Ingredients & Culinary Description: "${description}"

RULES:
1. Dish Name formatting:
   - For IT: Use authentic Italian naming (e.g. "PIZZA MARGHERITA", "SPAGHETTI ALLA CARBONARA", "TAGLIATA DI MANZO"). Keep uppercase.
   - For EN: Use clear, appetizing international English food titles. Keep uppercase.
   - For TH: Use natural Thai culinary dish titles without artificial spaces.
   - For DE: Use authentic German culinary dish titles. Keep uppercase.
   - For MM: Use natural, elegant Burmese culinary titles (e.g. "မာဂရီတာ ပီဇာ", "ကာဘိုနာရာ စပါဂက်တီ").
2. Description formatting:
   - For TH: Write natural, appetizing Thai restaurant descriptions with authentic ingredient terms (e.g. มอสซาเรลล่าสด, น้ำมันมะกอกบริสุทธิ์, ซอสมะเขือเทศเข้มข้น).
   - For IT: Elegant Italian gastronomic description highlighting fresh ingredients.
   - For EN: Professional culinary description with appetizing vocabulary.
   - For DE: Precise, appetizing German description.
   - For MM: Fluent, inviting Burmese culinary descriptions highlighting fresh ingredients and authentic Italian taste.
3. Output MUST be ONLY valid JSON matching this exact schema:

{
  "name": {
    "IT": "...",
    "EN": "...",
    "TH": "...",
    "DE": "...",
    "MM": "..."
  },
  "description": {
    "IT": "...",
    "EN": "...",
    "TH": "...",
    "DE": "...",
    "MM": "..."
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
            content: "You are a specialized JSON-only Italian food translation assistant. You always output strictly valid JSON without markdown wrapping or explanations."
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
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(500).json({ error: "Empty response from DeepSeek" });
    }

    const parsed = JSON.parse(content);
    return res.status(200).json(parsed);

  } catch (error: any) {
    console.error("Dish translation handler error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
