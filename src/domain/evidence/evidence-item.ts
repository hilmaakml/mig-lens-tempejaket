import type { MessageKey, MessageParams } from '@/content/locales/message-key';

/**
 * Canonical status vocabulary (PRD FR-10, CONVENTIONS.md 8, DATA_SOURCES.md 9).
 * One value set is used by rules, sources, UI, and tests.
 */
export type EvidenceStatus =
  | 'source_match'
  | 'unverified'
  | 'mismatch'
  | 'risk_indicator';

export type SourceTier =
  | 'official_primary'
  | 'official_guidance'
  | 'user_provided'
  | 'community_signal';

export type ComparisonMethod =
  | 'exact'
  | 'normalized'
  | 'partial'
  | 'manual'
  | 'rule_based';

export type EvidenceCategory =
  | 'company'
  | 'contact'
  | 'vacancy'
  | 'contract'
  | 'visa'
  | 'payment'
  | 'time_pressure';

/**
 * Domain text is locale-neutral: rules and source adapters emit either a message key
 * (MigranShield's own wording, translated at the presentation boundary) or a verbatim
 * `source` value that must never be translated — official names, identifiers, URLs, and
 * user input (CONVENTIONS.md 13.3, DATA_SOURCES.md 5.1).
 */
export type LocalizedText =
  | {
      readonly kind: 'message';
      readonly key: MessageKey;
      readonly params?: MessageParams;
    }
  | { readonly kind: 'source'; readonly value: string };

export const message = (key: MessageKey, params?: MessageParams): LocalizedText =>
  params ? { kind: 'message', key, params } : { kind: 'message', key };

export const sourceValue = (value: string): LocalizedText => ({ kind: 'source', value });

/**
 * The semantic evidence contract from PRD FR-10. Fields are never dropped to simplify a card;
 * the UI may collapse them, but the object always carries them.
 */
export interface EvidenceItem {
  readonly id: string;
  readonly category: EvidenceCategory;
  readonly claim: LocalizedText;
  readonly finding: LocalizedText | null;
  readonly status: EvidenceStatus;
  readonly reason: LocalizedText;
  readonly sourceName: LocalizedText;
  readonly sourceUrl: string | null;
  readonly sourceTier: SourceTier;
  readonly retrievedAt: string | null;
  readonly checkedAt: string;
  readonly method: ComparisonMethod;
  readonly missingInformation: readonly LocalizedText[];
  readonly limitation: LocalizedText;
  readonly nextAction: LocalizedText;
  readonly ruleId: string | null;
  readonly ruleVersion: string | null;
  readonly snapshotId: string | null;
}

export const isRiskIndicator = (item: EvidenceItem): boolean =>
  item.status === 'risk_indicator';

/** Statuses that still need the user to obtain evidence. */
export const isUnresolved = (item: EvidenceItem): boolean =>
  item.status !== 'source_match';

export const STATUS_LABEL_KEY: Readonly<Record<EvidenceStatus, MessageKey>> = {
  source_match: 'status.source_match',
  unverified: 'status.unverified',
  mismatch: 'status.mismatch',
  risk_indicator: 'status.risk_indicator',
};

export const METHOD_LABEL_KEY: Readonly<Record<ComparisonMethod, MessageKey>> = {
  exact: 'method.exact',
  normalized: 'method.normalized',
  partial: 'method.partial',
  manual: 'method.manual',
  rule_based: 'method.rule_based',
};

export const TIER_LABEL_KEY: Readonly<Record<SourceTier, MessageKey>> = {
  official_primary: 'tier.official_primary',
  official_guidance: 'tier.official_guidance',
  user_provided: 'tier.user_provided',
  community_signal: 'tier.community_signal',
};

export const CATEGORY_LABEL_KEY: Readonly<Record<EvidenceCategory, MessageKey>> = {
  company: 'category.company',
  contact: 'category.contact',
  vacancy: 'category.vacancy',
  contract: 'category.contract',
  visa: 'category.visa',
  payment: 'category.payment',
  time_pressure: 'category.time_pressure',
};
