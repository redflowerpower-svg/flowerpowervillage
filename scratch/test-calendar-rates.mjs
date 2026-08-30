async function testCalendarRates() {
  const structureId = '366879';
  const token = '2c38b014603d469f99d0a414fb2573c3RKNXVBKIFV';
  const checkIn = '2026-08-31';
  const checkOut = '2026-09-05';
  const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${checkIn}&dateTo=${checkOut}&size=20`;
  
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  console.log('Octorate Calendar HTTP Status:', res.status);
  const data = await res.json();
  const items = Array.isArray(data) ? data : (data.data || []);
  console.log('Total calendar rooms returned:', items.length);
  for (const item of items.slice(0, 10)) {
    const days = item.days || [];
    const avgPrice = days.length > 0 ? (days.reduce((a, b) => a + (b.price || 0), 0) / days.length) : 0;
    const isClosed = days.some(d => d.stopSale || d.closed);
    console.log(`Calendar Room: id=${item.id}, name=${item.name}, daysCount=${days.length}, avgPrice=${avgPrice}, closed=${isClosed}`);
  }
}

testCalendarRates();
