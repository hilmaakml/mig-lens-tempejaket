import { expect, test, type Page } from '@playwright/test';
import { clickToRoute, clickUntil, skipOnboarding, switchLanguage } from './helpers';

// The application suites assume onboarding is already done; the onboarding suite
// covers the first-run gate itself.
test.beforeEach(async ({ page }) => skipOnboarding(page));

/** Drives the demo journey from home to the result screen. */
async function runDemoJourney(page: Page) {
  await page.goto('/app');
  await clickToRoute(
    page,
    page.getByRole('link', { name: 'Periksa Tawaran' }),
    /\/app\/periksa$/,
  );
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
}

test.describe('core journey', () => {
  test('runs demo → confirmation → result → evidence → action → exercise', async ({
    page,
  }) => {
    await runDemoJourney(page);

    await expect(page.getByText('Tunda pembayaran dulu')).toBeVisible();
    await expect(page.getByText('4 indikator risiko ditemukan')).toBeVisible();
    await expect(page.getByText('Ditemukan di sumber resmi')).toBeVisible();

    // Evidence map opens and shows the full contract for a category.
    const contactAccordion = page.getByRole('button', {
      name: /Identitas & kanal penghubung/,
    });
    await clickUntil(contactAccordion, () =>
      expect(contactAccordion).toHaveAttribute('aria-expanded', 'true', {
        timeout: 1500,
      }),
    );
    const region = page.getByRole('region', { name: /Identitas & kanal penghubung/ });
    await expect(region.getByText(/Alasan/)).toBeVisible();
    await expect(region.getByText(/Batas pemeriksaan ini/)).toBeVisible();
    await expect(region.getByText(/Berikutnya/)).toBeVisible();

    // Action pack → verification message → copy feedback.
    await page.getByRole('link', { name: 'Buat pesan verifikasi' }).click();
    await expect(page).toHaveURL(/\/app\/pesan$/);
    await clickUntil(page.getByRole('button', { name: 'Salin pesan' }), () =>
      expect(page.getByRole('status')).toContainText('Pesan disalin.', { timeout: 1500 }),
    );

    // Back to the result, then to the recommended personal exercise.
    await page.goBack();
    await page.getByRole('link', { name: 'Mulai latihan personal' }).click();
    await expect(page).toHaveURL(/\/app\/latihan$/);
    await expect(page.getByText('Direkomendasikan untuk Anda')).toBeVisible();
    await expect(page.getByText('Pencatutan Identitas Lembaga').first()).toBeVisible();
  });

  test('completes manual entry without OCR', async ({ page }) => {
    await page.goto('/app/periksa');
    await clickToRoute(
      page,
      page.getByRole('button', { name: 'Tulis Manual' }),
      /\/app\/konfirmasi$/,
    );

    await page.getByLabel('Perusahaan / P3MI').fill('PT Contoh Manual');
    await page.getByLabel('Jenis rekening').selectOption('personal');
    await page.getByLabel('Tenggat pembayaran').selectOption('same_day');
    await clickToRoute(
      page,
      page.getByRole('button', { name: 'Lanjutkan pemeriksaan' }),
      /\/app\/hasil$/,
    );

    await expect(page.getByText('Tunda pembayaran dulu')).toBeVisible();
    // No approved production dataset ships with this build, so the source is unavailable.
    await expect(page.getByText(/Belum ada kumpulan data resmi/).first()).toBeVisible();
    await expect(page.getByText('Contoh hasil prototipe')).toHaveCount(0);
  });

  test('separates a source outage from a record that is not found', async ({ page }) => {
    // Not found within scope: demo dataset present, unknown company name.
    await page.goto('/app/periksa');
    await clickToRoute(
      page,
      page.getByRole('button', { name: /Gunakan contoh tawaran/ }),
      /\/app\/konfirmasi$/,
    );
    await page.getByLabel('Perusahaan / P3MI').fill('PT Nama Tidak Terdaftar');
    await clickToRoute(
      page,
      page.getByRole('button', { name: 'Lanjutkan pemeriksaan' }),
      /\/app\/hasil$/,
    );
    await expect(
      page.getByText(/tidak ditemukan dalam cakupan sumber yang diperiksa/i).first(),
    ).toBeVisible();

    // Source unavailable: manual entry, no approved dataset at all.
    await page.goto('/app/periksa');
    await clickToRoute(
      page,
      page.getByRole('button', { name: 'Tulis Manual' }),
      /\/app\/konfirmasi$/,
    );
    await page.getByLabel('Perusahaan / P3MI').fill('PT Contoh Manual');
    await clickToRoute(
      page,
      page.getByRole('button', { name: 'Lanjutkan pemeriksaan' }),
      /\/app\/hasil$/,
    );
    await expect(page.getByText(/Belum ada kumpulan data resmi/).first()).toBeVisible();
  });

  test('explains lost state after a refresh instead of a dead end', async ({ page }) => {
    await runDemoJourney(page);
    await page.reload();
    await expect(page.getByText('Data pemeriksaan tidak tersedia lagi')).toBeVisible();
    await page.getByRole('link', { name: 'Mulai pemeriksaan baru' }).click();
    await expect(page).toHaveURL(/\/app\/periksa$/);
  });

  test('rejects an invalid upload and recovers', async ({ page }) => {
    await page.goto('/app/periksa');
    // Retried for the same reason as clickUntil: a change event that lands before React
    // attaches its handler is a no-op. The app clears the input on rejection, so setting
    // the same file again re-fires the event.
    await expect(async () => {
      await page.getByLabel('File').setInputFiles({
        name: 'offer.exe',
        mimeType: 'image/jpeg',
        buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]),
      });
      // Scoped to the upload error card: Next's route announcer also has role="alert".
      await expect(
        page.getByRole('alert').filter({ hasText: 'Berkas belum dapat digunakan' }),
      ).toContainText('Format berkas tidak didukung', { timeout: 1500 });
    }).toPass({ timeout: 20_000 });

    await clickToRoute(
      page,
      page.getByRole('button', { name: 'Tulis Manual' }),
      /\/app\/konfirmasi$/,
    );
  });

  test('reaches every application screen without a dead end', async ({ page }) => {
    const routes = [
      '/app',
      '/app/periksa',
      '/app/konfirmasi',
      '/app/hasil',
      '/app/kanal',
      '/app/pesan',
      '/app/bagikan',
      '/app/latihan',
      '/app/latihan/simulasi',
      '/app/latihan/pola',
      '/app/skenario',
      '/app/riwayat',
    ];
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('main')).toBeVisible();
      await expect(
        page.getByRole('navigation', { name: /Navigasi utama/ }),
      ).toBeVisible();
    }
  });
});

test.describe('bilingual flow', () => {
  test('completes manual entry in English', async ({ page }) => {
    await page.goto('/app');
    await switchLanguage(page, 'Bahasa Inggris', 'en-GB');

    await clickToRoute(
      page,
      page.getByRole('link', { name: 'Check an offer' }),
      /\/app\/periksa$/,
    );
    await clickToRoute(
      page,
      page.getByRole('button', { name: 'Type manually' }),
      /\/app\/konfirmasi$/,
    );
    await page.getByLabel('Company / P3MI').fill('PT Example Manual');
    await page.getByLabel('Account type').selectOption('personal');
    await page.getByLabel('Payment deadline').selectOption('same_day');
    await clickToRoute(
      page,
      page.getByRole('button', { name: 'Continue to the check' }),
      /\/app\/hasil$/,
    );

    await expect(page.getByText('Hold off on paying')).toBeVisible();
    await expect(page.getByText(/risk indicators found/)).toBeVisible();
    await expect(page.getByText(/not a legal decision/)).toBeVisible();
  });

  test('switches ID → EN → ID during the result without losing state', async ({
    page,
  }) => {
    await runDemoJourney(page);
    await expect(page.getByText('4 indikator risiko ditemukan')).toBeVisible();

    await switchLanguage(page, 'Bahasa Inggris', 'en-GB');
    await expect(page).toHaveURL(/\/app\/hasil$/);
    await expect(page.getByText('4 risk indicators found')).toBeVisible();
    await expect(page.getByText('Found in the source checked')).toBeVisible();

    await switchLanguage(page, 'Indonesian', 'id-ID');
    await expect(page.getByText('4 indikator risiko ditemukan')).toBeVisible();
  });

  test('shows no raw translation key on any public screen', async ({ page }) => {
    const locales = [
      { option: 'Bahasa Inggris', lang: 'en-GB' },
      { option: 'Indonesian', lang: 'id-ID' },
    ] as const;

    for (const locale of locales) {
      await page.goto('/');
      await switchLanguage(page, locale.option, locale.lang);
      for (const route of [
        '/app',
        '/app/periksa',
        '/app/latihan',
        '/app/latihan/pola',
        '/app/skenario',
        '/app/riwayat',
      ]) {
        await page.goto(route);
        const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
        expect(text).not.toMatch(/\b(result|check|rule|status|missing|share)\.[a-z_]+\./);
        expect(text).not.toContain('{');
      }
    }
  });
});
