import crypto from 'crypto';
import { signKsherPayload } from './api/_helpers/ksher.js';

try {
  const params = { appid: 'mch39593', total_fee: '1000' };
  const sign = signKsherPayload(params);
  console.log('Ksher sign test OK:', sign);
} catch (e) {
  console.error('Ksher sign test ERROR:', e);
}
