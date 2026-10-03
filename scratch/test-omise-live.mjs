import fs from 'fs';
import path from 'path';

function loadEnv() {
  const env = {};
  const files = ['.env', '.env.local'];
  for (const file of files) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          env[key] = val;
        }
      }
    }
  }
  return env;
}

const env = loadEnv();
const secretKey = env.OMISE_SECRET_KEY || process.env.OMISE_SECRET_KEY;
const publicKey = env.OMISE_PUBLIC_KEY || env.VITE_OMISE_PUBLIC_KEY || process.env.VITE_OMISE_PUBLIC_KEY;

console.log('SecretKey exists:', !!secretKey, secretKey ? secretKey.substring(0, 10) + '...' : '');
console.log('PublicKey exists:', !!publicKey, publicKey ? publicKey.substring(0, 10) + '...' : '');

async function testPromptPay() {
  if (!secretKey) {
    console.error('No secret key');
    return;
  }
  const authHeader = `Basic ${Buffer.from(secretKey + ":").toString("base64")}`;
  
  console.log('\n--- 1. Creating Omise Source (PromptPay) ---');
  const srcRes = await fetch('https://api.omise.co/sources', {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: 19000,
      currency: 'thb',
      type: 'promptpay'
    })
  });
  const srcData = await srcRes.json();
  console.log('Source response status:', srcRes.status, srcData);

  if (srcData.id) {
    console.log('\n--- 2. Creating Omise Charge with Source ---');
    const chgRes = await fetch('https://api.omise.co/charges', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: 19000,
        currency: 'thb',
        source: srcData.id,
        return_uri: 'https://flowerpowerpizza.com/pizza'
      })
    });
    const chgData = await chgRes.json();
    console.log('Charge response status:', chgRes.status, chgData);
    console.log('QR Image URI:', chgData.source?.scannable_code?.image?.download_uri);
  }
}

testPromptPay().catch(console.error);
