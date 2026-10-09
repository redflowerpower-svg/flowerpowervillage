async function testProdApi() {
  console.log('Testing LIVE Production API: https://www.flowerpowerpizza.com/api/promo-codes ...');
  try {
    const res = await fetch('https://www.flowerpowerpizza.com/api/promo-codes?type=pizza');
    console.log('GET Status:', res.status, res.statusText);
    const data = await res.json();
    console.log('GET Data:', data);
  } catch (err) {
    console.error('GET Error:', err);
  }

  try {
    const postRes = await fetch('https://www.flowerpowerpizza.com/api/promo-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'pizza',
        action: 'save-pizza-promos',
        promoCodes: [
          {
            id: 'pizza-welcome-2026',
            code: 'PIZZA2026',
            discountType: 'percentage',
            discountValue: 15,
            minOrder: 250,
            slotsTotal: 100,
            slotsUsed: 0,
            isSingleUse: false,
            validFrom: '2026-01-01',
            validTo: '2026-12-31',
            active: true,
            createdAt: '2026-10-09T08:57:04.947Z'
          },
          {
            id: 'pizza-promo-prova-1791537013542',
            code: 'PROVA',
            discountType: 'percentage',
            discountValue: 90,
            minOrder: 0,
            slotsTotal: 100,
            slotsUsed: 0,
            isSingleUse: false,
            validFrom: '2026-01-01',
            validTo: '2026-12-31',
            active: true,
            createdAt: '2026-10-09T09:10:13.542Z'
          }
        ]
      })
    });
    console.log('POST Status:', postRes.status, postRes.statusText);
    const postData = await postRes.json();
    console.log('POST Data:', postData);
  } catch (err) {
    console.error('POST Error:', err);
  }
}

testProdApi();
