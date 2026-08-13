'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { LOCALE_TAGS, type Locale } from '@/content/locales/locale';
import type { MessageKey, MessageParams } from '@/content/locales/message-key';
import {
  formatDate,
  formatDateTime,
  formatNumber,
  translate,
} from '@/content/locales/translate';
import {
  getLocaleServerSnapshot,
  getLocaleSnapshot,
  setStoredLocale,
  subscribeToLocale,
} from '@/domain/privacy/locale-store';

interface LocaleContextValue {
  readonly locale: Locale;
  readonly setLocale: (locale: Locale) => void;
  readonly t: (key: MessageKey, params?: MessageParams) => string;
  readonly formatDate: (isoDate: string | null) => string;
  readonly formatDateTime: (isoDate: string | null) => string;
  readonly formatNumber: (value: number) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Language switching is state-preserving: the locale lives above the routed screens, so a
 * switch re-renders copy without touching route, form values, or evidence results
 * (DESIGN.md 2). Only the `uiLocale` enum is persisted (SECURITY.md 3).
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeToLocale,
    getLocaleSnapshot,
    getLocaleServerSnapshot,
  );

  // Document language and title are external systems, updated from the current state.
  useEffect(() => {
    document.documentElement.lang = LOCALE_TAGS[locale];
    document.title = `${translate(locale, 'app.name')} — ${translate(locale, 'app.tagline')}`;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => setStoredLocale(next), []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, params) => translate(locale, key, params),
      formatDate: (isoDate) => formatDate(locale, isoDate),
      formatDateTime: (isoDate) => formatDateTime(locale, isoDate),
      formatNumber: (n) => formatNumber(locale, n),
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used inside LocaleProvider');
  return context;
}
