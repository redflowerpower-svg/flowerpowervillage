import { handleOctorateBookings } from '../api/_handlers/octorate.ts';
import { calculateDynamicMinStay } from '../src/admin/resort/lib/octorateAdmin.ts';

async function runDryRunDiagnostic() {
  console.log("=========================================================================");
  console.log(" 🔍 DIAGNOSTICA AVANZATA DRY-RUN: MINIMUM STAY DINAMICO (GAP-FILLING)");
  console.log("=========================================================================\n");

  // 1. Fetch live Octorate bookings for the next 90 days
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

  const bookings = jsonResult?.data || [];
  console.log(`📦 Caricate ${bookings.length} prenotazioni reali da Octorate.\n`);

  // Print sample bookings to inspect room names
  console.log("--- CAMPIONE NOMI CAMERE / PRENOTAZIONI RICEVUTE DA OCTORATE ---");
  const uniqueNames = [...new Set(bookings.map(b => b.accommodation_name || b.roomName || b.product))];
  console.log("Nomi/ID alloggio unici nelle prenotazioni:", uniqueNames);

  // 2. Execute calculateDynamicMinStay in Dry-Run mode
  console.log("\n--- ESECUZIONE ALGORITMO calculateDynamicMinStay (DRY-RUN) ---");
  const dateRange = { start: '2026-08-01', end: '2026-10-31' };
  const updates = calculateDynamicMinStay(bookings, dateRange, 50);

  console.log(`\n📊 Risultato dell'algoritmo: Generati ${updates.length} aggiornamenti Gap-Fill.\n`);
  console.log("Output esatto che verrebbe generato (Payload JSON):");
  console.log(JSON.stringify(updates, null, 2));

  // Format to Octorate Bulk Payload Format for Question 3
  const octorateBulkPayload = updates.map(u => ({
    room: Number(u.roomTypeId) || u.roomTypeId,
    dateFrom: u.dateFrom,
    dateTo: u.dateTo,
    values: {
      minstay: u.minStay
    }
  }));

  console.log("\n--- TRASFORMAZIONE IN FORMATO OCTORATE /calendar/bulk SCHEMA ---");
  console.log(JSON.stringify({ structure: 366879, updates: octorateBulkPayload }, null, 2));
}

runDryRunDiagnostic().catch(console.error);
