/**
 * 📅 Utility di Formattazione Date Ufficiale: Giorno / Mese / Anno (DD/MM/YYYY)
 * Tassativo per tutte le comunicazioni dell'applicazione (Telegram, Email, Webhook, Report).
 */

/**
 * Converte qualsiasi input di data/ora (stringa ISO, timestamp Octorate con UTC o offset, Date object)
 * nella stringa canonica YYYY-MM-DD nel fuso orario della Thailandia (Asia/Bangkok, UTC+7).
 */
export function toThailandDateStr(raw: any): string {
  if (!raw) return '';
  if (raw instanceof Date) {
    if (isNaN(raw.getTime())) return '';
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(raw);
    } catch {
      const y = raw.getFullYear();
      const m = String(raw.getMonth() + 1).padStart(2, '0');
      const day = String(raw.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
  }

  let s = String(raw).trim();
  if (!s) return '';

  // Se è già una data pura YYYY-MM-DD senza orario o timezone, restituiscila direttamente
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return s;
  }

  // Normalizza formati tipo 2026-11-18T17:00:00.000+0000 o +0700 in +00:00 o +07:00 per Date parsing standard
  if (/[+-]\d{4}$/.test(s)) {
    s = s.replace(/([+-]\d{2})(\d{2})$/, '$1:$2');
  }

  const d = new Date(s);
  if (isNaN(d.getTime())) {
    return s.slice(0, 10);
  }

  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
  } catch {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}

export function formatDateDMY(dateInput?: string | Date | null, separator: '/' | '-' = '/'): string {
  if (!dateInput) return '';

  // Se è una stringa di data pura YYYY-MM-DD o YYYY/MM/DD senza orario
  if (typeof dateInput === 'string') {
    const pureDateMatch = dateInput.trim().match(/^(\d{4})[-/](0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])$/);
    if (pureDateMatch) {
      const [, y, m, d] = pureDateMatch;
      return `${d.padStart(2, '0')}${separator}${m.padStart(2, '0')}${separator}${y}`;
    }
  }

  // Per date con orario / timestamp ISO o oggetti Date, convertiamo sempre nel fuso della Thailandia
  const thaiIso = toThailandDateStr(dateInput);
  if (/^\d{4}-\d{2}-\d{2}$/.test(thaiIso)) {
    const [y, m, d] = thaiIso.split('-');
    return `${d}${separator}${m}${separator}${y}`;
  }

  return String(dateInput);
}

/**
 * Trasforma automaticamente tutte le date ISO (YYYY-MM-DD) trovate all'interno di un testo o template
 * nel formato giorno/mese/anno (DD/MM/YYYY).
 * Es: "Check-in: 2026-10-21 ➔ 2026-10-27" -> "Check-in: 21/10/2026 ➔ 27/10/2026"
 */
export function formatAllDatesToDMY(text: string, separator: '/' | '-' = '/'): string {
  if (!text || typeof text !== 'string') return text;
  // Sostituisce pattern tipo 2026-10-21 o 2027-01-15 con 21/10/2026 o 15/01/2027
  return text.replace(/\b(20\d{2})[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])(?!\d)/g, (_match, y, m, d) => {
    return `${d}${separator}${m}${separator}${y}`;
  });
}
