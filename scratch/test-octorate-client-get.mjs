import { handleOctorateClientGet } from '../api/_handlers/octorate.js';

async function testOctorateClientGet() {
  const req = { method: 'GET' };
  const res = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(data) {
      console.log('Octorate Client Get Response (Status ' + this.statusCode + '):', JSON.stringify(data, null, 2));
      return this;
    },
    setHeader() {}
  };

  await handleOctorateClientGet(req, res);
}

testOctorateClientGet();
