'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingView } from '@/features/onboarding/onboarding-view';

/**
 * The reusable Guide (LANDING_PAGE.md section 10).
 *
 * It renders the same content model as first-run onboarding in `guide` mode. Being a route
 * inside the application shell means the in-memory offer state, OCR output, and evidence
 * result all survive: nothing is unmounted above this screen, so opening the Guide mid-flow
 * cannot reset a form or rerun the rules.
 *
 * Viewing or leaving the Guide never touches the onboarding flag.
 */
export default function GuidePage() {
  const router = useRouter();

  const goToChecker = useCallback(() => router.push('/app/periksa'), [router]);

  // Ordinary Back so the user returns to whatever screen they opened the Guide from.
  // `router.back()` falls back to the app home when there is no safe entry to return to.
  const returnToApp = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/app');
  }, [router]);

  return (
    <OnboardingView
      mode="guide"
      onPrimaryAction={goToChecker}
      onSecondaryAction={returnToApp}
    />
  );
}
