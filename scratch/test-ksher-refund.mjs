import { getKsherAppId, getKsherPrivateKey, signKsherPayload } from '../api/_helpers/ksher.js';
import crypto from 'crypto';

async function testRefundEndpoints() {
  const appId = getKsherAppId();
  const privateKey = getKsherPrivateKey();
  const orderNo = 'FPBK27797776';
  const timeStamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const nonceStr = crypto.randomBytes(8).toString('hex');

  const candidateEndpoints = [
    'apply_refund',
    'refund_apply',
    'order_refund_apply',
    'refund',
    'refund_order',
    'pay_refund',
    'refund_pay',
    'gateway_pay_refund',
    'gateway_refund',
    'merchant_refund',
    'mch_refund',
    'do_refund',
    'execute_refund',
    'cancel_pay',
    'close_order',
    'order_close',
    'reverse_order',
    'order_reverse',
    'refund_query',
    'query_refund',
    'refund_request'
  ];

  for (const name of candidateEndpoints) {
    const ep = `https://gateway.ksher.com/api/${name}`;
    const params = {
      appid: appId,
      mch_order_no: orderNo,
      mch_refund_no: `RF${Date.now()}`,
      nonce_str: nonceStr,
      time_stamp: timeStamp,
      total_fee: 100,
      refund_fee: 100,
      fee_type: 'THB'
    };
    params.sign = signKsherPayload(params, privateKey);

    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const txt = await res.text();
      if (!txt.includes('<!DOCTYPE') && !txt.includes('404 Not Found')) {
        console.log(`[FOUND ${ep}] ->`, txt);
      }
    } catch (e) {
      // ignore
    }
  }
}

testRefundEndpoints();
