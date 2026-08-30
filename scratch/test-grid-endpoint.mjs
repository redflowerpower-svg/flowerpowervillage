import { handleOctorateGrid } from '../api/_handlers/octorate.js';

async function testGridEndpoint() {
  const req = {
    method: 'GET',
    query: {
      dateFrom: '2026-11-01',
      dateTo: '2026-11-05'
    }
  };

  const res = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(data) {
      console.log('Grid Endpoint Status:', this.statusCode);
      console.log('Total items fetched:', data.totalFetched);
      console.log('beGrid items:', data.beGrid?.length);
      for (const item of (data.beGrid || []).slice(0, 5)) {
        console.log(`BE Room: id=${item.id}, name=${item.name}, days=${item.days?.length}`);
      }
      return this;
    }
  };

  await handleOctorateGrid(req, res);
}

testGridEndpoint();
