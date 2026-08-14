'use client';

import Image from 'next/image';
import caseIllustration from '@/assets/kasus-herlambang.png';
import { ScreenHeader } from '@/components/layout/screen-header';
import { LinkButton } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Notice } from '@/components/ui/notice';
import { useLocale } from '@/app/providers/locale-provider';
import {
  CASE_SOURCE_URL,
  CASE_TIMELINE,
  CASE_LESSON_KEYS,
  CASE_SCENARIO_ID,
} from '@/features/case/reported-case';

/**
 * A reported case (PRD 11.3).
 *
 * This screen presents a real, named case published by detikJogja rather than a composite.
 * Everything stated here is attributed to that reporting and linked to it, so a reader can
 * check the source. The photograph is an illustration and says so: it is not a picture of
 * the person interviewed, and must never be presented as one.
 */
export default function ReportedCasePage() {
  const { t } = useLocale();

  return (
    <div className="pb-8">
      <ScreenHeader titleKey="scenario.title" backHref="/app" />

      <div className="flex flex-col gap-4 px-4 py-4">
        <Notice tone="info">{t('scenario.notice')}</Notice>

        <section className="overflow-hidden rounded-hero border border-border-default">
          <Image
            src={caseIllustration}
            alt=""
            aria-hidden="true"
            width={1600}
            height={900}
            sizes="(max-width: 430px) 100vw, 430px"
            className="h-44 w-full object-cover"
          />
          <div className="bg-surface-card px-4 py-4">
            <p className="text-[11px] text-text-faint">{t('scenario.photo_caption')}</p>
            <h2 className="mt-2 text-lg font-extrabold text-text-primary">
              {t('scenario.name')}
            </h2>
            <p className="mt-0.5 text-[13px] text-text-muted">{t('scenario.subtitle')}</p>
          </div>
        </section>

        {/* Timeline, entirely attributed to the reporting. */}
        <h3 className="text-xs font-bold tracking-wide text-text-muted uppercase">
          {t('scenario.timeline')}
        </h3>
        <ol className="flex flex-col gap-2.5">
          {CASE_TIMELINE.map((step, index) => (
            <li
              key={step.dateKey}
              className="flex items-start gap-3 rounded-card border border-border-default bg-surface-card p-4"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-dark text-[13px] font-bold text-white">
                {index + 1}
              </span>
              <span className="flex-1">
                <span className="block font-mono text-[11px] text-text-faint">
                  {t(step.dateKey)}
                </span>
                <span className="mt-1 block text-[13.5px] leading-relaxed text-text-primary">
                  {t(step.bodyKey)}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <blockquote className="rounded-card bg-brand-dark p-5 text-white">
          <p className="text-base leading-relaxed font-semibold">{t('scenario.quote')}</p>
          <footer className="mt-3 text-[12px] text-white/70">
            {t('scenario.quote_attribution')}
          </footer>
        </blockquote>

        <h3 className="text-xs font-bold tracking-wide text-text-muted uppercase">
          {t('scenario.lessons')}
        </h3>
        <ul className="flex flex-col gap-2.5">
          {CASE_LESSON_KEYS.map((key) => (
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

        {/* Provenance: the reader can open the reporting this page is drawn from. */}
        <section className="rounded-card border border-border-default bg-surface-card p-4">
          <p className="text-xs font-bold tracking-wide text-text-muted uppercase">
            {t('scenario.source')}
          </p>
          <a
            href={CASE_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer external"
            className="mt-2 inline-flex min-h-11 items-center gap-2 text-[13.5px] font-bold text-brand-dark"
          >
            <Icon name="external" size={16} className="shrink-0" />
            <span>
              {t('scenario.source_link')}
              <span className="block font-mono text-[10.5px] font-medium text-text-muted">
                {t('source.destination_domain', { domain: 'detik.com' })}
              </span>
            </span>
          </a>
        </section>

        {/* Opens the practice built from this case, not the composite one. */}
        <LinkButton href={`/app/latihan/simulasi#${CASE_SCENARIO_ID}`}>
          {t('scenario.cta')}
        </LinkButton>
      </div>
    </div>
  );
}
