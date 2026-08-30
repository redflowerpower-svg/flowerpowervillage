import { signKsherPayload } from '../api/_helpers/ksher.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
}

async function testWithReferUrl() {
  const appId = envVars.KSHER_APP_ID || 'mch39593';
  const privateKey = envVars.KSHER_PRIVATE_KEY;
  const orderNo = `FP${Date.now()}`;
  const timeStamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const nonceStr = crypto.randomBytes(8).toString('hex');

  const payload = {
    appid: appId,
    mch_code: orderNo,
    mch_order_no: orderNo,
    total_fee: 10000,
    fee_type: 'THB',
    channel_list: 'card,promptpay',
    nonce_str: nonceStr,
    time_stamp: timeStamp,
    mch_redirect_url: 'http://localhost:3000/admin?status=success',
    mch_redirect_url_fail: 'http://localhost:3000/admin?status=failed',
    mch_notify_url: 'https://flowerpowerphayam.com/api/webhooks/ksher',
    product_name: 'Flower Power Payment Test',
    refer_url: 'http://localhost:3000'
  };

  const sign = signKsherPayload(payload, privateKey);
  payload.sign = sign;

  try {
    const res = await fetch('https://gateway.ksher.com/api/gateway_pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log('KSHER OFFICIAL API RESULT:\n', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testWithReferUrl();
