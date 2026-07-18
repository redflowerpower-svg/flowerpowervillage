import fetch from 'node-fetch';

async function run() {
  console.log('Sending manual status update request to live Vercel production route...');
  
  const payload = {
    orderId: '53',
    status: 'preparing'
  };

  try {
    const res = await fetch('https://flowerpowervillage.vercel.app/api/telegram-update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log('HTTP Status:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

run();
