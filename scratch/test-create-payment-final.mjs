async function runTest() {
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
  console.log('API RESPONSE:\n', JSON.stringify(data, null, 2));
}

runTest();
