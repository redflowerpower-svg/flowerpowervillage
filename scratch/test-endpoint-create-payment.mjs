async function testCreatePaymentEndpoint() {
  try {
    const res = await fetch('http://localhost:3000/api/payments-admin?action=create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gateway: 'ksher',
        amount: 3600,
        paymentChannel: 'card',
        customerName: 'Ospite Test',
        customerEmail: 'payments@flowerpowerphayam.com'
      })
    });
    const data = await res.json();
    console.log('RESULT FROM /api/payments-admin?action=create-payment:\n', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testCreatePaymentEndpoint();
