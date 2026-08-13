'use client';

import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { useLocale } from '@/app/providers/locale-provider';

/**
 * Error boundary. It renders reviewed copy only — never the error message, stack, or any
 * application state, which could contain offer content (SECURITY.md 6).
 */
export default function ErrorBoundary({ reset }: { error: Error; reset: () => void }) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-4 px-4 py-8">
      <h1 className="text-lg font-extrabold text-text-primary">{t('error.title')}</h1>
      <Notice tone="error" role="alert">
        {t('error.body')}
      </Notice>
      <Button onClick={reset}>{t('error.retry')}</Button>
    </div>
  );
}
