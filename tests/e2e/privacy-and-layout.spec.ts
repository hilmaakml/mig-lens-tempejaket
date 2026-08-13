import { expect, test } from '@playwright/test';
import { clickToRoute, clickUntil } from './helpers';

/** Runs the demo check from the upload screen to the result screen. */
async function runDemoCheck(page: import('@playwright/test').Page) {
  await page.goto('/app/periksa');
  await clickToRoute(
    page,
    page.getByRole('button', { name: /Gunakan contoh tawaran/ }),
    /\/app\/konfirmasi$/,
  );
  await clickToRoute(
    page,
    page.getByRole('button', { name: 'Lanjutkan pemeriksaan' }),
    /\/app\/hasil$/,
  );
  await expect(page.getByText('Tunda pembayaran dulu')).toBeVisible();
}

const OFFER_MARKERS = [
  'Karya Contoh Nusantara',
  '886900000000',
  '900 000 000',
  'Caregiver',
];

test.describe('privacy boundaries (SECURITY.md 13)', () => {
  test('sends no offer content in any network request', async ({ page }) => {
    const outbound: string[] = [];
    page.on('request', (request) => {
      if (request.method() === 'GET' && !request.postData()) {
        outbound.push(request.url());
        return;
      }
      outbound.push(`${request.url()} ${request.postData() ?? ''}`);
    });

    await runDemoCheck(page);

    for (const entry of outbound) {
      for (const marker of OFFER_MARKERS) {
        expect(entry, `request leaked "${marker}"`).not.toContain(marker);
      }
    }
  });

  test('contacts no third-party origin', async ({ page }) => {
    const origins = new Set<string>();
    page.on('request', (request) => origins.add(new URL(request.url()).origin));

    await runDemoCheck(page);

    const pageOrigin = new URL(page.url()).origin;
    expect([...origins]).toEqual([pageOrigin]);
  });

  test('stores no offer data in browser storage or caches', async ({ page }) => {
    await runDemoCheck(page);

    const stored = await page.evaluate(async () => {
      const dump = {
        local: JSON.stringify({ ...localStorage }),
        session: JSON.stringify({ ...sessionStorage }),
        cookies: document.cookie,
        cacheBodies: [] as string[],
      };
      if ('caches' in window) {
        for (const name of await caches.keys()) {
          const cache = await caches.open(name);
          for (const request of await cache.keys()) {
            dump.cacheBodies.push(request.url);
            const response = await cache.match(request);
            if (response) dump.cacheBodies.push(await response.clone().text());
          }
        }
      }
      return dump;
    });

    const blob = [
      stored.local,
      stored.session,
      stored.cookies,
      ...stored.cacheBodies,
    ].join(' ');
    for (const marker of OFFER_MARKERS) {
      expect(blob).not.toContain(marker);
    }
    // Only the language preference may be persisted.
    const localKeys = Object.keys(JSON.parse(stored.local) as Record<string, string>);
    expect(localKeys.every((key) => key === 'migranshield.uiLocale')).toBe(true);
  });

  test('logs no sensitive content to the console', async ({ page }) => {
    const messages: string[] = [];
    page.on('console', (message) => messages.push(message.text()));
    page.on('pageerror', (error) => messages.push(error.message));

    await runDemoCheck(page);

    const joined = messages.join(' ');
    for (const marker of OFFER_MARKERS) {
      expect(joined).not.toContain(marker);
    }
  });

  test('keeps the share preview and clipboard redacted', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await runDemoCheck(page);
    await page.getByRole('link', { name: 'Bagikan ringkasan' }).click();

    const preview = await page.getByTestId('share-preview').innerText();
    expect(preview).not.toContain('Karya Contoh Nusantara');
    expect(preview).not.toContain('900 000 000');
    expect(preview).toContain('Contoh hasil prototipe');

    await clickUntil(page.getByRole('button', { name: 'Salin ringkasan' }), () =>
      expect(page.getByRole('status')).toContainText('Ringkasan disalin.', {
        timeout: 1500,
      }),
    );
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).not.toContain('Karya Contoh Nusantara');
    expect(clipboard).not.toContain('900000000');
    expect(clipboard).toContain('bukan keputusan hukum');
  });

  test('adds no offer data to an external complaint link', async ({ page }) => {
    await runDemoCheck(page);
    await page.getByRole('link', { name: /Laporkan tawaran atau kontak/ }).click();

    const hrefs = await page
      .locator('a[href^="http"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href.startsWith('https://')).toBe(true);
      expect(href).not.toContain('?');
      expect(href).not.toContain('#');
      for (const marker of OFFER_MARKERS) expect(href).not.toContain(marker);
    }
  });

  test('serves the baseline security headers', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers() ?? {};
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('no-referrer');
    expect(headers['strict-transport-security']).toContain('max-age=');
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(headers['content-security-policy']).toContain("object-src 'none'");
    expect(headers['content-security-policy']).not.toContain(
      "script-src 'self' 'unsafe-inline'",
    );
  });

  test('marks offer-flow responses no-store', async ({ page }) => {
    const response = await page.goto('/app/hasil');
    expect(response?.headers()['cache-control']).toContain('no-store');
  });

  test('applies the CSP nonce to every script so hydration is not blocked', async ({
    page,
  }) => {
    // Regression guard: with `strict-dynamic`, a document served without the per-request
    // nonce blocks all of Next's scripts. Links keep working, buttons silently do not.
    const response = await page.goto('/');
    const csp = response?.headers()['content-security-policy'] ?? '';
    const nonce = /'nonce-([^']+)'/.exec(csp)?.[1];
    expect(nonce, 'CSP header must carry a nonce').toBeTruthy();

    // Check the served document, not the live DOM: under `strict-dynamic`, scripts that a
    // trusted script injects later are allowed without carrying the attribute themselves.
    const html = (await response?.text()) ?? '';
    const scriptTags = html.match(/<script[^>]*\ssrc=[^>]*>/g) ?? [];
    expect(scriptTags.length).toBeGreaterThan(0);
    for (const tag of scriptTags) {
      expect(tag, 'every served script tag must carry the nonce').toContain(
        `nonce="${nonce}"`,
      );
    }

    // And the page really is interactive: a button-only action must work.
    await clickToRoute(
      page,
      page.getByRole('link', { name: 'Mulai periksa tawaran' }),
      /\/app\/periksa$/,
    );
    await clickToRoute(
      page,
      page.getByRole('button', { name: 'Tulis Manual' }),
      /\/app\/konfirmasi$/,
    );
  });
});

test.describe('mobile layout (DESIGN.md 10)', () => {
  const routes = [
    '/',
    '/app',
    '/app/periksa',
    '/app/konfirmasi',
    '/app/latihan',
    '/app/latihan/pola',
    '/app/riwayat',
  ];

  test('has no horizontal overflow', async ({ page }) => {
    for (const route of routes) {
      await page.goto(route);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `horizontal overflow on ${route}`).toBeLessThanOrEqual(1);
    }
  });

  test('keeps the bottom navigation reachable', async ({ page }) => {
    await page.goto('/app');
    const nav = page.getByRole('navigation', { name: /Navigasi utama/ });
    await expect(nav).toBeInViewport();
    await expect(nav.getByRole('link', { name: 'Periksa' })).toBeVisible();
  });

  test('shows no fake device frame or fake status bar', async ({ page }) => {
    await page.goto('/');
    const text = await page.locator('body').innerText();
    expect(text).not.toContain('PROTOTIPE KLIK');
    expect(text).not.toMatch(/\b09:41\b/);
  });

  test('keeps critical content readable at 200% zoom', async ({ page }) => {
    await page.goto('/app/periksa');
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    await expect(
      page.getByText(/Jangan unggah KTP, paspor, nomor identitas/),
    ).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('supports keyboard-only completion of the demo flow', async ({ page }) => {
    await page.goto('/app/periksa');
    const demoButton = page.getByRole('button', { name: /Gunakan contoh tawaran/ });
    await expect(async () => {
      await demoButton.focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/app\/konfirmasi$/, { timeout: 1500 });
    }).toPass({ timeout: 20_000 });

    const submit = page.getByRole('button', { name: 'Lanjutkan pemeriksaan' });
    await expect(async () => {
      await submit.focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/app\/hasil$/, { timeout: 1500 });
    }).toPass({ timeout: 20_000 });
    await expect(page.getByText('Tunda pembayaran dulu')).toBeVisible();
  });

  test('exposes a working skip link', async ({ page }) => {
    await page.goto('/app');
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('link', { name: /Lewati ke konten utama/ }),
    ).toBeFocused();
  });
});

test.describe('desktop layout', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1000, 'desktop projects only');

  test('centres an app column of about 430px', async ({ page }) => {
    await page.goto('/');
    const column = page.locator('main').locator('..').locator('..');
    const box = await column.boundingBox();
    expect(box?.width ?? 0).toBeLessThanOrEqual(431);
    const viewportWidth = page.viewportSize()?.width ?? 0;
    const centreOffset = Math.abs(
      (box?.x ?? 0) + (box?.width ?? 0) / 2 - viewportWidth / 2,
    );
    expect(centreOffset).toBeLessThan(4);
  });
});
