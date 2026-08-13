/**
 * One-time migration of browser-storage keys after the product rename.
 *
 * The rename must not cost a user their saved language choice, practice progress, or check
 * history. Each read path calls `migrateStorageKey` first, which moves a legacy value to
 * the current key exactly once.
 *
 * Properties this guarantees:
 * - data preserving: the legacy value is copied before the legacy key is removed;
 * - no duplication: if the current key already holds a value, the legacy key is simply
 *   dropped and the current value wins;
 * - idempotent: running it again after a successful migration does nothing;
 * - non-throwing: blocked, full, or unavailable storage leaves the caller unaffected.
 *
 * No new data is written by the migration itself. It moves what was already stored.
 */

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function migrateStorageKey(currentKey: string, legacyKey: string): void {
  if (currentKey === legacyKey) return;
  const storage = getStorage();
  if (!storage) return;

  try {
    const legacyValue = storage.getItem(legacyKey);
    if (legacyValue === null) return;

    // The current key wins when both exist; the stale legacy copy is discarded.
    if (storage.getItem(currentKey) === null) {
      storage.setItem(currentKey, legacyValue);
    }
    storage.removeItem(legacyKey);
  } catch {
    // A failed migration must never break a read. The legacy value stays untouched and
    // the caller falls back to its own default.
  }
}
