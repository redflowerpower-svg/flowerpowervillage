async function inspectRoomRates() {
  const structureId = '366879';
  const token = '2c38b014603d469f99d0a414fb2573c3RKNXVBKIFV';
  const url = `https://api.octorate.com/connect/rest/v1/roomrates/${structureId}`;
  
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  const data = await res.json();
  console.log('Total items in roomrates:', data.length);
  for (const item of data) {
    console.log(`Room: id=${item.id}, name=${item.name}, minimumSellingPrice=${item.minimumSellingPrice}, defaultPrice=${item.defaultPrice}`);
  }
}

inspectRoomRates();
