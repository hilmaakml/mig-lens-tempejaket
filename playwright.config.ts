import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const baseURL = `http://127.0.0.1:${PORT}`;

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
  workers: process.env.CI ? 1 : undefined,
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
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
