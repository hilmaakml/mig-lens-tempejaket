import { LOCALES, type Locale } from '@/content/locales/locale';
import { BRAND } from '@/content/brand';
import { migrateStorageKey } from '@/domain/privacy/storage-migration';

/**
 * The interface language is one of only two values the product persists (SECURITY.md 3
 * and 6). Offer state must never be written next to it.
 */
const STORAGE_KEY = `${BRAND.storagePrefix}.uiLocale`;
/** Pre-rename key, read once so an existing user keeps their language choice. */
const LEGACY_STORAGE_KEY = `${BRAND.legacyStoragePrefix}.uiLocale`;

const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);

export function readStoredLocale(): Locale | null {
  if (typeof window === 'undefined') return null;
  migrateStorageKey(STORAGE_KEY, LEGACY_STORAGE_KEY);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(raw) ? raw : null;
  } catch {
    // Private-mode or blocked storage is not an error worth surfacing to the user.
    return null;
  }
}

export function writeStoredLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

export const LOCALE_STORAGE_KEY = STORAGE_KEY;
export const LEGACY_LOCALE_STORAGE_KEY = LEGACY_STORAGE_KEY;
