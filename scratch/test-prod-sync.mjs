async function testViaFetch() {
  console.log('Sending webhook POST to http://localhost:3000/api/webhooks/octorate ...');
  try {
    const res = await fetch('http://localhost:3000/api/webhooks/octorate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'RESERVATION_NOTIFICATION' })
    });
    const json = await res.json();
    console.log('Webhook Response:', JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testViaFetch();
