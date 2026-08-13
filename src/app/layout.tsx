import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { LocaleProvider } from '@/app/providers/locale-provider';
import { OfferProvider } from '@/app/providers/offer-provider';
import { ToastProvider } from '@/app/providers/toast-provider';
import { AppShell } from '@/components/layout/app-shell';
import { ServiceWorkerRegistrar } from '@/components/layout/service-worker-registrar';

// Fonts are self-hosted by next/font at build time, so the browser makes no third-party
// font request at runtime (DESIGN.md 3).
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MigranShield — Periksa bukti sebelum membayar',
  description:
    'MigranShield membantu menguraikan klaim dalam tawaran kerja ke luar negeri dan menunjukkan informasi yang masih perlu diverifikasi.',
  applicationName: 'MigranShield',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'MigranShield', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
  robots: { index: false, follow: false },
};

/**
 * Rendered per request so the nonce-based Content-Security-Policy from `middleware.ts`
 * can be applied to Next's script tags. A statically prerendered document cannot carry a
 * per-request nonce, and with `strict-dynamic` that silently blocks hydration.
 *
 * Nothing user-specific is rendered on the server: offer data never leaves the browser.
 */
export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0A463E',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id-ID" className={`${plusJakarta.variable} ${ibmPlexMono.variable}`}>
      <body>
        <LocaleProvider>
          <OfferProvider>
            <ToastProvider>
              <AppShell>{children}</AppShell>
              <ServiceWorkerRegistrar />
            </ToastProvider>
          </OfferProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
