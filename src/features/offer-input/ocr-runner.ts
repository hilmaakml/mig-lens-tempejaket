import type { Locale } from '@/content/locales/locale';

/**
 * On-device OCR lifecycle (SECURITY.md 5).
 *
 * - `tesseract.js` is imported lazily so the OCR bundle only loads when the user asks for it.
 * - The worker, wasm core, and language data are served from this origin (`/ocr`, `/tessdata`),
 *   so no image, no text, and no request reaches a third party.
 * - The worker is terminated and the object URL revoked on completion, cancellation, error,
 *   and navigation away.
 * - OCR text is never logged.
 */

export interface OcrHandle {
  /** Resolves with the recognised text, or rejects with an `OcrError`. */
  readonly done: Promise<string>;
  readonly cancel: () => void;
}

export type OcrErrorCode = 'unavailable' | 'cancelled' | 'failed';

export class OcrError extends Error {
  readonly code: OcrErrorCode;
  constructor(code: OcrErrorCode) {
    // The message carries a code only: never the filename, image data, or provider error.
    super(`ocr_${code}`);
    this.name = 'OcrError';
    this.code = code;
  }
}

const LANGUAGE_BY_LOCALE: Record<Locale, string> = { id: 'ind', en: 'eng' };

export interface StartOcrOptions {
  readonly file: File;
  readonly locale: Locale;
  readonly onProgress: (percent: number) => void;
}

export function startOcr({ file, locale, onProgress }: StartOcrOptions): OcrHandle {
  let cancelled = false;
  let terminate: (() => Promise<unknown>) | null = null;
  let objectUrl: string | null = null;

  const cleanUp = async () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
    if (terminate) {
      const stop = terminate;
      terminate = null;
      await stop().catch(() => undefined);
    }
  };

  const done = (async () => {
    let createWorker: typeof import('tesseract.js').createWorker;
    try {
      ({ createWorker } = await import('tesseract.js'));
    } catch {
      throw new OcrError('unavailable');
    }

    const worker = await createWorker(LANGUAGE_BY_LOCALE[locale], 1, {
      workerPath: '/ocr/worker.min.js',
      corePath: '/ocr',
      langPath: '/tessdata',
      gzip: false,
      logger: (entry: { status: string; progress: number }) => {
        if (entry.status === 'recognizing text') {
          onProgress(Math.round(entry.progress * 100));
        }
      },
    }).catch(() => {
      throw new OcrError('unavailable');
    });

    terminate = () => worker.terminate();
    if (cancelled) {
      await cleanUp();
      throw new OcrError('cancelled');
    }

    objectUrl = URL.createObjectURL(file);
    try {
      const { data } = await worker.recognize(objectUrl);
      if (cancelled) throw new OcrError('cancelled');
      return data.text;
    } catch (error) {
      if (error instanceof OcrError) throw error;
      throw new OcrError('failed');
    } finally {
      await cleanUp();
    }
  })();

  return {
    done,
    cancel: () => {
      cancelled = true;
      void cleanUp();
    },
  };
}
