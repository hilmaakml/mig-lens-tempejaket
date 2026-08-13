import { vi } from 'vitest';

/**
 * App Router mock backed by a tiny subscribable route store, so an integration test can
 * drive a real multi-screen flow while the providers above it keep their state.
 */
const listeners = new Set<() => void>();
let pathname = '/';

export const navigationState = {
  get pathname() {
    return pathname;
  },
  set pathname(next: string) {
    pathname = next;
    for (const listener of listeners) listener();
  },
};

export function subscribeToRoute(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRoute(): string {
  return pathname;
}

export const routerMock = {
  push: vi.fn((href: string) => {
    navigationState.pathname = href;
  }),
  replace: vi.fn((href: string) => {
    navigationState.pathname = href;
  }),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

export function resetNavigation(next = '/') {
  routerMock.push.mockClear();
  routerMock.replace.mockClear();
  routerMock.back.mockClear();
  navigationState.pathname = next;
}
