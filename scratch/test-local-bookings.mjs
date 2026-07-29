async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/resort/octorate-bookings');
    console.log('Status:', res.status);
    const json = await res.json();
    console.log('Bookings returned count:', json.data?.length);
    if (json.data && json.data.length > 0) {
      console.log('Sample booking:', json.data[0]);
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}
test();
