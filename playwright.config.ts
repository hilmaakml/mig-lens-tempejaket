import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
/**
 * `PLAYWRIGHT_BASE_URL` points the suite at an already-running deployment so the same
 * privacy and header assertions can verify an authorized preview (SECURITY.md 13). When it
 * is set, the local build/serve step is skipped.
 */
const remoteBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = remoteBaseURL ?? `http://127.0.0.1:${PORT}`;

/**
 * End-to-end tests run against a production build so the real security headers, the
 * service worker, and the nonce-based CSP are in effect (TESTING.md 4).
 * Only synthetic fixtures are used; no live government service is ever contacted.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Every page is rendered per request, so a single `next start` is the bottleneck.
  // Capping workers keeps the four viewport projects from starving each other.
  workers: process.env.CI ? 1 : 2,
  reporter: [['list']],
  timeout: 60_000,
  use: {
    baseURL,
    // Chromium engine. `PLAYWRIGHT_CHANNEL=msedge` (or `chrome`) runs the same tests on a
    // system-installed Chromium browser when the bundled download is unavailable.
    ...(process.env.PLAYWRIGHT_CHANNEL
      ? { channel: process.env.PLAYWRIGHT_CHANNEL }
      : {}),
    trace: 'retain-on-failure',
    locale: 'id-ID',
    timezoneId: 'Asia/Jakarta',
  },
  projects: [
    {
      name: 'mobile-360',
      use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 740 } },
    },
    {
      name: 'mobile-390',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
    {
      name: 'mobile-430',
      use: { ...devices['Desktop Chrome'], viewport: { width: 430, height: 932 } },
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } },
    },
  ],
  ...(remoteBaseURL
    ? {}
    : {
        webServer: {
          command: `npm run build && npx next start -p ${PORT}`,
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 300_000,
          stdout: 'ignore' as const,
          stderr: 'pipe' as const,
        },
      }),
});
