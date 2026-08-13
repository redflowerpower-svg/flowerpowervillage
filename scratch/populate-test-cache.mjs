import fs from 'fs';
import path from 'path';

const testCachePath = path.resolve(process.cwd(), 'scratch/octorate-test-live-cache.json');

const testCache = {
  be: [
    { id: 'be_live_p1', name: 'Periodo 1: Ottobre - Novembre', dateFrom: '2026-10-01', dateTo: '2027-10-31', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckoutDays: 0, onlyCheckOutDays: 0, strategy: 'open' }
  ],
  '7d': [
    { id: '7d_live_p1', name: 'Periodo 1: Ottobre', dateFrom: '2026-10-01', dateTo: '2026-12-15', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckoutDays: 0, onlyCheckOutDays: 0, strategy: 'open' },
    { id: '7d_live_p2', name: 'Periodo 2', dateFrom: '2027-04-01', dateTo: '2027-10-31', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckoutDays: 0, onlyCheckOutDays: 0, strategy: 'open' }
  ],
  main_bnb_7d: [
    { id: 'mb7_live_p1', name: 'Only Check-out (10gg)', dateFrom: '2026-10-01', dateTo: '2026-12-15', stopSell: false, closedToArrival: true, closedToDeparture: false, onlyCheckoutDays: 10, onlyCheckOutDays: 10, strategy: 'failsafe_checkout' },
    { id: 'mb7_live_p2', name: 'Periodo 2: 15/01/2027 - 31/10/2027', dateFrom: '2027-01-15', dateTo: '2027-10-31', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckoutDays: 0, onlyCheckOutDays: 0, strategy: 'open' }
  ],
  main_bnb_14d: [
    { id: 'mb14_live_p1', name: 'Only Check-out (10gg)', dateFrom: '2026-12-16', dateTo: '2027-01-15', stopSell: false, closedToArrival: true, closedToDeparture: false, onlyCheckoutDays: 10, onlyCheckOutDays: 10, strategy: 'failsafe_checkout' }
  ],
  agd_ac_7d: [
    { id: 'ag7_live_p1', name: 'Only Check-out (10gg)', dateFrom: '2026-10-01', dateTo: '2026-12-15', stopSell: false, closedToArrival: true, closedToDeparture: false, onlyCheckoutDays: 10, onlyCheckOutDays: 10, strategy: 'failsafe_checkout' },
    { id: 'ag7_live_p2', name: 'Periodo 2', dateFrom: '2027-01-16', dateTo: '2027-10-31', stopSell: false, closedToArrival: false, closedToDeparture: false, onlyCheckoutDays: 0, onlyCheckOutDays: 0, strategy: 'open' }
  ],
  agd_ac_14d: [
    { id: 'ag14_live_p1', name: 'Only Check-out (10gg)', dateFrom: '2026-12-16', dateTo: '2027-01-15', stopSell: false, closedToArrival: true, closedToDeparture: false, onlyCheckoutDays: 10, onlyCheckOutDays: 10, strategy: 'failsafe_checkout' }
  ],
  airbnb: [
    { id: 'ab_live_p1', name: 'Only Check-out (10gg)', dateFrom: '2026-10-01', dateTo: '2027-10-31', stopSell: false, closedToArrival: true, closedToDeparture: false, onlyCheckoutDays: 10, onlyCheckOutDays: 10, strategy: 'failsafe_checkout' }
  ]
};

fs.writeFileSync(testCachePath, JSON.stringify(testCache, null, 2));
console.log('✅ Test live cache popolate con successo in scratch/octorate-test-live-cache.json');
