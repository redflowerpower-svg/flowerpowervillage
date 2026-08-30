async function inspectCalendarDayStructure() {
  const structureId = '366879';
  const token = '2c38b014603d469f99d0a414fb2573c3RKNXVBKIFV';
  const checkIn = '2026-11-01';
  const checkOut = '2026-11-04';
  const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${checkIn}&dateTo=${checkOut}&size=2`;
  
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  const data = await res.json();
  const items = Array.isArray(data) ? data : (data.data || []);
  if (items.length > 0) {
    console.log('Room Name:', items[0].name, 'ID:', items[0].id);
    console.log('Days sample (first 2 days):\n', JSON.stringify(items[0].days.slice(0, 2), null, 2));
  }
}

inspectCalendarDayStructure();
