import { z } from 'zod';

/**
 * Snapshot contract (DATA_SOURCES.md 6). Approved production snapshots live under
 * `data/sources/`. Synthetic demo datasets live under `data/fixtures/` and are typed with
 * the same shape plus `isDemo: true`, so a fixture can never be read as an approved
 * snapshot by accident.
 */

export const officialContactSchema = z.object({
  kind: z.enum(['phone', 'email', 'website', 'address']),
  value: z.string().min(1),
});

export const p3miRecordSchema = z.object({
  recordId: z.string().min(1),
  officialName: z.string().min(1),
  licenceNumber: z.string().nullable(),
  address: z.string().nullable(),
  officialContacts: z.array(officialContactSchema),
  /**
   * Whether the source guarantees the contact list is complete. Real directories do not,
   * so a handle missing from the list stays `unverified` instead of becoming `mismatch`.
   */
  isContactListComplete: z.boolean(),
  sanctionNote: z.string().nullable(),
});

export type P3miRecord = Readonly<z.infer<typeof p3miRecordSchema>>;

export const vacancyRecordSchema = z.object({
  recordId: z.string().min(1),
  companyName: z.string().min(1),
  position: z.string().min(1),
  destinationCountry: z.string().min(1),
});

export type VacancyRecord = Readonly<z.infer<typeof vacancyRecordSchema>>;

export const snapshotSchema = z.object({
  snapshotId: z.string().min(1),
  sourceId: z.string().min(1),
  canonicalUrl: z.string().url().nullable(),
  /** UTC ISO 8601. Formatted for Asia/Jakarta only at the presentation boundary. */
  retrievedAt: z.string().datetime(),
  effectiveDate: z.string().nullable(),
  retrievalMethod: z.enum(['manual_review', 'authorized_api', 'synthetic']),
  parserVersion: z.string().min(1),
  contentHash: z.string().min(1),
  recordCount: z.number().int().nonnegative(),
  importStatus: z.enum(['validated', 'failed', 'pending']),
  reviewStatus: z.enum(['reviewed', 'unreviewed']),
  supersedesSnapshotId: z.string().nullable(),
  /** Synthetic datasets MUST set this to true (DATA_SOURCES.md 7). */
  isDemo: z.boolean(),
  p3miRecords: z.array(p3miRecordSchema),
  vacancyRecords: z.array(vacancyRecordSchema),
});

export type SourceSnapshot = Readonly<z.infer<typeof snapshotSchema>>;

export function parseSnapshot(input: unknown): SourceSnapshot {
  return snapshotSchema.parse(input);
}

export type FreshnessState = 'fresh' | 'stale' | 'unknown';

export function getFreshness(
  snapshot: Pick<SourceSnapshot, 'retrievedAt'>,
  thresholdDays: number,
  now: Date,
): FreshnessState {
  const retrieved = Date.parse(snapshot.retrievedAt);
  if (Number.isNaN(retrieved)) return 'unknown';
  const ageDays = (now.getTime() - retrieved) / (24 * 60 * 60 * 1000);
  if (ageDays < 0) return 'unknown';
  return ageDays <= thresholdDays ? 'fresh' : 'stale';
}
