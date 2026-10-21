/**
 * 📅 Utility di Formattazione Date Ufficiale: Giorno / Mese / Anno (DD/MM/YYYY)
 * Tassativo per tutte le comunicazioni dell'applicazione (Telegram, Email, Webhook, Report).
 */

export function formatDateDMY(dateInput?: string | Date | null, separator: '/' | '-' = '/'): string {
  if (!dateInput) return '';
  const str = typeof dateInput === 'string' ? dateInput.trim() : dateInput.toISOString();
  
  // Riconosce formato ISO YYYY-MM-DD o YYYY/MM/DD
  const isoMatch = str.match(/^(\d{4})[-/](0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${d.padStart(2, '0')}${separator}${m.padStart(2, '0')}${separator}${y}`;
  }

  // Parsing Date
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const mon = String(d.getMonth() + 1).padStart(2, '0');
      const yr = d.getFullYear();
      return `${day}${separator}${mon}${separator}${yr}`;
    }
  } catch {}

  return str;
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
