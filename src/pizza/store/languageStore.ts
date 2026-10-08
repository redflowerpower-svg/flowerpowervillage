import { create } from 'zustand';
import { Language, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../config/languages';

interface LanguageState {
  language: Language;
  lang: Language;
  setLanguage: (lang: Language) => void;
  setLang: (lang: Language) => void;
}

const STORAGE_KEY = 'fp_selected_language';

/**
 * Normalizes browser locale strings (e.g. 'my-MM', 'my', 'th-TH', 'de-AT', 'it-CH', 'en-US')
 * to our supported application Language code ('MM', 'TH', 'DE', 'IT', 'EN').
 */
export function normalizeLocaleToSupported(rawLocale?: string | null): Language | null {
  if (!rawLocale || typeof rawLocale !== 'string') return null;
  const clean = rawLocale.trim().toLowerCase();
  
  // 1. Burmese / Myanmar (ISO 639-1 'my', ISO 639-2 'bur', country tag 'mm')
  if (clean.startsWith('my') || clean.startsWith('bur') || clean.includes('mm') || clean.includes('zawgyi')) {
    return 'MM';
  }

  // 2. Thai (ISO 639-1 'th')
  if (clean.startsWith('th')) {
    return 'TH';
  }

  // 3. German (ISO 639-1 'de')
  if (clean.startsWith('de')) {
    return 'DE';
  }

  // 4. Italian (ISO 639-1 'it')
  if (clean.startsWith('it')) {
    return 'IT';
  }

  // 5. English (ISO 639-1 'en')
  if (clean.startsWith('en')) {
    return 'EN';
  }

  // 6. Direct match check against supported uppercase codes
  const upper = clean.slice(0, 2).toUpperCase() as Language;
  if (SUPPORTED_LANGUAGES.includes(upper)) {
    return upper;
  }

  return null;
}

// Detect initial language from localStorage or browser language preferences
export function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  // 1. Check if user explicitly selected and saved a language in localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY)?.toUpperCase() as Language;
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
      return saved;
    }
  } catch {}

  // 2. Inspect the user's browser language preferences list (navigator.languages)
  try {
    if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
      for (const loc of navigator.languages) {
        const matched = normalizeLocaleToSupported(loc);
        if (matched) return matched;
      }
    }
  } catch {}

  // 3. Inspect primary single navigator.language
  try {
    const singleMatched = normalizeLocaleToSupported(navigator.language);
    if (singleMatched) return singleMatched;
  } catch {}

  // 4. Universal international fallback: ALWAYS English ('EN')
  return DEFAULT_LANGUAGE;
}

const initialLang = getInitialLanguage();

export const useLanguageStore = create<LanguageState>((set) => {
  const updateLanguage = (lang: Language) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-lang', lang);
    }

    set({ language: lang, lang });
  };

  return {
    language: initialLang,
    lang: initialLang,
    setLanguage: updateLanguage,
    setLang: updateLanguage,
  };
});

// Auto-sync initial language with <html data-lang="...">
if (typeof document !== 'undefined') {
  const initial = getInitialLanguage();
  document.documentElement.setAttribute('data-lang', initial);
}
