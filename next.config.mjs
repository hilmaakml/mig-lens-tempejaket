import { networkInterfaces } from 'node:os';

/**
 * Hosts allowed to load Next's development resources.
 *
 * Testing on a real phone means opening the dev server over the LAN, which Next blocks by
 * default. Rather than hard-coding an address that changes with the network, the machine's
 * own private IPv4 addresses are detected at start-up. This affects `next dev` only; the
 * production server ignores it.
 *
 * Override with `ALLOWED_DEV_ORIGINS=host1,host2` when the detected list is not enough.
 */
function localDevOrigins() {
  const fromEnv = (process.env.ALLOWED_DEV_ORIGINS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  const detected = Object.values(networkInterfaces())
    .flat()
    .filter((entry) => entry && entry.family === 'IPv4' && !entry.internal)
    .map((entry) => entry.address);

  return [...new Set([...fromEnv, ...detected])];
}

/**
 * Security headers are required by SECURITY.md section 10.
 * Content-Security-Policy is emitted per-request with a nonce in `middleware.ts`
 * because Next.js injects inline bootstrap scripts that a static header cannot allowlist safely.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'X-Frame-Options', value: 'DENY' },
  {
    key: 'Permissions-Policy',
    // `camera` stays enabled: FR-02 offers a camera capture path for the offer image.
    value:
      'camera=(self), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

/**
 * Screens that lived at the site root before the landing page took `/`. A bookmark or a
 * link shared with a test participant must keep working, so each old path redirects
 * permanently to its new home under `/app`.
 */
const MOVED_APP_ROUTES = [
  'periksa',
  'konfirmasi',
  'hasil',
  'kanal',
  'pesan',
  'bagikan',
  'latihan',
  'skenario',
  'riwayat',
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: localDevOrigins(),
  async redirects() {
    return MOVED_APP_ROUTES.map((route) => ({
      source: `/${route}/:path*`,
      destination: `/app/${route}/:path*`,
      permanent: true,
    }));
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Offer-derived responses must never be cached (SECURITY.md section 6).
        source: '/app/(periksa|konfirmasi|hasil|bagikan|pesan)/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default nextConfig;
