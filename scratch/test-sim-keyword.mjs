async function testSimulationKeyword() {
  console.log('--- TEST 1: SECRET SIMULATION KEYWORD ---');
  const res1 = await fetch('http://localhost:3000/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accommodationId: 529784,
      checkIn: '2026-11-10',
      checkOut: '2026-11-15',
      guests: 2,
      guestName: 'Snooker0',
      guestEmail: 'boss@flowerpower.com',
      guestPhone: '+66 81 234 5678',
      paymentMethod: 'ksher',
      lang: 'IT'
    })
  });
  const data1 = await res1.json();
  console.log('Simulation Response:', data1);

  if (data1.sessionId) {
    const verifyRes = await fetch(`http://localhost:3000/api/verify-checkout-session?session_id=${data1.sessionId}`);
    const verifyData = await verifyRes.json();
    console.log('Verification Response:', verifyData);
  }
}

testSimulationKeyword();
