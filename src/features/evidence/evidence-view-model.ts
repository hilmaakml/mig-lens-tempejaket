import type { Locale } from '@/content/locales/locale';
import { formatDate, translate } from '@/content/locales/translate';
import {
  METHOD_LABEL_KEY,
  STATUS_LABEL_KEY,
  TIER_LABEL_KEY,
  type EvidenceItem,
  type EvidenceStatus,
  type LocalizedText,
} from '@/domain/evidence/evidence-item';

/**
 * Presentation boundary (CONVENTIONS.md 13.3).
 *
 * Domain objects hold locale-neutral message keys and verbatim source values; this module
 * turns one into the string-valued view model the UI renders. Source values pass through
 * untouched — official names, identifiers, and URLs are never translated.
 */

export function renderText(locale: Locale, text: LocalizedText): string {
  return text.kind === 'source' ? text.value : translate(locale, text.key, text.params);
}

export interface EvidenceItemView {
  readonly id: string;
  readonly status: EvidenceStatus;
  readonly statusLabel: string;
  readonly claim: string;
  readonly finding: string | null;
  readonly reason: string;
  readonly sourceName: string;
  readonly sourceUrl: string | null;
  readonly sourceTierLabel: string;
  readonly retrievedAtLabel: string | null;
  readonly checkedAtLabel: string;
  readonly methodLabel: string;
  readonly missingInformation: readonly string[];
  readonly limitation: string;
  readonly nextAction: string;
  readonly ruleLabel: string | null;
  readonly snapshotLabel: string | null;
}

export function renderEvidenceItem(locale: Locale, item: EvidenceItem): EvidenceItemView {
  return {
    id: item.id,
    status: item.status,
    statusLabel: translate(locale, STATUS_LABEL_KEY[item.status]),
    claim: renderText(locale, item.claim),
    finding: item.finding ? renderText(locale, item.finding) : null,
    reason: renderText(locale, item.reason),
    sourceName: renderText(locale, item.sourceName),
    sourceUrl: item.sourceUrl,
    sourceTierLabel: translate(locale, TIER_LABEL_KEY[item.sourceTier]),
    retrievedAtLabel: item.retrievedAt ? formatDate(locale, item.retrievedAt) : null,
    checkedAtLabel: formatDate(locale, item.checkedAt),
    methodLabel: translate(locale, METHOD_LABEL_KEY[item.method]),
    missingInformation: item.missingInformation.map((entry) => renderText(locale, entry)),
    limitation: renderText(locale, item.limitation),
    nextAction: renderText(locale, item.nextAction),
    ruleLabel:
      item.ruleId && item.ruleVersion
        ? translate(locale, 'result.evidence_rule', {
            ruleId: item.ruleId,
            ruleVersion: item.ruleVersion,
          })
        : null,
    snapshotLabel: item.snapshotId
      ? translate(locale, 'result.evidence_snapshot', { snapshotId: item.snapshotId })
      : null,
  };
}
