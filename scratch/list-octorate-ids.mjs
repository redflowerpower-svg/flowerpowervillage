import { ACCOMMODATIONS } from '../src/booking/resort/config/accommodations';

console.log('Accommodations in config:');
for (const acc of ACCOMMODATIONS) {
  console.log(`${acc.name}: id=${acc.id}, octorateId=${acc.octorateId}`);
}
