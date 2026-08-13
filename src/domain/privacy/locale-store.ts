import { DEFAULT_LOCALE, type Locale } from '@/content/locales/locale';
import { readStoredLocale, writeStoredLocale } from '@/domain/privacy/locale-storage';

/**
 * The stored `uiLocale` is external state (browser storage), so it is exposed through the
 * `useSyncExternalStore` contract rather than synchronised with an effect. During
 * hydration React uses the server snapshot (`id`) and switches to the stored value
 * afterwards, which keeps the prerendered markup and the client agreeing.
 */
const listeners = new Set<() => void>();
let cached: Locale | null = null;

export function subscribeToLocale(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getLocaleSnapshot(): Locale {
  if (cached === null) cached = readStoredLocale() ?? DEFAULT_LOCALE;
  return cached;
}

export function getLocaleServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

export function setStoredLocale(next: Locale): void {
  cached = next;
  writeStoredLocale(next);
  for (const listener of listeners) listener();
}

/** Test helper: drops the in-memory cache so a fresh storage value is read. */
export function resetLocaleCache(): void {
  cached = null;
}
