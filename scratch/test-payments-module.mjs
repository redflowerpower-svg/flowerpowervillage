import { handlePaymentsAdmin } from '../api/_handlers/payments-admin.js';

async function runTests() {
  console.log('🚀 [TEST 1/4] Test Get Settings (Fallback / Mock API)');
  let mockResJson = null;
  const mockRes = {
    setHeader: () => {},
    status: (code) => ({
      json: (data) => {
        mockResJson = { code, data };
        return mockResJson;
      },
      end: () => {}
    })
  };

  const reqGet = { method: 'GET', query: { action: 'get-settings' }, headers: {} };
  await handlePaymentsAdmin(reqGet, mockRes);
  console.log('✅ Risposta GET Settings:', JSON.stringify(mockResJson, null, 2));

  console.log('\n🚀 [TEST 2/4] Test Transaction Simulation - Ksher (PromptPay)');
  const reqKsher = {
    method: 'POST',
    query: { action: 'test-transaction' },
    body: {
      gateway: 'ksher',
      amount: 1500,
      paymentChannel: 'promptpay',
      customerName: 'Marco Rossi',
      customerEmail: 'marco@example.com'
    }
  };
  await handlePaymentsAdmin(reqKsher, mockRes);
  console.log('✅ Risposta Test Ksher:', JSON.stringify(mockResJson, null, 2));

  console.log('\n🚀 [TEST 3/4] Test Transaction Simulation - Omise');
  const reqOmise = {
    method: 'POST',
    query: { action: 'test-transaction' },
    body: {
      gateway: 'omise',
      amount: 2400,
      paymentChannel: 'card',
      customerName: 'John Doe',
      customerEmail: 'john@example.com'
    }
  };
  await handlePaymentsAdmin(reqOmise, mockRes);
  console.log('✅ Risposta Test Omise:', JSON.stringify(mockResJson, null, 2));

  console.log('\n🚀 [TEST 4/4] Test Transaction Simulation - PayPal');
  const reqPayPal = {
    method: 'POST',
    query: { action: 'test-transaction' },
    body: {
      gateway: 'paypal',
      amount: 3200,
      customerName: 'Anna Weber',
      customerEmail: 'anna@example.com'
    }
  };
  await handlePaymentsAdmin(reqPayPal, mockRes);
  console.log('✅ Risposta Test PayPal:', JSON.stringify(mockResJson, null, 2));
}

runTests().catch((err) => console.error('❌ Errore esecuzione test:', err));
