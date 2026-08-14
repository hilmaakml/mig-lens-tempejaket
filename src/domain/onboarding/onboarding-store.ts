import {
  ONBOARDING_COMPLETED_VALUE,
  ONBOARDING_STORAGE_KEY,
  statusFromStoredValue,
  type OnboardingStatus,
} from '@/domain/onboarding/onboarding-state';

/**
 * External store for the first-run decision, read through `useSyncExternalStore`.
 *
 * The server snapshot is always `checking`, so the prerendered document and the hydration
 * pass agree. The stored value is read on the client only, immediately after hydration,
 * which is what keeps a returning user from seeing onboarding flash before the app home.
 *
 * Storage failures never block entry: a read error resolves to `onboarding`, and a write
 * error still advances the in-memory state so the current session continues. Onboarding
 * may simply appear again on a later launch, which is the honest outcome.
 */

const listeners = new Set<() => void>();
let cached: OnboardingStatus | null = null;

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeToOnboarding(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getOnboardingSnapshot(): OnboardingStatus {
  if (cached === null) {
    const storage = getStorage();
    if (!storage) {
      // Storage unavailable: show onboarding rather than locking the user out.
      cached = 'onboarding';
    } else {
      try {
        cached = statusFromStoredValue(storage.getItem(ONBOARDING_STORAGE_KEY));
      } catch {
        cached = 'onboarding';
      }
    }
  }
  return cached;
}

export function getOnboardingServerSnapshot(): OnboardingStatus {
  return 'checking';
}

/**
 * Marks onboarding complete. Only an explicit start or skip action may call this — never
 * a render, a focus change, or a scroll.
 */
export function completeOnboarding(): void {
  if (cached === 'application') return;
  cached = 'application';
  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(ONBOARDING_STORAGE_KEY, ONBOARDING_COMPLETED_VALUE);
    } catch {
      // Persisting failed; the session continues and onboarding may reappear later.
    }
  }
  emit();
}

/** Test helper: drops the in-memory cache so the next read hits storage again. */
export function resetOnboardingCache(): void {
  cached = null;
}
