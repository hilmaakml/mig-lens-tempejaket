import type { EvidenceItem } from '@/domain/evidence/evidence-item';
import type { OfferClaim } from '@/domain/claims/offer-claim';
import type { EvidenceDataMode } from '@/domain/sources/data-mode';
import type { FreshnessState, SourceSnapshot } from '@/domain/sources/snapshot';

/**
 * Rules are deterministic pure functions. They receive the clock through the context
 * instead of reading it, so results are reproducible in tests (CONVENTIONS.md 9).
 */
export interface RuleContext {
  /** UTC ISO 8601 timestamp of this evaluation. */
  readonly checkedAt: string;
  readonly dataMode: EvidenceDataMode;
  /** Reference dataset in use, or `null` when no approved dataset is available. */
  readonly snapshot: SourceSnapshot | null;
  readonly snapshotFreshness: FreshnessState;
  /** Outcome of the contact check; several payment rules depend on it. */
  readonly isContactVerified: boolean;
}

/**
 * `null` means the rule's condition was not met while its inputs were sufficient — there
 * is nothing to report. A rule with missing input returns an `unverified` item instead,
 * never a match (CONVENTIONS.md 9).
 */
export interface VerificationRule {
  readonly id: string;
  readonly version: string;
  readonly evaluate: (
    claim: Readonly<OfferClaim>,
    context: Readonly<RuleContext>,
  ) => EvidenceItem | null;
}
