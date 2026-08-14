'use client';

import Image from 'next/image';
import logo from '@/assets/logo.jpg';
import { Icon } from '@/components/ui/icon';
import { StatusBadge } from '@/components/ui/status-badge';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { useLocale } from '@/app/providers/locale-provider';
import {
  CHECKED_CATEGORIES,
  EVIDENCE_PREVIEW,
  HOW_STEPS,
  PRIVACY_POINT_KEYS,
} from '@/features/onboarding/onboarding-content';

/**
 * The shared onboarding / Guide surface (LANDING_PAGE.md sections 8 and 9).
 *
 * Only the header action and the closing action differ between the two modes; every
 * section below comes from the same content model, so the first-run page and the reusable
 * Guide can never disagree.
 */
export type OnboardingMode = 'first-run' | 'guide';

interface OnboardingViewProps {
  readonly mode: OnboardingMode;
  /** First run: "Mulai Periksa". Guide: opens the checker too, from a calmer framing. */
  readonly onPrimaryAction: () => void;
  /** First run: "Lewati". Guide: "Kembali ke Aplikasi". */
  readonly onSecondaryAction: () => void;
}

export function OnboardingView({
  mode,
  onPrimaryAction,
  onSecondaryAction,
}: OnboardingViewProps) {
  const { t } = useLocale();
  const isFirstRun = mode === 'first-run';

  return (
    <div className="pb-10">
      <header className="flex items-center justify-between gap-2 px-4 pt-3 pb-2">
        <span className="flex min-w-0 items-center gap-2">
          <Image
            src={logo}
            alt=""
            aria-hidden="true"
            width={32}
            height={32}
            priority
            className="size-8 shrink-0 rounded-lg"
          />
          <span className="truncate text-xl font-extrabold tracking-tight text-text-primary">
            {t('app.name')}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={onSecondaryAction}
            className="min-h-11 rounded-lg px-2 text-[13px] font-bold text-text-secondary"
          >
            {isFirstRun ? t('onboarding.skip') : t('app.back')}
          </button>
        </span>
      </header>

      <div className="flex flex-col gap-8 px-4 pt-2">
        {/* Section 1 — Introduction */}
        <section className="rounded-hero bg-brand-dark p-6 text-white">
          <p className="font-mono text-[11px] font-semibold tracking-[0.16em] text-brand-accent">
            {t('onboarding.intro.eyebrow')}
          </p>
          <h1 className="mt-3 text-[26px] leading-tight font-extrabold tracking-tight">
            {t('onboarding.intro.heading')}
          </h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-white/85">
            {isFirstRun ? t('onboarding.intro.description') : t('onboarding.guide_intro')}
          </p>

          {/* Original preview built from the product's own status vocabulary. */}
          <div
            className="mt-5 rounded-card bg-white/95 p-3"
            role="img"
            aria-label={t('onboarding.intro.preview_label')}
          >
            <ul className="flex flex-col gap-2">
              {EVIDENCE_PREVIEW.map((row) => (
                <li key={row.labelKey} className="flex items-center gap-2">
                  <span className="flex-1 truncate text-[12.5px] font-semibold text-text-primary">
                    {t(row.labelKey)}
                  </span>
                  <StatusBadge status={row.status} />
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={onPrimaryAction}
            className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-button bg-white px-4 py-4 text-base font-bold text-brand-dark"
          >
            <Icon name="search" size={21} />
            {isFirstRun ? t('onboarding.intro.primary') : t('onboarding.intro.primary')}
          </button>
          <a
            href="#cara-kerja"
            className="mt-2 flex min-h-11 w-full items-center justify-center rounded-button border-[1.5px] border-white/35 px-4 py-3 text-[14.5px] font-bold text-white"
          >
            {t('onboarding.intro.secondary')}
          </a>
        </section>

        {/* Section 2 — What MigLens checks */}
        <section aria-labelledby="yang-diperiksa">
          <h2
            id="yang-diperiksa"
            className="text-lg leading-snug font-extrabold text-text-primary"
          >
            {t('onboarding.checks.heading')}
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-text-secondary">
            {t('onboarding.checks.body')}
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {CHECKED_CATEGORIES.map((entry) => (
              <li
                key={entry.category}
                className="flex items-center gap-2 rounded-xl border border-border-default bg-surface-card px-3 py-2.5"
              >
                <Icon
                  name={entry.icon}
                  size={17}
                  className="shrink-0 text-brand-primary"
                />
                <span className="text-[12px] leading-snug font-semibold text-text-primary">
                  {t(entry.labelKey)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Section 3 — How it works */}
        <section aria-labelledby="cara-kerja" className="scroll-mt-4">
          <h2
            id="cara-kerja"
            className="text-xs font-bold tracking-wide text-text-muted uppercase"
          >
            {t('onboarding.how.heading')}
          </h2>
          <ol className="mt-3 flex flex-col gap-2.5">
            {HOW_STEPS.map((step, index) => (
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
          <p className="mt-3 rounded-card bg-unknown-bg p-4 text-[12.5px] leading-relaxed text-text-secondary">
            {t('onboarding.how.note')}
          </p>
        </section>

        {/* Section 4 — Privacy and limitations */}
        <section aria-labelledby="privasi">
          <h2 id="privasi" className="text-lg font-extrabold text-text-primary">
            {t('onboarding.privacy.heading')}
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {PRIVACY_POINT_KEYS.map((key) => (
              <li key={key} className="flex items-start gap-2.5">
                <Icon
                  name="shield-check"
                  size={18}
                  className="mt-0.5 shrink-0 text-brand-primary"
                />
                <span className="text-[13px] leading-relaxed text-text-primary">
                  {t(key)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Final call to action */}
        <section className="rounded-card border border-border-default bg-surface-card p-5">
          <h2 className="text-[15.5px] leading-snug font-extrabold text-text-primary">
            {t('onboarding.final.heading')}
          </h2>
          <button
            type="button"
            onClick={onPrimaryAction}
            className="mt-4 flex min-h-11 w-full items-center justify-center rounded-button bg-brand-primary px-4 py-4 text-base font-bold text-white"
          >
            {t('onboarding.final.button')}
          </button>
          {!isFirstRun ? (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="mt-2 flex min-h-11 w-full items-center justify-center rounded-button border-[1.5px] border-border-strong px-4 py-3 text-[14.5px] font-bold text-brand-dark"
            >
              {t('onboarding.return_to_app')}
            </button>
          ) : null}
          <p className="mt-3 text-[11.5px] leading-relaxed text-risk-deep">
            {t('onboarding.final.note')}
          </p>
        </section>
      </div>
    </div>
  );
}
