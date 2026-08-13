import { describe, expect, it } from 'vitest';
import {
  MAX_HISTORY_ENTRIES,
  addHistoryEntry,
  buildHistoryEntry,
  completeScenario,
  completedExerciseCount,
  emptyProgressState,
  historyEntrySchema,
  parseProgressState,
  progressStateSchema,
  type ProgressState,
} from '@/domain/progress/progress-state';
import { runVerification } from '@/domain/verification/run-verification';
import { demoOfferClaim, DEMO_FIXTURE_ID } from '@data/fixtures/demo-offer';
import { demoP3miSnapshot } from '@data/fixtures/demo-p3mi-snapshot';
import { FIXED_NOW } from '../helpers/rule-context';

const sensitiveClaim = {
  ...demoOfferClaim,
  companyName: 'PT Karya Contoh Nusantara',
  recruiterName: 'Andi Wijaya Contoh',
  contactHandle: '+886900111222',
  paymentAmount: 'Rp7.500.000',
  paymentRecipient: 'Andi Wijaya Contoh',
  paymentPurpose: 'Transfer ke rekening 1234567890',
};

const result = runVerification({
  claim: sensitiveClaim,
  dataMode: { kind: 'demo', fixtureId: DEMO_FIXTURE_ID },
  snapshot: demoP3miSnapshot,
  now: FIXED_NOW,
});

describe('empty first visit', () => {
  it('starts with no completed scenario and no history', () => {
    expect(emptyProgressState.completedScenarioIds).toEqual([]);
    expect(emptyProgressState.history).toEqual([]);
  });

  it('reports zero practised exercises', () => {
    expect(completedExerciseCount(emptyProgressState, () => 'urgency')).toBe(0);
  });
});

describe('scenario completion', () => {
  it('records a completed scenario', () => {
    const next = completeScenario(emptyProgressState, 'caregiver-taiwan-urgency');
    expect(next.completedScenarioIds).toEqual(['caregiver-taiwan-urgency']);
  });

  it('does not count the same scenario twice when repeated', () => {
    let state = completeScenario(emptyProgressState, 'caregiver-taiwan-urgency');
    state = completeScenario(state, 'caregiver-taiwan-urgency');
    state = completeScenario(state, 'caregiver-taiwan-urgency');
    expect(state.completedScenarioIds).toHaveLength(1);
  });

  it('returns the identical object for a repeat, so no needless re-render happens', () => {
    const first = completeScenario(emptyProgressState, 'a');
    expect(completeScenario(first, 'a')).toBe(first);
  });

  it('counts distinct exercises, not distinct scenarios', () => {
    let state = completeScenario(emptyProgressState, 's1');
    state = completeScenario(state, 's2');
    const sameExercise = () => 'urgency';
    expect(completedExerciseCount(state, sameExercise)).toBe(1);
    expect(completedExerciseCount(state, (id) => `exercise-${id}`)).toBe(2);
  });
});

describe('history entries', () => {
  const entry = buildHistoryEntry(result, 'local-1');

  it('records one entry per check', () => {
    const state = addHistoryEntry(emptyProgressState, entry);
    expect(state.history).toHaveLength(1);
  });

  it('ignores a check whose timestamp is already recorded', () => {
    const once = addHistoryEntry(emptyProgressState, entry);
    const twice = addHistoryEntry(once, buildHistoryEntry(result, 'local-2'));
    expect(twice.history).toHaveLength(1);
    expect(twice).toBe(once);
  });

  it('keeps the newest first', () => {
    const older = { ...entry, checkedAt: '2026-08-01T00:00:00.000Z', localId: 'old' };
    const state = addHistoryEntry(addHistoryEntry(emptyProgressState, older), entry);
    expect(state.history[0]?.localId).toBe('local-1');
  });

  it(`caps the history at ${MAX_HISTORY_ENTRIES} entries`, () => {
    let state: ProgressState = emptyProgressState;
    for (let index = 0; index < MAX_HISTORY_ENTRIES + 8; index += 1) {
      state = addHistoryEntry(state, {
        ...entry,
        localId: `local-${index}`,
        checkedAt: new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString(),
      });
    }
    expect(state.history).toHaveLength(MAX_HISTORY_ENTRIES);
    // The most recent write survives, the oldest is dropped.
    expect(state.history[0]?.localId).toBe(`local-${MAX_HISTORY_ENTRIES + 7}`);
  });

  it('carries the minimised metadata the design allows', () => {
    expect(entry.indicatorCount).toBe(result.triggeredIndicators.length);
    expect(entry.evidenceCounts.risk_indicator).toBe(entry.indicatorCount);
    expect(entry.ruleIds).toContain('TIME_PRESSURE_IMMEDIATE_TRANSFER');
    expect(entry.ruleVersions).toContain('1.0.0');
    expect(entry.sourceDataVersion).toBe(demoP3miSnapshot.snapshotId);
  });

  it('sums the evidence counts to the number of evidence items', () => {
    const total = Object.values(entry.evidenceCounts).reduce((sum, n) => sum + n, 0);
    expect(total).toBe(result.items.length);
  });
});

describe('persisted data carries no sensitive value', () => {
  const state = addHistoryEntry(
    completeScenario(emptyProgressState, 'caregiver-taiwan-urgency'),
    buildHistoryEntry(result, 'local-1'),
  );
  const serialized = JSON.stringify(state);

  it.each([
    ['company name', 'Karya Contoh Nusantara'],
    ['recruiter name', 'Andi Wijaya'],
    ['contact handle', '886900111222'],
    ['account number', '1234567890'],
    ['payment amount', '7.500.000'],
    ['payment purpose', 'Transfer ke rekening'],
    ['position', 'Caregiver'],
    ['destination country', 'Taiwan'],
  ])('never stores the %s', (_label, value) => {
    expect(serialized).not.toContain(value);
  });

  it('exposes only the allowlisted top-level keys', () => {
    expect(Object.keys(state).sort()).toEqual([
      'completedScenarioIds',
      'history',
      'schemaVersion',
    ]);
  });

  it('exposes only the allowlisted history fields', () => {
    expect(Object.keys(state.history[0] ?? {}).sort()).toEqual([
      'checkedAt',
      'evidenceCounts',
      'indicatorCount',
      'localId',
      'ruleIds',
      'ruleVersions',
      'sourceDataVersion',
    ]);
  });

  it('rejects an unknown field at the schema boundary', () => {
    const parsed = historyEntrySchema.safeParse({
      ...state.history[0],
      companyName: 'PT Karya Contoh Nusantara',
    });
    // Zod strips unknown keys, so the value can never survive a round trip.
    expect(parsed.success).toBe(true);
    expect(parsed.success && 'companyName' in parsed.data).toBe(false);
  });
});

describe('corrupt or hostile stored data', () => {
  it.each([
    ['null', null],
    ['a string', 'not-an-object'],
    ['an array', []],
    [
      'a wrong schema version',
      { schemaVersion: 99, completedScenarioIds: [], history: [] },
    ],
    [
      'a malformed history entry',
      {
        schemaVersion: 1,
        completedScenarioIds: [],
        history: [{ localId: '', checkedAt: 'yesterday' }],
      },
    ],
    [
      'a negative count',
      {
        schemaVersion: 1,
        completedScenarioIds: [],
        history: [
          {
            localId: 'x',
            checkedAt: '2026-08-11T03:00:00.000Z',
            indicatorCount: -3,
            evidenceCounts: {
              source_match: 0,
              unverified: 0,
              mismatch: 0,
              risk_indicator: 0,
            },
            ruleIds: [],
            ruleVersions: [],
            sourceDataVersion: null,
          },
        ],
      },
    ],
  ])('falls back to the empty state for %s', (_label, input) => {
    expect(parseProgressState(input)).toEqual(emptyProgressState);
  });

  it('accepts a valid state unchanged', () => {
    const valid = addHistoryEntry(
      emptyProgressState,
      buildHistoryEntry(result, 'local-1'),
    );
    expect(parseProgressState(valid)).toEqual(valid);
  });

  it('bounds the stored history so a tampered file cannot grow without limit', () => {
    const oversized = {
      schemaVersion: 1,
      completedScenarioIds: [],
      history: Array.from({ length: MAX_HISTORY_ENTRIES + 1 }, (_, index) => ({
        ...buildHistoryEntry(result, `local-${index}`),
        checkedAt: new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString(),
      })),
    };
    expect(progressStateSchema.safeParse(oversized).success).toBe(false);
    expect(parseProgressState(oversized)).toEqual(emptyProgressState);
  });
});
