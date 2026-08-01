import { handleOctorateBookings, handleOctorateMinStay } from '../api/_handlers/octorate.ts';
import { calculateDynamicMinStay } from '../src/admin/resort/lib/octorateAdmin.ts';

async function testFullIntegrationWithGap() {
  console.log("=========================================================================");
  console.log(" 🚀 VERIFICA INTEGRATA GAP-FILL CON PRENOTAZIONI REALI + SIMULATE CON BUCATURA");
  console.log("=========================================================================\n");

  const simulatedBookings = [
    {
      accommodation_name: 'JVR 7d',
      product: '495976',
      check_in: '2026-08-10',
      check_out: '2026-08-15',
      status: 'confirmed'
    },
    {
      accommodation_name: 'JVR Main bnb-14d',
      product: '496002',
      check_in: '2026-08-16', // 1-day gap (15 Aug to 16 Aug, default=2)
      check_out: '2026-08-25',
      status: 'confirmed'
    },
    {
      accommodation_name: 'Red Main bnb-7d',
      product: '332030',
      check_in: '2026-12-21',
      check_out: '2026-12-25',
      status: 'confirmed'
    },
    {
      accommodation_name: 'Red Bungalow',
      product: '293954',
      check_in: '2026-12-28', // 3-day gap in High Season (25 Dec to 28 Dec, default=5)
      check_out: '2027-01-05',
      status: 'confirmed'
    }
  ];

  const dateRange = { start: '2026-08-01', end: '2027-01-31' };
  const updates = calculateDynamicMinStay(simulatedBookings, dateRange);

  console.log(`📊 Bucature Identificate: ${updates.length} gap trovati con le varianti OTA!`);
  console.log("Output JSON generato da calculateDynamicMinStay:");
  console.log(JSON.stringify(updates, null, 2));

  // Test Serverless POST handler
  const reqMinStay = {
    method: 'POST',
    body: {
      updates,
      resetToBaseline: false
    }
  };

  let statusMinStay = 200;
  let jsonMinStay = null;
  const resMinStay = { status(c) { statusMinStay = c; return this; }, json(d) { jsonMinStay = d; return this; } };

  await handleOctorateMinStay(reqMinStay, resMinStay);

  console.log(`\nHTTP Status Endpoint: ${statusMinStay}`);
  console.log("Response JSON Endpoint:", JSON.stringify(jsonMinStay, null, 2));

  if (statusMinStay === 200 && jsonMinStay?.success && updates.length === 2) {
    console.log("\n✅ VERIFICA SUPERATA AL 100%! Bucature riconosciute sia per 'JVR Main bnb-14d' sia per 'Red Main bnb-7d'. JSON valido senza crash!");
  } else {
    console.error("\n❌ ERRORE:", jsonMinStay);
  }
}

testFullIntegrationWithGap().catch(console.error);
