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

// Registered production domain
const prodDomain = 'https://flowerpowerphayam.com';

async function testPermutation(name, payloadBuilder, signBuilder) {
  const payload = payloadBuilder();
  const signStr = signBuilder(payload);
  const sign = crypto.createSign('RSA-SHA256').update(signStr, 'utf8').sign(newPrivateKey, 'hex').toLowerCase();
  const finalPayload = { ...payload, sign };

  try {
    const res = await fetch('https://gateway.ksher.com/api/gateway_pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalPayload)
    });
    const data = await res.json();
    if (data.code === 0 && data.data?.pay_url) {
      console.log(`\n🎉🎉🎉 SUCCESS [${name}]!`);
      console.log(`PAY URL: ${data.data.pay_url}`);
      return true;
    } else {
      console.log(`[${name}] -> code: ${data.code}, msg: ${data.msg || data.message}`);
    }
  } catch (err) {
    console.log(`[${name}] ERR:`, err.message);
  }
  return false;
}

function buildKeqV(p) {
  return Object.keys(p).filter(k => k !== 'sign' && p[k] !== undefined && p[k] !== '').sort().map(k => `${k}=${p[k]}`).join('&');
}

function buildKV(p) {
  return Object.keys(p).filter(k => k !== 'sign' && p[k] !== undefined && p[k] !== '').sort().map(k => `${k}${p[k]}`).join('');
}

async function run() {
  const base = {
    appid: appId,
    channel_list: 'card',
    fee_type: 'THB',
    mch_code: orderNo,
    mch_notify_url: `${prodDomain}/api/webhooks/ksher`,
    mch_order_no: orderNo,
    mch_redirect_url: `${prodDomain}/admin?status=success`,
    mch_redirect_url_fail: `${prodDomain}/admin?status=failed`,
    nonce_str: nonceStr,
    product_name: 'Flower Power Booking',
    refer_url: prodDomain,
    time_stamp: timeStamp,
    total_fee: 360000
  };

  // Permutation 1: Prod domain + k=v
  await testPermutation('Prod domain k=v', () => ({ ...base }), buildKeqV);

  // Permutation 2: Prod domain + kv
  await testPermutation('Prod domain kv', () => ({ ...base }), buildKV);

  // Permutation 3: channel_list 'card,promptpay'
  await testPermutation('card,promptpay k=v', () => ({ ...base, channel_list: 'card,promptpay' }), buildKeqV);

  // Permutation 4: total_fee as string
  await testPermutation('total_fee string', () => ({ ...base, total_fee: '360000' }), buildKeqV);

  // Permutation 5: total_fee 3600 (without Satangs)
  await testPermutation('total_fee 3600', () => ({ ...base, total_fee: 3600 }), buildKeqV);

  // Permutation 6: channel_list 'card' without mch_code
  await testPermutation('without mch_code', () => {
    const { mch_code, ...rest } = base;
    return rest;
  }, buildKeqV);
}

run();
