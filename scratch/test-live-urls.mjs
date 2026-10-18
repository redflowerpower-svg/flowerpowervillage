async function testEndpoints() {
  const urls = [
    'https://flowerpowervillage.vercel.app/api/webhooks/octorate',
    'https://www.flowerpowerpizza.com/api/webhooks/octorate',
    'https://www.flowerpowervillage.com/api/webhooks/octorate'
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u, { method: 'GET' });
      const text = await res.text();
      console.log(`GET ${u} -> HTTP ${res.status}: ${text.slice(0, 100)}`);
    } catch (e) {
      console.log(`GET ${u} -> ERROR: ${e.message}`);
    }
  }
}

testEndpoints();
