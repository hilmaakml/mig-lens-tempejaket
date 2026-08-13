export const LOCALES = ['id', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

/** Bahasa Indonesia is the first-visit default (CONVENTIONS.md 13.3). */
export const DEFAULT_LOCALE: Locale = 'id';

export const LOCALE_LABELS: Readonly<Record<Locale, string>> = {
  id: 'ID',
  en: 'EN',
};

/** BCP 47 tags used for `html[lang]` and Intl formatting. */
export const LOCALE_TAGS: Readonly<Record<Locale, string>> = {
  id: 'id-ID',
  en: 'en-GB',
};
