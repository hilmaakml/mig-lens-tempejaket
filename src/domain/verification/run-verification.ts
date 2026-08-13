import {
  isRiskIndicator,
  type EvidenceCategory,
  type EvidenceItem,
} from '@/domain/evidence/evidence-item';
import type { OfferClaim } from '@/domain/claims/offer-claim';
import { evaluatePaymentRules } from '@/domain/rules/payment-rules';
import type { RuleContext } from '@/domain/rules/rule-types';
import type { EvidenceDataMode } from '@/domain/sources/data-mode';
import {
  getFreshness,
  type FreshnessState,
  type SourceSnapshot,
} from '@/domain/sources/snapshot';
import { getSource } from '@/domain/sources/source-registry';
import {
  checkCompany,
  checkContact,
  checkContract,
  checkVacancy,
  checkVisa,
} from '@/domain/verification/source-checks';

/**
 * Orchestrates every check for one confirmed offer (PRD FR-11).
 *
 * Ordering of the returned collections is the order the UI renders. The indicator count is
 * never stored separately: it is `triggeredIndicators.length`, and the same array is what
 * the screen lists (CONVENTIONS.md 20).
 */

export type Recommendation =
  | 'delay_payment'
  | 'verify_before_acting'
  | 'no_indicator_triggered';

export interface VerificationResult {
  readonly checkedAt: string;
  readonly dataMode: EvidenceDataMode;
  readonly snapshotFreshness: FreshnessState;
  readonly items: readonly EvidenceItem[];
  readonly triggeredIndicators: readonly EvidenceItem[];
  readonly recommendation: Recommendation;
  readonly companyItem: EvidenceItem;
  readonly contactItem: EvidenceItem;
  readonly paymentItems: readonly EvidenceItem[];
  readonly evidenceMap: readonly EvidenceMapEntry[];
}

export interface EvidenceMapEntry {
  readonly category: EvidenceCategory;
  readonly items: readonly EvidenceItem[];
  /** Worst status in the group, used for the collapsed badge. */
  readonly status: EvidenceItem['status'];
}

const CATEGORY_ORDER: readonly EvidenceCategory[] = [
  'company',
  'contact',
  'vacancy',
  'contract',
  'visa',
  'payment',
  'time_pressure',
];

const STATUS_SEVERITY: Readonly<Record<EvidenceItem['status'], number>> = {
  source_match: 0,
  unverified: 1,
  mismatch: 2,
  risk_indicator: 3,
};

export interface VerificationInput {
  readonly claim: OfferClaim;
  readonly dataMode: EvidenceDataMode;
  /** Reference dataset, or `null` when no approved dataset is available for this mode. */
  readonly snapshot: SourceSnapshot | null;
  readonly now: Date;
}

export function runVerification(input: VerificationInput): VerificationResult {
  const { claim, dataMode, snapshot, now } = input;
  const checkedAt = now.toISOString();

  // A production data mode may never read a demo dataset (DATA_SOURCES.md 7).
  const usableSnapshot =
    snapshot && (dataMode.kind === 'demo' ? snapshot.isDemo : !snapshot.isDemo)
      ? snapshot
      : null;

  const threshold =
    getSource(usableSnapshot?.sourceId ?? '')?.freshnessThresholdDays ?? 30;
  const snapshotFreshness: FreshnessState = usableSnapshot
    ? getFreshness(usableSnapshot, threshold, now)
    : 'unknown';

  const baseContext: RuleContext = {
    checkedAt,
    dataMode,
    snapshot: usableSnapshot,
    snapshotFreshness,
    isContactVerified: false,
  };

  const company = checkCompany(claim, baseContext);
  const contact = checkContact(claim, baseContext, company.matchedRecord);
  const context: RuleContext = { ...baseContext, isContactVerified: contact.isVerified };

  const vacancy = checkVacancy(claim, context);
  const contract = checkContract(claim, context);
  const visa = checkVisa(claim, context);
  const ruleItems = evaluatePaymentRules(claim, context);

  const items: readonly EvidenceItem[] = [
    company.item,
    contact.item,
    vacancy,
    contract,
    visa,
    ...ruleItems,
  ];

  const triggeredIndicators = items.filter(isRiskIndicator);

  const evidenceMap: EvidenceMapEntry[] = CATEGORY_ORDER.map((category) => {
    const categoryItems = items.filter((item) => item.category === category);
    const status = categoryItems.reduce<EvidenceItem['status']>(
      (worst, item) =>
        STATUS_SEVERITY[item.status] > STATUS_SEVERITY[worst] ? item.status : worst,
      categoryItems[0]?.status ?? 'unverified',
    );
    return { category, items: categoryItems, status };
  }).filter((entry) => entry.items.length > 0);

  return {
    checkedAt,
    dataMode,
    snapshotFreshness,
    items,
    triggeredIndicators,
    recommendation: deriveRecommendation(triggeredIndicators, items),
    companyItem: company.item,
    contactItem: contact.item,
    paymentItems: ruleItems,
    evidenceMap,
  };
}

/**
 * The recommendation is derived, never authored per screen. It never says an offer is
 * safe: the best available outcome is "no indicator triggered from what you confirmed"
 * (PRD 11.3).
 */
export function deriveRecommendation(
  triggered: readonly EvidenceItem[],
  items: readonly EvidenceItem[],
): Recommendation {
  const hasPaymentRisk = triggered.some(
    (item) => item.category === 'payment' || item.category === 'time_pressure',
  );
  if (hasPaymentRisk) return 'delay_payment';
  if (triggered.length > 0) return 'verify_before_acting';
  const hasUnresolved = items.some((item) => item.status !== 'source_match');
  return hasUnresolved ? 'verify_before_acting' : 'no_indicator_triggered';
}
