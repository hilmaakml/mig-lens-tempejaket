'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ScreenHeader } from '@/components/layout/screen-header';
import { LinkButton } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Notice } from '@/components/ui/notice';
import { StatusBadge } from '@/components/ui/status-badge';
import { EvidenceCard } from '@/features/evidence/evidence-card';
import { renderEvidenceItem } from '@/features/evidence/evidence-view-model';
import { PaymentSafetyCheck } from '@/features/result/payment-safety-check';
import { ExternalSourceLink } from '@/features/actions/external-source-link';
import { useLocale } from '@/app/providers/locale-provider';
import { useOffer } from '@/app/providers/offer-provider';
import { useProgress } from '@/features/progress/use-progress';
import { maskContactHandle } from '@/domain/privacy/mask';
import { getExercise, mapExercise } from '@/domain/learning/exercise-mapping';
import type { EvidenceCategory } from '@/domain/evidence/evidence-item';

export default function ResultPage() {
  const { t, locale, formatDate } = useLocale();
  const { claim, result } = useOffer();
  const { recordCheckCompleted } = useProgress();
  const [openCategories, setOpenCategories] = useState<readonly EvidenceCategory[]>([]);

  // One history entry per completed check, written after the result screen has actually
  // rendered. The store skips demo runs and ignores a check whose timestamp is already
  // recorded, so a re-render, a language switch, or a repeat visit cannot duplicate it.
  useEffect(() => {
    if (result) recordCheckCompleted(result);
  }, [result, recordCheckCompleted]);

  // A reload clears the in-memory offer state by design; explain it instead of restoring.
  if (!result) {
    return (
      <div className="pb-8">
        <ScreenHeader titleKey="result.title" backHref="/periksa" />
        <div className="flex flex-col gap-4 px-4 py-4">
          <Notice tone="info" title={t('result.no_state_title')} role="status">
            {t('result.no_state_body')}
          </Notice>
          <LinkButton href="/periksa">{t('result.no_state_cta')}</LinkButton>
        </div>
      </div>
    );
  }

  const isDemo = result.dataMode.kind === 'demo';
  const indicatorCount = result.triggeredIndicators.length;
  const recommendation = result.recommendation;
  const companyView = renderEvidenceItem(locale, result.companyItem);
  const contactView = renderEvidenceItem(locale, result.contactItem);
  const exerciseId = mapExercise(result.items);
  const exercise = exerciseId ? getExercise(exerciseId) : null;

  const toggleCategory = (category: EvidenceCategory) =>
    setOpenCategories((current) =>
      current.includes(category)
        ? current.filter((entry) => entry !== category)
        : [...current, category],
    );

  return (
    <div className="pb-8">
      <ScreenHeader
        titleKey="result.title"
        backHref="/konfirmasi"
        showDemoBadge={isDemo}
      />

      <div className="flex flex-col gap-4 px-4 py-4">
        {isDemo ? (
          <p className="rounded-lg bg-unknown-bg px-3 py-2 font-mono text-[11px] text-text-secondary">
            {t('app.demo_badge')}
          </p>
        ) : null}

        {/* 1. Recommended immediate action */}
        <section
          className={`rounded-card border p-4 ${
            recommendation === 'delay_payment'
              ? 'border-risk-border bg-risk-bg'
              : 'border-border-default bg-surface-card'
          }`}
        >
          <div className="flex items-start gap-3">
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                recommendation === 'delay_payment'
                  ? 'bg-risk-border text-risk-text'
                  : 'bg-unknown-bg text-text-secondary'
              }`}
            >
              <Icon
                name={recommendation === 'delay_payment' ? 'warning' : 'info'}
                size={24}
              />
            </span>
            <div>
              <h2
                className={`text-lg font-extrabold ${
                  recommendation === 'delay_payment'
                    ? 'text-risk-text'
                    : 'text-text-primary'
                }`}
              >
                {t(`result.recommendation.${recommendation}.headline`)}
              </h2>
              <p
                className={`mt-1 text-[13px] leading-relaxed ${
                  recommendation === 'delay_payment'
                    ? 'text-risk-deep'
                    : 'text-text-secondary'
                }`}
              >
                {t(`result.recommendation.${recommendation}.body`)}
              </p>
            </div>
          </div>
        </section>

        {/* 2 + 3. Count derived from the same list rendered below it */}
        <section aria-labelledby="indicator-heading">
          <h2
            id="indicator-heading"
            className="mb-2 text-[15px] font-extrabold text-text-primary"
          >
            {indicatorCount === 0
              ? t('result.indicator_count_zero')
              : t('result.indicator_count', { count: indicatorCount })}
          </h2>
          {indicatorCount > 0 ? (
            <ol
              aria-label={t('result.indicator_list_label')}
              className="overflow-hidden rounded-card border border-border-default bg-surface-card"
            >
              {result.triggeredIndicators.map((item, index) => {
                const view = renderEvidenceItem(locale, item);
                return (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 border-b border-border-default px-4 py-3 last:border-b-0"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-risk-bg text-xs font-extrabold text-risk-text">
                      {index + 1}
                    </span>
                    <span className="text-[13.5px] leading-relaxed text-text-primary">
                      {view.finding ?? view.reason}
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : null}
        </section>

        <h2 className="text-xs font-bold tracking-wide text-text-muted uppercase">
          {t('result.section_verification')}
        </h2>

        {/* 4. Company — visually separate card */}
        <section className="rounded-card border border-border-default bg-surface-card p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Icon name="building" size={19} className="text-text-secondary" />
              <span className="text-[14.5px] font-bold text-text-primary">
                {t('result.company_card')}
              </span>
            </span>
            <StatusBadge
              status={result.companyItem.status}
              labelKey={
                result.companyItem.status === 'source_match'
                  ? 'result.company_found_badge'
                  : undefined
              }
            />
          </div>
          <p className="mt-3 text-[13.5px] font-semibold text-text-primary">
            {companyView.claim}
          </p>
          <dl className="mt-2 flex flex-col gap-1 text-[12.5px] leading-snug text-text-secondary">
            <Meta label={t('result.evidence_reason')} value={companyView.reason} />
            <Meta label={t('result.evidence_source')} value={companyView.sourceName} />
            <Meta
              label={t('source.retrieved_at', {
                date: companyView.retrievedAtLabel ?? '—',
              })}
              value={t('source.checked_at', { date: companyView.checkedAtLabel })}
              inline
            />
          </dl>
          {result.snapshotFreshness === 'stale' ? (
            <p className="mt-2 text-[12px] font-semibold text-risk-text">
              {t('source.stale_note')}
            </p>
          ) : null}
          {result.companyItem.snapshotId && result.companyItem.retrievedAt ? (
            <p className="mt-2 text-[12px] text-text-muted">
              {t('source.snapshot_note', {
                date: formatDate(result.companyItem.retrievedAt),
              })}
            </p>
          ) : null}
          <p className="mt-2 text-[12px] leading-snug text-text-muted">
            {companyView.limitation}
          </p>
          {companyView.sourceUrl ? (
            <div className="mt-3">
              <ExternalSourceLink
                url={companyView.sourceUrl}
                label={companyView.sourceName}
              />
            </div>
          ) : null}
        </section>

        {/* 5. Contacting channel — never merged with the company status */}
        <section className="rounded-card border border-border-default bg-surface-card p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Icon name="user" size={19} className="text-text-secondary" />
              <span className="text-[14.5px] font-bold text-text-primary">
                {t('result.contact_card')}
              </span>
            </span>
            <StatusBadge status={result.contactItem.status} />
          </div>
          <p className="mt-3 text-[13.5px] font-semibold text-text-primary">
            {t(`option.channel.${claim.contactChannel}`)}
            {claim.contactHandle ? ` · ${maskContactHandle(claim.contactHandle)}` : ''}
          </p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-text-secondary">
            {result.companyItem.status === 'source_match'
              ? t('result.contact_separation_notice')
              : contactView.reason}
          </p>
          <p className="mt-2 rounded-lg bg-surface-app px-3 py-2 text-[12px] leading-relaxed text-text-secondary">
            <strong className="font-bold">{t('result.next_step_label')}:</strong>{' '}
            {contactView.nextAction}
          </p>
          <div className="mt-3">
            <LinkButton href="/kanal" variant="secondary">
              {t('result.action_contact')}
            </LinkButton>
          </div>
        </section>

        {/* 6. Payment Safety Check */}
        <PaymentSafetyCheck claim={claim} ruleItems={result.paymentItems} />

        {/* 7. Evidence Map */}
        <h2 className="text-xs font-bold tracking-wide text-text-muted uppercase">
          {t('result.section_evidence')}
        </h2>
        <div className="flex flex-col gap-2.5">
          {result.evidenceMap.map((entry) => (
            <EvidenceCard
              key={entry.category}
              entry={entry}
              isOpen={openCategories.includes(entry.category)}
              onToggle={() => toggleCategory(entry.category)}
            />
          ))}
        </div>

        {/* 8. Official Action Pack */}
        <h2 className="text-xs font-bold tracking-wide text-text-muted uppercase">
          {t('result.section_actions')}
        </h2>
        <div className="flex flex-col gap-2.5">
          <LinkButton href="/pesan">
            <Icon name="message" size={19} />
            {t('result.action_message')}
          </LinkButton>
          <div className="grid grid-cols-2 gap-2.5">
            <ActionTile
              href="/kanal"
              icon="external"
              label={t('result.action_sources')}
            />
            <ActionTile href="/bagikan" icon="share" label={t('result.action_share')} />
            <ActionTile href="/kanal" icon="phone" label={t('result.action_contact')} />
            <ActionTile
              href="/kanal#pengaduan"
              icon="shield"
              label={t('result.action_complaint')}
            />
          </div>
        </div>

        {/* 9. Relevant personal exercise */}
        {exercise ? (
          <section className="rounded-card bg-brand-dark p-5 text-white">
            <p className="font-mono text-[10.5px] font-semibold tracking-[0.14em] text-brand-accent">
              {t('result.exercise_eyebrow')}
            </p>
            <h2 className="mt-2 text-[15.5px] leading-snug font-bold">
              {t(exercise.titleKey)}
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-white/80">
              {t('result.exercise_reason')}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-white/80">
              {t(exercise.reasonKey)}
            </p>
            <Link
              href="/latihan"
              className="mt-4 flex min-h-11 w-full items-center justify-center rounded-button bg-white px-4 py-3.5 text-[15px] font-bold text-brand-dark"
            >
              {t('result.exercise_cta')}
            </Link>
          </section>
        ) : null}

        {/* 10. Product limitation */}
        <p className="rounded-card bg-unknown-bg p-4 text-xs leading-relaxed text-text-secondary">
          {t('result.limitation')}
        </p>
      </div>
    </div>
  );
}

function ActionTile({
  href,
  icon,
  label,
}: {
  readonly href: string;
  readonly icon: 'external' | 'share' | 'phone' | 'shield';
  readonly label: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-11 flex-col items-center gap-1.5 rounded-xl border-[1.4px] border-border-strong bg-surface-card px-2.5 py-3 text-center text-[13px] font-bold text-brand-dark"
    >
      <Icon name={icon} size={19} />
      {label}
    </Link>
  );
}

function Meta({
  label,
  value,
  inline,
}: {
  readonly label: string;
  readonly value: string;
  readonly inline?: boolean;
}) {
  return (
    <div>
      <dt className="inline font-semibold text-text-primary">{label}</dt>
      <dd className="inline">
        {inline ? ' · ' : ': '}
        {value}
      </dd>
    </div>
  );
}
