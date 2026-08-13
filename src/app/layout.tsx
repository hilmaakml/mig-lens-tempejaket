import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { LocaleProvider } from '@/app/providers/locale-provider';
import { OfferProvider } from '@/app/providers/offer-provider';
import { ToastProvider } from '@/app/providers/toast-provider';
import { AppShell } from '@/components/layout/app-shell';
import { ServiceWorkerRegistrar } from '@/components/layout/service-worker-registrar';
import { BRAND, BRAND_LOCALE_TAG } from '@/content/brand';
import { DEFAULT_LOCALE } from '@/content/locales/locale';

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

// Server-rendered metadata uses the first-visit locale, matching the empty-state server
// snapshot the locale store returns. The client updates the document title after the user
// picks a language.
const DEFAULT_METADATA_LOCALE = DEFAULT_LOCALE;
const metadataTitle = `${BRAND.name} — ${BRAND.tagline[DEFAULT_METADATA_LOCALE]}`;
const metadataDescription = BRAND.description[DEFAULT_METADATA_LOCALE];

export const metadata: Metadata = {
  title: metadataTitle,
  description: metadataDescription,
  applicationName: BRAND.name,
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: BRAND.name, statusBarStyle: 'default' },
  formatDetection: { telephone: false },
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    siteName: BRAND.name,
    title: metadataTitle,
    description: metadataDescription,
    locale: BRAND_LOCALE_TAG[DEFAULT_METADATA_LOCALE],
    alternateLocale: BRAND_LOCALE_TAG.en,
  },
  twitter: {
    card: 'summary',
    title: metadataTitle,
    description: metadataDescription,
  },
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
