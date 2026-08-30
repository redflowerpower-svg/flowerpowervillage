import { handleCreateCheckoutSession } from '../api/_handlers/checkout.js';

async function testDirect() {
  const req = {
    method: 'POST',
    body: {
      accommodationId: 529784,
      checkIn: '2026-11-10',
      checkOut: '2026-11-15',
      guests: 2,
      guestName: 'Ospite Test',
      guestEmail: 'test@example.com',
      guestPhone: '+39 333 1234567',
      paymentMethod: 'paypal',
      lang: 'IT'
    },
    headers: { origin: 'http://localhost:3000' }
  };

  const res = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(data) { console.log('Response (Code ' + this.statusCode + '):', data); return this; },
    setHeader() {}
  };

  await handleCreateCheckoutSession(req, res);
}

testDirect();
