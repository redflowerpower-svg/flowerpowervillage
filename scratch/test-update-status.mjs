import fetch from 'node-fetch';

async function run() {
  console.log('Sending manual status update request to local serverless route...');
  
  const payload = {
    orderId: 51,
    status: 'completed'
  };

  try {
    const res = await fetch('http://localhost:3000/api/telegram-update-status', {
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
