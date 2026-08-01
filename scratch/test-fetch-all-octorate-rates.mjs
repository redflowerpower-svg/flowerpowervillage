import { handleOctorateGrid } from '../api/_handlers/octorate.ts';

async function testFetchAllOctorateGrid() {
  console.log("--- TEST FETCH ALL OCTORATE RATE PLANS FOR TREE COMPONENT ---");
  const req = {
    method: 'GET',
    query: {
      dateFrom: '2026-08-01',
      dateTo: '2026-08-02'
    }
  };

  let statusCode = 200;
  let jsonResult = null;

  const res = {
    status(code) { statusCode = code; return this; },
    json(data) { jsonResult = data; return this; }
  };

  await handleOctorateGrid(req, res);

  console.log(`HTTP Status: ${statusCode}`);
  console.log(`Total rate plans returned in data array: ${jsonResult?.data?.length || 0}`);
  console.log(`Total fetched items from API: ${jsonResult?.totalFetched || 0}`);
}

testFetchAllOctorateGrid().catch(console.error);
