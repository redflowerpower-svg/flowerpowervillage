/**
 * Anti-Spam & Data Plausibility Validation for Pizza Delivery & Takeaway
 * Validates that Customer Name, Phone, and Email are realistic and not keyboard mashing/dummy inputs.
 */

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validates if a customer name is plausible (not gibberish, not test string, realistic character distribution).
 */
export function isPlausibleName(rawName: string): boolean {
  const name = (rawName || '').trim();
  if (name.length < 2 || name.length > 60) return false;
  // Require at least two separate words (e.g., first and last name)
  if (name.split(/\s+/).filter(Boolean).length < 2) return false;

  // Check allowed characters: Unicode letters, spaces, hyphens, periods, apostrophes
  const validCharsRegex = /^[\p{L}\p{M}\s.'-]+$/u;
  if (!validCharsRegex.test(name)) return false;

  // Reject 4 or more identical consecutive characters (e.g. "aaaa", "zzzz", "ssss")
  if (/(.)\1{3,}/i.test(name)) return false;

  // Check Latin characters
  const latinOnly = name.replace(/[^a-zA-Z]/g, '').toLowerCase();
  if (latinOnly.length >= 2) {
    // Must contain at least one vowel
    const hasVowel = /[aeiouyàèéìòùäöü]/.test(latinOnly);
    if (!hasVowel) return false;

    // Check for keyboard mash substrings
    const knownMashes = [
      'asdf', 'sdfg', 'dfgh', 'fghj', 'ghjk', 'hjkl',
      'qwer', 'wert', 'erty', 'rtyu', 'tyui', 'yuio', 'uiop',
      'zxcv', 'xcvb', 'cvbn', 'vbnm',
      'sfdsf', 'dsfdsf', 'asdasd', 'sdasd', 'test', 'fake', 'dummy', 'noname', 'nessuno', 'prova'
    ];
    for (const mash of knownMashes) {
      if (latinOnly.includes(mash)) return false;
    }

    // Reject 5+ consecutive consonants in Latin script
    if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(latinOnly)) return false;
  }

  return true;
}

/**
 * Validates if a phone number is plausible (valid digit count, valid Thai/Intl format, no obvious dummy sequences).
 */
export function isPlausiblePhone(rawPhone: string): boolean {
  const phone = (rawPhone || '').trim();
  if (!phone) return false;

  // Remove standard formatting characters
  const cleaned = phone.replace(/[\s\-.()/]/g, '');

  // Must match optional '+' followed by 8 to 15 digits
  if (!/^\+?[0-9]{8,15}$/.test(cleaned)) return false;

  const digitsOnly = cleaned.replace(/\+/g, '');

  // Reject all identical digits (e.g. "0000000000", "1111111111", "9999999999")
  if (/^(\d)\1+$/.test(digitsOnly)) return false;

  // Reject obvious full sequential ladders
  const sequentialPatterns = [
    '0123456789', '1234567890', '9876543210', '0987654321',
    '12345678', '87654321'
  ];
  for (const seq of sequentialPatterns) {
    if (digitsOnly.includes(seq)) return false;
  }

  // Reject 6 or more identical consecutive digits (e.g. "0810000000", "0891111111")
  if (/(\d)\1{5,}/.test(digitsOnly)) return false;

  // Thai phone numbers starting with '0': must be 9 or 10 digits
  if (digitsOnly.startsWith('0') && digitsOnly.length < 9) return false;

  return true;
}

/**
 * Validates if an email address is plausible (valid syntax, real domain structure, no keyboard mash in username).
 */
export function isPlausibleEmail(rawEmail: string): boolean {
  const email = (rawEmail || '').trim().toLowerCase();
  if (!email) return false;

  // RFC compliant standard email format
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,12}$/;
  if (!emailRegex.test(email)) return false;

  const [user, domain] = email.split('@');
  if (!user || !domain) return false;

  // Username length
  if (user.length < 2) return false;

  // Reject all identical characters in username (e.g. "aaaaaa@gmail.com")
  const cleanUser = user.replace(/[^a-z0-9]/g, '');
  if (cleanUser.length >= 3 && /^([a-z0-9])\1+$/.test(cleanUser)) return false;

  // Reject obvious keyboard mash patterns in username
  const knownMashes = [
    'asdfgh', 'sdfghj', 'dfghjk', 'fghjkl',
    'qwerty', 'wertyu', 'ertyui', 'rtyuio', 'tyuiop',
    'zxcvbn', 'xcvbnm',
    'dsfdsf', 'sfdsf', 'asdasd', 'sdasda'
  ];
  for (const mash of knownMashes) {
    if (user.includes(mash)) return false;
  }

  // Reject disposable / dummy domains
  const fakeDomains = [
    'tempmail.com', '10minutemail.com', 'mailinator.com', 'guerrillamail.com', 'yopmail.com', 'dispostable.com', 'trashmail.com',
    'throwawaymail.com', 'fake.com', 'test.com', 'example.com', 'sample.com', 'mail.com', 'email.com'
  ];
  if (fakeDomains.includes(domain)) return false;

  return true;
}
