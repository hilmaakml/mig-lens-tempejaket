'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScreenHeader } from '@/components/layout/screen-header';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Notice } from '@/components/ui/notice';
import { useLocale } from '@/app/providers/locale-provider';
import { useOffer } from '@/app/providers/offer-provider';
import {
  ACCEPT_ATTRIBUTE,
  FILE_ERROR_MESSAGE_KEY,
  validateImageFile,
  type FileValidationError,
} from '@/features/offer-input/file-validation';
import { extractClaimFromText } from '@/features/offer-input/extract-claim';
import { OcrError, startOcr, type OcrHandle } from '@/features/offer-input/ocr-runner';

type Phase = 'idle' | 'validating' | 'reading' | 'failed';

export default function UploadPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const { startDemo, startManual, applyExtraction } = useOffer();

  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<FileValidationError | null>(null);
  const [ocrFailed, setOcrFailed] = useState(false);

  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const selectedFile = useRef<File | null>(null);
  const ocrHandle = useRef<OcrHandle | null>(null);

  // Leaving the flow must release the image and stop the worker (SECURITY.md 5).
  useEffect(
    () => () => {
      ocrHandle.current?.cancel();
      ocrHandle.current = null;
      selectedFile.current = null;
    },
    [],
  );

  const clearFile = useCallback(() => {
    selectedFile.current = null;
    setFileName(null);
    if (fileInput.current) fileInput.current.value = '';
    if (cameraInput.current) cameraInput.current.value = '';
  }, []);

  const readFile = useCallback(
    async (file: File) => {
      setOcrFailed(false);
      setProgress(0);
      const handle = startOcr({ file, locale, onProgress: setProgress });
      ocrHandle.current = handle;
      setPhase('reading');
      try {
        const text = await handle.done;
        const extraction = extractClaimFromText(text);
        applyExtraction(extraction.claim, extraction.fieldsNeedingReview);
        clearFile();
        router.push('/konfirmasi');
      } catch (error) {
        if (error instanceof OcrError && error.code === 'cancelled') {
          setPhase('idle');
          return;
        }
        // Only a code reaches the UI; the provider error object is not surfaced or logged.
        setOcrFailed(true);
        setPhase('failed');
      } finally {
        ocrHandle.current = null;
      }
    },
    [applyExtraction, clearFile, locale, router],
  );

  const handleFileChosen = useCallback(
    async (file: File | undefined) => {
      // Cancelling the picker leaves the flow untouched.
      if (!file) return;
      clearFile();
      setErrorKey(null);
      setPhase('validating');
      const validation = await validateImageFile(file);
      if (!validation.ok) {
        setErrorKey(validation.error);
        setPhase('idle');
        clearFile();
        return;
      }
      selectedFile.current = file;
      setFileName(file.name);
      await readFile(file);
    },
    [clearFile, readFile],
  );

  const handleManual = () => {
    startManual();
    router.push('/konfirmasi');
  };

  const handleDemo = () => {
    startDemo();
    router.push('/konfirmasi');
  };

  const isBusy = phase === 'validating' || phase === 'reading';

  return (
    <div className="pb-8">
      <ScreenHeader titleKey="upload.title" backHref="/" />

      <div className="flex flex-col gap-4 px-4 py-4">
        <Notice tone="warning" title={t('upload.privacy_warning_title')}>
          {t('upload.privacy_warning')}
        </Notice>

        {errorKey ? (
          <Notice tone="error" role="alert" title={t('upload.error_title')}>
            {t(FILE_ERROR_MESSAGE_KEY[errorKey])}
          </Notice>
        ) : null}

        <section className="rounded-card border-[1.8px] border-dashed border-border-strong bg-surface-card p-6 text-center">
          <span className="mx-auto mb-3 flex size-13 items-center justify-center rounded-full bg-match-bg text-brand-primary">
            <Icon name="upload" size={26} />
          </span>
          <h2 className="text-[15px] font-bold text-text-primary">
            {t('upload.dropzone_title')}
          </h2>
          <p className="mt-1 text-[12.5px] text-text-muted">{t('upload.formats')}</p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => cameraInput.current?.click()}
              disabled={isBusy}
              className="flex min-h-11 flex-col items-center gap-1.5 rounded-xl border border-border-default bg-surface-app px-2 py-3 disabled:opacity-60"
            >
              <Icon name="camera" size={20} className="text-text-secondary" />
              <span className="text-[11.5px] font-semibold text-text-secondary">
                {t('upload.method_camera')}
              </span>
            </button>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={isBusy}
              className="flex min-h-11 flex-col items-center gap-1.5 rounded-xl border border-border-default bg-surface-app px-2 py-3 disabled:opacity-60"
            >
              <Icon name="file" size={20} className="text-text-secondary" />
              <span className="text-[11.5px] font-semibold text-text-secondary">
                {t('upload.method_file')}
              </span>
            </button>
            <button
              type="button"
              onClick={handleManual}
              className="flex min-h-11 flex-col items-center gap-1.5 rounded-xl border border-border-default bg-surface-app px-2 py-3"
            >
              <Icon name="pencil" size={20} className="text-text-secondary" />
              <span className="text-[11.5px] font-semibold text-text-secondary">
                {t('upload.method_manual')}
              </span>
            </button>
          </div>

          <input
            ref={cameraInput}
            type="file"
            accept={ACCEPT_ATTRIBUTE}
            capture="environment"
            className="sr-only"
            aria-label={t('upload.method_camera')}
            onChange={(event) => void handleFileChosen(event.target.files?.[0])}
          />
          <input
            ref={fileInput}
            type="file"
            accept={ACCEPT_ATTRIBUTE}
            className="sr-only"
            aria-label={t('upload.method_file')}
            onChange={(event) => void handleFileChosen(event.target.files?.[0])}
          />
        </section>

        {fileName ? (
          <p className="text-[12.5px] text-text-secondary">
            {t('upload.selected_file', { name: fileName })}
          </p>
        ) : null}

        <div aria-live="polite" className="min-h-0">
          {phase === 'reading' ? (
            <div className="rounded-card border border-border-default bg-surface-card p-4">
              <p className="text-[13px] font-semibold text-text-primary">
                {t('upload.ocr_progress', { percent: progress })}
              </p>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-unknown-bg"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t('upload.start_ocr')}
              >
                <div
                  className="h-full bg-brand-primary transition-[width]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <Button
                variant="secondary"
                className="mt-3"
                onClick={() => {
                  ocrHandle.current?.cancel();
                  ocrHandle.current = null;
                  clearFile();
                  setPhase('idle');
                }}
              >
                {t('upload.ocr_cancel')}
              </Button>
            </div>
          ) : null}

          {ocrFailed ? (
            <div className="flex flex-col gap-3 rounded-card border border-risk-border bg-risk-bg p-4">
              <p className="text-[13.5px] font-bold text-risk-text">
                {t('upload.ocr_failed_title')}
              </p>
              <p className="text-[12.5px] leading-relaxed text-risk-deep">
                {t('upload.ocr_failed_body')}
              </p>
              <Button variant="primary" onClick={handleManual}>
                {t('upload.ocr_manual_fallback')}
              </Button>
            </div>
          ) : null}
        </div>

        <Notice tone="info">{t('upload.ai_note')}</Notice>
        <Notice tone="match">{t('upload.local_note')}</Notice>

        <div className="flex flex-col gap-2">
          <Button variant="primary" onClick={handleDemo} disabled={isBusy}>
            {t('upload.demo_button')}
          </Button>
          <p className="text-[11.5px] leading-snug text-text-muted">
            {t('upload.demo_note')}
          </p>
        </div>
      </div>
    </div>
  );
}
