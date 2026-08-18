/*
 * Exports one self-contained HTML file per application screen, for design review and
 * hand-off.
 *
 * Each file is a snapshot of the real, hydrated screen served by a production build — not
 * a redrawn mock — with the stylesheet, the fonts, and every image folded into the
 * document itself. The result opens with a double-click and needs no server, so it can be
 * zipped, attached, or archived. Scripts are stripped: these are design artefacts, so
 * nothing in them runs, and nothing in them can call back to an origin that is gone.
 *
 * Screens that only exist part-way through the offer flow (confirmation, result, message,
 * share, channels) hold their state in memory, never in storage, so a direct visit would
 * capture an empty screen. Those are reached the way a user reaches them: by walking the
 * demo journey in a single session without reloading. Only synthetic demo fixtures are
 * used — no real offer, and no live source is contacted.
 *
 * Usage: node scripts/export-design.mjs [--locale en|id] [--out <dir>] [--port <port>]
 */

import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function readOption(flag, fallback) {
  const index = process.argv.indexOf(flag);
  return index !== -1 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const LOCALE = readOption('--locale', 'en');
const PORT = Number(readOption('--port', '3210'));
const OUT_DIR = resolve(projectRoot, readOption('--out', 'design-export'));
const BASE_URL = `http://127.0.0.1:${PORT}`;

/** Mirrors the two storage keys the product owns (SECURITY.md 6). Nothing else is seeded. */
const LOCALE_STORAGE_KEY = 'miglens.uiLocale';
const ONBOARDING_STORAGE_KEY = 'miglens.onboarding.v1.completed';

/**
 * Screens reachable by direct navigation. The two simulation entries are the same route:
 * the scenario is selected by fragment, and the two scenarios look different enough to be
 * worth separate sheets.
 */
const DIRECT_SCREENS = [
  { file: '02-home', path: '/app' },
  { file: '03-check', path: '/app/periksa' },
  { file: '09-practice', path: '/app/latihan' },
  { file: '10-simulation-composite', path: '/app/latihan/simulasi' },
  {
    file: '11-simulation-reported-case',
    path: '/app/latihan/simulasi#offer-switched-country',
  },
  { file: '12-patterns', path: '/app/latihan/pola' },
  { file: '13-reported-case', path: '/app/skenario' },
  { file: '14-history', path: '/app/riwayat' },
  { file: '15-guide', path: '/app/panduan' },
];

/** Starts the production server and resolves once it answers. */
async function startServer() {
  if (!existsSync(join(projectRoot, '.next'))) {
    throw new Error('No production build found. Run `npm run build` first.');
  }

  console.log(`starting next start on port ${PORT}`);
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    cwd: projectRoot,
    stdio: 'ignore',
    shell: process.platform === 'win32',
  });

  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(BASE_URL, { redirect: 'manual' });
      if (response.status < 500) return server;
    } catch {
      // Not listening yet.
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  server.kill();
  throw new Error(`Server did not answer on ${BASE_URL} within 120s.`);
}

async function stopServer(server) {
  if (server.exitCode !== null) return;
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(server.pid), '/f', '/t'], { stdio: 'ignore' });
  } else {
    server.kill('SIGTERM');
  }
  await Promise.race([once(server, 'exit'), new Promise((r) => setTimeout(r, 5000))]);
}

/**
 * Launches Chromium, falling back to a system browser when the bundled download is
 * unavailable — the same escape hatch `playwright.config.ts` documents.
 */
async function launchBrowser() {
  const attempts = [undefined, 'msedge', 'chrome'];
  let lastError;
  for (const channel of attempts) {
    try {
      return await chromium.launch(channel ? { channel } : {});
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

/**
 * Serialises the current screen as a self-contained document.
 *
 * Everything is assembled on a clone: the live document is never touched. That is not
 * tidiness — stripping the scripts from the running page would kill React, and the offer
 * flow below has to keep navigating after a screen has been captured.
 *
 * Runs inside the page so it can fetch against its own origin and read `currentSrc`,
 * which is what the browser actually chose out of a `srcset`.
 */
async function serializeStandalone(page) {
  return await page.evaluate(async () => {
    const toDataUri = async (url) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${response.status} for ${url}`);
      const blob = await response.blob();
      return await new Promise((resolveDataUri, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolveDataUri(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    // Fonts and any other asset the stylesheet points at, so typography survives too.
    const inlineCssUrls = async (cssText, baseUrl) => {
      const references = [...cssText.matchAll(/url\((['"]?)([^'")]+)\1\)/g)];
      let result = cssText;
      for (const [match, , rawUrl] of references) {
        if (rawUrl.startsWith('data:')) continue;
        try {
          const absolute = new URL(rawUrl, baseUrl);
          if (absolute.origin !== location.origin) continue;
          result = result.replaceAll(match, `url(${await toDataUri(absolute.href)})`);
        } catch {
          // An asset that cannot be fetched is left as a plain reference.
        }
      }
      return result;
    };

    // Resolve everything that needs the live document first, keyed by position so the
    // same query on the clone lines up.
    const liveStyleLinks = [...document.querySelectorAll('link[rel="stylesheet"]')];
    const inlinedCss = await Promise.all(
      liveStyleLinks.map(async (link) => {
        try {
          const href = new URL(link.getAttribute('href'), location.href);
          if (href.origin !== location.origin) return null;
          return await inlineCssUrls(await (await fetch(href.href)).text(), href.href);
        } catch {
          return null;
        }
      }),
    );

    const liveImages = [...document.querySelectorAll('img')];
    const inlinedImages = await Promise.all(
      liveImages.map(async (image) => {
        const chosen = image.currentSrc || image.src;
        if (!chosen || chosen.startsWith('data:')) return null;
        try {
          return await toDataUri(chosen);
        } catch {
          return null;
        }
      }),
    );

    const root = document.documentElement.cloneNode(true);

    root.querySelectorAll('link[rel="stylesheet"]').forEach((link, index) => {
      const cssText = inlinedCss[index];
      if (cssText === null || cssText === undefined) return;
      const style = document.createElement('style');
      style.textContent = cssText;
      link.replaceWith(style);
    });

    root.querySelectorAll('img').forEach((image, index) => {
      const dataUri = inlinedImages[index];
      if (!dataUri) return;
      image.removeAttribute('srcset');
      image.removeAttribute('sizes');
      image.setAttribute('src', dataUri);
      image.setAttribute('loading', 'eager');
    });

    /*
     * Form state lives in DOM properties, which `cloneNode` does not carry into markup.
     * Without this the confirmation screen would export with empty fields, which is the
     * one screen whose whole point is the extracted values.
     */
    const liveFields = [...document.querySelectorAll('input, textarea, select')];
    root.querySelectorAll('input, textarea, select').forEach((field, index) => {
      const live = liveFields[index];
      if (!live) return;
      if (field.tagName === 'SELECT') {
        [...field.options].forEach((option, optionIndex) => {
          option.toggleAttribute('selected', optionIndex === live.selectedIndex);
        });
      } else if (field.tagName === 'TEXTAREA') {
        field.textContent = live.value;
      } else if (live.type === 'checkbox' || live.type === 'radio') {
        field.toggleAttribute('checked', live.checked);
      } else {
        field.setAttribute('value', live.value);
      }
    });

    // Nothing here should run or phone home once the origin is gone.
    root
      .querySelectorAll(
        'script, link[rel="manifest"], link[rel="preload"], link[rel="prefetch"], link[rel="icon"], link[rel="apple-touch-icon"], link[as="image"]',
      )
      .forEach((node) => node.remove());

    // The launch splash is a transient overlay, not a screen. Left in place it would
    // cover every sheet for the first second and a half, every time one is opened.
    root.querySelector('.animate-splash')?.remove();

    return root.outerHTML;
  });
}

async function capture(page, file, label) {
  // The fade-up entry animation and the splash both need to be over before the snapshot.
  await page.waitForTimeout(1800);
  const html = await serializeStandalone(page);
  const target = join(OUT_DIR, `${file}.html`);
  await writeFile(target, `<!doctype html>\n${html}\n`, 'utf8');
  const kb = Math.round(Buffer.byteLength(html, 'utf8') / 1024);
  console.log(`  ${file}.html  ${String(kb).padStart(5)} KB  ${label}`);
}

/** Seeds only the keys the product itself persists. */
async function seedStorage(context, { completedOnboarding }) {
  await context.addInitScript(
    ({ localeKey, onboardingKey, locale, completed }) => {
      try {
        window.localStorage.setItem(localeKey, locale);
        if (completed) window.localStorage.setItem(onboardingKey, 'true');
      } catch {
        /* storage blocked: the export simply shows the default language */
      }
    },
    {
      localeKey: LOCALE_STORAGE_KEY,
      onboardingKey: ONBOARDING_STORAGE_KEY,
      locale: LOCALE,
      completed: completedOnboarding,
    },
  );
}

async function exportOnboarding(browser) {
  const context = await browser.newContext({ viewport: { width: 430, height: 932 } });
  await seedStorage(context, { completedOnboarding: false });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await capture(page, '01-onboarding', 'first-run onboarding');
  await context.close();
}

async function exportDirectScreens(browser) {
  const context = await browser.newContext({ viewport: { width: 430, height: 932 } });
  await seedStorage(context, { completedOnboarding: true });
  const page = await context.newPage();

  for (const screen of DIRECT_SCREENS) {
    await page.goto(`${BASE_URL}${screen.path}`, { waitUntil: 'networkidle' });
    await capture(page, screen.file, screen.path);
  }

  await context.close();
}

/**
 * The offer flow. Its state lives in memory only, so every step here is a client-side
 * navigation: one reload would empty the screens this function exists to capture.
 */
async function exportOfferFlow(browser) {
  const context = await browser.newContext({ viewport: { width: 430, height: 932 } });
  await seedStorage(context, { completedOnboarding: true });
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/app/periksa`, { waitUntil: 'networkidle' });

  await page.getByRole('button', { name: /demo/i }).click();
  await page.waitForURL('**/app/konfirmasi');
  await capture(page, '04-confirmation', '/app/konfirmasi (demo fixture)');

  await page.getByRole('button', { name: /continue to the check|lanjutkan/i }).click();
  await page.waitForURL('**/app/hasil');
  await capture(page, '05-result', '/app/hasil (demo fixture)');

  // Addressed by href rather than by label, so the walk does not depend on the language.
  await page.locator('a[href="/app/pesan"]').first().click();
  await page.waitForURL('**/app/pesan');
  await capture(page, '06-message', '/app/pesan (demo fixture)');

  await page.goBack();
  await page.waitForURL('**/app/hasil');
  await page.locator('a[href="/app/bagikan"]').first().click();
  await page.waitForURL('**/app/bagikan');
  await capture(page, '07-share', '/app/bagikan (demo fixture)');

  await page.goBack();
  await page.waitForURL('**/app/hasil');
  await page.locator('a[href="/app/kanal"]').first().click();
  await page.waitForURL('**/app/kanal');
  await capture(page, '08-channels', '/app/kanal (demo fixture)');

  await context.close();
}

async function main() {
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const server = await startServer();
  let browser;
  try {
    browser = await launchBrowser();
    console.log(`exporting locale "${LOCALE}" to ${OUT_DIR}`);
    await exportOnboarding(browser);
    await exportOfferFlow(browser);
    await exportDirectScreens(browser);
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }

  console.log('done');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
