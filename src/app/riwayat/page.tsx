'use client';

import { useState } from 'react';
import { ScreenHeader } from '@/components/layout/screen-header';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { useLocale } from '@/app/providers/locale-provider';
import { useToast } from '@/app/providers/toast-provider';
import { useProgress } from '@/features/progress/use-progress';

export default function ProgressPage() {
  const { t, formatDate } = useLocale();
  const { showToast } = useToast();
  const {
    readinessDone,
    readinessTotal,
    practisableProgress,
    history,
    hasHistory,
    reset,
  } = useProgress();
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  const handleReset = () => {
    reset();
    setIsConfirmingReset(false);
    showToast(t('progress.reset_done'));
  };

  return (
    <div className="pb-8">
      <ScreenHeader titleKey="progress.title" backHref="/" />

      <div className="flex flex-col gap-4 px-4 py-4">
        <section className="rounded-hero border border-border-default bg-surface-card p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[15px] font-bold text-text-primary">
              {t('progress.readiness_title')}
            </h2>
            <p className="text-2xl font-extrabold text-brand-primary">
              {t('home.progress.value', { done: readinessDone, total: readinessTotal })}
            </p>
          </div>
          <div className="my-3 flex gap-1.5" aria-hidden="true">
            {Array.from({ length: readinessTotal }, (_, index) => (
              <span
                key={index}
                className={`h-2.5 flex-1 rounded-full ${
                  index < readinessDone ? 'bg-brand-primary' : 'bg-border-default'
                }`}
              />
            ))}
          </div>
          <p className="text-[12.5px] leading-relaxed text-text-muted">
            {t('progress.readiness_body', {
              done: readinessDone,
              total: readinessTotal,
            })}
          </p>
        </section>

        <h2 className="text-xs font-bold tracking-wide text-text-muted uppercase">
          {t('progress.per_tactic')}
        </h2>
        <ul className="flex flex-col gap-2.5">
          {practisableProgress.map((entry) => (
            <li
              key={entry.exercise.id}
              className="rounded-card border border-border-default bg-surface-card p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-text-primary">
                  {t(entry.exercise.titleKey)}
                </span>
                <span className="shrink-0 text-[11.5px] font-bold text-text-muted">
                  {t('learn.progress_label', { done: entry.done, total: entry.total })}
                </span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-unknown-bg">
                <div
                  className="h-full bg-brand-primary"
                  style={{ width: `${Math.round((entry.done / entry.total) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>

        <h2 className="text-xs font-bold tracking-wide text-text-muted uppercase">
          {t('progress.history')}
        </h2>
        <Notice tone="info">{t('progress.history_note')}</Notice>

        {hasHistory ? (
          <ul
            className="overflow-hidden rounded-card border border-border-default bg-surface-card"
            data-testid="history-list"
          >
            {history.map((entry) => (
              <li
                key={entry.localId}
                className="flex items-center gap-3 border-b border-border-default px-4 py-3 last:border-b-0"
              >
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-text-primary">
                    {t('progress.history_entry')}
                  </span>
                  <span className="block text-xs text-text-muted">
                    {formatDate(entry.checkedAt)}
                  </span>
                </span>
                <span
                  className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-bold ${
                    entry.indicatorCount > 0
                      ? 'bg-risk-bg text-risk-text'
                      : 'bg-unknown-bg text-text-secondary'
                  }`}
                >
                  {t('progress.indicator_badge', { count: entry.indicatorCount })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p
            className="rounded-card border border-border-default bg-surface-card px-4 py-5 text-center text-[12.5px] leading-relaxed text-text-muted"
            data-testid="history-empty"
          >
            {t('progress.history_empty')}
          </p>
        )}

        <div className="mt-2 flex flex-col gap-2">
          {isConfirmingReset ? (
            <>
              <Notice tone="warning" role="alert">
                {t('progress.reset_confirm')}
              </Notice>
              <Button variant="secondary" onClick={handleReset}>
                {t('progress.reset_confirm_action')}
              </Button>
              <Button variant="ghost" onClick={() => setIsConfirmingReset(false)}>
                {t('progress.reset_cancel')}
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setIsConfirmingReset(true)}>
              {t('progress.reset')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
