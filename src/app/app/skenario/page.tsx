'use client';

import { ScreenHeader } from '@/components/layout/screen-header';
import { LinkButton } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Notice } from '@/components/ui/notice';
import { useLocale } from '@/app/providers/locale-provider';

const LESSON_KEYS = [
  'scenario.lesson_1',
  'scenario.lesson_2',
  'scenario.lesson_3',
] as const;

export default function ScenarioPage() {
  const { t } = useLocale();

  return (
    <div className="pb-8">
      <ScreenHeader titleKey="scenario.title" backHref="/app" />

      <div className="flex flex-col gap-4 px-4 py-4">
        <Notice tone="info">{t('scenario.notice')}</Notice>

        <section className="overflow-hidden rounded-hero border border-border-default">
          <div
            className="flex h-44 items-end justify-center pb-3"
            style={{
              background:
                'repeating-linear-gradient(135deg,#E4E8E5,#E4E8E5 9px,#EDF0EE 9px,#EDF0EE 18px)',
            }}
          >
            <span className="rounded-full bg-white/75 px-3 py-1 font-mono text-[11px] text-text-muted">
              {t('scenario.illustration')}
            </span>
          </div>
          <div className="bg-surface-card px-4 py-4">
            <h2 className="text-lg font-extrabold text-text-primary">
              {t('scenario.name')}
            </h2>
            <p className="mt-0.5 text-[13px] text-text-muted">{t('scenario.subtitle')}</p>
          </div>
        </section>

        <blockquote className="rounded-card bg-brand-dark p-5 text-white">
          <p className="text-base leading-relaxed font-semibold">{t('scenario.quote')}</p>
        </blockquote>

        <h2 className="text-xs font-bold tracking-wide text-text-muted uppercase">
          {t('scenario.lessons')}
        </h2>
        <ul className="flex flex-col gap-2.5">
          {LESSON_KEYS.map((key) => (
            <li key={key} className="flex items-start gap-3">
              <Icon
                name="shield-check"
                size={20}
                className="mt-0.5 shrink-0 text-brand-primary"
              />
              <span className="text-sm leading-relaxed text-text-primary">{t(key)}</span>
            </li>
          ))}
        </ul>

        <LinkButton href="/app/latihan/simulasi">{t('scenario.cta')}</LinkButton>
      </div>
    </div>
  );
}
