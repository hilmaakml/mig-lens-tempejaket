'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { BottomNav } from '@/components/layout/bottom-nav';
import { OfflineNotice } from '@/components/layout/offline-notice';
import { useLocale } from '@/app/providers/locale-provider';

/**
 * Mobile-first shell (DESIGN.md 2): fills the viewport on a phone, centres an ~430 px
 * column on wider screens, and shows no fake device frame or fake OS status bar.
 *
 * The bottom navigation belongs to the application itself, so it appears under `/app`
 * only. The public landing page at `/` has its own in-page navigation.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useLocale();
  const pathname = usePathname();
  const isAppRoute = pathname === '/app' || pathname.startsWith('/app/');

  return (
    <div className="flex min-h-dvh justify-center bg-surface-page">
      <div className="flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-surface-app shadow-[0_2px_8px_rgba(20,40,36,.10),0_24px_60px_rgba(20,40,36,.16)]">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-lg focus:bg-brand-primary focus:px-4 focus:py-2 focus:text-white"
        >
          {t('app.skip_to_content')}
        </a>
        <OfflineNotice />
        <div
          id="main"
          className="app-scroll flex-1 overflow-x-hidden overflow-y-auto pt-[env(safe-area-inset-top)]"
        >
          <main className="animate-fade-up">{children}</main>
        </div>
        {isAppRoute ? <BottomNav /> : null}
      </div>
    </div>
  );
}
