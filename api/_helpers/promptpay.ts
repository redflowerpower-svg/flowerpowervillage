/**
 * Official EMVCo Thai PromptPay QR Code Generator with CRC16-CCITT
 */

function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    let c = data.charCodeAt(i);
    crc ^= c << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatTag(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${tag}${len}${value}`;
}

export function generatePromptPayPayload(target: string, amount?: number): string {
  // Clean target (Phone or Tax ID)
  const cleanTarget = target.replace(/[^0-9]/g, '');
  let formattedTarget = cleanTarget;
  let targetTag = '01'; // Default to mobile phone (Tag 29 subtag 01)

  if (cleanTarget.length === 13) {
    // 13 digits: Tax ID / National ID (Sub-tag 02)
    targetTag = '02';
    formattedTarget = cleanTarget;
  } else if (cleanTarget.startsWith('0')) {
    // Thai Mobile format 08x -> 00668x
    formattedTarget = `0066${cleanTarget.substring(1)}`;
  } else if (cleanTarget.startsWith('66')) {
    formattedTarget = `00${cleanTarget}`;
  }

  // Subtags for PromptPay AID (A000000677010111)
  const aidTag = formatTag('00', 'A000000677010111');
  const recipientTag = formatTag(targetTag, formattedTarget);
  const merchantAccountInfo = formatTag('29', aidTag + recipientTag);

  // Format indicator & initiation method (12 for dynamic with amount, 11 for static)
  const payloadFormat = formatTag('00', '01');
  const pointOfInitiation = formatTag('01', amount && amount > 0 ? '12' : '11');
  const countryCode = formatTag('58', 'TH');
  const currencyCode = formatTag('53', '764'); // THB

  let payload = payloadFormat + pointOfInitiation + merchantAccountInfo + countryCode + currencyCode;

  if (amount && amount > 0) {
    const formattedAmount = amount.toFixed(2);
    payload += formatTag('54', formattedAmount);
  }

  // Add Tag 63 (Checksum) header
  const rawDataForCrc = payload + '6304';
  const checksum = crc16(rawDataForCrc);

  return rawDataForCrc + checksum;
}
