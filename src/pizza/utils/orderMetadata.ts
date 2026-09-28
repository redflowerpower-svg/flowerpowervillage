export interface ExtractedOrderMetadata {
  cleanAddress: string;
  customerEmail: string;
  deliveryNotes: string;
  orderLang: 'IT' | 'EN' | 'TH' | 'DE';
}

/**
 * Parses embedded bracket tags from the serialized address string safely in both browser and backend:
 * e.g. "Ranong 85000 [ADDR_TH: ...] [COORD: 9.9,98.6] [EMAIL: user@example.com] [NOTE: Ring bell] [LANG: IT]"
 */
export function extractOrderMetadata(rawAddress?: string): ExtractedOrderMetadata {
  if (!rawAddress || typeof rawAddress !== 'string') {
    return { cleanAddress: 'Ranong', customerEmail: '', deliveryNotes: '', orderLang: 'EN' };
  }

  const emailMatch = rawAddress.match(/\[EMAIL:\s*([^\]]+)\]/i);
  const noteMatch = rawAddress.match(/\[NOTE:\s*([^\]]+)\]/i);
  const langMatch = rawAddress.match(/\[LANG:\s*([^\]]+)\]/i);

  let cleanAddress = rawAddress
    .replace(/\[(COORD|ADDR_TH|EMAIL|NOTE|LANG):[^\]]+\]/gi, '')
    .trim();

  const customerEmail = emailMatch ? emailMatch[1].trim() : '';
  const deliveryNotes = noteMatch ? noteMatch[1].trim() : '';
  const rawLang = langMatch ? langMatch[1].trim().toUpperCase() : 'EN';
  const orderLang = (['IT', 'EN', 'TH', 'DE'].includes(rawLang) ? rawLang : 'EN') as 'IT' | 'EN' | 'TH' | 'DE';

  return {
    cleanAddress: cleanAddress || 'Ranong, Thailand',
    customerEmail,
    deliveryNotes,
    orderLang
  };
}
