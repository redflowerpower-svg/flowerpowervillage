import { Language } from '../config/languages';

export const DINING_TABLES = [
  'Tavolo 1',
  'Tavolo 2',
  'Tavolo 3',
  'Tavolo 4',
  'Tavolo 5',
  'Tavolo 6',
  'Tavolo 7',
  'Tavolo 8',
  'Tavolo 9',
  'Tavolo 10',
  'Tavolo 11',
  'Tavolo 12',
  'Cliente 1',
  'Cliente 2',
  'Cliente 3',
  'Cliente 4',
];

export const getCanonicalTableKey = (tableName: string): string => {
  if (!tableName) return '';
  const trimmed = tableName.trim();
  const tableMatch = trimmed.match(/^(?:Tavolo|Table|Tisch|โต๊ะ)\s*(\d+)$/i);
  if (tableMatch) return `Tavolo ${tableMatch[1]}`;
  const clientMatch = trimmed.match(/^(?:Cliente|Guest|Customer|Gast|Kunde|ลูกค้า)\s*(\d+)$/i);
  if (clientMatch) return `Cliente ${clientMatch[1]}`;
  return trimmed;
};

export const formatTableStationName = (tableName: string, lang: Language = 'IT'): string => {
  if (!tableName) return '';
  const trimmed = tableName.trim();

  // Match Tavolo / Table / Tisch / โต๊ะ
  const tableMatch = trimmed.match(/^(?:Tavolo|Table|Tisch|โต๊ะ)\s*(\d+)$/i);
  if (tableMatch) {
    const num = tableMatch[1];
    switch (lang) {
      case 'EN': return `Table ${num}`;
      case 'TH': return `โต๊ะ ${num}`;
      case 'DE': return `Tisch ${num}`;
      case 'IT':
      default: return `Tavolo ${num}`;
    }
  }

  // Match Cliente / Guest / Customer / Gast / Kunde / ลูกค้า
  const clientMatch = trimmed.match(/^(?:Cliente|Guest|Customer|Gast|Kunde|ลูกค้า)\s*(\d+)$/i);
  if (clientMatch) {
    const num = clientMatch[1];
    switch (lang) {
      case 'EN': return `Guest ${num}`;
      case 'TH': return `ลูกค้า ${num}`;
      case 'DE': return `Gast ${num}`;
      case 'IT':
      default: return `Cliente ${num}`;
    }
  }

  // Match Terrazza / Terrace / Terrasse / ระเบียง
  const terraceMatch = trimmed.match(/^(?:Terrazza|Terrace|Terrasse|ระเบียง)\s*(\d*)$/i);
  if (terraceMatch) {
    const num = terraceMatch[1] ? ` ${terraceMatch[1]}` : '';
    switch (lang) {
      case 'EN': return `Terrace${num}`;
      case 'TH': return `ระเบียง${num}`;
      case 'DE': return `Terrasse${num}`;
      case 'IT':
      default: return `Terrazza${num}`;
    }
  }

  // Match Giardino / Garden / Garten / สวน
  const gardenMatch = trimmed.match(/^(?:Giardino|Garden|Garten|สวน)\s*(\d*)$/i);
  if (gardenMatch) {
    const num = gardenMatch[1] ? ` ${gardenMatch[1]}` : '';
    switch (lang) {
      case 'EN': return `Garden${num}`;
      case 'TH': return `โซนสวน${num}`;
      case 'DE': return `Garten${num}`;
      case 'IT':
      default: return `Giardino${num}`;
    }
  }

  // Match Bancone / Counter / Bar / เคาน์เตอร์
  if (/^(?:Bancone|Counter|Bar|เคาน์เตอร์)$/i.test(trimmed)) {
    switch (lang) {
      case 'EN': return 'Bar Counter';
      case 'TH': return 'เคาน์เตอร์บาร์';
      case 'DE': return 'Bartresen';
      case 'IT':
      default: return 'Bancone';
    }
  }

  return trimmed;
};

export const extractTableFromAddress = (rawAddress?: string): string => {
  if (!rawAddress) return '';
  const match = rawAddress.match(/\[DINE-IN:\s*([^\]]+)\]/i) 
             || rawAddress.match(/\[DINE-IN\]\s*([^\[]+)/i)
             || rawAddress.match(/\[TABLE:\s*([^\]]+)\]/i);
  if (match) return match[1].trim();

  // Fallback: check if address starts with Tavolo / Table / Cliente / Guest / etc.
  const firstPart = rawAddress.split('[')[0].trim();
  if (firstPart && (
    /^(?:Tavolo|Table|Tisch|โต๊ะ|Cliente|Guest|Customer|Gast|Kunde|ลูกค้า|Terrazza|Terrace|Terrasse|ระเบียง|Bancone|Counter|Bar|เคาน์เตอร์|Giardino|Garden|Garten)/i.test(firstPart)
  )) {
    return firstPart;
  }
  return '';
};
