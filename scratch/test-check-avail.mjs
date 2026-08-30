import { checkAvailability } from './src/booking/lib/octorate.js';

async function testAvailability() {
  const checkIn = '2026-11-10';
  const checkOut = '2026-11-15';
  const guests = 2;
  console.log('Testing availability check...');
  const res = await checkAvailability(checkIn, checkOut, guests);
  console.log('Availability results count:', res.length);
  if (res.length > 0) {
    console.log('Sample result:', res[0]);
  }
}

testAvailability();
