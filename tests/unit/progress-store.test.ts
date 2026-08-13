import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PROGRESS_STORAGE_KEY,
  clearProgress,
  readProgress,
  writeProgress,
} from '@/domain/progress/progress-storage';
import {
  getProgressServerSnapshot,
  getProgressSnapshot,
  recordCheckCompleted,
  recordScenarioCompleted,
  resetProgress,
  resetProgressCache,
  subscribeToProgress,
} from '@/domain/progress/progress-store';
import { emptyProgressState } from '@/domain/progress/progress-state';
import { LOCALE_STORAGE_KEY, writeStoredLocale } from '@/domain/privacy/locale-storage';
import { runVerification } from '@/domain/verification/run-verification';
import { demoOfferClaim, DEMO_FIXTURE_ID } from '@data/fixtures/demo-offer';
import { demoP3miSnapshot } from '@data/fixtures/demo-p3mi-snapshot';
import { FIXED_NOW, makeClaim } from '../helpers/rule-context';

const realCheck = runVerification({
  claim: makeClaim({ companyName: 'PT Contoh Manual', accountType: 'personal' }),
  dataMode: { kind: 'source_unavailable', sourceId: 'siskop2mi-p3mi' },
  snapshot: null,
  now: FIXED_NOW,
});

const demoCheck = runVerification({
  claim: demoOfferClaim,
  dataMode: { kind: 'demo', fixtureId: DEMO_FIXTURE_ID },
  snapshot: demoP3miSnapshot,
  now: FIXED_NOW,
});

beforeEach(() => {
  window.localStorage.clear();
  resetProgressCache();
});

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
  resetProgressCache();
});

describe('storage adapter', () => {
  it('returns the empty state when nothing is stored', () => {
    expect(readProgress()).toEqual(emptyProgressState);
  });

  it('round-trips a valid state', () => {
    const state = { ...emptyProgressState, completedScenarioIds: ['s1'] };
    expect(writeProgress(state)).toBe(true);
    expect(readProgress()).toEqual(state);
  });

  it('falls back to the empty state on corrupt JSON instead of throwing', () => {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, '{not json');
    expect(() => readProgress()).not.toThrow();
    expect(readProgress()).toEqual(emptyProgressState);
  });

  it('falls back to the empty state when the schema does not match', () => {
    window.localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 99, junk: true }),
    );
    expect(readProgress()).toEqual(emptyProgressState);
  });

  it('does not throw when reading is blocked by the browser', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(() => readProgress()).not.toThrow();
    expect(readProgress()).toEqual(emptyProgressState);
  });

  it('reports a failed write rather than throwing when the quota is exceeded', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => writeProgress(emptyProgressState)).not.toThrow();
    expect(writeProgress(emptyProgressState)).toBe(false);
  });

  it('does not throw when clearing is blocked', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(() => clearProgress()).not.toThrow();
  });
});

describe('store behaviour', () => {
  it('serves the empty state as the server snapshot, so hydration cannot mismatch', () => {
    window.localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({ ...emptyProgressState, completedScenarioIds: ['s1'] }),
    );
    resetProgressCache();
    expect(getProgressServerSnapshot()).toEqual(emptyProgressState);
    expect(getProgressSnapshot().completedScenarioIds).toEqual(['s1']);
  });

  it('keeps progress after a reload', () => {
    recordScenarioCompleted('caregiver-taiwan-urgency');
    // Simulate a fresh page load: drop the in-memory cache and read storage again.
    resetProgressCache();
    expect(getProgressSnapshot().completedScenarioIds).toEqual([
      'caregiver-taiwan-urgency',
    ]);
  });

  it('does not grow when the same scenario is repeated', () => {
    recordScenarioCompleted('caregiver-taiwan-urgency');
    const afterFirst = getProgressSnapshot();
    recordScenarioCompleted('caregiver-taiwan-urgency');
    expect(getProgressSnapshot()).toBe(afterFirst);
    expect(getProgressSnapshot().completedScenarioIds).toHaveLength(1);
  });

  it('notifies subscribers when progress changes', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToProgress(listener);
    recordScenarioCompleted('caregiver-taiwan-urgency');
    expect(listener).toHaveBeenCalledTimes(1);
    // A repeat is a no-op and must not notify again.
    recordScenarioCompleted('caregiver-taiwan-urgency');
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('records one history entry for a completed real check', () => {
    recordCheckCompleted(realCheck);
    expect(getProgressSnapshot().history).toHaveLength(1);
  });

  it('does not duplicate the entry when the result screen re-renders', () => {
    recordCheckCompleted(realCheck);
    recordCheckCompleted(realCheck);
    recordCheckCompleted(realCheck);
    expect(getProgressSnapshot().history).toHaveLength(1);
  });

  it('keeps the history after a reload', () => {
    recordCheckCompleted(realCheck);
    resetProgressCache();
    expect(getProgressSnapshot().history).toHaveLength(1);
  });

  it('never records a demo check', () => {
    recordCheckCompleted(demoCheck);
    expect(getProgressSnapshot().history).toEqual([]);
  });

  it('gives each entry an opaque id that is not derived from offer content', () => {
    recordCheckCompleted(realCheck);
    const localId = getProgressSnapshot().history[0]?.localId ?? '';
    expect(localId.length).toBeGreaterThan(0);
    expect(localId).not.toContain('Contoh');
    expect(localId).not.toContain('PT');
  });

  it('keeps working in memory when persistence fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => recordScenarioCompleted('caregiver-taiwan-urgency')).not.toThrow();
    expect(getProgressSnapshot().completedScenarioIds).toEqual([
      'caregiver-taiwan-urgency',
    ]);
  });
});

describe('reset', () => {
  it('clears progress and history', () => {
    recordScenarioCompleted('caregiver-taiwan-urgency');
    recordCheckCompleted(realCheck);
    resetProgress();
    expect(getProgressSnapshot()).toEqual(emptyProgressState);
    expect(window.localStorage.getItem(PROGRESS_STORAGE_KEY)).toBeNull();
  });

  it('keeps the language preference', () => {
    writeStoredLocale('en');
    recordScenarioCompleted('caregiver-taiwan-urgency');
    resetProgress();
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en');
  });

  it('survives a reload after reset', () => {
    recordScenarioCompleted('caregiver-taiwan-urgency');
    resetProgress();
    resetProgressCache();
    expect(getProgressSnapshot()).toEqual(emptyProgressState);
  });
});

describe('what is written to disk', () => {
  it('stores no offer content', () => {
    recordScenarioCompleted('caregiver-taiwan-urgency');
    recordCheckCompleted(realCheck);
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY) ?? '';
    expect(raw.length).toBeGreaterThan(0);
    for (const forbidden of ['PT Contoh Manual', 'Caregiver', 'Taiwan', '886', 'Rp']) {
      expect(raw).not.toContain(forbidden);
    }
  });

  it('uses exactly two storage keys: locale and progress', () => {
    writeStoredLocale('id');
    recordScenarioCompleted('caregiver-taiwan-urgency');
    expect(Object.keys({ ...window.localStorage }).sort()).toEqual(
      [LOCALE_STORAGE_KEY, PROGRESS_STORAGE_KEY].sort(),
    );
  });
});
