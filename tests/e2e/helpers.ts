import { expect, type Locator, type Page } from '@playwright/test';

const RETRY = { timeout: 20_000, intervals: [200, 400, 800, 1500] };

/**
 * Clicks a control and retries until its effect is visible.
 *
 * A prerendered page serves markup before React attaches handlers, so a click that lands
 * during that window is a no-op. Retrying keeps the tests deterministic without adding
 * test-only hooks to the application. The assertion is checked before each retry so a
 * click that already succeeded is never repeated on a screen that has moved on.
 */
export async function clickUntil(
  locator: Locator,
  assertion: () => Promise<unknown>,
): Promise<void> {
  await expect(async () => {
    try {
      await assertion();
      return;
    } catch {
      // Not there yet: click (again) and re-check.
    }
    await locator.click({ timeout: 3000 });
    await assertion();
  }).toPass(RETRY);
}

export async function clickToRoute(
  page: Page,
  locator: Locator,
  urlPattern: RegExp,
): Promise<void> {
  await clickUntil(locator, () => expect(page).toHaveURL(urlPattern, { timeout: 2000 }));
}

/** Switches the interface language and waits for the document language to follow. */
export async function switchLanguage(
  page: Page,
  optionName: string,
  expectedLang: string,
): Promise<void> {
  await clickUntil(page.getByRole('radio', { name: optionName }), () =>
    expect(page.locator('html')).toHaveAttribute('lang', expectedLang, { timeout: 2000 }),
  );
}
