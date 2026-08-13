/**
 * Vendors the Tesseract runtime and language data into `public/` so OCR never contacts a
 * third-party CDN at runtime (SECURITY.md 9, DESIGN.md 3).
 *
 * Run once after install: `npm run vendor:ocr`.
 * The worker and wasm core are copied from node_modules. Language data is downloaded from
 * the official tessdata_fast repository; if that download fails the app still works —
 * OCR reports an unavailable state and manual entry remains the documented fallback.
 */
import { mkdir, copyFile, writeFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ocrDir = join(root, 'public', 'ocr');
const tessDir = join(root, 'public', 'tessdata');

const CORE_FILES = [
  'tesseract-core-simd-lstm.wasm.js',
  'tesseract-core-simd-lstm.wasm',
  'tesseract-core-lstm.wasm.js',
  'tesseract-core-lstm.wasm',
];

const LANGUAGES = ['ind', 'eng'];
const TESSDATA_BASE =
  'https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main';

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await mkdir(ocrDir, { recursive: true });
  await mkdir(tessDir, { recursive: true });

  await copyFile(
    join(root, 'node_modules', 'tesseract.js', 'dist', 'worker.min.js'),
    join(ocrDir, 'worker.min.js'),
  );
  console.log('copied worker.min.js');

  for (const file of CORE_FILES) {
    await copyFile(
      join(root, 'node_modules', 'tesseract.js-core', file),
      join(ocrDir, file),
    );
    console.log(`copied ${file}`);
  }

  let languagesReady = 0;
  for (const lang of LANGUAGES) {
    const target = join(tessDir, `${lang}.traineddata`);
    if (await exists(target)) {
      console.log(`${lang}.traineddata already present`);
      languagesReady += 1;
      continue;
    }
    try {
      const response = await fetch(`${TESSDATA_BASE}/${lang}.traineddata`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      await writeFile(target, buffer);
      console.log(`downloaded ${lang}.traineddata (${buffer.length} bytes)`);
      languagesReady += 1;
    } catch (error) {
      console.warn(
        `WARNING: could not download ${lang}.traineddata (${String(error)}). ` +
          'On-device OCR will report as unavailable and manual entry stays available.',
      );
    }
  }

  if (languagesReady === 0) {
    console.warn('No language data vendored. OCR will be disabled at runtime.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
