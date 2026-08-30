async function testCheckAvailabilityPipeline() {
  const structureId = '366879';
  const token = '2c38b014603d469f99d0a414fb2573c3RKNXVBKIFV';
  const checkIn = '2026-11-01';
  const checkOut = '2026-11-05';
  const guests = 2;

  const WHITELISTED_RATEPLAN_IDS = [
    529784, 495807, 495980, 495566, 449348, 449385, 449422, 449668,
    449674, 449675, 449678, 449684, 449699, 449724, 449730, 449736,
    923905, 449742
  ];

  const collected = [];
  const foundIds = new Set();
  let page = 0;
  const PAGE_SIZE = 20;
  const MAX_PAGES_SAFETY_CAP = 30;

  while (page < MAX_PAGES_SAFETY_CAP && foundIds.size < WHITELISTED_RATEPLAN_IDS.length) {
    const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${checkIn}&dateTo=${checkOut}&size=${PAGE_SIZE}&page=${page}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      console.error(`Calendar page ${page} failed with status:`, res.status);
      break;
    }

    const data = await res.json();
    const pageItems = Array.isArray(data) ? data : (data.data || []);
    if (pageItems.length === 0) break;

    for (const item of pageItems) {
      const id = Number(item.id);
      if (WHITELISTED_RATEPLAN_IDS.includes(id) && !foundIds.has(id)) {
        foundIds.add(id);
        collected.push(item);
      }
    }

    if (pageItems.length < PAGE_SIZE) break;
    page++;
  }

  console.log(`Found ${foundIds.size} of ${WHITELISTED_RATEPLAN_IDS.length} whitelisted rate plans.`);
  for (const item of collected) {
    const days = item.days || [];
    const avgPrice = days.length > 0 ? (days.reduce((a, b) => a + (b.price || 0), 0) / days.length) : 0;
    const isStopSells = days.some(d => d.stopSells || d.stopSell);
    const isBookable = days.every(d => d.bookable !== false);
    const minStay = Math.max(...days.map(d => d.minStay || 0));
    console.log(`RatePlan id=${item.id} (${item.name}): avgPrice=${avgPrice} THB, days=${days.length}, stopSells=${isStopSells}, bookable=${isBookable}, minStay=${minStay}`);
  }
}

testCheckAvailabilityPipeline();
