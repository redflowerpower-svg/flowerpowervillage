async function testPublicPayPalBooking() {
  const res = await fetch('http://localhost:3000/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accommodationId: 529784,
      checkIn: '2026-11-10',
      checkOut: '2026-11-15',
      guests: 2,
      guestName: 'Ospite PayPal Test',
      guestEmail: 'paypal-guest@example.com',
      guestPhone: '+39 333 1234567',
      paymentMethod: 'paypal',
      lang: 'IT'
    })
  });
  const data = await res.json();
  console.log('Public PayPal Checkout Session Output:\n', JSON.stringify(data, null, 2));
}

testPublicPayPalBooking();
