import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { normalizePrivateKey } from '../api/_helpers/ksher.js';

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

const appId = envVars.KSHER_APP_ID || 'mch39593';
const privateKey = normalizePrivateKey(envVars.KSHER_PRIVATE_KEY);
const orderNo = `FP${Date.now()}`;
const timeStamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
const nonceStr = crypto.randomBytes(8).toString('hex');

async function testVariation(description, payloadBuilder) {
  const payload = payloadBuilder();
  try {
    const res = await fetch('https://gateway.ksher.com/api/gateway_pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log(`[${description}] -> code: ${data.code}, msg: ${data.msg || data.message}`);
    if (data.code === 0 && data.data?.pay_url) {
      console.log('🎉🎉🎉 SUCCESS PAY URL:', data.data.pay_url);
    }
  } catch (err) {
    console.log(`[${description}] ERR:`, err.message);
  }
}

function rsaSign(str) {
  return crypto.createSign('RSA-SHA256').update(str, 'utf8').sign(privateKey, 'hex').toLowerCase();
}

function rsaSignUpper(str) {
  return crypto.createSign('RSA-SHA256').update(str, 'utf8').sign(privateKey, 'hex').toUpperCase();
}

async function run() {
  // Test 1: all string values
  await testVariation('Strings with RSA hex lower', () => {
    const p = {
      appid: appId,
      channel_list: 'card',
      fee_type: 'THB',
      mch_code: orderNo,
      mch_notify_url: 'https://flowerpowerphayam.com/api/webhooks/ksher',
      mch_order_no: orderNo,
      mch_redirect_url: 'http://localhost:3000/admin?status=success',
      mch_redirect_url_fail: 'http://localhost:3000/admin?status=failed',
      nonce_str: nonceStr,
      product_name: 'Flower Power Village Test',
      refer_url: 'http://localhost:3000',
      time_stamp: timeStamp,
      total_fee: '10000'
    };
    const str = Object.keys(p).sort().map(k => `${k}=${p[k]}`).join('&');
    return { ...p, sign: rsaSign(str) };
  });

  // Test 2: RSA hex UPPER
  await testVariation('Strings with RSA hex UPPER', () => {
    const p = {
      appid: appId,
      channel_list: 'card',
      fee_type: 'THB',
      mch_code: orderNo,
      mch_notify_url: 'https://flowerpowerphayam.com/api/webhooks/ksher',
      mch_order_no: orderNo,
      mch_redirect_url: 'http://localhost:3000/admin?status=success',
      mch_redirect_url_fail: 'http://localhost:3000/admin?status=failed',
      nonce_str: nonceStr,
      product_name: 'Flower Power Village Test',
      refer_url: 'http://localhost:3000',
      time_stamp: timeStamp,
      total_fee: '10000'
    };
    const str = Object.keys(p).sort().map(k => `${k}=${p[k]}`).join('&');
    return { ...p, sign: rsaSignUpper(str) };
  });

  // Test 3: total_fee as number 10000
  await testVariation('Number fee with RSA hex lower', () => {
    const p = {
      appid: appId,
      channel_list: 'card',
      fee_type: 'THB',
      mch_code: orderNo,
      mch_notify_url: 'https://flowerpowerphayam.com/api/webhooks/ksher',
      mch_order_no: orderNo,
      mch_redirect_url: 'http://localhost:3000/admin?status=success',
      mch_redirect_url_fail: 'http://localhost:3000/admin?status=failed',
      nonce_str: nonceStr,
      product_name: 'Flower Power Village Test',
      refer_url: 'http://localhost:3000',
      time_stamp: timeStamp,
      total_fee: 10000
    };
    const str = Object.keys(p).sort().map(k => `${k}=${p[k]}`).join('&');
    return { ...p, sign: rsaSign(str) };
  });

  // Test 4: channel_list 'card,promptpay'
  await testVariation('channel_list card,promptpay', () => {
    const p = {
      appid: appId,
      channel_list: 'card,promptpay',
      fee_type: 'THB',
      mch_code: orderNo,
      mch_notify_url: 'https://flowerpowerphayam.com/api/webhooks/ksher',
      mch_order_no: orderNo,
      mch_redirect_url: 'http://localhost:3000/admin?status=success',
      mch_redirect_url_fail: 'http://localhost:3000/admin?status=failed',
      nonce_str: nonceStr,
      product_name: 'Flower Power Village Test',
      refer_url: 'http://localhost:3000',
      time_stamp: timeStamp,
      total_fee: 10000
    };
    const str = Object.keys(p).sort().map(k => `${k}=${p[k]}`).join('&');
    return { ...p, sign: rsaSign(str) };
  });
}

run();
