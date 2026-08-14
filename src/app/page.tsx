'use client';

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingView } from '@/features/onboarding/onboarding-view';
import {
  completeOnboarding,
  getOnboardingServerSnapshot,
  getOnboardingSnapshot,
  subscribeToOnboarding,
} from '@/domain/onboarding/onboarding-store';
import { useLocale } from '@/app/providers/locale-provider';

/**
 * Application entry point (LANDING_PAGE.md section 6).
 *
 * This route decides where a visitor belongs: first run shows onboarding, a returning
 * visitor goes straight to the app home. The store's server snapshot is `checking`, so the
 * prerendered document and the hydration pass agree and neither destination renders before
 * the flag has been read — no flash in either direction.
 *
 * Entering the app uses history replacement, so pressing Back after completing onboarding
 * does not drop the user straight back into the first-run page.
 */
export default function EntryPage() {
  const router = useRouter();
  const { t } = useLocale();

  const status = useSyncExternalStore(
    subscribeToOnboarding,
    getOnboardingSnapshot,
    getOnboardingServerSnapshot,
  );

  /**
   * Set as soon as the user picks a destination. Completing onboarding flips the store to
   * `application`, which re-runs the effect below; without this guard that effect would
   * redirect to the app home and clobber the destination the user actually chose.
   */
  const hasChosenDestination = useRef(false);

  // A returning visitor never sees onboarding: as soon as the flag resolves, replace this
  // entry route with the app home.
  useEffect(() => {
    if (status === 'application' && !hasChosenDestination.current) {
      router.replace('/app');
    }
  }, [status, router]);

  const goTo = useCallback(
    (destination: string) => {
      hasChosenDestination.current = true;
      completeOnboarding();
      router.replace(destination);
    },
    [router],
  );

  const startChecking = useCallback(() => goTo('/app/periksa'), [goTo]);
  const skip = useCallback(() => goTo('/app'), [goTo]);

  if (status !== 'onboarding') {
    // Minimal branded holding state while the flag is read, and while the replace above
    // is in flight. It carries no application content, so nothing can flash.
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6">
        <span className="text-xl font-extrabold tracking-tight text-text-primary">
          {t('app.name')}
        </span>
        <span role="status" aria-live="polite" className="sr-only">
          {t('app.loading')}
        </span>
        <span
          className="h-1 w-24 overflow-hidden rounded-full bg-border-default"
          aria-hidden="true"
        >
          <span className="block h-full w-1/2 rounded-full bg-brand-primary" />
        </span>

        {/*
         * Escape hatch. The holding state depends on client JavaScript resolving the
         * first-run flag; if that never happens — scripts blocked, an offline chunk, a
         * runtime error — this screen would otherwise be a dead end. The link is always
         * in the markup, revealed after a short delay so it never competes with a normal
         * fast resolution, and it works without JavaScript at all.
         */}
        <a
          href="/app"
          className="animate-delayed-fallback min-h-11 rounded-button border-[1.5px] border-border-strong px-4 py-2.5 text-[13.5px] font-bold text-brand-dark opacity-0"
        >
          {t('app.continue_to_app')}
        </a>
      </div>
    );
  }

  return (
    <OnboardingView
      mode="first-run"
      onPrimaryAction={startChecking}
      onSecondaryAction={skip}
    />
  );
}
