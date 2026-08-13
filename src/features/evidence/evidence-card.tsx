'use client';

import { useId } from 'react';
import { Icon } from '@/components/ui/icon';
import { StatusBadge } from '@/components/ui/status-badge';
import { ExternalSourceLink } from '@/features/actions/external-source-link';
import { useLocale } from '@/app/providers/locale-provider';
import { CATEGORY_LABEL_KEY } from '@/domain/evidence/evidence-item';
import type { EvidenceMapEntry } from '@/domain/verification/run-verification';
import { renderEvidenceItem } from '@/features/evidence/evidence-view-model';

interface EvidenceCardProps {
  readonly entry: EvidenceMapEntry;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}

/**
 * Accordion card for one evidence category (PRD FR-10, DESIGN.md 6).
 * The expanded panel shows every contract field; nothing is truncated.
 */
export function EvidenceCard({ entry, isOpen, onToggle }: EvidenceCardProps) {
  const { t, locale } = useLocale();
  const panelId = useId();
  const buttonId = `${panelId}-button`;
  const categoryLabel = t(CATEGORY_LABEL_KEY[entry.category]);

  return (
    <div className="overflow-hidden rounded-card border border-border-default bg-surface-card">
      <h3>
        <button
          type="button"
          id={buttonId}
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex min-h-11 w-full items-center gap-2 px-4 py-3 text-left"
        >
          <span className="flex-1 text-sm font-bold text-text-primary">
            {categoryLabel}
          </span>
          <StatusBadge status={entry.status} />
          <Icon
            name="chevron-down"
            size={18}
            className={`shrink-0 text-border-strong transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </h3>

      <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen}>
        <div className="flex flex-col gap-4 border-t border-border-default px-4 py-3">
          {entry.items.map((item) => {
            const view = renderEvidenceItem(locale, item);
            return (
              <article
                key={view.id}
                className="flex flex-col gap-2 text-[12.5px] leading-relaxed"
              >
                <Row label={t('result.evidence_claim')} value={view.claim} />
                {view.finding ? (
                  <Row label={t('result.evidence_finding')} value={view.finding} />
                ) : null}
                <Row label={t('result.evidence_status')} value={view.statusLabel} />
                <Row label={t('result.evidence_reason')} value={view.reason} />
                <Row
                  label={t('result.evidence_source')}
                  value={`${view.sourceName} · ${view.sourceTierLabel}`}
                />
                {view.sourceUrl ? (
                  <ExternalSourceLink url={view.sourceUrl} label={view.sourceName} />
                ) : null}
                <Row label={t('result.evidence_method')} value={view.methodLabel} />
                <Row
                  label={t('source.retrieved_at', { date: view.retrievedAtLabel ?? '—' })}
                  value={t('source.checked_at', { date: view.checkedAtLabel })}
                  inline
                />
                <Row
                  label={t('result.evidence_missing')}
                  value={view.missingInformation.join(' ')}
                />
                <Row label={t('result.evidence_limitation')} value={view.limitation} />
                <p className="rounded-lg bg-match-bg px-3 py-2 text-brand-primary-strong">
                  <strong className="font-bold">{t('result.evidence_next')}:</strong>{' '}
                  {view.nextAction}
                </p>
                {view.ruleLabel || view.snapshotLabel ? (
                  <p className="font-mono text-[10.5px] text-text-faint">
                    {[view.ruleLabel, view.snapshotLabel].filter(Boolean).join(' · ')}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  inline,
}: {
  readonly label: string;
  readonly value: string;
  readonly inline?: boolean;
}) {
  return (
    <p className="text-text-secondary">
      <strong className="font-bold text-text-primary">{label}</strong>
      {inline ? ' · ' : ': '}
      {value}
    </p>
  );
}
