import crypto from 'crypto';

const newPrivateKey = `-----BEGIN RSA PRIVATE KEY-----
MIICYgIBAAKBgQCJRmZ8iEoz5P6pyucK9iYa/z1ybx1gKk/DqW9ZuQj5nvlOZ70l
iM6Jy7gLjx2rmKedDvi0RXs7KJ+7djjC4odk/7TNkBQD98BJ4WFmtBzlL3tEQISl
8d4FcKiNVpe/OG8NVOEEtK3JpTjhZvxxpBg24Gf4Gj9/8Tu3sRRAh25ixwIDAQAB
AoGBAISan+eOE/e7LhFAchzRmA+eHXJMSZkaZkDAjFKkfjn7SiJl7X2zgKf1RUzN
K8EVzlvWGYKyV47W+C2yzhH1EAzpHDOCviEMYksQeCaXjqUguNVQGiBOoW8+3dZa
2doRAr6S2HL1+z3MsfY+xHQXq5Vdp7RcZVXaRjaaNTbtmUEBAkUAp5nVbXY7tZJ0
hlSjp9zu5nzpCU5VBIpRJUZSnN2OVr/IoRaditKuEkY6y9oGm1qqTOFnIh+XqeOO
9aYouCaUubDk/0cCPQDRrdZGyJNqGw61Bt0LjTkpVsPr6wKBHEwzSmyb5ysOKVUK
j70A74Uw3SHmYtiHvFRfSpv3QiHj4oYIQIECRQCCX6QqdiKUZ8zFAeocljwwh1Iv
rwNreL0Opdl1tNMYoC9NP+5lIuXNyVvLX1psVubKzzwOy0yLFz0J0aszNK/UkspP
2QI9ALc7mbA7oY8s2/pYaByrKhO1DfuBYKvhRbngxO6s4hQ7DGTxXXKO3a7o37IM
GTrs2jJ36bn2odUaZJSbgQJEWHpAZ9KBipWy80KSSKZoeh4ZWQzsaTyKYxyyfYyf
0Kjul8ww8y/lB+i+itAQ/6GZvEKNKjavumjXYjLYohNdXeQTYEY=
-----END RSA PRIVATE KEY-----`;

const appId = 'mch39593';
const orderNo = `FP${Date.now()}`;
const timeStamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
const nonceStr = crypto.randomBytes(8).toString('hex');

const baseParams = {
  appid: appId,
  channel_list: 'card',
  fee_type: 'THB',
  mch_code: orderNo,
  mch_notify_url: 'https://flowerpowerphayam.com/api/webhooks/ksher',
  mch_order_no: orderNo,
  mch_redirect_url: 'http://localhost:3000/admin?status=success',
  mch_redirect_url_fail: 'http://localhost:3000/admin?status=failed',
  nonce_str: nonceStr,
  product_name: 'Flower Power Village',
  refer_url: 'http://localhost:3000',
  time_stamp: timeStamp,
  total_fee: 360000
};

async function testSignString(label, signStr) {
  const sign = crypto.createSign('RSA-SHA256').update(signStr, 'utf8').sign(newPrivateKey, 'hex').toLowerCase();
  const payload = { ...baseParams, sign };

  try {
    const res = await fetch('https://gateway.ksher.com/api/gateway_pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log(`[${label}] -> code: ${data.code}, msg: ${data.msg || data.message}`);
    if (data.code === 0 && data.data?.pay_url) {
      console.log('🎉🎉🎉 SUCCESS URL:', data.data.pay_url);
    }
  } catch (err) {
    console.log(`[${label}] ERR:`, err.message);
  }
}

async function run() {
  const keys = Object.keys(baseParams).sort();

  // Format 1: k=v&k=v
  const f1 = keys.map(k => `${k}=${baseParams[k]}`).join('&');
  await testSignString('k=v&k=v', f1);

  // Format 2: kvkvkv
  const f2 = keys.map(k => `${k}${baseParams[k]}`).join('');
  await testSignString('kvkvkv', f2);

  // Format 3: vvv (only sorted values)
  const f3 = keys.map(k => `${baseParams[k]}`).join('');
  await testSignString('sorted values only', f3);

  // Format 4: k=v (without sorting)
  const f4 = Object.keys(baseParams).map(k => `${k}=${baseParams[k]}`).join('&');
  await testSignString('natural order k=v', f4);

  // Format 5: JSON string
  const f5 = JSON.stringify(baseParams);
  await testSignString('raw JSON string', f5);
}

run();
