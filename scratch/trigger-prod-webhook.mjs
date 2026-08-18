async function triggerLocalWebhook() {
  console.log('📡 Invio evento simulato al Webhook locale (localhost:3000)...');
  const res = await fetch('http://localhost:3000/api/webhooks/octorate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'RESERVATION_CHANGE',
      timestamp: new Date().toISOString()
    })
  });

  const status = res.status;
  const json = await res.json();
  console.log(`Risposta Webhook (HTTP ${status}):`, JSON.stringify(json, null, 2));
}

triggerLocalWebhook();
