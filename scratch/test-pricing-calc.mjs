import { calculatePaymentTotal } from '../src/lib/paymentCalculations.ts';

const basePrice = 50000;

console.log('--- TEST 1: BANK TRANSFER / CASH ---');
const bank = calculatePaymentTotal(basePrice, 'bank_transfer', 'it');
console.log('Bank Result:', {
  basePrice: bank.basePrice,
  vatAmount: bank.vatAmount,
  subtotalWithVat: bank.subtotalWithVat,
  finalTotal: bank.finalTotal,
  disclaimer: bank.disclaimer
});

console.log('\n--- TEST 2: KSHER (+4% incorporated) ---');
const ksher = calculatePaymentTotal(basePrice, 'ksher', 'it');
console.log('Ksher Result:', {
  basePrice: ksher.basePrice,
  vatAmount: ksher.vatAmount,
  subtotalWithVat: ksher.subtotalWithVat,
  finalTotal: ksher.finalTotal,
  disclaimer: ksher.disclaimer
});

console.log('\n--- TEST 3: PAYPAL (+10% incorporated) ---');
const paypal = calculatePaymentTotal(basePrice, 'paypal', 'it');
console.log('PayPal Result:', {
  basePrice: paypal.basePrice,
  vatAmount: paypal.vatAmount,
  subtotalWithVat: paypal.subtotalWithVat,
  finalTotal: paypal.finalTotal,
  disclaimer: paypal.disclaimer
});
