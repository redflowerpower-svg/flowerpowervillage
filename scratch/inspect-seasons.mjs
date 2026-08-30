async function inspectOctorateSeasons() {
  const structureId = '366879';
  const token = '2c38b014603d469f99d0a414fb2573c3RKNXVBKIFV';

  const testRanges = [
    { name: 'Current (End Aug / Early Sep 2026)', from: '2026-08-31', to: '2026-09-02' },
    { name: 'High Season (Nov 2026)', from: '2026-11-15', to: '2026-11-17' },
    { name: 'Peak Season (Jan 2027)', from: '2027-01-10', to: '2027-01-12' }
  ];

  for (const r of testRanges) {
    console.log(`\n=== RANGE: ${r.name} (${r.from} -> ${r.to}) ===`);
    const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${r.from}&dateTo=${r.to}&size=50`;
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } });
    if (!res.ok) {
      console.log('Error fetching range:', res.status);
      continue;
    }
    const data = await res.json();
    const items = Array.isArray(data) ? data : (data.data || []);
    for (const item of items) {
      if (item.name?.endsWith('BE') || item.name?.includes('BE')) {
        const days = item.days || [];
        const p0 = days[0]?.price;
        const avail = days[0]?.availability;
        const ss = days[0]?.stopSells;
        console.log(`  - ${item.name} (id ${item.id}): Price=${p0} THB | Avail=${avail} | StopSells=${ss}`);
      }
    }
  }
}

inspectOctorateSeasons();
