import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ONBOARDING_COMPLETED_VALUE,
  ONBOARDING_STORAGE_KEY,
  isCompletedValue,
  statusFromStoredValue,
} from '@/domain/onboarding/onboarding-state';
import {
  completeOnboarding,
  getOnboardingServerSnapshot,
  getOnboardingSnapshot,
  resetOnboardingCache,
  subscribeToOnboarding,
} from '@/domain/onboarding/onboarding-store';
import { LOCALE_STORAGE_KEY, writeStoredLocale } from '@/domain/privacy/locale-storage';
import { PROGRESS_STORAGE_KEY } from '@/domain/progress/progress-storage';
import { idMessages } from '@/content/locales/id';
import { enMessages } from '@/content/locales/en';

beforeEach(() => {
  window.localStorage.clear();
  resetOnboardingCache();
});

describe('storage key and value contract (LANDING_PAGE.md 7.1)', () => {
  it('uses the specified key and the single allowed value', () => {
    expect(ONBOARDING_STORAGE_KEY).toBe('miglens.onboarding.v1.completed');
    expect(ONBOARDING_COMPLETED_VALUE).toBe('true');
  });

  it.each([
    ['the exact completed value', 'true', true],
    ['a capitalised variant', 'True', false],
    ['a boolean-looking number', '1', false],
    ['an empty string', '', false],
    ['unrelated text', 'yes', false],
    ['a JSON object', '{"completed":true}', false],
  ])('treats %s correctly', (_label, value, expected) => {
    expect(isCompletedValue(value)).toBe(expected);
  });

  it('treats a missing or malformed value as not completed', () => {
    expect(statusFromStoredValue(null)).toBe('onboarding');
    expect(statusFromStoredValue('nonsense')).toBe('onboarding');
    expect(statusFromStoredValue('true')).toBe('application');
  });
});

describe('first-run resolution (LANDING_PAGE.md 7.2 and 16)', () => {
  it('reports `checking` as the server snapshot so nothing can flash', () => {
    expect(getOnboardingServerSnapshot()).toBe('checking');
  });

  it('shows onboarding when the flag is missing', () => {
    expect(getOnboardingSnapshot()).toBe('onboarding');
  });

  it('opens the application when a valid flag exists', () => {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    resetOnboardingCache();
    expect(getOnboardingSnapshot()).toBe('application');
  });

  it('treats an invalid flag as incomplete instead of crashing', () => {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, '{"completed":true}');
    resetOnboardingCache();
    expect(() => getOnboardingSnapshot()).not.toThrow();
    expect(getOnboardingSnapshot()).toBe('onboarding');
  });

  it('shows onboarding when reading storage fails', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    resetOnboardingCache();
    expect(getOnboardingSnapshot()).toBe('onboarding');
    vi.restoreAllMocks();
  });
});

describe('completion (LANDING_PAGE.md 7.3)', () => {
  it('writes the flag and advances the state', () => {
    completeOnboarding();
    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('true');
    expect(getOnboardingSnapshot()).toBe('application');
  });

  it('notifies subscribers once', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToOnboarding(listener);
    completeOnboarding();
    expect(listener).toHaveBeenCalledTimes(1);
    // Already complete: no second write, no second notification.
    completeOnboarding();
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('does not block entry when writing fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => completeOnboarding()).not.toThrow();
    // The session continues even though nothing could be persisted.
    expect(getOnboardingSnapshot()).toBe('application');
    vi.restoreAllMocks();
  });

  it('stores nothing besides the single value', () => {
    completeOnboarding();
    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('true');
    expect(Object.keys({ ...window.localStorage })).toEqual([ONBOARDING_STORAGE_KEY]);
  });

  it('never merges the flag with the locale or progress keys', () => {
    writeStoredLocale('en');
    completeOnboarding();
    const keys = Object.keys({ ...window.localStorage }).sort();
    expect(keys).toEqual([LOCALE_STORAGE_KEY, ONBOARDING_STORAGE_KEY].sort());
    expect(keys).not.toContain(PROGRESS_STORAGE_KEY);
  });

  it('stores no timestamp, identifier, or route with the flag', () => {
    completeOnboarding();
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY) ?? '';
    expect(raw).toBe('true');
    expect(raw).not.toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(raw).not.toContain('/');
  });
});

describe('onboarding copy (LANDING_PAGE.md 9)', () => {
  it('uses the specified Indonesian strings verbatim', () => {
    expect(idMessages['onboarding.intro.eyebrow']).toBe(
      'Pemeriksaan tawaran kerja berbasis bukti',
    );
    expect(idMessages['onboarding.intro.heading']).toBe(
      'Lihat bukti di balik setiap tawaran.',
    );
    expect(idMessages['onboarding.intro.primary']).toBe('Mulai Periksa');
    expect(idMessages['onboarding.intro.secondary']).toBe('Pelajari Cara Kerjanya');
    expect(idMessages['onboarding.privacy.heading']).toBe('Privasi sejak awal.');
    expect(idMessages['onboarding.final.heading']).toBe(
      'Punya tawaran kerja? Periksa buktinya terlebih dahulu.',
    );
    expect(idMessages['onboarding.final.note']).toBe(
      'Jangan unggah KTP, paspor, nomor identitas, atau dokumen yang memuat data pribadi sensitif.',
    );
  });

  it('uses the specified English strings verbatim', () => {
    expect(enMessages['onboarding.intro.eyebrow']).toBe(
      'Evidence-based job offer checking',
    );
    expect(enMessages['onboarding.intro.heading']).toBe(
      'See the evidence behind every offer.',
    );
    expect(enMessages['onboarding.intro.primary']).toBe('Start Checking');
    expect(enMessages['onboarding.intro.secondary']).toBe('Learn How It Works');
    expect(enMessages['onboarding.privacy.heading']).toBe('Private by design.');
    expect(enMessages['onboarding.final.heading']).toBe(
      'Received a job offer? Check the evidence first.',
    );
  });

  it('makes no absolute safety or fraud claim', () => {
    for (const catalog of [idMessages, enMessages]) {
      for (const [key, value] of Object.entries(catalog)) {
        if (!key.startsWith('onboarding.')) continue;
        expect(/\btawaran ini aman\b/i.test(value), key).toBe(false);
        expect(/\bthis offer is safe\b/i.test(value), key).toBe(false);
        expect(/\bAI\b.*\b(detect|deteksi)/i.test(value), key).toBe(false);
      }
    }
  });

  it('states the evidence-map framing rather than a verdict', () => {
    expect(idMessages['onboarding.how.note']).toContain('Peta Bukti');
    expect(enMessages['onboarding.how.note']).toContain('Evidence Map');
  });
});
