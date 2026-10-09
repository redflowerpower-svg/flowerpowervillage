/**
 * Centralized Language Configuration for Flower Power Pizza
 * Scalable N-Language Architecture: Add any new language to SUPPORTED_LANGUAGES
 */

export const SUPPORTED_LANGUAGES = ['IT', 'EN', 'TH', 'MM', 'DE', 'FR', 'ES', 'RU', 'ZH'] as const;

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
  MM: {
    code: 'MM',
    label: 'မြန်မာ',
    nativeName: 'မြန်မာစာ',
    flag: '🇲🇲',
    fontFamily: 'Noto Sans Myanmar, Padauk, system-ui, sans-serif',
  },
  ES: {
    code: 'ES',
    label: 'Español',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
  FR: {
    code: 'FR',
    label: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷',
  },
  RU: {
    code: 'RU',
    label: 'Русский',
    nativeName: 'Русский',
    flag: '🇷🇺',
  },
  ZH: {
    code: 'ZH',
    label: '中文',
    nativeName: '简体中文',
    flag: '🇨🇳',
    fontFamily: 'PingFang SC, Noto Sans SC, Microsoft YaHei, system-ui, sans-serif',
  },
};

export const DEFAULT_LANGUAGE: Language = 'EN';

