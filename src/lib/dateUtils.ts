/**
 * Centralized Date Utility Module for Flower Power Village & Resort
 * Standardizes display dates to Italian DD/MM/YYYY or DD/MM/YY format
 * while preserving internal ISO/YYYY-MM-DD API contracts.
 */

export interface DateFormatOptions {
  shortYear?: boolean;
  includeTime?: boolean;
  separator?: string;
  fallback?: string;
}

/**
 * Formats any ISO string, YYYY-MM-DD string, or Date object into DD/MM/YYYY (or DD/MM/YY).
 * Example: '2026-12-25' -> '25/12/2026'
 * Example: '2026-12-25T14:30:00Z' (shortYear: true) -> '25/12/26'
 */
export function formatDisplayDate(
  input: string | Date | number | null | undefined,
  options: DateFormatOptions = {}
): string {
  const { shortYear = false, includeTime = false, separator = '/', fallback = '' } = options;

  if (!input) return fallback;

  try {
    let d: Date;

    if (input instanceof Date) {
      d = input;
    } else if (typeof input === 'number') {
      d = new Date(input);
    } else if (typeof input === 'string') {
      const str = input.trim();
      if (!str) return fallback;

      // Handle DD/MM/YYYY or DD-MM-YYYY already formatted
      if (/^\d{2}[\/\-]\d{2}[\/\-]\d{2,4}/.test(str)) {
        const parts = str.split(/[\/\-]/);
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        let year = parts[2];
        if (shortYear && year.length === 4) year = year.slice(2);
        if (!shortYear && year.length === 2) year = `20${year}`;
        return `${day}${separator}${month}${separator}${year}`;
      }

      // Handle YYYY-MM-DD or YYYY/MM/DD
      if (/^\d{4}[\/\-]\d{2}[\/\-]\d{2}/.test(str)) {
        const parts = str.substring(0, 10).split(/[\/\-]/);
        const year = shortYear ? parts[0].slice(2) : parts[0];
        const month = parts[1].padStart(2, '0');
        const day = parts[2].padStart(2, '0');
        return `${day}${separator}${month}${separator}${year}`;
      }

      d = new Date(str);
    } else {
      return fallback;
    }

    if (isNaN(d.getTime())) return fallback;

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const fullYear = String(d.getFullYear());
    const year = shortYear ? fullYear.slice(2) : fullYear;

    const dateFormatted = `${day}${separator}${month}${separator}${year}`;

    if (includeTime) {
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${dateFormatted} ${hours}:${minutes}`;
    }

    return dateFormatted;
  } catch {
    return fallback;
  }
}

/**
 * Formats date string or Date object into DD/MM/YY short year format.
 * Example: '2026-12-25' -> '25/12/26'
 */
export function formatDisplayDateShort(input: string | Date | number | null | undefined): string {
  return formatDisplayDate(input, { shortYear: true });
}

/**
 * Formats date string or Date object into DD/MM/YYYY HH:mm.
 * Example: '2026-12-25T14:30:00Z' -> '25/12/2026 14:30'
 */
export function formatDisplayDateTime(input: string | Date | number | null | undefined): string {
  return formatDisplayDate(input, { includeTime: true });
}

/**
 * Parses user input in DD/MM/YYYY or DD/MM/YY format back into ISO YYYY-MM-DD format for API payloads.
 * Example: '25/12/2026' -> '2026-12-25'
 * Example: '25/12/26' -> '2026-12-25'
 */
export function parseDisplayDateToISO(input: string | null | undefined): string {
  if (!input) return '';
  const str = input.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  const match = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    let year = match[3];
    if (year.length === 2) year = `20${year}`;
    return `${year}-${month}-${day}`;
  }

  return str;
}
