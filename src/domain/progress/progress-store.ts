import {
  addHistoryEntry,
  buildHistoryEntry,
  completeScenario,
  emptyProgressState,
  type HistoryEntry,
  type ProgressState,
} from '@/domain/progress/progress-state';
import {
  clearProgress,
  readProgress,
  writeProgress,
} from '@/domain/progress/progress-storage';
import type { VerificationResult } from '@/domain/verification/run-verification';

/**
 * External store for progress, exposed through the `useSyncExternalStore` contract.
 *
 * The server snapshot is always the empty state, so the prerendered HTML matches what a
 * first-time visitor sees and hydration can never mismatch. The stored value is read on
 * the client only, after hydration, exactly like the locale store.
 *
 * If writing fails, the in-memory value still updates: the session keeps working and only
 * persistence is lost.
 */

const listeners = new Set<() => void>();
let cached: ProgressState | null = null;

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeToProgress(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getProgressSnapshot(): ProgressState {
  if (cached === null) cached = readProgress();
  return cached;
}

export function getProgressServerSnapshot(): ProgressState {
  return emptyProgressState;
}

function update(next: ProgressState): void {
  // Reference equality keeps `useSyncExternalStore` from re-rendering on a no-op.
  if (next === getProgressSnapshot()) return;
  cached = next;
  writeProgress(next);
  emit();
}

/** Credits a safely answered scenario. Repeating the same scenario changes nothing. */
export function recordScenarioCompleted(scenarioId: string): void {
  update(completeScenario(getProgressSnapshot(), scenarioId));
}

/**
 * Records one history entry for a completed check. Demo results are never recorded, and a
 * check already present (same `checkedAt`) is ignored, so a refresh or a language switch
 * cannot duplicate it.
 */
export function recordCheckCompleted(result: VerificationResult): void {
  if (result.dataMode.kind === 'demo') return;
  const entry = buildHistoryEntry(result, createLocalId());
  update(addHistoryEntry(getProgressSnapshot(), entry));
}

export function resetProgress(): void {
  clearProgress();
  cached = emptyProgressState;
  emit();
}

/** Opaque identifier; never derived from offer content. */
function createLocalId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/** Test helper: drops the in-memory cache so the next read hits storage again. */
export function resetProgressCache(): void {
  cached = null;
}

export type { HistoryEntry, ProgressState };
