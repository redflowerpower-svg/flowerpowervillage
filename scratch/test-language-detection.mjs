import { normalizeLocaleToSupported } from '../src/pizza/store/languageStore.ts';

const testCases = [
  // Burmese cases
  { input: 'my', expected: 'MM' },
  { input: 'my-MM', expected: 'MM' },
  { input: 'my-ZG', expected: 'MM' },
  { input: 'bur', expected: 'MM' },
  { input: 'zawgyi-one', expected: 'MM' },
  
  // Thai cases
  { input: 'th', expected: 'TH' },
  { input: 'th-TH', expected: 'TH' },
  
  // German cases
  { input: 'de', expected: 'DE' },
  { input: 'de-DE', expected: 'DE' },
  { input: 'de-AT', expected: 'DE' },
  { input: 'de-CH', expected: 'DE' },
  
  // Italian cases
  { input: 'it', expected: 'IT' },
  { input: 'it-IT', expected: 'IT' },
  { input: 'it-CH', expected: 'IT' },
  
  // English cases
  { input: 'en', expected: 'EN' },
  { input: 'en-US', expected: 'EN' },
  { input: 'en-GB', expected: 'EN' },
  { input: 'en-AU', expected: 'EN' },
  
  // Fallback cases (should return null from normalizer, so getInitialLanguage falls back to 'EN')
  { input: 'fr-FR', expected: null },
  { input: 'es-ES', expected: null },
  { input: 'ru-RU', expected: null },
  { input: 'zh-CN', expected: null },
  { input: null, expected: null },
  { input: '', expected: null }
];

console.log('--- RUNNING LOCALE DETECTION TESTS ---');
let allPassed = true;

for (const tc of testCases) {
  const actual = normalizeLocaleToSupported(tc.input);
  const pass = actual === tc.expected;
  if (!pass) {
    allPassed = false;
    console.error(`❌ FAILED for input "${tc.input}": expected "${tc.expected}", got "${actual}"`);
  } else {
    console.log(`✅ Input "${tc.input}" -> "${actual}"`);
  }
}

if (allPassed) {
  console.log('\n🎉 ALL 24 TEST CASES PASSED SUCCESSFULLY!');
} else {
  process.exit(1);
}
