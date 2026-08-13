import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Nonce-based Content-Security-Policy (SECURITY.md section 10, CONVENTIONS.md 12.3).
 *
 * `connect-src 'self'` keeps OCR language data local: tesseract assets are vendored under
 * `/tessdata` and `/ocr`, so no third-party host is reachable from the offer flow.
 * `worker-src 'self' blob:` is required by the Tesseract worker bootstrap.
 */
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV !== 'production';

  const csp = [
    `default-src 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `img-src 'self' blob: data:`,
    `font-src 'self'`,
    // Next.js injects inline <style> for critical CSS; hashing them per build is not
    // available through a stable API, so styles keep 'unsafe-inline'. Scripts do not.
    `style-src 'self' 'unsafe-inline'`,
    `connect-src 'self'`,
    `worker-src 'self' blob:`,
    `child-src 'self' blob:`,
    `manifest-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval'${
      isDev ? " 'unsafe-eval'" : ''
    }`,
    `upgrade-insecure-requests`,
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico|icons/|tessdata/|ocr/).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
