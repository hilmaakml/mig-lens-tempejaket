'use client';

import Link from 'next/link';
import Image from 'next/image';
import logo from '@/assets/logo.jpg';
import { Icon } from '@/components/ui/icon';
import { Notice } from '@/components/ui/notice';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { useLocale } from '@/app/providers/locale-provider';
import { useProgress } from '@/features/progress/use-progress';

export default function HomePage() {
  const { t } = useLocale();

  // Explainable count, not a decorative score: distinct core verification steps the user
  // has actually practised (PRD FR-14). A first-time visitor sees 0.
  const { readinessDone: practised, readinessTotal } = useProgress();

  return (
    <div className="pb-8">
      <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          {/* Brand mark. The `shield-check` icon elsewhere is a functional success icon,
              not the logo, so it stays as it is. */}
          <Image
            src={logo}
            alt=""
            aria-hidden="true"
            width={32}
            height={32}
            priority
            className="size-8 shrink-0 rounded-lg"
          />
          <span className="text-xl font-extrabold tracking-tight text-text-primary">
            {t('app.name')}
          </span>
        </div>
        <LanguageSwitcher />
      </div>

      <div className="flex flex-col gap-4 px-4 pb-4">
        <section className="rounded-hero bg-brand-dark p-6 text-white">
          <p className="font-mono text-[11px] font-semibold tracking-[0.16em] text-brand-accent">
            {t('home.hero.eyebrow')}
          </p>
          <h2 className="mt-3 text-[26px] leading-tight font-extrabold tracking-tight">
            {t('home.hero.title')}
          </h2>
          <p className="mt-2 mb-5 text-[14.5px] leading-relaxed text-white/80">
            {t('home.hero.body')}
          </p>
          <Link
            href="/app/periksa"
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-button bg-white px-4 py-4 text-base font-bold text-brand-dark"
          >
            <Icon name="search" size={21} />
            {t('home.hero.cta')}
          </Link>
        </section>

        <Notice tone="info">{t('home.scope_notice')}</Notice>
        <Notice tone="warning">{t('home.privacy_reminder')}</Notice>

        <Link
          href="/app/latihan"
          className="flex items-center gap-3 rounded-card border border-border-default bg-surface-card p-4"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-unknown-bg text-text-secondary">
            <Icon name="graduation" size={22} />
          </span>
          <span className="flex-1">
            <span className="block text-[15px] font-bold text-text-primary">
              {t('home.learning.title')}
            </span>
            <span className="mt-0.5 block text-[12.5px] text-text-muted">
              {t('home.learning.body')}
            </span>
          </span>
          <Icon name="chevron-right" size={20} className="text-border-strong" />
        </Link>

        <Link
          href="/app/riwayat"
          className="block rounded-card border border-border-default bg-surface-card p-4"
        >
          <span className="flex items-baseline justify-between">
            <span className="text-sm font-bold text-text-primary">
              {t('home.progress.title')}
            </span>
            <span className="text-xl font-extrabold text-brand-primary">
              {t('home.progress.value', { done: practised, total: readinessTotal })}
            </span>
          </span>
          <span className="my-3 flex gap-1.5" aria-hidden="true">
            {Array.from({ length: readinessTotal }, (_, index) => (
              <span
                key={index}
                className={`h-2 flex-1 rounded-full ${
                  index < practised ? 'bg-brand-primary' : 'bg-border-default'
                }`}
              />
            ))}
          </span>
          <span className="block text-[12.5px] text-text-muted">
            {t('home.progress.body', { done: practised, total: readinessTotal })}
          </span>
        </Link>

        <section className="overflow-hidden rounded-card border border-border-default bg-surface-card">
          <h3 className="px-4 pt-4 text-xs font-bold tracking-wide text-text-muted uppercase">
            {t('home.scenario.section')}
          </h3>
          <p className="px-4 pt-1 text-[11.5px] leading-snug text-text-faint">
            {t('home.scenario.note')}
          </p>
          <Link href="/app/skenario" className="flex items-center gap-3 px-4 pt-2 pb-4">
            <span
              className="size-11 shrink-0 rounded-full"
              style={{
                background:
                  'repeating-linear-gradient(135deg,#E4E8E5,#E4E8E5 6px,#EDF0EE 6px,#EDF0EE 12px)',
              }}
              aria-hidden="true"
            />
            <span className="flex-1">
              <span className="block text-[14.5px] font-bold text-text-primary">
                {t('home.scenario.title')}
              </span>
              <span className="mt-0.5 block text-[12.5px] leading-snug text-text-muted">
                {t('home.scenario.quote')}
              </span>
            </span>
            <Icon name="chevron-right" size={20} className="text-border-strong" />
          </Link>
        </section>
      </div>
    </div>
  );
}
