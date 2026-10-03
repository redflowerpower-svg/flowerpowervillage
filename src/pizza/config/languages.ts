/**
 * Centralized Language Configuration for Flower Power Pizza
 * Scalable N-Language Architecture: Add any new language to SUPPORTED_LANGUAGES
 */

export const SUPPORTED_LANGUAGES = ['IT', 'EN', 'TH', 'DE'] as const;

export type Language = typeof SUPPORTED_LANGUAGES[number];

export interface LanguageMeta {
  code: Language;
  label: string;
  nativeName: string;
  flag: string;
  fontFamily?: string;
}

export const LANGUAGE_METAS: Record<Language, LanguageMeta> = {
  IT: {
    code: 'IT',
    label: 'Italiano',
    nativeName: 'Italiano',
    flag: '🇮🇹',
  },
  EN: {
    code: 'EN',
    label: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
  },
  TH: {
    code: 'TH',
    label: 'ไทย',
    nativeName: 'ภาษาไทย',
    flag: '🇹🇭',
    fontFamily: 'IBM Plex Sans Thai, Prompt, system-ui, sans-serif',
  },
  DE: {
    code: 'DE',
    label: 'Deutsch',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
  },
};

export const DEFAULT_LANGUAGE: Language = 'IT';
