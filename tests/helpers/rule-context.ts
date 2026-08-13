import { emptyOfferClaim, type OfferClaim } from '@/domain/claims/offer-claim';
import type { RuleContext } from '@/domain/rules/rule-types';
import type { SourceSnapshot } from '@/domain/sources/snapshot';

/** Fixed clock keeps every rule and evidence assertion deterministic (TESTING.md 1). */
export const FIXED_NOW = new Date('2026-08-11T03:00:00.000Z');
export const FIXED_ISO = FIXED_NOW.toISOString();

export function makeContext(overrides: Partial<RuleContext> = {}): RuleContext {
  return {
    checkedAt: FIXED_ISO,
    dataMode: { kind: 'source_unavailable', sourceId: 'siskop2mi-p3mi' },
    snapshot: null,
    snapshotFreshness: 'unknown',
    isContactVerified: false,
    ...overrides,
  };
}

export function makeClaim(overrides: Partial<OfferClaim> = {}): OfferClaim {
  return { ...emptyOfferClaim, ...overrides };
}

/** Minimal synthetic snapshot for source-check tests. */
export function makeSnapshot(overrides: Partial<SourceSnapshot> = {}): SourceSnapshot {
  return {
    snapshotId: 'test-snapshot-1',
    sourceId: 'siskop2mi-p3mi',
    canonicalUrl: 'https://siskop2mi.bp2mi.go.id/profil/lembaga/list_lembaga/p3mi',
    retrievedAt: '2026-08-10T00:00:00.000Z',
    effectiveDate: '2026-08-10',
    retrievalMethod: 'synthetic',
    parserVersion: 'test-1',
    contentHash: 'test-hash',
    recordCount: 1,
    importStatus: 'validated',
    reviewStatus: 'reviewed',
    supersedesSnapshotId: null,
    isDemo: true,
    p3miRecords: [
      {
        recordId: 'test-1',
        officialName: 'PT Karya Contoh Nusantara',
        licenceNumber: 'CONTOH-000/UJI/2026',
        address: 'Jalan Contoh No. 1',
        officialContacts: [
          { kind: 'phone', value: '+62 21 0000 0000' },
          { kind: 'email', value: 'kantor@example.com' },
        ],
        isContactListComplete: false,
        sanctionNote: null,
      },
    ],
    vacancyRecords: [],
    ...overrides,
  };
}
