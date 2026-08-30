async function testLiveOctorateRates() {
  const structureId = '366879';
  const token = '2c38b014603d469f99d0a414fb2573c3RKNXVBKIFV';
  const url = `https://api.octorate.com/connect/rest/v1/roomrates/${structureId}`;
  
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  console.log('Octorate Roomrates HTTP Status:', res.status);
  const data = await res.json();
  console.log('Octorate Roomrates Sample Items (first 3):\n', JSON.stringify(Array.isArray(data) ? data.slice(0, 3) : data, null, 2));
}

testLiveOctorateRates();
