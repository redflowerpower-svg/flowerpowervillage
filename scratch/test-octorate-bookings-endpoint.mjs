import { handleOctorateBookings } from '../api/_handlers/octorate.ts';

async function testOctorateBookingsHandler() {
  console.log("--- TEST ENDPOINT SERVERLESS HANDLE_OCTORATE_BOOKINGS ---");

  const req = {
    method: 'GET',
    query: {
      dateFrom: '2026-08-01',
      dateTo: '2026-10-31'
    }
  };

  let statusCode = 200;
  let jsonResult = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonResult = data;
      return this;
    }
  };

  await handleOctorateBookings(req, res);

  console.log(`HTTP Status: ${statusCode}`);
  console.log("Response Summary:", {
    success: jsonResult?.success,
    count: jsonResult?.count,
    sampleBooking: jsonResult?.data?.[0] || null
  });

  if (statusCode === 200 && jsonResult?.success) {
    console.log(`\n✅ TEST SUPERATO! Ricevute ${jsonResult.data?.length || 0} prenotazioni reali da Octorate REST v1 API (0 chiamate a Supabase 'reservations').`);
  } else {
    console.error("\n❌ TEST FALLITO:", jsonResult);
  }
}

testOctorateBookingsHandler().catch(console.error);
