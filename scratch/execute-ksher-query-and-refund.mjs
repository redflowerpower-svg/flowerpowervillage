import { getKsherAppId, getKsherPrivateKey, signKsherPayload } from '../api/_helpers/ksher.js';
import crypto from 'crypto';

async function queryOrder() {
  const appId = getKsherAppId();
  const privateKey = getKsherPrivateKey();
  const orderNo = 'FPBK27797776';
  const timeStamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const nonceStr = crypto.randomBytes(8).toString('hex');

  const params = {
    appid: appId,
    mch_order_no: orderNo,
    nonce_str: nonceStr,
    time_stamp: timeStamp
  };

  const sign = signKsherPayload(params, privateKey);
  params.sign = sign;

  console.log('--- Calling Gateway Order Query ---');
  console.log('Params:', params);

  const formBody = new URLSearchParams(params).toString();

  const res = await fetch('https://gateway.ksher.com/api/gateway_order_query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formBody
  });

  console.log('HTTP Status:', res.status);
  const text = await res.text();
  console.log('Response:\n', text);
}

queryOrder();
