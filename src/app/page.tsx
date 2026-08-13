'use client';

import Link from 'next/link';
import Image from 'next/image';
import logo from '@/assets/logo.jpg';
import { Icon, type IconName } from '@/components/ui/icon';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { useLocale } from '@/app/providers/locale-provider';
import type { MessageKey } from '@/content/locales/message-key';

/**
 * Public landing page.
 *
 * It explains the problem, who the product is for, how a check works, and — required by
 * PRD FR-01 and SECURITY.md — what the product does not claim and what it does not store.
 * The application itself lives under `/app`; this page carries no bottom navigation and
 * holds no offer state.
 */

interface Step {
  readonly titleKey: MessageKey;
  readonly bodyKey: MessageKey;
  readonly icon: IconName;
}

const STEPS: readonly Step[] = [
  {
    titleKey: 'landing.how.step1.title',
    bodyKey: 'landing.how.step1.body',
    icon: 'upload',
  },
  {
    titleKey: 'landing.how.step2.title',
    bodyKey: 'landing.how.step2.body',
    icon: 'pencil',
  },
  {
    titleKey: 'landing.how.step3.title',
    bodyKey: 'landing.how.step3.body',
    icon: 'search',
  },
  {
    titleKey: 'landing.how.step4.title',
    bodyKey: 'landing.how.step4.body',
    icon: 'shield-check',
  },
];

const AUDIENCES: readonly { titleKey: MessageKey; bodyKey: MessageKey }[] = [
  {
    titleKey: 'landing.audience.cpmi.title',
    bodyKey: 'landing.audience.cpmi.body',
  },
  {
    titleKey: 'landing.audience.pmi.title',
    bodyKey: 'landing.audience.pmi.body',
  },
];

const LIMITS: readonly { titleKey: MessageKey; bodyKey: MessageKey; icon: IconName }[] = [
  {
    titleKey: 'landing.limits.verdict.title',
    bodyKey: 'landing.limits.verdict.body',
    icon: 'info',
  },
  {
    titleKey: 'landing.limits.privacy.title',
    bodyKey: 'landing.limits.privacy.body',
    icon: 'shield',
  },
  {
    titleKey: 'landing.limits.sources.title',
    bodyKey: 'landing.limits.sources.body',
    icon: 'external',
  },
];

export default function LandingPage() {
  const { t } = useLocale();

  return (
    <div className="pb-10">
      <header className="flex items-center justify-between gap-2 px-4 pt-3 pb-2">
        <span className="flex items-center gap-2">
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
        </span>
        <LanguageSwitcher />
      </header>

      <div className="flex flex-col gap-8 px-4 pt-2">
        {/* Hero */}
        <section className="rounded-hero bg-brand-dark p-6 text-white">
          <p className="font-mono text-[11px] font-semibold tracking-[0.16em] text-brand-accent">
            {t('landing.hero.eyebrow')}
          </p>
          <h1 className="mt-3 text-[26px] leading-tight font-extrabold tracking-tight">
            {t('landing.hero.title')}
          </h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-white/85">
            {t('landing.hero.body')}
          </p>
          <Link
            href="/app/periksa"
            className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-button bg-white px-4 py-4 text-base font-bold text-brand-dark"
          >
            <Icon name="search" size={21} />
            {t('landing.hero.cta')}
          </Link>
          <a
            href="#cara-kerja"
            className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-button border-[1.5px] border-white/35 px-4 py-3 text-[14.5px] font-bold text-white"
          >
            {t('landing.hero.secondary')}
          </a>
        </section>

        {/* The problem */}
        <section aria-labelledby="masalah">
          <h2
            id="masalah"
            className="text-xs font-bold tracking-wide text-text-muted uppercase"
          >
            {t('landing.problem.section')}
          </h2>
          <p className="mt-2 text-lg leading-snug font-extrabold text-text-primary">
            {t('landing.problem.title')}
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-text-secondary">
            {t('landing.problem.body')}
          </p>
        </section>

        {/* Who it is for */}
        <section aria-labelledby="untuk-siapa">
          <h2
            id="untuk-siapa"
            className="text-xs font-bold tracking-wide text-text-muted uppercase"
          >
            {t('landing.audience.section')}
          </h2>
          <ul className="mt-3 flex flex-col gap-2.5">
            {AUDIENCES.map((audience) => (
              <li
                key={audience.titleKey}
                className="rounded-card border border-border-default bg-surface-card p-4"
              >
                <p className="text-[14.5px] font-bold text-text-primary">
                  {t(audience.titleKey)}
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-text-secondary">
                  {t(audience.bodyKey)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section aria-labelledby="cara-kerja" className="scroll-mt-4">
          <h2
            id="cara-kerja"
            className="text-xs font-bold tracking-wide text-text-muted uppercase"
          >
            {t('landing.how.section')}
          </h2>
          <ol className="mt-3 flex flex-col gap-2.5">
            {STEPS.map((step, index) => (
              <li
                key={step.titleKey}
                className="flex items-start gap-3 rounded-card border border-border-default bg-surface-card p-4"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-match-bg text-brand-primary">
                  <Icon name={step.icon} size={19} />
                </span>
                <span className="flex-1">
                  <span className="block text-[11px] font-bold text-text-faint">
                    {index + 1}
                  </span>
                  <span className="block text-[14.5px] font-bold text-text-primary">
                    {t(step.titleKey)}
                  </span>
                  <span className="mt-1 block text-[12.5px] leading-relaxed text-text-secondary">
                    {t(step.bodyKey)}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* Limits and privacy */}
        <section aria-labelledby="batasan">
          <h2
            id="batasan"
            className="text-xs font-bold tracking-wide text-text-muted uppercase"
          >
            {t('landing.limits.section')}
          </h2>
          <ul className="mt-3 flex flex-col gap-2.5">
            {LIMITS.map((limit) => (
              <li
                key={limit.titleKey}
                className="rounded-card border border-border-default bg-unknown-bg p-4"
              >
                <p className="flex items-center gap-2 text-[14px] font-bold text-text-primary">
                  <Icon name={limit.icon} size={17} className="shrink-0" />
                  {t(limit.titleKey)}
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-text-secondary">
                  {t(limit.bodyKey)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Closing call to action */}
        <section className="flex flex-col gap-3 rounded-card border border-border-default bg-surface-card p-5">
          <Link
            href="/app/periksa"
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-button bg-brand-primary px-4 py-4 text-base font-bold text-white"
          >
            {t('landing.footer.cta')}
          </Link>
          <Link
            href="/app"
            className="flex min-h-11 w-full items-center justify-center rounded-button border-[1.5px] border-border-strong px-4 py-3 text-[14.5px] font-bold text-brand-dark"
          >
            {t('nav.home')}
          </Link>
        </section>

        <footer className="border-t border-border-default pt-4 text-[11.5px] leading-relaxed text-text-muted">
          {t('landing.footer.disclaimer')}
        </footer>
      </div>
    </div>
  );
}
