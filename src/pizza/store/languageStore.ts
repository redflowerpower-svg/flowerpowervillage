import { create } from 'zustand';
import { Language, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../config/languages';

interface LanguageState {
  language: Language;
  lang: Language;
  setLanguage: (lang: Language) => void;
  setLang: (lang: Language) => void;
}

const STORAGE_KEY = 'fp_selected_language';

// Detect initial language from localStorage or browser language
function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  try {
    const saved = localStorage.getItem(STORAGE_KEY)?.toUpperCase() as Language;
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
      return saved;
    }
  } catch {}

  try {
    const browserLang = (navigator.language || '').slice(0, 2).toUpperCase() as Language;
    if (SUPPORTED_LANGUAGES.includes(browserLang)) {
      return browserLang;
    }
  } catch {}

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
