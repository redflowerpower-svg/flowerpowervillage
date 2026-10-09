async function testPublicUrls() {
  console.log('Testing Public CDN URLs for Promo Codes...');

  const resortUrl = 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/site-images/resort_promo_codes.json';
  const pizzaUrl = 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/site-images/pizza_promo_codes.json';

  try {
    const res1 = await fetch(`${resortUrl}?_ts=${Date.now()}`);
    console.log('Resort CDN Status:', res1.status, res1.ok);
    const data1 = await res1.json();
    console.log('Resort Promos Count:', data1.length, data1);
  } catch (err) {
    console.error('Resort CDN Error:', err.message);
  }

  try {
    const res2 = await fetch(`${pizzaUrl}?_ts=${Date.now()}`);
    console.log('Pizza CDN Status:', res2.status, res2.ok);
    const data2 = await res2.json();
    console.log('Pizza Promos Count:', data2.length, data2);
  } catch (err) {
    console.error('Pizza CDN Error:', err.message);
  }
}

testPublicUrls();
