import { expect, test } from '@playwright/test';
import { clickToRoute, switchLanguage } from './helpers';

const FLAG = 'miglens.onboarding.v1.completed';

const readFlag = (page: import('@playwright/test').Page) =>
  page.evaluate((key) => window.localStorage.getItem(key), FLAG);

const seedFlag = async (page: import('@playwright/test').Page) => {
  await page.addInitScript((key) => {
    window.localStorage.setItem(key, 'true');
  }, FLAG);
};

test.describe('first run', () => {
  test('shows onboarding at the entry route with no bottom navigation', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Lihat bukti di balik setiap tawaran.' }),
    ).toBeVisible();
    await expect(page.getByRole('navigation', { name: /Navigasi utama/ })).toHaveCount(0);
    // Rendering alone must not mark it complete.
    expect(await readFlag(page)).toBeNull();
  });

  test('stays on onboarding across a refresh until it is completed', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Lihat bukti di balik setiap tawaran.' }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Lihat bukti di balik setiap tawaran.' }),
    ).toBeVisible();
    expect(await readFlag(page)).toBeNull();
  });

  test('the primary action completes onboarding and opens the real checker', async ({
    page,
  }) => {
    await page.goto('/');
    await clickToRoute(
      page,
      page.getByRole('button', { name: 'Mulai Periksa' }).first(),
      /\/app\/periksa$/,
    );
    expect(await readFlag(page)).toBe('true');
    await expect(
      page.getByText(/Jangan unggah KTP, paspor, nomor identitas/),
    ).toBeVisible();
  });

  test('Skip completes onboarding and opens the app home', async ({ page }) => {
    await page.goto('/');
    await clickToRoute(page, page.getByRole('button', { name: 'Lewati' }), /\/app$/);
    expect(await readFlag(page)).toBe('true');
    await expect(page.getByRole('navigation', { name: /Navigasi utama/ })).toBeVisible();
  });

  test('Back after completing does not reopen first-run onboarding', async ({ page }) => {
    await page.goto('/');
    await clickToRoute(page, page.getByRole('button', { name: 'Lewati' }), /\/app$/);
    await page.goBack();
    await expect(
      page.getByRole('heading', { name: 'Lihat bukti di balik setiap tawaran.' }),
    ).toHaveCount(0);
  });

  test('completes the flow in English', async ({ page }) => {
    await page.goto('/');
    await switchLanguage(page, 'Bahasa Inggris', 'en-GB');
    await expect(
      page.getByRole('heading', { name: 'See the evidence behind every offer.' }),
    ).toBeVisible();
    // Switching language must not mark onboarding complete.
    expect(await readFlag(page)).toBeNull();

    await clickToRoute(
      page,
      page.getByRole('button', { name: 'Start Checking' }).first(),
      /\/app\/periksa$/,
    );
    expect(await readFlag(page)).toBe('true');
  });
});

test.describe('returning visitor', () => {
  test.beforeEach(async ({ page }) => seedFlag(page));

  test('enters the application directly without an onboarding flash', async ({
    page,
  }) => {
    const seen: string[] = [];
    page.on('console', () => undefined);
    await page.goto('/');
    await expect(page).toHaveURL(/\/app$/);
    seen.push(await page.locator('body').innerText());
    expect(seen.join(' ')).not.toContain('Lihat bukti di balik setiap tawaran.');
  });

  test('keeps entering directly after a reload', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/app$/);
    await page.goto('/');
    await expect(page).toHaveURL(/\/app$/);
  });
});

test.describe('clearing site data', () => {
  // No seeded init script here: it would reinstate the flag on every navigation.
  test('shows onboarding again once the flag is cleared', async ({ page }) => {
    await page.goto('/');
    await clickToRoute(page, page.getByRole('button', { name: 'Lewati' }), /\/app$/);
    expect(await readFlag(page)).toBe('true');

    await page.evaluate((key) => window.localStorage.removeItem(key), FLAG);
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Lihat bukti di balik setiap tawaran.' }),
    ).toBeVisible();
  });
});

test.describe('the reusable Guide', () => {
  test.beforeEach(async ({ page }) => seedFlag(page));

  test('opens from the application header and returns safely', async ({ page }) => {
    await page.goto('/app/periksa');
    await clickToRoute(
      page,
      page.getByRole('link', { name: 'Panduan' }),
      /\/app\/panduan$/,
    );
    await expect(
      page.getByRole('heading', { name: 'Lihat bukti di balik setiap tawaran.' }),
    ).toBeVisible();
    // The Guide lives inside the app shell, so it is never a dead end.
    await expect(page.getByRole('navigation', { name: /Navigasi utama/ })).toBeVisible();

    await page.getByRole('button', { name: 'Kembali ke Aplikasi' }).click();
    await expect(page).toHaveURL(/\/app\/periksa$/);
  });

  test('does not change the onboarding flag', async ({ page }) => {
    await page.goto('/app/panduan');
    await expect(page.getByText('Privasi sejak awal.')).toBeVisible();
    expect(await readFlag(page)).toBe('true');
  });

  test('preserves an in-memory result when opened mid-flow', async ({ page }) => {
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
    await expect(page.getByText('4 indikator risiko ditemukan')).toBeVisible();

    await clickToRoute(
      page,
      page.getByRole('link', { name: 'Panduan' }),
      /\/app\/panduan$/,
    );
    await page.getByRole('button', { name: 'Kembali ke Aplikasi' }).click();

    await expect(page).toHaveURL(/\/app\/hasil$/);
    // Nothing was rerun and no state was reset.
    await expect(page.getByText('4 indikator risiko ditemukan')).toBeVisible();
  });
});

test.describe('storage stays within the approved keys', () => {
  test('adds no key beyond locale, progress, and onboarding', async ({ page }) => {
    await page.goto('/');
    await clickToRoute(page, page.getByRole('button', { name: 'Lewati' }), /\/app$/);

    const keys = await page.evaluate(() => Object.keys({ ...localStorage }));
    for (const key of keys) {
      expect([
        'miglens.uiLocale',
        'miglens.progress',
        'miglens.onboarding.v1.completed',
      ]).toContain(key);
    }
  });

  test('stores only the literal value true for the flag', async ({ page }) => {
    await page.goto('/');
    await clickToRoute(page, page.getByRole('button', { name: 'Lewati' }), /\/app$/);
    expect(await readFlag(page)).toBe('true');
  });
});
