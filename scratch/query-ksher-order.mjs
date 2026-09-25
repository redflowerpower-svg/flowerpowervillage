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

function normalizePrivateKey(key) {
  if (!key) return '';
  let cleaned = key.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }
  return cleaned.replace(/\\n/g, '\n');
}

function buildKsherSignString(params) {
  const keys = Object.keys(params)
    .filter((k) => k !== 'sign' && params[k] !== undefined && params[k] !== null && params[k] !== '')
    .sort();
  return keys.map((k) => `${k}=${params[k]}`).join('');
}

function signKsherPayload(params, key) {
  const signString = buildKsherSignString(params);
  const normalized = normalizePrivateKey(key);
  if (normalized.includes('-----BEGIN') || normalized.includes('PRIVATE KEY')) {
    try {
      const signer = crypto.createSign('RSA-MD5');
      signer.update(signString, 'utf8');
      signer.end();
      return signer.sign(normalized, 'hex').toLowerCase();
    } catch (err) {
      const signer = crypto.createSign('RSA-SHA256');
      signer.update(signString, 'utf8');
      signer.end();
      return signer.sign(normalized, 'hex').toLowerCase();
    }
  }
  return crypto.createHash('md5').update(signString + normalized, 'utf8').digest('hex').toLowerCase();
}

async function query() {
  const appId = envVars.KSHER_APP_ID || 'mch39593';
  const privateKey = envVars.KSHER_PRIVATE_KEY;
  const orderNo = 'FPBK27797776';
  const timeStamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const nonceStr = crypto.randomBytes(8).toString('hex');

  const payload = {
    appid: appId,
    mch_order_no: orderNo,
    nonce_str: nonceStr,
    time_stamp: timeStamp
  };

  payload.sign = signKsherPayload(payload, privateKey);

  console.log('Querying Ksher for:', orderNo);
  const endpoints = [
    'https://gateway.ksher.com/api/gateway_pay_query',
    'https://gateway.ksher.com/api/order_query',
    'https://gateway.ksher.com/api/query',
    'https://api.ksher.net/api/v1/order_query'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const txt = await res.text();
      console.log(`[${ep}] Status: ${res.status}, Body: ${txt.slice(0, 150)}`);
    } catch (e) {
      console.log(`[${ep}] Err:`, e.message);
    }
  }
}

query();
