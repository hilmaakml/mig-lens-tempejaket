/*
 * MigLens service worker.
 *
 * Caching policy (SECURITY.md 10, DESIGN.md 9, PRD FR-15):
 * - Only the public shell and static learning assets are cached.
 * - The offer flow under `/app` (periksa, konfirmasi, hasil, bagikan, pesan) is never
 *   cached, so no offer-derived response can be stored on the device.
 * - Non-GET requests, cross-origin requests, and OCR assets are passed straight through.
 * - Obsolete cache versions are deleted on activation.
 */

// Bumped with the product rename. `activate` deletes every cache whose key differs, so
// the previous shell cache is cleared. This only touches the Cache Storage shell; it
// never touches localStorage, where the user's progress and history live.
const CACHE_VERSION = 'miglens-shell-v3';

/** Routes whose responses may never enter a cache. */
const EXCLUDED_PATH_PREFIXES = [
  '/app/periksa',
  '/app/konfirmasi',
  '/app/hasil',
  '/app/bagikan',
  '/app/pesan',
  '/api',
];

/** Public, offer-free routes and assets that are safe to serve offline. */
const SHELL_ASSETS = [
  '/',
  '/app',
  '/app/latihan',
  '/app/latihan/pola',
  '/app/skenario',
  '/manifest.webmanifest',
  '/icons/logo.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isCacheable(url) {
  if (url.origin !== self.location.origin) return false;
  if (EXCLUDED_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix)))
    return false;
  // The OCR runtime is large and version-pinned; it is fetched on demand, not pre-cached.
  if (url.pathname.startsWith('/ocr') || url.pathname.startsWith('/tessdata'))
    return false;
  return true;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!isCacheable(url)) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached ?? caches.match('/'))),
  );
});
