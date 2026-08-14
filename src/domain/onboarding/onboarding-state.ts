import { BRAND } from '@/content/brand';

/**
 * First-run onboarding flag (LANDING_PAGE.md sections 7 and 16).
 *
 * This is the third and last value the product persists, alongside `uiLocale` and the
 * minimised progress record. It holds one thing: whether the user has already been
 * through onboarding. It carries no timestamp, no identifier, no device fingerprint, no
 * navigation history, and no source route, and it is never combined with another object.
 *
 * "Completed" means completed *for this browser storage profile and origin*. Clearing site
 * data, using a private window, switching browser or device, or changing the deployed
 * origin all reset it. The product must never claim otherwise.
 */

export const ONBOARDING_STORAGE_KEY = `${BRAND.storagePrefix}.onboarding.v1.completed`;

/** The only value ever written. Anything else is treated as "not completed". */
export const ONBOARDING_COMPLETED_VALUE = 'true';

/**
 * Resolution states. The UI must not render either destination while `checking`,
 * otherwise a returning user sees onboarding flash before the app home.
 */
export type OnboardingStatus = 'checking' | 'onboarding' | 'application';

export function isCompletedValue(value: unknown): boolean {
  return value === ONBOARDING_COMPLETED_VALUE;
}

/** Missing, malformed, or unexpected values all mean "not completed". */
export function statusFromStoredValue(value: string | null): OnboardingStatus {
  return isCompletedValue(value) ? 'application' : 'onboarding';
}
