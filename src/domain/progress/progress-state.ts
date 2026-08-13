import { z } from 'zod';
import type { EvidenceStatus } from '@/domain/evidence/evidence-item';
import type { VerificationResult } from '@/domain/verification/run-verification';

/**
 * Local progress and check history (owner decision, see docs/decisions/0003).
 *
 * PRIVACY CONTRACT — this is the only user data MigranShield persists besides `uiLocale`.
 * The schema below is an allowlist, and it deliberately cannot express offer content:
 * there is no field for an image, OCR text, company or recruiter name, phone, account,
 * email, identifier, amount, contract, or visa. A history entry holds counts, versions,
 * and timestamps only. Adding a field here is a privacy decision, not a refactor.
 */

export const MAX_HISTORY_ENTRIES = 20;
export const PROGRESS_SCHEMA_VERSION = 1;

export const evidenceStatusCountsSchema = z.object({
  source_match: z.number().int().nonnegative(),
  unverified: z.number().int().nonnegative(),
  mismatch: z.number().int().nonnegative(),
  risk_indicator: z.number().int().nonnegative(),
});

export type EvidenceStatusCounts = Readonly<z.infer<typeof evidenceStatusCountsSchema>>;

export const historyEntrySchema = z.object({
  /** Opaque local identifier. Never derived from offer content. */
  localId: z.string().min(1).max(64),
  /** UTC ISO 8601 timestamp of the check. Also the deduplication key. */
  checkedAt: z.string().datetime(),
  indicatorCount: z.number().int().nonnegative(),
  evidenceCounts: evidenceStatusCountsSchema,
  /** Locale-neutral rule identifiers that produced the triggered indicators. */
  ruleIds: z.array(z.string().max(80)).max(20),
  ruleVersions: z.array(z.string().max(20)).max(20),
  /** Reference data version used, or null when no approved dataset was available. */
  sourceDataVersion: z.string().max(80).nullable(),
});

export type HistoryEntry = Readonly<z.infer<typeof historyEntrySchema>>;

export const progressStateSchema = z.object({
  schemaVersion: z.literal(PROGRESS_SCHEMA_VERSION),
  /** Scenario ids the user has answered safely. A set, so a repeat cannot count twice. */
  completedScenarioIds: z.array(z.string().max(80)).max(200),
  history: z.array(historyEntrySchema).max(MAX_HISTORY_ENTRIES),
});

export type ProgressState = Readonly<z.infer<typeof progressStateSchema>>;

export const emptyProgressState: ProgressState = {
  schemaVersion: PROGRESS_SCHEMA_VERSION,
  completedScenarioIds: [],
  history: [],
};

/** Parses untrusted stored data. Anything malformed falls back to an empty state. */
export function parseProgressState(input: unknown): ProgressState {
  const result = progressStateSchema.safeParse(input);
  return result.success ? result.data : emptyProgressState;
}

/**
 * Records a correctly answered scenario. Repeating the same scenario is a no-op, so
 * progress cannot be inflated by replaying it.
 */
export function completeScenario(
  state: ProgressState,
  scenarioId: string,
): ProgressState {
  if (state.completedScenarioIds.includes(scenarioId)) return state;
  return { ...state, completedScenarioIds: [...state.completedScenarioIds, scenarioId] };
}

function countByStatus(result: VerificationResult): EvidenceStatusCounts {
  const counts: Record<EvidenceStatus, number> = {
    source_match: 0,
    unverified: 0,
    mismatch: 0,
    risk_indicator: 0,
  };
  for (const item of result.items) counts[item.status] += 1;
  return counts;
}

/**
 * Builds the minimised history entry for a completed check.
 *
 * Only counts, locale-neutral rule identifiers, the reference-data version, and the
 * timestamp are taken from the result. The confirmed claim is never read here.
 */
export function buildHistoryEntry(
  result: VerificationResult,
  localId: string,
): HistoryEntry {
  const triggered = result.triggeredIndicators;
  return {
    localId,
    checkedAt: result.checkedAt,
    indicatorCount: triggered.length,
    evidenceCounts: countByStatus(result),
    ruleIds: [...new Set(triggered.map((item) => item.ruleId ?? '').filter(Boolean))],
    ruleVersions: [
      ...new Set(triggered.map((item) => item.ruleVersion ?? '').filter(Boolean)),
    ],
    sourceDataVersion:
      result.items.find((item) => item.snapshotId !== null)?.snapshotId ?? null,
  };
}

/**
 * Appends a history entry, newest first, capped at `MAX_HISTORY_ENTRIES`.
 * An entry whose `checkedAt` is already present is ignored, so re-rendering or
 * re-opening the result screen cannot duplicate a check.
 */
export function addHistoryEntry(
  state: ProgressState,
  entry: HistoryEntry,
): ProgressState {
  if (state.history.some((existing) => existing.checkedAt === entry.checkedAt)) {
    return state;
  }
  return { ...state, history: [entry, ...state.history].slice(0, MAX_HISTORY_ENTRIES) };
}

/** Distinct exercises the user has practised, used for the readiness count. */
export function completedExerciseCount(
  state: ProgressState,
  exerciseIdOfScenario: (scenarioId: string) => string | undefined,
): number {
  const exercises = new Set<string>();
  for (const scenarioId of state.completedScenarioIds) {
    const exerciseId = exerciseIdOfScenario(scenarioId);
    if (exerciseId) exercises.add(exerciseId);
  }
  return exercises.size;
}
