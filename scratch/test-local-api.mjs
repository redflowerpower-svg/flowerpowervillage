async function testApi() {
  try {
    console.log('Testing GET http://localhost:3000/api/promo-codes?type=resort ...');
    const res = await fetch('http://localhost:3000/api/promo-codes?type=resort');
    console.log('Status:', res.status, res.statusText);
    const data = await res.json();
    console.log('Data:', data);
  } catch (err) {
    console.error('Error:', err.message);
  }

  try {
    console.log('Testing POST http://localhost:3000/api/promo-codes ...');
    const testCodes = [
      {
        id: 'promo-welcome-2026',
        code: 'WELCOME2026',
        discountType: 'percentage',
        discountValue: 10,
        slotsTotal: 100,
        slotsUsed: 0,
        isSingleUse: false,
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        active: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'promo-test-90',
        code: 'TEST90',
        discountType: 'percentage',
        discountValue: 90,
        slotsTotal: 10,
        slotsUsed: 0,
        isSingleUse: false,
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        active: true,
        createdAt: new Date().toISOString()
      }
    ];

    const postRes = await fetch('http://localhost:3000/api/promo-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'resort',
        action: 'save-resort-promos',
        promoCodes: testCodes
      })
    });
    console.log('POST Status:', postRes.status, postRes.statusText);
    const postData = await postRes.json();
    console.log('POST Response:', postData);
  } catch (err) {
    console.error('POST Error:', err.message);
  }
}

testApi();
