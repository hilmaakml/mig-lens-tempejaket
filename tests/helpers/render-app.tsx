import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider } from '@/app/providers/locale-provider';
import { OfferProvider } from '@/app/providers/offer-provider';
import { ToastProvider } from '@/app/providers/toast-provider';

function Providers({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <OfferProvider>
        <ToastProvider>{children}</ToastProvider>
      </OfferProvider>
    </LocaleProvider>
  );
}

/**
 * Renders a screen inside the real providers so integration tests exercise the same
 * in-memory offer state and locale wiring as the app.
 */
export function renderApp(ui: ReactElement) {
  const user = userEvent.setup();
  const utils = render(ui, { wrapper: Providers });
  return { user, ...utils };
}
