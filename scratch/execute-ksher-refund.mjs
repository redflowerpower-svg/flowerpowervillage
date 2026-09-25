import { getKsherAppId, getKsherPrivateKey, signKsherPayload } from '../api/_helpers/ksher.js';
import crypto from 'crypto';

async function executeRefund() {
  const appId = getKsherAppId();
  const privateKey = getKsherPrivateKey();

  // Data retrieved from Gateway Order Query for order FPBK27797776
  const payMchOrderNo = '2609241229581056';
  const ksherOrderNo = '90020260924133033340158';
  const channelOrderNo = 'chrg_prod_2325ffd218d08d2c40b4a38b6da4ea65182b';
  const totalFee = 9900; // 99.00 THB in Satang
  const refundFee = 9900;
  const mchRefundNo = `rf_${Date.now().toString().slice(-10)}`;
  const nonceStr = crypto.randomBytes(8).toString('hex');
  const timeStamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

  const params = {
    appid: appId,
    channel: 'card',
    channel_order_no: channelOrderNo,
    fee_type: 'THB',
    ksher_order_no: ksherOrderNo,
    mch_order_no: payMchOrderNo,
    mch_refund_no: mchRefundNo,
    nonce_str: nonceStr,
    refund_fee: refundFee,
    time_stamp: timeStamp,
    total_fee: totalFee
  };

  const sign = signKsherPayload(params, privateKey);
  params.sign = sign;

  console.log('--- EXECUTING KSHER REFUND ---');
  console.log('Refund Request Payload:', params);

  const formBody = new URLSearchParams(params).toString();

  const res = await fetch('https://api.mch.ksher.net/KsherPay/order_refund', {
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

executeRefund();
