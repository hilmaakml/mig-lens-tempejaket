'use client';

import Link from 'next/link';
import { ScreenHeader } from '@/components/layout/screen-header';
import { Notice } from '@/components/ui/notice';
import { useLocale } from '@/app/providers/locale-provider';
import { useOffer } from '@/app/providers/offer-provider';
import { EXERCISES } from '@/domain/learning/exercise-mapping';

const CORE_VERIFICATION_STEPS = 5;

export default function ProgressPage() {
  const { t, formatDate } = useLocale();
  const { result } = useOffer();

  const practised = EXERCISES.filter((exercise) => exercise.recognised >= 2).length;

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
              {t('home.progress.value', {
                done: practised,
                total: CORE_VERIFICATION_STEPS,
              })}
            </p>
          </div>
          <div className="my-3 flex gap-1.5" aria-hidden="true">
            {Array.from({ length: CORE_VERIFICATION_STEPS }, (_, index) => (
              <span
                key={index}
                className={`h-2.5 flex-1 rounded-full ${
                  index < practised ? 'bg-brand-primary' : 'bg-border-default'
                }`}
              />
            ))}
          </div>
          <p className="text-[12.5px] leading-relaxed text-text-muted">
            {t('progress.readiness_body', {
              done: practised,
              total: CORE_VERIFICATION_STEPS,
            })}
          </p>
        </section>

        <h2 className="text-xs font-bold tracking-wide text-text-muted uppercase">
          {t('progress.per_tactic')}
        </h2>
        <ul className="flex flex-col gap-2.5">
          {EXERCISES.map((exercise) => (
            <li
              key={exercise.id}
              className="rounded-card border border-border-default bg-surface-card p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-text-primary">
                  {t(exercise.titleKey)}
                </span>
                <span className="shrink-0 text-[11.5px] font-bold text-text-muted">
                  {t('learn.progress_label', {
                    done: exercise.recognised,
                    total: exercise.total,
                  })}
                </span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-unknown-bg">
                <div
                  className="h-full bg-brand-primary"
                  style={{
                    width: `${Math.round((exercise.recognised / exercise.total) * 100)}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>

        <h2 className="text-xs font-bold tracking-wide text-text-muted uppercase">
          {t('progress.history')}
        </h2>
        <Notice tone="info">{t('progress.history_note')}</Notice>

        <ul className="overflow-hidden rounded-card border border-border-default bg-surface-card">
          {result ? (
            <li className="border-b border-border-default">
              <Link href="/hasil" className="flex items-center gap-3 px-4 py-3">
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-text-primary">
                    {t('progress.session_entry')}
                  </span>
                  <span className="block text-xs text-text-muted">
                    {formatDate(result.checkedAt)}
                    {result.dataMode.kind === 'demo' ? ` · ${t('app.demo_badge')}` : ''}
                  </span>
                </span>
                <span className="shrink-0 rounded-md bg-risk-bg px-2 py-1 text-[11px] font-bold text-risk-text">
                  {t('progress.indicator_badge', {
                    count: result.triggeredIndicators.length,
                  })}
                </span>
              </Link>
            </li>
          ) : (
            <li className="border-b border-border-default px-4 py-3 text-xs text-text-muted">
              {t('progress.history_empty')}
            </li>
          )}

          <li className="flex items-center gap-3 border-b border-border-default px-4 py-3">
            <span className="flex-1">
              <span className="block text-sm font-semibold text-text-primary">
                {t('progress.history_demo_1')}
              </span>
              <span className="block text-xs text-text-muted">{t('app.demo_badge')}</span>
            </span>
            <span className="shrink-0 rounded-md bg-risk-bg px-2 py-1 text-[11px] font-bold text-risk-text">
              {t('progress.indicator_badge', { count: 4 })}
            </span>
          </li>
          <li className="flex items-center gap-3 px-4 py-3">
            <span className="flex-1">
              <span className="block text-sm font-semibold text-text-primary">
                {t('progress.history_demo_2')}
              </span>
              <span className="block text-xs text-text-muted">{t('app.demo_badge')}</span>
            </span>
            <span className="shrink-0 rounded-md bg-unknown-bg px-2 py-1 text-[11px] font-bold text-text-secondary">
              {t('progress.history_needs_confirmation')}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
