import { signKsherPayload, getKsherPrivateKey } from '../api/_helpers/ksher.js';

try {
  console.log('🔑 [TEST] Validazione RSA Private Key Ksher...');
  const sampleParams = {
    appid: 'mch_test_flowerpower',
    mch_order_no: 'FP-TEST-001',
    total_fee: 1000,
    fee_type: 'THB',
    channel: 'promptpay',
    time_stamp: '20260828161500'
  };

  const signature = signKsherPayload(sampleParams);
  console.log('✅ Chiave Privata RSA Valida e Funzionante al 100%!');
  console.log('📝 Firma Digitale Generata (HEX):', signature.substring(0, 40) + '...');
} catch (err) {
  console.error('❌ Errore Chiave RSA Ksher:', err);
}
