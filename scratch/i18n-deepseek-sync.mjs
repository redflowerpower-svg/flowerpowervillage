import fs from 'fs';
import path from 'path';

/**
 * DeepSeek AI Translation Synchronizer
 * Uses official DeepSeek API (deepseek-chat) to batch-translate and backfill missing keys in any target language
 */

const apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY || '';

export async function translateWithDeepSeek(texts, sourceLang = 'IT', targetLangs = ['TH', 'EN', 'DE']) {
  if (!apiKey) {
    console.error('❌ DEEPSEEK_API_KEY is not configured in .env');
    return null;
  }

  const prompt = `You are an expert culinary translator specializing in authentic Italian restaurant gastronomy and Thai, English, and German localization.
Translate the following source texts (${sourceLang}) into: ${targetLangs.join(', ')}.

SOURCE TEXTS:
${JSON.stringify(texts, null, 2)}

OUTPUT FORMAT:
Return ONLY a strict JSON object mapping each original text key to its translations:
{
  "key1": {
    "TH": "...",
    "EN": "...",
    "DE": "..."
  }
}`;

  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a JSON-only culinary translation assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      })
    });

    if (!res.ok) {
      console.error('DeepSeek API error:', res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    return JSON.parse(content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim());
  } catch (err) {
    console.error('DeepSeek request error:', err);
    return null;
  }
}

console.log('🤖 DeepSeek Translation Engine ready.');
