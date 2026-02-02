/**
 * React context for i18n: locale state and t(key) so components re-render when locale changes.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getLocale, setLocale as setLocaleStorage, messages } from './index.js';

const I18nContext = createContext(null);

const DEFAULT_LOCALE = 'es';

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(getLocale);

  useEffect(() => {
    const onLocaleChange = () => setLocaleState(getLocale());
    window.addEventListener('localechange', onLocaleChange);
    return () => window.removeEventListener('localechange', onLocaleChange);
  }, []);

  const setLocale = useCallback((l) => {
    setLocaleStorage(l);
    setLocaleState(getLocale());
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = getLocale();
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const t = useCallback((key) => {
    const dict = messages[locale];
    if (dict && dict[key]) return dict[key];
    const fallback = messages[DEFAULT_LOCALE];
    if (fallback && fallback[key]) return fallback[key];
    return key;
  }, [locale]);

  const value = { locale, setLocale, t };
  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) return { locale: DEFAULT_LOCALE, setLocale: () => {}, t: (k) => k };
  return ctx;
}
