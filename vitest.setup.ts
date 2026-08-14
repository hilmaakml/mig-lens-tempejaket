import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { resetLocaleCache } from '@/domain/privacy/locale-store';
import { resetProgressCache } from '@/domain/progress/progress-store';
import { resetOnboardingCache } from '@/domain/onboarding/onboarding-store';

vi.mock('next/navigation', async () => {
  const { routerMock, navigationState } = await import('./tests/helpers/navigation-mock');
  return {
    useRouter: () => routerMock,
    usePathname: () => navigationState.pathname,
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
    redirect: vi.fn(),
    notFound: vi.fn(),
  };
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  resetLocaleCache();
  resetProgressCache();
  resetOnboardingCache();
});

// jsdom does not implement these; several components rely on them.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

if (!window.scrollTo) {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
}
