import { Language } from '../config/languages';

export interface ExtractedOrderMetadata {
  cleanAddress: string;
  customerEmail: string;
  deliveryNotes: string;
  orderLang: Language;
  promoCode?: string;
  discountAmount?: number;
  diningVoucher?: string;
  tableStation?: string;
}

/**
 * Parses embedded bracket tags from the serialized address string safely in both browser and backend:
 * e.g. "Ranong 85000 [ADDR_TH: ...] [COORD: 9.9,98.6] [EMAIL: user@example.com] [NOTE: Ring bell] [LANG: IT] [PROMO: PIZZA2026] [DISCOUNT: 45] [DINING_VOUCHER: DINE10-ABC12]"
 */
export function extractOrderMetadata(rawAddress?: string): ExtractedOrderMetadata {
  if (!rawAddress || typeof rawAddress !== 'string') {
    return { cleanAddress: 'Ranong', customerEmail: '', deliveryNotes: '', orderLang: 'EN', promoCode: '', discountAmount: 0, diningVoucher: '', tableStation: '' };
  }

  const emailMatch = rawAddress.match(/\[EMAIL:\s*([^\]]+)\]/i);
  const noteMatch = rawAddress.match(/\[NOTE:\s*([^\]]+)\]/i);
  const langMatch = rawAddress.match(/\[LANG:\s*([^\]]+)\]/i);
  const promoMatch = rawAddress.match(/\[PROMO:\s*([^\]]+)\]/i);
  const discountMatch = rawAddress.match(/\[DISCOUNT:\s*([^\]]+)\]/i);
  const voucherMatch = rawAddress.match(/\[DINING_VOUCHER:\s*([^\]]+)\]/i);
  const dineInMatch = rawAddress.match(/\[DINE-IN:\s*([^\]]+)\]/i);

  let cleanAddress = rawAddress
    .replace(/\[(COORD|ADDR_TH|EMAIL|NOTE|LANG|DID|PROMO|DISCOUNT|HOTEL|DINING_VOUCHER|DINE-IN|INTEGRAZIONE_COMANDA):[^\]]*\]/gi, '')
    .trim();

  const customerEmail = emailMatch ? emailMatch[1].trim() : '';
  const deliveryNotes = noteMatch ? noteMatch[1].trim() : '';
  const rawLang = langMatch ? langMatch[1].trim().toUpperCase() : 'EN';
  const validLangs: Language[] = ['IT', 'EN', 'TH', 'MM', 'DE', 'ES', 'FR', 'RU', 'ZH'];
  const orderLang = (validLangs.includes(rawLang as Language) ? rawLang : 'EN') as Language;
  const promoCode = promoMatch ? promoMatch[1].trim().toUpperCase() : '';
  const discountAmount = discountMatch ? parseFloat(discountMatch[1].trim()) || 0 : 0;
  const diningVoucher = voucherMatch ? voucherMatch[1].trim().toUpperCase() : '';
  const tableStation = dineInMatch ? dineInMatch[1].trim() : '';

  return {
    cleanAddress: cleanAddress || 'Ranong, Thailand',
    customerEmail,
    deliveryNotes,
    orderLang,
    promoCode,
    discountAmount,
    diningVoucher,
    tableStation
  };
}

