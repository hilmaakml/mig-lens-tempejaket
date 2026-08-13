import type { EvidenceCategory, EvidenceStatus } from '@/domain/evidence/evidence-item';
import type { OfferClaim } from '@/domain/claims/offer-claim';
import type {
  VerificationResult,
  Recommendation,
} from '@/domain/verification/run-verification';
import { maskContactHandle, maskLongDigitRuns } from '@/domain/privacy/mask';
import type { MessageKey } from '@/content/locales/message-key';
import { getSource } from '@/domain/sources/source-registry';

/**
 * Allowlisted share view model (PRD FR-13, SECURITY.md 7).
 *
 * Sharing is built from this object only. Application state is never serialized, so a new
 * claim field cannot leak into a shared summary by default — it has to be added here
 * deliberately, and the redaction tests will notice.
 */

export interface RedactedShareSummary {
  readonly recommendation: Recommendation;
  /** Short claim descriptors, truncated and digit-masked. Never company or person names. */
  readonly position: string | null;
  readonly destinationCountry: string | null;
  readonly indicatorCount: number;
  readonly categories: readonly {
    readonly category: EvidenceCategory;
    readonly status: EvidenceStatus;
  }[];
  /** Masked contact handle, included only because it explains the contact status. */
  readonly maskedContact: string | null;
  readonly checkedAt: string;
  readonly isDemo: boolean;
  readonly sources: readonly {
    readonly nameKey: MessageKey;
    readonly url: string | null;
  }[];
}

const MAX_DESCRIPTOR_LENGTH = 60;

/** Short claim descriptors are truncated and stripped of any long digit run. */
function safeDescriptor(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  const masked = maskLongDigitRuns(trimmed);
  return masked.length > MAX_DESCRIPTOR_LENGTH
    ? `${masked.slice(0, MAX_DESCRIPTOR_LENGTH)}…`
    : masked;
}

export function buildShareSummary(
  claim: Readonly<OfferClaim>,
  result: VerificationResult,
): RedactedShareSummary {
  const sourceIds = new Set(
    result.items
      .map((item) => item.sourceUrl)
      .filter((url): url is string => url !== null)
      .map((url) => url),
  );

  const sources = Array.from(sourceIds)
    .map((url) => {
      const entry = [
        'siskop2mi-p3mi',
        'siskop2mi-vacancies',
        'permen-17-2025',
        'jdih-kp2mi',
      ]
        .map((id) => getSource(id))
        .find((candidate) => candidate?.canonicalUrl === url);
      return entry ? { nameKey: entry.nameKey, url: entry.canonicalUrl } : null;
    })
    .filter(
      (entry): entry is { nameKey: MessageKey; url: string | null } => entry !== null,
    );

  return {
    recommendation: result.recommendation,
    position: safeDescriptor(claim.position),
    destinationCountry: safeDescriptor(claim.destinationCountry),
    indicatorCount: result.triggeredIndicators.length,
    categories: result.evidenceMap.map((entry) => ({
      category: entry.category,
      status: entry.status,
    })),
    maskedContact:
      claim.contactHandle.trim().length > 0
        ? maskContactHandle(claim.contactHandle)
        : null,
    checkedAt: result.checkedAt,
    isDemo: result.dataMode.kind === 'demo',
    sources,
  };
}
