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

const baseParams = {
  appid: appId,
  channel_list: 'card,promptpay',
  fee_type: 'THB',
  mch_code: orderNo,
  mch_notify_url: 'https://flowerpowerphayam.com/api/webhooks/ksher',
  mch_order_no: orderNo,
  mch_redirect_url: 'http://localhost:3000/admin?status=success',
  mch_redirect_url_fail: 'http://localhost:3000/admin?status=failed',
  nonce_str: nonceStr,
  product_name: 'Flower Power Payment Test',
  refer_url: 'http://localhost:3000',
  time_stamp: timeStamp,
  total_fee: 10000
};

function buildSignString(params) {
  const keys = Object.keys(params).filter(k => k !== 'sign' && params[k] !== undefined && params[k] !== null && params[k] !== '').sort();
  return keys.map(k => `${k}=${params[k]}`).join('&');
}

function buildSignStringWithoutEquals(params) {
  const keys = Object.keys(params).filter(k => k !== 'sign' && params[k] !== undefined && params[k] !== null && params[k] !== '').sort();
  return keys.map(k => `${params[k]}`).join('');
}

async function testSignVariant(name, signValue) {
  const payload = { ...baseParams, sign: signValue };
  try {
    const res = await fetch('https://gateway.ksher.com/api/gateway_pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log(`[${name}] -> code: ${data.code}, msg: ${data.msg || data.message}`);
    if (data.code === 0 || data.data) {
      console.log('🎉 SUCCESS DATA:', data);
    }
  } catch (e) {
    console.log(`[${name}] ERR: ${e.message}`);
  }
}

async function runTests() {
  const signStr = buildSignString(baseParams);
  const signStrNoEq = buildSignStringWithoutEquals(baseParams);

  // Variant 1: RSA-SHA256 hex lowercase
  const s1 = crypto.createSign('RSA-SHA256').update(signStr).sign(privateKey, 'hex').toLowerCase();
  await testSignVariant('RSA-SHA256 hex lower', s1);

  // Variant 2: RSA-SHA256 hex uppercase
  await testSignVariant('RSA-SHA256 hex UPPER', s1.toUpperCase());

  // Variant 3: RSA-SHA256 base64
  const s3 = crypto.createSign('RSA-SHA256').update(signStr).sign(privateKey, 'base64');
  await testSignVariant('RSA-SHA256 base64', s3);

  // Variant 4: RSA-MD5 hex lower
  try {
    const s4 = crypto.createSign('RSA-MD5').update(signStr).sign(privateKey, 'hex').toLowerCase();
    await testSignVariant('RSA-MD5 hex lower', s4);
  } catch (e) {}

  // Variant 5: RSA-SHA1 hex lower
  const s5 = crypto.createSign('RSA-SHA1').update(signStr).sign(privateKey, 'hex').toLowerCase();
  await testSignVariant('RSA-SHA1 hex lower', s5);

  // Variant 6: MD5 of signStr
  const s6 = crypto.createHash('md5').update(signStr).digest('hex').toLowerCase();
  await testSignVariant('MD5 hex lower', s6);

  // Variant 7: MD5 of signStr with RSA sign on MD5
  const md5Digest = crypto.createHash('md5').update(signStr).digest('hex');
  const s7 = crypto.createSign('RSA-SHA256').update(md5Digest).sign(privateKey, 'hex').toLowerCase();
  await testSignVariant('RSA-SHA256 on MD5 digest', s7);

  // Variant 8: RSA-SHA256 on NoEq string
  const s8 = crypto.createSign('RSA-SHA256').update(signStrNoEq).sign(privateKey, 'hex').toLowerCase();
  await testSignVariant('RSA-SHA256 on NoEq string', s8);
}

runTests();
