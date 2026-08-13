import {
  emptyProgressState,
  parseProgressState,
  type ProgressState,
} from '@/domain/progress/progress-state';
import { BRAND } from '@/content/brand';
import { migrateStorageKey } from '@/domain/privacy/storage-migration';

/**
 * localStorage adapter for progress and history.
 *
 * Every failure mode degrades to the empty state rather than throwing: storage disabled
 * by the browser, a quota error, corrupt JSON, or a schema the current build does not
 * recognise. The application must never crash because local storage misbehaved.
 */

export const PROGRESS_STORAGE_KEY = `${BRAND.storagePrefix}.progress`;
/** Pre-rename key, read once so existing progress and history survive the rename. */
export const LEGACY_PROGRESS_STORAGE_KEY = `${BRAND.legacyStoragePrefix}.progress`;

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    // Touching the property throws in some privacy modes, so probe it here.
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readProgress(): ProgressState {
  migrateStorageKey(PROGRESS_STORAGE_KEY, LEGACY_PROGRESS_STORAGE_KEY);
  const storage = getStorage();
  if (!storage) return emptyProgressState;
  try {
    const raw = storage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return emptyProgressState;
    return parseProgressState(JSON.parse(raw));
  } catch {
    // Corrupt JSON or an unreadable store: start clean instead of failing.
    return emptyProgressState;
  }
}

/** Returns false when the value could not be persisted; callers keep working in memory. */
export function writeProgress(state: ProgressState): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/** Clears progress and history. The language preference is stored separately and kept. */
export function clearProgress(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(PROGRESS_STORAGE_KEY);
  } catch {
    /* nothing to clean up */
  }
}
