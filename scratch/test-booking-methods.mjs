async function testPublicBookingMethods() {
  console.log('--- TEST 1: KSHER PROMPTPAY QR ---');
  const res1 = await fetch('http://localhost:3000/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accommodationId: 529784,
      checkIn: '2026-11-10',
      checkOut: '2026-11-15',
      guests: 2,
      guestName: 'Ospite PromptPay',
      guestEmail: 'test-pp@example.com',
      guestPhone: '+66 81 234 5678',
      paymentMethod: 'ksher',
      paymentChannel: 'promptpay',
      lang: 'TH'
    })
  });
  const data1 = await res1.json();
  console.log('PromptPay Output:', data1);

  console.log('\n--- TEST 2: KSHER CREDIT CARD ---');
  const res2 = await fetch('http://localhost:3000/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accommodationId: 529784,
      checkIn: '2026-11-10',
      checkOut: '2026-11-15',
      guests: 2,
      guestName: 'Ospite Card',
      guestEmail: 'test-card@example.com',
      guestPhone: '+39 333 1234567',
      paymentMethod: 'ksher',
      paymentChannel: 'card',
      lang: 'IT'
    })
  });
  const data2 = await res2.json();
  console.log('Credit Card Output:', data2);
}

testPublicBookingMethods();
