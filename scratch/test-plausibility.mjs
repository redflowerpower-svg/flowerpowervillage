// Test script for plausibility validation of Name, Phone, and Email

export function isPlausibleName(rawName) {
  const name = (rawName || '').trim();
  if (name.length < 2) {
    return { valid: false, reason: 'Nome troppo corto (minimo 2 caratteri)' };
  }
  if (name.length > 50) {
    return { valid: false, reason: 'Nome troppo lungo' };
  }

  // Check allowed characters: Unicode letters, spaces, hyphens, apostrophes
  const validCharsRegex = /^[\p{L}\p{M}\s.'-]+$/u;
  if (!validCharsRegex.test(name)) {
    return { valid: false, reason: 'Il nome contiene caratteri o numeri non validi' };
  }

  // Reject 4 or more identical consecutive characters (e.g. "aaaa", "zzzz")
  if (/(.)\1{3,}/i.test(name)) {
    return { valid: false, reason: 'Nome non plausibile (troppe lettere ripetute)' };
  }

  // Check Latin characters
  const latinLetters = name.replace(/[^a-zA-Z]/g, '').toLowerCase();
  if (latinLetters.length >= 2) {
    // Check if there is at least one vowel in latin text
    const hasVowel = /[aeiouy]/.test(latinLetters);
    if (!hasVowel) {
      return { valid: false, reason: 'Nome non plausibile (nessuna vocale)' };
    }

    // Check for obvious keyboard mash patterns
    const knownMashes = [
      'asdf', 'sdfg', 'dfgh', 'fghj', 'ghjk', 'hjkl',
      'qwer', 'wert', 'erty', 'rtyu', 'tyui', 'yuio', 'uiop',
      'zxcv', 'xcvb', 'cvbn', 'vbnm',
      'sfdsf', 'dsfdsf', 'asdasd', 'sdasd', 'test', 'fake', 'dummy', 'noname', 'nessuno', 'prova'
    ];
    for (const mash of knownMashes) {
      if (latinLetters.includes(mash)) {
        return { valid: false, reason: 'Nome non valido o di test' };
      }
    }

    // Check for 5+ consecutive consonants
    if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(latinLetters)) {
      return { valid: false, reason: 'Nome non plausibile' };
    }
  }

  return { valid: true };
}

export function isPlausiblePhone(rawPhone) {
  const phone = (rawPhone || '').trim();
  if (!phone) {
    return { valid: false, reason: 'Numero di telefono obbligatorio' };
  }

  // Remove spaces, hyphens, dots, parentheses
  const cleaned = phone.replace(/[\s\-.()/]/g, '');

  // Check valid phone format: optional leading '+', followed by 8 to 15 digits
  if (!/^\+?[0-9]{8,15}$/.test(cleaned)) {
    return { valid: false, reason: 'Formato telefono non valido (richieste 9-15 cifre)' };
  }

  const digitsOnly = cleaned.replace(/\+/g, '');

  // Reject all identical digits (e.g. 0000000000, 1111111111)
  if (/^(\d)\1+$/.test(digitsOnly)) {
    return { valid: false, reason: 'Numero di telefono non plausibile (cifre tutte uguali)' };
  }

  // Reject sequential numbers
  const sequentialPatterns = [
    '0123456789', '1234567890', '9876543210', '0987654321',
    '123456789', '987654321', '12345678', '87654321'
  ];
  for (const seq of sequentialPatterns) {
    if (digitsOnly.includes(seq)) {
      return { valid: false, reason: 'Numero di telefono non plausibile (sequenza numerica)' };
    }
  }

  // Reject 6 or more identical consecutive digits (e.g. 0810000000)
  if (/(\d)\1{5,}/.test(digitsOnly)) {
    return { valid: false, reason: 'Numero di telefono non plausibile (troppe cifre ripetute)' };
  }

  // Thai number check if starts with 0: must be 9 or 10 digits
  if (digitsOnly.startsWith('0') && digitsOnly.length < 9) {
    return { valid: false, reason: 'Numero thailandese troppo corto (minimo 9-10 cifre)' };
  }

  return { valid: true };
}

export function isPlausibleEmail(rawEmail) {
  const email = (rawEmail || '').trim().toLowerCase();
  if (!email) {
    return { valid: false, reason: 'Email obbligatoria' };
  }

  // Standard email regex
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,12}$/;
  if (!emailRegex.test(email)) {
    return { valid: false, reason: 'Formato email non valido' };
  }

  const [user, domain] = email.split('@');
  if (!user || !domain) {
    return { valid: false, reason: 'Email incompleta' };
  }

  // Username checks
  if (user.length < 2) {
    return { valid: false, reason: 'Nome utente email troppo corto' };
  }

  // Reject all identical chars in username (e.g. aaaaaa@gmail.com)
  const cleanUser = user.replace(/[^a-z0-9]/g, '');
  if (cleanUser.length >= 3 && /^([a-z0-9])\1+$/.test(cleanUser)) {
    return { valid: false, reason: 'Email non plausibile (caratteri ripetuti)' };
  }

  // Reject obvious keyboard mash in email user (e.g. dsfdsfdsfds@gmail.com, asdfghjk@yahoo.com)
  const knownMashes = [
    'asdfgh', 'sdfghj', 'dfghjk', 'fghjkl',
    'qwerty', 'wertyu', 'ertyui', 'rtyuio', 'tyuiop',
    'zxcvbn', 'xcvbnm',
    'dsfdsf', 'sfdsf', 'asdasd', 'sdasda'
  ];
  for (const mash of knownMashes) {
    if (user.includes(mash)) {
      return { valid: false, reason: 'Indirizzo email non plausibile' };
    }
  }

  // Reject disposable / fake domains
  const fakeDomains = [
    'tempmail.com', '10minutemail.com', 'mailinator.com', 'guerrillamail.com',
    'throwawaymail.com', 'fake.com', 'test.com', 'example.com', 'sample.com'
  ];
  if (fakeDomains.includes(domain)) {
    return { valid: false, reason: 'Dominio email temporaneo o non valido' };
  }

  return { valid: true };
}

// Test cases
console.log('--- TEST NAME ---');
console.log('sfdsf (attacker):', isPlausibleName('sfdsf'));
console.log('Mario Rossi (real):', isPlausibleName('Mario Rossi'));
console.log('Somchai Prasert (real):', isPlausibleName('Somchai Prasert'));
console.log('สมชาย (Thai real):', isPlausibleName('สมชาย'));
console.log('asdasd (fake):', isPlausibleName('asdasd'));
console.log('John D. (real):', isPlausibleName('John D.'));

console.log('\n--- TEST PHONE ---');
console.log('12345 (fake short):', isPlausiblePhone('12345'));
console.log('0000000000 (fake repeat):', isPlausiblePhone('0000000000'));
console.log('0812345678 (Thai real):', isPlausiblePhone('0812345678'));
console.log('+39 340 1234567 (IT real):', isPlausiblePhone('+39 340 1234567'));
console.log('081-999-8888 (Thai formatted):', isPlausiblePhone('081-999-8888'));
console.log('1234567890 (ladder):', isPlausiblePhone('1234567890'));

console.log('\n--- TEST EMAIL ---');
console.log('dsfdsfdsfds@gmail.com (attacker):', isPlausibleEmail('dsfdsfdsfds@gmail.com'));
console.log('mario.rossi@gmail.com (real):', isPlausibleEmail('mario.rossi@gmail.com'));
console.log('test@test.com (fake):', isPlausibleEmail('test@test.com'));
console.log('somchai@hotmail.com (real):', isPlausibleEmail('somchai@hotmail.com'));
console.log('aaaaaa@gmail.com (repeat):', isPlausibleEmail('aaaaaa@gmail.com'));
