/**
 * Minimal i18n: locale state and t(key) for UI strings.
 * Locale is persisted in localStorage under 'dnd-locale'.
 */

import es from './locales/es.json';
import en from './locales/en.json';

const STORAGE_KEY = 'dnd-locale';
const DEFAULT_LOCALE = 'es';

export const messages = { es, en };

let currentLocale = DEFAULT_LOCALE;
try {
  if (typeof document !== 'undefined' && typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && messages[stored]) currentLocale = stored;
  }
} catch (_) {}

if (!messages[currentLocale]) currentLocale = DEFAULT_LOCALE;

/**
 * @param {string} key - Translation key (e.g. 'app.saved')
 * @returns {string} - Translated string or key if missing
 */
export function t(key) {
  const dict = messages[currentLocale];
  if (dict && dict[key]) return dict[key];
  const fallback = messages[DEFAULT_LOCALE];
  if (fallback && fallback[key]) return fallback[key];
  return key;
}

/**
 * @returns {string} - Current locale code ('es' | 'en')
 */
export function getLocale() {
  return currentLocale;
}

/**
 * @param {string} locale - 'es' | 'en'
 */
export function setLocale(locale) {
  if (locale === currentLocale) return;
  currentLocale = messages[locale] ? locale : DEFAULT_LOCALE;
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem(STORAGE_KEY, currentLocale);
    }
  } catch (_) {}
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent('localechange', { detail: { locale: currentLocale } }));
  }
}
