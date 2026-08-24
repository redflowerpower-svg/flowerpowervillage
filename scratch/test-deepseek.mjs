const apiKey = process.env.DEEPSEEK_API_KEY || '';

async function testDeepSeek() {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a sommelier translator. Output strictly valid JSON.' },
        { role: 'user', content: 'Translate to IT, EN, TH, DE in JSON: title: Solstice Cuvée, desc: Crisp sparkling wine with green apple and floral notes.' }
      ],
      response_format: { type: 'json_object' }
    })
  });
  console.log('DeepSeek Status:', res.status);
  const data = await res.json();
  console.log('DeepSeek Response:', data.choices?.[0]?.message?.content);
}

testDeepSeek();
