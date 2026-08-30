async function inspectRatePlanDetails() {
  const structureId = '366879';
  const token = '2c38b014603d469f99d0a414fb2573c3RKNXVBKIFV';
  const checkIn = '2026-11-01';
  const checkOut = '2026-11-03';
  const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${checkIn}&dateTo=${checkOut}&size=20`;
  
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  const data = await res.json();
  const items = Array.isArray(data) ? data : (data.data || []);
  const lodge1 = items.find(i => Number(i.id) === 449736);
  const jv = items.find(i => Number(i.id) === 529784);
  console.log('Lodge 1 (449736):', JSON.stringify(lodge1, null, 2));
  console.log('JV (529784):', JSON.stringify(jv, null, 2));
}

inspectRatePlanDetails();
